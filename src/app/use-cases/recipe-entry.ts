import { getImpasto, mergeImpastoIntoDough } from "../data/impasto-library";
import { getInterpretationById, getInterpretationsForStyle, type Interpretation } from "../data/interpretation-library";
import { getVersions, type StyleVersion } from "../data/style-versions";
import { resolveTopping, getToppingForStyle } from "../data/topping-library";
import { defaultFermentTempC, defaultPanShape, generateRecipe, optimizeRecipe,
  type GeneratedRecipe, type GenerateRecipeOptions, type PanConfig, type PizzaStyle,
  type PreFermentChoice, type ScoreWeightsOverride, type UserConstraints, type VersionRangeOverrides,
} from "../domain/pizza-engine";

/** Stile con il condimento scelto dall'utente, come lo riceve il motore:
 *  la ricetta mostrata, l'ottimizzatore e il soffitto devono usare lo stesso
 *  (il condimento cambia passaggi di farcitura e minuti della timeline). */
export function styleWithSelectedTopping(
  style: PizzaStyle,
  selectedToppingConcept: string | null,
): PizzaStyle {
  const isToppingValid = selectedToppingConcept
    ? getToppingForStyle(selectedToppingConcept, style) !== undefined
    : false;
  return isToppingValid && selectedToppingConcept !== style.default_topping_ref
    ? { ...style, default_topping_ref: selectedToppingConcept ?? undefined }
    : style;
}

/** Ottimizzazione con compensazione d'idratazione del forno (ENG-6): la base
 *  del candidato e l'idratazione finale mostrata nello slider. */
export interface OptimizedHydration {
  base: number;
  final: number;
}

