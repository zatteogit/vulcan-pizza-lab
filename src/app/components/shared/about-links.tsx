/* ═══ FW-15 — Informazioni: metodo, fonti, dati, versione ed edizione ═══
 * Un solo blocco per il dialog Informazioni (S01-A-01/B-01/A-05) e per il tab
 * App del Profilo (S17-A-03/B-17): righe-link verso «Metodo e fonti», la riga
 * sui dati che restano sul dispositivo, la versione. EditionStatement dice per
 * chi è l'edizione e che il motore non cambia con la marca (D-K): tutto da
 * campi dello schema dell'edizione, mai dall'id. */

import { ChevronRight, ExternalLink } from "lucide-react";
import { Link } from "react-router";
import { EDITION, partnerNeutrality, partnerRelationship, type Edition } from "../../config/edition";
import { BUILD_INFO } from "../../config/build-info";
import { OVEN_CATALOG_FILTERED, ovenCatalogBrands } from "../../data/oven-models";
import { latestSourceReading } from "../../data/method-sections";
import { METHOD_PATH, methodSectionHref } from "../../features/method/method-link";
import { formatCalendarDate, formatShortList } from "../../i18n/format";
import { uiMessage } from "../../i18n/ui-messages";

function relationshipText(edition: Edition): string | null {
  const name = edition.partner?.name ?? "";
  switch (partnerRelationship(edition)) {
    case "demo":
      return uiMessage("edition.relationship.demo", [name]);
    case "co-branded":
      return uiMessage("edition.relationship.co-branded", [name]);
    default:
      return null;
  }
}

/** Dichiarazione di neutralità dell'edizione (null senza partner). */
export function neutralityText(edition: Edition = EDITION): string | null {
  switch (partnerNeutrality(edition)) {
    case "same-engine":
      return uiMessage("edition.neutrality.same-engine");
    default:
      return null;
  }
}

/** Testo della versione: data e commit della build, o «in sviluppo». */
export function buildVersionText(locale: string): string {
  return BUILD_INFO.date
    ? uiMessage("about.version", [formatCalendarDate(BUILD_INFO.date, locale), BUILD_INFO.commit || "—"])
    : uiMessage("about.versionDev");
}

/** Per chi è l'edizione e regola di neutralità (solo edizioni con partner). */
export function EditionStatement({ headingLevel = 3 }: { headingLevel?: 2 | 3 }) {
  const partner = EDITION.partner;
  if (!partner) return null;
  const Title = headingLevel === 2 ? "h2" : "h3";
  return (
    <section className="about-edition" data-region="edition" aria-labelledby="about-edition-title">
      <Title id="about-edition-title" className="about-edition__title">
        {uiMessage("about.edition.title", [partner.name])}
      </Title>
      <p className="about-edition__text">{relationshipText(EDITION)}</p>
      <p className="about-edition__text">{neutralityText(EDITION)}</p>
      {OVEN_CATALOG_FILTERED && (
        <p className="about-edition__text">{uiMessage("edition.catalog", [formatShortList(ovenCatalogBrands())])}</p>
      )}
      {partner.url && (
        <a href={partner.url} target="_blank" rel="noopener noreferrer" className="about-links__inline">
          {uiMessage("about.edition.partnerLink", [partner.name])}
          <ExternalLink size={14} aria-hidden="true" />
        </a>
      )}
    </section>
  );
}

/** Righe-link a «Metodo e fonti», riscontro (se l'edizione ha un canale), dati e versione. */
export function AboutLinks({
  locale,
  onNavigate,
  about,
}: {
  locale: string;
  onNavigate?: () => void;
  /** Riga che apre il dialog Informazioni (dal Profilo). */
  about?: { label: string; onOpen: () => void };
}) {
  const readOn = latestSourceReading();
  return (
    <section className="about-links" data-region="about-links" aria-label={uiMessage("about.linksLabel")}>
      <ul className="about-links__list">
        {about && (
          <li>
            <button type="button" onClick={about.onOpen} aria-haspopup="dialog" className="about-links__row">
              <span data-region="row-text">
                <strong className="about-links__label">{about.label}</strong>
              </span>
              <ChevronRight size={16} aria-hidden="true" className="about-links__chevron" />
            </button>
          </li>
        )}
        <li>
          <Link to={METHOD_PATH} onClick={onNavigate} className="about-links__row">
            <span data-region="row-text">
              <strong className="about-links__label">{uiMessage("about.method")}</strong>
              <small className="about-links__hint">{uiMessage("about.methodHint")}</small>
            </span>
            <ChevronRight size={16} aria-hidden="true" className="about-links__chevron" />
          </Link>
        </li>
        <li>
          <Link to={methodSectionHref("sources")} onClick={onNavigate} className="about-links__row">
            <span data-region="row-text">
              <strong className="about-links__label">{uiMessage("about.sources")}</strong>
              <small className="about-links__hint">
                {readOn ? uiMessage("about.sourcesHint", [formatCalendarDate(readOn, locale)]) : uiMessage("about.sourcesHintUndated")}
              </small>
            </span>
            <ChevronRight size={16} aria-hidden="true" className="about-links__chevron" />
          </Link>
        </li>
        {EDITION.feedbackUrl && (
          <li>
            <a href={EDITION.feedbackUrl} target="_blank" rel="noopener noreferrer" className="about-links__row">
              <span data-region="row-text">
                <strong className="about-links__label">{uiMessage("about.feedback")}</strong>
              </span>
              <ExternalLink size={16} aria-hidden="true" className="about-links__chevron" />
            </a>
          </li>
        )}
      </ul>
      <p className="type-data-sm about-links__note">{uiMessage("about.privacy")}</p>
      <p className="type-data-sm about-links__note">{buildVersionText(locale)}</p>
    </section>
  );
}
