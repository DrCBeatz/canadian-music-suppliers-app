from rest_framework import serializers
from .models import Vendor, Supplier, Category


class SupplierSerializer(serializers.ModelSerializer):
    class Meta:
        model = Supplier
        fields = ["id", "name"]


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ["id", "name"]


class VendorSerializer(serializers.ModelSerializer):
    supplier = SupplierSerializer(read_only=True)
    categories = CategorySerializer(many=True, read_only=True)

    class Meta:
        model = Vendor
        fields = ["id", "name", "supplier", "categories"]
