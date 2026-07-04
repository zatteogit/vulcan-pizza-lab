/* === PRE-FERMENT EDUCATIONAL CARD === */
/* Basato su Notion Appendice A · Pre-Fermenti: Guida Tecnica */
/* Si mostra in RecipeOutput quando nerdMode è attivo e has_pre_ferment */
/* i18n: all user-facing strings resolved via useCms().preFerment */

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
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
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      style={{
        background: 'var(--surface-container-low)',
        border: '1px solid var(--outline-variant)',
        borderRadius: '1rem',
        overflow: 'hidden',
      }}
    >
      {/* Header — always visible */}
      <motion.button
        className="active:scale-95"
        onClick={() => setExpanded(!expanded)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: '0.875rem',
          padding: '1.1rem 1.5rem',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          textAlign: 'left',
          fontFamily: 'inherit',
        }}
      >
        <span style={{ width: "var(--space-8)", height: "var(--space-6)", flexShrink: 0, color: 'var(--primary)' }}>
          <Flask size={32} />
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <span
              style={{
                fontSize: 'var(--font-size-xs)',
                letterSpacing: '0.14em',
                textTransform: 'uppercase' as const,
                color: 'var(--primary)',
                fontWeight: 'var(--weight-semibold)' as any,
                opacity: 0.7,
              }}
            >
              {pf.sectionLabel.toUpperCase()}
            </span>
          </div>
          <div style={{ fontSize: 'var(--font-size-xl)', color: 'var(--text-default)', lineHeight: 'var(--leading-normal)', marginTop: "var(--space-1)" }}>
            {info.emoji} <span style={{ fontFamily: 'var(--font-serif)' }}>{info.name}</span>
            <span style={{ color: 'var(--muted-foreground)', fontSize: 'var(--font-size-base)' }}> — {info.origin}</span>
          </div>
        </div>
        <div style={{ color: 'var(--muted-foreground)', flexShrink: 0 }}>
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
            style={{ overflow: 'hidden' }}
          >
            <div style={{
              padding: '0 1.5rem 1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              borderTop: '1px solid var(--outline-variant)',
              paddingTop: '1rem',
            }}>
              {/* Description */}
              <p style={{ fontSize: 'var(--font-size-xl)', color: 'var(--text-default)', lineHeight: 'var(--leading-reading)', margin: 0 }}>
                {info.description}
              </p>

              {/* Key parameters grid */}
              <div className="grid grid-cols-2 gap-2">
                <ParamBadge icon={<Droplets size={12} />} label={pf.paramHydration} value={info.hydration} />
                <ParamBadge icon={<Clock size={12} />} label={pf.paramDuration} value={info.duration} />
                <ParamBadge icon={<Thermometer size={12} />} label={pf.paramTemperature} value={info.temperature} />
                <ParamBadge icon={<Flask size={18} />} label={pf.paramPh} value={info.phFinal} />
              </div>

              {/* Result characteristics */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1-5)' }}>
                <DetailLine label={pf.detailFermentation} value={info.fermentationType} />
                <DetailLine label={pf.detailFlavor} value={info.flavor} />
                <DetailLine label={pf.detailCrust} value={info.crustResult} />
                <DetailLine label={pf.detailExtensibility} value={info.extensibility} />
                <DetailLine label={pf.detailIdealStyles} value={info.idealStyles} />
              </div>

              {/* Tips */}
              <div style={{
                background: 'color-mix(in srgb, var(--accent-smart) 6%, transparent)',
                borderRadius: '0.75rem',
                padding: '0.75rem 1rem',
              }}>
                <div
                  style={{
                    fontSize: 'var(--font-size-sm)',
                    letterSpacing: '0.14em',
                    textTransform: 'uppercase' as const,
                    color: 'var(--tertiary)',
                    marginBottom: '0.5rem',
                    fontWeight: 'var(--weight-semibold)' as any,
                  }}
                >
                  {`💡 ${pf.tipsLabel.toUpperCase()}`}
                </div>
                <ul style={{ margin: 0, paddingLeft: 'var(--space-5)', display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
                  {info.tips.map((tip, i) => (
                    <li key={i} style={{ fontSize: 'var(--font-size-md)', color: 'var(--text-default)', lineHeight: 1.55 }}>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Comparison toggle */}
              <motion.button
                className="active:scale-95"
                onClick={() => setShowComparison(!showComparison)}
                style={{
                  background: 'var(--surface-container)',
                  border: '1px solid var(--outline-variant)',
                  borderRadius: '0.75rem',
                  padding: '0.5rem 0.75rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.375rem',
                  fontSize: 'var(--font-size-md)',
                  color: 'var(--primary)',
                  fontFamily: 'inherit',
                }}
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
                    style={{ overflow: 'hidden' }}
                  >
                    <div style={{
                      overflowX: 'auto',
                      borderRadius: '0.75rem',
                      border: '1px solid var(--outline-variant)',
                    }}>
                      <table style={{
                        width: '100%',
                        borderCollapse: 'collapse',
                        fontSize: '0.75rem',
                      }}>
                        <thead>
                          <tr>
                            <th style={thStyle}> </th>
                            <th style={{ ...thStyle, color: 'var(--primary)' }}>🍞 Biga</th>
                            <th style={{ ...thStyle, color: 'var(--cta)' }}>💧 Poolish</th>
                            <th style={{ ...thStyle, color: 'var(--tertiary)' }}>💦 Autolisi</th>
                          </tr>
                        </thead>
                        <tbody>
                          {compRows.map((row, i) => (
                            <tr key={COMP_KEYS[i]}>
                              <td style={{
                                ...tdStyle,
                                fontSize: '0.625rem',
                                letterSpacing: '0.08em',
                                textTransform: 'uppercase' as const,
                                color: 'var(--muted-foreground)',
                                fontWeight: 'var(--weight-semibold)' as any,
                                background: i % 2 === 0 ? 'var(--surface-container-low)' : 'transparent',
                              }}>
                                {row.label}
                              </td>
                              <td style={{ ...tdStyle, background: i % 2 === 0 ? 'var(--surface-container-low)' : 'transparent' }}>
                                {row.biga}
                              </td>
                              <td style={{ ...tdStyle, background: i % 2 === 0 ? 'var(--surface-container-low)' : 'transparent' }}>
                                {row.poolish}
                              </td>
                              <td style={{ ...tdStyle, background: i % 2 === 0 ? 'var(--surface-container-low)' : 'transparent' }}>
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
    </motion.div>
  );
}

/* === PARAM BADGE === */
function ParamBadge({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        background: 'var(--surface-container)',
        borderRadius: '0.75rem',
        padding: '0.75rem 0.875rem',
      }}
    >
      <span style={{ color: 'var(--secondary)', flexShrink: 0 }}>{icon}</span>
      <div>
        <div style={{
          fontSize: 'var(--font-size-2xs)',
          letterSpacing: '0.12em',
          textTransform: 'uppercase' as const,
          color: 'var(--muted-foreground)',
          fontWeight: 'var(--weight-semibold)' as any,
        }}>
          {label}
        </div>
        <div style={{ fontSize: 'var(--font-size-md)', color: 'var(--text-default)', lineHeight: 1.35 }}>
          {value}
        </div>
      </div>
    </div>
  );
}

/* === DETAIL LINE === */
function DetailLine({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', gap: 'var(--space-2)', fontSize: 'var(--font-size-md)', lineHeight: 1.5 }}>
      <span style={{
        fontSize: 'var(--font-size-2xs)',
        letterSpacing: '0.1em',
        textTransform: 'uppercase' as const,
        color: 'var(--muted-foreground)',
        minWidth: '5rem',
        paddingTop: "var(--space-0-5)",
        flexShrink: 0,
        fontWeight: 'var(--weight-semibold)' as any,
      }}>
        {label}
      </span>
      <span style={{ color: 'var(--text-default)' }}>{value}</span>
    </div>
  );
}

/* === TABLE STYLES === */
const thStyle: React.CSSProperties = {
  padding: '0.5rem 0.625rem',
  textAlign: 'left',
  fontSize: '0.625rem',
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  fontWeight: 'var(--weight-semibold)' as any,
  borderBottom: '1px solid var(--outline-variant)',
};

const tdStyle: React.CSSProperties = {
  padding: '0.375rem 0.625rem',
  color: 'var(--text-default)',
  borderBottom: '1px solid var(--outline-variant)',
};
