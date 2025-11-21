import { auth } from './firebase-init.js';
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { getAthletes } from './apiService.js';
import { renderAthletesPanel } from './components/AthletesPanel.js';
import { renderWellnessPanel } from './components/WellnessPanel.js';
import { renderActivityFeed } from './components/ActivityFeed.js';
import { renderSettingsPanel } from './components/SettingsPanel.js';

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
    try {
        // Actualizar estado activo en la UI
        navItems.forEach(i => {
            i.classList.remove('active');
            if (i.dataset.view === view) {
                i.classList.add('active');
            }
        });

        currentView = view; // Actualizar el estado global
        viewContainer.innerHTML = '<h3>Cargando...</h3>';

        // Mostrar/ocultar selector de atletas según la vista
        const athleteSelectContainer = document.querySelector('.controls');
        if (view === 'athletes' || view === 'settings') {
            athleteSelectContainer.style.display = 'none';
        } else {
            athleteSelectContainer.style.display = 'flex';
        }

        // Si se proporciona un athleteId, actualizar el selector y el estado global
        if (athleteId) {
            currentAthleteId = athleteId;
            athleteSelect.value = athleteId;
        }

        // Router simple
        switch (view) {
            case 'athletes':
                await renderAthletesPanel(viewContainer);
                // Después de renderizar, inicializar iconos de Lucide y configurar event listeners
                setTimeout(() => {
                    if (window.lucide) {
                        window.lucide.createIcons();
                    }
                    setupAthleteCardListeners();
                }, 100);
                break;
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
        case 'settings':
            // Pasamos 'initializeApp' como la función callback 'onSave'
            renderSettingsPanel(viewContainer, initializeApp);
            break;
        default:
            viewContainer.innerHTML = '<h3>Vista no encontrada</h3>';
        }
    } catch (error) {
        console.error('Error en loadView:', error);
        viewContainer.innerHTML = `<div class="error-message">
            <h3>Error al cargar la vista</h3>
            <p>${error.message}</p>
            <button onclick="location.reload()">Recargar página</button>
        </div>`;
    }
}

/**
 * Carga inicial de la aplicación.
 */
async function initializeApp() {
    try {
        if (!user) {
            console.error('initializeApp called without user');
            return; // Salir si el usuario no está autenticado
        }

        // Mostrar el email del usuario y limpiar el selector
        userEmailDisplay.textContent = user.email;
        athleteSelect.innerHTML = '<option>Cargando atletas...</option>';
        athleteSelect.disabled = true;

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
        console.error("Error al inicializar:", error);

        // Si el token de Firebase es inválido, hacer logout
        if (error.message && error.message.includes("Token inválido")) {
            console.log('Token de Firebase inválido, cerrando sesión...');
            await signOut(auth);
            window.location.href = '../landing/login.html';
            return;
        }

        // Si el error es por credenciales de Intervals.icu, mostrar vista de configuración
        if (error.message && error.message.includes("Credenciales")) {
            athleteSelect.innerHTML = '<option>Configuración requerida</option>';
            await loadView('settings'); // Carga la vista de configuración
        } else {
            viewContainer.innerHTML = `<h1>Error al cargar la app.</h1><p>${error.message || 'Error desconocido'}</p>`;
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

/**
 * Configura los event listeners para las tarjetas de atletas
 */
function setupAthleteCardListeners() {
    // Botones "Ver detalles"
    const viewBtns = document.querySelectorAll('.view-athlete-btn');
    viewBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const athleteId = btn.dataset.athleteId;
            loadView('wellness', athleteId);
        });
    });

    // Enlaces rápidos en las tarjetas (Bienestar, Actividades, Análisis)
    const statItems = document.querySelectorAll('.athlete-card .stat-item');
    statItems.forEach(item => {
        item.style.cursor = 'pointer';
        item.addEventListener('click', () => {
            const athleteCard = item.closest('.athlete-card');
            const athleteId = athleteCard.querySelector('.view-athlete-btn').dataset.athleteId;
            const targetView = item.dataset.view; // Obtener la vista desde el atributo data-view
            
            loadView(targetView, athleteId);
        });
    });
}

// Exponer función loadView globalmente para uso desde otros componentes
window.navigateToView = loadView;

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
