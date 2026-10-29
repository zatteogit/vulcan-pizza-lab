/* ═══ FW-02 — ScienceSheet: la scienza a richiesta, sempre con la stessa scala ═══
 * L1 «In breve»       una frase (cms.science.notes.<id>.l1), numeri dal motore via `context`;
 * L2 «Perché»         parole semplici (l2), più «In questa ricetta» se il chiamante
 *                     passa i valori e i controlli di questa ricetta (children);
 * L3 «Come lo calcoliamo»  chiuso di default (ds/Disclosure): statuto, formula,
 *                     variabili con unità, ipotesi, incertezza, fonti con stato,
 *                     voce di glossario.
 * Guscio: ds/ModalSheet (foglio dal basso sui telefoni, card centrata sopra),
 * focus, Tab ed Esc da use-dialog-focus; alla chiusura il fuoco torna al
 * pulsante che l'ha aperto. Tutti i dati vengono dal registro
 * (src/app/data/science-notes.ts): qui non si scrive nessuna affermazione. */

import { useId, useRef, type ReactNode } from "react";
import { Link, useInRouterContext } from "react-router";
import { ArrowRight, ExternalLink, X } from "lucide-react";
import { Disclosure, EvidenceBadge, IconButton, ModalSheet } from "../../components/ds";
import type { EvidenceKind, ScienceNote, ScienceUnitKey, SourceRef, SourceStatus } from "../../domain/science/types";
import { formatNumber, formatPercent } from "../../i18n/format";
import { uiMessage } from "../../i18n/ui-messages";
import { useCms } from "../cms/cms-context";
import { createFormatter, t } from "../cms/i18n";
import { useScienceNote, type ScienceLevel } from "./use-science-note";

export type ScienceContext = Record<string, number | string>;

export interface ScienceSheetProps {
  noteId: string;
  open: boolean;
  onClose: () => void;
  /** 1 «In breve», 2 «Perché», 3 «Come lo calcoliamo» (aperto). Default dal livello di dettaglio. */
  initialLevel?: ScienceLevel;
  /** Valori del motore per i segnaposto dei testi ({hours}, {temp}…). */
  context?: ScienceContext;
  /** Valori e controlli di questa ricetta, sotto «Perché». */
  children?: ReactNode;
}

/* Testi letterali: il guard i18n riconosce solo chiamate con la chiave scritta. */
export function evidenceLabel(kind: EvidenceKind): string {
  switch (kind) {
    case "exact": return uiMessage("science.evidence.exact");
    case "estimate": return uiMessage("science.evidence.estimate");
    case "assumption": return uiMessage("science.evidence.assumption");
    case "editorial": return uiMessage("science.evidence.editorial");
  }
}

function evidenceHint(kind: EvidenceKind): string {
  switch (kind) {
    case "exact": return uiMessage("science.evidence.exactHint");
    case "estimate": return uiMessage("science.evidence.estimateHint");
    case "assumption": return uiMessage("science.evidence.assumptionHint");
    case "editorial": return uiMessage("science.evidence.editorialHint");
  }
}

function unitLabel(unit: ScienceUnitKey): string {
  switch (unit) {
    case "percent": return uiMessage("science.unit.percent");
    case "hours": return uiMessage("science.unit.hours");
    case "minutes": return uiMessage("science.unit.minutes");
    case "seconds": return uiMessage("science.unit.seconds");
    case "celsius": return uiMessage("science.unit.celsius");
    case "grams": return uiMessage("science.unit.grams");
    case "ratio": return uiMessage("science.unit.ratio");
    case "w-alveograph": return uiMessage("science.unit.wAlveograph");
    case "g-per-cm2": return uiMessage("science.unit.gPerCm2");
    case "w-per-m-k": return uiMessage("science.unit.wPerMK");
    case "kilojoule": return uiMessage("science.unit.kilojoule");
    case "index-100": return uiMessage("science.unit.index100");
    case "dimensionless": return uiMessage("science.unit.dimensionless");
  }
}

