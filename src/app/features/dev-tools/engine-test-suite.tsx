/* ═══ ENGINE TEST SUITE — VPL-073 ═══
   Test completo, auto-adattivo per il motore di generazione ricette.
   Auto-scopre stili, vincoli, parametri dal STYLES_DB.
   12 categorie di test, ~200+ asserzioni generate dinamicamente. */

import React, { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Play,
  CheckCircle2,
  AlertTriangle,
  CircleX,
  ChevronDown,
  Zap,
  BarChart3,
  Database,
  FlaskConical,
  Thermometer,
  Droplets,
  Wheat,
  Shield,
  Shuffle,
  GitBranch,
  Layers,
  TrendingUp,
  Loader2,
  Copy,
  Check,
  ClipboardList,
  Sparkles,
} from "lucide-react";
import {
  STYLES_DB,
  calculateOvenCompensations,
  getQ10,
  generateRecipe,
  optimizeRecipe,
  defaultFermentTempC,
  estimatePL,
  recommendStyles,
  SCORE_DIMENSIONS,
  FLOUR_W_RANGES,
  RECIPE_SCHEMA_VERSION,
  type OvenType,
  type UserConstraints,
  type SkillLevel,
} from "../../domain/pizza-engine";
import {
  getOvenTempByStyle,
  getBakingTimeByStyle,
  getDoughBaseByStyle,
  getSaltByStyle,
  getWaterByStyle,
  getMaturationByStyle,
  getToppingByStyle,
  getFoldingByStyle,
  getScoringByStyle,
  getEquipmentByStyle,
} from "../../data/parametric-databases";
import { getStyleDeviation } from "../../domain/deviation-tags";
import { Badge, Surface } from "../../components/ds/index";
import { getAllInterpretations, getInterpretationsForStyle } from "../../data/interpretation-library";
import { FLOURS_DB, getCompatibleFlours, getEffectiveWRange } from "../../data/flour-database";

/* ═══ TYPES ═══ */
interface TestResult {
  id: string;
  name: string;
  status: "pass" | "fail" | "warn";
  detail: string;
  ms: number;
}

interface TestCategory {
  id: string;
  label: string;
  icon: React.ReactNode;
  color: string;
  run: () => TestResult[];
}

type SuiteStatus = "idle" | "running" | "done";

/* ═══ CONSTRAINT PRESETS — used across tests ═══ */
const OVEN_TYPES: OvenType[] = ["home", "electric_standard", "electric_high", "gas", "wood"];
const SKILL_LEVELS: SkillLevel[] = [1, 2, 3, 4];

function makeConstraints(overrides: Partial<UserConstraints> = {}): UserConstraints {
  return {
    oven_type: "home",
    oven_max_temp_c: 250,
    skill_level: 2,
    available_hours: 24,
    dough_balls: 4,
    has_mixer: false,
    has_pizza_stone: false,
    has_pizza_steel: false,
    has_baking_pan: false,
    dietary_filters: [],
    pantry_flours: [],
    pantry_yeasts: [],
    ...overrides,
  };
}

/* ═══ HELPERS ═══ */
const ALL_STYLES = () => Object.values(STYLES_DB);
const STYLE_IDS = () => Object.keys(STYLES_DB);

function timed<T>(fn: () => T): { result: T; ms: number } {
  const t0 = performance.now();
  const result = fn();
  return { result, ms: Math.round((performance.now() - t0) * 100) / 100 };
}



/* ═══ T01: DB INTEGRITY ═══ */
function runDbIntegrity(): TestResult[] {
  const results: TestResult[] = [];
  const styles = ALL_STYLES();
  const ids = STYLE_IDS();

  // T01-01: Count
  {
    const { ms } = timed(() => null);
    results.push({ id: "T01-01", name: "Stili presenti ≥ 15", status: styles.length >= 15 ? "pass" : "fail", detail: `${styles.length} stili`, ms });
  }

  // T01-02: Unique IDs
  {
    const { ms } = timed(() => null);
    const unique = new Set(ids).size;
    results.push({ id: "T01-02", name: "ID univoci", status: unique === ids.length ? "pass" : "fail", detail: `${unique}/${ids.length}`, ms });
  }

  // T01-03: Famiglie valide
  {
    const { ms } = timed(() => null);
    const validFamilies = ["napoletana", "romana", "americana", "contemporanea"];
    const invalid = styles.filter(s => !validFamilies.includes(s.family));
    results.push({ id: "T01-03", name: "Famiglie valide", status: invalid.length === 0 ? "pass" : "fail", detail: invalid.length ? `Invalide: ${invalid.map(s => s.id).join(", ")}` : `Tutte in ${validFamilies.join("/")}`, ms });
  }

  // T01-04: Hydration ranges
  {
    const errs: string[] = [];
    const { ms } = timed(() => {
      for (const s of styles) {
        const [lo, hi] = s.dough.hydration_pct_range;
        if (lo >= hi) errs.push(`${s.id}: [${lo},${hi}]`);
        if (lo < 30 || hi > 120) errs.push(`${s.id}: fuori range fisico [${lo},${hi}]`);
      }
    });
    results.push({ id: "T01-04", name: "Hydration ranges validi", status: errs.length === 0 ? "pass" : "fail", detail: errs.length ? errs.join("; ") : `${styles.length} stili OK`, ms });
  }

  // T01-05: W ranges
  {
    const errs: string[] = [];
    const { ms } = timed(() => {
      for (const s of styles) {
        const [lo, hi] = s.dough.flour_w_range;
        if (lo >= hi) errs.push(`${s.id}: W[${lo},${hi}]`);
        if (lo < 80 || hi > 500) errs.push(`${s.id}: W fuori range [${lo},${hi}]`);
      }
    });
    results.push({ id: "T01-05", name: "W ranges validi", status: errs.length === 0 ? "pass" : "fail", detail: errs.length ? errs.join("; ") : "OK", ms });
  }

  // T01-06: P/L ranges
  {
    const errs: string[] = [];
    const { ms } = timed(() => {
      for (const s of styles) {
        const [lo, hi] = s.dough.flour_pl_range;
        if (lo >= hi) errs.push(`${s.id}: P/L[${lo},${hi}]`);
        if (lo < 0.1 || hi > 2.0) errs.push(`${s.id}: P/L fuori range realistico [${lo},${hi}]`);
      }
    });
    results.push({ id: "T01-06", name: "P/L ranges validi", status: errs.length === 0 ? "pass" : "fail", detail: errs.length ? errs.join("; ") : "OK", ms });
  }

  // T01-07: Baking temp ranges
  {
    const errs: string[] = [];
    const { ms } = timed(() => {
      for (const s of styles) {
        const [lo, hi] = s.baking.temp_c_range;
        const ideal = s.baking.temp_c_ideal;
        if (lo >= hi) errs.push(`${s.id}: temp[${lo},${hi}]`);
        if (ideal < lo || ideal > hi) errs.push(`${s.id}: ideal ${ideal} fuori [${lo},${hi}]`);
      }
    });
    results.push({ id: "T01-07", name: "Baking temp coerenti", status: errs.length === 0 ? "pass" : "fail", detail: errs.length ? errs.join("; ") : "OK", ms });
  }

  // T01-08: Cook time ranges
  {
    const errs: string[] = [];
    const { ms } = timed(() => {
      for (const s of styles) {
        const [lo, hi] = s.baking.cook_time_sec_range;
        const ideal = s.baking.cook_time_sec_ideal;
        if (lo > hi) errs.push(`${s.id}: cook[${lo},${hi}]`);
        if (ideal < lo || ideal > hi) errs.push(`${s.id}: cook ideal ${ideal} fuori [${lo},${hi}]`);
      }
    });
    results.push({ id: "T01-08", name: "Cook time ranges coerenti", status: errs.length === 0 ? "pass" : "fail", detail: errs.length ? errs.join("; ") : "OK", ms });
  }

  // T01-09: Fermentation ranges
  {
    const errs: string[] = [];
    const { ms } = timed(() => {
      for (const s of styles) {
        const [lo, hi] = s.dough.fermentation_hours_range;
        if (lo >= hi) errs.push(`${s.id}: ferm[${lo},${hi}]`);
        if (lo < 0.5 || hi > 120) errs.push(`${s.id}: ferm fuori range fisico [${lo},${hi}]`);
      }
    });
    results.push({ id: "T01-09", name: "Fermentation ranges validi", status: errs.length === 0 ? "pass" : "fail", detail: errs.length ? errs.join("; ") : "OK", ms });
  }

  // T01-10: Required fields non-empty
  {
    const errs: string[] = [];
    const { ms } = timed(() => {
      for (const s of styles) {
        if (!s.name) errs.push(`${s.id}: name vuoto`);
        if (!s.origin) errs.push(`${s.id}: origin vuoto`);
        if (!s.emoji) errs.push(`${s.id}: emoji vuoto`);
        if (!s.crust_type) errs.push(`${s.id}: crust_type vuoto`);
        if (s.key_characteristics.length === 0) errs.push(`${s.id}: key_characteristics vuoto`);
      }
    });
    results.push({ id: "T01-10", name: "Campi obbligatori presenti", status: errs.length === 0 ? "pass" : "fail", detail: errs.length ? errs.join("; ") : "OK", ms });
  }

  // T01-11: Fat type consistency
  {
    const errs: string[] = [];
    const { ms } = timed(() => {
      for (const s of styles) {
        if (s.dough.fat_type === "none" && s.dough.oil_pct > 0) errs.push(`${s.id}: fat_type=none ma oil_pct=${s.dough.oil_pct}`);
        // Note: butter/lard styles store their fat% in oil_pct by design (Chicago=18% butter in oil_pct)
      }
    });
    results.push({ id: "T01-11", name: "Fat type coerente", status: errs.length === 0 ? "pass" : errs.length <= 2 ? "warn" : "fail", detail: errs.length ? errs.join("; ") : "OK", ms });
  }

  // T01-12: Schema version
  {
    const { ms } = timed(() => null);
    results.push({ id: "T01-12", name: "Schema version definita", status: RECIPE_SCHEMA_VERSION ? "pass" : "fail", detail: `v${RECIPE_SCHEMA_VERSION}`, ms });
  }

  return results;
}

