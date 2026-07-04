import { Check,ChevronDown,Circle,Layers,Link,RectangleHorizontal,Sparkles,Unlink } from "lucide-react";
import { AnimatePresence,motion } from "motion/react";
import React,{ useEffect,useMemo,useRef,useState } from "react";
import { useCms } from "../cms/cms-context";
import { createFormatter,t } from "../cms/i18n";
import { InfoTip } from "../../components/shared/info-tip";
import {
OVEN_PRESETS,
OvenType,
PanConfig,
PanShape,
PizzaStyle,
UserConstraints,
defaultPanShape,
needsPan,
optimizeRecipe,
supportsThickness,
} from "../../domain/pizza-engine";
import { StyleVersion } from "../../data/style-versions";
import { SegmentedControl, Switch } from "../../components/ds/index";

interface PremiumSelectOption {
  value: string;
  label: string;
  subLabel?: string;
  icon?: string | React.ReactNode;
  suggested?: boolean;
}

interface PremiumSelectGroup {
  label: string;
  options: PremiumSelectOption[];
}

/* ═══ PREMIUM ANIME SELECT COMPONENT ═══ */
export function PremiumSelect({
  value,
  onChange,
  options,
  groups,
  placeholder = "Seleziona...",
}: {
  value: string;
  onChange: (val: string) => void;
  options?: PremiumSelectOption[];
  groups?: PremiumSelectGroup[];
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const allOptions = useMemo(() => {
    const list: PremiumSelectOption[] = [];
    if (options) list.push(...options);
    if (groups) {
      groups.forEach((g) => list.push(...g.options));
    }
    return list;
  }, [options, groups]);

  const activeOption = allOptions.find((o) => o.value === value);

  return (
    <div ref={containerRef} className="relative w-full">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`w-full flex items-center gap-2.5 px-4 py-3 rounded-xl text-left active:scale-[0.99] transition-all border
          ${open 
            ? "border-[var(--tertiary)] shadow-[0_0_0_1px_color-mix(in_srgb,var(--tertiary)_15%,transparent)]" 
            : "border-[var(--outline-variant)] hover:border-[var(--tertiary)]"
          }
          bg-[var(--surface-container)] hover:bg-[color-mix(in srgb,var(--surface-container)_96%,var(--text-default))]`}
        style={{
          color: "var(--text-default)",
          fontSize: "var(--font-size-md)",
          fontWeight: "var(--weight-semibold)" as any,
          cursor: "pointer",
        }}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        {activeOption?.icon && (
          <span style={{ fontSize: "1.1rem" }} className="flex-shrink-0">
            {activeOption.icon}
          </span>
        )}
        <div className="flex-1 min-w-0">
          <span className="block truncate">{activeOption?.label || placeholder}</span>
          {activeOption?.subLabel && (
            <span className="block text-xs truncate" style={{ color: "var(--text-muted)", marginTop: 1 }}>
              {activeOption.subLabel}
            </span>
          )}
        </div>
        <ChevronDown
          size={16}
          style={{
            color: "var(--text-muted)",
            transform: open ? "rotate(180deg)" : "none",
            transition: "transform 0.2s ease",
          }}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 450, damping: 30 }}
            className="absolute left-0 right-0 z-50 mt-1.5 max-h-60 overflow-y-auto rounded-xl p-1.5 flex flex-col gap-0.5"
            style={{
              background: "var(--popover-surface)",
              border: "1px solid var(--popover-border-color)",
              boxShadow: "var(--popover-shadow)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
            }}
            role="listbox"
          >
            {options &&
              options.map((opt) => (
                <PremiumSelectRow
                  key={opt.value}
                  option={opt}
                  active={value === opt.value}
                  onClick={() => {
                    onChange(opt.value);
                    setOpen(false);
                  }}
                />
              ))}
            {groups &&
              groups.map((g, idx) => (
                <div key={idx} className="flex flex-col gap-0.5">
                  {idx > 0 && (
                    <div
                      className="my-1"
                      style={{ borderTop: "1px solid var(--container-border-subtle)" }}
                    />
                  )}
                  <div
                    className="px-3 py-1 text-[10px] font-bold tracking-wider"
                    style={{
                      color: "var(--text-muted)",
                      textTransform: "uppercase",
                    }}
                  >
                    {g.label}
                  </div>
                  {g.options.map((opt) => (
                    <PremiumSelectRow
                      key={opt.value}
                      option={opt}
                      active={value === opt.value}
                      onClick={() => {
                        onChange(opt.value);
                        setOpen(false);
                      }}
                    />
                  ))}
                </div>
              ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function PremiumSelectRow({
  option,
  active,
  onClick,
}: {
  option: PremiumSelectOption;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left transition-colors"
      style={{
        background: active ? "var(--chip-bg-active)" : "transparent",
        color: active ? "var(--chip-text-active)" : "var(--text-default)",
        fontSize: "var(--font-size-md)",
        fontWeight: active ? "var(--weight-semibold)" : "var(--weight-medium)" as any,
        border: "none",
        cursor: "pointer",
      }}
      whileHover={{
        backgroundColor: active
          ? "var(--chip-bg-active)"
          : "color-mix(in srgb, var(--text-default) 6%, transparent)",
      }}
      whileTap={{ scale: 0.985 }}
      transition={{ duration: 0.1 }}
      role="option"
      aria-selected={active}
    >
      {option.icon && (
        <span style={{ fontSize: "1.1rem" }} className="flex-shrink-0">
          {option.icon}
        </span>
      )}
      <div className="flex-1 min-w-0">
        <span className="block truncate">{option.label}</span>
        {option.subLabel && (
          <span
            className="block text-xs truncate"
            style={{
              color: active ? "var(--recipe-setup-choice-meta-active)" : "var(--text-muted)",
              opacity: 0.9,
              marginTop: 1,
            }}
          >
            {option.subLabel}
          </span>
        )}
      </div>
      {option.suggested && (
        <span
          className="px-1.5 py-0.5 rounded text-[10px] font-semibold flex-shrink-0 mr-1"
          style={{
            background: active ? "color-mix(in srgb, var(--overlay-text) 20%, transparent)" : "color-mix(in srgb, var(--tertiary) 15%, transparent)",
            color: active ? "inherit" : "var(--tertiary)",
          }}
        >
          Consigliato
        </span>
      )}
      {active && <Check size={14} className="ml-auto flex-shrink-0" />}
    </motion.button>
  );
}

interface RecipeConfiguratorProps {
  style: PizzaStyle;
  constraints: UserConstraints;
  onConstraintsChange: (c: UserConstraints) => void;
  customHydration: number;
  onHydrationChange: (v: number) => void;
  customFlourW: number;
  onFlourWChange: (v: number) => void;
  customFermentHours: number;
  onFermentHoursChange: (v: number) => void;
  customFermentTemp: number;
  onFermentTempChange: (v: number) => void;
  usePreFerment: boolean;
  onPreFermentChange: (v: boolean) => void;
  customFlourPL?: number;
  onFlourPLChange?: (v: number) => void;
  /** F3 — sale come leva (% sulla farina). */
  customSalt?: number;
  onSaltChange?: (v: number) => void;
  science?: unknown;
  panConfig?: PanConfig;
  onPanConfigChange?: (p: PanConfig) => void;
}

/* ═══ ADAPTIVE CROSS-PARAMETER HINTS ═══
   Relationships between parameters — when one changes, others should adapt.
   Based on dough science: W↔hydration, fermentation↔temp, hydration↔time, P/L↔hydration */

interface AdaptiveHints {
  hydration: { adaptiveMin?: number; adaptiveMax?: number; hint?: string } | null;
  flourW: { adaptiveMin?: number; adaptiveMax?: number; hint?: string } | null;
  fermentation: { adaptiveMin?: number; adaptiveMax?: number; hint?: string } | null;
  fermentTemp: { hint?: string; suggestedTemp?: "fridge" | "cool" | "ambient" } | null;
  flourPL: { adaptiveMin?: number; adaptiveMax?: number; hint?: string } | null;
}

function computeAdaptiveHints(
  style: PizzaStyle,
  hydration: number,
  flourW: number,
  fermentHours: number,
  fermentTemp: number,
  flourPL: number | undefined,
  cfg: any,
): AdaptiveHints {
  const hints: AdaptiveHints = {
    hydration: null,
    flourW: null,
    fermentation: null,
    fermentTemp: null,
    flourPL: null,
  };

  const sH = style.dough.hydration_pct_range;
  const sW = style.dough.flour_w_range;
  const sF = style.dough.fermentation_hours_range;
  const sPL = style.dough.flour_pl_range;

  /* Helper: position within style range (0 = min, 1 = max) */
  const pos = (v: number, lo: number, hi: number) => hi === lo ? 0.5 : (v - lo) / (hi - lo);

  /* Thresholds relative to style ranges */
  const hPos = pos(hydration, sH[0], sH[1]);    // 0–1 within style H range
  const wPos = pos(flourW, sW[0], sW[1]);        // 0–1 within style W range
  const fPos = pos(fermentHours, sF[0], sF[1]);  // 0–1 within style F range
  const plPos = flourPL !== undefined ? pos(flourPL, sPL[0], sPL[1]) : 0.5;

  // === W ↔ Hydration: proportional within style ranges ===
  // If W is low in its range but H is high in its range → mismatch
  if (wPos < 0.3 && hPos > 0.7) {
    const suggestedMinW = Math.round((sW[0] + (sW[1] - sW[0]) * hPos * 0.9) / 10) * 10;
    hints.flourW = {
      adaptiveMin: Math.max(sW[0], suggestedMinW),
      hint: t(cfg.hintHighHydrationNeedsW, { h: String(hydration), w: String(suggestedMinW) }),
    };
  }

  if (hPos > 0.8 && wPos < 0.5) {
    const suggestedMaxH = Math.round(sH[0] + (sH[1] - sH[0]) * Math.max(0.3, wPos));
    hints.hydration = {
      adaptiveMax: Math.min(sH[1], suggestedMaxH),
      hint: t(cfg.hintLowWLimitsHydration, { w: String(flourW), h: String(suggestedMaxH) }),
    };
  }

  // === High W in range → can push H slightly beyond range ===
  if (wPos > 0.8 && hydration <= sH[1]) {
    const bonusH = Math.round(sH[1] + (sH[1] - sH[0]) * 0.1); // +10% of range width
    if (bonusH > sH[1]) {
      hints.hydration = hints.hydration || {
        adaptiveMax: bonusH,
        hint: t(cfg.hintHighWAllowsMoreHydration, { w: String(flourW), h: String(bonusH) }),
      };
    }
  }

  // === Fermentation → Temp advice (relative to style range) ===
  if (fPos > 0.6 && fermentTemp > 16) {
    // Upper 40% of fermentation range + ambient temp → suggest fridge
    hints.fermentTemp = {
      hint: t(cfg.hintLongFermentUseFridge, { hours: String(fermentHours) }),
      suggestedTemp: "fridge",
    };
  } else if (fPos < 0.3 && fermentTemp <= 6) {
    // Lower 30% of fermentation range + fridge → suggest ambient
    hints.fermentTemp = {
      hint: t(cfg.hintShortFermentUseWarm, { hours: String(fermentHours) }),
      suggestedTemp: "ambient",
    };
  } else if (fPos >= 0.3 && fPos <= 0.6 && (fermentTemp <= 6 || fermentTemp > 16)) {
    // Middle range → suggest cool
    hints.fermentTemp = {
      hint: t(cfg.hintMediumFermentUseCool, { hours: String(fermentHours) }),
      suggestedTemp: "cool",
    };
  }

  // === Hydration → Fermentation: high H in range needs proportionally high F ===
  if (hPos > 0.7 && fPos < 0.3) {
    const suggestedMinF = Math.round(sF[0] + (sF[1] - sF[0]) * hPos * 0.8);
    hints.fermentation = {
      adaptiveMin: Math.max(sF[0], suggestedMinF),
      hint: t(cfg.hintHighHydrationNeedsTime, { h: String(hydration), hours: String(suggestedMinF) }),
    };
  }

  // === Hydration → P/L: high H needs low P/L (proportional inverse) ===
  if (flourPL !== undefined && hPos > 0.7 && plPos > 0.7) {
    // Both high in range → mismatch (should be inverse)
    const suggestedMaxPL = Math.round((sPL[0] + (sPL[1] - sPL[0]) * (1 - hPos * 0.8)) * 100) / 100;
    hints.flourPL = {
      adaptiveMax: Math.max(sPL[0], suggestedMaxPL),
      hint: t(cfg.hintLowPLForHighHydration, { pl: String(suggestedMaxPL) }),
    };
  }

  return hints;
}

/* ═══ ADAPTIVE HINT COMPONENT — estremamente compatto e inline ═══ */
function AdaptiveHint({ hint, adaptiveMin, adaptiveMax, unit, label }: {
  hint?: string;
  adaptiveMin?: number;
  adaptiveMax?: number;
  unit?: string;
  label: string;
}) {
  if (!hint) return null;
  return (
    <div
      className="flex items-start gap-1.5 px-1 py-0.5 mt-1 rounded-lg"
      style={{
        color: "var(--tertiary)",
        fontSize: "var(--font-size-sm)",
        lineHeight: 1.3,
      }}
    >
      <Sparkles size={12} className="flex-shrink-0 mt-0.5" />
      <span className="flex-1">
        <strong>
          {label}
          {adaptiveMin !== undefined || adaptiveMax !== undefined ? " " : ""}
          {adaptiveMin !== undefined && adaptiveMax !== undefined
            ? `(${adaptiveMin}–${adaptiveMax}${unit || ""})`
            : adaptiveMin !== undefined
              ? `(≥ ${adaptiveMin}${unit || ""})`
              : adaptiveMax !== undefined
                ? `(≤ ${adaptiveMax}${unit || ""})`
                : ""}
          :
        </strong>{" "}
        {hint}
      </span>
    </div>
  );
}

/* ═══ Slider track gradients — Tier 3 component tokens ═══ */
const SLIDER_GRADIENTS = {
  hydration: "var(--grad-slider-hydration)",
  flourW: "var(--grad-slider-flour)",
  fermentation: "var(--grad-slider-ferment)",
  temperature: "var(--grad-slider-temp)",
};

export function applyVersionParams(
  version: StyleVersion,
  callbacks: {
    onHydrationChange: (v: number) => void;
    onFlourWChange: (v: number) => void;
    onFlourPLChange: (v: number | undefined) => void;
    onFermentHoursChange: (v: number) => void;
    onFermentTempChange: (v: number) => void;
    onPreFermentChange: (v: boolean) => void;
    onVersionChange: (v: string) => void;
  }
) {
  callbacks.onHydrationChange(version.params.hydration_pct);
  callbacks.onFlourWChange(version.params.flour_w);
  callbacks.onFlourPLChange(version.params.flour_pl);
  callbacks.onFermentHoursChange(version.params.fermentation_hours);
  callbacks.onFermentTempChange(version.params.fermentation_temp_c);
  callbacks.onPreFermentChange(version.params.use_pre_ferment);
  callbacks.onVersionChange(version.id);
}

export function RecipeConfigurator({
  style,
  constraints,
  onConstraintsChange,
  customHydration,
  onHydrationChange,
  customFlourW,
  onFlourWChange,
  customFermentHours,
  onFermentHoursChange,
  customFermentTemp,
  onFermentTempChange,
  usePreFerment,
  onPreFermentChange,
  customFlourPL,
  onFlourPLChange,
  customSalt,
  onSaltChange,
  science,
  panConfig,
  onPanConfigChange,
}: RecipeConfiguratorProps) {
  /* Single-call update for oven to avoid the double-update bug */
  const handleOvenSelect = (id: string, maxTemp: number) => {
    onConstraintsChange({
      ...constraints,
      oven_type: id as OvenType,
      oven_max_temp_c: maxTemp,
    });
  };

  const { cms, bcp47 } = useCms();
  const cfg = cms.configurator;
  const fmt = createFormatter(cms.ui, bcp47);
  /* Temperature di riferimento per i tre regimi di fermentazione (°C),
     formattate secondo il sistema di unità dell'utente. */
  const fridgeTemp = fmt.celsius(4);
  const coolTemp = fmt.celsius(12);
  const ambientTemp = fmt.celsius(22);

  const [smartLink, setSmartLink] = useState(true);
  const propagatingRef = useRef(false);

  const sH = style.dough.hydration_pct_range;
  const sW = style.dough.flour_w_range;
  const sPL = style.dough.flour_pl_range;
  const sF = style.dough.fermentation_hours_range;

  // F12 (audit role-play): la tacca "ottimale" degli slider puntava al MIDPOINT
  // del range. Ora che il default generato è già ottimizzato, il midpoint è
  // fuorviante. Puntiamo la tacca all'OTTIMO reale per il tuo setup (idratazione,
  // W, fermentazione). ~0.1ms, memoizzato su stile+vincoli.
  const optimum = useMemo(() => {
    try {
      return optimizeRecipe(style, constraints).params;
    } catch {
      return null;
    }
  }, [style, constraints]);

  const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

  const ratio = (v: number, lo: number, hi: number) =>
    hi === lo ? 0.5 : (v - lo) / (hi - lo);

  const mapTo = (r: number, tLo: number, tHi: number, sliderMin: number, sliderMax: number, step: number) => {
    const margin = (tHi - tLo) * 0.2;
    const raw = tLo + r * (tHi - tLo);
    const clamped = clamp(raw, tLo - margin, tHi + margin);
    const snapped = Math.round(clamped / step) * step;
    return clamp(snapped, sliderMin, sliderMax);
  };

  const mapToInverse = (r: number, tLo: number, tHi: number, sliderMin: number, sliderMax: number, step: number) => {
    return mapTo(1 - r, tLo, tHi, sliderMin, sliderMax, step);
  };

  const tempFromHours = (hours: number): number => {
    const midF = (sF[0] + sF[1]) / 2;
    if (hours >= midF + (sF[1] - midF) * 0.3) return 4;    // upper third → fridge
    if (hours >= midF - (midF - sF[0]) * 0.3) return 12;   // middle third → cool
    return 22;                                                // lower third → ambient
  };

  const hoursFromTemp = (temp: number): number => {
    if (temp <= 6) return Math.round(sF[0] + (sF[1] - sF[0]) * 0.8);    // fridge → 80% of range
    if (temp <= 16) return Math.round(sF[0] + (sF[1] - sF[0]) * 0.5);   // cool → 50% of range
    return Math.round(sF[0] + (sF[1] - sF[0]) * 0.2);                    // ambient → 20% of range
  };

  const propagate = (source: string, value: number) => {
    if (!smartLink || propagatingRef.current) return;
    propagatingRef.current = true;

    if (source === "fermentTemp") {
      const hours = hoursFromTemp(value);
      onFermentHoursChange(hours);
      const r = ratio(hours, sF[0], sF[1]);
      onHydrationChange(mapTo(r, sH[0], sH[1], 45, 105, 1));
      onFlourWChange(mapTo(r, sW[0], sW[1], 100, 420, 10));
      if (onFlourPLChange) onFlourPLChange(mapToInverse(r, sPL[0], sPL[1], 0.30, 0.90, 0.01));
    } else {
      let r: number;
      switch (source) {
        case "hydration":    r = ratio(value, sH[0], sH[1]); break;
        case "flourW":       r = ratio(value, sW[0], sW[1]); break;
        case "flourPL":      r = ratio(value, sPL[0], sPL[1]); r = 1 - r; break; // P/L is inverse
        case "fermentHours": r = ratio(value, sF[0], sF[1]); break;
        default: r = 0.5;
      }

      if (source !== "hydration")    onHydrationChange(mapTo(r, sH[0], sH[1], 45, 105, 1));
      if (source !== "flourW")       onFlourWChange(mapTo(r, sW[0], sW[1], 100, 420, 10));
      if (source !== "flourPL" && onFlourPLChange)
        onFlourPLChange(mapToInverse(r, sPL[0], sPL[1], 0.30, 0.90, 0.01));
      if (source !== "fermentHours") {
        const hours = mapTo(r, sF[0], sF[1], 1, 96, 1);
        onFermentHoursChange(hours);
        onFermentTempChange(tempFromHours(hours));
      } else {
        onFermentTempChange(tempFromHours(value));
      }
    }

    propagatingRef.current = false;
  };

  const handleH = (v: number) => { onHydrationChange(v); propagate("hydration", v); };
  const handleW = (v: number) => { onFlourWChange(v); propagate("flourW", v); };
  const handlePL = (v: number) => { const r = Math.round(v * 100) / 100; onFlourPLChange?.(r); propagate("flourPL", r); };
  const handleFH = (v: number) => { onFermentHoursChange(v); propagate("fermentHours", v); };
  const handleFT = (v: number) => { onFermentTempChange(v); propagate("fermentTemp", v); };

  const adaptiveHints = computeAdaptiveHints(
    style,
    customHydration,
    customFlourW,
    customFermentHours,
    customFermentTemp,
    customFlourPL,
    cfg,
  );

  const suggestedTemp = adaptiveHints.fermentTemp?.suggestedTemp;

  return (
    <div className="flex flex-col gap-4 lg:gap-5 pb-4">
      {/* Smart Link — barra compatta, singolo tap-target */}
      <button
        onClick={() => setSmartLink(!smartLink)}
        className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-left active:scale-[0.99] transition-all"
        style={{
          background: smartLink ? "color-mix(in srgb, var(--tertiary) 8%, transparent)" : "var(--surface-container)",
          border: smartLink ? "1.5px solid var(--tertiary)" : "1px solid var(--outline-variant)",
          cursor: "pointer",
        }}
        aria-pressed={smartLink}
        aria-label={smartLink ? "Disattiva Smart Link" : "Attiva Smart Link"}
      >
        <span style={{ color: smartLink ? "var(--tertiary)" : "var(--text-muted)" }} className="flex-shrink-0">
          {smartLink ? <Link size={16} /> : <Unlink size={16} />}
        </span>
        <span
          className="flex-shrink-0"
          style={{
            color: smartLink ? "var(--tertiary)" : "var(--text-default)",
            fontSize: "var(--font-size-md)",
            fontWeight: "var(--weight-semibold)" as any,
          }}
        >
          Smart Link
        </span>
        <span
          className="hidden sm:block truncate flex-1"
          style={{ color: "var(--text-muted)", fontSize: "var(--font-size-sm)" }}
        >
          {smartLink ? "i parametri si adattano fra loro" : "regolazione indipendente"}
        </span>
        <span
          className="relative w-11 h-6 rounded-full transition-all flex-shrink-0 ml-auto sm:ml-0"
          style={{ background: smartLink ? "var(--tertiary)" : "var(--switch-off)" }}
        >
          <motion.span
            className="absolute top-0.5 left-0 w-5 h-5 rounded-full bg-white block"
            style={{ boxShadow: "var(--shadow-sm)" }}
            animate={{ x: smartLink ? 22 : 2 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          />
        </span>
      </button>

      {/* 3-Column Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-4 lg:gap-6">
        
        {/* Column 1: Formula */}
        <div
          className="flex flex-col gap-4 bg-transparent sm:bg-[var(--surface-container-low)] border-0 sm:border border-[var(--config-border)] p-0 sm:p-5 rounded-2xl"
        >
          {/* Hydration */}
          <div>
            <GradientSlider
              label={<><Label>{cfg.hydrationLabel}</Label><InfoTip termId="hydration">{cfg.hydrationTip}</InfoTip></>}
              value={customHydration}
              onChange={handleH}
              min={45}
              max={105}
              step={1}
              unit="%"
              rangeMin={style.dough.hydration_pct_range[0]}
              rangeMax={style.dough.hydration_pct_range[1]}
              gradient={SLIDER_GRADIENTS.hydration}
              adaptiveMin={adaptiveHints.hydration?.adaptiveMin}
              adaptiveMax={adaptiveHints.hydration?.adaptiveMax}
              optimalValue={optimum?.hydration ?? Math.round((sH[0] + sH[1]) / 2)}
            />
            {adaptiveHints.hydration && (
              <AdaptiveHint
                hint={adaptiveHints.hydration.hint}
                adaptiveMin={adaptiveHints.hydration.adaptiveMin}
                adaptiveMax={adaptiveHints.hydration.adaptiveMax}
                unit="%"
                label={
                  adaptiveHints.hydration.adaptiveMax != null && adaptiveHints.hydration.adaptiveMin == null
                    ? (cfg.hintLimitMaxLabel || "limite max")
                    : adaptiveHints.hydration.adaptiveMin != null && adaptiveHints.hydration.adaptiveMax == null
                      ? (cfg.hintLimitMinLabel || "limite min")
                      : cfg.hintAdaptiveLabel
                }
              />
            )}
          </div>

          {/* F11 beginner mode: il principiante sceglie la farina in linguaggio
              naturale (W derivata), niente slider alveografici W/P/L. */}
          {constraints.skill_level === 1 ? (
            <BeginnerFlourPicker
              value={customFlourW}
              onChange={handleW}
              styleRange={style.dough.flour_w_range}
              label={<Label>{cfg.flourWLabel}</Label>}
            />
          ) : (
          <>
          {/* Flour W */}
          <div>
            <GradientSlider
              label={<><Label>{cfg.flourWLabel}</Label><InfoTip termId="w_alveograph">{cfg.flourWTip}</InfoTip></>}
              value={customFlourW}
              onChange={handleW}
              min={100}
              max={420}
              step={10}
              unit=""
              rangeMin={style.dough.flour_w_range[0]}
              rangeMax={style.dough.flour_w_range[1]}
              gradient={SLIDER_GRADIENTS.flourW}
              adaptiveMin={adaptiveHints.flourW?.adaptiveMin}
              adaptiveMax={adaptiveHints.flourW?.adaptiveMax}
              optimalValue={optimum?.flour_w ?? Math.round((sW[0] + sW[1]) / 2 / 10) * 10}
            />
            {adaptiveHints.flourW && (
              <AdaptiveHint
                hint={adaptiveHints.flourW.hint}
                adaptiveMin={adaptiveHints.flourW.adaptiveMin}
                adaptiveMax={adaptiveHints.flourW.adaptiveMax}
                unit=""
                label={
                  adaptiveHints.flourW.adaptiveMax != null && adaptiveHints.flourW.adaptiveMin == null
                    ? (cfg.hintLimitMaxLabel || "limite max")
                    : adaptiveHints.flourW.adaptiveMin != null && adaptiveHints.flourW.adaptiveMax == null
                      ? (cfg.hintLimitMinLabel || "limite min")
                      : cfg.hintAdaptiveLabel
                }
              />
            )}
          </div>

          {/* Flour P/L */}
          {customFlourPL !== undefined && onFlourPLChange && (
            <div>
              <GradientSlider
                label={<><Label>{cfg.plLabel}</Label><InfoTip termId="pl_ratio">{cfg.plTip}</InfoTip></>}
                value={Math.round(customFlourPL * 100) / 100}
                onChange={handlePL}
                min={0.30}
                max={0.90}
                step={0.01}
                unit=""
                rangeMin={style.dough.flour_pl_range[0]}
                rangeMax={style.dough.flour_pl_range[1]}
                gradient={SLIDER_GRADIENTS.flourW}
                adaptiveMin={adaptiveHints.flourPL?.adaptiveMin}
                adaptiveMax={adaptiveHints.flourPL?.adaptiveMax}
                optimalValue={Math.round((style.dough.flour_pl_range[0] + style.dough.flour_pl_range[1]) / 2 * 100) / 100}
              />
              {adaptiveHints.flourPL && (
                <AdaptiveHint
                  hint={adaptiveHints.flourPL.hint}
                  adaptiveMin={adaptiveHints.flourPL.adaptiveMin}
                  adaptiveMax={adaptiveHints.flourPL.adaptiveMax}
                  unit=""
                  label={
                    adaptiveHints.flourPL.adaptiveMax != null && adaptiveHints.flourPL.adaptiveMin == null
                      ? (cfg.hintLimitMaxLabel || "limite max")
                      : adaptiveHints.flourPL.adaptiveMin != null && adaptiveHints.flourPL.adaptiveMax == null
                        ? (cfg.hintLimitMinLabel || "limite min")
                        : cfg.hintAdaptiveLabel
                  }
                />
              )}
            </div>
          )}
          </>
          )}

          {/* F3 — Sale come leva (visibile a tutti: non è gergo alveografico) */}
          {customSalt !== undefined && onSaltChange && (
            <div>
              <GradientSlider
                label={<Label>Sale</Label>}
                value={Math.round(customSalt * 10) / 10}
                onChange={onSaltChange}
                min={1.5}
                max={3.5}
                step={0.1}
                unit="%"
                rangeMin={Math.max(1.5, style.dough.salt_pct - 0.3)}
                rangeMax={Math.min(3.5, style.dough.salt_pct + 0.3)}
                gradient={SLIDER_GRADIENTS.flourW}
                optimalValue={style.dough.salt_pct}
              />
            </div>
          )}
        </div>

        {/* Divider visible only on mobile */}
        <div className="md:hidden h-px bg-[var(--container-border-subtle)] my-3" />

        {/* Column 2: Processo */}
        <div
          className="flex flex-col gap-4 bg-transparent sm:bg-[var(--surface-container-low)] border-0 sm:border border-[var(--config-border)] p-0 sm:p-5 rounded-2xl"
        >
          <div>
            <div className="flex flex-col gap-4">
              {/* Lievitazione */}
              <div>
                <GradientSlider
                  label={<><Label>{cfg.fermentLabel}</Label><InfoTip>{cfg.fermentTip}</InfoTip></>}
                  value={customFermentHours}
                  onChange={handleFH}
                  min={1}
                  max={96}
                  step={1}
                  unit="h"
                  rangeMin={style.dough.fermentation_hours_range[0]}
                  rangeMax={style.dough.fermentation_hours_range[1]}
                  gradient={SLIDER_GRADIENTS.fermentation}
                  adaptiveMin={adaptiveHints.fermentation?.adaptiveMin}
                  adaptiveMax={adaptiveHints.fermentation?.adaptiveMax}
                  optimalValue={optimum?.fermentation_hours ?? Math.round((sF[0] + sF[1]) / 2)}
                />
                {adaptiveHints.fermentation && (
                  <AdaptiveHint
                    hint={adaptiveHints.fermentation.hint}
                    adaptiveMin={adaptiveHints.fermentation.adaptiveMin}
                    adaptiveMax={adaptiveHints.fermentation.adaptiveMax}
                    unit="h"
                    label={
                      adaptiveHints.fermentation.adaptiveMax != null && adaptiveHints.fermentation.adaptiveMin == null
                        ? (cfg.hintLimitMaxLabel || "limite max")
                        : adaptiveHints.fermentation.adaptiveMin != null && adaptiveHints.fermentation.adaptiveMax == null
                          ? (cfg.hintLimitMinLabel || "limite min")
                          : cfg.hintAdaptiveLabel
                    }
                  />
                )}
              </div>

              {/* Pre-fermento */}
              <div
                className="flex items-center gap-3 px-4 py-3 rounded-xl"
                style={{
                  background: "var(--config-bg)",
                  border: "1px solid var(--config-border)",
                }}
              >
                <div className="flex-1 flex items-center gap-2">
                  <span
                    style={{
                      color: "var(--text-default)",
                      fontSize: "var(--font-size-xl)",
                      fontWeight: "var(--weight-medium)" as any,
                    }}
                  >
                    {cfg.preFermentLabel}
                  </span>
                  <InfoTip size={14}>{cfg.preFermentTip}</InfoTip>
                </div>
                <Switch
                  checked={usePreFerment}
                  onCheckedChange={onPreFermentChange}
                />
              </div>

              {/* Temperatura di fermentazione */}
              <div>
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <Label>Temperatura</Label>
                    <InfoTip>Temperatura di fermentazione dell'impasto</InfoTip>
                  </div>
                  {suggestedTemp && (
                    <span
                      className="px-2 py-0.5 rounded-full text-xs font-semibold"
                      style={{
                        background: "color-mix(in srgb, var(--tertiary) 15%, transparent)",
                        color: "var(--tertiary)",
                        border: "1px solid color-mix(in srgb, var(--tertiary) 30%, transparent)",
                      }}
                    >
                      Consigliato: {
                        suggestedTemp === "fridge"
                          ? "Frigo"
                          : suggestedTemp === "cool"
                            ? "Fresco"
                            : "Ambiente"
                      }
                    </span>
                  )}
                </div>

                {(() => {
                  const activeVal = customFermentTemp <= 6 ? "fridge" : customFermentTemp <= 16 ? "cool" : "ambient";
                  const tempMap = { fridge: 4, cool: 12, ambient: 22 };
                  return (
                    <SegmentedControl
                      value={activeVal}
                      onValueChange={(val) => handleFT(tempMap[val])}
                      ariaLabel="Temperatura di fermentazione"
                      size="sm"
                      fullWidth
                      options={[
                        {
                          value: "fridge",
                          label: (
                            <span className="relative z-10 flex items-center justify-center gap-1">
                              {t(cfg.tempFridge, { fridgeTemp })}
                              {suggestedTemp === "fridge" && (
                                <span
                                  className="w-1.5 h-1.5 rounded-full"
                                  style={{
                                    background: activeVal === "fridge" ? "var(--chip-text-active)" : "var(--tertiary)",
                                  }}
                                  title="Consigliato"
                                />
                              )}
                            </span>
                          ),
                        },
                        {
                          value: "cool",
                          label: (
                            <span className="relative z-10 flex items-center justify-center gap-1">
                              {t(cfg.tempCool, { coolTemp })}
                              {suggestedTemp === "cool" && (
                                <span
                                  className="w-1.5 h-1.5 rounded-full"
                                  style={{
                                    background: activeVal === "cool" ? "var(--chip-text-active)" : "var(--tertiary)",
                                  }}
                                  title="Consigliato"
                                />
                              )}
                            </span>
                          ),
                        },
                        {
                          value: "ambient",
                          label: (
                            <span className="relative z-10 flex items-center justify-center gap-1">
                              {t(cfg.tempAmbient, { ambientTemp })}
                              {suggestedTemp === "ambient" && (
                                <span
                                  className="w-1.5 h-1.5 rounded-full"
                                  style={{
                                    background: activeVal === "ambient" ? "var(--chip-text-active)" : "var(--tertiary)",
                                  }}
                                  title="Consigliato"
                                />
                              )}
                            </span>
                          ),
                        },
                      ]}
                    />
                  );
                })()}
              </div>
            </div>
          </div>
        </div>

        {/* Divider visible only on mobile */}
        <div className="md:hidden h-px bg-[var(--container-border-subtle)] my-3" />

        {/* Column 3: Cottura */}
        <div
          className="flex flex-col gap-4 bg-transparent sm:bg-[var(--surface-container-low)] border-0 sm:border border-[var(--config-border)] p-0 sm:p-5 rounded-2xl"
        >
          {/* Temperatura di cottura */}
          <div>
            <GradientSlider
              label={<Label>Temperatura di cottura</Label>}
              value={constraints.oven_max_temp_c}
              onChange={(v) =>
                onConstraintsChange({
                  ...constraints,
                  oven_max_temp_c: v,
                })
              }
              min={200}
              max={550}
              step={5}
              unit="°C"
              rangeMin={style.baking.temp_c_range[0]}
              rangeMax={style.baking.temp_c_range[1]}
              gradient={SLIDER_GRADIENTS.temperature}
              optimalValue={Math.round((style.baking.temp_c_range[0] + style.baking.temp_c_range[1]) / 2 / 5) * 5}
            />
          </div>

          {/* Oven Selector */}
          <div>
            <PremiumSelect
              value={constraints.oven_type}
              onChange={(val) => {
                const preset = OVEN_PRESETS.find((p) => p.id === val);
                if (preset) {
                  handleOvenSelect(preset.id, preset.maxTemp);
                }
              }}
              options={OVEN_PRESETS.map((preset) => {
                const name = preset.name.toLowerCase().startsWith("forno")
                  ? preset.name
                  : `Forno ${preset.name.toLowerCase()}`;
                return {
                  value: preset.id,
                  label: name,
                  subLabel: `max ${preset.maxTemp}°C`,
                };
              })}
            />
          </div>

          {/* Pan — visible only when needed */}
          {needsPan(style) && panConfig && onPanConfigChange && (() => {
            const currentShape = panConfig.panShape ?? defaultPanShape(style);
            const handleShapeChange = (shape: PanShape) => {
              if (shape === currentShape) return;
              if (shape === "rectangular") {
                onPanConfigChange({
                  ...panConfig,
                  panShape: "rectangular",
                  panLength: style.shape.length_cm ?? 30,
                  panWidth: style.shape.width_cm ?? 20,
                });
              } else {
                onPanConfigChange({
                  ...panConfig,
                  panShape: "round",
                  panDiameter: style.shape.diameter_cm ?? 26,
                });
              }
            };
            const area = currentShape === "rectangular"
              ? (panConfig.panLength ?? style.shape.length_cm ?? 30) * (panConfig.panWidth ?? style.shape.width_cm ?? 20)
              : Math.round(Math.PI * Math.pow((panConfig.panDiameter ?? style.shape.diameter_cm ?? 26) / 2, 2));

            return (
              <div className="flex flex-col gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <Label>{cfg.panLabel}</Label>
                    <InfoTip>
                      {defaultPanShape(style) === "rectangular" ? cfg.panTipRect : cfg.panTipRound}
                    </InfoTip>
                  </div>

                  {/* Shape selector dropdown */}
                  <PremiumSelect
                    value={currentShape}
                    onChange={(val) => handleShapeChange(val as PanShape)}
                    options={[
                      { value: "rectangular", label: cfg.panRectangular },
                      { value: "round", label: cfg.panRound },
                    ]}
                  />
                </div>

                {/* Rectangular dimensions */}
                {currentShape === "rectangular" && (
                  <div className="flex flex-col gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span style={{
                          color: "var(--text-muted)",
                          fontSize: "var(--font-size-lg)",
                          fontWeight: "var(--weight-medium)" as any,
                        }}>{cfg.panLength}</span>
                      </div>
                      <GradientSlider
                        value={panConfig.panLength ?? style.shape.length_cm ?? 30}
                        onChange={(v) => onPanConfigChange({ ...panConfig, panLength: v })}
                        min={20}
                        max={60}
                        step={1}
                        unit=" cm"
                        rangeMin={style.shape.length_cm ? style.shape.length_cm - 5 : undefined}
                        rangeMax={style.shape.length_cm ? style.shape.length_cm + 5 : undefined}
                        gradient={SLIDER_GRADIENTS.flourW}
                        optimalValue={style.shape.length_cm ?? undefined}
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span style={{
                          color: "var(--text-muted)",
                          fontSize: "var(--font-size-lg)",
                          fontWeight: "var(--weight-medium)" as any,
                        }}>{cfg.panWidth}</span>
                      </div>
                      <GradientSlider
                        value={panConfig.panWidth ?? style.shape.width_cm ?? 20}
                        onChange={(v) => onPanConfigChange({ ...panConfig, panWidth: v })}
                        min={15}
                        max={45}
                        step={1}
                        unit=" cm"
                        rangeMin={style.shape.width_cm ? style.shape.width_cm - 5 : undefined}
                        rangeMax={style.shape.width_cm ? style.shape.width_cm + 5 : undefined}
                        gradient={SLIDER_GRADIENTS.flourW}
                        optimalValue={style.shape.width_cm ?? undefined}
                      />
                    </div>
                  </div>
                )}

                {/* Round dimension */}
                {currentShape === "round" && (
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span style={{
                        color: "var(--text-muted)",
                        fontSize: "var(--font-size-lg)",
                        fontWeight: "var(--weight-medium)" as any,
                      }}>{cfg.panDiameter}</span>
                    </div>
                    <GradientSlider
                      value={panConfig.panDiameter ?? style.shape.diameter_cm ?? 26}
                      onChange={(v) => onPanConfigChange({ ...panConfig, panDiameter: v })}
                      min={15}
                      max={45}
                      step={1}
                      unit=" cm"
                      rangeMin={style.shape.diameter_cm ? style.shape.diameter_cm - 3 : undefined}
                      rangeMax={style.shape.diameter_cm ? style.shape.diameter_cm + 3 : undefined}
                      gradient={SLIDER_GRADIENTS.flourW}
                      optimalValue={style.shape.diameter_cm ?? undefined}
                    />
                  </div>
                )}

                {/* Area summary */}
                <div
                  className="flex items-center gap-3 px-4 py-3 mt-3 rounded-xl"
                  style={{
                    background: "var(--config-bg)",
                    border: "1px solid var(--config-border)",
                  }}
                >
                  {currentShape === "rectangular"
                    ? <RectangleHorizontal size={14} style={{ color: "var(--icon-muted)" }} />
                    : <Circle size={14} style={{ color: "var(--icon-muted)" }} />
                  }
                  <span style={{
                    fontSize: "var(--font-size-lg)",
                    color: "var(--text-muted)",
                    fontWeight: "var(--weight-medium)" as any,
                  }}>
                    {cfg.panArea}
                  </span>
                  <span className="type-numeric ml-auto" style={{
                    fontSize: "var(--font-size-xl-5)",
                    fontWeight: "var(--weight-bold)" as any,
                    color: "var(--config-value-color)",
                  }}>
                    {area} cm²
                  </span>
                </div>
              </div>
            );
          })()}

          {/* Thickness — visible only when style supports it */}
          {supportsThickness(style) && panConfig && onPanConfigChange && (
            <div>
              <div className="flex items-center gap-2">
                <Label>{cfg.thicknessLabel}</Label>
                <InfoTip>{cfg.thicknessTip}</InfoTip>
              </div>
              <GradientSlider
                value={Math.round((panConfig.thickness ?? style.shape.thickness_factor) * 100) / 100}
                onChange={(v) => onPanConfigChange({ ...panConfig, thickness: Math.round(v * 100) / 100 })}
                min={Math.max(0.05, Math.round((style.shape.thickness_factor * 0.4) * 100) / 100)}
                max={Math.round((style.shape.thickness_factor * 2.0) * 100) / 100}
                step={0.02}
                unit=""
                rangeMin={Math.round((style.shape.thickness_factor * 0.8) * 100) / 100}
                rangeMax={Math.round((style.shape.thickness_factor * 1.2) * 100) / 100}
                gradient={SLIDER_GRADIENTS.fermentation}
                optimalValue={Math.round(style.shape.thickness_factor * 100) / 100}
              />
              <div
                className="flex items-center gap-3 px-4 py-3 mt-3 rounded-xl"
                style={{
                  background: "var(--config-bg)",
                  border: "1px solid var(--config-border)",
                }}
              >
                <Layers size={14} style={{ color: "var(--icon-muted)" }} />
                <span style={{
                  fontSize: "var(--font-size-lg)",
                  color: "var(--text-muted)",
                  fontWeight: "var(--weight-medium)" as any,
                }}>
                  {(panConfig.thickness ?? style.shape.thickness_factor) < style.shape.thickness_factor * 0.7
                    ? cfg.thicknessThin
                    : (panConfig.thickness ?? style.shape.thickness_factor) > style.shape.thickness_factor * 1.3
                      ? cfg.thicknessThick
                      : cfg.thicknessStandard}
                </span>
              </div>
            </div>
          )}
        </div>
        
      </div>
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="truncate"
      style={{ fontSize: "var(--font-size-lg)", fontWeight: "var(--weight-semibold)" as any }}
    >
      {children}
    </span>
  );
}

/* ═══ BEGINNER FLOUR PICKER (Audit role-play giugno 2026, F11) ═══
   Per il principiante, W e P/L alveografici sono una barriera: non conosce la
   forza della sua farina. Qui sceglie in linguaggio naturale (debole/media/forte
   con esempi reali) e il motore deriva la W. Mostrato solo a skill_level === 1. */
const BEGINNER_FLOURS: { label: string; sub: string; w: number }[] = [
  { label: "Debole", sub: "00 supermercato", w: 185 },
  { label: "Media", sub: "0 / per pizza", w: 250 },
  { label: "Forte", sub: "Manitoba", w: 350 },
];

function BeginnerFlourPicker({
  value,
  onChange,
  styleRange,
  label,
}: {
  value: number;
  onChange: (w: number) => void;
  styleRange: [number, number];
  label: React.ReactNode;
}) {
  const selected = BEGINNER_FLOURS.reduce((best, f) =>
    Math.abs(f.w - value) < Math.abs(best.w - value) ? f : best,
  );
  const [wMin, wMax] = styleRange;
  const fit = value >= wMin - 25 && value <= wMax + 25 ? "ideal" : value < wMin ? "weak" : "strong";
  return (
    <div>
      <div className="mb-2">{label}</div>
      <div className="flex gap-2">
        {BEGINNER_FLOURS.map((f) => {
          const active = f === selected;
          return (
            <button
              key={f.label}
              type="button"
              onClick={() => onChange(f.w)}
              className="flex-1 rounded-xl px-2 py-2.5 text-left transition-all active:scale-[0.98]"
              style={{
                background: active ? "color-mix(in srgb, var(--tertiary) 12%, transparent)" : "var(--surface-container)",
                border: active ? "1.5px solid var(--tertiary)" : "1px solid var(--outline-variant)",
                cursor: "pointer",
              }}
              aria-pressed={active}
            >
              <span
                className="block"
                style={{ fontSize: "var(--font-size-md)", fontWeight: "var(--weight-semibold)" as any, color: active ? "var(--tertiary)" : "var(--text-default)" }}
              >
                {f.label}
              </span>
              <span className="block truncate" style={{ fontSize: "var(--font-size-xs)", color: "var(--text-muted)" }}>
                {f.sub}
              </span>
            </button>
          );
        })}
      </div>
      <p className="mt-1.5" style={{ fontSize: "var(--font-size-sm)", color: fit === "ideal" ? "var(--text-accent)" : "var(--text-muted)" }}>
        {fit === "ideal"
          ? "Perfetta per questo stile."
          : fit === "weak"
            ? "Un po' debole per questo stile: l'impasto reggerà meno."
            : "Più forte del necessario: nessun problema."}
      </p>
    </div>
  );
}

/* ═══ GRADIENT SLIDER ═══ */
function GradientSlider({
  value,
  onChange,
  min,
  max,
  step,
  unit,
  rangeMin,
  rangeMax,
  gradient,
  adaptiveMin,
  adaptiveMax,
  optimalValue,
  label,
}: {
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step: number;
  unit: string;
  rangeMin?: number;
  rangeMax?: number;
  gradient: string;
  adaptiveMin?: number;
  adaptiveMax?: number;
  optimalValue?: number;
  label?: React.ReactNode;
}) {
  const pct = ((value - min) / (max - min)) * 100;
  const inRange =
    rangeMin !== undefined && rangeMax !== undefined
      ? value >= rangeMin && value <= rangeMax
      : true;

  const zoneLeftPct =
    rangeMin !== undefined
      ? ((rangeMin - min) / (max - min)) * 100
      : 0;
  const zoneRightPct =
    rangeMax !== undefined
      ? ((rangeMax - min) / (max - min)) * 100
      : 100;

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between gap-3">
        {label && (
          <div className="flex items-center gap-1.5 min-w-0">{label}</div>
        )}
        <span
          className="type-numeric ml-auto flex-shrink-0"
          style={{
            fontSize: "var(--font-size-3xl)",
            fontWeight: "var(--weight-bold)" as any,
            lineHeight: 1,
            color: inRange
              ? "var(--config-value-color)"
              : "var(--config-value-oor)",
          }}
        >
          {value}
          {unit}
        </span>
      </div>

      <div className="relative h-9 flex items-center">
        {/* Track background */}
        <div className="absolute left-0 right-0 h-2 rounded-full overflow-hidden">
          <div
            className="w-full h-full rounded-full"
            style={{ background: gradient, opacity: 0.2 }}
          />
        </div>

        {/* Optimal zone */}
        {rangeMin !== undefined && rangeMax !== undefined && (
          <div
            className="absolute h-2 rounded-full"
            style={{
              left: `${zoneLeftPct}%`,
              width: `${zoneRightPct - zoneLeftPct}%`,
              background: gradient,
              opacity: inRange ? 0.35 : 0.15,
              maskImage:
                "linear-gradient(90deg, transparent, black 10%, black 90%, transparent)",
              WebkitMaskImage:
                "linear-gradient(90deg, transparent, black 10%, black 90%, transparent)",
            }}
          />
        )}

        {/* Filled track */}
        <div
          className="absolute h-2 rounded-full overflow-hidden"
          style={{ left: 0, width: `${pct}%` }}
        >
          <div
            className="h-full rounded-full"
            style={{
              background: gradient,
              width: `${(100 / pct) * 100}%`,
              opacity: 0.85,
            }}
          />
        </div>

        {/* Zone markers */}
        {rangeMin !== undefined && (
          <div
            className="absolute top-0 bottom-0 flex items-center"
            style={{ left: `${zoneLeftPct}%` }}
          >
            <div
              className="w-0.5 h-4 rounded-full"
              style={{ background: "var(--config-divider)" }}
            />
          </div>
        )}
        {rangeMax !== undefined && (
          <div
            className="absolute top-0 bottom-0 flex items-center"
            style={{ left: `${zoneRightPct}%` }}
          >
            <div
              className="w-0.5 h-4 rounded-full"
              style={{ background: "var(--config-divider)" }}
            />
          </div>
        )}

        {/* Adaptive limit markers (dashed barrier lines) */}
        {adaptiveMin !== undefined && adaptiveMin >= min && adaptiveMin <= max && (
          <div
            className="absolute top-0 bottom-0 flex flex-col items-center justify-center"
            style={{ left: `${((adaptiveMin - min) / (max - min)) * 100}%`, zIndex: 5 }}
          >
            <div style={{
              width: 2, height: 16,
              background: `repeating-linear-gradient(to bottom, var(--tertiary) 0px, var(--tertiary) 3px, transparent 3px, transparent 5px)`,
              borderRadius: 1,
              opacity: 0.8,
            }} />
            <div style={{
              width: 8, height: 2,
              background: "var(--tertiary)",
              borderRadius: 1,
              marginTop: -1,
              opacity: 0.8,
            }} />
          </div>
        )}
        {adaptiveMax !== undefined && adaptiveMax >= min && adaptiveMax <= max && (
          <div
            className="absolute top-0 bottom-0 flex flex-col items-center justify-center"
            style={{ left: `${((adaptiveMax - min) / (max - min)) * 100}%`, zIndex: 5 }}
          >
            <div style={{
              width: 2, height: 16,
              background: `repeating-linear-gradient(to bottom, var(--tertiary) 0px, var(--tertiary) 3px, transparent 3px, transparent 5px)`,
              borderRadius: 1,
              opacity: 0.8,
            }} />
            <div style={{
              width: 8, height: 2,
              background: "var(--tertiary)",
              borderRadius: 1,
              marginTop: -1,
              opacity: 0.8,
            }} />
          </div>
        )}

        {/* Optimal sweet spot marker (▼ triangle) */}
        {optimalValue !== undefined && optimalValue >= min && optimalValue <= max && (() => {
          const optPct = ((optimalValue - min) / (max - min)) * 100;
          return (
            <div
              className="absolute flex flex-col items-center"
              style={{ left: `${optPct}%`, top: 0, zIndex: 4, transform: "translateX(-50%)" }}
            >
              <svg width="10" height="6" viewBox="0 0 10 6" style={{ display: "block" }}>
                <path d="M5 6L0 0h10z" fill="var(--cta)" opacity="0.7" />
              </svg>
            </div>
          );
        })()}

        {/* Native input */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute inset-0 w-full appearance-none bg-transparent cursor-pointer z-10
            [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6
            [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-md
            [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:border-[3px] [&::-webkit-slider-thumb]:border-primary
            [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:duration-100
            hover:[&::-webkit-slider-thumb]:scale-110 active:[&::-webkit-slider-thumb]:scale-95
            [&::-moz-range-thumb]:w-6 [&::-moz-range-thumb]:h-6 [&::-moz-range-thumb]:rounded-full
            [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-[3px] [&::-moz-range-thumb]:border-primary
            [&::-moz-range-thumb]:transition-transform [&::-moz-range-thumb]:duration-100
            hover:[&::-moz-range-thumb]:scale-110 active:[&::-moz-range-thumb]:scale-95
            [&::-moz-range-track]:bg-transparent"
        />
      </div>

      {/* Zone labels */}
      {rangeMin !== undefined && rangeMax !== undefined && (
        <div className="relative h-4">
          <span
            className="absolute type-numeric"
            style={{
              color: "var(--text-muted)",
              left: `${zoneLeftPct}%`,
              transform: "translateX(-50%)",
              fontSize: "var(--font-size-sm)",
            }}
          >
            {rangeMin}
          </span>
          <span
            className="absolute type-numeric"
            style={{
              color: "var(--text-muted)",
              left: `${zoneRightPct}%`,
              transform: "translateX(-50%)",
              fontSize: "var(--font-size-sm)",
            }}
          >
            {rangeMax}
          </span>
        </div>
      )}
    </div>
  );
}
