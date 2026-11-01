/* ═══ FW-15 — «Metodo e fonti» (D-D, S11-A-03/B-01, S01-A-01) ═══
 * La porta d'ingresso unica alla scienza di Vulcan, in Impara. Livello 1 in
 * cinque righe («Come lavora»); sotto, il registro della scienza (FW-01) nota
 * per nota, con statuto, formula, ipotesi e fonti a richiesta; poi le ipotesi,
 * le fonti con il loro stato, i limiti del modello e la versione.
 * Ogni nota ha un'ancora con il proprio id (#yeast-dose): ScienceSheet,
 * Informazioni e Profilo ci arrivano con method-link.ts. */

import { Fragment, useEffect, useMemo } from "react";
import { Link, useLocation } from "react-router";
import { Badge, Disclosure, Heading, type BadgeTone } from "../components/ds/index";
import { SubPageHeader } from "../components/shared/sub-page-header";
import { useCms } from "../features/cms/cms-context";
import { uiMessage } from "../i18n/ui-messages";
import { formatCalendarDate, formatPercent, formatShortList } from "../i18n/format";
import { buildVersionText } from "../components/shared/about-links";
import { getScienceSource } from "../data/science-sources";
import { localizedFormula, sourceLabel } from "../features/science/source-label";
import { latestSourceReading, methodAssumptions, methodGroups, methodSources, type MethodGroupId } from "../data/method-sections";
import type { EvidenceKind, ScienceNote, SourceStatus } from "../domain/science/types";
import { METHOD_ANCHORS, methodNoteHref, methodSectionHref, methodSourceAnchor, methodSourceHref } from "../features/method/method-link";
import { LearningIllustration, type LearningIllustrationId } from "../features/learning/learning-illustration";

const NOTE_VISUALS: Readonly<Partial<Record<string, LearningIllustrationId>>> = {
  "q10-fermentation": "dough-temperature",
  "thickness-factor": "portion-weighing",
  "flour-w-by-grade": "alveograph-bubble",
  "surface-conductivity": "oven-floor-dome",
  "score-weights": "a_score",
};

const KIND_TONE: Record<EvidenceKind, BadgeTone> = {
  exact: "success",
  estimate: "accent",
  assumption: "warning",
  editorial: "muted",
};

const STATUS_TONE: Record<Exclude<SourceStatus, "wrong">, BadgeTone> = {
  verified: "success",
  plausible: "accent",
  unverified: "warning",
};

function kindLabel(kind: EvidenceKind): string {
  switch (kind) {
    case "exact":
      return uiMessage("pages.method.kind.exact");
    case "estimate":
      return uiMessage("pages.method.kind.estimate");
    case "assumption":
      return uiMessage("pages.method.kind.assumption");
    default:
      return uiMessage("pages.method.kind.editorial");
  }
}

function kindDescription(kind: EvidenceKind): string {
  switch (kind) {
    case "exact":
      return uiMessage("pages.method.kindDesc.exact");
    case "estimate":
      return uiMessage("pages.method.kindDesc.estimate");
    case "assumption":
      return uiMessage("pages.method.kindDesc.assumption");
    default:
      return uiMessage("pages.method.kindDesc.editorial");
  }
}

function statusLabel(status: Exclude<SourceStatus, "wrong">): string {
  switch (status) {
    case "verified":
      return uiMessage("pages.method.status.verified");
    case "plausible":
      return uiMessage("pages.method.status.plausible");
    default:
      return uiMessage("pages.method.status.unverified");
  }
}

function statusDescription(status: Exclude<SourceStatus, "wrong">): string {
  switch (status) {
    case "verified":
      return uiMessage("pages.method.statusDesc.verified");
    case "plausible":
      return uiMessage("pages.method.statusDesc.plausible");
    default:
      return uiMessage("pages.method.statusDesc.unverified");
  }
}

function groupTitle(id: MethodGroupId): string {
  switch (id) {
    case "fermentation":
      return uiMessage("pages.method.group.fermentation");
    case "dough":
      return uiMessage("pages.method.group.dough");
    case "flour":
      return uiMessage("pages.method.group.flour");
    case "oven":
      return uiMessage("pages.method.group.oven");
    case "score":
      return uiMessage("pages.method.group.score");
    case "troubleshooting":
      return uiMessage("pages.method.group.troubleshooting");
    default:
      return uiMessage("pages.method.group.other");
  }
}

