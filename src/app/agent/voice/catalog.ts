/* ═══ Voce — forma di un catalogo di lingua e registro delle lingue ═══
 * Oggi solo l'italiano. Una lingua nuova: un file catalog-<lang>.ts con la
 * stessa forma e una riga in VOICE_CATALOGS; il resto del modulo non cambia. */

import type { OvenType } from "../../domain/pizza-engine";
import { VOICE_IT } from "./catalog-it";

export type ServingUnitWord = "panetto" | "teglia" | "pala" | "focaccia" | "padellino" | "pezzo";

export interface VoiceCatalog {
  lang: string;
  /** Locale per Alexa / BCP 47. */
  locale: string;
  decimalSeparator: string;
  units: Record<ServingUnitWord, readonly [string, string]>;
  /** id stile → modi di dirlo, in minuscolo (il riconoscimento normalizza accenti e apostrofi; il modello Alexa li usa così). */
  styleSynonyms: Record<string, string[]>;
  spokenStyleNames: Record<string, string>;
  /** id termine del glossario → modi di dirlo (stesse regole). */
  termSynonyms: Record<string, string[]>;
  spokenTermNames: Record<string, string>;
  ovenWords: { type: OvenType; words: string[] }[];
  ovenBrands: Record<string, string>;
  numberWords: Record<string, number>;
  cues: { help: string[]; glossary: string[]; recommend: string[]; recipe: string[] };
  countNouns: string[];
  /** halfDay: «mezza giornata» (12 ore); dayWords: «un giorno» senza numero (24 ore). */
  hourWords: { hours: string[]; days: string[]; half: string[]; halfDay: string[]; dayWords: string[] };
  say: {
    welcome: string;
    welcomeReprompt: string;
    help: string;
    helpReprompt: string;
    fallback: string;
    fallbackReprompt: string;
    goodbye: string;
    error: string;
    tooLong: string;
    askStyle: string;
    askStyleReprompt: string;
    unknownTerm: string;
    defaultKitchen: (oven: boolean, hours: boolean) => string;
    recommendList: (names: string[]) => string;
    recommendFried: (names: string[]) => string;
    recommendScore: (name: string, score: number) => string;
    recommendNone: string;
    recommendNeedsHours: (name: string, hours: string, baked: boolean) => string;
    recommendNeedsOven: (name: string, temp: number) => string;
    /** Dopo un consiglio: non una domanda sì/no (Alexa), lo stile da dire. */
    recommendFollowUpAlexa: (name: string) => string;
    recommendFollowUpSiri: (name: string) => string;
    recipeHead: (name: string, count: number, unit: readonly [string, string], grams: string) => string;
    flourWater: (flour: string, water: string) => string;
    saltYeast: (salt: string, yeast: string, yeastKind: string, extra?: string) => string;
    saltOnly: (salt: string) => string;
    extras: (parts: string[]) => string;
    extraFat: (kind: string, grams: string) => string;
    extraSugar: (grams: string) => string;
    fatKinds: Record<string, string>;
    yeastKinds: Record<string, string>;
    yeastFallback: string;
    flourBand: (band: string) => string;
    flourBands: { weak: string; medium: string; strong: string; veryStrong: string };
    blend: (names: string[]) => string;
    preFerment: (kind: string, flour: string) => string;
    preFermentKinds: Record<string, string>;
    fermentation: (hours: string, temp: number, fridge: boolean) => string;
    oven: (temp: number, total: string) => string;
    fry: (temp: number, total: string) => string;
    unleavened: string;
    stepsInApp: string;
    stepsInAppAlexa: string;
    notFeasible: (name: string) => string;
    blockerOven: (oven: number, min: number) => string;
    blockerTime: (hours: string) => string;
    blockerOther: string;
    alternatives: (names: string[]) => string;
    noAlternatives: string;
    caveatsIntro: string;
    caveats: Record<string, string>;
    caveatOther: string;
    hoursPhrase: (whole: number, half: boolean, approx: boolean) => string;
    minutesPhrase: (minutes: number) => string;
    glossaryAnswer: (name: string, definition: string) => string;
    cardRecipe: string;
    cardRecommend: string;
    cardGlossary: string;
    cardHelp: string;
    openOnVulcan: string;
  };
  speechReplacements: [RegExp, string][];
  rangeWord: (a: string, b: string, afterPreposition: boolean) => string;
  rangePrepositions: string[];
}

export const VOICE_CATALOGS = { it: VOICE_IT } as const satisfies Record<string, VoiceCatalog>;
export type VoiceLang = keyof typeof VOICE_CATALOGS;
export const VOICE_LANGS = Object.keys(VOICE_CATALOGS) as VoiceLang[];

/** Il catalogo della lingua chiesta; l'italiano se la lingua non c'è ancora. */
export function voiceCatalog(lang: string | null | undefined): VoiceCatalog {
  const key = String(lang ?? "").toLowerCase().slice(0, 2);
  return (VOICE_CATALOGS as Record<string, VoiceCatalog>)[key] ?? VOICE_IT;
}
