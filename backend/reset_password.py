#!/usr/bin/env python
"""Script para restablecer la contraseña de un usuario."""
import sys
import os

# Añadir el directorio backend al path
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from core.firebase_admin import firebase_auth

print("=" * 60)
print("RESTABLECER CONTRASEÑA")
print("=" * 60)

# Usuario principal
email = "luisma.gallego@protonmail.com"
new_password = "controlflow123"

try:
    user = firebase_auth.get_user_by_email(email)
    print(f"\n✓ Usuario encontrado: {user.uid}")
    
    # Actualizar la contraseña
    firebase_auth.update_user(
        user.uid,
        password=new_password
    )
    print(f"✓ Contraseña actualizada correctamente")
    print(f"\n{'=' * 60}")
    print("NUEVAS CREDENCIALES DE ACCESO:")
    print(f"{'=' * 60}")
    print(f"  Email: {email}")
    print(f"  Contraseña: {new_password}")
    print(f"{'=' * 60}")
    print("\n⚠ IMPORTANTE: Guarda estas credenciales en un lugar seguro")
    
except Exception as e:
    print(f"\n✗ Error: {e}")

print("\n" + "=" * 60)
