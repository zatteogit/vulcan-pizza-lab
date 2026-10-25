import { localizeInterpretation } from "../../data/inspiration-i18n/localize";
import React, { useState } from "react";
import { motion, useReducedMotion, AnimatePresence } from "motion/react";
import { motionDelay,motionDuration,motionSpring } from "../../components/ds/motion";
import { Droplets, Flame, Clock, ChefHat, Sparkles, X, Layers, Ratio, FlaskConical, Eye, EyeOff, Bookmark, Gauge, AlertTriangle } from "lucide-react";
import { createPortal } from "react-dom";
import { ImageWithFallback } from "../../components/media/ImageWithFallback";
import { IMAGE_SIZES } from "../../components/media/responsive-images";
import { STYLE_PHOTOS, reasonDimension, MATCH_DIMENSION_ICON, styleDifficultyLabel } from "./recommended-styles";
import { kitchenCompatibility, scoreWeightsFromCms } from "./kitchen-compatibility";
import { STYLE_VIDEOS, type StyleVideo } from "../../data/style-photos";
import {
  PizzaStyle,
  PIZZA_FAMILIES,
  doughThicknessGPerCm2,
  recommendStyles,
  formatOrigin,
  type UserConstraints,
} from "../../domain/pizza-engine";
import { getStyleDeviation, DEVIATION_CATEGORY_LABELS } from "../../domain/deviation-tags";
import { getInterpretationsForStyle } from "../../data/interpretation-library";
import { getStyleParametrics } from "../../data/parametric-databases";
import { useCms } from "../cms/cms-context";
import { engineMsgTexts } from "./engine-msg-text";
import { createFormatter, t } from "../cms/i18n";
import { CtaButton, IconButton } from "../../components/ds/index";
import { useDialogFocus } from "../../components/ds/use-dialog-focus";
import { isFavoriteStyle, toggleFavoriteStyle } from "../../adapters/browser/saved-recipes-storage";
import { uiMessage } from "../../i18n/ui-messages";

interface StyleDetailSheetProps {
  style: PizzaStyle;
  /** VPL-C3 — vincoli utente per spiegare in modo articolato perché lo stile combacia. */
  constraints?: UserConstraints;
  onGenerate: () => void;
  onDismiss: () => void;
}

/* VPL: video di cottura che sfuma in ingresso sopra la foto-poster (effetto wow).
 * BUN-1: preload="metadata" e poster WebP (primo fotogramma). Con autoPlay il
 * browser scarica comunque il video, ma solo quando la scheda è aperta.
 * D-034 (P-5c): i video sono un esperimento, il più leggeri possibile: clip
 * da 8 s a 480p senza audio (2,6 MB in tutto), e niente video con «riduci
 * movimento» o col risparmio dati: resta la foto sotto. */
function prefersSaveData(): boolean {
  const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
  return Boolean(connection?.saveData);
}

