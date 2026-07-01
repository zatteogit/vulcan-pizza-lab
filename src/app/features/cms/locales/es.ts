import type { CmsContent } from "../cms-context";
import { STYLE_PHOTOS } from "../../../data/style-photos";
import {
  PRE_FERMENT_ES,
  DIETARY_ES,
  TROUBLESHOOTING_ES,
  GLOSSARY_TERMS_ES,
} from "./domain-es";

/** Spanish locale bundle */
export const ES_LOCALE: CmsContent = {
  locale: {
    id: "es",
    name: "Espa\u00F1ol",
  },
  ui: {
    copy: "Copiar",
    copied: "\u00A1Copiado!",
    share: "Compartir",
    back: "Volver",
    reset: "Reiniciar",
    close: "Cerrar",
    closeDetails: "Cerrar detalles",
    closeInsight: "Cerrar",
    modify: "Editar",
    disable: "Desactivar",
    restore: "Restaurar",
    generate: "Generar receta",
    chooseStyle: "Elegir estilo",
    customizeParams: "Personalizar par\u00E1metros",
    changeStyle: "Cambiar estilo",
    newPizza: "Nueva pizza",
    ingredients: "Ingredientes",
    procedure: "Procedimiento",
    steps_count: "{n} pasos",
    doughBalls: "Bollos",
    timeline: "Cronograma",
    doughBallsFrom: "de {w} cada uno",
    totalDough: "total",
    startTime: "Inicio",
    endTime: "Fin",
    clipboardTitle: "{style} \u2014 Vulcan Pizza Lab",
    clipboardBalls: "{n} bollos de {w}",
    clipboardTotal: "Total: {g}",
    clipboardProcedure: "{style} \u2014 Procedimiento",
    flour: "Harina",
    flourMix: "mezcla de harinas",
    flourEffectiveGluten: "fuerza glutínica efectiva",
    water: "Agua",
    salt: "Sal",
    sugar: "Az\u00FAcar",
    oilEvo: "Aceite de oliva",
    compTitle: "Ajustes",
    compTitleNerd: "Compensaciones del horno",
    compHydration:
      "Mayor hidrataci\u00F3n para compensar tu horno",
    compOil:
      "Un poco m\u00E1s de aceite para mantener la pizza suave",
    compSugar: "M\u00E1s az\u00FAcar para un buen dorado",
    compCookTime:
      "Tiempo de cocci\u00F3n m\u00E1s largo para un resultado perfecto",
    compThickness:
      "Estiramiento m\u00E1s fino para una cocci\u00F3n uniforme",
    compDefault:
      "Par\u00E1metro ajustado a tu configuraci\u00F3n",
    bakeAdjustmentTitle: "Cocción",
    relativeToBase: "respecto a la base",
    ariaReduceBalls: "Reducir bollos",
    ariaAddBalls: "Aumentar bollos",
    ariaEarlier: "Empezar antes",
    ariaLater: "Empezar m\u00E1s tarde",
    statHydration: "Hidrataci\u00F3n",
    statOven: "Horno",
    statCookTime: "Cocci\u00F3n",
    statFermentation: "Fermentaci\u00F3n",
    statTempSuffix: "a {t}\u00B0C",
    nerdTitle: "Datos t\u00E9cnicos",
    nerdFlourW: "Harina W",
    nerdPL: "P/L",
    nerdYeast: "Levadura",
    nerdHoursAt18: "Hrs @{refTemp}",
    nerdQ10: "Velocidad vs {refTemp}",
    nerdAw: "Aw",
    seconds: "segundos",
    minutes: "minutos",
    minute: "minuto",
    hours: "horas",
    hour: "hora",
    recipeScore: "Match",
    nerdToggle: "PizzaNerd",
    nerdActive: "Activar PizzaNerd",
    scienceTitle: "Vulcan Science",
    ariaCloseScores: "Cerrar panel de puntuaciones",
    ariaViewScores: "Ver detalles de puntuaci\u00F3n",
    tapForDetails: "Toca para detalles",
    styleEditorActive: "Style Editor activo",
    cmsActive: "CMS activo",
    fieldsModified: "campos modificados",
    fieldModified: "campo modificado",
    editOven: "Editar horno",
    weatherCity: "Tu ciudad",
    weatherOutdoor: "{t}\u00B0C fuera",
    weatherKitchen: "Temperatura cocina",
    badgeIdeal: "Más rápido",
    badgeRecent: "RECIENTE",
    autoLabel: "Auto",
    cancel: "Cancelar",
    changeOven: "Cambiar",
    ovenFallback: "Horno",
    pantryFlours: "Harinas",
    pantryYeasts: "Levaduras",
    equipByHand: "A mano",
    equipMixer: "Amasadora",
    equipStone: "Piedra refractaria",
    equipSteel: "Plancha de acero",
    equipPan: "Bandeja",
    equipKneading: "Amasado",
    equipSurface: "Superficie de cocción",
    kitchenTitle: "Tu cocina",
    pantryOptional: "opcional",
    specialFlours: "Harinas especiales",
    brandSuggest: "¿Conoces la marca?",
    badgeSelected: "Seleccionada",
    otherCompatibleFlours: "Otras harinas compatibles",
    flourSelectHint:
      "Selecciona una harina para actualizar automáticamente W y P/L de la receta.",
    flourSelected: "Aplicada",
    autolysisSuggested: "Autólisis recomendada",
    dietGlutenFree: "Sin gluten",
    dietLactoseFree: "Sin lactosa",
    dietVegan: "Vegano",
    dietLowFodmap: "Bajo en FODMAP",
    dietHistamine: "Baja histamina",
    dietNickel: "Bajo en níquel",
  },
  tips: {
    kitchenTemp:
      "La temperatura de la cocina influye en la velocidad de fermentación. El motor adapta automáticamente tiempos y cantidades.",
    timeSlot:
      "La temperatura de la cocina afecta los tiempos de fermentaci\u00F3n. Cuanto m\u00E1s tiempo tengas, m\u00E1s opciones para masas ligeras y digestivas.",
    skill:
      "Ajustaremos la complejidad de la receta a tu nivel de experiencia.",
    equipment:
      "Una piedra o plancha cambian la corteza. La bandeja es esencial para estilos como Teglia Romana o Detroit.",
    oven: "La temperatura m\u00E1xima de tu horno determina qu\u00E9 estilos puedes replicar en casa.",
    pantry:
      "Adaptaremos la receta a tu despensa real: harina compatible y tipo de levadura.",
  },
  hero: {
    title_line1: "Tu",
    title_line2: "pizza perfecta.",
    subtitle:
      "Cu\u00E9ntanos qu\u00E9 tienes y te guiaremos hacia el estilo ideal.",
  },
  steps: {
    context: {
      number: "01 \u2014 Contexto",
      title: "Cu\u00E1ndo y d\u00F3nde",
      subtitle: "Tiempo, temperatura, ambiente",
    },
    setup: {
      number: "02 \u2014 Setup",
      title: "Tu cocina",
      subtitle: "Herramientas, experiencia, despensa",
    },
    styles: {
      number: "03 \u2014 Estilo",
      title: "Elige tu estilo",
      subtitle: "Seleccionados para ti",
    },
  },
  sections: {
    when: {
      title: "\u00BFCu\u00E1ndo quieres pizza?",
      description:
        "Selecciona el momento para calcular los tiempos de fermentaci\u00F3n",
    },
    skill: {
      title: "Nivel de experiencia",
      description:
        "Nos ayuda a calibrar la complejidad de las recetas",
    },
    oven: {
      title: "Tu horno",
      description: "Tipo y temperatura m\u00E1xima",
    },
    pantry: {
      title: "Despensa",
      description: "Harinas y levaduras que tienes en casa",
    },
    dietary: {
      title: "Necesidades diet\u00E9ticas",
      description: "Filtros opcionales",
    },
    equipment: {
      title: "Equipamiento",
      description: "Lo que tienes en tu cocina",
    },
  },
  timeSlots: {
    tonight: {
      label: "Esta noche",
      sublabel: "4\u20136 horas",
      emoji: "\u{1F319}",
      hours: 5,
    },
    tomorrow_lunch: {
      label: "Ma\u00F1ana al almuerzo",
      sublabel: "16\u201320 horas",
      emoji: "\u2600\uFE0F",
      hours: 18,
    },
    tomorrow_dinner: {
      label: "Ma\u00F1ana cena",
      sublabel: "24\u201328 horas",
      emoji: "\u{1F306}",
      hours: 26,
    },
    day_after: {
      label: "Pasado ma\u00F1ana",
      sublabel: "40\u201348 horas",
      emoji: "\u{1F4C5}",
      hours: 44,
    },
    weekend: {
      label: "Fin de semana",
      sublabel: "72+ horas",
      emoji: "\u{1F389}",
      hours: 72,
    },
  },
  ovenPresets: {
    home: {
      name: "Horno Dom\u00E9stico",
      maxTemp: 250,
      icon: "home",
    },
    electric_standard: {
      name: "El\u00E9ctrico Est\u00E1ndar",
      maxTemp: 300,
      icon: "zap",
    },
    gas: {
      name: "Gas Profesional",
      maxTemp: 350,
      icon: "flame",
    },
    electric_high: {
      name: "El\u00E9ctrico alta temperatura",
      maxTemp: 450,
      icon: "thermometer",
    },
    wood: {
      name: "Horno de Le\u00F1a",
      maxTemp: 500,
      icon: "flame-kindling",
    },
  },
  skillLevels: {
    "1": {
      name: "Principiante",
      description: "Primeras experiencias haciendo pizza",
    },
    "2": {
      name: "Intermedio",
      description: "He hecho pizza varias veces",
    },
    "3": {
      name: "Avanzado",
      description:
        "Conozco las t\u00E9cnicas y par\u00E1metros",
    },
    "4": {
      name: "Experto",
      description: "Dominio completo de las t\u00E9cnicas",
    },
  },
  families: {
    napoletana: {
      name: "Napolitana",
      description:
        "Ligereza, fermentaci\u00F3n natural, cocci\u00F3n r\u00E1pida a temperatura extrema",
      emoji: "\u{1F1EE}\u{1F1F9}",
    },
    romana: {
      name: "Romana",
      description:
        "Desde la crujencia extrema de la Scrocchiarella a la alta hidrataci\u00F3n de la Teglia",
      emoji: "\u{1F3DB}\uFE0F",
    },
    americana: {
      name: "Americana",
      description:
        "Adaptaci\u00F3n italo-americana: practicidad, street food, variedad regional",
      emoji: "\u{1F5FD}",
    },
    contemporanea: {
      name: "Contempor\u00E1nea",
      description:
        "Digestibilidad, experimentaci\u00F3n, alta hidrataci\u00F3n, t\u00E9cnicas avanzadas",
      emoji: "\u{1F52C}",
    },
  },
  allFamiliesLabel: "Todas las familias",
  tiers: {
    perfect: {
      label: "Perfectos",
      subtitle: "m\u00E1xima compatibilidad",
    },
    good: { label: "Buenos", subtitle: "gran elecci\u00F3n" },
    challenging: {
      label: "Desafiantes",
      subtitle: "para los atrevidos",
    },
  },
  scoreDimensions: {
    authenticity: {
      label: "Autenticidad",
      short: "Aut",
      weight: 0.3,
    },
    feasibility: {
      label: "Viabilidad",
      short: "Via",
      weight: 0.25,
    },
    digestibility: {
      label: "Digestibilidad",
      short: "Dig",
      weight: 0.2,
    },
    sustainability: {
      label: "Sostenibilidad",
      short: "Sos",
      weight: 0.15,
    },
    experimentation: {
      label: "Experimentaci\u00F3n",
      short: "Exp",
      weight: 0.1,
    },
  },
  recommendationWeights: {
    time: 0.25,
    oven: 0.25,
    skill: 0.2,
    equipment: 0.1,
    pantry: 0.2,
  },
  media: {
    stylePhotos: STYLE_PHOTOS,
    fallbackPhoto:
      "https://images.unsplash.com/photo-1717883235373-ef10b2a745a3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600&q=80",
  },
  result: {
    breadcrumb: "Tu pizza perfecta",
    heading: "Aqu\u00ED est\u00E1 tu receta",
    backLabel: "Volver a la selecci\u00F3n",
  },
  misc: {
    showAllStyles: "Mostrar todas",
    noFloursInCategory: "No hay harinas en esta categoría",
    noTroubleshootingResults: "No se encontraron problemas para esta búsqueda",
    moreInfo: "Más información",
    changeTiming: "Cambiar el momento",
    kitchenTempSubtitle: "La temperatura influye en la velocidad de fermentación",
    techAdjustmentsApplied: "Ajustes técnicos aplicados",
    techDataAria: "Mostrar datos técnicos (W, P/L, Q10, Aw)",
    techDataTitle: "Mostrar datos técnicos para expertos (W harina, P/L, Q₁₀, Aw...)",
    feedbackYes: "Sí, con gusto",
    feedbackNo: "No, así está bien",
    feedbackPlaceholder: "¿Qué cambiaste? ¿Cómo quedó? Detalles útiles...",
    preFermentCompare: "Comparación rápida",
    scoreExplainer: "No es una nota a la receta — es cuánto se acerca tu versión configurada al máximo \"perfecto\" para este estilo.",
    companionContext: "La temperatura de la cocina y el tiempo disponible guían todo el proceso.",
    companionSetup: "Adaptamos la receta a tu experiencia, tu horno y tu despensa real.",
    companionStyles: "Cada estilo tiene parámetros únicos: elige el que mejor se adapte a tus condiciones.",
    smartLinkOn: "Parámetros vinculados — mueve un control y los demás se ajustan",
    smartLinkOff: "Vincula todos los parámetros para ajuste automático",
    smartLinkApplied: "{param}: he realineado los demás parámetros y la cronología.",
    settingsHelp: "Estos datos ayudan a Vulcan a adaptar los tiempos y la receta.",
    versionsLabel: "Versiones",
    versionsHint: "Interpretaciones de este estilo, cada una con sus rangos de parámetros. La versión activa determina qué está \"en rango\" en los controles.",
    learnHeroTitle1: "Conviértete en el pizzaiolo",
    learnHeroTitle2: "de tu casa.",
    learnHeroSubtitle: "Pequeñas cosas, bien entendidas, cambian cada masa. Empieza aquí.",
    learnResources: "Recursos",
    kitchenTempLabel: "Temperatura de la cocina",
    kitchenTempDown: "Bajar la temperatura de la cocina",
    kitchenTempUp: "Subir la temperatura de la cocina",
    current: "Seleccionado",
    noStyleInFamily: "Ningún estilo de esta familia para tus parámetros.",
    notFeasibleExplainer: "Estos estilos requieren cosas que aún no tienes (p. ej. horno de leña, mucha experiencia, equipo profesional). Están aquí por transparencia — toca para ver qué haría falta.",
    exploreHeroTitle1: "Explora estilos",
    exploreHeroTitle2: "y recetas.",
    exploreSectionTraditional: "Estilos tradicionales",
    badgeBeginnerFriendly: "Principiantes",
    interpretationsLabel: "Interpretaciones",
    goToSite: "Ir al sitio",
    signatureLabel: "Firma",
    noSignature: "sin firma",
    fineParams: "Parámetros finos",
    cmsRestoreContent: "Restaurar contenido del CMS",
  },
  feedback: {
    savedTitle: "Comentarios guardados — ¡gracias!",
    savedBody: "Tus datos ayudan a calibrar el motor. Puedes analizarlos en DevTools → Engine Lab.",
    nextTimeTitle: "La próxima vez",
    triedQuestion: "¿Probaste esta receta?",
    triedSubtitle: "Tus comentarios ayudan a calibrar el motor de Vulcan.",
    success: "Salió bien",
    fail: "No salió",
    detailedPrompt: "¡Gracias! ¿Te animas a dejar comentarios detallados?",
    detailedSubtitle: "Nos ayudará a calibrar las puntuaciones de viabilidad y digestibilidad de este estilo.",
    detailedTitle: "Comentarios detallados",
    recipeSuccess: "Receta lograda",
    recipeFail: "Receta fallida",
    ratingOverall: "Valoración general",
    ratingTaste: "Sabor",
    ratingTexture: "Textura / alveolado",
    ratingDifficulty: "Dificultad",
    ratingDifficultyHint: "1=fácil, 5=imposible",
    ratingAuth: "Qué tan auténtica parece",
    ratingAuthHint: "calibra el A-Score",
    ratingDig: "Qué tan digerible fue",
    ratingDigHint: "calibra el D-Score",
    issuesLabel: "Problemas detectados",
    notesLabel: "Notas",
    submit: "Enviar comentarios",
  },
  yeastLabels: {
    fresh: "Levadura fresca",
    dry: "Levadura seca",
    sourdough: "Masa madre",
  },
  yeastDetails: {
    fresh: "Cubo cl\u00E1sico",
    dry: "Pr\u00E1ctica, larga conservaci\u00F3n",
    sourdough: "Sabor complejo, larga maduraci\u00F3n",
  },
  flourLabels: {
    "00": "Harina 00",
    "0": "Harina 0",
    manitoba: "Manitoba (fuerza)",
    integrale: "Integral",
    semola: "S\u00E9mola",
  },
  flourDetails: {
    "00": "Cl\u00E1sica, vers\u00E1til",
    "0": "Fuerza media",
    manitoba: "Alta fuerza, larga maduraci\u00F3n",
    integrale: "M\u00E1s fibra y sabor",
    semola: "Crujiente, color dorado",
  },
  filters: {
    advancedLabel: "M\u00E1s",
    removeFilters: "Quitar filtros",
    brandedFlours: "Harinas de marca",
    settingsOpen: "Ajustes",
    settingsClosed: "Tus ajustes",
    hydrationLabel: "💧 Hidratación",
    hydrationLow: "Baja <60%",
    hydrationMedium: "Media 60-70%",
    hydrationHigh: "Alta 70-85%",
    hydrationExtreme: "Extrema >85%",
    textureLabel: "🎯 Textura",
    textureCrispyThin: "Fina crujiente",
    textureThickAiry: "Alta esponjosa",
    textureAiryCrumb: "Alveolada",
    textureDeepDish: "Deep dish",
    skillLabel: "👨‍🍳 Nivel",
    skillBeginner: "Principiante",
    skillIntermediate: "Intermedio",
    skillAdvanced: "Avanzado",
    skillExpert: "Experto",
    timeFast: "rápido",
    ovenLabel: "🔥 Cocción",
    ovenHome: "Horno casero",
    ovenWood: "Leña",
    ovenElectricHigh: "Eléctrico >350°C",
    ovenPan: "Sart\u00E9n",
  },
  glossary: {
    pageTitle: "Glosario T\u00E9cnico",
    searchPlaceholder:
      "Buscar t\u00E9rmino, s\u00EDmbolo o definici\u00F3n...",
    cancelSearch: "Borrar",
    noResults: 'No se encontraron t\u00E9rminos para "{query}"',
    allCategories: "Todos",
    formulaLabel: "F\u00F3rmula",
    rangesLabel: "Rangos t\u00EDpicos",
    whyImportantLabel: "Por qu\u00E9 importa",
    relatedLabel: "Relacionados",
    backToHome: "Volver al inicio",
    termCount: "{count} t\u00E9rminos",
    catRheology: "Reolog\u00EDa",
    catRheologyDesc:
      "Propiedades mec\u00E1nicas de la harina y la masa",
    catFermentation: "Fermentaci\u00F3n",
    catFermentationDesc:
      "Leudado, maduraci\u00F3n y procesos biol\u00F3gicos",
    catThermal: "T\u00E9rmica",
    catThermalDesc: "Transferencia de calor y cocci\u00F3n",
    catChemistry: "Qu\u00EDmica",
    catChemistryDesc:
      "Composici\u00F3n y reacciones qu\u00EDmicas",
    catMechanics: "Mec\u00E1nica",
    catMechanicsDesc: "Procesamiento, equipos y medidas",
    catScoring: "Puntajes",
    catScoringDesc: "M\u00E9tricas de calidad Vulcan",
  },
  engineMessages: {
    "auth.hydrationOff":
      "Hidratación fuera de centro (-{penalty}%)",
    "auth.wOutOfRange":
      "W de harina fuera de rango (-{penalty}%)",
    "auth.plOutOfRange":
      "P/L {pl} fuera de rango {plMin}-{plMax} (-{penalty}%)",
    "auth.notWoodOven": "No es horno de leña (-15%)",
    "auth.tempVsIdeal":
      "Temperatura {temp} vs {ideal} (-{penalty}%)",
    "auth.tempBelowMin":
      "Temperatura bajo el mínimo (-{penalty}%)",
    "auth.fermentTooShort":
      "Fermentación demasiado corta (-{penalty}%)",
    "auth.fermentTooLong":
      "Fermentación demasiado larga (-{penalty}%)",
    "feas.ovenSuboptimal":
      "Horno sub-óptimo: {temp} vs ideal {ideal}",
    "feas.ovenTooCold":
      "Horno demasiado frío: {temp} < mínimo {min}",
    "feas.wTooLow": "W demasiado bajo: {w} < {wMin}",
    "feas.wTooHigh": "W muy alto ({w}). Masa tenaz.",
    "feas.hydrationBeginnerHigh":
      "Hidratación >75% no recomendada para principiantes",
    "feas.hydrationNeedsPractice":
      "La hidratación alta requiere práctica",
    "feas.hydrationMedBeginner":
      "Hidratación media-alta para principiante",
    "feas.flourTooWeakForHydration":
      "Harina demasiado débil para esta hidratación",
    "feas.prefermentNeedsExperience":
      "Pre-fermento requiere experiencia",
    "dig.fermentTooShort":
      "Fermentación demasiado corta: almidones no degradados",
    "dig.fermentShort":
      "Fermentación corta: digestibilidad limitada",
    "dig.fodmapReduced": "FODMAPs reducidos ~{pct}%",
    "dig.fodmapHighReduction": "FODMAPs reducidos >80%",
    "dig.extremeMaturation":
      "Maduración extrema: máxima complejidad aromática",
    "dig.highYeastDosage":
      "Dosificación alta de levadura ({pct}%): -{penalty}% digestibilidad",
    "dig.coldFermentation":
      "Fermentación fría: actividad enzimática óptima",
    "sust.quickCook": "Cocción rápida: bajo consumo energético",
    "sust.longCook": "Cocción larga: alto consumo energético",
    "sust.ambientFerment":
      "Fermentación a temperatura ambiente: sin gasto de frigorífico",
    "sust.pureDough":
      "Masa pura: solo harina, agua, sal, levadura",
    "sust.sourdoughZeroImpact":
      "Masa madre: autoproducida, impacto cero",
    "rec.timeCompatible":
      "Fermentación {fMin}-{fMax}h: compatible con tu tiempo",
    "rec.timeAdaptable": "Fermentación adaptable a ~{hours}h",
    "rec.timeInsufficient":
      "Requiere mínimo {fMin}h, tienes {available}h",
    "rec.needsWoodOven": "Requiere horno de leña",
    "rec.ovenIdeal":
      "Tu horno alcanza la temperatura ideal ({ideal})",
    "rec.ovenAdequate":
      "Horno adecuado (compensación automática tiempo/temperatura)",
    "rec.ovenTooCold":
      "Horno demasiado frío: {temp} < min {min}",
    "rec.skillMatch": "Adecuado a tu nivel",
    "rec.skillExpert": "Tu nivel permite cualquier estilo",
    "rec.hydrationNeedsPractice":
      "La hidratación alta requiere práctica",
    "rec.advancedForBeginner":
      "Estilo avanzado para principiantes",
    "rec.noKneadNoMixer": "No necesitas amasadora (no-knead)",
    "rec.handsHighHydration":
      "Hidratación alta: amasado a mano muy difícil",
    "rec.handsMedHydration":
      "Hidratación media-alta: amasado a mano requiere práctica",
    "rec.forkIdealHighH":
      "Amasadora de horquilla ideal para alta hidratación",
    "rec.forkLowFriction":
      "Amasadora de horquilla: bajo rozamiento térmico",
    "rec.spiralOptimal": "Espiral profesional: amasado óptimo",
    "rec.domesticStrugglesHighH":
      "Amasadora doméstica: puede fallar con hidratación >80%",
    "rec.mixerHelps": "Tu amasadora facilita el proceso",
    "rec.mixerRecommended":
      "Hidratación alta: amasadora recomendada",
    "rec.castIronPerfect":
      "Hierro fundido perfecto para este estilo",
    "rec.panFits": "Bandeja adecuada para este estilo",
    "rec.needsPan": "Se necesita bandeja para este estilo",
    "rec.refractoryIdeal":
      "Piedra refractaria: ideal para la napolitana",
    "rec.steelPlateCrispy":
      "Placa de acero: base crujiente en segundos",
    "rec.panPerfect": "Tu bandeja es perfecta para este estilo",
    "rec.flourMatch": "Harina en despensa compatible",
    "rec.flourPartial":
      "Harina parcialmente adecuada (W no ideal)",
    "rec.flourNoMatch":
      "Ninguna harina en despensa en el rango W requerido",
    "rec.sourdoughLongFerment":
      "Masa madre ideal para maduración larga",
    "rec.sourdoughOnlyShort":
      "Solo masa madre: fermentación corta difícil",
    "tip.waterTempCold":
      "Regla del 55: usa agua de la nevera ({temp}). El amasado a máquina calienta la masa.",
    "tip.waterTempNormal":
      "Regla del 55: usa agua a {temp} para alcanzar {ddt} de masa.",
    "tip.frictionNote":
      "Compensación por fricción de la amasadora: {friction}",
    "tip.waterTemp": "",
    "hint.flourWeak": "harina floja (00 clásica)",
    "hint.flourMedium": "harina de fuerza media",
    "hint.flourStrong": "harina de fuerza (para pizza)",
    "hint.flourVeryStrong": "harina muy fuerte (manitoba)",
    "hint.yeastDryPinch": "≈ una pizca",
    "hint.yeastDryQuarterTsp": "≈ ¼ de cucharadita",
    "hint.yeastDryHalfTsp": "≈ ½ cucharadita",
    "hint.yeastDryOneTsp": "≈ 1 cucharadita rasa",
    "hint.yeastFreshSmall": "≈ medio garbanzo",
    "hint.yeastFreshMedium": "≈ un garbanzo",
    "hint.yeastFreshLarge": "≈ una avellana",
    "serving.peopleOne": "≈ {n} persona",
    "serving.peopleMany": "≈ {n} personas",
    "serving.peopleRange": "≈ {min}-{max} personas",
    "topping.auth.canonical": "Reglamentario",
    "topping.auth.natural": "Tradicional",
    "topping.auth.common": "Alternativa",
    "topping.auth.experimental": "Por probar",
    "topping.auth.taboo": "No recomendado",
    "recipeSetup.dough": "Masa",
    "recipeSetup.styleBase": "estilo base",
    "recipeSetup.temp.fridge": "nevera",
    "recipeSetup.temp.cool": "fresco",
    "recipeSetup.temp.room": "ambiente",
    "recipeSetup.versionApplied": "{label}: parámetros de masa aplicados",
    "recipeSetup.noSignature": "Sin firma",
    "recipeSetup.currentParams": "parámetros actuales",
    "recipeSetup.noSignatureAlreadyActive": "Ninguna firma activa",
    "recipeSetup.signatureApplied": "{label}: firma aplicada",
    "recipeSetup.signatureRemoved": "Firma eliminada: parámetros restaurados",
    "version.label.Leggerissima": "Muy ligera",
    "version.label.Casalingo": "Casero",
    "version.label.Casalinga": "Casera",
    "version.label.Classica": "Clásica",
    "version.label.Tradizionale": "Tradicional",
    "version.label.Moderna": "Moderna",
    "version.label.Pro": "Pro",
    "version.label.Bilanciata": "Equilibrada",
    "timelineComfort.title": "Línea de tiempo cómoda",
    "timelineComfort.active": "Activo: evita fases nocturnas.",
    "timelineComfort.nightDetected": "Fases nocturnas activas detectadas.",
    "timelineComfort.idle": "Optimiza el horario si es necesario.",
    "timeline.preheat.title": "Horno al máximo",
    "timeline.preheat.desc": "Enciende el horno ahora a {temp}{equipmentNote}. Mientras tanto, los bollos terminan de leudar.",
    "timeline.preheat.equipmentNote": " (piedra o acero ya dentro)",
    "timeline.preheat.tipBeginner": "El horno debe estar muy caliente. Precalienta al menos 30 minutos antes.",
    "timeline.preheat.tipNerd": "La masa térmica de la superficie domina el primer minuto de cocción: {minutes} min de soak aseguran que la piedra/acero estén saturados, no solo el aire del horno.",
  },
  scienceLabels: {
    yeastBaker: "Levadura de panadero",
    effectiveHours: "Horas efectivas",
    q10Factor: "Factor Q\u2081\u2080",
    q10Cold: "fr\u00EDo",
    q10Sourdough: "masa madre",
    q10Standard: "est\u00E1ndar",
    waterActivity: "Actividad del agua",
    glutenNetwork: "Red de gluten",
    proteolysis: "Prote\u00F3lisis",
    starchDegradation: "Degradaci\u00F3n almid\u00F3n",
    fodmapReduction: "Reducci\u00F3n FODMAP",
    plEstimated: "P/L estimado",
    bakingEnergy: "Energ\u00EDa de cocci\u00F3n",
    waterTemp: "Temperatura del agua",
    desiredDoughTemp: "Temperatura de la masa",
    frictionFactor: "Factor de fricci\u00F3n",
    deviationCategory: "Desviaci\u00F3n",
    deviationScore: "Dev. efectiva",
  },
  timelineLabels: {
    preferment: {
      title: "Pre-Fermento",
      desc: "Mezclar {type} y dejar madurar",
      tipBeginner:
        'El pre-fermento es como un "aperitivo" para la levadura. Mezcla y deja reposar tapado.',
      tipNerd:
        "El pre-fermento produce \u00E1cidos org\u00E1nicos (l\u00E1ctico/ac\u00E9tico) que bajan el pH a ~4.5, mejorando la red de gluten y la vida \u00FAtil.",
    },
    mix: {
      title: "Amasado",
      desc: "Amasar hasta conseguir la malla glut\u00EDnica. Liso y el\u00E1stico.",
      descAlt:
        "Mezclar los ingredientes sin amasar. Serie de pliegues.",
      tipBeginner:
        "La masa est\u00E1 lista cuando es lisa y se despega de las manos. Si pega demasiado, espera 5 min y vuelve a intentar.",
      tipNerd:
        "La formaci\u00F3n de la malla se produce cuando glutenina y gliadina forman puentes disulfuro estables.",
    },
    mix_noknead: {
      title: "Amasado",
      desc: "Mezclar sin amasar hasta deshacer los grumos. Luego 3 tandas de pliegues (stretch & fold) cada ~30 min.",
      tipBeginner:
        "\u00A1No hace falta amasar! Mezcla con una esp\u00E1tula hasta que no queden grumos de harina seca.",
      tipNerd:
        "La aut\u00F3lisis aprovecha las proteinasas end\u00F3genas de la harina para desarrollar el gluten sin trabajo mec\u00E1nico.",
    },
    bulk: {
      title: "Fermentaci\u00F3n en bloque",
      desc: "Fermentaci\u00F3n en bloque a {temp}",
      tipBeginner:
        "La masa debe duplicar su volumen. \u00A1Si hace calor, revisa m\u00E1s seguido!",
      tipNerd:
        "A {temp} la velocidad de fermentaci\u00F3n es {factor}\u00D7 respecto a la referencia de 18\u00B0C.",
    },
    bulk_cold: {
      title: "Fermentaci\u00F3n en bloque",
      desc: "Fermentaci\u00F3n en bloque a {temp}",
      tipBeginner:
        "En la nevera la masa crece lento pero gana sabor. Cubre bien con film en contacto.",
      tipNerd:
        "A {temp} el Q\u2081\u2080\u22482.0 ralentiza la fermentaci\u00F3n. La actividad proteol\u00EDtica domina, degradando los FODMAP.",
    },
    divide: {
      title: "Boleado",
      desc: "Dividir en bolas del peso correcto. Formar bola.",
      tipBeginner:
        "\u00A1Usa una b\u00E1scula! Corta con una rasqueta y redondea cada trozo en una bola lisa.",
      tipNerd:
        "El boleado crea tensi\u00F3n superficial que atrapa CO\u2082 durante el reposo final y define la estructura alveolar.",
    },
    proof: {
      title: "Reposo final",
      desc: "Fermentaci\u00F3n final a {temp}",
      tipBeginner:
        "Las bolas deben estar blandas. Si presionas con un dedo, vuelven lentamente.",
      tipNerd:
        "Test del dedo: retorno lento = fermentaci\u00F3n \u00F3ptima. Demasiado r\u00E1pido = sub-fermentado. Sin retorno = sobre-fermentado.",
    },
    shape: {
      title: "Estirado",
      desc: "Estirar a mano desde el centro, preservar el borde",
      descAlt: "Estirar en la bandeja aceitada con las manos",
    },
    shape_thin: {
      title: "Estirado",
      desc: "Estirar con rodillo, ultrafina",
    },
    top: {
      title: "Cobertura",
      desc: "Cubrir la pizza al gusto",
    },
    bake: {
      title: "Cocci\u00F3n",
      desc: "Hornear a {temp}",
      tipBeginner:
        "El horno debe estar muy caliente. Precalienta al menos 30 minutos antes.",
      tipNerd:
        "La reacci\u00F3n de Maillard comienza a ~140\u00B0C y se acelera exponencialmente. A {temp} la caramelizaci\u00F3n crea ~600 compuestos arom\u00E1ticos.",
    },
  },
  timelineUi: {
    startLabel: "Inicio",
    beforeSuffix: "antes",
  },
  parametricTips: {
    pillHydration: "Hidrataci\u00F3n",
    pillFlour: "Harina",
    pillPL: "P/L",
    pillFermentation: "Fermentaci\u00F3n",
    pillThickness: "Grosor",
    pillLevel: "Nivel",
    pillExperimentation: "Experimentaci\u00F3n",
    pillLevelBeginner: "Principiante",
    pillLevelExpert: "Experto",
    sheetSectionTitle: "Detalles de cocci\u00F3n",
    sheetOvenLabel: "Horno ideal",
    sheetOvenPreheat: "Precalentar: {min} min",
    sheetBakeLabel: "Tiempo de cocci\u00F3n",
    sheetBakeTurns: "{n} rotaci\u00F3n(es)",
    sheetBakeNoTurns: "Sin rotaci\u00F3n",
    sheetDoughLabel: "Bola de masa",
    sheetSaltLabel: "Sal",
    sheetFoldLabel: "Pliegues",
    sheetFoldInterval: "Cada {min} min",
    sheetGenerateBtn: "Generar receta",
    sheetMatchTitle: "Por qué encaja con tu cocina",
    sheetTechniquesLabel: "T\u00E9cnicas de autor compatibles",
    mixBeginner:
      "{mixer} (~{time} min de amasado). {equipment}",
    bulkBeginner:
      "Realiza {count} pliegues ({type}) cada {interval} minutos para desarrollar la estructura.",
    shapeBeginner: "{note}",
    topBeginner: "Orden: {order}. {note}",
    bakeBeginner: "Tiempo: {minM}\u2013{maxM} min. {turnsNote}",
    mixNerd: "{mixer} \u00B7 amasado ~{time} min \u00B7 {note}",
    bulkNerd:
      "Pliegues: {count}\u00D7 {type} cada {interval} min \u00B7 {note}",
    shapeNerd:
      "Gre\u00F1ado: {type} \u00B7 profundidad {depth}mm \u00B7 {timing} \u00B7 {note}",
    topNerd:
      "Orden ingredientes: {order} \u00B7 salsa {saucePos} \u00B7 {cheeseType} ({cheesePos}) \u00B7 {note}",
    bakeNerd:
      "Cocci\u00F3n ideal: {idealSec}s (rango {minM}\u2013{maxM} min) \u00B7 {turns} rotaciones \u00B7 {note}",
    mixerPlanetaria: "Amasadora recomendada",
    mixerHand: "Amasado a mano posible",
    turnsSingle:
      "Rotar {n} vez/veces para cocci\u00F3n uniforme.",
    turnsNone: "No girar durante la cocci\u00F3n.",
  },
  styleDescriptions: {
    napoletana_stg:
      "Est\u00E1ndar de oro seg\u00FAn disciplinar AVPN. Cornisa hinchada, centro fino, moteado de leopardo.",
    napoletana_canotto:
      'Cornisa explosiva "canotto de aire", alveolado extremo, alta digestibilidad.',
    teglia_romana:
      "Alta hidrataci\u00F3n, sin amasado con pliegues. Base crujiente, miga nube.",
    tonda_romana:
      'Ultrafina, rodillo obligatorio, crujiente extrema. "Scrocchiarella".',
    pinsa_romana:
      "Mezcla 70% trigo / 15% soja / 15% arroz. Forma ovalada, corteza v\u00EDtrea.",
    pala_romana:
      "Formato ovalado alargado servido en pala. A medio camino entre redonda y bandeja.",
    new_york:
      "Porci\u00F3n grande plegable, corteza crujiente pero flexible. Street food.",
    detroit:
      "Corona de queso crujiente, bandeja Blue Steel. Queso hasta los bordes.",
    chicago_deep:
      "Pizza profunda como un pastel salado. Capas invertidas: queso-relleno-salsa.",
    bonci_teglia:
      "Sin amasado con pliegues, hidrataci\u00F3n extrema, maestro Bonci. Alta digestibilidad.",
    focaccia_genovese:
      "Suave y aceitosa, con corteza dorada y cr\u00E1teres caracter\u00EDsticos. Salmuera aceite-agua en superficie.",
    sfincione:
      "Pizza gruesa siciliana con tomate, cebolla, anchoas, caciocavallo y pan rallado. Street food de Palermo.",
    grandma_style:
      "Fina, crujiente, bandeja aceitada. La pizza de la abuela italoamericana. Mozzarella debajo, salsa encima.",
    focaccia_recco:
      "Dos l\u00E1minas ultrafinas con stracchino fundido. IGP desde 2015. Burbujas doradas caracter\u00EDsticas.",
    padellino_torino:
      "Cocida en sart\u00E9n de hierro y terminada en horno. Fondo crujiente mantequilla-aceite, suave en el centro.",
  },
  styleChars: {
    napoletana_stg:
      "Cornisa 1-2cm hinchada|Centro 3-4mm fino|Corteza leopardo|Cocci\u00F3n 60-90s",
    napoletana_canotto:
      'Cornisa 3-4cm "canotto"|Alveolado extremo|Maduraci\u00F3n 24-72h|Alta digestibilidad',
    teglia_romana:
      "Altura 2-3cm|Hidrataci\u00F3n 80-100%|Sin amasado + pliegues|Miga nube",
    tonda_romana:
      "Grosor 1-2mm|Rodillo obligatorio|Crujiente extrema|Harina d\u00E9bil W<210",
    pinsa_romana:
      "Mezcla multi-cereal|Forma ovalada|Corteza v\u00EDtrea|Maduraci\u00F3n 24-72h",
    pala_romana:
      "Forma ovalada alargada|Alta hidrataci\u00F3n|Servida en pala|Corteza crujiente-nube",
    new_york:
      "Porci\u00F3n plegable|Az\u00FAcar + aceite|Cocci\u00F3n 12-15min|Oleosidad caracter\u00EDstica",
    detroit:
      "Corona de queso|Bandeja profunda|Queso en bordes|Corteza caramelizada",
    chicago_deep:
      "Profundidad 5cm|Mantequilla 18%|Capas invertidas|Cocci\u00F3n 35min",
    bonci_teglia:
      "Sin amasado + pliegues|Hidrataci\u00F3n extrema|Maduraci\u00F3n 24-72h|Alveolado nube",
    focaccia_genovese:
      "Aceite EVO generoso|Cr\u00E1teres superficiales|Salmuera aceite-agua|Cocci\u00F3n 15-20min",
    sfincione:
      "Grueso y esponjoso|Pan rallado tostado|Cebolla + anchoas|Caciocavallo",
    grandma_style:
      "Fina y crujiente|Mozzarella bajo salsa|Bandeja bien aceitada|Cocci\u00F3n 12-16min",
    focaccia_recco:
      "L\u00E1mina casi transparente|Rellena de stracchino|Burbujas doradas|Sin levadura",
    padellino_torino:
      "Sart\u00E9n de hierro|Fondo ultra-crujiente|Suave en el centro|Porci\u00F3n individual",
  },
  deviationLabels: {
    canonical: "Can\u00F3nico",
    parameter_variant: "Variaci\u00F3n param\u00E9trica",
    technique_variant: "Variante t\u00E9cnica",
    hybrid: "Hibridaci\u00F3n",
    experimental: "Experimental",
  },
  authorNames: {
    bonci_no_knead: "Sin Amasado Alta Hidrataci\u00F3n",
    martucci_biga_ibrida:
      "Biga H\u00EDbrida 50% + Aut\u00F3lisis",
    martucci_biga_100: "Biga 100% con Refresco",
    pepe_sensoriale: "Hidrataci\u00F3n Sensorial",
    bosco_idrolisi:
      "M\u00E9todo Hidr\u00F3lisis (Fermentaci\u00F3n Espont\u00E1nea)",
    capuano_forbici: "M\u00E9todo Tijeras (L\u00E1cteos)",
    pepe_sensory_layering:
      "Cocci\u00F3n Separada de Ingredientes",
    bianco_long_ferment: "Fermentaci\u00F3n 5 D\u00EDas",
    forkish_saturday:
      "Pizza del S\u00E1bado (Fermentaci\u00F3n en Fr\u00EDo)",
  },
  authorAuthors: {
    bonci_no_knead: "Gabriele Bonci",
    martucci_biga_ibrida: "Francesco Martucci",
    martucci_biga_100: "Francesco Martucci",
    pepe_sensoriale: "Franco Pepe",
    bosco_idrolisi: "Renato Bosco",
    capuano_forbici: "Vincenzo Capuano",
    pepe_sensory_layering: "Franco Pepe",
    bianco_long_ferment: "Chris Bianco",
    forkish_saturday: "Ken Forkish",
  },
  profile: {
    pageTitle: "Tu Perfil",
    pageSubtitle: "Tus preferencias, siempre a mano.",
    favoritesTitle: "Tus estilos favoritos",
    favoritesSubtitle: "Los estilos que marcaste con el corazón",
    favoriteRemove: "Quitar de favoritos",
    favoriteRemoveAria: "Quitar {name} de favoritos",
    savedRecipesTitle: "Tus recetas guardadas",
    savedRecipesSubtitle: "Las versiones a medida que guardaste",
    savedRecipeRemove: "Quitar del recetario",
    savedRecipeRemoveAria: "Quitar {name} del recetario",
    ovenTitle: "Tu horno",
    ovenSubtitle:
      "Determina temperaturas y estilos disponibles",
    ovenStep: "01 — Equipamiento",
    tempLabel: "Temperatura máxima",
    tempAria: "Temperatura máxima del horno",
    skillTitle: "Tu experiencia",
    skillSubtitle: "Adaptamos la complejidad de las recetas",
    skillStep: "02 — Nivel",
    pantryTitle: "Tu despensa",
    pantrySubtitle: "Harinas y levaduras que tienes en casa",
    pantryStep: "03 — Ingredientes",
    dietTitle: "Preferencias dietéticas",
    dietSubtitle: "Filtra estilos e ingredientes incompatibles",
    dietStep: "04 — Dieta",
    noDietNote:
      "Sin restricciones — todos los estilos disponibles.",
    prefsTitle: "Idioma y tema",
    prefsSubtitle: "Personaliza la interfaz",
    prefsStep: "05 — Preferencias",
    langLabel: "Idioma",
    themeLabel: "Tema",
    themeLight: "Claro",
    themeDark: "Oscuro",
    themeAuto: "Automático",
    unitTitle: "Medidas",
    unitSubtitle: "Elige cómo mostrar temperaturas, pesos y líquidos",
    unitStep: "07 — Medidas",
    unitSystemLabel: "Sistema de medida",
    unitMetric: "Métrico",
    unitMetricDesc: "Gramos, mililitros y grados Celsius",
    unitImperial: "Imperial / US",
    unitImperialDesc: "Onzas, onzas líquidas y grados Fahrenheit",
    pizzaNerdTitle: "PizzaNerd",
    pizzaNerdSubtitle: "Controla cuándo se muestran los datos técnicos",
    pizzaNerdStep: "08 — PizzaNerd",
    pizzaNerdCardTitle: "PizzaNerd",
    pizzaNerdCardDesc:
      "Muestra análisis técnicos y datos avanzados en receta y procedimiento.",
    resetProfile: "Reconfigurar perfil",
    resetConfirmMessage:
      "¿Seguro que quieres reconfigurar el perfil?\n\nVolverás al asistente inicial. Tus preferencias actuales se sustituirán por las nuevas elecciones.",
    devModeOn: "Modo desarrollo activo",
    devModeOff: "Activar modo desarrollo",
    locationTitle: "Tu ubicación",
    locationSubtitle: "Para la temperatura ambiente y los cálculos de fermentación",
    locationStep: "05 — Ubicación",
    locationPlaceholder: "Buscar ciudad...",
    locationAuto: "Detectar ubicación",
    locationAutoDetected: "Detectada automáticamente",
    locationSaved: "Ubicación guardada",
    locationNone: "Ninguna ubicación configurada — se usará un valor estándar.",
    locationSearching: "Buscando...",
    locationNoResults: "Sin resultados",
    ftuWelcome: "Bienvenido",
    ftuOvenTitle: "¿Qué horno tienes?",
    ftuOvenSubtitle: "El horno define los estilos posibles",
    ftuSkillTitle: "¿Cuánta experiencia?",
    ftuSkillSubtitle: "Te guiaremos al nivel adecuado",
    ftuPantryTitle: "¿Qué hay en tu despensa?",
    ftuPantrySubtitle: "Harinas y levaduras disponibles",
    ftuBack: "Atrás",
    ftuNext: "Siguiente",
    ftuStart: "Empezar",
    localeModalTitle: "¿Cambiar idioma?",
    localeModalDesc:
      "Todos los textos de la interfaz cambiarán de {from} a {to}.",
    localeModalCancel: "Cancelar",
    localeModalConfirm: "Confirmar",
    flour00: "Tipo 00",
    flour0: "Tipo 0",
    flourManitoba: "Manitoba",
    flourIntegrale: "Integral",
    flourSemola: "S\u00E9mola remolida",
    yeastFresh: "Levadura fresca",
    yeastDry: "Levadura seca",
    yeastSourdough: "Masa madre",
    dietGlutenFree: "Sin gluten",
    dietLactoseFree: "Sin lactosa",
    dietVegan: "Vegano",
    dietLowFodmap: "Low FODMAP",
    dietHistamine: "Baja histamina",
    dietNickel: "Bajo n\u00EDquel",
    equipTitle: "Equipamiento",
    equipSubtitle: "Qué tienes en tu cocina",
    equipStep: "03 — Equipamiento",
    equipMixerTitle: "Amasado",
    equipSurfaceTitle: "Superficie de cocción",
    equipToolsTitle: "Utensilios",
    equipSummaryNone: "No seleccionado",
    equipSummarySelected: "{count} seleccionados",
    mixerHands: "A mano",
    mixerHandsDesc: "Amasado manual, sin equipamiento",
    mixerStandDomestic: "Batidora de pie (doméstica)",
    mixerStandDomesticDesc:
      "KitchenAid, Kenwood, Smeg — 4-7 L, gancho",
    mixerPlanetary: "Amasadora planetaria (semi-pro)",
    mixerPlanetaryDesc: "10-20 L, gancho espiral, motor 500W+",
    mixerSpiral: "Amasadora de espiral",
    mixerSpiralDesc: "Cuba fija/basculante, profesional",
    mixerFork: "Amasadora de tenedor",
    mixerForkDesc:
      "Lenta, baja fricción — ideal para alta hidratación",
    mixerLevelHome: "Casa",
    mixerLevelSemiPro: "Semi-Pro",
    mixerLevelPro: "Pro",
    surfaceRefractory: "Ladrillo refractario",
    surfaceRefractoryDesc:
      "3 cm, alta masa térmica — horno de leña y prosumer",
    surfaceCordierite: "Piedra de cordierita",
    surfaceCordieriteDesc:
      "1.5 cm, compromiso masa/velocidad — Effeuno, Ooni",
    surfaceSteel: "Placa de acero",
    surfaceSteelDesc:
      "5-10 mm, transferencia ultra-rápida — base crujiente en segundos",
    surfaceAluminum: "Bandeja de aluminio",
    surfaceAluminumDesc:
      "Ligera, conductividad extrema — Detroit, teglia romana",
    surfaceBlueSteel: "Bandeja de acero azul",
    surfaceBlueSteelDesc:
      "Antiadherente natural, borde alto — teglia, focaccia",
    surfaceCastIron: "Sartén de hierro fundido",
    surfaceCastIronDesc:
      "Alta masa térmica, borde alto — Chicago, padellino",
    surfaceOvenRack: "Rejilla del horno",
    surfaceOvenRackDesc:
      "Sin superficie adicional — solo la rejilla estándar",
    toolCatEssential: "Esenciales",
    toolCatPrecision: "Precisión",
    toolCatHandling: "Manipulación",
    toolCatContainment: "Contención",
    toolDigitalScale: "Báscula digital",
    toolDigitalScaleDesc: "Precisión 1g, capacidad 5kg+",
    toolThermometer: "Termómetro",
    toolThermometerDesc: "IR o sonda, para masa y horno",
    toolScraper: "Rasqueta",
    toolScraperDesc: "Plástico flexible para pliegues y corte",
    toolContainers: "Recipientes de fermentación",
    toolContainersDesc: "Bandejas apilables o cuencos con tapa",
    toolDoughCutter: "Cortador de masa",
    toolDoughCutterDesc:
      "Acero inox, para porcionar con precisión",
    toolBenchKnife: "Espátula de banco",
    toolBenchKnifeDesc:
      "Acero inox, para voltear masas de alta hidratación",
    toolScoringBlade: "Cuchilla de scoring",
    toolScoringBladeDesc:
      "Para incisiones decorativas en la superficie",
    toolPeelWood: "Pala de madera",
    toolPeelWoodDesc: "Para hornear — baja fricción con sémola",
    toolPeelMetal: "Pala de aluminio",
    toolPeelMetalDesc: "Para girar y sacar — fina y reactiva",
    toolPizzaScreen: "Rejilla perforada",
    toolPizzaScreenDesc:
      "Aluminio perforado para cocción crujiente",
    toolProofingBoxes: "Cajas de fermentación",
    toolProofingBoxesDesc:
      "Apilables con tapa — 30×40 o 40×60 cm",
    toolBannetons: "Bannetons",
    toolBannetonsDesc: "Para formas redondas, con tela de lino",
    flourFarro: "Escanda",
    flourKamut: "Kamut",
    flourSegale: "Centeno",
    flourTipo1: "Tipo 1",
    flourTipo2: "Tipo 2",
    flourMacinataPietra: "Molida a piedra",
    ftuDoneTitle: "Eso es todo lo que necesitamos. Ahora puedes:",
    ftuDoneCreateTitle: "Crear una receta",
    ftuDoneCreateDesc: "Ve a <b>Crear</b> y elige el estilo, nosotros calculamos todo",
    ftuDoneExploreTitle: "Explorar estilos",
    ftuDoneExploreDesc: "Sección <b>Estilos</b>: todas las tradiciones con fotos y detalles",
    ftuDoneLearnTitle: "Aprender la teoría",
    ftuDoneLearnDesc: "Sección <b>Aprender</b>: glosario, troubleshooting, pre-fermentos",
    ftuDoneProfileNote: "¿Amasadora, superficies de cocción, dieta y ubicación? Cuando quieras, en la sección <b>Perfil</b>.",
    specialFloursOnboarding: "Harinas especiales (escanda, centeno, integrales...)",
    locationRemove: "Eliminar ubicación",
    ftuSkipMessage: "También puedes omitir y configurar más tarde.",
  },
  pages: {
    navCreate: "Crear",
    navExplore: "Estilos",
    navLearn: "Aprender",
    navProfile: "Perfil",
    navSearch: "Buscar",
    exploreStepNum: "15 estilos — 4 familias",
    exploreTitle: "Explora los Estilos",
    exploreSubtitle:
      "De la Napoletana STG a la Focaccia di Recco.",
    learnTitle: "Aprende",
    learnSubtitle:
      "La ciencia y el arte de la pizza, bien explicado.",
    learnGlossary: "Glosario",
    learnGlossaryDesc:
      "30+ t\u00E9rminos t\u00E9cnicos de panificaci\u00F3n",
    learnTroubleshooting: "Problemas & Soluciones",
    learnTroubleshootingDesc:
      "20 problemas comunes y c\u00F3mo resolverlos",
    learnPreFerments: "Pre-fermentos",
    learnPreFermentsDesc:
      "Gu\u00EDa de Biga, Poolish y Aut\u00F3lisis",
    recipeLabel: "Receta",
    recipeBackToStyles: "Estilos",
    recipeStyleNotFound: "Estilo no encontrado",
    recipeStyleNotFoundDesc:
      'El estilo "{id}" no existe en la base de datos.',
    recipeExploreStyles: "Explorar estilos",
    recipeCopyLinkAria: "Copiar enlace de receta",
    notFoundTitle: "P\u00E1gina no encontrada",
    notFoundSubtitle:
      "Esta pizza no existe en nuestro men\u00FA.",
    notFoundBack: "Volver al inicio",
    searchPlaceholder:
      "Buscar estilo, harina, t\u00E9rmino, problema\u2026",
    searchCatStyles: "Estilos",
    searchCatFlours: "Harinas",
    searchCatGlossary: "Glosario",
    searchCatProblems: "Problemas",
    searchCatGuides: "Gu\u00EDas",
    searchNoResults: 'Sin resultados para "{query}"',
    searchHint:
      "Escribe para buscar estilos, harinas, glosario y problemas",
    searchSuggestions: "Sugerencias",
    searchFlourWheat: "Trigo blando",
    searchFlourManitoba: "Manitoba",
    searchFlourSemola: "S\u00E9mola",
    searchFlourWholegrain: "Integral",
    searchFlourGlutenFree: "Sin gluten",
    searchFlourSpecial: "Especial",
    skipToContent: "Saltar al contenido",
    navMainLabel: "Navegaci\u00F3n principal",
    searchCloseLabel: "Cerrar b\u00FAsqueda",
    searchFieldLabel: "Campo de b\u00FAsqueda global",
    searchClearLabel: "Borrar b\u00FAsqueda",
    homeAria: "Vulcan Pizza Lab — Inicio",
    devToolsAria: "Herramientas de desarrollo",
    mottoAria: "Lema Vulcan",
    troubleshootSearchPlaceholder: "Busca s\u00EDntoma o causa...",
    dietaryWarningsTitle: "Avisos dietéticos",
    troubleshootingTitle: "¿Problemas con la receta?",
    troubleshootingDesc:
      "Consulta la guía de 20 problemas comunes y soluciones",
    exploreRecipe: "Explorar la receta",
    exploreHeroDesc: "Desde los grandes clásicos tradicionales hasta creaciones de autor. Encuentra tu inspiración.",
    exploreFilterFeatured: "Destacados",
    exploreFilterStyles: "Estilos de pizza",
    exploreFilterRecipes: "Recetas icónicas",
    learnFilterSubtitle: "Las siguientes secciones se enfocan en este estilo.",
    learnRemoveFilter: "Eliminar filtro de estilo",
    learnOpenGlossary: "Abrir el glosario",
    learnPathLabel: "Ruta de Aprendizaje",
    learnStartPath: "Iniciar ruta",
    learnTermOfTheDay: "Término del día — {category}",
    learnPath1Title: "Tu primera pizza en bandeja",
    learnPath1Copy: "Sin amasadora, sin estrés: la Teglia Romana lo perdona todo y recompensa de inmediato. El punto de partida perfecto.",
    learnPath2Title: "Sube el nivel: el padellino",
    learnPath2Copy: "Borde suave, base crujiente, usando una sartén que ya tienes en casa. La mejora más accesible.",
    learnPath3Title: "El desafío del canotto",
    learnPath3Copy: "Borde explosivo, alta hidratación, pre-fermento. Poniendo a prueba todo lo que has aprendido.",
    learnPath4Title: "Maestro del método Bonci",
    learnPath4Copy: "Hidratación extrema, pliegues, paciencia. La bandeja maestra que convierte agua y harina en una nube.",
    preFermentsSubtitle: "Biga, Poolish y Autólisis: cuándo y por qué usarlos.",
    preFermentsDescription: "Los pre-fermentos son masas preliminares que maduran antes del amasado final. Mejoran el sabor, la estructura y la digestibilidad de la pizza. Cada técnica tiene rasgos únicos: la <strong>Biga</strong> (seca) aporta complejidad aromática, el <strong>Poolish</strong> (líquido) regala ligereza y corteza dorada, la <strong>Autólisis</strong> (solo harina y agua) desarrolla el gluten sin esfuerzo.",
    preFermentsChoiceTitle: "¿Cuál elegir?",
    preFermentsBigaTitle: "Biga",
    preFermentsBigaWhen: "Cuando buscas sabor complejo y corteza crujiente",
    preFermentsBigaBest: "Napoletana clásica, Pinsa, Pizza al corte",
    preFermentsPoolishTitle: "Poolish",
    preFermentsPoolishWhen: "Cuando buscas ligereza y corteza dorada intensa",
    preFermentsPoolishBest: "Teglia Romana, NY Style, Focaccias",
    preFermentsAutolisiTitle: "Autólisis",
    preFermentsAutolisiWhen: "Cuando buscas reducir el tiempo de amasado y mejorar la extensibilidad",
    preFermentsAutolisiBest: "Todos los estilos — técnica universal, combinable con Biga/Poolish",
    stylesModified: "modificados",
    stylesCustom: "personalizados",
    noChanges: "sin cambios",
    deactivateCustomStyles: "Desactivar estilos personalizados",
    deactivate: "Desactivar",
    passToEasy: "Pasar a Easy",
    activateNerd: "Activar modo Nerd",
  },
  configurator: {
    hydrationLabel: "Hidrataci\u00F3n",
    hydrationTip:
      "Porcentaje de agua respecto a la harina. M\u00E1s alta = masa m\u00E1s blanda y miga abierta, pero m\u00E1s dif\u00EDcil de manejar.",
    flourWLabel: "Fuerza Harina (W)",
    flourWLabelBlend: "Fuerza de la harina de trigo",
    flourWTip:
      "Indica la capacidad de absorber agua y retener gas. W m\u00E1s alto = fermentaciones m\u00E1s largas y estructura m\u00E1s fuerte.",
    plLabel: "Relaci\u00F3n P/L",
    plTip:
      "Relaci\u00F3n alveogr\u00E1fica tenacidad/extensibilidad. P/L bajo = masa extensible (pizza redonda). P/L alto = masa tenaz (larga fermentaci\u00F3n). Estimado a partir de W si no se modifica.",
    fermentLabel: "Leudado y maduraci\u00F3n",
    fermentTip:
      "Tiempo total de leudado y maduraci\u00F3n. El leudado produce los gases que hacen crecer la masa; la maduraci\u00F3n descompone almidones y gluten, mejorando la digestibilidad y el aroma. M\u00E1s horas a temperaturas bajas inclinan el equilibrio hacia la maduraci\u00F3n.",
    tempFridge: "{fridgeTemp} nevera",
    tempCool: "{coolTemp}",
    tempAmbient: "{ambientTemp} amb.",
    preFermentLabel: "Pre-fermento",
    preFermentTip:
      "El pre-fermento (biga, poolish) es una porci\u00F3n de masa fermentada con antelaci\u00F3n. Mejora sabor, digestibilidad y conservaci\u00F3n. Requiere 12\u201324 h de planificaci\u00F3n extra.",
    ovenLabel: "Horno",
    ovenTip:
      "Selecciona el tipo y ajusta la temperatura. Temperaturas m\u00E1s altas = cocci\u00F3n m\u00E1s r\u00E1pida y mejor corteza.",
    panLabel: "Bandeja",
    panTipRect:
      "La forma y tama\u00F1o de la bandeja afectan la cantidad de masa y el resultado final. El est\u00E1ndar para este estilo es rectangular.",
    panTipRound:
      "La forma y tama\u00F1o de la bandeja afectan la cantidad de masa y el resultado final. El est\u00E1ndar para este estilo es redonda.",
    panRectangular: "Rectangular",
    panRound: "Redonda",
    panLength: "Largo",
    panWidth: "Ancho",
    panDiameter: "Di\u00E1metro",
    panArea: "\u00C1rea bandeja",
    thicknessLabel: "Grosor",
    thicknessTip:
      "El grosor de la pizza afecta directamente el peso de la bola, la cocci\u00F3n y la textura final. Valores bajos = fina y crujiente. Valores altos = esponjosa y alta.",
    thicknessThin: "Fina y crujiente",
    thicknessThick: "Alta y esponjosa",
    thicknessStandard: "Est\u00E1ndar para este estilo",
    backLabel: "Atrás",
    sliderOptimal: "óptimo",
    hintHighHydrationNeedsW: "Con una hidratación del {h}%, necesitas harina fuerte: W recomendado ≥ {w}",
    hintLowWLimitsHydration: "Con W {w}, la hidratación máxima recomendada es ~{h}%",
    hintLongFermentUseFridge: "Con {hours}h de fermentación, es mejor usar la nevera ({fridgeTemp}) para controlar la masa",
    hintShortFermentUseWarm: "Con solo {hours}h, fermenta a temperatura ambiente ({ambientTemp}) para activar la levadura",
    hintMediumFermentUseCool: "Con {hours}h, una temperatura fresca ({coolTemp}) es el compromiso ideal entre control y actividad",
    hintHighHydrationNeedsTime: "Con una hidratación del {h}%, se recomienda una fermentación ≥ {hours}h",
    hintLowPLForHighHydration: "Con alta hidratación, se recomienda un P/L ≤ {pl} para la extensibilidad",
    hintHighWAllowsMoreHydration: "Con W {w}, puedes llegar hasta el {h}% de hidratación",
    hintAdaptiveLabel: "sugerido",
    hintLimitMinLabel: "límite mín",
    hintLimitMaxLabel: "límite máx",
  },
  cooking: {
    glossaryPreferment: "Biga y prefermentos",
    glossaryBulk: "Fermentación en bloque",
    glossaryProof: "Fermentación final (appretto)",
    glossaryBake: "Reacción de Maillard",
    glossaryMix: "Hidratación",
  } as any,
  preFerment: PRE_FERMENT_ES as any,
  dietaryI18n: DIETARY_ES as any,
  troubleshootingI18n: TROUBLESHOOTING_ES as any,
  glossaryTerms: GLOSSARY_TERMS_ES as any,
};
