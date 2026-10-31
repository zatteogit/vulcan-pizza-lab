/* === TROUBLESHOOTING PANEL === */
/* Pannello contestuale con avvisi basati sulla ricetta generata */
/* Catalogo completo e pannello contestuale per fase/metodo. */

import {
AlertTriangle,
ChevronDown,ChevronUp,
Droplet,
Flame,
FlaskConical,
Hand,
Info,
Lightbulb,
Microscope,
Search,
ShieldCheck,
Wheat,
Wrench,
XCircle,
X,
type LucideIcon,
} from 'lucide-react';
import { AnimatePresence,motion,useReducedMotion } from 'motion/react';
import { LearningIllustration, TROUBLESHOOTING_VISUALS } from "../learning/learning-illustration";
import { motionDelay,motionSpring } from "../../components/ds/motion";
import { createElement, useEffect, useId, useMemo, useState } from 'react';
import { filterByQuery, searchLexicon } from "../search/text-match";
import { useCms } from "../cms/cms-context";
import { Disclosure, EmptyState, FilterChip, IconButton, ModalSheet, Surface } from "../../components/ds/index";
import {
type TroubleshootingIssue,
type StepTroubleshooting,
getContextualWarnings,
getLocalizedCategoryLabel,
getLocalizedIssue,
groupIssuesByPhase,
ISSUE_GLOSSARY_TERMS,
ISSUE_SCIENCE_NOTES,
ISSUES_DB,
TROUBLESHOOTING_PHASE_ORDER
} from "../../data/troubleshooting-data";
import { uiMessage } from "../../i18n/ui-messages";
import type { StyleThresholds } from "../../domain/science/engine-facts";
import { WhyButton } from "../science/why-button";

/* FW-02 (S13-A-06): una cifra nel testo del problema (soglia, temperatura,
   percentuale) è una regola pratica della nota troubleshooting-thresholds. */
function hasNumericThreshold(issue: TroubleshootingIssue): boolean {
  return /\d/.test([issue.cause, issue.testRapido, issue.fixImmediate, issue.prevention].join(" "));
}
import { browserRevealEnv, revealWhenStable } from "../../hooks/use-hash-target";
import { GlossaryTermLinks } from "../glossary/term-link";

/* === FW-13 (S13-B-12): icone delle categorie, sul modello del glossario === */
const TROUBLESHOOTING_CATEGORY_ICONS: Record<string, LucideIcon> = {
  dough: Wheat,
  fermentation: Microscope,
  shaping: Hand,
  baking: Flame,
  frying: Droplet,
  false_positive: ShieldCheck,
};

/* === SEVERITY ICON MAP === */
/* FW-12 (S13-A-15/B-10): l'icona è decorativa; la severità si dice a parole
   (badge visibile nella card, testo per lo screen reader negli avvisi). */
const SeverityIcon = ({ severity }: { severity: string }) => {
  if (severity === 'critical') return <XCircle aria-hidden="true" className="troubleshooting-severity-icon troubleshooting-severity-icon--critical" />;
  if (severity === 'warning') return <AlertTriangle aria-hidden="true" className="troubleshooting-severity-icon troubleshooting-severity-icon--warning" />;
  return <Info aria-hidden="true" className="troubleshooting-severity-icon troubleshooting-severity-icon--info" />;
};

function severityLabel(severity: string): string {
  if (severity === 'critical') return uiMessage("features.recipe.troubleshooting-panel.severity-critical");
  if (severity === 'warning') return uiMessage("features.recipe.troubleshooting-panel.severity-warning");
  return uiMessage("features.recipe.troubleshooting-panel.severity-info");
}

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
  /** FW-05: soglie dello stile scelto (thresholdFor), per consigli relativi. */
  style?: StyleThresholds;
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
          {uiMessage("features.recipe.troubleshooting-panel.968745bd")}</span>
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
                  <span className="sr-only">{severityLabel(w.severity)}: </span>
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
          type="button"
          className="troubleshooting-warnings__toggle"
          aria-expanded={expanded}
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? (
            <div className="troubleshooting-warnings__toggle-content">
              <ChevronUp className="troubleshooting-warnings__toggle-icon" /> {uiMessage("features.recipe.troubleshooting-panel.2d38f713")}</div>
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
  /** Educational figures belong to the full guide, not the cooking sheet. */
  illustrated?: boolean;
  /** Filtro opzionale per categoria */
  filterCategory?: string;
  /** Deep-link (audit lug 2026): issue da aprire e portare in vista all'arrivo,
   *  usato dai link "è andata lunga?" delle fasi della ricetta (?issue=Pxx). */
  initialIssueId?: string;
  /** Elenco chiuso: nel pannello della fase non si può ricadere nel catalogo generico. */
  contextIssueIds?: readonly string[];
}

