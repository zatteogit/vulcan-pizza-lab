import { describe, expect, it } from "vitest";
import { SIGNATURE_RECIPES, signatureRecipeLink } from "../../data/signature-recipes";
import { CMS_DEFAULTS, type CmsContent } from "../cms/cms-context";
import { DEFAULT_SEARCH_SUGGESTIONS, SEARCH_SUGGESTION_IDS, parseEdition } from "../../config/edition";
import { editionOvenModels } from "../../data/oven-models";
import { GLOSSARY_TERMS, getLocalizedTerm } from "../../data/glossary-data";
import DEMO_EDITION from "../../../../editions/demo-forno.json";
import { UI_MESSAGES_IT } from "../../i18n/ui-messages.it";
import { FLOURS_DB } from "../../data/flour-database";
import { DE_LOCALE } from "../cms/locales/de";
import { EN_LOCALE } from "../cms/locales/en";
import { ES_LOCALE } from "../cms/locales/es";
import { FR_LOCALE } from "../cms/locales/fr";
import { JA_LOCALE } from "../cms/locales/ja";
import { PT_LOCALE } from "../cms/locales/pt";
import {
  GROUP_ORDER,
  buildSearchIndex,
  fold,
  groupResults,
  highlightRanges,
  rankForKitchen,
  searchIndex,
  searchLexicon,
  snippetAround,
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
      /* G1a-WP-02: le guide sono i prefermenti (#pf-) e le pagine di Impara. */
      if (e.type === "guide") expect(e.link).toMatch(/^\/learn(\/|$)/);
      if (e.type === "oven") expect(e.link).toMatch(/^\/profile\?tab=setup&ovenQuery=/);
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
    expect(find("celiachia")).toContain("flour-mix_gluten_free");
    expect(find("pinza")[0]).toBe("style-pinsa_romana");
    expect(find("non lievita")).toContain("problem-P04");
  });

  it("anche in inglese, col dizionario della lingua", () => {
    const en = (q: string) => searchIndex(EN, q, LXE).map((r) => r.id);
    expect(en("baker's yeast")).toContain("glossary-yeast");
    expect(en("coeliac")).toContain("flour-mix_gluten_free");
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

/* FW-09 revisione (S04-A-03), sicurezza alimentare: chi cerca «senza glutine»
 * o «celiachia» trova solo ciò che è senza glutine. Il gruppo di sinonimi non
 * contiene la parola generica («glutine», «gluten»…), che riporterebbe il
 * farro, la spelta e i testi che parlano del glutine. In tutte e 7 le lingue. */
describe("ricerca senza glutine (sicurezza alimentare)", () => {
  const GLUTEN_FREE = new Set(FLOURS_DB.filter((f) => f.category === "gluten_free").map((f) => `flour-${f.id}`));
  const LOCALES: [string, CmsContent, string[]][] = [
    ["it", CMS_DEFAULTS, ["celiachia", "celiaco", "senza glutine"]],
    ["en", { ...CMS_DEFAULTS, ...EN_LOCALE } as CmsContent, ["coeliac", "celiac disease", "gluten free", "gluten-free"]],
    ["de", { ...CMS_DEFAULTS, ...DE_LOCALE } as CmsContent, ["zöliakie", "glutenfrei", "ohne gluten"]],
    ["fr", { ...CMS_DEFAULTS, ...FR_LOCALE } as CmsContent, ["maladie cœliaque", "coeliaque", "sans gluten"]],
    ["es", { ...CMS_DEFAULTS, ...ES_LOCALE } as CmsContent, ["celiaquía", "celíaco", "sin gluten"]],
    ["pt", { ...CMS_DEFAULTS, ...PT_LOCALE } as CmsContent, ["doença celíaca", "celíaco", "sem glúten"]],
    ["ja", { ...CMS_DEFAULTS, ...JA_LOCALE } as CmsContent, ["セリアック病", "グルテンフリー"]],
  ];

  for (const [locale, cms, queries] of LOCALES) {
    const index = buildSearchIndex(cms);
    const lexicon = searchLexicon(cms.pages);

    it(`${locale}: celiachia e senza glutine trovano solo farine senza glutine`, () => {
      for (const q of queries) {
        const found = searchIndex(index, q, lexicon).map((r) => r.id);
        expect(found, `${locale} «${q}»`).toContain("flour-mix_gluten_free");
        expect(found.filter((id) => !GLUTEN_FREE.has(id)), `${locale} «${q}»`).toEqual([]);
      }
    });

    it(`${locale}: il gruppo della celiachia non contiene la parola generica`, () => {
      const group = lexicon.synonyms.find((g) => g.includes(fold(queries[queries.length - 1])));
      expect(group, locale).toBeDefined();
      for (const generic of ["glutine", "gluten", "グルテン"]) expect(group, locale).not.toContain(generic);
    });
  }

  /* Le espressioni di più parole del dizionario valgono come frase: «senza» e
     «glutine» sparsi in un testo non bastano per «celiachia». */
  const SCATTERED: [string, CmsContent, string, string, string][] = [
    ["it", CMS_DEFAULTS, "celiachia", "Stendi senza strappare: il glutine regge", "Farina senza glutine"],
    ["de", { ...CMS_DEFAULTS, ...DE_LOCALE } as CmsContent, "zöliakie", "Ohne Eile ziehen, das Gluten hält", "Mehl ohne Gluten"],
    ["fr", { ...CMS_DEFAULTS, ...FR_LOCALE } as CmsContent, "coeliaque", "Étirez sans forcer : le gluten tient", "Farine sans gluten"],
    ["es", { ...CMS_DEFAULTS, ...ES_LOCALE } as CmsContent, "celiaquía", "Estira sin forzar: el gluten aguanta", "Harina sin gluten"],
    ["pt", { ...CMS_DEFAULTS, ...PT_LOCALE } as CmsContent, "celíaco", "Abra sem forçar: o glúten aguenta", "Farinha sem glúten"],
  ];
  for (const [locale, cms, query, scattered, phrase] of SCATTERED) {
    it(`${locale}: le parole della frase sparse nel testo non bastano`, () => {
      const items = [{ id: "sparse", text: scattered }, { id: "frase", text: phrase }];
      const found = filterByQuery(items, (i) => i.text, query, searchLexicon(cms.pages)).map((i) => i.id);
      expect(found, `${locale} «${query}»`).toEqual(["frase"]);
    });
  }

  it("la parola generica resta una ricerca a sé: «glutine» trova anche il farro", () => {
    const LX = searchLexicon(CMS_DEFAULTS.pages);
    expect(searchIndex(IT, "glutine", LX).map((r) => r.id)).toContain("flour-farro_spelta");
  });
});

/* FW-15 (S04-A-08, S01-A-06): ogni suggerimento che un'edizione può proporre
   trova qualcosa in ogni lingua, e nessuno è un marchio o una persona. */
describe("suggerimenti della ricerca", () => {
  const LOCALES = { en: EN_LOCALE, de: DE_LOCALE, es: ES_LOCALE, fr: FR_LOCALE, pt: PT_LOCALE, ja: JA_LOCALE };
  const key = (id: string) => `components.shared.search-overlay.suggestion.${id}`;

  it("ogni suggerimento dà risultati in tutte e 7 le lingue", () => {
    const indexes: [string, CmsContent, Record<string, string>][] = [
      ["it", CMS_DEFAULTS, UI_MESSAGES_IT],
      ...Object.entries(LOCALES).map(([lang, bundle]) =>
        [lang, { ...CMS_DEFAULTS, ...bundle } as CmsContent, bundle.messages ?? {}] as [string, CmsContent, Record<string, string>]),
    ];
    for (const [lang, cms, messages] of indexes) {
      const index = buildSearchIndex(cms);
      const lexicon = searchLexicon(cms.pages);
      for (const id of SEARCH_SUGGESTION_IDS) {
        const text = messages[key(id)];
        expect(text, `${lang} ${id}`).toBeTruthy();
        expect(searchIndex(index, text, lexicon).length, `${lang} «${text}»`).toBeGreaterThan(0);
      }
    }
  });

  it("niente marchi né nomi di persona fra i suggerimenti", () => {
    expect(SEARCH_SUGGESTION_IDS).not.toContain("caputo");
    expect(SEARCH_SUGGESTION_IDS).not.toContain("bonci");
    expect(DEFAULT_SEARCH_SUGGESTIONS.every((id) => SEARCH_SUGGESTION_IDS.includes(id))).toBe(true);
  });
});

/* G1a-WP-01 (S04-A-01, S04-B-02, S04-B-07): le farine portano alla loro scheda
 * e la nota si cerca solo nella lingua attiva. */
describe("farine nella ricerca", () => {
  it("ogni risultato farina porta a /learn/flour/<id>", () => {
    const flours = IT.filter((e) => e.type === "flour");
    expect(flours.length).toBe(FLOURS_DB.length);
    for (const e of flours) expect(e.link).toBe(`/learn/flour/${e.id.slice("flour-".length)}`);
    expect(ids(IT, "caputo")).toContain("flour-caputo_pizzeria");
  });

  it("la nota italiana non si trova più in inglese: «idratazione» non porta a Petra 5037", () => {
    expect(ids(IT, "idratazione")).toContain("flour-petra_5037");
    expect(ids(EN, "idratazione")).not.toContain("flour-petra_5037");
    expect(ids(EN, "hydration")).toContain("flour-petra_5037");
  });
});

/* G1a-WP-02: forni, guide, ordine dei gruppi, estratto. Indici come in cima
 * al file (it, en, ja), con il dizionario della lingua. */
describe("G1a-WP-02 — forni, guide, ordine, estratto", () => {
  const LOCALES: [string, CmsContent][] = [
    ["it", CMS_DEFAULTS],
    ["en", { ...CMS_DEFAULTS, ...EN_LOCALE } as CmsContent],
    ["ja", { ...CMS_DEFAULTS, ...JA_LOCALE } as CmsContent],
  ];
  const search = (cms: CmsContent, q: string, index = buildSearchIndex(cms)) =>
    searchIndex(index, q, searchLexicon(cms.pages));

  it.each(LOCALES)("%s: «effeuno» trova un forno che apre il Profilo con la ricerca compilata", (_l, cms) => {
    const ovens = search(cms, "effeuno").filter((r) => r.type === "oven");
    expect(ovens.length).toBeGreaterThan(0);
    expect(ovens[0].link).toMatch(/^\/profile\?tab=setup&ovenQuery=Effeuno%20/);
  });

  it("edizione demo: «aurora» trova i 3 forni del partner e «ooni» nessun forno", () => {
    const index = buildSearchIndex(CMS_DEFAULTS, editionOvenModels(parseEdition(DEMO_EDITION)));
    expect(search(CMS_DEFAULTS, "aurora", index).filter((r) => r.type === "oven")).toHaveLength(3);
    expect(search(CMS_DEFAULTS, "ooni", index).filter((r) => r.type === "oven")).toHaveLength(0);
  });

  it("le pagine e i percorsi di Impara sono guide: «fermentazione» ne trova almeno una", () => {
    expect(search(CMS_DEFAULTS, "fermentazione").some((r) => r.type === "guide")).toBe(true);
    const links = buildSearchIndex(CMS_DEFAULTS).filter((e) => e.type === "guide").map((e) => e.link);
    for (const link of ["/learn/glossary", "/learn/troubleshooting", "/learn/pre-ferments", "/learn/metodo", "/learn"]) {
      expect(links).toContain(link);
    }
  });

  it.each(LOCALES)("%s: «lievito madre» apre col glossario o le guide, non con le farine", (_l, cms) => {
    const sourdough = getLocalizedTerm(GLOSSARY_TERMS.find((t) => t.id === "sourdough")!, cms).name;
    const first = groupResults(search(cms, sourdough))[0]?.[0];
    expect(["glossary", "guide"]).toContain(first);
    expect(GROUP_ORDER.indexOf("glossary")).toBeLessThan(GROUP_ORDER.indexOf("flour"));
    expect(GROUP_ORDER.indexOf("guide")).toBeLessThan(GROUP_ORDER.indexOf("oven"));
  });

  /* «pinsa» → Biga dell'audit non c'è più (la biga non elenca la pinsa fra
     gli stili): l'estratto si prova con «impasto appiccicoso» → Segale, l'altro
     esempio di S04-B-07, e con l'ora di maturazione della biga. */
  it("«impasto appiccicoso»: la segale mostra l'estratto della nota con la parola trovata", () => {
    const segale = search(CMS_DEFAULTS, "impasto appiccicoso").find((r) => r.id === "flour-segale");
    expect(segale?.snippet?.toLowerCase()).toContain("appiccicoso");
    expect(segale!.snippet!.length).toBeLessThanOrEqual(120);
  });

  it("i prefermenti nella ricerca hanno i numeri del motore, non i segnaposto", () => {
    for (const [, cms] of LOCALES) {
      for (const e of buildSearchIndex(cms).filter((x) => x.id.startsWith("guide-"))) {
        expect(`${e.subtitle} ${e.extraRaw ?? ""}`, e.id).not.toMatch(/\{[a-zA-Z]+\}/);
      }
    }
  });

  it.each(LOCALES)("%s: chi è trovato nel titolo non ha estratto", (_l, cms) => {
    const hits = search(cms, "biga");
    expect(hits.length).toBeGreaterThan(0);
    for (const r of hits) if (r.score > 0) expect(r.snippet).toBeUndefined();
  });

  it("estratto tagliato sulle parole, con «…» ai bordi", () => {
    const text = "Una frase lunga che parla di molte cose diverse prima di arrivare alla pinsa romana, e poi continua ancora per parecchio tempo.";
    const s = snippetAround(text, "pinsa")!;
    expect(s.startsWith("…")).toBe(true);
    expect(s.endsWith("…")).toBe(true);
    expect(s).toContain("pinsa");
    expect(snippetAround(text, "assente")).toBeUndefined();
  });
});
