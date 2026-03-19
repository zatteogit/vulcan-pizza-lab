/* === SEARCH OVERLAY — VPL-072 ===
   Command Palette / Spotlight search (⌘K).
   Full-screen glassmorphism overlay con risultati raggruppati,
   navigazione da tastiera, highlight testo matchato, e animazioni spring.
   Cerca in: stili, glossario, problemi, guide, farine. */

import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router";
import {
  Search,
  X,
  BookOpen,
  AlertTriangle,
  ChefHat,
  Wheat,
  ArrowLeft,
  CornerDownLeft,
  CircleDot,
} from "lucide-react";
import { STYLES_DB, PIZZA_FAMILIES } from "./pizza-engine";
import { GLOSSARY_TERMS, getLocalizedTerm } from "./glossary-data";
import { ISSUES_DB, getLocalizedIssue } from "./troubleshooting-data";
import { PRE_FERMENT_DB } from "./pre-ferment-guide";
import { FLOURS_DB } from "./flour-database";
import { STYLE_PHOTOS } from "./recommended-styles";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { useCms } from "./cms/cms-context";

const FALLBACK =
  "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&q=80";

/* ═══ TYPES ═══ */
type ResultType = "style" | "glossary" | "problem" | "guide" | "flour";

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
  flour: { icon: CircleDot, color: "var(--tertiary)" },
  glossary: { icon: BookOpen, color: "var(--cta)" },
  problem: { icon: AlertTriangle, color: "var(--tertiary)" },
  guide: { icon: Wheat, color: "var(--secondary)" },
};

function getCategoryLabels(pages: any): Record<ResultType, string> {
  return {
    style: pages?.searchCatStyles || "Stili",
    flour: pages?.searchCatFlours || "Farine",
    glossary: pages?.searchCatGlossary || "Glossario",
    problem: pages?.searchCatProblems || "Problemi",
    guide: pages?.searchCatGuides || "Guide",
  };
}

/* Deterministic group order */
const GROUP_ORDER: ResultType[] = [
  "style",
  "flour",
  "glossary",
  "guide",
  "problem",
];

