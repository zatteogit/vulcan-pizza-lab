/* ═══ RECIPE VIEW — impianto condiviso scheda ricetta (VPL-081) ═══
 * Unifica la scheda raggiunta da Scopri (/recipe/:id) e quella generata da
 * Crea (home result): STESSA view con tab Ricetta / Procedimento,
 * stesse larghezze e tipografia. Le differenze ("dovute differenze") passano
 * per props:
 *   - tailored: Crea posiziona la ricetta sui parametri dati ("su misura");
 *     Scopri parte da parametri standard e indica la fattibilità.
 *   - back: Crea torna allo step stili; Scopri torna a /explore.
 *   - matchSlot / introExtraSlot / recipeControls: contenuti specifici.
 * Il selettore tab (RecipeSectionTabs) qui è finalmente montato: il layer
 * PizzaNerd vive dentro Ricetta/Procedimento quando abilitato dal Profilo. */

import { useEffect, useMemo, type ReactNode } from "react";
import { Link } from "react-router";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "motion/react";
import { ChevronLeft, RotateCcw } from "lucide-react";
import { Heading, IconButton } from "../../components/ds/index";
import { ImageWithFallback } from "../../components/media/ImageWithFallback";
import { RecipeOutput } from "./recipe-output";
import { RecipeSectionTabs, type RecipePrimaryTab } from "./recipe-section-tabs";
import { getToppingForStyle, getRecipesByAuthenticity, TOPPING_CONCEPTS } from "../../data/topping-library";
import { useIsMobile } from "../../hooks/use-mobile";
import { FireGlow } from "../cooking/fire-glow";
import { useCms, type CmsContent } from "../cms/cms-context";
import { createFormatter, formatLengthCopy } from "../cms/i18n";
import {
  localizeHydrationCategory,
  localizeCrustType,
  isFillingStyle,
  type PizzaStyle,
  type UserConstraints,
  type GeneratedRecipe,
  type PanConfig,
} from "../../domain/pizza-engine";

interface RecipeViewBack {
  label: string;
  /** Navigazione (Scopri → /explore) */
  to?: string;
  /** Handler (Crea → torna allo step stili) */
  onClick?: () => void;
  /** Classi di posizione per il pulsante fisso. Default top-4 left-4.
   *  Crea passa un offset md per non finire sotto la sidebar rail. */
  positionClassName?: string;
}

interface RecipeViewProps {
  recipe: GeneratedRecipe;
  style: PizzaStyle;
  photo: string;
  cms: CmsContent;
  constraints: UserConstraints;
  onConstraintsChange: (c: UserConstraints) => void;
  panConfig: PanConfig;
  activeTab: RecipePrimaryTab;
  onTabChange: (tab: RecipePrimaryTab) => void;
  back: RecipeViewBack;
  /** "Ricetta su misura" (Crea) vs "Ricetta" (Scopri) */
  recipeTabLabel?: string;
  eyebrow?: string;
  /** Firma d'origine (redesign lug 2026): l'eyebrow è l'UNICA dichiarazione
   *  di origine della scheda, con identità cromatica fissa — salvia = su
   *  misura (il colore dell'ottimizzatore), terracotta = canonica. Al
   *  crossing dei poli il colore transisce insieme al testo. */
  eyebrowTone?: "canonical" | "tailored";
  /** Card match/fattibilità (Scopri) o score (Crea) sotto la descrizione */
  matchSlot?: ReactNode;
  /** Extra editoriale sotto l'intro (es. "Approfondisci" su Scopri) */
  introExtraSlot?: ReactNode;
  /** Controlli sopra gli ingredienti (StatStrip + Personalizza / warning) */
  recipeControls?: ReactNode;
  shareUrl?: string;
  showStickyHeader?: boolean;
  selectedToppingConcept?: string | null;
  onSelectTopping?: (conceptId: string) => void;
  nerdMode?: boolean;
  nerdAvailable?: boolean;
  onNerdModeChange?: (nerd: boolean) => void;
  isPersonalized?: boolean;
  onRequestPersonalization?: () => void;
  /** "Torna all'originale" (round 6, nota Matteo): riporta alla BASE attiva
   *  (canonica dello stile o variante selezionata). Vive accanto all'eyebrow
   *  — chi dichiara la divergenza offre anche il ritorno. Passato solo
   *  quando la ricetta è dirty. */
  onResetToOriginal?: () => void;
  /* Usati da Crea (scheda su misura) */
  selectedFlourId?: string | null;
  onSelectFlour?: (flour: import("../../data/flour-database").FlourEntry | null) => void;
  selectedTimeSlotId?: string | null;
}

export function RecipeView({
  recipe,
  style,
  photo,
  cms,
  constraints,
  onConstraintsChange,
  panConfig,
  activeTab,
  onTabChange,
  back,
  recipeTabLabel = "Ricetta",
  eyebrow = "Ricetta",
  eyebrowTone = "canonical",
  matchSlot,
  introExtraSlot,
  recipeControls,
  showStickyHeader = false,
  selectedToppingConcept,
  onSelectTopping,
  nerdMode = false,
  nerdAvailable = false,
  onNerdModeChange,
  isPersonalized = true,
  onRequestPersonalization,
  onResetToOriginal,
  selectedFlourId,
  onSelectFlour,
  selectedTimeSlotId,
}: RecipeViewProps) {
  /* Parallax hero (identico alla scheda Scopri originale). Con
     prefers-reduced-motion il movimento scroll-driven si spegne (resta il
     solo scrim, che è una dissolvenza, non un moto). */
  const { scrollY } = useScroll();
  const prefersReducedMotion = useReducedMotion();
  const isMobile = useIsMobile();
  const { bcp47 } = useCms();
  const fmt = createFormatter(cms.ui, bcp47);
  const heroImageY = useTransform(
    scrollY,
    [0, 400],
    prefersReducedMotion ? [0, 0] : [0, 80]
  );
  const heroImageScale = useTransform(
    scrollY,
    [0, 400],
    prefersReducedMotion ? [1, 1] : [1.02, 1.15]
  );
  const heroOverlayOpacity = useTransform(scrollY, [0, 300], [0, 0.65]);
  const cardY = useTransform(
    scrollY,
    [0, 400],
    prefersReducedMotion ? [0, 0] : [0, -20]
  );

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [activeTab]);

  const isHeroReduced = activeTab !== "ricetta";

  // Resolve topping using the exact same fallback hierarchy as recipe-output.tsx
  const allToppingChoices = useMemo(() => {
    const ranked = getRecipesByAuthenticity(style).filter(
      (item) => item.authenticity !== "taboo"
    );
    const seen = new Set<string>();
    return ranked.filter((item) => {
      const key = item.recipe.concept_ref;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [style]);

  const toppingChoices = useMemo(() => {
    const featured = allToppingChoices.filter(
      (item) => item.authenticity !== "taboo"
    );
    const activeConceptId = selectedToppingConcept ?? null;
    if (
      activeConceptId &&
      !featured.some((item) => item.recipe.id === activeConceptId)
    ) {
      const activeChoice = allToppingChoices.find(
        (item) => item.recipe.id === activeConceptId
      );
      if (activeChoice) return [activeChoice, ...featured];
    }
    return featured;
  }, [allToppingChoices, selectedToppingConcept]);

  const toppingSubtitle = useMemo(() => {
    const selectedTopping = selectedToppingConcept
      ? getToppingForStyle(selectedToppingConcept, style)
      : undefined;
    
    const fallbackToppingRefId = style.default_topping_ref;
    
    const resolvedTopping =
      selectedTopping ??
      toppingChoices[0]?.recipe ??
      (fallbackToppingRefId
        ? getToppingForStyle(fallbackToppingRefId, style)
        : undefined) ??
      allToppingChoices.find((c) => c.authenticity !== "taboo")?.recipe;
      
    const conceptName = resolvedTopping ? TOPPING_CONCEPTS[resolvedTopping.concept_ref]?.name : undefined;
    const recipeName = resolvedTopping ? (resolvedTopping as any).name : undefined;
    
    return recipeName || conceptName || resolvedTopping?.variant_name || (cms.cooking.toppingTitle ?? "Condimento");
  }, [selectedToppingConcept, style, toppingChoices, allToppingChoices, cms.cooking.toppingTitle]);

  const preFermentText = recipe.has_pre_ferment
    ? (recipe.pre_ferment_type 
        ? recipe.pre_ferment_type.charAt(0).toUpperCase() + recipe.pre_ferment_type.slice(1) 
        : "Prefermento")
    : "Diretto";
  const procedureSubtitle = `${preFermentText} • ${recipe.fermentation_hours}h`;

  /* Niente sottotitolo sul tab Ricetta: ripeteva il nome dello stile che
     campeggia già nell'hero (sempre visibile, anche a hero ridotto). */
  const resolvedMarginTop = isHeroReduced
    ? (showStickyHeader ? "var(--space-4, 16px)" : "var(--space-20, 80px)")
    : "calc(-1 * var(--space-19, 4.75rem))";

  const heroEyebrow = eyebrow;
  const heroTitle = style.name;
  const localizedStyleTags =
    cms.styleChars?.[style.id]
      ?.split("|")
      .map((tag) => tag.trim())
      .map((tag) => formatLengthCopy(tag, fmt))
      .filter(Boolean)
      .slice(0, 3) ?? [];
  const fallbackStyleTags = [
    cms.families?.[style.family]?.name ?? style.family,
    localizeHydrationCategory(style.hydration_category),
    localizeCrustType(style.crust_type),
  ];

  /* Round 4 (nota Matteo): l'hero è eyebrow · titolo · riga meta — la
     descrizione lunga duplicava la meta e vive nell'Approfondisci. */
  const heroTags =
    localizedStyleTags.length > 0 ? localizedStyleTags : fallbackStyleTags;

  const eyebrowIsTailored = eyebrowTone === "tailored";

  return (
    <div className="recipe-view">
      {/* Sfondo caldo base. Il glow PizzaNerd vive solo nei blocchi tecnici. */}
      <FireGlow variant="warm" intensity={0.22} />

      {/* Sticky header or Floating back button */}
      {showStickyHeader ? (
        <header data-region="toolbar" className="recipe-view-toolbar">
          <div className="recipe-view-toolbar__inner">
            {back.to ? (
              <Link to={back.to} className="recipe-view-toolbar__back">
                <ChevronLeft size={18} />
                <span data-slot="label">{back.label}</span>
              </Link>
            ) : (
              <button
                type="button"
                onClick={back.onClick}
                className="recipe-view-toolbar__back"
              >
                <ChevronLeft size={18} />
                <span data-slot="label">{back.label}</span>
              </button>
            )}
            <div className="recipe-view-toolbar__spacer" />
            <div id="recipe-header-actions" className="recipe-view-toolbar__actions" />
          </div>
        </header>
      ) : (
        <motion.div
          className="recipe-view-back"
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 360, damping: 31, mass: 0.72 }}
        >
          {back.to ? (
            <IconButton
              as={Link}
              to={back.to}
              size="lg"
              variant="bare"
              className="recipe-view-back__button"
              aria-label={back.label}
              title={back.label}
            >
              <ChevronLeft size={20} />
            </IconButton>
          ) : (
            <IconButton
              type="button"
              onClick={back.onClick}
              size="lg"
              variant="bare"
              className="recipe-view-back__button"
              aria-label={back.label}
              title={back.label}
            >
              <ChevronLeft size={20} />
            </IconButton>
          )}
        </motion.div>
      )}

      {/* ── Hero photo ── */}
      <motion.div
        data-region="hero"
        className="recipe-view-hero"
        animate={{ height: isHeroReduced ? 0 : "clamp(220px, 32vh, 400px)" }}
        transition={{ type: "spring", stiffness: 280, damping: 28 }}
      >
        <div className="recipe-view-hero__frame">
          <div className="recipe-view-hero__clip">
            <motion.div
              className="recipe-view-hero__parallax"
              style={{ y: heroImageY, scale: heroImageScale }}
            >
              <ImageWithFallback
                src={photo}
                alt={style.name}
                className="recipe-view-hero__image"
              />
            </motion.div>
            <motion.div
              className="recipe-view-hero__scrim"
              style={{ opacity: heroOverlayOpacity }}
            />
            <div className="recipe-view-hero__gradient" />
          </div>
        </div>
      </motion.div>

      {/* ── Glassmorphic title card / Header ── */}
      <motion.div
        layout
        data-region="page-header"
        className="recipe-view-header"
        animate={{ marginTop: resolvedMarginTop }}
        transition={{ type: "spring", stiffness: 280, damping: 28 }}
      >
        <motion.div
          layout
          className={isHeroReduced ? "recipe-view-card recipe-view-card--reduced" : "recipe-view-card"}
          style={{ y: isHeroReduced ? 0 : cardY }}
          transition={{ type: "spring", stiffness: 280, damping: 28 }}
        >
          <div
            className={
              isHeroReduced
                ? "recipe-view-card__body recipe-view-card__body--reduced"
                : "recipe-view-card__body"
            }
          >
            {/* Eyebrow — firma d'origine colorata (unica dichiarazione).
                Accanto, quando la ricetta è dirty, il ritorno alla base:
                chi dichiara la divergenza offre anche la via del ritorno. */}
            <motion.div
              layout
              className="recipe-view-eyebrow-row"
              transition={{ type: "spring", stiffness: 280, damping: 28 }}
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={heroEyebrow}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.18, ease: "easeOut" }}
                  className={
                    eyebrowIsTailored
                      ? "recipe-view-eyebrow recipe-view-eyebrow--tailored"
                      : "recipe-view-eyebrow"
                  }
                >
                  {heroEyebrow}
                </motion.span>
              </AnimatePresence>
              <AnimatePresence initial={false}>
                {onResetToOriginal && !isHeroReduced && (
                  <motion.button
                    key="reset-to-original"
                    type="button"
                    onClick={onResetToOriginal}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    whileTap={{ scale: 0.95 }}
                    className="recipe-view-reset"
                  >
                    <RotateCcw size={12} className="recipe-view-reset__icon" aria-hidden="true" />
                    {cms.cooking.resetToOriginal}
                  </motion.button>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Title — il pill Condividi NON vive più qui: collideva con la
                chrome fissa in alto a destra (widget pizzata attiva / profilo).
                Condividi è un link quieto nella riga-utilità sotto la
                descrizione, accanto ad Approfondisci. */}
            <motion.div
              layout
              className="recipe-view-title-row"
              transition={{ type: "spring", stiffness: 280, damping: 28 }}
            >
              <Heading level="page" className="recipe-view-title">
                {heroTitle}
              </Heading>
            </motion.div>

            {/* Description + Tags inside the card (rendered only in Ricetta tab) */}
            <AnimatePresence>
              {!isHeroReduced && (
                <motion.div
                  key="expanded-card-content"
                  initial={{ opacity: 0, y: 8, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: "auto" }}
                  exit={{ opacity: 0, y: -8, height: 0 }}
                  transition={{
                    height: { type: "spring", stiffness: 280, damping: 28 },
                    y: { type: "spring", stiffness: 280, damping: 28 },
                    opacity: { duration: 0.18, ease: "easeInOut" }
                  }}
                  className="recipe-view-expanded"
                >
                  {/* Round 3 "pulizia": le caratteristiche non sono più 3 chip
                      (scatole che ricalcavano la descrizione) ma UNA riga meta
                      muta — è metadata, non azione. */}
                  {(heroTags.length > 0 || introExtraSlot) && (
                    <div className="recipe-view-meta-row">
                      {heroTags.length > 0 && (
                        <p className="recipe-view-tags">
                          {heroTags
                            .map((tag) =>
                              tag ? tag.charAt(0).toUpperCase() + tag.slice(1) : tag,
                            )
                            /* Ogni caratteristica è un'unità: va a capo solo sui
                               separatori, mai a metà valore ("Maturazione 24-72h"). */
                            .map((tag) => tag.replace(/ /g, " "))
                            .join(" · ")}
                        </p>
                      )}
                      {introExtraSlot}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>

      {/* ── Contenuto ── */}
      <div data-region="body" id="recipe-content-tabs-anchor" className="recipe-view-body">
        <div className="recipe-view-content">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 30, delay: 0.08 }}
          >
            {!isMobile && (
              <RecipeSectionTabs
                variant="inline"
                activeTab={activeTab}
                recipeLabel={recipeTabLabel}
                onChange={onTabChange}
                fillingMode={isFillingStyle(recipe.style)}
                /* VPL-A3: senza sticky header restano i controlli flottanti
                 * (back + Inizia) a top-4 / h-10 → bottom ~56px. Il pill sticky
                 * (z-30, sotto i controlli z-50) deve fissarsi sotto di essi per
                 * non finirgli sotto sui bordi a larghezza tablet. */
                stickyTop={showStickyHeader ? 56 : 64}
                procedureSubtitle={procedureSubtitle}
                toppingSubtitle={toppingSubtitle}
              />
            )}

            <RecipeOutput
              recipe={recipe}
              constraints={constraints}
              onConstraintsChange={onConstraintsChange}
              nerdMode={nerdMode}
              simple={!nerdMode}
              panConfig={panConfig}
              forcedTab={activeTab}
              onTabChange={onTabChange}
              hidePager
              hideContextSummary
              selectedToppingConcept={selectedToppingConcept}
              onSelectTopping={onSelectTopping}
              recipeControls={recipeControls}
              selectedFlourId={selectedFlourId}
              onSelectFlour={onSelectFlour}
              selectedTimeSlotId={selectedTimeSlotId}
              nerdAvailable={nerdAvailable}
              onNerdModeChange={onNerdModeChange}
              isPersonalized={isPersonalized}
              onRequestPersonalization={onRequestPersonalization}
              matchSlot={matchSlot}
            />
          </motion.div>
        </div>
      </div>

      {/* ── Navbar sezioni — barra fissa in basso (Ricetta / Procedimento) ── */}
      {isMobile && (
        <RecipeSectionTabs
          variant="navbar"
          activeTab={activeTab}
          recipeLabel={recipeTabLabel}
          onChange={onTabChange}
          fillingMode={isFillingStyle(recipe.style)}
          onSearchOpen={() => {}}
          procedureSubtitle={procedureSubtitle}
          toppingSubtitle={toppingSubtitle}
        />
      )}
    </div>
  );
}
