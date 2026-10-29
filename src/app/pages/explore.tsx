/* === EXPLORE PAGE — VPL-059 ===
   Catalogo completo stili pizza con filtri famiglia e ricette iconiche.
   Layout editoriale e filtri flessibili (Spotify/Pinterest style).
   Tab: Stili — /explore */

import { ArrowRight } from "lucide-react";
import { CompatibilityPill, StyleMetaChip } from "../features/recipe/style-card-parts";
import { AnimatePresence,motion } from "motion/react";
import { useId, useMemo, useState } from "react";
import { Link,useSearchParams } from "react-router";
import { EmptyState, Heading, Surface } from "../components/ds/index";
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
import { compareByCompatibility, kitchenMargin } from "../domain/kitchen-margin";
import { canonicalRecipe, referenceCompatibility, scoreWeightsFromCms, styleWithSelectedTopping } from "../features/recipe/kitchen-compatibility";
import { motionDelay, motionSpring } from "../components/ds/motion";
import { uiMessage } from "../i18n/ui-messages";
import { useDetailLevel } from "../hooks/use-detail-level";
import { createFormatter, placeNameLocalizer } from "../features/cms/i18n";

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

/** FW-03 (S02-A-10): spiegazione delle sigle per aria-describedby sul link
 * della card, non più in title= (irraggiungibile al tocco e da tastiera). */
