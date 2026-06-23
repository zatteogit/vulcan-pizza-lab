import {
AlertTriangle,
ArrowDown,
ArrowRight,
BookOpen,
Check,
ChevronDown,
ChevronRight,
CircleAlert,
CircleDot,
ClipboardPaste,
Copy,
Database,
Eye,
FileJson,
Flame,
FlaskConical,
GitCompareArrows,
Info,
Link2,
Plus,
RectangleHorizontal,
RotateCcw,
Sparkles,
Square,
Timer,
Trash2,
Upload,
Wheat,
Wrench,
X,
Zap,
} from "lucide-react";
import { AnimatePresence,motion } from "motion/react";
import React,{ useCallback,useEffect,useMemo,useState } from "react";
import {
PIZZA_FAMILIES,
STYLES_DB,
generateRecipe,
type CrustType,
type DoughParameters,
type FamilyId,
type HydrationCategory,
type OvenType,
type PizzaStyle,
type ShapeType,
type SkillLevel,
type UserConstraints,
} from "./pizza-engine";
import { Badge, Surface } from "./ds";
import { useStylesOverride } from "./styles-override-context";

/* ═══ CONSTANTS ═══ */

const OVEN_TYPES: { id: OvenType; label: string }[] = [
  { id: "wood", label: "Legna" },
  { id: "electric_high", label: "Elettrico alto" },
  { id: "electric_standard", label: "Elettrico std" },
  { id: "gas", label: "Gas" },
  { id: "home", label: "Domestico" },
];

const CRUST_TYPES: { id: CrustType; label: string }[] = [
  { id: "leopard_soft", label: "Leopardato morbido" },
  { id: "crispy_thin", label: "Croccante sottile" },
  { id: "thick_airy", label: "Spesso arioso" },
  { id: "cheese_crown", label: "Bordo formaggio" },
  { id: "deep_dish", label: "Deep dish" },
  { id: "focaccia_soft", label: "Focaccia morbida" },
  { id: "stuffed_thin", label: "Farcita sottile" },
  { id: "pan_crispy", label: "Teglia croccante" },
];

const SHAPE_TYPES: { id: ShapeType; label: string; icon: React.ReactNode }[] = [
  { id: "round", label: "Tonda", icon: <CircleDot size={14} /> },
  { id: "oval", label: "Ovale", icon: <RectangleHorizontal size={14} /> },
  { id: "rectangular", label: "Rettangolare", icon: <Square size={14} /> },
];

const HYDRATION_CATS: HydrationCategory[] = ["low", "medium", "high", "extreme"];
const FAMILY_IDS: FamilyId[] = ["napoletana", "romana", "americana", "contemporanea"];

const FAT_TYPES = [
  { id: "none", label: "Nessuno" },
  { id: "oil", label: "Olio" },
  { id: "butter", label: "Burro" },
  { id: "lard", label: "Strutto" },
] as const;

/* ═══ DEEP CLONE ═══ */
function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

/* ═══ VALIDATION & COHERENCE ═══ */

type IssueSeverity = "error" | "warn" | "info";
interface ValidationIssue {
  severity: IssueSeverity;
  field: string;
  message: string;
  fix?: { label: string; apply: (s: PizzaStyle) => void };
}

function deriveHydrationCategory(range: [number, number]): HydrationCategory {
  const mid = (range[0] + range[1]) / 2;
  if (mid < 55) return "low";
  if (mid < 70) return "medium";
  if (mid < 85) return "high";
  return "extreme";
}

function derivePLRange(wRange: [number, number]): [number, number] {
  const lo = Math.round((0.3 + (wRange[0] - 150) * 0.0015) * 100) / 100;
  const hi = Math.round((0.3 + (wRange[1] - 150) * 0.0015) * 100) / 100;
  return [Math.max(0.20, lo - 0.05), Math.min(1.20, hi + 0.10)];
}

function validateStyle(s: PizzaStyle): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const push = (severity: IssueSeverity, field: string, message: string, fix?: ValidationIssue["fix"]) =>
    issues.push({ severity, field, message, fix });

  if (!s.name.trim()) push("error", "name", "Il nome è obbligatorio.");
  if (!s.id.trim()) push("error", "id", "L'ID è obbligatorio.");

  if (s.dough.flour_w_range[0] > s.dough.flour_w_range[1])
    push("error", "dough.flour_w_range", "Range W invertito (min > max).", {
      label: "Inverti", apply: (x) => { x.dough.flour_w_range = [x.dough.flour_w_range[1], x.dough.flour_w_range[0]]; }
    });
  if (s.dough.hydration_pct_range[0] > s.dough.hydration_pct_range[1])
    push("error", "dough.hydration_pct_range", "Range idratazione invertito.", {
      label: "Inverti", apply: (x) => { x.dough.hydration_pct_range = [x.dough.hydration_pct_range[1], x.dough.hydration_pct_range[0]]; }
    });
  if (s.dough.flour_pl_range[0] > s.dough.flour_pl_range[1])
    push("error", "dough.flour_pl_range", "Range P/L invertito.", {
      label: "Inverti", apply: (x) => { x.dough.flour_pl_range = [x.dough.flour_pl_range[1], x.dough.flour_pl_range[0]]; }
    });
  if (s.dough.fermentation_hours_range[0] > s.dough.fermentation_hours_range[1])
    push("error", "dough.fermentation_hours_range", "Range fermentazione invertito.", {
      label: "Inverti", apply: (x) => { x.dough.fermentation_hours_range = [x.dough.fermentation_hours_range[1], x.dough.fermentation_hours_range[0]]; }
    });
  if (s.baking.temp_c_range[0] > s.baking.temp_c_range[1])
    push("error", "baking.temp_c_range", "Range temperatura invertito.", {
      label: "Inverti", apply: (x) => { x.baking.temp_c_range = [x.baking.temp_c_range[1], x.baking.temp_c_range[0]]; }
    });
  if (s.baking.cook_time_sec_range[0] > s.baking.cook_time_sec_range[1])
    push("error", "baking.cook_time_sec_range", "Range tempo cottura invertito.", {
      label: "Inverti", apply: (x) => { x.baking.cook_time_sec_range = [x.baking.cook_time_sec_range[1], x.baking.cook_time_sec_range[0]]; }
    });

  if (s.baking.temp_c_ideal < s.baking.temp_c_range[0] || s.baking.temp_c_ideal > s.baking.temp_c_range[1])
    push("error", "baking.temp_c_ideal", `Temp ideale (${s.baking.temp_c_ideal}°C) fuori dal range [${s.baking.temp_c_range[0]}–${s.baking.temp_c_range[1]}].`, {
      label: "Centra", apply: (x) => { x.baking.temp_c_ideal = Math.round((x.baking.temp_c_range[0] + x.baking.temp_c_range[1]) / 2); }
    });
  if (s.baking.cook_time_sec_ideal < s.baking.cook_time_sec_range[0] || s.baking.cook_time_sec_ideal > s.baking.cook_time_sec_range[1])
    push("error", "baking.cook_time_sec_ideal", `Tempo cottura ideale (${s.baking.cook_time_sec_ideal}s) fuori dal range.`, {
      label: "Centra", apply: (x) => { x.baking.cook_time_sec_ideal = Math.round((x.baking.cook_time_sec_range[0] + x.baking.cook_time_sec_range[1]) / 2); }
    });

  const wMid = (s.dough.flour_w_range[0] + s.dough.flour_w_range[1]) / 2;
  const hMid = (s.dough.hydration_pct_range[0] + s.dough.hydration_pct_range[1]) / 2;
  const fermMid = (s.dough.fermentation_hours_range[0] + s.dough.fermentation_hours_range[1]) / 2;

  if (hMid > 75 && wMid < 250)
    push("warn", "dough.flour_w_range", `Idratazione alta (${Math.round(hMid)}%) con W bassa (${Math.round(wMid)}): rete glutinica debole.`, {
      label: "Alza W a 280", apply: (x) => { x.dough.flour_w_range = [280, Math.max(280, x.dough.flour_w_range[1])]; }
    });
  if (hMid < 55 && wMid > 300)
    push("warn", "dough.flour_w_range", `Idratazione bassa (${Math.round(hMid)}%) con W alta (${Math.round(wMid)}): farina sovradimensionata.`, {
      label: "Abbassa W", apply: (x) => { x.dough.flour_w_range = [Math.min(x.dough.flour_w_range[0], 260), 260]; }
    });

  if (fermMid < 6 && wMid > 300)
    push("warn", "dough.fermentation_hours_range", `Fermentazione breve (${fermMid.toFixed(1)}h) con W alta: glutine sottosviluppato.`);
  if (fermMid > 48 && wMid < 250)
    push("warn", "dough.fermentation_hours_range", `Fermentazione lunga (${fermMid.toFixed(1)}h) con W bassa: rischio over-proteolisi.`);

  if (s.dough.fat_type === "none" && s.dough.oil_pct > 0)
    push("warn", "dough.fat_type", `Tipo grasso "Nessuno" ma percentuale > 0 (${s.dough.oil_pct}%).`, {
      label: "Imposta olio", apply: (x) => { x.dough.fat_type = "oil"; }
    });
  if (s.dough.fat_type !== "none" && s.dough.oil_pct === 0)
    push("warn", "dough.oil_pct", `Tipo grasso "${s.dough.fat_type}" ma percentuale = 0.`, {
      label: "Imposta 2%", apply: (x) => { x.dough.oil_pct = 2.0; }
    });

  if (s.requires_wood_oven && s.baking.oven_type_required !== "wood")
    push("warn", "requires_wood_oven", "Flag 'forno a legna' attivo ma tipo forno diverso.", {
      label: "Disattiva flag", apply: (x) => { x.requires_wood_oven = false; }
    });
  if (!s.requires_wood_oven && s.baking.oven_type_required === "wood")
    push("warn", "requires_wood_oven", "Forno legna richiesto ma flag disattivato.", {
      label: "Attiva flag", apply: (x) => { x.requires_wood_oven = true; }
    });

  const expectedCat = deriveHydrationCategory(s.dough.hydration_pct_range);
  if (s.hydration_category !== expectedCat)
    push("warn", "hydration_category", `Categoria "${s.hydration_category}" non corrisponde al range (attesa: "${expectedCat}").`, {
      label: `Imposta "${expectedCat}"`, apply: (x) => { x.hydration_category = expectedCat; }
    });

  if (s.suitable_for_beginner && /biga|poolish/i.test(s.dough.process_type))
    push("warn", "suitable_for_beginner", "Marcato per principianti ma richiede biga/poolish.");

  if (s.requires_pre_ferment && !/biga|poolish/i.test(s.dough.process_type))
    push("warn", "requires_pre_ferment", "Flag pre-fermento attivo ma metodo non include biga/poolish.", {
      label: "Disattiva", apply: (x) => { x.requires_pre_ferment = false; }
    });
  if (!s.requires_pre_ferment && /biga|poolish/i.test(s.dough.process_type) && !/direct/i.test(s.dough.process_type))
    push("warn", "requires_pre_ferment", "Metodo include biga/poolish ma flag pre-fermento disattivato.", {
      label: "Attiva", apply: (x) => { x.requires_pre_ferment = true; }
    });

  const tempIdeal = s.baking.temp_c_ideal;
  const cookIdeal = s.baking.cook_time_sec_ideal;
  if (tempIdeal > 400 && cookIdeal > 300)
    push("warn", "baking.cook_time_sec_ideal", `Temp alta (${tempIdeal}°C) + tempo lungo (${cookIdeal}s): rischio bruciatura.`);
  if (tempIdeal < 250 && cookIdeal < 300)
    push("warn", "baking.cook_time_sec_ideal", `Temp bassa (${tempIdeal}°C) + tempo breve (${cookIdeal}s): probabilmente crudo al centro.`);

  if (s.shape.shape_type === "round" && !s.shape.diameter_cm)
    push("info", "shape.diameter_cm", "Diametro non specificato per forma tonda.", {
      label: "Imposta 30cm", apply: (x) => { x.shape.diameter_cm = 30; }
    });
  if ((s.shape.shape_type === "rectangular" || s.shape.shape_type === "oval") && (!s.shape.length_cm || !s.shape.width_cm))
    push("info", "shape.length_cm", "Dimensioni mancanti per forma rettangolare/ovale.", {
      label: "Imposta 40×30cm", apply: (x) => { x.shape.length_cm = 40; x.shape.width_cm = 30; }
    });

  return issues;
}

/* ═══ STYLE DIFF HELPERS ═══ */

function isStyleModified(id: string, current: PizzaStyle): boolean {
  const original = STYLES_DB[id];
  if (!original) return false;
  return JSON.stringify(current) !== JSON.stringify(original);
}

type StyleStatus = "original" | "modified" | "custom";

function getStyleStatus(id: string, current: PizzaStyle): StyleStatus {
  if (!STYLES_DB[id]) return "custom";
  return isStyleModified(id, current) ? "modified" : "original";
}

const STATUS_META: Record<StyleStatus, { label: string; color: string; dotColor: string }> = {
  original: { label: "Originale", color: "var(--cta)", dotColor: "var(--cta)" },
  modified: { label: "Modificato", color: "var(--tertiary)", dotColor: "var(--tertiary)" },
  custom:   { label: "Custom",    color: "var(--primary)",  dotColor: "var(--primary)" },
};

function getModifiedFields(id: string, current: PizzaStyle): string[] {
  const original = STYLES_DB[id];
  if (!original) return [];
  const diffs: string[] = [];
  if (current.name !== original.name) diffs.push("nome");
  if (current.family !== original.family) diffs.push("famiglia");
  if (JSON.stringify(current.dough) !== JSON.stringify(original.dough)) diffs.push("impasto");
  if (JSON.stringify(current.shape) !== JSON.stringify(original.shape)) diffs.push("forma");
  if (JSON.stringify(current.baking) !== JSON.stringify(original.baking)) diffs.push("cottura");
  if (current.crust_type !== original.crust_type) diffs.push("crosta");
  if (current.hydration_category !== original.hydration_category) diffs.push("cat. idratazione");
  if (current.suitable_for_beginner !== original.suitable_for_beginner) diffs.push("beginner flag");
  if (current.requires_wood_oven !== original.requires_wood_oven) diffs.push("forno legna");
  if (current.requires_pre_ferment !== original.requires_pre_ferment) diffs.push("pre-fermento");
  return diffs;
}

/* ═══ AUTO-CALC BUTTON ═══ */
function AutoCalcBtn({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1 px-2 py-0.5 rounded-md type-data-xs active:scale-95 transition-transform"
      style={{
        fontWeight: "var(--weight-medium)" as any,
        background: "color-mix(in srgb, var(--tertiary) 12%, transparent)",
        color: "var(--tertiary)",
        border: "1px solid color-mix(in srgb, var(--tertiary) 25%, transparent)",
      }}
      aria-label={label}
    >
      <Zap size={9} /> {label}
    </button>
  );
}

