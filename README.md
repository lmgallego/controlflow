# ControlFlow - Plataforma de Análisis de Rendimiento Deportivo

Plataforma web para entrenadores que integra datos de Intervals.icu con análisis avanzado de rendimiento y bienestar de atletas.

## 🚀 Inicio Rápido

### Requisitos Previos

- Python 3.8 o superior
- Cuenta de Firebase (para autenticación)
- Cuenta de Intervals.icu con API Key

### 1. Configuración Inicial

#### a) Clonar y preparar el entorno

```bash
cd ControlFlow
python -m venv venv

# En Windows:
venv\Scripts\activate

# En Linux/Mac:
source venv/bin/activate

# Instalar dependencias
pip install -r backend/requirements.txt
```

#### b) Configurar Firebase

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Ve a **Configuración del proyecto** → **Cuentas de servicio**
4. Haz clic en **"Generar nueva clave privada"**
5. Guarda el archivo JSON como `serviceAccountKey.json` en la raíz del proyecto

#### c) Configurar variables de entorno

```bash
# Copiar el archivo de ejemplo
copy .env.example .env    # Windows
cp .env.example .env      # Linux/Mac

# Editar .env y configurar:
# - GOOGLE_APPLICATION_CREDENTIALS=./serviceAccountKey.json
# - ENCRYPTION_KEY=(genera una con el comando abajo)
```

**Generar clave de encriptación:**
```bash
python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"
```

### 2. Iniciar la Aplicación

#### Opción A: Scripts automáticos (Recomendado)

**Windows:**
```bash
# En una terminal:
python -m backend.app

# En otra terminal:
python start_frontend.py
```

**Linux/Mac:**
```bash
# Puedes usar el script todo-en-uno (próximamente)
# Por ahora, usa dos terminales como en Windows
```

#### Opción B: Manual

**Terminal 1 - Backend:**
```bash
cd ControlFlow
venv\Scripts\activate  # o source venv/bin/activate
python -m backend.app
```

**Terminal 2 - Frontend:**
```bash
cd ControlFlow
python start_frontend.py
```

### 3. Acceder a la Aplicación

1. Abre tu navegador en: **http://localhost:8000/landing/login.html**
2. Crea una cuenta o inicia sesión con Firebase Authentication
3. Configura tus credenciales de Intervals.icu en el panel de Settings
4. ¡Comienza a analizar tus atletas!

## 📁 Estructura del Proyecto

```
ControlFlow/
├── backend/              # Backend Flask (API REST)
│   ├── api/             # Endpoints de la API
│   ├── core/            # Lógica de negocio
│   ├── app.py           # Aplicación Flask principal
│   ├── config.py        # Configuración
│   └── README.md        # Documentación del backend
│
├── frontend/            # Frontend (HTML, CSS, JS)
│   ├── css/            # Estilos
│   ├── js/             # JavaScript modular
│   │   ├── components/ # Componentes de UI
│   │   ├── apiService.js
│   │   ├── app.js
│   │   └── firebase-init.js
│   └── dashboard.html  # Dashboard principal
│
├── landing/            # Landing pages
│   ├── index.html     # Página principal
│   ├── login.html     # Login/Registro
│   └── pricing.html   # Precios
│
├── .env.example       # Plantilla de variables de entorno
├── .env               # Variables de entorno (no subir a git)
├── serviceAccountKey.json  # Credenciales Firebase (no subir a git)
├── start_frontend.py  # Script para iniciar servidor frontend
└── README.md          # Este archivo
```

## 🔧 Configuración de Intervals.icu

Para usar la aplicación, necesitas:

1. **Coach ID (Athlete ID):** Lo encuentras en tu perfil de Intervals.icu (formato: `i12345`)
2. **API Key:** Ve a Settings → Developer en Intervals.icu

Estas credenciales se configuran en el panel de Settings dentro de la aplicación.

## 📚 Endpoints de la API

- `GET /api/v1/athletes` - Obtener lista de atletas
- `GET /api/v1/wellness?athleteId=...&oldest=...&newest=...` - Datos de bienestar
- `GET /api/v1/activities?athleteId=...&oldest=...&newest=...` - Actividades
- `POST /api/v1/users/credentials` - Guardar credenciales de Intervals.icu

## 🛠️ Desarrollo

### Backend
```bash
# El backend corre en modo debug
# Se recarga automáticamente al hacer cambios
python -m backend.app
```

### Frontend
```bash
# Servidor simple HTTP en el puerto 8000
python start_frontend.py
```

## 🔒 Seguridad

- Las credenciales de Intervals.icu se encriptan antes de guardarse en Firebase
- La autenticación se maneja con Firebase Authentication
- Los tokens JWT se validan en cada petición al backend
- **IMPORTANTE:** Nunca subas `serviceAccountKey.json` o `.env` al repositorio

## 📝 Notas

- El backend corre en `http://localhost:5000`
- El frontend corre en `http://localhost:8000`
- Asegúrate de que ambos servidores estén corriendo para usar la aplicación
- Los datos se obtienen en tiempo real de Intervals.icu

## 🐛 Solución de Problemas

Ver [backend/README.md](backend/README.md) para más detalles sobre problemas comunes del backend.

### Error: "ModuleNotFoundError: No module named 'core.firebase_admin'"
- ✅ Ya resuelto: El archivo `firebase_admin.py` ha sido renombrado correctamente

### Error: "FileNotFoundError: serviceAccountKey.json"
- Asegúrate de haber descargado las credenciales de Firebase
- Verifica que el archivo esté en la raíz del proyecto
- Revisa que la ruta en `.env` sea correcta

### Error al conectar con el backend
- Verifica que el backend esté corriendo en `http://localhost:5000`
- Revisa que las variables de entorno estén configuradas correctamente

## 📄 Licencia

[Tu licencia aquí]

## 👥 Contribuciones

[Información sobre cómo contribuir]
