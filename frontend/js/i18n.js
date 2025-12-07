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
                dtf: 'DTF'
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
                    sleepQuality: 'Duración vs Calidad de Sueño',
                    rpeHrv: 'RPE vs HRV (Día Siguiente)'
                },
                axes: {
                    previousLoad: 'Carga Día Anterior (TSS)',
                    nextDayHRV: 'HRV Día Siguiente (ms)',
                    rpe: 'RPE (Esfuerzo Percibido)'
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
                    rpeHrvNegative: 'Correlación negativa RPE-HRV esperada: Mayor esfuerzo percibido reduce el HRV al día siguiente. Tu percepción del esfuerzo predice bien tu recuperación.',
                    rpeHrvWeak: 'Baja correlación RPE-HRV: Tu percepción del esfuerzo no predice bien la respuesta del HRV. Considera calibrar mejor tu escala de RPE.',
                    rpeHrvPositive: 'Correlación positiva RPE-HRV inusual: Mayor RPE asociado a mayor HRV. Podría indicar buena adaptación o subestimación del esfuerzo.',
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
                abbrev: 'Sueño',
                lastNight: 'Última Noche',
                average: 'Promedio (7d)',
                target: 'Objetivo',
                quality: 'Calidad',
                score: 'Puntuación'
            },

            // Sleep Score Card
            sleepScore: {
                title: 'Calidad del Sueño',
                abbrev: 'Calidad',
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

            // DTF del día
            dtfToday: {
                title: 'DTF del Día',
                detected: 'DTF detectado',
                notDetected: 'DTF no detectado',
                hint: 'Revisa la pestaña DTF para más detalles',
                allNormal: 'Todas las métricas dentro del rango normal'
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

            // HRV Coefficient of Variation
            hrvCV: {
                title: 'CV del HRV',
                subtitle: 'Coeficiente de Variación del RMSSD',
                current: 'CV Actual',
                average: 'CV Promedio (7d)',
                trend: 'Tendencia',
                interpretation: {
                    title: 'Interpretación del CV',
                    elite: 'Élite (2-7%)',
                    eliteDesc: 'Mayor estabilidad del sistema nervioso autónomo y mejor adaptación al entrenamiento.',
                    athletic: 'Atlético (7-12%)',
                    athleticDesc: 'Rango típico para atletas de nivel medio. Buena variabilidad.',
                    general: 'General (12-20%)',
                    generalDesc: 'Rango amplio de la población general.'
                },
                adaptation: {
                    action: 'Acción',
                    positive: {
                        title: 'Adaptación Positiva',
                        desc: 'El atleta está asimilando la carga de entrenamiento. El sistema nervioso autónomo es estable y resiliente.',
                        action: 'Se puede continuar con la progresión de carga planificada.'
                    },
                    functional: {
                        title: 'Fatiga Funcional',
                        desc: 'El cuerpo está bajo estrés agudo (p.ej., bloque de carga alta). Es una fatiga esperada y necesaria para la supercompensación.',
                        action: 'Monitorizar de cerca. Asegurar una recuperación adecuada (sueño, nutrición). Considerar un día de descanso o baja intensidad si la tendencia persiste.'
                    },
                    maladaptation: {
                        title: 'Mala Adaptación',
                        desc: 'El atleta no se está recuperando de la carga. Hay riesgo de sobreentrenamiento no funcional (NFO) o enfermedad. El sistema es inestable y la recuperación es impredecible.',
                        action: 'Reducir drásticamente la carga de entrenamiento. Priorizar la recuperación total. Investigar otros factores de estrés (sueño, nutrición, estrés mental).'
                    },
                    paradox: {
                        title: 'Señal Confusa / Paradoja',
                        desc: 'Podría indicar una respuesta parasimpática saturada o la influencia de un estresor no relacionado con el entrenamiento (enfermedad incipiente, estrés emocional). Aunque la HRV es alta, la inestabilidad (CV alto) es una señal de alerta.',
                        action: 'Investigar a fondo. Combinar con métricas subjetivas (cómo se siente el atleta) y otros datos objetivos.'
                    },
                    athletic: {
                        title: 'Estado Normal',
                        desc: 'Variabilidad dentro del rango atlético esperado.',
                        action: 'Continuar con el plan de entrenamiento actual.'
                    }
                },
                info: {
                    title: 'Coeficiente de Variación del HRV (CV-HRV)',
                    formula: 'CV (%) = (Desviación Estándar / Media) × 100',
                    formulaDesc: 'Se calcula usando el RMSSD sin normalizar (valores crudos en ms).',
                    reference: 'Valores de referencia en población atlética',
                    referenceStudy: 'Un estudio realizado en remeras universitarias de División I de la NCAA encontró valores medios de CV de rMSSD de 8.7% (±3.7%) durante mediciones en casa al despertar, y 8.4% (±4.4%) en mediciones antes del entrenamiento. Estos valores mostraron una correlación intraclase muy alta (ICC = 0.82), indicando alta reproducibilidad.',
                    ranges: 'Rangos típicos según nivel de condición física',
                    rangeElite: 'Atletas de élite o alto nivel: CV entre 2-7%',
                    rangeMid: 'Atletas de nivel medio o menor condición: CV entre 7-12%',
                    rangeGeneral: 'Población general: CV entre 12-20%',
                    performanceTitle: 'Interpretación según el rendimiento',
                    performanceDesc: 'Los valores más bajos de CV-HRV indican mayor estabilidad del sistema nervioso autónomo y mejor adaptación al entrenamiento. Las personas más jóvenes, sin enfermedades, con mejor composición corporal y mayor capacidad aeróbica tienden a situarse en el extremo inferior del rango (2-7%), mientras que individuos menos saludables presentan valores más altos.',
                    practicalTitle: 'Pasos Prácticos para la Implementación',
                    practical1Title: '1. Establecer la Línea Base',
                    practical1Desc: 'Durante un período de baja carga o descanso (1-2 semanas), mide diariamente la HRV para establecer el rMSSD promedio y el CV de HRV normal para el atleta. Este es su "rango óptimo".',
                    practical2Title: '2. Monitorizar la Tendencia Semanal',
                    practical2Desc: 'No reacciones a las fluctuaciones diarias. Analiza la media móvil de 7 días tanto para el rMSSD como para el CV. Un aumento en la carga de entrenamiento debería ir seguido de una respuesta en estas métricas.',
                    practical3Title: '3. Contextualizar los Datos',
                    practical3Desc: 'Un CV que aumenta no siempre se debe al entrenamiento. Considera siempre otros factores: calidad del sueño, estrés laboral/personal, viajes o una posible enfermedad.',
                    sources: 'Fuentes científicas',
                    source1: 'PMC - National Library of Medicine',
                    source2: 'Heads Up Health - HRV CV Tracking',
                    source3: 'Elite HRV - Improving Data Interpretation'
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

            // DTF System (Detección Temprana de Fatiga)
            dtf: {
                title: 'Detección Temprana de Fatiga (DTF)',
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
                noPatterns: 'No se detectaron patrones de fatiga en el período seleccionado',
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
                    variables: 'Variables Afectadas',
                    days: 'días',
                    period: 'Período'
                },
                showAll: 'Ver Todos',
                showLess: 'Ver Menos',
                timeline: 'Línea de Tiempo de Patrones',
                patternIntensity: 'Intensidad del Patrón',
                intensity: 'Intensidad (Z-Score)',
                info: {
                    tooltip: 'Más información sobre DTF',
                    title: '¿Qué es la Detección Temprana de Fatiga?',
                    what: 'El sistema DTF identifica períodos donde múltiples biomarcadores muestran desviaciones significativas simultáneas, indicando cambios en el estado fisiológico del atleta antes de que se manifiesten síntomas evidentes.',
                    how: 'El sistema analiza las variables usando Z-Scores adaptativos en ventanas móviles, detectando patrones que persisten durante varios días consecutivos.',
                    typesTitle: 'Tipos de Patrones',
                    fatigueDesc: 'HRV baja, frecuencia cardíaca elevada y sueño reducido. Indica acumulación de fatiga.',
                    recoveryDesc: 'HRV alta, frecuencia cardíaca baja y sueño de calidad. Indica recuperación óptima.',
                    disruptionDesc: 'Patrones mixtos o atípicos que no se clasifican claramente como fatiga o recuperación.',
                    intensityTitle: '¿Qué es la Intensidad?',
                    intensityDesc: 'La intensidad mide la magnitud de la desviación de tus biomarcadores respecto a tu baseline normal. Un valor de 1.0 significa una desviación estándar, 2.0 significa dos desviaciones. Valores más altos indican cambios más pronunciados que requieren mayor atención.',
                    interpretTitle: 'Cómo Interpretarlo',
                    interpret: 'Los bloques coloreados en el gráfico indican períodos donde se detectaron patrones. Cuanto mayor sea la intensidad, más importante es tomar medidas de recuperación.'
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
            load: 'Carga (TSS)',
            calendar: {
                title: 'Calendario de Actividades',
                today: 'Hoy',
                previous: 'Anterior',
                next: 'Siguiente',
                prevMonth: 'Mes anterior',
                nextMonth: 'Mes siguiente',
                month: 'Mes',
                week: 'Semana',
                monthView: 'Vista mensual',
                weekView: 'Vista semanal',
                completed: 'Completado',
                planned: 'Planificado',
                restDay: 'Día de descanso',
                noActivities: 'No hay actividades este día',
                activities: 'Actividades',
                workout: 'Entrenamiento',
                plannedWorkouts: 'Entrenamientos Planificados',
                completedActivities: 'Actividades Completadas',
                months: 'Enero,Febrero,Marzo,Abril,Mayo,Junio,Julio,Agosto,Septiembre,Octubre,Noviembre,Diciembre',
                days: 'Lun,Mar,Mié,Jue,Vie,Sáb,Dom',
                daysLong: 'Lunes,Martes,Miércoles,Jueves,Viernes,Sábado,Domingo'
            }
        },

        // Analysis tabs
        analysis: {
            loadAnalysis: 'Análisis de Carga',
            pdcAnalysis: 'Curva de Potencia',
            hrAnalysis: 'Frecuencia Cardíaca',
            performanceAnalysis: 'Análisis de Rendimiento'
        },

        // PDC (Power Duration Curve)
        pdc: {
            title: 'PDC',
            bestEfforts: 'Mejores Esfuerzos',
            power: 'Potencia',
            duration: 'Duración',
            watts: 'Vatios (W)',
            noData: 'No hay datos de potencia disponibles',
            realCurve: 'Datos Reales',
            modeledCurve: 'Curva Suavizada',
            selected: 'Selección',
            allTime: 'Histórico',
            periods: {
                '42d': 'Últimos 42 días',
                '90d': 'Últimos 90 días',
                '180d': 'Últimos 6 meses',
                '1y': 'Último año',
                'all': 'Todo el historial'
            },
            types: {
                ride: 'Ciclismo',
                virtualRide: 'Ciclismo Virtual',
                run: 'Carrera'
            }
        },

        // Training Zones
        zones: {
            title: 'Zonas de Entrenamiento',
            outdoor: 'Exterior (Ride)',
            indoor: 'Interior (VirtualRide)',
            noData: 'No hay zonas configuradas',
            power: 'Potencia',
            heartRate: 'Frecuencia Cardíaca',
            timeInZone: 'Tiempo en Zona',
            totalTime: 'Tiempo total',
            activities: 'actividades',
            selectDates: 'Selecciona las fechas',
            periods: {
                '7d': 'Últimos 7 días',
                '15d': 'Últimos 15 días',
                '30d': 'Últimos 30 días',
                '42d': 'Últimos 42 días',
                '90d': 'Últimos 90 días',
                'custom': 'Personalizado'
            }
        },

        // HR (Heart Rate Curves)
        hr: {
            title: 'Frecuencia Cardíaca',
            realCurve: 'Datos Reales',
            smoothedCurve: 'Curva Suavizada',
            bpm: 'Latidos por minuto (bpm)',
            maxHR: 'FC Máxima',
            lthr: 'Umbral Lactato (LTHR)',
            aerobicThreshold: 'Umbral Aeróbico',
            hrReserve: 'Reserva de FC',
            keyDurations: 'Duraciones Clave',
            hrZones: 'Zonas de Frecuencia Cardíaca',
            zonesAnalysis: 'Distribución por Zonas',
            distribution: 'Distribución',
            lagWarning: 'Nota: Los valores para duraciones < 30s no son representativos debido al lag de respuesta de la FC',
            zoneNames: {
                recovery: 'Recuperación Activa',
                endurance: 'Resistencia',
                tempo: 'Tempo',
                threshold: 'Umbral',
                vo2max: 'VO2 Máx',
                anaerobic: 'Anaeróbico'
            }
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
            locale: 'es-ES',
            na: 'N/A',
            loading: 'Cargando...',
            error: 'Error',
            success: 'Éxito',
            cancel: 'Cancelar',
            save: 'Guardar',
            close: 'Cerrar',
            apply: 'Aplicar',
            reset: 'Restablecer',
            expand: 'Expandir',
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
                dtf: 'EFD'
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
                    sleepQuality: 'Sleep Duration vs Sleep Quality',
                    rpeHrv: 'RPE vs HRV (Next Day)'
                },
                axes: {
                    previousLoad: 'Previous Day Load (TSS)',
                    nextDayHRV: 'Next Day HRV (ms)',
                    rpe: 'RPE (Perceived Exertion)'
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
                    rpeHrvNegative: 'Expected negative RPE-HRV correlation: Higher perceived exertion reduces next-day HRV. Your effort perception predicts recovery well.',
                    rpeHrvWeak: 'Low RPE-HRV correlation: Your effort perception does not predict HRV response well. Consider calibrating your RPE scale.',
                    rpeHrvPositive: 'Unusual positive RPE-HRV correlation: Higher RPE associated with higher HRV. Could indicate good adaptation or effort underestimation.',
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
                abbrev: 'Sleep',
                lastNight: 'Last Night',
                average: 'Average (7d)',
                target: 'Target',
                quality: 'Quality',
                score: 'Score'
            },

            // Sleep Score Card
            sleepScore: {
                title: 'Sleep Quality',
                abbrev: 'Quality',
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

            // DTF Today
            dtfToday: {
                title: 'Today\'s DTF',
                detected: 'DTF detected',
                notDetected: 'DTF not detected',
                hint: 'Check the DTF tab for more details',
                allNormal: 'All metrics within normal range'
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

            // HRV Coefficient of Variation
            hrvCV: {
                title: 'HRV CV',
                subtitle: 'RMSSD Coefficient of Variation',
                current: 'Current CV',
                average: 'Average CV (7d)',
                trend: 'Trend',
                interpretation: {
                    title: 'CV Interpretation',
                    elite: 'Elite (2-7%)',
                    eliteDesc: 'Greater autonomic nervous system stability and better training adaptation.',
                    athletic: 'Athletic (7-12%)',
                    athleticDesc: 'Typical range for mid-level athletes. Good variability.',
                    general: 'General (12-20%)',
                    generalDesc: 'Wide range for general population.'
                },
                adaptation: {
                    action: 'Action',
                    positive: {
                        title: 'Positive Adaptation',
                        desc: 'The athlete is assimilating the training load. The autonomic nervous system is stable and resilient.',
                        action: 'Continue with the planned load progression.'
                    },
                    functional: {
                        title: 'Functional Fatigue',
                        desc: 'The body is under acute stress (e.g., high load block). This is expected and necessary fatigue for supercompensation.',
                        action: 'Monitor closely. Ensure adequate recovery (sleep, nutrition). Consider a rest day or low intensity if the trend persists.'
                    },
                    maladaptation: {
                        title: 'Maladaptation',
                        desc: 'The athlete is not recovering from the load. There is risk of non-functional overtraining (NFO) or illness. The system is unstable and recovery is unpredictable.',
                        action: 'Drastically reduce training load. Prioritize total recovery. Investigate other stress factors (sleep, nutrition, mental stress).'
                    },
                    paradox: {
                        title: 'Confusing Signal / Paradox',
                        desc: 'Could indicate a saturated parasympathetic response or the influence of a non-training stressor (incipient illness, emotional stress). Although HRV is high, instability (high CV) is a warning sign.',
                        action: 'Investigate thoroughly. Combine with subjective metrics (how the athlete feels) and other objective data.'
                    },
                    athletic: {
                        title: 'Normal State',
                        desc: 'Variability within the expected athletic range.',
                        action: 'Continue with the current training plan.'
                    }
                },
                info: {
                    title: 'HRV Coefficient of Variation (CV-HRV)',
                    formula: 'CV (%) = (Standard Deviation / Mean) × 100',
                    formulaDesc: 'Calculated using raw RMSSD values (in ms, not normalized).',
                    reference: 'Reference values in athletic population',
                    referenceStudy: 'A study conducted on NCAA Division I female rowers found mean CV of rMSSD values of 8.7% (±3.7%) during home measurements upon waking, and 8.4% (±4.4%) in pre-training measurements. These values showed very high intraclass correlation (ICC = 0.82), indicating high reproducibility.',
                    ranges: 'Typical ranges by fitness level',
                    rangeElite: 'Elite or high-level athletes: CV between 2-7%',
                    rangeMid: 'Mid-level athletes or lower fitness: CV between 7-12%',
                    rangeGeneral: 'General population: CV between 12-20%',
                    performanceTitle: 'Performance interpretation',
                    performanceDesc: 'Lower CV-HRV values indicate greater autonomic nervous system stability and better training adaptation. Younger individuals without diseases, with better body composition and higher aerobic capacity tend to be at the lower end of the range (2-7%), while less healthy individuals show higher values.',
                    practicalTitle: 'Practical Implementation Steps',
                    practical1Title: '1. Establish Baseline',
                    practical1Desc: 'During a low load or rest period (1-2 weeks), measure HRV daily to establish the average rMSSD and normal HRV CV for the athlete. This is their "optimal range".',
                    practical2Title: '2. Monitor Weekly Trend',
                    practical2Desc: 'Do not react to daily fluctuations. Analyze the 7-day moving average for both rMSSD and CV. An increase in training load should be followed by a response in these metrics.',
                    practical3Title: '3. Contextualize Data',
                    practical3Desc: 'An increasing CV is not always due to training. Always consider other factors: sleep quality, work/personal stress, travel, or possible illness.',
                    sources: 'Scientific sources',
                    source1: 'PMC - National Library of Medicine',
                    source2: 'Heads Up Health - HRV CV Tracking',
                    source3: 'Elite HRV - Improving Data Interpretation'
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

            // DTF System (Early Fatigue Detection)
            dtf: {
                title: 'Early Fatigue Detection (EFD)',
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
                noPatterns: 'No fatigue patterns detected in selected period',
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
                    variables: 'Affected Variables',
                    days: 'days',
                    period: 'Period'
                },
                showAll: 'Show All',
                showLess: 'Show Less',
                timeline: 'Pattern Timeline',
                patternIntensity: 'Pattern Intensity',
                intensity: 'Intensity (Z-Score)',
                info: {
                    tooltip: 'More information about EFD',
                    title: 'What is Early Fatigue Detection?',
                    what: 'The EFD system identifies periods where multiple biomarkers show simultaneous significant deviations, indicating changes in the athlete\'s physiological state before obvious symptoms appear.',
                    how: 'The system analyzes variables using adaptive Z-Scores in rolling windows, detecting patterns that persist for several consecutive days.',
                    typesTitle: 'Pattern Types',
                    fatigueDesc: 'Low HRV, elevated heart rate and reduced sleep. Indicates fatigue accumulation.',
                    recoveryDesc: 'High HRV, low heart rate and quality sleep. Indicates optimal recovery.',
                    disruptionDesc: 'Mixed or atypical patterns that are not clearly classified as fatigue or recovery.',
                    intensityTitle: 'What is Intensity?',
                    intensityDesc: 'Intensity measures the magnitude of deviation of your biomarkers from your normal baseline. A value of 1.0 means one standard deviation, 2.0 means two deviations. Higher values indicate more pronounced changes that require greater attention.',
                    interpretTitle: 'How to Interpret',
                    interpret: 'Colored blocks on the chart indicate periods where patterns were detected. The higher the intensity, the more important it is to take recovery measures.'
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
            load: 'Load (TSS)',
            calendar: {
                title: 'Activity Calendar',
                today: 'Today',
                previous: 'Previous',
                next: 'Next',
                prevMonth: 'Previous month',
                nextMonth: 'Next month',
                month: 'Month',
                week: 'Week',
                monthView: 'Month view',
                weekView: 'Week view',
                completed: 'Completed',
                planned: 'Planned',
                restDay: 'Rest day',
                noActivities: 'No activities this day',
                activities: 'Activities',
                workout: 'Workout',
                plannedWorkouts: 'Planned Workouts',
                completedActivities: 'Completed Activities',
                months: 'January,February,March,April,May,June,July,August,September,October,November,December',
                days: 'Mon,Tue,Wed,Thu,Fri,Sat,Sun',
                daysLong: 'Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday'
            }
        },

        // Analysis tabs
        analysis: {
            loadAnalysis: 'Load Analysis',
            pdcAnalysis: 'Power Curve',
            hrAnalysis: 'Heart Rate',
            performanceAnalysis: 'Performance Analysis'
        },

        // PDC (Power Duration Curve)
        pdc: {
            title: 'PDC',
            bestEfforts: 'Best Efforts',
            power: 'Power',
            duration: 'Duration',
            watts: 'Watts (W)',
            noData: 'No power data available',
            realCurve: 'Real Data',
            modeledCurve: 'Smoothed Curve',
            selected: 'Selected',
            allTime: 'All Time',
            periods: {
                '42d': 'Last 42 days',
                '90d': 'Last 90 days',
                '180d': 'Last 6 months',
                '1y': 'Last year',
                'all': 'All time'
            },
            types: {
                ride: 'Cycling',
                virtualRide: 'Virtual Cycling',
                run: 'Running'
            }
        },

        // Training Zones
        zones: {
            title: 'Training Zones',
            outdoor: 'Outdoor (Ride)',
            indoor: 'Indoor (VirtualRide)',
            noData: 'No zones configured',
            power: 'Power',
            heartRate: 'Heart Rate',
            timeInZone: 'Time in Zone',
            totalTime: 'Total time',
            activities: 'activities',
            selectDates: 'Select dates',
            periods: {
                '7d': 'Last 7 days',
                '15d': 'Last 15 days',
                '30d': 'Last 30 days',
                '42d': 'Last 42 days',
                '90d': 'Last 90 days',
                'custom': 'Custom'
            }
        },

        // HR (Heart Rate Curves)
        hr: {
            title: 'Heart Rate',
            realCurve: 'Real Data',
            smoothedCurve: 'Smoothed Curve',
            bpm: 'Beats per minute (bpm)',
            maxHR: 'Max HR',
            lthr: 'Lactate Threshold (LTHR)',
            aerobicThreshold: 'Aerobic Threshold',
            hrReserve: 'HR Reserve',
            keyDurations: 'Key Durations',
            hrZones: 'Heart Rate Zones',
            zonesAnalysis: 'Zone Distribution',
            distribution: 'Distribution',
            lagWarning: 'Note: Values for durations < 30s are not representative due to HR response lag',
            zoneNames: {
                recovery: 'Active Recovery',
                endurance: 'Endurance',
                tempo: 'Tempo',
                threshold: 'Threshold',
                vo2max: 'VO2 Max',
                anaerobic: 'Anaerobic'
            }
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
            locale: 'en-US',
            na: 'N/A',
            loading: 'Loading...',
            error: 'Error',
            success: 'Success',
            cancel: 'Cancel',
            save: 'Save',
            close: 'Close',
            apply: 'Apply',
            reset: 'Reset',
            expand: 'Expand',
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