/* ═══ ISSUE SEVERITY STYLING ═══ */
const ISSUE_STYLE: Record<IssueSeverity, { bg: string; border: string; color: string; badge: string; icon: React.ReactNode }> = {
  error: {
    bg: "color-mix(in srgb, var(--text-error) 6%, transparent)",
    border: "color-mix(in srgb, var(--text-error) 20%, transparent)",
    color: "var(--text-error)",
    badge: "ERR",
    icon: <CircleAlert size={11} />,
  },
  warn: {
    bg: "color-mix(in srgb, var(--text-warning) 6%, transparent)",
    border: "color-mix(in srgb, var(--text-warning) 20%, transparent)",
    color: "var(--text-warning)",
    badge: "WARN",
    icon: <AlertTriangle size={11} />,
  },
  info: {
    bg: "color-mix(in srgb, var(--secondary) 6%, transparent)",
    border: "color-mix(in srgb, var(--secondary) 20%, transparent)",
    color: "var(--secondary)",
    badge: "INFO",
    icon: <Info size={11} />,
  },
};

/* ═══ FIELD COMPONENTS ═══ */

function FieldLabel({ children, required, hint }: { children: React.ReactNode; required?: boolean; hint?: string }) {
  return (
    <label
      className="type-label-compact flex items-center gap-1"
      style={{
        color: "var(--text-muted)",
        display: "flex",
        marginBottom: "var(--space-1)",
      }}
    >
      {children}
      {required && (
        <span className="type-body-xs" style={{ color: "var(--text-error)" }} title="Obbligatorio">*</span>
      )}
      {hint && (
        <span title={hint} style={{ color: "var(--text-muted)", cursor: "help", opacity: 0.6 }}>
          <Info size={9} />
        </span>
      )}
    </label>
  );
}

function NumberInput({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  unit,
  required,
  hint,
  autoCalc,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  required?: boolean;
  hint?: string;
  autoCalc?: { label: string; onClick: () => void };
}) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <FieldLabel required={required} hint={hint}>
          {label}
          {unit && (
            <span style={{ color: "var(--text-accent)", marginLeft: "var(--space-1)" }}>
              {unit}
            </span>
          )}
        </FieldLabel>
        {autoCalc && <AutoCalcBtn label={autoCalc.label} onClick={autoCalc.onClick} />}
      </div>
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full p-2 rounded-lg type-data-field"
        style={{
          background: "var(--container-bg)",
          border: "1px solid var(--container-border)",
          color: "var(--text-default)",
          fontFeatureSettings: "'tnum'",
        }}
      />
    </div>
  );
}

function RangeInput({
  label,
  low,
  high,
  onChangeLow,
  onChangeHigh,
  min,
  max,
  step = 1,
  unit,
  required,
  hint,
  autoCalc,
}: {
  label: string;
  low: number;
  high: number;
  onChangeLow: (v: number) => void;
  onChangeHigh: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  required?: boolean;
  hint?: string;
  autoCalc?: { label: string; onClick: () => void };
}) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <FieldLabel required={required} hint={hint}>
          {label}
          {unit && (
            <span style={{ color: "var(--text-accent)", marginLeft: "var(--space-1)" }}>
              {unit}
            </span>
          )}
        </FieldLabel>
        {autoCalc && <AutoCalcBtn label={autoCalc.label} onClick={autoCalc.onClick} />}
      </div>
      <div className="flex items-center gap-2">
        <input
          type="number"
          value={low}
          min={min}
          max={max}
          step={step}
          onChange={(e) => onChangeLow(Number(e.target.value))}
          className="flex-1 p-2 rounded-lg type-data-field"
          style={{
            background: "var(--container-bg)",
            border: "1px solid var(--container-border)",
            color: "var(--text-default)",
            fontFeatureSettings: "'tnum'",
          }}
        />
        <span
          className="type-data-field"
          style={{ color: "var(--text-muted)" }}
        >
          —
        </span>
        <input
          type="number"
          value={high}
          min={min}
          max={max}
          step={step}
          onChange={(e) => onChangeHigh(Number(e.target.value))}
          className="flex-1 p-2 rounded-lg type-data-field"
          style={{
            background: "var(--container-bg)",
            border: "1px solid var(--container-border)",
            color: "var(--text-default)",
            fontFeatureSettings: "'tnum'",
          }}
        />
      </div>
    </div>
  );
}

function TextInput({
  label,
  value,
  onChange,
  placeholder,
  required,
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
  hint?: string;
}) {
  return (
    <div>
      <FieldLabel required={required} hint={hint}>{label}</FieldLabel>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full p-2 rounded-lg type-data-field"
        style={{
          background: "var(--container-bg)",
          border: "1px solid var(--container-border)",
          color: "var(--text-default)",
        }}
      />
    </div>
  );
}

function TextAreaInput({
  label,
  value,
  onChange,
  rows = 2,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
}) {
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        className="w-full p-2 rounded-lg type-data-field resize-y"
        style={{
          background: "var(--container-bg)",
          border: "1px solid var(--container-border)",
          color: "var(--text-default)",
          lineHeight: "var(--leading-relaxed)",
        }}
      />
    </div>
  );
}

function SelectInput<T extends string>({
  label,
  value,
  options,
  onChange,
  required,
  hint,
  autoCalc,
}: {
  label: string;
  value: T;
  options: { id: T; label: string }[];
  onChange: (v: T) => void;
  required?: boolean;
  hint?: string;
  autoCalc?: { label: string; onClick: () => void };
}) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <FieldLabel required={required} hint={hint}>{label}</FieldLabel>
        {autoCalc && <AutoCalcBtn label={autoCalc.label} onClick={autoCalc.onClick} />}
      </div>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        className="w-full p-2 rounded-lg type-data-field"
        style={{
          background: "var(--container-bg)",
          border: "1px solid var(--container-border)",
          color: "var(--text-default)",
        }}
      >
        {options.map((o) => (
          <option key={o.id} value={o.id}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function ToggleField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      onClick={() => onChange(!value)}
      className="flex items-center gap-3 p-2.5 rounded-lg w-full active:scale-[0.98] transition-transform"
      style={{
        background: value
          ? "color-mix(in srgb, var(--cta) 12%, transparent)"
          : "var(--container-bg)",
        border: value
          ? "1px solid color-mix(in srgb, var(--cta) 30%, transparent)"
          : "1px solid var(--container-border)",
      }}
    >
      <div
        className="w-8 h-4 rounded-full relative flex-shrink-0"
        style={{
          background: value ? "var(--cta)" : "var(--container-border)",
        }}
      >
        <motion.div
          className="absolute top-0.5 w-3 h-3 rounded-full bg-white"
          animate={{ x: value ? 16 : 2 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        />
      </div>
      <span
        className="type-data-base"
        style={{
          color: value ? "var(--cta)" : "var(--text-muted)",
          fontWeight: "var(--weight-medium)" as any,
        }}
      >
        {label}
      </span>
    </button>
  );
}

/* ═══ COLLAPSIBLE SECTION ═══ */
function Section({
  title,
  icon,
  color,
  defaultOpen = false,
  children,
  issueCount,
}: {
  title: string;
  icon: React.ReactNode;
  color: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
  issueCount?: { errors: number; warnings: number };
}) {
  const [open, setOpen] = useState(defaultOpen);
  const hasIssues = issueCount && (issueCount.errors > 0 || issueCount.warnings > 0);
  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{
        border: hasIssues
          ? issueCount.errors > 0
            ? "1px solid color-mix(in srgb, var(--text-error) 40%, transparent)"
            : "1px solid color-mix(in srgb, var(--text-warning) 40%, transparent)"
          : "1px solid var(--container-border)",
        background: "var(--surface-container-low)",
      }}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-3.5 active:scale-[0.99] transition-transform"
        style={{ background: "transparent" }}
      >
        <div className="flex items-center gap-2.5">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{
              background: `color-mix(in srgb, ${color} 14%, transparent)`,
              color,
            }}
          >
            {icon}
          </div>
          <span
            className="type-data-field"
            style={{
              fontWeight: "var(--weight-semibold)" as any,
              color: "var(--text-default)",
            }}
          >
            {title}
          </span>
          {hasIssues && (
            <div className="flex items-center gap-1">
              {issueCount.errors > 0 && (
                <Badge size="xs" tone="error">
                  {issueCount.errors}
                </Badge>
              )}
              {issueCount.warnings > 0 && (
                <Badge size="xs" tone="warning">
                  {issueCount.warnings}
                </Badge>
              )}
            </div>
          )}
        </div>
        <motion.div
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        >
          <ChevronDown size={14} style={{ color: "var(--icon-muted)" }} />
        </motion.div>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 28 }}
            className="overflow-hidden"
          >
            <div
              className="px-3.5 pb-4"
              style={{ borderTop: "1px solid var(--container-border)" }}
            >
              <div className="pt-3 flex flex-col gap-3">{children}</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ═══ TAGS EDITOR ═══ */
function TagsEditor({
  label,
  tags,
  onChange,
}: {
  label: string;
  tags: string[];
  onChange: (t: string[]) => void;
}) {
  const [draft, setDraft] = useState("");

  const add = () => {
    const trimmed = draft.trim();
    if (trimmed && !tags.includes(trimmed)) {
      onChange([...tags, trimmed]);
      setDraft("");
    }
  };

  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <div className="flex flex-wrap gap-1.5 mb-2">
        {tags.map((t, i) => (
          <Badge
            key={`${t}-${i}`}
            className="flex items-center gap-1.5"
            color="var(--text-default)"
            background="color-mix(in srgb, var(--text-muted) 15%, transparent)"
          >
            {t}
            <button
              onClick={() => onChange(tags.filter((_, j) => j !== i))}
              className="active:scale-90 transition-transform"
              aria-label={`Rimuovi ${t}`}
            >
              <X size={10} style={{ color: "var(--icon-muted)" }} />
            </button>
          </Badge>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), add())}
          placeholder="Aggiungi..."
          className="flex-1 p-2 rounded-lg type-data-base"
          style={{
            background: "var(--container-bg)",
            border: "1px solid var(--container-border)",
            color: "var(--text-default)",
          }}
        />
        <button
          onClick={add}
          className="px-3 py-2 rounded-lg active:scale-95 transition-transform"
          style={{
            background: "var(--chip-bg-active)",
            color: "var(--chip-text-active)",
          }}
          aria-label="Aggiungi caratteristica"
        >
          <Plus size={14} />
        </button>
      </div>
    </div>
  );
}

/* ═══ SCORE MINI BAR ═══ */
function ScoreBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <span
        className="type-data-sm"
        style={{
          color: "var(--text-muted)",
          minWidth: 80,
        }}
      >
        {label}
      </span>
      <div
        className="flex-1 h-2 rounded-full overflow-hidden"
        style={{ background: "var(--container-bg)" }}
      >
        <motion.div
          className="h-full rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ type: "spring", stiffness: 120, damping: 20 }}
          style={{ background: color }}
        />
      </div>
      <span
        className="type-data-base"
        style={{
          fontWeight: "var(--weight-bold)" as any,
          color,
          fontFeatureSettings: "'tnum'",
          minWidth: 28,
          textAlign: "right",
        }}
      >
        {Math.round(value)}
      </span>
    </div>
  );
}

/* ═══ JSON SCHEMA & PROMPT ═══ */

const PIZZA_STYLE_SCHEMA = `{
  // ─── Identità ───
  "id": "string",              // ID unico, snake_case (es. "pizza_fritta_napoletana")
  "name": "string",            // Nome display (es. "Pizza Fritta Napoletana")
  "family": "napoletana" | "romana" | "americana" | "contemporanea",
  "origin": "string",          // Luogo d'origine (es. "Napoli, Italia")
  "emoji": "string",           // Singola emoji rappresentativa
  "description": "string",     // 1-2 frasi, tono editoriale
  "key_characteristics": ["string", ...],  // 3-5 caratteristiche chiave

  // ─── Impasto (DoughParameters) ───
  "dough": {
    "flour_w_range": [number, number],      // Range W farina [min, max], tipico 150-400
    "flour_pl_range": [number, number],     // P/L alveografico [min, max], tipico 0.40-0.80
    "hydration_pct_range": [number, number],// % idratazione [min, max], tipico 45-100
    "salt_pct": number,                     // % sale Baker's, tipico 2.0-3.0
    "oil_pct": number,                      // % grasso Baker's, 0 se fat_type="none"
    "fat_type": "oil" | "butter" | "lard" | "none",
    "sugar_pct": number,                    // % zucchero Baker's, 0 per la maggioranza
    "fermentation_hours_range": [number, number], // Ore fermentazione [min, max]
    "process_type": "string"                // "direct" | "biga" | "poolish" | "biga|poolish" | "no_knead"
  },

  // ─── Forma (ShapeParameters) ───
  "shape": {
    "shape_type": "round" | "rectangular" | "oval",
    "dough_weight_g": number,     // Peso panetto in grammi (per porzione)
    "thickness_factor": number,   // 0.20 (sottile) → 0.50 (spessa), default 0.34
    "diameter_cm?": number,       // Solo per round (opzionale)
    "length_cm?": number,         // Solo per rectangular/oval
    "width_cm?": number           // Solo per rectangular/oval
  },

  // ─── Cottura (BakingParameters) ───
  "baking": {
    "oven_type_required": "wood" | "electric_high" | "electric_standard" | "gas" | "home",
    "temp_c_range": [number, number],       // Range temperatura °C [min, max]
    "temp_c_ideal": number,                 // Temperatura ideale °C (dentro il range)
    "cook_time_sec_range": [number, number],// Range tempo cottura secondi [min, max]
    "cook_time_sec_ideal": number           // Tempo ideale secondi (dentro il range)
  },

  // ─── Classificazione ───
  "crust_type": "leopard_soft" | "crispy_thin" | "thick_airy" | "cheese_crown"
              | "deep_dish" | "focaccia_soft" | "stuffed_thin" | "pan_crispy",
  "hydration_category": "low" | "medium" | "high" | "extreme",
    // low: <55%, medium: 55-70%, high: 70-85%, extreme: >85%
  "requires_wood_oven": boolean,     // true solo se il forno a legna è essenziale
  "allows_additives": boolean,       // true se olio/zucchero sono previsti nello stile
  "requires_pre_ferment": boolean,   // true se biga/poolish è parte integrante
  "suitable_for_beginner": boolean   // true se skill_level 1-2 può farcela
}`;

const PIZZA_STYLE_EXAMPLE = `{
  "id": "pizza_fritta_napoletana",
  "name": "Pizza Fritta Napoletana",
  "family": "napoletana",
  "origin": "Napoli, Italia",
  "emoji": "🫓",
  "description": "Impasto morbido fritto in olio bollente, ripieno di ricotta e cicoli. Street food napoletano per eccellenza.",
  "key_characteristics": [
    "Fritta in olio a 170-180°C",
    "Ripieno chiuso a mezzaluna",
    "Impasto morbido e leggero",
    "Dorata e croccante fuori"
  ],
  "dough": {
    "flour_w_range": [240, 300],
    "flour_pl_range": [0.50, 0.65],
    "hydration_pct_range": [60, 68],
    "salt_pct": 2.5,
    "oil_pct": 0,
    "fat_type": "none",
    "sugar_pct": 0,
    "fermentation_hours_range": [6, 16],
    "process_type": "direct"
  },
  "shape": {
    "shape_type": "round",
    "dough_weight_g": 200,
    "thickness_factor": 0.30,
    "diameter_cm": 22
  },
  "baking": {
    "oven_type_required": "home",
    "temp_c_range": [170, 185],
    "temp_c_ideal": 175,
    "cook_time_sec_range": [180, 300],
    "cook_time_sec_ideal": 240
  },
  "crust_type": "focaccia_soft",
  "hydration_category": "medium",
  "requires_wood_oven": false,
  "allows_additives": false,
  "requires_pre_ferment": false,
  "suitable_for_beginner": true
}`;

