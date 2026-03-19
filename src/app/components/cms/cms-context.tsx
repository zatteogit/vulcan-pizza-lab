import React, { createContext, useContext, useState, useCallback, useMemo } from "react";
import { LOCALE_BUNDLES, LOCALE_BCP47 } from "./locales";
import {
  PRE_FERMENT_DEFAULTS,
  DIETARY_I18N_DEFAULTS,
  TROUBLESHOOTING_I18N_DEFAULTS,
  GLOSSARY_TERMS_DEFAULTS,
} from "./domain-i18n-defaults";

/* ═══ VULCAN CMS CONTEXT ═══
 * Centralized content management for all user-facing text, config, weights, and media.
 * Pattern: overrides on top of hardcoded defaults (same as StylesOverrideContext).
 * Persistence: localStorage with vulcan_cms_ prefix.
 *
 * Usage in components:
 *   const { cms, update, reset, isModified } = useCms();
 *   const heroTitle = cms.hero.title; // always returns current (override or default)
 */

// ═══ CONTENT SCHEMA ═══

/** Locale metadata — i18n ready */
export type LocaleId = "it" | "en" | "es" | "de" | "fr" | "pt" | "ja";

export interface CmsLocale {
  /** Active locale code */
  id: LocaleId;
  /** Display name */
  name: string;
}

/** Generic UI strings — buttons, labels, actions, placeholders */
export interface CmsUiStrings {
  // Actions
  copy: string;
  copied: string;
  share: string;
  back: string;
  reset: string;
  close: string;
  modify: string;
  disable: string;
  restore: string;
  generate: string;
  chooseStyle: string;
  customizeParams: string;
  changeStyle: string;
  newPizza: string;
  // Recipe output
  ingredients: string;
  procedure: string;
  steps_count: string;       // "{n} passaggi" template
  doughBalls: string;
  doughBallsFrom: string;    // "da {w}g" template
  totalDough: string;
  startTime: string;
  endTime: string;
  // Recipe output — clipboard/share text
  clipboardTitle: string;        // "{style} — Vulcan Pizza Lab"
  clipboardBalls: string;        // "{n} panetti da {w}g"
  clipboardTotal: string;        // "Totale: {g}g"
  clipboardProcedure: string;    // "{style} — Procedimento"
  // Recipe output — ingredient names
  flour: string;
  water: string;
  salt: string;
  sugar: string;
  oilEvo: string;
  // Recipe output — compensations
  compTitle: string;
  compTitleNerd: string;
  compHydration: string;
  compOil: string;
  compSugar: string;
  compCookTime: string;
  compThickness: string;
  compDefault: string;
  // Recipe output — aria labels
  ariaReduceBalls: string;
  ariaAddBalls: string;
  ariaEarlier: string;
  ariaLater: string;
  // Stat strip
  statHydration: string;
  statOven: string;
  statCookTime: string;
  statFermentation: string;
  statTempSuffix: string;        // "a {t}°C"
  // Nerd row
  nerdTitle: string;
  nerdFlourW: string;
  nerdPL: string;
  nerdYeast: string;
  nerdHoursAt18: string;
  nerdQ10: string;
  nerdAw: string;
  // Time format
  seconds: string;
  minutes: string;
  minute: string;
  hours: string;
  hour: string;
  // Score dashboard
  recipeScore: string;
  nerdToggle: string;
  nerdActive: string;
  scienceTitle: string;
  ariaCloseScores: string;
  ariaViewScores: string;
  tapForDetails: string;
  // Banners
  styleEditorActive: string;
  cmsActive: string;
  fieldsModified: string;
  fieldModified: string;
  /** Oven section — edit label when already configured */
  editOven: string;
  // Weather widget
  weatherCity: string;          // fallback city name
  weatherOutdoor: string;       // "{t}°C fuori" template
  weatherKitchen: string;       // "Cucina"
  // Badges
  badgeIdeal: string;           // "IDEALE"
  badgeRecent: string;          // "RECENTE"
  autoLabel: string;            // "Auto"
  // Oven compact bar
  cancel: string;
  changeOven: string;
  ovenFallback: string;
  // Pantry group labels
  pantryFlours: string;
  pantryYeasts: string;
  // Equipment labels
  equipMixer: string;
  equipStone: string;
  equipSteel: string;
  equipPan: string;
  equipKneading: string;     // "Impastamento"
  equipSurface: string;      // "Superficie cottura"
  // Kitchen / Pantry UI
  kitchenTitle: string;      // "La tua cucina"
  pantryOptional: string;    // "opzionale"
  specialFlours: string;     // "Farine speciali"
  brandSuggest: string;      // "Conosci la marca?"
  badgeSelected: string;     // "Selezionata"
  otherCompatibleFlours: string; // "Altre farine compatibili"
  flourSelectHint: string;   // "Seleziona una farina per aggiornare W e P/L"
  flourSelected: string;     // "Applicata"
  autolysisSuggested: string; // "Autolisi consigliata"
  // Dietary labels
  dietGlutenFree: string;
  dietLactoseFree: string;
  dietVegan: string;
  dietLowFodmap: string;
  dietHistamine: string;
  dietNickel: string;
};

export interface CmsInlineTips {
  timeSlot: string;
  skill: string;
  equipment: string;
  oven: string;
  pantry: string;
}

export interface CmsHero {
  title_line1: string;
  title_line2: string;
  subtitle: string;
}

export interface CmsStepHeader {
  number: string;
  title: string;
  subtitle: string;
}

export interface CmsSectionHeader {
  title: string;
  description: string;
}

export interface CmsTimeSlot {
  label: string;
  sublabel: string;
  emoji: string;
  hours: number;
}

export interface CmsOvenPreset {
  name: string;
  maxTemp: number;
  icon: string;
}

export interface CmsSkillLevel {
  name: string;
  description: string;
}

export interface CmsFamily {
  name: string;
  description: string;
  emoji: string;
}

export interface CmsTier {
  label: string;
  subtitle: string;
}

export interface CmsScoreDimension {
  label: string;
  short: string;
  weight: number;
}

export interface CmsRecommendationWeights {
  time: number;
  oven: number;
  skill: number;
  equipment: number;
  pantry: number;
}

export interface CmsTimelineStep {
  title: string;
  /** Description template — supports {temp}, {type} placeholders */
  desc: string;
  /** Optional alternate description for conditional variants */
  descAlt?: string;
  /** Beginner tip */
  tipBeginner?: string;
  /** Nerd tip template — supports {temp}, {factor} placeholders */
  tipNerd?: string;
}

/* ═══ DOMAIN DATA i18n INTERFACES ═══ */

/** Pre-ferment guide — UI labels + per-item content */
export interface CmsPreFerment {
  sectionLabel: string;
  tipsLabel: string;
  showComparison: string;
  hideComparison: string;
  paramHydration: string;
  paramDuration: string;
  paramTemperature: string;
  paramPh: string;
  detailFermentation: string;
  detailFlavor: string;
  detailCrust: string;
  detailExtensibility: string;
  detailIdealStyles: string;
  compLabels: string[];
  items: Record<string, {
    origin: string;
    description: string;
    hydration: string;
    consistency: string;
    fermentationType: string;
    flavor: string;
    crustResult: string;
    extensibility: string;
    idealStyles: string;
    tips: string[];
  }>;
  compValues: Record<string, { biga: string; poolish: string; autolisi: string }>;
}

/** Dietary data — info, conflict & warning messages */
export interface CmsDietaryI18n {
  info: Record<string, { name: string; description: string; scienceNote: string }>;
  conflicts: Record<string, { message: string; compromiseTip?: string }>;
  warnings: Record<string, { message: string; tip: string }>;
}

/** Troubleshooting — category labels + issue content + contextual warnings */
export interface CmsTroubleshootingI18n {
  categories: Record<string, string>;
  issues: Record<string, {
    symptom: string;
    cause: string;
    testRapido: string;
    fixImmediate: string;
    prevention: string;
  }>;
  contextual: Record<string, { message: string; tip: string }>;
}

/** Glossary term content — per-term i18n strings */
export interface CmsGlossaryTerms {
  terms: Record<string, {
    name: string;
    definition: string;
    whyImportant?: string;
    ranges?: { label: string; value: string; note?: string }[];
  }>;
}

/** Profile page strings — sections, FTU, locale modal */
export interface CmsProfile {
  pageTitle: string;
  pageSubtitle: string;
  // Sections
  ovenTitle: string;
  ovenSubtitle: string;
  ovenStep: string;
  tempLabel: string;
  tempAria: string;
  skillTitle: string;
  skillSubtitle: string;
  skillStep: string;
  pantryTitle: string;
  pantrySubtitle: string;
  pantryStep: string;
  dietTitle: string;
  dietSubtitle: string;
  dietStep: string;
  noDietNote: string;
  prefsTitle: string;
  prefsSubtitle: string;
  prefsStep: string;
  langLabel: string;
  themeLabel: string;
  themeLight: string;
  themeDark: string;
  resetProfile: string;
  devModeOn: string;
  devModeOff: string;
  // FTU
  ftuWelcome: string;
  ftuOvenTitle: string;
  ftuOvenSubtitle: string;
  ftuSkillTitle: string;
  ftuSkillSubtitle: string;
  ftuPantryTitle: string;
  ftuPantrySubtitle: string;
  ftuBack: string;
  ftuNext: string;
  ftuStart: string;
  // Locale modal
  localeModalTitle: string;
  localeModalDesc: string;
  localeModalCancel: string;
  localeModalConfirm: string;
  // Pantry item labels
  flour00: string;
  flour0: string;
  flourManitoba: string;
  flourIntegrale: string;
  flourSemola: string;
  yeastFresh: string;
  yeastDry: string;
  yeastSourdough: string;
  // Dietary labels
  dietGlutenFree: string;
  dietLactoseFree: string;
  dietVegan: string;
  dietLowFodmap: string;
  dietHistamine: string;
  dietNickel: string;
  // Equipment — section headers
  equipTitle: string;
  equipSubtitle: string;
  equipStep: string;
  equipMixerTitle: string;
  equipSurfaceTitle: string;
  equipToolsTitle: string;
  equipSummaryNone: string;
  equipSummarySelected: string;
  // Equipment — mixer types
  mixerHands: string;
  mixerHandsDesc: string;
  mixerStandDomestic: string;
  mixerStandDomesticDesc: string;
  mixerPlanetary: string;
  mixerPlanetaryDesc: string;
  mixerSpiral: string;
  mixerSpiralDesc: string;
  mixerFork: string;
  mixerForkDesc: string;
  mixerLevelHome: string;
  mixerLevelSemiPro: string;
  mixerLevelPro: string;
  // Equipment — surfaces
  surfaceRefractory: string;
  surfaceRefractoryDesc: string;
  surfaceCordierite: string;
  surfaceCordieriteDesc: string;
  surfaceSteel: string;
  surfaceSteelDesc: string;
  surfaceAluminum: string;
  surfaceAluminumDesc: string;
  surfaceBlueSteel: string;
  surfaceBlueSteelDesc: string;
  surfaceCastIron: string;
  surfaceCastIronDesc: string;
  surfaceOvenRack: string;
  surfaceOvenRackDesc: string;
  // Equipment — tool categories
  toolCatEssential: string;
  toolCatPrecision: string;
  toolCatHandling: string;
  toolCatContainment: string;
  // Equipment — individual tool labels
  toolDigitalScale: string;
  toolDigitalScaleDesc: string;
  toolThermometer: string;
  toolThermometerDesc: string;
  toolScraper: string;
  toolScraperDesc: string;
  toolContainers: string;
  toolContainersDesc: string;
  toolDoughCutter: string;
  toolDoughCutterDesc: string;
  toolBenchKnife: string;
  toolBenchKnifeDesc: string;
  toolScoringBlade: string;
  toolScoringBladeDesc: string;
  toolPeelWood: string;
  toolPeelWoodDesc: string;
  toolPeelMetal: string;
  toolPeelMetalDesc: string;
  toolPizzaScreen: string;
  toolPizzaScreenDesc: string;
  toolProofingBoxes: string;
  toolProofingBoxesDesc: string;
  toolBannetons: string;
  toolBannetonsDesc: string;
}

/** Page-level strings for nav, explore, learn, recipe, not-found, search */
export interface CmsPages {
  // Navigation tab labels
  navCreate: string;
  navExplore: string;
  navLearn: string;
  navProfile: string;
  navSearch: string;
  // Explore page
  exploreStepNum: string;
  exploreTitle: string;
  exploreSubtitle: string;
  // Learn page
  learnTitle: string;
  learnSubtitle: string;
  learnGlossary: string;
  learnGlossaryDesc: string;
  learnTroubleshooting: string;
  learnTroubleshootingDesc: string;
  learnPreFerments: string;
  learnPreFermentsDesc: string;
  // Recipe page
  recipeLabel: string;
  recipeBackToStyles: string;
  recipeStyleNotFound: string;
  recipeStyleNotFoundDesc: string;
  recipeExploreStyles: string;
  recipeCopyLinkAria: string;
  // Not found page
  notFoundTitle: string;
  notFoundSubtitle: string;
  notFoundBack: string;
  // Search overlay
  searchPlaceholder: string;
  searchCatStyles: string;
  searchCatFlours: string;
  searchCatGlossary: string;
  searchCatProblems: string;
  searchCatGuides: string;
  searchNoResults: string;
  searchHint: string;
  searchSuggestions: string;
  // Search flour categories
  searchFlourWheat: string;
  searchFlourManitoba: string;
  searchFlourSemola: string;
  searchFlourWholegrain: string;
  searchFlourGlutenFree: string;
  searchFlourSpecial: string;
  // Accessibility
  skipToContent: string;
  navMainLabel: string;
  searchCloseLabel: string;
  searchFieldLabel: string;
  searchClearLabel: string;
  // Home result section
  dietaryWarningsTitle: string;
  troubleshootingTitle: string;
  troubleshootingDesc: string;
}

/** Recipe configurator slider labels and tooltips */
export interface CmsConfigurator {
  hydrationLabel: string;
  hydrationTip: string;
  flourWLabel: string;
  flourWTip: string;
  plLabel: string;
  plTip: string;
  fermentLabel: string;
  fermentTip: string;
  tempFridge: string;
  tempCool: string;
  tempAmbient: string;
  preFermentLabel: string;
  preFermentTip: string;
  ovenLabel: string;
  ovenTip: string;
  panLabel: string;
  panTipRect: string;
  panTipRound: string;
  panRectangular: string;
  panRound: string;
  panLength: string;
  panWidth: string;
  panDiameter: string;
  panArea: string;
  thicknessLabel: string;
  thicknessTip: string;
  thicknessThin: string;
  thicknessThick: string;
  thicknessStandard: string;
  backLabel: string;
  sliderOptimal: string;
  /** Adaptive cross-parameter hints */
  hintHighHydrationNeedsW: string;
  hintLowWLimitsHydration: string;
  hintLongFermentUseFridge: string;
  hintShortFermentUseWarm: string;
  hintMediumFermentUseCool: string;
  hintHighHydrationNeedsTime: string;
  hintLowPLForHighHydration: string;
  hintHighWAllowsMoreHydration: string;
  hintAdaptiveLabel: string;
  hintLimitMinLabel: string;
  hintLimitMaxLabel: string;
}

