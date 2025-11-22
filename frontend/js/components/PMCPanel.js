import { getAthleteProfile, getWellnessData, getActivityData } from '../apiService.js';
import { t } from '../i18n.js';

// ============ SOLID PRINCIPLES ============
// S - Single Responsibility: Cada clase/función tiene una única responsabilidad
// O - Open/Closed: Abierto para extensión, cerrado para modificación
// L - Liskov Substitution: Las subclases pueden sustituir a sus clases base
// I - Interface Segregation: Interfaces específicas mejor que una general
// D - Dependency Inversion: Depender de abstracciones, no de concreciones

/**
 * Data Service - Responsable de obtener y procesar datos (SRP)
 */
class PMCDataService {
    constructor(athleteId) {
        this.athleteId = athleteId;
        this.dateRange = this.calculateDateRange(90);
    }

    calculateDateRange(days) {
        const today = new Date();
        const startDate = new Date(today);
        startDate.setDate(today.getDate() - days);
        return {
            oldest: startDate.toISOString().split('T')[0],
            newest: today.toISOString().split('T')[0]
        };
    }

    async fetchAllData() {
        const [profile, wellness, activities] = await Promise.all([
            getAthleteProfile(this.athleteId),
            getWellnessData(this.athleteId, this.dateRange.oldest, this.dateRange.newest),
            getActivityData(this.athleteId, this.dateRange.oldest, this.dateRange.newest)
        ]);
        return { profile, wellness, activities };
    }
}

/**
 * Athlete Profile Processor - Procesa datos del perfil del atleta (SRP)
 */
class AthleteProfileProcessor {
    constructor(profile, wellness) {
        this.profile = profile;
        this.wellness = wellness;
    }

    getAge() {
        if (!this.profile.date_of_birth) return 'N/A';
        const birth = new Date(this.profile.date_of_birth);
        const today = new Date();
        let age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
            age--;
        }
        return age;
    }

    getWeight() {
        return this.profile.weight || null;
    }

    getFTP() {
        return this.profile.ftp || this.profile.icu_ftp || null;
    }

    getWPrime() {
        const wPrime = this.profile.w_prime || this.profile.icu_w_prime;
        return wPrime ? (wPrime / 1000).toFixed(1) : null;
    }

    getPMax() {
        return this.profile.pmax || this.profile.icu_pmax || null;
    }

    getVO2Max() {
        // Buscar el último valor de VO2Max en wellness
        for (let i = this.wellness.length - 1; i >= 0; i--) {
            if (this.wellness[i].vo2max) {
                return this.wellness[i].vo2max;
            }
        }
        return null;
    }

    getVO2MaxAbsolute() {
        const vo2max = this.getVO2Max();
        const weight = this.getWeight();
        if (vo2max && weight) {
            return (vo2max * weight / 1000).toFixed(2);
        }
        return null;
    }

    getName() {
        return this.profile.name || 'Atleta';
    }
}

/**
 * PMC Metrics Processor - Procesa métricas de PMC (SRP)
 */
class PMCMetricsProcessor {
    constructor(wellness) {
        this.wellness = wellness;
        this.latest = wellness[wellness.length - 1] || {};
    }

    getCTL() {
        return this.latest.ctl || 0;
    }

    getATL() {
        return this.latest.atl || 0;
    }

    getTSB() {
        if (this.latest.tsb !== undefined && this.latest.tsb !== null) {
            return this.latest.tsb;
        }
        return this.getCTL() - this.getATL();
    }

    getRamp() {
        return this.latest.rampRate || 0;
    }

    getTSBZone(tsb) {
        if (tsb < -30) return { name: t('pmc.zones.risk'), class: 'metric-risk' };
        if (tsb < -10) return { name: t('pmc.zones.optimal'), class: 'metric-optimal' };
        if (tsb < 5) return { name: t('pmc.zones.gray'), class: 'metric-gray' };
        if (tsb < 25) return { name: t('pmc.zones.fresh'), class: 'metric-fresh' };
        return { name: t('pmc.zones.transition'), class: 'metric-transition' };
    }

    getTSBColor(tsb) {
        if (tsb === null) return '#94a3b8';
        if (tsb < -30) return '#ef4444';
        if (tsb < -10) return '#10b981';
        if (tsb < 5) return '#94a3b8';
        if (tsb < 25) return '#3b82f6';
        return '#f59e0b';
    }
}

/**
 * Chart Renderer - Responsable de renderizar gráficos (SRP)
 */
