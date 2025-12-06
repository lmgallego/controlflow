import requests
from requests.auth import HTTPBasicAuth
from datetime import date, timedelta

class IntervalsClient:
    """
    Cliente centralizado para interactuar con la API de Intervals.icu.
    Maneja la autenticación y la construcción de peticiones.
    """
    def __init__(self, coach_id, api_key):
        self.base_url = "https://intervals.icu/api/v1"
        self.coach_id = coach_id
        # El nombre de usuario es la cadena literal "API_KEY"
        self.auth = HTTPBasicAuth("API_KEY", api_key)
        self.default_timeout = 10 # 10 segundos

    def _get(self, endpoint, params=None):
        """Método helper para peticiones GET."""
        try:
            response = requests.get(
                f"{self.base_url}{endpoint}",
                auth=self.auth,
                params=params,
                timeout=self.default_timeout
            )
            response.raise_for_status() # Lanza error en códigos 4xx o 5xx
            return response.json()
        except requests.exceptions.RequestException as e:
            print(f"Error en API de Intervals: {e}")
            return {"error": str(e)}, 500

    def get_athlete_summary(self):
        """ Obtiene el resumen de atletas seguidos por el coach. """
        #
        endpoint = f"/athlete/{self.coach_id}/athlete-summary"
        
        today = date.today()
        start = (today - timedelta(days=7)).isoformat()
        end = today.isoformat()
        params = {"start": start, "end": end}
        
        return self._get(endpoint, params)
    
    def get_athlete_profile(self, athlete_id):
        """ Obtiene el perfil completo de un atleta. """
        #
        endpoint = f"/athlete/{athlete_id}"
        return self._get(endpoint)

    def get_wellness(self, athlete_id, oldest, newest):
        """ Obtiene datos de bienestar para un atleta. """
        #
        endpoint = f"/athlete/{athlete_id}/wellness"
        params = {
            "oldest": oldest,
            "newest": newest,
            "fields": "id,hrv,restingHR,sleepSecs,sleepScore,soreness,fatigue,ctl,atl,tsb,rampRate,vo2max"
        }
        return self._get(endpoint, params)

    def get_activities(self, athlete_id, oldest, newest):
        """ Obtiene las actividades de un atleta. """
        #
        endpoint = f"/athlete/{athlete_id}/activities"
        params = {"oldest": oldest, "newest": newest}
        return self._get(endpoint, params)

    def get_power_curves(self, athlete_id, type="Ride", curves="90d", include_ranks=True, sub_max_efforts=3):
        """ 
        Obtiene curvas de potencia.
        
        Args:
            athlete_id: ID del atleta
            type: Tipo de actividad (Ride, Run, etc.)
            curves: Períodos de curvas (90d, 1y, all, etc.)
            include_ranks: Incluir rankings
            sub_max_efforts: Número de esfuerzos submáximos
        """
        endpoint = f"/athlete/{athlete_id}/power-curves"
        params = {
            "type": type, 
            "curves": curves,
            "includeRanks": str(include_ranks).lower(),
            "subMaxEfforts": sub_max_efforts
        }
        return self._get(endpoint, params)

    def get_events(self, athlete_id, oldest, newest, category="WORKOUT"):
        """ Obtiene eventos/entrenamientos programados de un atleta. """
        endpoint = f"/athlete/{athlete_id}/events"
        params = {
            "oldest": oldest,
            "newest": newest,
            "category": category,
            "resolve": "true"
        }
        return self._get(endpoint, params)

    def get_hr_curves(self, athlete_id, type="Ride", curves="90d", sub_max_efforts=0):
        """ 
        Obtiene curvas de frecuencia cardíaca.
        
        Args:
            athlete_id: ID del atleta
            type: Tipo de actividad (Ride, Run, etc.)
            curves: Períodos de curvas (90d, 1y, all, etc.)
            sub_max_efforts: Número de esfuerzos submáximos
        """
        endpoint = f"/athlete/{athlete_id}/hr-curves"
        params = {
            "type": type, 
            "curves": curves,
            "subMaxEfforts": sub_max_efforts
        }
        return self._get(endpoint, params)

    def get_activities_zone_times(self, athlete_id, oldest, newest):
        """ 
        Obtiene actividades con tiempos en zona de potencia y FC.
        
        Args:
            athlete_id: ID del atleta
            oldest: Fecha inicio (YYYY-MM-DD)
            newest: Fecha fin (YYYY-MM-DD)
        """
        endpoint = f"/athlete/{athlete_id}/activities"
        params = {
            "oldest": oldest,
            "newest": newest
        }
        return self._get(endpoint, params)

    def get_sport_settings(self, athlete_id):
        """ 
        Obtiene la configuración de deportes del atleta (zonas, nombres, etc.).
        """
        endpoint = f"/athlete/{athlete_id}/sport-settings"
        return self._get(endpoint)
