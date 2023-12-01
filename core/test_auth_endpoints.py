# core/test_auth_endpoints.py

import pytest
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import RefreshToken, AccessToken
from datetime import timedelta
import jwt
from django.conf import settings
import datetime
from rest_framework.test import APIClient
from django.urls import reverse
import logging
from rest_framework_simplejwt.token_blacklist.models import (
    OutstandingToken,
    BlacklistedToken,
)
from django.test import Client

logger = logging.getLogger(__name__)


@pytest.fixture
def create_test_user(db):
    User = get_user_model()
    user = User.objects.create_user(username="testuser", password="12345")
    return user


@pytest.fixture
def csrf_client():
    return Client(enforce_csrf_checks=True)


@pytest.mark.django_db
def test_token_obtain_pair(client, create_test_user):
    url = "/api/token/"
    data = {
        "username": "testuser",
        "password": "12345",
    }
    response = client.post(url, data)

    assert response.status_code == 200
    assert "access" in response.json()
    assert "refresh" in response.json()


@pytest.mark.django_db
def test_token_refresh(client, create_test_user):
    # create_test_user is a fixture; it returns a user object
    user = create_test_user

    # Obtain a refresh token
    refresh = RefreshToken.for_user(user)

    # Test the token refresh endpoint
    url = "/api/token/refresh/"
    data = {
        "refresh": str(refresh),
    }
    response = client.post(url, data)

    assert response.status_code == 200
    assert "access" in response.json()


@pytest.mark.django_db
def test_invalid_token_refresh(client, create_test_user):
    url = "/api/token/refresh/"
    data = {
        "refresh": "invalid_token",
    }
    response = client.post(url, data)

    assert response.status_code == 401


@pytest.mark.django_db
def test_token_obtain_invalid_credentials(client, create_test_user):
    url = "/api/token/"
    invalid_data = {
        "username": "testuser",
        "password": "wrongpassword",
    }
    response = client.post(url, invalid_data)

    assert response.status_code == 401
    assert "access" not in response.json()
    assert "refresh" not in response.json()


@pytest.mark.django_db
def test_expired_token_refresh(client, create_test_user):
    user = create_test_user

    # Obtain a refresh token
    refresh = RefreshToken.for_user(user)

    # Set the expiration to the past
    refresh.set_exp(lifetime=timedelta(days=-1))  # Negative timedelta

    # Test the token refresh endpoint
    url = "/api/token/refresh/"
    data = {"refresh": str(refresh)}
    response = client.post(url, data)

    assert response.status_code == 401
    assert "access" not in response.json()


@pytest.mark.django_db
def test_token_obtain_inactive_user(client, db):
    User = get_user_model()
    inactiave_user = User.objects.create_user(
        username="inactiveuser", password="12345", is_active=False
    )

    url = "/api/token/"
    data = {
        "username": "inactiveuser",
        "password": "12345",
    }
    response = client.post(url, data)

    assert response.status_code == 401
    assert "access" not in response.json()
    assert "refresh" not in response.json()


@pytest.mark.django_db
def test_valid_access_token(client, create_test_user):
    user = create_test_user

    access = AccessToken.for_user(user)

    decoded_payload = jwt.decode(str(access), settings.SECRET_KEY, algorithms=["HS256"])

    assert decoded_payload["user_id"] == user.id
    assert decoded_payload["token_type"] == "access"


@pytest.mark.django_db
def test_token_obtain_pair_cookies_set_correctly(client, create_test_user):
    url = "/api/token/"
    data = {
        "username": "testuser",
        "password": "12345",
    }
    response = client.post(url, data)

    # Check response status
    assert response.status_code == 200

    # Check for the presence of cookies
    assert "access_token" in response.cookies
    assert "refresh_token" in response.cookies

    # Verify properties of cookies
    access_cookie = response.cookies["access_token"]
    refresh_cookie = response.cookies["refresh_token"]

    assert access_cookie["httponly"] is True
    assert refresh_cookie["httponly"] is True

    # Check 'Secure' flag based on DEBUG setting
    assert access_cookie["secure"] is not settings.DEBUG
    assert refresh_cookie["secure"] is not settings.DEBUG

    # Check 'SameSite' attribute
    assert access_cookie["samesite"] == "Lax"
    assert refresh_cookie["samesite"] == "Lax"


@pytest.mark.django_db
def test_token_expiration(client, create_test_user):
    user = create_test_user

    # Obtain token
    response = client.post(
        "/api/token/", {"username": user.username, "password": "12345"}
    )
    access_token = response.data["access"]

    # Decode token
    decoded = jwt.decode(access_token, settings.SECRET_KEY, algorithms=["HS256"])

    # Calculate expected expiration time
    expected_expiration = int(
        (
            datetime.datetime.utcnow() + settings.SIMPLE_JWT["ACCESS_TOKEN_LIFETIME"]
        ).timestamp()
    )

    # Check if the expiration time in the token matches the expected time
    assert (
        abs(decoded["exp"] - expected_expiration) < 5
    )  # Allowing a small leeway for execution time


@pytest.mark.django_db
def test_token_issuer(client, create_test_user):
    logger.debug("Testing token issuer")
    user = create_test_user

    # Obtain token
    response = client.post(
        "/api/token/", {"username": user.username, "password": "12345"}
    )
    access_token = response.data["access"]

    logger.debug("Access token received: %s", access_token)

    # Decode token
    try:
        decoded = jwt.decode(access_token, settings.SECRET_KEY, algorithms=["HS256"])
        logger.debug("Decoded token: %s", decoded)
    except Exception as e:
        logger.error("Error decoding token: %s", e)
        raise

    # Check if the issuer is correctly set
    assert decoded["iss"] == "YourIssuer"


