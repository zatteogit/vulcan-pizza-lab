/* === SEARCH OVERLAY — VPL-072 ===
   Command Palette / Spotlight search (⌘K).
   Full-screen glassmorphism overlay con risultati raggruppati,
   navigazione da tastiera, highlight testo matchato, e animazioni spring.
   Cerca in: stili, glossario, problemi, guide, farine. */

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
X
} from "lucide-react";
import { AnimatePresence,motion } from "motion/react";
import { useCallback,useEffect,useMemo,useRef,useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router";
import { useCms } from "../../features/cms/cms-context";
import { ImageWithFallback } from "../media/ImageWithFallback";
import { FLOURS_DB } from "../../data/flour-database";
import { GLOSSARY_TERMS,getLocalizedTerm } from "../../data/glossary-data";
import { formatOrigin,PIZZA_FAMILIES,STYLES_DB } from "../../domain/pizza-engine";
import { PRE_FERMENT_DB } from "../../features/recipe/pre-ferment-guide";
import { STYLE_PHOTOS } from "../../features/recipe/recommended-styles";
import { SIGNATURE_RECIPES } from "../../data/signature-recipes";
import { TOPPING_CONCEPTS, getVariantsForConcept } from "../../data/topping-library";
import { ISSUES_DB,getLocalizedIssue } from "../../data/troubleshooting-data";
import { useIsMobile } from "../../hooks/use-mobile";
import { motionDelay,motionSpring,motionTiming } from "../ds/motion";
import { useDialogFocus } from "../ds/use-dialog-focus";
import { uiMessage } from "../../i18n/ui-messages";

const FALLBACK =
  "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&q=80";

/* ═══ TYPES ═══ */
type ResultType = "style" | "recipe" | "topping" | "glossary" | "problem" | "guide" | "flour";

interface SearchResult {
  id: string;
  type: ResultType;
  title: string;
  subtitle: string;
  link: string;
  photo?: string;
}

const TYPE_ICONS: Record<ResultType, { icon: typeof Search; color: string }> = {
  style: { icon: ChefHat, color: "var(--primary)" },
  recipe: { icon: UtensilsCrossed, color: "var(--primary)" },
  topping: { icon: Pizza, color: "var(--tertiary)" },
  flour: { icon: CircleDot, color: "var(--tertiary)" },
  glossary: { icon: BookOpen, color: "var(--cta)" },
  problem: { icon: AlertTriangle, color: "var(--tertiary)" },
  guide: { icon: Wheat, color: "var(--secondary)" },
};

function getCategoryLabels(pages: any): Record<ResultType, string> {
  return {
    style: pages?.searchCatStyles || uiMessage("components.shared.search-overlay.stili-ad1a9b2f"),
    recipe: pages?.searchCatRecipes || uiMessage("components.shared.search-overlay.ricette-c46b30c8"),
    topping: pages?.searchCatToppings || uiMessage("components.shared.search-overlay.condimenti-fc3218d7"),
    flour: pages?.searchCatFlours || uiMessage("components.shared.search-overlay.category.flours"),
    glossary: pages?.searchCatGlossary || uiMessage("components.shared.search-overlay.category.glossary"),
    problem: pages?.searchCatProblems || uiMessage("components.shared.search-overlay.category.problems"),
    guide: pages?.searchCatGuides || uiMessage("components.shared.search-overlay.category.guides"),
  };
}

/* Deterministic group order */
const GROUP_ORDER: ResultType[] = [
  "style",
  "recipe",
  "topping",
  "flour",
  "glossary",
  "guide",
  "problem",
];

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

/* ═══ HIGHLIGHT COMPONENT ═══ */
function Highlight({
  text,
  query,
  color,
}: {
  text: string;
  query: string;
  color?: string;
}) {
  if (!query || query.length < 2) return <span data-slot="term">{text}</span>;

  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase().trim();
  const idx = lowerText.indexOf(lowerQuery);
  if (idx === -1) return <span data-slot="term">{text}</span>;

  const before = text.slice(0, idx);
  const match = text.slice(idx, idx + lowerQuery.length);
  const after = text.slice(idx + lowerQuery.length);

  return (
    <span data-slot="term">
      {before}
      <span
        className="search-overlay-x__highlight"
        style={{ ["--tone" as any]: color || "var(--primary)" }}
      >
        {match}
      </span>
      {after}
    </span>
  );
}

/* ═══ FLOUR CATEGORY LABELS (CMS-driven) ═══ */
function getFlourCatLabels(pages: any): Record<string, string> {
  return {
    grano_tenero: pages?.searchFlourWheat || uiMessage("components.shared.search-overlay.flour.wheat"),
    manitoba: pages?.searchFlourManitoba || uiMessage("components.shared.search-overlay.flour.manitoba"),
    semola: pages?.searchFlourSemola || uiMessage("components.shared.search-overlay.flour.semola"),
    integrale: pages?.searchFlourWholegrain || uiMessage("components.shared.search-overlay.flour.wholegrain"),
    gluten_free: pages?.searchFlourGlutenFree || uiMessage("components.shared.search-overlay.flour.glutenFree"),
    speciale: pages?.searchFlourSpecial || uiMessage("components.shared.search-overlay.flour.special"),
  };
}

/* ═══ SEARCH LOGIC ═══ */
function buildResults(query: string, cms: any): SearchResult[] {
  const q = query.toLowerCase().trim();
  if (!q || q.length < 2) return [];

  const hits: SearchResult[] = [];
  const flourCat = getFlourCatLabels(cms.pages);

  /* Styles */
  for (const style of Object.values(STYLES_DB) as any[]) {
    const familyName =
      cms.families?.[style.family]?.name ||
      PIZZA_FAMILIES[style.family as keyof typeof PIZZA_FAMILIES]?.name ||
      "";
    const cmsDesc = cms.styleDescriptions?.[style.id] || "";
    // origin indicizzato (lug 2026): fa emergere ricerche per luogo/maestro
    // es. "Gabriele Bonci", "Napoli", "Genova" su tutti gli stili.
    const searchText =
      `${style.name} ${style.id} ${familyName} ${formatOrigin(style.origin)} ${cmsDesc}`.toLowerCase();
    if (searchText.includes(q)) {
      hits.push({
        id: `style-${style.id}`,
        type: "style",
        title: style.name,
        subtitle: familyName,
        link: `/recipe/${style.id}?mode=canonical`,
        photo: STYLE_PHOTOS[style.id] || FALLBACK,
      });
    }
  }

  /* Signature recipes (ricette iconiche) — deep-link a stile + condimento */
  for (const rec of SIGNATURE_RECIPES) {
    const styleName = STYLES_DB[rec.style_id]?.name ?? "";
    const searchText =
      `${rec.name} ${rec.description} ${styleName} ${rec.topping_concept_id} ${(rec.occasion_tags || []).join(" ")}`.toLowerCase();
    if (searchText.includes(q)) {
      hits.push({
        id: `recipe-${rec.id}`,
        type: "recipe",
        title: rec.name,
        subtitle: styleName,
        link: `/recipe/${rec.style_id}?mode=canonical&tab=condimento&topping=${rec.topping_concept_id}`,
        photo: rec.photo || STYLE_PHOTOS[rec.style_id] || FALLBACK,
      });
    }
  }

  /* Topping concepts (condimenti & farciture) — es. "boscaiola", "diavola" */
  for (const concept of Object.values(TOPPING_CONCEPTS) as any[]) {
    const searchText =
      `${concept.name} ${concept.description} ${concept.id} ${(concept.occasions || []).join(" ")}`.toLowerCase();
    if (searchText.includes(q)) {
      const variants = getVariantsForConcept(concept.id);
      const targetStyle = variants[0]?.preferred_for_styles?.[0] ?? "napoletana_stg";
      hits.push({
        id: `topping-${concept.id}`,
        type: "topping",
        title: concept.name,
        subtitle:
          concept.description.slice(0, 70) +
          (concept.description.length > 70 ? "…" : ""),
        link: `/recipe/${targetStyle}?mode=canonical&tab=condimento&topping=${concept.id}`,
      });
    }
  }

  /* Flours */
  for (const flour of FLOURS_DB) {
    const searchText =
      `${flour.name} ${flour.producer} ${flour.category} ${flour.note} farina tipo 00 tipo 0 tipo 1 tipo 2`.toLowerCase();
    if (searchText.includes(q)) {
      const catLabel = flourCat[flour.category] || flour.category;
      hits.push({
        id: `flour-${flour.id}`,
        type: "flour",
        title: flour.name,
        subtitle: uiMessage("components.shared.search-overlay.value-w-value-value-prot-value-98984423", [flour.producer, flour.w, flour.proteine_pct, catLabel]),
        link: `/profile`,
      });
    }
  }

  /* Glossary */
  for (const rawTerm of GLOSSARY_TERMS) {
    const term = getLocalizedTerm(rawTerm, cms);
    const searchText =
      `${term.name} ${term.definition} ${term.symbol || ""} ${term.id}`.toLowerCase();
    if (searchText.includes(q)) {
      hits.push({
        id: `glossary-${term.id}`,
        type: "glossary",
        title: term.symbol ? `${term.name} (${term.symbol})` : term.name,
        subtitle:
          term.definition.slice(0, 80) +
          (term.definition.length > 80 ? "\u2026" : ""),
        link: `/learn/glossary#${term.id}`,
      });
    }
  }

  /* Troubleshooting */
  for (const rawItem of ISSUES_DB) {
    const item = getLocalizedIssue(rawItem, cms);
    const searchText =
      `${item.symptom} ${item.cause} ${item.fixImmediate} ${item.prevention}`.toLowerCase();
    if (searchText.includes(q)) {
      hits.push({
        id: `problem-${item.id}`,
        type: "problem",
        title: item.symptom,
        subtitle:
          item.cause.slice(0, 80) + (item.cause.length > 80 ? "\u2026" : ""),
        link: `/learn/troubleshooting`,
      });
    }
  }

  /* Pre-ferments */
  for (const pf of Object.values(PRE_FERMENT_DB) as any[]) {
    const searchText =
      `${pf.name} ${pf.description} ${pf.idealStyles} pre-fermento prefermento biga poolish autolisi`.toLowerCase();
    if (searchText.includes(q)) {
      hits.push({
        id: `guide-${pf.id}`,
        type: "guide",
        title: `${pf.emoji} ${pf.name}`,
        subtitle:
          pf.description.slice(0, 80) +
          (pf.description.length > 80 ? "\u2026" : ""),
        link: `/learn/pre-ferments`,
      });
    }
  }

  return hits.slice(0, 28);
}

/* ═══ OVERLAY COMPONENT ═══ */
export function SearchOverlay({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const isMobile = useIsMobile();
  const { cms } = useCms();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const [activeFilter, setActiveFilter] = useState<'all' | 'styles' | 'recipes' | 'toppings' | 'articles'>('all');
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  /* Reset on open */
  useEffect(() => {
    if (open) {
      setQuery("");
      setActiveIndex(0);
      setActiveFilter("all");
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const appRoot = document.getElementById("root");
    if (!appRoot) return;
    const wasInert = appRoot.inert;
    const previousAriaHidden = appRoot.getAttribute("aria-hidden");
    appRoot.inert = true;
    appRoot.setAttribute("aria-hidden", "true");
    return () => {
      appRoot.inert = wasInert;
      if (previousAriaHidden === null) appRoot.removeAttribute("aria-hidden");
      else appRoot.setAttribute("aria-hidden", previousAriaHidden);
    };
  }, [open]);

  const panelRef = useDialogFocus<HTMLDivElement>({ open, onClose });

  /* Results */
  const rawResults = useMemo(() => buildResults(query, cms), [query, cms]);

  const results = useMemo(() => {
    if (activeFilter === "all") return rawResults;
    return rawResults.filter((r) => {
      if (activeFilter === "styles") return r.type === "style";
      if (activeFilter === "recipes") return r.type === "recipe";
      if (activeFilter === "toppings") return r.type === "topping";
      if (activeFilter === "articles")
        return r.type === "glossary" || r.type === "problem" || r.type === "guide" || r.type === "flour";
      return false;
    });
  }, [rawResults, activeFilter]);

  const handleFilterClick = (filterId: typeof activeFilter) => {
    setActiveFilter(filterId);
    setActiveIndex(0);
  };

  const filterOptions = [
    { id: "all", label: uiMessage("components.shared.search-overlay.tutto-371aa077"), icon: Search },
    { id: "styles", label: uiMessage("components.shared.search-overlay.stili-ad1a9b2f"), icon: ChefHat },
    { id: "recipes", label: uiMessage("components.shared.search-overlay.ricette-c46b30c8"), icon: UtensilsCrossed },
    { id: "toppings", label: uiMessage("components.shared.search-overlay.condimenti-fc3218d7"), icon: Pizza },
    { id: "articles", label: uiMessage("components.shared.search-overlay.teoria-b97a6296"), icon: BookOpen },
  ] as const;

  /* Grouped + ordered for display */
  const groupedResults = useMemo(() => {
    const groups: Record<string, SearchResult[]> = {};
    for (const r of results) {
      if (!groups[r.type]) groups[r.type] = [];
      groups[r.type].push(r);
    }
    /* Return entries in deterministic order */
    const ordered: [string, SearchResult[]][] = [];
    for (const type of GROUP_ORDER) {
      if (groups[type]) ordered.push([type, groups[type]]);
    }
    return ordered;
  }, [results]);

  /* Clamp active index */
  useEffect(() => {
    if (activeIndex >= results.length) {
      setActiveIndex(Math.max(0, results.length - 1));
    }
  }, [results.length, activeIndex]);

  /* Scroll active item into view */
  useEffect(() => {
    if (!listRef.current) return;
    const el = listRef.current.querySelector(`[data-index="${activeIndex}"]`);
    if (el) el.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  const handleSelect = useCallback(
    (link: string) => {
      onClose();
      navigate(link);
    },
    [navigate, onClose],
  );

  /* Keyboard navigation */
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setActiveIndex((prev) =>
            prev < results.length - 1 ? prev + 1 : 0,
          );
          break;
        case "ArrowUp":
          e.preventDefault();
          setActiveIndex((prev) =>
            prev > 0 ? prev - 1 : results.length - 1,
          );
          break;
        case "Enter":
          e.preventDefault();
          if (results[activeIndex]) {
            handleSelect(results[activeIndex].link);
          }
          break;
      }
    },
    [results, activeIndex, handleSelect, onClose],
  );

  const hasQuery = query.trim().length >= 2;
  const trimmedQuery = query.trim();

  /* Track flat index across groups */
  let flatIdx = -1;

  const overlay = (
    <AnimatePresence>
      {open && (
        <div
          data-region="overlay"
          className={`search-overlay-x${isMobile ? " search-overlay-x--mobile" : ""}`}
          onKeyDown={handleKeyDown}
        >
          {/* Backdrop */}
          <motion.button
            type="button"
            aria-label={cms.pages.searchCloseLabel}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={motionTiming.feedback}
            onClick={onClose}
            className="search-overlay-x__backdrop border-0 p-0"
          />

          {/* Panel */}
          <motion.div
            ref={panelRef}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-label={cms.pages.searchFieldLabel}
            initial={{ opacity: 0, y: 60, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            transition={motionSpring.highlightedMatch}
            className={`search-overlay-x__panel${isMobile ? " search-overlay-x__panel--mobile" : ""}`}
          >
            {/* Search input row */}
            <div className="search-overlay-x__input-row">
              {/* Icona lente statica a sinistra */}
              <Search size={20} className="search-overlay-x__search-icon" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setActiveIndex(0);
                }}
                placeholder={cms.pages.searchPlaceholder}
                className="search-overlay-x__input"
                aria-label={cms.pages.searchFieldLabel}
                autoComplete="off"
                autoCorrect="off"
                spellCheck={false}
                role="combobox"
                aria-autocomplete="list"
                aria-controls="search-results-listbox"
                aria-expanded={hasQuery && results.length > 0}
                aria-activedescendant={
                  hasQuery && results[activeIndex]
                    ? `search-result-${results[activeIndex].id}`
                    : undefined
                }
              />
              <div className="search-overlay-x__input-actions">
                {query && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.7 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={motionSpring.crispDisclosure}
                    onClick={() => {
                      setQuery("");
                      inputRef.current?.focus();
                    }}
                    className="search-overlay-x__clear-btn"
                    aria-label={cms.pages.searchClearLabel}
                  >
                    <X size={14} />
                  </motion.button>
                )}
                <button
                  onClick={onClose}
                  className="search-overlay-x__cancel-btn"
                  aria-label={cms.pages.searchCloseLabel}
                >
                  {cms.ui.cancel}
                </button>
              </div>
            </div>

            {/* Filter pills bar (directly below input) */}
            <div className="search-overlay-x__filter-bar hide-scrollbar">
              {filterOptions.map((opt) => {
                const Icon = opt.icon;
                const isActive = activeFilter === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => handleFilterClick(opt.id)}
                    className={`search-overlay-x__filter-btn${isActive ? " search-overlay-x__filter-btn--active" : ""}`}
                    aria-label={opt.id === "all" ? uiMessage("components.shared.search-overlay.mostra-tutto-d72ef3ee") : uiMessage("components.shared.search-overlay.filtra-per-value-7dca99ea", [opt.label])}
                  >
                    <Icon size={12} />
                    <span data-slot="label">{opt.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Results area */}
            <div
              ref={listRef}
              id="search-results-listbox"
              role={hasQuery && results.length > 0 ? "listbox" : undefined}
              aria-label={hasQuery && results.length > 0
                ? uiMessage("components.shared.search-overlay.results")
                : undefined}
              className="search-overlay-x__results"
            >
              <AnimatePresence mode="wait">
                {hasQuery && results.length === 0 ? (
                  /* No results */
                  <motion.div
                    key="no-results"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={motionSpring.standard}
                    className="search-overlay-x__empty"
                  >
                    <Search size={32} className="search-overlay-x__empty-icon" />
                    <p className="search-overlay-x__empty-text">
                      {cms.pages.searchNoResults.replace("{query}", query)}
                    </p>
                  </motion.div>
                ) : hasQuery ? (
                  /* Grouped results */
                  <motion.div
                    key="results"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={motionSpring.standard}
                    className="search-overlay-x__results-list"
                  >
                    {groupedResults.map(([type, items]) => {
                      const iconMeta = TYPE_ICONS[type as ResultType];
                      if (!iconMeta) return null;
                      const catLabels = getCategoryLabels(cms.pages);
                      const Icon = iconMeta.icon;
                      const catLabel = catLabels[type as ResultType] || type;
                      return (
                        <div key={type} className="search-overlay-x__group">
                          {/* Group header */}
                          <div
                            className="search-overlay-x__group-header"
                            style={{ ["--tone" as any]: iconMeta.color }}
                          >
                            <Icon size={12} className="search-overlay-x__group-icon" />
                            <span className="search-overlay-x__group-label">
                              {catLabel}
                            </span>
                            <span className="search-overlay-x__group-count">
                              {items.length}
                            </span>
                          </div>

                          {/* Items */}
                          {items.map((item) => {
                            flatIdx++;
                            const idx = flatIdx;
                            const isActive = idx === activeIndex;
                            return (
                              <button
                                key={item.id}
                                id={`search-result-${item.id}`}
                                type="button"
                                role="option"
                                aria-selected={isActive}
                                tabIndex={-1}
                                data-index={idx}
                                onClick={() => handleSelect(item.link)}
                                onMouseEnter={() => setActiveIndex(idx)}
                                className={`search-overlay-x__item border-0 text-left${isActive ? " search-overlay-x__item--active" : ""}`}
                              >
                                {item.photo && (
                                  <ImageWithFallback
                                    src={item.photo}
                                    alt=""
                                    className="search-overlay-x__item-photo"
                                    loading="lazy"
                                  />
                                )}
                                <span className="search-overlay-x__item-body">
                                  <span className="search-overlay-x__item-title">
                                    <Highlight
                                      text={item.title}
                                      query={trimmedQuery}
                                      color={
                                        isActive
                                          ? undefined
                                          : "var(--primary)"
                                      }
                                    />
                                  </span>
                                  <span className="type-data search-overlay-x__item-subtitle">
                                    <Highlight
                                      text={item.subtitle}
                                      query={trimmedQuery}
                                      color="var(--primary)"
                                    />
                                  </span>
                                </span>
                                {isActive && (
                                  <CornerDownLeft
                                    size={14}
                                    className="search-overlay-x__item-enter-icon"
                                  />
                                )}
                              </button>
                            );
                          })}
                        </div>
                      );
                    })}
                  </motion.div>
                ) : (
                  /* Empty state — quick tags */
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ ...motionSpring.standard,delay: motionDelay.short }}
                    className="search-overlay-x__suggestions"
                  >
                    <p className="search-overlay-x__suggestions-label">
                      {cms.pages.searchSuggestions}
                    </p>
                    <div className="search-overlay-x__suggestions-list">
                      {QUICK_TAG_KEYS.map((key) => {
                        const tag = uiMessage(key);
                        return (
                        <motion.button
                          key={key}
                          onClick={() => {
                            setQuery(tag);
                            setActiveIndex(0);
                          }}
                          className="search-overlay-x__quick-tag"
                          whileHover={{
                            borderColor: "var(--primary)",
                            color: "var(--primary)",
                          }}
                        >
                          {tag}
                        </motion.button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>


          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return createPortal(overlay, document.body);
}