class PMCChartRenderer {
    constructor(wellness, activities) {
        this.wellness = wellness;
        this.activities = activities;
        this.theme = document.documentElement.getAttribute('data-theme') || 'dark';
        this.charts = {}; // Almacenar instancias de gráficos
    }

    getThemeColors() {
        const isDark = this.theme === 'dark';
        return {
            text: isDark ? '#f1f5f9' : '#0f172a',
            grid: isDark ? 'rgba(148, 163, 184, 0.1)' : 'rgba(148, 163, 184, 0.3)',
            tooltipBg: isDark ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255, 255, 255, 0.95)',
            tooltipBorder: isDark ? 'rgba(148, 163, 184, 0.3)' : 'rgba(148, 163, 184, 0.5)'
        };
    }

    renderMainChart(canvasId) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const colors = this.getThemeColors();

        const dates = this.wellness.map(w => w.id);
        const ctlData = this.wellness.map(w => w.ctl || null);
        const atlData = this.wellness.map(w => w.atl || null);
        const loadData = dates.map(date => {
            const activity = this.activities.find(a => a.start_date_local && a.start_date_local.startsWith(date));
            return activity ? activity.icu_training_load || 0 : 0;
        });

        if (this.charts[canvasId]) {
            this.charts[canvasId].destroy();
        }

        this.charts[canvasId] = new Chart(ctx, {
            type: 'line',
            data: {
                labels: dates,
                datasets: [
                    {
                        label: t('pmc.fitness'),
                        data: ctlData,
                        borderColor: '#3b82f6',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        borderWidth: 2,
                        fill: false,
                        tension: 0.4,
                        yAxisID: 'y'
                    },
                    {
                        label: t('pmc.fatigue'),
                        data: atlData,
                        borderColor: '#a78bfa',
                        backgroundColor: 'rgba(167, 139, 250, 0.1)',
                        borderWidth: 2,
                        fill: false,
                        tension: 0.4,
                        yAxisID: 'y'
                    },
                    {
                        label: t('pmc.load'),
                        data: loadData,
                        type: 'bar',
                        backgroundColor: 'rgba(148, 163, 184, 0.4)',
                        borderColor: 'rgba(148, 163, 184, 0.6)',
                        borderWidth: 1,
                        yAxisID: 'y1'
                    }
                ]
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
                        labels: {
                            color: colors.text,
                            usePointStyle: true,
                            padding: 15,
                            font: { size: 12, weight: '600' }
                        }
                    },
                    tooltip: {
                        backgroundColor: colors.tooltipBg,
                        titleColor: colors.text,
                        bodyColor: colors.text,
                        borderColor: colors.tooltipBorder,
                        borderWidth: 1,
                        titleFont: { size: 13, weight: 'bold' },
                        bodyFont: { size: 12 }
                    }
                },
                scales: {
                    x: {
                        grid: { color: colors.grid },
                        ticks: {
                            color: colors.text,
                            maxRotation: 45,
                            minRotation: 45,
                            font: { size: 11, weight: '500' }
                        }
                    },
                    y: {
                        type: 'linear',
                        position: 'left',
                        title: {
                            display: true,
                            text: 'CTL / ATL',
                            color: colors.text,
                            font: { size: 13, weight: 'bold' }
                        },
                        grid: { color: colors.grid },
                        ticks: { 
                            color: colors.text,
                            font: { size: 11, weight: '500' }
                        }
                    },
                    y1: {
                        type: 'linear',
                        position: 'right',
                        title: {
                            display: true,
                            text: t('pmc.load'),
                            color: colors.text,
                            font: { size: 13, weight: 'bold' }
                        },
                        grid: { display: false },
                        ticks: { 
                            color: colors.text,
                            font: { size: 11, weight: '500' }
                        }
                    }
                }
            }
        });
    }

    renderTSBChart(canvasId) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const colors = this.getThemeColors();
        const metricsProcessor = new PMCMetricsProcessor(this.wellness);

        const dates = this.wellness.map(w => w.id);
        const tsbData = this.wellness.map(w => {
            if (w.tsb !== undefined && w.tsb !== null) return w.tsb;
            if (w.ctl !== undefined && w.atl !== undefined) return w.ctl - w.atl;
            return null;
        });

        if (this.charts[canvasId]) {
            this.charts[canvasId].destroy();
        }

        this.charts[canvasId] = new Chart(ctx, {
            type: 'line',
            data: {
                labels: dates,
                datasets: [{
                    label: t('pmc.form'),
                    data: tsbData,
                    borderColor: '#10b981',
                    backgroundColor: (context) => {
                        const value = context.parsed.y;
                        return this.getTSBColorWithAlpha(value);
                    },
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4,
                    segment: {
                        borderColor: (ctx) => {
                            const value = ctx.p1.parsed.y;
                            return metricsProcessor.getTSBColor(value);
                        }
                    }
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        labels: { 
                            color: colors.text,
                            font: { size: 12, weight: '600' }
                        }
                    },
                    tooltip: {
                        backgroundColor: colors.tooltipBg,
                        titleColor: colors.text,
                        bodyColor: colors.text,
                        borderColor: colors.tooltipBorder,
                        borderWidth: 1,
                        titleFont: { size: 13, weight: 'bold' },
                        bodyFont: { size: 12 },
                        callbacks: {
                            label: (context) => {
                                const value = context.parsed.y;
                                const zone = metricsProcessor.getTSBZone(value);
                                return `TSB: ${value.toFixed(1)} (${zone.name})`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: { color: colors.grid },
                        ticks: {
                            color: colors.text,
                            maxRotation: 45,
                            minRotation: 45,
                            font: { size: 11, weight: '500' }
                        }
                    },
                    y: {
                        grid: { color: colors.grid },
                        ticks: { 
                            color: colors.text,
                            font: { size: 11, weight: '500' }
                        },
                        title: {
                            display: true,
                            text: 'TSB',
                            color: colors.text,
                            font: { size: 13, weight: 'bold' }
                        }
                    }
                }
            }
        });
    }

    renderRampChart(canvasId) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const colors = this.getThemeColors();

        const dates = this.wellness.map(w => w.id);
        const rampData = this.wellness.map(w => w.rampRate || null);

        if (this.charts[canvasId]) {
            this.charts[canvasId].destroy();
        }

        this.charts[canvasId] = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: dates,
                datasets: [{
                    label: t('pmc.ramp'),
                    data: rampData,
                    backgroundColor: (context) => {
                        const value = context.parsed.y;
                        return value >= 0 ? 'rgba(16, 185, 129, 0.6)' : 'rgba(239, 68, 68, 0.6)';
                    },
                    borderColor: (context) => {
                        const value = context.parsed.y;
                        return value >= 0 ? '#10b981' : '#ef4444';
                    },
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        labels: { 
                            color: colors.text,
                            font: { size: 12, weight: '600' }
                        }
                    },
                    tooltip: {
                        backgroundColor: colors.tooltipBg,
                        titleColor: colors.text,
                        bodyColor: colors.text,
                        borderColor: colors.tooltipBorder,
                        borderWidth: 1,
                        titleFont: { size: 13, weight: 'bold' },
                        bodyFont: { size: 12 }
                    }
                },
                scales: {
                    x: {
                        grid: { color: colors.grid },
                        ticks: {
                            color: colors.text,
                            maxRotation: 45,
                            minRotation: 45,
                            font: { size: 11, weight: '500' }
                        }
                    },
                    y: {
                        grid: { color: colors.grid },
                        ticks: { 
                            color: colors.text,
                            font: { size: 11, weight: '500' }
                        },
                        title: {
                            display: true,
                            text: t('pmc.ramp'),
                            color: colors.text,
                            font: { size: 13, weight: 'bold' }
                        }
                    }
                }
            }
        });
    }

    getTSBColorWithAlpha(tsb) {
        if (tsb === null) return 'rgba(148, 163, 184, 0.2)';
        if (tsb < -30) return 'rgba(239, 68, 68, 0.2)';
        if (tsb < -10) return 'rgba(16, 185, 129, 0.2)';
        if (tsb < 5) return 'rgba(148, 163, 184, 0.2)';
        if (tsb < 25) return 'rgba(59, 130, 246, 0.2)';
        return 'rgba(245, 158, 11, 0.2)';
    }

    getChartInstance(canvasId) {
        return this.charts[canvasId];
    }
}

