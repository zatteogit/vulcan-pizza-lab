/* === DIETARY CONSTRAINTS ENGINE === */
/* Basato su Notion Pagina 10 · Gestione Intolleranze */
/* 6 intolleranze: FODMAP, Istamina, Celiachia, Lattosio, Nickel, Vegan */
/* Conflitti, validazione, avvisi contestuali */
/* i18n: accepts a neutral message-source contract, never the CMS feature. */

import type { DietaryMessageSource } from "../i18n/domain-contracts";

const DEFAULT_WARNINGS = {
  fodmap_low: { message: "Riduzione FODMAP non determinabile dalle sole ore", tip: "Valuta ingredienti e porzione con dati verificati; una fermentazione lunga non garantisce l'idoneità." },
  fodmap_good: { message: "Riduzione FODMAP non determinabile dalle sole ore", tip: "Valuta ingredienti e porzione con dati verificati; una fermentazione lunga non garantisce l'idoneità." },
  histamine_high: { message: "Contenuto di istamina non determinabile da tempo e temperatura", tip: "Verifica ingredienti e processo: il motore non attesta un livello sicuro." },
  histamine_moderate: { message: "Contenuto di istamina non determinabile da tempo e temperatura", tip: "Verifica ingredienti e processo: il motore non attesta un livello sicuro." },
  gluten_free: { message: "Ricetta usa farina di grano — incompatibile con celiachia", tip: "Sostituisci con mix GF (riso 40% + mais 30% + quinoa 10% + sorgo 10% + amido 10%) + xantana 1.5%" },
  nickel_highW: { message: "Il valore W non misura il contenuto di nichel", tip: "Servono dati sul prodotto; la sola forza della farina non attesta l'idoneità." },
} as const;

/* === CONTEXTUAL DIETARY WARNINGS (based on recipe params) === */
interface DietaryWarning {
  filterId: string;
  message: string;
  tip: string;
  severity: 'info' | 'warning' | 'critical';
}

export function getDietaryWarnings(
  activeFilters: string[],
  _params: {
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

  // Tempo, temperatura e lievito non misurano FODMAP o istamina.
  // Un avviso resta presente anche dopo una fermentazione lunga.
  for (const [filterId, key] of [["low_fodmap", "fodmap_low"], ["histamine", "histamine_high"]] as const) {
    if (!activeFilters.includes(filterId)) continue;
    const loc = cmsW?.[key] ?? DEFAULT_WARNINGS[key];
    warnings.push({ filterId, message: loc.message, tip: loc.tip, severity: "warning" });
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

  if (activeFilters.includes('nickel')) {
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
