# Guía de Despliegue - ControlFlow

## Arquitectura del Proyecto

| Componente | Tecnología | Archivos |
|------------|------------|----------|
| **Backend** | Flask (Python) | `backend/app.py` |
| **Frontend** | HTML/JS estático | `frontend/`, `landing/` |
| **Auth** | Firebase Auth | `serviceAccountKey.json` |
| **DB** | Firebase Firestore | (credenciales de usuario) |

---

## Plataforma Elegida: Render

### Estructura de Despliegue

1. **Backend**: Web Service (Flask/Python)
2. **Frontend**: Static Site (HTML/JS/CSS)

---

## Pasos para Desplegar en Render

### 1. Preparar el Backend

#### Agregar `gunicorn` a `requirements.txt`:
```
flask
requests
python-dotenv
flask-cors
firebase-admin
cryptography
gunicorn
```

#### Crear archivo `render.yaml` (opcional, para Infrastructure as Code):
```yaml
services:
  - type: web
    name: controlflow-api
    env: python
    buildCommand: pip install -r backend/requirements.txt
    startCommand: gunicorn --chdir backend app:create_app()
    envVars:
      - key: GOOGLE_APPLICATION_CREDENTIALS
        sync: false
      - key: ENCRYPTION_KEY
        sync: false

  - type: web
    name: controlflow-frontend
    env: static
    staticPublishPath: ./frontend
    buildCommand: echo "No build needed"
```

### 2. Configurar Variables de Entorno en Render

En el dashboard de Render, configurar:

| Variable | Valor |
|----------|-------|
| `ENCRYPTION_KEY` | Tu clave Fernet generada |
| `GOOGLE_APPLICATION_CREDENTIALS_JSON` | Contenido del `serviceAccountKey.json` (como string) |

**Nota**: Para Firebase en Render, hay que modificar `config.py` para leer las credenciales desde variable de entorno en lugar de archivo.

### 3. Modificación necesaria en `backend/core/firebase_admin.py`

```python
import os
import json
import firebase_admin
from firebase_admin import credentials

# Intentar cargar desde variable de entorno primero (producción)
creds_json = os.environ.get('GOOGLE_APPLICATION_CREDENTIALS_JSON')

if creds_json:
    # Producción: credenciales desde variable de entorno
    creds_dict = json.loads(creds_json)
    cred = credentials.Certificate(creds_dict)
else:
    # Desarrollo: credenciales desde archivo
    cred = credentials.Certificate(os.environ.get('GOOGLE_APPLICATION_CREDENTIALS'))

firebase_admin.initialize_app(cred)
```

### 4. Actualizar URLs del Frontend

En `frontend/js/api.js`, cambiar la URL base:

```javascript
// Desarrollo
const API_BASE = 'http://localhost:5000/api/v1';

// Producción (cambiar por tu URL de Render)
const API_BASE = 'https://controlflow-api.onrender.com/api/v1';
```

**Recomendación**: Usar variable de entorno o detectar automáticamente:
```javascript
const API_BASE = window.location.hostname === 'localhost' 
    ? 'http://localhost:5000/api/v1'
    : 'https://controlflow-api.onrender.com/api/v1';
```

---

## Despliegue Manual en Render

### Backend (Web Service)

1. Ir a [render.com](https://render.com) y crear cuenta
2. New → Web Service
3. Conectar repositorio de GitHub
4. Configurar:
   - **Name**: `controlflow-api`
   - **Root Directory**: `backend`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn app:create_app()`
5. Agregar variables de entorno
6. Deploy

### Frontend (Static Site)

1. New → Static Site
2. Conectar mismo repositorio
3. Configurar:
   - **Name**: `controlflow-app`
   - **Root Directory**: `frontend`
   - **Build Command**: (dejar vacío)
   - **Publish Directory**: `.`
4. Deploy

### Landing Page (Static Site)

1. New → Static Site
2. Configurar:
   - **Name**: `controlflow-landing`
   - **Root Directory**: `landing`
   - **Publish Directory**: `.`
4. Deploy

---

## Costos en Render

| Servicio | Plan Gratis | Plan Starter |
|----------|-------------|--------------|
| Web Service (Backend) | Sí (sleep después de 15 min inactividad) | $7/mes |
| Static Site (Frontend) | Sí (ilimitado) | Gratis |
| Static Site (Landing) | Sí (ilimitado) | Gratis |

**Total mínimo**: Gratis (con limitaciones) o $7/mes para backend siempre activo

---

## Checklist Pre-Despliegue

- [ ] Agregar `gunicorn` a `requirements.txt`
- [ ] Modificar `firebase_admin.py` para soportar credenciales desde env var
- [ ] Actualizar URL de API en frontend
- [ ] Configurar variables de entorno en Render
- [ ] Actualizar CORS en `backend/app.py` con dominios de producción
- [ ] Probar localmente con `gunicorn`

---

## Comandos Útiles

### Probar gunicorn localmente:
```bash
cd backend
gunicorn app:create_app()
```

### Generar nueva clave de encriptación:
```bash
python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"
```

---

## Alternativas Consideradas

| Plataforma | Pros | Contras |
|------------|------|---------|
| **Railway** | Fácil, buen DX | $5/mes mínimo |
| **Vercel** | Ultra rápido para frontend | No soporta Python backend |
| **Google Cloud Run** | Integración Firebase nativa | Más complejo de configurar |
| **DigitalOcean** | Buen rendimiento | $5/mes mínimo |

---

*Última actualización: Diciembre 2024*