/* ═══ T02: GENERATION MATRIX ═══ */
function runGenerationMatrix(): TestResult[] {
  const results: TestResult[] = [];
  const styles = ALL_STYLES();

  // T02-01: Generate all styles with default constraints
  {
    const errs: string[] = [];
    const { ms } = timed(() => {
      for (const s of styles) {
        try {
          const r = generateRecipe(s, makeConstraints());
          if (!r || !r.scores) errs.push(`${s.id}: risultato incompleto`);
        } catch (e: any) {
          errs.push(`${s.id}: ${e.message}`);
        }
      }
    });
    results.push({ id: "T02-01", name: `Generazione base (${styles.length} stili)`, status: errs.length === 0 ? "pass" : "fail", detail: errs.length ? errs.join("; ") : `${styles.length} ricette OK`, ms });
  }

  // T02-02: All oven types × all styles
  {
    let total = 0, errors = 0;
    const failedCombos: string[] = [];
    const { ms } = timed(() => {
      for (const s of styles) {
        for (const oven of OVEN_TYPES) {
          total++;
          try {
            const r = generateRecipe(s, makeConstraints({ oven_type: oven, oven_max_temp_c: oven === "wood" ? 450 : oven === "electric_high" ? 400 : 250 }));
            if (isNaN(r.scores.composite)) { errors++; failedCombos.push(`${s.id}+${oven}`); }
          } catch { errors++; failedCombos.push(`${s.id}+${oven}`); }
        }
      }
    });
    results.push({ id: "T02-02", name: `Matrice forno (${total} combo)`, status: errors === 0 ? "pass" : "fail", detail: errors ? `${errors} errori: ${failedCombos.slice(0, 5).join(", ")}` : `${total} combo OK`, ms });
  }

  // T02-03: All skill levels × all styles
  {
    let total = 0, errors = 0;
    const { ms } = timed(() => {
      for (const s of styles) {
        for (const skill of SKILL_LEVELS) {
          total++;
          try {
            generateRecipe(s, makeConstraints({ skill_level: skill }));
          } catch { errors++; }
        }
      }
    });
    results.push({ id: "T02-03", name: `Matrice skill (${total} combo)`, status: errors === 0 ? "pass" : "fail", detail: errors ? `${errors} errori` : `${total} combo OK`, ms });
  }

  // T02-04: Extreme temp range
  {
    const temps = [150, 180, 200, 250, 300, 350, 400, 450, 500];
    let total = 0, errors = 0;
    const { ms } = timed(() => {
      for (const s of styles) {
        for (const temp of temps) {
          total++;
          try {
            const r = generateRecipe(s, makeConstraints({ oven_max_temp_c: temp }));
            if (isNaN(r.scores.composite) || r.cook_time_sec <= 0) errors++;
          } catch { errors++; }
        }
      }
    });
    results.push({ id: "T02-04", name: `Sweep temp 150-500°C (${total})`, status: errors === 0 ? "pass" : "fail", detail: errors ? `${errors} errori su ${total}` : `${total} combo OK`, ms });
  }

  // T02-05: Various dough ball counts
  {
    const balls = [1, 2, 4, 6, 8, 12];
    let errors = 0;
    const { ms } = timed(() => {
      const s = styles[0];
      for (const n of balls) {
        try {
          const r = generateRecipe(s, makeConstraints({ dough_balls: n }));
          // Flour should scale linearly
          if (n > 1) {
            const r1 = generateRecipe(s, makeConstraints({ dough_balls: 1 }));
            const ratio = r.flour_g / r1.flour_g;
            if (Math.abs(ratio - n) > 0.1) errors++;
          }
        } catch { errors++; }
      }
    });
    results.push({ id: "T02-05", name: "Scaling lineare pallini", status: errors === 0 ? "pass" : "warn", detail: errors ? `${errors} deviazioni` : "Scaling OK", ms });
  }

  // T02-06: All fermentation hours
  {
    const hours = [2, 4, 8, 12, 24, 48, 72];
    let errors = 0;
    const { ms } = timed(() => {
      for (const s of styles) {
        for (const h of hours) {
          try {
            generateRecipe(s, makeConstraints({ available_hours: h }));
          } catch { errors++; }
        }
      }
    });
    results.push({ id: "T02-06", name: `Sweep fermentazione 2-72h (${styles.length * hours.length})`, status: errors === 0 ? "pass" : "fail", detail: errors ? `${errors} errori` : "OK", ms });
  }

  // T02-07: With pantry items
  {
    const flourIds = Object.keys(FLOUR_W_RANGES);
    const yeasts: string[] = ["fresh", "dry", "sourdough"];
    let errors = 0;
    const { ms } = timed(() => {
      for (const s of styles.slice(0, 5)) { // subset per velocità
        try {
          generateRecipe(s, makeConstraints({ pantry_flours: flourIds.slice(0, 3), pantry_yeasts: yeasts }));
        } catch { errors++; }
      }
    });
    results.push({ id: "T02-07", name: "Con pantry (farine + lieviti)", status: errors === 0 ? "pass" : "fail", detail: errors ? `${errors} errori` : "OK", ms });
  }

  // T02-08: Schema version in output
  {
    const errs: string[] = [];
    const { ms } = timed(() => {
      for (const s of styles) {
        const r = generateRecipe(s, makeConstraints());
        if (r.schema_version !== RECIPE_SCHEMA_VERSION) errs.push(`${s.id}: v${r.schema_version}`);
      }
    });
    results.push({ id: "T02-08", name: `Schema version = ${RECIPE_SCHEMA_VERSION}`, status: errs.length === 0 ? "pass" : "fail", detail: errs.length ? errs.join("; ") : "OK", ms });
  }

  // T02-09: Timeline non-empty
  {
    const errs: string[] = [];
    const { ms } = timed(() => {
      for (const s of styles) {
        const r = generateRecipe(s, makeConstraints());
        if (!r.timeline || r.timeline.length === 0) errs.push(s.id);
      }
    });
    results.push({ id: "T02-09", name: "Timeline presente in tutte le ricette", status: errs.length === 0 ? "pass" : "fail", detail: errs.length ? `Mancante in: ${errs.join(", ")}` : `${styles.length} OK`, ms });
  }

  // T02-10: Topping info present (styles with TOPPING_DB)
  {
    const withTopping: string[] = [];
    const { ms } = timed(() => {
      for (const s of styles) {
        const r = generateRecipe(s, makeConstraints());
        if (r.topping_info) withTopping.push(s.id);
      }
    });
    results.push({ id: "T02-10", name: "Topping info nelle ricette", status: withTopping.length > 0 ? "pass" : "warn", detail: `${withTopping.length}/${styles.length} stili con topping info`, ms });
  }

  return results;
}

