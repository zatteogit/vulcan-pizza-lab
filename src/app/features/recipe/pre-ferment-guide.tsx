/* === PRE-FERMENT EDUCATIONAL CARD === */
/* Basato su Notion Appendice A · Pre-Fermenti: Guida Tecnica */
/* Si mostra in RecipeOutput quando nerdMode è attivo e has_pre_ferment */
/* i18n: all user-facing strings resolved via useCms().preFerment */

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { motionSpring } from "../../components/ds/motion";
import { Surface } from "../../components/ds/index";
import { ChevronDown, ChevronUp, Clock, Droplets, Thermometer } from 'lucide-react';
import { useCms } from "../cms/cms-context";
import { Flask } from "../cooking/step-illustrations";
import { uiMessage } from "../../i18n/ui-messages";

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
    name: uiMessage("features.recipe.pre-ferment-guide.poolish-e474d66e"),
    origin: uiMessage("features.recipe.pre-ferment-guide.francese-82f7efde"),
    emoji: '💧',
    description: uiMessage("features.recipe.pre-ferment-guide.pre-fermento-liquido-1-1-farina-acqua-con--3f33fa78"),
    hydration: '100% (rapporto 1:1)',
    yeastPct: '0.1-0.5%',
    duration: '8-16h',
    temperature: '20-22°C',
    consistency: uiMessage("features.recipe.pre-ferment-guide.liquida-schiumosa-4761d70d"),
    phFinal: '4.5-4.8',
    fermentationType: uiMessage("features.recipe.pre-ferment-guide.prevalente-alcolica-co2-etanolo-e4e14567"),
    flavor: uiMessage("features.recipe.pre-ferment-guide.dolce-maltato-note-complesse-af6a5e90"),
    crustResult: uiMessage("features.recipe.pre-ferment-guide.leggera-dorata-intensa-leopard-spotting-ma-60374676"),
    extensibility: uiMessage("features.recipe.pre-ferment-guide.alta-stesura-facile-9a7a4a2e"),
    idealStyles: uiMessage("features.recipe.pre-ferment-guide.teglia-romana-ny-style-napoletana-contempo-c1592262"),
    tips: [
      uiMessage("features.recipe.pre-ferment-guide.punto-ottimale-superficie-a-cupola-con-bol-6f1f3a1b"),
      uiMessage("features.recipe.pre-ferment-guide.oltre-16h-il-sapore-diventa-troppo-acido-a-0c29de16"),
      uiMessage("features.recipe.pre-ferment-guide.se-collassa-e-ancora-usabile-ma-riduci-la--9a59e0fa"),
      uiMessage("features.recipe.pre-ferment-guide.percentuale-poolish-su-impasto-finale-20-4-89117fcd"),
    ],
  },
  biga: {
    id: 'biga',
    name: uiMessage("features.recipe.pre-ferment-guide.biga-08518857"),
    origin: uiMessage("features.recipe.pre-ferment-guide.italiano-21df7394"),
    emoji: '🍞',
    description: uiMessage("features.recipe.pre-ferment-guide.pre-fermento-asciutto-44-48-idratazione-co-bd813da5"),
    hydration: '44-48%',
    yeastPct: '0.5-1%',
    duration: '16-48h',
    temperature: '16-18°C (o 4°C per 48h)',
    consistency: uiMessage("features.recipe.pre-ferment-guide.asciutta-compatta-6bcc69ed"),
    phFinal: '5.0-5.3',
    fermentationType: uiMessage("features.recipe.pre-ferment-guide.lattica-alcolica-lab-attivi-15c8cdb5"),
    flavor: uiMessage("features.recipe.pre-ferment-guide.acidulo-complesso-note-fermentate-3d50a454"),
    crustResult: uiMessage("features.recipe.pre-ferment-guide.croccante-friabile-alveolatura-fine-0a655c50"),
    extensibility: uiMessage("features.recipe.pre-ferment-guide.bassa-richiede-riposo-dopo-staglio-e0c000b7"),
    idealStyles: uiMessage("features.recipe.pre-ferment-guide.napoletana-classica-pinsa-pizza-al-taglio--29eefb3f"),
    tips: [
      uiMessage("features.recipe.pre-ferment-guide.se-troppo-asciutta-aggiungi-5-10-acqua-per-a05b6761"),
      uiMessage("features.recipe.pre-ferment-guide.matura-quando-la-superficie-e-screpolata-a-f8fc36f7"),
      uiMessage("features.recipe.pre-ferment-guide.conservabile-fino-a-48h-in-frigo-rinfresca-bd3f8c73"),
      uiMessage("features.recipe.pre-ferment-guide.percentuale-biga-su-impasto-finale-20-50-d-c26c8331"),
    ],
  },
  autolisi: {
    id: 'autolisi',
    name: uiMessage("features.recipe.pre-ferment-guide.autolisi-d768d82f"),
    origin: uiMessage("features.recipe.pre-ferment-guide.universale-4d9a8d57"),
    emoji: '💦',
    description: uiMessage("features.recipe.pre-ferment-guide.riposo-enzimatico-di-sola-farina-acqua-sen-bf42f0b6"),
    hydration: '55-75% (tutta l\'acqua della ricetta)',
    yeastPct: '0% (nessuno)',
    duration: '20min - 2h',
    temperature: 'Ambiente',
    consistency: uiMessage("features.recipe.pre-ferment-guide.pastosa-37b423b6"),
    phFinal: '~6.5 (neutro)',
    fermentationType: uiMessage("features.recipe.pre-ferment-guide.nessuna-solo-attivita-enzimatica-27843676"),
    flavor: uiMessage("features.recipe.pre-ferment-guide.neutro-non-altera-il-sapore-46a7c141"),
    crustResult: uiMessage("features.recipe.pre-ferment-guide.variabile-dipende-dal-processo-successivo-d4ac118c"),
    extensibility: uiMessage("features.recipe.pre-ferment-guide.alta-impasto-setoso-e-meno-appiccicoso-61f86f7d"),
    idealStyles: uiMessage("features.recipe.pre-ferment-guide.tutti-gli-stili-tecnica-universale-6673807c"),
    tips: [
      uiMessage("features.recipe.pre-ferment-guide.farine-integrali-autolisi-piu-lunga-60-90m-1690bbff"),
      uiMessage("features.recipe.pre-ferment-guide.acqua-tiepida-30-35-c-accelera-gli-enzimi-14c88588"),
      uiMessage("features.recipe.pre-ferment-guide.sempre-prima-di-aggiungere-sale-il-sale-in-23c0578a"),
      uiMessage("features.recipe.pre-ferment-guide.riduce-il-tempo-di-impasto-del-30-perche-i-a4c95c1d"),
      uiMessage("features.recipe.pre-ferment-guide.combinabile-con-biga-o-poolish-per-risulta-5e807f3d"),
    ],
  },
};

