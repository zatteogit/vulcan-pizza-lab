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
  generateRecipe,
  recommendStyles,
  type EngineMsg,
  type GeneratedRecipe,
  type OvenType,
  type PizzaStyle,
  type PreFermentType,
  type SkillLevel,
  type UserConstraints,
} from "../domain/pizza-engine";
import { computePreFermentSplit } from "../domain/pre-ferment-split";
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

export const MCP_SERVER_INFO = { name: `${BRAND.name.toLowerCase()}-pizza-engine`, version: "1.0.0" } as const;

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

/** Errore di input: il server lo restituisce come risultato con isError. */
export class ToolInputError extends Error {}

function num(args: Json, key: string, min: number, max: number, fallback?: number): number {
  const raw = args[key];
  if (raw === undefined || raw === null) {
    if (fallback === undefined) throw new ToolInputError(`missing "${key}"`);
    return fallback;
  }
  const value = Number(raw);
  if (!Number.isFinite(value) || value < min || value > max) {
    throw new ToolInputError(`"${key}" must be a number between ${min} and ${max}`);
  }
  return value;
}

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
  return {
    oven_type: ovenType as OvenType,
    oven_max_temp_c: num(args, "oven_max_temp_c", 150, 550, preset?.maxTemp ?? 250),
    skill_level: num(args, "skill_level", 1, 4, 2) as SkillLevel,
    available_hours: num(args, "available_hours", 1, 168, 24),
    // Per un agente «ho 6 ore» vuol dire «si mangia fra 6 ore»: con le ore
    // la scadenza vale, salvo meal_deadline: false esplicito.
    meal_deadline: args.meal_deadline == null ? args.available_hours != null : args.meal_deadline === true,
    dough_balls: wholeNumber(args, "dough_balls", 1, 200, 4),
    has_mixer: args.has_mixer === true,
    has_pizza_stone: args.has_pizza_stone === true,
    has_pizza_steel: args.has_pizza_steel === true,
    has_baking_pan: args.has_baking_pan === true,
    dietary_filters: [],
    pantry_flours: [],
    pantry_yeasts: [],
  };
}

/** Testo italiano di riserva di un messaggio del motore, con i parametri. */
function msg(m: EngineMsg): string {
  return m.fallback.replace(/\{(\w+)\}/g, (_, k: string) => String(m.params?.[k] ?? `{${k}}`));
}

function styleSummary(style: PizzaStyle) {
  return {
    id: style.id,
    name: style.name,
    family: style.family,
    origin: style.origin,
    hydration_pct_range: style.dough.hydration_pct_range,
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
    style: { id: recipe.style.id, name: recipe.style.name },
    outcome: recipe.verdict.outcome,
    blockers: recipe.verdict.blockers,
    dough_balls: recipe.dough_balls,
    ball_weight_g: recipe.ball_weight_g,
    total_dough_g: recipe.total_dough_g,
    hydration_pct: recipe.hydration_pct,
    flour_w: recipe.flour_w,
    fermentation_hours: recipe.fermentation_hours,
    fermentation_temp_c: recipe.fermentation_temp_c,
    pre_ferment: preFermentData(recipe),
    oven_temp_c: recipe.oven_temp_c,
    cook_time_sec: recipe.cook_time_sec,
    water_temp_c: recipe.water_temp_c,
    ingredients,
    steps: recipe.timeline.map((step) => ({
      id: step.id,
      title: step.title,
      description: step.description,
      duration_minutes: step.duration_minutes,
    })),
    scores: recipe.scores,
  };
}

const OVEN_INPUT = {
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
    description: "Full parameters of one pizza style: dough, shape, baking, characteristics.",
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
        },
      };
    },
  },
  {
    name: "recommend_styles",
    title: "Styles for my kitchen",
    description:
      "Rank pizza styles for a kitchen (oven type and temperature, hours available, skill). Each result has the compatibility with that kitchen (0–100, same number as the app), how far a tuned recipe can go, and whether the style is feasible.",
    inputSchema: {
      type: "object",
      properties: { ...OVEN_INPUT, limit: { type: "number", description: "How many styles (default 5)." } },
    },
    run: (args) => {
      const constraints = constraintsFrom(args);
      const limit = Math.round(num(args, "limit", 1, 30, 5));
      const recs = recommendStyles(constraints)
        .filter((rec) => rec.tier !== "not_feasible")
        .map((rec) => {
          const { now, best } = kitchenCompatibility(rec.style, constraints);
          return {
            ...styleSummary(rec.style),
            compatibility: now,
            compatibility_best: best,
            tier: rec.tier,
            // Fattibile, ma con riserve da dire (forno sotto il minimo dello
            // stile, teglia mancante…): l'agente non deve presentarlo come
            // adatto senza riserve.
            has_caveats: rec.warnings.length > 0,
            reasons: rec.reasons.map(msg),
            warnings: rec.warnings.map(msg),
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
      "Compute a complete recipe for a style and a kitchen: ingredients in grams and baker's percentages, fermentation, oven, timed steps and an explicit outcome (ok, warnings, not_feasible with the reasons).",
    inputSchema: {
      type: "object",
      properties: {
        style_id: { type: "string" },
        ...OVEN_INPUT,
        hydration_pct: { type: "number", description: "Override hydration (%)." },
        fermentation_hours: { type: "number", description: "Override fermentation hours." },
        fermentation_temp_c: { type: "number", description: "Override fermentation temperature (°C)." },
        pre_ferment: { type: "string", enum: ["none", "biga", "poolish"], description: "Override the pre-ferment." },
        ball_weight_g: { type: "number", description: "Override the weight of one dough ball (g)." },
      },
      required: ["style_id"],
    },
    run: (args) => {
      const style = styleById(args);
      const constraints = constraintsFrom(args);
      const preFerment = args.pre_ferment ? String(args.pre_ferment) : null;
      if (preFerment && !["none", "biga", "poolish"].includes(preFerment)) {
        throw new ToolInputError(`"pre_ferment" must be none, biga or poolish`);
      }
      const recipe = generateRecipe(style, constraints, {
        customHydration: args.hydration_pct != null ? num(args, "hydration_pct", 40, 110) : undefined,
        customFermentationHours: args.fermentation_hours != null ? num(args, "fermentation_hours", 0.5, 168) : undefined,
        customFermentationTempC: args.fermentation_temp_c != null ? num(args, "fermentation_temp_c", 1, 35) : undefined,
        usePreFerment: preFerment ? preFerment !== "none" : undefined,
        preFerment: preFerment && preFerment !== "none" ? { type: preFerment as PreFermentType } : undefined,
        panConfig: args.ball_weight_g != null ? { ballWeightG: num(args, "ball_weight_g", 20, 5000) } : undefined,
      });
      const data = recipeData(recipe);
      const grams = data.ingredients.map((i) => `${i.name} ${i.grams} g`).join(", ");
      return {
        summary: `${style.name}, ${recipe.dough_balls} × ${recipe.ball_weight_g} g (${recipe.verdict.outcome}): ${grams}. Fermentation ${recipe.fermentation_hours} h at ${recipe.fermentation_temp_c} °C, oven ${recipe.oven_temp_c} °C.`,
        data,
      };
    },
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