/* ═══ T03: SCORE BOUNDS & CONSISTENCY ═══ */
function runScoreBounds(): TestResult[] {
  const results: TestResult[] = [];
  const styles = ALL_STYLES();
  const dims = ["authenticity", "feasibility", "digestibility", "sustainability", "experimentation"] as const;

  // T03-01: All scores in [0, 100]
  {
    const errs: string[] = [];
    const { ms } = timed(() => {
      for (const s of styles) {
        const r = generateRecipe(s, makeConstraints());
        for (const d of dims) {
          const v = r.scores[d];
          if (v < 0 || v > 100) errs.push(`${s.id}.${d}=${v}`);
        }
        if (r.scores.composite < 0 || r.scores.composite > 100) errs.push(`${s.id}.composite=${r.scores.composite}`);
      }
    });
    results.push({ id: "T03-01", name: "Score bounds [0, 100]", status: errs.length === 0 ? "pass" : "fail", detail: errs.length ? errs.slice(0, 5).join("; ") : `${styles.length * 6} valori OK`, ms });
  }

  // T03-02: Composite = weighted sum (±1 rounding)
  {
    const errs: string[] = [];
    const { ms } = timed(() => {
      const weights = SCORE_DIMENSIONS.reduce((acc, d) => ({ ...acc, [d.key]: d.weight }), {} as Record<string, number>);
      for (const s of styles) {
        const r = generateRecipe(s, makeConstraints());
        const expected = Math.round(
          dims.reduce((sum, d) => sum + r.scores[d] * (weights[d] || 0), 0)
        );
        if (Math.abs(r.scores.composite - expected) > 1) errs.push(`${s.id}: comp=${r.scores.composite}, expected=${expected}`);
      }
    });
    results.push({ id: "T03-02", name: "Composite = somma pesata (±1)", status: errs.length === 0 ? "pass" : "fail", detail: errs.length ? errs.slice(0, 3).join("; ") : "OK", ms });
  }

  // T03-03: Weights sum to 1.0
  {
    const { ms } = timed(() => null);
    const sum = SCORE_DIMENSIONS.reduce((s, d) => s + d.weight, 0);
    results.push({ id: "T03-03", name: "Pesi dimensioni sommano a 1.0", status: Math.abs(sum - 1.0) < 0.001 ? "pass" : "fail", detail: `Σ = ${sum}`, ms });
  }

  // T03-04: Score categories present
  {
    const errs: string[] = [];
    const { ms } = timed(() => {
      for (const s of styles) {
        const r = generateRecipe(s, makeConstraints());
        for (const d of dims) {
          const cat = r.scores[`${d}_category` as keyof typeof r.scores];
          if (!cat || typeof cat !== "string") errs.push(`${s.id}.${d}_category mancante`);
        }
      }
    });
    results.push({ id: "T03-04", name: "Categorie score definite", status: errs.length === 0 ? "pass" : "fail", detail: errs.length ? errs.slice(0, 3).join("; ") : "OK", ms });
  }

  // T03-05: Score distribution variance (no all-same)
  {
    const { ms } = timed(() => null);
    const composites = styles.map(s => generateRecipe(s, makeConstraints()).scores.composite);
    const min = Math.min(...composites);
    const max = Math.max(...composites);
    const spread = max - min;
    results.push({ id: "T03-05", name: "Distribuzione score (varianza)", status: spread > 5 ? "pass" : "warn", detail: `Range: ${min}-${max} (spread=${spread})`, ms });
  }

  // T03-06: Authenticity monotonicity — closer params → higher score
  {
    const { ms } = timed(() => null);
    const s = styles.find(s => s.id === "napoletana_stg")!;
    const rIdeal = generateRecipe(s, makeConstraints({ oven_type: "wood", oven_max_temp_c: 450 }));
    const rHome = generateRecipe(s, makeConstraints({ oven_type: "home", oven_max_temp_c: 250 }));
    const ok = rIdeal.scores.authenticity >= rHome.scores.authenticity;
    results.push({ id: "T03-06", name: "Autenticità: forno legna > forno casa (STG)", status: ok ? "pass" : "warn", detail: `Legna=${rIdeal.scores.authenticity}, Casa=${rHome.scores.authenticity}`, ms });
  }

  // T03-07: Feasibility increases with higher skill
  {
    let monotonic = true;
    const { ms } = timed(() => {
      const s = styles[0];
      let prev = 0;
      for (const skill of SKILL_LEVELS) {
        const r = generateRecipe(s, makeConstraints({ skill_level: skill }));
        if (r.scores.feasibility < prev - 2) monotonic = false; // allow small tolerance
        prev = r.scores.feasibility;
      }
    });
    results.push({ id: "T03-07", name: "Feasibility monotona con skill↑", status: monotonic ? "pass" : "warn", detail: SKILL_LEVELS.map(sk => {
      const r = generateRecipe(styles[0], makeConstraints({ skill_level: sk }));
      return `sk${sk}→${r.scores.feasibility}`;
    }).join(", "), ms });
  }

  // T03-08: Digestibility correlates with fermentation length
  {
    const { ms } = timed(() => null);
    const s = styles[0];
    const r4 = generateRecipe(s, makeConstraints({ available_hours: 4 }));
    const r48 = generateRecipe(s, makeConstraints({ available_hours: 48 }));
    const ok = r48.scores.digestibility >= r4.scores.digestibility;
    results.push({ id: "T03-08", name: "Digeribilità: 48h ≥ 4h fermentazione", status: ok ? "pass" : "warn", detail: `4h=${r4.scores.digestibility}, 48h=${r48.scores.digestibility}`, ms });
  }

  // T03-09: Penalties & warnings are EngineMsg arrays
  {
    const errs: string[] = [];
    const { ms } = timed(() => {
      for (const s of styles) {
        const r = generateRecipe(s, makeConstraints());
        if (!Array.isArray(r.scores.penalties)) errs.push(`${s.id}: penalties non array`);
        if (!Array.isArray(r.scores.warnings)) errs.push(`${s.id}: warnings non array`);
        if (!Array.isArray(r.scores.claims)) errs.push(`${s.id}: claims non array`);
        // Check EngineMsg format
        for (const p of r.scores.penalties) {
          if (!p.key || !p.fallback) errs.push(`${s.id}: penalty senza key/fallback`);
        }
      }
    });
    results.push({ id: "T03-09", name: "EngineMsg format (penalties/warnings/claims)", status: errs.length === 0 ? "pass" : "fail", detail: errs.length ? errs.slice(0, 3).join("; ") : "OK", ms });
  }

  return results;
}

/* ═══ T04: COMPENSATION ENGINE ═══ */
function runCompensations(): TestResult[] {
  const results: TestResult[] = [];
  const styles = ALL_STYLES();

  // T04-01: No crash for all styles at all temperatures
  {
    const temps = [150, 200, 250, 300, 350, 400, 450, 500];
    let errors = 0;
    const { ms } = timed(() => {
      for (const s of styles) {
        for (const t of temps) {
          try {
            const c = calculateOvenCompensations(s, t);
            if (isNaN(c.cook_time_sec) || c.cook_time_sec <= 0) errors++;
          } catch { errors++; }
        }
      }
    });
    results.push({ id: "T04-01", name: `Compensazioni stabili (${styles.length * temps.length} combo)`, status: errors === 0 ? "pass" : "fail", detail: errors ? `${errors} errori` : "OK", ms });
  }

  // T04-02: No compensation at ideal temp
  {
    const errs: string[] = [];
    const { ms } = timed(() => {
      for (const s of styles) {
        const c = calculateOvenCompensations(s, s.baking.temp_c_ideal);
        if (c.hydration_delta_pct > 0.01) errs.push(`${s.id}: hydration +${c.hydration_delta_pct}% at ideal`);
        if (c.oil_delta_pct > 0.01) errs.push(`${s.id}: oil +${c.oil_delta_pct}% at ideal`);
        if (c.sugar_delta_pct > 0.01) errs.push(`${s.id}: sugar +${c.sugar_delta_pct}% at ideal`);
      }
    });
    results.push({ id: "T04-02", name: "Zero compensazione a temp ideale", status: errs.length === 0 ? "pass" : "warn", detail: errs.length ? errs.slice(0, 3).join("; ") : "OK", ms });
  }

  // T04-03: Cook time increases with lower temp
  {
    const errs: string[] = [];
    const { ms } = timed(() => {
      for (const s of styles) {
        const cHigh = calculateOvenCompensations(s, s.baking.temp_c_ideal);
        const cLow = calculateOvenCompensations(s, Math.max(150, s.baking.temp_c_ideal - 100));
        if (cLow.cook_time_sec < cHigh.cook_time_sec - 1) errs.push(`${s.id}: low=${cLow.cook_time_sec}s < high=${cHigh.cook_time_sec}s`);
      }
    });
    results.push({ id: "T04-03", name: "Cook time monotono (temp↓ → tempo↑)", status: errs.length === 0 ? "pass" : "fail", detail: errs.length ? errs.slice(0, 3).join("; ") : "OK", ms });
  }

  // T04-04: Hydration delta logarithmic (shouldn't exceed ~8% even at huge deficit)
  {
    const errs: string[] = [];
    const { ms } = timed(() => {
      for (const s of styles) {
        const c = calculateOvenCompensations(s, 150);
        if (c.hydration_delta_pct > 15) errs.push(`${s.id}: +${c.hydration_delta_pct}% — troppo alto`);
      }
    });
    results.push({ id: "T04-04", name: "Hydration delta bounded (log model)", status: errs.length === 0 ? "pass" : "warn", detail: errs.length ? errs.join("; ") : "OK", ms });
  }

  // T04-05: Compensation log tracked in science
  {
    const { ms } = timed(() => null);
    const s = styles[0];
    const r = generateRecipe(s, makeConstraints({ oven_max_temp_c: 180 }));
    const hasComps = r.science.compensations.length > 0;
    results.push({ id: "T04-05", name: "Compensazioni tracciate in science.compensations", status: hasComps ? "pass" : "warn", detail: `${r.science.compensations.length} compensazioni a 180°C`, ms });
  }

  // T04-06: Thickness factor between 0.5 and 1.0
  {
    const errs: string[] = [];
    const { ms } = timed(() => {
      for (const s of styles) {
        const c = calculateOvenCompensations(s, 150);
        if (c.thickness_factor < 0.5 || c.thickness_factor > 1.0) errs.push(`${s.id}: thickness=${c.thickness_factor}`);
      }
    });
    results.push({ id: "T04-06", name: "Thickness factor in [0.5, 1.0]", status: errs.length === 0 ? "pass" : "warn", detail: errs.length ? errs.join("; ") : "OK", ms });
  }

  return results;
}

/* ═══ T05: Q10 MODELS ═══ */
function runQ10(): TestResult[] {
  const results: TestResult[] = [];
  const yeasts = ["fresh", "dry", "sourdough"] as const;
  const temps = [2, 4, 8, 10, 12, 15, 18, 22, 25, 30];

  // T05-01: No crash across all combos
  {
    let errors = 0;
    const { ms } = timed(() => {
      for (const y of yeasts) {
        for (const t of temps) {
          try {
            const r = getQ10(y, t);
            if (isNaN(r.q10) || r.q10 <= 0) errors++;
          } catch { errors++; }
        }
      }
    });
    results.push({ id: "T05-01", name: `Q10 stabile (${yeasts.length * temps.length} combo)`, status: errors === 0 ? "pass" : "fail", detail: errors ? `${errors} errori` : "OK", ms });
  }

  // T05-02: Cold-adapted model below 10°C for commercial
  {
    const { ms } = timed(() => null);
    const r4 = getQ10("fresh", 4);
    const r15 = getQ10("fresh", 15);
    results.push({ id: "T05-02", name: "Cold-adapted Q10 < standard Q10", status: r4.q10 < r15.q10 ? "pass" : "fail", detail: `4°C: Q10=${r4.q10} (${r4.model}), 15°C: Q10=${r15.q10} (${r15.model})`, ms });
  }

  // T05-03: Sourdough has distinct Q10
  {
    const { ms } = timed(() => null);
    const rSd = getQ10("sourdough", 22);
    const rFr = getQ10("fresh", 22);
    results.push({ id: "T05-03", name: "Sourdough Q10 ≠ commercial Q10", status: rSd.q10 !== rFr.q10 ? "pass" : "warn", detail: `Madre=${rSd.q10}, Fresco=${rFr.q10}`, ms });
  }

  // T05-04: Q10 values in realistic range [1.0, 4.0]
  {
    const errs: string[] = [];
    const { ms } = timed(() => {
      for (const y of yeasts) {
        for (const t of temps) {
          const { q10 } = getQ10(y, t);
          if (q10 < 1.0 || q10 > 4.0) errs.push(`${y}@${t}°C: Q10=${q10}`);
        }
      }
    });
    results.push({ id: "T05-04", name: "Q10 in range biochimico [1.0, 4.0]", status: errs.length === 0 ? "pass" : "fail", detail: errs.length ? errs.join("; ") : "OK", ms });
  }

  // T05-05: Model name always present
  {
    const errs: string[] = [];
    const { ms } = timed(() => {
      for (const y of yeasts) {
        for (const t of temps) {
          const { model } = getQ10(y, t);
          if (!model) errs.push(`${y}@${t}°C: model vuoto`);
        }
      }
    });
    results.push({ id: "T05-05", name: "Model name sempre presente", status: errs.length === 0 ? "pass" : "fail", detail: errs.length ? errs.join("; ") : "OK", ms });
  }

  return results;
}