@pytest.mark.django_db
@pytest.mark.django_db
def test_logout(client, create_test_user):
    # First, log in the user to set the cookies
    user = create_test_user
    client.login(username=user.username, password="12345")

    # Make a POST request to the logout endpoint
    response = client.post("/api/logout/", {}, format="json")

    # Verify that the response status code is 200 (OK)
    assert response.status_code == 200

    # Check the response content if necessary
    assert response.json() == {"detail": "Logout successful"}

    # Verify that the cookies are invalidated (set to empty)
    assert response.cookies["access_token"].value == ""
    assert response.cookies["refresh_token"].value == ""


@pytest.mark.django_db
def test_logout_unauthenticated_user(client):
    # Make a POST request to the logout endpoint without logging in first
    response = client.post("/api/logout/", {}, format="json")

    # Verify that the response status code is 200 (OK) even for unauthenticated users
    assert response.status_code == 200

    # Check the response content if necessary
    assert response.json() == {"detail": "Logout successful"}


@pytest.mark.django_db
def test_protected_view_authenticated_access(create_test_user):
    user = create_test_user
    refresh = RefreshToken.for_user(user)
    access_token = str(refresh.access_token)

    client = APIClient()
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {access_token}")

    url = reverse("protected_test")  # Replace with your URL name
    response = client.get(url)

    assert response.status_code == 200
    assert response.data == {"message": "This is a protected endpoint"}


@pytest.mark.django_db
def test_protected_view_unauthenticated_access():
    client = APIClient()

    url = reverse("protected_test")  # Replace with your URL name
    response = client.get(url)

    assert response.status_code == 401  # Unauthorized


@pytest.mark.django_db
def test_logout_with_post_request(client, create_test_user):
    # Log in the user to set the cookies
    user = create_test_user
    client.login(username=user.username, password="12345")

    # Make a POST request to the logout endpoint
    response = client.post("/api/logout/", {}, format="json")

    # Verify that the response status code is 200 (OK)
    assert response.status_code == 200
    assert response.json() == {"detail": "Logout successful"}

    # Verify that the cookies are invalidated (set to empty)
    assert response.cookies["access_token"].value == ""
    assert response.cookies["refresh_token"].value == ""


@pytest.mark.django_db
def test_logout_method_not_allowed(client):
    # Make a GET request to the logout endpoint
    response = client.get("/api/logout/")

    # Verify that the response status code is 405 (Method Not Allowed)
    assert response.status_code == 405


@pytest.mark.django_db
def test_logout_with_csrf_token(client, create_test_user):
    # Log in the user to set the cookies
    user = create_test_user
    client.login(username=user.username, password="12345")

    # Retrieve and set CSRF token
    client.get("/set-csrf/")
    csrf_token = client.cookies["csrftoken"].value

    # Make a POST request to the logout endpoint with CSRF token
    response = client.post(
        "/api/logout/", {}, format="json", HTTP_X_CSRFTOKEN=csrf_token
    )

    # Verify that the response status code is 200 (OK)
    assert response.status_code == 200
    assert response.json() == {"detail": "Logout successful"}


@pytest.mark.django_db
def test_logout_without_csrf_token(csrf_client, create_test_user):
    # Log in the user to set the cookies
    user = create_test_user
    csrf_client.login(username=user.username, password="12345")

    # Retrieve CSRF token but don't use it in the request
    csrf_client.get("/set-csrf/")

    # Make a POST request to the logout endpoint without CSRF token
    response = csrf_client.post("/api/logout/", {}, format="json")

    # Verify that the response status code is 403 (Forbidden)
    assert response.status_code == 403


@pytest.mark.django_db
def test_login_view_csrf(create_test_user, db):
    client = Client(enforce_csrf_checks=True)

    # User created by the fixture
    user = create_test_user

    # Obtain CSRF token
    client.get("/set-csrf/")
    csrf_token = client.cookies["csrftoken"].value

    # Test POST request without CSRF token
    response_without_csrf = client.post(
        "/api/token/", {"username": user.username, "password": "12345"}
    )
    assert response_without_csrf.status_code == 403

    # Test POST request with CSRF token
    response_with_csrf = client.post(
        "/api/token/",
        {
            "username": user.username,
            "password": "12345",
            "csrfmiddlewaretoken": csrf_token,
        },
    )

    print(response_with_csrf.content)  # Add this line to inspect the response content
    assert response_with_csrf.status_code == 200


# Below test is failing


@pytest.mark.django_db
def test_token_invalid_post_logout(client, create_test_user):
    # Step 1: Log in the user and obtain the tokens
    user = create_test_user
    login_response = client.post(
        "/api/token/", {"username": user.username, "password": "12345"}
    )
    access_token = login_response.data["access"]
    refresh_token_jti = jwt.decode(
        login_response.data["refresh"], settings.SECRET_KEY, algorithms=["HS256"]
    )["jti"]

    # Step 2: Make an authenticated request to a protected endpoint
    protected_url = "/api/protected-test/"
    auth_headers = {"HTTP_AUTHORIZATION": f"Bearer {access_token}"}
    protected_response_pre_logout = client.get(protected_url, **auth_headers)
    assert (
        protected_response_pre_logout.status_code == 200
    )  # or other success status code

    # Step 3: Log out the user
    client.post("/api/logout/", {}, format="json")

    # Step 3.1: Check if the token is blacklisted
    is_blacklisted = BlacklistedToken.objects.filter(
        token__jti=refresh_token_jti
    ).exists()
    logger.debug(f"Is refresh token blacklisted: {is_blacklisted}")
    assert is_blacklisted

    # Step 4: Make another request using the same token and expect it to fail
    protected_response_post_logout = client.get(protected_url, **auth_headers)
    assert (
        protected_response_post_logout.status_code == 401
    )  # Unauthorized or other appropriate failure code
