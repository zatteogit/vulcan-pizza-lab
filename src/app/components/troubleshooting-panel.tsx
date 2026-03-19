/* === TROUBLESHOOTING PANEL === */
/* Pannello contestuale con avvisi basati sulla ricetta generata */
/* + database completo 20 problemi espandibile */

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  AlertTriangle, Info, XCircle, ChevronDown, ChevronUp,
  Wrench, Lightbulb, ShieldCheck, Search,
} from 'lucide-react';
import { useCms } from './cms/cms-context';
import {
  type ContextualWarning,
  type TroubleshootingIssue,
  ISSUES_DB,
  CATEGORY_LABELS,
  getContextualWarnings,
  getLocalizedIssue,
  getLocalizedCategoryLabel,
} from './troubleshooting-data';

/* === SEVERITY ICON MAP === */
const SeverityIcon = ({ severity }: { severity: string }) => {
  if (severity === 'critical') return <XCircle style={{ width: 16, height: 16, color: 'var(--error, #d32f2f)' }} />;
  if (severity === 'warning') return <AlertTriangle style={{ width: 16, height: 16, color: 'var(--tertiary)' }} />;
  return <Info style={{ width: 16, height: 16, color: 'var(--secondary)' }} />;
};

const severityBg = (s: string) =>
  s === 'critical'
    ? 'rgba(211, 47, 47, 0.08)'
    : s === 'warning'
      ? 'rgba(204, 136, 68, 0.08)'
      : 'rgba(133, 117, 104, 0.06)';

const severityBorder = (s: string) =>
  s === 'critical'
    ? 'rgba(211, 47, 47, 0.2)'
    : s === 'warning'
      ? 'rgba(204, 136, 68, 0.2)'
      : 'rgba(133, 117, 104, 0.12)';

/* === CONTEXTUAL WARNINGS (inline in recipe) === */
interface ContextualWarningsProps {
  hydration: number;
  flourW: number;
  flourPL: number;
  fermentHours: number;
  fermentTemp: number;
  ovenTemp: number;
  skillLevel: number;
  usePreFerment: boolean;
}

