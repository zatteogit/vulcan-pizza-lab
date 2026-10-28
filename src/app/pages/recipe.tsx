import { SaveRecipeDialog, useRecipeSave } from "../features/recipe/save-recipe-dialog";
import { recipeDisplayName } from "../domain/recipe-reference";
import { buildGeneratedRecipe, recipeFromEntry, canonicalRecipeEntry, recipePresetState, optimizeSelectedRecipe, isRecipePresetModified } from "../use-cases/recipe-entry";
import { scoreWeightsFromCms } from "../features/recipe/kitchen-compatibility";
/* === RECIPE PAGE — VPL-058 + VPL-064 ===
   Pagina ricetta self-contained per stile.
   Route: /recipe/:styleId?h=62&w=280&pl=0.6&f=24&t=4&n=4&pf=1&oven=wood&temp=450
   Legge il profilo da localStorage, override opzionali da URL params.
   "Copia link" genera URL condivisibile con parametri correnti. */

import {
Bookmark,
Sparkles,
} from "lucide-react";
import {
useCallback,
useEffect,
useMemo,
useState,
} from "react";
import { useLocation,useNavigate,useParams,useSearchParams } from "react-router";
import { useCms,type CmsContent } from "../features/cms/cms-context";
import { engineMsgTexts } from "../features/recipe/engine-msg-text";
import { loadProfileDefaults, profileEquipment } from "../hooks/use-profile-defaults";
import { t as tpl } from "../features/cms/i18n";
import {
getInterpretationById,
getInterpretationsForStyle,
type Interpretation
} from "../data/interpretation-library";
import {
pantryFlourRange,
PIZZA_FAMILIES,
STYLES_DB,
YEAST_LABELS,
defaultPanShape,
getDefaultDoughBalls,
MAX_DOUGH_BALLS,
thermalViability,
type EngineMsg,
type GeneratedRecipe,
type OvenType,
type PanConfig,
  type PreFermentChoice,
type PizzaStyle,
type SkillLevel,
type UserConstraints
} from "../domain/pizza-engine";
import { styleWithSelectedTopping } from "../hooks/use-recipe-state";
import {
RecipeConfigurator,
} from "../features/recipe/recipe-configurator";
import { RecipeLearningPanel } from "../features/recipe/recipe-learning-panel";
import { SaveFailedNotice } from "../features/recipe/save-failed-notice";
import { BRAND } from "../config/brand";
import { deriveFeedbackCorrections, loadFeedback } from "../features/recipe/feedback-store";
import { RecipeMatchCard } from "../features/recipe/recipe-match-card";
import { InterpretationSwitcher } from "../features/recipe/interpretation-narrative-card";
import {
type RecipePrimaryTab,
} from "../features/recipe/recipe-section-tabs";
import { RecipeSetupPanel } from "../features/recipe/recipe-setup-panel";
import { RecipeStatStrip } from "../features/recipe/recipe-stat-strip";
import { RecipeView } from "../features/recipe/recipe-view";
import { decodePan, encodePan } from "../features/recipe/pan-url";
import { decodePreFermentChoice, writePreFermentChoice } from "../features/recipe/pre-ferment-url";
import { STYLE_PHOTOS } from "../features/recipe/recommended-styles";
import { ConfirmDialog } from "../components/ds/index";
import { NotFoundState } from "../components/shared/not-found-state";
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
  renameSavedRecipe,
  type SavedRecipeParams,
} from "../adapters/browser/saved-recipes-storage";
import { normalizeRecipeName, recipeSourceUrl } from "../data/saved-recipes";
import { uiMessage } from "../i18n/ui-messages";

const FALLBACK =
  "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&q=80";

const TAILORING_PARAM_KEYS = [
  "h",
  "hb",
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

  return <RecipeContent key={style.id} style={style} cms={cms} />;
}

