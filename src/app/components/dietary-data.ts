/* === DIETARY CONSTRAINTS ENGINE === */
/* Basato su Notion Pagina 10 · Gestione Intolleranze */
/* 6 intolleranze: FODMAP, Istamina, Celiachia, Lattosio, Nickel, Vegan */
/* Conflitti, validazione, avvisi contestuali */
/* i18n: getLocalizedDietaryInfo/Conflicts/Warnings accept CmsContent */

import type { CmsContent } from './cms/cms-context';
import { t } from './cms/i18n';

export type DietarySeverity = 'mild' | 'moderate' | 'severe';

export interface DietaryInfo {
  id: string;
  name: string;
  emoji: string;
  description: string;
  scienceNote: string;
}

export const DIETARY_INFO: Record<string, DietaryInfo> = {
  low_fodmap: {
    id: 'low_fodmap',
    name: 'Low FODMAP',
    emoji: '🫧',
    description: 'Riduce fruttani e oligosaccaridi fermentabili',
    scienceNote: 'Fermentazione ≥24h riduce FODMAP 70% (Costabile 2014)',
  },
  histamine: {
    id: 'histamine',
    name: 'Bassa istamina',
    emoji: '⏱️',
    description: 'Limita accumulo istamina da fermentazione lunga',
    scienceNote: 'Istamina si accumula linearmente. Lievito fresco <6h: safe (<5 mg/kg)',
  },
  gluten_free: {
    id: 'gluten_free',
    name: 'Senza glutine',
    emoji: '🌾',
    description: 'Per celiachia o sensibilita al glutine',
    scienceNote: 'Soglia EU: <20 ppm. Richiede mix GF (riso/mais/quinoa + xantana 1.5%)',
  },
  lactose_free: {
    id: 'lactose_free',
    name: 'Senza lattosio',
    emoji: '🥛',
    description: 'Per intolleranza al lattosio',
    scienceNote: 'Cottura >200°C degrada 90%+ lattosio. Solo SEVERE richiede sostituzione',
  },
  nickel: {
    id: 'nickel',
    name: 'Basso nichel',
    emoji: '🔩',
    description: 'Per allergia sistemica al nichel (SNAS)',
    scienceNote: 'Farina 00 (~50 µg/100g) vs integrale (~200 µg/100g). Soglia <200 µg/die',
  },
  vegan: {
    id: 'vegan',
    name: 'Vegano',
    emoji: '🌱',
    description: 'Nessun derivato animale',
    scienceNote: 'Impasto base e gia vegano. Attenzione a topping e grassi (burro -> olio)',
  },
};

/* === i18n: LOCALIZED DIETARY INFO === */
export function getLocalizedDietaryInfo(cms: CmsContent): Record<string, DietaryInfo> {
  const cmsInfo = cms.dietaryI18n?.info;
  if (!cmsInfo) return DIETARY_INFO;
  const result: Record<string, DietaryInfo> = {};
  for (const [id, fallback] of Object.entries(DIETARY_INFO)) {
    const loc = cmsInfo[id];
    result[id] = loc ? {
      ...fallback,
      name: loc.name ?? fallback.name,
      description: loc.description ?? fallback.description,
      scienceNote: loc.scienceNote ?? fallback.scienceNote,
    } : fallback;
  }
  return result;
}

