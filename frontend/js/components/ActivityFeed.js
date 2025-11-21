import { getActivityData } from '../apiService.js';
import { t } from '../i18n.js';

const NA_CELL = '<span class="na">N/A</span>';

/**
 * Renderiza el panel de actividades.
 */
export async function renderActivityFeed(container, athleteId) {
    container.innerHTML = `<h3 data-i18n="activities.loading">${t('activities.loading')}</h3>`;
    
    // Rango de fechas por defecto
    const today = new Date();
    const oldest = new Date();
    oldest.setDate(today.getDate() - 14);
    
    const oldestISO = oldest.toISOString().split('T')[0];
    const newestISO = today.toISOString().split('T')[0];

    try {
        //
        const data = await getActivityData(athleteId, oldestISO, newestISO);
        
        const reversedData = [...data].reverse(); 

        container.innerHTML = `
            <div class="data-table">
                <h3 data-i18n="activities.title">${t('activities.title')}</h3>
                <table>
                    <thead>
                        <tr>
                            <th data-i18n="activities.date">${t('activities.date')}</th>
                            <th data-i18n="activities.name">${t('activities.name')}</th>
                            <th data-i18n="activities.type">${t('activities.type')}</th>
                            <th data-i18n="activities.time">${t('activities.time')}</th>
                            <th data-i18n="activities.distance">${t('activities.distance')}</th>
                            <th data-i18n="activities.load">${t('activities.load')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${reversedData.map(activity => createActivityRow(activity)).join('')}
                    </tbody>
                </table>
            </div>
        `;

    } catch (error) {
        console.error(error);
        container.innerHTML = `<h3 data-i18n="activities.error">${t('activities.error')}</h3>`;
    }
}

function createActivityRow(activity) {
    const distanceKm = activity.distance ? (activity.distance / 1000).toFixed(1) : NA_CELL;
    // Formatear moving_time (segundos) a hh:mm:ss
    const time = new Date(activity.moving_time * 1000).toISOString().substr(11, 8);
    
    return `
        <tr>
            <td>${activity.start_date_local.split('T')[0]}</td>
            <td>${activity.name}</td>
            <td>${activity.type}</td>
            <td>${time}</td>
            <td>${distanceKm}</td>
            <td>${activity.icu_training_load || NA_CELL}</td>
        </tr>
    `;
}
