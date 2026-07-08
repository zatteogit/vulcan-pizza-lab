/* === RECIPE PAGE — VPL-058 + VPL-064 ===
   Pagina ricetta self-contained per stile.
   Route: /recipe/:styleId?h=62&w=280&pl=0.6&f=24&t=4&n=4&pf=1&oven=wood&temp=450
   Legge il profilo da localStorage, override opzionali da URL params.
   "Copia link" genera URL condivisibile con parametri correnti. */

import {
Bookmark,
ChevronLeft,
Sparkles,
} from "lucide-react";
import { motion } from "motion/react";
import {
useCallback,
useEffect,
useMemo,
useRef,
useState,
} from "react";
import { Link,useLocation,useNavigate,useParams,useSearchParams } from "react-router";
import { useCms,type CmsContent } from "../features/cms/cms-context";
import { t as tpl } from "../features/cms/i18n";
import {
getInterpretationById,
getInterpretationsForStyle,
type Interpretation
} from "../data/interpretation-library";
import {
FLOUR_W_RANGES,
OVEN_PRESETS,
PIZZA_FAMILIES,
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
type SkillLevel,
type UserConstraints
} from "../domain/pizza-engine";
import {
RecipeConfigurator,
applyVersionParams,
} from "../features/recipe/recipe-configurator";
import { RecipeLearningPanel } from "../features/recipe/recipe-learning-panel";
import { deriveFeedbackCorrections, loadFeedback } from "../features/recipe/feedback-store";
import { RecipeMatchCard } from "../features/recipe/recipe-match-card";
import { InterpretationSwitcher } from "../features/recipe/interpretation-narrative-card";
import {
type RecipePrimaryTab,
} from "../features/recipe/recipe-section-tabs";
import { RecipeSetupPanel } from "../features/recipe/recipe-setup-panel";
import { RecipeStatStrip } from "../features/recipe/recipe-stat-strip";
import { RecipeView } from "../features/recipe/recipe-view";
import { STYLE_PHOTOS } from "../features/recipe/recommended-styles";
import { ConfirmDialog, CtaButton, Heading } from "../components/ds/index";
import {
getDefaultVersion,
getVersionById,
getVersions,
type StyleVersion,
} from "../data/style-versions";
import { useStylesOverride } from "../context/styles-override-context";
import { resolveTopping, TOPPING_LIBRARY } from "../data/topping-library";
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
  const navigate = useNavigate();
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
  /* Default variante (round 6, nota Matteo): se lo stile ha una variante
     "legata a doppio filo" (verified_canonical: i disciplinari AVPN/IGP/
     APITER), è LEI la selezione di partenza — mai una firma d'autore. */
  const styleCanonicalVariant =
    getInterpretationsForStyle(style.id).find((it) => it.verified_canonical) ??
    null;
  const initialInterpretation: Interpretation | null = urlInterpretationId
    ? (getInterpretationById(urlInterpretationId) ?? null)
    : styleCanonicalVariant;
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
  /* Redesign lug 2026: niente bozze/parcheggi — all'uscita con modifiche non
     salvate si avvisa e basta. */
  const [exitConfirm, setExitConfirm] = useState(false);
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

  /* ═══ Modello "dirty" (redesign lug 2026) ═══
     L'originale è UNO: la canonica dello stile (o la firma attiva, che
     ridefinisce il canone). canonicalTargets = esattamente ciò che "Torna
     all'originale" ripristina; isDirty = i parametri attuali se ne
     discostano. Invariante: Salva/Torna compaiono ⇔ Torna cambierebbe
     qualcosa. Anche firma d'origine (eyebrow) e trend seguono isDirty —
     aprire il pannello senza toccare nulla NON personalizza. */
  const canonicalTargets = useMemo(() => {
    const overrides = activeInterpretationId
      ? getInterpretationById(activeInterpretationId)?.parameter_overrides
      : undefined;
    const canonicalVersion = activeInterpretationId
      ? null
      : getCanonicalVersion(style.id);
    const fMidBase = Math.min(
      Math.round(
        (style.dough.fermentation_hours_range[0] +
          style.dough.fermentation_hours_range[1]) /
          2,
      ),
      48,
    );
    const base = {
      hydration:
        canonicalVersion?.params.hydration_pct ??
        Math.round(
          (style.dough.hydration_pct_range[0] +
            style.dough.hydration_pct_range[1]) /
            2,
        ),
      flourW:
        canonicalVersion?.params.flour_w ??
        Math.round(
          (style.dough.flour_w_range[0] + style.dough.flour_w_range[1]) / 2,
        ),
      flourPL: canonicalVersion?.params.flour_pl ?? defaultPL(style),
      fermentHours: canonicalVersion?.params.fermentation_hours ?? fMidBase,
      fermentTemp:
        canonicalVersion?.params.fermentation_temp_c ??
        defaultFermentTempC(style, fMidBase),
      preFerment:
        canonicalVersion?.params.use_pre_ferment ?? style.requires_pre_ferment,
      salt: style.dough.salt_pct,
      versionId: canonicalVersion?.id ?? null,
    };
    if (overrides) {
      if (overrides.hydration_pct !== undefined) base.hydration = overrides.hydration_pct;
      if (overrides.flour_w !== undefined) base.flourW = overrides.flour_w;
      if (overrides.flour_pl !== undefined) base.flourPL = overrides.flour_pl;
      if (overrides.fermentation_hours !== undefined) base.fermentHours = overrides.fermentation_hours;
      if (overrides.fermentation_temp_c !== undefined) base.fermentTemp = overrides.fermentation_temp_c;
      if (overrides.use_pre_ferment !== undefined) base.preFerment = overrides.use_pre_ferment;
    }
    return base;
  }, [style, activeInterpretationId]);

  const isDirty =
    customHydration !== canonicalTargets.hydration ||
    customFlourW !== canonicalTargets.flourW ||
    Math.abs(customFlourPL - canonicalTargets.flourPL) > 0.001 ||
    customFermentHours !== canonicalTargets.fermentHours ||
    customFermentTemp !== canonicalTargets.fermentTemp ||
    usePreFerment !== canonicalTargets.preFerment ||
    Math.abs(customSalt - canonicalTargets.salt) > 0.01;

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
      /* Invariante "selezionare una firma NON è dirty": i parametri NON
         overridati tornano alla base della firma (stessi fallback di
         canonicalTargets), altrimenti si ereditano avanzi della selezione
         precedente e i trend si accendono da soli (fix 4 lug 2026). */
      const o = interpretation.parameter_overrides;
      const fMidBase = Math.min(
        Math.round(
          (style.dough.fermentation_hours_range[0] +
            style.dough.fermentation_hours_range[1]) /
            2,
        ),
        48,
      );
      setCustomHydration(
        o?.hydration_pct ??
          Math.round(
            (style.dough.hydration_pct_range[0] +
              style.dough.hydration_pct_range[1]) /
              2,
          ),
      );
      setCustomFlourW(
        o?.flour_w ??
          Math.round(
            (style.dough.flour_w_range[0] + style.dough.flour_w_range[1]) / 2,
          ),
      );
      setCustomFlourPL(o?.flour_pl ?? defaultPL(style));
      setCustomFermentHours(o?.fermentation_hours ?? fMidBase);
      setCustomFermentTemp(
        o?.fermentation_temp_c ?? defaultFermentTempC(style, fMidBase),
      );
      setUsePreFerment(o?.use_pre_ferment ?? style.requires_pre_ferment);
      setCustomSalt(style.dough.salt_pct);
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
    // panConfig passato all'optimizer: senza, su stili in teglia il soffitto
    // era calcolato su una teglia diversa da quella mostrata → "Ottimizza"
    // poteva ABBASSARE il punteggio (bug reso visibile dal modello dirty).
    const opt = optimizeRecipe(style, matchConstraints, undefined, panConfig, optScoreWeights).recipe;
    const hard = thermalViability(style, opt.oven_temp_c) < 1;
    const softNeeds: string[] = [];
    if (matchConstraints.pantry_flours.length > 0) {
      const covered = matchConstraints.pantry_flours.some((id) => {
        const rng = FLOUR_W_RANGES[id];
        return rng && opt.flour_w >= rng[0] - 1 && opt.flour_w <= rng[1] + 1;
      });
      if (!covered) softNeeds.push(tpl(cms.cooking.needFlour, { w: opt.flour_w }));
    }
    if (
      matchConstraints.pantry_yeasts.length > 0 &&
      !matchConstraints.pantry_yeasts.includes(opt.yeast_type)
    ) {
      softNeeds.push(
        (cms.yeastLabels?.[opt.yeast_type] ?? YEAST_LABELS[opt.yeast_type] ?? opt.yeast_type).toLowerCase(),
      );
    }
    return { value: opt.scores.composite, hard, softNeeds };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [style, matchConstraints, panConfig, cms.scoreDimensions, cms.cooking.needFlour, cms.yeastLabels]);

  const [lastOptimization, setLastOptimization] = useState<{
    params: { hydration: number; flour_w: number; fermentation_hours: number; fermentation_temp_c: number; use_pre_ferment: boolean };
    rationale: EngineMsg[];
  } | null>(null);

  const handleOptimize = useCallback(() => {
    const o = optimizeRecipe(style, matchConstraints, undefined, panConfig, optScoreWeights);
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
  }, [style, matchConstraints, panConfig, cms.scoreDimensions, savedOven?.ovenType, savedOven?.maxTemp]);

  /* "Ottimizza per me" ha senso solo se c'è margine: già all'ottimo (anche
     via deep-link) o a soffitto raggiunto, il bottone sparisce — la riga
     soffitto spiega perché (fix 4 lug 2026, nota Matteo). */
  const optimizeGain =
    Math.round(ceilingInfo.value) - Math.round(matchRecipe.scores.composite);

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
  /* Firma d'origine (redesign lug 2026): l'eyebrow dice l'origine UNA volta,
     con il copy dei poli ("Ricetta canonica" / "Su misura per te") e identità
     cromatica fissa (terracotta / salvia) via eyebrowTone. */
  const recipeTabLabel =
    recipeMode === "lab"
      ? cmsMessage(cms, "recipeMode.lab", "Laboratorio")
      : isDirty
        ? cms.cooking.recipeAdapted
        : cmsMessage(cms, "recipeMode.canonical", cms.cooking.recipeCanonical);

  /* Photo */
  const photo =
    cms.media?.stylePhotos?.[style.id] ||
    STYLE_PHOTOS[style.id] ||
    FALLBACK;

  const cmsFamilyName =
    cms.families?.[style.family]?.name ||
    PIZZA_FAMILIES[style.family]?.name ||
    "";

  /* "Personalizza": apre il dialog e basta. NIENTE adattamento silenzioso —
     la ricetta diventa personalizzata solo quando l'utente cambia davvero un
     parametro (isDirty), non quando apre il pannello (nota Matteo lug 2026). */
  const handleOpenPersonalization = useCallback(() => {
    setSetupPanelOpen(true);
  }, []);

  /* Un parametro toccato a mano = si esce dal polo canonico (per URL/share);
     l'evidenza visiva (eyebrow, trend, Salva/Torna) segue però isDirty. */
  const markAdapted = useCallback(() => {
    setRecipeMode((mode) => (mode === "canonical" ? "adapted" : mode));
  }, []);

  /* "Torna all'originale": ripristina ESATTAMENTE canonicalTargets — così
     l'invariante regge (dopo il reset, isDirty è false per costruzione). */
  const handleResetToCanonical = useCallback(() => {
    setRecipeMode("canonical");
    setConstraints((current) => ({
      ...current,
      oven_type: style.baking.oven_type_required,
      oven_max_temp_c: style.baking.temp_c_ideal,
      dough_balls: getDefaultDoughBalls(style),
    }));
    setDoughBalls(getDefaultDoughBalls(style));
    setSetupNotice(null);

    setCustomHydration(canonicalTargets.hydration);
    setCustomFlourW(canonicalTargets.flourW);
    setCustomFlourPL(canonicalTargets.flourPL);
    setCustomFermentHours(canonicalTargets.fermentHours);
    setCustomFermentTemp(canonicalTargets.fermentTemp);
    setUsePreFerment(canonicalTargets.preFerment);
    setCustomSalt(canonicalTargets.salt);
    setActiveVersionId(canonicalTargets.versionId);
    setLastOptimization(null);

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
    canonicalTargets,
  ]);

  /* ═══ Uscita con modifiche non salvate (redesign lug 2026) ═══
     Niente bozze: se la ricetta è modificata e non salvata, il back avvisa
     e offre di salvarla; altrimenti si esce e basta. */
  const handleBack = useCallback(() => {
    if (isDirty && !savedEntry) {
      setExitConfirm(true);
      return;
    }
    navigate(exploreBackTo);
  }, [isDirty, savedEntry, navigate, exploreBackTo]);

  const styleInterpretations = useMemo(
    () => getInterpretationsForStyle(style.id),
    [style.id],
  );

  if (!recipe) return null;

  return (
    <main id="main-content" data-region="page">
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
        back={{ label: (cms.pages as any).navExplore || cms.pages.recipeBackToStyles, onClick: handleBack }}
        recipeTabLabel={cms.cooking.tabRecipe}
        eyebrow={recipeTabLabel}
        eyebrowTone={isDirty ? "tailored" : "canonical"}
        shareUrl={shareUrl}
        showStickyHeader={false}
        isPersonalized={isDirty}
        onRequestPersonalization={handleOpenPersonalization}
        onResetToOriginal={isDirty ? handleResetToCanonical : undefined}
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
          <>
            {/* Round 4-5 (note Matteo): ordine Ispirazione → parametri →
                match. Chip e tabella sono UN'unità (10px); il verdetto
                respira (24px). */}
            <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2.5">
            <InterpretationSwitcher
              interpretations={styleInterpretations}
              activeId={activeInterpretationId}
              onSelect={handleInterpretationSelect}
              defaultInterpretation={styleCanonicalVariant}
            />
            <RecipeStatStrip
              recipe={recipe}
              isPersonalized={isDirty}
            />
            {/* Il dialog Personalizza: si apre dal pulsante sulla match card
                (niente trigger proprio — nota Matteo lug 2026). */}
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
                isCanonical={!isDirty}
                openDefault={openPersonalizeByDefault}
                scores={matchRecipe.scores}
                hideTrigger
                recipe={recipe}
              >
                <RecipeConfigurator
                  style={style}
                  constraints={constraints}
                  onConstraintsChange={(c) => {
                    setConstraints(c);
                    if (c.dough_balls !== doughBalls) setDoughBalls(c.dough_balls);
                  }}
                  customHydration={customHydration}
                  onHydrationChange={(v) => {
                    markAdapted();
                    setCustomHydration(v);
                  }}
                  customFlourW={customFlourW}
                  onFlourWChange={(v) => {
                    markAdapted();
                    setCustomFlourW(v);
                  }}
                  customFermentHours={customFermentHours}
                  onFermentHoursChange={(v) => {
                    markAdapted();
                    setCustomFermentHours(v);
                  }}
                  customFermentTemp={customFermentTemp}
                  onFermentTempChange={(v) => {
                    markAdapted();
                    setCustomFermentTemp(v);
                  }}
                  usePreFerment={usePreFerment}
                  onPreFermentChange={(v) => {
                    markAdapted();
                    setUsePreFerment(v);
                  }}
                  customSalt={customSalt}
                  onSaltChange={(v) => {
                    markAdapted();
                    setCustomSalt(v);
                  }}
                  panConfig={panConfig}
                  onPanConfigChange={setPanConfig}
                />
              </RecipeSetupPanel>
            </div>
            <RecipeMatchCard
              scores={matchRecipe.scores}
              ovenTemp={matchConstraints.oven_max_temp_c}
              idealTemp={style.baking.temp_c_ideal}
              minTemp={style.baking.temp_c_range[0]}
              mode={recipeMode === "lab" ? "lab" : isDirty ? "adapted" : "canonical"}
              dirty={isDirty}
              onPersonalize={handleOpenPersonalization}
              onOptimize={isOptimized || optimizeGain < 2 ? undefined : handleOptimize}
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
              nerdMode={effectiveNerdMode}
            />
            </div>
          </>
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
          <div className="flex flex-col gap-3">
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
                    {tpl(
                      cms.cooking.learnedFromAttempts ??
                        "Ho imparato dai tuoi {n} tentativi",
                      { n: feedbackCorrection.sampleSize },
                    )}
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
                    <Sparkles size={14} />{" "}
                    {cms.cooking.applyCorrections ?? "Applica le correzioni"}
                  </button>
                )}
              </div>
            )}
          </div>
        }
      />
      <RecipeLearningPanel
        open={learningOpen}
        style={style}
        familyName={cmsFamilyName}
        onClose={() => setLearningOpen(false)}
      />

      {/* ── Avviso uscita: modifiche non salvate ── */}
      <ConfirmDialog
        open={exitConfirm}
        onDismiss={() => setExitConfirm(false)}
        ariaLabel={cms.cooking.unsavedTitle ?? "Modifiche non salvate"}
        icon={<Bookmark size={26} />}
        title={cms.cooking.unsavedTitle ?? "Modifiche non salvate"}
        body={tpl(
          cms.cooking.unsavedBody ??
            "Se esci ora, la tua versione di {style} andrà persa. Vuoi salvarla nel ricettario?",
          { style: style.name },
        )}
        actions={[
          {
            label: cms.cooking.saveVersion,
            onClick: () => {
              handleToggleSaveRecipe();
              setExitConfirm(false);
              navigate(exploreBackTo);
            },
            variant: "cta",
          },
          {
            label: cms.cooking.unsavedDiscard ?? "Esci senza salvare",
            onClick: () => {
              setExitConfirm(false);
              navigate(exploreBackTo);
            },
            variant: "secondary",
          },
        ]}
      />
    </main>
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
