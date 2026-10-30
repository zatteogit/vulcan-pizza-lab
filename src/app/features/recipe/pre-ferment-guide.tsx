/* === PRE-FERMENT EDUCATIONAL CARD === */
/* Basato su Notion Appendice A · Pre-Fermenti: Guida Tecnica */
/* Si mostra in RecipeOutput quando nerdMode è attivo e has_pre_ferment */
/* i18n: all user-facing strings resolved via useCms().preFerment */

import { Lightbulb } from "lucide-react";
import { Disclosure, Surface } from "../../components/ds/index";
import { Clock, Droplets, Thermometer } from 'lucide-react';
import { Link } from "react-router";
import { useCms, type CmsPreFerment } from "../cms/cms-context";
import { createFormatter } from "../cms/i18n";
import { Flask } from "../cooking/step-illustrations";
import { uiMessage } from "../../i18n/ui-messages";
import { interpolate } from "../../i18n/interpolate";
import { formatList, formatPercent } from "../../i18n/format";
import { withBrand } from "../../config/brand";
import { glossaryFactValues } from "../../data/glossary-data";
import { preFermentExample, stylesDeclaringPreFerment } from "../../domain/science/engine-facts";
import { STYLES_DB } from "../../domain/styles-db";
import { GlossaryTermLinks } from "../glossary/term-link";
import { WhyButton } from "../science/why-button";

/* FW-04 (S14-B-15): le parole tecniche della scheda portano al glossario. */
const PRE_FERMENT_TERMS: Record<PreFermentId, readonly string[]> = {
  biga: ["pre_ferment", "biga", "l_extensibility", "dough_division"],
  poolish: ["pre_ferment", "poolish", "l_extensibility"],
  autolisi: ["autolysis", "l_extensibility"],
};

/* === PRE-FERMENT IDS ===
 * Audit totale n. 10: i testi e i valori vivono solo nel CMS (7 lingue,
 * allineati a docs/ricerca/prefermenti-fonti-2026-10-24.md). Prima qui c'era
 * una seconda copia italiana con pH senza fonte e durate diverse. */
export const PRE_FERMENT_IDS = ["biga", "poolish", "autolisi"] as const;
export type PreFermentId = (typeof PRE_FERMENT_IDS)[number];

export function preFermentName(id: PreFermentId): string {
  return id === "biga"
    ? uiMessage("features.recipe.pre-ferment-guide.4e43b430")
    : id === "poolish"
      ? uiMessage("features.recipe.pre-ferment-guide.40fc939a")
      : uiMessage("features.recipe.pre-ferment-guide.c4e938cc");
}

// FW-01 (S14-A-03): alveolatura e complessità tolte, erano dati «da verificare» (D)
// mostrati come fatti; crosta e alveolatura dipendono da forno, idratazione e stesura.
const COMP_KEYS = ['hydration','yeast','duration','temperature','flavor','extensibility'] as const;

/** FW-05: i numeri del motore nei testi della guida (idratazione della biga,
 *  quota di farina) arrivano come segnaposto da engine-facts. */
export function fillPreFermentText(text: string, locale: string): string {
  return withBrand(interpolate(text, glossaryFactValues(locale)));
}

/** G4b-WP-02: una sola tabella di confronto per la guida e per la ricetta
 *  (prima due copie, con stili diversi). */
