/**
 * Componente DTFPanel - Panel de Detección Temprana de Fatiga
 * Visualiza patrones fisiológicos detectados y proporciona controles interactivos
 */

import { analyzeDTF, blocksToChartAnnotations } from '../dtfAnalysis.js';
import { t } from '../i18n.js';

/**
 * Crea el panel BPE completo
 * @param {Object} wellnessData - Datos de wellness procesados
 * @returns {HTMLElement} - Elemento del panel BPE
 */
export function createDTFPanel(wellnessData) {
    const panel = document.createElement('div');
    panel.className = 'dtf-panel';
    panel.id = 'dtf-panel';

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
    header.className = 'dtf-header';
    header.innerHTML = `
        <div class="dtf-title-section">
            <div class="dtf-title-row">
                <h2 class="dtf-title" data-i18n="wellness.dtf.title">${t('wellness.dtf.title')}</h2>
                <button class="dtf-info-btn" id="dtf-info-btn" title="${t('wellness.dtf.info.tooltip')}">
                    <span class="info-icon">ℹ️</span>
                </button>
            </div>
            <p class="dtf-subtitle" data-i18n="wellness.dtf.subtitle">${t('wellness.dtf.subtitle')}</p>
        </div>
        <div class="dtf-controls">
            <div class="dtf-control-group dtf-slider-group">
                <label for="dtf-threshold">
                    <span data-i18n="wellness.dtf.zThreshold">${t('wellness.dtf.zThreshold')}</span>:
                    <span id="dtf-threshold-value">${defaultConfig.threshold}</span>
                </label>
                <input type="range" id="dtf-threshold" min="0.5" max="3" step="0.1" value="${defaultConfig.threshold}">
            </div>
            <div class="dtf-control-group dtf-slider-group">
                <label for="dtf-window">
                    <span data-i18n="wellness.dtf.window">${t('wellness.dtf.window')}</span>:
                    <span id="dtf-window-value">${defaultConfig.detectionWindow}</span>
                    <span data-i18n="wellness.dtf.days">${t('wellness.dtf.days')}</span>
                </label>
                <input type="range" id="dtf-window" min="2" max="10" step="1" value="${defaultConfig.detectionWindow}">
            </div>
            <div class="dtf-control-group dtf-variables-group">
                <label data-i18n="wellness.dtf.variables">${t('wellness.dtf.variables')}:</label>
                <div class="dtf-checkboxes">
                    <label class="dtf-checkbox-label">
                        <input type="checkbox" class="dtf-var-checkbox" value="hrv" checked>
                        <span>HRV</span>
                    </label>
                    <label class="dtf-checkbox-label">
                        <input type="checkbox" class="dtf-var-checkbox" value="rhr" checked>
                        <span>RHR</span>
                    </label>
                    <label class="dtf-checkbox-label">
                        <input type="checkbox" class="dtf-var-checkbox" value="sleep" checked>
                        <span data-i18n="wellness.dtf.sleepVar">${t('wellness.dtf.sleepVar')}</span>
                    </label>
                    <label class="dtf-checkbox-label">
                        <input type="checkbox" class="dtf-var-checkbox" value="sleepScore" checked>
                        <span data-i18n="wellness.dtf.sleepScoreVar">${t('wellness.dtf.sleepScoreVar')}</span>
                    </label>
                </div>
            </div>
            <button id="dtf-detect-btn" class="dtf-detect-btn" data-i18n="wellness.dtf.detect">
                ${t('wellness.dtf.detect')}
            </button>
            <button id="dtf-blocks-btn" class="dtf-blocks-btn" style="display:none;" data-i18n="wellness.dtf.viewBlocks">
                ${t('wellness.dtf.viewBlocks')}
            </button>
        </div>
    `;

    // Contenedor de resultados
    const resultsContainer = document.createElement('div');
    resultsContainer.className = 'dtf-results';
    resultsContainer.id = 'dtf-results';

    panel.appendChild(header);
    panel.appendChild(resultsContainer);

    // Realizar análisis inicial
    performDTFAnalysis(wellnessData, defaultConfig, resultsContainer);

    // Event listeners para sliders (actualizar valores mostrados)
    const thresholdSlider = header.querySelector('#dtf-threshold');
    const windowSlider = header.querySelector('#dtf-window');
    const thresholdValue = header.querySelector('#dtf-threshold-value');
    const windowValue = header.querySelector('#dtf-window-value');

    thresholdSlider.addEventListener('input', (e) => {
        thresholdValue.textContent = parseFloat(e.target.value).toFixed(1);
    });

    windowSlider.addEventListener('input', (e) => {
        windowValue.textContent = e.target.value;
    });

    // Event listener para el botón de detección
    const detectBtn = header.querySelector('#dtf-detect-btn');
    detectBtn.addEventListener('click', () => {
        const threshold = parseFloat(document.getElementById('dtf-threshold').value);
        const detectionWindow = parseInt(document.getElementById('dtf-window').value);

        // Obtener variables seleccionadas
        const checkboxes = header.querySelectorAll('.dtf-var-checkbox:checked');
        const selectedVariables = Array.from(checkboxes).map(cb => cb.value);

        if (selectedVariables.length < 1) {
            alert(t('wellness.dtf.selectAtLeastOne'));
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

        performDTFAnalysis(wellnessData, config, resultsContainer);
    });

    // Event listener para botón de info
    const infoBtn = header.querySelector('#dtf-info-btn');
    infoBtn?.addEventListener('click', () => {
        showDTFInfo();
    });

    return panel;
}

/**
 * Realiza el análisis BPE y actualiza la visualización
 * @param {Object} wellnessData - Datos de wellness
 * @param {Object} config - Configuración del análisis
 * @param {HTMLElement} container - Contenedor de resultados
 */
function performDTFAnalysis(wellnessData, config, container) {
    // Mostrar indicador de carga
    container.innerHTML = `
        <div class="dtf-loading">
            <div class="spinner"></div>
            <p data-i18n="wellness.dtf.detecting">${t('wellness.dtf.detecting')}</p>
        </div>
    `;

    // Simular pequeño delay para feedback visual
    setTimeout(() => {
        const result = analyzeDTF(wellnessData, config);

        if (result.blocks.length === 0) {
            container.innerHTML = `
                <div class="dtf-no-data">
                    <p data-i18n="wellness.dtf.noPatterns">${t('wellness.dtf.noPatterns')}</p>
                </div>
            `;
            return;
        }

        // Renderizar resultados
        renderDTFResults(result, container);
    }, 300);
}

/**
 * Renderiza los resultados del análisis BPE
 * @param {Object} result - Resultado del análisis BPE
 * @param {HTMLElement} container - Contenedor
 */
function renderDTFResults(result, container) {
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
    section.className = 'dtf-stats-section';

    const typeTranslations = {
        fatigue: t('wellness.dtf.types.fatigue'),
        recovery: t('wellness.dtf.types.recovery'),
        disruption: t('wellness.dtf.types.disruption')
    };

    section.innerHTML = `
        <div class="dtf-stats-grid">
            <div class="dtf-stat-card">
                <div class="dtf-stat-label" data-i18n="wellness.dtf.stats.detected">${t('wellness.dtf.stats.detected')}</div>
                <div class="dtf-stat-value">${stats.totalBlocks}</div>
            </div>
            <div class="dtf-stat-card">
                <div class="dtf-stat-label" data-i18n="wellness.dtf.stats.duration">${t('wellness.dtf.stats.duration')}</div>
                <div class="dtf-stat-value">${stats.averageDuration.toFixed(1)} ${t('wellness.dtf.days')}</div>
            </div>
            <div class="dtf-stat-card">
                <div class="dtf-stat-label" data-i18n="wellness.dtf.stats.intensity">${t('wellness.dtf.stats.intensity')}</div>
                <div class="dtf-stat-value">${stats.averageIntensity.toFixed(2)}</div>
            </div>
            <div class="dtf-stat-card dtf-stat-wide">
                <div class="dtf-stat-label">${t('common.types')}</div>
                <div class="dtf-type-distribution">
                    ${Object.entries(stats.typeDistribution).map(([type, count]) => `
                        <div class="dtf-type-item dtf-type-${type}">
                            <span class="dtf-type-name">${typeTranslations[type]}</span>
                            <span class="dtf-type-count">${count}</span>
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
    section.className = 'dtf-timeline-section';
    
    // Header con título y controles
    const header = document.createElement('div');
    header.className = 'dtf-timeline-header';
    header.innerHTML = `
        <h4 class="dtf-timeline-title">${t('wellness.dtf.timeline') || 'Pattern Timeline'}</h4>
        <button class="dtf-timeline-fullscreen-btn" id="dtf-timeline-fullscreen" title="Fullscreen">⛶</button>
    `;
    
    // Contenedor del gráfico con altura fija
    const chartContainer = document.createElement('div');
    chartContainer.className = 'dtf-timeline-container';
    chartContainer.id = 'dtf-timeline-container';

    const canvas = document.createElement('canvas');
    canvas.id = 'dtf-timeline-chart';

    chartContainer.appendChild(canvas);
    section.appendChild(header);
    section.appendChild(chartContainer);

    // Renderizar el gráfico
    renderTimelineChart(canvas, result);
    
    // Event listener para fullscreen
    setTimeout(() => {
        const fullscreenBtn = section.querySelector('#dtf-timeline-fullscreen');
        if (fullscreenBtn) {
            fullscreenBtn.addEventListener('click', () => {
                showFullscreenDTFChart(result);
            });
        }
    }, 0);

    return section;
}

/**
 * Muestra el gráfico BPE en pantalla completa
 */
function showFullscreenDTFChart(result) {
    const modal = document.createElement('div');
    modal.className = 'dtf-fullscreen-modal';
    modal.innerHTML = `
        <div class="dtf-fullscreen-content">
            <div class="dtf-fullscreen-header">
                <h3>${t('wellness.dtf.timeline') || 'Pattern Timeline'}</h3>
                <button class="dtf-fullscreen-close">&times;</button>
            </div>
            <div class="dtf-fullscreen-chart-container">
                <canvas id="dtf-fullscreen-chart"></canvas>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Renderizar gráfico en fullscreen
    const canvas = modal.querySelector('#dtf-fullscreen-chart');
    renderTimelineChart(canvas, result, true);
    
    // Cerrar modal
    const closeBtn = modal.querySelector('.dtf-fullscreen-close');
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
                label: t('wellness.dtf.patternIntensity') || 'Pattern Intensity',
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
                        text: t('wellness.dtf.intensity') || 'Intensity (Z-Score)',
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
    section.className = 'dtf-blocks-section';
    
    const INITIAL_VISIBLE = 4; // Bloques visibles inicialmente
    const isCollapsible = blocks.length > INITIAL_VISIBLE;

    const typeIcons = {
        fatigue: '⚠️',
        recovery: '✅',
        disruption: '⚡'
    };

    const typeTranslations = {
        fatigue: t('wellness.dtf.types.fatigue'),
        recovery: t('wellness.dtf.types.recovery'),
        disruption: t('wellness.dtf.types.disruption')
    };

    const typeDescriptions = {
        fatigue: t('wellness.dtf.description.fatigue'),
        recovery: t('wellness.dtf.description.recovery'),
        disruption: t('wellness.dtf.description.disruption')
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
            <div class="dtf-block-card dtf-block-${block.type}">
                <div class="dtf-block-header">
                    <div class="dtf-block-type-badge">
                        <span class="dtf-block-icon">${typeIcons[block.type]}</span>
                        <span class="dtf-block-type-text">${typeTranslations[block.type]}</span>
                    </div>
                    <div class="dtf-block-index">#${index + 1}</div>
                </div>
                <div class="dtf-block-body">
                    <div class="dtf-block-info-row">
                        <div class="dtf-block-info-item">
                            <span class="dtf-info-label">${t('wellness.dtf.table.period')}</span>
                            <span class="dtf-info-value">${startDate} - ${endDate}</span>
                        </div>
                    </div>
                    <div class="dtf-block-info-row">
                        <div class="dtf-block-info-item">
                            <span class="dtf-info-label">${t('wellness.dtf.table.duration')}</span>
                            <span class="dtf-info-value">${block.duration} ${t('wellness.dtf.table.days')}</span>
                        </div>
                        <div class="dtf-block-info-item">
                            <span class="dtf-info-label">${t('wellness.dtf.table.intensity')}</span>
                            <span class="dtf-info-value">${block.intensity.toFixed(2)}</span>
                        </div>
                    </div>
                    <div class="dtf-block-info-row">
                        <div class="dtf-block-info-item dtf-variables-item">
                            <span class="dtf-info-label">${t('wellness.dtf.table.variables')}</span>
                            <div class="dtf-variables-badges">
                                ${block.activeVariables.map(v => `<span class="dtf-variable-badge">${variableNames[v]}</span>`).join('')}
                            </div>
                        </div>
                    </div>
                    <div class="dtf-block-description">
                        ${typeDescriptions[block.type]}
                    </div>
                </div>
            </div>
        `;
    };

    section.innerHTML = `
        <div class="dtf-blocks-header">
            <h3 class="dtf-blocks-title">${t('wellness.dtf.table.title')} (${blocks.length})</h3>
            ${isCollapsible ? `
                <button class="dtf-toggle-btn" id="dtf-toggle-blocks">
                    <span class="dtf-toggle-text">${t('wellness.dtf.showAll') || 'Show All'}</span>
                    <span class="dtf-toggle-icon">▼</span>
                </button>
            ` : ''}
        </div>
        <div class="dtf-blocks-container ${isCollapsible ? 'dtf-collapsed' : ''}" id="dtf-blocks-container">
            <div class="dtf-blocks-table">
                ${blocks.map((block, index) => renderBlockCard(block, index)).join('')}
            </div>
        </div>
        ${isCollapsible ? `
            <div class="dtf-blocks-fade" id="dtf-blocks-fade"></div>
        ` : ''}
    `;

    // Event listener para expandir/colapsar
    if (isCollapsible) {
        setTimeout(() => {
            const toggleBtn = section.querySelector('#dtf-toggle-blocks');
            const container = section.querySelector('#dtf-blocks-container');
            const fade = section.querySelector('#dtf-blocks-fade');
            
            if (toggleBtn && container) {
                toggleBtn.addEventListener('click', () => {
                    const isExpanded = container.classList.toggle('dtf-expanded');
                    container.classList.toggle('dtf-collapsed', !isExpanded);
                    
                    const toggleText = toggleBtn.querySelector('.dtf-toggle-text');
                    const toggleIcon = toggleBtn.querySelector('.dtf-toggle-icon');
                    
                    if (isExpanded) {
                        toggleText.textContent = t('wellness.dtf.showLess') || 'Show Less';
                        toggleIcon.textContent = '▲';
                        if (fade) fade.style.display = 'none';
                    } else {
                        toggleText.textContent = t('wellness.dtf.showAll') || 'Show All';
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
function showDTFInfo() {
    const modal = document.createElement('div');
    modal.className = 'dtf-info-modal';
    modal.innerHTML = `
        <div class="dtf-info-content">
            <button class="dtf-info-close">&times;</button>
            <h3 data-i18n="wellness.dtf.info.title">${t('wellness.dtf.info.title')}</h3>
            <div class="dtf-info-body">
                <p data-i18n="wellness.dtf.info.what">${t('wellness.dtf.info.what')}</p>
                <p data-i18n="wellness.dtf.info.how">${t('wellness.dtf.info.how')}</p>
                <h4 data-i18n="wellness.dtf.info.typesTitle">${t('wellness.dtf.info.typesTitle')}</h4>
                <ul>
                    <li><strong data-i18n="wellness.dtf.types.fatigue">${t('wellness.dtf.types.fatigue')}</strong>: ${t('wellness.dtf.info.fatigueDesc')}</li>
                    <li><strong data-i18n="wellness.dtf.types.recovery">${t('wellness.dtf.types.recovery')}</strong>: ${t('wellness.dtf.info.recoveryDesc')}</li>
                    <li><strong data-i18n="wellness.dtf.types.disruption">${t('wellness.dtf.types.disruption')}</strong>: ${t('wellness.dtf.info.disruptionDesc')}</li>
                </ul>
                <h4 data-i18n="wellness.dtf.info.intensityTitle">${t('wellness.dtf.info.intensityTitle')}</h4>
                <p data-i18n="wellness.dtf.info.intensityDesc">${t('wellness.dtf.info.intensityDesc')}</p>
                <h4 data-i18n="wellness.dtf.info.interpretTitle">${t('wellness.dtf.info.interpretTitle')}</h4>
                <p data-i18n="wellness.dtf.info.interpret">${t('wellness.dtf.info.interpret')}</p>
            </div>
        </div>
    `;

    modal.addEventListener('click', (e) => {
        if (e.target === modal || e.target.classList.contains('dtf-info-close')) {
            modal.remove();
        }
    });

    document.body.appendChild(modal);
}

/**
 * Actualiza el panel BPE con nuevos datos
 * @param {Object} wellnessData - Nuevos datos de wellness
 */
export function updateDTFPanel(wellnessData) {
    const panel = document.getElementById('dtf-panel');
    if (!panel) return;

    const resultsContainer = document.getElementById('dtf-results');
    const threshold = parseFloat(document.getElementById('dtf-threshold').value);
    const detectionWindow = parseInt(document.getElementById('dtf-window').value);

    const checkboxes = document.querySelectorAll('.dtf-var-checkbox:checked');
    const selectedVariables = Array.from(checkboxes).map(cb => cb.value);

    const config = {
        threshold,
        detectionWindow,
        selectedVariables,
        minVariables: Math.min(2, selectedVariables.length),
        optimizeThreshold: false,
        adaptiveWindow: 14
    };

    performDTFAnalysis(wellnessData, config, resultsContainer);
}
