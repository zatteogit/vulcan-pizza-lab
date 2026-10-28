import type { OvenType } from "../domain/pizza-engine";
import { EDITION, type Edition } from "../config/edition";

/* ═══ D-048 — Forni da pizza per marca e modello ═══
 * Dati da docs/ricerca/forni-fonti-2026-10-24.md (pagine dei produttori lette
 * il 24/10/2026; stato V = produttore, P = fonte secondaria). Ogni modello
 * porta al tipo di forno del motore e alla sua temperatura massima dichiarata.
 * Solo forni da pizza: il forno di casa resta generico.
 *
 * Scelte di mappatura (D-048):
 * - Ninja Woodfire (370 °C, elettrico) → elettrico standard alla sua temperatura:
 *   sotto la soglia dell'elettrico da pizza (~400 °C).
 * - Alfa a gas: forni a cupola da 500 °C → gas da pizza, non il gas a platea.
 * - G3 Ferrari Delizia e Sage Pizzaiolo, al limite dei 400 °C → elettrico da pizza.
 * - Multi-combustibile: il combustibile di serie (Karu e Solo Stove Pi legna;
 *   Roccbox, Dome e Bertello gas).
 */

export type OvenFuel = "wood" | "gas" | "electric" | "pellet";

export interface OvenModel {
  id: string;
  brand: string;
  model: string;
  fuel: OvenFuel;
  ovenType: OvenType;
  maxTempC: number;
  /** Diametro massimo della pizza, cm (se dichiarato). */
  pizzaCm?: number;
  /** V: temperatura letta sul sito del produttore; P: fonte secondaria. */
  source: "V" | "P";
}

