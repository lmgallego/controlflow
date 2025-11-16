/**
 * Componente BPEPanel - Panel de Análisis de Bloques de Patrón Específico
 * Visualiza patrones fisiológicos detectados y proporciona controles interactivos
 */

import { analyzeBPE, blocksToChartAnnotations } from '../bpeAnalysis.js';
import { t } from '../i18n.js';

/**
 * Crea el panel BPE completo
 * @param {Object} wellnessData - Datos de wellness procesados
 * @returns {HTMLElement} - Elemento del panel BPE
 */
export function createBPEPanel(wellnessData) {
    const panel = document.createElement('div');
    panel.className = 'bpe-panel';
    panel.id = 'bpe-panel';

    // Configuración por defecto
    const defaultConfig = {
        threshold: 1.5,
        detectionWindow: 5,
        minVariables: 2,
        optimizeThreshold: false,
        adaptiveWindow: 14
    };

    // Header del panel
    const header = document.createElement('div');
    header.className = 'bpe-header';
    header.innerHTML = `
        <div class="bpe-title-section">
            <h2 class="bpe-title" data-i18n="wellness.bpe.title">${t('wellness.bpe.title')}</h2>
            <p class="bpe-subtitle" data-i18n="wellness.bpe.subtitle">${t('wellness.bpe.subtitle')}</p>
        </div>
        <div class="bpe-controls">
            <div class="bpe-control-group">
                <label data-i18n="wellness.bpe.zThreshold">${t('wellness.bpe.zThreshold')}:</label>
                <input type="number" id="bpe-threshold" min="0.5" max="3" step="0.25" value="${defaultConfig.threshold}">
            </div>
            <div class="bpe-control-group">
                <label data-i18n="wellness.bpe.window">${t('wellness.bpe.window')}:</label>
                <input type="number" id="bpe-window" min="3" max="10" step="1" value="${defaultConfig.detectionWindow}">
                <span data-i18n="wellness.bpe.days">${t('wellness.bpe.days')}</span>
            </div>
            <div class="bpe-control-group">
                <label data-i18n="wellness.bpe.minVariables">${t('wellness.bpe.minVariables')}:</label>
                <input type="number" id="bpe-min-vars" min="1" max="4" step="1" value="${defaultConfig.minVariables}">
            </div>
            <button id="bpe-detect-btn" class="bpe-detect-btn" data-i18n="wellness.bpe.detecting">
                ${t('wellness.bpe.detecting')}
            </button>
        </div>
    `;

    // Contenedor de resultados
    const resultsContainer = document.createElement('div');
    resultsContainer.className = 'bpe-results';
    resultsContainer.id = 'bpe-results';

    panel.appendChild(header);
    panel.appendChild(resultsContainer);

    // Realizar análisis inicial
    performBPEAnalysis(wellnessData, defaultConfig, resultsContainer);

    // Event listener para el botón de detección
    const detectBtn = header.querySelector('#bpe-detect-btn');
    detectBtn.addEventListener('click', () => {
        const threshold = parseFloat(document.getElementById('bpe-threshold').value);
        const detectionWindow = parseInt(document.getElementById('bpe-window').value);
        const minVariables = parseInt(document.getElementById('bpe-min-vars').value);

        const config = {
            threshold,
            detectionWindow,
            minVariables,
            optimizeThreshold: false,
            adaptiveWindow: 14
        };

        performBPEAnalysis(wellnessData, config, resultsContainer);
    });

    return panel;
}

/**
 * Realiza el análisis BPE y actualiza la visualización
 * @param {Object} wellnessData - Datos de wellness
 * @param {Object} config - Configuración del análisis
 * @param {HTMLElement} container - Contenedor de resultados
 */
function performBPEAnalysis(wellnessData, config, container) {
    // Mostrar indicador de carga
    container.innerHTML = `
        <div class="bpe-loading">
            <div class="spinner"></div>
            <p data-i18n="wellness.bpe.detecting">${t('wellness.bpe.detecting')}</p>
        </div>
    `;

    // Simular pequeño delay para feedback visual
    setTimeout(() => {
        const result = analyzeBPE(wellnessData, config);

        if (result.blocks.length === 0) {
            container.innerHTML = `
                <div class="bpe-no-data">
                    <p data-i18n="wellness.bpe.noPatterns">${t('wellness.bpe.noPatterns')}</p>
                </div>
            `;
            return;
        }

        // Renderizar resultados
        renderBPEResults(result, container);
    }, 300);
}