/* ═══ T06: P/L ESTIMATION ═══ */
function runPLEstimation(): TestResult[] {
  const results: TestResult[] = [];
  const styles = ALL_STYLES();

  // T06-01: estimatePL returns values in [0.1, 2.0]
  {
    const wValues = [150, 200, 250, 280, 300, 350, 400];
    const errs: string[] = [];
    const { ms } = timed(() => {
      for (const w of wValues) {
        const pl = estimatePL(w, [0.3, 1.0]);
        if (pl < 0.1 || pl > 2.0) errs.push(`W=${w}: P/L=${pl}`);
      }
    });
    results.push({ id: "T06-01", name: "P/L stimato in range [0.1, 2.0]", status: errs.length === 0 ? "pass" : "fail", detail: errs.length ? errs.join("; ") : "OK", ms });
  }

  // T06-02: P/L clamped to style range
  {
    const errs: string[] = [];
    const { ms } = timed(() => {
      for (const s of styles) {
        const pl = estimatePL(280, s.dough.flour_pl_range);
        const [lo, hi] = s.dough.flour_pl_range;
        if (pl < lo - 0.01 || pl > hi + 0.01) errs.push(`${s.id}: P/L=${pl} fuori [${lo},${hi}]`);
      }
    });
    results.push({ id: "T06-02", name: "P/L clampato nel range stile", status: errs.length === 0 ? "pass" : "fail", detail: errs.length ? errs.join("; ") : "OK", ms });
  }

  // T06-03: P/L increases with W (monotonic)
  {
    const { ms } = timed(() => null);
    const pls = [150, 200, 250, 300, 350].map(w => estimatePL(w, [0.2, 1.5]));
    let monotonic = true;
    for (let i = 1; i < pls.length; i++) {
      if (pls[i] < pls[i - 1] - 0.01) monotonic = false;
    }
    results.push({ id: "T06-03", name: "P/L monotono con W↑", status: monotonic ? "pass" : "warn", detail: pls.map((p, i) => `W${[150, 200, 250, 300, 350][i]}→${p}`).join(", "), ms });
  }

  // T06-04: P/L stored in science layer
  {
    const errs: string[] = [];
    const { ms } = timed(() => {
      for (const s of styles) {
        const r = generateRecipe(s, makeConstraints());
        if (typeof r.science.flour_pl_estimated !== "number" || isNaN(r.science.flour_pl_estimated)) errs.push(s.id);
      }
    });
    results.push({ id: "T06-04", name: "flour_pl_estimated in science layer", status: errs.length === 0 ? "pass" : "fail", detail: errs.length ? `Mancante in: ${errs.join(", ")}` : "OK", ms });
  }

  return results;
}

/* ═══ T07: RULE 55 WATER TEMP ═══ */
function runRule55(): TestResult[] {
  const results: TestResult[] = [];
  const styles = ALL_STYLES();

  // T07-01: Water temp defined or null in all recipes
  {
    const errs: string[] = [];
    const { ms } = timed(() => {
      for (const s of styles) {
        const r = generateRecipe(s, makeConstraints({ kitchen_temp_c: 22 }));
        if (r.water_temp_c !== null && (isNaN(r.water_temp_c) || r.water_temp_c < 0 || r.water_temp_c > 50)) {
          errs.push(`${s.id}: water_temp=${r.water_temp_c}°C`);
        }
      }
    });
    results.push({ id: "T07-01", name: "Water temp valida o null", status: errs.length === 0 ? "pass" : "fail", detail: errs.length ? errs.join("; ") : "OK", ms });
  }

  // T07-02: Science layer has Rule 55 fields
  {
    const errs: string[] = [];
    const { ms } = timed(() => {
      for (const s of styles) {
        const r = generateRecipe(s, makeConstraints({ kitchen_temp_c: 22 }));
        if (typeof r.science.desired_dough_temp_c !== "number") errs.push(`${s.id}: desired_dough_temp_c mancante`);
        if (typeof r.science.friction_factor !== "number") errs.push(`${s.id}: friction_factor mancante`);
      }
    });
    results.push({ id: "T07-02", name: "Campi Rule 55 in science layer", status: errs.length === 0 ? "pass" : "fail", detail: errs.length ? errs.slice(0, 3).join("; ") : "OK", ms });
  }

  // T07-03: Higher kitchen temp → lower water temp
  {
    const { ms } = timed(() => null);
    const s = styles[0];
    const rCold = generateRecipe(s, makeConstraints({ kitchen_temp_c: 15 }));
    const rHot = generateRecipe(s, makeConstraints({ kitchen_temp_c: 30 }));
    const coldW = rCold.water_temp_c;
    const hotW = rHot.water_temp_c;
    const ok = (coldW === null || hotW === null) || coldW >= hotW;
    results.push({ id: "T07-03", name: "Acqua più fredda con cucina più calda", status: ok ? "pass" : "warn", detail: `Cucina 15°C→acqua ${coldW}°C, Cucina 30°C→acqua ${hotW}°C`, ms });
  }

  return results;
}

/* ═══ T08: RECOMMENDATION ENGINE ═══ */
function runRecommendation(): TestResult[] {
  const results: TestResult[] = [];

  // T08-01: Returns recommendations for default constraints
  {
    const { ms } = timed(() => null);
    const recs = recommendStyles(makeConstraints());
    results.push({ id: "T08-01", name: "Raccomandazioni base non vuote", status: recs.length > 0 ? "pass" : "fail", detail: `${recs.length} stili raccomandati`, ms });
  }

  // T08-02: All styles appear in recommendations
  {
    const { ms } = timed(() => null);
    const recs = recommendStyles(makeConstraints());
    const recIds = new Set(recs.map((r: any) => r.style.id));
    const missing = STYLE_IDS().filter(id => !recIds.has(id));
    results.push({ id: "T08-02", name: "Tutti gli stili raccomandati", status: missing.length === 0 ? "pass" : "warn", detail: missing.length ? `Mancanti: ${missing.join(", ")}` : `${recs.length}/${STYLE_IDS().length}`, ms });
  }

  // T08-03: Tiers are valid (perfect/good/challenging)
  {
    const { ms } = timed(() => null);
    const recs = recommendStyles(makeConstraints());
    const validTiers = ["perfect", "good", "challenging"];
    const invalid = recs.filter((r: any) => !validTiers.includes(r.tier));
    const tiers = recs.reduce((acc: any, r: any) => { acc[r.tier] = (acc[r.tier] || 0) + 1; return acc; }, {});
    results.push({ id: "T08-03", name: "Tier validi (perfect/good/challenging)", status: invalid.length === 0 ? "pass" : "fail", detail: `Perfect:${tiers.perfect || 0}, Good:${tiers.good || 0}, Challenging:${tiers.challenging || 0}`, ms });
  }

  // T08-04: Sorted descending by score
  {
    const { ms } = timed(() => null);
    const recs = recommendStyles(makeConstraints());
    let sorted = true;
    for (let i = 1; i < recs.length; i++) {
      if ((recs[i] as any).compatibilityScore > (recs[i - 1] as any).compatibilityScore + 0.1) { sorted = false; break; }
    }
    results.push({ id: "T08-04", name: "Raccomandazioni ordinate per score↓", status: sorted ? "pass" : "warn", detail: `Top 3: ${recs.slice(0, 3).map((r: any) => `${r.style.id}(${r.compatibilityScore})`).join(", ")}`, ms });
  }

  // T08-05: Wood oven boosts napoletana_stg
  {
    const { ms } = timed(() => null);
    const recsWood = recommendStyles(makeConstraints({ oven_type: "wood", oven_max_temp_c: 450 }));
    const recsHome = recommendStyles(makeConstraints({ oven_type: "home", oven_max_temp_c: 250 }));
    const stgWood = recsWood.find((r: any) => r.style.id === "napoletana_stg");
    const stgHome = recsHome.find((r: any) => r.style.id === "napoletana_stg");
    const ok = stgWood && stgHome && (stgWood as any).compatibilityScore >= (stgHome as any).compatibilityScore;
    results.push({ id: "T08-05", name: "STG score↑ con forno legna", status: ok ? "pass" : "warn", detail: `Legna=${(stgWood as any)?.compatibilityScore ?? "?"}, Casa=${(stgHome as any)?.compatibilityScore ?? "?"}`, ms });
  }

  // T08-06: Short time penalizes long-ferment styles
  {
    const { ms } = timed(() => null);
    const recsShort = recommendStyles(makeConstraints({ available_hours: 4 }));
    const recsLong = recommendStyles(makeConstraints({ available_hours: 48 }));
    const bonciShort = recsShort.find((r: any) => r.style.id === "bonci_teglia");
    const bonciLong = recsLong.find((r: any) => r.style.id === "bonci_teglia");
    const ok = bonciShort && bonciLong && (bonciLong as any).compatibilityScore >= (bonciShort as any).compatibilityScore;
    results.push({ id: "T08-06", name: "Bonci penalizzato con sole 4h", status: ok ? "pass" : "warn", detail: `4h=${(bonciShort as any)?.compatibilityScore ?? "?"}, 48h=${(bonciLong as any)?.compatibilityScore ?? "?"}`, ms });
  }

  // T08-07: Reasons and warnings are EngineMsg arrays
  {
    const { ms } = timed(() => null);
    const recs = recommendStyles(makeConstraints());
    const errs: string[] = [];
    for (const r of recs as any[]) {
      if (!Array.isArray(r.reasons)) errs.push(`${r.style.id}: reasons non array`);
      if (!Array.isArray(r.warnings)) errs.push(`${r.style.id}: warnings non array`);
    }
    results.push({ id: "T08-07", name: "Reasons/warnings formato EngineMsg", status: errs.length === 0 ? "pass" : "fail", detail: errs.length ? errs.slice(0, 3).join("; ") : "OK", ms });
  }

  return results;
}

