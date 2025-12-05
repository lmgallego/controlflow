import { getHRCurves, getTrainingZones } from '../apiService.js';
import { t } from '../i18n.js';

let hrCurveChart = null;
let modalChart = null;
let currentPeriodData = null;
let historicalData = null;
let currentAthleteId = null;
let hrZonesData = null;

/**
 * Renderiza el panel de Frecuencia Cardíaca
 */
export async function renderHRPanel(container, athleteId) {
    currentAthleteId = athleteId;
    
    container.innerHTML = `
        <div class="hr-panel">
            <div class="hr-header">
                <h3>${t('hr.title')}</h3>
                <div class="hr-controls">
                    <select id="hr-period" class="hr-select">
                        <option value="42d">${t('pdc.periods.42d')}</option>
                        <option value="90d" selected>${t('pdc.periods.90d')}</option>
                        <option value="180d">${t('pdc.periods.180d')}</option>
                        <option value="1y">${t('pdc.periods.1y')}</option>
                        <option value="all">${t('pdc.periods.all')}</option>
                    </select>
                    <select id="hr-type" class="hr-select">
                        <option value="Ride" selected>${t('pdc.types.ride')}</option>
                        <option value="VirtualRide">${t('pdc.types.virtualRide')}</option>
                        <option value="Run">${t('pdc.types.run')}</option>
                    </select>
                    <button id="hr-expand-btn" class="hr-expand-btn" title="${t('common.expand')}">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>
                        </svg>
                    </button>
                </div>
            </div>
            
            <!-- Dashboard de métricas -->
            <div class="hr-dashboard">
                <div class="hr-metrics-row">
                    <div class="hr-metric-card hr-max">
                        <div class="hr-metric-icon">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                            </svg>
                        </div>
                        <div class="hr-metric-content">
                            <span class="hr-metric-label">${t('hr.maxHR')}</span>
                            <span class="hr-metric-value" id="hr-max-value">--</span>
                            <span class="hr-metric-unit">bpm</span>
                        </div>
                    </div>
                    <div class="hr-metric-card hr-lthr">
                        <div class="hr-metric-icon">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                            </svg>
                        </div>
                        <div class="hr-metric-content">
                            <span class="hr-metric-label">${t('hr.lthr')}</span>
                            <span class="hr-metric-value" id="hr-lthr-value">--</span>
                            <span class="hr-metric-unit">bpm</span>
                        </div>
                    </div>
                    <div class="hr-metric-card hr-aerobic">
                        <div class="hr-metric-icon">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <circle cx="12" cy="12" r="10"/>
                                <polyline points="12 6 12 12 16 14"/>
                            </svg>
                        </div>
                        <div class="hr-metric-content">
                            <span class="hr-metric-label">${t('hr.aerobicThreshold')}</span>
                            <span class="hr-metric-value" id="hr-aerobic-value">--</span>
                            <span class="hr-metric-unit">bpm</span>
                        </div>
                    </div>
                    <div class="hr-metric-card hr-reserve">
                        <div class="hr-metric-icon">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M12 2v20M2 12h20"/>
                            </svg>
                        </div>
                        <div class="hr-metric-content">
                            <span class="hr-metric-label">${t('hr.hrReserve')}</span>
                            <span class="hr-metric-value" id="hr-reserve-value">--</span>
                            <span class="hr-metric-unit">bpm</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="hr-content">
                <div class="hr-chart-section">
                    <div class="hr-chart-legend">
                        <span class="legend-item"><span class="legend-line dashed hr-real"></span>${t('hr.realCurve')}</span>
                        <span class="legend-item"><span class="legend-line solid hr-smoothed"></span>${t('hr.smoothedCurve')}</span>
                    </div>
                    <div class="hr-chart-container">
                        <canvas id="hr-chart"></canvas>
                    </div>
                </div>
                <div class="hr-cards-section">
                    <h4>${t('hr.keyDurations')}</h4>
                    <div class="hr-cards" id="hr-cards">
                        <div class="hr-loading">
                            <div class="spinner"></div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Zonas de Frecuencia Cardíaca -->
            <div class="hr-zones-panel">
                <div class="hr-zones-header">
                    <h3>${t('hr.hrZones')}</h3>
                </div>
                <div class="hr-zones-content" id="hr-zones-content">
                    <div class="hr-loading">
                        <div class="spinner"></div>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Modal para HR expandido -->
        <div id="hr-modal" class="hr-modal">
            <div class="hr-modal-content hr-modal-chart-only">
                <div class="hr-modal-header">
                    <h3>${t('hr.title')}</h3>
                    <button id="hr-modal-close" class="hr-modal-close">&times;</button>
                </div>
                <div class="hr-modal-body-chart-only">
                    <div class="hr-chart-legend">
                        <span class="legend-item"><span class="legend-line dashed hr-real"></span>${t('hr.realCurve')}</span>
                        <span class="legend-item"><span class="legend-line solid hr-smoothed"></span>${t('hr.smoothedCurve')}</span>
                    </div>
                    <div class="hr-modal-chart-container">
                        <canvas id="hr-modal-chart"></canvas>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Event listeners
    document.getElementById('hr-period')?.addEventListener('change', () => loadHRCurveData(athleteId));
    document.getElementById('hr-type')?.addEventListener('change', () => loadHRCurveData(athleteId));
    document.getElementById('hr-expand-btn')?.addEventListener('click', openHRModal);
    document.getElementById('hr-modal-close')?.addEventListener('click', closeHRModal);
    document.getElementById('hr-modal')?.addEventListener('click', (e) => {
        if (e.target.id === 'hr-modal') closeHRModal();
    });

    // Cargar datos iniciales
    await Promise.all([
        loadHRCurveData(athleteId),
        loadHRZones(athleteId)
    ]);
}

/**
 * Carga las zonas de FC del atleta
 */
async function loadHRZones(athleteId) {
    const zonesContainer = document.getElementById('hr-zones-content');
    
    try {
        const zones = await getTrainingZones(athleteId);
        hrZonesData = zones;
        
        // Actualizar métricas del dashboard
        const outdoor = zones.outdoor || zones.indoor;
        if (outdoor) {
            const maxHR = outdoor.max_hr;
            const lthr = outdoor.lthr;
            
            if (maxHR) {
                document.getElementById('hr-max-value').textContent = maxHR;
            }
            if (lthr) {
                document.getElementById('hr-lthr-value').textContent = lthr;
                // Umbral aeróbico aproximado (85% del LTHR)
                const aerobicThreshold = Math.round(lthr * 0.85);
                document.getElementById('hr-aerobic-value').textContent = aerobicThreshold;
            }
            if (maxHR && lthr) {
                // Reserva de FC (diferencia entre max y LTHR)
                document.getElementById('hr-reserve-value').textContent = maxHR - lthr;
            }
            
            // Renderizar zonas de FC
            renderHRZones(outdoor, maxHR);
        } else if (zonesContainer) {
            zonesContainer.innerHTML = `<p class="no-data-message">${t('zones.noData')}</p>`;
        }
    } catch (error) {
        console.error('Error loading HR zones:', error);
        if (zonesContainer) {
            zonesContainer.innerHTML = `<p class="error-message">${t('common.error')}</p>`;
        }
    }
}

/**
 * Renderiza las zonas de FC visualmente
 */
function renderHRZones(zoneData, maxHR) {
    const container = document.getElementById('hr-zones-content');
    if (!container || !zoneData.hr_zones) return;

    const hrZones = zoneData.hr_zones;
    const zoneNames = zoneData.hr_zone_names || ['Z1', 'Z2', 'Z3', 'Z4', 'Z5', 'Z6'];
    const lthr = zoneData.lthr || maxHR;

    // Colores para zonas de FC
    const zoneColors = [
        '#94a3b8', // Z1 - Gris (Active Recovery)
        '#3b82f6', // Z2 - Azul (Endurance)
        '#22c55e', // Z3 - Verde (Tempo)
        '#eab308', // Z4 - Amarillo (Threshold)
        '#f97316', // Z5 - Naranja (VO2max)
        '#ef4444'  // Z6 - Rojo (Anaerobic)
    ];

    // Nombres descriptivos de zonas
    const zoneDescriptions = [
        t('hr.zoneNames.recovery'),
        t('hr.zoneNames.endurance'),
        t('hr.zoneNames.tempo'),
        t('hr.zoneNames.threshold'),
        t('hr.zoneNames.vo2max'),
        t('hr.zoneNames.anaerobic')
    ];

    let html = `
        <div class="hr-zones-card">
            <div class="hr-zones-card-header">
                <span class="hr-zones-card-title">${t('hr.hrZones')}</span>
                <span class="hr-zones-lthr">LTHR: <strong>${lthr}</strong> bpm</span>
            </div>
            <div class="hr-zones-list">
    `;

    for (let i = 0; i < hrZones.length; i++) {
        const minBpm = i === 0 ? 0 : hrZones[i - 1] + 1;
        const maxBpm = hrZones[i];
        const color = zoneColors[i] || zoneColors[zoneColors.length - 1];
        const zoneName = zoneNames[i] || `Z${i + 1}`;
        const description = zoneDescriptions[i] || '';
        
        // Calcular porcentaje del LTHR
        const minPercent = Math.round((minBpm / lthr) * 100);
        const maxPercent = Math.round((maxBpm / lthr) * 100);

        html += `
            <div class="hr-zone-row">
                <div class="hr-zone-color" style="background-color: ${color}"></div>
                <div class="hr-zone-name">
                    <span class="hr-zone-label">${zoneName}</span>
                    <span class="hr-zone-desc">${description}</span>
                </div>
                <div class="hr-zone-range">${minBpm} - ${maxBpm} bpm</div>
                <div class="hr-zone-percent">${minPercent}-${maxPercent}%</div>
            </div>
        `;
    }

    html += `
            </div>
        </div>
    `;

    container.innerHTML = html;
}

/**
 * Carga los datos de la curva de FC
 */
async function loadHRCurveData(athleteId) {
    const period = document.getElementById('hr-period')?.value || '90d';
    const type = document.getElementById('hr-type')?.value || 'Ride';
    const cardsContainer = document.getElementById('hr-cards');

    // Mostrar loading
    if (cardsContainer) {
        cardsContainer.innerHTML = `<div class="hr-loading"><div class="spinner"></div></div>`;
    }

    try {
        // Cargar período seleccionado y histórico en paralelo
        const [currentData, allTimeData] = await Promise.all([
            getHRCurves(athleteId, type, period),
            getHRCurves(athleteId, type, 'all')
        ]);

        // Extraer datos de la respuesta - la API devuelve { list: [...] }
        currentPeriodData = currentData?.list?.[0] || currentData;
        historicalData = allTimeData?.list?.[0] || allTimeData;

        // Verificar que tenemos datos válidos
        if (!currentPeriodData || !currentPeriodData.secs || currentPeriodData.secs.length === 0) {
            if (cardsContainer) {
                cardsContainer.innerHTML = `<p class="no-data-message">${t('common.na')}</p>`;
            }
            return;
        }

        renderHRCurveChart(currentPeriodData);
        renderHRCards(currentPeriodData, historicalData);

    } catch (error) {
        console.error('Error loading HR curve data:', error);
        if (cardsContainer) {
            cardsContainer.innerHTML = `<p class="error-message">${t('common.error')}: ${error.message || 'Error desconocido'}</p>`;
        }
    }
}

/**
 * Formatea duración en segundos a formato legible
 */
function formatDuration(seconds) {
    if (seconds < 60) return `${seconds}s`;
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
 * Obtiene el valor de FC para una duración específica
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
 * Genera curva suavizada
 */
function generateSmoothedCurve(secs, values) {
    const points = [];
    const validData = [];
    
    for (let i = 0; i < secs.length; i++) {
        if (values[i] && values[i] > 0 && secs[i] > 0) {
            validData.push({ x: Math.log10(secs[i]), y: values[i], origX: secs[i] });
        }
    }
    
    if (validData.length < 5) return [];
    
    validData.sort((a, b) => a.x - b.x);
    const windowSize = Math.max(5, Math.floor(validData.length * 0.08));
    
    for (let i = 0; i < validData.length; i++) {
        let sumWeight = 0;
        let sumValue = 0;
        
        for (let j = Math.max(0, i - windowSize); j <= Math.min(validData.length - 1, i + windowSize); j++) {
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
 * Renderiza el gráfico de la curva de FC
 */
function renderHRCurveChart(curveData) {
    const ctx = document.getElementById('hr-chart');
    if (!ctx) return;

    if (hrCurveChart) {
        hrCurveChart.destroy();
    }

    const secs = curveData.secs || [];
    const values = curveData.values || [];

    // Filtrar valores válidos (FC > 30s para evitar lag de respuesta)
    const realDataPoints = [];
    let maxSeconds = 0;
    for (let i = 0; i < secs.length; i++) {
        if (values[i] && values[i] > 0 && secs[i] >= 30) {
            realDataPoints.push({ x: secs[i], y: values[i] });
            maxSeconds = Math.max(maxSeconds, secs[i]);
        }
    }

    // Generar curva suavizada (solo para duraciones >= 30s)
    const filteredSecs = secs.filter((s, i) => s >= 30 && values[i] > 0);
    const filteredValues = values.filter((v, i) => secs[i] >= 30 && v > 0);
    const modeledDataPoints = generateSmoothedCurve(filteredSecs, filteredValues);

    const tickValues = [30, 60, 120, 300, 600, 1200, 1800, 3600, 7200];

    hrCurveChart = new Chart(ctx, {
        type: 'line',
        data: {
            datasets: [
                {
                    label: t('hr.realCurve'),
                    data: realDataPoints,
                    borderColor: 'rgba(239, 68, 68, 0.8)',
                    backgroundColor: 'rgba(239, 68, 68, 0.15)',
                    fill: true,
                    tension: 0.3,
                    pointRadius: 0,
                    pointHoverRadius: 5,
                    pointHoverBackgroundColor: '#ef4444',
                    borderWidth: 2,
                    borderDash: [5, 5],
                    order: 2
                },
                {
                    label: t('hr.smoothedCurve'),
                    data: modeledDataPoints,
                    borderColor: '#f97316',
                    backgroundColor: 'transparent',
                    fill: false,
                    tension: 0.4,
                    pointRadius: 0,
                    pointHoverRadius: 5,
                    pointHoverBackgroundColor: '#f97316',
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
                    min: 30,
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
                    title: { display: true, text: t('hr.bpm'), color: '#9ca3af' },
                    ticks: { color: '#9ca3af' },
                    grid: { color: 'rgba(255, 255, 255, 0.06)' },
                    suggestedMin: 100,
                    suggestedMax: 200
                }
            },
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: 'rgba(17, 24, 39, 0.95)',
                    titleColor: '#f3f4f6',
                    bodyColor: '#d1d5db',
                    borderColor: 'rgba(239, 68, 68, 0.3)',
                    borderWidth: 1,
                    callbacks: {
                        title: (ctx) => formatDuration(ctx[0].parsed.x),
                        label: (ctx) => `${ctx.dataset.label}: ${Math.round(ctx.parsed.y)} bpm`
                    }
                }
            }
        }
    });
}

/**
 * Renderiza los cards de duraciones clave
 */
function renderHRCards(currentData, historicalData) {
    const container = document.getElementById('hr-cards');
    if (!container) return;

    // Duraciones clave para FC (empezando desde 1min por el lag de respuesta)
    const keyDurations = [
        { secs: 60, label: '1min' },
        { secs: 300, label: '5min' },
        { secs: 600, label: '10min' },
        { secs: 1200, label: '20min' },
        { secs: 1800, label: '30min' },
        { secs: 3600, label: '1h' }
    ];

    const currentSecs = currentData.secs || [];
    const currentValues = currentData.values || [];
    const historicalSecs = historicalData?.secs || [];
    const historicalValues = historicalData?.values || [];

    let html = '';
    keyDurations.forEach(({ secs, label }) => {
        const currentValue = getValueAtDuration(currentSecs, currentValues, secs);
        const historicalValue = getValueAtDuration(historicalSecs, historicalValues, secs);
        
        const diff = currentValue && historicalValue ? currentValue - historicalValue : 0;
        const percentage = historicalValue ? Math.round((currentValue / historicalValue) * 100) : 0;
        const diffClass = diff > 0 ? 'positive' : diff < 0 ? 'negative' : 'neutral';

        html += `
            <div class="hr-card">
                <div class="hr-card-header">
                    <span class="hr-card-duration">${label}</span>
                </div>
                <div class="hr-card-body">
                    <div class="hr-card-column">
                        <span class="hr-card-label">${t('pdc.selected')}</span>
                        <span class="hr-card-value current">${currentValue || '--'}<small>bpm</small></span>
                    </div>
                    <div class="hr-card-column">
                        <span class="hr-card-label">${t('pdc.allTime')}</span>
                        <span class="hr-card-value historical">${historicalValue || '--'}<small>bpm</small></span>
                    </div>
                    <div class="hr-card-column progress-col">
                        <div class="hr-mini-progress">
                            <div class="hr-progress-bar" style="width: ${Math.min(percentage, 100)}%"></div>
                        </div>
                        <span class="hr-card-diff ${diffClass}">${diff > 0 ? '+' : ''}${diff || 0}</span>
                    </div>
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
}

