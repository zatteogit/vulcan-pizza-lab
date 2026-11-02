import doughTearPinching from "../../../assets/learn/dough-tear-pinching.webp";
import gentleBubblePress from "../../../assets/learn/gentle-bubble-press.webp";
import plainParbakedBase from "../../../assets/learn/plain-parbaked-base.webp";
import friedPieceInterior from "../../../assets/learn/fried-piece-interior.webp";
import yeastPrecisionWeighing from "../../../assets/learn/yeast-precision-weighing.webp";
import sourdoughDoseWeighing from "../../../assets/learn/sourdough-dose-weighing.webp";
import stoneSteelSurfaces from "../../../assets/learn/stone-steel-surfaces.webp";
import waterActivitySample from "../../../assets/learn/water-activity-sample.webp";
import poolishFinalMix from "../../../assets/learn/poolish-final-mix.webp";
import autolyseFinalIncorporation from "../../../assets/learn/autolyse-final-incorporation.webp";
import handBackStretching from "../../../assets/learn/hand-back-stretching.webp";
import roomAirTemperature from "../../../assets/learn/room-air-temperature.webp";
import fridgeShelfTemperature from "../../../assets/learn/fridge-shelf-temperature.webp";
import flourTemperature from "../../../assets/learn/flour-temperature.webp";
import yeastFreshnessCheck from "../../../assets/learn/yeast-freshness-check.webp";
import doughVolumeComparison from "../../../assets/learn/dough-volume-comparison.webp";
import biga from "../../../assets/learn/biga.webp";
import poolish from "../../../assets/learn/poolish.webp";
import autolysis from "../../../assets/learn/autolysis.webp";
import folds from "../../../assets/learn/folds.webp";
import windowpane from "../../../assets/learn/windowpane.webp";
import division from "../../../assets/learn/division.webp";
import ballShaping from "../../../assets/learn/ball-shaping.webp";
import pokeTest from "../../../assets/learn/poke-test.webp";
import stretching from "../../../assets/learn/stretching.webp";
import cornicione from "../../../assets/learn/cornicione.webp";
import bulkFermentation from "../../../assets/learn/bulk-fermentation.webp";
import ballFermentation from "../../../assets/learn/ball-fermentation.webp";
import sourdough from "../../../assets/learn/sourdough.webp";
import yeast from "../../../assets/learn/yeast.webp";
import ovenFloorDome from "../../../assets/learn/oven-floor-dome.webp";
import hydration from "../../../assets/learn/hydration.webp";
import wholeWheat from "../../../assets/learn/whole-wheat.webp";
import homeOven from "../../../assets/learn/home-oven.webp";
import peelPrep from "../../../assets/learn/peel-prep.webp";
import stoneTemperature from "../../../assets/learn/stone-temperature.webp";
import waterTemperature from "../../../assets/learn/water-temperature.webp";
import mixerDough from "../../../assets/learn/mixer-dough.webp";
import fryingSeal from "../../../assets/learn/frying-seal.webp";
import fryingDrain from "../../../assets/learn/frying-drain.webp";
import baseCheck from "../../../assets/learn/base-check.webp";
import portionWeighing from "../../../assets/learn/portion-weighing.webp";
import mozzarellaDrying from "../../../assets/learn/mozzarella-drying.webp";
import stoneBrushing from "../../../assets/learn/stone-brushing.webp";
import pizzaTurning from "../../../assets/learn/pizza-turning.webp";
import oilTemperature from "../../../assets/learn/oil-temperature.webp";
import doughTemperature from "../../../assets/learn/dough-temperature.webp";
import coveredRest from "../../../assets/learn/covered-rest.webp";
import coveredStorage from "../../../assets/learn/covered-storage.webp";
import remilledSemolina from "../../../assets/learn/remilled-semolina.webp";
import sauceDosing from "../../../assets/learn/sauce-dosing.webp";
import benchFold from "../../../assets/learn/bench-fold.webp";
import prefermentPair from "../../../assets/learn/preferment-pair.webp";
import alveographBubble from "../../../assets/learn/alveograph-bubble.webp";
import fallingNumberTubes from "../../../assets/learn/falling-number-tubes.webp";
import brownedCrust from "../../../assets/learn/browned-crust.webp";
import caramelSugar from "../../../assets/learn/caramel-sugar.webp";
import starchPaste from "../../../assets/learn/starch-paste.webp";
import farinographBowl from "../../../assets/learn/farinograph-bowl.webp";
import farinographReadout from "../../../assets/learn/farinograph-readout.webp";
import lacticBacteria from "../../../assets/learn/lactic-bacteria.webp";
import breadFreezerPortions from "../../../assets/learn/bread-freezer-portions.webp";
import manitobaFlour from "../../../assets/learn/manitoba-flour.webp";
import fructanIngredients from "../../../assets/learn/fructan-ingredients.webp";
import fermentedSalami from "../../../assets/learn/fermented-salami.webp";
import pizzaServing from "../../../assets/learn/pizza-serving.webp";
import flourWeighing from "../../../assets/learn/flour-weighing.webp";
import bigaHandMixing from "../../../assets/learn/biga-hand-mixing.webp";
import poolishStirring from "../../../assets/learn/poolish-stirring.webp";
import bigaInWater from "../../../assets/learn/biga-in-water.webp";
import autolyseInitialMix from "../../../assets/learn/autolyse-initial-mix.webp";
import { LearningDiagram, isLearningDiagramId, type LearningDiagramId } from "./learning-diagram";
import { uiMessage } from "../../i18n/ui-messages";

