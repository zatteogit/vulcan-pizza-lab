/* === TROUBLESHOOTING PANEL === */
/* Pannello contestuale con avvisi basati sulla ricetta generata */
/* Catalogo completo e pannello contestuale per fase/metodo. */

import {
AlertTriangle,
ChevronDown,ChevronUp,
FlaskConical,
Info,
Lightbulb,
Search,
ShieldCheck,
Wrench,
XCircle,
X,
type LucideIcon,
} from 'lucide-react';
import { AnimatePresence,motion } from 'motion/react';
import { motionDelay,motionSpring } from "../../components/ds/motion";
import { createElement, useEffect, useId, useMemo, useState } from 'react';
import { filterByQuery, searchLexicon } from "../search/text-match";
import { useCms } from "../cms/cms-context";
import { EmptyState, FilterChip, IconButton, ModalSheet, Surface } from "../../components/ds/index";
import {
type TroubleshootingIssue,
type StepTroubleshooting,
CATEGORY_LABELS,
getContextualWarnings,
getLocalizedCategoryLabel,
getLocalizedIssue,
ISSUES_DB
} from "../../data/troubleshooting-data";
import { uiMessage } from "../../i18n/ui-messages";

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
  usesOven?: boolean;
  flourG?: number;
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
      data-region="section"
      className="troubleshooting-warnings"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={motionSpring.standard}
    >
      {/* Header */}
      <div className="troubleshooting-warnings__header">
        <Lightbulb className="troubleshooting-warnings__header-icon" />
        <span className="troubleshooting-warnings__label">
          {uiMessage("features.recipe.troubleshooting-panel.suggerimenti-968745bd")}</span>
        <span className="troubleshooting-warnings__count">
          {warnings.length === 1
            ? uiMessage("features.recipe.troubleshooting-panel.warning-count-one", [warnings.length])
            : uiMessage("features.recipe.troubleshooting-panel.warning-count-many", [warnings.length])}
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
            transition={motionSpring.crispControl}
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
                  <Lightbulb size={14} aria-hidden="true" className="tip-icon" /> {w.tip}
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
              <ChevronUp className="troubleshooting-warnings__toggle-icon" /> {uiMessage("features.recipe.troubleshooting-panel.mostra-meno-2d38f713")}</div>
          ) : (
            <div className="troubleshooting-warnings__toggle-content">
              <ChevronDown className="troubleshooting-warnings__toggle-icon" />
              {warnings.length - 2 === 1
                ? uiMessage("features.recipe.troubleshooting-panel.more-count-one", [warnings.length - 2])
                : uiMessage("features.recipe.troubleshooting-panel.more-count-many", [warnings.length - 2])}
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
  /** Elenco chiuso: nel pannello della fase non si può ricadere nel catalogo generico. */
  contextIssueIds?: readonly string[];
}

