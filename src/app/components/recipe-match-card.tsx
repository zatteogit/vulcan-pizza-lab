import { motion, AnimatePresence } from "motion/react";
import { Bookmark, BookmarkCheck, Heart, HeartCrack, RotateCcw, TriangleAlert } from "lucide-react";
import { SCORE_DIMENSIONS, type RecipeScores } from "./pizza-engine";
import { useCms } from "./cms/cms-context";
import { createFormatter } from "./cms/i18n";
import { Surface } from "./ds";

export type RecipeMatchMode = "canonical" | "adapted" | "lab";

export function matchTone(score: number, mode: RecipeMatchMode) {
  if (score >= 90) {
    return {
      title: "Amore a prima vista",
      body:
        mode === "canonical"
          ? "La canonica e la tua cucina parlano già la stessa lingua."
          : "Questa versione è nata per il tuo setup.",
      low: false,
    };
  }
  if (score >= 75) {
    return {
      title: "Ottima intesa",
      body:
        mode === "canonical"
          ? "Qualche micro-compromesso, ma la scintilla c'è."
          : "Pochi aggiustamenti, tanta sostanza.",
      low: false,
    };
  }
  if (score >= 60) {
    return {
      title: "Ci vuole un po' di corteggiamento",
      body:
        mode === "canonical"
          ? "Si può fare bene: sblocchiamola e Vulcan sistema tempi e cottura."
          : "La ricetta funziona, ma chiede un minimo di attenzione.",
      low: false,
    };
  }
  if (score >= 40) {
    return {
      title: "Per le cose buone ci vuole tempo",
      body:
        mode === "canonical"
          ? "La ricetta è seria: meglio adattarla al tuo forno prima di provarci."
          : "Buona direzione, ma serve ancora qualche compromesso.",
      low: true,
    };
  }
  return {
    title: "Cuore spezzato",
    body:
      mode === "canonical"
        ? "Bellissima, ma oggi chiede più fuoco di quello che hai. La rendiamo possibile?"
        : "Troppo per questo setup: alleggeriamo tempi, forno o ambizione.",
    low: true,
  };
}

