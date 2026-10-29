import { describe, expect, it } from "vitest";
import { getContextualWarnings, getStepTroubleshooting, groupIssuesByPhase, ISSUE_GLOSSARY_TERMS, ISSUE_SCIENCE_NOTES, ISSUES_DB, QUICK_HELP_ISSUE_IDS, TROUBLESHOOTING_PHASE_ORDER } from "./troubleshooting-data";
import { getScienceNote } from "./science-notes";
import { thresholdFor } from "../domain/science/engine-facts";
import { STYLES_DB } from "../domain/styles-db";
import { TROUBLESHOOTING_I18N_DEFAULTS } from "../features/cms/domain-i18n-defaults";
import { TROUBLESHOOTING_EN } from "../features/cms/locales/domain-en";
import { TROUBLESHOOTING_DE } from "../features/cms/locales/domain-de";
import { TROUBLESHOOTING_ES } from "../features/cms/locales/domain-es";
import { TROUBLESHOOTING_FR } from "../features/cms/locales/domain-fr";
import { TROUBLESHOOTING_PT } from "../features/cms/locales/domain-pt";
import { TROUBLESHOOTING_JA } from "../features/cms/locales/domain-ja";

const params = {
  hydration: 63, flourW: 285, flourPL: 0.6, fermentHours: 16,
  fermentTemp: 4, ovenTemp: 175, skillLevel: 2, usePreFerment: false,
  style: thresholdFor(STYLES_DB.napoletana_stg),
};

describe("avvisi contestuali per il metodo di cottura", () => {
  it("mantiene l'avviso di forno sotto la temperatura dello stile per una ricetta al forno", () => {
    expect(getContextualWarnings(params).some(w => w.issueId === "P10")).toBe(true);
  });

  it("non scambia l'olio della frittura per un forno freddo", () => {
    const warnings = getContextualWarnings({ ...params, usesOven: false });
    expect(warnings.some(w => w.issueId === "P10" || w.issueId === "P09")).toBe(false);
  });

  it("continua a segnalare i problemi dell'impasto anche se la ricetta è fritta", () => {
    const warnings = getContextualWarnings({ ...params, usesOven: false, hydration: 80, flourW: 220 });
    expect(warnings.some(w => w.issueId === "P01")).toBe(true);
    expect(warnings.some(w => w.issueId === "P10")).toBe(false);
  });
});

/* FW-05 (S13-V-01, S13-A-11, D-I): i consigli di Crea sono relativi allo stile
 * scelto e non contraddicono gli stili che l'app stessa propone. */
