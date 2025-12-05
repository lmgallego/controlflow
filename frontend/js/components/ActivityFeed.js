import { getActivityData, getEventsData } from '../apiService.js';
import { t } from '../i18n.js';

let currentDate = new Date();
let currentAthleteId = null;
let activitiesData = [];
let eventsData = [];
let calendarContainer = null;
let currentView = 'month'; // 'month' o 'week'

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
                <div class="calendar-controls">
                    <div class="view-toggle">
                        <button class="view-btn active" id="view-month" title="${t('activities.calendar.monthView')}">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                            ${t('activities.calendar.month')}
                        </button>
                        <button class="view-btn" id="view-week" title="${t('activities.calendar.weekView')}">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 2v4M16 2v4M3 10h18M21 8v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                            ${t('activities.calendar.week')}
                        </button>
                    </div>
                    <div class="calendar-nav">
                        <button class="calendar-nav-btn" id="prev-period" title="${t('activities.calendar.previous')}">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"></polyline></svg>
                        </button>
                        <span class="calendar-month-year" id="period-label"></span>
                        <button class="calendar-nav-btn" id="next-period" title="${t('activities.calendar.next')}">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
                        </button>
                        <button class="calendar-today-btn" id="today-btn">${t('activities.calendar.today')}</button>
                    </div>
                </div>
            </div>
            <div class="calendar-legend">
                <div class="legend-item">
                    <span class="legend-dot completed"></span>
                    <span>${t('activities.calendar.completed')}</span>
                </div>
                <div class="legend-item">
                    <span class="legend-dot planned"></span>
                    <span>${t('activities.calendar.planned')}</span>
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
    // Navegación anterior
    container.querySelector('#prev-period')?.addEventListener('click', () => {
        if (currentView === 'month') {
            currentDate.setMonth(currentDate.getMonth() - 1);
        } else {
            currentDate.setDate(currentDate.getDate() - 7);
        }
        loadAndRenderCalendar();
    });

    // Navegación siguiente
    container.querySelector('#next-period')?.addEventListener('click', () => {
        if (currentView === 'month') {
            currentDate.setMonth(currentDate.getMonth() + 1);
        } else {
            currentDate.setDate(currentDate.getDate() + 7);
        }
        loadAndRenderCalendar();
    });

    // Botón Hoy
    container.querySelector('#today-btn')?.addEventListener('click', () => {
        currentDate = new Date();
        loadAndRenderCalendar();
    });

    // Cambio de vista: Mes
    container.querySelector('#view-month')?.addEventListener('click', () => {
        if (currentView !== 'month') {
            currentView = 'month';
            updateViewButtons();
            loadAndRenderCalendar();
        }
    });

    // Cambio de vista: Semana
    container.querySelector('#view-week')?.addEventListener('click', () => {
        if (currentView !== 'week') {
            currentView = 'week';
            updateViewButtons();
            loadAndRenderCalendar();
        }
    });
}

/**
 * Actualiza los botones de vista activos
 */
function updateViewButtons() {
    document.querySelectorAll('.view-btn').forEach(btn => btn.classList.remove('active'));
    if (currentView === 'month') {
        document.getElementById('view-month')?.classList.add('active');
    } else {
        document.getElementById('view-week')?.classList.add('active');
    }
}

/**
 * Carga datos y renderiza el calendario
 */
