# cmsa/tests/test_serializers.py

import pytest
from cmsa.models import Supplier, Category, Vendor, Contact
from cmsa.serializers import SupplierSerializer, CategorySerializer, VendorSerializer

# fixtures


@pytest.fixture
def contact_primary():
    return Contact.objects.create(
        name="John Primary", email="johnprimary@example.com", primary_contact=True
    )


@pytest.fixture
def contact_accounting():
    return Contact.objects.create(
        name="Jane Accounting",
        email="janeaccounting@example.com",
        role="Accounting Contact",
    )


@pytest.fixture
def contact_additional():
    return Contact.objects.create(
        name="Jack Additional", email="jackadditional@example.com"
    )


# tests


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


@pytest.mark.django_db
def test_supplier_with_additional_contacts(
    contact_primary, contact_accounting, contact_additional
):
    supplier = Supplier.objects.create(name="Supplier with Additional")
    supplier.contacts.add(contact_primary, contact_accounting, contact_additional)
    serializer = SupplierSerializer(supplier)

    data = serializer.data

    assert data["name"] == "Supplier with Additional"
    assert data["primary_contact_name"] == "John Primary"
    assert len(data["additional_contacts"]) == 1
    assert data["additional_contacts"][0]["name"] == "Jack Additional"


@pytest.mark.django_db
def test_supplier_without_additional_contacts(contact_primary, contact_accounting):
    supplier = Supplier.objects.create(name="Supplier without Additional")
    supplier.contacts.add(contact_primary, contact_accounting)
    serializer = SupplierSerializer(supplier)

    data = serializer.data

    assert data["name"] == "Supplier without Additional"
    assert data["primary_contact_name"] == "John Primary"
    assert len(data["additional_contacts"]) == 0


@pytest.mark.django_db
def test_supplier_serializer_all_contact_types(
    contact_primary, contact_accounting, contact_additional
):
    supplier = Supplier.objects.create(name="Supplier All Contacts")
    supplier.contacts.add(contact_primary, contact_accounting, contact_additional)
    serializer = SupplierSerializer(supplier)

    data = serializer.data

    assert data["primary_contact_name"] == "John Primary"
    assert data["accounting_contact"] == "Jane Accounting"
    assert len(data["additional_contacts"]) == 1
    assert data["additional_contacts"][0]["name"] == "Jack Additional"
