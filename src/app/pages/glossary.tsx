import {
BookOpen,
ChevronDown,
Search,
} from "lucide-react";
import { AnimatePresence,motion } from "motion/react";
import { useEffect,useMemo,useState } from "react";
import { useLocation } from "react-router";
import { useCms } from "../features/cms/cms-context";
import { t } from "../features/cms/i18n";
import { FilterChip } from "../components/ds/index";
import { SubPageHeader } from "../components/shared/sub-page-header";
import type {
GlossaryCategory,
GlossaryTerm,
} from "../data/glossary-data";
import {
GLOSSARY_CATEGORIES,
GLOSSARY_TERMS,
getTermById,
getTermsByCategory,
} from "../data/glossary-data";

export function GlossaryPage() {
  const location = useLocation();
  const { cms } = useCms();
  const gl = cms.glossary;
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<
    GlossaryCategory | "all"
  >("all");
  const [expandedTerm, setExpandedTerm] = useState<
    string | null
  >(null);

  const termsByCategory = useMemo(
    () => getTermsByCategory(cms),
    [cms],
  );

  /* Deeplink: auto-expand and scroll to term from hash (e.g. /glossary#w_alveograph) */
  useEffect(() => {
    const hash = location.hash.replace("#", "");
    if (hash) {
      const term = getTermById(hash, cms);
      if (term) {
        setExpandedTerm(hash);
        setActiveCategory("all");
        setSearch("");
        /* Wait for render, then scroll */
        requestAnimationFrame(() => {
          const el = document.getElementById(
            `glossary-${hash}`,
          );
          if (el)
            el.scrollIntoView({
              behavior: "smooth",
              block: "center",
            });
        });
      }
    }
  }, [location.hash, cms]);

  const filteredTerms = useMemo(() => {
    let terms =
      activeCategory === "all"
        ? GLOSSARY_TERMS
        : GLOSSARY_TERMS.filter(
            (t) => t.category === activeCategory,
          );

    if (search.trim()) {
      const q = search.toLowerCase().trim();
      terms = terms.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.definition.toLowerCase().includes(q) ||
          (t.symbol && t.symbol.toLowerCase().includes(q)) ||
          t.id.includes(q),
      );
    }
    return terms;
  }, [activeCategory, search]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {
      all: GLOSSARY_TERMS.length,
    };
    for (const t of GLOSSARY_TERMS) {
      counts[t.category] = (counts[t.category] || 0) + 1;
    }
    return counts;
  }, []);

  const handleNavigateToTerm = (termId: string) => {
    setExpandedTerm(termId);
    setActiveCategory("all");
    setSearch("");
    requestAnimationFrame(() => {
      const el = document.getElementById(`glossary-${termId}`);
      if (el)
        el.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
    });
  };

  return (
    <div
      className="min-h-screen"
      style={{
        background: "var(--container-page)",
        color: "var(--text-default)",
      }}
    >
      {/* ── Header — pattern condiviso delle sotto-pagine ── */}
      <SubPageHeader
        backTo="/learn"
        backLabel={cms.pages.navLearn}
        icon={<BookOpen size={16} />}
        title={gl.pageTitle}
        meta={
          <span
            style={{
              fontSize: "var(--font-size-sm)",
              color: "var(--text-muted)",
              fontFeatureSettings: "'tnum'",
              letterSpacing: "0.04em",
            }}
          >
            {t(gl.termCount, {
              count: String(filteredTerms.length),
            })}
          </span>
        }
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 flex flex-col gap-8">
        {/* ── Search ── */}
        <div className="flex flex-col gap-4">
          <div
            className="flex items-center gap-3 px-4 py-3 rounded-2xl"
            style={{
              background: "var(--surface-container)",
              border: "1px solid var(--outline-variant)",
            }}
          >
            <Search
              size={16}
              style={{
                color: "var(--text-muted)",
                flexShrink: 0,
              }}
            />
            <input
              type="text"
              placeholder={gl.searchPlaceholder}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 bg-transparent outline-none"
              style={{
                color: "var(--text-default)",
                fontSize: "var(--font-size-lg)",
                fontFamily: "var(--font-sans)",
              }}
            />
            {search && (
              <motion.button
                onClick={() => setSearch("")}
                className="px-2 py-0.5 rounded-md active:scale-95"
                style={{
                  fontSize: "var(--font-size-sm)",
                  color: "var(--text-muted)",
                  background: "var(--surface-container-low)",
                }}
              >
                {gl.cancelSearch}
              </motion.button>
            )}
          </div>

          {/* Category chips */}
          <motion.div
            className="flex flex-wrap gap-2"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},
              visible: {
                transition: { staggerChildren: 0.04 },
              },
            }}
          >
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 8, scale: 0.95 },
                visible: { opacity: 1, y: 0, scale: 1 },
              }}
              transition={{
                type: "spring",
                stiffness: 500,
                damping: 28,
              }}
            >
              <FilterChip
                active={activeCategory === "all"}
                onClick={() => setActiveCategory("all")}
                radius="xl"
                count={categoryCounts.all}
              >
                {gl.allCategories}
              </FilterChip>
            </motion.div>
            {(
              Object.entries(GLOSSARY_CATEGORIES) as [
                GlossaryCategory,
                (typeof GLOSSARY_CATEGORIES)[GlossaryCategory],
              ][]
            ).map(([id, meta]) => (
              <motion.div
                key={id}
                variants={{
                  hidden: { opacity: 0, y: 8, scale: 0.95 },
                  visible: { opacity: 1, y: 0, scale: 1 },
                }}
                transition={{
                  type: "spring",
                  stiffness: 500,
                  damping: 28,
                }}
              >
                <FilterChip
                  active={activeCategory === id}
                  onClick={() => setActiveCategory(id)}
                  radius="xl"
                  count={categoryCounts[id] || 0}
                >
                  {meta.emoji && <span>{meta.emoji} </span>}
                  {catLabel(id, gl)}
                </FilterChip>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* ── Terms list ── */}
        {filteredTerms.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <p
              className="font-serif italic"
              style={{
                color: "var(--text-muted)",
                fontSize: "var(--font-size-2xl)",
              }}
            >
              {t(gl.noResults, { query: search })}
            </p>
          </motion.div>
        )}

        {activeCategory === "all" && !search.trim() ? (
          /* Grouped by category when showing all */
          (
            Object.entries(GLOSSARY_CATEGORIES) as [
              GlossaryCategory,
              (typeof GLOSSARY_CATEGORIES)[GlossaryCategory],
            ][]
          ).map(([catId, catMeta]) => {
            const catTerms = termsByCategory[catId];
            if (!catTerms || catTerms.length === 0) return null;
            return (
              <div key={catId} className="flex flex-col gap-3">
                <div className="flex items-center gap-2 mb-1">
                  <span
                    style={{ fontSize: "var(--font-size-2xl)" }}
                  >
                    {catMeta.emoji}
                  </span>
                  <span
                    className="font-serif"
                    style={{
                      fontSize: "var(--font-size-2-5xl)",
                      fontWeight: "var(--weight-bold)" as any,
                      color: "var(--text-default)",
                    }}
                  >
                    {catLabel(catId as GlossaryCategory, gl)}
                  </span>
                  <span
                    style={{
                      fontSize: "var(--font-size-sm)",
                      color: "var(--text-muted)",
                      fontFeatureSettings: "'tnum'",
                    }}
                  >
                    {catTerms.length}
                  </span>
                  <div
                    className="flex-1 h-px ml-2"
                    style={{
                      background: "var(--container-divider)",
                    }}
                  />
                </div>
                <span
                  style={{
                    fontSize: "var(--font-size-md)",
                    color: "var(--text-muted)",
                    marginBottom: 4,
                  }}
                >
                  {catDesc(catId as GlossaryCategory, gl)}
                </span>
                {catTerms.map((term) => (
                  <TermCard
                    key={term.id}
                    term={term}
                    isExpanded={expandedTerm === term.id}
                    onToggle={() =>
                      setExpandedTerm(
                        expandedTerm === term.id
                          ? null
                          : term.id,
                      )
                    }
                    onNavigateToTerm={handleNavigateToTerm}
                  />
                ))}
              </div>
            );
          })
        ) : (
          /* Flat list when filtered */
          <div className="flex flex-col gap-3">
            {filteredTerms.map((term) => (
              <TermCard
                key={term.id}
                term={term}
                isExpanded={expandedTerm === term.id}
                onToggle={() =>
                  setExpandedTerm(
                    expandedTerm === term.id ? null : term.id,
                  )
                }
                onNavigateToTerm={handleNavigateToTerm}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══ HELPERS — CMS CATEGORY LOOKUP ═══ */
type GlossaryCms = {
  catRheology: string;
  catRheologyDesc: string;
  catFermentation: string;
  catFermentationDesc: string;
  catThermal: string;
  catThermalDesc: string;
  catChemistry: string;
  catChemistryDesc: string;
  catMechanics: string;
  catMechanicsDesc: string;
  catScoring: string;
  catScoringDesc: string;
  formulaLabel: string;
  rangesLabel: string;
  whyImportantLabel: string;
  relatedLabel: string;
  [k: string]: string;
};
const CAT_CMS_MAP: Record<
  GlossaryCategory,
  { label: keyof GlossaryCms; desc: keyof GlossaryCms }
> = {
  rheology: { label: "catRheology", desc: "catRheologyDesc" },
  fermentation: {
    label: "catFermentation",
    desc: "catFermentationDesc",
  },
  thermal: { label: "catThermal", desc: "catThermalDesc" },
  chemistry: {
    label: "catChemistry",
    desc: "catChemistryDesc",
  },
  mechanics: {
    label: "catMechanics",
    desc: "catMechanicsDesc",
  },
  scoring: { label: "catScoring", desc: "catScoringDesc" },
};
function catLabel(
  id: GlossaryCategory | string,
  gl: GlossaryCms,
): string {
  const m = CAT_CMS_MAP[id as GlossaryCategory];
  return m
    ? (gl[m.label] as string)
    : (GLOSSARY_CATEGORIES[id as GlossaryCategory]?.label ??
        id);
}
function catDesc(
  id: GlossaryCategory | string,
  gl: GlossaryCms,
): string {
  const m = CAT_CMS_MAP[id as GlossaryCategory];
  return m
    ? (gl[m.desc] as string)
    : (GLOSSARY_CATEGORIES[id as GlossaryCategory]
        ?.description ?? "");
}

/* ═══ TERM CARD ═══ */
function TermCard({
  term,
  isExpanded,
  onToggle,
  onNavigateToTerm,
}: {
  term: GlossaryTerm;
  isExpanded: boolean;
  onToggle: () => void;
  onNavigateToTerm?: (termId: string) => void;
}) {
  const catMeta = GLOSSARY_CATEGORIES[term.category];
  const { cms } = useCms();
  const gl = cms.glossary;

  return (
    <motion.div
      id={`glossary-${term.id}`}
      layout
      className="rounded-2xl overflow-hidden"
      style={{
        background: "var(--surface-container-low)",
        border: `1px solid ${isExpanded ? "var(--primary)" : "var(--outline-variant)"}`,
      }}
      transition={{
        type: "spring",
        stiffness: 400,
        damping: 30,
      }}
    >
      <motion.button
        onClick={onToggle}
        className="w-full flex items-start gap-3 px-4 py-3.5 active:scale-99 text-left"
      >
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
          style={{
            background: isExpanded
              ? "color-mix(in srgb, var(--primary) 15%, var(--surface-container))"
              : "var(--surface-container)",
          }}
        >
          <span style={{ fontSize: "var(--font-size-md)" }}>
            {catMeta.emoji}
          </span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2 flex-wrap">
            <span
              style={{
                fontSize: "var(--font-size-xl)",
                fontWeight: "var(--weight-semibold)" as any,
                color: "var(--text-default)",
              }}
            >
              {term.name}
            </span>
            {term.symbol && (
              <span
                className="font-mono"
                style={{
                  fontSize: "var(--font-size-md)",
                  color: "var(--primary)",
                  letterSpacing: "0.04em",
                }}
              >
                {term.symbol}
              </span>
            )}
            {term.unit && (
              <span
                className="font-mono"
                style={{
                  fontSize: "var(--font-size-sm)",
                  color: "var(--text-muted)",
                }}
              >
                [{term.unit}]
              </span>
            )}
          </div>
          <span
            className={isExpanded ? "" : "line-clamp-2"}
            style={{
              fontSize: "var(--font-size-md)",
              color: "var(--text-secondary)",
              lineHeight: "var(--leading-reading)",
              marginTop: 2,
              display: "block",
            }}
          >
            {term.definition}
          </span>
        </div>

        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{
            type: "spring",
            stiffness: 500,
            damping: 30,
          }}
          className="flex-shrink-0 mt-1"
        >
          <ChevronDown
            size={16}
            style={{ color: "var(--text-muted)" }}
          />
        </motion.div>
      </motion.button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 30,
            }}
            className="overflow-hidden"
          >
            <div
              className="px-4 pb-4 flex flex-col gap-4"
              style={{
                borderTop: "1px solid var(--outline-variant)",
              }}
            >
              {term.formula && (
                <div className="mt-3">
                  <span
                    className="type-label"
                    style={{
                      fontSize: "var(--font-size-xs)",
                      color: "var(--text-muted)",
                      letterSpacing: "0.1em",
                      textTransform: "uppercase" as const,
                    }}
                  >
                    {gl.formulaLabel}
                  </span>
                  <div
                    className="mt-1.5 px-3 py-2 rounded-xl type-nerd"
                    style={{
                      background: "var(--surface-container)",
                      border:
                        "1px solid var(--outline-variant)",
                      fontSize: "var(--font-size-md)",
                      color: "var(--primary)",
                      letterSpacing: "0.02em",
                    }}
                  >
                    {term.formula}
                  </div>
                </div>
              )}

              {term.ranges && term.ranges.length > 0 && (
                <div>
                  <span
                    className="type-label"
                    style={{
                      fontSize: "var(--font-size-xs)",
                      color: "var(--text-muted)",
                      letterSpacing: "0.1em",
                      textTransform: "uppercase" as const,
                    }}
                  >
                    {gl.rangesLabel}
                  </span>
                  <div className="mt-1.5 flex flex-col gap-1">
                    {term.ranges.map((r, i) => (
                      <div
                        key={i}
                        className="flex items-baseline gap-3 px-3 py-1.5 rounded-lg"
                        style={{
                          background:
                            i % 2 === 0
                              ? "var(--surface-container)"
                              : "transparent",
                        }}
                      >
                        <span
                          className="flex-shrink-0"
                          style={{
                            fontSize: "var(--font-size-md)",
                            color: "var(--text-default)",
                            fontFeatureSettings: "'tnum'",
                            minWidth: 80,
                          }}
                        >
                          {r.value}
                        </span>
                        <span
                          style={{
                            fontSize: "var(--font-size-md)",
                            color: "var(--text-secondary)",
                          }}
                        >
                          {r.label}
                        </span>
                        {r.note && (
                          <span
                            className="font-serif italic"
                            style={{
                              fontSize: "var(--font-size-sm)",
                              color: "var(--text-muted)",
                            }}
                          >
                            {"\u2014 "}
                            {r.note}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {term.whyImportant && (
                <div>
                  <span
                    className="type-label"
                    style={{
                      fontSize: "var(--font-size-xs)",
                      color: "var(--text-muted)",
                      letterSpacing: "0.1em",
                      textTransform: "uppercase" as const,
                    }}
                  >
                    {gl.whyImportantLabel}
                  </span>
                  <p
                    className="mt-1.5"
                    style={{
                      fontSize: "var(--font-size-md)",
                      color: "var(--text-secondary)",
                      lineHeight: "var(--leading-reading)",
                    }}
                  >
                    {term.whyImportant}
                  </p>
                </div>
              )}

              {term.relatedTerms &&
                term.relatedTerms.length > 0 && (
                  <div>
                    <span
                      className="type-label"
                      style={{
                        fontSize: "var(--font-size-xs)",
                        color: "var(--text-muted)",
                        letterSpacing: "0.1em",
                        textTransform: "uppercase" as const,
                      }}
                    >
                      {gl.relatedLabel}
                    </span>
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {term.relatedTerms.map((relId) => {
                        const rel = getTermById(relId, cms);
                        if (!rel) return null;
                        return (
                          <button
                            key={relId}
                            onClick={() =>
                              onNavigateToTerm?.(relId)
                            }
                            className="px-2.5 py-1 rounded-lg active:scale-95"
                            style={{
                              fontSize: "var(--font-size-sm)",
                              color: "var(--primary)",
                              background:
                                "color-mix(in srgb, var(--primary) 8%, var(--surface-container))",
                              border:
                                "1px solid color-mix(in srgb, var(--primary) 15%, var(--outline-variant))",
                              cursor: "pointer",
                            }}
                          >
                            {rel.symbol || rel.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}