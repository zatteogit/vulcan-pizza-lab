/* ═══ Voce — la risposta, costruita dai tool MCP ═══
 * Principio: la voce ATTINGE DALL'MCP. Ogni numero detto arriva da una
 * chiamata tools/call al server MCP (handleMcpMessage), con gli stessi input
 * che userebbe un agente: recommend_styles, generate_recipe, glossary.
 * Qui si scelgono solo le frasi: nessun calcolo di dosi, tempi o compatibilità.
 * Modo ricetta «adapted», come la proposta di Crea nell'app (get_guide). */

import { getDefaultDoughBalls, getServingUnit, isFriedStyle, STYLES_DB } from "../../domain/pizza-engine";
import { flourWText } from "../../domain/flour-w-display";
import { handleMcpMessage } from "../mcp-server";
import type { ServingUnitWord, VoiceCatalog } from "./catalog";
import { firstSentences, speechify, spokenGrams, spokenHours, toSsml } from "./speech";
import type { VoiceIntent, VoiceKitchen, VoiceQuery } from "./understand";

export type VoiceChannel = "siri" | "alexa";

export interface VoiceAnswer {
  intent: VoiceIntent;
  sentences: string[];
  /** Testo semplice (Siri, scheda di Alexa). */
  speech: string;
  /** Le stesse frasi in SSML (Alexa). */
  ssml: string;
  /** Pagina di Vulcan con i dettagli. */
  url?: string;
  title: string;
  /** Alexa: la conversazione finisce qui. */
  endSession: boolean;
  reprompt?: string;
  /** Alexa: richiesta di ricetta in attesa dello stile, o dopo un consiglio. */
  pending?: { intent: "recipe"; balls?: number; hours?: number; kitchen: VoiceKitchen; suggestion?: string };
  /** Per ?format=json: lo stile e l'esito, senza dati dell'utente. */
  data?: Record<string, unknown>;
}

export interface VoiceOptions {
  catalog: VoiceCatalog;
  channel: VoiceChannel;
  /** Origine dell'app per i link («https://…workers.dev»). */
  baseUrl: string;
}

type Json = Record<string, any>;

export class VoiceToolError extends Error {}

/** Una chiamata tools/call al server MCP, come la farebbe un agente. */
export function callMcpTool(name: string, args: Json): Json {
  const res = handleMcpMessage({ jsonrpc: "2.0", id: 1, method: "tools/call", params: { name, arguments: args } });
  if (!res || !("result" in res)) throw new VoiceToolError(`MCP ${name}: no result`);
  const result = res.result as { isError: boolean; content: { text: string }[]; structuredContent?: Json };
  if (result.isError || !result.structuredContent) throw new VoiceToolError(result.content[0]?.text ?? `MCP ${name} failed`);
  return result.structuredContent;
}

/** Gli input della cucina per i tool MCP: forno (modello o tipo), temperatura, ore. */
export function kitchenArgs(kitchen: VoiceKitchen, hours: number | undefined, useModel = true): Json {
  return {
    ...(kitchen.ovenModel && useModel ? { oven_model: kitchen.ovenModel } : { oven_type: kitchen.ovenType ?? "home" }),
    ...(kitchen.ovenMaxTempC !== undefined ? { oven_max_temp_c: kitchen.ovenMaxTempC } : {}),
    ...(hours !== undefined ? { available_hours: hours } : {}),
    recipe_mode: "adapted",
  };
}

/** Prima con il modello di forno detto; se il catalogo non lo trova, con il tipo. */
function callWithKitchen(name: string, extra: Json, query: VoiceQuery): Json {
  try {
    return callMcpTool(name, { ...kitchenArgs(query.kitchen, query.hours), ...extra });
  } catch (e) {
    if (!query.kitchen.ovenModel) throw e;
    return callMcpTool(name, { ...kitchenArgs(query.kitchen, query.hours, false), ...extra });
  }
}

