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

logger = logging.getLogger(__name__)


class ProtectedTestView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response({"message": "This is a protected endpoint"})


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data)

        try:
            serializer.is_valid(raise_exception=True)
        except TokenError as e:
            raise InvalidToken(e.args[0])

        data = serializer.validated_data
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

    except Exception as e:
        logger.error(f"Error during logout: {e}")
        raise e

    response = JsonResponse({"detail": "Logout successful"})
    response.delete_cookie("access_token")
    response.delete_cookie("refresh_token")
    return response
