import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "core.settings")
django.setup()

from cmsa.models import Supplier, Contact

def create_contacts_from_suppliers():
    for supplier in Supplier.objects.all():
        # Create a contact from contact_name and contact_email
        if supplier.contact_name:
            contact = Contact(
                name=supplier.contact_name,
                email=supplier.contact_email,
                primary_contact=True
            )
            contact.save()
            supplier.contacts.add(contact)
    
        if supplier.accounting_contact:
            contact = Contact(
                name=supplier.accounting_contact,
                email=supplier.accounting_email,
                primary_contact=False
            )
            contact.save()
            supplier.contacts.add(contact)

if __name__ == "__main__":
    create_contacts_from_suppliers()