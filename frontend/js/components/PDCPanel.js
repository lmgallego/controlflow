import { getPowerCurves } from '../apiService.js';
import { t } from '../i18n.js';

let powerCurveChart = null;

/**
 * Renderiza el panel de Curva de Potencia (PDC)
 */
export async function renderPDCPanel(container, athleteId) {
    container.innerHTML = `
        <div class="pdc-panel">
            <div class="pdc-header">
                <h3>${t('pdc.title')}</h3>
                <div class="pdc-controls">
                    <select id="pdc-period" class="pdc-select">
                        <option value="42d">${t('pdc.periods.42d')}</option>
                        <option value="90d" selected>${t('pdc.periods.90d')}</option>
                        <option value="180d">${t('pdc.periods.180d')}</option>
                        <option value="1y">${t('pdc.periods.1y')}</option>
                        <option value="all">${t('pdc.periods.all')}</option>
                    </select>
                    <select id="pdc-type" class="pdc-select">
                        <option value="Ride" selected>${t('pdc.types.ride')}</option>
                        <option value="VirtualRide">${t('pdc.types.virtualRide')}</option>
                        <option value="Run">${t('pdc.types.run')}</option>
                    </select>
                </div>
            </div>
            <div class="pdc-content">
                <div class="pdc-chart-section">
                    <div class="pdc-chart-container">
                        <canvas id="pdc-chart"></canvas>
                    </div>
                </div>
                <div class="pdc-cards-section">
                    <h4>${t('pdc.bestEfforts')}</h4>
                    <div class="pdc-cards" id="pdc-cards">
                        <div class="pdc-loading">
                            <div class="spinner"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Event listeners para los selectores
    document.getElementById('pdc-period')?.addEventListener('change', () => loadPowerCurveData(athleteId));
    document.getElementById('pdc-type')?.addEventListener('change', () => loadPowerCurveData(athleteId));

    // Cargar datos iniciales
    await loadPowerCurveData(athleteId);
}

/**
 * Carga los datos de la curva de potencia
 */
async function loadPowerCurveData(athleteId) {
    const period = document.getElementById('pdc-period')?.value || '90d';
    const type = document.getElementById('pdc-type')?.value || 'Ride';
    const cardsContainer = document.getElementById('pdc-cards');

    if (cardsContainer) {
        cardsContainer.innerHTML = `
            <div class="pdc-loading">
                <div class="spinner"></div>
            </div>
        `;
    }

    try {
        const data = await getPowerCurves(athleteId, type, period, true, 3);
        console.log('Power curves data:', data);

        if (data && data.list && data.list.length > 0) {
            const curveData = data.list[0];
            renderPowerCurveChart(curveData);
            renderBestEffortsCards(curveData);
        } else {
            if (cardsContainer) {
                cardsContainer.innerHTML = `<p class="no-data">${t('pdc.noData')}</p>`;
            }
        }
    } catch (error) {
        console.error('Error loading power curves:', error);
        if (cardsContainer) {
            cardsContainer.innerHTML = `<p class="error-message">${t('common.error')}</p>`;
        }
    }
}

/**
 * Renderiza el gráfico de la curva de potencia
 */
function renderPowerCurveChart(curveData) {
    const ctx = document.getElementById('pdc-chart');
    if (!ctx) return;

    // Destruir gráfico anterior si existe
    if (powerCurveChart) {
        powerCurveChart.destroy();
    }

    const secs = curveData.secs || [];
    const values = curveData.watts || curveData.values || [];

    // Filtrar valores válidos y crear pares
    const dataPoints = [];
    for (let i = 0; i < secs.length; i++) {
        if (values[i] && values[i] > 0) {
            dataPoints.push({ x: secs[i], y: values[i] });
        }
    }

    // Crear labels legibles para el eje X
    const formatDuration = (seconds) => {
        if (seconds < 60) return `${seconds}s`;
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
        return `${Math.floor(seconds / 3600)}h`;
    };

    powerCurveChart = new Chart(ctx, {
        type: 'line',
        data: {
            datasets: [{
                label: t('pdc.power'),
                data: dataPoints,
                borderColor: '#6366f1',
                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                fill: true,
                tension: 0.4,
                pointRadius: 0,
                pointHoverRadius: 6,
                pointHoverBackgroundColor: '#6366f1',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                intersect: false,
                mode: 'index'
            },
            scales: {
                x: {
                    type: 'logarithmic',
                    title: {
                        display: true,
                        text: t('pdc.duration'),
                        color: '#9ca3af'
                    },
                    ticks: {
                        color: '#9ca3af',
                        callback: function(value) {
                            return formatDuration(value);
                        }
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.05)'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: t('pdc.watts'),
                        color: '#9ca3af'
                    },
                    ticks: {
                        color: '#9ca3af'
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.05)'
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(17, 24, 39, 0.95)',
                    titleColor: '#f3f4f6',
                    bodyColor: '#d1d5db',
                    borderColor: 'rgba(99, 102, 241, 0.3)',
                    borderWidth: 1,
                    padding: 12,
                    callbacks: {
                        title: function(context) {
                            const seconds = context[0].parsed.x;
                            return formatDuration(seconds);
                        },
                        label: function(context) {
                            return `${Math.round(context.parsed.y)} W`;
                        }
                    }
                }
            }
        }
    });
}

/**
 * Renderiza las tarjetas de mejores esfuerzos
 */
function renderBestEffortsCards(curveData) {
    const cardsContainer = document.getElementById('pdc-cards');
    if (!cardsContainer) return;

    const secs = curveData.secs || [];
    const values = curveData.watts || curveData.values || [];

    // Duraciones clave que queremos mostrar
    const keyDurations = [
        { seconds: 5, label: '5s', icon: '⚡' },
        { seconds: 30, label: '30s', icon: '🔥' },
        { seconds: 60, label: '1m', icon: '💪' },
        { seconds: 180, label: '3m', icon: '🚴' },
        { seconds: 300, label: '5m', icon: '⏱️' },
        { seconds: 720, label: '12m', icon: '📈' },
        { seconds: 1200, label: '20m', icon: '🎯' },
        { seconds: 3600, label: '1h', icon: '🏆' }
    ];

    // Encontrar los valores para cada duración clave
    const efforts = keyDurations.map(duration => {
        // Buscar el índice más cercano
        let closestIndex = -1;
        let minDiff = Infinity;
        
        for (let i = 0; i < secs.length; i++) {
            const diff = Math.abs(secs[i] - duration.seconds);
            if (diff < minDiff) {
                minDiff = diff;
                closestIndex = i;
            }
        }

        const power = closestIndex >= 0 ? values[closestIndex] : null;
        
        return {
            ...duration,
            power: power && power > 0 ? Math.round(power) : null
        };
    });

    // Calcular W/kg si tenemos el peso del atleta (asumimos 70kg por defecto si no está disponible)
    const weight = curveData.athlete_weight || 70;

    let html = '';
    efforts.forEach(effort => {
        if (effort.power) {
            const wkg = (effort.power / weight).toFixed(2);
            html += `
                <div class="pdc-card">
                    <div class="pdc-card-icon">${effort.icon}</div>
                    <div class="pdc-card-duration">${effort.label}</div>
                    <div class="pdc-card-power">${effort.power}<span class="unit">W</span></div>
                    <div class="pdc-card-wkg">${wkg}<span class="unit">W/kg</span></div>
                </div>
            `;
        }
    });

    if (html === '') {
        html = `<p class="no-data">${t('pdc.noData')}</p>`;
    }

    cardsContainer.innerHTML = html;
}
