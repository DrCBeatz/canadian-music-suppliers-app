import os
import django

# Set up the Django environment
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "core.settings")
django.setup()

# Now you can safely import your Django models and anything else that requires Django context
from cmsa.models import Supplier
import csv
from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = "Import Suppliers from a .tsv file into the database."

    def add_arguments(self, parser):
        parser.add_argument("tsv_file_path", type=str, help="The TSV file path")

    def handle(self, *args, **kwargs):
        tsv_file_path = kwargs["tsv_file_path"]

        with open(tsv_file_path, mode="r", encoding="utf-8") as tsvfile:
            reader = csv.DictReader(tsvfile, delimiter="\t")

            for row in reader:
                supplier, created = Supplier.objects.update_or_create(
                    name=row["Supplier"],
                    defaults={
                        "website_username": row["website_username"],
                        "website_password": Supplier.encrypt_password(
                            row["website_password"]
                        ),
                        "minimum_order_amount": row["minimum_order_amount"],
                        "notes": row["notes"],
                        "shipping_fees": row["shipping_fees"],
                        "max_delivery_time": row["max_delivery_time"],
                        "accounting_email": row["accounting_email"],
                        "accounting_contact": row["accounting_contact"],
                        "account_number": row["account_number"],
                        "account_active": row["account_active"].lower() == "true",
                    },
                )
                self.stdout.write(
                    self.style.SUCCESS(
                        f'{"Created" if created else "Updated"} supplier: {supplier.name}'
                    )
                )


if __name__ == "__main__":
    from django.core.management import call_command

    tsv_file_path = (
        "data/supplier_contacts_extended.tsv"  # Update with your actual TSV file path
    )
    call_command("import_supplier_contacts_extended", tsv_file_path)