/**
 * UI Renderer - Responsable de renderizar la interfaz (SRP)
 */
class PMCUIRenderer {
    constructor(profileProcessor, metricsProcessor) {
        this.profileProcessor = profileProcessor;
        this.metricsProcessor = metricsProcessor;
    }

    renderSidebar() {
        const tsb = this.metricsProcessor.getTSB();
        const tsbZone = this.metricsProcessor.getTSBZone(tsb);

        return `
            <div class="pmc-sidebar">
                <!-- Perfil del atleta -->
                <div class="pmc-athlete-card">
                    <div class="athlete-avatar-circle">
                        <i data-lucide="user"></i>
                    </div>
                    <h3 class="athlete-name-sidebar">${this.profileProcessor.getName()}</h3>
                    <p class="athlete-info-sidebar">
                        ${this.profileProcessor.getAge()} ${t('pmc.years')} • ${this.profileProcessor.getWeight() ? this.profileProcessor.getWeight().toFixed(1) + ' kg' : 'N/A'}
                    </p>
                </div>

                <!-- Métricas del atleta -->
                <div class="pmc-athlete-metrics">
                    <div class="metric-item">
                        <div class="metric-item-label">FTP</div>
                        <div class="metric-item-value">${this.profileProcessor.getFTP() || 'N/A'}</div>
                        <div class="metric-item-unit">W</div>
                    </div>
                    <div class="metric-item">
                        <div class="metric-item-label">W' ${t('pmc.anaerobic')}</div>
                        <div class="metric-item-value">${this.profileProcessor.getWPrime() || 'N/A'}</div>
                        <div class="metric-item-unit">kJ</div>
                    </div>
                    <div class="metric-item">
                        <div class="metric-item-label">PMAX</div>
                        <div class="metric-item-value">${this.profileProcessor.getPMax() || 'N/A'}</div>
                        <div class="metric-item-unit">W</div>
                    </div>
                    <div class="metric-item">
                        <div class="metric-item-label">VO2 MAX</div>
                        <div class="metric-item-value">${this.profileProcessor.getVO2Max() ? this.profileProcessor.getVO2Max().toFixed(1) : 'N/A'}</div>
                        <div class="metric-item-unit">ml/kg/min</div>
                    </div>
                </div>

                <!-- Métricas PMC -->
                <div class="pmc-current-values">
                    <div class="current-value-item">
                        <div class="current-value-label">${t('pmc.fitness')}</div>
                        <div class="current-value-number">${this.metricsProcessor.getCTL().toFixed(0)}</div>
                    </div>
                    <div class="current-value-item">
                        <div class="current-value-label">${t('pmc.fatigue')}</div>
                        <div class="current-value-number">${this.metricsProcessor.getATL().toFixed(0)}</div>
                    </div>
                    <div class="current-value-item ${tsbZone.class}">
                        <div class="current-value-label">${t('pmc.form')}</div>
                        <div class="current-value-number">${tsb.toFixed(0)}</div>
                        <div class="current-value-zone">${tsbZone.name}</div>
                    </div>
                    <div class="current-value-item">
                        <div class="current-value-label">${t('pmc.ramp')}</div>
                        <div class="current-value-number">${this.metricsProcessor.getRamp().toFixed(1)}</div>
                    </div>
                </div>

                <!-- Leyenda de zonas -->
                <div class="pmc-zones-legend">
                    <div class="zone-legend-item zone-risk">
                        <span class="zone-legend-color"></span>
                        <span class="zone-legend-text">${t('pmc.zones.risk')} (&lt; -30)</span>
                    </div>
                    <div class="zone-legend-item zone-optimal">
                        <span class="zone-legend-color"></span>
                        <span class="zone-legend-text">${t('pmc.zones.optimal')} (-30 a -10)</span>
                    </div>
                    <div class="zone-legend-item zone-gray">
                        <span class="zone-legend-color"></span>
                        <span class="zone-legend-text">${t('pmc.zones.gray')} (-10 a +5)</span>
                    </div>
                    <div class="zone-legend-item zone-fresh">
                        <span class="zone-legend-color"></span>
                        <span class="zone-legend-text">${t('pmc.zones.fresh')} (+5 a +25)</span>
                    </div>
                    <div class="zone-legend-item zone-transition">
                        <span class="zone-legend-color"></span>
                        <span class="zone-legend-text">${t('pmc.zones.transition')} (&gt; +25)</span>
                    </div>
                </div>
            </div>
        `;
    }

