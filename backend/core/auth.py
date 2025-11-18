from functools import wraps
from flask import request, jsonify, g
from core.firebase_admin import firebase_auth
import firebase_admin.exceptions

def token_required(f):
    """
    Decorador para verificar el Token JWT de Firebase en el header 'Authorization'.
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        token = None
        auth_header = request.headers.get('Authorization')
        
        if auth_header and auth_header.startswith('Bearer '):
            # Espera un formato "Bearer <token>"
            token = auth_header.split(' ')[1]

        if not token:
            return jsonify({"error": "Token de autenticación faltante"}), 401

        try:
            # Verificar el token con Firebase
            # check_revoked=False para evitar llamadas adicionales a Firebase
            # Permitir un margen de 60 segundos (máximo permitido) para diferencias de reloj del sistema
            decoded_token = firebase_auth.verify_id_token(token, check_revoked=False, clock_skew_seconds=60)
            
            # Almacena el ID del usuario (uid) en el contexto global 'g' de Flask
            g.user_id = decoded_token['uid']
            
        except ValueError as e:
            # ValueError se lanza cuando el token es inválido
            return jsonify({"error": "Token inválido"}), 401
        except firebase_admin.exceptions.InvalidArgumentError as e:
            return jsonify({"error": "Token inválido"}), 401
        except Exception as e:
            return jsonify({"error": f"Error de autenticación: {str(e)}"}), 401

        return f(*args, **kwargs)
    return decorated_function