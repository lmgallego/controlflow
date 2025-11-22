import { getAthleteProfile, getWellnessData, getActivityData } from '../apiService.js';
import { t } from '../i18n.js';

/**
 * Renderiza el panel de Performance Management Chart (PMC)
 * Incluye gráficos de CTL, ATL, TSB (Forma) y Rampa
 */
export async function renderPMCPanel(container, athleteId) {
    container.innerHTML = `<h3 data-i18n="pmc.loading">${t('pmc.loading') || 'Cargando análisis...'}</h3>`;

    try {
        // Calcular rango de fechas (últimos 90 días por defecto)
        const today = new Date();
        const startDate = new Date(today);
        startDate.setDate(today.getDate() - 90);
        
        const oldest = startDate.toISOString().split('T')[0];
        const newest = today.toISOString().split('T')[0];

        // Llamadas en paralelo para obtener todos los datos
        const [profileData, wellnessData, activitiesData] = await Promise.all([
            getAthleteProfile(athleteId),
            getWellnessData(athleteId, oldest, newest),
            getActivityData(athleteId, oldest, newest)
        ]);

        // Renderizar el panel con los datos
        renderPMCContent(container, profileData, wellnessData, activitiesData);

    } catch (error) {
        console.error('Error loading PMC data:', error);
        container.innerHTML = `
            <div class="pmc-panel">
                <div class="error-message">
                    <h3 data-i18n="pmc.error">${t('pmc.error') || 'Error al cargar análisis'}</h3>
                    <p>${error.message}</p>
                </div>
            </div>
        `;
    }
}

/**
 * Renderiza el contenido del panel PMC
 */
