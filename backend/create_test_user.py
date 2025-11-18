#!/usr/bin/env python
"""Script para crear un usuario de prueba y generar un custom token."""
import sys
import os

# Añadir el directorio backend al path
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from core.firebase_admin import firebase_auth

print("=" * 60)
print("CREAR USUARIO DE PRUEBA EN FIREBASE")
print("=" * 60)

# Email de prueba
test_email = "test@controlflow.com"
test_uid = "test-user-123"

print(f"\n1. Creando/actualizando usuario de prueba...")
print(f"   Email: {test_email}")
print(f"   UID: {test_uid}")

try:
    # Intentar obtener el usuario
    user = firebase_auth.get_user_by_email(test_email)
    print(f"   ✓ Usuario ya existe: {user.uid}")
except firebase_auth.UserNotFoundError:
    # Crear el usuario si no existe
    user = firebase_auth.create_user(
        uid=test_uid,
        email=test_email,
        password="test123456"
    )
    print(f"   ✓ Usuario creado: {user.uid}")

# Generar un custom token
print(f"\n2. Generando custom token...")
custom_token = firebase_auth.create_custom_token(user.uid)
print(f"   ✓ Token generado (primeros 50 caracteres):")
print(f"   {custom_token.decode()[:50]}...")

print("\n" + "=" * 60)
print("INSTRUCCIONES:")
print("  1. Usa este email y contraseña para iniciar sesión:")
print(f"     Email: {test_email}")
print("     Contraseña: test123456")
print("  2. O usa el custom token en el frontend")
print("=" * 60)