/** Catalogo completo della generalista. */
export const ALL_OVEN_MODELS: OvenModel[] = [
  // Ooni
  { id: "ooni-koda-12", brand: "Ooni", model: "Koda 12", fuel: "gas", ovenType: "gas_pizza", maxTempC: 500, pizzaCm: 30, source: "V" },
  { id: "ooni-koda-16", brand: "Ooni", model: "Koda 16", fuel: "gas", ovenType: "gas_pizza", maxTempC: 500, pizzaCm: 40, source: "V" },
  { id: "ooni-koda-2", brand: "Ooni", model: "Koda 2", fuel: "gas", ovenType: "gas_pizza", maxTempC: 500, pizzaCm: 35, source: "V" },
  { id: "ooni-koda-2-pro", brand: "Ooni", model: "Koda 2 Pro", fuel: "gas", ovenType: "gas_pizza", maxTempC: 500, pizzaCm: 45, source: "V" },
  { id: "ooni-koda-2-max", brand: "Ooni", model: "Koda 2 Max", fuel: "gas", ovenType: "gas_pizza", maxTempC: 500, pizzaCm: 50, source: "V" },
  { id: "ooni-karu-12", brand: "Ooni", model: "Karu 12", fuel: "wood", ovenType: "wood", maxTempC: 500, pizzaCm: 30, source: "V" },
  { id: "ooni-karu-16", brand: "Ooni", model: "Karu 16", fuel: "wood", ovenType: "wood", maxTempC: 500, pizzaCm: 40, source: "P" },
  { id: "ooni-karu-2", brand: "Ooni", model: "Karu 2", fuel: "wood", ovenType: "wood", maxTempC: 500, pizzaCm: 30, source: "V" },
  { id: "ooni-karu-2-pro", brand: "Ooni", model: "Karu 2 Pro", fuel: "wood", ovenType: "wood", maxTempC: 500, pizzaCm: 40, source: "V" },
  { id: "ooni-fyra-12", brand: "Ooni", model: "Fyra 12", fuel: "pellet", ovenType: "wood", maxTempC: 500, pizzaCm: 30, source: "V" },
  { id: "ooni-volt-12", brand: "Ooni", model: "Volt 12", fuel: "electric", ovenType: "electric_high", maxTempC: 450, source: "V" },
  { id: "ooni-volt-2", brand: "Ooni", model: "Volt 2", fuel: "electric", ovenType: "electric_high", maxTempC: 454, pizzaCm: 30, source: "V" },
  // Gozney
  { id: "gozney-roccbox", brand: "Gozney", model: "Roccbox", fuel: "gas", ovenType: "gas_pizza", maxTempC: 500, pizzaCm: 30, source: "V" },
  { id: "gozney-dome", brand: "Gozney", model: "Dome", fuel: "gas", ovenType: "gas_pizza", maxTempC: 500, pizzaCm: 40, source: "V" },
  { id: "gozney-dome-s1", brand: "Gozney", model: "Dome S1", fuel: "gas", ovenType: "gas_pizza", maxTempC: 500, pizzaCm: 40, source: "P" },
  { id: "gozney-arc", brand: "Gozney", model: "Arc", fuel: "gas", ovenType: "gas_pizza", maxTempC: 500, pizzaCm: 35, source: "V" },
  { id: "gozney-arc-xl", brand: "Gozney", model: "Arc XL", fuel: "gas", ovenType: "gas_pizza", maxTempC: 500, pizzaCm: 40, source: "V" },
  { id: "gozney-arc-lite", brand: "Gozney", model: "Arc Lite", fuel: "gas", ovenType: "gas_pizza", maxTempC: 500, pizzaCm: 30, source: "V" },
  { id: "gozney-tread", brand: "Gozney", model: "Tread", fuel: "gas", ovenType: "gas_pizza", maxTempC: 500, pizzaCm: 30, source: "V" },
  // Effeuno
  { id: "effeuno-p134h", brand: "Effeuno", model: "P134H 509 PRO", fuel: "electric", ovenType: "electric_high", maxTempC: 509, pizzaCm: 34, source: "V" },
  { id: "effeuno-p134ha", brand: "Effeuno", model: "P134HA 509 PRO", fuel: "electric", ovenType: "electric_high", maxTempC: 509, pizzaCm: 34, source: "V" },
  { id: "effeuno-p234h", brand: "Effeuno", model: "P234H 509 PRO", fuel: "electric", ovenType: "electric_high", maxTempC: 509, pizzaCm: 34, source: "V" },
  { id: "effeuno-n3", brand: "Effeuno", model: "N3", fuel: "electric", ovenType: "electric_high", maxTempC: 500, source: "V" },
  { id: "effeuno-p134ge", brand: "Effeuno", model: "P134GE", fuel: "electric", ovenType: "electric_high", maxTempC: 550, source: "V" },
  // G3 Ferrari, Sage / Breville
  { id: "g3-ferrari-delizia", brand: "G3 Ferrari", model: "Delizia", fuel: "electric", ovenType: "electric_high", maxTempC: 400, pizzaCm: 30, source: "V" },
  { id: "sage-pizzaiolo", brand: "Sage / Breville", model: "the Smart Oven Pizzaiolo", fuel: "electric", ovenType: "electric_high", maxTempC: 400, pizzaCm: 30, source: "V" },
  // Witt
  { id: "witt-etna-rotante", brand: "Witt", model: "ETNA Rotante 16″", fuel: "gas", ovenType: "gas_pizza", maxTempC: 500, pizzaCm: 40, source: "P" },
  { id: "witt-piccolo-rotante-16", brand: "Witt", model: "Piccolo Rotante 16″", fuel: "gas", ovenType: "gas_pizza", maxTempC: 500, pizzaCm: 40, source: "V" },
  { id: "witt-piccolo-rotante-13", brand: "Witt", model: "Piccolo Rotante 13″", fuel: "gas", ovenType: "gas_pizza", maxTempC: 500, pizzaCm: 33, source: "P" },
  { id: "witt-egnite-13", brand: "Witt", model: "eGNITE Control 13″", fuel: "electric", ovenType: "electric_high", maxTempC: 460, pizzaCm: 33, source: "V" },
  // Clementi, Alfa Forni
  { id: "clementi-gold", brand: "Clementi", model: "Gold", fuel: "wood", ovenType: "wood", maxTempC: 500, source: "V" },
  { id: "alfa-moderno-1-gas", brand: "Alfa Forni", model: "Moderno 1 Pizza (gas)", fuel: "gas", ovenType: "gas_pizza", maxTempC: 500, source: "V" },
  { id: "alfa-moderno-1-legna", brand: "Alfa Forni", model: "Moderno 1 Pizza (legna)", fuel: "wood", ovenType: "wood", maxTempC: 500, source: "V" },
  { id: "alfa-moderno-2-gas", brand: "Alfa Forni", model: "Moderno 2 Pizze (gas)", fuel: "gas", ovenType: "gas_pizza", maxTempC: 500, source: "V" },
  { id: "alfa-moderno-2-legna", brand: "Alfa Forni", model: "Moderno 2 Pizze (legna)", fuel: "wood", ovenType: "wood", maxTempC: 500, source: "V" },
  { id: "alfa-nano", brand: "Alfa Forni", model: "Nano", fuel: "wood", ovenType: "wood", maxTempC: 500, source: "P" },
  // Solo Stove, Ninja, Bertello
  { id: "solo-stove-pi", brand: "Solo Stove", model: "Pi", fuel: "wood", ovenType: "wood", maxTempC: 455, pizzaCm: 30, source: "P" },
  { id: "solo-stove-pi-prime", brand: "Solo Stove", model: "Pi Prime", fuel: "gas", ovenType: "gas_pizza", maxTempC: 500, pizzaCm: 30, source: "P" },
  { id: "ninja-woodfire-oven", brand: "Ninja", model: "Woodfire Outdoor Oven", fuel: "electric", ovenType: "electric_standard", maxTempC: 370, pizzaCm: 30, source: "P" },
  { id: "bertello-simulfire-12", brand: "Bertello", model: "SimulFIRE 12″", fuel: "gas", ovenType: "gas_pizza", maxTempC: 480, pizzaCm: 30, source: "V" },
  { id: "bertello-simulfire-grande", brand: "Bertello", model: "SimulFIRE Grande 16″", fuel: "gas", ovenType: "gas_pizza", maxTempC: 480, pizzaCm: 40, source: "V" },
];

