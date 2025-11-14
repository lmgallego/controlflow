import firebase_admin
from firebase_admin import credentials, firestore, auth
from config import Config

# Cargar las credenciales del admin SDK
cred = credentials.Certificate(Config.GOOGLE_APPLICATION_CREDENTIALS)
firebase_admin.initialize_app(cred)

# Exponer instancias de DB y Auth para usar en otros módulos
db = firestore.client()
firebase_auth = auth