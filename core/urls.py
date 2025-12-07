# core/urls.py

from django.contrib import admin
from django.urls import path, include, re_path
from .views import login_view, logout_view, ProtectedTestView, SetCsrfTokenView, get_csrf, healthz
from rest_framework_simplejwt.views import TokenRefreshView
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularSwaggerView,
    SpectacularRedocView,
)

urlpatterns = [
    path("admin/", admin.site.urls),
    path("", include("cmsa.urls")),
    path("api/login/", login_view, name="login"),
    path("api/logout/", logout_view, name="logout"),
    path("api/protected/", ProtectedTestView.as_view(), name="protected_test"),
    path("set-csrf/", SetCsrfTokenView.as_view(), name="set_csrf"),
    path("get-csrf/", get_csrf, name="get_csrf"),
    re_path(r"^healthz/?$", healthz, name="healthz"),

    # --- OpenAPI schema & docs ---
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path("api/schema/swagger-ui/",
         SpectacularSwaggerView.as_view(url_name="schema"), name="swagger-ui"),
    path("api/schema/redoc/",
         SpectacularRedocView.as_view(url_name="schema"), name="redoc"),
]
