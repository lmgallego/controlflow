import { getPowerCurves } from '../apiService.js';
import { t } from '../i18n.js';

let powerCurveChart = null;
let currentPeriodData = null;
let historicalData = null;

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
                    <div class="pdc-chart-legend">
                        <span class="legend-item"><span class="legend-line dashed"></span>${t('pdc.realCurve')}</span>
                        <span class="legend-item"><span class="legend-line solid"></span>${t('pdc.modeledCurve')}</span>
                    </div>
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
 * Carga los datos de la curva de potencia (período seleccionado + histórico)
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
        // Cargar datos del período seleccionado y datos históricos en paralelo
        const [periodData, allTimeData] = await Promise.all([
            getPowerCurves(athleteId, type, period, true, 3),
            period !== 'all' ? getPowerCurves(athleteId, type, 'all', true, 3) : null
        ]);

        console.log('Power curves data:', periodData);
        console.log('Historical data:', allTimeData);

        if (periodData && periodData.list && periodData.list.length > 0) {
            currentPeriodData = periodData.list[0];
            historicalData = allTimeData?.list?.[0] || currentPeriodData;
            
            renderPowerCurveChart(currentPeriodData);
            renderBestEffortsCards(currentPeriodData, historicalData);
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
 * Formatea duración en segundos a formato legible
 */
function formatDuration(seconds) {
    if (seconds < 60) return `${Math.round(seconds)}s`;
    if (seconds < 3600) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return secs > 0 ? `${mins}m${secs}s` : `${mins}m`;
    }
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return mins > 0 ? `${hours}h${mins}m` : `${hours}h`;
}

/**
 * Calcula el modelo CP (Critical Power) usando método de 2 puntos
 * Modelo: P = W' / t + CP
 * Donde W' es la capacidad anaeróbica y CP es la potencia crítica
 */
function calculateCPModel(secs, values) {
    // Obtener potencias a 3min y 12min (método clásico de 2 puntos)
    const p3min = getValueAtDuration(secs, values, 180);
    const p12min = getValueAtDuration(secs, values, 720);
    
    if (!p3min || !p12min || p3min <= 0 || p12min <= 0) {
        // Fallback si no hay datos suficientes
        const p5min = getValueAtDuration(secs, values, 300) || 200;
        const p20min = getValueAtDuration(secs, values, 1200) || 180;
        const cp = p20min * 0.95;
        const wprime = (p5min - cp) * 300;
        return { cp, wprime: Math.max(wprime, 10000), maxPower: getValueAtDuration(secs, values, 1) || p5min * 2 };
    }

    // Método de 2 puntos: CP = (t2*P2 - t1*P1) / (t2 - t1)
    // W' = t1 * (P1 - CP)
    const t1 = 180;  // 3 minutos
    const t2 = 720;  // 12 minutos
    
    const cp = (t2 * p12min - t1 * p3min) / (t2 - t1);
    const wprime = t1 * (p3min - cp);
    
    // Obtener potencia máxima real de los datos
    const maxPower = getValueAtDuration(secs, values, 1) || getValueAtDuration(secs, values, 5) || p3min * 1.5;

    return { 
        cp: Math.max(cp, 50),
        wprime: Math.max(wprime, 5000),
        maxPower: maxPower
    };
}

/**
 * Obtiene el valor de potencia para una duración específica
 */
function getValueAtDuration(secs, values, targetSecs) {
    let closestIndex = -1;
    let minDiff = Infinity;
    
    for (let i = 0; i < secs.length; i++) {
        const diff = Math.abs(secs[i] - targetSecs);
        if (diff < minDiff && values[i] > 0) {
            minDiff = diff;
            closestIndex = i;
        }
    }
    
    return closestIndex >= 0 ? values[closestIndex] : null;
}

/**
 * Genera puntos para la curva modelada (limitada por potencia máxima real)
 */
function generateModeledCurve(cp, wprime, maxSeconds, maxPower) {
    const points = [];
    // Generar puntos logarítmicamente espaciados
    const durations = [1, 2, 3, 5, 10, 15, 20, 30, 45, 60, 90, 120, 180, 240, 300, 
                       360, 420, 480, 600, 720, 900, 1200, 1500, 1800, 2400, 3000, 3600, 
                       4500, 5400, 7200, 10800];
    
    durations.forEach(t => {
        if (t <= maxSeconds) {
            // Modelo: P = W' / t + CP, pero limitado por la potencia máxima real
            let power = (wprime / t) + cp;
            // Limitar la potencia máxima para duraciones cortas
            power = Math.min(power, maxPower * 1.1);
            points.push({ x: t, y: Math.round(power) });
        }
    });
    
    return points;
}

