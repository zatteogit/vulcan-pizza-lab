import {
  BookOpen,
  Search,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect,useMemo,useState } from "react";
import { useLocation } from "react-router";
import { useCms } from "../features/cms/cms-context";
import { t } from "../features/cms/i18n";
import { Disclosure, FilterChip, Surface } from "../components/ds/index";
import { motionDelay,motionSpring } from "../components/ds/motion";
import { SubPageHeader } from "../components/shared/sub-page-header";
import {
  GLOSSARY_CATEGORY_ICONS,
  glossaryCategoryDescription as catDesc,
  glossaryCategoryLabel as catLabel,
} from "../features/glossary/glossary-categories";
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
    <div className="glossary-page">
      {/* ── Header — pattern condiviso delle sotto-pagine ── */}
      <SubPageHeader
        backTo="/learn"
        backLabel={cms.pages.navLearn}
        icon={<BookOpen size={16} />}
        title={gl.pageTitle}
        meta={
          <span className="glossary-meta">
            {t(gl.termCount, {
              count: String(filteredTerms.length),
            })}
          </span>
        }
      />

      <main data-region="page" className="glossary-body">
        {/* ── Search ── */}
        <div className="glossary-search">
          <div className="glossary-searchbox">
            <Search size={16} className="glossary-searchbox__icon" />
            <input
              type="text"
              placeholder={gl.searchPlaceholder}
              aria-label={gl.searchPlaceholder}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="glossary-searchbox__input"
            />
            {search && (
              <motion.button
                type="button"
                onClick={() => setSearch("")}
                className="glossary-searchbox__clear"
              >
                {gl.cancelSearch}
              </motion.button>
            )}
          </div>

          {/* Category chips */}
          <motion.div
            className="glossary-chips"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},
              visible: {
                transition: { staggerChildren: motionDelay.micro },
              },
            }}
          >
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 8, scale: 0.95 },
                visible: { opacity: 1, y: 0, scale: 1 },
              }}
              transition={motionSpring.crispDisclosure}
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
            ).map(([id]) => {
              const Icon = GLOSSARY_CATEGORY_ICONS[id];
              return (
              <motion.div
                key={id}
                variants={{
                  hidden: { opacity: 0, y: 8, scale: 0.95 },
                  visible: { opacity: 1, y: 0, scale: 1 },
                }}
                transition={motionSpring.crispDisclosure}
              >
                <FilterChip
                  active={activeCategory === id}
                  onClick={() => setActiveCategory(id)}
                  radius="xl"
                  count={categoryCounts[id] || 0}
                >
                  <Icon size={14} aria-hidden="true" className="glossary-chip__icon" />
                  {catLabel(id, gl)}
                </FilterChip>
              </motion.div>
              );
            })}
          </motion.div>
        </div>

        {/* ── Terms list ── */}
        {filteredTerms.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glossary-empty"
          >
            <p className="glossary-empty__text">
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
          ).map(([catId]) => {
            const catTerms = termsByCategory[catId];
            const CatIcon = GLOSSARY_CATEGORY_ICONS[catId];
            if (!catTerms || catTerms.length === 0) return null;
            return (
              <div key={catId} className="glossary-group">
                <div className="glossary-group__header">
                  <span className="glossary-group__emoji">
                    <CatIcon size={22} aria-hidden="true" />
                  </span>
                  <h2 className="glossary-group__title">
                    {catLabel(catId, gl)}
                  </h2>
                  <span className="glossary-group__count">
                    {catTerms.length}
                  </span>
                  <div className="glossary-group__divider" />
                </div>
                <span className="glossary-group__desc">
                  {catDesc(catId, gl)}
                </span>
                {catTerms.map((term) => (
                  <TermCard
                    key={term.id}
                    term={term}
                    headingLevel={3}
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
          <div data-region="collection" className="glossary-list">
            {filteredTerms.map((term) => (
              <TermCard
                key={term.id}
                term={term}
                headingLevel={2}
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
      </main>
    </div>
  );
}

/* ═══ TERM CARD ═══ */
function TermCard({
  term,
  headingLevel,
  isExpanded,
  onToggle,
  onNavigateToTerm,
}: {
  term: GlossaryTerm;
  /** FW-03 (S12-B-10): h3 sotto i gruppi (h2), h2 nella lista filtrata. */
  headingLevel: 2 | 3;
  isExpanded: boolean;
  onToggle: () => void;
  onNavigateToTerm?: (termId: string) => void;
}) {
  const TermIcon = GLOSSARY_CATEGORY_ICONS[term.category];
  const { cms } = useCms();
  const gl = cms.glossary;

  return (
    <Surface
      as={motion.div}
      variant="card"
      id={`glossary-${term.id}`}
      layout
      className={`glossary-card${isExpanded ? " glossary-card--expanded" : ""}`}
      transition={motionSpring.standard}
    >
      {/* FW-03: ds/Disclosure con heading (aria-expanded, aria-controls);
          il contenuto del pulsante sono solo span. */}
      <Disclosure
        variant="inline"
        headingLevel={headingLevel}
        id={`glossary-${term.id}-toggle`}
        open={isExpanded}
        onOpenChange={onToggle}
        triggerClassName="glossary-card__toggle"
        panelClassName="glossary-card__reveal"
        summary={<>
          <span className="glossary-card__icon">
            <TermIcon size={16} aria-hidden="true" className="glossary-card__emoji" />
          </span>
          <span className="glossary-card__content">
            <span className="glossary-card__titlerow">
              <span className="glossary-card__name">
                {term.name}
              </span>
              {term.symbol && (
                <span className="glossary-card__symbol">
                  {term.symbol}
                </span>
              )}
              {term.unit && (
                <span className="glossary-card__unit">
                  [{term.unit}]
                </span>
              )}
            </span>
            <span className="glossary-card__definition">
              {term.definition}
            </span>
          </span>
        </>}
      >
            <div className="glossary-card__body">
              {term.formula && (
                <div className="glossary-formula">
                  <span className="type-label glossary-section__label">
                    {gl.formulaLabel}
                  </span>
                  <div className="type-nerd glossary-formula__value">
                    {term.formula}
                  </div>
                </div>
              )}

              {term.ranges && term.ranges.length > 0 && (
                <div className="glossary-ranges">
                  <span className="type-label glossary-section__label">
                    {gl.rangesLabel}
                  </span>
                  <div className="glossary-ranges__list">
                    {term.ranges.map((r, i) => (
                      <div
                        key={i}
                        className="glossary-ranges__row"
                      >
                        <span className="glossary-ranges__value">
                          {r.value}
                        </span>
                        <span className="glossary-ranges__label">
                          {r.label}
                        </span>
                        {r.note && (
                          <span className="glossary-ranges__note">
                            {"— "}
                            {r.note}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {term.whyImportant && (
                <div className="glossary-why">
                  <span className="type-label glossary-section__label">
                    {gl.whyImportantLabel}
                  </span>
                  <p className="glossary-why__text">
                    {term.whyImportant}
                  </p>
                </div>
              )}

              {term.relatedTerms &&
                term.relatedTerms.length > 0 && (
                  <div className="glossary-related">
                    <span className="type-label glossary-section__label">
                      {gl.relatedLabel}
                    </span>
                    <div className="glossary-related__list">
                      {term.relatedTerms.map((relId) => {
                        const rel = getTermById(relId, cms);
                        if (!rel) return null;
                        return (
                          <button
                            type="button"
                            key={relId}
                            onClick={() =>
                              onNavigateToTerm?.(relId)
                            }
                            className="glossary-related__tag"
                          >
                            {rel.symbol || rel.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
            </div>
      </Disclosure>
    </Surface>
  );
}