export interface CmsContent {
  /** i18n locale metadata */
  locale: CmsLocale;
  /** Generic UI strings (buttons, labels, actions) */
  ui: CmsUiStrings;
  /** InlineTip contextual texts */
  tips: CmsInlineTips;
  hero: CmsHero;
  steps: {
    context: CmsStepHeader;
    setup: CmsStepHeader;
    styles: CmsStepHeader;
  };
  sections: {
    when: CmsSectionHeader;
    skill: CmsSectionHeader;
    oven: CmsSectionHeader;
    pantry: CmsSectionHeader;
    dietary: CmsSectionHeader;
    equipment: CmsSectionHeader;
  };
  timeSlots: Record<string, CmsTimeSlot>;
  ovenPresets: Record<string, CmsOvenPreset>;
  skillLevels: Record<string, CmsSkillLevel>;
  families: Record<string, CmsFamily>;
  /** Label for "All families" filter chip */
  allFamiliesLabel: string;
  tiers: Record<string, CmsTier>;
  scoreDimensions: Record<string, CmsScoreDimension>;
  recommendationWeights: CmsRecommendationWeights;
  media: {
    stylePhotos: Record<string, string>;
    fallbackPhoto: string;
  };
  result: {
    breadcrumb: string;
    heading: string;
    backLabel: string;
  };
  yeastLabels: Record<string, string>;
  /** Yeast detail descriptions (secondary line) — keyed by yeast id */
  yeastDetails: Record<string, string>;
  flourLabels: Record<string, string>;
  /** Flour detail descriptions (secondary line) — keyed by flour id */
  flourDetails: Record<string, string>;
  /** Advanced faceted filter labels (recommended-styles) */
  filters: {
    advancedLabel: string;
    removeFilters: string;
    brandedFlours: string;
    settingsOpen: string;
    settingsClosed: string;
    hydrationLabel: string;
    hydrationLow: string;
    hydrationMedium: string;
    hydrationHigh: string;
    hydrationExtreme: string;
    textureLabel: string;
    textureCrispyThin: string;
    textureThickAiry: string;
    textureAiryCrumb: string;
    textureDeepDish: string;
    skillLabel: string;
    skillBeginner: string;
    skillIntermediate: string;
    skillAdvanced: string;
    skillExpert: string;
    ovenLabel: string;
    ovenHome: string;
    ovenWood: string;
    ovenElectricHigh: string;
    ovenPan: string;
  };
  /** Glossary page labels */
  glossary: {
    pageTitle: string;
    searchPlaceholder: string;
    cancelSearch: string;
    noResults: string;
    allCategories: string;
    formulaLabel: string;
    rangesLabel: string;
    whyImportantLabel: string;
    relatedLabel: string;
    backToHome: string;
    termCount: string;
    catRheology: string;
    catRheologyDesc: string;
    catFermentation: string;
    catFermentationDesc: string;
    catThermal: string;
    catThermalDesc: string;
    catChemistry: string;
    catChemistryDesc: string;
    catMechanics: string;
    catMechanicsDesc: string;
    catScoring: string;
    catScoringDesc: string;
  };
  /** Engine message templates — keyed by EngineMsg.key, supports {param} interpolation */
  engineMessages: Record<string, string>;
  /** Science grid labels (PizzaNerd panel) */
  scienceLabels: {
    yeastBaker: string;
    effectiveHours: string;
    q10Factor: string;
    q10Cold: string;
    q10Sourdough: string;
    q10Standard: string;
    waterActivity: string;
    glutenNetwork: string;
    proteolysis: string;
    starchDegradation: string;
    fodmapReduction: string;
    plEstimated: string;
    bakingEnergy: string;
    waterTemp: string;
    desiredDoughTemp: string;
    frictionFactor: string;
    deviationCategory: string;
    deviationScore: string;
  };
  /** Timeline step labels, keyed by step id */
  timelineLabels: Record<string, CmsTimelineStep>;
  /** Misc timeline UI strings */
  timelineUi: {
    startLabel: string;
    beforeSuffix: string;
  };
  /** Parametric tips — StyleDetailSheet labels + timeline contextual tips */
  parametricTips: {
    // StyleDetailSheet data pill labels
    pillHydration: string;
    pillFlour: string;
    pillPL: string;
    pillFermentation: string;
    pillThickness: string;
    pillLevel: string;
    pillExperimentation: string;
    pillLevelBeginner: string;
    pillLevelExpert: string;
    // StyleDetailSheet section labels
    sheetSectionTitle: string;
    sheetOvenLabel: string;
    sheetOvenPreheat: string;
    sheetBakeLabel: string;
    sheetBakeTurns: string;
    sheetBakeNoTurns: string;
    sheetDoughLabel: string;
    sheetSaltLabel: string;
    sheetFoldLabel: string;
    sheetFoldInterval: string;
    sheetGenerateBtn: string;
    sheetTechniquesLabel: string;
    // Timeline parametric tips — beginner
    mixBeginner: string;
    bulkBeginner: string;
    shapeBeginner: string;
    topBeginner: string;
    bakeBeginner: string;
    // Timeline parametric tips — nerd
    mixNerd: string;
    bulkNerd: string;
    shapeNerd: string;
    topNerd: string;
    bakeNerd: string;
    // Dynamic fragments
    mixerPlanetaria: string;
    mixerHand: string;
    turnsSingle: string;
    turnsNone: string;
  };
  /** Style descriptions — keyed by style ID */
  styleDescriptions: Record<string, string>;
  /** Style key characteristics — pipe-separated per style ID */
  styleChars: Record<string, string>;
  /** Deviation category labels — keyed by category ID */
  deviationLabels: Record<string, string>;
  /** Author variant names — keyed by variant ID */
  authorNames: Record<string, string>;
  /** Author display names — keyed by variant ID */
  authorAuthors: Record<string, string>;
  /** Profile page — all user-facing strings */
  profile: CmsProfile;
  /** Page-level strings (nav, explore, learn, recipe, not-found, search) */
  pages: CmsPages;
  /** Recipe configurator labels & tooltips */
  configurator: CmsConfigurator;
  /** Pre-ferment guide i18n */
  preFerment: CmsPreFerment;
  /** Dietary data i18n */
  dietaryI18n: CmsDietaryI18n;
  /** Troubleshooting i18n */
  troubleshootingI18n: CmsTroubleshootingI18n;
  /** Glossary term content i18n */
  glossaryTerms: CmsGlossaryTerms;
}

// ═══ DEFAULTS ═══

