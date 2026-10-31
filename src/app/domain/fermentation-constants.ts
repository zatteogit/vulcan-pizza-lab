/* FW-19: costanti della fermentazione che servono anche fuori dal motore
 * (il piano temporale in use-cases/cook-plan.ts e cook-timing.ts).
 * Un modulo minuscolo, così la shell non si porta dietro tutto pizza-engine. */

/** Temperatura dell'appretto: sotto i 18 °C (frigo, cantina) l'appretto si fa
 *  comunque a temperatura ambiente, come dice il passo della timeline. */
export const PROOF_MIN_TEMP_C = 18;

/** Temperatura massima del frigo: fino a 6 °C la fase è «in frigo» (passo
 *  della puntata, tolleranze della Timeline comoda, testo delle pieghe). Fra
 *  7 e 17 °C (cantina, «fresco») l'impasto NON va in frigo: la dose di lievito
 *  è calcolata per quella temperatura. */
export const FRIDGE_MAX_TEMP_C = 6;

/** Tranche B5: una fonte può scrivere un frigo più caldo della soglia, fino a
 *  8 °C (Dekracap: l'impasto a 8 °C, nella zona meno fredda del frigo). Solo
 *  quando la ricetta segue quella fonte (`fermentation_in_fridge`) la fase fra
 *  7 e 8 °C è «in frigo»; senza, resta la soglia di 6 °C e i numeri degli
 *  stili non cambiano. Coincide con COLD_RETARD_MAX_C dei problemi
 *  (data/troubleshooting-data.ts). */
export const SOURCE_FRIDGE_MAX_C = 8;

/** L'impasto a questa temperatura sta in frigo: fino a FRIDGE_MAX_TEMP_C
 *  sempre, fino a SOURCE_FRIDGE_MAX_C se la fonte lo mette in frigo. */
export function isFridgeTempC(tempC: number, sourceFridge = false): boolean {
  return tempC <= FRIDGE_MAX_TEMP_C || (sourceFridge && tempC <= SOURCE_FRIDGE_MAX_C);
}

/** Tranche B1 (D-068, decisione 7 di Matteo del 30/10/2026): una fonte che
 *  dice «in un luogo caldo» senza gradi (Benedetta Rossi, Paoletta). Il motore
 *  calcola a `calcC`; la finestra `windowC` vale con il criterio «al
 *  raddoppio». Non è una misura della fonte: è una scelta di Vulcan, e la
 *  ricetta lo dichiara (nota `fermentation.warmPlace`). */
export const WARM_PLACE = { calcC: 26, windowC: [24, 28] } as const;