export function ContextualWarnings(props: ContextualWarningsProps) {
  const { cms } = useCms();
  const warnings = getContextualWarnings(props, cms);
  const [expanded, setExpanded] = useState(false);

  if (warnings.length === 0) return null;

  const shown = expanded ? warnings : warnings.slice(0, 2);
  const hasMore = warnings.length > 2;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      style={{
        background: 'var(--surface-container-low)',
        border: '1px solid var(--outline-variant)',
        borderRadius: '1rem',
        padding: '1rem 1.25rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Lightbulb style={{ width: 16, height: 16, color: 'var(--tertiary)' }} />
        <span
          style={{
            fontSize: '0.6875rem',
            letterSpacing: '0.18em',
            textTransform: 'uppercase' as const,
            color: 'var(--tertiary)',
            fontWeight: 'var(--weight-semibold)' as any,
          }}
        >
          Suggerimenti
        </span>
        <span
          style={{
            marginLeft: 'auto',
            fontSize: '0.75rem',
            color: 'var(--muted-foreground)',
          }}
        >
          {warnings.length} avvis{warnings.length === 1 ? 'o' : 'i'}
        </span>
      </div>

      {/* Warning cards */}
      <AnimatePresence mode="sync">
        {shown.map((w, i) => (
          <motion.div
            key={w.issueId + i}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            style={{
              background: severityBg(w.severity),
              border: `1px solid ${severityBorder(w.severity)}`,
              borderRadius: '0.75rem',
              padding: '0.75rem 1rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.375rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
              <div style={{ marginTop: 2, flexShrink: 0 }}>
                <SeverityIcon severity={w.severity} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-default)', lineHeight: 1.4 }}>
                  {w.message}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)', lineHeight: 1.4, marginTop: 2 }}>
                  💡 {w.tip}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Show more */}
      {hasMore && (
        <motion.button
          className="active:scale-95"
          onClick={() => setExpanded(!expanded)}
          style={{
            background: 'rgba(0,0,0,0)',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.375rem',
            fontSize: '0.75rem',
            color: 'var(--primary)',
            padding: '0.375rem',
          }}
        >
          {expanded ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <ChevronUp style={{ width: 14, height: 14 }} /> Mostra meno
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <ChevronDown style={{ width: 14, height: 14 }} /> +{warnings.length - 2} altr{warnings.length - 2 === 1 ? 'o' : 'i'}
            </div>
          )}
        </motion.button>
      )}
    </motion.div>
  );
}

/* === FULL TROUBLESHOOTING GUIDE (expandable) === */
interface TroubleshootingGuideProps {
  /** Filtro opzionale per categoria */
  filterCategory?: string;
}

export function TroubleshootingGuide({ filterCategory }: TroubleshootingGuideProps) {
  const { cms } = useCms();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(filterCategory || null);

  const categories = Object.entries(CATEGORY_LABELS);

  const filtered = ISSUES_DB.map(issue => getLocalizedIssue(issue, cms)).filter((issue) => {
    if (activeCategory && issue.category !== activeCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        issue.symptom.toLowerCase().includes(q) ||
        issue.cause.toLowerCase().includes(q) ||
        issue.fixImmediate.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Wrench style={{ width: 18, height: 18, color: 'var(--primary)' }} />
        <span style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', color: 'var(--text-default)' }}>
          Guida Troubleshooting
        </span>
        
      </div>

      {/* Search */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '0.5rem',
        background: 'var(--surface-container)',
        border: '1px solid var(--outline-variant)',
        borderRadius: '0.75rem',
        padding: '0.5rem 0.75rem',
      }}>
        <Search style={{ width: 14, height: 14, color: 'var(--muted-foreground)', flexShrink: 0 }} />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Cerca sintomo o causa..."
          style={{
            flex: 1, border: 'none', background: 'rgba(0,0,0,0)', outline: 'none',
            fontSize: '0.8125rem', color: 'var(--text-default)',
            fontFamily: 'inherit',
          }}
        />
      </div>

      {/* Category chips */}
      <motion.div
        style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}
        initial="hidden"
        animate="visible"
        variants={{
          hidden: {},
          visible: { transition: { staggerChildren: 0.04 } },
        }}
      >
        <motion.button
          className="active:scale-95"
          onClick={() => setActiveCategory(null)}
          variants={{
            hidden: { opacity: 0, y: 8, scale: 0.95 },
            visible: { opacity: 1, y: 0, scale: 1 },
          }}
          transition={{ type: 'spring', stiffness: 500, damping: 28 }}
          style={{
            background: !activeCategory ? 'var(--primary)' : 'var(--surface-container)',
            color: !activeCategory ? '#fff' : 'var(--text-default)',
            border: `1px solid ${!activeCategory ? 'var(--primary)' : 'var(--outline-variant)'}`,
            borderRadius: '0.75rem',
            padding: '0.375rem 0.75rem',
            fontSize: '0.75rem',
            cursor: 'pointer',
            fontFamily: 'inherit',
          }}
        >
          Tutti
        </motion.button>
        {categories.map(([key, { label, emoji }]) => (
          <motion.button
            key={key}
            className="active:scale-95"
            onClick={() => setActiveCategory(activeCategory === key ? null : key)}
            variants={{
              hidden: { opacity: 0, y: 8, scale: 0.95 },
              visible: { opacity: 1, y: 0, scale: 1 },
            }}
            transition={{ type: 'spring', stiffness: 500, damping: 28 }}
            style={{
              background: activeCategory === key ? 'var(--primary)' : 'var(--surface-container)',
              color: activeCategory === key ? '#fff' : 'var(--text-default)',
              border: `1px solid ${activeCategory === key ? 'var(--primary)' : 'var(--outline-variant)'}`,
              borderRadius: '0.75rem',
              padding: '0.375rem 0.75rem',
              fontSize: '0.75rem',
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            {emoji} {label}
          </motion.button>
        ))}
      </motion.div>

      {/* Issues list */}
      <AnimatePresence mode="popLayout">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {filtered.length === 0 && (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              style={{
                textAlign: 'center', padding: '2rem',
                color: 'var(--muted-foreground)', fontSize: '0.8125rem',
              }}
            >
              Nessun problema trovato per questa ricerca
            </motion.div>
          )}
          {filtered.map((issue, i) => (
            <motion.div
              key={issue.id}
              layout
              initial={{ opacity: 0, y: 10, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30, delay: i * 0.03 }}
            >
              <IssueCard
                issue={issue}
                expanded={expandedId === issue.id}
                onToggle={() => setExpandedId(expandedId === issue.id ? null : issue.id)}
              />
            </motion.div>
          ))}
        </div>
      </AnimatePresence>
    </div>
  );
}

/* === ISSUE CARD === */
function IssueCard({
  issue,
  expanded,
  onToggle,
}: {
  issue: TroubleshootingIssue;
  expanded: boolean;
  onToggle: () => void;
}) {
  const cat = CATEGORY_LABELS[issue.category];

  return (
    <motion.div
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
        onClick={onToggle}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: '0.625rem',
          padding: '0.875rem 1rem',
          background: 'rgba(0,0,0,0)',
          border: 'none',
          cursor: 'pointer',
          textAlign: 'left',
          fontFamily: 'inherit',
        }}
      >
        <SeverityIcon severity={issue.severity} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', flexWrap: 'wrap' }}>
            
            <span style={{
              fontSize: '0.5625rem', color: 'var(--muted-foreground)',
              background: 'var(--surface-container)',
              padding: '1px 6px', borderRadius: '4px',
            }}>
              {cat?.label}
            </span>
          </div>
          <div style={{ fontSize: '0.8125rem', color: 'var(--text-default)', lineHeight: 1.4, marginTop: 4 }}>
            {issue.symptom}
          </div>
        </div>
        <div style={{ flexShrink: 0, color: 'var(--muted-foreground)' }}>
          {expanded
            ? <ChevronUp style={{ width: 16, height: 16 }} />
            : <ChevronDown style={{ width: 16, height: 16 }} />
          }
        </div>
      </motion.button>

      {/* Detail — expandable */}
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
              padding: '0 1rem 1rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
              borderTop: '1px solid var(--outline-variant)',
              paddingTop: '0.75rem',
            }}>
              {/* Causa */}
              <DetailRow icon="🔍" label="Causa" value={issue.cause} />
              {/* Test rapido */}
              <DetailRow icon="🧪" label="Test rapido" value={issue.testRapido} />
              {/* Fix immediato */}
              <DetailRow
                icon="🔧"
                label="Fix immediato"
                value={issue.fixImmediate}
                highlight={issue.severity === 'critical'}
              />
              {/* Prevenzione */}
              <DetailRow icon="🛡️" label="Prevenzione" value={issue.prevention} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function DetailRow({
  icon, label, value, highlight,
}: {
  icon: string; label: string; value: string; highlight?: boolean;
}) {
  return (
    <div style={{
      display: 'flex', gap: '0.5rem',
      ...(highlight ? {
        background: 'rgba(211, 47, 47, 0.06)',
        borderRadius: '0.5rem',
        padding: '0.5rem 0.625rem',
        margin: '0 -0.625rem',
      } : {}),
    }}>
      <span style={{ flexShrink: 0, fontSize: '0.8125rem' }}>{icon}</span>
      <div>
        <span
          style={{
            fontSize: '0.5625rem',
            letterSpacing: '0.12em',
            textTransform: 'uppercase' as const,
            color: 'var(--muted-foreground)',
            display: 'block',
            marginBottom: 2,
            fontWeight: 'var(--weight-semibold)' as any,
          }}
        >
          {label}
        </span>
        <span style={{ fontSize: '0.8125rem', color: 'var(--text-default)', lineHeight: 1.5 }}>
          {value}
        </span>
      </div>
    </div>
  );
}