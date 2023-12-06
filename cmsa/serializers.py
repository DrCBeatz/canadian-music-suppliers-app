# cmsa/serializers.py

from rest_framework import serializers
from .models import Vendor, Supplier, Category


class SupplierSerializer(serializers.ModelSerializer):
    primary_contact_name = serializers.SerializerMethodField()
    primary_contact_email = serializers.SerializerMethodField()

    class Meta:
        model = Supplier
        fields = [
            "id",
            "name",
            "primary_contact_name",
            "primary_contact_email",
            "website",
            "phone",
            "max_delivery_time",
            "minimum_order_amount",
            "notes",
            "shipping_fees",
            "accounting_email",
            "accounting_contact",
            "account_number",
            "account_active",
        ]

    def get_primary_contact_name(self, obj):
        primary_contact = obj.contacts.filter(primary_contact=True).first()
        return primary_contact.name if primary_contact else None

    def get_primary_contact_email(self, obj):
        primary_contact = obj.contacts.filter(primary_contact=True).first()
        return primary_contact.email if primary_contact else None


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ["id", "name"]


class VendorSerializer(serializers.ModelSerializer):
    suppliers = SupplierSerializer(many=True, read_only=True)
    categories = CategorySerializer(many=True, read_only=True)

    class Meta:
        model = Vendor
        fields = [
            "id",
            "name",
            "suppliers",
            "categories",
        ]
