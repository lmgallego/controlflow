import { getWellnessData } from '../apiService.js';
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
    evaluateHRVStatus
} from '../statsUtils.js';

/**
 * Renderiza el panel profesional de wellness con análisis avanzado de HRV
 */
export async function renderWellnessPanel(container, athleteId) {
    container.innerHTML = '<div class="loading">Cargando análisis de bienestar...</div>';

    // Obtener últimos 30 días para análisis estadístico
    const today = new Date();
    const oldest = new Date();
    oldest.setDate(today.getDate() - 30);

    const oldestISO = oldest.toISOString().split('T')[0];
    const newestISO = today.toISOString().split('T')[0];

    try {
        const data = await getWellnessData(athleteId, oldestISO, newestISO);

        if (!data || data.length === 0) {
            container.innerHTML = '<div class="loading">No hay datos de wellness disponibles</div>';
            return;
        }

        // Ordenar datos por fecha (más antiguos primero)
        const sortedData = [...data].sort((a, b) => new Date(a.id) - new Date(b.id));

        // Procesar datos para análisis
        const processedData = processWellnessData(sortedData);

        // Renderizar cards profesionales
        container.innerHTML = `
            <div class="wellness-header">
                <h2>Análisis de Recuperación y Rendimiento</h2>
                <p class="wellness-subtitle">Últimos 30 días • Datos actualizados</p>
            </div>

            <div class="wellness-metrics-grid">
                ${renderHRVCard(processedData)}
                ${renderRestingHRCard(processedData)}
                ${renderSleepDurationCard(processedData)}
                ${renderSleepScoreCard(processedData)}
            </div>

            <div class="wellness-summary-grid">
                ${renderSummaryCard(processedData)}
            </div>
        `;

        // Renderizar todos los gráficos
        renderHRVChart(processedData);
        renderRestingHRChart(processedData);
        renderSleepDurationChart(processedData);
        renderSleepScoreChart(processedData);

    } catch (error) {
        console.error('Error loading wellness data:', error);
        container.innerHTML = '<div class="loading">Error al cargar los datos de bienestar</div>';
    }
}

/**
 * Procesa los datos de wellness para análisis estadístico
 */
function processWellnessData(data) {
    const dates = data.map(d => d.id);
    const hrvRaw = data.map(d => d.hrv);
    const restingHR = data.map(d => d.restingHR);
    const sleepSecs = data.map(d => d.sleepSecs);
    const sleepScore = data.map(d => d.sleepScore);

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

    const latestSleepScore = sleepScore[sleepScore.length - 1];
    const sleepEvaluation = evaluateSleepScore(latestSleepScore);

    return {
        dates,
        hrv: {
            raw: hrvRaw,
            lnRMSSD: hrvLnRMSSD,
            zScores: hrvZScores,
            mean: hrvMean,
            std: hrvStd,
            ci: hrvCI,
            baseline: hrvBaseline,
            latest: latestHRV,
            latestZScore,
            status: hrvStatus
        },
        restingHR: {
            values: restingHR,
            ci: rhrCI,
            baseline: rhrBaseline,
            latest: restingHR[restingHR.length - 1]
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
            values: sleepScore,
            latest: latestSleepScore,
            evaluation: sleepEvaluation
        }
    };
}

/**
 * Card de HRV con análisis LnRMSSD y Z-Score
 */
