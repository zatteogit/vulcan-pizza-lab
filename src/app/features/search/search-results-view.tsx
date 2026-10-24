import {
  AlertTriangle,
  BookOpen,
  ChefHat,
  CircleDot,
  CornerDownLeft,
  Pizza,
  Search,
  UtensilsCrossed,
  Wheat,
} from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { useMemo, useRef, useState, type KeyboardEvent, type MutableRefObject, type ReactNode } from "react";
import { Link } from "react-router";
import { Heading } from "../../components/ds/index";
import { motionSpring } from "../../components/ds/motion";
import { ImageWithFallback } from "../../components/media/ImageWithFallback";
import { IMAGE_SIZES } from "../../components/media/responsive-images";
import { SEARCH_INPUT_ID, SEARCH_RESULTS_ID } from "../../components/shared/search-field";
import { uiMessage } from "../../i18n/ui-messages";
import { useCms, type CmsContent } from "../cms/cms-context";
import {
  buildSearchIndex,
  groupResults,
  highlightRanges,
  queryTokens,
  searchIndex,
  type ResultType,
} from "./search-index";

/* ═══ U-5 — risultati della ricerca a tutta pagina ═══
 * Prende il posto della pagina corrente (che resta montata, nascosta) invece
 * di un pannello sopra di essa. Chip per tipo con il numero dei risultati,
 * lista compatta raggruppata; in «Tutto» ogni gruppo mostra i primi e rimanda
 * al proprio chip. I risultati sono link: è navigazione, non un menu. Il campo
 * è fuori (dock o testata): Invio e freccia giù arrivano da `keyHandlerRef`. */

type Filter = "all" | ResultType;

const PREVIEW_PER_GROUP = 5;

const TYPE_ICONS: Record<ResultType, typeof Search> = {
  style: ChefHat,
  recipe: UtensilsCrossed,
  topping: Pizza,
  flour: CircleDot,
  glossary: BookOpen,
  guide: Wheat,
  problem: AlertTriangle,
};

const QUICK_TAG_KEYS = [
  "components.shared.search-overlay.suggestion.napoletana",
  "components.shared.search-overlay.suggestion.teglia",
  "components.shared.search-overlay.suggestion.caputo",
  "components.shared.search-overlay.suggestion.hydration",
  "components.shared.search-overlay.suggestion.sourdough",
  "components.shared.search-overlay.suggestion.detroit",
  "components.shared.search-overlay.suggestion.focaccia",
  "components.shared.search-overlay.suggestion.bonci",
];

function categoryLabels(pages: CmsContent["pages"]): Record<ResultType, string> {
  return {
    style: pages.searchCatStyles,
    recipe: uiMessage("components.shared.search-overlay.ricette-c46b30c8"),
    topping: uiMessage("components.shared.search-overlay.condimenti-fc3218d7"),
    flour: pages.searchCatFlours,
    glossary: pages.searchCatGlossary,
    guide: pages.searchCatGuides,
    problem: pages.searchCatProblems,
  };
}

function Highlight({ text, query }: { text: string; query: string }) {
  const ranges = highlightRanges(text, query);
  if (ranges.length === 0) return <>{text}</>;
  const parts: ReactNode[] = [];
  let at = 0;
  ranges.forEach(([start, end], i) => {
    if (start > at) parts.push(text.slice(at, start));
    parts.push(
      <mark key={i} className="search-page__mark">
        {text.slice(start, end)}
      </mark>,
    );
    at = end;
  });
  if (at < text.length) parts.push(text.slice(at));
  return <>{parts}</>;
}

