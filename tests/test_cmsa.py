# tests/test_cmsa.py

import pytest
from django.urls import reverse, resolve
from cmsa.views import frontend


@pytest.mark.django_db
def test_url_exitsts_at_correct_location(client):
    response = client.get(reverse("frontend"))
    assert response.status_code == 200


@pytest.mark.django_db
def test_homepage_url_name(client):
    response = client.get(reverse("frontend"))
    assert response.status_code == 200


@pytest.mark.django_db
def test_homepage_template(client):
    response = client.get(reverse("frontend"))
    templates = [template.name for template in response.templates]
    assert "frontend/index.html" in templates


@pytest.mark.django_db
def test_homepage_does_not_contain_incorrect_html(client):
    response = client.get(reverse("frontend"))
    assert b"Hi there! I should not be on the page." not in response.content


@pytest.mark.django_db
def test_homepage_url_resolves_homepageview():
    match = resolve("/")
    assert match.func == frontend
