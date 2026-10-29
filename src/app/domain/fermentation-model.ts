/* ═══ FW-05 — Modello di fermentazione (Q10 a tratti e dose di lievito) ═══
 * Spostato da pizza-engine.ts senza cambiare un numero: il motore lo importa e
 * lo riesporta, glossario e testi lo leggono senza caricare il motore intero.
 * Modulo puro. */

/* Dose di riferimento del modello: % di lievito fresco sulla farina per 24 h a 18 °C. */
export const YEAST_REFERENCE_PCT = 0.1;
export const YEAST_REFERENCE_HOURS = 24;
export const YEAST_TIME_EXPONENT = 0.7;
export const YEAST_DRY_RATIO = 0.33;

// ═══ Q10 MODEL — VARIABLE BY YEAST TYPE & TEMPERATURE ═══
// Stime del modello, non valori di letteratura (C-4, docs/fonti-dati.md §4).
// Q10 ≈ 2 tra 18 e 25 °C è coerente con i tassi di crescita di S. cerevisiae
// (Salvadó et al. 2011). Il valore 1,6 sotto i 10 °C è una scelta del modello
// senza fonte. Per il lievito madre (batteri lattici + lieviti) i valori sono
// anch'essi stime da verificare.
//
// getQ10 restituisce il Q10 LOCALE del tratto in cui cade la temperatura. Per la
// velocità rispetto a 18°C si usa fermentationSpeedRatio, che applica i tratti in
// modo continuo (audit motore 22/10/2026, ENG-2). Prima l'esponente partiva sempre
// da 18°C con il Q10 del tratto finale: a 10°C c'era un salto non fisico (scaldando
// da 9,9 a 10°C il lievito saliva). Il vecchio commento diceva che Q10=2 fisso
// «sovrastima l'attività a bassa T», ma il Q10 più basso sotto i 10°C dà PIÙ
// attività a freddo, non meno: commento ed effetto si contraddicevano.

/** FW-05: soglie dei tratti del Q10 (°C), una sola fonte per getQ10,
 *  fermentationSpeedRatio e i testi che le citano (glossario Q10/Arrhenius). */
export const Q10_BREAKPOINT_C = { commercial: 10, sourdough: 15 } as const;

export function getQ10(
  yeastType: "fresh" | "dry" | "sourdough",
  tempC: number,
): { q10: number; model: "standard" | "cold_adapted" | "sourdough" } {
  if (yeastType === "sourdough") {
    // Lievito madre: LAB dominano sotto 15°C con Q10 più alto
    return {
      q10: tempC > Q10_BREAKPOINT_C.sourdough ? 2.2 : 1.9,
      model: "sourdough",
    };
  }
  if (tempC < Q10_BREAKPOINT_C.commercial) {
    // Cold fermentation: Q10 1,6 sotto i 10°C. È una scelta del modello senza
    // fonte verificata: il riferimento citato prima (PMC7146123) è una review sui
    // soft sensor di fermentazione e non parla di lievito (verifica del 24/10/2026,
    // voce C-4). In UI lo mostriamo come stima, non come dato misurato.
    return { q10: 1.6, model: "cold_adapted" };
  }
  return { q10: 2.0, model: "standard" };
}

/** Temperatura di riferimento del modello cinetico (°C). */
export const Q10_REFERENCE_TEMP_C = 18;

/**
 * Velocità di fermentazione relativa a 18°C con Q10 a tratti CONTINUO
 * (decisione di Matteo, 22/10/2026 — ENG-2).
 *
 * - Lievito commerciale: Q10 2,0 da 18 a 10°C, poi 1,6 sotto i 10°C partendo
 *   dal valore raggiunto a 10°C.
 * - Lievito madre: Q10 2,2 sopra i 15°C, poi 1,9 sotto i 15°C con lo stesso
 *   raccordo (stesso salto, stessa correzione).
 *
 * È la sola fonte del fattore di velocità: dose di lievito, ore equivalenti a
 * 18°C (digeribilità e livello scientifico) e testi della timeline. Funzione
 * crescente e continua in T.
 */
export function fermentationSpeedRatio(
  yeastType: "fresh" | "dry" | "sourdough",
  tempC: number,
): number {
  const breakC = yeastType === "sourdough" ? Q10_BREAKPOINT_C.sourdough : Q10_BREAKPOINT_C.commercial;
  const q10Above = getQ10(yeastType, breakC + 1).q10;
  const q10Below = getQ10(yeastType, breakC - 1).q10;
  if (tempC >= breakC) {
    return Math.pow(q10Above, (tempC - Q10_REFERENCE_TEMP_C) / 10);
  }
  return (
    Math.pow(q10Above, (breakC - Q10_REFERENCE_TEMP_C) / 10) *
    Math.pow(q10Below, (tempC - breakC) / 10)
  );
}

export function calculateYeastPercentage(
  fermentationHours: number,
  fermentationTempC: number,
  yeastType: "fresh" | "dry",
): number {
  // Guard: zero/negative fermentation → no yeast needed (sfoglia diretta, es. Focaccia di Recco)
  if (fermentationHours <= 0) return 0;
  // ENG-3 (decisione di Matteo, 22/10/2026): tolta la rampa lineare sotto le 2h
  // (ADV-02, 0,2% per ora). Era nata per la Focaccia di Recco, che oggi è
  // `unleavened` e non arriva qui (lievito 0 in generateRecipe). Sugli impasti
  // lievitati la rampa faceva CRESCERE il lievito con le ore (1h → 0,2%,
  // 2h → 0,4%), l'opposto del resto del modello. Ora vale il modello cinetico
  // anche sotto le 2h, con il tetto al 3% sotto.
  // Arrhenius-based model con Q10 variabile — Audit Database V2
  // Audit motore 2026-05: ricalibrato dopo verifica empirica vs disciplinari.
  //   - referenceRate 0.25→0.10: il vecchio 0.25 sovrastimava di 2-3x rispetto
  //     a Caputo/AVPN/Pizzarium/Shawn Randazzo (Detroit). Ora ancorato a Caputo
  //     standard (0.1% fresh yeast a 18°C per 24h).
  //   - timeFactor lineare (24/h) → sub-lineare (24/h)^0.7: il lievito si
  //     RIPRODUCE durante la fermentazione, non si consuma. Curva log-like.
  //     Verificato su Napoletana 8h, 12h, 24h, Bonci 48h, Detroit 24h.
  const referenceRate = YEAST_REFERENCE_PCT; // % fresh yeast a 18°C per 24h (Caputo standard)
  // ENG-2: fattore di velocità a tratti continuo (a 4°C ~+20% di lievito
  // rispetto al vecchio esponente con Q10 1,6 da 18°C).
  const tempFactor = fermentationSpeedRatio(yeastType, fermentationTempC);
  const timeFactor = Math.pow(YEAST_REFERENCE_HOURS / fermentationHours, YEAST_TIME_EXPONENT);

  let pct = (referenceRate * timeFactor) / tempFactor;
  if (yeastType === "dry") pct *= YEAST_DRY_RATIO; // dry = 1/3 of fresh

  return Math.max(0.01, Math.min(3.0, pct));
}
