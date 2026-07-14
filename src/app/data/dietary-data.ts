/* === DIETARY CONSTRAINTS ENGINE === */
/* Basato su Notion Pagina 10 · Gestione Intolleranze */
/* 6 intolleranze: FODMAP, Istamina, Celiachia, Lattosio, Nickel, Vegan */
/* Conflitti, validazione, avvisi contestuali */
/* i18n: accepts a neutral message-source contract, never the CMS feature. */

import type { DietaryMessageSource } from "../i18n/domain-contracts";
import { interpolate } from "../i18n/interpolate";

const DEFAULT_WARNINGS = {
  fodmap_low: { message: "FODMAP ridotti solo {pct}% — fermentazione troppo breve", tip: "Aumenta a ≥24h per raggiungere 70%+ di riduzione" },
  fodmap_good: { message: "FODMAP ridotti {pct}% — buon livello per IBS", tip: "La fermentazione è sufficientemente lunga per degradare i fruttani" },
  histamine_high: { message: "Istamina stimata ~{val} mg/kg — livello alto", tip: "Riduci fermentazione a ≤12h o usa lievito fresco a ≤20°C" },
  histamine_moderate: { message: "Istamina stimata ~{val} mg/kg — livello moderato", tip: "Monitora i sintomi. Per sicurezza, riduci tempo o temperatura" },
  gluten_free: { message: "Ricetta usa farina di grano — incompatibile con celiachia", tip: "Sostituisci con mix GF (riso 40% + mais 30% + quinoa 10% + sorgo 10% + amido 10%) + xantana 1.5%" },
  nickel_highW: { message: "Farine forti (W alto) tendono ad essere meno raffinate, con più nichel", tip: "Preferisci farina 00 raffinata (W 200-260) per minimizzare nichel" },
} as const;

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
interface DietaryWarning {
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
  cms?: DietaryMessageSource
): DietaryWarning[] {
  const warnings: DietaryWarning[] = [];
  const cmsW = cms?.dietaryI18n?.warnings;

  if (activeFilters.includes('low_fodmap')) {
    const reduction = calculateFodmapReduction(
      params.fermentHours,
      params.fermentTemp,
      params.yeastType === 'sourdough'
    );
    if (reduction < 50) {
      const loc = cmsW?.fodmap_low ?? DEFAULT_WARNINGS.fodmap_low;
      warnings.push({
        filterId: 'low_fodmap',
        message: interpolate(loc.message, { pct: reduction.toFixed(0) }),
        tip: loc.tip,
        severity: 'warning',
      });
    } else if (reduction >= 70) {
      const loc = cmsW?.fodmap_good ?? DEFAULT_WARNINGS.fodmap_good;
      warnings.push({
        filterId: 'low_fodmap',
        message: interpolate(loc.message, { pct: reduction.toFixed(0) }),
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
      const loc = cmsW?.histamine_high ?? DEFAULT_WARNINGS.histamine_high;
      warnings.push({
        filterId: 'histamine',
        message: interpolate(loc.message, { val: histamine.toFixed(0) }),
        tip: loc.tip,
        severity: 'critical',
      });
    } else if (histamine > 5) {
      const loc = cmsW?.histamine_moderate ?? DEFAULT_WARNINGS.histamine_moderate;
      warnings.push({
        filterId: 'histamine',
        message: interpolate(loc.message, { val: histamine.toFixed(0) }),
        tip: loc.tip,
        severity: 'warning',
      });
    }
  }

  if (activeFilters.includes('gluten_free')) {
    const loc = cmsW?.gluten_free ?? DEFAULT_WARNINGS.gluten_free;
    warnings.push({
      filterId: 'gluten_free',
      message: loc.message,
      tip: loc.tip,
      severity: 'critical',
    });
  }

  if (activeFilters.includes('nickel') && params.flourW > 300) {
    const loc = cmsW?.nickel_highW ?? DEFAULT_WARNINGS.nickel_highW;
    warnings.push({
      filterId: 'nickel',
      message: loc.message,
      tip: loc.tip,
      severity: 'info',
    });
  }

  return warnings;
}
