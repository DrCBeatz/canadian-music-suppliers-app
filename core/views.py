# core/views.py

from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.response import Response
from rest_framework import status
from django.conf import settings
import pytest
from django.http import JsonResponse
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated

import logging
from django.views.decorators.csrf import csrf_exempt, csrf_protect
from django.http import HttpResponseNotAllowed
from django.middleware.csrf import get_token
from django.http import HttpResponse
from django.views.decorators.csrf import ensure_csrf_cookie
from django.views.decorators.http import require_http_methods
from django.utils.decorators import method_decorator
from rest_framework.views import APIView
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_protect
from django.contrib.auth import authenticate, login
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.contrib.auth import logout


logger = logging.getLogger(__name__)


@api_view(["POST"])
@csrf_protect
def login_view(request):
    logger.debug(f"Request Data: {request.data}")
    logger.debug(f"Request Headers: {request.headers}")
    logger.debug(f"Origin Header: {request.headers.get('Origin')}")

    # Log CSRF token details
    csrf_token = request.META.get("CSRF_COOKIE")
    logger.debug(f"CSRF Token from request: {csrf_token}")

    # Existing code for username, password retrieval and authentication
    username = request.data.get("username")
    password = request.data.get("password")
    user = authenticate(request, username=username, password=password)

    csrf_token = request.META.get("CSRF_COOKIE")
    logger.debug(f"CSRF Token from request: {csrf_token}")

    if user is not None:
        login(request, user)
        logger.debug(f"User {username} logged in successfully")
        return Response({"detail": "Login successful"}, status=status.HTTP_200_OK)
    else:
        logger.warning(f"Login failed for user {username}")
        return Response(
            {"detail": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED
        )


class ProtectedTestView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Log the request details
        user = request.user
        logger.debug(f"Protected endpoint accessed by user: {user.username}")

        # Log the authoization header (token)
        auth_header = request.META.get("HTTP_AUTHORIZATION")
        if auth_header:
            logger.debug(f"Authorization header: {auth_header}")

        return Response({"message": "This is a protected endpoint"})


@api_view(["POST"])
def logout_view(request):
    # log the CSRF token from the request
    csrf_token = request.META.get("CSRF_COOKIE")
    logger.debug(f"CSRF token from request: {csrf_token}")
    logout(request)
    return Response({"detail": "Logout successful"})


@method_decorator(ensure_csrf_cookie, name="dispatch")
class SetCsrfTokenView(APIView):
    def get(self, request, *arts, **kwargs):
        return HttpResponse("CSRF cookie set")

def get_csrf(request):
    token = get_token(request)
    return JsonResponse({"csrfToken": token})

@require_http_methods(["GET"])
def healthz(request):
    """
    Liveness probe: just proves the app can serve requests.
    Returns 200 with a tiny JSON payload.
    """
    return JsonResponse({"status": "ok"})