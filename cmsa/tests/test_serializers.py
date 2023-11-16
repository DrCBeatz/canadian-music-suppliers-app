# cmsa/tests/test_serializers.py

import pytest
from cmsa.models import Supplier, Category, Vendor, Contact
from cmsa.serializers import SupplierSerializer, CategorySerializer, VendorSerializer


@pytest.mark.django_db
def test_valid_supplier_serializer():
    supplier = Supplier.objects.create(
        name="Test Supplier", website="https://example.com", phone="123-456-7890"
    )
    contact = Contact.objects.create(
        name="John Doe", email="johndoe@example.com", primary_contact=True
    )
    supplier.contacts.add(contact)
    serializer = SupplierSerializer(supplier)

    data = serializer.data

    assert data["name"] == "Test Supplier"
    assert data["primary_contact_name"] == "John Doe"
    assert data["primary_contact_email"] == "johndoe@example.com"
    assert data["website"] == "https://example.com"
    assert data["phone"] == "123-456-7890"


@pytest.mark.django_db
def test_supplier_serializer_empty_data():
    serializer = SupplierSerializer(data={})

    assert not serializer.is_valid()
    assert set(serializer.errors.keys()) == {"name"}


@pytest.mark.django_db
def test_valid_category_serializer():
    category = Category(name="Test Category")
    serializer = CategorySerializer(category)

    data = serializer.data

    assert data["name"] == "Test Category"


@pytest.mark.django_db
def test_category_serializer_empty_data():
    serializer = CategorySerializer(data={})

    assert not serializer.is_valid()
    assert set(serializer.errors.keys()) == {"name"}


@pytest.mark.django_db
def test_valid_vendor_serializer():
    supplier = Supplier.objects.create(name="Test Supplier")
    category = Category.objects.create(name="Test Category")

    vendor = Vendor.objects.create(name="Test Vendor")
    vendor.suppliers.add(supplier)
    vendor.categories.add(category)

    serializer = VendorSerializer(vendor)

    data = serializer.data

    assert data["name"] == "Test Vendor"
    assert len(data["suppliers"]) == 1
    assert data["suppliers"][0]["name"] == "Test Supplier"
    assert len(data["categories"]) == 1
    assert data["categories"][0]["name"] == "Test Category"


@pytest.mark.django_db
def test_vendor_serializer_empty_data():
    serializer = VendorSerializer(data={})

    assert not serializer.is_valid()
    assert set(serializer.errors.keys()) == {"name"}
