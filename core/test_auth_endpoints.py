# core/test_auth_endpoints.py

import pytest
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import RefreshToken


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
