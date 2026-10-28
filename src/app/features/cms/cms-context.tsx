import { STYLES_DB } from "../../domain/styles-db";
import { METHOD_MESSAGES_IT } from "../../data/method-messages";
import { ALLERGEN_MESSAGES_IT } from "../../data/allergen-data";
import { DIETARY_MESSAGES_IT } from "../../data/dietary-data";
import React, { createContext, useContext, useState, useCallback, useMemo, useEffect, useRef } from "react";
import { DEFAULT_UI_SCORE_WEIGHTS } from "../../domain/recipe-score";
import {
  LOCALE_BCP47,
  LOCALE_BUNDLE_REV,
  getCachedLocaleBundle,
  isKnownLocale,
  isStaleLocaleSnapshot,
  loadLocaleBundle,
} from "./locales/index";
import {
  PRE_FERMENT_DEFAULTS,
  TROUBLESHOOTING_I18N_DEFAULTS,
  GLOSSARY_TERMS_DEFAULTS,
} from "./domain-i18n-defaults";
import { STYLE_PHOTOS } from "../../data/style-photos";
import type {
  GlossaryMessages,
  TroubleshootingMessages,
} from "../../i18n/domain-contracts";
import { UI_MESSAGES_IT } from "../../i18n/ui-messages.it";
import type { ToppingTranslation } from "../../data/topping-i18n/types";
import type { InspirationTranslation } from "../../data/inspiration-i18n/types";
import {
  registerUiMessages,
  setActiveUiLocale,
} from "../../i18n/ui-messages";
import { resolveBrandTokens } from "../../config/brand";

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

interface CmsLocale {
  /** Active locale code */
  id: LocaleId;
  /** Display name */
  name: string;
}

/** Generic UI strings — buttons, labels, actions, placeholders */
export interface CmsUiStrings {
  scoreTipTitle: string;
  scoreTipOriginal: string;
  scoreTipTailored: string;
  scoreTipGlobal: string;
  scoreTipBlocked: string;

  pantrySelectionSummary: string;
  pantryWValue: string;
  pantryWEstimate: string;
  pantryFull: string;
  pantryQuickHint: string;
  pantryStatusHint: string;
  pantryHave: string;
  pantryUnspecified: string;
  pantryDoNotUse: string;
  pantryDough: string;
  pantryToppings: string;
  pantrySearch: string;
  pantryDetails: string;
  pantryMyFlour: string;
  pantryAddFlour: string;
  pantryFlourName: string;
  pantryProducer: string;
  pantryFlourW: string;
  pantryFlourPL: string;
  pantryProtein: string;
  pantryFlourDataHint: string;
  pantryInvalidValue: string;
  pantryPolicies: string;
  pantryToppingsComplete: string;
  pantryAutoSaved: string;
  pantryNoResults: string;
  pantryShowMore: string;

