import { PROOF_MIN_TEMP_C } from "../domain/fermentation-constants";
import {
  ACTIVE_STEP_IDS,
  FLEXIBLE_STEP_IDS,
  countNightActives,
  isNightHour,
  type NightAction,
  type PlanStepInput,
} from "./cook-timing";

/* FW-19: la parte leggera (notte, tipi di passo, ri-ancoraggio della
 * pizzata) sta in cook-timing.ts; qui la si riesporta per chi pianifica. */
export * from "./cook-timing";

/* ═══ FW-19 — Piano temporale unico con invarianti ═══
 * Audit UX/scienza 28/10/2026 (S09, S10). Procedimento, Timeline comoda,
 * «Inizia ora» e modalità cottura calcolavano gli orari ciascuno a modo suo
 * (recipe-output-format.ts e cook-session.tsx, due moduli di interfaccia):
 * - il piano proposto da solo cadeva di notte e poi si segnalava sbagliato;
 * - «Inizia ora» poteva portare la cottura alle 5 senza avviso;
 * - la Timeline comoda spostava ore dal frigo all'appretto a 18 °C usando le
 *   tolleranze del frigo;
 * - il primo «Fatto» in cucina cancellava le estensioni scelte per la notte.
 * Qui il piano è uno, puro e testato (cook-plan.test.ts). Niente React, CMS
 * o browser: le viste lo leggono e lo formattano. */

/* ── Il piano ── */

export interface PlannedStep {
  index: number;
  id: string;
  /** Minuti pianificati: durata del motore più l'eventuale estensione. */
  plannedMin: number;
  startMs: number;
  endMs: number;
  flexible: boolean;
  active: boolean;
  /** L'azione attiva cade nella finestra notturna. */
  night: boolean;
  /** L'inizio dipende dalla fine di un'attesa biologica: si mostra «ca.». */
  approxStart: boolean;
}

export interface CookPlan {
  startMs: number;
  readyAtMs: number;
  steps: PlannedStep[];
  stretch: Record<number, number>;
  nightActions: NightAction[];
  /** C'è almeno un'attesa biologica: la fine è una stima. */
  approximateEnd: boolean;
}

export interface CookPlanOptions {
  /** Inizio del piano (ms o Date). */
  startAt?: number | Date;
  /** Oppure l'orario del pasto: l'inizio si calcola all'indietro, mai prima di `now`. */
  mealAt?: number | Date;
  /** Minuti in più o in meno per indice di passo (Timeline comoda). */
  stretch?: Readonly<Record<number, number>>;
  now?: number;
}

const ms = (value: number | Date) => (typeof value === "number" ? value : value.getTime());

export function totalPlannedMinutes(
  timeline: readonly PlanStepInput[],
  stretch: Readonly<Record<number, number>> = {},
): number {
  return timeline.reduce((sum, step, i) => sum + step.duration_minutes + (stretch[i] ?? 0), 0);
}

/** L'inizio del passo i è incerto se viene subito dopo un'attesa biologica:
 *  l'incertezza riguarda quando l'attesa FINISCE (S09-A-10). */
export function approxStartAt(timeline: readonly PlanStepInput[], index: number): boolean {
  return index > 0 && FLEXIBLE_STEP_IDS.has(timeline[index - 1].id);
}

export function buildCookPlan(timeline: readonly PlanStepInput[], options: CookPlanOptions = {}): CookPlan {
  const now = options.now ?? Date.now();
  const stretch = { ...(options.stretch ?? {}) };
  const total = totalPlannedMinutes(timeline, stretch);
  const startMs = options.startAt !== undefined
    ? ms(options.startAt)
    : options.mealAt !== undefined
      ? Math.max(now, ms(options.mealAt) - total * 60_000)
      : now;
  let cursor = startMs;
  const steps: PlannedStep[] = timeline.map((step, index) => {
    const plannedMin = step.duration_minutes + (stretch[index] ?? 0);
    const startStep = cursor;
    cursor += plannedMin * 60_000;
    const active = ACTIVE_STEP_IDS.has(step.id);
    return {
      index,
      id: step.id,
      plannedMin,
      startMs: startStep,
      endMs: cursor,
      flexible: FLEXIBLE_STEP_IDS.has(step.id),
      active,
      night: active && isNightHour(new Date(startStep).getHours()),
      approxStart: approxStartAt(timeline, index),
    };
  });
  return {
    startMs,
    readyAtMs: cursor,
    steps,
    stretch,
    nightActions: steps.filter((s) => s.night).map((s) => ({ index: s.index, id: s.id, atMs: s.startMs })),
    approximateEnd: steps.some((s) => s.flexible),
  };
}

