import { getWellnessData, getActivityData } from '../apiService.js';
import {
    calculateLnRMSSD,
    mean,
    standardDeviation,
    zScore,
    rollingAverage,
    rollingConfidenceInterval,
    calculateBaseline,
    evaluateSleepScore,
    formatSleepHours,
    secondsToHours,
    evaluateHRVStatus,
    calculateReadiness
} from '../statsUtils.js';
import { t } from '../i18n.js';
import { createBPEPanel } from './BPEPanel.js';
import { createPatternAnalysisPanel, patternChartInstances } from './PatternAnalysisPanel.js';

// Variables globales para el panel
let currentAthleteId = null;
let currentProcessedData = null;
let chartInstances = {};
let currentActiveTab = 'metrics'; // Guardar pestaña activa

/**
 * Renderiza el panel profesional de wellness con análisis avanzado de HRV
 */
export async function renderWellnessPanel(container, athleteId) {
    currentAthleteId = athleteId;

    container.innerHTML = `<div class="loading">${t('wellness.loadingData')}</div>`;

    // Obtener últimos 30 días para análisis estadístico
    const today = new Date();
    const oldest = new Date();
    oldest.setDate(today.getDate() - 30);

    await loadWellnessData(container, athleteId, oldest, today);
}

/**
 * Carga y renderiza los datos de wellness
 */
async function loadWellnessData(container, athleteId, startDate, endDate) {
    const oldestISO = startDate.toISOString().split('T')[0];
    const newestISO = endDate.toISOString().split('T')[0];

    try {
        // Obtener datos de wellness y actividades en paralelo
        const [wellnessData, activitiesData] = await Promise.all([
            getWellnessData(athleteId, oldestISO, newestISO),
            getActivityData(athleteId, oldestISO, newestISO).catch(() => null) // No fallar si no hay actividades
        ]);

        if (!wellnessData || wellnessData.length === 0) {
            container.innerHTML = `<div class="loading">${t('wellness.noData')}</div>`;
            return;
        }

        // Ordenar datos por fecha (más antiguos primero)
        const sortedData = [...wellnessData].sort((a, b) => new Date(a.id) - new Date(b.id));

        // Procesar datos para análisis (incluir actividades si existen)
        currentProcessedData = processWellnessData(sortedData, activitiesData);

        // Renderizar panel completo
        renderWellnessPanelContent(container, currentProcessedData);

    } catch (error) {
        console.error('Error loading wellness data:', error);
        container.innerHTML = `<div class="loading">${t('wellness.errorLoading')}</div>`;
    }
}

/**
 * Renderiza el contenido completo del panel
 */