/* === COMPARISON TABLE DATA (Italian fallback) === */
const COMP_KEYS = ['hydration','yeast','duration','temperature','ph','flavor','extensibility','alveolatura','complexity'] as const;

export const COMPARISON_ROWS = [
  { label: uiMessage("features.recipe.pre-ferment-guide.idratazione-ca30c32c"), biga: '44-48%', poolish: '100%', autolisi: '55-75%' },
  { label: uiMessage("features.recipe.pre-ferment-guide.lievito-e6b263a4"), biga: '0.5-1%', poolish: '0.1-0.5%', autolisi: '0%' },
  { label: uiMessage("features.recipe.pre-ferment-guide.durata-32c1dabb"), biga: '16-48h', poolish: '8-16h', autolisi: '0.5-2h' },
  { label: uiMessage("features.recipe.pre-ferment-guide.temperatura-df12789a"), biga: '16-18°C', poolish: '20-22°C', autolisi: 'Ambiente' },
  { label: uiMessage("features.recipe.pre-ferment-guide.ph-finale-99bbe246"), biga: '5.0-5.3', poolish: '4.5-4.8', autolisi: '~6.5' },
  { label: uiMessage("features.recipe.pre-ferment-guide.sapore-ac3d50d8"), biga: 'Acidulo', poolish: 'Dolce/maltato', autolisi: 'Neutro' },
  { label: uiMessage("features.recipe.pre-ferment-guide.estensibilita-cbedf025"), biga: 'Bassa', poolish: 'Alta', autolisi: 'Alta' },
  { label: uiMessage("features.recipe.pre-ferment-guide.alveolatura-9d08dfa3"), biga: 'Fine', poolish: 'Grande', autolisi: 'Grande' },
  { label: uiMessage("features.recipe.pre-ferment-guide.complessita-39ee6854"), biga: 'Media', poolish: 'Bassa', autolisi: 'Molto bassa' },
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
      transition={motionSpring.standard}
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