  aboutLabel: string;
  aboutDevelopment: string;
  aboutDescription: string;
  // Actions
  copy: string;
  share: string;
  back: string;
  reset: string;
  close: string;
  closeDetails: string;
  closeInsight: string;
  modify: string;
  disable: string;
  restore: string;
  generate: string;
  chooseStyle: string;
  customizeParams: string;
  /** Gerarchia azioni (Proposta A, lug 2026): invito testuale Easy che apre
   *  il dialog Personalizza. Opzionali: fallback sul default. */
  adjustByHand?: string;
  adjustByHandQuestion?: string;
  /** Redesign lug 2026: label temperatura di fermentazione nell'accordion
   *  parametri dello spec-sheet Impasto. Opzionale. */
  specFermentTemp?: string;
  /** Redesign lug 2026: azione "Personalizza" sulla match card (apre il
   *  dialog parametri; sostituisce la leva "Regola a mano"). Opzionale. */
  personalize?: string;
  changeStyle: string;
  newPizza: string;
  // Recipe output
  ingredients: string;
  procedure: string;
  steps_count: string;       // "{n} passaggi" template
  doughBalls: string;
  timeline: string;
  doughBallsFrom: string;    // "da {w}" template, with {w} already formatted for the selected unit system
  totalDough: string;
  startTime: string;
  endTime: string;
  // Recipe output — clipboard/share text
  clipboardBalls: string;        // "{n} panetti da {w}", with {w} already formatted
  clipboardTotal: string;        // "Totale: {g}", with {g} already formatted
  clipboardProcedure: string;    // "{style} — Procedimento"
  // Recipe output — ingredient names
  flour: string;
  flourMix: string;
  flourEffectiveGluten: string;
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
  bakeAdjustmentTitle: string;
  relativeToBase: string;
  // Recipe output — aria labels
  ariaReduceBalls: string;
  ariaAddBalls: string;
  // Stat strip
  statHydration: string;
  statOven: string;
  /** M-6/M-8: stili fritti e non lievitati. */
  statRest: string;
  statOil: string;
  statCookTime: string;
  statFermentation: string;
  /** Tabella parametri (round 7): "Forza farina" + contesto lievitazione. */
  statFlourStrength: string;
  fermentEnvAmbient: string;
  fermentEnvFridge: string;
  statTempSuffix: string;        // "a {t}°C"
  statIdeal?: string;
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
  /** Slot del pasto oltre domani: {day} = giorno della settimana per lingua. */
  slotWeekdayLunch: string;
  slotWeekdayDinner: string;
  slotNoPreference: string;
  slotNoPreferenceSub: string;
  /** C-5: le interpretazioni d'autore non sono ricette firmate. */
  interpretationDisclaimer: string;
  /** M-11: lievito trasparente e correzione personale. */
  yeastHowToggle: string;
  yeastModelBody: string;
  yeastDryNote: string;
  yeastTempModelNote: string;
  yeastEstimateNote: string;
  yeastPersonalLegend: string;
  yeastPersonalHint: string;
  yeastSpeedMuchSlower: string;
  yeastSpeedSlower: string;
  yeastSpeedAsExpected: string;
  yeastSpeedFaster: string;
  yeastSpeedMuchFaster: string;
  /** U-2: panetti a partire dalla farina disponibile. */
  flourBudgetToggle: string;
  flourBudgetInput: string;
  flourBudgetResult: string;
  flourBudgetTooLittle: string;
  flourBudgetApply: string;
  /** U-2: orario del pasto scelto a mano. */
  slotCustom: string;
  slotCustomInput: string;
  slotCustomConfirm: string;
  /** U-1 — salvataggio non riuscito: storage del browser pieno. */
  saveFailedStorage: string;
  saveFailedDismiss: string;
  /** U-10 (F11) — annunci per lettori di schermo (regioni live). */
  stylesFoundStatus: string;
  searchResultsStatus: string;
  quantitiesUpdatedStatus: string;
  slotCustomOutOfRange: string;
  /** Badge delle ricette iconiche in Scopri. */
  badgeAvpnRules: string;
  badgeIgpRules: string;
  badgeBonciMethod: string;
  badgeRomanSnack: string;
  badgeRomanBakery: string;
  /** Grasso dell'impasto e metodo (sottotitolo del procedimento). */
  fatButter: string;
  fatLard: string;
  procedureDirect: string;
  procedurePreferment: string;
  procedureUnleavened: string;
  /** Uso suggerito della farina per forza W (ingredienti). */
  flourUseVeryStrong: string;
  flourUseStrong: string;
  flourUseMedium: string;
  flourUseWeak: string;
  /** M-10: esito «non fattibile così» della ricetta. */
  verdictTitle: string;
  verdictOvenTooCold: string;
  verdictTimeWindow: string;
  verdictFermentationTooShort: string;
  verdictLaterTime: string;
  verdictAlternatives: string;
  verdictRecipeBelow: string;
  // Score dashboard
  recipeScore: string;
  recipeNameEdit: string;
  recipeNameLabel: string;
  recipeNamePlaceholder: string;
  recipeNameConfirm: string;
  recipeResetPreset: string;
  recipeOpenCreate: string;
  createSourceTitle: string;
  createSourceHint: string;
  createSourceAction: string;
  supplyUnknownHint: string;
  supplyPantryInventory: string;
  supplyEquipmentInventory: string;
  supplyPartial: string;
  supplyComplete: string;
  supplyFlourPurchase: string;
  supplyEquipmentPurchase: string;
  supplyUnspecified: string;
  supplyAllowed: string;
  supplyForbidden: string;
  supplyExcludedFlours: string;
  supplyAddExclusion: string;
  recipeAdaptationsIncluded: string;
  recipeOptimizationChanges: string;
  recipeCurrentVersion: string;
  recipeOptimizedVersion: string;
  recipeScoreLabel: string;
  recipeScoreTransition: string;
  scoreBasisOriginal: string;
  scoreBasisTailored: string;
  scoreLimitedAuthenticity: string;
  scoreLimitedFeasibility: string;
  scoreWeightedAverage: string;
  scoreAuthenticityCeiling: string;
  scoreFeasibilityCeiling: string;
  scoreNotWeighted: string;
  scoreReferencePending: string;
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
  badgeIdeal: string;           // "Consigliato" — slot con fermentazione più vicina a ~24h (finestra ideale, non il più rapido)
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
  equipByHand: string;
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

interface CmsInlineTips {
  timeSlot: string;
  skill: string;
  equipment: string;
  oven: string;
  pantry: string;
  kitchenTemp: string;
}

interface CmsHero {
  title_line1: string;
  title_line2: string;
  subtitle: string;
  /** Onboarding primo uso (audit lug 2026) — card sobria una-tantum sopra le
   *  domande del passo 1. Opzionali: i locale non tradotti cadono sul default. */
  onboardingProfileCta?: string;
  /** D-038: chiude l'avviso del forno senza cambiarlo. */
  onboardingDismiss?: string;
}

interface CmsStepHeader {
  number: string;
  title: string;
  subtitle: string;
}

interface CmsSectionHeader {
  title: string;
  description: string;
}

interface CmsTimeSlot {
  label: string;
  sublabel: string;
  emoji: string;
  hours: number;
}

interface CmsOvenPreset {
  name: string;
  maxTemp: number;
  icon: string;
}

interface CmsSkillLevel {
  name: string;
  description: string;
}

interface CmsFamily {
  name: string;
  description: string;
  emoji: string;
}

interface CmsTier {
  label: string;
  subtitle: string;
}

interface CmsScoreDimension {
  label: string;
  short: string;
  weight: number;
  /** Learn-inline (audit lug 2026): spiegazione dell'asse mostrata a richiesta
   *  nella match card. Opzionale: i locale non tradotti cadono sul default. */
  explain?: string;
}

interface CmsRecommendationWeights {
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
  /** Spiegazione estesa per il principiante: come si fa concretamente, cosa cercare, errori comuni */
  longDesc?: string;
  /** Variante della spiegazione estesa (pre-fermento: longDesc = poolish, longDescAlt = biga) */
  longDescAlt?: string;
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
  paramYeast: string;
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

/** Troubleshooting — category labels + issue content + contextual warnings */
export type CmsTroubleshootingI18n = TroubleshootingMessages;

/** Glossary term content — per-term i18n strings */
export type CmsGlossaryTerms = GlossaryMessages;

/** Profile page strings — sections, FTU, locale modal */
interface CmsProfile {
  pageTitle: string;
  pageSubtitle: string;
  // Favorites (R31)
  favoritesTitle: string;
  favoritesSubtitle: string;
  favoriteRemove: string;
  favoriteRemoveAria: string;
  savedRecipesTitle: string;
  savedRecipesSubtitle: string;
  savedRecipesEmptyTitle: string;
  savedRecipesEmptyBody: string;
  savedRecipesEmptyCta: string;
  savedRecipeRemove: string;
  savedRecipeRemoveAria: string;
  /** U-1: esportazione, importazione, link e annulla nel ricettario. */
  savedRecipesLocalNote: string;
  savedRecipesExport: string;
  savedRecipesImport: string;
  savedRecipeCopyLink: string;
  savedRecipeCopyLinkAria: string;
  savedRecipeLinkCopied: string;
  savedRecipeRemoved: string;
  savedRecipeUndo: string;
  savedRecipesImported: string;
  savedRecipesImportDuplicates: string;
  savedRecipesImportSkipped: string;
  savedRecipesImportRejected: string;
  savedRecipesImportNothing: string;
  savedRecipesImportErrorFormat: string;
  savedRecipesImportErrorNewer: string;
  savedRecipesImportErrorStorage: string;
  savedRecipesExportFileName: string;
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
  themeAuto: string;
  unitTitle: string;
  unitSubtitle: string;
  unitStep: string;
  unitSystemLabel: string;
  unitMetric: string;
  unitMetricDesc: string;
  unitImperial: string;
  unitImperialDesc: string;
  resetProfile: string;
  resetConfirmMessage: string;
  devModeOn: string;
  devModeOff: string;
  locationTitle: string;
  locationSubtitle: string;
  locationStep: string;
  locationPlaceholder: string;
  locationAuto: string;
  locationAutoDetected: string;
  locationSaved: string;
  locationNone: string;
  locationSearching: string;
  locationNoResults: string;
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
  // Special flours
  flourFarro: string;
  flourKamut: string;
  flourSegale: string;
  flourTipo1: string;
  flourTipo2: string;
  flourMacinataPietra: string;
  // Onboarding Done screen
  ftuDoneTitle: string;
  ftuDoneCreateTitle: string;
  ftuDoneCreateDesc: string;
  ftuDoneExploreTitle: string;
  ftuDoneExploreDesc: string;
  ftuDoneLearnTitle: string;
  ftuDoneLearnDesc: string;
  ftuDoneProfileNote: string;
  specialFloursOnboarding: string;
  locationRemove: string;
  ftuSkipMessage: string;
}

/** Page-level strings for nav, explore, learn, recipe, not-found, search */
interface CmsPages {
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
  homeAria: string;
  devToolsAria: string;
  mottoAria: string;
  troubleshootSearchPlaceholder: string;
  // Home result section
  dietaryWarningsTitle: string;
  troubleshootingTitle: string;
  troubleshootingDesc: string;
  // Explore page extensions
  exploreRecipe: string;
  exploreHeroDesc: string;
  exploreFilterFeatured: string;
  exploreFilterStyles: string;
  exploreFilterRecipes: string;
  // Learn page extensions
  learnFilterSubtitle: string;
  learnRemoveFilter: string;
  learnOpenGlossary: string;
  learnPathLabel: string;
  learnStartPath: string;
  learnTermOfTheDay: string;
  learnPath1Title: string;
  learnPath1Copy: string;
  learnPath2Title: string;
  learnPath2Copy: string;
  learnPath3Title: string;
  learnPath3Copy: string;
  learnPath4Title: string;
  learnPath4Copy: string;
  // Pre-ferments extensions
  preFermentsSubtitle: string;
  preFermentsDescription: string;
  preFermentsChoiceTitle: string;
  preFermentsBigaTitle: string;
  preFermentsBigaWhen: string;
  preFermentsBigaBest: string;
  preFermentsPoolishTitle: string;
  preFermentsPoolishWhen: string;
  preFermentsPoolishBest: string;
  preFermentsAutolisiTitle: string;
  preFermentsAutolisiWhen: string;
  preFermentsAutolisiBest: string;
  // Custom styles extensions
  stylesModified: string;
  stylesCustom: string;
  noChanges: string;
  deactivateCustomStyles: string;
  deactivate: string;
  passToEasy: string;
  activateNerd: string;
}

/** Recipe configurator slider labels and tooltips */
interface CmsConfigurator {
  hydrationLabel: string;
  hydrationTip: string;
  flourWLabel: string;
  flourWLabelBlend: string;
  flourWTip: string;
  plLabel: string;
  plTip: string;
  fermentLabel: string;
  /** M-8: impasti non lievitati (Recco). */
  restLabel: string;
  restTip: string;
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
  /** Catalogo estensibile per copy montato non coperto dalle sezioni legacy. */
  messages?: Record<string, string>;
  /** I18N-2: traduzioni della libreria condimenti (assenti in italiano). */
  toppingI18n?: ToppingTranslation;
  /** I18N-5: ispirazioni e ricette iconiche tradotte (assente in italiano, che è la fonte). */
  inspirationI18n?: InspirationTranslation;
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
  /** Scheda ricetta + sessione "pizzata" (recipe-view, recipe-output,
   *  cooking-mode, active-cook-widget). Template con {placeholder} via t(). */
  cooking: {
    sectionsAria: string;
    toppingPrevAria: string;
    toppingNextAria: string;
    notPersonalizedAria: string;
    ballEstimateTooltip: string;
    tabRecipe: string;
    tabRecipeTailored: string;
    /** Etichetta stato ricetta non personalizzata (pill contesto + occhiello). */
    recipeCanonical: string;
    /** Occhiello hero: variante canonica senza ripetere "Ricetta" (già nel tab).
     *  Opzionale: i locali che non la definiscono ricadono su recipeCanonical. */
    recipeCanonicalEyebrow?: string;
    /** Dialog pre-cottura: la ricetta canonica non è ancora adattata. */
    preCookTitle: string;
    preCookBody: string;
    preCookAdapt: string;
    preCookStart: string;
    /** Match card — tono relazionale per fascia di punteggio (≥90/75/60/40/resto). */
    matchTones: {
      t90: { title: string; canonical: string; adapted: string };
      t75: { title: string; canonical: string; adapted: string };
      t60: { title: string; canonical: string; adapted: string };
      t40: { title: string; canonical: string; adapted: string };
      t0: { title: string; canonical: string; adapted: string };
    };
    /** Match card — riga soffitto/margine. Template con {ceiling} e {needs} via t(). */
    ceilingUnviableOven: string;
    ceilingUnviable: string;
    ceilingOvenWall: string;
    ceilingNeeds: string;
    /** Variante a soffitto raggiunto: il punteggio mostrato ASSUME acquisti
     *  (es. farina W310 non in dispensa) — niente "per arrivare a", ci sei già. */
    ceilingNeedsAtCeiling: string;
    ceilingOptimize: string;
    ceilingCanonicalOk: string;
    ceilingCompromise: string;
    /** Match card — voce "lista della spesa" farina ({w} = W ottimale). */
    needFlour: string;
    /** Match card — azioni. */
    makePossible: string;
    adaptToKitchen: string;
    optimizeForMe: string;
    resetToOriginal: string;
    saveVersion: string;
    savedVersion: string;
    optimizedForSetup: string;
    /** Chiusura pizzata completata ({style} = nome dello stile). */
    doneBody: string;
    tabProcedure: string;
    toppingTitle: string;
    /** Etichetta sezione condimento per gli stili FARCITI (es. "Farcitura").
     *  Se assente, si usa toppingTitle. */
    fillingTitle?: string;
    chooseTopping: string;
    learnMore: string;
    tailoredEyebrow: string;
    recipeEyebrow: string;
    start: string;
    resume: string;
    startShort: string;
    inProgressShort: string;
    followYou: string;
    reopen: string;
    completed: string;
    waitOver: string;
    /** "È ora: {title}" */
    dueNow: string;
    /** "{style} · passo {n}/{total}" */
    stepProgress: string;
    interrupt: string;
    abortConfirm: string;
    abortConfirmTitle: string;
    /** "Perderai timer e avanzamento di questa {style}…" */
    abortBody: string;
    abortYes: string;
    abortNo: string;
    minimize: string;
    minimizeHint: string;
    inProgress: string;
    done: string;
    finish: string;
    finishedEarly: string;
    phaseDone: string;
    /** Giorno di oggi accanto a un orario («oggi»). */
    dayToday: string;
    dayTomorrow: string;
    /** Prefisso degli orari arrotondati («ca. 18:15»); spazio incluso se serve. */
    approxPrefix: string;
    dayAfterTomorrow: string;
    dayOffset: string;
    etaNow: string;
    etaInMinutes: string;
    etaInHours: string;
    etaInHoursMinutes: string;
    etaInDaysHours: string;
    compactSeconds: string;
    compactMinutes: string;
    compactHours: string;
    compactHoursMinutes: string;
    durationMinutes: string;
    durationHours: string;
    durationHoursMinutes: string;
    durationDays: string;
    durationDaysHours: string;
    durationDayUnit: string;
    durationDaysUnit: string;
    stepStartsIn: string;
    phaseRemaining: string;
    passivePhaseMeta: string;
    activePhaseMeta: string;
    yourTurn: string;
    passiveCloseHint: string;
    readyAt: string;
    widgetStepReadyAt: string;
    widgetStepDueIn: string;
    waitingReadyAt: string;
    stepDoneBadge: string;
    continueAction: string;
    doneAction: string;
    nextStep: string;
    replaceBody: string;
    replaceStart: string;
    replaceResume: string;
    notificationWaitDoneTitle: string;
    notificationDueTitle: string;
    notificationBody: string;
    documentTitleDue: string;
    documentTitleCountdown: string;
    prevStep: string;
    replaceTitle: string;
    confirmNewAria: string;
    recipeAdapted: string;
    ovenSummary: string;
    ovenOptimal: string;
    ovenLimited: string;
    ovenNeedsAdaptation: string;
    procedureHeroDescription: string;
    toppingNotesTitle: string;
    toppingAmountsNote: string;
    toppingPerUnit: string;
    durationLabel: string;
    comfortLabel: string;
    totalDuration: string;
    finalDoughStageTitle: string;
    rule55Title: string;
    rule55AriaOpen: string;
    rule55AriaClose: string;
    rule55Description: string;
    stepDetailsShow: string;
    stepDetailsHide: string;
    /** Toggle dettagli della match card (barre punteggio, stato forno).
     *  Opzionale: i locale non ancora tradotti cadono sul default. */
    matchDetailsShow?: string;
    /** Redesign lug 2026: toggle compatto sotto il numero del Match
     *  ("Dettagli ⌄" / "Nascondi ⌃"). Opzionali. */
    matchDetails?: string;
    matchDetailsHide?: string;
    /** Redesign lug 2026: avviso all'uscita con modifiche non salvate
     *  (sostituisce la gestione bozze/parcheggio). {style} interpolato. */
    unsavedTitle?: string;
    unsavedBody?: string;
    unsavedDiscard?: string;
    /** Learn-inline assi (audit lug 2026) — etichetta della formula pesata in
     *  nerd mode e peso dell'asse nel pannello di spiegazione. Opzionali. */
    matchBreakdownLabel?: string;
    matchAxisWeight?: string;
    /** "È andata lunga?" (audit lug 2026) — domanda per-fase che porta
     *  all'issue di troubleshooting più probabile (STEP_TROUBLE). Chiavi:
     *  preferment/mix/bulk/proof/shape/bake. Opzionale. */
    troubleStepLinks?: Record<string, string>;
    /** Ondata 1 (audit lug 2026) — ricetta parcheggiata: card Riprendi negli
     *  step precedenti + conferma prima di sostituirla con un nuovo stile.
     *  Opzionali: i locale non ancora tradotti cadono sul default. */
    draftResumeEyebrow?: string;
    draftResumeCta?: string;
    draftReplaceTitle?: string;
    draftReplaceBody?: string;
    draftReplaceConfirm?: string;
    /** Nota sotto lo scorporo biga/poolish (prima hardcoded in italiano). */
    prefermentSaltNote?: string;
    /** Pannello F2 "Vulcan ha imparato dai tuoi tentativi" (prima hardcoded). */
    learnedFromAttempts?: string;
    applyCorrections?: string;
    learnInlineTitle: string;
    tipsCountOne: string;
    tipsCountMany: string;
    servingUnits: Record<string, { singular: string; plural: string }>;
  };
  /** Stringhe UI varie prima hard-coded nei componenti (VPL-082) */
  misc: {
    showAllStyles: string;
    noFloursInCategory: string;
    noTroubleshootingResults: string;
    moreInfo: string;
    changeTiming: string;
    kitchenTempSubtitle: string;
    techAdjustmentsApplied: string;
    techDataAria: string;
    techDataTitle: string;
    feedbackYes: string;
    feedbackNo: string;
    feedbackPlaceholder: string;
    preFermentCompare: string;
    scoreExplainer: string;
    companionContext: string;
    companionSetup: string;
    companionStyles: string;
    smartLinkOn: string;
    smartLinkOff: string;
    smartLinkApplied: string;
    settingsHelp: string;
    versionsLabel: string;
    versionsHint: string;
    learnHeroTitle1: string;
    learnHeroTitle2: string;
    learnHeroSubtitle: string;
    learnResources: string;
    kitchenTempLabel: string;
    kitchenTempDown: string;
    kitchenTempUp: string;
    current: string;
    noStyleInFamily: string;
    notFeasibleExplainer: string;
    exploreHeroTitle1: string;
    exploreHeroTitle2: string;
    exploreSectionTraditional: string;
    badgeBeginnerFriendly: string;
    interpretationsLabel: string;
    goToSite: string;
    signatureLabel: string;
    noSignature: string;
    fineParams: string;
    cmsRestoreContent: string;
    /** Riga "Ispirazione" sulla scheda ricetta (redesign lug 2026): chip solo
     *  per le firme che cambiano i parametri; le storie vivono nella modale. */
    inspirationLabel: string;
    /** Chip base sempre selezionabile ("Tradizionale"): il canone dello stile
     *  quando nessuna firma è attiva — il default non è mai una firma. */
    inspirationBase: string;
    inspirationSeeAll: string;
    inspirationModalTitle: string;
    inspirationLearnLink: string;
    /** Selezione delle varianti dalla modale "Vedi tutte". */
    inspirationSelect: string;
    inspirationSelected: string;
  };
  /** Form feedback post-cottura (recipe-feedback) — VPL-082 */
  feedback: {
    savedTitle: string;
    savedBody: string;
    nextTimeTitle: string;
    triedQuestion: string;
    triedSubtitle: string;
    success: string;
    fail: string;
    detailedPrompt: string;
    detailedSubtitle: string;
    detailedTitle: string;
    recipeSuccess: string;
    recipeFail: string;
    ratingOverall: string;
    ratingTaste: string;
    ratingTexture: string;
    ratingDifficulty: string;
    ratingDifficultyHint: string;
    ratingAuth: string;
    ratingAuthHint: string;
    ratingDig: string;
    ratingDigHint: string;
    issuesLabel: string;
    notesLabel: string;
    submit: string;
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
    timeFast: string;
    ovenLabel: string;
    ovenHome: string;
    ovenWood: string;
    ovenElectricHigh: string;
    ovenPan: string;
    /** Ricerca testuale nella lista stili del Crea (audit lug 2026).
     *  Opzionali: i locale non ancora tradotti cadono sul default. */
    stylesSearchPlaceholder?: string;
    stylesSearchNoResults?: string;
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
    sheetMatchTitle: string;
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
    /** Cottura fuori dal regime di riferimento dello stile: stima del motore. */
    bakeAdaptedNerd: string;
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
  messages: UI_MESSAGES_IT,
  ui: {
    scoreTipTitle: "Come leggere il punteggio",
    scoreTipOriginal: "Ricetta originale, valutata con la tua cucina.",
    scoreTipTailored: "Versione con gli adattamenti proposti.",
    scoreTipGlobal: "Il voto tiene conto di fattibilità e autenticità. Non attesta la conformità a un disciplinare.",
    scoreTipBlocked: "Ci sono requisiti non rispettati: apri il dettaglio.",
    pantrySelectionSummary: "Selezionati: {n} · Esclusi: {excluded}",
    pantryWValue: "W{w}",
    pantryWEstimate: "≈ W{w}",
    pantryFull: "Dispensa completa",
    pantryQuickHint: "Seleziona cosa hai. Marche, dettagli ed esclusioni sono nella dispensa completa.",
    pantryStatusHint: "Indica cosa hai o cosa vuoi escludere. Puoi lasciare il resto da specificare.",
    pantryHave: "Ce l’ho",
    pantryUnspecified: "Non specificato",
    pantryDoNotUse: "Non usare",
    pantryDough: "Impasto",
    pantryToppings: "Condimenti",
    pantrySearch: "Cerca ingrediente, farina o marca",
    pantryDetails: "Dettagli",
    pantryMyFlour: "La mia farina",
    pantryAddFlour: "Aggiungi la tua farina",
    pantryFlourName: "Nome della farina",
    pantryProducer: "Marca / molino",
    pantryFlourW: "Forza W",
    pantryFlourPL: "Rapporto P/L",
    pantryProtein: "Proteine (%)",
    pantryFlourDataHint: "Copia i dati della confezione. La forza della farina si verifica con la W dichiarata, non con la sola percentuale di proteine.",
    pantryInvalidValue: "Inserisci un valore positivo valido.",
    pantryPolicies: "Disponibilità e acquisti",
    pantryToppingsComplete: "Ho elencato tutti i condimenti che ho",
    pantryAutoSaved: "Modifiche salvate automaticamente",
    pantryNoResults: "Nessun ingrediente trovato",
    pantryShowMore: "Mostra altri",
    aboutLabel: "Informazioni su {brand}",
    aboutDevelopment: "Software in sviluppo",
    aboutDescription: "Stiamo ancora lavorando a {brand}. Ricette, calcoli e funzioni vengono migliorati con le prove e i tuoi riscontri.",
    recipeNameEdit: "Modifica nome della ricetta",
    recipeNameLabel: "Nome della ricetta",
    recipeNamePlaceholder: "Es. Come piace a Mario",
    recipeNameConfirm: "Conferma nome",
    recipeResetPreset: "Ripristina originale",

    recipeOpenCreate: "Apri in Crea",
    createSourceTitle: "Parti da {style}",
    createSourceHint: "Qui puoi adattare lo stile alla tua cucina e confrontare le modifiche con l’originale.",
    createSourceAction: "Vedi la proposta su misura",

    supplyUnknownHint: "Una voce non selezionata resta da verificare. Se hai elencato tutto, indica che la lista è completa.",
    supplyPantryInventory: "Elenco della dispensa",
    supplyEquipmentInventory: "Elenco della dotazione",
    supplyPartial: "Lista parziale",
    supplyComplete: "Ho indicato tutto ciò che ho",
    supplyFlourPurchase: "Procurare altre farine",
    supplyEquipmentPurchase: "Procurare altra attrezzatura",
    supplyUnspecified: "Non specificato",
    supplyAllowed: "Posso procurarmene",
    supplyForbidden: "Non voglio procurarmene",
    supplyExcludedFlours: "Farine che non voglio usare",
    supplyAddExclusion: "Aggiungi un’esclusione",

    recipeAdaptationsIncluded: "Cosa cambia",
    recipeOptimizationChanges: "Modifiche proposte",
    recipeCurrentVersion: "Attuale",
    recipeOptimizedVersion: "Proposta",
    recipeScoreLabel: "Punteggio",
    recipeScoreTransition: "Punteggio: {from}/100 → {to}/100",
    scoreBasisOriginal: "Originale",
    scoreBasisTailored: "Su misura",

    scoreLimitedAuthenticity: "L’autenticità ({score}/100) limita il punteggio.",
    scoreLimitedFeasibility: "Un requisito essenziale non è rispettato: controlla il motivo qui sotto.",
    scoreWeightedAverage: "Media ponderata dei cinque criteri",
    scoreAuthenticityCeiling: "Tetto dato dall’autenticità",
    scoreFeasibilityCeiling: "Tetto dato dalla non fattibilità",
    scoreNotWeighted: "Asse informativo: con questo peso non modifica il punteggio globale.",
    scoreReferencePending: "Profilo di deviazione non ancora verificato per questo stile.",

    copy: "Copia",
    share: "Condividi",
    back: "Indietro",
    reset: "Resetta",
    close: "Chiudi",
    closeDetails: "Chiudi dettagli",
    closeInsight: "Chiudi approfondimento",
    modify: "Modifica",
    disable: "Disattiva",
    restore: "Ripristina",
    generate: "Genera ricetta",
    chooseStyle: "Scegli lo stile",
    customizeParams: "Personalizza parametri",
    adjustByHand: "Regola a mano",
    specFermentTemp: "Fermento",
    personalize: "Personalizza",
    adjustByHandQuestion: "Preferisci decidere tu?",
    changeStyle: "Altro stile",
    newPizza: "Ricomincia",
    // Recipe output
    ingredients: "Ingredienti",
    procedure: "Procedimento",
    steps_count: "{n} passaggi",
    doughBalls: "Panetti",
    timeline: "Tabella di marcia",
    doughBallsFrom: "da {w}",
    totalDough: "di impasto totale",
    startTime: "Inizio",
    endTime: "Fine",
    // Recipe output — clipboard/share text
    clipboardBalls: "{n} panetti da {w}",
    clipboardTotal: "Totale: {g}",
    clipboardProcedure: "{style} — Procedimento",
    // Recipe output — ingredient names
    flour: "Farina",
    flourMix: "mix di farine",
    flourEffectiveGluten: "forza glutinica efficace",
    water: "Acqua",
    salt: "Sale",
    sugar: "Zucchero",
    oilEvo: "Olio d'oliva",
    // Recipe output — compensations
    compTitle: "Adattamenti per il tuo forno",
    compTitleNerd: "Compensazioni tecniche",
    compHydration: "Idratazione",
    compOil: "Olio",
    compSugar: "Zucchero",
    compCookTime: "Cottura",
    compThickness: "Spessore",
    compDefault: "Default",
    bakeAdjustmentTitle: "Cottura",
    relativeToBase: "rispetto alla base",
    // Recipe output — aria labels
    ariaReduceBalls: "Riduci il numero di panetti",
    ariaAddBalls: "Aumenta il numero di panetti",
    // Stat strip
    statHydration: "Idratazione",
    statOven: "Forno",
    statRest: "Riposo",
    statOil: "Olio",
    statCookTime: "Cottura",
    statFermentation: "Lievitazione",
    statFlourStrength: "Forza farina",
    fermentEnvAmbient: "ambiente",
    fermentEnvFridge: "frigo",
    statTempSuffix: "a {t}°C",
    statIdeal: "ideale",
    // Nerd row
    nerdTitle: "Parametri impasto",
    nerdFlourW: "Farina W",
    nerdPL: "P/L",
    nerdYeast: "Lievito",
    nerdHoursAt18: "Ore @{refTemp}",
    /* Audit roleplay giugno 2026: il valore mostrato è il fattore di velocità
     * relativa a 18°C (es. 0.52×), non il Q₁₀ vero (che è ~2): l'etichetta
     * "Q₁₀" era tecnicamente sbagliata e un nerd se ne accorge. */
    nerdQ10: "Velocità vs {refTemp}",
    nerdAw: "Aw",
    // Time format
    seconds: "secondi",
    minutes: "minuti",
    minute: "minuto",
    hours: "ore",
    hour: "ora",
    slotWeekdayLunch: "{day} a pranzo",
    slotWeekdayDinner: "{day} sera",
    slotNoPreference: "Nessuna preferenza",
    slotNoPreferenceSub: "ci pensa {brand}",
    interpretationDisclaimer: "Interpretazione di {brand} da fonti pubbliche: non è la ricetta originale di {who} e non è approvata da {who}.",
    yeastHowToggle: "Come calcoliamo il lievito",
    yeastModelBody: "Si parte da {ref} di lievito fresco sulla farina per {refHours} a {refTemp}. Con {hours} a {temp} il lievito lavora a {speed}× della velocità di riferimento: la dose diventa {pct}.",
    yeastDryNote: "Con il lievito secco la dose è un terzo del fresco.",
    yeastTempModelNote: "Come cambia la velocità con la temperatura (fattore Q10 di 2, 1,6 sotto i 10 °C) è una stima del modello, da confermare con le prove.",
    yeastEstimateNote: "È una stima, non una misura: marca e freschezza del lievito e la temperatura reale la spostano. Dose plausibile: {low}–{high}.",
    yeastPersonalLegend: "Nella tua cucina gli impasti lievitano",
    yeastPersonalHint: "Se ti crescono sempre troppo, scegli «più in fretta»: useremo meno lievito in tutte le ricette.",
    yeastSpeedMuchSlower: "Molto più piano",
    yeastSpeedSlower: "Più piano",
    yeastSpeedAsExpected: "Come previsto",
    yeastSpeedFaster: "Più in fretta",
    yeastSpeedMuchFaster: "Molto più in fretta",
    flourBudgetToggle: "Parti dalla farina che hai",
    flourBudgetInput: "Farina disponibile (g)",
    flourBudgetResult: "Risultato: {n} {unit} con {used} di farina, avanzo {left}.",
    flourBudgetTooLittle: "Non basta per 1 {unit}: servono almeno {min} di farina.",
    flourBudgetApply: "Usa {n} {unit}",
    slotCustom: "Scegli giorno e ora",
    slotCustomInput: "Quando si mangia?",
    slotCustomConfirm: "Usa questo orario",
    saveFailedStorage: "Non c'è più spazio nel browser: la ricetta non è stata salvata. Dal Profilo puoi esportare il ricettario e togliere le ricette che non usi.",
    saveFailedDismiss: "Ho capito",
    stylesFoundStatus: "Stili trovati: {n}",
    searchResultsStatus: "Risultati: {n}",
    quantitiesUpdatedStatus: "Dosi aggiornate per {n}",
    slotCustomOutOfRange: "Scegli un orario tra 1 ora e 7 giorni da adesso.",
    badgeAvpnRules: "Disciplinare AVPN",
    badgeIgpRules: "Disciplinare IGP",
    badgeBonciMethod: "Ispirato al metodo Bonci",
    badgeRomanSnack: "Spuntino romano",
    badgeRomanBakery: "Stile panaria romana",
    fatButter: "Burro",
    fatLard: "Strutto",
    procedureDirect: "Diretto",
    procedurePreferment: "Prefermento",
    procedureUnleavened: "Senza lievito",
    flourUseVeryStrong: "Manitoba o tipo 0 molto forte",
    flourUseStrong: "Tipo 0/00 forte per pizza",
    flourUseMedium: "Tipo 0 media forza",
    flourUseWeak: "Tipo 00 debole/media",
    verdictTitle: "Così non è fattibile",
    verdictOvenTooCold: "La cottura è impostata a {oven}; per questo metodo servono almeno {min}.",
    verdictTimeWindow: "Servono circa {needed}, ne hai {available}: sarebbe pronta dopo l'orario scelto.",
    verdictFermentationTooShort: "Lievitazione di {hours} contro un minimo di {min} per questo stile: sarebbe un altro impasto.",
    verdictLaterTime: "Scegli un orario fra almeno {hours}.",
    verdictAlternatives: "Con questi vincoli funzionano:",
    verdictRecipeBelow: "Puoi consultare la ricetta e vedere quali requisiti cambiare.",
    // Score dashboard
    recipeScore: "Compatibilit\u00E0 con la tua cucina",
    nerdToggle: "PizzaNerd",
    nerdActive: "Attiva PizzaNerd",
    scienceTitle: "{brand} Science",
    ariaCloseScores: "Chiudi i dettagli del punteggio",
    ariaViewScores: "Vedi i dettagli del punteggio",
    tapForDetails: "Quanto la tua versione si avvicina al massimo · Tocca per dettagli ›",
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
    badgeIdeal: "Consigliato",
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
    equipByHand: "A mano",
    equipMixer: "Impastatrice",
    equipStone: "Pietra refrattaria",
    equipSteel: "Piastra in acciaio",
    equipPan: "Teglia",
    equipKneading: "Come impasti",
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
    timeSlot: "Il tempo a disposizione e la temperatura della cucina guidano la lievitazione.",
    skill: "Adattiamo la complessità della ricetta alla tua esperienza.",
    equipment: "Pietra o piastra cambiano la crosta. La teglia è essenziale per stili come Teglia Romana o Detroit.",
    oven: "La temperatura massima del forno determina quali stili puoi replicare a casa.",
    pantry: "Indica le farine e i lieviti che hai: ne terremo conto nella ricetta.",
    kitchenTemp: "Con la temperatura reale della cucina possiamo adattare meglio tempi e lievito.",
  },
  hero: {
    title_line1: "La tua",
    title_line2: "prossima pizza.",
    subtitle: "Scegli quando vuoi portarla in tavola.",
    onboardingProfileCta: "Configura tutta la cucina",
    onboardingDismiss: "Ho capito",
  },
  steps: {
    context: { number: "01 — Contesto", title: "Quando e dove", subtitle: "Tempo, temperatura, ambiente" },
    setup: { number: "02 — Cucina", title: "La tua cucina", subtitle: "Strumenti, esperienza, dispensa" },
    styles: { number: "03 — Stile", title: "Scegli il tuo stile", subtitle: "Proposte basate sui filtri in alto." },
  },
  sections: {
    when: { title: "Quando vuoi la pizza?", description: "Seleziona il momento per calcolare i tempi di lievitazione" },
    skill: { title: "Livello di esperienza", description: "Scegli la descrizione in cui ti riconosci." },
    oven: { title: "Il tuo forno", description: "Tipo e temperatura massima" },
    pantry: { title: "Dispensa", description: "Farine e lieviti che hai a casa" },
    dietary: { title: "Esigenze alimentari", description: "Filtri opzionali" },
    equipment: { title: "Attrezzatura", description: "Cosa hai in cucina" },
  },
  timeSlots: {
    tonight:         { label: "Stasera",        sublabel: "4-6 ore",   emoji: "\u{1F319}", hours: 5 },
    tomorrow_lunch:  { label: "Domani a pranzo",  sublabel: "16-20 ore", emoji: "\u2600\uFE0F",  hours: 18 },
    tomorrow_dinner: { label: "Domani sera",    sublabel: "24-28 ore", emoji: "\u{1F306}", hours: 26 },
    day_after:       { label: "Dopodomani",     sublabel: "40-48 ore", emoji: "\u{1F4C5}", hours: 44 },
    weekend:         { label: "Nel weekend",    sublabel: "72+ ore",   emoji: "\u{1F389}", hours: 72 },
  },
  ovenPresets: {
    coal: { name: "Forno a carbone", maxTemp: 400, icon: "flame" },
    home:              { name: "Forno Domestico",    maxTemp: 250, icon: "home" },
    electric_standard: { name: "Elettrico Standard", maxTemp: 300, icon: "zap" },
    gas:               { name: "Forno a gas a platea", maxTemp: 350, icon: "flame" },
    electric_high:     { name: "Elettrico alta temperatura", maxTemp: 450, icon: "thermometer" },
    gas_pizza:         { name: "Forno a gas da pizza", maxTemp: 500, icon: "flame" },
    wood:              { name: "Forno a Legna",      maxTemp: 500, icon: "flame-kindling" },
  },
  skillLevels: {
    "1": { name: "Principiante", description: "Non ho mai impastato" },
    "2": { name: "Intermedio",   description: "Ho già fatto qualche pizza" },
    "3": { name: "Avanzato",     description: "Gestisco pieghe e lievitazioni" },
    "4": { name: "Esperto",      description: "Adatto impasti, tempi e tecniche" },
  },
  families: {
    napoletana:    { name: "Napoletana",    description: "Cornicione pronunciato, centro sottile e cottura ad alta temperatura.", emoji: "\u{1F1EE}\u{1F1F9}" },
    romana:        { name: "Romana",        description: "Dalla tonda sottile e croccante alla pizza alta in teglia.", emoji: "\u{1F3DB}\uFE0F" },
    americana:     { name: "Americana",     description: "Formati, impasti e tradizioni regionali della pizza negli Stati Uniti.", emoji: "\u{1F5FD}" },
    contemporanea: { name: "Contemporanea", description: "Nuove interpretazioni di impasti, consistenze e tecniche.", emoji: "\u{1F52C}" },
  },
  allFamiliesLabel: "Tutte le famiglie",
  tiers: {
    perfect:      { label: "Fattibili",  subtitle: "requisiti della ricetta rispettati" },
    good:         { label: "Con condizioni",        subtitle: "segui le modifiche e verifica ciò che serve" },
    challenging:  { label: "Sfidanti",         subtitle: "richiedono più attrezzatura o esperienza" },
    not_feasible: { label: "Non fattibili così",    subtitle: "manca una condizione essenziale per questa ricetta" },
  },
  scoreDimensions: {
    authenticity: {
      label: "Autenticità", short: "Aut", weight: DEFAULT_UI_SCORE_WEIGHTS.authenticity,
      explain:
        "Confronta impasto, procedimento e forno con il riferimento dello stile. Un valore basso limita il punteggio complessivo; non certifica il rispetto di un disciplinare.",
    },
    feasibility: {
      label: "Facilità", short: "Fat", weight: DEFAULT_UI_SCORE_WEIGHTS.feasibility,
      explain:
        "Stima quanto è impegnativa la preparazione con il tuo forno, la farina e la tua esperienza. I requisiti indispensabili sono indicati a parte.",
    },
    digestibility: {
      label: "Maturazione stimata", short: "Mat", weight: DEFAULT_UI_SCORE_WEIGHTS.digestibility,
      explain:
        "Stima la maturazione in base a tempo, temperatura, lievito e preimpasto. Non misura come digerirai la pizza.",
    },
    sustainability: {
      label: "Sostenibilità stimata", short: "Sos", weight: DEFAULT_UI_SCORE_WEIGHTS.sustainability,
      explain:
        "Confronta cottura, fermentazione e ingredienti. È una stima relativa, non il consumo misurato o l’impronta di carbonio della ricetta.",
    },
    experimentation: {
      label: "Sperimentazione", short: "Spe", weight: DEFAULT_UI_SCORE_WEIGHTS.experimentation,
      explain:
        "Quanto cambiano impasto, procedimento e cottura rispetto al riferimento. Un valore alto indica più sperimentazione, non una riuscita migliore. Il profilo di alcuni stili è ancora da verificare. Il contributo al globale è 100 meno questo valore.",
    },
  },
  recommendationWeights: {
    time: 0.25,
    oven: 0.25,
    skill: 0.20,
    equipment: 0.10,
    pantry: 0.20,
  },
  media: {
    /* Audit foto giugno 2026 — il CMS è SOLO un livello di override per-foto.
     * La fonte unica delle foto canoniche è STYLE_PHOTOS (recommended-styles),
     * che usa asset locali curati: duplicare qui le URL creava due verità
     * (la griglia Stili mostrava ancora le stock sbagliate). */
    stylePhotos: STYLE_PHOTOS,
    fallbackPhoto: "https://images.unsplash.com/photo-1717883235373-ef10b2a745a3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600&q=80",
  },
  result: {
    breadcrumb: "Ricetta",
    heading: "Ecco la tua ricetta",
    backLabel: "Torna alla selezione",
  },
  cooking: {
    sectionsAria: "Sezioni della ricetta",
    toppingPrevAria: "Condimento precedente",
    toppingNextAria: "Condimento successivo",
    notPersonalizedAria: "Ricetta non ancora personalizzata",
    ballEstimateTooltip: "Stima indicativa basata sulla pezzatura tradizionale dello stile",
    tabRecipe: "Ricetta",
    tabRecipeTailored: "Ricetta su misura",
    recipeCanonical: "Ricetta originale",
    recipeCanonicalEyebrow: "Originale",
    preCookTitle: "Prima di iniziare",
    preCookBody:
      "Stai consultando l’originale. Prima di prepararlo, controlla le condizioni oppure adattalo alla tua cucina.",
    preCookAdapt: "Adattala alla mia cucina",
    preCookStart: "Usa l’originale",
    matchTones: {
      t90: {
        title: UI_MESSAGES_IT["features.recipe.recipe-match-card.amore-a-prima-vista-d3108980"],
        canonical: UI_MESSAGES_IT["features.recipe.recipe-match-card.la-canonica-e-la-tua-cucina-parlano-gia-la-37bbb4fd"],
        adapted: UI_MESSAGES_IT["features.recipe.recipe-match-card.questa-versione-e-nata-per-il-tuo-setup-4ff2056a"],
      },
      t75: {
        title: UI_MESSAGES_IT["features.recipe.recipe-match-card.ottima-intesa-55470040"],
        canonical: UI_MESSAGES_IT["features.recipe.recipe-match-card.qualche-micro-compromesso-ma-la-scintilla--62f59a12"],
        adapted: UI_MESSAGES_IT["features.recipe.recipe-match-card.pochi-aggiustamenti-tanta-sostanza-528675f6"],
      },
      t60: {
        title: UI_MESSAGES_IT["features.recipe.recipe-match-card.ci-vuole-un-po-di-corteggiamento-f93dd2af"],
        canonical: UI_MESSAGES_IT["features.recipe.recipe-match-card.si-puo-fare-bene-sblocchiamola-e-vulcan-si-1ee8bb69"],
        adapted: UI_MESSAGES_IT["features.recipe.recipe-match-card.la-ricetta-funziona-ma-chiede-un-minimo-di-7c183f59"],
      },
      t40: {
        title: UI_MESSAGES_IT["features.recipe.recipe-match-card.per-le-cose-buone-ci-vuole-tempo-e6addc9c"],
        canonical: UI_MESSAGES_IT["features.recipe.recipe-match-card.la-ricetta-e-seria-meglio-adattarla-al-tuo-551e300f"],
        adapted: UI_MESSAGES_IT["features.recipe.recipe-match-card.buona-direzione-ma-serve-ancora-qualche-co-fe018050"],
      },
      t0: {
        title: UI_MESSAGES_IT["features.recipe.recipe-match-card.cuore-spezzato-42157bb9"],
        canonical: UI_MESSAGES_IT["features.recipe.recipe-match-card.bellissima-ma-oggi-chiede-piu-fuoco-di-que-4d766f75"],
        adapted: UI_MESSAGES_IT["features.recipe.recipe-match-card.troppo-per-questo-setup-alleggeriamo-tempi-2fd2fadf"],
      },
    },
    ceilingUnviableOven:
      "Con questo forno la proposta arriva a {ceiling}/100. Valuta uno stile che richieda meno calore.",
    ceilingUnviable:
      "Con le condizioni attuali la proposta arriva a {ceiling}/100. Controlla i limiti o scegli un altro stile.",
    ceilingOvenWall:
      "Il forno limita la proposta a {ceiling}/100: la cottura si discosta dall’originale.",
    ceilingNeeds: "Per arrivare a {ceiling}/100 ti serve: {needs}.",
    ceilingNeedsAtCeiling: "Per questa versione serve: {needs}.",
    ceilingOptimize: "Con le modifiche proposte puoi arrivare a {ceiling}/100.",
    ceilingCanonicalOk: "Anche l’originale rispetta i requisiti della tua cucina.",
    ceilingCompromise:
      "La proposta arriva a {ceiling}/100 e richiede adattamenti rispetto all’originale.",
    needFlour: "una farina ~W{w}",
    makePossible: "Rendila possibile",
    adaptToKitchen: "Adatta alla mia cucina",
    optimizeForMe: "Adatta alla mia cucina",
    resetToOriginal: "Torna all'originale",
    saveVersion: "Salva questa versione",
    savedVersion: "Salvata nel ricettario",
    optimizedForSetup: "Adattata alla tua cucina",
    doneBody: "Hai completato tutti i passaggi della tua {style}. Buon appetito!",
    tabProcedure: "Procedimento",
    toppingTitle: "Condimento",
    fillingTitle: "Farcitura",
    chooseTopping: "Scegli condimento",
    learnMore: "Approfondisci",
    tailoredEyebrow: "La tua ricetta su misura",
    recipeEyebrow: "Ricetta",
    start: "Inizia la pizzata",
    resume: "Riprendi la pizzata",
    startShort: "Inizia",
    inProgressShort: "In corso",
    followYou: "Tieni {brand} aperto per seguire i tempi e ricevere i promemoria.",
    reopen: "Riapri la pizzata in corso",
    completed: "Pizzata completata",
    waitOver: "Attesa finita: continua!",
    dueNow: "È ora: {title}",
    stepProgress: "{style} · passo {n}/{total}",
    interrupt: "Interrompi la pizzata",
    abortConfirm: "Sei sicuro di voler interrompere la pizzata attiva? Tutti i timer e l'avanzamento verranno persi.",
    abortConfirmTitle: "Interrompere la pizzata?",
    abortBody: "Perderai timer e avanzamento di questa {style}. La ricetta resta, ma la sessione riparte da zero.",
    abortYes: "Sì, interrompi",
    abortNo: "Continua la pizzata",
    minimize: "Riduci — la pizzata continua in background",
    minimizeHint: "Riduci: la pizzata continua e, con {brand} aperto, ti avvisiamo noi",
    inProgress: "Pizzata in corso",
    done: "Pizza in tavola!",
    finish: "Concludi la pizzata",
    finishedEarly: "Ho finito prima — salta l'attesa",
    phaseDone: "Tempo completato",
    dayToday: "oggi",
    dayTomorrow: "domani",
    approxPrefix: "ca. ",
    dayAfterTomorrow: "dopodomani",
    dayOffset: "+{n} giorni",
    etaNow: "ora",
    etaInMinutes: "tra {n} min",
    etaInHours: "tra {h} ore",
    etaInHoursMinutes: "tra {h}h {m}m",
    etaInDaysHours: "tra {d}g {h}h",
    compactSeconds: "{n}\"",
    compactMinutes: "{n}'",
    compactHours: "{h}h",
    compactHoursMinutes: "{h}h{m}",
    durationMinutes: "{n} min",
    durationHours: "{h} ore",
    durationHoursMinutes: "{h}h {m}min",
    durationDays: "{d} {unit}",
    durationDaysHours: "{d}g {h}h",
    durationDayUnit: "giorno",
    durationDaysUnit: "giorni",
    stepStartsIn: "inizia {eta}",
    phaseRemaining: "mancano {time}",
    passivePhaseMeta: "Fase passiva · {duration} · fine {time}",
    activePhaseMeta: "{duration} · fine {time}",
    yourTurn: "tocca a te",
    passiveCloseHint: "Gli avvisi funzionano finché {brand} resta aperto. Se lo chiudi, potrai riprendere dal punto in cui eri.",
    readyAt: "pronta {eta}",
    widgetStepReadyAt: "{title} · pronta {eta}",
    widgetStepDueIn: "{title} {eta}",
    waitingReadyAt: "In attesa · pronta {eta}",
    stepDoneBadge: "fatto",
    continueAction: "Continua",
    doneAction: "Fatto",
    nextStep: "Avanti",
    replaceBody: "Stai seguendo {current}. Iniziare {next} sostituisce quella sessione: timer e avanzamento andranno persi.",
    replaceStart: "Inizia {style}",
    replaceResume: "Riprendi {style}",
    notificationWaitDoneTitle: "Attesa finita: {title}!",
    notificationDueTitle: "È ora: {title}",
    notificationBody: "{style} — {description}",
    documentTitleDue: "{title} — {brand}",
    documentTitleCountdown: "{eta} · {title} — {brand}",
    prevStep: "Passo precedente",
    replaceTitle: "Hai già una pizzata in corso",
    confirmNewAria: "Conferma nuova pizzata",
    recipeAdapted: "Modificata per te",
    ovenSummary: "forno {temp}",
    ovenOptimal: "Temperatura forno ottimale",
    ovenLimited: "Fattibile (temperatura limite)",
    ovenNeedsAdaptation: "Richiede adattamento temperatura",
    procedureHeroDescription: "Procedimento guidato per {style}: {steps}, {duration} totali e {oven}.",
    toppingNotesTitle: "Accorgimenti condimento",
    toppingAmountsNote: "Le dosi sono per una pizza o unità. Gli ingredienti seguono l’ordine in cui aggiungerli.",
    toppingPerUnit: "{amount} per {unit}",
    durationLabel: "Durata: {duration}",
    comfortLabel: "{duration} comfort",
    totalDuration: "{duration} totali",
    finalDoughStageTitle: "Impasto finale",
    rule55Title: "Temperatura dell'acqua",
    rule55AriaOpen: "Come si calcola la temperatura dell'acqua",
    rule55AriaClose: "Nascondi la spiegazione",
    rule55Description: "Ambiente, farina e acqua devono sommare circa {sum}: tre volte la temperatura d'impasto che vuoi ({ddt}) meno il calore dell'impastatrice ({friction}). Per questo l'acqua cambia con la temperatura della tua cucina.",
    stepDetailsShow: "Come si fa",
    stepDetailsHide: "Nascondi dettagli",
    matchDetailsShow: "Dettagli punteggio",
    matchDetails: "Dettagli",
    matchDetailsHide: "Nascondi",
    unsavedTitle: "Modifiche non salvate",
    unsavedBody: "Se esci ora, la tua versione di {style} andrà persa. Vuoi salvarla nel ricettario?",
    unsavedDiscard: "Esci senza salvare",
    matchBreakdownLabel: "Media pesata",
    matchAxisWeight: "peso {pct}% nel punteggio",
    troubleStepLinks: {
      preferment: "Odora troppo di acido?",
      mix: "Impasto troppo appiccicoso?",
      bulk: "È andata lunga?",
      proof: "È andata lunga?",
      shape: "Si strappa quando stendi?",
      bake: "Cottura non riuscita?",
    },
    draftResumeEyebrow: "Ricetta in corso",
    draftResumeCta: "Riprendi",
    draftReplaceTitle: "Sostituire la ricetta in corso?",
    draftReplaceBody:
      "Hai già {current} pronta e regolata sui tuoi tempi. Scegliendo {next} la sostituisci e i suoi parametri vanno persi.",
    draftReplaceConfirm: "Passa a {next}",
    prefermentSaltNote:
      "In questa ricetta il sale si aggiunge all’impasto finale, non al preimpasto.",
    learnedFromAttempts: "Ho imparato dai tuoi {n} tentativi",
    applyCorrections: "Applica le correzioni",
    learnInlineTitle: "Approfondisci: {label}",
    tipsCountOne: "{n} consiglio",
    tipsCountMany: "{n} consigli",
    servingUnits: {
      panetto: { singular: "Panetto", plural: "Panetti" },
      teglia: { singular: "Teglia", plural: "Teglie" },
      pala: { singular: "Pala", plural: "Pale" },
      padellino: { singular: "Padellino", plural: "Padellini" },
      focaccia: { singular: "Focaccia", plural: "Focacce" },
    },
  },
  misc: {
    showAllStyles: "Mostra tutte",
    noFloursInCategory: "Nessuna farina in questa categoria",
    noTroubleshootingResults: "Nessun problema trovato per questa ricerca",
    moreInfo: "Più informazioni",
    changeTiming: "Cambia i tempi",
    kitchenTempSubtitle: "La temperatura influisce sulla velocità di lievitazione",
    techAdjustmentsApplied: "Adattamenti tecnici applicati",
    techDataAria: "Mostra dati tecnici (W, P/L, Q10, Aw)",
    techDataTitle: "Dati tecnici e calcoli dell’impasto",
    feedbackYes: "Sì, volentieri",
    feedbackNo: "No, a posto così",
    feedbackPlaceholder: "Cosa hai cambiato? Come è venuta? Dettagli utili...",
    preFermentCompare: "Confronto rapido",
    scoreExplainer: "Il punteggio combina i criteri della ricetta. Requisiti non rispettati e distanza dall’originale possono limitarlo.",
    companionContext: "La temperatura della cucina e il tempo a disposizione guidano tutto il processo.",
    companionSetup: "Adattiamo la ricetta alla tua esperienza, al forno e alla dispensa reale.",
    companionStyles: "Ogni stile ha parametri unici: scegli quello che meglio si adatta alle tue condizioni.",
    smartLinkOn: "Parametri collegati — muovi uno slider, gli altri si adattano",
    smartLinkOff: "Collega tutti i parametri per regolazione automatica",
    smartLinkApplied: "{param}: ho riallineato gli altri parametri e la timeline.",
    settingsHelp: "Questi dati aiutano {brand} ad adattare tempi e ricetta.",
    versionsLabel: "Versioni",
    versionsHint: "Ogni versione ha valori di riferimento propri. Le tacche dei controlli mostrano quelli della versione selezionata.",
    learnHeroTitle1: "Capisci l’impasto,",
    learnHeroTitle2: "migliora la tua pizza.",
    learnHeroSubtitle: "Tecniche, ingredienti e cottura: impara cosa osservare e come intervenire.",
    learnResources: "Risorse",
    kitchenTempLabel: "Temperatura cucina",
    kitchenTempDown: "Riduci temperatura cucina",
    kitchenTempUp: "Aumenta temperatura cucina",
    current: "Selezionato",
    noStyleInFamily: "Nessuno stile in questa famiglia per i tuoi parametri.",
    notFeasibleExplainer: "Queste ricette hanno un requisito non rispettato. Apri il dettaglio per capire cosa cambiare.",
    exploreHeroTitle1: "Esplora stili",
    exploreHeroTitle2: "e ricette.",
    exploreSectionTraditional: "Stili tradizionali",
    badgeBeginnerFriendly: "Principianti",
    interpretationsLabel: "Interpretazioni",
    goToSite: "Vai al sito",
    signatureLabel: "Ispirazione",
    noSignature: "nessuna ispirazione",
    fineParams: "Parametri avanzati",
    cmsRestoreContent: "Ripristina contenuti CMS",
    inspirationLabel: "Ispirazione",
    inspirationBase: "Tradizionale",
    inspirationSeeAll: "Vedi tutte",
    inspirationModalTitle: "Ispirazioni da pizzaioli e disciplinari",
    inspirationLearnLink: "Scopri di più nella sezione Impara",
    inspirationSelect: "Seleziona",
    inspirationSelected: "Selezionata",
  },
  feedback: {
    savedTitle: "Feedback salvato — grazie!",
    savedBody: "I tuoi dati aiutano a calibrare il motore. Puoi analizzarli in DevTools → Engine Lab.",
    nextTimeTitle: "La prossima volta",
    triedQuestion: "Hai provato questa ricetta?",
    triedSubtitle: "Il tuo feedback aiuta a calibrare il motore di {brand}.",
    success: "Riuscita",
    fail: "Non riuscita",
    detailedPrompt: "Grazie! Ti andrebbe di lasciare un feedback dettagliato?",
    detailedSubtitle: "Ci aiuterà a calibrare i punteggi di fattibilità e digeribilità per questo stile.",
    detailedTitle: "Feedback dettagliato",
    recipeSuccess: "Ricetta riuscita",
    recipeFail: "Ricetta non riuscita",
    ratingOverall: "Giudizio complessivo",
    ratingTaste: "Gusto",
    ratingTexture: "Consistenza / alveolatura",
    ratingDifficulty: "Difficoltà",
    ratingDifficultyHint: "1=facile, 5=impossibile",
    ratingAuth: "Quanto sembra autentica",
    ratingAuthHint: "calibra A-Score",
    ratingDig: "Quanto è stata digeribile",
    ratingDigHint: "calibra D-Score",
    issuesLabel: "Problemi riscontrati",
    notesLabel: "Note",
    submit: "Invia feedback",
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
    advancedLabel: "Altro",
    removeFilters: "Rimuovi filtri",
    brandedFlours: "Farine di marca",
    settingsOpen: "Impostazioni",
    settingsClosed: "Le tue impostazioni",
    hydrationLabel: "Idratazione",
    hydrationLow: "Bassa <60%",
    hydrationMedium: "Media 60-70%",
    hydrationHigh: "Alta 70-85%",
    hydrationExtreme: "Estrema >85%",
    textureLabel: "Texture",
    textureCrispyThin: "Sottile croccante",
    textureThickAiry: "Alta soffice",
    textureAiryCrumb: "Alveolata",
    textureDeepDish: "Deep dish",
    skillLabel: "Livello",
    skillBeginner: "Principiante",
    skillIntermediate: "Intermedio",
    skillAdvanced: "Avanzato",
    skillExpert: "Esperto",
    timeFast: "veloce",
    ovenLabel: "Cottura",
    ovenHome: "Forno casa",
    ovenWood: "Legna",
    ovenElectricHigh: "Elettrico >350°C",
    ovenPan: "Padella",
    stylesSearchPlaceholder: "Cerca uno stile…",
    stylesSearchNoResults: "Nessuno stile per \"{query}\"",
  },
  glossary: {
    pageTitle: "Glossario tecnico",
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
    catScoringDesc: "Come leggere i punteggi di {brand}",
  },
  engineMessages: {
    ...DIETARY_MESSAGES_IT,
    ...ALLERGEN_MESSAGES_IT,
    "change.topping": "Condimento: {from} → {to}",


    "card.ready": "Fattibile",
    "range.hydrationBasis": "Idratazione — riferimento di catalogo: {catalogMin}–{catalogMax}%; metodo selezionato: {methodMin}–{methodMax}%.",
    "learn.theoryTitle": "Prima la teoria",
    "learn.compatiblePath": "Un percorso pratico compatibile con la tua cucina: verifica le condizioni della ricetta.",
    "learn.theoryOnly": "Con questi vincoli manca una ricetta verificata: puoi approfondire la teoria.",
    "learn.openTheory": "Esplora la teoria",
    "timeline.preheat.includesProof": "Questo blocco comprende {minutes} minuti di appretto, già inclusi nel tempo totale: non aggiungerli di nuovo.",
    "timeline.preheat.includesRest": "Questo blocco comprende {minutes} minuti di riposo, già inclusi nel tempo totale: non aggiungerli di nuovo.",
    // Authenticity penalties
    "auth.hydrationOff": "Idratazione fuori centro (-{penalty}%)",
    "auth.wOutOfRange": "W farina fuori range (-{penalty}%)",
    "auth.plOutOfRange": "P/L {pl} fuori range {plMin}-{plMax} (-{penalty}%)",
    "auth.notWoodOven": "Forno non a legna (-15%)",
    "auth.tempVsIdeal": "Temperatura {temp} vs {ideal} (-{penalty}%)",
    "auth.tempBelowMin": "Temperatura sotto minimo (-{penalty}%)",
    "auth.fermentTooShort": "Fermentazione troppo breve (-{penalty}%)",
    "auth.fermentTooLong": "Fermentazione troppo lunga (-{penalty}%)",
    // Feasibility warnings
    "feas.wTooLow": "W troppo basso: {w} < {wMin}",
    "feas.hydrationNeedsPractice": "Idratazione alta richiede pratica",
    // Digestibility claims
    // Sustainability claims
    // Recommendation reasons/warnings
    "rec.timeCompatible": "Lievitazione {fMin}–{fMax}: compatibile con il tuo tempo",
    "rec.timeAdaptable": "Fermentazione adattabile a ~{hours}",
    "rec.timeInsufficient": "Richiede minimo {fMin}, hai {available}",
    "rec.needsWoodOven": "L’originale prevede il forno a legna; con il tuo forno la cottura cambia.",
    "rec.ovenAdapted": "Il tuo forno arriva a {temp}: temperatura ideale {ideal}, cottura adattata",
    "rec.needsDeck": "Per questa cottura serve pietra o acciaio preriscaldato: non risultano nella tua cucina",
    "timeline.homeTray.preheat": "Preriscalda il forno al massimo ({temp}) con una teglia capovolta già dentro, finché anche la teglia è ben calda. Intanto termina il riposo dell’impasto.",
    "gen.fermentationTooLong": "Lievitazione di {hours}: supera il massimo previsto da questa ricetta ({maxHours}). Scegli un metodo verificato per una durata maggiore.",
    "gen.fermentationTemperature": "Questo metodo prevede maturazione a {requiredTemp}; è stata impostata a {temp}. Ripristina il regime previsto o scegli un altro metodo verificato.",
    "need.pan": "Se ti procuri una teglia",
    "need.checkPan": "Se hai una teglia",
    "need.checkDeck": "Se hai pietra o acciaio",
    "need.ingredient": "Serve: {ingredient}",
    "need.checkFlour": "Se hai farina W{w}",
    "need.flour": "Serve farina W{w}",
    "need.checkBlend": "Se hai tutte le farine del mix",
    "need.checkYeast": "Se hai lievito: {yeast}",
    "need.yeast": "Serve lievito: {yeast}",
    "need.invertedTray": "Teglia capovolta",
    "need.withoutCoal": "Cottura senza carbone",
    "need.withoutWood": "Anche senza legna",
    "need.adaptedBake": "Cottura adattata",
    "need.deck": "Serve pietra o acciaio",
    "card.pantryCheck": "Verifica la dispensa",
    "card.directDough": "Impasto diretto",
    "card.resourceExcluded": "Requisito escluso",
    "card.panMissing": "Serve una teglia",
    "card.panCheck": "Se hai una teglia",
    "card.blendCheck": "Se hai le farine del mix",
    "card.ingredientsMissing": "Ingredienti da procurare",
    "card.yeastMissing": "Serve il lievito",
    "card.toVerify": "Da verificare",
    "card.authenticity": "Autenticità ridotta",
    "need.blockedOven": "Forno insufficiente",
    "need.blockedMethod": "Regime non compatibile",
    "need.blockedTime": "Tempi non compatibili",
    "change.salt": "Sale: {from}% → {to}%",
    "change.fat": "Grassi: {from}% → {to}%",
    "change.sugar": "Zuccheri: {from}% → {to}%",
    "change.hydration": "Idratazione: {from}% → {to}%",
    "change.flour": "Forza farina: W{from} → W{to}",
    "change.flourPL": "P/L farina: {from} → {to}",
    "change.fermentation": "Fermentazione: {fromHours} a {fromTemp} → {toHours} a {toTemp}",
    "change.prefermentOn": "Si aggiunge un pre-fermento",
    "change.prefermentOff": "Si passa all’impasto diretto",
    "change.prefermentDetails": "Pre-fermento: {fromType} {from}% → {toType} {to}%",
    "change.cooking": "Cottura: {fromTemp}, {fromSeconds} s → {toTemp}, {toSeconds} s",
    "rec.ovenAdequate": "Forno adeguato (compensazione automatica tempo/temperatura)",
    "rec.ovenTooCold": "Forno troppo freddo: {temp} < min {min}",
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
    "tip.waterTempCold": "Usa acqua fredda di frigo ({temp}): l'impastatrice scalda la massa.",
    "tip.waterTempNormal": "Acqua a {temp} per avere l'impasto a {ddt}.",
    "tip.frictionNote": "Compensazione attrito impastatrice: {friction}",
    "gen.windowTooShort": "Con {available} non c'è tempo per tutto: questa ricetta richiede circa {needed}. Sarà pronta più tardi dell'orario scelto: scegli un orario più avanti o una lievitazione più breve.",
    "opt.hydrationOvenCompensated": "Idratazione {h}%: {base}% più {delta}% per compensare il forno più freddo dell'ideale.",
    "opt.hydrationOutOfStyleRange": "Con la compensazione l'idratazione esce dal range dello stile ({min}–{max}%).",
    "auth.fermentOffCenter": "Fermentazione lontana dal canone (-{penalty}%)",
    "auth.thermalUnviable": "Temperatura inferiore al riferimento dello stile ({oven} < {min}): fedeltà al metodo di cottura ridotta (×{factor})",
    "feas.thermalUnviable": "A {oven} il metodo disponibile non riproduce la cottura di {style}. Il metodo attuale richiede almeno {min}; serve un adattamento verificato.",
    "gen.timeBelowStyleWindow": "Con {available} non rientri nella finestra di questo stile (minimo {fMin}): fermentazione accorciata. Per l'autenticità piena servono almeno {fMin}.",
    "gen.timeBelowStyleWindowMeal": "Con {available} fino al pasto, tolte le lavorazioni e la cottura ({work}), restano {ferment} di lievitazione: meno del minimo dello stile ({fMin}). Per lo stile pieno servono circa {needed} in tutto.",
    "opt.coldLongFerment": "Maturazione prevista: {hours} in frigo ({temp}), entro la finestra di {available}.",
    "opt.roomFerment": "Fermentazione di {hours} a temperatura ambiente ({temp}): coerente con lo stile e senza frigo.",
    "opt.hydrationLowered": "Idratazione ridotta a {h}% per facilitare la lavorazione. Riferimento dello stile: {canonical}%.",
    "opt.hydrationForStyle": "Idratazione {h}% nel cuore dello stile.",
    "opt.prefermentAdded": "Pre-fermento ({type}) aggiunto: più struttura, alveolatura e aroma.",
    "opt.preferment": "Pre-fermento ({type}): più struttura, alveolatura e aroma.",
    "opt.flourChanged": "Farina W{w}; riferimento dello stile: W{canonical}.",
    "opt.ovenAdapted": "Cottura adattata al tuo forno ({temp}) con compensazioni automatiche.",
    "opt.pantryFlour": "Forza farina W{w} compatibile con la tua dispensa.",
    "tip.waterTempLimitMax": "Cucina fredda: anche con acqua a {temp} l'impasto resta sotto {ddt}. Non scaldare di più l'acqua: tieni la farina in un posto tiepido o allunga un po' la puntata.",
    "tip.waterTempLimitMin": "Cucina calda: anche con acqua a {temp} l'impasto supera {ddt}. Usa acqua ghiacciata, tieni la farina in frigo o accorcia un po' la puntata.",
    "timeline.preheat.descWholeProof": "Accendi ora il forno a {temp}{equipmentNote}. Intanto i panetti fanno l'appretto.",
    "timeline.preheat.descPan": "Accendi ora il forno a {temp}{equipmentNote}. Intanto l'impasto finisce l'appretto in teglia.",
    "timeline.preheat.descPanWholeProof": "Accendi ora il forno a {temp}{equipmentNote}. Intanto l'impasto fa l'appretto in teglia.",
    "timeline.preheat.descDuringRest": "Accendi ora il forno a {temp}{equipmentNote}. Intanto i panetti riposano.",
    "hint.flourWeak": "farina debole (00 classica)",
    "hint.flourMedium": "farina di media forza",
    "hint.flourStrong": "farina forte (per pizza)",
    "hint.flourVeryStrong": "farina molto forte (manitoba)",
    "hint.yeastDryPinch": "≈ una punta di cucchiaino",
    "hint.yeastDryQuarterTsp": "≈ ¼ di cucchiaino",
    "hint.yeastDryHalfTsp": "≈ ½ cucchiaino",
    "hint.yeastDryOneTsp": "≈ 1 cucchiaino raso",
    "hint.yeastDryOneHalfTsp": "≈ 1 cucchiaino e ½",
    "hint.yeastFreshPinch": "≈ un pizzico",
    "hint.yeastFreshWeighable": "≈ {g} g sulla bilancia da cucina",
    "serving.peopleOne": "≈ {n} persona",
    "serving.peopleMany": "≈ {n} persone",
    "serving.peopleRange": "≈ {min}-{max} persone",
    "topping.auth.canonical": "Da disciplinare",
    "topping.auth.natural": "Tradizionale",
    "topping.auth.common": "Alternativa",
    "topping.auth.experimental": "Da provare",
    "topping.auth.taboo": "Sconsigliato",
    "recipeSetup.dough": "Impasto",
    "recipeSetup.styleBase": "stile base",
    "recipeSetup.temp.fridge": "frigo",
    "recipeSetup.temp.cool": "fresco",
    "recipeSetup.temp.room": "ambiente",
    "recipeSetup.versionApplied": "{label}: parametri impasto applicati",
    "version.label.Leggerissima": "Leggerissima",
    "version.label.Casalingo": "Casalingo",
    "version.label.Casalinga": "Casalinga",
    "version.label.Classica": "Classica",
    "version.label.Tradizionale": "Tradizionale",
    "version.label.Disciplinare AVPN": "Disciplinare AVPN",
    "version.label.Moderna": "Moderna",
    "version.label.Pro": "Pro",
    "version.label.Bilanciata": "Bilanciata",
    "timelineComfort.title": "Timeline comoda",
    "timelineComfort.active": "Attiva: evita le fasi notturne.",
    "timelineComfort.activePartial": "Attiva, ma alcune fasi restano di notte: scegli un altro pasto qui sopra.",
    "timelineComfort.nightDetected": "Fasi attive di notte rilevate.",
    "timelineComfort.idle": "Ottimizza gli orari se serve.",
    "timeline.preheat.title": "Preriscalda il forno",
    "timeline.preheat.desc": "Accendi ora il forno a {temp}{equipmentNote}. Intanto i panetti finiscono l'appretto.",
    "timeline.preheat.equipmentNote": " (pietra o acciaio già dentro)",
    "timeline.preheat.tipBeginner": "Il forno deve essere caldissimo. Preriscalda almeno 30 minuti prima.",
    "timeline.preheat.tipNerd": "La massa termica della superficie domina il primo minuto di cottura: {minutes} min di soak assicurano che pietra/acciaio siano saturi, non solo l'aria del forno.",
    "timeline.heatOil.title": "Olio a temperatura",
    "timeline.heatOil.desc": "Scalda l'olio (almeno 5 cm, in una pentola dai bordi alti) a {temp} e controllalo con un termometro. Intanto i panetti finiscono l'appretto.",
    "timeline.heatOil.tipBeginner": "Sotto i 170 °C la pizza assorbe olio e diventa unta; sopra i 190 °C si colora fuori e resta cruda dentro.",
    "timeline.heatOil.tipNerd": "Tra 180 e 190 °C l'acqua in superficie evapora subito e forma una crosta che limita l'assorbimento d'olio; un panetto alla volta evita che la temperatura crolli.",
    "timeline.fry.title": "Frittura",
    "timeline.fry.desc": "Friggi una pizza alla volta a {temp} per {time}, girandola a metà con una schiumarola. Scolala su carta assorbente.",
    "timeline.fry.tipBeginner": "Fai scivolare la pizza nell'olio allontanandola da te e bagnala in superficie con un cucchiaio d'olio caldo: si gonfia in modo uniforme.",
    "timeline.fry.tipNerd": "Il vapore interno gonfia il disco nei primi secondi; girarla a metà uniforma la crosta e la cottura del ripieno.",
    "timeline.mix.title": "Impasto",
    ...METHOD_MESSAGES_IT,
    "timeline.divide.title": "Staglio",
    "timeline.stack.title": "Sovrapposizione",
    "timeline.fillClosed.title": "Ripieno e chiusura",
    "timeline.fillSheets.title": "Farcitura tra sfoglie",
    "timeline.bakeWhite.title": "Cottura in bianco",
    "timeline.splitFill.title": "Sdoppiamento e farcitura",
    "timeline.bake2.title": "Seconda cottura (breve)",
    "timeline.bake.title": "Cottura",
    "timeline.bake.desc": "Cuocere a {temp}.",
    "timeline.bake.rounds": "{n} cotture da {sec}, una alla volta.",
    "timeline.topPost.title": "Farcitura post-cottura",
    "recipeSetup.noSignature": "Nessuna ispirazione",
    "recipeSetup.currentParams": "parametri correnti",
    "recipeSetup.noSignatureAlreadyActive": "Nessuna ispirazione già attiva",
    "recipeSetup.signatureApplied": "{label}: ispirazione applicata",
    "recipeSetup.signatureRemoved": "Ispirazione rimossa: parametri ripristinati",
    "dig.fodmapReduced": "Riduzione FODMAP non determinabile dalle sole ore",
    "dig.fodmapHighReduction": "Riduzione FODMAP non determinabile dalle sole ore",
    "hint.yeastPrecisionScale": "Usa una bilancia da 0,01 g",
    "timeline.batchModel": "Tempi stimati per una persona: stesura e condimento di tutte le unità, poi cotture una alla volta. Servizio scaglionato; nessuna sovrapposizione prevista.",
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
      longDesc: "Il poolish \u00E8 farina e acqua in parti uguali con il lievito, fatto maturare prima dell'impasto. Sciogli il lievito nell'acqua, aggiungi la farina e mescola con un cucchiaio: viene una pastella morbida. Copri e lascia maturare {hours} a {prefTemp}. \u00C8 pronto quando la superficie \u00E8 piena di bolle e al centro comincia appena ad abbassarsi; profuma leggermente acidulo.",
      longDescAlt: "La biga \u00E8 un preimpasto asciutto: farina e acqua al {prefHydration} circa, con il lievito. Sciogli il lievito nell'acqua, versala sulla farina e mescola pochi secondi, solo finch\u00E9 l'acqua \u00E8 assorbita: devono restare grumi irregolari, non un impasto liscio. Copri e lascia maturare {hours} a {prefTemp}. \u00C8 pronta quando \u00E8 cresciuta, profuma di frutta e dentro \u00E8 piena di filamenti.",
      tipBeginner: "Il pre-fermento \u00E8 come un \"antipasto\" per il lievito. Mescola e lascia riposare coperto.",
      tipNerd: "Il pre-fermento produce acidi organici (lattico/acetico) che abbassano il pH a ~4.5, migliorando la rete glutinica e la shelf life.",
    },
    mix: {
      title: "Impasto",
      desc: "Impastare fino a incordatura. Liscio e elastico.",
      descAlt: "Mescolare gli ingredienti senza impastare. Serie di pieghe.",
      longDesc: "Sciogli il lievito nell'acqua, poi versa progressivamente la farina mescolando. Quando la farina \u00E8 incorporata, aggiungi il sale e infine l'olio. Lavora l'impasto (a mano o in planetaria) fino a quando diventa liscio, elastico e si stacca dalle pareti del contenitore: serviranno 10-15 minuti a mano, 6-8 in planetaria. Test del velo: stira un pezzetto di impasto tra le dita \u2014 se diventa traslucido senza rompersi, \u00E8 pronto.",
      tipBeginner: "L'impasto \u00E8 pronto quando \u00E8 liscio e si stacca dalle mani. Se appiccica troppo, aspetta 5 min e riprova.",
      tipNerd: "L'incordatura avviene quando glutenina e gliadina formano ponti disolfuro stabili. Il test del velo verifica la maglia glutinica.",
    },
    mix_noknead: {
      title: "Impasto",
      desc: "Mescolare senza impastare fino a sciogliere i grumi. Poi 3 giri di pieghe (stretch & fold) a intervalli di ~30 min.",
      longDesc: "Niente impastatrice: usa solo una spatola o una mano. Versa l'acqua nel contenitore, aggiungi il lievito sciolto, poi la farina e infine il sale. Mescola in modo grossolano fino a quando non ci sono pi\u00F9 grumi di farina asciutta (sono sufficienti 2-3 minuti). L'impasto sar\u00E0 appiccicoso e irregolare \u2014 \u00E8 normale. Copri e lascia riposare: lo sviluppo del glutine avverr\u00E0 da solo con il tempo + le pieghe successive.",
      tipBeginner: "Non serve impastare! Mescola con una spatola finch\u00E9 non ci sono pi\u00F9 grumi di farina asciutta.",
      tipNerd: "L'autolisi sfrutta le proteinasi endogene della farina per sviluppare il glutine senza lavoro meccanico.",
    },
    bulk: {
      title: "Puntata",
      desc: "Lievitazione in massa a {temp}",
      longDesc: "L'impasto riposa in un'unica massa, dentro un contenitore unto d'olio e coperto a contatto con pellicola. \u00C8 in questa fase che il lievito lavora e sviluppa aroma, struttura e digeribilit\u00E0. Se idratazione alta, esegui 2-3 \"pieghe di rinforzo\" (stretch & fold) nelle prime 2 ore: solleva un lembo, tiralo in alto e ripiegalo verso il centro, ruota e ripeti per i 4 lati. La fermentazione \u00E8 completa quando il volume \u00E8 raddoppiato e la superficie \u00E8 bombata e liscia.",
      tipBeginner: "L'impasto deve raddoppiare di volume. Se fa caldo, controlla più spesso!",
      tipNerd: "A {temp} il modello stima una velocità di fermentazione di {factor}× rispetto a {refTemp}. Non è una misura della riduzione FODMAP o della digeribilità.",
    },
    bulk_cold: {
      title: "Puntata",
      desc: "Lievitazione in massa a {temp}",
      longDesc: "Trasferisci il contenitore con l'impasto in frigorifero ({fridgeTemp}). In frigo il lievito lavora molto pi\u00F9 lentamente: serve molto pi\u00F9 tempo, ma in cambio guadagni complessit\u00E0 di aroma, digeribilit\u00E0 e maglia glutinica pi\u00F9 sviluppata. Copri sempre con pellicola a contatto per evitare che la crosta si secchi. Quando lo tiri fuori, lascialo acclimatare 1-2 ore a temperatura ambiente prima dello staglio.",
      tipBeginner: "In frigo l'impasto cresce lento ma guadagna sapore. Copri bene con pellicola a contatto.",
      tipNerd: "A {temp} il modello stima una velocità di fermentazione di {factor}× rispetto a {refTemp}. Non è una misura della riduzione FODMAP o della digeribilità.",
    },
    // ENG-5: impasto non lievitato (Focaccia di Recco) — riposo, non lievitazione
    rest: {
      title: "Riposo",
      desc: "Lasciare riposare l'impasto coperto a {temp}",
      tipBeginner: "Senza lievito l'impasto non cresce: il riposo rilassa il glutine, così la sfoglia si stende sottile senza ritirarsi.",
      tipNerd: "Il riposo completa l'idratazione della farina e rilassa la maglia glutinica: meno ritorno elastico, sfoglia quasi trasparente.",
    },
    divide: {
      title: "Staglio",
      desc: "Dividere in panetti del peso corretto. Formare pallina.",
      longDesc: "Rovescia l'impasto su un piano leggermente infarinato. Con un tarocco taglia porzioni del peso che vedi sotto in Ingredienti, pesandole su una bilancia (\u00E8 importante per cottura uniforme). Per ogni pezzo, fai la \"pirlatura\": piega i lembi verso il basso al centro, ruota e arrotonda fino a una palla liscia e tesa. Disponi i panetti su una teglia infarinata, ben distanziati, copri con pellicola.",
      tipBeginner: "Usa una bilancia! Taglia con un tarocco e arrotonda ogni pezzo in una palla liscia.",
      tipNerd: "Lo staglio crea tensione superficiale che intrappola CO\u2082 durante l'appretto e definisce la struttura alveolare finale.",
    },
    divide_teglia: {
      title: "Staglio",
      desc: "Dividere con delicatezza, senza sgonfiare l'impasto.",
      longDesc: "Rovescia l'impasto sul piano ben infarinato (con le alte idratazioni aiutati con la semola). Con un tarocco taglia le porzioni del peso indicato sotto in Ingredienti, pesandole su una bilancia. Maneggia il meno possibile: per la teglia NON serve la pirlatura stretta della tonda \u2014 ripiega i lembi sotto formando un filone morbido, senza strizzare fuori l'aria. Le bolle costruite in puntata sono la futura alveolatura. Metti ogni pezzo in un contenitore unto e copri.",
      tipBeginner: "Mani delicate! Le bolle nell'impasto sono preziose: piega i lembi sotto, senza schiacciare.",
      tipNerd: "Con idratazione >75% lo staglio aggressivo collassa gli alveoli formati in puntata: tensione minima, degassamento quasi nullo.",
    },
    proof: {
      title: "Appretto",
      desc: "Lievitazione finale a {temp}",
      longDesc: "I panetti dopo lo staglio devono rilassarsi e gonfiarsi un'ultima volta. Tienili coperti a temperatura ambiente. Sar\u00E0 ora di stenderli quando: (1) sono raddoppiati di volume, (2) la superficie \u00E8 bombata e liscia, (3) il poke-test torna su lentamente (premi col dito: deve tornare in ~5 secondi). Se la pasta non torna su = sovrafermentata; se torna su subito = ancora indietro.",
      tipBeginner: "I panetti devono essere morbidi. Se li premi con un dito, tornano su lentamente.",
      tipNerd: "Poke test: ritorno lento = fermentazione ottimale. Troppo rapido = sotto-lievitato. Nessun ritorno = over-proofed.",
    },
    proof_pan: {
      title: "Appretto in teglia",
      desc: "Lievitazione finale in teglia a {temp}",
      longDesc: "L'impasto, gi\u00E0 steso nella teglia, deve gonfiarsi un'ultima volta. Copri la teglia e lasciala a temperatura ambiente. \u00C8 pronto quando \u00E8 cresciuto in modo evidente, la superficie \u00E8 bombata e piena di bolle e, premendo piano con un dito, il segno torna su lentamente. Se nel frattempo si \u00E8 ritirato dagli angoli, allargalo di nuovo con i polpastrelli.",
      tipBeginner: "L'impasto in teglia \u00E8 pronto quando \u00E8 gonfio e morbido: premuto col dito, torna su lentamente.",
      tipNerd: "La lievitazione in teglia fissa la forma: la struttura alveolare si forma nel contenitore di cottura, senza degassare l'impasto con una stesura successiva.",
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
      desc: "Cuocere a {temp}",
      longDesc: "Preriscalda il forno alla temperatura massima per 30-45 minuti (a forno freddo non funziona!). Se hai pietra/acciaio refrattario, scaldali bene. Inforna la pizza nel ripiano pi\u00F9 alto/centrale. NON aprire il forno nei primi 5 minuti \u2014 perdi la spinta termica. La pizza \u00E8 pronta quando bordo dorato/leopardato e fondo croccante.",
      tipBeginner: "Il forno deve essere caldissimo. Preriscalda almeno 30 minuti prima.",
      tipNerd: "La reazione di Maillard inizia a ~140\u00B0C e accelera esponenzialmente. A {temp} la caramellizzazione crea ~600 composti aromatici.",
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
    sheetMatchTitle: "Perché è adatta alla tua cucina",
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
    turnsSingle: "Ruota {n} {turn} per cottura uniforme.",
    turnsNone: "Non girare durante la cottura.",
    bakeAdaptedNerd: "Stima del motore per il tuo forno ({temp}): {minM}\u2013{maxM} min per cottura. Riferimento dello stile: {refMin}\u2013{refMax} s a {refTemp}.",
  },
  styleDescriptions: {
    ...Object.fromEntries(Object.entries(STYLES_DB).map(([id, style]) => [id, style.description])),
  },
  styleChars: {
    ...Object.fromEntries(Object.entries(STYLES_DB).map(([id, style]) => [id, style.key_characteristics.join("|")])),
    "teglia_romana": "Altezza 2-3cm|Idratazione secondo la versione|No-knead + pieghe|Mollica nuvola",
    "focaccia_barese": "Impasto senza patate|Pomodorini e olive baresane|Mollica umida e soffice|Crosta inferiore dorata nell’olio",
  },
  deviationLabels: {
    unclassified: "Da verificare",
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
    pageTitle: "Il tuo profilo",
    pageSubtitle: "Cucina, preferenze e ricette da rifare.",
    favoritesTitle: "I tuoi stili preferiti",
    favoritesSubtitle: "Gli stili a cui hai messo il cuore",
    favoriteRemove: "Rimuovi dai preferiti",
    favoriteRemoveAria: "Rimuovi {name} dai preferiti",
    savedRecipesTitle: "Le tue ricette salvate",
    savedRecipesSubtitle: "Le versioni che vuoi preparare di nuovo.",
    savedRecipesEmptyTitle: "Nessuna ricetta salvata",
    savedRecipesEmptyBody: "Conserva qui le versioni che vuoi rifare.",
    savedRecipesEmptyCta: "Crea una ricetta",
    savedRecipeRemove: "Rimuovi dal ricettario",
    savedRecipeRemoveAria: "Rimuovi {name} dal ricettario",
    savedRecipesLocalNote: "Le ricette sono salvate in questo browser. Esportale per conservarne una copia o spostarle su un altro dispositivo.",
    savedRecipesExport: "Esporta in un file",
    savedRecipesImport: "Importa da file",
    savedRecipeCopyLink: "Copia link",
    savedRecipeCopyLinkAria: "Copia il link di {name}",
    savedRecipeLinkCopied: "Link copiato",
    savedRecipeRemoved: "Ricetta rimossa",
    savedRecipeUndo: "Annulla",
    savedRecipesImported: "Ricette importate: {n}",
    savedRecipesImportDuplicates: "Già presenti: {n}",
    savedRecipesImportSkipped: "Non entrate, il ricettario è pieno: {n}",
    savedRecipesImportRejected: "Voci illeggibili ignorate: {n}",
    savedRecipesImportNothing: "Nessuna ricetta nuova nel file",
    savedRecipesImportErrorFormat: "Questo file non è un ricettario di {brand}.",
    savedRecipesImportErrorNewer: "Il file viene da una versione più nuova di {brand}: ricarica la pagina e riprova.",
    savedRecipesImportErrorStorage: "Lo spazio del browser è pieno: le ricette non sono state importate.",
    savedRecipesExportFileName: "ricette",
    ovenTitle: "Il tuo forno",
    ovenSubtitle: "Ci aiuta a scegliere gli stili e la cottura.",
    ovenStep: "01 — Forno",
    tempLabel: "Temperatura massima",
    tempAria: "Temperatura massima forno",
    skillTitle: "La tua esperienza",
    skillSubtitle: "Adattiamo la complessità delle ricette",
    skillStep: "02 — Livello",
    pantryTitle: "La tua dispensa",
    pantrySubtitle: "Farine e lieviti che hai a disposizione",
    pantryStep: "03 — Dispensa",
    dietTitle: "Preferenze dietetiche",
    dietSubtitle: "Indica cosa vuoi evitare nella ricetta.",
    dietStep: "04 — Dieta",
    noDietNote: "Nessuna preferenza dietetica selezionata.",
    prefsTitle: "Lingua e tema",
    prefsSubtitle: "Personalizza l'interfaccia",
    prefsStep: "06 — Preferenze",
    locationTitle: "La tua posizione",
    locationSubtitle: "Serve a stimare la temperatura della cucina.",
    locationStep: "05 — Posizione",
    locationPlaceholder: "Cerca città...",
    locationAuto: "Rileva posizione",
    locationAutoDetected: "Rilevata automaticamente",
    locationSaved: "Posizione salvata",
    locationNone: "Puoi indicarla più avanti o impostare direttamente la temperatura della cucina.",
    locationSearching: "Ricerca...",
    locationNoResults: "Nessun risultato",
    langLabel: "Lingua",
    themeLabel: "Tema",
    themeLight: "Chiaro",
    themeDark: "Scuro",
    themeAuto: "Automatico",
    unitTitle: "Misure",
    unitSubtitle: "Scegli come visualizzare temperature, pesi e liquidi",
    unitStep: "07 — Misure",
    unitSystemLabel: "Sistema di misura",
    unitMetric: "Metrico",
    unitMetricDesc: "Grammi, millilitri e gradi Celsius",
    unitImperial: "Imperiale / US",
    unitImperialDesc: "Once, fluid ounces e gradi Fahrenheit",
    resetProfile: "Riconfigura profilo",
    resetConfirmMessage: "Riaprirai la configurazione iniziale. Le nuove scelte sostituiranno le preferenze attuali.",
    devModeOn: "Modalità sviluppo attiva",
    devModeOff: "Attiva modalità sviluppo",
    ftuWelcome: "Benvenuto",
    ftuOvenTitle: "Che forno hai?",
    ftuOvenSubtitle: "Il forno definisce gli stili possibili",
    ftuSkillTitle: "Quanta esperienza hai?",
    ftuSkillSubtitle: "Decide quanto è facile l'impasto che ti proponiamo",
    ftuPantryTitle: "Cosa hai in dispensa?",
    ftuPantrySubtitle: "Farine e lieviti disponibili",
    ftuBack: "Indietro",
    ftuNext: "Avanti",
    ftuStart: "Vai a Crea",
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
    equipMixerTitle: "Come impasti",
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
    flourFarro: "Farro",
    flourKamut: "Kamut",
    flourSegale: "Segale",
    flourTipo1: "Tipo 1",
    flourTipo2: "Tipo 2",
    flourMacinataPietra: "Macinata a pietra",
    ftuDoneTitle: "Crea, scopri, impara.",
    ftuDoneCreateTitle: "Crea una ricetta",
    ftuDoneCreateDesc: "Scegli uno stile e adattalo alla tua cucina.",
    ftuDoneExploreTitle: "Esplora gli stili",
    ftuDoneExploreDesc: "Scopri tradizioni, ricette e interpretazioni d’autore.",
    ftuDoneLearnTitle: "Impara la teoria",
    ftuDoneLearnDesc: "Capisci le tecniche e trova risposte ai dubbi.",
    ftuDoneProfileNote: "Puoi completare o cambiare le tue preferenze dal Profilo, quando vuoi.",
    specialFloursOnboarding: "Farine speciali (farro, segale, integrali...)",
    locationRemove: "Rimuovi posizione",
    ftuSkipMessage: "Puoi anche saltare e configurare più tardi.",
  },
  pages: {
    navCreate: "Crea",
    navExplore: "Scopri",
    navLearn: "Impara",
    navProfile: "Profilo",
    navSearch: "Cerca",
    exploreStepNum: "15 stili — 4 famiglie",
    exploreTitle: "Esplora gli stili",
    exploreSubtitle: "Dalla Napoletana STG alla Focaccia di Recco.",
    learnTitle: "Impara",
    learnSubtitle: "Capisci l’impasto, scegli le tecniche e impara a riconoscere cosa succede.",
    learnGlossary: "Glossario",
    learnGlossaryDesc: "I termini dell’impasto, spiegati con esempi e riferimenti.",
    learnTroubleshooting: "Problemi e soluzioni",
    learnTroubleshootingDesc: "Riconosci il problema e trova cosa correggere.",
    learnPreFerments: "Biga, poolish e autolisi",
    learnPreFermentsDesc: "Cosa cambia e come inserirli nella preparazione.",
    recipeLabel: "Ricetta",
    recipeBackToStyles: "Stili",
    recipeStyleNotFound: "Stile non trovato",
    recipeStyleNotFoundDesc: "Non troviamo lo stile “{id}”. Puoi sceglierne un altro dal catalogo.",
    recipeExploreStyles: "Esplora stili",
    notFoundTitle: "Pagina non trovata",
    notFoundSubtitle: "Il link potrebbe essere cambiato. Riparti da Scopri.",
    notFoundBack: "Vai a Scopri",
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
    homeAria: "{brandFull} — Home",
    devToolsAria: "Developer Tools",
    mottoAria: "{brand} motto",
    troubleshootSearchPlaceholder: "Cerca sintomo o causa...",
    dietaryWarningsTitle: "Da sapere prima di prepararla",
    troubleshootingTitle: "Problemi con la ricetta?",
    troubleshootingDesc: "Trova cause e rimedi per impasto, forno e frittura",
    exploreRecipe: "Esplora la ricetta",
    exploreHeroDesc: "Stili della tradizione e interpretazioni d’autore. Scegli da dove cominciare.",
    exploreFilterFeatured: "In primo piano",
    exploreFilterStyles: "Stili di pizza",
    exploreFilterRecipes: "Ricette iconiche",
    learnFilterSubtitle: "Guide e spiegazioni sono ora riferite a questo stile.",
    learnRemoveFilter: "Rimuovi filtro stile",
    learnOpenGlossary: "Apri il glossario",
    learnPathLabel: "Percorso didattico",
    learnStartPath: "Inizia il percorso",
    learnTermOfTheDay: "Termine del giorno — {category}",
    learnPath1Title: "La tua prima teglia",
    learnPath1Copy: UI_MESSAGES_IT["pages.learn.path1.copy"],
    learnPath2Title: UI_MESSAGES_IT["pages.learn.path2.title"],
    learnPath2Copy: UI_MESSAGES_IT["pages.learn.path2.copy"],
    learnPath3Title: "La sfida del canotto",
    learnPath3Copy: UI_MESSAGES_IT["pages.learn.path3.copy"],
    learnPath4Title: UI_MESSAGES_IT["pages.learn.path4.title"],
    learnPath4Copy: UI_MESSAGES_IT["pages.learn.path4.copy"],
    preFermentsSubtitle: "Come usarli e quando inserirli nella preparazione.",
    preFermentsDescription: "Biga e poolish si preparano prima dell’impasto finale. La <strong>biga</strong> è un impasto asciutto, con il 44% d’acqua; il <strong>poolish</strong> ha farina e acqua in parti uguali. L’<strong>autolisi</strong> è invece un riposo di farina e acqua, senza lievito né sale: non è un pre-fermento.",
    preFermentsChoiceTitle: "Quale scegliere?",
    preFermentsBigaTitle: "Biga",
    preFermentsBigaWhen: "Quando vuoi un impasto aromatico e hai circa 16 h a 18–20 °C",
    preFermentsBigaBest: "Pinsa, Pizza al taglio, Pala romana",
    preFermentsPoolishTitle: "Poolish",
    preFermentsPoolishWhen: "Quando vuoi un impasto estensibile e hai 12–16 h a 20–22 °C",
    preFermentsPoolishBest: "Teglia Romana, NY Style, Focacce",
    preFermentsAutolisiTitle: "Autolisi",
    preFermentsAutolisiWhen: "Quando vuoi un impasto più facile da stendere",
    preFermentsAutolisiBest: "Tutti gli stili; si combina con biga e poolish",
    stylesModified: "modificati",
    stylesCustom: "custom",
    noChanges: "nessuna modifica",
    deactivateCustomStyles: "Disattiva stili custom",
    deactivate: "Disattiva",
    passToEasy: "Passa a Easy",
    activateNerd: "Attiva modalità Nerd",
  },
  configurator: {
    hydrationLabel: "Idratazione",
    hydrationTip: "Quanta acqua usi rispetto alla farina. Aumentarla cambia la consistenza e può rendere l’impasto più difficile da lavorare.",
    flourWLabel: "Forza Farina (W)",
    flourWLabelBlend: "Forza della farina di frumento",
    flourWTip: "La W indica la forza della farina. Aiuta a scegliere un prodotto adatto al metodo e ai tempi della ricetta.",
    plLabel: "Rapporto P/L",
    plTip: "Descrive l’equilibrio tra resistenza e capacità di allungarsi. Se non lo imposti, usiamo una stima: il dato della confezione è preferibile.",
    fermentLabel: "Lievitazione e maturazione",
    restLabel: "Riposo dell'impasto",
    restTip: "Questo impasto non lievita: il riposo serve a rilassare il glutine, così la sfoglia si tira sottile senza strapparsi.",
    fermentTip: "La lievitazione sviluppa i gas; la maturazione modifica la struttura dell’impasto. Tempo e temperatura influenzano entrambe, senza garantire la digeribilità personale.",
    tempFridge: "{fridgeTemp} frigo",
    tempCool: "{coolTemp}",
    tempAmbient: "{ambientTemp} amb.",
    preFermentLabel: "Pre-fermento",
    preFermentTip: "Biga e poolish sono impasti preparati in anticipo e poi uniti all’impasto finale. Possono cambiare aromi e struttura: segui tempi e dosi del procedimento.",
    ovenLabel: "Forno",
    ovenTip: "Imposta il forno e la temperatura di cottura. Il risultato dipende anche dallo stile e dalla superficie su cui cuoci.",
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
    thicknessTip: "Lo spessore cambia la quantità di impasto e la cottura. Parti dal riferimento dello stile e regola in base al risultato che cerchi.",
    thicknessThin: "Sottile e croccante",
    thicknessThick: "Alta e soffice",
    thicknessStandard: "Standard per questo stile",
    backLabel: "Indietro",
    sliderOptimal: "ottimale",
    hintHighHydrationNeedsW: "Con idratazione al {h}%, servono farine forti: W consigliato ≥ {w}",
    hintLowWLimitsHydration: "Con W {w}, idratazione massima consigliata ~{h}%",
    hintLongFermentUseFridge: "Con {hours}h di fermentazione, meglio in frigo ({fridgeTemp}) per controllare l'impasto",
    hintShortFermentUseWarm: "Con solo {hours}h, fermenta a temperatura ambiente ({ambientTemp}) per attivare i lieviti",
    hintMediumFermentUseCool: "Con {hours}h, temperatura fresca ({coolTemp}) \u00E8 il compromesso ideale tra controllo e attivit\u00E0",
    hintHighHydrationNeedsTime: "Con idratazione al {h}%, consigliata fermentazione ≥ {hours}h",
    hintLowPLForHighHydration: "Con idratazione alta, consigliato P/L ≤ {pl} per estensibilità",
    hintHighWAllowsMoreHydration: "Con W {w}, puoi arrivare fino al {h}% di idratazione",
    hintAdaptiveLabel: "suggerito",
    hintLimitMinLabel: "min consigliato",
    hintLimitMaxLabel: "max consigliato",
  },
  preFerment: PRE_FERMENT_DEFAULTS,
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
function setByPath(obj: any, path: string, value: any): any {
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
function deepDiffPaths(a: any, b: any, prefix = ""): string[] {
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
/* Revisione dei bundle lingua da cui è stato preso lo snapshot salvato
   (LOCALE_BUNDLE_REV). Chiave tecnica: il prefisso vulcan_ resta. */
const STORAGE_REV_KEY = "vulcan_cms_rev";

/** Detect best locale from browser language, with fallback to English (not Italian).
 * Returns null if Italian is detected (since Italian is the default). */
function detectBrowserLocale(): LocaleId | null {
  try {
    const langs = navigator.languages ?? [navigator.language];
    for (const lang of langs) {
      const code = lang.split("-")[0].toLowerCase();
      if (code === "it") return null; /* Italian = default, no override needed */
      if (isKnownLocale(code)) return code;
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

  /* Primo avvio: il rilevamento lingua avviene nel provider (il bundle è
     lazy e va caricato in modo asincrono — audit lug 2026). */
  return null;
}

function loadCmsRev(): number | null {
  try {
    const raw = localStorage.getItem(STORAGE_REV_KEY);
    return raw === null ? null : Number(raw);
  } catch {
    return null;
  }
}

/** `rev`: passarla quando si salva uno snapshot di bundle (o un import);
 *  le modifiche puntuali dei campi lasciano invariata quella esistente. */
function saveCms(overrides: Partial<CmsContent> | null, rev?: number) {
  try {
    if (overrides && Object.keys(overrides).length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(overrides));
      if (rev !== undefined) localStorage.setItem(STORAGE_REV_KEY, String(rev));
    } else {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(STORAGE_REV_KEY);
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

function fallbackBaseFor(overrides: Partial<CmsContent> | null): CmsContent {
  const localeId = overrides?.locale?.id;
  if (!localeId || localeId === "it") {
    return CMS_DEFAULTS;
  }

  /* Bundle lazy: finché non sono in cache si usa il default IT come base —
     le stringhe salvate negli overrides coprono comunque la UI; il provider
     ricalcola appena i bundle arrivano (localeTick). */
  const enBundle = getCachedLocaleBundle("en");
  let base = enBundle
    ? (deepMerge(CMS_DEFAULTS, enBundle) as CmsContent)
    : CMS_DEFAULTS;
  if (localeId !== "en") {
    const localeBundle = getCachedLocaleBundle(localeId);
    if (localeBundle) {
      base = deepMerge(base, localeBundle) as CmsContent;
    }
  }
  return base;
}

// ═══ CONTEXT ═══

interface CmsContextValue {
  /** Effective content (defaults + overrides merged, brand tokens resolved) */
  cms: CmsContent;
  /** Same content with the raw `{brand}` / `{brandFull}` tokens: CMS editor only */
  rawCms: CmsContent;
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
  cms: resolveBrandTokens(CMS_DEFAULTS),
  rawCms: CMS_DEFAULTS,
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
  /* Bump quando un bundle locale arriva dal lazy-load: fa ricalcolare la base. */
  const [localeTick, setLocaleTick] = useState(0);
  /* Primo avvio = nessuno stato salvato AL BOOT (non dopo un reset a IT). */
  const firstLaunchRef = useRef(overrides === null);

  /* Primo avvio: rileva la lingua del browser e carica il bundle on demand. */
  useEffect(() => {
    if (!firstLaunchRef.current) return;
    firstLaunchRef.current = false;
    const detected = detectBrowserLocale();
    if (!detected) return;
    let cancelled = false;
    void loadLocaleBundle(detected).then((bundle) => {
      if (cancelled || !bundle) return;
      setOverrides((prev) => {
        if (prev !== null) return prev; /* l'utente ha già fatto scelte */
        const initial = { ...bundle } as Partial<CmsContent>;
        saveCms(initial, LOCALE_BUNDLE_REV);
        return initial;
      });
    });
    return () => {
      cancelled = true;
    };
  }, []);

  /* Snapshot di una lingua non italiana salvato da una revisione precedente
     dei bundle (per esempio con il nome del prodotto scritto per esteso):
     si ricarica il bundle corrente, come fa switchLocale. Il primo paint
     usa ancora lo snapshot vecchio, quindi niente lampo dell'italiano. */
  useEffect(() => {
    const snapshotLocale = overrides?.locale?.id;
    if (!snapshotLocale || !isStaleLocaleSnapshot(overrides, loadCmsRev())) return;
    let cancelled = false;
    void loadLocaleBundle(snapshotLocale).then((bundle) => {
      if (cancelled || !bundle) return;
      setOverrides((prev) => {
        /* L'utente ha cambiato lingua nel frattempo: vince la sua scelta. */
        if (prev?.locale?.id !== snapshotLocale) return prev;
        const refreshed = { ...bundle } as Partial<CmsContent>;
        saveCms(refreshed, LOCALE_BUNDLE_REV);
        return refreshed;
      });
    });
    return () => {
      cancelled = true;
    };
    // Solo al boot: gli snapshot salvati dopo hanno già la revisione corrente.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* Lingua attiva non-IT: assicura in cache EN (fallback intermedio) e il
     bundle della lingua, poi fa ricalcolare la base. */
  const activeLocaleId = overrides?.locale?.id;
  useEffect(() => {
    if (!activeLocaleId || activeLocaleId === "it") return;
    let cancelled = false;
    void Promise.all([
      loadLocaleBundle("en"),
      loadLocaleBundle(activeLocaleId),
    ]).then(() => {
      if (!cancelled) setLocaleTick((value) => value + 1);
    });
    return () => {
      cancelled = true;
    };
  }, [activeLocaleId]);

  const fallbackBase = useMemo(
    () => fallbackBaseFor(overrides),
    // localeTick: la base dipende dalla cache dei bundle, non solo dagli overrides
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [overrides, localeTick],
  );

  const rawCms = useMemo(
    () => deepMerge(fallbackBase, overrides) as CmsContent,
    [fallbackBase, overrides],
  );

  /* Nome del prodotto risolto in un solo punto: ogni consumer legge il nome
     effettivo; l'editor /cms usa rawCms e mostra i token. */
  const cms = useMemo(() => resolveBrandTokens(rawCms), [rawCms]);

  /* Il catalogo strict condivide la stessa locale del CMS. I bundle lingua
     possono fornire `messages` in modo incrementale; le chiavi mancanti
     ricadono sul catalogo italiano. L'assegnazione precede il render dei
     figli, quindi anche i consumer context-free vedono subito la locale. */
  registerUiMessages(cms.locale.id, cms.messages);
  setActiveUiLocale(cms.locale.id);

  /* Modifiche = differenze dalla lingua attiva, non dall'italiano: prima ogni
     utente non italiano vedeva «CMS attivo — 1769 campi modificati» e
     «Ripristina» lo riportava all'italiano. Finché il bundle non è in cache
     la base non è affidabile e non si conta nulla. */
  const modifiedPaths = useMemo(() => {
    if (!overrides) return [];
    const localeId = overrides.locale?.id;
    if (localeId && localeId !== "it" && !getCachedLocaleBundle(localeId)) return [];
    return deepDiffPaths(fallbackBase, rawCms);
  }, [overrides, fallbackBase, rawCms]);

  const update = useCallback((path: string, value: any) => {
    setOverrides((prev) => {
      const merged = prev ? deepClone(prev) : {};
      let next: Partial<CmsContent>;

      const defaultVal = getByPath(CMS_DEFAULTS, path);
      if (JSON.stringify(value) === JSON.stringify(defaultVal)) {
        // Rimuove questo specifico percorso dagli override per non salvare duplicati
        const keys = path.split(".");
        let cur: any = merged;
        let found = true;
        for (let i = 0; i < keys.length - 1; i++) {
          if (cur[keys[i]] == null) {
            found = false;
            break;
          }
          cur = cur[keys[i]];
        }
        if (found && cur && typeof cur === "object") {
          delete cur[keys[keys.length - 1]];
        }
        next = cleanEmpty(merged) as Partial<CmsContent>;
      } else {
        next = setByPath(merged, path, value) as Partial<CmsContent>;
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
    /* Import esplicito: non va sostituito al prossimo avvio. */
    saveCms(data, LOCALE_BUNDLE_REV);
  }, []);

  const switchLocale = useCallback((localeId: LocaleId) => {
    if (localeId === "it") {
      // Italian is the default — clear all overrides
      setOverrides(null);
      saveCms(null);
      return;
    }
    // Bundle lazy: carica on demand, poi sostituisce interamente gli overrides.
    // Previous approach deepMerge(bundle, prev) caused old locale strings
    // to persist because prev (old language) won over bundle (new language).
    // User-specific numeric overrides (e.g. custom weights) are intentionally
    // reset on locale switch — they can be reconfigured after.
    void loadLocaleBundle(localeId).then((bundle) => {
      if (!bundle) return;
      const newOverrides = { ...bundle } as Partial<CmsContent>;
      setOverrides(newOverrides);
      saveCms(newOverrides, LOCALE_BUNDLE_REV);
    });
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

  useEffect(() => {
    document.documentElement.lang = bcp47;
    document.documentElement.dir = "ltr";
    document.documentElement.dataset.locale = cms.locale.id;
  }, [bcp47, cms.locale.id]);

  return (
    <Ctx.Provider
      value={{
        cms,
        rawCms,
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

type CmsFieldType = "text" | "textarea" | "number" | "url" | "slider" | "image";

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
      { path: "ui.doughBallsFrom", label: "Panetti (da {w})", type: "text" },
      { path: "ui.totalDough", label: "Totale impasto", type: "text" },
      { path: "ui.startTime", label: "Inizio (orario)", type: "text" },
      { path: "ui.endTime", label: "Fine (orario)", type: "text" },
      // Recipe output — clipboard/share text
      { path: "ui.clipboardBalls", label: "Panetti clipboard", type: "text", description: "Template: {n} panetti da {w}" },
      { path: "ui.clipboardTotal", label: "Totale clipboard", type: "text", description: "Template: Totale: {g}" },
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
      { path: "ui.nerdHoursAt18", label: "Nerd: Ore @{refTemp}", type: "text" },
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
      { path: "ovenPresets.electric_high.name", label: "Elettrico alta temperatura — Nome", type: "text" },
      { path: "ovenPresets.electric_high.maxTemp", label: "Elettrico alta temperatura — Max T", type: "number", min: 350, max: 550 },
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
      { path: "scoreDimensions.authenticity.explain", label: "Autenticita — Spiegazione", type: "textarea" },
      { path: "scoreDimensions.feasibility.label", label: "Fattibilita — Label", type: "text" },
      { path: "scoreDimensions.feasibility.weight", label: "Fattibilita — Peso", type: "slider", min: 0, max: 1, step: 0.05 },
      { path: "scoreDimensions.feasibility.explain", label: "Fattibilita — Spiegazione", type: "textarea" },
      { path: "scoreDimensions.digestibility.label", label: "Digeribilita — Label", type: "text" },
      { path: "scoreDimensions.digestibility.weight", label: "Digeribilita — Peso", type: "slider", min: 0, max: 1, step: 0.05 },
      { path: "scoreDimensions.digestibility.explain", label: "Digeribilita — Spiegazione", type: "textarea" },
      { path: "scoreDimensions.sustainability.label", label: "Sostenibilita — Label", type: "text" },
      { path: "scoreDimensions.sustainability.weight", label: "Sostenibilita — Peso", type: "slider", min: 0, max: 1, step: 0.05 },
      { path: "scoreDimensions.sustainability.explain", label: "Sostenibilita — Spiegazione", type: "textarea" },
      { path: "scoreDimensions.experimentation.label", label: "Sperimentazione — Label", type: "text" },
      { path: "scoreDimensions.experimentation.weight", label: "Sperimentazione — Peso", type: "slider", min: 0, max: 1, step: 0.05 },
      { path: "scoreDimensions.experimentation.explain", label: "Sperimentazione — Spiegazione", type: "textarea" },
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
      { path: "timelineLabels.bulk_cold.tipNerd", label: "Puntata fredda — Tip nerd", type: "textarea", description: "Template: {temp}, {factor}, {refTemp}" },
      { path: "timelineLabels.divide.title", label: "Divisione — Titolo", type: "text" },
      { path: "timelineLabels.divide.desc", label: "Divisione — Desc", type: "textarea" },
      { path: "timelineLabels.divide.tipBeginner", label: "Divisione — Tip beginner", type: "textarea" },
      { path: "timelineLabels.divide.tipNerd", label: "Divisione — Tip nerd", type: "textarea" },
      { path: "timelineLabels.proof.title", label: "Appretto — Titolo", type: "text" },
      { path: "timelineLabels.proof.desc", label: "Appretto — Desc", type: "textarea", description: "Template: {temp}" },
      { path: "timelineLabels.proof.tipBeginner", label: "Appretto — Tip beginner", type: "textarea" },
      { path: "timelineLabels.proof.tipNerd", label: "Appretto — Tip nerd", type: "textarea" },
      { path: "timelineLabels.rest.title", label: "Riposo (non lievitato) — Titolo", type: "text" },
      { path: "timelineLabels.rest.desc", label: "Riposo (non lievitato) — Desc", type: "textarea", description: "Template: {temp}" },
      { path: "timelineLabels.rest.tipBeginner", label: "Riposo (non lievitato) — Tip beginner", type: "textarea" },
      { path: "timelineLabels.rest.tipNerd", label: "Riposo (non lievitato) — Tip nerd", type: "textarea" },
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
      { path: "parametricTips.bakeAdaptedNerd", label: "Bake — Nerd, forno diverso dal riferimento", type: "textarea", description: "Template: {temp}, {minM}, {maxM}, {refMin}, {refMax}, {refTemp}" },
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
      { path: "engineMessages.rec.ovenAdapted", label: "Rec: Cottura adattata", type: "text", description: "{temp}, {ideal}" },
      { path: "engineMessages.rec.ovenIdeal", label: "Rec: Forno ideale", type: "text", description: "{ideal}" },
      { path: "engineMessages.rec.ovenAdequate", label: "Rec: Forno adeguato", type: "text" },
      { path: "engineMessages.rec.fried", label: "Rec: Fritta, niente forno", type: "text" },
      { path: "engineMessages.rec.flourMix", label: "Rec: Mix di farine", type: "text", description: "{weakPct}, {weak}, {strongPct}, {strong}, {w}" },
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
