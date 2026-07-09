import {
ArrowDown,
Bookmark,
ChevronLeft,
ChevronRight,
Heart,
Sparkles,
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
import { useCookSession } from "../features/cooking/cook-session";
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
import { InterpretationSwitcher } from "../features/recipe/interpretation-narrative-card";
import { deriveFeedbackCorrections, loadFeedback } from "../features/recipe/feedback-store";
import { RecipeSetupPanel } from "../features/recipe/recipe-setup-panel";
import { RecipeStatStrip } from "../features/recipe/recipe-stat-strip";
import { RecipeView } from "../features/recipe/recipe-view";
import { RecommendedStyles,STYLE_PHOTOS } from "../features/recipe/recommended-styles";
import { useDarkMode } from "../hooks/use-dark-mode";
import { type SettingsTab, UserNeeds } from "../features/recipe/user-needs";
import { VulcanHero } from "../components/shared/vulcan-hero";
/* VPL-068: ProgressPill/MobileProgressBar removed — wizard is 3-step flow */
import { useCms } from "../features/cms/cms-context";
import { t as tpl } from "../features/cms/i18n";
import { getDietaryWarnings } from "../data/dietary-data";
import { findSavedRecipe, removeRecipe, saveRecipe } from "../data/saved-recipes";
import {
  getInterpretationById,
  getInterpretationsForStyle,
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
  centerParamsForStyle,
  defaultRecipePL,
  type RecipeInitialState,
  type RecipeMode,
  useRecipeState,
} from "../hooks/use-recipe-state";
import { ConfirmDialog, CtaButton, Heading, IconButton } from "../components/ds/index";

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
  /* Redesign lug 2026: niente parcheggio — il result si ripristina solo se
     l'utente era LÌ (continuità di reload); chi è uscito è stato avvisato. */
  const step: AppStep =
    recipeGenerated && draft.step === "result"
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
    recipeInitial:
      step === "result" && !timeChoice.stale
        ? resolveRecipeInitial(draft, draftStyle)
        : null,
  };
}

/* Firma dei vincoli per l'auto-ottimizzazione una-tantum per stile: condivisa
   tra l'effect e la ripresa di una ricetta parcheggiata (che NON deve
   ri-ottimizzare, o sovrascriverebbe i ritocchi manuali dell'utente). */
function computeAutoOptSig(style: PizzaStyle, c: UserConstraints): string {
  return `${style.id}|${c.oven_type}|${c.oven_max_temp_c}|${c.skill_level}|${c.available_hours}|${c.dough_balls}|${(c.pantry_flours || []).join(",")}|${(c.pantry_yeasts || []).join(",")}|${c.mixer_type ?? ""}`;
}

/* ═══ Onboarding primo uso (audit lug 2026) — card sobria una-tantum sopra le
   domande del passo 1: una frase sul patto dell'app (su misura + punteggio
   onesto), dismiss esplicito o automatico appena l'utente avanza. Niente
   wizard, niente overlay: il flusso Crea È già l'onboarding. ═══ */
const ONBOARDING_SEEN_KEY = "vulcan_onboarding_seen";

