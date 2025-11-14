from flask import Blueprint, jsonify, g
from core.firebase_admin import db
from core.security import decrypt_data
from core.intervals_client import IntervalsClient
from core.auth import token_required

athletes_api = Blueprint('athletes_api', __name__)

def get_user_client():
    user_id = g.user_id 
    user_doc = db.collection('users').document(user_id).get()
    if not user_doc.exists:
        raise Exception("Credenciales de usuario no encontradas. Por favor, configúralas.")
    user_data = user_doc.to_dict()
    coach_id = user_data['intervals_coach_id']
    encrypted_api_key = user_data['intervals_api_key_encrypted']
    api_key = decrypt_data(encrypted_api_key)
    client = IntervalsClient(coach_id, api_key)
    return client

@athletes_api.route('/athletes', methods=['GET'])
@token_required
def get_athletes():
    try:
        client = get_user_client()
        summary_data = client.get_athlete_summary()
        if isinstance(summary_data, tuple):
            return jsonify(summary_data[0]), summary_data[1]
        athletes_list = [
            {"id": athlete["athlete_id"], "name": athlete["athlete_name"]}
            for athlete in summary_data
        ]
        return jsonify(athletes_list)
    except Exception as e:
        return jsonify({"error": str(e)}), 400