/* ── Orario proposto quando l'utente non ha scelto un pasto (S09-A-04) ── */

/** Pasti candidati: pranzo e cena, come gli slot di Crea. */
export const DEFAULT_MEALS: readonly (readonly [number, number])[] = [[12, 30], [20, 0]];

/** Primo pranzo o cena raggiungibile il cui piano non ha azioni di notte;
 *  se nessuno nei prossimi giorni ci riesce, quello con meno azioni notturne
 *  (a parità, il primo). Prima si guardava solo l'ora d'inizio. */
export function defaultMealStart(timeline: readonly PlanStepInput[], now: Date = new Date()): Date {
  const total = totalPlannedMinutes(timeline);
  let best: { start: number; night: number } | null = null;
  for (let day = 0; day < 8; day++) {
    for (const [h, m] of DEFAULT_MEALS) {
      const meal = new Date(now);
      meal.setDate(meal.getDate() + day);
      meal.setHours(h, m, 0, 0);
      const start = meal.getTime() - total * 60_000;
      if (start < now.getTime()) continue;
      const night = countNightActives(timeline, start);
      if (night === 0) return new Date(start);
      if (!best || night < best.night) best = { start, night };
    }
  }
  return best ? new Date(best.start) : roundUpToQuarter(now);
}

function roundUpToQuarter(date: Date): Date {
  const d = new Date(date);
  const mins = d.getMinutes() + (d.getSeconds() > 0 || d.getMilliseconds() > 0 ? 0.001 : 0);
  d.setMinutes(Math.ceil(mins / 15) * 15, 0, 0);
  return d;
}

/* ── Timeline comoda (D-Q, S09-A-05, S09-B-04) ──
 * Decisione di Matteo (D-Q, 28/10/2026): per ora la Timeline comoda sposta
 * solo gli orari dentro le tolleranze della fase, senza toccare le dosi e
 * senza spostare ore fra frigo e ambiente; ricalcolare il lievito è
 * un'evoluzione da fare con test sul modello. Le tolleranze sono regole
 * pratiche scelte da Vulcan, non misure (nota comfort-tolerances). */

export interface StretchTolerance {
  /** Allungamento massimo, frazione della durata e tetto in minuti. */
  plusFraction: number;
  plusMaxMin: number;
  /** Accorciamento massimo, frazione della durata e tetto in minuti. */
  minusFraction: number;
  minusMaxMin: number;
}

export const COMFORT_TOLERANCES = {
  /** In frigo (≤ 6 °C) la maturazione è lenta e tollera di più. */
  cold: { plusFraction: 0.5, plusMaxMin: 360, minusFraction: 0.25, minusMaxMin: 240 },
  /** A temperatura ambiente (e l'appretto, sempre ad almeno 18 °C) i margini sono stretti. */
  room: { plusFraction: 0.3, plusMaxMin: 120, minusFraction: 0.2, minusMaxMin: 90 },
  /** Temperatura massima del frigo per le tolleranze «cold». */
  coldMaxC: 6,
  /** Passo delle estensioni, in minuti. */
  stepMin: 30,
  /** Durata minima di una fase per essere stirata. */
  minPhaseMin: 45,
} as const;

/** Temperatura a cui il motore fa davvero la fase: l'appretto è sempre ad
 *  almeno 18 °C (PROOF_MIN_TEMP_C), il prefermento a temperatura ambiente. */
export function phaseTemperatureC(stepId: string, fermentTempC: number): number {
  if (stepId === "proof") return Math.max(fermentTempC, PROOF_MIN_TEMP_C);
  if (stepId === "preferment") return Math.max(fermentTempC, PROOF_MIN_TEMP_C);
  return fermentTempC;
}

export function isColdPhase(stepId: string, fermentTempC: number): boolean {
  return phaseTemperatureC(stepId, fermentTempC) <= COMFORT_TOLERANCES.coldMaxC;
}

