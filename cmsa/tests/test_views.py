# cmsa/tests/test_views.py

import pytest
from django.urls import reverse, resolve
from cmsa.views import frontend
from rest_framework.test import APIClient
from cmsa.models import Vendor, Supplier, Category, Contact
from django.db import connection
from django.test.utils import CaptureQueriesContext
from django.contrib.auth import get_user_model


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


@pytest.fixture
def api_client():
    return APIClient()


@pytest.mark.django_db
def test_vendor_list(api_client):
    # Setup
    vendor = Vendor.objects.create(name="Test Vendor")

    # API call
    response = api_client.get("/routes/vendors/")

    assert response.status_code == 200
    assert len(response.data) == 1
    assert response.data[0]["name"] == "Test Vendor"


@pytest.mark.django_db
def test_supplier_list(api_client):
    # Setup
    supplier = Supplier.objects.create(name="Test Supplier")

    # API call
    response = api_client.get("/routes/suppliers/")

    assert response.status_code == 200
    assert len(response.data) == 1
    assert response.data[0]["name"] == "Test Supplier"


@pytest.mark.django_db
def test_category_list(api_client):
    # Setup
    category = Category.objects.create(name="Test Category")

    # API call
    response = api_client.get("/routes/categories/")

    assert response.status_code == 200
    assert len(response.data) == 1
    assert response.data[0]["name"] == "Test Category"


@pytest.mark.django_db
def test_url_exists_at_correct_location(client):
    response = client.get(reverse("frontend"), follow=True)
    print(f"Response status code: {response.status_code}")
    if hasattr(response, "redirect_chain"):
        print(f"Redirect chain: {response.redirect_chain}")
    assert response.status_code == 200

@pytest.mark.django_db
def test_vendor_search_matches_supplier_name(api_client):
    cat = Category.objects.create(name="Guitars")
    supplier = Supplier.objects.create(name="Coast Music", website="https://example.com")
    supplier.contacts.add(Contact.objects.create(
        name="Primary", email="p@example.com", primary_contact=True
    ))

    vendor = Vendor.objects.create(name="Dunlop")
    vendor.suppliers.add(supplier)
    vendor.categories.add(cat)

    resp = api_client.get("/routes/vendors/?search=Coast")
    assert resp.status_code == 200
    assert len(resp.data) == 1
    assert resp.data[0]["name"] == "Dunlop"
    assert resp.data[0]["suppliers"][0]["name"] == "Coast Music"

@pytest.mark.django_db
@pytest.mark.parametrize("authenticated", [False, True])
def test_vendor_search_query_count_does_not_scale_both_modes(api_client, authenticated):
    if authenticated:
        User = get_user_model()
        user = User.objects.create_user(username="u", password="p")
        api_client.force_authenticate(user=user)

    cat = Category.objects.create(name="Guitars")

    def create_batch(start, n):
        for i in range(start, start + n):
            s = Supplier.objects.create(name=f"Coast Music {i}")
            s.contacts.add(Contact.objects.create(
                name=f"Primary {i}", email=f"p{i}@example.com", primary_contact=True
            ))
            v = Vendor.objects.create(name=f"Brand {i}")
            v.suppliers.add(s)
            v.categories.add(cat)

    def run():
        with CaptureQueriesContext(connection) as ctx:
            resp = api_client.get("/routes/vendors/?search=Coast")
        assert resp.status_code == 200
        return len(resp.data), len(ctx), resp

    create_batch(0, 5)
    n1, q1, _ = run()

    create_batch(5, 45)
    n2, q2, resp = run()

    assert n1 == 5
    assert n2 == 50
    assert q2 <= q1 + 3

    if authenticated:
        assert "account_active" in resp.data[0]["suppliers"][0]
    else:
        assert "account_active" not in resp.data[0]["suppliers"][0]

@pytest.mark.django_db
def test_vendor_list_paginated_when_page_param_provided(api_client):
    Vendor.objects.create(name="Vendor A")
    Vendor.objects.create(name="Vendor B")

    resp = api_client.get("/routes/vendors/?page=1&page_size=1")
    assert resp.status_code == 200

    # paginated shape
    assert "count" in resp.data
    assert "results" in resp.data

    assert resp.data["count"] == 2
    assert len(resp.data["results"]) == 1

@pytest.mark.django_db
def test_vendor_list_not_paginated_by_default(api_client):
    Vendor.objects.create(name="Vendor A")

    resp = api_client.get("/routes/vendors/")
    assert resp.status_code == 200

    # Legacy shape should remain a plain list
    assert isinstance(resp.data, list)
    assert resp.data[0]["name"] == "Vendor A"

@pytest.mark.django_db
def test_vendor_list_paginated_when_page_size_param_provided(api_client):
    Vendor.objects.create(name="Vendor A")
    Vendor.objects.create(name="Vendor B")

    resp = api_client.get("/routes/vendors/?page_size=1")
    assert resp.status_code == 200

    assert isinstance(resp.data, dict)
    assert set(resp.data.keys()) >= {"count", "next", "previous", "results"}
    assert resp.data["count"] == 2
    assert len(resp.data["results"]) == 1

@pytest.mark.django_db
def test_vendor_list_out_of_range_page_returns_404(api_client):
    Vendor.objects.create(name="Vendor A")
    Vendor.objects.create(name="Vendor B")

    resp = api_client.get("/routes/vendors/?page=99&page_size=1")
    assert resp.status_code == 404

@pytest.mark.django_db
def test_vendor_list_pagination_has_stable_order(api_client):
    Vendor.objects.create(name="Vendor B")
    Vendor.objects.create(name="Vendor A")
    Vendor.objects.create(name="Vendor C")

    resp = api_client.get("/routes/vendors/?page=1&page_size=2")
    assert resp.status_code == 200

    names = [v["name"] for v in resp.data["results"]]
    assert names == ["Vendor A", "Vendor B"]

from urllib.parse import urlparse, parse_qs

@pytest.mark.django_db
def test_vendor_list_next_link_preserves_page_size_and_search(api_client):
    # Create enough vendors that "next" exists
    for i in range(3):
        Vendor.objects.create(name=f"Vendor {i}")

    resp = api_client.get("/routes/vendors/?search=Vendor&page=1&page_size=1")
    assert resp.status_code == 200
    assert resp.data["next"] is not None

    qs = parse_qs(urlparse(resp.data["next"]).query)
    assert qs["search"] == ["Vendor"]
    assert qs["page"] == ["2"]
    assert qs["page_size"] == ["1"]

@pytest.mark.django_db
def test_vendor_list_page_size_is_capped(api_client):
    # Need > max_page_size vendors to prove the cap works
    for i in range(120):
        Vendor.objects.create(name=f"Vendor {i:03d}")

    resp = api_client.get("/routes/vendors/?page=1&page_size=1000")
    assert resp.status_code == 200

    assert resp.data["count"] == 120
    assert len(resp.data["results"]) == 100  # max_page_size from the paginator

@pytest.mark.django_db
def test_vendor_search_pagination_count_uses_distinct(api_client):
    cat = Category.objects.create(name="Guitars")
    supplier1 = Supplier.objects.create(name="Coast Music One")
    supplier2 = Supplier.objects.create(name="Coast Music Two")

    vendor = Vendor.objects.create(name="Dunlop")
    vendor.categories.add(cat)
    vendor.suppliers.add(supplier1, supplier2)

    resp = api_client.get("/routes/vendors/?search=Coast&page=1&page_size=10")
    assert resp.status_code == 200

    assert resp.data["count"] == 1
    assert len(resp.data["results"]) == 1
    assert resp.data["results"][0]["name"] == "Dunlop"    