#!/usr/bin/env python
"""Script para listar todos los usuarios de Firebase."""
import sys
import os

# Añadir el directorio backend al path
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from core.firebase_admin import firebase_auth

print("=" * 60)
print("USUARIOS EN FIREBASE AUTHENTICATION")
print("=" * 60)

# Listar todos los usuarios
page = firebase_auth.list_users()
users_found = False

while page:
    for user in page.users:
        users_found = True
        print(f"\nUID: {user.uid}")
        print(f"Email: {user.email}")
        print(f"Email verificado: {user.email_verified}")
        print(f"Deshabilitado: {user.disabled}")
        print(f"Proveedor: {[p.provider_id for p in user.provider_data]}")
    
    # Obtener la siguiente página
    page = page.get_next_page()

if not users_found:
    print("\n⚠ No se encontraron usuarios en Firebase Authentication")
    print("\nEsto puede significar que:")
    print("  1. No hay usuarios creados aún")
    print("  2. El método de autenticación Email/Password no está habilitado")
    print("\nPara habilitar Email/Password:")
    print("  1. Ve a Firebase Console: https://console.firebase.google.com")
    print("  2. Selecciona tu proyecto: controlflow-pro")
    print("  3. Ve a Authentication → Sign-in method")
    print("  4. Habilita 'Email/Password'")

print("\n" + "=" * 60)
