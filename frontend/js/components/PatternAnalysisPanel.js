import { pearsonCorrelation, linearRegression } from '../statsUtils.js';
import { t } from '../i18n.js';

// Almacenar instancias de gráficos para acceso externo
export const patternChartInstances = {};

/**
 * Crea el panel de análisis de patrones con gráficos de correlación
 * @param {Object} data - Datos procesados de wellness
 * @returns {HTMLElement} - Elemento del panel
 */
export function createPatternAnalysisPanel(data) {
    const panel = document.createElement('div');
    panel.className = 'patterns-panel';

    // Calcular correlaciones
    const correlations = calculateCorrelations(data);

    panel.innerHTML = `
        <div class="patterns-header">
            <h2 data-i18n="wellness.patterns.title">${t('wellness.patterns.title')}</h2>
            <p class="patterns-subtitle" data-i18n="wellness.patterns.subtitle">
                ${t('wellness.patterns.subtitle')}
            </p>
        </div>

        <div class="patterns-grid">
            ${renderCorrelationCard('hrv-rhr',
                t('wellness.patterns.correlations.hrvRhr'),
                correlations.hrvRhr,
                'hrv-rhr-chart')}
            ${renderCorrelationCard('hrv-sleep',
                t('wellness.patterns.correlations.hrvSleep'),
                correlations.hrvSleep,
                'hrv-sleep-chart')}
            ${renderCorrelationCard('sleep-quality',
                t('wellness.patterns.correlations.sleepQuality'),
                correlations.sleepQuality,
                'sleep-quality-chart')}
        </div>

        <div class="patterns-grid patterns-grid-secondary">
            ${renderCorrelationCard('hrv-sleep-duration',
                t('wellness.patterns.correlations.hrvSleepDuration'),
                correlations.hrvSleepDuration,
                'hrv-sleep-duration-chart')}
            ${renderCorrelationCard('hrv-load',
                t('wellness.patterns.correlations.hrvLoad'),
                correlations.hrvLoad || { r: null, regression: null },
                'hrv-load-chart')}
        </div>

        <div class="patterns-insights">
            <h3 data-i18n="wellness.patterns.insights.title">${t('wellness.patterns.insights.title')}</h3>
            <div class="insights-grid">
                ${generateInsights(correlations)}
            </div>
        </div>
    `;

    // Renderizar gráficos después de insertar en el DOM
    setTimeout(() => {
        renderCorrelationChart('hrv-rhr-chart', data.hrv.raw, data.rhr.values,
            'HRV (ms)', t('wellness.rhr.abbrev') || 'RHR (bpm)', correlations.hrvRhr);
        renderCorrelationChart('hrv-sleep-chart', data.hrv.raw, data.sleepScore.values,
            'HRV (ms)', t('wellness.sleepScore.title'), correlations.hrvSleep);
        renderCorrelationChart('sleep-quality-chart', data.sleepDuration.hours, data.sleepScore.values,
            t('wellness.sleepDuration.title') + ' (h)', t('wellness.sleepScore.title'), correlations.sleepQuality);

        renderCorrelationChart('hrv-sleep-duration-chart', data.hrv.raw, data.sleepDuration.hours,
            'HRV (ms)', t('wellness.sleepDuration.title') + ' (h)', correlations.hrvSleepDuration);

        // Renderizar HRV vs Carga (usar datos si existen, sino arrays vacíos)
        const loadValues = (data.trainingLoad && data.trainingLoad.values) ? data.trainingLoad.values : [];
        renderCorrelationChart('hrv-load-chart', data.hrv.raw, loadValues,
            'HRV (ms)', 'Carga (TSS)', correlations.hrvLoad || { r: null, regression: null });

        // Configurar event listeners para botones de fullscreen después de renderizar
        setupPatternFullscreenButtons();
    }, 100);

    return panel;
}

/**
 * Calcula todas las correlaciones entre variables
 */
function calculateCorrelations(data) {
    const correlations = {
        hrvRhr: {
            r: pearsonCorrelation(data.hrv.raw, data.rhr.values),
            regression: linearRegression(data.hrv.raw, data.rhr.values)
        },
        hrvSleep: {
            r: pearsonCorrelation(data.hrv.raw, data.sleepScore.values),
            regression: linearRegression(data.hrv.raw, data.sleepScore.values)
        },
        hrvSleepDuration: {
            r: pearsonCorrelation(data.hrv.raw, data.sleepDuration.hours),
            regression: linearRegression(data.hrv.raw, data.sleepDuration.hours)
        },
        sleepQuality: {
            r: pearsonCorrelation(data.sleepDuration.hours, data.sleepScore.values),
            regression: linearRegression(data.sleepDuration.hours, data.sleepScore.values)
        }
    };

    // Añadir correlación HRV vs Carga si hay datos de actividades
    if (data.trainingLoad && data.trainingLoad.values) {
        correlations.hrvLoad = {
            r: pearsonCorrelation(data.hrv.raw, data.trainingLoad.values),
            regression: linearRegression(data.hrv.raw, data.trainingLoad.values)
        };
    }

    return correlations;
}

