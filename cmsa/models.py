# cmsa/models.py

from cryptography.fernet import Fernet
from django.conf import settings
from django.db import models
from django.db.models.signals import post_init


class Contact(models.Model):
    name = models.CharField(max_length=200)
    email = models.EmailField(null=True, blank=True)
    role = models.CharField(max_length=400, null=True, blank=True)
    primary_contact = models.BooleanField(default=False)

    def save(self, *args, **kwargs):
        # Ensure only one primary contact per supplier
        if self.primary_contact:
            Contact.objects.filter(
                primary_contact=True, supplier__contacts=self
            ).update(primary_contact=False)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class Supplier(models.Model):
    name = models.CharField(max_length=200)
    contacts = models.ManyToManyField(Contact, blank=True)
    contact_name = models.CharField(max_length=200, null=True, blank=True)
    contact_email = models.CharField(max_length=200, null=True, blank=True)
    website = models.CharField(max_length=255, null=True, blank=True)
    phone = models.CharField(max_length=35, null=True, blank=True)
    website_username = models.CharField(max_length=255, null=True, blank=True)
    website_password = models.CharField(max_length=500, null=True, blank=True)
    minimum_order_amount = models.TextField(null=True, blank=True)
    notes = models.TextField(null=True, blank=True)
    shipping_fees = models.TextField(null=True, blank=True)
    max_delivery_time = models.TextField(null=True, blank=True)
    accounting_email = models.EmailField(null=True, blank=True)
    accounting_contact = models.CharField(max_length=200, null=True, blank=True)
    account_number = models.CharField(max_length=200, null=True, blank=True)
    account_active = models.BooleanField(default=False)
    __original_website_password = None

    def __init__(self, *args, **kwargs):
        super(Supplier, self).__init__(*args, **kwargs)
        self.__original_website_password = self.website_password
        
    def save(self, *args, **kwargs):
        # Encrypt the password only if it's been changed
        if self.website_password != self.__original_website_password:
            if self.website_password:
                self.website_password = self.encrypt_password(self.website_password)

        super().save(*args, **kwargs)
        # Update the original password to the new one after save
        self.__original_website_password = self.website_password

    @staticmethod
    def encrypt_password(password):
        cipher_suite = Fernet(settings.PASSWORD_ENCRYPTION_KEY)
        encrypted_text = cipher_suite.encrypt(password.encode())
        return encrypted_text.decode()

    def decrypt_password(self):
        cipher_suite = Fernet(settings.PASSWORD_ENCRYPTION_KEY)
        decrypted_text = cipher_suite.decrypt(self.website_password.encode())
        return decrypted_text.decode()

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
