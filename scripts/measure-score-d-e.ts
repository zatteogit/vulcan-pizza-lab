/* D-E (audit 28/10/2026): misura l'effetto sulla classifica degli stili del
 * passaggio a una «Compatibilità con la tua cucina» fatta solo di fattibilità
 * e fedeltà allo stile. Stesso calcolo di Crea: ricetta su misura
 * (tailoredRecipeEntry), sezioni D-032 (recommendationSections), ordine per
 * punteggio dentro ogni sezione e, a pari punteggio, margine della cucina
 * (D-062, compareByCompatibility). Uso: npx vite-node scripts/measure-score-d-e.ts */
import { recommendStyles, type UserConstraints, type ScoreWeightsOverride } from "../src/app/domain/pizza-engine";
import { tailoredRecipeEntry, canonicalRecipe } from "../src/app/use-cases/recipe-entry";
import { recommendationSections } from "../src/app/domain/create-entry";
import { presentationTier } from "../src/app/use-cases/recommendation-groups";
import { compareByCompatibility, kitchenMargin } from "../src/app/domain/kitchen-margin";

/** Pesi prima di D-E (cinque dimensioni). */
const BEFORE: ScoreWeightsOverride = { authenticity: 0.30, feasibility: 0.25, digestibility: 0.20, sustainability: 0.15, experimentation: 0.10 };
/** Pesi dopo D-E; l'ultimo argomento li sostituisce, es. «0.55,0.45». */
const arg = process.argv[2]?.split(",").map(Number);
const AFTER: ScoreWeightsOverride = { authenticity: arg?.[0] ?? 0.55, feasibility: arg?.[1] ?? 0.45, digestibility: 0, sustainability: 0, experimentation: 0 };

const base: Omit<UserConstraints, "oven_type" | "oven_max_temp_c" | "skill_level"> = {
  available_hours: 48, meal_deadline: false, dough_balls: 4,
  has_mixer: false, has_baking_pan: true, has_pizza_stone: false, has_pizza_steel: false,
  pantry_flours: [], pantry_yeasts: [], dietary_filters: [],
};
const PROFILES: { id: string; label: string; c: UserConstraints }[] = [
  { id: "P1", label: "Forno di casa elettrico 250 °C, teglia, livello 2", c: { ...base, oven_type: "home", oven_max_temp_c: 250, skill_level: 2 } },
  { id: "P2", label: "Forno da pizza elettrico 450 °C con pietra, livello 3", c: { ...base, oven_type: "electric_high", oven_max_temp_c: 450, skill_level: 3, has_pizza_stone: true, has_mixer: true } },
  { id: "P3", label: "Forno a legna 480 °C, livello 4", c: { ...base, oven_type: "wood", oven_max_temp_c: 480, skill_level: 4, has_pizza_stone: true, has_mixer: true } },
];

interface Row { id: string; name: string; section: string; score: number; original: number; margin: number; pos: number }

function ranking(c: UserConstraints, w: ScoreWeightsOverride): Row[] {
  const recs = recommendStyles(c, undefined, undefined, (style, cur) => tailoredRecipeEntry(style, cur, w).recipe)
    .map((rec) => ({ ...rec, now: rec.recipe.scores.composite, original: canonicalRecipe(rec.style, c, w).scores.composite, margin: kitchenMargin(rec.style, c) }));
  const sections = recommendationSections(recs,
    (items) => [...items].sort((a, b) => compareByCompatibility({ score: a.now, margin: a.margin }, { score: b.now, margin: b.margin })),
    (r) => presentationTier(r, c));
  const rows: Row[] = [];
  for (const s of sections) {
    for (const r of s.items) rows.push({ id: r.style.id, name: r.style.name, section: s.key, score: r.now, original: r.original, margin: Math.round(r.margin * 100) / 100, pos: rows.length + 1 });
  }
  return rows;
}

const result = PROFILES.map(({ id, label, c }) => ({ id, label, before: ranking(c, BEFORE), after: ranking(c, AFTER) }));
console.log(JSON.stringify(result, null, 1));
