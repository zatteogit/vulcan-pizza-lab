import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import type { CmsContent } from "../features/cms/cms-context";
import {
  getInterpretationById,
  type Interpretation,
} from "../data/interpretation-library";
import {
  defaultPanShape,
  defaultFermentTempC,
  generateRecipe,
  maxFermentationHoursForWindow,
  optimizeRecipe,
  type OptimizedRecipe,
  type GeneratedRecipe,
  type PanConfig,
  type PizzaStyle,
  type PreFermentChoice,
  type ScoreWeightsOverride,
  type UserConstraints,
  type VersionRangeOverrides,
} from "../domain/pizza-engine";
import { applyStyleVersion } from "../use-cases/apply-style-version";
import {
  getVersions,
  type StyleVersion,
} from "../data/style-versions";
import { resolveTopping } from "../data/topping-library";

export type RecipeMode = "canonical" | "adapted" | "lab";

export interface RecipeInitialState {
  mode?: RecipeMode;
  version?: StyleVersion | null;
  interpretation?: Interpretation | null;
  hydration?: number;
  flourW?: number;
  flourPL?: number;
  fermentHours?: number;
  fermentTemp?: number;
  usePreFerment?: boolean;
  preFerment?: PreFermentChoice;
  panConfig?: PanConfig;
  toppingConcept?: string | null;
  flourBlend?: { name: string; pct: number; w?: number }[];
}

interface UseRecipeStateArgs {
  style: PizzaStyle | null;
  cms: CmsContent;
  initial?: RecipeInitialState | null;
  defaultAvailableHours?: number;
  /** ENG-4 — vincoli correnti, con meal_deadline se c'è un orario del pasto:
   *  i parametri «centro dello stile» (stato iniziale, interpretazione) ne
   *  tengono conto per far stare la timeline nella finestra. */
  windowConstraints?: UserConstraints;
}

interface ResetStyleOptions {
  mode?: RecipeMode;
  availableHours?: number;
  /** ENG-4 — vincoli con l'orario del pasto per il reset (vedi
   *  centerParamsForStyle). Assente: nessuna finestra oltre ad availableHours. */
  windowConstraints?: UserConstraints;
  preserveActiveVersion?: boolean;
  clearTopping?: boolean;
}

/** Ottimizzazione con compensazione d'idratazione del forno (ENG-6): la base
 *  del candidato e l'idratazione finale mostrata nello slider. */
interface OptimizedHydration {
  base: number;
  final: number;
}

interface RecipeBuildParams {
  style: PizzaStyle;
  cms: CmsContent;
  constraints: UserConstraints;
  customHydration: number;
  customFlourW: number;
  customFermentHours: number;
  customFermentTemp: number;
  usePreFerment: boolean;
  preFermentChoice: PreFermentChoice;
  customFlourPL: number;
  customSalt: number;
  panConfig: PanConfig;
  activeVersion: StyleVersion | null;
  activeInterpretationId: string | null;
  selectedToppingConcept: string | null;
  customFlourBlend?: { name: string; pct: number; w?: number }[];
  optimizedHydration?: OptimizedHydration | null;
}

export function defaultRecipePL(style: PizzaStyle | null): number {
  if (!style) return 0.55;
  return (
    Math.round(
      ((style.dough.flour_pl_range[0] + style.dough.flour_pl_range[1]) / 2) *
        100,
    ) / 100
  );
}

function defaultRecipePanConfig(style: PizzaStyle): PanConfig {
  return {
    panShape: defaultPanShape(style),
    panLength: style.shape.length_cm,
    panWidth: style.shape.width_cm,
    panDiameter: style.shape.diameter_cm,
    thickness: style.shape.thickness_factor,
  };
}

/* Stile con il condimento scelto: vive in kitchen-compatibility (puro, senza
   React, così lo usa anche il server MCP del Worker). */
export { styleWithSelectedTopping } from "../features/recipe/kitchen-compatibility";
import { styleWithSelectedTopping } from "../features/recipe/kitchen-compatibility";

/* Esportata (redesign lug 2026): è la definizione del polo "originale" del
   Crea — serve anche a home.tsx per calcolare isDirty in modo speculare al
   reset ("Torna all'originale").
   ENG-4: con windowConstraints e un orario del pasto (meal_deadline) la
   fermentazione si ferma dove la timeline intera sta ancora nella finestra,
   come fanno il motore e l'ottimizzatore. Passare lo stile con il condimento
   che sarà attivo (styleWithSelectedTopping). */
