# core/test_auth_endpoints.py

import pytest
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import RefreshToken, AccessToken
from datetime import timedelta
import jwt
from django.conf import settings


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
