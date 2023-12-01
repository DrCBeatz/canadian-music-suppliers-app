# core/urls.py

from django.contrib import admin
from django.urls import path, include
from .views import login_view, logout_view, ProtectedTestView, SetCsrfTokenView
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path("admin/", admin.site.urls),
    path("", include("cmsa.urls")),
    path("api/login/", login_view, name="login"),
    path("api/logout/", logout_view, name="logout"),
    path("api/protected/", ProtectedTestView.as_view(), name="protected_test"),
    path("set-csrf/", SetCsrfTokenView.as_view(), name="set_csrf"),
]