const QUICK_TAGS = [
  "Napoletana",
  "Teglia",
  "Caputo",
  "Idratazione",
  "Lievito madre",
  "Detroit",
  "Focaccia",
  "Bonci",
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
  if (!query || query.length < 2) return <span>{text}</span>;

  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase().trim();
  const idx = lowerText.indexOf(lowerQuery);
  if (idx === -1) return <span>{text}</span>;

  const before = text.slice(0, idx);
  const match = text.slice(idx, idx + lowerQuery.length);
  const after = text.slice(idx + lowerQuery.length);

  return (
    <span>
      {before}
      <span
        style={{
          color: color || "var(--primary)",
          fontWeight: "var(--weight-semibold)" as any,
        }}
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
    grano_tenero: pages?.searchFlourWheat || "Grano tenero",
    manitoba: pages?.searchFlourManitoba || "Manitoba",
    semola: pages?.searchFlourSemola || "Semola",
    integrale: pages?.searchFlourWholegrain || "Integrale",
    gluten_free: pages?.searchFlourGlutenFree || "Senza glutine",
    speciale: pages?.searchFlourSpecial || "Speciale",
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
    const searchText =
      `${style.name} ${style.id} ${familyName} ${cmsDesc}`.toLowerCase();
    if (searchText.includes(q)) {
      hits.push({
        id: `style-${style.id}`,
        type: "style",
        title: style.name,
        subtitle: familyName,
        link: `/recipe/${style.id}`,
        photo: STYLE_PHOTOS[style.id] || FALLBACK,
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
        subtitle: `${flour.producer} · W${flour.w} · ${flour.proteine_pct}% prot · ${catLabel}`,
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
  const { cms } = useCms();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  /* Reset on open */
  useEffect(() => {
    if (open) {
      setQuery("");
      setActiveIndex(0);
      requestAnimationFrame(() => {
        inputRef.current?.focus();
      });
    }
  }, [open]);

  /* Results */
  const results = useMemo(() => buildResults(query, cms), [query, cms]);

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
        case "Escape":
          e.preventDefault();
          onClose();
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
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "center",
            paddingTop: "min(12vh, 80px)",
          }}
          onKeyDown={handleKeyDown}
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={onClose}
            style={{
              position: "fixed",
              inset: 0,
              background:
                "color-mix(in srgb, var(--container-page) 65%, rgba(0,0,0,0))",
              backdropFilter: "blur(20px) saturate(1.4)",
              WebkitBackdropFilter: "blur(20px) saturate(1.4)",
            }}
          />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
            className="relative w-full mx-4 sm:mx-0 overflow-hidden"
            style={{
              maxWidth: 640,
              maxHeight: "min(70vh, 560px)",
              display: "flex",
              flexDirection: "column",
              background: "var(--container-bg-low)",
              border: "1px solid var(--container-border)",
              borderRadius: 20,
              boxShadow:
                "0 24px 80px -12px rgba(0,0,0,0.25), 0 0 0 1px rgba(0,0,0,0.04)",
            }}
          >
            {/* Search input row */}
            <div
              className="flex items-center gap-3 px-5"
              style={{
                height: 60,
                borderBottom: "1px solid var(--container-border-subtle)",
                flexShrink: 0,
              }}
            >
              {/* M3 Search view: leading back arrow dismisses the search */}
              <motion.button
                onClick={onClose}
                className="flex items-center justify-center rounded-full active:scale-95"
                style={{
                  width: 40,
                  height: 40,
                  flexShrink: 0,
                  color: "var(--text-default)",
                  background: "rgba(0,0,0,0)",
                  border: "none",
                  cursor: "pointer",
                  marginLeft: -8,
                }}
                aria-label={cms.pages.searchCloseLabel}
              >
                <ArrowLeft size={20} />
              </motion.button>
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setActiveIndex(0);
                }}
                placeholder={cms.pages.searchPlaceholder}
                className="flex-1"
                style={{
                  background: "rgba(0,0,0,0)",
                  border: "none",
                  outline: "none",
                  color: "var(--text-default)",
                  fontSize: "var(--font-size-xl)",
                  fontFamily: "var(--font-body)",
                }}
                aria-label={cms.pages.searchFieldLabel}
                autoComplete="off"
                autoCorrect="off"
                spellCheck={false}
              />
              {query ? (
                <motion.button
                  initial={{ opacity: 0, scale: 0.7 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 28 }}
                  onClick={() => {
                    setQuery("");
                    inputRef.current?.focus();
                  }}
                  className="p-1.5 rounded-lg active:scale-95"
                  style={{
                    color: "var(--text-muted)",
                    background: "var(--container-bg)",
                    flexShrink: 0,
                  }}
                  aria-label={cms.pages.searchClearLabel}
                >
                  <X size={14} />
                </motion.button>
              ) : (
                null
              )}
            </div>

            {/* Results area */}
            <div
              ref={listRef}
              className="flex-1 overflow-y-auto"
              style={{ overscrollBehavior: "contain" }}
            >
              <AnimatePresence mode="wait">
                {hasQuery && results.length === 0 ? (
                  /* No results */
                  <motion.div
                    key="no-results"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    className="flex flex-col items-center justify-center py-12 px-6"
                  >
                    <Search
                      size={32}
                      style={{ color: "var(--text-muted)", opacity: 0.3 }}
                    />
                    <p
                      className="font-serif italic mt-3"
                      style={{
                        fontSize: "var(--font-size-xl)",
                        color: "var(--text-muted)",
                        opacity: 0.65,
                        textAlign: "center",
                      }}
                    >
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
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    className="py-2"
                  >
                    {groupedResults.map(([type, items]) => {
                      const iconMeta = TYPE_ICONS[type as ResultType];
                      if (!iconMeta) return null;
                      const catLabels = getCategoryLabels(cms.pages);
                      const Icon = iconMeta.icon;
                      const catLabel = catLabels[type as ResultType] || type;
                      return (
                        <div key={type} className="mb-1">
                          {/* Group header */}
                          <div
                            className="flex items-center gap-2 px-5 py-2"
                            style={{ opacity: 0.7 }}
                          >
                            <Icon size={12} style={{ color: iconMeta.color }} />
                            <span
                              style={{
                                fontSize: "0.6875rem",
                                fontFamily: "var(--font-mono)",
                                color: iconMeta.color,
                                textTransform: "uppercase",
                                letterSpacing: "0.12em",
                              }}
                            >
                              {catLabel}
                            </span>
                            <span
                              style={{
                                fontSize: "0.625rem",
                                fontFamily: "var(--font-mono)",
                                color: "var(--text-muted)",
                                opacity: 0.5,
                                fontFeatureSettings: "'tnum'",
                              }}
                            >
                              {items.length}
                            </span>
                          </div>

                          {/* Items */}
                          {items.map((item) => {
                            flatIdx++;
                            const idx = flatIdx;
                            const isActive = idx === activeIndex;
                            return (
                              <div
                                key={item.id}
                                data-index={idx}
                                role="option"
                                aria-selected={isActive}
                                onClick={() => handleSelect(item.link)}
                                onMouseEnter={() => setActiveIndex(idx)}
                                className="flex items-center gap-3 mx-2 px-3 py-2.5 rounded-xl cursor-pointer active:scale-[0.98] transition-transform"
                                style={{
                                  background: isActive
                                    ? "color-mix(in srgb, var(--primary) 8%, rgba(0,0,0,0))"
                                    : "rgba(0,0,0,0)",
                                  transition: "background 0.1s ease",
                                }}
                              >
                                {item.photo && (
                                  <ImageWithFallback
                                    src={item.photo}
                                    alt=""
                                    className="flex-shrink-0 rounded-lg"
                                    style={{
                                      width: 40,
                                      height: 40,
                                      objectFit: "cover",
                                    }}
                                    loading="lazy"
                                  />
                                )}
                                <div className="flex-1 min-w-0">
                                  <div
                                    style={{
                                      fontSize: "var(--font-size-base)",
                                      fontWeight:
                                        "var(--weight-medium)" as any,
                                      color: isActive
                                        ? "var(--primary)"
                                        : "var(--text-default)",
                                      transition: "color 0.1s ease",
                                    }}
                                  >
                                    <Highlight
                                      text={item.title}
                                      query={trimmedQuery}
                                      color={
                                        isActive
                                          ? undefined
                                          : "var(--primary)"
                                      }
                                    />
                                  </div>
                                  <div
                                    className="type-data"
                                    style={{
                                      fontSize: "var(--font-size-sm)",
                                      color: "var(--text-muted)",
                                      overflow: "hidden",
                                      textOverflow: "ellipsis",
                                      whiteSpace: "nowrap",
                                    }}
                                  >
                                    <Highlight
                                      text={item.subtitle}
                                      query={trimmedQuery}
                                      color="var(--primary)"
                                    />
                                  </div>
                                </div>
                                {isActive && (
                                  <CornerDownLeft
                                    size={14}
                                    style={{
                                      color: "var(--primary)",
                                      flexShrink: 0,
                                      opacity: 0.6,
                                    }}
                                  />
                                )}
                              </div>
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
                    transition={{
                      type: "spring",
                      stiffness: 400,
                      damping: 30,
                      delay: 0.05,
                    }}
                    className="px-5 py-5"
                  >
                    <p
                      style={{
                        fontSize: "0.6875rem",
                        fontFamily: "var(--font-body)",
                        color: "var(--text-muted)",
                        textTransform: "uppercase",
                        letterSpacing: "0.12em",
                        marginBottom: 10,
                        opacity: 0.6,
                      }}
                    >
                      {cms.pages.searchSuggestions}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {QUICK_TAGS.map((tag) => (
                        <motion.button
                          key={tag}
                          onClick={() => {
                            setQuery(tag);
                            setActiveIndex(0);
                          }}
                          className="px-3 py-1.5 rounded-lg active:scale-95"
                          style={{
                            background: "var(--container-bg)",
                            border:
                              "1px solid var(--container-border-subtle)",
                            color: "var(--text-muted)",
                            fontSize: "var(--font-size-sm)",
                            fontFamily: "var(--font-body)",
                            cursor: "pointer",
                          }}
                          whileHover={{
                            borderColor: "var(--primary)",
                            color: "var(--primary)",
                          }}
                        >
                          {tag}
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Footer — keyboard hints */}
            <div
              className="flex items-center justify-between px-5 py-3"
              style={{
                borderTop: "1px solid var(--container-border-subtle)",
                flexShrink: 0,
              }}
            >
              <p
                className="font-serif italic"
                style={{
                  fontSize: "var(--font-size-sm)",
                  color: "var(--text-muted)",
                  opacity: 0.65,
                }}
              >
                {cms.pages.searchHint}
              </p>
              <div className="flex items-center gap-2">
                <span
                  className="flex items-center gap-1"
                  style={{
                    fontSize: "var(--font-size-sm)",
                    color: "var(--text-muted)",
                    opacity: 0.65,
                  }}
                >
                  <ArrowLeft size={14} />
                  <ArrowLeft size={14} />
                </span>
                <span
                  className="flex items-center gap-1"
                  style={{
                    fontSize: "var(--font-size-sm)",
                    color: "var(--text-muted)",
                    opacity: 0.65,
                  }}
                >
                  <ArrowLeft size={14} />
                </span>
                <span
                  className="flex items-center gap-1"
                  style={{
                    fontSize: "var(--font-size-sm)",
                    color: "var(--text-muted)",
                    opacity: 0.65,
                  }}
                >
                  <X size={14} />
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return createPortal(overlay, document.body);
}