import React, { createContext, useContext, useState, useCallback, useMemo, useEffect, useRef } from "react";
import {
  CMS_STORAGE_KEY,
  LOCALE_BCP47,
  LOCALE_BUNDLE_REV,
  detectBrowserLocale,
  getCachedLocaleBundle,
  getAnyCachedLocaleBundle,
  isStaleLocaleSnapshot,
  loadLocaleBundle,
  readSavedCms,
} from "./locales/index";
import { refreshPublishedMedia, usePublishedMediaRevision } from "../../components/media/published-media";
import type {
  GlossaryMessages,
  TroubleshootingMessages,
} from "../../i18n/domain-contracts";
import type { ToppingTranslation } from "../../data/topping-i18n/types";
import type { InspirationTranslation } from "../../data/inspiration-i18n/types";
import {
  registerUiMessages,
  setActiveUiLocale,
} from "../../i18n/ui-messages";
import { resolveBrandTokens } from "../../config/brand";

/* ═══ VULCAN CMS CONTEXT ═══
 * Centralized content management for all user-facing text, config, weights, and media.
 * Pattern: overrides on top of the active locale bundle (locales/<id>.ts, loaded
 * on demand — Italian included since budget D-059, 30/10/2026; main.tsx waits
 * for the boot locale before the first render).
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
  pantryExcludedSummary: string;
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
  restore: string;
  generate: string;
  customizeParams: string;
  /** Redesign lug 2026: azione "Personalizza" sulla match card (apre il
   *  dialog parametri; sostituisce la leva "Regola a mano"). Opzionale. */
  personalize: string;
  changeStyle: string;
  // Recipe output
  ingredients: string;
  procedure: string;
  doughBalls: string;
  timeline: string;
  doughBallsFrom: string;    // "da {w}" template, with {w} already formatted for the selected unit system
  totalDough: string;
  startTime: string;
  endTime: string;
  // Recipe output — clipboard/share text
  clipboardBalls: string;        // "{n} panetti da {w}", with {w} already formatted
  // Recipe output — ingredient names
  flour: string;
  flourMix: string;
  flourEffectiveGluten: string;
  water: string;
  salt: string;
  sugar: string;
  oilEvo: string;
  // Recipe output — compensations
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
  statFermentation: string;
  /** Tabella parametri (round 7): "Forza farina" + contesto lievitazione. */
  statFlourStrength: string;
  fermentEnvAmbient: string;
  fermentEnvFridge: string;
  statTempSuffix: string;        // "a {t}°C"
  statIdeal?: string;
  // Nerd row
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
  yeastModelBody: string;
  yeastDryNote: string;
  yeastTempModelNote: string;
  yeastEstimateNote: string;
  yeastPersonalLegend: string;
  yeastPersonalHint: string;
  /** B1 (D-068): dose del lievito presa dalla fonte della versione d'autore. */
  yeastSourceBody: string;
  yeastSourceNote: string;
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
  flourBudgetCapped: string;
  flourBudgetInvalid: string;
  flourBudgetSame: string;
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
  supplyMoreOptions: string;
  supplyPantryComplete: string;
  supplyEquipmentComplete: string;
  supplyPantryCompleteEffect: string;
  supplyEquipmentCompleteEffect: string;
  supplyFlourPurchase: string;
  supplyEquipmentPurchase: string;
  supplyUnspecified: string;
  supplyAllowed: string;
  supplyForbidden: string;
  supplyPurchaseEffect: string;
  recipeAdaptationsIncluded: string;
  recipeOptimizationChanges: string;
  recipeCurrentVersion: string;
  recipeOptimizedVersion: string;
  recipeScoreLabel: string;
  scoreBasisOriginal: string;
  scoreBasisTailored: string;
  scienceTitle: string;
  // Banners
  styleEditorActive: string;
  cmsActive: string;
  fieldsModified: string;
  fieldModified: string;
  /** Oven section — edit label when already configured */
  editOven: string;
  // Weather widget
  weatherOutdoor: string;       // "{t}°C fuori" template
  // Badges
  badgeIdeal: string;           // "Consigliato" — slot con fermentazione più vicina a ~24h (finestra ideale, non il più rapido)
  badgeRecent: string;          // "RECENTE"
  autoLabel: string;            // "Auto"
  // Oven compact bar
  cancel: string;
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
  subtitle: string;
  /** D-038 (ripristinata da FW-20): avviso di Crea che chiede solo il forno,
   *  finché non è scelto. `onboardingBody` riceve {oven} e {temp}. */
  onboardingEyebrow?: string;
  onboardingBody?: string;
  onboardingCta?: string;
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
  /** G5-WP-03: riga descrittiva generica (senza marchi) sotto il nome nell'onboarding. */
  hint?: string;
  maxTemp: number;
  icon: string;
}

interface CmsSkillLevel {
  name: string;
  description: string;
}