/**
 * Renderiza una tarjeta de correlación
 */
function renderCorrelationCard(id, title, correlation, chartId) {
    const r = correlation.r;
    const strength = getCorrelationStrength(r);
    const color = getCorrelationColor(r);

    return `
        <div class="correlation-card">
            <div class="correlation-header">
                <h4>${title}</h4>
                <div class="correlation-badge" style="background-color: ${color}20; color: ${color};">
                    r = ${r !== null ? r.toFixed(3) : 'N/A'}
                </div>
            </div>
            <div class="correlation-chart-container">
                <button class="chart-fullscreen-btn" data-chart="${chartId}" title="${t('wellness.chart.fullscreen')}">⛶</button>
                <canvas id="${chartId}"></canvas>
            </div>
            <div class="correlation-footer">
                <span class="correlation-strength" style="color: ${color};">
                    ${t('wellness.patterns.strength.' + strength)}
                </span>
            </div>
        </div>
    `;
}

/**
 * Determina la fuerza de la correlación
 */
function getCorrelationStrength(r) {
    if (r === null) return 'none';
    const abs = Math.abs(r);
    if (abs >= 0.7) return 'strong';
    if (abs >= 0.4) return 'moderate';
    if (abs >= 0.2) return 'weak';
    return 'veryWeak';
}

/**
 * Obtiene el color según la correlación
 */
function getCorrelationColor(r) {
    if (r === null) return '#94a3b8';
    const abs = Math.abs(r);
    if (abs >= 0.7) return '#10b981'; // Verde - fuerte
    if (abs >= 0.4) return '#3b82f6'; // Azul - moderada
    if (abs >= 0.2) return '#f59e0b'; // Naranja - débil
    return '#94a3b8'; // Gris - muy débil
}

/**
 * Renderiza un gráfico de dispersión con línea de tendencia
 */
