from cryptography.fernet import Fernet
from config import Config

# Inicializar el motor de cifrado con tu clave secreta
cipher_suite = Fernet(Config.ENCRYPTION_KEY.encode())

def encrypt_data(data: str) -> str:
    """Cifra un string y lo devuelve como string."""
    encrypted_bytes = cipher_suite.encrypt(data.encode())
    return encrypted_bytes.decode()

def decrypt_data(encrypted_data: str) -> str:
    """Descifra un string y lo devuelve como string."""
    decrypted_bytes = cipher_suite.decrypt(encrypted_data.encode())
    return decrypted_bytes.decode()