import { getWellnessData } from '../apiService.js';
import { renderWellnessChart } from '../charts.js';

const NA_CELL = '<span class="na">N/A</span>';

/**
 * Renderiza el contenido del panel de bienestar.
 */
export async function renderWellnessPanel(container, athleteId) {
    container.innerHTML = '<h3>Cargando datos de bienestar...</h3>';

    // Rango de fechas por defecto (ej. últimos 14 días)
    const today = new Date();
    const oldest = new Date();
    oldest.setDate(today.getDate() - 14);
    
    const oldestISO = oldest.toISOString().split('T')[0];
    const newestISO = today.toISOString().split('T')[0];

    try {
        const data = await getWellnessData(athleteId, oldestISO, newestISO);
        
        const reversedData = [...data].reverse();

        // Estructura del panel
        container.innerHTML = `
            <div class="dashboard-grid">
                <div class="chart-container">
                    <h3>Tendencias de Bienestar (Últimos 14 días)</h3>
                    <canvas id="wellness-chart"></canvas>
                </div>
                
                <div class="data-table">
                    <h3>Registro Diario</h3>
                    <table>
                        <thead>
                            <tr>
                                <th>Fecha</th>
                                <th>RHR</th>
                                <th>HRV</th>
                                <th>Sueño (h)</th>
                                <th>Puntuación Sueño</th>
                                <th>Dolor</th>
                                <th>Fatiga</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${reversedData.map(day => createTableRow(day)).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;

        // Renderizar el gráfico después de que el canvas esté en el DOM
        renderWellnessChart('wellness-chart', data);

    } catch (error) {
        console.error(error);
        container.innerHTML = '<h3>Error al cargar los datos de bienestar.</h3>';
    }
}

/**
 * Helper para crear una fila de la tabla de bienestar.
 */
function createTableRow(day) {
    const sleepHours = day.sleepSecs ? (day.sleepSecs / 3600).toFixed(1) : NA_CELL;
    
    return `
        <tr>
            <td>${day.id}</td>
            <td>${day.restingHR || NA_CELL}</td>
            <td>${day.hrv || NA_CELL}</td>
            <td>${sleepHours}</td>
            <td>${day.sleepScore || NA_CELL}</td>
            <td>${day.soreness || NA_CELL}</td>
            <td>${day.fatigue || NA_CELL}</td>
        </tr>
    `;
}
