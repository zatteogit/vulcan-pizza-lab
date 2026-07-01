import {
ChevronLeft,
Heart,
Sparkles
} from "lucide-react";
import {
motion,
useReducedMotion,
useScroll,
useTransform,
} from "motion/react";
import {
useCallback,
useEffect,
useMemo,
useRef,
useState,
} from "react";
import { Link } from "react-router";
import { FireGlow } from "../features/cooking/fire-glow";
import {
getDefaultDoughBalls,
generateTimeSlots,
NO_PREFERENCE_SLOT,
optimizeRecipe,
thermalViability,
FLOUR_W_RANGES,
YEAST_LABELS,
resolveEngineMsgs,
type PanConfig,
PizzaStyle,
STYLES_DB,
TimeSlot,
UserConstraints,
} from "../domain/pizza-engine";
import { RecipeConfigurator } from "../features/recipe/recipe-configurator";
import { RecipeMatchCard } from "../features/recipe/recipe-match-card";
import { deriveFeedbackCorrections, loadFeedback } from "../features/recipe/feedback-store";
import { RecipeSetupPanel } from "../features/recipe/recipe-setup-panel";
import { RecipeStatStrip } from "../features/recipe/recipe-stat-strip";
import { RecipeView } from "../features/recipe/recipe-view";
import { RecommendedStyles,STYLE_PHOTOS } from "../features/recipe/recommended-styles";
import { useDarkMode } from "../components/shared/root-layout";
import { type SettingsTab, UserNeeds } from "../features/recipe/user-needs";
import { VulcanHero } from "../components/shared/vulcan-hero";
/* VPL-068: ProgressPill/MobileProgressBar removed — wizard is 3-step flow */
import { useCms } from "../features/cms/cms-context";
import { t as tpl } from "../features/cms/i18n";
import { getDietaryWarnings } from "../data/dietary-data";
import {
  getInterpretationById,
  type Interpretation,
} from "../data/interpretation-library";
import { RecipePrimaryTab } from "../features/recipe/recipe-section-tabs";
import { StyleDetailSheet } from "../features/recipe/style-detail-sheet";
import {
  getVersions,
  type StyleVersion,
} from "../data/style-versions";
import { useStylesOverride } from "../context/styles-override-context";
import { ContextualWarnings } from "../features/recipe/troubleshooting-panel";
import { useProfileDefaults } from "../hooks/use-profile-defaults";
import {
  defaultRecipePL,
  type RecipeInitialState,
  type RecipeMode,
  useRecipeState,
} from "../hooks/use-recipe-state";
import { CtaButton, Heading, IconButton } from "../components/ds/index";

type AppStep = "settings" | "styles" | "result";
type StyleSettingsPanel = SettingsTab | "time";

const CREATE_DRAFT_KEY = "vulcan_create_draft";
const HOUR_MS = 60 * 60 * 1000;
const TIME_REVIEW_BEFORE_TARGET_MS = 3 * HOUR_MS;
const TIME_SLOT_TARGET_TOLERANCE_MS = 2 * HOUR_MS;

interface SelectedTimeMeta {
  selectedAt: number;
  hours: number;
  targetAt: number | null;
}

interface PersistedCreateDraft {
  version: 1;
  updatedAt: number;
  step: AppStep;
  selectedTimeSlot: string | null;
  selectedTimeAt: number | null;
  selectedTimeHours: number | null;
  selectedTimeTargetAt?: number | null;
  selectedStyleId: string | null;
  recipeGenerated: boolean;
  constraints: UserConstraints;
  recipe: {
    mode: RecipeMode;
    activeVersionId: string | null;
    activeInterpretationId: string | null;
    customHydration: number;
    customFlourW: number;
    customFlourPL: number;
    customFermentHours: number;
    customFermentTemp: number;
    usePreFerment: boolean;
    panConfig: PanConfig;
    selectedToppingConcept: string | null;
  } | null;
}

interface ResolvedCreateDraft {
  step: AppStep;
  selectedStyle: PizzaStyle | null;
  selectedTimeSlot: string | null;
  selectedTimeMeta: SelectedTimeMeta | null;
  styleSettingsPanel: StyleSettingsPanel | null;
  constraints: UserConstraints;
  recipeInitial: RecipeInitialState | null;
}

interface ResolvedTimeChoice {
  selectedTimeSlot: string | null;
  selectedTimeMeta: SelectedTimeMeta | null;
  stale: boolean;
  needsReview: boolean;
}

function removeCreateDraft() {
  try {
    localStorage.removeItem(CREATE_DRAFT_KEY);
  } catch {
    /* */
  }
}