function renderWellnessPanelContent(container, data) {
    container.innerHTML = `
        <div class="wellness-header">
            <div class="wellness-header-main">
                <h2 data-i18n="wellness.title">${t('wellness.title')}</h2>
                <p class="wellness-subtitle" data-i18n="wellness.subtitle">${t('wellness.subtitle')}</p>
            </div>
            <div class="date-range-selector">
                <label data-i18n="wellness.dateRange">${t('wellness.dateRange')}:</label>
                <div class="quick-date-buttons">
                    <button class="quick-date-btn" data-days="7">7${t('wellness.daysShort')}</button>
                    <button class="quick-date-btn" data-days="15">15${t('wellness.daysShort')}</button>
                    <button class="quick-date-btn active" data-days="30">30${t('wellness.daysShort')}</button>
                    <button class="quick-date-btn" data-days="90">90${t('wellness.daysShort')}</button>
                </div>
                <div class="date-inputs">
                    <input type="date" id="wellness-date-from" value="${getDateDaysAgo(30)}">
                    <span>-</span>
                    <input type="date" id="wellness-date-to" value="${getDateDaysAgo(0)}">
                    <button id="apply-date-range" class="apply-date-btn" data-i18n="wellness.apply">${t('wellness.apply')}</button>
                </div>
            </div>
        </div>

        <!-- Tab Navigation -->
        <div class="wellness-tabs">
            <button class="wellness-tab ${currentActiveTab === 'metrics' ? 'active' : ''}" data-tab="metrics" data-i18n="wellness.tabs.metrics">Métricas</button>
            <button class="wellness-tab ${currentActiveTab === 'patterns' ? 'active' : ''}" data-tab="patterns" data-i18n="wellness.tabs.patterns">Patrones</button>
            <button class="wellness-tab ${currentActiveTab === 'bpe' ? 'active' : ''}" data-tab="bpe" data-i18n="wellness.tabs.bpe">BPE</button>
        </div>

        <!-- Tab 1: Métricas -->
        <div id="tab-metrics" class="wellness-tab-content ${currentActiveTab === 'metrics' ? 'active' : ''}"
            <div class="wellness-metrics-grid">
                ${renderHRVCard(data)}
                ${renderRestingHRCard(data)}
                ${renderSleepDurationCard(data)}
                ${renderSleepScoreCard(data)}
            </div>

            <div class="wellness-summary-grid">
                ${renderReadinessCard(data)}
                ${renderSummaryCard(data)}
            </div>
        </div>

        <!-- Tab 2: Patrones -->
        <div id="tab-patterns" class="wellness-tab-content ${currentActiveTab === 'patterns' ? 'active' : ''}">
            <div id="patterns-container"></div>
        </div>

        <!-- Tab 3: BPE -->
        <div id="tab-bpe" class="wellness-tab-content ${currentActiveTab === 'bpe' ? 'active' : ''}">
            <div id="bpe-container"></div>
        </div>

        <!-- Modal para gráficos en pantalla completa -->
        <div id="chart-modal" class="chart-modal">
            <div class="chart-modal-content">
                <div class="chart-modal-header">
                    <button class="chart-modal-download" id="download-chart-btn" title="${t('wellness.chart.download')}">⬇</button>
                    <button class="chart-modal-close" data-i18n="wellness.chart.close">${t('wellness.chart.close')}</button>
                </div>
                <div class="chart-modal-body">
                    <canvas id="modal-chart"></canvas>
                </div>
            </div>
        </div>
    `;

    // Destruir gráficos anteriores
    Object.values(chartInstances).forEach(chart => chart?.destroy());
    chartInstances = {};

    // Renderizar gráficos de la pestaña Métricas
    chartInstances.hrvChart = renderHRVChart(data);
    chartInstances.rhrChart = renderRestingHRChart(data);
    chartInstances.sleepDurationChart = renderSleepDurationChart(data);
    chartInstances.sleepScoreChart = renderSleepScoreChart(data);

    // Añadir panel de Patrones
    const patternsContainer = container.querySelector('#patterns-container');
    const patternsPanel = createPatternAnalysisPanel(data);
    patternsContainer.appendChild(patternsPanel);

    // Añadir panel BPE
    const bpeContainer = container.querySelector('#bpe-container');
    const bpePanel = createBPEPanel(data);
    bpeContainer.appendChild(bpePanel);

    // Event listeners
    setupEventListeners(container);
    setupTabListeners(container);
}

/**
 * Configura event listeners para el panel
 */
function setupEventListeners(container) {
    // Quick date buttons
    const quickDateBtns = container.querySelectorAll('.quick-date-btn');
    quickDateBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const days = parseInt(btn.dataset.days);
            const fromInput = container.querySelector('#wellness-date-from');
            const toInput = container.querySelector('#wellness-date-to');

            // Update active button
            quickDateBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Set date inputs
            const today = new Date();
            const oldest = new Date();
            oldest.setDate(today.getDate() - days);

            fromInput.value = oldest.toISOString().split('T')[0];
            toInput.value = today.toISOString().split('T')[0];

            // Load data
            if (currentAthleteId) {
                loadWellnessData(container, currentAthleteId, oldest, today);
            }
        });
    });

    // Date range selector
    const applyDateBtn = container.querySelector('#apply-date-range');
    applyDateBtn?.addEventListener('click', () => {
        const fromInput = container.querySelector('#wellness-date-from');
        const toInput = container.querySelector('#wellness-date-to');

        const startDate = new Date(fromInput.value);
        const endDate = new Date(toInput.value);

        if (startDate && endDate && currentAthleteId) {
            // Remove active from quick buttons
            const quickDateBtns = container.querySelectorAll('.quick-date-btn');
            quickDateBtns.forEach(b => b.classList.remove('active'));

            loadWellnessData(container, currentAthleteId, startDate, endDate);
        }
    });

    // Fullscreen buttons
    setupFullscreenButtons(container);

    // Modal close
    const modal = container.querySelector('#chart-modal');
    const closeBtn = container.querySelector('.chart-modal-close');
    const downloadBtn = container.querySelector('#download-chart-btn');

    closeBtn?.addEventListener('click', () => {
        modal.classList.remove('active');
    });

    downloadBtn?.addEventListener('click', () => {
        downloadChart();
    });

    modal?.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('active');
        }
    });

    // Listener para eventos de fullscreen de gráficos de patrones
    document.addEventListener('pattern-chart-fullscreen', (e) => {
        showChartFullscreen(e.detail.chartType);
    });

    // Exponer función showChartFullscreen para PatternAnalysisPanel
    window.showPatternChartFullscreen = showChartFullscreen;
}

/**
 * Configura event listeners para las pestañas
 */
