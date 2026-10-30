/* ═══ FW-19 — Tempi della pizzata (parte leggera del piano unico) ═══
 * Notte, tipi di passo e ri-ancoraggio della modalità cottura. Separato da
 * cook-plan.ts perché la shell (widget e modalità cottura) lo carica subito:
 * l'ottimizzatore della Timeline comoda resta nel chunk della ricetta.
 * Puro: niente React, CMS o browser. Test in cook-plan.test.ts. */

import { FRIDGE_MAX_TEMP_C, PROOF_MIN_TEMP_C } from "../domain/fermentation-constants";

/** Una fase del piano: basta l'id del passo e la sua durata nel motore. */
export interface PlanStepInput {
  id: string;
  duration_minutes: number;
}

/* ── Notte ── */

/** Finestra notturna, una sola per tutta l'app (prima 22–7 per l'orario di
 *  default e 23–7 per l'avviso). Scelta di Vulcan. */
export const NIGHT_WINDOW = { fromHour: 23, toHour: 7 } as const;

export function isNightHour(hour: number): boolean {
  return hour >= NIGHT_WINDOW.fromHour || hour < NIGHT_WINDOW.toHour;
}

/** Attese lunghe e passive: l'impasto lavora da solo, l'orario della fine è
 *  una stima biologica. */
export const FLEXIBLE_STEP_IDS: ReadonlySet<string> = new Set(["bulk", "proof", "preferment"]);

/** Quale criterio di prontezza mostrare prima di chiudere un'attesa in
 *  anticipo (cms.cooking.readyCriterion, S10-A-15). Una puntata in frigo
 *  (`cold`, isColdPhase) non deve raddoppiare: il motore lo dice nel suo
 *  consiglio («in frigo cresce lento»), e così il criterio («bulkCold»). */
export type ReadyCriterionKey = "bulk" | "bulkCold" | "proof" | "preferment" | "default";
export function readyCriterionKey(stepId: string, cold = false): ReadyCriterionKey {
  if (stepId === "bulk") return cold ? "bulkCold" : "bulk";
  return stepId === "proof" || stepId === "preferment" ? stepId : "default";
}

/** Passi che chiedono le mani (o di accendere il forno) a un'ora precisa. */
export const ACTIVE_STEP_IDS: ReadonlySet<string> = new Set([
  "mix", "folds", "divide", "shape", "top", "bake", "preheat",
  "stack", "fill_internal", "split_fill", "top_post", "bake2",
]);

/** Passi attivi che però hanno un'attesa da rispettare dopo il gesto: si
 *  accende il forno e si aspetta che arrivi in temperatura (S10-A-02). */
export const TIMED_WAIT_STEP_IDS: ReadonlySet<string> = new Set(["preheat"]);

export interface NightAction {
  index: number;
  id: string;
  atMs: number;
}

/** Azioni attive che cadono di notte, dato l'inizio e le estensioni. */
export function nightActions(
  timeline: readonly PlanStepInput[],
  startMs: number,
  stretch: Readonly<Record<number, number>> = {},
): NightAction[] {
  let cursor = startMs;
  const out: NightAction[] = [];
  timeline.forEach((step, index) => {
    if (ACTIVE_STEP_IDS.has(step.id) && isNightHour(new Date(cursor).getHours())) {
      out.push({ index, id: step.id, atMs: cursor });
    }
    cursor += (step.duration_minutes + (stretch[index] ?? 0)) * 60_000;
  });
  return out;
}

export function countNightActives(
  timeline: readonly PlanStepInput[],
  startMs: number,
  stretch: Readonly<Record<number, number>> = {},
): number {
  return nightActions(timeline, startMs, stretch).length;
}

/* ── Pizzata in corso: ri-ancoraggio (S10-A-01, A-02, A-03, B-05, B-12) ── */

/** Il minimo che serve di un passo della sessione per ri-ancorarlo. */
export interface SessionTiming {
  id: string;
  /** Durata pianificata, estensioni della Timeline comoda comprese. */
  duration_minutes: number;
  startMs: number;
  endMs: number;
  done: boolean;
  /** Quando l'utente ha davvero cominciato il passo (assente: non ancora). */
  actualStartMs?: number;
}

