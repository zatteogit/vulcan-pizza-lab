/* ═══ D-049 — Motore e contenuti per agenti (server MCP) ═══
 *
 * Gli strumenti che il Worker espone su /mcp (Model Context Protocol, JSON-RPC
 * su HTTP): Claude, ChatGPT e altri agenti chiedono stili, consigli e ricette
 * e ricevono dati strutturati (structuredContent) più un riassunto leggibile.
 * Tutto puro: niente React, niente browser, niente scritture. I numeri sono
 * gli stessi dell'app (motore, compatibilità D-041).
 */

import {
  OVEN_PRESETS,
  PIZZA_FAMILIES,
  STYLES_DB,
  YEAST_LABELS,
  generateRecipe,
  dietaryRecipeAlternatives,
  recommendStyles,
  type EngineMsg,
  type GeneratedRecipe,
  type OvenType,
  type PizzaStyle,
  type SkillLevel,
  type UserConstraints,
  type GenerateRecipeOptions,
  FLOUR_W_RANGES,
  MAX_DOUGH_BALLS,
} from "../domain/pizza-engine";
import { ToolInputError, numberInput as num, kitchenInputs, KITCHEN_INPUT, PAN_INPUT, panInput, enumInput, optionalBoolean } from "./mcp-inputs";
export { ToolInputError } from "./mcp-inputs";
import { canonicalRecipeEntry, tailoredRecipeEntry, optimizeSelectedRecipe } from "../use-cases/recipe-entry";
import { getInterpretationsForStyle } from "../data/interpretation-library";
import { getVersions } from "../data/style-versions";
import { TOPPING_LIBRARY, getToppingForStyle, scaleToppingAmounts } from "../data/topping-library";
import { FLOURS_DB } from "../data/flour-database";
import { pantryIngredientId } from "../domain/pantry-ingredients";
import { DEFAULT_UI_SCORE_WEIGHTS } from "../domain/recipe-score";
import { computePreFermentSplit } from "../domain/pre-ferment-split";
import { recipeDisplayName, stgDepartures } from "../domain/recipe-reference";
import { GLOSSARY_TERMS, getLocalizedTerm } from "../data/glossary-data";
import { searchOvenModels } from "../data/oven-models";
import { kitchenCompatibility } from "../features/recipe/kitchen-compatibility";
import { GLOSSARY_TERMS_DEFAULTS } from "../features/cms/domain-i18n-defaults";
import { GLOSSARY_TERMS_DE } from "../features/cms/locales/domain-de";
import { GLOSSARY_TERMS_EN } from "../features/cms/locales/domain-en";
import { GLOSSARY_TERMS_ES } from "../features/cms/locales/domain-es";
import { GLOSSARY_TERMS_FR } from "../features/cms/locales/domain-fr";
import { GLOSSARY_TERMS_JA } from "../features/cms/locales/domain-ja";
import { GLOSSARY_TERMS_PT } from "../features/cms/locales/domain-pt";
import type { GlossaryMessages } from "../i18n/domain-contracts";
import { BRAND } from "../config/brand";
import { MCP_GUIDE } from "./mcp-guide";

export const MCP_SERVER_INFO = { name: `${BRAND.name.toLowerCase()}-pizza-engine`, version: "1.2.0" } as const;

type Json = Record<string, unknown>;

export interface McpTool {
  name: string;
  title: string;
  description: string;
  inputSchema: Json;
  run: (args: Json) => { summary: string; data: Json };
}

const OVEN_TYPES = OVEN_PRESETS.map((preset) => preset.id);
const LANGS = ["it", "en", "de", "es", "fr", "pt", "ja"] as const;
type Lang = (typeof LANGS)[number];

const GLOSSARY_BY_LANG: Record<Lang, Partial<GlossaryMessages>> = {
  it: GLOSSARY_TERMS_DEFAULTS,
  en: GLOSSARY_TERMS_EN,
  de: GLOSSARY_TERMS_DE,
  es: GLOSSARY_TERMS_ES,
  fr: GLOSSARY_TERMS_FR,
  pt: GLOSSARY_TERMS_PT,
  ja: GLOSSARY_TERMS_JA,
};

/** Numero intero: 1,5 panetti non si arrotonda in silenzio (verifica di GPT). */
function wholeNumber(args: Json, key: string, min: number, max: number, fallback: number): number {
  const value = num(args, key, min, max, fallback);
  if (!Number.isInteger(value)) throw new ToolInputError(`"${key}" must be a whole number`);
  return value;
}

function styleById(args: Json): PizzaStyle {
  const id = String(args.style_id ?? "");
  const style = STYLES_DB[id];
  if (!style) throw new ToolInputError(`unknown style_id "${id}"; call list_styles for the ids`);
  return style;
}