function spokenStyleName(id: string, name: string, catalog: VoiceCatalog): string {
  return catalog.spokenStyleNames[id] ?? name.replace(/["“”«»]/g, "").replace(/\s+/g, " ").trim();
}

/** D-060: la forza come fascia, a parole. La W puntuale non si dice. */
function flourBandWords(range: readonly [number, number] | undefined, w: number, catalog: VoiceCatalog): string {
  const text = flourWText(w, range);
  const [lo, hi] = text.split("–").map(Number);
  const mid = hi ? (lo + hi) / 2 : lo;
  const bands = catalog.say.flourBands;
  return mid < 180 ? bands.weak : mid < 250 ? bands.medium : mid < 320 ? bands.strong : bands.veryStrong;
}

/** Avvertenze dette in breve. D-060: le verifiche di dispensa non lo sono. */
function caveatSentence(warnings: { key: string }[] | undefined, catalog: VoiceCatalog): string | null {
  const phrases: string[] = [];
  let other = false;
  for (const { key } of warnings ?? []) {
    if (key.startsWith("need.check") && key !== "need.checkPan") continue;
    const phrase = catalog.say.caveats[key];
    if (phrase) { if (!phrases.includes(phrase)) phrases.push(phrase); }
    else other = true;
  }
  if (other && phrases.length < 2) phrases.push(catalog.say.caveatOther);
  if (!phrases.length) return null;
  return `${catalog.say.caveatsIntro} ${phrases.slice(0, 2).join("; ")}.`;
}

/** D-032: le fritte non usano il forno e vengono dopo gli stili al forno. */
function isFried(s: Json): boolean {
  return Boolean(STYLES_DB[s.id] && isFriedStyle(STYLES_DB[s.id]));
}
function bakedFirst(styles: Json[]): Json[] {
  return [...styles.filter((s) => !isFried(s)), ...styles.filter(isFried)];
}

/** Il tempo minimo che chiede uno stile non fattibile: il più alto tra i blocchi
 *  di tempo dell'MCP (finestra di lavoro e lievitazione). La finestra da sola
 *  non è il tempo della ricetta: dirla farebbe sentire un numero falso. */
export function neededHours(blockers: Json[] | undefined): number | undefined {
  const hours = (blockers ?? [])
    .filter((b) => b.kind === "time_window" || b.kind === "fermentation_too_short")
    .map((b) => Number(b.needed_h))
    .filter((h) => Number.isFinite(h) && h > 0);
  return hours.length ? Math.max(...hours) : undefined;
}

/** Nessuno stile fattibile: quello che si sblocca con meno tempo in più (solo
 *  blocchi di tempo), al forno prima delle fritte (D-032); se nessuno si
 *  sblocca col tempo, quello che chiede il forno meno caldo. */
export function quickestBlocked(styles: Json[]): { style: Json; hours?: number; baked: boolean } | undefined {
  const timeOnly = styles
    .map((style) => ({ style, hours: neededHours(style.blockers), baked: !isFried(style) }))
    .filter((c) => c.hours !== undefined && (c.style.blockers as Json[]).every((b) => b.kind === "time_window" || b.kind === "fermentation_too_short"));
  const pool = timeOnly.some((c) => c.baked) ? timeOnly.filter((c) => c.baked) : timeOnly;
  if (pool.length) return pool.reduce((best, c) => (c.hours! < best.hours! ? c : best));
  const oven = bakedFirst(styles).find((s) => (s.blockers as Json[] | undefined)?.some((b) => b.kind === "oven_too_cold"));
  return oven ? { style: oven, baked: !isFried(oven) } : undefined;
}

function finish(intent: VoiceIntent, sentences: string[], rest: Omit<VoiceAnswer, "intent" | "sentences" | "speech" | "ssml">): VoiceAnswer {
  const clean = sentences.map((s) => s.trim()).filter(Boolean);
  return { intent, sentences: clean, speech: clean.join(" "), ssml: toSsml(clean), ...rest };
}

/* ── Intenti ── */

function answerRecommend(query: VoiceQuery, opts: VoiceOptions): VoiceAnswer {
  const { catalog, channel, baseUrl } = opts;
  const say = catalog.say;
  const defaultOven = !query.kitchen.ovenType && !query.kitchen.ovenModel && query.kitchen.ovenMaxTempC === undefined;
  const intro = say.defaultKitchen(defaultOven, query.hours === undefined);
  const data = callWithKitchen("recommend_styles", { limit: 6, include_recipe: true }, query);
  // D-032: le fritte stanno dopo gli stili al forno, in una frase a parte.
  const all = (data.styles ?? []) as Json[];
  const baked = all.filter((s) => !isFried(s));
  const styles = (baked.length ? baked : all).slice(0, 3);
  const friedNames = baked.length ? all.filter(isFried).slice(0, 1).map((s) => spokenStyleName(s.id, s.name, catalog)) : [];
  const pending = { intent: "recipe" as const, hours: query.hours, kitchen: query.kitchen, suggestion: styles[0]?.id as string | undefined };
  const url = `${baseUrl}/explore`;

  if (!styles.length) {
    const quickest = quickestBlocked((callWithKitchen("recommend_styles", { limit: 30, include_not_feasible: true }, query).styles ?? []) as Json[]);
    const sentences = [intro];
    const oven = quickest?.style.blockers?.find((b: Json) => b.kind === "oven_too_cold");
    const name = quickest ? spokenStyleName(quickest.style.id, quickest.style.name, catalog) : "";
    if (quickest?.hours !== undefined) sentences.push(say.recommendNeedsHours(name, spokenHours(quickest.hours, catalog, true), quickest.baked));
    else if (oven) sentences.push(say.recommendNeedsOven(name, oven.style_min_c));
    else sentences.push(say.recommendNone);
    return finish("recommend", sentences, { url, title: say.cardRecommend, endSession: true, data: { styles: [] } });
  }

  const names = styles.map((s) => spokenStyleName(s.id, s.name, catalog));
  const sentences = [
    intro,
    say.recommendList(names),
    friedNames.length ? say.recommendFried(friedNames) : "",
    say.recommendScore(names[0], styles[0].compatibility),
    caveatSentence(styles[0].recipe?.scores?.warnings, catalog) ?? "",
    channel === "alexa" ? say.recommendFollowUpAlexa(names[0]) : say.recommendFollowUpSiri(names[0]),
  ];
  return finish("recommend", sentences, {
    url,
    title: say.cardRecommend,
    endSession: channel !== "alexa",
    ...(channel === "alexa" ? { reprompt: say.askStyleReprompt, pending } : {}),
    data: { styles: styles.map((s) => ({ style_id: s.id, compatibility: s.compatibility })) },
  });
}

function answerRecipe(query: VoiceQuery, opts: VoiceOptions): VoiceAnswer {
  const { catalog, channel, baseUrl } = opts;
  const say = catalog.say;
  const style = query.styleId ? STYLES_DB[query.styleId] : undefined;
  if (!style) {
    return finish("recipe", [say.askStyle], {
      title: say.cardRecipe,
      endSession: channel !== "alexa",
      reprompt: say.askStyleReprompt,
      pending: { intent: "recipe", balls: query.balls, hours: query.hours, kitchen: query.kitchen },
    });
  }
  const balls = query.balls ?? getDefaultDoughBalls(style);
  const r = callWithKitchen("generate_recipe", { style_id: style.id, dough_balls: balls }, query);
  const name = spokenStyleName(style.id, r.style.name, catalog);
  const url = `${baseUrl}/recipe/${encodeURIComponent(style.id)}?mode=adapted`;
  const defaultOven = !query.kitchen.ovenType && !query.kitchen.ovenModel && query.kitchen.ovenMaxTempC === undefined;
  const intro = say.defaultKitchen(defaultOven, false);
  const base = { url, title: `${say.cardRecipe}: ${name}`, endSession: true };

  if (r.outcome === "not_feasible") {
    const sentences = [intro, say.notFeasible(name)];
    for (const b of (r.blockers ?? []) as Json[]) {
      if (b.kind === "oven_too_cold") sentences.push(say.blockerOven(b.oven_c, b.style_min_c));
    }
    // Una sola frase sul tempo, con il minimo vero (il blocco di tempo più alto).
    const hours = neededHours(r.blockers);
    if (hours !== undefined) sentences.push(say.blockerTime(spokenHours(hours, catalog, true)));
    if (sentences.length === 2) sentences.push(say.blockerOther);
    // La guida MCP: niente ricetta da seguire, alternative da recommend_styles.
    const alternatives = bakedFirst((callWithKitchen("recommend_styles", { limit: 6 }, query).styles ?? []) as Json[])
      .filter((s) => s.id !== style.id)
      .slice(0, 2)
      .map((s) => spokenStyleName(s.id, s.name, catalog));
    sentences.push(alternatives.length ? say.alternatives(alternatives) : say.noAlternatives);
    return finish("recipe", sentences, { ...base, data: { style_id: style.id, dough_balls: balls, outcome: r.outcome } });
  }

  const grams = (id: string) => (r.ingredients as Json[]).find((i) => i.name === id)?.grams as number | undefined;
  const yeastRow = (r.ingredients as Json[]).find((i) => String(i.name).startsWith("yeast_"));
  const g = (n: number) => spokenGrams(n, catalog);
  const unitKey = (getServingUnit(style) in catalog.units ? getServingUnit(style) : "pezzo") as ServingUnitWord;
  const sentences = [
    intro,
    say.recipeHead(name, r.dough_balls, catalog.units[unitKey], g(r.ball_weight_g)),
    say.flourWater(g(grams("flour") ?? 0), g(grams("water") ?? 0)),
  ];
  const salt = g(grams("salt") ?? 0);
  const extras: string[] = [];
  const fat = grams("fat");
  if (fat) extras.push(say.extraFat(say.fatKinds[r.fat_type] ?? say.fatKinds.oil, g(fat)));
  const sugar = grams("sugar");
  if (sugar) extras.push(say.extraSugar(g(sugar)));
  // Al massimo tre numeri per frase: un solo extra entra con sale e lievito.
  const inline = yeastRow && extras.length === 1 ? extras.shift() : undefined;
  if (yeastRow) {
    const kind = say.yeastKinds[String(yeastRow.name).slice("yeast_".length)] ?? say.yeastFallback;
    sentences.push(say.saltYeast(salt, g(yeastRow.grams), kind, inline));
  } else {
    sentences.push(say.saltOnly(salt));
  }
  if (extras.length) sentences.push(say.extras(extras));
  const blend = (r.flour_blend ?? []) as Json[];
  if (blend.length > 1) sentences.push(say.blend(blend.map((c) => String(c.name).replace(/^farina (di |tipo )?/i, "").toLowerCase())));
  else sentences.push(say.flourBand(flourBandWords(r.parameter_ranges?.flour_w, r.flour_w, catalog)));
  if (r.pre_ferment) sentences.push(say.preFerment(say.preFermentKinds[r.pre_ferment.type] ?? r.pre_ferment.type, g(r.pre_ferment.flour_g)));
  if (style.dough.unleavened) sentences.push(say.unleavened);
  else sentences.push(say.fermentation(spokenHours(r.fermentation_hours, catalog), Math.round(r.fermentation_temp_c), r.fermentation_temp_c <= 8));
  const total = spokenHours(r.schedule.total_minutes / 60, catalog);
  sentences.push(isFriedStyle(style) ? say.fry(Math.round(r.oven_temp_c), total) : say.oven(Math.round(r.oven_temp_c), total));
  const caveats = caveatSentence(r.scores?.warnings, catalog);
  if (caveats) sentences.push(caveats);
  sentences.push(channel === "alexa" ? say.stepsInAppAlexa : say.stepsInApp);
  return finish("recipe", sentences, {
    ...base,
    data: { style_id: style.id, dough_balls: r.dough_balls, outcome: r.outcome, ingredients: r.ingredients },
  });
}

function answerGlossary(query: VoiceQuery, opts: VoiceOptions): VoiceAnswer {
  const { catalog, baseUrl } = opts;
  const url = `${baseUrl}/learn/glossary`;
  if (!query.termId) return finish("glossary", [catalog.say.unknownTerm], { url, title: catalog.say.cardGlossary, endSession: true });
  const term = callMcpTool("glossary", { term: query.termId, lang: catalog.lang });
  const name = catalog.spokenTermNames[query.termId] ?? String(term.name).replace(/\s*\(.*?\)/g, "").trim();
  const definition = firstSentences(speechify(String(term.definition), catalog), 40);
  return finish("glossary", [catalog.say.glossaryAnswer(name, definition)], {
    url,
    title: `${catalog.say.cardGlossary}: ${name}`,
    endSession: true,
    data: { term_id: query.termId },
  });
}

/** La risposta vocale a una richiesta già capita. */
export function answerVoice(query: VoiceQuery, opts: VoiceOptions): VoiceAnswer {
  const { catalog, channel } = opts;
  const say = catalog.say;
  switch (query.intent) {
    case "recommend":
      return answerRecommend(query, opts);
    case "recipe":
      return answerRecipe(query, opts);
    case "glossary":
      return answerGlossary(query, opts);
    case "help":
      return finish("help", [say.help], { title: say.cardHelp, endSession: channel !== "alexa", reprompt: say.helpReprompt });
    default:
      return finish("fallback", [say.fallback], { title: say.cardHelp, endSession: channel !== "alexa", reprompt: say.fallbackReprompt });
  }
}
