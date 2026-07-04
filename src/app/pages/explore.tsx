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
import { ScoreRing } from "../features/recipe/score-ring";
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
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="flex flex-col md:flex-row overflow-hidden rounded-3xl active:scale-99 transition-all duration-300 group"
      style={{
        textDecoration: "none",
        color: "inherit",
        background:
          "linear-gradient(135deg, color-mix(in srgb, var(--container-page) 76%, transparent), color-mix(in srgb, var(--recipe-hero-badge-bg) 34%, transparent))",
        border: isNerd
          ? hovered
            ? "1px solid var(--accent-nerd)"
            : "1px solid color-mix(in srgb, var(--accent-nerd) 25%, transparent)"
          : hovered
            ? "1px solid var(--primary)"
            : "1px solid color-mix(in srgb, var(--container-border) 72%, transparent)",
        boxShadow: isNerd
          ? hovered
            ? "0 0 35px color-mix(in srgb, var(--accent-nerd) 35%, transparent), 0 16px 48px -8px color-mix(in srgb, var(--shadow-color) 20%, transparent)"
            : "0 0 25px color-mix(in srgb, var(--accent-nerd) 15%, transparent), 0 12px 40px -12px color-mix(in srgb, var(--shadow-color) 12%, transparent)"
          : hovered
            ? "0 22px 64px -14px color-mix(in srgb, var(--shadow-color) 35%, transparent), inset 0 1px 0 color-mix(in srgb, var(--overlay-text) 22%, transparent)"
            : "0 18px 56px -18px color-mix(in srgb, var(--shadow-color) 22%, transparent), inset 0 1px 0 color-mix(in srgb, var(--overlay-text) 18%, transparent)",
        backdropFilter: "blur(22px) saturate(1.55)",
        WebkitBackdropFilter: "blur(22px) saturate(1.55)",
      }}
    >
      {/* Colonna Immagine */}
      <div
        className="w-full md:w-[45%] relative overflow-hidden"
        style={{ height: "min(280px, 40vh)" }}
      >
        <ImageWithFallback
          src={photo}
          alt={recipe.name}
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-104"
          loading="lazy"
        />
        {/* Badge autenticità posizionato sull'immagine */}
        {recipe.authenticity_badge && (
          <div
            className="absolute top-4 left-4 px-2.5 py-1 rounded-lg text-white"
            title={getAcronymTooltip(recipe.authenticity_badge)}
            style={{
              background: "color-mix(in srgb, var(--primary) 90%, transparent)",
              backdropFilter: "blur(8px)",
              fontSize: "var(--font-size-base)",
              fontWeight: "var(--weight-semibold)",
            }}
          >
            {recipe.authenticity_badge}
          </div>
        )}
      </div>

      {/* Colonna Testo Solido */}
      <div
        className="w-full md:w-[55%] flex flex-col justify-between p-6 sm:p-8"
        style={{
          background:
            "linear-gradient(135deg, color-mix(in srgb, var(--container-page) 58%, transparent), color-mix(in srgb, var(--recipe-hero-badge-bg) 22%, transparent))",
        }}
      >
        <div className="flex flex-col gap-2">
          <span
            title={getAcronymTooltip(styleName)}
            style={{
              fontSize: "var(--font-size-sm)",
              color: "var(--primary)",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              fontWeight: "var(--weight-semibold)" as any,
            }}
          >
            {styleName}
          </span>
          <h3
            className="font-serif"
            style={{
              color: "var(--text-default)",
              lineHeight: "var(--leading-snug)",
              fontWeight: "var(--weight-bold)" as any,
              margin: 0,
            }}
          >
            {recipe.name}
          </h3>
          <p
            className="mt-2"
            style={{
              color: "var(--text-muted)",
              fontSize: "var(--font-size-lg)",
              lineHeight: 1.55,
            }}
          >
            Una delle combinazioni più celebri per lo stile{" "}
            <strong style={{ color: "var(--text-default)", fontWeight: "var(--weight-semibold)" as any }}>{styleName}</strong>
            {authorLabel ? ` via ${authorLabel}` : ""}. Scopri i parametri dell'impasto consigliati, i tempi e il condimento autentico.
          </p>
        </div>

        <div
          className="mt-6 flex items-center gap-1 text-[var(--primary)] group-hover:translate-x-1 transition-transform"
          style={{
            fontSize: "var(--font-size-lg)",
            fontWeight: "var(--weight-semibold)",
          }}
        >
          <span>{cms.pages.exploreRecipe}</span>
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
  // forno (M_c) con una scia fantasma fino al soffitto ottimizzabile (M_o).
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
      className="min-h-screen relative overflow-hidden"
      style={{
        background: "var(--container-page)",
        color: "var(--text-default)",
      }}
    >
      {isNerd && <FireGlow intensity={0.3} variant="warm" />}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          type: "spring",
          stiffness: 400,
          damping: 30,
        }}
        className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-16 pb-28 relative z-10"
      >
        {/* Header a grande respiro */}
        <div style={{ marginBottom: "var(--space-10)" }}>
          <Heading level="page">
            {cms.misc.exploreHeroTitle1}
            <span
              style={{
                display: "block",
                background: isNerd
                  ? "var(--gradient-nerd)"
                  : "none",
                color: isNerd ? "transparent" : "var(--text-accent)",
                WebkitBackgroundClip: isNerd ? "text" : "unset",
                WebkitTextFillColor: isNerd ? "transparent" : "unset",
                fontWeight: "var(--weight-bold)" as any,
                transition: "all 0.3s ease"
              }}
            >
              {cms.misc.exploreHeroTitle2}
            </span>
          </Heading>
          <p
            className="font-serif italic mt-3"
            style={{
              fontSize: "var(--font-size-2xl)",
              color: "var(--text-muted)",
              opacity: 0.75,
              lineHeight: 1.45,
              maxWidth: 480,
            }}
          >
            {cms.pages.exploreHeroDesc}
          </p>
        </div>

        {/* Filtri Principali a Chips Flessibili (Spotify/Pinterest style) */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-1 hide-scrollbar">
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
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl active:scale-95 transition-transform shrink-0"
                style={{
                  background: active
                    ? (isNerd ? "var(--gradient-nerd)" : "var(--primary)")
                    : "var(--container-bg)",
                  color: active ? "white" : "var(--text-default)",
                  border: `1px solid ${active ? (isNerd ? "transparent" : "var(--primary)") : "var(--container-border)"}`,
                  boxShadow: active && isNerd ? "0 0 12px color-mix(in srgb, var(--accent-nerd) 40%, transparent)" : "none",
                  fontSize: "var(--font-size-lg)",
                  fontWeight: "var(--weight-semibold)",
                  cursor: "pointer",
                  outline: "none",
                  transition: "all 0.3s ease",
                }}
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
              className="flex flex-col gap-10"
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
              <div>
                <div className="flex items-baseline justify-between mb-4">
                  <Heading level="md" as="h2">
                    {cms.pages.exploreFilterRecipes}
                  </Heading>
                  <button
                    onClick={() => setExploreFilters("recipes")}
                    className="flex items-center gap-1 hover:underline cursor-pointer bg-none border-none outline-none"
                    style={{
                      color: "var(--primary)",
                      fontSize: "var(--font-size-base)",
                      fontWeight: "var(--weight-semibold)",
                    }}
                  >
                    Vedi tutte ({SIGNATURE_RECIPES.length}) <ArrowRight size={12} />
                  </button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
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
              </div>

              {/* 3. Anteprima Stili Tradizionali */}
              <div>
                <div className="flex items-baseline justify-between mb-4">
                  <Heading level="md" as="h2">
                    {cms.misc.exploreSectionTraditional}
                  </Heading>
                  <button
                    onClick={() => setExploreFilters("styles")}
                    className="flex items-center gap-1 hover:underline cursor-pointer bg-none border-none outline-none"
                    style={{
                      color: "var(--primary)",
                      fontSize: "var(--font-size-base)",
                      fontWeight: "var(--weight-semibold)",
                    }}
                  >
                    Esplora tutti ({styles.length}) <ArrowRight size={12} />
                  </button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
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
              </div>
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
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
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
              <div className="flex flex-wrap gap-1.5 mb-6">
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
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg active:scale-95 transition-transform"
                      style={{
                        background: active
                          ? (isNerd ? "var(--gradient-nerd)" : "var(--primary)")
                          : "var(--container-bg)",
                        color: active
                          ? "white"
                          : "var(--text-default)",
                        border: `1px solid ${active ? (isNerd ? "transparent" : "var(--primary)") : "var(--container-border)"}`,
                        boxShadow: active && isNerd ? "0 0 12px color-mix(in srgb, var(--accent-nerd) 40%, transparent)" : "none",
                        fontSize: "var(--font-size-base)",
                        fontWeight: "var(--weight-semibold)",
                        cursor: "pointer",
                        outline: "none",
                        transition: "all 0.3s ease",
                      }}
                    >
                      {label}
                      <span
                        style={{
                          fontSize: "var(--font-size-xs)",
                          opacity: 0.7,
                          fontFeatureSettings: "'tnum'",
                        }}
                      >
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
                        <div key={familyId} style={{ marginBottom: "var(--space-10)" }}>
                          <div className="flex items-center gap-2 mb-4">
                            <h3
                              className="font-serif"
                              style={{
                                color: "var(--text-default)",
                                fontSize: "var(--font-size-2-5xl)",
                                fontWeight: "var(--weight-bold)" as any,
                                margin: 0,
                              }}
                            >
                              {cmsFam?.name || fam?.name}
                            </h3>
                            <span
                              className="type-data"
                              style={{
                                fontSize: "var(--font-size-xs)",
                                color: "var(--text-muted)",
                                fontFeatureSettings: "'tnum'",
                              }}
                            >
                              ({familyStyles.length})
                            </span>
                          </div>
                          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
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
                    <div
                      className="flex items-center justify-center text-center"
                      style={{
                        minHeight: "var(--space-40, 200px)",
                        padding: "var(--space-8)",
                        color: "var(--text-muted)",
                        fontSize: "var(--font-size-base)",
                      }}
                    >
                      {cms.misc.noStyleInFamily}
                    </div>
                  ) : (
                    /* Griglia piatta filtrata */
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
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
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        type: "spring",
        stiffness: 400,
        damping: 28,
        delay: index * 0.04,
      }}
    >
      <TiltCard className="relative rounded-2xl">
        <Link
          to={linkTo}
          state={{ exploreBackTo }}
          className="block rounded-2xl overflow-hidden active:scale-97 transition-transform group"
          style={{
            background: "var(--container-card)",
            border: isNerd ? "1px solid color-mix(in srgb, var(--accent-nerd) 25%, transparent)" : "1px solid var(--container-border-ghost)",
            textDecoration: "none",
            color: "inherit",
          }}
        >
          <div
            className="relative overflow-hidden"
          style={{ aspectRatio: "3/4", containerType: "inline-size" }}
        >
          <ImageWithFallback
            src={photo}
            alt={recipe.name}
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            loading="lazy"
          />
          <div
            className="absolute inset-0"
            style={{ background: "var(--overlay-scrim)" }}
          />

          {/* Badge autenticità — top right */}
          {recipe.authenticity_badge && (
            <div
              className="absolute top-3 right-3 px-2 py-1 rounded-lg"
              title={getAcronymTooltip(recipe.authenticity_badge)}
              style={{
                background:
                  "color-mix(in srgb, var(--primary) 90%, transparent)",
                fontSize: "var(--font-size-xs)",
                fontWeight: "var(--weight-semibold)" as any,
                color: "white",
                backdropFilter: "blur(8px)",
              }}
            >
              {recipe.authenticity_badge}
            </div>
          )}

          {/* Title + sotto-titolo stile */}
          <div className="absolute bottom-0 left-0 right-0 px-4 pb-3.5 sm:pb-4 pt-16">
            <div
              title={getAcronymTooltip(styleName)}
              style={{
                fontSize: "var(--font-size-sm)",
                fontWeight: "var(--weight-semibold)" as any,
                letterSpacing: "var(--tracking-label)",
                textTransform: "uppercase" as const,
                color: "var(--overlay-text-warm)",
                textShadow: "var(--overlay-shadow-text-sm)",
                marginBottom: 4,
              }}
            >
              {styleName}
            </div>
            <span
              className="font-serif"
              style={{
                /* min(…, cqw): nelle colonne strette (griglie 4-col a ~768px)
                   il titolo scala con la larghezza reale della card, così
                   "Friarielli"/"Porchetta" non si spezzano né vengono clippati. */
                fontSize:
                  "min(clamp(var(--font-size-2xl), 3vw, var(--font-size-5xl)), 12cqw)",
                hyphens: "auto",
                overflowWrap: "break-word",
                fontWeight: "var(--weight-bold)" as any,
                lineHeight: "var(--leading-snug)",
                color: "var(--overlay-text)",
                textShadow: "var(--overlay-shadow-text)",
                display: "block",
                letterSpacing: "var(--tracking-snug)",
              }}
            >
              {recipe.name}
            </span>
            {/* Sprint 12 — autore/locale dell'interpretazione (se mappata). */}
            {authorLabel && (
              <div
                style={{
                  marginTop: 4,
                  fontSize: "var(--font-size-xs)",
                  fontWeight: "var(--weight-medium)" as any,
                  letterSpacing: "var(--tracking-snug)",
                  color: "var(--overlay-text-warm)",
                  textShadow: "var(--overlay-shadow-text-sm)",
                  opacity: 0.92,
                }}
              >
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
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        type: "spring",
        stiffness: 400,
        damping: 28,
        delay: index * 0.04,
      }}
    >
      <TiltCard className="relative rounded-2xl">
        <Link
          to={`/recipe/${style.id}?mode=canonical`}
          state={{ exploreBackTo }}
          className="block rounded-2xl overflow-hidden active:scale-97 transition-transform group"
          style={{
            background: "var(--container-card)",
            border: isNerd ? "1px solid color-mix(in srgb, var(--accent-nerd) 25%, transparent)" : "1px solid var(--container-border-ghost)",
            textDecoration: "none",
            color: "inherit",
          }}
        >
          {/* Photo area — 3/4 aspect like Create cards */}
        <div
          className="relative overflow-hidden"
          style={{ aspectRatio: "3/4", containerType: "inline-size" }}
        >
          <ImageWithFallback
            src={photo}
            alt={style.name}
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            loading="lazy"
          />

          {/* Cinematic scrim */}
          <div
            className="absolute inset-0"
            style={{ background: "var(--overlay-scrim)" }}
          />

          {/* Beginner badge — top left */}
          {style.suitable_for_beginner && (
            <div
              className="absolute top-3 left-3 px-2 py-1 rounded-lg"
              style={{
                background:
                  "color-mix(in srgb, var(--cta) 90%, transparent)",
                fontSize: "var(--font-size-xs)",
                fontWeight: "var(--weight-semibold)" as any,
                color: "white",
                backdropFilter: "blur(8px)",
              }}
            >
              {cms.misc.badgeBeginnerFriendly}
            </div>
          )}

          {/* Match canonico + margine ottimizzabile — top right (Fase 4) */}
          {match && (
            <div className="absolute top-3 right-3">
              <div
                className="flex items-center gap-1 px-2 py-0.5 rounded-full text-white"
                style={{
                  background: "color-mix(in srgb, var(--container-page) 82%, transparent)",
                  border: "1px solid color-mix(in srgb, var(--overlay-text) 12%, transparent)",
                  backdropFilter: "blur(12px)",
                  WebkitBackdropFilter: "blur(12px)",
                  fontSize: "var(--font-size-xs)",
                  fontWeight: "var(--weight-bold)" as any,
                  boxShadow: "0 4px 12px color-mix(in srgb, var(--shadow-color) 16%, transparent)",
                }}
                title={match.headroom > 0 ? `Ottimizzabile: ${match.mc}% → ${match.mc + match.headroom}% col tuo setup` : `Match: ${match.mc}%`}
              >
                <span style={{ color: "var(--cta)" }}>{match.mc}%</span>
                {match.headroom > 0 && (
                  <>
                    <span style={{ color: "var(--text-muted)", opacity: 0.6 }}>→</span>
                    <span style={{ color: "var(--time-dayafter)" }}>
                      {match.mc + match.headroom}%
                    </span>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Title + subtitle — overlaid on image (editorial style) */}
          <div className="absolute bottom-0 left-0 right-0 px-4 pb-3.5 sm:pb-4 pt-16">
            <span
              className="font-serif"
              title={getAcronymTooltip(style.name)}
              style={{
                /* min(…, cqw): nelle colonne strette (griglie 4-col a ~768px)
                   il titolo scala con la card: "Contemporanea" non viene più
                   spezzato ("Contemporane/a") né clippato in locale it. */
                fontSize:
                  "min(clamp(var(--font-size-3xl), 3.5vw, var(--font-size-6-5xl)), 10.5cqw)",
                hyphens: "auto",
                overflowWrap: "break-word",
                fontWeight: "var(--weight-bold)" as any,
                lineHeight: "var(--leading-snug)",
                color: "var(--overlay-text)",
                textShadow: "var(--overlay-shadow-text)",
                display: "block",
                letterSpacing: "var(--tracking-snug)",
              }}
            >
              {style.name}
            </span>
            <div
              style={{
                marginTop: 6,
                fontSize: "var(--font-size-sm)",
                fontWeight: "var(--weight-semibold)" as any,
                fontFamily: "var(--font-sans)",
                letterSpacing: "var(--tracking-label)",
                textTransform: "uppercase" as const,
                color: "var(--overlay-text-warm)",
                textShadow: "var(--overlay-shadow-text-sm)",
                lineHeight: "var(--leading-normal)",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {shortOrigin(style.origin).toUpperCase()}
            </div>
          </div>
        </div>
      </Link>
      </TiltCard>
    </motion.div>
  );
}
