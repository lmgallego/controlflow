import { getPowerCurves, getTrainingZones } from '../apiService.js';
import { t } from '../i18n.js';

let powerCurveChart = null;
let modalChart = null;
let currentPeriodData = null;
let historicalData = null;
let currentAthleteId = null;

/**
 * Renderiza el panel de Curva de Potencia (PDC)
 */
export async function renderPDCPanel(container, athleteId) {
    currentAthleteId = athleteId;
    
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
                    <button id="pdc-expand-btn" class="pdc-expand-btn" title="${t('common.expand')}">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>
                        </svg>
                    </button>
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
        
        <!-- Sección de Zonas de Entrenamiento -->
        <div class="zones-panel">
            <div class="zones-header">
                <h3>${t('zones.title')}</h3>
            </div>
            <div class="zones-content" id="zones-content">
                <div class="pdc-loading">
                    <div class="spinner"></div>
                </div>
            </div>
        </div>
        
        <!-- Modal para PDC expandido (solo gráfico) -->
        <div id="pdc-modal" class="pdc-modal">
            <div class="pdc-modal-content pdc-modal-chart-only">
                <div class="pdc-modal-header">
                    <h3>${t('pdc.title')}</h3>
                    <button id="pdc-modal-close" class="pdc-modal-close">&times;</button>
                </div>
                <div class="pdc-modal-body-chart-only">
                    <div class="pdc-chart-legend">
                        <span class="legend-item"><span class="legend-line dashed"></span>${t('pdc.realCurve')}</span>
                        <span class="legend-item"><span class="legend-line solid"></span>${t('pdc.modeledCurve')}</span>
                    </div>
                    <div class="pdc-modal-chart-container">
                        <canvas id="pdc-modal-chart"></canvas>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Event listeners
    document.getElementById('pdc-period')?.addEventListener('change', () => loadPowerCurveData(athleteId));
    document.getElementById('pdc-type')?.addEventListener('change', () => loadPowerCurveData(athleteId));
    document.getElementById('pdc-expand-btn')?.addEventListener('click', openPDCModal);
    document.getElementById('pdc-modal-close')?.addEventListener('click', closePDCModal);
    document.getElementById('pdc-modal')?.addEventListener('click', (e) => {
        if (e.target.id === 'pdc-modal') closePDCModal();
    });

    // Cargar datos iniciales
    await Promise.all([
        loadPowerCurveData(athleteId),
        loadTrainingZones(athleteId)
    ]);
}

/**
 * Abre el modal con el PDC expandido
 */
function openPDCModal() {
    const modal = document.getElementById('pdc-modal');
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // Renderizar gráfico en el modal
        if (currentPeriodData) {
            setTimeout(() => {
                renderModalChart(currentPeriodData);
            }, 100);
        }
    }
}

/**
 * Cierra el modal
 */
function closePDCModal() {
    const modal = document.getElementById('pdc-modal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
        if (modalChart) {
            modalChart.destroy();
            modalChart = null;
        }
    }
}

/**
 * Renderiza el gráfico en el modal
 */
function renderModalChart(curveData) {
    const ctx = document.getElementById('pdc-modal-chart');
    if (!ctx) return;

    if (modalChart) {
        modalChart.destroy();
    }

    const secs = curveData.secs || [];
    const values = curveData.watts || curveData.values || [];

    const realDataPoints = [];
    let maxSeconds = 0;
    for (let i = 0; i < secs.length; i++) {
        if (values[i] && values[i] > 0) {
            realDataPoints.push({ x: secs[i], y: values[i] });
            maxSeconds = Math.max(maxSeconds, secs[i]);
        }
    }

    const modeledDataPoints = generateSmoothedCurve(secs, values);
    const tickValues = [1, 5, 10, 20, 30, 60, 120, 300, 600, 1200, 1800, 3600, 7200];

    modalChart = new Chart(ctx, {
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
                    borderWidth: 2.5,
                    order: 1
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    type: 'logarithmic',
                    min: 1,
                    max: maxSeconds || 7200,
                    title: { display: true, text: t('pdc.duration'), color: '#9ca3af' },
                    ticks: {
                        color: '#9ca3af',
                        callback: (value) => tickValues.includes(value) ? formatDuration(value) : ''
                    },
                    afterBuildTicks: (axis) => {
                        axis.ticks = tickValues.filter(v => v <= (maxSeconds || 7200)).map(v => ({ value: v }));
                    },
                    grid: { color: 'rgba(255, 255, 255, 0.06)' }
                },
                y: {
                    title: { display: true, text: t('pdc.watts'), color: '#9ca3af' },
                    ticks: { color: '#9ca3af' },
                    grid: { color: 'rgba(255, 255, 255, 0.06)' }
                }
            },
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: 'rgba(17, 24, 39, 0.95)',
                    callbacks: {
                        title: (ctx) => formatDuration(ctx[0].parsed.x),
                        label: (ctx) => `${ctx.dataset.label}: ${Math.round(ctx.parsed.y)} W`
                    }
                }
            }
        }
    });
}

/**
 * Carga las zonas de entrenamiento
 */