export function centerParamsForStyle(
  style: PizzaStyle,
  availableHours: number,
  windowConstraints?: UserConstraints,
) {
  const fMin = style.dough.fermentation_hours_range[0];
  const fMax = style.dough.fermentation_hours_range[1];
  let fermentHours = Math.min(Math.round((fMin + fMax) / 2), availableHours);
  if (windowConstraints?.meal_deadline) {
    fermentHours = Math.min(
      fermentHours,
      maxFermentationHoursForWindow(style, windowConstraints, {
        usePreFerment: style.requires_pre_ferment,
      }),
    );
  }
  return {
    hydration: Math.round(
      (style.dough.hydration_pct_range[0] +
        style.dough.hydration_pct_range[1]) /
        2,
    ),
    flourW: Math.round(
      (style.dough.flour_w_range[0] + style.dough.flour_w_range[1]) / 2,
    ),
    flourPL: defaultRecipePL(style),
    fermentHours,
    // Audit role-play giugno 2026 (F4): usa il default style-aware del motore —
    // la UI duplicava `hours>12?4:22` e scavalcava il fix, mostrando 4°C anche
    // sugli stili diretti a TA (Napoletana STG). Ora coerente col motore.
    fermentTemp: defaultFermentTempC(style, fermentHours),
    usePreFerment: style.requires_pre_ferment,
  };
}

function resolveInitialState(
  style: PizzaStyle,
  initial: RecipeInitialState | null | undefined,
  availableHours: number,
  windowConstraints?: UserConstraints,
) {
  const version = initial?.version ?? null;
  const interpretation = initial?.interpretation ?? null;
  const overrides = interpretation?.parameter_overrides;
  const selectedToppingConcept = (() => {
    const raw =
      initial?.toppingConcept ??
      interpretation?.base_topping_concept_id ??
      style.default_topping_ref ??
      null;
    if (!raw) return null;
    const resolved = resolveTopping(raw, style);
    return resolved ? resolved.id : raw;
  })();
  const centered = centerParamsForStyle(
    styleWithSelectedTopping(style, selectedToppingConcept),
    availableHours,
    windowConstraints,
  );

  return {
    recipeMode: initial?.mode ?? "adapted",
    customHydration:
      initial?.hydration ??
      overrides?.hydration_pct ??
      version?.params.hydration_pct ??
      centered.hydration,
    customFlourW:
      initial?.flourW ??
      overrides?.flour_w ??
      version?.params.flour_w ??
      centered.flourW,
    customFlourPL:
      initial?.flourPL ??
      overrides?.flour_pl ??
      version?.params.flour_pl ??
      centered.flourPL,
    customSalt: style.dough.salt_pct,
    customFermentHours:
      initial?.fermentHours ??
      overrides?.fermentation_hours ??
      version?.params.fermentation_hours ??
      centered.fermentHours,
    customFermentTemp:
      initial?.fermentTemp ??
      overrides?.fermentation_temp_c ??
      version?.params.fermentation_temp_c ??
      centered.fermentTemp,
    usePreFerment:
      initial?.usePreFerment ??
      overrides?.use_pre_ferment ??
      version?.params.use_pre_ferment ??
      centered.usePreFerment,
    preFermentChoice: initial?.preFerment ?? {},
    panConfig: initial?.panConfig ?? defaultRecipePanConfig(style),
    activeVersionId: version?.id ?? null,
    activeInterpretationId: interpretation?.id ?? null,
    selectedToppingConcept,
    customFlourBlend:
      initial?.flourBlend ?? style.dough.flour_blend?.map((c) => ({ ...c })),
  };
}

