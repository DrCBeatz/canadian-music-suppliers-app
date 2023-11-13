# cmsa/tests/test_models.py

import pytest
from cmsa.models import Vendor, Supplier, Category, Contact


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


@pytest.mark.django_db
def test_password_encryption_and_decryption():
    # Sample data
    plaintext_password = "sample_password"

    # Create a supplier instance with the plaintext password
    supplier = Supplier(name="Test Supplier", website_password=plaintext_password)
    supplier.save()

    # Check if the saved passwod is encrypted (i.e., different from plaintext)
    assert supplier.website_password != plaintext_password

    # Check decryption
    decrypted_password = supplier.decrypt_password()
    assert decrypted_password == plaintext_password

    # Clean up
    supplier.delete()


@pytest.mark.django_db
def test_password_encryption_on_edit():
    plaintext_password = "initial_password"
    updated_password = "updated_password"

    supplier = Supplier(name="Test Supplier", website_password=plaintext_password)
    supplier.save()

    supplier.website_password = updated_password
    supplier.save()

    assert supplier.website_password != updated_password

    decrypted_password = supplier.decrypt_password()
    assert decrypted_password == updated_password


@pytest.mark.django_db
def test_password_stays_encrypted_on_retrieve():
    plaintext_password = "sample_password"

    supplier = Supplier(name="Test Supplier", website_password=plaintext_password)
    supplier.save()

    retrieved_supplier = Supplier.objects.get(pk=supplier.pk)
    assert retrieved_supplier.website_password != plaintext_password

    decrypted_password = retrieved_supplier.decrypt_password()
    assert decrypted_password == plaintext_password


@pytest.mark.django_db
def test_create_contact():
    contact = Contact.objects.create(
        name="Jane Doe", email="jane@example.com", role="Manager", primary_contact=True
    )
    assert contact.name == "Jane Doe"
    assert contact.email == "jane@example.com"
    assert contact.role == "Manager"
    assert contact.primary_contact is True


@pytest.mark.django_db
def test_link_contact_to_supplier():
    supplier = Supplier.objects.create(name="Supplier A")
    contact = Contact.objects.create(
        name="Contact 1", email="contact1@example.com", primary_contact=True
    )
    supplier.contacts.add(contact)

    assert supplier.contacts.count() == 1
    assert supplier.contacts.first() == contact


@pytest.mark.django_db
def test_primary_contact_logic():
    supplier = Supplier.objects.create(name="Supplier B")
    contact1 = Contact.objects.create(name="Contact 1", primary_contact=True)
    contact2 = Contact.objects.create(name="Contact 2", primary_contact=True)

    supplier.contacts.add(contact1, contact2)
    supplier.save()

    contact1.refresh_from_db()
    contact2.refresh_from_db()

    # Assuming the logic is such that the last added contact becomes the primary contact
    assert contact1.primary_contact is False
    assert contact2.primary_contact is True


import pytest
from cmsa.models import Supplier, Contact


@pytest.mark.django_db
def test_multiple_primary_contacts():
    supplier = Supplier.objects.create(name="Supplier X")

    # Create two contacts and mark both as primary
    contact1 = Contact.objects.create(name="Contact 1", primary_contact=True)
    contact2 = Contact.objects.create(name="Contact 2", primary_contact=True)

    # Add contacts to supplier
    supplier.contacts.add(contact1, contact2)

    # Refresh from DB to get updated values
    contact1.refresh_from_db()
    contact2.refresh_from_db()

    # Check that only one of them remains the primary contact
    assert contact1.primary_contact != contact2.primary_contact
    # Assuming the logic sets the last added contact as primary
    assert contact1.primary_contact is False
    assert contact2.primary_contact is True
