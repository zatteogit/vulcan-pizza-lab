/* ═══ G1a-WP-01 — Scheda farina (S04-A-01, S04-B-02) ═══
 * I dati di una farina di FLOURS_DB per la pagina /learn/flour/:flourId, ognuno
 * con il suo statuto: esatto se la scheda del produttore lo riporta
 * (docs/fonti-dati.md §2.1, data/flour-sources.ts), altrimenti stima; stato
 * della fonte «da verificare» per le farine generiche e per i campi senza
 * scheda, «errato» per i valori che la scheda contraddice (la UI non li
 * mostra, D-G1a-01). Puro: niente React né CMS. */

import { FLOURS_DB } from "../data/flour-database";
import { FLOUR_SOURCES, type FlourFieldId } from "../data/flour-sources";
import { STYLES_DB } from "../domain/pizza-engine";
import type { EvidenceKind, SourceStatus } from "../domain/science/types";

export type { FlourFieldId };

export type FlourFieldUnit = "w" | "ratio" | "percent" | "seconds" | "minutes";

export interface FlourField {
  id: FlourFieldId;
  value: number;
  unit: FlourFieldUnit;
  evidence: EvidenceKind;
  sourceStatus: SourceStatus;
  sourceId?: string;
}

export interface FlourSheet {
  id: string;
  name: string;
  producer: string;
  /** Il produttore è «Generico»: nessuna scheda da citare. */
  generic: boolean;
  /** Il produttore non dichiara W e P/L (C-4): sono stime di Vulcan. */
  wDeclared: boolean;
  compatibleStyleIds: string[];
  fermentationHours: [number, number];
  /** Solo i campi con un valore: W, P/L e falling number a 0 vogliono dire
   *  «non applicabile» (farine senza glutine), non «zero». */
  fields: FlourField[];
  /** Fonti citate dai campi mostrabili, senza ripetizioni. */
  sourceIds: string[];
}

const FIELD_UNITS: readonly [FlourFieldId, FlourFieldUnit][] = [
  ["w", "w"],
  ["pl", "ratio"],
  ["proteine_pct", "percent"],
  ["assorbimento_pct", "percent"],
  ["falling_number", "seconds"],
  ["stabilita_min", "minutes"],
];

export function buildFlourSheet(flourId: string): FlourSheet | null {
  const flour = FLOURS_DB.find((item) => item.id === flourId);
  if (!flour) return null;
  const generic = flour.producer === "Generico";
  const wDeclared = flour.w_declared !== false;
  const sources = generic ? {} : FLOUR_SOURCES[flour.id] ?? {};

  const fields: FlourField[] = [];
  for (const [id, unit] of FIELD_UNITS) {
    const value = flour[id];
    if (!(value > 0)) continue;
    const source = sources[id];
    const sourceStatus: SourceStatus = source?.status ?? "unverified";
    const undeclared = !wDeclared && (id === "w" || id === "pl");
    fields.push({
      id,
      value,
      unit,
      evidence: sourceStatus === "verified" && !undeclared ? "exact" : "estimate",
      sourceStatus,
      ...(source ? { sourceId: source.sourceId } : {}),
    });
  }

  return {
    id: flour.id,
    name: flour.name,
    producer: flour.producer,
    generic,
    wDeclared,
    compatibleStyleIds: flour.stili_compatibili.filter((id) => id in STYLES_DB),
    fermentationHours: [flour.fermentazione_min_h, flour.fermentazione_max_h],
    fields,
    sourceIds: [...new Set(fields.filter((f) => f.sourceStatus !== "wrong" && f.sourceId).map((f) => f.sourceId as string))],
  };
}
