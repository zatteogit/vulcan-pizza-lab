import { describe, expect, it } from "vitest";
import { TOPPING_CONCEPTS, TOPPING_LIBRARY } from "../topping-library";
import type { ToppingTranslation } from "./types";
import { TOPPING_I18N_EN } from "./en";
import { TOPPING_I18N_DE } from "./de";
import { TOPPING_I18N_ES } from "./es";
import { TOPPING_I18N_FR } from "./fr";
import { TOPPING_I18N_PT } from "./pt";
import { TOPPING_I18N_JA } from "./ja";

/* I18N-2 — ogni concetto, ricetta e passo della libreria ha la sua traduzione.
 * Una voce mancante ricadrebbe in silenzio sull'italiano: qui fallisce. */

const LOCALES: Record<string, ToppingTranslation> = {
  en: TOPPING_I18N_EN,
  de: TOPPING_I18N_DE,
  es: TOPPING_I18N_ES,
  fr: TOPPING_I18N_FR,
  pt: TOPPING_I18N_PT,
  ja: TOPPING_I18N_JA,
};

const recipes = Object.values(TOPPING_LIBRARY);
const stepIds = recipes.flatMap((r) =>
  [...(r.pre_prep_steps ?? []), ...(r.assembly_steps ?? [])].map((s) => s.id),
);

describe.each(Object.entries(LOCALES))("condimenti tradotti · %s", (_locale, tr) => {
  it("tutti i concetti hanno il nome", () => {
    const missing = Object.keys(TOPPING_CONCEPTS).filter((id) => !tr.concepts[id]?.name);
    expect(missing).toEqual([]);
  });

  it("tutte le ricette hanno i loro testi e gli ingredienti", () => {
    const missing = recipes.flatMap((r) => {
      const t = tr.recipes[r.id];
      const out: string[] = [];
      if (r.variant_name && !t?.variant_name) out.push(`${r.id}.variant_name`);
      if (r.name && !t?.name) out.push(`${r.id}.name`);
      if (r.description && !t?.description) out.push(`${r.id}.description`);
      if (r.bake_adjustments?.note && !t?.bake_note) out.push(`${r.id}.bake_note`);
      r.ingredients.forEach((ing, i) => {
        const ti = t?.ingredients?.[String(i)];
        if (!ti?.name) out.push(`${r.id}#${i}.name`);
        if (ing.notes && !ti?.notes) out.push(`${r.id}#${i}.notes`);
      });
      return out;
    });
    expect(missing).toEqual([]);
  });

  it("tutti i passi hanno titolo e descrizione", () => {
    const missing = stepIds.filter((id) => !tr.steps[id]?.title || !tr.steps[id]?.description);
    expect(missing).toEqual([]);
  });

  it("nessuna voce orfana (id che la libreria non ha più)", () => {
    const steps = new Set(stepIds);
    const orphans = [
      ...Object.keys(tr.concepts).filter((id) => !TOPPING_CONCEPTS[id]),
      ...Object.keys(tr.recipes).filter((id) => !TOPPING_LIBRARY[id]),
      ...Object.keys(tr.steps).filter((id) => !steps.has(id)),
    ];
    expect(orphans).toEqual([]);
  });
});
