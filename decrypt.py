# decrypt.py

import sys
from cryptography.fernet import Fernet


def decrypt_password(encrypted_password, key):
    cipher_suite = Fernet(key)
    decrypted_text = cipher_suite.decrypt(encrypted_password.encode()).decode()
    return decrypted_text


if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python decrypt.py <encrypted_password> <encryption_key>")
        sys.exit(1)

    encrypted_password = sys.argv[1]
    key = sys.argv[2]

    decrypted_password = decrypt_password(encrypted_password, key)
    print(f"Decrypted Password: {decrypted_password}")
