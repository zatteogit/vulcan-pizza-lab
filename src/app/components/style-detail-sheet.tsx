import React, { useState } from "react";
import { motion, useReducedMotion, AnimatePresence } from "motion/react";
import { Droplets, Flame, Clock, ChefHat, Sparkles, X, Layers, Ratio, FlaskConical, Eye, EyeOff } from "lucide-react";
import { createPortal } from "react-dom";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { STYLE_PHOTOS } from "./recommended-styles";
import { PizzaStyle, PIZZA_FAMILIES } from "./pizza-engine";
import { getStyleDeviation, DEVIATION_CATEGORY_LABELS, getCompatibleVariants } from "./deviation-tags";
import { getStyleParametrics } from "./parametric-databases";
import { useCms } from "./cms/cms-context";
import { t } from "./cms/i18n";

interface StyleDetailSheetProps {
  style: PizzaStyle;
  onGenerate: () => void;
  onDismiss: () => void;
}

export function StyleDetailSheet({
  style,
  onGenerate,
  onDismiss,
}: StyleDetailSheetProps) {
  const photo = STYLE_PHOTOS[style.id] || STYLE_PHOTOS.napoletana_stg;
  const { cms } = useCms();
  const familyName = (cms.families[style.family]?.name ?? PIZZA_FAMILIES[style.family]?.name ?? "").toUpperCase();
  const pt = cms.parametricTips;
  const prefersReducedMotion = useReducedMotion();
  const [showNerd, setShowNerd] = useState(false);

  const hRange = `${style.dough.hydration_pct_range[0]}–${style.dough.hydration_pct_range[1]}%`;
  const wRange = `W ${style.dough.flour_w_range[0]}–${style.dough.flour_w_range[1]}`;
  const fRange = `${style.dough.fermentation_hours_range[0]}–${style.dough.fermentation_hours_range[1]}h`;
  const plRange = `${style.dough.flour_pl_range[0]}–${style.dough.flour_pl_range[1]}`;
  const thickness = `${style.shape.thickness_factor.toFixed(2)} g/cm²`;
  const dev = getStyleDeviation(style.id);
  const devCmsLabel = cms.deviationLabels[dev.category] ?? DEVIATION_CATEGORY_LABELS[dev.category].label;
  const devEmoji = DEVIATION_CATEGORY_LABELS[dev.category].emoji;
  const compatVariants = getCompatibleVariants(style.id);
  const params = getStyleParametrics(style.id);

  /* CMS-backed description & characteristics */
  const cmsDescription = cms.styleDescriptions[style.id] ?? style.description;
  const cmsChars: string[] = cms.styleChars[style.id]
    ? cms.styleChars[style.id].split("|").map((s: string) => s.trim()).filter(Boolean)
    : style.key_characteristics;

  const DATA_PILLS: { icon: typeof Droplets; label: string; value: string }[] = [
    { icon: Droplets, label: pt.pillHydration, value: hRange },
    { icon: Flame, label: pt.pillFlour, value: wRange },
    { icon: Ratio, label: pt.pillPL, value: plRange },
    { icon: Clock, label: pt.pillFermentation, value: fRange },
    { icon: Layers, label: pt.pillThickness, value: thickness },
    { icon: ChefHat, label: pt.pillLevel, value: style.suitable_for_beginner ? pt.pillLevelBeginner : pt.pillLevelExpert },
    { icon: FlaskConical, label: pt.pillExperimentation, value: `${devEmoji} ${devCmsLabel}` },
  ];

  const sheet = (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        pointerEvents: "none",
      }}
    >
      {/* Backdrop — subtle, dismissible */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        onClick={onDismiss}
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0,0,0,0.25)",
          pointerEvents: "auto",
        }}
      />

      {/* Sheet — anchored to bottom */}
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          pointerEvents: "auto",
          maxHeight: "85vh",
          overflowY: "auto",
          WebkitOverflowScrolling: "touch",
          borderTopLeftRadius: "1.25rem",
          borderTopRightRadius: "1.25rem",
          background: "var(--surface-container-low)",
          borderTop: "1px solid var(--outline-variant)",
          boxShadow: "0 -8px 40px rgba(0,0,0,0.15)",
        }}
      >
        {/* Handle bar */}
        <div className="flex justify-center pt-3 pb-1">
          <div
            className="rounded-full"
            style={{
              width: 36,
              height: 4,
              background: "var(--outline-variant)",
              opacity: 0.6,
            }}
          />
        </div>

        {/* Close button */}
        <motion.button
          onClick={onDismiss}
          className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center active:scale-95 transition-transform"
          style={{
            background: "var(--surface-container)",
            color: "var(--text-muted)",
            border: "1px solid var(--outline-variant)",
          }}
          aria-label="Chiudi dettagli"
        >
          <X size={14} />
        </motion.button>

        <div className="px-5 sm:px-6 pb-6 pt-2">
          {/* ── Header row: Photo thumb + title ── */}
          <div className="flex gap-4 items-start">
            {/* Photo thumbnail */}
            <div
              className="shrink-0 rounded-xl overflow-hidden"
              style={{ width: 80, height: 80 }}
            >
              <ImageWithFallback
                src={photo}
                alt={style.name}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex-1 min-w-0">
              {/* Family label */}
              <span
                style={{
                  fontSize: "var(--font-size-xs)",
                  color: "var(--text-accent)",
                  letterSpacing: "var(--tracking-label)",
                  textTransform: "uppercase" as const,
                  fontWeight: "var(--weight-semibold)" as any,
                }}
              >
                {familyName}
              </span>
              <span
                style={{
                  fontSize: "var(--font-size-xs)",
                  color: "var(--text-muted)",
                  margin: "0 6px",
                  opacity: 0.5,
                }}
              >
                ·
              </span>
              <span
                style={{
                  fontSize: "var(--font-size-xs)",
                  color: "var(--text-muted)",
                }}
              >
                {style.origin}
              </span>

              {/* Title */}
              <h3
                className="font-serif mt-0.5"
                style={{
                  fontSize: "clamp(1.25rem, 4vw, 1.75rem)",
                  fontWeight: "var(--weight-bold)" as any,
                  color: "var(--text-default)",
                  lineHeight: 1.15,
                }}
              >
                {style.name}
              </h3>
            </div>
          </div>

          {/* ── Description ── */}
          <p
            className="mt-4"
            style={{
              fontSize: "var(--font-size-md)",
              color: "var(--text-muted)",
              lineHeight: 1.55,
            }}
          >
            {cmsDescription}
          </p>

          {/* ── Key characteristics ── */}
          <div className="flex flex-wrap gap-1.5 mt-4">
            {cmsChars.map((c) => (
              <span
                key={c}
                className="px-2.5 py-1 rounded-lg"
                style={{
                  fontSize: "var(--font-size-xs)",
                  fontWeight: "var(--weight-medium)" as any,
                  background: "var(--surface-container)",
                  color: "var(--text-default)",
                  border: "1px solid var(--outline-variant)",
                }}
              >
                {c}
              </span>
            ))}
          </div>

          {/* ── Nerd toggle — show/hide technical details ── */}
          <div className="flex items-center justify-between mt-5">
            <motion.button
              onClick={() => setShowNerd(!showNerd)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg active:scale-95 transition-transform"
              style={{
                fontSize: "var(--font-size-sm)",
                color: showNerd ? "var(--primary)" : "var(--text-muted)",
                background: showNerd
                  ? "color-mix(in srgb, var(--primary) 8%, rgba(0,0,0,0))"
                  : "rgba(0,0,0,0)",
                border: `1px solid ${showNerd ? "color-mix(in srgb, var(--primary) 20%, var(--outline-variant))" : "var(--outline-variant)"}`,
                cursor: "pointer",
                fontWeight: "var(--weight-medium)" as any,
              }}
            >
              {showNerd ? <EyeOff size={13} /> : <Eye size={13} />}
              {showNerd ? "Nascondi dettagli tecnici" : "Mostra dettagli tecnici"}
            </motion.button>
          </div>

          {/* ── Technical details — hidden by default ── */}
          <AnimatePresence>
            {showNerd && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 28 }}
                className="overflow-hidden"
              >
                {/* ── Author variants — compatible methods ── */}
                {compatVariants.length > 0 && (
                  <div className="mt-4">
                    <span
                      style={{
                        fontSize: "var(--font-size-2xs)",
                        letterSpacing: "0.12em",
                        textTransform: "uppercase" as const,
                        color: "var(--text-muted)",
                      }}
                    >
                      {pt.sheetTechniquesLabel}
                    </span>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {compatVariants.map((v) => {
                        const cmsAuthor = cms.authorAuthors[v.id] ?? v.author;
                        const cmsName = cms.authorNames[v.id] ?? v.name;
                        return (
                          <span
                            key={v.id}
                            className="px-2.5 py-1 rounded-lg"
                            style={{
                              fontSize: "var(--font-size-xs)",
                              fontWeight: "var(--weight-medium)" as any,
                              background: "color-mix(in srgb, var(--primary) 8%, var(--surface-container))",
                              color: "var(--text-default)",
                              border: "1px solid color-mix(in srgb, var(--primary) 15%, var(--outline-variant))",
                            }}
                          >
                            {v.emoji} {cmsAuthor} — {cmsName}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* ── Data pills — quick-glance parameters ── */}
                <div className="grid grid-cols-2 gap-2 mt-4">
                  {DATA_PILLS.map((pill, idx) => {
                    const PillIcon = pill.icon;
                    return (
                      <motion.div
                        key={pill.label}
                        initial={prefersReducedMotion ? false : { opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={prefersReducedMotion ? { duration: 0 } : {
                          delay: 0.15 + idx * 0.04,
                          type: "spring",
                          stiffness: 500,
                          damping: 28,
                        }}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl"
                        style={{
                          background: "var(--surface-container)",
                          border: "1px solid var(--outline-variant)",
                        }}
                      >
                        <PillIcon
                          size={13}
                          style={{ color: "var(--text-accent)", flexShrink: 0 }}
                        />
                        <div className="min-w-0">
                          <div
                            style={{
                              fontSize: "var(--font-size-2xs)",
                              color: "var(--text-muted)",
                              letterSpacing: "var(--tracking-wide)",
                              textTransform: "uppercase" as const,
                              lineHeight: 1.2,
                            }}
                          >
                            {pill.label}
                          </div>
                          <div
                            style={{
                              fontSize: "var(--font-size-sm)",
                              color: "var(--text-default)",
                              fontWeight: "var(--weight-semibold)" as any,
                              fontFeatureSettings: "'tnum'",
                              lineHeight: 1.3,
                            }}
                          >
                            {pill.value}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                {/* ── Parametric details — oven, baking, equipment ── */}
                {(params.ovenTemp || params.bakingTime || params.doughBase) && (
                  <motion.div
                    initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={prefersReducedMotion ? { duration: 0 } : {
                      delay: 0.4,
                      type: "spring",
                      stiffness: 450,
                      damping: 28,
                    }}
                    className="mt-4 flex flex-col gap-2"
                  >
                    <span
                      style={{
                        fontSize: "var(--font-size-2xs)",
                        letterSpacing: "0.12em",
                        textTransform: "uppercase" as const,
                        color: "var(--text-muted)",
                        fontWeight: "var(--weight-semibold)" as any,
                      }}
                    >
                      {pt.sheetSectionTitle}
                    </span>
                    <div
                      className="rounded-xl px-3.5 py-3 flex flex-col gap-2.5"
                      style={{
                        background: "var(--surface-container)",
                        border: "1px solid var(--outline-variant)",
                      }}
                    >
                      {params.ovenTemp && (
                        <ParamRow
                          label={pt.sheetOvenLabel}
                          value={`${params.ovenTemp.idealTemp_c}°C (${params.ovenTemp.minTemp_c}–${params.ovenTemp.maxTemp_c}°C)`}
                          sub={t(pt.sheetOvenPreheat, { min: params.ovenTemp.preheatingMin })}
                        />
                      )}
                      {params.bakingTime && (
                        <ParamRow
                          label={pt.sheetBakeLabel}
                          value={formatBakingTime(params.bakingTime.idealSeconds)}
                          sub={params.bakingTime.turns > 0 ? t(pt.sheetBakeTurns, { n: params.bakingTime.turns }) : pt.sheetBakeNoTurns}
                        />
                      )}
                      {params.doughBase && (
                        <ParamRow
                          label={pt.sheetDoughLabel}
                          value={`${params.doughBase.ballWeight_g}g`}
                          sub={params.doughBase.stretchMethod}
                        />
                      )}
                      {params.salt && (
                        <ParamRow
                          label={pt.sheetSaltLabel}
                          value={`${params.salt.saltPct}% ${params.salt.saltType}`}
                          sub={params.salt.additionTiming}
                        />
                      )}
                      {params.folding && params.folding.foldCount > 0 && (
                        <ParamRow
                          label={pt.sheetFoldLabel}
                          value={`${params.folding.foldCount}× ${params.folding.foldType.replace("_", " ")}`}
                          sub={t(pt.sheetFoldInterval, { min: params.folding.foldInterval_min })}
                        />
                      )}
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── CTA — Genera ricetta ── */}
          <motion.button
            onClick={onGenerate}
            whileHover={{ scale: 1.02 }}
            className="w-full flex items-center justify-center gap-2.5 h-13 rounded-full mt-6 active:scale-[0.97] transition-transform"
            style={{
              background: "var(--cta-btn-bg)",
              color: "var(--cta-btn-text)",
              boxShadow: "var(--cta-btn-shadow-deep)",
              fontWeight: "var(--weight-semibold)" as any,
              fontSize: "var(--font-size-xl-5)",
            }}
          >
            <Sparkles size={15} />
            {pt.sheetGenerateBtn}
          </motion.button>
        </div>
      </motion.div>
    </div>
  );

  return createPortal(sheet, document.body);
}

function ParamRow({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="flex flex-col">
      <div
        style={{
          fontSize: "var(--font-size-2xs)",
          color: "var(--text-muted)",
          letterSpacing: "var(--tracking-wide)",
          textTransform: "uppercase" as const,
          lineHeight: 1.2,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: "var(--font-size-sm)",
          color: "var(--text-default)",
          fontWeight: "var(--weight-semibold)" as any,
          fontFeatureSettings: "'tnum'",
          lineHeight: 1.3,
        }}
      >
        {value}
      </div>
      <div
        style={{
          fontSize: "var(--font-size-2xs)",
          color: "var(--text-muted)",
          letterSpacing: "var(--tracking-wide)",
          textTransform: "uppercase" as const,
          lineHeight: 1.2,
        }}
      >
        {sub}
      </div>
    </div>
  );
}

function formatBakingTime(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}m ${remainingSeconds}s`;
}