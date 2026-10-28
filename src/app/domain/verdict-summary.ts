import type { EngineMsg, RecipeBlocker, RecipeCondition, RecipeVerdict } from "./pizza-engine";

/* ═══ FW-10 — Esito di fattibilità deduplicato e ordinato ═══
 * Il motore elenca tutto quello che ha visto: il blocco, gli avvisi del
 * punteggio, le condizioni di dispensa. Detto così, lo stesso forno troppo
 * freddo compariva quattro o cinque volte, con soglie diverse e accanto a
 * condizioni («Se hai farina W285») che non servono quando la ricetta non si
 * può fare. Questa funzione pura decide che cosa dire prima (una causa, con
 * il rimedio) e che cosa lasciare al livello 2. Non cambia nessun numero. */

/** Rimedio della causa principale: un'azione, non un altro motivo. */
export type VerdictRemedy =
  /** Il pasto più avanti: le ore che servono in tutto. */
  | { kind: "later_time"; hours: number }
  /** Un filtro alimentare del profilo esclude un ingrediente necessario. */
  | { kind: "review_diet"; filter_id: string }
  /** Nessuna correzione nella ricetta: stili che con gli stessi vincoli funzionano. */
  | { kind: "alternatives" };

export interface VerdictSummary {
  /** Causa principale del «non fattibile», o null se la ricetta si fa. */
  primary: RecipeBlocker | null;
  remedy?: VerdictRemedy;
  /** Altre cause bloccanti, ordinate per gravità, senza doppioni. */
  secondary: RecipeBlocker[];
  /** Avvisi e adattamenti senza quelli già detti dalla causa principale né
   *  le condizioni quando la ricetta è bloccata; ordinati per gravità. */
  adaptations: EngineMsg[];
  /** Condizioni di dispensa e attrezzatura: vuote se la ricetta è bloccata
   *  («Se hai…» non serve su una ricetta che non si può fare). */
  conditions: RecipeCondition[];
  /** Aiuti facoltativi (es. semola per la stesura): vuoti se bloccata. */
  optionalAids: EngineMsg[];
  /** Avviso di abilità da portare al livello 1 (idratazione alta per chi
   *  comincia). Null se bloccata: prima viene la causa del blocco. */
  skillWarning: EngineMsg | null;
  /** Il «limite» del punteggio (autenticità o fattibilità) va detto solo se
   *  la ricetta si fa: con un blocco la causa è il blocco. */
  showScoreLimit: boolean;
}

/** Gravità della causa: prima ciò che nessuna regolazione della ricetta
 *  risolve (dieta, forno), poi il metodo, poi i tempi, infine la dispensa. */
const BLOCKER_RANK: Record<RecipeBlocker["kind"], number> = {
  dietary_conflict: 0,
  oven_too_cold: 1,
  fermentation_temperature: 2,
  fermentation_too_short: 3,
  fermentation_too_long: 3,
  time_window: 4,
  resource_excluded: 5,
};

/** Avvisi che ripetono, con altre parole o soglie, il forno troppo freddo. */
export const OVEN_COVERED_KEYS: readonly string[] = [
  "feas.thermalUnviable",
  "auth.thermalUnviable",
  "feas.ovenTooCold",
  "feas.ovenSuboptimal",
  "gen.notWoodOven",
  "gen.notCoalOven",
  "gen.homeBakingMethod",
];
/** Avvisi che ripetono una finestra di tempo troppo corta. */
const TIME_COVERED_KEYS: readonly string[] = [
  "gen.windowTooShort",
  "gen.timeBelowStyleWindow",
  "gen.timeBelowStyleWindowMeal",
];
/** Avvisi di abilità che decidono se un principiante riesce a stendere l'impasto. */
export const SKILL_WARNING_KEYS: readonly string[] = [
  "feas.hydrationBeginnerHigh",
  "feas.hydrationMedBeginner",
];