async function loadTrainingZones(athleteId) {
    const container = document.getElementById('zones-content');
    if (!container) return;

    try {
        const zones = await getTrainingZones(athleteId);
        renderTrainingZones(zones);
    } catch (error) {
        console.error('Error loading training zones:', error);
        container.innerHTML = `<p class="error-message">${t('common.error')}</p>`;
    }
}

/**
 * Renderiza las zonas de entrenamiento
 */
function renderTrainingZones(zones) {
    const container = document.getElementById('zones-content');
    if (!container) return;

    const hasOutdoor = zones.outdoor && zones.outdoor.ftp;
    const hasIndoor = zones.indoor && zones.indoor.ftp;

    if (!hasOutdoor && !hasIndoor) {
        container.innerHTML = `<p class="no-data">${t('zones.noData')}</p>`;
        return;
    }

    let html = '<div class="zones-grid">';

    // Zonas Outdoor (Ride)
    if (hasOutdoor) {
        html += renderZoneCard(zones.outdoor, 'outdoor', t('zones.outdoor'));
    }

    // Zonas Indoor (VirtualRide)
    if (hasIndoor) {
        html += renderZoneCard(zones.indoor, 'indoor', t('zones.indoor'));
    }

    html += '</div>';
    container.innerHTML = html;
}

/**
 * Renderiza una tarjeta de zonas
 */
function renderZoneCard(data, type, title) {
    const zoneColors = [
        '#94a3b8', // Z1 - Gris
        '#3b82f6', // Z2 - Azul
        '#22c55e', // Z3 - Verde
        '#eab308', // Z4 - Amarillo
        '#f97316', // Z5 - Naranja
        '#ef4444', // Z6 - Rojo
        '#a855f7'  // Z7 - Púrpura
    ];

    const powerZones = data.power_zones || []; // Estos son porcentajes del FTP
    const zoneNames = data.power_zone_names || ['Z1', 'Z2', 'Z3', 'Z4', 'Z5', 'Z6', 'Z7'];
    const ftp = data.ftp || 0;

    let zonesHtml = '';
    for (let i = 0; i < powerZones.length; i++) {
        const zoneName = zoneNames[i] || `Z${i + 1}`;
        const zoneMaxPercent = powerZones[i]; // Porcentaje del FTP
        const zoneMinPercent = i === 0 ? 0 : powerZones[i - 1];
        const color = zoneColors[i] || zoneColors[zoneColors.length - 1];
        
        // Calcular watts a partir del porcentaje del FTP
        const zoneMinWatts = Math.round((zoneMinPercent / 100) * ftp);
        const zoneMaxWatts = Math.round((zoneMaxPercent / 100) * ftp);

        zonesHtml += `
            <div class="zone-row">
                <div class="zone-color" style="background: ${color}"></div>
                <div class="zone-name">${zoneName}</div>
                <div class="zone-range">${zoneMinWatts} - ${zoneMaxWatts} W</div>
                <div class="zone-percentage">${zoneMaxPercent}%</div>
            </div>
        `;
    }

    return `
        <div class="zone-card ${type}">
            <div class="zone-card-header">
                <h4>${title}</h4>
                <div class="zone-ftp">
                    <span class="ftp-label">FTP</span>
                    <span class="ftp-value">${ftp} W</span>
                </div>
            </div>
            <div class="zone-card-body">
                ${zonesHtml}
            </div>
            ${data.w_prime ? `
                <div class="zone-card-footer">
                    <span>W': ${Math.round(data.w_prime / 1000)} kJ</span>
                    ${data.p_max ? `<span>Pmax: ${data.p_max} W</span>` : ''}
                </div>
            ` : ''}
        </div>
    `;
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
 * Genera curva modelada suavizada usando los datos reales
 * Aplica suavizado con media móvil ponderada en escala logarítmica
 */
function generateSmoothedCurve(secs, values) {
    const points = [];
    
    // Crear pares válidos de datos
    const validData = [];
    for (let i = 0; i < secs.length; i++) {
        if (values[i] && values[i] > 0 && secs[i] > 0) {
            validData.push({ x: Math.log10(secs[i]), y: values[i], origX: secs[i] });
        }
    }
    
    if (validData.length < 5) return [];
    
    // Ordenar por tiempo
    validData.sort((a, b) => a.x - b.x);
    
    // Aplicar suavizado con ventana adaptativa
    const windowSize = Math.max(5, Math.floor(validData.length * 0.08));
    
    for (let i = 0; i < validData.length; i++) {
        let sumWeight = 0;
        let sumValue = 0;
        
        for (let j = Math.max(0, i - windowSize); j <= Math.min(validData.length - 1, i + windowSize); j++) {
            // Peso gaussiano basado en distancia
            const dist = Math.abs(i - j);
            const weight = Math.exp(-0.5 * Math.pow(dist / (windowSize / 2), 2));
            sumWeight += weight;
            sumValue += validData[j].y * weight;
        }
        
        const smoothedValue = sumValue / sumWeight;
        points.push({ x: validData[i].origX, y: Math.round(smoothedValue) });
    }
    
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

    // Generar curva modelada suavizada
    const modeledDataPoints = generateSmoothedCurve(secs, values);

    console.log('PDC Data points:', realDataPoints.length, 'Smoothed points:', modeledDataPoints.length);

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
