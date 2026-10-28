/* === PRE-FERMENT EDUCATIONAL CARD === */
/* Basato su Notion Appendice A · Pre-Fermenti: Guida Tecnica */
/* Si mostra in RecipeOutput quando nerdMode è attivo e has_pre_ferment */
/* i18n: all user-facing strings resolved via useCms().preFerment */

import { Lightbulb } from "lucide-react";
import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { motionSpring } from "../../components/ds/motion";
import { Surface } from "../../components/ds/index";
import { ChevronDown, ChevronUp, Clock, Droplets, Thermometer } from 'lucide-react';
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

const COMP_KEYS = ['hydration','yeast','duration','temperature','flavor','extensibility','alveolatura','complexity'] as const;

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
  /** FW-12: livello del titolo della card (h2 nella pagina Prefermenti, h3 dentro una sezione). */
  headingLevel?: 2 | 3;
}

export function PreFermentCard({ preFermentType = 'poolish', headingLevel = 3 }: PreFermentCardProps) {
  const CardHeading = headingLevel === 2 ? "h2" : "h3";
  const [expanded, setExpanded] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
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
      {/* Header — always visible. FW-12 (S14-B-11): il nome è un titolo
          (pattern accordion APG) e dentro il bottone solo contenuto frasale. */}
      <CardHeading className="preferment-guide-card__heading">
      <motion.button
        type="button"
        aria-expanded={expanded}
        onClick={() => setExpanded(!expanded)}
        className="preferment-guide-card__header"
      >
        <span className="preferment-guide-card__icon" aria-hidden="true">
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
        <span className="preferment-guide-card__chevron" aria-hidden="true">
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </span>
      </motion.button>
      </CardHeading>

      {/* Expanded content */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={motionSpring.standard}
            className="preferment-guide-card__body"
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

              {/* Comparison toggle */}
              <motion.button
                onClick={() => setShowComparison(!showComparison)}
                className="preferment-guide-card__compare-toggle"
              >
                {showComparison ? pf.hideComparison : pf.showComparison}
              </motion.button>

              <AnimatePresence>
                {showComparison && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={motionSpring.standard}
                    className="preferment-guide-card__compare-panel"
                  >
                    <div className="preferment-guide-card__table-wrap">
                      <table className="preferment-guide-card__table">
                        <thead>
                          <tr>
                            <th className="preferment-guide-card__th"> </th>
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
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
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