interface CmsFamily {
  name: string;
  /** Non mostrata dall'app (FW-14): facoltativa, assente dai default. */
  description?: string;
  emoji?: string;
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

/* FW-01 — Registro della scienza: testi delle note (src/app/data/science-notes.ts).
 * title = nome della nota; l1 = «In breve», una frase; l2 = «Perché», parole
 * semplici. Statuto, formula, fonti e incertezza sono dati, non testo. */
export interface CmsScienceNoteText {
  title: string;
  l1: string;
  l2: string;
}

export interface CmsScience {
  notes: Record<string, CmsScienceNoteText>;
  /** Testi delle ipotesi del modello (ScienceNote.assumptionIds). */
  assumptions: Record<string, string>;
  /** Formula della nota nella lingua (ScienceNote.formula è solo la versione
   *  in simboli, di riserva): parole e decimali cambiano, i simboli no. */
  formulas: Record<string, string>;
  /** Note descrittive delle fonti (SourceRef.noteKey): «pagine prodotto»,
   *  «letto solo l'abstract». Il titolo bibliografico non si traduce. */
  sourceNotes: Record<string, string>;
}

/** Pre-ferment guide — UI labels + per-item content */
export interface CmsPreFerment {
  sectionLabel: string;
  tipsLabel: string;
  showComparison: string;
  paramHydration: string;
  paramDuration: string;
  paramTemperature: string;
  paramYeast: string;
  detailFermentation: string;
  detailFlavor: string;
  detailCrust: string;
  detailExtensibility: string;
  detailIdealStyles: string;
  /** FW-05 (S14-A-05): occhiello dell'autolisi, che non è un prefermento. */
  techniqueLabel: string;
  /** FW-05 (S14-A-02): dose della ricetta accanto ai valori della guida. */
  recipeContextLine: string;
  /** G4b-WP-02 (S14-B-07): «Come si fa» e l'esempio su 1 kg di farina
   *  ({flour}, {hydration}, {name}, {water}, {yeast}: valori del motore). */
  stepsLabel: string;
  exampleLabel: string;
  examplePreFerment: string;
  exampleFinal: string;
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
    /** FW-05 (S14-A-01): solo per l'autolisi; per biga e poolish gli stili
     *  vengono dal motore (process_type). */
    idealStyles?: string;
    /** G4b-WP-02: 3-4 passi; ore e temperature come segnaposto del motore. */
    steps: string[];
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
  savedRecipeLinkCopyFailed: string;
  savedRecipeShare: string;
  savedRecipeShareAria: string;
  savedRecipeRename: string;
  savedRecipeRenameAria: string;
  savedRecipeRenameFailed: string;
  savedRecipesExported: string;
  favoriteRemoved: string;
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
  dietTitle: string;
  dietSubtitle: string;
  dietStep: string;
  noDietNote: string;
  prefsTitle: string;
  prefsSubtitle: string;
  langLabel: string;
  themeLabel: string;
  themeLight: string;
  themeDark: string;
  themeAuto: string;
  unitTitle: string;
  unitSubtitle: string;
  unitSystemLabel: string;
  unitMetric: string;
  unitMetricDesc: string;
  unitImperial: string;
  unitImperialDesc: string;
  resetProfile: string;
  resetConfirmMessage: string;
  resetConfirmTitle: string;
  resetConfirmAction: string;
  devModeOn: string;
  devModeOff: string;
  locationTitle: string;
  locationSubtitle: string;
  locationStep: string;
  locationPlaceholder: string;
  locationAuto: string;
  locationSaved: string;
  locationNone: string;
  locationNoResults: string;
  // FTU
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
  toolBannetons: string;
  toolBannetonsDesc: string;
  // Special flours
  flourFarro: string;
  flourKamut: string;
  flourSegale: string;
  flourTipo1: string;
  flourTipo2: string;
  // Onboarding Done screen
  ftuSummaryOven: string;
  ftuSummarySkill: string;
  ftuSummaryPantry: string;
  ftuSummaryEdit: string;
  /** {field}: nome della riga («Forno»). */
  ftuSummaryEditAria: string;
  ftuSummaryNotSet: string;
  ftuDoneProfileNote: string;
  specialFloursOnboarding: string;
  locationRemove: string;
  ftuSkipMessage: string;
  // FW-16 — effetto delle impostazioni
  skillEffectSummary: string;
  skillEffectRule: string;
  skillEffectHydration: string;
  skillEffectNoCeiling: string;
  skillEffectPreFerment: string;
  skillEffectNoPreFerment: string;
  skillEffectLine: string;
  dietCheckedTitle: string;
  dietReminderTitle: string;
  dietReminderWhy: string;
  dietGlutenAllergenHint: string;
  dietLactoseAllergenHint: string;
  dietAllergenAdd: string;
  pantryProfileEmpty: string;
  pantryProfileEdit: string;
  ftuSourdoughNote: string;
  /** FW-04 */
  ftuFlourTypeNote: string;
}

/** Page-level strings for nav, explore, learn, recipe, not-found, search */
interface CmsPages {
  // Navigation tab labels
  navCreate: string;
  navExplore: string;
  navLearn: string;
  navProfile: string;
  /** G1a-WP-03 (D-G1a-03): nome del pulsante Profilo nella shell. */
  navProfileKitchen: string;
  navSearch: string;
  // Explore page
  // Learn page
  learnGlossary: string;
  learnGlossaryDesc: string;
  learnTroubleshooting: string;
  learnTroubleshootingDesc: string;
  learnPreFerments: string;
  learnPreFermentsDesc: string;
  // Recipe page
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
  /** G1a-WP-02: gruppo «Forni» della ricerca. */
  searchCatOvens: string;
  searchCatGlossary: string;
  searchCatProblems: string;
  searchCatGuides: string;
  searchNoResults: string;
  searchHint: string;
  searchSuggestions: string;
  /** FW-09: «Cerca una ricetta» nelle pagine «non trovato». */
  notFoundSearch: string;
  /** FW-09: parole vuote della ricerca, separate da spazi. */
  searchStopwords: string;
  /** FW-09: sinonimi della ricerca, un gruppo per riga, espressioni separate da «;». */
  searchSynonyms: string;
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
  searchFieldLabel: string;
  searchClearLabel: string;
  devToolsAria: string;
  mottoAria: string;
  troubleshootSearchPlaceholder: string;
  // Home result section
  dietaryWarningsTitle: string;
  // Explore page extensions
  exploreRecipe: string;
  exploreHeroDesc: string;
  exploreFilterFeatured: string;
  exploreFilterStyles: string;
  exploreFilterRecipes: string;
  // Learn page extensions
  learnFilterSubtitle: string;
  learnRemoveFilter: string;
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
  preFermentsPoolishTitle: string;
  preFermentsPoolishWhen: string;
  preFermentsAutolisiTitle: string;
  preFermentsAutolisiWhen: string;
  preFermentsAutolisiBest: string;
  // Custom styles extensions
  stylesModified: string;
  stylesCustom: string;
  noChanges: string;
  deactivateCustomStyles: string;
  deactivate: string;
  /** FW-04 */
  learnOpenTerm: string;
}

/** Recipe configurator slider labels and tooltips */
interface CmsConfigurator {
  hydrationLabel: string;
  hydrationTip: string;
  flourWLabel: string;
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
  /** Adaptive cross-parameter hints */
  hintHighHydrationNeedsW: string;
  hintLowWLimitsHydration: string;
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
  /** FW-11: esonimi dei luoghi d'origine (Napoli → Naples); assente in
   *  italiano, che è la lingua dei dati. Chiave: nome italiano in styles-db. */
  placeNames?: Record<string, string>;
  /** FW-11 (S03-A-06): etichette dei parametri tecnici per id (sale, pieghe)
   *  e metodo di stesura per stile; in italiano la stesura viene dai dati. */
  parametricText?: {
    saltType?: Record<string, string>;
    saltTiming?: Record<string, string>;
    fold?: Record<string, string>;
    stretch?: Record<string, string>;
  };
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
    /** S05-A-07: titolo del pannello del tempo («Quando»). */
    when: { title: string };
    skill: CmsSectionHeader;
    oven: CmsSectionHeader;
    pantry: CmsSectionHeader;
    equipment: CmsSectionHeader;
  };
  timeSlots: Record<string, CmsTimeSlot>;
  ovenPresets: Record<string, CmsOvenPreset>;
  skillLevels: Record<string, CmsSkillLevel>;
  /** FW-16 — frase «cosa cambia» per ogni impostazione (SettingId). */
  settingEffects: Record<string, string>;
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
    heading: string;
  };
  /** Scheda ricetta + sessione "pizzata" (recipe-view, recipe-output,
   *  cooking-mode, active-cook-widget). Template con {placeholder} via t(). */
  cooking: {
    sectionsAria: string;
    toppingPrevAria: string;
    toppingNextAria: string;
    tabRecipe: string;
    tabRecipeTailored: string;
    /** Etichetta stato ricetta non personalizzata (pill contesto + occhiello). */
    recipeCanonical: string;
    /** Dialog pre-cottura: la ricetta canonica non è ancora adattata. */
    preCookTitle: string;
    preCookBody: string;
    /** G4a-WP-03: titolo della lista delle condizioni (le stesse della match card). */
    preCookConditionsTitle: string;
    /** {start}/{end}: orari con preposizione (format.atClock/aroundClock). */
    preCookTimes: string;
    /** {in}: tempo relativo (format.relativeIn). */
    preCookFirstStepIn: string;
    /** {requirement}: la causa principale del blocco (blockerText). */
    startBlockedReason: string;
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
    optimizeForMe: string;
    resetToOriginal: string;
    saveVersion: string;
    optimizedForSetup: string;
    /** Chiusura pizzata completata ({style} = nome dello stile). */
    doneBody: string;
    tabProcedure: string;
    toppingTitle: string;
    /** Etichetta sezione condimento per gli stili FARCITI (es. "Farcitura").
     *  Se assente, si usa toppingTitle. */
    fillingTitle: string;
    chooseTopping: string;
    learnMore: string;
    start: string;
    resume: string;
    startShort: string;
    inProgressShort: string;
    reopen: string;
    completed: string;
    /** "È ora: {title}" */
    dueNow: string;
    interrupt: string;
    abortConfirmTitle: string;
    /** "Perderai timer e avanzamento di questa {style}…" */
    abortBody: string;
    abortYes: string;
    abortNo: string;
    minimize: string;
    inProgress: string;
    done: string;
    finish: string;
    /** S10-A-15: «L'impasto è già pronto?» (anche titolo della conferma). */
    finishedEarly: string;
    /** S10-B-11: conferma prima di chiudere un'attesa in anticipo. */
    skipConfirmBody: string;
    skipConfirmYes: string;
    skipConfirmNo: string;
    /** Criterio di prontezza per fase (dai longDesc delle fasi). */
    readyCriterion: { bulk: string; bulkCold: string; proof: string; preferment: string; default: string };
    /** Toast dopo un completamento, con «Annulla». */
    stepDoneToast: string;
    undo: string;
    phaseDone: string;
    /** Giorno di oggi accanto a un orario («oggi»). */
    dayToday: string;
    dayTomorrow: string;
    /** Prefisso degli orari arrotondati («ca. 18:15»); spazio incluso se serve. */
    approxPrefix: string;
    dayAfterTomorrow: string;
    dayOffset: string;
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
    toppingNotesTitle: string;
    toppingAmountsNote: string;
    durationLabel: string;
    finalDoughStageTitle: string;
    /** FW-02: variante senza impastatrice (attrito zero). */
    rule55DescriptionHand: string;
    rule55Description: string;
    /** FW-17 (S08-A-07): Regola 55 a quattro termini, con un prefermento. */
    rule55DescriptionPreferment: string;
    stepDetailsShow: string;
    /** Redesign lug 2026: toggle compatto sotto il numero del Match
     *  ("Dettagli ⌄" / "Nascondi ⌃"). Opzionali. */
    matchDetails: string;
    matchDetailsHide: string;
    /** Redesign lug 2026: avviso all'uscita con modifiche non salvate
     *  (sostituisce la gestione bozze/parcheggio). {style} interpolato. */
    unsavedTitle: string;
    unsavedBody: string;
    unsavedDiscard: string;
    /** "È andata lunga?" (audit lug 2026) — domanda per-fase che porta
     *  all'issue di troubleshooting più probabile (STEP_TROUBLE). Chiavi:
     *  preferment/mix/bulk/proof/shape/bake. Opzionale. */
    troubleStepLinks?: Record<string, string>;
    /** Nota sotto lo scorporo biga/poolish (prima hardcoded in italiano). */
    prefermentSaltNote?: string;
    /** Pannello F2 "Vulcan ha imparato dai tuoi tentativi" (prima hardcoded). */
    learnedFromAttempts: string;
    applyCorrections: string;
    tipsCountOne: string;
    tipsCountMany: string;
    servingUnits: Record<string, { singular: string; plural: string }>;
  };
  /** Stringhe UI varie prima hard-coded nei componenti (VPL-082) */
  misc: {
    showAllStyles: string;
    noTroubleshootingResults: string;
    moreInfo: string;
    kitchenTempSubtitle: string;
    techAdjustmentsApplied: string;
    feedbackYes: string;
    feedbackNo: string;
    feedbackPlaceholder: string;
    preFermentCompare: string;
    scoreExplainer: string;
    settingsHelp: string;
    learnHeroTitle1: string;
    learnHeroTitle2: string;
    learnHeroSubtitle: string;
    learnResources: string;
    kitchenTempLabel: string;
    kitchenTempDown: string;
    kitchenTempUp: string;
    current: string;
    noStyleInFamily: string;
    exploreHeroTitle1: string;
    exploreHeroTitle2: string;
    signatureLabel: string;
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
    // FW-16
    starsLabel: string;
    cookedQuestion: string;
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
    /** Ricerca testuale nella lista stili del Crea (audit lug 2026).
     *  Opzionali: i locale non ancora tradotti cadono sul default. */
    stylesSearchPlaceholder: string;
    stylesSearchNoResults: string;
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
    termCount: string;
    /** FW-09 */
    termCountOne: string;
    emptyCategory: string;
    emptyInCategory: string;
    emptyReason: string;
    showAllCategories: string;
    cancelSearchLong: string;
    searchEverywhere: string;
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
    /** FW-04 */
    catTechnique: string;
    catTechniqueDesc: string;
    catFlour: string;
    catFlourDesc: string;
    rangesValueHeader: string;
    rangesMeaningHeader: string;
    technicalLabel: string;
    modelNoteLabel: string;
    seeAlsoLabel: string;
    inGlossaryLabel: string;
  };
  /** Engine message templates — keyed by EngineMsg.key, supports {param} interpolation */
  engineMessages: Record<string, string>;
  /** Science grid labels (PizzaNerd panel) */
  scienceLabels: {
    yeastBaker: string;
    effectiveHours: string;
    q10Factor: string;
    waterActivity: string;
    glutenNetwork: string;
    proteolysis: string;
    bakingEnergy: string;
    desiredDoughTemp: string;
    frictionFactor: string;
  };
  /** Timeline step labels, keyed by step id */
  timelineLabels: Record<string, CmsTimelineStep>;
  /** Misc timeline UI strings */
  /** Parametric tips — StyleDetailSheet labels + timeline contextual tips */
  parametricTips: {
    // StyleDetailSheet data pill labels
    pillHydration: string;
    pillFlour: string;
    pillPL: string;
    pillFermentation: string;
    pillRest: string;
    pillThickness: string;
    pillLevel: string;
    pillExperimentation: string;
    // StyleDetailSheet section labels
    sheetSectionTitle: string;
    sheetOvenLabel: string;
    sheetOvenPreheat: string;
    sheetBakeLabel: string;
    sheetBakeNoTurns: string;
    sheetDoughLabel: string;
    sheetSaltLabel: string;
    sheetFoldLabel: string;
    sheetFoldInterval: string;
    sheetGenerateBtn: string;
    sheetTechniquesLabel: string;
    sheetTechniqueFrom: string;
    sheetTechniqueGenerate: string;
    sheetTechniqueSource: string;
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
    // Dynamic fragments
    mixerPlanetaria: string;
    mixerHand: string;
    turnsNone: string;
    /** Cottura fuori dal regime di riferimento dello stile: stima del motore. */
    bakeAdaptedNerd: string;
    // FW-07: rotazione secondo il forno e righe della scheda stile.
    turnsHalfway: string;
    turnsFrequent: string;
    sheetYourBakeLabel: string;
    sheetOilLabel: string;
    sheetOilHeat: string;
    sheetFryTurn: string;
    /** FW-04 */
    pillDoughLoad: string;
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
  /** FW-01 — testi del registro della scienza (note e ipotesi). */
  science: CmsScience;
  /** G1a-WP-01 — nota editoriale di ogni farina di FLOURS_DB (scheda farina e ricerca). */
  flours: Record<string, { note: string }>;
  /** FW-06 — il punteggio spiegato (ScoreExplainer) e il ricettario. */
  scoreExplainer: CmsScoreExplainer;
}

