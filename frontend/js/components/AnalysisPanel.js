import { t } from '../i18n.js';
import { renderPMCPanel } from './PMCPanel.js';
import { renderPDCPanel } from './PDCPanel.js';

/**
 * Panel de Análisis con pestañas
 * Contiene diferentes tipos de análisis: Carga, Potencia (PDC), Rendimiento
 */
export async function renderAnalysisPanel(container, athleteId) {
    // Renderizar estructura con pestañas
    container.innerHTML = `
        <div class="analysis-panel">
            <div class="analysis-tabs">
                <button class="analysis-tab active" data-tab="load" data-i18n="analysis.loadAnalysis">
                    ${t('analysis.loadAnalysis')}
                </button>
                <button class="analysis-tab" data-tab="pdc" data-i18n="analysis.pdcAnalysis">
                    ${t('analysis.pdcAnalysis')}
                </button>
                <button class="analysis-tab" data-tab="performance" data-i18n="analysis.performanceAnalysis">
                    ${t('analysis.performanceAnalysis')}
                </button>
            </div>
            <div class="analysis-content" id="analysis-tab-content">
                <!-- El contenido de la pestaña se cargará aquí -->
            </div>
        </div>
    `;

    // Obtener elementos
    const tabs = container.querySelectorAll('.analysis-tab');
    const tabContent = container.querySelector('#analysis-tab-content');

    // Función para cambiar de pestaña
    const switchTab = async (tabName) => {
        // Actualizar clases activas
        tabs.forEach(tab => {
            if (tab.dataset.tab === tabName) {
                tab.classList.add('active');
            } else {
                tab.classList.remove('active');
            }
        });

        // Cargar contenido según la pestaña
        switch (tabName) {
            case 'load':
                await renderPMCPanel(tabContent, athleteId);
                break;
            case 'pdc':
                await renderPDCPanel(tabContent, athleteId);
                break;
            case 'performance':
                tabContent.innerHTML = `
                    <div class="coming-soon">
                        <h3>${t('analysis.performanceAnalysis')}</h3>
                        <p>Próximamente...</p>
                    </div>
                `;
                break;
        }
    };

    // Event listeners para las pestañas
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            switchTab(tab.dataset.tab);
        });
    });

    // Cargar la primera pestaña por defecto
    await switchTab('load');
}
