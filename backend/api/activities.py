from flask import Blueprint, jsonify, request, g
from datetime import date, timedelta
from core.auth import token_required
from api.athletes import get_user_client

activities_api = Blueprint('activities_api', __name__)

@activities_api.route('/activities', methods=['GET'])
@token_required
def get_activities():
    try:
        client = get_user_client()
        athlete_id = request.args.get('athlete_id')
        today = date.today()
        oldest = request.args.get('oldest', (today - timedelta(days=30)).isoformat())
        newest = request.args.get('newest', today.isoformat())
        
        if not athlete_id:
            return jsonify({"error": "Se requiere athlete_id"}), 400
        
        data = client.get_activities(athlete_id, oldest, newest)
        if isinstance(data, tuple):
            return jsonify(data[0]), data[1]
        return jsonify(data)
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@activities_api.route('/events', methods=['GET'])
@token_required
def get_events():
    """Obtiene los entrenamientos programados de un atleta."""
    try:
        client = get_user_client()
        athlete_id = request.args.get('athlete_id')
        today = date.today()
        oldest = request.args.get('oldest', today.isoformat())
        newest = request.args.get('newest', (today + timedelta(days=30)).isoformat())
        category = request.args.get('category', 'WORKOUT')
        
        if not athlete_id:
            return jsonify({"error": "Se requiere athlete_id"}), 400
        
        data = client.get_events(athlete_id, oldest, newest, category)
        if isinstance(data, tuple):
            return jsonify(data[0]), data[1]
        return jsonify(data)
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@activities_api.route('/power-curves', methods=['GET'])
@token_required
def get_power_curves():
    """Obtiene las curvas de potencia de un atleta."""
    try:
        client = get_user_client()
        athlete_id = request.args.get('athlete_id')
        activity_type = request.args.get('type', 'Ride')
        curves = request.args.get('curves', '90d')
        include_ranks = request.args.get('includeRanks', 'true').lower() == 'true'
        sub_max_efforts = int(request.args.get('subMaxEfforts', 3))
        
        if not athlete_id:
            return jsonify({"error": "Se requiere athlete_id"}), 400
        
        data = client.get_power_curves(athlete_id, activity_type, curves, include_ranks, sub_max_efforts)
        if isinstance(data, tuple):
            return jsonify(data[0]), data[1]
        return jsonify(data)
    except Exception as e:
        return jsonify({"error": str(e)}), 400
