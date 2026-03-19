import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Check, Award, Sparkles, Triangle, Filter, SlidersHorizontal } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { ScoreRing } from "./score-ring";
import {
  PizzaStyle,
  UserConstraints,
  StyleRecommendation,
  PIZZA_FAMILIES,
  recommendStyles,
  type FamilyId,
} from "./pizza-engine";
import { useStylesOverride } from "./styles-override-context";
import { useCms } from "./cms/cms-context";
import { getStyleDeviation, DEVIATION_CATEGORY_LABELS, getStyleTags } from "./deviation-tags";

interface RecommendedStylesProps {
  constraints: UserConstraints;
  selectedStyle: PizzaStyle | null;
  onSelectStyle: (style: PizzaStyle) => void;
}

/* ═══ CURATED EDITORIAL PHOTOS — dramatic, dark, close-up ═══ */
export const STYLE_PHOTOS: Record<string, string> = {
  napoletana_stg:
    "https://images.unsplash.com/photo-1717883235373-ef10b2a745a3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600&q=80",
  napoletana_canotto:
    "https://images.unsplash.com/photo-1770670644186-b3d930f75f5a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600&q=80",
  teglia_romana:
    "https://images.unsplash.com/photo-1650327381366-c6dc88f8b9fe?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600&q=80",
  tonda_romana:
    "https://images.unsplash.com/photo-1695457207327-2fe494a5aab8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600&q=80",
  pinsa_romana:
    "https://images.unsplash.com/photo-1602658015824-b49d35094837?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600&q=80",
  new_york:
    "https://images.unsplash.com/photo-1616141032335-7e6b413f93ec?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600&q=80",
  detroit:
    "https://images.unsplash.com/photo-1684823906761-30fd02a961cf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600&q=80",
  chicago_deep:
    "https://images.unsplash.com/photo-1595378833483-c995dbe4d74f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600&q=80",
  bonci_teglia:
    "https://images.unsplash.com/photo-1624323210664-3659370c9346?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600&q=80",
  focaccia_genovese:
    "https://images.unsplash.com/photo-1770833047669-2db01dd791e9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600&q=80",
  sfincione:
    "https://images.unsplash.com/photo-1711805064484-a77096f599a6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600&q=80",
  pala_romana:
    "https://images.unsplash.com/photo-1614936686354-a490b8d90478?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600&q=80",
  grandma_style:
    "https://images.unsplash.com/photo-1601387448308-66ae6aa1f1f7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600&q=80",
  focaccia_recco:
    "https://images.unsplash.com/photo-1751183295754-9cff9577a44e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600&q=80",
  padellino_torino:
    "https://images.unsplash.com/photo-1626108962941-61b46dd705a5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600&q=80",
};
const FALLBACK =
  "https://images.unsplash.com/photo-1717883235373-ef10b2a745a3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600&q=80";

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
    label: "Perfetti",
    subtitle: "massima compatibilit\u00e0",
    color: "var(--text-success)",
    Icon: Award,
  },
  good: {
    label: "Buoni",
    subtitle: "ottima scelta",
    color: "var(--text-warning)",
    Icon: Sparkles,
  },
  challenging: {
    label: "Sfidanti",
    subtitle: "per chi osa",
    color: "var(--text-accent)",
    Icon: Triangle,
  },
};

