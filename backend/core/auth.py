from functools import wraps
from flask import request, jsonify, g
from core.firebase_admin import firebase_auth

def token_required(f):
    """
    Decorador para verificar el Token JWT de Firebase en el header 'Authorization'.
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        token = None
        if 'authorization' in request.headers:
            # Espera un formato "Bearer <token>"
            token = request.headers['authorization'].split(' ')[1]

        if not token:
            return jsonify({"error": "Token de autenticación faltante"}), 401

        try:
            # Verificar el token con Firebase
            decoded_token = firebase_auth.verify_id_token(token)
            
            # Almacena el ID del usuario (uid) en el contexto global 'g' de Flask
            g.user_id = decoded_token['uid']
            
        except firebase_auth.InvalidIdTokenError:
            return jsonify({"error": "Token inválido"}), 401
        except Exception as e:
            return jsonify({"error": f"Error de autenticación: {str(e)}"}), 401

        return f(*args, **kwargs)
    return decorated_function