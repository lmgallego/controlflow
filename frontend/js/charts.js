// Un módulo helper para encapsular la lógica de Chart.js
let activeCharts = {}; // Almacena instancias de gráficos activos

/**
 * Destruye un gráfico existente si está en el canvas.
 */
function destroyChart(canvasId) {
    if (activeCharts[canvasId]) {
        activeCharts[canvasId].destroy();
        delete activeCharts[canvasId];
    }
}

/**
 * Renderiza el gráfico principal de Bienestar.
 */
export function renderWellnessChart(canvasId, wellnessData) {
    destroyChart(canvasId); // Limpiar gráfico anterior
    
    const canvas = document.getElementById(canvasId);
    if (!canvas) return; // Salir si el canvas no está en el DOM
    
    const ctx = canvas.getContext('2d');
    
    // Formatear los datos para Chart.js
    const labels = wellnessData.map(d => new Date(d.id));
    const rhrData = wellnessData.map(d => d.restingHR);
    const hrvData = wellnessData.map(d => d.hrv);

    activeCharts[canvasId] = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'RHR (ppm)',
                    data: rhrData,
                    borderColor: '#4A90E2',
                    backgroundColor: '#4A90E2',
                    yAxisID: 'yRHR',
                },
                {
                    label: 'HRV (ms)',
                    data: hrvData,
                    borderColor: '#34C759',
                    backgroundColor: '#34C759',
                    yAxisID: 'yHRV',
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    type: 'time',
                    time: {
                        unit: 'day'
                    },
                    adapters: {
                        date: window.chartjsAdapterDateFns,
                    },
                    grid: { color: '#333' }
                },
                yRHR: {
                    type: 'linear',
                    position: 'left',
                    grid: { color: '#333' }
                },
                yHRV: {
                    type: 'linear',
                    position: 'right',
                    grid: { display: false } // Ocultar rejilla en el segundo eje
                }
            }
        }
    });
}
