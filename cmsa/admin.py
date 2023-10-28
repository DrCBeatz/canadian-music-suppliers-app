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
    list_display = ("name",)
    search_fields = ("name",)


class CategoryAdmin(admin.ModelAdmin):
    list_display = ("name",)
    search_fields = ("name",)


admin.site.register(Vendor, VendorAdmin)
admin.site.register(Supplier, SupplierAdmin)
admin.site.register(Category, CategoryAdmin)
