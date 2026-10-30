import { useMemo, type ReactNode } from "react";
import { Link } from "react-router";
import { AlertTriangle, ChevronRight } from "lucide-react";
import {
  feasibleAlternativeStyles,
  type GeneratedRecipe,
  type UserConstraints,
} from "../../domain/pizza-engine";
import { summarizeVerdict } from "../../domain/verdict-summary";
import { useCms } from "../cms/cms-context";
import { createFormatter, t } from "../cms/i18n";
import { Disclosure, Surface } from "../../components/ds/index";
import { blockerText } from "./blocker-text";
import { uiMessage } from "../../i18n/ui-messages";
import { ovenSetupLink } from "../profile/oven-setup-link";

/* ═══ M-10 — «Così non è fattibile» ═══
 * Quando il motore dichiara la ricetta non fattibile, lo diciamo in cima, con
 * i motivi e le vie d'uscita: un orario più avanti e stili che con gli stessi
 * vincoli funzionano. La ricetta più vicina resta sotto, senza fingere che sia
 * quella chiesta.
 * FW-10: la causa principale si dice una volta, prima, con il rimedio
 * (summarizeVerdict); le altre cause stanno al livello 2, in «Perché e cosa
 * servirebbe». La frase di ogni causa viene da blocker-text, una sola copia
 * per avviso, Impara e punteggio. */

export function RecipeVerdictNotice({
  recipe,
  constraints,
  mealDeadline,
  embedded = false,
  showRecipeBelow = true,
  details,
  reasonId,
}: {
  recipe: GeneratedRecipe;
  constraints: UserConstraints;
  /** Con un orario del pasto le alternative devono starci nella finestra. */
  mealDeadline: boolean;
  /** Dentro il blocco «Compatibilità con la tua cucina»: senza riquadro né
   *  titolo, che li dà il blocco (nota di Matteo: avviso e compatibilità
   *  dicevano la stessa cosa due volte). */
  embedded?: boolean;
  /** A style preview has no generated recipe below its blocker explanation. */
  showRecipeBelow?: boolean;
  /** Livello 2 aggiuntivo (es. avvisi del pannello stile), dentro lo stesso
   *  «Perché e cosa servirebbe» delle cause secondarie. */
  details?: ReactNode;
  /** id della causa principale, per l'aria-describedby delle azioni che il
   *  blocco disabilita (G1b-WP-01: CTA del pannello stile). */
  reasonId?: string;
}) {
  const { cms, bcp47 } = useCms();
  const fmt = createFormatter(cms.ui, bcp47);
  const { verdict } = recipe;
  const notFeasible = verdict.outcome === "not_feasible";
  const summary = useMemo(() => summarizeVerdict(verdict), [verdict]);

  const alternatives = useMemo(
    () =>
      notFeasible
        ? feasibleAlternativeStyles(recipe.style, { ...constraints, meal_deadline: mealDeadline })
        : [],
    [notFeasible, recipe.style, constraints, mealDeadline],
  );

  if (!notFeasible || !summary.primary) return null;

  const primaryText = blockerText(summary.primary, cms, bcp47);
  const secondaryTexts = [...new Set(summary.secondary.map((b) => blockerText(b, cms, bcp47)))]
    .filter((text) => text !== primaryText);
  const remedy = summary.remedy;

  const body = (
    <>
      <p id={reasonId} className="type-body recipe-verdict__reason">{primaryText}</p>
      {remedy?.kind === "later_time" && (
        <p className="type-body recipe-verdict__action">
          {t(cms.ui.verdictLaterTime, { hours: fmt.durationShort(remedy.hours) })}
        </p>
      )}
      {/* FW-10, seguito: se la causa è il forno (troppo freddo o del tipo
          sbagliato per lo stile), l'uscita è cambiarlo. Qui e non sulle card
          di Scopri (nota di Matteo): nel pannello dello stile e nella scheda
          della ricetta, dove si legge il perché. Il forno salvato cambia solo
          quando l'utente ne sceglie uno. */}
      {summary.primary.kind === "oven_too_cold" && (
        <Link to={ovenSetupLink()} className="type-body recipe-verdict__link">
          {uiMessage("verdict.changeOven")}
          <ChevronRight size={14} aria-hidden="true" />
        </Link>
      )}
      {remedy?.kind === "review_diet" && (
        <Link to="/profile?tab=setup" className="type-body recipe-verdict__link">
          {uiMessage("verdict.reviewDiet")}
          <ChevronRight size={14} aria-hidden="true" />
        </Link>
      )}
      {alternatives.length > 0 && (
        <nav className="recipe-verdict__alternatives" aria-label={cms.ui.verdictAlternatives}>
          <p className="type-body recipe-verdict__action">{cms.ui.verdictAlternatives}</p>
          <ul className="recipe-verdict__links">
            {alternatives.map((style) => (
              <li key={style.id}>
                <Link to={`/recipe/${style.id}`} className="type-body recipe-verdict__link">
                  {style.name}
                  <ChevronRight size={14} aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
      {(secondaryTexts.length > 0 || details) && (
        <Disclosure variant="inline" className="recipe-verdict__more" summary={uiMessage("verdict.whyMore")}>
          {secondaryTexts.length > 0 && (
            <ul className="recipe-verdict__reasons">
              {secondaryTexts.map((text) => (
                <li key={text} className="type-body-sm">{text}</li>
              ))}
            </ul>
          )}
          {details}
        </Disclosure>
      )}
      {showRecipeBelow && <p className="type-body recipe-verdict__footnote">{cms.ui.verdictRecipeBelow}</p>}
    </>
  );
  if (embedded) return <div data-region="section" className="recipe-verdict recipe-verdict--embedded">{body}</div>;

  return (
    <Surface as="section" className="recipe-verdict" aria-labelledby="recipe-verdict-title">
      <header className="recipe-verdict__header">
        <AlertTriangle aria-hidden="true" size={18} className="recipe-verdict__icon" />
        <h2 id="recipe-verdict-title" className="type-heading-xs recipe-verdict__title">
          {cms.ui.verdictTitle}
        </h2>
      </header>
      {body}
    </Surface>
  );
}
