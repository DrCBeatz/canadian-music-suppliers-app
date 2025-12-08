# cmsa/serializers.py

from rest_framework import serializers
from .models import Vendor, Supplier, Category, Contact

class ContactSerializer(serializers.ModelSerializer):
    class Meta:
        model = Contact
        fields = ["id", "name", "email", "role"]


class SupplierContactsMixin:
    """
    Makes contact-derived fields O(1) DB queries per Supplier object.
    If contacts were prefetched, this becomes 0 DB queries.
    """

    def _contacts_list(self, obj) -> list[Contact]:
        cached = getattr(obj, "_contacts_list_cache", None)
        if cached is not None:
            return cached

        # Support Prefetch(..., to_attr="prefetched_contacts") if you ever use it
        if hasattr(obj, "prefetched_contacts"):
            contacts = list(obj.prefetched_contacts)
        else:
            # If queryset used prefetch_related('contacts'), this uses the cache (no DB hit)
            contacts = list(obj.contacts.all())

        obj._contacts_list_cache = contacts
        return contacts

    def _contact_parts(self, obj):
        cached = getattr(obj, "_contact_parts_cache", None)
        if cached is not None:
            return cached

        contacts = self._contacts_list(obj)
        primary = next((c for c in contacts if c.primary_contact), None)
        accounting = next((c for c in contacts if c.role == "Accounting Contact"), None)
        additional = [
            c for c in contacts
            if (not c.primary_contact) and (c.role != "Accounting Contact")
        ]

        obj._contact_parts_cache = (primary, accounting, additional)
        return obj._contact_parts_cache


class SupplierSerializer(SupplierContactsMixin, serializers.ModelSerializer):
    primary_contact_name = serializers.SerializerMethodField()
    primary_contact_email = serializers.SerializerMethodField()
    accounting_email = serializers.SerializerMethodField()
    accounting_contact = serializers.SerializerMethodField()
    website_password = serializers.SerializerMethodField()
    additional_contacts = serializers.SerializerMethodField()

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
            "accounting_contact",
            "accounting_email",
            "account_number",
            "account_active",
            "website_username",
            "website_password",
            "additional_contacts",
        ]

    def get_primary_contact_name(self, obj):
        primary, _, _ = self._contact_parts(obj)
        return primary.name if primary else None

    def get_primary_contact_email(self, obj):
        primary, _, _ = self._contact_parts(obj)
        return primary.email if primary else None

    def get_accounting_contact(self, obj):
        _, accounting, _ = self._contact_parts(obj)
        return accounting.name if accounting else None

    def get_accounting_email(self, obj):
        _, accounting, _ = self._contact_parts(obj)
        return accounting.email if accounting else None

    def get_additional_contacts(self, obj):
        _, _, additional = self._contact_parts(obj)
        return ContactSerializer(additional, many=True).data

    def get_website_password(self, obj):
        return obj.decrypt_password() if obj.website_password else None


class SupplierPublicSerializer(SupplierContactsMixin, serializers.ModelSerializer):
    primary_contact_name = serializers.SerializerMethodField()
    primary_contact_email = serializers.SerializerMethodField()

    class Meta:
        model = Supplier
        fields = ["id", "name", "primary_contact_name", "primary_contact_email", "website", "phone"]

    def get_primary_contact_name(self, obj):
        primary, _, _ = self._contact_parts(obj)
        return primary.name if primary else None

    def get_primary_contact_email(self, obj):
        primary, _, _ = self._contact_parts(obj)
        return primary.email if primary else None


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ["id", "name"]


class VendorSerializer(serializers.ModelSerializer):
    suppliers = SupplierSerializer(many=True, read_only=True)
    categories = CategorySerializer(many=True, read_only=True)

    class Meta:
        model = Vendor
        fields = ["id", "name", "suppliers", "categories"]


class VendorPublicSerializer(serializers.ModelSerializer):
    suppliers = SupplierPublicSerializer(many=True, read_only=True)
    categories = CategorySerializer(many=True, read_only=True)

    class Meta:
        model = Vendor
        fields = ["id", "name", "suppliers", "categories"]