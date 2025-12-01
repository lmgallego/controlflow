/**
 * Sistema de Análisis DTF (Detección Temprana de Fatiga)
 * Detecta patrones fisiológicos específicos usando Z-Scores adaptativos
 * y clasificación automática de estados (fatiga, recuperación, disrupción)
 */

import { mean, standardDeviation, zScore } from './statsUtils.js';

/**
 * Calcula Z-Scores adaptativos con ventanas móviles
 * @param {number[]} data - Array de valores
 * @param {number} window - Tamaño de ventana para baseline (default: 14 días)
 * @returns {number[]} - Array de Z-Scores adaptativos
 */
function adaptiveZScores(data, window = 14) {
    const zScores = [];

    for (let i = 0; i < data.length; i++) {
        // Usar ventana retrospectiva (lookback window)
        const start = Math.max(0, i - window + 1);
        const windowData = data.slice(start, i + 1).filter(v => v !== null && v !== undefined && !isNaN(v));

        if (windowData.length < 3) {
            zScores.push(null);
            continue;
        }

        const avg = mean(windowData);
        const std = standardDeviation(windowData, avg);
        const z = zScore(data[i], avg, std);

        zScores.push(z);
    }

    return zScores;
}

/**
 * Detecta bloques donde múltiples variables superan el umbral Z simultáneamente
 * @param {Object} zScoreData - {hrv: [], rhr: [], sleep: [], sleepScore: []}
 * @param {number} threshold - Umbral de Z-Score absoluto (default: 1.5)
 * @param {number} detectionWindow - Ventana de detección en días (default: 5)
 * @param {number} minVariables - Mínimo de variables que deben activarse (default: 2)
 * @returns {Array} - Array de bloques detectados
 */
function detectDTFBlocks(zScoreData, threshold = 1.5, detectionWindow = 5, minVariables = 2) {
    const { hrv, rhr, sleep, sleepScore } = zScoreData;
    const length = hrv.length;
    const blocks = [];

    for (let i = 0; i < length - detectionWindow + 1; i++) {
        const windowEnd = i + detectionWindow;
        let activeVariables = 0;
        let hrvActivation = 0;
        let rhrActivation = 0;
        let sleepActivation = 0;
        let sleepScoreActivation = 0;

        // Contar activaciones en la ventana
        for (let j = i; j < windowEnd; j++) {
            const hrvZ = hrv[j];
            const rhrZ = rhr[j];
            const sleepZ = sleep[j];
            const sleepScoreZ = sleepScore[j];

            if (hrvZ !== null && Math.abs(hrvZ) >= threshold) hrvActivation++;
            if (rhrZ !== null && Math.abs(rhrZ) >= threshold) rhrActivation++;
            if (sleepZ !== null && Math.abs(sleepZ) >= threshold) sleepActivation++;
            if (sleepScoreZ !== null && Math.abs(sleepScoreZ) >= threshold) sleepScoreActivation++;
        }

        // Determinar si cada variable está activa en la ventana (>50% de días)
        const halfWindow = detectionWindow / 2;
        let variablesActive = [];

        if (hrvActivation >= halfWindow) {
            activeVariables++;
            variablesActive.push('hrv');
        }
        if (rhrActivation >= halfWindow) {
            activeVariables++;
            variablesActive.push('rhr');
        }
        if (sleepActivation >= halfWindow) {
            activeVariables++;
            variablesActive.push('sleep');
        }
        if (sleepScoreActivation >= halfWindow) {
            activeVariables++;
            variablesActive.push('sleepScore');
        }

        // Si cumple el criterio mínimo de variables, crear bloque
        if (activeVariables >= minVariables) {
            // Calcular intensidad promedio (promedio de Z-Scores absolutos en la ventana)
            let totalZ = 0;
            let count = 0;

            for (let j = i; j < windowEnd; j++) {
                if (hrv[j] !== null) { totalZ += Math.abs(hrv[j]); count++; }
                if (rhr[j] !== null) { totalZ += Math.abs(rhr[j]); count++; }
                if (sleep[j] !== null) { totalZ += Math.abs(sleep[j]); count++; }
                if (sleepScore[j] !== null) { totalZ += Math.abs(sleepScore[j]); count++; }
            }

            const intensity = count > 0 ? totalZ / count : 0;

            // Clasificar el tipo de patrón
            const patternType = classifyPattern(zScoreData, i, windowEnd);

            blocks.push({
                startIndex: i,
                endIndex: windowEnd - 1,
                duration: detectionWindow,
                activeVariables: variablesActive,
                activeCount: activeVariables,
                intensity: intensity,
                type: patternType
            });

            // Saltar la ventana actual para evitar solapamiento excesivo
            i += Math.floor(detectionWindow / 2);
        }
    }

    return blocks;
}

