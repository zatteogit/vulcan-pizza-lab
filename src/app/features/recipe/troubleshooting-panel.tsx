/* === TROUBLESHOOTING PANEL === */
/* Pannello contestuale con avvisi basati sulla ricetta generata */
/* + database completo 20 problemi espandibile */

import {
AlertTriangle,
ChevronDown,ChevronUp,
Info,
Lightbulb,
Search,
Wrench,
XCircle
} from 'lucide-react';
import { AnimatePresence,motion } from 'motion/react';
import { useState } from 'react';
import { useCms } from "../cms/cms-context";
import { FilterChip } from "../../components/ds/index";
import {
type TroubleshootingIssue,
CATEGORY_LABELS,
getContextualWarnings,
getLocalizedCategoryLabel,
getLocalizedIssue,
ISSUES_DB
} from "../../data/troubleshooting-data";

/* === SEVERITY ICON MAP === */
const SeverityIcon = ({ severity }: { severity: string }) => {
  if (severity === 'critical') return <XCircle style={{ width: 'var(--space-4)', height: 'var(--space-4)', color: 'var(--destructive)' }} />;
  if (severity === 'warning') return <AlertTriangle style={{ width: 'var(--space-4)', height: 'var(--space-4)', color: 'var(--tertiary)' }} />;
  return <Info style={{ width: 'var(--space-4)', height: 'var(--space-4)', color: 'var(--secondary)' }} />;
};

const severityBg = (s: string) =>
  s === 'critical'
    ? 'color-mix(in srgb, var(--destructive) 8%, transparent)'
    : s === 'warning'
      ? 'color-mix(in srgb, var(--tertiary) 8%, transparent)'
      : 'color-mix(in srgb, var(--secondary) 6%, transparent)';