function constraintsFrom(args: Json): UserConstraints {
  if (args.available_hours === 0 && args.meal_deadline === true) throw new ToolInputError('available_hours:0 means no time preference; use meal_deadline:false');
  // D-048: un modello di forno («Koda 16», «Effeuno P134H») dà tipo e temperatura.
  if (args.oven_model) {
    const [model] = searchOvenModels(String(args.oven_model), 1);
    if (!model) throw new ToolInputError(`no oven model matches "${args.oven_model}"; use oven_type and oven_max_temp_c`);
    args = { ...args, oven_type: model.ovenType, oven_max_temp_c: args.oven_max_temp_c ?? model.maxTempC };
  }
  const ovenType = String(args.oven_type ?? "home");
  if (!OVEN_TYPES.includes(ovenType as OvenType)) {
    throw new ToolInputError(`"oven_type" must be one of ${OVEN_TYPES.join(", ")}`);
  }
  const preset = OVEN_PRESETS.find((p) => p.id === ovenType);
  const constraints: UserConstraints = {
    oven_type: ovenType as OvenType,
    oven_max_temp_c: num(args, "oven_max_temp_c", 150, 550, preset?.maxTemp ?? 250),
    ...(args.oven_capacity_temp_c !== undefined ? { oven_capacity_temp_c: num(args, "oven_capacity_temp_c", 150, 550) } : {}),
    skill_level: wholeNumber(args, "skill_level", 1, 4, 2) as SkillLevel,
    available_hours: num(args, "available_hours", 0, 168, 24),
    // Per un agente «ho 6 ore» vuol dire «si mangia fra 6 ore»: con le ore
    // la scadenza vale, salvo meal_deadline: false esplicito.
    meal_deadline: args.meal_deadline === undefined ? args.available_hours != null && args.available_hours !== 0 : optionalBoolean(args, "meal_deadline"),
    dough_balls: wholeNumber(args, "dough_balls", 1, MAX_DOUGH_BALLS, 4),
    has_mixer: optionalBoolean(args, "has_mixer") ?? false,
    has_pizza_stone: optionalBoolean(args, "has_pizza_stone") ?? false,
    has_pizza_steel: optionalBoolean(args, "has_pizza_steel") ?? false,
    has_baking_pan: optionalBoolean(args, "has_baking_pan") ?? false,
    dietary_filters: [],
    pantry_flours: [],
    pantry_yeasts: [],
    ...kitchenInputs(args),
  };
  const flourIds = new Set([...Object.keys(FLOUR_W_RANGES),...Object.keys(GENERIC_FLOURS),...FLOURS_DB.map(f=>f.id)]);
  for (const id of [...constraints.pantry_flours,...(constraints.excluded_flours??[])]) if (!flourIds.has(id) && !id.startsWith("custom:") && !constraints.pantry_flour_details?.[id]) throw new ToolInputError(`unknown flour ID "${id}"; call list_pantry_items or supply custom flour details`);
  for (const id of [...(constraints.pantry_ingredients??[]),...(constraints.excluded_ingredients??[])]) if (!PANTRY_INGREDIENTS.has(id)) throw new ToolInputError(`unknown ingredient ID "${id}"; call list_pantry_items`);
  return constraints;
}

/** The same preset and optimization entries used by the browser. Omitted mode
 * preserves the historical direct-engine defaults for existing clients. */
