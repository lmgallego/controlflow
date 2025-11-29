import { getAthletes, getWellnessData } from '../apiService.js';
import { t } from '../i18n.js';
import { mean, standardDeviation, calculateReadiness } from '../statsUtils.js';

// Prioridad de ordenamiento para readiness
const READINESS_PRIORITY = {
    'rest': 1,
    'lit': 2,
    'normal': 3,
    'hiit': 4,
    'noData': 5
};

/**
 * Obtiene el último Z-Score de HRV para un atleta
 */
async function getAthleteReadiness(athleteId) {
    try {
        const today = new Date();
        const oldest = new Date(today);
        oldest.setDate(today.getDate() - 30); // Últimos 30 días para calcular Z-Score
        
        const oldestStr = oldest.toISOString().split('T')[0];
        const newestStr = today.toISOString().split('T')[0];
        
        const wellnessData = await getWellnessData(athleteId, oldestStr, newestStr);
        
        if (!wellnessData || wellnessData.length < 7) {
            return { readiness: calculateReadiness(null), hasData: false };
        }
        
        // Extraer valores de HRV
        const hrvValues = wellnessData
            .map(d => d.hrv)
            .filter(v => v !== null && v !== undefined && !isNaN(v));
        
        if (hrvValues.length < 7) {
            return { readiness: calculateReadiness(null), hasData: false };
        }
        
        // Calcular Z-Scores
        const hrvMean = mean(hrvValues);
        const hrvStd = standardDeviation(hrvValues);
        
        if (hrvStd === 0) {
            return { readiness: calculateReadiness(0), hasData: true };
        }
        
        // Último Z-Score
        const latestHRV = hrvValues[hrvValues.length - 1];
        const latestZScore = (latestHRV - hrvMean) / hrvStd;
        
        return { readiness: calculateReadiness(latestZScore), hasData: true };
    } catch (error) {
        console.warn(`Error getting readiness for athlete ${athleteId}:`, error);
        return { readiness: calculateReadiness(null), hasData: false };
    }
}

/**
 * Renderiza el panel de deportistas con todos los atletas y sus datos
 */
export async function renderAthletesPanel(container) {
    container.innerHTML = `
        <div class="athletes-panel">
            <div class="athletes-header">
                <h2 data-i18n="athletes.title">${t('athletes.title')}</h2>
                <p class="athletes-subtitle" data-i18n="athletes.subtitle">${t('athletes.subtitle')}</p>
            </div>
            <div class="athletes-loading">
                <div class="spinner"></div>
                <p>${t('athletes.loading')}</p>
            </div>
        </div>
    `;

    try {
        const athletes = await getAthletes();

        if (!athletes || athletes.length === 0) {
            container.innerHTML = `
                <div class="athletes-panel">
                    <div class="athletes-header">
                        <h2 data-i18n="athletes.title">${t('athletes.title')}</h2>
                        <p class="athletes-subtitle" data-i18n="athletes.subtitle">${t('athletes.subtitle')}</p>
                    </div>
                    <div class="no-data">
                        <p data-i18n="athletes.noAthletes">${t('athletes.noAthletes')}</p>
                    </div>
                </div>
            `;
            return;
        }

        // Obtener readiness para cada atleta en paralelo
        const athletesWithReadiness = await Promise.all(
            athletes.map(async (athlete) => {
                const { readiness, hasData } = await getAthleteReadiness(athlete.id);
                return { ...athlete, readiness, hasReadinessData: hasData };
            })
        );

        // Ordenar por prioridad de readiness (REST primero, luego LIT, NORMAL, HIIT)
        athletesWithReadiness.sort((a, b) => {
            const priorityA = READINESS_PRIORITY[a.readiness.intensityKey] || 5;
            const priorityB = READINESS_PRIORITY[b.readiness.intensityKey] || 5;
            return priorityA - priorityB;
        });

        container.innerHTML = `
            <div class="athletes-panel">
                <div class="athletes-header">
                    <h2 data-i18n="athletes.title">${t('athletes.title')}</h2>
                    <p class="athletes-subtitle" data-i18n="athletes.subtitle">${t('athletes.subtitle')}</p>
                </div>
                <div class="athletes-grid">
                    ${athletesWithReadiness.map(athlete => renderAthleteCard(athlete)).join('')}
                </div>
            </div>
        `;

    } catch (error) {
        console.error('Error loading athletes:', error);
        container.innerHTML = `
            <div class="athletes-panel">
                <div class="athletes-header">
                    <h2 data-i18n="athletes.title">${t('athletes.title')}</h2>
                </div>
                <div class="error-message">
                    <h3 data-i18n="athletes.error">${t('athletes.error')}</h3>
                    <p>${error.message}</p>
                </div>
            </div>
        `;
    }
}

/**
 * Renderiza una tarjeta individual de atleta
 */
function renderAthleteCard(athlete) {
    const { readiness, hasReadinessData } = athlete;
    
    // Badge de readiness
    const readinessBadge = hasReadinessData ? `
        <div class="athlete-readiness-badge" style="background-color: ${readiness.color}20; border-color: ${readiness.color};">
            <span class="readiness-emoji">${readiness.emoji}</span>
            <span class="readiness-text" style="color: ${readiness.color};">${readiness.intensityKey.toUpperCase()}</span>
        </div>
    ` : '';

    return `
        <div class="athlete-card ${hasReadinessData ? 'has-readiness' : ''}" style="${hasReadinessData ? `border-top: 3px solid ${readiness.color};` : ''}">
            <div class="athlete-card-header">
                <div class="athlete-avatar">
                    <i data-lucide="user"></i>
                </div>
                <div class="athlete-info">
                    <div class="athlete-name-row">
                        <h3 class="athlete-name">${athlete.name}</h3>
                        ${readinessBadge}
                    </div>
                    <p class="athlete-id">
                        <span data-i18n="athletes.athleteId">${t('athletes.athleteId')}</span>: 
                        <span class="athlete-id-value">${athlete.id}</span>
                    </p>
                </div>
            </div>
            <div class="athlete-card-body">
                <div class="athlete-stats">
                    <div class="stat-item" data-view="wellness" title="${t('nav.wellness')}">
                        <i data-lucide="heart-pulse"></i>
                        <span data-i18n="nav.wellness">${t('nav.wellness')}</span>
                    </div>
                    <div class="stat-item" data-view="activities" title="${t('nav.activities')}">
                        <i data-lucide="activity"></i>
                        <span data-i18n="nav.activities">${t('nav.activities')}</span>
                    </div>
                    <div class="stat-item" data-view="analysis" title="${t('nav.analysis')}">
                        <i data-lucide="bar-chart-3"></i>
                        <span data-i18n="nav.analysis">${t('nav.analysis')}</span>
                    </div>
                </div>
            </div>
            <div class="athlete-card-footer">
                <button class="btn btn-primary view-athlete-btn" data-athlete-id="${athlete.id}">
                    <i data-lucide="eye"></i>
                    <span data-i18n="athletes.viewDetails">${t('athletes.viewDetails')}</span>
                </button>
            </div>
        </div>
    `;
}
