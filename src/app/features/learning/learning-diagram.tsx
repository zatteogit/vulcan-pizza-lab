import { Fragment } from "react";
import { useCms, type CmsContent } from "../cms/cms-context";
import { BRAND } from "../../config/brand";
import arrhenius from "../../../assets/learn/arrhenius-diagram.svg?no-inline";
import proteolysis from "../../../assets/learn/proteolysis-diagram.svg?no-inline";
import aScore from "../../../assets/learn/a-score-diagram.svg?no-inline";
import fScore from "../../../assets/learn/f-score-diagram.svg?no-inline";
import dScore from "../../../assets/learn/d-score-diagram.svg?no-inline";
import { AUTH_AXIS_WEIGHTS, FEAS_AXIS_WEIGHTS } from "../../domain/recipe-score";
import { formatPercent } from "../../i18n/format";
import { getActiveUiLocale, uiMessage } from "../../i18n/ui-messages";

const DIAGRAMS = {
  arrhenius: { src: arrhenius, caption: () => uiMessage("learn.diagram.arrhenius"), labels: (_cms: CmsContent) => ["ln k", "1/T", "Eₐ > 0"], pictures: [] },
  proteolysis: { src: proteolysis, caption: () => uiMessage("learn.diagram.proteolysis"), labels: (_cms: CmsContent) => [uiMessage("learn.diagram.chain"), uiMessage("learn.diagram.hydrolysis"), uiMessage("learn.diagram.fragments")], pictures: [] },
  a_score: { src: aScore, caption: () => uiMessage("learn.diagram.a_score"), labels: (_cms: CmsContent) => [_cms.ui.ingredients, _cms.ui.procedure, _cms.sections.equipment.title], pictures: ["manitoba-flour", "bench-fold", "home-oven"] },
  f_score: { src: fScore, caption: () => uiMessage("learn.diagram.f_score"), labels: (_cms: CmsContent) => [_cms.ui.statOven, _cms.ui.flour, uiMessage("learn.diagram.skill")], pictures: ["home-oven", "manitoba-flour", "windowpane"] },
  d_score: { src: dScore, caption: () => uiMessage("learn.diagram.d_score"), labels: (_cms: CmsContent) => [uiMessage("learn.diagram.duration"), uiMessage("features.recipe.recipe-configurator.df12789a"), _cms.ui.nerdYeast, _cms.ui.procedurePreferment, uiMessage("learn.diagram.model"), uiMessage("pages.method.kind.estimate")], pictures: ["dough-temperature", "yeast", "biga"] },
} as const;
export type LearningDiagramId = keyof typeof DIAGRAMS;
export function isLearningDiagramId(id: string): id is LearningDiagramId {
  return Object.prototype.hasOwnProperty.call(DIAGRAMS, id);
}

type Artwork = Readonly<Record<string, { src: string; source: string; author: string; cc: boolean }>>;
const CODE = "https://github.com/zatteogit/vulcan-pizza-lab/blob/26e0ea995d5918eeb0b3a0f19bfac6294e62dae1/src/app/domain/";
const SOURCES = {
  arrhenius: [["IUPAC", "https://goldbook.iupac.org/terms/view/A00446"], ["Purdue", "https://chemed.chem.purdue.edu/genchem/topicreview/bp/ch22/activate.php"]],
  proteolysis: [["Gene Ontology", "https://amigo.geneontology.org/amigo/term/GO%3A0006508?relation=regulates"], ["Thiele et al. (2004)", "https://pubmed.ncbi.nlm.nih.gov/14995138/"]],
  a_score: [[BRAND.name, CODE + "pizza-engine.ts#L1145"]],
  f_score: [[BRAND.name, CODE + "pizza-engine.ts#L1340"]],
  d_score: [[BRAND.name, CODE + "pizza-engine.ts#L1440"]],
} as const;

export function LearningDiagram({ id, artwork, decorative = false }: { id: LearningDiagramId; artwork: Artwork; decorative?: boolean }) {
  const { cms } = useCms();
  const diagram = DIAGRAMS[id];
  if (decorative) return <img src={diagram.pictures.length ? artwork[diagram.pictures[0]].src : diagram.src} width={672} height={448} alt="" loading="lazy" decoding="async" data-region="learning-image" />;
  const weights = id === "a_score" ? AUTH_AXIS_WEIGHTS : id === "f_score" ? FEAS_AXIS_WEIGHTS : null;
  const image = <div data-region="learning-diagram" data-learning-diagram={id}>
      <img src={diagram.src} width={672} height={448} alt="" loading="lazy" decoding="async" data-region="learning-image" />
      {diagram.pictures.map((key, index) => <img key={key} src={artwork[key].src} alt="" loading="lazy" decoding="async" width={672} height={448} data-diagram-picture={index} />)}
      {diagram.labels(cms).map((label, index) => <span key={index} data-diagram-label={index}>{label}</span>)}
      {weights && Object.values(weights).map((weight, index) => <span key={index} data-diagram-weight={index}>{formatPercent(weight * 100, getActiveUiLocale())}</span>)}
    </div>;
  return <figure data-region="learning-visual">
    {image}
    <figcaption>
      <p>{diagram.caption()}</p>
      <small data-region="learning-source">{uiMessage("science.sheet.sources")} {SOURCES[id].map(([label, url], index) => <Fragment key={url}>{index > 0 && " · "}<a href={url}>{label}</a></Fragment>)}
        {diagram.pictures.map(key => <Fragment key={key}>{" · "}<a href={artwork[key].source}>{artwork[key].author}</a>{artwork[key].cc && <> · <a href="https://creativecommons.org/licenses/by/2.0/">{uiMessage("learn.visual.license")}</a></>}</Fragment>)}
      </small>
    </figcaption>
  </figure>;
}