function getAcronymTooltip(...texts: (string | null | undefined)[]): string | undefined {
  const text = texts.filter(Boolean).join(" ");
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


/* FW-12 (S02-A-14): ordine del nome accessibile delle card ricetta. */
function cardLabelIds(
  baseId: string,
  text: { context?: string | null; author?: string | null },
  hasBadge: boolean,
): string {
  return [
    `${baseId}-title`,
    text.context ? `${baseId}-context` : null,
    text.author ? `${baseId}-author` : null,
    hasBadge ? `${baseId}-badge` : null,
  ].filter(Boolean).join(" ");
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
  const acronymHelpId = useId();
  const acronymHelp = getAcronymTooltip(recipe.authenticity_badge, cardText.context);
  /* FW-12 (S02-A-14): il nome del link parte dal titolo, poi contesto,
     autore e badge, separati (aria-labelledby unisce con spazi). */
  const nameId = useId();
  const labelledBy = cardLabelIds(nameId, cardText, !!recipe.authenticity_badge);

  const linkTo = signatureRecipeLink(recipe);

  return (
    <article className="explore-feature-shell">
    <Link
      to={linkTo}
      aria-labelledby={labelledBy}
      aria-describedby={acronymHelp ? `${nameId}-desc ${acronymHelpId}` : `${nameId}-desc`}
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
          alt=""
          className="explore-feature__image"
          priority
          sizes={IMAGE_SIZES.feature}
        />
        {/* Badge autenticità posizionato sull'immagine */}
        {recipe.authenticity_badge && (
          <div id={`${nameId}-badge`} className="explore-feature__badge">
            {signatureBadgeText(recipe.authenticity_badge, cms)}
          </div>
        )}
      </div>

      {/* Colonna Testo Solido */}
      <div className="explore-feature__body">
        <div className="explore-feature__head">
          {acronymHelp && <span hidden id={acronymHelpId}>{acronymHelp}</span>}
          {cardText.context && <span id={`${nameId}-context`} className="explore-feature__eyebrow">
            {cardText.context}
          </span>}
          <h2 id={`${nameId}-title`} className="explore-feature__title">
            {cardText.title}
          </h2>
          <p id={`${nameId}-desc`} className="explore-feature__desc">
            {recipe.description}
          </p>
          {cardText.author && <p id={`${nameId}-author`} className="explore-feature__desc">{uiMessage("pages.explore.recipeBy", [cardText.author])}</p>}
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

  /* FW-08: stesso stato «Dettagli tecnici» di Profilo, Crea e scheda. */
  const isNerd = useDetailLevel().level === "technical";

  const styles = useMemo(() => {
    const db = effectiveStyles ?? STYLES_DB;
    return Object.values(db);
  }, [effectiveStyles]);

  /* FW-10 (D-H, S02-A-03): l'anteprima apre con ciò che la tua cucina
     permette. Prima gli stili fattibili, poi per compatibilità decrescente;
     a pari numero più margine di forno e tempo (D-062), poi l'ordine del
     database. La vista completa non cambia. */
  const kitchenRank = useMemo(() => {
    const weights = scoreWeightsFromCms(cms);
    const rank = (style: PizzaStyle | undefined) => {
      if (!style) return { blocked: true, now: 0, margin: 0 };
      try {
        const recipe = canonicalRecipe(style, profileConstraints, weights);
        return { blocked: recipe.verdict.outcome === "not_feasible", now: recipe.scores.composite, margin: kitchenMargin(style, profileConstraints) };
      } catch {
        return { blocked: true, now: 0, margin: 0 };
      }
    };
    const sortBy = <T,>(items: readonly T[], styleOf: (item: T) => PizzaStyle | undefined) => {
      const ranked = items.map((item, index) => ({ item, index, ...rank(styleOf(item)) }));
      ranked.sort((a, b) => Number(a.blocked) - Number(b.blocked)
        || compareByCompatibility({ score: a.now, margin: a.margin }, { score: b.now, margin: b.margin })
        || a.index - b.index);
      return ranked;
    };
    const stylesRanked = sortBy(styles, (style) => style);
    const recipesRanked = sortBy(SIGNATURE_RECIPES, (recipe) => {
      const base = (effectiveStyles ?? STYLES_DB)[recipe.style_id];
      return base ? styleWithSelectedTopping(base, recipe.topping_concept_id) : undefined;
    });
    /* FW-14 (S02-A-01): in primo piano la prima ricetta iconica che sulla tua
     * cucina si apre davvero come promette la card: fattibile e, se è STG,
     * senza scostamenti dal disciplinare. Prima era sempre la Margherita
     * «Disciplinare AVPN», che col forno di casa apriva «fuori disciplinare». */
    const opensAsPromised = (rec: SignatureRecipe) => {
      const style = STYLES_DB[rec.style_id];
      if (!style) return false;
      try {
        const interpretation = rec.interpretation_id ? getInterpretationById(rec.interpretation_id) ?? null : undefined;
        const recipe = recipeFromEntry(canonicalRecipeEntry(style, undefined, interpretation), profileConstraints);
        return recipe.verdict.outcome !== "not_feasible"
          && stgDepartures(recipe, profileConstraints.oven_type).length === 0;
      } catch {
        return false;
      }
    };
    const featured = recipesRanked.find((r) => !r.blocked && opensAsPromised(r.item))?.item
      ?? recipesRanked.find((r) => !r.blocked)?.item
      ?? SIGNATURE_RECIPES[0];
    return {
      styles: stylesRanked.slice(0, 4),
      featured,
      recipes: recipesRanked.filter((r) => r.item !== featured).slice(0, 4).map((r) => r.item),
    };
  }, [styles, effectiveStyles, profileConstraints, cms]);
  const previewForKitchen = kitchenRank.styles.some((entry) => !entry.blocked);

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
                  recipe={kitchenRank.featured}
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
                    type="button"
                    onClick={() => setExploreFilters("recipes")}
                    className="explore-section__link"
                  >
                    {uiMessage("pages.explore.allRecipes", [SIGNATURE_RECIPES.length])} <ArrowRight size={12} />
                  </button>
                </div>
                <div data-region="collection" className="explore-grid--preview">
                  {kitchenRank.recipes.map((recipe, i) => (
                    <SignatureRecipeCard
                      key={recipe.id}
                      recipe={recipe}
                      index={i}
                      cms={cms}
                      isNerd={isNerd}
                      exploreBackTo={exploreBackTo}
                      constraints={profileConstraints}
                    />
                  ))}
                </div>
              </section>

              {/* 3. Anteprima Stili Tradizionali */}
              <section>
                <div className="explore-section__head">
                  <Heading level="md" as="h2">
                    {previewForKitchen ? uiMessage("explore.forKitchen") : cms.pages.exploreFilterStyles}
                  </Heading>
                  <button
                    type="button"
                    onClick={() => setExploreFilters("styles")}
                    className="explore-section__link"
                  >
                    {uiMessage("pages.explore.allStyles", [styles.length])} <ArrowRight size={12} />
                  </button>
                </div>
                <div data-region="collection" className="explore-grid--preview">
                  {kitchenRank.styles.map(({ item: style }, i) => (
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
                    constraints={profileConstraints}
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
                      ? uiMessage("pages.explore.familyAll")
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
                            {/* FW-12 (S02-B-11): gruppo h2, card h3 (prima h1 → h3). */}
                            <h2 className="explore-family-group__title">
                              {cmsFam?.name || fam?.name}
                            </h2>
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
                    /* FW-09 (S02-A-13): qui il filtro famiglia non dipende dal profilo. */
                    <EmptyState
                      title={uiMessage("pages.explore.noStyleInFamily")}
                      actions={[{ label: cms.misc.showAllStyles, onClick: () => setExploreFilters("styles", "all") }]}
                      headingLevel={3}
                      className="explore-empty-state"
                    />
                  ) : (
                    /* Griglia piatta filtrata */
                    <>
                    {/* FW-12 (S02-B-11): titolo h2 della famiglia per chi naviga per titoli. */}
                    <h2 className="sr-only">
                      {cms.families[activeFamily as FamilyId]?.name || PIZZA_FAMILIES[activeFamily as FamilyId]?.name}
                    </h2>
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
                    </>
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
  constraints,
}: {
  recipe: SignatureRecipe;
  index: number;
  cms: any;
  isNerd?: boolean;
  exploreBackTo: string;
  constraints: UserConstraints;
}) {
  const recipe = localizeSignatureRecipe(rawRecipe, cms.inspirationI18n);
  /* FW-10 (S02-A-07): le ricette iconiche dicono se si possono fare, come gli
     stili, con il condimento della ricetta. */
  const baseStyle = STYLES_DB[rawRecipe.style_id];
  const match = useMemo(() => {
    if (!baseStyle) return null;
    try {
      return referenceCompatibility(styleWithSelectedTopping(baseStyle, rawRecipe.topping_concept_id), constraints, scoreWeightsFromCms(cms));
    } catch {
      return null;
    }
  }, [baseStyle, rawRecipe.topping_concept_id, constraints, cms]);
  const photo =
    recipe.photo ||
    cms.media?.stylePhotos?.[recipe.style_id] ||
    STYLE_PHOTOS[recipe.style_id] ||
    FALLBACK;
  const styleName =
    STYLES_DB[recipe.style_id]?.name ?? recipe.style_id;

  const cardText = signatureCardText(recipe, styleName);
  const acronymHelpId = useId();
  const acronymHelp = getAcronymTooltip(recipe.authenticity_badge, cardText.context);
  /* FW-12 (S02-A-14): vedi FeaturedRecipeCard. */
  const nameId = useId();
  const labelledBy = cardLabelIds(nameId, cardText, !!recipe.authenticity_badge);
  /* I segnali di blocco (forno, allergeni, dieta, tempi) stanno nel link ma
     fuori da aria-labelledby: entrano nella descrizione accessibile. */
  const showSignals = !!(baseStyle && match);
  const signalsId = showSignals ? `${nameId}-signals` : "";

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
          aria-labelledby={labelledBy}
          aria-describedby={[signalsId, acronymHelp ? acronymHelpId : ""].filter(Boolean).join(" ") || undefined}
          className={`explore-card${isNerd ? " explore-card--nerd" : ""}`}
        >
          <figure className="explore-card__media">
          <ImageWithFallback
            src={photo}
            alt=""
            className="explore-card__image"
            loading="lazy"
            sizes={IMAGE_SIZES.card}
          />

          {/* Title + sotto-titolo stile */}
          <figcaption className="explore-card__caption">
            {acronymHelp && <span hidden id={acronymHelpId}>{acronymHelp}</span>}
            {/* Badge autenticità: nella didascalia, l'angolo in alto è della
                compatibilità con la tua cucina (FW-10). */}
            {recipe.authenticity_badge && (
              <div id={`${nameId}-badge`} className="explore-card__badge explore-card__badge--auth">
                {signatureBadgeText(recipe.authenticity_badge, cms)}
              </div>
            )}
            {cardText.context && <div id={`${nameId}-context`} className="explore-card__eyebrow">
              {cardText.context}
            </div>}
            <h3 id={`${nameId}-title`} className="explore-card__title explore-card__title--recipe">
              {cardText.title}
            </h3>
            {/* Sprint 12 — autore/locale dell'interpretazione (se mappata). */}
            {cardText.author && (
              <div id={`${nameId}-author`} className="explore-card__author">
                {uiMessage("pages.explore.recipeBy", [cardText.author])}
              </div>
            )}
            {baseStyle && match && <StyleMetaChip id={signalsId} style={baseStyle} cms={cms} recipe={match.recipe} context="explore" />}
          </figcaption>
        </figure>
      </Surface>
          {match && (
            <div className="explore-card__match">
              <CompatibilityPill now={match.now} blocked={match.recipe.verdict.outcome === "not_feasible"} recipe={match.recipe} />
            </div>
          )}
      </TiltCard>
    </motion.article>
  );
}

/* ═══ FW-08 (S02-A-05/B-13): riga tecnica delle card con «Dettagli tecnici» ═══
   Valori di riferimento dello stile (idratazione, forno ideale, lievitazione),
   per confrontare gli stili senza aprire ogni scheda. */
function StyleTechLine({ style, cms }: { style: PizzaStyle; cms: CmsContent }) {
  const { bcp47 } = useCms();
  const fmt = createFormatter(cms.ui, bcp47);
  const [hLo, hHi] = style.dough.hydration_pct_range;
  const [fLo, fHi] = style.dough.fermentation_hours_range;
  const range = (lo: number, hi: string) => uiMessage("detailLevel.range", [fmt.number(lo), hi]);
  return (
    <p className="type-data-xs explore-card__tech" data-region="tech">
      {uiMessage("detailLevel.styleTechLine", [
        range(hLo, fmt.percent(hHi)),
        fmt.celsius(style.baking.temp_c_ideal),
        range(fLo, fmt.durationShort(fHi)),
      ])}
    </p>
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
  // FW-06 (S07-A-17): il numero del riferimento sulla tua cucina; nessuna
  // pill «↗+Δ» (non esiste) e nessuna ottimizzazione per card.
  const match = useMemo(() => {
    try {
      return referenceCompatibility(style, constraints, scoreWeightsFromCms(cms));
    } catch {
      return null;
    }
  }, [style, constraints, cms]);
  const acronymHelpId = useId();
  const acronymHelp = getAcronymTooltip(style.name);

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
          aria-describedby={acronymHelp ? acronymHelpId : undefined}
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
            <h3 className="explore-card__title explore-card__title--style">
              {style.name}
            </h3>
            {acronymHelp && <span hidden id={acronymHelpId}>{acronymHelp}</span>}
            <div className="explore-card__origin">
              {shortOrigin(style.origin, placeNameLocalizer(cms))}
            </div>
            {primaryFamily && (
              <p className="explore-card__family-note">
                {uiMessage("pages.explore.primaryFamily", [primaryFamily])}
              </p>
            )}
            <StyleMetaChip style={style} cms={cms} recipe={match?.recipe} context="explore" />
            {isNerd && <StyleTechLine style={style} cms={cms} />}
          </figcaption>
        </figure>
      </Surface>
          {/* Compatibilità con la tua cucina — in alto a destra, come in Crea */}
          {match && (
            <div className="explore-card__match">
              <CompatibilityPill now={match.now} blocked={match.recipe.verdict.outcome === "not_feasible"} recipe={match.recipe} />
            </div>
          )}


      </TiltCard>
    </motion.article>
  );
}