const LEARNING_ARTWORK = {
  "dough-tear-pinching": { src: doughTearPinching, caption: () => uiMessage("learn.visual.doughTearPinching"), cc: false },
  "gentle-bubble-press": { src: gentleBubblePress, caption: () => uiMessage("learn.visual.gentleBubblePress"), cc: false },
  "plain-parbaked-base": { src: plainParbakedBase, caption: () => uiMessage("learn.visual.plainParbakedBase"), cc: false },
  "fried-piece-interior": { src: friedPieceInterior, caption: () => uiMessage("learn.visual.friedPieceInterior"), cc: false },

  "yeast-precision-weighing": { src: yeastPrecisionWeighing, caption: () => uiMessage("learn.visual.yeastPrecisionWeighing"), cc: false },
  "sourdough-dose-weighing": { src: sourdoughDoseWeighing, caption: () => uiMessage("learn.visual.sourdoughDoseWeighing"), cc: false },
  "stone-steel-surfaces": { src: stoneSteelSurfaces, caption: () => uiMessage("learn.visual.stoneSteelSurfaces"), cc: false },
  "water-activity-sample": { src: waterActivitySample, caption: () => uiMessage("learn.visual.waterActivitySample"), cc: false },

  "poolish-final-mix": { src: poolishFinalMix, caption: () => uiMessage("learn.visual.poolishFinalMix"), cc: false },
  "autolyse-final-incorporation": { src: autolyseFinalIncorporation, caption: () => uiMessage("learn.visual.autolyseFinalIncorporation"), cc: false },
  "hand-back-stretching": { src: handBackStretching, caption: () => uiMessage("learn.visual.handBackStretching"), cc: false },

  "room-air-temperature": { src: roomAirTemperature, caption: () => uiMessage("learn.visual.roomAirTemperature"), cc: false },
  "fridge-shelf-temperature": { src: fridgeShelfTemperature, caption: () => uiMessage("learn.visual.fridgeShelfTemperature"), cc: false },
  "flour-temperature": { src: flourTemperature, caption: () => uiMessage("learn.visual.flourTemperature"), cc: false },
  "yeast-freshness-check": { src: yeastFreshnessCheck, caption: () => uiMessage("learn.visual.yeastFreshnessCheck"), cc: false },
  "dough-volume-comparison": { src: doughVolumeComparison, caption: () => uiMessage("learn.visual.doughVolumeComparison"), cc: false },

  "flour-weighing": { src: flourWeighing, caption: () => uiMessage("learn.visual.flourWeighing"), cc: false },
  "biga-hand-mixing": { src: bigaHandMixing, caption: () => uiMessage("learn.visual.bigaHandMixing"), cc: false },
  "poolish-stirring": { src: poolishStirring, caption: () => uiMessage("learn.visual.poolishStirring"), cc: false },
  "biga-in-water": { src: bigaInWater, caption: () => uiMessage("learn.visual.bigaInWater"), cc: false },
  "autolyse-initial-mix": { src: autolyseInitialMix, caption: () => uiMessage("learn.visual.autolyseInitialMix"), cc: false },
  "manitoba-flour": { src: manitobaFlour, caption: () => uiMessage("learn.visual.manitobaFlour"), cc: false },
  "fructan-ingredients": { src: fructanIngredients, caption: () => uiMessage("learn.visual.fructanIngredients"), cc: false },
  "fermented-salami": { src: fermentedSalami, caption: () => uiMessage("learn.visual.fermentedSalami"), cc: false, scientificSource: { source: "https://www.efsa.europa.eu/en/efsajournal/pub/2393", label: () => uiMessage("learn.visual.efsa") } },
  "pizza-serving": { src: pizzaServing, caption: () => uiMessage("learn.visual.pizzaServing"), cc: false },
  "farinograph-bowl": { src: farinographBowl, caption: () => uiMessage("learn.visual.farinographBowl"), cc: false },
  "farinograph-readout": { src: farinographReadout, caption: () => uiMessage("learn.visual.farinographReadout"), cc: false },
  "lactic-bacteria": { src: lacticBacteria, caption: () => uiMessage("learn.visual.lacticBacteria"), source: "https://commons.wikimedia.org/wiki/File:Lactobacillus_paracasei.jpg", author: "Dr. Horst Neve / Max Rubner-Institut", cc: false, license: { url: "https://creativecommons.org/licenses/by-sa/3.0/", label: () => uiMessage("learn.visual.licenseSa3") } },
  "bread-freezer-portions": { src: breadFreezerPortions, caption: () => uiMessage("learn.visual.breadFreezerPortions"), cc: false },
  "alveograph-bubble": { src: alveographBubble, caption: () => uiMessage("learn.visual.alveographBubble"), cc: false },
  "falling-number-tubes": { src: fallingNumberTubes, caption: () => uiMessage("learn.visual.fallingNumberTubes"), cc: false },
  "browned-crust": { src: brownedCrust, caption: () => uiMessage("learn.visual.brownedCrust"), cc: false },
  "caramel-sugar": { src: caramelSugar, caption: () => uiMessage("learn.visual.caramelSugar"), cc: false },
  "starch-paste": { src: starchPaste, caption: () => uiMessage("learn.visual.starchPaste"), cc: false },
  biga: { src: biga, caption: () => uiMessage("learn.visual.biga"), source: "https://www.flickr.com/photos/grongar/3683817769/", author: "Rebecca Siegel", cc: true },
  poolish: { src: poolish, caption: () => uiMessage("learn.visual.poolish"), source: "https://commons.wikimedia.org/wiki/File:Poolish_for_Artos.jpg", author: "Rebecca Siegel", cc: true },
  autolysis: { src: autolysis, caption: () => uiMessage("learn.visual.autolysis"), cc: false },
  folds: { src: folds, caption: () => uiMessage("learn.visual.folds"), cc: false },
  windowpane: { src: windowpane, caption: () => uiMessage("learn.visual.windowpane"), cc: false },
  division: { src: division, caption: () => uiMessage("learn.visual.division"), cc: false },
  "ball-shaping": { src: ballShaping, caption: () => uiMessage("learn.visual.ballShaping"), cc: false },
  "poke-test": { src: pokeTest, caption: () => uiMessage("learn.visual.pokeTest"), cc: false },
  stretching: { src: stretching, caption: () => uiMessage("learn.visual.stretching"), cc: false },
  cornicione: { src: cornicione, caption: () => uiMessage("learn.visual.cornicione"), cc: false },
  "bulk-fermentation": { src: bulkFermentation, caption: () => uiMessage("learn.visual.bulkFermentation"), cc: false },
  "ball-fermentation": { src: ballFermentation, caption: () => uiMessage("learn.visual.ballFermentation"), cc: false },
  sourdough: { src: sourdough, caption: () => uiMessage("learn.visual.sourdough"), cc: false },
  yeast: { src: yeast, caption: () => uiMessage("learn.visual.yeast"), cc: false },
  "oven-floor-dome": { src: ovenFloorDome, caption: () => uiMessage("learn.visual.ovenFloorDome"), cc: false },
  hydration: { src: hydration, caption: () => uiMessage("learn.visual.hydration"), cc: false },
  "whole-wheat": { src: wholeWheat, caption: () => uiMessage("learn.visual.wholeWheat"), source: "https://commons.wikimedia.org/wiki/File:Whole_wheat_grain_flour_being_scooped.jpg", author: "Margaret Hoogstrate", cc: true, licenseVersion: "3.0" },
  "home-oven": { src: homeOven, caption: () => uiMessage("learn.visual.homeOven"), cc: false },
  "peel-prep": { src: peelPrep, caption: () => uiMessage("learn.visual.peelPrep"), cc: false },
  "stone-temperature": { src: stoneTemperature, caption: () => uiMessage("learn.visual.stoneTemperature"), cc: false },
  "water-temperature": { src: waterTemperature, caption: () => uiMessage("learn.visual.waterTemperature"), cc: false },
  "mixer-dough": { src: mixerDough, caption: () => uiMessage("learn.visual.mixerDough"), cc: false },
  "frying-seal": { src: fryingSeal, caption: () => uiMessage("learn.visual.fryingSeal"), cc: false },
  "frying-drain": { src: fryingDrain, caption: () => uiMessage("learn.visual.fryingDrain"), cc: false },
  "base-check": { src: baseCheck, caption: () => uiMessage("learn.visual.baseCheck"), cc: false },
  "portion-weighing": { src: portionWeighing, caption: () => uiMessage("learn.visual.portionWeighing"), cc: false },
  "mozzarella-drying": { src: mozzarellaDrying, caption: () => uiMessage("learn.visual.mozzarellaDrying"), cc: false },
  "stone-brushing": { src: stoneBrushing, caption: () => uiMessage("learn.visual.stoneBrushing"), cc: false },
  "pizza-turning": { src: pizzaTurning, caption: () => uiMessage("learn.visual.pizzaTurning"), cc: false },
  "oil-temperature": { src: oilTemperature, caption: () => uiMessage("learn.visual.oilTemperature"), cc: false },
  "dough-temperature": { src: doughTemperature, caption: () => uiMessage("learn.visual.doughTemperature"), cc: false },
  "covered-rest": { src: coveredRest, caption: () => uiMessage("learn.visual.coveredRest"), cc: false },
  "covered-storage": { src: coveredStorage, caption: () => uiMessage("learn.visual.coveredStorage"), cc: false },
  "remilled-semolina": { src: remilledSemolina, caption: () => uiMessage("learn.visual.remilledSemolina"), cc: false },
  "sauce-dosing": { src: sauceDosing, caption: () => uiMessage("learn.visual.sauceDosing"), cc: false },
  "bench-fold": { src: benchFold, caption: () => uiMessage("learn.visual.benchFold"), cc: false },
  "preferment-pair": { src: prefermentPair, caption: () => uiMessage("learn.visual.prefermentPair"), source: "https://www.flickr.com/photos/grongar/3683817769/", author: "Rebecca Siegel", cc: true, extraSource: { source: "https://commons.wikimedia.org/wiki/File:Poolish_for_Artos.jpg", label: () => uiMessage("learn.visual.poolishPhoto") } },
  "stretching-properties": { src: stretching, caption: () => uiMessage("learn.visual.stretchingProperties"), cc: false },
} as const;

