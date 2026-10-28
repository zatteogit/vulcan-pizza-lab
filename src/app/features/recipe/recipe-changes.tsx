import { ArrowRight, Droplets, Flame, FlaskConical, Gauge, Timer, Wheat } from "lucide-react";
import { RecipeConditionChips } from "./recipe-condition-chips";
import type { GeneratedRecipe } from "../../domain/pizza-engine";
import { recipeDifferences } from "../../use-cases/recipe-entry";
import { getToppingForStyle } from "../../data/topping-library";
import { localizeToppingRecipe, toppingConcept } from "../../data/topping-i18n/localize";
import { useCms } from "../cms/cms-context";
import { createFormatter } from "../cms/i18n";
import { engineMsgTexts } from "./engine-msg-text";

/** Same underlying differences as the recipe; aligned values make the before
 * and after readable without parsing sentences or repeating units in labels. */
export function RecipeChanges({ from, to, mode }: { from: GeneratedRecipe; to: GeneratedRecipe; mode: "included" | "preview" }) {
  const { cms, bcp47 } = useCms();
  const fmt = createFormatter(cms.ui, bcp47);
  const fatType = to.style.dough.fat_type;
  const fatLabel = fatType === "butter" ? cms.ui.fatButter : fatType === "lard" ? cms.ui.fatLard : cms.ui.oilEvo;
  const differences = recipeDifferences(from, to);
  if (!differences.length) return null;
  const pct = (n: number) => `${fmt.number(n, { maximumFractionDigits: 2 })}%`;
  const pre = (r: GeneratedRecipe) => r.has_pre_ferment
    ? `${r.pre_ferment_type ?? ""} · ${pct(r.pre_ferment_flour_pct ?? 0)}`
    : engineMsgTexts([{key:"card.directDough",fallback:"Impasto diretto"}], cms, bcp47)[0];
  const rows = differences.map(d => {
    const p = d.params ?? {};
    switch (d.key) {
      case "change.topping": {
        const name = (r: GeneratedRecipe) => {
          const topping = getToppingForStyle(r.style.default_topping_ref ?? "", r.style);
          const localized = topping ? localizeToppingRecipe(topping, cms.toppingI18n) : undefined;
          return localized?.name ?? (topping ? toppingConcept(topping.concept_ref, cms.toppingI18n)?.name : undefined) ?? localized?.variant_name ?? "—";
        };
        return {key:d.key, label:cms.cooking.toppingTitle, icon:Wheat, before:name(from), after:name(to)};
      }
      case "change.hydration": return { key: d.key, label: cms.ui.statHydration, icon: Droplets, before: pct(from.hydration_pct), after: pct(to.hydration_pct) };
      case "change.flour": return { key: d.key, label: cms.ui.statFlourStrength, icon: Wheat, before: `W${fmt.number(from.flour_w)}`, after: `W${fmt.number(to.flour_w)}` };
      case "change.flourPL": return { key: d.key, label: cms.configurator.plLabel, icon: Wheat, before: fmt.number(from.flour_pl, { maximumFractionDigits: 2 }), after: fmt.number(to.flour_pl, { maximumFractionDigits: 2 }), tip: cms.configurator.plTip };
      case "change.fermentation": return { key: d.key, label: cms.ui.statFermentation, icon: Timer, before: fmt.durationShort(from.fermentation_hours), after: fmt.durationShort(to.fermentation_hours), beforeSub: fmt.celsius(from.fermentation_temp_c), afterSub: fmt.celsius(to.fermentation_temp_c) };
      case "change.cooking": return { key: d.key, label: cms.ui.statOven, icon: Flame, before: fmt.celsius(from.oven_temp_c), after: fmt.celsius(to.oven_temp_c), beforeSub: fmt.cookTime(from.cook_time_sec), afterSub: fmt.cookTime(to.cook_time_sec) };
      case "change.prefermentOn": case "change.prefermentOff": case "change.prefermentDetails": return { key: d.key, label: cms.configurator.preFermentLabel, icon: FlaskConical, before: pre(from), after: pre(to) };
      default: return { key: d.key, label: d.key === "change.salt" ? cms.ui.salt : d.key === "change.sugar" ? cms.ui.sugar : fatLabel, icon: Droplets, before: pct(Number(p.from)), after: pct(Number(p.to)) };
    }
  });
  const beforeLabel = mode === "included" ? cms.ui.scoreBasisOriginal : cms.ui.recipeCurrentVersion;
  const afterLabel = mode === "included" ? cms.ui.scoreBasisTailored : cms.ui.recipeOptimizedVersion;
  return (
    <section className="recipe-comparison" data-recipe-changes={mode}>
      <table className="recipe-comparison__table">
        {/* FW-12 (S03-B-24): il titolo è la caption della tabella, non un h4 dentro un th. */}
        <caption className="sr-only">{mode === "included" ? cms.ui.recipeAdaptationsIncluded : cms.ui.recipeOptimizationChanges}</caption>
        <thead><tr><th scope="col"><span className="recipe-comparison__title" aria-hidden="true">{mode === "included" ? cms.ui.recipeAdaptationsIncluded : cms.ui.recipeOptimizationChanges}</span></th><th scope="col">{beforeLabel}</th><td aria-hidden="true" /><th scope="col">{afterLabel}</th></tr></thead>
        <tbody>
          <tr className="recipe-comparison__score">
            <th scope="row"><span data-slot="label"><Gauge size={15} aria-hidden="true" />{cms.ui.recipeScoreLabel}</span></th>
            <td>{fmt.number(from.scores.composite)}<small>/100</small></td>
            <td aria-hidden="true"><ArrowRight size={14} /></td>
            <td>{fmt.number(to.scores.composite)}<small>/100</small></td>
          </tr>
          {rows.map(row => {
            const Icon = row.icon;
            return <tr key={row.key}>
              <th scope="row" title={row.tip}><span data-slot="label"><Icon size={15} aria-hidden="true" />{row.label}</span></th>
              <td>{row.before}{row.beforeSub && <small>{row.beforeSub}</small>}</td>
              <td aria-hidden="true"><ArrowRight size={14} /></td>
              <td>{row.after}{row.afterSub && <small>{row.afterSub}</small>}</td>
            </tr>;
          })}
        </tbody>
      </table>
      {mode === "preview" && <RecipeConditionChips recipe={to} />}
    </section>
  );
}
