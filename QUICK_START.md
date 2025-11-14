# 🚀 Guía Rápida de Inicio - ControlFlow

## Para Usuarios de Windows

### Ya tienes el backend configurado y funcionando. Ahora vamos a conectar el frontend:

## Paso 1: Abrir una segunda terminal

1. Abre una **nueva** terminal de PowerShell o CMD (deja la del backend corriendo)
2. Navega al proyecto:
   ```bash
   cd C:\Users\luism\Documents\ControlFlow
   ```

3. Activa el entorno virtual:
   ```bash
   venv\Scripts\activate
   ```

## Paso 2: Iniciar el servidor del frontend

```bash
python start_frontend.py
```

Deberías ver algo como:
```
============================================================
  ControlFlow Frontend Server
============================================================
  Servidor corriendo en: http://localhost:8000
  Landing page: http://localhost:8000/landing/index.html
  Login: http://localhost:8000/landing/login.html
  Dashboard: http://localhost:8000/frontend/dashboard.html
============================================================
```

## Paso 3: Acceder a la aplicación

1. Abre tu navegador favorito (Chrome, Edge, Firefox, etc.)
2. Ve a: **http://localhost:8000/landing/login.html**

## Paso 4: Crear cuenta e iniciar sesión

1. Ingresa tu **email** y una **contraseña** (mínimo 6 caracteres)
2. Haz clic en **"Acceder"**
3. Si es tu primera vez, Firebase creará automáticamente tu cuenta
4. Serás redirigido al dashboard

## Paso 5: Configurar Intervals.icu

En el dashboard, verás el panel de **Configuración**:

1. **Coach ID (Athlete ID):**
   - Ve a tu perfil en [Intervals.icu](https://intervals.icu)
   - Copia tu ID (algo como `i12345`)

2. **API Key:**
   - Ve a **Settings** → **Developer** en Intervals.icu
   - Copia tu API Key

3. Pega ambos valores en el formulario y haz clic en **"Guardar Credenciales"**

## Paso 6: ¡A usar la app!

Una vez guardadas las credenciales:
- Verás la lista de tus atletas en el selector superior
- Puedes navegar entre las vistas:
  - **Bienestar:** Métricas de wellness de tus atletas
  - **Actividades:** Actividades recientes
  - **Análisis:** (Próximamente)
  - **Configuración:** Actualizar credenciales

---

## 📊 Resumen de Servidores

Necesitas **2 terminales** corriendo al mismo tiempo:

| Terminal | Comando | Puerto | URL |
|----------|---------|--------|-----|
| 1 - Backend | `python -m backend.app` | 5000 | http://localhost:5000 |
| 2 - Frontend | `python start_frontend.py` | 8000 | http://localhost:8000 |

---

## 🛑 Detener los servidores

En cada terminal, presiona: **CTRL+C**

---

## ⚠️ Solución de Problemas

### Error: "Cannot connect to backend"
- Verifica que el backend esté corriendo en la terminal 1
- Revisa que veas el mensaje: `Running on http://127.0.0.1:5000`

### Error: "Firebase authentication error"
- Asegúrate de que tu email y contraseña tengan al menos 6 caracteres
- Verifica tu conexión a internet

### No veo mis atletas
- Verifica que hayas configurado correctamente el Coach ID y API Key
- Revisa que tus credenciales de Intervals.icu sean correctas
- Abre la consola del navegador (F12) para ver errores detallados

---

## 📚 Más Información

Para más detalles, consulta el [README.md](README.md) principal.
