/* === PRE-FERMENT EDUCATIONAL CARD === */
/* Basato su Notion Appendice A · Pre-Fermenti: Guida Tecnica */
/* Si mostra in RecipeOutput quando nerdMode è attivo e has_pre_ferment */
/* i18n: all user-facing strings resolved via useCms().preFerment */

import { Lightbulb } from "lucide-react";
import { useMemo } from 'react';
import { motion } from 'motion/react';
import { motionSpring } from "../../components/ds/motion";
import { Disclosure, Surface } from "../../components/ds/index";
import { Clock, Droplets, Thermometer } from 'lucide-react';
import { useCms, type CmsPreFerment } from "../cms/cms-context";
import { Flask } from "../cooking/step-illustrations";
import { uiMessage } from "../../i18n/ui-messages";

/* === PRE-FERMENT IDS ===
 * Audit totale n. 10: i testi e i valori vivono solo nel CMS (7 lingue,
 * allineati a docs/ricerca/prefermenti-fonti-2026-10-24.md). Prima qui c'era
 * una seconda copia italiana con pH senza fonte e durate diverse. */
export const PRE_FERMENT_IDS = ["biga", "poolish", "autolisi"] as const;
export type PreFermentId = (typeof PRE_FERMENT_IDS)[number];

export function preFermentName(id: PreFermentId): string {
  return id === "biga"
    ? uiMessage("features.recipe.pre-ferment-guide.biga-4e43b430")
    : id === "poolish"
      ? uiMessage("features.recipe.pre-ferment-guide.poolish-40fc939a")
      : uiMessage("features.recipe.pre-ferment-guide.autolisi-c4e938cc");
}

// FW-01 (S14-A-03): alveolatura e complessità tolte, erano dati «da verificare» (D)
// mostrati come fatti; crosta e alveolatura dipendono da forno, idratazione e stesura.
const COMP_KEYS = ['hydration','yeast','duration','temperature','flavor','extensibility'] as const;

/** Righe del confronto nella lingua attiva. */
export function localizedComparisonRows(pf: CmsPreFerment) {
  return COMP_KEYS.map((key, i) => ({
    label: pf.compLabels[i] ?? key,
    biga: pf.compValues[key]?.biga ?? "",
    poolish: pf.compValues[key]?.poolish ?? "",
    autolisi: pf.compValues[key]?.autolisi ?? "",
  }));
}

/* === COMPONENT === */
interface PreFermentCardProps {
  preFermentType?: string;
  /** FW-03 (S14-A-10): false dove la tabella di confronto è già in pagina. */
  showComparison?: boolean;
  /** FW-03 (S14-A-11): livello dell'heading che avvolge il pulsante della card. */
  headingLevel?: 2 | 3 | 4;
}

