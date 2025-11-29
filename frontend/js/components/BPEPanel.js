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
        threshold: 1.0,
        detectionWindow: 3,
        selectedVariables: ['hrv', 'rhr', 'sleep', 'sleepScore'],
        optimizeThreshold: false,
        adaptiveWindow: 14
    };

    // Header del panel
    const header = document.createElement('div');
    header.className = 'bpe-header';
    header.innerHTML = `
        <div class="bpe-title-section">
            <div class="bpe-title-row">
                <h2 class="bpe-title" data-i18n="wellness.bpe.title">${t('wellness.bpe.title')}</h2>
                <button class="bpe-info-btn" id="bpe-info-btn" title="${t('wellness.bpe.info.tooltip')}">
                    <span class="info-icon">ℹ️</span>
                </button>
            </div>
            <p class="bpe-subtitle" data-i18n="wellness.bpe.subtitle">${t('wellness.bpe.subtitle')}</p>
        </div>
        <div class="bpe-controls">
            <div class="bpe-control-group bpe-slider-group">
                <label for="bpe-threshold">
                    <span data-i18n="wellness.bpe.zThreshold">${t('wellness.bpe.zThreshold')}</span>:
                    <span id="bpe-threshold-value">${defaultConfig.threshold}</span>
                </label>
                <input type="range" id="bpe-threshold" min="0.5" max="3" step="0.1" value="${defaultConfig.threshold}">
            </div>
            <div class="bpe-control-group bpe-slider-group">
                <label for="bpe-window">
                    <span data-i18n="wellness.bpe.window">${t('wellness.bpe.window')}</span>:
                    <span id="bpe-window-value">${defaultConfig.detectionWindow}</span>
                    <span data-i18n="wellness.bpe.days">${t('wellness.bpe.days')}</span>
                </label>
                <input type="range" id="bpe-window" min="3" max="10" step="1" value="${defaultConfig.detectionWindow}">
            </div>
            <div class="bpe-control-group bpe-variables-group">
                <label data-i18n="wellness.bpe.variables">${t('wellness.bpe.variables')}:</label>
                <div class="bpe-checkboxes">
                    <label class="bpe-checkbox-label">
                        <input type="checkbox" class="bpe-var-checkbox" value="hrv" checked>
                        <span>HRV</span>
                    </label>
                    <label class="bpe-checkbox-label">
                        <input type="checkbox" class="bpe-var-checkbox" value="rhr" checked>
                        <span>RHR</span>
                    </label>
                    <label class="bpe-checkbox-label">
                        <input type="checkbox" class="bpe-var-checkbox" value="sleep" checked>
                        <span data-i18n="wellness.bpe.sleepVar">${t('wellness.bpe.sleepVar')}</span>
                    </label>
                    <label class="bpe-checkbox-label">
                        <input type="checkbox" class="bpe-var-checkbox" value="sleepScore" checked>
                        <span data-i18n="wellness.bpe.sleepScoreVar">${t('wellness.bpe.sleepScoreVar')}</span>
                    </label>
                </div>
            </div>
            <button id="bpe-detect-btn" class="bpe-detect-btn" data-i18n="wellness.bpe.detect">
                ${t('wellness.bpe.detect')}
            </button>
            <button id="bpe-blocks-btn" class="bpe-blocks-btn" style="display:none;" data-i18n="wellness.bpe.viewBlocks">
                ${t('wellness.bpe.viewBlocks')}
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

    // Event listeners para sliders (actualizar valores mostrados)
    const thresholdSlider = header.querySelector('#bpe-threshold');
    const windowSlider = header.querySelector('#bpe-window');
    const thresholdValue = header.querySelector('#bpe-threshold-value');
    const windowValue = header.querySelector('#bpe-window-value');

    thresholdSlider.addEventListener('input', (e) => {
        thresholdValue.textContent = parseFloat(e.target.value).toFixed(1);
    });

    windowSlider.addEventListener('input', (e) => {
        windowValue.textContent = e.target.value;
    });

    // Event listener para el botón de detección
    const detectBtn = header.querySelector('#bpe-detect-btn');
    detectBtn.addEventListener('click', () => {
        const threshold = parseFloat(document.getElementById('bpe-threshold').value);
        const detectionWindow = parseInt(document.getElementById('bpe-window').value);

        // Obtener variables seleccionadas
        const checkboxes = header.querySelectorAll('.bpe-var-checkbox:checked');
        const selectedVariables = Array.from(checkboxes).map(cb => cb.value);

        if (selectedVariables.length < 1) {
            alert(t('wellness.bpe.selectAtLeastOne'));
            return;
        }

        const config = {
            threshold,
            detectionWindow,
            selectedVariables,
            minVariables: Math.min(2, selectedVariables.length),
            optimizeThreshold: false,
            adaptiveWindow: 14
        };

        performBPEAnalysis(wellnessData, config, resultsContainer);
    });

    // Event listener para botón de info
    const infoBtn = header.querySelector('#bpe-info-btn');
    infoBtn?.addEventListener('click', () => {
        showBPEInfo();
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
    
    // Header con título y controles
    const header = document.createElement('div');
    header.className = 'bpe-timeline-header';
    header.innerHTML = `
        <h4 class="bpe-timeline-title">${t('wellness.bpe.timeline') || 'Pattern Timeline'}</h4>
        <button class="bpe-timeline-fullscreen-btn" id="bpe-timeline-fullscreen" title="Fullscreen">⛶</button>
    `;
    
    // Contenedor del gráfico con altura fija
    const chartContainer = document.createElement('div');
    chartContainer.className = 'bpe-timeline-container';
    chartContainer.id = 'bpe-timeline-container';

    const canvas = document.createElement('canvas');
    canvas.id = 'bpe-timeline-chart';

    chartContainer.appendChild(canvas);
    section.appendChild(header);
    section.appendChild(chartContainer);

    // Renderizar el gráfico
    renderTimelineChart(canvas, result);
    
    // Event listener para fullscreen
    setTimeout(() => {
        const fullscreenBtn = section.querySelector('#bpe-timeline-fullscreen');
        if (fullscreenBtn) {
            fullscreenBtn.addEventListener('click', () => {
                showFullscreenBPEChart(result);
            });
        }
    }, 0);

    return section;
}

/**
 * Muestra el gráfico BPE en pantalla completa
 */
function showFullscreenBPEChart(result) {
    const modal = document.createElement('div');
    modal.className = 'bpe-fullscreen-modal';
    modal.innerHTML = `
        <div class="bpe-fullscreen-content">
            <div class="bpe-fullscreen-header">
                <h3>${t('wellness.bpe.timeline') || 'Pattern Timeline'}</h3>
                <button class="bpe-fullscreen-close">&times;</button>
            </div>
            <div class="bpe-fullscreen-chart-container">
                <canvas id="bpe-fullscreen-chart"></canvas>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Renderizar gráfico en fullscreen
    const canvas = modal.querySelector('#bpe-fullscreen-chart');
    renderTimelineChart(canvas, result, true);
    
    // Cerrar modal
    const closeBtn = modal.querySelector('.bpe-fullscreen-close');
    closeBtn.addEventListener('click', () => modal.remove());
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.remove();
    });
    
    // ESC para cerrar
    const handleEsc = (e) => {
        if (e.key === 'Escape') {
            modal.remove();
            document.removeEventListener('keydown', handleEsc);
        }
    };
    document.addEventListener('keydown', handleEsc);
}