export function RecipeMatchCard({
  scores,
  ovenTemp,
  idealTemp,
  minTemp,
  mode = "adapted",
  onAdapt,
  onReset,
  onSave,
  saved = false,
  className = "",
}: {
  scores: RecipeScores;
  ovenTemp: number;
  idealTemp: number;
  minTemp: number;
  mode?: RecipeMatchMode;
  onAdapt?: () => void;
  onReset?: () => void;
  onSave?: () => void;
  saved?: boolean;
  className?: string;
}) {
  const { cms, bcp47 } = useCms();
  const fmt = createFormatter(cms.ui, bcp47);
  const ovenGap = idealTemp - ovenTemp;
  const ovenStatus =
    ovenGap <= 0
      ? cms.cooking.ovenOptimal
      : ovenTemp >= minTemp
        ? cms.cooking.ovenLimited
        : cms.cooking.ovenNeedsAdaptation;

  const axes = SCORE_DIMENSIONS.map((dimension) => ({
    ...dimension,
    label: cms.scoreDimensions[dimension.key]?.label ?? dimension.label,
    shortLabel: cms.scoreDimensions[dimension.key]?.short ?? dimension.short,
    value: scores[dimension.key],
  }));

  const roundedScore = Math.round(scores.composite);
  const tone = matchTone(roundedScore, mode);
  const MatchIcon = tone.low ? HeartCrack : Heart;
  const showAdaptAction = mode === "canonical" && Boolean(onAdapt);
  const showResetAction = mode !== "canonical" && Boolean(onReset);
  const showSaveAction = mode !== "canonical" && Boolean(onSave);
  const actionLabel = tone.low ? "Rendila possibile" : "Adatta alla mia cucina";

  return (
    <Surface
      as={motion.aside}
      layout
      className={`relative w-full max-w-[900px] overflow-hidden rounded-[1.65rem] px-4 py-4 sm:px-5 sm:py-5 ${className}`}
      style={{
        background:
          "color-mix(in srgb, var(--container-page) 88%, transparent)",
        border: "1px solid var(--container-border)",
        boxShadow:
          "0 16px 42px color-mix(in srgb, var(--shadow-color) 9%, transparent), inset 0 1px 0 color-mix(in srgb, var(--overlay-text) 18%, transparent)",
        backdropFilter: "blur(18px) saturate(1.35)",
        WebkitBackdropFilter: "blur(18px) saturate(1.35)",
      }}
      aria-label={cms.ui.recipeScore}
    >
      <div className="relative w-full flex flex-col gap-4 text-left lg:flex-row lg:items-center lg:gap-5">
        <div className="flex items-center gap-3 min-w-[174px]">
          <motion.span
            className="relative flex items-center justify-center rounded-full"
            animate={{ scale: [1, tone.low ? 1.015 : 1.035, 1] }}
            transition={{ duration: tone.low ? 2.8 : 3.4, repeat: Infinity, ease: "easeInOut" }}
            style={{
              width: 52,
              height: 52,
              background: "color-mix(in srgb, var(--primary) 10%, var(--container-page))",
              color: tone.low ? "var(--text-warning)" : "var(--primary)",
              border: "1px solid color-mix(in srgb, var(--primary) 16%, var(--container-border-subtle))",
              boxShadow: "0 9px 22px color-mix(in srgb, var(--shadow-color) 8%, transparent)",
            }}
          >
            <MatchIcon size={23} fill="currentColor" />
          </motion.span>
          <div>
            <span
              className="block"
              style={{
                color: "var(--text-muted)",
                fontSize: "var(--font-size-xs)",
                fontWeight: "var(--weight-semibold)" as any,
                letterSpacing: "var(--tracking-spread)",
                textTransform: "uppercase",
                lineHeight: 1,
              }}
            >
              Match
            </span>
            <div className="flex items-baseline">
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={roundedScore}
                  className="type-numeric inline-block"
                  initial={{ opacity: 0.3, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0.3, y: -5 }}
                  transition={{ type: "spring", stiffness: 380, damping: 26 }}
                  style={{
                    color: "var(--text-default)",
                    fontSize: "var(--font-size-4xl)",
                    fontWeight: "var(--weight-bold)" as any,
                    lineHeight: 1.1,
                  }}
                >
                  {roundedScore}
                </motion.span>
              </AnimatePresence>
              <span
                className="type-numeric ml-0.5"
                style={{
                  color: "var(--text-muted)",
                  fontSize: "var(--font-size-md)",
                  fontWeight: "var(--weight-semibold)" as any,
                }}
              >
                /100
              </span>
            </div>
          </div>
        </div>

        <div
          className="flex-1 min-w-0"
          style={{
            color: "var(--text-muted)",
            fontSize: "var(--font-size-md)",
            lineHeight: "var(--leading-normal)",
          }}
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={tone.title}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              <div
                style={{
                  color: "var(--text-default)",
                  fontSize: "var(--font-size-lg)",
                  fontWeight: "var(--weight-semibold)" as any,
                  lineHeight: "var(--leading-tight)",
                  marginBottom: 2,
                }}
              >
                {tone.title}
              </div>
              <p
                style={{
                  margin: 0,
                  color: "var(--text-muted)",
                  fontSize: "var(--font-size-md)",
                  lineHeight: "var(--leading-normal)",
                }}
              >
                {tone.body}
              </p>
            </motion.div>
          </AnimatePresence>
          <div
            className="mt-2 flex items-start gap-1.5"
            style={{
              color: ovenGap > 0 ? "var(--text-muted)" : "var(--text-accent)",
            }}
          >
            {ovenGap > 0 && (
              <TriangleAlert
                size={14}
                style={{ color: "var(--text-warning)", marginTop: 2, flexShrink: 0 }}
                aria-hidden="true"
              />
            )}
            <span className="type-numeric text-left" style={{ fontSize: "var(--font-size-md)" }}>
              {ovenStatus}: {fmt.celsius(ovenTemp)}
              {ovenGap > 0 ? ` · ${cms.ui.statIdeal} ${fmt.celsius(idealTemp)}` : ""}
            </span>
          </div>
        </div>

        <div className="flex shrink-0 flex-col gap-2 lg:items-end min-h-[44px] justify-center">
          <AnimatePresence mode="wait" initial={false}>
            {showAdaptAction && (
              <motion.button
                key="adapt"
                layoutId="match-card-action"
                type="button"
                onClick={onAdapt}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                whileHover={{ scale: 1.025, y: -1 }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: "spring", stiffness: 450, damping: 28 }}
                className="inline-flex items-center justify-center gap-2 rounded-full px-4 py-2.5"
                style={{
                  alignSelf: "flex-start",
                  background:
                    "color-mix(in srgb, var(--primary) 8%, var(--container-page))",
                  border: "1px solid color-mix(in srgb, var(--primary) 20%, var(--container-border))",
                  color: "var(--primary)",
                  cursor: "pointer",
                  fontSize: "var(--font-size-sm)",
                  fontWeight: "var(--weight-bold)" as any,
                  lineHeight: "var(--leading-tight)",
                  boxShadow: "0 10px 22px color-mix(in srgb, var(--primary) 9%, transparent)",
                }}
              >
                <Heart size={15} fill="currentColor" />
                {actionLabel}
              </motion.button>
            )}
            {showResetAction && (
              <motion.button
                key="reset"
                layoutId="match-card-action"
                type="button"
                onClick={onReset}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                whileHover={{ scale: 1.025, y: -1 }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: "spring", stiffness: 450, damping: 28 }}
                className="inline-flex items-center justify-center gap-1.5 rounded-full px-3.5 py-2"
                style={{
                  alignSelf: "flex-start",
                  background: "color-mix(in srgb, var(--container-page) 76%, transparent)",
                  border: "1px solid var(--container-border-subtle)",
                  color: "var(--text-accent)",
                  cursor: "pointer",
                  fontSize: "var(--font-size-sm)",
                  fontWeight: "var(--weight-semibold)" as any,
                  lineHeight: "var(--leading-tight)",
                }}
              >
                <RotateCcw size={14} />
                Torna all'originale
              </motion.button>
            )}
          </AnimatePresence>
          {showSaveAction && (
            <button
              type="button"
              onClick={onSave}
              aria-pressed={saved}
              className="inline-flex items-center justify-center gap-1.5 rounded-full px-3.5 py-2 active:scale-95 transition-transform"
              style={{
                alignSelf: "flex-start",
                background: saved
                  ? "color-mix(in srgb, var(--primary) 12%, var(--container-page))"
                  : "color-mix(in srgb, var(--container-page) 76%, transparent)",
                border: saved
                  ? "1px solid color-mix(in srgb, var(--primary) 30%, var(--container-border))"
                  : "1px solid var(--container-border-subtle)",
                color: saved ? "var(--primary)" : "var(--text-accent)",
                cursor: "pointer",
                fontSize: "var(--font-size-sm)",
                fontWeight: "var(--weight-semibold)" as any,
                lineHeight: "var(--leading-tight)",
              }}
            >
              {saved ? <BookmarkCheck size={14} /> : <Bookmark size={14} />}
              {saved ? "Salvata nel ricettario" : "Salva la mia versione"}
            </button>
          )}
        </div>
      </div>

      {/* VPL-C4: barre con label ESTESA; quando non entrano sulla riga, vanno a
       * capo (flex-wrap + min-width che contiene il nome pieno) invece di
       * comprimersi in sigle criptiche. */}
      <div
        className="flex flex-wrap gap-x-4 gap-y-3 mt-3.5 pt-3 w-full"
        style={{ borderTop: "1px solid var(--container-border-subtle)" }}
      >
        {axes.map((axis) => (
          <ScoreBar
            key={axis.key}
            label={axis.label}
            displayLabel={axis.label}
            value={axis.value}
            color={axis.color}
            compact
          />
        ))}
      </div>
    </Surface>
  );
}