function renderCorrelationChart(canvasId, xData, yData, xLabel, yLabel, correlation) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    // Filtrar datos válidos y crear pares
    const points = [];
    for (let i = 0; i < Math.min(xData.length, yData.length); i++) {
        if (xData[i] !== null && yData[i] !== null &&
            !isNaN(xData[i]) && !isNaN(yData[i])) {
            points.push({ x: xData[i], y: yData[i] });
        }
    }

    // Calcular línea de tendencia
    let trendlineData = [];
    if (correlation.regression && points.length > 0) {
        const minX = Math.min(...points.map(p => p.x));
        const maxX = Math.max(...points.map(p => p.x));
        trendlineData = [
            { x: minX, y: correlation.regression.predict(minX) },
            { x: maxX, y: correlation.regression.predict(maxX) }
        ];
    }

    const theme = document.documentElement.getAttribute('data-theme') || 'dark';
    const textColor = theme === 'light' ? '#0f172a' : '#f1f5f9';
    const gridColor = theme === 'light' ? 'rgba(148, 163, 184, 0.2)' : 'rgba(148, 163, 184, 0.1)';

    // Destruir gráfico anterior si existe
    if (patternChartInstances[canvasId]) {
        patternChartInstances[canvasId].destroy();
    }

    patternChartInstances[canvasId] = new Chart(ctx, {
        type: 'scatter',
        data: {
            datasets: [
                {
                    label: t('wellness.patterns.dataPoints'),
                    data: points,
                    backgroundColor: 'rgba(59, 130, 246, 0.6)',
                    borderColor: 'rgba(59, 130, 246, 1)',
                    pointRadius: 6,
                    pointHoverRadius: 8
                },
                {
                    label: t('wellness.patterns.trendLine'),
                    data: trendlineData,
                    type: 'line',
                    borderColor: '#ef4444',
                    borderWidth: 3,
                    pointRadius: 0,
                    fill: false,
                    tension: 0
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            aspectRatio: 1.5,
            plugins: {
                legend: {
                    display: true,
                    labels: {
                        color: textColor,
                        font: { size: 11 }
                    }
                },
                tooltip: {
                    backgroundColor: theme === 'light' ? 'rgba(255, 255, 255, 0.95)' : 'rgba(15, 23, 42, 0.95)',
                    titleColor: textColor,
                    bodyColor: textColor,
                    borderColor: gridColor,
                    borderWidth: 1,
                    callbacks: {
                        label: (context) => {
                            return `${xLabel}: ${context.parsed.x.toFixed(1)}, ${yLabel}: ${context.parsed.y.toFixed(1)}`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: xLabel,
                        color: textColor,
                        font: { weight: 'bold' }
                    },
                    ticks: { color: textColor },
                    grid: { color: gridColor }
                },
                y: {
                    title: {
                        display: true,
                        text: yLabel,
                        color: textColor,
                        font: { weight: 'bold' }
                    },
                    ticks: { color: textColor },
                    grid: { color: gridColor }
                }
            }
        }
    });
}

/**
 * Genera insights automáticos basados en las correlaciones
 */
function generateInsights(correlations) {
    const insights = [];

    // Insight 1: HRV vs RHR
    if (correlations.hrvRhr.r !== null) {
        const r = correlations.hrvRhr.r;
        if (r < -0.4) {
            insights.push({
                type: 'positive',
                text: t('wellness.patterns.insights.hrvRhrNegative')
            });
        } else if (r > 0.4) {
            insights.push({
                type: 'warning',
                text: t('wellness.patterns.insights.hrvRhrPositive')
            });
        }
    }

    // Insight 2: HRV vs Sleep Score
    if (correlations.hrvSleep.r !== null) {
        const r = correlations.hrvSleep.r;
        if (r > 0.4) {
            insights.push({
                type: 'positive',
                text: t('wellness.patterns.insights.hrvSleepPositive')
            });
        }
    }

    // Insight 3: HRV vs Sleep Duration
    if (correlations.hrvSleepDuration && correlations.hrvSleepDuration.r !== null) {
        const r = correlations.hrvSleepDuration.r;
        if (r > 0.4) {
            insights.push({
                type: 'positive',
                text: t('wellness.patterns.insights.hrvSleepDurationPositive')
            });
        }
    }

    // Insight 4: HRV vs Training Load
    if (correlations.hrvLoad && correlations.hrvLoad.r !== null) {
        const r = correlations.hrvLoad.r;
        if (r < -0.4) {
            insights.push({
                type: 'info',
                text: t('wellness.patterns.insights.hrvLoadNegative')
            });
        } else if (r > 0.3) {
            insights.push({
                type: 'positive',
                text: t('wellness.patterns.insights.hrvLoadPositive')
            });
        }
    }

    // Insight 5: Sleep Duration vs Quality
    if (correlations.sleepQuality.r !== null) {
        const r = correlations.sleepQuality.r;
        if (r > 0.5) {
            insights.push({
                type: 'positive',
                text: t('wellness.patterns.insights.sleepQualityStrong')
            });
        } else if (r < 0.2) {
            insights.push({
                type: 'info',
                text: t('wellness.patterns.insights.sleepQualityWeak')
            });
        }
    }

    if (insights.length === 0) {
        insights.push({
            type: 'info',
            text: t('wellness.patterns.insights.noSignificant')
        });
    }

    return insights.map(insight => `
        <div class="insight-card insight-${insight.type}">
            <span class="insight-icon">${getInsightIcon(insight.type)}</span>
            <span class="insight-text">${insight.text}</span>
        </div>
    `).join('');
}

/**
 * Obtiene el icono según el tipo de insight
 */
function getInsightIcon(type) {
    const icons = {
        positive: '✅',
        warning: '⚠️',
        info: 'ℹ️'
    };
    return icons[type] || 'ℹ️';
}

/**
 * Configura los event listeners para los botones de fullscreen en gráficos de patrones
 */
function setupPatternFullscreenButtons() {
    const patternFullscreenBtns = document.querySelectorAll('.patterns-panel .chart-fullscreen-btn');

    patternFullscreenBtns.forEach(btn => {
        // Remover listeners anteriores si existen
        const newBtn = btn.cloneNode(true);
        btn.parentNode.replaceChild(newBtn, btn);

        newBtn.addEventListener('click', (e) => {
            const chartType = newBtn.dataset.chart;
            // Buscar función de fullscreen en el scope global o en WellnessPanel
            if (window.showPatternChartFullscreen) {
                window.showPatternChartFullscreen(chartType);
            } else {
                // Dispatch evento personalizado para que WellnessPanel lo maneje
                const event = new CustomEvent('pattern-chart-fullscreen', {
                    detail: { chartType }
                });
                document.dispatchEvent(event);
            }
        });
    });
}