/* === FODMAP REDUCTION === */
export function calculateFodmapReduction(
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
export function calculateHistamine(
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

/* === CONFLICT DETECTION === */
export interface DietaryConflict {
  severity: 'none' | 'mild' | 'severe' | 'impossible';
  involvedA: string;
  involvedB: string;
  message: string;
  compromiseTip?: string;
}

export function detectDietaryConflicts(
  activeFilters: string[],
  cms?: CmsContent
): DietaryConflict[] {
  const conflicts: DietaryConflict[] = [];
  const cmsC = cms?.dietaryI18n?.conflicts;

  const hasFodmap = activeFilters.includes('low_fodmap');
  const hasHistamine = activeFilters.includes('histamine');
  const hasGF = activeFilters.includes('gluten_free');
  const hasNickel = activeFilters.includes('nickel');

  /* FODMAP + Istamina: conflitto principale */
  if (hasFodmap && hasHistamine) {
    const loc = cmsC?.fodmap_histamine;
    conflicts.push({
      severity: 'severe',
      involvedA: 'low_fodmap',
      involvedB: 'histamine',
      message: loc?.message ??
        'FODMAP richiede fermentazione lunga (≥24h), istamina richiede fermentazione breve (≤12h)',
      compromiseTip: loc?.compromiseTip ??
        'Compromesso: 8-12h con lievito fresco a 18°C. FODMAP ridotti ~40% (sub-ottimale), istamina ~8 mg/kg (accettabile)',
    });
  }

  /* GF + FODMAP: compatibili (bonus) */
  if (hasGF && hasFodmap) {
    const loc = cmsC?.gf_fodmap;
    conflicts.push({
      severity: 'none',
      involvedA: 'gluten_free',
      involvedB: 'low_fodmap',
      message: loc?.message ??
        'Compatibili! Il mix GF elimina la fonte principale di FODMAP (fruttani del grano)',
    });
  }

  /* Nickel + integrale (warning informativo) */
  if (hasNickel) {
    const loc = cmsC?.nickel_general;
    conflicts.push({
      severity: 'mild',
      involvedA: 'nickel',
      involvedB: '',
      message: loc?.message ??
        'Per basso nichel preferisci farina 00 (50 µg/100g) rispetto a integrale (200 µg/100g)',
    });
  }

  return conflicts;
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
  const cmsW = cms?.dietaryI18n?.warnings;

  if (activeFilters.includes('low_fodmap')) {
    const reduction = calculateFodmapReduction(
      params.fermentHours,
      params.fermentTemp,
      params.yeastType === 'sourdough'
    );
    if (reduction < 50) {
      const loc = cmsW?.fodmap_low;
      warnings.push({
        filterId: 'low_fodmap',
        message: loc ? t(loc.message, { pct: reduction.toFixed(0) })
          : `FODMAP ridotti solo ${reduction.toFixed(0)}% — fermentazione troppo breve`,
        tip: loc?.tip ?? `Aumenta a ≥24h per raggiungere 70%+ di riduzione`,
        severity: 'warning',
      });
    } else if (reduction >= 70) {
      const loc = cmsW?.fodmap_good;
      warnings.push({
        filterId: 'low_fodmap',
        message: loc ? t(loc.message, { pct: reduction.toFixed(0) })
          : `FODMAP ridotti ${reduction.toFixed(0)}% — buon livello per IBS`,
        tip: loc?.tip ?? 'La fermentazione e sufficientemente lunga per degradare i fruttani',
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
      const loc = cmsW?.histamine_high;
      warnings.push({
        filterId: 'histamine',
        message: loc ? t(loc.message, { val: histamine.toFixed(0) })
          : `Istamina stimata ~${histamine.toFixed(0)} mg/kg — livello alto`,
        tip: loc?.tip ?? `Riduci fermentazione a ≤12h o usa lievito fresco a ≤20°C`,
        severity: 'critical',
      });
    } else if (histamine > 5) {
      const loc = cmsW?.histamine_moderate;
      warnings.push({
        filterId: 'histamine',
        message: loc ? t(loc.message, { val: histamine.toFixed(0) })
          : `Istamina stimata ~${histamine.toFixed(0)} mg/kg — livello moderato`,
        tip: loc?.tip ?? 'Monitora i sintomi. Per sicurezza, riduci tempo o temperatura',
        severity: 'warning',
      });
    }
  }

  if (activeFilters.includes('gluten_free')) {
    const loc = cmsW?.gluten_free;
    warnings.push({
      filterId: 'gluten_free',
      message: loc?.message ?? 'Ricetta usa farina di grano — incompatibile con celiachia',
      tip: loc?.tip ?? 'Sostituisci con mix GF (riso 40% + mais 30% + quinoa 10% + sorgo 10% + amido 10%) + xantana 1.5%',
      severity: 'critical',
    });
  }

  if (activeFilters.includes('nickel') && params.flourW > 300) {
    const loc = cmsW?.nickel_highW;
    warnings.push({
      filterId: 'nickel',
      message: loc?.message ?? 'Farine forti (W alto) tendono ad essere meno raffinate, con piu nichel',
      tip: loc?.tip ?? 'Preferisci farina 00 raffinata (W 200-260) per minimizzare nichel',
      severity: 'info',
    });
  }

  return warnings;
}
