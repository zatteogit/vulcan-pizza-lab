import type { OvenType, SkillLevel } from "../domain/pizza-engine";
import { nextSavedOven, type SavedOvenPref } from "./effective-kitchen";

/* ═══ G5-WP-01 (S15-A-01, S15-B-01): «Salta» non butta via le scelte ═══
 * Prima «Salta» scriveva solo il completamento: chi aveva già confermato
 * forno e livello arrivava in Crea con il forno di casa e «Principiante».
 * Qui si decide che cosa salvare, senza React né localStorage.
 * Regole: «Salta» al primo passo non salva nulla (D-038, audit n. 33: forno e
 * livello restano «non scelti»); il forno si salva se è stato confermato con
 * «Avanti» (passo 0), il livello se è stato confermato (passo 1) e scelto; la
 * dispensa solo se non è vuota. «Vai a Crea» salva tutto come prima. */

export interface FtuState {
  /** Indice più alto confermato con «Avanti» (-1 se nessuno). */
  confirmedUpTo: number;
  mode: "finish" | "skip";
  savedOven: SavedOvenPref | null | undefined;
  ovenType: OvenType;
  ovenTemp: number;
  /** G5-WP-03: modello scelto con «Cerca il tuo modello» (null = nessuno;
   *  assente = non gestito, vale la regola del forno salvato). */
  modelId?: string | null;
  skillLevel: SkillLevel | null;
  flours: string[];
  yeasts: string[];
}

export interface FtuWrites {
  oven?: SavedOvenPref;
  skill?: SkillLevel;
  pantry?: { flours: string[]; yeasts: string[] };
}

/** Passi dell'onboarding (FtuOnboarding): 0 forno, 1 livello, 2 dispensa. */
export const FTU_STEP = { oven: 0, skill: 1, pantry: 2 } as const;

export function planFtuWrites(state: FtuState): FtuWrites {
  const finish = state.mode === "finish";
  const writes: FtuWrites = {};
  if (finish || state.confirmedUpTo >= FTU_STEP.oven) {
    // Il modello resta solo se il forno non è cambiato (FW-07, S18-A-01).
    writes.oven = state.modelId !== undefined
      ? { ovenType: state.ovenType, maxTemp: state.ovenTemp, ...(state.modelId ? { modelId: state.modelId } : {}) }
      : state.savedOven?.ovenType === state.ovenType
      ? nextSavedOven(state.savedOven, state.ovenType)
      : { ovenType: state.ovenType, maxTemp: state.ovenTemp };
  }
  if (state.skillLevel !== null && (finish || state.confirmedUpTo >= FTU_STEP.skill)) writes.skill = state.skillLevel;
  if ((finish || state.confirmedUpTo >= FTU_STEP.pantry) && (state.flours.length > 0 || state.yeasts.length > 0)) {
    writes.pantry = { flours: state.flours, yeasts: state.yeasts };
  }
  return writes;
}
