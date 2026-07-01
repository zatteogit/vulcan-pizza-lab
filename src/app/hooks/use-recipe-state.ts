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
  optimizeRecipe,
  type OptimizedRecipe,
  type GeneratedRecipe,
  type PanConfig,
  type PizzaStyle,
  type ScoreWeightsOverride,
  type UserConstraints,
  type VersionRangeOverrides,
} from "../domain/pizza-engine";
import { applyVersionParams } from "../features/recipe/recipe-configurator";
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
  panConfig?: PanConfig;
  toppingConcept?: string | null;
  flourBlend?: { name: string; pct: number; w?: number }[];
}

interface UseRecipeStateArgs {
  style: PizzaStyle | null;
  cms: CmsContent;
  initial?: RecipeInitialState | null;
  defaultAvailableHours?: number;
}

interface ResetStyleOptions {
  mode?: RecipeMode;
  availableHours?: number;
  preserveActiveVersion?: boolean;
  clearTopping?: boolean;
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
  customFlourPL: number;
  panConfig: PanConfig;
  activeVersion: StyleVersion | null;
  activeInterpretationId: string | null;
  selectedToppingConcept: string | null;
  customFlourBlend?: { name: string; pct: number; w?: number }[];
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

function centerParamsForStyle(style: PizzaStyle, availableHours: number) {
  const fMin = style.dough.fermentation_hours_range[0];
  const fMax = style.dough.fermentation_hours_range[1];
  const fermentHours = Math.min(Math.round((fMin + fMax) / 2), availableHours);
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
) {
  const version = initial?.version ?? null;
  const interpretation = initial?.interpretation ?? null;
  const overrides = interpretation?.parameter_overrides;
  const centered = centerParamsForStyle(style, availableHours);

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
    panConfig: initial?.panConfig ?? defaultRecipePanConfig(style),
    activeVersionId: version?.id ?? null,
    activeInterpretationId: interpretation?.id ?? null,
    selectedToppingConcept: (() => {
      const raw =
        initial?.toppingConcept ??
        interpretation?.base_topping_concept_id ??
        style.default_topping_ref ??
        null;
      if (!raw) return null;
      const resolved = resolveTopping(raw, style);
      return resolved ? resolved.id : raw;
    })(),
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
  customFlourPL,
  panConfig,
  activeVersion,
  activeInterpretationId,
  selectedToppingConcept,
  customFlourBlend,
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
  const isToppingValid =
    selectedToppingConcept && style
      ? resolveTopping(selectedToppingConcept, style) !== undefined
      : false;
  const styleWithTopping =
    isToppingValid && selectedToppingConcept !== style.default_topping_ref
      ? { ...style, default_topping_ref: selectedToppingConcept ?? undefined }
      : style;
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

  return generateRecipe(styleWithTopping, constraints, {
    customHydration,
    customFlourW,
    customFermentationHours: customFermentHours,
    customFermentationTempC: customFermentTemp,
    usePreFerment,
    customFlourPL,
    panConfig,
    scoreWeights,
    versionRanges: versionOverrides,
    activeImpastoRef: activeVersion?.impasto_ref,
    interpretationCenter,
    customFlourBlend,
  });
}

export function useRecipeState({
  style,
  cms,
  initial,
  defaultAvailableHours = 48,
}: UseRecipeStateArgs) {
  const resolvedInitial = style
    ? resolveInitialState(style, initial, defaultAvailableHours)
    : null;
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
  const [customFermentHours, setCustomFermentHours] = useState(
    resolvedInitial?.customFermentHours ?? 16,
  );
  const [customFermentTemp, setCustomFermentTemp] = useState(
    resolvedInitial?.customFermentTemp ?? 4,
  );
  const [usePreFerment, setUsePreFerment] = useState(
    resolvedInitial?.usePreFerment ?? false,
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
    ) => {
      const next = resolveInitialState(nextStyle, nextInitial, availableHours);
      setRecipeMode(next.recipeMode);
      setCustomHydration(next.customHydration);
      setCustomFlourW(next.customFlourW);
      setCustomFlourPL(next.customFlourPL);
      setCustomFermentHours(next.customFermentHours);
      setCustomFermentTemp(next.customFermentTemp);
      setUsePreFerment(next.usePreFerment);
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
    resetForStyle(style, initial, defaultAvailableHours);
  }, [defaultAvailableHours, initial, resetForStyle, style]);

  const applyVersionToState = useCallback(
    (version: StyleVersion) => {
      applyVersionParams(version, {
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
      const overrides = interpretation.parameter_overrides;
      if (overrides) {
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
    [style],
  );

  const resetToBaseRecipe = useCallback(
    (options: ResetStyleOptions = {}) => {
      if (!style) return;
      if (options.preserveActiveVersion && activeVersion) {
        applyVersionToState(activeVersion);
        return;
      }
      const centered = centerParamsForStyle(
        style,
        options.availableHours ?? defaultAvailableHours,
      );
      setRecipeMode(options.mode ?? "adapted");
      setActiveVersionId(null);
      setActiveInterpretationId(null);
      setCustomHydration(centered.hydration);
      setCustomFlourW(centered.flourW);
      setCustomFlourPL(centered.flourPL);
      setCustomFermentHours(centered.fermentHours);
      setCustomFermentTemp(centered.fermentTemp);
      setUsePreFerment(centered.usePreFerment);
      setPanConfig(defaultRecipePanConfig(style));
      setLastOptimization(null);
      if (options.clearTopping !== false) {
        setSelectedToppingConcept(style.default_topping_ref ?? null);
      }
    },
    [activeVersion, applyVersionToState, defaultAvailableHours, style],
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
      const result = optimizeRecipe(style, constraints, undefined, panConfig, scoreWeights);
      setActiveVersionId(null);
      setActiveInterpretationId(null);
      setRecipeMode("adapted");
      setCustomHydration(result.params.hydration);
      setCustomFlourW(result.params.flour_w);
      setCustomFermentHours(result.params.fermentation_hours);
      setCustomFermentTemp(result.params.fermentation_temp_c);
      setUsePreFerment(result.params.use_pre_ferment);
      setLastOptimization(result);
      return result;
    },
    [cms, panConfig, style],
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
        customFlourPL,
        panConfig,
        activeVersion,
        activeInterpretationId,
        selectedToppingConcept,
        customFlourBlend,
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
      customFlourW,
      customHydration,
      panConfig,
      selectedToppingConcept,
      style,
      usePreFerment,
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
    customFermentHours,
    setCustomFermentHours,
    customFermentTemp,
    setCustomFermentTemp,
    usePreFerment,
    setUsePreFerment,
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
    customFermentHours: number;
    setCustomFermentHours: Dispatch<SetStateAction<number>>;
    customFermentTemp: number;
    setCustomFermentTemp: Dispatch<SetStateAction<number>>;
    usePreFerment: boolean;
    setUsePreFerment: Dispatch<SetStateAction<boolean>>;
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
    ) => void;
    buildRecipe: (constraints: UserConstraints) => GeneratedRecipe | null;
    optimizeForConstraints: (constraints: UserConstraints) => OptimizedRecipe | null;
    lastOptimization: OptimizedRecipe | null;
    setLastOptimization: Dispatch<SetStateAction<OptimizedRecipe | null>>;
  };
}