function buildAiPrompt(existingStyles: Record<string, PizzaStyle>): string {
  const styleList = Object.values(existingStyles)
    .map((s) => `  - ${s.id} (${s.name}, ${s.family})`)
    .join("\n");
  return `Crea un nuovo stile pizza per Vulcan Pizza Lab. Lo stile deve seguire esattamente lo schema JSON PizzaStyle.

STILI GIÀ PRESENTI NEL DATABASE (non duplicare):
${styleList}

SCHEMA JSON (tutti i campi sono obbligatori):
${PIZZA_STYLE_SCHEMA}

REGOLE DI COERENZA:
1. flour_w_range: [min, max] dove min < max, tipico 150-400
2. flour_pl_range: [min, max] dove min < max, tipico 0.40-0.80. Correlazione con W: P/L ≈ 0.3 + (W-150)×0.0015
3. hydration_pct_range: [min, max] dove min < max
4. hydration_category deve corrispondere al midpoint del range idratazione:
   - low: midpoint < 55%
   - medium: 55-70%
   - high: 70-85%
   - extreme: > 85%
5. temp_c_ideal DEVE essere dentro temp_c_range
6. cook_time_sec_ideal DEVE essere dentro cook_time_sec_range
7. Se fat_type = "none" allora oil_pct = 0
8. Se fat_type ≠ "none" allora oil_pct > 0
9. Se oven_type_required = "wood" allora requires_wood_oven = true
10. Se process_type contiene "biga" o "poolish" allora requires_pre_ferment = true
11. Se suitable_for_beginner = true, evitare: process_type con biga/poolish, hydration > 80%, W > 350
12. W alta (>320) + idratazione alta (>80%) = OK (glutine forte regge)
13. W bassa (<220) + idratazione alta (>75%) = ATTENZIONE (glutine debole)
14. Fermentazione > 24h tipicamente richiede W > 280

ESEMPIO DI STILE COMPLETO:
${PIZZA_STYLE_EXAMPLE}

FORMATO OUTPUT: Un singolo oggetto JSON valido (no commenti, no markdown, no backticks).
L'"id" deve essere in snake_case e unico rispetto agli stili già presenti.

STILE DA CREARE: [DESCRIVI QUI LO STILE]`;
}

/* ═══ COPY HELPER ═══ */
function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard) {
      return navigator.clipboard.writeText(text).then(() => true).catch(() => fallbackCopy(text));
    }
    return Promise.resolve(fallbackCopy(text));
  } catch {
    return Promise.resolve(fallbackCopy(text));
  }
}

function fallbackCopy(text: string): boolean {
  const ta = document.createElement("textarea");
  ta.value = text;
  ta.style.position = "fixed";
  ta.style.opacity = "0";
  document.body.appendChild(ta);
  ta.select();
  const ok = document.execCommand("copy");
  document.body.removeChild(ta);
  return ok;
}

/* ═══ COPYABLE CODE BLOCK ═══ */
function CodeBlock({ code, label, maxHeight = 300 }: { code: string; label: string; maxHeight?: number }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    copyToClipboard(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ border: "1px solid var(--container-border)" }}
    >
      <div
        className="flex items-center justify-between px-3 py-2"
        style={{
          background: "var(--surface-container)",
          borderBottom: "1px solid var(--container-border)",
        }}
      >
        <span
          className="type-data-xs"
          style={{ color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "var(--tracking-caps)" }}
        >
          {label}
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 px-2 py-1 rounded-lg type-data-xs active:scale-95 transition-transform"
          style={{
            fontWeight: "var(--weight-semibold)" as any,
            background: copied ? "color-mix(in srgb, var(--cta) 15%, transparent)" : "transparent",
            color: copied ? "var(--cta)" : "var(--text-muted)",
            border: "1px solid " + (copied ? "var(--cta)" : "var(--container-border)"),
          }}
          aria-label={`Copia ${label}`}
        >
          {copied ? <Check size={10} /> : <Copy size={10} />}
          {copied ? "Copiato!" : "Copia"}
        </button>
      </div>
      <pre
        className="overflow-auto p-3 type-code-sm"
        style={{
          background: "var(--container-bg)",
          lineHeight: "var(--leading-relaxed)",
          color: "var(--text-default)",
          maxHeight,
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
          margin: 0,
        }}
      >
        {code}
      </pre>
    </div>
  );
}

/* ═══ DB PIPELINE NODE ═══ */
function PipelineNode({
  icon,
  label,
  sublabel,
  color,
  active,
  count,
}: {
  icon: React.ReactNode;
  label: string;
  sublabel: string;
  color: string;
  active?: boolean;
  count?: number;
}) {
  return (
    <div
      className="flex items-center gap-2.5 px-3 py-2 rounded-xl flex-shrink-0"
      style={{
        background: active
          ? `color-mix(in srgb, ${color} 10%, transparent)`
          : "var(--surface-container-low)",
        border: `1px solid ${active ? `color-mix(in srgb, ${color} 30%, transparent)` : "var(--container-border)"}`,
      }}
    >
      <div
        className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{
          background: `color-mix(in srgb, ${color} 15%, transparent)`,
          color,
        }}
      >
        {icon}
      </div>
      <div className="min-w-0">
        <div className="type-data-sm" style={{ fontWeight: "var(--weight-semibold)" as any, color: "var(--text-default)", whiteSpace: "nowrap" }}>
          {label}
          {count !== undefined && (
            <span style={{ fontFeatureSettings: "'tnum'", color, marginLeft: "var(--space-1)" }}>{count}</span>
          )}
        </div>
        <div className="type-data-xs" style={{ color: "var(--text-muted)", whiteSpace: "nowrap" }}>
          {sublabel}
        </div>
      </div>
    </div>
  );
}

function PipelineArrow({ active }: { active?: boolean }) {
  return (
    <div className="flex items-center flex-shrink-0" style={{ color: active ? "var(--cta)" : "var(--text-muted)", opacity: active ? 1 : 0.4 }}>
      <ChevronRight size={14} />
    </div>
  );
}

/* ═══ SMART SINGLE-STYLE IMPORT ═══ */

interface ImportParseResult {
  ok: boolean;
  style?: PizzaStyle;
  error?: string;
  warnings: string[];
  autoFixes: string[];
}

