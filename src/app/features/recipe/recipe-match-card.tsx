import { useEffect } from "react";
import { motion, AnimatePresence, useReducedMotion, useSpring, useTransform } from "motion/react";
import { Bookmark, BookmarkCheck, Heart, HeartCrack, HeartHandshake, HeartPulse, HeartOff, RotateCcw, Sparkles, TriangleAlert } from "lucide-react";
import { SCORE_DIMENSIONS, resolveEngineMsgs, type RecipeScores } from "../../domain/pizza-engine";
import { useCms } from "../cms/cms-context";
import { createFormatter, t } from "../cms/i18n";
import { Surface } from "../../components/ds/index";

export type RecipeMatchMode = "canonical" | "adapted" | "lab";

/** Icona cuore per stato di match — 5 stati distinti (audit role-play giugno 2026). */
export type MatchIconKey = "handshake" | "heart" | "pulse" | "crack" | "off";

/** Copy CMS per fascia di match (cms.cooking.matchTones). */
export interface MatchToneCopy {
  title: string;
  canonical: string;
  adapted: string;
}
export interface MatchTonesCopy {
  t90: MatchToneCopy;
  t75: MatchToneCopy;
  t60: MatchToneCopy;
  t40: MatchToneCopy;
  t0: MatchToneCopy;
}

/* Fallback italiani — usati solo se il chiamante non passa il copy CMS. */
const TONE_FALLBACKS: Record<
  keyof MatchTonesCopy,
  MatchToneCopy & { low: boolean; icon: MatchIconKey }
> = {
  t90: {
    title: "Amore a prima vista",
    canonical: "La canonica e la tua cucina parlano già la stessa lingua.",
    adapted: "Questa versione è nata per il tuo setup.",
    low: false,
    icon: "handshake",
  },
  t75: {
    title: "Ottima intesa",
    canonical: "Qualche micro-compromesso, ma la scintilla c'è.",
    adapted: "Pochi aggiustamenti, tanta sostanza.",
    low: false,
    icon: "heart",
  },
  t60: {
    title: "Ci vuole un po' di corteggiamento",
    canonical: "Si può fare bene: sblocchiamola e Vulcan sistema tempi e cottura.",
    adapted: "La ricetta funziona, ma chiede un minimo di attenzione.",
    low: false,
    icon: "pulse",
  },
  t40: {
    title: "Per le cose buone ci vuole tempo",
    canonical: "La ricetta è seria: meglio adattarla al tuo forno prima di provarci.",
    adapted: "Buona direzione, ma serve ancora qualche compromesso.",
    low: true,
    icon: "crack",
  },
  t0: {
    title: "Cuore spezzato",
    canonical: "Bellissima, ma oggi chiede più fuoco di quello che hai. La rendiamo possibile?",
    adapted: "Troppo per questo setup: alleggeriamo tempi, forno o ambizione.",
    low: true,
    icon: "off",
  },
};

export function matchTone(score: number, mode: RecipeMatchMode, tones?: MatchTonesCopy) {
  const band: keyof MatchTonesCopy =
    score >= 90 ? "t90" : score >= 75 ? "t75" : score >= 60 ? "t60" : score >= 40 ? "t40" : "t0";
  const fallback = TONE_FALLBACKS[band];
  const copy = tones?.[band];
  return {
    title: copy?.title ?? fallback.title,
    body:
      mode === "canonical"
        ? (copy?.canonical ?? fallback.canonical)
        : (copy?.adapted ?? fallback.adapted),
    low: fallback.low,
    icon: fallback.icon,
  };
}

/* ═══ ANIMATED SCORE — il numero "rolla" verso il valore con una spring.
   Al mount parte da 0 (rivelazione), poi insegue ogni ricalcolo. Con
   prefers-reduced-motion salta direttamente al valore. tnum evita jitter. */