/**
 * Renderiza el gráfico de la curva de potencia con curva modelada
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

    // Filtrar valores válidos y crear pares para la curva real
    const realDataPoints = [];
    let maxSeconds = 0;
    for (let i = 0; i < secs.length; i++) {
        if (values[i] && values[i] > 0) {
            realDataPoints.push({ x: secs[i], y: values[i] });
            maxSeconds = Math.max(maxSeconds, secs[i]);
        }
    }

    // Calcular modelo CP y generar curva modelada
    const { cp, wprime, maxPower } = calculateCPModel(secs, values);
    const modeledDataPoints = generateModeledCurve(cp, wprime, maxSeconds, maxPower);

    console.log('CP Model:', { cp: Math.round(cp), wprime: Math.round(wprime / 1000) + 'kJ', maxPower });

    // Etiquetas específicas para el eje X
    const tickValues = [1, 5, 10, 20, 30, 60, 120, 300, 600, 1200, 1800, 3600, 7200];

    powerCurveChart = new Chart(ctx, {
        type: 'line',
        data: {
            datasets: [
                {
                    label: t('pdc.realCurve'),
                    data: realDataPoints,
                    borderColor: 'rgba(251, 191, 36, 0.8)',
                    backgroundColor: 'rgba(251, 191, 36, 0.15)',
                    fill: true,
                    tension: 0.3,
                    pointRadius: 0,
                    pointHoverRadius: 5,
                    pointHoverBackgroundColor: '#fbbf24',
                    borderWidth: 2,
                    borderDash: [5, 5],
                    order: 2
                },
                {
                    label: t('pdc.modeledCurve'),
                    data: modeledDataPoints,
                    borderColor: '#ef4444',
                    backgroundColor: 'transparent',
                    fill: false,
                    tension: 0.4,
                    pointRadius: 0,
                    pointHoverRadius: 5,
                    pointHoverBackgroundColor: '#ef4444',
                    borderWidth: 2.5,
                    order: 1
                }
            ]
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
                    min: 1,
                    max: maxSeconds || 7200,
                    title: {
                        display: true,
                        text: t('pdc.duration'),
                        color: '#9ca3af',
                        font: { size: 12, weight: '600' }
                    },
                    ticks: {
                        color: '#9ca3af',
                        maxRotation: 45,
                        minRotation: 0,
                        autoSkip: false,
                        callback: function(value) {
                            // Solo mostrar etiquetas específicas
                            if (tickValues.includes(value)) {
                                return formatDuration(value);
                            }
                            return '';
                        }
                    },
                    afterBuildTicks: function(axis) {
                        axis.ticks = tickValues
                            .filter(v => v <= (maxSeconds || 7200))
                            .map(v => ({ value: v }));
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.06)'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: t('pdc.watts'),
                        color: '#9ca3af',
                        font: { size: 12, weight: '600' }
                    },
                    ticks: {
                        color: '#9ca3af'
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.06)'
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
                            const label = context.dataset.label || '';
                            return `${label}: ${Math.round(context.parsed.y)} W`;
                        }
                    }
                }
            }
        }
    });
}

/**
 * Renderiza las tarjetas de mejores esfuerzos con comparación histórica
 */
function renderBestEffortsCards(currentData, historicalData) {
    const cardsContainer = document.getElementById('pdc-cards');
    if (!cardsContainer) return;

    const currentSecs = currentData.secs || [];
    const currentValues = currentData.watts || currentData.values || [];
    const historicalSecs = historicalData?.secs || currentSecs;
    const historicalValues = historicalData?.watts || historicalData?.values || currentValues;

    // Duraciones clave que queremos mostrar
    const keyDurations = [
        { seconds: 5, label: '5s' },
        { seconds: 30, label: '30s' },
        { seconds: 60, label: '1min' },
        { seconds: 180, label: '3min' },
        { seconds: 300, label: '5min' },
        { seconds: 720, label: '12min' },
        { seconds: 1200, label: '20min' },
        { seconds: 3600, label: '1h' }
    ];

    // Encontrar los valores para cada duración clave
    const efforts = keyDurations.map(duration => {
        const currentPower = getValueAtDuration(currentSecs, currentValues, duration.seconds);
        const historicalPower = getValueAtDuration(historicalSecs, historicalValues, duration.seconds);
        
        return {
            ...duration,
            current: currentPower && currentPower > 0 ? Math.round(currentPower) : null,
            historical: historicalPower && historicalPower > 0 ? Math.round(historicalPower) : null
        };
    });

    // Obtener el período seleccionado para el label
    const periodSelect = document.getElementById('pdc-period');
    const periodLabel = periodSelect?.options[periodSelect.selectedIndex]?.text || '90 días';

    let html = '';
    efforts.forEach(effort => {
        if (effort.current || effort.historical) {
            const current = effort.current || 0;
            const historical = effort.historical || current;
            const percentage = historical > 0 ? Math.round((current / historical) * 100) : 100;
            const diff = current - historical;
            const diffClass = diff >= 0 ? 'positive' : 'negative';
            const diffSign = diff >= 0 ? '+' : '';
            
            html += `
                <div class="pdc-card-new">
                    <div class="pdc-card-header">
                        <span class="pdc-card-duration">${effort.label}</span>
                    </div>
                    <div class="pdc-card-body">
                        <div class="pdc-card-column current">
                            <span class="column-label">${t('pdc.selected')}</span>
                            <span class="column-value">${current}<small>W</small></span>
                        </div>
                        <div class="pdc-card-column historical">
                            <span class="column-label">${t('pdc.allTime')}</span>
                            <span class="column-value">${historical}<small>W</small></span>
                        </div>
                        <div class="pdc-card-column chart">
                            <div class="mini-chart">
                                <div class="mini-chart-bar">
                                    <div class="mini-chart-fill" style="width: ${Math.min(percentage, 100)}%"></div>
                                    <div class="mini-chart-target"></div>
                                </div>
                                <span class="mini-chart-label ${diffClass}">${diffSign}${diff}W</span>
                            </div>
                            <span class="percentage-label">${percentage}%</span>
                        </div>
                    </div>
                </div>
            `;
        }
    });

    if (html === '') {
        html = `<p class="no-data">${t('pdc.noData')}</p>`;
    }

    cardsContainer.innerHTML = html;
}
