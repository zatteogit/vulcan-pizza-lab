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
import { uiMessage } from "../../i18n/ui-messages";

const VISUALS = {
  biga: { src: biga, caption: () => uiMessage("learn.visual.biga"), source: "https://www.flickr.com/photos/grongar/3683817769/", author: "Rebecca Siegel", cc: true },
  poolish: { src: poolish, caption: () => uiMessage("learn.visual.poolish"), source: "https://commons.wikimedia.org/wiki/File:Poolish_for_Artos.jpg", author: "Rebecca Siegel", cc: true },
  autolysis: { src: autolysis, caption: () => uiMessage("learn.visual.autolysis"), source: "https://www.kingarthurbaking.com/blog/2017/09/29/using-the-autolyse-method", author: "King Arthur Baking", cc: false },
  folds: { src: folds, caption: () => uiMessage("learn.visual.folds"), source: "https://www.kingarthurbaking.com/blog/2019/07/22/bulk-fermentation", author: "Maurizio Leo / King Arthur Baking", cc: false },
  windowpane: { src: windowpane, caption: () => uiMessage("learn.visual.windowpane"), source: "https://www.kingarthurbaking.com/blog/2022/10/14/what-is-the-windowpane-test-for-bread-dough", author: "King Arthur Baking", cc: false },
  division: { src: division, caption: () => uiMessage("learn.visual.division"), source: "https://www.kingarthurbaking.com/blog/2015/01/05/best-pizza-youll-ever-make", author: "King Arthur Baking", cc: false },
  "ball-shaping": { src: ballShaping, caption: () => uiMessage("learn.visual.ballShaping"), source: "https://www.kingarthurbaking.com/blog/2015/01/05/best-pizza-youll-ever-make", author: "King Arthur Baking", cc: false },
  "poke-test": { src: pokeTest, caption: () => uiMessage("learn.visual.pokeTest"), source: "https://www.kingarthurbaking.com/blog/2022/08/22/how-to-tell-if-bread-dough-has-risen-enough", author: "King Arthur Baking", cc: false },
  stretching: { src: stretching, caption: () => uiMessage("learn.visual.stretching"), source: "https://www.kingarthurbaking.com/blog/2015/01/05/best-pizza-youll-ever-make", author: "King Arthur Baking", cc: false },
  cornicione: { src: cornicione, caption: () => uiMessage("learn.visual.cornicione"), source: "https://www.kingarthurbaking.com/blog/2015/01/05/best-pizza-youll-ever-make", author: "King Arthur Baking", cc: false },
  "bulk-fermentation": { src: bulkFermentation, caption: () => uiMessage("learn.visual.bulkFermentation"), source: "https://www.kingarthurbaking.com/blog/2019/07/22/bulk-fermentation", author: "Maurizio Leo / King Arthur Baking", cc: false },
  "ball-fermentation": { src: ballFermentation, caption: () => uiMessage("learn.visual.ballFermentation"), source: "https://www.kingarthurbaking.com/blog/2015/01/05/best-pizza-youll-ever-make", author: "King Arthur Baking", cc: false },
  sourdough: { src: sourdough, caption: () => uiMessage("learn.visual.sourdough"), source: "https://www.kingarthurbaking.com/recipes/sourdough-starter-recipe", author: "King Arthur Baking", cc: false },
  yeast: { src: yeast, caption: () => uiMessage("learn.visual.yeast"), source: "https://www.kingarthurbaking.com/blog/2023/04/24/how-to-bake-with-fresh-yeast", author: "Liz Neily, Kristin Teig / King Arthur Baking", cc: false },
  "oven-floor-dome": { src: ovenFloorDome, caption: () => uiMessage("learn.visual.ovenFloorDome"), source: "https://commons.wikimedia.org/wiki/File:Brick-oven-thumbnail.jpg", author: "Beboplu / Wikimedia Commons", cc: false },
  hydration: { src: hydration, caption: () => uiMessage("learn.visual.hydration"), source: "https://fabflour.co.uk/step-by-step-guides/step-by-step-bread", author: "Fab Flour / UK Flour Millers", cc: false },
  "whole-wheat": { src: wholeWheat, caption: () => uiMessage("learn.visual.wholeWheat"), source: "https://commons.wikimedia.org/wiki/File:Whole_wheat_grain_flour_being_scooped.jpg", author: "Margaret Hoogstrate", cc: true, licenseVersion: "3.0" },
  "home-oven": { src: homeOven, caption: () => uiMessage("learn.visual.homeOven"), source: "https://www.kingarthurbaking.com/blog/2015/01/05/best-pizza-youll-ever-make", author: "King Arthur Baking", cc: false },
  "peel-prep": { src: peelPrep, caption: () => uiMessage("learn.visual.peelPrep"), source: "https://www.kingarthurbaking.com/blog/2015/01/05/best-pizza-youll-ever-make", author: "King Arthur Baking", cc: false },
  "stone-temperature": { src: stoneTemperature, caption: () => uiMessage("learn.visual.stoneTemperature"), source: "https://www.williams-sonoma.com/netstorage/pdf/Ooni-IR-Thermometer-UU-P06100-Essentials-Guide.pdf", author: "Ooni", cc: false },
  "water-temperature": { src: waterTemperature, caption: () => uiMessage("learn.visual.waterTemperature"), source: "https://www.kingarthurbaking.com/blog/2018/05/29/desired-dough-temperature", author: "King Arthur Baking", cc: false },
  "mixer-dough": { src: mixerDough, caption: () => uiMessage("learn.visual.mixerDough"), source: "https://www.giallozafferano.com/recipes/Fried-Pizza.html", author: "GialloZafferano", cc: false },
  "frying-seal": { src: fryingSeal, caption: () => uiMessage("learn.visual.fryingSeal"), source: "https://www.giallozafferano.com/recipes/Fried-Pizza.html", author: "GialloZafferano", cc: false },
  "frying-drain": { src: fryingDrain, caption: () => uiMessage("learn.visual.fryingDrain"), source: "https://www.giallozafferano.com/recipes/Fried-Pizza.html", author: "GialloZafferano", cc: false },
  "base-check": { src: baseCheck, caption: () => uiMessage("learn.visual.baseCheck"), source: "https://www.kingarthurbaking.com/blog/2020/06/17/gluten-free-pan-pizza", author: "King Arthur Baking", cc: false },
} as const;