/* ═══ FW-06 — Punteggio spiegabile ═══
 * Un solo racconto del numero «Compatibilità con la tua cucina» (D-041, D-E):
 * livello 1 una riga con il limite, livello 2 i criteri che contano con il
 * peso e la regola del minimo, poi le informazioni che non entrano nel numero.
 * Numeri e pesi arrivano dal motore (explainScore), mai scritti nel testo. */
export interface CmsScoreExplainer {
  /** «{score}/100»: il numero con il suo nome accessibile. */
  scoreAria: string;
  /** Una riga sotto il titolo: che cosa misura il numero. */
  meaning: string;
  limitedAuthenticity: string;
  limitedFuel: string;
  limitedFeasibility: string;
  /** D-062: a pari numero, l'ordine delle liste segue il margine della cucina. */
  tieBreak: string;
  countedTitle: string;
  weight: string;
  ruleTitle: string;
  ruleAverage: string;
  ruleAuthenticity: string;
  ruleFeasibility: string;
  ruleResult: string;
  ceilingEditorial: string;
  infoTitle: string;
  infoNote: string;
  referencePending: string;
  whyLabel: string;
  /** Coppia Riferimento · Su misura, e su misura più basso. */
  pairAria: string;
  tailoredLower: string;
  /** Ricettario: il numero è una fotografia del salvataggio. */
  snapshot: string;
  savedParams: string;
  savedBallsOne: string;
  savedBallsOther: string;
}

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

