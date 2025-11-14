import os
import sys
# --- INICIO DE LA SOLUCIÓN ---
# Añade la carpeta 'backend' (donde está este archivo) al path de Python.
# Esto le permite encontrar 'core' y 'api' como si fueran librerías.
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))
# --- FIN DE LA SOLUCIÓN ---

from flask import Flask
from flask_cors import CORS
from config import Config
from api.athletes import athletes_api
from api.wellness import wellness_api
from api.users import users_api
import core.firebase_admin # Importar esto inicializa la app de Firebase

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    CORS(app, resources={r"/api/*": {"origins": "*"}})

    app.register_blueprint(users_api, url_prefix='/api/v1/users')
    app.register_blueprint(athletes_api, url_prefix='/api/v1')
    app.register_blueprint(wellness_api, url_prefix='/api/v1')
    
    @app.route('/')
    def health_check():
        return "El servidor del backend está activo."

    return app

if __name__ == '__main__':
    app = create_app()
    app.run(host='0.0.0.0', port=5000, debug=True)