const HOW_KEYS = [
  "pages.method.how.1",
  "pages.method.how.2",
  "pages.method.how.3",
  "pages.method.how.4",
  "pages.method.how.5",
] as const;

const LIMIT_KEYS = [
  "pages.method.limits.1",
  "pages.method.limits.2",
  "pages.method.limits.3",
  "pages.method.limits.4",
] as const;

const KINDS: readonly EvidenceKind[] = ["exact", "estimate", "assumption", "editorial"];

export function MethodPage() {
  const { cms, bcp47 } = useCms();
  const { hash } = useLocation();
  const target = hash.slice(1);
  const groups = useMemo(() => methodGroups(), []);
  const assumptions = useMemo(() => methodAssumptions(), []);
  const sources = useMemo(() => methodSources(), []);
  const readOn = latestSourceReading();
  const noteTitle = (id: string) => cms.science.notes[id]?.title ?? id;

  /* Deep link: #<nota>, #fonte-<id> o una sezione. Il pannello della nota si
     apre da solo (defaultOpen) e la pagina ci scorre sopra. */
  useEffect(() => {
    if (!target) return;
    const frame = requestAnimationFrame(() =>
      document.getElementById(target)?.scrollIntoView({ block: "start" }),
    );
    return () => cancelAnimationFrame(frame);
  }, [target]);

  const toc = [
    { section: "how" as const, id: METHOD_ANCHORS.how, label: uiMessage("pages.method.how.title") },
    { section: "notes" as const, id: METHOD_ANCHORS.notes, label: uiMessage("pages.method.notes.title") },
    { section: "assumptions" as const, id: METHOD_ANCHORS.assumptions, label: uiMessage("pages.method.assumptions.title") },
    { section: "sources" as const, id: METHOD_ANCHORS.sources, label: uiMessage("pages.method.sources.title") },
    { section: "limits" as const, id: METHOD_ANCHORS.limits, label: uiMessage("pages.method.limits.title") },
    { section: "version" as const, id: METHOD_ANCHORS.version, label: uiMessage("pages.method.version.title") },
  ];

  const renderNote = (note: ScienceNote) => {
    const text = cms.science.notes[note.id];
    const formula = localizedFormula(note.id, note.formula, cms.science.formulas);
    const relative = note.uncertainty?.relative;
    return (
      <article key={note.id} id={note.id} data-region="card" className="method-note">
        <header data-region="card-header" className="method-note__head">
          <h4 className="method-note__title">{text?.title ?? note.id}</h4>
          <Badge tone={KIND_TONE[note.kind]} size="xs">{kindLabel(note.kind)}</Badge>
        </header>
        {text?.l1 && <p className="method-note__l1">{text.l1}</p>}
        <Disclosure
          key={target === note.id ? "target" : "rest"}
          variant="inline"
          summary={uiMessage("pages.method.details")}
          defaultOpen={target === note.id}
          className="method-note__details"
        >
          {NOTE_VISUALS[note.id] && <LearningIllustration id={NOTE_VISUALS[note.id]!} />}
          <dl className="method-note__facts">
            {text?.l2 && (
              <>
                <dt>{uiMessage("pages.method.why")}</dt>
                <dd>{text.l2}</dd>
              </>
            )}
            <dt>{uiMessage("pages.method.kind.label")}</dt>
            <dd>{kindDescription(note.kind)}</dd>
            {formula && (
              <>
                <dt>{uiMessage("pages.method.formula")}</dt>
                <dd><code className="method-note__formula">{formula}</code></dd>
              </>
            )}
            {relative !== undefined && (
              <>
                <dt>{uiMessage("pages.method.uncertainty")}</dt>
                <dd>{uiMessage("pages.method.uncertaintyRelative", [formatPercent(relative * 100, bcp47)])}</dd>
              </>
            )}
            {(note.assumptionIds?.length ?? 0) > 0 && (
              <>
                <dt>{uiMessage("pages.method.assumptions.title")}</dt>
                <dd>
                  <ul className="method-note__list">
                    {note.assumptionIds!.map((id) => <li key={id}>{cms.science.assumptions[id] ?? id}</li>)}
                  </ul>
                </dd>
              </>
            )}
            <dt>{uiMessage("pages.method.noteSources")}</dt>
            <dd>
              {note.sourceIds.length === 0 ? (
                uiMessage("pages.method.noSources")
              ) : (
                <ul className="method-note__list">
                  {note.sourceIds.map((id) => {
                    const source = getScienceSource(id);
                    if (!source || source.status === "wrong") return null;
                    return (
                      <li key={id} className="method-note__source">
                        <Link to={methodSourceHref(id)} className="method-page__link">{sourceLabel(source, cms.science.sourceNotes)}</Link>
                        <Badge tone={STATUS_TONE[source.status]} size="xs">{statusLabel(source.status)}</Badge>
                      </li>
                    );
                  })}
                </ul>
              )}
            </dd>
            {note.engineRef && (
              <>
                <dt>{uiMessage("pages.method.engineRef")}</dt>
                <dd><code className="method-note__formula">{note.engineRef}</code></dd>
              </>
            )}
            {note.glossaryTermId && (
              <>
                <dt>{uiMessage("pages.method.glossary")}</dt>
                <dd>
                  <Link to={`/learn/glossary#${note.glossaryTermId}`} className="method-page__link">
                    {uiMessage("pages.method.openGlossary")}
                  </Link>
                </dd>
              </>
            )}
          </dl>
        </Disclosure>
      </article>
    );
  };

  return (
    <div className="method-page">
      <SubPageHeader backTo="/learn" backLabel={cms.pages.navLearn} />

      <main id="main-content" className="method-page__shell" data-region="page">
        <header data-region="page-header" className="method-page__header">
          <Heading level="page">{uiMessage("pages.method.title")}</Heading>
          <p className="page-lead">{uiMessage("pages.method.lead")}</p>
        </header>

        <nav aria-labelledby="method-toc-title" className="method-page__toc" data-region="toc">
          <h2 id="method-toc-title" className="method-page__toc-title">{uiMessage("pages.method.toc")}</h2>
          <ol className="method-page__toc-list">
            {toc.map((item) => (
              <li key={item.id}>
                <Link to={methodSectionHref(item.section)} className="method-page__link">{item.label}</Link>
              </li>
            ))}
          </ol>
        </nav>

        <section id={METHOD_ANCHORS.how} aria-labelledby={`${METHOD_ANCHORS.how}-title`} className="method-page__section" data-region="section">
          <Heading level="md" as="h2" id={`${METHOD_ANCHORS.how}-title`}>{uiMessage("pages.method.how.title")}</Heading>
          <ol className="method-page__how">
            {HOW_KEYS.map((key, i) => <li key={key}>{uiMessage(key)}{i === 0 && <LearningIllustration id="flour-weighing" />}</li>)}
          </ol>
          <dl className="method-page__legend">
            {KINDS.map((kind) => (
              <div key={kind} className="method-page__legend-item" data-region="legend-item">
                <dt><Badge tone={KIND_TONE[kind]} size="xs">{kindLabel(kind)}</Badge></dt>
                <dd>{kindDescription(kind)}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section id={METHOD_ANCHORS.notes} aria-labelledby={`${METHOD_ANCHORS.notes}-title`} className="method-page__section" data-region="section">
          <Heading level="md" as="h2" id={`${METHOD_ANCHORS.notes}-title`}>{uiMessage("pages.method.notes.title")}</Heading>
          <p className="method-page__lead">{uiMessage("pages.method.notes.lead")}</p>
          {groups.map((group) => (
            <section key={group.id} aria-labelledby={`method-group-${group.id}`} className="method-page__group" data-region="group">
              <h3 id={`method-group-${group.id}`} className="method-page__group-title">{groupTitle(group.id)}</h3>
              {group.notes.map(renderNote)}
            </section>
          ))}
        </section>

        <section id={METHOD_ANCHORS.assumptions} aria-labelledby={`${METHOD_ANCHORS.assumptions}-title`} className="method-page__section" data-region="section">
          <Heading level="md" as="h2" id={`${METHOD_ANCHORS.assumptions}-title`}>{uiMessage("pages.method.assumptions.title")}</Heading>
          <p className="method-page__lead">{uiMessage("pages.method.assumptions.lead")}</p>
          <ul className="method-page__items">
            {assumptions.map((item) => (
              <li key={item.id}>
                <p className="method-page__item-text">{cms.science.assumptions[item.id] ?? item.id}</p>
                <p className="type-data-sm method-page__cites">
                  {uiMessage("pages.method.usedBy")}{" "}
                  {item.noteIds.map((id, index) => (
                    <Fragment key={id}>
                      {index > 0 && uiMessage("format.listSeparator")}
                      <Link to={methodNoteHref(id)} className="method-page__link">{noteTitle(id)}</Link>
                    </Fragment>
                  ))}
                </p>
              </li>
            ))}
          </ul>
        </section>

        <section id={METHOD_ANCHORS.sources} aria-labelledby={`${METHOD_ANCHORS.sources}-title`} className="method-page__section" data-region="section">
          <Heading level="md" as="h2" id={`${METHOD_ANCHORS.sources}-title`}>{uiMessage("pages.method.sources.title")}</Heading>
          {readOn && (
            <p className="method-page__lead">{uiMessage("pages.method.sources.lead", [formatCalendarDate(readOn, bcp47)])}</p>
          )}
          <dl className="method-page__legend">
            {(["verified", "plausible", "unverified"] as const).map((status) => (
              <div key={status} className="method-page__legend-item" data-region="legend-item">
                <dt><Badge tone={STATUS_TONE[status]} size="xs">{statusLabel(status)}</Badge></dt>
                <dd>{statusDescription(status)}</dd>
              </div>
            ))}
          </dl>
          <ul className="method-page__items">
            {sources.map(({ source, noteIds }) => {
              if (source.status === "wrong") return null;
              const byline = [source.author ?? "", source.year ? String(source.year) : ""].filter(Boolean);
              return (
                <li key={source.id} id={methodSourceAnchor(source.id)} className="method-source">
                  <p className="method-page__item-text">
                    {source.url ? (
                      <a href={source.url} target="_blank" rel="noopener noreferrer" className="method-page__link">{sourceLabel(source, cms.science.sourceNotes)}</a>
                    ) : (
                      sourceLabel(source, cms.science.sourceNotes)
                    )}
                  </p>
                  <p className="type-data-sm method-page__item-meta">
                    <Badge tone={STATUS_TONE[source.status]} size="xs">{statusLabel(source.status)}</Badge>
                    {byline.length > 0 && <span data-region="byline">{formatShortList(byline)}</span>}
                    {source.accessed && (
                      <span data-region="accessed">{uiMessage("pages.method.sources.readOn", [formatCalendarDate(source.accessed, bcp47)])}</span>
                    )}
                  </p>
                  {noteIds.length > 0 && (
                    <p className="type-data-sm method-page__cites">
                      {uiMessage("pages.method.citedBy")}{" "}
                      {noteIds.map((id, index) => (
                        <Fragment key={id}>
                          {index > 0 && uiMessage("format.listSeparator")}
                          <Link to={methodNoteHref(id)} className="method-page__link">{noteTitle(id)}</Link>
                        </Fragment>
                      ))}
                    </p>
                  )}
                </li>
              );
            })}
          </ul>
        </section>

        <section id={METHOD_ANCHORS.limits} aria-labelledby={`${METHOD_ANCHORS.limits}-title`} className="method-page__section" data-region="section">
          <Heading level="md" as="h2" id={`${METHOD_ANCHORS.limits}-title`}>{uiMessage("pages.method.limits.title")}</Heading>
          <ul className="method-page__how">
            {LIMIT_KEYS.map((key) => <li key={key}>{uiMessage(key)}</li>)}
          </ul>
        </section>

        <section id={METHOD_ANCHORS.version} aria-labelledby={`${METHOD_ANCHORS.version}-title`} className="method-page__section" data-region="section">
          <Heading level="md" as="h2" id={`${METHOD_ANCHORS.version}-title`}>{uiMessage("pages.method.version.title")}</Heading>
          <p className="type-data-sm method-page__item-meta">
            {buildVersionText(bcp47)}
          </p>
        </section>
      </main>
    </div>
  );
}
