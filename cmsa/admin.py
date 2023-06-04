from django.contrib import admin
from .models import Vendor, Supplier, Category


class VendorAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "supplier",
    )
    search_fields = (
        "name",
        "supplier__name",
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
