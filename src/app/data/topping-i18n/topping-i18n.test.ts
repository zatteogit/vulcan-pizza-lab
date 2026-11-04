import { describe, expect, it } from "vitest";
import { TOPPING_CONCEPTS, TOPPING_LIBRARY } from "../topping-library";
import type { ToppingTranslation } from "./types";
import { T, TIP } from "./registry";
import { TOPPING_I18N_IT } from "./it";
import { TOPPING_I18N_EN } from "./en";
import { TOPPING_I18N_DE } from "./de";
import { TOPPING_I18N_ES } from "./es";
import { TOPPING_I18N_FR } from "./fr";
import { TOPPING_I18N_PT } from "./pt";
import { TOPPING_I18N_JA } from "./ja";

/* I18N-2 — ogni concetto, ricetta e passo della libreria ha la sua traduzione.
 * Una voce mancante ricadrebbe in silenzio sull'italiano: qui fallisce.
 * Budget D-059 (31/10/2026): anche l'italiano è un catalogo (it.ts); la
 * libreria tiene i segnaposto T / TIP dove c'è un testo, e ogni segnaposto
 * deve avere il suo testo in ogni lingua. */

const LOCALES: Record<string, ToppingTranslation> = {
  it: TOPPING_I18N_IT,
  en: TOPPING_I18N_EN,
  de: TOPPING_I18N_DE,
  es: TOPPING_I18N_ES,
  fr: TOPPING_I18N_FR,
  pt: TOPPING_I18N_PT,
  ja: TOPPING_I18N_JA,
};

const recipes = Object.values(TOPPING_LIBRARY);
type AnyStep = { id: string; title: string; description: string; description_short_bake?: string; description_no_pan_proof?: string; tip?: { beginner: string; nerd: string } };
const steps: AnyStep[] = recipes.flatMap((r) => [...(r.pre_prep_steps ?? []), ...(r.assembly_steps ?? [])]);
const stepIds = steps.map((s) => s.id);

/** I campi di testo della libreria per ogni lingua, letti dalla forma dei
 *  letterali (presenza dei segnaposto), non dai cataloghi. */
function rawValue<O extends object>(obj: O, key: string): unknown {
  const desc = Object.getOwnPropertyDescriptor(obj, key);
  return desc ? (desc.get ? "testo" : desc.value) : undefined;
}

describe("libreria condimenti: solo struttura e chiavi", () => {
  it("i passi hanno id unici (il catalogo li indicizza per id)", () => {
    expect(new Set(stepIds).size).toBe(stepIds.length);
  });

  it("nessun testo dei condimenti resta nei dati: dove c'è un testo c'è un getter sul catalogo", () => {
    const plain: string[] = [];
    for (const [id, c] of Object.entries(TOPPING_CONCEPTS)) if (typeof Object.getOwnPropertyDescriptor(c, "description")?.get !== "function") plain.push(`${id}.description`);
    for (const r of recipes) {
      if (r.variant_name !== undefined && rawValue(r, "variant_name") !== "testo") plain.push(`${r.id}.variant_name`);
      if (r.bake_adjustments?.note !== undefined && rawValue(r.bake_adjustments, "note") !== "testo") plain.push(`${r.id}.bake_note`);
      r.ingredients.forEach((ing, i) => { if (ing.notes !== undefined && rawValue(ing, "notes") !== "testo") plain.push(`${r.id}#${i}.notes`); });
    }
    for (const s of steps) for (const key of ["title", "description", "description_short_bake", "description_no_pan_proof", "tip"]) {
      if ((s as unknown as Record<string, unknown>)[key] !== undefined && rawValue(s, key) !== "testo") plain.push(`${s.id}.${key}`);
    }
    expect(plain).toEqual([]);
  });

  it("con l'italiano registrato nessun segnaposto arriva al lettore", () => {
    const leaks: string[] = [];
    const check = (path: string, v: unknown) => { if (v === T || v === TIP || (typeof v === "string" && v.includes(T))) leaks.push(path); };
    for (const [id, c] of Object.entries(TOPPING_CONCEPTS)) check(`${id}.description`, c.description);
    for (const r of recipes) {
      check(`${r.id}.variant_name`, r.variant_name);
      check(`${r.id}.bake_note`, r.bake_adjustments?.note);
      r.ingredients.forEach((ing, i) => check(`${r.id}#${i}.notes`, ing.notes));
    }
    for (const s of steps) {
      check(`${s.id}.title`, s.title);
      check(`${s.id}.description`, s.description);
      check(`${s.id}.short`, s.description_short_bake);
      check(`${s.id}.noPanProof`, s.description_no_pan_proof);
      check(`${s.id}.tip.beginner`, s.tip?.beginner);
      check(`${s.id}.tip.nerd`, s.tip?.nerd);
    }
    expect(leaks).toEqual([]);
  });
});

