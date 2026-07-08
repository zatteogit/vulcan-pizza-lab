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

/* Fasce del messaggio-soffitto: mappa letterale tono→modifier (mai template
   dinamico) — stesso pattern di MATCH_ICONS più sotto. */
const HEADROOM_TONE_CLASS = {
  warn: "match-notice--warn",
  accent: "match-notice--accent",
  muted: "match-notice--muted",
  ok: "match-notice--ok",
} as const;

/* ═══ ANIMATED SCORE — il numero "rolla" verso il valore con una spring.
   Al mount parte da 0 (rivelazione), poi insegue ogni ricalcolo. Con
   prefers-reduced-motion salta direttamente al valore. tnum evita jitter. */
function AnimatedScore({ value }: { value: number }) {
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
    <motion.span className="type-numeric match-score-value">
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
      className={`match-card ${className}`}
      aria-label={cms.ui.recipeScore}
    >
      {/* ═══ Verdetto editoriale (redesign lug 2026, round 5) ═══
          Il Match È un verdetto da guida gastronomica: punteggio in serifa,
          tono in corsivo — "85/100 · Ottima intesa" come su una guida.
          Niente scatola: kicker con filetto, stessa grammatica di
          Ingredienti. Dettagli (copy, forno, barre) a richiesta. */}
      <div className="match-kicker">
        <MatchIcon
          size={14}
          fill="currentColor"
          className={`match-kicker__icon ${tone.low ? "match-kicker__icon--warn" : "match-kicker__icon--primary"}`}
          aria-hidden="true"
        />
        <span className="match-kicker__label">Match</span>
        <span className="match-kicker__rule" aria-hidden="true" />
      </div>

      {/* Verdetto: numero serifa + tono corsivo, stesso baseline. */}
      <div className="match-verdict">
        <span className="match-score-group">
          <AnimatedScore value={roundedScore} />
          <span className="type-numeric match-score-suffix">
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
                className="type-numeric match-score-bump"
                aria-hidden="true"
              >
                +{scoreBump.delta}
              </motion.span>
            )}
          </AnimatePresence>
        </span>
        <span className="match-tone">
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={tone.title}
              className="match-tone__text"
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
          className={`match-info-toggle${expanded ? " match-info-toggle--active" : ""}`}
        >
          <Info size={16} />
        </button>
      </div>

      {/* Avvisi onesti: visibili anche a card chiusa */}
      {unviableText && !(headroomLine && (headroomLine.tone === "warn" || headroomLine.tone === "muted")) && (
        <p className="match-notice match-notice--warn">
          {unviableText}
        </p>
      )}
      {/* Riga-soffitto SEMPRE visibile ("Puoi arrivare a {ceiling}…") —
          round 4, nota Matteo: è la promessa che dà senso a "Ottimizza". */}
      {headroomLine && (
        <p className={`match-notice ${HEADROOM_TONE_CLASS[headroomLine.tone]}`}>
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
            className="match-details"
          >
            {/* Copy emotivo del tono: apre il pannello. */}
            <div className="match-details__intro">
              <p className="match-details__body">
                {tone.body}
              </p>
            </div>

            <div className={`match-oven ${ovenGap > 0 ? "match-oven--gap" : "match-oven--ready"}`}>
              {ovenGap > 0 && (
                <TriangleAlert
                  size={14}
                  className="match-oven__alert-icon"
                  aria-hidden="true"
                />
              )}
              <span className="type-numeric match-oven__text">
                {ovenStatus}: {fmt.celsius(ovenTemp)}
                {ovenGap > 0 ? ` · ${cms.ui.statIdeal} ${fmt.celsius(idealTemp)}` : ""}
              </span>
            </div>

            {/* VPL-C4: barre con label ESTESA; quando non entrano sulla riga, vanno a
             * capo (flex-wrap + min-width che contiene il nome pieno) invece di
             * comprimersi in sigle criptiche. */}
            <div className="match-bars">
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
                  className="match-explain"
                >
                  <div className="match-explain__panel">
                    <div className="match-explain__head">
                      <span
                        className="match-explain__axis"
                        style={{ ["--axis-color" as any]: explainedAxis.color }}
                      >
                        {explainedAxis.label}
                      </span>
                      {nerdMode && (() => {
                        const weighted = weightedAxes.find((axis) => axis.key === explainedAxis.key);
                        return weighted ? (
                          <span className="type-numeric match-explain__weight">
                            {t(cms.cooking.matchAxisWeight ?? "peso {pct}% del Match", { pct: weighted.weightPct })}
                          </span>
                        ) : null;
                      })()}
                    </div>
                    <p className="match-explain__body">
                      {explainedAxis.explain}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Scomposizione numerica (nerd): stessi pesi passati al motore,
             * rinormalizzati — la somma è il Match mostrato (±1 di rounding). */}
            {nerdMode && weightedAxes.length > 0 && (
              <p className="type-numeric match-breakdown">
                {cms.cooking.matchBreakdownLabel ?? "Media pesata"}:{" "}
                {weightedAxes
                  .map((axis) => `${axis.shortLabel} ${Math.round(axis.value)}·${axis.weightPct}%`)
                  .join(" + ")}
                {" ≈ "}
                <span className="match-breakdown__total">
                  {roundedScore}
                </span>
              </p>
            )}

            {optimizationRationale && optimizationRationale.length > 0 && (
              <div className="match-rationale">
                <div className="match-rationale__head">
                  <Sparkles size={14} />
                  <span className="match-rationale__head-label">
                    {cms.cooking.optimizedForSetup}
                  </span>
                </div>
                <ul className="match-rationale__list">
                  {optimizationRationale.map((reason, i) => (
                    <li key={i} className="match-rationale__item">
                      • {reason}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="match-actions">
        {onOptimize && (
          <motion.button
            type="button"
            onClick={onOptimize}
            whileHover={{ scale: 1.025, y: -1 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", stiffness: 450, damping: 28 }}
            className="match-action-cta"
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
            className="match-action-text match-action-text--personalize"
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
              className={`match-action-text match-action-text--save${saved ? " match-action-text--save-active" : ""}`}
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
      className={`match-bar ${compact ? "match-bar--compact" : "match-bar--wide"}${
        explainable ? " match-bar--explainable" : ""
      }`}
    >
      <div
        className={`match-bar__head${compact ? " match-bar__head--compact" : ""}${
          explained ? " match-bar__head--explained" : ""
        }`}
      >
        <span className="match-bar__label" title={label} aria-label={label}>
          {compact ? displayLabel ?? label : label}
          {explainable && (
            <Info
              size={11}
              aria-hidden="true"
              className={`match-bar__label-icon${explained ? " match-bar__label-icon--explained" : ""}`}
            />
          )}
        </span>
        <span className="type-numeric">{rounded}</span>
      </div>
      <div className={`match-bar-track ${compact ? "match-bar-track--compact" : "match-bar-track--wide"}`}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${rounded}%` }}
          transition={{ type: "spring", stiffness: 240, damping: 26 }}
          className="match-bar-fill"
          style={{ ["--bar-color" as any]: color }}
        />
      </div>
    </Wrapper>
  );
}
