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
  searchLexicon,
} from "./search-index";
import { editDistance, filterByQuery } from "./text-match";

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

/* FW-09 (S04-A-02, S04-B-04, S04-B-05, S04-A-03, S04-A-10, S13-A-09): le
 * query dei finding. Prima tutte davano 0 risultati. */
describe("ricerca con le parole dell'utente (FW-09)", () => {
  const LX = searchLexicon(CMS_DEFAULTS.pages);
  const ENC = { ...CMS_DEFAULTS, ...EN_LOCALE } as CmsContent;
  const LXE = searchLexicon(ENC.pages);
  const find = (q: string) => searchIndex(IT, q, LX).map((r) => r.id);

  it("una lettera cerca i simboli del glossario, esatti", () => {
    expect(find("W")).toEqual(["glossary-w_alveograph"]);
    expect(find("p")).toEqual(expect.arrayContaining(["glossary-p_tenacity", "glossary-pl_ratio"]));
    expect(find("L")).toContain("glossary-l_extensibility");
    expect(find("a")).toEqual([]);
  });

  it("refusi: «napoletna», «napoletanna», «mozarela»", () => {
    expect(find("napoletna")[0]).toBe("style-napoletana_stg");
    expect(find("napoletanna")).toContain("style-napoletana_stg");
    expect(find("mozarela").length).toBeGreaterThan(0);
    expect(searchIndex(IT, "napoletna", LX).every((r) => r.fuzzy)).toBe(true);
  });

  it("flessioni e parole vuote: «bruciata», «pizza bruciata»", () => {
    expect(find("bruciata")).toContain("problem-P09");
    expect(find("pizza bruciata")).toContain("problem-P09");
  });

  it("sinonimi del CMS: «lievito di birra», «forno di casa», «celiachia», «pinza», «non lievita»", () => {
    expect(find("lievito di birra")).toContain("glossary-yeast");
    expect(find("forno di casa").some((id) => id.startsWith("style-"))).toBe(true);
    expect(find("celiachia")).toContain("glossary-gluten");
    expect(find("pinza")[0]).toBe("style-pinsa_romana");
    expect(find("non lievita")).toContain("problem-P04");
  });

  it("anche in inglese, col dizionario della lingua", () => {
    const en = (q: string) => searchIndex(EN, q, LXE).map((r) => r.id);
    expect(en("baker's yeast")).toContain("glossary-yeast");
    expect(en("coeliac")).toContain("glossary-gluten");
    expect(en("home oven").some((id) => id.startsWith("style-"))).toBe(true);
  });

  it("le ricerche esatte non cambiano", () => {
    expect(find("napoletana")).toEqual(ids(IT, "napoletana"));
    expect(find("pizza fritta")).toContain("style-pizza_fritta");
    expect(find("xyzqq")).toEqual([]);
  });

  it("distanza di modifica con trasposizioni", () => {
    expect(editDistance("pinsa", "pinza", 1)).toBe(1);
    expect(editDistance("lievtio", "lievito", 1)).toBe(1);
    expect(editDistance("mozarela", "mozzarella", 2)).toBe(2);
    expect(editDistance("abc", "xyz", 1)).toBeGreaterThan(1);
  });

  it("le ricerche di pagina usano le stesse regole", () => {
    const issues = [{ id: "a", text: "Base cruda ma cornicione bruciato" }, { id: "b", text: "Nessuna lievitazione dopo 6 ore" }];
    expect(filterByQuery(issues, (i) => i.text, "bruciata", LX).map((i) => i.id)).toEqual(["a"]);
    expect(filterByQuery(issues, (i) => i.text, "non lievita", LX).map((i) => i.id)).toEqual(["b"]);
    expect(filterByQuery(issues, (i) => i.text, "cornicoine", LX).map((i) => i.id)).toEqual(["a"]);
  });
});
