/* ═══ FW-02 — «Perché?»: la nota del registro con i suoi testi ═══
 * Unisce i dati della nota (src/app/data/science-notes.ts: statuto, formula,
 * variabili, ipotesi, fonti, incertezza) con i testi del CMS
 * (`science.notes.<id>`, `science.assumptions.<id>`) e con il livello di
 * dettaglio globale (FW-08, D-C): chi ha scelto «Mostra i dettagli tecnici»
 * apre il foglio sul livello «Perché». Il «Perché?» resta per tutti. */

import { useMemo } from "react";
import type { ScienceNote, SourceRef } from "../../domain/science/types";
import { resolveScienceNote } from "../../data/science-notes";
import { useCms } from "../cms/cms-context";
import { useDetailLevel, type DetailLevel } from "../../hooks/use-detail-level";
import { localizedFormula } from "./source-label";

export type ScienceLevel = 1 | 2 | 3;

export interface ScienceNoteView {
  note: ScienceNote & { sources: SourceRef[] };
  title: string;
  l1: string;
  l2: string;
  assumptions: { id: string; text: string }[];
  /** Formula nella lingua attiva (CMS `science.formulas.<id>`). */
  formula?: string;
  /** Note descrittive delle fonti (CMS `science.sourceNotes`). */
  sourceNotes: Record<string, string>;
}

/** Livello da cui parte il foglio: 'technical' → 2 («Perché»), altrimenti 1. */
export function initialLevelFor(detailLevel: DetailLevel): ScienceLevel {
  return detailLevel === "technical" ? 2 : 1;
}

export function useScienceNote(noteId: string): {
  view: ScienceNoteView | undefined;
  detailLevel: DetailLevel;
  initialLevel: ScienceLevel;
} {
  const { cms } = useCms();
  const { level } = useDetailLevel();
  const view = useMemo<ScienceNoteView | undefined>(() => {
    const note = resolveScienceNote(noteId);
    const text = cms.science?.notes?.[noteId];
    if (!note || !text) return undefined;
    const assumptions = (note.assumptionIds ?? [])
      .map((id) => ({ id, text: cms.science?.assumptions?.[id] ?? "" }))
      .filter((item) => item.text.trim().length > 0);
    const formula = localizedFormula(noteId, note.formula, cms.science?.formulas);
    return { note, title: text.title, l1: text.l1, l2: text.l2, assumptions, formula, sourceNotes: cms.science?.sourceNotes ?? {} };
  }, [cms.science, noteId]);
  return { view, detailLevel: level, initialLevel: initialLevelFor(level) };
}