export const CMS_DEFAULTS: CmsContent = {
  locale: {
    id: "it",
    name: "Italiano",
  },
  ui: {
    copy: "Copia",
    copied: "Copiato!",
    share: "Condividi",
    back: "Indietro",
    reset: "Resetta",
    close: "Chiudi",
    modify: "Modifica",
    disable: "Disattiva",
    restore: "Ripristina",
    generate: "Genera ricetta",
    chooseStyle: "Scegli stile",
    customizeParams: "Personalizza parametri",
    changeStyle: "Cambia stile",
    newPizza: "Nuova pizza",
    // Recipe output
    ingredients: "Ingredienti",
    procedure: "Procedimento",
    steps_count: "{n} passaggi",
    doughBalls: "Panetti",
    doughBallsFrom: "da {w}g",
    totalDough: "totale",
    startTime: "Inizio",
    endTime: "Fine",
    // Recipe output — clipboard/share text
    clipboardTitle: "{style} — Vulcan Pizza Lab",
    clipboardBalls: "{n} panetti da {w}g",
    clipboardTotal: "Totale: {g}g",
    clipboardProcedure: "{style} — Procedimento",
    // Recipe output — ingredient names
    flour: "Farina",
    water: "Acqua",
    salt: "Sale",
    sugar: "Zucchero",
    oilEvo: "Olio d'oliva",
    // Recipe output — compensations
    compTitle: "Compensazioni",
    compTitleNerd: "Compensazioni tecniche",
    compHydration: "Idratazione",
    compOil: "Olio",
    compSugar: "Zucchero",
    compCookTime: "Cottura",
    compThickness: "Spessore",
    compDefault: "Default",
    // Recipe output — aria labels
    ariaReduceBalls: "Riduci il numero di panetti",
    ariaAddBalls: "Aumenta il numero di panetti",
    ariaEarlier: "Inizia prima",
    ariaLater: "Inizia più tardi",
    // Stat strip
    statHydration: "Idratazione",
    statOven: "Forno",
    statCookTime: "Cottura",
    statFermentation: "Lievitazione",
    statTempSuffix: "a {t}°C",
    // Nerd row
    nerdTitle: "Dati tecnici",
    nerdFlourW: "Farina W",
    nerdPL: "P/L",
    nerdYeast: "Lievito",
    nerdHoursAt18: "Ore @18°C",
    nerdQ10: "Q₁₀",
    nerdAw: "Aw",
    // Time format
    seconds: "secondi",
    minutes: "minuti",
    minute: "minuto",
    hours: "ore",
    hour: "ora",
    // Score dashboard
    recipeScore: "Punteggio ricetta",
    nerdToggle: "PizzaNerd",
    nerdActive: "Attiva PizzaNerd",
    scienceTitle: "Vulcan Science",
    ariaCloseScores: "Chiudi i punteggi",
    ariaViewScores: "Visualizza i punteggi",
    tapForDetails: "Tocca per dettagli",
    // Banners
    styleEditorActive: "Style Editor attivo",
    cmsActive: "CMS attivo",
    fieldsModified: "campi modificati",
    fieldModified: "campo modificato",
    /** Oven section — edit label when already configured */
    editOven: "Modifica forno",
    // Weather widget
    weatherCity: "Roma",
    weatherOutdoor: "{t}°C fuori",
    weatherKitchen: "Temperatura cucina",
    // Badges
    badgeIdeal: "IDEALE",
    badgeRecent: "RECENTE",
    autoLabel: "Auto",
    // Oven compact bar
    cancel: "Annulla",
    changeOven: "Cambia",
    ovenFallback: "Forno",
    // Pantry group labels
    pantryFlours: "Farine",
    pantryYeasts: "Lieviti",
    // Equipment labels
    equipMixer: "Impastatrice",
    equipStone: "Pietra refrattaria",
    equipSteel: "Piastra in acciaio",
    equipPan: "Teglia",
    equipKneading: "Impastamento",
    equipSurface: "Superficie cottura",
    // Kitchen / Pantry UI
    kitchenTitle: "La tua cucina",
    pantryOptional: "opzionale",
    specialFlours: "Farine speciali",
    brandSuggest: "Conosci la marca?",
    badgeSelected: "Selezionata",
    otherCompatibleFlours: "Altre farine compatibili",
    flourSelectHint: "Seleziona una farina per aggiornare automaticamente W e P/L della ricetta.",
    flourSelected: "Applicata",
    autolysisSuggested: "Autolisi consigliata",
    // Dietary labels
    dietGlutenFree: "Senza glutine",
    dietLactoseFree: "Senza lattosio",
    dietVegan: "Vegano",
    dietLowFodmap: "Low FODMAP",
    dietHistamine: "Bassa istamina",
    dietNickel: "Basso nichel",
  },
  tips: {
    timeSlot: "La temperatura della cucina influenza i tempi di lievitazione. Più tempo hai, più opzioni per impasti leggeri e digeribili.",
    skill: "Adattiamo la complessità della ricetta alla tua esperienza.",
    equipment: "Pietra o piastra cambiano la crosta. La teglia è essenziale per stili come Teglia Romana o Detroit.",
    oven: "La temperatura massima del forno determina quali stili puoi replicare a casa.",
    pantry: "Adatteremo la ricetta alla tua dispensa reale: farina compatibile e tipo di lievito.",
  },
  hero: {
    title_line1: "La tua",
    title_line2: "pizza perfetta.",
    subtitle: "Raccontaci cosa hai a disposizione e ti guideremo verso lo stile ideale.",
  },
  steps: {
    context: { number: "01 — Contesto", title: "Quando e dove", subtitle: "Tempo, temperatura, ambiente" },
    setup: { number: "02 — Setup", title: "La tua cucina", subtitle: "Strumenti, esperienza, dispensa" },
    styles: { number: "03 — Stile", title: "Scegli il tuo stile", subtitle: "Curati per le tue esigenze" },
  },
  sections: {
    when: { title: "Quando vuoi la pizza?", description: "Seleziona il momento per calcolare i tempi di lievitazione" },
    skill: { title: "Livello di esperienza", description: "Ci aiuta a calibrare la complessità delle ricette" },
    oven: { title: "Il tuo forno", description: "Tipo e temperatura massima" },
    pantry: { title: "Dispensa", description: "Farine e lieviti che hai a casa" },
    dietary: { title: "Esigenze alimentari", description: "Filtri opzionali" },
    equipment: { title: "Attrezzatura", description: "Cosa hai in cucina" },
  },
  timeSlots: {
    tonight:         { label: "Stasera",        sublabel: "4-6 ore",   emoji: "\u{1F319}", hours: 5 },
    tomorrow_lunch:  { label: "Domani pranzo",  sublabel: "16-20 ore", emoji: "\u2600\uFE0F",  hours: 18 },
    tomorrow_dinner: { label: "Domani sera",    sublabel: "24-28 ore", emoji: "\u{1F306}", hours: 26 },
    day_after:       { label: "Dopodomani",     sublabel: "40-48 ore", emoji: "\u{1F4C5}", hours: 44 },
    weekend:         { label: "Nel weekend",    sublabel: "72+ ore",   emoji: "\u{1F389}", hours: 72 },
  },
  ovenPresets: {
    home:              { name: "Forno Domestico",    maxTemp: 250, icon: "home" },
    electric_standard: { name: "Elettrico Standard", maxTemp: 300, icon: "zap" },
    gas:               { name: "Gas Professionale",  maxTemp: 350, icon: "flame" },
    electric_high:     { name: "Elettrico Alta T",   maxTemp: 450, icon: "thermometer" },
    wood:              { name: "Forno a Legna",      maxTemp: 500, icon: "flame-kindling" },
  },
  skillLevels: {
    "1": { name: "Principiante", description: "Prime esperienze con la pizza" },
    "2": { name: "Intermedio",   description: "Ho fatto pizza diverse volte" },
    "3": { name: "Avanzato",     description: "Conosco le tecniche e i parametri" },
    "4": { name: "Esperto",      description: "Padronanza completa delle tecniche" },
  },
  families: {
    napoletana:    { name: "Napoletana",    description: "Leggerezza, lievitazione naturale, cottura veloce ad altissima temperatura", emoji: "\u{1F1EE}\u{1F1F9}" },
    romana:        { name: "Romana",        description: "Dalla croccantezza estrema della Scrocchiarella all'alta idratazione della Teglia", emoji: "\u{1F3DB}\uFE0F" },
    americana:     { name: "Americana",     description: "Adattamento italo-americano: praticita, street food, varieta regionali", emoji: "\u{1F5FD}" },
    contemporanea: { name: "Contemporanea", description: "Digeribilita, sperimentazione, alta idratazione, tecniche avanzate", emoji: "\u{1F52C}" },
  },
  allFamiliesLabel: "Tutte le famiglie",
  tiers: {
    perfect:     { label: "Perfetti",  subtitle: "massima compatibilita" },
    good:        { label: "Buoni",     subtitle: "ottima scelta" },
    challenging: { label: "Sfidanti",  subtitle: "per chi osa" },
  },
  scoreDimensions: {
    authenticity:    { label: "Autenticita",     short: "Aut", weight: 0.30 },
    feasibility:     { label: "Fattibilita",     short: "Fat", weight: 0.25 },
    digestibility:   { label: "Digeribilita",    short: "Dig", weight: 0.20 },
    sustainability:  { label: "Sostenibilita",   short: "Sos", weight: 0.15 },
    experimentation: { label: "Sperimentazione", short: "Spe", weight: 0.10 },
  },
  recommendationWeights: {
    time: 0.25,
    oven: 0.25,
    skill: 0.20,
    equipment: 0.10,
    pantry: 0.20,
  },
  media: {
    stylePhotos: {
      napoletana_stg:      "https://images.unsplash.com/photo-1717883235373-ef10b2a745a3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600&q=80",
      napoletana_canotto:  "https://images.unsplash.com/photo-1770670644186-b3d930f75f5a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600&q=80",
      teglia_romana:       "https://images.unsplash.com/photo-1650327381366-c6dc88f8b9fe?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600&q=80",
      tonda_romana:        "https://images.unsplash.com/photo-1695457207327-2fe494a5aab8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600&q=80",
      pinsa_romana:        "https://images.unsplash.com/photo-1602658015824-b49d35094837?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600&q=80",
      new_york:            "https://images.unsplash.com/photo-1616141032335-7e6b413f93ec?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600&q=80",
      detroit:             "https://images.unsplash.com/photo-1684823906761-30fd02a961cf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600&q=80",
      chicago_deep:        "https://images.unsplash.com/photo-1595378833483-c995dbe4d74f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600&q=80",
      bonci_teglia:        "https://images.unsplash.com/photo-1624323210664-3659370c9346?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600&q=80",
      focaccia_genovese:   "https://images.unsplash.com/photo-1770833047669-2db01dd791e9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600&q=80",
      sfincione:           "https://images.unsplash.com/photo-1711805064484-a77096f599a6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600&q=80",
      pala_romana:         "https://images.unsplash.com/photo-1614936686354-a490b8d90478?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600&q=80",
      grandma_style:       "https://images.unsplash.com/photo-1601387448308-66ae6aa1f1f7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600&q=80",
      focaccia_recco:      "https://images.unsplash.com/photo-1751183295754-9cff9577a44e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600&q=80",
      padellino_torino:    "https://images.unsplash.com/photo-1626108962941-61b46dd705a5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600&q=80",
    },
    fallbackPhoto: "https://images.unsplash.com/photo-1717883235373-ef10b2a745a3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600&q=80",
  },
  result: {
    breadcrumb: "La tua pizza perfetta",
    heading: "Ecco la tua ricetta",
    backLabel: "Torna alla selezione",
  },
  yeastLabels: {
    fresh: "Lievito fresco",
    dry: "Lievito secco",
    sourdough: "Lievito madre",
  },
  yeastDetails: {
    fresh: "Cubetto classico",
    dry: "Pratico, lunga conservazione",
    sourdough: "Sapore complesso, lunga maturazione",
  },
  flourLabels: {
    "00": "Farina 00",
    "0": "Farina 0",
    manitoba: "Manitoba",
    integrale: "Integrale",
    semola: "Semola rimacinata",
  },
  flourDetails: {
    "00": "Classica, versatile",
    "0": "Media forza",
    manitoba: "Alta forza, lunga maturazione",
    integrale: "Più fibra e sapore",
    semola: "Croccantezza, colore dorato",
  },
  filters: {
    advancedLabel: "Filtri avanzati",
    removeFilters: "Rimuovi filtri avanzati",
    brandedFlours: "Farine di marca",
    settingsOpen: "Impostazioni",
    settingsClosed: "Le tue impostazioni",
    hydrationLabel: "💧 Idratazione",
    hydrationLow: "Bassa <60%",
    hydrationMedium: "Media 60-70%",
    hydrationHigh: "Alta 70-85%",
    hydrationExtreme: "Estrema >85%",
    textureLabel: "🎯 Texture",
    textureCrispyThin: "Sottile croccante",
    textureThickAiry: "Alta soffice",
    textureAiryCrumb: "Alveolata",
    textureDeepDish: "Deep dish",
    skillLabel: "👨‍🍳 Livello",
    skillBeginner: "Principiante",
    skillIntermediate: "Intermedio",
    skillAdvanced: "Avanzato",
    skillExpert: "Esperto",
    ovenLabel: "🔥 Cottura",
    ovenHome: "Forno casa",
    ovenWood: "Legna",
    ovenElectricHigh: "Elettrico >350°C",
    ovenPan: "Padella",
  },
  glossary: {
    pageTitle: "Glossario Tecnico",
    searchPlaceholder: "Cerca termine, simbolo o definizione...",
    cancelSearch: "Cancella",
    noResults: "Nessun termine trovato per \"{query}\"",
    allCategories: "Tutti",
    formulaLabel: "Formula",
    rangesLabel: "Range tipici",
    whyImportantLabel: "Perch\u00E9 importante",
    relatedLabel: "Correlati",
    backToHome: "Torna alla home",
    termCount: "{count} termini",
    catRheology: "Reologia",
    catRheologyDesc: "Propriet\u00E0 meccaniche della farina e dell\u2019impasto",
    catFermentation: "Fermentazione",
    catFermentationDesc: "Lievitazione, maturazione e processi biologici",
    catThermal: "Termica",
    catThermalDesc: "Trasferimento calore e cottura",
    catChemistry: "Chimica",
    catChemistryDesc: "Composizione e reazioni chimiche",
    catMechanics: "Meccanica",
    catMechanicsDesc: "Lavorazione, attrezzature e misure",
    catScoring: "Punteggi",
    catScoringDesc: "Metriche di qualit\u00E0 Vulcan",
  },
  engineMessages: {
    // Authenticity penalties
    "auth.hydrationOff": "Idratazione fuori centro (-{penalty}%)",
    "auth.wOutOfRange": "W farina fuori range (-{penalty}%)",
    "auth.plOutOfRange": "P/L {pl} fuori range {plMin}-{plMax} (-{penalty}%)",
    "auth.notWoodOven": "Forno non a legna (-15%)",
    "auth.tempVsIdeal": "Temperatura {temp}°C vs {ideal}°C (-{penalty}%)",
    "auth.tempBelowMin": "Temperatura sotto minimo (-{penalty}%)",
    "auth.fermentTooShort": "Fermentazione troppo breve (-{penalty}%)",
    "auth.fermentTooLong": "Fermentazione troppo lunga (-{penalty}%)",
    // Feasibility warnings
    "feas.ovenSuboptimal": "Forno sotto-ottimale: {temp}°C vs ideale {ideal}°C",
    "feas.ovenTooCold": "Forno troppo freddo: {temp}°C < minimo {min}°C",
    "feas.wTooLow": "W troppo basso: {w} < {wMin}",
    "feas.wTooHigh": "W molto alto ({w}). Impasto tenace.",
    "feas.hydrationBeginnerHigh": "Idratazione >75% sconsigliata per principianti",
    "feas.hydrationNeedsPractice": "Idratazione alta richiede pratica",
    "feas.hydrationMedBeginner": "Idratazione media-alta per principiante",
    "feas.flourTooWeakForHydration": "Farina troppo debole per questa idratazione",
    "feas.prefermentNeedsExperience": "Pre-fermento richiede esperienza",
    // Digestibility claims
    "dig.fermentTooShort": "Fermentazione troppo breve: amidi non degradati",
    "dig.fermentShort": "Fermentazione breve: digeribilità limitata",
    "dig.fodmapReduced": "FODMAP ridotti ~{pct}%",
    "dig.fodmapHighReduction": "FODMAP ridotti >80%",
    "dig.extremeMaturation": "Maturazione estrema: massima complessità aromatica",
    "dig.highYeastDosage": "Dosaggio lievito alto ({pct}%): -{penalty}% digeribilità",
    "dig.coldFermentation": "Fermentazione fredda: attività enzimatica ottimale",
    // Sustainability claims
    "sust.quickCook": "Cottura rapida: basso consumo energetico",
    "sust.longCook": "Cottura lunga: consumo energetico elevato",
    "sust.ambientFerment": "Fermentazione a temperatura ambiente: nessun consumo frigorifero",
    "sust.pureDough": "Impasto puro: solo farina, acqua, sale, lievito",
    "sust.sourdoughZeroImpact": "Lievito madre: autoprodotto, a impatto zero",
    // Recommendation reasons/warnings
    "rec.timeCompatible": "Fermentazione {fMin}-{fMax}h: compatibile con il tuo tempo",
    "rec.timeAdaptable": "Fermentazione adattabile a ~{hours}h",
    "rec.timeInsufficient": "Richiede minimo {fMin}h, hai {available}h",
    "rec.needsWoodOven": "Richiede forno a legna",
    "rec.ovenIdeal": "Il tuo forno raggiunge la temperatura ideale ({ideal}°C)",
    "rec.ovenAdequate": "Forno adeguato (compensazione automatica tempo/temperatura)",
    "rec.ovenTooCold": "Forno troppo freddo: {temp}°C < min {min}°C",
    "rec.skillMatch": "Adatto al tuo livello",
    "rec.skillExpert": "Il tuo livello permette qualsiasi stile",
    "rec.hydrationNeedsPractice": "Idratazione alta richiede pratica",
    "rec.advancedForBeginner": "Stile avanzato per principianti",
    "rec.noKneadNoMixer": "Non serve impastatrice (no-knead)",
    "rec.handsHighHydration": "Idratazione alta: impasto a mano molto difficile",
    "rec.handsMedHydration": "Idratazione media-alta: impasto a mano richiede pratica",
    "rec.forkIdealHighH": "Forcella ideale per alta idratazione",
    "rec.forkLowFriction": "Impastatrice a forcella: basso attrito termico",
    "rec.spiralOptimal": "Spirale professionale: impasto ottimale",
    "rec.domesticStrugglesHighH": "Planetaria domestica: può faticare con idratazione >80%",
    "rec.mixerHelps": "La tua impastatrice facilita il processo",
    "rec.mixerRecommended": "Idratazione alta: impastatrice consigliata",
    "rec.castIronPerfect": "Ghisa perfetta per questo stile",
    "rec.panFits": "Teglia adatta a questo stile",
    "rec.needsPan": "Serve una teglia per questo stile",
    "rec.refractoryIdeal": "Biscotto refrattario: ideale per la napoletana",
    "rec.steelPlateCrispy": "Piastra in acciaio: base croccante in secondi",
    "rec.panPerfect": "La tua teglia è perfetta per questo stile",
    "rec.flourMatch": "Farina in dispensa compatibile",
    "rec.flourPartial": "Farina parzialmente adatta (W non ideale)",
    "rec.flourNoMatch": "Nessuna farina in dispensa nel range W richiesto",
    "rec.sourdoughLongFerment": "Lievito madre ideale per maturazione lunga",
    "rec.sourdoughOnlyShort": "Solo lievito madre: fermentazione breve difficile",
    "tip.waterTemp": "",
    "tip.waterTempCold": "Regola 55: usa acqua dal frigo ({temp}°C). L'impasto a macchina scalda la massa.",
    "tip.waterTempNormal": "Regola 55: usa acqua a {temp}°C per raggiungere {ddt}°C di impasto.",
    "tip.frictionNote": "Compensazione attrito impastatrice: {friction}°C",
  },
  scienceLabels: {
    yeastBaker: "Lievito da forno",
    effectiveHours: "Ore effettive",
    q10Factor: "Fattore Q₁₀",
    q10Cold: "Q₁₀ freddo",
    q10Sourdough: "Q₁₀ lievito madre",
    q10Standard: "Q₁₀ standard",
    waterActivity: "Attività acquosa",
    glutenNetwork: "Rete glutine",
    proteolysis: "Proteolisi",
    starchDegradation: "Degradazione amido",
    fodmapReduction: "Riduzione FODMAP",
    plEstimated: "P/L stimato",
    bakingEnergy: "Energia di cottura",
    waterTemp: "Temperatura acqua",
    desiredDoughTemp: "Temperatura impasto",
    frictionFactor: "Fattore attrito",
    deviationCategory: "Deviazione",
    deviationScore: "Dev. effettiva",
  },
  timelineLabels: {
    preferment: {
      title: "Pre-Fermento",
      desc: "Mescolare {type} e far maturare",
      tipBeginner: "Il pre-fermento \u00E8 come un \"antipasto\" per il lievito. Mescola e lascia riposare coperto.",
      tipNerd: "Il pre-fermento produce acidi organici (lattico/acetico) che abbassano il pH a ~4.5, migliorando la rete glutinica e la shelf life.",
    },
    mix: {
      title: "Impasto",
      desc: "Impastare fino a incordatura. Liscio e elastico.",
      descAlt: "Mescolare gli ingredienti senza impastare. Serie di pieghe.",
      tipBeginner: "L'impasto \u00E8 pronto quando \u00E8 liscio e si stacca dalle mani. Se appiccica troppo, aspetta 5 min e riprova.",
      tipNerd: "L'incordatura avviene quando glutenina e gliadina formano ponti disolfuro stabili. Il test del velo verifica la maglia glutinica.",
    },
    mix_noknead: {
      title: "Impasto",
      desc: "Mescolare gli ingredienti senza impastare. Serie di pieghe.",
      tipBeginner: "Non serve impastare! Mescola con una spatola finch\u00E9 non ci sono pi\u00F9 grumi di farina asciutta.",
      tipNerd: "L'autolisi sfrutta le proteinasi endogene della farina per sviluppare il glutine senza lavoro meccanico.",
    },
    bulk: {
      title: "Puntata (Bulk)",
      desc: "Lievitazione in massa a {temp}\u00B0C",
      tipBeginner: "L'impasto deve raddoppiare di volume. Se fa caldo, controlla pi\u00F9 spesso!",
      tipNerd: "A {temp}\u00B0C la velocit\u00E0 di fermentazione \u00E8 {factor}\u00D7 rispetto al riferimento 18\u00B0C.",
    },
    bulk_cold: {
      title: "Puntata (Bulk)",
      desc: "Lievitazione in massa a {temp}\u00B0C",
      tipBeginner: "In frigo l'impasto cresce lento ma guadagna sapore. Copri bene con pellicola a contatto.",
      tipNerd: "A {temp}\u00B0C il Q\u2081\u2080\u22482.0 rallenta la fermentazione. L'attivit\u00E0 proteolitica prevale, degradando i FODMAP.",
    },
    divide: {
      title: "Staglio",
      desc: "Dividere in panetti del peso corretto. Formare pallina.",
      tipBeginner: "Usa una bilancia! Taglia con un tarocco e arrotonda ogni pezzo in una palla liscia.",
      tipNerd: "Lo staglio crea tensione superficiale che intrappola CO\u2082 durante l'appretto e definisce la struttura alveolare finale.",
    },
    proof: {
      title: "Appretto",
      desc: "Lievitazione finale a {temp}\u00B0C",
      tipBeginner: "I panetti devono essere morbidi. Se li premi con un dito, tornano su lentamente.",
      tipNerd: "Poke test: ritorno lento = fermentazione ottimale. Troppo rapido = sotto-lievitato. Nessun ritorno = over-proofed.",
    },
    shape: {
      title: "Stesura",
      desc: "Allargare a mano dal centro, preservare il cornicione",
      descAlt: "Stendere nella teglia oliata con le mani",
    },
    shape_thin: {
      title: "Stesura",
      desc: "Stendere con mattarello, sottilissima",
    },
    top: {
      title: "Farcitura",
      desc: "Condire la pizza secondo gusto",
    },
    bake: {
      title: "Cottura",
      desc: "Cuocere a {temp}\u00B0C",
      tipBeginner: "Il forno deve essere caldissimo. Preriscalda almeno 30 minuti prima.",
      tipNerd: "La reazione di Maillard inizia a ~140\u00B0C e accelera esponenzialmente. A {temp}\u00B0C la caramellizzazione crea ~600 composti aromatici.",
    },
  },
  timelineUi: {
    startLabel: "Inizio",
    beforeSuffix: "prima",
  },
  parametricTips: {
    // Data pill labels
    pillHydration: "Idratazione",
    pillFlour: "Farina",
    pillPL: "P/L",
    pillFermentation: "Fermentazione",
    pillThickness: "Spessore",
    pillLevel: "Livello",
    pillExperimentation: "Sperimentazione",
    pillLevelBeginner: "Principiante",
    pillLevelExpert: "Esperto",
    // StyleDetailSheet labels
    sheetSectionTitle: "Dettagli cottura",
    sheetOvenLabel: "Forno ideale",
    sheetOvenPreheat: "Preriscaldamento: {min} min",
    sheetBakeLabel: "Tempo cottura",
    sheetBakeTurns: "{n} rotazione/i",
    sheetBakeNoTurns: "Nessuna rotazione",
    sheetDoughLabel: "Panetto",
    sheetSaltLabel: "Sale",
    sheetFoldLabel: "Pieghe",
    sheetFoldInterval: "Ogni {min} min",
    sheetGenerateBtn: "Genera ricetta",
    sheetTechniquesLabel: "Tecniche d'autore compatibili",
    // Timeline — beginner
    mixBeginner: "{mixer} (~{time} min di impasto). {equipment}",
    bulkBeginner: "Esegui {count} pieghe ({type}) ogni {interval} minuti per sviluppare la struttura.",
    shapeBeginner: "{note}",
    topBeginner: "Ordine: {order}. {note}",
    bakeBeginner: "Tempo: {minM}\u2013{maxM} min. {turnsNote}",
    // Timeline — nerd
    mixNerd: "{mixer} \u00B7 mixing ~{time} min \u00B7 {note}",
    bulkNerd: "Pieghe: {count}\u00D7 {type} ogni {interval} min \u00B7 {note}",
    shapeNerd: "Scoring: {type} \u00B7 profondit\u00E0 {depth}mm \u00B7 {timing} \u00B7 {note}",
    topNerd: "Ordine condimento: {order} \u00B7 salsa {saucePos} \u00B7 {cheeseType} ({cheesePos}) \u00B7 {note}",
    bakeNerd: "Cottura ideale: {idealSec}s (range {minM}\u2013{maxM} min) \u00B7 {turns} rotazioni \u00B7 {note}",
    // Dynamic fragments
    mixerPlanetaria: "Planetaria consigliata",
    mixerHand: "Impasto a mano possibile",
    turnsSingle: "Ruota {n} volta/e per cottura uniforme.",
    turnsNone: "Non girare durante la cottura.",
  },
  styleDescriptions: {
    napoletana_stg: "Standard aureo secondo disciplinare AVPN. Cornicione gonfio, centro sottile, leopardatura.",
    napoletana_canotto: "Cornicione esplosivo \"canotto d'aria\", alveolatura estrema, alta digeribilit\u00E0.",
    teglia_romana: "Alta idratazione, no-knead con pieghe. Base croccante, mollica nuvola.",
    tonda_romana: "Sottilissima, mattarello obbligatorio, croccante estrema. \"Scrocchiarella\".",
    pinsa_romana: "Mix 70% frumento / 15% soia / 15% riso. Forma ovale, crosta vetrosa.",
    pala_romana: "Formato ovale allungato servito su pala. Via di mezzo tra tonda e teglia: croccante fuori, nuvola dentro.",
    new_york: "Fetta grande pieghevole, crosta croccante ma flessibile. Street food.",
    detroit: "Cheese crown croccante, teglia Blue Steel. Formaggio fino ai bordi.",
    chicago_deep: "Pizza profonda come una torta salata. Strati invertiti: formaggio-ripieno-salsa.",
    bonci_teglia: "No-knead con pieghe, idratazione estrema, maestro Bonci. Alta digeribilit\u00E0.",
    focaccia_genovese: "Soffice e unta, con crosta dorata e crateri caratteristici. Salamoia olio-acqua in superficie.",
    sfincione: "Pizza spessa siciliana con pomodoro, cipolla, acciughe, caciocavallo e pangrattato. Street food di Palermo.",
    grandma_style: "Sottile, croccante, teglia oliata. La pizza della nonna italo-americana. Mozzarella sotto, salsa sopra.",
    focaccia_recco: "Due sfoglie sottilissime con stracchino fuso. IGP dal 2015. Bolle dorate caratteristiche.",
    padellino_torino: "Cotta in padellino di ferro e finita in forno. Fondo croccante burro-olio, soffice al centro. Specialit\u00E0 torinese.",
  },
  styleChars: {
    napoletana_stg: "Cornicione 1-2cm gonfio|Centro 3-4mm sottile|Crosta leopardata|Cottura 60-90s",
    napoletana_canotto: "Cornicione 3-4cm \"canotto\"|Alveolatura estrema|Maturazione 24-72h|Digeribilit\u00E0 alta",
    teglia_romana: "Altezza 2-3cm|Idratazione 80-100%|No-knead + pieghe|Mollica nuvola",
    tonda_romana: "Spessore 1-2mm|Mattarello obbligatorio|Croccante estrema|Farina debole W<210",
    pinsa_romana: "Mix multi-cereale|Forma ovale|Crosta vetrosa|Maturazione 24-72h",
    pala_romana: "Forma ovale allungata|Alta idratazione|Servita su pala|Crosta croccante-nuvola",
    new_york: "Fetta pieghevole|Zucchero + olio|Cottura 12-15min|Oleosit\u00E0 caratteristica",
    detroit: "Cheese crown|Teglia profonda|Formaggio ai bordi|Crosta caramellata",
    chicago_deep: "Profondit\u00E0 5cm|Burro 18%|Strati invertiti|Cottura 35min",
    bonci_teglia: "No-knead + pieghe|Idratazione estrema|Maturazione 24-72h|Alveolatura nuvola",
    focaccia_genovese: "Olio EVO generoso|Crateri superficiali|Salamoia olio-acqua|Cottura 15-20min",
    sfincione: "Spesso e soffice|Pangrattato tostato|Cipolla + acciughe|Caciocavallo",
    grandma_style: "Sottile e croccante|Mozzarella sotto salsa|Teglia ben oliata|Cottura 12-16min",
    focaccia_recco: "Sfoglia quasi trasparente|Ripiena di stracchino|Bolle dorate|Nessuna lievitazione",
    padellino_torino: "Padellino di ferro|Fondo ultra-croccante|Morbida al centro|Porzione individuale",
  },
  deviationLabels: {
    canonical: "Canonico",
    parameter_variant: "Variazione parametrica",
    technique_variant: "Variante tecnica",
    hybrid: "Ibridazione",
    experimental: "Sperimentale",
  },
  authorNames: {
    bonci_no_knead: "No-Knead Alta Idratazione",
    martucci_biga_ibrida: "Biga Ibrida 50% + Autolisi",
    martucci_biga_100: "Biga 100% con Rinfresco",
    pepe_sensoriale: "Idratazione Sensoriale",
    bosco_idrolisi: "Metodo Idrolisi (Fermentazione Spontanea)",
    capuano_forbici: "Metodo Forbici (Latticini)",
    pepe_sensory_layering: "Cottura Separata Ingredienti",
    bianco_long_ferment: "Fermentazione 5 Giorni",
    forkish_saturday: "Saturday Pizza (Cold Fermentation)",
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
    pageTitle: "Il tuo Profilo",
    pageSubtitle: "Le tue preferenze, sempre a portata di mano.",
    ovenTitle: "Il tuo forno",
    ovenSubtitle: "Determina temperature e stili disponibili",
    ovenStep: "01 — Attrezzatura",
    tempLabel: "Temperatura massima",
    tempAria: "Temperatura massima forno",
    skillTitle: "La tua esperienza",
    skillSubtitle: "Adattiamo la complessità delle ricette",
    skillStep: "02 — Livello",
    pantryTitle: "La tua dispensa",
    pantrySubtitle: "Farine e lieviti che hai a disposizione",
    pantryStep: "03 — Ingredienti",
    dietTitle: "Preferenze dietetiche",
    dietSubtitle: "Filtra stili e ingredienti incompatibili",
    dietStep: "04 — Dieta",
    noDietNote: "Nessuna restrizione — tutti gli stili disponibili.",
    prefsTitle: "Lingua e tema",
    prefsSubtitle: "Personalizza l'interfaccia",
    prefsStep: "05 — Preferenze",
    locationTitle: "La tua posizione",
    locationSubtitle: "Per la temperatura ambiente e i calcoli di fermentazione",
    locationStep: "06 — Posizione",
    locationPlaceholder: "Cerca città...",
    locationAuto: "Rileva posizione",
    locationAutoDetected: "Rilevata automaticamente",
    locationSaved: "Posizione salvata",
    locationNone: "Nessuna posizione impostata — useremo un valore standard.",
    locationSearching: "Ricerca...",
    locationNoResults: "Nessun risultato",
    langLabel: "Lingua",
    themeLabel: "Tema",
    themeLight: "Chiaro",
    themeDark: "Scuro",
    resetProfile: "Riconfigura profilo",
    devModeOn: "Modalità sviluppo attiva",
    devModeOff: "Attiva modalità sviluppo",
    ftuWelcome: "Benvenuto",
    ftuOvenTitle: "Che forno hai?",
    ftuOvenSubtitle: "Il forno definisce gli stili possibili",
    ftuSkillTitle: "Quanta esperienza?",
    ftuSkillSubtitle: "Ti guideremo al livello giusto",
    ftuPantryTitle: "Cosa hai in dispensa?",
    ftuPantrySubtitle: "Farine e lieviti disponibili",
    ftuBack: "Indietro",
    ftuNext: "Avanti",
    ftuStart: "Inizia",
    localeModalTitle: "Cambiare lingua?",
    localeModalDesc: "Tutti i testi dell'interfaccia passeranno da {from} a {to}.",
    localeModalCancel: "Annulla",
    localeModalConfirm: "Conferma",
    flour00: "Tipo 00",
    flour0: "Tipo 0",
    flourManitoba: "Manitoba",
    flourIntegrale: "Integrale",
    flourSemola: "Semola rimacinata",
    yeastFresh: "Lievito fresco",
    yeastDry: "Lievito secco",
    yeastSourdough: "Lievito madre",
    dietGlutenFree: "Senza glutine",
    dietLactoseFree: "Senza lattosio",
    dietVegan: "Vegano",
    dietLowFodmap: "Low FODMAP",
    dietHistamine: "Bassa istamina",
    dietNickel: "Basso nichel",
    // Equipment
    equipTitle: "Attrezzatura",
    equipSubtitle: "Cosa hai in cucina",
    equipStep: "03 — Attrezzatura",
    equipMixerTitle: "Impastamento",
    equipSurfaceTitle: "Superficie di cottura",
    equipToolsTitle: "Utensili",
    equipSummaryNone: "Non selezionato",
    equipSummarySelected: "{count} selezionati",
    mixerHands: "A mano",
    mixerHandsDesc: "Impasto manuale, nessuna attrezzatura",
    mixerStandDomestic: "Planetaria domestica",
    mixerStandDomesticDesc: "KitchenAid, Kenwood, Smeg — 4-7 L, gancio K",
    mixerPlanetary: "Planetaria semi-pro",
    mixerPlanetaryDesc: "10-20 L, gancio a spirale, potenza 500W+",
    mixerSpiral: "Impastatrice a spirale",
    mixerSpiralDesc: "Vasca fissa/ribaltabile, professionale",
    mixerFork: "Impastatrice a forcella",
    mixerForkDesc: "Lenta, basso attrito — ideale per alte idratazioni",
    mixerLevelHome: "Casa",
    mixerLevelSemiPro: "Semi-Pro",
    mixerLevelPro: "Pro",
    surfaceRefractory: "Biscotto refrattario",
    surfaceRefractoryDesc: "3 cm, alta massa termica — forno a legna e prosumer",
    surfaceCordierite: "Pietra cordierite",
    surfaceCordieriteDesc: "1.5 cm, compromesso massa/velocità — Effeuno, Ooni",
    surfaceSteel: "Piastra in acciaio",
    surfaceSteelDesc: "5-10 mm, trasferimento rapidissimo — base croccante in secondi",
    surfaceAluminum: "Teglia in alluminio",
    surfaceAluminumDesc: "Leggera, conducibilità estrema — Detroit, teglia romana",
    surfaceBlueSteel: "Teglia in ferro blu",
    surfaceBlueSteelDesc: "Antiaderente naturale, bordo alto — teglia romana, focaccia",
    surfaceCastIron: "Padella in ghisa",
    surfaceCastIronDesc: "Alta massa termica, bordo alto — Chicago, padellino",
    surfaceOvenRack: "Griglia del forno",
    surfaceOvenRackDesc: "Nessuna superficie aggiuntiva — solo la griglia standard",
    toolCatEssential: "Essenziali",
    toolCatPrecision: "Precisione",
    toolCatHandling: "Movimentazione",
    toolCatContainment: "Contenimento",
    toolDigitalScale: "Bilancia digitale",
    toolDigitalScaleDesc: "Precisione 1g, capacità 5kg+",
    toolThermometer: "Termometro",
    toolThermometerDesc: "IR o a sonda, per impasto e forno",
    toolScraper: "Raschietto",
    toolScraperDesc: "Plastica flessibile per pieghe e taglio",
    toolContainers: "Contenitori lievitazione",
    toolContainersDesc: "Cassette impilabili o ciotole con coperchio",
    toolDoughCutter: "Tagliapasta",
    toolDoughCutterDesc: "Inox, per porzionare panetti con precisione",
    toolBenchKnife: "Spatola da banco",
    toolBenchKnifeDesc: "Acciaio inox, per ribaltare impasti ad alta idratazione",
    toolScoringBlade: "Lametta per scoring",
    toolScoringBladeDesc: "Per incisioni decorative sulla superficie",
    toolPeelWood: "Pala in legno",
    toolPeelWoodDesc: "Per infornare — basso attrito con semola",
    toolPeelMetal: "Pala in alluminio",
    toolPeelMetalDesc: "Per girare e sfornare — sottile e reattiva",
    toolPizzaScreen: "Retina forata",
    toolPizzaScreenDesc: "Alluminio perforato per cottura croccante",
    toolProofingBoxes: "Cassette per lievitazione",
    toolProofingBoxesDesc: "Impilabili con coperchio — 30×40 o 40×60 cm",
    toolBannetons: "Cestini lievitazione",
    toolBannetonsDesc: "Per forme tonde, con telo in lino",
  },
  pages: {
    navCreate: "Crea",
    navExplore: "Stili",
    navLearn: "Impara",
    navProfile: "Profilo",
    navSearch: "Cerca",
    exploreStepNum: "15 stili — 4 famiglie",
    exploreTitle: "Esplora gli Stili",
    exploreSubtitle: "Dalla Napoletana STG alla Focaccia di Recco.",
    learnTitle: "Impara",
    learnSubtitle: "La scienza e l'arte della pizza, spiegata bene.",
    learnGlossary: "Glossario",
    learnGlossaryDesc: "30+ termini tecnici della panificazione",
    learnTroubleshooting: "Problemi & Soluzioni",
    learnTroubleshootingDesc: "20 problemi comuni e come risolverli",
    learnPreFerments: "Pre-fermenti",
    learnPreFermentsDesc: "Guida a Biga, Poolish e Autolisi",
    recipeLabel: "Ricetta",
    recipeBackToStyles: "Stili",
    recipeStyleNotFound: "Stile non trovato",
    recipeStyleNotFoundDesc: "Lo stile \"{id}\" non esiste nel database.",
    recipeExploreStyles: "Esplora stili",
    recipeCopyLinkAria: "Copia link ricetta",
    notFoundTitle: "Pagina non trovata",
    notFoundSubtitle: "Questa pizza non esiste nel nostro menu.",
    notFoundBack: "Torna alla home",
    searchPlaceholder: "Cerca stile, farina, termine, problema…",
    searchCatStyles: "Stili",
    searchCatFlours: "Farine",
    searchCatGlossary: "Glossario",
    searchCatProblems: "Problemi",
    searchCatGuides: "Guide",
    searchNoResults: "Nessun risultato per \"{query}\"",
    searchHint: "Digita per cercare tra stili, farine, glossario e problemi",
    searchSuggestions: "Suggerimenti",
    searchFlourWheat: "Grano tenero",
    searchFlourManitoba: "Manitoba",
    searchFlourSemola: "Semola",
    searchFlourWholegrain: "Integrale",
    searchFlourGlutenFree: "Senza glutine",
    searchFlourSpecial: "Speciale",
    skipToContent: "Salta al contenuto",
    navMainLabel: "Navigazione principale",
    searchCloseLabel: "Chiudi ricerca",
    searchFieldLabel: "Campo di ricerca globale",
    searchClearLabel: "Cancella ricerca",
    dietaryWarningsTitle: "Avvisi dietetici",
    troubleshootingTitle: "Problemi con la ricetta?",
    troubleshootingDesc: "Consulta la guida a 20 problemi comuni e soluzioni",
  },
  configurator: {
    hydrationLabel: "Idratazione",
    hydrationTip: "Percentuale d'acqua rispetto alla farina. Più alta = impasto più morbido e alveolatura aperta, ma più difficile da gestire.",
    flourWLabel: "Forza Farina (W)",
    flourWTip: "Indica la capacità di assorbire acqua e trattenere gas. W più alto = lievitazioni più lunghe e struttura più forte.",
    plLabel: "Rapporto P/L",
    plTip: "Rapporto alveografico tenacità/estensibilità della farina. P/L basso = impasto estensibile (pizza tonda). P/L alto = impasto tenace (lunga lievitazione). Stimato dalla W se non modificato manualmente.",
    fermentLabel: "Fermentazione",
    fermentTip: "Tempo totale di lievitazione. Più ore a temperature basse = sapore più complesso e migliore digeribilità.",
    tempFridge: "4°C frigo",
    tempCool: "12°C",
    tempAmbient: "22°C amb.",
    preFermentLabel: "Pre-fermento",
    preFermentTip: "Il pre-fermento (biga, poolish) è una porzione di impasto fermentata in anticipo. Migliora sapore, digeribilità e conservazione. Richiede 12-24h in più di pianificazione.",
    ovenLabel: "Forno",
    ovenTip: "Seleziona il tipo e regola la temperatura. Temperature più alte = cottura più rapida e crosta migliore.",
    panLabel: "Teglia",
    panTipRect: "Forma e dimensioni della teglia influenzano la quantità di impasto e il risultato finale. Lo standard per questo stile è rettangolare.",
    panTipRound: "Forma e dimensioni della teglia influenzano la quantità di impasto e il risultato finale. Lo standard per questo stile è tonda.",
    panRectangular: "Rettangolare",
    panRound: "Tonda",
    panLength: "Lunghezza",
    panWidth: "Larghezza",
    panDiameter: "Diametro",
    panArea: "Area teglia",
    thicknessLabel: "Spessore",
    thicknessTip: "Lo spessore della pizza influenza direttamente la quantità di impasto per panetto, la cottura e la consistenza finale. Valori più bassi = sottile e croccante. Valori più alti = soffice e alta.",
    thicknessThin: "Sottile e croccante",
    thicknessThick: "Alta e soffice",
    thicknessStandard: "Standard per questo stile",
    backLabel: "Indietro",
    sliderOptimal: "ottimale",
    hintHighHydrationNeedsW: "Con idratazione al {h}%, servono farine forti: W consigliato ≥ {w}",
    hintLowWLimitsHydration: "Con W {w}, idratazione massima consigliata ~{h}%",
    hintLongFermentUseFridge: "Con {hours}h di fermentazione, meglio in frigo (4°C) per controllare l'impasto",
    hintShortFermentUseWarm: "Con solo {hours}h, fermenta a temperatura ambiente (22°C) per attivare i lieviti",
    hintMediumFermentUseCool: "Con {hours}h, temperatura fresca (12°C) è il compromesso ideale tra controllo e attività",
    hintHighHydrationNeedsTime: "Con idratazione al {h}%, consigliata fermentazione ≥ {hours}h",
    hintLowPLForHighHydration: "Con idratazione alta, consigliato P/L ≤ {pl} per estensibilità",
    hintHighWAllowsMoreHydration: "Con W {w}, puoi arrivare fino al {h}% di idratazione",
    hintAdaptiveLabel: "suggerito",
    hintLimitMinLabel: "limite min",
    hintLimitMaxLabel: "limite max",
  },
  preFerment: PRE_FERMENT_DEFAULTS,
  dietaryI18n: DIETARY_I18N_DEFAULTS,
  troubleshootingI18n: TROUBLESHOOTING_I18N_DEFAULTS,
  glossaryTerms: GLOSSARY_TERMS_DEFAULTS,
};