function recipeForInput(source: PizzaStyle, constraints: UserConstraints, args: Json) {
  const mode = enumInput(args, "recipe_mode", ["default", "canonical", "adapted"]) ?? (args.version_id !== undefined || args.interpretation_id !== undefined ? "canonical" : "default");
  let weights: GenerateRecipeOptions["scoreWeights"] = mode === "default" ? undefined : DEFAULT_UI_SCORE_WEIGHTS;
  if (args.score_weights !== undefined) {
    if (!args.score_weights || typeof args.score_weights !== "object" || Array.isArray(args.score_weights)) throw new ToolInputError('score_weights must be an object');
    const raw = args.score_weights as Json;
    if (Object.keys(raw).some(k=>!Object.prototype.hasOwnProperty.call(DEFAULT_UI_SCORE_WEIGHTS,k))) throw new ToolInputError('unknown score weight');
    weights = Object.fromEntries(Object.keys(DEFAULT_UI_SCORE_WEIGHTS).map(k=>[k,num(raw,k,0,1)]));
    if (Object.values(weights).reduce((sum,v)=>sum+(v??0),0)<=0) throw new ToolInputError('score weights must have a positive total');
  }
  const version = args.version_id === undefined ? null : getVersions(source.id).find(v => v.id === args.version_id);
  const interpretation = args.interpretation_id === undefined ? null : getInterpretationsForStyle(source.id).find(v => v.id === args.interpretation_id);
  if (args.version_id !== undefined && !version) throw new ToolInputError('unknown version_id for this style; call get_style');
  if (args.interpretation_id !== undefined && !interpretation) throw new ToolInputError('unknown interpretation_id for this style; call get_style');
  if (version && interpretation) throw new ToolInputError('choose version_id or interpretation_id, not both');
  if (mode === "default" && (version || interpretation)) throw new ToolInputError('presets require recipe_mode canonical or adapted');
  const selectedTopping = args.topping_id === undefined ? undefined : typeof args.topping_id === "string" ? getToppingForStyle(args.topping_id, source) : undefined;
  if (args.topping_id !== undefined && !selectedTopping) throw new ToolInputError('unknown topping_id; call get_style for toppings');
  const pan = panInput(args);
  let style = source;
  let options: GenerateRecipeOptions = {scoreWeights:weights};
  if (mode === "canonical" || version || interpretation) {
    const entry = canonicalRecipeEntry(source, weights, interpretation ?? (version ? null : undefined), version ?? undefined);
    style = entry.style;
    options = { ...entry.options };
  }
  if (selectedTopping) style = { ...style, default_topping_ref: selectedTopping.id };
  if (mode === "adapted") {
    if (!version && !interpretation) options = tailoredRecipeEntry(style, constraints, weights, pan).options;
    else {
      const opt = optimizeSelectedRecipe(style, constraints, weights, pan ?? options.panConfig, version, interpretation?.id);
      const r = opt.recipe;
      options = { ...options, customHydration: opt.params.hydration_compensated ? opt.params.hydration_base : r.hydration_pct,
        compensateCustomHydration: opt.params.hydration_compensated, customFlourW: r.flour_w, customFlourPL: r.flour_pl,
        customFermentationHours: r.fermentation_hours, customFermentationTempC: r.fermentation_temp_c,
        usePreFerment: r.has_pre_ferment, customSalt: r.baker_pcts?.salt, customFlourBlend: r.flour_blend };
    }
  }
  if (pan) options.panConfig = { ...options.panConfig, ...pan };
  for (const [key, target, min, max] of [
    ["hydration_pct", "customHydration", 40, 110], ["flour_w", "customFlourW", 50, 1000], ["flour_pl", "customFlourPL", 0.1, 10],
    ["salt_pct", "customSalt", 0, 10], ["fermentation_hours", "customFermentationHours", 0.5, 168], ["fermentation_temp_c", "customFermentationTempC", 1, 35],
  ] as const) if (args[key] !== undefined) options[target] = num(args, key, min, max);
  if (args.hydration_pct !== undefined) options.compensateCustomHydration = optionalBoolean(args, "compensate_hydration") ?? false;
  else if (args.compensate_hydration !== undefined) options.compensateCustomHydration = optionalBoolean(args, "compensate_hydration");
  if (args.flour_blend !== undefined) {
    if (!Array.isArray(args.flour_blend) || args.flour_blend.length === 0 || args.flour_blend.length > 20) throw new ToolInputError('flour_blend must have 1–20 components');
    options.customFlourBlend = args.flour_blend.map(raw => {
      if (!raw || typeof raw !== "object" || Array.isArray(raw)) throw new ToolInputError('invalid flour_blend component');
      const c = raw as Json;
      if (Object.keys(c).some(k=>!["name","pct","w"].includes(k))) throw new ToolInputError('unknown flour_blend component field');
      if (typeof c.name !== "string" || !c.name.trim() || c.name.length > 120) throw new ToolInputError('flour_blend component needs a name');
      return { name: c.name.trim(), pct: num(c, "pct", 0, 100), ...(c.w !== undefined ? {w:num(c,"w",1,1000)} : {}) };
    });
    if (Math.abs(options.customFlourBlend.reduce((sum,c)=>sum+c.pct,0)-100)>0.01) throw new ToolInputError('flour_blend percentages must total 100');
  }
  // Match the browser's W edit for a blend with one wheat component (Pinsa).
  if (args.flour_w !== undefined && !options.customFlourBlend && source.dough.flour_blend) options.customFlourBlend = source.dough.flour_blend;
  if (args.flour_w !== undefined && options.customFlourBlend?.filter(c=>c.w!==undefined&&c.pct>0).length===1) {
    options.customFlourBlend = options.customFlourBlend.map(c=>c.w!==undefined&&c.pct>0?{...c,w:options.customFlourW}:c);
  }
  const pref = enumInput(args, "pre_ferment", ["none", "biga", "poolish"]);
  if (pref && pref !== "none" && source.dough.unleavened) throw new ToolInputError(`${source.name} is unleavened: pre_ferment must be none`);
  if (pref) { options.usePreFerment = pref !== "none"; options.preFerment = pref === "none" ? undefined : {type:pref}; }
  if (args.pre_ferment_flour_pct !== undefined) {
    if (pref === "none" || (!pref && !options.usePreFerment && !source.requires_pre_ferment)) throw new ToolInputError('pre_ferment_flour_pct requires biga or poolish');
    options.preFerment = { ...options.preFerment, flourPct: num(args,"pre_ferment_flour_pct",20,50) };
  }
  return { recipe: generateRecipe(style, constraints, options), mode, version_id: version?.id ?? null, interpretation_id: interpretation?.id ?? null, options };
}

