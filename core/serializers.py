# core/serializers.py

from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from accounts.tokens import CustomAccessToken, CustomRefreshToken


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        # Call the original validate method to check user credentials and get default token data
        data = super().validate(attrs)

        # The user can now be accessed with self.user after the original validation
        user = self.user

        # Explicitly create a custom access token and refresh token
        custom_access_token = CustomAccessToken.for_user(user)
        custom_refresh_token = CustomRefreshToken.for_user(user)

        # Replace the original tokens with the custom ones
        data["access"] = str(custom_access_token)
        data["refresh"] = str(custom_refresh_token)

        return data