export function PreFermentCard({ preFermentType = 'poolish', showComparison = true, headingLevel }: PreFermentCardProps) {
  const { cms } = useCms();
  const pf = cms.preFerment;
  const id: PreFermentId = (PRE_FERMENT_IDS as readonly string[]).includes(preFermentType)
    ? (preFermentType as PreFermentId)
    : "poolish";
  const info = {
    ...pf.items[id],
    name: preFermentName(id),
    yeast: pf.compValues.yeast?.[id] ?? "",
    duration: pf.compValues.duration?.[id] ?? "",
    temperature: pf.compValues.temperature?.[id] ?? "",
  };

  /* Build localized comparison rows */
  const compRows = useMemo(() => localizedComparisonRows(pf), [pf]);

  return (
    <Surface
      as={motion.div}
      variant="card"
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={motionSpring.standard}
      className="preferment-guide-card"
      data-slot="pre-ferment-card"
    >
      {/* FW-03: ds/Disclosure (aria-expanded, aria-controls, heading) al posto
          del motion.button senza stato; il nome non contiene più emoji. */}
      <Disclosure
        variant="inline"
        headingLevel={headingLevel}
        id={`pf-card-${id}`}
        className="preferment-guide-card__disclosure"
        triggerClassName="preferment-guide-card__header"
        summary={<>
          <span className="preferment-guide-card__icon">
            <Flask size={32} />
          </span>
          <span className="preferment-guide-card__title-block">
            <span className="preferment-guide-card__eyebrow-row">
              <span className="preferment-guide-card__eyebrow">
                {pf.sectionLabel}
              </span>
            </span>
            <span className="preferment-guide-card__name">
              <span className="preferment-guide-card__name-text">{info.name}</span>
              <span className="preferment-guide-card__origin"> — {info.origin}</span>
            </span>
          </span>
        </>}
      >
            <div className="preferment-guide-card__content">
              {/* Description */}
              <p className="preferment-guide-card__description">
                {info.description}
              </p>

              {/* Key parameters grid */}
              <div className="preferment-guide-card__params">
                <ParamBadge icon={<Droplets size={12} />} label={pf.paramHydration} value={info.hydration} />
                <ParamBadge icon={<Clock size={12} />} label={pf.paramDuration} value={info.duration} />
                <ParamBadge icon={<Thermometer size={12} />} label={pf.paramTemperature} value={info.temperature} />
                <ParamBadge icon={<Flask size={18} />} label={pf.paramYeast} value={info.yeast} />
              </div>

              {/* Result characteristics */}
              <div className="preferment-guide-card__details">
                <DetailLine label={pf.detailFermentation} value={info.fermentationType} />
                <DetailLine label={pf.detailFlavor} value={info.flavor} />
                <DetailLine label={pf.detailCrust} value={info.crustResult} />
                <DetailLine label={pf.detailExtensibility} value={info.extensibility} />
                <DetailLine label={pf.detailIdealStyles} value={info.idealStyles} />
              </div>

              {/* Tips */}
              <div className="preferment-guide-card__tips">
                <div className="preferment-guide-card__tips-label">
                  <Lightbulb size={14} aria-hidden="true" className="tip-icon" /> {pf.tipsLabel}
                </div>
                <ul className="preferment-guide-card__tips-list">
                  {info.tips.map((tip, i) => (
                    <li key={i} className="preferment-guide-card__tips-item">
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Confronto: solo dove la tabella non è già in pagina (S14-A-10) */}
              {showComparison && (
                <Disclosure
                  variant="inline"
                  className="preferment-guide-card__compare"
                  triggerClassName="preferment-guide-card__compare-toggle"
                  summary={pf.showComparison}
                >
                    <div className="preferment-guide-card__table-wrap">
                      <table className="preferment-guide-card__table">
                        <thead>
                          <tr>
                            <td className="preferment-guide-card__th" />
                            <th className="preferment-guide-card__th preferment-guide-card__th--biga">{uiMessage("features.recipe.pre-ferment-guide.biga-4e43b430")}</th>
                            <th className="preferment-guide-card__th preferment-guide-card__th--poolish">{uiMessage("features.recipe.pre-ferment-guide.poolish-40fc939a")}</th>
                            <th className="preferment-guide-card__th preferment-guide-card__th--autolisi">{uiMessage("features.recipe.pre-ferment-guide.autolisi-c4e938cc")}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {compRows.map((row, i) => (
                            <tr key={COMP_KEYS[i]}>
                              <td className="preferment-guide-card__td preferment-guide-card__td--label">
                                {row.label}
                              </td>
                              <td className="preferment-guide-card__td">
                                {row.biga}
                              </td>
                              <td className="preferment-guide-card__td">
                                {row.poolish}
                              </td>
                              <td className="preferment-guide-card__td">
                                {row.autolisi}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
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
function DetailLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="preferment-guide-detail">
      <span className="preferment-guide-detail__label">
        {label}
      </span>
      <span className="preferment-guide-detail__value">{value}</span>
    </div>
  );
}
