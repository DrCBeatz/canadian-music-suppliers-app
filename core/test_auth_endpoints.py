# core/test_auth_endpoints.py

import pytest
from django.contrib.auth import get_user_model


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