export interface RecipeBuildParams {
  style: PizzaStyle;
  scoreWeights?: ScoreWeightsOverride;
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

/** In the Pinsa mix W refers to its wheat component. Editing the overall W
 * must update that component too, rather than leave an invisible old W. */
function blendAtW(blend: PizzaStyle["dough"]["flour_blend"], w: number) {
  const wheat = blend?.filter(c => c.w !== undefined && c.pct > 0) ?? [];
  return blend?.map(c => ({ ...c, ...(wheat.length === 1 && c.w !== undefined && c.pct > 0 ? { w } : {}) }));
}

/** Versione «canonica» di uno stile: la più esperta, a parità la più lunga. */
export function getCanonicalVersion(styleId: string): StyleVersion | null {
  const versions = getVersions(styleId);
  if (versions.length === 0) return null;
  return versions.reduce((best, version) => {
    if (version.skill_hint !== best.skill_hint) {
      return version.skill_hint > best.skill_hint ? version : best;
    }
    return version.params.fermentation_hours > best.params.fermentation_hours ? version : best;
  }, versions[0]);
}

export function defaultPL(style: PizzaStyle): number {
  return Math.round(((style.dough.flour_pl_range[0] + style.dough.flour_pl_range[1]) / 2) * 100) / 100;
}

/** La variante legata a doppio filo allo stile (disciplinari AVPN/IGP/APITER). */
export function canonicalInterpretation(style: PizzaStyle): Interpretation | null {
  return getInterpretationsForStyle(style.id).find((it) => it.verified_canonical) ?? null;
}

/** La ricetta originale sulla cucina dell'utente, con gli stessi parametri
 *  con cui la scheda dello stile si apre in modalità canonica. */
export function canonicalRecipeEntry(style: PizzaStyle, scoreWeights?: ScoreWeightsOverride, interpretation: Interpretation | null = canonicalInterpretation(style), selectedVersion?: StyleVersion | null) {
  const interp = interpretation;
  const o = interp?.parameter_overrides;
  const version = interp ? null : selectedVersion === undefined ? getCanonicalVersion(style.id) : selectedVersion;
  const v = version?.params;
  const impastoRef = o?.impasto_ref ?? version?.impasto_ref ?? style.default_impasto_ref;
  const impasto = impastoRef ? getImpasto(impastoRef) : undefined;
  const dough = impasto ? mergeImpastoIntoDough(style.dough, impasto) : style.dough;
  const fMid = Math.min(
    Math.round((dough.fermentation_hours_range[0] + dough.fermentation_hours_range[1]) / 2),
    48,
  );
  const hours = o?.fermentation_hours ?? v?.fermentation_hours ?? fMid;
  const toppingRaw = interp?.base_topping_concept_id ?? style.default_topping_ref ?? null;
  const topping = toppingRaw ? (resolveTopping(toppingRaw, style)?.id ?? toppingRaw) : null;
  const options: GenerateRecipeOptions = {
    customHydration:
      o?.hydration_pct ??
      v?.hydration_pct ??
      Math.round((dough.hydration_pct_range[0] + dough.hydration_pct_range[1]) / 2),
    customFlourW:
      o?.flour_w ?? v?.flour_w ?? Math.round((dough.flour_w_range[0] + dough.flour_w_range[1]) / 2),
    customFlourPL: o?.flour_pl ?? v?.flour_pl ?? defaultPL({ ...style, dough }),
    customFermentationHours: hours,
    customFermentationTempC: o?.fermentation_temp_c ?? v?.fermentation_temp_c ?? defaultFermentTempC(style, hours),
    usePreFerment: o?.use_pre_ferment ?? v?.use_pre_ferment ?? (impasto?.requires_pre_ferment ?? style.requires_pre_ferment),
    customSalt: dough.salt_pct,
    // Come la scheda: teglia dello stile e mix di farine dello stile.
    panConfig: {
      panShape: defaultPanShape(style),
      panLength: style.shape.length_cm,
      panWidth: style.shape.width_cm,
      panDiameter: style.shape.diameter_cm,
      thickness: style.shape.thickness_factor,
    },
    customFlourBlend: blendAtW(dough.flour_blend, o?.flour_w ?? v?.flour_w ?? Math.round((dough.flour_w_range[0] + dough.flour_w_range[1]) / 2)),
    scoreWeights,
    versionRanges: version?.ranges || o?.dough_weight_g !== undefined
      ? {
          ...version?.ranges,
          ...(version?.params.dough_weight_g !== undefined ? { dough_weight_g: version.params.dough_weight_g } : {}),
          ...(o?.dough_weight_g !== undefined ? { dough_weight_g: o.dough_weight_g } : {}),
        }
      : undefined,
    activeImpastoRef: o?.impasto_ref ?? version?.impasto_ref,
    interpretationCenter: o
      ? {
          hydration_pct: o.hydration_pct,
          flour_w: o.flour_w,
          flour_pl: o.flour_pl,
          fermentation_hours: o.fermentation_hours,
        }
      : undefined,
  };
  return { style: styleWithSelectedTopping(style, topping), version, interpretation: interp, topping, options };
}

export function recipeFromEntry(entry: ReturnType<typeof canonicalRecipeEntry>, constraints: UserConstraints, scoreWeights = entry.options.scoreWeights) {
  return generateRecipe(entry.style, constraints, { ...entry.options, scoreWeights });
}

export function canonicalRecipe(style: PizzaStyle, constraints: UserConstraints, scoreWeights?: ScoreWeightsOverride): GeneratedRecipe {
  const entry = canonicalRecipeEntry(style, scoreWeights);
  return recipeFromEntry(entry, constraints);
}
export function buildGeneratedRecipe({
  style,
  scoreWeights,
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
  let versionOverrides: VersionRangeOverrides | undefined = activeVersion
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

  if (activeInterpretation?.parameter_overrides?.dough_weight_g !== undefined) versionOverrides = { ...versionOverrides, dough_weight_g: activeInterpretation.parameter_overrides.dough_weight_g };
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
    activeImpastoRef: activeInterpretation?.parameter_overrides?.impasto_ref ?? activeVersion?.impasto_ref,
    interpretationCenter,
    customFlourBlend: blendAtW(customFlourBlend, customFlourW),
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

/** La proposta su misura e i parametri necessari a ricostruirla sono una cosa sola.
 * Si passa anche P/L e la base della compensazione: ricostruire solo h/W/ore
 * cambiava silenziosamente il punteggio dopo il click. */
export function tailoredRecipeEntry(style: PizzaStyle, constraints: UserConstraints, scoreWeights?: ScoreWeightsOverride, panConfig?: PanConfig) {
  panConfig ??= { panShape: defaultPanShape(style), panLength: style.shape.length_cm, panWidth: style.shape.width_cm, panDiameter: style.shape.diameter_cm, thickness: style.shape.thickness_factor };
  const optimized = optimizeRecipe(style, constraints, undefined, panConfig, scoreWeights);
  const r = optimized.recipe;
  const options: GenerateRecipeOptions = {
    customHydration: optimized.params.hydration_compensated ? optimized.params.hydration_base : r.hydration_pct,
    compensateCustomHydration: optimized.params.hydration_compensated,
    customFlourW: r.flour_w,
    customFlourPL: r.flour_pl,
    customFermentationHours: r.fermentation_hours,
    customFermentationTempC: r.fermentation_temp_c,
    usePreFerment: r.has_pre_ferment,
    customSalt: r.baker_pcts?.salt ?? r.style.dough.salt_pct,
    customFlourBlend: r.flour_blend?.map(({ name, pct, w }) => ({ name, pct, w })),
    panConfig,
    scoreWeights,
  };
  const recipe = generateRecipe(style, constraints, options);
  return { recipe, options, optimizedHydration: optimized.params.hydration_compensated
    ? { base: optimized.params.hydration_base, final: recipe.hydration_pct } : null };
}

/** Differenze fra le due ricette effettivamente calcolate, non promesse
 * dedotte dal solo delta del voto. I numeri restano dati, localizzati nella UI. */
export function recipeDifferences(from: GeneratedRecipe, to: GeneratedRecipe) {
  const changes: import("../domain/pizza-engine").EngineMsg[] = [];
  const add = (key: string, message: string, params: Record<string, number | string> = {}) => changes.push({ key, fallback: message, params });
  const fromTopping = from.style.default_topping_ref ? getToppingForStyle(from.style.default_topping_ref, from.style) : undefined;
  const toTopping = to.style.default_topping_ref ? getToppingForStyle(to.style.default_topping_ref, to.style) : undefined;
  if (fromTopping?.id !== toTopping?.id) add("change.topping", "Condimento: {from} → {to}", {from:fromTopping?.id ?? "", to:toTopping?.id ?? ""});
  if (from.baker_pcts && to.baker_pcts) {
    for (const kind of ["salt", "fat", "sugar"] as const) {
      if (from.baker_pcts[kind] !== to.baker_pcts[kind]) add(`change.${kind}`, "{from}% → {to}%", { from: from.baker_pcts[kind], to: to.baker_pcts[kind] });
    }
  }
  if (from.hydration_pct !== to.hydration_pct) add("change.hydration", "Idratazione: {from}% → {to}%", { from: from.hydration_pct, to: to.hydration_pct });
  if (from.flour_w !== to.flour_w) add("change.flour", "Forza farina: W{from} → W{to}", { from: from.flour_w, to: to.flour_w });
  if (from.flour_pl !== to.flour_pl) add("change.flourPL", "P/L farina: {from} → {to}", { from: from.flour_pl, to: to.flour_pl });
  if (from.fermentation_hours !== to.fermentation_hours || from.fermentation_temp_c !== to.fermentation_temp_c) {
    add("change.fermentation", "Fermentazione: {fromHours} a {fromTemp} → {toHours} a {toTemp}", {
      fromHours: from.fermentation_hours, toHours: to.fermentation_hours,
      fromTemp: from.fermentation_temp_c, toTemp: to.fermentation_temp_c });
  }
  if (from.has_pre_ferment !== to.has_pre_ferment) add(to.has_pre_ferment ? "change.prefermentOn" : "change.prefermentOff", to.has_pre_ferment ? "Si aggiunge un pre-fermento" : "Si passa all’impasto diretto");
  else if (to.has_pre_ferment && (from.pre_ferment_type !== to.pre_ferment_type || from.pre_ferment_flour_pct !== to.pre_ferment_flour_pct)) {
    add("change.prefermentDetails", "Pre-fermento: {fromType} {from}% → {toType} {to}%", { fromType: from.pre_ferment_type ?? "", toType: to.pre_ferment_type ?? "", from: from.pre_ferment_flour_pct ?? 0, to: to.pre_ferment_flour_pct ?? 0 });
  }
  if (from.oven_temp_c !== to.oven_temp_c || from.cook_time_sec !== to.cook_time_sec) add("change.cooking", "Cottura: {fromTemp}, {fromSeconds} s → {toTemp}, {toSeconds} s", { fromTemp: from.oven_temp_c, toTemp: to.oven_temp_c, fromSeconds: from.cook_time_sec, toSeconds: to.cook_time_sec });
  return changes;
}


/** A preset is a complete replacement, never a patch over the previous recipe. */
export function recipePresetState(style: PizzaStyle, version: StyleVersion | null, interpretation: Interpretation | null) {
  const e = canonicalRecipeEntry(style, undefined, interpretation, version);
  const o = e.options;
  return { mode: "canonical" as const, version: e.version, interpretation: e.interpretation,
    hydration: o.customHydration!, flourW: o.customFlourW!, flourPL: o.customFlourPL!, salt: o.customSalt!,
    fermentHours: o.customFermentationHours!, fermentTemp: o.customFermentationTempC!,
    usePreFerment: o.usePreFerment!, preFerment: {}, panConfig: o.panConfig!,
    toppingConcept: e.topping ?? style.default_topping_ref ?? null,
    flourBlend: o.customFlourBlend, optimizedHydration: null,
  };
}

/** Optimize inside the selected reference instead of silently dropping it. */
export function optimizeSelectedRecipe(style: PizzaStyle, constraints: UserConstraints, scoreWeights?: ScoreWeightsOverride,
  panConfig?: PanConfig, version: StyleVersion | null = null, interpretationId: string | null = null) {
  const it = interpretationId ? getInterpretationById(interpretationId) ?? null : null;
  const o = canonicalRecipeEntry(style, scoreWeights, it, version).options;
  return optimizeRecipe(style, constraints, undefined, panConfig, scoreWeights,
    o.versionRanges, o.activeImpastoRef, o.interpretationCenter);
}

export interface RecipeParameters {
  hydration: number; flourW: number; flourPL: number; salt: number;
  fermentHours: number; fermentTemp: number; usePreFerment: boolean;
  preFerment?: PreFermentChoice; panConfig?: PanConfig; toppingConcept?: string | null;
  flourBlend?: { name: string; pct: number; w?: number }[];
}

/** Source identity remains selected after editing; only values decide whether
 * this is still the preset or a personal version of it. */
export function isRecipePresetModified(reference: RecipeParameters, current: RecipeParameters): boolean {
  for (const key of ["hydration", "flourW", "flourPL", "salt", "fermentHours", "fermentTemp"] as const) {
    if (Math.abs(reference[key] - current[key]) > 1e-6) return true;
  }
  if (reference.usePreFerment !== current.usePreFerment || reference.toppingConcept !== current.toppingConcept) return true;
  if (current.preFerment?.type !== reference.preFerment?.type || current.preFerment?.flourPct !== reference.preFerment?.flourPct) return true;
  for (const key of ["panShape", "panLength", "panWidth", "panDiameter", "thickness", "ballWeightG"] as const) {
    if (reference.panConfig?.[key] !== current.panConfig?.[key]) return true;
  }
  return JSON.stringify(reference.flourBlend) !== JSON.stringify(current.flourBlend);
}