    renderMainContent() {
        return `
            <div class="pmc-main-content">
                <!-- Gráfico principal -->
                <div class="pmc-chart-card">
                    <div class="pmc-chart-header">
                        <h3>${t('pmc.fitnessAndFatigue')}</h3>
                        <button class="chart-fullscreen-btn" data-chart="pmc-main" title="${t('wellness.chart.fullscreen')}">⛶</button>
                    </div>
                    <div class="pmc-chart-wrapper">
                        <canvas id="pmc-main-chart"></canvas>
                    </div>
                </div>

                <!-- Gráfico de Forma -->
                <div class="pmc-chart-card">
                    <div class="pmc-chart-header">
                        <h3>${t('pmc.formChart')}</h3>
                        <button class="chart-fullscreen-btn" data-chart="pmc-tsb" title="${t('wellness.chart.fullscreen')}">⛶</button>
                    </div>
                    <div class="pmc-chart-wrapper">
                        <canvas id="pmc-tsb-chart"></canvas>
                    </div>
                </div>

                <!-- Gráfico de Rampa -->
                <div class="pmc-chart-card">
                    <div class="pmc-chart-header">
                        <h3>${t('pmc.rampChart')}</h3>
                        <button class="chart-fullscreen-btn" data-chart="pmc-ramp" title="${t('wellness.chart.fullscreen')}">⛶</button>
                    </div>
                    <div class="pmc-chart-wrapper">
                        <canvas id="pmc-ramp-chart"></canvas>
                    </div>
                </div>
            </div>
        `;
    }
}

