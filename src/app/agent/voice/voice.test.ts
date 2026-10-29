import { describe, expect, it } from "vitest";
import { getDefaultDoughBalls, isFriedStyle, STYLES_DB } from "../../domain/pizza-engine";
import { GLOSSARY_TERMS } from "../../data/glossary-data";
import { callMcpTool, recognizeStyle, recognizeTerm, understand, voiceCatalog, voiceReply } from ".";
import { recognizeBalls, recognizeHours, recognizeKitchen, wordToNumber } from "./understand";
import { neededHours, quickestBlocked } from "./answer";
import { speechify, spokenGrams, spokenHours, toSsml, wordCount } from "./speech";

/* D-061: la voce attinge dall'MCP. Si controlla che capisca l'italiano
   parlato, che parli in frasi brevi senza simboli e che dica gli stessi
   numeri del tool generate_recipe. */

const it_ = voiceCatalog("it");
const siri = (q: string) => voiceReply(q, { channel: "siri", baseUrl: "https://vulcan.test" });
const alexa = (q: string) => voiceReply(q, { channel: "alexa", baseUrl: "https://vulcan.test" });

describe("riconoscimento", () => {
  it.each([
    ["napoletana", "napoletana_stg"],
    ["la margherita napoletana", "napoletana_stg"],
    ["fammi la napoletano", "napoletana_stg"],
    ["teglia romana", "teglia_romana"],
    ["pizza in teglia alla romana", "teglia_romana"],
    ["la pinsa", "pinsa_romana"],
    ["pinza romana", "pinsa_romana"],
    ["una focaccia", "focaccia_genovese"],
    ["focaccia di Recco", "focaccia_recco"],
    ["focaccia barese", "focaccia_barese"],
    ["la romana scrocchiarella", "tonda_romana"],
    ["napoletana a canotto", "napoletana_canotto"],
    ["pizza fritta", "pizza_fritta"],
    ["pizza fritta tonda", "pizza_fritta_tonda"],
    ["new york", "new_york"],
    ["Chicago deep dish", "chicago_deep"],
    ["Pizza al padellino", "padellino_torino"],
  ])("stile: «%s» → %s", (text, id) => {
    expect(recognizeStyle(text, it_)).toBe(id);
  });

  it("ogni stile del catalogo si riconosce dal suo nome", () => {
    for (const style of Object.values(STYLES_DB)) expect(recognizeStyle(style.name, it_), style.name).toBe(style.id);
  });

  it("i nomi dei pezzi non diventano uno stile («due teglie» non è la teglia romana)", () => {
    expect(recognizeStyle("ricetta per due teglie", it_)).toBeUndefined();
  });

  it.each([
    ["cos'è la biga", "biga"],
    ["cosa vuol dire autolisi", "autolysis"],
    ["che cos'è l'appretto", "ball_fermentation"],
    ["cos'è la puntata", "bulk_fermentation"],
    ["cos'è la W", "w_alveograph"],
    ["cosa significa idratazione", "hydration"],
    ["spiegami il poolish", "poolish"],
  ])("termine: «%s» → %s", (text, id) => {
    expect(recognizeTerm(text, it_)).toBe(id);
  });

  it("ogni termine del glossario si riconosce dal suo nome", () => {
    for (const term of GLOSSARY_TERMS) expect(recognizeTerm(`cos'è ${term.name.replace(/\(.*?\)/g, "")}`, it_), term.name).toBe(term.id);
  });

  it("numeri in lettere", () => {
    const cases: [string, number][] = [["quattro", 4], ["ventiquattro", 24], ["ventuno", 21], ["trentotto", 38], ["quarantotto", 48], ["settantadue", 72], ["centoventi", 120], ["duecentocinquanta", 250], ["venti", 20], ["12", 12]];
    for (const [word, n] of cases) expect(wordToNumber(word, it_), word).toBe(n);
    for (const word of ["ventilato", "settimana", "centro", "pizza"]) expect(wordToNumber(word, it_), word).toBeNull();
  });

  it("panetti, ore e forno detti a voce", () => {
    expect(recognizeBalls("ricetta napoletana per quattro panetti", it_)).toBe(4);
    expect(recognizeBalls("teglia romana per 2 teglie", it_)).toBe(2);
    expect(recognizeBalls("per una pizza", it_)).toBe(1);
    expect(recognizeBalls("napoletana in ventiquattro ore", it_)).toBeUndefined();
    expect(recognizeBalls("voglio fare una napoletana", it_)).toBeUndefined();
    expect(recognizeHours("ho ventiquattro ore", it_)).toBe(24);
    expect(recognizeHours("in sei ore e mezza", it_)).toBe(6.5);
    expect(recognizeHours("ho un'ora", it_)).toBe(1);
    expect(recognizeHours("ho due giorni", it_)).toBe(48);
    // Il mezzo vale anche per i giorni: «un giorno e mezzo» non è un giorno.
    expect(recognizeHours("in un giorno e mezzo", it_)).toBe(36);
    expect(recognizeHours("ho due giorni e mezzo", it_)).toBe(60);
    expect(recognizeHours("in una giornata e mezza", it_)).toBe(36);
    expect(recognizeHours("ho mezza giornata", it_)).toBe(12);
    expect(recognizeHours("ho una giornata", it_)).toBe(24);
    expect(recognizeHours("ricetta napoletana", it_)).toBeUndefined();
    expect(recognizeKitchen("con il forno a legna", it_)).toEqual({ ovenType: "wood" });
    expect(recognizeKitchen("forno di casa a trecento gradi", it_)).toEqual({ ovenType: "home", ovenMaxTempC: 300 });
    expect(recognizeKitchen("con l'Ooni Koda 16", it_).ovenModel).toBe("ooni koda 16");
  });

  it.each([
    ["che pizza posso fare con sei ore", "recommend"],
    ["cosa mi consigli", "recommend"],
    ["ho il forno a legna", "recommend"],
    ["ricetta napoletana per quattro panetti", "recipe"],
    ["teglia romana", "recipe"],
    ["dammi una ricetta", "recipe"],
    ["cos'è la biga", "glossary"],
    ["cos'è il pippo", "glossary"],
    ["aiuto", "help"],
    ["", "help"],
    ["che tempo fa domani", "fallback"],
  ])("intento: «%s» → %s", (text, intent) => {
    expect(understand(text, it_).intent).toBe(intent);
  });
});

