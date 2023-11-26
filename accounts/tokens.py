from rest_framework_simplejwt.tokens import AccessToken, RefreshToken
import logging

# Configure logging
logger = logging.getLogger(__name__)


class CustomAccessToken(AccessToken):
    @classmethod
    def for_user(cls, user):
        logger.debug(
            "CustomAccessToken for_user method called for user: %s", user.username
        )

        # Generate the initial token
        token = super().for_user(user)
        logger.debug("Initial token generated: %s", token)

        # Add custom claims
        token["iss"] = "YourIssuer"
        token["custom_claim"] = "custom_value"
        logger.debug("Custom claims ('iss' and 'custom_claim') added to token")

        # Log the final token
        logger.debug("Final token with custom claims: %s", token)
        return token


class CustomRefreshToken(RefreshToken):
    @classmethod
    def for_user(cls, user):
        token = super().for_user(user)

        # Optionally, you can also log refresh token creation
        logger.debug("Refresh token created for user: %s", user.username)
        return token
