/* ═══ FW-02 — WhyButton: l'unico modo di aprire la scienza a richiesta ═══
 * Aspetto unico (icona + «Perché?», bersaglio ≥ 24 px), nome accessibile
 * «Perché: <titolo della nota>». Sostituisce i «?» decorativi e i `title=`
 * esplicativi: tocco, tastiera e lettori di schermo arrivano allo stesso
 * foglio. Alla chiusura il fuoco torna qui (use-dialog-focus).
 * Il foglio (registro, fonti, L3) si monta al primo tocco: una pagina con
 * molti «Perché?» non calcola fogli che nessuno apre. */

import { useState, type ReactNode } from "react";
import { FlaskConical } from "lucide-react";
import { uiMessage } from "../../i18n/ui-messages";
import { useCms } from "../cms/cms-context";
import { ScienceSheet, type ScienceContext } from "./science-sheet";
import type { ScienceLevel } from "./use-science-note";

export interface WhyButtonProps {
  noteId: string;
  /** Valori del motore per i segnaposto dei testi della nota. */
  context?: ScienceContext;
  /** Testo visibile al posto di «Perché?» (es. «Ricetta e disciplinare»). */
  label?: string;
  initialLevel?: ScienceLevel;
  /** Valori e controlli di questa ricetta, nel foglio sotto «Perché». */
  children?: ReactNode;
  className?: string;
}

export function WhyButton({ noteId, context, label, initialLevel, children, className }: WhyButtonProps) {
  const { cms } = useCms();
  const [open, setOpen] = useState(false);
  const [requested, setRequested] = useState(false);
  const title = cms.science?.notes?.[noteId]?.title;
  // Una nota senza testi nella lingua non si apre: niente pulsante muto.
  if (!title) return null;
  return (
    <>
      <button
        type="button"
        className={["why-button", className].filter(Boolean).join(" ")}
        aria-haspopup="dialog"
        // Con un'etichetta propria il nome accessibile è il testo visibile (WCAG 2.5.3).
        aria-label={label ? undefined : uiMessage("science.why.ariaLabel", [title])}
        onClick={() => {
          setRequested(true);
          setOpen(true);
        }}
      >
        <FlaskConical className="why-button__icon" size={14} aria-hidden="true" />
        <span className="why-button__label">{label ?? uiMessage("science.why.label")}</span>
      </button>
      {requested && (
        <ScienceSheet noteId={noteId} open={open} onClose={() => setOpen(false)} initialLevel={initialLevel} context={context}>
          {children}
        </ScienceSheet>
      )}
    </>
  );
}
