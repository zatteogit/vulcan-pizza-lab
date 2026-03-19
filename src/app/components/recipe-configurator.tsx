import React, { useState, useRef } from "react";
import { motion } from "motion/react";
import { Thermometer, Snowflake, Sun, RectangleHorizontal, Layers, Link, Unlink } from "lucide-react";
import {
  PizzaStyle,
  UserConstraints,
  OvenType,
  OVEN_PRESETS,
  PanConfig,
  PanShape,
  needsPan,
  supportsThickness,
  defaultPanShape,
} from "./pizza-engine";
import { InfoTip } from "./info-tip";
import { GlossaryLink } from "./glossary-link";
import { useCms } from "./cms/cms-context";
import { t } from "./cms/i18n";

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

/* ═══ ADAPTIVE HINT COMPONENT ═══ */
function AdaptiveHint({ hint, adaptiveMin, adaptiveMax, unit, label }: {
  hint?: string;
  adaptiveMin?: number;
  adaptiveMax?: number;
  unit?: string;
  label: string;
}) {
  if (!hint) return null;
  const isLimit = (adaptiveMin !== undefined && adaptiveMax === undefined) || (adaptiveMax !== undefined && adaptiveMin === undefined);
  return (
    <motion.div
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className="flex items-start gap-2 px-3 py-2 mt-2 rounded-lg"
      style={{
        background: isLimit ? "rgba(204,136,68,0.06)" : "var(--surface-container)",
        border: isLimit ? "1px solid rgba(204,136,68,0.25)" : "1px solid var(--outline-variant)",
      }}
    >
      {isLimit ? (
        <svg width="14" height="14" viewBox="0 0 14 14" style={{ marginTop: 2, flexShrink: 0 }}>
          <line x1="7" y1="1" x2="7" y2="13" stroke="var(--tertiary)" strokeWidth="2" strokeDasharray="3 2" strokeLinecap="round" />
          <line x1="3" y1="12" x2="11" y2="12" stroke="var(--tertiary)" strokeWidth="2" strokeLinecap="round" />
        </svg>
      ) : (
        <span style={{ color: "var(--tertiary)", fontSize: "var(--font-size-base)", lineHeight: 1 }}>◆</span>
      )}
      <div className="flex flex-col gap-0.5">
        {adaptiveMin !== undefined || adaptiveMax !== undefined ? (
          <span
            className="font-mono"
            style={{
              color: "var(--tertiary)",
              fontSize: "var(--font-size-sm)",
              letterSpacing: "0.05em",
              textTransform: "uppercase" as const,
            }}
          >
            {label} {adaptiveMin !== undefined && adaptiveMax !== undefined
              ? `${adaptiveMin}–${adaptiveMax}${unit || ""}`
              : adaptiveMin !== undefined
                ? `≥ ${adaptiveMin}${unit || ""}`
                : `≤ ${adaptiveMax}${unit || ""}`}
          </span>
        ) : null}
        <span style={{
          color: "var(--text-muted)",
          fontSize: "var(--font-size-sm)",
          lineHeight: 1.4,
        }}>
          {hint}
        </span>
      </div>
    </motion.div>
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

  const { cms } = useCms();
  const cfg = cms.configurator;

  /* ═══ SMART LINK — Style-aware proportional parameter lock ═══
     Core idea: if H is at X% of its style range, W/P-L/fermentation
     should also be at X% of their style range. This guarantees that
     "in range" for one parameter ⇒ "in range" for all others.

     Correlation directions (within style ranges):
       H ↑  →  W ↑  (positive: wetter dough needs stronger flour)
       H ↑  →  P/L ↓ (negative: wetter dough needs more extensibility)
       H ↑  →  Ferm ↑ (positive: wetter dough needs more time)
       Ferm ↑ → Temp ↓ (discrete: long→fridge, medium→cool, short→ambient)

     Outside style ranges we extrapolate proportionally with a soft margin
     of ±20% of the range width, then hard-clamp to slider bounds. */
  const [smartLink, setSmartLink] = useState(true);
  const propagatingRef = useRef(false);

  const sH = style.dough.hydration_pct_range;
  const sW = style.dough.flour_w_range;
  const sPL = style.dough.flour_pl_range;
  const sF = style.dough.fermentation_hours_range;

  const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

  /** Compute ratio 0–1 of value within [lo, hi], with soft extrapolation */
  const ratio = (v: number, lo: number, hi: number) =>
    hi === lo ? 0.5 : (v - lo) / (hi - lo);

  /** Map a ratio into target range, with ±20% margin beyond, then hard-clamp to slider bounds */
  const mapTo = (r: number, tLo: number, tHi: number, sliderMin: number, sliderMax: number, step: number) => {
    const margin = (tHi - tLo) * 0.2;
    const raw = tLo + r * (tHi - tLo);
    const clamped = clamp(raw, tLo - margin, tHi + margin);
    const snapped = Math.round(clamped / step) * step;
    return clamp(snapped, sliderMin, sliderMax);
  };

  /** Map ratio inversely (high ratio → low value) for negative correlations */
  const mapToInverse = (r: number, tLo: number, tHi: number, sliderMin: number, sliderMax: number, step: number) => {
    return mapTo(1 - r, tLo, tHi, sliderMin, sliderMax, step);
  };

  /** Fermentation hours → discrete temp */
  const tempFromHours = (hours: number): number => {
    const midF = (sF[0] + sF[1]) / 2;
    if (hours >= midF + (sF[1] - midF) * 0.3) return 4;    // upper third → fridge
    if (hours >= midF - (midF - sF[0]) * 0.3) return 12;   // middle third → cool
    return 22;                                                // lower third → ambient
  };

  /** Discrete temp → fermentation hours (place in corresponding third of style range) */
  const hoursFromTemp = (temp: number): number => {
    if (temp <= 6) return Math.round(sF[0] + (sF[1] - sF[0]) * 0.8);    // fridge → 80% of range
    if (temp <= 16) return Math.round(sF[0] + (sF[1] - sF[0]) * 0.5);   // cool → 50% of range
    return Math.round(sF[0] + (sF[1] - sF[0]) * 0.2);                    // ambient → 20% of range
  };

  const propagate = (source: string, value: number) => {
    if (!smartLink || propagatingRef.current) return;
    propagatingRef.current = true;

    if (source === "fermentTemp") {
      // Temp is discrete — map to hours first, then propagate from hours
      const hours = hoursFromTemp(value);
      onFermentHoursChange(hours);
      const r = ratio(hours, sF[0], sF[1]);
      onHydrationChange(mapTo(r, sH[0], sH[1], 45, 105, 1));
      onFlourWChange(mapTo(r, sW[0], sW[1], 100, 420, 10));
      if (onFlourPLChange) onFlourPLChange(mapToInverse(r, sPL[0], sPL[1], 0.30, 0.90, 0.01));
    } else {
      // Compute the ratio from the source parameter's style range
      let r: number;
      switch (source) {
        case "hydration":    r = ratio(value, sH[0], sH[1]); break;
        case "flourW":       r = ratio(value, sW[0], sW[1]); break;
        case "flourPL":      r = ratio(value, sPL[0], sPL[1]); r = 1 - r; break; // P/L is inverse
        case "fermentHours": r = ratio(value, sF[0], sF[1]); break;
        default: r = 0.5;
      }

      // Propagate to all OTHER parameters using the same ratio
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

  return (
    <div className="flex flex-col gap-8 pb-4">
      {/* Smart Link Toggle */}
      <div
        className="flex items-center gap-3 px-4 py-3 rounded-xl"
        style={{
          background: smartLink ? "rgba(204,136,68,0.08)" : "var(--surface-container)",
          border: smartLink ? "1.5px solid var(--tertiary)" : "1px solid var(--outline-variant)",
          transition: "all 0.2s",
        }}
      >
        <motion.button
          onClick={() => setSmartLink(!smartLink)}
          className="flex items-center justify-center w-8 h-8 rounded-lg active:scale-95"
          style={{
            background: smartLink ? "var(--tertiary)" : "var(--surface-container-low)",
            color: smartLink ? "#fff" : "var(--text-muted)",
          }}
          aria-label={smartLink ? "Disattiva Smart Link" : "Attiva Smart Link"}
          aria-pressed={smartLink}
        >
          {smartLink ? <Link size={16} /> : <Unlink size={16} />}
        </motion.button>
        <div className="flex-1">
          <div style={{
            color: smartLink ? "var(--tertiary)" : "var(--text-default)",
            fontSize: "var(--font-size-lg)",
            fontWeight: "var(--weight-semibold)" as any,
          }}>
            Smart Link
          </div>
          <div style={{
            color: "var(--text-muted)",
            fontSize: "var(--font-size-sm)",
            lineHeight: 1.3,
          }}>
            {smartLink
              ? "Parametri collegati — muovi uno slider, gli altri si adattano"
              : "Collega tutti i parametri per regolazione automatica"}
          </div>
        </div>
        <button
          onClick={() => setSmartLink(!smartLink)}
          className="relative w-12 h-7 rounded-full transition-all flex-shrink-0"
          style={{
            background: smartLink ? "var(--tertiary)" : "var(--switch-off)",
          }}
        >
          <motion.div
            className="absolute top-0.5 w-6 h-6 rounded-full bg-white"
            style={{ boxShadow: "var(--shadow-sm)" }}
            animate={{ x: smartLink ? 22 : 2 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          />
        </button>
      </div>

      {/* Hydration */}
      <div>
        <div className="flex items-center gap-2">
          <Label>{cfg.hydrationLabel}</Label>
          <GlossaryLink termId="hydration" inline={false} />
          <InfoTip>{cfg.hydrationTip}</InfoTip>
        </div>
        <GradientSlider
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
          optimalValue={Math.round((style.dough.hydration_pct_range[0] + style.dough.hydration_pct_range[1]) / 2)}
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

      {/* Flour W */}
      <div>
        <div className="flex items-center gap-2">
          <Label>{cfg.flourWLabel}</Label>
          <GlossaryLink termId="w_alveograph" label="W" inline={false} />
          <InfoTip>{cfg.flourWTip}</InfoTip>
        </div>
        <GradientSlider
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
          optimalValue={Math.round((style.dough.flour_w_range[0] + style.dough.flour_w_range[1]) / 2 / 10) * 10}
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

      {/* VPL-012: P/L Slider — visible only when onFlourPLChange is provided (nerdMode) */}
      {customFlourPL !== undefined && onFlourPLChange && (
        <div>
          <div className="flex items-center gap-2">
            <Label>{cfg.plLabel}</Label>
            <GlossaryLink termId="pl_ratio" label="P/L" inline={false} />
            <InfoTip>{cfg.plTip}</InfoTip>
          </div>
          <GradientSlider
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

      {/* Fermentation */}
      <div>
        <div className="flex items-center gap-2">
          <Label>{cfg.fermentLabel}</Label>
          <GlossaryLink termId="ball_fermentation" inline={false} />
          <InfoTip>{cfg.fermentTip}</InfoTip>
        </div>
        <div className="flex flex-col gap-5 mt-1">
          <GradientSlider
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
            optimalValue={Math.round((style.dough.fermentation_hours_range[0] + style.dough.fermentation_hours_range[1]) / 2)}
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

          <div className="flex gap-2">
            <TempPill
              active={customFermentTemp <= 6}
              onClick={() => handleFT(4)}
              icon={<Snowflake size={14} />}
              label={cfg.tempFridge}
              suggested={adaptiveHints.fermentTemp?.suggestedTemp === "fridge"}
            />
            <TempPill
              active={
                customFermentTemp > 6 && customFermentTemp <= 16
              }
              onClick={() => handleFT(12)}
              icon={<Thermometer size={14} />}
              label={cfg.tempCool}
              suggested={adaptiveHints.fermentTemp?.suggestedTemp === "cool"}
            />
            <TempPill
              active={customFermentTemp > 16}
              onClick={() => handleFT(22)}
              icon={<Sun size={14} />}
              label={cfg.tempAmbient}
              suggested={adaptiveHints.fermentTemp?.suggestedTemp === "ambient"}
            />
          </div>
          {adaptiveHints.fermentTemp && (
            <AdaptiveHint
              hint={
                adaptiveHints.fermentTemp.suggestedTemp === "fridge"
                  ? t(cfg.hintLongFermentUseFridge, { hours: String(customFermentHours) })
                  : adaptiveHints.fermentTemp.suggestedTemp === "ambient"
                    ? t(cfg.hintShortFermentUseWarm, { hours: String(customFermentHours) })
                    : t(cfg.hintMediumFermentUseCool, { hours: String(customFermentHours) })
              }
              label={cfg.hintAdaptiveLabel}
            />
          )}

          {/* Pre-ferment — grouped label + toggle + info */}
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
            <button
              onClick={() => onPreFermentChange(!usePreFerment)}
              className="relative w-12 h-7 rounded-full transition-all flex-shrink-0"
              style={{
                background: usePreFerment
                  ? "var(--switch-on)"
                  : "var(--switch-off)",
              }}
            >
              <motion.div
                className="absolute top-0.5 w-6 h-6 rounded-full bg-white"
                style={{ boxShadow: "var(--shadow-sm)" }}
                animate={{ x: usePreFerment ? 22 : 2 }}
                transition={{
                  type: "spring",
                  stiffness: 500,
                  damping: 30,
                }}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Oven — fixed single-call update */}
      <div>
        <div className="flex items-center gap-2">
          <Label>{cfg.ovenLabel}</Label>
          <InfoTip>{cfg.ovenTip}</InfoTip>
        </div>
        <div className="flex flex-wrap gap-2 mt-3">
          {OVEN_PRESETS.map((preset) => {
            const active = constraints.oven_type === preset.id;
            return (
              <button
                key={preset.id}
                onClick={() =>
                  handleOvenSelect(preset.id, preset.maxTemp)
                }
                className="px-4 py-2.5 rounded-xl transition-all active:scale-95"
                style={{
                  background: active
                    ? "var(--chip-bg-active)"
                    : "var(--chip-bg)",
                  color: active
                    ? "var(--chip-text-active)"
                    : "var(--chip-text)",
                  border: active
                    ? "1px solid transparent"
                    : "1px solid var(--chip-border)",
                  fontSize: "var(--font-size-lg)",
                  fontWeight: active ? "var(--weight-semibold)" : "var(--weight-medium)" as any,
                }}
              >
                {preset.name}
              </button>
            );
          })}
        </div>
        <div className="mt-4">
          <GradientSlider
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
      </div>

      {/* Pan — visible only when needed */}
      {needsPan(style) && panConfig && onPanConfigChange && (() => {
        const currentShape = panConfig.panShape ?? defaultPanShape(style);
        const handleShapeChange = (shape: PanShape) => {
          if (shape === currentShape) return;
          // Reset dimensions to style defaults when switching shape
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
          <div>
            <div className="flex items-center gap-2">
              <Label>{cfg.panLabel}</Label>
              <InfoTip>
                {defaultPanShape(style) === "rectangular" ? cfg.panTipRect : cfg.panTipRound}
              </InfoTip>
            </div>

            {/* Shape selector chips */}
            <div className="flex gap-2 mt-3 mb-4">
              <button
                onClick={() => handleShapeChange("rectangular")}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl transition-all active:scale-95"
                style={{
                  background: currentShape === "rectangular"
                    ? "var(--chip-bg-active)"
                    : "var(--chip-bg)",
                  color: currentShape === "rectangular"
                    ? "var(--chip-text-active)"
                    : "var(--chip-text)",
                  border: currentShape === "rectangular"
                    ? "1px solid rgba(0,0,0,0)"
                    : "1px solid var(--chip-border)",
                  fontSize: "var(--font-size-lg)",
                  fontWeight: "var(--weight-medium)" as any,
                }}
              >
                <RectangleHorizontal size={14} />
                {cfg.panRectangular}
              </button>
              <button
                onClick={() => handleShapeChange("round")}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl transition-all active:scale-95"
                style={{
                  background: currentShape === "round"
                    ? "var(--chip-bg-active)"
                    : "var(--chip-bg)",
                  color: currentShape === "round"
                    ? "var(--chip-text-active)"
                    : "var(--chip-text)",
                  border: currentShape === "round"
                    ? "1px solid rgba(0,0,0,0)"
                    : "1px solid var(--chip-border)",
                  fontSize: "var(--font-size-lg)",
                  fontWeight: "var(--weight-medium)" as any,
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/></svg>
                {cfg.panRound}
              </button>
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
                ? <RectangleHorizontal size={14} style={{ color: "var(--text-muted)" }} />
                : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2"><circle cx="12" cy="12" r="10"/></svg>
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
            <Layers size={14} style={{ color: "var(--text-muted)" }} />
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
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <h3 style={{ fontSize: "var(--font-size-2xl)" }}>{children}</h3>;
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
}) {
  const { cms } = useCms();
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
    <div className="flex flex-col gap-2 mt-3">
      <div className="flex items-baseline justify-between">
        <span
          className="type-numeric"
          style={{
            fontSize: "var(--font-size-6xl)",
            fontWeight: "var(--weight-bold)" as any,
            color: inRange
              ? "var(--config-value-color)"
              : "var(--config-value-oor)",
          }}
        >
          {value}
          {unit}
        </span>
        {rangeMin !== undefined && rangeMax !== undefined && (
          <span
            className="type-numeric"
            style={{
              color: "var(--text-muted)",
              fontSize: "var(--font-size-base)",
            }}
          >
            {cms.configurator.sliderOptimal} {rangeMin}–{rangeMax}
            {unit}
          </span>
        )}
      </div>

      <div className="relative h-10 flex items-center">
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
              background: `repeating-linear-gradient(to bottom, var(--tertiary) 0px, var(--tertiary) 3px, rgba(0,0,0,0) 3px, rgba(0,0,0,0) 5px)`,
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
              background: `repeating-linear-gradient(to bottom, var(--tertiary) 0px, var(--tertiary) 3px, rgba(0,0,0,0) 3px, rgba(0,0,0,0) 5px)`,
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
            [&::-moz-range-thumb]:w-6 [&::-moz-range-thumb]:h-6 [&::-moz-range-thumb]:rounded-full
            [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-[3px] [&::-moz-range-thumb]:border-primary
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

function TempPill({
  active,
  onClick,
  icon,
  label,
  suggested,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  suggested?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl transition-all active:scale-95 relative"
      style={{
        background: active
          ? "var(--chip-bg-active)"
          : "var(--chip-bg)",
        color: active
          ? "var(--chip-text-active)"
          : "var(--chip-text)",
        border: active
          ? "1px solid rgba(0,0,0,0)"
          : suggested && !active
            ? "1.5px solid var(--tertiary)"
            : "1px solid var(--chip-border)",
        fontSize: "var(--font-size-lg)",
        fontWeight: "var(--weight-medium)" as any,
        boxShadow: suggested && !active
          ? "0 0 0 1px rgba(204,136,68,0.15), 0 0 8px rgba(204,136,68,0.1)"
          : "none",
      }}
    >
      {icon}
      {label}
      {suggested && !active && (
        <span
          className="absolute -top-1 -right-1 flex items-center justify-center"
          style={{
            width: 14,
            height: 14,
            borderRadius: 2,
            transform: "rotate(45deg)",
            background: "var(--tertiary)",
          }}
        >
          <span style={{ transform: "rotate(-45deg)", fontSize: 8, color: "#fff", lineHeight: 1 }}>◆</span>
        </span>
      )}
    </button>
  );
}