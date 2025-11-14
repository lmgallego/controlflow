import os
from dotenv import load_dotenv

# Carga las variables del archivo .env
load_dotenv()

class Config:
    """Configuración de la aplicación."""
    
    # Clave de Firebase Admin
    GOOGLE_APPLICATION_CREDENTIALS = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")
    
    # Clave para cifrar las API Keys
    ENCRYPTION_KEY = os.getenv("ENCRYPTION_KEY")

    if not GOOGLE_APPLICATION_CREDENTIALS:
        raise ValueError("GOOGLE_APPLICATION_CREDENTIALS no está definida en el archivo .env")
        
    if not ENCRYPTION_KEY:
        raise ValueError("ENCRYPTION_KEY no está definida en el archivo .env")
