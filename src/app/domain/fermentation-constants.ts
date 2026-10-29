/* FW-19: costanti della fermentazione che servono anche fuori dal motore
 * (il piano temporale in use-cases/cook-plan.ts e cook-timing.ts).
 * Un modulo minuscolo, così la shell non si porta dietro tutto pizza-engine. */

/** Temperatura dell'appretto: sotto i 18 °C (frigo, cantina) l'appretto si fa
 *  comunque a temperatura ambiente, come dice il passo della timeline. */
export const PROOF_MIN_TEMP_C = 18;