function buildGeneratedRecipe({
  style,
  cms,
  constraints,
  customHydration,
  customFlourW,
  customFermentHours,
  customFermentTemp,
  usePreFerment,
  preFermentChoice,
  customFlourPL,
  customSalt,
  panConfig,
  activeVersion,
  activeInterpretationId,
  selectedToppingConcept,
  customFlourBlend,
  optimizedHydration,
}: RecipeBuildParams): GeneratedRecipe {
  const scoreWeights: ScoreWeightsOverride = {
    authenticity: cms.scoreDimensions?.authenticity?.weight,
    feasibility: cms.scoreDimensions?.feasibility?.weight,
    digestibility: cms.scoreDimensions?.digestibility?.weight,
    sustainability: cms.scoreDimensions?.sustainability?.weight,
    experimentation: cms.scoreDimensions?.experimentation?.weight,
  };
  const versionOverrides: VersionRangeOverrides | undefined = activeVersion
    ? {
        ...activeVersion.ranges,
        ...(activeVersion.params.dough_weight_g !== undefined
          ? { dough_weight_g: activeVersion.params.dough_weight_g }
          : {}),
      }
    : undefined;
  const styleWithTopping = styleWithSelectedTopping(style, selectedToppingConcept);
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

  const options = {
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
    preFerment: preFermentChoice,
  };
  // ENG-6: finché l'idratazione è quella scelta dall'ottimizzatore, la ricetta
  // si ricostruisce come l'ha valutata lui: base + compensazione del forno,
  // dichiarata in science.compensations. Se l'utente sposta lo slider il
  // valore torna a essere una scelta sua, senza compensazione.
  if (optimizedHydration && customHydration === optimizedHydration.final) {
    const compensated = generateRecipe(styleWithTopping, constraints, {
      ...options,
      customHydration: optimizedHydration.base,
      compensateCustomHydration: true,
    });
    if (compensated.hydration_pct === optimizedHydration.final) return compensated;
  }
  return generateRecipe(styleWithTopping, constraints, options);
}

