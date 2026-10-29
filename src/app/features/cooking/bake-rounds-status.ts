/* ═══ FW-19 (S10-A-16, revisione) — Stato del timer per giro, puro ═══
 * Il timer diceva sempre «Inforna», «girala di mezzo giro», «Sforna!»: anche
 * a chi frigge in olio (pizza fritta, montanara) e anche per gli stili che
 * non si girano (Chicago, Recco, padellino: turns 0 in BAKING_TIMES_DB). Qui
 * il testo dipende dalla variante del passo e dalle rotazioni dello stile:
 *  - turns 0: nessun promemoria «gira»;
 *  - turns 1: uno a metà («mezzo giro» in forno, «girala» in olio);
 *  - turns n > 1: n promemoria a intervalli uguali, «ruota la pizza (k di n)».
 * La vista sceglie il testo (forno o olio) con chiavi letterali. */

export type RoundPhase = "idle" | "baking" | "out";

export interface RoundStatusInput {
  phase: RoundPhase;
  /** Secondi trascorsi dall'inizio della cottura in corso. */
  elapsedSec: number;
  roundSec: number;
  /** Giro in corso o appena finito (1-based); 0 = nessuno ancora. */
  round: number;
  rounds: number;
  /** Rotazioni per cottura dello stile (0 = non girare). */
  turns: number;
  /** Variante del passo: «fry» = frittura in olio. */
  variant?: string;
}

export type RoundStatusKey =
  | "remaining"
  | "turn"
  | "rotate"
  | "out"
  | "allDone"
  | "ready";

export interface RoundStatus {
  key: RoundStatusKey;
  /** Promemoria di rotazione in corso (1-based) e totale, per «rotate». */
  turnIndex?: number;
  turnCount?: number;
}

/** Secondi della cottura a cui ricordare di girare: n punti a intervalli
 *  uguali (con 1 rotazione, a metà). */
export function turnPointsSec(roundSec: number, turns: number): number[] {
  const n = Math.max(0, Math.floor(turns));
  return Array.from({ length: n }, (_, i) => (roundSec * (i + 1)) / (n + 1));
}

export function roundStatus(input: RoundStatusInput): RoundStatus {
  const { phase, elapsedSec, roundSec, round, rounds, turns } = input;
  if (phase === "baking") {
    const points = turnPointsSec(roundSec, turns);
    const passed = points.filter((p) => elapsedSec >= p).length;
    if (passed === 0) return { key: "remaining" };
    if (points.length === 1) return { key: "turn" };
    return { key: "rotate", turnIndex: passed, turnCount: points.length };
  }
  if (round >= rounds) return { key: "allDone" };
  return { key: phase === "out" ? "out" : "ready" };
}