/* ═══ T09: EDGE CASES ═══ */
function runEdgeCases(): TestResult[] {
  const results: TestResult[] = [];
  const s = ALL_STYLES()[0];

  // T09-01: 1 dough ball
  {
    let ok = true;
    const { ms } = timed(() => {
      try { generateRecipe(s, makeConstraints({ dough_balls: 1 })); } catch { ok = false; }
    });
    results.push({ id: "T09-01", name: "1 pallina", status: ok ? "pass" : "fail", detail: ok ? "OK" : "Crash", ms });
  }

  // T09-02: Very low temp (150°C)
  {
    let ok = true;
    const { ms } = timed(() => {
      try {
        const r = generateRecipe(s, makeConstraints({ oven_max_temp_c: 150 }));
        if (r.cook_time_sec <= 0 || isNaN(r.cook_time_sec)) ok = false;
      } catch { ok = false; }
    });
    results.push({ id: "T09-02", name: "Forno 150°C (minimo)", status: ok ? "pass" : "fail", detail: ok ? "OK" : "Crash/invalido", ms });
  }

  // T09-03: Very high temp (500°C)
  {
    let ok = true;
    const { ms } = timed(() => {
      try { generateRecipe(s, makeConstraints({ oven_max_temp_c: 500 })); } catch { ok = false; }
    });
    results.push({ id: "T09-03", name: "Forno 500°C (massimo)", status: ok ? "pass" : "fail", detail: ok ? "OK" : "Crash", ms });
  }

  // T09-04: Empty pantry
  {
    let ok = true;
    const { ms } = timed(() => {
      try { generateRecipe(s, makeConstraints({ pantry_flours: [], pantry_yeasts: [] })); } catch { ok = false; }
    });
    results.push({ id: "T09-04", name: "Dispensa vuota", status: ok ? "pass" : "fail", detail: ok ? "OK" : "Crash", ms });
  }

  // T09-05: Only sourdough
  {
    let ok = true;
    const { ms } = timed(() => {
      try { generateRecipe(s, makeConstraints({ pantry_yeasts: ["sourdough"] })); } catch { ok = false; }
    });
    results.push({ id: "T09-05", name: "Solo lievito madre", status: ok ? "pass" : "fail", detail: ok ? "OK" : "Crash", ms });
  }

  // T09-06: Skill 1 with complex style
  {
    let ok = true;
    const { ms } = timed(() => {
      const complex = ALL_STYLES().find(st => !st.suitable_for_beginner);
      if (complex) {
        try { generateRecipe(complex, makeConstraints({ skill_level: 1 })); } catch { ok = false; }
      }
    });
    results.push({ id: "T09-06", name: "Skill 1 + stile complesso", status: ok ? "pass" : "fail", detail: ok ? "OK" : "Crash", ms });
  }

  // T09-07: Very short fermentation (2h)
  {
    let ok = true;
    const { ms } = timed(() => {
      try { generateRecipe(s, makeConstraints({ available_hours: 2 })); } catch { ok = false; }
    });
    results.push({ id: "T09-07", name: "Fermentazione 2h (minimo)", status: ok ? "pass" : "fail", detail: ok ? "OK" : "Crash", ms });
  }

  // T09-08: Very long fermentation (96h)
  {
    let ok = true;
    const { ms } = timed(() => {
      try { generateRecipe(s, makeConstraints({ available_hours: 96 })); } catch { ok = false; }
    });
    results.push({ id: "T09-08", name: "Fermentazione 96h (estremo)", status: ok ? "pass" : "fail", detail: ok ? "OK" : "Crash", ms });
  }

  // T09-09: Kitchen temp extremes
  {
    const errs: string[] = [];
    const { ms } = timed(() => {
      for (const t of [5, 10, 35, 40]) {
        try { generateRecipe(s, makeConstraints({ kitchen_temp_c: t })); }
        catch { errs.push(`${t}°C`); }
      }
    });
    results.push({ id: "T09-09", name: "Temp cucina estrema (5-40°C)", status: errs.length === 0 ? "pass" : "fail", detail: errs.length ? `Crash a: ${errs.join(", ")}` : "OK", ms });
  }

  // T09-10: All equipment combos
  {
    let ok = true;
    const { ms } = timed(() => {
      try {
        generateRecipe(s, makeConstraints({ has_mixer: true, has_pizza_stone: true, has_pizza_steel: true, has_baking_pan: true }));
        generateRecipe(s, makeConstraints({ has_mixer: false, has_pizza_stone: false, has_pizza_steel: false, has_baking_pan: false }));
      } catch { ok = false; }
    });
    results.push({ id: "T09-10", name: "Equipment on/off", status: ok ? "pass" : "fail", detail: ok ? "OK" : "Crash", ms });
  }

  // T09-11: All dietary filters at once
  {
    let ok = true;
    const { ms } = timed(() => {
      try { recommendStyles(makeConstraints({ dietary_filters: ["vegan", "lactose_free", "low_fodmap", "low_histamine", "gluten_sensitive", "low_salt"] })); } catch { ok = false; }
    });
    results.push({ id: "T09-11", name: "Tutti i filtri dietetici", status: ok ? "pass" : "fail", detail: ok ? "OK" : "Crash", ms });
  }

  return results;
}

/* ═══ T10: CROSS-VALIDATION ═══ */
function runCrossValidation(): TestResult[] {
  const results: TestResult[] = [];
  const styles = ALL_STYLES();

  // T10-01: Ingredient mass balance (flour + water + salt + fat + sugar + yeast ≈ total_dough)
  {
    const errs: string[] = [];
    const { ms } = timed(() => {
      for (const s of styles) {
        const r = generateRecipe(s, makeConstraints());
        const componentSum = r.flour_g + r.water_g + r.salt_g + (r.fat_g || r.oil_g || 0) + r.sugar_g + r.yeast_g;
        const diff = Math.abs(componentSum - r.total_dough_g);
        const pct = (diff / r.total_dough_g) * 100;
        if (pct > 2) errs.push(`${s.id}: Σ=${Math.round(componentSum)}g vs total=${r.total_dough_g}g (${pct.toFixed(1)}%)`);
      }
    });
    results.push({ id: "T10-01", name: "Bilancio massa ingredienti (±2%)", status: errs.length === 0 ? "pass" : "warn", detail: errs.length ? errs.slice(0, 3).join("; ") : `${styles.length} OK`, ms });
  }

  // T10-02: ball_weight × dough_balls ≈ total_dough
  {
    const errs: string[] = [];
    const { ms } = timed(() => {
      for (const s of styles) {
        const r = generateRecipe(s, makeConstraints());
        const expected = r.ball_weight_g * r.dough_balls;
        const diff = Math.abs(expected - r.total_dough_g);
        if (diff > 5) errs.push(`${s.id}: ${r.ball_weight_g}g × ${r.dough_balls} = ${expected}g ≠ ${r.total_dough_g}g`);
      }
    });
    results.push({ id: "T10-02", name: "ball_weight × balls ≈ total_dough", status: errs.length === 0 ? "pass" : "warn", detail: errs.length ? errs.slice(0, 3).join("; ") : "OK", ms });
  }

  // T10-03: hydration_pct ≈ water_g / flour_g * 100
  {
    const errs: string[] = [];
    const { ms } = timed(() => {
      for (const s of styles) {
        const r = generateRecipe(s, makeConstraints());
        const calcH = (r.water_g / r.flour_g) * 100;
        if (Math.abs(calcH - r.hydration_pct) > 2) errs.push(`${s.id}: calc=${calcH.toFixed(1)}% vs reported=${r.hydration_pct}%`);
      }
    });
    results.push({ id: "T10-03", name: "Hydration % consistente", status: errs.length === 0 ? "pass" : "warn", detail: errs.length ? errs.slice(0, 3).join("; ") : "OK", ms });
  }

  // T10-04: Effective hours 18°C ≠ 0
  {
    const errs: string[] = [];
    const { ms } = timed(() => {
      for (const s of styles) {
        const r = generateRecipe(s, makeConstraints());
        if (r.science.effective_hours_18c <= 0) errs.push(`${s.id}: ${r.science.effective_hours_18c}h`);
      }
    });
    results.push({ id: "T10-04", name: "Effective hours 18°C > 0", status: errs.length === 0 ? "pass" : "fail", detail: errs.length ? errs.join("; ") : "OK", ms });
  }

  // T10-05: Baking energy > 0
  {
    const errs: string[] = [];
    const { ms } = timed(() => {
      for (const s of styles) {
        const r = generateRecipe(s, makeConstraints());
        if (r.science.baking_energy_kj <= 0) errs.push(`${s.id}: ${r.science.baking_energy_kj}kJ`);
      }
    });
    results.push({ id: "T10-05", name: "Baking energy > 0 kJ", status: errs.length === 0 ? "pass" : "fail", detail: errs.length ? errs.join("; ") : "OK", ms });
  }

  // T10-06: Deviation scores in [0, 1]
  {
    const errs: string[] = [];
    const { ms } = timed(() => {
      for (const s of styles) {
        const r = generateRecipe(s, makeConstraints());
        if (r.science.deviation_score_intrinsic < 0 || r.science.deviation_score_intrinsic > 1) errs.push(`${s.id}: intrinsic=${r.science.deviation_score_intrinsic}`);
        if (r.science.deviation_score_effective < 0 || r.science.deviation_score_effective > 1) errs.push(`${s.id}: effective=${r.science.deviation_score_effective}`);
      }
    });
    results.push({ id: "T10-06", name: "Deviation scores in [0, 1]", status: errs.length === 0 ? "pass" : "fail", detail: errs.length ? errs.join("; ") : "OK", ms });
  }

  // T10-07: Gluten network & water activity in valid ranges
  {
    const errs: string[] = [];
    const { ms } = timed(() => {
      for (const s of styles) {
        const r = generateRecipe(s, makeConstraints());
        if (r.science.gluten_network < 0 || r.science.gluten_network > 100) errs.push(`${s.id}: gluten=${r.science.gluten_network}`);
        if (r.science.water_activity < 0.9 || r.science.water_activity > 1.0) errs.push(`${s.id}: aw=${r.science.water_activity}`);
      }
    });
    results.push({ id: "T10-07", name: "Gluten [0,100] & aw [0.9,1.0]", status: errs.length === 0 ? "pass" : "warn", detail: errs.length ? errs.slice(0, 3).join("; ") : "OK", ms });
  }

  return results;
}

