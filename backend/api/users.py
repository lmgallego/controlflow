from flask import Blueprint, jsonify, request, g
from firebase_admin import firestore
from core.firebase_admin import db
from core.security import encrypt_data
from core.auth import token_required

users_api = Blueprint('users_api', __name__)

@users_api.route('/credentials', methods=['POST'])
@token_required
def save_credentials():
    try:
        data = request.get_json()
        coach_id = data['coachId']
        api_key = data['apiKey']
        user_id = g.user_id
        if not coach_id or not api_key:
            return jsonify({"error": "coachId y apiKey son requeridos"}), 400
        encrypted_key = encrypt_data(api_key)
        user_doc_ref = db.collection('users').document(user_id)
        user_doc_ref.set({
            'intervals_coach_id': coach_id,
            'intervals_api_key_encrypted': encrypted_key,
            'created_at': firestore.SERVER_TIMESTAMP
        }, merge=True)
        return jsonify({"success": True, "message": "Credenciales guardadas."}), 201
    except Exception as e:
        return jsonify({"error": f"Error al guardar credenciales: {str(e)}"}), 500