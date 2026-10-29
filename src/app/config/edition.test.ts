import { describe, expect, it } from "vitest";
import {
  DEFAULT_SEARCH_SUGGESTIONS,
  EDITION,
  NEUTRALITY_STATEMENTS,
  PARTNER_RELATIONSHIPS,
  SEARCH_SUGGESTION_IDS,
  editionSearchSuggestions,
  parseEdition,
  partnerNeutrality,
  partnerRelationship,
} from "./edition";
import { ALL_OVEN_MODELS, OVEN_MODELS, editionOvenModels } from "../data/oven-models";
import { UI_MESSAGES_IT } from "../i18n/ui-messages.it";

const files = import.meta.glob("../../../editions/*.json", { eager: true, import: "default" });
const publicEditions = Object.entries(files)
  .map(([file, data]) => ({ file: file.split("/").pop()!, edition: parseEdition(data) }));

describe("edizioni pubbliche (editions/)", () => {
  it("ci sono la generalista e almeno una demo", () => {
    expect(publicEditions.map(({ edition }) => edition.kind)).toEqual(expect.arrayContaining(["generalist", "demo"]));
  });

  it("il nome del file è l'id", () => {
    for (const { file, edition } of publicEditions) expect(file).toBe(`${edition.id}.json`);
  });

  it("nel repository pubblico niente edizioni di marchi reali", () => {
    for (const { edition } of publicEditions) expect(edition.kind).not.toBe("partner");
  });

  it("il forno preimpostato esiste nel catalogo dell'edizione e il catalogo non è vuoto", () => {
    for (const { edition } of publicEditions) {
      const catalog = editionOvenModels(edition);
      expect(catalog.length).toBeGreaterThan(0);
      if (edition.ovens?.default) expect(catalog.map((model) => model.id)).toContain(edition.ovens.default);
    }
  });

  it("la generalista è la build predefinita e non cambia il catalogo", () => {
    expect(EDITION.id).toBe("vulcan");
    expect(editionOvenModels(EDITION)).toEqual(ALL_OVEN_MODELS);
  });
});

describe("parseEdition", () => {
  const base = { schema: 1, id: "prova", kind: "demo", indexing: "noindex", partner: { name: "Forni Prova", invented: true } };

  it("accetta un'edizione completa", () => {
    expect(parseEdition(base).id).toBe("prova");
  });

  it.each([
    ["demo indicizzata", { ...base, indexing: "index" }],
    ["demo con marchio non dichiarato inventato", { ...base, partner: { name: "Forni Prova" } }],
    ["partner senza nome", { ...base, kind: "partner", partner: { name: " " } }],
    ["generalista con partner", { ...base, kind: "generalist", indexing: "index" }],
    ["id con maiuscole", { ...base, id: "Prova" }],
    ["url non https", { ...base, partner: { name: "X", invented: true, url: "http://x.it" } }],
    ["forno fuori scala", { ...base, ovens: { extra: [{ id: "x-1", brand: "X", model: "1", fuel: "gas", ovenType: "gas_pizza", maxTempC: 900, source: "demo" }] } }],
    ["forno di un marchio inventato con fonte secondaria", { ...base, ovens: { extra: [{ id: "x-1", brand: "X", model: "1", fuel: "gas", ovenType: "gas_pizza", maxTempC: 480, source: "P" }] } }],
    ["dato dimostrativo in un'edizione partner", { ...base, kind: "partner", partner: { name: "Forni Veri" }, ovens: { extra: [{ id: "x-1", brand: "X", model: "1", fuel: "gas", ovenType: "gas_pizza", maxTempC: 480, source: "demo" }] } }],
    ["filtro vuoto", { ...base, ovens: { only: [] } }],
    /* FW-15 */
    ["forno preimpostato escluso dal filtro (S18-B-09)", { ...base, ovens: { only: ["aurora-"], default: "aurora1-e1" } }],
    ["rapporto sconosciuto", { ...base, partner: { name: "X", invented: true, relationship: "sponsor" } }],
    ["marchio inventato presentato come co-branding", { ...base, partner: { name: "X", invented: true, relationship: "co-branded" } }],
    ["demo con marchio reale", { ...base, kind: "partner", partner: { name: "Forni Veri", relationship: "demo" } }],
    ["neutralità sconosciuta", { ...base, partner: { name: "X", invented: true, neutralityStatement: "none" } }],
    ["riscontro su http", { ...base, feedbackUrl: "http://x.it" }],
    ["suggerimento con un marchio", { ...base, search: { suggestions: ["caputo"] } }],
    ["suggerimenti vuoti", { ...base, search: { suggestions: [] } }],
  ])("rifiuta: %s", (_, value) => {
    expect(() => parseEdition(value)).toThrow(/Edizione non valida/);
  });

  /* FW-15 (D-K): rapporto e neutralità hanno sempre un valore se c'è un partner. */
  it("rapporto, neutralità e suggerimenti: valori predefiniti dello schema", () => {
    const demo = parseEdition(base);
    expect(partnerRelationship(demo)).toBe("demo");
    expect(partnerNeutrality(demo)).toBe("same-engine");
    const partner = parseEdition({ ...base, kind: "partner", partner: { name: "Forni Veri" } });
    expect(partnerRelationship(partner)).toBe("co-branded");
    expect(partnerNeutrality(partner)).toBe("same-engine");
    expect(partnerRelationship(EDITION)).toBeNull();
    expect(partnerNeutrality(EDITION)).toBeNull();
    expect(editionSearchSuggestions(EDITION)).toEqual(DEFAULT_SEARCH_SUGGESTIONS);
    expect(editionSearchSuggestions(parseEdition({ ...base, search: { suggestions: ["biga", "teglia"] } }))).toEqual(["biga", "teglia"]);
    expect(parseEdition({ ...base, feedbackUrl: "mailto:ciao@example.com" }).feedbackUrl).toBe("mailto:ciao@example.com");
  });

  it("ogni rapporto e ogni neutralità hanno il testo nel catalogo", () => {
    for (const value of PARTNER_RELATIONSHIPS) expect(UI_MESSAGES_IT[`edition.relationship.${value}`]).toBeTruthy();
    for (const value of NEUTRALITY_STATEMENTS) expect(UI_MESSAGES_IT[`edition.neutrality.${value}`]).toBeTruthy();
    for (const id of SEARCH_SUGGESTION_IDS) expect(UI_MESSAGES_IT[`components.shared.search-overlay.suggestion.${id}`]).toBeTruthy();
  });

  it("il forno preimpostato dell'edizione della build è nel suo catalogo (S18-B-09)", () => {
    // Con VULCAN_EDITION=<id> questo controlla anche le edizioni private.
    if (EDITION.ovens?.default) expect(OVEN_MODELS.map((model) => model.id)).toContain(EDITION.ovens.default);
  });

  it("filtro per prefisso e modelli in più", () => {
    const edition = parseEdition({ ...base, ovens: {
      only: ["effeuno-", "x-"],
      extra: [{ id: "x-1", brand: "X", model: "1", fuel: "gas", ovenType: "gas_pizza", maxTempC: 480, source: "demo" }],
    } });
    const ids = editionOvenModels(edition).map((model) => model.id);
    expect(ids).toContain("x-1");
    expect(ids.every((id) => id.startsWith("effeuno-") || id.startsWith("x-"))).toBe(true);
    expect(ids).toContain("effeuno-p134h");
  });
});