/* ═══ T11: PARAMETRIC DB COVERAGE ═══ */
function runParametricDb(): TestResult[] {
  const results: TestResult[] = [];
  const ids = STYLE_IDS();

  const dbs: { name: string; getter: (id: string) => any }[] = [
    { name: "OvenTemp", getter: getOvenTempByStyle },
    { name: "BakingTime", getter: getBakingTimeByStyle },
    { name: "DoughBase", getter: getDoughBaseByStyle },
    { name: "Salt", getter: getSaltByStyle },
    { name: "Water", getter: getWaterByStyle },
    { name: "Maturation", getter: getMaturationByStyle },
    { name: "Topping", getter: getToppingByStyle },
    { name: "Folding", getter: getFoldingByStyle },
    { name: "Scoring", getter: getScoringByStyle },
    { name: "Equipment", getter: getEquipmentByStyle },
  ];

  for (const db of dbs) {
    const missing: string[] = [];
    const { ms } = timed(() => {
      for (const id of ids) {
        if (!db.getter(id)) missing.push(id);
      }
    });
    results.push({
      id: `T11-${db.name}`,
      name: `${db.name} DB copertura`,
      status: missing.length === 0 ? "pass" : missing.length <= 3 ? "warn" : "fail",
      detail: missing.length ? `Mancanti (${missing.length}): ${missing.slice(0, 5).join(", ")}` : `${ids.length}/${ids.length}`,
      ms,
    });
  }

  return results;
}

/* ═══ T12: DEVIATION & FLOUR ═══ */
function runDeviationFlour(): TestResult[] {
  const results: TestResult[] = [];
  const ids = STYLE_IDS();

  // T12-01: Style deviations for all styles
  {
    const missing: string[] = [];
    const { ms } = timed(() => {
      for (const id of ids) {
        const d = getStyleDeviation(id);
        if (!d || !d.category) missing.push(id);
      }
    });
    results.push({ id: "T12-01", name: "Deviation signatures complete", status: missing.length === 0 ? "pass" : "warn", detail: missing.length ? `Mancanti: ${missing.join(", ")}` : `${ids.length}/${ids.length}`, ms });
  }

  // T12-02: Interpretazioni presenti (ex Author variants, ora migrate)
  {
    const { ms } = timed(() => null);
    const count = getAllInterpretations().length;
    results.push({ id: "T12-02", name: "Interpretazioni presenti", status: count >= 12 ? "pass" : count >= 8 ? "warn" : "fail", detail: `${count} interpretazioni`, ms });
  }

  // T12-03: getInterpretationsForStyle non crasha
  {
    let errors = 0;
    const { ms } = timed(() => {
      for (const id of ids) {
        try { getInterpretationsForStyle(id); } catch { errors++; }
      }
    });
    results.push({ id: "T12-03", name: "getInterpretationsForStyle() stabile", status: errors === 0 ? "pass" : "fail", detail: errors ? `${errors} errori` : "OK", ms });
  }

  // T12-04: Flour DB count
  {
    const { ms } = timed(() => null);
    results.push({ id: "T12-04", name: "Farine nel database ≥ 25", status: FLOURS_DB.length >= 25 ? "pass" : "warn", detail: `${FLOURS_DB.length} farine`, ms });
  }

  // T12-05: Effective W range for all flours
  {
    const errs: string[] = [];
    const { ms } = timed(() => {
      for (const f of FLOURS_DB) {
        try {
          const [lo, hi] = getEffectiveWRange(f);
          // W=0 is valid for gluten-free flours (riso, mais, mix_gluten_free)
          if (lo >= hi && f.w > 0) errs.push(`${f.id}: [${lo},${hi}]`);
        } catch (e: any) { errs.push(`${f.id}: ${e.message}`); }
      }
    });
    results.push({ id: "T12-05", name: "Effective W range valido per tutte le farine", status: errs.length === 0 ? "pass" : "warn", detail: errs.length ? errs.slice(0, 3).join("; ") : "OK", ms });
  }

  // T12-06: Compatible flours for all styles
  {
    const errs: string[] = [];
    const { ms } = timed(() => {
      for (const id of ids) {
        try {
          const flours = getCompatibleFlours(id);
          if (flours.length === 0) errs.push(id);
        } catch { errs.push(id); }
      }
    });
    results.push({ id: "T12-06", name: "Farine compatibili per ogni stile", status: errs.length === 0 ? "pass" : "warn", detail: errs.length ? `Nessuna per: ${errs.join(", ")}` : `${ids.length} stili OK`, ms });
  }

  return results;
}

/* ═══ CATEGORY DEFINITIONS ═══ */
/* ═══ T13: OPTIMIZER — "genera la pizza perfetta" (Audit role-play giugno 2026) ═══ */
function runOptimizer(): TestResult[] {
  const results: TestResult[] = [];
  const styles = ALL_STYLES();

  // T13-01: optimizeRecipe produce una ricetta valida per ogni stile
  {
    const errs: string[] = [];
    const { ms } = timed(() => {
      for (const s of styles) {
        try {
          const o = optimizeRecipe(s, makeConstraints());
          if (!o.recipe || o.evaluated < 1) errs.push(`${s.id}: vuoto`);
          if (o.objective_score < 0 || o.objective_score > 100) errs.push(`${s.id}: obj=${o.objective_score}`);
        } catch (e) {
          errs.push(`${s.id}: throw ${(e as Error).message}`);
        }
      }
    });
    results.push({ id: "T13-01", name: `Optimizer valido (${styles.length} stili)`, status: errs.length === 0 ? "pass" : "fail", detail: errs.length ? errs.slice(0, 3).join("; ") : `${styles.length} ottimizzazioni OK`, ms });
  }

  // T13-02: l'ottimo non è mai PEGGIO del default midpoint (composite)
  {
    const errs: string[] = [];
    const { ms } = timed(() => {
      const c = makeConstraints({ oven_max_temp_c: 300, skill_level: 3, available_hours: 72 });
      for (const s of styles) {
        const def = generateRecipe(s, c);
        const opt = optimizeRecipe(s, c);
        if (opt.recipe.scores.composite < def.scores.composite - 1) {
          errs.push(`${s.id}: opt=${opt.recipe.scores.composite} < def=${def.scores.composite}`);
        }
      }
    });
    results.push({ id: "T13-02", name: "Ottimo ≥ default midpoint (composite)", status: errs.length === 0 ? "pass" : "warn", detail: errs.length ? errs.slice(0, 3).join("; ") : "Ottimo sempre ≥ default", ms });
  }

  // T13-03: rispetta le ore disponibili (fermentazione ≤ available_hours)
  {
    const errs: string[] = [];
    const { ms } = timed(() => {
      const c = makeConstraints({ available_hours: 10 });
      for (const s of styles) {
        const o = optimizeRecipe(s, c);
        if (o.recipe.fermentation_hours > 10.01) errs.push(`${s.id}: ${o.recipe.fermentation_hours}h > 10h`);
      }
    });
    results.push({ id: "T13-03", name: "Rispetta ore disponibili (≤10h)", status: errs.length === 0 ? "pass" : "fail", detail: errs.length ? errs.slice(0, 3).join("; ") : "Tutti ≤ 10h", ms });
  }

  // T13-04: rispetta il tetto d'idratazione per principiante (skill 1 → ≤68%)
  {
    const errs: string[] = [];
    const { ms } = timed(() => {
      const c = makeConstraints({ skill_level: 1 });
      for (const s of styles) {
        const o = optimizeRecipe(s, c);
        if (o.recipe.hydration_pct > 68) errs.push(`${s.id}: H=${o.recipe.hydration_pct}% > 68%`);
      }
    });
    results.push({ id: "T13-04", name: "Tetto idratazione principiante (≤68%)", status: errs.length === 0 ? "pass" : "fail", detail: errs.length ? errs.slice(0, 3).join("; ") : "Principiante mai oltre 68%", ms });
  }

  // T13-05: alternative ordinate desc, distinte dalla scelta
  {
    const errs: string[] = [];
    const { ms } = timed(() => {
      for (const s of styles) {
        const o = optimizeRecipe(s, makeConstraints());
        if (o.alternatives.length > 3) errs.push(`${s.id}: ${o.alternatives.length} alt`);
        for (let i = 1; i < o.alternatives.length; i++) {
          if (o.alternatives[i].objective_score > o.alternatives[i - 1].objective_score + 0.01) {
            errs.push(`${s.id}: alt non ordinate`);
            break;
          }
        }
        if (o.alternatives.some((a) => a.objective_score > o.objective_score + 0.01)) {
          errs.push(`${s.id}: alt batte la scelta`);
        }
      }
    });
    results.push({ id: "T13-05", name: "Alternative ordinate e coerenti", status: errs.length === 0 ? "pass" : "fail", detail: errs.length ? errs.slice(0, 3).join("; ") : "OK", ms });
  }

  // T13-06: rationale non vuota
  {
    const errs: string[] = [];
    const { ms } = timed(() => {
      for (const s of styles) {
        const o = optimizeRecipe(s, makeConstraints());
        if (o.rationale.length === 0) errs.push(s.id);
      }
    });
    results.push({ id: "T13-06", name: "Rationale presente", status: errs.length === 0 ? "pass" : "warn", detail: errs.length ? `Vuota: ${errs.slice(0, 5).join(", ")}` : "OK", ms });
  }

  // T13-07: F4 — default temp fermentazione style-aware (regressione)
  {
    const stg = STYLES_DB["napoletana_stg"];
    const teglia = STYLES_DB["teglia_romana"];
    const okStgLong = defaultFermentTempC(stg, 24) === 22; // diretto a TA anche a 24h
    const okStgShort = defaultFermentTempC(stg, 8) === 22;
    const okTegliaLong = defaultFermentTempC(teglia, 24) === 4; // frigo per lungo
    const { ms } = timed(() => null);
    const ok = okStgLong && okStgShort && okTegliaLong;
    results.push({ id: "T13-07", name: "F4: temp fermentazione style-aware", status: ok ? "pass" : "fail", detail: `STG@24h=${defaultFermentTempC(stg, 24)}°C (att.22), STG@8h=${defaultFermentTempC(stg, 8)}°C, Teglia@24h=${defaultFermentTempC(teglia, 24)}°C (att.4)`, ms });
  }

  // T13-08: F1 — composite include sustainability/experimentation se pesati (regressione)
  {
    const { ms } = timed(() => null);
    const s = STYLES_DB["teglia_romana"];
    const w = { authenticity: 0.3, feasibility: 0.3, digestibility: 0.2, sustainability: 0.2, experimentation: 0.0 };
    const r = generateRecipe(s, makeConstraints(), undefined, undefined, undefined, undefined, undefined, undefined, undefined, w);
    const expected = Math.round(
      (r.scores.authenticity * 0.3 + r.scores.feasibility * 0.3 + r.scores.digestibility * 0.2 + r.scores.sustainability * 0.2) / 1.0,
    );
    // Il bug F1 avrebbe ignorato il peso sustainability → composite diverso (e ≠ scala 0-100).
    const bugValue = Math.round(r.scores.authenticity * 0.3 + r.scores.feasibility * 0.3 + r.scores.digestibility * 0.2);
    const ok = Math.abs(r.scores.composite - expected) <= 1 && r.scores.composite !== bugValue;
    results.push({ id: "T13-08", name: "F1: composite a 5 pesi normalizzato", status: ok ? "pass" : "fail", detail: `composite=${r.scores.composite}, atteso=${expected}, bug-sarebbe=${bugValue}`, ms });
  }

  return results;
}