describe.each(Object.entries(LOCALES))("condimenti tradotti · %s", (locale, tr) => {
  it("tutti i concetti hanno la descrizione (e, nelle lingue straniere, il nome)", () => {
    const missing = Object.keys(TOPPING_CONCEPTS).filter((id) => !tr.concepts[id]?.description || (locale !== "it" && !tr.concepts[id]?.name));
    expect(missing).toEqual([]);
  });

  it("tutte le ricette hanno i loro testi e gli ingredienti", () => {
    const missing = recipes.flatMap((r) => {
      const t = tr.recipes[r.id];
      const out: string[] = [];
      if (rawValue(r, "variant_name") !== undefined && !t?.variant_name) out.push(`${r.id}.variant_name`);
      if (r.bake_adjustments && rawValue(r.bake_adjustments, "note") !== undefined && !t?.bake_note) out.push(`${r.id}.bake_note`);
      r.ingredients.forEach((ing, i) => {
        const ti = t?.ingredients?.[String(i)];
        /* Il nome italiano resta nei dati (chiave di dispensa e allergeni). */
        if (locale !== "it" && !ti?.name) out.push(`${r.id}#${i}.name`);
        if (rawValue(ing, "notes") !== undefined && !ti?.notes) out.push(`${r.id}#${i}.notes`);
      });
      return out;
    });
    expect(missing).toEqual([]);
  });

  it("tutti i passi hanno titolo, descrizione, variante breve e consigli dove li ha la libreria", () => {
    const missing = steps.flatMap((s) => {
      const t = tr.steps[s.id];
      const out: string[] = [];
      if (!t?.title) out.push(`${s.id}.title`);
      if (!t?.description) out.push(`${s.id}.description`);
      if (rawValue(s, "description_short_bake") !== undefined && !t?.description_short_bake) out.push(`${s.id}.description_short_bake`);
      if (rawValue(s, "tip") !== undefined && (!t?.tip_beginner || !t?.tip_nerd)) out.push(`${s.id}.tip`);
      return out;
    });
    expect(missing).toEqual([]);
  });

  it("i testi alternativi dei passi sono tradotti (B3: senza appretto in teglia)", () => {
    const missing = recipes.flatMap((r) => r.assembly_steps ?? [])
      .filter((s) => s.description_no_pan_proof && !tr.steps[s.id]?.description_no_pan_proof)
      .map((s) => s.id);
    expect(missing).toEqual([]);
  });

  it("nessuna voce orfana (id che la libreria non ha più)", () => {
    const ids = new Set(stepIds);
    const orphans = [
      ...Object.keys(tr.concepts).filter((id) => !TOPPING_CONCEPTS[id]),
      ...Object.keys(tr.recipes).filter((id) => !TOPPING_LIBRARY[id]),
      ...Object.keys(tr.steps).filter((id) => !ids.has(id)),
    ];
    expect(orphans).toEqual([]);
  });
});
