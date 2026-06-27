import { Award,Check,ChefHat,Clock,Flame,SlidersHorizontal,Sparkles,Triangle,Wheat } from "lucide-react";
import { AnimatePresence,motion } from "motion/react";
import { useMemo,useState } from "react";
import { useCms } from "../cms/cms-context";
import { createFormatter,formatTemperatureCopy } from "../cms/i18n";
import { FilterChip, Surface } from "../../components/ds/index";
import { getStyleTags } from "../../domain/deviation-tags";
import { ImageWithFallback } from "../../components/media/ImageWithFallback";
import {
PIZZA_FAMILIES,
PizzaStyle,
optimizeRecipe,
recommendStyles,
StyleRecommendation,
UserConstraints,
type FamilyId,
} from "../../domain/pizza-engine";
import { ScoreRing } from "./score-ring";
import { useStylesOverride } from "../../context/styles-override-context";
import { TiltCard } from "./tilt-card";

import { STYLE_PHOTOS } from "../../data/style-photos";

interface RecommendedStylesProps {
  constraints: UserConstraints;
  selectedStyle: PizzaStyle | null;
  onSelectStyle: (style: PizzaStyle) => void;
}

export { STYLE_PHOTOS };
const FALLBACK =
  "https://images.unsplash.com/photo-1717883235373-ef10b2a745a3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600&q=80";

/* VPL-C3: dimensione del match da una reason key (rec.*). Serve a scegliere
 * l'icona sintetica sulla tile e a raggruppare/visualizzare i reasons nel
 * dettaglio. Esportata per riuso in style-detail-sheet. */
export type MatchDimension = "time" | "oven" | "skill" | "equipment" | "pantry";
export function reasonDimension(key: string): MatchDimension {
  if (key.includes("time")) return "time";
  if (key.includes("oven") || key.includes("Wood") || key.includes("refractory"))
    return "oven";
  if (
    key.includes("skill") ||
    key.includes("hydration") ||
    key.includes("hands") ||
    key.includes("domestic") ||
    key.includes("Beginner")
  )
    return "skill";
  if (key.includes("flour") || key.includes("sourdough")) return "pantry";
  return "equipment"; // pan, mixer, fork, spiral, cast, steel, knead, needsPan
}
export const MATCH_DIMENSION_ICON: Record<MatchDimension, typeof Clock> = {
  time: Clock,
  oven: Flame,
  skill: ChefHat,
  equipment: SlidersHorizontal,
  pantry: Wheat,
};

const TIER_META: Record<
  string,
  {
    label: string;
    subtitle: string;
    color: string;
    Icon: typeof Award;
  }
> = {
  perfect: {
    label: "Perfetti per te",
    subtitle: "ideali con il tuo forno e livello",
    color: "var(--text-success)",
    Icon: Award,
  },
  good: {
    label: "Fattibili",
    subtitle: "richiedono qualche compromesso",
    color: "var(--text-warning)",
    Icon: Sparkles,
  },
  challenging: {
    label: "Sfidanti",
    subtitle: "richiedono pi\u00f9 attrezzatura o esperienza",
    color: "var(--text-accent)",
    Icon: Triangle,
  },
  not_feasible: {
    label: "Non fattibili",
    subtitle: "mancano requisiti chiave",
    color: "var(--text-muted)",
    Icon: Triangle,
  },
};