/**
 * Clasifica el tipo de patrón basado en las direcciones de los Z-Scores
 * @param {Object} zScoreData - {hrv: [], rhr: [], sleep: [], sleepScore: []}
 * @param {number} start - Índice de inicio
 * @param {number} end - Índice de fin
 * @returns {string} - 'fatigue', 'recovery', o 'disruption'
 */
function classifyPattern(zScoreData, start, end) {
    const { hrv, rhr, sleep, sleepScore } = zScoreData;

    // Calcular promedios en la ventana
    const hrvAvg = mean(hrv.slice(start, end));
    const rhrAvg = mean(rhr.slice(start, end));
    const sleepAvg = mean(sleep.slice(start, end));
    const sleepScoreAvg = mean(sleepScore.slice(start, end));

    // Patrón de FATIGA: ↓HRV (negativo), ↑RHR (positivo), ↓Sueño (negativo)
    const fatigueScore =
        (hrvAvg !== null && hrvAvg < -0.5 ? 1 : 0) +
        (rhrAvg !== null && rhrAvg > 0.5 ? 1 : 0) +
        (sleepAvg !== null && sleepAvg < -0.5 ? 1 : 0) +
        (sleepScoreAvg !== null && sleepScoreAvg < -0.5 ? 1 : 0);

    // Patrón de RECUPERACIÓN: ↑HRV (positivo), ↓RHR (negativo), ↑Sueño (positivo)
    const recoveryScore =
        (hrvAvg !== null && hrvAvg > 0.5 ? 1 : 0) +
        (rhrAvg !== null && rhrAvg < -0.5 ? 1 : 0) +
        (sleepAvg !== null && sleepAvg > 0.5 ? 1 : 0) +
        (sleepScoreAvg !== null && sleepScoreAvg > 0.5 ? 1 : 0);

    // Determinar clasificación
    if (fatigueScore >= 2) {
        return 'fatigue';
    } else if (recoveryScore >= 2) {
        return 'recovery';
    } else {
        return 'disruption'; // Patrón mixto o atípico
    }
}

/**
 * Optimiza el umbral de Z-Score usando análisis de silueta
 * @param {Object} zScoreData - {hrv: [], rhr: [], sleep: [], sleepScore: []}
 * @param {number[]} thresholds - Array de umbrales a probar (default: [1.0, 1.25, 1.5, 1.75, 2.0])
 * @returns {number} - Umbral óptimo
 */
function optimizeThreshold(zScoreData, thresholds = [1.0, 1.25, 1.5, 1.75, 2.0]) {
    let bestThreshold = 1.5;
    let bestScore = -1;

    for (const threshold of thresholds) {
        const blocks = detectDTFBlocks(zScoreData, threshold, 5, 2);

        if (blocks.length === 0) continue;

        // Calcular score de silueta simplificado
        // (mayor separación entre bloques, mejor agrupación interna)
        const silhouetteScore = calculateSilhouetteScore(blocks);

        if (silhouetteScore > bestScore) {
            bestScore = silhouetteScore;
            bestThreshold = threshold;
        }
    }

    return bestThreshold;
}

/**
 * Calcula un score de silueta simplificado para evaluar la calidad de los bloques
 * @param {Array} blocks - Array de bloques detectados
 * @returns {number} - Score de silueta (mayor = mejor)
 */
function calculateSilhouetteScore(blocks) {
    if (blocks.length < 2) return 0;

    let totalScore = 0;

    for (let i = 0; i < blocks.length; i++) {
        const block = blocks[i];

        // Cohesión interna (menor es mejor): duración y número de variables activas
        const cohesion = block.intensity * block.activeCount;

        // Separación (mayor es mejor): distancia al bloque más cercano
        let minDistance = Infinity;
        for (let j = 0; j < blocks.length; j++) {
            if (i === j) continue;
            const distance = Math.abs(block.startIndex - blocks[j].startIndex);
            if (distance < minDistance) minDistance = distance;
        }

        // Score de silueta: (separación - cohesión) / max(separación, cohesión)
        const separation = minDistance;
        const silhouette = (separation - cohesion) / Math.max(separation, cohesion, 1);
        totalScore += silhouette;
    }

    return totalScore / blocks.length;
}

/**
 * Análisis completo BPE
 * @param {Object} wellnessData - Datos de wellness procesados
 * @param {Object} options - {threshold, detectionWindow, minVariables, optimizeThreshold}
 * @returns {Object} - {blocks, zScores, stats, threshold}
 */
