import { useDecorativeMotion } from "../../context/visual-quality-context";
import { RecipeAllergens } from "./recipe-allergens";
import { recipeAllergenScope } from "../../domain/allergen-scope";
import { RecipeReferenceNote } from "./recipe-reference-note";
import { recipeDisplayName, stgDepartures } from "../../domain/recipe-reference";
import { CompatibilityPill } from "./style-card-parts";
import { ScoreExplainer } from "./score-explainer";
import { RecipeChanges } from "./recipe-changes";
import { RecipeVerdictNotice } from "./recipe-verdict-notice";
import { RecipeDietaryAlternatives } from "./recipe-dietary-notice";
import { authorVersionRecipe, canonicalRecipe } from "../../use-cases/recipe-entry";
import { blockerText } from "./blocker-text";
import { recipePresentationState } from "./recipe-card-signals";
import { summarizeVerdict } from "../../domain/verdict-summary";
import { localizeInterpretation } from "../../data/inspiration-i18n/localize";
import React, { useState } from "react";
import { motion, useReducedMotion, AnimatePresence } from "motion/react";
import { motionDelay,motionDuration,motionSpring } from "../../components/ds/motion";
import { Droplets, Wheat, Clock, ChefHat, Sparkles, X, Layers, Ratio, FlaskConical, Eye, EyeOff, Bookmark, AlertTriangle, Info, ExternalLink } from "lucide-react";
import { createPortal } from "react-dom";
import { ImageWithFallback } from "../../components/media/ImageWithFallback";
import { IMAGE_SIZES } from "../../components/media/responsive-images";
import { STYLE_PHOTOS, reasonDimension, MATCH_DIMENSION_ICON, styleDifficultyLabel } from "./recommended-styles";
import { tailoredRecipeEntry, scoreWeightsFromCms } from "./kitchen-compatibility";
import { STYLE_VIDEOS, type StyleVideo } from "../../data/style-photos";
import {
  PizzaStyle,
  PIZZA_FAMILIES,
  STYLES_DB,
  doughThicknessGPerCm2,
  recommendStyles,
  formatOrigin,
  type UserConstraints,
} from "../../domain/pizza-engine";
import { getStyleDeviation, DEVIATION_CATEGORY_LABELS } from "../../domain/deviation-tags";
import { relatedAuthorVersions } from "../../data/interpretation-library";
import {
  getBakingTimeByStyle,
  getDoughBaseByStyle,
  getFoldingByStyle,
  getOvenTempByStyle,
  getSaltByStyle,
} from "../../data/parametric-databases";
import { loadEffectiveKitchen } from "../../hooks/use-profile-defaults";
import { useCms } from "../cms/cms-context";
import { engineMsgTexts } from "./engine-msg-text";
import { createFormatter, placeNameLocalizer, t } from "../cms/i18n";
import { Badge, CtaButton, Disclosure, IconButton } from "../../components/ds/index";
import { useDialogFocus } from "../../components/ds/use-dialog-focus";
import { isFavoriteStyle, toggleFavoriteStyle } from "../../adapters/browser/saved-recipes-storage";
import { uiMessage } from "../../i18n/ui-messages";
import { useDetailLevel } from "../../hooks/use-detail-level";
import { formatNumber, formatRange, formatSeconds, formatUnit, pluralPick } from "../../i18n/format";
import { TermLink } from "../glossary/term-link";

