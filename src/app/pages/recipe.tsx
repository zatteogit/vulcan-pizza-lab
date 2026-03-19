/* === RECIPE PAGE — VPL-058 + VPL-064 ===
   Pagina ricetta self-contained per stile.
   Route: /recipe/:styleId?h=62&w=280&pl=0.6&f=24&t=4&n=4&pf=1&oven=wood&temp=450
   Legge il profilo da localStorage, override opzionali da URL params.
   "Copia link" genera URL condivisibile con parametri correnti. */

import { useState, useMemo, useCallback } from "react";
import { useParams, Link, useSearchParams } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import {
  ChevronLeft,
  SlidersHorizontal,
  ChevronDown,
  LinkIcon,
  Check,
} from "lucide-react";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import {
  STYLES_DB,
  PIZZA_FAMILIES,
  OVEN_PRESETS,
  generateRecipe,
  defaultPanShape,
  type PizzaStyle,
  type UserConstraints,
  type GeneratedRecipe,
  type PanConfig,
  type OvenType,
  type SkillLevel,
} from "../components/pizza-engine";
import { STYLE_PHOTOS } from "../components/recommended-styles";
import { RecipeConfigurator } from "../components/recipe-configurator";
import { RecipeOutput } from "../components/recipe-output";
import { RecipeStatStrip } from "../components/recipe-stat-strip";
import { ScoreDashboard } from "../components/score-dashboard";
import { useCms } from "../components/cms/cms-context";
import { useStylesOverride } from "../components/styles-override-context";

const FALLBACK =
  "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&q=80";

const VALID_OVEN_TYPES = new Set(OVEN_PRESETS.map((p) => p.id));

/* ═══ STORAGE HELPERS ═══ */
function loadJson<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw);
  } catch {
    /* */
  }
  return null;
}

function defaultPL(style: PizzaStyle): number {
  return (
    Math.round(
      ((style.dough.flour_pl_range[0] +
        style.dough.flour_pl_range[1]) /
        2) *
        100,
    ) / 100
  );
}

/* Parse a numeric URL param with bounds check */
function numParam(
  params: URLSearchParams,
  key: string,
  fallback: number,
  min?: number,
  max?: number,
): number {
  const raw = params.get(key);
  if (raw === null) return fallback;
  const n = Number(raw);
  if (isNaN(n)) return fallback;
  if (min !== undefined && n < min) return min;
  if (max !== undefined && n > max) return max;
  return n;
}

/* ═══ RECIPE PAGE ═══ */
export function RecipePage() {
  const { styleId } = useParams<{ styleId: string }>();
  const { cms } = useCms();
  const { effectiveStyles } = useStylesOverride();

  const db = effectiveStyles ?? STYLES_DB;
  const style = styleId ? db[styleId] : null;

  if (!style) {
    return <RecipeNotFound styleId={styleId} />;
  }

  return <RecipeContent style={style} cms={cms} />;
}