/**
 * Obtiene colores según el tema actual para gráficos
 */
function getBPEThemeColors() {
    const theme = document.documentElement.getAttribute('data-theme') || 'dark';

    if (theme === 'light') {
        return {
            text: '#0f172a',
            textSecondary: '#475569',
            grid: 'rgba(148, 163, 184, 0.2)',
            tooltipBg: 'rgba(255, 255, 255, 0.95)',
            tooltipBorder: '#cbd5e1',
            tooltipText: '#0f172a'
        };
    } else {
        return {
            text: '#f1f5f9',
            textSecondary: '#cbd5e1',
            grid: 'rgba(148, 163, 184, 0.1)',
            tooltipBg: 'rgba(0, 0, 0, 0.9)',
            tooltipBorder: 'rgba(99, 102, 241, 0.5)',
            tooltipText: '#ffffff'
        };
    }
}

/**
 * Renderiza el gráfico de timeline con bloques
 * @param {HTMLCanvasElement} canvas - Canvas para el gráfico
 * @param {Object} result - Resultado del análisis
 * @param {boolean} isFullscreen - Si está en modo fullscreen
 */
function renderTimelineChart(canvas, result, isFullscreen = false) {
    const ctx = canvas.getContext('2d');
    const annotations = blocksToChartAnnotations(result.blocks, result.dates);
    const colors = getBPEThemeColors();

    // Preparar datos para el gráfico (mostrar intensidad de cada bloque)
    const blockIntensities = new Array(result.dates.length).fill(null);
    result.blocks.forEach(block => {
        for (let i = block.startIndex; i <= block.endIndex; i++) {
            blockIntensities[i] = block.intensity;
        }
    });

    // Configuración adaptativa según el número de días
    const numDays = result.dates.length;
    const maxTicksToShow = isFullscreen ? 20 : Math.min(12, numDays);

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: result.dates,
            datasets: [{
                label: t('wellness.bpe.patternIntensity') || 'Pattern Intensity',
                data: blockIntensities,
                borderColor: 'rgba(99, 102, 241, 0.8)',
                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                borderWidth: 2,
                tension: 0.4,
                fill: true,
                pointRadius: isFullscreen ? 4 : 2,
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
                    position: 'top',
                    align: 'end',
                    labels: {
                        color: colors.text,
                        font: { size: 11 },
                        boxWidth: 12,
                        padding: 8
                    }
                },
                tooltip: {
                    backgroundColor: colors.tooltipBg,
                    titleColor: colors.tooltipText,
                    bodyColor: colors.tooltipText,
                    borderColor: colors.tooltipBorder,
                    borderWidth: 1,
                    padding: 10,
                    displayColors: true,
                    callbacks: {
                        title: (items) => {
                            if (items.length > 0) {
                                const date = new Date(items[0].label);
                                return date.toLocaleDateString();
                            }
                            return '';
                        }
                    }
                },
                annotation: {
                    annotations: annotations
                }
            },
            scales: {
                x: {
                    type: 'time',
                    time: {
                        unit: numDays > 60 ? 'week' : 'day',
                        displayFormats: {
                            day: 'dd MMM',
                            week: 'dd MMM'
                        }
                    },
                    grid: {
                        display: false
                    },
                    ticks: {
                        color: colors.textSecondary,
                        maxRotation: 0,
                        autoSkip: true,
                        maxTicksLimit: maxTicksToShow,
                        font: { size: 10 }
                    }
                },
                y: {
                    beginAtZero: true,
                    grid: {
                        color: colors.grid
                    },
                    ticks: {
                        color: colors.textSecondary,
                        font: { size: 10 }
                    },
                    title: {
                        display: isFullscreen,
                        text: t('wellness.bpe.intensity') || 'Intensity (Z-Score)',
                        color: colors.textSecondary,
                        font: { size: 11 }
                    }
                }
            }
        }
    });
}

