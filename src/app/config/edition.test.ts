import { describe, expect, it } from "vitest";
import { EDITION, parseEdition } from "./edition";
import { ALL_OVEN_MODELS, editionOvenModels } from "../data/oven-models";

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
    ["forno fuori scala", { ...base, ovens: { extra: [{ id: "x-1", brand: "X", model: "1", fuel: "gas", ovenType: "gas_pizza", maxTempC: 900, source: "P" }] } }],
    ["filtro vuoto", { ...base, ovens: { only: [] } }],
  ])("rifiuta: %s", (_, value) => {
    expect(() => parseEdition(value)).toThrow(/Edizione non valida/);
  });

  it("filtro per prefisso e modelli in più", () => {
    const edition = parseEdition({ ...base, ovens: {
      only: ["effeuno-", "x-"],
      extra: [{ id: "x-1", brand: "X", model: "1", fuel: "gas", ovenType: "gas_pizza", maxTempC: 480, source: "P" }],
    } });
    const ids = editionOvenModels(edition).map((model) => model.id);
    expect(ids).toContain("x-1");
    expect(ids.every((id) => id.startsWith("effeuno-") || id.startsWith("x-"))).toBe(true);
    expect(ids).toContain("effeuno-p134h");
  });
});