export function TroubleshootingGuide({ filterCategory, initialIssueId, contextIssueIds, illustrated = false }: TroubleshootingGuideProps) {
  const { cms } = useCms();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(initialIssueId ?? null);
  const [activeCategory, setActiveCategory] = useState<string | null>(filterCategory || null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (!initialIssueId || contextIssueIds) return;
    // FW-03 (S13-B-11) + FW-04: stesso atterraggio del glossario — aspetta che
    // lo stagger delle card finisca (posizione ferma), porta la card in cima,
    // rispetta «riduci movimento» e mette a fuoco il pulsante della card.
    return revealWhenStable(`trouble-${initialIssueId}`, `trouble-${initialIssueId}-toggle`, {
      ...browserRevealEnv(),
      reducedMotion: !!reduceMotion,
    });
  }, [initialIssueId, contextIssueIds, reduceMotion]);


  const sourceIssues = contextIssueIds
    ? contextIssueIds.flatMap(id => { const issue = ISSUES_DB.find(item => item.id === id); return issue ? [issue] : []; })
    : ISSUES_DB;
  /* FW-13: conteggio per categoria come nel glossario; le categorie vuote non
     compaiono (un chip «0» non porta da nessuna parte; FW-09: niente
     «Algoritmo» vuoto). G4b-WP-03: chip nell'ordine delle fasi. */
  const categories = TROUBLESHOOTING_PHASE_ORDER
    .map((key) => [key, sourceIssues.filter((issue) => issue.category === key).length] as const)
    .filter(([, count]) => count > 0);
  /* FW-09 (S13-A-09, S13-B-08): accenti, flessioni («bruciata»), sinonimi
     del CMS («non lievita») e refusi; si cerca anche in test rapido,
     prevenzione e categoria. */
  const lexicon = useMemo(() => searchLexicon(cms.pages), [cms.pages]);
  const inCategory = sourceIssues.map(issue => getLocalizedIssue(issue, cms)).filter((issue) => !activeCategory || issue.category === activeCategory);
  const filtered = searchQuery.trim()
    ? filterByQuery(inCategory, (issue) => [issue.symptom, issue.cause, issue.testRapido, issue.fixImmediate, issue.prevention, getLocalizedCategoryLabel(issue.category, cms)].join(" "), searchQuery, lexicon)
    : inCategory;
  const filtering = Boolean(searchQuery.trim() || activeCategory);
  /* G4b-WP-03 (S13-A-16): nella pagina gruppi per fase, critici in alto; nel
     foglio della fase l'ordine resta quello del passo, senza gruppi. */
  const groups = contextIssueIds ? [{ phase: "", issues: filtered }] : groupIssuesByPhase(filtered);
  let cardIndex = 0;
  const showAll = () => {
    setSearchQuery("");
    setActiveCategory(null);
  };

  return (
    <div data-region="section" className="troubleshooting-guide">
      {!contextIssueIds && <>
        {/* G4b-WP-03 (S13-A-14): il titolo è quello della voce di Impara. */}
        <header className="troubleshooting-guide__title-row">
          <Wrench aria-hidden="true" className="troubleshooting-guide__title-icon" />
          <h1 className="troubleshooting-guide__title">{cms.pages.learnTroubleshooting}</h1>
        </header>
        <p className="type-body troubleshooting-guide__intro">{cms.pages.learnTroubleshootingDesc}</p>

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

        {/* Chip delle fasi: sotto 640 px una riga che scorre (G4b-WP-03), senza
            animazione d'ingresso, che nella riga scorrevole tagliava i chip. */}
        <div className="troubleshooting-guide__chips">
          <FilterChip
            active={!activeCategory}
            onClick={() => setActiveCategory(null)}
            radius="xl"
            count={sourceIssues.length}
          >
            {uiMessage("features.recipe.troubleshooting-panel.d4ef129b")}</FilterChip>
          {categories.map(([key, count]) => {
            const Icon = TROUBLESHOOTING_CATEGORY_ICONS[key] ?? Info;
            return (
            <FilterChip
              key={key}
              active={activeCategory === key}
              onClick={() => setActiveCategory(key)}
              radius="xl"
              count={count}
            >
              <Icon size={14} aria-hidden="true" className="glossary-chip__icon" />
              {getLocalizedCategoryLabel(key, cms)}
            </FilterChip>
            );
          })}
        </div>

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
          {groups.map(({ phase, issues }) => {
            const cards = issues.map((issue) => (
              <motion.div
                key={issue.id}
                id={`trouble-${issue.id}`}
                layout
                initial={{ opacity: 0, y: 10, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.97 }}
                transition={{ ...motionSpring.crispControl, delay: cardIndex++ * motionDelay.profileIntroStep }}
              >
                <IssueCard
                  issue={issue}
                  illustrated={illustrated}
                  expanded={expandedId === issue.id}
                  onToggle={() => setExpandedId(expandedId === issue.id ? null : issue.id)}
                />
              </motion.div>
            ));
            if (!phase) return cards;
            const Icon = TROUBLESHOOTING_CATEGORY_ICONS[phase] ?? Info;
            return (
              <section key={phase} aria-labelledby={`trouble-phase-${phase}`} className="troubleshooting-group">
                <h2 id={`trouble-phase-${phase}`} className="troubleshooting-group__title">
                  <Icon size={18} aria-hidden="true" className="troubleshooting-group__icon" />
                  {getLocalizedCategoryLabel(phase, cms)}
                </h2>
                {cards}
              </section>
            );
          })}
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
          <p className="troubleshooting-sheet__eyebrow">{uiMessage("features.recipe.troubleshooting-panel.ada8fe75")}</p>
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
  illustrated = false,
}: {
  issue: TroubleshootingIssue;
  expanded: boolean;
  onToggle: () => void;
  illustrated?: boolean;
}) {
  const { cms } = useCms();
  /* G4b-WP-03: le voci senza soglie (pala, panetto, buchi) dicono che sono
     pratica comune, nota troubleshooting-practice. */
  const noteId = hasNumericThreshold(issue) ? "troubleshooting-thresholds" : ISSUE_SCIENCE_NOTES[issue.id];

  return (
    <Surface as={motion.div} variant="card" className="troubleshooting-card">
      {/* FW-03: ds/Disclosure con heading, aria-controls e id per il deep link;
          dentro il pulsante solo span (S13-B-11). h3 sotto l'h2 della fase
          (pagina, G4b-WP-03) o del titolo del foglio. */}
      <Disclosure
        variant="inline"
        headingLevel={3}
        id={`trouble-${issue.id}-toggle`}
        open={expanded}
        onOpenChange={onToggle}
        triggerClassName="troubleshooting-card__toggle"
        panelClassName="troubleshooting-card__detail"
        summary={<>
          <SeverityIcon severity={issue.severity} />
          <span className="troubleshooting-card__toggle-body">
            <span className="troubleshooting-card__meta-row">
              {/* FW-12 (S13-A-15/B-10): la severità anche a parole. G4b-WP-03:
                  niente etichetta della fase, la dice già l'h2 del gruppo. */}
              <span className="troubleshooting-card__severity" data-severity={issue.severity}>
                {severityLabel(issue.severity)}
              </span>
            </span>
            <span className="troubleshooting-card__symptom">
              {issue.symptom}
            </span>
          </span>
        </>}
      >
            <div className="troubleshooting-card__detail-body">
              {/* Causa */}
              <DetailRow icon={Search} label={uiMessage("features.recipe.troubleshooting-panel.2cff0350")} value={issue.cause} />
              {/* Test rapido */}
              <DetailRow icon={FlaskConical} label={uiMessage("features.recipe.troubleshooting-panel.5e89b688")} value={issue.testRapido} />
              {/* Fix immediato */}
              <DetailRow
                icon={Wrench}
                label={uiMessage("features.recipe.troubleshooting-panel.4a6dd0bf")}
                value={issue.fixImmediate}
                highlight={issue.severity === 'critical'}
              />
              {/* Prevenzione */}
              <DetailRow icon={ShieldCheck} label={uiMessage("features.recipe.troubleshooting-panel.f9797745")} value={issue.prevention} />
              {illustrated && TROUBLESHOOTING_VISUALS[issue.id]?.map(id => <LearningIllustration key={id} id={id} />)}
              {/* FW-02 (S13-A-06): dove il consiglio dà una soglia numerica, il
                  «Perché?» dice che è una regola pratica, non tarata sullo stile. */}
              {noteId && <WhyButton noteId={noteId} label={cms.science?.notes?.[noteId]?.title} className="troubleshooting-card__why" />}
              <GlossaryTermLinks termIds={ISSUE_GLOSSARY_TERMS[issue.id] ?? []} />
            </div>
      </Disclosure>
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
