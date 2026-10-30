import { useId } from "react";
import type { GeneratedRecipe } from "../../domain/pizza-engine";
import { useCms } from "../cms/cms-context";
import { createFormatter, t } from "../cms/i18n";
import { WhyButton } from "../science/why-button";
import { getScienceNote } from "../../data/science-notes";
import { roundForEvidence } from "../../domain/science/evidence";
import { engineMsgTexts } from "./engine-msg-text";

/* FW-02: il fattore di velocità è una stima (nota q10-fermentation): non più
 * decimali di quelli che la nota consente (1,3×, non 1,32×). */
const Q10_NOTE = getScienceNote("q10-fermentation");

/* ═══ M-11 — lievito trasparente ═══
 * Il problema più lamentato nelle app concorrenti: «da dove viene questa dose?».
 * Qui il modello si dichiara (riferimento, ore, temperatura), dice cosa è una
 * stima e quanto può sbagliare, e si corregge con l'esperienza della propria
 * cucina. La correzione vale per tutte le ricette.
 * FW-02: è il «Perché?» della nota yeast-dose. Il foglio dà L1/L2 dal registro,
 * i numeri di questa ricetta (sotto «In questa ricetta») e, chiuso, il L3 con
 * formula, ipotesi e fonti. Sta nella riga del lievito (S08-A-20), non fra le
 * righe degli ingredienti. */

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
  const groupName = useId();
  const model = recipe.science.yeast_model;
  if (!model) return null;

  // Dosi piccole: due decimali significativi (0,17%, non 0,2%).
  const pct = (value: number) =>
    new Intl.NumberFormat(bcp47, { style: "percent", maximumSignificantDigits: 2 }).format(value / 100);
  const grams = (p: number) => fmt.grams(Math.round(((recipe.flour_g * p) / 100) * 10) / 10);
  /* B1 (D-068): la dose viene dalla fonte della versione d'autore. Si dice la
     stima del modello per confronto, l'eventuale conversione per la dispensa,
     e che la correzione personale qui non vale. */
  const source = recipe.yeast_source;
  if (source) {
    const conversions = (recipe.source_notes ?? []).filter((note) => note.key.startsWith("yeast."));
    return (
      <WhyButton noteId="yeast-dose">
        <p className="yeast-explainer__text">
          {t(ui.yeastSourceBody, {
            pct: pct(source.pct),
            hours: fmt.durationShort(recipe.fermentation_hours),
            temp: fmt.celsius(recipe.fermentation_temp_c),
            model: pct(source.model_pct),
          })}
        </p>
        {engineMsgTexts(conversions, cms, bcp47).map((text) => (
          <p key={text} className="yeast-explainer__text">{text}</p>
        ))}
        <p className="yeast-explainer__text yeast-explainer__text--muted">{ui.yeastSourceNote}</p>
      </WhyButton>
    );
  }
  const current =
    YEAST_SPEED_OPTIONS.reduce((best, option) =>
      Math.abs(option.factor - model.personal_factor) < Math.abs(best.factor - model.personal_factor) ? option : best,
    ).factor;

  return (
    <WhyButton noteId="yeast-dose">
      <p className="yeast-explainer__text">
        {t(ui.yeastModelBody, {
          ref: pct(model.reference_pct),
          refHours: fmt.durationShort(model.reference_hours),
          refTemp: fmt.celsius(model.reference_temp_c),
          hours: fmt.durationShort(recipe.fermentation_hours),
          temp: fmt.celsius(recipe.fermentation_temp_c),
          speed: fmt.number(roundForEvidence(model.speed_ratio, Q10_NOTE), { maximumFractionDigits: 2 }),
          pct: pct(recipe.science.yeast_baker_pct),
        })}
        {recipe.yeast_type === "dry" ? ` ${ui.yeastDryNote}` : ""}
      </p>
      <p className="yeast-explainer__text yeast-explainer__text--muted">{ui.yeastTempModelNote}</p>
      <p className="yeast-explainer__text">
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
        <p className="yeast-explainer__text yeast-explainer__text--muted">{ui.yeastPersonalHint}</p>
      </fieldset>
    </WhyButton>
  );
}