/** Testo italiano di riserva di un messaggio del motore, con i parametri. */
function msg(m: EngineMsg): string {
  return m.fallback.replace(/\{(\w+)\}/g, (_, k: string) => {
    const value = m.params?.[k];
    return String(k === "yeast" ? YEAST_LABELS[String(value)] ?? value ?? `{${k}}` : value ?? `{${k}}`);
  });
}

function styleSummary(style: PizzaStyle) {
  return {
    id: style.id,
    name: style.name,
    family: style.family,
    origin: style.origin,
    hydration_pct_range: style.dough.hydration_pct_range,
    parameter_range_basis: "catalog_model_reference",
    fermentation_hours_range: style.dough.fermentation_hours_range,
    oven_temp_c_range: style.baking.temp_c_range,
    oven_temp_c_ideal: style.baking.temp_c_ideal,
    ball_weight_g: style.shape.dough_weight_g,
    suitable_for_beginner: style.suitable_for_beginner,
  };
}

/** Temperatura di maturazione del pre-fermento, °C (fonti:
 *  docs/ricerca/prefermenti-fonti-2026-10-24.md; stessi valori del CMS). */
const PRE_FERMENT_TEMP_C = { biga: [18, 20], poolish: [20, 22] } as const;

/** Composizione completa del pre-fermento e dell'impasto finale, come nella
 *  ricetta dell'app (verifica di GPT: con solo tipo e quota non è eseguibile). */
function preFermentData(recipe: GeneratedRecipe) {
  if (!recipe.has_pre_ferment) return null;
  const split = computePreFermentSplit({
    flourG: recipe.flour_g,
    waterG: recipe.water_g,
    preFermentType: recipe.pre_ferment_type,
    flourPct: recipe.pre_ferment_flour_pct,
  });
  const type = split.isPoolish ? "poolish" : "biga";
  return {
    type,
    flour_pct: split.flourPct,
    hydration_pct: split.hydrationPct,
    flour_g: split.prefermentFlourG,
    water_g: split.prefermentWaterG,
    // Tutto il lievito va nel pre-fermento, il sale mai.
    [`yeast_${recipe.yeast_type}_g`]: recipe.yeast_g,
    maturation_minutes: recipe.timeline.find((step) => step.id === "preferment")?.duration_minutes ?? null,
    maturation_temp_c_range: PRE_FERMENT_TEMP_C[type],
    final_dough: {
      flour_g: split.mainFlourG,
      water_g: split.mainWaterG,
      salt_g: recipe.salt_g,
      fat_g: recipe.fat_g,
      sugar_g: recipe.sugar_g,
    },
  };
}

