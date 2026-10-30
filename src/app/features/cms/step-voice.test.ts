import { describe, expect, it } from "vitest";
import { type CmsContent } from "./cms-context";
import { IT_LOCALE } from "./locales/it";
import { ES_LOCALE } from "./locales/es";
import { FR_LOCALE } from "./locales/fr";
import { PT_LOCALE } from "./locales/pt";
import { TOPPING_LIBRARY } from "../../data/topping-library";
import { STYLES_DB, generateRecipe, type UserConstraints } from "../../domain/pizza-engine";

/* ═══ G3-WP-05 (S09-A-21, D-G3-01) — una sola voce verbale nei passi ═══
 * I passi del Procedimento parlano all'imperativo di seconda persona
 * («Impasta», «Dividi», «Cuoci a {temp}»), mai all'infinitivo da ricettario
 * («Impastare»). La regola è in docs/linee-guida-editoriali.md (§Voce).
 * Qui si controlla la prima parola di ogni frase (dopo . ; ! ? :) di
 * descrizioni, «Come si fa» e consigli dei passi, dei passi del condimento e
 * dei testi che il motore produce per tutti gli stili. «Non» + infinito è
 * l'imperativo negativo e passa da sé, perché la prima parola è «Non». */

/** Parole in -are/-ere/-ire che non sono infiniti. Ogni voce ha il suo motivo. */
const IT_NOT_INFINITIVE = new Set([
  "disciplinare", // sostantivo: «Disciplinare AVPN: …» (il regolamento della pizza napoletana)
]);
// Infinito semplice («Stendere») o con il pronome attaccato («lasciarlo», «scolarla»).
const IT_INFINITIVE = /^[a-zà-ù]+(?:(?:are|ere|ire|rre)|(?:ar|er|ir|rr)(?:lo|la|li|le|ne|si|glielo|gliela))$/i;

