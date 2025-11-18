#!/usr/bin/env python
"""Script para probar la validación de tokens de Firebase."""
import sys
import os

# Añadir el directorio backend al path
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from core.firebase_admin import firebase_auth

print("=" * 60)
print("TEST DE VALIDACIÓN DE TOKENS")
print("=" * 60)

# Generar un custom token para el usuario
email = "luisma.gallego@protonmail.com"

try:
    user = firebase_auth.get_user_by_email(email)
    print(f"\n1. Usuario encontrado: {user.uid}")
    
    # Generar un custom token
    custom_token = firebase_auth.create_custom_token(user.uid)
    print(f"\n2. Custom token generado:")
    print(f"   {custom_token.decode()[:100]}...")
    
    print(f"\n3. IMPORTANTE:")
    print(f"   - Los custom tokens NO son lo mismo que los ID tokens")
    print(f"   - El frontend debe usar signInWithCustomToken() con este token")
    print(f"   - Luego obtener el ID token con user.getIdToken()")
    print(f"   - El ID token es el que se envía al backend")
    
    print(f"\n4. El problema actual:")
    print(f"   - El frontend está enviando un ID token")
    print(f"   - El backend debe verificarlo con verify_id_token()")
    print(f"   - Vamos a verificar que la configuración sea correcta")
    
    # Verificar la configuración
    import json
    from config import Config
    
    with open(Config.GOOGLE_APPLICATION_CREDENTIALS, 'r') as f:
        creds = json.load(f)
        print(f"\n5. Configuración del backend:")
        print(f"   Project ID: {creds.get('project_id')}")
        print(f"   Client Email: {creds.get('client_email')}")
    
    print(f"\n6. Configuración del frontend:")
    print(f"   Project ID: controlflow-pro (verificar en firebase-init.js)")
    
    if creds.get('project_id') == 'controlflow-pro':
        print(f"\n✓ Los proyectos coinciden!")
    else:
        print(f"\n✗ ERROR: Los proyectos NO coinciden!")
        print(f"   Backend: {creds.get('project_id')}")
        print(f"   Frontend: controlflow-pro")
    
except Exception as e:
    print(f"\n✗ Error: {e}")
    import traceback
    traceback.print_exc()

print("\n" + "=" * 60)
