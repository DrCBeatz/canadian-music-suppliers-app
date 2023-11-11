# cmsa/tests/test_views.py

import pytest
from django.urls import reverse, resolve
from cmsa.views import frontend
from rest_framework.test import APIClient
from cmsa.models import Vendor, Supplier, Category


# @pytest.mark.django_db
# def test_url_exitsts_at_correct_location(client):
#     response = client.get(reverse("frontend"))
#     assert response.status_code == 200


# @pytest.mark.django_db
# def test_homepage_url_name(client):
#     response = client.get(reverse("frontend"))
#     assert response.status_code == 200


# @pytest.mark.django_db
# def test_homepage_template(client):
#     response = client.get(reverse("frontend"))
#     templates = [template.name for template in response.templates]
#     assert "frontend/index.html" in templates


@pytest.mark.django_db
def test_homepage_does_not_contain_incorrect_html(client):
    response = client.get(reverse("frontend"))
    assert b"Hi there! I should not be on the page." not in response.content


@pytest.mark.django_db
def test_homepage_url_resolves_homepageview():
    match = resolve("/")
    assert match.func == frontend


@pytest.fixture
def api_client():
    return APIClient()


# @pytest.mark.django_db
# def test_vendor_list(api_client):
#     # Setup
#     vendor = Vendor.objects.create(name="Test Vendor")

#     # API call
#     response = api_client.get("/routes/vendors/")

#     assert response.status_code == 200
#     assert len(response.data) == 1
#     assert response.data[0]["name"] == "Test Vendor"


# @pytest.mark.django_db
# def test_supplier_list(api_client):
#     # Setup
#     supplier = Supplier.objects.create(name="Test Supplier")

#     # API call
#     response = api_client.get("/routes/suppliers/")

#     assert response.status_code == 200
#     assert len(response.data) == 1
#     assert response.data[0]["name"] == "Test Supplier"


# @pytest.mark.django_db
# def test_category_list(api_client):
#     # Setup
#     category = Category.objects.create(name="Test Category")

#     # API call
#     response = api_client.get("/routes/categories/")

#     assert response.status_code == 200
#     assert len(response.data) == 1
#     assert response.data[0]["name"] == "Test Category"
