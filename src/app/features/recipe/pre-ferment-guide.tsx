/* === PRE-FERMENT EDUCATIONAL CARD === */
/* Basato su Notion Appendice A · Pre-Fermenti: Guida Tecnica */
/* Si mostra in RecipeOutput quando nerdMode è attivo e has_pre_ferment */
/* i18n: all user-facing strings resolved via useCms().preFerment */

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Surface } from "../../components/ds/index";
import { ChevronDown, ChevronUp, Clock, Droplets, Thermometer } from 'lucide-react';
import { useCms } from "../cms/cms-context";
import { Flask } from "../cooking/step-illustrations";

/* === PRE-FERMENT DATA (Italian fallback) === */
interface PreFermentInfo {
  id: string;
  name: string;
  origin: string;
  emoji: string;
  description: string;
  hydration: string;
  yeastPct: string;
  duration: string;
  temperature: string;
  consistency: string;
  phFinal: string;
  fermentationType: string;
  flavor: string;
  crustResult: string;
  extensibility: string;
  idealStyles: string;
  tips: string[];
}

export const PRE_FERMENT_DB: Record<string, PreFermentInfo> = {
  poolish: {
    id: 'poolish',
    name: 'Poolish',
    origin: 'Francese',
    emoji: '💧',
    description: 'Pre-fermento liquido (1:1 farina:acqua) con fermentazione prevalentemente alcolica. Sviluppa zuccheri per Maillard intensa.',
    hydration: '100% (rapporto 1:1)',
    yeastPct: '0.1-0.5%',
    duration: '8-16h',
    temperature: '20-22°C',
    consistency: 'Liquida, schiumosa',
    phFinal: '4.5-4.8',
    fermentationType: 'Prevalente alcolica (CO₂ + etanolo)',
    flavor: 'Dolce, maltato, note complesse',
    crustResult: 'Leggera, dorata intensa, leopard spotting marcato',
    extensibility: 'Alta — stesura facile',
    idealStyles: 'Teglia Romana, NY Style, Napoletana contemporanea, Focacce',
    tips: [
      'Punto ottimale: superficie a cupola con bolle, poi inizia a ritirarsi',
      'Oltre 16h il sapore diventa troppo acido/alcolico',
      'Se collassa e ancora usabile ma riduci la percentuale sul totale',
      'Percentuale poolish su impasto finale: 20-40% della farina totale',
    ],
  },
  biga: {
    id: 'biga',
    name: 'Biga',
    origin: 'Italiano',
    emoji: '🍞',
    description: 'Pre-fermento asciutto (44-48% idratazione) con fermentazione lattica + alcolica. Massima conservazione e complessita aromatica.',
    hydration: '44-48%',
    yeastPct: '0.5-1%',
    duration: '16-48h',
    temperature: '16-18°C (o 4°C per 48h)',
    consistency: 'Asciutta, compatta',
    phFinal: '5.0-5.3',
    fermentationType: 'Lattica + alcolica (LAB attivi)',
    flavor: 'Acidulo, complesso, note fermentate',
    crustResult: 'Croccante, friabile, alveolatura fine',
    extensibility: 'Bassa — richiede riposo dopo staglio',
    idealStyles: 'Napoletana classica, Pinsa, Pizza al taglio, Pane',
    tips: [
      'Se troppo asciutta: aggiungi 5-10% acqua per facilitare incorporazione',
      'Matura quando la superficie e screpolata "a cupola" e il volume e triplicato',
      'Conservabile fino a 48h in frigo (rinfresca con 10% acqua prima dell\'uso)',
      'Percentuale biga su impasto finale: 20-50% della farina totale',
    ],
  },
  autolisi: {
    id: 'autolisi',
    name: 'Autolisi',
    origin: 'Universale',
    emoji: '💦',
    description: 'Riposo enzimatico di sola farina+acqua (senza lievito ne sale). Sviluppa glutine spontaneamente e attiva proteasi/amilasi.',
    hydration: '55-75% (tutta l\'acqua della ricetta)',
    yeastPct: '0% (nessuno)',
    duration: '20min - 2h',
    temperature: 'Ambiente',
    consistency: 'Pastosa',
    phFinal: '~6.5 (neutro)',
    fermentationType: 'Nessuna (solo attività enzimatica)',
    flavor: 'Neutro — non altera il sapore',
    crustResult: 'Variabile — dipende dal processo successivo',
    extensibility: 'Alta — impasto setoso e meno appiccicoso',
    idealStyles: 'Tutti gli stili (tecnica universale)',
    tips: [
      'Farine integrali: autolisi più lunga (60-90min) per ammorbidire la crusca',
      'Acqua tiepida (30-35°C) accelera gli enzimi',
      'SEMPRE prima di aggiungere sale (il sale inibisce gli enzimi)',
      'Riduce il tempo di impasto del 30% perché il glutine si sviluppa da solo',
      'Combinabile con Biga o Poolish per risultati superiori',
    ],
  },
};

