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

    def get_wellness(self, athlete_id, oldest, newest):
        """ Obtiene datos de bienestar para un atleta. """
        #
        endpoint = f"/athlete/{athlete_id}/wellness"
        params = {
            "oldest": oldest,
            "newest": newest,
            "fields": "id,hrv,restingHR,sleepSecs,sleepScore,soreness,fatigue"
        }
        return self._get(endpoint, params)

    def get_activities(self, athlete_id, oldest, newest):
        """ Obtiene las actividades de un atleta. """
        #
        endpoint = f"/athlete/{athlete_id}/activities"
        params = {"oldest": oldest, "newest": newest}
        return self._get(endpoint, params)

    def get_power_curves(self, athlete_id, type="Ride", curves="42d,1y"):
        """ Obtiene curvas de potencia. """
        #
        endpoint = f"/athlete/{athlete_id}/power-curves"
        params = {"type": type, "curves": curves}
        return self._get(endpoint, params)
