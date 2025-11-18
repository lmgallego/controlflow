#!/usr/bin/env python
"""Script para actualizar el usuario de prueba con contraseña válida."""
import sys
import os

# Añadir el directorio backend al path
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from core.firebase_admin import firebase_auth

print("=" * 60)
print("ACTUALIZAR USUARIO DE PRUEBA")
print("=" * 60)

test_email = "test@controlflow.com"
new_password = "test123456"

try:
    # Obtener el usuario por email
    user = firebase_auth.get_user_by_email(test_email)
    print(f"\n✓ Usuario encontrado: {user.uid}")
    
    # Actualizar la contraseña
    firebase_auth.update_user(
        user.uid,
        password=new_password,
        email_verified=True
    )
    print(f"✓ Contraseña actualizada correctamente")
    print(f"\nCredenciales de acceso:")
    print(f"  Email: {test_email}")
    print(f"  Contraseña: {new_password}")
    
except firebase_auth.UserNotFoundError:
    print(f"\n✗ Usuario no encontrado. Creando nuevo usuario...")
    user = firebase_auth.create_user(
        email=test_email,
        password=new_password,
        email_verified=True
    )
    print(f"✓ Usuario creado: {user.uid}")
    print(f"\nCredenciales de acceso:")
    print(f"  Email: {test_email}")
    print(f"  Contraseña: {new_password}")

print("\n" + "=" * 60)
