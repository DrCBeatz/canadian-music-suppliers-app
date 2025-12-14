# cmsa/views.py

from rest_framework import viewsets
from django.db.models import Q, Prefetch
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
from .pagination import OptionalPageNumberPagination

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
            ),
            OpenApiParameter(
                name="page",
                description="Page number (enables pagination when provided).",
                required=False,
                type=int,
                location=OpenApiParameter.QUERY,
            ),
            OpenApiParameter(
                name="page_size",
                description="Page size (enables pagination when provided).",
                required=False,
                type=int,
                location=OpenApiParameter.QUERY,
            ),
        ],
    ),
    retrieve=extend_schema(tags=["vendors"], summary="Retrieve a vendor"),
)
class VendorViewSet(viewsets.ModelViewSet):
    pagination_class = OptionalPageNumberPagination

    queryset = Vendor.objects.prefetch_related(
        "categories",
        Prefetch(
            "suppliers",
            queryset=Supplier.objects.prefetch_related("contacts"),
        ),
    )

    def get_queryset(self):
        qs = super().get_queryset()
        search_term = self.request.query_params.get("search")

        if search_term:
            qs = qs.filter(
                Q(name__icontains=search_term)
                | Q(suppliers__name__icontains=search_term)
                | Q(categories__name__icontains=search_term)
            ).distinct()

        return qs.order_by("name")

    def get_serializer_class(self):
        return VendorSerializer if self.request.user.is_authenticated else VendorPublicSerializer


class SupplierViewSet(viewsets.ModelViewSet):
    pagination_class = OptionalPageNumberPagination
    queryset = Supplier.objects.prefetch_related("contacts")

    def get_serializer_class(self):
        return SupplierSerializer if self.request.user.is_authenticated else SupplierPublicSerializer


class CategoryViewSet(viewsets.ModelViewSet):
    pagination_class = OptionalPageNumberPagination
    queryset = Category.objects.all()
    serializer_class = CategorySerializer