function buildCategories(): TestCategory[] {
  return [
    { id: "db", label: "DB Integrity", icon: <Database size={14} />, color: "var(--primary)", run: runDbIntegrity },
    { id: "gen", label: "Generation Matrix", icon: <Zap size={14} />, color: "var(--cta)", run: runGenerationMatrix },
    { id: "score", label: "Score Bounds", icon: <BarChart3 size={14} />, color: "var(--tertiary)", run: runScoreBounds },
    { id: "comp", label: "Compensazioni", icon: <Thermometer size={14} />, color: "var(--axis-feasibility)", run: runCompensations },
    { id: "q10", label: "Q10 Models", icon: <FlaskConical size={14} />, color: "var(--axis-digestibility)", run: runQ10 },
    { id: "pl", label: "P/L Estimation", icon: <Wheat size={14} />, color: "var(--warm-olive)", run: runPLEstimation },
    { id: "r55", label: "Rule 55", icon: <Droplets size={14} />, color: "var(--time-tonight)", run: runRule55 },
    { id: "rec", label: "Recommendation", icon: <TrendingUp size={14} />, color: "var(--axis-experimentation)", run: runRecommendation },
    { id: "edge", label: "Edge Cases", icon: <Shield size={14} />, color: "var(--axis-authenticity)", run: runEdgeCases },
    { id: "xval", label: "Cross-Validation", icon: <Shuffle size={14} />, color: "var(--warm-sienna)", run: runCrossValidation },
    { id: "pdb", label: "Parametric DB", icon: <Layers size={14} />, color: "var(--secondary)", run: runParametricDb },
    { id: "dev", label: "Deviation & Flour", icon: <GitBranch size={14} />, color: "var(--time-dinner)", run: runDeviationFlour },
    { id: "opt", label: "Optimizer", icon: <Sparkles size={14} />, color: "var(--cta)", run: runOptimizer },
  ];
}

