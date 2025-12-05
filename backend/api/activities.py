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

@activities_api.route('/hr-curves', methods=['GET'])
@token_required
def get_hr_curves():
    """Obtiene las curvas de frecuencia cardíaca de un atleta."""
    try:
        client = get_user_client()
        athlete_id = request.args.get('athlete_id')
        activity_type = request.args.get('type', 'Ride')
        curves = request.args.get('curves', '90d')
        sub_max_efforts = int(request.args.get('subMaxEfforts', 0))
        
        if not athlete_id:
            return jsonify({"error": "Se requiere athlete_id"}), 400
        
        data = client.get_hr_curves(athlete_id, activity_type, curves, sub_max_efforts)
        if isinstance(data, tuple):
            return jsonify(data[0]), data[1]
        return jsonify(data)
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@activities_api.route('/training-zones', methods=['GET'])
@token_required
def get_training_zones():
    """Obtiene las zonas de entrenamiento del atleta desde sportSettings."""
    try:
        client = get_user_client()
        athlete_id = request.args.get('athlete_id')
        
        if not athlete_id:
            return jsonify({"error": "Se requiere athlete_id"}), 400
        
        # Obtener perfil completo del atleta
        profile = client.get_athlete_profile(athlete_id)
        if isinstance(profile, tuple):
            return jsonify(profile[0]), profile[1]
        
        # Extraer sportSettings
        sport_settings = profile.get('sportSettings', [])
        
        # Buscar configuraciones de Ride (exterior) y VirtualRide (interior)
        zones_data = {
            'outdoor': None,  # Ride
            'indoor': None    # VirtualRide
        }
        
        for setting in sport_settings:
            sport_type = setting.get('types', [])
            
            if 'Ride' in sport_type:
                zones_data['outdoor'] = {
                    'ftp': setting.get('ftp'),
                    'w_prime': setting.get('w_prime'),
                    'p_max': setting.get('p_max'),
                    'power_zones': setting.get('power_zones', []),
                    'power_zone_names': setting.get('power_zone_names', []),
                    'lthr': setting.get('lthr'),
                    'max_hr': setting.get('max_hr'),
                    'hr_zones': setting.get('hr_zones', []),
                    'hr_zone_names': setting.get('hr_zone_names', [])
                }
            
            if 'VirtualRide' in sport_type:
                zones_data['indoor'] = {
                    'ftp': setting.get('indoor_ftp') or setting.get('ftp'),
                    'w_prime': setting.get('w_prime'),
                    'p_max': setting.get('p_max'),
                    'power_zones': setting.get('power_zones', []),
                    'power_zone_names': setting.get('power_zone_names', []),
                    'lthr': setting.get('lthr'),
                    'max_hr': setting.get('max_hr'),
                    'hr_zones': setting.get('hr_zones', []),
                    'hr_zone_names': setting.get('hr_zone_names', [])
                }
        
        return jsonify(zones_data)
    except Exception as e:
        return jsonify({"error": str(e)}), 400
