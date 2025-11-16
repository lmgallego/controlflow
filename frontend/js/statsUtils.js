/**
 * Utilidades estadísticas para análisis de datos de wellness
 * Incluye cálculos de HRV, intervalos de confianza, z-scores, etc.
 */

/**
 * Calcula el logaritmo natural de RMSSD (Root Mean Square of Successive Differences)
 * LnRMSSD es una normalización común del HRV que sigue una distribución más normal
 * @param {number} hrv - Valor de HRV en ms
 * @returns {number} - LnRMSSD
 */
export function calculateLnRMSSD(hrv) {
    if (!hrv || hrv <= 0) return null;
    return Math.log(hrv);
}

/**
 * Calcula la media de un array de números
 * @param {number[]} values - Array de valores
 * @returns {number} - Media
 */
export function mean(values) {
    const filtered = values.filter(v => v !== null && v !== undefined && !isNaN(v));
    if (filtered.length === 0) return null;
    return filtered.reduce((sum, val) => sum + val, 0) / filtered.length;
}

/**
 * Calcula la desviación estándar de un array
 * @param {number[]} values - Array de valores
 * @param {number} avg - Media (opcional, se calcula si no se provee)
 * @returns {number} - Desviación estándar
 */
export function standardDeviation(values, avg = null) {
    const filtered = values.filter(v => v !== null && v !== undefined && !isNaN(v));
    if (filtered.length === 0) return null;

    const average = avg !== null ? avg : mean(filtered);
    const squareDiffs = filtered.map(value => Math.pow(value - average, 2));
    const avgSquareDiff = mean(squareDiffs);

    return Math.sqrt(avgSquareDiff);
}

/**
 * Calcula el Z-Score de un valor
 * Z-Score indica cuántas desviaciones estándar está un valor de la media
 * @param {number} value - Valor a normalizar
 * @param {number} avg - Media de la población
 * @param {number} std - Desviación estándar
 * @returns {number} - Z-Score
 */
export function zScore(value, avg, std) {
    if (std === 0 || std === null || value === null) return null;
    return (value - avg) / std;
}

/**
 * Calcula media móvil (rolling average)
 * @param {number[]} data - Array de valores
 * @param {number} window - Tamaño de la ventana
 * @returns {number[]} - Array de medias móviles
 */
export function rollingAverage(data, window = 7) {
    const result = [];

    for (let i = 0; i < data.length; i++) {
        const start = Math.max(0, i - window + 1);
        const windowData = data.slice(start, i + 1);
        result.push(mean(windowData));
    }

    return result;
}

/**
 * Calcula intervalos de confianza móviles
 * @param {number[]} data - Array de valores
 * @param {number} window - Tamaño de la ventana
 * @param {number} confidence - Nivel de confianza (1.96 para 95%)
 * @returns {Object} - {upper: [], lower: [], mean: []}
 */
export function rollingConfidenceInterval(data, window = 7, confidence = 1.96) {
    const upper = [];
    const lower = [];
    const means = [];

    for (let i = 0; i < data.length; i++) {
        const start = Math.max(0, i - window + 1);
        const windowData = data.slice(start, i + 1);

        const avg = mean(windowData);
        const std = standardDeviation(windowData, avg);

        if (avg !== null && std !== null) {
            const margin = confidence * std / Math.sqrt(windowData.length);
            upper.push(avg + margin);
            lower.push(avg - margin);
            means.push(avg);
        } else {
            upper.push(null);
            lower.push(null);
            means.push(null);
        }
    }

    return { upper, lower, mean: means };
}

/**
 * Calcula estadísticas de baseline para los últimos N días
 * @param {number[]} data - Array de valores
 * @param {number} days - Número de días para baseline (default: 7)
 * @returns {Object} - {mean, std, min, max}
 */
export function calculateBaseline(data, days = 7) {
    const filtered = data.slice(-days).filter(v => v !== null && v !== undefined && !isNaN(v));

    if (filtered.length === 0) {
        return { mean: null, std: null, min: null, max: null };
    }

    return {
        mean: mean(filtered),
        std: standardDeviation(filtered),
        min: Math.min(...filtered),
        max: Math.max(...filtered)
    };
}

/**
 * Evalúa la puntuación de sueño según los criterios profesionales
 * @param {number} score - Puntuación de sueño (0-100)
 * @returns {Object} - {category, color, description}
 */
export function evaluateSleepScore(score) {
    if (score === null || score === undefined) {
        return {
            categoryKey: 'noData',
            color: '#94a3b8'
        };
    }

    if (score >= 90) {
        return {
            categoryKey: 'excellent',
            color: '#10b981'
        };
    } else if (score >= 80) {
        return {
            categoryKey: 'good',
            color: '#3b82f6'
        };
    } else if (score >= 60) {
        return {
            categoryKey: 'acceptable',
            color: '#f59e0b'
        };
    } else {
        return {
            categoryKey: 'poor',
            color: '#ef4444'
        };
    }
}

/**
 * Formatea horas de sueño de segundos a formato legible
 * @param {number} seconds - Segundos de sueño
 * @returns {string} - Formato "Xh Ym"
 */
export function formatSleepHours(seconds) {
    if (!seconds) return 'N/A';

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    return `${hours}h ${minutes}m`;
}

/**
 * Convierte segundos a horas decimales
 * @param {number} seconds - Segundos
 * @returns {number} - Horas decimales
 */
export function secondsToHours(seconds) {
    if (!seconds) return null;
    return seconds / 3600;
}

/**
 * Evalúa el estado del HRV basado en el Z-Score
 * @param {number} zScore - Z-Score del HRV
 * @returns {Object} - {statusKey, color, descriptionKey}
 */
export function evaluateHRVStatus(zScore) {
    if (zScore === null || zScore === undefined) {
        return {
            statusKey: 'noData',
            color: '#94a3b8',
            descriptionKey: 'noData'
        };
    }

    if (zScore > 1) {
        return {
            statusKey: 'veryHigh',
            color: '#10b981',
            descriptionKey: 'veryHigh'
        };
    } else if (zScore > 0.5) {
        return {
            statusKey: 'high',
            color: '#3b82f6',
            descriptionKey: 'high'
        };
    } else if (zScore > -0.5) {
        return {
            statusKey: 'normal',
            color: '#f59e0b',
            descriptionKey: 'normal'
        };
    } else if (zScore > -1) {
        return {
            statusKey: 'low',
            color: '#f97316',
            descriptionKey: 'low'
        };
    } else {
        return {
            statusKey: 'veryLow',
            color: '#ef4444',
            descriptionKey: 'veryLow'
        };
    }
}