function chainFrom<T extends SessionTiming>(steps: T[], from: number, cursor: number): void {
  for (let j = from; j < steps.length; j++) {
    steps[j].startMs = cursor;
    steps[j].endMs = cursor + steps[j].duration_minutes * 60_000;
    delete steps[j].actualStartMs;
    cursor = steps[j].endMs;
  }
}

/** Il passo `index` comincia adesso: inizio reale registrato, il resto del
 *  piano slitta di conseguenza con le durate pianificate (estensioni comprese). */
export function startStepAt<T extends SessionTiming>(steps: readonly T[], index: number, nowMs: number): T[] {
  const next = steps.map((s) => ({ ...s }));
  if (index < 0 || index >= next.length) return next;
  next[index].startMs = nowMs;
  next[index].actualStartMs = nowMs;
  next[index].endMs = nowMs + next[index].duration_minutes * 60_000;
  chainFrom(next, index + 1, next[index].endMs);
  return next;
}

/** Il passo `index` è finito adesso (presto o tardi che sia): i successivi
 *  ripartono da qui, con le loro durate pianificate. */
export function completeStepAt<T extends SessionTiming>(steps: readonly T[], index: number, nowMs: number): T[] {
  const next = steps.map((s) => ({ ...s }));
  if (index < 0 || index >= next.length) return next;
  next[index].done = true;
  next[index].endMs = nowMs;
  chainFrom(next, index + 1, nowMs);
  return next;
}

export function sessionReadyAt(steps: readonly SessionTiming[]): number {
  return steps.length > 0 ? steps[steps.length - 1].endMs : 0;
}

/** Orario di fine se il passo `index` cominciasse adesso: per chiedere
 *  conferma prima di anticipare il piano (S10-A-01). */
export function previewStartNow(steps: readonly SessionTiming[], index: number, nowMs: number): {
  readyAtMs: number;
  nightActions: NightAction[];
} {
  const next = startStepAt(steps, index, nowMs);
  return { readyAtMs: sessionReadyAt(next), nightActions: sessionNightActions(next, nowMs) };
}

/** Orario di fine se il passo `index` finisse adesso: per chiedere conferma
 *  prima di chiudere un'attesa in anticipo (S10-B-11). */
export function previewCompleteNow(steps: readonly SessionTiming[], index: number, nowMs: number): {
  readyAtMs: number;
  nightActions: NightAction[];
} {
  const next = completeStepAt(steps, index, nowMs);
  return { readyAtMs: sessionReadyAt(next), nightActions: sessionNightActions(next, nowMs) };
}

/** L'orario come lo legge l'utente, al minuto: con «ca.» arrotondato al
 *  quarto d'ora come formatClock (format.ts). */
export function displayedClockMs(ms: number, approximate: boolean): number {
  return approximate ? Math.round(ms / 900_000) * 900_000 : Math.floor(ms / 60_000) * 60_000;
}

/** Revisione ondata 2: «Iniziare adesso?» chiede conferma solo se cambia
 *  qualcosa che l'utente legge. Anticipare di 10 minuti un pasto «ca. 12:30»
 *  lo lascia «ca. 12:30»: il dialogo diceva «sarà pronta ca. 12:30 invece che
 *  ca. 12:30». Serve conferma se cambia l'orario mostrato del pasto o se
 *  compare un'azione di notte che prima non c'era. */
export function startNowNeedsConfirm(
  steps: readonly SessionTiming[],
  index: number,
  nowMs: number,
  approximate: boolean,
): boolean {
  const preview = previewStartNow(steps, index, nowMs);
  if (displayedClockMs(preview.readyAtMs, approximate) !== displayedClockMs(sessionReadyAt(steps), approximate)) return true;
  const before = new Set(sessionNightActions(steps, nowMs).map((a) => a.index));
  return preview.nightActions.some((a) => !before.has(a.index));
}

