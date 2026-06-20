import {
ChevronDown,
ChevronLeft,
Heart,
SlidersHorizontal,
Sparkles
} from "lucide-react";
import {
motion,
useReducedMotion,
useScroll,
useTransform,
} from "motion/react";
import {
useCallback,
useEffect,
useMemo,
useRef,
useState,
} from "react";
import { Link } from "react-router";
import { FireGlow } from "../components/fire-glow";
import {
defaultPanShape,
GeneratedRecipe,
generateRecipe,
getDefaultDoughBalls,
PanConfig,
PizzaStyle,
STYLES_DB,
TimeSlot,
UserConstraints,
} from "../components/pizza-engine";
import { RecipeConfigurator } from "../components/recipe-configurator";
import { RecipeMatchCard } from "../components/recipe-match-card";
import { RecipeStatStrip } from "../components/recipe-stat-strip";
import { RecipeView } from "../components/recipe-view";
import { RecommendedStyles,STYLE_PHOTOS } from "../components/recommended-styles";
import { useDarkMode } from "../components/root-layout";
import { SettingsSummaryBar,UserNeeds } from "../components/user-needs";
import { VulcanHero } from "../components/vulcan-hero";
/* VPL-068: ProgressPill/MobileProgressBar removed — wizard is 3-step flow */
import { useCms } from "../components/cms/cms-context";
import { getDietaryWarnings } from "../components/dietary-data";
import { RecipePrimaryTab } from "../components/recipe-section-tabs";
import { StyleDetailSheet } from "../components/style-detail-sheet";
import { useStylesOverride } from "../components/styles-override-context";
import { ContextualWarnings } from "../components/troubleshooting-panel";
import { useProfileDefaults } from "../components/use-profile-defaults";
import { CtaButton, Heading, Surface } from "../components/ds";

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

