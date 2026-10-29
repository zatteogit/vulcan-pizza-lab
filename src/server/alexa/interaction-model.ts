/* ═══ Modello d'interazione della skill Alexa (it-IT), generato ═══
 * Gli slot STILE, TERMINE e FORNO vengono dal catalogo degli stili, dal
 * glossario e dal catalogo voce: così il modello resta allineato al motore.
 * scripts/build-alexa-model.ts lo scrive in
 * alexa/skill-package/interactionModels/custom/it-IT.json; un test controlla
 * che il file sia aggiornato. */

import { STYLES_DB } from "../../app/domain/pizza-engine";
import { GLOSSARY_TERMS } from "../../app/data/glossary-data";
import { voiceCatalog } from "../../app/agent/voice";
import { ALEXA_INTENTS, ALEXA_SLOTS } from "./skill";

/** Due parole, minuscole, senza parole di avvio («apri», «chiedi») né «alexa»
 *  o «skill»: regole ASK per il nome di invocazione. */
export const ALEXA_INVOCATION_NAME = "vulcano pizza";

const SAMPLES = {
  recommend: [
    "che pizza posso fare",
    "che pizza posso fare stasera",
    "che pizza posso fare con {ore} ore",
    "che pizza posso fare in {ore} ore",
    "che pizza posso fare con il forno {forno}",
    "che pizza posso fare con un forno {forno} in {ore} ore",
    "che pizza faccio",
    "che pizza faccio con {ore} ore",
    "cosa mi consigli",
    "cosa mi consigli con il forno {forno}",
    "consigliami una pizza",
    "consigliami una pizza per il forno {forno}",
    "quale pizza mi consigli",
    "quale stile mi consigli",
    "suggeriscimi una pizza",
    "ho {ore} ore che pizza faccio",
    "ho {ore} ore di tempo",
    "ho il forno {forno}",
    "ho il forno {forno} cosa mi consigli",
    "che impasto posso fare in {ore} ore",
    "cosa posso preparare in {ore} ore",
    "che pizza viene bene nel forno {forno}",
    "cosa cucino stasera",
    "che pizza fare",
  ],
  recipe: [
    "ricetta {stile}",
    "la ricetta della {stile}",
    "la ricetta della pizza {stile}",
    "dammi la ricetta della {stile}",
    "fammi la ricetta della {stile}",
    "ricetta {stile} per {panetti} panetti",
    "ricetta della {stile} per {panetti} pizze",
    "ricetta {stile} per {panetti} teglie",
    "ricetta {stile} per {panetti} panetti in {ore} ore",
    "ricetta {stile} con {ore} ore",
    "ricetta {stile} con il forno {forno}",
    "impasto per {panetti} pizze {stile}",
    "impasto {stile}",
    "come si fa la {stile}",
    "come faccio la {stile}",
    "dosi per la {stile}",
    "le dosi della {stile} per {panetti} panetti",
    "quanta farina per {panetti} pizze {stile}",
    "voglio fare la {stile}",
    "voglio fare la {stile} in {ore} ore",
    "preparo la {stile}",
    "{stile} per {panetti} panetti",
    "{stile}",
    "la {stile}",
    "una ricetta",
    "dammi una ricetta",
    "ricetta per {panetti} panetti",
  ],
  glossary: [
    "cos'è {termine}",
    "cos'è la {termine}",
    "cos'è il {termine}",
    "che cos'è la {termine}",
    "che cos'è il {termine}",
    "cosa significa {termine}",
    "che cosa significa {termine}",
    "cosa vuol dire {termine}",
    "che vuol dire {termine}",
    "spiegami {termine}",
    "spiegami la {termine}",
    "spiegami il {termine}",
    "definizione di {termine}",
    "significato di {termine}",
    "cosa si intende per {termine}",
    "dimmi cos'è la {termine}",
    "dimmi cos'è il {termine}",
    "parlami della {termine}",
    "parlami del {termine}",
    "cos'è la {termine} nella pizza",
  ],
} as const;

interface SlotValue {
  id: string;
  name: { value: string; synonyms?: string[] };
}

/** Valori unici in tutto il tipo, senza cifre (Alexa le vuole a parole). */
function slotValues(entries: { id: string; words: string[] }[]): SlotValue[] {
  const seen = new Set<string>();
  const out: SlotValue[] = [];
  for (const { id, words } of entries) {
    const unique = words.map((w) => w.toLowerCase().replace(/["“”«»]/g, "").replace(/\s+/g, " ").trim())
      .filter((w) => w && !/\d/.test(w) && !seen.has(w));
    unique.forEach((w) => seen.add(w));
    if (!unique.length) continue;
    const [value, ...synonyms] = unique;
    out.push({ id, name: synonyms.length ? { value, synonyms } : { value } });
  }
  return out;
}

export function buildInteractionModel(lang = "it") {
  const catalog = voiceCatalog(lang);
  const styles = slotValues(Object.values(STYLES_DB).map((style) => ({
    id: style.id,
    words: [...(catalog.styleSynonyms[style.id] ?? []), style.name, style.name.replace(/^pizza /i, "")],
  })));
  const terms = slotValues(GLOSSARY_TERMS.map((term) => ({
    id: term.id,
    words: [...(catalog.termSynonyms[term.id] ?? []), term.name.replace(/\s*\(.*?\)/g, "")],
  })));
  const brands = [...new Set(Object.values(catalog.ovenBrands))];
  const ovens = slotValues([
    ...catalog.ovenWords.map(({ type, words }) => ({ id: type, words })),
    ...brands.map((brand) => ({ id: `brand_${brand}`, words: Object.entries(catalog.ovenBrands).filter(([, b]) => b === brand).map(([w]) => w) })),
  ]);
  const number = "AMAZON.NUMBER";
  return {
    interactionModel: {
      languageModel: {
        invocationName: ALEXA_INVOCATION_NAME,
        intents: [
          { name: "AMAZON.CancelIntent", samples: [] },
          { name: "AMAZON.HelpIntent", samples: [] },
          { name: "AMAZON.StopIntent", samples: [] },
          { name: "AMAZON.NavigateHomeIntent", samples: [] },
          { name: "AMAZON.FallbackIntent", samples: [] },
          { name: "AMAZON.YesIntent", samples: [] },
          { name: "AMAZON.NoIntent", samples: [] },
          {
            name: ALEXA_INTENTS.recommend,
            slots: [{ name: ALEXA_SLOTS.hours, type: number }, { name: ALEXA_SLOTS.oven, type: "FORNO" }],
            samples: [...SAMPLES.recommend],
          },
          {
            name: ALEXA_INTENTS.recipe,
            slots: [
              { name: ALEXA_SLOTS.style, type: "STILE" },
              { name: ALEXA_SLOTS.balls, type: number },
              { name: ALEXA_SLOTS.hours, type: number },
              { name: ALEXA_SLOTS.oven, type: "FORNO" },
            ],
            samples: [...SAMPLES.recipe],
          },
          {
            name: ALEXA_INTENTS.glossary,
            slots: [{ name: ALEXA_SLOTS.term, type: "TERMINE" }],
            samples: [...SAMPLES.glossary],
          },
        ],
        types: [
          { name: "STILE", values: styles },
          { name: "TERMINE", values: terms },
          { name: "FORNO", values: ovens },
        ],
      },
      modelConfiguration: { fallbackIntentSensitivity: { level: "LOW" } },
    },
  };
}
