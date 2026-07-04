import React, { useState } from "react";
import { motion, useReducedMotion, AnimatePresence } from "motion/react";
import { Droplets, Flame, Clock, ChefHat, Sparkles, X, Layers, Ratio, FlaskConical, Eye, EyeOff, Bookmark } from "lucide-react";
import { createPortal } from "react-dom";
import { ImageWithFallback } from "../../components/media/ImageWithFallback";
import { STYLE_PHOTOS, reasonDimension, MATCH_DIMENSION_ICON } from "./recommended-styles";
import { STYLE_VIDEOS } from "../../data/style-photos";
import {
  PizzaStyle,
  PIZZA_FAMILIES,
  recommendStyles,
  resolveEngineMsgs,
  formatOrigin,
  type EngineMsg,
  type UserConstraints,
} from "../../domain/pizza-engine";
import { getStyleDeviation, DEVIATION_CATEGORY_LABELS } from "../../domain/deviation-tags";
import { getInterpretationsForStyle } from "../../data/interpretation-library";
import { getStyleParametrics } from "../../data/parametric-databases";
import { useCms } from "../cms/cms-context";
import { t, createFormatter } from "../cms/i18n";
import { CtaButton, IconButton } from "../../components/ds/index";
import { isFavoriteStyle, toggleFavoriteStyle } from "../../data/saved-recipes";

interface StyleDetailSheetProps {
  style: PizzaStyle;
  /** VPL-C3 — vincoli utente per spiegare in modo articolato perché lo stile combacia. */
  constraints?: UserConstraints;
  onGenerate: () => void;
  onDismiss: () => void;
}

/* VPL: video di cottura che sfuma in ingresso sopra la foto-poster (effetto wow). */
function BlurInVideo({ src }: { src: string }) {
  const [ready, setReady] = useState(false);
  return (
    <video
      src={src}
      muted
      loop
      playsInline
      autoPlay
      preload="auto"
      onLoadedData={() => setReady(true)}
      className="absolute inset-0 w-full h-full object-cover"
      style={{
        opacity: ready ? 1 : 0,
        filter: ready ? "blur(0px)" : "blur(16px)",
        transform: ready ? "scale(1)" : "scale(1.06)",
        transition: "opacity 0.9s ease, filter 0.9s ease, transform 0.9s ease",
      }}
      aria-hidden="true"
    />
  );
}

