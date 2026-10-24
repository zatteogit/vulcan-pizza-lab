import { useId, useState } from "react";
import { Info } from "lucide-react";
import type { GeneratedRecipe } from "../../domain/pizza-engine";
import { useCms } from "../cms/cms-context";
import { createFormatter, t } from "../cms/i18n";

/* ═══ M-11 — lievito trasparente ═══
 * Il problema più lamentato nelle app concorrenti: «da dove viene questa dose?».
 * Qui il modello si dichiara (riferimento, ore, temperatura), dice cosa è una
 * stima e quanto può sbagliare, e si corregge con l'esperienza della propria
 * cucina. La correzione vale per tutte le ricette. */

export const YEAST_SPEED_OPTIONS = [
  { factor: 0.6, key: "yeastSpeedMuchSlower" },
  { factor: 0.8, key: "yeastSpeedSlower" },
  { factor: 1, key: "yeastSpeedAsExpected" },
  { factor: 1.25, key: "yeastSpeedFaster" },
  { factor: 1.6, key: "yeastSpeedMuchFaster" },
] as const;

export function YeastExplainer({
  recipe,
  onSpeedFactorChange,
}: {
  recipe: GeneratedRecipe;
  onSpeedFactorChange: (factor: number) => void;
}) {
  const { cms, bcp47 } = useCms();
  const ui = cms.ui;
  const fmt = createFormatter(ui, bcp47);
  const panelId = useId();
  const groupName = useId();
  const [open, setOpen] = useState(false);
  const model = recipe.science.yeast_model;
  if (!model) return null;

  // Dosi piccole: due decimali significativi (0,17%, non 0,2%).
  const pct = (value: number) =>
    new Intl.NumberFormat(bcp47, { style: "percent", maximumSignificantDigits: 2 }).format(value / 100);
  const grams = (p: number) => fmt.grams(Math.round(((recipe.flour_g * p) / 100) * 10) / 10);
  const current =
    YEAST_SPEED_OPTIONS.reduce((best, option) =>
      Math.abs(option.factor - model.personal_factor) < Math.abs(best.factor - model.personal_factor) ? option : best,
    ).factor;

  return (
    <div className="yeast-explainer">
      <button
        type="button"
        className="type-body yeast-explainer__toggle"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
      >
        <Info size={15} aria-hidden="true" />
        {ui.yeastHowToggle}
      </button>
      {open && (
        <div id={panelId} className="yeast-explainer__panel">
          <p className="type-body yeast-explainer__text">
            {t(ui.yeastModelBody, {
              ref: pct(model.reference_pct),
              refHours: fmt.durationShort(model.reference_hours),
              refTemp: fmt.celsius(model.reference_temp_c),
              hours: fmt.durationShort(recipe.fermentation_hours),
              temp: fmt.celsius(recipe.fermentation_temp_c),
              speed: fmt.number(model.speed_ratio, { maximumFractionDigits: 2 }),
              pct: pct(recipe.science.yeast_baker_pct),
            })}
            {recipe.yeast_type === "dry" ? ` ${ui.yeastDryNote}` : ""}
          </p>
          <p className="type-body yeast-explainer__text yeast-explainer__text--muted">{ui.yeastTempModelNote}</p>
          <p className="type-body yeast-explainer__text">
            {t(ui.yeastEstimateNote, { low: grams(model.range_pct[0]), high: grams(model.range_pct[1]) })}
          </p>
          <fieldset className="yeast-explainer__speed">
            <legend className="type-label yeast-explainer__legend">{ui.yeastPersonalLegend}</legend>
            <div className="yeast-explainer__options">
              {YEAST_SPEED_OPTIONS.map((option) => (
                <label
                  key={option.factor}
                  className={
                    option.factor === current
                      ? "yeast-explainer__option yeast-explainer__option--active"
                      : "yeast-explainer__option"
                  }
                >
                  <input
                    type="radio"
                    name={groupName}
                    value={option.factor}
                    checked={option.factor === current}
                    onChange={() => onSpeedFactorChange(option.factor)}
                    className="yeast-explainer__radio"
                  />
                  {ui[option.key]}
                </label>
              ))}
            </div>
            <p className="type-body yeast-explainer__text yeast-explainer__text--muted">{ui.yeastPersonalHint}</p>
          </fieldset>
        </div>
      )}
    </div>
  );
}