describe("FW-05 avvisi contestuali relativi allo stile", () => {
  const base = { flourPL: 0.6, fermentHours: 24, fermentTemp: 4, ovenTemp: 300, skillLevel: 1, usePreFerment: false };

  it("teglia romana all'80% per chi comincia: nessun avviso di idratazione né di impasto appiccicoso", () => {
    const warnings = getContextualWarnings({ ...base, hydration: 80, flourW: 330, style: thresholdFor(STYLES_DB.teglia_romana) });
    expect(warnings.filter(w => w.issueId === "P01")).toEqual([]);
  });

  it("canotto con una Manitoba W 390: nessun avviso di farina troppo forte", () => {
    const warnings = getContextualWarnings({ ...base, hydration: 70, flourW: 390, skillLevel: 3, style: thresholdFor(STYLES_DB.napoletana_canotto) });
    expect(warnings.some(w => w.issueId === "P19")).toBe(false);
  });

  it("farina sotto la forbice dello stile: il consiglio cita la forbice dello stile", () => {
    const warnings = getContextualWarnings({ ...base, hydration: 80, flourW: 250, skillLevel: 3, style: thresholdFor(STYLES_DB.teglia_romana) }, { troubleshootingI18n: TROUBLESHOOTING_I18N_DEFAULTS });
    const sticky = warnings.find(w => w.issueId === "P01");
    expect(sticky?.tip).toContain("300–380");
  });

  it("idratazione oltre lo stile per chi comincia: consiglio relativo, non «60-65%»", () => {
    const warnings = getContextualWarnings({ ...base, hydration: 72, flourW: 300, style: thresholdFor(STYLES_DB.napoletana_stg) }, { troubleshootingI18n: TROUBLESHOOTING_I18N_DEFAULTS });
    const tip = warnings.find(w => w.message.includes("principianti"))?.tip ?? "";
    expect(tip).toContain("55–62");
  });

  it("forno di casa e focaccia genovese: nessun «forno freddo»; con la STG crosta pallida (P10), non base cruda", () => {
    expect(getContextualWarnings({ ...base, hydration: 60, flourW: 260, ovenTemp: 250, style: thresholdFor(STYLES_DB.focaccia_genovese) }).some(w => w.issueId === "P10")).toBe(false);
    const stg = getContextualWarnings({ ...base, hydration: 60, flourW: 280, ovenTemp: 250, style: thresholdFor(STYLES_DB.napoletana_stg) });
    expect(stg.some(w => w.issueId === "P10")).toBe(true);
    expect(stg.some(w => w.issueId === "P09")).toBe(false);
  });

  it("il rischio acido non indica una soglia oraria, come P06", () => {
    for (const copy of [TROUBLESHOOTING_I18N_DEFAULTS, TROUBLESHOOTING_EN, TROUBLESHOOTING_DE, TROUBLESHOOTING_ES, TROUBLESHOOTING_FR, TROUBLESHOOTING_PT, TROUBLESHOOTING_JA]) {
      expect(copy.contextual?.sour_risk?.tip).not.toMatch(/\d/);
    }
  });
});

describe("FW-05 diagnosi della fase", () => {
  it("in frigo la puntata non propone «non cresce» (S13-B-02)", () => {
    expect(getStepTroubleshooting({ id: "bulk" })!.issueIds).toContain("P04");
    const cold = getStepTroubleshooting({ id: "bulk" }, { coldRetard: true })!;
    expect(cold.issueIds).not.toContain("P04");
    expect(cold.initialIssueId).toBe("P03");
  });

  it("con un mix senza glutine niente diagnosi sul glutine (S13-B-14)", () => {
    const shape = getStepTroubleshooting({ id: "shape" }, { glutenFree: true })!;
    expect(shape.issueIds).toEqual(["P23", "P08"]);
    expect(getStepTroubleshooting({ id: "shape" }, { unleavened: true, glutenFree: true })).toBeUndefined();
  });

  it("l'odore chimico sta nella lievitazione, non nell'impasto (S13-A-02)", () => {
    expect(getStepTroubleshooting({ id: "mix" })!.issueIds).not.toContain("P20");
    expect(getStepTroubleshooting({ id: "bulk" })!.issueIds).toContain("P20");
    expect(ISSUES_DB.find(i => i.id === "P20")!.category).toBe("fermentation");
  });

  it("P04 e P03 non sono più critici e P04 non propone subito altro lievito", () => {
    expect(ISSUES_DB.find(i => i.id === "P04")!.severity).toBe("warning");
    expect(ISSUES_DB.find(i => i.id === "P03")!.severity).toBe("warning");
    expect(ISSUES_DB.find(i => i.id === "P04")!.fixImmediate).not.toMatch(/0[.,]3/);
  });

  it("P06 non chiede il pH al livello 1 e P10 esclude lo zucchero nella STG, in tutte le lingue", () => {
    for (const copy of [TROUBLESHOOTING_I18N_DEFAULTS, TROUBLESHOOTING_EN, TROUBLESHOOTING_DE, TROUBLESHOOTING_ES, TROUBLESHOOTING_FR, TROUBLESHOOTING_PT, TROUBLESHOOTING_JA]) {
      expect(copy.issues?.P06?.testRapido).not.toMatch(/pH/);
      expect(copy.issues?.P10?.prevention).toContain("STG");
    }
  });
});

