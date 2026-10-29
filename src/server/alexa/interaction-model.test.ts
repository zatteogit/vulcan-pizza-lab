import { describe, expect, it } from "vitest";
import { STYLES_DB } from "../../app/domain/pizza-engine";
import { GLOSSARY_TERMS } from "../../app/data/glossary-data";
import { recognizeStyle, recognizeTerm, voiceCatalog } from "../../app/agent/voice";
import { ALEXA_INVOCATION_NAME, buildInteractionModel } from "./interaction-model";
import packaged from "../../../alexa/skill-package/interactionModels/custom/it-IT.json";
import manifest from "../../../alexa/skill-package/skill.json";

/* D-061: il modello della skill nel pacchetto ASK resta allineato al
   catalogo degli stili e al glossario. Se fallisce: npx tsx scripts/build-alexa-model.ts */

describe("modello d'interazione Alexa it-IT", () => {
  const model = buildInteractionModel("it");
  const lm = model.interactionModel.languageModel;

  it("il file del pacchetto è aggiornato", () => {
    expect(packaged).toEqual(JSON.parse(JSON.stringify(model)));
  });

  it("nome di invocazione: due parole minuscole, senza parole riservate", () => {
    expect(ALEXA_INVOCATION_NAME).toMatch(/^[a-z]+ [a-z]+$/);
    expect(ALEXA_INVOCATION_NAME).not.toMatch(/\b(alexa|amazon|echo|skill|app|apri|chiedi|avvia|lancia)\b/);
  });

  it("gli intenti propri hanno 15–30 frasi, senza cifre, con slot dichiarati", () => {
    for (const intent of lm.intents.filter((i) => !i.name.startsWith("AMAZON."))) {
      expect(intent.samples.length, intent.name).toBeGreaterThanOrEqual(15);
      expect(intent.samples.length, intent.name).toBeLessThanOrEqual(30);
      const slots = new Set<string>(("slots" in intent ? intent.slots ?? [] : []).map((s) => s.name));
      for (const sample of intent.samples) {
        expect(sample, intent.name).not.toMatch(/\d/);
        for (const [, slot] of sample.matchAll(/\{(\w+)\}/g)) expect(slots.has(slot), `${intent.name}: ${sample}`).toBe(true);
      }
      expect(new Set(intent.samples).size).toBe(intent.samples.length);
    }
    // Una frase d'esempio non può stare in due intenti.
    const all = lm.intents.flatMap((i) => i.samples);
    expect(new Set(all).size).toBe(all.length);
  });

  it("ci sono gli intenti di Amazon richiesti", () => {
    const names = lm.intents.map((i) => i.name);
    for (const name of ["AMAZON.HelpIntent", "AMAZON.StopIntent", "AMAZON.CancelIntent", "AMAZON.FallbackIntent", "AMAZON.NavigateHomeIntent"]) expect(names).toContain(name);
  });

  it("STILE: un valore per ogni stile del catalogo, e ogni sinonimo riporta allo stesso stile", () => {
    const catalog = voiceCatalog("it");
    const type = lm.types.find((t) => t.name === "STILE")!;
    expect(type.values.map((v) => v.id).sort()).toEqual(Object.keys(STYLES_DB).sort());
    for (const value of type.values) {
      for (const word of [value.name.value, ...(value.name.synonyms ?? [])]) expect(recognizeStyle(word, catalog), word).toBe(value.id);
    }
  });

  it("TERMINE: un valore per ogni termine del glossario, riconosciuto dalla voce", () => {
    const catalog = voiceCatalog("it");
    const type = lm.types.find((t) => t.name === "TERMINE")!;
    expect(type.values.map((v) => v.id).sort()).toEqual(GLOSSARY_TERMS.map((t) => t.id).sort());
    for (const value of type.values) expect(recognizeTerm(value.name.value, catalog), value.name.value).toBe(value.id);
  });

  it("le frasi d'esempio del manifesto usano l'invocazione e frasi del modello", () => {
    const [launch, ...asks] = manifest.manifest.publishingInformation.locales["it-IT"].examplePhrases;
    expect(launch).toBe(`Alexa, apri ${ALEXA_INVOCATION_NAME}`);
    const samples = lm.intents.flatMap((i) => i.samples).map((sample) => new RegExp(`^${sample.replace(/\{\w+\}/g, ".+")}$`));
    for (const phrase of asks) {
      const prefix = `Alexa, chiedi a ${ALEXA_INVOCATION_NAME} `;
      expect(phrase.startsWith(prefix), phrase).toBe(true);
      expect(samples.some((re) => re.test(phrase.slice(prefix.length))), phrase).toBe(true);
    }
    expect(manifest.manifest.apis.custom.endpoint.uri).toBe("https://vulcan-pizza-lab.zatteo.workers.dev/alexa");
  });
});
