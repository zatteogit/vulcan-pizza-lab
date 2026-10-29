import { needsMilkNote } from "./allergen-copy";
import { allergenName } from "./allergen-names";
import { recipeDisplayName } from "../../domain/recipe-reference";
import { useMemo } from "react";
import { engineMsgTexts } from "./engine-msg-text";
import { pantryIngredientNames } from "./pantry-ingredient-names";
import { pantryIngredientId } from "../../domain/pantry-ingredients";
import { createPortal } from "react-dom";
import { BRAND } from "../../config/brand";
import { VulcanMark } from "../../components/shared/vulcan-logo";
import { buildRecipePhases } from "../../domain/recipe-phases";
import type { GeneratedRecipe } from "../../domain/pizza-engine";
import { scaleToppingAmounts, type ToppingRecipe } from "../../data/topping-library";
import { toppingConcept } from "../../data/topping-i18n/localize";
import { uiMessage } from "../../i18n/ui-messages";
import type { CmsContent } from "../cms/cms-context";
import type { createFormatter } from "../cms/i18n";
import type { CookSessionStep } from "../cooking/cook-session";
import { phaseBakerPctText, phaseIngredientLabel, formatToppingAmountForLocale, yeastDilutionText } from "./recipe-output-format";

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
  unitLabelOne,
  readyAt,
  readyApproximate,
}: {
  recipe: GeneratedRecipe;
  cms: CmsContent;
  fmt: Fmt;
  bcp47: string;
  sections: PrintSections;
  steps: Omit<CookSessionStep, "done">[];
  topping?: ToppingRecipe;
  unitLabel: string;
  /** FW-17 (S08-A-11): l'unità al singolare, per l'intestazione «Per pizza». */
  unitLabelOne: string;
  readyAt: Date;
  readyApproximate: boolean;
}) {
  const ui = cms.ui;
  const ingredientNames=useMemo(()=>pantryIngredientNames(cms),[cms]);
  const unverified=recipe.allergens.unverified.map(i=>i.ingredient==="Olio per frittura"?uiMessage("allergen.fryingOil"):ingredientNames.get(pantryIngredientId(i.ingredient))??i.ingredient);
  /* FW-17 (S08-A-09/B-07, S08-B-19): totali e percentuali dal modello per
     fasi (quelli del motore), come a schermo; il lievito con due decimali. */
  const model = buildRecipePhases(recipe);
  const pct = (value: number) =>
    `${new Intl.NumberFormat(bcp47, { maximumFractionDigits: 1 }).format(value)}%`;
  const time = (ms: number) => new Intl.DateTimeFormat(bcp47, STEP_TIME_FORMAT).format(new Date(ms));
  const preName = model.preFerment?.name ?? "";
  const label = (id: Parameters<typeof phaseIngredientLabel>[0]) => phaseIngredientLabel(id, recipe, cms, preName);
  const dilution = model.yeastDilution ? yeastDilutionText(model.yeastDilution, fmt) : null;
  /* Righe dello scorporo: un ingrediente per riga, una colonna per fase. */
  const splitIds = model.preFerment
    ? (["preferment", "flour", "water", "yeast", "salt", "sugar", "fat"] as const).filter((id) =>
        model.phases.some((p) => p.ingredients.some((i) => i.id === id)),
      )
    : [];
  const scaledTopping = topping ? scaleToppingAmounts(topping, recipe.topping_scale ?? recipe.style.topping_scale) : undefined;
  const concept = topping ? toppingConcept(topping.concept_ref, cms.toppingI18n) : undefined;

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
          {uiMessage("features.recipe.recipe-stat-strip.w-value-f64b6332", [recipe.flour_w])}
          {/* FW-17 (S08-B-06): con un mix la forza che si impasta è quella efficace. */}
          {recipe.effective_gluten_w != null
            ? ` (${ui.flourEffectiveGluten} ${uiMessage("features.recipe.ingredients-section.w-e07879a9")}${recipe.effective_gluten_w})`
            : ""}{" "}
          ·{" "}
          {ui.statOven} {fmt.celsius(recipe.oven_temp_c)}
        </p>
        <p className="print-sheet__meta">
          {uiMessage("features.recipe.print-sheet.readyAt", [`${readyApproximate ? cms.cooking.approxPrefix : ""}${time(readyAt.getTime())}`])} ·{" "}
          {uiMessage("features.recipe.print-sheet.printedOn", [new Date().toLocaleDateString(bcp47)])}
        </p>
      </header>

      <section className="print-sheet__section">
        <h2 className="print-sheet__h2">{uiMessage("allergen.title")}</h2>
        {recipe.allergens.contains.length>0?<p>{uiMessage("allergen.contains")}: {recipe.allergens.contains.map(g=>allergenName(g.id)).join(", ")}</p>:<p>{uiMessage("allergen.noKnown")}</p>}
        {recipe.allergens.conditional.length>0&&<p>{uiMessage("allergen.ifAdded")}: {recipe.allergens.conditional.map(g=>allergenName(g.id)).join(", ")}</p>}
        {recipe.allergens.may_contain.length>0&&<p>{uiMessage("allergen.mayContain")}: {recipe.allergens.may_contain.map(g=>allergenName(g.id)).join(", ")}</p>}
        {unverified.length>0&&<p>{uiMessage("allergen.toCheck")}: {[...new Set(unverified)].join(", ")}</p>}
        {recipe.dietary_warnings?.filter(w=>w.severity==="critical").map(w=><p key={w.filterId}><strong>{engineMsgTexts([w.message,w.tip],cms,bcp47).join(" ")}</strong></p>)}
        <p>{uiMessage("allergen.labelNote")}</p>
        {needsMilkNote(recipe.allergens)&&<p>{uiMessage("allergen.milkNote")}</p>}
      </section>
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
              {model.totals.map((row) => (
                <tr key={row.id}>
                  <td>{label(row.id)}</td>
                  <td className="print-sheet__num">{fmt.grams(row.grams)}</td>
                  <td className="print-sheet__num">{phaseBakerPctText(row, bcp47)}</td>
                </tr>
              )).flatMap((tr, i) =>
                /* FW-17 (S08-B-06): il mix di farine sotto la riga Farina, come a
                   schermo (la soia della pinsa è anche un allergene). */
                model.totals[i].id === "flour" && model.flourBlend?.length
                  ? [
                      tr,
                      ...model.flourBlend.map((c) => (
                        <tr key={`blend-${c.name}`} className="print-sheet__sub">
                          <td>
                            ↳ {c.name} {c.pct}%
                            {c.w ? uiMessage("features.recipe.ingredients-section.w-value-f84aef04", [c.w]) : ""}
                          </td>
                          <td className="print-sheet__num">{fmt.grams(c.grams)}</td>
                          <td className="print-sheet__num">{pct(c.pct)}</td>
                        </tr>
                      )),
                    ]
                  : [tr],
              )}
            </tbody>
            <tfoot>
              <tr>
                <th scope="row">{uiMessage("features.recipe.print-sheet.total")}</th>
                <td className="print-sheet__num">{fmt.grams(model.totalDoughG)}</td>
                <td className="print-sheet__num" />
              </tr>
            </tfoot>
          </table>
          {model.preFerment && (
            /* FW-17 (S08-A-11): lo scorporo è una tabella, una colonna per fase,
               con sale, zucchero e grasso nell'impasto finale. */
            <table className="print-sheet__table print-sheet__split">
              <caption className="print-sheet__caption">{uiMessage("recipe.phases.splitTitle")}</caption>
              <thead>
                <tr>
                  <th scope="col">{uiMessage("features.recipe.print-sheet.ingredient")}</th>
                  <th scope="col" className="print-sheet__num">{model.preFerment.name}</th>
                  <th scope="col" className="print-sheet__num">{uiMessage("features.recipe.print-sheet.finalDough")}</th>
                </tr>
              </thead>
              <tbody>
                {splitIds.map((id) => (
                  <tr key={id}>
                    <td>{label(id)}</td>
                    {model.phases.map((phase) => {
                      const ing = phase.ingredients.find((i) => i.id === id);
                      return (
                        <td key={phase.id} className="print-sheet__num">
                          {!ing
                            ? "—"
                            : ing.note === "allInPreferment"
                              ? uiMessage("recipe.phases.waterAllInPreferment")
                              : fmt.grams(ing.grams)}
                        </td>
                      );
                    })}
                  </tr>
                ))}
                <tr>
                  <td>{uiMessage("recipe.phases.waterTempLabel")}</td>
                  {model.phases.map((phase) => (
                    <td key={phase.id} className="print-sheet__num">
                      {phase.waterTempC == null
                        ? "—"
                        : phase.id === "preferment"
                          ? uiMessage("recipe.phases.estimateValue", [fmt.celsius(phase.waterTempC)])
                          : fmt.celsius(phase.waterTempC)}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          )}
          {!model.preFerment && recipe.water_temp_c != null && (
            <p className="print-sheet__note">
              {uiMessage("recipe.phases.waterTempLabel")}: {fmt.celsius(recipe.water_temp_c)}
            </p>
          )}
          {dilution && (
            /* FW-17 (D-O, S08-B-04): l'aiuto per le microdosi anche sulla carta. */
            <p className="print-sheet__note">
              <strong>{dilution.title}.</strong> {dilution.body.join(" ")}
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
                  {uiMessage("features.recipe.print-sheet.perUnit", [unitLabelOne])}
                </th>
                <th scope="col" className="print-sheet__num">{uiMessage("features.recipe.print-sheet.total")}</th>
              </tr>
            </thead>
            <tbody>
              {scaledTopping.ingredients.map((ing) => (
                <tr key={ing.name}>
                  <td>
                    {ing.name}
                    {ing.notes ? ` · ${ing.notes}` : ""}
                  </td>
                  {/* FW-17 (S08-A-11): unità comprese («4 pz»), come a schermo. */}
                  <td className="print-sheet__num">{formatToppingAmountForLocale(ing.amount.value, ing.amount.unit, fmt)}</td>
                  <td className="print-sheet__num">
                    {formatToppingAmountForLocale(ing.amount.value * recipe.dough_balls, ing.amount.unit, fmt)}
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
