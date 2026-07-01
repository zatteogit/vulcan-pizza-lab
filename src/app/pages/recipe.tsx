/* === RECIPE PAGE — VPL-058 + VPL-064 ===
   Pagina ricetta self-contained per stile.
   Route: /recipe/:styleId?h=62&w=280&pl=0.6&f=24&t=4&n=4&pf=1&oven=wood&temp=450
   Legge il profilo da localStorage, override opzionali da URL params.
   "Copia link" genera URL condivisibile con parametri correnti. */

import {
ChevronDown,
ChevronLeft,
Heart,
HeartCrack,
Sparkles,
X
} from "lucide-react";
import { AnimatePresence,motion } from "motion/react";
import {
useCallback,
useEffect,
useMemo,
useRef,
useState,
type ReactNode,
} from "react";
import { Link,useLocation,useParams,useSearchParams } from "react-router";
import { useCms,type CmsContent } from "../features/cms/cms-context";
import { createFormatter } from "../features/cms/i18n";
import {
getInterpretationById,
getInterpretationsForStyle,
type Interpretation
} from "../data/interpretation-library";
import {
FLOUR_W_RANGES,
OVEN_PRESETS,
PIZZA_FAMILIES,
SCORE_DIMENSIONS,
STYLES_DB,
YEAST_LABELS,
defaultFermentTempC,
defaultPanShape,
generateRecipe,
getDefaultDoughBalls,
optimizeRecipe,
resolveEngineMsgs,
thermalViability,
type EngineMsg,
type GeneratedRecipe,
type OvenType,
type PanConfig,
type PizzaStyle,
type RecipeScores,
type SkillLevel,
type UserConstraints
} from "../domain/pizza-engine";
import {
PremiumSelect,
RecipeConfigurator,
applyVersionParams,
} from "../features/recipe/recipe-configurator";
import { RecipeLearningPanel } from "../features/recipe/recipe-learning-panel";
import { deriveFeedbackCorrections, loadFeedback } from "../features/recipe/feedback-store";
import { RecipeMatchCard,matchTone } from "../features/recipe/recipe-match-card";
import {
type RecipePrimaryTab,
} from "../features/recipe/recipe-section-tabs";
import { RecipeStatStrip } from "../features/recipe/recipe-stat-strip";
import { RecipeView } from "../features/recipe/recipe-view";
import { STYLE_PHOTOS } from "../features/recipe/recommended-styles";
import { CtaButton, Heading } from "../components/ds/index";
import {
getDefaultVersion,
getVersionById,
getVersions,
type StyleVersion,
} from "../data/style-versions";
import { useStylesOverride } from "../context/styles-override-context";
import { TOPPING_CONCEPTS, resolveTopping, TOPPING_LIBRARY } from "../data/topping-library";
import {
  findSavedRecipe,
  removeRecipe,
  saveRecipe,
  type SavedRecipeParams,
} from "../data/saved-recipes";

const FALLBACK =
  "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&q=80";

const VALID_OVEN_TYPES = new Set(OVEN_PRESETS.map((p) => p.id));
const TAILORING_PARAM_KEYS = [
  "h",
  "w",
  "pl",
  "f",
  "t",
  "n",
  "pf",
  "oven",
  "temp",
  "v",
] as const;

type RecipeMode = "canonical" | "adapted" | "lab";

function hasTailoringParams(params: URLSearchParams): boolean {
  return TAILORING_PARAM_KEYS.some((key) => params.has(key));
}

function readRecipeMode(params: URLSearchParams): RecipeMode {
  const mode = params.get("mode");
  if (mode === "canonical" || mode === "adapted" || mode === "lab") {
    return mode;
  }
  return hasTailoringParams(params) ? "adapted" : "canonical";
}

function readExploreBackTo(state: unknown): string {
  if (!state || typeof state !== "object" || !("exploreBackTo" in state)) {
    return "/explore";
  }
  const value = (state as { exploreBackTo?: unknown }).exploreBackTo;
  if (
    typeof value === "string" &&
    (value === "/explore" || value.startsWith("/explore?") || value.startsWith("/explore#"))
  ) {
    return value;
  }
  return "/explore";
}

function getCanonicalVersion(styleId: string): StyleVersion | null {
  const versions = getVersions(styleId);
  if (versions.length === 0) return null;

  return versions.reduce((best, version) => {
    if (version.skill_hint !== best.skill_hint) {
      return version.skill_hint > best.skill_hint ? version : best;
    }
    return version.params.fermentation_hours > best.params.fermentation_hours
      ? version
      : best;
  }, versions[0]);
}

function cmsMessage(cms: CmsContent, key: string, fallback: string): string {
  return cms.engineMessages?.[key] ?? fallback;
}

function localizedVersionLabel(cms: CmsContent, label: string): string {
  return cmsMessage(cms, `version.label.${label}`, label);
}

function localizedFermentTempLabel(cms: CmsContent, tempC: number): string {
  if (tempC <= 6) return cmsMessage(cms, "recipeSetup.temp.fridge", "frigo");
  if (tempC <= 16) return cmsMessage(cms, "recipeSetup.temp.cool", "fresco");
  return cmsMessage(cms, "recipeSetup.temp.room", "ambiente");
}

/* ═══ STORAGE HELPERS ═══ */
function loadJson<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw);
  } catch {
    /* */
  }
  return null;
}

function defaultPL(style: PizzaStyle): number {
  return (
    Math.round(
      ((style.dough.flour_pl_range[0] +
        style.dough.flour_pl_range[1]) /
        2) *
        100,
    ) / 100
  );
}

/* Parse a numeric URL param with bounds check */
function numParam(
  params: URLSearchParams,
  key: string,
  fallback: number,
  min?: number,
  max?: number,
): number {
  const raw = params.get(key);
  if (raw === null) return fallback;
  const n = Number(raw);
  if (isNaN(n)) return fallback;
  if (min !== undefined && n < min) return min;
  if (max !== undefined && n > max) return max;
  return n;
}

function replaceRecipeSearchParams(
  update: (params: URLSearchParams) => void,
) {
  const next = new URLSearchParams(window.location.search);
  update(next);
  const query = next.toString();
  const url = `${window.location.pathname}${query ? `?${query}` : ""}${
    window.location.hash
  }`;
  window.history.replaceState(window.history.state, "", url);
}

/* ═══ Localizzazione tag supersintesi — Sprint 11 ═══
   Le label vivono in pizza-engine (HYDRATION_CATEGORY_LABELS / CRUST_TYPE_LABELS)
   e sono condivise con home.tsx. */

/* ═══ RECIPE PAGE ═══ */
export function RecipePage() {
  const { styleId } = useParams<{ styleId: string }>();
  const { cms } = useCms();
  const { effectiveStyles } = useStylesOverride();

  const db = effectiveStyles ?? STYLES_DB;
  const style = styleId ? db[styleId] : null;

  if (!style) {
    return <RecipeNotFound styleId={styleId} />;
  }

  return <RecipeContent style={style} cms={cms} />;
}