/**
 * Abre el modal con el gráfico expandido
 */
function openHRModal() {
    const modal = document.getElementById('hr-modal');
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        
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
function closeHRModal() {
    const modal = document.getElementById('hr-modal');
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
    const ctx = document.getElementById('hr-modal-chart');
    if (!ctx) return;

    if (modalChart) {
        modalChart.destroy();
    }

    const secs = curveData.secs || [];
    const values = curveData.values || [];

    const realDataPoints = [];
    let maxSeconds = 0;
    for (let i = 0; i < secs.length; i++) {
        if (values[i] && values[i] > 0 && secs[i] >= 30) {
            realDataPoints.push({ x: secs[i], y: values[i] });
            maxSeconds = Math.max(maxSeconds, secs[i]);
        }
    }

    const filteredSecs = secs.filter((s, i) => s >= 30 && values[i] > 0);
    const filteredValues = values.filter((v, i) => secs[i] >= 30 && v > 0);
    const modeledDataPoints = generateSmoothedCurve(filteredSecs, filteredValues);
    const tickValues = [30, 60, 120, 300, 600, 1200, 1800, 3600, 7200];

    modalChart = new Chart(ctx, {
        type: 'line',
        data: {
            datasets: [
                {
                    label: t('hr.realCurve'),
                    data: realDataPoints,
                    borderColor: 'rgba(239, 68, 68, 0.8)',
                    backgroundColor: 'rgba(239, 68, 68, 0.15)',
                    fill: true,
                    tension: 0.3,
                    pointRadius: 0,
                    pointHoverRadius: 5,
                    borderWidth: 2,
                    borderDash: [5, 5],
                    order: 2
                },
                {
                    label: t('hr.smoothedCurve'),
                    data: modeledDataPoints,
                    borderColor: '#f97316',
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
                    min: 30,
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
                    title: { display: true, text: t('hr.bpm'), color: '#9ca3af' },
                    ticks: { color: '#9ca3af' },
                    grid: { color: 'rgba(255, 255, 255, 0.06)' },
                    suggestedMin: 100,
                    suggestedMax: 200
                }
            },
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: 'rgba(17, 24, 39, 0.95)',
                    callbacks: {
                        title: (ctx) => formatDuration(ctx[0].parsed.x),
                        label: (ctx) => `${ctx.dataset.label}: ${Math.round(ctx.parsed.y)} bpm`
                    }
                }
            }
        }
    });
}
