import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Check, Award, Sparkles, Triangle } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import {
  PizzaStyle,
  UserConstraints,
  StyleRecommendation,
  PIZZA_FAMILIES,
  recommendStyles,
} from "./pizza-engine";

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
    subtitle: "massima compatibilità",
    color: "var(--cta)",
    Icon: Award,
  },
  good: {
    label: "Buoni",
    subtitle: "ottima scelta",
    color: "var(--tertiary)",
    Icon: Sparkles,
  },
  challenging: {
    label: "Sfidanti",
    subtitle: "per chi osa",
    color: "var(--primary)",
    Icon: Triangle,
  },
};

/* ═══ Circular score ring badge (SVG) ═══ */
function ScoreRing({
  score,
  color,
  size = 36,
}: {
  score: number;
  color: string;
  size?: number;
}) {
  const r = (size - 4) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - score / 100);
  return (
    <div
      className="relative"
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={{ display: "block" }}
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="rgba(0,0,0,0.55)"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={2}
        />
        {/* Progress ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={2}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{
            transition:
              "stroke-dashoffset 0.8s cubic-bezier(0.16,1,0.3,1)",
          }}
        />
        {/* Number */}
        <text
          x={size / 2}
          y={size / 2 + 0.5}
          textAnchor="middle"
          dominantBaseline="central"
          fill="white"
          fontSize={size * 0.33}
          fontWeight="700"
          fontFamily="'DM Sans', sans-serif"
          style={{ fontFeatureSettings: "'tnum'" }}
        >
          {score}
        </text>
      </svg>
    </div>
  );
}

export function RecommendedStyles({
  constraints,
  selectedStyle,
  onSelectStyle,
}: RecommendedStylesProps) {
  const recommendations = React.useMemo(
    () => recommendStyles(constraints),
    [constraints],
  );
  const [expandedId, setExpandedId] = useState<string | null>(
    null,
  );
  const hasSelection = selectedStyle !== null;

  const tiers: { key: string; items: StyleRecommendation[] }[] =
    [
      {
        key: "perfect",
        items: recommendations.filter(
          (r) => r.tier === "perfect",
        ),
      },
      {
        key: "good",
        items: recommendations.filter((r) => r.tier === "good"),
      },
      {
        key: "challenging",
        items: recommendations.filter(
          (r) => r.tier === "challenging",
        ),
      },
    ].filter((t) => t.items.length > 0);

  let idx = 0;

  const handleSelect = (style: PizzaStyle) => {
    onSelectStyle(style);
    setExpandedId((prev) =>
      prev === style.id ? null : style.id,
    );
  };

  return (
    <div className="flex flex-col gap-10 sm:gap-12">
      {tiers.map(({ key, items }) => {
        const meta = TIER_META[key];
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
              duration: 0.4,
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
                  className="text-foreground"
                  style={{
                    fontSize: "1.0625rem",
                    fontWeight: 700,
                  }}
                >
                  {meta.label}
                </span>
                <span
                  className="font-serif italic text-muted-foreground"
                  style={{ fontSize: "0.9375rem" }}
                >
                  {meta.subtitle}
                </span>
              </div>
              <div
                className="flex-1 h-px ml-2"
                style={{ background: "var(--border)" }}
              />
              <span
                className="text-muted-foreground font-mono"
                style={{ fontSize: "0.75rem" }}
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
                    isExpanded={expandedId === rec.style.id}
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
  isExpanded,
  hasSelection,
  onSelect,
  index,
}: {
  rec: StyleRecommendation;
  tierColor: string;
  isSelected: boolean;
  isExpanded: boolean;
  hasSelection: boolean;
  onSelect: () => void;
  index: number;
}) {
  const { style, compatibilityScore } = rec;
  const photo = STYLE_PHOTOS[style.id] || FALLBACK;
  const familyName = (
    PIZZA_FAMILIES[style.family]?.name ?? ""
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
            duration: 0.45,
          },
          y: { delay: index * 0.04 + 0.05, duration: 0.45 },
        }}
        whileHover={{
          y: isSelected ? 0 : -4,
          transition: { duration: 0.25 },
        }}
        whileTap={{ scale: 0.97 }}
        className="relative text-left group w-full"
        style={{ transformOrigin: "center bottom" }}
      >
        {/* Card shell with warm border */}
        <motion.div
          animate={{
            boxShadow: isSelected
              ? `0 0 0 2px ${tierColor}, 0 12px 32px -6px rgba(0,0,0,0.2)`
              : "0 2px 8px -2px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.06)",
          }}
          transition={springT}
          className="rounded-2xl overflow-hidden"
          style={{
            background: "var(--card)",
            border:
              "1px solid color-mix(in srgb, var(--foreground) 8%, transparent)",
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
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]"
              />
            </motion.div>

            {/* Cinematic scrim — heavy bottom for text legibility */}
            <div
              className="absolute inset-0"
              style={{
                background: `linear-gradient(180deg,
                rgba(0,0,0,0.0) 0%,
                rgba(0,0,0,0.0) 30%,
                rgba(0,0,0,0.12) 50%,
                rgba(0,0,0,0.45) 70%,
                rgba(0,0,0,0.80) 90%,
                rgba(0,0,0,0.88) 100%)`,
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
                    boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
                  }}
                >
                  <Check
                    size={14}
                    color="white"
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
                  fontSize: "clamp(1.125rem, 3.5vw, 1.5rem)",
                  fontWeight: 700,
                  lineHeight: 1.1,
                  color: "#FFFFFF",
                  textShadow:
                    "0 2px 8px rgba(0,0,0,0.6), 0 0 24px rgba(0,0,0,0.25)",
                  display: "block",
                  letterSpacing: "-0.01em",
                }}
              >
                {style.name}
              </span>

              {/* Subtitle — ALL CAPS, tracked, warm cream */}
              <div
                style={{
                  marginTop: 6,
                  fontSize: "0.625rem",
                  fontWeight: 600,
                  fontFamily: "'DM Sans', sans-serif",
                  letterSpacing: "0.06em",
                  textTransform: "uppercase" as const,
                  color: "rgba(245, 225, 200, 0.8)",
                  textShadow: "0 1px 4px rgba(0,0,0,0.5)",
                  lineHeight: 1.35,
                }}
              >
                {familyName} — {style.origin.toUpperCase()}
              </div>
            </div>
          </div>

          {/* ── Expand detail — inside card, below photo ── */}
          <AnimatePresence>
            {isSelected && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{
                  duration: 0.25,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="overflow-hidden"
              >
                <div
                  className="px-4 py-3 flex flex-col gap-2.5"
                  style={{
                    borderTop:
                      "1px solid color-mix(in srgb, var(--foreground) 6%, transparent)",
                  }}
                >
                  <p
                    className="text-muted-foreground"
                    style={{
                      fontSize: "0.75rem",
                      lineHeight: 1.55,
                    }}
                  >
                    {style.description}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {style.key_characteristics
                      .slice(0, 3)
                      .map((c) => (
                        <span
                          key={c}
                          className="px-2 py-0.5 rounded-md"
                          style={{
                            fontSize: "0.5625rem",
                            fontWeight: 600,
                            background:
                              "var(--surface-container)",
                            color: "var(--muted-foreground)",
                            letterSpacing: "0.01em",
                          }}
                        >
                          {c}
                        </span>
                      ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.button>
    </div>
  );
}