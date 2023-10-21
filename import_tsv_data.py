import csv
import os
import django

# Set up Django environment
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "core.settings")
django.setup()

from cmsa.models import Vendor, Supplier, Category


def import_data_from_tsv(filename):
    with open(filename, "r", newline="") as file:
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
                supplier, created = Supplier.objects.get_or_create(name=supplier_name)
                vendor.suppliers.add(supplier)

            # Get or create the category and add to the vendor
            category, created = Category.objects.get_or_create(name=category_name)
            vendor.categories.add(category)


if __name__ == "__main__":
    import_data_from_tsv("CMT.tsv")
