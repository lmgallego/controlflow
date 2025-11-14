from flask import Blueprint, jsonify, request, g
from datetime import date, timedelta
from core.auth import token_required
from api.athletes import get_user_client # Esta está bien

wellness_api = Blueprint('wellness_api', __name__)

@wellness_api.route('/wellness', methods=['GET'])
@token_required
def get_wellness():
    try:
        client = get_user_client()
        athlete_id = request.args.get('athlete_id')
        today = date.today()
        oldest = request.args.get('oldest', (today - timedelta(days=7)).isoformat())
        newest = request.args.get('newest', today.isoformat())
        if not athlete_id:
            return jsonify({"error": "Se requiere athlete_id"}), 400
        data = client.get_wellness(athlete_id, oldest, newest)
        if isinstance(data, tuple): 
            return jsonify(data[0]), data[1]
        return jsonify(data)
    except Exception as e:
        return jsonify({"error": str(e)}), 400