/** Azioni attive ancora da fare che cadono di notte (S10-A-03). */
export function sessionNightActions(steps: readonly SessionTiming[], nowMs: number): NightAction[] {
  return steps
    .map((s, index) => ({ s, index }))
    .filter(({ s }) => !s.done && ACTIVE_STEP_IDS.has(s.id) && s.startMs >= nowMs - 60_000 && isNightHour(new Date(s.startMs).getHours()))
    .map(({ s, index }) => ({ index, id: s.id, atMs: s.startMs }));
}

/** Il passo è cominciato: inizio reale registrato, oppure è arrivata la sua ora. */
export function stepHasStarted(step: SessionTiming, nowMs: number): boolean {
  return step.actualStartMs !== undefined || nowMs >= step.startMs;
}

/** Soglia oltre la quale un cambio dell'orario di fine si annuncia (S10-B-12). */
export const READY_CHANGE_ANNOUNCE_MS = 15 * 60_000;

/** Impronta della ricetta cucinata: se la ricetta cambia, «Inizia» lo sa
 *  (S10-B-21). Stabile, senza crittografia: serve solo a confrontare. */
export function recipeFingerprint(parts: readonly (string | number | undefined)[]): string {
  let h = 2166136261;
  const text = parts.map((p) => String(p ?? "")).join("␟");
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(36);
}

/* ── G4a-WP-02 (S10-B-23): un solo avanzamento per barra e widget ──
 * La barra della vista contava i passi fatti, l'anello del widget il tempo:
 * due percentuali per la stessa pizzata. Regola unica: la frazione del tempo
 * del piano già trascorsa (una lievitazione di 9 ore pesa più di una piega),
 * mai meno dei passi fatti sul totale, e 100 % solo quando sono tutti fatti. */
const UNFINISHED_PROGRESS_CAP = 0.99;

export function sessionProgress(steps: readonly SessionTiming[], nowMs: number): number {
  const total = steps.length;
  if (total === 0) return 0;
  const done = steps.filter((s) => s.done).length;
  if (done >= total) return 1;
  const first = steps[0].startMs;
  const last = steps[total - 1].endMs;
  const time = last > first ? Math.min(1, Math.max(0, (nowMs - first) / (last - first))) : 0;
  return Math.min(UNFINISHED_PROGRESS_CAP, Math.max(done / total, time));
}

/** G4a-WP-02 (S10-B-04): un passo attivo cronometrato è arrivato a zero.
 *  Vale solo se il conto alla rovescia è partito davvero (inizio registrato),
 *  come «in ritardo» nella vista; le attese finiscono con la loro notifica. */
export function activeStepTimeUp(
  step: SessionTiming & { flexible: boolean },
  waiting: boolean,
  nowMs: number,
): boolean {
  return !step.done && !step.flexible && !waiting && step.duration_minutes > 0
    && step.actualStartMs !== undefined && nowMs >= step.endMs;
}

/* ── Durata e freddo (anche per l'anteprima del percorso in Impara) ── */

export function totalPlannedMinutes(
  timeline: readonly PlanStepInput[],
  stretch: Readonly<Record<number, number>> = {},
): number {
  return timeline.reduce((sum, step, i) => sum + step.duration_minutes + (stretch[i] ?? 0), 0);
}

/** Temperatura a cui il motore fa davvero la fase: l'appretto è sempre ad
 *  almeno 18 °C (PROOF_MIN_TEMP_C), il prefermento a temperatura ambiente. */
export function phaseTemperatureC(stepId: string, fermentTempC: number): number {
  if (stepId === "proof") return Math.max(fermentTempC, PROOF_MIN_TEMP_C);
  if (stepId === "preferment") return Math.max(fermentTempC, PROOF_MIN_TEMP_C);
  return fermentTempC;
}

/** Fase in frigo (≤ FRIDGE_MAX_TEMP_C, la soglia delle tolleranze «cold»). */
export function isColdPhase(stepId: string, fermentTempC: number): boolean {
  return phaseTemperatureC(stepId, fermentTempC) <= FRIDGE_MAX_TEMP_C;
}