export type LearningIllustrationId = keyof typeof LEARNING_ARTWORK | LearningDiagramId;

/** Only map terms for which the photographed stage actually explains the text. */
export const GLOSSARY_VISUALS: Readonly<Partial<Record<string, LearningIllustrationId>>> = {
  arrhenius: "arrhenius", proteolysis: "proteolysis", a_score: "a_score", f_score: "f_score", d_score: "d_score",
  manitoba: "manitoba-flour", fodmap: "fructan-ingredients", histamine: "fermented-salami",
  absorption: "farinograph-bowl", stability: "farinograph-readout",
  lab: "lactic-bacteria", retrogradation: "bread-freezer-portions",
  w_alveograph: "alveograph-bubble",
  falling_number: "falling-number-tubes",
  maillard: "browned-crust",
  caramelization: "caramel-sugar",
  starch_gelatinization: "starch-paste",
  biga: "biga", poolish: "poolish", autolysis: "autolysis",
  folds: "folds", gluten_development: "bench-fold", gluten: "windowpane",
  dough_division: "division", ball_shaping: "ball-shaping",
  poke_test: "poke-test", cornicione: "cornicione",
  bulk_fermentation: "bulk-fermentation", ball_fermentation: "ball-fermentation",
  sourdough: "sourdough", yeast: "yeast", oven_floor_dome: "oven-floor-dome",
  hydration: "hydration", flour_type: "whole-wheat", thermal_conductivity: "home-oven",
  rule_of_55: "water-temperature", friction_factor: "mixer-dough",
  thickness_factor: "portion-weighing",
  q10: "dough-temperature", semola_rimacinata: "remilled-semolina",
  pre_ferment: "preferment-pair",
  p_tenacity: "stretching-properties", l_extensibility: "stretching-properties", pl_ratio: "stretching-properties",
};