/* === COMPARISON TABLE DATA (Italian fallback) === */
const COMP_KEYS = ['hydration','yeast','duration','temperature','ph','flavor','extensibility','alveolatura','complexity'] as const;

export const COMPARISON_ROWS = [
  { label: 'Idratazione', biga: '44-48%', poolish: '100%', autolisi: '55-75%' },
  { label: 'Lievito', biga: '0.5-1%', poolish: '0.1-0.5%', autolisi: '0%' },
  { label: 'Durata', biga: '16-48h', poolish: '8-16h', autolisi: '0.5-2h' },
  { label: 'Temperatura', biga: '16-18°C', poolish: '20-22°C', autolisi: 'Ambiente' },
  { label: 'pH finale', biga: '5.0-5.3', poolish: '4.5-4.8', autolisi: '~6.5' },
  { label: 'Sapore', biga: 'Acidulo', poolish: 'Dolce/maltato', autolisi: 'Neutro' },
  { label: 'Estensibilita', biga: 'Bassa', poolish: 'Alta', autolisi: 'Alta' },
  { label: 'Alveolatura', biga: 'Fine', poolish: 'Grande', autolisi: 'Grande' },
  { label: 'Complessita', biga: 'Media', poolish: 'Bassa', autolisi: 'Molto bassa' },
];

/* === COMPONENT === */
interface PreFermentCardProps {
  preFermentType?: string;
}

export function PreFermentCard({ preFermentType = 'poolish' }: PreFermentCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  const { cms } = useCms();
  const pf = cms.preFerment;
  const rawInfo = PRE_FERMENT_DB[preFermentType] ?? PRE_FERMENT_DB.poolish;
  const cmsItem = pf.items?.[preFermentType] ?? pf.items?.poolish;

  /* Merge CMS i18n over hardcoded Italian fallback */
  const info = useMemo(() => {
    if (!cmsItem) return rawInfo;
    return {
      ...rawInfo,
      origin: cmsItem.origin ?? rawInfo.origin,
      description: cmsItem.description ?? rawInfo.description,
      hydration: cmsItem.hydration ?? rawInfo.hydration,
      consistency: cmsItem.consistency ?? rawInfo.consistency,
      fermentationType: cmsItem.fermentationType ?? rawInfo.fermentationType,
      flavor: cmsItem.flavor ?? rawInfo.flavor,
      crustResult: cmsItem.crustResult ?? rawInfo.crustResult,
      extensibility: cmsItem.extensibility ?? rawInfo.extensibility,
      idealStyles: cmsItem.idealStyles ?? rawInfo.idealStyles,
      tips: cmsItem.tips?.length ? cmsItem.tips : rawInfo.tips,
    };
  }, [rawInfo, cmsItem]);

  /* Build localized comparison rows */
  const compRows = useMemo(() => {
    const labels = pf.compLabels ?? COMPARISON_ROWS.map(r => r.label);
    const vals = pf.compValues;
    return COMP_KEYS.map((key, i) => {
      const fallback = COMPARISON_ROWS[i];
      const v = vals?.[key];
      return {
        label: labels[i] ?? fallback.label,
        biga: v?.biga ?? fallback.biga,
        poolish: v?.poolish ?? fallback.poolish,
        autolisi: v?.autolisi ?? fallback.autolisi,
      };
    });
  }, [pf.compLabels, pf.compValues]);

  return (
    <Surface
      as={motion.div}
      variant="card"
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      className="preferment-guide-card"
      data-slot="pre-ferment-card"
    >
      {/* Header — always visible */}
      <motion.button
        onClick={() => setExpanded(!expanded)}
        className="preferment-guide-card__header"
      >
        <span className="preferment-guide-card__icon">
          <Flask size={32} />
        </span>
        <div className="preferment-guide-card__title-block">
          <div className="preferment-guide-card__eyebrow-row">
            <span className="preferment-guide-card__eyebrow">
              {pf.sectionLabel.toUpperCase()}
            </span>
          </div>
          <div className="preferment-guide-card__name">
            {info.emoji} <span className="preferment-guide-card__name-text">{info.name}</span>
            <span className="preferment-guide-card__origin"> — {info.origin}</span>
          </div>
        </div>
        <div className="preferment-guide-card__chevron">
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </motion.button>

      {/* Expanded content */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
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
                <ParamBadge icon={<Flask size={18} />} label={pf.paramPh} value={info.phFinal} />
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
                  {`💡 ${pf.tipsLabel.toUpperCase()}`}
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
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    className="preferment-guide-card__compare-panel"
                  >
                    <div className="preferment-guide-card__table-wrap">
                      <table className="preferment-guide-card__table">
                        <thead>
                          <tr>
                            <th className="preferment-guide-card__th"> </th>
                            <th className="preferment-guide-card__th preferment-guide-card__th--biga">🍞 Biga</th>
                            <th className="preferment-guide-card__th preferment-guide-card__th--poolish">💧 Poolish</th>
                            <th className="preferment-guide-card__th preferment-guide-card__th--autolisi">💦 Autolisi</th>
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
