from django.contrib import admin
from .models import Vendor, Supplier, Category


class VendorSupplierInline(
    admin.TabularInline
):  # New Inline class to show Suppliers within Vendor
    model = Vendor.suppliers.through
    extra = 1  # number of empty forms to show


class VendorAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "display_suppliers",
    )  # Changed 'supplier' to 'display_suppliers'
    search_fields = (
        "name",
        "suppliers__name",
    )  # Changed 'supplier__name' to 'suppliers__name'
    inlines = [VendorSupplierInline]  # Add the inline to show Suppliers
    exclude = (
        "suppliers",
    )  # Exclude the direct many-to-many field, since we're using an inline

    def display_suppliers(
        self, obj
    ):  # New method to display suppliers in the list view
        return ", ".join([supplier.name for supplier in obj.suppliers.all()])

    display_suppliers.short_description = (
        "Suppliers"  # Name to display in the list view header
    )


class SupplierAdmin(admin.ModelAdmin):
    list_display = ("name",)
    search_fields = ("name",)


class CategoryAdmin(admin.ModelAdmin):
    list_display = ("name",)
    search_fields = ("name",)


admin.site.register(Vendor, VendorAdmin)
admin.site.register(Supplier, SupplierAdmin)
admin.site.register(Category, CategoryAdmin)
