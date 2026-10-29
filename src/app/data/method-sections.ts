import type { ScienceNote, SourceRef, SourceStatus } from "../domain/science/types";
import { SCIENCE_NOTES } from "./science-notes";
import { SCIENCE_SOURCES } from "./science-sources";

/* ═══ FW-15 — «Metodo e fonti»: la pagina come vista del registro (D-D) ═══
 * La pagina non ha contenuti propri: raggruppa le note di science-notes.ts,
 * le ipotesi che citano e le fonti di science-sources.ts. Una nota nuova
 * compare da sola (nel gruppo «altre note» finché non le si assegna un
 * gruppo); una fonte «wrong» non si mostra (convenzioni dell'audit, §3).
 * Modulo puro: niente React, CMS o browser. */

export const METHOD_GROUP_IDS = ["fermentation", "dough", "flour", "oven", "score", "troubleshooting", "other"] as const;
export type MethodGroupId = (typeof METHOD_GROUP_IDS)[number];

const GROUP_OF_NOTE: Readonly<Record<string, MethodGroupId>> = {
  "yeast-dose": "fermentation",
  "q10-fermentation": "fermentation",
  "equivalent-hours": "fermentation",
  "kitchen-temp-default": "fermentation",
  "proof-split": "fermentation",
  "sourdough-starter-dose": "fermentation",
  "pre-ferment": "fermentation",
  autolysis: "fermentation",
  "water-temp-rule": "dough",
  "water-activity": "dough",
  "dough-indices": "dough",
  "salt-range": "dough",
  "stg-salt-timing": "dough",
  "thickness-factor": "dough",
  "linked-params": "dough",
  "flour-w-by-grade": "flour",
  "flour-pl-estimate": "flour",
  "stg-flour-w": "flour",
  "oven-max-temp": "oven",
  "oven-preset-max-temp": "oven",
  "stg-oven-temp": "oven",
  "style-min-oven-temp": "oven",
  "bake-time-home-preheat": "oven",
  "surface-conductivity": "oven",
  "baking-energy": "oven",
  "score-weights": "score",
  "non-feasible-ceiling": "score",
  "authenticity-fuel-cap": "score",
  "ranking-tiebreak": "score",
  digestibility: "score",
  "troubleshooting-thresholds": "troubleshooting",
};

export interface MethodGroup {
  id: MethodGroupId;
  notes: ScienceNote[];
}

/** Note per gruppo, nell'ordine dei gruppi e del registro; gruppi vuoti esclusi. */
export function methodGroups(notes: readonly ScienceNote[] = SCIENCE_NOTES): MethodGroup[] {
  return METHOD_GROUP_IDS
    .map((id) => ({ id, notes: notes.filter((note) => (GROUP_OF_NOTE[note.id] ?? "other") === id) }))
    .filter((group) => group.notes.length > 0);
}

/** Ipotesi del modello, una volta sola, con le note che le usano. */
export function methodAssumptions(notes: readonly ScienceNote[] = SCIENCE_NOTES): { id: string; noteIds: string[] }[] {
  const byId = new Map<string, string[]>();
  for (const note of notes) {
    for (const id of note.assumptionIds ?? []) byId.set(id, [...(byId.get(id) ?? []), note.id]);
  }
  return [...byId].map(([id, noteIds]) => ({ id, noteIds }));
}

const STATUS_ORDER: readonly SourceStatus[] = ["verified", "plausible", "unverified"];

/** Fonti da mostrare (niente «wrong»), per stato e poi nell'ordine del registro, con le note che le citano. */
export function methodSources(
  sources: readonly SourceRef[] = SCIENCE_SOURCES,
  notes: readonly ScienceNote[] = SCIENCE_NOTES,
): { source: SourceRef; noteIds: string[] }[] {
  return STATUS_ORDER.flatMap((status) => sources
    .filter((source) => source.status === status)
    .map((source) => ({ source, noteIds: notes.filter((note) => note.sourceIds.includes(source.id)).map((note) => note.id) })));
}

/** Data dell'ultima lettura delle fonti (ISO «YYYY-MM-DD»), se ce n'è una. */
export function latestSourceReading(sources: readonly SourceRef[] = SCIENCE_SOURCES): string | undefined {
  return sources.reduce<string | undefined>(
    (latest, source) => (source.accessed && (!latest || source.accessed > latest) ? source.accessed : latest),
    undefined,
  );
}