function renderHRVCard(data) {
    const { hrv } = data;

    return `
        <div class="metric-card">
            <div class="metric-card-header">
                <h3>Variabilidad Cardíaca (HRV)</h3>
                <div class="metric-badge" style="background-color: ${hrv.status.color}20; color: ${hrv.status.color};">
                    ${hrv.status.status}
                </div>
            </div>
            <div class="metric-card-body">
                <div class="metric-value-group">
                    <div class="metric-primary">
                        <span class="metric-label">HRV Actual</span>
                        <span class="metric-value">${hrv.latest ? hrv.latest.toFixed(0) : 'N/A'} <span class="metric-unit">ms</span></span>
                    </div>
                    <div class="metric-secondary">
                        <span class="metric-label">Z-Score</span>
                        <span class="metric-value ${hrv.latestZScore > 0 ? 'positive' : 'negative'}">
                            ${hrv.latestZScore ? hrv.latestZScore.toFixed(2) : 'N/A'}
                        </span>
                    </div>
                </div>
                <div class="metric-status-text">
                    ${hrv.status.description}
                </div>
                <div class="metric-chart">
                    <canvas id="hrv-chart"></canvas>
                </div>
                <div class="metric-stats">
                    <div class="stat-item">
                        <span class="stat-label">Baseline (7d)</span>
                        <span class="stat-value">${hrv.baseline.mean ? hrv.baseline.mean.toFixed(2) : 'N/A'}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Desv. Estándar</span>
                        <span class="stat-value">${hrv.baseline.std ? hrv.baseline.std.toFixed(2) : 'N/A'}</span>
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
    const { restingHR } = data;

    return `
        <div class="metric-card">
            <div class="metric-card-header">
                <h3>Frecuencia Cardíaca en Reposo</h3>
            </div>
            <div class="metric-card-body">
                <div class="metric-value-group">
                    <div class="metric-primary">
                        <span class="metric-label">RHR Actual</span>
                        <span class="metric-value">${restingHR.latest || 'N/A'} <span class="metric-unit">bpm</span></span>
                    </div>
                </div>
                <div class="metric-chart">
                    <canvas id="rhr-chart"></canvas>
                </div>
                <div class="metric-stats">
                    <div class="stat-item">
                        <span class="stat-label">Baseline (7d)</span>
                        <span class="stat-value">${restingHR.baseline.mean ? restingHR.baseline.mean.toFixed(1) : 'N/A'} bpm</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Rango</span>
                        <span class="stat-value">${restingHR.baseline.min ? restingHR.baseline.min : 'N/A'} - ${restingHR.baseline.max ? restingHR.baseline.max : 'N/A'}</span>
                    </div>
                </div>
            </div>
        </div>
    `;
}

/**
 * Card de Duración del Sueño
 */
function renderSleepDurationCard(data) {
    const { sleep } = data;

    return `
        <div class="metric-card">
            <div class="metric-card-header">
                <h3>Duración del Sueño</h3>
            </div>
            <div class="metric-card-body">
                <div class="metric-value-group">
                    <div class="metric-primary">
                        <span class="metric-label">Última Noche</span>
                        <span class="metric-value">${sleep.latestFormatted}</span>
                    </div>
                </div>
                <div class="metric-chart">
                    <canvas id="sleep-duration-chart"></canvas>
                </div>
                <div class="metric-stats">
                    <div class="stat-item">
                        <span class="stat-label">Promedio (7d)</span>
                        <span class="stat-value">${sleep.baseline.mean ? sleep.baseline.mean.toFixed(1) : 'N/A'} h</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Objetivo</span>
                        <span class="stat-value">7-9 h</span>
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
    const eval = sleepScore.evaluation;

    return `
        <div class="metric-card">
            <div class="metric-card-header">
                <h3>Calidad del Sueño</h3>
                <div class="metric-badge" style="background-color: ${eval.color}20; color: ${eval.color};">
                    ${eval.category}
                </div>
            </div>
            <div class="metric-card-body">
                <div class="metric-value-group">
                    <div class="metric-primary">
                        <span class="metric-label">Puntuación</span>
                        <span class="metric-value">${sleepScore.latest || 'N/A'}<span class="metric-unit">/100</span></span>
                    </div>
                </div>
                <div class="metric-status-text">
                    ${eval.description}
                </div>
                <div class="metric-chart">
                    <canvas id="sleep-score-chart"></canvas>
                </div>
                <div class="sleep-score-legend">
                    <div class="legend-item">
                        <span class="legend-color" style="background-color: #10b981;"></span>
                        <span class="legend-text">Excelente (90-100)</span>
                    </div>
                    <div class="legend-item">
                        <span class="legend-color" style="background-color: #3b82f6;"></span>
                        <span class="legend-text">Bueno (80-89)</span>
                    </div>
                    <div class="legend-item">
                        <span class="legend-color" style="background-color: #f59e0b;"></span>
                        <span class="legend-text">Aceptable (60-79)</span>
                    </div>
                    <div class="legend-item">
                        <span class="legend-color" style="background-color: #ef4444;"></span>
                        <span class="legend-text">Deficiente (<60)</span>
                    </div>
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
            <h3>Resumen de Recuperación</h3>
            <div class="summary-grid">
                <div class="summary-item">
                    <span class="summary-label">Estado HRV</span>
                    <span class="summary-value" style="color: ${data.hrv.status.color};">${data.hrv.status.status}</span>
                </div>
                <div class="summary-item">
                    <span class="summary-label">RHR Promedio</span>
                    <span class="summary-value">${data.restingHR.baseline.mean ? data.restingHR.baseline.mean.toFixed(1) : 'N/A'} bpm</span>
                </div>
                <div class="summary-item">
                    <span class="summary-label">Sueño Promedio</span>
                    <span class="summary-value">${data.sleep.baseline.mean ? data.sleep.baseline.mean.toFixed(1) : 'N/A'} h</span>
                </div>
                <div class="summary-item">
                    <span class="summary-label">Calidad Sueño</span>
                    <span class="summary-value" style="color: ${data.sleepScore.evaluation.color};">${data.sleepScore.evaluation.category}</span>
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
    if (!ctx) return;

    new Chart(ctx, {
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
    if (!ctx) return;

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.dates,
            datasets: [
                {
                    label: 'RHR',
                    data: data.restingHR.values,
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
                    data: data.restingHR.ci.upper,
                    borderColor: 'rgba(245, 158, 11, 0.3)',
                    borderWidth: 1,
                    borderDash: [5, 5],
                    fill: false,
                    pointRadius: 0
                },
                {
                    label: 'IC Inferior',
                    data: data.restingHR.ci.lower,
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
    if (!ctx) return;

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.dates,
            datasets: [
                {
                    label: 'Horas de Sueño',
                    data: data.sleep.hours,
                    backgroundColor: 'rgba(139, 92, 246, 0.6)',
                    borderColor: '#8b5cf6',
                    borderWidth: 1
                },
                {
                    label: 'Promedio Móvil',
                    data: data.sleep.ci.mean,
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
    if (!ctx) return;

    // Colorear barras según la puntuación
    const backgroundColors = data.sleepScore.values.map(score => {
        if (!score) return '#94a3b8';
        if (score >= 90) return '#10b981';
        if (score >= 80) return '#3b82f6';
        if (score >= 60) return '#f59e0b';
        return '#ef4444';
    });

    new Chart(ctx, {
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
 * Opciones comunes de Chart.js
 */
function getChartOptions(unit = '') {
    return {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
            mode: 'index',
            intersect: false
        },
        plugins: {
            legend: {
                display: false
            },
            tooltip: {
                backgroundColor: 'rgba(15, 23, 42, 0.95)',
                titleColor: '#f1f5f9',
                bodyColor: '#cbd5e1',
                borderColor: '#334155',
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
                    color: 'rgba(51, 65, 85, 0.3)',
                    drawBorder: false
                },
                ticks: {
                    color: '#94a3b8',
                    maxRotation: 45,
                    minRotation: 45,
                    font: {
                        size: 10
                    }
                }
            },
            y: {
                grid: {
                    color: 'rgba(51, 65, 85, 0.3)',
                    drawBorder: false
                },
                ticks: {
                    color: '#94a3b8',
                    callback: function(value) {
                        return value.toFixed(1) + ' ' + unit;
                    }
                }
            }
        }
    };
}
