import { recipeDisplayName } from "../../domain/recipe-reference";
import { createPortal } from "react-dom";
import { BRAND } from "../../config/brand";
import { VulcanMark } from "../../components/shared/vulcan-logo";
import { computePreFermentSplit } from "../../domain/pre-ferment-split";
import type { GeneratedRecipe } from "../../domain/pizza-engine";
import { scaleToppingAmounts, type ToppingRecipe } from "../../data/topping-library";
import { toppingConcept } from "../../data/topping-i18n/localize";
import { uiMessage } from "../../i18n/ui-messages";
import type { CmsContent } from "../cms/cms-context";
import type { createFormatter } from "../cms/i18n";
import type { CookSessionStep } from "../cooking/cook-session";

/* ═══ D-043 — Scheda di produzione stampabile ═══
 * Stampare l'interfaccia dava una pagina con pulsanti, cursori e foto vuote
 * (audit totale n. 18). Questa è una scheda pensata per la carta e per il PDF:
 * logo, dati della ricetta, dosi con percentuali del panettiere, procedimento
 * con orari e grammi, condimento. Esiste solo in stampa (portal fuori da #root,
 * nascosto a schermo); le sezioni si scelgono nel dialogo prima di stampare. */

export interface PrintSections {
  dough: boolean;
  steps: boolean;
  topping: boolean;
}

type Fmt = ReturnType<typeof createFormatter>;

/** Giorno e ora dei passi: un impasto lungo attraversa più giorni. */
const STEP_TIME_FORMAT: Intl.DateTimeFormatOptions = { weekday: "short", hour: "2-digit", minute: "2-digit" };

