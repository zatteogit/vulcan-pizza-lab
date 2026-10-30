import {
  BookOpen,
  Search,
} from "lucide-react";
import { motion } from "motion/react";
import { Fragment, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router";
import { useHashTarget } from "../hooks/use-hash-target";
import { getScienceNote, notesForGlossaryTerm } from "../data/science-notes";
import { WhyButton } from "../features/science/why-button";
import { useCms } from "../features/cms/cms-context";
import { t } from "../features/cms/i18n";
import { Disclosure, EmptyState, FilterChip, Surface } from "../components/ds/index";
import { motionDelay,motionSpring } from "../components/ds/motion";
import { SubPageHeader } from "../components/shared/sub-page-header";
import {
  GLOSSARY_CATEGORY_ICONS,
  glossaryCategoryDescription as catDesc,
  glossaryCategoryLabel as catLabel,
} from "../features/glossary/glossary-categories";
import type {
  GlossaryCategory,
  GlossaryPage,
  GlossaryTerm,
} from "../data/glossary-data";
import {
  GLOSSARY_CATEGORIES,
  GLOSSARY_TERMS,
  getLocalizedTerm,
  getTermById,
  getTermsByCategory,
} from "../data/glossary-data";

/* FW-09 (S12-A-19): accenti e maiuscole non contano («stabilita», «perche»). */
function foldText(text: string): string {
  return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

export function GlossaryPage() {
  const navigate = useNavigate();
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

  /* FW-04 (S04-A-04, S12-B-01, S12-A-07): #termine apre la voce, aspetta il
     layout, la porta in cima e mette a fuoco il titolo, in ogni lingua e anche
     sulla stessa pagina (correlati, ricerca). */
  useHashTarget({
    onMatch: (id) => {
      if (!GLOSSARY_TERMS.some((term) => term.id === id)) return false;
      setExpandedTerm(id);
      setActiveCategory("all");
      setSearch("");
      return true;
    },
    targetId: (id) => `glossary-${id}`,
    focusId: (id) => `glossary-${id}-toggle`,
  });

  /* FW-04 (S12-A-06, S12-B-06): filtri, conteggi e lista filtrata usano le
     voci nella lingua attiva (prima la lista filtrata tornava in italiano). */
  const localizedTerms = useMemo(
    () => GLOSSARY_TERMS.map((raw) => ({ raw, term: getLocalizedTerm(raw, cms) })),
    [cms],
  );

  /* FW-09 (S12-A-19, S12-B-15): la ricerca guarda i testi della lingua
     attiva senza badare agli accenti, e i conteggi dei chip la seguono. */
  const searchedTerms = useMemo(() => {
    const q = foldText(search.trim());
    if (!q) return localizedTerms.map(({ term }) => term);
    return localizedTerms
      .filter(({ raw, term }) =>
        [term.name, term.plainDefinition ?? "", term.definition, term.symbol ?? "", raw.name, raw.id.replace(/_/g, " ")]
          .some((field) => foldText(field).includes(q)))
      .map(({ term }) => term);
  }, [search, localizedTerms]);

  const filteredTerms = useMemo(
    () => activeCategory === "all" ? searchedTerms : searchedTerms.filter((t) => t.category === activeCategory),
    [activeCategory, searchedTerms],
  );

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {
      all: searchedTerms.length,
    };
    for (const t of searchedTerms) {
      counts[t.category] = (counts[t.category] || 0) + 1;
    }
    return counts;
  }, [searchedTerms]);

  /* FW-04 (S12-B-11): un correlato cambia l'URL (Indietro torna alla voce di
     partenza, il link si condivide) e passa da useHashTarget: scroll e focus. */
  const handleNavigateToTerm = (termId: string) => {
    navigate({ hash: termId });
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
            {t(filteredTerms.length === 1 ? gl.termCountOne : gl.termCount, {
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
        {/* FW-09 (S12-A-19, S12-B-15): il motivo e le vie d'uscita. */}
        {filteredTerms.length === 0 && (
          <EmptyState
            live
            title={search.trim() ? t(gl.noResults, { query: search.trim() }) : gl.emptyCategory}
            reason={search.trim() && activeCategory !== "all" && searchedTerms.length > 0
              ? t(gl.emptyInCategory, { count: String(searchedTerms.length) })
              : gl.emptyReason}
            actions={[
              {
                label: activeCategory !== "all" && searchedTerms.length > 0 ? gl.showAllCategories : gl.cancelSearchLong,
                onClick: () => {
                  if (!(activeCategory !== "all" && searchedTerms.length > 0)) setSearch("");
                  setActiveCategory("all");
                },
              },
              { label: gl.searchEverywhere, onClick: () => window.dispatchEvent(new Event("vulcan:open-search")) },
            ]}
            className="glossary-empty-state"
          />
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
                showCategoryIcon={activeCategory === "all"}
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
  showCategoryIcon = false,
  isExpanded,
  onToggle,
  onNavigateToTerm,
}: {
  term: GlossaryTerm;
  /** FW-03 (S12-B-10): h3 sotto i gruppi (h2), h2 nella lista filtrata. */
  headingLevel: 2 | 3;
  /** S12-B-16: l'icona della categoria sta nel titolo del gruppo; la card la
      ripete solo nei risultati di ricerca piatti con categorie mescolate. */
  showCategoryIcon?: boolean;
  isExpanded: boolean;
  onToggle: () => void;
  onNavigateToTerm?: (termId: string) => void;
}) {
  const TermIcon = GLOSSARY_CATEGORY_ICONS[term.category];
  const { cms } = useCms();
  const gl = cms.glossary;
  const SectionHeading = headingLevel === 2 ? "h3" : "h4";

  return (
    <Surface
      as={motion.div}
      variant="card"
      id={`glossary-${term.id}`}
      /* S12-B-16: su desktop la card aperta passa a tutta riga; animare anche
         la misura la schiaccerebbe (scala 0,5 → 1 sul testo). Si muove solo. */
      layout="position"
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
          {showCategoryIcon && (
            <span className="glossary-card__icon">
              <TermIcon size={16} aria-hidden="true" className="glossary-card__emoji" />
            </span>
          )}
          <span className="glossary-card__content">
            <span className="glossary-card__titlerow">
              <span className="glossary-card__name">
                {term.name}
              </span>
              {/* FW-04 (S11-A-12): il simbolo non si ripete se è già nel nome. */}
              {term.symbol && !term.name.includes(term.symbol) && (
                <span className="glossary-card__symbol" aria-hidden="true">
                  {term.symbol}
                </span>
              )}
              {term.unit && (
                <span className="glossary-card__unit">
                  [{term.unit}]
                </span>
              )}
            </span>
            {/* FW-04 (S12-B-08): prima la definizione in parole semplici. */}
            <span className="glossary-card__definition">
              {term.plainDefinition ?? term.definition}
            </span>
          </span>
        </>}
      >
            <div className="glossary-card__body">
              {/* FW-04: livello 2 (definizione tecnica, perché conta), poi il
                  livello 3 (formula, valori, modello) e i rimandi. */}
              {term.plainDefinition && (
                <section data-region="glossary-technical">
                  <SectionHeading className="type-label glossary-section__label">{gl.technicalLabel}</SectionHeading>
                  <p className="glossary-why__text">{term.definition}</p>
                </section>
              )}

              {term.whyImportant && (
                <section className="glossary-why">
                  <SectionHeading className="type-label glossary-section__label">
                    {gl.whyImportantLabel}
                  </SectionHeading>
                  <p className="glossary-why__text">
                    {term.whyImportant}
                  </p>
                </section>
              )}

              {term.formula && (
                <section className="glossary-formula">
                  <SectionHeading className="type-label glossary-section__label">
                    {gl.formulaLabel}
                  </SectionHeading>
                  <p className="type-nerd glossary-formula__value">
                    {term.formula}
                  </p>
                </section>
              )}

              {/* FW-04 (S12-A-14, S12-B-12): tabella vera, colonne fisse
                  (valore | che cosa indica), l'esempio sotto il significato. */}
              {term.ranges && term.ranges.length > 0 && (
                <section className="glossary-ranges">
                  <SectionHeading className="type-label glossary-section__label">
                    {gl.rangesLabel}
                  </SectionHeading>
                  <table className="glossary-ranges__table">
                    <thead>
                      <tr>
                        <th scope="col">{gl.rangesValueHeader}</th>
                        <th scope="col">{gl.rangesMeaningHeader}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {term.ranges.map((r, i) => (
                        <tr key={i} className="glossary-ranges__row">
                          <td className="glossary-ranges__value">{r.value}</td>
                          <td className="glossary-ranges__label">
                            {r.label}
                            {r.note && (
                              <small className="glossary-ranges__note">{r.note}</small>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </section>
              )}

              <ModelNotes term={term} SectionHeading={SectionHeading} />

              {term.relatedTerms &&
                term.relatedTerms.length > 0 && (
                  <section className="glossary-related">
                    <SectionHeading className="type-label glossary-section__label">
                      {gl.relatedLabel}
                    </SectionHeading>
                    <div className="glossary-related__list">
                      {term.relatedTerms.map((relId) => {
                        const rel = getTermById(relId, cms);
                        if (!rel) return null;
                        /* FW-04 (S12-A-17): il nome intero, non solo «W». */
                        return (
                          <button
                            type="button"
                            key={relId}
                            onClick={() =>
                              onNavigateToTerm?.(relId)
                            }
                            className="glossary-related__tag"
                          >
                            {rel.name}
                          </button>
                        );
                      })}
                    </div>
                  </section>
                )}

              {term.relatedPages && term.relatedPages.length > 0 && (
                <section className="glossary-related">
                  <SectionHeading className="type-label glossary-section__label">{gl.seeAlsoLabel}</SectionHeading>
                  <div className="glossary-related__list">
                    {term.relatedPages.map((page) => (
                      <Link key={page} to={PAGE_LINKS[page].to} className="glossary-related__tag glossary-related__tag--page">
                        {PAGE_LINKS[page].label(cms)}
                      </Link>
                    ))}
                  </div>
                </section>
              )}
            </div>
      </Disclosure>
    </Surface>
  );
}

/* FW-04 (S12-A-11): «Vedi anche» — pagine che approfondiscono una voce. */
const PAGE_LINKS: Record<GlossaryPage, { to: string; label: (cms: ReturnType<typeof useCms>["cms"]) => string }> = {
  profile: { to: "/profile", label: (cms) => cms.pages.navProfile },
  "pre-ferments": { to: "/learn/pre-ferments", label: (cms) => cms.pages.learnPreFerments },
  troubleshooting: { to: "/learn/troubleshooting", label: (cms) => cms.pages.learnTroubleshooting },
};

/* FW-04 (FW-01): la voce porta alle note del registro della scienza che il
   motore usa per quel concetto (titolo e «perché» in parole semplici). */
function ModelNotes({ term, SectionHeading }: { term: GlossaryTerm; SectionHeading: "h3" | "h4" }) {
  const { cms } = useCms();
  const ids = [...new Set([...notesForGlossaryTerm(term.id).map((note) => note.id), ...(term.noteIds ?? [])])]
    .filter((id) => getScienceNote(id) && cms.science.notes[id]);
  if (ids.length === 0) return null;
  return (
    <section data-region="glossary-model">
      <SectionHeading className="type-label glossary-section__label">{cms.glossary.modelNoteLabel}</SectionHeading>
      {ids.map((id) => (
        <Fragment key={id}>
          <p className="glossary-why__text">
            <strong>{cms.science.notes[id].title}</strong>
            {" — "}
            {cms.science.notes[id].l2}
          </p>
          {/* Il «Perché?» apre la nota intera (statuto, conto, fonti: livello 3). */}
          <WhyButton noteId={id} className="glossary-model__why" />
        </Fragment>
      ))}
    </section>
  );
}