function clauseStarts(text: string): string[] {
  return text
    .split(/(?<=[.;!?:])\s+/)
    .map((clause) => clause.trim().replace(/^[«"“(\-–—\s]+/, "").split(/[\s,.;:'’()]/)[0])
    .filter(Boolean);
}

function italianInfinitives(text: string): string[] {
  return clauseStarts(text).filter((w) => IT_INFINITIVE.test(w) && !IT_NOT_INFINITIVE.has(w.toLowerCase()));
}

type Leaf = { path: string; text: string };

function leaves(value: unknown, path: string, out: Leaf[] = []): Leaf[] {
  if (typeof value === "string") out.push({ path, text: value });
  else if (value && typeof value === "object") {
    for (const [key, child] of Object.entries(value)) leaves(child, `${path}.${key}`, out);
  }
  return out;
}

/** Testi dei passi del catalogo: tutto tranne i titoli, che restano sostantivi. */
function stepTexts(cms: Pick<CmsContent, "timelineLabels" | "engineMessages">): Leaf[] {
  const fromLabels = leaves(cms.timelineLabels, "timelineLabels").filter((l) => !l.path.endsWith(".title"));
  const fromEngine = Object.entries(cms.engineMessages)
    .filter(([key]) => key.startsWith("timeline.") && !key.endsWith(".title"))
    .map(([key, text]) => ({ path: `engineMessages.${key}`, text }));
  return [...fromLabels, ...fromEngine];
}

/** Passi del condimento: qui anche il titolo, che può essere un sostantivo o
 *  un imperativo («Stufa la cipolla»), mai un infinito. */
function toppingStepTexts(): Leaf[] {
  const out: Leaf[] = [];
  for (const [id, recipe] of Object.entries(TOPPING_LIBRARY)) {
    const visit = (value: unknown, path: string) => {
      if (Array.isArray(value)) value.forEach((item, i) => visit(item, `${path}[${i}]`));
      else if (value && typeof value === "object") {
        for (const [key, child] of Object.entries(value)) {
          if (key === "assembly_steps" || key === "pre_prep_steps") leaves(child, `${path}.${key}`, out);
          else visit(child, `${path}.${key}`);
        }
      }
    };
    visit(recipe, id);
  }
  return out.filter((l) => !/\.(id|insert_at|timing|for_styles)\b/.test(l.path));
}

function constraints(kind: "ideal" | "home", style: (typeof STYLES_DB)[string]): UserConstraints {
  const ideal = kind === "ideal";
  return {
    oven_type: ideal
      ? style.baking.oven_type_required === "coal" ? "coal" : style.requires_wood_oven ? "wood" : style.baking.temp_c_ideal >= 350 ? "gas" : "home"
      : "home",
    oven_max_temp_c: ideal ? style.baking.temp_c_ideal : 250,
    skill_level: ideal ? 4 : 2,
    available_hours: ideal ? 72 : 24,
    dough_balls: 4,
    has_mixer: false,
    has_pizza_stone: ideal,
    has_pizza_steel: false,
    has_baking_pan: true,
    dietary_filters: [],
    kitchen_temp_c: 22,
    pantry_flours: [],
    pantry_yeasts: [],
    mixer_type: "hands",
    surfaces: [],
  };
}

describe("voce verbale dei passi: imperativo, mai infinito (D-G3-01)", () => {
  it("la guardia riconosce l'infinito e lascia passare imperativo e negazione", () => {
    expect(italianInfinitives("Dividere in panetti. Formare pallina.")).toEqual(["Dividere", "Formare"]);
    expect(italianInfinitives("Stendi il disco; lasciarlo lievitare.")).toEqual(["lasciarlo"]);
    expect(italianInfinitives("Dividi in panetti. Non salare prima della cottura.")).toEqual([]);
    expect(italianInfinitives("Disciplinare AVPN: pomodoro e basilico.")).toEqual([]);
  });

  it("catalogo italiano: descrizioni, «Come si fa» e consigli dei passi", () => {
    const offenders = stepTexts(IT_LOCALE)
      .map((l) => ({ ...l, words: italianInfinitives(l.text) }))
      .filter((l) => l.words.length > 0)
      .map((l) => `${l.path}: ${l.words.join(", ")}`);
    expect(offenders).toEqual([]);
  });

  it("passi del condimento (libreria topping): titoli, descrizioni e consigli", () => {
    const offenders = toppingStepTexts()
      .map((l) => ({ ...l, words: italianInfinitives(l.text) }))
      .filter((l) => l.words.length > 0)
      .map((l) => `${l.path}: ${l.words.join(", ")}`);
    expect(offenders).toEqual([]);
  });

  it("testi prodotti dal motore per tutti gli stili, in cucina ideale e di casa", () => {
    const offenders = new Set<string>();
    for (const style of Object.values(STYLES_DB)) {
      for (const kind of ["ideal", "home"] as const) {
        const recipe = generateRecipe(style, constraints(kind, style));
        for (const step of recipe.timeline) {
          for (const l of leaves({ description: step.description, tip: step.tip }, `${style.id}/${kind}/${step.id}`)) {
            const words = italianInfinitives(l.text);
            if (words.length) offenders.add(`${l.path}: ${words.join(", ")}`);
          }
        }
      }
    }
    expect([...offenders]).toEqual([]);
  });
});

/* Francese, spagnolo e portoghese hanno l'infinito da ricettario a portata di
 * mano: la descrizione breve dei passi deve usare l'imperativo già prevalente
 * nel resto del catalogo (fr «vous», es «tú», pt «você»). */
const ROMANCE: Record<string, { cms: Pick<CmsContent, "timelineLabels" | "engineMessages">; infinitive: RegExp; notInfinitive: Set<string> }> = {
  fr: {
    cms: FR_LOCALE as CmsContent,
    infinitive: /^[a-zà-ÿ]+(?:er|ir|re)$/i,
    // «Entre deux cuissons…», sostantivi d'apertura delle note sul forno.
    notInfinitive: new Set(["entre", "pierre", "structure"]),
  },
  es: {
    cms: ES_LOCALE as CmsContent,
    infinitive: /^[a-zà-ÿ]+(?:ar|er|ir)(?:lo|la|los|las|le|se)?$/i,
    // Infiniti sostantivati nei consigli tecnici («Hornear sin cobertura completa…»).
    notInfinitive: new Set(["hornear", "abrir", "fermentar", "darle"]),
  },
  pt: {
    cms: PT_LOCALE as CmsContent,
    infinitive: /^[a-zà-ÿ]+(?:ar|er|ir)$/i,
    // Infiniti sostantivati nei consigli tecnici («Assar sem cobertura completa…»).
    notInfinitive: new Set(["assar", "abrir", "fermentar", "virar"]),
  },
};

describe("voce verbale dei passi nelle altre lingue romanze", () => {
  for (const [lang, { cms, infinitive, notInfinitive }] of Object.entries(ROMANCE)) {
    it(`${lang}: nessuna frase dei passi comincia con un infinito`, () => {
      const offenders = stepTexts(cms)
        .filter((l) => !/\.(tipNerd|batchModel|bake\.recovery)$/.test(l.path) && !l.path.includes(".tipNerd"))
        .map((l) => ({ ...l, words: clauseStarts(l.text).filter((w) => infinitive.test(w) && !notInfinitive.has(w.toLowerCase())) }))
        .filter((l) => l.words.length > 0)
        .map((l) => `${l.path}: ${l.words.join(", ")}`);
      expect(offenders).toEqual([]);
    });
  }
});
