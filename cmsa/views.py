from django.views.generic import TemplateView
from rest_framework import viewsets
from .models import Vendor, Supplier, Category
from .serializers import VendorSerializer, SupplierSerializer, CategorySerializer
from django.db.models import Q


class HomePageView(TemplateView):
    template_name = "home.html"


class VendorViewSet(viewsets.ModelViewSet):
    queryset = Vendor.objects.all()
    serializer_class = VendorSerializer

    def get_queryset(self):
        queryset = Vendor.objects.all()
        search_term = self.request.query_params.get("search", None)
        if search_term is not None:
            queryset = queryset.filter(
                Q(name__icontains=search_term)
                | Q(supplier__name__icontains=search_term)
                | Q(categories__name__icontains=search_term)
            ).distinct()
        return queryset


class SupplierViewSet(viewsets.ModelViewSet):
    queryset = Supplier.objects.all()
    serializer_class = SupplierSerializer


class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