function renderPMCContent(container, profile, wellness, activities) {
    // Calcular edad
    const age = calculateAge(profile.icu_date_of_birth);
    
    // Obtener último VO2Max disponible
    const latestVO2Max = getLatestVO2Max(wellness);
    const vo2MaxAbsolute = latestVO2Max && profile.weight 
        ? (latestVO2Max * profile.weight / 1000).toFixed(2) 
        : null;

    // Obtener valores actuales de CTL, ATL, TSB
    const latestWellness = wellness[wellness.length - 1] || {};
    const currentCTL = latestWellness.ctl || 0;
    const currentATL = latestWellness.atl || 0;
    const currentTSB = latestWellness.tsb || (currentCTL - currentATL);
    const currentRamp = latestWellness.rampRate || 0;

    container.innerHTML = `
        <div class="pmc-panel">
            <!-- Header con información del atleta -->
            <div class="pmc-header">
                <div class="athlete-profile-card">
                    <div class="athlete-avatar-large">
                        <i data-lucide="user"></i>
                    </div>
                    <div class="athlete-details">
                        <h2 class="athlete-name-large">${profile.name || 'Atleta'}</h2>
                        <div class="athlete-meta">
                            <span>${age} ${t('pmc.years') || 'años'}</span>
                            <span>•</span>
                            <span>${profile.weight ? profile.weight.toFixed(1) + ' kg' : 'N/A'}</span>
                        </div>
                    </div>
                </div>

                <div class="athlete-stats-grid">
                    <div class="stat-card">
                        <div class="stat-label">FTP</div>
                        <div class="stat-value">${profile.icu_ftp || 'N/A'}</div>
                        <div class="stat-unit">W</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-label">W' ${t('pmc.anaerobic') || '(Anaeróbico)'}</div>
                        <div class="stat-value">${profile.icu_w_prime ? (profile.icu_w_prime / 1000).toFixed(1) : 'N/A'}</div>
                        <div class="stat-unit">kJ</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-label">PMAX</div>
                        <div class="stat-value">${profile.icu_pmax || 'N/A'}</div>
                        <div class="stat-unit">W</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-label">VO2 MAX</div>
                        <div class="stat-value">${latestVO2Max ? latestVO2Max.toFixed(1) : 'N/A'}</div>
                        <div class="stat-unit">ml/kg/min</div>
                        ${vo2MaxAbsolute ? `<div class="stat-secondary">${vo2MaxAbsolute} L/min</div>` : ''}
                    </div>
                </div>
            </div>

            <!-- Métricas actuales -->
            <div class="pmc-current-metrics">
                <div class="metric-card">
                    <div class="metric-label" data-i18n="pmc.fitness">Fitness (CTL)</div>
                    <div class="metric-value">${currentCTL.toFixed(0)}</div>
                </div>
                <div class="metric-card">
                    <div class="metric-label" data-i18n="pmc.fatigue">Fatiga (ATL)</div>
                    <div class="metric-value">${currentATL.toFixed(0)}</div>
                </div>
                <div class="metric-card ${getTSBClass(currentTSB)}">
                    <div class="metric-label" data-i18n="pmc.form">Forma (TSB)</div>
                    <div class="metric-value">${currentTSB.toFixed(0)}</div>
                    <div class="metric-zone">${getTSBZone(currentTSB)}</div>
                </div>
                <div class="metric-card">
                    <div class="metric-label" data-i18n="pmc.ramp">Rampa</div>
                    <div class="metric-value">${currentRamp.toFixed(1)}</div>
                </div>
            </div>

            <!-- Leyenda de zonas de forma -->
            <div class="tsb-zones-legend">
                <h4 data-i18n="pmc.formZones">${t('pmc.formZones') || 'Zonas de Forma (TSB)'}</h4>
                <div class="zones-grid">
                    <div class="zone-item zone-risk">
                        <span class="zone-color"></span>
                        <span class="zone-text" data-i18n="pmc.zones.risk">${t('pmc.zones.risk') || 'Alto Riesgo'} (&lt; -30)</span>
                    </div>
                    <div class="zone-item zone-optimal">
                        <span class="zone-color"></span>
                        <span class="zone-text" data-i18n="pmc.zones.optimal">${t('pmc.zones.optimal') || 'Óptimo'} (-30 a -10)</span>
                    </div>
                    <div class="zone-item zone-gray">
                        <span class="zone-color"></span>
                        <span class="zone-text" data-i18n="pmc.zones.gray">${t('pmc.zones.gray') || 'Gris'} (-10 a +5)</span>
                    </div>
                    <div class="zone-item zone-fresh">
                        <span class="zone-color"></span>
                        <span class="zone-text" data-i18n="pmc.zones.fresh">${t('pmc.zones.fresh') || 'Frescura'} (+5 a +25)</span>
                    </div>
                    <div class="zone-item zone-transition">
                        <span class="zone-color"></span>
                        <span class="zone-text" data-i18n="pmc.zones.transition">${t('pmc.zones.transition') || 'Transición'} (&gt; +25)</span>
                    </div>
                </div>
            </div>

            <!-- Gráfico principal: CTL/ATL con barras de carga -->
            <div class="pmc-chart-container">
                <h3 data-i18n="pmc.fitnessAndFatigue">${t('pmc.fitnessAndFatigue') || 'Fitness y Fatiga'}</h3>
                <canvas id="pmc-main-chart"></canvas>
            </div>

            <!-- Gráfico de Forma (TSB) -->
            <div class="pmc-chart-container">
                <h3 data-i18n="pmc.formChart">${t('pmc.formChart') || 'Forma (TSB)'}</h3>
                <canvas id="pmc-tsb-chart"></canvas>
            </div>

            <!-- Gráfico de Rampa -->
            <div class="pmc-chart-container">
                <h3 data-i18n="pmc.rampChart">${t('pmc.rampChart') || 'Rampa'}</h3>
                <canvas id="pmc-ramp-chart"></canvas>
            </div>
        </div>
    `;

    // Renderizar los gráficos después de insertar el HTML
    setTimeout(() => {
        renderPMCCharts(wellness, activities);
        // Inicializar iconos de Lucide
        if (window.lucide) {
            window.lucide.createIcons();
        }
    }, 100);
}

/**
 * Renderiza los gráficos de PMC
 */
function renderPMCCharts(wellness, activities) {
    renderMainChart(wellness, activities);
    renderTSBChart(wellness);
    renderRampChart(wellness);
}

/**
 * Renderiza el gráfico principal con CTL, ATL y barras de carga
 */