/** Catalogo di un'edizione: modelli in più e filtro per prefisso d'id. */
export function editionOvenModels(edition: Edition, base: readonly OvenModel[] = ALL_OVEN_MODELS): OvenModel[] {
  const extra: OvenModel[] = edition.ovens?.extra ?? [];
  const merged = [...base.filter((model) => !extra.some((own) => own.id === model.id)), ...extra];
  const only = edition.ovens?.only;
  return only ? merged.filter((model) => only.some((prefix) => model.id.startsWith(prefix))) : merged;
}

/** Catalogo dell'edizione di questa build (la generalista: tutti). */
export const OVEN_MODELS: OvenModel[] = editionOvenModels(EDITION);

/** Forno preimpostato dall'edizione, se esiste nel suo catalogo. */
export const EDITION_DEFAULT_OVEN: OvenModel | undefined = EDITION.ovens?.default
  ? OVEN_MODELS.find((model) => model.id === EDITION.ovens?.default)
  : undefined;

const normalize = (text: string) =>
  text.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, " ").trim();

/** Ricerca per marca e modello: tutte le parole cercate devono comparire. */
export function searchOvenModels(query: string, limit = 8): OvenModel[] {
  const words = normalize(query).split(" ").filter(Boolean);
  if (!words.length) return [];
  return OVEN_MODELS.filter((m) => {
    const haystack = normalize(`${m.brand} ${m.model}`);
    return words.every((w) => haystack.includes(w));
  }).slice(0, limit);
}

export function getOvenModel(id: string | null | undefined): OvenModel | undefined {
  return id ? OVEN_MODELS.find((m) => m.id === id) : undefined;
}
