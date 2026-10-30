import { describe, expect, it } from "vitest";
import {
  PIZZA_FAMILIES, STYLES_DB, generateRecipe, isUnworkedPanDough, type SkillLevel, type UserConstraints,
} from "../domain/pizza-engine";
import { SKILL_WARNING_KEYS } from "../domain/verdict-summary";
import { getInterpretationById } from "../data/interpretation-library";
import { getStyleReference } from "../data/style-versions";
import { recipeCardSignals } from "../features/recipe/recipe-card-signals";
import { referenceEyebrow } from "../features/recipe/reference-label";
import { sourceTiming } from "../features/recipe/recipe-configurator";
import { stepGlossaryTerms } from "../features/glossary/step-terms";
import { getStepTroubleshooting } from "../data/troubleshooting-data";
import { IT_LOCALE } from "../features/cms/locales/it";
import { EN_LOCALE } from "../features/cms/locales/en";
import { DE_LOCALE } from "../features/cms/locales/de";
import { ES_LOCALE } from "../features/cms/locales/es";
import { FR_LOCALE } from "../features/cms/locales/fr";
import { JA_LOCALE } from "../features/cms/locales/ja";
import { PT_LOCALE } from "../features/cms/locales/pt";
import { uiMessage } from "../i18n/ui-messages";
import { handleMcpMessage } from "../agent/mcp-server";
import {
  canonicalInterpretation, canonicalRecipe, optimizeSelectedRecipe, sourceReferenceCenter, tailoredRecipeEntry,
} from "./recipe-entry";

/* ═══ Tranche B2, seguito (decisioni di Matteo del 30/10/2026) ═══
 * Famiglia «Di casa», un solo riferimento «Riferimento · Benedetta Rossi»,
 * salsa condita dichiarata, proposta su misura vicina al riferimento,
 * «luogo caldo» in Crea, niente segnali da esperto né staglio/panetti/
 * incordatura per un impasto mescolato col cucchiaio e allargato in teglia
 * (docs/progetto-catalogo-italiano.md §9.11). */

const style = STYLES_DB.teglia_in_giornata;
const benedetta = getInterpretationById("benedetta_rossi")!;
const kitchen: UserConstraints = { oven_type: "home", oven_max_temp_c: 250, oven_capacity_temp_c: 250, skill_level: 1,
  available_hours: 25, meal_deadline: true, dough_balls: 1, has_mixer: false, has_pizza_stone: false, has_pizza_steel: false,
  has_baking_pan: true, pantry_flours: [], pantry_yeasts: [], dietary_filters: [], kitchen_temp_c: 21 };
const LOCALES = { it: IT_LOCALE, en: EN_LOCALE, de: DE_LOCALE, es: ES_LOCALE, fr: FR_LOCALE, ja: JA_LOCALE, pt: PT_LOCALE };

describe("1 · famiglia «Di casa»", () => {
  it("la teglia in giornata è l'unico stile di casa, con il nome in 7 lingue", () => {
    expect(style.family).toBe("casa");
    expect(PIZZA_FAMILIES.casa.name).toBe("Di casa");
    expect(Object.values(STYLES_DB).filter((s) => s.family === "casa" || s.families?.includes("casa")).map((s) => s.id))
      .toEqual(["teglia_in_giornata"]);
    for (const [id, locale] of Object.entries(LOCALES)) expect(locale.families?.casa?.name, id).toBeTruthy();
    expect(new Set(Object.values(LOCALES).map((l) => l.families.casa.name)).size).toBe(7);
  });
});

describe("2 · un solo riferimento quando è una versione d'autore", () => {
  it("l'etichetta della ricetta è «Riferimento, ispirata a Benedetta Rossi»", () => {
    const label = referenceEyebrow({ styleId: style.id, tailored: false, tailoredLabel: "Su misura", referenceLabel: "Riferimento",
      interpretation: benedetta, version: null, adaptedToOven: false });
    expect(label).toBe(uiMessage("recipe.referenceLabel.sourceReference", ["Benedetta Rossi"]));
    expect(label).toBe("Riferimento, ispirata a Benedetta Rossi");
  });
  it("una versione d'autore che non è il riferimento resta «Ispirata a…»", () => {
    expect(getStyleReference("napoletana_canotto").basis).not.toBe("fonte");
    const label = referenceEyebrow({ styleId: "napoletana_canotto", tailored: false, tailoredLabel: "Su misura", referenceLabel: "Riferimento",
      interpretation: benedetta, version: null, adaptedToOven: false });
    expect(label).toBe("Ispirata a Benedetta Rossi");
  });
});

