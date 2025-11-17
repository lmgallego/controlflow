/**
 * Inicialización de controles de UI: tema e idioma
 */

import { setLanguage, translatePage, getCurrentLanguage } from './i18n.js';

// Inicializar tema
function initTheme() {
    const themeToggle = document.getElementById('theme-toggle');
    const currentTheme = localStorage.getItem('theme') || 'dark';

    // Aplicar tema guardado
    document.documentElement.setAttribute('data-theme', currentTheme);
    updateThemeToggleIcon(currentTheme);

    // Event listener
    themeToggle?.addEventListener('click', () => {
        const current = document.documentElement.getAttribute('data-theme');
        const newTheme = current === 'dark' ? 'light' : 'dark';

        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeToggleIcon(newTheme);
    });
}

function updateThemeToggleIcon(theme) {
    const sunIcon = document.querySelector('.theme-icon.sun');
    const moonIcon = document.querySelector('.theme-icon.moon');

    if (theme === 'dark') {
        sunIcon.style.display = 'block';
        moonIcon.style.display = 'none';
    } else {
        sunIcon.style.display = 'none';
        moonIcon.style.display = 'block';
    }
}

// Inicializar idioma
function initLanguage() {
    const langBtns = document.querySelectorAll('.language-btn');
    const currentLang = getCurrentLanguage();

    // Marcar botón activo
    langBtns.forEach(btn => {
        if (btn.dataset.lang === currentLang) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    // Traducir página inicial
    translatePage();

    // Event listeners
    langBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const lang = btn.dataset.lang;
            setLanguage(lang);

            // Actualizar botones
            langBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Traducir toda la página
            translatePage();
        });
    });

    // Escuchar cambios de idioma desde otros componentes
    window.addEventListener('languageChanged', () => {
        translatePage();
    });
}

// Inicializar todo cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initLanguage();
});

export { initTheme, initLanguage };
