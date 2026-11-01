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
  "flour-weighing": { src: flourWeighing, caption: () => uiMessage("learn.visual.flourWeighing"), source: "https://www.kingarthurbaking.com/blog/2022/02/18/digital-kitchen-scale", author: "PJ Hamel / King Arthur Baking", cc: false },
  "biga-hand-mixing": { src: bigaHandMixing, caption: () => uiMessage("learn.visual.bigaHandMixing"), source: "https://www.billyparisi.com/biga-recipe/", author: "Chef Billy Parisi", cc: false, extraSources: [{ source: "https://anitalianinmykitchen.com/italian-bread/", author: "Rosemary Molloy" }] },
  "poolish-stirring": { src: poolishStirring, caption: () => uiMessage("learn.visual.poolishStirring"), source: "https://milkandpop.com/homemade-french-baguette/", author: "Tatiana Kamakura / Milk and Pop", cc: false },
  "biga-in-water": { src: bigaInWater, caption: () => uiMessage("learn.visual.bigaInWater"), source: "https://anitalianinmykitchen.com/italian-bread/", author: "Rosemary Molloy", cc: false },
  "autolyse-initial-mix": { src: autolyseInitialMix, caption: () => uiMessage("learn.visual.autolyseInitialMix"), source: "https://www.billyparisi.com/biga-recipe/", author: "Chef Billy Parisi", cc: false, extraSources: [{ source: "https://anitalianinmykitchen.com/italian-bread/", author: "Rosemary Molloy" }, { source: "https://www.theperfectloaf.com/guides/how-to-autolyse/", author: "Maurizio Leo / The Perfect Loaf" }] },
  "manitoba-flour": { src: manitobaFlour, caption: () => uiMessage("learn.visual.manitobaFlour"), source: "https://www.molinomagri.com/it/prodotti/112-180-manitoba", author: "Molino Magri", cc: false },
  "fructan-ingredients": { src: fructanIngredients, caption: () => uiMessage("learn.visual.fructanIngredients"), source: "https://www.monashfodmap.com/about-fodmap-and-ibs/high-and-low-fodmap-foods/", author: "Monash University / Monash FODMAP", cc: false },
  "fermented-salami": { src: fermentedSalami, caption: () => uiMessage("learn.visual.fermentedSalami"), source: "https://www.salamecacciatore.it/il-prodotto/", author: "Consorzio Cacciatore Italiano", cc: false, scientificSource: { source: "https://www.efsa.europa.eu/en/efsajournal/pub/2393", label: () => uiMessage("learn.visual.efsa") } },
  "pizza-serving": { src: pizzaServing, caption: () => uiMessage("learn.visual.pizzaServing"), source: "https://www.kingarthurbaking.com/blog/2026/07/06/pizza-party-ideas", author: "Patrick Marinello / King Arthur Baking; food styling Yekaterina Boytsova", cc: false },
  "farinograph-bowl": { src: farinographBowl, caption: () => uiMessage("learn.visual.farinographBowl"), source: "https://www.anton-paar.com/us-en/products/details/farinograph/", author: "Brabender / Anton Paar", cc: false },
  "farinograph-readout": { src: farinographReadout, caption: () => uiMessage("learn.visual.farinographReadout"), source: "https://www.anton-paar.com/us-en/products/details/farinograph/", author: "Brabender / Anton Paar", cc: false },
  "lactic-bacteria": { src: lacticBacteria, caption: () => uiMessage("learn.visual.lacticBacteria"), source: "https://commons.wikimedia.org/wiki/File:Lactobacillus_paracasei.jpg", author: "Dr. Horst Neve / Max Rubner-Institut", cc: false, license: { url: "https://creativecommons.org/licenses/by-sa/3.0/", label: () => uiMessage("learn.visual.licenseSa3") } },
  "bread-freezer-portions": { src: breadFreezerPortions, caption: () => uiMessage("learn.visual.breadFreezerPortions"), source: "https://www.kingarthurbaking.com/blog/2020/07/08/the-best-way-to-store-yeast-bread", author: "PJ Hamel / King Arthur Baking", cc: false },
  "alveograph-bubble": { src: alveographBubble, caption: () => uiMessage("learn.visual.alveographBubble"), source: "https://www.kpmanalytics.com/products/functional-rheological/alveolab", author: "KPM Analytics", cc: false },
  "falling-number-tubes": { src: fallingNumberTubes, caption: () => uiMessage("learn.visual.fallingNumberTubes"), source: "https://www.montana.edu/barleybreeding/learning-center/learn-about-testing/Falling-Number.html", author: "Montana State University", cc: false },
  "browned-crust": { src: brownedCrust, caption: () => uiMessage("learn.visual.brownedCrust"), source: "https://www.kingarthurbaking.com/blog/2022/02/15/understanding-the-maillard-reaction-in-baking", author: "Raymond Prado / King Arthur Baking", cc: false },
  "caramel-sugar": { src: caramelSugar, caption: () => uiMessage("learn.visual.caramelSugar"), source: "https://umamidays.com/how-to-caramelize-sugar/", author: "Connie Veneracion / Umami Days", cc: false },
  "starch-paste": { src: starchPaste, caption: () => uiMessage("learn.visual.starchPaste"), source: "https://www.kingarthurbaking.com/blog/2018/03/26/introduction-to-tangzhong", author: "PJ Hamel / King Arthur Baking", cc: false },
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
  "portion-weighing": { src: portionWeighing, caption: () => uiMessage("learn.visual.portionWeighing"), source: "https://www.kingarthurbaking.com/blog/2020/03/16/how-to-make-a-simple-hearth-bread", author: "King Arthur Baking", cc: false },
  "mozzarella-drying": { src: mozzarellaDrying, caption: () => uiMessage("learn.visual.mozzarellaDrying"), source: "https://mypizzacorner.com/pizza-tips/how-to-drain-mozzarella-for-pizza/", author: "Tom Rothwell / My Pizza Corner", cc: false },
  "stone-brushing": { src: stoneBrushing, caption: () => uiMessage("learn.visual.stoneBrushing"), source: "https://ooni.com/blogs/ooni-insights/how-to-clean-a-pizza-stone", author: "Ooni", cc: false },
  "pizza-turning": { src: pizzaTurning, caption: () => uiMessage("learn.visual.pizzaTurning"), source: "https://ooni.com/products/ooni-pizza-turning-peel", author: "Ooni", cc: false },
  "oil-temperature": { src: oilTemperature, caption: () => uiMessage("learn.visual.oilTemperature"), source: "https://blog.thermoworks.com/best-thermometer-for-deep-frying/", author: "ThermoWorks", cc: false },
  "dough-temperature": { src: doughTemperature, caption: () => uiMessage("learn.visual.doughTemperature"), source: "https://www.kingarthurbaking.com/blog/2018/05/29/desired-dough-temperature", author: "King Arthur Baking", cc: false },
  "covered-rest": { src: coveredRest, caption: () => uiMessage("learn.visual.coveredRest"), source: "https://www.kingarthurbaking.com/blog/2021/09/28/how-to-refrigerate-bread-dough-to-bake-later", author: "Mark Weinberg / King Arthur Baking", cc: false },
  "covered-storage": { src: coveredStorage, caption: () => uiMessage("learn.visual.coveredStorage"), source: "https://www.kingarthurbaking.com/blog/2023/04/18/never-cover-rising-bread-dough-with-towel", author: "King Arthur Baking", cc: false },
  "remilled-semolina": { src: remilledSemolina, caption: () => uiMessage("learn.visual.remilledSemolina"), source: "https://shop.drax-muehle.de/produkte/detail/1333/bio-hartweizenmehl-semola-di-grano-duro-rimacinata-1-kg", author: "Drax-Mühle", cc: false },
  "sauce-dosing": { src: sauceDosing, caption: () => uiMessage("learn.visual.sauceDosing"), source: "https://www.pexels.com/photo/putting-tomato-sauce-on-dough-for-pizza-17637072/", author: "Saulo Leite / Pexels", cc: false },
  "bench-fold": { src: benchFold, caption: () => uiMessage("learn.visual.benchFold"), source: "https://www.kingarthurbaking.com/blog/2017/06/19/kneading-wet-dough-by-hand", author: "King Arthur Baking", cc: false },
  "preferment-pair": { src: prefermentPair, caption: () => uiMessage("learn.visual.prefermentPair"), source: "https://www.flickr.com/photos/grongar/3683817769/", author: "Rebecca Siegel", cc: true, extraSource: { source: "https://commons.wikimedia.org/wiki/File:Poolish_for_Artos.jpg", label: () => uiMessage("learn.visual.poolishPhoto") } },
  "stretching-properties": { src: stretching, caption: () => uiMessage("learn.visual.stretchingProperties"), source: "https://www.kingarthurbaking.com/blog/2015/01/05/best-pizza-youll-ever-make", author: "King Arthur Baking", cc: false },
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
  P01: ["folds"], P02: ["stretching"], P03: ["poke-test"], P07: ["stretching", "covered-rest"],
  P16: ["stretching"], P19: ["stretching", "covered-rest"], P23: ["ball-shaping"],
  P04: ["dough-temperature"], P05: ["covered-storage"], P21: ["covered-storage"],
  P08: ["stretching"],
  P11: ["home-oven"], P17: ["pizza-serving"],
  P09: ["home-oven"], P10: ["stone-temperature"], P22: ["peel-prep"],
  FR02: ["frying-drain"], FR03: ["frying-seal"], P15: ["base-check", "stone-brushing"],
  FR01: ["oil-temperature"], P18: ["mozzarella-drying", "sauce-dosing"], P14: ["pizza-turning"],
};

export function LearningIllustration({ id, decorative = false }: {
  id: LearningIllustrationId;
  decorative?: boolean;
}) {
  if (isLearningDiagramId(id)) return <LearningDiagram id={id} artwork={LEARNING_ARTWORK} decorative={decorative} />;
  const visual = LEARNING_ARTWORK[id];
  // Photo inspiration stays in the internal registry. Declared licensed
  // adaptations and sources supporting factual content keep their credits.
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