describe("troubleshooting limitato alla fase effettiva", () => {
  it("il passo bake in variante fry non apre problemi del forno", () => {
    const ids = getStepTroubleshooting({ id: "bake", variant: "fry" })!.issueIds;
    expect(ids).toEqual(["FR01", "FR02"]);
    expect(ids.every(id => ISSUES_DB.find(issue => issue.id === id)?.category === "frying")).toBe(true);
    expect(getStepTroubleshooting({ id: "bake", variant: "fry" }, { filled: true })!.issueIds).toContain("FR03");
  });

  it("valuta ogni cottura separatamente e non parla di topping nella prima cottura in bianco", () => {
    expect(getStepTroubleshooting({ id: "bake2" }, { filled: true })!.issueIds).toContain("P09");
    expect(getStepTroubleshooting({ id: "bake2" })!.issueIds).not.toContain("FR01");
    expect(getStepTroubleshooting({ id: "bake", msg: { title: { key: "timeline.bakeWhite.title", fallback: "Prima cottura in bianco" } } })!.issueIds).not.toContain("P18");
  });

  it("impasto e stesura non rimandano alla cottura", () => {
    for (const id of ["mix", "shape"]) {
      expect(getStepTroubleshooting({ id })!.issueIds.every(key => ["dough", "shaping"].includes(ISSUES_DB.find(issue => issue.id === key)!.category))).toBe(true);
    }
  });

  it("i riposi senza lievito e le fasi sconosciute non ereditano un problema generico", () => {
    for (const id of ["bulk", "proof"]) expect(getStepTroubleshooting({ id }, { unleavened: true })).toBeUndefined();
    expect(getStepTroubleshooting({ id: "custom_topping_bake" })).toBeUndefined();
    expect(getStepTroubleshooting({ id: "shape" }, { unleavened: true })!.issueIds).not.toContain("P02");
  });

  it("tutti gli ID contestuali esistono, senza duplicati o selezioni fuori contesto", () => {
    for (const id of ["preferment", "mix", "bulk", "proof", "shape", "bake", "bake2"]) {
      const context = getStepTroubleshooting({ id })!;
      expect(new Set(context.issueIds).size).toBe(context.issueIds.length);
      expect(context.issueIds.every(key => ISSUES_DB.some(issue => issue.id === key))).toBe(true);
      if (context.initialIssueId) expect(context.issueIds).toContain(context.initialIssueId);
    }
  });

  it("i tre problemi di frittura hanno tutti i campi nelle sette lingue", () => {
    for (const copy of [TROUBLESHOOTING_I18N_DEFAULTS, TROUBLESHOOTING_EN, TROUBLESHOOTING_DE, TROUBLESHOOTING_ES, TROUBLESHOOTING_FR, TROUBLESHOOTING_PT, TROUBLESHOOTING_JA]) {
      expect(copy.categories?.frying).toBeTruthy();
      for (const id of ["FR01", "FR02", "FR03"]) {
        const issue = copy.issues?.[id];
        expect(issue).toBeDefined();
        for (const field of ["symptom", "cause", "testRapido", "fixImmediate", "prevention"] as const) expect(issue?.[field]).toBeTruthy();
      }
    }
  });

  it("«Qualcosa non va?» di Impara: ogni id esiste, uno per categoria, con il titolo nelle sette lingue (G4a-WP-05)", () => {
    const categories = QUICK_HELP_ISSUE_IDS.map((id) => ISSUES_DB.find((issue) => issue.id === id)?.category);
    expect(categories.every(Boolean)).toBe(true);
    expect(new Set(categories).size).toBe(QUICK_HELP_ISSUE_IDS.length);
    for (const copy of [TROUBLESHOOTING_EN, TROUBLESHOOTING_DE, TROUBLESHOOTING_ES, TROUBLESHOOTING_FR, TROUBLESHOOTING_PT, TROUBLESHOOTING_JA]) {
      for (const id of QUICK_HELP_ISSUE_IDS) expect(copy.issues?.[id]?.symptom).toBeTruthy();
    }
  });
});

