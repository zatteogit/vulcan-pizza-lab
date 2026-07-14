import { Check,ChevronDown,Circle,Layers,Link,RectangleHorizontal,Sparkles,Unlink } from "lucide-react";
import { AnimatePresence,motion } from "motion/react";
import { motionSpring,motionTiming } from "../../components/ds/motion";
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
import { SegmentedControl, Switch } from "../../components/ds/index";
import { uiMessage } from "../../i18n/ui-messages";

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
    <div ref={containerRef} className="config-select">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={open ? "config-select__trigger config-select__trigger--open" : "config-select__trigger"}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        {activeOption?.icon && (
          <span className="config-select__icon">
            {activeOption.icon}
          </span>
        )}
        <div className="config-select__body">
          <span className="config-select__value">{activeOption?.label || placeholder}</span>
          {activeOption?.subLabel && (
            <span className="config-select__sublabel">
              {activeOption.subLabel}
            </span>
          )}
        </div>
        <ChevronDown size={16} className="config-select__chevron" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.97 }}
            transition={motionSpring.configuratorControl}
            className="config-select__menu"
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
                <div key={idx} className="config-select__group">
                  {idx > 0 && (
                    <div className="config-select__group-divider" />
                  )}
                  <div className="config-select__group-label">
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
      className={active ? "config-select__row config-select__row--active" : "config-select__row"}
      whileHover={{
        backgroundColor: active
          ? "var(--chip-bg-active)"
          : "color-mix(in srgb, var(--text-default) 6%, transparent)",
      }}
      whileTap={{ scale: 0.985 }}
      transition={motionTiming.instant}
      role="option"
      aria-selected={active}
    >
      {option.icon && (
        <span className="config-select__icon">
          {option.icon}
        </span>
      )}
      <div className="config-select__body">
        <span className="config-select__value">{option.label}</span>
        {option.subLabel && (
          <span className="config-select__sublabel">
            {option.subLabel}
          </span>
        )}
      </div>
      {option.suggested && (
        <span className="config-select__row-badge">
          {uiMessage("features.recipe.recipe-configurator.consigliato-f488c665")}</span>
      )}
      {active && <Check size={14} className="config-select__row-check" />}
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
    <div className="config-hint">
      <Sparkles size={12} className="config-hint__icon" />
      <span className="config-hint__text">
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
    <div className="config-root">
      {/* Smart Link — barra compatta, singolo tap-target */}
      <button
        onClick={() => setSmartLink(!smartLink)}
        className={smartLink ? "config-smart-link config-smart-link--active" : "config-smart-link"}
        aria-pressed={smartLink}
        aria-label={smartLink ? uiMessage("features.recipe.recipe-configurator.disattiva-smart-link-82c8c9bb") : uiMessage("features.recipe.recipe-configurator.attiva-smart-link-e1f2961f")}
      >
        <span className="config-smart-link__icon">
          {smartLink ? <Link size={16} /> : <Unlink size={16} />}
        </span>
        <span className="config-smart-link__title">
          {uiMessage("features.recipe.recipe-configurator.smart-link-95995174")}</span>
        <span className="config-smart-link__desc">
          {smartLink ? uiMessage("features.recipe.recipe-configurator.i-parametri-si-adattano-fra-loro-c31575f0") : uiMessage("features.recipe.recipe-configurator.regolazione-indipendente-f7040ded")}
        </span>
        <span className={smartLink ? "config-smart-link__switch config-smart-link__switch--active" : "config-smart-link__switch"}>
          <motion.span
            className="config-smart-link__thumb"
            animate={{ x: smartLink ? 22 : 2 }}
            transition={motionSpring.crispControl}
          />
        </span>
      </button>

      {/* 3-Column Grid Layout */}
      <div className="config-grid">

        {/* Column 1: Formula */}
        <div className="config-column">
          {/* Hydration */}
          <div className="config-field">
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
                    ? (cfg.hintLimitMaxLabel || uiMessage("features.recipe.recipe-configurator.limite-max-6dd61da8"))
                    : adaptiveHints.hydration.adaptiveMin != null && adaptiveHints.hydration.adaptiveMax == null
                      ? (cfg.hintLimitMinLabel || uiMessage("features.recipe.recipe-configurator.limite-min-ace7b14a"))
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
          <div className="config-field">
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
                    ? (cfg.hintLimitMaxLabel || uiMessage("features.recipe.recipe-configurator.limite-max-6dd61da8"))
                    : adaptiveHints.flourW.adaptiveMin != null && adaptiveHints.flourW.adaptiveMax == null
                      ? (cfg.hintLimitMinLabel || uiMessage("features.recipe.recipe-configurator.limite-min-ace7b14a"))
                      : cfg.hintAdaptiveLabel
                }
              />
            )}
          </div>

          {/* Flour P/L */}
          {customFlourPL !== undefined && onFlourPLChange && (
            <div className="config-field">
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
                      ? (cfg.hintLimitMaxLabel || uiMessage("features.recipe.recipe-configurator.limite-max-6dd61da8"))
                      : adaptiveHints.flourPL.adaptiveMin != null && adaptiveHints.flourPL.adaptiveMax == null
                        ? (cfg.hintLimitMinLabel || uiMessage("features.recipe.recipe-configurator.limite-min-ace7b14a"))
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
            <div className="config-field">
              <GradientSlider
                label={<Label>{uiMessage("features.recipe.recipe-configurator.sale-0028d743")}</Label>}
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
        <div className="config-divider" />

        {/* Column 2: Processo */}
        <div className="config-column">
          <div className="config-field">
            <div className="config-stack">
              {/* Lievitazione */}
              <div className="config-field">
                <GradientSlider
                  label={<><Label>{cfg.fermentLabel}</Label><InfoTip>{cfg.fermentTip}</InfoTip></>}
                  value={customFermentHours}
                  onChange={handleFH}
                  min={1}
                  max={96}
                  step={1}
                  unit={uiMessage("features.recipe.recipe-configurator.h-27d5482e")}
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
                    unit={uiMessage("features.recipe.recipe-configurator.h-27d5482e")}
                    label={
                      adaptiveHints.fermentation.adaptiveMax != null && adaptiveHints.fermentation.adaptiveMin == null
                        ? (cfg.hintLimitMaxLabel || uiMessage("features.recipe.recipe-configurator.limite-max-6dd61da8"))
                        : adaptiveHints.fermentation.adaptiveMin != null && adaptiveHints.fermentation.adaptiveMax == null
                          ? (cfg.hintLimitMinLabel || uiMessage("features.recipe.recipe-configurator.limite-min-ace7b14a"))
                          : cfg.hintAdaptiveLabel
                    }
                  />
                )}
              </div>

              {/* Pre-fermento */}
              <div className="config-toggle-row">
                <div className="config-toggle-row__label-group">
                  <span className="config-toggle-row__label">
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
              <div className="config-field">
                <div className="config-temp-header">
                  <div className="config-temp-header__label-group">
                    <Label>{uiMessage("features.recipe.recipe-configurator.temperatura-df12789a")}</Label>
                    <InfoTip>{uiMessage("features.recipe.recipe-configurator.temperatura-di-fermentazione-dell-impasto-737f1c50")}</InfoTip>
                  </div>
                  {suggestedTemp && (
                    <span className="config-temp-header__badge">
                      {uiMessage("features.recipe.recipe-configurator.consigliato-bf1907c1")}{
                        suggestedTemp === "fridge"
                          ? uiMessage("features.recipe.recipe-configurator.frigo-51f4c92e")
                          : suggestedTemp === "cool"
                            ? uiMessage("features.recipe.recipe-configurator.fresco-bffc946d")
                            : uiMessage("features.recipe.recipe-configurator.ambiente-e6fefb74")
                      }
                    </span>
                  )}
                </div>

                {(() => {
                  const activeVal = customFermentTemp <= 6 ? "fridge" : customFermentTemp <= 16 ? "cool" : "ambient";
                  const tempMap = { fridge: 4, cool: 12, ambient: 22 };
                  const isFridgeActive = activeVal === "fridge";
                  const isCoolActive = activeVal === "cool";
                  const isAmbientActive = activeVal === "ambient";
                  return (
                    <SegmentedControl
                      value={activeVal}
                      onValueChange={(val) => handleFT(tempMap[val])}
                      ariaLabel={uiMessage("features.recipe.recipe-configurator.temperatura-di-fermentazione-e4ff14ef")}
                      size="sm"
                      fullWidth
                      options={[
                        {
                          value: "fridge",
                          label: (
                            <span className="config-temp-option">
                              {t(cfg.tempFridge, { fridgeTemp })}
                              {suggestedTemp === "fridge" && (
                                <span
                                  className={isFridgeActive ? "config-temp-option__dot config-temp-option__dot--active" : "config-temp-option__dot"}
                                  title={uiMessage("features.recipe.recipe-configurator.consigliato-de822f3c")}
                                />
                              )}
                            </span>
                          ),
                        },
                        {
                          value: "cool",
                          label: (
                            <span className="config-temp-option">
                              {t(cfg.tempCool, { coolTemp })}
                              {suggestedTemp === "cool" && (
                                <span
                                  className={isCoolActive ? "config-temp-option__dot config-temp-option__dot--active" : "config-temp-option__dot"}
                                  title={uiMessage("features.recipe.recipe-configurator.consigliato-de822f3c")}
                                />
                              )}
                            </span>
                          ),
                        },
                        {
                          value: "ambient",
                          label: (
                            <span className="config-temp-option">
                              {t(cfg.tempAmbient, { ambientTemp })}
                              {suggestedTemp === "ambient" && (
                                <span
                                  className={isAmbientActive ? "config-temp-option__dot config-temp-option__dot--active" : "config-temp-option__dot"}
                                  title={uiMessage("features.recipe.recipe-configurator.consigliato-de822f3c")}
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
        <div className="config-divider" />

        {/* Column 3: Cottura */}
        <div className="config-column">
          {/* Temperatura di cottura */}
          <div className="config-field">
            <GradientSlider
              label={<Label>{uiMessage("features.recipe.recipe-configurator.temperatura-di-cottura-85a0cbf5")}</Label>}
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
          <div className="config-field">
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
              <div className="config-stack">
                <div className="config-field">
                  <div className="config-field-label">
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
                  <div className="config-stack">
                    <div className="config-field">
                      <div className="config-dim-label">
                        <span className="config-dim-label__text">{cfg.panLength}</span>
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
                    <div className="config-field">
                      <div className="config-dim-label">
                        <span className="config-dim-label__text">{cfg.panWidth}</span>
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
                  <div className="config-field">
                    <div className="config-dim-label">
                      <span className="config-dim-label__text">{cfg.panDiameter}</span>
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
                <div className="config-summary-row">
                  {currentShape === "rectangular"
                    ? <RectangleHorizontal size={14} className="config-summary-row__icon" />
                    : <Circle size={14} className="config-summary-row__icon" />
                  }
                  <span className="config-summary-row__label">
                    {cfg.panArea}
                  </span>
                  <span className="type-numeric config-summary-row__value">
                    {area} {uiMessage("features.recipe.recipe-configurator.cm2-7776ab6e")}</span>
                </div>
              </div>
            );
          })()}

          {/* Thickness — visible only when style supports it */}
          {supportsThickness(style) && panConfig && onPanConfigChange && (
            <div className="config-field">
              <div className="config-thickness-header">
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
              <div className="config-summary-row">
                <Layers size={14} className="config-summary-row__icon" />
                <span className="config-summary-row__label">
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
    <span className="config-label">
      {children}
    </span>
  );
}

/* ═══ BEGINNER FLOUR PICKER (Audit role-play giugno 2026, F11) ═══
   Per il principiante, W e P/L alveografici sono una barriera: non conosce la
   forza della sua farina. Qui sceglie in linguaggio naturale (debole/media/forte
   con esempi reali) e il motore deriva la W. Mostrato solo a skill_level === 1. */
const BEGINNER_FLOURS: { label: string; sub: string; w: number }[] = [
  { label: uiMessage("features.recipe.recipe-configurator.debole-62b6eb4c"), sub: "00 supermercato", w: 185 },
  { label: uiMessage("features.recipe.recipe-configurator.media-0c77aeec"), sub: "0 / per pizza", w: 250 },
  { label: uiMessage("features.recipe.recipe-configurator.forte-a88f9d1e"), sub: "Manitoba", w: 350 },
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
  const isIdealFit = fit === "ideal";
  return (
    <div className="config-flour-picker">
      <div className="config-flour-picker__label">{label}</div>
      <div className="config-flour-picker__options">
        {BEGINNER_FLOURS.map((f) => {
          const active = f === selected;
          return (
            <button
              key={f.label}
              type="button"
              onClick={() => onChange(f.w)}
              className={active ? "config-flour-picker__option config-flour-picker__option--active" : "config-flour-picker__option"}
              aria-pressed={active}
            >
              <span className="config-flour-picker__option-label">
                {f.label}
              </span>
              <span className="config-flour-picker__option-sub">
                {f.sub}
              </span>
            </button>
          );
        })}
      </div>
      <p className={isIdealFit ? "config-flour-picker__fit config-flour-picker__fit--ideal" : "config-flour-picker__fit"}>
        {fit === "ideal"
          ? uiMessage("features.recipe.recipe-configurator.perfetta-per-questo-stile-4307e09e")
          : fit === "weak"
            ? uiMessage("features.recipe.recipe-configurator.un-po-debole-per-questo-stile-l-impasto-re-dc7843a7")
            : uiMessage("features.recipe.recipe-configurator.piu-forte-del-necessario-nessun-problema-3a78c2c2")}
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
    <div
      className="config-slider"
      style={{
        ["--slider-gradient" as any]: gradient,
        ["--slider-fill" as any]: `${pct}%`,
        ["--slider-fill-bg" as any]: `${(100 / pct) * 100}%`,
        ["--slider-zone-left" as any]: `${zoneLeftPct}%`,
        ["--slider-zone-right" as any]: `${zoneRightPct}%`,
        ["--slider-zone-width" as any]: `${zoneRightPct - zoneLeftPct}%`,
      }}
    >
      <div className="config-slider__header">
        {label && (
          <div className="config-slider__label-group">{label}</div>
        )}
        <span className={inRange ? "type-numeric config-slider__value" : "type-numeric config-slider__value config-slider__value--oor"}>
          {value}
          {unit}
        </span>
      </div>

      <div className="config-slider__track-wrap">
        {/* Track background */}
        <div className="config-slider__track-bg">
          <div className="config-slider__track-bg-fill" />
        </div>

        {/* Optimal zone */}
        {rangeMin !== undefined && rangeMax !== undefined && (
          <div className={inRange ? "config-slider__zone-band" : "config-slider__zone-band config-slider__zone-band--out"} />
        )}

        {/* Filled track */}
        <div className="config-slider__fill">
          <div className="config-slider__fill-bg" />
        </div>

        {/* Zone markers */}
        {rangeMin !== undefined && (
          <div className="config-slider__zone-tick--start">
            <div className="config-slider__zone-tick-bar" />
          </div>
        )}
        {rangeMax !== undefined && (
          <div className="config-slider__zone-tick--end">
            <div className="config-slider__zone-tick-bar" />
          </div>
        )}

        {/* Adaptive limit markers (dashed barrier lines) */}
        {adaptiveMin !== undefined && adaptiveMin >= min && adaptiveMin <= max && (
          <div
            className="config-slider__limit-marker"
            style={{ ["--marker-pos" as any]: `${((adaptiveMin - min) / (max - min)) * 100}%` }}
          >
            <div className="config-slider__limit-marker-line" />
            <div className="config-slider__limit-marker-tick" />
          </div>
        )}
        {adaptiveMax !== undefined && adaptiveMax >= min && adaptiveMax <= max && (
          <div
            className="config-slider__limit-marker"
            style={{ ["--marker-pos" as any]: `${((adaptiveMax - min) / (max - min)) * 100}%` }}
          >
            <div className="config-slider__limit-marker-line" />
            <div className="config-slider__limit-marker-tick" />
          </div>
        )}

        {/* Optimal sweet spot marker (▼ triangle) */}
        {optimalValue !== undefined && optimalValue >= min && optimalValue <= max && (() => {
          const optPct = ((optimalValue - min) / (max - min)) * 100;
          return (
            <div
              className="config-slider__optimal-marker"
              style={{ ["--marker-pos" as any]: `${optPct}%` }}
            >
              <svg width="10" height="6" viewBox="0 0 10 6" className="config-slider__optimal-svg">
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
          className="config-slider__input"
        />
      </div>

      {/* Zone labels */}
      {rangeMin !== undefined && rangeMax !== undefined && (
        <div className="config-slider__zone-labels">
          <span className="type-numeric config-slider__zone-label">
            {rangeMin}
          </span>
          <span className="type-numeric config-slider__zone-label config-slider__zone-label--end">
            {rangeMax}
          </span>
        </div>
      )}
    </div>
  );
}
