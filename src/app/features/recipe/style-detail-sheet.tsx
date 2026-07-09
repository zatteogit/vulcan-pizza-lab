import React, { useState } from "react";
import { motion, useReducedMotion, AnimatePresence } from "motion/react";
import { Droplets, Flame, Clock, ChefHat, Sparkles, X, Layers, Ratio, FlaskConical, Eye, EyeOff, Bookmark, Heart } from "lucide-react";
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
      className={`style-detail-media__video${ready ? " style-detail-media__video--ready" : ""}`}
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

  // Pin #15: lock body scroll when sheet is open
  React.useEffect(() => {
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, []);

  const rec = React.useMemo(() => {
    if (!constraints) return null;
    return recommendStyles(constraints).find((r) => r.style.id === style.id);
  }, [constraints, style.id]);

  /* VPL-C3: motivazioni di match articolate (lista completa, con dimensione). */
  const matchReasons = React.useMemo(() => {
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
  }, [rec, cms.engineMessages, cms.ui, bcp47]);
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
    <div className="style-detail-sheet__portal">
      {/* Backdrop — subtle, dismissible */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        onClick={onDismiss}
        className="style-detail-sheet__backdrop"
      />

      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        className="style-detail-sheet__panel"
      >
        {/* Preferito (canonico) — il bookmark marca lo STILE che ami, non la tua
            versione su misura (quella si salva dalla scheda ricetta). */}
        <IconButton
          as={motion.button}
          size="md"
          variant="bare"
          onClick={() => setFav(toggleFavoriteStyle(style.id).includes(style.id))}
          whileTap={{ scale: 0.8 }}
          className={`style-detail-sheet__fav-btn${fav ? " style-detail-sheet__fav-btn--active" : ""}`}
          aria-label={fav ? "Rimuovi dai preferiti" : "Aggiungi ai preferiti"}
          aria-pressed={fav}
        >
          <motion.span
            key={String(fav)}
            initial={{ scale: 0.6 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 600, damping: 18 }}
            className="style-detail-sheet__fav-icon"
          >
            <Bookmark size={15} fill={fav ? "currentColor" : "none"} />
          </motion.span>
        </IconButton>

        {/* Close button */}
        <IconButton
          size="md"
          onClick={onDismiss}
          className="style-detail-sheet__close-btn"
          aria-label={cms.ui.closeDetails}
        >
          <X size={15} />
        </IconButton>

        <div className="style-detail-sheet__body">
          {/* ── Hero media (foto, o video di cottura con blur-in) ── */}
          <div className="style-detail-media">
            <ImageWithFallback
              src={photo}
              alt={style.name}
              className="style-detail-media__img"
            />
            {video && <BlurInVideo src={video} />}
            {/* scrim per leggibilità di eventuali badge */}
            <div className="style-detail-media__scrim" />
          </div>

          {/* ── Title block ── */}
          <div className="style-detail-title">
            <div className="style-detail-title__inner">
              {/* Family label */}
              <span className="style-detail-title__family">
                {familyName}
              </span>
              <span className="style-detail-title__dot">
                ·
              </span>
              <span className="style-detail-title__origin">
                {formatOrigin(style.origin)}
              </span>

              {rec && rec.tier !== "not_feasible" && (
                <>
                  <span className="style-detail-title__dot">
                    ·
                  </span>
                  <span className="style-detail-title__match">
                    <Heart size={10} fill="currentColor" aria-hidden="true" />
                    {rec.compatibilityScore}% Match
                  </span>
                </>
              )}

              {/* Title */}
              <h3 className="style-detail-title__heading">
                {style.name}
              </h3>
            </div>
          </div>

          {/* ── Description ── */}
          <p className="style-detail-sheet__description">
            {cmsDescription}
          </p>

          {/* ── Key characteristics ── */}
          <div className="style-detail-chars">
            {cmsChars.map((c) => (
              <span key={c} className="style-detail-chars__chip">
                {c}
              </span>
            ))}
          </div>

          {/* ── Nerd toggle — show/hide technical details ── */}
          <div className="style-detail-nerd">
            <motion.button
              onClick={() => setShowNerd(!showNerd)}
              className={`style-detail-nerd__toggle${showNerd ? " style-detail-nerd__toggle--active" : ""}`}
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
                className="style-detail-nerd__panel"
              >
                {/* ── Author variants — compatible methods ── */}
                {compatVariants.length > 0 && (
                  <div className="style-detail-techniques">
                    <span className="style-detail-techniques__label">
                      {pt.sheetTechniquesLabel}
                    </span>
                    <div className="style-detail-techniques__list">
                      {compatVariants.map((v) => {
                        /* Etichetta autore: maestro/pizzeria/ente, + firma tecnica. */
                        const who = v.author ?? v.pizzeria ?? v.organization ?? "";
                        const what = v.signature_name ?? "";
                        return (
                          <span key={v.id} className="style-detail-techniques__chip">
                            {v.emoji ? `${v.emoji} ` : ""}{who}{what ? ` — ${what}` : ""}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* ── Data pills — quick-glance parameters ── */}
                <div className="style-detail-pills">
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
                        className="style-detail-pills__item"
                      >
                        <PillIcon size={13} className="style-detail-pills__icon" />
                        <div className="style-detail-pills__text">
                          <div className="style-detail-pills__label">
                            {pill.label}
                          </div>
                          <div className="style-detail-pills__value">
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
                    className="style-detail-params"
                  >
                    <span className="style-detail-params__label">
                      {pt.sheetSectionTitle}
                    </span>
                    <div className="style-detail-params__box">
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
            <div className="style-detail-match">
              <h3 className="style-detail-match__heading">
                {pt.sheetMatchTitle}
              </h3>
              <div className="style-detail-match__list">
                {matchReasons.map((r, i) => {
                  const DimIcon = MATCH_DIMENSION_ICON[r.dim];
                  return (
                    <div key={i} className="style-detail-match__row">
                      <span className="style-detail-match__icon">
                        <DimIcon size={13} strokeWidth={2.5} aria-hidden="true" />
                      </span>
                      <span className="style-detail-match__text">
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
            className="style-detail-cta"
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
    <div className="style-detail-param-row">
      <div className="style-detail-param-row__label">
        {label}
      </div>
      <div className="style-detail-param-row__value">
        {value}
      </div>
      <div className="style-detail-param-row__sub">
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
