# core/test_auth_endpoints.py

import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from django.urls import reverse
import logging
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
def test_login_success(create_test_user):
    client = APIClient()
    url = reverse("login")
    response = client.post(url, {"username": "testuser", "password": "12345"})

    assert response.status_code == 200
    assert response.data["detail"] == "Login successful"
    assert "_auth_user_id" in client.session  # Check if session is created


@pytest.mark.django_db
def test_logout(create_test_user):
    client = APIClient()
    client.force_authenticate(user=create_test_user)

    url = reverse("logout")
    response = client.post(url)

    assert response.status_code == 200
    assert response.data["detail"] == "Logout successful"
    assert "_auth_user_id" not in client.session  # Check if session is terminated


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


@pytest.mark.django_db
def test_logout_unauthenticated_user(client):
    # Make a POST request to the logout endpoint without logging in first
    response = client.post("/api/logout/", {}, format="json")

    # Verify that the response status code is 200 (OK) even for unauthenticated users
    assert response.status_code == 200

    # Check the response content if necessary
    assert response.json() == {"detail": "Logout successful"}


@pytest.mark.django_db
def test_protected_view_authenticated_access(create_test_user, client):
    user = create_test_user
    client.force_login(user)

    url = reverse("protected_test")  # Replace with the correct URL name
    response = client.get(url)

    assert response.status_code == 200
    assert response.data == {"message": "This is a protected endpoint"}


@pytest.mark.django_db
def test_protected_view_unauthenticated_access():
    client = APIClient()

    url = reverse("protected_test")  # Replace with your URL name
    response = client.get(url)

    assert response.status_code == 403  # Forbidden


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
    client = APIClient(enforce_csrf_checks=True)

    # User created by the fixture
    user = create_test_user

    # Obtain CSRF token
    response = client.get("/set-csrf/")
    csrf_token = response.cookies["csrftoken"].value
    logger.debug(f"CSRF Token obtained: {csrf_token}")

    # Test POST request without CSRF token
    response_without_csrf = client.post(
        "/api/login/", {"username": user.username, "password": "12345"}
    )
    logger.debug(
        f"Response without CSRF: {response_without_csrf.status_code}, {response_without_csrf.content}"
    )
    assert response_without_csrf.status_code == 403

    # Test POST request with CSRF token
    response_with_csrf = client.post(
        "/api/login/",
        {
            "username": user.username,
            "password": "12345",
            "csrfmiddlewaretoken": csrf_token,
        },
    )
    logger.debug(
        f"Response with CSRF: {response_with_csrf.status_code}, {response_with_csrf.content}"
    )
    assert response_with_csrf.status_code == 200