function renderMainChart(wellness, activities) {
    const canvas = document.getElementById('pmc-main-chart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const theme = document.documentElement.getAttribute('data-theme') || 'dark';
    const textColor = theme === 'light' ? '#0f172a' : '#f1f5f9';
    const gridColor = theme === 'light' ? 'rgba(148, 163, 184, 0.2)' : 'rgba(148, 163, 184, 0.1)';

    // Preparar datos
    const dates = wellness.map(w => w.id);
    const ctlData = wellness.map(w => w.ctl || null);
    const atlData = wellness.map(w => w.atl || null);

    // Preparar barras de carga (icu_training_load de actividades)
    const loadData = dates.map(date => {
        const activity = activities.find(a => a.start_date_local && a.start_date_local.startsWith(date));
        return activity ? activity.icu_training_load || 0 : 0;
    });

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: dates,
            datasets: [
                {
                    label: t('pmc.fitness') || 'Fitness (CTL)',
                    data: ctlData,
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    borderWidth: 2,
                    fill: false,
                    tension: 0.4,
                    yAxisID: 'y'
                },
                {
                    label: t('pmc.fatigue') || 'Fatiga (ATL)',
                    data: atlData,
                    borderColor: '#a78bfa',
                    backgroundColor: 'rgba(167, 139, 250, 0.1)',
                    borderWidth: 2,
                    fill: false,
                    tension: 0.4,
                    yAxisID: 'y'
                },
                {
                    label: t('pmc.load') || 'Carga',
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
                        color: textColor,
                        usePointStyle: true,
                        padding: 15
                    }
                },
                tooltip: {
                    backgroundColor: theme === 'light' ? 'rgba(255, 255, 255, 0.95)' : 'rgba(15, 23, 42, 0.95)',
                    titleColor: textColor,
                    bodyColor: textColor,
                    borderColor: gridColor,
                    borderWidth: 1
                }
            },
            scales: {
                x: {
                    grid: { color: gridColor },
                    ticks: {
                        color: textColor,
                        maxRotation: 45,
                        minRotation: 45,
                        font: { size: 10 }
                    }
                },
                y: {
                    type: 'linear',
                    position: 'left',
                    title: {
                        display: true,
                        text: 'CTL / ATL',
                        color: textColor
                    },
                    grid: { color: gridColor },
                    ticks: { color: textColor }
                },
                y1: {
                    type: 'linear',
                    position: 'right',
                    title: {
                        display: true,
                        text: t('pmc.load') || 'Carga',
                        color: textColor
                    },
                    grid: { display: false },
                    ticks: { color: textColor }
                }
            }
        }
    });
}

/**
 * Renderiza el gráfico de Forma (TSB) con zonas de color
 */