/**
 * Fullscreen Manager - Gestiona la funcionalidad de pantalla completa (SRP)
 */
class FullscreenManager {
    constructor(chartRenderer) {
        this.chartRenderer = chartRenderer;
        this.modal = null;
    }

    setupEventListeners() {
        const fullscreenBtns = document.querySelectorAll('.chart-fullscreen-btn');
        fullscreenBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const chartType = btn.dataset.chart;
                this.showFullscreen(chartType);
            });
        });
    }

    showFullscreen(chartType) {
        const chartMap = {
            'pmc-main': 'pmc-main-chart',
            'pmc-tsb': 'pmc-tsb-chart',
            'pmc-ramp': 'pmc-ramp-chart'
        };

        const canvasId = chartMap[chartType];
        const originalChart = this.chartRenderer.getChartInstance(canvasId);
        
        if (!originalChart) return;

        // Crear modal
        this.modal = document.createElement('div');
        this.modal.className = 'chart-fullscreen-modal';
        this.modal.innerHTML = `
            <div class="fullscreen-modal-content">
                <button class="fullscreen-close-btn" title="${t('common.close')}">&times;</button>
                <canvas id="fullscreen-chart"></canvas>
            </div>
        `;

        document.body.appendChild(this.modal);

        // Clonar configuración del gráfico
        const fullscreenCanvas = document.getElementById('fullscreen-chart');
        const fullscreenChart = new Chart(fullscreenCanvas, {
            type: originalChart.config.type,
            data: JSON.parse(JSON.stringify(originalChart.config.data)),
            options: JSON.parse(JSON.stringify(originalChart.config.options))
        });

        // Event listeners
        const closeBtn = this.modal.querySelector('.fullscreen-close-btn');
        closeBtn.addEventListener('click', () => this.closeFullscreen(fullscreenChart));
        
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.closeFullscreen(fullscreenChart);
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeFullscreen(fullscreenChart);
            }
        });
    }

    closeFullscreen(chart) {
        if (chart) {
            chart.destroy();
        }
        if (this.modal) {
            this.modal.remove();
            this.modal = null;
        }
    }
}

/**
 * Main Controller - Orquesta todos los componentes (Dependency Inversion)
 */
export async function renderPMCPanel(container, athleteId) {
    container.innerHTML = `<h3 data-i18n="pmc.loading">${t('pmc.loading')}</h3>`;

    try {
        // Obtener datos
        const dataService = new PMCDataService(athleteId);
        const { profile, wellness, activities } = await dataService.fetchAllData();

        // Procesar datos
        const profileProcessor = new AthleteProfileProcessor(profile, wellness);
        const metricsProcessor = new PMCMetricsProcessor(wellness);
        const chartRenderer = new PMCChartRenderer(wellness, activities);
        const uiRenderer = new PMCUIRenderer(profileProcessor, metricsProcessor);

        // Renderizar UI
        container.innerHTML = `
            <div class="pmc-panel-layout">
                ${uiRenderer.renderSidebar()}
                ${uiRenderer.renderMainContent()}
            </div>
        `;

        // Renderizar gráficos
        setTimeout(() => {
            chartRenderer.renderMainChart('pmc-main-chart');
            chartRenderer.renderTSBChart('pmc-tsb-chart');
            chartRenderer.renderRampChart('pmc-ramp-chart');

            // Configurar pantalla completa
            const fullscreenManager = new FullscreenManager(chartRenderer);
            fullscreenManager.setupEventListeners();

            // Inicializar iconos de Lucide
            if (window.lucide) {
                window.lucide.createIcons();
            }
        }, 100);

    } catch (error) {
        console.error('Error loading PMC data:', error);
        container.innerHTML = `
            <div class="pmc-panel-layout">
                <div class="error-message">
                    <h3 data-i18n="pmc.error">${t('pmc.error')}</h3>
                    <p>${error.message}</p>
                </div>
            </div>
        `;
    }
}