function AnimatedScore({ value, style }: { value: number; style?: React.CSSProperties }) {
  const prefersReducedMotion = useReducedMotion();
  const spring = useSpring(prefersReducedMotion ? value : 0, {
    stiffness: 90,
    damping: 22,
  });
  useEffect(() => {
    if (prefersReducedMotion) spring.jump(value);
    else spring.set(value);
  }, [value, spring, prefersReducedMotion]);
  const display = useTransform(spring, (v) => String(Math.round(v)));
  return (
    <motion.span
      className="type-numeric inline-block"
      style={{ ...style, fontFeatureSettings: "'tnum'" }}
    >
      {display}
    </motion.span>
  );
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
  onOptimize,
  optimizationRationale,
  ceiling,
  hardLimited,
  softNeeds,
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
  /** "Ottimizza per me": cerca i parametri migliori per il setup dell'utente. */
  onOptimize?: () => void;
  /** Rationale dell'ultima ottimizzazione (stringhe già risolte) da mostrare. */
  optimizationRationale?: string[];
  /** Soffitto: composite della ricetta OTTIMIZZATA per i vincoli dell'utente —
   *  il massimo raggiungibile. Abilita i "due livelli": +Δ sul pulsante, riga
   *  onesta sul margine, e il verdetto "non vale la pena" se < 40. */
  ceiling?: number;
  /** Limite HARD: il forno non raggiunge lo stile (viabilità termica < 1). Abbassa
   *  il soffitto → messaggio di resa/redirect, non "lista della spesa". */
  hardLimited?: boolean;
  /** Limiti SOFT acquisibili (farina/lievito non in dispensa): non abbassano il
   *  soffitto ma sono precondizioni per raggiungerlo → "ti serve X". */
  softNeeds?: string[];
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

  // Audit role-play giugno 2026: per gli stili ad alta temperatura sotto il
  // minimo, il motore emette un warning netto ("non otterrai una vera X").
  // Lo rendiamo qui — prima era calcolato ma mai mostrato.
  const unviableWarning = scores.warnings?.find((w) => w.key === "feas.thermalUnviable");
  const unviableText = unviableWarning
    ? resolveEngineMsgs([unviableWarning], cms.engineMessages)[0]
    : null;

  const axes = SCORE_DIMENSIONS.map((dimension) => ({
    ...dimension,
    label: cms.scoreDimensions[dimension.key]?.label ?? dimension.label,
    shortLabel: cms.scoreDimensions[dimension.key]?.short ?? dimension.short,
    value: scores[dimension.key],
  }));

  const roundedScore = Math.round(scores.composite);

  // ── Due livelli: match corrente vs SOFFITTO (M_o) ───────────────────────────
  // Audit role-play giugno 2026. Il soffitto è il massimo raggiungibile ottimizzando.
  // Δ = quanto guadagni con un tap. Soglia onesta 40 SUL SOFFITTO: se anche al
  // massimo sei sotto 40 → "non vale la pena" (sotto 40 fallisci su ≥2 assi, non è
  // una "buona pizza solo non autentica"). Il muro quasi sempre è il forno.
  const ceilingRounded = ceiling != null ? Math.round(ceiling) : null;
  const headroom = ceilingRounded != null ? Math.max(0, ceilingRounded - roundedScore) : 0;
  const ovenIsWall = hardLimited ?? false;
  const needs = softNeeds ?? [];
  const atCeiling = headroom < 2;
  // Cascata di messaggi HARD/SOFT/path-aware (audit role-play giugno 2026).
  // Priorità: muro hard < cap hard < buco soft (lista spesa) < margine da ottimizzare
  //           < rassicurazione path-aware < compromesso generico.
  let headroomLine: { text: string; tone: "warn" | "accent" | "muted" | "ok" } | null = null;
  if (ceilingRounded != null) {
    if (ceilingRounded < 40) {
      // HARD: anche al massimo è sotto soglia → non vale la pena.
      headroomLine = {
        tone: "warn",
        text: t(ovenIsWall ? cms.cooking.ceilingUnviableOven : cms.cooking.ceilingUnviable, {
          ceiling: ceilingRounded,
        }),
      };
    } else if (ovenIsWall && ceilingRounded < 65) {
      // HARD: il forno è il tetto, ma una pizza la fai → compromesso onesto.
      headroomLine = {
        tone: "muted",
        text: t(cms.cooking.ceilingOvenWall, { ceiling: ceilingRounded }),
      };
    } else if (needs.length > 0) {
      // SOFT: lista della spesa — la ricetta mostrata assume qualcosa che non hai.
      headroomLine = {
        tone: "accent",
        text: t(cms.cooking.ceilingNeeds, { ceiling: ceilingRounded, needs: needs.join(", ") }),
      };
    } else if (headroom >= 8 && onOptimize) {
      // Hai tutto: basta ottimizzare.
      headroomLine = { tone: "accent", text: t(cms.cooking.ceilingOptimize, { ceiling: ceilingRounded }) };
    } else if (atCeiling && mode === "canonical" && ceilingRounded >= 60) {
      // PATH-AWARE: sei sul canonico e regge col tuo setup.
      headroomLine = { tone: "ok", text: cms.cooking.ceilingCanonicalOk };
    } else if (ceilingRounded < 60) {
      headroomLine = { tone: "muted", text: t(cms.cooking.ceilingCompromise, { ceiling: ceilingRounded }) };
    }
  }

  const tone = matchTone(roundedScore, mode, cms.cooking.matchTones);
  const MATCH_ICONS = {
    handshake: HeartHandshake,
    heart: Heart,
    pulse: HeartPulse,
    crack: HeartCrack,
    off: HeartOff,
  } as const;
  const MatchIcon = MATCH_ICONS[tone.icon];
  // Un solo "movimento in avanti" verso su-misura: quando l'ottimizzatore è
  // disponibile, è LUI l'azione (subentra al vecchio "adatta alla cucina", che era
  // il midpoint ricalibrato — dominato dall'ottimo). Evita il doppio pulsante.
  const showAdaptAction = mode === "canonical" && Boolean(onAdapt) && !onOptimize;
  const showResetAction = mode !== "canonical" && Boolean(onReset);
  const showSaveAction = mode !== "canonical" && Boolean(onSave);
  const actionLabel = tone.low ? cms.cooking.makePossible : cms.cooking.adaptToKitchen;

  return (
    <Surface
      as={motion.aside}
      layout
      className={`relative w-full max-w-[900px] overflow-hidden rounded-3xl px-4 py-4 sm:px-5 sm:py-5 ${className}`}
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
              <AnimatedScore
                value={roundedScore}
                style={{
                  color: "var(--text-default)",
                  fontSize: "var(--font-size-4xl)",
                  fontWeight: "var(--weight-bold)" as any,
                  lineHeight: 1.1,
                }}
              />
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
          {unviableText && !(headroomLine && (headroomLine.tone === "warn" || headroomLine.tone === "muted")) && (
            <p
              className="mt-1.5 text-left"
              style={{
                margin: "6px 0 0",
                color: "var(--text-warning)",
                fontSize: "var(--font-size-sm)",
                lineHeight: "var(--leading-normal)",
                fontWeight: "var(--weight-semibold)" as any,
              }}
            >
              {unviableText}
            </p>
          )}
          {headroomLine && (
            <p
              className="mt-1.5 text-left"
              style={{
                margin: "6px 0 0",
                color:
                  headroomLine.tone === "warn"
                    ? "var(--text-warning)"
                    : headroomLine.tone === "accent" || headroomLine.tone === "ok"
                      ? "var(--cta)"
                      : "var(--text-muted)",
                fontSize: "var(--font-size-sm)",
                lineHeight: "var(--leading-normal)",
                fontWeight:
                  headroomLine.tone === "muted"
                    ? ("var(--weight-medium)" as any)
                    : ("var(--weight-semibold)" as any),
              }}
            >
              {headroomLine.text}
            </p>
          )}
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
                {cms.cooking.resetToOriginal}
              </motion.button>
            )}
          </AnimatePresence>
          {onOptimize && (
            <motion.button
              type="button"
              onClick={onOptimize}
              whileHover={{ scale: 1.025, y: -1 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: "spring", stiffness: 450, damping: 28 }}
              className="inline-flex items-center justify-center gap-2 rounded-full px-4 py-2.5"
              style={{
                alignSelf: "flex-start",
                background: "var(--cta)",
                color: "var(--cta-foreground)",
                border: "none",
                cursor: "pointer",
                fontSize: "var(--font-size-sm)",
                fontWeight: "var(--weight-bold)" as any,
                lineHeight: "var(--leading-tight)",
                boxShadow: "0 10px 22px color-mix(in srgb, var(--cta) 22%, transparent)",
              }}
            >
              <Sparkles size={15} />
              {tone.low ? cms.cooking.makePossible : cms.cooking.optimizeForMe}{headroom >= 2 ? ` +${headroom}` : ""}
            </motion.button>
          )}
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
              {saved ? cms.cooking.savedVersion : cms.cooking.saveVersion}
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

      {optimizationRationale && optimizationRationale.length > 0 && (
        <div
          className="mt-3 pt-3 w-full"
          style={{ borderTop: "1px solid var(--container-border-subtle)" }}
        >
          <div className="flex items-center gap-1.5 mb-1.5" style={{ color: "var(--cta)" }}>
            <Sparkles size={14} />
            <span style={{ fontSize: "var(--font-size-sm)", fontWeight: "var(--weight-bold)" as any }}>
              {cms.cooking.optimizedForSetup}
            </span>
          </div>
          <ul className="flex flex-col gap-1">
            {optimizationRationale.map((reason, i) => (
              <li
                key={i}
                style={{
                  fontSize: "var(--font-size-sm)",
                  color: "var(--text-muted)",
                  lineHeight: "var(--leading-normal)",
                }}
              >
                • {reason}
              </li>
            ))}
          </ul>
        </div>
      )}
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
