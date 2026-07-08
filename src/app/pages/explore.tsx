/* === EXPLORE PAGE — VPL-059 ===
   Catalogo completo stili pizza con filtri famiglia e ricette iconiche.
   Layout editoriale e filtri flessibili (Spotify/Pinterest style).
   Tab: Stili — /explore */

import { ArrowRight, ChevronUp } from "lucide-react";
import { AnimatePresence,motion } from "motion/react";
import { useMemo, useState } from "react";
import { Link,useSearchParams } from "react-router";
import { Heading } from "../components/ds/index";
import { useCms } from "../features/cms/cms-context";
import { ImageWithFallback } from "../components/media/ImageWithFallback";
import { FireGlow } from "../features/cooking/fire-glow";
import { getInterpretationById } from "../data/interpretation-library";
import {
generateRecipe,
optimizeRecipe,
PIZZA_FAMILIES,
shortOrigin,
STYLES_DB,
styleMatchesFamily,
type FamilyId,
type PizzaStyle,
type UserConstraints,
} from "../domain/pizza-engine";
import { STYLE_PHOTOS } from "../features/recipe/recommended-styles";
import { useProfileDefaults } from "../hooks/use-profile-defaults";
import {
SIGNATURE_RECIPES,
type SignatureRecipe,
} from "../data/signature-recipes";
import { useStylesOverride } from "../context/styles-override-context";
import { TiltCard } from "../features/recipe/tilt-card";

function getAcronymTooltip(text: string | null | undefined): string | undefined {
  if (!text) return undefined;
  const acronyms: Record<string, string> = {
    AVPN: "Associazione Verace Pizza Napoletana",
    STG: "Specialità Tradizionale Garantita",
    IGP: "Indicazione Geografica Protetta",
  };

  const found = Object.keys(acronyms).filter(acronym =>
    new RegExp(`\\b${acronym}\\b`, 'i').test(text)
  );

  if (found.length > 0) {
    return found.map(acronym => `${acronym}: ${acronyms[acronym]}`).join("\n");
  }
  return undefined;
}

const FALLBACK =
  "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&q=80";

const FAMILY_IDS: (FamilyId | "all")[] = [
  "all",
  "napoletana",
  "romana",
  "americana",
  "contemporanea",
];

type ExploreFilter = "all" | "styles" | "recipes";

const EXPLORE_FILTERS: ExploreFilter[] = ["all", "styles", "recipes"];

function isExploreFilter(value: string | null): value is ExploreFilter {
  return EXPLORE_FILTERS.includes(value as ExploreFilter);
}

function isFamilyFilter(value: string | null): value is FamilyId | "all" {
  return FAMILY_IDS.includes(value as FamilyId | "all");
}

/* ── Componente Editoriale per la Ricetta in Primo Piano ── */
function FeaturedRecipeCard({
  recipe,
  isNerd,
  exploreBackTo,
}: {
  recipe: SignatureRecipe;
  isNerd?: boolean;
  exploreBackTo: string;
}) {
  const { cms } = useCms();
  const [hovered, setHovered] = useState(false);
  const photo =
    recipe.photo ||
    STYLE_PHOTOS[recipe.style_id] ||
    FALLBACK;
  const styleName = STYLES_DB[recipe.style_id]?.name ?? recipe.style_id;

  const interpretation = recipe.interpretation_id
    ? getInterpretationById(recipe.interpretation_id)
    : undefined;
  const authorLabel = interpretation
    ? interpretation.author ?? interpretation.pizzeria ?? interpretation.organization ?? null
    : null;

  const linkParams = new URLSearchParams();
  linkParams.set("mode", "canonical");
  linkParams.set("tab", "condimento");
  linkParams.set("topping", recipe.topping_concept_id);
  if (recipe.interpretation_id)
    linkParams.set("interpretation", recipe.interpretation_id);
  const linkTo = `/recipe/${recipe.style_id}?${linkParams.toString()}`;

  return (
    <Link
      to={linkTo}
      state={{ exploreBackTo }}
      data-region="feature"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`explore-feature${isNerd ? " explore-feature--nerd" : ""}${hovered ? " explore-feature--hovered" : ""}`}
    >
      {/* Colonna Immagine */}
      <div className="explore-feature__media">
        <ImageWithFallback
          src={photo}
          alt={recipe.name}
          className="explore-feature__image"
          loading="lazy"
        />
        {/* Badge autenticità posizionato sull'immagine */}
        {recipe.authenticity_badge && (
          <div
            className="explore-feature__badge"
            title={getAcronymTooltip(recipe.authenticity_badge)}
          >
            {recipe.authenticity_badge}
          </div>
        )}
      </div>

      {/* Colonna Testo Solido */}
      <div className="explore-feature__body">
        <div className="explore-feature__head">
          <span
            className="explore-feature__eyebrow"
            title={getAcronymTooltip(styleName)}
          >
            {styleName}
          </span>
          <h3 className="explore-feature__title">
            {recipe.name}
          </h3>
          <p className="explore-feature__desc">
            Una delle combinazioni più celebri per lo stile{" "}
            <strong className="explore-feature__desc-strong">{styleName}</strong>
            {authorLabel ? ` via ${authorLabel}` : ""}. Scopri i parametri dell'impasto consigliati, i tempi e il condimento autentico.
          </p>
        </div>

        <div className="explore-feature__cta">
          <span data-slot="cta-label">{cms.pages.exploreRecipe}</span>
          <ArrowRight size={14} />
        </div>
      </div>
    </Link>
  );
}