// ═══ DEEP MERGE / GET / SET UTILITIES ═══

function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

/** Get a nested value by dot-path: "hero.title_line1" */
export function getByPath(obj: any, path: string): any {
  return path.split(".").reduce((o, k) => (o != null ? o[k] : undefined), obj);
}

/** Set a nested value by dot-path, returning a new object (immutable) */
export function setByPath(obj: any, path: string, value: any): any {
  const clone = deepClone(obj);
  const keys = path.split(".");
  let cur = clone;
  for (let i = 0; i < keys.length - 1; i++) {
    if (cur[keys[i]] == null) cur[keys[i]] = {};
    cur = cur[keys[i]];
  }
  cur[keys[keys.length - 1]] = value;
  return clone;
}

/** Deep diff: returns paths that differ between two objects */
export function deepDiffPaths(a: any, b: any, prefix = ""): string[] {
  const paths: string[] = [];
  const allKeys = new Set([
    ...Object.keys(a || {}),
    ...Object.keys(b || {}),
  ]);
  for (const key of allKeys) {
    const p = prefix ? `${prefix}.${key}` : key;
    const va = a?.[key];
    const vb = b?.[key];
    if (typeof va === "object" && va !== null && typeof vb === "object" && vb !== null) {
      paths.push(...deepDiffPaths(va, vb, p));
    } else if (va !== vb) {
      paths.push(p);
    }
  }
  return paths;
}