export function SearchResultsView({
  query,
  onQueryChange,
  onSelect,
  keyHandlerRef,
  field,
}: {
  query: string;
  onQueryChange: (value: string) => void;
  /** Chiude la ricerca; la navigazione la fa il link (o la shell, con Invio). */
  onSelect: (link?: string) => void;
  keyHandlerRef: MutableRefObject<((event: KeyboardEvent<HTMLInputElement>) => void) | null>;
  /** Campo proprio quando il dock non c'è (desktop, pagina ricetta). */
  field?: ReactNode;
}) {
  const { cms } = useCms();
  const reduceMotion = useReducedMotion();
  const [filter, setFilter] = useState<Filter>("all");
  const listRef = useRef<HTMLElement>(null);

  const index = useMemo(() => buildSearchIndex(cms), [cms]);
  const all = useMemo(() => searchIndex(index, query), [index, query]);
  const groups = useMemo(() => groupResults(all), [all]);
  const labels = categoryLabels(cms.pages);
  const hasQuery = queryTokens(query).length > 0;

  /* Un chip senza più risultati torna a «Tutto». */
  const effectiveFilter: Filter = filter !== "all" && !groups.some(([type]) => type === filter) ? "all" : filter;

  const visibleGroups = useMemo(
    () =>
      groups
        .filter(([type]) => effectiveFilter === "all" || type === effectiveFilter)
        .map(([type, items]) => {
          const shown = effectiveFilter === "all" ? items.slice(0, PREVIEW_PER_GROUP) : items;
          return { type, items: shown, total: items.length };
        }),
    [groups, effectiveFilter],
  );
  const first = visibleGroups[0]?.items[0];

  const links = () => Array.from(listRef.current?.querySelectorAll<HTMLElement>(".search-page__item") ?? []);

  /* Dal campo: Invio apre il primo risultato, freccia giù entra nella lista. */
  keyHandlerRef.current = (event) => {
    if (event.key === "Enter" && first) {
      event.preventDefault();
      onSelect(first.link);
    } else if (event.key === "ArrowDown" && first) {
      event.preventDefault();
      links()[0]?.focus();
    }
  };

  /* Nella lista: frecce tra i risultati; su dal primo si torna al campo. */
  const onListKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
    const items = links();
    const at = items.indexOf(document.activeElement as HTMLElement);
    if (at === -1) return;
    event.preventDefault();
    if (event.key === "ArrowDown") items[Math.min(at + 1, items.length - 1)]?.focus();
    else if (at === 0) document.getElementById(SEARCH_INPUT_ID)?.focus();
    else items[at - 1]?.focus();
  };

  const enter = reduceMotion ? undefined : { opacity: 0, y: 8 };

  return (
    <section id={SEARCH_RESULTS_ID} className="search-page" data-region="page" aria-labelledby="search-page-title">
      <Heading level="xl" id="search-page-title" className="search-page__heading">
        {cms.pages.navSearch}
      </Heading>
      {field}
      <p role="status" className="sr-only">
        {hasQuery ? cms.ui.searchResultsStatus.replace("{n}", String(all.length)) : ""}
      </p>

      {hasQuery && all.length > 0 && (
        <nav className="search-page__chips hide-scrollbar" aria-label={uiMessage("features.search.filters")}>
          <button
            type="button"
            aria-pressed={effectiveFilter === "all"}
            onClick={() => setFilter("all")}
            className="search-page__chip"
          >
            <Search size={14} aria-hidden="true" />
            <span data-slot="label">{uiMessage("components.shared.search-overlay.tutto-371aa077")}</span>
            <span data-slot="count">{all.length}</span>
          </button>
          {groups.map(([type, items]) => {
            const Icon = TYPE_ICONS[type];
            return (
              <button
                key={type}
                type="button"
                aria-pressed={effectiveFilter === type}
                onClick={() => setFilter(type)}
                className="search-page__chip"
                data-type={type}
              >
                <Icon size={14} aria-hidden="true" />
                <span data-slot="label">{labels[type]}</span>
                <span data-slot="count">{items.length}</span>
              </button>
            );
          })}
        </nav>
      )}

      {hasQuery && all.length === 0 && (
        <p className="search-page__empty">{cms.pages.searchNoResults.replace("{query}", query.trim())}</p>
      )}

      {hasQuery && all.length > 0 ? (
        <section
          ref={listRef}
          aria-label={uiMessage("components.shared.search-overlay.results")}
          className="search-page__results"
          onKeyDown={onListKeyDown}
        >
          {visibleGroups.map(({ type, items, total }) => {
            const Icon = TYPE_ICONS[type];
            const headingId = `search-group-${type}`;
            return (
              <motion.section
                key={type}
                aria-labelledby={headingId}
                className="search-page__group"
                data-type={type}
                initial={enter}
                animate={{ opacity: 1, y: 0 }}
                transition={motionSpring.standard}
              >
                <h2 id={headingId} className="search-page__group-title">
                  <Icon size={14} aria-hidden="true" />
                  <span data-slot="label">{labels[type]}</span>
                  <span data-slot="count">{total}</span>
                </h2>
                <ul className="search-page__list">
                  {items.map((item) => (
                    <li key={item.id}>
                      <Link to={item.link} onClick={() => onSelect()} className="search-page__item">
                        {item.photo && (
                          <ImageWithFallback
                            src={item.photo}
                            alt=""
                            className="search-page__photo"
                            loading="lazy"
                            sizes={IMAGE_SIZES.thumb}
                          />
                        )}
                        <span className="search-page__text">
                          <strong className="search-page__title">
                            <Highlight text={item.title} query={query} />
                          </strong>
                          {item.subtitle && (
                            <small className="search-page__subtitle">
                              <Highlight text={item.subtitle} query={query} />
                            </small>
                          )}
                        </span>
                        <CornerDownLeft size={14} aria-hidden="true" className="search-page__enter" />
                      </Link>
                    </li>
                  ))}
                </ul>
                {effectiveFilter === "all" && total > items.length && (
                  <button type="button" className="search-page__more" onClick={() => setFilter(type)}>
                    {uiMessage("features.search.showAll", [total])}
                  </button>
                )}
              </motion.section>
            );
          })}
        </section>
      ) : (
        <section className="search-page__suggestions" aria-labelledby="search-suggestions-title">
          <h2 id="search-suggestions-title" className="search-page__suggestions-title">
            {cms.pages.searchSuggestions}
          </h2>
          <ul className="search-page__tags">
            {QUICK_TAG_KEYS.map((key) => {
              const tag = uiMessage(key);
              return (
                <li key={key}>
                  <button type="button" className="search-page__tag" onClick={() => onQueryChange(tag)}>
                    {tag}
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </section>
  );
}
