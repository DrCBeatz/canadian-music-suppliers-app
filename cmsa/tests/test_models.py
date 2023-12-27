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
def test_password_encryption_and_decryption():
    # Step 1: Create a new Supplier instance without saving it to the database
    supplier = Supplier()

    # Step 2: Set fields individually
    supplier.name = "Test Supplier"

    # Set the website_password field (this should be the same process as entering a password in the admin)
    supplier.website_password = "sample_password"

    # Step 3: Save the instance (this should trigger the encryption in the save method)
    supplier.save()

    # Re-fetch the supplier from the database to ensure we're working with the saved data
    supplier = Supplier.objects.get(pk=supplier.pk)

    # Log or print the encrypted password to check what's being saved in the database
    print("Encrypted password from db:", supplier.website_password)

    # Ensure the encrypted password isn't the plaintext password
    assert supplier.website_password != "sample_password"

    # Directly test the decrypted password
    decrypted_password = supplier.decrypt_password()
    print("Decrypted password:", decrypted_password)

    # Ensure the decrypted password is the same as the original plaintext password
    assert decrypted_password == "sample_password"


@pytest.mark.django_db
def test_password_stays_encrypted_on_retrieve():
    plaintext_password = "sample_password"
    supplier = Supplier(name="Test Supplier", website_password=plaintext_password)
    supplier.save()

    retrieved_supplier = Supplier.objects.get(pk=supplier.pk)

    # Directly test the decrypted password
    decrypted_password = retrieved_supplier.decrypt_password()
    assert decrypted_password == plaintext_password


@pytest.mark.django_db
def test_password_stays_encrypted_on_retrieve():
    # Step 1: Create a new Supplier instance without saving it to the database
    supplier = Supplier()

    # Step 2: Set fields individually
    supplier.name = "Test Supplier"

    # Set the website_password field (this should trigger encryption on save)
    supplier.website_password = "sample_password"

    # Step 3: Save the instance (this should trigger the encryption in the save method)
    supplier.save()

    # Re-fetch the supplier from the database to ensure we're working with the saved data
    retrieved_supplier = Supplier.objects.get(pk=supplier.pk)

    # Log or print the encrypted password to check what's being saved in the database
    print("Encrypted password from db:", retrieved_supplier.website_password)

    # Ensure the encrypted password isn't the plaintext password
    assert retrieved_supplier.website_password != "sample_password"

    # Directly test the decrypted password
    decrypted_password = retrieved_supplier.decrypt_password()
    print("Decrypted password:", decrypted_password)

    # Ensure the decrypted password is the same as the original plaintext password
    assert decrypted_password == "sample_password"


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


@pytest.mark.django_db
def test_remove_contact_from_supplier():
    # Create a supplier
    supplier = Supplier.objects.create(name="Supplier Y")

    # Create multiple contacts
    contact1 = Contact.objects.create(name="Contact 1", primary_contact=True)
    contact2 = Contact.objects.create(name="Contact 2", primary_contact=False)
    contact3 = Contact.objects.create(name="Contact 3", primary_contact=False)

    # Add contacts to supplier
    supplier.contacts.add(contact1, contact2, contact3)

    # Verify that all contacts are added
    assert supplier.contacts.count() == 3

    # Remove one contact
    supplier.contacts.remove(contact2)

    # Refresh from DB to get updated values
    supplier.refresh_from_db()

    # Verify that the correct contacts remain
    remaining_contacts = supplier.contacts.all()
    assert contact2 not in remaining_contacts
    assert contact1 in remaining_contacts
    assert contact3 in remaining_contacts
    assert supplier.contacts.count() == 2


@pytest.mark.django_db
def test_delete_contact_from_supplier():
    # Create a supplier
    supplier = Supplier.objects.create(name="Supplier Z")

    # Create a contact and associate it with the supplier
    contact = Contact.objects.create(name="Contact Z", primary_contact=True)
    supplier.contacts.add(contact)

    # Verify that the contact is added
    assert supplier.contacts.count() == 1
    assert supplier.contacts.filter(id=contact.id).exists()

    # Delete the contact
    contact.delete()

    # Refresh supplier from DB to get updated values
    supplier.refresh_from_db()

    # Verify that the supplier no longer has this contact
    assert supplier.contacts.count() == 0
    assert not supplier.contacts.filter(id=contact.id).exists()


@pytest.mark.django_db
def test_primary_contact_update_logic():
    # Create a supplier
    supplier = Supplier.objects.create(name="Supplier for Primary Contact Test")

    # Create two contacts and mark the first one as primary
    contact1 = Contact.objects.create(name="Primary Contact 1", primary_contact=True)
    contact2 = Contact.objects.create(name="Primary Contact 2", primary_contact=False)

    # Add both contacts to the supplier
    supplier.contacts.add(contact1, contact2)

    # Initially, only contact1 should be primary
    assert contact1.primary_contact is True
    assert contact2.primary_contact is False

    # Now, update contact2 to be primary
    contact2.primary_contact = True
    contact2.save()

    # Refresh from DB to get updated values
    contact1.refresh_from_db()
    contact2.refresh_from_db()

    # Verify that contact1 is no longer primary, but contact2 is
    assert contact1.primary_contact is False
    assert contact2.primary_contact is True
