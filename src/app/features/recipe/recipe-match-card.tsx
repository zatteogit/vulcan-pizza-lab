import { RecipeMatchIcon } from "./recipe-match-icon";
import { RecipeConditionChips } from "./recipe-condition-chips";
import { recipeCardSignals, recipePresentationState } from "./recipe-card-signals";
import { RecipeChanges } from "./recipe-changes";
import { useEffect, useId, useRef, useState } from "react";
import { motion, AnimatePresence, useReducedMotion, useSpring, useTransform } from "motion/react";
import { motionSpring } from "../../components/ds/motion";
import { ArrowUpRight, Bookmark, ChevronDown, Droplets, Sparkles, TriangleAlert, WandSparkles } from "lucide-react";
import type { GeneratedRecipe, RecipeScores, UserConstraints } from "../../domain/pizza-engine";
import { RecipeVerdictNotice } from "./recipe-verdict-notice";
import { summarizeVerdict } from "../../domain/verdict-summary";
import { ScoreExplainer, scoreAriaLabel, scoreLimitLine } from "./score-explainer";
import { useCms } from "../cms/cms-context";
import { engineMsgTexts } from "./engine-msg-text";
import { createFormatter, t } from "../cms/i18n";
import { uiMessage } from "../../i18n/ui-messages";
import { Heading } from "../../components/ds";

type RecipeMatchMode = "canonical" | "adapted" | "lab";