interface StyleDetailSheetProps {
  style: PizzaStyle;
  /** VPL-C3 — vincoli utente per spiegare in modo articolato perché lo stile combacia. */
  constraints?: UserConstraints;
  /** G1b-WP-01: con interpretationId genera la versione d'autore scelta. */
  onGenerate: (toppingId?: string, interpretationId?: string) => void;
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
  const animateDecorations = useDecorativeMotion();
  if (!animateDecorations || prefersSaveData()) return null;
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
  const [isWide, setIsWide] = React.useState(
    () => typeof window !== "undefined" && window.matchMedia("(min-width: 640px)").matches,
  );
  /* FW-03 (S03-B-17): il layout segue rotazione e ridimensionamento, non
     solo il montaggio; l'uscita animata la gestisce AnimatePresence in home. */
  React.useEffect(() => {
    const mql = window.matchMedia("(min-width: 640px)");
    const onChange = () => setIsWide(mql.matches);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);
  const panelRef = useDialogFocus<HTMLDivElement>({ open: true, onClose: onDismiss });

  const rec = React.useMemo(() => {
    if (!constraints) return null;
    return recommendStyles(constraints, { [style.id]: style }, undefined,
      (s, c) => tailoredRecipeEntry(s, c, scoreWeightsFromCms(cms)).recipe)[0];
  }, [constraints, style, cms]);
  const originalRecipe = React.useMemo(() => constraints ? canonicalRecipe(style, constraints, scoreWeightsFromCms(cms)) : null, [constraints, style, cms]);
  const kitchenNow = rec?.recipe.scores.composite ?? null;
  const displayName = rec ? recipeDisplayName(rec.recipe, constraints?.oven_type) : style.name;
  const outsideStg = rec ? stgDepartures(rec.recipe, constraints?.oven_type).length > 0 : false;

  /* VPL-C3: motivazioni di match articolate (lista completa, con dimensione). */
  const matchReasons = React.useMemo(() => {
    if (!rec || rec.tier === "not_feasible") return [];
    const texts = engineMsgTexts(rec.reasons, cms, bcp47);
    return texts.map((text, i) => ({ text, dim: reasonDimension(rec.reasons[i].key) }));
  }, [rec, cms, bcp47]);
  /* FW-10: avvisi senza le ripetizioni del blocco; le condizioni («Se hai…»)
     separate dagli avvisi, e assenti quando lo stile non è fattibile. */
  const matchNotes = React.useMemo(() => {
    if (!rec) return [];
    const summary = summarizeVerdict(rec.recipe.verdict);
    const conditionKeys = new Set(summary.conditions.map((c) => c.message.key));
    const notes = summary.adaptations.map((m) => ({ msg: m, condition: conditionKeys.has(m.key) || m.key.startsWith("need.") }));
    const texts = engineMsgTexts(notes.map((n) => n.msg), cms, bcp47);
    return notes.map((n, i) => ({ text: texts[i], condition: n.condition }));
  }, [rec, cms, bcp47]);
  const notFeasible = rec?.tier === "not_feasible";
  const noteRow = ({ text, condition }: { text: string; condition: boolean }) => (
    <div key={text} className="style-detail-match__row" data-warning={condition ? undefined : "true"} data-tone={condition ? "muted" : undefined} data-condition={condition ? "true" : undefined}>
      <span className="style-detail-match__icon">
        {condition ? <Info size={13} aria-hidden="true" /> : <AlertTriangle size={13} aria-hidden="true" />}
      </span>
      <span className="style-detail-match__text">{text}</span>
    </div>
  );
  const familyName = (cms.families[style.family]?.name ?? PIZZA_FAMILIES[style.family]?.name ?? "");
  const pt = cms.parametricTips;
  const prefersReducedMotion = useReducedMotion();
  /* FW-08 (S03-B-11): con «Dettagli tecnici» attivo la scheda si apre già
     sui dettagli tecnici; il bottone resta per chiuderli o aprirli qui. */
  const { level: detailLevel } = useDetailLevel();
  const [showNerd, setShowNerd] = useState(() => detailLevel === "technical");
  const [fav, setFav] = useState(() => isFavoriteStyle(style.id));

  /* FW-11 (S03-A-17, S03-B-09): numeri, intervalli e unità nella lingua attiva. */
  const hRange = formatRange(style.dough.hydration_pct_range[0], style.dough.hydration_pct_range[1], bcp47, { unit: "percent" });
  const wRange = uiMessage("format.flourW", [formatRange(style.dough.flour_w_range[0], style.dough.flour_w_range[1], bcp47)]);
  const fRange = formatRange(style.dough.fermentation_hours_range[0], style.dough.fermentation_hours_range[1], bcp47, { unit: "hour" });
  const plRange = formatRange(style.dough.flour_pl_range[0], style.dough.flour_pl_range[1], bcp47, { maximumFractionDigits: 2 });
  const thickness = uiMessage("format.gramsPerSquareCm", [formatNumber(doughThicknessGPerCm2(style), bcp47, { maximumFractionDigits: 2 })]);
  const ptext = cms.parametricText;
  const dev = getStyleDeviation(style.id);
  const devCmsLabel = cms.deviationLabels[dev.category] ?? DEVIATION_CATEGORY_LABELS[dev.category].label;
  const devEmoji = DEVIATION_CATEGORY_LABELS[dev.category].emoji;
  /* La causa del blocco descrive le azioni che il blocco disabilita. */
  const blockerId = `style-detail-blocker-${style.id}`;
  /* Budget D-059: solo le tabelle che la scheda mostra. getStyleParametrics
     portava nel bundle anche acqua e maturazione, che nessuna pagina legge. */
  const params = {
    ovenTemp: getOvenTempByStyle(style.id),
    bakingTime: getBakingTimeByStyle(style.id),
    doughBase: getDoughBaseByStyle(style.id),
    salt: getSaltByStyle(style.id),
    folding: getFoldingByStyle(style.id),
  };
  // FW-07 (S03-A-02): per le fritte la temperatura è dell'olio, non del forno.
  const frying = params.ovenTemp?.ovenType === "frittura";
  // FW-07: il nome del forno della cucina effettiva (il modello, se è lo stesso tipo).
  const kitchen = React.useMemo(() => loadEffectiveKitchen(), []);
  const yourOvenName = constraints && kitchen.oven.modelId && kitchen.oven.type === constraints.oven_type
    ? kitchen.oven.label
    : constraints ? (cms.ovenPresets[constraints.oven_type]?.name ?? constraints.oven_type) : "";

  /* CMS-backed description & characteristics */
  const cmsDescription = cms.styleDescriptions[style.id] ?? style.description;
  const cmsChars: string[] = cms.styleChars[style.id]
    ? cms.styleChars[style.id].split("|").map((s: string) => s.trim()).filter(Boolean)
    : style.key_characteristics;

  /* FW-04 (S03-B-08): g/cm² è un carico d'impasto (peso ÷ area), non uno
     spessore; lo spessore in mm viene dai dati del panetto, se ci sono. */
  const thicknessMm = params.doughBase?.thickness_mm;
  const DATA_PILLS: { icon: typeof Droplets; label: string; value: string; termId?: string }[] = [
    { icon: Droplets, label: pt.pillHydration, value: hRange, termId: "hydration" },
    { icon: Wheat, label: pt.pillFlour, value: wRange, termId: "w_alveograph" }, /* FW-13: Flame è il forno */
    { icon: Ratio, label: pt.pillPL, value: plRange, termId: "pl_ratio" },
    /* FW-05 (S03-B-21): «Lievitazione» come in Cosa cambia; un riposo per gli impasti senza lievito. */
    { icon: Clock, label: style.dough.unleavened ? pt.pillRest : pt.pillFermentation, value: fRange },
    { icon: Layers, label: pt.pillDoughLoad, value: thickness, termId: "thickness_factor" },
    ...(thicknessMm ? [{ icon: Layers, label: pt.pillThickness, value: `≈ ${formatUnit(thicknessMm, "millimeter", bcp47)}` }] : []),
    { icon: ChefHat, label: pt.pillLevel, value: styleDifficultyLabel(style, cms) },
    /* FW-06 (S03-A-13, S03-B-20): un profilo «da verificare» non è un dato da
       mostrare, e «Canonico» non sta accanto a «fuori disciplinare». La
       sperimentazione resta fra le informazioni a parte del punteggio. */
    ...(dev.category === "unclassified" || (outsideStg && dev.category === "canonical") ? []
      : [{ icon: FlaskConical, label: pt.pillExperimentation, value: `${devEmoji} ${devCmsLabel}` }]),
  ];

  const generateAction = (placement: "toolbar" | "footer") => (
    <CtaButton
      as={motion.button}
      disabled={rec?.tier === "not_feasible"}
      aria-describedby={notFeasible ? blockerId : undefined}
      onClick={() => onGenerate()}
      whileHover={rec?.tier === "not_feasible" ? undefined : { scale: 1.01 }}
      className={`style-detail-cta style-detail-cta--${placement}`}
    >
      {placement === "footer" && <Sparkles size={15} aria-hidden="true" />}
      {/* FW-14 (S03-A-16): stessa etichetta su ogni breakpoint; «Crea» era il
          nome della tab in cui l'utente si trova già. */}
      {pt.sheetGenerateBtn}
    </CtaButton>
  );

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
        <div className="style-detail-sheet__toolbar">
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

        {generateAction("toolbar")}
        </div>
        <div className="style-detail-sheet__body">
          {/* ── Hero media (foto, o video di cottura con blur-in) ── */}
          <div className="style-detail-media">
            <ImageWithFallback
              src={photo}
              alt={displayName}
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
              {/* Famiglia · origine · punteggio. G1b-WP-02: i «·» li disegna il
                  CSS davanti a ogni voce, così vanno a capo con la voce che segue. */}
              <p className="style-detail-title__meta">
                <span className="style-detail-title__family">
                  {familyName}
                </span>
                <span className="style-detail-title__origin">
                  {formatOrigin(style.origin, placeNameLocalizer(cms))}
                </span>
                {rec && (
                  <span className="style-detail-title__score">
                    <CompatibilityPill context="detail" now={kitchenNow ?? 0} original={originalRecipe?.scores.composite} labelled
                      blocked={rec.recipe.verdict.outcome === "not_feasible"} recipe={rec.recipe} className="style-detail-title__match" />
                  </span>
                )}
              </p>

              {/* Title */}
              <h2 id={`style-detail-title-${style.id}`} className="style-detail-title__heading">
                {displayName}
              </h2>
            </div>
          </div>

          {rec && <RecipeReferenceNote recipe={rec.recipe} oven={constraints?.oven_type} />}

          {/* ── Description ── */}
          <p className="style-detail-sheet__description">
            {outsideStg ? uiMessage("recipe.reference.description") : cmsDescription}
          </p>

          {/* ── Key characteristics ── */}
          <div className="style-detail-chars">
            {(outsideStg ? [] : cmsChars).map((c) => (
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
                {/* G1b: versioni d'autore; il verdetto di ognuna si calcola solo qui. */}
                <AuthorVersions style={style} constraints={constraints} onGenerate={onGenerate} />

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
                            {/* FW-04 (S05-B-06): W, P/L e gli altri termini si aprono nel glossario. */}
                            {pill.termId ? <TermLink termId={pill.termId}>{pill.label}</TermLink> : pill.label}
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
                    <h3 className="style-detail-params__label">
                      {pt.sheetSectionTitle}
                    </h3>
                    {/* FW-07 (S03-A-10): prima la cottura che farai tu, poi il riferimento dello stile. */}
                    {rec && !frying && (
                      <div className="style-detail-params__box" data-region="your-bake">
                        <ParamRow
                          label={pt.sheetYourBakeLabel}
                          value={`${fmt.celsius(rec.recipe.oven_temp_c)} · ${fmt.cookTime(rec.recipe.cook_time_sec)}`}
                          sub={yourOvenName}
                        />
                      </div>
                    )}
                    <div className="style-detail-params__box">
                      {params.ovenTemp && (
                        <ParamRow
                          label={frying ? pt.sheetOilLabel : pt.sheetOvenLabel}
                          value={`${fmt.celsius(params.ovenTemp.idealTemp_c)} (${fmt.celsius(params.ovenTemp.minTemp_c)}–${fmt.celsius(params.ovenTemp.maxTemp_c)})`}
                          sub={frying ? pt.sheetOilHeat : t(pt.sheetOvenPreheat, { min: params.ovenTemp.preheatingMin })}
                        />
                      )}
                      {params.bakingTime && (
                        <ParamRow
                          label={pt.sheetBakeLabel}
                          value={formatSeconds(params.bakingTime.idealSeconds, bcp47)}
                          sub={frying
                            ? pt.sheetFryTurn
                            : params.bakingTime.turns > 0
                              ? pluralPick(params.bakingTime.turns, bcp47, {
                                  one: uiMessage("recipe.sheet.rotationsOne", [params.bakingTime.turns]),
                                  other: uiMessage("recipe.sheet.rotationsOther", [params.bakingTime.turns]),
                                })
                              : pt.sheetBakeNoTurns}
                        />
                      )}
                      {params.doughBase && (
                        <ParamRow
                          label={pt.sheetDoughLabel}
                          value={fmt.grams(params.doughBase.ballWeight_g)}
                          sub={ptext?.stretch?.[style.id] ?? params.doughBase.stretchMethod}
                        />
                      )}
                      {params.salt && (
                        <ParamRow
                          label={pt.sheetSaltLabel}
                          value={`${fmt.percent(params.salt.saltPct)} ${ptext?.saltType?.[params.salt.saltType] ?? params.salt.saltType}`}
                          sub={ptext?.saltTiming?.[params.salt.additionTiming] ?? params.salt.additionTiming}
                        />
                      )}
                      {params.folding && params.folding.foldCount > 0 && (
                        <ParamRow
                          label={pt.sheetFoldLabel}
                          value={`${params.folding.foldCount}× ${ptext?.fold?.[params.folding.foldType] ?? params.folding.foldType.replace("_", " ")}`}
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
                {cms.tiers[rec.tier].label}
              </h3>
              {constraints && !frying && (
                <p className="style-detail-match__text">
                  {yourOvenName}
                  {" · "}{fmt.celsius(constraints.oven_max_temp_c)}
                </p>
              )}
              {/* G1b-WP-02: con un esito bloccante la lista va in una colonna (CSS). */}
              <div className="style-detail-match__list" data-verdict={rec.tier}>
                {notFeasible && constraints && (
                  <RecipeVerdictNotice recipe={rec.recipe} constraints={constraints} mealDeadline={constraints.meal_deadline === true} embedded showRecipeBelow={false} reasonId={blockerId}
                    details={matchNotes.length > 0 ? <div className="style-detail-match__list">{matchNotes.map(noteRow)}</div> : undefined} />
                )}
                {constraints && <RecipeDietaryAlternatives recipe={rec.recipe} constraints={constraints} onSelect={id => onGenerate(id)} />}
                {!notFeasible && matchNotes.map(noteRow)}
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
              {/* FW-06 (S02-B-09, S07-B-03): il numero spiegato, a richiesta. */}
              <Disclosure variant="inline" className="style-detail-match__score"
                summary={cms.ui.recipeScore}
                meta={<strong className="type-numeric">{fmt.number(rec.recipe.scores.composite)}/100</strong>}>
                <ScoreExplainer scores={rec.recipe.scores} recipe={rec.recipe} />
              </Disclosure>
            </div>
          )}

          {rec && <RecipeAllergens report={rec.recipe.allergens} scope={recipeAllergenScope(rec.recipe).scope} />}
          {rec && originalRecipe && !notFeasible && (
            <RecipeChanges from={originalRecipe} to={rec.recipe} mode="included" />
          )}

        </div>
        <div className="style-detail-sheet__footer">
          {generateAction("footer")}
        </div>
      </motion.div>
    </div>
  );

  return createPortal(sheet, document.body);
}

/* ── Versioni d'autore (G1b-WP-01): voci che si aprono su firma tecnica,
   storia e fonte, e si generano in Crea. Ognuna dice se è fattibile con la
   cucina dell'utente: il verdetto è quello della ricetta che apre in Crea
   (authorVersionRecipe), calcolato solo quando il blocco è visibile. ── */
function AuthorVersions({ style, constraints, onGenerate }: Pick<StyleDetailSheetProps, "style" | "constraints" | "onGenerate">) {
  const { cms, bcp47 } = useCms();
  const pt = cms.parametricTips;
  const versions = React.useMemo(() => relatedAuthorVersions(style.id).map((entry) => ({ ...entry,
    recipe: constraints && authorVersionRecipe(style, entry.interpretation, constraints, scoreWeightsFromCms(cms)) })),
  [style, constraints, cms]);
  if (!versions.length) return null;
  return (
    <section className="style-detail-techniques" aria-labelledby={`style-detail-techniques-${style.id}`}>
      {/* FW-12 (S03-B-24): sezioni h3 sotto il titolo h2 del pannello. */}
      <h3 id={`style-detail-techniques-${style.id}`} className="style-detail-techniques__label">
        {pt.sheetTechniquesLabel}
      </h3>
      <ul className="style-detail-techniques__list">
        {versions.map(({ interpretation, relation, recipe }) => {
          const v = localizeInterpretation(interpretation, cms.inspirationI18n);
          /* Chi: maestro/pizzeria/ente; poi la firma e, se viene da un altro stile, da quale. */
          const who = v.author ?? v.pizzeria ?? v.organization ?? "";
          const from = relation === "compatible"
            ? t(pt.sheetTechniqueFrom, { style: STYLES_DB[v.base_style_id]?.name ?? v.base_style_id })
            : undefined;
          const source = v.url ?? v.process_profile?.source_url;
          const hintId = `style-detail-version-${v.id}-hint`;
          /* Stesso esito e stesse parole della match card del risultato che la
             versione apre: «Fattibile», «Da verificare», «Così non è fattibile». */
          const state = recipe && recipePresentationState(recipe);
          const blocked = state === "blocked";
          const primary = recipe && blocked ? summarizeVerdict(recipe.verdict).primary : undefined;
          return (
            <li key={v.id} className="style-detail-techniques__item">
              <Disclosure variant="inline" summary={
                <span className="style-detail-techniques__summary">
                  <span className="style-detail-techniques__who">
                    {v.emoji && <span aria-hidden="true">{v.emoji} </span>}{who}
                  </span>
                  {v.signature_name && <span className="style-detail-techniques__what">{v.signature_name}</span>}
                  {from && <span className="style-detail-techniques__from">{from}</span>}
                  {state && (
                    <span className="style-detail-techniques__what">
                      <Badge tone={blocked ? "error" : state === "ready" ? "success" : "muted"}>
                        {blocked ? cms.ui.verdictTitle : engineMsgTexts([state === "ready"
                          ? { key: "card.ready", fallback: "Fattibile" } : { key: "card.toVerify", fallback: "Da verificare" }], cms, bcp47)[0]}
                      </Badge>
                    </span>
                  )}
                </span>
              }>
                {v.technique_signature && <p className="style-detail-techniques__text">{v.technique_signature}</p>}
                <p className="style-detail-techniques__text">{v.story}</p>
                <p className="style-detail-techniques__actions">
                  <CtaButton variant="secondary" radius="lg" elevated={false}
                    className="style-detail-techniques__generate"
                    disabled={blocked}
                    aria-describedby={primary ? hintId : undefined}
                    onClick={() => onGenerate(undefined, v.id)}>
                    <Sparkles size={14} aria-hidden="true" />
                    {pt.sheetTechniqueGenerate}
                  </CtaButton>
                  {primary && <span id={hintId} className="style-detail-techniques__hint">{blockerText(primary, cms, bcp47)}</span>}
                  {source && (
                    <a href={source} target="_blank" rel="noopener noreferrer" className="style-detail-techniques__source">
                      {pt.sheetTechniqueSource}
                      <span className="style-detail-techniques__host">{new URL(source).hostname.replace(/^www\./, "")}</span>
                      <ExternalLink size={13} aria-hidden="true" />
                    </a>
                  )}
                </p>
              </Disclosure>
            </li>
          );
        })}
      </ul>
    </section>
  );
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


