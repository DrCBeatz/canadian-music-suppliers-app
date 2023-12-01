# core/views.py

from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.response import Response
from rest_framework import status
from django.conf import settings
from rest_framework_simplejwt.exceptions import (
    InvalidToken,
    TokenError,
)
from .serializers import CustomTokenObtainPairSerializer
from django.http import JsonResponse
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.token_blacklist.models import (
    OutstandingToken,
    BlacklistedToken,
)
import logging
from django.views.decorators.csrf import csrf_exempt, csrf_protect
from django.http import HttpResponseNotAllowed
from django.middleware.csrf import get_token
from django.http import HttpResponse
from django.views.decorators.csrf import ensure_csrf_cookie
from django.utils.decorators import method_decorator
from rest_framework.views import APIView
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_protect

logger = logging.getLogger(__name__)


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


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

    @method_decorator(csrf_protect)
    def post(self, request, *args, **kwargs):
        # Log the incoming request data
        logger.debug(f"Incoming request data: {request.data}")

        serializer = self.serializer_class(data=request.data)

        try:
            serializer.is_valid(raise_exception=True)
        except TokenError as e:
            # Log the exception
            logger.error(f"Token error: {e.args[0]}")
            raise InvalidToken(e.args[0])

        data = serializer.validated_data

        # Log the response data
        logger.debug(f"Response data: {data}")

        response = Response(data, status=status.HTTP_200_OK)

        # Set JWT tokens in HttpOnly cookies
        response.set_cookie(
            key="access_token",
            value=data["access"],
            httponly=True,
            secure=not settings.DEBUG,  # Use settings.DEBUG
            samesite="Lax",
        )
        response.set_cookie(
            key="refresh_token",
            value=data["refresh"],
            httponly=True,
            secure=not settings.DEBUG,  # Use settings.DEBUG
            samesite="Lax",
        )

        return response


def logout_view(request):
    csrf_protect(request)
    # Log the request method and any CSRF token in the request
    logger.debug(f"Request method: {request.method}")
    logger.debug(f"CSRF token from cookie: {request.COOKIES.get('csrftoken')}")

    # Generate and log a CSRF token (for testing and comparison)
    csrf_token_generated = get_token(request)
    logger.debug(f"Generated CSRF token: {csrf_token_generated}")

    # Ensure the request is a POST request
    if request.method != "POST":
        return HttpResponseNotAllowed(["POST"])

    try:
        refresh_token = request.COOKIES.get("refresh_token")
        logger.debug(f"Attempting logout with Refresh Token: {refresh_token}")
        token = RefreshToken(refresh_token)
        logger.debug(f"Decoded Token: {token}")

        outstanding_token = OutstandingToken.objects.filter(jti=token["jti"]).first()
        if outstanding_token:
            BlacklistedToken.objects.create(token=outstanding_token)
            logger.debug(f"Token blacklisted: {outstanding_token}")
        else:
            logger.debug("No outstanding token found for blacklisting")
        
        blacklisted_tokens = BlacklistedToken.objects.all()
        logger.debug(f"Current Blacklisted Tokens: {[token.token.jti for token in blacklisted_tokens]}")

    except Exception as e:
        logger.error(f"Error during logout: {e}")
        raise e

    response = JsonResponse({"detail": "Logout successful"})
    response.delete_cookie("access_token")
    response.delete_cookie("refresh_token")
    return response


@method_decorator(ensure_csrf_cookie, name="dispatch")
class SetCsrfTokenView(APIView):
    def get(self, request, *arts, **kwargs):
        return HttpResponse("CSRF cookie set")
