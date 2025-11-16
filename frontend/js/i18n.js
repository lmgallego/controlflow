/**
 * Sistema de Internacionalización (i18n) para ControlFlow
 * Soporta Español e Inglés
 */

const translations = {
    es: {
        // Navigation
        nav: {
            wellness: 'Bienestar',
            activities: 'Actividades',
            analysis: 'Análisis',
            settings: 'Configuración',
            logout: 'Cerrar Sesión'
        },

        // Header
        header: {
            athlete: 'Atleta',
            loading: 'Cargando...',
            theme: 'Tema',
            language: 'Idioma'
        },

        // Wellness Panel
        wellness: {
            title: 'Análisis de Recuperación y Rendimiento',
            subtitle: 'Datos actualizados',
            loadingData: 'Cargando análisis de bienestar...',
            noData: 'No hay datos de wellness disponibles',
            errorLoading: 'Error al cargar los datos de bienestar',
            dateRange: 'Rango de Fechas',
            from: 'Desde',
            to: 'Hasta',
            apply: 'Aplicar',

            // HRV Card
            hrv: {
                title: 'Variabilidad Cardíaca (HRV)',
                current: 'HRV Actual',
                zScore: 'Z-Score',
                baseline: 'Baseline (7d)',
                stdDev: 'Desv. Estándar',
                status: {
                    veryHigh: 'Muy Alto',
                    high: 'Alto',
                    normal: 'Normal',
                    low: 'Bajo',
                    veryLow: 'Muy Bajo',
                    noData: 'Sin datos'
                },
                description: {
                    veryHigh: 'Excelente recuperación',
                    high: 'Buena recuperación',
                    normal: 'Recuperación normal',
                    low: 'Recuperación baja',
                    veryLow: 'Fatiga significativa',
                    noData: 'No hay datos suficientes'
                }
            },

            // Resting HR Card
            rhr: {
                title: 'Frecuencia Cardíaca en Reposo',
                current: 'RHR Actual',
                baseline: 'Baseline (7d)',
                range: 'Rango'
            },

            // Sleep Duration Card
            sleepDuration: {
                title: 'Duración del Sueño',
                lastNight: 'Última Noche',
                average: 'Promedio (7d)',
                target: 'Objetivo',
                quality: 'Calidad',
                score: 'Puntuación'
            },

            // Sleep Score Card
            sleepScore: {
                title: 'Calidad del Sueño',
                score: 'Puntuación',
                categories: {
                    excellent: 'Excelente',
                    good: 'Bueno',
                    acceptable: 'Aceptable',
                    poor: 'Deficiente',
                    noData: 'Sin datos'
                },
                description: {
                    excellent: 'Recuperación óptima',
                    good: 'Buena recuperación',
                    acceptable: 'Recuperación moderada',
                    poor: 'Recuperación insuficiente',
                    noData: 'No hay datos disponibles'
                },
                legend: {
                    excellent: 'Excelente (90-100)',
                    good: 'Bueno (80-89)',
                    acceptable: 'Aceptable (60-79)',
                    poor: 'Deficiente (<60)'
                }
            },

            // Summary Card
            summary: {
                title: 'Resumen de Recuperación',
                hrvStatus: 'Estado HRV',
                rhrAverage: 'RHR Promedio',
                sleepAverage: 'Sueño Promedio',
                sleepQuality: 'Calidad Sueño'
            },

            // Trends
            trends: {
                increasing: 'Tendencia al alza',
                decreasing: 'Tendencia a la baja',
                stable: 'Estable'
            },

            // BPE System
            bpe: {
                title: 'Detección de Bloques de Patrón Específico (BPE)',
                subtitle: 'Análisis avanzado de patrones fisiológicos',
                zThreshold: 'Umbral Z-Score',
                window: 'Ventana de Detección',
                variables: 'Variables a Analizar',
                sleepVar: 'Sueño',
                sleepScoreVar: 'Calidad Sueño',
                days: 'días',
                detect: 'Detectar Patrones',
                detecting: 'Detectando patrones...',
                viewBlocks: 'Ver Bloques',
                noPatterns: 'No se detectaron patrones BPE en el período seleccionado',
                selectAtLeastOne: 'Selecciona al menos una variable para analizar',
                types: {
                    fatigue: 'Fatiga Aguda',
                    recovery: 'Recuperación',
                    disruption: 'Disrupción'
                },
                description: {
                    fatigue: 'Patrón de fatiga detectado: ↓HRV, ↑RHR, ↓Sueño',
                    recovery: 'Patrón de recuperación: ↑HRV, ↓RHR, ↑Sueño',
                    disruption: 'Patrón atípico detectado'
                },
                stats: {
                    detected: 'Bloques Detectados',
                    duration: 'Duración Promedio',
                    intensity: 'Intensidad Promedio',
                    biomarcadores: 'Biomarcadores Activos'
                },
                info: {
                    tooltip: 'Más información sobre BPE',
                    title: '¿Qué son los Bloques de Patrón Específico?',
                    what: 'Los BPE son períodos donde múltiples biomarcadores muestran desviaciones significativas simultáneas, indicando cambios en el estado fisiológico del atleta.',
                    how: 'El sistema analiza las variables usando Z-Scores adaptativos en ventanas móviles, detectando patrones que persisten durante varios días consecutivos.',
                    typesTitle: 'Tipos de Patrones',
                    fatigueDesc: 'HRV baja, frecuencia cardíaca elevada y sueño reducido. Indica acumulación de fatiga.',
                    recoveryDesc: 'HRV alta, frecuencia cardíaca baja y sueño de calidad. Indica recuperación óptima.',
                    disruptionDesc: 'Patrones mixtos o atípicos que no se clasifican claramente como fatiga o recuperación.',
                    interpretTitle: 'Cómo Interpretarlo',
                    interpret: 'Los bloques coloreados en el gráfico indican períodos donde se detectaron patrones. La intensidad representa qué tan fuerte es la desviación respecto a tu baseline normal.'
                }
            },

            // Chart Actions
            chart: {
                fullscreen: 'Pantalla Completa',
                close: 'Cerrar'
            }
        },

        // Settings
        settings: {
            title: 'Configuración de Intervals.icu',
            description: 'Para usar la aplicación, necesitamos tu ID de Atleta (Coach) y tu API Key de Intervals.icu.',
            instructions: 'Puedes encontrarlos en tu página de <strong>Configuración > Developer</strong> en Intervals.icu.',
            coachId: 'ID de Atleta (Coach)',
            coachIdPlaceholder: 'ej: i12345',
            apiKey: 'API Key',
            apiKeyPlaceholder: 'ej: tu_clave_secreta_aqui',
            save: 'Guardar Credenciales',
            saving: 'Guardando...',
            success: '¡Credenciales guardadas! Recargando la aplicación...',
            error: 'Error al guardar',
            required: 'Por favor, completa ambos campos.'
        },

        // Common
        common: {
            na: 'N/A',
            loading: 'Cargando...',
            error: 'Error',
            success: 'Éxito',
            cancel: 'Cancelar',
            save: 'Guardar',
            close: 'Cerrar',
            apply: 'Aplicar',
            reset: 'Restablecer',
            types: 'Tipos',
            units: {
                ms: 'ms',
                bpm: 'bpm',
                hours: 'h',
                minutes: 'm',
                days: 'd',
                points: 'puntos'
            }
        }
    },

    en: {
        // Navigation
        nav: {
            wellness: 'Wellness',
            activities: 'Activities',
            analysis: 'Analysis',
            settings: 'Settings',
            logout: 'Logout'
        },

        // Header
        header: {
            athlete: 'Athlete',
            loading: 'Loading...',
            theme: 'Theme',
            language: 'Language'
        },

        // Wellness Panel
        wellness: {
            title: 'Recovery and Performance Analysis',
            subtitle: 'Updated data',
            loadingData: 'Loading wellness analysis...',
            noData: 'No wellness data available',
            errorLoading: 'Error loading wellness data',
            dateRange: 'Date Range',
            from: 'From',
            to: 'To',
            apply: 'Apply',

            // HRV Card
            hrv: {
                title: 'Heart Rate Variability (HRV)',
                current: 'Current HRV',
                zScore: 'Z-Score',
                baseline: 'Baseline (7d)',
                stdDev: 'Std Dev',
                status: {
                    veryHigh: 'Very High',
                    high: 'High',
                    normal: 'Normal',
                    low: 'Low',
                    veryLow: 'Very Low',
                    noData: 'No data'
                },
                description: {
                    veryHigh: 'Excellent recovery',
                    high: 'Good recovery',
                    normal: 'Normal recovery',
                    low: 'Low recovery',
                    veryLow: 'Significant fatigue',
                    noData: 'Insufficient data'
                }
            },

            // Resting HR Card
            rhr: {
                title: 'Resting Heart Rate',
                current: 'Current RHR',
                baseline: 'Baseline (7d)',
                range: 'Range'
            },

            // Sleep Duration Card
            sleepDuration: {
                title: 'Sleep Duration',
                lastNight: 'Last Night',
                average: 'Average (7d)',
                target: 'Target',
                quality: 'Quality',
                score: 'Score'
            },

            // Sleep Score Card
            sleepScore: {
                title: 'Sleep Quality',
                score: 'Score',
                categories: {
                    excellent: 'Excellent',
                    good: 'Good',
                    acceptable: 'Acceptable',
                    poor: 'Poor',
                    noData: 'No data'
                },
                description: {
                    excellent: 'Optimal recovery',
                    good: 'Good recovery',
                    acceptable: 'Moderate recovery',
                    poor: 'Insufficient recovery',
                    noData: 'No data available'
                },
                legend: {
                    excellent: 'Excellent (90-100)',
                    good: 'Good (80-89)',
                    acceptable: 'Acceptable (60-79)',
                    poor: 'Poor (<60)'
                }
            },

            // Summary Card
            summary: {
                title: 'Recovery Summary',
                hrvStatus: 'HRV Status',
                rhrAverage: 'RHR Average',
                sleepAverage: 'Sleep Average',
                sleepQuality: 'Sleep Quality'
            },

            // Trends
            trends: {
                increasing: 'Increasing trend',
                decreasing: 'Decreasing trend',
                stable: 'Stable'
            },

            // BPE System
            bpe: {
                title: 'Specific Pattern Block (SPB) Detection',
                subtitle: 'Advanced physiological pattern analysis',
                zThreshold: 'Z-Score Threshold',
                window: 'Detection Window',
                variables: 'Variables to Analyze',
                sleepVar: 'Sleep',
                sleepScoreVar: 'Sleep Quality',
                days: 'days',
                detect: 'Detect Patterns',
                detecting: 'Detecting patterns...',
                viewBlocks: 'View Blocks',
                noPatterns: 'No SPB patterns detected in selected period',
                selectAtLeastOne: 'Select at least one variable to analyze',
                types: {
                    fatigue: 'Acute Fatigue',
                    recovery: 'Recovery',
                    disruption: 'Disruption'
                },
                description: {
                    fatigue: 'Fatigue pattern detected: ↓HRV, ↑RHR, ↓Sleep',
                    recovery: 'Recovery pattern: ↑HRV, ↓RHR, ↑Sleep',
                    disruption: 'Atypical pattern detected'
                },
                stats: {
                    detected: 'Blocks Detected',
                    duration: 'Average Duration',
                    intensity: 'Average Intensity',
                    biomarcadores: 'Active Biomarkers'
                },
                info: {
                    tooltip: 'More information about SPB',
                    title: 'What are Specific Pattern Blocks?',
                    what: 'SPBs are periods where multiple biomarkers show simultaneous significant deviations, indicating changes in the athlete\'s physiological state.',
                    how: 'The system analyzes variables using adaptive Z-Scores in rolling windows, detecting patterns that persist for several consecutive days.',
                    typesTitle: 'Pattern Types',
                    fatigueDesc: 'Low HRV, elevated heart rate and reduced sleep. Indicates fatigue accumulation.',
                    recoveryDesc: 'High HRV, low heart rate and quality sleep. Indicates optimal recovery.',
                    disruptionDesc: 'Mixed or atypical patterns that are not clearly classified as fatigue or recovery.',
                    interpretTitle: 'How to Interpret',
                    interpret: 'Colored blocks on the chart indicate periods where patterns were detected. Intensity represents how strong the deviation is from your normal baseline.'
                }
            },

            // Chart Actions
            chart: {
                fullscreen: 'Fullscreen',
                close: 'Close'
            }
        },

        // Settings
        settings: {
            title: 'Intervals.icu Configuration',
            description: 'To use the application, we need your Athlete ID (Coach) and your Intervals.icu API Key.',
            instructions: 'You can find them on your <strong>Settings > Developer</strong> page on Intervals.icu.',
            coachId: 'Athlete ID (Coach)',
            coachIdPlaceholder: 'eg: i12345',
            apiKey: 'API Key',
            apiKeyPlaceholder: 'eg: your_secret_key_here',
            save: 'Save Credentials',
            saving: 'Saving...',
            success: 'Credentials saved! Reloading application...',
            error: 'Error saving',
            required: 'Please fill in both fields.'
        },

        // Common
        common: {
            na: 'N/A',
            loading: 'Loading...',
            error: 'Error',
            success: 'Success',
            cancel: 'Cancel',
            save: 'Save',
            close: 'Close',
            apply: 'Apply',
            reset: 'Reset',
            types: 'Types',
            units: {
                ms: 'ms',
                bpm: 'bpm',
                hours: 'h',
                minutes: 'm',
                days: 'd',
                points: 'points'
            }
        }
    }
};

