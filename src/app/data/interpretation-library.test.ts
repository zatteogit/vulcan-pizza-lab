import { describe, expect, it } from "vitest";
import { STYLES_DB, type UserConstraints } from "../domain/pizza-engine";
import { canonicalRecipeEntry, recipeFromEntry } from "../use-cases/recipe-entry";
import { getAllInterpretations, getInterpretationsForStyle, isBlockedByStyle, relatedAuthorVersions } from "./interpretation-library";

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

/* G1b-WP-01 (S03-A-14, S03-B-16): le versioni d'autore del pannello stile
 * dicono da dove vengono. Le voci sono quelle offerte dallo stile; quelle di
 * un altro stile hanno relation 'compatible' e la UI scrive «da {stile}». */
describe("relatedAuthorVersions", () => {
  const ids = (styleId: string) => relatedAuthorVersions(styleId).map((v) => `${v.interpretation.id}:${v.relation}`);
  it("sulla STG solo versioni nate sulla STG, il disciplinare in testa", () => {
    expect(ids("napoletana_stg")).toEqual(["avpn_disciplinare:base", "da_michele_napoli:base"]);
  });
  it("sulla teglia la versione di Forkish arriva dal New York ed è in coda", () => {
    expect(ids("teglia_romana")).toEqual([
      "apiter_teglia:base", "bonci_pizzarium:base", "bosco_aria_di_pane:base", "forkish_portland:compatible",
    ]);
  });
  it("ogni voce è dello stile o compatibile, le stesse di getInterpretationsForStyle", () => {
    for (const styleId of Object.keys(STYLES_DB)) {
      const related = relatedAuthorVersions(styleId);
      expect(related.map((v) => v.interpretation.id).sort(), styleId)
        .toEqual(getInterpretationsForStyle(styleId).map((it) => it.id).sort());
      for (const { interpretation, relation } of related) {
        if (relation === "base") expect(interpretation.base_style_id).toBe(styleId);
        else expect(interpretation.compatible_style_ids, interpretation.id).toContain(styleId);
      }
      const ranks = related.map((v) => (v.relation === "base" ? (v.interpretation.verified_canonical ? 0 : 1) : 2));
      expect(ranks, styleId).toEqual([...ranks].sort((a, b) => a - b));
    }
  });
  it("l'ordine è stabile tra due chiamate", () => {
    for (const styleId of Object.keys(STYLES_DB)) expect(ids(styleId)).toEqual(ids(styleId));
  });
});
