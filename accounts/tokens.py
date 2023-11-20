# accounts/tokens.py
from rest_framework_simplejwt.tokens import AccessToken, RefreshToken


class CustomAccessToken(AccessToken):
    @classmethod
    def for_user(cls, user):
        token = super().for_user(user)

        # Add custom claims
        token["iss"] = "YourIssuer"
        token["custom_claim"] = "custom_value"

        return token


class CustomRefreshToken(RefreshToken):
    @classmethod
    def for_user(cls, user):
        token = super().for_user(user)

        return token
