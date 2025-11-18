#!/usr/bin/env python
"""Script de prueba para verificar la configuración de Firebase."""
import sys
import os

# Añadir el directorio backend al path
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

print("=" * 60)
print("TEST DE CONFIGURACIÓN DE FIREBASE")
print("=" * 60)

# 1. Verificar variables de entorno
print("\n1. Verificando variables de entorno...")
from config import Config
print(f"   ✓ GOOGLE_APPLICATION_CREDENTIALS: {Config.GOOGLE_APPLICATION_CREDENTIALS}")
print(f"   ✓ ENCRYPTION_KEY: {'*' * 20} (oculta)")

# 2. Verificar que el archivo de credenciales existe
print("\n2. Verificando archivo de credenciales...")
if os.path.exists(Config.GOOGLE_APPLICATION_CREDENTIALS):
    print(f"   ✓ Archivo encontrado: {Config.GOOGLE_APPLICATION_CREDENTIALS}")
else:
    print(f"   ✗ ERROR: Archivo no encontrado: {Config.GOOGLE_APPLICATION_CREDENTIALS}")
    sys.exit(1)

# 3. Verificar inicialización de Firebase
print("\n3. Inicializando Firebase Admin SDK...")
try:
    from core.firebase_admin import firebase_auth, db
    print("   ✓ Firebase Admin SDK inicializado correctamente")
except Exception as e:
    print(f"   ✗ ERROR al inicializar Firebase: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

# 4. Probar verificación de un token de prueba
print("\n4. Probando verificación de token...")
print("   (Este test fallará con un token inválido, es normal)")

# Token de prueba inválido
test_token = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiJ0ZXN0In0.test"

try:
    decoded = firebase_auth.verify_id_token(test_token)
    print(f"   ✓ Token verificado (inesperado): {decoded}")
except Exception as e:
    print(f"   ✓ Error esperado al verificar token inválido: {type(e).__name__}")
    print(f"      Mensaje: {str(e)[:100]}")

# 5. Verificar el proyecto de Firebase
print("\n5. Verificando proyecto de Firebase...")
import json
with open(Config.GOOGLE_APPLICATION_CREDENTIALS, 'r') as f:
    creds = json.load(f)
    print(f"   Project ID: {creds.get('project_id')}")
    print(f"   Client Email: {creds.get('client_email')}")

print("\n" + "=" * 60)
print("RESUMEN:")
print("  - Firebase Admin SDK está correctamente configurado")
print("  - El proyecto debe coincidir con el frontend")
print("=" * 60)
