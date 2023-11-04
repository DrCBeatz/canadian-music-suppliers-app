# cmsa/models.py

from django.db import models


class Supplier(models.Model):
    name = models.CharField(max_length=200)
    contact_name = models.CharField(max_length=200, null=True, blank=True)
    contact_email = models.CharField(max_length=200, null=True, blank=True)
    website = models.CharField(max_length=255, null=True, blank=True)
    phone = models.CharField(max_length=35, null=True, blank=True)
    website_username = models.CharField(max_length=255, null=True, blank=True)
    website_password = models.CharField(max_length=255, null=True, blank=True)
    minimum_order_amount = models.TextField(null=True, blank=True)
    notes = models.TextField(null=True, blank=True)
    shipping_fees = models.TextField(null=True, blank=True)
    max_delivery_time = models.TextField(null=True, blank=True)
    accounting_email = models.EmailField(null=True, blank=True)
    accounting_contact = models.CharField(max_length=200, null=True, blank=True)
    account_number = models.CharField(max_length=200, null=True, blank=True)
    account_active = models.BooleanField(default=False)

    def __str__(self):
        return self.name


class Category(models.Model):
    name = models.CharField(max_length=200)

    def __str__(self):
        return self.name


class Vendor(models.Model):
    name = models.CharField(max_length=200)
    suppliers = models.ManyToManyField(Supplier, related_name="vendors")
    categories = models.ManyToManyField(Category, related_name="vendors")

    def __str__(self):
        return self.name
