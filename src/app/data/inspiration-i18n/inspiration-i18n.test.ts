import { describe, expect, it } from "vitest";
import { getAllInterpretations } from "../interpretation-library";
import { SIGNATURE_RECIPES } from "../signature-recipes";
import type { InspirationTranslation } from "./types";
import { INSPIRATION_I18N_EN } from "./en";
import { INSPIRATION_I18N_DE } from "./de";
import { INSPIRATION_I18N_ES } from "./es";
import { INSPIRATION_I18N_FR } from "./fr";
import { INSPIRATION_I18N_PT } from "./pt";
import { INSPIRATION_I18N_JA } from "./ja";
import { localizeInterpretation, localizeSignatureRecipe } from "./localize";

/* I18N-5 — ogni testo di ispirazioni e ricette iconiche ha la sua traduzione,
 * con gli stessi numeri dell'italiano (sono stati verificati sulle fonti) e
 * «Ispirata a…» che resta esplicito (C-5, D-027). */

const LOCALES: Record<string, InspirationTranslation> = {
  en: INSPIRATION_I18N_EN,
  de: INSPIRATION_I18N_DE,
  es: INSPIRATION_I18N_ES,
  fr: INSPIRATION_I18N_FR,
  pt: INSPIRATION_I18N_PT,
  ja: INSPIRATION_I18N_JA,
};

const FIELDS = ["signature_name", "technique_signature", "story", "badge"] as const;
const numbers = (text: string) => text.match(/\d+/g) ?? [];

describe.each(Object.entries(LOCALES))("ispirazioni tradotte · %s", (locale, tr) => {
  it("ogni campo di ogni ispirazione", () => {
    const missing = getAllInterpretations().flatMap((it) =>
      FIELDS.filter((f) => it[f] && !tr.interpretations[it.id]?.[f]).map((f) => `${it.id}.${f}`),
    );
    expect(missing).toEqual([]);
  });

  it("nome e descrizione di ogni ricetta iconica", () => {
    const missing = SIGNATURE_RECIPES.filter(
      (r) => !tr.recipes[r.id]?.name || !tr.recipes[r.id]?.description,
    ).map((r) => r.id);
    expect(missing).toEqual([]);
  });

  it("nessuna voce orfana", () => {
    const ids = new Set(getAllInterpretations().map((it) => it.id));
    const recipeIds = new Set(SIGNATURE_RECIPES.map((r) => r.id));
    expect(Object.keys(tr.interpretations).filter((id) => !ids.has(id))).toEqual([]);
    expect(Object.keys(tr.recipes).filter((id) => !recipeIds.has(id))).toEqual([]);
  });

  it("stessi numeri dell'italiano", () => {
    const wrong: string[] = [];
    for (const it of getAllInterpretations()) {
      const t = localizeInterpretation(it, tr);
      for (const f of FIELDS) {
        const source = it[f];
        if (!source) continue;
        for (const n of numbers(source)) if (!t[f]!.includes(n)) wrong.push(`${it.id}.${f}: ${n}`);
      }
    }
    for (const r of SIGNATURE_RECIPES) {
      const t = localizeSignatureRecipe(r, tr);
      for (const n of numbers(r.description)) if (!t.description.includes(n)) wrong.push(`${r.id}: ${n}`);
    }
    expect(wrong).toEqual([]);
  });

  it.runIf(locale !== "ja")("«Ispirata a…» resta esplicito", () => {
    const lost = getAllInterpretations()
      .filter((it) => it.signature_name?.startsWith("Ispirata"))
      .filter((it) => !/inspir/i.test(tr.interpretations[it.id]?.signature_name ?? ""))
      .map((it) => it.id);
    expect(lost).toEqual([]);
  });
});