/* ═══ RECIPE CONTENT ═══ */
function RecipeContent({
  style,
  cms,
}: {
  style: PizzaStyle;
  cms: any;
}) {
  const [searchParams] = useSearchParams();

  /* ── Load profile from localStorage ── */
  const savedOven = loadJson<{
    ovenType: OvenType;
    maxTemp: number;
  }>("vulcan_oven_pref");
  const savedSkill = loadJson<SkillLevel>("vulcan_skill_level");
  const savedPantry = loadJson<{
    flours: string[];
    yeasts: string[];
  }>("vulcan_pantry");
  const savedDietary = loadJson<string[]>("vulcan_dietary");

  /* ── Compute style defaults ── */
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
  const fOptimal = Math.min(Math.round((fMin + fMax) / 2), 48);

  /* ── URL params override (VPL-064) ── */
  const urlOven = searchParams.get("oven");
  const resolvedOvenType: OvenType =
    urlOven && VALID_OVEN_TYPES.has(urlOven)
      ? (urlOven as OvenType)
      : (savedOven?.ovenType ?? "home");
  const resolvedOvenTemp = numParam(
    searchParams,
    "temp",
    savedOven?.maxTemp ?? 250,
    180,
    500,
  );

  /* ── State: constraints (from profile + URL override) ── */
  const [constraints] = useState<UserConstraints>(() => ({
    oven_type: resolvedOvenType,
    oven_max_temp_c: resolvedOvenTemp,
    skill_level: savedSkill ?? 2,
    available_hours: 24,
    dough_balls: 4,
    has_mixer: false,
    has_pizza_stone: false,
    has_pizza_steel: false,
    has_baking_pan: false,
    dietary_filters: savedDietary ?? [],
    pantry_flours: savedPantry?.flours ?? [],
    pantry_yeasts: savedPantry?.yeasts ?? [],
  }));

  /* ── State: recipe params (from style defaults + URL override) ── */
  const [customHydration, setCustomHydration] = useState(
    numParam(searchParams, "h", hCenter, 30, 120),
  );
  const [customFlourW, setCustomFlourW] = useState(
    numParam(searchParams, "w", wCenter, 100, 500),
  );
  const [customFlourPL, setCustomFlourPL] = useState(
    numParam(searchParams, "pl", defaultPL(style), 0.2, 1.5),
  );
  const [customFermentHours, setCustomFermentHours] = useState(
    numParam(searchParams, "f", fOptimal, 1, 120),
  );
  const [customFermentTemp, setCustomFermentTemp] = useState(
    numParam(searchParams, "t", fOptimal > 12 ? 4 : 22, 0, 35),
  );
  const [usePreFerment, setUsePreFerment] = useState(() => {
    const pf = searchParams.get("pf");
    return pf !== null
      ? pf === "1"
      : style.requires_pre_ferment;
  });
  const [panConfig, setPanConfig] = useState<PanConfig>({
    panShape: defaultPanShape(style),
    panLength: style.shape.length_cm,
    panWidth: style.shape.width_cm,
    panDiameter: style.shape.diameter_cm,
    thickness: style.shape.thickness_factor,
  });
  const [doughBalls, setDoughBalls] = useState(
    numParam(searchParams, "n", 4, 1, 20),
  );
  const [showFineTuning, setShowFineTuning] = useState(
    searchParams.has("h") || searchParams.has("w"),
  );
  const [nerdMode, setNerdMode] = useState(false);

  /* ── Copy link (VPL-064) ── */
  const [linkCopied, setLinkCopied] = useState(false);
  const handleCopyLink = useCallback(() => {
    const params = new URLSearchParams();
    params.set("h", String(customHydration));
    params.set("w", String(customFlourW));
    params.set("pl", String(customFlourPL));
    params.set("f", String(customFermentHours));
    params.set("t", String(customFermentTemp));
    params.set("n", String(doughBalls));
    if (usePreFerment) params.set("pf", "1");
    if (constraints.oven_type !== "home")
      params.set("oven", constraints.oven_type);
    if (constraints.oven_max_temp_c !== 250)
      params.set("temp", String(constraints.oven_max_temp_c));

    const url = `${window.location.origin}/recipe/${style.id}?${params.toString()}`;

    /* Clipboard: double path (API + textarea fallback) */
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(url).then(
        () => {
          setLinkCopied(true);
          setTimeout(() => setLinkCopied(false), 2000);
        },
        () => fallbackCopy(url),
      );
    } else {
      fallbackCopy(url);
    }

    function fallbackCopy(text: string) {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.left = "-9999px";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    }
  }, [
    customHydration,
    customFlourW,
    customFlourPL,
    customFermentHours,
    customFermentTemp,
    doughBalls,
    usePreFerment,
    constraints.oven_type,
    constraints.oven_max_temp_c,
    style.id,
  ]);

  /* ── Generate recipe ── */
  const recipe: GeneratedRecipe | null = useMemo(() => {
    const scoreWeights = {
      authenticity: cms.scoreDimensions?.authenticity?.weight,
      feasibility: cms.scoreDimensions?.feasibility?.weight,
      digestibility: cms.scoreDimensions?.digestibility?.weight,
      sustainability:
        cms.scoreDimensions?.sustainability?.weight,
      experimentation:
        cms.scoreDimensions?.experimentation?.weight,
    };
    return generateRecipe(
      style,
      { ...constraints, dough_balls: doughBalls },
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
    style,
    constraints,
    doughBalls,
    customHydration,
    customFlourW,
    customFermentHours,
    customFermentTemp,
    usePreFerment,
    customFlourPL,
    panConfig,
    cms.scoreDimensions,
  ]);

  /* Photo */
  const photo =
    cms.media?.stylePhotos?.[style.id] ||
    STYLE_PHOTOS[style.id] ||
    FALLBACK;

  const cmsFamilyName =
    cms.families?.[style.family]?.name ||
    PIZZA_FAMILIES[style.family]?.name ||
    "";

  return (
    <div
      className="min-h-screen"
      style={{
        background: "var(--container-page)",
        color: "var(--text-default)",
      }}
    >
      {/* ── Header ── */}
      <header
        className="sticky top-0 z-40"
        style={{
          background:
            "color-mix(in srgb, var(--container-page) 88%, rgba(0,0,0,0))",
          backdropFilter: "blur(24px) saturate(1.6)",
          WebkitBackdropFilter: "blur(24px) saturate(1.6)",
          borderBottom:
            "1px solid var(--container-border-subtle)",
        }}
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-3">
          <Link
            to="/explore"
            className="flex items-center gap-1 active:scale-95 transition-transform"
            style={{
              color: "var(--text-accent)",
              fontSize: "var(--font-size-xl)",
              fontWeight: "var(--weight-semibold)" as any,
              textDecoration: "none",
            }}
          >
            <ChevronLeft size={18} />
            <span>{cms.pages.recipeBackToStyles}</span>
          </Link>
          <div className="flex-1" />

          {/* Copy link button (VPL-064) */}
          <motion.button
            onClick={handleCopyLink}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg active:scale-95 transition-transform"
            style={{
              background: linkCopied
                ? "color-mix(in srgb, var(--cta) 15%, rgba(0,0,0,0))"
                : "var(--container-bg)",
              border: `1px solid ${linkCopied ? "var(--cta)" : "var(--container-border)"}`,
              color: linkCopied
                ? "var(--cta)"
                : "var(--text-muted)",
              fontSize: "var(--font-size-sm)",
              fontWeight: "var(--weight-medium)" as any,
              cursor: "pointer",
            }}
            aria-label={cms.pages.recipeCopyLinkAria}
          >
            {linkCopied ? (
              <Check size={14} />
            ) : (
              <LinkIcon size={14} />
            )}
            <span>
              {linkCopied ? cms.ui.copied : cms.ui.share}
            </span>
          </motion.button>

          <span
            className="type-data hidden sm:inline"
            style={{
              fontSize: "var(--font-size-xs)",
              color: "var(--text-muted)",
              letterSpacing: "0.08em",
              textTransform: "uppercase" as any,
            }}
          >
            {cmsFamilyName}
          </span>
        </div>
      </header>

      {/* ── Hero photo ── */}
      <div
        className="relative"
        style={{ height: "clamp(200px, 30vh, 320px)" }}
      >
        <ImageWithFallback
          src={photo}
          alt={style.name}
          className="w-full h-full"
          style={{ objectFit: "cover" }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to top, var(--container-page) 0%, rgba(0,0,0,0) 60%)",
          }}
        />
        <div className="absolute bottom-0 left-0 right-0 px-4 sm:px-6 pb-6">
          <div className="max-w-5xl mx-auto">
            <span
              style={{
                fontSize: "0.6875rem",
                color: "var(--primary)",
                letterSpacing: "0.18em",
                textTransform: "uppercase" as any,
                fontWeight: "var(--weight-semibold)" as any,
              }}
            >
              Ricetta
            </span>
            <h1
              className="font-serif"
              style={{
                fontSize: "clamp(2rem, 5vw, 3rem)",
                lineHeight: "var(--leading-tight)",
                color: "var(--text-default)",
              }}
            >
              {style.name}
            </h1>
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-10 py-6">
          {/* Main column */}
          <div className="flex-1 min-w-0">
            {/* Stat strip */}
            {recipe && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  type: "spring",
                  stiffness: 400,
                  damping: 30,
                }}
              >
                <RecipeStatStrip
                  recipe={recipe}
                  nerdMode={nerdMode}
                />
              </motion.div>
            )}

            {/* Dough balls control */}
            <div className="flex items-center gap-3 mt-5 mb-2 px-1">
              <span
                className="type-data"
                style={{
                  fontSize: "var(--font-size-sm)",
                  color: "var(--text-muted)",
                }}
              >
                {cms.ui.doughBalls}
              </span>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 6, 8].map((n) => (
                  <motion.button
                    key={n}
                    onClick={() => setDoughBalls(n)}
                    className="px-2.5 py-1.5 rounded-lg active:scale-95 transition-transform"
                    style={{
                      background:
                        doughBalls === n
                          ? "var(--primary)"
                          : "var(--container-bg)",
                      color:
                        doughBalls === n
                          ? "white"
                          : "var(--text-default)",
                      border: `1px solid ${doughBalls === n ? "var(--primary)" : "var(--container-border)"}`,
                      fontSize: "var(--font-size-sm)",
                      fontWeight: "var(--weight-medium)" as any,
                      fontFeatureSettings: "'tnum'",
                      cursor: "pointer",
                      minWidth: 36,
                    }}
                  >
                    {n}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Fine-tuning toggle */}
            <motion.button
              onClick={() => setShowFineTuning(!showFineTuning)}
              className="flex items-center gap-2 w-full px-4 py-3 rounded-xl mt-3 mb-4 active:scale-[0.98] transition-transform"
              style={{
                background: "var(--container-bg-low)",
                border: "1px solid var(--container-border)",
                cursor: "pointer",
                fontSize: "var(--font-size-base)",
                fontWeight: "var(--weight-medium)" as any,
                color: "var(--text-default)",
              }}
            >
              <SlidersHorizontal
                size={16}
                style={{ color: "var(--primary)" }}
              />
              <span
                className="flex-1"
                style={{ textAlign: "left" as any }}
              >
                {cms.ui.customizeParams}
              </span>
              <motion.div
                animate={{ rotate: showFineTuning ? 180 : 0 }}
                transition={{
                  type: "spring",
                  stiffness: 500,
                  damping: 30,
                }}
              >
                <ChevronDown
                  size={16}
                  style={{ color: "var(--text-muted)" }}
                />
              </motion.div>
            </motion.button>

            {/* Fine-tuning sliders */}
            <AnimatePresence>
              {showFineTuning && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{
                    type: "spring",
                    stiffness: 400,
                    damping: 25,
                  }}
                  className="overflow-hidden mb-6"
                >
                  <RecipeConfigurator
                    style={style}
                    constraints={constraints}
                    onConstraintsChange={() => {}}
                    customHydration={customHydration}
                    onHydrationChange={setCustomHydration}
                    customFlourW={customFlourW}
                    onFlourWChange={setCustomFlourW}
                    customFermentHours={customFermentHours}
                    onFermentHoursChange={setCustomFermentHours}
                    customFermentTemp={customFermentTemp}
                    onFermentTempChange={setCustomFermentTemp}
                    usePreFerment={usePreFerment}
                    onPreFermentChange={setUsePreFerment}
                    customFlourPL={
                      nerdMode ? customFlourPL : undefined
                    }
                    onFlourPLChange={
                      nerdMode ? setCustomFlourPL : undefined
                    }
                    panConfig={panConfig}
                    onPanConfigChange={setPanConfig}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Recipe output */}
            {recipe && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  type: "spring",
                  stiffness: 400,
                  damping: 30,
                  delay: 0.1,
                }}
              >
                <RecipeOutput
                  recipe={recipe}
                  constraints={constraints}
                  onConstraintsChange={() => {}}
                  nerdMode={nerdMode}
                />
              </motion.div>
            )}
          </div>

          {/* Sidebar — score dashboard (desktop) */}
          {recipe && (
            <div
              className="hidden lg:block flex-shrink-0"
              style={{ width: 320 }}
            >
              <div className="sticky" style={{ top: 72 }}>
                <ScoreDashboard
                  scores={recipe.scores}
                  science={recipe.science}
                  desktopMode
                  nerdMode={nerdMode}
                  onNerdToggle={() => setNerdMode(!nerdMode)}
                />
              </div>
            </div>
          )}
        </div>

        {/* Mobile score dashboard */}
        {recipe && (
          <div className="lg:hidden pb-6">
            <ScoreDashboard
              scores={recipe.scores}
              science={recipe.science}
              nerdMode={nerdMode}
              onNerdToggle={() => setNerdMode(!nerdMode)}
            />
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══ NOT FOUND ═══ */
function RecipeNotFound({ styleId }: { styleId?: string }) {
  const { cms } = useCms();
  return (
    <div
      className="min-h-screen flex items-center justify-center px-6"
      style={{
        background: "var(--container-page)",
        color: "var(--text-default)",
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          type: "spring",
          stiffness: 400,
          damping: 30,
        }}
        className="text-center"
      >
        <h1
          className="font-serif"
          style={{
            fontSize: "clamp(1.75rem, 4vw, 2.5rem)",
            lineHeight: "var(--leading-snug)",
          }}
        >
          {cms.pages.recipeStyleNotFound}
        </h1>
        <p
          className="font-serif italic mt-2"
          style={{
            fontSize: "var(--font-size-xl-5)",
            color: "var(--text-muted)",
            opacity: 0.65,
          }}
        >
          {cms.pages.recipeStyleNotFoundDesc.replace(
            "{id}",
            styleId || "?",
          )}
        </p>
        <Link
          to="/explore"
          className="inline-flex items-center gap-2 mt-6 px-5 py-2.5 rounded-full active:scale-95 transition-transform"
          style={{
            background: "var(--cta-btn-bg)",
            color: "var(--cta-btn-text)",
            fontWeight: "var(--weight-semibold)" as any,
            fontSize: "var(--font-size-xl)",
            textDecoration: "none",
          }}
        >
          <ChevronLeft size={16} />
          {cms.pages.recipeExploreStyles}
        </Link>
      </motion.div>
    </div>
  );
}