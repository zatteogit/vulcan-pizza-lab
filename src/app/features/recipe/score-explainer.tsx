/* ═══ FW-06 — ScoreExplainer: il punteggio spiegato, uguale ovunque ═══
 * Audit 28/10/2026 (S02-A-02, S03-A-05, S05-B-03, S07-A-02, S07-B-03): il
 * numero «Compatibilità con la tua cucina» aveva tre spiegazioni diverse (il
 * tooltip ne citava due criteri, la scheda cinque, nessuno diceva la regola del
 * minimo). D-E (Matteo): contano solo autenticità e facilità; maturazione,
 * sostenibilità e sperimentazione sono informazioni a parte.
 *
 * Livello 1 · una riga: che cosa misura e, se c'è, che cosa lo limita.
 * Livello 2 · i criteri che contano con il peso, la regola del minimo, le
 *             informazioni che non entrano nel numero.
 * Livello 3 · «Come si calcola» (WhyButton → nota `score-weights`, più le
 *             regole di prodotto `non-feasible-ceiling`, `authenticity-fuel-cap`
 *             e lo spareggio `ranking-tiebreak`, D-062).
 * Tutti i numeri vengono da explainRecipeScores (motore), nessuno dal testo. */

import { motion, useReducedMotion } from "motion/react";
import { Disclosure } from "../../components/ds";
import { motionSpring } from "../../components/ds/motion";
import { explainRecipeScores, NON_FEASIBLE_SCORE_CEILING, type ScoreExplanation } from "../../domain/recipe-score";
import { AUTHENTICITY_FUEL_CAP, type GeneratedRecipe, type RecipeScores, type ScoreDimensionKey } from "../../domain/pizza-engine";
import { useCms, type CmsContent } from "../cms/cms-context";
import { createFormatter, t } from "../cms/i18n";
import { WhyButton } from "../science/why-button";
import { engineMsgTexts } from "./engine-msg-text";
import { blockerText, primaryBlocker } from "./blocker-text";

type Formatter = ReturnType<typeof createFormatter>;

const FIRST_LIMIT = NON_FEASIBLE_SCORE_CEILING + 1;

/** Il tetto del combustibile è intervenuto davvero (il motore lo dice). */
function fuelCapped(scores: RecipeScores): boolean {
  return scores.penalties.some((p) => p.key === "auth.fuelCap");
}

/** Livello 1: che cosa limita il numero, in una frase; null se nulla. */
export function scoreLimitLine(scores: RecipeScores, cms: CmsContent, fmt: Formatter): string | null {
  const limitedBy = scores.global_calculation?.limited_by ?? null;
  if (limitedBy === "authenticity") {
    return fuelCapped(scores) && Math.round(scores.authenticity) >= AUTHENTICITY_FUEL_CAP
      ? t(cms.scoreExplainer.limitedFuel, { cap: fmt.number(AUTHENTICITY_FUEL_CAP) })
      : t(cms.scoreExplainer.limitedAuthenticity, { score: fmt.number(Math.round(scores.authenticity)) });
  }
  if (limitedBy === "feasibility") return t(cms.scoreExplainer.limitedFeasibility, { limit: fmt.number(FIRST_LIMIT) });
  return null;
}

/** Nome accessibile del numero: «Compatibilità con la tua cucina: 75 su 100». */
export function scoreAriaLabel(score: number, cms: CmsContent, fmt: Formatter): string {
  return t(cms.scoreExplainer.scoreAria, { label: cms.ui.recipeScore, score: fmt.number(Math.round(score)) });
}

function dimensionLabel(cms: CmsContent, key: ScoreDimensionKey): string {
  return cms.scoreDimensions[key]?.label ?? key;
}

function Bar({ value, axis }: { value: number; axis: ScoreDimensionKey }) {
  const reduce = useReducedMotion();
  const width = `${Math.max(0, Math.min(100, Math.round(value)))}%`;
  return (
    <span className="score-explainer__track" aria-hidden="true">
      <motion.span
        className="score-explainer__fill"
        data-axis={axis}
        initial={false}
        animate={{ width }}
        transition={reduce ? { duration: 0 } : motionSpring.calmMatch}
      />
    </span>
  );
}

function RuleRows({ explanation, fmt, cms }: { explanation: ScoreExplanation; fmt: Formatter; cms: CmsContent }) {
  const { limitedBy, ceilings } = explanation;
  const e = cms.scoreExplainer;
  const row = (label: string, value: number, limiting: boolean) => (
    <div className="score-explainer__rule-row" data-limiting={limiting ? "true" : undefined}>
      <dt>{label}</dt>
      <dd className="type-numeric">{fmt.number(value)}/100</dd>
    </div>
  );
  return (
    <dl className="score-explainer__rule">
      {row(e.ruleAverage, explanation.weightedAverage, limitedBy === null)}
      {row(e.ruleAuthenticity, ceilings.authenticity, limitedBy === "authenticity")}
      {ceilings.feasibility !== null && row(e.ruleFeasibility, ceilings.feasibility, limitedBy === "feasibility")}
      <div className="score-explainer__rule-row" data-result="true">
        <dt>{e.ruleResult}</dt>
        <dd className="type-numeric">{fmt.number(explanation.score)}/100</dd>
      </div>
    </dl>
  );
}