function BlurInVideo({ src, poster }: StyleVideo) {
  const [ready, setReady] = useState(false);
  const reduceMotion = useReducedMotion();
  if (reduceMotion || prefersSaveData()) return null;
  return (
    <video
      src={src}
      poster={poster}
      muted
      loop
      playsInline
      autoPlay
      preload="metadata"
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
  const fmt = createFormatter(cms.ui, bcp47);

  /* Nota di Matteo (24/10/2026): con la scheda aperta la pagina sotto non
     deve scorrere. Prima si bloccava il body, ma la pagina scorre su <html>:
     ora il blocco condiviso dei dialoghi (html.ds-dialog-open). Da 640 px la
     scheda è una card centrata, non un foglio largo quanto lo schermo. */
  const [isWide] = React.useState(
    () => typeof window !== "undefined" && window.matchMedia("(min-width: 640px)").matches,
  );
  const panelRef = useDialogFocus<HTMLDivElement>({ open: true, onClose: onDismiss });

  const rec = React.useMemo(() => {
    if (!constraints) return null;
    return recommendStyles(constraints, { [style.id]: style })[0];
  }, [constraints, style]);
  /* D-041: lo stesso numero delle card e della ricetta aperta. */
  const kitchenNow = React.useMemo(
    () => (constraints ? kitchenCompatibility(style, constraints, scoreWeightsFromCms(cms)).now : null),
    [constraints, style, cms],
  );

  /* VPL-C3: motivazioni di match articolate (lista completa, con dimensione). */
  const matchReasons = React.useMemo(() => {
    if (!rec || rec.tier === "not_feasible") return [];
    const texts = engineMsgTexts(rec.reasons, cms, bcp47);
    return texts.map((text, i) => ({ text, dim: reasonDimension(rec.reasons[i].key) }));
  }, [rec, cms, bcp47]);
  const matchWarnings = React.useMemo(
    () => engineMsgTexts(rec?.warnings ?? [], cms, bcp47),
    [rec, cms, bcp47],
  );
  const familyName = (cms.families[style.family]?.name ?? PIZZA_FAMILIES[style.family]?.name ?? "");
  const pt = cms.parametricTips;
  const prefersReducedMotion = useReducedMotion();
  const [showNerd, setShowNerd] = useState(false);
  const [fav, setFav] = useState(() => isFavoriteStyle(style.id));

  const hRange = `${style.dough.hydration_pct_range[0]}–${style.dough.hydration_pct_range[1]}%`;
  const wRange = `W ${style.dough.flour_w_range[0]}–${style.dough.flour_w_range[1]}`;
  const fRange = `${style.dough.fermentation_hours_range[0]}–${style.dough.fermentation_hours_range[1]}h`;
  const plRange = `${style.dough.flour_pl_range[0]}–${style.dough.flour_pl_range[1]}`;
  const thickness = `${doughThicknessGPerCm2(style).toFixed(2)} g/cm²`;
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
    { icon: ChefHat, label: pt.pillLevel, value: styleDifficultyLabel(style, cms) },
    { icon: FlaskConical, label: pt.pillExperimentation, value: `${devEmoji} ${devCmsLabel}` },
  ];

  const sheet = (
    <div className="style-detail-sheet__portal">
      {/* Backdrop — subtle, dismissible */}
      <motion.button
        type="button"
        aria-label={cms.ui.closeDetails}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={motionSpring.standard}
        onClick={onDismiss}
        className="style-detail-sheet__backdrop border-0 p-0"
      />

      <motion.div
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby={`style-detail-title-${style.id}`}
        initial={isWide ? { y: 24, opacity: 0 } : { y: "100%" }}
        animate={isWide ? { y: 0, opacity: 1 } : { y: 0 }}
        exit={isWide ? { y: 24, opacity: 0 } : { y: "100%" }}
        transition={motionSpring.standard}
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
          aria-label={fav ? uiMessage("features.recipe.style-detail-sheet.rimuovi-dai-preferiti-7f61dbbb") : uiMessage("features.recipe.style-detail-sheet.aggiungi-ai-preferiti-b5037a86")}
          aria-pressed={fav}
        >
          <motion.span
            key={String(fav)}
            initial={{ scale: 0.6 }}
            animate={{ scale: 1 }}
            transition={motionSpring.radioMark}
            className="style-detail-sheet__fav-icon"
          >
            <Bookmark size={15} fill={fav ? "currentColor" : "none"} />
          </motion.span>
        </IconButton>

        {/* Close button — stessa apparenza `bare` del fav: entrambi i controlli
            in overlay condividono chrome e stati via `.style-detail-sheet__*`. */}
        <IconButton
          size="md"
          variant="bare"
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
              sizes={IMAGE_SIZES.full}
              className="style-detail-media__img"
            />
            {video && <BlurInVideo src={video.src} poster={video.poster} />}
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
                  <span
                    className="style-detail-title__match"
                    aria-label={uiMessage("pages.explore.compatibility", [kitchenNow ?? 0])}
                  >
                    <Gauge size={10} aria-hidden="true" />
                    {uiMessage("features.recipe.style-detail-sheet.match-a3424e8a", [kitchenNow ?? 0])}</span>
                </>
              )}

              {/* Title */}
              <h3 id={`style-detail-title-${style.id}`} className="style-detail-title__heading">
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
              type="button"
              aria-expanded={showNerd}
              onClick={() => setShowNerd(!showNerd)}
              className={`style-detail-nerd__toggle${showNerd ? " style-detail-nerd__toggle--active" : ""}`}
            >
              {showNerd ? <EyeOff size={13} /> : <Eye size={13} />}
              {showNerd ? uiMessage("features.recipe.style-detail-sheet.nascondi-dettagli-tecnici-5ce27cbc") : uiMessage("features.recipe.style-detail-sheet.mostra-dettagli-tecnici-73357a85")}
            </motion.button>
          </div>

          {/* ── Technical details — hidden by default ── */}
          <AnimatePresence>
            {showNerd && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={motionSpring.responsiveSoft}
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
                        const what = localizeInterpretation(v, cms.inspirationI18n).signature_name ?? "";
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
                        transition={prefersReducedMotion ? { duration: motionDuration.reduced } : {
                          ...motionSpring.crispDisclosure,
                          delay: motionDelay.feedback + idx * motionDelay.micro,
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
                    transition={prefersReducedMotion ? { duration: motionDuration.reduced } : {
                      ...motionSpring.highlightedMatch,
                      delay: motionDelay.pageDecision,
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
                          value={`${fmt.celsius(params.ovenTemp.idealTemp_c)} (${fmt.celsius(params.ovenTemp.minTemp_c)}–${fmt.celsius(params.ovenTemp.maxTemp_c)})`}
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
                          value={fmt.grams(params.doughBase.ballWeight_g)}
                          sub={params.doughBase.stretchMethod}
                        />
                      )}
                      {params.salt && (
                        <ParamRow
                          label={pt.sheetSaltLabel}
                          value={`${fmt.percent(params.salt.saltPct)} ${params.salt.saltType}`}
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
          {rec && (
            <div className="style-detail-match">
              <h3 className="style-detail-match__heading">
                {rec.tier === "not_feasible" ? cms.ui.verdictTitle : cms.ui.recipeScore}
              </h3>
              {constraints && (
                <p className="style-detail-match__text">
                  {cms.ovenPresets[constraints.oven_type]?.name ?? constraints.oven_type}
                  {" · "}{fmt.celsius(constraints.oven_max_temp_c)}
                </p>
              )}
              <div className="style-detail-match__list">
                {matchWarnings.map((text) => (
                  <div key={text} className="style-detail-match__row" data-warning="true">
                    <span className="style-detail-match__icon">
                      <AlertTriangle size={13} aria-hidden="true" />
                    </span>
                    <span className="style-detail-match__text">{text}</span>
                  </div>
                ))}
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
            disabled={rec?.tier === "not_feasible"}
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