/* ═══ RECIPE CONTENT ═══ */
function RecipeContent({
  style,
  cms,
}: {
  style: PizzaStyle;
  cms: any;
}) {
  const { bcp47 } = useCms();
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
  /* Audit n. 11 (C-03): adattata alla propria cucina vuol dire anche con la
     propria impastatrice e le proprie superfici. La canonica no: è la scheda
     dello stile, uguale per tutti. */
  const [personalEquipment] = useState(() => profileEquipment(loadProfileDefaults().constraints));
  // Storage bloccato (navigazione privata, cookie disattivati): getItem lancia.
  const nerdAvailable = loadJson<boolean>("vulcan_nerd_on") === true;
  const initialRecipeMode = readRecipeMode(searchParams);
  const [recipeMode, setRecipeMode] = useState<RecipeMode>(initialRecipeMode);
  const [recipeName, setRecipeName] = useState<string | undefined>(() => normalizeRecipeName(searchParams.get("name")));
  const useTailoredUrlParams = initialRecipeMode !== "canonical";

  /* ── Compute style defaults ──
   * Versione attiva: URL param ?v=... ha priorità, poi default skill-aware.
   * Fallback al centro del range quando lo stile non ha versioni. */
  const skillLevel = savedSkill ?? loadProfileDefaults().constraints.skill_level;
  const urlInterpretationId = searchParams.get("interpretation");
  /* Default variante (round 6, nota Matteo): se lo stile ha una variante
     "legata a doppio filo" (verified_canonical: i disciplinari AVPN/IGP/
     APITER), è LEI la selezione di partenza — mai una firma d'autore. */
  const canonicalEntry = canonicalRecipeEntry(style);
  const styleCanonicalVariant = canonicalEntry.interpretation;
  const initialInterpretation: Interpretation | null = urlInterpretationId
    ? (getInterpretationById(urlInterpretationId) ?? null)
    : initialRecipeMode === "canonical" ? styleCanonicalVariant : null;
  const urlVersionId = searchParams.get("v");
  const initialVersion: StyleVersion | null =
    (urlVersionId && getVersionById(urlVersionId)) ||
    (initialInterpretation
      ? null
      : initialRecipeMode === "canonical"
        ? canonicalEntry.version
        : hasTailoringParams(searchParams) ? null : getDefaultVersion(style.id, skillLevel));

  const initialPresetEntry = canonicalRecipeEntry(style, undefined, initialInterpretation, initialVersion);
  const initialOptions = initialPresetEntry.options;
  const hCenter = initialOptions.customHydration!;
  const wCenter = initialOptions.customFlourW!;
  const fOptimal = initialOptions.customFermentationHours!;
  const fTempDefault = initialOptions.customFermentationTempC!;
  const plDefault = initialOptions.customFlourPL!;
  const preFermentDefault = initialOptions.usePreFerment!;

  /* Il forno della cucina prevale anche sui link condivisi. Un link descrive
   * una ricetta, non dimostra che chi lo apre possieda un forno più potente. */
  const resolvedOvenType: OvenType = savedOven?.ovenType ?? "home";
  const physicalOvenCapacity = savedOven?.maxTemp ?? 250;
  const resolvedOvenTemp = useTailoredUrlParams ? Math.min(physicalOvenCapacity, numParam(searchParams, "temp", physicalOvenCapacity, 100, 500)) : physicalOvenCapacity;

  /* ── State: constraints (from profile + URL override) ── */
  const [constraints, setConstraints] = useState<UserConstraints>(() => ({
    ...loadProfileDefaults().constraints,
    oven_type: resolvedOvenType,
    oven_max_temp_c: resolvedOvenTemp,
    oven_capacity_temp_c: physicalOvenCapacity,
    dough_balls: getDefaultDoughBalls(style),
  }));

  /* ── State: recipe params (from style preset/center + URL override) ── */
  const [customHydration, setCustomHydration] = useState(
    useTailoredUrlParams ? numParam(searchParams, "h", hCenter, 30, 120) : hCenter,
  );
  const [customFlourW, setCustomFlourW] = useState(
    useTailoredUrlParams ? numParam(searchParams, "w", wCenter, 100, 500) : wCenter,
  );
  /* VPL-B2 — mix di farine editabile (quote/W per componente). Copia dallo stile. */
  const [customFlourBlend, setCustomFlourBlend] = useState<
    { name: string; pct: number; w?: number }[] | undefined
  >(() => initialOptions.customFlourBlend);
  const [customFlourPL, setCustomFlourPL] = useState(
    useTailoredUrlParams ? numParam(searchParams, "pl", plDefault, 0.2, 1.5) : plDefault,
  );
  const [customSalt, setCustomSalt] = useState(
    useTailoredUrlParams ? numParam(searchParams, "s", initialOptions.customSalt!, 1, 4) : initialOptions.customSalt!,
  );
  const [customFermentHours, setCustomFermentHours] = useState(
    useTailoredUrlParams ? numParam(searchParams, "f", fOptimal, 1, 120) : fOptimal,
  );
  const [customFermentTemp, setCustomFermentTemp] = useState(
    useTailoredUrlParams ? numParam(searchParams, "t", fTempDefault, 0, 35) : fTempDefault,
  );
  /* D-043: biga o poolish e quota di farina scelti (vuoto = quelli dello stile). */
  const [preFermentChoice, setPreFermentChoice] = useState<PreFermentChoice>(() =>
    useTailoredUrlParams ? decodePreFermentChoice(searchParams) : {},
  );
  const [usePreFerment, setUsePreFerment] = useState(() => {
    const pf = searchParams.get("pf");
    return useTailoredUrlParams && pf !== null ? pf === "1" : preFermentDefault;
  });
  const [panConfig, setPanConfig] = useState<PanConfig>(() => {
    const base: PanConfig = {
      panShape: defaultPanShape(style),
      panLength: style.shape.length_cm,
      panWidth: style.shape.width_cm,
      panDiameter: style.shape.diameter_cm,
      thickness: style.shape.thickness_factor,
    };
    // Audit n. 16: la teglia del link (ricetta salvata o condivisa).
    const fromUrl = useTailoredUrlParams ? decodePan(searchParams.get("pan")) : null;
    if (!fromUrl) return base;
    return {
      panShape: fromUrl.panShape ?? base.panShape,
      panLength: fromUrl.panLength ?? base.panLength,
      panWidth: fromUrl.panWidth ?? base.panWidth,
      panDiameter: fromUrl.panDiameter ?? base.panDiameter,
      thickness: fromUrl.thickness ?? base.thickness,
      ...(fromUrl.ballWeightG !== undefined ? { ballWeightG: fromUrl.ballWeightG } : {}),
    };
  });
  const [doughBalls, setDoughBalls] = useState(
    useTailoredUrlParams
      ? numParam(searchParams, "n", getDefaultDoughBalls(style), 1, MAX_DOUGH_BALLS)
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
        style.default_topping_ref ?? null;
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

  /* ENG-6: idratazione scelta da «Ottimizza per me» con la compensazione del
   * forno (base del candidato e valore finale). Finché lo slider resta sul
   * valore finale la ricetta si ricostruisce come l'ha valutata l'ottimizzatore,
   * con la compensazione dichiarata nel riquadro tecnico. */
  const [optimizedHydration, setOptimizedHydration] = useState<{
    base: number;
    final: number;
  } | null>(() => useTailoredUrlParams && searchParams.has("hb")
    ? { base: numParam(searchParams, "hb", customHydration, 30, 120), final: customHydration } : null);

  /* ═══ Modello "dirty" (redesign lug 2026) ═══
     L'originale è UNO: la canonica dello stile (o la firma attiva, che
     ridefinisce il canone). canonicalTargets = esattamente ciò che "Torna
     all'originale" ripristina; isDirty = i parametri attuali se ne
     discostano. Invariante: Salva/Torna compaiono ⇔ Torna cambierebbe
     qualcosa. Anche firma d'origine (eyebrow) e trend seguono isDirty —
     aprire il pannello senza toccare nulla NON personalizza. */
  const originalEntry = useMemo(() => canonicalRecipeEntry(style, undefined,
    activeInterpretationId ? getInterpretationById(activeInterpretationId) ?? null : activeVersion ? null : undefined, activeVersion ?? undefined),
    [style, activeInterpretationId, activeVersion]);
  const referencePreset = recipePresetState(style, originalEntry.version, originalEntry.interpretation);
  const isDirty = isRecipePresetModified(referencePreset, {
    hydration: customHydration, flourW: customFlourW, flourPL: customFlourPL, salt: customSalt,
    fermentHours: customFermentHours, fermentTemp: customFermentTemp, usePreFerment,
    preFerment: preFermentChoice, panConfig, toppingConcept: selectedToppingConcept, flourBlend: customFlourBlend,
  }) || Math.min(constraints.oven_max_temp_c, style.baking.temp_c_ideal) !== Math.min(constraints.oven_capacity_temp_c ?? constraints.oven_max_temp_c, style.baking.temp_c_ideal);

  const applyPreset = useCallback((version: StyleVersion | null, interpretation: Interpretation | null) => {
    setRecipeName("");
    const p = recipePresetState(style, version, interpretation);
    setRecipeMode("canonical");
    setCustomHydration(p.hydration); setCustomFlourW(p.flourW); setCustomFlourPL(p.flourPL);
    setCustomSalt(p.salt); setCustomFermentHours(p.fermentHours); setCustomFermentTemp(p.fermentTemp);
    setUsePreFerment(p.usePreFerment); setPreFermentChoice({}); setPanConfig(p.panConfig);
    setCustomFlourBlend(p.flourBlend); setSelectedToppingConcept(p.toppingConcept);
    setActiveVersionId(version?.id ?? null); setActiveInterpretationId(interpretation?.id ?? null);
    setOptimizedHydration(null); setLastOptimization(null);
    setConstraints(current => ({ ...current, oven_max_temp_c: Math.min(style.baking.temp_c_ideal, current.oven_capacity_temp_c ?? current.oven_max_temp_c) }));
    const next = new URLSearchParams(); next.set("mode", "canonical");
    if (version) next.set("v", version.id);
    if (interpretation) next.set("interpretation", interpretation.id);
    replaceRecipeSearchParams(params => { for (const key of [...params.keys()]) params.delete(key); next.forEach((value,key)=>params.set(key,value)); });
  }, [style]);
  const handleVersionSelect = useCallback((version: StyleVersion) => applyPreset(version, null), [applyPreset]);
  const handleInterpretationSelect = useCallback((interpretation: Interpretation | null) => {
    const e = canonicalRecipeEntry(style);
    applyPreset(interpretation ? null : e.version, interpretation ?? e.interpretation);
  }, [style, applyPreset]);

  /* Audit Sprint 12 — Scroll a inizio pagina quando si atterra sulla scheda
   * (era a metà perché il browser ripristina la posizione di scroll precedente). */
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [style.id]);

  const writeTailoredParams = useCallback(
    (params: URLSearchParams) => {
      if (recipeMode !== "canonical") params.set("mode", recipeMode);
      params.set("h", String(customHydration));
      if (optimizedHydration && customHydration === optimizedHydration.final) params.set("hb", String(optimizedHydration.base));
      else params.delete("hb");
      params.set("w", String(customFlourW));
      params.set("pl", String(customFlourPL));
      params.set("f", String(customFermentHours));
      params.set("t", String(customFermentTemp));
      params.set("n", String(doughBalls));
      if (usePreFerment) params.set("pf", "1");
      else params.delete("pf");
      writePreFermentChoice(params, preFermentChoice);
      params.set("oven", constraints.oven_type);
      params.set("temp", String(constraints.oven_max_temp_c));
      const pan = encodePan(panConfig);
      if (pan) params.set("pan", pan);
      if (Math.abs(customSalt - style.dough.salt_pct) > 0.01) params.set("s", String(customSalt));
      else params.delete("s");
    },
    [
      panConfig,
      customSalt,
      style.dough.salt_pct,
      recipeMode,
      customHydration,
      optimizedHydration,
      activeInterpretationId,
      customFlourW,
      customFlourPL,
      customFermentHours,
      customFermentTemp,
      doughBalls,
      usePreFerment,
      preFermentChoice,
      constraints.oven_type,
      constraints.oven_max_temp_c,
    ],
  );

  /* ── Computed share URL (VPL-064) ── */
  const shareUrl = useMemo(() => {
    const params = new URLSearchParams();
    params.set("mode", recipeMode);
    if (recipeName) { params.set("name", recipeName); params.set("tab", "ricetta"); }
    if (activeVersionId) params.set("v", activeVersionId);
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
    recipeName,
    activeVersionId,
    activeInterpretationId,
    selectedToppingConcept,
    writeTailoredParams,
    style.id,
    style.default_topping_ref,
    ]);

  const buildRecipe = useCallback(
    (recipeConstraints: UserConstraints): GeneratedRecipe => {
      return buildGeneratedRecipe({
        style, constraints: recipeConstraints, scoreWeights: scoreWeightsFromCms(cms),
        customHydration, customFlourW, customFermentHours, customFermentTemp, usePreFerment,
        preFermentChoice, customFlourPL, customSalt, panConfig, activeVersion,
        activeInterpretationId, selectedToppingConcept, customFlourBlend, optimizedHydration,
      });
    },
    [
      style,
      customHydration,
      optimizedHydration,
      customSalt,
      activeInterpretationId,
      customFlourW,
      customFermentHours,
      customFermentTemp,
      usePreFerment,
      preFermentChoice,
      customFlourPL,
      panConfig,
      cms.scoreDimensions,
      activeVersion,
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
        oven_capacity_temp_c: savedOven?.maxTemp ?? 250,
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
      oven_capacity_temp_c: savedOven?.maxTemp ?? 250,
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
    const opt = optimizeSelectedRecipe(
      styleWithSelectedTopping(style, selectedToppingConcept),
      matchConstraints, optScoreWeights, panConfig, activeVersion, activeInterpretationId,
    ).recipe;
    const hard = thermalViability(style, opt.oven_temp_c) < 1;
    const softNeeds: string[] = [];
    if (opt.verdict.conditions?.some(c => c.kind === "flour" && c.status === "missing")) {
      const covered = matchConstraints.pantry_flours.some((id) => {
        const rng = pantryFlourRange(matchConstraints, id);
        return rng && opt.flour_w >= rng[0] - 1 && opt.flour_w <= rng[1] + 1;
      });
      if (!covered) softNeeds.push(tpl(cms.cooking.needFlour, { w: opt.flour_w }));
    }
    if (
      matchConstraints.pantry_inventory_complete === true && matchConstraints.pantry_yeasts.length > 0 &&
      !matchConstraints.pantry_yeasts.includes(opt.yeast_type)
    ) {
      softNeeds.push(
        (cms.yeastLabels?.[opt.yeast_type] ?? YEAST_LABELS[opt.yeast_type] ?? opt.yeast_type).toLowerCase(),
      );
    }
    return { value: opt.scores.composite, hard, softNeeds, outcome: opt.verdict.outcome, recipe: opt };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [style, selectedToppingConcept, matchConstraints, panConfig, cms.scoreDimensions, cms.cooking.needFlour, cms.yeastLabels, activeVersion, activeInterpretationId]);

  const [lastOptimization, setLastOptimization] = useState<{
    params: { hydration: number; flour_w: number; fermentation_hours: number; fermentation_temp_c: number; use_pre_ferment: boolean };
    rationale: EngineMsg[];
  } | null>(null);

  const handleOptimize = useCallback(() => {
    const o = optimizeSelectedRecipe(
      styleWithSelectedTopping(style, selectedToppingConcept),
      matchConstraints, optScoreWeights, panConfig, activeVersion, activeInterpretationId,
    );
    // "Ottimizza per me" = il movimento completo verso su-misura: porta il forno
    // alla TUA cucina (come faceva il vecchio "adatta") E sceglie i parametri
    // migliori. Così il forno mostrato nei parametri = il tuo, non l'ideale.
    const personalOvenType = matchConstraints.oven_type;
    const personalOvenTemp = matchConstraints.oven_max_temp_c;
    setRecipeMode("adapted");
    setConstraints(matchConstraints);
    setCustomHydration(o.params.hydration);
    setCustomFlourW(o.params.flour_w);
    setCustomFlourPL(o.recipe.flour_pl);
    setCustomSalt(o.recipe.baker_pcts?.salt ?? o.recipe.style.dough.salt_pct);
    setCustomFlourBlend(o.recipe.flour_blend?.map(({name,pct,w})=>({name,pct,w})));
    setPreFermentChoice({});
    setCustomFermentHours(o.params.fermentation_hours);
    setCustomFermentTemp(o.params.fermentation_temp_c);
    setUsePreFerment(o.params.use_pre_ferment);
    setOptimizedHydration(
      o.params.hydration_compensated
        ? { base: o.params.hydration_base, final: o.params.hydration }
        : null,
    );
    setLastOptimization({ params: o.params, rationale: o.rationale });
    replaceRecipeSearchParams((next) => {
      next.set("mode", "adapted");
      if (activeInterpretationId) next.set("interpretation", activeInterpretationId);
      else next.delete("interpretation");
      if (activeVersionId) next.set("v", activeVersionId);
      else next.delete("v");
      if (o.params.hydration_compensated) next.set("hb", String(o.params.hydration_base));
      else next.delete("hb");
      next.set("pl", String(o.recipe.flour_pl));
      next.delete("s");
      next.delete("pft");
      next.delete("pfp");
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
  }, [style, selectedToppingConcept, matchConstraints, panConfig, cms.scoreDimensions, savedOven?.ovenType, savedOven?.maxTemp, activeVersion, activeInterpretationId]);

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
  const feedbackCorrection = useMemo(
    () => deriveFeedbackCorrections(style.id, loadFeedback()),
    [style.id],
  );
  const showFeedbackPanel = false;
  const applyFeedbackCorrection = useCallback(() => {
    if (!feedbackCorrection) return;
    // Applicare una correzione = personalizzare: esci dal canonico e tieni il TUO
    // forno (come handleOptimize), così l'occhiello passa da "canonica" a su-misura
    // e il forno non salta all'ideale.
    setRecipeMode("adapted");
    setConstraints((c) => ({
      ...c,
      ...personalEquipment,
      oven_type: savedOven?.ovenType ?? "home",
      oven_max_temp_c: savedOven?.maxTemp ?? 250,
      oven_capacity_temp_c: savedOven?.maxTemp ?? 250,
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [feedbackCorrection, style.id, savedOven?.ovenType, savedOven?.maxTemp]);

  /* R31 — salvataggio della versione corrente nel ricettario personale.
     Salviamo i parametri (non il risultato): al riapri la ricetta si rigenera. */
  const currentSaveParams = useMemo<SavedRecipeParams>(
    () => ({
      hydration: customHydration,
      salt: customSalt,
      hydrationBase: optimizedHydration && customHydration === optimizedHydration.final ? optimizedHydration.base : undefined,
      interpretationId: activeInterpretationId,
      flourW: customFlourW,
      flourPL: customFlourPL,
      fermentHours: customFermentHours,
      fermentTemp: customFermentTemp,
      usePreFerment,
      preFerment: preFermentChoice,
      doughBalls,
      ovenType: effectiveConstraints.oven_type,
      ovenTemp: effectiveConstraints.oven_max_temp_c,
      panConfig,
      selectedToppingConcept,
    }),
    [
      customHydration,
      optimizedHydration,
      customSalt,
      activeInterpretationId,
      customFlourW,
      customFlourPL,
      customFermentHours,
      customFermentTemp,
      usePreFerment,
      preFermentChoice,
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
  const resolvedRecipeName = recipeName ?? normalizeRecipeName(savedEntry?.name) ?? "";
  // U-10 (F15): il titolo della scheda dice quale ricetta è (RouteTitle salta /recipe).
  useEffect(() => {
    document.title = `${resolvedRecipeName || recipeDisplayName(recipe ?? matchRecipe, effectiveConstraints.oven_type)} · ${BRAND.name}`;
  }, [recipe, matchRecipe, effectiveConstraints.oven_type, resolvedRecipeName]);

  useEffect(() => {
    if (recipeName === undefined && savedEntry?.name) setRecipeName(normalizeRecipeName(savedEntry.name));
  }, [recipeName, savedEntry]);
  const [saveFailed, setSaveFailed] = useState(false);
  const closeSaveFailed = useCallback(() => setSaveFailed(false), []);
  /** true se il ricettario ora riflette la scelta; false se la scrittura è
   *  fallita (storage pieno o bloccato): lo si dice con SaveFailedNotice. */
  const handleRenameRecipe = useCallback((next: string): boolean => {
    const name = normalizeRecipeName(next) ?? "";
    if (savedEntry && !renameSavedRecipe(savedEntry.id, name)) { setSaveFailed(true); return false; }
    setRecipeName(name);
    replaceRecipeSearchParams(params => { if (name) params.set("name", name); else params.delete("name"); });
    setSavedTick(tick => tick + 1);
    return true;
  }, [savedEntry]);
  const handleCommitRecipe = useCallback((nextName?: string): boolean => {
    let ok = true;
    if (savedEntry) {
      removeRecipe(savedEntry.id);
    } else {
      saveRecipe({
        styleId: style.id,
        styleName: recipeDisplayName(recipe ?? matchRecipe, effectiveConstraints.oven_type),
        name: normalizeRecipeName(nextName ?? resolvedRecipeName),
        versionId: activeVersionId,
        params: currentSaveParams,
        score: Math.round(matchRecipe.scores.composite),
      });
      ok = findSavedRecipe(style.id, currentSaveParams) !== undefined;
      setSaveFailed(!ok);
      if (ok && nextName !== undefined) {
        const name = normalizeRecipeName(nextName) ?? "";
        setRecipeName(name);
        replaceRecipeSearchParams(params => { if (name) params.set("name", name); else params.delete("name"); });
      }
    }
    setSavedTick((v) => v + 1);
    return ok;
  }, [savedEntry, style.id, style.name, activeVersionId, currentSaveParams, recipe, matchRecipe, effectiveConstraints.oven_type, resolvedRecipeName]);

  const styleVersions = useMemo(() => getVersions(style.id), [style.id]);
  /* Firma d'origine (redesign lug 2026): l'eyebrow dice l'origine UNA volta,
     con il copy dei poli ("Ricetta canonica" / "Su misura per te") e identità
     cromatica fissa (terracotta / salvia) via eyebrowTone. */
  const originInterpretation = activeInterpretationId ? getInterpretationById(activeInterpretationId) : null;
  const referenceName = originInterpretation?.author ?? originInterpretation?.pizzeria ?? originInterpretation?.organization ??
    (activeVersion ? cmsMessage(cms, `version.label.${activeVersion.label}`, activeVersion.label) : style.name);
  const recipeSource = {
    href: recipeSourceUrl(style.id, activeVersionId, activeInterpretationId),
    name: referenceName === style.name ? style.name : `${style.name} · ${referenceName}`,
  };
  const saveFlow = useRecipeSave({ personalized: isDirty || Boolean(resolvedRecipeName), saved: Boolean(savedEntry), onCommit: handleCommitRecipe });
  const handleToggleSaveRecipe = () => saveFlow.requestSave();
  const recipeTabLabel =
    recipeMode === "lab"
      ? cmsMessage(cms, "recipeMode.lab", "Laboratorio")
      : isDirty || resolvedRecipeName
        ? cms.ui.scoreBasisTailored
        : cms.ui.scoreBasisOriginal;

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
    applyPreset(originalEntry.version, originalEntry.interpretation);
    setSetupNotice(null);
  }, [applyPreset, originalEntry]);

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
      <SaveFailedNotice open={saveFailed} onClose={closeSaveFailed} cms={cms} />
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
        eyebrowTone={isDirty || resolvedRecipeName ? "tailored" : "canonical"}
        shareUrl={shareUrl}
        showStickyHeader={false}
        favorite={Boolean(savedEntry)}
        onToggleFavorite={handleToggleSaveRecipe}
        isPersonalized={isDirty}
        onRequestPersonalization={handleOpenPersonalization}
        onResetToOriginal={isDirty || resolvedRecipeName ? handleResetToCanonical : undefined}
        resetLabel={cms.ui.recipeResetPreset}
        resetTitle={referenceName}
        recipeName={resolvedRecipeName}
        recipeSource={recipeSource}
        onRenameRecipe={isDirty || resolvedRecipeName ? handleRenameRecipe : undefined}
        selectedToppingConcept={selectedToppingConcept}
        onSelectTopping={(recipeId) => {
          const toppingRecipe = TOPPING_LIBRARY[recipeId];
          setSetupNotice(uiMessage("pages.recipe.ingredientsUpdated", [
            toppingRecipe?.name ?? uiMessage("pages.recipe.defaultTopping"),
    ]));
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
            <div className="recipe-view-match-layout" data-region="recipe-summary">
            <div className="recipe-view-match-primary" data-slot="recipe-parameters">
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
                  style={recipe.style}
                  referenceStyle={style}
                  constraints={constraints}
                  onConstraintsChange={(c) => {
                    markAdapted();
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
                  preFermentChoice={preFermentChoice}
                  onPreFermentChoiceChange={(v) => {
                    markAdapted();
                    setPreFermentChoice(v);
                  }}
                  customSalt={customSalt}
                  onSaltChange={(v) => {
                    markAdapted();
                    setCustomSalt(v);
                  }}
                  panConfig={panConfig}
                  onPanConfigChange={(config) => {markAdapted(); setPanConfig(config);}}
                />
              </RecipeSetupPanel>
            </div>
            <aside
              className="recipe-view-match-shoulder"
              data-slot="recipe-shoulder"
              aria-label={cms.ui.recipeScore}
            >
            <RecipeMatchCard
              scores={matchRecipe.scores}
              ovenTemp={matchRecipe.oven_temp_c}
              idealTemp={style.baking.temp_c_ideal}
              minTemp={style.baking.temp_c_range[0]}
              mode={recipeMode === "lab" ? "lab" : isDirty ? "adapted" : "canonical"}
              dirty={isDirty}
              onCreate={() => navigate(`/crea?style=${encodeURIComponent(style.id)}`)}
              onPersonalize={handleOpenPersonalization}
              onOptimize={ceilingInfo.outcome === "not_feasible" ||
                (recipe?.verdict.outcome !== "not_feasible" && (isOptimized || optimizeGain < 2))
                ? undefined : handleOptimize}
              optimizationRationale={
                isOptimized && lastOptimization
                  ? engineMsgTexts(lastOptimization.rationale, cms, bcp47)
                  : undefined
              }
              optimizationPreview={ceilingInfo.recipe}
              originalRecipe={recipeFromEntry(originalEntry, matchConstraints, scoreWeightsFromCms(cms))}
              ceiling={ceilingInfo.value}
              hardLimited={ceilingInfo.hard}
              softNeeds={ceilingInfo.softNeeds}
              onSave={handleToggleSaveRecipe}
              saved={Boolean(savedEntry)}
              nerdMode={effectiveNerdMode}
              verdictRecipe={recipe ?? undefined}
              verdictConstraints={effectiveConstraints}
            />
            </aside>
            </div>
          </>
        }
        introExtraSlot={
          <button
            type="button"
            onClick={() => setLearningOpen(true)}
            className="recipe-page__learn-more-btn"
          >
            {cms.cooking.learnMore}
          </button>
        }
        recipeControls={
          <div className="recipe-page__recipe-controls">
            {/* F2 — "Vulcan ha imparato dai tuoi tentativi" (opt-in, trasparente) */}
            {showFeedbackPanel && feedbackCorrection && (
              <div className="recipe-page__feedback">
                <div className="recipe-page__feedback-head">
                  <Sparkles size={15} />
                  <span className="recipe-page__feedback-title">
                    {tpl(
                      cms.cooking.learnedFromAttempts ??
                        "Ho imparato dai tuoi {n} tentativi",
                      { n: feedbackCorrection.sampleSize },
                    )}
                  </span>
                </div>
                <ul className="recipe-page__feedback-list">
                  {feedbackCorrection.notes.map((n, i) => (
                    <li key={i} className="recipe-page__feedback-item">
                      • {n}
                    </li>
                  ))}
                </ul>
                {(feedbackCorrection.hydrationDelta !== 0 ||
                  feedbackCorrection.fermentMultiplier !== 1) && (
                  <button
                    type="button"
                    onClick={applyFeedbackCorrection}
                    className="recipe-page__feedback-cta"
                  >
                    <Sparkles size={14} />{" "}
                    {cms.cooking.applyCorrections ?? uiMessage("pages.recipe.applyCorrections")}
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

      <SaveRecipeDialog open={saveFlow.open} onClose={saveFlow.cancel} onConfirm={saveFlow.confirm}
        defaultName={resolvedRecipeName || recipeDisplayName(recipe ?? matchRecipe, effectiveConstraints.oven_type)} source={recipeSource} />

      {/* ── Avviso uscita: modifiche non salvate ── */}
      <ConfirmDialog
        open={exitConfirm}
        onDismiss={() => setExitConfirm(false)}
        ariaLabel={cms.cooking.unsavedTitle ?? uiMessage("shared.unsavedChanges")}
        icon={<Bookmark size={26} />}
        title={cms.cooking.unsavedTitle ?? uiMessage("shared.unsavedChanges")}
        body={tpl(
          cms.cooking.unsavedBody ??
            "Se esci ora, la tua versione di {style} andrà persa. Vuoi salvarla nel ricettario?",
          { style: style.name },
        )}
        actions={[
          {
            label: cms.cooking.saveVersion,
            onClick: () => {
              setExitConfirm(false);
              saveFlow.requestSave(() => navigate(exploreBackTo));
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
    <NotFoundState
      title={cms.pages.recipeStyleNotFound}
      subtitle={cms.pages.recipeStyleNotFoundDesc.replace("{id}", styleId || "?")}
      backTo={exploreBackTo}
      backLabel={cms.pages.recipeExploreStyles}
      searchLabel={cms.pages.notFoundSearch}
    />
  );
}