function parseAndValidateImport(raw: string, existingIds: string[]): ImportParseResult {
  const warnings: string[] = [];
  const autoFixes: string[] = [];

  // Strip markdown code fences if present
  let cleaned = raw.trim();
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(?:json)?\s*\n?/, "").replace(/\n?```\s*$/, "");
  }

  let parsed: any;
  try {
    parsed = JSON.parse(cleaned);
  } catch (e: any) {
    return { ok: false, error: `JSON non valido: ${e.message}`, warnings, autoFixes };
  }

  // If it's an object with a single key that contains an object, unwrap it
  if (typeof parsed === "object" && parsed !== null && !Array.isArray(parsed)) {
    const keys = Object.keys(parsed);
    if (keys.length === 1 && typeof parsed[keys[0]] === "object" && parsed[keys[0]] !== null && parsed[keys[0]].name) {
      parsed = parsed[keys[0]];
      if (!parsed.id) parsed.id = keys[0];
      autoFixes.push("Estratto stile dal wrapper oggetto");
    }
  }

  // If it's an array, take first element
  if (Array.isArray(parsed)) {
    if (parsed.length === 0) return { ok: false, error: "Array vuoto", warnings, autoFixes };
    parsed = parsed[0];
    autoFixes.push("Preso primo elemento dall'array");
  }

  // Required fields check
  const required = ["name", "family", "dough", "shape", "baking", "crust_type"];
  const missing = required.filter((f) => !(f in parsed));
  if (missing.length > 0) {
    return { ok: false, error: `Campi obbligatori mancanti: ${missing.join(", ")}`, warnings, autoFixes };
  }

  // Auto-generate ID if missing
  if (!parsed.id || typeof parsed.id !== "string") {
    parsed.id = `custom_${parsed.name.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "")}`;
    autoFixes.push(`ID generato automaticamente: "${parsed.id}"`);
  }

  // Deduplicate ID
  if (existingIds.includes(parsed.id)) {
    const orig = parsed.id;
    parsed.id = `${parsed.id}_${Date.now().toString(36)}`;
    autoFixes.push(`ID "${orig}" già esistente, rinominato in "${parsed.id}"`);
  }

  // Auto-fill missing optional fields
  if (!parsed.emoji) { parsed.emoji = "🧪"; autoFixes.push("Emoji default: 🧪"); }
  if (!parsed.origin) { parsed.origin = ""; autoFixes.push("Origine impostata a stringa vuota"); }
  if (!parsed.description) { parsed.description = ""; autoFixes.push("Descrizione impostata a stringa vuota"); }
  if (!parsed.key_characteristics) { parsed.key_characteristics = []; autoFixes.push("Caratteristiche chiave: array vuoto"); }
  if (parsed.hydration_category === undefined) {
    const mid = parsed.dough?.hydration_pct_range ? (parsed.dough.hydration_pct_range[0] + parsed.dough.hydration_pct_range[1]) / 2 : 60;
    parsed.hydration_category = mid < 55 ? "low" : mid <= 70 ? "medium" : mid <= 85 ? "high" : "extreme";
    autoFixes.push(`hydration_category calcolata: "${parsed.hydration_category}"`);
  }
  if (parsed.requires_wood_oven === undefined) {
    parsed.requires_wood_oven = parsed.baking?.oven_type_required === "wood";
    autoFixes.push(`requires_wood_oven: ${parsed.requires_wood_oven}`);
  }
  if (parsed.allows_additives === undefined) {
    parsed.allows_additives = (parsed.dough?.oil_pct > 0 || parsed.dough?.sugar_pct > 0);
    autoFixes.push(`allows_additives: ${parsed.allows_additives}`);
  }
  if (parsed.requires_pre_ferment === undefined) {
    const pt = parsed.dough?.process_type || "";
    parsed.requires_pre_ferment = /biga|poolish/i.test(pt);
    autoFixes.push(`requires_pre_ferment: ${parsed.requires_pre_ferment}`);
  }
  if (parsed.suitable_for_beginner === undefined) {
    parsed.suitable_for_beginner = true;
    autoFixes.push("suitable_for_beginner default: true");
  }

  // Validate sub-objects
  if (!parsed.dough || typeof parsed.dough !== "object") {
    return { ok: false, error: "Oggetto 'dough' mancante o non valido", warnings, autoFixes };
  }
  if (!parsed.shape || typeof parsed.shape !== "object") {
    return { ok: false, error: "Oggetto 'shape' mancante o non valido", warnings, autoFixes };
  }
  if (!parsed.baking || typeof parsed.baking !== "object") {
    return { ok: false, error: "Oggetto 'baking' mancante o non valido", warnings, autoFixes };
  }

  // Fill dough defaults
  const d = parsed.dough;
  if (!d.flour_w_range) { d.flour_w_range = [250, 320]; autoFixes.push("flour_w_range default: [250,320]"); }
  if (!d.flour_pl_range) { d.flour_pl_range = [0.50, 0.65]; autoFixes.push("flour_pl_range default: [0.50,0.65]"); }
  if (!d.hydration_pct_range) { d.hydration_pct_range = [60, 70]; autoFixes.push("hydration_pct_range default: [60,70]"); }
  if (d.salt_pct === undefined) { d.salt_pct = 2.5; autoFixes.push("salt_pct default: 2.5"); }
  if (d.oil_pct === undefined) { d.oil_pct = 0; autoFixes.push("oil_pct default: 0"); }
  if (!d.fat_type) { d.fat_type = d.oil_pct > 0 ? "oil" : "none"; autoFixes.push(`fat_type: "${d.fat_type}"`); }
  if (d.sugar_pct === undefined) { d.sugar_pct = 0; autoFixes.push("sugar_pct default: 0"); }
  if (!d.fermentation_hours_range) { d.fermentation_hours_range = [8, 24]; autoFixes.push("fermentation default: [8,24]"); }
  if (!d.process_type) { d.process_type = "direct"; autoFixes.push("process_type default: direct"); }

  // Fill shape defaults
  const sh = parsed.shape;
  if (!sh.shape_type) { sh.shape_type = "round"; autoFixes.push("shape_type default: round"); }
  if (!sh.dough_weight_g) { sh.dough_weight_g = 270; autoFixes.push("dough_weight_g default: 270"); }
  if (sh.thickness_factor === undefined) { sh.thickness_factor = 0.34; autoFixes.push("thickness_factor default: 0.34"); }

  // Fill baking defaults
  const b = parsed.baking;
  if (!b.oven_type_required) { b.oven_type_required = "home"; autoFixes.push("oven_type default: home"); }
  if (!b.temp_c_range) { b.temp_c_range = [220, 280]; autoFixes.push("temp_c_range default: [220,280]"); }
  if (b.temp_c_ideal === undefined) { b.temp_c_ideal = Math.round((b.temp_c_range[0] + b.temp_c_range[1]) / 2); autoFixes.push(`temp_c_ideal: ${b.temp_c_ideal}`); }
  if (!b.cook_time_sec_range) { b.cook_time_sec_range = [300, 600]; autoFixes.push("cook_time_sec_range default: [300,600]"); }
  if (b.cook_time_sec_ideal === undefined) { b.cook_time_sec_ideal = Math.round((b.cook_time_sec_range[0] + b.cook_time_sec_range[1]) / 2); autoFixes.push(`cook_time_sec_ideal: ${b.cook_time_sec_ideal}`); }

  // Quick coherence warnings
  if (b.temp_c_ideal < b.temp_c_range[0] || b.temp_c_ideal > b.temp_c_range[1]) {
    warnings.push(`temp_c_ideal (${b.temp_c_ideal}) fuori dal range [${b.temp_c_range}]`);
  }
  if (b.cook_time_sec_ideal < b.cook_time_sec_range[0] || b.cook_time_sec_ideal > b.cook_time_sec_range[1]) {
    warnings.push(`cook_time_sec_ideal (${b.cook_time_sec_ideal}) fuori dal range [${b.cook_time_sec_range}]`);
  }
  const wMid = (d.flour_w_range[0] + d.flour_w_range[1]) / 2;
  const hMid = (d.hydration_pct_range[0] + d.hydration_pct_range[1]) / 2;
  if (wMid < 220 && hMid > 75) {
    warnings.push(`W bassa (${Math.round(wMid)}) + idratazione alta (${Math.round(hMid)}%) — possibile glutine debole`);
  }

  return { ok: true, style: parsed as PizzaStyle, warnings, autoFixes };
}

/* ═══ DIFF VIEWER ═══ */

interface DiffRow {
  label: string;
  path: string;
  original: string;
  current: string;
  changed: boolean;
  section: "identity" | "dough" | "shape" | "baking" | "classification";
}

function buildDiffRows(id: string, current: PizzaStyle): DiffRow[] {
  const original = STYLES_DB[id];
  if (!original) return [];

  const rows: DiffRow[] = [];

  function add(label: string, path: string, origVal: any, curVal: any, section: DiffRow["section"]) {
    const o = typeof origVal === "object" ? JSON.stringify(origVal) : String(origVal ?? "—");
    const c = typeof curVal === "object" ? JSON.stringify(curVal) : String(curVal ?? "—");
    rows.push({ label, path, original: o, current: c, changed: o !== c, section });
  }

  // Identity
  add("Nome", "name", original.name, current.name, "identity");
  add("Famiglia", "family", original.family, current.family, "identity");
  add("Origine", "origin", original.origin, current.origin, "identity");
  add("Emoji", "emoji", original.emoji, current.emoji, "identity");
  add("Descrizione", "description", original.description, current.description, "identity");

  // Dough
  add("W range", "dough.flour_w_range", original.dough.flour_w_range, current.dough.flour_w_range, "dough");
  add("P/L range", "dough.flour_pl_range", original.dough.flour_pl_range, current.dough.flour_pl_range, "dough");
  add("Idratazione range", "dough.hydration_pct_range", original.dough.hydration_pct_range, current.dough.hydration_pct_range, "dough");
  add("Sale %", "dough.salt_pct", original.dough.salt_pct, current.dough.salt_pct, "dough");
  add("Grasso %", "dough.oil_pct", original.dough.oil_pct, current.dough.oil_pct, "dough");
  add("Tipo grasso", "dough.fat_type", original.dough.fat_type, current.dough.fat_type, "dough");
  add("Zucchero %", "dough.sugar_pct", original.dough.sugar_pct, current.dough.sugar_pct, "dough");
  add("Fermentazione h", "dough.fermentation_hours_range", original.dough.fermentation_hours_range, current.dough.fermentation_hours_range, "dough");
  add("Processo", "dough.process_type", original.dough.process_type, current.dough.process_type, "dough");

  // Shape
  add("Forma", "shape.shape_type", original.shape.shape_type, current.shape.shape_type, "shape");
  add("Peso panetto g", "shape.dough_weight_g", original.shape.dough_weight_g, current.shape.dough_weight_g, "shape");
  add("Spessore", "shape.thickness_factor", original.shape.thickness_factor, current.shape.thickness_factor, "shape");
  add("Diametro cm", "shape.diameter_cm", original.shape.diameter_cm, current.shape.diameter_cm, "shape");
  add("Lunghezza cm", "shape.length_cm", original.shape.length_cm, current.shape.length_cm, "shape");
  add("Larghezza cm", "shape.width_cm", original.shape.width_cm, current.shape.width_cm, "shape");

  // Baking
  add("Forno richiesto", "baking.oven_type_required", original.baking.oven_type_required, current.baking.oven_type_required, "baking");
  add("Temp °C range", "baking.temp_c_range", original.baking.temp_c_range, current.baking.temp_c_range, "baking");
  add("Temp °C ideale", "baking.temp_c_ideal", original.baking.temp_c_ideal, current.baking.temp_c_ideal, "baking");
  add("Tempo sec range", "baking.cook_time_sec_range", original.baking.cook_time_sec_range, current.baking.cook_time_sec_range, "baking");
  add("Tempo sec ideale", "baking.cook_time_sec_ideal", original.baking.cook_time_sec_ideal, current.baking.cook_time_sec_ideal, "baking");

  // Classification
  add("Tipo crosta", "crust_type", original.crust_type, current.crust_type, "classification");
  add("Cat. idratazione", "hydration_category", original.hydration_category, current.hydration_category, "classification");
  add("Richiede legna", "requires_wood_oven", original.requires_wood_oven, current.requires_wood_oven, "classification");
  add("Additivi permessi", "allows_additives", original.allows_additives, current.allows_additives, "classification");
  add("Pre-fermento", "requires_pre_ferment", original.requires_pre_ferment, current.requires_pre_ferment, "classification");
  add("Beginner", "suitable_for_beginner", original.suitable_for_beginner, current.suitable_for_beginner, "classification");

  return rows;
}

const DIFF_SECTION_LABELS: Record<DiffRow["section"], { label: string; icon: React.ReactNode }> = {
  identity: { label: "Identità", icon: <Wheat size={11} /> },
  dough: { label: "Impasto", icon: <FlaskConical size={11} /> },
  shape: { label: "Forma", icon: <CircleDot size={11} /> },
  baking: { label: "Cottura", icon: <Flame size={11} /> },
  classification: { label: "Classificazione", icon: <Database size={11} /> },
};

/* ═══ MAIN EXPORT ═══ */
export function StyleEditorTab() {
  const { stylesOverride, setStylesOverride } = useStylesOverride();

  /* Local editing state — initialized from context or STYLES_DB */
  const [stylesMap, setStylesMapLocal] = useState<Record<string, PizzaStyle>>(() =>
    deepClone(stylesOverride ?? STYLES_DB),
  );
  /* When context changes externally, sync local state */

  /* Wrap setter to also push to context */
  const setStylesMap = useCallback(
    (updater: Record<string, PizzaStyle> | ((prev: Record<string, PizzaStyle>) => Record<string, PizzaStyle>)) => {
      setStylesMapLocal((prev) => {
        const next = typeof updater === "function" ? updater(prev) : updater;
        return next;
      });
    },
    [],
  );

  /* Push / pull to main app — default to ON so edits flow to home immediately */
  const [liveSync, setLiveSync] = useState(true);

  const pushToApp = useCallback(() => {
    setStylesOverride(deepClone(stylesMap));
    setLiveSync(true);
  }, [stylesMap, setStylesOverride]);

  const pullFromApp = useCallback(() => {
    setStylesOverride(null);
    // Reset core styles but keep any custom styles the user created
    setStylesMapLocal((prev) => {
      const next: Record<string, PizzaStyle> = deepClone(STYLES_DB);
      for (const [id, s] of Object.entries(prev)) {
        if (!STYLES_DB[id]) next[id] = deepClone(s);
      }
      return next;
    });
    setLiveSync(false);
  }, [setStylesOverride]);

  /* When liveSync is on, push every edit to context */
  useEffect(() => {
    if (liveSync) {
      setStylesOverride(deepClone(stylesMap));
    }
  }, [stylesMap, liveSync, setStylesOverride]);

  const styleIds = useMemo(() => Object.keys(stylesMap), [stylesMap]);
  const [selectedId, setSelectedId] = useState(styleIds[0]);
  const [copied, setCopied] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [importJson, setImportJson] = useState("");
  const [showPipeline, setShowPipeline] = useState(false);
  const [showSchema, setShowSchema] = useState(false);
  const [showDiff, setShowDiff] = useState(false);
  const [smartImportJson, setSmartImportJson] = useState("");
  const [smartImportResult, setSmartImportResult] = useState<ImportParseResult | null>(null);
  const [smartImportDone, setSmartImportDone] = useState(false);

  /* Editor mode: edit vs tools */
  const [editorMode, setEditorMode] = useState<"edit" | "tools">("edit");

  /* Preview constraints */
  const [previewOven, setPreviewOven] = useState<OvenType>("home");
  const [previewTemp, setPreviewTemp] = useState(250);
  const [previewSkill, setPreviewSkill] = useState<SkillLevel>(2);

  const style = stylesMap[selectedId];

  /* Update helper — immutable update of one style field */
  const update = useCallback(
    (fn: (s: PizzaStyle) => void) => {
      setStylesMap((prev) => {
        const next = deepClone(prev);
        fn(next[selectedId]);
        return next;
      });
    },
    [selectedId],
  );

  /* Live recipe generation */
  const constraints: UserConstraints = useMemo(
    () => ({
      oven_type: previewOven,
      oven_max_temp_c: previewTemp,
      skill_level: previewSkill,
      available_hours: 24,
      dough_balls: 4,
      has_mixer: false,
      has_pizza_stone: true,
      has_pizza_steel: false,
      has_baking_pan: true,
      dietary_filters: [],
      pantry_flours: ["00", "manitoba"],
      pantry_yeasts: ["fresh", "dry"],
    }),
    [previewOven, previewTemp, previewSkill],
  );

  const recipe = useMemo(() => {
    if (!style) return null;
    try {
      return generateRecipe(style, constraints);
    } catch {
      return null;
    }
  }, [style, constraints]);

  /* Reset single style */
  const resetStyle = () => {
    if (STYLES_DB[selectedId]) {
      setStylesMap((prev) => {
        const next = deepClone(prev);
        next[selectedId] = deepClone(STYLES_DB[selectedId]);
        return next;
      });
    }
  };

  /* Reset all core styles to original (preserve customs) */
  const resetAll = () => {
    setStylesMap((prev) => {
      const next: Record<string, PizzaStyle> = {};
      // Restore all originals from STYLES_DB
      for (const [id, s] of Object.entries(STYLES_DB)) {
        next[id] = deepClone(s);
      }
      // Preserve custom styles (not in STYLES_DB)
      for (const [id, s] of Object.entries(prev)) {
        if (!STYLES_DB[id]) {
          next[id] = deepClone(s);
        }
      }
      return next;
    });
  };

  /* Add new style */
  const addNewStyle = () => {
    const id = `custom_${Date.now()}`;
    const base = deepClone(STYLES_DB["napoletana_stg"]);
    base.id = id;
    base.name = "Nuovo Stile";
    base.description = "Descrizione del nuovo stile";
    base.emoji = "🧪";
    setStylesMap((prev) => ({ ...prev, [id]: base }));
    setSelectedId(id);
  };

  /* Delete custom style */
  const deleteStyle = () => {
    if (STYLES_DB[selectedId]) return; /* Can't delete originals */
    setStylesMap((prev) => {
      const next = { ...prev };
      delete next[selectedId];
      return next;
    });
    setSelectedId(styleIds[0]);
  };

  /* Export JSON */
  const exportJson = () => {
    const json = JSON.stringify(stylesMap, null, 2);
    try {
      navigator.clipboard.writeText(json);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* Fallback textarea copy */
      const ta = document.createElement("textarea");
      ta.value = json;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  /* Import JSON */
  const doImport = () => {
    try {
      const parsed = JSON.parse(importJson);
      if (typeof parsed === "object" && parsed !== null) {
        setStylesMap(parsed);
        setSelectedId(Object.keys(parsed)[0]);
        setImportOpen(false);
        setImportJson("");
      }
    } catch {
      /* ignore parse errors */
    }
  };

  /* Smart import handlers */
  const handleSmartImportParse = useCallback(() => {
    const result = parseAndValidateImport(smartImportJson, Object.keys(stylesMap));
    setSmartImportResult(result);
    setSmartImportDone(false);
  }, [smartImportJson, stylesMap]);

  const handleSmartImportApply = useCallback(() => {
    if (!smartImportResult?.ok || !smartImportResult.style) return;
    const s = smartImportResult.style;
    setStylesMap((prev) => ({ ...prev, [s.id]: s }));
    setSelectedId(s.id);
    setSmartImportDone(true);
    setSmartImportJson("");
    setTimeout(() => {
      setSmartImportResult(null);
      setSmartImportDone(false);
    }, 3000);
  }, [smartImportResult, setStylesMap]);

  const handleSmartImportPaste = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText();
      setSmartImportJson(text);
      // Auto-parse after paste
      const result = parseAndValidateImport(text, Object.keys(stylesMap));
      setSmartImportResult(result);
      setSmartImportDone(false);
    } catch {
      // Clipboard read failed — user must paste manually
    }
  }, [stylesMap]);

  /* Dynamic AI prompt */
  const aiPrompt = useMemo(() => buildAiPrompt(stylesMap), [stylesMap]);

  /* Diff rows for modified styles */
  const diffRows = useMemo(() => {
    if (!style || !STYLES_DB[selectedId]) return [];
    return buildDiffRows(selectedId, style);
  }, [selectedId, style]);
  const changedRows = diffRows.filter((r) => r.changed);

  if (!style) return null;

  const isCustom = !STYLES_DB[selectedId];
  const currentStatus = getStyleStatus(selectedId, style);
  const modifiedFields = currentStatus === "modified" ? getModifiedFields(selectedId, style) : [];

  /* ═══ STYLES SUMMARY ═══ */
  const stylesSummary = useMemo(() => {
    let originals = 0, modified = 0, customs = 0;
    for (const id of Object.keys(stylesMap)) {
      const st = getStyleStatus(id, stylesMap[id]);
      if (st === "original") originals++;
      else if (st === "modified") modified++;
      else customs++;
    }
    return { originals, modified, customs, total: originals + modified + customs };
  }, [stylesMap]);

  /* ═══ VALIDATION ═══ */
  const validationIssues = useMemo(() => validateStyle(style), [style]);
  const errorCount = validationIssues.filter((i) => i.severity === "error").length;
  const warnCount = validationIssues.filter((i) => i.severity === "warn").length;
  const infoCount = validationIssues.filter((i) => i.severity === "info").length;

  const countIssuesFor = useCallback((fieldPrefixes: string[]) => {
    const matching = validationIssues.filter((i) =>
      fieldPrefixes.some((p) => i.field.startsWith(p)),
    );
    return {
      errors: matching.filter((i) => i.severity === "error").length,
      warnings: matching.filter((i) => i.severity === "warn").length,
    };
  }, [validationIssues]);

  const identityIssues = countIssuesFor(["name", "id", "family", "origin"]);
  const doughIssues = countIssuesFor(["dough."]);
  const shapeIssues = countIssuesFor(["shape."]);
  const bakingIssues = countIssuesFor(["baking."]);
  const classIssues = countIssuesFor(["crust_type", "hydration_category", "requires_", "suitable_", "allows_"]);

  return (
    <div className="flex flex-col gap-5">
      {/* ═══ Live Sync Banner ═══ */}
      <Surface
        className="p-4 flex items-center justify-between"
        style={{
          borderLeft: liveSync
            ? "3px solid var(--cta)"
            : "3px solid var(--container-border)",
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
            style={{
              background: liveSync ? "var(--cta)" : "var(--text-muted)",
              boxShadow: liveSync ? "0 0 8px var(--cta)" : "none",
            }}
          />
          <div>
            <div
              className="type-data-field"
              style={{
                fontWeight: "var(--weight-semibold)" as any,
                color: "var(--text-default)",
              }}
            >
              {liveSync ? "Sincronizzazione attiva" : "Modalita isolata"}
            </div>
            <div
              className="type-data-sm"
              style={{
                color: "var(--text-muted)",
              }}
            >
              {liveSync
                ? `Le modifiche si riflettono nella home in tempo reale${
                    stylesSummary.modified + stylesSummary.customs > 0
                      ? ` — ${stylesSummary.modified + stylesSummary.customs} stili attivi nell'app`
                      : ""
                  }`
                : "Le modifiche restano solo nell'editor — premi \"Attiva\" per iniettarle nell'app"}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0 ml-4">
          {liveSync ? (
            <button
              onClick={pullFromApp}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl type-data-base active:scale-95 transition-transform"
              style={{
                background: "color-mix(in srgb, var(--text-error) 10%, transparent)",
                color: "var(--text-error)",
                border: "1px solid color-mix(in srgb, var(--text-error) 25%, transparent)",
                fontWeight: "var(--weight-semibold)" as any,
              }}
              aria-label="Disattiva sincronizzazione"
            >
              <X size={13} /> Disattiva
            </button>
          ) : (
            <button
              onClick={pushToApp}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl type-data-base active:scale-95 transition-transform"
              style={{
                background: "var(--cta)",
                color: "white",
                border: "none",
                fontWeight: "var(--weight-semibold)" as any,
              }}
              aria-label="Attiva sincronizzazione con app"
            >
              <Check size={13} /> Attiva
            </button>
          )}
        </div>
      </Surface>

      {/* ═══ MODE SELECTOR ═══ */}
      <div className="flex gap-1.5 p-1.5 rounded-2xl" style={{ background: "var(--surface-container)" }}>
        {([
          { id: "edit" as const, label: "Modifica", icon: <Database size={13} />, color: "var(--cta)" },
          { id: "tools" as const, label: "Strumenti", icon: <Wrench size={13} />, color: "var(--tertiary)" },
        ]).map((m) => (
          <button
            key={m.id}
            onClick={() => setEditorMode(m.id)}
            className="flex items-center gap-2 flex-1 justify-center px-4 py-3 rounded-xl type-data-base active:scale-[0.98] transition-transform"
            style={{
              background: editorMode === m.id ? "var(--container-page)" : "transparent",
              color: editorMode === m.id ? "var(--text-default)" : "var(--text-muted)",
              fontWeight: editorMode === m.id ? "var(--weight-semibold)" : "var(--weight-medium)" as any,
              boxShadow: editorMode === m.id ? "var(--shadow-sm)" : "none",
              borderBottom: editorMode === m.id ? `2px solid ${m.color}` : "2px solid transparent",
            }}
          >
            <span style={{ color: editorMode === m.id ? m.color : "var(--text-muted)" }}>{m.icon}</span>
            {m.label}
            {m.id === "tools" && (stylesSummary.modified > 0 || stylesSummary.customs > 0) && (
              <Badge size="xs" tone="tertiary">
                {stylesSummary.modified + stylesSummary.customs}
              </Badge>
            )}
            {m.id === "edit" && validationIssues.length > 0 && (
              <Badge size="xs" tone={errorCount > 0 ? "error" : "warning"}>
                {validationIssues.length}
              </Badge>
            )}
          </button>
        ))}
      </div>

      {/* ═══ TOOLS MODE ═══ */}
      <AnimatePresence mode="wait">
      {editorMode === "tools" && (
      <motion.div
        key="tools"
        className="flex flex-col gap-5"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      >

      {/* Styles Summary Strip */}
      {(stylesSummary.modified > 0 || stylesSummary.customs > 0) && (
        <div
          className="flex items-center gap-3 px-4 py-2.5 rounded-xl"
          style={{
            background: "color-mix(in srgb, var(--tertiary) 8%, transparent)",
            border: "1px solid color-mix(in srgb, var(--tertiary) 20%, transparent)",
          }}
        >
          <div className="flex items-center gap-2 flex-1 flex-wrap">
            <span className="type-data-sm" style={{ color: "var(--text-default)", fontWeight: "var(--weight-semibold)" as any }}>
              {stylesSummary.total} stili totali:
            </span>
            <Badge size="xs" tone="cta">
              {stylesSummary.originals} originali
            </Badge>
            {stylesSummary.modified > 0 && (
              <Badge size="xs" tone="tertiary">
                {stylesSummary.modified} modificati
              </Badge>
            )}
            {stylesSummary.customs > 0 && (
              <Badge size="xs" tone="primary">
                {stylesSummary.customs} custom
              </Badge>
            )}
          </div>
          {stylesSummary.modified > 0 && (
            <button
              onClick={resetAll}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg type-data-xs active:scale-95 transition-transform flex-shrink-0"
              style={{ fontWeight: "var(--weight-semibold)" as any, background: "color-mix(in srgb, var(--text-error) 10%, transparent)", color: "var(--text-error)", border: "1px solid color-mix(in srgb, var(--text-error) 20%, transparent)" }}
              aria-label="Ripristina tutti gli stili originali"
            >
              <RotateCcw size={10} /> Reset tutti
            </button>
          )}
        </div>
      )}

      {/* ═══ DB Pipeline + Schema ═══ */}
      <div className="flex flex-col gap-3">
        {/* DB Pipeline visualization */}
        <Surface
          className="p-4"
          style={{ borderLeft: "3px solid var(--secondary)" }}
        >
          <button
            onClick={() => setShowPipeline(!showPipeline)}
            className="w-full flex items-center justify-between active:scale-[0.99] transition-transform"
            style={{ background: "transparent" }}
          >
            <div className="flex items-center gap-2.5">
              <Link2 size={14} style={{ color: "var(--secondary)" }} />
              <span className="type-data-field" style={{ fontWeight: "var(--weight-semibold)" as any, color: "var(--text-default)" }}>
                Pipeline dati
              </span>
              <Badge size="xs" tone={liveSync ? "cta" : "muted"}>
                {liveSync ? "LIVE" : "OFF"}
              </Badge>
            </div>
            <motion.div
              animate={{ rotate: showPipeline ? 180 : 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            >
              <ChevronDown size={14} style={{ color: "var(--icon-muted)" }} />
            </motion.div>
          </button>
          <AnimatePresence>
            {showPipeline && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                className="overflow-hidden"
              >
                <div className="pt-4">
                  {/* Pipeline diagram */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-2" style={{ scrollbarWidth: "var(--scrollbar-width-thin)" as any }}>
                    <PipelineNode
                      icon={<Database size={13} />}
                      label="STYLES_DB"
                      sublabel={`${Object.keys(STYLES_DB).length} stili core`}
                      color="var(--secondary)"
                      active
                      count={Object.keys(STYLES_DB).length}
                    />
                    <PipelineArrow active />
                    <PipelineNode
                      icon={<Wheat size={13} />}
                      label="Editor"
                      sublabel={`${stylesSummary.modified} mod · ${stylesSummary.customs} custom`}
                      color="var(--tertiary)"
                      active
                      count={stylesSummary.total}
                    />
                    <PipelineArrow active={liveSync} />
                    <PipelineNode
                      icon={<Link2 size={13} />}
                      label="Override Context"
                      sublabel={liveSync ? "Attivo — push automatico" : "Inattivo — premi Attiva"}
                      color="var(--cta)"
                      active={liveSync}
                    />
                    <PipelineArrow active={liveSync} />
                    <PipelineNode
                      icon={<ArrowRight size={13} />}
                      label="Home / Stili"
                      sublabel={liveSync ? "Riceve dati live" : "Usa STYLES_DB default"}
                      color="var(--primary)"
                      active={liveSync}
                    />
                  </div>

                  {/* Explanation text */}
                  <div
                    className="mt-3 p-3 rounded-lg"
                    style={{ background: "var(--container-bg)", border: "1px solid var(--container-border)" }}
                  >
                    <div className="flex flex-col gap-1.5">
                      <div className="type-data-sm" style={{ color: "var(--text-default)", lineHeight: "var(--leading-relaxed)" }}>
                        <span style={{ fontWeight: "var(--weight-semibold)" as any }}>Come funziona:</span>{" "}
                        I {Object.keys(STYLES_DB).length} stili in <span className="font-mono" style={{ color: "var(--secondary)" }}>STYLES_DB</span> sono
                        il database immutabile di riferimento (pizza-engine.ts). L'editor carica una copia locale modificabile.
                      </div>
                      <div className="type-data-sm" style={{ color: "var(--text-default)", lineHeight: "var(--leading-relaxed)" }}>
                        <span style={{ fontWeight: "var(--weight-semibold)" as any }}>Sync attivo:</span>{" "}
                        ogni modifica viene pushata al <span className="font-mono" style={{ color: "var(--cta)" }}>StylesOverrideContext</span>,
                        che la Home e RecommendedStyles leggono al posto di STYLES_DB. Persistenza in localStorage.
                      </div>
                      <div className="type-data-sm" style={{ color: "var(--text-default)", lineHeight: "var(--leading-relaxed)" }}>
                        <span style={{ fontWeight: "var(--weight-semibold)" as any }}>Ripristino:</span>{" "}
                        ogni stile core ha il bottone "Ripristina originale" che lo riporta alla versione in STYLES_DB.
                        "Reset tutti" ripristina tutti i core ma preserva i custom.
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Surface>

        {/* Schema & Instructions */}
        <Surface
          className="p-4"
          style={{ borderLeft: "3px solid var(--tertiary)" }}
        >
          <button
            onClick={() => setShowSchema(!showSchema)}
            className="w-full flex items-center justify-between active:scale-[0.99] transition-transform"
            style={{ background: "transparent" }}
          >
            <div className="flex items-center gap-2.5">
              <FileJson size={14} style={{ color: "var(--tertiary)" }} />
              <span className="type-data-field" style={{ fontWeight: "var(--weight-semibold)" as any, color: "var(--text-default)" }}>
                Schema JSON &amp; Istruzioni
              </span>
            </div>
            <motion.div
              animate={{ rotate: showSchema ? 180 : 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            >
              <ChevronDown size={14} style={{ color: "var(--icon-muted)" }} />
            </motion.div>
          </button>
          <AnimatePresence>
            {showSchema && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                className="overflow-hidden"
              >
                <div className="pt-4 flex flex-col gap-4">
                  {/* Schema block */}
                  <div>
                    <div className="type-data-sm mb-2" style={{ fontWeight: "var(--weight-semibold)" as any, color: "var(--text-default)" }}>
                      <BookOpen size={12} style={{ display: "inline", verticalAlign: "-1px", marginRight: "var(--space-1-5)" }} />
                      Schema PizzaStyle completo
                    </div>
                    <CodeBlock code={PIZZA_STYLE_SCHEMA} label="schema — PizzaStyle" maxHeight={320} />
                  </div>

                  {/* Validation rules summary */}
                  <div>
                    <div className="type-data-sm mb-2" style={{ fontWeight: "var(--weight-semibold)" as any, color: "var(--text-default)" }}>
                      <AlertTriangle size={12} style={{ display: "inline", verticalAlign: "-1px", marginRight: "var(--space-1-5)" }} />
                      Regole di coerenza (validate automaticamente)
                    </div>
                    <div
                      className="rounded-xl p-3"
                      style={{ background: "var(--container-bg)", border: "1px solid var(--container-border)" }}
                    >
                      <div className="flex flex-col gap-1">
                        {[
                          { sev: "error", rules: [
                            "Range invertiti (min > max) su idratazione, W, P/L, fermentazione, temperatura, tempo cottura",
                            "temp_c_ideal fuori da temp_c_range",
                            "cook_time_sec_ideal fuori da cook_time_sec_range",
                            "Nome vuoto o ID vuoto",
                          ]},
                          { sev: "warn", rules: [
                            "fat_type ≠ 'none' ma oil_pct = 0 (o viceversa)",
                            "oven_type = 'wood' ma requires_wood_oven = false",
                            "hydration_category non corrisponde al midpoint del range",
                            "W bassa (<220) + idratazione alta (>75%) — glutine debole",
                            "W bassa (<250) + fermentazione lunga (>36h) — sovra-fermentazione",
                            "suitable_for_beginner = true ma process_type include biga/poolish",
                            "process_type include biga/poolish ma requires_pre_ferment = false",
                          ]},
                          { sev: "info", rules: [
                            "Forma rectangular/oval senza length_cm o width_cm",
                            "Forma round senza diameter_cm",
                          ]},
                        ].map(({ sev, rules }) => (
                          <div key={sev} className="flex flex-col gap-0.5 mb-1.5">
                            <Badge
                              tone={sev === "error" ? "error" : sev === "warn" ? "warning" : "cta"}
                              size="xs"
                              style={{
                                alignSelf: "flex-start",
                              }}
                            >
                              {sev === "error" ? "ERRORI" : sev === "warn" ? "WARNING" : "INFO"}
                            </Badge>
                            {rules.map((r, i) => (
                              <div key={i} className="type-data-sm" style={{ color: "var(--text-muted)", paddingLeft: "var(--space-2)", lineHeight: "var(--leading-relaxed)" }}>
                                • {r}
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Example */}
                  <div>
                    <div className="type-data-sm mb-2" style={{ fontWeight: "var(--weight-semibold)" as any, color: "var(--text-default)" }}>
                      <Database size={12} style={{ display: "inline", verticalAlign: "-1px", marginRight: "var(--space-1-5)" }} />
                      Esempio completo — Pizza Fritta Napoletana
                    </div>
                    <CodeBlock code={PIZZA_STYLE_EXAMPLE} label="esempio — pizza_fritta_napoletana" maxHeight={280} />
                  </div>

                  {/* AI Prompt */}
                  <div>
                    <div className="type-data-sm mb-2" style={{ fontWeight: "var(--weight-semibold)" as any, color: "var(--text-default)" }}>
                      <Zap size={12} style={{ display: "inline", verticalAlign: "-1px", marginRight: "var(--space-1-5)" }} />
                      Prompt per creare nuovi stili (AI-ready)
                    </div>
                    <div
                      className="type-data-sm mb-2 p-3 rounded-lg"
                      style={{ color: "var(--text-muted)", background: "color-mix(in srgb, var(--tertiary) 5%, transparent)", border: "1px solid color-mix(in srgb, var(--tertiary) 15%, transparent)", lineHeight: "var(--leading-relaxed)" }}
                    >
                      Copia questo prompt, incollalo in ChatGPT/Claude/Gemini e sostituisci "[DESCRIVI QUI LO STILE]" con la pizza desiderata. Il JSON risultante può essere importato direttamente nell'editor.
                    </div>
                    <CodeBlock code={aiPrompt} label="prompt — generazione stile AI" maxHeight={280} />
                  </div>

                  {/* Current style export */}
                  <div>
                    <div className="type-data-sm mb-2" style={{ fontWeight: "var(--weight-semibold)" as any, color: "var(--text-default)" }}>
                      <Copy size={12} style={{ display: "inline", verticalAlign: "-1px", marginRight: "var(--space-1-5)" }} />
                      Stile corrente come JSON (singolo)
                    </div>
                    <CodeBlock
                      code={JSON.stringify(style, null, 2)}
                      label={`${style.emoji} ${style.name}`}
                      maxHeight={300}
                    />
                  </div>

                  {/* ═══ SMART IMPORT ═══ */}
                  <div
                    className="rounded-xl overflow-hidden"
                    style={{
                      border: smartImportDone
                        ? "2px solid var(--cta)"
                        : smartImportResult?.ok === false
                          ? "2px solid var(--text-error)"
                          : "2px dashed var(--outline-variant)",
                      background: smartImportDone
                        ? "color-mix(in srgb, var(--cta) 5%, transparent)"
                        : "var(--surface-container-low)",
                    }}
                  >
                    <div className="p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Sparkles size={14} style={{ color: "var(--tertiary)" }} />
                        <span className="type-data-field" style={{ fontWeight: "var(--weight-semibold)" as any, color: "var(--text-default)" }}>
                          Importa stile da JSON
                        </span>
                      </div>

                      <div
                        className="type-data-sm mb-3 p-2.5 rounded-lg"
                        style={{ color: "var(--text-muted)", background: "var(--container-bg)", lineHeight: "var(--leading-relaxed)", border: "1px solid var(--container-border)" }}
                      >
                        Incolla il JSON generato dall'AI (o scritto a mano). Lo parser gestisce automaticamente: code fences markdown, wrapper oggetto, array, campi mancanti, ID duplicati.
                      </div>

                      {/* Paste + textarea */}
                      <div className="flex flex-col gap-2">
                        <div className="flex gap-2">
                          <button
                            onClick={handleSmartImportPaste}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-lg type-data-base active:scale-95 transition-transform"
                            style={{
                              background: "color-mix(in srgb, var(--tertiary) 10%, transparent)",
                              color: "var(--tertiary)",
                              border: "1px solid color-mix(in srgb, var(--tertiary) 25%, transparent)",
                              fontWeight: "var(--weight-semibold)" as any,
                            }}
                            aria-label="Incolla dagli appunti"
                          >
                            <ClipboardPaste size={13} /> Incolla dagli appunti
                          </button>
                          {smartImportJson && (
                            <button
                              onClick={() => { setSmartImportJson(""); setSmartImportResult(null); setSmartImportDone(false); }}
                              className="flex items-center gap-1 px-2.5 py-2 rounded-lg type-data-base active:scale-95 transition-transform"
                              style={{
                                background: "var(--container-bg)",
                                color: "var(--text-muted)",
                                border: "1px solid var(--container-border)",
                              }}
                              aria-label="Pulisci"
                            >
                              <X size={12} /> Pulisci
                            </button>
                          )}
                        </div>
                        <textarea
                          value={smartImportJson}
                          onChange={(e) => {
                            setSmartImportJson(e.target.value);
                            setSmartImportResult(null);
                            setSmartImportDone(false);
                          }}
                          placeholder='{ "id": "...", "name": "...", "family": "...", ... }'
                          rows={5}
                          className="w-full p-3 rounded-lg type-code-sm"
                          style={{
                            background: "var(--container-bg)",
                            border: "1px solid var(--container-border)",
                            color: "var(--text-default)",
                            resize: "vertical",
                            lineHeight: "var(--leading-relaxed)",
                          }}
                        />
                      </div>

                      {/* Parse button */}
                      {smartImportJson.trim().length > 2 && !smartImportResult && (
                        <div className="mt-3">
                          <button
                            onClick={handleSmartImportParse}
                            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl type-data-base active:scale-95 transition-transform"
                            style={{
                              background: "var(--tertiary)",
                              color: "white",
                              border: "none",
                              fontWeight: "var(--weight-semibold)" as any,
                            }}
                            aria-label="Analizza e valida JSON"
                          >
                            <Eye size={13} /> Analizza e valida
                          </button>
                        </div>
                      )}

                      {/* Parse result */}
                      <AnimatePresence>
                        {smartImportResult && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ type: "spring", stiffness: 400, damping: 25 }}
                            className="overflow-hidden"
                          >
                            <div className="mt-3 flex flex-col gap-2">
                              {/* Error */}
                              {!smartImportResult.ok && (
                                <div
                                  className="flex items-start gap-2 p-3 rounded-lg"
                                  style={{ background: "color-mix(in srgb, var(--text-error) 8%, transparent)", border: "1px solid color-mix(in srgb, var(--text-error) 20%, transparent)" }}
                                >
                                  <CircleAlert size={14} style={{ color: "var(--icon-error)", flexShrink: 0, marginTop: "var(--space-0-5)" }} />
                                  <span className="type-data-sm" style={{ color: "var(--text-error)", lineHeight: "var(--leading-relaxed)" }}>
                                    {smartImportResult.error}
                                  </span>
                                </div>
                              )}

                              {/* Auto-fixes applied */}
                              {smartImportResult.autoFixes.length > 0 && (
                                <div
                                  className="p-3 rounded-lg"
                                  style={{ background: "color-mix(in srgb, var(--cta) 5%, transparent)", border: "1px solid color-mix(in srgb, var(--cta) 15%, transparent)" }}
                                >
                                  <div className="flex items-center gap-1.5 mb-1.5">
                                    <Zap size={11} style={{ color: "var(--cta)" }} />
                                    <span className="type-data-sm" style={{ fontWeight: "var(--weight-semibold)" as any, color: "var(--cta)" }}>
                                      {smartImportResult.autoFixes.length} correzioni automatiche
                                    </span>
                                  </div>
                                  <div className="flex flex-col gap-0.5">
                                    {smartImportResult.autoFixes.map((f, i) => (
                                      <div key={i} className="type-data-xs" style={{ color: "var(--text-muted)", paddingLeft: "var(--space-1)", fontFamily: "var(--font-mono)" }}>
                                        {f}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Warnings */}
                              {smartImportResult.warnings.length > 0 && (
                                <div
                                  className="p-3 rounded-lg"
                                  style={{ background: "color-mix(in srgb, var(--text-warning) 5%, transparent)", border: "1px solid color-mix(in srgb, var(--text-warning) 15%, transparent)" }}
                                >
                                  <div className="flex items-center gap-1.5 mb-1">
                                    <AlertTriangle size={11} style={{ color: "var(--icon-warning)" }} />
                                    <span className="type-data-sm" style={{ fontWeight: "var(--weight-semibold)" as any, color: "var(--text-warning)" }}>
                                      Avvisi
                                    </span>
                                  </div>
                                  {smartImportResult.warnings.map((w, i) => (
                                    <div key={i} className="type-data-xs" style={{ color: "var(--text-muted)", paddingLeft: "var(--space-1)" }}>
                                      • {w}
                                    </div>
                                  ))}
                                </div>
                              )}

                              {/* Preview + Apply */}
                              {smartImportResult.ok && smartImportResult.style && !smartImportDone && (
                                <div
                                  className="p-3 rounded-lg"
                                  style={{ background: "color-mix(in srgb, var(--cta) 5%, transparent)", border: "1px solid color-mix(in srgb, var(--cta) 20%, transparent)" }}
                                >
                                  <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                      <span style={{ fontSize: "var(--font-size-5xl)" }}>{smartImportResult.style.emoji}</span>
                                      <div>
                                        <div className="type-data-field" style={{ fontWeight: "var(--weight-bold)" as any, color: "var(--text-default)" }}>
                                          {smartImportResult.style.name}
                                        </div>
                                        <div className="type-data-sm" style={{ color: "var(--text-muted)" }}>
                                          {smartImportResult.style.family} · {smartImportResult.style.id}
                                        </div>
                                      </div>
                                    </div>
                                    <button
                                      onClick={handleSmartImportApply}
                                      className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl type-data-base active:scale-95 transition-transform"
                                      style={{
                                        background: "var(--cta)",
                                        color: "white",
                                        border: "none",
                                        fontWeight: "var(--weight-bold)" as any,
                                      }}
                                      aria-label="Importa stile e seleziona"
                                    >
                                      <ArrowDown size={13} /> Importa e seleziona
                                    </button>
                                  </div>
                                  {/* Quick preview */}
                                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2">
                                    {[
                                      { l: "Idratazione", v: `${smartImportResult.style.dough.hydration_pct_range[0]}-${smartImportResult.style.dough.hydration_pct_range[1]}%` },
                                      { l: "W", v: `${smartImportResult.style.dough.flour_w_range[0]}-${smartImportResult.style.dough.flour_w_range[1]}` },
                                      { l: "Temp", v: `${smartImportResult.style.baking.temp_c_ideal}°C` },
                                      { l: "Ferm.", v: `${smartImportResult.style.dough.fermentation_hours_range[0]}-${smartImportResult.style.dough.fermentation_hours_range[1]}h` },
                                    ].map((m) => (
                                      <div key={m.l} className="p-2 rounded-lg" style={{ background: "var(--container-bg)" }}>
                                        <div className="type-data-xs" style={{ color: "var(--text-muted)" }}>{m.l}</div>
                                        <div className="type-data-field" style={{ fontWeight: "var(--weight-bold)" as any, color: "var(--text-default)", fontFeatureSettings: "'tnum'" }}>{m.v}</div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Done message */}
                              {smartImportDone && (
                                <div
                                  className="flex items-center gap-2 p-3 rounded-lg"
                                  style={{ background: "color-mix(in srgb, var(--cta) 10%, transparent)", border: "1px solid var(--cta)" }}
                                >
                                  <Check size={14} style={{ color: "var(--cta)" }} />
                                  <span className="type-data-base" style={{ fontWeight: "var(--weight-semibold)" as any, color: "var(--cta)" }}>
                                    Stile importato e selezionato! Puoi modificarlo nell'editor.
                                  </span>
                                </div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Surface>
      </div>

      {/* ═══ Diff Viewer — only for modified core styles ═══ */}
      {currentStatus === "modified" && changedRows.length > 0 && (
        <Surface
          className="p-4"
          style={{ borderLeft: "3px solid var(--tertiary)" }}
        >
          <button
            onClick={() => setShowDiff(!showDiff)}
            className="w-full flex items-center justify-between active:scale-[0.99] transition-transform"
            style={{ background: "transparent" }}
          >
            <div className="flex items-center gap-2.5">
              <GitCompareArrows size={14} style={{ color: "var(--tertiary)" }} />
              <span className="type-data-field" style={{ fontWeight: "var(--weight-semibold)" as any, color: "var(--text-default)" }}>
                Diff vs originale
              </span>
              <Badge size="xs" tone="tertiary">
                {changedRows.length} campi modificati
              </Badge>
            </div>
            <motion.div
              animate={{ rotate: showDiff ? 180 : 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            >
              <ChevronDown size={14} style={{ color: "var(--icon-muted)" }} />
            </motion.div>
          </button>
          <AnimatePresence>
            {showDiff && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                className="overflow-hidden"
              >
                <div className="pt-4 flex flex-col gap-3">
                  {(["identity", "dough", "shape", "baking", "classification"] as const).map((section) => {
                    const sectionRows = changedRows.filter((r) => r.section === section);
                    if (sectionRows.length === 0) return null;
                    const meta = DIFF_SECTION_LABELS[section];
                    return (
                      <div key={section}>
                        <div className="flex items-center gap-1.5 mb-2">
                          <span style={{ color: "var(--text-muted)" }}>{meta.icon}</span>
                          <span className="type-data-sm" style={{ fontWeight: "var(--weight-semibold)" as any, color: "var(--text-default)" }}>
                            {meta.label}
                          </span>
                          <Badge
                            size="xs"
                            tone="tertiary"
                            background="color-mix(in srgb, var(--tertiary) 12%, transparent)"
                          >
                            {sectionRows.length}
                          </Badge>
                        </div>
                        <div
                          className="rounded-xl overflow-hidden"
                          style={{ border: "1px solid var(--container-border)" }}
                        >
                          {/* Header */}
                          <div
                            className="grid gap-1 px-3 py-2"
                            style={{
                              gridTemplateColumns: "minmax(100px, 1fr) minmax(100px, 2fr) minmax(100px, 2fr)",
                              background: "var(--surface-container)",
                              borderBottom: "1px solid var(--container-border)",
                            }}
                          >
                            <span className="type-data-xs" style={{ color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "var(--tracking-caps)" }}>Campo</span>
                            <span className="type-data-xs" style={{ color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "var(--tracking-caps)" }}>Originale</span>
                            <span className="type-data-xs" style={{ color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "var(--tracking-caps)" }}>Corrente</span>
                          </div>
                          {/* Rows */}
                          {sectionRows.map((row, i) => (
                            <div
                              key={row.path}
                              className="grid gap-1 px-3 py-2"
                              style={{
                                gridTemplateColumns: "minmax(100px, 1fr) minmax(100px, 2fr) minmax(100px, 2fr)",
                                background: i % 2 === 0 ? "var(--container-bg)" : "var(--surface-container-low)",
                                borderBottom: i < sectionRows.length - 1 ? "1px solid var(--container-border)" : "none",
                              }}
                            >
                              <span className="type-data-sm" style={{ fontWeight: "var(--weight-medium)" as any, color: "var(--text-default)" }}>
                                {row.label}
                              </span>
                              <span
                                className="type-code-sm"
                                style={{
                                  color: "var(--text-error)",
                                  background: "color-mix(in srgb, var(--text-error) 6%, transparent)",
                                  padding: "2px 6px",
                                  borderRadius: 6,
                                  wordBreak: "break-all",
                                  textDecoration: "line-through",
                                  textDecorationColor: "color-mix(in srgb, var(--text-error) 40%, transparent)",
                                }}
                              >
                                {row.original}
                              </span>
                              <span
                                className="type-code-sm"
                                style={{
                                  color: "var(--cta)",
                                  background: "color-mix(in srgb, var(--cta) 6%, transparent)",
                                  padding: "2px 6px",
                                  borderRadius: 6,
                                  wordBreak: "break-all",
                                }}
                              >
                                {row.current}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}

                  {/* Quick actions */}
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={resetStyle}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl type-data-base active:scale-95 transition-transform"
                      style={{
                        background: "color-mix(in srgb, var(--text-error) 8%, transparent)",
                        color: "var(--text-error)",
                        border: "1px solid color-mix(in srgb, var(--text-error) 20%, transparent)",
                        fontWeight: "var(--weight-semibold)" as any,
                      }}
                      aria-label="Ripristina tutti i campi all'originale"
                    >
                      <RotateCcw size={12} /> Ripristina tutto all'originale
                    </button>
                    <button
                      onClick={() => {
                        const diffJson = changedRows.reduce((acc, r) => {
                          acc[r.path] = { da: r.original, a: r.current };
                          return acc;
                        }, {} as Record<string, { da: string; a: string }>);
                        copyToClipboard(JSON.stringify(diffJson, null, 2));
                      }}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl type-data-base active:scale-95 transition-transform"
                      style={{
                        background: "var(--container-bg)",
                        color: "var(--text-muted)",
                        border: "1px solid var(--container-border)",
                      }}
                      aria-label="Copia diff come JSON"
                    >
                      <Copy size={12} /> Copia diff
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Surface>
      )}

      {/* Export/Import bar in tools */}
      <div className="flex gap-2">
        <button
          onClick={exportJson}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl type-data-base active:scale-95 transition-transform"
          style={{
            background: copied ? "color-mix(in srgb, var(--cta) 15%, transparent)" : "var(--container-bg)",
            border: copied ? "1px solid var(--cta)" : "1px solid var(--container-border)",
            color: copied ? "var(--cta)" : "var(--text-default)",
            fontWeight: "var(--weight-semibold)" as any,
          }}
          aria-label="Esporta JSON negli appunti"
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
          {copied ? "Copiato!" : "Esporta tutto JSON"}
        </button>
        <button
          onClick={() => setImportOpen(!importOpen)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl type-data-base active:scale-95 transition-transform"
          style={{ background: "var(--container-bg)", border: "1px solid var(--container-border)", color: "var(--text-default)", fontWeight: "var(--weight-medium)" as any }}
          aria-label="Importa JSON"
        >
          <Upload size={14} /> Importa DB
        </button>
      </div>

      {/* Bulk import panel */}
      <AnimatePresence>
        {importOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 28 }}
            className="overflow-hidden"
          >
            <Surface className="p-4 flex flex-col gap-3">
              <FieldLabel>Incolla JSON STYLES_DB completo</FieldLabel>
              <textarea
                value={importJson}
                onChange={(e) => setImportJson(e.target.value)}
                rows={6}
                placeholder='{"napoletana_stg": { ... }, ...}'
                className="w-full p-2.5 rounded-lg type-code-sm resize-y"
                style={{ background: "var(--container-bg)", border: "1px solid var(--container-border)", color: "var(--text-default)" }}
              />
              <div className="flex gap-2">
                <button onClick={doImport} className="flex-1 py-2 rounded-lg type-data-base active:scale-95 transition-transform" style={{ background: "var(--cta)", color: "white", fontWeight: "var(--weight-semibold)" as any, border: "none" }}>
                  Applica
                </button>
                <button onClick={() => { setImportOpen(false); setImportJson(""); }} className="px-4 py-2 rounded-lg type-data-base active:scale-95 transition-transform" style={{ background: "var(--container-bg)", color: "var(--text-muted)", border: "1px solid var(--container-border)" }}>
                  Annulla
                </button>
              </div>
            </Surface>
          </motion.div>
        )}
      </AnimatePresence>

      </motion.div>
      )}

      {/* ═══ EDIT MODE ═══ */}
      {editorMode === "edit" && (
      <motion.div
        key="edit"
        className="flex flex-col gap-5"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      >

      {/* Top bar — style selector + actions */}
      <Surface className="p-4">
        <div className="flex flex-col gap-3">
          {/* Selector row */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <FieldLabel>Stile attivo</FieldLabel>
              <select
                value={selectedId}
                onChange={(e) => setSelectedId(e.target.value)}
                className="w-full p-2.5 rounded-xl type-data-field"
                style={{
                  background: "var(--container-bg)",
                  border: "1px solid var(--container-border)",
                  color: "var(--text-default)",
                }}
              >
                {styleIds.map((id) => {
                  const s = stylesMap[id];
                  const st = getStyleStatus(id, s);
                  const tag = st === "custom" ? " ● CUSTOM" : st === "modified" ? " ● MOD" : "";
                  return (
                    <option key={id} value={id}>
                      {s.emoji} {s.name} ({s.family}){tag}
                    </option>
                  );
                })}
              </select>
            </div>
            <div className="flex items-end gap-2 flex-wrap">
              <button
                onClick={addNewStyle}
                className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl type-data-base active:scale-95 transition-transform"
                style={{
                  background: "color-mix(in srgb, var(--cta) 12%, transparent)",
                  color: "var(--cta)",
                  border: "1px solid color-mix(in srgb, var(--cta) 25%, transparent)",
                  fontWeight: "var(--weight-semibold)" as any,
                }}
                aria-label="Aggiungi nuovo stile"
              >
                <Plus size={14} /> Nuovo
              </button>
              {currentStatus === "modified" && (
                <button
                  onClick={resetStyle}
                  className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl type-data-base active:scale-95 transition-transform"
                  style={{
                    background: "color-mix(in srgb, var(--tertiary) 10%, transparent)",
                    color: "var(--tertiary)",
                    border: "1px solid color-mix(in srgb, var(--tertiary) 25%, transparent)",
                    fontWeight: "var(--weight-semibold)" as any,
                  }}
                  aria-label="Ripristina stile originale"
                >
                  <RotateCcw size={13} /> Ripristina originale
                </button>
              )}
              {isCustom && (
                <button
                  onClick={deleteStyle}
                  className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl type-data-base active:scale-95 transition-transform"
                  style={{
                    background: "color-mix(in srgb, var(--text-error) 10%, transparent)",
                    color: "var(--text-error)",
                    border: "1px solid color-mix(in srgb, var(--text-error) 25%, transparent)",
                    fontWeight: "var(--weight-medium)" as any,
                  }}
                  aria-label="Elimina stile custom"
                >
                  <Trash2 size={13} /> Elimina
                </button>
              )}
            </div>
          </div>

          {/* Status indicator row */}
          <div
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg"
            style={{
              background: `color-mix(in srgb, ${STATUS_META[currentStatus].color} 6%, transparent)`,
              border: `1px solid color-mix(in srgb, ${STATUS_META[currentStatus].color} 18%, transparent)`,
            }}
          >
            <div
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ background: STATUS_META[currentStatus].dotColor }}
            />
            <Badge
              size="xs"
              color={STATUS_META[currentStatus].color}
              background={`color-mix(in srgb, ${STATUS_META[currentStatus].color} 15%, transparent)`}
            >
              {STATUS_META[currentStatus].label}
            </Badge>
            {currentStatus === "modified" && modifiedFields.length > 0 && (
              <span
                className="type-data-sm"
                style={{ color: "var(--text-muted)" }}
              >
                Campi modificati: {modifiedFields.join(", ")}
              </span>
            )}
            {currentStatus === "original" && (
              <span
                className="type-data-sm"
                style={{ color: "var(--text-muted)" }}
              >
                Stile core protetto — puoi modificarlo e ripristinare in qualsiasi momento
              </span>
            )}
            {currentStatus === "custom" && (
              <span
                className="type-data-sm"
                style={{ color: "var(--text-muted)" }}
              >
                Stile personalizzato — eliminabile
              </span>
            )}
          </div>
        </div>
      </Surface>

      {/* Two-column layout: editor + preview */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* LEFT — Editor (3/5) */}
        <div className="lg:col-span-3 flex flex-col gap-3">
          {/* Meta */}
          <Section
            title="Identita"
            icon={<Wheat size={14} />}
            color="var(--primary)"
            defaultOpen
            issueCount={identityIssues}
          >
            <div className="grid grid-cols-2 gap-3">
              <TextInput
                label="Nome"
                value={style.name}
                onChange={(v) => update((s) => { s.name = v; })}
                required
              />
              <TextInput
                label="Emoji"
                value={style.emoji}
                onChange={(v) => update((s) => { s.emoji = v; })}
                hint="Opzionale, usato nelle card"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <SelectInput
                label="Famiglia"
                value={style.family}
                options={FAMILY_IDS.map((f) => ({
                  id: f,
                  label: PIZZA_FAMILIES[f].name,
                }))}
                onChange={(v) => update((s) => { s.family = v; })}
                required
              />
              <TextInput
                label="Origine"
                value={style.origin}
                onChange={(v) => update((s) => { s.origin = v; })}
                hint="Opzionale, info geografica"
              />
            </div>
            <TextAreaInput
              label="Descrizione"
              value={style.description}
              onChange={(v) => update((s) => { s.description = v; })}
            />
            <TagsEditor
              label="Caratteristiche chiave"
              tags={style.key_characteristics}
              onChange={(v) => update((s) => { s.key_characteristics = v; })}
            />
          </Section>

          {/* Impasto */}
          <Section
            title="Impasto (Dough)"
            icon={<FlaskConical size={14} />}
            color="var(--tertiary)"
            defaultOpen
            issueCount={doughIssues}
          >
            <RangeInput
              label="Idratazione"
              low={style.dough.hydration_pct_range[0]}
              high={style.dough.hydration_pct_range[1]}
              onChangeLow={(v) => update((s) => { s.dough.hydration_pct_range[0] = v; })}
              onChangeHigh={(v) => update((s) => { s.dough.hydration_pct_range[1] = v; })}
              min={30}
              max={120}
              unit="%"
              required
              hint="Range idratazione baker's % — parametro fondamentale"
            />
            <RangeInput
              label="Farina W"
              low={style.dough.flour_w_range[0]}
              high={style.dough.flour_w_range[1]}
              onChangeLow={(v) => update((s) => { s.dough.flour_w_range[0] = v; })}
              onChangeHigh={(v) => update((s) => { s.dough.flour_w_range[1] = v; })}
              min={100}
              max={450}
              required
              hint="Indice W alveografico — forza della farina"
            />
            <RangeInput
              label="P/L alveografico"
              low={style.dough.flour_pl_range[0]}
              high={style.dough.flour_pl_range[1]}
              onChangeLow={(v) => update((s) => { s.dough.flour_pl_range[0] = v; })}
              onChangeHigh={(v) => update((s) => { s.dough.flour_pl_range[1] = v; })}
              min={0.2}
              max={1.2}
              step={0.05}
              hint="Rapporto tenacità/estensibilità — calcolabile da W"
              autoCalc={{
                label: "Calcola da W",
                onClick: () => {
                  const pl = derivePLRange(style.dough.flour_w_range);
                  update((s) => { s.dough.flour_pl_range = pl; });
                },
              }}
            />
            <div className="grid grid-cols-3 gap-3">
              <NumberInput
                label="Sale"
                value={style.dough.salt_pct}
                onChange={(v) => update((s) => { s.dough.salt_pct = v; })}
                min={0}
                max={5}
                step={0.1}
                unit="%"
                required
                hint="Baker's % — tipico 2.0–3.0"
              />
              <NumberInput
                label="Grasso"
                value={style.dough.oil_pct}
                onChange={(v) => update((s) => { s.dough.oil_pct = v; })}
                min={0}
                max={25}
                step={0.5}
                unit="%"
                hint="Baker's % — 0 se fat_type è 'none'"
              />
              <NumberInput
                label="Zucchero"
                value={style.dough.sugar_pct}
                onChange={(v) => update((s) => { s.dough.sugar_pct = v; })}
                min={0}
                max={10}
                step={0.5}
                unit="%"
                hint="Opzionale — boost Maillard"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <SelectInput
                label="Tipo grasso"
                value={style.dough.fat_type}
                options={FAT_TYPES.map((f) => ({ id: f.id, label: f.label }))}
                onChange={(v) => update((s) => { s.dough.fat_type = v as DoughParameters["fat_type"]; })}
                required
                hint="Coerente con % grasso — 'none' se 0%"
                autoCalc={{
                  label: "Auto",
                  onClick: () => update((s) => { s.dough.fat_type = s.dough.oil_pct > 0 ? "oil" : "none"; }),
                }}
              />
              <TextInput
                label="Metodo"
                value={style.dough.process_type}
                onChange={(v) => update((s) => { s.dough.process_type = v; })}
                required
                hint="direct, biga, poolish, no_knead (separati da |)"
              />
            </div>
            <RangeInput
              label="Fermentazione"
              low={style.dough.fermentation_hours_range[0]}
              high={style.dough.fermentation_hours_range[1]}
              onChangeLow={(v) => update((s) => { s.dough.fermentation_hours_range[0] = v; })}
              onChangeHigh={(v) => update((s) => { s.dough.fermentation_hours_range[1] = v; })}
              min={0}
              max={120}
              step={0.5}
              unit="ore"
              required
              hint="Range ore di lievitazione"
            />
          </Section>

          {/* Forma */}
          <Section
            title="Forma (Shape)"
            icon={<CircleDot size={14} />}
            color="var(--cta)"
            issueCount={shapeIssues}
          >
            <div className="flex gap-2">
              {SHAPE_TYPES.map((st) => (
                <button
                  key={st.id}
                  onClick={() => update((s) => { s.shape.shape_type = st.id; })}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg type-data-base active:scale-95 transition-transform"
                  style={{
                    fontWeight: "var(--weight-medium)" as any,
                    background:
                      style.shape.shape_type === st.id
                        ? "var(--chip-bg-active)"
                        : "var(--container-bg)",
                    color:
                      style.shape.shape_type === st.id
                        ? "var(--chip-text-active)"
                        : "var(--text-muted)",
                    border: "1px solid var(--container-border)",
                  }}
                >
                  {st.icon} {st.label}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <NumberInput
                label="Peso panetto"
                value={style.shape.dough_weight_g}
                onChange={(v) => update((s) => { s.shape.dough_weight_g = v; })}
                min={50}
                max={1200}
                step={10}
                unit="g"
                required
                hint="Peso singolo panetto in grammi"
              />
              <NumberInput
                label="Fattore spessore"
                value={style.shape.thickness_factor}
                onChange={(v) => update((s) => { s.shape.thickness_factor = v; })}
                min={0.05}
                max={1.5}
                step={0.01}
                required
                hint="0.08=sottilissima, 0.35=media, 1.0+=deep dish"
              />
            </div>
            {style.shape.shape_type === "round" && (
              <NumberInput
                label="Diametro"
                value={style.shape.diameter_cm ?? 30}
                onChange={(v) => update((s) => { s.shape.diameter_cm = v; })}
                min={15}
                max={50}
                unit="cm"
              />
            )}
            {(style.shape.shape_type === "rectangular" || style.shape.shape_type === "oval") && (
              <div className="grid grid-cols-2 gap-3">
                <NumberInput
                  label="Lunghezza"
                  value={style.shape.length_cm ?? 40}
                  onChange={(v) => update((s) => { s.shape.length_cm = v; })}
                  min={15}
                  max={80}
                  unit="cm"
                />
                <NumberInput
                  label="Larghezza"
                  value={style.shape.width_cm ?? 30}
                  onChange={(v) => update((s) => { s.shape.width_cm = v; })}
                  min={15}
                  max={60}
                  unit="cm"
                />
              </div>
            )}
          </Section>

          {/* Cottura */}
          <Section
            title="Cottura (Baking)"
            icon={<Flame size={14} />}
            color="var(--axis-authenticity)"
            issueCount={bakingIssues}
          >
            <SelectInput
              label="Tipo forno richiesto"
              value={style.baking.oven_type_required}
              options={OVEN_TYPES}
              onChange={(v) => update((s) => { s.baking.oven_type_required = v; })}
              required
              hint="Influisce su score autenticità e fattibilità"
            />
            <RangeInput
              label="Range temperatura"
              low={style.baking.temp_c_range[0]}
              high={style.baking.temp_c_range[1]}
              onChangeLow={(v) => update((s) => { s.baking.temp_c_range[0] = v; })}
              onChangeHigh={(v) => update((s) => { s.baking.temp_c_range[1] = v; })}
              min={150}
              max={550}
              unit="°C"
              required
            />
            <NumberInput
              label="Temperatura ideale"
              value={style.baking.temp_c_ideal}
              onChange={(v) => update((s) => { s.baking.temp_c_ideal = v; })}
              min={150}
              max={550}
              unit="°C"
              required
              hint="Deve rientrare nel range sopra"
              autoCalc={{
                label: "Centro range",
                onClick: () => update((s) => {
                  s.baking.temp_c_ideal = Math.round((s.baking.temp_c_range[0] + s.baking.temp_c_range[1]) / 2);
                }),
              }}
            />
            <RangeInput
              label="Tempo cottura"
              low={style.baking.cook_time_sec_range[0]}
              high={style.baking.cook_time_sec_range[1]}
              onChangeLow={(v) => update((s) => { s.baking.cook_time_sec_range[0] = v; })}
              onChangeHigh={(v) => update((s) => { s.baking.cook_time_sec_range[1] = v; })}
              min={30}
              max={3600}
              unit="sec"
              required
            />
            <NumberInput
              label="Tempo cottura ideale"
              value={style.baking.cook_time_sec_ideal}
              onChange={(v) => update((s) => { s.baking.cook_time_sec_ideal = v; })}
              min={30}
              max={3600}
              unit="sec"
              required
              hint="Deve rientrare nel range sopra"
              autoCalc={{
                label: "Centro range",
                onClick: () => update((s) => {
                  s.baking.cook_time_sec_ideal = Math.round((s.baking.cook_time_sec_range[0] + s.baking.cook_time_sec_range[1]) / 2);
                }),
              }}
            />
          </Section>

          {/* Flags & meta */}
          <Section
            title="Classificazione"
            icon={<Timer size={14} />}
            color="var(--secondary)"
            issueCount={classIssues}
          >
            <div className="grid grid-cols-2 gap-3">
              <SelectInput
                label="Tipo crosta"
                value={style.crust_type}
                options={CRUST_TYPES}
                onChange={(v) => update((s) => { s.crust_type = v; })}
                required
              />
              <SelectInput
                label="Categoria idratazione"
                value={style.hydration_category}
                options={HYDRATION_CATS.map((h) => ({ id: h, label: h }))}
                onChange={(v) => update((s) => { s.hydration_category = v; })}
                hint="Calcolabile dal range idratazione"
                autoCalc={{
                  label: "Da range",
                  onClick: () => update((s) => {
                    s.hydration_category = deriveHydrationCategory(s.dough.hydration_pct_range);
                  }),
                }}
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <ToggleField
                label="Richiede forno a legna"
                value={style.requires_wood_oven}
                onChange={(v) => update((s) => { s.requires_wood_oven = v; })}
              />
              <ToggleField
                label="Permette additivi"
                value={style.allows_additives}
                onChange={(v) => update((s) => { s.allows_additives = v; })}
              />
              <ToggleField
                label="Richiede pre-fermento"
                value={style.requires_pre_ferment}
                onChange={(v) => update((s) => { s.requires_pre_ferment = v; })}
              />
              <ToggleField
                label="Adatto ai principianti"
                value={style.suitable_for_beginner}
                onChange={(v) => update((s) => { s.suitable_for_beginner = v; })}
              />
            </div>
          </Section>

          {/* ═══ COHERENCE PANEL ═══ */}
          {validationIssues.length > 0 && (
            <div
              className="rounded-xl overflow-hidden"
              style={{
                border: errorCount > 0
                  ? "1px solid color-mix(in srgb, var(--text-error) 35%, transparent)"
                  : warnCount > 0
                    ? "1px solid color-mix(in srgb, var(--text-warning) 35%, transparent)"
                    : "1px solid var(--container-border)",
                background: "var(--surface-container-low)",
              }}
            >
              <div
                className="p-3.5 flex items-center justify-between"
                style={{
                  borderBottom: "1px solid var(--container-border)",
                }}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center"
                    style={{
                      background: errorCount > 0
                        ? "color-mix(in srgb, var(--text-error) 14%, transparent)"
                        : "color-mix(in srgb, var(--text-warning) 14%, transparent)",
                      color: errorCount > 0 ? "var(--text-error)" : "var(--text-warning)",
                    }}
                  >
                    <AlertTriangle size={14} />
                  </div>
                  <span
                    className="type-data-field"
                    style={{
                      fontWeight: "var(--weight-semibold)" as any,
                      color: "var(--text-default)",
                    }}
                  >
                    Coerenza
                  </span>
                  <div className="flex items-center gap-1.5">
                    {errorCount > 0 && (
                      <Badge size="xs" tone="error">
                        {errorCount} err
                      </Badge>
                    )}
                    {warnCount > 0 && (
                      <Badge size="xs" tone="warning">
                        {warnCount} warn
                      </Badge>
                    )}
                    {infoCount > 0 && (
                      <Badge size="xs" tone="secondary">
                        {infoCount} info
                      </Badge>
                    )}
                  </div>
                </div>
                {validationIssues.some((i) => i.fix) && (
                  <button
                    onClick={() => {
                      update((s) => {
                        for (const issue of validateStyle(s)) {
                          if (issue.fix) issue.fix.apply(s);
                        }
                      });
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg type-data-sm active:scale-95 transition-transform"
                    style={{
                      fontWeight: "var(--weight-semibold)" as any,
                      background: "var(--cta)",
                      color: "white",
                      border: "none",
                    }}
                    aria-label="Correggi tutti i problemi"
                  >
                    <Wrench size={11} /> Correggi tutti
                  </button>
                )}
              </div>
              <div className="p-3.5 flex flex-col gap-1.5">
                {validationIssues.map((issue, i) => {
                  const sty = ISSUE_STYLE[issue.severity];
                  return (
                    <div
                      key={i}
                      className="flex items-start gap-2 p-2.5 rounded-lg"
                      style={{
                        background: sty.bg,
                        border: `1px solid ${sty.border}`,
                      }}
                    >
                      <span style={{ color: sty.color, flexShrink: 0, marginTop: 1 }}>
                        {sty.icon}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div
                          className="type-data-sm"
                          style={{
                            color: "var(--text-default)",
                            lineHeight: "var(--leading-relaxed)",
                          }}
                        >
                          {issue.message}
                        </div>
                        <div
                          className="type-label-xs"
                          style={{
                            color: "var(--text-muted)",
                            marginTop: "var(--space-0-5)",
                          }}
                        >
                          {issue.field}
                        </div>
                      </div>
                      {issue.fix && (
                        <button
                          onClick={() => update((s) => { issue.fix!.apply(s); })}
                          className="flex items-center gap-1 px-2 py-1 rounded-md type-data-xs active:scale-95 transition-transform flex-shrink-0"
                          style={{
                            fontWeight: "var(--weight-semibold)" as any,
                            background: sty.color,
                            color: "white",
                            border: "none",
                          }}
                          aria-label={issue.fix.label}
                        >
                          <Wrench size={9} /> {issue.fix.label}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT — Live preview (2/5) */}
        <div className="lg:col-span-2 flex flex-col gap-3">
          <div
            className="lg:sticky lg:top-20 flex flex-col gap-3"
          >
            {/* Preview controls */}
            <Surface className="p-4">
              <div
                className="type-label-compact"
                style={{
                  color: "var(--text-accent)",
                  letterSpacing: "var(--tracking-caps)",
                  textTransform: "uppercase",
                  marginBottom: 10,
                }}
              >
                Preview live
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <FieldLabel>Forno</FieldLabel>
                  <select
                    value={previewOven}
                    onChange={(e) => setPreviewOven(e.target.value as OvenType)}
                    className="w-full p-1.5 rounded-lg type-data-base"
                    style={{
                      background: "var(--container-bg)",
                      border: "1px solid var(--container-border)",
                      color: "var(--text-default)",
                    }}
                  >
                    {OVEN_TYPES.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <FieldLabel>Temp {previewTemp}°C</FieldLabel>
                  <input
                    type="range"
                    min={150}
                    max={500}
                    step={10}
                    value={previewTemp}
                    onChange={(e) => setPreviewTemp(Number(e.target.value))}
                    className="w-full accent-[var(--text-accent)] mt-1.5"
                  />
                </div>
                <div>
                  <FieldLabel>Skill {previewSkill}</FieldLabel>
                  <input
                    type="range"
                    min={1}
                    max={4}
                    step={1}
                    value={previewSkill}
                    onChange={(e) => setPreviewSkill(Number(e.target.value) as SkillLevel)}
                    className="w-full accent-[var(--text-accent)] mt-1.5"
                  />
                </div>
              </div>
            </Surface>

            {/* Score preview */}
            {recipe ? (
              <Surface className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <span
                    className="type-data-field"
                    style={{
                      fontWeight: "var(--weight-semibold)" as any,
                      color: "var(--text-default)",
                    }}
                  >
                    Punteggi
                  </span>
                  <span
                    className="type-data"
                    style={{
                      fontSize: "var(--font-size-5xl)",
                      fontWeight: "var(--weight-bold)" as any,
                      color: "var(--text-accent)",
                      fontFeatureSettings: "'tnum'",
                    }}
                  >
                    {recipe.scores.composite}
                  </span>
                </div>
                <div className="flex flex-col gap-2.5">
                  <ScoreBar
                    label="Autenticita"
                    value={recipe.scores.authenticity}
                    color="var(--axis-authenticity)"
                  />
                  <ScoreBar
                    label="Fattibilita"
                    value={recipe.scores.feasibility}
                    color="var(--axis-feasibility)"
                  />
                  <ScoreBar
                    label="Digeribilita"
                    value={recipe.scores.digestibility}
                    color="var(--axis-digestibility)"
                  />

                </div>
              </Surface>
            ) : (
              <Surface
                className="p-4 text-center"
                style={{ color: "var(--text-error)" }}
              >
                <span className="type-data-base">
                  Errore nella generazione ricetta. Controlla i parametri.
                </span>
              </Surface>
            )}

            {/* Recipe quick data */}
            {recipe && (
              <Surface className="p-4">
                <div
                  className="type-label-compact"
                  style={{
                    color: "var(--text-muted)",
                    marginBottom: 8,
                  }}
                >
                  Ricetta generata
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: "Idratazione", value: `${recipe.hydration_pct}%` },
                    { label: "Farina W", value: `${recipe.flour_w}` },
                    { label: "P/L", value: `${recipe.flour_pl}` },
                    { label: "Lievito", value: `${recipe.yeast_g}g ${recipe.yeast_type}` },
                    { label: "Fermentazione", value: `${recipe.fermentation_hours}h @${recipe.fermentation_temp_c}°C` },
                    { label: "Cottura", value: `${recipe.cook_time_sec}s @${recipe.oven_temp_c}°C` },
                    { label: "Panetto", value: `${recipe.ball_weight_g}g` },
                    { label: "Grasso", value: recipe.fat_label ? `${recipe.fat_g}g ${recipe.fat_label}` : "—" },
                  ].map((d) => (
                    <div
                      key={d.label}
                      className="p-2 rounded-lg"
                      style={{ background: "var(--container-bg)" }}
                    >
                      <div
                        className="type-label-xs"
                        style={{
                          color: "var(--text-muted)",
                          marginBottom: 2,
                        }}
                      >
                        {d.label}
                      </div>
                      <div
                        className="type-data-base"
                        style={{
                          fontWeight: "var(--weight-semibold)" as any,
                          color: "var(--text-default)",
                          fontFeatureSettings: "'tnum'",
                        }}
                      >
                        {d.value}
                      </div>
                    </div>
                  ))}
                </div>
              </Surface>
            )}

            {/* Science quick data */}
            {recipe && (
              <Surface className="p-4">
                <div
                  className="type-label-compact flex items-center gap-1.5"
                  style={{
                    color: "var(--text-accent)",
                    marginBottom: 8,
                  }}
                >
                  <FlaskConical size={11} /> Science layer
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: "Ore eq. 18°C", value: `${recipe.science.effective_hours_18c}h` },
                    { label: "Q10", value: `${recipe.science.q10_factor} (${recipe.science.q10_model})` },
                    { label: "Glutine", value: `${recipe.science.gluten_network}/100` },
                    { label: "aw", value: `${recipe.science.water_activity}` },
                    { label: "Proteolisi", value: `${recipe.science.proteolysis_index}/100` },
                    { label: "Energia", value: `${recipe.science.baking_energy_kj} kJ` },
                    { label: "Lievito B%", value: `${recipe.science.yeast_baker_pct}%` },
                    { label: "P/L stimato", value: `${recipe.science.flour_pl_estimated}` },
                    { label: "FODMAP ↓", value: recipe.science.fodmap_reduction_pct != null ? `${recipe.science.fodmap_reduction_pct}%` : "n/a" },
                    { label: "Amido deg.", value: `${recipe.science.starch_degradation_pct}%` },
                  ].map((d) => (
                    <div
                      key={d.label}
                      className="p-2 rounded-lg"
                      style={{ background: "var(--container-bg)" }}
                    >
                      <div
                        className="type-label-xs"
                        style={{
                          color: "var(--text-muted)",
                          marginBottom: 2,
                        }}
                      >
                        {d.label}
                      </div>
                      <div
                        className="type-data-base"
                        style={{
                          fontWeight: "var(--weight-semibold)" as any,
                          color: "var(--text-default)",
                          fontFeatureSettings: "'tnum'",
                        }}
                      >
                        {d.value}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Authenticity breakdown */}
                {recipe.science.authenticity_breakdown && Object.keys(recipe.science.authenticity_breakdown).length > 0 && (
                  <div className="mt-3">
                    <div
                      className="type-label-xs"
                      style={{
                        color: "var(--text-muted)",
                        marginBottom: 6,
                        textTransform: "uppercase",
                        letterSpacing: "var(--tracking-caps)",
                      }}
                    >
                      Breakdown autenticità
                    </div>
                    <div className="flex flex-col gap-1.5">
                      {Object.entries(recipe.science.authenticity_breakdown).map(([axis, value]) => (
                        <div key={axis} className="flex items-center gap-2">
                          <div
                            className="type-data-sm"
                            style={{
                              color: "var(--text-muted)",
                              minWidth: 80,
                              textTransform: "capitalize",
                            }}
                          >
                            {axis}
                          </div>
                          <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "var(--container-bg)" }}>
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${Math.min(100, Math.max(0, Number(value)))}%`,
                                background: "var(--axis-authenticity)",
                              }}
                            />
                          </div>
                          <div
                            className="type-data-sm"
                            style={{
                              fontWeight: "var(--weight-semibold)" as any,
                              color: "var(--text-default)",
                              fontFeatureSettings: "'tnum'",
                              minWidth: 28,
                              textAlign: "right",
                            }}
                          >
                            {Math.round(Number(value))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Compensations */}
                {recipe.science.compensations && recipe.science.compensations.length > 0 && (
                  <div className="mt-3">
                    <div
                      className="type-label-xs"
                      style={{
                        color: "var(--text-warning)",
                        marginBottom: 6,
                        textTransform: "uppercase",
                        letterSpacing: "var(--tracking-caps)",
                      }}
                    >
                      Compensazioni forno ({recipe.science.compensations.length})
                    </div>
                    <div className="flex flex-col gap-1.5">
                      {recipe.science.compensations.map((c, i) => (
                        <div
                          key={i}
                          className="p-2 rounded-lg flex items-start gap-2"
                          style={{ background: "color-mix(in srgb, var(--text-warning) 6%, transparent)" }}
                        >
                          <Badge
                            size="xs"
                            tone="warning"
                            className="flex-shrink-0"
                            style={{
                              textTransform: "uppercase",
                            }}
                          >
                            {c.type}
                          </Badge>
                          <div className="flex-1">
                            <div className="type-data-sm" style={{ color: "var(--text-default)" }}>
                              {c.reason}
                            </div>
                            <div
                              className="type-data-xs"
                              style={{
                                color: "var(--text-muted)",
                                fontFeatureSettings: "'tnum'",
                                marginTop: "var(--space-0-5)",
                              }}
                            >
                              {c.original} → {c.compensated}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </Surface>
            )}

            {/* Messages */}
            {recipe && (recipe.scores.penalties.length > 0 || recipe.scores.warnings.length > 0 || recipe.scores.claims.length > 0) && (
              <Surface className="p-4">
                <div
                  className="type-label-compact"
                  style={{
                    color: "var(--text-muted)",
                    marginBottom: 8,
                  }}
                >
                  Messaggi ({recipe.scores.penalties.length + recipe.scores.warnings.length + recipe.scores.claims.length})
                </div>
                <div className="flex flex-col gap-1.5">
                  {[
                    ...recipe.scores.penalties.map((m) => ({ m: m.fallback, type: "penalty" as const })),
                    ...recipe.scores.warnings.map((m) => ({ m: m.fallback, type: "warning" as const })),
                    ...recipe.scores.claims.map((m) => ({ m: m.fallback, type: "claim" as const })),
                  ].slice(0, 8).map((item, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-2 p-2 rounded-lg"
                      style={{
                        background:
                          item.type === "penalty"
                            ? "color-mix(in srgb, var(--text-error) 8%, transparent)"
                            : item.type === "warning"
                              ? "color-mix(in srgb, var(--text-warning) 8%, transparent)"
                              : "color-mix(in srgb, var(--cta) 8%, transparent)",
                      }}
                    >
                      <Badge
                        size="xs"
                        tone={item.type === "penalty" ? "error" : item.type === "warning" ? "warning" : "cta"}
                        className="flex-shrink-0"
                        background={
                          item.type === "penalty"
                            ? "color-mix(in srgb, var(--text-error) 18%, transparent)"
                            : item.type === "warning"
                              ? "color-mix(in srgb, var(--text-warning) 18%, transparent)"
                              : "color-mix(in srgb, var(--cta) 18%, transparent)"
                        }
                      >
                        {item.type === "penalty" ? "PEN" : item.type === "warning" ? "WARN" : "OK"}
                      </Badge>
                      <span
                        className="type-data-sm"
                        style={{
                          color: "var(--text-default)",
                          lineHeight: "var(--leading-relaxed)",
                        }}
                      >
                        {item.m}
                      </span>
                    </div>
                  ))}
                </div>
              </Surface>
            )}

          </div>
        </div>
      </div>

      </motion.div>
      )}
      </AnimatePresence>
    </div>
  );
}