describe("3 · salsa condita: la scelta di Vulcan è dichiarata", () => {
  it("riferimento e proposta su misura portano la nota, in 7 lingue", () => {
    const keys = (r: { source_notes?: { key: string }[] }) => r.source_notes?.map((n) => n.key) ?? [];
    expect(keys(canonicalRecipe(style, kitchen))).toContain("topping.sauceSeasoning");
    expect(keys(tailoredRecipeEntry(style, kitchen).recipe)).toContain("topping.sauceSeasoning");
    for (const [id, locale] of Object.entries(LOCALES)) {
      expect(locale.engineMessages["topping.sauceSeasoning"], id).toMatch(/\{app\}/);
    }
    // Solo il condimento della fonte: la margherita della teglia romana non la porta.
    expect(keys(generateRecipe(STYLES_DB.teglia_romana, kitchen))).not.toContain("topping.sauceSeasoning");
  });
});

describe("4 · proposta su misura dentro lo stile e vicina al riferimento", () => {
  it("per ogni livello e tempo: idratazione 77–82 %, W 255–305, al più 6 h", () => {
    for (const skill of [1, 2, 3, 4] as SkillLevel[]) for (const [hours, deadline] of [[6, true], [25, true], [48, false]] as const) {
      const c = { ...kitchen, skill_level: skill, available_hours: hours, meal_deadline: deadline };
      const label = `livello ${skill}, ${hours} h`;
      for (const r of [tailoredRecipeEntry(style, c).recipe, optimizeSelectedRecipe(style, c, undefined, undefined, null, "benedetta_rossi").recipe]) {
        expect(r.hydration_pct, label).toBeGreaterThanOrEqual(77);
        expect(r.hydration_pct, label).toBeLessThanOrEqual(82);
        expect(r.flour_w, label).toBeGreaterThanOrEqual(255);
        expect(r.flour_w, label).toBeLessThanOrEqual(305);
        expect(r.fermentation_hours, label).toBeGreaterThanOrEqual(2);
        expect(r.fermentation_hours, label).toBeLessThanOrEqual(6);
        expect(r.verdict.outcome, label).not.toBe("not_feasible");
      }
    }
  });
  it("prima: 68 % e 12 h a 22 °C per chi comincia; ora 77 % e 6 h", () => {
    const r = tailoredRecipeEntry(style, kitchen).recipe;
    expect([r.hydration_pct, r.fermentation_hours, r.fermentation_temp_c]).toEqual([77, 6, 22]);
  });
  it("vale solo per gli stili con il riferimento da una fonte", () => {
    for (const s of Object.values(STYLES_DB)) {
      const fonte = getStyleReference(s.id).basis === "fonte";
      expect(Boolean(sourceReferenceCenter(s)), s.id).toBe(fonte);
    }
    expect(sourceReferenceCenter(style)).toEqual({ hydration_pct: 80, flour_w: 280, fermentation_hours: 2 });
  });
  it("MCP «adapted» e voce leggono la stessa proposta", () => {
    const response = handleMcpMessage({ jsonrpc: "2.0", id: 1, method: "tools/call", params: { name: "generate_recipe",
      arguments: { style_id: style.id, oven_type: "home", oven_max_temp_c: 250, dough_balls: 1, skill_level: 1, recipe_mode: "adapted", available_hours: 25 } } });
    const data = (response as { result: { structuredContent: Record<string, any> } }).result.structuredContent;
    expect(data.hydration_pct).toBeGreaterThanOrEqual(77);
    expect(data.fermentation_hours).toBeLessThanOrEqual(6);
  });
});

describe("5 · «luogo caldo» in Crea", () => {
  it("il riferimento ha il lievito e il luogo caldo della fonte; la proposta su misura no", () => {
    expect(sourceTiming(canonicalRecipe(style, kitchen))).toEqual({ yeastFromSource: true, warmPlace: true });
    expect(sourceTiming(tailoredRecipeEntry(style, kitchen).recipe)).toEqual({ yeastFromSource: false, warmPlace: false });
    expect(uiMessage("features.recipe.recipe-configurator.tempWarmPlace", ["26 °C"])).toBe("Luogo caldo · 26 °C");
  });
});