export function ExplorePage() {
  const { cms } = useCms();
  const { effectiveStyles } = useStylesOverride();
  // Fase 4: Scopri è il polo CANONICO. Le card mostrano il match canonico sul tuo
  // forno (M_c) e, quando il margine è reale, la pill "M_c% → M_o%" col soffitto ottimizzabile.
  const { constraints: profileConstraints } = useProfileDefaults();
  const [searchParams, setSearchParams] = useSearchParams();
  const urlFilter = searchParams.get("view");
  const activeFilter: ExploreFilter = isExploreFilter(urlFilter) ? urlFilter : "all";
  const urlFamily = searchParams.get("family");
  const activeFamily: FamilyId | "all" =
    activeFilter === "styles" && isFamilyFilter(urlFamily) ? urlFamily : "all";
  const exploreBackTo = useMemo(() => {
    const query = searchParams.toString();
    return `/explore${query ? `?${query}` : ""}`;
  }, [searchParams]);

  const setExploreFilters = (
    filter: ExploreFilter,
    family: FamilyId | "all" = "all",
  ) => {
    setSearchParams(
      (current) => {
        const next = new URLSearchParams(current);
        if (filter === "all") next.delete("view");
        else next.set("view", filter);
        if (filter === "styles" && family !== "all") next.set("family", family);
        else next.delete("family");
        return next;
      },
      { replace: true },
    );
  };

  const isNerd = useMemo(() => {
    try {
      return localStorage.getItem("vulcan_nerd_on") === "true";
    } catch {
      return false;
    }
  }, []);

  const styles = useMemo(() => {
    const db = effectiveStyles ?? STYLES_DB;
    return Object.values(db);
  }, [effectiveStyles]);

  const filteredStyles = useMemo(() => {
    if (activeFamily === "all") return styles;
    // Filtro non esclusivo: include chi ha activeFamily come primaria O secondaria.
    return styles.filter((s) => styleMatchesFamily(s, activeFamily as FamilyId));
  }, [styles, activeFamily]);

  /* Group styles by family for "all" and style tab when no family filter is applied */
  const groupedStyles = useMemo(() => {
    if (activeFamily !== "all") return null;
    const groups: Record<FamilyId, PizzaStyle[]> = {
      napoletana: [],
      romana: [],
      americana: [],
      contemporanea: [],
    };
    for (const s of styles) {
      if (groups[s.family]) groups[s.family].push(s);
    }
    return groups;
  }, [styles, activeFamily]);

  /* Family counts for badges — coerenti col filtro non esclusivo: uno stile
   * conta nella primaria e in ogni secondaria (la somma può superare il totale). */
  const familyCounts = useMemo(() => {
    const counts: Record<string, number> = {
      all: styles.length,
    };
    for (const s of styles) {
      for (const fam of [s.family, ...(s.families ?? [])]) {
        counts[fam] = (counts[fam] || 0) + 1;
      }
    }
    return counts;
  }, [styles]);

  return (
    <main
      id="main-content"
      className="explore-page"
    >
      {/* Glow sempre attivo (feedback: "rendiamolo evidente in entrambi i mode",
          non solo nerd). Un filo più intenso fuori dalla modalità nerd così
          emerge anche su light, dove il warm si legge meno che su dark. */}
      <FireGlow intensity={isNerd ? 0.3 : 0.36} variant="warm" />
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          type: "spring",
          stiffness: 400,
          damping: 30,
        }}
        className="explore-page__container"
        data-region="page"
      >
        {/* Header a grande respiro */}
        <div data-region="page-header" className="explore-page__header">
          <Heading level="page">
            {cms.misc.exploreHeroTitle1}
            <span
              className={`page-title-accent explore-page__accent${isNerd ? " explore-page__accent--nerd" : ""}`}
            >
              {cms.misc.exploreHeroTitle2}
            </span>
          </Heading>
          <p className="page-lead explore-page__lead">
            {cms.pages.exploreHeroDesc}
          </p>
        </div>

        {/* Filtri Principali a Chips Flessibili (Spotify/Pinterest style) */}
        <div data-region="filters" className="explore-filters hide-scrollbar">
          {[
            { id: "all", label: cms.pages.exploreFilterFeatured },
            { id: "styles", label: cms.pages.exploreFilterStyles },
            { id: "recipes", label: cms.pages.exploreFilterRecipes },
          ].map((item) => {
            const active = activeFilter === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setExploreFilters(item.id as ExploreFilter)}
                className={`explore-filters__chip${active ? " explore-filters__chip--active" : ""}${active && isNerd ? " explore-filters__chip--nerd" : ""}`}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        {/* Vista Condizionata con AnimatePresence */}
        <AnimatePresence mode="wait">
          {activeFilter === "all" && (
            <motion.div
              key="all-section"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ type: "spring", stiffness: 380, damping: 30 }}
              className="explore-section-stack"
            >
              {/* 1. Hero Card "In primo piano" */}
              {SIGNATURE_RECIPES.length > 0 && (
                <FeaturedRecipeCard
                  recipe={SIGNATURE_RECIPES[0]}
                  isNerd={isNerd}
                  exploreBackTo={exploreBackTo}
                />
              )}

              {/* 2. Anteprima Ricette Iconiche */}
              <section>
                <div className="explore-section__head">
                  <Heading level="md" as="h2">
                    {cms.pages.exploreFilterRecipes}
                  </Heading>
                  <button
                    onClick={() => setExploreFilters("recipes")}
                    className="explore-section__link"
                  >
                    Vedi tutte ({SIGNATURE_RECIPES.length}) <ArrowRight size={12} />
                  </button>
                </div>
                <div data-region="collection" className="explore-grid--preview">
                  {SIGNATURE_RECIPES.slice(1, 5).map((recipe, i) => (
                    <SignatureRecipeCard
                      key={recipe.id}
                      recipe={recipe}
                      index={i}
                      cms={cms}
                      isNerd={isNerd}
                      exploreBackTo={exploreBackTo}
                    />
                  ))}
                </div>
              </section>

              {/* 3. Anteprima Stili Tradizionali */}
              <section>
                <div className="explore-section__head">
                  <Heading level="md" as="h2">
                    {cms.misc.exploreSectionTraditional}
                  </Heading>
                  <button
                    onClick={() => setExploreFilters("styles")}
                    className="explore-section__link"
                  >
                    Esplora tutti ({styles.length}) <ArrowRight size={12} />
                  </button>
                </div>
                <div data-region="collection" className="explore-grid--preview">
                  {styles.slice(0, 4).map((style, i) => (
                    <StyleCatalogCard
                      key={style.id}
                      style={style}
                      index={i}
                      cms={cms}
                      isNerd={isNerd}
                      exploreBackTo={exploreBackTo}
                      constraints={profileConstraints}
                    />
                  ))}
                </div>
              </section>
            </motion.div>
          )}

          {activeFilter === "recipes" && (
            <motion.div
              key="recipes-section"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ type: "spring", stiffness: 380, damping: 30 }}
            >
              <div data-region="collection" className="explore-grid">
                {SIGNATURE_RECIPES.map((recipe, i) => (
                  <SignatureRecipeCard
                    key={recipe.id}
                    recipe={recipe}
                    index={i}
                    cms={cms}
                    isNerd={isNerd}
                    exploreBackTo={exploreBackTo}
                  />
                ))}
              </div>
            </motion.div>
          )}

          {activeFilter === "styles" && (
            <motion.div
              key="styles-section"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ type: "spring", stiffness: 380, damping: 30 }}
            >
              {/* Family filter chips in linea allineati a sinistra */}
              <div className="explore-families">
                {FAMILY_IDS.map((fam) => {
                  const active = activeFamily === fam;
                  const label =
                    fam === "all"
                      ? "Tutti"
                      : cms.families[fam]?.name ||
                        PIZZA_FAMILIES[fam]?.name ||
                        fam;
                  const count = familyCounts[fam] || 0;
                  /* VPL-A6: niente chip per famiglie senza stili (eviterebbero
                   * una tab che porta a una griglia vuota). "Tutti" resta sempre. */
                  if (fam !== "all" && count === 0) return null;
                  return (
                    <button
                      key={fam}
                      onClick={() => setExploreFilters("styles", fam)}
                      className={`explore-families__chip${active ? " explore-families__chip--active" : ""}${active && isNerd ? " explore-families__chip--nerd" : ""}`}
                    >
                      {label}
                      <span className="explore-families__count">
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Grid Stili con AnimatePresence interno */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeFamily}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{
                    type: "spring",
                    stiffness: 400,
                    damping: 30,
                  }}
                >
                  {activeFamily === "all" && groupedStyles ? (
                    /* Raggruppati per famiglia */
                    Object.entries(groupedStyles).map(([familyId, familyStyles]) => {
                      if (familyStyles.length === 0) return null;
                      const fam = PIZZA_FAMILIES[familyId as FamilyId];
                      const cmsFam = cms.families[familyId as FamilyId];
                      return (
                        <div key={familyId} className="explore-family-group">
                          <div className="explore-family-group__head">
                            <h3 className="explore-family-group__title">
                              {cmsFam?.name || fam?.name}
                            </h3>
                            <span className="type-data explore-family-group__count">
                              ({familyStyles.length})
                            </span>
                          </div>
                          <div data-region="collection" className="explore-grid">
                            {familyStyles.map((style, i) => (
                              <StyleCatalogCard
                                key={style.id}
                                style={style}
                                index={i}
                                cms={cms}
                                isNerd={isNerd}
                                exploreBackTo={exploreBackTo}
                                constraints={profileConstraints}
                              />
                            ))}
                          </div>
                        </div>
                      );
                    })
                  ) : filteredStyles.length === 0 ? (
                    /* VPL-A6: empty-state esplicito invece della griglia vuota */
                    <div className="explore-empty">
                      {cms.misc.noStyleInFamily}
                    </div>
                  ) : (
                    /* Griglia piatta filtrata */
                    <div data-region="collection" className="explore-grid">
                      {filteredStyles.map((style, i) => (
                        <StyleCatalogCard
                          key={style.id}
                          style={style}
                          index={i}
                          cms={cms}
                          isNerd={isNerd}
                          exploreBackTo={exploreBackTo}
                          constraints={profileConstraints}
                        />
                      ))}
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </main>
  );
}

/* ═══ SIGNATURE RECIPE CARD — Sprint 12 Fase 5 ═══
   Card per ricetta iconica. Eredita foto dallo Style di parent, mostra
   nome ricetta + badge "Disciplinare AVPN" / "Stile panaria romana" / ecc.
   Click → /recipe/{style_id}?topping={concept_id} (chip topping pre-selezionato). */
function SignatureRecipeCard({
  recipe,
  index,
  cms,
  isNerd,
  exploreBackTo,
}: {
  recipe: SignatureRecipe;
  index: number;
  cms: any;
  isNerd?: boolean;
  exploreBackTo: string;
}) {
  const photo =
    recipe.photo ||
    cms.media?.stylePhotos?.[recipe.style_id] ||
    STYLE_PHOTOS[recipe.style_id] ||
    FALLBACK;
  const styleName =
    STYLES_DB[recipe.style_id]?.name ?? recipe.style_id;

  /* Autore/locale dall'interpretazione (se mappata): mostrato come "via X"
   * sopra al titolo, e propagato come deep-link ?interpretation=<id>.
   * Audit motore 2026-05: dedup vs authenticity_badge — se il badge in alto
   * già contiene il nome dell'organizzazione (es. badge "Disciplinare AVPN"
   * + organization "AVPN — Associazione Verace Pizza Napoletana"),
   * sopprime "via X" perché ridondante. */
  const interpretation = recipe.interpretation_id
    ? getInterpretationById(recipe.interpretation_id)
    : undefined;
  let authorLabel: string | null = interpretation
    ? interpretation.author ??
      interpretation.pizzeria ??
      interpretation.organization ??
      null
    : null;
  if (authorLabel && recipe.authenticity_badge) {
    const orgKeyword = (interpretation?.organization ?? "").split(/[\s—]/)[0];
    if (orgKeyword && recipe.authenticity_badge.toLowerCase().includes(orgKeyword.toLowerCase())) {
      authorLabel = null;
    }
  }

  const linkParams = new URLSearchParams();
  linkParams.set("mode", "canonical");
  linkParams.set("tab", "condimento");
  linkParams.set("topping", recipe.topping_concept_id);
  if (recipe.interpretation_id)
    linkParams.set("interpretation", recipe.interpretation_id);
  const linkTo = `/recipe/${recipe.style_id}?${linkParams.toString()}`;

  return (
    <motion.div
      data-region="card"
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        type: "spring",
        stiffness: 400,
        damping: 28,
        delay: index * 0.04,
      }}
    >
      <TiltCard className="explore-tilt">
        <Link
          to={linkTo}
          state={{ exploreBackTo }}
          className={`explore-card${isNerd ? " explore-card--nerd" : ""}`}
        >
          <div className="explore-card__media">
          <ImageWithFallback
            src={photo}
            alt={recipe.name}
            className="explore-card__image"
            loading="lazy"
          />
          <div className="explore-card__scrim" />

          {/* Badge autenticità — top right */}
          {recipe.authenticity_badge && (
            <div
              className="explore-card__badge explore-card__badge--auth"
              title={getAcronymTooltip(recipe.authenticity_badge)}
            >
              {recipe.authenticity_badge}
            </div>
          )}

          {/* Title + sotto-titolo stile */}
          <div className="explore-card__caption">
            <div
              className="explore-card__eyebrow"
              title={getAcronymTooltip(styleName)}
            >
              {styleName}
            </div>
            <span className="explore-card__title explore-card__title--recipe">
              {recipe.name}
            </span>
            {/* Sprint 12 — autore/locale dell'interpretazione (se mappata). */}
            {authorLabel && (
              <div className="explore-card__author">
                via {authorLabel}
              </div>
            )}
          </div>
        </div>
      </Link>
      </TiltCard>
    </motion.div>
  );
}

