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
} as const;

export type LearningIllustrationId = keyof typeof VISUALS;

/** Only map terms for which the photographed stage actually explains the text. */
export const GLOSSARY_VISUALS: Readonly<Partial<Record<string, LearningIllustrationId>>> = {
  biga: "biga", poolish: "poolish", autolysis: "autolysis",
  folds: "folds", gluten_development: "windowpane", gluten: "windowpane",
  dough_division: "division", ball_shaping: "ball-shaping",
  poke_test: "poke-test", cornicione: "cornicione",
};

/** These illustrate a gesture in the advice, never a visual diagnosis. */
export const TROUBLESHOOTING_VISUALS: Readonly<Partial<Record<string, LearningIllustrationId>>> = {
  P01: "folds", P02: "stretching", P03: "poke-test", P07: "stretching",
  P16: "stretching", P19: "stretching", P23: "ball-shaping",
};

export function LearningIllustration({ id, decorative = false }: {
  id: LearningIllustrationId;
  decorative?: boolean;
}) {
  const visual = VISUALS[id];
  const image = <img src={visual.src} width={768} height={512} alt="" loading="lazy" decoding="async" data-region="learning-image" />;
  if (decorative) return image;
  return (
    <figure data-region="learning-visual">
      {image}
      <figcaption>
        <p>{visual.caption()}</p>
        <small data-region="learning-source">
          {uiMessage("learn.visual.source")} <a href={visual.source}>{visual.author}</a>
          {visual.cc && <> · <a href="https://creativecommons.org/licenses/by/2.0/">{uiMessage("learn.visual.license")}</a></>}
        </small>
      </figcaption>
    </figure>
  );
}