function readCreateDraft(): PersistedCreateDraft | null {
  try {
    const raw = localStorage.getItem(CREATE_DRAFT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<PersistedCreateDraft>;
    if (parsed.version !== 1 || typeof parsed.updatedAt !== "number") {
      return null;
    }
    return parsed as PersistedCreateDraft;
  } catch {
    return null;
  }
}

function writeCreateDraft(draft: PersistedCreateDraft) {
  try {
    localStorage.setItem(CREATE_DRAFT_KEY, JSON.stringify(draft));
  } catch {
    /* */
  }
}

function getDraftTargetAt(draft: PersistedCreateDraft): number | null {
  if (
    !draft.selectedTimeSlot ||
    draft.selectedTimeSlot === "no_preference" ||
    typeof draft.selectedTimeHours !== "number"
  ) {
    return null;
  }
  if (typeof draft.selectedTimeTargetAt === "number") {
    return draft.selectedTimeTargetAt;
  }
  if (typeof draft.selectedTimeAt !== "number") return null;
  return draft.selectedTimeAt + draft.selectedTimeHours * HOUR_MS;
}

function getSlotTargetAt(now: number, slot: TimeSlot) {
  return now + slot.hours * HOUR_MS;
}

function resolveSavedTimeChoice(
  draft: PersistedCreateDraft,
  now: number,
): ResolvedTimeChoice {
  if (!draft.selectedTimeSlot) {
    return {
      selectedTimeSlot: null,
      selectedTimeMeta: null,
      stale: false,
      needsReview: false,
    };
  }

  if (draft.selectedTimeSlot === NO_PREFERENCE_SLOT.id) {
    return {
      selectedTimeSlot: NO_PREFERENCE_SLOT.id,
      selectedTimeMeta: {
        selectedAt: draft.selectedTimeAt ?? now,
        hours: draft.selectedTimeHours ?? NO_PREFERENCE_SLOT.hours,
        targetAt: null,
      },
      stale: false,
      needsReview: false,
    };
  }

  const targetAt = getDraftTargetAt(draft);
  if (!targetAt) {
    return {
      selectedTimeSlot: null,
      selectedTimeMeta: null,
      stale: true,
      needsReview: true,
    };
  }

  const matchingSlot = generateTimeSlots(new Date(now))
    .map((slot) => ({
      slot,
      distance: Math.abs(getSlotTargetAt(now, slot) - targetAt),
    }))
    .sort((a, b) => a.distance - b.distance)
    .find(({ distance }) => distance <= TIME_SLOT_TARGET_TOLERANCE_MS)?.slot;

  if (!matchingSlot) {
    return {
      selectedTimeSlot: null,
      selectedTimeMeta: null,
      stale: true,
      needsReview: true,
    };
  }

  return {
    selectedTimeSlot: matchingSlot.id,
    selectedTimeMeta: {
      selectedAt: now,
      hours: matchingSlot.hours,
      targetAt,
    },
    stale: false,
    needsReview: targetAt - now <= TIME_REVIEW_BEFORE_TARGET_MS,
  };
}

function resolveRecipeInitial(
  draft: PersistedCreateDraft,
  style: PizzaStyle | null,
): RecipeInitialState | null {
  if (!style || !draft.recipe) return null;
  const version = draft.recipe.activeVersionId
    ? getVersions(style.id).find((v) => v.id === draft.recipe?.activeVersionId) ??
      null
    : null;
  const interpretation = draft.recipe.activeInterpretationId
    ? getInterpretationById(draft.recipe.activeInterpretationId) ?? null
    : null;
  return {
    mode: draft.recipe.mode,
    version,
    interpretation,
    hydration: draft.recipe.customHydration,
    flourW: draft.recipe.customFlourW,
    flourPL: draft.recipe.customFlourPL,
    fermentHours: draft.recipe.customFermentHours,
    fermentTemp: draft.recipe.customFermentTemp,
    usePreFerment: draft.recipe.usePreFerment,
    panConfig: draft.recipe.panConfig,
    toppingConcept: draft.recipe.selectedToppingConcept,
  };
}

function resolveCreateDraft(
  profileConstraints: UserConstraints,
  styles: Record<string, PizzaStyle>,
): ResolvedCreateDraft {
  const fallback: ResolvedCreateDraft = {
    step: "settings",
    selectedStyle: null,
    selectedTimeSlot: null,
    selectedTimeMeta: null,
    styleSettingsPanel: null,
    constraints: profileConstraints,
    recipeInitial: null,
  };
  const draft = readCreateDraft();
  if (!draft) return fallback;

  const now = Date.now();
  const draftStyle = draft.selectedStyleId ? styles[draft.selectedStyleId] ?? null : null;
  const timeChoice = resolveSavedTimeChoice(draft, now);

  if (timeChoice.stale && !draftStyle) {
    removeCreateDraft();
    return fallback;
  }

  const selectedStyle = draftStyle;
  const selectedTimeSlot = timeChoice.selectedTimeSlot;
  const selectedTimeMeta = timeChoice.selectedTimeMeta;
  const restoredConstraints = {
    ...profileConstraints,
    ...(draft.constraints ?? {}),
  };
  if (selectedTimeMeta) {
    restoredConstraints.available_hours = selectedTimeMeta.hours;
  } else if (timeChoice.stale) {
    restoredConstraints.available_hours = profileConstraints.available_hours;
  }
  const recipeGenerated =
    draft.recipeGenerated && draftStyle !== null && !timeChoice.stale;
  const step: AppStep = recipeGenerated
    ? "result"
    : selectedStyle || selectedTimeSlot
      ? "styles"
      : "settings";

  return {
    step,
    selectedStyle,
    selectedTimeSlot,
    selectedTimeMeta,
    styleSettingsPanel:
      step === "styles" && (timeChoice.stale || timeChoice.needsReview)
        ? "time"
        : null,
    constraints: restoredConstraints,
    recipeInitial: timeChoice.stale
      ? null
      : resolveRecipeInitial(draft, selectedStyle),
  };
}

export function HomePage() {
  const { setHideNavbar } = useDarkMode();
  const { isOverrideActive, clearOverride, effectiveStyles } =
    useStylesOverride();
  const {
    cms,
    modifiedCount,
    resetAll: cmsResetAll,
  } = useCms();
  /* ═══ VPL-067: Profile data bridge — load constraints from profile ═══ */
  const profileDefaults = useProfileDefaults();
  const initialCreateDraftRef = useRef<ResolvedCreateDraft | null>(null);
  if (initialCreateDraftRef.current === null) {
    initialCreateDraftRef.current = resolveCreateDraft(
      profileDefaults.constraints,
      effectiveStyles,
    );
  }
  const initialCreateDraft = initialCreateDraftRef.current;
  const [currentStep, setCurrentStep] =
    useState<AppStep>(initialCreateDraft.step);
  const [selectedStyle, setSelectedStyle] =
    useState<PizzaStyle | null>(initialCreateDraft.selectedStyle);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<
    string | null
  >(initialCreateDraft.selectedTimeSlot);
  const [selectedTimeMeta, setSelectedTimeMeta] =
    useState<SelectedTimeMeta | null>(initialCreateDraft.selectedTimeMeta);
  const [styleSettingsPanel, setStyleSettingsPanel] =
    useState<StyleSettingsPanel | null>(
      initialCreateDraft.styleSettingsPanel,
    );
  const [setupPanelOpen, setSetupPanelOpen] = useState(false);
  const [setupNotice, setSetupNotice] = useState<string | null>(null);
  const [nerdMode, setNerdMode] = useState(false);

  /* ═══ VPL-023: Respect prefers-reduced-motion ═══ */
  const prefersReducedMotion = useReducedMotion();

  /* ═══ Generate recipe — clean crossfade, no overlay ═══ */
  const handleGenerateRecipe = useCallback(() => {
    setCreateRecipeMode("adapted");
    window.scrollTo({
      top: 0,
      behavior: "instant" as ScrollBehavior,
    });
    setCurrentStep("result");
  }, []);

  /* ═══ Back navigation ═══ */
  const handleBackToSettings = useCallback(() => {
    removeCreateDraft();
    setSelectedStyle(null);
    setSelectedTimeSlot(null);
    setSelectedTimeMeta(null);
    setStyleSettingsPanel(null);
    window.scrollTo({
      top: 0,
      behavior: "instant" as ScrollBehavior,
    });
    setCurrentStep("settings");
  }, []);

  const handleBackToStyles = useCallback(() => {
    setSelectedStyle(null);
    setSetupPanelOpen(false);
    setSetupNotice(null);
    setNerdMode(false);
    setStyleSettingsPanel(null);
    window.scrollTo({
      top: 0,
      behavior: "instant" as ScrollBehavior,
    });
    setCurrentStep("styles");
  }, []);

  const nerdAvailable = profileDefaults.pizzaNerdEnabled;
  const effectiveNerdMode = nerdAvailable && nerdMode;
  const [constraints, setConstraints] =
    useState<UserConstraints>(initialCreateDraft.constraints);

  const [selectedFlourId, setSelectedFlourId] = useState<
    string | null
  >(null);

  const [createRecipeTab, setCreateRecipeTab] = useState<RecipePrimaryTab>("ricetta");
  const recipeState = useRecipeState({
    style: selectedStyle,
    cms,
    initial: initialCreateDraft.recipeInitial,
    defaultAvailableHours: constraints.available_hours,
  });
  const {
    recipeMode: createRecipeMode,
    setRecipeMode: setCreateRecipeMode,
    customHydration,
    setCustomHydration,
    customFlourW,
    setCustomFlourW,
    customFlourPL,
    setCustomFlourPL,
    customSalt,
    setCustomSalt,
    customFermentHours,
    setCustomFermentHours,
    customFermentTemp,
    setCustomFermentTemp,
    usePreFerment,
    setUsePreFerment,
    panConfig,
    setPanConfig,
    activeVersionId,
    activeVersion,
    activeInterpretationId,
    selectedToppingConcept,
    setSelectedToppingConcept,
    styleVersions,
    selectVersion,
    applyInterpretationToState,
    resetToBaseRecipe,
    resetForStyle,
    buildRecipe,
    optimizeForConstraints,
    lastOptimization,
  } = recipeState;

  const shareUrl = useMemo(() => {
    if (!selectedStyle) return "";
    const params = new URLSearchParams();
    params.set("mode", createRecipeMode);
    if (activeVersionId) params.set("v", activeVersionId);
    if (activeInterpretationId)
      params.set("interpretation", activeInterpretationId);
    params.set("h", String(customHydration));
    params.set("w", String(customFlourW));
    params.set("pl", String(customFlourPL));
    params.set("f", String(customFermentHours));
    params.set("t", String(customFermentTemp));
    params.set("n", String(constraints.dough_balls));
    if (usePreFerment) params.set("pf", "1");
    if (constraints.oven_type !== "home")
      params.set("oven", constraints.oven_type);
    if (constraints.oven_max_temp_c !== 250)
      params.set("temp", String(constraints.oven_max_temp_c));
    if (
      selectedToppingConcept &&
      selectedStyle.default_topping_ref !== selectedToppingConcept
    )
      params.set("topping", selectedToppingConcept);

    return `${window.location.origin}/recipe/${selectedStyle.id}?${params.toString()}`;
  }, [
    selectedStyle,
    activeVersionId,
    activeInterpretationId,
    customHydration,
    customFlourW,
    customFlourPL,
    customFermentHours,
    customFermentTemp,
    constraints.dough_balls,
    usePreFerment,
    constraints.oven_type,
    constraints.oven_max_temp_c,
    selectedToppingConcept,
    createRecipeMode,
  ]);

  const handleTimeSlotChange = useCallback((slot: TimeSlot) => {
    const selectedAt = Date.now();
    setSelectedTimeSlot(slot.id);
    setSelectedTimeMeta({
      selectedAt,
      hours: slot.hours,
      targetAt:
        slot.id === NO_PREFERENCE_SLOT.id
          ? null
          : selectedAt + slot.hours * HOUR_MS,
    });
    setConstraints((c) => ({
      ...c,
      available_hours: slot.hours,
    }));
    if (currentStep === "styles") {
      setStyleSettingsPanel(null);
      return;
    }
    /* La scelta della tempistica è il gesto che fa partire il flusso: niente
       bottone "Scegli lo stile". Avanziamo subito allo step stili, dove la
       scelta "atterra" come chip nella barra parametri in alto. Un attimo di
       respiro perché la card mostri il check prima della transizione. */
    const advance = () => {
      window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
      setCurrentStep("styles");
    };
    if (prefersReducedMotion) advance();
    else window.setTimeout(advance, 280);
  }, [currentStep, prefersReducedMotion]);

  const handleSelectStyle = useCallback(
    (style: PizzaStyle) => {
      resetForStyle(style, { mode: "adapted" }, constraints.available_hours);
      setSelectedStyle(style);
      setSetupPanelOpen(false);
      setSetupNotice(null);
      setSelectedFlourId(null);
      setStyleSettingsPanel(null);
    },
    [constraints.available_hours, resetForStyle],
  );

  const handleResetCreateToCanonical = useCallback(() => {
    if (!selectedStyle) return;
    const fCenter = Math.round(
      (selectedStyle.dough.fermentation_hours_range[0] +
        selectedStyle.dough.fermentation_hours_range[1]) /
        2,
    );
    resetToBaseRecipe({
      mode: "canonical",
      availableHours: selectedStyle.dough.fermentation_hours_range[1],
    });
    setSetupNotice(null);
    setSelectedFlourId(null);
    setSelectedTimeSlot(null);
    setSelectedTimeMeta(null);
    // Audit role-play giugno 2026: il canonico va valutato sul TUO forno, non su
    // quello ideale. Prima forzava oven=ideale → il canonico mostrava ~95 e
    // nascondeva la verità ("la vera Napoletana a casa tua fa 44"). Ora il forno
    // resta il tuo: la canonica è onesta e i due livelli (canonica↔su misura)
    // hanno senso. La "versione del maestro" a 485° resta un riferimento futuro.
    setConstraints((current) => ({
      ...current,
      available_hours: fCenter,
      dough_balls: getDefaultDoughBalls(selectedStyle),
    }));
  }, [resetToBaseRecipe, selectedStyle]);

  const resetCreateBaseRecipe = useCallback(() => {
    resetToBaseRecipe({ availableHours: constraints.available_hours });
  }, [constraints.available_hours, resetToBaseRecipe]);

  // Audit role-play giugno 2026: la ricetta del "Crea" deve essere GIÀ su misura,
  // non il midpoint. Quando entri in uno stile in modalità adattata (senza versione
  // o interpretazione attiva), il motore ottimizza una volta per stile+vincoli.
  // Il midpoint canonico resta accessibile via "Torna all'originale".
  const autoOptSigRef = useRef<string>("");
  useEffect(() => {
    if (!selectedStyle) {
      autoOptSigRef.current = "";
      return;
    }
    if (createRecipeMode !== "adapted") return; // canonico: lascia il riferimento da manuale
    if (activeVersionId || activeInterpretationId) return; // rispetta la scelta dell'utente
    const c = constraints;
    const sig = `${selectedStyle.id}|${c.oven_type}|${c.oven_max_temp_c}|${c.skill_level}|${c.available_hours}|${c.dough_balls}|${(c.pantry_flours || []).join(",")}|${(c.pantry_yeasts || []).join(",")}|${c.mixer_type ?? ""}`;
    if (autoOptSigRef.current === sig) return;
    autoOptSigRef.current = sig;
    optimizeForConstraints(constraints);
  }, [
    selectedStyle,
    createRecipeMode,
    activeVersionId,
    activeInterpretationId,
    constraints,
    optimizeForConstraints,
  ]);

  const handleCreateVersionSelect = useCallback(
    (version: StyleVersion) => {
      setSetupNotice(null);
      selectVersion(version);
    },
    [selectVersion],
  );

  const handleCreateInterpretationSelect = useCallback(
    (interpretation: Interpretation | null) => {
      if (!interpretation) {
        resetCreateBaseRecipe();
        return;
      }
      setSetupNotice(null);
      applyInterpretationToState(interpretation);
    },
    [applyInterpretationToState, resetCreateBaseRecipe],
  );

  const handleOpenCreatePersonalization = useCallback(() => {
    if (createRecipeMode === "canonical") setCreateRecipeMode("adapted");
    setSetupPanelOpen(true);
  }, [createRecipeMode, setCreateRecipeMode]);

  const recipe = useMemo(
    () => buildRecipe(constraints),
    [buildRecipe, constraints],
  );

  // Soffitto (M_o) + diagnosi del collo di bottiglia. Calcolato sui vincoli correnti
  // (~0.1ms). HARD = forno (abbassa il soffitto, viabilità termica < 1). SOFT =
  // farina/lievito non in dispensa (NON abbassano il soffitto — l'optimizer assume
  // tu li prenda — ma sono precondizioni per raggiungerlo → lista della spesa).
  const ceilingInfo = useMemo(() => {
    if (!selectedStyle) return undefined;
    const opt = optimizeRecipe(selectedStyle, constraints, undefined, undefined, {
      authenticity: cms.scoreDimensions?.authenticity?.weight,
      feasibility: cms.scoreDimensions?.feasibility?.weight,
      digestibility: cms.scoreDimensions?.digestibility?.weight,
      sustainability: cms.scoreDimensions?.sustainability?.weight,
      experimentation: cms.scoreDimensions?.experimentation?.weight,
    }).recipe;
    const hard = thermalViability(selectedStyle, opt.oven_temp_c) < 1;
    const softNeeds: string[] = [];
    if (constraints.pantry_flours.length > 0) {
      const covered = constraints.pantry_flours.some((id) => {
        const rng = FLOUR_W_RANGES[id];
        return rng && opt.flour_w >= rng[0] - 1 && opt.flour_w <= rng[1] + 1;
      });
      if (!covered) softNeeds.push(tpl(cms.cooking.needFlour, { w: opt.flour_w }));
    }
    if (
      constraints.pantry_yeasts.length > 0 &&
      !constraints.pantry_yeasts.includes(opt.yeast_type)
    ) {
      softNeeds.push(
        (cms.yeastLabels?.[opt.yeast_type] ?? YEAST_LABELS[opt.yeast_type] ?? opt.yeast_type).toLowerCase(),
      );
    }
    return { value: opt.scores.composite, hard, softNeeds };
  }, [selectedStyle, constraints, cms.scoreDimensions, cms.cooking.needFlour, cms.yeastLabels]);

  // La ricetta è "già ottimizzata" se siamo in modalità adattata, senza versione/
  // interpretazione, e i parametri correnti coincidono con l'ultimo ottimo. In quel
  // caso mostriamo la rationale e NASCONDIAMO il pulsante (sarebbe ridondante). Se
  // l'utente è su canonico o ha spostato gli slider, il pulsante riappare.
  const createRecipeOptimized = useMemo(() => {
    const p = lastOptimization?.params;
    return (
      createRecipeMode === "adapted" &&
      !activeVersionId &&
      !activeInterpretationId &&
      p != null &&
      customHydration === p.hydration &&
      customFlourW === p.flour_w &&
      customFermentHours === p.fermentation_hours &&
      customFermentTemp === p.fermentation_temp_c &&
      usePreFerment === p.use_pre_ferment
    );
  }, [
    lastOptimization,
    createRecipeMode,
    activeVersionId,
    activeInterpretationId,
    customHydration,
    customFlourW,
    customFermentHours,
    customFermentTemp,
    usePreFerment,
  ]);

  /* VPL-068: time slot is optional — styles always visible */
  const canGenerateRecipe = selectedStyle !== null;

  // F2 — loop di apprendimento: se hai riportato problemi RICORRENTI su questo stile,
  // Vulcan propone una correzione (opt-in, trasparente). Applicazione manuale, non
  // silenziosa: modificare la ricetta in automatico su feedback rumoroso è pericoloso.
  const [feedbackAppliedStyle, setFeedbackAppliedStyle] = useState<string | null>(null);
  const feedbackCorrection = useMemo(
    () => (selectedStyle ? deriveFeedbackCorrections(selectedStyle.id, loadFeedback()) : null),
    [selectedStyle],
  );
  const showFeedbackPanel =
    Boolean(feedbackCorrection) && selectedStyle != null && feedbackAppliedStyle !== selectedStyle.id;
  const applyFeedbackCorrection = useCallback(() => {
    if (!feedbackCorrection || !selectedStyle) return;
    if (feedbackCorrection.hydrationDelta !== 0) {
      setCustomHydration((h) => Math.max(40, Math.min(105, h + feedbackCorrection.hydrationDelta)));
    }
    if (feedbackCorrection.fermentMultiplier !== 1) {
      setCustomFermentHours((f) => Math.max(1, Math.round(f * feedbackCorrection.fermentMultiplier)));
    }
    if (feedbackCorrection.saltDelta !== 0) {
      setCustomSalt((s) => Math.max(1.5, Math.min(3.5, Math.round((s + feedbackCorrection.saltDelta) * 10) / 10)));
    }
    setFeedbackAppliedStyle(selectedStyle.id);
  }, [feedbackCorrection, selectedStyle, setCustomHydration, setCustomFermentHours, setCustomSalt]);

  /* Scroll-driven title fade */
  const { scrollY } = useScroll();
  const titleOpacity = useTransform(scrollY, [0, 160], [1, 0]);
  const titleY = useTransform(scrollY, [0, 160], [0, -14]);

  /* Scroll-to-top on step change */
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "instant" as ScrollBehavior,
    });
  }, [currentStep]);

  /* Sul result la scheda è una vista focalizzata identica a Scopri: nascondiamo
     la chrome dell'app (rail/tab bar/profilo) così la navbar delle sezioni è
     l'unica barra in basso. Ripristino uscendo o smontando. */
  useEffect(() => {
    setHideNavbar?.(currentStep === "result");
    return () => setHideNavbar?.(false);
  }, [currentStep, setHideNavbar]);

  /* VPL-068: scroll-snap removed — single continuous flow */

  /* ═══ Fire glow intensity based on step ═══ */
  const fireIntensity =
    currentStep === "result"
      ? 0.6
      : currentStep === "styles"
        ? 0.5
        : 0.3;

  /* ═══ DoughBlob energy — maps step state to mascot reactivity ═══ */
  const doughEnergy =
    currentStep === "result"
      ? (recipe?.scores.composite ?? 60)
      : currentStep === "styles"
        ? 55
        : 25;

  /* ═══ VPL-008: Focus management on step transitions ═══ */
  const resultHeadingRef = useRef<HTMLElement | null>(
    null,
  );
  const prevStepRef = useRef<AppStep>(currentStep);

  useEffect(() => {
    if (prevStepRef.current !== currentStep) {
      prevStepRef.current = currentStep;
      /* Delay slightly so DOM is mounted after the step transition */
      const t = setTimeout(() => {
        if (
          currentStep === "result" &&
          resultHeadingRef.current
        ) {
          resultHeadingRef.current.focus({
            preventScroll: true,
          });
        }
      }, 350);
      return () => clearTimeout(t);
    }
  }, [currentStep]);

  useEffect(() => {
    const hasCreateDraft =
      selectedTimeSlot !== null ||
      selectedStyle !== null ||
      currentStep === "result";

    if (!hasCreateDraft) {
      removeCreateDraft();
      return;
    }

    writeCreateDraft({
      version: 1,
      updatedAt: Date.now(),
      step: currentStep,
      selectedTimeSlot,
      selectedTimeAt: selectedTimeMeta?.selectedAt ?? null,
      selectedTimeHours: selectedTimeMeta?.hours ?? null,
      selectedTimeTargetAt: selectedTimeMeta?.targetAt ?? null,
      selectedStyleId: selectedStyle?.id ?? null,
      recipeGenerated: currentStep === "result" && selectedStyle !== null,
      constraints,
      recipe: selectedStyle
        ? {
            mode: createRecipeMode,
            activeVersionId,
            activeInterpretationId,
            customHydration,
            customFlourW,
            customFlourPL,
            customFermentHours,
            customFermentTemp,
            usePreFerment,
            panConfig,
            selectedToppingConcept,
          }
        : null,
    });
  }, [
    activeInterpretationId,
    activeVersionId,
    constraints,
    createRecipeMode,
    currentStep,
    customFermentHours,
    customFermentTemp,
    customFlourPL,
    customFlourW,
    customHydration,
    panConfig,
    selectedStyle,
    selectedTimeMeta?.hours,
    selectedTimeMeta?.selectedAt,
    selectedTimeMeta?.targetAt,
    selectedTimeSlot,
    selectedToppingConcept,
    usePreFerment,
  ]);

  return (
    <div
      className="min-h-screen"
      style={{
        background: "var(--container-page)",
        color: "var(--text-default)",
      }}
    >
      {/* ═══ VPL-009: Skip-to-content link for screen readers ═══ */}
      <CtaButton
        as="a"
        href="#main-content"
        radius="lg"
        elevated={false}
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[9999] focus:px-4 focus:py-2 focus:rounded-lg"
        style={{
          fontSize: "var(--font-size-lg)",
          fontWeight: "var(--weight-semibold)" as any,
        }}
      >
        {cms.pages.skipToContent}
      </CtaButton>

      {/* ═══ FIRE GLOW — ambient background ═══ */}
      <FireGlow intensity={fireIntensity} />

      {/* VPL-080: header rimosso dalla sezione Crea — la navigazione vive già
          nella shell (sidebar rail / tab bar / pulsante Profilo). La sezione
          parte diretta dai parametri (cucina/dispensa/tu) + logo + tempistiche.
          Dark mode → Profilo. Back tra gli step → CTA in basso / back inline. */}

      {/* ═══ STYLE OVERRIDE BANNER ═══ */}
      {isOverrideActive && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{
              type: "spring",
              stiffness: 500,
              damping: 28,
            }}
            className="overflow-hidden sticky top-0 z-40"
          >
            <div
              className="flex items-center justify-center gap-3 px-4 py-2"
              style={{
                background:
                  "color-mix(in srgb, var(--tertiary) 12%, var(--container-page))",
                borderBottom:
                  "1px solid color-mix(in srgb, var(--tertiary) 25%, transparent)",
              }}
            >
              <div
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{
                  background: "var(--tertiary)",
                  boxShadow: "0 0 6px var(--tertiary)",
                }}
              />
              <span
                className="type-data"
                style={{
                  fontSize: "var(--font-size-sm)",
                  color: "var(--text-default)",
                }}
              >
                {cms.ui.styleEditorActive} —{" "}
                <span
                  style={{
                    fontFeatureSettings: "'tnum'",
                    color: "var(--tertiary)",
                  }}
                >
                  {(() => {
                    let mod = 0,
                      cust = 0;
                    for (const id of Object.keys(
                      effectiveStyles,
                    )) {
                      if (!(id in STYLES_DB)) cust++;
                      else if (
                        JSON.stringify(effectiveStyles[id]) !==
                        JSON.stringify(STYLES_DB[id])
                      )
                        mod++;
                    }
                    const parts = [];
                    if (mod > 0)
                      parts.push(`${mod} ${cms.pages.stylesModified}`);
                    if (cust > 0) parts.push(`${cust} ${cms.pages.stylesCustom}`);
                    return parts.length > 0
                      ? parts.join(", ")
                      : cms.pages.noChanges;
                  })()}
                </span>
              </span>
              <Link
                to="/dev/editor"
                className="type-data active:scale-95 transition-transform"
                style={{
                  fontSize: "var(--font-size-sm)",
                  fontWeight: "var(--weight-semibold)" as any,
                  color: "var(--tertiary)",
                  textDecoration: "underline",
                  textUnderlineOffset: 2,
                }}
              >
                {cms.ui.modify}
              </Link>
              <button
                onClick={clearOverride}
                className="type-data active:scale-95 transition-transform ml-1"
                style={{
                  fontSize: "var(--font-size-sm)",
                  color: "var(--text-muted)",
                }}
                aria-label={cms.pages.deactivateCustomStyles}
              >
                {cms.pages.deactivate}
              </button>
            </div>
          </motion.div>
      )}

      {/* ═══ CMS OVERRIDE BANNER ═══ */}
      {modifiedCount > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{
              type: "spring",
              stiffness: 500,
              damping: 28,
            }}
            className="overflow-hidden sticky top-0 z-40"
            style={{
              marginTop: isOverrideActive ? 0 : undefined,
            }}
          >
            <div
              className="flex items-center justify-center gap-3 px-4 py-2"
              style={{
                background:
                  "color-mix(in srgb, var(--cta) 10%, var(--container-page))",
                borderBottom:
                  "1px solid color-mix(in srgb, var(--cta) 20%, transparent)",
              }}
            >
              <div
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{
                  background: "var(--cta)",
                  boxShadow: "0 0 6px var(--cta)",
                }}
              />
              <span
                className="type-data"
                style={{
                  fontSize: "var(--font-size-sm)",
                  color: "var(--text-default)",
                }}
              >
                {cms.ui.cmsActive} —{" "}
                <span
                  style={{
                    fontFeatureSettings: "'tnum'",
                    color: "var(--cta)",
                  }}
                >
                  {modifiedCount}{" "}
                  {modifiedCount === 1
                    ? cms.ui.fieldModified
                    : cms.ui.fieldsModified}
                </span>
              </span>
              <Link
                to="/cms"
                className="type-data active:scale-95 transition-transform"
                style={{
                  fontSize: "var(--font-size-sm)",
                  fontWeight: "var(--weight-semibold)" as any,
                  color: "var(--cta)",
                  textDecoration: "underline",
                  textUnderlineOffset: 2,
                }}
              >
                {cms.ui.modify}
              </Link>
              <button
                onClick={cmsResetAll}
                className="type-data active:scale-95 transition-transform ml-1"
                style={{
                  fontSize: "var(--font-size-sm)",
                  color: "var(--text-muted)",
                }}
                aria-label={cms.misc.cmsRestoreContent}
              >
                {cms.ui.restore}
              </button>
            </div>
          </motion.div>
      )}

      {/* ═══ CONTENT ═══ */}
      {/* ─── STEP 1 — SETTINGS: Hero + UserNeeds ─── */}
        {currentStep === "settings" && (
          <motion.main
            key="settings"
            id="main-content"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -18 }}
            transition={{
              type: "spring",
              stiffness: 320,
              damping: 30,
            }}
            className="relative pb-40"
            style={{ zIndex: 2 }}
          >
            <div className="relative">
              <div className="relative max-w-2xl mx-auto px-4 sm:px-6 w-full">
                <UserNeeds
                  constraints={constraints}
                  onConstraintsChange={setConstraints}
                  selectedTimeSlot={selectedTimeSlot}
                  onTimeSlotChange={handleTimeSlotChange}
                  hero={
                    <motion.div
                      className="flex flex-col items-center text-center pb-4 sm:pb-5"
                      style={{
                        opacity: titleOpacity,
                        y: titleY,
                      }}
                    >
                      {/* VulcanHero — harmonized blob + mark composition */}
                      <div
                        className="relative flex items-center justify-center mb-3"
                        style={{
                          width: "var(--hero-mark-size, 160px)",
                          height: "var(--hero-mark-size, 160px)",
                        }}
                      >
                        {/* Radiant warmth — large soft glow irradiated outward */}
                        <motion.div
                          aria-hidden="true"
                          style={{
                            position: "absolute",
                            width: "var(--hero-glow-size, 420px)",
                            height: "var(--hero-glow-size, 420px)",
                            top: "50%",
                            left: "50%",
                            marginTop: "calc(var(--hero-glow-size, 420px) / -2)",
                            marginLeft: "calc(var(--hero-glow-size, 420px) / -2)",
                            borderRadius: "var(--radius-full)",
                            background: "var(--hero-glow-warm)",
                            filter: "blur(40px)",
                            pointerEvents: "none",
                            willChange: prefersReducedMotion
                              ? "auto"
                              : "transform, opacity",
                            opacity: prefersReducedMotion
                              ? 0.15
                              : undefined,
                          }}
                          animate={
                            prefersReducedMotion
                              ? {}
                              : {
                                  scale: [1, 1.06],
                                  opacity: [0.12, 0.18],
                                }
                          }
                          transition={
                            prefersReducedMotion
                              ? {}
                              : {
                                  scale: {
                                    duration: 6,
                                    repeat: Infinity,
                                    repeatType: "mirror",
                                    ease: "easeInOut",
                                  },
                                  opacity: {
                                    duration: 8,
                                    repeat: Infinity,
                                    repeatType: "mirror",
                                    ease: "easeInOut",
                                  },
                                }
                          }
                        />
                        {/* Secondary warmth ring — wider, subtler */}
                        <motion.div
                          aria-hidden="true"
                          style={{
                            position: "absolute",
                            width: 600,
                            height: 600,
                            top: "50%",
                            left: "50%",
                            marginTop: -300,
                            marginLeft: -300,
                            borderRadius: "50%",
                            background:
                              "var(--hero-glow-accent)",
                            filter: "blur(60px)",
                            pointerEvents: "none",
                            willChange: prefersReducedMotion
                              ? "auto"
                              : "transform, opacity",
                            opacity: prefersReducedMotion
                              ? 0.08
                              : undefined,
                          }}
                          animate={
                            prefersReducedMotion
                              ? {}
                              : {
                                  scale: [1, 1.04],
                                  opacity: [0.06, 0.1],
                                }
                          }
                          transition={
                            prefersReducedMotion
                              ? {}
                              : {
                                  scale: {
                                    duration: 10,
                                    repeat: Infinity,
                                    repeatType: "mirror",
                                    ease: "easeInOut",
                                  },
                                  opacity: {
                                    duration: 12,
                                    repeat: Infinity,
                                    repeatType: "mirror",
                                    ease: "easeInOut",
                                    delay: 2,
                                  },
                                }
                          }
                        />
                        <VulcanHero
                          size={160}
                          energy={doughEnergy}
                          blobVariant="forge"
                          logoVariant="naturale"
                          markRatio={0.32}
                        />
                      </div>
                      {/* R8: wordmark — il nome del brand accanto al logo */}
                      <span
                        style={{
                          fontSize: "var(--font-size-sm)",
                          letterSpacing: "0.34em",
                          textTransform: "uppercase",
                          fontWeight: "var(--weight-bold)",
                          color: "var(--primary)",
                          marginBottom: "var(--space-3)",
                        }}
                      >
                        Vulcan
                      </span>
                      <Heading level="page">
                        {cms.hero.title_line1}{" "}
                        <span
                          style={{
                            display: "block",
                            color: "var(--text-accent)",
                          }}
                        >
                          {cms.hero.title_line2}
                        </span>
                      </Heading>
                      <p
                        className="font-serif italic mt-3 max-w-md"
                        style={{
                          color: "var(--text-muted)",
                          fontSize: "var(--font-size-2xl)",
                          lineHeight: "var(--leading-relaxed)",
                        }}
                      >
                        {cms.hero.subtitle}
                      </p>
                    </motion.div>
                  }
                />
              </div>
            </div>
          </motion.main>
        )}

        {/* ─── STEP 2 — STYLES: Choose your style ─── */}
        {currentStep === "styles" && (
          <motion.main
            key="styles"
            id="main-content"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{
              type: "spring",
              stiffness: 320,
              damping: 30,
            }}
            className="relative pb-40"
            style={{ zIndex: 2 }}
          >
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-5 sm:py-7">
              <div className="max-w-2xl lg:max-w-none mx-auto">
                <div className="mb-5 sm:mb-6">
                  <IconButton
                    as={motion.button}
                    onClick={handleBackToSettings}
                    size="md"
                    variant="ghost"
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      type: "spring",
                      stiffness: 400,
                      damping: 25,
                    }}
                    className="active:scale-95 transition-transform"
                    style={{
                      color: "var(--text-default)",
                      background: "color-mix(in srgb, var(--container-bg) 85%, transparent)",
                      border: "1px solid var(--container-border)",
                      boxShadow: "0 8px 24px color-mix(in srgb, var(--shadow-color) 12%, transparent)",
                      backdropFilter: "blur(12px)",
                      WebkitBackdropFilter: "blur(12px)",
                    }}
                    aria-label={cms.configurator.backLabel}
                    title={cms.configurator.backLabel}
                  >
                    <ChevronLeft size={20} />
                  </IconButton>
                  <div className="mt-4 max-w-2xl">
                    <UserNeeds
                      constraints={constraints}
                      onConstraintsChange={setConstraints}
                      selectedTimeSlot={selectedTimeSlot}
                      onTimeSlotChange={handleTimeSlotChange}
                      hideTimeSlots={styleSettingsPanel !== "time"}
                      compact
                      showWeather={false}
                      activeTab={
                        styleSettingsPanel === "time" ? null : styleSettingsPanel
                      }
                      onActiveTabChange={setStyleSettingsPanel}
                      onChangeTime={() =>
                        setStyleSettingsPanel((panel) =>
                          panel === "time" ? null : "time",
                        )
                      }
                    />
                  </div>
                  <Heading level="page" className="mt-5">
                    {cms.steps.styles.title}
                  </Heading>
                  <p
                    className="font-serif italic mt-1 max-w-2xl"
                    style={{
                      fontSize: "var(--font-size-xl)",
                      color: "var(--text-muted)",
                      opacity: 0.72,
                      lineHeight: "var(--leading-normal)",
                    }}
                  >
                    {cms.steps.styles.subtitle}
                  </p>
                </div>
                <RecommendedStyles
                  constraints={constraints}
                  selectedStyle={selectedStyle}
                  onSelectStyle={handleSelectStyle}
                />
              </div>
            </div>
          </motion.main>
        )}

        {/* ─── STEP 3 — RESULT: scheda unificata (RecipeView) ─── */}
        {currentStep === "result" && recipe && selectedStyle && (
          <motion.main
            key="result"
            ref={resultHeadingRef}
            tabIndex={-1}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="relative outline-none"
            style={{ zIndex: 2 }}
          >
            <RecipeView
              recipe={recipe}
              style={selectedStyle}
              photo={
                STYLE_PHOTOS[selectedStyle.id] ||
                "https://images.unsplash.com/photo-1717883235373-ef10b2a745a3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1200&q=80"
              }
              cms={cms}
              constraints={constraints}
              onConstraintsChange={(next) => {
                setCreateRecipeMode("adapted");
                setConstraints(next);
              }}
              panConfig={panConfig}
              activeTab={createRecipeTab}
              onTabChange={setCreateRecipeTab}
              back={{ label: cms.ui.changeStyle, onClick: handleBackToStyles, positionClassName: "top-4 left-4" }}
              recipeTabLabel={
                createRecipeMode === "canonical"
                  ? cms.cooking.tabRecipe
                  : cms.cooking.tabRecipeTailored
              }
              eyebrow={
                createRecipeMode === "canonical"
                  ? cms.cooking.recipeCanonical
                  : cms.cooking.tabRecipeTailored
              }
              shareUrl={shareUrl}
              selectedToppingConcept={selectedToppingConcept}
              onSelectTopping={(conceptId) => {
                setCreateRecipeMode("adapted");
                setSelectedToppingConcept(conceptId);
              }}
              nerdMode={effectiveNerdMode}
              nerdAvailable={nerdAvailable}
              onNerdModeChange={setNerdMode}
              selectedFlourId={selectedFlourId}
              onSelectFlour={(flour) => {
                setCreateRecipeMode("adapted");
                if (flour) {
                  setSelectedFlourId(flour.id);
                  setCustomFlourW(flour.w);
                  setCustomFlourPL(flour.pl);
                } else {
                  setSelectedFlourId(null);
                  if (selectedStyle) {
                    setCustomFlourW(
                      Math.round(
                        (selectedStyle.dough.flour_w_range[0] +
                          selectedStyle.dough.flour_w_range[1]) /
                          2,
                      ),
                    );
                    setCustomFlourPL(defaultRecipePL(selectedStyle));
                  }
                }
              }}
              selectedTimeSlotId={selectedTimeSlot}
              isPersonalized={createRecipeMode !== "canonical"}
              onRequestPersonalization={handleOpenCreatePersonalization}
              matchSlot={
                <RecipeMatchCard
                  scores={recipe.scores}
                  ovenTemp={constraints.oven_max_temp_c}
                  idealTemp={selectedStyle.baking.temp_c_ideal}
                  minTemp={selectedStyle.baking.temp_c_range[0]}
                  mode={createRecipeMode}
                  onReset={
                    createRecipeMode !== "canonical"
                      ? handleResetCreateToCanonical
                      : undefined
                  }
                  onOptimize={
                    createRecipeOptimized
                      ? undefined
                      : () => optimizeForConstraints(constraints)
                  }
                  optimizationRationale={
                    createRecipeOptimized && lastOptimization
                      ? resolveEngineMsgs(lastOptimization.rationale, cms.engineMessages)
                      : undefined
                  }
                  ceiling={ceilingInfo?.value}
                  hardLimited={ceilingInfo?.hard}
                  softNeeds={ceilingInfo?.softNeeds}
                />
              }
              recipeControls={
                <div className="flex flex-col gap-5 sm:gap-6">
                  {/* F2 — "Vulcan ha imparato dai tuoi tentativi" (opt-in, trasparente) */}
                  {showFeedbackPanel && feedbackCorrection && (
                    <div
                      className="rounded-2xl px-4 py-3.5"
                      style={{
                        background: "color-mix(in srgb, var(--cta) 8%, var(--container-bg-low))",
                        border: "1px solid color-mix(in srgb, var(--cta) 30%, transparent)",
                      }}
                    >
                      <div className="flex items-center gap-2 mb-1.5" style={{ color: "var(--cta)" }}>
                        <Sparkles size={15} />
                        <span style={{ fontSize: "var(--font-size-sm)", fontWeight: "var(--weight-bold)" as any }}>
                          Ho imparato dai tuoi {feedbackCorrection.sampleSize} tentativi
                        </span>
                      </div>
                      <ul className="flex flex-col gap-1 mb-2.5">
                        {feedbackCorrection.notes.map((n, i) => (
                          <li
                            key={i}
                            style={{
                              fontSize: "var(--font-size-sm)",
                              color: "var(--text-muted)",
                              lineHeight: "var(--leading-normal)",
                            }}
                          >
                            • {n}
                          </li>
                        ))}
                      </ul>
                      {(feedbackCorrection.hydrationDelta !== 0 ||
                        feedbackCorrection.fermentMultiplier !== 1) && (
                        <button
                          type="button"
                          onClick={applyFeedbackCorrection}
                          className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 active:scale-95 transition-transform"
                          style={{
                            background: "var(--cta)",
                            color: "var(--cta-foreground)",
                            fontSize: "var(--font-size-sm)",
                            fontWeight: "var(--weight-bold)" as any,
                            border: "none",
                            cursor: "pointer",
                          }}
                        >
                          <Sparkles size={14} /> Applica le correzioni
                        </button>
                      )}
                    </div>
                  )}
                  <div
                    className="rounded-2xl px-4 py-3"
                    style={{
                      background: "var(--container-bg-low)",
                      border: "1px solid var(--container-border-subtle)",
                    }}
                  >
                    <span
                      className="block"
                      style={{
                        color: "var(--text-default)",
                        fontSize: "var(--font-size-lg)",
                        fontWeight: "var(--weight-semibold)" as any,
                      }}
                    >
                      {createRecipeMode === "canonical"
                        ? "Ricetta canonica"
                        : createRecipeOptimized
                          ? "Su misura per te"
                          : "Personalizzata"}
                    </span>
                    <span
                      className="block mt-1"
                      style={{
                        color: "var(--text-muted)",
                        fontSize: "var(--font-size-md)",
                        lineHeight: "var(--leading-normal)",
                      }}
                    >
                      {createRecipeMode === "canonical"
                        ? "La ricetta da manuale, valutata sul tuo forno. Ottimizzala per il meglio possibile col tuo setup."
                        : createRecipeOptimized
                          ? "Vulcan ha scelto i parametri migliori per il tuo forno, tempo e livello."
                          : "Hai messo mano ai parametri. Ri-ottimizza per tornare al massimo per te."}
                    </span>
                  </div>
                  <RecipeStatStrip
                    recipe={recipe}
                    nerdMode={effectiveNerdMode}
                    isPersonalized={createRecipeMode !== "canonical"}
                  />

                  <RecipeSetupPanel
                    style={selectedStyle}
                    versions={styleVersions}
                    activeVersion={activeVersion}
                    customHydration={customHydration}
                    customFlourW={customFlourW}
                    customFermentHours={customFermentHours}
                    customFermentTemp={customFermentTemp}
                    activeInterpretationId={activeInterpretationId}
                    onSelectVersion={handleCreateVersionSelect}
                    onSelectInterpretation={handleCreateInterpretationSelect}
                    notice={setupNotice}
                    onNotice={setSetupNotice}
                    open={setupPanelOpen}
                    onOpenChange={setSetupPanelOpen}
                    onRequestOpen={handleOpenCreatePersonalization}
                    isCanonical={createRecipeMode === "canonical"}
                    scores={recipe.scores}
                  >
                    <RecipeConfigurator
                      style={selectedStyle}
                      constraints={constraints}
                      onConstraintsChange={(next) => {
                        setCreateRecipeMode("adapted");
                        setConstraints(next);
                      }}
                      customHydration={customHydration}
                      onHydrationChange={(value) => {
                        setCreateRecipeMode("adapted");
                        setCustomHydration(value);
                      }}
                      customFlourW={customFlourW}
                      onFlourWChange={(value) => {
                        setCreateRecipeMode("adapted");
                        setCustomFlourW(value);
                      }}
                      customFermentHours={customFermentHours}
                      onFermentHoursChange={(value) => {
                        setCreateRecipeMode("adapted");
                        setCustomFermentHours(value);
                      }}
                      customFermentTemp={customFermentTemp}
                      onFermentTempChange={(value) => {
                        setCreateRecipeMode("adapted");
                        setCustomFermentTemp(value);
                      }}
                      usePreFerment={usePreFerment}
                      onPreFermentChange={(value) => {
                        setCreateRecipeMode("adapted");
                        setUsePreFerment(value);
                      }}
                      customFlourPL={effectiveNerdMode ? customFlourPL : undefined}
                      onFlourPLChange={
                        effectiveNerdMode
                          ? (value) => {
                              setCreateRecipeMode("adapted");
                              setCustomFlourPL(value);
                            }
                          : undefined
                      }
                      customSalt={customSalt}
                      onSaltChange={(value) => {
                        setCreateRecipeMode("adapted");
                        setCustomSalt(value);
                      }}
                      science={recipe.science}
                      panConfig={panConfig}
                      onPanConfigChange={(next) => {
                        setCreateRecipeMode("adapted");
                        setPanConfig(next);
                      }}
                    />
                  </RecipeSetupPanel>

                  {/* Warning contestuali + dieta */}
                  <div>
                    <ContextualWarnings
                      hydration={customHydration}
                      flourW={customFlourW}
                      flourPL={customFlourPL}
                      fermentHours={customFermentHours}
                      fermentTemp={customFermentTemp}
                      ovenTemp={constraints.oven_max_temp_c}
                      skillLevel={constraints.skill_level}
                      usePreFerment={usePreFerment}
                      flourG={recipe.flour_g}
                    />
                    {constraints.dietary_filters.length > 0 &&
                      (() => {
                        const dw = getDietaryWarnings(
                          constraints.dietary_filters,
                          {
                            fermentHours: customFermentHours,
                            fermentTemp: customFermentTemp,
                            yeastType: constraints.pantry_yeasts.includes("sourdough")
                              ? "sourdough"
                              : constraints.pantry_yeasts.includes("fresh")
                                ? "fresh"
                                : "dry",
                            hydration: customHydration,
                            flourW: customFlourW,
                          },
                          cms,
                        );
                        if (dw.length === 0) return null;
                        return (
                          <div
                            className="mt-3"
                            style={{
                              background: "var(--surface-container-low)",
                              border: "var(--border-width-thin) solid var(--outline-variant)",
                              borderRadius: "var(--radius-lg)",
                              padding: "var(--space-4) var(--space-5)",
                              display: "flex",
                              flexDirection: "column",
                              gap: "var(--space-2-5)",
                            }}
                          >
                            <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
                              <span style={{ fontSize: "var(--font-size-base)" }}>🩺</span>
                              <span
                                style={{
                                  fontSize: "var(--font-size-sm)",
                                  letterSpacing: "0.18em",
                                  textTransform: "uppercase",
                                  color: "var(--primary)",
                                  fontWeight: "var(--weight-semibold)",
                                }}
                              >
                                {cms.pages.dietaryWarningsTitle}
                              </span>
                            </div>
                            {dw.map((w, i) => (
                              <div
                                key={w.filterId + i}
                                className="flex items-start gap-2"
                                style={{
                                  background:
                                    w.severity === "critical"
                                      ? "color-mix(in srgb, var(--severity-critical) 8%, transparent)"
                                      : w.severity === "warning"
                                        ? "color-mix(in srgb, var(--severity-warning) 8%, transparent)"
                                        : "color-mix(in srgb, var(--severity-info) 6%, transparent)",
                                  border: `1px solid ${
                                    w.severity === "critical"
                                      ? "color-mix(in srgb, var(--severity-critical) 20%, transparent)"
                                      : w.severity === "warning"
                                        ? "color-mix(in srgb, var(--severity-warning) 20%, transparent)"
                                        : "color-mix(in srgb, var(--severity-info) 12%, transparent)"
                                  }`,
                                  borderRadius: "var(--radius-md)",
                                  padding: "var(--space-2-5) var(--font-size-lg)",
                                }}
                              >
                                <span style={{ flexShrink: 0, fontSize: "var(--font-size-base)", marginTop: "var(--space-px)" }}>
                                  {w.severity === "critical" ? "🛑" : w.severity === "warning" ? "⚠️" : "ℹ️"}
                                </span>
                                <div>
                                  <div className="type-body" style={{ color: "var(--text-default)", lineHeight: 1.4 }}>
                                    {w.message}
                                  </div>
                                  <div className="type-body-sm" style={{ color: "var(--muted-foreground)", lineHeight: 1.4, marginTop: "var(--space-0-5)" }}>
                                    💡 {w.tip}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        );
                      })()}
                  </div>
                </div>
              }
            />
          </motion.main>
        )}

      {/* VPL-068: Scroll indicators removed — single continuous flow */}

      {currentStep !== "result" && (
        <footer
          className="relative mx-auto flex max-w-7xl justify-center px-4 pb-36 pt-8 sm:px-6 md:pb-12 lg:px-8"
          style={{ zIndex: 2 }}
          aria-label={cms.pages.mottoAria}
        >
          <span
            className="inline-flex items-center gap-1.5"
            style={{
              color: "var(--text-muted)",
              fontSize: "var(--font-size-xs)",
              fontWeight: "var(--weight-medium)" as any,
              opacity: 0.35,
              letterSpacing: "0.04em",
            }}
          >
            <Heart size={10} fill="currentColor" style={{ color: "var(--primary)", opacity: 0.6 }} />
            Make pizza, not war
          </span>
        </footer>
      )}

      {/* ═══ FLOATING CTA ═══ (non sul result: lì c'è solo back + navbar sezioni) */}
      {currentStep === "styles" && canGenerateRecipe && (
      <div className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none">
        {/* pb-20 on mobile to clear the 64px bottom tab bar; md:pb-6 on desktop */}
        <div
          className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 md:pb-6 flex justify-center"
          style={{ zIndex: 1 }}
        >
            <CtaButton
              as={motion.button}
              key="cta-generate"
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.9 }}
              transition={{
                type: "spring",
                stiffness: 400,
                damping: 25,
              }}
              onClick={handleGenerateRecipe}
              whileHover={{ scale: 1.03, y: -1 }}
              deepShadow
              className="pointer-events-auto h-12 sm:h-13 px-8 sm:px-10 active:scale-[0.97]"
            >
              <Sparkles size={15} />
              {cms.ui.generate}
            </CtaButton>
        </div>
      </div>
      )}

      {/* ═══ STYLE DETAIL SHEET — bottom sheet with selected style details ═══ */}
      {currentStep === "styles" && selectedStyle && (
          <StyleDetailSheet
            key={selectedStyle.id}
            style={selectedStyle}
            constraints={constraints}
            onGenerate={handleGenerateRecipe}
            onDismiss={() => setSelectedStyle(null)}
          />
      )}
    </div>
  );
}