/* G4b-WP-03 (S13-A-16, S13-B-13, S13-A-10): fasi coerenti col momento in cui
 * il problema si vede, gruppi per fase e le voci che mancavano al principiante. */
describe("G4b-WP-03 problemi per fase", () => {
  const ALL = [TROUBLESHOOTING_I18N_DEFAULTS, TROUBLESHOOTING_EN, TROUBLESHOOTING_DE, TROUBLESHOOTING_ES, TROUBLESHOOTING_FR, TROUBLESHOOTING_PT, TROUBLESHOOTING_JA];

  it("P03 sta nella fermentazione e P16 nella stesura", () => {
    expect(ISSUES_DB.find((i) => i.id === "P03")!.category).toBe("fermentation");
    expect(ISSUES_DB.find((i) => i.id === "P16")!.category).toBe("shaping");
    expect(getStepTroubleshooting({ id: "shape" })!.issueIds).toContain("P16");
  });

  it("ogni voce ha una fase dell'ordine, senza «Algoritmo»", () => {
    expect(ISSUES_DB.every((i) => (TROUBLESHOOTING_PHASE_ORDER as readonly string[]).includes(i.category))).toBe(true);
    for (const copy of ALL) expect(copy.categories?.solver).toBeUndefined();
  });

  it("gruppi nell'ordine della preparazione, critici in alto, nessun gruppo vuoto", () => {
    const groups = groupIssuesByPhase(ISSUES_DB);
    expect(groups.map((g) => g.phase)).toEqual([...TROUBLESHOOTING_PHASE_ORDER]);
    expect(groups.flatMap((g) => g.issues).length).toBe(ISSUES_DB.length);
    const rank = { critical: 0, warning: 1, info: 2 };
    for (const g of groups) {
      const ranks = g.issues.map((i) => rank[i.severity]);
      expect(ranks).toEqual([...ranks].sort((a, b) => a - b));
    }
    const baking = groups.find((g) => g.phase === "baking")!;
    expect(baking.issues[0].id).toBe("P09");
    expect(groupIssuesByPhase(ISSUES_DB.filter((i) => i.id === "P22")).map((g) => g.phase)).toEqual(["shaping"]);
  });

  it("pala, panetto che si allarga e buchi in stesura: stesura, in sette lingue, senza soglie numeriche", () => {
    for (const id of ["P22", "P23", "P24"]) {
      expect(ISSUES_DB.find((i) => i.id === id)!.category).toBe("shaping");
      expect(getScienceNote(ISSUE_SCIENCE_NOTES[id])?.kind).toBe("editorial");
      expect(ISSUE_GLOSSARY_TERMS[id]?.length).toBeGreaterThan(0);
      for (const copy of ALL) {
        const issue = copy.issues?.[id];
        for (const field of ["symptom", "cause", "testRapido", "fixImmediate", "prevention"] as const) {
          expect(issue?.[field], `${id}.${field}`).toBeTruthy();
          expect(issue?.[field], `${id}.${field}`).not.toMatch(/\d/);
        }
      }
    }
  });

  it("P22 solo con la pala, anche in cottura; P23 nell'appretto e in stesura", () => {
    expect(getStepTroubleshooting({ id: "shape" })!.issueIds).not.toContain("P22");
    expect(getStepTroubleshooting({ id: "bake" })!.issueIds).not.toContain("P22");
    expect(getStepTroubleshooting({ id: "shape" }, { peel: true })!.issueIds).toContain("P22");
    expect(getStepTroubleshooting({ id: "bake" }, { peel: true })!.issueIds[0]).toBe("P22");
    expect(getStepTroubleshooting({ id: "bake", variant: "fry" }, { peel: true })!.issueIds).not.toContain("P22");
    expect(getStepTroubleshooting({ id: "proof" })!.issueIds).toContain("P23");
    expect(getStepTroubleshooting({ id: "shape" })!.issueIds).toEqual(expect.arrayContaining(["P23", "P24"]));
  });
});