function setupTabListeners(container) {
    const tabButtons = container.querySelectorAll('.wellness-tab');
    const tabContents = container.querySelectorAll('.wellness-tab-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetTab = button.dataset.tab;

            // Guardar pestaña activa
            currentActiveTab = targetTab;

            // Remover clase active de todos los botones y contenidos
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));

            // Añadir clase active al botón y contenido seleccionado
            button.classList.add('active');
            const targetContent = container.querySelector(`#tab-${targetTab}`);
            targetContent?.classList.add('active');
        });
    });
}

/**
 * Configura los botones de pantalla completa para los gráficos
 */
function setupFullscreenButtons(container) {
    const fullscreenBtns = container.querySelectorAll('.chart-fullscreen-btn');

    fullscreenBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const chartType = btn.dataset.chart;
            showChartFullscreen(chartType);
        });
    });
}

/**
 * Muestra un gráfico en pantalla completa
 */
function showChartFullscreen(chartType) {
    const modal = document.getElementById('chart-modal');
    const modalCanvas = document.getElementById('modal-chart');

    if (!modal || !modalCanvas) return;

    // Destruir gráfico anterior en el modal
    if (chartInstances.modalChart) {
        chartInstances.modalChart.destroy();
    }

    // Buscar gráfico original en chartInstances (métricas) o patternChartInstances (patrones)
    let originalChart = chartInstances[chartType + 'Chart'] || patternChartInstances[chartType];
    if (!originalChart) return;

    const ctx = modalCanvas.getContext('2d');
    chartInstances.modalChart = new Chart(ctx, {
        type: originalChart.config.type,
        data: JSON.parse(JSON.stringify(originalChart.config.data)),
        options: {
            ...originalChart.config.options,
            maintainAspectRatio: true,
            aspectRatio: 2
        }
    });

    modal.classList.add('active');
}

/**
 * Descarga el gráfico actual del modal como imagen PNG
 */
