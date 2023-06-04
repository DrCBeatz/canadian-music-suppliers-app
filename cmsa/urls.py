from django.urls import path
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import HomePageView, VendorViewSet, SupplierViewSet, CategoryViewSet

router = DefaultRouter()
router.register(r"vendors", VendorViewSet)
router.register(r"suppliers", SupplierViewSet)
router.register(r"categories", CategoryViewSet)

urlpatterns = [
    path("", include(router.urls)),
    path("home/", HomePageView.as_view(), name="home"),
]
