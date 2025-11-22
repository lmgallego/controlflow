/**
 * Sistema de Internacionalización (i18n) para ControlFlow
 * Soporta Español e Inglés
 */

const translations = {
    es: {
        // Navigation
        nav: {
            athletes: 'Deportistas',
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
            daysShort: 'd',

            // Chart Actions
            chart: {
                fullscreen: 'Pantalla Completa',
                close: 'Cerrar',
                download: 'Descargar gráfico'
            },

            // Chart Labels
            charts: {
                sleepHours: 'Horas de Sueño',
                rollingAverage: 'Promedio Móvil',
                upperCI: 'IC Superior',
                lowerCI: 'IC Inferior'
            },

            // Tabs
            tabs: {
                metrics: 'Métricas',
                patterns: 'Patrones',
                bpe: 'BPE'
            },

            // Patterns Tab
            patterns: {
                title: 'Análisis de Patrones',
                subtitle: 'Correlaciones entre variables clave de rendimiento y recuperación',
                dataPoints: 'Puntos de datos',
                trendLine: 'Línea de tendencia',
                correlations: {
                    hrvRhr: 'HRV vs Frecuencia Cardíaca en Reposo',
                    hrvSleep: 'HRV vs Calidad de Sueño',
                    hrvSleepDuration: 'HRV vs Duración de Sueño',
                    hrvLoad: 'HRV vs Carga de Entrenamiento',
                    sleepQuality: 'Duración vs Calidad de Sueño'
                },
                axes: {
                    previousLoad: 'Carga Día Anterior (TSS)',
                    nextDayHRV: 'HRV Día Siguiente (ms)'
                },
                strength: {
                    strong: 'Correlación Fuerte',
                    moderate: 'Correlación Moderada',
                    weak: 'Correlación Débil',
                    veryWeak: 'Correlación Muy Débil',
                    none: 'Sin Correlación'
                },
                insights: {
                    title: 'Interpretación de Patrones',
                    hrvRhrNegative: 'Correlación negativa HRV-RHR: A mayor HRV, menor frecuencia cardíaca. Indicador positivo de buena recuperación.',
                    hrvRhrPositive: 'Correlación positiva HRV-RHR inusual: Podría indicar estrés o adaptación al entrenamiento.',
                    hrvSleepPositive: 'Buena calidad de sueño mejora tu HRV: Prioriza el descanso para optimizar la recuperación.',
                    hrvSleepDurationPositive: 'Más horas de sueño mejoran tu HRV: Intenta dormir consistentemente 7-9 horas.',
                    hrvLoadNegative: 'Correlación negativa HRV-Carga (día siguiente): El entrenamiento intenso reduce tu HRV al día siguiente. Asegura recuperación adecuada.',
                    hrvLoadPositive: 'Tu cuerpo se adapta bien al entrenamiento: El HRV del día siguiente se mantiene alto incluso con carga elevada.',
                    sleepQualityStrong: 'Fuerte relación entre duración y calidad del sueño: Dormir más horas mejora tu recuperación.',
                    sleepQualityWeak: 'Baja correlación duración-calidad: La calidad del sueño importa más que la cantidad.',
                    noSignificant: 'No se detectaron patrones significativos con los datos actuales.'
                }
            },

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
                range: 'Rango',
                abbrev: 'FCR (lpm)' // Frecuencia Cardíaca en Reposo (latidos por minuto)
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

            // HRV Z-Score Chart
            hrvZScore: {
                title: 'HRV Z-Score con Zonas de Preparación',
                zones: {
                    rest: 'REST (Z < -1.5)',
                    lit: 'LIT (-1.5 ≤ Z < -0.5)',
                    normal: 'NORMAL (-0.5 ≤ Z < 0.5)',
                    hiit: 'HIIT (Z ≥ 0.5)'
                }
            },

            // Readiness Card
            readiness: {
                title: 'PREPARACIÓN',
                recommended: 'Recomendado',
                levels: {
                    rest: 'DESCANSO',
                    lit: 'BAJA INTENSIDAD',
                    normal: 'INTENSIDAD NORMAL',
                    hiit: 'ALTA INTENSIDAD',
                    noData: 'SIN DATOS'
                },
                descriptions: {
                    rest: 'Tu cuerpo necesita recuperación. Evita entrenamientos intensos.',
                    lit: 'Tu recuperación está comprometida. Mantén la intensidad baja.',
                    normal: 'Estás listo para entrenamientos de intensidad moderada.',
                    hiit: 'Excelente estado de recuperación. Puedes entrenar a máxima intensidad.',
                    noData: 'No hay datos suficientes para evaluar tu preparación.'
                },
                intensities: {
                    rest: 'Descanso activo o día libre',
                    lit: 'Cardio ligero, yoga, movilidad',
                    normal: 'Entrenamiento de fuerza o cardio moderado',
                    hiit: 'HIIT, series de velocidad, entrenamiento de alta intensidad',
                    noData: 'N/A'
                },
                unusualChange: 'Cambio Inusual',
                unusualChangeDesc: {
                    mejora: 'Mejora significativa detectada',
                    caída: 'Caída significativa detectada'
                },
                noAnomalies: 'Sin cambios anómalos detectados'
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
                table: {
                    title: 'Bloques Detectados',
                    duration: 'Duración',
                    intensity: 'Intensidad',
                    variables: 'Variables',
                    days: 'días',
                    period: 'Período'
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

        // Athletes Panel
        athletes: {
            title: 'Deportistas',
            subtitle: 'Gestión de atletas',
            loading: 'Cargando deportistas...',
            error: 'Error al cargar deportistas.',
            noAthletes: 'No se encontraron deportistas',
            athleteId: 'ID',
            athleteName: 'Nombre',
            actions: 'Acciones',
            viewDetails: 'Ver detalles'
        },

        // Activities
        activities: {
            title: 'Actividades Recientes',
            loading: 'Cargando actividades...',
            error: 'Error al cargar actividades.',
            date: 'Fecha',
            name: 'Nombre',
            type: 'Tipo',
            time: 'Tiempo',
            distance: 'Distancia (km)',
            load: 'Carga (TSS)'
        },

        // Analysis tabs
        analysis: {
            loadAnalysis: 'Análisis de Carga',
            powerAnalysis: 'Análisis de Potencia',
            performanceAnalysis: 'Análisis de Rendimiento'
        },

        // PMC (Performance Management Chart)
        pmc: {
            title: 'Análisis de Carga',
            loading: 'Cargando análisis...',
            error: 'Error al cargar análisis',
            from: 'Desde',
            to: 'Hasta',
            years: 'años',
            anaerobic: '(Anaeróbico)',
            fitness: 'Fitness (CTL)',
            fatigue: 'Fatiga (ATL)',
            form: 'Forma (TSB)',
            ramp: 'Rampa',
            load: 'Carga',
            fitnessAndFatigue: 'Fitness y Fatiga',
            formChart: 'Forma (TSB)',
            rampChart: 'Rampa',
            tsbZones: 'Zonas TSB',
            zones: {
                risk: 'Alto Riesgo',
                optimal: 'Óptimo',
                gray: 'Zona Gris',
                fresh: 'Fresco',
                transition: 'Transición'
            },
            acwrChart: 'ACWR (Ratio Agudo:Crónico)',
            acwrZones: 'Zonas ACWR',
            currentTsbZone: 'Zona TSB Actual',
            currentAcwrZone: 'Zona ACWR Actual',
            acwr: {
                title: 'ACWR',
                detraining: 'Desentrenamiento (< 0.8)',
                safe: 'Zona Segura (0.8 - 1.3)',
                alert: 'Alerta (1.3 - 1.5)',
                danger: 'Peligro Sobreentrenamiento (> 1.5)'
            }
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
            athletes: 'Athletes',
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
            daysShort: 'd',

            // Chart Actions
            chart: {
                fullscreen: 'Fullscreen',
                close: 'Close',
                download: 'Download chart'
            },

            // Chart Labels
            charts: {
                sleepHours: 'Sleep Hours',
                rollingAverage: 'Rolling Average',
                upperCI: 'Upper CI',
                lowerCI: 'Lower CI'
            },

            // Tabs
            tabs: {
                metrics: 'Metrics',
                patterns: 'Patterns',
                bpe: 'SPB'
            },

            // Patterns Tab
            patterns: {
                title: 'Pattern Analysis',
                subtitle: 'Correlations between key performance and recovery variables',
                dataPoints: 'Data points',
                trendLine: 'Trend line',
                correlations: {
                    hrvRhr: 'HRV vs Resting Heart Rate',
                    hrvSleep: 'HRV vs Sleep Quality',
                    hrvSleepDuration: 'HRV vs Sleep Duration',
                    hrvLoad: 'HRV vs Training Load',
                    sleepQuality: 'Sleep Duration vs Sleep Quality'
                },
                axes: {
                    previousLoad: 'Previous Day Load (TSS)',
                    nextDayHRV: 'Next Day HRV (ms)'
                },
                strength: {
                    strong: 'Strong Correlation',
                    moderate: 'Moderate Correlation',
                    weak: 'Weak Correlation',
                    veryWeak: 'Very Weak Correlation',
                    none: 'No Correlation'
                },
                insights: {
                    title: 'Pattern Interpretation',
                    hrvRhrNegative: 'Negative HRV-RHR correlation: Higher HRV, lower heart rate. Positive indicator of good recovery.',
                    hrvRhrPositive: 'Unusual positive HRV-RHR correlation: Could indicate stress or training adaptation.',
                    hrvSleepPositive: 'Good sleep quality improves your HRV: Prioritize rest to optimize recovery.',
                    hrvSleepDurationPositive: 'More sleep hours improve your HRV: Try to consistently sleep 7-9 hours.',
                    hrvLoadNegative: 'Negative HRV-Load correlation (next day): Intense training reduces HRV the following day. Ensure adequate recovery.',
                    hrvLoadPositive: 'Your body adapts well to training: Next-day HRV remains high even with elevated load.',
                    sleepQualityStrong: 'Strong relationship between sleep duration and quality: More sleep hours improve your recovery.',
                    sleepQualityWeak: 'Low duration-quality correlation: Sleep quality matters more than quantity.',
                    noSignificant: 'No significant patterns detected with current data.'
                }
            },

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
                range: 'Range',
                abbrev: 'RHR (bpm)' // Resting Heart Rate (beats per minute)
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

            // HRV Z-Score Chart
            hrvZScore: {
                title: 'HRV Z-Score with Readiness Zones',
                zones: {
                    rest: 'REST (Z < -1.5)',
                    lit: 'LIT (-1.5 ≤ Z < -0.5)',
                    normal: 'NORMAL (-0.5 ≤ Z < 0.5)',
                    hiit: 'HIIT (Z ≥ 0.5)'
                }
            },

            // Readiness Card
            readiness: {
                title: 'READINESS',
                recommended: 'Recommended',
                levels: {
                    rest: 'REST',
                    lit: 'LOW INTENSITY',
                    normal: 'NORMAL INTENSITY',
                    hiit: 'HIGH INTENSITY',
                    noData: 'NO DATA'
                },
                descriptions: {
                    rest: 'Your body needs recovery. Avoid intense workouts.',
                    lit: 'Your recovery is compromised. Keep intensity low.',
                    normal: 'You are ready for moderate intensity workouts.',
                    hiit: 'Excellent recovery state. You can train at maximum intensity.',
                    noData: 'Insufficient data to assess your readiness.'
                },
                intensities: {
                    rest: 'Active rest or day off',
                    lit: 'Light cardio, yoga, mobility',
                    normal: 'Strength training or moderate cardio',
                    hiit: 'HIIT, speed intervals, high-intensity training',
                    noData: 'N/A'
                },
                unusualChange: 'Unusual Change',
                unusualChangeDesc: {
                    mejora: 'Significant improvement detected',
                    caída: 'Significant drop detected'
                },
                noAnomalies: 'No anomalous changes detected'
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
                table: {
                    title: 'Detected Blocks',
                    duration: 'Duration',
                    intensity: 'Intensity',
                    variables: 'Variables',
                    days: 'days',
                    period: 'Period'
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

        // Athletes Panel
        athletes: {
            title: 'Athletes',
            subtitle: 'Athlete management',
            loading: 'Loading athletes...',
            error: 'Error loading athletes.',
            noAthletes: 'No athletes found',
            athleteId: 'ID',
            athleteName: 'Name',
            actions: 'Actions',
            viewDetails: 'View details'
        },

        // Activities
        activities: {
            title: 'Recent Activities',
            loading: 'Loading activities...',
            error: 'Error loading activities.',
            date: 'Date',
            name: 'Name',
            type: 'Type',
            time: 'Time',
            distance: 'Distance (km)',
            load: 'Load (TSS)'
        },

        // Analysis tabs
        analysis: {
            loadAnalysis: 'Load Analysis',
            powerAnalysis: 'Power Analysis',
            performanceAnalysis: 'Performance Analysis'
        },

        // PMC (Performance Management Chart)
        pmc: {
            title: 'Load Analysis',
            loading: 'Loading analysis...',
            error: 'Error loading analysis',
            from: 'From',
            to: 'To',
            years: 'years',
            anaerobic: '(Anaerobic)',
            fitness: 'Fitness (CTL)',
            fatigue: 'Fatigue (ATL)',
            form: 'Form (TSB)',
            ramp: 'Ramp',
            load: 'Load',
            fitnessAndFatigue: 'Fitness and Fatigue',
            formChart: 'Form (TSB)',
            rampChart: 'Ramp',
            tsbZones: 'TSB Zones',
            zones: {
                risk: 'High Risk',
                optimal: 'Optimal',
                gray: 'Gray Zone',
                fresh: 'Freshness',
                transition: 'Transition'
            },
            acwrChart: 'ACWR (Acute:Chronic Workload Ratio)',
            acwrZones: 'ACWR Zones',
            currentTsbZone: 'Current TSB Zone',
            currentAcwrZone: 'Current ACWR Zone',
            acwr: {
                title: 'ACWR',
                detraining: 'Detraining (< 0.8)',
                safe: 'Safe Zone (0.8 - 1.3)',
                alert: 'Alert (1.3 - 1.5)',
                danger: 'Overtraining Risk (> 1.5)'
            }
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
