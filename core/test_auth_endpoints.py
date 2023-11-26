# core/test_auth_endpoints.py

import pytest
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import RefreshToken, AccessToken
from datetime import timedelta
import jwt
from django.conf import settings
import datetime
import logging

logger = logging.getLogger(__name__)


@pytest.fixture
def create_test_user(db):
    User = get_user_model()
    user = User.objects.create_user(username="testuser", password="12345")
    return user


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