function recipeData(recipe: GeneratedRecipe) {
  const topping = recipe.style.default_topping_ref ? getToppingForStyle(recipe.style.default_topping_ref, recipe.style) : undefined;
  const scaled = topping ? scaleToppingAmounts(topping, recipe.style.topping_scale) : undefined;
  const pct = (g: number) => Math.round((g / recipe.flour_g) * 1000) / 10;
  const ingredients = [
    { name: "flour", grams: recipe.flour_g },
    { name: "water", grams: recipe.water_g },
    { name: "salt", grams: recipe.salt_g },
    { name: `yeast_${recipe.yeast_type}`, grams: recipe.yeast_g },
    { name: "sugar", grams: recipe.sugar_g },
    { name: "fat", grams: recipe.fat_g },
  ]
    .filter((row) => row.grams > 0)
    .map((row) => ({ ...row, baker_pct: pct(row.grams) }));
  return {
    style: { id: recipe.style.id, name: recipeDisplayName(recipe), reference_name: recipe.style.name },
    reference: { stg_departures: stgDepartures(recipe), conformity_certified: false },
    outcome: recipe.verdict.outcome,
    blockers: recipe.verdict.blockers,
    dough_balls: recipe.dough_balls,
    ball_weight_g: recipe.ball_weight_g,
    total_dough_g: recipe.total_dough_g,
    hydration_pct: recipe.hydration_pct,
    flour_w: recipe.flour_w,
    flour_pl: recipe.flour_pl,
    baker_pcts: recipe.baker_pcts,
    parameter_ranges: { basis: "selected_method", hydration_pct: recipe.style.dough.hydration_pct_range,
      flour_w: recipe.style.dough.flour_w_range, fermentation_hours: recipe.style.dough.fermentation_hours_range },
    flour_blend: recipe.flour_blend,
    conditions: recipe.verdict.conditions ?? [],
    adaptations: recipe.verdict.adaptations,
    optional_aids: recipe.optional_aids,
    dietary_warnings: (recipe.dietary_warnings ?? []).map(w => ({ ...w, message: msg(w.message), tip: msg(w.tip) })),
    dietary_variant: recipe.dietary_variant,
    topping: scaled ? { id: scaled.id, ingredients_per_unit: scaled.ingredients,
      ingredients_total: scaled.ingredients.map(i => ({...i,amount:{...i.amount,value:i.amount.value*recipe.dough_balls}})) } : null,
    fermentation_hours: recipe.fermentation_hours,
    fermentation_temp_c: recipe.fermentation_temp_c,
    pre_ferment: preFermentData(recipe),
    oven_temp_c: recipe.oven_temp_c,
    cook_time_sec: recipe.cook_time_sec,
    water_temp_c: recipe.water_temp_c,
    ingredients,
    fat_type: recipe.style.dough.fat_type ?? null,
    schedule: { model: "sequential_single_operator", overlap_policy: "only_declared_passive_activity", bake_capacity: 1, total_minutes: recipe.timeline.reduce((sum, step) => sum + step.duration_minutes, 0), digestibility_is_heuristic: true },
    steps: recipe.timeline.map((step) => ({
      id: step.id,
      title: step.title,
      description: step.description,
      duration_minutes: step.duration_minutes,
      // D-050: cotture ripetute una alla volta; la durata è già il totale.
      ...(step.rounds ? { rounds: step.rounds } : {}),
      ...(step.parallel_activity ? { parallel_activity: step.parallel_activity } : {}),
      ...(step.work_units ? { work_units: step.work_units, minutes_per_unit: step.minutes_per_unit } : {}),
    })),
    scores: recipe.scores,
  };
}

const OVEN_INPUT = {
  ...KITCHEN_INPUT,
  oven_capacity_temp_c: { type: "number", minimum: 150, maximum: 550, description: "Physical oven limit; a lower oven_max_temp_c can be the selected setting." },
  oven_model: {
    type: "string",
    description: "Brand and/or model of a pizza oven (e.g. \"Ooni Koda 16\", \"Effeuno P134H\", \"Roccbox\"): sets oven type and temperature.",
  },
  oven_type: { type: "string", enum: OVEN_TYPES, description: "Kind of oven. home = domestic oven (~250 °C)." },
  oven_max_temp_c: { type: "number", description: "Highest temperature the oven reaches, °C." },
  available_hours: {
    type: "number",
    description: "Hours from now to the meal (default 24): the whole timeline, from mixing to baking, must fit.",
  },
  meal_deadline: {
    type: "boolean",
    description: "Default true when available_hours is given. false = no fixed meal time: the hours limit only the fermentation.",
  },
  skill_level: { type: "number", enum: [1, 2, 3, 4], description: "1 beginner … 4 professional." },
  dough_balls: { type: "number", description: "How many dough balls / pans / pieces." },
  has_mixer: { type: "boolean", description: "Has a stand or spiral mixer." },
  has_baking_pan: { type: "boolean", description: "Has a baking pan (needed by pan styles)." },
  has_pizza_stone: { type: "boolean", description: "Has a baking stone." },
  has_pizza_steel: { type: "boolean", description: "Has a baking steel." },
};

const RECIPE_INPUT = {
  score_weights: {type:"object",additionalProperties:false,required:Object.keys(DEFAULT_UI_SCORE_WEIGHTS),description:"Optional complete set of five weights for a browser with customized scoring. Canonical/adapted default to the shared app weights; default mode preserves historical engine weights.",properties:Object.fromEntries(Object.keys(DEFAULT_UI_SCORE_WEIGHTS).map(k=>[k,{type:"number",minimum:0,maximum:1}]))},
  recipe_mode: { type: "string", enum: ["default", "canonical", "adapted"], description: "default preserves legacy engine defaults; canonical = original browser preset; adapted = browser Create recommendation." },
  version_id: { type: "string", description: "Style preset ID from get_style. Mutually exclusive with interpretation_id." },
  interpretation_id: { type: "string", description: "Signature/disciplinare ID from get_style. The style must match." },
  topping_id: { type: "string", description: "Topping recipe or concept ID from get_style." },
  pan: PAN_INPUT,
  flour_w: { type: "number", minimum: 50, maximum: 1000, description: "Recipe flour strength, distinct from flour available in pantry." },
  flour_pl: { type: "number", minimum: 0.1, maximum: 10 },
  salt_pct: { type: "number", minimum: 0, maximum: 10, description: "Salt as baker's percentage." },
  flour_blend: { type: "array", minItems: 1, maxItems: 20, description: "Custom recipe blend; percentages must sum to 100. Pantry details do not change recipe proportions.", items: { type: "object", required: ["name", "pct"], properties: { name: {type:"string"}, pct:{type:"number",minimum:0,maximum:100}, w:{type:"number",minimum:1,maximum:1000} } } },
  compensate_hydration: { type: "boolean", description: "Apply oven compensation to hydration_pct as a base. Default false for an explicit hydration." },
  hydration_pct: { type: "number", description: "Override hydration (%)." },
  fermentation_hours: { type: "number", description: "Override fermentation hours." },
  fermentation_temp_c: { type: "number", description: "Override fermentation temperature (°C)." },
  pre_ferment: { type: "string", enum: ["none", "biga", "poolish"], description: "Override the pre-ferment." },
  pre_ferment_flour_pct: { type: "number", minimum: 20, maximum: 50 },
  ball_weight_g: { type: "number", description: "Override the weight of one dough ball/unit (g), taking precedence over pan geometry." },
};