/**
 * Renderiza los resultados del análisis BPE
 * @param {Object} result - Resultado del análisis BPE
 * @param {HTMLElement} container - Contenedor
 */
function renderBPEResults(result, container) {
    container.innerHTML = '';

    // Sección de estadísticas
    const statsSection = createStatsSection(result.stats);
    container.appendChild(statsSection);

    // Sección de timeline
    const timelineSection = createTimelineSection(result);
    container.appendChild(timelineSection);

    // Sección de bloques detectados
    const blocksSection = createBlocksSection(result.blocks, result.dates);
    container.appendChild(blocksSection);
}

/**
 * Crea la sección de estadísticas
 * @param {Object} stats - Estadísticas BPE
 * @returns {HTMLElement}
 */
function createStatsSection(stats) {
    const section = document.createElement('div');
    section.className = 'bpe-stats-section';

    const typeTranslations = {
        fatigue: t('wellness.bpe.types.fatigue'),
        recovery: t('wellness.bpe.types.recovery'),
        disruption: t('wellness.bpe.types.disruption')
    };

    section.innerHTML = `
        <div class="bpe-stats-grid">
            <div class="bpe-stat-card">
                <div class="bpe-stat-label" data-i18n="wellness.bpe.stats.detected">${t('wellness.bpe.stats.detected')}</div>
                <div class="bpe-stat-value">${stats.totalBlocks}</div>
            </div>
            <div class="bpe-stat-card">
                <div class="bpe-stat-label" data-i18n="wellness.bpe.stats.duration">${t('wellness.bpe.stats.duration')}</div>
                <div class="bpe-stat-value">${stats.averageDuration.toFixed(1)} ${t('wellness.bpe.days')}</div>
            </div>
            <div class="bpe-stat-card">
                <div class="bpe-stat-label" data-i18n="wellness.bpe.stats.intensity">${t('wellness.bpe.stats.intensity')}</div>
                <div class="bpe-stat-value">${stats.averageIntensity.toFixed(2)}</div>
            </div>
            <div class="bpe-stat-card bpe-stat-wide">
                <div class="bpe-stat-label">${t('common.types')}</div>
                <div class="bpe-type-distribution">
                    ${Object.entries(stats.typeDistribution).map(([type, count]) => `
                        <div class="bpe-type-item bpe-type-${type}">
                            <span class="bpe-type-name">${typeTranslations[type]}</span>
                            <span class="bpe-type-count">${count}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `;

    return section;
}

/**
 * Crea la sección de timeline con Chart.js
 * @param {Object} result - Resultado completo del análisis
 * @returns {HTMLElement}
 */
function createTimelineSection(result) {
    const section = document.createElement('div');
    section.className = 'bpe-timeline-section';

    const canvas = document.createElement('canvas');
    canvas.id = 'bpe-timeline-chart';
    canvas.height = 150;

    section.appendChild(canvas);

    // Renderizar el gráfico
    renderTimelineChart(canvas, result);

    return section;
}

/**
 * Renderiza el gráfico de timeline con bloques
 * @param {HTMLCanvasElement} canvas - Canvas para el gráfico
 * @param {Object} result - Resultado del análisis
 */
function renderTimelineChart(canvas, result) {
    const ctx = canvas.getContext('2d');
    const annotations = blocksToChartAnnotations(result.blocks, result.dates);

    // Preparar datos para el gráfico (mostrar intensidad de cada bloque)
    const blockIntensities = new Array(result.dates.length).fill(null);
    result.blocks.forEach(block => {
        for (let i = block.startIndex; i <= block.endIndex; i++) {
            blockIntensities[i] = block.intensity;
        }
    });

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: result.dates,
            datasets: [{
                label: 'Intensidad de Patrón',
                data: blockIntensities,
                borderColor: 'rgba(99, 102, 241, 0.8)',
                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                borderWidth: 2,
                tension: 0.4,
                fill: true,
                pointRadius: 4,
                pointHoverRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'index',
                intersect: false
            },
            plugins: {
                legend: {
                    display: true,
                    labels: {
                        color: 'var(--text-primary)',
                        font: { size: 12 }
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    borderColor: 'rgba(99, 102, 241, 0.5)',
                    borderWidth: 1,
                    padding: 12,
                    displayColors: true
                },
                annotation: {
                    annotations: annotations
                }
            },
            scales: {
                x: {
                    type: 'time',
                    time: {
                        unit: 'day',
                        displayFormats: {
                            day: 'MMM dd'
                        }
                    },
                    grid: {
                        color: 'rgba(148, 163, 184, 0.1)'
                    },
                    ticks: {
                        color: 'var(--text-secondary)',
                        maxRotation: 45,
                        minRotation: 0
                    }
                },
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(148, 163, 184, 0.1)'
                    },
                    ticks: {
                        color: 'var(--text-secondary)'
                    },
                    title: {
                        display: true,
                        text: 'Intensidad (Z-Score)',
                        color: 'var(--text-secondary)'
                    }
                }
            }
        }
    });
}

/**
 * Crea la sección de lista de bloques detectados
 * @param {Array} blocks - Array de bloques
 * @param {Array} dates - Array de fechas
 * @returns {HTMLElement}
 */
function createBlocksSection(blocks, dates) {
    const section = document.createElement('div');
    section.className = 'bpe-blocks-section';

    const typeIcons = {
        fatigue: '⚠️',
        recovery: '✅',
        disruption: '⚡'
    };

    const typeTranslations = {
        fatigue: t('wellness.bpe.types.fatigue'),
        recovery: t('wellness.bpe.types.recovery'),
        disruption: t('wellness.bpe.types.disruption')
    };

    const typeDescriptions = {
        fatigue: t('wellness.bpe.description.fatigue'),
        recovery: t('wellness.bpe.description.recovery'),
        disruption: t('wellness.bpe.description.disruption')
    };

    const variableNames = {
        hrv: 'HRV',
        rhr: 'RHR',
        sleep: t('wellness.sleepDuration.title'),
        sleepScore: t('wellness.sleepScore.title')
    };

    section.innerHTML = `
        <h3 class="bpe-blocks-title">Bloques Detectados (${blocks.length})</h3>
        <div class="bpe-blocks-list">
            ${blocks.map((block, index) => {
                const startDate = new Date(dates[block.startIndex]).toLocaleDateString();
                const endDate = new Date(dates[block.endIndex]).toLocaleDateString();

                return `
                    <div class="bpe-block-item bpe-block-${block.type}">
                        <div class="bpe-block-header">
                            <span class="bpe-block-icon">${typeIcons[block.type]}</span>
                            <span class="bpe-block-type">${typeTranslations[block.type]}</span>
                            <span class="bpe-block-dates">${startDate} - ${endDate}</span>
                        </div>
                        <div class="bpe-block-body">
                            <p class="bpe-block-description">${typeDescriptions[block.type]}</p>
                            <div class="bpe-block-details">
                                <span>Duración: ${block.duration} días</span>
                                <span>Intensidad: ${block.intensity.toFixed(2)}</span>
                                <span>Variables: ${block.activeVariables.map(v => variableNames[v]).join(', ')}</span>
                            </div>
                        </div>
                    </div>
                `;
            }).join('')}
        </div>
    `;

    return section;
}

/**
 * Actualiza el panel BPE con nuevos datos
 * @param {Object} wellnessData - Nuevos datos de wellness
 */
export function updateBPEPanel(wellnessData) {
    const panel = document.getElementById('bpe-panel');
    if (!panel) return;

    const resultsContainer = document.getElementById('bpe-results');
    const threshold = parseFloat(document.getElementById('bpe-threshold').value);
    const detectionWindow = parseInt(document.getElementById('bpe-window').value);
    const minVariables = parseInt(document.getElementById('bpe-min-vars').value);

    const config = {
        threshold,
        detectionWindow,
        minVariables,
        optimizeThreshold: false,
        adaptiveWindow: 14
    };

    performBPEAnalysis(wellnessData, config, resultsContainer);
}
