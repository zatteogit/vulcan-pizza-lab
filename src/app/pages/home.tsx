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
} from "motion/react";
import {
  ChevronLeft,
  Moon,
  Sun,
  Sparkles,
  ArrowRight,
  RotateCcw,
  SlidersHorizontal,
  ChevronDown,
  Palette,
  Bug,
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
} from "../components/pizza-engine";
import { STYLE_PHOTOS } from "../components/recommended-styles";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { DoughBlob, moodFromScore } from "../components/dough-mascot";
import { useDarkMode } from "../components/root-layout";

type AppStep = "build" | "result";

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
  const { darkMode, setDarkMode } = useDarkMode();
  const [currentStep, setCurrentStep] =
    useState<AppStep>("build");
  const [selectedStyle, setSelectedStyle] =
    useState<PizzaStyle | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<
    string | null
  >(null);
  const [showFineTuning, setShowFineTuning] = useState(false);
  const [nerdMode, setNerdMode] = useState(false);

  const [constraints, setConstraints] =
    useState<UserConstraints>({
      oven_type: "home",
      oven_max_temp_c: 250,
      skill_level: 2,
      available_hours: 24,
      dough_balls: 4,
      has_mixer: false,
      has_pizza_stone: false,
      has_pizza_steel: false,
      dietary_filters: [],
      pantry_flours: [],
      pantry_yeasts: [],
    });

  const [customHydration, setCustomHydration] = useState(60);
  const [customFlourW, setCustomFlourW] = useState(250);
  const [customFermentHours, setCustomFermentHours] =
    useState(16);
  const [customFermentTemp, setCustomFermentTemp] = useState(4);
  const [usePreFerment, setUsePreFerment] = useState(false);

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
    },
    [constraints.available_hours],
  );

  const recipe: GeneratedRecipe | null = useMemo(() => {
    if (!selectedStyle) return null;
    return generateRecipe(
      selectedStyle,
      constraints,
      customHydration,
      customFlourW,
      customFermentHours,
      customFermentTemp,
      usePreFerment,
    );
  }, [
    selectedStyle,
    constraints,
    customHydration,
    customFlourW,
    customFermentHours,
    customFermentTemp,
    usePreFerment,
  ]);

  const handleReset = () => {
    setCurrentStep("build");
    setSelectedStyle(null);
    setSelectedTimeSlot(null);
    setShowFineTuning(false);
    setNerdMode(false);
  };

  const canProceedFromNeeds = selectedTimeSlot !== null;
  const canGenerateRecipe = selectedStyle !== null;

  /* Scroll-driven title fade */
  const { scrollY } = useScroll();
  const titleOpacity = useTransform(scrollY, [0, 160], [1, 0]);
  const titleY = useTransform(scrollY, [0, 160], [0, -14]);

  /* Section tracking */
  const buildContainerRef = useRef<HTMLDivElement | null>(null);
  const activeSection = useActiveScrollSection(
    buildContainerRef,
    currentStep === "build",
  );

  /* Scroll-to-top on step change */
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "instant" as ScrollBehavior,
    });
  }, [currentStep]);

  /* Apply CSS scroll-snap on build step */
  useEffect(() => {
    const el = document.documentElement;
    if (currentStep === "build") {
      el.style.scrollSnapType = "y mandatory";
      el.style.scrollPaddingTop = "4rem";
    } else {
      el.style.scrollSnapType = "";
      el.style.scrollPaddingTop = "";
    }
    return () => {
      el.style.scrollSnapType = "";
      el.style.scrollPaddingTop = "";
    };
  }, [currentStep]);

  /* ═══ Fire glow intensity based on section + step ═══ */
  const fireIntensity =
    currentStep === "result"
      ? 0.6
      : activeSection === "styles"
        ? 0.5
        : activeSection === "setup"
          ? 0.35
          : 0.25;

  /* ═══ DoughBlob energy — maps section/step state to mascot reactivity ═══ */
  const doughEnergy =
    currentStep === "result"
      ? recipe?.scores.composite ?? 60
      : activeSection === "styles"
        ? 55
        : activeSection === "setup"
          ? 35
          : 20;

  const doughVariant =
    currentStep === "result" && recipe
      ? moodFromScore(recipe.scores.composite)
      : activeSection === "styles"
        ? "stretch"
        : "rest";

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* ═══ FIRE GLOW — ambient background ═══ */}
      <FireGlow intensity={fireIntensity} />

      {/* ═══ TOP BAR ═══ */}
      <header
        className="sticky top-0 z-50 h-14 sm:h-16"
        style={{
          background:
            "color-mix(in srgb, var(--background) 88%, transparent)",
          backdropFilter: "blur(24px) saturate(1.6)",
          WebkitBackdropFilter: "blur(24px) saturate(1.6)",
          borderBottom: "1px solid var(--border-muted)",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 h-full flex items-center justify-between">
          <div className="flex items-center gap-3">
            {currentStep === "result" ? (
              <motion.button
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                onClick={() => setCurrentStep("build")}
                className="flex items-center gap-1 text-primary -ml-1"
                style={{
                  fontSize: "0.875rem",
                  fontWeight: 600,
                }}
              >
                <ChevronLeft size={18} />
                <span>Indietro</span>
              </motion.button>
            ) : (
              <div className="flex items-center gap-2.5">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{
                    background: "var(--grad-ember)",
                    boxShadow:
                      "0 2px 8px rgba(194,74,47,0.25)",
                    color: "white",
                  }}
                >
                  <VulcanMark size={20} />
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span
                    className="font-serif text-foreground"
                    style={{
                      fontSize: "1.1875rem",
                      fontWeight: 700,
                      letterSpacing: "-0.02em",
                    }}
                  >
                    Vulcan
                  </span>
                  <span
                    className="hidden sm:inline text-muted-foreground"
                    style={{
                      fontSize: "0.625rem",
                      fontWeight: 600,
                      letterSpacing: "0.12em",
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
            {/* Dev tools link */}
            <Link
              to="/dev"
              className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-[var(--surface-container)] transition-colors"
              style={{ color: "var(--muted-foreground)" }}
              aria-label="Dev tools"
            >
              <Bug size={14} />
            </Link>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-[var(--surface-container)] transition-colors"
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

      {/* ═══ CONTENT ═══ */}
      <AnimatePresence mode="wait">
        {/* ─── BUILD STEP: 3 scroll-snapped sections ─── */}
        {currentStep === "build" && (
          <motion.main
            key="build"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="relative"
            style={{ zIndex: 2 }}
            ref={buildContainerRef}
          >
            {/* ── HERO + UserNeeds (produces sections "context" + "setup") ── */}
            <div className="max-w-2xl mx-auto px-4 sm:px-6 w-full">
              {/* UserNeeds — renders data-section="context" and data-section="setup" */}
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
                    {/* DoughBlob — ambient energy-reactive mascot behind logo */}
                    <div className="relative flex items-center justify-center mb-6">
                      <div className="absolute pointer-events-none" style={{ zIndex: 0 }}>
                        <DoughBlob
                          variant={doughVariant}
                          size={140}
                          energy={doughEnergy}
                        />
                      </div>
                      <div
                        className="relative w-16 h-16 rounded-2xl flex items-center justify-center"
                        style={{
                          background: "var(--grad-ember)",
                          boxShadow:
                            "0 4px 20px rgba(194,74,47,0.3)",
                          color: "white",
                          zIndex: 1,
                        }}
                      >
                        <VulcanMark size={36} />
                      </div>
                    </div>
                    <h1
                      style={{
                        fontSize:
                          "clamp(2.25rem, 7vw, 3.5rem)",
                        lineHeight: 1.05,
                      }}
                    >
                      La tua{" "}
                      <span
                        className="text-primary"
                        style={{ display: "block" }}
                      >
                        pizza perfetta.
                      </span>
                    </h1>
                    <p
                      className="font-serif italic text-muted-foreground mt-3 max-w-md"
                      style={{
                        fontSize: "1rem",
                        lineHeight: 1.5,
                      }}
                    >
                      Raccontaci cosa hai a disposizione e ti
                      guideremo verso lo stile ideale.
                    </p>
                  </motion.div>
                }
              />
            </div>

            {/* ── SECTION 3: Style selection ── */}
            <div
              data-section="styles"
              className="min-h-[calc(100dvh-3.5rem)] flex flex-col"
              style={{
                scrollSnapAlign: "start",
                scrollMarginTop: "4rem",
              }}
            >
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex-1 py-10 sm:py-12 pb-32">
                <div className="max-w-2xl lg:max-w-none">
                  {/* ── Big step header ── */}
                  <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.5 }}
                    transition={{
                      duration: 0.5,
                      ease: "easeOut",
                    }}
                    className="flex flex-col items-center lg:items-start text-center lg:text-left mb-10 sm:mb-12"
                  >
                    <span
                      style={{
                        fontSize: "0.6875rem",
                        fontWeight: 700,
                        letterSpacing: "0.18em",
                        textTransform: "uppercase",
                        color: "var(--primary)",
                        fontFamily: "'DM Mono', monospace",
                        marginBottom: "0.5rem",
                      }}
                    >
                      03 — Stile
                    </span>
                    <h2
                      className="font-serif"
                      style={{
                        fontSize:
                          "clamp(1.75rem, 5vw, 2.75rem)",
                        lineHeight: 1.1,
                        letterSpacing: "-0.02em",
                        color: "var(--foreground)",
                      }}
                    >
                      Scegli il tuo stile
                    </h2>
                    <p
                      className="font-serif italic text-muted-foreground mt-1.5"
                      style={{
                        fontSize: "0.9375rem",
                        lineHeight: 1.5,
                        opacity: 0.65,
                      }}
                    >
                      Curati per le tue esigenze
                    </p>
                    <div
                      className="mx-auto lg:mx-0 mt-4 sm:mt-5"
                      style={{
                        width: "2rem",
                        height: "2px",
                        borderRadius: "1px",
                        background: "var(--primary)",
                        opacity: 0.35,
                      }}
                    />
                  </motion.div>

                  <RecommendedStyles
                    constraints={constraints}
                    selectedStyle={selectedStyle}
                    onSelectStyle={handleSelectStyle}
                  />
                </div>
              </div>
            </div>
          </motion.main>
        )}

        {/* ─── RESULT STEP ─── */}
        {currentStep === "result" &&
          recipe &&
          selectedStyle && (
            <motion.main
              key="result"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
              className="relative pb-28 sm:pb-32"
              style={{ zIndex: 2 }}
            >
              {/* ── Cinematic photo header ── */}
              <div
                className="relative overflow-hidden"
                style={{
                  maxHeight: "55vh",
                  minHeight: "280px",
                }}
              >
                <ImageWithFallback
                  src={
                    STYLE_PHOTOS[selectedStyle.id] ||
                    "https://images.unsplash.com/photo-1717883235373-ef10b2a745a3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1200&q=80"
                  }
                  alt={selectedStyle.name}
                  className="w-full h-full object-cover"
                  style={{ minHeight: "280px" }}
                />
                <div
                  className="absolute inset-0"
                  style={{
                    background: `
                  radial-gradient(ellipse at 50% 30%, transparent 30%, rgba(0,0,0,0.3) 100%),
                  linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.1) 40%, rgba(0,0,0,0.5) 75%, rgba(0,0,0,0.75) 100%)
                `,
                  }}
                />
                <div
                  className="absolute bottom-0 left-0 right-0 h-24"
                  style={{
                    background: "var(--background)",
                    maskImage:
                      "linear-gradient(to top, black 0%, transparent 100%)",
                    WebkitMaskImage:
                      "linear-gradient(to top, black 0%, transparent 100%)",
                  }}
                />
                {/* Title overlay — very prominent */}
                <div className="absolute bottom-8 left-0 right-0 px-6 sm:px-8 lg:px-12">
                  <div className="max-w-7xl mx-auto">
                    <p
                      style={{
                        fontSize: "0.625rem",
                        fontWeight: 600,
                        letterSpacing: "0.12em",
                        color: "rgba(255,255,255,0.5)",
                        textTransform: "uppercase",
                        fontFamily: "'DM Sans', sans-serif",
                      }}
                    >
                      La tua pizza perfetta
                    </p>
                    <h2
                      className="font-serif mt-1"
                      style={{
                        fontSize: "clamp(2rem, 6vw, 3.5rem)",
                        color: "white",
                        textShadow:
                          "0 2px 20px rgba(0,0,0,0.6)",
                        lineHeight: 1.1,
                      }}
                    >
                      {selectedStyle.name}
                    </h2>
                    <p
                      className="mt-1.5 hidden sm:block"
                      style={{
                        fontSize: "0.8125rem",
                        color: "rgba(255,255,255,0.6)",
                        fontFamily: "'DM Sans', sans-serif",
                      }}
                    >
                      {selectedStyle.family} ·{" "}
                      {selectedStyle.origin}
                    </p>
                  </div>
                </div>
              </div>

              {/* ── Content below photo ── */}
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-4">
                <div className="lg:grid lg:grid-cols-[1fr_340px] lg:gap-12 xl:gap-16">
                  <div className="max-w-2xl">
                    {/* Mobile sticky score dashboard */}
                    <div
                      className="lg:hidden sticky top-14 z-30 -mx-4 px-4 pt-2 pb-2"
                      style={{
                        background:
                          "color-mix(in srgb, var(--background) 88%, transparent)",
                        backdropFilter:
                          "blur(20px) saturate(1.4)",
                        WebkitBackdropFilter:
                          "blur(20px) saturate(1.4)",
                        borderBottom:
                          "1px solid var(--border-muted)",
                      }}
                    >
                      <ScoreDashboard
                        scores={recipe.scores}
                        nerdMode={nerdMode}
                        onNerdToggle={() =>
                          setNerdMode(!nerdMode)
                        }
                        science={recipe.science}
                      />
                    </div>

                    {/* ── Stat strip — key metrics ── */}
                    <div className="mt-6 sm:mt-8">
                      <RecipeStatStrip recipe={recipe} />
                    </div>

                    {/* ── Integrated fine-tuning — seamless below stat strip ── */}
                    <div
                      className="mt-4 rounded-2xl overflow-hidden"
                      style={{
                        background:
                          "var(--surface-container-low)",
                        border:
                          "1px solid var(--outline-variant)",
                      }}
                    >
                      <button
                        onClick={() =>
                          setShowFineTuning(!showFineTuning)
                        }
                        className="w-full flex items-center justify-between px-5 py-3.5 text-left"
                      >
                        <div className="flex items-center gap-2.5">
                          <SlidersHorizontal
                            size={14}
                            className={
                              showFineTuning
                                ? "text-primary"
                                : "text-muted-foreground"
                            }
                          />
                          <span
                            className="text-foreground"
                            style={{
                              fontSize: "0.875rem",
                              fontWeight: 600,
                            }}
                          >
                            Personalizza parametri
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
                            className="text-muted-foreground"
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
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden"
                          >
                            <div
                              className="px-5 pb-5"
                              style={{
                                borderTop:
                                  "1px solid var(--outline-variant)",
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
                                  science={recipe.science}
                                />
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* ── Recipe content: ingredients + timeline ── */}
                    <div className="mt-8 sm:mt-10">
                      <RecipeOutput
                        recipe={recipe}
                        constraints={constraints}
                        onConstraintsChange={setConstraints}
                      />
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
            </motion.main>
          )}
      </AnimatePresence>

      {/* ═══ SCROLL SECTION INDICATORS — build step ═══ */}
      {currentStep === "build" && (
        <div className="fixed right-3 sm:right-5 top-1/2 -translate-y-1/2 z-40 flex flex-col items-end gap-3">
          {(
            [
              { id: "context", label: "Contesto" },
              { id: "setup", label: "Setup" },
              { id: "styles", label: "Stile" },
            ] as const
          ).map(({ id, label }) => {
            const isActive = activeSection === id;
            return (
              <button
                key={id}
                onClick={() => {
                  const el =
                    document.querySelector<HTMLElement>(
                      `[data-section="${id}"]`,
                    );
                  el?.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                  });
                }}
                className="group flex items-center gap-2"
                aria-label={label}
              >
                {/* Label — shown on hover or when active */}
                <motion.span
                  initial={false}
                  animate={{
                    opacity: isActive ? 1 : 0,
                    x: isActive ? 0 : 8,
                  }}
                  className="group-hover:!opacity-100 group-hover:!translate-x-0 transition-all"
                  style={{
                    fontSize: "0.5625rem",
                    fontWeight: 700,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    color: isActive
                      ? "var(--primary)"
                      : "var(--muted-foreground)",
                    fontFamily: "'DM Mono', monospace",
                    whiteSpace: "nowrap",
                  }}
                >
                  {label}
                </motion.span>

                <motion.div
                  animate={{
                    height: isActive ? 24 : 6,
                    width: 6,
                    backgroundColor: isActive
                      ? "var(--primary)"
                      : "var(--outline)",
                    borderRadius: 3,
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 400,
                    damping: 30,
                  }}
                />
              </button>
            );
          })}
        </div>
      )}

      {/* ═══ FLOATING CTA ═══ */}
      <div className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-5 sm:pb-6 flex justify-center">
          <AnimatePresence mode="wait">
            {currentStep === "build" &&
              canProceedFromNeeds &&
              !canGenerateRecipe && (
                <motion.div
                  key="cta-scroll"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="pointer-events-auto"
                >
                  <motion.button
                    onClick={() => {
                      const el =
                        document.querySelector<HTMLElement>(
                          '[data-section="styles"]',
                        );
                      el?.scrollIntoView({
                        behavior: "smooth",
                        block: "start",
                      });
                    }}
                    whileHover={{ scale: 1.03, y: -1 }}
                    whileTap={{ scale: 0.97 }}
                    className="flex items-center gap-2.5 h-12 sm:h-13 px-8 sm:px-10 rounded-full"
                    style={{
                      background: "var(--grad-sage)",
                      color: "var(--cta-foreground)",
                      boxShadow:
                        "var(--cta-shadow), 0 8px 30px rgba(0,0,0,0.10)",
                      fontWeight: 600,
                      fontSize: "0.9375rem",
                    }}
                  >
                    Scegli stile
                    <ArrowRight size={16} />
                  </motion.button>
                </motion.div>
              )}

            {currentStep === "build" && canGenerateRecipe && (
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
                onClick={() => setCurrentStep("result")}
                whileHover={{ scale: 1.03, y: -1 }}
                whileTap={{ scale: 0.97 }}
                className="pointer-events-auto flex items-center gap-2.5 h-12 sm:h-13 px-8 sm:px-10 rounded-full"
                style={{
                  background: "var(--grad-sage)",
                  color: "var(--cta-foreground)",
                  boxShadow:
                    "var(--cta-shadow), 0 8px 30px rgba(0,0,0,0.10)",
                  fontWeight: 600,
                  fontSize: "0.9375rem",
                }}
              >
                <Sparkles size={15} />
                Genera ricetta
              </motion.button>
            )}

            {currentStep === "result" && (
              <motion.div
                key="cta-result"
                initial={{ opacity: 0, y: 12, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 12, scale: 0.95 }}
                className="pointer-events-auto flex items-center gap-2.5"
              >
                <motion.button
                  onClick={() => setCurrentStep("build")}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="flex items-center gap-2 h-12 sm:h-13 px-6 sm:px-7 rounded-full"
                  style={{
                    background:
                      "var(--surface-container-high)",
                    color: "var(--foreground)",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                    fontWeight: 600,
                    fontSize: "0.875rem",
                    border:
                      "1px solid var(--outline-variant)",
                  }}
                >
                  <Palette size={14} />
                  Cambia stile
                </motion.button>
                <motion.button
                  onClick={handleReset}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="flex items-center gap-2 h-12 sm:h-13 px-6 sm:px-7 rounded-full"
                  style={{
                    background: "var(--foreground)",
                    color: "var(--background)",
                    boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
                    fontWeight: 600,
                    fontSize: "0.875rem",
                  }}
                >
                  <RotateCcw size={14} />
                  Nuova pizza
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
