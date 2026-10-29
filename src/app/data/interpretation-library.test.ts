import { describe, expect, it } from "vitest";
import { STYLES_DB, type UserConstraints } from "../domain/pizza-engine";
import { canonicalRecipeEntry, recipeFromEntry } from "../use-cases/recipe-entry";
import { getAllInterpretations, getInterpretationsForStyle, isBlockedByStyle } from "./interpretation-library";

/* FW-14 (S07-A-01, decisione B del 28/10/2026): sotto la Napoletana STG non
 * si offrono come versioni le ricette canotto (Pepe, Capuano): contraddicono il
 * disciplinare che la scheda stessa cita. Bianco resta sulla STG come
 * «Ispirata a…» (docs/fonti-dati.md §5). */
describe("versioni offerte sulla STG", () => {
  it("nessuna versione con base canotto", () => {
    const offered = getInterpretationsForStyle("napoletana_stg");
    expect(offered.filter((it) => it.base_style_id === "napoletana_canotto").map((it) => it.id)).toEqual([]);
    expect(offered.map((it) => it.id)).not.toContain("pepe_caiazzo");
    expect(offered.map((it) => it.id)).not.toContain("capuano_napoli");
  });
  it("Pepe e Capuano restano sul canotto", () => {
    const canotto = getInterpretationsForStyle("napoletana_canotto").map((it) => it.id);
    expect(canotto).toEqual(expect.arrayContaining(["pepe_caiazzo", "capuano_napoli"]));
  });
});

/* FW-14 (revisione, S07-A-01): sulla STG le versioni bloccate dallo stile
 * stesso non si offrono. Verifica sul motore, con la cucina ideale: nessuna
 * versione offerta su nessuno stile esce «non fattibile» per un limite dello
 * stile (lievitazione o temperatura imposta). */
describe("versioni offerte e verdetto del motore", () => {
  const ideal: UserConstraints = {
    oven_type: "wood", oven_max_temp_c: 485, available_hours: 72,
    skill_level: 4, dough_balls: 4, has_mixer: true,
    has_pizza_stone: true, has_pizza_steel: true, has_baking_pan: true,
    pantry_flours: [], pantry_yeasts: [], dietary_filters: [],
  };
  const styleLimits = new Set(["fermentation_too_long", "fermentation_too_short", "fermentation_temperature"]);
  it("sulla STG ogni versione offerta è fattibile; Sorbillo (24 h) e Bianco (18 h) non sono offerte", () => {
    const style = STYLES_DB.napoletana_stg;
    const offered = getInterpretationsForStyle(style.id);
    expect(offered.map((it) => it.id)).not.toContain("sorbillo_napoli");
    expect(offered.map((it) => it.id)).not.toContain("bianco_phoenix");
    expect(offered.length).toBeGreaterThan(0);
    for (const it of offered) {
      const recipe = recipeFromEntry(canonicalRecipeEntry(style, undefined, it), ideal);
      expect(recipe.verdict.outcome, it.id).not.toBe("not_feasible");
    }
  });
  it("su ogni stile nessuna versione offerta è bloccata dai limiti dello stile", () => {
    for (const style of Object.values(STYLES_DB)) {
      for (const it of getInterpretationsForStyle(style.id)) {
        const recipe = recipeFromEntry(canonicalRecipeEntry(style, undefined, it), ideal);
        const blocked = recipe.verdict.blockers.filter((b) => styleLimits.has(b.kind)).map((b) => b.kind);
        expect(blocked, `${style.id} · ${it.id}`).toEqual([]);
      }
    }
  });
  it("il filtro coincide con il motore: le versioni escluse sono davvero bloccate dallo stile", () => {
    for (const it of getAllInterpretations()) {
      for (const id of [it.base_style_id, ...(it.compatible_style_ids ?? [])]) {
        const style = STYLES_DB[id];
        if (!style || !isBlockedByStyle(it, style)) continue;
        const recipe = recipeFromEntry(canonicalRecipeEntry(style, undefined, it), ideal);
        expect(recipe.verdict.blockers.some((b) => styleLimits.has(b.kind)), `${id} · ${it.id}`).toBe(true);
      }
    }
  });
});
