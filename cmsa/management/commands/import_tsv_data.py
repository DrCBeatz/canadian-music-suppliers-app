# cmsa/management/commands/import_tsv_data.py

from django.core.management.base import BaseCommand
from cmsa.models import Vendor, Supplier, Category
import csv


class Command(BaseCommand):
    help = "Import data from a TSV file into the database"

    def add_arguments(self, parser):
        parser.add_argument("tsv_file", type=str, help="Path to the TSV file")

    def handle(self, *args, **kwargs):
        tsv_file_path = kwargs["tsv_file"]

        with open(tsv_file_path, "r", newline="") as file:
            reader = csv.DictReader(file, delimiter="\t")

            for row in reader:
                vendor_name = row["Vendor"].strip()
                supplier_names = [name.strip() for name in row["Supplier"].split(",")]
                category_name = row[
                    "Category"
                ].strip()  # Since each row has only one category

                # Get or create the vendor
                vendor, created = Vendor.objects.get_or_create(name=vendor_name)

                # Get or create each supplier and add to the vendor
                for supplier_name in supplier_names:
                    supplier, created = Supplier.objects.get_or_create(
                        name=supplier_name
                    )
                    vendor.suppliers.add(supplier)

                # Get or create the category and add to the vendor
                category, created = Category.objects.get_or_create(name=category_name)
                vendor.categories.add(category)
        self.stdout.write(
            self.style.SUCCESS("Successfully imported data from the TSV file!")
        )