/** FW-10: ancora del blocco compatibilità (il «Perché» sotto il titolo ci porta qui). */
export const RECIPE_MATCH_ID = "recipe-match";

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
    get title() { return uiMessage("features.recipe.recipe-match-card.amore-a-prima-vista-d3108980"); },
    get canonical() { return uiMessage("features.recipe.recipe-match-card.la-canonica-e-la-tua-cucina-parlano-gia-la-37bbb4fd"); },
    get adapted() { return uiMessage("features.recipe.recipe-match-card.questa-versione-e-nata-per-il-tuo-setup-4ff2056a"); },
    low: false,
    icon: "handshake",
  },
  t75: {
    get title() { return uiMessage("features.recipe.recipe-match-card.ottima-intesa-55470040"); },
    get canonical() { return uiMessage("features.recipe.recipe-match-card.qualche-micro-compromesso-ma-la-scintilla--62f59a12"); },
    get adapted() { return uiMessage("features.recipe.recipe-match-card.pochi-aggiustamenti-tanta-sostanza-528675f6"); },
    low: false,
    icon: "heart",
  },
  t60: {
    get title() { return uiMessage("features.recipe.recipe-match-card.ci-vuole-un-po-di-corteggiamento-f93dd2af"); },
    get canonical() { return uiMessage("features.recipe.recipe-match-card.si-puo-fare-bene-sblocchiamola-e-vulcan-si-1ee8bb69"); },
    get adapted() { return uiMessage("features.recipe.recipe-match-card.la-ricetta-funziona-ma-chiede-un-minimo-di-7c183f59"); },
    low: false,
    icon: "pulse",
  },
  t40: {
    get title() { return uiMessage("features.recipe.recipe-match-card.per-le-cose-buone-ci-vuole-tempo-e6addc9c"); },
    get canonical() { return uiMessage("features.recipe.recipe-match-card.la-ricetta-e-seria-meglio-adattarla-al-tuo-551e300f"); },
    get adapted() { return uiMessage("features.recipe.recipe-match-card.buona-direzione-ma-serve-ancora-qualche-co-fe018050"); },
    low: true,
    icon: "crack",
  },
  t0: {
    get title() { return uiMessage("features.recipe.recipe-match-card.cuore-spezzato-42157bb9"); },
    get canonical() { return uiMessage("features.recipe.recipe-match-card.bellissima-ma-oggi-chiede-piu-fuoco-di-que-4d766f75"); },
    get adapted() { return uiMessage("features.recipe.recipe-match-card.troppo-per-questo-setup-alleggeriamo-tempi-2fd2fadf"); },
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

/* S07-B-14: frase d'apertura dei dettagli per esito, intera e con la
   maiuscola (non i sottotitoli dei tier di Scopri). */
function detailsIntro(state: "blocked" | "check" | "ready"): string {
  if (state === "blocked") return uiMessage("recipe.matchDetails.intro.notFeasible");
  if (state === "check") return uiMessage("recipe.matchDetails.intro.conditions");
  return uiMessage("recipe.matchDetails.intro.ok");
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
   FW-06 (S07-B-19): parte dal valore, non da 0: tornando sul tab Ricetta il
   conteggio ripartiva ogni volta (movimento decorativo ripetuto). Insegue solo
   i ricalcoli. Con prefers-reduced-motion salta al valore. tnum evita jitter. */
function AnimatedScore({ value }: { value: number }) {
  const prefersReducedMotion = useReducedMotion();
  const spring = useSpring(value, motionSpring.animatedScore);
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
  onCreate,
  onSave,
  onOptimize,
  dirty = false,
  optimizationRationale,
  optimizationPreview,
  originalRecipe,
  ceiling,
  hardLimited,
  softNeeds,
  saved = false,
  verdictRecipe,
  verdictConstraints,
  mealDeadline = false,
  resetKey,
  initialExpanded = false,
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
  onCreate?: () => void;
  onSave?: () => void;
  /** "Ottimizza per me": cerca i parametri migliori per il setup dell'utente. */
  onOptimize?: () => void;
  /** La ricetta È stata modificata rispetto all'originale (parametri diversi
   *  da quelli che "Torna all'originale" ripristinerebbe). Solo allora hanno
   *  senso — e compaiono — Salva e Torna all'originale. */
  dirty?: boolean;
  /** Rationale dell'ultima ottimizzazione (stringhe già risolte) da mostrare. */
  optimizationRationale?: string[];
  optimizationPreview?: GeneratedRecipe;
  originalRecipe?: GeneratedRecipe;
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
  /** Ricetta e vincoli per l'esito «Così non è fattibile»: quando c'è, il
   *  blocco lo dice al posto del tono e del soffitto, una volta sola. */
  verdictRecipe?: GeneratedRecipe;
  verdictConstraints?: UserConstraints;
  mealDeadline?: boolean;
  /** FW-06 (S07-A-19): cambia quando cambia la ricetta di partenza (versione,
   *  firma): il nuovo numero non è un miglioramento e non mostra il «+Δ». */
  resetKey?: string;
  /** Dettagli già aperti al primo render (test di render statico). */
  initialExpanded?: boolean;
  className?: string;
}) {
  const { cms, bcp47 } = useCms();
  const fmt = createFormatter(cms.ui, bcp47);
  /* Audit fruibilità luglio 2026: la card nasce COMPATTA (icona, punteggio,
     tono e azioni). Barre punteggio, stato forno e rationale arrivano a
     richiesta: erano una schermata intera prima degli ingredienti. */
  const [expanded, setExpanded] = useState(initialExpanded);
  const detailsId = useId();
  const detailsLabel = cms.cooking.matchDetails ?? uiMessage("features.recipe.recipe-match-card.dettagli-8f4ce7d9");
  const detailsActionLabel = expanded
    ? cms.cooking.matchDetailsHide ?? uiMessage("features.recipe.recipe-match-card.nascondi-f6ef7782")
    : detailsLabel;
  const detailsToggleRef = useRef<HTMLButtonElement>(null);
  const ovenGap = idealTemp - ovenTemp;
  /* FW-10: un'unica lettura dell'esito per card, dettagli e avvisi. */
  const summary = verdictRecipe ? summarizeVerdict(verdictRecipe.verdict, verdictRecipe.optional_aids) : null;
  const ovenBlocker = summary?.primary?.kind === "oven_too_cold" ? summary.primary
    : summary?.secondary.find((b) => b.kind === "oven_too_cold");
  const blockedOvenMin = ovenBlocker?.kind === "oven_too_cold" ? ovenBlocker.style_min_c : null;
  const ovenStatus =
    minTemp < 200 ? cms.ui.statOil : ovenGap <= 0
      ? cms.cooking.ovenOptimal
      : ovenTemp >= minTemp
        ? cms.cooking.ovenLimited
        : cms.cooking.ovenNeedsAdaptation;
  /* Con un forno che blocca la ricetta «Richiede adattamento» contraddiceva
     «Così non è fattibile»: si dice il blocco, con minimo e ideale. */
  const ovenLine = blockedOvenMin !== null
    ? uiMessage("verdict.ovenBlocked", [fmt.celsius(ovenTemp), fmt.celsius(blockedOvenMin), fmt.celsius(idealTemp)])
    : `${ovenStatus}: ${fmt.celsius(ovenTemp)}${ovenGap > 0 ? ` · ${cms.ui.statIdeal} ${fmt.celsius(idealTemp)}` : ""}`;

  // Audit role-play giugno 2026: per gli stili ad alta temperatura sotto il
  // minimo, il motore emette un warning netto ("non otterrai una vera X").
  // Lo rendiamo qui — prima era calcolato ma mai mostrato.
  const unviableWarning = scores.warnings?.find((w) => w.key === "feas.thermalUnviable");
  const unviableText = unviableWarning
    ? engineMsgTexts([unviableWarning], cms, bcp47)[0]
    : null;

  const roundedScore = Math.round(scores.composite);
  const limitLine = scoreLimitLine(scores, cms, fmt);

  // Il guadagno NON vive più sulla label del bottone ("Ottimizza per me +6"):
  // quando il punteggio SALE (ottimizzazione, ritocco riuscito) un "+Δ" verde
  // spunta accanto al numero e svanisce — feedback nel momento, non promessa
  // nel pulsante (Matteo, 3 lug 2026).
  const prevScoreRef = useRef(roundedScore);
  const prevResetRef = useRef(resetKey);
  const [scoreBump, setScoreBump] = useState<{ delta: number; id: number } | null>(null);
  useEffect(() => {
    const prev = prevScoreRef.current;
    prevScoreRef.current = roundedScore;
    // Altra ricetta di partenza: il numero si riallinea senza «+Δ».
    if (prevResetRef.current !== resetKey) {
      prevResetRef.current = resetKey;
      setScoreBump(null);
      return;
    }
    if (roundedScore <= prev) return;
    const id = Date.now();
    setScoreBump({ delta: roundedScore - prev, id });
    const timer = window.setTimeout(
      () => setScoreBump((bump) => (bump?.id === id ? null : bump)),
      1800,
    );
    return () => window.clearTimeout(timer);
  }, [roundedScore, resetKey]);

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
    if (ceilingRounded < 40 && !verdictRecipe) {
      // HARD: anche al massimo è sotto soglia → non vale la pena.
      headroomLine = {
        tone: "warn",
        text: t(ovenIsWall ? cms.cooking.ceilingUnviableOven : cms.cooking.ceilingUnviable, {
          ceiling: ceilingRounded,
        }),
      };
    } else if (ovenIsWall && ceilingRounded < 65 && !verdictRecipe) {
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
          ? t(cms.cooking.ceilingNeedsAtCeiling ?? "Per questa versione serve: {needs}.", {
              needs: needs.join(", "),
            })
          : t(cms.cooking.ceilingNeeds, { ceiling: ceilingRounded, needs: needs.join(", ") }),
      };
    } else if (headroom >= 8 && onOptimize && (!verdictRecipe || optimizationPreview?.verdict.outcome === "ok")) {
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
  // Con un esito operativo esplicito non aggiungere rassicurazioni ricavate
  // dal punteggio: le condizioni sono già elencate nel verdetto.
  if (verdictRecipe && headroom < 2) headroomLine = null;
  // The affinity icon describes the score; bookmarks describe saving.
  const notFeasible = verdictRecipe?.verdict.outcome === "not_feasible";
  const showScoreLimit = summary?.showScoreLimit ?? true;
  /* Nei dettagli la riga del forno dice già temperatura e ideale; l'avviso
     d'idratazione è già al livello 1: non si ripetono. */
  const detailAdaptations = (summary?.adaptations ?? []).filter((m) =>
    m !== summary?.skillWarning && m.key !== "feas.ovenSuboptimal" && m.key !== "feas.ovenTooCold");
  const presentationState = verdictRecipe ? recipePresentationState(verdictRecipe) : null;
  /* S07-A-09: le verifiche di dispensa e attrezzatura («Se hai…») non sono
     adattamenti: hanno il loro gruppo, senza le voci già dette nei chip. */
  const conditionKeys = new Set((summary?.conditions ?? []).map((c) => c.message.key));
  const adaptationTexts = engineMsgTexts(detailAdaptations.filter((m) => !conditionKeys.has(m.key)), cms, bcp47);
  const chipTexts = new Set(!notFeasible && verdictRecipe ? engineMsgTexts(recipeCardSignals(verdictRecipe).map((s) => s.message), cms, bcp47) : []);
  const needTexts = [...new Set(engineMsgTexts((summary?.conditions ?? []).map((c) => c.message), cms, bcp47))]
    .filter((text) => !chipTexts.has(text));
  const aidTexts = engineMsgTexts(summary?.optionalAids ?? [], cms, bcp47);
  const showChanges = Boolean(originalRecipe && verdictRecipe && mode !== "canonical");
  const hasRationale = Boolean(optimizationRationale && optimizationRationale.length > 0);
  /* «Come l'abbiamo adattata» elenca solo ciò che Vulcan ha cambiato, e solo
     fuori dal Riferimento; gli avvisi del motore (W, idratazione, esperienza)
     non sono adattamenti: stanno in «Da tenere d'occhio». */
  const hasAdapted = mode !== "canonical" && (showChanges || hasRationale);
  const statusLabel = notFeasible ? cms.ui.verdictTitle : presentationState === "check"
      ? engineMsgTexts([{key:"card.toVerify",fallback:"Da verificare"}],cms,bcp47)[0]
      : verdictRecipe ? engineMsgTexts([{key:"card.ready",fallback:"Fattibile"}], cms, bcp47)[0] : tone.title;
  // Un solo "movimento in avanti" verso su-misura: quando l'ottimizzatore è
  // disponibile, è LUI l'azione (subentra al vecchio "adatta alla cucina", che era
  // il midpoint ricalibrato — dominato dall'ottimo). Evita il doppio pulsante.
  /* Redesign lug 2026 (nota Matteo): azioni SEMPRE presenti = Ottimizza +
     Personalizza. Salva e Torna all'originale compaiono SOLO quando la
     ricetta è davvero cambiata (dirty) — e Torna, azione distruttiva, ha
     il peso visivo minore di tutte (testo muto, in coda). */
  /* S07-B-09: il segnalibro in testata è l'unico interruttore salva/rimuovi;
     qui solo «Salva» per una versione cambiata e non ancora salvata. */
  const showSaveAction = dirty && !saved && Boolean(onSave);

  return (
    <motion.section
      layout
      data-region="section"
      data-attention={tone.low || notFeasible ? "warning" : undefined}
      id={RECIPE_MATCH_ID}
      className={`match-card${notFeasible ? " match-card--blocked" : ""} ${className}`}
      /* U-10 (F29): il nome lo porta già l'aside che la contiene */
    >
      <div className="match-card__main">
        <button
          ref={detailsToggleRef}
          type="button"
          className={`match-score-group${expanded ? " match-score-group--expanded" : ""}`}
          onClick={() => setExpanded(value => !value)}
          aria-expanded={expanded}
          aria-controls={detailsId}
          /* FW-06 (S07-A-15, S07-B-19): il numero con il suo nome. */
          aria-label={`${scoreAriaLabel(roundedScore, cms, fmt)}. ${detailsActionLabel}`}
          title={detailsActionLabel}
        >
          <span className="match-score-number">
            <AnimatedScore value={roundedScore} />
            <span className="type-numeric match-score-suffix">/100</span>
          </span>
          <AnimatePresence>
            {scoreBump && (
              <motion.span
                key={scoreBump.id}
                initial={{ opacity: 0, y: 5, scale: 0.9 }}
                animate={{ opacity: 1, y: -3, scale: 1 }}
                exit={{ opacity: 0, y: -10 }}
                transition={motionSpring.matchGauge}
                className="type-numeric match-score-bump"
                aria-hidden="true"
              >
                +{scoreBump.delta}
              </motion.span>
            )}
          </AnimatePresence>
          <span className="match-score-details">{detailsLabel}<ChevronDown size={12} aria-hidden="true" /></span>
        </button>
        <div className="match-card__summary">
          <div className="match-card__copy">
            <div className="match-kicker">
              <RecipeMatchIcon score={roundedScore} blocked={notFeasible}
                size={14}
                className={`match-kicker__icon ${tone.low || notFeasible ? "match-kicker__icon--warn" : "match-kicker__icon--primary"}`}
                aria-hidden="true"
              />
              <span className="match-kicker__label">{uiMessage("features.recipe.recipe-match-card.match-0335207f")}</span>
            </div>
            {/* Esito operativo accanto al punteggio. */}
            <div className="match-verdict">
              <span className="match-tone">
                <span className="match-tone__text">{statusLabel}</span>
              </span>
            </div>

          </div>
          <div className="match-card__context">
            {/* FW-06 (S07-A-02): livello 1, che cosa limita il numero (anche il
                tetto del combustibile, detto come regola dell'app). */}
            {showScoreLimit && limitLine && (
              <p className="match-notice match-notice--limit">{limitLine}</p>
            )}
            {notFeasible && verdictRecipe && verdictConstraints && (
              <RecipeVerdictNotice
                embedded
                recipe={verdictRecipe}
                constraints={verdictConstraints}
                mealDeadline={mealDeadline}
                showRecipeBelow={false}
              />
            )}
            {!notFeasible && verdictRecipe && <RecipeConditionChips recipe={verdictRecipe} compact />}
            {/* FW-10 (S07-A-06): l'idratazione alta per chi comincia è ciò che fa
                fallire la pizza: la chip la dice al livello 1, qui l'azione. */}
            {summary?.skillWarning && onPersonalize && (
              <button type="button" className="match-notice__action" onClick={onPersonalize}>
                <Droplets size={14} aria-hidden="true" />
                {uiMessage("verdict.lowerHydration")}
              </button>
            )}
            {!notFeasible && (verdictRecipe?.dietary_warnings ?? []).map((warning, i) => (
              <p key={`${warning.filterId}-${i}`} className="match-notice match-notice--warn">
                {engineMsgTexts([warning.message], cms, bcp47)[0]}
              </p>
            ))}
            {/* Avvisi onesti: visibili anche a card chiusa */}
            {!notFeasible && unviableText && !(headroomLine && (headroomLine.tone === "warn" || headroomLine.tone === "muted")) && (
              <p className="match-notice match-notice--warn">
                {unviableText}
              </p>
            )}
            {/* Riga-soffitto SEMPRE visibile ("Puoi arrivare a {ceiling}…") —
                round 4, nota Matteo: è la promessa che dà senso a "Ottimizza". */}
            {!notFeasible && headroomLine && (
              <p className={`match-notice ${HEADROOM_TONE_CLASS[headroomLine.tone]}`}>
                {headroomLine.text}
              </p>
            )}

          </div>
        </div>
        <div className="match-actions">
          {onOptimize && (
            <motion.button
              type="button"
              onClick={() => {
                onOptimize();
                /* U-10 (F12): dopo l'ottimizzazione il pulsante sparisce; se il
                   focus è caduto su <body> lo si riporta nella card. */
                requestAnimationFrame(() => {
                  if (document.activeElement === document.body) detailsToggleRef.current?.focus();
                });
              }}
              whileHover={{ scale: 1.025, y: -1 }}
              whileTap={{ scale: 0.97 }}
              transition={motionSpring.highlightedMatch}
              className="match-action-cta"
            >
              <Sparkles size={18} aria-hidden="true" />
              {tone.low ? cms.cooking.makePossible : cms.cooking.optimizeForMe}
            </motion.button>
          )}
          {/* Automatic adaptation is primary when available. Manual edits stay
              secondary beside it, and become primary once it is no longer offered. */}
          {onPersonalize && (
            <motion.button
              type="button"
              onClick={onPersonalize}
              whileTap={{ scale: 0.95 }}
              className={`match-action-text match-action-text--personalize${onOptimize ? " match-action-text--secondary" : ""}`}
            >
              <WandSparkles size={18} aria-hidden="true" />
              {cms.ui.personalize ?? uiMessage("features.recipe.recipe-match-card.personalizza-0beadff3")}
            </motion.button>
          )}
          {onCreate && (
            <button type="button" className="match-action-text match-action-text--create" onClick={onCreate}>
              {cms.ui.recipeOpenCreate}<ArrowUpRight size={14} aria-hidden="true" />
            </button>
          )}
          <AnimatePresence initial={false}>
            {showSaveAction && (
              <motion.button
                key="save"
                type="button"
                onClick={onSave}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                whileTap={{ scale: 0.95 }}
                className="match-action-text match-action-text--save"
              >
                <Bookmark size={14} aria-hidden="true" />
                <span data-slot="label">{cms.cooking.saveVersion}</span>
              </motion.button>
            )}
          </AnimatePresence>

        </div>
      </div>
      {/* ── Dettagli a richiesta: stato forno, barre punteggio, rationale ── */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            key="match-details"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={motionSpring.matchPanel}
            className="match-details"
            id={detailsId}
          >
            {/* S07-B-14: una frase intera, non il sottotitolo minuscolo dei tier di Scopri. */}
            <div className="match-details__intro">
              <p className="match-details__body">
                {presentationState ? detailsIntro(presentationState) : tone.body}
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
                {ovenLine}
              </span>
            </div>

            {/* S07-A-09: gruppi con titolo, solo quelli non vuoti; il punteggio
                per ultimo (L2/L3). Le cause del blocco restano nel verdetto
                (FW-10) e con la ricetta bloccata non ci sono «Se hai…». */}
            {needTexts.length > 0 && (
              <section className="match-details__group" aria-labelledby={`${detailsId}-needs`}>
                <Heading level="xs" as="h2" id={`${detailsId}-needs`} className="match-details__title">{uiMessage("recipe.matchDetails.needs")}</Heading>
                <ul className="recipe-verdict__reasons">{needTexts.map(text => <li key={text} className="type-body-sm">{text}</li>)}</ul>
              </section>
            )}
            {adaptationTexts.length > 0 && (
              <section className="match-details__group" aria-labelledby={`${detailsId}-watch`}>
                <Heading level="xs" as="h2" id={`${detailsId}-watch`} className="match-details__title">{uiMessage("recipe.matchDetails.watch")}</Heading>
                <ul className="recipe-verdict__reasons">{adaptationTexts.map(text => <li key={text} className="type-body-sm">{text}</li>)}</ul>
              </section>
            )}
            {hasAdapted && (
              <section className="match-details__group" aria-labelledby={`${detailsId}-adapted`}>
                <Heading level="xs" as="h2" id={`${detailsId}-adapted`} className="match-details__title">{uiMessage("recipe.matchDetails.adapted")}</Heading>
                {showChanges && originalRecipe && verdictRecipe && <RecipeChanges from={originalRecipe} to={verdictRecipe} mode="included" />}
                {hasRationale && optimizationRationale && (
                  <div className="match-rationale">
                    <p className="match-rationale__head">
                      <Sparkles size={14} aria-hidden="true" />
                      <span className="match-rationale__head-label">
                        {cms.cooking.optimizedForSetup}
                      </span>
                    </p>
                    <ul className="match-rationale__list">
                      {optimizationRationale.map((reason, i) => (
                        <li key={i} className="match-rationale__item">
                          • {reason}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </section>
            )}
            {aidTexts.length > 0 && (
              <section className="match-details__group" aria-labelledby={`${detailsId}-aids`}>
                <Heading level="xs" as="h2" id={`${detailsId}-aids`} className="match-details__title">{uiMessage("recipe.matchDetails.aids")}</Heading>
                <ul className="recipe-verdict__reasons">{aidTexts.map(text => <li key={text} className="type-body-sm">{text}</li>)}</ul>
              </section>
            )}
            {/* FW-06: il punteggio spiegato una sola volta, come nelle card e nel
                pannello stile (ScoreExplainer). */}
            <section className="match-details__group" aria-labelledby={`${detailsId}-score`}>
              <Heading level="xs" as="h2" id={`${detailsId}-score`} className="match-details__title">{uiMessage("recipe.matchDetails.score")}</Heading>
              <ScoreExplainer scores={scores} recipe={verdictRecipe} showLimit={!(showScoreLimit && limitLine)} className="match-score-explainer" />
            </section>
          </motion.div>
        )}
      </AnimatePresence>
      {onOptimize && optimizationPreview && verdictRecipe && (
        <RecipeChanges from={verdictRecipe} to={optimizationPreview} mode="preview" />
      )}




    </motion.section>
  );
}
