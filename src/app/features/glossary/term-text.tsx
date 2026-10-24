import { Fragment, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router";
import { Dialog } from "../../components/ds/index";
import { GLOSSARY_TERMS, getLocalizedTerm, type GlossaryTerm } from "../../data/glossary-data";
import { uiMessage } from "../../i18n/ui-messages";
import { useCms } from "../cms/cms-context";
import { buildTermMatcher } from "./term-matcher";

/* ═══ D-044 — Testo con il gergo toccabile ═══
 * «Puntata», «staglio», «appretto»… diventano pulsanti: un tocco apre la
 * definizione del glossario, con il link alla voce completa. Il dialogo va in
 * un portale: i passi del procedimento sono animati (transform) e un
 * elemento fixed al loro interno non coprirebbe lo schermo. */

export function TermText({ text }: { text: string }) {
  const { cms } = useCms();
  const lang = cms.locale?.id ?? "it";
  const terms = useMemo(() => GLOSSARY_TERMS.map((term) => getLocalizedTerm(term, cms)), [cms]);
  const newSegmenter = useMemo(() => buildTermMatcher(terms, lang), [terms, lang]);
  const segments = useMemo(() => newSegmenter()(text), [newSegmenter, text]);
  const [open, setOpen] = useState<GlossaryTerm | null>(null);

  return (
    <>
      {segments.map((segment, index) =>
        typeof segment === "string" ? (
          <Fragment key={index}>{segment}</Fragment>
        ) : (
          <button
            key={index}
            type="button"
            className="term-link"
            aria-haspopup="dialog"
            onClick={() => setOpen(terms.find((term) => term.id === segment.termId) ?? null)}
          >
            {segment.text}
          </button>
        ),
      )}
      {typeof document !== "undefined" &&
        createPortal(
          <Dialog
            open={open !== null}
            onClose={() => setOpen(null)}
            title={open?.name}
            className="term-dialog"
            actions={
              <>
                <Link to={`/learn/glossary#${open?.id ?? ""}`} className="term-dialog__open" onClick={() => setOpen(null)}>
                  {uiMessage("features.glossary.term-text.open")}
                </Link>
                <button type="button" className="term-dialog__close" onClick={() => setOpen(null)}>
                  {uiMessage("features.glossary.term-text.close")}
                </button>
              </>
            }
          >
            <p className="term-dialog__definition">{open?.definition}</p>
            {open?.whyImportant && <p className="term-dialog__why">{open.whyImportant}</p>}
          </Dialog>,
          document.body,
        )}
    </>
  );
}
