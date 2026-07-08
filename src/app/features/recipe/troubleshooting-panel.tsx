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
import { useEffect, useState } from 'react';
import { useCms } from "../cms/cms-context";
import { FilterChip, Surface } from "../../components/ds/index";
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
  if (severity === 'critical') return <XCircle className="troubleshooting-severity-icon troubleshooting-severity-icon--critical" />;
  if (severity === 'warning') return <AlertTriangle className="troubleshooting-severity-icon troubleshooting-severity-icon--warning" />;
  return <Info className="troubleshooting-severity-icon troubleshooting-severity-icon--info" />;
};

/* Classe modifier per severità della card avviso (costruita in JS, non nel JSX:
   evita literal className dinamici — vedi CSS per le 3 varianti). */
function warningItemClass(severity: string) {
  if (severity === 'critical') return 'troubleshooting-warnings__item troubleshooting-warnings__item--critical';
  if (severity === 'warning') return 'troubleshooting-warnings__item troubleshooting-warnings__item--warning';
  return 'troubleshooting-warnings__item troubleshooting-warnings__item--info';
}

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
  flourG?: number;
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
      data-region="section"
      className="troubleshooting-warnings"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
    >
      {/* Header */}
      <div className="troubleshooting-warnings__header">
        <Lightbulb className="troubleshooting-warnings__header-icon" />
        <span className="troubleshooting-warnings__label">
          Suggerimenti
        </span>
        <span className="troubleshooting-warnings__count">
          {warnings.length} avvis{warnings.length === 1 ? 'o' : 'i'}
        </span>
      </div>

      {/* Warning cards */}
      <AnimatePresence mode="sync">
        {shown.map((w, i) => (
          <motion.div
            key={w.issueId + i}
            className={warningItemClass(w.severity)}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          >
            <div className="troubleshooting-warnings__item-row">
              <div className="troubleshooting-warnings__item-icon">
                <SeverityIcon severity={w.severity} />
              </div>
              <div className="troubleshooting-warnings__item-body">
                <div className="troubleshooting-warnings__item-message">
                  {w.message}
                </div>
                <div className="troubleshooting-warnings__item-tip">
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
          className="troubleshooting-warnings__toggle"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? (
            <div className="troubleshooting-warnings__toggle-content">
              <ChevronUp className="troubleshooting-warnings__toggle-icon" /> Mostra meno
            </div>
          ) : (
            <div className="troubleshooting-warnings__toggle-content">
              <ChevronDown className="troubleshooting-warnings__toggle-icon" /> +{warnings.length - 2} altr{warnings.length - 2 === 1 ? 'o' : 'i'}
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
  /** Deep-link (audit lug 2026): issue da aprire e portare in vista all'arrivo,
   *  usato dai link "è andata lunga?" delle fasi della ricetta (?issue=Pxx). */
  initialIssueId?: string;
}

export function TroubleshootingGuide({ filterCategory, initialIssueId }: TroubleshootingGuideProps) {
  const { cms } = useCms();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(initialIssueId ?? null);
  const [activeCategory, setActiveCategory] = useState<string | null>(filterCategory || null);

  useEffect(() => {
    if (!initialIssueId) return;
    // Dopo lo stagger di entrata delle card, porta l'issue aperta in vista.
    const timer = window.setTimeout(() => {
      document
        .getElementById(`trouble-${initialIssueId}`)
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 400);
    return () => window.clearTimeout(timer);
  }, [initialIssueId]);

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
    <div data-region="section" className="troubleshooting-guide">
      {/* Title */}
      <div className="troubleshooting-guide__title-row">
        <Wrench className="troubleshooting-guide__title-icon" />
        <span className="troubleshooting-guide__title">
          Guida Troubleshooting
        </span>
      </div>

      {/* Search */}
      <div className="troubleshooting-guide__search">
        <Search className="troubleshooting-guide__search-icon" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={cms.pages.troubleshootSearchPlaceholder}
          className="troubleshooting-guide__search-input"
        />
      </div>

      {/* Category chips */}
      <motion.div
        className="troubleshooting-guide__chips"
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
        <div className="troubleshooting-guide__list">
          {filtered.length === 0 && (
            <motion.div
              key="empty"
              className="troubleshooting-guide__empty"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            >
              {cms.misc.noTroubleshootingResults}
            </motion.div>
          )}
          {filtered.map((issue, i) => (
            <motion.div
              key={issue.id}
              id={`trouble-${issue.id}`}
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
    <Surface as={motion.div} variant="card" className="troubleshooting-card">
      {/* Header — always visible */}
      <motion.button
        className="troubleshooting-card__toggle"
        onClick={onToggle}
      >
        <SeverityIcon severity={issue.severity} />
        <div className="troubleshooting-card__toggle-body">
          <div className="troubleshooting-card__meta-row">
            <span className="troubleshooting-card__badge">
              {catLabel}
            </span>
          </div>
          <div className="troubleshooting-card__symptom">
            {issue.symptom}
          </div>
        </div>
        <div className="troubleshooting-card__chevron">
          {expanded
            ? <ChevronUp className="troubleshooting-card__chevron-icon" />
            : <ChevronDown className="troubleshooting-card__chevron-icon" />
          }
        </div>
      </motion.button>

      {/* Detail — expandable */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            className="troubleshooting-card__detail"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          >
            <div className="troubleshooting-card__detail-body">
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
    </Surface>
  );
}

function DetailRow({
  icon, label, value, highlight,
}: {
  icon: string; label: string; value: string; highlight?: boolean;
}) {
  const rowClass = highlight
    ? 'troubleshooting-detail-row troubleshooting-detail-row--highlight'
    : 'troubleshooting-detail-row';
  return (
    <div className={rowClass}>
      <span className="troubleshooting-detail-row__icon">{icon}</span>
      <div className="troubleshooting-detail-row__body">
        <span className="troubleshooting-detail-row__label">
          {label}
        </span>
        <span className="troubleshooting-detail-row__value">
          {value}
        </span>
      </div>
    </div>
  );
}