export function HomePage() {
  const { setHideNavbar } = useDarkMode();
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
    setCreateRecipeMode("adapted");
    window.scrollTo({
      top: 0,
      behavior: "instant" as ScrollBehavior,
    });
    setCurrentStep("result");
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
  const nerdAvailable = profileDefaults.pizzaNerdEnabled;
  const effectiveNerdMode = nerdAvailable && nerdMode;
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
  const [selectedToppingConcept, setSelectedToppingConcept] = useState<
    string | null
  >(null);

  const [createRecipeTab, setCreateRecipeTab] = useState<RecipePrimaryTab>("ricetta");
  const [createRecipeMode, setCreateRecipeMode] = useState<"adapted" | "canonical">("adapted");

  const shareUrl = useMemo(() => {
    if (!selectedStyle) return "";
    const params = new URLSearchParams();
    params.set("mode", createRecipeMode);
    params.set("h", String(customHydration));
    params.set("w", String(customFlourW));
    params.set("pl", String(customFlourPL));
    params.set("f", String(customFermentHours));
    params.set("t", String(customFermentTemp));
    params.set("n", String(constraints.dough_balls));
    if (usePreFerment) params.set("pf", "1");
    if (constraints.oven_type !== "home")
      params.set("oven", constraints.oven_type);
    if (constraints.oven_max_temp_c !== 250)
      params.set("temp", String(constraints.oven_max_temp_c));
    if (
      selectedToppingConcept &&
      selectedStyle.default_topping_ref !== selectedToppingConcept
    )
      params.set("topping", selectedToppingConcept);

    return `${window.location.origin}/recipe/${selectedStyle.id}?${params.toString()}`;
  }, [
    selectedStyle,
    customHydration,
    customFlourW,
    customFlourPL,
    customFermentHours,
    customFermentTemp,
    constraints.dough_balls,
    usePreFerment,
    constraints.oven_type,
    constraints.oven_max_temp_c,
    selectedToppingConcept,
    createRecipeMode,
  ]);

  const handleTimeSlotChange = useCallback((slot: TimeSlot) => {
    setSelectedTimeSlot(slot.id);
    setConstraints((c) => ({
      ...c,
      available_hours: slot.hours,
    }));
    /* La scelta della tempistica è il gesto che fa partire il flusso: niente
       bottone "Scegli lo stile". Avanziamo subito allo step stili, dove la
       scelta "atterra" come chip nella barra parametri in alto. Un attimo di
       respiro perché la card mostri il check prima della transizione. */
    const advance = () => {
      window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
      setCurrentStep("styles");
    };
    if (prefersReducedMotion) advance();
    else window.setTimeout(advance, 280);
  }, [prefersReducedMotion]);

  const handleSelectStyle = useCallback(
    (style: PizzaStyle) => {
      setSelectedStyle(style);
      setCreateRecipeMode("adapted");
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
      setSelectedToppingConcept(style.default_topping_ref ?? null);
    },
    [constraints.available_hours],
  );

  const handleResetCreateToCanonical = useCallback(() => {
    if (!selectedStyle) return;
    const hCenter = Math.round(
      (selectedStyle.dough.hydration_pct_range[0] +
        selectedStyle.dough.hydration_pct_range[1]) /
        2,
    );
    const wCenter = Math.round(
      (selectedStyle.dough.flour_w_range[0] +
        selectedStyle.dough.flour_w_range[1]) /
        2,
    );
    const fCenter = Math.round(
      (selectedStyle.dough.fermentation_hours_range[0] +
        selectedStyle.dough.fermentation_hours_range[1]) /
        2,
    );
    setCreateRecipeMode("canonical");
    setCustomHydration(hCenter);
    setCustomFlourW(wCenter);
    setCustomFermentHours(fCenter);
    setCustomFermentTemp(fCenter > 12 ? 4 : 22);
    setUsePreFerment(selectedStyle.requires_pre_ferment);
    setCustomFlourPL(defaultPL(selectedStyle));
    setPanConfig({
      panShape: defaultPanShape(selectedStyle),
      panLength: selectedStyle.shape.length_cm,
      panWidth: selectedStyle.shape.width_cm,
      panDiameter: selectedStyle.shape.diameter_cm,
      thickness: selectedStyle.shape.thickness_factor,
    });
    setSelectedFlourId(null);
    setSelectedToppingConcept(selectedStyle.default_topping_ref ?? null);
    setSelectedTimeSlot(null);
    setConstraints((current) => ({
      ...current,
      available_hours: fCenter,
      dough_balls: getDefaultDoughBalls(selectedStyle),
      oven_type: selectedStyle.baking.oven_type_required,
      oven_max_temp_c: selectedStyle.baking.temp_c_ideal,
    }));
  }, [selectedStyle]);

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
    const styleWithTopping =
      selectedToppingConcept &&
      selectedToppingConcept !== selectedStyle.default_topping_ref
        ? { ...selectedStyle, default_topping_ref: selectedToppingConcept }
        : selectedStyle;
    return generateRecipe(
      styleWithTopping,
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
    selectedToppingConcept,
  ]);

  /* VPL-068: time slot is optional — styles always visible */
  const canGenerateRecipe = selectedStyle !== null;

  /* Scroll-driven title fade */
  const { scrollY } = useScroll();
  const titleOpacity = useTransform(scrollY, [0, 160], [1, 0]);
  const titleY = useTransform(scrollY, [0, 160], [0, -14]);

  /* Scroll-to-top on step change */
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "instant" as ScrollBehavior,
    });
  }, [currentStep]);

  /* Sul result la scheda è una vista focalizzata identica a Scopri: nascondiamo
     la chrome dell'app (rail/tab bar/profilo) così la navbar delle sezioni è
     l'unica barra in basso. Ripristino uscendo o smontando. */
  useEffect(() => {
    setHideNavbar?.(currentStep === "result");
    return () => setHideNavbar?.(false);
  }, [currentStep, setHideNavbar]);

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

  /* ═══ VPL-008: Focus management on step transitions ═══ */
  const resultHeadingRef = useRef<HTMLElement | null>(
    null,
  );
  const prevStepRef = useRef<AppStep>(currentStep);

  useEffect(() => {
    if (prevStepRef.current !== currentStep) {
      prevStepRef.current = currentStep;
      /* Delay slightly so DOM is mounted after the step transition */
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

  const styleStepTimeLabel = selectedTimeSlot
    ? cms.timeSlots[selectedTimeSlot]?.label ?? selectedTimeSlot
    : null;

  return (
    <div
      className="min-h-screen"
      style={{
        background: "var(--container-page)",
        color: "var(--text-default)",
      }}
    >
      {/* ═══ VPL-009: Skip-to-content link for screen readers ═══ */}
      <CtaButton
        as="a"
        href="#main-content"
        radius="lg"
        elevated={false}
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[9999] focus:px-4 focus:py-2 focus:rounded-lg"
        style={{
          fontSize: "var(--font-size-lg)",
          fontWeight: "var(--weight-semibold)" as any,
        }}
      >
        {cms.pages.skipToContent}
      </CtaButton>

      {/* ═══ FIRE GLOW — ambient background ═══ */}
      <FireGlow intensity={fireIntensity} />

      {/* VPL-080: header rimosso dalla sezione Crea — la navigazione vive già
          nella shell (sidebar rail / tab bar / pulsante Profilo). La sezione
          parte diretta dai parametri (cucina/dispensa/tu) + logo + tempistiche.
          Dark mode → Profilo. Back tra gli step → CTA in basso / back inline. */}

      {/* ═══ STYLE OVERRIDE BANNER ═══ */}
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
            className="overflow-hidden sticky top-0 z-40"
          >
            <div
              className="flex items-center justify-center gap-3 px-4 py-2"
              style={{
                background:
                  "color-mix(in srgb, var(--tertiary) 12%, var(--container-page))",
                borderBottom:
                  "1px solid color-mix(in srgb, var(--tertiary) 25%, transparent)",
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
                      parts.push(`${mod} ${cms.pages.stylesModified}`);
                    if (cust > 0) parts.push(`${cust} ${cms.pages.stylesCustom}`);
                    return parts.length > 0
                      ? parts.join(", ")
                      : cms.pages.noChanges;
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
                {cms.ui.modify}
              </Link>
              <button
                onClick={clearOverride}
                className="type-data active:scale-95 transition-transform ml-1"
                style={{
                  fontSize: "var(--font-size-sm)",
                  color: "var(--text-muted)",
                }}
                aria-label={cms.pages.deactivateCustomStyles}
              >
                {cms.pages.deactivate}
              </button>
            </div>
          </motion.div>
      )}

      {/* ═══ CMS OVERRIDE BANNER ═══ */}
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
            className="overflow-hidden sticky top-0 z-40"
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
                  "1px solid color-mix(in srgb, var(--cta) 20%, transparent)",
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
                {cms.ui.modify}
              </Link>
              <button
                onClick={cmsResetAll}
                className="type-data active:scale-95 transition-transform ml-1"
                style={{
                  fontSize: "var(--font-size-sm)",
                  color: "var(--text-muted)",
                }}
                aria-label={cms.misc.cmsRestoreContent}
              >
                {cms.ui.restore}
              </button>
            </div>
          </motion.div>
      )}

      {/* ═══ CONTENT ═══ */}
      {/* ─── STEP 1 — SETTINGS: Hero + UserNeeds ─── */}
        {currentStep === "settings" && (
          <motion.main
            key="settings"
            id="main-content"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -18 }}
            transition={{
              type: "spring",
              stiffness: 320,
              damping: 30,
            }}
            className="relative pb-32"
            style={{ zIndex: 2 }}
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
                        style={{
                          width: "var(--hero-mark-size, 160px)",
                          height: "var(--hero-mark-size, 160px)",
                        }}
                      >
                        {/* Radiant warmth — large soft glow irradiated outward */}
                        <motion.div
                          aria-hidden="true"
                          style={{
                            position: "absolute",
                            width: "var(--hero-glow-size, 420px)",
                            height: "var(--hero-glow-size, 420px)",
                            top: "50%",
                            left: "50%",
                            marginTop: "calc(var(--hero-glow-size, 420px) / -2)",
                            marginLeft: "calc(var(--hero-glow-size, 420px) / -2)",
                            borderRadius: "var(--radius-full)",
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
                      <Heading level="page">
                        {cms.hero.title_line1}{" "}
                        <span
                          style={{
                            display: "block",
                            color: "var(--text-accent)",
                          }}
                        >
                          {cms.hero.title_line2}
                        </span>
                      </Heading>
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
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{
              type: "spring",
              stiffness: 320,
              damping: 30,
            }}
            className="relative pb-32"
            style={{ zIndex: 2 }}
          >
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-5 sm:py-7">
              <div className="max-w-2xl lg:max-w-none mx-auto">
                <div className="mb-5 sm:mb-6">
                  <motion.button
                    onClick={handleBackToSettings}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      type: "spring",
                      stiffness: 400,
                      damping: 25,
                    }}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full active:scale-95 transition-transform"
                    style={{
                      color: "var(--text-default)",
                      background: "color-mix(in srgb, var(--container-bg) 85%, transparent)",
                      border: "1px solid var(--container-border)",
                      boxShadow: "0 8px 24px color-mix(in srgb, var(--shadow-color) 12%, transparent)",
                      backdropFilter: "blur(12px)",
                      WebkitBackdropFilter: "blur(12px)",
                    }}
                    aria-label={cms.configurator.backLabel}
                    title={cms.configurator.backLabel}
                  >
                    <ChevronLeft size={20} />
                  </motion.button>
                  <div className="mt-4 max-w-2xl">
                    <SettingsSummaryBar
                      activeTab={null}
                      onTabSelect={() => handleBackToSettings()}
                      constraints={constraints}
                      kitchenTemp={constraints.kitchen_temp_c ?? 21}
                      cms={cms}
                      selectedTimeLabel={styleStepTimeLabel}
                      onChangeTime={handleBackToSettings}
                    />
                  </div>
                  <Heading level="page" className="mt-5">
                    {cms.steps.styles.title}
                  </Heading>
                  <p
                    className="font-serif italic mt-1 max-w-2xl"
                    style={{
                      fontSize: "var(--font-size-xl)",
                      color: "var(--text-muted)",
                      opacity: 0.72,
                      lineHeight: "var(--leading-normal)",
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

        {/* ─── STEP 3 — RESULT: scheda unificata (RecipeView) ─── */}
        {currentStep === "result" && recipe && selectedStyle && (
          <motion.main
            key="result"
            ref={resultHeadingRef}
            tabIndex={-1}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="relative outline-none"
            style={{ zIndex: 2 }}
          >
            <RecipeView
              recipe={recipe}
              style={selectedStyle}
              photo={
                STYLE_PHOTOS[selectedStyle.id] ||
                "https://images.unsplash.com/photo-1717883235373-ef10b2a745a3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1200&q=80"
              }
              cms={cms}
              constraints={constraints}
              onConstraintsChange={(next) => {
                setCreateRecipeMode("adapted");
                setConstraints(next);
              }}
              panConfig={panConfig}
              activeTab={createRecipeTab}
              onTabChange={setCreateRecipeTab}
              back={{ label: cms.ui.changeStyle, onClick: handleBackToStyles, positionClassName: "top-4 left-4" }}
              recipeTabLabel={
                createRecipeMode === "canonical"
                  ? cms.cooking.tabRecipe
                  : cms.cooking.tabRecipeTailored
              }
              eyebrow={
                createRecipeMode === "canonical"
                  ? "Ricetta canonica"
                  : "Ricetta adattata"
              }
              shareUrl={shareUrl}
              selectedToppingConcept={selectedToppingConcept}
              onSelectTopping={(conceptId) => {
                setCreateRecipeMode("adapted");
                setSelectedToppingConcept(conceptId);
              }}
              nerdMode={effectiveNerdMode}
              nerdAvailable={nerdAvailable}
              onNerdModeChange={setNerdMode}
              selectedFlourId={selectedFlourId}
              onSelectFlour={(flour) => {
                setCreateRecipeMode("adapted");
                if (flour) {
                  setSelectedFlourId(flour.id);
                  setCustomFlourW(flour.w);
                  setCustomFlourPL(flour.pl);
                } else {
                  setSelectedFlourId(null);
                  if (selectedStyle) {
                    setCustomFlourW(
                      Math.round(
                        (selectedStyle.dough.flour_w_range[0] +
                          selectedStyle.dough.flour_w_range[1]) /
                          2,
                      ),
                    );
                    setCustomFlourPL(defaultPL(selectedStyle));
                  }
                }
              }}
              selectedTimeSlotId={selectedTimeSlot}
              isPersonalized={createRecipeMode !== "canonical"}
              matchSlot={
                <RecipeMatchCard
                  scores={recipe.scores}
                  ovenTemp={constraints.oven_max_temp_c}
                  idealTemp={selectedStyle.baking.temp_c_ideal}
                  minTemp={selectedStyle.baking.temp_c_range[0]}
                  mode={createRecipeMode}
                  onReset={
                    createRecipeMode !== "canonical"
                      ? handleResetCreateToCanonical
                      : undefined
                  }
                />
              }
              recipeControls={
                <div className="flex flex-col gap-5 sm:gap-6">
                  <div
                    className="rounded-2xl px-4 py-3"
                    style={{
                      background: "var(--container-bg-low)",
                      border: "1px solid var(--container-border-subtle)",
                    }}
                  >
                    <span
                      className="block"
                      style={{
                        color: "var(--text-default)",
                        fontSize: "var(--font-size-lg)",
                        fontWeight: "var(--weight-semibold)" as any,
                      }}
                    >
                      {createRecipeMode === "canonical"
                        ? "Versione canonica"
                        : "Versione adattata alla tua cucina"}
                    </span>
                    <span
                      className="block mt-1"
                      style={{
                        color: "var(--text-muted)",
                        fontSize: "var(--font-size-md)",
                        lineHeight: "var(--leading-normal)",
                      }}
                    >
                      {createRecipeMode === "canonical"
                        ? "Stai guardando la ricetta ideale dello stile, con forno e tempi al massimo della sua espressione."
                        : "Vulcan ha gia tradotto la ricetta sui tuoi vincoli: forno, tempo, quantita e strumenti disponibili."}
                    </span>
                  </div>
                  <RecipeStatStrip recipe={recipe} nerdMode={effectiveNerdMode} />

                  {/* Personalizza parametri — accordion (su misura sui tuoi vincoli) */}
                  <Surface className="overflow-hidden">
                    <button
                      onClick={() => setShowFineTuning(!showFineTuning)}
                      className="w-full flex items-center justify-between px-5 py-3.5 text-left active:scale-[0.99] transition-transform"
                      aria-expanded={showFineTuning}
                    >
                      <div className="flex items-center gap-2.5">
                        <SlidersHorizontal
                          size={14}
                          style={{ color: showFineTuning ? "var(--text-accent)" : "var(--text-muted)" }}
                        />
                        <span
                          style={{
                            color: "var(--text-default)",
                            fontSize: "var(--font-size-xl)",
                            fontWeight: "var(--weight-semibold)" as any,
                          }}
                        >
                          {cms.ui.customizeParams}
                        </span>
                      </div>
                      <motion.div
                        animate={{ rotate: showFineTuning ? 180 : 0 }}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      >
                        <ChevronDown size={14} style={{ color: "var(--text-muted)" }} />
                      </motion.div>
                    </button>
                    {showFineTuning && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ type: "spring", stiffness: 400, damping: 25 }}
                          className="overflow-hidden"
                        >
                          <div
                            className="px-5 pb-5"
                            style={{ borderTop: "1px solid var(--container-border)" }}
                          >
                            <div className="pt-4">
                              <RecipeConfigurator
                                style={selectedStyle}
                                constraints={constraints}
                                onConstraintsChange={(next) => {
                                  setCreateRecipeMode("adapted");
                                  setConstraints(next);
                                }}
                                customHydration={customHydration}
                                onHydrationChange={(value) => {
                                  setCreateRecipeMode("adapted");
                                  setCustomHydration(value);
                                }}
                                customFlourW={customFlourW}
                                onFlourWChange={(value) => {
                                  setCreateRecipeMode("adapted");
                                  setCustomFlourW(value);
                                }}
                                customFermentHours={customFermentHours}
                                onFermentHoursChange={(value) => {
                                  setCreateRecipeMode("adapted");
                                  setCustomFermentHours(value);
                                }}
                                customFermentTemp={customFermentTemp}
                                onFermentTempChange={(value) => {
                                  setCreateRecipeMode("adapted");
                                  setCustomFermentTemp(value);
                                }}
                                usePreFerment={usePreFerment}
                                onPreFermentChange={(value) => {
                                  setCreateRecipeMode("adapted");
                                  setUsePreFerment(value);
                                }}
                                customFlourPL={effectiveNerdMode ? customFlourPL : undefined}
                                onFlourPLChange={
                                  effectiveNerdMode
                                    ? (value) => {
                                        setCreateRecipeMode("adapted");
                                        setCustomFlourPL(value);
                                      }
                                    : undefined
                                }
                                science={recipe.science}
                                panConfig={panConfig}
                                onPanConfigChange={(next) => {
                                  setCreateRecipeMode("adapted");
                                  setPanConfig(next);
                                }}
                              />
                            </div>
                          </div>
                        </motion.div>
                    )}
                  </Surface>

                  {/* Warning contestuali + dieta */}
                  <div>
                    <ContextualWarnings
                      hydration={customHydration}
                      flourW={customFlourW}
                      flourPL={customFlourPL}
                      fermentHours={customFermentHours}
                      fermentTemp={customFermentTemp}
                      ovenTemp={constraints.oven_max_temp_c}
                      skillLevel={constraints.skill_level}
                      usePreFerment={usePreFerment}
                    />
                    {constraints.dietary_filters.length > 0 &&
                      (() => {
                        const dw = getDietaryWarnings(
                          constraints.dietary_filters,
                          {
                            fermentHours: customFermentHours,
                            fermentTemp: customFermentTemp,
                            yeastType: constraints.pantry_yeasts.includes("sourdough")
                              ? "sourdough"
                              : constraints.pantry_yeasts.includes("fresh")
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
                              background: "var(--surface-container-low)",
                              border: "var(--border-width-thin) solid var(--outline-variant)",
                              borderRadius: "var(--radius-lg)",
                              padding: "var(--space-4) var(--space-5)",
                              display: "flex",
                              flexDirection: "column",
                              gap: "var(--space-2-5)",
                            }}
                          >
                            <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
                              <span style={{ fontSize: "var(--font-size-base)" }}>🩺</span>
                              <span
                                style={{
                                  fontSize: "var(--font-size-sm)",
                                  letterSpacing: "0.18em",
                                  textTransform: "uppercase",
                                  color: "var(--primary)",
                                  fontWeight: "var(--weight-semibold)",
                                }}
                              >
                                {cms.pages.dietaryWarningsTitle}
                              </span>
                            </div>
                            {dw.map((w, i) => (
                              <div
                                key={w.filterId + i}
                                className="flex items-start gap-2"
                                style={{
                                  background:
                                    w.severity === "critical"
                                      ? "color-mix(in srgb, var(--severity-critical) 8%, transparent)"
                                      : w.severity === "warning"
                                        ? "color-mix(in srgb, var(--severity-warning) 8%, transparent)"
                                        : "color-mix(in srgb, var(--severity-info) 6%, transparent)",
                                  border: `1px solid ${
                                    w.severity === "critical"
                                      ? "color-mix(in srgb, var(--severity-critical) 20%, transparent)"
                                      : w.severity === "warning"
                                        ? "color-mix(in srgb, var(--severity-warning) 20%, transparent)"
                                        : "color-mix(in srgb, var(--severity-info) 12%, transparent)"
                                  }`,
                                  borderRadius: "var(--radius-md)",
                                  padding: "var(--space-2-5) var(--font-size-lg)",
                                }}
                              >
                                <span style={{ flexShrink: 0, fontSize: "var(--font-size-base)", marginTop: "var(--space-px)" }}>
                                  {w.severity === "critical" ? "🛑" : w.severity === "warning" ? "⚠️" : "ℹ️"}
                                </span>
                                <div>
                                  <div className="type-body" style={{ color: "var(--text-default)", lineHeight: 1.4 }}>
                                    {w.message}
                                  </div>
                                  <div className="type-body-sm" style={{ color: "var(--muted-foreground)", lineHeight: 1.4, marginTop: "var(--space-0-5)" }}>
                                    💡 {w.tip}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        );
                      })()}
                  </div>
                </div>
              }
            />
          </motion.main>
        )}

      {/* VPL-068: Scroll indicators removed — single continuous flow */}

      {currentStep !== "result" && (
        <footer
          className="relative mx-auto flex max-w-7xl justify-center px-4 pb-36 pt-4 sm:px-6 md:pb-12 lg:px-8"
          style={{ zIndex: 2 }}
          aria-label="Vulcan motto"
        >
          <div
            className="inline-flex items-center gap-2 rounded-full px-3.5 py-2"
            style={{
              background: "color-mix(in srgb, var(--container-page) 72%, transparent)",
              border: "1px solid var(--container-border-subtle)",
              color: "var(--text-muted)",
              boxShadow: "0 10px 28px color-mix(in srgb, var(--shadow-color) 6%, transparent)",
              backdropFilter: "blur(18px) saturate(1.25)",
              WebkitBackdropFilter: "blur(18px) saturate(1.25)",
              fontSize: "var(--font-size-md)",
              fontWeight: "var(--weight-semibold)" as any,
            }}
          >
            <Heart size={14} fill="currentColor" style={{ color: "var(--primary)" }} />
            Make pizza, not war
          </div>
        </footer>
      )}

      {/* ═══ FLOATING CTA ═══ (non sul result: lì c'è solo back + navbar sezioni) */}
      {currentStep !== "result" && (
      <div className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none">
        {/* M3: bottom scrim — gives floating CTA visual grounding */}
        <div
          className="absolute inset-x-0 bottom-0 md:hidden"
          style={{
            height: "108px",
            background: `linear-gradient(to top, var(--container-page) 0%, color-mix(in srgb, var(--container-page) 72%, transparent) 52%, transparent 100%)`,
          }}
        />
        {/* pb-20 on mobile to clear the 64px bottom tab bar; md:pb-6 on desktop */}
        <div
          className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 md:pb-6 flex justify-center"
          style={{ zIndex: 1 }}
        >
            {/* VPL-080: nessuna CTA "Scegli lo stile" nello step settings —
                la scelta della tempistica avanza da sola allo step stili. */}

            {/* Styles → generate recipe */}
            {currentStep === "styles" && canGenerateRecipe && (
              <CtaButton
                as={motion.button}
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
                deepShadow
                className="pointer-events-auto h-12 sm:h-13 px-8 sm:px-10 active:scale-[0.97]"
              >
                <Sparkles size={15} />
                {cms.ui.generate}
              </CtaButton>
            )}

            {/* Result: nessuna CTA — back in alto a sinistra + navbar sezioni in basso */}
        </div>
      </div>
      )}

      {/* ═══ STYLE DETAIL SHEET — bottom sheet with selected style details ═══ */}
      {currentStep === "styles" && selectedStyle && (
          <StyleDetailSheet
            key={selectedStyle.id}
            style={selectedStyle}
            constraints={constraints}
            onGenerate={handleGenerateRecipe}
            onDismiss={() => setSelectedStyle(null)}
          />
      )}
    </div>
  );
}