function sourceStatusLabel(status: SourceStatus): string | null {
  switch (status) {
    case "verified": return uiMessage("science.source.verified");
    case "plausible": return uiMessage("science.source.plausible");
    case "unverified": return uiMessage("science.source.unverified");
    case "wrong": return null;
  }
}

function sourceMeta(source: SourceRef): string | null {
  if (source.author && source.year) return uiMessage("science.source.authorYear", [source.author, source.year]);
  if (source.author) return source.author;
  if (source.year) return String(source.year);
  return null;
}

/** Numeri del contesto nel formato della lingua; le stringhe arrivano già formattate. */
function formatContext(context: ScienceContext | undefined, locale: string): Record<string, string | number> {
  if (!context) return {};
  return Object.fromEntries(
    Object.entries(context).map(([key, value]) => [key, typeof value === "number" ? formatNumber(value, locale) : value]),
  );
}

function GlossaryLink({ termId }: { termId: string }) {
  const inRouter = useInRouterContext();
  const href = `/learn/glossary#${termId}`;
  const content = (
    <>
      {uiMessage("ds.disclosure.openGlossary")}
      <ArrowRight size={14} aria-hidden="true" />
    </>
  );
  return inRouter
    ? <Link to={href} className="science-sheet__link">{content}</Link>
    : <a href={href} className="science-sheet__link">{content}</a>;
}

function Uncertainty({ note }: { note: ScienceNote }) {
  const { cms, bcp47 } = useCms();
  const fmt = createFormatter(cms.ui, bcp47);
  const uncertainty = note.uncertainty;
  if (!uncertainty || (uncertainty.relative === undefined && !uncertainty.range)) return null;
  const parts: string[] = [];
  if (uncertainty.relative !== undefined) {
    parts.push(uiMessage("science.sheet.uncertaintyRelative", [formatPercent(uncertainty.relative * 100, bcp47)]));
  }
  if (uncertainty.range) {
    const [low, high] = uncertainty.range;
    const value = (n: number) => (uncertainty.unitKey === "celsius" ? fmt.celsius(n) : formatNumber(n, bcp47));
    parts.push(uiMessage("science.sheet.uncertaintyRange", [uiMessage("detailLevel.range", [value(low), value(high)])]));
  }
  return (
    <>
      <dt className="science-sheet__term">{uiMessage("science.sheet.uncertainty")}</dt>
      {parts.map((part) => <dd key={part} className="science-sheet__value">{part}</dd>)}
    </>
  );
}

