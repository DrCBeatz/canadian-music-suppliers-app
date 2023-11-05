# cmsa/admin.py

from django.contrib import admin
from .models import Vendor, Supplier, Category


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
    change_form_template = 'frontend/admin/cmsa/supplier/change_form.html'
    list_display = (
        "name",
        "contact_name",
        "contact_email",
        "website",
        "phone",
        "accounting_email",
        "accounting_contact",
        "account_number",
        "account_active",
    )
    search_fields = (
        "name",
        "contact_name",
        "contact_email",
        "website",
        "phone",
        "accounting_email",
        "accounting_contact",
        "account_number",
    )
    fieldsets = (
        (
            None,
            {"fields": ("name", "contact_name", "contact_email", "website", "phone")},
        ),
        ("Website Credentials", {"fields": ("website_username", "website_password")}),
        (
            "Order & Shipping Details",
            {"fields": ("minimum_order_amount", "shipping_fees", "max_delivery_time")},
        ),
        (
            "Accounting",
            {
                "fields": (
                    "accounting_email",
                    "accounting_contact",
                    "account_number",
                    "account_active",
                )
            },
        ),
        ("Other", {"fields": ("notes",)}),
    )

    def changeform_view(self, request, object_id=None, form_url="", extra_context=None):
        extra_context = extra_context or {}
        if object_id:
            obj = self.model.objects.get(pk=object_id)
            if obj.website_password:
                # Decrypt the password and add it to the context
                extra_context["original_website_password"] = obj.decrypt_password()
        return super().changeform_view(
            request, object_id, form_url, extra_context=extra_context
        )


class CategoryAdmin(admin.ModelAdmin):
    list_display = ("name",)
    search_fields = ("name",)


admin.site.register(Vendor, VendorAdmin)
admin.site.register(Supplier, SupplierAdmin)
admin.site.register(Category, CategoryAdmin)
