import { saveIntervalsCredentials } from '../apiService.js';
import { t } from '../i18n.js';

/**
 * Renderiza la vista de configuración para que el usuario ingrese sus claves.
 */
export function renderSettingsPanel(container, onSave) {
    container.innerHTML = `
        <div class="settings-form">
            <h2 data-i18n="settings.title">${t('settings.title')}</h2>
            <p data-i18n="settings.description">${t('settings.description')}</p>
            <p data-i18n="settings.instructions">${t('settings.instructions')}</p>
            
            <div class="form-group">
                <label for="coach-id" data-i18n="settings.coachId">${t('settings.coachId')}</label>
                <input type="text" id="coach-id" placeholder="${t('settings.coachIdPlaceholder')}">
            </div>
            
            <div class="form-group">
                <label for="api-key" data-i18n="settings.apiKey">${t('settings.apiKey')}</label>
                <input type="password" id="api-key" placeholder="${t('settings.apiKeyPlaceholder')}">
            </div>
            
            <button class="btn btn-primary" id="save-keys-btn" data-i18n="settings.save">${t('settings.save')}</button>
            <div id="status-message" class="status-message"></div>
        </div>
    `;

    // --- Lógica del formulario ---
    const saveButton = document.getElementById('save-keys-btn');
    const coachIdInput = document.getElementById('coach-id');
    const apiKeyInput = document.getElementById('api-key');
    const statusMessage = document.getElementById('status-message');

    saveButton.addEventListener('click', async () => {
        const coachId = coachIdInput.value;
        const apiKey = apiKeyInput.value;

        if (!coachId || !apiKey) {
            statusMessage.textContent = t('settings.required');
            statusMessage.className = 'status-message error';
            return;
        }

        statusMessage.textContent = t('settings.saving');
        statusMessage.className = 'status-message';
        saveButton.disabled = true;

        try {
            await saveIntervalsCredentials(coachId, apiKey);
            statusMessage.textContent = t('settings.success');
            statusMessage.className = 'status-message success';
            
            // Llama a la función 'onSave' (que será initializeApp)
            setTimeout(onSave, 1500);
            
        } catch (error) {
            statusMessage.textContent = `${t('settings.error')}: ${error.message}`;
            statusMessage.className = 'status-message error';
            saveButton.disabled = false;
        }
    });
}