const severityBorder = (s: string) =>
  s === 'critical'
    ? 'color-mix(in srgb, var(--destructive) 20%, transparent)'
    : s === 'warning'
      ? 'color-mix(in srgb, var(--tertiary) 20%, transparent)'
      : 'color-mix(in srgb, var(--secondary) 12%, transparent)';

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
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--space-4) var(--space-5)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-3)',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
        <Lightbulb style={{ width: 'var(--space-4)', height: 'var(--space-4)', color: 'var(--tertiary)' }} />
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
              borderRadius: 'var(--radius-md)',
              padding: 'var(--space-1-5) var(--space-4)',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-1-5)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-2)' }}>
              <div style={{ marginTop: 'var(--space-0-5)', flexShrink: 0 }}>
                <SeverityIcon severity={w.severity} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 'var(--font-size-lg)', color: 'var(--text-default)', lineHeight: 1.4 }}>
                  {w.message}
                </div>
                <div style={{ fontSize: 'var(--font-size-md)', color: 'var(--muted-foreground)', lineHeight: 1.4, marginTop: 'var(--space-0-5)' }}>
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
            background: 'transparent',
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
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
              <ChevronUp style={{ width: 'var(--font-size-xl)', height: 'var(--font-size-xl)' }} /> Mostra meno
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
              <ChevronDown style={{ width: 'var(--font-size-xl)', height: 'var(--font-size-xl)' }} /> +{warnings.length - 2} altr{warnings.length - 2 === 1 ? 'o' : 'i'}
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
      {/* Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
        <Wrench style={{ width: 'var(--font-size-3xl)', height: 'var(--font-size-3xl)', color: 'var(--primary)' }} />
        <span style={{ fontFamily: 'var(--font-serif)', fontSize: 'var(--font-size-5xl)', color: 'var(--text-default)' }}>
          Guida Troubleshooting
        </span>
        
      </div>

      {/* Search */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 'var(--space-2)',
        background: 'var(--surface-container)',
        border: 'var(--border-width-thin) solid var(--outline-variant)',
        borderRadius: 'var(--radius-md)',
        padding: 'var(--space-2) var(--space-3)',
      }}>
        <Search style={{ width: 'var(--font-size-xl)', height: 'var(--font-size-xl)', color: 'var(--muted-foreground)', flexShrink: 0 }} />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={cms.pages.troubleshootSearchPlaceholder}
          style={{
            flex: 1, border: 'none', background: 'transparent', outline: 'none',
            fontSize: 'var(--font-size-lg)', color: 'var(--text-default)',
            fontFamily: 'inherit',
          }}
        />
      </div>

      {/* Category chips */}
      <motion.div
        style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-1-5)' }}
        initial="hidden"
        animate="visible"
        variants={{
          hidden: {},
          visible: { transition: { staggerChildren: 0.04 } },
        }}
      >
        <FilterChip
          active={!activeCategory}
          onClick={() => setActiveCategory(null)}
          radius="md"
          variants={{
            hidden: { opacity: 0, y: 8, scale: 0.95 },
            visible: { opacity: 1, y: 0, scale: 1 },
          }}
          transition={{ type: 'spring', stiffness: 500, damping: 28 }}
        >
          Tutti
        </FilterChip>
        {categories.map(([key, { emoji }]) => (
          <FilterChip
            key={key}
            active={activeCategory === key}
            onClick={() => setActiveCategory(activeCategory === key ? null : key)}
            size="sm"
            radius="lg"
            variants={{
              hidden: { opacity: 0, y: 8, scale: 0.95 },
              visible: { opacity: 1, y: 0, scale: 1 },
            }}
            transition={{ type: 'spring', stiffness: 500, damping: 28 }}
          >
            {emoji} {getLocalizedCategoryLabel(key, cms)}
          </FilterChip>
        ))}
      </motion.div>

      {/* Issues list */}
      <AnimatePresence mode="popLayout">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          {filtered.length === 0 && (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              style={{
                textAlign: 'center', padding: 'var(--space-8)',
                color: 'var(--muted-foreground)', fontSize: 'var(--font-size-lg)',
              }}
            >
              {cms.misc.noTroubleshootingResults}
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
  const { cms } = useCms();
  const catLabel = getLocalizedCategoryLabel(issue.category, cms);

  return (
    <motion.div
      style={{
        background: 'var(--surface-container-low)',
        border: 'var(--border-width-thin) solid var(--outline-variant)',
        borderRadius: 'var(--radius-lg)',
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
          gap: 'var(--space-2-5)',
          padding: 'var(--font-size-xl) var(--space-4)',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          textAlign: 'left',
          fontFamily: 'inherit',
        }}
      >
        <SeverityIcon severity={issue.severity} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1-5)', flexWrap: 'wrap' }}>
            
            <span style={{
              fontSize: 'var(--font-size-xs)', color: 'var(--muted-foreground)',
              background: 'var(--surface-container)',
              padding: 'var(--space-px) var(--space-1-5)', borderRadius: 'var(--radius-xs)',
            }}>
              {catLabel}
            </span>
          </div>
          <div style={{ fontSize: 'var(--font-size-lg)', color: 'var(--text-default)', lineHeight: 1.4, marginTop: 'var(--space-1)' }}>
            {issue.symptom}
          </div>
        </div>
        <div style={{ flexShrink: 0, color: 'var(--muted-foreground)' }}>
          {expanded
            ? <ChevronUp style={{ width: 'var(--space-4)', height: 'var(--space-4)' }} />
            : <ChevronDown style={{ width: 'var(--space-4)', height: 'var(--space-4)' }} />
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
              padding: 'var(--space-0) var(--space-4) var(--space-4)',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-3)',
              borderTop: 'var(--border-width-thin) solid var(--outline-variant)',
              paddingTop: 'var(--space-3)',
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
      display: 'flex', gap: 'var(--space-2)',
      ...(highlight ? {
        background: 'color-mix(in srgb, var(--destructive) 6%, transparent)',
        borderRadius: 'var(--radius-sm)',
        padding: 'var(--space-2) var(--space-2-5)',
        margin: 'var(--space-0) calc(-1 * var(--space-2-5))',
      } : {}),
    }}>
      <span style={{ flexShrink: 0, fontSize: 'var(--font-size-lg)' }}>{icon}</span>
      <div>
        <span
          style={{
            fontSize: 'var(--font-size-xs)',
            letterSpacing: '0.12em',
            textTransform: 'uppercase' as const,
            color: 'var(--muted-foreground)',
            display: 'block',
            marginBottom: 'var(--space-0-5)',
            fontWeight: 'var(--weight-semibold)' as any,
          }}
        >
          {label}
        </span>
        <span style={{ fontSize: 'var(--font-size-lg)', color: 'var(--text-default)', lineHeight: 1.5 }}>
          {value}
        </span>
      </div>
    </div>
  );
}
