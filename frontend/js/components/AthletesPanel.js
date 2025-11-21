import { getAthletes } from '../apiService.js';
import { t } from '../i18n.js';

/**
 * Renderiza el panel de deportistas con todos los atletas y sus datos
 */
export async function renderAthletesPanel(container) {
    container.innerHTML = `<h3 data-i18n="athletes.loading">${t('athletes.loading')}</h3>`;

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

        container.innerHTML = `
            <div class="athletes-panel">
                <div class="athletes-header">
                    <h2 data-i18n="athletes.title">${t('athletes.title')}</h2>
                    <p class="athletes-subtitle" data-i18n="athletes.subtitle">${t('athletes.subtitle')}</p>
                </div>
                <div class="athletes-grid">
                    ${athletes.map(athlete => renderAthleteCard(athlete)).join('')}
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
    return `
        <div class="athlete-card">
            <div class="athlete-card-header">
                <div class="athlete-avatar">
                    <i data-lucide="user"></i>
                </div>
                <div class="athlete-info">
                    <h3 class="athlete-name">${athlete.name}</h3>
                    <p class="athlete-id">
                        <span data-i18n="athletes.athleteId">${t('athletes.athleteId')}</span>: 
                        <span class="athlete-id-value">${athlete.id}</span>
                    </p>
                </div>
            </div>
            <div class="athlete-card-body">
                <div class="athlete-stats">
                    <div class="stat-item">
                        <i data-lucide="heart-pulse"></i>
                        <span data-i18n="nav.wellness">${t('nav.wellness')}</span>
                    </div>
                    <div class="stat-item">
                        <i data-lucide="activity"></i>
                        <span data-i18n="nav.activities">${t('nav.activities')}</span>
                    </div>
                    <div class="stat-item">
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