export function RecommendedStyles({
  constraints,
  selectedStyle,
  onSelectStyle,
}: RecommendedStylesProps) {
  const { effectiveStyles, isOverrideActive } = useStylesOverride();
  const { cms } = useCms();
  const recommendations = useMemo(
    () =>
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
      ),
    [constraints, effectiveStyles, isOverrideActive, cms.recommendationWeights],
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
        items: filtered.filter(
          (r) => r.tier === "perfect",
        ),
      },
      {
        key: "good",
        items: filtered.filter((r) => r.tier === "good"),
      },
      {
        key: "challenging",
        items: filtered.filter(
          (r) => r.tier === "challenging",
        ),
      },
    ].filter((t) => t.items.length > 0);

  let idx = 0;

  const handleSelect = (style: PizzaStyle) => {
    onSelectStyle(style);
  };

  const FAMILY_FILTERS: { id: FamilyId | "all"; label: string }[] = [
    { id: "all", label: cms.allFamiliesLabel ?? "Tutte" },
    { id: "napoletana", label: cms.families.napoletana?.name ?? PIZZA_FAMILIES.napoletana.name },
    { id: "romana", label: cms.families.romana?.name ?? PIZZA_FAMILIES.romana.name },
    { id: "americana", label: cms.families.americana?.name ?? PIZZA_FAMILIES.americana.name },
    { id: "contemporanea", label: cms.families.contemporanea?.name ?? PIZZA_FAMILIES.contemporanea.name },
  ];

  return (
    <div className="flex flex-col gap-10 sm:gap-12">
      {/* ═══ Family filter chips ═══ */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <Filter
            size={13}
            style={{ color: "var(--text-muted)", flexShrink: 0 }}
          />
          <span
            className="type-label"
            style={{ color: "var(--text-muted)", fontSize: "var(--font-size-sm)" }}
          >
            Filtra per famiglia
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {FAMILY_FILTERS.map((f) => {
            const isActive = familyFilter === f.id;
            const count = familyCounts[f.id] || 0;
            return (
              <motion.button
                key={f.id}
                onClick={() => setFamilyFilter(f.id)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl active:scale-95 transition-transform"
                style={{
                  background: isActive
                    ? "var(--chip-bg-active)"
                    : "var(--surface-container)",
                  color: isActive
                    ? "var(--chip-text-active)"
                    : "var(--text-default)",
                  border: `1px solid ${isActive ? "rgba(0,0,0,0)" : "var(--outline-variant)"}`,
                  fontSize: "var(--font-size-lg)",
                  fontWeight: "var(--weight-semibold)" as any,
                }}
                whileHover={{ y: -1 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              >
                {f.label}
                <span
                  style={{
                    fontSize: "var(--font-size-sm)",
                    opacity: 0.6,
                    fontFeatureSettings: "'tnum'",
                  }}
                >
                  {count}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* ═══ Advanced faceted filters (tag-based) ═══ */}
      <div className="flex flex-col gap-3 -mt-6">
        <motion.button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-2 px-1 py-1 active:scale-95 self-start"
          style={{ color: hasActiveAdvanced ? "var(--primary)" : "var(--text-muted)" }}
        >
          <SlidersHorizontal size={13} style={{ flexShrink: 0 }} />
          <span
            className="type-label"
            style={{ fontSize: "var(--font-size-sm)" }}
          >
            {cms.filters.advancedLabel}{hasActiveAdvanced ? ` (${[hydrationFilter, textureFilter, skillFilter, ovenFilter].filter(Boolean).length})` : ""}
          </span>
          <motion.span
            animate={{ rotate: showAdvanced ? 180 : 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
            style={{ fontSize: "var(--font-size-xs)" }}
          >
            ▼
          </motion.span>
        </motion.button>

        <AnimatePresence>
          {showAdvanced && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="overflow-hidden"
            >
              <div
                className="p-4 rounded-2xl flex flex-col gap-4"
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
                    { id: "electric_high_temp", label: cms.filters.ovenElectricHigh },
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
      </div>

      {/* ═══ Tier groups ═══ */}
      {tiers.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          className="surface-card p-8 text-center"
        >
          <p
            className="font-serif italic"
            style={{
              color: "var(--text-muted)",
              fontSize: "var(--font-size-2xl)",
            }}
          >
            Nessuno stile in questa famiglia per i tuoi parametri.
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
            Mostra tutte
          </motion.button>
        </motion.div>
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
            <div className="flex items-center gap-3 mb-5">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{
                  background: `color-mix(in srgb, ${meta.color} 12%, transparent)`,
                  color: meta.color,
                }}
              >
                <TierIcon size={15} />
              </div>
              <div className="flex items-baseline gap-2">
                <span
                  style={{
                    color: "var(--text-default)",
                    fontSize: "var(--font-size-2-5xl)",
                    fontWeight: "var(--weight-bold)" as any,
                  }}
                >
                  {tierLabel}
                </span>
                <span
                  className="font-serif italic"
                  style={{ color: "var(--text-muted)", fontSize: "var(--font-size-xl-5)" }}
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

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 items-start">
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
  const { style, compatibilityScore } = rec;
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
                score={compatibilityScore}
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
                  className="absolute top-3 left-3 w-7 h-7 rounded-full flex items-center justify-center"
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
                  fontFamily: "'DM Sans', sans-serif",
                  letterSpacing: "var(--tracking-label)",
                  textTransform: "uppercase" as const,
                  color: "var(--overlay-text-warm)",
                  textShadow: "var(--overlay-shadow-text-sm)",
                  lineHeight: "var(--leading-normal)",
                }}
              >
                {familyName} — {style.origin.toUpperCase()}
              </div>
            </div>
          </div>
        </motion.div>
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
            <motion.button
              key={o.id}
              onClick={() => onToggle(o.id)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl active:scale-95 transition-transform"
              style={{
                background: isActive
                  ? "var(--chip-bg-active)"
                  : "var(--surface-container)",
                color: isActive
                  ? "var(--chip-text-active)"
                  : "var(--text-default)",
                border: `1px solid ${isActive ? "rgba(0,0,0,0)" : "var(--outline-variant)"}`,
                fontSize: "var(--font-size-lg)",
                fontWeight: "var(--weight-semibold)" as any,
              }}
              whileHover={{ y: -1 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            >
              {o.label}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}