export function PreFermentComparisonTable({ pf, locale }: { pf: CmsPreFerment; locale: string }) {
  return (
    <div className="preferment-table">
      <div className="preferment-table__scroll">
        <table className="preferment-table__grid">
          <thead>
            <tr>
              {/* Angolo vuoto: td, non un th senza nome (audit n. 30). */}
              <td className="preferment-table__th" />
              {PRE_FERMENT_IDS.map((id) => (
                <th key={id} className={`preferment-table__th preferment-table__th--${id}`}>{preFermentName(id)}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {COMP_KEYS.map((key, i) => (
              <tr key={key}>
                <td className="preferment-table__td preferment-table__rowlabel">{pf.compLabels[i]}</td>
                {PRE_FERMENT_IDS.map((id) => (
                  <td key={id} className="preferment-table__td">{fillPreFermentText(pf.compValues[key][id], locale)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/** FW-05 (S14-A-01/B-13): gli stili «ideali» sono quelli che nel motore
 *  dichiarano il prefermento (process_type), con il link alla ricetta. */
export function preFermentStyleLinks(kind: "biga" | "poolish") {
  return stylesDeclaringPreFerment(kind).map((id) => ({
    id,
    name: STYLES_DB[id]?.name ?? id,
    href: `/recipe/${id}?mode=adapted&pf=1&pft=${kind}`,
  }));
}

export function PreFermentStyleList({ kind, locale }: { kind: "biga" | "poolish"; locale: string }) {
  const links = preFermentStyleLinks(kind);
  /* L'elenco formattato nella lingua attiva, con ogni nome sostituito dal link. */
  const parts = formatList(links.map((link) => `\u0000${link.id}\u0000`), locale).split("\u0000");
  return (
    <>
      {parts.map((part, i) => {
        const link = i % 2 === 1 ? links.find((l) => l.id === part) : undefined;
        return link
          ? <Link key={link.id} to={link.href} className="preferment-style-link">{link.name}</Link>
          : part;
      })}
    </>
  );
}

/* === COMPONENT === */
interface PreFermentCardProps {
  preFermentType?: string;
  /** FW-03 (S14-A-10): false dove la tabella di confronto è già in pagina. */
  showComparison?: boolean;
  /** FW-03 (S14-A-11): livello dell'heading che avvolge il pulsante della card. */
  headingLevel?: 2 | 3 | 4;
  /** FW-05 (S14-A-02): dosi del prefermento della ricetta aperta. */
  recipeContext?: { flourG: number; yeastG: number };
  /** FW-04 (S14-B-16): aperta dal deep link (#pf-poolish). */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** G4b-WP-02 (S14-B-07): esempio su 1 kg di farina, solo nella guida
   *  (in una ricetta le dosi vere sono negli ingredienti). */
  showExample?: boolean;
}

export function PreFermentCard({ preFermentType = 'poolish', showComparison = true, headingLevel, recipeContext, open, onOpenChange, showExample }: PreFermentCardProps) {
  const { cms, bcp47 } = useCms();
  const pf = cms.preFerment;
  const id: PreFermentId = (PRE_FERMENT_IDS as readonly string[]).includes(preFermentType)
    ? (preFermentType as PreFermentId)
    : "poolish";
  const fill = (text: string) => fillPreFermentText(text, bcp47);
  const item = pf.items[id];
  const name = preFermentName(id);
  const yeast = fill(pf.compValues.yeast[id]);
  const isTechnique = id === "autolisi";
  const fmt = createFormatter(cms.ui, bcp47);
  const contextLine = recipeContext && recipeContext.flourG > 0 && id !== "autolisi"
    ? interpolate(pf.recipeContextLine, {
        yeast: fmt.grams(recipeContext.yeastG),
        flour: fmt.grams(recipeContext.flourG),
        pct: formatPercent((recipeContext.yeastG / recipeContext.flourG) * 100, bcp47, { maximumFractionDigits: 2 }),
      })
    : null;

  /* G4b-WP-02: farina e acqua dell'esempio dallo stesso scorporo delle ricette;
     il lievito resta la stima della guida, con il «Perché?». */
  const ex = showExample && !isTechnique ? preFermentExample(id) : null;
  const StepsHeading = `h${(headingLevel ?? 3) + 1}` as "h3" | "h4" | "h5";

  return (
    /* G4b-WP-02: niente animazione d'ingresso propria; nella guida la card
       entra già col suo contenitore (prima si animava due volte). */
    <Surface
      variant="card"
      className="preferment-guide-card"
      data-slot="pre-ferment-card"
    >
      {/* FW-03: ds/Disclosure (aria-expanded, aria-controls, heading) al posto
          del motion.button senza stato; il nome non contiene più emoji. */}
      <Disclosure
        variant="inline"
        headingLevel={headingLevel}
        id={`pf-card-${id}`}
        open={open}
        onOpenChange={onOpenChange}
        className="preferment-guide-card__disclosure"
        triggerClassName="preferment-guide-card__header"
        summary={<>
          <span className="preferment-guide-card__icon">
            {/* FW-05 (S14-A-05/B-06): l'autolisi non è un prefermento. */}
            {isTechnique ? <Droplets size={32} aria-hidden="true" /> : <Flask size={32} />}
          </span>
          <span className="preferment-guide-card__title-block">
            <span className="preferment-guide-card__eyebrow-row">
              <span className="preferment-guide-card__eyebrow">
                {isTechnique ? pf.techniqueLabel : pf.sectionLabel}
              </span>
            </span>
            <span className="preferment-guide-card__name">
              <span className="preferment-guide-card__name-text">{name}</span>
              <span className="preferment-guide-card__origin"> — {item.origin}</span>
            </span>
          </span>
        </>}
      >
            <div className="preferment-guide-card__content">
              {/* Description */}
              <p className="preferment-guide-card__description">
                {fill(item.description)}
              </p>
              {contextLine && (
                <p className="preferment-guide-card__context" data-region="note">
                  {contextLine}
                </p>
              )}

              {/* G4b-WP-02 (S14-B-07): come si prepara e quando entra nell'impasto. */}
              <section className="preferment-guide-card__how">
                <StepsHeading className="preferment-guide-card__tips-label">{pf.stepsLabel}</StepsHeading>
                <ol className="preferment-guide-card__tips-list preferment-guide-card__steps">
                  {item.steps.map((step, i) => (
                    <li key={i} className="preferment-guide-card__tips-item">{fill(step)}</li>
                  ))}
                </ol>
                <WhyButton noteId="pre-ferment-procedure" />
                {ex && (
                  <>
                    <p className="preferment-guide-card__context">
                      {interpolate(pf.exampleLabel, { flour: fmt.grams(ex.flourG), hydration: formatPercent(ex.doughHydrationPct, bcp47) })}
                    </p>
                    <ul className="preferment-guide-card__tips-list">
                      <li className="preferment-guide-card__tips-item">
                        {interpolate(pf.examplePreFerment, { name, flour: fmt.grams(ex.prefermentFlourG), water: fmt.grams(ex.prefermentWaterG), yeast })}{" "}
                        <WhyButton noteId="pre-ferment" />
                      </li>
                      <li className="preferment-guide-card__tips-item">
                        {interpolate(pf.exampleFinal, { flour: fmt.grams(ex.mainFlourG), water: fmt.grams(ex.mainWaterG) })}
                      </li>
                    </ul>
                  </>
                )}
              </section>

              {/* Key parameters grid */}
              <div className="preferment-guide-card__params">
                <ParamBadge icon={<Droplets size={12} />} label={pf.paramHydration} value={fill(item.hydration)} />
                <ParamBadge icon={<Clock size={12} />} label={pf.paramDuration} value={fill(pf.compValues.duration[id])} />
                <ParamBadge icon={<Thermometer size={12} />} label={pf.paramTemperature} value={fill(pf.compValues.temperature[id])} />
                <ParamBadge icon={<Flask size={18} />} label={pf.paramYeast} value={yeast} />
              </div>

              {/* Result characteristics */}
              <div className="preferment-guide-card__details">
                <DetailLine label={pf.detailFermentation} value={fill(item.fermentationType)} />
                <DetailLine label={pf.detailFlavor} value={item.flavor} />
                <DetailLine label={pf.detailCrust} value={item.crustResult} />
                <DetailLine label={pf.detailExtensibility} value={item.extensibility} />
                <DetailLine
                  label={pf.detailIdealStyles}
                  value={isTechnique ? (item.idealStyles ?? "") : <PreFermentStyleList kind={id as "biga" | "poolish"} locale={bcp47} />}
                />
              </div>

              {/* Tips */}
              <div className="preferment-guide-card__tips">
                <div className="preferment-guide-card__tips-label">
                  <Lightbulb size={14} aria-hidden="true" className="tip-icon" /> {pf.tipsLabel}
                </div>
                <ul className="preferment-guide-card__tips-list">
                  {item.tips.map((tip, i) => (
                    <li key={i} className="preferment-guide-card__tips-item">
                      {fill(tip)}
                    </li>
                  ))}
                </ul>
              </div>

              <GlossaryTermLinks termIds={PRE_FERMENT_TERMS[id]} />

              {/* Confronto: solo dove la tabella non è già in pagina (S14-A-10) */}
              {showComparison && (
                <Disclosure
                  variant="inline"
                  className="preferment-guide-card__compare"
                  triggerClassName="preferment-guide-card__compare-toggle"
                  summary={pf.showComparison}
                >
                  <PreFermentComparisonTable pf={pf} locale={bcp47} />
                </Disclosure>
              )}
            </div>
      </Disclosure>
    </Surface>
  );
}

/* === PARAM BADGE === */
function ParamBadge({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="preferment-guide-param">
      <span className="preferment-guide-param__icon">{icon}</span>
      <div data-region="stack">
        <div className="preferment-guide-param__label">
          {label}
        </div>
        <div className="preferment-guide-param__value">
          {value}
        </div>
      </div>
    </div>
  );
}

/* === DETAIL LINE === */
function DetailLine({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="preferment-guide-detail">
      <span className="preferment-guide-detail__label">
        {label}
      </span>
      <span className="preferment-guide-detail__value">{value}</span>
    </div>
  );
}