export function analyzeDTF(wellnessData, options = {}) {
    const {
        threshold: userThreshold = null,
        detectionWindow = 5,
        minVariables = 2,
        optimizeThreshold: shouldOptimize = false,
        adaptiveWindow = 14
    } = options;

    // Extraer datos crudos
    const hrvRaw = wellnessData.dates.map((_, i) => wellnessData.hrv.data[i]);
    const rhrRaw = wellnessData.dates.map((_, i) => wellnessData.rhr.data[i]);
    const sleepRaw = wellnessData.dates.map((_, i) => wellnessData.sleepDuration.data[i]);
    const sleepScoreRaw = wellnessData.dates.map((_, i) => wellnessData.sleepScore.data[i]);

    // Calcular Z-Scores adaptativos
    const hrvZ = adaptiveZScores(hrvRaw, adaptiveWindow);
    const rhrZ = adaptiveZScores(rhrRaw, adaptiveWindow);
    const sleepZ = adaptiveZScores(sleepRaw, adaptiveWindow);
    const sleepScoreZ = adaptiveZScores(sleepScoreRaw, adaptiveWindow);

    const zScoreData = {
        hrv: hrvZ,
        rhr: rhrZ,
        sleep: sleepZ,
        sleepScore: sleepScoreZ
    };

    // Optimizar umbral si se solicita
    let finalThreshold = userThreshold;
    if (shouldOptimize) {
        finalThreshold = optimizeThreshold(zScoreData);
    } else if (finalThreshold === null) {
        finalThreshold = 1.5; // Default
    }

    // Detectar bloques
    const blocks = detectDTFBlocks(zScoreData, finalThreshold, detectionWindow, minVariables);

    // Calcular estadísticas
    const stats = calculateDTFStats(blocks, wellnessData.dates);

    return {
        blocks,
        zScores: zScoreData,
        stats,
        threshold: finalThreshold,
        dates: wellnessData.dates
    };
}

/**
 * Calcula estadísticas de los bloques BPE detectados
 * @param {Array} blocks - Array de bloques
 * @param {Array} dates - Array de fechas
 * @returns {Object} - Estadísticas
 */
function calculateDTFStats(blocks, dates) {
    if (blocks.length === 0) {
        return {
            totalBlocks: 0,
            averageDuration: 0,
            averageIntensity: 0,
            typeDistribution: { fatigue: 0, recovery: 0, disruption: 0 },
            biomarcadoresActivos: []
        };
    }

    // Duración e intensidad promedio
    const avgDuration = mean(blocks.map(b => b.duration));
    const avgIntensity = mean(blocks.map(b => b.intensity));

    // Distribución de tipos
    const typeDistribution = {
        fatigue: blocks.filter(b => b.type === 'fatigue').length,
        recovery: blocks.filter(b => b.type === 'recovery').length,
        disruption: blocks.filter(b => b.type === 'disruption').length
    };

    // Biomarcadores más activos
    const biomarcadores = {};
    blocks.forEach(block => {
        block.activeVariables.forEach(v => {
            biomarcadores[v] = (biomarcadores[v] || 0) + 1;
        });
    });

    const biomarcadoresActivos = Object.entries(biomarcadores)
        .sort((a, b) => b[1] - a[1])
        .map(([name, count]) => ({ name, count }));

    return {
        totalBlocks: blocks.length,
        averageDuration: avgDuration,
        averageIntensity: avgIntensity,
        typeDistribution,
        biomarcadoresActivos
    };
}

/**
 * Convierte bloques a formato para visualización en Chart.js
 * @param {Array} blocks - Array de bloques BPE
 * @param {Array} dates - Array de fechas
 * @returns {Array} - Array de anotaciones para Chart.js
 */
export function blocksToChartAnnotations(blocks, dates) {
    const annotations = [];

    const typeColors = {
        fatigue: 'rgba(239, 68, 68, 0.15)',      // Rojo transparente
        recovery: 'rgba(16, 185, 129, 0.15)',    // Verde transparente
        disruption: 'rgba(245, 158, 11, 0.15)'   // Amarillo transparente
    };

    const typeBorders = {
        fatigue: 'rgba(239, 68, 68, 0.5)',
        recovery: 'rgba(16, 185, 129, 0.5)',
        disruption: 'rgba(245, 158, 11, 0.5)'
    };

    blocks.forEach((block, index) => {
        const startDate = dates[block.startIndex];
        const endDate = dates[block.endIndex];

        annotations.push({
            type: 'box',
            xMin: startDate,
            xMax: endDate,
            backgroundColor: typeColors[block.type],
            borderColor: typeBorders[block.type],
            borderWidth: 1,
            label: {
                display: false
            }
        });
    });

    return annotations;
}
