import { auth } from './firebase-init.js';
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { getAthletes } from './apiService.js';
import { renderWellnessPanel } from './components/WellnessPanel.js';
import { renderActivityFeed } from './components/ActivityFeed.js';
import { renderSettingsPanel } from './components/SettingsPanel.js'; // NUEVO

// --- Estado de la Aplicación ---
let currentAthleteId = null;
let currentView = 'wellness'; // Vista por defecto
let user = null; // Almacena el objeto de usuario de Firebase

// --- Elementos del DOM ---
const athleteSelect = document.getElementById('athlete-select');
const viewContainer = document.getElementById('app-view');
const navItems = document.querySelectorAll('.nav-item');
const logoutBtn = document.getElementById('logout-btn');
const userEmailDisplay = document.getElementById('user-email');

/**
 * Carga la vista principal (Wellness, Actividades, etc.)
 */
async function loadView(view, athleteId) {
    // Actualizar estado activo en la UI
    navItems.forEach(i => {
        i.classList.remove('active');
        if (i.dataset.view === view) {
            i.classList.add('active');
        }
    });
    
    currentView = view; // Actualizar el estado global
    viewContainer.innerHTML = '<h3>Cargando...</h3>';

    // Router simple
    switch (view) {
        case 'wellness':
            if (!athleteId) {
                viewContainer.innerHTML = '<h3>Cargando atletas...</h3>';
                return;
            }
            await renderWellnessPanel(viewContainer, athleteId);
            break;
        case 'activities':
            if (!athleteId) {
                viewContainer.innerHTML = '<h3>Cargando atletas...</h3>';
                return;
            }
            await renderActivityFeed(viewContainer, athleteId);
            break;
        case 'analysis':
            viewContainer.innerHTML = '<h3>Panel de Análisis (Próximamente)</h3>';
            break;
        case 'settings': // NUEVA VISTA
            // Pasamos 'initializeApp' como la función callback 'onSave'
            renderSettingsPanel(viewContainer, initializeApp);
            break;
        default:
            viewContainer.innerHTML = '<h3>Vista no encontrada</h3>';
    }
}

/**
 * Carga inicial de la aplicación.
 */
async function initializeApp() {
    if (!user) return; // Salir si el usuario no está autenticado
    
    // Mostrar el email del usuario y limpiar el selector
    userEmailDisplay.textContent = user.email;
    athleteSelect.innerHTML = '<option>Cargando atletas...</option>';
    athleteSelect.disabled = true;

    try {
        const athletes = await getAthletes();
        
        // Rellenar el selector de atletas
        athleteSelect.innerHTML = ''; // Limpiar "Cargando..."
        athletes.forEach(athlete => {
            const option = new Option(athlete.name, athlete.id);
            athleteSelect.add(option);
        });
        
        // Seleccionar el primer atleta por defecto
        if (athletes.length > 0) {
            currentAthleteId = athletes[0].id;
            athleteSelect.value = currentAthleteId;
            athleteSelect.disabled = false;
            // Cargar la vista por defecto (wellness)
            await loadView(currentView, currentAthleteId);
        } else {
            athleteSelect.innerHTML = '<option>No hay atletas</option>';
            viewContainer.innerHTML = '<h3>No se encontraron atletas.</h3>';
        }
        
    } catch (error) {
        console.error("Error al inicializar:", error.message);
        // ¡Magia! Si el error es por credenciales, forzamos la vista de configuración
        if (error.message.includes("Credenciales")) {
            athleteSelect.innerHTML = '<option>Configuración requerida</option>';
            loadView('settings'); // Carga la vista de configuración
        } else {
            viewContainer.innerHTML = `<h1>Error al cargar la app.</h1><p>${error.message}</p>`;
        }
    }
}

// --- Manejadores de Eventos ---

// Cambiar de atleta
athleteSelect.addEventListener('change', (e) => {
    currentAthleteId = e.target.value;
    loadView(currentView, currentAthleteId);
});

// Navegación (cambiar de vista)
navItems.forEach(item => {
    item.addEventListener('click', () => {
        loadView(item.dataset.view, currentAthleteId);
    });
});

// Logout
logoutBtn.addEventListener('click', (e) => {
    e.preventDefault();
    signOut(auth).then(() => {
        window.location.href = '../landing/login.html';
    }).catch((error) => {
        console.error('Error al cerrar sesión:', error);
    });
});

// --- Iniciar la App ---
// Espera a que el estado de autenticación de Firebase cambie
onAuthStateChanged(auth, (firebaseUser) => {
    if (firebaseUser) {
        // El usuario está logueado
        user = firebaseUser;
        initializeApp();
    } else {
        // El usuario no está logueado, redirigir
        user = null;
        window.location.href = '../landing/login.html';
    }
});
