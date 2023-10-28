from django.db import models


class Supplier(models.Model):
    name = models.CharField(max_length=200)

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
