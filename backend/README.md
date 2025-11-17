# Backend de ControlFlow

## Configuración Inicial

### 1. Crear el archivo .env

Copia el archivo `.env.example` en la raíz del proyecto y renómbralo a `.env`:

```bash
cp .env.example .env
```

### 2. Configurar Firebase Admin SDK

1. Ve a la [Consola de Firebase](https://console.firebase.google.com/)
2. Selecciona tu proyecto
3. Ve a Configuración del proyecto > Cuentas de servicio
4. Haz clic en "Generar nueva clave privada"
5. Guarda el archivo JSON descargado en un lugar seguro
6. Actualiza la variable `GOOGLE_APPLICATION_CREDENTIALS` en el archivo `.env` con la ruta completa al archivo JSON

### 3. Generar la clave de encriptación

Ejecuta el siguiente comando para generar una clave de encriptación:

```bash
python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"
```

Copia el resultado y pégalo en la variable `ENCRYPTION_KEY` en el archivo `.env`.

### 4. Instalar dependencias

Asegúrate de tener un entorno virtual activado y ejecuta:

```bash
pip install -r backend/requirements.txt
```

### 5. Ejecutar el servidor

Desde la raíz del proyecto:

```bash
python -m backend.app
```

El servidor estará disponible en `http://localhost:5000`

## Endpoints disponibles

- `GET /` - Health check
- `GET /api/v1/athletes` - Obtener lista de atletas
- `GET /api/v1/wellness/<athlete_id>` - Obtener datos de bienestar
- `POST /api/v1/users/setup` - Configurar credenciales de usuario

## Solución de problemas

### Error: ModuleNotFoundError: No module named 'core.firebase_admin'

Este error se debía a que el archivo `firebase_admin.py` tenía un nombre incorrecto (`firebase_admin_py`). Ya ha sido corregido.

### Error: GOOGLE_APPLICATION_CREDENTIALS no está definida

Asegúrate de haber creado el archivo `.env` y configurado correctamente la variable `GOOGLE_APPLICATION_CREDENTIALS` con la ruta al archivo de credenciales de Firebase.

### Error: ENCRYPTION_KEY no está definida

Genera una clave de encriptación como se indica en el paso 3 de la configuración inicial.
