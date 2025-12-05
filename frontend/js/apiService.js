import { auth } from './firebase-init.js'; // Importa el servicio de auth

const API_BASE_URL = 'http://localhost:5000/api/v1';

/**
 * Helper para obtener el token JWT del usuario actual.
 */
async function getAuthToken() {
    const user = auth.currentUser;
    if (!user) {
        // Si no hay usuario, redirigir a la página de login
        window.location.href = '../landing/login.html';
        throw new Error('Usuario no autenticado');
    }
    // Obtener el token (Firebase lo cachea)
    return user.getIdToken();
}

/**
 * Helper para realizar peticiones 'fetch' autenticadas
 */
async function fetchAuth(endpoint, options = {}) {
    const token = await getAuthToken();
    
    // Configurar headers por defecto
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` // <-- ¡Clave!
    };
    
    const config = {
        ...options,
        headers: {
            ...headers,
            ...options.headers
        }
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

    // Devolvemos el JSON de error para que el frontend pueda leerlo
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error en la petición a la API');
    }
    
    // Si la respuesta no tiene contenido (ej. 201 Created)
    if (response.status === 201 || response.status === 204) {
        return { success: true };
    }
    
    return response.json();
}

// --- Métodos de la API (ahora usan fetchAuth) ---

export async function getAthletes() {
    return fetchAuth('/athletes');
}

export async function getAthleteProfile(athleteId) {
    return fetchAuth(`/athlete/${athleteId}`);
}

export async function getWellnessData(athleteId, oldest, newest) {
    const params = new URLSearchParams({ athlete_id: athleteId, oldest, newest });
    return fetchAuth(`/wellness?${params}`);
}

export async function getActivityData(athleteId, oldest, newest) {
    const params = new URLSearchParams({ athlete_id: athleteId, oldest, newest });
    return fetchAuth(`/activities?${params}`);
}

export async function getEventsData(athleteId, oldest, newest, category = 'WORKOUT') {
    const params = new URLSearchParams({ athlete_id: athleteId, oldest, newest, category });
    return fetchAuth(`/events?${params}`);
}

/**
 * Guarda las credenciales de Intervals.icu del usuario en el backend.
 *
 */
export async function saveIntervalsCredentials(coachId, apiKey) {
    return fetchAuth('/users/credentials', {
        method: 'POST',
        body: JSON.stringify({ coachId, apiKey })
    });
}
