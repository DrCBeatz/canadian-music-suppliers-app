# core/urls.py

from django.contrib import admin
from django.urls import path, include
from .views import CustomTokenObtainPairView, logout_view, ProtectedTestView
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path("admin/", admin.site.urls),
    path("", include("cmsa.urls")),
    path("api/token/", CustomTokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("api/logout/", logout_view, name="logout"),
    path("api/protected-test/", ProtectedTestView.as_view(), name="protected_test"),
]