// Estado actual del idioma
let currentLanguage = localStorage.getItem('language') || 'es';

/**
 * Obtiene una traducción por su clave
 * @param {string} key - Clave en formato 'section.subsection.item'
 * @returns {string} - Texto traducido
 */
export function t(key) {
    const keys = key.split('.');
    let value = translations[currentLanguage];

    for (const k of keys) {
        if (value && value[k]) {
            value = value[k];
        } else {
            console.warn(`Translation not found for key: ${key}`);
            return key;
        }
    }

    return value;
}

/**
 * Cambia el idioma actual
 * @param {string} lang - 'es' o 'en'
 */
export function setLanguage(lang) {
    if (translations[lang]) {
        currentLanguage = lang;
        localStorage.setItem('language', lang);
        // Disparar evento para que los componentes se actualicen
        window.dispatchEvent(new CustomEvent('languageChanged', { detail: { language: lang } }));
    }
}

/**
 * Obtiene el idioma actual
 * @returns {string} - 'es' o 'en'
 */
export function getCurrentLanguage() {
    return currentLanguage;
}

/**
 * Traduce todos los elementos con atributo data-i18n
 */
export function translatePage() {
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        element.textContent = t(key);
    });

    // Traducir placeholders
    document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
        const key = element.getAttribute('data-i18n-placeholder');
        element.placeholder = t(key);
    });
}