function downloadChart() {
    const canvas = document.getElementById('modal-chart');
    if (!canvas) return;

    // Crear un enlace temporal para descargar
    const link = document.createElement('a');
    const timestamp = new Date().toISOString().split('T')[0];
    link.download = `wellness-chart-${timestamp}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
}

/**
 * Calcula tendencia (última semana vs semana anterior)
 */
function calculateTrend(data, last = 7) {
    if (data.length < last * 2) return { direction: 'stable', percent: 0 };

    const lastWeek = data.slice(-last).filter(v => v !== null && v !== undefined);
    const prevWeek = data.slice(-last * 2, -last).filter(v => v !== null && v !== undefined);

    if (lastWeek.length === 0 || prevWeek.length === 0) return { direction: 'stable', percent: 0 };

    const lastAvg = mean(lastWeek);
    const prevAvg = mean(prevWeek);

    const percentChange = ((lastAvg - prevAvg) / prevAvg) * 100;

    let direction = 'stable';
    if (percentChange > 2) direction = 'increasing';
    else if (percentChange < -2) direction = 'decreasing';

    return { direction, percent: Math.abs(percentChange) };
}

/**
 * Renderiza icono de tendencia
 */
function renderTrendIcon(trend, isPositiveGood = true) {
    const { direction, percent } = trend;

    if (direction === 'stable') {
        return `<span class="trend-icon trend-stable" title="${t('wellness.trends.stable')}">→</span>`;
    }

    const isGood = (direction === 'increasing' && isPositiveGood) || (direction === 'decreasing' && !isPositiveGood);
    const color = isGood ? 'var(--success)' : 'var(--warning)';
    const arrow = direction === 'increasing' ? '↑' : '↓';
    const text = direction === 'increasing' ? t('wellness.trends.increasing') : t('wellness.trends.decreasing');

    return `<span class="trend-icon" style="color: ${color};" title="${text} (${percent.toFixed(1)}%)">${arrow}</span>`;
}

/**
 * Helper para obtener fecha de hace N días
 */
function getDateDaysAgo(days) {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return date.toISOString().split('T')[0];
}

/**
 * Procesa los datos de wellness para análisis estadístico
 */
function processWellnessData(data, activities = null) {
    const dates = data.map(d => d.id);
    const hrvRaw = data.map(d => d.hrv);
    const restingHR = data.map(d => d.restingHR);
    const sleepSecs = data.map(d => d.sleepSecs);
    const sleepScoreValues = data.map(d => d.sleepScore);

    // Procesar carga de entrenamiento si hay actividades disponibles
    let trainingLoadData = null;
    if (activities && activities.length > 0) {
        trainingLoadData = processTrainingLoad(dates, activities);
    }

    // Calcular LnRMSSD para HRV
    const hrvLnRMSSD = hrvRaw.map(h => calculateLnRMSSD(h));

    // Calcular estadísticas de HRV
    const hrvMean = mean(hrvLnRMSSD);
    const hrvStd = standardDeviation(hrvLnRMSSD, hrvMean);
    const hrvZScores = hrvLnRMSSD.map(v => zScore(v, hrvMean, hrvStd));

    // Intervalos de confianza móviles (7 días)
    const hrvCI = rollingConfidenceInterval(hrvLnRMSSD, 7);
    const rhrCI = rollingConfidenceInterval(restingHR, 7);
    const sleepHours = sleepSecs.map(s => secondsToHours(s));
    const sleepCI = rollingConfidenceInterval(sleepHours, 7);

    // Baseline (últimos 7 días)
    const hrvBaseline = calculateBaseline(hrvLnRMSSD, 7);
    const rhrBaseline = calculateBaseline(restingHR, 7);
    const sleepBaseline = calculateBaseline(sleepHours, 7);

    // Último valor y evaluación
    const latestHRV = hrvRaw[hrvRaw.length - 1];
    const latestZScore = hrvZScores[hrvZScores.length - 1];
    const hrvStatus = evaluateHRVStatus(latestZScore);
    const readiness = calculateReadiness(latestZScore);

    const latestSleepScore = sleepScoreValues[sleepScoreValues.length - 1];
    const sleepEvaluation = evaluateSleepScore(latestSleepScore);

    // Calcular tendencias
    const hrvTrend = calculateTrend(hrvRaw, 7);
    const rhrTrend = calculateTrend(restingHR, 7);
    const sleepTrend = calculateTrend(sleepHours, 7);
    const sleepScoreTrend = calculateTrend(sleepScoreValues, 7);

    return {
        dates,
        hrv: {
            data: hrvRaw,
            raw: hrvRaw,
            lnRMSSD: hrvLnRMSSD,
            zScores: hrvZScores,
            mean: hrvMean,
            std: hrvStd,
            ci: hrvCI,
            baseline: hrvBaseline,
            latest: latestHRV,
            latestZScore,
            status: hrvStatus,
            trend: hrvTrend
        },
        rhr: {
            data: restingHR,
            values: restingHR,
            ci: rhrCI,
            baseline: rhrBaseline,
            latest: restingHR[restingHR.length - 1],
            trend: rhrTrend
        },
        restingHR: {
            values: restingHR,
            ci: rhrCI,
            baseline: rhrBaseline,
            latest: restingHR[restingHR.length - 1]
        },
        sleepDuration: {
            data: sleepHours,
            hours: sleepHours,
            seconds: sleepSecs,
            ci: sleepCI,
            baseline: sleepBaseline,
            latest: sleepHours[sleepHours.length - 1],
            latestFormatted: formatSleepHours(sleepSecs[sleepSecs.length - 1]),
            trend: sleepTrend
        },
        sleep: {
            hours: sleepHours,
            seconds: sleepSecs,
            ci: sleepCI,
            baseline: sleepBaseline,
            latest: sleepHours[sleepHours.length - 1],
            latestFormatted: formatSleepHours(sleepSecs[sleepSecs.length - 1])
        },
        sleepScore: {
            data: sleepScoreValues,
            values: sleepScoreValues,
            latest: latestSleepScore,
            evaluation: sleepEvaluation,
            trend: sleepScoreTrend
        },
        readiness: readiness,
        trainingLoad: trainingLoadData
    };
}

/**
 * Procesa las cargas de entrenamiento de las actividades y las alinea con las fechas de wellness
 * @param {string[]} dates - Fechas de los datos de wellness
 * @param {Object[]} activities - Array de actividades del API
 * @returns {Object} - Datos procesados de carga de entrenamiento
 */
function processTrainingLoad(dates, activities) {
    // Crear mapa de carga por fecha
    const loadByDate = {};

    activities.forEach(activity => {
        if (activity.start_date_local && activity.icu_training_load) {
            // Extraer solo la fecha (YYYY-MM-DD)
            const dateStr = activity.start_date_local.split('T')[0];

            // Si hay múltiples actividades en un día, sumar las cargas
            if (loadByDate[dateStr]) {
                loadByDate[dateStr] += activity.icu_training_load;
            } else {
                loadByDate[dateStr] = activity.icu_training_load;
            }
        }
    });

    // Alinear con las fechas de wellness (usar 0 para días sin actividad)
    const values = dates.map(date => loadByDate[date] || 0);

    return {
        values,
        loadByDate
    };
}

/**
 * Card de HRV con análisis LnRMSSD y Z-Score
 */
function renderHRVCard(data) {
    const { hrv } = data;
    const trendIcon = renderTrendIcon(hrv.trend, true);

    return `
        <div class="metric-card">
            <div class="metric-card-header">
                <h3 data-i18n="wellness.hrv.title">${t('wellness.hrv.title')}</h3>
                <div class="metric-badge" style="background-color: ${hrv.status.color}20; color: ${hrv.status.color};">
                    ${t('wellness.hrv.status.' + hrv.status.statusKey)}
                </div>
            </div>
            <div class="metric-card-body">
                <div class="metric-value-group">
                    <div class="metric-primary">
                        <span class="metric-label" data-i18n="wellness.hrv.current">${t('wellness.hrv.current')}</span>
                        <span class="metric-value">
                            ${hrv.latest ? hrv.latest.toFixed(0) : t('common.na')}
                            <span class="metric-unit">${t('common.units.ms')}</span>
                            ${trendIcon}
                        </span>
                    </div>
                    <div class="metric-secondary">
                        <span class="metric-label" data-i18n="wellness.hrv.zScore">${t('wellness.hrv.zScore')}</span>
                        <span class="metric-value ${hrv.latestZScore > 0 ? 'positive' : 'negative'}">
                            ${hrv.latestZScore ? hrv.latestZScore.toFixed(2) : t('common.na')}
                        </span>
                    </div>
                </div>
                <div class="metric-status-text">
                    ${t('wellness.hrv.description.' + hrv.status.descriptionKey)}
                </div>
                <div class="metric-chart-container">
                    <button class="chart-fullscreen-btn" data-chart="hrv" title="${t('wellness.chart.fullscreen')}">⛶</button>
                    <div class="metric-chart">
                        <canvas id="hrv-chart"></canvas>
                    </div>
                </div>
                <div class="metric-stats">
                    <div class="stat-item">
                        <span class="stat-label" data-i18n="wellness.hrv.baseline">${t('wellness.hrv.baseline')}</span>
                        <span class="stat-value">${hrv.baseline.mean ? hrv.baseline.mean.toFixed(2) : t('common.na')}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label" data-i18n="wellness.hrv.stdDev">${t('wellness.hrv.stdDev')}</span>
                        <span class="stat-value">${hrv.baseline.std ? hrv.baseline.std.toFixed(2) : t('common.na')}</span>
                    </div>
                </div>
            </div>
        </div>
    `;
}

/**
 * Card de Pulso en Reposo
 */
function renderRestingHRCard(data) {
    const { rhr } = data;
    const trendIcon = renderTrendIcon(rhr.trend, false); // Menor RHR es mejor

    return `
        <div class="metric-card">
            <div class="metric-card-header">
                <h3 data-i18n="wellness.rhr.title">${t('wellness.rhr.title')}</h3>
            </div>
            <div class="metric-card-body">
                <div class="metric-value-group">
                    <div class="metric-primary">
                        <span class="metric-label" data-i18n="wellness.rhr.current">${t('wellness.rhr.current')}</span>
                        <span class="metric-value">
                            ${rhr.latest || t('common.na')}
                            <span class="metric-unit">${t('common.units.bpm')}</span>
                            ${trendIcon}
                        </span>
                    </div>
                </div>
                <div class="metric-chart-container">
                    <button class="chart-fullscreen-btn" data-chart="rhr" title="${t('wellness.chart.fullscreen')}">⛶</button>
                    <div class="metric-chart">
                        <canvas id="rhr-chart"></canvas>
                    </div>
                </div>
                <div class="metric-stats">
                    <div class="stat-item">
                        <span class="stat-label" data-i18n="wellness.rhr.baseline">${t('wellness.rhr.baseline')}</span>
                        <span class="stat-value">${rhr.baseline.mean ? rhr.baseline.mean.toFixed(1) : t('common.na')} ${t('common.units.bpm')}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label" data-i18n="wellness.rhr.range">${t('wellness.rhr.range')}</span>
                        <span class="stat-value">${rhr.baseline.min || t('common.na')} - ${rhr.baseline.max || t('common.na')}</span>
                    </div>
                </div>
            </div>
        </div>
    `;
}

/**
 * Card de Duración del Sueño (con calidad incluida)
 */
function renderSleepDurationCard(data) {
    const { sleepDuration, sleepScore } = data;
    const trendIcon = renderTrendIcon(sleepDuration.trend, true);

    return `
        <div class="metric-card">
            <div class="metric-card-header">
                <h3 data-i18n="wellness.sleepDuration.title">${t('wellness.sleepDuration.title')}</h3>
            </div>
            <div class="metric-card-body">
                <div class="metric-value-group">
                    <div class="metric-primary">
                        <span class="metric-label" data-i18n="wellness.sleepDuration.lastNight">${t('wellness.sleepDuration.lastNight')}</span>
                        <span class="metric-value">
                            ${sleepDuration.latestFormatted}
                            ${trendIcon}
                        </span>
                    </div>
                    <div class="metric-secondary">
                        <span class="metric-label" data-i18n="wellness.sleepDuration.quality">${t('wellness.sleepDuration.quality')}</span>
                        <span class="metric-value" style="color: ${sleepScore.evaluation.color};">
                            ${sleepScore.latest || t('common.na')}
                        </span>
                    </div>
                </div>
                <div class="metric-chart-container">
                    <button class="chart-fullscreen-btn" data-chart="sleepDuration" title="${t('wellness.chart.fullscreen')}">⛶</button>
                    <div class="metric-chart">
                        <canvas id="sleep-duration-chart"></canvas>
                    </div>
                </div>
                <div class="metric-stats">
                    <div class="stat-item">
                        <span class="stat-label" data-i18n="wellness.sleepDuration.average">${t('wellness.sleepDuration.average')}</span>
                        <span class="stat-value">${sleepDuration.baseline.mean ? sleepDuration.baseline.mean.toFixed(1) : t('common.na')} ${t('common.units.hours')}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label" data-i18n="wellness.sleepDuration.target">${t('wellness.sleepDuration.target')}</span>
                        <span class="stat-value">7-9 ${t('common.units.hours')}</span>
                    </div>
                </div>
            </div>
        </div>
    `;
}

/**
 * Card de Puntuación de Sueño
 */
function renderSleepScoreCard(data) {
    const { sleepScore } = data;
    const evaluation = sleepScore.evaluation;
    const trendIcon = renderTrendIcon(sleepScore.trend, true);

    return `
        <div class="metric-card">
            <div class="metric-card-header">
                <h3 data-i18n="wellness.sleepScore.title">${t('wellness.sleepScore.title')}</h3>
                <div class="metric-badge" style="background-color: ${evaluation.color}20; color: ${evaluation.color};">
                    ${t('wellness.sleepScore.categories.' + evaluation.categoryKey)}
                </div>
            </div>
            <div class="metric-card-body">
                <div class="metric-value-group">
                    <div class="metric-primary">
                        <span class="metric-label" data-i18n="wellness.sleepScore.score">${t('wellness.sleepScore.score')}</span>
                        <span class="metric-value">
                            ${sleepScore.latest || t('common.na')}
                            <span class="metric-unit">/100</span>
                            ${trendIcon}
                        </span>
                    </div>
                </div>
                <div class="metric-status-text">
                    ${t('wellness.sleepScore.description.' + evaluation.categoryKey)}
                </div>
                <div class="metric-chart-container">
                    <button class="chart-fullscreen-btn" data-chart="sleepScore" title="${t('wellness.chart.fullscreen')}">⛶</button>
                    <div class="metric-chart">
                        <canvas id="sleep-score-chart"></canvas>
                    </div>
                </div>
                <div class="sleep-score-legend">
                    <div class="legend-item">
                        <span class="legend-color" style="background-color: #10b981;"></span>
                        <span class="legend-text" data-i18n="wellness.sleepScore.legend.excellent">${t('wellness.sleepScore.legend.excellent')}</span>
                    </div>
                    <div class="legend-item">
                        <span class="legend-color" style="background-color: #3b82f6;"></span>
                        <span class="legend-text" data-i18n="wellness.sleepScore.legend.good">${t('wellness.sleepScore.legend.good')}</span>
                    </div>
                    <div class="legend-item">
                        <span class="legend-color" style="background-color: #f59e0b;"></span>
                        <span class="legend-text" data-i18n="wellness.sleepScore.legend.acceptable">${t('wellness.sleepScore.legend.acceptable')}</span>
                    </div>
                    <div class="legend-item">
                        <span class="legend-color" style="background-color: #ef4444;"></span>
                        <span class="legend-text" data-i18n="wellness.sleepScore.legend.poor">${t('wellness.sleepScore.legend.poor')}</span>
                    </div>
                </div>
            </div>
        </div>
    `;
}

/**
 * Card de PREPARACIÓN basado en HRV Z-score
 */
function renderReadinessCard(data) {
    const { readiness } = data;

    return `
        <div class="readiness-card" style="border-left-color: ${readiness.color};">
            <div class="readiness-header">
                <h3 data-i18n="wellness.readiness.title">${t('wellness.readiness.title')}</h3>
            </div>
            <div class="readiness-content">
                <div class="readiness-emoji">${readiness.emoji}</div>
                <div class="readiness-level" style="color: ${readiness.color};">
                    ${t('wellness.readiness.levels.' + readiness.levelKey)}
                </div>
                <div class="readiness-description">
                    ${t('wellness.readiness.descriptions.' + readiness.levelKey)}
                </div>
                <div class="readiness-intensity">
                    <span class="intensity-label" data-i18n="wellness.readiness.recommended">${t('wellness.readiness.recommended')}:</span>
                    <span class="intensity-value" style="color: ${readiness.color};">
                        ${readiness.intensityKey === 'noData' ? 'N/A' : readiness.intensityKey.toUpperCase()}
                    </span>
                </div>
            </div>
        </div>
    `;
}

/**
 * Card de resumen general
 */
function renderSummaryCard(data) {
    return `
        <div class="summary-card">
            <h3 data-i18n="wellness.summary.title">${t('wellness.summary.title')}</h3>
            <div class="summary-grid">
                <div class="summary-item">
                    <span class="summary-label" data-i18n="wellness.summary.hrvStatus">${t('wellness.summary.hrvStatus')}</span>
                    <span class="summary-value" style="color: ${data.hrv.status.color};">
                        ${t('wellness.hrv.status.' + data.hrv.status.statusKey)}
                    </span>
                </div>
                <div class="summary-item">
                    <span class="summary-label" data-i18n="wellness.summary.rhrAverage">${t('wellness.summary.rhrAverage')}</span>
                    <span class="summary-value">${data.rhr.baseline.mean ? data.rhr.baseline.mean.toFixed(1) : t('common.na')} ${t('common.units.bpm')}</span>
                </div>
                <div class="summary-item">
                    <span class="summary-label" data-i18n="wellness.summary.sleepAverage">${t('wellness.summary.sleepAverage')}</span>
                    <span class="summary-value">${data.sleepDuration.baseline.mean ? data.sleepDuration.baseline.mean.toFixed(1) : t('common.na')} ${t('common.units.hours')}</span>
                </div>
                <div class="summary-item">
                    <span class="summary-label" data-i18n="wellness.summary.sleepQuality">${t('wellness.summary.sleepQuality')}</span>
                    <span class="summary-value" style="color: ${data.sleepScore.evaluation.color};">
                        ${t('wellness.sleepScore.categories.' + data.sleepScore.evaluation.categoryKey)}
                    </span>
                </div>
            </div>
        </div>
    `;
}

// === GRÁFICOS ===

/**
 * Renderiza gráfico de HRV con LnRMSSD y Z-Score
 */
function renderHRVChart(data) {
    const ctx = document.getElementById('hrv-chart');
    if (!ctx) return null;

    return new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.dates,
            datasets: [
                {
                    label: 'LnRMSSD',
                    data: data.hrv.lnRMSSD,
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 3,
                    pointHoverRadius: 6
                },
                {
                    label: 'IC Superior',
                    data: data.hrv.ci.upper,
                    borderColor: 'rgba(59, 130, 246, 0.3)',
                    borderWidth: 1,
                    borderDash: [5, 5],
                    fill: false,
                    pointRadius: 0
                },
                {
                    label: 'IC Inferior',
                    data: data.hrv.ci.lower,
                    borderColor: 'rgba(59, 130, 246, 0.3)',
                    borderWidth: 1,
                    borderDash: [5, 5],
                    fill: '-1',
                    backgroundColor: 'rgba(59, 130, 246, 0.05)',
                    pointRadius: 0
                }
            ]
        },
        options: getChartOptions('LnRMSSD')
    });
}

/**
 * Renderiza gráfico de RHR con intervalo de confianza
 */
function renderRestingHRChart(data) {
    const ctx = document.getElementById('rhr-chart');
    if (!ctx) return null;

    return new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.dates,
            datasets: [
                {
                    label: 'RHR',
                    data: data.rhr.values,
                    borderColor: '#f59e0b',
                    backgroundColor: 'rgba(245, 158, 11, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 3,
                    pointHoverRadius: 6
                },
                {
                    label: 'IC Superior',
                    data: data.rhr.ci.upper,
                    borderColor: 'rgba(245, 158, 11, 0.3)',
                    borderWidth: 1,
                    borderDash: [5, 5],
                    fill: false,
                    pointRadius: 0
                },
                {
                    label: 'IC Inferior',
                    data: data.rhr.ci.lower,
                    borderColor: 'rgba(245, 158, 11, 0.3)',
                    borderWidth: 1,
                    borderDash: [5, 5],
                    fill: '-1',
                    backgroundColor: 'rgba(245, 158, 11, 0.05)',
                    pointRadius: 0
                }
            ]
        },
        options: getChartOptions('bpm')
    });
}

/**
 * Renderiza gráfico de duración de sueño
 */
function renderSleepDurationChart(data) {
    const ctx = document.getElementById('sleep-duration-chart');
    if (!ctx) return null;

    return new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.dates,
            datasets: [
                {
                    label: 'Horas de Sueño',
                    data: data.sleepDuration.hours,
                    backgroundColor: 'rgba(139, 92, 246, 0.6)',
                    borderColor: '#8b5cf6',
                    borderWidth: 1
                },
                {
                    label: 'Promedio Móvil',
                    data: data.sleepDuration.ci.mean,
                    type: 'line',
                    borderColor: '#a78bfa',
                    borderWidth: 2,
                    fill: false,
                    pointRadius: 0
                }
            ]
        },
        options: getChartOptions('horas')
    });
}

/**
 * Renderiza gráfico de puntuación de sueño
 */
function renderSleepScoreChart(data) {
    const ctx = document.getElementById('sleep-score-chart');
    if (!ctx) return null;

    // Colorear barras según la puntuación
    const backgroundColors = data.sleepScore.values.map(score => {
        if (!score) return '#94a3b8';
        if (score >= 90) return '#10b981';
        if (score >= 80) return '#3b82f6';
        if (score >= 60) return '#f59e0b';
        return '#ef4444';
    });

    return new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.dates,
            datasets: [
                {
                    label: 'Puntuación de Sueño',
                    data: data.sleepScore.values,
                    backgroundColor: backgroundColors,
                    borderWidth: 0
                }
            ]
        },
        options: {
            ...getChartOptions('puntos'),
            scales: {
                ...getChartOptions('puntos').scales,
                y: {
                    ...getChartOptions('puntos').scales.y,
                    min: 0,
                    max: 100
                }
            },
            plugins: {
                ...getChartOptions('puntos').plugins,
                annotation: {
                    annotations: {
                        line1: {
                            type: 'line',
                            yMin: 90,
                            yMax: 90,
                            borderColor: '#10b981',
                            borderWidth: 1,
                            borderDash: [5, 5],
                            label: {
                                content: 'Excelente',
                                enabled: false
                            }
                        },
                        line2: {
                            type: 'line',
                            yMin: 80,
                            yMax: 80,
                            borderColor: '#3b82f6',
                            borderWidth: 1,
                            borderDash: [5, 5]
                        },
                        line3: {
                            type: 'line',
                            yMin: 60,
                            yMax: 60,
                            borderColor: '#f59e0b',
                            borderWidth: 1,
                            borderDash: [5, 5]
                        }
                    }
                }
            }
        }
    });
}

/**
 * Obtiene colores según el tema actual
 */
function getThemeColors() {
    const theme = document.documentElement.getAttribute('data-theme') || 'dark';

    if (theme === 'light') {
        return {
            text: '#0f172a',
            textSecondary: '#475569',
            grid: 'rgba(148, 163, 184, 0.2)',
            tooltipBg: 'rgba(255, 255, 255, 0.95)',
            tooltipBorder: '#cbd5e1'
        };
    } else {
        return {
            text: '#f1f5f9',
            textSecondary: '#cbd5e1',
            grid: 'rgba(148, 163, 184, 0.1)',
            tooltipBg: 'rgba(15, 23, 42, 0.95)',
            tooltipBorder: '#334155'
        };
    }
}

/**
 * Opciones comunes de Chart.js
 */
function getChartOptions(unit = '') {
    const colors = getThemeColors();

    return {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
            mode: 'index',
            intersect: false
        },
        plugins: {
            legend: {
                display: false,
                labels: {
                    color: colors.text
                }
            },
            tooltip: {
                backgroundColor: colors.tooltipBg,
                titleColor: colors.text,
                bodyColor: colors.textSecondary,
                borderColor: colors.tooltipBorder,
                borderWidth: 1,
                padding: 12,
                displayColors: true,
                callbacks: {
                    label: function(context) {
                        let label = context.dataset.label || '';
                        if (label) {
                            label += ': ';
                        }
                        if (context.parsed.y !== null) {
                            label += context.parsed.y.toFixed(2) + ' ' + unit;
                        }
                        return label;
                    }
                }
            }
        },
        scales: {
            x: {
                grid: {
                    color: colors.grid
                },
                ticks: {
                    color: colors.textSecondary,
                    maxRotation: 45,
                    minRotation: 45,
                    font: {
                        size: 10
                    }
                }
            },
            y: {
                grid: {
                    color: colors.grid
                },
                ticks: {
                    color: colors.textSecondary,
                    callback: function(value) {
                        return value.toFixed(1) + ' ' + unit;
                    }
                }
            }
        }
    };
}