/** Gravità di un avviso non bloccante: forno e cottura, abilità, tempi,
 *  altro, condizioni di dispensa. */
function adaptationRank(key: string): number {
  if (OVEN_COVERED_KEYS.includes(key)) return 0;
  if (SKILL_WARNING_KEYS.includes(key)) return 1;
  if (TIME_COVERED_KEYS.includes(key)) return 2;
  if (key.startsWith("need.")) return 4;
  return 3;
}

function blockerIdentity(blocker: RecipeBlocker): string {
  switch (blocker.kind) {
    case "dietary_conflict": return `${blocker.kind}:${blocker.filter_id}`;
    case "resource_excluded": return `${blocker.kind}:${blocker.message.key}:${JSON.stringify(blocker.message.params ?? {})}`;
    default: return blocker.kind;
  }
}

function msgIdentity(msg: EngineMsg): string {
  return `${msg.key}:${JSON.stringify(msg.params ?? {})}`;
}

function uniqueBy<T>(items: readonly T[], identity: (item: T) => string): T[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    const id = identity(item);
    if (seen.has(id)) return false;
    seen.add(id);
    return true;
  });
}

function stableSort<T>(items: readonly T[], rank: (item: T) => number): T[] {
  return items
    .map((item, index) => ({ item, index }))
    .sort((a, b) => rank(a.item) - rank(b.item) || a.index - b.index)
    .map(({ item }) => item);
}

/** Le ore che servono in tutto quando la causa è il tempo. */
export function laterHours(blockers: readonly RecipeBlocker[]): number | null {
  const hours = blockers.flatMap((b) =>
    b.kind === "time_window" || b.kind === "fermentation_too_short" ? [b.needed_h] : [],
  );
  return hours.length > 0 ? Math.max(...hours) : null;
}

function remedyFor(primary: RecipeBlocker, blockers: readonly RecipeBlocker[]): VerdictRemedy {
  if (primary.kind === "dietary_conflict") return { kind: "review_diet", filter_id: primary.filter_id };
  if (primary.kind === "time_window" || primary.kind === "fermentation_too_short") {
    const hours = laterHours(blockers);
    if (hours !== null) return { kind: "later_time", hours };
  }
  return { kind: "alternatives" };
}

export function summarizeVerdict(
  verdict: RecipeVerdict,
  optionalAids: readonly EngineMsg[] = [],
): VerdictSummary {
  const blocked = verdict.outcome === "not_feasible" && verdict.blockers.length > 0;
  const blockers = stableSort(uniqueBy(verdict.blockers, blockerIdentity), (b) => BLOCKER_RANK[b.kind]);
  const [primary = null, ...secondary] = blocked ? blockers : [];

  const covered = new Set<string>();
  if (blocked) {
    if (blockers.some((b) => b.kind === "oven_too_cold")) OVEN_COVERED_KEYS.forEach((k) => covered.add(k));
    if (blockers.some((b) => b.kind === "time_window" || b.kind === "fermentation_too_short")) {
      TIME_COVERED_KEYS.forEach((k) => covered.add(k));
    }
    // Le condizioni («Se hai…», «Serve…») non aiutano su una ricetta bloccata.
    (verdict.conditions ?? []).forEach((c) => covered.add(c.message.key));
  }
  const adaptations = stableSort(
    uniqueBy(verdict.adaptations, msgIdentity).filter((m) => !covered.has(m.key)),
    (m) => adaptationRank(m.key),
  );

  return {
    primary,
    remedy: primary ? remedyFor(primary, blockers) : undefined,
    secondary,
    adaptations,
    conditions: blocked ? [] : [...(verdict.conditions ?? [])],
    optionalAids: blocked ? [] : uniqueBy(optionalAids, msgIdentity),
    skillWarning: blocked ? null : verdict.adaptations.find((m) => SKILL_WARNING_KEYS.includes(m.key)) ?? null,
    showScoreLimit: verdict.outcome !== "not_feasible",
  };
}