/* ═══ RECIPE CONTENT ═══ */
function RecipeContent({
  style,
  cms,
}: {
  style: PizzaStyle;
  cms: any;
}) {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const exploreBackTo = readExploreBackTo(location.state);

  /* ── Load profile from localStorage ── */
  const savedOven = loadJson<{
    ovenType: OvenType;
    maxTemp: number;
  }>("vulcan_oven_pref");
  const savedSkill = loadJson<SkillLevel>("vulcan_skill_level");
  const savedPantry = loadJson<{
    flours: string[];
    yeasts: string[];
  }>("vulcan_pantry");
  const savedDietary = loadJson<string[]>("vulcan_dietary");
  const nerdAvailable = localStorage.getItem("vulcan_nerd_on") === "true";
  const initialRecipeMode = readRecipeMode(searchParams);
  const [recipeMode, setRecipeMode] = useState<RecipeMode>(initialRecipeMode);
  const useTailoredUrlParams = initialRecipeMode !== "canonical";

  /* ── Compute style defaults ──
   * Versione attiva: URL param ?v=... ha priorità, poi default skill-aware.
   * Fallback al centro del range quando lo stile non ha versioni. */
  const skillLevel = savedSkill ?? 2;
  const urlInterpretationId = searchParams.get("interpretation");
  const initialInterpretation: Interpretation | null = urlInterpretationId
    ? (getInterpretationById(urlInterpretationId) ?? null)
    : null;
  const interpOverrides = initialInterpretation?.parameter_overrides;
  const urlVersionId = useTailoredUrlParams ? searchParams.get("v") : null;
  const initialVersion: StyleVersion | null =
    (urlVersionId && getVersionById(urlVersionId)) ||
    (initialInterpretation
      ? null
      : initialRecipeMode === "canonical"
        ? getCanonicalVersion(style.id)
        : getDefaultVersion(style.id, skillLevel));

  const hCenter =
    interpOverrides?.hydration_pct ??
    (initialVersion
      ? initialVersion.params.hydration_pct
      : Math.round(
          (style.dough.hydration_pct_range[0] +
            style.dough.hydration_pct_range[1]) /
            2,
        ));
  const wCenter =
    interpOverrides?.flour_w ??
    (initialVersion
      ? initialVersion.params.flour_w
      : Math.round(
          (style.dough.flour_w_range[0] + style.dough.flour_w_range[1]) / 2,
        ));
  const fMax = style.dough.fermentation_hours_range[1];
  const fMin = style.dough.fermentation_hours_range[0];
  const fOptimal =
    interpOverrides?.fermentation_hours ??
    (initialVersion
      ? initialVersion.params.fermentation_hours
      : Math.min(Math.round((fMin + fMax) / 2), 48));
  const fTempDefault =
    interpOverrides?.fermentation_temp_c ??
    (initialVersion
      ? initialVersion.params.fermentation_temp_c
      : fOptimal > 12
        ? 4
        : 22);
  const plDefault =
    interpOverrides?.flour_pl ??
    initialVersion?.params.flour_pl ??
    defaultPL(style);
  const preFermentDefault =
    interpOverrides?.use_pre_ferment ??
    initialVersion?.params.use_pre_ferment ??
    style.requires_pre_ferment;

  /* ── URL params override (VPL-064) ──
   * La modalità canonica è una scheda cristallizzata: forno e parametri ideali
   * dello stile, indipendenti dal profilo. La modalità adattata/lab usa invece
   * forno salvato, oppure un default casalingo esplicito. */
  const urlOven = useTailoredUrlParams ? searchParams.get("oven") : null;
  const adaptedFallbackOvenType = savedOven?.ovenType ?? "home";
  const adaptedFallbackOvenTemp = savedOven?.maxTemp ?? 250;
  const resolvedOvenType: OvenType =
    initialRecipeMode === "canonical"
      ? style.baking.oven_type_required
      : urlOven && VALID_OVEN_TYPES.has(urlOven as OvenType)
      ? (urlOven as OvenType)
      : adaptedFallbackOvenType;
  const resolvedOvenTemp =
    initialRecipeMode === "canonical"
      ? style.baking.temp_c_ideal
      : numParam(searchParams, "temp", adaptedFallbackOvenTemp, 180, 500);

  /* ── State: constraints (from profile + URL override) ── */
  const [constraints, setConstraints] = useState<UserConstraints>(() => ({
    oven_type: resolvedOvenType,
    oven_max_temp_c: resolvedOvenTemp,
    skill_level: skillLevel,
    available_hours: 24,
    // Default contestuale: 4 panetti per tonde, 1 teglia/pala/focaccia, 4 padellini.
    dough_balls: getDefaultDoughBalls(style),
    has_mixer: false,
    has_pizza_stone: false,
    has_pizza_steel: false,
    has_baking_pan: false,
    dietary_filters: savedDietary ?? [],
    pantry_flours: savedPantry?.flours ?? [],
    pantry_yeasts: savedPantry?.yeasts ?? [],
  }));

  /* ── State: recipe params (from style preset/center + URL override) ── */
  const [customHydration, setCustomHydration] = useState(
    useTailoredUrlParams ? numParam(searchParams, "h", hCenter, 30, 120) : hCenter,
  );
  const [customFlourW, setCustomFlourW] = useState(
    useTailoredUrlParams ? numParam(searchParams, "w", wCenter, 100, 500) : wCenter,
  );
  /* VPL-B2 — mix di farine editabile (quote/W per componente). Copia dallo stile. */
  const [customFlourBlend] = useState<
    { name: string; pct: number; w?: number }[] | undefined
  >(() => style.dough.flour_blend?.map((c) => ({ ...c })));
  const [customFlourPL, setCustomFlourPL] = useState(
    useTailoredUrlParams ? numParam(searchParams, "pl", plDefault, 0.2, 1.5) : plDefault,
  );
  const [customSalt, setCustomSalt] = useState(style.dough.salt_pct);
  const [customFermentHours, setCustomFermentHours] = useState(
    useTailoredUrlParams ? numParam(searchParams, "f", fOptimal, 1, 120) : fOptimal,
  );
  const [customFermentTemp, setCustomFermentTemp] = useState(
    useTailoredUrlParams ? numParam(searchParams, "t", fTempDefault, 0, 35) : fTempDefault,
  );
  const [usePreFerment, setUsePreFerment] = useState(() => {
    const pf = searchParams.get("pf");
    return useTailoredUrlParams && pf !== null ? pf === "1" : preFermentDefault;
  });
  const [panConfig, setPanConfig] = useState<PanConfig>({
    panShape: defaultPanShape(style),
    panLength: style.shape.length_cm,
    panWidth: style.shape.width_cm,
    panDiameter: style.shape.diameter_cm,
    thickness: style.shape.thickness_factor,
  });
  const [doughBalls, setDoughBalls] = useState(
    useTailoredUrlParams
      ? numParam(searchParams, "n", getDefaultDoughBalls(style), 1, 20)
      : getDefaultDoughBalls(style),
  );
  const openPersonalizeByDefault = false;
  const [setupPanelOpen, setSetupPanelOpen] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    subText?: string;
    actionLabel?: string;
    onAction?: () => void;
  } | null>(null);
  const [activeRecipeTab, setActiveRecipeTab] = useState<RecipePrimaryTab>(() => {
    const tab = searchParams.get("tab");
    if (tab === "procedimento" || tab === "condimento" || tab === "ricetta") {
      return tab;
    }
    const hasTopping = !!searchParams.get("topping");
    return hasTopping ? "condimento" : "ricetta";
  });
  const handleRecipeTabChange = useCallback((tab: RecipePrimaryTab) => {
    setActiveRecipeTab(tab);
    replaceRecipeSearchParams((next) => {
      if (tab === "ricetta") next.delete("tab");
      else next.set("tab", tab);
    });
  }, []);
  const [nerdMode, setNerdMode] = useState(false);
  const effectiveNerdMode = nerdAvailable && nerdMode;

  const [setupNotice, setSetupNotice] = useState<string | null>(null);
  const [learningOpen, setLearningOpen] = useState(false);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 8000);
    return () => window.clearTimeout(timer);
  }, [toast]);
  const searchSyncTimeoutRef = useRef<number | null>(null);
  const [activeVersionId, setActiveVersionId] = useState<string | null>(
    initialVersion?.id ?? null,
  );
  const activeVersion: StyleVersion | null = activeVersionId
    ? getVersionById(activeVersionId)
    : null;

  /* Sprint 12 Fase 3 — Topping selezionato esplicitamente dall'utente via chip strip.
   * Senza deep-link parte il primo item del carousel condimenti; il default_topping_ref
   * resta il fallback del motore ricetta, non una selezione UI iniziale.
   * Fase 5: deep-link ?topping=<concept_id> per atterraggio diretto da Scopri/Iconiche.
   * Se non c'è ?topping ma c'è ?interpretation con un topping firmato, eredita quello.
   * Quando cambia, viene iniettato nella generateRecipe come override. */
  const [selectedToppingConcept, setSelectedToppingConcept] = useState<string | null>(
    (() => {
      const raw =
        searchParams.get("topping") ??
        initialInterpretation?.base_topping_concept_id ??
        null;
      if (!raw) return null;
      const resolved = resolveTopping(raw, style);
      return resolved ? resolved.id : raw;
    })(),
  );

  /* Sprint 12 Fase 4 — Interpretazione attiva (Maestro/Pizzeria/Community/Disciplinare).
   * Deep-link ?interpretation=<id>: pre-selezionata al primo render. */
  const [activeInterpretationId, setActiveInterpretationId] = useState<string | null>(
    initialInterpretation?.id ?? null,
  );

  const applyVersionToState = useCallback(
    (version: StyleVersion) => {
      applyVersionParams(version, {
        onHydrationChange: setCustomHydration,
        onFlourWChange: setCustomFlourW,
        onFlourPLChange: (value) => setCustomFlourPL(value ?? plDefault),
        onFermentHoursChange: setCustomFermentHours,
        onFermentTempChange: setCustomFermentTemp,
        onPreFermentChange: setUsePreFerment,
        onVersionChange: setActiveVersionId,
      });
    },
    [plDefault],
  );

  const resetToBaseRecipe = useCallback(() => {
    if (activeVersion) {
      applyVersionToState(activeVersion);
      return;
    }
    setCustomHydration(
      Math.round(
        (style.dough.hydration_pct_range[0] +
          style.dough.hydration_pct_range[1]) /
          2,
      ),
    );
    setCustomFlourW(
      Math.round(
        (style.dough.flour_w_range[0] + style.dough.flour_w_range[1]) / 2,
      ),
    );
    setCustomFlourPL(defaultPL(style));
    setCustomFermentHours(
      Math.min(
        Math.round(
          (style.dough.fermentation_hours_range[0] +
            style.dough.fermentation_hours_range[1]) /
            2,
        ),
        48,
      ),
    );
    // F4: usa il default style-aware del motore (STG/Tonda restano a TA anche lunghi).
    setCustomFermentTemp(
      defaultFermentTempC(
        style,
        Math.round(
          (style.dough.fermentation_hours_range[0] + style.dough.fermentation_hours_range[1]) / 2,
        ),
      ),
    );
    setUsePreFerment(style.requires_pre_ferment);
  }, [activeVersion, applyVersionToState, style]);

  const syncSearchParamsAfterFeedback = useCallback(
    (update: (params: URLSearchParams) => void) => {
      if (searchSyncTimeoutRef.current !== null) {
        window.clearTimeout(searchSyncTimeoutRef.current);
      }
      searchSyncTimeoutRef.current = window.setTimeout(() => {
        replaceRecipeSearchParams(update);
        searchSyncTimeoutRef.current = null;
      }, 900);
    },
    [],
  );

  useEffect(
    () => () => {
      if (searchSyncTimeoutRef.current !== null) {
        window.clearTimeout(searchSyncTimeoutRef.current);
      }
    },
    [],
  );

  const handleVersionSelect = useCallback(
    (version: StyleVersion) => {
      setActiveInterpretationId(null);
      syncSearchParamsAfterFeedback((next) => {
        next.set("v", version.id);
        next.delete("interpretation");
      });
      applyVersionToState(version);
    },
    [applyVersionToState, syncSearchParamsAfterFeedback],
  );

  /* Applica parameter_overrides di un'interpretazione (callbacks pattern come applyVersionParams).
   * Sincronizza anche l'URL con ?interpretation=<id> così la scheda è condivisibile. */
  const handleInterpretationSelect = useCallback(
    (interpretation: Interpretation | null) => {
      /* Sync URL: aggiunge o rimuove ?interpretation= preservando gli altri param. */
      syncSearchParamsAfterFeedback((next) => {
        if (interpretation) next.set("interpretation", interpretation.id);
        else next.delete("interpretation");
      });

      if (!interpretation) {
        setActiveInterpretationId(null);
        resetToBaseRecipe();
        return;
      }
      setActiveInterpretationId(interpretation.id);
      const o = interpretation.parameter_overrides;
      if (!o) return;
      if (o.hydration_pct !== undefined) setCustomHydration(o.hydration_pct);
      if (o.flour_w !== undefined) setCustomFlourW(o.flour_w);
      if (o.flour_pl !== undefined) setCustomFlourPL(o.flour_pl);
      if (o.fermentation_hours !== undefined) setCustomFermentHours(o.fermentation_hours);
      if (o.fermentation_temp_c !== undefined) setCustomFermentTemp(o.fermentation_temp_c);
      if (o.use_pre_ferment !== undefined) setUsePreFerment(o.use_pre_ferment);
      // L'override topping è opzionale: se l'interpretazione include un topping firmato,
      // pre-selezionalo (es. da Michele → Margherita).
      if (interpretation.base_topping_concept_id) {
        const resolved = resolveTopping(interpretation.base_topping_concept_id, style);
        setSelectedToppingConcept(resolved ? resolved.id : interpretation.base_topping_concept_id);
      }
    },
    [resetToBaseRecipe, syncSearchParamsAfterFeedback, style],
  );

  /* Audit Sprint 12 — Scroll a inizio pagina quando si atterra sulla scheda
   * (era a metà perché il browser ripristina la posizione di scroll precedente). */
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [style.id]);

  const writeTailoredParams = useCallback(
    (params: URLSearchParams) => {
      if (recipeMode !== "canonical") params.set("mode", recipeMode);
      params.set("h", String(customHydration));
      params.set("w", String(customFlourW));
      params.set("pl", String(customFlourPL));
      params.set("f", String(customFermentHours));
      params.set("t", String(customFermentTemp));
      params.set("n", String(doughBalls));
      if (usePreFerment) params.set("pf", "1");
      else params.delete("pf");
      params.set("oven", constraints.oven_type);
      params.set("temp", String(constraints.oven_max_temp_c));
    },
    [
      recipeMode,
      customHydration,
      customFlourW,
      customFlourPL,
      customFermentHours,
      customFermentTemp,
      doughBalls,
      usePreFerment,
      constraints.oven_type,
      constraints.oven_max_temp_c,
    ],
  );

  /* ── Computed share URL (VPL-064) ── */
  const shareUrl = useMemo(() => {
    const params = new URLSearchParams();
    if (recipeMode !== "canonical" && activeVersionId) params.set("v", activeVersionId);
    if (activeInterpretationId) params.set("interpretation", activeInterpretationId);
    if (selectedToppingConcept && selectedToppingConcept !== style.default_topping_ref)
      params.set("topping", selectedToppingConcept);

    if (recipeMode !== "canonical") {
      writeTailoredParams(params);
    }

    const query = params.toString();
    return `${window.location.origin}/recipe/${style.id}${query ? `?${query}` : ""}`;
  }, [
    recipeMode,
    activeVersionId,
    activeInterpretationId,
    selectedToppingConcept,
    writeTailoredParams,
    style.id,
    style.default_topping_ref,
  ]);

  const buildRecipe = useCallback(
    (recipeConstraints: UserConstraints): GeneratedRecipe => {
    const scoreWeights = {
      authenticity: cms.scoreDimensions?.authenticity?.weight,
      feasibility: cms.scoreDimensions?.feasibility?.weight,
      digestibility: cms.scoreDimensions?.digestibility?.weight,
      sustainability:
        cms.scoreDimensions?.sustainability?.weight,
      experimentation:
        cms.scoreDimensions?.experimentation?.weight,
    };
    // Combina range della versione + eventuale override del peso impasto
    const versionOverrides = activeVersion
      ? {
          ...activeVersion.ranges,
          ...(activeVersion.params.dough_weight_g !== undefined
            ? { dough_weight_g: activeVersion.params.dough_weight_g }
            : {}),
        }
      : undefined;
    // Sprint 12 Fase 3: clona lo style con il topping selezionato dall'utente
    const isToppingValid =
      selectedToppingConcept && style
        ? resolveTopping(selectedToppingConcept, style) !== undefined
        : false;
    const styleWithTopping =
      isToppingValid && selectedToppingConcept !== style.default_topping_ref
        ? { ...style, default_topping_ref: selectedToppingConcept ?? undefined }
        : style;
    // Audit motore 2026-05 — quando un'interpretazione è attiva, i suoi
    // parameter_overrides diventano il "canone" per il punteggio auth.
    const activeInterpretation = activeInterpretationId
      ? getInterpretationById(activeInterpretationId)
      : undefined;
    const interpretationCenter = activeInterpretation?.parameter_overrides
      ? {
          hydration_pct: activeInterpretation.parameter_overrides.hydration_pct,
          flour_w: activeInterpretation.parameter_overrides.flour_w,
          flour_pl: activeInterpretation.parameter_overrides.flour_pl,
          fermentation_hours:
            activeInterpretation.parameter_overrides.fermentation_hours,
      }
      : undefined;
    return generateRecipe(styleWithTopping, recipeConstraints, {
      customHydration,
      customFlourW,
      customFermentationHours: customFermentHours,
      customFermentationTempC: customFermentTemp,
      usePreFerment,
      customFlourPL,
      customSalt,
      panConfig,
      scoreWeights,
      versionRanges: versionOverrides,
      activeImpastoRef: activeVersion?.impasto_ref,
      interpretationCenter,
      customFlourBlend,
    });
    },
    [
      style,
      customHydration,
      customFlourW,
      customFermentHours,
      customFermentTemp,
      usePreFerment,
      customFlourPL,
      customSalt,
      panConfig,
      cms.scoreDimensions,
      activeVersion,
      activeInterpretationId,
      selectedToppingConcept,
      customFlourBlend,
    ],
  );

  /* ── Generate recipe ── */
  // Canonico ONESTO (unificato con Crea, round 11→12): anche su Scopri il canonico
  // è valutato e mostrato sul TUO forno, non su quello ideale. Prima il display
  // usava il forno ideale (485°) mentre il match il tuo (250°) → incoerenza. Ora
  // un'unica fonte: in canonico forziamo savedOven. L'ideale resta come annotazione
  // ("· ideale 485°C") nei parametri.
  const effectiveConstraints = useMemo<UserConstraints>(() => {
    const base = { ...constraints, dough_balls: doughBalls };
    if (recipeMode === "canonical") {
      return {
        ...base,
        oven_type: savedOven?.ovenType ?? "home",
        oven_max_temp_c: savedOven?.maxTemp ?? 250,
      };
    }
    return base;
  }, [constraints, doughBalls, recipeMode, savedOven?.ovenType, savedOven?.maxTemp]);

  const recipe: GeneratedRecipe | null = useMemo(
    () => buildRecipe(effectiveConstraints),
    [buildRecipe, effectiveConstraints],
  );

  const matchConstraints = useMemo<UserConstraints>(() => {
    if (recipeMode !== "canonical") {
      return effectiveConstraints;
    }
    return {
      ...effectiveConstraints,
      oven_type: savedOven?.ovenType ?? "home",
      oven_max_temp_c: savedOven?.maxTemp ?? 250,
    };
  }, [
    recipeMode,
    effectiveConstraints,
    savedOven?.ovenType,
    savedOven?.maxTemp,
  ]);

  const matchRecipe = useMemo(
    () => buildRecipe(matchConstraints),
    [buildRecipe, matchConstraints],
  );

  // #2 path-aware: porta il modello due-livelli + hard/soft + "Ottimizza per me"
  // anche al dettaglio di Scopri (polo CANONICO). Soffitto M_o + diagnosi, sui
  // vincoli di match (in canonico = il tuo forno reale).
  const optScoreWeights = {
    authenticity: cms.scoreDimensions?.authenticity?.weight,
    feasibility: cms.scoreDimensions?.feasibility?.weight,
    digestibility: cms.scoreDimensions?.digestibility?.weight,
    sustainability: cms.scoreDimensions?.sustainability?.weight,
    experimentation: cms.scoreDimensions?.experimentation?.weight,
  };
  const ceilingInfo = useMemo(() => {
    const opt = optimizeRecipe(style, matchConstraints, undefined, undefined, optScoreWeights).recipe;
    const hard = thermalViability(style, opt.oven_temp_c) < 1;
    const softNeeds: string[] = [];
    if (matchConstraints.pantry_flours.length > 0) {
      const covered = matchConstraints.pantry_flours.some((id) => {
        const rng = FLOUR_W_RANGES[id];
        return rng && opt.flour_w >= rng[0] - 1 && opt.flour_w <= rng[1] + 1;
      });
      if (!covered) softNeeds.push(`una farina ~W${opt.flour_w}`);
    }
    if (
      matchConstraints.pantry_yeasts.length > 0 &&
      !matchConstraints.pantry_yeasts.includes(opt.yeast_type)
    ) {
      softNeeds.push((YEAST_LABELS[opt.yeast_type] ?? opt.yeast_type).toLowerCase());
    }
    return { value: opt.scores.composite, hard, softNeeds };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [style, matchConstraints, cms.scoreDimensions]);

  const [lastOptimization, setLastOptimization] = useState<{
    params: { hydration: number; flour_w: number; fermentation_hours: number; fermentation_temp_c: number; use_pre_ferment: boolean };
    rationale: EngineMsg[];
  } | null>(null);

  const handleOptimize = useCallback(() => {
    const o = optimizeRecipe(style, matchConstraints, undefined, undefined, optScoreWeights);
    // "Ottimizza per me" = il movimento completo verso su-misura: porta il forno
    // alla TUA cucina (come faceva il vecchio "adatta") E sceglie i parametri
    // migliori. Così il forno mostrato nei parametri = il tuo, non l'ideale.
    const personalOvenType = savedOven?.ovenType ?? "home";
    const personalOvenTemp = savedOven?.maxTemp ?? 250;
    setRecipeMode("adapted");
    setConstraints((current) => ({
      ...current,
      oven_type: personalOvenType,
      oven_max_temp_c: personalOvenTemp,
    }));
    setCustomHydration(o.params.hydration);
    setCustomFlourW(o.params.flour_w);
    setCustomFermentHours(o.params.fermentation_hours);
    setCustomFermentTemp(o.params.fermentation_temp_c);
    setUsePreFerment(o.params.use_pre_ferment);
    setLastOptimization({ params: o.params, rationale: o.rationale });
    replaceRecipeSearchParams((next) => {
      next.set("mode", "adapted");
      next.set("h", String(o.params.hydration));
      next.set("w", String(o.params.flour_w));
      next.set("f", String(o.params.fermentation_hours));
      next.set("t", String(o.params.fermentation_temp_c));
      if (o.params.use_pre_ferment) next.set("pf", "1");
      else next.delete("pf");
      next.set("oven", personalOvenType);
      next.set("temp", String(personalOvenTemp));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [style, matchConstraints, cms.scoreDimensions, savedOven?.ovenType, savedOven?.maxTemp]);

  const isOptimized =
    recipeMode !== "canonical" &&
    lastOptimization != null &&
    customHydration === lastOptimization.params.hydration &&
    customFlourW === lastOptimization.params.flour_w &&
    customFermentHours === lastOptimization.params.fermentation_hours &&
    customFermentTemp === lastOptimization.params.fermentation_temp_c &&
    usePreFerment === lastOptimization.params.use_pre_ferment;

  // F2 (parità con Crea): "Vulcan ha imparato dai tuoi tentativi" anche su Scopri.
  const [feedbackAppliedStyle, setFeedbackAppliedStyle] = useState<string | null>(null);
  const feedbackCorrection = useMemo(
    () => deriveFeedbackCorrections(style.id, loadFeedback()),
    [style.id],
  );
  const showFeedbackPanel =
    Boolean(feedbackCorrection) && feedbackAppliedStyle !== style.id;
  const applyFeedbackCorrection = useCallback(() => {
    if (!feedbackCorrection) return;
    // Applicare una correzione = personalizzare: esci dal canonico e tieni il TUO
    // forno (come handleOptimize), così l'occhiello passa da "canonica" a su-misura
    // e il forno non salta all'ideale.
    setRecipeMode("adapted");
    setConstraints((c) => ({
      ...c,
      oven_type: savedOven?.ovenType ?? "home",
      oven_max_temp_c: savedOven?.maxTemp ?? 250,
    }));
    if (feedbackCorrection.hydrationDelta !== 0) {
      setCustomHydration((h) => Math.max(40, Math.min(105, h + feedbackCorrection.hydrationDelta)));
    }
    if (feedbackCorrection.fermentMultiplier !== 1) {
      setCustomFermentHours((f) => Math.max(1, Math.round(f * feedbackCorrection.fermentMultiplier)));
    }
    if (feedbackCorrection.saltDelta !== 0) {
      setCustomSalt((s) => Math.max(1.5, Math.min(3.5, Math.round((s + feedbackCorrection.saltDelta) * 10) / 10)));
    }
    setFeedbackAppliedStyle(style.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [feedbackCorrection, style.id, savedOven?.ovenType, savedOven?.maxTemp]);

  /* R31 — salvataggio della versione corrente nel ricettario personale.
     Salviamo i parametri (non il risultato): al riapri la ricetta si rigenera. */
  const currentSaveParams = useMemo<SavedRecipeParams>(
    () => ({
      hydration: customHydration,
      flourW: customFlourW,
      flourPL: customFlourPL,
      fermentHours: customFermentHours,
      fermentTemp: customFermentTemp,
      usePreFerment,
      doughBalls,
      ovenType: effectiveConstraints.oven_type,
      ovenTemp: effectiveConstraints.oven_max_temp_c,
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
      doughBalls,
      effectiveConstraints.oven_type,
      effectiveConstraints.oven_max_temp_c,
      panConfig,
      selectedToppingConcept,
    ],
  );
  const [savedTick, setSavedTick] = useState(0);
  const savedEntry = useMemo(
    () => findSavedRecipe(style.id, currentSaveParams),
    // savedTick forza il ricalcolo dopo salva/rimuovi (localStorage non è reattivo)
    [style.id, currentSaveParams, savedTick],
  );
  const handleToggleSaveRecipe = useCallback(() => {
    if (savedEntry) {
      removeRecipe(savedEntry.id);
    } else {
      saveRecipe({
        styleId: style.id,
        styleName: style.name,
        versionId: activeVersionId,
        params: currentSaveParams,
        score: Math.round(matchRecipe.scores.composite),
      });
    }
    setSavedTick((v) => v + 1);
  }, [savedEntry, style.id, style.name, activeVersionId, currentSaveParams, matchRecipe]);

  const styleVersions = useMemo(() => getVersions(style.id), [style.id]);
  const recipeTabLabel =
    recipeMode === "canonical"
      ? cmsMessage(cms, "recipeMode.canonical", "Ricetta canonica")
      : recipeMode === "lab"
        ? cmsMessage(cms, "recipeMode.lab", "Laboratorio")
        : cms.cooking.tabRecipeTailored;

  /* Photo */
  const photo =
    cms.media?.stylePhotos?.[style.id] ||
    STYLE_PHOTOS[style.id] ||
    FALLBACK;

  const cmsFamilyName =
    cms.families?.[style.family]?.name ||
    PIZZA_FAMILIES[style.family]?.name ||
    "";

  /* Adattamento "silenzioso": calibra modalità e vincoli per la cucina dell'utente,
     senza toast né cambi di tab. Usato sia dal flusso esplicito (con toast) sia
     dall'apertura diretta della dashboard. */
  const applyKitchenAdaptation = useCallback(() => {
    const personalOvenType = savedOven?.ovenType ?? "home";
    const personalOvenTemp = savedOven?.maxTemp ?? 250;

    setRecipeMode("adapted");
    setConstraints((current) => ({
      ...current,
      oven_type: personalOvenType,
      oven_max_temp_c: personalOvenTemp,
      dough_balls: doughBalls,
    }));

    replaceRecipeSearchParams((next) => {
      next.set("mode", "adapted");
      next.delete("tab");
      if (activeVersionId) next.set("v", activeVersionId);
      else next.delete("v");
      if (activeInterpretationId) next.set("interpretation", activeInterpretationId);
      else next.delete("interpretation");
      if (selectedToppingConcept && selectedToppingConcept !== style.default_topping_ref)
        next.set("topping", selectedToppingConcept);
      else next.delete("topping");
      next.set("h", String(customHydration));
      next.set("w", String(customFlourW));
      next.set("pl", String(customFlourPL));
      next.set("f", String(customFermentHours));
      next.set("t", String(customFermentTemp));
      next.set("n", String(doughBalls));
      if (usePreFerment) next.set("pf", "1");
      else next.delete("pf");
      next.set("oven", personalOvenType);
      next.set("temp", String(personalOvenTemp));
    });
  }, [
    savedOven?.ovenType,
    savedOven?.maxTemp,
    doughBalls,
    activeVersionId,
    activeInterpretationId,
    selectedToppingConcept,
    style.default_topping_ref,
    customHydration,
    customFlourW,
    customFlourPL,
    customFermentHours,
    customFermentTemp,
    usePreFerment,
  ]);

  /* Flusso esplicito dalla MatchCard: adatta + conferma con toast. */
  const handleAdaptToKitchen = useCallback(() => {
    applyKitchenAdaptation();
    setActiveRecipeTab("ricetta");
    setToast({
      message: cmsMessage(cms, "recipeSetup.adaptedToast", "Calibrazione cucina completata!"),
      subText: cmsMessage(cms, "recipeSetup.adaptedToastSub", "I parametri dell'impasto e le temperature sono stati ricalibrati per il tuo ambiente e forno."),
      actionLabel: cms.ui.customizeParams,
      onAction: () => setSetupPanelOpen(true),
    });
  }, [applyKitchenAdaptation, cms]);

  /* Scorciatoia sempre disponibile: apre la dashboard, adattando in silenzio
     se la ricetta è ancora canonica (nessun toast). */
  const handleOpenPersonalization = useCallback(() => {
    if (recipeMode === "canonical") applyKitchenAdaptation();
    setSetupPanelOpen(true);
  }, [recipeMode, applyKitchenAdaptation]);

  const handleResetToCanonical = useCallback(() => {
    const canonicalVersion = activeInterpretationId
      ? null
      : getCanonicalVersion(style.id);
    const overrides = activeInterpretationId
      ? getInterpretationById(activeInterpretationId)?.parameter_overrides
      : undefined;

    setRecipeMode("canonical");
    setConstraints((current) => ({
      ...current,
      oven_type: style.baking.oven_type_required,
      oven_max_temp_c: style.baking.temp_c_ideal,
      dough_balls: getDefaultDoughBalls(style),
    }));
    setDoughBalls(getDefaultDoughBalls(style));
    setSetupNotice(null);

    if (overrides) {
      if (overrides.hydration_pct !== undefined) setCustomHydration(overrides.hydration_pct);
      if (overrides.flour_w !== undefined) setCustomFlourW(overrides.flour_w);
      if (overrides.flour_pl !== undefined) setCustomFlourPL(overrides.flour_pl);
      if (overrides.fermentation_hours !== undefined) setCustomFermentHours(overrides.fermentation_hours);
      if (overrides.fermentation_temp_c !== undefined) setCustomFermentTemp(overrides.fermentation_temp_c);
      if (overrides.use_pre_ferment !== undefined) setUsePreFerment(overrides.use_pre_ferment);
      setActiveVersionId(null);
    } else if (canonicalVersion) {
      applyVersionToState(canonicalVersion);
    } else {
      resetToBaseRecipe();
    }

    replaceRecipeSearchParams((next) => {
      next.set("mode", "canonical");
      next.delete("tab");
      next.delete("h");
      next.delete("w");
      next.delete("pl");
      next.delete("f");
      next.delete("t");
      next.delete("n");
      next.delete("pf");
      next.delete("oven");
      next.delete("temp");
      next.delete("v");
      if (activeInterpretationId) next.set("interpretation", activeInterpretationId);
      else next.delete("interpretation");
      if (selectedToppingConcept && selectedToppingConcept !== style.default_topping_ref)
        next.set("topping", selectedToppingConcept);
      else next.delete("topping");
    });
  }, [
    activeInterpretationId,
    style,
    selectedToppingConcept,
    applyVersionToState,
    resetToBaseRecipe,
  ]);

  if (!recipe) return null;

  return (
    <main id="main-content">
      <RecipeView
        recipe={recipe}
        style={style}
        photo={photo}
        cms={cms}
        constraints={effectiveConstraints}
        onConstraintsChange={(c) => {
          if (recipeMode === "canonical") setRecipeMode("adapted");
          setConstraints(c);
          if (c.dough_balls !== doughBalls) setDoughBalls(c.dough_balls);
        }}
        panConfig={panConfig}
        activeTab={activeRecipeTab}
        onTabChange={handleRecipeTabChange}
        back={{ label: (cms.pages as any).navExplore || cms.pages.recipeBackToStyles, to: exploreBackTo }}
        recipeTabLabel={cms.cooking.tabRecipe}
        eyebrow={recipeTabLabel}
        shareUrl={shareUrl}
        showStickyHeader={false}
        hideFloatingActions={false}
        isPersonalized={recipeMode !== "canonical"}
        onRequestPersonalization={handleAdaptToKitchen}
        selectedToppingConcept={selectedToppingConcept}
        onSelectTopping={(recipeId) => {
          const toppingRecipe = TOPPING_LIBRARY[recipeId];
          setSetupNotice(`${toppingRecipe?.name ?? "Condimento"}: ingredienti aggiornati`);
          setSelectedToppingConcept(recipeId);
        }}
        nerdMode={effectiveNerdMode}
        nerdAvailable={nerdAvailable}
        onNerdModeChange={setNerdMode}
        matchSlot={
          <RecipeMatchCard
            scores={matchRecipe.scores}
            ovenTemp={matchConstraints.oven_max_temp_c}
            idealTemp={style.baking.temp_c_ideal}
            minTemp={style.baking.temp_c_range[0]}
            mode={recipeMode}
            onAdapt={handleAdaptToKitchen}
            onReset={recipeMode !== "canonical" ? handleResetToCanonical : undefined}
            onOptimize={isOptimized ? undefined : handleOptimize}
            optimizationRationale={
              isOptimized && lastOptimization
                ? resolveEngineMsgs(lastOptimization.rationale, cms.engineMessages)
                : undefined
            }
            ceiling={ceilingInfo.value}
            hardLimited={ceilingInfo.hard}
            softNeeds={ceilingInfo.softNeeds}
            onSave={handleToggleSaveRecipe}
            saved={Boolean(savedEntry)}
          />
        }
        introExtraSlot={
          <button
            type="button"
            onClick={() => setLearningOpen(true)}
            style={{
              color: "var(--text-accent)",
              textDecoration: "underline",
              fontStyle: "normal",
              fontWeight: "var(--weight-semibold)" as any,
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 0,
              fontSize: "inherit",
            }}
          >
            {cms.cooking.learnMore}
          </button>
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
            <RecipeStatStrip
              recipe={recipe}
              nerdMode={effectiveNerdMode}
              isPersonalized={recipeMode !== "canonical"}
              nerdAvailable={nerdAvailable}
              onNerdModeChange={setNerdMode}
            />
            <RecipeSetupPanel
                style={style}
                versions={styleVersions}
                activeVersion={activeVersion}
                customHydration={customHydration}
                customFlourW={customFlourW}
                customFermentHours={customFermentHours}
                customFermentTemp={customFermentTemp}
                activeInterpretationId={activeInterpretationId}
                onSelectVersion={handleVersionSelect}
                onSelectInterpretation={handleInterpretationSelect}
                notice={setupNotice}
                onNotice={setSetupNotice}
                open={setupPanelOpen}
                onOpenChange={setSetupPanelOpen}
                onRequestOpen={handleOpenPersonalization}
                isCanonical={recipeMode === "canonical"}
                openDefault={openPersonalizeByDefault}
                scores={matchRecipe.scores}
              >
                <RecipeConfigurator
                  style={style}
                  constraints={constraints}
                  onConstraintsChange={(c) => {
                    setConstraints(c);
                    if (c.dough_balls !== doughBalls) setDoughBalls(c.dough_balls);
                  }}
                  customHydration={customHydration}
                  onHydrationChange={setCustomHydration}
                  customFlourW={customFlourW}
                  onFlourWChange={setCustomFlourW}
                  customFermentHours={customFermentHours}
                  onFermentHoursChange={setCustomFermentHours}
                  customFermentTemp={customFermentTemp}
                  onFermentTempChange={setCustomFermentTemp}
                  usePreFerment={usePreFerment}
                  onPreFermentChange={setUsePreFerment}
                  customSalt={customSalt}
                  onSaltChange={(v) => {
                    if (recipeMode === "canonical") setRecipeMode("adapted");
                    setCustomSalt(v);
                  }}
                  panConfig={panConfig}
                  onPanConfigChange={setPanConfig}
                />
              </RecipeSetupPanel>
          </div>
        }
      />
      <RecipeLearningPanel
        open={learningOpen}
        style={style}
        familyName={cmsFamilyName}
        onClose={() => setLearningOpen(false)}
      />

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 350, damping: 28 }}
            className="fixed bottom-24 left-4 right-4 md:left-auto md:right-6 md:bottom-6 z-[100] max-w-sm"
          >
            <div
              className="relative overflow-hidden rounded-2xl p-4 pr-9 flex items-start gap-3.5"
              style={{
                background: "color-mix(in srgb, var(--container-page) 88%, transparent)",
                backdropFilter: "blur(24px) saturate(1.6)",
                WebkitBackdropFilter: "blur(24px) saturate(1.6)",
                border: "1px solid var(--container-border)",
                borderLeft: "4px solid var(--cta)",
                boxShadow: "0 16px 44px color-mix(in srgb, var(--shadow-color) 22%, transparent)",
                color: "var(--text-default)",
              }}
            >
              <div
                className="flex items-center justify-center rounded-xl flex-shrink-0"
                style={{
                  width: 40,
                  height: 40,
                  background: "var(--recipe-setup-icon-bg)",
                  color: "var(--recipe-setup-icon)",
                }}
              >
                <Sparkles size={18} />
              </div>

              <div className="flex-1 min-w-0">
                <h4 style={{ fontSize: "var(--font-size-lg)", fontWeight: "var(--weight-bold)" as any, margin: 0, lineHeight: "var(--leading-tight)" }}>
                  {toast.message}
                </h4>
                {toast.subText && (
                  <p className="type-body-xs" style={{ color: "var(--text-muted)", margin: "3px 0 0 0", lineHeight: "var(--leading-normal)" }}>
                    {toast.subText}
                  </p>
                )}

                {toast.actionLabel && toast.onAction && (
                  <button
                    onClick={() => {
                      toast.onAction?.();
                      setToast(null);
                    }}
                    className="mt-3 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full active:scale-95 transition-all"
                    style={{
                      background: "var(--recipe-setup-action-bg)",
                      color: "var(--recipe-setup-action-text)",
                      fontSize: "var(--font-size-sm)",
                      fontWeight: "var(--weight-semibold)" as any,
                      cursor: "pointer",
                    }}
                  >
                    {toast.actionLabel}
                    <ChevronDown size={13} style={{ transform: "rotate(-90deg)" }} />
                  </button>
                )}
              </div>

              <button
                onClick={() => setToast(null)}
                className="absolute top-3 right-3 flex items-center justify-center rounded-full active:scale-90 transition-transform"
                style={{ width: 24, height: 24, background: "var(--container-bg-low)", border: "1px solid var(--container-border-subtle)", color: "var(--text-muted)", cursor: "pointer", padding: 0 }}
                aria-label={cms.ui.close}
              >
                <X size={13} />
              </button>

              <motion.div
                initial={{ width: "100%" }}
                animate={{ width: "0%" }}
                transition={{ duration: 8, ease: "linear" }}
                className="absolute bottom-0 left-0 h-[3px] rounded-full"
                style={{ background: "var(--cta)", opacity: 0.6 }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

function useBodyScrollLock(locked: boolean) {
  const scrollYRef = useRef(0);

  useEffect(() => {
    if (!locked) return;

    const { body, documentElement } = document;
    const previous = {
      bodyOverflow: body.style.overflow,
      bodyPaddingRight: body.style.paddingRight,
      bodyPosition: body.style.position,
      bodyTop: body.style.top,
      bodyWidth: body.style.width,
      htmlOverflow: documentElement.style.overflow,
      htmlOverscroll: documentElement.style.overscrollBehavior,
    };

    scrollYRef.current = window.scrollY;
    const scrollbarWidth = window.innerWidth - documentElement.clientWidth;

    body.style.overflow = "hidden";
    body.style.position = "fixed";
    body.style.top = `-${scrollYRef.current}px`;
    body.style.width = "100%";
    if (scrollbarWidth > 0) {
      body.style.paddingRight = `${scrollbarWidth}px`;
    }
    documentElement.style.overflow = "hidden";
    documentElement.style.overscrollBehavior = "none";

    return () => {
      body.style.overflow = previous.bodyOverflow;
      body.style.paddingRight = previous.bodyPaddingRight;
      body.style.position = previous.bodyPosition;
      body.style.top = previous.bodyTop;
      body.style.width = previous.bodyWidth;
      documentElement.style.overflow = previous.htmlOverflow;
      documentElement.style.overscrollBehavior = previous.htmlOverscroll;
      window.scrollTo(0, scrollYRef.current);
    };
  }, [locked]);
}

/* ═══ SETUP RICETTA — compatto, contestuale, con feedback immediato ═══ */
function RecipeSetupPanel({
  style,
  versions,
  activeVersion,
  customHydration,
  customFlourW,
  customFermentHours,
  customFermentTemp,
  activeInterpretationId,
  onSelectVersion,
  onSelectInterpretation,
  notice,
  onNotice,
  openDefault = false,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  onRequestOpen,
  isCanonical = false,
  scores,
  children,
}: {
  style: PizzaStyle;
  versions: StyleVersion[];
  activeVersion: StyleVersion | null;
  customHydration: number;
  customFlourW: number;
  customFermentHours: number;
  customFermentTemp: number;
  activeInterpretationId: string | null;
  onSelectVersion: (version: StyleVersion) => void;
  onSelectInterpretation: (interpretation: Interpretation | null) => void;
  notice: string | null;
  onNotice: (message: string | null) => void;
  openDefault?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Apertura "intelligente": adatta in silenzio se canonica, poi apre. */
  onRequestOpen?: () => void;
  isCanonical?: boolean;
  scores: RecipeScores;
  children?: ReactNode;
}) {
  const { cms, bcp47 } = useCms();
  const fmt = createFormatter(cms.ui, bcp47);
  const [localOpen, setLocalOpen] = useState(openDefault);
  const open = controlledOpen !== undefined ? controlledOpen : localOpen;
  const setOpen = controlledOnOpenChange !== undefined ? controlledOnOpenChange : setLocalOpen;
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);

  useBodyScrollLock(open);

  useEffect(() => {
    const attr = "data-recipe-setup-open";
    if (!open) return;
    const previous = document.body.getAttribute(attr);
    document.body.setAttribute(attr, "true");
    return () => {
      if (previous === null) {
        document.body.removeAttribute(attr);
      } else {
        document.body.setAttribute(attr, previous);
      }
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const frame = window.requestAnimationFrame(() => {
      closeButtonRef.current?.focus();
    });
    return () => window.cancelAnimationFrame(frame);
  }, [open]);

  useEffect(() => {
    if (!notice) return;
    const timeout = window.setTimeout(() => onNotice(null), 2200);
    return () => window.clearTimeout(timeout);
  }, [notice, onNotice]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, setOpen]);

  const interpretations = useMemo(
    () => getInterpretationsForStyle(style.id),
    [style.id],
  );
  const activeInterpretation = activeInterpretationId
    ? interpretations.find((item) => item.id === activeInterpretationId) ??
      getInterpretationById(activeInterpretationId)
    : null;

  const tempLabel = localizedFermentTempLabel(cms, customFermentTemp);
  const durationLabel = fmt.durationMinutes(customFermentHours * 60);
  const activeVersionLabel = activeVersion
    ? localizedVersionLabel(cms, activeVersion.label)
    : cmsMessage(cms, "recipeSetup.styleBase", "stile base");
  const summary = [
    activeVersionLabel,
    activeInterpretation ? interpretationName(activeInterpretation) : null,
    `${fmt.percent(customHydration)} · W${customFlourW} · ${durationLabel} · ${tempLabel}`,
  ]
    .filter(Boolean)
    .join(" · ");

  const triggerSubtitle = notice
    ? notice
    : isCanonical
      ? cmsMessage(cms, "recipeSetup.triggerCanonical", "Adatta idratazione, lievitazione e cottura alla tua cucina")
      : summary;
  const triggerAction = isCanonical ? cms.ui.customizeParams : cms.ui.modify;

  return (
    <section>
      <div
        className="overflow-hidden rounded-2xl border border-[var(--recipe-setup-border)] transition-all duration-200 hover:border-[var(--tertiary)] hover:shadow-sm"
        style={{
          background: "var(--recipe-setup-bg)",
        }}
      >
        <button
          onClick={() => (onRequestOpen ? onRequestOpen() : setOpen(true))}
          className="w-full flex items-center gap-3 px-5 py-4 text-left active:scale-[0.99] transition-all duration-200 hover:bg-[color-mix(in srgb,var(--text-default)_2%,transparent)] group"
          style={{
            background: "transparent",
            border: "none",
            color: "var(--text-default)",
            cursor: "pointer",
          }}
          aria-expanded={open}
          aria-haspopup="dialog"
        >
          <span
            className="flex items-center justify-center rounded-xl flex-shrink-0 group-hover:scale-110 transition-transform duration-200"
            style={{
              width: 38,
              height: 38,
              background: "var(--recipe-setup-icon-bg)",
              color: "var(--recipe-setup-icon)",
            }}
          >
            <Sparkles size={17} />
          </span>
          <span className="flex-1 min-w-0">
            <span
              className="block"
              style={{
                fontSize: "var(--font-size-lg)",
                fontWeight: "var(--weight-semibold)" as any,
                lineHeight: "var(--leading-tight)",
              }}
            >
              {cms.ui.customizeParams}
            </span>
            <motion.span
              key={triggerSubtitle}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="block truncate"
              style={{
                fontSize: "var(--font-size-md)",
                color: notice ? "var(--text-accent)" : "var(--text-muted)",
                lineHeight: "var(--leading-normal)",
                marginTop: 2,
              }}
            >
              {triggerSubtitle}
            </motion.span>
          </span>
          <span
            className="hidden sm:inline-flex rounded-full px-3 py-1"
            style={{
              color: "var(--recipe-setup-action-text)",
              background: "var(--recipe-setup-action-bg)",
              fontSize: "var(--font-size-md)",
              fontWeight: "var(--weight-semibold)" as any,
            }}
          >
            {triggerAction}
          </span>
          <span
            className="inline-flex"
            style={{ color: "var(--text-muted)" }}
          >
            <ChevronDown size={17} style={{ transform: "rotate(-90deg)" }} />
          </span>
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[80] flex items-end justify-center overscroll-contain sm:items-center sm:px-4 sm:py-5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              background: "var(--dialog-scrim-strong)",
              backdropFilter: "blur(20px) saturate(1.4)",
              WebkitBackdropFilter: "blur(20px) saturate(1.4)",
            }}
            onClick={() => setOpen(false)}
          >
            <motion.section
              role="dialog"
              aria-modal="true"
              aria-labelledby="recipe-setup-title"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 350, damping: 34 }}
              className="w-full h-[92dvh] max-h-[92dvh] sm:h-[min(760px,88vh)] sm:max-h-[88vh] sm:max-w-[1160px] rounded-t-[2.5rem] sm:rounded-[2rem] border-0 sm:border overflow-hidden flex flex-col"
              style={{
                background: "color-mix(in srgb, var(--container-page) 92%, transparent)",
                color: "var(--text-default)",
                borderColor: "var(--container-border)",
                boxShadow: "var(--dialog-shadow)",
                backdropFilter: "blur(24px) saturate(1.6)",
                WebkitBackdropFilter: "blur(24px) saturate(1.6)",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header — stable toolbar */}
              <div
                className="flex-shrink-0 px-5 py-3 sm:px-7 sm:py-3.5 border-b"
                style={{ borderColor: "var(--container-border-subtle)" }}
              >
                <div className="flex items-start gap-3">
                  <div className="min-w-0 flex-1">
                    <h2
                      id="recipe-setup-title"
                      className="truncate"
                      style={{
                        fontSize: "clamp(1.125rem, 4.6vw, var(--font-size-2xl))",
                        fontWeight: "var(--weight-bold)" as any,
                        margin: 0,
                        lineHeight: "var(--leading-tight)",
                      }}
                    >
                      {cms.ui.customizeParams}
                    </h2>
                    {scores && (
                      <div className="mt-2 sm:hidden">
                        <MatchSummary scores={scores} />
                      </div>
                    )}
                  </div>

                  {scores && (
                    <MatchSummary
                      scores={scores}
                      className="hidden min-w-0 flex-1 justify-end sm:flex"
                    />
                  )}

                  <button
                    ref={closeButtonRef}
                    type="button"
                    onClick={() => setOpen(false)}
                    className="flex items-center justify-center rounded-full hover:bg-[color-mix(in srgb,var(--text-default)_10%,transparent)] hover:text-[var(--text-default)] active:scale-90 transition-all duration-150 flex-shrink-0"
                    style={{
                      width: 36,
                      height: 36,
                      background: "var(--container-bg-low)",
                      border: "1px solid var(--container-border)",
                      color: "var(--text-muted)",
                      cursor: "pointer",
                    }}
                    aria-label={cms.ui.close}
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-4 sm:px-8 sm:py-5 flex flex-col gap-4">
                {notice && (
                  <div
                    className="rounded-xl px-3 py-2"
                    style={{
                      background: "var(--recipe-setup-feedback-bg)",
                      color: "var(--recipe-setup-feedback-text)",
                      fontSize: "var(--font-size-md)",
                      fontWeight: "var(--weight-semibold)" as any,
                    }}
                  >
                    {notice}
                  </div>
                )}

                <div
                  className="rounded-2xl p-4 sm:p-5 flex flex-col gap-3.5"
                  style={{
                    background: "color-mix(in srgb, var(--tertiary) 4%, var(--surface-container-low))",
                    border: "1px solid color-mix(in srgb, var(--tertiary) 10%, var(--container-border-subtle))",
                  }}
                >
                  <div className="flex flex-col gap-1">
                    <span
                      style={{
                        color: "var(--tertiary)",
                        fontSize: "var(--font-size-xs)",
                        fontWeight: "var(--weight-bold)" as any,
                        letterSpacing: "var(--tracking-spread)",
                        textTransform: "uppercase",
                      }}
                    >
                      {cmsMessage(cms, "recipeSetup.profileLabel", "Profilo impasto")}
                    </span>
                    <span className="type-body" style={{ color: "var(--text-muted)", lineHeight: "1.4" }}>
                      Scegli un preset bilanciato dai nostri pizzaioli o un'interpretazione d'autore per configurare l'impasto.
                    </span>
                  </div>
                  <PremiumSelect
                    value={
                      activeInterpretationId
                        ? `interpretation-${activeInterpretationId}`
                        : activeVersion
                          ? `version-${activeVersion.id}`
                          : ""
                    }
                    onChange={(val) => {
                      if (val.startsWith("version-")) {
                        const versionId = val.replace("version-", "");
                        const version = versions.find((v) => v.id === versionId);
                        if (version) {
                          onSelectVersion(version);
                        }
                      } else if (val.startsWith("interpretation-")) {
                        const interpretationId = val.replace("interpretation-", "");
                        const interpretation = interpretations.find((i) => i.id === interpretationId);
                        if (interpretation) {
                          onSelectInterpretation(interpretation);
                        }
                      }
                    }}
                    groups={[
                      {
                        label: cmsMessage(cms, "recipeSetup.dough", "Impasto"),
                        options: versions.map((version) => ({
                          value: `version-${version.id}`,
                          label: localizedVersionLabel(cms, version.label),
                          subLabel: `${fmt.percent(version.params.hydration_pct)} idr. · W${version.params.flour_w}`,
                        })),
                      },
                      ...(interpretations.length > 0
                        ? [
                            {
                              label: cms.misc.signatureLabel || "Firma",
                              options: interpretations.map((interpretation) => ({
                                value: `interpretation-${interpretation.id}`,
                                label: interpretationName(interpretation),
                              })),
                            },
                          ]
                        : []),
                    ]}
                  />
                </div>

                {children && (
                  <div
                    className="pt-4"
                    style={{ borderTop: "1px solid var(--recipe-setup-border-subtle)" }}
                  >
                    {children}
                  </div>
                )}
              </div>

              {/* Footer — azione di conferma sempre raggiungibile */}
              <div
                className="flex-shrink-0 flex items-center justify-end gap-3 px-5 pt-3.5 pb-[max(0.875rem,env(safe-area-inset-bottom))] sm:px-8 sm:pb-3.5 border-t"
                style={{ borderColor: "var(--container-border-subtle)" }}
              >
                <CtaButton
                  type="button"
                  onClick={() => setOpen(false)}
                  className="w-full sm:w-auto px-7 py-3 active:scale-[0.98]"
                  style={{ fontSize: "var(--font-size-lg)" }}
                >
                  {cmsMessage(cms, "recipeSetup.done", "Fatto")}
                </CtaButton>
              </div>
            </motion.section>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

/* ═══ MATCH SUMMARY — punteggio compatto per l'header della modale ═══ */
function MatchSummary({
  scores,
  className,
}: {
  scores: RecipeScores;
  className?: string;
}) {
  const { cms } = useCms();
  const roundedScore = Math.round(scores.composite);
  const tone = matchTone(roundedScore, "adapted");
  const axes = SCORE_DIMENSIONS.map((dimension) => ({
    key: dimension.key,
    color: dimension.color,
    label: cms.scoreDimensions[dimension.key]?.label ?? dimension.label,
    shortLabel: cms.scoreDimensions[dimension.key]?.short ?? dimension.short,
    value: scores[dimension.key],
  }));

  const toneColor = tone.low ? "var(--text-warning)" : "var(--text-accent)";
  const MatchIcon = tone.low ? HeartCrack : Heart;

  return (
    <div className={`flex items-center gap-2.5 sm:gap-3 ${className ?? ""}`}>
      {/* Label "Match" */}
      <div className="flex items-center" style={{ color: "var(--text-muted)", fontSize: "var(--font-size-sm)" }}>
        <span style={{ fontWeight: "var(--weight-semibold)" as any, textTransform: "uppercase", fontSize: "var(--font-size-xs)", letterSpacing: "var(--tracking-spread)" }}>Match</span>
      </div>

      {/* Punteggio — chip colorato per lettura immediata */}
      <span
        className="flex items-center gap-1.5 rounded-full px-2.5 py-1.5 flex-shrink-0 type-numeric"
        style={{
          background: `color-mix(in srgb, ${toneColor} 14%, transparent)`,
          color: toneColor,
          fontWeight: "var(--weight-bold)" as any,
          lineHeight: 1,
        }}
        title={tone.title}
      >
        <MatchIcon size={14} style={{ color: toneColor }} fill={tone.low ? "none" : toneColor} />
        <span style={{ fontSize: "var(--font-size-xl)" }}>{roundedScore}</span>
      </span>

      {/* Assi — da lg in su */}
      <div
        className="hidden lg:flex items-center gap-3 pl-3"
        style={{ borderLeft: "1px solid var(--container-border-subtle)" }}
      >
        {axes.map((axis) => {
          const val = Math.round(axis.value);
          return (
            <div key={axis.key} className="flex flex-col gap-1 min-w-[64px]">
              <div className="flex items-center justify-between" style={{ fontSize: "var(--font-size-xs)", fontWeight: "var(--weight-semibold)" as any, color: "var(--text-muted)" }}>
                <span title={axis.label}>{axis.shortLabel}</span>
                <span className="type-numeric">{val}</span>
              </div>
              <div className="h-1 rounded-full overflow-hidden" style={{ background: "var(--container-bg-high)" }}>
                <div className="h-full rounded-full" style={{ background: axis.color, width: `${val}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function interpretationName(interpretation: Interpretation): string {
  return (
    interpretation.author ??
    interpretation.pizzeria ??
    interpretation.organization ??
    interpretation.signature_name ??
    "Interpretazione"
  );
}

/* ═══ NOT FOUND ═══ */
function RecipeNotFound({ styleId }: { styleId?: string }) {
  const { cms } = useCms();
  const location = useLocation();
  const exploreBackTo = readExploreBackTo(location.state);
  return (
    <main
      id="main-content"
      className="min-h-screen flex items-center justify-center px-6"
      style={{
        background: "var(--container-page)",
        color: "var(--text-default)",
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          type: "spring",
          stiffness: 400,
          damping: 30,
        }}
        className="text-center"
      >
        <Heading level="page">
          {cms.pages.recipeStyleNotFound}
        </Heading>
        <p
          className="font-serif italic mt-2"
          style={{
            fontSize: "var(--font-size-xl-5)",
            color: "var(--text-muted)",
            opacity: 0.65,
          }}
        >
          {cms.pages.recipeStyleNotFoundDesc.replace(
            "{id}",
            styleId || "?",
          )}
        </p>
        <CtaButton
          as={Link}
          to={exploreBackTo}
          className="mt-6 px-5 py-2.5"
          style={{ fontSize: "var(--font-size-xl)" }}
        >
          <ChevronLeft size={16} />
          {cms.pages.recipeExploreStyles}
        </CtaButton>
      </motion.div>
    </main>
  );
}