export function StyleDetailSheet({
  style,
  constraints,
  onGenerate,
  onDismiss,
}: StyleDetailSheetProps) {
  const photo = STYLE_PHOTOS[style.id] || STYLE_PHOTOS.napoletana_stg;
  const video = STYLE_VIDEOS[style.id];
  const { cms, bcp47 } = useCms();
  /* VPL-C3: motivazioni di match articolate (lista completa, con dimensione). */
  const matchReasons = React.useMemo(() => {
    if (!constraints) return [] as { text: string; dim: ReturnType<typeof reasonDimension> }[];
    const rec = recommendStyles(constraints).find((r) => r.style.id === style.id);
    if (!rec || rec.tier === "not_feasible") return [];
    const fmt = createFormatter(cms.ui, bcp47);
    const texts = resolveEngineMsgs(
      rec.reasons,
      cms.engineMessages,
      (_m: EngineMsg, key: string, value: string | number) =>
        typeof value === "number" && ["temp", "ideal", "min"].includes(key)
          ? fmt.celsius(value)
          : value,
    );
    return texts.map((text, i) => ({ text, dim: reasonDimension(rec.reasons[i].key) }));
  }, [constraints, style.id, cms.engineMessages, cms.ui, bcp47]);
  const familyName = (cms.families[style.family]?.name ?? PIZZA_FAMILIES[style.family]?.name ?? "").toUpperCase();
  const pt = cms.parametricTips;
  const prefersReducedMotion = useReducedMotion();
  const [showNerd, setShowNerd] = useState(false);
  const [fav, setFav] = useState(() => isFavoriteStyle(style.id));

  const hRange = `${style.dough.hydration_pct_range[0]}–${style.dough.hydration_pct_range[1]}%`;
  const wRange = `W ${style.dough.flour_w_range[0]}–${style.dough.flour_w_range[1]}`;
  const fRange = `${style.dough.fermentation_hours_range[0]}–${style.dough.fermentation_hours_range[1]}h`;
  const plRange = `${style.dough.flour_pl_range[0]}–${style.dough.flour_pl_range[1]}`;
  const thickness = `${style.shape.thickness_factor.toFixed(2)} g/cm²`;
  const dev = getStyleDeviation(style.id);
  const devCmsLabel = cms.deviationLabels[dev.category] ?? DEVIATION_CATEGORY_LABELS[dev.category].label;
  const devEmoji = DEVIATION_CATEGORY_LABELS[dev.category].emoji;
  /* Audit motore 2026-05: ex getCompatibleVariants (AUTHOR_VARIANTS legacy) →
     ora deriva dalla Interpretation library (unica fonte di verità). */
  const compatVariants = getInterpretationsForStyle(style.id);
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
          background: "var(--sheet-backdrop)",
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
          boxShadow: "var(--sheet-shadow)",
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

        {/* Preferito (canonico) — il bookmark marca lo STILE che ami, non la tua
            versione su misura (quella si salva dalla scheda ricetta). */}
        <IconButton
          as={motion.button}
          size="md"
          onClick={() => setFav(toggleFavoriteStyle(style.id).includes(style.id))}
          whileTap={{ scale: 0.8 }}
          className="absolute top-3 right-16"
          style={{
            zIndex: 3,
            background: fav
              ? "color-mix(in srgb, var(--primary) 14%, var(--surface-container))"
              : "var(--surface-container)",
            color: fav ? "var(--primary)" : "var(--text-muted)",
            border: `1px solid ${fav ? "color-mix(in srgb, var(--primary) 35%, transparent)" : "var(--outline-variant)"}`,
          }}
          aria-label={fav ? "Rimuovi dai preferiti" : "Aggiungi ai preferiti"}
          aria-pressed={fav}
        >
          <motion.span
            key={String(fav)}
            initial={{ scale: 0.6 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 600, damping: 18 }}
            style={{ display: "inline-flex" }}
          >
            <Bookmark size={15} fill={fav ? "currentColor" : "none"} />
          </motion.span>
        </IconButton>

        {/* Close button */}
        <IconButton
          size="md"
          onClick={onDismiss}
          className="absolute top-3 right-3 active:scale-95 transition-transform"
          style={{ zIndex: 3 }}
          aria-label={cms.ui.closeDetails}
        >
          <X size={15} />
        </IconButton>

        <div className="px-5 sm:px-6 pb-6 pt-9">
          {/* ── Hero media (foto, o video di cottura con blur-in) ── */}
          <div
            className="relative w-full overflow-hidden rounded-2xl"
            style={{ height: "clamp(160px, 38vw, 220px)" }}
          >
            <ImageWithFallback
              src={photo}
              alt={style.name}
              className="absolute inset-0 w-full h-full object-cover"
            />
            {video && <BlurInVideo src={video} />}
            {/* scrim per leggibilità di eventuali badge */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{ background: "linear-gradient(to top, color-mix(in srgb, var(--overlay-backdrop) 62%, transparent), transparent 55%)" }}
            />
          </div>

          {/* ── Title block ── */}
          <div className="mt-3.5">
            <div className="min-w-0">
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
                {formatOrigin(style.origin)}
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
                  ? "color-mix(in srgb, var(--primary) 8%, transparent)"
                  : "transparent",
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
                        /* Etichetta autore: maestro/pizzeria/ente, + firma tecnica. */
                        const who = v.author ?? v.pizzeria ?? v.organization ?? "";
                        const what = v.signature_name ?? "";
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
                            {v.emoji ? `${v.emoji} ` : ""}{who}{what ? ` — ${what}` : ""}
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

          {/* ── VPL-C3: motivazioni di match articolate ── */}
          {matchReasons.length > 0 && (
            <div className="mt-6">
              <h3
                style={{
                  fontSize: "var(--font-size-sm)",
                  fontWeight: "var(--weight-bold)" as any,
                  letterSpacing: "var(--tracking-caps)",
                  textTransform: "uppercase",
                  color: "var(--text-muted)",
                  marginBottom: "var(--space-3)",
                }}
              >
                {pt.sheetMatchTitle}
              </h3>
              <div className="flex flex-col gap-2.5">
                {matchReasons.map((r, i) => {
                  const DimIcon = MATCH_DIMENSION_ICON[r.dim];
                  return (
                    <div key={i} className="flex items-start gap-2.5">
                      <span
                        className="flex items-center justify-center rounded-full shrink-0"
                        style={{
                          width: 24,
                          height: 24,
                          background: "var(--surface-container)",
                          color: "var(--text-accent)",
                          marginTop: 1,
                        }}
                      >
                        <DimIcon size={13} strokeWidth={2.5} aria-hidden="true" />
                      </span>
                      <span
                        style={{
                          fontSize: "var(--font-size-md)",
                          lineHeight: "var(--leading-normal)",
                          color: "var(--text-default)",
                        }}
                      >
                        {r.text}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── CTA — Genera ricetta ── */}
          <CtaButton
            as={motion.button}
            onClick={onGenerate}
            whileHover={{ scale: 1.02 }}
            deepShadow
            className="w-full h-13 mt-6 active:scale-97"
          >
            <Sparkles size={15} />
            {pt.sheetGenerateBtn}
          </CtaButton>
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
