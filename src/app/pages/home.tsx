import React, {
  useState,
  useMemo,
  useCallback,
  useEffect,
  useRef,
} from "react";
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
  useReducedMotion,
} from "motion/react";
import {
  ChevronLeft,
  Moon,
  Sun,
  Sparkles,
  RotateCcw,
  SlidersHorizontal,
  ChevronDown,
  Palette,
  Bug,
  FilePen,
  ArrowRight,
  ArrowLeft,
  AlertTriangle,
} from "lucide-react";
import { Link } from "react-router";
import { UserNeeds } from "../components/user-needs";
import { RecommendedStyles } from "../components/recommended-styles";
import { RecipeConfigurator } from "../components/recipe-configurator";
import { ScoreDashboard } from "../components/score-dashboard";
import { RecipeOutput } from "../components/recipe-output";
import { RecipeStatStrip } from "../components/recipe-stat-strip";
import { VulcanMark } from "../components/vulcan-logo";
import { FireGlow } from "../components/fire-glow";
import {
  PizzaStyle,
  UserConstraints,
  GeneratedRecipe,
  TimeSlot,
  generateRecipe,
  PanConfig,
  defaultPanShape,
  STYLES_DB,
} from "../components/pizza-engine";
import { STYLE_PHOTOS } from "../components/recommended-styles";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { moodFromScore } from "../components/dough-mascot";
import { VulcanHero } from "../components/vulcan-hero";
import { useDarkMode } from "../components/root-layout";
/* VPL-068: ProgressPill/MobileProgressBar removed — wizard is 3-step flow */
import { StyleDetailSheet } from "../components/style-detail-sheet";
import { useStylesOverride } from "../components/styles-override-context";
import { useCms } from "../components/cms/cms-context";
import { ContextualWarnings } from "../components/troubleshooting-panel";
import { getDietaryWarnings } from "../components/dietary-data";
import { useProfileDefaults } from "../components/use-profile-defaults";

type AppStep = "settings" | "styles" | "result";

/* ═══ VPL-012: Custom P/L state default from style ═══ */
function defaultPL(style: PizzaStyle | null): number {
  if (!style) return 0.55;
  return (
    Math.round(
      ((style.dough.flour_pl_range[0] +
        style.dough.flour_pl_range[1]) /
        2) *
        100,
    ) / 100
  );
}

/* ═══ IntersectionObserver for scroll section tracking (build step) ═══ */
function useActiveScrollSection(
  containerRef: React.RefObject<HTMLDivElement | null>,
  enabled: boolean,
) {
  const [active, setActive] = useState<string>("context");
  const ratioMap = useRef<Map<string, number>>(new Map());

  useEffect(() => {
    if (!enabled || !containerRef.current) return;
    const container = containerRef.current;
    ratioMap.current.clear();

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const id = (entry.target as HTMLElement).dataset
            .section;
          if (id)
            ratioMap.current.set(id, entry.intersectionRatio);
        });
        let bestId = "context";
        let bestRatio = -1;
        ratioMap.current.forEach((ratio, id) => {
          if (ratio > bestRatio) {
            bestRatio = ratio;
            bestId = id;
          }
        });
        if (bestRatio > 0.05) setActive(bestId);
      },
      {
        threshold: [0, 0.1, 0.25, 0.5, 0.75, 1],
        rootMargin: "-12% 0px -30% 0px",
      },
    );

    const observe = () => {
      const sections =
        container.querySelectorAll<HTMLElement>(
          "[data-section]",
        );
      sections.forEach((s) => observer.observe(s));
    };
    observe();
    const mutation = new MutationObserver(() => {
      observer.disconnect();
      observe();
    });
    mutation.observe(container, {
      childList: true,
      subtree: true,
    });

    return () => {
      observer.disconnect();
      mutation.disconnect();
    };
  }, [enabled, containerRef]);

  return active;
}