describe("testo per la voce", () => {
  it("numeri come si parlano", () => {
    expect(spokenGrams(0.7, it_)).toBe("0,7");
    expect(spokenGrams(633.4, it_)).toBe("633");
    expect(spokenGrams(18, it_)).toBe("18");
    expect(spokenHours(24, it_)).toBe("24 ore");
    expect(spokenHours(1, it_)).toBe("un'ora");
    expect(spokenHours(7.25, it_, true)).toBe("circa 7 ore e mezza");
    expect(spokenHours(28.25, it_)).toBe("circa 28 ore");
    expect(spokenHours(25.4, it_, true)).toBe("circa 26 ore");
    expect(spokenHours(14, it_)).toBe("14 ore");
    expect(spokenHours(0.5, it_)).toBe("30 minuti");
  });

  it("niente simboli né abbreviazioni nei testi del glossario", () => {
    const text = speechify("Pre-impasto con 44% d'acqua (fino al 50%), maturato 16 h a 18–20 °C (R. Calvel, 1974).", it_);
    expect(text).toBe("Pre-impasto con 44 per cento d'acqua, fino al 50 per cento, maturato 16 ore tra 18 e 20 gradi.");
  });

  it("SSML pulito: frasi con pause brevi, caratteri speciali protetti", () => {
    expect(toSsml(["Uno & due.", "Tre."])).toBe('<speak>Uno &amp; due. <break time="300ms"/> Tre.</speak>');
  });
});

/** Le frasi di una ricetta: niente % ° W né «g» o «h» abbreviati, numeri decimali con la virgola. */
function expectSpeakable(speech: string) {
  expect(speech).not.toMatch(/[%°<>&]|\bW\b|\d\s?(g|h|kg|min)\b|\d\.\d/);
}