export function RecommendedStyles({
  constraints,
  selectedStyle,
  onSelectStyle,
}: RecommendedStylesProps) {
  const { effectiveStyles, isOverrideActive } = useStylesOverride();
  const { cms, bcp47 } = useCms();
  const fmt = createFormatter(cms.ui, bcp47);
  const scoreWeights = {
    authenticity: cms.scoreDimensions?.authenticity?.weight,
    feasibility: cms.scoreDimensions?.feasibility?.weight,
    digestibility: cms.scoreDimensions?.digestibility?.weight,
    sustainability: cms.scoreDimensions?.sustainability?.weight,
    experimentation: cms.scoreDimensions?.experimentation?.weight,
  };
  const recommendations = useMemo(
    () =>
      // Audit role-play giugno 2026: il badge della card mostra il composite della
      // ricetta OTTIMIZZATA per i tuoi vincoli — coerente con ciò che ottieni
      // aprendo lo stile (~0.1ms/stile, costo trascurabile). Ranking/tier restano
      // sulla compatibilità.
      recommendStyles(
        constraints,
        isOverrideActive ? effectiveStyles : undefined,
        {
          time: cms.recommendationWeights.time,
          oven: cms.recommendationWeights.oven,
          skill: cms.recommendationWeights.skill,
          equipment: cms.recommendationWeights.equipment,
          pantry: cms.recommendationWeights.pantry,
        },
      ).map((rec) => ({
        ...rec,
        optimizedComposite: optimizeRecipe(
          rec.style,
          constraints,
          undefined,
          undefined,
          scoreWeights,
        ).recipe.scores.composite,
      })),
    [constraints, effectiveStyles, isOverrideActive, cms.recommendationWeights, cms.scoreDimensions],
  );
  const [familyFilter, setFamilyFilter] = useState<FamilyId | "all">("all");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [hydrationFilter, setHydrationFilter] = useState<string | null>(null);
  const [textureFilter, setTextureFilter] = useState<string | null>(null);
  const [skillFilter, setSkillFilter] = useState<string | null>(null);
  const [ovenFilter, setOvenFilter] = useState<string | null>(null);
  const hasActiveAdvanced = !!(hydrationFilter || textureFilter || skillFilter || ovenFilter);
  const hasSelection = selectedStyle !== null;

  /* Family counts for filter badges */
  const familyCounts = useMemo(() => {
    const counts: Record<string, number> = { all: recommendations.length };
    for (const r of recommendations) {
      counts[r.style.family] = (counts[r.style.family] || 0) + 1;
    }
    return counts;
  }, [recommendations]);

  /* Filtered recommendations */
  const filtered = useMemo(
    () => {
      let result = familyFilter === "all"
        ? recommendations
        : recommendations.filter((r) => r.style.family === familyFilter);

      /* Apply tag-based faceted filters */
      if (hydrationFilter || textureFilter || skillFilter || ovenFilter) {
        result = result.filter((r) => {
          const tags = getStyleTags(r.style.id);
          if (!tags) return true;
          if (hydrationFilter && tags.hydration_category !== hydrationFilter) return false;
          if (textureFilter && !tags.texture_profile.includes(textureFilter)) return false;
          if (skillFilter && tags.skill_required !== skillFilter) return false;
          if (ovenFilter && !tags.baking_method.includes(ovenFilter)) return false;
          return true;
        });
      }
      return result;
    },
    [recommendations, familyFilter, hydrationFilter, textureFilter, skillFilter, ovenFilter],
  );

  const tiers: { key: string; items: StyleRecommendation[] }[] =
    [
      {
        key: "perfect",
        items: filtered.filter((r) => r.tier === "perfect"),
      },
      {
        key: "good",
        items: filtered.filter((r) => r.tier === "good"),
      },
      {
        key: "challenging",
        items: filtered.filter((r) => r.tier === "challenging"),
      },
      {
        // Audit Sprint 12 — Sezione "Non fattibili": stili con incompatibilità
        // hard (forno legna assente, ecc.) o score molto basso. Mostrati per
        // trasparenza ("cosa non puoi fare e perché"), in stile muted.
        key: "not_feasible",
        items: filtered.filter((r) => r.tier === "not_feasible"),
      },
    ].filter((t) => t.items.length > 0);

  let idx = 0;

  const handleSelect = (style: PizzaStyle) => {
    onSelectStyle(style);
  };

  const FAMILY_FILTERS: { id: FamilyId | "all"; label: string }[] = [
    { id: "all", label: "Tutti" },
    { id: "napoletana", label: cms.families.napoletana?.name ?? PIZZA_FAMILIES.napoletana.name },
    { id: "romana", label: cms.families.romana?.name ?? PIZZA_FAMILIES.romana.name },
    { id: "americana", label: cms.families.americana?.name ?? PIZZA_FAMILIES.americana.name },
    { id: "contemporanea", label: cms.families.contemporanea?.name ?? PIZZA_FAMILIES.contemporanea.name },
  ];

  return (
    <div className="flex flex-col gap-6 sm:gap-8">
      {/* ═══ Family filter chips + "Altro" inline ═══ */}
      <div className="flex flex-wrap gap-1.5">
          {FAMILY_FILTERS.map((f) => {
            const isActive = familyFilter === f.id;
            const count = familyCounts[f.id] || 0;
            return (
              <FilterChip
                key={f.id}
                active={isActive}
                onClick={() => setFamilyFilter(f.id)}
                radius="lg"
                count={count}
              >
                {f.label}
              </FilterChip>
            );
          })}

          {/* "Altro" chip — inline con le chip di famiglia */}
          <FilterChip
            active={showAdvanced || hasActiveAdvanced}
            onClick={() => setShowAdvanced(!showAdvanced)}
            radius="lg"
            count={hasActiveAdvanced ? [hydrationFilter, textureFilter, skillFilter, ovenFilter].filter(Boolean).length : undefined}
          >
            <SlidersHorizontal size={13} style={{ flexShrink: 0 }} />
            {cms.filters.advancedLabel}
          </FilterChip>
      </div>

      {/* ═══ Advanced faceted filters panel (collapsible) ═══ */}
      <AnimatePresence>
        {showAdvanced && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="overflow-hidden -mt-3"
          >
            <div
              className="p-3 rounded-2xl flex flex-col gap-3"
              style={{
                background: "var(--surface-container-low)",
                border: "1px solid var(--outline-variant)",
              }}
            >
              {/* Hydration */}
              <FacetRow
                label={cms.filters.hydrationLabel}
                options={[
                  { id: "low", label: cms.filters.hydrationLow },
                  { id: "medium", label: cms.filters.hydrationMedium },
                  { id: "high", label: cms.filters.hydrationHigh },
                  { id: "extreme", label: cms.filters.hydrationExtreme },
                ]}
                active={hydrationFilter}
                onToggle={(v) => setHydrationFilter(hydrationFilter === v ? null : v)}
              />
              {/* Texture */}
              <FacetRow
                label={cms.filters.textureLabel}
                options={[
                  { id: "crispy_thin", label: cms.filters.textureCrispyThin },
                  { id: "thick_airy", label: cms.filters.textureThickAiry },
                  { id: "airy_crumb", label: cms.filters.textureAiryCrumb },
                  { id: "deep_dish", label: cms.filters.textureDeepDish },
                ]}
                active={textureFilter}
                onToggle={(v) => setTextureFilter(textureFilter === v ? null : v)}
              />
              {/* Skill */}
              <FacetRow
                label={cms.filters.skillLabel}
                options={[
                  { id: "beginner", label: cms.filters.skillBeginner },
                  { id: "intermediate", label: cms.filters.skillIntermediate },
                  { id: "advanced", label: cms.filters.skillAdvanced },
                  { id: "expert", label: cms.filters.skillExpert },
                ]}
                active={skillFilter}
                onToggle={(v) => setSkillFilter(skillFilter === v ? null : v)}
              />
              {/* Oven */}
              <FacetRow
                label={cms.filters.ovenLabel}
                options={[
                  { id: "home_oven_compatible", label: cms.filters.ovenHome },
                  { id: "wood_fired", label: cms.filters.ovenWood },
                  { id: "electric_high_temp", label: formatTemperatureCopy(cms.filters.ovenElectricHigh, fmt) },
                  { id: "pan_baked", label: cms.filters.ovenPan },
                ]}
                active={ovenFilter}
                onToggle={(v) => setOvenFilter(ovenFilter === v ? null : v)}
              />

              {hasActiveAdvanced && (
                <motion.button
                  onClick={() => {
                    setHydrationFilter(null);
                    setTextureFilter(null);
                    setSkillFilter(null);
                    setOvenFilter(null);
                  }}
                  className="self-start px-3 py-1.5 rounded-lg active:scale-95"
                  style={{
                    fontSize: "var(--font-size-sm)",
                    color: "var(--primary)",
                    background: "color-mix(in srgb, var(--primary) 8%, var(--surface-container))",
                    border: "1px solid color-mix(in srgb, var(--primary) 20%, var(--outline-variant))",
                  }}
                >
                  {cms.filters.removeFilters}
                </motion.button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══ Tier groups ═══ */}
      {tiers.length === 0 && (
        <Surface
          as={motion.div}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          className="p-8 text-center"
        >
          <p
            className="font-serif italic"
            style={{
              color: "var(--text-muted)",
              fontSize: "var(--font-size-2xl)",
            }}
          >
            {cms.misc.noStyleInFamily}
          </p>
          <motion.button
            onClick={() => setFamilyFilter("all")}
            className="mt-4 px-5 py-2 rounded-xl active:scale-95 transition-transform"
            style={{
              background: "var(--chip-bg-active)",
              color: "var(--chip-text-active)",
              fontSize: "var(--font-size-lg)",
              fontWeight: "var(--weight-semibold)" as any,
            }}
          >
            {cms.misc.showAllStyles}
          </motion.button>
        </Surface>
      )}
      {tiers.map(({ key, items }) => {
        const meta = TIER_META[key];
        const cmsTier = cms.tiers[key];
        const tierLabel = cmsTier?.label ?? meta.label;
        const tierSubtitle = cmsTier?.subtitle ?? meta.subtitle;
        const TierIcon = meta.Icon;
        return (
          <motion.div
            key={key}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay:
                key === "perfect"
                  ? 0
                  : key === "good"
                    ? 0.1
                    : 0.2,
              type: "spring",
              stiffness: 400,
              damping: 30,
            }}
          >
            {/* Tier header */}
            <div className="flex items-center gap-3 mb-3">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{
                  background: `color-mix(in srgb, ${meta.color} 12%, transparent)`,
                  color: meta.color,
                }}
              >
                <TierIcon size={14} />
              </div>
              <div className="flex items-baseline gap-2">
                <span
                  style={{
                    color: "var(--text-default)",
                    fontSize: "var(--font-size-2xl)",
                    fontWeight: "var(--weight-bold)" as any,
                  }}
                >
                  {tierLabel}
                </span>
                <span
                  className="font-serif italic"
                  style={{ color: "var(--text-muted)", fontSize: "var(--font-size-lg)" }}
                >
                  {tierSubtitle}
                </span>
              </div>
              <div
                className="flex-1 h-px ml-2"
                style={{ background: "var(--container-divider)" }}
              />
              <span
                style={{ color: "var(--text-muted)", fontSize: "var(--font-size-md)", fontFeatureSettings: "'tnum'" }}
              >
                {items.length}
              </span>
            </div>

            {/* Audit Sprint 12 — Not feasible: nota in cima alla griglia che chiarisce
                perché questi stili non sono praticabili al momento. */}
            {key === "not_feasible" && items.length > 0 && (
              <p
                className="mb-4 italic"
                style={{
                  fontSize: "var(--font-size-sm)",
                  color: "var(--text-muted)",
                  lineHeight: 1.5,
                }}
              >
                {cms.misc.notFeasibleExplainer}
              </p>
            )}
            <div
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 md:gap-3 items-start"
              style={key === "not_feasible" ? { opacity: 0.7 } : undefined}
            >
              {items.map((rec) => {
                const i = idx++;
                return (
                  <StyleCard
                    key={rec.style.id}
                    rec={rec}
                    tierColor={meta.color}
                    isSelected={
                      selectedStyle?.id === rec.style.id
                    }
                    hasSelection={hasSelection}
                    onSelect={() => handleSelect(rec.style)}
                    index={i}
                  />
                );
              })}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

/* ═══ STYLE CARD — Editorial magazine with ring badge ═══ */
function StyleCard({
  rec,
  tierColor,
  isSelected,
  hasSelection,
  onSelect,
  index,
}: {
  rec: StyleRecommendation;
  tierColor: string;
  isSelected: boolean;
  hasSelection: boolean;
  onSelect: () => void;
  index: number;
}) {
  const { cms } = useCms();
  const { style, compatibilityScore, optimizedComposite } = rec;
  // Badge = punteggio della ricetta ottimizzata per i tuoi vincoli (ciò che
  // otterrai aprendo lo stile). Fallback alla compatibilità se non calcolato.
  const displayScore = optimizedComposite ?? compatibilityScore;
  /* VPL-C3 (rev): badge "difficoltà · impegno" — info che DIFFERENZIA le tile
   * (a parità di momento il match è uguale per tutte). La motivazione di match
   * completa vive nel pannello di dettaglio. */
  const skillKey = getStyleTags(style.id)?.skill_required ??
    (style.suitable_for_beginner ? "beginner" : "intermediate");
  const difficultyLabel =
    skillKey === "beginner"
      ? cms.filters.skillBeginner
      : skillKey === "intermediate"
        ? cms.filters.skillIntermediate
        : skillKey === "advanced"
          ? cms.filters.skillAdvanced
          : cms.filters.skillExpert;
  const [fMin, fMax] = style.dough.fermentation_hours_range;
  const timeLabel =
    fMax <= 8 ? cms.filters.timeFast : `${Math.round(fMin)}–${Math.round(fMax)}h`;
  const cmsPhoto = cms.media.stylePhotos[style.id];
  const photo = cmsPhoto || STYLE_PHOTOS[style.id] || cms.media.fallbackPhoto || FALLBACK;
  const cmsFamilyName = cms.families[style.family]?.name;
  const familyName = (
    cmsFamilyName ?? PIZZA_FAMILIES[style.family]?.name ?? ""
  ).toUpperCase();
  const springT = {
    type: "spring" as const,
    stiffness: 400,
    damping: 28,
  };

  /* Resolve tier color to a CSS variable for the ring SVG — auto dark mode */
  const ringColor = tierColor;

  return (
    <div
      className="relative"
      style={{ zIndex: isSelected ? 10 : 1 }}
    >
      <motion.button
        onClick={onSelect}
        initial={{ opacity: 0, y: 14 }}
        animate={{
          opacity: 1,
          y: 0,
          scale: isSelected ? 1 : hasSelection ? 0.98 : 1,
        }}
        transition={{
          ...springT,
          opacity: {
            delay: index * 0.04 + 0.05,
            type: "spring",
            stiffness: 400,
            damping: 28,
          },
          y: { delay: index * 0.04 + 0.05, type: "spring", stiffness: 400, damping: 28 },
        }}
        whileHover={{
          y: isSelected ? 0 : -4,
          transition: { type: "spring", stiffness: 500, damping: 30 },
        }}
        className="relative text-left group w-full active:scale-[0.97]"
        style={{ transformOrigin: "center bottom" }}
      >
        {/* Tilt 3D: la card si inclina verso il puntatore col riflesso caldo */}
        <TiltCard className="relative rounded-2xl">
        {/* Card shell with warm border */}
        <motion.div
          animate={{
            boxShadow: isSelected
              ? `0 0 0 2px ${tierColor}, var(--style-card-shadow-selected)`
              : "var(--style-card-shadow)",
          }}
          transition={springT}
          className="rounded-2xl overflow-hidden"
          style={{
            background: "var(--container-card)",
            border:
              "1px solid var(--container-border-ghost)",
          }}
        >
          {/* ── Photo area ── */}
          <div
            className="relative overflow-hidden"
            style={{ aspectRatio: "3/4" }}
          >
            {/* Image with zoom on select */}
            <motion.div
              className="absolute inset-0"
              animate={{ scale: isSelected ? 1.06 : 1 }}
              transition={{
                type: "spring",
                stiffness: 200,
                damping: 22,
              }}
            >
              <ImageWithFallback
                src={photo}
                alt={style.name}
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]"
              />
            </motion.div>

            {/* Cinematic scrim — heavy bottom for text legibility */}
            <div
              className="absolute inset-0"
              style={{
                background: `var(--overlay-scrim)`,
              }}
            />

            {/* ── Score ring badge — top right ── */}
            <div className="absolute top-3 right-3">
              <ScoreRing
                score={displayScore}
                color={ringColor}
                size={38}
              />
            </div>

            {/* ── Selected check ── */}
            <AnimatePresence>
              {isSelected && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{
                    type: "spring",
                    stiffness: 500,
                    damping: 25,
                  }}
                  className="absolute top-3 left-3 w-8 h-8 rounded-full flex items-center justify-center"
                  style={{
                    background: tierColor,
                    boxShadow: "var(--style-card-badge-shadow)",
                  }}
                >
                  <Check
                    size={14}
                    color="var(--overlay-text)"
                    strokeWidth={3}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── Title + subtitle — large serif editorial ── */}
            <div className="absolute bottom-0 left-0 right-0 px-4 pb-3.5 sm:pb-4 pt-16">
              {/* Title — Playfair Display, large and confident */}
              <span
                className="font-serif"
                style={{
                  fontSize: "clamp(var(--font-size-3xl), 3.5vw, var(--font-size-6-5xl))",
                  fontWeight: "var(--weight-bold)" as any,
                  lineHeight: "var(--leading-snug)",
                  color: "var(--overlay-text)",
                  textShadow:
                    "var(--overlay-shadow-text)",
                  display: "block",
                  letterSpacing: "var(--tracking-snug)",
                }}
              >
                {style.name}
              </span>

              {/* Subtitle — ALL CAPS, tracked, warm cream */}
              <div
                style={{
                  marginTop: 6,
                  fontSize: "var(--font-size-sm)",
                  fontWeight: "var(--weight-semibold)" as any,
                  fontFamily: "var(--font-sans)",
                  letterSpacing: "var(--tracking-label)",
                  textTransform: "uppercase" as const,
                  color: "var(--overlay-text-warm)",
                  textShadow: "var(--overlay-shadow-text-sm)",
                  lineHeight: "var(--leading-normal)",
                }}
              >
                {familyName} — {style.origin.toUpperCase()}
              </div>

              {/* VPL-C3 (rev): badge "difficoltà · impegno" — differenzia le tile
                  (la motivazione di match completa è nel pannello di dettaglio). */}
              <div
                className="inline-flex items-center gap-1.5 mt-2 rounded-full"
                style={{
                  padding: "4px 10px 4px 8px",
                  background: "var(--overlay-backdrop)",
                  backdropFilter: "blur(6px)",
                  WebkitBackdropFilter: "blur(6px)",
                  border: `1px solid color-mix(in srgb, ${tierColor} 60%, transparent)`,
                  fontSize: "var(--font-size-xs)",
                  fontWeight: "var(--weight-semibold)" as any,
                  fontFamily: "var(--font-sans)",
                  color: "var(--overlay-text)",
                  lineHeight: "var(--leading-none)",
                }}
              >
                <ChefHat size={13} strokeWidth={2.5} style={{ color: tierColor, flexShrink: 0 }} aria-hidden="true" />
                <span>
                  {difficultyLabel} · {timeLabel}
                </span>
              </div>
            </div>
          </div>
        </motion.div>
        </TiltCard>
      </motion.button>
    </div>
  );
}

/* ═══ FACET ROW — Tag-based filter row ═══ */
function FacetRow({
  label,
  options,
  active,
  onToggle,
}: {
  label: string;
  options: { id: string; label: string }[];
  active: string | null;
  onToggle: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1">
      <span
        className="type-label"
        style={{ color: "var(--text-muted)", fontSize: "var(--font-size-sm)" }}
      >
        {label}
      </span>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => {
          const isActive = active === o.id;
          return (
            <FilterChip
              key={o.id}
              active={isActive}
              onClick={() => onToggle(o.id)}
            >
              {o.label}
            </FilterChip>
          );
        })}
      </div>
    </div>
  );
}