/**
 * Crea la sección de lista de bloques detectados con scroll y paginación
 * @param {Array} blocks - Array de bloques
 * @param {Array} dates - Array de fechas
 * @returns {HTMLElement}
 */
function createBlocksSection(blocks, dates) {
    const section = document.createElement('div');
    section.className = 'bpe-blocks-section';
    
    const INITIAL_VISIBLE = 4; // Bloques visibles inicialmente
    const isCollapsible = blocks.length > INITIAL_VISIBLE;

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

    const renderBlockCard = (block, index) => {
        const startDate = new Date(dates[block.startIndex]).toLocaleDateString();
        const endDate = new Date(dates[block.endIndex]).toLocaleDateString();
        return `
            <div class="bpe-block-card bpe-block-${block.type}">
                <div class="bpe-block-header">
                    <div class="bpe-block-type-badge">
                        <span class="bpe-block-icon">${typeIcons[block.type]}</span>
                        <span class="bpe-block-type-text">${typeTranslations[block.type]}</span>
                    </div>
                    <div class="bpe-block-index">#${index + 1}</div>
                </div>
                <div class="bpe-block-body">
                    <div class="bpe-block-info-row">
                        <div class="bpe-block-info-item">
                            <span class="bpe-info-label">${t('wellness.bpe.table.period')}</span>
                            <span class="bpe-info-value">${startDate} - ${endDate}</span>
                        </div>
                    </div>
                    <div class="bpe-block-info-row">
                        <div class="bpe-block-info-item">
                            <span class="bpe-info-label">${t('wellness.bpe.table.duration')}</span>
                            <span class="bpe-info-value">${block.duration} ${t('wellness.bpe.table.days')}</span>
                        </div>
                        <div class="bpe-block-info-item">
                            <span class="bpe-info-label">${t('wellness.bpe.table.intensity')}</span>
                            <span class="bpe-info-value">${block.intensity.toFixed(2)}</span>
                        </div>
                    </div>
                    <div class="bpe-block-info-row">
                        <div class="bpe-block-info-item bpe-variables-item">
                            <span class="bpe-info-label">${t('wellness.bpe.table.variables')}</span>
                            <div class="bpe-variables-badges">
                                ${block.activeVariables.map(v => `<span class="bpe-variable-badge">${variableNames[v]}</span>`).join('')}
                            </div>
                        </div>
                    </div>
                    <div class="bpe-block-description">
                        ${typeDescriptions[block.type]}
                    </div>
                </div>
            </div>
        `;
    };

    section.innerHTML = `
        <div class="bpe-blocks-header">
            <h3 class="bpe-blocks-title">${t('wellness.bpe.table.title')} (${blocks.length})</h3>
            ${isCollapsible ? `
                <button class="bpe-toggle-btn" id="bpe-toggle-blocks">
                    <span class="bpe-toggle-text">${t('wellness.bpe.showAll') || 'Show All'}</span>
                    <span class="bpe-toggle-icon">▼</span>
                </button>
            ` : ''}
        </div>
        <div class="bpe-blocks-container ${isCollapsible ? 'bpe-collapsed' : ''}" id="bpe-blocks-container">
            <div class="bpe-blocks-table">
                ${blocks.map((block, index) => renderBlockCard(block, index)).join('')}
            </div>
        </div>
        ${isCollapsible ? `
            <div class="bpe-blocks-fade" id="bpe-blocks-fade"></div>
        ` : ''}
    `;

    // Event listener para expandir/colapsar
    if (isCollapsible) {
        setTimeout(() => {
            const toggleBtn = section.querySelector('#bpe-toggle-blocks');
            const container = section.querySelector('#bpe-blocks-container');
            const fade = section.querySelector('#bpe-blocks-fade');
            
            if (toggleBtn && container) {
                toggleBtn.addEventListener('click', () => {
                    const isExpanded = container.classList.toggle('bpe-expanded');
                    container.classList.toggle('bpe-collapsed', !isExpanded);
                    
                    const toggleText = toggleBtn.querySelector('.bpe-toggle-text');
                    const toggleIcon = toggleBtn.querySelector('.bpe-toggle-icon');
                    
                    if (isExpanded) {
                        toggleText.textContent = t('wellness.bpe.showLess') || 'Show Less';
                        toggleIcon.textContent = '▲';
                        if (fade) fade.style.display = 'none';
                    } else {
                        toggleText.textContent = t('wellness.bpe.showAll') || 'Show All';
                        toggleIcon.textContent = '▼';
                        if (fade) fade.style.display = 'block';
                    }
                });
            }
        }, 0);
    }

    return section;
}