/** Estensioni possibili per una fase, in passi da 30 minuti. */
export function stretchOptions(durationMin: number, cold: boolean): number[] {
  const tol = cold ? COMFORT_TOLERANCES.cold : COMFORT_TOLERANCES.room;
  const maxExtra = Math.min(durationMin * tol.plusFraction, tol.plusMaxMin);
  const maxShrink = Math.min(durationMin * tol.minusFraction, tol.minusMaxMin);
  const step = COMFORT_TOLERANCES.stepMin;
  const opts: number[] = [];
  for (let e = -Math.floor(maxShrink / step) * step; e <= maxExtra; e += step) opts.push(e);
  return opts;
}

/** D-Q: nessuno scambio di ore fra frigo e ambiente (un allungamento in frigo
 *  con un accorciamento a temperatura ambiente, o viceversa). */
export function movesHoursBetweenColdAndRoom(
  stretch: Readonly<Record<number, number>>,
  coldByIndex: Readonly<Record<number, boolean>>,
): boolean {
  let coldSign = 0;
  let roomSign = 0;
  for (const [key, value] of Object.entries(stretch)) {
    if (value === 0) continue;
    const sign = Math.sign(value);
    if (coldByIndex[Number(key)]) coldSign = coldSign || sign;
    else roomSign = roomSign || sign;
    if (coldSign && roomSign && coldSign !== roomSign) return true;
  }
  return false;
}

export interface ComfortPlan {
  stretch: Record<number, number>;
  newStart: Date;
  nightCount: number;
  totalExtra: number;
}

/** Piano che porta a zero le azioni attive di notte tenendo fisso il pasto.
 *  null se non ce n'è bisogno o se non ci riesce: in quel caso la UI deve
 *  dirlo (S09-A-03), non tacere. */
export function optimizeComfort(
  timeline: readonly PlanStepInput[],
  startTime: Date,
  fermentTempC: number,
  now: Date = new Date(),
): ComfortPlan | null {
  const baseNight = countNightActives(timeline, startTime.getTime());
  if (baseNight === 0) return null;

  const flexIdx = timeline
    .map((s, i) => ({ s, i }))
    .filter(({ s }) => FLEXIBLE_STEP_IDS.has(s.id) && s.duration_minutes >= COMFORT_TOLERANCES.minPhaseMin)
    .map(({ i }) => i);
  if (flexIdx.length === 0) return null;
  const coldByIndex: Record<number, boolean> = Object.fromEntries(
    flexIdx.map((i) => [i, isColdPhase(timeline[i].id, fermentTempC)]),
  );

  /* Cartesiano sui (pochi) passi flessibili */
  let combos: Record<number, number>[] = [{}];
  for (const i of flexIdx) {
    const next: Record<number, number>[] = [];
    for (const c of combos) {
      for (const e of stretchOptions(timeline[i].duration_minutes, coldByIndex[i])) next.push({ ...c, [i]: e });
    }
    combos = next;
    if (combos.length > 25_000) break;
  }

  const totalBase = totalPlannedMinutes(timeline);
  const endMs = startTime.getTime() + totalBase * 60_000; // il pasto NON si sposta
  let best: ComfortPlan | null = null;
  let bestScore = Infinity;

  for (const c of combos) {
    if (movesHoursBetweenColdAndRoom(c, coldByIndex)) continue;
    const totalExtra = Object.values(c).reduce((a, b) => a + b, 0);
    // Inizio sui quarti d'ora: gli orari proposti devono essere umani
    const newStartMs = Math.round((endMs - (totalBase + totalExtra) * 60_000) / 900_000) * 900_000;
    if (newStartMs < now.getTime() - 5 * 60_000) continue; // non si parte nel passato
    const night = countNightActives(timeline, newStartMs, c);
    const score = night * 100_000 + Math.abs(totalExtra);
    if (score < bestScore) {
      bestScore = score;
      best = { stretch: c, newStart: new Date(newStartMs), nightCount: night, totalExtra };
    }
  }

  /* Onestà prima di tutto: si propone il piano solo se AZZERA le azioni
   * notturne. Un miglioramento parziale non mantiene la promessa. */
  if (!best || best.nightCount > 0) return null;
  best.stretch = Object.fromEntries(Object.entries(best.stretch).filter(([, v]) => v !== 0)) as Record<number, number>;
  if (Object.keys(best.stretch).length === 0) return null;
  return best;
}