function renderTSBChart(wellness) {
    const canvas = document.getElementById('pmc-tsb-chart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const theme = document.documentElement.getAttribute('data-theme') || 'dark';
    const textColor = theme === 'light' ? '#0f172a' : '#f1f5f9';
    const gridColor = theme === 'light' ? 'rgba(148, 163, 184, 0.2)' : 'rgba(148, 163, 184, 0.1)';

    const dates = wellness.map(w => w.id);
    const tsbData = wellness.map(w => {
        if (w.tsb !== undefined && w.tsb !== null) return w.tsb;
        if (w.ctl !== undefined && w.atl !== undefined) return w.ctl - w.atl;
        return null;
    });

    // Crear datasets con colores según la zona
    const coloredData = tsbData.map(tsb => ({
        value: tsb,
        color: getTSBColor(tsb)
    }));

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: dates,
            datasets: [{
                label: t('pmc.form') || 'Forma (TSB)',
                data: tsbData,
                borderColor: '#10b981',
                backgroundColor: (context) => {
                    const value = context.parsed.y;
                    return getTSBColorWithAlpha(value);
                },
                borderWidth: 2,
                fill: true,
                tension: 0.4,
                segment: {
                    borderColor: (ctx) => {
                        const value = ctx.p1.parsed.y;
                        return getTSBColor(value);
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
                    labels: { color: textColor }
                },
                tooltip: {
                    backgroundColor: theme === 'light' ? 'rgba(255, 255, 255, 0.95)' : 'rgba(15, 23, 42, 0.95)',
                    titleColor: textColor,
                    bodyColor: textColor,
                    borderColor: gridColor,
                    borderWidth: 1,
                    callbacks: {
                        label: (context) => {
                            const value = context.parsed.y;
                            const zone = getTSBZone(value);
                            return `TSB: ${value.toFixed(1)} (${zone})`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: { color: gridColor },
                    ticks: {
                        color: textColor,
                        maxRotation: 45,
                        minRotation: 45,
                        font: { size: 10 }
                    }
                },
                y: {
                    grid: { color: gridColor },
                    ticks: { color: textColor },
                    title: {
                        display: true,
                        text: 'TSB',
                        color: textColor
                    }
                }
            }
        }
    });
}

/**
 * Renderiza el gráfico de Rampa
 */
function renderRampChart(wellness) {
    const canvas = document.getElementById('pmc-ramp-chart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const theme = document.documentElement.getAttribute('data-theme') || 'dark';
    const textColor = theme === 'light' ? '#0f172a' : '#f1f5f9';
    const gridColor = theme === 'light' ? 'rgba(148, 163, 184, 0.2)' : 'rgba(148, 163, 184, 0.1)';

    const dates = wellness.map(w => w.id);
    const rampData = wellness.map(w => w.rampRate || null);

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: dates,
            datasets: [{
                label: t('pmc.ramp') || 'Rampa',
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
                    labels: { color: textColor }
                },
                tooltip: {
                    backgroundColor: theme === 'light' ? 'rgba(255, 255, 255, 0.95)' : 'rgba(15, 23, 42, 0.95)',
                    titleColor: textColor,
                    bodyColor: textColor,
                    borderColor: gridColor,
                    borderWidth: 1
                }
            },
            scales: {
                x: {
                    grid: { color: gridColor },
                    ticks: {
                        color: textColor,
                        maxRotation: 45,
                        minRotation: 45,
                        font: { size: 10 }
                    }
                },
                y: {
                    grid: { color: gridColor },
                    ticks: { color: textColor },
                    title: {
                        display: true,
                        text: t('pmc.ramp') || 'Rampa',
                        color: textColor
                    }
                }
            }
        }
    });
}

// ============ FUNCIONES AUXILIARES ============

function calculateAge(birthDate) {
    if (!birthDate) return 'N/A';
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
    }
    return age;
}

function getLatestVO2Max(wellness) {
    for (let i = wellness.length - 1; i >= 0; i--) {
        if (wellness[i].vo2max) {
            return wellness[i].vo2max;
        }
    }
    return null;
}

function getTSBZone(tsb) {
    if (tsb < -30) return t('pmc.zones.risk') || 'Alto Riesgo';
    if (tsb < -10) return t('pmc.zones.optimal') || 'Óptimo';
    if (tsb < 5) return t('pmc.zones.gray') || 'Zona Gris';
    if (tsb < 25) return t('pmc.zones.fresh') || 'Frescura';
    return t('pmc.zones.transition') || 'Transición';
}

function getTSBClass(tsb) {
    if (tsb < -30) return 'metric-risk';
    if (tsb < -10) return 'metric-optimal';
    if (tsb < 5) return 'metric-gray';
    if (tsb < 25) return 'metric-fresh';
    return 'metric-transition';
}

function getTSBColor(tsb) {
    if (tsb === null) return '#94a3b8';
    if (tsb < -30) return '#ef4444'; // Rojo - Alto Riesgo
    if (tsb < -10) return '#10b981'; // Verde - Óptimo
    if (tsb < 5) return '#94a3b8'; // Gris - Zona Gris
    if (tsb < 25) return '#3b82f6'; // Azul - Frescura
    return '#f59e0b'; // Naranja - Transición
}

function getTSBColorWithAlpha(tsb) {
    if (tsb === null) return 'rgba(148, 163, 184, 0.2)';
    if (tsb < -30) return 'rgba(239, 68, 68, 0.2)';
    if (tsb < -10) return 'rgba(16, 185, 129, 0.2)';
    if (tsb < 5) return 'rgba(148, 163, 184, 0.2)';
    if (tsb < 25) return 'rgba(59, 130, 246, 0.2)';
    return 'rgba(245, 158, 11, 0.2)';
}
