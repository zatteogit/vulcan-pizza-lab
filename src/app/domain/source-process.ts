/* ═══ Tranche B5 · processo della fonte ═══
 * Una versione d'autore può dire due cose sul processo che il motore non
 * ricava dalle ore e dalla temperatura: che l'impasto sta in frigo anche
 * sopra FRIDGE_MAX_TEMP_C (Dekracap: 8 °C, la zona meno fredda del frigo) e
 * che cosa la fonte fa diversamente dalla tabella di marcia (note). Come il
 * lievito della fonte (source-yeast.ts, D-068) vale solo con le ore e la
 * temperatura della versione: se l'utente le cambia, l'impasto a 8 °C torna
 * «fresco, non in frigo» e le note spariscono. Modulo puro. */
import { FRIDGE_MAX_TEMP_C, SOURCE_FRIDGE_MAX_C } from "./fermentation-constants";
import type { EngineMsg } from "./pizza-engine";

export interface SourceProcess {
  /** Ore e temperatura della fonte: il processo vale solo con queste. */
  hours: number;
  temp_c: number;
  /** La fonte mette l'impasto in frigo a `temp_c`. */
  fridge?: boolean;
  /** Ciò che la fonte fa e la tabella di marcia non dice. */
  notes?: EngineMsg[];
}

export interface SourceProcessUse {
  /** In frigo sopra la soglia di Vulcan, fino a SOURCE_FRIDGE_MAX_C: solo
   *  allora cambia qualcosa rispetto a una ricetta senza fonte. */
  fridge: boolean;
  notes: EngineMsg[];
}

/** Il processo della fonte per queste ore e questa temperatura, oppure null
 *  se non sono quelle della fonte (entro un minuto, stessa temperatura). */
export function sourceProcessUse(source: SourceProcess, hours: number, tempC: number): SourceProcessUse | null {
  if (Math.abs(source.hours - hours) >= 1 / 60 || Math.abs(source.temp_c - tempC) > 1e-6) return null;
  return {
    fridge: Boolean(source.fridge) && tempC > FRIDGE_MAX_TEMP_C && tempC <= SOURCE_FRIDGE_MAX_C,
    notes: source.notes ?? [],
  };
}
