# cmsa/management/commands/import_supplier_contacts.py

from django.core.management.base import BaseCommand
from cmsa.models import Supplier
import csv


class Command(BaseCommand):
    help = "Import supplier contacts from a CSV file"

    def add_arguments(self, parser):
        parser.add_argument("csv_file", type=str, help="Path to the CSV file")

    def handle(self, *args, **kwargs):
        csv_file_path = kwargs["csv_file"]

        with open(csv_file_path, mode="r") as file:
            csv_reader = csv.DictReader(file)

            for row in csv_reader:
                # Match the supplier by name
                supplier, created = Supplier.objects.get_or_create(name=row["Supplier"])

                # Update the fields
                if "contact_name" in row:
                    supplier.contact_name = row["contact_name"]
                if "contact_email" in row:
                    supplier.contact_email = row["contact_email"]
                if "website" in row:
                    supplier.website = row["website"]
                if "phone" in row:
                    supplier.phone = row["phone"]

                # Save the supplier
                supplier.save()

        self.stdout.write(
            self.style.SUCCESS("Successfully imported supplier contacts!")
        )
