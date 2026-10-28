/* === EXPLORE PAGE — VPL-059 ===
   Catalogo completo stili pizza con filtri famiglia e ricette iconiche.
   Layout editoriale e filtri flessibili (Spotify/Pinterest style).
   Tab: Stili — /explore */

import { ArrowRight } from "lucide-react";
import { CompatibilityPill, StyleMetaChip } from "../features/recipe/style-card-parts";
import { AnimatePresence,motion } from "motion/react";
import { useMemo, useState } from "react";
import { Link,useSearchParams } from "react-router";
import { Heading, Surface } from "../components/ds/index";
import { useCms, type CmsContent } from "../features/cms/cms-context";
import { ImageWithFallback } from "../components/media/ImageWithFallback";
import { IMAGE_SIZES } from "../components/media/responsive-images";
import { FireGlow } from "../features/cooking/fire-glow";
import { getInterpretationById } from "../data/interpretation-library";
import {
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
signatureRecipeLink,
type SignatureRecipe,
} from "../data/signature-recipes";
import { canonicalRecipeEntry, recipeFromEntry } from "../use-cases/recipe-entry";
import { stgDepartures } from "../domain/recipe-reference";
import { localizeSignatureRecipe } from "../data/inspiration-i18n/localize";
import { useStylesOverride } from "../context/styles-override-context";
import { TiltCard } from "../features/recipe/tilt-card";
import { kitchenCompatibility, scoreWeightsFromCms } from "../features/recipe/kitchen-compatibility";
import { motionDelay, motionSpring } from "../components/ds/motion";
import { uiMessage } from "../i18n/ui-messages";

/** Badge delle ricette iconiche nella lingua attiva: i dati restano in
 *  italiano (servono anche al dedup con l'autore), il testo mostrato no. */
const SIGNATURE_BADGE_KEYS: Record<string, keyof CmsContent["ui"]> = {
  "Disciplinare AVPN": "badgeAvpnRules",
  "Disciplinare IGP": "badgeIgpRules",
  "Ispirata a Bonci": "badgeBonciMethod",
  "Spuntino romano": "badgeRomanSnack",
  "Stile panaria romana": "badgeRomanBakery",
};

function signatureBadgeText(badge: string, cms: CmsContent): string {
  const key = SIGNATURE_BADGE_KEYS[badge];
  return key ? String(cms.ui[key]) : badge;
}

/** Each line has a role: style context, recipe identity, provenance.
 * Editorial omissions are explicit, rather than guessed from translated words. */
function signatureCardText(recipe: SignatureRecipe, styleName: string) {
  const interpretation = recipe.interpretation_id ? getInterpretationById(recipe.interpretation_id) : undefined;
  return {
    title: recipe.card?.name ?? recipe.name,
    context: recipe.card?.context === undefined ? styleName : recipe.card.context,
    author: recipe.card?.attribution === "badge" ? null
      : interpretation?.author ?? interpretation?.pizzeria ?? interpretation?.organization ?? null,
  };
}