export function useRecipeState({
  style,
  cms,
  initial,
  defaultAvailableHours = 48,
  windowConstraints,
}: UseRecipeStateArgs) {
  // Solo per i valori iniziali degli useState: calcolato una volta (con un
  // orario del pasto centerParamsForStyle genera una ricetta sonda).
  const [resolvedInitial] = useState(() =>
    style
      ? resolveInitialState(style, initial, defaultAvailableHours, windowConstraints)
      : null,
  );
  const [recipeMode, setRecipeMode] = useState<RecipeMode>(
    resolvedInitial?.recipeMode ?? "adapted",
  );
  const [customHydration, setCustomHydration] = useState(
    resolvedInitial?.customHydration ?? 60,
  );
  const [customFlourW, setCustomFlourW] = useState(
    resolvedInitial?.customFlourW ?? 250,
  );
  const [customFlourPL, setCustomFlourPL] = useState(
    resolvedInitial?.customFlourPL ?? defaultRecipePL(style),
  );
  const [customSalt, setCustomSalt] = useState(
    resolvedInitial?.customSalt ?? style?.dough.salt_pct ?? 2.5,
  );
  const [customFermentHours, setCustomFermentHours] = useState(
    resolvedInitial?.customFermentHours ?? 16,
  );
  const [customFermentTemp, setCustomFermentTemp] = useState(
    resolvedInitial?.customFermentTemp ?? 4,
  );
  const [usePreFerment, setUsePreFerment] = useState(
    resolvedInitial?.usePreFerment ?? false,
  );
  const [preFermentChoice, setPreFermentChoice] = useState<PreFermentChoice>(
    resolvedInitial?.preFermentChoice ?? {},
  );
  const [panConfig, setPanConfig] = useState<PanConfig>(
    resolvedInitial?.panConfig ?? {},
  );
  const [activeVersionId, setActiveVersionId] = useState<string | null>(
    resolvedInitial?.activeVersionId ?? null,
  );
  const [activeInterpretationId, setActiveInterpretationId] = useState<
    string | null
  >(resolvedInitial?.activeInterpretationId ?? null);
  const [selectedToppingConcept, setSelectedToppingConcept] = useState<
    string | null
  >(resolvedInitial?.selectedToppingConcept ?? null);
  const [customFlourBlend, setCustomFlourBlend] = useState<
    { name: string; pct: number; w?: number }[] | undefined
  >(resolvedInitial?.customFlourBlend);
  const [optimizedHydration, setOptimizedHydration] =
    useState<OptimizedHydration | null>(null);
  const previousStyleIdRef = useRef(style?.id ?? null);

  const styleVersions = useMemo(
    () => (style ? getVersions(style.id) : []),
    [style],
  );
  const activeVersion: StyleVersion | null = activeVersionId
    ? styleVersions.find((version) => version.id === activeVersionId) ?? null
    : null;

  const resetForStyle = useCallback(
    (
      nextStyle: PizzaStyle,
      nextInitial?: RecipeInitialState | null,
      availableHours = defaultAvailableHours,
      nextWindowConstraints?: UserConstraints,
    ) => {
      const next = resolveInitialState(
        nextStyle,
        nextInitial,
        availableHours,
        nextWindowConstraints,
      );
      setOptimizedHydration(null);
      setRecipeMode(next.recipeMode);
      setCustomHydration(next.customHydration);
      setCustomFlourW(next.customFlourW);
      setCustomFlourPL(next.customFlourPL);
      setCustomFermentHours(next.customFermentHours);
      setCustomFermentTemp(next.customFermentTemp);
      setUsePreFerment(next.usePreFerment);
      setPreFermentChoice(next.preFermentChoice);
      setPanConfig(next.panConfig);
      setActiveVersionId(next.activeVersionId);
      setActiveInterpretationId(next.activeInterpretationId);
      setSelectedToppingConcept(next.selectedToppingConcept);
      setCustomFlourBlend(next.customFlourBlend);
      previousStyleIdRef.current = nextStyle.id;
    },
    [defaultAvailableHours],
  );

  useEffect(() => {
    if (!style || previousStyleIdRef.current === style.id) return;
    resetForStyle(style, initial, defaultAvailableHours, windowConstraints);
  }, [defaultAvailableHours, initial, resetForStyle, style, windowConstraints]);

  const applyVersionToState = useCallback(
    (version: StyleVersion) => {
      setOptimizedHydration(null);
      applyStyleVersion(version, {
        onHydrationChange: setCustomHydration,
        onFlourWChange: setCustomFlourW,
        onFlourPLChange: (value) =>
          setCustomFlourPL(value ?? defaultRecipePL(style)),
        onFermentHoursChange: setCustomFermentHours,
        onFermentTempChange: setCustomFermentTemp,
        onPreFermentChange: setUsePreFerment,
        onVersionChange: setActiveVersionId,
      });
    },
    [style],
  );

  const selectVersion = useCallback(
    (version: StyleVersion) => {
      setRecipeMode("adapted");
      setActiveInterpretationId(null);
      applyVersionToState(version);
    },
    [applyVersionToState],
  );

  const applyInterpretationToState = useCallback(
    (interpretation: Interpretation, clearVersion = true) => {
      setRecipeMode("adapted");
      setActiveInterpretationId(interpretation.id);
      if (clearVersion) setActiveVersionId(null);
      /* Invariante "selezionare una firma NON è dirty" (fix 4 lug 2026): i
         parametri NON overridati tornano ai centri dello stile — gli stessi
         di createCanonicalTargets/reset — altrimenti si ereditano avanzi
         della selezione precedente e la firma nasce già "modificata". */
      const overrides = interpretation.parameter_overrides;
      setOptimizedHydration(null);
      if (style) {
        // ENG-4: centri con la finestra fino al pasto, sullo stile con il
        // condimento che resterà attivo dopo la scelta.
        const resolvedBase = interpretation.base_topping_concept_id
          ? resolveTopping(interpretation.base_topping_concept_id, style)
          : undefined;
        const nextTopping = interpretation.base_topping_concept_id
          ? resolvedBase?.id ?? interpretation.base_topping_concept_id
          : selectedToppingConcept;
        const centered = centerParamsForStyle(
          styleWithSelectedTopping(style, nextTopping),
          defaultAvailableHours,
          windowConstraints,
        );
        setCustomHydration(overrides?.hydration_pct ?? centered.hydration);
        setCustomFlourW(overrides?.flour_w ?? centered.flourW);
        setCustomFlourPL(overrides?.flour_pl ?? centered.flourPL);
        setCustomFermentHours(
          overrides?.fermentation_hours ?? centered.fermentHours,
        );
        setCustomFermentTemp(
          overrides?.fermentation_temp_c ?? centered.fermentTemp,
        );
        setUsePreFerment(overrides?.use_pre_ferment ?? centered.usePreFerment);
        setPreFermentChoice({});
        setCustomSalt(style.dough.salt_pct);
      } else if (overrides) {
        if (overrides.hydration_pct !== undefined)
          setCustomHydration(overrides.hydration_pct);
        if (overrides.flour_w !== undefined) setCustomFlourW(overrides.flour_w);
        if (overrides.flour_pl !== undefined)
          setCustomFlourPL(overrides.flour_pl);
        if (overrides.fermentation_hours !== undefined)
          setCustomFermentHours(overrides.fermentation_hours);
        if (overrides.fermentation_temp_c !== undefined)
          setCustomFermentTemp(overrides.fermentation_temp_c);
        if (overrides.use_pre_ferment !== undefined)
          setUsePreFerment(overrides.use_pre_ferment);
      }
      if (interpretation.base_topping_concept_id) {
        const resolved = style ? resolveTopping(interpretation.base_topping_concept_id, style) : undefined;
        setSelectedToppingConcept(resolved ? resolved.id : interpretation.base_topping_concept_id);
      }
    },
    [style, defaultAvailableHours, selectedToppingConcept, windowConstraints],
  );

  const resetToBaseRecipe = useCallback(
    (options: ResetStyleOptions = {}) => {
      if (!style) return;
      if (options.preserveActiveVersion && activeVersion) {
        applyVersionToState(activeVersion);
        return;
      }
      // ENG-4: il condimento torna al default dello stile (salvo clearTopping
      // false): la finestra si misura sullo stile con quel condimento.
      const nextTopping =
        options.clearTopping !== false
          ? style.default_topping_ref ?? null
          : selectedToppingConcept;
      const centered = centerParamsForStyle(
        styleWithSelectedTopping(style, nextTopping),
        options.availableHours ?? defaultAvailableHours,
        options.windowConstraints,
      );
      setOptimizedHydration(null);
      setRecipeMode(options.mode ?? "adapted");
      setActiveVersionId(null);
      setActiveInterpretationId(null);
      setCustomHydration(centered.hydration);
      setCustomFlourW(centered.flourW);
      setCustomFlourPL(centered.flourPL);
      setCustomFermentHours(centered.fermentHours);
      setCustomFermentTemp(centered.fermentTemp);
      setUsePreFerment(centered.usePreFerment);
      setPreFermentChoice({});
      // Redesign lug 2026: anche il sale torna al valore dello stile — così
      // dopo il reset isDirty è false per costruzione (invariante Salva/Torna).
      setCustomSalt(style.dough.salt_pct);
      setPanConfig(defaultRecipePanConfig(style));
      setLastOptimization(null);
      if (options.clearTopping !== false) {
        setSelectedToppingConcept(style.default_topping_ref ?? null);
      }
    },
    [activeVersion, applyVersionToState, defaultAvailableHours, selectedToppingConcept, style],
  );

  // Audit role-play giugno 2026: esito dell'ultima ottimizzazione ("Ottimizza per
  // me"). Tiene la rationale da mostrare in UI; si azzera al reset/cambio stile.
  const [lastOptimization, setLastOptimization] = useState<OptimizedRecipe | null>(null);

  // "Ottimizza per me": cerca i parametri che massimizzano il punteggio dati i
  // vincoli (forno/ore/skill/dispensa) e li applica allo stato, scartando
  // versione/interpretazione attive (l'ottimizzatore sceglie liberamente).
  const optimizeForConstraints = useCallback(
    (constraints: UserConstraints): OptimizedRecipe | null => {
      if (!style) return null;
      const scoreWeights: ScoreWeightsOverride = {
        authenticity: cms.scoreDimensions?.authenticity?.weight,
        feasibility: cms.scoreDimensions?.feasibility?.weight,
        digestibility: cms.scoreDimensions?.digestibility?.weight,
        sustainability: cms.scoreDimensions?.sustainability?.weight,
        experimentation: cms.scoreDimensions?.experimentation?.weight,
      };
      // Stesso stile (con il condimento scelto) della ricetta mostrata, così
      // l'overhead misurato dall'ottimizzatore è quello della timeline vera.
      const result = optimizeRecipe(
        styleWithSelectedTopping(style, selectedToppingConcept),
        constraints,
        undefined,
        panConfig,
        scoreWeights,
      );
      setActiveVersionId(null);
      setActiveInterpretationId(null);
      setRecipeMode("adapted");
      setCustomHydration(result.params.hydration);
      setCustomFlourW(result.params.flour_w);
      setCustomFermentHours(result.params.fermentation_hours);
      setCustomFermentTemp(result.params.fermentation_temp_c);
      setUsePreFerment(result.params.use_pre_ferment);
      setOptimizedHydration(
        result.params.hydration_compensated
          ? { base: result.params.hydration_base, final: result.params.hydration }
          : null,
      );
      setLastOptimization(result);
      return result;
    },
    [cms, panConfig, selectedToppingConcept, style],
  );

  const buildRecipe = useCallback(
    (constraints: UserConstraints): GeneratedRecipe | null => {
      if (!style) return null;
      return buildGeneratedRecipe({
        style,
        cms,
        constraints,
        customHydration,
        customFlourW,
        customFermentHours,
        customFermentTemp,
        usePreFerment,
        preFermentChoice,
        customFlourPL,
        customSalt,
        panConfig,
        activeVersion,
        activeInterpretationId,
        selectedToppingConcept,
        customFlourBlend,
        optimizedHydration,
      });
    },
    [
      activeInterpretationId,
      activeVersion,
      cms,
      customFermentHours,
      customFermentTemp,
      customFlourBlend,
      customFlourPL,
      customSalt,
      customFlourW,
      customHydration,
      optimizedHydration,
      panConfig,
      selectedToppingConcept,
      style,
      usePreFerment,
      preFermentChoice,
    ],
  );

  return {
    recipeMode,
    setRecipeMode,
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
    preFermentChoice,
    setPreFermentChoice,
    panConfig,
    setPanConfig,
    activeVersionId,
    setActiveVersionId,
    activeVersion,
    activeInterpretationId,
    setActiveInterpretationId,
    selectedToppingConcept,
    setSelectedToppingConcept,
    customFlourBlend,
    setCustomFlourBlend,
    styleVersions,
    applyVersionToState,
    selectVersion,
    applyInterpretationToState,
    resetToBaseRecipe,
    resetForStyle,
    buildRecipe,
    optimizeForConstraints,
    lastOptimization,
    setLastOptimization,
  } satisfies {
    recipeMode: RecipeMode;
    setRecipeMode: Dispatch<SetStateAction<RecipeMode>>;
    customHydration: number;
    setCustomHydration: Dispatch<SetStateAction<number>>;
    customFlourW: number;
    setCustomFlourW: Dispatch<SetStateAction<number>>;
    customFlourPL: number;
    setCustomFlourPL: Dispatch<SetStateAction<number>>;
    customSalt: number;
    setCustomSalt: Dispatch<SetStateAction<number>>;
    customFermentHours: number;
    setCustomFermentHours: Dispatch<SetStateAction<number>>;
    customFermentTemp: number;
    setCustomFermentTemp: Dispatch<SetStateAction<number>>;
    usePreFerment: boolean;
    setUsePreFerment: Dispatch<SetStateAction<boolean>>;
    preFermentChoice: PreFermentChoice;
    setPreFermentChoice: Dispatch<SetStateAction<PreFermentChoice>>;
    panConfig: PanConfig;
    setPanConfig: Dispatch<SetStateAction<PanConfig>>;
    activeVersionId: string | null;
    setActiveVersionId: Dispatch<SetStateAction<string | null>>;
    activeVersion: StyleVersion | null;
    activeInterpretationId: string | null;
    setActiveInterpretationId: Dispatch<SetStateAction<string | null>>;
    selectedToppingConcept: string | null;
    setSelectedToppingConcept: Dispatch<SetStateAction<string | null>>;
    customFlourBlend: { name: string; pct: number; w?: number }[] | undefined;
    setCustomFlourBlend: Dispatch<
      SetStateAction<{ name: string; pct: number; w?: number }[] | undefined>
    >;
    styleVersions: StyleVersion[];
    applyVersionToState: (version: StyleVersion) => void;
    selectVersion: (version: StyleVersion) => void;
    applyInterpretationToState: (
      interpretation: Interpretation,
      clearVersion?: boolean,
    ) => void;
    resetToBaseRecipe: (options?: ResetStyleOptions) => void;
    resetForStyle: (
      nextStyle: PizzaStyle,
      nextInitial?: RecipeInitialState | null,
      availableHours?: number,
      windowConstraints?: UserConstraints,
    ) => void;
    buildRecipe: (constraints: UserConstraints) => GeneratedRecipe | null;
    optimizeForConstraints: (constraints: UserConstraints) => OptimizedRecipe | null;
    lastOptimization: OptimizedRecipe | null;
    setLastOptimization: Dispatch<SetStateAction<OptimizedRecipe | null>>;
  };
}
