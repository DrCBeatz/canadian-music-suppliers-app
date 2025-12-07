# cmsa/views.py

from django.views.generic import TemplateView
from rest_framework import viewsets
from .models import Vendor, Supplier, Category
from .serializers import (
    VendorSerializer,
    VendorPublicSerializer,
    SupplierSerializer,
    SupplierPublicSerializer,
    CategorySerializer,
)
from django.db.models import Q
from django.shortcuts import render
from django.views.decorators.csrf import ensure_csrf_cookie
from drf_spectacular.utils import extend_schema, extend_schema_view, OpenApiParameter


@ensure_csrf_cookie
def frontend(request):
    return render(request, "frontend/index.html")

@extend_schema_view(
    list=extend_schema(
        tags=["vendors"],
        summary="List vendors",
        parameters=[
            OpenApiParameter(
                name="search",
                description="Search vendors, suppliers, or categories",
                required=False,
                type=str,
                location=OpenApiParameter.QUERY,
            )
        ],
    ),
    retrieve=extend_schema(tags=["vendors"], summary="Retrieve a vendor"),
)
class VendorViewSet(viewsets.ModelViewSet):
    queryset = Vendor.objects.all()

    def get_queryset(self):
        queryset = Vendor.objects.all()
        search_term = self.request.query_params.get("search", None)
        if search_term is not None:
            queryset = queryset.filter(
                Q(name__icontains=search_term)
                | Q(suppliers__name__icontains=search_term)
                | Q(categories__name__icontains=search_term)
            ).distinct()
        return queryset

    def get_serializer_class(self):
        if self.request.user.is_authenticated:
            return VendorSerializer
        return VendorPublicSerializer


class SupplierViewSet(viewsets.ModelViewSet):
    queryset = Supplier.objects.all()

    def get_serializer_class(self):
        if self.request.user.is_authenticated:
            return SupplierSerializer
        return SupplierPublicSerializer


class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer

