import { RecipeShare } from "./recipe-share";
import { DetailLevelSwitch } from "./detail-level-switch";
import { useDecorativeMotion, useVisualMotionPreference } from "../../context/visual-quality-context";
import { RecipeReferenceNote } from "./recipe-reference-note";
import { RecipeVerdictBadge } from "./recipe-verdict-badge";
import { recipeDisplayName } from "../../domain/recipe-reference";
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

import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { localizeToppingRecipe, toppingConcept } from "../../data/topping-i18n/localize";
import { Link } from "react-router";
import {
  AnimatePresence,
  motion,
  useScroll,
  useMotionValue,
  useMotionValueEvent,
  useTransform,
} from "motion/react";
import { ChevronLeft, Bookmark, RotateCcw } from "lucide-react";
import { IconButton, Snackbar } from "../../components/ds/index";
import { RecipeTitle } from "./recipe-title";
import { ImageWithFallback } from "../../components/media/ImageWithFallback";
import { IMAGE_SIZES } from "../../components/media/responsive-images";
import { RecipeDietaryNotice, RecipeDietaryAlternatives } from "./recipe-dietary-notice";
import { RecipeOutput } from "./recipe-output";
import { RecipeSectionTabs, type RecipePrimaryTab } from "./recipe-section-tabs";
import { getToppingForStyle, getRecipesByAuthenticity } from "../../data/topping-library";
import { useIsMobile } from "../../hooks/use-mobile";
import { FireGlow } from "../cooking/fire-glow";
import { useCms, type CmsContent } from "../cms/cms-context";
import { createFormatter, formatLengthCopy } from "../cms/i18n";
import { motionDelay,motionEase,motionSpring,motionTiming } from "../../components/ds/motion";
import {
  localizeHydrationCategory,
  localizeCrustType,
  isFillingStyle,
  type PizzaStyle,
  type UserConstraints,
  type GeneratedRecipe,
  type PanConfig,
} from "../../domain/pizza-engine";
import { uiMessage } from "../../i18n/ui-messages";
import { preFermentName } from "./pre-ferment-guide";

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
  /** FW-08: livello «Dettagli tecnici» già risolto (useDetailLevel). */
  nerdMode?: boolean;
  isPersonalized?: boolean;
  onRequestPersonalization?: () => void;
  /** "Torna all'originale" (round 6, nota Matteo): riporta alla BASE attiva
   *  (canonica dello stile o variante selezionata). Vive accanto all'eyebrow
   *  — chi dichiara la divergenza offre anche il ritorno. Passato solo
   *  quando la ricetta è dirty. */
  onResetToOriginal?: () => void;
  resetLabel?: string;
  resetTitle?: string;
  recipeName?: string;
  recipeSource?: { href: string; name: string };
  onRenameRecipe?: (name: string) => boolean;
  /* Usati da Crea (scheda su misura) */
  selectedFlourId?: string | null;
  onSelectFlour?: (flour: import("../../data/flour-database").FlourEntry | null) => void;
  selectedTimeSlotId?: string | null;
  mealTargetAt?: number | null;
  favorite?: boolean;
  /** Restituisce false se il salvataggio non è riuscito: la pagina lo dice. */
  onToggleFavorite?: () => boolean | void;
  /** S07-B-09: «Annulla» nello Snackbar dopo la rimozione dal ricettario.
   *  Restituisce false se la scrittura non è riuscita (la pagina lo dice). */
  onUndoRemove?: () => boolean;
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
  shareUrl,
  showStickyHeader = false,
  selectedToppingConcept,
  onSelectTopping,
  nerdMode = false,
  isPersonalized = true,
  onRequestPersonalization,
  onResetToOriginal,
  resetLabel,
  resetTitle,
  recipeName,
  recipeSource,
  onRenameRecipe,
  selectedFlourId,
  onSelectFlour,
  selectedTimeSlotId,
  mealTargetAt,
  favorite = false,
  onToggleFavorite,
  onUndoRemove,
}: RecipeViewProps) {
  const [toast, setToast] = useState<{ text: string; undo?: boolean } | null>(null);
  const [toastPaused, setToastPaused] = useState(false);
  const favoriteFeedbackId = useId();
  const favoriteAnchorRef = useRef<HTMLDivElement>(null);

  /* S07-B-09: con «Annulla» lo Snackbar resta 8 s e si ferma finché ha il
     focus o il puntatore sopra (WCAG 2.2.1); il solo messaggio dura 3 s. */
  useEffect(() => {
    if (!toast || toastPaused) return;
    const timer = setTimeout(() => setToast(null), toast.undo ? 8000 : 3000);
    return () => clearTimeout(timer);
  }, [toast, toastPaused]);

  const handleFavoriteClick = () => {
    if (!onToggleFavorite) return;
    if (onToggleFavorite() === false) return;
    setToastPaused(false);
    setToast(
      favorite
        ? { text: uiMessage("features.recipe.recipe-view.rimosso-dai-preferiti-toast-info"), undo: Boolean(onUndoRemove) }
        : { text: uiMessage("features.recipe.recipe-view.aggiunto-ai-preferiti-toast-success") }
    );
  };

  const handleUndoRemove = () => {
    const ok = onUndoRemove?.() ?? false;
    setToastPaused(false);
    setToast(ok ? { text: uiMessage("recipe.save.restored") } : null);
    // Il pulsante «Annulla» sparisce col focus dentro: lo si riporta sul segnalibro.
    favoriteAnchorRef.current?.querySelector<HTMLElement>(".recipe-view-favorite")?.focus();
  };

  const [actionTarget, setActionTarget] = useState<HTMLElement | null>(null);
  useLayoutEffect(() => {
    setActionTarget(document.getElementById("recipe-floating-actions"));
  }, []);
  const favoriteAction = onToggleFavorite && (
    <div ref={favoriteAnchorRef} className={`recipe-view-favorite-anchor${!showStickyHeader && !actionTarget ? " recipe-view-favorite-anchor--floating" : ""}`}>
    <IconButton type="button"
      className="recipe-view-favorite"
      aria-describedby={toast ? favoriteFeedbackId : undefined}
      aria-label={favorite ? uiMessage("features.recipe.recipe-view.rimuovi-dai-preferiti-7f61dbbb") : uiMessage("features.recipe.recipe-view.aggiungi-ai-preferiti-b5037a86")}
      aria-pressed={favorite} onClick={handleFavoriteClick} size="lg" variant="bare">
      <Bookmark size={20} fill={favorite ? "currentColor" : "none"} aria-hidden="true" />
    </IconButton>
    <AnimatePresence>
      {toast && <motion.div
        className={`recipe-view-favorite-feedback${toast.undo ? " recipe-view-favorite-feedback--action" : ""}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={motionTiming.feedback}
        onFocus={() => setToastPaused(true)}
        onBlur={() => setToastPaused(false)}
        onMouseEnter={() => setToastPaused(true)}
        onMouseLeave={() => setToastPaused(false)}
      >
        <Snackbar message={<span id={favoriteFeedbackId}>{toast.text}</span>}
          action={toast.undo ? uiMessage("ds.snackbar.undo") : undefined}
          onAction={toast.undo ? handleUndoRemove : undefined} />
      </motion.div>}
    </AnimatePresence>
    </div>
  );

  /* Parallax hero (identico alla scheda Scopri originale). Con
     prefers-reduced-motion il movimento scroll-driven si spegne (resta il
     solo scrim, che è una dissolvenza, non un moto). */
  const { scrollY } = useScroll();
  const parallaxEnabled = useDecorativeMotion();
  const reducedMotion = useVisualMotionPreference();
  // Freeze at the current offset when quality drops instead of snapping the
  // hero/card back to zero in the middle of reading.
  const decorativeScroll = useMotionValue(scrollY.get());
  useMotionValueEvent(scrollY, "change", y => {
    if (parallaxEnabled) decorativeScroll.set(y);
  });
  const isMobile = useIsMobile(true);
  const { bcp47 } = useCms();
  const fmt = createFormatter(cms.ui, bcp47);
  const heroImageY = useTransform(
    decorativeScroll,
    [0, 400],
    reducedMotion ? [0, 0] : [0, 80]
  );
  const heroImageScale = useTransform(
    decorativeScroll,
    [0, 400],
    reducedMotion ? [1, 1] : [1.02, 1.15]
  );
  const heroOverlayOpacity = useTransform(scrollY, [0, 300], [0, 0.65]);
  const cardY = useTransform(
    decorativeScroll,
    [0, 400],
    reducedMotion ? [0, 0] : [0, -20]
  );

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [activeTab]);

  const isHeroReduced = activeTab !== "ricetta";
  const heroParallaxStyle = { y: heroImageY, scale: heroImageScale };
  const heroScrimStyle = { opacity: heroOverlayOpacity };
  const cardMotionStyle = { y: isHeroReduced ? 0 : cardY };

  // Resolve topping using the exact same fallback hierarchy as recipe-output.tsx
  const allToppingChoices = useMemo(() => {
    const ranked = getRecipesByAuthenticity(style)
      .filter((item) => item.authenticity !== "taboo")
      .map((item) => ({ ...item, recipe: localizeToppingRecipe(item.recipe, cms.toppingI18n) }));
    const seen = new Set<string>();
    return ranked.filter((item) => {
      const key = item.recipe.concept_ref;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [style, cms.toppingI18n]);

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
      
    const conceptName = resolvedTopping ? toppingConcept(resolvedTopping.concept_ref, cms.toppingI18n)?.name : undefined;
    const recipeName = resolvedTopping ? (resolvedTopping as any).name : undefined;
    
    return recipeName || conceptName || resolvedTopping?.variant_name || cms.cooking.toppingTitle;
  }, [selectedToppingConcept, style, toppingChoices, allToppingChoices, cms.cooking.toppingTitle]);

  const preFermentText = recipe.has_pre_ferment
    ? /* FW-11 (S07-A-18): nome del prefermento dal catalogo, non l'id. */
      (recipe.pre_ferment_type === "biga" || recipe.pre_ferment_type === "poolish"
        ? preFermentName(recipe.pre_ferment_type)
        : cms.ui.procedurePreferment)
    : recipe.style.dough.unleavened
      ? cms.ui.procedureUnleavened
      : cms.ui.procedureDirect;
  /* FW-05 (S09-A-17): il sottotitolo dice che cosa misura il tempo (lievitazione o
     riposo), per non confonderlo con il tempo totale dell'hero. */
  const procedureSubtitle = uiMessage(
    recipe.style.dough.unleavened ? "recipe.procedure.subtitleRest" : "recipe.procedure.subtitleFerment",
    [preFermentText, fmt.durationShort(recipe.fermentation_hours)],
  );

  /* Niente sottotitolo sul tab Ricetta: ripeteva il nome dello stile che
     campeggia già nell'hero (sempre visibile, anche a hero ridotto). */
  const resolvedMarginTop = isHeroReduced
    ? (showStickyHeader ? "var(--recipe-section-offset-compact)" : "var(--recipe-section-offset-expanded)")
    : "calc(-1 * var(--recipe-section-overlap))";

  const heroEyebrow = eyebrow;
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
  // The reference's filled/two-disc traits must not describe a structural variant.
  const heroTags = recipe.method_changes?.length ? [] :
    localizedStyleTags.length > 0 ? localizedStyleTags : fallbackStyleTags;

  const eyebrowIsTailored = eyebrowTone === "tailored";

  return (
    <div className="recipe-view" data-page="recipe">
      {/* Sfondo caldo base. Il glow PizzaNerd vive solo nei blocchi tecnici. */}
      <FireGlow intensity={0.22} />

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
            <div id="recipe-header-actions" className="recipe-view-toolbar__actions">{favoriteAction}</div>
          </div>
        </header>
      ) : (
        <motion.div
          className="recipe-view-back"
          animate={{ y: 0, opacity: 1 }}
          transition={motionSpring.recipeStage}
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

      {!showStickyHeader && favoriteAction && (actionTarget ? createPortal(favoriteAction, actionTarget) : favoriteAction)}

      {/* ── Hero photo ── */}
      <motion.div
        data-region="hero"
        className="recipe-view-hero"
        animate={{ height: isHeroReduced ? 0 : "clamp(220px, 32vh, 400px)" }}
        transition={motionSpring.recipeSection}
      >
        <div className="recipe-view-hero__frame">
          <div className="recipe-view-hero__clip">
            <motion.div
              className="recipe-view-hero__parallax"
              style={heroParallaxStyle}
            >
              <ImageWithFallback
                src={photo}
                alt={style.name}
                priority
                sizes={IMAGE_SIZES.full}
                className="recipe-view-hero__image"
              />
            </motion.div>
            <motion.div
              className="recipe-view-hero__scrim"
              style={heroScrimStyle}
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
        transition={motionSpring.recipeSection}
      >
        <motion.div
          layout
          className={isHeroReduced ? "recipe-view-card recipe-view-card--reduced" : "recipe-view-card"}
          style={cardMotionStyle}
          transition={motionSpring.gentle}
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
              transition={motionSpring.recipeSection}
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={heroEyebrow}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={motionTiming.exit}
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
                    title={resetTitle}
                  >
                    <RotateCcw size={12} className="recipe-view-reset__icon" aria-hidden="true" />
                    {resetLabel ?? cms.cooking.resetToOriginal}
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
              transition={motionSpring.recipeSection}
            >
              <RecipeTitle styleName={recipeDisplayName(recipe, constraints.oven_type)} name={recipeName} onRename={onRenameRecipe} source={recipeSource} />
            </motion.div>

            <RecipeReferenceNote recipe={recipe} oven={constraints.oven_type} />
            <RecipeVerdictBadge recipe={recipe} hasMatchSlot={Boolean(matchSlot)} activeTab={activeTab} onTabChange={onTabChange} />

            {/* Description + Tags inside the card (rendered only in Ricetta tab) */}
            <AnimatePresence>
              {!isHeroReduced && (
                <motion.div
                  key="expanded-card-content"
                  initial={{ opacity: 0, y: 8, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: "auto" }}
                  exit={{ opacity: 0, y: -8, height: 0 }}
                  transition={{
                    height: motionSpring.recipeSection,
                    y: motionSpring.recipeSection,
                    opacity: { duration: motionTiming.exit.duration,ease: motionEase.standard }
                  }}
                  className="recipe-view-expanded"
                >
                  {/* Round 3 "pulizia": le caratteristiche non sono più 3 chip
                      (scatole che ricalcavano la descrizione) ma UNA riga meta
                      muta — è metadata, non azione. */}
                  {heroTags.length > 0 && (
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
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
            {/* FW-08: «Dettagli tecnici» sempre raggiungibile dalla testata,
                accanto alle azioni quiete (Approfondisci, Condividi). */}
            <div className="recipe-view-meta-row">
              {!isHeroReduced && introExtraSlot}
              {shareUrl && <RecipeShare url={shareUrl} title={recipeName || recipeDisplayName(recipe, constraints.oven_type)} />}
              <DetailLevelSwitch />
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* ── Contenuto ── */}
      <div data-region="body" id="recipe-content-tabs-anchor" className="recipe-view-body">
        <div className="recipe-view-content">
          {/* Le section-tabs stanno FUORI dal wrapper animato: un antenato con
              `transform` (l'entry motion.div) diventa il containing block e
              rompe `position: sticky` — le tabs non si agganciavano più
              (pin VPL-149713). Qui restano figlie dirette di recipe-view-content. */}
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
          {activeTab !== "ricetta" && <RecipeDietaryNotice recipe={recipe} />}
          {onSelectTopping && <RecipeDietaryAlternatives recipe={recipe} constraints={constraints} onSelect={onSelectTopping} />}
          <motion.div
            id="recipe-tabpanel"
            role="tabpanel"
            aria-labelledby={`recipe-${isMobile ? "navtab" : "tab"}-${activeTab}`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...motionSpring.standard,delay: motionDelay.recipeReveal }}
          >
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
              mealTargetAt={mealTargetAt}
              isPersonalized={isPersonalized}
              referenceLabel={eyebrowIsTailored ? undefined : heroEyebrow}
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
          procedureSubtitle={procedureSubtitle}
          toppingSubtitle={toppingSubtitle}
        />
      )}

    </div>
  );
}
