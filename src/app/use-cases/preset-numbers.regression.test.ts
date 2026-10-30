import { describe, expect, it } from "vitest";
import { STYLES_DB, type GeneratedRecipe, type UserConstraints } from "../domain/pizza-engine";
import { getInterpretationsForStyle } from "../data/interpretation-library";
import { getVersions } from "../data/style-versions";
import { authorVersionRecipe, canonicalRecipe, canonicalRecipeEntry, recipeFromEntry } from "./recipe-entry";

/* ═══ Tranche B1 · non regressione dei preset ═══
 * Il golden del motore (domain/golden) copre generateRecipe senza preset.
 * Qui i numeri chiave di ciò che si apre da un preset: il Riferimento di ogni
 * stile, ogni versione e ogni versione d'autore, su tre cucine (dispensa non
 * detta; solo lievito secco con dispensa completa; forno a legna). La tabella
 * è stata generata PRIMA della tranche B1 (lievito della fonte, tipo `autore`,
 * riferimento da una versione d'autore): finché nessun dato usa i campi nuovi
 * nessun numero può cambiare. Una differenza va spiegata con prima/dopo
 * (docs/motore-correzioni-2026-10-22.md), mai aggiornata alla cieca. */

const weights = { authenticity: .3, feasibility: .25, digestibility: .2, sustainability: .15, experimentation: .1 };
const base: UserConstraints = { oven_type: "home", oven_max_temp_c: 250, oven_capacity_temp_c: 250, skill_level: 2,
  available_hours: 24, dough_balls: 4, has_mixer: false, has_pizza_stone: false, has_pizza_steel: false,
  has_baking_pan: true, pantry_flours: [], pantry_yeasts: [], dietary_filters: [], kitchen_temp_c: 21 };
const KITCHENS: Record<string, UserConstraints> = {
  home: base,
  dryOnly: { ...base, pantry_yeasts: ["dry"], pantry_inventory_complete: true },
  wood: { ...base, oven_type: "wood", oven_max_temp_c: 450, oven_capacity_temp_c: 450, skill_level: 4, available_hours: 72 },
};

/** Una riga per ricetta: masse, lievito, processo, forno, tempi, esito. */
function row(r: GeneratedRecipe): string {
  const minutes = r.timeline.reduce((sum, step) => sum + step.duration_minutes, 0);
  return [
    `${r.dough_balls}×${r.ball_weight_g}g`,
    `F${r.flour_g} W${r.water_g} S${r.salt_g} G${r.fat_g} Z${r.sugar_g}`,
    `Y${r.yeast_g}${r.yeast_type} ${r.science.yeast_baker_pct}%`,
    `h${r.hydration_pct} W${r.flour_w} PL${r.flour_pl}`,
    `${r.fermentation_hours}h@${r.fermentation_temp_c}C${r.has_pre_ferment ? ` ${r.pre_ferment_type}${r.pre_ferment_flour_pct}` : ""}`,
    `${r.oven_temp_c}C ${r.cook_time_sec}s`,
    `${minutes}min`,
    r.verdict.outcome,
  ].join(" | ");
}

describe("B1 · numeri dei preset invariati", () => {
  it("Riferimento, versioni e versioni d'autore coincidono con preset-numbers.regression.json", async () => {
    const table: Record<string, string> = {};
    for (const [kitchen, constraints] of Object.entries(KITCHENS)) {
      for (const style of Object.values(STYLES_DB)) {
        table[`${kitchen} · ${style.id} · riferimento`] = row(canonicalRecipe(style, constraints, weights));
        for (const version of getVersions(style.id)) {
          table[`${kitchen} · ${style.id} · ${version.id}`] =
            row(recipeFromEntry(canonicalRecipeEntry(style, weights, null, version), constraints));
        }
        for (const it of getInterpretationsForStyle(style.id)) {
          table[`${kitchen} · ${style.id} · ${it.id}`] = row(authorVersionRecipe(style, it, constraints, weights));
        }
      }
    }
    await expect(JSON.stringify(table, null, 2) + "\n").toMatchFileSnapshot("./preset-numbers.regression.json");
  });
});