describe("risposte", () => {
  it("ricetta: gli stessi numeri del tool MCP generate_recipe, in frasi brevi", () => {
    const answer = siri("ricetta napoletana per quattro panetti col forno a legna in ventiquattro ore");
    const mcp = callMcpTool("generate_recipe", { style_id: "napoletana_stg", dough_balls: 4, oven_type: "wood", available_hours: 24, recipe_mode: "adapted" });
    expect(answer.intent).toBe("recipe");
    expect(mcp.outcome).not.toBe("not_feasible");
    for (const row of mcp.ingredients as { name: string; grams: number }[]) {
      expect(answer.speech, row.name).toContain(spokenGrams(row.grams, it_));
    }
    expect(answer.speech).toContain(`4 panetti da ${spokenGrams(mcp.ball_weight_g, it_)} grammi`);
    expect(answer.speech).toContain(`${Math.round(mcp.oven_temp_c)} gradi`);
    expect(answer.speech).toContain(spokenHours(mcp.fermentation_hours, it_));
    expect(answer.url).toBe("https://vulcan.test/recipe/napoletana_stg?mode=adapted");
    expectSpeakable(answer.speech);
    for (const sentence of answer.sentences) expect((sentence.match(/\d+(,\d+)?/g) ?? []).length, sentence).toBeLessThanOrEqual(3);
  });

  it("ogni stile, alla voce: breve, senza simboli, coerente con l'MCP", () => {
    for (const style of Object.values(STYLES_DB)) {
      const answer = alexa(`ricetta ${style.name}`);
      const mcp = callMcpTool("generate_recipe", { style_id: style.id, dough_balls: getDefaultDoughBalls(style), oven_type: "home", recipe_mode: "adapted" });
      expect(answer.data?.style_id, style.id).toBe(style.id);
      expect(answer.data?.outcome, style.id).toBe(mcp.outcome);
      expect(wordCount(answer.speech), `${style.id}: ${answer.speech}`).toBeLessThanOrEqual(70);
      expectSpeakable(answer.speech);
      if (mcp.outcome !== "not_feasible") {
        expect(answer.speech).toContain(`Farina ${spokenGrams((mcp.ingredients as { name: string; grams: number }[])[0].grams, it_)} grammi`);
        // D-060: la forza come fascia a parole, mai la W puntuale.
        expect(answer.speech).toMatch(/Farina (debole|di media forza|forte|molto forte)|miscela/);
        if (isFriedStyle(style)) expect(answer.speech).toContain("Si frigge");
      }
    }
  });

  it("non fattibile: lo dice, spiega il motivo e propone le alternative di recommend_styles", () => {
    const answer = siri("ricetta napoletana per quattro panetti");
    expect(answer.speech).toContain("non si può fare");
    expect(answer.speech).toContain("ne servono almeno 430");
    const alternatives = callMcpTool("recommend_styles", { oven_type: "home", recipe_mode: "adapted", limit: 6 }).styles as { id: string; name: string }[];
    // D-032: prima gli stili al forno.
    expect(answer.speech).toContain(`Puoi fare invece ${alternatives.filter((s) => s.id !== "napoletana_stg" && !isFriedStyle(STYLES_DB[s.id]))[0].name}`);
    expect(answer.speech).not.toMatch(/Farina \d/);
  });

  it("tempo che non basta: dice quante ore servono, arrotondate per eccesso", () => {
    const answer = siri("napoletana col forno a legna in quattro ore");
    const mcp = callMcpTool("generate_recipe", { style_id: "napoletana_stg", dough_balls: 4, oven_type: "wood", available_hours: 4, recipe_mode: "adapted" });
    expect(answer.speech).toContain(`servono ${spokenHours(neededHours(mcp.blockers)!, it_, true)}.`);
  });

  /* Con poche ore l'MCP dà due blocchi di tempo (finestra e lievitazione):
     la voce dice UNA frase, con il minimo vero (il più alto), mai la finestra. */
  it.each([
    ["ricetta pinsa in un'ora", "pinsa_romana", "home", 1],
    ["ricetta napoletana in due ore", "napoletana_stg", "home", 2],
    ["ricetta focaccia in due ore", "focaccia_genovese", "home", 2],
    ["ricetta napoletana per quattro panetti in un'ora con forno a legna", "napoletana_stg", "wood", 1],
  ])("«%s»: una sola frase sul tempo, con il blocco più alto", (text, id, oven, hours) => {
    const answer = alexa(text);
    const mcp = callMcpTool("generate_recipe", { style_id: id, oven_type: oven, available_hours: hours, recipe_mode: "adapted", dough_balls: oven === "wood" ? 4 : getDefaultDoughBalls(STYLES_DB[id]) });
    const blockers = mcp.blockers as { kind: string; needed_h?: number }[];
    expect(blockers.filter((b) => b.kind === "time_window" || b.kind === "fermentation_too_short").length).toBeGreaterThan(1);
    const max = Math.max(...blockers.filter((b) => b.needed_h).map((b) => b.needed_h!));
    expect(answer.speech.match(/Il tempo non basta/g)).toHaveLength(1);
    expect(answer.speech).toContain(`servono ${spokenHours(max, it_, true)}.`);
    if (id === "pinsa_romana") expect(max).toBeGreaterThanOrEqual(25);
    if (id === "napoletana_stg" && oven === "home") expect(answer.speech).toContain("servono 7 ore e mezza.");
  });

  it("«un giorno e mezzo»: la teglia romana si fa (36 ore, non 24)", () => {
    const answer = siri("ricetta teglia romana in un giorno e mezzo");
    const mcp = callMcpTool("generate_recipe", { style_id: "teglia_romana", oven_type: "home", available_hours: 36, recipe_mode: "adapted", dough_balls: getDefaultDoughBalls(STYLES_DB.teglia_romana) });
    expect(mcp.outcome).not.toBe("not_feasible");
    expect(answer.speech).not.toContain("non si può fare");
    expect(answer.speech).toContain(`Farina ${spokenGrams((mcp.ingredients as { name: string; grams: number }[])[0].grams, it_)} grammi`);
  });

  it("avvertenze in breve; le verifiche di dispensa non lo sono (D-060)", () => {
    const answer = siri("ricetta teglia romana");
    expect(answer.speech).toContain("Attenzione: serve una teglia");
    expect(answer.speech).not.toMatch(/Se hai/);
  });

  it("consiglio: dichiara i default, mette le fritte dopo (D-032), usa i punteggi dell'MCP", () => {
    const answer = siri("che pizza posso fare");
    expect(answer.speech).toMatch(/^Considero un forno di casa e un giorno di tempo\./);
    const mcp = callMcpTool("recommend_styles", { oven_type: "home", recipe_mode: "adapted", limit: 6 }).styles as { id: string; name: string; compatibility: number }[];
    const baked = mcp.filter((s) => !isFriedStyle(STYLES_DB[s.id]));
    expect(answer.speech).toContain(`Ti consiglio: ${baked[0].name}`);
    expect(answer.speech).toContain(`${baked[0].name} va bene con la tua cucina per ${baked[0].compatibility} su 100`);
    expect(answer.speech).toContain("Oppure, fritta:");
    expect(wordCount(answer.speech)).toBeLessThanOrEqual(60);
  });

  /* Nessuno stile fattibile: lo stile al forno che si sblocca con meno tempo,
     con il suo minimo vero (il blocco di tempo più alto), come dice l'MCP. */
  it.each([1, 2, 3, 6])("consiglio senza stili fattibili in %i ore: il più rapido al forno e il suo minimo vero", (hours) => {
    const answer = siri(`che pizza posso fare con ${hours} ore`);
    const all = callMcpTool("recommend_styles", { oven_type: "home", available_hours: hours, recipe_mode: "adapted", include_not_feasible: true, limit: 30 }).styles as { id: string; name: string; blockers?: { kind: string; needed_h?: number }[] }[];
    const timeOnly = all
      .filter((s) => !isFriedStyle(STYLES_DB[s.id]) && s.blockers?.length && s.blockers.every((b) => b.kind === "time_window" || b.kind === "fermentation_too_short"))
      .map((s) => ({ s, h: neededHours(s.blockers)! }));
    const best = timeOnly.reduce((a, b) => (b.h < a.h ? b : a));
    // Davvero il più rapido: nessuno stile al forno chiede meno.
    for (const { h } of timeOnly) expect(h).toBeGreaterThanOrEqual(best.h);
    expect(answer.speech).toContain(`la più rapida al forno, ${best.s.name}, chiede ${spokenHours(best.h, it_, true)}.`);
    expect(answer.speech).not.toMatch(/Montanara|[Ff]ritta/);
  });

  it("neededHours: il più alto tra finestra e lievitazione; quickestBlocked: al forno prima delle fritte", () => {
    expect(neededHours([{ kind: "time_window", needed_h: 2.2 }, { kind: "fermentation_too_short", needed_h: 7.25 }, { kind: "oven_too_cold" }])).toBe(7.25);
    expect(neededHours([{ kind: "oven_too_cold" }])).toBeUndefined();
    const pick = quickestBlocked([
      { id: "pizza_montanara", blockers: [{ kind: "fermentation_too_short", needed_h: 3 }] },
      { id: "napoletana_stg", blockers: [{ kind: "oven_too_cold" }, { kind: "fermentation_too_short", needed_h: 4 }] },
      { id: "focaccia_genovese", blockers: [{ kind: "time_window", needed_h: 2 }, { kind: "fermentation_too_short", needed_h: 9 }] },
      { id: "greek_pan", blockers: [{ kind: "fermentation_too_short", needed_h: 6.25 }] },
    ]);
    expect(pick).toMatchObject({ style: { id: "greek_pan" }, hours: 6.25, baked: true });
  });

  it("dopo un consiglio Alexa non fa una domanda sì/no e ricorda lo stile consigliato", () => {
    const answer = alexa("che pizza posso fare");
    expect(answer.speech).not.toMatch(/Vuoi /);
    expect(answer.speech).toMatch(/Per la ricetta dimmi lo stile, per esempio .+\.$/);
    expect(answer.pending?.suggestion).toBe((answer.data?.styles as { style_id: string }[])[0].style_id);
  });

  it("ricetta senza stile: lo chiede; Alexa tiene aperta la sessione", () => {
    const answer = alexa("dammi una ricetta per quattro panetti");
    expect(answer.speech).toBe(it_.say.askStyle);
    expect(answer.endSession).toBe(false);
    expect(answer.pending).toMatchObject({ intent: "recipe", balls: 4 });
  });

  it("glossario: definizione breve dal tool glossary, detta a parole", () => {
    const answer = siri("cos'è la biga");
    const mcp = callMcpTool("glossary", { term: "biga", lang: "it" });
    expect(answer.speech.startsWith("Biga.")).toBe(true);
    expect(answer.speech).toContain("44 per cento");
    expect(String(mcp.definition)).toContain("44%");
    expect(wordCount(answer.speech)).toBeLessThanOrEqual(60);
    expectSpeakable(answer.speech);
    expect(siri("cos'è il pippo").speech).toBe(it_.say.unknownTerm);
  });

  it("aiuto e richieste non capite", () => {
    expect(siri("aiuto").intent).toBe("help");
    const fallback = alexa("che tempo fa domani");
    expect(fallback.intent).toBe("fallback");
    expect(fallback.endSession).toBe(false);
    expect(fallback.reprompt).toBeTruthy();
  });

  it("una lingua non ancora tradotta risponde in italiano", () => {
    expect(voiceCatalog("en").lang).toBe("it");
  });

  it("risponde in fretta (motore locale, nessuna rete)", () => {
    siri("che pizza posso fare"); // riscaldamento
    const start = performance.now();
    siri("che pizza posso fare con il forno a legna");
    siri("ricetta napoletana per quattro panetti");
    // Misurato: 60–200 ms su un portatile; il margine evita falsi allarmi in CI.
    expect(performance.now() - start).toBeLessThan(2000);
  });
});