function WelcomeOnboardingCard({
  eyebrow,
  body,
  cta,
  profileCta,
  onDismiss,
  className = "",
}: {
  eyebrow: string;
  body: string;
  cta: string;
  profileCta: string;
  onDismiss: () => void;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 380, damping: 28 }}
      className={`home-onboarding ${className}`}
    >
      <div className="home-onboarding__eyebrow">
        <Sparkles size={14} aria-hidden="true" />
        {eyebrow}
      </div>
      <p className="home-onboarding__body">{body}</p>
      <div className="home-onboarding__actions">
        <button
          type="button"
          onClick={onDismiss}
          className="home-onboarding__cta"
        >
          {cta}
          <ChevronRight size={13} />
        </button>
        <Link to="/profile" onClick={onDismiss} className="home-onboarding__link">
          {profileCta}
        </Link>
      </div>
      <div className="home-onboarding__guide" aria-hidden="true">
        <span className="home-onboarding__guide-line" />
        <ArrowDown size={14} strokeWidth={1.5} />
      </div>
    </motion.div>
  );
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
  /* Onboarding primo uso: visibile finché non viene congedato — esplicitamente
     o avanzando nel flusso (chi ha già generato una ricetta non ne ha bisogno). */
  const [showOnboarding, setShowOnboarding] = useState(() => {
    try {
      return localStorage.getItem(ONBOARDING_SEEN_KEY) !== "true";
    } catch {
      return false;
    }
  });
  const dismissOnboarding = useCallback(() => {
    setShowOnboarding(false);
    try {
      localStorage.setItem(ONBOARDING_SEEN_KEY, "true");
    } catch {
      /* */
    }
  }, []);
  useEffect(() => {
    if (showOnboarding && currentStep !== "settings") dismissOnboarding();
  }, [showOnboarding, currentStep, dismissOnboarding]);
  /* Fix collisione (redesign lug 2026): quando c'è una pizzata attiva il
     widget flottante occupa la fascia alta — pill Riprendi e onboarding
     si abbassano per non finirgli sotto. */
  const { session: activeCookSession } = useCookSession();
  const topPillOffsetClass = activeCookSession
    ? "home-onboarding--session-active"
    : "";
  /* Redesign lug 2026: niente bozze/parcheggi — all'uscita dal result con
     modifiche non salvate si avvisa e basta. */
  const [exitConfirm, setExitConfirm] = useState(false);
  const autoOptSigRef = useRef<string>("");

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

  /* ═══ Back navigation (redesign lug 2026): niente parcheggio — se la
     ricetta è modificata e non salvata, handleBackToStyles (più sotto,
     dopo il calcolo di isDirty) avvisa prima di buttarla. ═══ */
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

  const proceedBackToStyles = useCallback(() => {
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

  /* Applica davvero la scelta di uno stile (reset dei parametri ricetta).
     Round 7 (nota Matteo): la card può portare con sé la variante migliore
     (firma/disciplinare) — si applica via effect DOPO il commit dello stile,
     perché applyInterpretationToState calcola i centri sullo stile corrente. */
  const [pendingInterpretation, setPendingInterpretation] =
    useState<Interpretation | null>(null);
  const applySelectStyle = useCallback(
    (style: PizzaStyle, interpretation: Interpretation | null = null) => {
      resetForStyle(style, { mode: "adapted" }, constraints.available_hours);
      setSelectedStyle(style);
      setSetupPanelOpen(false);
      setSetupNotice(null);
      setSelectedFlourId(null);
      setStyleSettingsPanel(null);
      setPendingInterpretation(interpretation);
    },
    [constraints.available_hours, resetForStyle],
  );

  useEffect(() => {
    if (!pendingInterpretation || !selectedStyle) return;
    applyInterpretationToState(pendingInterpretation);
    setPendingInterpretation(null);
  }, [pendingInterpretation, selectedStyle, applyInterpretationToState]);

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
  useEffect(() => {
    if (!selectedStyle) {
      autoOptSigRef.current = "";
      return;
    }
    if (createRecipeMode !== "adapted") return; // canonico: lascia il riferimento da manuale
    if (activeVersionId || activeInterpretationId) return; // rispetta la scelta dell'utente
    const sig = computeAutoOptSig(selectedStyle, constraints);
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

  /* "Personalizza": apre il dialog e basta — la ricetta diventa
     personalizzata solo quando un parametro cambia davvero (isDirty). */
  const handleOpenCreatePersonalization = useCallback(() => {
    setSetupPanelOpen(true);
  }, []);

  const recipe = useMemo(
    () => buildRecipe(constraints),
    [buildRecipe, constraints],
  );

  /* ═══ Ondata 1: salva la ricetta su misura anche dal flusso Crea (stesso
     store e stessa firma-parametri della pagina dettaglio). ═══ */
  const currentSaveParams = useMemo(
    () => ({
      hydration: customHydration,
      flourW: customFlourW,
      flourPL: customFlourPL,
      fermentHours: customFermentHours,
      fermentTemp: customFermentTemp,
      usePreFerment,
      doughBalls: constraints.dough_balls,
      ovenType: constraints.oven_type,
      ovenTemp: constraints.oven_max_temp_c,
      panConfig,
      selectedToppingConcept,
    }),
    [
      customHydration,
      customFlourW,
      customFlourPL,
      customFermentHours,
      customFermentTemp,
      usePreFerment,
      constraints.dough_balls,
      constraints.oven_type,
      constraints.oven_max_temp_c,
      panConfig,
      selectedToppingConcept,
    ],
  );
  const [savedTick, setSavedTick] = useState(0);
  const savedEntry = useMemo(
    () =>
      selectedStyle ? findSavedRecipe(selectedStyle.id, currentSaveParams) : null,
    // savedTick forza il ricalcolo dopo salva/rimuovi (localStorage non è reattivo)
    [selectedStyle, currentSaveParams, savedTick],
  );
  const handleToggleSaveRecipe = useCallback(() => {
    if (!selectedStyle || !recipe) return;
    if (savedEntry) {
      removeRecipe(savedEntry.id);
    } else {
      saveRecipe({
        styleId: selectedStyle.id,
        styleName: selectedStyle.name,
        versionId: activeVersionId,
        params: currentSaveParams,
        score: Math.round(recipe.scores.composite),
      });
    }
    setSavedTick((v) => v + 1);
  }, [selectedStyle, recipe, savedEntry, activeVersionId, currentSaveParams]);

  /* ═══ Modello "dirty" (redesign lug 2026) ═══
     L'originale del Crea è il centro-range dello stile (lo stesso che
     "Torna all'originale" ripristina via resetToBaseRecipe). isDirty =
     i parametri attuali se ne discostano — vero anche subito dopo
     l'auto-ottimizzazione, che È una personalizzazione. */
  const createCanonicalTargets = useMemo(() => {
    if (!selectedStyle) return null;
    const centered = centerParamsForStyle(
      selectedStyle,
      selectedStyle.dough.fermentation_hours_range[1],
    );
    return { ...centered, salt: selectedStyle.dough.salt_pct };
  }, [selectedStyle]);

  const createDirty = Boolean(
    selectedStyle &&
      createCanonicalTargets &&
      (customHydration !== createCanonicalTargets.hydration ||
        customFlourW !== createCanonicalTargets.flourW ||
        Math.abs(customFlourPL - createCanonicalTargets.flourPL) > 0.001 ||
        customFermentHours !== createCanonicalTargets.fermentHours ||
        customFermentTemp !== createCanonicalTargets.fermentTemp ||
        usePreFerment !== createCanonicalTargets.usePreFerment ||
        Math.abs(customSalt - createCanonicalTargets.salt) > 0.01),
  );

  /* Back dal result: se la ricetta è modificata e non salvata, avvisa —
     sostituisce la vecchia gestione bozze/parcheggio (nota Matteo lug 2026). */
  const handleBackToStyles = useCallback(() => {
    if (currentStep === "result" && createDirty && !savedEntry) {
      setExitConfirm(true);
      return;
    }
    proceedBackToStyles();
  }, [currentStep, createDirty, savedEntry, proceedBackToStyles]);

  const createInterpretations = useMemo(
    () => (selectedStyle ? getInterpretationsForStyle(selectedStyle.id) : []),
    [selectedStyle],
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
  const showFeedbackPanel = false;
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
    <div className="home-page">
      {/* ═══ VPL-009: Skip-to-content link for screen readers ═══ */}
      <CtaButton
        as="a"
        href="#main-content"
        radius="lg"
        elevated={false}
        className="home-skiplink"
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
            className="home-banner"
          >
            <div className="home-banner__bar home-banner__bar--override">
              <div className="home-banner__dot home-banner__dot--override" />
              <span className="type-data home-banner__text">
                {cms.ui.styleEditorActive} —{" "}
                <span className="home-banner__count home-banner__count--override">
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
                className="type-data home-banner__action home-banner__action--override"
              >
                {cms.ui.modify}
              </Link>
              <button
                onClick={clearOverride}
                className="type-data home-banner__dismiss"
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
            className="home-banner"
          >
            <div
              /* pr-16 mobile: corsia del ProfileButton fisso della shell (come
                 SubPageHeader); flex-wrap: sotto i 360px i link scendono su una
                 seconda riga invece di finire sotto il bottone. */
              className="home-banner__bar home-banner__bar--cms"
            >
              <div className="home-banner__dot home-banner__dot--cms" />
              <span className="type-data home-banner__text">
                {cms.ui.cmsActive} —{" "}
                <span className="home-banner__count home-banner__count--cms">
                  {modifiedCount}{" "}
                  {modifiedCount === 1
                    ? cms.ui.fieldModified
                    : cms.ui.fieldsModified}
                </span>
              </span>
              <Link
                to="/cms"
                className="type-data home-banner__action home-banner__action--cms"
              >
                {cms.ui.modify}
              </Link>
              <button
                onClick={cmsResetAll}
                className="type-data home-banner__dismiss"
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
            className="home-step home-step--settings"
          >
            <div className="home-step__frame">
              <div className="home-step__container">
                {showOnboarding && (
                  <WelcomeOnboardingCard
                    eyebrow={cms.hero.onboardingEyebrow ?? "Prima volta qui?"}
                    body={
                      cms.hero.onboardingBody ??
                      "Vulcan disegna la ricetta su misura per il tuo forno e il tuo tempo — e ti dice con un punteggio onesto quanto si avvicina all'originale."
                    }
                    cta={cms.hero.onboardingCta ?? "Capito, si parte"}
                    profileCta={cms.hero.onboardingProfileCta ?? "Salva forno e livello nel profilo"}
                    onDismiss={dismissOnboarding}
                    className={topPillOffsetClass}
                  />
                )}
                <UserNeeds
                  constraints={constraints}
                  onConstraintsChange={setConstraints}
                  selectedTimeSlot={selectedTimeSlot}
                  onTimeSlotChange={handleTimeSlotChange}
                  hero={
                    <motion.div
                      className="home-hero"
                      style={{
                        opacity: titleOpacity,
                        y: titleY,
                      }}
                    >
                      {/* VulcanHero — harmonized blob + mark composition */}
                      <div className="home-hero__mark">
                        {/* Radiant warmth — large soft glow irradiated outward */}
                        <motion.div
                          aria-hidden="true"
                          className="home-hero__glow home-hero__glow--primary"
                          style={{
                            ["--home-glow-opacity" as any]: prefersReducedMotion
                              ? 0.15
                              : undefined,
                            ["--home-glow-will-change" as any]: prefersReducedMotion
                              ? "auto"
                              : "transform, opacity",
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
                          className="home-hero__glow home-hero__glow--secondary"
                          style={{
                            ["--home-glow-opacity" as any]: prefersReducedMotion
                              ? 0.08
                              : undefined,
                            ["--home-glow-will-change" as any]: prefersReducedMotion
                              ? "auto"
                              : "transform, opacity",
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
                      <span className="home-hero__wordmark">Vulcan</span>
                      <Heading level="page">
                        {cms.hero.title_line1}{" "}
                        <span className="page-title-accent">
                          {cms.hero.title_line2}
                        </span>
                      </Heading>
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
            className="home-step home-step--styles"
          >
            <div className="home-step__container home-step__container--wide">
              <div className="home-step__inner">
                <div className="home-step__head">
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
                    className="home-step__back"
                    aria-label={cms.configurator.backLabel}
                    title={cms.configurator.backLabel}
                  >
                    <ChevronLeft size={20} />
                  </IconButton>
                  <div className="home-step__needs">
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
                  <Heading level="page" className="home-step__title">
                    {cms.steps.styles.title}
                  </Heading>
                  <p className="home-step__subtitle">
                    {cms.steps.styles.subtitle}
                  </p>
                </div>
                <RecommendedStyles
                  constraints={constraints}
                  selectedStyle={selectedStyle}
                  onSelectStyle={applySelectStyle}
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
            className="home-step home-step--result"
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
                createDirty
                  ? cms.cooking.recipeAdapted
                  : cms.cooking.recipeCanonicalEyebrow ?? cms.cooking.recipeCanonical
              }
              eyebrowTone={createDirty ? "tailored" : "canonical"}
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
              isPersonalized={createDirty}
              onRequestPersonalization={handleOpenCreatePersonalization}
              onResetToOriginal={
                createDirty ? handleResetCreateToCanonical : undefined
              }
              matchSlot={
                /* Round 4-5 (note Matteo): ordine Ispirazione → parametri →
                   match. Chip e tabella sono UN'unità; il verdetto respira. */
                <div className="home-result__match">
                <div className="home-result__match-primary">
                <InterpretationSwitcher
                  interpretations={createInterpretations}
                  activeId={activeInterpretationId}
                  onSelect={handleCreateInterpretationSelect}
                />
                <RecipeStatStrip
                  recipe={recipe}
                  isPersonalized={createDirty}
                />
                {/* Il dialog Personalizza: si apre dal pulsante sulla match
                    card (niente trigger proprio — nota Matteo lug 2026). */}
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
                  isCanonical={!createDirty}
                  scores={recipe.scores}
                  hideTrigger
                  recipe={recipe}
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
                </div>
                <RecipeMatchCard
                  scores={recipe.scores}
                  ovenTemp={constraints.oven_max_temp_c}
                  idealTemp={selectedStyle.baking.temp_c_ideal}
                  minTemp={selectedStyle.baking.temp_c_range[0]}
                  mode={createDirty ? "adapted" : "canonical"}
                  dirty={createDirty}
                  onPersonalize={handleOpenCreatePersonalization}
                  onOptimize={
                    createRecipeOptimized ||
                    (ceilingInfo != null &&
                      Math.round(ceilingInfo.value) -
                        Math.round(recipe.scores.composite) <
                        2)
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
                  onSave={handleToggleSaveRecipe}
                  saved={Boolean(savedEntry)}
                  nerdMode={effectiveNerdMode}
                />
                </div>
              }
              recipeControls={
                <div className="home-result__controls">
                  {/* F2 — "Vulcan ha imparato dai tuoi tentativi" (opt-in, trasparente) */}
                  {showFeedbackPanel && feedbackCorrection && (
                    <div className="home-feedback-panel">
                      <div className="home-feedback-panel__header">
                        <Sparkles size={15} />
                        <span className="home-feedback-panel__header-text">
                          {tpl(
                            cms.cooking.learnedFromAttempts ??
                              "Ho imparato dai tuoi {n} tentativi",
                            { n: feedbackCorrection.sampleSize },
                          )}
                        </span>
                      </div>
                      <ul className="home-feedback-panel__notes">
                        {feedbackCorrection.notes.map((n, i) => (
                          <li key={i} className="home-feedback-panel__note">
                            • {n}
                          </li>
                        ))}
                      </ul>
                      {(feedbackCorrection.hydrationDelta !== 0 ||
                        feedbackCorrection.fermentMultiplier !== 1) && (
                        <button
                          type="button"
                          onClick={applyFeedbackCorrection}
                          className="home-feedback-panel__cta"
                        >
                          <Sparkles size={14} />{" "}
                          {cms.cooking.applyCorrections ?? "Applica le correzioni"}
                        </button>
                      )}
                    </div>
                  )}
                  {/* Warning contestuali + dieta */}
                  <div data-region="warnings">
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
                          <div className="home-dietary-warnings">
                            <div className="home-dietary-warnings__header">
                              <span className="home-dietary-warnings__icon">🩺</span>
                              <span className="home-dietary-warnings__title">
                                {cms.pages.dietaryWarningsTitle}
                              </span>
                            </div>
                            {dw.map((w, i) => {
                              const severityClass = {
                                critical: "home-dietary-warning--critical",
                                warning: "home-dietary-warning--warning",
                                info: "home-dietary-warning--info",
                              }[w.severity];
                              return (
                              <div
                                key={w.filterId + i}
                                className={`home-dietary-warning ${severityClass}`}
                              >
                                <span className="home-dietary-warning__icon">
                                  {w.severity === "critical" ? "🛑" : w.severity === "warning" ? "⚠️" : "ℹ️"}
                                </span>
                                <div className="home-dietary-warning__body">
                                  <div className="type-body home-dietary-warning__message">
                                    {w.message}
                                  </div>
                                  <div className="type-body-sm home-dietary-warning__tip">
                                    💡 {w.tip}
                                  </div>
                                </div>
                              </div>
                              );
                            })}
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
          className="home-footer"
          aria-label={cms.pages.mottoAria}
        >
          <span className="home-footer__motto">
            <Heart size={10} fill="currentColor" className="home-footer__heart" />
            Make pizza, not war
          </span>
        </footer>
      )}

      {/* ═══ FLOATING CTA ═══ (non sul result: lì c'è solo back + navbar sezioni) */}
      {currentStep === "styles" && canGenerateRecipe && (
      <div className="home-float-cta">
        {/* pb-20 on mobile to clear the 64px bottom tab bar; md:pb-6 on desktop */}
        <div className="home-float-cta__inner">
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
              className="home-float-cta__button"
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

      {/* ═══ Avviso uscita: modifiche non salvate (redesign lug 2026) ═══ */}
      <ConfirmDialog
        open={exitConfirm}
        onDismiss={() => setExitConfirm(false)}
        ariaLabel={cms.cooking.unsavedTitle ?? "Modifiche non salvate"}
        icon={<Bookmark size={26} />}
        title={cms.cooking.unsavedTitle ?? "Modifiche non salvate"}
        body={tpl(
          cms.cooking.unsavedBody ??
            "Se esci ora, la tua versione di {style} andrà persa. Vuoi salvarla nel ricettario?",
          { style: selectedStyle?.name ?? "" },
        )}
        actions={[
          {
            label: cms.cooking.saveVersion,
            onClick: () => {
              handleToggleSaveRecipe();
              setExitConfirm(false);
              proceedBackToStyles();
            },
            variant: "cta",
          },
          {
            label: cms.cooking.unsavedDiscard ?? "Esci senza salvare",
            onClick: () => {
              setExitConfirm(false);
              proceedBackToStyles();
            },
            variant: "secondary",
          },
        ]}
      />
    </div>
  );
}