function ScoreBar({
  label,
  displayLabel,
  value,
  color,
  compact = false,
}: {
  label: string;
  displayLabel?: string;
  value: number;
  color: string;
  compact?: boolean;
}) {
  const rounded = Math.round(value);
  return (
    <div className={compact ? "grow shrink-0 basis-[140px] min-w-[140px]" : "min-w-[148px] flex-1"}>
      <div
        className="flex items-center justify-between gap-2"
        style={{
          color: "var(--text-muted)",
          fontSize: compact ? "var(--font-size-xs)" : "var(--font-size-sm)",
          fontWeight: "var(--weight-semibold)" as any,
          lineHeight: "var(--leading-tight)",
        }}
      >
        <span title={label} aria-label={label}>
          {compact ? displayLabel ?? label : label}
        </span>
        <span className="type-numeric">{rounded}</span>
      </div>
      <div
        className={compact ? "mt-1 h-1.5 rounded-full overflow-hidden" : "mt-1.5 h-2 rounded-full overflow-hidden"}
        style={{ background: "var(--container-bg-high)" }}
      >
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${rounded}%` }}
          transition={{ type: "spring", stiffness: 240, damping: 26 }}
          className="h-full rounded-full"
          style={{ background: color }}
        />
      </div>
    </div>
  );
}
