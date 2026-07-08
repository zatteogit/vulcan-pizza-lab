import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useReducedMotion, useSpring, useTransform } from "motion/react";
import { Bookmark, BookmarkCheck, Heart, HeartCrack, HeartHandshake, HeartPulse, HeartOff, Info, SlidersHorizontal, Sparkles, TriangleAlert } from "lucide-react";
import { SCORE_DIMENSIONS, resolveEngineMsgs, type RecipeScores, type ScoreDimensionKey } from "../../domain/pizza-engine";
import { useCms } from "../cms/cms-context";
import { createFormatter, t } from "../cms/i18n";

type RecipeMatchMode = "canonical" | "adapted" | "lab";

/** Icona cuore per stato di match — 5 stati distinti (audit role-play giugno 2026). */
type MatchIconKey = "handshake" | "heart" | "pulse" | "crack" | "off";

/** Copy CMS per fascia di match (cms.cooking.matchTones). */
interface MatchToneCopy {
  title: string;
  canonical: string;
  adapted: string;
}
interface MatchTonesCopy {
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
  onPersonalize,
  onSave,
  onOptimize,
  dirty = false,
  optimizationRationale,
  ceiling,
  hardLimited,
  softNeeds,
  saved = false,
  nerdMode = false,
  className = "",
}: {
  scores: RecipeScores;
  ovenTemp: number;
  idealTemp: number;
  minTemp: number;
  mode?: RecipeMatchMode;
  /** "Personalizza": apre il dialog dei parametri (sostituisce la vecchia
   *  leva "Regola a mano" — le azioni vivono tutte sulla match card). */
  onPersonalize?: () => void;
  onSave?: () => void;
  /** "Ottimizza per me": cerca i parametri migliori per il setup dell'utente. */
  onOptimize?: () => void;
  /** La ricetta È stata modificata rispetto all'originale (parametri diversi
   *  da quelli che "Torna all'originale" ripristinerebbe). Solo allora hanno
   *  senso — e compaiono — Salva e Torna all'originale. */
  dirty?: boolean;
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
  /** Nerd mode: mostra anche gli assi secondari pesati (sostenibilità,
   *  sperimentazione) e la scomposizione numerica del composite. */
  nerdMode?: boolean;
  className?: string;
}) {
  const { cms, bcp47 } = useCms();
  const fmt = createFormatter(cms.ui, bcp47);
  /* Audit fruibilità luglio 2026: la card nasce COMPATTA (icona, punteggio,
     tono e azioni). Barre punteggio, stato forno e rationale arrivano a
     richiesta: erano una schermata intera prima degli ingredienti. */
  const [expanded, setExpanded] = useState(false);
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

  // Learn-inline (audit lug 2026): ogni asse è tappabile → spiegazione dal CMS.
  // In nerd compaiono anche gli assi secondari pesati e la scomposizione numerica:
  // il composite del motore è la media pesata dei 5 assi (pesi CMS, rinormalizzati),
  // quindi la formula mostrata usa gli STESSI pesi passati a generateRecipe.
  const [explainKey, setExplainKey] = useState<ScoreDimensionKey | null>(null);
  const NERD_EXTRA_DIMENSIONS = [
    { key: "sustainability" as const, label: "Sostenibilità", short: "Sos", color: "var(--secondary)", weight: 0 },
    { key: "experimentation" as const, label: "Sperimentazione", short: "Spe", color: "var(--text-accent)", weight: 0 },
  ];
  const axes = [...SCORE_DIMENSIONS, ...(nerdMode ? NERD_EXTRA_DIMENSIONS : [])]
    .map((dimension) => ({
      ...dimension,
      label: cms.scoreDimensions[dimension.key]?.label ?? dimension.label,
      shortLabel: cms.scoreDimensions[dimension.key]?.short ?? dimension.short,
      value: scores[dimension.key],
      weight: cms.scoreDimensions[dimension.key]?.weight ?? dimension.weight,
      explain: cms.scoreDimensions[dimension.key]?.explain,
    }))
    // Gli assi secondari compaiono solo se pesano davvero sul composite.
    .filter((axis) => SCORE_DIMENSIONS.some((d) => d.key === axis.key) || axis.weight > 0);
  const totalWeight = axes.reduce((sum, axis) => sum + axis.weight, 0);
  const weightedAxes = totalWeight > 0
    ? axes
        .filter((axis) => axis.weight > 0)
        .map((axis) => ({ ...axis, weightPct: Math.round((axis.weight / totalWeight) * 100) }))
    : [];
  const explainedAxis = explainKey ? axes.find((axis) => axis.key === explainKey) : undefined;

  const roundedScore = Math.round(scores.composite);

  // Il guadagno NON vive più sulla label del bottone ("Ottimizza per me +6"):
  // quando il punteggio SALE (ottimizzazione, ritocco riuscito) un "+Δ" verde
  // spunta accanto al numero e svanisce — feedback nel momento, non promessa
  // nel pulsante (Matteo, 3 lug 2026).
  const prevScoreRef = useRef(roundedScore);
  const [scoreBump, setScoreBump] = useState<{ delta: number; id: number } | null>(null);
  useEffect(() => {
    const prev = prevScoreRef.current;
    prevScoreRef.current = roundedScore;
    if (roundedScore <= prev) return;
    const id = Date.now();
    setScoreBump({ delta: roundedScore - prev, id });
    const timer = window.setTimeout(
      () => setScoreBump((bump) => (bump?.id === id ? null : bump)),
      1800,
    );
    return () => window.clearTimeout(timer);
  }, [roundedScore]);

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
      // A soffitto raggiunto "per arrivare a X" non ha senso (ci sei già):
      // il punteggio mostrato ASSUME l'acquisto (fix 4 lug 2026, nota Matteo).
      headroomLine = {
        tone: "accent",
        text: atCeiling
          ? t(cms.cooking.ceilingNeedsAtCeiling ?? "Questa versione assume: {needs}.", {
              needs: needs.join(", "),
            })
          : t(cms.cooking.ceilingNeeds, { ceiling: ceilingRounded, needs: needs.join(", ") }),
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
  /* Redesign lug 2026 (nota Matteo): azioni SEMPRE presenti = Ottimizza +
     Personalizza. Salva e Torna all'originale compaiono SOLO quando la
     ricetta è davvero cambiata (dirty) — e Torna, azione distruttiva, ha
     il peso visivo minore di tutte (testo muto, in coda). */
  const showSaveAction = dirty && Boolean(onSave);

  return (
    <motion.section
      layout
      data-region="card"
      className={`relative w-full ${className}`}
      aria-label={cms.ui.recipeScore}
    >
      {/* ═══ Verdetto editoriale (redesign lug 2026, round 5) ═══
          Il Match È un verdetto da guida gastronomica: punteggio in serifa,
          tono in corsivo — "85/100 · Ottima intesa" come su una guida.
          Niente scatola: kicker con filetto, stessa grammatica di
          Ingredienti. Dettagli (copy, forno, barre) a richiesta. */}
      <div className="flex items-center gap-2">
        <MatchIcon
          size={14}
          fill="currentColor"
          style={{ color: tone.low ? "var(--text-warning)" : "var(--primary)", flexShrink: 0 }}
          aria-hidden="true"
        />
        <span
          style={{
            color: "var(--text-muted)",
            fontSize: "var(--font-size-xs)",
            fontWeight: "var(--weight-semibold)" as any,
            letterSpacing: "var(--tracking-caps)",
            textTransform: "uppercase",
            lineHeight: 1,
          }}
        >
          Match
        </span>
        <span
          className="flex-1 h-px"
          style={{ background: "var(--container-border-subtle)" }}
          aria-hidden="true"
        />
      </div>

      {/* Verdetto: numero serifa + tono corsivo, stesso baseline. */}
      <div className="mt-2.5 flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
        <span className="flex items-baseline flex-shrink-0">
          <AnimatedScore
            value={roundedScore}
            style={{
              fontFamily: "var(--font-serif)",
              color: "var(--text-default)",
              fontSize: "clamp(var(--font-size-7xl), 6vw, var(--font-size-8xl))",
              fontWeight: "var(--weight-bold)" as any,
              lineHeight: 1,
            }}
          />
          <span
            className="type-numeric ml-1"
            style={{
              color: "var(--text-muted)",
              fontSize: "var(--font-size-sm)",
              fontWeight: "var(--weight-semibold)" as any,
            }}
          >
            /100
          </span>
          <AnimatePresence>
            {scoreBump && (
              <motion.span
                key={scoreBump.id}
                initial={{ opacity: 0, y: 5, scale: 0.9 }}
                animate={{ opacity: 1, y: -3, scale: 1 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ type: "spring", stiffness: 380, damping: 26 }}
                className="type-numeric ml-1.5"
                style={{
                  color: "var(--cta)",
                  fontSize: "var(--font-size-md)",
                  fontWeight: "var(--weight-bold)" as any,
                }}
                aria-hidden="true"
              >
                +{scoreBump.delta}
              </motion.span>
            )}
          </AnimatePresence>
        </span>
        <span
          className="min-w-0"
          style={{
            fontFamily: "var(--font-serif)",
            fontStyle: "italic",
            color: "var(--text-default)",
            fontSize: "clamp(var(--font-size-2xl), 3vw, var(--font-size-5xl))",
            fontWeight: "var(--weight-semibold)" as any,
            lineHeight: "var(--leading-compact)",
          }}
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={tone.title}
              className="block"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
            >
              {tone.title}
            </motion.span>
          </AnimatePresence>
        </span>
        {/* I dettagli si aprono da un'iconcina ⓘ accanto al tono (nota
            Matteo): prossimità massima con ciò che spiega. */}
        <button
          type="button"
          onClick={() =>
            setExpanded((v) => {
              if (v) setExplainKey(null);
              return !v;
            })
          }
          aria-expanded={expanded}
          aria-label={
            expanded
              ? (cms.cooking.matchDetailsHide ?? "Nascondi")
              : (cms.cooking.matchDetails ?? "Dettagli")
          }
          title={
            expanded
              ? (cms.cooking.matchDetailsHide ?? "Nascondi")
              : (cms.cooking.matchDetails ?? "Dettagli")
          }
          className="inline-flex flex-shrink-0 self-center p-1 active:scale-90 transition-all"
          style={{
            background: "transparent",
            border: "none",
            cursor: "pointer",
            color: expanded ? "var(--text-accent)" : "var(--icon-muted)",
            lineHeight: 1,
          }}
        >
          <Info size={16} />
        </button>
      </div>

      {/* Avvisi onesti: visibili anche a card chiusa */}
      {unviableText && !(headroomLine && (headroomLine.tone === "warn" || headroomLine.tone === "muted")) && (
        <p
          className="text-left"
          style={{
            margin: "8px 0 0",
            color: "var(--text-warning)",
            fontSize: "var(--font-size-sm)",
            lineHeight: "var(--leading-normal)",
            fontWeight: "var(--weight-semibold)" as any,
          }}
        >
          {unviableText}
        </p>
      )}
      {/* Riga-soffitto SEMPRE visibile ("Puoi arrivare a {ceiling}…") —
          round 4, nota Matteo: è la promessa che dà senso a "Ottimizza". */}
      {headroomLine && (
        <p
          className="text-left"
          style={{
            margin: "8px 0 0",
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

      {/* ── Dettagli a richiesta: stato forno, barre punteggio, rationale ── */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            key="match-details"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 380, damping: 32 }}
            className="overflow-hidden"
          >
            {/* Copy emotivo del tono: apre il pannello. */}
            <div
              className="mt-3 pt-3"
              style={{ borderTop: "1px solid var(--container-border-subtle)" }}
            >
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
            </div>

            <div
              className="mt-3 flex items-start gap-1.5"
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

            {/* VPL-C4: barre con label ESTESA; quando non entrano sulla riga, vanno a
             * capo (flex-wrap + min-width che contiene il nome pieno) invece di
             * comprimersi in sigle criptiche. */}
            <div className="flex flex-wrap gap-x-4 gap-y-3 mt-3 w-full">
              {axes.map((axis) => (
                <ScoreBar
                  key={axis.key}
                  label={axis.label}
                  displayLabel={axis.label}
                  value={axis.value}
                  color={axis.color}
                  compact
                  explainable={Boolean(axis.explain)}
                  explained={explainKey === axis.key}
                  onToggleExplain={() =>
                    setExplainKey((k) => (k === axis.key ? null : axis.key))
                  }
                />
              ))}
            </div>

            {/* Learn-inline: spiegazione dell'asse selezionato, sotto la riga
             * delle barre (mai dentro il flex-wrap: non sposta le colonne). */}
            <AnimatePresence initial={false} mode="wait">
              {explainedAxis?.explain && (
                <motion.div
                  key={explainedAxis.key}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 380, damping: 32 }}
                  className="overflow-hidden"
                >
                  <div
                    className="mt-2.5 rounded-xl px-3 py-2.5"
                    style={{
                      background: "color-mix(in srgb, var(--container-bg-high) 70%, transparent)",
                      border: "1px solid var(--container-border-subtle)",
                    }}
                  >
                    <div
                      className="flex items-baseline gap-2"
                      style={{
                        color: "var(--text-default)",
                        fontSize: "var(--font-size-sm)",
                        fontWeight: "var(--weight-bold)" as any,
                      }}
                    >
                      <span style={{ color: explainedAxis.color }}>{explainedAxis.label}</span>
                      {nerdMode && (() => {
                        const weighted = weightedAxes.find((axis) => axis.key === explainedAxis.key);
                        return weighted ? (
                          <span
                            className="type-numeric"
                            style={{
                              color: "var(--text-muted)",
                              fontSize: "var(--font-size-xs)",
                              fontWeight: "var(--weight-semibold)" as any,
                            }}
                          >
                            {t(cms.cooking.matchAxisWeight ?? "peso {pct}% del Match", { pct: weighted.weightPct })}
                          </span>
                        ) : null;
                      })()}
                    </div>
                    <p
                      style={{
                        margin: "4px 0 0",
                        color: "var(--text-muted)",
                        fontSize: "var(--font-size-sm)",
                        lineHeight: "var(--leading-normal)",
                      }}
                    >
                      {explainedAxis.explain}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Scomposizione numerica (nerd): stessi pesi passati al motore,
             * rinormalizzati — la somma è il Match mostrato (±1 di rounding). */}
            {nerdMode && weightedAxes.length > 0 && (
              <p
                className="type-numeric mt-2.5"
                style={{
                  margin: "10px 0 0",
                  color: "var(--text-muted)",
                  fontSize: "var(--font-size-xs)",
                  lineHeight: "var(--leading-normal)",
                  fontFeatureSettings: "'tnum'",
                }}
              >
                {cms.cooking.matchBreakdownLabel ?? "Media pesata"}:{" "}
                {weightedAxes
                  .map((axis) => `${axis.shortLabel} ${Math.round(axis.value)}·${axis.weightPct}%`)
                  .join(" + ")}
                {" ≈ "}
                <span style={{ color: "var(--text-default)", fontWeight: "var(--weight-semibold)" as any }}>
                  {roundedScore}
                </span>
              </p>
            )}

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
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-4 flex w-full flex-wrap items-center gap-3">
        {onOptimize && (
          <motion.button
            type="button"
            onClick={onOptimize}
            whileHover={{ scale: 1.025, y: -1 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", stiffness: 450, damping: 28 }}
            className="inline-flex items-center justify-center gap-2 rounded-full px-4 py-2.5"
            style={{
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
            {tone.low ? cms.cooking.makePossible : cms.cooking.optimizeForMe}
          </motion.button>
        )}
        {/* Gerarchia (redesign lug 2026, round 2): UN solo pulsante pieno
            (Ottimizza). Personalizza e Salva sono azioni testuali in accento —
            niente scatole in competizione; Torna resta il peso minimo in coda. */}
        {onPersonalize && (
          <motion.button
            type="button"
            onClick={onPersonalize}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center justify-center gap-1.5 rounded-full px-1 py-2.5"
            style={{
              background: "transparent",
              border: "none",
              color: "var(--primary)",
              cursor: "pointer",
              fontSize: "var(--font-size-sm)",
              fontWeight: "var(--weight-semibold)" as any,
              lineHeight: "var(--leading-tight)",
            }}
          >
            <SlidersHorizontal size={14} />
            {cms.ui.personalize ?? "Personalizza"}
          </motion.button>
        )}
        <AnimatePresence initial={false}>
          {showSaveAction && (
            <motion.button
              key="save"
              type="button"
              onClick={onSave}
              aria-pressed={saved}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center justify-center gap-1.5 rounded-full px-1 py-2.5"
              style={{
                background: "transparent",
                border: "none",
                color: saved ? "var(--primary)" : "var(--text-accent)",
                cursor: "pointer",
                fontSize: "var(--font-size-sm)",
                fontWeight: "var(--weight-semibold)" as any,
                lineHeight: "var(--leading-tight)",
              }}
            >
              {saved ? <BookmarkCheck size={14} /> : <Bookmark size={14} />}
              {saved ? cms.cooking.savedVersion : cms.cooking.saveVersion}
            </motion.button>
          )}
        </AnimatePresence>
      </div>



    </motion.section>
  );
}

function ScoreBar({
  label,
  displayLabel,
  value,
  color,
  compact = false,
  explainable = false,
  explained = false,
  onToggleExplain,
}: {
  label: string;
  displayLabel?: string;
  value: number;
  color: string;
  compact?: boolean;
  /** Learn-inline: la barra è tappabile e apre la spiegazione dell'asse. */
  explainable?: boolean;
  explained?: boolean;
  onToggleExplain?: () => void;
}) {
  const rounded = Math.round(value);
  const Wrapper = explainable ? "button" : "div";
  return (
    <Wrapper
      {...(explainable
        ? { type: "button" as const, onClick: onToggleExplain, "aria-expanded": explained }
        : {})}
      className={`${compact ? "grow shrink-0 basis-[140px] min-w-[140px]" : "min-w-[148px] flex-1"} ${
        explainable ? "text-left active:scale-98 transition-transform" : ""
      }`}
      style={explainable ? { background: "transparent", border: "none", padding: 0, cursor: "pointer" } : undefined}
    >
      <div
        className="flex items-center justify-between gap-2"
        style={{
          color: explained ? "var(--text-default)" : "var(--text-muted)",
          fontSize: compact ? "var(--font-size-xs)" : "var(--font-size-sm)",
          fontWeight: "var(--weight-semibold)" as any,
          lineHeight: "var(--leading-tight)",
        }}
      >
        <span className="inline-flex items-center gap-1" title={label} aria-label={label}>
          {compact ? displayLabel ?? label : label}
          {explainable && (
            <Info size={11} aria-hidden="true" style={{ opacity: explained ? 0.9 : 0.55, flexShrink: 0 }} />
          )}
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
    </Wrapper>
  );
}