function getAcronymTooltip(text: string | null | undefined): string | undefined {
  if (!text) return undefined;
  const acronyms: Record<string, string> = {
    AVPN: uiMessage("pages.explore.acronym.avpn"),
    STG: uiMessage("pages.explore.acronym.stg"),
    IGP: uiMessage("pages.explore.acronym.igp"),
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
  "regionale",
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
  recipe: rawRecipe,
  isNerd,
  exploreBackTo,
}: {
  recipe: SignatureRecipe;
  isNerd?: boolean;
  exploreBackTo: string;
}) {
  const { cms } = useCms();
  const recipe = localizeSignatureRecipe(rawRecipe, cms.inspirationI18n);
  const [hovered, setHovered] = useState(false);
  const photo =
    recipe.photo ||
    STYLE_PHOTOS[recipe.style_id] ||
    FALLBACK;
  const styleName = STYLES_DB[recipe.style_id]?.name ?? recipe.style_id;

  const cardText = signatureCardText(recipe, styleName);
  const linkTo = signatureRecipeLink(recipe);

  return (
    <article className="explore-feature-shell">
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
          priority
          sizes={IMAGE_SIZES.feature}
        />
        {/* Badge autenticità posizionato sull'immagine */}
        {recipe.authenticity_badge && (
          <div
            className="explore-feature__badge"
            title={getAcronymTooltip(recipe.authenticity_badge)}
          >
            {signatureBadgeText(recipe.authenticity_badge, cms)}
          </div>
        )}
      </div>

      {/* Colonna Testo Solido */}
      <div className="explore-feature__body">
        <div className="explore-feature__head">
          {cardText.context && <span
            className="explore-feature__eyebrow"
            title={getAcronymTooltip(cardText.context)}
          >
            {cardText.context}
          </span>}
          <h2 className="explore-feature__title">
            {cardText.title}
          </h2>
          <p className="explore-feature__desc">
            {recipe.description}
          </p>
          {cardText.author && <p className="explore-feature__desc">{uiMessage("pages.explore.recipeBy", [cardText.author])}</p>}
        </div>

        <div className="explore-feature__cta">
          <span data-slot="cta-label">{cms.pages.exploreRecipe}</span>
          <ArrowRight size={14} />
        </div>
      </div>
    </Link>
    </article>
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

  /* FW-14 (S02-A-08): gruppi e conteggi delle chip dalla stessa funzione
   * (styleMatchesFamily, filtro non esclusivo). Un gruppo elenca anche i membri
   * secondari, con la famiglia principale in didascalia: così «Contemporanea 8»
   * sulla chip e «(8)» sul gruppo coincidono. Prima il gruppo contava solo la
   * primaria (7). */
  const stylesByFamily = useMemo(() => {
    const groups = Object.fromEntries(
      FAMILY_IDS.filter((f): f is FamilyId => f !== "all").map((f) => [f, [] as PizzaStyle[]]),
    ) as Record<FamilyId, PizzaStyle[]>;
    for (const s of styles) {
      for (const fam of Object.keys(groups) as FamilyId[]) {
        if (styleMatchesFamily(s, fam)) groups[fam].push(s);
      }
    }
    return groups;
  }, [styles]);
  const groupedStyles = activeFamily === "all" ? stylesByFamily : null;
  const familyCounts: Record<string, number> = { all: styles.length };
  for (const [fam, list] of Object.entries(stylesByFamily)) familyCounts[fam] = list.length;

  /* FW-14 (S02-A-01): in primo piano la prima ricetta iconica che sulla tua
   * cucina si apre davvero come promette la card: fattibile e, se è STG,
   * senza scostamenti dal disciplinare. Prima era sempre la Margherita
   * «Disciplinare AVPN», che col forno di casa apriva «fuori disciplinare». */
  const featuredRecipe = useMemo(() => {
    const opensAsPromised = (rec: SignatureRecipe) => {
      const style = STYLES_DB[rec.style_id];
      if (!style) return false;
      const interpretation = rec.interpretation_id ? getInterpretationById(rec.interpretation_id) ?? null : undefined;
      const recipe = recipeFromEntry(canonicalRecipeEntry(style, undefined, interpretation), profileConstraints);
      return recipe.verdict.outcome !== "not_feasible"
        && stgDepartures(recipe, profileConstraints.oven_type).length === 0;
    };
    try {
      return SIGNATURE_RECIPES.find(opensAsPromised) ?? SIGNATURE_RECIPES[0];
    } catch {
      return SIGNATURE_RECIPES[0];
    }
  }, [profileConstraints]);
  const previewRecipes = SIGNATURE_RECIPES.filter((r) => r.id !== featuredRecipe?.id).slice(0, 4);

  return (
    <main
      id="main-content"
      className="explore-page"
      data-page="explore"
    >
      {/* Glow sempre attivo (feedback: "rendiamolo evidente in entrambi i mode",
          non solo nerd). Un filo più intenso fuori dalla modalità nerd così
          emerge anche su light, dove il warm si legge meno che su dark. */}
      <FireGlow intensity={isNerd ? 0.3 : 0.36} variant="warm" />
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={motionSpring.standard}
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
                type="button"
                aria-pressed={active}
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
              transition={motionSpring.sectionEnter}
              className="explore-section-stack"
            >
              {/* 1. Hero Card "In primo piano" */}
              {SIGNATURE_RECIPES.length > 0 && (
                <FeaturedRecipeCard
                  recipe={featuredRecipe}
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
                    {uiMessage("pages.explore.allRecipes", [SIGNATURE_RECIPES.length])} <ArrowRight size={12} />
                  </button>
                </div>
                <div data-region="collection" className="explore-grid--preview">
                  {previewRecipes.map((recipe, i) => (
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
                    {cms.pages.exploreFilterStyles}
                  </Heading>
                  <button
                    onClick={() => setExploreFilters("styles")}
                    className="explore-section__link"
                  >
                    {uiMessage("pages.explore.allStyles", [styles.length])} <ArrowRight size={12} />
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
              transition={motionSpring.sectionEnter}
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
              transition={motionSpring.sectionEnter}
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
                      type="button"
                      aria-pressed={active}
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
                  transition={motionSpring.standard}
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
                                primaryFamily={style.family !== familyId
                                  ? cms.families[style.family]?.name || PIZZA_FAMILIES[style.family]?.name
                                  : undefined}
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
  recipe: rawRecipe,
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
  const recipe = localizeSignatureRecipe(rawRecipe, cms.inspirationI18n);
  const photo =
    recipe.photo ||
    cms.media?.stylePhotos?.[recipe.style_id] ||
    STYLE_PHOTOS[recipe.style_id] ||
    FALLBACK;
  const styleName =
    STYLES_DB[recipe.style_id]?.name ?? recipe.style_id;

  const cardText = signatureCardText(recipe, styleName);
  const linkTo = signatureRecipeLink(recipe);

  return (
    <motion.article
      data-region="card"
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        ...motionSpring.collectionEnter,
        delay: index * motionDelay.micro,
      }}
    >
      <TiltCard className="explore-tilt">
        <Surface
          as={Link}
          variant="container"
          to={linkTo}
          state={{ exploreBackTo }}
          className={`explore-card${isNerd ? " explore-card--nerd" : ""}`}
        >
          <figure className="explore-card__media">
          <ImageWithFallback
            src={photo}
            alt={recipe.name}
            className="explore-card__image"
            loading="lazy"
            sizes={IMAGE_SIZES.card}
          />

          {/* Badge autenticità — top right */}
          {recipe.authenticity_badge && (
            <div
              className="explore-card__badge explore-card__badge--auth"
              title={getAcronymTooltip(recipe.authenticity_badge)}
            >
              {signatureBadgeText(recipe.authenticity_badge, cms)}
            </div>
          )}

          {/* Title + sotto-titolo stile */}
          <figcaption className="explore-card__caption">
            {cardText.context && <div
              className="explore-card__eyebrow"
              title={getAcronymTooltip(cardText.context)}
            >
              {cardText.context}
            </div>}
            <h3 className="explore-card__title explore-card__title--recipe">
              {cardText.title}
            </h3>
            {/* Sprint 12 — autore/locale dell'interpretazione (se mappata). */}
            {cardText.author && (
              <div className="explore-card__author">
                {uiMessage("pages.explore.recipeBy", [cardText.author])}
              </div>
            )}
          </figcaption>
        </figure>
      </Surface>
      </TiltCard>
    </motion.article>
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
  primaryFamily,
}: {
  style: PizzaStyle;
  index: number;
  cms: any;
  isNerd?: boolean;
  exploreBackTo: string;
  constraints: UserConstraints;
  /** FW-14: in un gruppo di famiglia secondaria, il nome della primaria. */
  primaryFamily?: string;
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
      // D-041: stesso numero di Crea, della scheda e della ricetta aperta.
      return kitchenCompatibility(style, constraints, scoreWeightsFromCms(cms));
    } catch {
      return null;
    }
  }, [style, constraints, cms]);

  return (
    <motion.article
      data-region="card"
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        ...motionSpring.collectionEnter,
        delay: index * motionDelay.micro,
      }}
    >
      <TiltCard className="explore-tilt">
        <Surface
          as={Link}
          variant="container"
          to={`/recipe/${style.id}?mode=canonical`}
          state={{ exploreBackTo }}
          className={`explore-card${isNerd ? " explore-card--nerd" : ""}`}
        >
          {/* Photo area — 3/4 aspect like Create cards */}
        <figure className="explore-card__media">
          <ImageWithFallback
            src={photo}
            alt={style.name}
            className="explore-card__image"
            loading="lazy"
            sizes={IMAGE_SIZES.card}
          />

          {/* Title + subtitle — overlaid on image (editorial style) */}
          <figcaption className="explore-card__caption">
            <h3
              className="explore-card__title explore-card__title--style"
              title={getAcronymTooltip(style.name)}
            >
              {style.name}
            </h3>
            <div className="explore-card__origin">
              {shortOrigin(style.origin)}
            </div>
            {primaryFamily && (
              <p className="explore-card__family-note">
                {uiMessage("pages.explore.primaryFamily", [primaryFamily])}
              </p>
            )}
            <StyleMetaChip style={style} cms={cms} recipe={match?.recipe} context="explore" />
          </figcaption>
        </figure>
      </Surface>
          {/* Compatibilità con la tua cucina — in alto a destra, come in Crea */}
          {match && (
            <div className="explore-card__match">
              <CompatibilityPill now={match.now} blocked={match.recipe.verdict.outcome === "not_feasible"} />
            </div>
          )}


      </TiltCard>
    </motion.article>
  );
}
