import { getActivityData } from '../apiService.js';

const NA_CELL = '<span class="na">N/A</span>';

/**
 * Renderiza el panel de actividades.
 */
export async function renderActivityFeed(container, athleteId) {
    container.innerHTML = '<h3>Cargando actividades...</h3>';
    
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
                <h3>Actividades Recientes</h3>
                <table>
                    <thead>
                        <tr>
                            <th>Fecha</th>
                            <th>Nombre</th>
                            <th>Tipo</th>
                            <th>Tiempo</th>
                            <th>Distancia (km)</th>
                            <th>Carga (TSS)</th>
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
        container.innerHTML = '<h3>Error al cargar actividades.</h3>';
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
