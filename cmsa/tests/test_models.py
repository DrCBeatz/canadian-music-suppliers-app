# cmsa/tests/test_models.py

import pytest
from cmsa.models import Vendor, Supplier, Category


@pytest.mark.django_db
def test_create_supplier():
    supplier = Supplier.objects.create(
        name="Test Supplier",
        contact_name="John Doe",
        contact_email="john@example.com",
        website="https://example.com",
        phone="123-456-7890",
    )
    assert supplier.name == "Test Supplier"
    assert supplier.contact_name == "John Doe"
    assert supplier.contact_email == "john@example.com"
    assert supplier.website == "https://example.com"
    assert supplier.phone == "123-456-7890"


@pytest.mark.django_db
def test_create_category():
    category = Category.objects.create(name="Test Category")
    assert category.name == "Test Category"


@pytest.mark.django_db
def test_create_vendor():
    vendor = Vendor.objects.create(name="Test Vendor")
    assert vendor.name == "Test Vendor"


@pytest.mark.django_db
def test_vendor_relationships():
    supplier1 = Supplier.objects.create(name="Supplier 1")
    supplier2 = Supplier.objects.create(name="Supplier 2")
    category1 = Category.objects.create(name="Category 1")
    category2 = Category.objects.create(name="Category 2")

    vendor = Vendor.objects.create(name="Test Vendor")
    vendor.suppliers.add(supplier1, supplier2)
    vendor.categories.add(category1, category2)

    assert vendor.suppliers.count() == 2
    assert vendor.categories.count() == 2
    assert supplier1 in vendor.suppliers.all()
    assert supplier2 in vendor.suppliers.all()
    assert category1 in vendor.categories.all()
    assert category2 in vendor.categories.all()
