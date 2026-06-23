/* === DIETARY CONSTRAINTS ENGINE === */
/* Basato su Notion Pagina 10 · Gestione Intolleranze */
/* 6 intolleranze: FODMAP, Istamina, Celiachia, Lattosio, Nickel, Vegan */
/* Conflitti, validazione, avvisi contestuali */
/* i18n: getLocalizedDietaryInfo/Conflicts/Warnings accept CmsContent */

import type { CmsContent } from "../features/cms/cms-context";
import { DIETARY_I18N_DEFAULTS } from "../features/cms/domain-i18n-defaults";
import { t } from "../features/cms/i18n";

/* === FODMAP REDUCTION === */
function calculateFodmapReduction(
  fermentationHours: number,
  fermentationTempC: number,
  hasSourdough: boolean
): number {
  const kBase = 0.0336; // h^-1, da fit Costabile (80% in 48h)
  const kTemp =
    fermentationTempC >= 28 && fermentationTempC <= 32
      ? 1.2
      : fermentationTempC >= 18
        ? 1.0
        : 0.8;
  const kSourdough = hasSourdough ? 1.3 : 1.0;
  const kEff = kBase * kTemp * kSourdough;
  const reduction = (1 - Math.exp(-kEff * fermentationHours)) * 100;
  return Math.min(95, reduction);
}

/* === HISTAMINE ACCUMULATION === */
function calculateHistamine(
  fermentationHours: number,
  fermentationTempC: number,
  yeastType: string
): number {
  const baseRate =
    yeastType === 'sourdough' ? 1.5 : yeastType === 'fresh' ? 0.3 : 0.2;
  const tempFactor =
    fermentationTempC > 25
      ? 1.0 + (fermentationTempC - 25) * 0.1
      : 0.5;
  return baseRate * fermentationHours * tempFactor;
}

/* === CONTEXTUAL DIETARY WARNINGS (based on recipe params) === */
export interface DietaryWarning {
  filterId: string;
  message: string;
  tip: string;
  severity: 'info' | 'warning' | 'critical';
}

export function getDietaryWarnings(
  activeFilters: string[],
  params: {
    fermentHours: number;
    fermentTemp: number;
    yeastType: string;
    hydration: number;
    flourW: number;
  },
  cms?: CmsContent
): DietaryWarning[] {
  const warnings: DietaryWarning[] = [];
  const cmsW = cms?.dietaryI18n?.warnings ?? DIETARY_I18N_DEFAULTS.warnings;

  if (activeFilters.includes('low_fodmap')) {
    const reduction = calculateFodmapReduction(
      params.fermentHours,
      params.fermentTemp,
      params.yeastType === 'sourdough'
    );
    if (reduction < 50) {
      const loc = cmsW?.fodmap_low ?? DIETARY_I18N_DEFAULTS.warnings.fodmap_low;
      warnings.push({
        filterId: 'low_fodmap',
        message: t(loc.message, { pct: reduction.toFixed(0) }),
        tip: loc.tip,
        severity: 'warning',
      });
    } else if (reduction >= 70) {
      const loc = cmsW?.fodmap_good ?? DIETARY_I18N_DEFAULTS.warnings.fodmap_good;
      warnings.push({
        filterId: 'low_fodmap',
        message: t(loc.message, { pct: reduction.toFixed(0) }),
        tip: loc.tip,
        severity: 'info',
      });
    }
  }

  if (activeFilters.includes('histamine')) {
    const histamine = calculateHistamine(
      params.fermentHours,
      params.fermentTemp,
      params.yeastType
    );
    if (histamine > 10) {
      const loc = cmsW?.histamine_high ?? DIETARY_I18N_DEFAULTS.warnings.histamine_high;
      warnings.push({
        filterId: 'histamine',
        message: t(loc.message, { val: histamine.toFixed(0) }),
        tip: loc.tip,
        severity: 'critical',
      });
    } else if (histamine > 5) {
      const loc = cmsW?.histamine_moderate ?? DIETARY_I18N_DEFAULTS.warnings.histamine_moderate;
      warnings.push({
        filterId: 'histamine',
        message: t(loc.message, { val: histamine.toFixed(0) }),
        tip: loc.tip,
        severity: 'warning',
      });
    }
  }

  if (activeFilters.includes('gluten_free')) {
    const loc = cmsW?.gluten_free ?? DIETARY_I18N_DEFAULTS.warnings.gluten_free;
    warnings.push({
      filterId: 'gluten_free',
      message: loc.message,
      tip: loc.tip,
      severity: 'critical',
    });
  }

  if (activeFilters.includes('nickel') && params.flourW > 300) {
    const loc = cmsW?.nickel_highW ?? DIETARY_I18N_DEFAULTS.warnings.nickel_highW;
    warnings.push({
      filterId: 'nickel',
      message: loc.message,
      tip: loc.tip,
      severity: 'info',
    });
  }

  return warnings;
}