describe("6 · idratazione e principiante: conta se l'impasto si lavora a mano", () => {
  it("solo la teglia in giornata ha un impasto che non si lavora (nessuno stile di prima)", () => {
    expect(Object.values(STYLES_DB).filter(isUnworkedPanDough).map((s) => s.id)).toEqual(["teglia_in_giornata"]);
    expect(isUnworkedPanDough({ ...style, method_profile: benedetta.process_profile })).toBe(true);
  });
  it("niente «Impasto esigente» né «Abbassa l'idratazione» all'80 % mescolato in teglia", () => {
    for (const r of [canonicalRecipe(style, kitchen), tailoredRecipeEntry(style, kitchen).recipe]) {
      expect(r.verdict.adaptations.filter((a) => SKILL_WARNING_KEYS.includes(a.key))).toEqual([]);
      expect(recipeCardSignals(r).map((s) => s.message.key)).not.toContain("card.hydrationBeginner");
    }
  });
  it("lo stesso impasto, impastato a mano (o non in teglia), resta esigente", () => {
    const kneaded = { ...style, method_profile: { ...style.method_profile!, mix_without_kneading: false } };
    const notInPan = { ...style, proof_in_pan: false };
    for (const s of [kneaded, notInPan]) {
      const r = generateRecipe(s, kitchen, { customHydration: 80 });
      expect(r.verdict.adaptations.some((a) => SKILL_WARNING_KEYS.includes(a.key))).toBe(true);
    }
    // Uno stile in teglia impastato (focaccia barese) non cambia.
    const barese = generateRecipe(STYLES_DB.focaccia_barese, kitchen, { customHydration: 78 });
    expect(barese.verdict.adaptations.some((a) => SKILL_WARNING_KEYS.includes(a.key))).toBe(true);
  });
});

describe("7 · niente staglio, panetti o incordatura per l'impasto mescolato in teglia", () => {
  it("il processo dello stile è quello del riferimento (base «fonte»)", () => {
    const profile = canonicalInterpretation(style)!.process_profile!;
    const flags = ({ direct_only, proof_hours, proof_in_pan, mix_without_kneading }: typeof profile) =>
      ({ direct_only, proof_hours, proof_in_pan, mix_without_kneading });
    expect(flags(style.method_profile!)).toEqual(flags(profile));
  });
  it("una teglia: mescola (senza glossario d'incordatura), niente staglio, preriscaldo senza panetti", () => {
    for (const r of [canonicalRecipe(style, kitchen), tailoredRecipeEntry(style, kitchen).recipe]) {
      const ids = r.timeline.map((s) => s.id);
      expect(ids).not.toContain("divide");
      const mix = r.timeline.find((s) => s.id === "mix")!;
      expect(mix.variant).toBe("stir");
      expect(mix.msg?.description?.[0]?.key).toBe("timeline.mix.stir");
      expect(stepGlossaryTerms("mix", { variant: mix.variant })).toEqual([]);
      expect(getStepTroubleshooting(mix)).toBeUndefined();
      const text = r.timeline.map((s) => `${s.title} ${s.description} ${s.tip?.beginner ?? ""} ${s.tip?.nerd ?? ""}`).join(" ");
      expect(text).not.toMatch(/panett|incordatura|slap|pieghe|pirlatura/i);
      expect(r.timeline.find((s) => s.id === "preheat")?.description).toContain("l'impasto");
    }
    // Glossario e problemi dell'impasto lavorato restano com'erano.
    expect(stepGlossaryTerms("mix")).toEqual(["gluten_development", "folds"]);
    expect(getStepTroubleshooting({ id: "mix" })?.issueIds).toEqual(["P01"]);
  });
  it("con due teglie l'impasto si divide direttamente nelle teglie, senza panetti né pirlatura", () => {
    const r = canonicalRecipe(style, { ...kitchen, dough_balls: 2 });
    const divide = r.timeline.find((s) => s.id === "divide")!;
    expect(divide.variant).toBe("pan");
    expect(divide.msg?.description?.[0]?.key).toBe("timeline.divide.pans");
    expect(divide.duration_minutes).toBe(15);
    expect(stepGlossaryTerms("divide", { variant: "pan" })).toEqual(["dough_division"]);
    expect(stepGlossaryTerms("divide")).toEqual(["dough_division", "ball_shaping"]);
    expect(`${divide.title} ${divide.description}`).not.toMatch(/panett|pirl|staglio/i);
  });
});
