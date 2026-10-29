import { useCallback } from "react";
import { recommendStyles, type UserConstraints } from "../../domain/pizza-engine";
import { tailoredRecipeEntry } from "../../use-cases/recipe-entry";
import { useStylesOverride } from "../../context/styles-override-context";
import { useCms } from "../cms/cms-context";

/** FW-09: le stesse raccomandazioni delle card di Crea (stili, pesi e ricetta
 *  su misura), per chiedere al motore se un momento ha stili fattibili. */
export function useRecommend() {
  const { effectiveStyles, isOverrideActive } = useStylesOverride();
  const { cms } = useCms();
  const dims = cms.scoreDimensions;
  return useCallback(
    (constraints: UserConstraints) => recommendStyles(
      constraints,
      isOverrideActive ? effectiveStyles : undefined,
      cms.recommendationWeights,
      (style, current) => tailoredRecipeEntry(style, current, {
        authenticity: dims?.authenticity?.weight,
        feasibility: dims?.feasibility?.weight,
        digestibility: dims?.digestibility?.weight,
        sustainability: dims?.sustainability?.weight,
        experimentation: dims?.experimentation?.weight,
      }).recipe,
    ),
    [effectiveStyles, isOverrideActive, cms.recommendationWeights, dims],
  );
}
