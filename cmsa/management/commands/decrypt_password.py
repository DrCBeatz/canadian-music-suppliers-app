from django.core.management.base import BaseCommand, CommandError
from cryptography.fernet import Fernet
from django.conf import settings


class Command(BaseCommand):
    help = "Decrypts an encrypted password"

    def add_arguments(self, parser):
        parser.add_argument(
            "encrypted_password", type=str, help="The encrypted password"
        )

    def handle(self, *args, **options):
        encrypted_password = options["encrypted_password"]
        key = settings.PASSWORD_ENCRYPTION_KEY

        cipher_suite = Fernet(key)
        try:
            decrypted_text = cipher_suite.decrypt(encrypted_password.encode()).decode()
            self.stdout.write(
                self.style.SUCCESS(f"Decrypted password: {decrypted_text}")
            )
        except Exception as e:
            raise CommandError(f"Could not decrypt password: {e}")
