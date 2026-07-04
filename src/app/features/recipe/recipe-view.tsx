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

import { useState, useEffect, useMemo, type ReactNode } from "react";
import { Link } from "react-router";
import { AnimatePresence, motion, useMotionValueEvent, useReducedMotion, useScroll, useTransform } from "motion/react";
import { Check, ChevronLeft, RotateCcw, Share2 } from "lucide-react";
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
  shareUrl,
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
  /* Parallax hero (identico alla scheda Scopri originale) */
  const { scrollY } = useScroll();
  const isMobile = useIsMobile();
  const { bcp47 } = useCms();
  const fmt = createFormatter(cms.ui, bcp47);
  const heroImageY = useTransform(scrollY, [0, 400], [0, 80]);
  const heroImageScale = useTransform(scrollY, [0, 400], [1.02, 1.15]);
  const heroOverlayOpacity = useTransform(scrollY, [0, 300], [0, 0.65]);
  const cardY = useTransform(scrollY, [0, 400], [0, -20]);
  const prefersReducedMotion = useReducedMotion();

  /* Il back flottante segue la chrome liquida: si ritira mentre leggi
     (altrimenti resta sovrapposto ai contenuti), riemerge appena risali. */
  const [backHidden, setBackHidden] = useState(false);
  useMotionValueEvent(scrollY, "change", (y) => {
    const prev = scrollY.getPrevious() ?? y;
    const dy = y - prev;
    if (y < 96) {
      setBackHidden(false);
      return;
    }
    if (dy > 6) setBackHidden(true);
    else if (dy < -6) setBackHidden(false);
  });

  const [linkCopied, setLinkCopied] = useState(false);

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
  
  const floatingBackStyle = {
    background: "color-mix(in srgb, var(--container-page) 85%, transparent)",
    backdropFilter: "blur(12px)",
    WebkitBackdropFilter: "blur(12px)",
    color: "var(--text-default)",
    border: "1px solid var(--container-border)",
  };

  const handleShare = () => {
    if (!shareUrl) return;
    if (navigator.share) {
      navigator.share({
        title: `${recipe.style.name} — Vulcan`,
        url: shareUrl,
      }).catch(() => {
        navigator.clipboard.writeText(shareUrl).then(() => {
          setLinkCopied(true);
          setTimeout(() => setLinkCopied(false), 2000);
        });
      });
    } else {
      navigator.clipboard.writeText(shareUrl).then(() => {
        setLinkCopied(true);
        setTimeout(() => setLinkCopied(false), 2000);
      });
    }
  };

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

  return (
    <div
      className="min-h-screen relative"
      style={{ background: "var(--container-page)", color: "var(--text-default)" }}
    >
      {/* Sfondo caldo base. Il glow PizzaNerd vive solo nei blocchi tecnici. */}
      <FireGlow variant="warm" intensity={0.22} />

      {/* Sticky header or Floating back button */}
      {showStickyHeader ? (
        <header
          className="sticky top-0 z-40"
          style={{
            background:
              "color-mix(in srgb, var(--container-page) 88%, transparent)",
            backdropFilter: "blur(24px) saturate(1.6)",
            WebkitBackdropFilter: "blur(24px) saturate(1.6)",
            borderBottom:
              "1px solid var(--container-border-subtle)",
            /* Notch / status bar (Safari iOS, PWA, landscape) */
            paddingTop: "env(safe-area-inset-top, 0px)",
          }}
        >
          <div className="max-w-6xl mx-auto px-5 sm:px-8 h-14 flex items-center gap-3">
            {back.to ? (
              <Link
                to={back.to}
                className="flex items-center gap-1 active:scale-95 transition-transform"
                style={{
                  color: "var(--text-accent)",
                  fontSize: "var(--font-size-xl)",
                  fontWeight: "var(--weight-semibold)" as any,
                  textDecoration: "none",
                }}
              >
                <ChevronLeft size={18} />
                <span>{back.label}</span>
              </Link>
            ) : (
              <button
                type="button"
                onClick={back.onClick}
                className="flex items-center gap-1 active:scale-95 transition-transform"
                style={{
                  color: "var(--text-accent)",
                  fontSize: "var(--font-size-xl)",
                  fontWeight: "var(--weight-semibold)" as any,
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                }}
              >
                <ChevronLeft size={18} />
                <span>{back.label}</span>
              </button>
            )}
            <div className="flex-1" />
            <div id="recipe-header-actions" className="flex items-center gap-2" />
          </div>
        </header>
      ) : (
        <motion.div
          className={`fixed ${back.positionClassName ?? "top-4 left-4"} z-50`}
          animate={{
            y: backHidden && !prefersReducedMotion ? -72 : 0,
            opacity: backHidden ? 0 : 1,
          }}
          transition={{ type: "spring", stiffness: 360, damping: 31, mass: 0.72 }}
          style={{
            pointerEvents: backHidden ? "none" : "auto",
            /* Notch / status bar: allineato al ProfileButton della shell. */
            top: "calc(var(--space-4, 16px) + env(safe-area-inset-top, 0px))",
          }}
        >
          {back.to ? (
            <IconButton
              as={Link}
              to={back.to}
              size="lg"
              variant="ghost"
              className="active:scale-90 transition-transform"
              style={floatingBackStyle}
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
              variant="ghost"
              className="active:scale-90 transition-transform"
              style={floatingBackStyle}
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
        className="relative overflow-hidden"
        animate={{ height: isHeroReduced ? 0 : "clamp(220px, 32vh, 400px)" }}
        transition={{ type: "spring", stiffness: 280, damping: 28 }}
      >
        <div className="h-full max-w-7xl mx-auto px-0 sm:px-6 lg:px-8">
          <div className="relative h-full overflow-hidden sm:rounded-b-3xl">
            <motion.div
              className="w-full h-full"
              style={{ y: heroImageY, scale: heroImageScale }}
            >
              <ImageWithFallback
                src={photo}
                alt={style.name}
                className="w-full h-full"
                style={{ objectFit: "cover" }}
              />
            </motion.div>
            <motion.div
              className="absolute inset-0 pointer-events-none"
              style={{ background: "var(--container-page)", opacity: heroOverlayOpacity }}
            />
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  "linear-gradient(to top, var(--overlay-backdrop) 0%, transparent 50%, color-mix(in srgb, var(--overlay-backdrop) 67%, transparent) 100%)",
              }}
            />
          </div>
        </div>
      </motion.div>

      {/* ── Glassmorphic title card / Header ── */}
      <motion.div
        layout
        className="max-w-6xl mx-auto px-5 sm:px-8 relative z-10"
        animate={{ marginTop: resolvedMarginTop }}
        transition={{ type: "spring", stiffness: 280, damping: 28 }}
      >
        <motion.div
          layout
          className="rounded-2xl text-left"
          style={{
            background: isHeroReduced ? "rgba(0, 0, 0, 0)" : "var(--recipe-hero-card-bg)",
            backdropFilter: isHeroReduced ? "blur(0px) saturate(1)" : "blur(24px) saturate(1.7)",
            WebkitBackdropFilter: isHeroReduced ? "blur(0px) saturate(1)" : "blur(24px) saturate(1.7)",
            border: isHeroReduced ? "1px solid rgba(0, 0, 0, 0)" : "1px solid var(--container-border)",
            boxShadow: isHeroReduced ? "none" : "var(--recipe-hero-card-shadow)",
            y: isHeroReduced ? 0 : cardY,
            // Transition responsive padding in-place
            paddingTop: isHeroReduced ? 0 : (isMobile ? "var(--space-5)" : "var(--space-8)"),
            paddingBottom: isHeroReduced ? 0 : (isMobile ? "var(--space-5)" : "var(--space-8)"),
            paddingLeft: isHeroReduced ? "4px" : (isMobile ? "var(--space-3)" : "var(--space-5)"),
            paddingRight: isHeroReduced ? 0 : (isMobile ? "var(--space-3)" : "var(--space-5)"),
            /* UN solo binario sinistro per tutta la pagina (round 6-7, note
               Matteo): il margine negativo compensa il padding interno così il
               testo in card è sul rail — ma la card è ELEVATA, quindi non va
               a battuta col viewport: resta un respiro di 8px (mobile) /
               12px (desktop) per l'ombra. margine = respiro − gutter. */
            marginLeft: isHeroReduced ? 0 : (isMobile ? "calc(var(--space-2) - var(--space-5))" : "calc(var(--space-3) - var(--space-8))"),
            marginRight: isHeroReduced ? 0 : (isMobile ? "calc(var(--space-2) - var(--space-5))" : "calc(var(--space-3) - var(--space-8))"),
            transition: "background 0.4s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.4s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.4s cubic-bezier(0.16, 1, 0.3, 1), backdrop-filter 0.4s cubic-bezier(0.16, 1, 0.3, 1), -webkit-backdrop-filter 0.4s cubic-bezier(0.16, 1, 0.3, 1), padding 0.4s cubic-bezier(0.16, 1, 0.3, 1), margin 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
          transition={{ type: "spring", stiffness: 280, damping: 28 }}
        >
          <div 
            className="flex flex-col"
            style={{
              gap: isHeroReduced ? "var(--space-1, 4px)" : "var(--space-4, 16px)",
              transition: "gap 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
            }}
          >
            {/* Eyebrow — firma d'origine colorata (unica dichiarazione).
                Accanto, quando la ricetta è dirty, il ritorno alla base:
                chi dichiara la divergenza offre anche la via del ritorno. */}
            <motion.div
              layout
              className="flex flex-wrap items-baseline gap-x-3 gap-y-1"
              transition={{ type: "spring", stiffness: 280, damping: 28 }}
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={heroEyebrow}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.18, ease: "easeOut" }}
                  style={{
                    display: "inline-block",
                    fontSize: "var(--font-size-md)",
                    color:
                      eyebrowTone === "tailored"
                        ? "var(--cta)"
                        : "var(--text-accent)",
                    letterSpacing: "0.18em",
                    textTransform: "uppercase" as any,
                    fontWeight: "var(--weight-bold)" as any,
                    transition: "color 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
                  }}
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
                    className="inline-flex items-baseline gap-1"
                    style={{
                      background: "transparent",
                      border: "none",
                      padding: 0,
                      cursor: "pointer",
                      color: "var(--text-muted)",
                      fontSize: "var(--font-size-sm)",
                      fontWeight: "var(--weight-medium)" as any,
                      lineHeight: "var(--leading-tight)",
                      textDecoration: "underline",
                      textUnderlineOffset: 3,
                      textDecorationColor:
                        "color-mix(in srgb, var(--text-muted) 45%, transparent)",
                    }}
                  >
                    <RotateCcw size={12} className="self-center" aria-hidden="true" />
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
              className="flex items-center gap-3 flex-wrap"
              transition={{ type: "spring", stiffness: 280, damping: 28 }}
            >
              <Heading level="page" style={{ margin: 0 }}>
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
                  className="flex flex-col gap-4 overflow-hidden"
                >
                  {/* Round 3 "pulizia": le caratteristiche non sono più 3 chip
                      (scatole che ricalcavano la descrizione) ma UNA riga meta
                      muta — è metadata, non azione. */}
                  {heroTags.length > 0 && (
                    <p
                      style={{
                        /* Ritmo uniforme della colonna (gap-4): nessun margine
                           proprio — un margine negativo uscirebbe dal box
                           overflow-hidden dell'animazione e verrebbe tagliato. */
                        margin: 0,
                        color: "var(--text-muted)",
                        fontSize: "var(--font-size-md)",
                        fontWeight: "var(--weight-semibold)" as any,
                        letterSpacing: "var(--tracking-spread)",
                        lineHeight: "var(--leading-normal)",
                      }}
                    >
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

                  {(introExtraSlot || shareUrl) && (
                    <div
                      className="flex flex-wrap items-center gap-x-6 gap-y-2"
                      style={{
                        /* Utilità, non contenuto: corpo minore. */
                        fontSize: "clamp(var(--font-size-md), 3vw, var(--font-size-lg))",
                        margin: 0,
                      }}
                    >
                      {introExtraSlot}
                      {shareUrl && (
                        <button
                          type="button"
                          onClick={handleShare}
                          className="inline-flex items-center gap-1.5 active:scale-95 transition-transform"
                          style={{
                            background: "none",
                            border: "none",
                            padding: 0,
                            cursor: "pointer",
                            fontSize: "inherit",
                            fontWeight: "var(--weight-semibold)" as any,
                            fontStyle: "normal",
                            color: linkCopied ? "var(--recipe-success)" : "var(--text-accent)",
                            textDecoration: "underline",
                          }}
                          title={linkCopied ? cms.ui.copied : cms.ui.share}
                          aria-label={cms.pages.recipeCopyLinkAria}
                        >
                          {linkCopied ? (
                            <Check size={15} className="stroke-[2.5]" />
                          ) : (
                            <Share2 size={15} />
                          )}
                          <span>{linkCopied ? cms.ui.copied : cms.ui.share}</span>
                        </button>
                      )}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>

      {/* ── Contenuto ── */}
      <div id="recipe-content-tabs-anchor" className="max-w-6xl mx-auto px-5 sm:px-8">
        <div className="max-w-4xl mx-auto pt-6 pb-28 sm:pb-32">
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
              shareUrl={shareUrl}
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

