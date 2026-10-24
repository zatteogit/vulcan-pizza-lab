import { getInterpretationsForStyle, type Interpretation } from "../../data/interpretation-library";
import { getVersions, type StyleVersion } from "../../data/style-versions";
import { resolveTopping } from "../../data/topping-library";
import {
  defaultFermentTempC,
  defaultPanShape,
  generateRecipe,
  optimizeRecipe,
  type GeneratedRecipe,
  type PizzaStyle,
  type UserConstraints,
} from "../../domain/pizza-engine";
import { styleWithSelectedTopping } from "../../hooks/use-recipe-state";
import type { CmsContent } from "../cms/cms-context";

/* ═══ D-041 — Compatibilità con la tua cucina ═══
 * Un solo numero per uno stile, ovunque (card di Scopri e Crea, scheda dello
 * stile, ricetta aperta): il punteggio della ricetta ORIGINALE calcolata sulla
 * tua cucina, cioè quella che si apre senza toccare nulla. Il «puoi arrivare
 * a» è il secondo valore: il meglio fra ricetta ottimizzata e versioni dei
 * maestri. Prima ogni schermata usava una metrica diversa (adattamento per
 * l'ordinamento, ricetta ottimizzata, originale): 39, 51, 45 e 49 per la
 * stessa napoletana. */

type ScoreWeights = Parameters<typeof generateRecipe>[2] extends infer O
  ? O extends { scoreWeights?: infer W } ? W : never
  : never;

/** I pesi dei punteggi dal CMS, come li usa la scheda ricetta: senza, le card
 *  davano circa 15 punti in più della ricetta aperta. */
export function scoreWeightsFromCms(cms: Pick<CmsContent, "scoreDimensions">): ScoreWeights {
  const d = cms.scoreDimensions;
  return {
    authenticity: d?.authenticity?.weight,
    feasibility: d?.feasibility?.weight,
    digestibility: d?.digestibility?.weight,
    sustainability: d?.sustainability?.weight,
    experimentation: d?.experimentation?.weight,
  } as ScoreWeights;
}

/** Versione «canonica» di uno stile: la più esperta, a parità la più lunga. */
export function getCanonicalVersion(styleId: string): StyleVersion | null {
  const versions = getVersions(styleId);
  if (versions.length === 0) return null;
  return versions.reduce((best, version) => {
    if (version.skill_hint !== best.skill_hint) {
      return version.skill_hint > best.skill_hint ? version : best;
    }
    return version.params.fermentation_hours > best.params.fermentation_hours ? version : best;
  }, versions[0]);
}

export function defaultPL(style: PizzaStyle): number {
  return Math.round(((style.dough.flour_pl_range[0] + style.dough.flour_pl_range[1]) / 2) * 100) / 100;
}

/** La variante legata a doppio filo allo stile (disciplinari AVPN/IGP/APITER). */
export function canonicalInterpretation(style: PizzaStyle): Interpretation | null {
  return getInterpretationsForStyle(style.id).find((it) => it.verified_canonical) ?? null;
}

/** La ricetta originale sulla cucina dell'utente, con gli stessi parametri
 *  con cui la scheda dello stile si apre in modalità canonica. */
export function canonicalRecipe(
  style: PizzaStyle,
  constraints: UserConstraints,
  scoreWeights?: ScoreWeights,
): GeneratedRecipe {
  const interp = canonicalInterpretation(style);
  const o = interp?.parameter_overrides;
  const version = interp ? null : getCanonicalVersion(style.id);
  const v = version?.params;
  const fMid = Math.min(
    Math.round((style.dough.fermentation_hours_range[0] + style.dough.fermentation_hours_range[1]) / 2),
    48,
  );
  const hours = o?.fermentation_hours ?? v?.fermentation_hours ?? fMid;
  const toppingRaw = interp?.base_topping_concept_id ?? null;
  const topping = toppingRaw ? (resolveTopping(toppingRaw, style)?.id ?? toppingRaw) : null;
  return generateRecipe(styleWithSelectedTopping(style, topping), constraints, {
    customHydration:
      o?.hydration_pct ??
      v?.hydration_pct ??
      Math.round((style.dough.hydration_pct_range[0] + style.dough.hydration_pct_range[1]) / 2),
    customFlourW:
      o?.flour_w ?? v?.flour_w ?? Math.round((style.dough.flour_w_range[0] + style.dough.flour_w_range[1]) / 2),
    customFlourPL: o?.flour_pl ?? v?.flour_pl ?? defaultPL(style),
    customFermentationHours: hours,
    customFermentationTempC: o?.fermentation_temp_c ?? v?.fermentation_temp_c ?? defaultFermentTempC(style, hours),
    usePreFerment: o?.use_pre_ferment ?? v?.use_pre_ferment ?? style.requires_pre_ferment,
    customSalt: style.dough.salt_pct,
    // Come la scheda: teglia dello stile e mix di farine dello stile.
    panConfig: {
      panShape: defaultPanShape(style),
      panLength: style.shape.length_cm,
      panWidth: style.shape.width_cm,
      panDiameter: style.shape.diameter_cm,
      thickness: style.shape.thickness_factor,
    },
    customFlourBlend: style.dough.flour_blend?.map((c) => ({ ...c })),
    scoreWeights,
    versionRanges: version?.ranges
      ? {
          ...version.ranges,
          ...(version.params.dough_weight_g !== undefined ? { dough_weight_g: version.params.dough_weight_g } : {}),
        }
      : undefined,
    activeImpastoRef: version?.impasto_ref,
    interpretationCenter: o
      ? {
          hydration_pct: o.hydration_pct,
          flour_w: o.flour_w,
          flour_pl: o.flour_pl,
          fermentation_hours: o.fermentation_hours,
        }
      : undefined,
  });
}

export interface KitchenCompatibility {
  /** Punteggio dell'originale sulla tua cucina (0–100, arrotondato). */
  now: number;
  /** Il meglio raggiungibile adattando la ricetta o scegliendo una versione. */
  best: number;
  /** La versione d'autore che arriva al meglio, se batte l'ottimizzata. */
  bestInterpretation: Interpretation | null;
}

export function kitchenCompatibility(
  style: PizzaStyle,
  constraints: UserConstraints,
  scoreWeights?: ScoreWeights,
): KitchenCompatibility {
  const now = canonicalRecipe(style, constraints, scoreWeights).scores.composite;
  let best = optimizeRecipe(style, constraints, undefined, undefined, scoreWeights).recipe.scores.composite;
  let bestInterpretation: Interpretation | null = null;
  for (const it of getInterpretationsForStyle(style.id)) {
    const o = it.parameter_overrides;
    if (!o || Object.keys(o).length === 0) continue;
    const composite = generateRecipe(style, constraints, {
      customHydration: o.hydration_pct,
      customFlourW: o.flour_w,
      customFlourPL: o.flour_pl,
      customFermentationHours: o.fermentation_hours,
      customFermentationTempC: o.fermentation_temp_c,
      usePreFerment: o.use_pre_ferment,
      scoreWeights,
      interpretationCenter: {
        hydration_pct: o.hydration_pct,
        flour_w: o.flour_w,
        flour_pl: o.flour_pl,
        fermentation_hours: o.fermentation_hours,
      },
    }).scores.composite;
    if (composite > best + 0.5) {
      best = composite;
      bestInterpretation = it;
    }
  }
  return { now: Math.round(now), best: Math.round(Math.max(best, now)), bestInterpretation };
}