/* ═══ MAIN COMPONENT ═══ */
export function EngineTestSuite() {
  const categories = useMemo(buildCategories, []);
  const [suiteStatus, setSuiteStatus] = useState<SuiteStatus>("idle");
  const [allResults, setAllResults] = useState<Record<string, TestResult[]>>({});
  const [runMs, setRunMs] = useState(0);
  const [expandedCats, setExpandedCats] = useState<Set<string>>(new Set());

  const toggleCat = useCallback((id: string) => {
    setExpandedCats(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, []);

  const runAll = useCallback(() => {
    setSuiteStatus("running");
    setAllResults({});
    // Use setTimeout to allow UI to update before heavy computation
    setTimeout(() => {
      const t0 = performance.now();
      const collected: Record<string, TestResult[]> = {};
      for (const cat of categories) {
        try {
          collected[cat.id] = cat.run();
        } catch (e: any) {
          collected[cat.id] = [{ id: `${cat.id}-crash`, name: "CRASH", status: "fail", detail: e.message, ms: 0 }];
        }
      }
      setRunMs(Math.round(performance.now() - t0));
      setAllResults(collected);
      setSuiteStatus("done");
      // Auto-expand categories with failures
      const failedCats = new Set<string>();
      for (const [catId, rs] of Object.entries(collected)) {
        if (rs.some(r => r.status === "fail")) failedCats.add(catId);
      }
      setExpandedCats(failedCats);
    }, 50);
  }, [categories]);

  // Summary stats
  const summary = useMemo(() => {
    let total = 0, pass = 0, warn = 0, fail = 0;
    for (const rs of Object.values(allResults)) {
      for (const r of rs) {
        total++;
        if (r.status === "pass") pass++;
        else if (r.status === "warn") warn++;
        else fail++;
      }
    }
    return { total, pass, warn, fail };
  }, [allResults]);

  /* ── Clipboard (dual path per iframe) ── */
  const [copied, setCopied] = useState<"none" | "issues" | "full">("none");

  const copyToClipboard = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      try {
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        const ok = document.execCommand("copy");
        document.body.removeChild(ta);
        return ok;
      } catch {
        return false;
      }
    }
  }, []);

  const generateReport = useCallback((mode: "issues" | "full") => {
    const lines: string[] = [];
    const statusIcon = (s: string) => s === "pass" ? "PASS" : s === "warn" ? "WARN" : "FAIL";
    const catLabel = (id: string) => categories.find(c => c.id === id)?.label || id;

    lines.push("# Engine Test Suite — Report");
    lines.push(`Data: ${new Date().toISOString().slice(0, 19).replace("T", " ")}`);
    lines.push(`Stili: ${STYLE_IDS().length} | Schema: v${RECIPE_SCHEMA_VERSION}`);
    lines.push(`Risultato: ${summary.total} test — ${summary.pass} pass, ${summary.warn} warn, ${summary.fail} fail (${runMs}ms)`);
    lines.push("");

    for (const cat of categories) {
      const rs = allResults[cat.id] || [];
      if (rs.length === 0) continue;

      const filtered = mode === "issues" ? rs.filter(r => r.status !== "pass") : rs;
      if (filtered.length === 0 && mode === "issues") continue;

      const catPass = rs.filter(r => r.status === "pass").length;
      const catWarn = rs.filter(r => r.status === "warn").length;
      const catFail = rs.filter(r => r.status === "fail").length;

      lines.push(`## ${catLabel(cat.id)} (${catPass}P/${catWarn}W/${catFail}F)`);

      for (const r of filtered) {
        lines.push(`- [${statusIcon(r.status)}] ${r.id} ${r.name}: ${r.detail}`);
      }
      lines.push("");
    }

    if (mode === "issues" && summary.fail === 0 && summary.warn === 0) {
      lines.push("Tutti i test superati, nessun problema da segnalare.");
    }

    return lines.join("\n");
  }, [categories, allResults, summary, runMs]);

  const handleCopyReport = useCallback((mode: "issues" | "full") => {
    const report = generateReport(mode);
    copyToClipboard(report).then(() => {
      setCopied(mode);
      setTimeout(() => setCopied("none"), 2500);
    });
  }, [generateReport, copyToClipboard]);

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: "var(--grad-ember)", color: "var(--overlay-text)" }}
          >
            <FlaskConical size={18} />
          </div>
          <div>
            <div className="type-data" style={{ fontWeight: "var(--weight-bold)" as any, color: "var(--text-default)" }}>
              Engine Test Suite
            </div>
            <div className="type-data-sm" style={{ color: "var(--text-muted)" }}>
              {categories.length} categorie · auto-adattivo · {STYLE_IDS().length} stili
            </div>
          </div>
        </div>
        <button
          onClick={runAll}
          disabled={suiteStatus === "running"}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl active:scale-95 transition-transform"
          style={{
            background: suiteStatus === "running" ? "var(--surface-container)" : "var(--cta)",
            color: suiteStatus === "running" ? "var(--text-muted)" : "var(--cta-foreground)",
            fontWeight: "var(--weight-semibold)" as any,
            fontSize: "var(--font-size-base)",
            border: "none",
            cursor: suiteStatus === "running" ? "wait" : "pointer",
            opacity: suiteStatus === "running" ? 0.6 : 1,
          }}
          aria-label="Esegui tutti i test"
        >
          {suiteStatus === "running" ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <Play size={14} />
          )}
          {suiteStatus === "running" ? "In corso..." : "Esegui tutti"}
        </button>
      </div>

      {/* Summary bar */}
      {suiteStatus === "done" && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          className="flex items-center gap-4 p-4 rounded-2xl"
          style={{
            background: summary.fail > 0
              ? "color-mix(in srgb, var(--text-error) 8%, transparent)"
              : summary.warn > 0
              ? "color-mix(in srgb, var(--tertiary) 8%, transparent)"
              : "color-mix(in srgb, var(--cta) 8%, transparent)",
            border: `1px solid ${summary.fail > 0 ? "color-mix(in srgb, var(--text-error) 20%, transparent)" : summary.warn > 0 ? "color-mix(in srgb, var(--tertiary) 20%, transparent)" : "color-mix(in srgb, var(--cta) 20%, transparent)"}`,
          }}
        >
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{
              background: summary.fail > 0 ? "color-mix(in srgb, var(--text-error) 15%, transparent)" : summary.warn > 0 ? "color-mix(in srgb, var(--tertiary) 15%, transparent)" : "color-mix(in srgb, var(--cta) 15%, transparent)",
              color: summary.fail > 0 ? "var(--text-error)" : summary.warn > 0 ? "var(--tertiary)" : "var(--cta)",
            }}
          >
            {summary.fail > 0 ? <CircleX size={20} /> : summary.warn > 0 ? <AlertTriangle size={20} /> : <CheckCircle2 size={20} />}
          </div>
          <div className="flex-1">
            <div className="type-data" style={{ fontWeight: "var(--weight-bold)" as any, color: "var(--text-default)" }}>
              {summary.fail > 0 ? `${summary.fail} test falliti` : summary.warn > 0 ? `${summary.warn} avvisi` : "Tutti i test superati"}
            </div>
            <div className="type-data-sm" style={{ color: "var(--text-muted)" }}>
              {summary.total} test · {summary.pass} pass · {summary.warn} warn · {summary.fail} fail · {runMs}ms
            </div>
          </div>
          {/* Pass rate bar */}
          <div className="hidden sm:flex items-center gap-3">
            <div className="w-32 h-2.5 rounded-full overflow-hidden" style={{ background: "var(--surface-container)" }}>
              <div
                className="h-full rounded-full"
                style={{
                  width: `${summary.total ? (summary.pass / summary.total) * 100 : 0}%`,
                  background: summary.fail > 0 ? "var(--tertiary)" : "var(--cta)",
                  transition: "width 0.5s ease",
                }}
              />
            </div>
            <span className="type-data" style={{ fontWeight: "var(--weight-bold)" as any, fontFeatureSettings: "'tnum'", color: "var(--text-default)", minWidth: 40 }}>
              {summary.total ? Math.round((summary.pass / summary.total) * 100) : 0}%
            </span>
          </div>
        </motion.div>
      )}

      {/* Copy report buttons */}
      {suiteStatus === "done" && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          className="flex flex-col gap-3"
        >
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => handleCopyReport("issues")}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl active:scale-95 transition-transform"
              style={{
                background: copied === "issues" ? "color-mix(in srgb, var(--cta) 12%, transparent)" : "var(--surface-container)",
                color: copied === "issues" ? "var(--cta)" : "var(--text-default)",
                border: `1px solid ${copied === "issues" ? "color-mix(in srgb, var(--cta) 30%, transparent)" : "var(--container-border)"}`,
                fontWeight: "var(--weight-semibold)" as any,
                fontSize: "var(--font-size-base)",
                cursor: "pointer",
              }}
              aria-label="Copia report solo problemi"
            >
              {copied === "issues" ? <Check size={14} /> : <ClipboardList size={14} />}
              {copied === "issues" ? "Copiato!" : "Copia solo problemi"}
            </button>
            <button
              onClick={() => handleCopyReport("full")}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl active:scale-95 transition-transform"
              style={{
                background: copied === "full" ? "color-mix(in srgb, var(--cta) 12%, transparent)" : "var(--surface-container)",
                color: copied === "full" ? "var(--cta)" : "var(--text-default)",
                border: `1px solid ${copied === "full" ? "color-mix(in srgb, var(--cta) 30%, transparent)" : "var(--container-border)"}`,
                fontWeight: "var(--weight-semibold)" as any,
                fontSize: "var(--font-size-base)",
                cursor: "pointer",
              }}
              aria-label="Copia report completo"
            >
              {copied === "full" ? <Check size={14} /> : <Copy size={14} />}
              {copied === "full" ? "Copiato!" : "Copia report completo"}
            </button>
            <span className="type-data-xs" style={{ color: "var(--text-muted)", marginLeft: 4 }}>
              Incolla in chat per analisi e fix
            </span>
          </div>
        </motion.div>
      )}

      {/* Categories */}
      <div className="flex flex-col gap-3">
        {categories.map((cat) => {
          const catResults = allResults[cat.id] || [];
          const catPass = catResults.filter(r => r.status === "pass").length;
          const catWarn = catResults.filter(r => r.status === "warn").length;
          const catFail = catResults.filter(r => r.status === "fail").length;
          const isExpanded = expandedCats.has(cat.id);
          const hasResults = catResults.length > 0;

          return (
            <Surface key={cat.id} className="overflow-hidden" style={{ borderLeft: `3px solid ${cat.color}` }}>
              {/* Category header */}
              <button
                onClick={() => hasResults && toggleCat(cat.id)}
                className="w-full flex items-center justify-between p-4 active:scale-[0.99] transition-transform"
                style={{ background: "transparent", cursor: hasResults ? "pointer" : "default" }}
                disabled={!hasResults}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: `color-mix(in srgb, ${cat.color} 12%, transparent)`, color: cat.color }}
                  >
                    {cat.icon}
                  </div>
                  <span className="type-data" style={{ fontWeight: "var(--weight-semibold)" as any, color: "var(--text-default)" }}>
                    {cat.label}
                  </span>
                  {hasResults && (
                    <div className="flex items-center gap-1.5 ml-2">
                      {catPass > 0 && (
                        <Badge size="xs" tone="cta" background="color-mix(in srgb, var(--cta) 12%, transparent)">
                          {catPass} ✓
                        </Badge>
                      )}
                      {catWarn > 0 && (
                        <Badge size="xs" tone="tertiary" background="color-mix(in srgb, var(--tertiary) 12%, transparent)">
                          {catWarn} ⚠
                        </Badge>
                      )}
                      {catFail > 0 && (
                        <Badge size="xs" tone="error" background="color-mix(in srgb, var(--text-error) 12%, transparent)">
                          {catFail} ✗
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
                {hasResults && (
                  <motion.div
                    animate={{ rotate: isExpanded ? 180 : 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  >
                    <ChevronDown size={14} style={{ color: "var(--text-muted)" }} />
                  </motion.div>
                )}
              </button>

              {/* Results accordion */}
              <AnimatePresence>
                {isExpanded && hasResults && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4" style={{ borderTop: "1px solid var(--container-border)" }}>
                      <div className="pt-3 flex flex-col gap-1.5">
                        {catResults.map((r) => (
                          <div
                            key={r.id}
                            className="flex items-start gap-2.5 p-2.5 rounded-lg"
                            style={{
                              background: r.status === "fail" ? "color-mix(in srgb, var(--text-error) 5%, transparent)" : "transparent",
                            }}
                          >
                            {/* Status icon */}
                            <div className="flex-shrink-0 mt-0.5">
                              {r.status === "pass" && <CheckCircle2 size={14} style={{ color: "var(--cta)" }} />}
                              {r.status === "warn" && <AlertTriangle size={14} style={{ color: "var(--tertiary)" }} />}
                              {r.status === "fail" && <CircleX size={14} style={{ color: "var(--text-error)" }} />}
                            </div>
                            {/* Test info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span
                                  className="type-data"
                                  style={{
                                    fontWeight: "var(--weight-semibold)" as any,
                                    color: r.status === "fail" ? "var(--text-error)" : "var(--text-default)",
                                    fontSize: "var(--font-size-sm)",
                                  }}
                                >
                                  {r.name}
                                </span>
                                <span
                                  className="type-data"
                                  style={{
                                    fontSize: "var(--font-size-xs)",
                                    color: "var(--text-muted)",
                                    fontFamily: "var(--font-mono)",
                                    fontFeatureSettings: "'tnum'",
                                    opacity: 0.6,
                                  }}
                                >
                                  {r.id}
                                </span>
                              </div>
                              <div
                                className="type-data mt-0.5"
                                style={{
                                  fontSize: "var(--font-size-xs)",
                                  color: "var(--text-muted)",
                                  lineHeight: "var(--leading-relaxed)",
                                  wordBreak: "break-word",
                                }}
                              >
                                {r.detail}
                              </div>
                            </div>
                            {/* Timing */}
                            <span
                              className="type-data flex-shrink-0"
                              style={{
                                fontSize: "var(--font-size-xs)",
                                color: "var(--text-muted)",
                                fontFamily: "var(--font-mono)",
                                fontFeatureSettings: "'tnum'",
                                opacity: 0.5,
                              }}
                            >
                              {r.ms}ms
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </Surface>
          );
        })}
      </div>
    </div>
  );
}