const STORAGE_KEY = CMS_STORAGE_KEY;
/* Revisione dei bundle lingua da cui è stato preso lo snapshot salvato
   (LOCALE_BUNDLE_REV). Chiave tecnica: il prefisso vulcan_ resta. */
const STORAGE_REV_KEY = "vulcan_cms_rev";

/** Stato iniziale del provider. Primo avvio (nulla di salvato): la lingua del
 *  browser, se non italiana, diventa lo snapshot come quando la si sceglie;
 *  main.tsx ne ha già caricato il bundle (bootLocaleId), quindi il primo
 *  paint è già nella lingua giusta, senza il lampo dell'italiano di prima. */
function initialCmsState(): { overrides: Partial<CmsContent> | null; firstLaunch: boolean } {
  const saved = readSavedCms();
  if (saved) return { overrides: saved, firstLaunch: false };
  const detected = detectBrowserLocale();
  const bundle = detected ? getCachedLocaleBundle(detected) : undefined;
  return { overrides: bundle ? ({ ...bundle } as Partial<CmsContent>) : null, firstLaunch: true };
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

/** La base di una lingua è il suo bundle e basta: ogni bundle ha tutte le
 *  foglie dell'italiano (locale-parity.test.ts). Budget D-059 (30/10/2026):
 *  prima era italiano ← inglese ← lingua, e de/es/fr/pt/ja scaricavano 89 kB
 *  di riserva inglese che non aggiungevano un testo. Se il bundle non è ancora
 *  in cache (un import del CMS in un'altra lingua) vale uno già caricato, c'è
 *  sempre quello di avvio, finché arriva (localeTick). */
function fallbackBaseFor(overrides: Partial<CmsContent> | null): CmsContent {
  const base = getCachedLocaleBundle(overrides?.locale?.id ?? "it") ?? getAnyCachedLocaleBundle();
  if (!base) throw new Error("CMS: nessun bundle lingua in cache (main.tsx carica quello di avvio prima del render)");
  return base;
}

// ═══ CONTEXT ═══

interface CmsContextValue {
  /** Effective content (defaults + overrides merged, brand tokens resolved) */
  cms: CmsContent;
  /** Same content with the raw `{brand}` / `{brandFull}` tokens: CMS editor only */
  rawCms: CmsContent;
  /** Bundle of the active locale, without overrides (CMS editor defaults) */
  defaults: CmsContent;
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

const Ctx = createContext<CmsContextValue | null>(null);

/* Fuori dal provider (test dei componenti, render isolati) si legge il bundle
   già in cache, senza modifiche: prima era CMS_DEFAULTS, sempre nel codice. */
let standalone: { bundle: CmsContent; value: CmsContextValue } | null = null;
function standaloneCms(): CmsContextValue {
  const bundle = getAnyCachedLocaleBundle();
  if (!bundle) throw new Error("useCms: nessun bundle lingua in cache fuori dal CmsProvider");
  if (standalone?.bundle !== bundle) {
    standalone = {
      bundle,
      value: {
        cms: resolveBrandTokens(bundle),
        rawCms: bundle,
        defaults: bundle,
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
        bcp47: LOCALE_BCP47[bundle.locale.id] || "it-IT",
      },
    };
  }
  return standalone.value;
}

export function useCms() {
  return useContext(Ctx) ?? standaloneCms();
}

export function CmsProvider({ children }: { children: React.ReactNode }) {
  const mediaRevision = usePublishedMediaRevision();
  useEffect(() => { void refreshPublishedMedia(); }, []);
  const [boot] = useState(initialCmsState);
  const [overrides, setOverrides] = useState<Partial<CmsContent> | null>(boot.overrides);
  /* Bump quando un bundle locale arriva dal lazy-load: fa ricalcolare la base. */
  const [localeTick, setLocaleTick] = useState(0);
  /* Primo avvio = nessuno stato salvato AL BOOT (non dopo un reset a IT). */
  const firstLaunchRef = useRef(boot.firstLaunch);

  /* Primo avvio: la lingua del browser, già caricata da main.tsx, si salva
     come snapshot; se il bundle non era in cache lo si carica on demand. */
  useEffect(() => {
    if (!firstLaunchRef.current) return;
    firstLaunchRef.current = false;
    if (boot.overrides) {
      saveCms(boot.overrides, LOCALE_BUNDLE_REV);
      return;
    }
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

  /* Lingua attiva: assicura in cache il suo bundle, poi fa ricalcolare la
     base. Di solito c'è già (avvio, switchLocale); serve dopo un import. */
  const activeLocaleId = overrides?.locale?.id ?? "it";
  useEffect(() => {
    if (getCachedLocaleBundle(activeLocaleId)) return;
    let cancelled = false;
    void loadLocaleBundle(activeLocaleId).then(() => {
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
    [fallbackBase, overrides, mediaRevision],
  );

  /* Nome del prodotto risolto in un solo punto: ogni consumer legge il nome
     effettivo; l'editor /cms usa rawCms e mostra i token. */
  const cms = useMemo(() => resolveBrandTokens(rawCms), [rawCms]);

  /* Il catalogo strict condivide la stessa locale del CMS. Ogni bundle porta
     il suo catalogo `messages` completo (ui-messages.catalogs.test.ts),
     l'italiano compreso. L'assegnazione precede il render dei figli, quindi
     anche i consumer context-free vedono subito la locale. */
  registerUiMessages(cms.locale.id, cms.messages);
  setActiveUiLocale(cms.locale.id);

  /* Modifiche = differenze dalla lingua attiva, non dall'italiano: prima ogni
     utente non italiano vedeva «CMS attivo — 1769 campi modificati» e
     «Ripristina» lo riportava all'italiano. Finché il bundle non è in cache
     la base non è affidabile e non si conta nulla. */
  const modifiedPaths = useMemo(() => {
    if (!overrides) return [];
    if (!getCachedLocaleBundle(overrides.locale?.id ?? "it")) return [];
    return deepDiffPaths(fallbackBase, rawCms);
  }, [overrides, fallbackBase, rawCms]);

  /* Default di un campo = il bundle della lingua attiva (prima l'italiano
     anche per le altre lingue). */
  const baseRef = useRef(fallbackBase);
  baseRef.current = fallbackBase;

  const update = useCallback((path: string, value: any) => {
    setOverrides((prev) => {
      const merged = prev ? deepClone(prev) : {};
      let next: Partial<CmsContent>;

      const defaultVal = getByPath(baseRef.current, path);
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

  /* Tornare all'italiano senza modifiche: il suo bundle prima, poi lo stato
     vuoto (chi usa un'altra lingua può non averlo ancora scaricato). */
  const clearToItalian = useCallback(() => {
    void loadLocaleBundle("it").then(() => {
      setOverrides(null);
      saveCms(null);
    });
  }, []);

  const resetAll = clearToItalian;

  const importOverrides = useCallback((data: Partial<CmsContent>) => {
    setOverrides(data);
    /* Import esplicito: non va sostituito al prossimo avvio. */
    saveCms(data, LOCALE_BUNDLE_REV);
  }, []);

  const switchLocale = useCallback((localeId: LocaleId) => {
    if (localeId === "it") {
      // Italian is the default — clear all overrides
      clearToItalian();
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
  }, [clearToItalian]);

  const exportJSON = useCallback(() => {
    return JSON.stringify(overrides || {}, null, 2);
  }, [overrides]);

  const isModified = useCallback(
    (path: string) => {
      if (!overrides) return false;
      const overrideVal = getByPath(overrides, path);
      if (overrideVal === undefined) return false;
      const defaultVal = getByPath(fallbackBase, path);
      return JSON.stringify(overrideVal) !== JSON.stringify(defaultVal);
    },
    [overrides, fallbackBase],
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
        defaults: fallbackBase,
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
      { path: "ui.restore", label: "Ripristina", type: "text" },
      { path: "ui.generate", label: "Genera ricetta", type: "text" },
      { path: "ui.customizeParams", label: "Personalizza parametri", type: "text" },
      { path: "ui.changeStyle", label: "Cambia stile", type: "text" },
      // Recipe output
      { path: "ui.ingredients", label: "Ingredienti (heading)", type: "text" },
      { path: "ui.procedure", label: "Procedimento (heading)", type: "text" },
      { path: "ui.doughBalls", label: "Panetti (label)", type: "text" },
      { path: "ui.doughBallsFrom", label: "Panetti (da {w})", type: "text" },
      { path: "ui.totalDough", label: "Totale impasto", type: "text" },
      { path: "ui.startTime", label: "Inizio (orario)", type: "text" },
      { path: "ui.endTime", label: "Fine (orario)", type: "text" },
      // Recipe output — clipboard/share text
      { path: "ui.clipboardBalls", label: "Panetti clipboard", type: "text", description: "Template: {n} panetti da {w}" },
      // Recipe output — ingredient names
      { path: "ui.flour", label: "Farina", type: "text" },
      { path: "ui.water", label: "Acqua", type: "text" },
      { path: "ui.salt", label: "Sale", type: "text" },
      { path: "ui.sugar", label: "Zucchero", type: "text" },
      { path: "ui.oilEvo", label: "Olio d'oliva", type: "text" },
      // Recipe output — compensations
      // Recipe output — aria labels
      { path: "ui.ariaReduceBalls", label: "Aria: Riduci panetti", type: "text" },
      { path: "ui.ariaAddBalls", label: "Aria: Aumenta panetti", type: "text" },
      // Stat strip
      { path: "ui.statHydration", label: "Stat: Idratazione", type: "text" },
      { path: "ui.statOven", label: "Stat: Forno", type: "text" },
      { path: "ui.statFermentation", label: "Stat: Lievitazione", type: "text" },
      { path: "ui.statTempSuffix", label: "Stat: Suffisso temperatura", type: "text", description: "Template: a {t}°C" },
      // Nerd row
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
      { path: "ui.scienceTitle", label: "Titolo scienza", type: "text" },
      // Banners
      { path: "ui.styleEditorActive", label: "Banner: Style Editor", type: "text" },
      { path: "ui.cmsActive", label: "Banner: CMS", type: "text" },
      { path: "ui.fieldsModified", label: "Banner: campi modificati", type: "text" },
      { path: "ui.fieldModified", label: "Banner: campo modificato", type: "text" },
      /** Oven section — edit label when already configured */
      { path: "ui.editOven", label: "Banner: Modifica forno", type: "text" },
      // Weather widget
      { path: "ui.weatherOutdoor", label: "Meteo esterno", type: "text", description: "Template: {t}°C fuori" },
      // Badges
      { path: "ui.badgeIdeal", label: "Badge: Ideale", type: "text" },
      { path: "ui.badgeRecent", label: "Badge: Recente", type: "text" },
      { path: "ui.autoLabel", label: "Label: Auto", type: "text" },
      // Oven compact bar
      { path: "ui.cancel", label: "Annulla", type: "text" },
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
      { path: "glossary.rangesLabel", label: "Valori tipici", type: "text" },
      { path: "glossary.whyImportantLabel", label: "Perch\u00E9 conta", type: "text" },
      { path: "glossary.relatedLabel", label: "Correlati", type: "text" },
      { path: "glossary.termCount", label: "Conteggio termini ({count})", type: "text" },
      { path: "glossary.termCountOne", label: "Conteggio, un termine ({count})", type: "text" },
      { path: "glossary.emptyReason", label: "Nessun risultato: motivo", type: "textarea" },
      { path: "glossary.emptyInCategory", label: "Nessun risultato nella categoria ({count} altrove)", type: "text" },
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
      { path: "hero.subtitle", label: "Sottotitolo", type: "textarea", description: "Paragrafo sotto il titolo hero" },
      /* FW-20 · D-038: avviso del forno in Crea. */
      { path: "hero.onboardingEyebrow", label: "Avviso forno — Titolo", type: "text" },
      { path: "hero.onboardingBody", label: "Avviso forno — Testo", type: "textarea", description: "Segnaposto {oven} e {temp}" },
      { path: "hero.onboardingCta", label: "Avviso forno — Scegli il forno", type: "text" },
      { path: "hero.onboardingDismiss", label: "Avviso forno — Va bene così", type: "text" },
      { path: "hero.onboardingProfileCta", label: "Avviso forno — Tutta la cucina", type: "text" },
      { path: "result.heading", label: "Titolo risultato", type: "text" },
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
      { path: "ovenPresets.home.hint", label: "Forno domestico — Descrizione", type: "text" },
      { path: "ovenPresets.electric_standard.hint", label: "Elettrico std — Descrizione", type: "text" },
      { path: "ovenPresets.gas.hint", label: "Gas — Descrizione", type: "text" },
      { path: "ovenPresets.electric_high.hint", label: "Elettrico alta temperatura — Descrizione", type: "text" },
      { path: "ovenPresets.gas_pizza.hint", label: "Gas da pizza — Descrizione", type: "text" },
      { path: "ovenPresets.wood.hint", label: "Legna — Descrizione", type: "text" },
      { path: "ovenPresets.coal.hint", label: "Carbone — Descrizione", type: "text" },
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
    description: "Nomi delle 6 famiglie pizza e delle 3 fasce di compatibilita",
    fields: [
      { path: "families.napoletana.name", label: "Napoletana — Nome", type: "text" },
      { path: "families.romana.name", label: "Romana — Nome", type: "text" },
      { path: "families.americana.name", label: "Americana — Nome", type: "text" },
      { path: "families.contemporanea.name", label: "Contemporanea — Nome", type: "text" },
      { path: "families.regionale.name", label: "Tradizioni regionali — Nome", type: "text" },
      { path: "families.casa.name", label: "Di casa — Nome", type: "text" },
      // Tiers
      { path: "tiers.perfect.label", label: "Tier Perfetto — Label", type: "text" },
      { path: "tiers.perfect.subtitle", label: "Tier Perfetto — Sub", type: "text" },
      { path: "tiers.good.label", label: "Tier Buono — Label", type: "text" },
      { path: "tiers.good.subtitle", label: "Tier Buono — Sub", type: "text" },
      { path: "tiers.fried.label", label: "Sezione Fritte — Label", type: "text" },
      { path: "tiers.fried.subtitle", label: "Sezione Fritte — Sub", type: "text" },
    ],
  },
  {
    id: "timeline",
    label: "Timeline & Procedura",
    icon: "list-ordered",
    description: "Testi degli step della timeline procedurale (titolo, descrizione, tip beginner/nerd)",
    fields: [
      { path: "timelineLabels.preferment.title", label: "Prefermento — Titolo", type: "text" },
      { path: "timelineLabels.preferment.desc", label: "Prefermento — Desc", type: "textarea", description: "Template: {type} = biga/poolish" },
      { path: "timelineLabels.preferment.tipBeginner", label: "Prefermento — Tip beginner", type: "textarea" },
      { path: "timelineLabels.preferment.tipNerd", label: "Prefermento — Tip nerd", type: "textarea" },
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
      // Sheet labels
      { path: "parametricTips.sheetSectionTitle", label: "Sheet: Titolo sezione", type: "text" },
      { path: "parametricTips.sheetOvenLabel", label: "Sheet: Forno", type: "text" },
      { path: "parametricTips.sheetOvenPreheat", label: "Sheet: Preriscaldamento", type: "text", description: "Template: {min}" },
      { path: "parametricTips.sheetBakeLabel", label: "Sheet: Tempo cottura", type: "text" },
      { path: "parametricTips.sheetBakeNoTurns", label: "Sheet: Nessuna rotazione", type: "text" },
      { path: "parametricTips.sheetDoughLabel", label: "Sheet: Panetto", type: "text" },
      { path: "parametricTips.sheetSaltLabel", label: "Sheet: Sale", type: "text" },
      { path: "parametricTips.sheetFoldLabel", label: "Sheet: Pieghe", type: "text" },
      { path: "parametricTips.sheetFoldInterval", label: "Sheet: Intervallo pieghe", type: "text", description: "Template: {min}" },
      { path: "parametricTips.sheetGenerateBtn", label: "Sheet: Genera ricetta", type: "text" },
      { path: "parametricTips.sheetTechniquesLabel", label: "Sheet: Versioni d'autore", type: "text" },
      { path: "parametricTips.sheetTechniqueFrom", label: "Sheet: versione da altro stile ({style})", type: "text" },
      { path: "parametricTips.sheetTechniqueGenerate", label: "Sheet: Genera con questa versione", type: "text" },
      { path: "parametricTips.sheetTechniqueSource", label: "Sheet: Fonte della versione", type: "text" },
      // Timeline beginner
      { path: "parametricTips.mixBeginner", label: "Mix — Beginner", type: "textarea", description: "Template: {mixer}, {time}" },
      { path: "parametricTips.bulkBeginner", label: "Bulk — Beginner", type: "textarea", description: "Template: {count}, {type}, {interval}" },
      { path: "parametricTips.shapeBeginner", label: "Shape — Beginner", type: "textarea", description: "Template: {note}" },
      { path: "parametricTips.topBeginner", label: "Top — Beginner", type: "textarea", description: "Template: {order}, {note}" },
      { path: "parametricTips.bakeBeginner", label: "Bake — Beginner", type: "textarea", description: "Template: {minM}, {maxM}, {turnsNote}" },
      // Timeline nerd
      { path: "parametricTips.mixNerd", label: "Mix — Nerd", type: "textarea", description: "Template: {mixer}, {time}, {note}" },
      { path: "parametricTips.bulkNerd", label: "Bulk — Nerd", type: "textarea", description: "Template: {count}, {type}, {interval}, {note}" },
      { path: "parametricTips.shapeNerd", label: "Shape — Nerd", type: "textarea", description: "Template: {type}, {depth}, {timing}, {note}" },
      { path: "parametricTips.topNerd", label: "Top — Nerd", type: "textarea", description: "Template: {order}, {saucePos}, {cheeseType}, {cheesePos}, {note}" },
      // Dynamic fragments
      { path: "parametricTips.mixerPlanetaria", label: "Frammento: Planetaria", type: "text" },
      { path: "parametricTips.mixerHand", label: "Frammento: A mano", type: "text" },
      { path: "parametricTips.turnsNone", label: "Frammento: Non girare", type: "text" },
      { path: "parametricTips.bakeAdaptedNerd", label: "Bake — Nerd, forno diverso dal riferimento", type: "textarea", description: "Template: {temp}, {minM}, {maxM}, {refMin}, {refMax}, {refTemp}" },
      { path: "parametricTips.turnsHalfway", label: "Frammento: girala a metà (forno di casa)", type: "text" },
      { path: "parametricTips.turnsFrequent", label: "Frammento: ruotala spesso (alta temperatura)", type: "text" },
      { path: "parametricTips.sheetYourBakeLabel", label: "Sheet: La tua cottura", type: "text" },
      { path: "parametricTips.sheetOilLabel", label: "Sheet: Temperatura dell'olio (fritte)", type: "text" },
      { path: "parametricTips.sheetOilHeat", label: "Sheet: Olio a temperatura (fritte)", type: "text" },
      { path: "parametricTips.sheetFryTurn", label: "Sheet: Girala a metà frittura", type: "text" },
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
      { path: "authorNames.pepe_sensoriale", label: "Autore: Pepe — Nome metodo", type: "text" },
      { path: "authorNames.pepe_sensory_layering", label: "Autore: Pepe Layering — Nome metodo", type: "text" },
      { path: "authorNames.bianco_long_ferment", label: "Autore: Bianco — Nome metodo", type: "text" },
      { path: "authorNames.forkish_saturday", label: "Autore: Forkish — Nome metodo", type: "text" },
      // Author display names
      { path: "authorAuthors.bonci_no_knead", label: "Autore: Bonci — Nome persona", type: "text" },
      { path: "authorAuthors.pepe_sensoriale", label: "Autore: Pepe — Nome persona", type: "text" },
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
      { path: "engineMessages.auth.notWoodOven", label: "Auth: Non forno a legna, sotto il minimo", type: "text", description: "{min}" },
      { path: "engineMessages.auth.woodByMethod", label: "Auth: Legna prevista (informazione)", type: "text", description: "{min}" },
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
      { path: "engineMessages.feas.prefermentNeedsExperience", label: "Feas: Prefermento esperienza", type: "text" },
      // Digestibility
      { path: "engineMessages.dig.fermentTooShort", label: "Dig: Ferment breve amidi", type: "text" },
      { path: "engineMessages.dig.fermentShort", label: "Dig: Ferment breve digeribilità", type: "text" },
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
      { path: "engineMessages.rec.ovenIdeal", label: "Rec: Forno ideale", type: "text", description: "{ideal}" },
      { path: "engineMessages.rec.fried", label: "Rec: Fritta, niente forno", type: "text" },
      { path: "engineMessages.rec.flourMix", label: "Rec: Mix di farine", type: "text", description: "{weakPct}, {weak}, {strongPct}, {strong}, {w}" },
      { path: "engineMessages.rec.ovenTooCold", label: "Rec: Forno freddo", type: "text", description: "{temp}, {min}" },
      { path: "engineMessages.rec.skillMatch", label: "Rec: Livello OK", type: "text" },
      { path: "engineMessages.rec.flourMatch", label: "Rec: Farina compatibile", type: "text" },
    ],
  },
];
