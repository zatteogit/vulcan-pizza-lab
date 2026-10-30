/* ═══ G1a-WP-01 — Stato di ogni valore delle farine di marca ═══
 * Trascritto riga per riga da docs/fonti-dati.md §2.1 «Schede dei produttori»
 * (lettura del 24/10/2026). Il registro della scienza (science-sources.ts) ha
 * le fonti, non dice quale valore di quale farina ciascuna conferma: qui sì.
 *
 * Una farina o un campo che non compare qui è «da verificare» (unverified):
 * le farine «Generico» non hanno un produttore da citare, e per le farine di
 * marca assorbimento, falling number e stabilità vengono da Notion, senza
 * fonte (§Fonti mancanti), salvo dove la scheda li riporta.
 * «wrong» (= errato nel documento): il valore del codice è contraddetto dalla
 * scheda e la UI non lo mostra (D-G1a-01). I valori di flour-database.ts non
 * si correggono qui: è materia di FW-05 e della decisione D-G1a-01. */

import type { SourceStatus } from "../domain/science/types";

export type FlourFieldId = "w" | "pl" | "proteine_pct" | "assorbimento_pct" | "falling_number" | "stabilita_min";

export interface FlourFieldSource {
  /** Id di science-sources.ts. */
  sourceId: string;
  status: SourceStatus;
}

const verified = (sourceId: string): FlourFieldSource => ({ sourceId, status: "verified" });

export const FLOUR_SOURCES: Readonly<Record<string, Partial<Record<FlourFieldId, FlourFieldSource>>>> = {
  /* Mulino Caputo 2025, «Pizzeria»: W 260/280, P/L 0,50/0,60, proteine 12,50%. */
  caputo_pizzeria: {
    w: verified("caputo-pizzeria-2025"),
    pl: verified("caputo-pizzeria-2025"),
    proteine_pct: verified("caputo-pizzeria-2025"),
  },
  /* Mulino Caputo 2025, «Nuvola»: W 270/290, P/L 0,50/0,60, proteine 12,50%. */
  caputo_nuvola: {
    w: verified("caputo-nuvola-2025"),
    pl: verified("caputo-nuvola-2025"),
    proteine_pct: verified("caputo-nuvola-2025"),
  },
  /* Mulino Caputo 2024, «Saccorosso»: W 300/320, P/L 0,50/0,60, proteine 13%. */
  caputo_cuoco: {
    w: verified("caputo-saccorosso-2024"),
    pl: verified("caputo-saccorosso-2024"),
    proteine_pct: verified("caputo-saccorosso-2024"),
  },
  /* Molino Quaglia, «Petra 5037»: W 300–340, P/L 0,55–0,65, protidi 13,0–13,5%,
     assorbimento «oltre 85%». */
  petra_5037: {
    w: verified("quaglia-petra-5037"),
    pl: verified("quaglia-petra-5037"),
    proteine_pct: verified("quaglia-petra-5037"),
    assorbimento_pct: verified("quaglia-petra-5037"),
  },
  /* Molino Quaglia, «Petra 3»: W e P/L non dichiarati («l'elevato contenuto di
     fibra non consente di ottenere dei risultati significativi»), protidi
     13,0–14,0%, assorbimento «fino a 85%». Il documento segna «errato» anche
     l'assorbimento perché allora il codice diceva 60%: oggi dice 85%, dentro
     la scheda. */
  petra_3_evolutiva: {
    w: { sourceId: "quaglia-petra-3", status: "wrong" },
    pl: { sourceId: "quaglia-petra-3", status: "wrong" },
    proteine_pct: verified("quaglia-petra-3"),
    assorbimento_pct: verified("quaglia-petra-3"),
  },
  /* Agugiaro & Figna 2025, «Pizza Napoletana» rossa: assorbimento 57% e
     stabilità 13′ verificati; proteine 13% sulla sostanza secca (plausibile);
     Hagberg 280″, quindi FN 300 errato; W e P/L non indicati. */
  "5stagioni_rossa": {
    proteine_pct: { sourceId: "agugiaro-figna-2025", status: "plausible" },
    assorbimento_pct: verified("agugiaro-figna-2025"),
    falling_number: { sourceId: "agugiaro-figna-2025", status: "wrong" },
    stabilita_min: verified("agugiaro-figna-2025"),
  },
};
