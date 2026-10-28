/* ═══ FW-16 — Ogni impostazione dichiara il suo effetto ═══
 * Registro puro di cosa fa ogni scelta della cucina sulla ricetta. La UI
 * (Profilo, onboarding) mostra sotto ogni gruppo la frase CMS
 * `cms.settingEffects.<id>`: niente promesse oltre quello che il motore fa.
 *
 *  - changesRecipe: il motore usa il valore e i numeri o i passi cambiano
 *    (un test lo verifica su generateRecipe/optimizeRecipe);
 *  - warnsOnly: il motore controlla e avvisa (o blocca), ma non modifica dosi
 *    o ingredienti;
 *  - noEffectYet: il valore si salva ma oggi il motore non lo legge.
 */
import { hydrationCeilingForSkill, PRE_FERMENT_MIN_SKILL, SKILL_LEVELS, type SkillLevel } from "../domain/pizza-engine";

export type SettingEffectKind = "changesRecipe" | "warnsOnly" | "noEffectYet";

export type SettingId =
  | "oven"
  | "ovenHeat"
  | "skill"
  | "mixer"
  | "surfaces"
  | "tools"
  | "dietChecked"
  | "dietReminder"
  | "allergens"
  | "pantry"
  | "location"
  | "pizzaNerd";

export interface SettingEffect {
  id: SettingId;
  effect: SettingEffectKind;
  /** Cosa tocca nel motore o nella vista (identificatori, non testo). */
  affects: readonly string[];
}

export const SETTING_EFFECTS: readonly SettingEffect[] = [
  { id: "oven", effect: "changesRecipe", affects: ["feasibleStyles", "bakeTempAndTime", "hydrationCompensation"] },
  { id: "ovenHeat", effect: "changesRecipe", affects: ["preheat", "rackPosition", "rotations"] },
  { id: "skill", effect: "changesRecipe", affects: ["hydrationCeiling", "preFermentCandidates", "feasibilityScore"] },
  { id: "mixer", effect: "changesRecipe", affects: ["kneadMethod", "kneadTime", "frictionWaterTemp"] },
  { id: "surfaces", effect: "changesRecipe", affects: ["bakeSetup", "panAvailability", "feasibility"] },
  { id: "tools", effect: "noEffectYet", affects: [] },
  { id: "dietChecked", effect: "warnsOnly", affects: ["dietaryWarnings", "feasibility"] },
  { id: "dietReminder", effect: "warnsOnly", affects: ["dietaryWarnings"] },
  { id: "allergens", effect: "warnsOnly", affects: ["allergenWarnings", "feasibility"] },
  { id: "pantry", effect: "changesRecipe", affects: ["flourW", "yeastType"] },
  { id: "location", effect: "warnsOnly", affects: ["kitchenTempProposal"] },
  { id: "pizzaNerd", effect: "noEffectYet", affects: ["detailDisclosure"] },
];

export function settingEffect(id: SettingId): SettingEffect {
  const found = SETTING_EFFECTS.find((entry) => entry.id === id);
  if (!found) throw new Error(`setting effect mancante: ${id}`);
  return found;
}

/** Diete il cui controllo è sugli ingredienti dichiarati (avvisa o blocca). */
export const CHECKED_DIETS = ["gluten_free", "lactose_free", "vegan"] as const;
/** Diete che il motore non sa misurare: restano un promemoria (D-L). */
export const REMINDER_DIETS = ["low_fodmap", "histamine", "nickel"] as const;

/** Dieta → allergene che chi ha un'allergia vera deve segnare a parte. */
export const DIET_ALLERGEN_LINK: Readonly<Record<string, "gluten" | "milk">> = {
  gluten_free: "gluten",
  lactose_free: "milk",
};

export interface SkillEffectFacts {
  level: SkillLevel;
  /** Tetto di idratazione proposto, % sulla farina; null = nessun tetto. */
  hydrationCeilingPct: number | null;
  /** Il motore propone biga o poolish (negli stili che li ammettono). */
  offersPreFerment: boolean;
}

/** Fatti del motore per i testi «Cosa cambia» del livello: numeri dal motore. */
export function skillEffectFacts(): SkillEffectFacts[] {
  return SKILL_LEVELS.map(({ level }) => ({
    level,
    hydrationCeilingPct: hydrationCeilingForSkill(level),
    offersPreFerment: level >= PRE_FERMENT_MIN_SKILL,
  }));
}