function HowWeCalculate({ note, assumptions }: { note: ScienceNote & { sources: SourceRef[] }; assumptions: { id: string; text: string }[] }) {
  const sources = note.sources.filter((source) => source.status !== "wrong");
  return (
    <section className="science-sheet__method" data-region="science-method">
      <dl className="science-sheet__facts">
        <dt className="science-sheet__term">{uiMessage("science.sheet.evidence")}</dt>
        <dd className="science-sheet__value science-sheet__value--evidence">
          <EvidenceBadge kind={note.kind} label={evidenceLabel(note.kind)} />
          <span className="science-sheet__hint">{evidenceHint(note.kind)}</span>
        </dd>
        {note.formula && (
          <>
            <dt className="science-sheet__term">{uiMessage("science.sheet.formula")}</dt>
            <dd className="science-sheet__value"><code className="science-sheet__formula">{note.formula}</code></dd>
          </>
        )}
        {note.variables && note.variables.length > 0 && (
          <>
            <dt className="science-sheet__term">{uiMessage("science.sheet.variables")}</dt>
            <dd className="science-sheet__value">
              <ul className="science-sheet__list science-sheet__list--plain">
                {note.variables.map((variable) => (
                  <li key={variable.symbol} className="science-sheet__variable">
                    <code className="science-sheet__symbol">{variable.symbol}</code>
                    <span className="science-sheet__unit">{unitLabel(variable.unitKey)}</span>
                  </li>
                ))}
              </ul>
            </dd>
          </>
        )}
        <Uncertainty note={note} />
      </dl>

      {assumptions.length > 0 && (
        <>
          <h4 className="science-sheet__subheading">{uiMessage("science.sheet.assumptions")}</h4>
          <ul className="science-sheet__list">
            {assumptions.map((item) => <li key={item.id}>{item.text}</li>)}
          </ul>
        </>
      )}

      <h4 className="science-sheet__subheading">{uiMessage("science.sheet.sources")}</h4>
      {sources.length > 0 ? (
        <ul className="science-sheet__list science-sheet__list--sources">
          {sources.map((source) => {
            const meta = sourceMeta(source);
            const status = sourceStatusLabel(source.status);
            return (
              <li key={source.id} className="science-sheet__source" data-status={source.status}>
                {source.url ? (
                  <a href={source.url} target="_blank" rel="noreferrer" className="science-sheet__source-title">
                    {source.title}
                    <ExternalLink size={12} aria-hidden="true" />
                  </a>
                ) : (
                  <cite className="science-sheet__source-title">{source.title}</cite>
                )}
                {meta && <small className="science-sheet__source-meta">{meta}</small>}
                {status && <small className="science-sheet__source-status">{status}</small>}
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="science-sheet__text">
          {note.kind === "editorial" ? uiMessage("science.sheet.noSourcesEditorial") : uiMessage("science.sheet.noSourcesAssumption")}
        </p>
      )}

      {note.glossaryTermId && <GlossaryLink termId={note.glossaryTermId} />}
    </section>
  );
}

export function ScienceSheet({ noteId, open, onClose, initialLevel, context, children }: ScienceSheetProps) {
  const { cms, bcp47 } = useCms();
  const { view, initialLevel: preferred } = useScienceNote(noteId);
  const baseId = useId().replace(/:/g, "");
  const titleId = `science-${baseId}-title`;
  const titleRef = useRef<HTMLHeadingElement>(null);
  const whyRef = useRef<HTMLHeadingElement>(null);
  const level = initialLevel ?? preferred;
  const focusRef = level === 1 ? titleRef : whyRef;
  const vars = formatContext(context, bcp47);

  return (
    <ModalSheet
      open={open && view !== undefined}
      onClose={onClose}
      ariaLabelledby={titleId}
      size="md"
      scrim="soft"
      surface="solid"
      entry="slide"
      panelClassName="science-sheet"
      initialFocusRef={focusRef}
    >
      {view && (
        <>
          <header className="science-sheet__header">
            <h2 id={titleId} ref={titleRef} tabIndex={-1} className="science-sheet__title">{view.title}</h2>
            <IconButton size="md" variant="ghost" onClick={onClose} aria-label={cms.ui.close} className="science-sheet__close">
              <X size={18} aria-hidden="true" />
            </IconButton>
          </header>
          <section className="science-sheet__body" data-region="science-body">
            <section className="science-sheet__level" aria-labelledby={`${titleId}-l1`}>
              <h3 id={`${titleId}-l1`} className="science-sheet__heading">{uiMessage("science.sheet.level1")}</h3>
              <p className="science-sheet__lead">{t(view.l1, vars)}</p>
            </section>
            <section className="science-sheet__level" aria-labelledby={`${titleId}-l2`}>
              <h3 id={`${titleId}-l2`} ref={whyRef} tabIndex={-1} className="science-sheet__heading">{uiMessage("science.sheet.level2")}</h3>
              <p className="science-sheet__text">{t(view.l2, vars)}</p>
            </section>
            {children && (
              <section className="science-sheet__level science-sheet__level--recipe" aria-labelledby={`${titleId}-recipe`}>
                <h3 id={`${titleId}-recipe`} className="science-sheet__heading">{uiMessage("science.sheet.inThisRecipe")}</h3>
                {children}
              </section>
            )}
            <Disclosure
              variant="card"
              headingLevel={3}
              id={`${titleId}-l3`}
              summary={uiMessage("science.sheet.level3")}
              meta={<EvidenceBadge kind={view.note.kind} label={evidenceLabel(view.note.kind)} size="sm" />}
              defaultOpen={level === 3}
              className="science-sheet__l3"
            >
              <HowWeCalculate note={view.note} assumptions={view.assumptions} />
            </Disclosure>
          </section>
        </>
      )}
    </ModalSheet>
  );
}
