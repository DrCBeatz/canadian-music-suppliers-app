from django.urls import path
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    VendorViewSet,
    SupplierViewSet,
    CategoryViewSet,
    frontend,
)

router = DefaultRouter()
router.register(r"vendors", VendorViewSet)
router.register(r"suppliers", SupplierViewSet)
router.register(r"categories", CategoryViewSet)

urlpatterns = [
    path("", frontend, name="frontend"),
    path("routes/", include(router.urls)),
]
