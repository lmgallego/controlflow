import { saveIntervalsCredentials } from '../apiService.js';

/**
 * Renderiza la vista de configuración para que el usuario ingrese sus claves.
 */
export function renderSettingsPanel(container, onSave) {
    container.innerHTML = `
        <div class="settings-form">
            <h2>Configuración de Intervals.icu</h2>
            <p>Para usar la aplicación, necesitamos tu ID de Atleta (Coach) y tu API Key de Intervals.icu.</p>
            <p>Puedes encontrarlos en tu página de <strong>Configuración > Developer</strong> en Intervals.icu.</p>
            
            <div class="form-group">
                <label for="coach-id">ID de Atleta (Coach)</label>
                <input type="text" id="coach-id" placeholder="ej: i12345">
            </div>
            
            <div class="form-group">
                <label for="api-key">API Key</label>
                <input type="password" id="api-key" placeholder="ej: tu_clave_secreta_aqui">
            </div>
            
            <button class="btn btn-primary" id="save-keys-btn">Guardar Credenciales</button>
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
            statusMessage.textContent = 'Por favor, completa ambos campos.';
            statusMessage.className = 'status-message error';
            return;
        }

        statusMessage.textContent = 'Guardando...';
        statusMessage.className = 'status-message';
        saveButton.disabled = true;

        try {
            await saveIntervalsCredentials(coachId, apiKey);
            statusMessage.textContent = '¡Credenciales guardadas! Recargando la aplicación...';
            statusMessage.className = 'status-message success';
            
            // Llama a la función 'onSave' (que será initializeApp)
            setTimeout(onSave, 1500);
            
        } catch (error) {
            statusMessage.textContent = `Error al guardar: ${error.message}`;
            statusMessage.className = 'status-message error';
            saveButton.disabled = false;
        }
    });
}