async function loadAndRenderCalendar() {
    const grid = document.getElementById('calendar-grid');
    const periodLabel = document.getElementById('period-label');
    
    if (!grid || !periodLabel) return;

    grid.innerHTML = `
        <div class="calendar-loading">
            <div class="spinner"></div>
            <span>${t('common.loading')}</span>
        </div>
    `;

    let startDate, endDate;
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const monthNames = t('activities.calendar.months').split(',');
    const locale = t('common.locale') || 'es-ES';

    if (currentView === 'month') {
        // Vista mensual
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        
        startDate = new Date(firstDay);
        const firstDayOfWeek = (firstDay.getDay() + 6) % 7;
        startDate.setDate(startDate.getDate() - firstDayOfWeek);
        
        endDate = new Date(lastDay);
        const lastDayOfWeek = (lastDay.getDay() + 6) % 7;
        endDate.setDate(endDate.getDate() + (6 - lastDayOfWeek));

        periodLabel.textContent = `${monthNames[month]} ${year}`;
    } else {
        // Vista semanal - encontrar lunes de la semana actual
        startDate = new Date(currentDate);
        const dayOfWeek = (startDate.getDay() + 6) % 7;
        startDate.setDate(startDate.getDate() - dayOfWeek);
        startDate.setHours(0, 0, 0, 0);
        
        endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 6);

        // Formato: "2 - 8 Dic 2025"
        const startDay = startDate.getDate();
        const endDay = endDate.getDate();
        const startMonth = monthNames[startDate.getMonth()].substring(0, 3);
        const endMonth = monthNames[endDate.getMonth()].substring(0, 3);
        
        if (startDate.getMonth() === endDate.getMonth()) {
            periodLabel.textContent = `${startDay} - ${endDay} ${startMonth} ${endDate.getFullYear()}`;
        } else {
            periodLabel.textContent = `${startDay} ${startMonth} - ${endDay} ${endMonth} ${endDate.getFullYear()}`;
        }
    }

    const oldest = formatDateLocal(startDate);
    const newest = formatDateLocal(endDate);

    try {
        // Cargar actividades y eventos en paralelo
        const [activities, events] = await Promise.all([
            getActivityData(currentAthleteId, oldest, newest),
            getEventsData(currentAthleteId, oldest, newest)
        ]);
        activitiesData = Array.isArray(activities) ? activities : [];
        eventsData = Array.isArray(events) ? events : [];
        
        console.log('Activities loaded:', activitiesData.length);
        console.log('Events loaded:', eventsData.length, eventsData);
        
        if (currentView === 'month') {
            renderCalendarGrid(year, month, startDate, endDate);
        } else {
            renderWeekView(startDate, endDate);
        }
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

    // Crear mapa de eventos programados por fecha (eventos usan start_date, no start_date_local)
    const eventMap = new Map();
    eventsData.forEach(event => {
        // Los eventos de Intervals.icu usan 'start_date' (formato YYYY-MM-DD)
        const date = event.start_date_local?.split('T')[0] || event.start_date;
        if (date) {
            if (!eventMap.has(date)) eventMap.set(date, []);
            eventMap.get(date).push(event);
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
        const dateStr = formatDateLocal(currentDay);
        const isCurrentMonth = currentDay.getMonth() === month;
        const isToday = currentDay.getTime() === today.getTime();
        
        const dayActivities = activityMap.get(dateStr) || [];
        const dayEvents = eventMap.get(dateStr) || [];
        const hasActivities = dayActivities.length > 0;
        const hasEvents = dayEvents.length > 0;
        
        // Calcular TSS total del día (actividades completadas)
        const totalTSS = dayActivities.reduce((sum, a) => sum + (a.icu_training_load || 0), 0);
        // Calcular carga planificada
        const plannedLoad = dayEvents.reduce((sum, e) => sum + (e.icu_training_load || e.load_target || 0), 0);

        let dayClass = 'calendar-day';
        if (!isCurrentMonth) dayClass += ' other-month';
        if (isToday) dayClass += ' today';
        if (hasActivities) dayClass += ' has-activities';
        if (hasEvents && !hasActivities) dayClass += ' has-events';

        html += `
            <div class="${dayClass}" data-date="${dateStr}">
                <span class="day-number">${currentDay.getDate()}</span>
                <div class="day-content">
                    ${hasEvents ? `
                        <div class="day-events">
                            ${dayEvents.slice(0, 2).map(e => `
                                <div class="event-pill" title="${e.name || e.description || t('activities.calendar.planned')}">
                                    📋 ${truncate(e.name || e.description || t('activities.calendar.workout'), 10)}
                                </div>
                            `).join('')}
                            ${dayEvents.length > 2 ? `<div class="more-events">+${dayEvents.length - 2}</div>` : ''}
                        </div>
                    ` : ''}
                    ${hasActivities ? `
                        <div class="day-activities">
                            ${dayActivities.slice(0, 2).map(a => `
                                <div class="activity-pill" title="${a.name}">
                                    ${getActivityIcon(a.type)} ${truncate(a.name, 10)}
                                </div>
                            `).join('')}
                            ${dayActivities.length > 2 ? `<div class="more-activities">+${dayActivities.length - 2}</div>` : ''}
                        </div>
                    ` : ''}
                </div>
                ${totalTSS > 0 || plannedLoad > 0 ? `
                    <div class="day-load-info">
                        ${plannedLoad > 0 ? `<span class="planned-load">📋 ${Math.round(plannedLoad)}</span>` : ''}
                        ${totalTSS > 0 ? `<span class="actual-load">✅ ${Math.round(totalTSS)}</span>` : ''}
                    </div>
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
 * Renderiza la vista semanal
 */
function renderWeekView(startDate, endDate) {
    const grid = document.getElementById('calendar-grid');
    if (!grid) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Crear mapas de actividades y eventos
    const activityMap = new Map();
    activitiesData.forEach(activity => {
        const date = activity.start_date_local?.split('T')[0];
        if (date) {
            if (!activityMap.has(date)) activityMap.set(date, []);
            activityMap.get(date).push(activity);
        }
    });

    const eventMap = new Map();
    eventsData.forEach(event => {
        const date = event.start_date_local?.split('T')[0] || event.start_date;
        if (date) {
            if (!eventMap.has(date)) eventMap.set(date, []);
            eventMap.get(date).push(event);
        }
    });

    const dayNames = t('activities.calendar.daysLong').split(',');
    const locale = t('common.locale') || 'es-ES';
    
    let html = '<div class="week-view">';

    const currentDay = new Date(startDate);
    for (let i = 0; i < 7; i++) {
        const dateStr = formatDateLocal(currentDay);
        const isToday = currentDay.getTime() === today.getTime();
        const dayActivities = activityMap.get(dateStr) || [];
        const dayEvents = eventMap.get(dateStr) || [];
        const hasActivities = dayActivities.length > 0;
        const hasEvents = dayEvents.length > 0;

        const totalTSS = dayActivities.reduce((sum, a) => sum + (a.icu_training_load || 0), 0);
        const plannedLoad = dayEvents.reduce((sum, e) => sum + (e.icu_training_load || e.load_target || 0), 0);

        let dayClass = 'week-day';
        if (isToday) dayClass += ' today';
        if (hasActivities) dayClass += ' has-activities';
        if (hasEvents && !hasActivities) dayClass += ' has-events';

        html += `
            <div class="${dayClass}" data-date="${dateStr}">
                <div class="week-day-header">
                    <span class="week-day-name">${dayNames[i]}</span>
                    <span class="week-day-date ${isToday ? 'today-badge' : ''}">${currentDay.getDate()}</span>
                </div>
                <div class="week-day-content">
        `;

        // Mostrar eventos programados
        if (hasEvents) {
            html += '<div class="week-events-section">';
            dayEvents.forEach(event => {
                const load = event.icu_training_load || event.load_target || 0;
                const duration = event.moving_time ? formatDuration(event.moving_time) : '';
                html += `
                    <div class="week-event-card">
                        <div class="week-event-header">
                            <span class="week-event-icon">📋</span>
                            <span class="week-event-name">${event.name || event.description || t('activities.calendar.workout')}</span>
                        </div>
                        ${event.description && event.description !== event.name ? `
                            <div class="week-event-desc">${truncate(event.description, 100)}</div>
                        ` : ''}
                        <div class="week-event-metrics">
                            ${duration ? `<span>⏱️ ${duration}</span>` : ''}
                            ${load > 0 ? `<span>💪 TSS ${Math.round(load)}</span>` : ''}
                        </div>
                    </div>
                `;
            });
            html += '</div>';
        }

        // Mostrar actividades completadas
        if (hasActivities) {
            html += '<div class="week-activities-section">';
            dayActivities.forEach(activity => {
                const duration = formatDuration(activity.moving_time);
                const distance = activity.distance ? (activity.distance / 1000).toFixed(1) + ' km' : '';
                html += `
                    <div class="week-activity-card">
                        <div class="week-activity-header">
                            <span class="week-activity-icon">${getActivityIcon(activity.type)}</span>
                            <span class="week-activity-name">${activity.name}</span>
                        </div>
                        <div class="week-activity-metrics">
                            <span>⏱️ ${duration}</span>
                            ${distance ? `<span>📏 ${distance}</span>` : ''}
                            ${activity.icu_training_load ? `<span>💪 TSS ${Math.round(activity.icu_training_load)}</span>` : ''}
                            ${activity.average_watts ? `<span>⚡ ${activity.average_watts}W</span>` : ''}
                        </div>
                    </div>
                `;
            });
            html += '</div>';
        }

        // Si no hay nada
        if (!hasEvents && !hasActivities) {
            html += `<div class="week-empty">${t('activities.calendar.restDay')}</div>`;
        }

        // Resumen del día
        if (totalTSS > 0 || plannedLoad > 0) {
            html += `
                <div class="week-day-summary">
                    ${plannedLoad > 0 ? `<span class="planned-badge">📋 ${Math.round(plannedLoad)}</span>` : ''}
                    ${totalTSS > 0 ? `<span class="completed-badge">✅ ${Math.round(totalTSS)}</span>` : ''}
                </div>
            `;
        }

        html += `
                </div>
            </div>
        `;

        currentDay.setDate(currentDay.getDate() + 1);
    }

    html += '</div>';
    grid.innerHTML = html;

    // Event listeners para los días
    grid.querySelectorAll('.week-day').forEach(day => {
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
    // Los eventos usan start_date (YYYY-MM-DD) no start_date_local
    const dayEvents = eventsData.filter(e => (e.start_date_local?.split('T')[0] || e.start_date) === dateStr);

    // Formatear fecha
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const locale = t('common.locale') || 'es-ES';
    const formattedDate = date.toLocaleDateString(locale, options);

    if (dayActivities.length === 0 && dayEvents.length === 0) {
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
    const plannedLoad = dayEvents.reduce((sum, e) => sum + (e.icu_training_load || e.load_target || 0), 0);

    let html = `
        <div class="detail-header">
            <h3>${formattedDate}</h3>
            <button class="detail-close" onclick="this.parentElement.parentElement.classList.remove('active')">&times;</button>
        </div>
        <div class="detail-summary">
            ${dayEvents.length > 0 ? `
                <div class="summary-item">
                    <span class="summary-value">${dayEvents.length}</span>
                    <span class="summary-label">${t('activities.calendar.planned')}</span>
                </div>
            ` : ''}
            ${dayActivities.length > 0 ? `
                <div class="summary-item">
                    <span class="summary-value">${dayActivities.length}</span>
                    <span class="summary-label">${t('activities.calendar.completed')}</span>
                </div>
            ` : ''}
            ${plannedLoad > 0 ? `
                <div class="summary-item">
                    <span class="summary-value">${Math.round(plannedLoad)}</span>
                    <span class="summary-label">TSS ${t('activities.calendar.planned')}</span>
                </div>
            ` : ''}
            ${totalTSS > 0 ? `
                <div class="summary-item">
                    <span class="summary-value">${Math.round(totalTSS)}</span>
                    <span class="summary-label">TSS ${t('activities.calendar.completed')}</span>
                </div>
            ` : ''}
            ${totalTime > 0 ? `
                <div class="summary-item">
                    <span class="summary-value">${formatDuration(totalTime)}</span>
                    <span class="summary-label">${t('activities.time')}</span>
                </div>
            ` : ''}
            ${totalDistance > 0 ? `
                <div class="summary-item">
                    <span class="summary-value">${(totalDistance / 1000).toFixed(1)}</span>
                    <span class="summary-label">km</span>
                </div>
            ` : ''}
        </div>
    `;

    // Mostrar eventos programados
    if (dayEvents.length > 0) {
        html += `
            <h4 class="detail-section-title">📋 ${t('activities.calendar.plannedWorkouts')}</h4>
            <div class="detail-events-list">
        `;
        
        dayEvents.forEach(event => {
            const duration = event.moving_time ? formatDuration(event.moving_time) : (event.duration ? formatDuration(event.duration) : '');
            const load = event.icu_training_load || event.load_target || 0;
            
            html += `
                <div class="detail-event-card">
                    <div class="event-card-header">
                        <span class="event-icon">📋</span>
                        <div class="event-info">
                            <span class="event-name">${event.name || event.description || t('activities.calendar.workout')}</span>
                            <span class="event-type">${event.type || event.category || 'Workout'}</span>
                        </div>
                    </div>
                    ${event.description && event.description !== event.name ? `
                        <div class="event-description">${event.description}</div>
                    ` : ''}
                    <div class="event-card-metrics">
                        ${duration ? `
                            <div class="metric-item">
                                <span class="metric-icon">⏱️</span>
                                <span>${duration}</span>
                            </div>
                        ` : ''}
                        ${load > 0 ? `
                            <div class="metric-item">
                                <span class="metric-icon">💪</span>
                                <span>TSS ${Math.round(load)}</span>
                            </div>
                        ` : ''}
                        ${event.distance ? `
                            <div class="metric-item">
                                <span class="metric-icon">📏</span>
                                <span>${(event.distance / 1000).toFixed(1)} km</span>
                            </div>
                        ` : ''}
                    </div>
                    ${event.workout_doc ? renderWorkoutSteps(event.workout_doc) : ''}
                </div>
            `;
        });
        
        html += '</div>';
    }

    // Mostrar actividades completadas
    if (dayActivities.length > 0) {
        html += `
            <h4 class="detail-section-title">✅ ${t('activities.calendar.completedActivities')}</h4>
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
    }

    detailContainer.innerHTML = html;
    detailContainer.classList.add('active');
}

/**
 * Renderiza los pasos de un workout estructurado
 */
function renderWorkoutSteps(workoutDoc) {
    if (!workoutDoc || !workoutDoc.steps || workoutDoc.steps.length === 0) return '';
    
    let html = '<div class="workout-steps">';
    
    workoutDoc.steps.forEach((step, index) => {
        const duration = step.duration ? formatDuration(step.duration) : '';
        const power = step.power ? `${step.power.value}${step.power.units === 'PERCENT_FTP' ? '% FTP' : 'W'}` : '';
        const cadence = step.cadence ? `${step.cadence.value} rpm` : '';
        
        html += `
            <div class="workout-step ${step.ramp ? 'ramp' : ''}">
                <span class="step-number">${index + 1}</span>
                <div class="step-details">
                    ${step.name ? `<span class="step-name">${step.name}</span>` : ''}
                    <div class="step-metrics">
                        ${duration ? `<span>⏱️ ${duration}</span>` : ''}
                        ${power ? `<span>⚡ ${power}</span>` : ''}
                        ${cadence ? `<span>🔄 ${cadence}</span>` : ''}
                    </div>
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    return html;
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

/**
 * Formatea una fecha a YYYY-MM-DD en zona local (evita problemas con UTC)
 */
function formatDateLocal(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}
