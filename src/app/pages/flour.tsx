/* ═══ G1a-WP-01 — Scheda farina (S04-A-01, S04-B-02) ═══
 * Prima ogni risultato «Farine» della ricerca portava a /profile, dove la
 * farina cercata non compariva. Qui la farina ha la sua pagina:
 * - L1 sempre visibile: nome, produttore e una frase composta dai dati
 *   («Adatta a: <stili> · lievitazioni <ore>»);
 * - L2 nella Disclosure «Dati tecnici»: nota editoriale (CMS) e W, P/L,
 *   proteine, assorbimento, falling number e stabilità, ognuno col suo
 *   statuto (EvidenceBadge) e «Da verificare» se nessuna scheda lo conferma;
 *   i valori che la scheda contraddice non si mostrano (D-G1a-01);
 * - L3 nel «Perché?» della W: la nota del registro e le fonti di questa
 *   farina, con il rimando a Metodo e fonti.
 * I dati e il loro statuto vengono da use-cases/flour-sheet.ts. */

import { Fragment, useEffect, useMemo } from "react";
import { Link, useParams } from "react-router";
import { Badge, Disclosure, EvidenceBadge, Heading } from "../components/ds/index";
import { NotFoundState } from "../components/shared/not-found-state";
import { SubPageHeader } from "../components/shared/sub-page-header";
import { BRAND } from "../config/brand";
import { getScienceSource } from "../data/science-sources";
import { STYLES_DB } from "../domain/pizza-engine";
import { useCms } from "../features/cms/cms-context";
import { TermLink } from "../features/glossary/term-link";
import { methodSourceHref } from "../features/method/method-link";
import { evidenceLabel } from "../features/science/science-sheet";
import { sourceLabel } from "../features/science/source-label";
import { WhyButton } from "../features/science/why-button";
import { formatNumber, formatPercent, formatRange, formatUnit } from "../i18n/format";
import { uiMessage } from "../i18n/ui-messages";
import { buildFlourSheet, type FlourField, type FlourFieldId } from "../use-cases/flour-sheet";

/** Voce di glossario di ogni sigla (le proteine non ne hanno una). */
const FIELD_TERM: Partial<Record<FlourFieldId, string>> = {
  w: "w_alveograph",
  pl: "pl_ratio",
  assorbimento_pct: "absorption",
  falling_number: "falling_number",
  stabilita_min: "stability",
};

function formatField(field: FlourField, locale: string): string {
  switch (field.unit) {
    case "ratio":
      return formatNumber(field.value, locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    case "percent":
      return formatPercent(field.value, locale);
    case "seconds":
      return formatUnit(field.value, "second", locale);
    case "minutes":
      return formatUnit(field.value, "minute", locale);
    default:
      return formatNumber(field.value, locale);
  }
}

function sourceStatusLabel(status: string): string {
  switch (status) {
    case "verified":
      return uiMessage("pages.method.status.verified");
    case "plausible":
      return uiMessage("pages.method.status.plausible");
    default:
      return uiMessage("pages.method.status.unverified");
  }
}

export function FlourPage() {
  const { flourId = "" } = useParams();
  const { cms, bcp47 } = useCms();
  const sheet = useMemo(() => buildFlourSheet(flourId), [flourId]);

  useEffect(() => {
    if (sheet) document.title = `${sheet.name} · ${BRAND.name}`;
  }, [sheet]);

  if (!sheet) {
    return (
      <NotFoundState
        title={uiMessage("ui.flour.notFoundTitle")}
        subtitle={uiMessage("ui.flour.notFoundDesc", [flourId])}
        backTo="/learn"
        backLabel={cms.pages.navLearn}
        searchLabel={cms.pages.navSearch}
      />
    );
  }

  const producer = sheet.generic ? uiMessage("features.search.flourGenericProducer") : sheet.producer;
  const [minH, maxH] = sheet.fermentationHours;
  const fermentation = uiMessage("ui.flour.fermentation", [formatRange(minH, maxH, bcp47, { unit: "hour" })]);
  const note = cms.flours?.[sheet.id]?.note;
  const wField = sheet.fields.find((field) => field.id === "w");

  const sources = (
    <>
      {sheet.sourceIds.length > 0 ? (
        <ul className="method-note__list">
          {sheet.sourceIds.map((id) => {
            const source = getScienceSource(id);
            if (!source) return null;
            return (
              <li key={id} className="method-note__source">
                <Link to={methodSourceHref(id)} className="method-page__link">
                  {sourceLabel(source, cms.science.sourceNotes)}
                </Link>
                {source.year && (
                  <>
                    {uiMessage("format.listSeparator")}
                    {source.year}
                  </>
                )}
                <Badge tone={source.status === "verified" ? "success" : "warning"} size="xs">{sourceStatusLabel(source.status)}</Badge>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="science-sheet__text">{uiMessage("ui.flour.noSource")}</p>
      )}
    </>
  );

  return (
    <div className="method-page">
      <SubPageHeader backTo="/learn" backLabel={cms.pages.navLearn} />

      <main id="main-content" className="method-page__shell" data-region="page">
        <header data-region="page-header" className="method-page__header">
          <p className="type-step-num">{uiMessage("ui.flour.sheet")}</p>
          <Heading level="page">{sheet.name}</Heading>
          <p className="method-page__lead">{uiMessage("ui.flour.producer", [producer])}</p>
          {sheet.compatibleStyleIds.length > 0 && (
            <p className="method-note__l1">
              {uiMessage("ui.flour.suitableFor")}{" "}
              {sheet.compatibleStyleIds.map((id, index) => (
                <Fragment key={id}>
                  {index > 0 && uiMessage("format.listSeparator")}
                  <Link to={`/recipe/${id}?mode=canonical`} className="method-page__link">{STYLES_DB[id].name}</Link>
                </Fragment>
              ))}
            </p>
          )}
          <p className="method-note__l1">{fermentation}</p>
        </header>

        <Disclosure variant="card" headingLevel={2} summary={uiMessage("ui.flour.technicalData")}>
          {note && <p className="method-note__l1">{note}</p>}
          <dl className="method-note__facts">
            {sheet.fields.map((field) => {
              const termId = FIELD_TERM[field.id];
              const notDeclared = field.sourceStatus === "wrong" && !sheet.wDeclared && (field.id === "w" || field.id === "pl");
              return (
                <Fragment key={field.id}>
                  <dt>{termId ? <TermLink termId={termId} /> : uiMessage("ui.flour.protein")}</dt>
                  <dd className="method-page__item-meta">
                    {field.sourceStatus === "wrong" ? (
                      notDeclared ? uiMessage("ui.flour.notMeasurable") : <Badge tone="warning" size="xs">{sourceStatusLabel("unverified")}</Badge>
                    ) : (
                      <>
                        <strong data-region="value">{formatField(field, bcp47)}</strong>
                        <EvidenceBadge kind={field.evidence} label={evidenceLabel(field.evidence)} size="sm" />
                        {field.sourceStatus !== "verified" && (
                          <Badge tone="warning" size="xs">{sourceStatusLabel(field.sourceStatus)}</Badge>
                        )}
                      </>
                    )}
                    {field.id === "w" && (
                      <WhyButton
                        noteId="flour-w-by-grade"
                        context={{ w: wField?.value ?? 0, wDeclared: sheet.wDeclared ? 1 : 0 }}
                        childrenTitle={uiMessage("ui.flour.sources")}
                      >
                        {sources}
                      </WhyButton>
                    )}
                  </dd>
                </Fragment>
              );
            })}
          </dl>
        </Disclosure>
      </main>
    </div>
  );
}