export type LearningIllustrationId = keyof typeof VISUALS;

/** Only map terms for which the photographed stage actually explains the text. */
export const GLOSSARY_VISUALS: Readonly<Partial<Record<string, LearningIllustrationId>>> = {
  biga: "biga", poolish: "poolish", autolysis: "autolysis",
  folds: "folds", gluten_development: "windowpane", gluten: "windowpane",
  dough_division: "division", ball_shaping: "ball-shaping",
  poke_test: "poke-test", cornicione: "cornicione",
  bulk_fermentation: "bulk-fermentation", ball_fermentation: "ball-fermentation",
  sourdough: "sourdough", yeast: "yeast", oven_floor_dome: "oven-floor-dome",
  hydration: "hydration", flour_type: "whole-wheat", thermal_conductivity: "home-oven",
  rule_of_55: "water-temperature", friction_factor: "mixer-dough",
};

/** These illustrate a gesture in the advice, never a visual diagnosis. */
export const TROUBLESHOOTING_VISUALS: Readonly<Partial<Record<string, LearningIllustrationId>>> = {
  P01: "folds", P02: "stretching", P03: "poke-test", P07: "stretching",
  P16: "stretching", P19: "stretching", P23: "ball-shaping",
  P09: "home-oven", P10: "stone-temperature", P22: "peel-prep",
  FR02: "frying-drain", FR03: "frying-seal", P15: "base-check",
};

export function LearningIllustration({ id, decorative = false }: {
  id: LearningIllustrationId;
  decorative?: boolean;
}) {
  const visual = VISUALS[id];
  const image = <img src={visual.src} width={672} height={448} alt="" loading="lazy" decoding="async" data-region="learning-image" />;
  if (decorative) return image;
  return (
    <figure data-region="learning-visual">
      {image}
      <figcaption>
        <p>{visual.caption()}</p>
        <small data-region="learning-source">
          {uiMessage("learn.visual.source")} <a href={visual.source}>{visual.author}</a>
          {visual.cc && <> · <a href={"licenseVersion" in visual ? "https://creativecommons.org/licenses/by/3.0/" : "https://creativecommons.org/licenses/by/2.0/"}>{"licenseVersion" in visual ? uiMessage("learn.visual.license3") : uiMessage("learn.visual.license")}</a></>}
        </small>
      </figcaption>
    </figure>
  );
}
