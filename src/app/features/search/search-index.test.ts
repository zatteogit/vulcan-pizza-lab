import { describe, expect, it } from "vitest";
import { SIGNATURE_RECIPES, signatureRecipeLink } from "../../data/signature-recipes";
import { CMS_DEFAULTS, type CmsContent } from "../cms/cms-context";
import { EN_LOCALE } from "../cms/locales/en";
import { JA_LOCALE } from "../cms/locales/ja";
import {
  buildSearchIndex,
  fold,
  groupResults,
  highlightRanges,
  rankForKitchen,
  searchIndex,
} from "./search-index";

/* U-5 — la ricerca trova i testi della lingua attiva, ignora accenti e
 * maiuscole, vuole tutte le parole e mette prima i titoli che corrispondono. */

const IT = buildSearchIndex(CMS_DEFAULTS);
const EN = buildSearchIndex({ ...CMS_DEFAULTS, ...EN_LOCALE } as CmsContent);
const JA = buildSearchIndex({ ...CMS_DEFAULTS, ...JA_LOCALE } as CmsContent);

const ids = (index: typeof IT, q: string) => searchIndex(index, q).map((r) => r.id);

describe("ricerca", () => {
  it("sotto i due caratteri non cerca", () => {
    expect(searchIndex(IT, "")).toEqual([]);
    expect(searchIndex(IT, " a ")).toEqual([]);
  });

  it("accenti e maiuscole non contano", () => {
    expect(fold("Pâte FERMENTÉE")).toBe("pate fermentee");
    expect(ids(IT, "NAPOLETANA")).toEqual(ids(IT, "napoletana"));
    expect(ids(IT, "napoletana").length).toBeGreaterThan(0);
  });

  it("i segni giapponesi restano (が non è か)", () => {
    expect(fold("が")).not.toBe(fold("か"));
  });

  it("tutte le parole, in qualunque ordine", () => {
    const both = ids(IT, "pizza fritta");
    expect(both).toContain("style-pizza_fritta");
    expect(ids(IT, "fritta pizza")).toEqual(expect.arrayContaining(both));
    for (const r of searchIndex(IT, "pizza fritta")) {
      expect(r.id).not.toBe("style-detroit");
    }
  });

  it("il titolo che inizia con la ricerca viene prima", () => {
    const [first] = searchIndex(IT, "detroit");
    expect(first.id).toBe("style-detroit");
    expect(first.score).toBe(3);
  });

  it("i condimenti si trovano nella lingua attiva e col nome italiano", () => {
    const enTitles = searchIndex(EN, "margherita").filter((r) => r.type === "topping");
    expect(enTitles.length).toBeGreaterThan(0);
    // il nome italiano resta cercabile anche in inglese
    expect(ids(EN, "boscaiola").length).toBeGreaterThan(0);
  });

  it("glossario e problemi in giapponese", () => {
    const glossary = JA.filter((e) => e.type === "glossary");
    const problems = JA.filter((e) => e.type === "problem");
    expect(glossary.some((e) => /[぀-ヿ一-龯]/.test(e.title))).toBe(true);
    expect(problems.some((e) => /[぀-ヿ一-龯]/.test(e.title))).toBe(true);
  });

  it("ogni risultato porta a una pagina precisa", () => {
    for (const e of IT) {
      expect(e.link.startsWith("/")).toBe(true);
      if (e.type === "problem") expect(e.link).toMatch(/\?issue=/);
      if (e.type === "glossary") expect(e.link).toMatch(/#/);
      if (e.type === "guide") expect(e.link).toMatch(/#pf-/);
    }
  });

  it("gruppi: prima quello col risultato più pertinente", () => {
    const groups = groupResults(searchIndex(IT, "biga"));
    expect(groups.length).toBeGreaterThan(0);
    const best = Math.max(...groups.map(([, items]) => items[0].score));
    expect(groups[0][1][0].score).toBe(best);
  });
});

describe("evidenziazione", () => {
  it("trova il tratto senza badare agli accenti", () => {
    expect(highlightRanges("Pâte fermentée", "fermentee")).toEqual([[5, 14]]);
  });

  it("una parola per tratto, fusi se si toccano", () => {
    expect(highlightRanges("Pizza al taglio romana", "romana taglio")).toEqual([
      [9, 15],
      [16, 22],
    ]);
    expect(highlightRanges("Margherita", "mar argh")).toEqual([[0, 5]]);
  });

  it("niente tratti sotto i due caratteri", () => {
    expect(highlightRanges("Margherita", "m")).toEqual([]);
  });
});

describe("FW-10: stili e cucina", () => {
  it("il sottotitolo non ripete la famiglia, che resta cercabile", () => {
    const fritta = searchIndex(IT, "fritta").find((r) => r.id === "style-pizza_fritta");
    expect(fritta?.subtitle).not.toBe("Napoletana");
    expect(fritta?.subtitle).toMatch(/Napoli/);
    expect(ids(IT, "napoletana")).toContain("style-pizza_fritta");
  });
  it("a parità di pertinenza prima gli stili fattibili; quelli bloccati aprono la versione adattata", () => {
    const hits = searchIndex(IT, "napoletana");
    const blocked = new Set(["napoletana_stg"]);
    const ranked = rankForKitchen(hits, (id) => ({ blocked: blocked.has(id), now: blocked.has(id) ? 25 : 80 }));
    const stg = ranked.find((r) => r.id === "style-napoletana_stg")!;
    const sameScore = ranked.filter((r) => r.score === stg.score && r.type === "style");
    expect(sameScore[sameScore.length - 1].id).toBe("style-napoletana_stg");
    expect(stg.link).toContain("mode=adapted");
    expect(ranked.map((r) => r.score)).toEqual([...ranked.map((r) => r.score)].sort((a, b) => b - a));
    expect(ranked).toHaveLength(hits.length);
  });
});

/* FW-14 (S04-B-03): le ricette iconiche dalla ricerca aprono la loro versione. */
describe("ricette iconiche dalla ricerca", () => {
  it("ogni ricetta con una versione dichiarata porta ?interpretation= nel link", () => {
    for (const rec of SIGNATURE_RECIPES) {
      const hit = IT.find((e) => e.id === `recipe-${rec.id}`);
      expect(hit?.link, rec.id).toBe(signatureRecipeLink(rec));
      if (rec.interpretation_id) expect(hit?.link, rec.id).toContain(`interpretation=${rec.interpretation_id}`);
    }
  });
});
