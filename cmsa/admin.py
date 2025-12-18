# cmsa/admin.py

from django.contrib import admin
from django.utils.html import format_html
from .models import Vendor, Supplier, Category, Contact


class ContactAdmin(admin.ModelAdmin):
    list_display = ("name", "email", "role", "primary_contact")
    search_fields = ("name", "email", "role")


class VendorSupplierInline(admin.TabularInline):
    model = Vendor.suppliers.through
    extra = 1


class VendorAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "display_suppliers",
    )
    search_fields = (
        "name",
        "suppliers__name",
    )
    inlines = [VendorSupplierInline]
    exclude = ("suppliers",)

    def display_suppliers(self, obj):
        return ", ".join([supplier.name for supplier in obj.suppliers.all()])

    display_suppliers.short_description = "Suppliers"


class SupplierAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "website",
        "phone",
        "account_active",
    )

    # Remove old fields and search through the M2M instead
    search_fields = (
        "name",
        "website",
        "phone",
        "accounting_email",
        "accounting_contact",
        "account_number",
        "contacts__name",
        "contacts__email",
        "contacts__role",
    )

    # Optional guard: ensures these never appear in the admin form
    exclude = ("contact_name", "contact_email")

    readonly_fields = ("display_contacts",)

    fieldsets = (
        (
            None,
            {
                "fields": (
                    "name",
                    "website",
                    "phone",
                    "contacts",
                    "display_contacts",  # keep readonly field in fieldsets so it renders
                    "website_username",
                    "website_password",
                    "minimum_order_amount",
                    "notes",
                    "shipping_fees",
                    "max_delivery_time",
                    "accounting_email",
                    "accounting_contact",
                    "account_number",
                    "account_active",
                )
            },
        ),
    )

    filter_horizontal = ("contacts",)

    def display_contacts(self, obj):
        contacts_html = ""
        for contact in obj.contacts.all():
            role_display = contact.role if contact.role else "N/A"
            contacts_html += format_html(
                "<div><strong>Name:</strong> {} <strong>Email:</strong> {} "
                "<strong>Role:</strong> {} <strong>Primary Contact:</strong> {}</div>",
                contact.name,
                contact.email,
                role_display,
                "Yes" if contact.primary_contact else "No",
            )
        return format_html(contacts_html)

    display_contacts.short_description = "Contacts"

class CategoryAdmin(admin.ModelAdmin):
    list_display = ("name",)
    search_fields = ("name",)


admin.site.register(Contact, ContactAdmin)
admin.site.register(Vendor, VendorAdmin)
admin.site.register(Supplier, SupplierAdmin)
admin.site.register(Category, CategoryAdmin)