/**
 * Muestra popup con información sobre BPE
 */
function showBPEInfo() {
    const modal = document.createElement('div');
    modal.className = 'bpe-info-modal';
    modal.innerHTML = `
        <div class="bpe-info-content">
            <button class="bpe-info-close">&times;</button>
            <h3 data-i18n="wellness.bpe.info.title">${t('wellness.bpe.info.title')}</h3>
            <div class="bpe-info-body">
                <p data-i18n="wellness.bpe.info.what">${t('wellness.bpe.info.what')}</p>
                <p data-i18n="wellness.bpe.info.how">${t('wellness.bpe.info.how')}</p>
                <h4 data-i18n="wellness.bpe.info.typesTitle">${t('wellness.bpe.info.typesTitle')}</h4>
                <ul>
                    <li><strong data-i18n="wellness.bpe.types.fatigue">${t('wellness.bpe.types.fatigue')}</strong>: ${t('wellness.bpe.info.fatigueDesc')}</li>
                    <li><strong data-i18n="wellness.bpe.types.recovery">${t('wellness.bpe.types.recovery')}</strong>: ${t('wellness.bpe.info.recoveryDesc')}</li>
                    <li><strong data-i18n="wellness.bpe.types.disruption">${t('wellness.bpe.types.disruption')}</strong>: ${t('wellness.bpe.info.disruptionDesc')}</li>
                </ul>
                <h4 data-i18n="wellness.bpe.info.interpretTitle">${t('wellness.bpe.info.interpretTitle')}</h4>
                <p data-i18n="wellness.bpe.info.interpret">${t('wellness.bpe.info.interpret')}</p>
            </div>
        </div>
    `;

    modal.addEventListener('click', (e) => {
        if (e.target === modal || e.target.classList.contains('bpe-info-close')) {
            modal.remove();
        }
    });

    document.body.appendChild(modal);
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

    const checkboxes = document.querySelectorAll('.bpe-var-checkbox:checked');
    const selectedVariables = Array.from(checkboxes).map(cb => cb.value);

    const config = {
        threshold,
        detectionWindow,
        selectedVariables,
        minVariables: Math.min(2, selectedVariables.length),
        optimizeThreshold: false,
        adaptiveWindow: 14
    };

    performBPEAnalysis(wellnessData, config, resultsContainer);
}