export function TroubleshootingGuide({ filterCategory, initialIssueId, contextIssueIds }: TroubleshootingGuideProps) {
  const { cms } = useCms();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(initialIssueId ?? null);
  const [activeCategory, setActiveCategory] = useState<string | null>(filterCategory || null);

  useEffect(() => {
    if (!initialIssueId || contextIssueIds) return;
    // Dopo lo stagger di entrata delle card, porta l'issue aperta in vista.
    const timer = window.setTimeout(() => {
      document
        .getElementById(`trouble-${initialIssueId}`)
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 400);
    return () => window.clearTimeout(timer);
  }, [initialIssueId, contextIssueIds]);

  /* FW-09 (S13-A-08, S13-B-07): solo le categorie che hanno problemi; un
     chip che porta sempre a una lista vuota («Algoritmo») non si mostra. */
  const categories = Object.entries(CATEGORY_LABELS).filter(([key]) => ISSUES_DB.some((issue) => issue.category === key));

  const sourceIssues = contextIssueIds
    ? contextIssueIds.flatMap(id => { const issue = ISSUES_DB.find(item => item.id === id); return issue ? [issue] : []; })
    : ISSUES_DB;
  /* FW-09 (S13-A-09, S13-B-08): accenti, flessioni («bruciata»), sinonimi
     del CMS («non lievita») e refusi; si cerca anche in test rapido,
     prevenzione e categoria. */
  const lexicon = useMemo(() => searchLexicon(cms.pages), [cms.pages]);
  const inCategory = sourceIssues.map(issue => getLocalizedIssue(issue, cms)).filter((issue) => !activeCategory || issue.category === activeCategory);
  const filtered = searchQuery.trim()
    ? filterByQuery(inCategory, (issue) => [issue.symptom, issue.cause, issue.testRapido, issue.fixImmediate, issue.prevention, getLocalizedCategoryLabel(issue.category, cms)].join(" "), searchQuery, lexicon)
    : inCategory;
  const filtering = Boolean(searchQuery.trim() || activeCategory);
  const showAll = () => {
    setSearchQuery("");
    setActiveCategory(null);
  };

  return (
    <div data-region="section" className="troubleshooting-guide">
      {!contextIssueIds && <>
        {/* Title */}
        <div className="troubleshooting-guide__title-row">
          <Wrench className="troubleshooting-guide__title-icon" />
          <h1 className="troubleshooting-guide__title">
            {uiMessage("features.recipe.troubleshooting-panel.guida-troubleshooting-ada8fe75")}</h1>
        </div>

        {/* Search */}
        <div className="troubleshooting-guide__search">
          <Search className="troubleshooting-guide__search-icon" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={cms.pages.troubleshootSearchPlaceholder}
            aria-label={cms.pages.troubleshootSearchPlaceholder}
            className="troubleshooting-guide__search-input"
          />
          {searchQuery && (
            <IconButton size="sm" aria-label={cms.pages.searchClearLabel} onClick={() => setSearchQuery("")} className="troubleshooting-guide__search-clear">
              <X size={16} aria-hidden="true" />
            </IconButton>
          )}
        </div>
        {/* FW-09 (S13-B-08): il numero dei risultati, anche ai lettori di schermo. */}
        <p role="status" className="type-body-sm troubleshooting-guide__count">
          {filtering && filtered.length > 0
            ? filtered.length === 1 ? uiMessage("features.troubleshooting.countOne", [filtered.length]) : uiMessage("features.troubleshooting.count", [filtered.length])
            : ""}
        </p>

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
            transition={motionSpring.crispDisclosure}
          >
            {uiMessage("features.recipe.troubleshooting-panel.tutti-d4ef129b")}</FilterChip>
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
              transition={motionSpring.crispDisclosure}
            >
              {emoji} {getLocalizedCategoryLabel(key, cms)}
            </FilterChip>
          ))}
        </motion.div>

      </>}
      {/* Issues list */}
      <AnimatePresence mode="popLayout">
        <div className="troubleshooting-guide__list">
          {/* FW-09 (S13-A-08): due motivi diversi e un'uscita. */}
          {filtered.length === 0 && (
            <EmptyState
              key="empty"
              live
              headingLevel={2}
              title={searchQuery.trim() ? cms.misc.noTroubleshootingResults : uiMessage("features.troubleshooting.emptyCategory")}
              reason={searchQuery.trim() ? uiMessage("features.troubleshooting.emptySearchReason") : uiMessage("features.troubleshooting.emptyCategoryReason")}
              actions={contextIssueIds ? [] : [
                { label: uiMessage("features.troubleshooting.showAll"), onClick: showAll },
                { label: cms.glossary.searchEverywhere, onClick: () => window.dispatchEvent(new Event("vulcan:open-search")) },
              ]}
              className="troubleshooting-guide__empty-state"
            />
          )}
          {filtered.map((issue, i) => (
            <motion.div
              key={issue.id}
              id={`trouble-${issue.id}`}
              layout
              initial={{ opacity: 0, y: 10, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.97 }}
              transition={{ ...motionSpring.crispControl,delay: i * motionDelay.profileIntroStep }}
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

/** Lo stesso catalogo, limitato alla fase effettiva, senza abbandonare la ricetta. */
export function TroubleshootingSheet({ open, context, onClose }: {
  open: boolean;
  context: StepTroubleshooting & { title: string };
  onClose: () => void;
}) {
  const { cms } = useCms();
  const titleId = useId();
  // Lo scrim reagisce a pointerdown: lascia terminare il focus nativo del clic
  // prima di chiudere, così il focus ripristinato non viene perso sul body.
  const dismiss = () => requestAnimationFrame(onClose);
  return (
    <ModalSheet open={open} onClose={dismiss} ariaLabelledby={titleId} size="md" surface="solid" scrim="soft" panelClassName="troubleshooting-sheet">
      <header className="troubleshooting-sheet__header">
        <div className="troubleshooting-sheet__intro">
          <p className="troubleshooting-sheet__eyebrow">{uiMessage("features.recipe.troubleshooting-panel.guida-troubleshooting-ada8fe75")}</p>
          <h2 id={titleId} className="troubleshooting-sheet__title">{context.title}</h2>
        </div>
        <IconButton size="lg" onClick={onClose} aria-label={cms.ui.close} className="troubleshooting-sheet__close"><X size={20} aria-hidden="true" /></IconButton>
      </header>
      <div className="troubleshooting-sheet__body">
        <TroubleshootingGuide key={context.issueIds.join("|")} contextIssueIds={context.issueIds} initialIssueId={context.initialIssueId} />
      </div>
    </ModalSheet>
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
        aria-expanded={expanded}
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
            transition={motionSpring.standard}
          >
            <div className="troubleshooting-card__detail-body">
              {/* Causa */}
              <DetailRow icon={Search} label={uiMessage("features.recipe.troubleshooting-panel.causa-2cff0350")} value={issue.cause} />
              {/* Test rapido */}
              <DetailRow icon={FlaskConical} label={uiMessage("features.recipe.troubleshooting-panel.test-rapido-5e89b688")} value={issue.testRapido} />
              {/* Fix immediato */}
              <DetailRow
                icon={Wrench}
                label={uiMessage("features.recipe.troubleshooting-panel.fix-immediato-4a6dd0bf")}
                value={issue.fixImmediate}
                highlight={issue.severity === 'critical'}
              />
              {/* Prevenzione */}
              <DetailRow icon={ShieldCheck} label={uiMessage("features.recipe.troubleshooting-panel.prevenzione-f9797745")} value={issue.prevention} />
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
  icon: LucideIcon; label: string; value: string; highlight?: boolean;
}) {
  const rowClass = highlight
    ? 'troubleshooting-detail-row troubleshooting-detail-row--highlight'
    : 'troubleshooting-detail-row';
  return (
    <div className={rowClass}>
      <span className="troubleshooting-detail-row__icon">{createElement(icon, { size: 16, "aria-hidden": true })}</span>
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