/* ═══ STYLE CATALOG CARD — Editorial magazine style (unified with Create) ═══ */
function StyleCatalogCard({
  style,
  index,
  cms,
  isNerd,
  exploreBackTo,
  constraints,
}: {
  style: PizzaStyle;
  index: number;
  cms: any;
  isNerd?: boolean;
  exploreBackTo: string;
  constraints: UserConstraints;
}) {
  const photo =
    cms.media?.stylePhotos?.[style.id] ||
    STYLE_PHOTOS[style.id] ||
    FALLBACK;
  // Fase 4: match canonico (M_c) sul tuo forno + margine ottimizzabile (M_o − M_c).
  // La pill "↗+Δ" compare solo se il margine è reale (Δ ≥ 8): auto-regolante,
  // così il 70-80% delle card resta pulito. (La scia fantasma a 32px era illeggibile.)
  const match = useMemo(() => {
    try {
      const mc = generateRecipe(style, constraints).scores.composite;
      const mo = optimizeRecipe(style, constraints).recipe.scores.composite;
      return { mc, headroom: mo - mc >= 8 ? mo - mc : 0 };
    } catch {
      return null;
    }
  }, [style, constraints]);

  return (
    <motion.div
      data-region="card"
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        type: "spring",
        stiffness: 400,
        damping: 28,
        delay: index * 0.04,
      }}
    >
      <TiltCard className="explore-tilt">
        <Link
          to={`/recipe/${style.id}?mode=canonical`}
          state={{ exploreBackTo }}
          className={`explore-card${isNerd ? " explore-card--nerd" : ""}`}
        >
          {/* Photo area — 3/4 aspect like Create cards */}
        <div className="explore-card__media">
          <ImageWithFallback
            src={photo}
            alt={style.name}
            className="explore-card__image"
            loading="lazy"
          />

          {/* Cinematic scrim */}
          <div className="explore-card__scrim" />

          {/* Beginner badge — top left */}
          {style.suitable_for_beginner && (
            <div className="explore-card__badge explore-card__badge--beginner">
              {cms.misc.badgeBeginnerFriendly}
            </div>
          )}

          {/* Match canonico + margine ottimizzabile — top right (Fase 4) */}
          {match && (
            <div className="explore-card__match">
              <div
                className="explore-card__match-pill"
                title={match.headroom > 0 ? `Ottimizzabile: ${match.mc}% → ${match.mc + match.headroom}% col tuo setup` : `Match: ${match.mc}%`}
                aria-label={match.headroom > 0 ? `Compatibilità ${match.mc}%, ottimizzabile fino a ${match.mc + match.headroom}% col tuo setup` : `Compatibilità ${match.mc}%`}
              >
                <span className="explore-card__match-mc">{match.mc}%</span>
                {match.headroom > 0 && (
                  <>
                    <span className="explore-card__match-arrow">→</span>
                    <span className="explore-card__match-headroom">
                      {match.mc + match.headroom}%
                    </span>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Title + subtitle — overlaid on image (editorial style) */}
          <div className="explore-card__caption">
            <span
              className="explore-card__title explore-card__title--style"
              title={getAcronymTooltip(style.name)}
            >
              {style.name}
            </span>
            <div className="explore-card__origin">
              {shortOrigin(style.origin).toUpperCase()}
            </div>
          </div>
        </div>
      </Link>
      </TiltCard>
    </motion.div>
  );
}
