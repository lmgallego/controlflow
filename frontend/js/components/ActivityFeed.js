import { getActivityData } from '../apiService.js';
import { t } from '../i18n.js';

let currentDate = new Date();
let currentAthleteId = null;
let activitiesData = [];
let calendarContainer = null;

/**
 * Renderiza el calendario de actividades.
 */
export async function renderActivityFeed(container, athleteId) {
    currentAthleteId = athleteId;
    calendarContainer = container;
    currentDate = new Date();
    
    container.innerHTML = `
        <div class="activity-calendar-container">
            <div class="calendar-header">
                <h2>${t('activities.calendar.title')}</h2>
                <div class="calendar-nav">
                    <button class="calendar-nav-btn" id="prev-month" title="${t('activities.calendar.prevMonth')}">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"></polyline></svg>
                    </button>
                    <span class="calendar-month-year" id="month-year"></span>
                    <button class="calendar-nav-btn" id="next-month" title="${t('activities.calendar.nextMonth')}">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
                    </button>
                    <button class="calendar-today-btn" id="today-btn">${t('activities.calendar.today')}</button>
                </div>
            </div>
            <div class="calendar-legend">
                <div class="legend-item">
                    <span class="legend-dot completed"></span>
                    <span>${t('activities.calendar.completed')}</span>
                </div>
                <div class="legend-item">
                    <span class="legend-dot rest"></span>
                    <span>${t('activities.calendar.restDay')}</span>
                </div>
            </div>
            <div class="calendar-grid" id="calendar-grid">
                <div class="calendar-loading">
                    <div class="spinner"></div>
                    <span>${t('common.loading')}</span>
                </div>
            </div>
            <div class="calendar-day-detail" id="day-detail"></div>
        </div>
    `;

    setupCalendarListeners(container);
    await loadAndRenderCalendar();
}

/**
 * Configura los event listeners del calendario
 */
function setupCalendarListeners(container) {
    container.querySelector('#prev-month')?.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        loadAndRenderCalendar();
    });

    container.querySelector('#next-month')?.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        loadAndRenderCalendar();
    });

    container.querySelector('#today-btn')?.addEventListener('click', () => {
        currentDate = new Date();
        loadAndRenderCalendar();
    });
}

/**
 * Carga datos y renderiza el calendario
 */
async function loadAndRenderCalendar() {
    const grid = document.getElementById('calendar-grid');
    const monthYear = document.getElementById('month-year');
    
    if (!grid || !monthYear) return;

    grid.innerHTML = `
        <div class="calendar-loading">
            <div class="spinner"></div>
            <span>${t('common.loading')}</span>
        </div>
    `;

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    // Extender rango para días visibles de meses adyacentes
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    const endDate = new Date(lastDay);
    endDate.setDate(endDate.getDate() + (6 - lastDay.getDay()));

    const oldest = startDate.toISOString().split('T')[0];
    const newest = endDate.toISOString().split('T')[0];

    // Actualizar título del mes
    const monthNames = t('activities.calendar.months').split(',');
    monthYear.textContent = `${monthNames[month]} ${year}`;

    try {
        const activities = await getActivityData(currentAthleteId, oldest, newest);
        activitiesData = Array.isArray(activities) ? activities : [];
        renderCalendarGrid(year, month, startDate, endDate);
    } catch (error) {
        console.error('Error loading calendar data:', error);
        grid.innerHTML = `<div class="calendar-error">${t('common.error')}</div>`;
    }
}

/**
 * Renderiza la cuadrícula del calendario
 */
function renderCalendarGrid(year, month, startDate, endDate) {
    const grid = document.getElementById('calendar-grid');
    if (!grid) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Crear mapa de actividades por fecha
    const activityMap = new Map();
    activitiesData.forEach(activity => {
        const date = activity.start_date_local?.split('T')[0];
        if (date) {
            if (!activityMap.has(date)) activityMap.set(date, []);
            activityMap.get(date).push(activity);
        }
    });

    const dayNames = t('activities.calendar.days').split(',');
    
    let html = `
        <div class="calendar-weekdays">
            ${dayNames.map(day => `<div class="weekday">${day}</div>`).join('')}
        </div>
        <div class="calendar-days">
    `;

    const currentDay = new Date(startDate);
    while (currentDay <= endDate) {
        const dateStr = currentDay.toISOString().split('T')[0];
        const isCurrentMonth = currentDay.getMonth() === month;
        const isToday = currentDay.getTime() === today.getTime();
        
        const dayActivities = activityMap.get(dateStr) || [];
        const hasActivities = dayActivities.length > 0;
        
        // Calcular TSS total del día
        const totalTSS = dayActivities.reduce((sum, a) => sum + (a.icu_training_load || 0), 0);

        let dayClass = 'calendar-day';
        if (!isCurrentMonth) dayClass += ' other-month';
        if (isToday) dayClass += ' today';
        if (hasActivities) dayClass += ' has-activities';

        html += `
            <div class="${dayClass}" data-date="${dateStr}">
                <span class="day-number">${currentDay.getDate()}</span>
                ${hasActivities ? `
                    <div class="day-activities">
                        ${dayActivities.slice(0, 2).map(a => `
                            <div class="activity-pill" title="${a.name}">
                                ${getActivityIcon(a.type)} ${truncate(a.name, 10)}
                            </div>
                        `).join('')}
                        ${dayActivities.length > 2 ? `<div class="more-activities">+${dayActivities.length - 2}</div>` : ''}
                    </div>
                    ${totalTSS > 0 ? `<div class="day-tss">TSS: ${Math.round(totalTSS)}</div>` : ''}
                ` : ''}
            </div>
        `;

        currentDay.setDate(currentDay.getDate() + 1);
    }

    html += '</div>';
    grid.innerHTML = html;

    // Event listeners para los días
    grid.querySelectorAll('.calendar-day').forEach(day => {
        day.addEventListener('click', () => showDayDetail(day.dataset.date));
    });
}