export function PrintSheet({
  recipe,
  cms,
  fmt,
  bcp47,
  sections,
  steps,
  topping,
  unitLabel,
  readyAt,
}: {
  recipe: GeneratedRecipe;
  cms: CmsContent;
  fmt: Fmt;
  bcp47: string;
  sections: PrintSections;
  steps: Omit<CookSessionStep, "done">[];
  topping?: ToppingRecipe;
  unitLabel: string;
  readyAt: Date;
}) {
  const ui = cms.ui;
  const pct = (g: number) =>
    `${new Intl.NumberFormat(bcp47, { maximumFractionDigits: 1 }).format((g / recipe.flour_g) * 100)}%`;
  const time = (ms: number) => new Intl.DateTimeFormat(bcp47, STEP_TIME_FORMAT).format(new Date(ms));
  const yeastLabel = cms.yeastLabels?.[recipe.yeast_type] ?? recipe.yeast_type;
  const fatType = recipe.style.dough.fat_type;
  const fatLabel = fatType === "butter" ? ui.fatButter : fatType === "lard" ? ui.fatLard : ui.oilEvo;
  const rows: [string, number][] = [
    [ui.flour, recipe.flour_g],
    [ui.water, recipe.water_g],
    [ui.salt, recipe.salt_g],
    [yeastLabel, recipe.yeast_g],
    [ui.sugar, recipe.sugar_g],
    [fatLabel, recipe.fat_g],
  ].filter(([, g]) => (g as number) > 0) as [string, number][];
  const total = rows.reduce((sum, [, g]) => sum + g, 0);
  const split = recipe.has_pre_ferment
    ? computePreFermentSplit({ flourG: recipe.flour_g, waterG: recipe.water_g, preFermentType: recipe.pre_ferment_type, flourPct: recipe.pre_ferment_flour_pct })
    : null;
  const scaledTopping = topping ? scaleToppingAmounts(topping, recipe.topping_scale ?? recipe.style.topping_scale) : undefined;
  const concept = topping ? toppingConcept(topping.concept_ref, cms.toppingI18n) : undefined;
  const amount = (value: number, unit: string) =>
    unit === "g" ? fmt.grams(value) : unit === "ml" ? fmt.milliliters(value) : `${value}`;

  return createPortal(
    <article className="print-sheet" lang={bcp47}>
      <header className="print-sheet__header">
        <p className="print-sheet__brand">
          <VulcanMark size={28} decorative />
          {BRAND.name}
        </p>
        <h1 className="print-sheet__title">{recipeDisplayName(recipe)}</h1>
        <p className="print-sheet__meta">
          {recipe.dough_balls} {unitLabel} · {fmt.grams(recipe.ball_weight_g)} ·{" "}
          {ui.statHydration} {fmt.percent(recipe.hydration_pct)} ·{" "}
          {uiMessage("features.recipe.recipe-stat-strip.w-value-f64b6332", [recipe.flour_w])} ·{" "}
          {ui.statOven} {fmt.celsius(recipe.oven_temp_c)}
        </p>
        <p className="print-sheet__meta">
          {uiMessage("features.recipe.print-sheet.readyAt", [time(readyAt.getTime())])} ·{" "}
          {uiMessage("features.recipe.print-sheet.printedOn", [new Date().toLocaleDateString(bcp47)])}
        </p>
      </header>

      {sections.dough && (
        <section className="print-sheet__section">
          <h2 className="print-sheet__h2">{ui.ingredients}</h2>
          <table className="print-sheet__table">
            <thead>
              <tr>
                <th scope="col">{uiMessage("features.recipe.print-sheet.ingredient")}</th>
                <th scope="col" className="print-sheet__num">{uiMessage("features.recipe.print-sheet.grams")}</th>
                <th scope="col" className="print-sheet__num">{uiMessage("features.recipe.print-sheet.bakerPct")}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(([label, g]) => (
                <tr key={label}>
                  <td>{label}</td>
                  <td className="print-sheet__num">{fmt.grams(g)}</td>
                  <td className="print-sheet__num">{pct(g)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <th scope="row">{uiMessage("features.recipe.print-sheet.total")}</th>
                <td className="print-sheet__num">{fmt.grams(total)}</td>
                <td className="print-sheet__num">{pct(total)}</td>
              </tr>
            </tfoot>
          </table>
          {split && (
            <p className="print-sheet__note">
              {split.name}: {ui.flour} {fmt.grams(split.prefermentFlourG)} · {ui.water}{" "}
              {fmt.grams(split.prefermentWaterG)} · {yeastLabel} {fmt.grams(recipe.yeast_g)}.{" "}
              {uiMessage("features.recipe.print-sheet.finalDough")}: {ui.flour} {fmt.grams(split.mainFlourG)} ·{" "}
              {ui.water} {fmt.grams(split.mainWaterG)}
              {recipe.water_temp_c != null ? ` · ${ui.water} ${fmt.celsius(recipe.water_temp_c)}` : ""}
            </p>
          )}
          {!split && recipe.water_temp_c != null && (
            <p className="print-sheet__note">
              {ui.water} {fmt.celsius(recipe.water_temp_c)}
            </p>
          )}
        </section>
      )}

      {sections.steps && (
        <section className="print-sheet__section">
          <h2 className="print-sheet__h2">{uiMessage("features.recipe.print-sheet.method")}</h2>
          {recipe.dough_balls > 1 && <p className="print-sheet__step-text">{cms.engineMessages["timeline.batchModel"]}</p>}
          <ol className="print-sheet__steps">
            {steps.map((step) => (
              <li key={step.id} className="print-sheet__step">
                <p className="print-sheet__step-head">
                  <strong>{step.title}</strong>
                  <time dateTime={new Date(step.startMs).toISOString()} className="print-sheet__time">
                    {time(step.startMs)}
                    {step.duration_minutes > 0 ? ` · ${fmt.durationMinutes(step.duration_minutes)}` : ""}
                  </time>
                </p>
                <p className="print-sheet__step-text">{step.description}</p>
                {step.quantities && step.quantities.length > 0 && (
                  <p className="print-sheet__step-qty">
                    {step.quantities.map((q) => `${q.label} ${q.value}`).join(" · ")}
                  </p>
                )}
              </li>
            ))}
          </ol>
        </section>
      )}

      {sections.topping && scaledTopping && (
        <section className="print-sheet__section">
          <h2 className="print-sheet__h2">
            {uiMessage("features.recipe.print-sheet.topping")}
            {concept?.name ? ` · ${concept.name}` : ""}
          </h2>
          <table className="print-sheet__table">
            <thead>
              <tr>
                <th scope="col">{uiMessage("features.recipe.print-sheet.ingredient")}</th>
                <th scope="col" className="print-sheet__num">
                  {uiMessage("features.recipe.print-sheet.perUnit", [unitLabel])}
                </th>
                <th scope="col" className="print-sheet__num">{uiMessage("features.recipe.print-sheet.total")}</th>
              </tr>
            </thead>
            <tbody>
              {scaledTopping.ingredients.map((ing) => (
                <tr key={ing.name}>
                  <td>{ing.name}</td>
                  <td className="print-sheet__num">{amount(ing.amount.value, ing.amount.unit)}</td>
                  <td className="print-sheet__num">
                    {amount(Math.round(ing.amount.value * recipe.dough_balls), ing.amount.unit)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      <footer className="print-sheet__footer">
        {BRAND.fullName} · {recipeDisplayName(recipe)}
      </footer>
    </article>,
    document.body,
  );
}
