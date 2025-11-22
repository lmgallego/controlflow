import { getAthleteProfile, getWellnessData, getActivityData } from '../apiService.js';
import { t } from '../i18n.js';

/**
 * PMC Panel - Corregido según ejemplo de Intervals.icu
 */

let pmcCharts = { main: null, form: null, ramp: null };

export async function renderPMCPanel(container, athleteId) {
    container.innerHTML = `
        <div class="pmc-panel-new">
            <div class="pmc-controls">
                <div class="pmc-date-controls">
                    <label>${t('pmc.from') || 'Desde'}:</label>
                    <input type="date" id="pmc-start-date" class="pmc-date-input">
                    <label>${t('pmc.to') || 'Hasta'}:</label>
                    <input type="date" id="pmc-end-date" class="pmc-date-input">
                    <button id="pmc-refresh-btn" class="pmc-refresh-btn">
                        <i data-lucide="refresh-cw"></i>
                    </button>
                </div>
            </div>
            
            <div class="pmc-content-grid">
                <!-- Sidebar -->
                <div class="pmc-sidebar-new">
                    <div class="pmc-kpis">
                        <div class="pmc-kpi-card">
                            <span class="pmc-kpi-label">${t('pmc.fitness')}</span>
                            <span class="pmc-kpi-value" id="pmc-kpi-ctl">-</span>
                        </div>
                        <div class="pmc-kpi-card">
                            <span class="pmc-kpi-label">${t('pmc.fatigue')}</span>
                            <span class="pmc-kpi-value" id="pmc-kpi-atl">-</span>
                        </div>
                        <div class="pmc-kpi-card pmc-kpi-tsb" id="pmc-kpi-tsb-card">
                            <span class="pmc-kpi-label">${t('pmc.form')}</span>
                            <span class="pmc-kpi-value" id="pmc-kpi-tsb">-</span>
                            <span class="pmc-kpi-zone" id="pmc-kpi-zone">-</span>
                        </div>
                    </div>
                </div>
                
                <!-- Charts -->
                <div class="pmc-charts-area">
                    <div id="pmc-loader" class="pmc-loader" style="display: none;">
                        <div class="spinner"></div>
                        <p>${t('pmc.loading')}</p>
                    </div>
                    
                    <div class="pmc-chart-card-new">
                        <div class="pmc-chart-header-new">
                            <h4>${t('pmc.fitnessAndFatigue')}</h4>
                            <button class="pmc-fullscreen-btn" data-chart="main">⛶</button>
                        </div>
                        <div class="pmc-chart-wrapper-new pmc-chart-main">
                            <canvas id="pmc-chart-main"></canvas>
                        </div>
                    </div>
                    
                    <div class="pmc-chart-card-new">
                        <div class="pmc-chart-header-new">
                            <h4>${t('pmc.formChart')}</h4>
                            <button class="pmc-fullscreen-btn" data-chart="form">⛶</button>
                        </div>
                        <div class="pmc-chart-wrapper-new pmc-chart-strip">
                            <canvas id="pmc-chart-form"></canvas>
                        </div>
                    </div>
                    
                    <div class="pmc-chart-card-new">
                        <div class="pmc-chart-header-new">
                            <h4>${t('pmc.rampChart')}</h4>
                            <button class="pmc-fullscreen-btn" data-chart="ramp">⛶</button>
                        </div>
                        <div class="pmc-chart-wrapper-new pmc-chart-strip">
                            <canvas id="pmc-chart-ramp"></canvas>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Inicializar fechas (últimos 6 meses por defecto)
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(endDate.getMonth() - 6);
    
    document.getElementById('pmc-end-date').valueAsDate = endDate;
    document.getElementById('pmc-start-date').valueAsDate = startDate;

    // Cargar datos iniciales
    await loadPMCData(athleteId);

    // Event listener para refresh
    document.getElementById('pmc-refresh-btn').addEventListener('click', () => {
        loadPMCData(athleteId);
    });

    // Event listeners para fullscreen
    document.querySelectorAll('.pmc-fullscreen-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            showFullscreenChart(btn.dataset.chart);
        });
    });

    // Inicializar iconos
    if (window.lucide) {
        window.lucide.createIcons();
    }
}

async function loadPMCData(athleteId) {
    const loader = document.getElementById('pmc-loader');
    loader.style.display = 'flex';

    try {
        const startDate = document.getElementById('pmc-start-date').value;
        const endDate = document.getElementById('pmc-end-date').value;

        // Fetch en paralelo
        const [profile, wellness, activities] = await Promise.all([
            getAthleteProfile(athleteId),
            getWellnessData(athleteId, startDate, endDate),
            getActivityData(athleteId, startDate, endDate)
        ]);

        // Actualizar métricas del header
        updateHeaderMetrics(profile, wellness);

        // Procesar y renderizar PMC
        const pmcData = processPMCData(wellness, activities, startDate, endDate);
        updateKPIs(pmcData[pmcData.length - 1]);
        renderCharts(pmcData);

    } catch (error) {
        console.error('Error loading PMC data:', error);
        alert(t('pmc.error') + ': ' + error.message);
    } finally {
        loader.style.display = 'none';
    }
}

function updateHeaderMetrics(profile, wellnessHistory) {
    const headerMetrics = document.getElementById('athlete-metrics-header');
    if (!headerMetrics) return;

    // Mostrar el header de métricas
    headerMetrics.style.display = 'flex';

    // FTP - buscar en sportSettings o usar icu_ftp
    let ftp = profile.icu_ftp || profile.ftp;
    if (profile.sportSettings) {
        const ride = profile.sportSettings.find(s => s.types && s.types.includes('Ride'));
        if (ride && ride.ftp) ftp = ride.ftp;
    }
    document.getElementById('header-ftp').textContent = ftp || 'N/A';

    // W' - buscar en sportSettings o usar icu_w_prime
    let wPrime = profile.icu_w_prime || profile.w_prime;
    if (profile.sportSettings) {
        const ride = profile.sportSettings.find(s => s.types && s.types.includes('Ride'));
        if (ride && ride.w_prime) wPrime = ride.w_prime;
    }
    document.getElementById('header-wprime').textContent = wPrime ? Math.round(wPrime / 1000) : 'N/A';

    // PMAX - buscar en sportSettings o usar icu_pmax
    let pMax = profile.icu_pmax || profile.pmax;
    if (profile.sportSettings) {
        const ride = profile.sportSettings.find(s => s.types && s.types.includes('Ride'));
        if (ride && ride.p_max) pMax = ride.p_max;
    }
    document.getElementById('header-pmax').textContent = pMax || 'N/A';

    // VO2MAX - buscar el último valor en wellness
    let vo2max = null;
    if (wellnessHistory && wellnessHistory.length > 0) {
        for (let i = wellnessHistory.length - 1; i >= 0; i--) {
            if (wellnessHistory[i].vo2max) {
                vo2max = wellnessHistory[i].vo2max;
                break;
            }
        }
    }
    
    if (vo2max) {
        const weight = profile.weight || profile.icu_weight || 70;
        const vo2maxAbsolute = (vo2max * weight / 1000).toFixed(2);
        document.getElementById('header-vo2max').textContent = `${vo2max.toFixed(1)} (${vo2maxAbsolute} L/min)`;
    } else {
        document.getElementById('header-vo2max').textContent = 'N/A';
    }
}

function processPMCData(wellness, activities, startStr, endStr) {
    const map = new Map();
    let curr = new Date(startStr);
    const last = new Date(endStr);

    // Crear mapa de fechas
    while (curr <= last) {
        const iso = curr.toISOString().split('T')[0];
        map.set(iso, { date: iso, ctl: null, atl: null, ramp: null, load: 0 });
        curr.setDate(curr.getDate() + 1);
    }

    // Llenar con datos de wellness
    wellness.forEach(w => {
        if (map.has(w.id)) {
            const d = map.get(w.id);
            d.ctl = w.ctl || 0;
            d.atl = w.atl || 0;
            d.ramp = w.rampRate || 0;
        }
    });

    // Llenar con carga de actividades
    activities.forEach(a => {
        const dStr = a.start_date_local ? a.start_date_local.split('T')[0] : null;
        if (dStr && map.has(dStr)) {
            map.get(dStr).load += (a.icu_training_load || 0);
        }
    });

    // Convertir a array y ordenar
    const data = Array.from(map.values()).sort((a, b) => a.date.localeCompare(b.date));

    // Interpolar valores nulos
    let prevCtl = 0, prevAtl = 0, prevRamp = 0;
    data.forEach(d => {
        if (d.ctl === null) d.ctl = prevCtl; else prevCtl = d.ctl;
        if (d.atl === null) d.atl = prevAtl; else prevAtl = d.atl;
        if (d.ramp === null) d.ramp = prevRamp; else prevRamp = d.ramp;
        d.tsb = d.ctl - d.atl;
    });

    return data;
}

function updateKPIs(lastData) {
    if (!lastData) return;

    document.getElementById('pmc-kpi-ctl').textContent = Math.round(lastData.ctl);
    document.getElementById('pmc-kpi-atl').textContent = Math.round(lastData.atl);
    document.getElementById('pmc-kpi-tsb').textContent = Math.round(lastData.tsb);

    const card = document.getElementById('pmc-kpi-tsb-card');
    const zoneText = document.getElementById('pmc-kpi-zone');
    const tsb = lastData.tsb;

    card.className = 'pmc-kpi-card pmc-kpi-tsb';

    if (tsb > 25) {
        card.classList.add('zone-transition');
        zoneText.textContent = t('pmc.zones.transition');
    } else if (tsb > 5) {
        card.classList.add('zone-fresh');
        zoneText.textContent = t('pmc.zones.fresh');
    } else if (tsb >= -10) {
        card.classList.add('zone-gray');
        zoneText.textContent = t('pmc.zones.gray');
    } else if (tsb >= -30) {
        card.classList.add('zone-optimal');
        zoneText.textContent = t('pmc.zones.optimal');
    } else {
        card.classList.add('zone-risk');
        zoneText.textContent = t('pmc.zones.risk');
    }
}

function renderCharts(data) {
    const labels = data.map(d => d.date);
    const theme = document.documentElement.getAttribute('data-theme') || 'dark';
    const isDark = theme === 'dark';
    
    const textColor = isDark ? '#f1f5f9' : '#1e293b';
    const gridColor = isDark ? 'rgba(148, 163, 184, 0.1)' : 'rgba(71, 85, 105, 0.15)';

    const commonOptions = {
        responsive: true,
        maintainAspectRatio: false,
        animation: false,
        interaction: { mode: 'index', intersect: false, axis: 'x' },
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: isDark ? 'rgba(15,23,42,0.95)' : 'rgba(255,255,255,0.98)',
                titleColor: textColor,
                bodyColor: textColor,
                borderColor: isDark ? 'rgba(148, 163, 184, 0.3)' : 'rgba(71, 85, 105, 0.3)',
                borderWidth: 1,
                titleFont: { size: 11, weight: 'bold' },
                bodyFont: { size: 11 },
                padding: 10,
                cornerRadius: 4,
                displayColors: true
            }
        },
        scales: { x: { display: false } }
    };

    // Chart 1: Main (CTL/ATL + Load)
    if (pmcCharts.main) pmcCharts.main.destroy();
    pmcCharts.main = new Chart(document.getElementById('pmc-chart-main'), {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: t('pmc.fitness'),
                    data: data.map(d => d.ctl),
                    borderColor: '#6366f1',
                    backgroundColor: '#6366f1',
                    borderWidth: 2.5,
                    pointRadius: 0,
                    yAxisID: 'y1',
                    tension: 0.3,
                    order: 1
                },
                {
                    label: t('pmc.fatigue'),
                    data: data.map(d => d.atl),
                    borderColor: '#a78bfa',
                    backgroundColor: '#a78bfa',
                    borderWidth: 2,
                    pointRadius: 0,
                    yAxisID: 'y1',
                    tension: 0.3,
                    order: 2
                },
                {
                    type: 'bar',
                    label: t('pmc.load'),
                    data: data.map(d => d.load),
                    backgroundColor: 'rgba(148, 163, 184, 0.4)',
                    borderRadius: 2,
                    yAxisID: 'y2',
                    order: 3
                }
            ]
        },
        options: {
            ...commonOptions,
            plugins: {
                ...commonOptions.plugins,
                legend: {
                    display: true,
                    position: 'top',
                    align: 'end',
                    labels: {
                        boxWidth: 8,
                        usePointStyle: true,
                        color: textColor,
                        font: { size: 11, weight: '600' }
                    }
                }
            },
            scales: {
                x: {
                    display: true,
                    grid: { display: false, color: gridColor },
                    ticks: { maxTicksLimit: 10, color: textColor, font: { size: 10 } }
                },
                y1: {
                    position: 'right',
                    grid: { borderDash: [4, 4], color: gridColor },
                    title: { display: true, text: 'CTL / ATL', color: textColor, font: { size: 11, weight: 'bold' } },
                    ticks: { color: textColor, font: { size: 10 } }
                },
                y2: {
                    position: 'left',
                    display: true,
                    grid: { display: false },
                    title: { display: true, text: t('pmc.load'), color: textColor, font: { size: 11, weight: 'bold' } },
                    suggestedMax: 200,
                    ticks: { color: textColor, font: { size: 10 } }
                }
            }
        }
    });

    // Chart 2: Form (TSB)
    if (pmcCharts.form) pmcCharts.form.destroy();
    pmcCharts.form = new Chart(document.getElementById('pmc-chart-form'), {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: t('pmc.form'),
                data: data.map(d => d.tsb),
                borderWidth: 2,
                pointRadius: 0,
                fill: true,
                tension: 0.3,
                segment: {
                    borderColor: ctx => getColorForTSB(ctx.p1.parsed.y),
                    backgroundColor: ctx => getFillForTSB(ctx.p1.parsed.y)
                }
            }]
        },
        options: {
            ...commonOptions,
            scales: {
                x: { display: false },
                y: {
                    position: 'right',
                    grid: { color: gridColor },
                    ticks: { stepSize: 10, color: textColor, font: { size: 10 } }
                }
            }
        }
    });

    // Chart 3: Ramp
    if (pmcCharts.ramp) pmcCharts.ramp.destroy();
    pmcCharts.ramp = new Chart(document.getElementById('pmc-chart-ramp'), {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: t('pmc.ramp'),
                data: data.map(d => d.ramp),
                backgroundColor: data.map(d => d.ramp > 2 ? '#ef4444' : '#10b981'),
                borderRadius: 1
            }]
        },
        options: {
            ...commonOptions,
            scales: {
                x: {
                    display: true,
                    ticks: { maxTicksLimit: 10, color: textColor, font: { size: 10 } },
                    grid: { display: false }
                },
                y: {
                    position: 'right',
                    grid: { display: false },
                    ticks: { color: textColor, font: { size: 10 } }
                }
            }
        }
    });
}

function getColorForTSB(v) {
    if (v > 25) return '#eab308';
    if (v > 5) return '#0ea5e9';
    if (v >= -10) return '#94a3b8';
    if (v >= -30) return '#22c55e';
    return '#ef4444';
}

function getFillForTSB(v) {
    const hex = getColorForTSB(v).replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, 0.15)`;
}

