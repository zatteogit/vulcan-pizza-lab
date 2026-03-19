/* === EXPLORE PAGE — VPL-059 ===
   Catalogo completo 15 stili pizza con filtri famiglia.
   Card template unificato con lo stile editoriale di Crea.
   Tab: Stili — /explore */

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Link } from "react-router";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import {
  STYLES_DB,
  PIZZA_FAMILIES,
  type FamilyId,
  type PizzaStyle,
} from "../components/pizza-engine";
import { STYLE_PHOTOS } from "../components/recommended-styles";
import { useCms } from "../components/cms/cms-context";
import { useStylesOverride } from "../components/styles-override-context";
import { getCompatibleVariants } from "../components/deviation-tags";

const FALLBACK =
  "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&q=80";

const FAMILY_IDS: (FamilyId | "all")[] = [
  "all",
  "napoletana",
  "romana",
  "americana",
  "contemporanea",
];

const FAMILY_EMOJIS: Record<string, string> = {
  all: "",
  napoletana: "",
  romana: "",
  americana: "",
  contemporanea: "",
};

export function ExplorePage() {
  const { cms } = useCms();
  const { effectiveStyles } = useStylesOverride();
  const [activeFamily, setActiveFamily] = useState<
    FamilyId | "all"
  >("all");

  const styles = useMemo(() => {
    const db = effectiveStyles ?? STYLES_DB;
    return Object.values(db);
  }, [effectiveStyles]);

  const filtered = useMemo(() => {
    if (activeFamily === "all") return styles;
    return styles.filter((s) => s.family === activeFamily);
  }, [styles, activeFamily]);

  /* Group by family for display */
  const grouped = useMemo(() => {
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

  /* Family counts for badges */
  const familyCounts = useMemo(() => {
    const counts: Record<string, number> = {
      all: styles.length,
    };
    for (const s of styles) {
      counts[s.family] = (counts[s.family] || 0) + 1;
    }
    return counts;
  }, [styles]);

  return (
    <div
      className="min-h-screen"
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
        className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <span
            style={{
              fontSize: "0.6875rem",
              color: "var(--primary)",
              letterSpacing: "0.18em",
              textTransform: "uppercase" as any,
              fontWeight: "var(--weight-semibold)" as any,
            }}
          >
            {cms.pages.exploreStepNum}
          </span>
          <h1
            className="font-serif mt-2"
            style={{
              fontSize: "clamp(1.75rem, 4vw, 2.5rem)",
              lineHeight: "var(--leading-snug)",
              color: "var(--text-default)",
            }}
          >
            {cms.pages.exploreTitle}
          </h1>
          <p
            className="font-serif italic mt-1"
            style={{
              fontSize: "var(--font-size-xl-5)",
              color: "var(--text-muted)",
              opacity: 0.65,
            }}
          >
            {cms.pages.exploreSubtitle}
          </p>
        </div>

        {/* Family filter chips */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {FAMILY_IDS.map((fam) => {
            const active = activeFamily === fam;
            const label =
              fam === "all"
                ? cms.allFamiliesLabel || "Tutte"
                : cms.families[fam]?.name ||
                  PIZZA_FAMILIES[fam]?.name ||
                  fam;
            const count = familyCounts[fam] || 0;
            return (
              <motion.button
                key={fam}
                onClick={() => setActiveFamily(fam)}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl active:scale-95 transition-transform"
                style={{
                  background: active
                    ? "var(--primary)"
                    : "var(--container-bg)",
                  color: active
                    ? "white"
                    : "var(--text-default)",
                  border: `1px solid ${active ? "var(--primary)" : "var(--container-border)"}`,
                  fontSize: "0.8125rem",
                  fontWeight: "var(--weight-medium)" as any,
                  cursor: "pointer",
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
              </motion.button>
            );
          })}
        </div>

        {/* Grid */}
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
            {activeFamily === "all" && grouped ? (
              /* Grouped by family */
              Object.entries(grouped).map(
                ([familyId, familyStyles]) => {
                  if (familyStyles.length === 0) return null;
                  const fam =
                    PIZZA_FAMILIES[familyId as FamilyId];
                  const cmsFam =
                    cms.families[familyId as FamilyId];
                  return (
                    <div key={familyId} className="mb-10">
                      <div className="flex items-center gap-2 mb-4">
                        <span style={{ fontSize: "1.25rem" }}>
                          {fam?.emoji}
                        </span>
                        <h2
                          className="font-serif"
                          style={{
                            fontSize:
                              "clamp(1.25rem, 3vw, 1.5rem)",
                            color: "var(--text-default)",
                          }}
                        >
                          {cmsFam?.name || fam?.name}
                        </h2>
                        <span
                          className="type-data"
                          style={{
                            fontSize: "var(--font-size-xs)",
                            color: "var(--text-muted)",
                            fontFeatureSettings: "'tnum'",
                          }}
                        >
                          {familyStyles.length}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
                        {familyStyles.map((style, i) => (
                          <StyleCatalogCard
                            key={style.id}
                            style={style}
                            index={i}
                            cms={cms}
                          />
                        ))}
                      </div>
                    </div>
                  );
                },
              )
            ) : (
              /* Filtered flat grid */
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
                {filtered.map((style, i) => (
                  <StyleCatalogCard
                    key={style.id}
                    style={style}
                    index={i}
                    cms={cms}
                  />
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

/* ═══ STYLE CATALOG CARD — Editorial magazine style (unified with Create) ═══ */
function StyleCatalogCard({
  style,
  index,
  cms,
}: {
  style: PizzaStyle;
  index: number;
  cms: any;
}) {
  const photo =
    cms.media?.stylePhotos?.[style.id] ||
    STYLE_PHOTOS[style.id] ||
    FALLBACK;
  const cmsFamilyName = (
    cms.families?.[style.family]?.name ||
    PIZZA_FAMILIES[style.family]?.name ||
    ""
  ).toUpperCase();
  const variants = getCompatibleVariants(style.id);

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
      <Link
        to={`/recipe/${style.id}`}
        className="block rounded-2xl overflow-hidden active:scale-[0.97] transition-transform group"
        style={{
          background: "var(--container-card)",
          border: "1px solid var(--container-border-ghost)",
          textDecoration: "none",
          color: "inherit",
        }}
      >
        {/* Photo area — 3/4 aspect like Create cards */}
        <div
          className="relative overflow-hidden"
          style={{ aspectRatio: "3/4" }}
        >
          <ImageWithFallback
            src={photo}
            alt={style.name}
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]"
            loading="lazy"
          />

          {/* Cinematic scrim */}
          <div
            className="absolute inset-0"
            style={{ background: "var(--overlay-scrim)" }}
          />

          {/* Beginner badge — top right */}
          {style.suitable_for_beginner && (
            <div
              className="absolute top-3 right-3 px-2 py-1 rounded-lg"
              style={{
                background:
                  "color-mix(in srgb, var(--cta) 90%, rgba(0,0,0,0))",
                fontSize: "var(--font-size-xs)",
                fontWeight: "var(--weight-semibold)" as any,
                color: "white",
                backdropFilter: "blur(8px)",
              }}
            >
              Principianti
            </div>
          )}

          {/* Author variant badges — top left */}
          {variants.length > 0 && (
            <div
              className="absolute top-3 left-3 flex flex-wrap gap-1"
              style={{ maxWidth: "60%" }}
            >
              {variants.slice(0, 2).map((v) => (
                <div
                  key={v.id}
                  className="px-1.5 py-0.5 rounded-md"
                  style={{
                    fontSize: "var(--font-size-2xs)",
                    fontWeight: "var(--weight-semibold)" as any,
                    letterSpacing: "0.04em",
                    color: "var(--overlay-text)",
                    background:
                      "color-mix(in srgb, var(--tertiary) 80%, rgba(0,0,0,0))",
                    backdropFilter: "blur(6px)",
                    whiteSpace: "nowrap" as const,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    maxWidth: "100%",
                  }}
                  title={`${v.emoji} ${v.author} — ${v.name}`}
                >
                  {v.emoji} {v.author.split(" ").pop()}
                </div>
              ))}
              {variants.length > 2 && (
                <div
                  className="px-1.5 py-0.5 rounded-md"
                  style={{
                    fontSize: "var(--font-size-2xs)",
                    fontWeight: "var(--weight-semibold)" as any,
                    color: "var(--overlay-text)",
                    background:
                      "color-mix(in srgb, var(--tertiary) 70%, rgba(0,0,0,0))",
                    backdropFilter: "blur(6px)",
                  }}
                >
                  +{variants.length - 2}
                </div>
              )}
            </div>
          )}

          {/* Title + subtitle — overlaid on image (editorial style) */}
          <div className="absolute bottom-0 left-0 right-0 px-4 pb-3.5 sm:pb-4 pt-16">
            <span
              className="font-serif"
              style={{
                fontSize:
                  "clamp(var(--font-size-3xl), 3.5vw, var(--font-size-6-5xl))",
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
                fontFamily: "'DM Sans', sans-serif",
                letterSpacing: "var(--tracking-label)",
                textTransform: "uppercase" as const,
                color: "var(--overlay-text-warm)",
                textShadow: "var(--overlay-shadow-text-sm)",
                lineHeight: "var(--leading-normal)",
              }}
            >
              {cmsFamilyName} — {style.origin.toUpperCase()}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}