/**
 * Muestra el detalle de un día
 */
function showDayDetail(dateStr) {
    const detailContainer = document.getElementById('day-detail');
    if (!detailContainer) return;

    const date = new Date(dateStr + 'T00:00:00');
    const dayActivities = activitiesData.filter(a => a.start_date_local?.split('T')[0] === dateStr);

    // Formatear fecha
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const locale = t('common.locale') || 'es-ES';
    const formattedDate = date.toLocaleDateString(locale, options);

    if (dayActivities.length === 0) {
        detailContainer.innerHTML = `
            <div class="detail-header">
                <h3>${formattedDate}</h3>
                <button class="detail-close" onclick="this.parentElement.parentElement.classList.remove('active')">&times;</button>
            </div>
            <p class="no-activities">${t('activities.calendar.noActivities')}</p>
        `;
        detailContainer.classList.add('active');
        return;
    }

    const totalTSS = dayActivities.reduce((sum, a) => sum + (a.icu_training_load || 0), 0);
    const totalTime = dayActivities.reduce((sum, a) => sum + (a.moving_time || 0), 0);
    const totalDistance = dayActivities.reduce((sum, a) => sum + (a.distance || 0), 0);

    let html = `
        <div class="detail-header">
            <h3>${formattedDate}</h3>
            <button class="detail-close" onclick="this.parentElement.parentElement.classList.remove('active')">&times;</button>
        </div>
        <div class="detail-summary">
            <div class="summary-item">
                <span class="summary-value">${dayActivities.length}</span>
                <span class="summary-label">${t('activities.calendar.activities')}</span>
            </div>
            <div class="summary-item">
                <span class="summary-value">${Math.round(totalTSS)}</span>
                <span class="summary-label">TSS</span>
            </div>
            <div class="summary-item">
                <span class="summary-value">${formatDuration(totalTime)}</span>
                <span class="summary-label">${t('activities.time')}</span>
            </div>
            ${totalDistance > 0 ? `
                <div class="summary-item">
                    <span class="summary-value">${(totalDistance / 1000).toFixed(1)}</span>
                    <span class="summary-label">km</span>
                </div>
            ` : ''}
        </div>
        <div class="detail-activities-list">
    `;

    dayActivities.forEach(activity => {
        const duration = formatDuration(activity.moving_time);
        const distance = activity.distance ? (activity.distance / 1000).toFixed(1) + ' km' : '';
        
        html += `
            <div class="detail-activity-card">
                <div class="activity-card-header">
                    <span class="activity-icon">${getActivityIcon(activity.type)}</span>
                    <div class="activity-info">
                        <span class="activity-name">${activity.name}</span>
                        <span class="activity-type">${activity.type}</span>
                    </div>
                </div>
                <div class="activity-card-metrics">
                    <div class="metric-item">
                        <span class="metric-icon">⏱️</span>
                        <span>${duration}</span>
                    </div>
                    ${distance ? `
                        <div class="metric-item">
                            <span class="metric-icon">📏</span>
                            <span>${distance}</span>
                        </div>
                    ` : ''}
                    ${activity.icu_training_load ? `
                        <div class="metric-item">
                            <span class="metric-icon">💪</span>
                            <span>TSS ${Math.round(activity.icu_training_load)}</span>
                        </div>
                    ` : ''}
                    ${activity.average_watts ? `
                        <div class="metric-item">
                            <span class="metric-icon">⚡</span>
                            <span>${activity.average_watts}W</span>
                        </div>
                    ` : ''}
                    ${activity.average_heartrate ? `
                        <div class="metric-item">
                            <span class="metric-icon">❤️</span>
                            <span>${Math.round(activity.average_heartrate)} bpm</span>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    });

    html += '</div>';
    detailContainer.innerHTML = html;
    detailContainer.classList.add('active');
}

/**
 * Obtiene el icono para un tipo de actividad
 */
function getActivityIcon(type) {
    const icons = {
        'Ride': '🚴',
        'VirtualRide': '🚴‍♂️',
        'Run': '🏃',
        'VirtualRun': '🏃‍♂️',
        'Swim': '🏊',
        'Walk': '🚶',
        'Hike': '🥾',
        'WeightTraining': '🏋️',
        'Yoga': '🧘',
        'Workout': '💪',
        'Rowing': '🚣'
    };
    return icons[type] || '🏅';
}

/**
 * Formatea duración en segundos a HH:MM:SS o H:MM
 */
function formatDuration(seconds) {
    if (!seconds) return '0:00';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    if (h > 0) {
        return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${m}:${s.toString().padStart(2, '0')}`;
}

/**
 * Trunca texto
 */
function truncate(text, maxLength) {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
}