function showFullscreenChart(chartType) {
    const chartMap = {
        'main': pmcCharts.main,
        'form': pmcCharts.form,
        'ramp': pmcCharts.ramp
    };

    const chart = chartMap[chartType];
    if (!chart) return;

    const modal = document.createElement('div');
    modal.className = 'pmc-fullscreen-modal';
    modal.innerHTML = `
        <div class="pmc-fullscreen-content">
            <button class="pmc-fullscreen-close">&times;</button>
            <canvas id="pmc-fullscreen-canvas"></canvas>
        </div>
    `;

    document.body.appendChild(modal);

    const fullscreenCanvas = document.getElementById('pmc-fullscreen-canvas');
    const fullscreenChart = new Chart(fullscreenCanvas, {
        type: chart.config.type,
        data: JSON.parse(JSON.stringify(chart.config.data)),
        options: JSON.parse(JSON.stringify(chart.config.options))
    });

    const closeBtn = modal.querySelector('.pmc-fullscreen-close');
    closeBtn.addEventListener('click', () => {
        fullscreenChart.destroy();
        modal.remove();
    });

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            fullscreenChart.destroy();
            modal.remove();
        }
    });

    document.addEventListener('keydown', function escHandler(e) {
        if (e.key === 'Escape') {
            fullscreenChart.destroy();
            modal.remove();
            document.removeEventListener('keydown', escHandler);
        }
    });
}