// ═══ PERSISTENCE ═══

const STORAGE_KEY = "vulcan_cms";

/** Detect best locale from browser language, with fallback to English (not Italian).
 * Returns null if Italian is detected (since Italian is the default). */
function detectBrowserLocale(): LocaleId | null {
  try {
    const langs = navigator.languages ?? [navigator.language];
    for (const lang of langs) {
      const code = lang.split("-")[0].toLowerCase();
      if (code === "it") return null; /* Italian = default, no override needed */
      if (code in LOCALE_BUNDLES) return code as LocaleId;
    }
    /* No match found — fallback to English */
    return "en";
  } catch {
    return "en";
  }
}

function loadCms(): Partial<CmsContent> | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (typeof parsed === "object" && parsed !== null) return parsed;
    }
  } catch { /* storage restricted */ }

  /* First launch: auto-detect browser language */
  const detectedLocale = detectBrowserLocale();
  if (detectedLocale) {
    const bundle = LOCALE_BUNDLES[detectedLocale];
    if (bundle) {
      const initial = { ...bundle } as Partial<CmsContent>;
      saveCms(initial);
      return initial;
    }
  }
  return null;
}

function saveCms(overrides: Partial<CmsContent> | null) {
  try {
    if (overrides && Object.keys(overrides).length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(overrides));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch { /* storage restricted */ }
}

// ═══ MERGE: overrides on top of defaults ═══

function deepMerge(defaults: any, overrides: any): any {
  if (overrides == null) return defaults;
  if (typeof defaults !== "object" || defaults === null) return overrides ?? defaults;
  const result: any = { ...defaults };
  for (const key of Object.keys(overrides)) {
    if (typeof defaults[key] === "object" && defaults[key] !== null && typeof overrides[key] === "object" && overrides[key] !== null && !Array.isArray(defaults[key])) {
      result[key] = deepMerge(defaults[key], overrides[key]);
    } else {
      result[key] = overrides[key];
    }
  }
  return result;
}

// ═══ CONTEXT ═══

export interface CmsContextValue {
  /** Effective content (defaults + overrides merged) */
  cms: CmsContent;
  /** Raw overrides (only user-changed values) */
  overrides: Partial<CmsContent> | null;
  /** Update a single field by dot-path */
  update: (path: string, value: any) => void;
  /** Reset a single field to default */
  resetField: (path: string) => void;
  /** Reset everything to defaults */
  resetAll: () => void;
  /** Import a full overrides object */
  importOverrides: (data: Partial<CmsContent>) => void;
  /** Export overrides as JSON string */
  exportJSON: () => string;
  /** Check if a specific path is modified from default */
  isModified: (path: string) => boolean;
  /** Count of modified fields */
  modifiedCount: number;
  /** All modified paths */
  modifiedPaths: string[];
  /** Switch locale: loads a full locale bundle as overrides */
  switchLocale: (localeId: LocaleId) => void;
  /** BCP 47 tag for Intl APIs (e.g. "it-IT", "en-GB") */
  bcp47: string;
}

const Ctx = createContext<CmsContextValue>({
  cms: CMS_DEFAULTS,
  overrides: null,
  update: () => {},
  resetField: () => {},
  resetAll: () => {},
  importOverrides: () => {},
  exportJSON: () => "{}",
  isModified: () => false,
  modifiedCount: 0,
  modifiedPaths: [],
  switchLocale: () => {},
  bcp47: "it-IT",
});

export function useCms() {
  return useContext(Ctx);
}

export function CmsProvider({ children }: { children: React.ReactNode }) {
  const [overrides, setOverrides] = useState<Partial<CmsContent> | null>(loadCms);

  const cms = useMemo(
    () => deepMerge(CMS_DEFAULTS, overrides) as CmsContent,
    [overrides],
  );

  const modifiedPaths = useMemo(
    () => (overrides ? deepDiffPaths(CMS_DEFAULTS, cms) : []),
    [overrides, cms],
  );

  const update = useCallback((path: string, value: any) => {
    setOverrides((prev) => {
      const merged = prev ? deepClone(prev) : {};
      const next = setByPath(merged, path, value) as Partial<CmsContent>;
      // If value equals default, remove the override
      const defaultVal = getByPath(CMS_DEFAULTS, path);
      if (JSON.stringify(value) === JSON.stringify(defaultVal)) {
        // Remove this specific path from overrides
        // For simplicity, save anyway — deep cleanup would be nice but not critical for MVP
      }
      saveCms(next);
      return next;
    });
  }, []);

  const resetField = useCallback((path: string) => {
    setOverrides((prev) => {
      if (!prev) return prev;
      const clone = deepClone(prev);
      // Remove the path from overrides
      const keys = path.split(".");
      let cur: any = clone;
      for (let i = 0; i < keys.length - 1; i++) {
        if (cur[keys[i]] == null) return prev; // nothing to remove
        cur = cur[keys[i]];
      }
      delete cur[keys[keys.length - 1]];
      // Clean up empty parent objects
      const cleaned = cleanEmpty(clone);
      saveCms(cleaned);
      return cleaned;
    });
  }, []);

  const resetAll = useCallback(() => {
    setOverrides(null);
    saveCms(null);
  }, []);

  const importOverrides = useCallback((data: Partial<CmsContent>) => {
    setOverrides(data);
    saveCms(data);
  }, []);

  const switchLocale = useCallback((localeId: LocaleId) => {
    if (localeId === "it") {
      // Italian is the default — clear all overrides
      setOverrides(null);
      saveCms(null);
      return;
    }
    const bundle = LOCALE_BUNDLES[localeId];
    if (!bundle) return;
    // Replace overrides entirely with the new locale bundle.
    // Previous approach deepMerge(bundle, prev) caused old locale strings
    // to persist because prev (old language) won over bundle (new language).
    // User-specific numeric overrides (e.g. custom weights) are intentionally
    // reset on locale switch — they can be reconfigured after.
    const newOverrides = { ...bundle } as Partial<CmsContent>;
    setOverrides(newOverrides);
    saveCms(newOverrides);
  }, []);

  const exportJSON = useCallback(() => {
    return JSON.stringify(overrides || {}, null, 2);
  }, [overrides]);

  const isModified = useCallback(
    (path: string) => {
      if (!overrides) return false;
      const overrideVal = getByPath(overrides, path);
      if (overrideVal === undefined) return false;
      const defaultVal = getByPath(CMS_DEFAULTS, path);
      return JSON.stringify(overrideVal) !== JSON.stringify(defaultVal);
    },
    [overrides],
  );

  const bcp47 = LOCALE_BCP47[cms.locale.id] || "it-IT";

  return (
    <Ctx.Provider
      value={{
        cms,
        overrides,
        update,
        resetField,
        resetAll,
        importOverrides,
        exportJSON,
        isModified,
        modifiedCount: modifiedPaths.length,
        modifiedPaths,
        switchLocale,
        bcp47,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

// ═══ HELPERS ═══

/** Remove empty objects recursively */
function cleanEmpty(obj: any): any {
  if (typeof obj !== "object" || obj === null || Array.isArray(obj)) return obj;
  const cleaned: any = {};
  for (const [k, v] of Object.entries(obj)) {
    if (typeof v === "object" && v !== null && !Array.isArray(v)) {
      const c = cleanEmpty(v);
      if (Object.keys(c).length > 0) cleaned[k] = c;
    } else if (v !== undefined) {
      cleaned[k] = v;
    }
  }
  return Object.keys(cleaned).length > 0 ? cleaned : {};
}

// ═══ CMS FIELD REGISTRY ═══

export type CmsFieldType = "text" | "textarea" | "number" | "url" | "slider" | "image";

export interface CmsFieldDef {
  path: string;
  label: string;
  type: CmsFieldType;
  description?: string;
  min?: number;
  max?: number;
  step?: number;
}

export interface CmsSectionDef {
  id: string;
  label: string;
  icon: string; // lucide icon name
  description: string;
  fields: CmsFieldDef[];
}

/** Complete field registry — drives the CMS UI dynamically */
export const CMS_SECTIONS: CmsSectionDef[] = [
  {
    id: "locale",
    label: "Lingua & Locale",
    icon: "globe",
    description: "Lingua attiva e metadati locale — predisposto per i18n multilingua",
    fields: [
      { path: "locale.id", label: "Codice lingua", type: "text", description: "Codice ISO 639-1 (it, en, es, de, fr, pt, ja)" },
      { path: "locale.name", label: "Nome lingua", type: "text", description: "Nome visualizzato (Italiano, English, ...)" },
    ],
  },
  {
    id: "ui",
    label: "Testi UI",
    icon: "text-cursor-input",
    description: "Bottoni, azioni, label generiche — il namespace che cambia con la lingua",
    fields: [
      // Actions
      { path: "ui.copy", label: "Copia", type: "text" },
      { path: "ui.copied", label: "Copiato", type: "text" },
      { path: "ui.share", label: "Condividi", type: "text" },
      { path: "ui.back", label: "Indietro", type: "text" },
      { path: "ui.close", label: "Chiudi", type: "text" },
      { path: "ui.modify", label: "Modifica", type: "text" },
      { path: "ui.disable", label: "Disattiva", type: "text" },
      { path: "ui.restore", label: "Ripristina", type: "text" },
      { path: "ui.generate", label: "Genera ricetta", type: "text" },
      { path: "ui.chooseStyle", label: "Scegli stile", type: "text" },
      { path: "ui.customizeParams", label: "Personalizza parametri", type: "text" },
      { path: "ui.changeStyle", label: "Cambia stile", type: "text" },
      { path: "ui.newPizza", label: "Nuova pizza", type: "text" },
      // Recipe output
      { path: "ui.ingredients", label: "Ingredienti (heading)", type: "text" },
      { path: "ui.procedure", label: "Procedimento (heading)", type: "text" },
      { path: "ui.steps_count", label: "Conteggio passaggi", type: "text", description: "Template: {n} passaggi" },
      { path: "ui.doughBalls", label: "Panetti (label)", type: "text" },
      { path: "ui.doughBallsFrom", label: "Panetti (da {w}g)", type: "text" },
      { path: "ui.totalDough", label: "Totale impasto", type: "text" },
      { path: "ui.startTime", label: "Inizio (orario)", type: "text" },
      { path: "ui.endTime", label: "Fine (orario)", type: "text" },
      // Recipe output — clipboard/share text
      { path: "ui.clipboardTitle", label: "Titolo clipboard", type: "text", description: "Template: {style} — Vulcan Pizza Lab" },
      { path: "ui.clipboardBalls", label: "Panetti clipboard", type: "text", description: "Template: {n} panetti da {w}g" },
      { path: "ui.clipboardTotal", label: "Totale clipboard", type: "text", description: "Template: Totale: {g}g" },
      { path: "ui.clipboardProcedure", label: "Procedimento clipboard", type: "text", description: "Template: {style} — Procedimento" },
      // Recipe output — ingredient names
      { path: "ui.flour", label: "Farina", type: "text" },
      { path: "ui.water", label: "Acqua", type: "text" },
      { path: "ui.salt", label: "Sale", type: "text" },
      { path: "ui.sugar", label: "Zucchero", type: "text" },
      { path: "ui.oilEvo", label: "Olio d'oliva", type: "text" },
      // Recipe output — compensations
      { path: "ui.compTitle", label: "Compensazioni", type: "text" },
      { path: "ui.compTitleNerd", label: "Compensazioni tecniche", type: "text" },
      { path: "ui.compHydration", label: "Compensazione idratazione", type: "text" },
      { path: "ui.compOil", label: "Compensazione olio", type: "text" },
      { path: "ui.compSugar", label: "Compensazione zucchero", type: "text" },
      { path: "ui.compCookTime", label: "Compensazione cottura", type: "text" },
      { path: "ui.compThickness", label: "Compensazione spessore", type: "text" },
      { path: "ui.compDefault", label: "Compensazione default", type: "text" },
      // Recipe output — aria labels
      { path: "ui.ariaReduceBalls", label: "Aria: Riduci panetti", type: "text" },
      { path: "ui.ariaAddBalls", label: "Aria: Aumenta panetti", type: "text" },
      { path: "ui.ariaEarlier", label: "Aria: Inizia prima", type: "text" },
      { path: "ui.ariaLater", label: "Aria: Inizia più tardi", type: "text" },
      // Stat strip
      { path: "ui.statHydration", label: "Stat: Idratazione", type: "text" },
      { path: "ui.statOven", label: "Stat: Forno", type: "text" },
      { path: "ui.statCookTime", label: "Stat: Cottura", type: "text" },
      { path: "ui.statFermentation", label: "Stat: Lievitazione", type: "text" },
      { path: "ui.statTempSuffix", label: "Stat: Suffisso temperatura", type: "text", description: "Template: a {t}°C" },
      // Nerd row
      { path: "ui.nerdTitle", label: "Nerd: titolo riga", type: "text" },
      { path: "ui.nerdFlourW", label: "Nerd: Farina W", type: "text" },
      { path: "ui.nerdPL", label: "Nerd: P/L", type: "text" },
      { path: "ui.nerdYeast", label: "Nerd: Lievito", type: "text" },
      { path: "ui.nerdHoursAt18", label: "Nerd: Ore @18°C", type: "text" },
      { path: "ui.nerdQ10", label: "Nerd: Q₁₀", type: "text" },
      { path: "ui.nerdAw", label: "Nerd: Aw", type: "text" },
      // Time
      { path: "ui.seconds", label: "secondi", type: "text" },
      { path: "ui.minutes", label: "minuti", type: "text" },
      { path: "ui.minute", label: "minuto", type: "text" },
      { path: "ui.hours", label: "ore", type: "text" },
      { path: "ui.hour", label: "ora", type: "text" },
      // Score
      { path: "ui.recipeScore", label: "Punteggio ricetta", type: "text" },
      { path: "ui.nerdToggle", label: "Toggle PizzaNerd", type: "text" },
      { path: "ui.nerdActive", label: "Attiva PizzaNerd", type: "text" },
      { path: "ui.scienceTitle", label: "Titolo scienza", type: "text" },
      { path: "ui.ariaCloseScores", label: "Aria: Chiudi punteggi", type: "text" },
      { path: "ui.ariaViewScores", label: "Aria: Visualizza punteggi", type: "text" },
      { path: "ui.tapForDetails", label: "Aria: Tocca per dettagli", type: "text" },
      // Banners
      { path: "ui.styleEditorActive", label: "Banner: Style Editor", type: "text" },
      { path: "ui.cmsActive", label: "Banner: CMS", type: "text" },
      { path: "ui.fieldsModified", label: "Banner: campi modificati", type: "text" },
      { path: "ui.fieldModified", label: "Banner: campo modificato", type: "text" },
      /** Oven section — edit label when already configured */
      { path: "ui.editOven", label: "Banner: Modifica forno", type: "text" },
      // Weather widget
      { path: "ui.weatherCity", label: "Città meteo", type: "text" },
      { path: "ui.weatherOutdoor", label: "Meteo esterno", type: "text", description: "Template: {t}°C fuori" },
      { path: "ui.weatherKitchen", label: "Meteo cucina", type: "text" },
      // Badges
      { path: "ui.badgeIdeal", label: "Badge: Ideale", type: "text" },
      { path: "ui.badgeRecent", label: "Badge: Recente", type: "text" },
      { path: "ui.autoLabel", label: "Label: Auto", type: "text" },
      // Oven compact bar
      { path: "ui.cancel", label: "Annulla", type: "text" },
      { path: "ui.changeOven", label: "Cambia", type: "text" },
      { path: "ui.ovenFallback", label: "Forno", type: "text" },
      // Pantry group labels
      { path: "ui.pantryFlours", label: "Gruppo farine", type: "text" },
      { path: "ui.pantryYeasts", label: "Gruppo lieviti", type: "text" },
      // Equipment labels
      { path: "ui.equipMixer", label: "Impastatrice", type: "text" },
      { path: "ui.equipStone", label: "Pietra refrattaria", type: "text" },
      { path: "ui.equipSteel", label: "Piastra in acciaio", type: "text" },
      { path: "ui.equipPan", label: "Teglia", type: "text" },
      { path: "ui.equipKneading", label: "Impastamento (label)", type: "text" },
      { path: "ui.equipSurface", label: "Superficie cottura (label)", type: "text" },
      { path: "ui.kitchenTitle", label: "La tua cucina (titolo)", type: "text" },
      { path: "ui.pantryOptional", label: "opzionale (label)", type: "text" },
      { path: "ui.specialFlours", label: "Farine speciali (label)", type: "text" },
      { path: "ui.brandSuggest", label: "Conosci la marca? (label)", type: "text" },
      { path: "ui.badgeSelected", label: "Badge farina selezionata", type: "text" },
      { path: "ui.otherCompatibleFlours", label: "Altre farine compatibili (label)", type: "text" },
      { path: "ui.flourSelectHint", label: "Hint selezione farina", type: "text" },
      { path: "ui.flourSelected", label: "Farina applicata (label)", type: "text" },
      { path: "ui.autolysisSuggested", label: "Autolisi consigliata (label)", type: "text" },
      // Dietary labels
      { path: "ui.dietGlutenFree", label: "Senza glutine", type: "text" },
      { path: "ui.dietLactoseFree", label: "Senza lattosio", type: "text" },
      { path: "ui.dietVegan", label: "Vegano", type: "text" },
      // Flour labels & details
      { path: "flourLabels.00", label: "Farina 00 — Nome", type: "text" },
      { path: "flourDetails.00", label: "Farina 00 — Dettaglio", type: "text" },
      { path: "flourLabels.0", label: "Farina 0 — Nome", type: "text" },
      { path: "flourDetails.0", label: "Farina 0 — Dettaglio", type: "text" },
      { path: "flourLabels.manitoba", label: "Manitoba — Nome", type: "text" },
      { path: "flourDetails.manitoba", label: "Manitoba — Dettaglio", type: "text" },
      { path: "flourLabels.integrale", label: "Integrale — Nome", type: "text" },
      { path: "flourDetails.integrale", label: "Integrale — Dettaglio", type: "text" },
      { path: "flourLabels.semola", label: "Semola — Nome", type: "text" },
      { path: "flourDetails.semola", label: "Semola — Dettaglio", type: "text" },
      // Yeast labels & details
      { path: "yeastLabels.fresh", label: "Lievito fresco — Nome", type: "text" },
      { path: "yeastDetails.fresh", label: "Lievito fresco — Dettaglio", type: "text" },
      { path: "yeastLabels.dry", label: "Lievito secco — Nome", type: "text" },
      { path: "yeastDetails.dry", label: "Lievito secco — Dettaglio", type: "text" },
      { path: "yeastLabels.sourdough", label: "Lievito madre — Nome", type: "text" },
      { path: "yeastDetails.sourdough", label: "Lievito madre — Dettaglio", type: "text" },
    ],
  },
  {
    id: "filters",
    label: "Filtri avanzati",
    icon: "filter",
    description: "Label dei filtri sfaccettati nella griglia stili raccomandati",
    fields: [
      { path: "filters.advancedLabel", label: "Titolo sezione", type: "text" },
      { path: "filters.removeFilters", label: "Rimuovi filtri", type: "text" },
      { path: "filters.brandedFlours", label: "Farine di marca", type: "text" },
      { path: "filters.hydrationLabel", label: "Idratazione — label", type: "text" },
      { path: "filters.hydrationLow", label: "Idratazione bassa", type: "text" },
      { path: "filters.hydrationMedium", label: "Idratazione media", type: "text" },
      { path: "filters.hydrationHigh", label: "Idratazione alta", type: "text" },
      { path: "filters.hydrationExtreme", label: "Idratazione estrema", type: "text" },
      { path: "filters.textureLabel", label: "Texture — label", type: "text" },
      { path: "filters.textureCrispyThin", label: "Sottile croccante", type: "text" },
      { path: "filters.textureThickAiry", label: "Alta soffice", type: "text" },
      { path: "filters.textureAiryCrumb", label: "Alveolata", type: "text" },
      { path: "filters.textureDeepDish", label: "Deep dish", type: "text" },
      { path: "filters.skillLabel", label: "Livello — label", type: "text" },
      { path: "filters.skillBeginner", label: "Principiante", type: "text" },
      { path: "filters.skillIntermediate", label: "Intermedio", type: "text" },
      { path: "filters.skillAdvanced", label: "Avanzato", type: "text" },
      { path: "filters.skillExpert", label: "Esperto", type: "text" },
      { path: "filters.ovenLabel", label: "Cottura — label", type: "text" },
      { path: "filters.ovenHome", label: "Forno casa", type: "text" },
      { path: "filters.ovenWood", label: "Legna", type: "text" },
      { path: "filters.ovenElectricHigh", label: "Elettrico >350°C", type: "text" },
      { path: "filters.ovenPan", label: "Padella", type: "text" },
    ],
  },
  {
    id: "glossary",
    label: "Glossario",
    icon: "book-open",
    description: "Label della pagina glossario tecnico (/glossary)",
    fields: [
      { path: "glossary.pageTitle", label: "Titolo pagina", type: "text" },
      { path: "glossary.searchPlaceholder", label: "Placeholder ricerca", type: "text" },
      { path: "glossary.cancelSearch", label: "Cancella ricerca", type: "text" },
      { path: "glossary.noResults", label: "Nessun risultato ({query})", type: "text" },
      { path: "glossary.allCategories", label: "Tutte le categorie", type: "text" },
      { path: "glossary.formulaLabel", label: "Formula", type: "text" },
      { path: "glossary.rangesLabel", label: "Range tipici", type: "text" },
      { path: "glossary.whyImportantLabel", label: "Perch\u00E9 importante", type: "text" },
      { path: "glossary.relatedLabel", label: "Correlati", type: "text" },
      { path: "glossary.backToHome", label: "Torna alla home", type: "text" },
      { path: "glossary.termCount", label: "Conteggio termini ({count})", type: "text" },
      { path: "glossary.catRheology", label: "Categoria: Reologia", type: "text" },
      { path: "glossary.catRheologyDesc", label: "Desc: Reologia", type: "text" },
      { path: "glossary.catFermentation", label: "Categoria: Fermentazione", type: "text" },
      { path: "glossary.catFermentationDesc", label: "Desc: Fermentazione", type: "text" },
      { path: "glossary.catThermal", label: "Categoria: Termica", type: "text" },
      { path: "glossary.catThermalDesc", label: "Desc: Termica", type: "text" },
      { path: "glossary.catChemistry", label: "Categoria: Chimica", type: "text" },
      { path: "glossary.catChemistryDesc", label: "Desc: Chimica", type: "text" },
      { path: "glossary.catMechanics", label: "Categoria: Meccanica", type: "text" },
      { path: "glossary.catMechanicsDesc", label: "Desc: Meccanica", type: "text" },
      { path: "glossary.catScoring", label: "Categoria: Punteggi", type: "text" },
      { path: "glossary.catScoringDesc", label: "Desc: Punteggi", type: "text" },
    ],
  },
  {
    id: "tips",
    label: "Suggerimenti",
    icon: "lightbulb",
    description: "Testi dei suggerimenti contestuali (InlineTip) nelle sezioni del configuratore",
    fields: [
      { path: "tips.timeSlot", label: "Tip: Quando", type: "textarea" },
      { path: "tips.skill", label: "Tip: Livello skill", type: "textarea" },
      { path: "tips.equipment", label: "Tip: Attrezzatura", type: "textarea" },
      { path: "tips.oven", label: "Tip: Forno", type: "textarea" },
      { path: "tips.pantry", label: "Tip: Dispensa", type: "textarea" },
    ],
  },
  {
    id: "hero",
    label: "Hero & Brand",
    icon: "type",
    description: "Titolo principale, sottotitolo e testi hero della homepage",
    fields: [
      { path: "hero.title_line1", label: "Titolo riga 1", type: "text", description: "Prima riga del titolo hero" },
      { path: "hero.title_line2", label: "Titolo riga 2", type: "text", description: "Seconda riga (accent color)" },
      { path: "hero.subtitle", label: "Sottotitolo", type: "textarea", description: "Paragrafo sotto il titolo hero" },
      { path: "result.breadcrumb", label: "Breadcrumb risultato", type: "text" },
      { path: "result.heading", label: "Titolo risultato", type: "text" },
      { path: "result.backLabel", label: "Pulsante indietro", type: "text" },
    ],
  },
  {
    id: "steps",
    label: "Step Headers",
    icon: "list-ordered",
    description: "Titoli delle 3 sezioni principali del configuratore",
    fields: [
      { path: "steps.context.number", label: "Step 1 — Numero", type: "text" },
      { path: "steps.context.title", label: "Step 1 — Titolo", type: "text" },
      { path: "steps.context.subtitle", label: "Step 1 — Sottotitolo", type: "text" },
      { path: "steps.setup.number", label: "Step 2 — Numero", type: "text" },
      { path: "steps.setup.title", label: "Step 2 — Titolo", type: "text" },
      { path: "steps.setup.subtitle", label: "Step 2 — Sottotitolo", type: "text" },
      { path: "steps.styles.number", label: "Step 3 — Numero", type: "text" },
      { path: "steps.styles.title", label: "Step 3 — Titolo", type: "text" },
      { path: "steps.styles.subtitle", label: "Step 3 — Sottotitolo", type: "text" },
    ],
  },
  {
    id: "sections",
    label: "Sezioni Setup",
    icon: "layout-grid",
    description: "Titoli e descrizioni delle sotto-sezioni del configuratore",
    fields: [
      { path: "sections.when.title", label: "Quando — Titolo", type: "text" },
      { path: "sections.when.description", label: "Quando — Descrizione", type: "text" },
      { path: "sections.skill.title", label: "Skill — Titolo", type: "text" },
      { path: "sections.skill.description", label: "Skill — Descrizione", type: "text" },
      { path: "sections.oven.title", label: "Forno — Titolo", type: "text" },
      { path: "sections.oven.description", label: "Forno — Descrizione", type: "text" },
      { path: "sections.pantry.title", label: "Dispensa — Titolo", type: "text" },
      { path: "sections.pantry.description", label: "Dispensa — Descrizione", type: "text" },
      { path: "sections.dietary.title", label: "Dieta — Titolo", type: "text" },
      { path: "sections.dietary.description", label: "Dieta — Descrizione", type: "text" },
      { path: "sections.equipment.title", label: "Attrezzatura — Titolo", type: "text" },
      { path: "sections.equipment.description", label: "Attrezzatura — Descrizione", type: "text" },
    ],
  },
  {
    id: "config",
    label: "Configurazione",
    icon: "settings",
    description: "Time slot, forni, livelli skill — etichette e valori",
    fields: [
      // Time slots
      { path: "timeSlots.tonight.label", label: "Stasera — Label", type: "text" },
      { path: "timeSlots.tonight.sublabel", label: "Stasera — Sub", type: "text" },
      { path: "timeSlots.tonight.hours", label: "Stasera — Ore", type: "number", min: 1, max: 12 },
      { path: "timeSlots.tomorrow_lunch.label", label: "Dom. pranzo — Label", type: "text" },
      { path: "timeSlots.tomorrow_lunch.sublabel", label: "Dom. pranzo — Sub", type: "text" },
      { path: "timeSlots.tomorrow_lunch.hours", label: "Dom. pranzo — Ore", type: "number", min: 10, max: 30 },
      { path: "timeSlots.tomorrow_dinner.label", label: "Dom. sera — Label", type: "text" },
      { path: "timeSlots.tomorrow_dinner.sublabel", label: "Dom. sera — Sub", type: "text" },
      { path: "timeSlots.tomorrow_dinner.hours", label: "Dom. sera — Ore", type: "number", min: 18, max: 36 },
      { path: "timeSlots.day_after.label", label: "Dopodomani — Label", type: "text" },
      { path: "timeSlots.day_after.sublabel", label: "Dopodomani — Sub", type: "text" },
      { path: "timeSlots.day_after.hours", label: "Dopodomani — Ore", type: "number", min: 30, max: 60 },
      { path: "timeSlots.weekend.label", label: "Weekend — Label", type: "text" },
      { path: "timeSlots.weekend.sublabel", label: "Weekend — Sub", type: "text" },
      { path: "timeSlots.weekend.hours", label: "Weekend — Ore", type: "number", min: 48, max: 120 },
      // Oven presets
      { path: "ovenPresets.home.name", label: "Forno domestico — Nome", type: "text" },
      { path: "ovenPresets.home.maxTemp", label: "Forno domestico — Max T", type: "number", min: 200, max: 300 },
      { path: "ovenPresets.electric_standard.name", label: "Elettrico std — Nome", type: "text" },
      { path: "ovenPresets.electric_standard.maxTemp", label: "Elettrico std — Max T", type: "number", min: 250, max: 400 },
      { path: "ovenPresets.gas.name", label: "Gas — Nome", type: "text" },
      { path: "ovenPresets.gas.maxTemp", label: "Gas — Max T", type: "number", min: 300, max: 450 },
      { path: "ovenPresets.electric_high.name", label: "Elettrico alta T — Nome", type: "text" },
      { path: "ovenPresets.electric_high.maxTemp", label: "Elettrico alta T — Max T", type: "number", min: 350, max: 550 },
      { path: "ovenPresets.wood.name", label: "Legna — Nome", type: "text" },
      { path: "ovenPresets.wood.maxTemp", label: "Legna — Max T", type: "number", min: 400, max: 600 },
      // Skill levels
      { path: "skillLevels.1.name", label: "Skill 1 — Nome", type: "text" },
      { path: "skillLevels.1.description", label: "Skill 1 — Desc", type: "text" },
      { path: "skillLevels.2.name", label: "Skill 2 — Nome", type: "text" },
      { path: "skillLevels.2.description", label: "Skill 2 — Desc", type: "text" },
      { path: "skillLevels.3.name", label: "Skill 3 — Nome", type: "text" },
      { path: "skillLevels.3.description", label: "Skill 3 — Desc", type: "text" },
      { path: "skillLevels.4.name", label: "Skill 4 — Nome", type: "text" },
      { path: "skillLevels.4.description", label: "Skill 4 — Desc", type: "text" },
    ],
  },
  {
    id: "scoring",
    label: "Pesi & Score",
    icon: "scale",
    description: "Pesi del composite score (5 assi) e del recommendation engine (5 fattori)",
    fields: [
      // Composite weights
      { path: "scoreDimensions.authenticity.label", label: "Autenticita — Label", type: "text" },
      { path: "scoreDimensions.authenticity.weight", label: "Autenticita — Peso", type: "slider", min: 0, max: 1, step: 0.05 },
      { path: "scoreDimensions.feasibility.label", label: "Fattibilita — Label", type: "text" },
      { path: "scoreDimensions.feasibility.weight", label: "Fattibilita — Peso", type: "slider", min: 0, max: 1, step: 0.05 },
      { path: "scoreDimensions.digestibility.label", label: "Digeribilita — Label", type: "text" },
      { path: "scoreDimensions.digestibility.weight", label: "Digeribilita — Peso", type: "slider", min: 0, max: 1, step: 0.05 },
      { path: "scoreDimensions.sustainability.label", label: "Sostenibilita — Label", type: "text" },
      { path: "scoreDimensions.sustainability.weight", label: "Sostenibilita — Peso", type: "slider", min: 0, max: 1, step: 0.05 },
      { path: "scoreDimensions.experimentation.label", label: "Sperimentazione — Label", type: "text" },
      { path: "scoreDimensions.experimentation.weight", label: "Sperimentazione — Peso", type: "slider", min: 0, max: 1, step: 0.05 },
      // Recommendation weights
      { path: "recommendationWeights.time", label: "Recommendation: Tempo", type: "slider", min: 0, max: 1, step: 0.05 },
      { path: "recommendationWeights.oven", label: "Recommendation: Forno", type: "slider", min: 0, max: 1, step: 0.05 },
      { path: "recommendationWeights.skill", label: "Recommendation: Skill", type: "slider", min: 0, max: 1, step: 0.05 },
      { path: "recommendationWeights.equipment", label: "Recommendation: Attrezzatura", type: "slider", min: 0, max: 1, step: 0.05 },
      { path: "recommendationWeights.pantry", label: "Recommendation: Dispensa", type: "slider", min: 0, max: 1, step: 0.05 },
    ],
  },
  {
    id: "families",
    label: "Famiglie & Tiers",
    icon: "layers",
    description: "Nomi e descrizioni delle 4 famiglie pizza e delle 3 fasce di compatibilita",
    fields: [
      { path: "families.napoletana.name", label: "Napoletana — Nome", type: "text" },
      { path: "families.napoletana.description", label: "Napoletana — Desc", type: "textarea" },
      { path: "families.napoletana.emoji", label: "Napoletana — Emoji", type: "text" },
      { path: "families.romana.name", label: "Romana — Nome", type: "text" },
      { path: "families.romana.description", label: "Romana — Desc", type: "textarea" },
      { path: "families.romana.emoji", label: "Romana — Emoji", type: "text" },
      { path: "families.americana.name", label: "Americana — Nome", type: "text" },
      { path: "families.americana.description", label: "Americana — Desc", type: "textarea" },
      { path: "families.americana.emoji", label: "Americana — Emoji", type: "text" },
      { path: "families.contemporanea.name", label: "Contemporanea — Nome", type: "text" },
      { path: "families.contemporanea.description", label: "Contemporanea — Desc", type: "textarea" },
      { path: "families.contemporanea.emoji", label: "Contemporanea — Emoji", type: "text" },
      // Tiers
      { path: "tiers.perfect.label", label: "Tier Perfetto — Label", type: "text" },
      { path: "tiers.perfect.subtitle", label: "Tier Perfetto — Sub", type: "text" },
      { path: "tiers.good.label", label: "Tier Buono — Label", type: "text" },
      { path: "tiers.good.subtitle", label: "Tier Buono — Sub", type: "text" },
      { path: "tiers.challenging.label", label: "Tier Sfidante — Label", type: "text" },
      { path: "tiers.challenging.subtitle", label: "Tier Sfidante — Sub", type: "text" },
    ],
  },
  {
    id: "timeline",
    label: "Timeline & Procedura",
    icon: "list-ordered",
    description: "Testi degli step della timeline procedurale (titolo, descrizione, tip beginner/nerd)",
    fields: [
      { path: "timelineUi.startLabel", label: "Label: Inizio", type: "text" },
      { path: "timelineUi.beforeSuffix", label: "Suffisso: prima", type: "text" },
      { path: "timelineLabels.preferment.title", label: "Pre-fermento — Titolo", type: "text" },
      { path: "timelineLabels.preferment.desc", label: "Pre-fermento — Desc", type: "textarea", description: "Template: {type} = biga/poolish" },
      { path: "timelineLabels.preferment.tipBeginner", label: "Pre-fermento — Tip beginner", type: "textarea" },
      { path: "timelineLabels.preferment.tipNerd", label: "Pre-fermento — Tip nerd", type: "textarea" },
      { path: "timelineLabels.mix.title", label: "Impasto — Titolo", type: "text" },
      { path: "timelineLabels.mix.desc", label: "Impasto — Desc", type: "textarea" },
      { path: "timelineLabels.mix.descAlt", label: "Impasto — Desc (no knead)", type: "textarea" },
      { path: "timelineLabels.mix.tipBeginner", label: "Impasto — Tip beginner", type: "textarea" },
      { path: "timelineLabels.mix.tipNerd", label: "Impasto — Tip nerd", type: "textarea" },
      { path: "timelineLabels.mix_noknead.title", label: "Miscelazione — Titolo", type: "text" },
      { path: "timelineLabels.mix_noknead.desc", label: "Miscelazione — Desc", type: "textarea" },
      { path: "timelineLabels.mix_noknead.tipBeginner", label: "Miscelazione — Tip beginner", type: "textarea" },
      { path: "timelineLabels.mix_noknead.tipNerd", label: "Miscelazione — Tip nerd", type: "textarea" },
      { path: "timelineLabels.bulk.title", label: "Puntata — Titolo", type: "text" },
      { path: "timelineLabels.bulk.desc", label: "Puntata — Desc", type: "textarea", description: "Template: {temp}" },
      { path: "timelineLabels.bulk.tipBeginner", label: "Puntata — Tip beginner", type: "textarea" },
      { path: "timelineLabels.bulk.tipNerd", label: "Puntata — Tip nerd", type: "textarea", description: "Template: {temp}, {factor}" },
      { path: "timelineLabels.bulk_cold.title", label: "Puntata fredda — Titolo", type: "text" },
      { path: "timelineLabels.bulk_cold.desc", label: "Puntata fredda — Desc", type: "textarea" },
      { path: "timelineLabels.bulk_cold.tipBeginner", label: "Puntata fredda — Tip beginner", type: "textarea" },
      { path: "timelineLabels.bulk_cold.tipNerd", label: "Puntata fredda — Tip nerd", type: "textarea" },
      { path: "timelineLabels.divide.title", label: "Divisione — Titolo", type: "text" },
      { path: "timelineLabels.divide.desc", label: "Divisione — Desc", type: "textarea" },
      { path: "timelineLabels.divide.tipBeginner", label: "Divisione — Tip beginner", type: "textarea" },
      { path: "timelineLabels.divide.tipNerd", label: "Divisione — Tip nerd", type: "textarea" },
      { path: "timelineLabels.proof.title", label: "Appretto — Titolo", type: "text" },
      { path: "timelineLabels.proof.desc", label: "Appretto — Desc", type: "textarea", description: "Template: {temp}" },
      { path: "timelineLabels.proof.tipBeginner", label: "Appretto — Tip beginner", type: "textarea" },
      { path: "timelineLabels.proof.tipNerd", label: "Appretto — Tip nerd", type: "textarea" },
      { path: "timelineLabels.shape.title", label: "Stesura — Titolo", type: "text" },
      { path: "timelineLabels.shape.desc", label: "Stesura — Desc (tonda)", type: "textarea" },
      { path: "timelineLabels.shape.descAlt", label: "Stesura — Desc (teglia)", type: "textarea" },
      { path: "timelineLabels.shape_thin.title", label: "Stesura sottile — Titolo", type: "text" },
      { path: "timelineLabels.shape_thin.desc", label: "Stesura sottile — Desc", type: "textarea" },
      { path: "timelineLabels.top.title", label: "Farcitura — Titolo", type: "text" },
      { path: "timelineLabels.top.desc", label: "Farcitura — Desc", type: "textarea" },
      { path: "timelineLabels.bake.title", label: "Cottura — Titolo", type: "text" },
      { path: "timelineLabels.bake.desc", label: "Cottura — Desc", type: "textarea", description: "Template: {temp}" },
      { path: "timelineLabels.bake.tipBeginner", label: "Cottura — Tip beginner", type: "textarea" },
      { path: "timelineLabels.bake.tipNerd", label: "Cottura — Tip nerd", type: "textarea", description: "Template: {temp}" },
    ],
  },
  {
    id: "parametricTips",
    label: "Tip Parametrici",
    icon: "database",
    description: "Label sezione dettagli cottura nel StyleDetailSheet + tip contestuali nella timeline",
    fields: [
      // Data pill labels
      { path: "parametricTips.pillHydration", label: "Pill: Idratazione", type: "text" },
      { path: "parametricTips.pillFlour", label: "Pill: Farina", type: "text" },
      { path: "parametricTips.pillPL", label: "Pill: P/L", type: "text" },
      { path: "parametricTips.pillFermentation", label: "Pill: Fermentazione", type: "text" },
      { path: "parametricTips.pillThickness", label: "Pill: Spessore", type: "text" },
      { path: "parametricTips.pillLevel", label: "Pill: Livello", type: "text" },
      { path: "parametricTips.pillExperimentation", label: "Pill: Sperimentazione", type: "text" },
      { path: "parametricTips.pillLevelBeginner", label: "Pill: Principiante", type: "text" },
      { path: "parametricTips.pillLevelExpert", label: "Pill: Esperto", type: "text" },
      // Sheet labels
      { path: "parametricTips.sheetSectionTitle", label: "Sheet: Titolo sezione", type: "text" },
      { path: "parametricTips.sheetOvenLabel", label: "Sheet: Forno", type: "text" },
      { path: "parametricTips.sheetOvenPreheat", label: "Sheet: Preriscaldamento", type: "text", description: "Template: {min}" },
      { path: "parametricTips.sheetBakeLabel", label: "Sheet: Tempo cottura", type: "text" },
      { path: "parametricTips.sheetBakeTurns", label: "Sheet: Rotazioni", type: "text", description: "Template: {n}" },
      { path: "parametricTips.sheetBakeNoTurns", label: "Sheet: Nessuna rotazione", type: "text" },
      { path: "parametricTips.sheetDoughLabel", label: "Sheet: Panetto", type: "text" },
      { path: "parametricTips.sheetSaltLabel", label: "Sheet: Sale", type: "text" },
      { path: "parametricTips.sheetFoldLabel", label: "Sheet: Pieghe", type: "text" },
      { path: "parametricTips.sheetFoldInterval", label: "Sheet: Intervallo pieghe", type: "text", description: "Template: {min}" },
      { path: "parametricTips.sheetGenerateBtn", label: "Sheet: Genera ricetta", type: "text" },
      { path: "parametricTips.sheetTechniquesLabel", label: "Sheet: Tecniche d'autore", type: "text" },
      // Timeline beginner
      { path: "parametricTips.mixBeginner", label: "Mix — Beginner", type: "textarea", description: "Template: {mixer}, {time}, {equipment}" },
      { path: "parametricTips.bulkBeginner", label: "Bulk — Beginner", type: "textarea", description: "Template: {count}, {type}, {interval}" },
      { path: "parametricTips.shapeBeginner", label: "Shape — Beginner", type: "textarea", description: "Template: {note}" },
      { path: "parametricTips.topBeginner", label: "Top — Beginner", type: "textarea", description: "Template: {order}, {note}" },
      { path: "parametricTips.bakeBeginner", label: "Bake — Beginner", type: "textarea", description: "Template: {minM}, {maxM}, {turnsNote}" },
      // Timeline nerd
      { path: "parametricTips.mixNerd", label: "Mix — Nerd", type: "textarea", description: "Template: {mixer}, {time}, {note}" },
      { path: "parametricTips.bulkNerd", label: "Bulk — Nerd", type: "textarea", description: "Template: {count}, {type}, {interval}, {note}" },
      { path: "parametricTips.shapeNerd", label: "Shape — Nerd", type: "textarea", description: "Template: {type}, {depth}, {timing}, {note}" },
      { path: "parametricTips.topNerd", label: "Top — Nerd", type: "textarea", description: "Template: {order}, {saucePos}, {cheeseType}, {cheesePos}, {note}" },
      { path: "parametricTips.bakeNerd", label: "Bake — Nerd", type: "textarea", description: "Template: {idealSec}, {minM}, {maxM}, {turns}, {note}" },
      // Dynamic fragments
      { path: "parametricTips.mixerPlanetaria", label: "Frammento: Planetaria", type: "text" },
      { path: "parametricTips.mixerHand", label: "Frammento: A mano", type: "text" },
      { path: "parametricTips.turnsSingle", label: "Frammento: Ruota", type: "text", description: "Template: {n}" },
      { path: "parametricTips.turnsNone", label: "Frammento: Non girare", type: "text" },
    ],
  },
  {
    id: "media",
    label: "Media & Foto",
    icon: "image",
    description: "Foto per ogni stile pizza — URL o upload da file locale",
    fields: [
      { path: "media.stylePhotos.napoletana_stg", label: "Foto: Napoletana STG", type: "image" },
      { path: "media.stylePhotos.napoletana_canotto", label: "Foto: Canotto", type: "image" },
      { path: "media.stylePhotos.teglia_romana", label: "Foto: Teglia Romana", type: "image" },
      { path: "media.stylePhotos.tonda_romana", label: "Foto: Tonda Romana", type: "image" },
      { path: "media.stylePhotos.pinsa_romana", label: "Foto: Pinsa", type: "image" },
      { path: "media.stylePhotos.pala_romana", label: "Foto: Pala Romana", type: "image" },
      { path: "media.stylePhotos.new_york", label: "Foto: New York", type: "image" },
      { path: "media.stylePhotos.detroit", label: "Foto: Detroit", type: "image" },
      { path: "media.stylePhotos.chicago_deep", label: "Foto: Chicago", type: "image" },
      { path: "media.stylePhotos.grandma_style", label: "Foto: Grandma", type: "image" },
      { path: "media.stylePhotos.bonci_teglia", label: "Foto: Bonci", type: "image" },
      { path: "media.stylePhotos.focaccia_genovese", label: "Foto: Focaccia Genovese", type: "image" },
      { path: "media.stylePhotos.sfincione", label: "Foto: Sfincione", type: "image" },
      { path: "media.stylePhotos.focaccia_recco", label: "Foto: Focaccia di Recco", type: "image" },
      { path: "media.stylePhotos.padellino_torino", label: "Foto: Padellino", type: "image" },
      { path: "media.fallbackPhoto", label: "Foto Fallback", type: "image" },
    ],
  },
  {
    id: "styleStrings",
    label: "Stili — Testi",
    icon: "pizza",
    description: "Descrizioni e caratteristiche chiave per ogni stile (pipe-separated). Cambiano con la lingua.",
    fields: [
      // Descriptions
      { path: "styleDescriptions.napoletana_stg", label: "Desc: Napoletana STG", type: "textarea" },
      { path: "styleDescriptions.napoletana_canotto", label: "Desc: Canotto", type: "textarea" },
      { path: "styleDescriptions.teglia_romana", label: "Desc: Teglia Romana", type: "textarea" },
      { path: "styleDescriptions.tonda_romana", label: "Desc: Tonda Romana", type: "textarea" },
      { path: "styleDescriptions.pinsa_romana", label: "Desc: Pinsa", type: "textarea" },
      { path: "styleDescriptions.pala_romana", label: "Desc: Pala Romana", type: "textarea" },
      { path: "styleDescriptions.new_york", label: "Desc: New York", type: "textarea" },
      { path: "styleDescriptions.detroit", label: "Desc: Detroit", type: "textarea" },
      { path: "styleDescriptions.chicago_deep", label: "Desc: Chicago Deep", type: "textarea" },
      { path: "styleDescriptions.bonci_teglia", label: "Desc: Bonci", type: "textarea" },
      { path: "styleDescriptions.focaccia_genovese", label: "Desc: Focaccia Genovese", type: "textarea" },
      { path: "styleDescriptions.sfincione", label: "Desc: Sfincione", type: "textarea" },
      { path: "styleDescriptions.grandma_style", label: "Desc: Grandma", type: "textarea" },
      { path: "styleDescriptions.focaccia_recco", label: "Desc: Focaccia Recco", type: "textarea" },
      { path: "styleDescriptions.padellino_torino", label: "Desc: Padellino", type: "textarea" },
      // Key characteristics (pipe-separated)
      { path: "styleChars.napoletana_stg", label: "Chars: Napoletana STG", type: "text", description: "Separare con | (pipe)" },
      { path: "styleChars.napoletana_canotto", label: "Chars: Canotto", type: "text", description: "Separare con | (pipe)" },
      { path: "styleChars.teglia_romana", label: "Chars: Teglia Romana", type: "text", description: "Separare con | (pipe)" },
      { path: "styleChars.tonda_romana", label: "Chars: Tonda Romana", type: "text", description: "Separare con | (pipe)" },
      { path: "styleChars.pinsa_romana", label: "Chars: Pinsa", type: "text", description: "Separare con | (pipe)" },
      { path: "styleChars.pala_romana", label: "Chars: Pala Romana", type: "text", description: "Separare con | (pipe)" },
      { path: "styleChars.new_york", label: "Chars: New York", type: "text", description: "Separare con | (pipe)" },
      { path: "styleChars.detroit", label: "Chars: Detroit", type: "text", description: "Separare con | (pipe)" },
      { path: "styleChars.chicago_deep", label: "Chars: Chicago Deep", type: "text", description: "Separare con | (pipe)" },
      { path: "styleChars.bonci_teglia", label: "Chars: Bonci", type: "text", description: "Separare con | (pipe)" },
      { path: "styleChars.focaccia_genovese", label: "Chars: Focaccia Genovese", type: "text", description: "Separare con | (pipe)" },
      { path: "styleChars.sfincione", label: "Chars: Sfincione", type: "text", description: "Separare con | (pipe)" },
      { path: "styleChars.grandma_style", label: "Chars: Grandma", type: "text", description: "Separare con | (pipe)" },
      { path: "styleChars.focaccia_recco", label: "Chars: Focaccia Recco", type: "text", description: "Separare con | (pipe)" },
      { path: "styleChars.padellino_torino", label: "Chars: Padellino", type: "text", description: "Separare con | (pipe)" },
    ],
  },
  {
    id: "deviationStrings",
    label: "Deviazioni & Autori",
    icon: "git-branch",
    description: "Label categorie di deviazione e nomi varianti d'autore",
    fields: [
      // Deviation labels
      { path: "deviationLabels.canonical", label: "Dev: Canonico", type: "text" },
      { path: "deviationLabels.parameter_variant", label: "Dev: Variazione parametrica", type: "text" },
      { path: "deviationLabels.technique_variant", label: "Dev: Variante tecnica", type: "text" },
      { path: "deviationLabels.hybrid", label: "Dev: Ibridazione", type: "text" },
      { path: "deviationLabels.experimental", label: "Dev: Sperimentale", type: "text" },
      // Author variant names
      { path: "authorNames.bonci_no_knead", label: "Autore: Bonci — Nome metodo", type: "text" },
      { path: "authorNames.martucci_biga_ibrida", label: "Autore: Martucci Biga Ibrida — Nome", type: "text" },
      { path: "authorNames.martucci_biga_100", label: "Autore: Martucci Biga 100 — Nome", type: "text" },
      { path: "authorNames.pepe_sensoriale", label: "Autore: Pepe — Nome metodo", type: "text" },
      { path: "authorNames.bosco_idrolisi", label: "Autore: Bosco — Nome metodo", type: "text" },
      { path: "authorNames.capuano_forbici", label: "Autore: Capuano — Nome metodo", type: "text" },
      { path: "authorNames.pepe_sensory_layering", label: "Autore: Pepe Layering — Nome metodo", type: "text" },
      { path: "authorNames.bianco_long_ferment", label: "Autore: Bianco — Nome metodo", type: "text" },
      { path: "authorNames.forkish_saturday", label: "Autore: Forkish — Nome metodo", type: "text" },
      // Author display names
      { path: "authorAuthors.bonci_no_knead", label: "Autore: Bonci — Nome persona", type: "text" },
      { path: "authorAuthors.martucci_biga_ibrida", label: "Autore: Martucci — Nome persona", type: "text" },
      { path: "authorAuthors.martucci_biga_100", label: "Autore: Martucci 100 — Nome persona", type: "text" },
      { path: "authorAuthors.pepe_sensoriale", label: "Autore: Pepe — Nome persona", type: "text" },
      { path: "authorAuthors.bosco_idrolisi", label: "Autore: Bosco — Nome persona", type: "text" },
      { path: "authorAuthors.capuano_forbici", label: "Autore: Capuano — Nome persona", type: "text" },
      { path: "authorAuthors.pepe_sensory_layering", label: "Autore: Pepe Layering — Nome persona", type: "text" },
      { path: "authorAuthors.bianco_long_ferment", label: "Autore: Bianco — Nome persona", type: "text" },
      { path: "authorAuthors.forkish_saturday", label: "Autore: Forkish — Nome persona", type: "text" },
    ],
  },
  {
    id: "engine",
    label: "Motore — Messaggi",
    icon: "cpu",
    description: "Template messaggi del motore scientifico (penalties, warnings, claims, reasons). Supportano {param} per interpolazione.",
    fields: [
      // Authenticity
      { path: "engineMessages.auth.hydrationOff", label: "Auth: Idratazione fuori centro", type: "text", description: "{penalty}" },
      { path: "engineMessages.auth.wOutOfRange", label: "Auth: W fuori range", type: "text", description: "{penalty}" },
      { path: "engineMessages.auth.plOutOfRange", label: "Auth: P/L fuori range", type: "text", description: "{pl}, {plMin}, {plMax}, {penalty}" },
      { path: "engineMessages.auth.notWoodOven", label: "Auth: Non forno a legna", type: "text" },
      { path: "engineMessages.auth.tempVsIdeal", label: "Auth: Temp vs ideale", type: "text", description: "{temp}, {ideal}, {penalty}" },
      { path: "engineMessages.auth.tempBelowMin", label: "Auth: Temp sotto minimo", type: "text", description: "{penalty}" },
      { path: "engineMessages.auth.fermentTooShort", label: "Auth: Fermentazione breve", type: "text", description: "{penalty}" },
      { path: "engineMessages.auth.fermentTooLong", label: "Auth: Fermentazione lunga", type: "text", description: "{penalty}" },
      // Feasibility
      { path: "engineMessages.feas.ovenSuboptimal", label: "Feas: Forno sub-ottimale", type: "text", description: "{temp}, {ideal}" },
      { path: "engineMessages.feas.ovenTooCold", label: "Feas: Forno troppo freddo", type: "text", description: "{temp}, {min}" },
      { path: "engineMessages.feas.wTooLow", label: "Feas: W troppo basso", type: "text", description: "{w}, {wMin}" },
      { path: "engineMessages.feas.wTooHigh", label: "Feas: W molto alto", type: "text", description: "{w}" },
      { path: "engineMessages.feas.hydrationBeginnerHigh", label: "Feas: H alta principiante", type: "text" },
      { path: "engineMessages.feas.hydrationNeedsPractice", label: "Feas: H richiede pratica", type: "text" },
      { path: "engineMessages.feas.hydrationMedBeginner", label: "Feas: H media principiante", type: "text" },
      { path: "engineMessages.feas.flourTooWeakForHydration", label: "Feas: Farina debole", type: "text" },
      { path: "engineMessages.feas.prefermentNeedsExperience", label: "Feas: Pre-fermento esperienza", type: "text" },
      // Digestibility
      { path: "engineMessages.dig.fermentTooShort", label: "Dig: Ferment breve amidi", type: "text" },
      { path: "engineMessages.dig.fermentShort", label: "Dig: Ferment breve digeribilità", type: "text" },
      { path: "engineMessages.dig.fodmapReduced", label: "Dig: FODMAP ridotti", type: "text", description: "{pct}" },
      { path: "engineMessages.dig.fodmapHighReduction", label: "Dig: FODMAP >80%", type: "text" },
      { path: "engineMessages.dig.extremeMaturation", label: "Dig: Maturazione estrema", type: "text" },
      { path: "engineMessages.dig.highYeastDosage", label: "Dig: Dosaggio lievito alto", type: "text", description: "{pct}, {penalty}" },
      { path: "engineMessages.dig.coldFermentation", label: "Dig: Fermentazione fredda", type: "text" },
      // Sustainability
      { path: "engineMessages.sust.quickCook", label: "Sust: Cottura rapida", type: "text" },
      { path: "engineMessages.sust.longCook", label: "Sust: Cottura lunga", type: "text" },
      { path: "engineMessages.sust.ambientFerment", label: "Sust: Fermentazione ambiente", type: "text" },
      { path: "engineMessages.sust.pureDough", label: "Sust: Impasto puro", type: "text" },
      { path: "engineMessages.sust.sourdoughZeroImpact", label: "Sust: Lievito madre zero", type: "text" },
      // Recommendation
      { path: "engineMessages.rec.timeCompatible", label: "Rec: Tempo compatibile", type: "text", description: "{fMin}, {fMax}" },
      { path: "engineMessages.rec.timeAdaptable", label: "Rec: Tempo adattabile", type: "text", description: "{hours}" },
      { path: "engineMessages.rec.timeInsufficient", label: "Rec: Tempo insufficiente", type: "text", description: "{fMin}, {available}" },
      { path: "engineMessages.rec.needsWoodOven", label: "Rec: Serve forno a legna", type: "text" },
      { path: "engineMessages.rec.ovenIdeal", label: "Rec: Forno ideale", type: "text", description: "{ideal}" },
      { path: "engineMessages.rec.ovenAdequate", label: "Rec: Forno adeguato", type: "text" },
      { path: "engineMessages.rec.ovenTooCold", label: "Rec: Forno freddo", type: "text", description: "{temp}, {min}" },
      { path: "engineMessages.rec.skillMatch", label: "Rec: Livello OK", type: "text" },
      { path: "engineMessages.rec.skillExpert", label: "Rec: Esperto", type: "text" },
      { path: "engineMessages.rec.hydrationNeedsPractice", label: "Rec: H pratica", type: "text" },
      { path: "engineMessages.rec.advancedForBeginner", label: "Rec: Avanzato principiante", type: "text" },
      { path: "engineMessages.rec.noKneadNoMixer", label: "Rec: No-knead", type: "text" },
      { path: "engineMessages.rec.handsHighHydration", label: "Rec: Mano H alta", type: "text" },
      { path: "engineMessages.rec.handsMedHydration", label: "Rec: Mano H media", type: "text" },
      { path: "engineMessages.rec.forkIdealHighH", label: "Rec: Forcella H alta", type: "text" },
      { path: "engineMessages.rec.forkLowFriction", label: "Rec: Forcella attrito", type: "text" },
      { path: "engineMessages.rec.spiralOptimal", label: "Rec: Spirale ottimale", type: "text" },
      { path: "engineMessages.rec.domesticStrugglesHighH", label: "Rec: Domestica H alta", type: "text" },
      { path: "engineMessages.rec.mixerHelps", label: "Rec: Impastatrice aiuta", type: "text" },
      { path: "engineMessages.rec.mixerRecommended", label: "Rec: Impastatrice consigliata", type: "text" },
      { path: "engineMessages.rec.castIronPerfect", label: "Rec: Ghisa perfetta", type: "text" },
      { path: "engineMessages.rec.panFits", label: "Rec: Teglia adatta", type: "text" },
      { path: "engineMessages.rec.needsPan", label: "Rec: Serve teglia", type: "text" },
      { path: "engineMessages.rec.refractoryIdeal", label: "Rec: Refrattario ideale", type: "text" },
      { path: "engineMessages.rec.steelPlateCrispy", label: "Rec: Acciaio croccante", type: "text" },
      { path: "engineMessages.rec.panPerfect", label: "Rec: Teglia perfetta", type: "text" },
      { path: "engineMessages.rec.flourMatch", label: "Rec: Farina compatibile", type: "text" },
      { path: "engineMessages.rec.flourPartial", label: "Rec: Farina parziale", type: "text" },
      { path: "engineMessages.rec.flourNoMatch", label: "Rec: Nessuna farina", type: "text" },
      { path: "engineMessages.rec.sourdoughLongFerment", label: "Rec: LM lunga ferment", type: "text" },
      { path: "engineMessages.rec.sourdoughOnlyShort", label: "Rec: Solo LM breve", type: "text" },
    ],
  },
];