export function HomePage() {
  const { darkMode, setDarkMode, devMode } = useDarkMode();
  const { isOverrideActive, clearOverride, effectiveStyles } =
    useStylesOverride();
  const {
    cms,
    modifiedCount,
    resetAll: cmsResetAll,
  } = useCms();
  const [currentStep, setCurrentStep] =
    useState<AppStep>("settings");
  const [selectedStyle, setSelectedStyle] =
    useState<PizzaStyle | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<
    string | null
  >(null);
  const [showFineTuning, setShowFineTuning] = useState(false);
  const [nerdMode, setNerdMode] = useState(false);

  /* ═══ VPL-023: Respect prefers-reduced-motion ═══ */
  const prefersReducedMotion = useReducedMotion();

  /* ═══ Generate recipe — clean crossfade, no overlay ═══ */
  const handleGenerateRecipe = useCallback(() => {
    window.scrollTo({
      top: 0,
      behavior: "instant" as ScrollBehavior,
    });
    setCurrentStep("result");
  }, []);

  /* ═══ Navigate to styles step ═══ */
  const handleGoToStyles = useCallback(() => {
    window.scrollTo({
      top: 0,
      behavior: "instant" as ScrollBehavior,
    });
    setCurrentStep("styles");
  }, []);

  /* ═══ Back navigation ═══ */
  const handleBackToSettings = useCallback(() => {
    window.scrollTo({
      top: 0,
      behavior: "instant" as ScrollBehavior,
    });
    setCurrentStep("settings");
  }, []);

  const handleBackToStyles = useCallback(() => {
    setSelectedStyle(null);
    setShowFineTuning(false);
    setNerdMode(false);
    window.scrollTo({
      top: 0,
      behavior: "instant" as ScrollBehavior,
    });
    setCurrentStep("styles");
  }, []);

  /* ═══ VPL-067: Profile data bridge — load constraints from profile ═══ */
  const profileDefaults = useProfileDefaults();
  const [constraints, setConstraints] =
    useState<UserConstraints>(profileDefaults.constraints);

  const [customHydration, setCustomHydration] = useState(60);
  const [customFlourW, setCustomFlourW] = useState(250);
  const [customFermentHours, setCustomFermentHours] =
    useState(16);
  const [customFermentTemp, setCustomFermentTemp] = useState(4);
  const [usePreFerment, setUsePreFerment] = useState(false);
  const [customFlourPL, setCustomFlourPL] = useState(
    defaultPL(selectedStyle),
  );
  const [panConfig, setPanConfig] = useState<PanConfig>({});
  const [selectedFlourId, setSelectedFlourId] = useState<
    string | null
  >(null);

  const handleTimeSlotChange = useCallback((slot: TimeSlot) => {
    setSelectedTimeSlot(slot.id);
    setConstraints((c) => ({
      ...c,
      available_hours: slot.hours,
    }));
  }, []);

  const handleSelectStyle = useCallback(
    (style: PizzaStyle) => {
      setSelectedStyle(style);
      const hCenter = Math.round(
        (style.dough.hydration_pct_range[0] +
          style.dough.hydration_pct_range[1]) /
          2,
      );
      const wCenter = Math.round(
        (style.dough.flour_w_range[0] +
          style.dough.flour_w_range[1]) /
          2,
      );
      const fMax = style.dough.fermentation_hours_range[1];
      const fMin = style.dough.fermentation_hours_range[0];
      const fOptimal = Math.min(
        Math.round((fMin + fMax) / 2),
        constraints.available_hours,
      );
      setCustomHydration(hCenter);
      setCustomFlourW(wCenter);
      setCustomFermentHours(fOptimal);
      setCustomFermentTemp(fOptimal > 12 ? 4 : 22);
      setUsePreFerment(style.requires_pre_ferment);
      setCustomFlourPL(defaultPL(style));
      // Initialize pan config with style defaults
      setPanConfig({
        panShape: defaultPanShape(style),
        panLength: style.shape.length_cm,
        panWidth: style.shape.width_cm,
        panDiameter: style.shape.diameter_cm,
        thickness: style.shape.thickness_factor,
      });
      setSelectedFlourId(null);
    },
    [constraints.available_hours],
  );

  const recipe: GeneratedRecipe | null = useMemo(() => {
    if (!selectedStyle) return null;
    // Build score weights from CMS overrides
    const scoreWeights = {
      authenticity: cms.scoreDimensions.authenticity?.weight,
      feasibility: cms.scoreDimensions.feasibility?.weight,
      digestibility: cms.scoreDimensions.digestibility?.weight,
      sustainability:
        cms.scoreDimensions.sustainability?.weight,
      experimentation:
        cms.scoreDimensions.experimentation?.weight,
    };
    return generateRecipe(
      selectedStyle,
      constraints,
      customHydration,
      customFlourW,
      customFermentHours,
      customFermentTemp,
      usePreFerment,
      customFlourPL,
      panConfig,
      scoreWeights,
    );
  }, [
    selectedStyle,
    constraints,
    customHydration,
    customFlourW,
    customFermentHours,
    customFermentTemp,
    usePreFerment,
    customFlourPL,
    panConfig,
    cms.scoreDimensions,
  ]);

  const handleReset = () => {
    setCurrentStep("settings");
    setSelectedStyle(null);
    setSelectedTimeSlot(null);
    setShowFineTuning(false);
    setNerdMode(false);
    setSelectedFlourId(null);
    cmsResetAll();
  };

  /* VPL-068: time slot is optional — styles always visible */
  const canGenerateRecipe = selectedStyle !== null;

  /* Scroll-driven title fade */
  const { scrollY } = useScroll();
  const titleOpacity = useTransform(scrollY, [0, 160], [1, 0]);
  const titleY = useTransform(scrollY, [0, 160], [0, -14]);

  /* Section tracking */
  const buildContainerRef = useRef<HTMLDivElement | null>(null);
  const activeSection = useActiveScrollSection(
    buildContainerRef,
    currentStep === "settings",
  );

  /* Scroll-to-top on step change */
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "instant" as ScrollBehavior,
    });
  }, [currentStep]);

  /* VPL-068: scroll-snap removed — single continuous flow */

  /* ═══ Fire glow intensity based on step ═══ */
  const fireIntensity =
    currentStep === "result"
      ? 0.6
      : currentStep === "styles"
        ? 0.5
        : 0.3;

  /* ═══ DoughBlob energy — maps step state to mascot reactivity ═══ */
  const doughEnergy =
    currentStep === "result"
      ? (recipe?.scores.composite ?? 60)
      : currentStep === "styles"
        ? 55
        : 25;

  const doughVariant =
    currentStep === "result" && recipe
      ? moodFromScore(recipe.scores.composite)
      : currentStep === "styles"
        ? "stretch"
        : "rest";

  /* ═══ VPL-008: Focus management on step transitions ═══ */
  const resultHeadingRef = useRef<HTMLHeadingElement | null>(
    null,
  );
  const prevStepRef = useRef<AppStep>(currentStep);

  useEffect(() => {
    if (prevStepRef.current !== currentStep) {
      prevStepRef.current = currentStep;
      /* Delay slightly so DOM is mounted after AnimatePresence */
      const t = setTimeout(() => {
        if (
          currentStep === "result" &&
          resultHeadingRef.current
        ) {
          resultHeadingRef.current.focus({
            preventScroll: true,
          });
        }
      }, 350);
      return () => clearTimeout(t);
    }
  }, [currentStep]);

  /* ═══ Scroll-driven hero shrink in result step ═══ */
  const heroHeightVh = useTransform(
    scrollY,
    [0, 350],
    [45, 16],
  );
  const heroHeight = useTransform(
    heroHeightVh,
    (v) => `max(${v}vh, 140px)`,
  );
  const heroImageY = useTransform(scrollY, [0, 400], [0, 60]);
  const heroOverlayOpacity = useTransform(
    scrollY,
    [0, 300],
    [0, 0.55],
  );

  return (
    <div
      className="min-h-screen"
      style={{
        background: "var(--container-page)",
        color: "var(--text-default)",
      }}
    >
      {/* ═══ VPL-009: Skip-to-content link for screen readers ═══ */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[9999] focus:px-4 focus:py-2 focus:rounded-lg"
        style={{
          background: "var(--cta-btn-bg)",
          color: "var(--cta-btn-text)",
          fontSize: "var(--font-size-lg)",
          fontWeight: "var(--weight-semibold)" as any,
        }}
      >
        {cms.pages.skipToContent}
      </a>

      {/* ═══ FIRE GLOW — ambient background ═══ */}
      <FireGlow intensity={fireIntensity} />

      {/* ═══ TOP BAR ═══ */}
      <header className="sticky top-0 z-50 h-14 sm:h-16 surface-glass">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 h-full flex items-center justify-between">
          <div className="flex items-center gap-3">
            {currentStep !== "settings" ? (
              <motion.button
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                onClick={
                  currentStep === "result"
                    ? handleBackToStyles
                    : handleBackToSettings
                }
                className="flex items-center gap-1 -ml-1 active:scale-95 transition-transform"
                style={{
                  color: "var(--text-accent)",
                  fontSize: "var(--font-size-xl)",
                  fontWeight: "var(--weight-semibold)" as any,
                }}
              >
                <ChevronLeft size={18} />
                <span>{cms.configurator.backLabel}</span>
              </motion.button>
            ) : (
              <div className="flex items-center gap-2.5">
                {/* Logo badge — hidden on desktop where sidebar rail already shows it (M3 pattern) */}
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center md:hidden"
                  style={{
                    background: "var(--hero-brand-gradient)",
                    boxShadow: "var(--logo-badge-shadow)",
                    color: "var(--overlay-text)",
                  }}
                >
                  <VulcanMark size={20} decorative />
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span
                    className="font-serif"
                    style={{
                      color: "var(--text-default)",
                      fontSize: "var(--font-size-4xl)",
                      fontWeight: "var(--weight-bold)" as any,
                      letterSpacing: "var(--tracking-tight)",
                    }}
                  >
                    Vulcan
                  </span>
                  <span
                    className="hidden sm:inline"
                    style={{
                      color: "var(--text-muted)",
                      fontSize: "var(--font-size-sm)",
                      fontWeight:
                        "var(--weight-semibold)" as any,
                      letterSpacing: "var(--tracking-ultra)",
                      textTransform: "uppercase",
                    }}
                  >
                    Pizza Lab
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            {/* Dev tools — only in dev mode */}
            {devMode && (
              <div className="flex items-center gap-1">
                {/* CMS link */}
                <Link
                  to="/cms"
                  className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-[var(--container-bg)] transition-colors"
                  style={{ color: "var(--text-muted)" }}
                  aria-label="Content Manager"
                >
                  <FilePen size={14} />
                </Link>
                {/* Dev tools link */}
                <Link
                  to="/dev"
                  className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-[var(--container-bg)] transition-colors"
                  style={{ color: "var(--text-muted)" }}
                  aria-label="Dev tools"
                >
                  <Bug size={14} />
                </Link>
              </div>
            )}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-[var(--container-bg)] active:scale-95 transition-transform"
              aria-label={darkMode ? "Light mode" : "Dark mode"}
            >
              {darkMode ? (
                <Sun size={16} />
              ) : (
                <Moon size={16} />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* ═══ STYLE OVERRIDE BANNER ═══ */}
      <AnimatePresence>
        {isOverrideActive && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{
              type: "spring",
              stiffness: 500,
              damping: 28,
            }}
            className="overflow-hidden sticky top-14 sm:top-16 z-40"
          >
            <div
              className="flex items-center justify-center gap-3 px-4 py-2"
              style={{
                background:
                  "color-mix(in srgb, var(--tertiary) 12%, var(--container-page))",
                borderBottom:
                  "1px solid color-mix(in srgb, var(--tertiary) 25%, rgba(0,0,0,0))",
              }}
            >
              <div
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{
                  background: "var(--tertiary)",
                  boxShadow: "0 0 6px var(--tertiary)",
                }}
              />
              <span
                className="type-data"
                style={{
                  fontSize: "var(--font-size-sm)",
                  color: "var(--text-default)",
                }}
              >
                {cms.ui.styleEditorActive} —{" "}
                <span
                  style={{
                    fontFeatureSettings: "'tnum'",
                    color: "var(--tertiary)",
                  }}
                >
                  {(() => {
                    let mod = 0,
                      cust = 0;
                    for (const id of Object.keys(
                      effectiveStyles,
                    )) {
                      if (!(id in STYLES_DB)) cust++;
                      else if (
                        JSON.stringify(effectiveStyles[id]) !==
                        JSON.stringify(STYLES_DB[id])
                      )
                        mod++;
                    }
                    const parts = [];
                    if (mod > 0)
                      parts.push(`${mod} modificati`);
                    if (cust > 0) parts.push(`${cust} custom`);
                    return parts.length > 0
                      ? parts.join(", ")
                      : "nessuna modifica";
                  })()}
                </span>
              </span>
              <Link
                to="/dev/editor"
                className="type-data active:scale-95 transition-transform"
                style={{
                  fontSize: "var(--font-size-sm)",
                  fontWeight: "var(--weight-semibold)" as any,
                  color: "var(--tertiary)",
                  textDecoration: "underline",
                  textUnderlineOffset: 2,
                }}
              >
                Modifica
              </Link>
              <button
                onClick={clearOverride}
                className="type-data active:scale-95 transition-transform ml-1"
                style={{
                  fontSize: "var(--font-size-sm)",
                  color: "var(--text-muted)",
                }}
                aria-label="Disattiva stili custom"
              >
                Disattiva
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══ CMS OVERRIDE BANNER ═══ */}
      <AnimatePresence>
        {modifiedCount > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{
              type: "spring",
              stiffness: 500,
              damping: 28,
            }}
            className="overflow-hidden sticky top-14 sm:top-16 z-40"
            style={{
              marginTop: isOverrideActive ? 0 : undefined,
            }}
          >
            <div
              className="flex items-center justify-center gap-3 px-4 py-2"
              style={{
                background:
                  "color-mix(in srgb, var(--cta) 10%, var(--container-page))",
                borderBottom:
                  "1px solid color-mix(in srgb, var(--cta) 20%, rgba(0,0,0,0))",
              }}
            >
              <div
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{
                  background: "var(--cta)",
                  boxShadow: "0 0 6px var(--cta)",
                }}
              />
              <span
                className="type-data"
                style={{
                  fontSize: "var(--font-size-sm)",
                  color: "var(--text-default)",
                }}
              >
                {cms.ui.cmsActive} —{" "}
                <span
                  style={{
                    fontFeatureSettings: "'tnum'",
                    color: "var(--cta)",
                  }}
                >
                  {modifiedCount}{" "}
                  {modifiedCount === 1
                    ? cms.ui.fieldModified
                    : cms.ui.fieldsModified}
                </span>
              </span>
              <Link
                to="/cms"
                className="type-data active:scale-95 transition-transform"
                style={{
                  fontSize: "var(--font-size-sm)",
                  fontWeight: "var(--weight-semibold)" as any,
                  color: "var(--cta)",
                  textDecoration: "underline",
                  textUnderlineOffset: 2,
                }}
              >
                Modifica
              </Link>
              <button
                onClick={cmsResetAll}
                className="type-data active:scale-95 transition-transform ml-1"
                style={{
                  fontSize: "var(--font-size-sm)",
                  color: "var(--text-muted)",
                }}
                aria-label="Ripristina contenuti CMS"
              >
                Ripristina
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══ CONTENT ═══ */}
      <AnimatePresence mode="wait">
        {/* ─── STEP 1 — SETTINGS: Hero + UserNeeds ─── */}
        {currentStep === "settings" && (
          <motion.main
            key="settings"
            id="main-content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 25,
            }}
            className="relative pb-32"
            style={{ zIndex: 2 }}
            ref={buildContainerRef}
          >
            <div className="relative">
              <div className="relative max-w-2xl mx-auto px-4 sm:px-6 w-full">
                <UserNeeds
                  constraints={constraints}
                  onConstraintsChange={setConstraints}
                  selectedTimeSlot={selectedTimeSlot}
                  onTimeSlotChange={handleTimeSlotChange}
                  hero={
                    <motion.div
                      className="flex flex-col items-center text-center pb-6 sm:pb-8"
                      style={{
                        opacity: titleOpacity,
                        y: titleY,
                      }}
                    >
                      {/* VulcanHero — harmonized blob + mark composition */}
                      <div
                        className="relative flex items-center justify-center mb-6"
                        style={{ width: 160, height: 160 }}
                      >
                        {/* Radiant warmth — large soft glow irradiated outward */}
                        <motion.div
                          aria-hidden="true"
                          style={{
                            position: "absolute",
                            width: 420,
                            height: 420,
                            top: "50%",
                            left: "50%",
                            marginTop: -210,
                            marginLeft: -210,
                            borderRadius: "50%",
                            background: "var(--hero-glow-warm)",
                            filter: "blur(40px)",
                            pointerEvents: "none",
                            willChange: prefersReducedMotion
                              ? "auto"
                              : "transform, opacity",
                            opacity: prefersReducedMotion
                              ? 0.15
                              : undefined,
                          }}
                          animate={
                            prefersReducedMotion
                              ? {}
                              : {
                                  scale: [1, 1.06],
                                  opacity: [0.12, 0.18],
                                }
                          }
                          transition={
                            prefersReducedMotion
                              ? {}
                              : {
                                  scale: {
                                    duration: 6,
                                    repeat: Infinity,
                                    repeatType: "mirror",
                                    ease: "easeInOut",
                                  },
                                  opacity: {
                                    duration: 8,
                                    repeat: Infinity,
                                    repeatType: "mirror",
                                    ease: "easeInOut",
                                  },
                                }
                          }
                        />
                        {/* Secondary warmth ring — wider, subtler */}
                        <motion.div
                          aria-hidden="true"
                          style={{
                            position: "absolute",
                            width: 600,
                            height: 600,
                            top: "50%",
                            left: "50%",
                            marginTop: -300,
                            marginLeft: -300,
                            borderRadius: "50%",
                            background:
                              "var(--hero-glow-accent)",
                            filter: "blur(60px)",
                            pointerEvents: "none",
                            willChange: prefersReducedMotion
                              ? "auto"
                              : "transform, opacity",
                            opacity: prefersReducedMotion
                              ? 0.08
                              : undefined,
                          }}
                          animate={
                            prefersReducedMotion
                              ? {}
                              : {
                                  scale: [1, 1.04],
                                  opacity: [0.06, 0.1],
                                }
                          }
                          transition={
                            prefersReducedMotion
                              ? {}
                              : {
                                  scale: {
                                    duration: 10,
                                    repeat: Infinity,
                                    repeatType: "mirror",
                                    ease: "easeInOut",
                                  },
                                  opacity: {
                                    duration: 12,
                                    repeat: Infinity,
                                    repeatType: "mirror",
                                    ease: "easeInOut",
                                    delay: 2,
                                  },
                                }
                          }
                        />
                        <VulcanHero
                          size={160}
                          energy={doughEnergy}
                          blobVariant="forge"
                          logoVariant="naturale"
                          markRatio={0.32}
                        />
                      </div>
                      <h1
                        style={{
                          fontSize:
                            "clamp(2.25rem, 7vw, 3.5rem)",
                          lineHeight: 1.05,
                        }}
                      >
                        {cms.hero.title_line1}{" "}
                        <span
                          style={{
                            display: "block",
                            color: "var(--text-accent)",
                          }}
                        >
                          {cms.hero.title_line2}
                        </span>
                      </h1>
                      <p
                        className="font-serif italic mt-3 max-w-md"
                        style={{
                          color: "var(--text-muted)",
                          fontSize: "var(--font-size-2xl)",
                          lineHeight: "var(--leading-relaxed)",
                        }}
                      >
                        {cms.hero.subtitle}
                      </p>
                    </motion.div>
                  }
                />
              </div>
            </div>
          </motion.main>
        )}

        {/* ─── STEP 2 — STYLES: Choose your style ─── */}
        {currentStep === "styles" && (
          <motion.main
            key="styles"
            id="main-content"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 25,
            }}
            className="relative pb-32"
            style={{ zIndex: 2 }}
          >
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-8 sm:py-12">
              <div className="max-w-2xl lg:max-w-none mx-auto">
                {/* Lightweight header — no StepHeader, just title + back */}
                <div className="mb-8 sm:mb-10">
                  <motion.button
                    onClick={handleBackToSettings}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      type: "spring",
                      stiffness: 400,
                      damping: 25,
                    }}
                    className="flex items-center gap-2 mb-4 px-3 py-1.5 rounded-lg active:scale-95 transition-transform"
                    style={{
                      color: "var(--text-accent)",
                      fontSize: "var(--font-size-base)",
                      fontWeight:
                        "var(--weight-semibold)" as any,
                      background:
                        "color-mix(in srgb, var(--primary) 6%, rgba(0,0,0,0))",
                      border:
                        "1px solid color-mix(in srgb, var(--primary) 15%, var(--outline-variant))",
                    }}
                  >
                    <ArrowLeft size={14} />
                    {cms.configurator.backLabel}
                  </motion.button>
                  <h2
                    className="font-serif"
                    style={{
                      fontSize: "clamp(1.5rem, 4vw, 2.25rem)",
                      lineHeight: "var(--leading-snug)",
                      color: "var(--text-default)",
                    }}
                  >
                    {cms.steps.styles.title}
                  </h2>
                  <p
                    className="font-serif italic mt-1"
                    style={{
                      fontSize: "var(--font-size-xl-5)",
                      color: "var(--text-muted)",
                      opacity: 0.65,
                    }}
                  >
                    {cms.steps.styles.subtitle}
                  </p>
                </div>
                <RecommendedStyles
                  constraints={constraints}
                  selectedStyle={selectedStyle}
                  onSelectStyle={handleSelectStyle}
                />
              </div>
            </div>
          </motion.main>
        )}

        {/* ─── STEP 3 — RESULT ─── */}
        {currentStep === "result" &&
          recipe &&
          selectedStyle && (
            <motion.main
              key="result"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{
                type: "spring",
                stiffness: 400,
                damping: 25,
              }}
              className="relative pb-28 sm:pb-32"
              style={{ zIndex: 2 }}
            >
              {/* ── Cinematic photo header ── */}
              <motion.div
                className="relative overflow-hidden"
                style={{
                  height: heroHeight,
                  minHeight: "120px",
                }}
              >
                <motion.div
                  className="absolute inset-0"
                  style={{ y: heroImageY }}
                >
                  <ImageWithFallback
                    src={
                      STYLE_PHOTOS[selectedStyle.id] ||
                      "https://images.unsplash.com/photo-1717883235373-ef10b2a745a3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1200&q=80"
                    }
                    alt={selectedStyle.name}
                    className="w-full h-full object-cover"
                    style={{ minHeight: "45vh" }}
                  />
                </motion.div>
                {/* Darkening overlay on scroll */}
                <motion.div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background: "var(--container-page)",
                    opacity: heroOverlayOpacity,
                  }}
                />
                {/* Bottom scrim for text legibility */}
                <div
                  className="absolute inset-x-0 bottom-0"
                  style={{
                    height: "40%",
                    background:
                      "linear-gradient(to top, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0) 100%)",
                  }}
                />
              </motion.div>

              {/* ── Rising sheet — title + content ── */}
              <div
                className="relative -mt-8 sm:-mt-10 rounded-t-3xl"
                style={{
                  background: "var(--container-page)",
                  zIndex: 2,
                }}
              >
                {/* Subtle top edge highlight */}
                <div
                  className="absolute top-0 left-6 right-6 sm:left-8 sm:right-8 h-px"
                  style={{
                    background:
                      "linear-gradient(90deg, rgba(0,0,0,0) 0%, var(--outline-variant) 30%, var(--outline-variant) 70%, rgba(0,0,0,0) 100%)",
                    opacity: 0.5,
                  }}
                />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-7 sm:pt-9">
                  {/* ── Title block — on page surface, clean typography ── */}
                  <div className="mb-6 sm:mb-8">
                    <p
                      className="type-label"
                      style={{
                        color: "var(--text-accent)",
                      }}
                    >
                      {cms.result.breadcrumb}
                    </p>
                    <h2
                      ref={resultHeadingRef}
                      tabIndex={-1}
                      className="font-serif mt-1 outline-none"
                      style={{
                        fontSize: "clamp(2rem, 6vw, 3.25rem)",
                        color: "var(--text-default)",
                        lineHeight: 1.1,
                      }}
                    >
                      {selectedStyle.name}
                    </h2>
                    <p
                      className="mt-1.5"
                      style={{
                        color: "var(--text-muted)",
                        fontSize: "var(--font-size-lg)",
                        fontStyle: "italic",
                        fontFamily: "'Playfair Display', serif",
                      }}
                    >
                      {cms.families[selectedStyle.family]
                        ?.name ?? selectedStyle.family}{" "}
                      · {selectedStyle.origin}
                    </p>
                  </div>

                  {/* ── Main layout grid ── */}
                  <div className="lg:grid lg:grid-cols-[1fr_340px] lg:gap-12 xl:gap-16">
                    <div className="max-w-2xl md:max-w-3xl lg:max-w-none mx-auto lg:mx-0">
                      {/* Mobile score dashboard — card treatment */}
                      <div className="lg:hidden mb-6">
                        <div
                          className="rounded-2xl overflow-hidden"
                          style={{
                            background:
                              "var(--surface-container-low)",
                            border:
                              "1px solid var(--outline-variant)",
                          }}
                        >
                          <div className="px-4 py-4 sm:px-5 sm:py-5">
                            <ScoreDashboard
                              scores={recipe.scores}
                              nerdMode={nerdMode}
                              onNerdToggle={() =>
                                setNerdMode(!nerdMode)
                              }
                              science={recipe.science}
                            />
                          </div>
                        </div>
                      </div>

                      {/* ── Stat strip — key metrics ── */}
                      <div>
                        <RecipeStatStrip
                          recipe={recipe}
                          nerdMode={nerdMode}
                        />
                      </div>

                      {/* ── Integrated fine-tuning — seamless below stat strip ── */}
                      <div className="mt-4 surface-card overflow-hidden">
                        <button
                          onClick={() =>
                            setShowFineTuning(!showFineTuning)
                          }
                          className="w-full flex items-center justify-between px-5 py-3.5 text-left active:scale-[0.99] transition-transform"
                          aria-expanded={showFineTuning}
                        >
                          <div className="flex items-center gap-2.5">
                            <SlidersHorizontal
                              size={14}
                              style={{
                                color: showFineTuning
                                  ? "var(--text-accent)"
                                  : "var(--text-muted)",
                              }}
                            />
                            <span
                              style={{
                                color: "var(--text-default)",
                                fontSize: "var(--font-size-xl)",
                                fontWeight:
                                  "var(--weight-semibold)" as any,
                              }}
                            >
                              {cms.ui.customizeParams}
                            </span>
                          </div>
                          <motion.div
                            animate={{
                              rotate: showFineTuning ? 180 : 0,
                            }}
                            transition={{
                              type: "spring",
                              stiffness: 500,
                              damping: 30,
                            }}
                          >
                            <ChevronDown
                              size={14}
                              style={{
                                color: "var(--text-muted)",
                              }}
                            />
                          </motion.div>
                        </button>
                        <AnimatePresence>
                          {showFineTuning && (
                            <motion.div
                              initial={{
                                height: 0,
                                opacity: 0,
                              }}
                              animate={{
                                height: "auto",
                                opacity: 1,
                              }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{
                                type: "spring",
                                stiffness: 400,
                                damping: 25,
                              }}
                              className="overflow-hidden"
                            >
                              <div
                                className="px-5 pb-5"
                                style={{
                                  borderTop:
                                    "1px solid var(--container-border)",
                                }}
                              >
                                <div className="pt-4">
                                  <RecipeConfigurator
                                    style={selectedStyle}
                                    constraints={constraints}
                                    onConstraintsChange={
                                      setConstraints
                                    }
                                    customHydration={
                                      customHydration
                                    }
                                    onHydrationChange={
                                      setCustomHydration
                                    }
                                    customFlourW={customFlourW}
                                    onFlourWChange={
                                      setCustomFlourW
                                    }
                                    customFermentHours={
                                      customFermentHours
                                    }
                                    onFermentHoursChange={
                                      setCustomFermentHours
                                    }
                                    customFermentTemp={
                                      customFermentTemp
                                    }
                                    onFermentTempChange={
                                      setCustomFermentTemp
                                    }
                                    usePreFerment={
                                      usePreFerment
                                    }
                                    onPreFermentChange={
                                      setUsePreFerment
                                    }
                                    customFlourPL={
                                      nerdMode
                                        ? customFlourPL
                                        : undefined
                                    }
                                    onFlourPLChange={
                                      nerdMode
                                        ? setCustomFlourPL
                                        : undefined
                                    }
                                    science={recipe.science}
                                    panConfig={panConfig}
                                    onPanConfigChange={
                                      setPanConfig
                                    }
                                  />
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      {/* ── Recipe content: ingredients + timeline ── */}
                      <div className="mt-8 sm:mt-10">
                        {/* Contextual troubleshooting warnings */}
                        <div className="mb-6">
                          <ContextualWarnings
                            hydration={customHydration}
                            flourW={customFlourW}
                            flourPL={customFlourPL}
                            fermentHours={customFermentHours}
                            fermentTemp={customFermentTemp}
                            ovenTemp={
                              constraints.oven_max_temp_c
                            }
                            skillLevel={constraints.skill_level}
                            usePreFerment={usePreFerment}
                          />
                          {/* Dietary-specific warnings */}
                          {constraints.dietary_filters.length >
                            0 &&
                            (() => {
                              const dw = getDietaryWarnings(
                                constraints.dietary_filters,
                                {
                                  fermentHours:
                                    customFermentHours,
                                  fermentTemp:
                                    customFermentTemp,
                                  yeastType:
                                    constraints.pantry_yeasts.includes(
                                      "sourdough",
                                    )
                                      ? "sourdough"
                                      : constraints.pantry_yeasts.includes(
                                            "fresh",
                                          )
                                        ? "fresh"
                                        : "dry",
                                  hydration: customHydration,
                                  flourW: customFlourW,
                                },
                                cms,
                              );
                              if (dw.length === 0) return null;
                              return (
                                <div
                                  className="mt-3"
                                  style={{
                                    background:
                                      "var(--surface-container-low)",
                                    border:
                                      "1px solid var(--outline-variant)",
                                    borderRadius: "1rem",
                                    padding: "1rem 1.25rem",
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: "0.625rem",
                                  }}
                                >
                                  <div
                                    style={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: "0.5rem",
                                    }}
                                  >
                                    <span
                                      style={{
                                        fontSize: "0.75rem",
                                      }}
                                    >
                                      🩺
                                    </span>
                                    <span
                                      style={{
                                        fontSize: "0.6875rem",
                                        letterSpacing: "0.18em",
                                        textTransform:
                                          "uppercase",
                                        color: "var(--primary)",
                                        fontWeight:
                                          "var(--weight-semibold)",
                                      }}
                                    >
                                      {
                                        cms.pages
                                          .dietaryWarningsTitle
                                      }
                                    </span>
                                  </div>
                                  {dw.map((w, i) => (
                                    <div
                                      key={w.filterId + i}
                                      className="flex items-start gap-2"
                                      style={{
                                        background:
                                          w.severity ===
                                          "critical"
                                            ? "rgba(211,47,47,0.08)"
                                            : w.severity ===
                                                "warning"
                                              ? "rgba(204,136,68,0.08)"
                                              : "rgba(133,117,104,0.06)",
                                        border: `1px solid ${w.severity === "critical" ? "rgba(211,47,47,0.2)" : w.severity === "warning" ? "rgba(204,136,68,0.2)" : "rgba(133,117,104,0.12)"}`,
                                        borderRadius: "0.75rem",
                                        padding:
                                          "0.625rem 0.875rem",
                                      }}
                                    >
                                      <span
                                        style={{
                                          flexShrink: 0,
                                          fontSize: "0.75rem",
                                          marginTop: 1,
                                        }}
                                      >
                                        {w.severity ===
                                        "critical"
                                          ? "🛑"
                                          : w.severity ===
                                              "warning"
                                            ? "⚠️"
                                            : "ℹ️"}
                                      </span>
                                      <div>
                                        <div
                                          style={{
                                            fontSize:
                                              "0.8125rem",
                                            color:
                                              "var(--text-default)",
                                            lineHeight: 1.4,
                                          }}
                                        >
                                          {w.message}
                                        </div>
                                        <div
                                          style={{
                                            fontSize: "0.75rem",
                                            color:
                                              "var(--muted-foreground)",
                                            lineHeight: 1.4,
                                            marginTop: 2,
                                          }}
                                        >
                                          💡 {w.tip}
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              );
                            })()}
                        </div>
                        <RecipeOutput
                          recipe={recipe}
                          constraints={constraints}
                          onConstraintsChange={setConstraints}
                          nerdMode={nerdMode}
                          selectedFlourId={selectedFlourId}
                          onSelectFlour={(flour) => {
                            if (flour) {
                              setSelectedFlourId(flour.id);
                              setCustomFlourW(flour.w);
                              setCustomFlourPL(flour.pl);
                            } else {
                              setSelectedFlourId(null);
                              if (selectedStyle) {
                                setCustomFlourW(
                                  Math.round(
                                    (selectedStyle.dough
                                      .flour_w_range[0] +
                                      selectedStyle.dough
                                        .flour_w_range[1]) /
                                      2,
                                  ),
                                );
                                setCustomFlourPL(
                                  defaultPL(selectedStyle),
                                );
                              }
                            }
                          }}
                          selectedTimeSlotId={selectedTimeSlot}
                        />

                        {/* ── Troubleshooting link — contextual to recipe ── */}
                        <div className="mt-8">
                          <Link
                            to="/learn/troubleshooting"
                            className="flex items-center gap-3 p-4 rounded-2xl active:scale-[0.98] transition-transform"
                            style={{
                              background:
                                "color-mix(in srgb, var(--tertiary) 6%, var(--surface-container-low))",
                              border:
                                "1px solid color-mix(in srgb, var(--tertiary) 15%, var(--outline-variant))",
                              textDecoration: "none",
                              color: "inherit",
                            }}
                          >
                            <div
                              className="flex items-center justify-center flex-shrink-0"
                              style={{
                                width: 36,
                                height: 36,
                                borderRadius: 10,
                                background:
                                  "color-mix(in srgb, var(--tertiary) 12%, rgba(0,0,0,0))",
                              }}
                            >
                              <AlertTriangle
                                size={18}
                                style={{
                                  color: "var(--tertiary)",
                                }}
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div
                                style={{
                                  fontSize:
                                    "var(--font-size-base)",
                                  fontWeight:
                                    "var(--weight-semibold)" as any,
                                  color: "var(--text-default)",
                                }}
                              >
                                {cms.pages.troubleshootingTitle}
                              </div>
                              <div
                                className="type-data"
                                style={{
                                  fontSize:
                                    "var(--font-size-sm)",
                                  color: "var(--text-muted)",
                                  marginTop: 2,
                                }}
                              >
                                {cms.pages.troubleshootingDesc}
                              </div>
                            </div>
                          </Link>
                        </div>
                      </div>
                    </div>

                    {/* Desktop sidebar */}
                    <div className="hidden lg:block">
                      <div className="sticky top-20">
                        <ScoreDashboard
                          scores={recipe.scores}
                          desktopMode
                          nerdMode={nerdMode}
                          onNerdToggle={() =>
                            setNerdMode(!nerdMode)
                          }
                          science={recipe.science}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.main>
          )}
      </AnimatePresence>

      {/* VPL-068: Scroll indicators removed — single continuous flow */}

      {/* ═══ FLOATING CTA ═══ */}
      <div className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none">
        {/* M3: bottom scrim — gives floating CTA visual grounding */}
        <div
          className="absolute inset-x-0 bottom-0"
          style={{
            height: "140px",
            background: `linear-gradient(to top, var(--container-page) 0%, color-mix(in srgb, var(--container-page) 85%, transparent) 45%, rgba(0,0,0,0) 100%)`,
          }}
        />
        {/* pb-20 on mobile to clear the 64px bottom tab bar; md:pb-6 on desktop */}
        <div
          className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 md:pb-6 flex justify-center"
          style={{ zIndex: 1 }}
        >
          <AnimatePresence mode="wait">
            {/* Settings → go to styles */}
            {currentStep === "settings" && (
              <motion.button
                key="cta-styles"
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.9 }}
                transition={{
                  type: "spring",
                  stiffness: 400,
                  damping: 25,
                }}
                onClick={handleGoToStyles}
                whileHover={{ scale: 1.03, y: -1 }}
                className="pointer-events-auto flex items-center gap-2.5 h-12 sm:h-13 px-8 sm:px-10 rounded-full active:scale-[0.97] transition-transform"
                style={{
                  background: "var(--cta-btn-bg)",
                  color: "var(--cta-btn-text)",
                  boxShadow: "var(--cta-btn-shadow-deep)",
                  fontWeight: "var(--weight-semibold)" as any,
                  fontSize: "var(--font-size-xl-5)",
                }}
              >
                {cms.ui.chooseStyle}
                <ArrowRight size={15} />
              </motion.button>
            )}

            {/* Styles → generate recipe */}
            {currentStep === "styles" && canGenerateRecipe && (
              <motion.button
                key="cta-generate"
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.9 }}
                transition={{
                  type: "spring",
                  stiffness: 400,
                  damping: 25,
                }}
                onClick={handleGenerateRecipe}
                whileHover={{ scale: 1.03, y: -1 }}
                className="pointer-events-auto flex items-center gap-2.5 h-12 sm:h-13 px-8 sm:px-10 rounded-full active:scale-[0.97] transition-transform"
                style={{
                  background: "var(--cta-btn-bg)",
                  color: "var(--cta-btn-text)",
                  boxShadow: "var(--cta-btn-shadow-deep)",
                  fontWeight: "var(--weight-semibold)" as any,
                  fontSize: "var(--font-size-xl-5)",
                }}
              >
                <Sparkles size={15} />
                {cms.ui.generate}
              </motion.button>
            )}

            {/* Result → change style / new pizza */}
            {currentStep === "result" && (
              <motion.div
                key="cta-result"
                initial={{ opacity: 0, y: 12, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 12, scale: 0.95 }}
                className="pointer-events-auto flex items-center gap-2.5"
              >
                <motion.button
                  onClick={handleBackToStyles}
                  whileHover={{ scale: 1.03 }}
                  className="flex items-center gap-2 h-12 sm:h-13 px-6 sm:px-7 rounded-full active:scale-[0.97] transition-transform"
                  style={{
                    background: "var(--btn-secondary-bg)",
                    color: "var(--btn-secondary-text)",
                    boxShadow: "var(--btn-secondary-shadow)",
                    fontWeight: "var(--weight-semibold)" as any,
                    fontSize: "var(--font-size-xl)",
                    border:
                      "1px solid var(--btn-secondary-border)",
                  }}
                >
                  <Palette size={14} />
                  {cms.ui.changeStyle}
                </motion.button>
                <motion.button
                  onClick={handleReset}
                  whileHover={{ scale: 1.03 }}
                  className="flex items-center gap-2 h-12 sm:h-13 px-6 sm:px-7 rounded-full active:scale-[0.97] transition-transform"
                  style={{
                    background: "var(--btn-ghost-bg)",
                    color: "var(--btn-ghost-text)",
                    boxShadow: "var(--btn-ghost-shadow)",
                    fontWeight: "var(--weight-semibold)" as any,
                    fontSize: "var(--font-size-xl)",
                  }}
                >
                  <RotateCcw size={14} />
                  {cms.ui.newPizza}
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ═══ STYLE DETAIL SHEET — bottom sheet with selected style details ═══ */}
      <AnimatePresence>
        {currentStep === "styles" && selectedStyle && (
          <StyleDetailSheet
            key={selectedStyle.id}
            style={selectedStyle}
            onGenerate={handleGenerateRecipe}
            onDismiss={() => setSelectedStyle(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}