/** These illustrate a gesture in the advice, never a visual diagnosis. */
export const TROUBLESHOOTING_VISUALS: Readonly<Partial<Record<string, readonly LearningIllustrationId[]>>> = {
  P01: ["folds"], P02: ["dough-tear-pinching", "stretching", "hand-back-stretching"], P03: ["poke-test", "dough-volume-comparison"], P07: ["stretching", "covered-rest"],
  P16: ["stretching", "hand-back-stretching"], P19: ["stretching", "covered-rest"], P23: ["ball-shaping"],
  P04: ["dough-temperature", "yeast-freshness-check"], P05: ["covered-storage", "dough-volume-comparison"], P21: ["covered-storage", "fridge-shelf-temperature"],
  P08: ["gentle-bubble-press"],
  P11: ["home-oven"], P17: ["pizza-serving"],
  P09: ["home-oven", "plain-parbaked-base"], P10: ["stone-temperature"], P22: ["peel-prep"],
  FR02: ["frying-drain"], FR03: ["frying-seal"], P15: ["base-check", "stone-brushing"],
  FR01: ["oil-temperature", "fried-piece-interior"], P18: ["plain-parbaked-base", "mozzarella-drying", "sauce-dosing"], P14: ["pizza-turning"],
};

export function LearningIllustration({ id, decorative = false }: {
  id: LearningIllustrationId;
  decorative?: boolean;
}) {
  if (isLearningDiagramId(id)) return <LearningDiagram id={id} artwork={LEARNING_ARTWORK} decorative={decorative} />;
  const visual = LEARNING_ARTWORK[id];
  // Photo inspiration is archived in design-assets/learn-photographic-inspiration.json.
  // Declared licensed adaptations and factual sources keep their credits.
  const attributed = visual.cc || "license" in visual;
  const image = <img src={visual.src} width={672} height={448} alt="" loading="lazy" decoding="async" data-region="learning-image" />;
  if (decorative) return image;
  return (
    <figure data-region="learning-visual">
      {image}
      <figcaption>
        <p>{visual.caption()}</p>
        {attributed && <small data-region="learning-source">
          {uiMessage("learn.visual.source")} <a href={visual.source}>{visual.author}</a>
          {"extraSource" in visual && <> · <a href={visual.extraSource.source}>{visual.extraSource.label()}</a></>}
          {"license" in visual && <> · <a href={visual.license.url}>{visual.license.label()}</a></>}
          {visual.cc && <> · <a href={"licenseVersion" in visual ? "https://creativecommons.org/licenses/by/3.0/" : "https://creativecommons.org/licenses/by/2.0/"}>{"licenseVersion" in visual ? uiMessage("learn.visual.license3") : uiMessage("learn.visual.license")}</a></>}
        </small>}
        {"scientificSource" in visual && <small data-region="learning-source">
          {uiMessage("science.sheet.sources")} <a href={visual.scientificSource.source}>{visual.scientificSource.label()}</a>
        </small>}
      </figcaption>
    </figure>
  );
}