export interface ScoreExplainerProps {
  scores: RecipeScores;
  /** La ricetta, per dire il primo requisito che blocca e lo stato del profilo di sperimentazione. */
  recipe?: GeneratedRecipe;
  /** `full` nella scheda e nel pannello stile; `compact` nel suggerimento delle card (niente controlli). */
  variant?: "full" | "compact";
  /** false quando la riga del limite è già al livello 1 accanto al numero (scheda ricetta). */
  showLimit?: boolean;
  className?: string;
}

export function ScoreExplainer({ scores, recipe, variant = "full", showLimit = true, className }: ScoreExplainerProps) {
  const { cms, bcp47 } = useCms();
  const fmt = createFormatter(cms.ui, bcp47);
  const explanation = explainRecipeScores(scores);
  if (!explanation) return null;
  const e = cms.scoreExplainer;
  const compact = variant === "compact";
  const limit = scoreLimitLine(scores, cms, fmt);
  const blocker = recipe && explanation.limitedBy === "feasibility" ? primaryBlocker(recipe.verdict) : null;
  const counted = explanation.dimensions.filter((d) => d.counts);
  const info = explanation.dimensions.filter((d) => !d.counts);
  const pct = (weight: number) => t(e.weight, { pct: fmt.percent(Math.round(weight * 100)) });
  const penalties = scores.penalties.length > 0 ? engineMsgTexts(scores.penalties, cms, bcp47) : [];
  const pending = recipe?.science.deviation_category === "unclassified";

  return (
    <section className={["score-explainer", className].filter(Boolean).join(" ")} data-region="score-explainer" data-variant={variant} aria-label={cms.ui.recipeScore}>
      {!compact && <p className="score-explainer__meaning">{e.meaning}</p>}
      {showLimit && limit && <p className="score-explainer__limit">{limit}</p>}
      {blocker && <p className="score-explainer__blocker">{blockerText(blocker, cms, bcp47)}</p>}

      <p className="score-explainer__heading">{e.countedTitle}</p>
      <ul className="score-explainer__dims">
        {counted.map((d) => (
          <li key={d.key} className="score-explainer__dim" data-limiting={explanation.limitedBy === d.key ? "true" : undefined}>
            {compact ? (
              <p className="score-explainer__dim-head">
                <strong className="score-explainer__name">{dimensionLabel(cms, d.key)}</strong>
                <small className="score-explainer__weight type-numeric">{pct(d.weight)}</small>
                <strong className="score-explainer__value type-numeric">{fmt.number(Math.round(d.value))}</strong>
              </p>
            ) : (
              <Disclosure
                variant="inline"
                className="score-explainer__disclosure"
                summary={<>{dimensionLabel(cms, d.key)} <small className="score-explainer__weight type-numeric">{pct(d.weight)}</small></>}
                meta={<strong className="type-numeric">{fmt.number(Math.round(d.value))}</strong>}
              >
                {cms.scoreDimensions[d.key]?.explain && <p className="score-explainer__explain">{cms.scoreDimensions[d.key].explain}</p>}
                {d.key === "authenticity" && penalties.length > 0 && (
                  <ul className="score-explainer__penalties">
                    {penalties.map((text) => <li key={text}>{text}</li>)}
                  </ul>
                )}
              </Disclosure>
            )}
            <Bar value={d.value} axis={d.key} />
          </li>
        ))}
      </ul>

      {compact ? (
        <p className="score-explainer__note">{cms.ui.scoreTipGlobal}</p>
      ) : (
        <>
          <p className="score-explainer__heading">{e.ruleTitle}</p>
          <RuleRows explanation={explanation} fmt={fmt} cms={cms} />
          {explanation.ceilings.feasibility !== null && (
            <p className="score-explainer__note">{t(e.ceilingEditorial, { limit: fmt.number(FIRST_LIMIT) })}</p>
          )}
          {/* D-062: a pari numero l'ordine delle liste segue il margine della cucina. */}
          <p className="score-explainer__note">{e.tieBreak}</p>
          <p className="score-explainer__why">
            <WhyButton noteId="score-weights" label={e.whyLabel} />
            <WhyButton noteId="ranking-tiebreak" />
            {explanation.ceilings.feasibility !== null && <WhyButton noteId="non-feasible-ceiling" />}
            {fuelCapped(scores) && <WhyButton noteId="authenticity-fuel-cap" />}
          </p>

          {info.length > 0 && (
            <>
              <p className="score-explainer__heading">{e.infoTitle}</p>
              <p className="score-explainer__note">{e.infoNote}</p>
              <ul className="score-explainer__dims score-explainer__dims--info">
                {info.map((d) => (
                  <li key={d.key} className="score-explainer__dim" data-info="true">
                    <Disclosure
                      variant="inline"
                      className="score-explainer__disclosure"
                      summary={dimensionLabel(cms, d.key)}
                      meta={<strong className="type-numeric">{fmt.number(Math.round(d.value))}</strong>}
                    >
                      {cms.scoreDimensions[d.key]?.explain && <p className="score-explainer__explain">{cms.scoreDimensions[d.key].explain}</p>}
                      {d.key === "experimentation" && pending && <p className="score-explainer__explain">{e.referencePending}</p>}
                    </Disclosure>
                  </li>
                ))}
              </ul>
            </>
          )}
        </>
      )}
    </section>
  );
}