const GENERIC_FLOURS: Record<string,string> = {"00":"Farina 00","0":"Farina 0",tipo_1:"Farina tipo 1",manitoba:"Manitoba",integrale:"Integrale",semola:"Semola rimacinata",farro:"Farina di farro",spelta:"Farina di spelta",kamut:"Farina di kamut",segale:"Farina di segale",riso:"Farina di riso",soia:"Farina di soia",mais:"Farina di mais",saraceno:"Grano saraceno",avena:"Farina di avena",ceci:"Farina di ceci",frumento:"Farina di frumento"};
const PANTRY_INGREDIENTS = new Map<string,{id:string;name:string;kind:string}>();
for (const name of ["Sale","Zucchero","Olio EVO","Burro","Strutto","Acqua",...Object.values(TOPPING_LIBRARY).flatMap(t=>t.ingredients.map(i=>i.name))]) PANTRY_INGREDIENTS.set(pantryIngredientId(name),{id:pantryIngredientId(name),name,kind:"ingredient"});

export const MCP_TOOLS: McpTool[] = [
  {
    name: "list_styles",
    title: "Pizza styles",
    description:
      "List the pizza styles the engine knows (Neapolitan, Roman, American, focacce…) with their id, family, hydration, fermentation hours and oven temperatures. Use the id with the other tools.",
    inputSchema: {
      type: "object",
      properties: {
        family: { type: "string", enum: Object.keys(PIZZA_FAMILIES), description: "Only this family." },
      },
    },
    run: (args) => {
      const family = args.family ? String(args.family) : null;
      const styles = Object.values(STYLES_DB)
        .filter((style) => !family || style.family === family || style.families?.includes(family as never))
        .map(styleSummary);
      return {
        summary: styles.map((s) => `${s.name} (${s.id})`).join(", "),
        data: { styles },
      };
    },
  },
  {
    name: "get_style",
    title: "Pizza style",
    description: "Full parameters of one pizza style, including dough, shape, baking, preset versions, signature interpretations and topping IDs for generate_recipe.",
    inputSchema: {
      type: "object",
      properties: { style_id: { type: "string" } },
      required: ["style_id"],
    },
    run: (args) => {
      const style = styleById(args);
      return {
        summary: `${style.name}: ${style.description}`,
        data: {
          ...styleSummary(style),
          description: style.description,
          key_characteristics: style.key_characteristics,
          dough: style.dough,
          shape: style.shape,
          baking: style.baking,
          requires_pre_ferment: style.requires_pre_ferment,
          versions: getVersions(style.id),
          interpretations: getInterpretationsForStyle(style.id),
          toppings: Object.values(TOPPING_LIBRARY).filter(t=>t.preferred_for_styles?.includes(style.id)).map(t=>({id:t.id,concept_id:t.concept_ref,variant:t.variant_name,ingredients:t.ingredients})),
        },
      };
    },
  },
  {
    name: "recommend_styles",
    title: "Styles for my kitchen",
    description:
      "Rank pizza styles for a kitchen (oven type and temperature, hours available, skill). Each result has the score of the proposed recipe (0–100), the separate headroom of a tuned recipe, and whether the style is feasible. has_caveats: feasible with reservations, repeat its warnings and never call it suitable without conditions.",
    inputSchema: {
      type: "object",
      properties: { ...OVEN_INPUT, ...RECIPE_INPUT, style_id: {type:"string",description:"Optional scope; required when selecting version_id or interpretation_id."},
        include_not_feasible: {type:"boolean",description:"Include blocked styles with reasons, instead of only usable proposals."},
        include_recipe: {type:"boolean",description:"Include the evaluated recipe for each proposal."},
        limit: { type: "number", description: "How many styles (default 5)." } },
    },
    run: (args) => {
      const constraints = constraintsFrom(args);
      if ((args.version_id !== undefined || args.interpretation_id !== undefined) && args.style_id === undefined) throw new ToolInputError('style_id is required with a preset or signature');
      const onlyStyle = args.style_id === undefined ? undefined : styleById(args);
      const limit = Math.round(num(args, "limit", 1, 30, 5));
      const includeBlocked = optionalBoolean(args,"include_not_feasible") ?? false;
      const includeRecipe = optionalBoolean(args,"include_recipe") ?? false;
      const candidates = onlyStyle ? {[onlyStyle.id]:onlyStyle} : Object.fromEntries(Object.values(STYLES_DB).filter(s=>!s.dough.unleavened || !["biga","poolish"].includes(String(args.pre_ferment))).map(s=>[s.id,s]));
      const recs = recommendStyles(constraints, candidates, undefined,
        (style,c)=>recipeForInput(style,c,args).recipe)
        .map(rec => ({...rec, dietary_alternatives: dietaryRecipeAlternatives(rec.recipe, constraints,
          s => recipeForInput(s, constraints, {...args, topping_id:s.default_topping_ref}).recipe)}))
        .filter((rec) => includeBlocked || rec.tier !== "not_feasible" || rec.dietary_alternatives.length > 0)
        .map((rec) => {
          const now = rec.recipe.scores.composite;
          const evaluated = recipeData(rec.recipe);
          const scoped = Object.keys(RECIPE_INPUT).some(k=>args[k]!==undefined);
          const tunedArgs: Json = {...args,recipe_mode:"adapted"};
          for (const key of ["hydration_pct","flour_w","flour_pl","salt_pct","flour_blend","compensate_hydration","fermentation_hours","fermentation_temp_c","pre_ferment","pre_ferment_flour_pct"]) delete tunedArgs[key];
          const tuned = scoped ? recipeForInput(rec.style,constraints,tunedArgs).recipe : null;
          const best = Math.max(now, tuned ? tuned.verdict.outcome === "not_feasible" ? now : tuned.scores.composite : kitchenCompatibility(rec.style, constraints).best);
          return {
            ...styleSummary(rec.style),
            name: recipeDisplayName(rec.recipe,constraints.oven_type),
            reference_name: rec.style.name,
            compatibility: now,
            compatibility_best: best,
            tier: rec.tier,
            outcome: rec.verdict.outcome,
            blockers: rec.verdict.blockers,
            conditions: rec.verdict.conditions ?? [],
            dietary_warnings: evaluated.dietary_warnings,
            dietary_alternatives: rec.dietary_alternatives.map(a => ({
              topping_id:a.topping_id, omitted_conflicts:a.omitted_conflicts, removed:a.removed, added:a.added,
              outcome:a.recipe.verdict.outcome, compatibility:a.recipe.scores.composite,
              selection:{style_id:rec.style.id, recipe_mode:args.recipe_mode ?? "default", topping_id:a.topping_id},
              recipe:recipeData(a.recipe),
            })),
            ...(includeRecipe ? {recipe:evaluated} : {}),
            // Fattibile, ma con riserve da dire (forno sotto il minimo dello
            // stile, teglia mancante…): l'agente non deve presentarlo come
            // adatto senza riserve.
            has_caveats: rec.warnings.length > 0 || evaluated.dietary_warnings.length > 0,
            reasons: rec.reasons.map(msg),
            warnings: [...rec.warnings.map(msg), ...evaluated.dietary_warnings.map(w=>w.message)],
          };
        })
        // Per compatibilità con la cucina, il numero che l'agente mostra;
        // il limite si applica dopo, se no i migliori restano fuori.
        .sort((a, b) => b.compatibility - a.compatibility)
        .slice(0, limit);
      return {
        summary: recs.map((r) => `${r.name}: ${r.compatibility}/100`).join("; "),
        data: { constraints, styles: recs },
      };
    },
  },
  {
    name: "generate_recipe",
    title: "Pizza recipe",
    description:
      "Compute a complete recipe for a style and a kitchen: ingredients in grams and baker's percentages, fermentation, oven, timed steps and an explicit outcome (ok, warnings, not_feasible with the reasons). not_feasible: do not present it as a recipe to follow; explain the blockers and offer alternatives from recommend_styles. pre_ferment is two phases (pre-ferment with all the yeast, then final_dough) adding up to the totals. Step texts are Italian: translate without changing numbers. Call get_guide for the full rules.",
    inputSchema: {
      type: "object",
      properties: {
        style_id: { type: "string" },
        ...OVEN_INPUT,
        ...RECIPE_INPUT,
      },
      required: ["style_id"],
    },
    run: (args) => {
      const style = styleById(args);
      const constraints = constraintsFrom(args);
      const resolved = recipeForInput(style,constraints,args);
      const recipe = resolved.recipe;
      const alternatives = dietaryRecipeAlternatives(recipe, constraints, s => recipeForInput(s,constraints,{...args,topping_id:s.default_topping_ref}).recipe);
      const data = { ...recipeData(recipe), constraints, dietary_alternatives:alternatives.map(a => ({topping_id:a.topping_id, omitted_conflicts:a.omitted_conflicts,removed:a.removed,added:a.added,recipe:recipeData(a.recipe)})), selection: {recipe_mode:resolved.mode,version_id:resolved.version_id,interpretation_id:resolved.interpretation_id},
        effective_options: resolved.options };
      const grams = data.ingredients.map((i) => `${i.name} ${i.grams} g`).join(", ");
      return {
        summary: `${data.style.name}, ${recipe.dough_balls} × ${recipe.ball_weight_g} g (${recipe.verdict.outcome}): ${grams}. Fermentation ${recipe.fermentation_hours} h at ${recipe.fermentation_temp_c} °C, oven ${recipe.oven_temp_c} °C.`,
        data,
      };
    },
  },
  {
    name: "list_pantry_items",
    title: "Find flour and pantry ingredient IDs",
    description: "Search the same flour brands and dough/topping ingredients as the browser. Returns stable IDs for pantry and exclusion inputs; catalog W estimates are explicitly marked, never inferred from protein.",
    inputSchema: {type:"object",properties:{query:{type:"string"},kind:{type:"string",enum:["flour","ingredient","yeast","all"]}}},
    run: args => {
      const kind = enumInput(args,"kind",["flour","ingredient","yeast","all"]) ?? "all";
      if (args.query !== undefined && typeof args.query !== "string") throw new ToolInputError('query must be a string');
      const q = String(args.query ?? "").trim().toLocaleLowerCase("it");
      const items = [
        ...Object.entries(GENERIC_FLOURS).map(([id,name])=>({id,name,kind:"flour",w_range:FLOUR_W_RANGES[id],w_declared:false})),
        ...FLOURS_DB.filter(f=>!Object.prototype.hasOwnProperty.call(GENERIC_FLOURS,f.id)).map(f=>({id:f.id,name:f.name,kind:"flour",producer:f.producer,...(f.w>0?{w:f.w}:{}),...(f.pl>0?{pl:f.pl}:{}),protein_pct:f.proteine_pct,w_declared:f.w>0&&f.w_declared!==false})),
        ...PANTRY_INGREDIENTS.values(),...Object.entries(YEAST_LABELS).map(([id,name])=>({id,name,kind:"yeast"})),
      ].filter(item=>(kind==="all"||item.kind===kind)&&JSON.stringify(item).toLocaleLowerCase("it").includes(q));
      return {summary:`${items.length} pantry items`,data:{items}};
    },
  },
  {
    name: "get_guide",
    title: "How to use the pizza engine",
    description:
      "Full rules for presenting styles and recipes from this engine: kitchen questions, outcomes, pre-ferment phases, bake rounds, limits and answer format. Call it once before presenting a recipe.",
    inputSchema: { type: "object", properties: {} },
    run: () => ({ summary: MCP_GUIDE, data: { guide: MCP_GUIDE } }),
  },
  {
    name: "glossary",
    title: "Pizza glossary",
    description:
      "Definitions of pizza-making terms (W, P/L, hydration, biga, poolish, autolysis, bulk and final proof…) with ranges and why they matter. Without a term, returns the list of term ids.",
    inputSchema: {
      type: "object",
      properties: {
        term: { type: "string", description: "Term id or name (e.g. biga, w_alveograph, hydration)." },
        lang: { type: "string", enum: [...LANGS], description: "Language (default it)." },
      },
    },
    run: (args) => {
      const lang = (LANGS as readonly string[]).includes(String(args.lang)) ? (args.lang as Lang) : "it";
      const source = { glossaryTerms: GLOSSARY_BY_LANG[lang] as GlossaryMessages };
      const terms = GLOSSARY_TERMS.map((term) => getLocalizedTerm(term, source));
      const query = args.term ? String(args.term).toLowerCase() : "";
      if (!query) {
        return {
          summary: terms.map((t) => t.id).join(", "),
          data: { terms: terms.map((t) => ({ id: t.id, name: t.name, category: t.category })) },
        };
      }
      const term = terms.find((t) => t.id === query || t.name.toLowerCase().includes(query));
      if (!term) throw new ToolInputError(`no glossary term matches "${args.term}"`);
      return { summary: `${term.name}: ${term.definition}`, data: { ...term } };
    },
  },
];
