import { engineMsgTexts } from "./engine-msg-text";
import { ChevronDown,Circle,Link,RectangleHorizontal,Sparkles,Unlink } from "lucide-react";
import React,{ useId,useMemo,useRef,useState } from "react";
import { useCms } from "../cms/cms-context";
import { createFormatter,t } from "../cms/i18n";
import { InfoTip } from "../../components/shared/info-tip";
import {
type GeneratedRecipe,
OVEN_PRESETS,
OvenType,
PRE_FERMENT_FLOUR_PCT,
PanConfig,
PanShape,
PizzaStyle,
PreFermentChoice,
preFermentKind,
UserConstraints,
defaultPanShape,
isFriedStyle,
needsPan,
optimizeRecipe,
supportsThickness,
saltRangePct,
} from "../../domain/pizza-engine";
import { SegmentedControl, Select, Stepper, Switch } from "../../components/ds/index";
import { Disclosure } from "../../components/ds/Disclosure";
import { maxPreFermentFlourPct } from "../../domain/pre-ferment-split";
import { onlySourdoughYeast } from "../../domain/recipe-phases";
import { uiMessage } from "../../i18n/ui-messages";
import { useDetailLevel } from "../../hooks/use-detail-level";
import { loadEffectiveKitchen } from "../../hooks/use-profile-defaults";
import { sourceReferenceCenter } from "../../use-cases/recipe-entry";
import { kitchenConstraints, resolveEffectiveKitchen } from "../../use-cases/effective-kitchen";
import { flourStrength, type FlourStrength } from "./recipe-output-format";
import { FLOUR_STRENGTH_SCALE, flourFitForStyle } from "../../domain/flour-strength";
import { formatList, formatNumber, formatRange } from "../../i18n/format";
import { WhyButton } from "../science/why-button";
import { sliderZoneLabels } from "./slider-zone";
import {
LINKED_FIELD_ORDER,
defaultSmartLink,
linkedActive,
linkedChanges,
mergeLinked,
propagateLinked,
type LinkedField,
type LinkedRun,
type LinkedValues,
} from "./linked-params";

/** B2 (seguito, 30/10/2026): ore e temperatura sono quelle di una fonte.
 *  `yeastFromSource`: la dose di lievito è della fonte, scritta per le sue
 *  ore (yeast_source), quindi il minimo di ore suggerito dall'euristica
 *  «idratazione alta → lievitazione lunga» la contraddirebbe e non si mostra.
 *  `warmPlace`: la temperatura è il «luogo caldo» della fonte (WARM_PLACE,
 *  nota fermentation.warmPlace) e si chiama così, non «manuale». */
export interface SourceTiming {
  yeastFromSource: boolean;
  warmPlace: boolean;
}

export function sourceTiming(recipe: Pick<GeneratedRecipe, "yeast_source" | "source_notes">): SourceTiming {
  return {
    yeastFromSource: Boolean(recipe.yeast_source),
    warmPlace: Boolean(recipe.source_notes?.some((note) => note.key === "fermentation.warmPlace")),
  };
}

interface RecipeConfiguratorProps {
  style: PizzaStyle;
  referenceStyle?: PizzaStyle;
  sourceTiming?: SourceTiming;
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
  /** D-043 — biga o poolish e quota di farina nel pre-fermento. */
  preFermentChoice?: PreFermentChoice;
  onPreFermentChoiceChange?: (c: PreFermentChoice) => void;
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
  // G2-WP-02: resta solo la scelta suggerita (ripiego del badge quando manca
  // l'ottimo del motore); i tre testi non comparivano in nessuna schermata.
  if (fPos > 0.6 && fermentTemp > 16) {
    hints.fermentTemp = { suggestedTemp: "fridge" };
  } else if (fPos < 0.3 && fermentTemp <= 6) {
    hints.fermentTemp = { suggestedTemp: "ambient" };
  } else if (fPos >= 0.3 && fPos <= 0.6 && (fermentTemp <= 6 || fermentTemp > 16)) {
    hints.fermentTemp = { suggestedTemp: "cool" };
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
function AdaptiveHint({ hint, adaptiveMin, adaptiveMax, unit }: {
  hint?: string;
  adaptiveMin?: number;
  adaptiveMax?: number;
  unit?: string;
}) {
  const cfg = useCms().cms.configurator;
  if (!hint) return null;
  const hasMin = adaptiveMin != null;
  const hasMax = adaptiveMax != null;
  /* Le etichette stanno nel CMS in 7 lingue: niente doppione nel catalogo UI. */
  const label = hasMax && !hasMin ? cfg.hintLimitMaxLabel : hasMin && !hasMax ? cfg.hintLimitMinLabel : cfg.hintAdaptiveLabel;
  return (
    <div className="config-hint">
      <Sparkles size={12} className="config-hint__icon" />
      <span className="config-hint__text">
        <strong>
          {label}
          {hasMin || hasMax ? " " : ""}
          {hasMin && hasMax
            ? `(${adaptiveMin}–${adaptiveMax}${unit || ""})`
            : hasMin
              ? `(≥ ${adaptiveMin}${unit || ""})`
              : hasMax
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

/* ═══ U-3 — parametri avanzati (D-035) ═══
 * Progressive disclosure (Nielsen 2006): in vista le scelte che servono a
 * tutti (idratazione, farina a parole, lievitazione, forno, teglia); W e P/L
 * precisi, sale, prefermento, spessore e Smart Link dietro «Parametri
 * avanzati». Niente si toglie: il pannello ricorda se l'hai aperto, parte
 * aperto per il livello esperto e conta i valori nascosti diversi da quelli
 * dello stile, così niente resta cambiato di nascosto. */
const ADVANCED_STORAGE_KEY = "vulcan_config_advanced";

function loadAdvancedOpen(skillLevel: number): boolean {
  try {
    const saved = localStorage.getItem(ADVANCED_STORAGE_KEY);
    if (saved === "1") return true;
    if (saved === "0") return false;
  } catch {
    /* storage non disponibile: vale il livello */
  }
  return skillLevel >= 3;
}

function saveAdvancedOpen(open: boolean) {
  try {
    localStorage.setItem(ADVANCED_STORAGE_KEY, open ? "1" : "0");
  } catch {
    /* niente: resta per la sessione */
  }
}

export function RecipeConfigurator({
  style,
  referenceStyle,
  sourceTiming: timing,
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
  onFlourPLChange: onFlourPLChangeProp,
  customSalt,
  onSaltChange,
  panConfig,
  onPanConfigChange,
  preFermentChoice,
  onPreFermentChoiceChange,
}: RecipeConfiguratorProps) {
  /* FW-08 (S06-A-19/B-17): P/L si modifica negli avanzati con «Dettagli
     tecnici» attivo; altrimenti gli avanzati ne mostrano il valore e dicono
     dove si sblocca. Senza dettagli tecnici P/L non segue nemmeno i
     «Parametri collegati», come prima. */
  const { level: detailLevel, setLevel: setDetailLevel } = useDetailLevel();
  const onFlourPLChange = detailLevel === "technical" ? onFlourPLChangeProp : undefined;
  /* FW-07 (S06-B-04): il forno della cucina effettiva, con il modello del
     profilo; un altro tipo scelto qui vale solo per questa ricetta. */
  const kitchen = useMemo(() => loadEffectiveKitchen(), []);
  /* Single-call update for oven to avoid the double-update bug */
  const handleOvenSelect = (id: OvenType) => {
    const oven = kitchenConstraints(resolveEffectiveKitchen({ oven: kitchen.oven.type === id ? { ovenType: id, maxTemp: kitchen.oven.maxTempC, modelId: kitchen.oven.modelId } : null }, undefined, { ovenType: id }));
    const { oven_max_pizza_cm: _mouth, ...rest } = constraints;
    onConstraintsChange({ ...rest, ...oven });
  };

  const { cms, bcp47 } = useCms();
  const cfg = cms.configurator;
  const preFermentSwitchId = useId();
  /* FW-17 (D-P): stessa regola del motore (generateRecipe, scelta del lievito). */
  const sourdoughOnly = onlySourdoughYeast(constraints.pantry_yeasts, constraints.excluded_yeasts);
  const fmt = createFormatter(cms.ui, bcp47);
  /* Temperature di riferimento per i tre regimi di fermentazione (°C),
     formattate secondo il sistema di unità dell'utente. */
  const fridgeTemp = fmt.celsius(4);
  const coolTemp = fmt.celsius(12);
  const ambientTemp = fmt.celsius(22);

  /* G2-WP-01 · D-G2-1 (A): il collegamento parte acceso solo dal livello 3
     e agisce solo con gli avanzati aperti, dove si vede e si spegne. */
  const smartLinkDefault = defaultSmartLink(constraints.skill_level);
  const [smartLink, setSmartLink] = useState(smartLinkDefault);
  /* Ultima propagazione: valori di prima e di dopo, per «Annulla». */
  const [linked, setLinked] = useState<LinkedRun | null>(null);
  /* Valori di partenza dei campi mossi dal collegamento e non più toccati
     dall'utente: il contatore «N modificati» conta quelli ancora diversi. */
  const [linkedOrigin, setLinkedOrigin] = useState<LinkedValues>({});
  /* Revisione G2: «Annulla» sparisce dopo l'uso; il fuoco torna al controllo
     da cui è partita la propagazione, mai su <body>. */
  const linkedSourceRef = useRef<Element | null>(null);
  const forgetOrigin = (fields: readonly string[]) =>
    setLinkedOrigin((origin) => Object.fromEntries(Object.entries(origin).filter(([f]) => !fields.includes(f))));
  const [showAdvanced, setShowAdvanced] = useState(() => loadAdvancedOpen(constraints.skill_level));
  const toggleAdvanced = () => {
    setShowAdvanced((open) => {
      saveAdvancedOpen(!open);
      return !open;
    });
  };

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
      // B2 (seguito): stesso spazio di ricerca della proposta su misura.
      return optimizeRecipe(style, constraints, undefined, undefined, undefined,
        undefined, undefined, undefined, sourceReferenceCenter(style)).params;
    } catch {
      return null;
    }
  }, [style, constraints]);

  const current: Record<LinkedField, number | undefined> = {
    hydration: customHydration,
    flourW: customFlourW,
    flourPL: customFlourPL,
    fermentHours: customFermentHours,
    fermentTemp: customFermentTemp,
  };
  const setters: Record<LinkedField, ((v: number) => void) | undefined> = {
    hydration: onHydrationChange,
    flourW: onFlourWChange,
    flourPL: onFlourPLChange,
    fermentHours: onFermentHoursChange,
    fermentTemp: onFermentTempChange,
  };

  const apply = (values: LinkedValues) => {
    for (const field of Object.keys(values) as LinkedField[]) setters[field]?.(values[field]!);
  };

  /* L'utente cambia `source`: il campo è di nuovo suo; se il collegamento è
     attivo, gli altri si spostano e il riepilogo dice quali. */
  const change = (source: LinkedField, value: number) => {
    setters[source]?.(value);
    forgetOrigin([source]);
    if (!linkedActive(smartLink, showAdvanced)) {
      setLinked(null);
      return;
    }
    const next = propagateLinked(source, value, {
      hydration: sH,
      flourW: sW,
      flourPL: sPL,
      fermentHours: sF,
      includePL: Boolean(onFlourPLChange) && customFlourPL !== undefined,
    });
    const run = mergeLinked(linked, current, source, next);
    for (const f of linkedChanges(current, next)) setters[f]?.(next[f]!);
    setLinked(run);
    setLinkedOrigin((origin) => ({ ...run?.before, ...origin }));
    linkedSourceRef.current = document.activeElement;
  };

  const undoLinked = () => {
    if (!linked) return;
    apply(linked.before);
    forgetOrigin(Object.keys(linked.before));
    setLinked(null);
    requestAnimationFrame(() => (linkedSourceRef.current as HTMLElement | null)?.focus());
  };

  const handleH = (v: number) => change("hydration", v);
  const handleW = (v: number) => change("flourW", v);
  const handlePL = (v: number) => change("flourPL", Math.round(v * 100) / 100);
  const handleFH = (v: number) => change("fermentHours", v);
  const handleFT = (v: number) => change("fermentTemp", v);

  /* Il riepilogo vale finché i valori sono quelli lasciati dal collegamento
     (sparisce se un'altra azione, per esempio «Ottimizza», li cambia). */
  const linkedSummary = linked && (Object.keys(linked.after) as LinkedField[]).every((f) => current[f] === linked.after[f])
    ? formatList(LINKED_FIELD_ORDER.filter((f) => f in linked.after).map((f) => {
        const v = linked.after[f]!;
        const [label, text] =
          f === "hydration" ? [cfg.hydrationLabel, fmt.percent(v)]
          : f === "flourW" ? [cfg.flourWLabel, fmt.number(v)]
          : f === "flourPL" ? [cfg.plLabel, fmt.number(v, { minimumFractionDigits: 2, maximumFractionDigits: 2 })]
          : f === "fermentHours" ? [style.dough.unleavened ? cfg.restLabel : cfg.fermentLabel, fmt.durationShort(v)]
          : [uiMessage("features.recipe.recipe-configurator.e4ff14ef"), fmt.celsius(v)];
        return uiMessage("features.recipe.recipe-configurator.linkedItem", [label, text]);
      }), bcp47)
    : null;

  const computedHints = computeAdaptiveHints(
    style,
    customHydration,
    customFlourW,
    customFermentHours,
    customFermentTemp,
    customFlourPL,
    cfg,
  );
  /* B2 (seguito): con il lievito della fonte le ore sono quelle della fonte. */
  const adaptiveHints = timing?.yeastFromSource ? { ...computedHints, fermentation: null } : computedHints;

  /* FW-14 (S06-B-02): una sola fonte per la raccomandazione. Il badge
     «Consigliato» segue l'ottimo del motore (lo stesso del triangolo sugli
     slider), non l'euristica dei suggerimenti: prima diceva «Fresco» mentre
     la ricetta ottimizzata sceglieva 22 °C. */
  const optimumTemp = optimum?.fermentation_temp_c;
  const suggestedTemp: "fridge" | "cool" | "ambient" | undefined = optimumTemp === undefined
    ? adaptiveHints.fermentTemp?.suggestedTemp
    : optimumTemp <= 6 ? "fridge" : optimumTemp <= 16 ? "cool" : "ambient";

  const changedAdvanced = (Object.keys(linkedOrigin) as LinkedField[]).filter((f) => current[f] !== linkedOrigin[f]).length + [
    smartLink !== smartLinkDefault,
    customSalt !== undefined && Math.abs(customSalt - style.dough.salt_pct) >= 0.05,
    usePreFerment !== Boolean(style.requires_pre_ferment),
    customFlourPL !== undefined &&
      (customFlourPL < style.dough.flour_pl_range[0] - 0.005 || customFlourPL > style.dough.flour_pl_range[1] + 0.005),
    panConfig?.thickness !== undefined && Math.abs(panConfig.thickness - style.shape.thickness_factor) >= 0.01,
  ].filter(Boolean).length;

  return (
    <div className="config-root">
      <button
        type="button"
        onClick={toggleAdvanced}
        aria-expanded={showAdvanced}
        className="config-advanced-toggle"
      >
        <span className="config-advanced-toggle__label">{uiMessage("features.recipe.recipe-configurator.advanced.label")}</span>
        {changedAdvanced > 0 && (
          <span className="config-advanced-toggle__count">
            {changedAdvanced === 1
              ? uiMessage("features.recipe.recipe-configurator.advanced.changedOne")
              : uiMessage("features.recipe.recipe-configurator.advanced.changedMany", [changedAdvanced])}
          </span>
        )}
        <ChevronDown size={16} aria-hidden="true" className="config-advanced-toggle__chevron" />
      </button>

      {/* Smart Link — barra compatta, singolo tap-target */}

      {/* Fix di Matteo (24/10): legenda del triangolo e, accanto, la catenella
          che collega i parametri (prima «Smart Link», un riquadro intero). */}
      <div data-region="toolbar" className="config-toolbar">
        <p className="config-legend">
          <svg width="10" height="6" viewBox="0 0 10 6" aria-hidden="true" className="config-legend__marker">
            <path d="M5 6L0 0h10z" />
          </svg>
          {uiMessage("features.recipe.recipe-configurator.legend")}
        </p>
        {showAdvanced && (
          <button
            type="button"
            onClick={() => {
              setSmartLink(!smartLink);
              setLinked(null);
            }}
            className={smartLink ? "config-link-toggle config-link-toggle--on" : "config-link-toggle"}
            aria-pressed={smartLink}
          >
            {smartLink ? <Link size={14} aria-hidden="true" /> : <Unlink size={14} aria-hidden="true" />}
            {uiMessage("features.recipe.recipe-configurator.95995174")}
          </button>
        )}
      </div>
      {/* G2-WP-01: la regola si legge senza passare il mouse (L1) e la
          scienza è dietro «Perché?»; ogni propagazione si annuncia e si annulla. */}
      {showAdvanced && (
        <section data-region="linked-params" className="config-linked" aria-label={uiMessage("features.recipe.recipe-configurator.95995174")}>
          <p className="config-linked__help">
            {uiMessage("features.recipe.recipe-configurator.linkedHelp")}
            <WhyButton noteId="linked-params" />
          </p>
          <p role="status" aria-live="polite" className="config-linked__status">
            {smartLink && linkedSummary && (
              <>
                {uiMessage("features.recipe.recipe-configurator.linkedChanged", [linkedSummary])}
                <button type="button" className="config-linked__undo" onClick={undoLinked}>
                  {uiMessage("features.recipe.recipe-configurator.linkedUndo")}
                </button>
              </>
            )}
          </p>
        </section>
      )}

      {referenceStyle && referenceStyle.dough.hydration_pct_range.some((v, i) => v !== sH[i]) && (
        <p className="config-legend">{engineMsgTexts([{
          /* Il testo sta solo nel CMS (default it + 6 lingue): niente doppione. */
          key: "range.hydrationBasis", fallback: "",
          params: { catalogMin: referenceStyle.dough.hydration_pct_range[0], catalogMax: referenceStyle.dough.hydration_pct_range[1], methodMin: sH[0], methodMax: sH[1] },
        }], cms, bcp47)[0]}</p>
      )}

      {/* 3-Column Grid Layout */}
      <div className="config-grid">

        {/* Column 1: Formula */}
        <div className="config-column">
          {/* Hydration */}
          <div className="config-field">
            <GradientSlider
              name={cfg.hydrationLabel}
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
            <AdaptiveHint {...adaptiveHints.hydration} unit="%" />
          </div>

          {/* F11 beginner mode: il principiante sceglie la farina in linguaggio
              naturale (W derivata), niente slider alveografici W/P/L. */}
          {!showAdvanced ? (
            <BeginnerFlourPicker
              value={customFlourW}
              onChange={(w) => {
                /* La farina del principiante è un dato della dispensa, non una leva. */
                onFlourWChange(w);
                forgetOrigin(["flourW"]);
                setLinked(null);
              }}
              styleRange={style.dough.flour_w_range}
              typicalW={optimum?.flour_w ?? Math.round((sW[0] + sW[1]) / 2 / 10) * 10}
              label={<><Label>{cfg.flourWLabel}</Label><InfoTip termId="w_alveograph">{uiMessage("features.recipe.recipe-configurator.flourPickerTip")}</InfoTip></>}
            />
          ) : (
          <>
          {/* Flour W */}
          <div className="config-field">
            <GradientSlider
              name={cfg.flourWLabel}
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
            <AdaptiveHint {...adaptiveHints.flourW} unit="" />
          </div>

          {/* Flour P/L */}
          {customFlourPL !== undefined && onFlourPLChange && (
            <div className="config-field">
              <GradientSlider
              name={cfg.plLabel}
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
              <AdaptiveHint {...adaptiveHints.flourPL} unit="" />
            </div>
          )}
          {/* FW-08: P/L in sola lettura, con la via per modificarlo. */}
          {customFlourPL !== undefined && onFlourPLChangeProp && !onFlourPLChange && (
            <p className="config-field config-pl-readonly" data-region="pl-readonly">
              <span className="config-pl-readonly__value">
                {uiMessage("detailLevel.plReadOnly", [
                  fmt.number(customFlourPL, { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
                ])}
              </span>
              <button
                type="button"
                className="config-pl-readonly__action"
                onClick={() => setDetailLevel("technical")}
              >
                {uiMessage("detailLevel.enable")}
              </button>
            </p>
          )}
          </>
          )}

          {/* F3 — Sale come leva; U-3: tra i parametri avanzati */}
          {showAdvanced && customSalt !== undefined && onSaltChange && (
            <div className="config-field">
              <GradientSlider
              name={uiMessage("features.recipe.recipe-configurator.0028d743")}
                label={<Label>{uiMessage("features.recipe.recipe-configurator.0028d743")}</Label>}
                value={Math.round(customSalt * 10) / 10}
                onChange={onSaltChange}
                min={saltRangePct(style)[0]}
                max={saltRangePct(style)[1]}
                step={0.1}
                unit="%"
                rangeMin={Math.max(saltRangePct(style)[0], style.dough.salt_pct - 0.3)}
                rangeMax={Math.min(saltRangePct(style)[1], style.dough.salt_pct + 0.3)}
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
                  name={style.dough.unleavened ? cfg.restLabel : cfg.fermentLabel}
                  label={
                    style.dough.unleavened
                      ? <><Label>{cfg.restLabel}</Label><InfoTip label={cfg.restLabel}>{cfg.restTip}</InfoTip></>
                      : <><Label>{cfg.fermentLabel}</Label><InfoTip label={cfg.fermentLabel}>{cfg.fermentTip}</InfoTip></>
                  }
                  value={customFermentHours}
                  onChange={handleFH}
                  min={1}
                  max={96}
                  step={1}
                  unit={uiMessage("features.recipe.recipe-configurator.27d5482e")}
                  rangeMin={style.dough.fermentation_hours_range[0]}
                  rangeMax={style.dough.fermentation_hours_range[1]}
                  gradient={SLIDER_GRADIENTS.fermentation}
                  adaptiveMin={adaptiveHints.fermentation?.adaptiveMin}
                  adaptiveMax={adaptiveHints.fermentation?.adaptiveMax}
                  optimalValue={optimum?.fermentation_hours ?? Math.round((sF[0] + sF[1]) / 2)}
                />
                <AdaptiveHint {...adaptiveHints.fermentation} unit={uiMessage("features.recipe.recipe-configurator.27d5482e")} />
              </div>

              {/* Pre-fermento — U-3: tra i parametri avanzati */}
              {showAdvanced && (
              <div className="config-toggle-row">
                <div className="config-toggle-row__label-group">
                  {/* FW-12 (S06-B-12): toccare il testo attiva lo switch. */}
                  <label htmlFor={preFermentSwitchId} className="config-toggle-row__label">
                    {cfg.preFermentLabel}
                  </label>
                  <InfoTip size={14} label={cfg.preFermentLabel}>{cfg.preFermentTip}</InfoTip>
                </div>
                <Switch
                  id={preFermentSwitchId}
                  checked={usePreFerment && !sourdoughOnly}
                  disabled={sourdoughOnly}
                  aria-label={cfg.preFermentLabel}
                  onCheckedChange={onPreFermentChange}
                />
              </div>
              )}
              {/* FW-17 (D-P): col solo lievito madre niente biga né poolish;
                  il perché al livello 2. */}
              {showAdvanced && sourdoughOnly && (
                <div className="config-field config-preferment-sourdough" data-region="preferment-sourdough">
                  <p className="type-body config-preferment-sourdough__text">
                    {uiMessage("recipe.phases.sourdoughNoPreferment")}
                  </p>
                  <Disclosure variant="inline" summary={uiMessage("recipe.phases.why")}>
                    <p className="type-body config-preferment-sourdough__text">
                      {uiMessage("recipe.phases.sourdoughNoPrefermentWhy")}
                    </p>
                  </Disclosure>
                </div>
              )}

              {/* D-043 — biga o poolish e quanta farina ci va (fonti in
                  docs/ricerca/prefermenti-fonti-2026-10-24.md) */}
              {showAdvanced && usePreFerment && !sourdoughOnly && onPreFermentChoiceChange && (() => {
                const type = preFermentChoice?.type ?? preFermentKind(style);
                /* FW-17 (S08-A-03): la quota del poolish non supera l'idratazione. */
                const maxFlourPct = Math.max(
                  PRE_FERMENT_FLOUR_PCT.min,
                  Math.floor(maxPreFermentFlourPct(type, customHydration, PRE_FERMENT_FLOUR_PCT.max) / 5) * 5,
                );
                const flourPct = Math.min(maxFlourPct, preFermentChoice?.flourPct ?? PRE_FERMENT_FLOUR_PCT[type]);
                return (
                  <div className="config-field config-preferment">
                    <SegmentedControl
                      value={type}
                      onValueChange={(next) =>
                        onPreFermentChoiceChange({
                          ...preFermentChoice,
                          // il tipo dello stile non è una modifica
                          type: next === preFermentKind(style) ? undefined : (next as "biga" | "poolish"),
                          flourPct: undefined,
                        })
                      }
                      ariaLabel={uiMessage("features.recipe.recipe-configurator.preFermentTypeLabel")}
                      size="sm"
                      fullWidth
                      options={[
                        { value: "biga", label: uiMessage("features.recipe.recipe-configurator.preFermentBiga") },
                        { value: "poolish", label: uiMessage("features.recipe.recipe-configurator.preFermentPoolish") },
                      ]}
                    />
                    <GradientSlider
                      name={uiMessage("features.recipe.recipe-configurator.preFermentFlourLabel")}
                      label={<Label>{uiMessage("features.recipe.recipe-configurator.preFermentFlourLabel")}</Label>}
                      value={flourPct}
                      onChange={(v) =>
                        onPreFermentChoiceChange({
                          ...preFermentChoice,
                          flourPct: v === PRE_FERMENT_FLOUR_PCT[type] ? undefined : v,
                        })
                      }
                      min={PRE_FERMENT_FLOUR_PCT.min}
                      max={maxFlourPct}
                      step={5}
                      unit="%"
                      gradient={SLIDER_GRADIENTS.fermentation}
                      optimalValue={Math.min(maxFlourPct, PRE_FERMENT_FLOUR_PCT[type])}
                    />
                    {maxFlourPct < PRE_FERMENT_FLOUR_PCT.max && (
                      <p className="type-body config-preferment-sourdough__text" data-region="poolish-max">
                        {uiMessage("recipe.phases.poolishMaxByHydration", [fmt.percent(customHydration), fmt.percent(maxFlourPct)])}
                      </p>
                    )}
                  </div>
                );
              })()}

              {/* Temperatura di fermentazione */}
              <div className="config-field">
                <div className="config-temp-header">
                  <div className="config-temp-header__label-group">
                    <Label>{uiMessage("features.recipe.recipe-configurator.df12789a")}</Label>
                    <InfoTip label={uiMessage("features.recipe.recipe-configurator.df12789a")}>{uiMessage("features.recipe.recipe-configurator.737f1c50")}</InfoTip>
                    {/* G2-WP-02 (S06-A-14): il perché, con la stima del motore. */}
                    <WhyButton noteId="q10-fermentation" context={{ tempC: customFermentTemp, hours: customFermentHours }} />
                  </div>
                  {suggestedTemp && (
                    <span className="config-temp-header__badge">
                      {uiMessage("features.recipe.recipe-configurator.bf1907c1")}{
                        suggestedTemp === "fridge"
                          ? uiMessage("features.recipe.recipe-configurator.51f4c92e")
                          : suggestedTemp === "cool"
                            ? uiMessage("features.recipe.recipe-configurator.bffc946d")
                            : uiMessage("features.recipe.recipe-configurator.e6fefb74")
                      }
                    </span>
                  )}
                </div>

                {/* D-043: nei parametri avanzati la temperatura è libera (1–30 °C);
                    per tutti restano le tre scelte rapide. */}
                {showAdvanced ? (
                  <GradientSlider
                    name={uiMessage("features.recipe.recipe-configurator.e4ff14ef")}
                    value={customFermentTemp}
                    onChange={handleFT}
                    min={1}
                    max={30}
                    step={1}
                    unit="°C"
                    format={fmt.celsius}
                    gradient={SLIDER_GRADIENTS.temperature}
                    optimalValue={optimumTemp}
                  />
                ) : (() => {
                  /* G2-WP-02 (S06-B-16): un valore diverso da 4, 12 o 22 °C non
                     si arrotonda alla scelta rapida più vicina: compare com'è,
                     in sola lettura, finché non tocchi una delle tre. */
                  const tempMap = { fridge: 4, cool: 12, ambient: 22 } as const;
                  const quick = (Object.keys(tempMap) as (keyof typeof tempMap)[]).find((k) => tempMap[k] === customFermentTemp);
                  const activeVal: keyof typeof tempMap | "other" = quick ?? "other";
                  const quickLabels = {
                    fridge: t(cfg.tempFridge, { fridgeTemp }),
                    cool: t(cfg.tempCool, { coolTemp }),
                    ambient: t(cfg.tempAmbient, { ambientTemp }),
                  };
                  const otherLabel = timing?.warmPlace
                    ? uiMessage("features.recipe.recipe-configurator.tempWarmPlace", [fmt.celsius(customFermentTemp)])
                    : customFermentTemp === optimumTemp
                    ? fmt.celsius(customFermentTemp)
                    : uiMessage("features.recipe.recipe-configurator.tempManual", [fmt.celsius(customFermentTemp)]);
                  return (
                    <SegmentedControl
                      value={activeVal}
                      onValueChange={(val) => { if (val !== "other") handleFT(tempMap[val]); }}
                      ariaLabel={uiMessage("features.recipe.recipe-configurator.e4ff14ef")}
                      size="sm"
                      fullWidth
                      className="config-temp-quick"
                      options={[
                        /* Il punto ripete il badge «Consigliato» qui sopra: niente title=. */
                        ...(Object.keys(tempMap) as (keyof typeof tempMap)[]).map((k) => ({
                          value: k,
                          label: (
                            <span className="config-temp-option">
                              {quickLabels[k]}
                              {suggestedTemp === k && (
                                <span
                                  className={activeVal === k ? "config-temp-option__dot config-temp-option__dot--active" : "config-temp-option__dot"}
                                  aria-hidden="true"
                                />
                              )}
                            </span>
                          ),
                        })),
                        ...(activeVal === "other"
                          ? [{ value: "other" as const, label: <span className="config-temp-option">{otherLabel}</span> }]
                          : []),
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
              name={uiMessage("recipe.oven.maxLabel")}
              label={<Label>{uiMessage("recipe.oven.maxLabel")}</Label>}
              value={constraints.oven_max_temp_c}
              onChange={(v) =>
                onConstraintsChange({
                  ...constraints,
                  oven_max_temp_c: v,
                })
              }
              min={Math.min(200, constraints.oven_capacity_temp_c ?? 200)}
              max={constraints.oven_capacity_temp_c ?? OVEN_PRESETS.find((preset) => preset.id === constraints.oven_type)?.maxTemp ?? 550}
              step={5}
              unit="°C"
              format={fmt.celsius}
              rangeMin={style.baking.temp_c_range[0]}
              rangeMax={style.baking.temp_c_range[1]}
              ceiling
              gradient={SLIDER_GRADIENTS.temperature}
              optimalValue={style.baking.temp_c_ideal}
            />
            {/* FW-07 (S06-A-02): il cursore è un tetto; il motore cuoce
                alla temperatura ideale dello stile quando il forno la supera. */}
            {constraints.oven_max_temp_c > style.baking.temp_c_ideal && !isFriedStyle(style) && (
              <p className="type-data-sm recipe-config-oven-hint">
                {uiMessage("recipe.oven.bakeAt", [fmt.celsius(style.baking.temp_c_ideal)])}
              </p>
            )}
          </div>

          {/* Oven Selector */}
          <div className="config-field">
            {/* FW-12 (S06-B-11): Select del DS, con etichetta e listbox da tastiera. */}
            <Select
              label={uiMessage("features.recipe.recipe-configurator.oven-select-label")}
              value={constraints.oven_type}
              onValueChange={(val) => {
                const preset = OVEN_PRESETS.find((p) => p.id === val);
                if (preset) {
                  handleOvenSelect(preset.id);
                }
              }}
              options={[...OVEN_PRESETS]
                // FW-07: il forno del profilo per primo, col nome del modello e la sua massima.
                .sort((a, b) => Number(b.id === kitchen.oven.type) - Number(a.id === kitchen.oven.type))
                .map((preset) => {
                  const mine = preset.id === kitchen.oven.type;
                  const name = cms.ovenPresets[preset.id]?.name ?? preset.name;
                  return {
                    id: preset.id,
                    label: mine && kitchen.oven.modelId ? uiMessage("features.profile.oven-model-search.selected", [kitchen.oven.label]) : name,
                    desc: uiMessage("features.profile.oven-model-search.upTo", [fmt.celsius(mine ? kitchen.oven.maxTempC : preset.maxTemp)]),
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
                    <InfoTip label={cfg.panLabel}>
                      {defaultPanShape(style) === "rectangular" ? cfg.panTipRect : cfg.panTipRound}
                    </InfoTip>
                  </div>

                  {/* Shape selector dropdown */}
                  <Select
                    ariaLabel={cfg.panLabel}
                    value={currentShape}
                    onValueChange={(val) => handleShapeChange(val as PanShape)}
                    options={[
                      { id: "rectangular", label: cfg.panRectangular },
                      { id: "round", label: cfg.panRound },
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
                        name={cfg.panLength}
                        value={panConfig.panLength ?? style.shape.length_cm ?? 30}
                        onChange={(v) => onPanConfigChange({ ...panConfig, panLength: v })}
                        min={20}
                        max={60}
                        step={1}
                        unit=" cm"
                        format={fmt.centimeters}
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
                        name={cfg.panWidth}
                        value={panConfig.panWidth ?? style.shape.width_cm ?? 20}
                        onChange={(v) => onPanConfigChange({ ...panConfig, panWidth: v })}
                        min={15}
                        max={45}
                        step={1}
                        unit=" cm"
                        format={fmt.centimeters}
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
                        name={cfg.panDiameter}
                      value={panConfig.panDiameter ?? style.shape.diameter_cm ?? 26}
                      onChange={(v) => onPanConfigChange({ ...panConfig, panDiameter: v })}
                      min={15}
                      max={45}
                      step={1}
                      unit=" cm"
                      format={fmt.centimeters}
                      rangeMin={style.shape.diameter_cm ? style.shape.diameter_cm - 3 : undefined}
                      rangeMax={style.shape.diameter_cm ? style.shape.diameter_cm + 3 : undefined}
                      gradient={SLIDER_GRADIENTS.flourW}
                      optimalValue={style.shape.diameter_cm ?? undefined}
                    />
                  </div>
                )}

                {/* Area: un dato di servizio, in piccolo (fix di Matteo). */}
                <div className="config-summary-row config-summary-row--quiet">
                  {currentShape === "rectangular"
                    ? <RectangleHorizontal size={14} className="config-summary-row__icon" />
                    : <Circle size={14} className="config-summary-row__icon" />
                  }
                  <span className="config-summary-row__label">
                    {cfg.panArea}
                  </span>
                  <span className="type-numeric config-summary-row__value">
                    {area} {uiMessage("features.recipe.recipe-configurator.7776ab6e")}</span>
                </div>
              </div>
            );
          })()}

          {/* D-043 — peso del panetto per gli stili senza teglia (le teglie lo
              ricavano da misure e spessore) */}
          {showAdvanced && !supportsThickness(style) && panConfig && onPanConfigChange && (() => {
            const base = style.shape.dough_weight_g;
            const weight = panConfig.ballWeightG ?? base;
            const step = base >= 500 ? 25 : 10;
            return (
              <div className="config-field config-ball-weight">
                <Label>{uiMessage("features.recipe.recipe-configurator.ballWeightLabel")}</Label>
                <Stepper
                  value={weight}
                  min={Math.round(base * 0.5)}
                  max={Math.round(base * 2)}
                  step={step}
                  onChange={(v) => onPanConfigChange({ ...panConfig, ballWeightG: v === base ? undefined : v })}
                  decrementLabel={t(uiMessage("features.recipe.recipe-configurator.ballWeightLess"), { step })}
                  incrementLabel={t(uiMessage("features.recipe.recipe-configurator.ballWeightMore"), { step })}
                  inputLabel={uiMessage("features.recipe.recipe-configurator.ballWeightLabel")}
                />
              </div>
            );
          })()}

          {/* Thickness — visible only when style supports it */}
          {showAdvanced && supportsThickness(style) && panConfig && onPanConfigChange && (
            <div className="config-field">
              <div className="config-thickness-header">
                <Label>{cfg.thicknessLabel}</Label>
                <InfoTip label={cfg.thicknessLabel}>{cfg.thicknessTip}</InfoTip>
              </div>
              {(() => {
                const tf = style.shape.thickness_factor;
                const cur = panConfig.thickness ?? tf;
                /* Fix di Matteo: lo spessore si legge a parole («Sottile e
                   croccante», «Standard», «Alta e soffice»), non come 0,6. */
                const state =
                  cur < tf * 0.7 ? cfg.thicknessThin : cur > tf * 1.3 ? cfg.thicknessThick : cfg.thicknessStandard;
                return (
                  <GradientSlider
                    name={cfg.thicknessLabel}
                    value={Math.round(cur * 100) / 100}
                    onChange={(v) => onPanConfigChange({ ...panConfig, thickness: Math.round(v * 100) / 100 })}
                    min={Math.max(0.05, Math.round((tf * 0.4) * 100) / 100)}
                    max={Math.round((tf * 2.0) * 100) / 100}
                    step={0.02}
                    unit=""
                    valueText={state}
                    valueKind="text"
                    zoneLabels={[
                      uiMessage("features.recipe.recipe-configurator.thicknessTickThin"),
                      uiMessage("features.recipe.recipe-configurator.thicknessTickThick"),
                    ]}
                    rangeMin={Math.round((tf * 0.8) * 100) / 100}
                    rangeMax={Math.round((tf * 1.2) * 100) / 100}
                    gradient={SLIDER_GRADIENTS.fermentation}
                    optimalValue={Math.round(tf * 100) / 100}
                  />
                );
              })()}
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
   con esempi reali) e il motore deriva la W. U-3: è la vista semplice della
   farina; con i parametri avanzati aperti lo sostituiscono W e P/L precisi. */
/* Tre scelte sulla scala unica (flourStrength): la «Forte» copre farina per
   pizza e Manitoba; il valore è quello tipico della classe. */
/* FW-05 (S06-A-05): i sottotitoli dicono la W della fascia (la stessa scala del
   glossario), non il tipo 00/0, che indica la raffinazione e non la forza. */
const scaleBand = (id: FlourStrength) => FLOUR_STRENGTH_SCALE.find((band) => band.id === id)!;
const BEGINNER_FLOURS: { label: string; sub: (locale: string) => string; w: number; classes: FlourStrength[] }[] = [
  { get label() { return uiMessage("features.recipe.recipe-configurator.62b6eb4c"); }, sub: (locale) => uiMessage("features.recipe.recipe-configurator.flourSubWeak", [formatNumber(scaleBand("weak").max, locale)]), w: 185, classes: ["weak"] },
  { get label() { return uiMessage("features.recipe.recipe-configurator.0c77aeec"); }, sub: (locale) => uiMessage("features.recipe.recipe-configurator.flourSubMedium", [formatRange(scaleBand("medium").min, scaleBand("medium").max - 1, locale)]), w: 250, classes: ["medium"] },
  { get label() { return uiMessage("features.recipe.recipe-configurator.a88f9d1e"); }, sub: (locale) => uiMessage("features.recipe.recipe-configurator.flourSubStrong", [formatNumber(scaleBand("strong").min, locale)]), w: 300, classes: ["strong", "veryStrong"] },
];

function BeginnerFlourPicker({
  value,
  onChange,
  styleRange,
  typicalW,
  label,
}: {
  value: number;
  onChange: (w: number) => void;
  styleRange: [number, number];
  /** G2-WP-02 (D-G2-2): la W tipica dello stile per chi non sa che farina ha. */
  typicalW: number;
  label: React.ReactNode;
}) {
  /* «Non lo so» è una scelta dell'utente, non si deduce dal valore: resta
     selezionata finché la W è quella che ha impostato. */
  const [unknownW, setUnknownW] = useState<number | null>(null);
  const unknown = unknownW !== null && unknownW === value;
  const strength = flourStrength(value);
  const selected = unknown ? null : BEGINNER_FLOURS.find((f) => f.classes.includes(strength)) ?? BEGINNER_FLOURS[0];
  const { bcp47 } = useCms();
  const [wMin, wMax] = styleRange;
  /* FW-05 (S06-A-04): stessa regola della fattibilità del motore. Prima la
     tolleranza di ±25 W chiamava «un po' debole» W 185 su 300–380. */
  const fit = flourFitForStyle(value, styleRange);
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
              onClick={() => {
                setUnknownW(null);
                onChange(f.w);
              }}
              className={active ? "config-flour-picker__option config-flour-picker__option--active" : "config-flour-picker__option"}
              aria-pressed={active}
            >
              <span className="config-flour-picker__option-label">
                {f.label}
              </span>
              <span className="config-flour-picker__option-sub">
                {f.sub(bcp47)}
              </span>
            </button>
          );
        })}
        <button
          type="button"
          onClick={() => {
            setUnknownW(typicalW);
            onChange(typicalW);
          }}
          className={unknown ? "config-flour-picker__option config-flour-picker__option--active" : "config-flour-picker__option"}
          aria-pressed={unknown}
        >
          <span className="config-flour-picker__option-label">
            {uiMessage("features.recipe.recipe-configurator.flourUnknown")}
          </span>
          <span className="config-flour-picker__option-sub">
            {uiMessage("features.recipe.recipe-configurator.flourUnknownSub")}
          </span>
        </button>
      </div>
      {unknown ? (
        <p className="config-flour-picker__fit">
          {uiMessage("features.recipe.recipe-configurator.flourUnknownHint")}
        </p>
      ) : (
      <p className={isIdealFit ? "config-flour-picker__fit config-flour-picker__fit--ideal" : fit === "weak" ? "config-flour-picker__fit config-flour-picker__fit--weak" : "config-flour-picker__fit"}>
        {fit === "ideal"
          ? uiMessage("features.recipe.recipe-configurator.4307e09e")
          : fit === "weak"
            ? uiMessage("features.recipe.recipe-configurator.flourFitWeak", [formatNumber(wMin, bcp47)])
            : uiMessage("features.recipe.recipe-configurator.flourFitStrong", [formatRange(wMin, wMax, bcp47)])}
      </p>
      )}
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
  ceiling,
  gradient,
  adaptiveMin,
  adaptiveMax,
  optimalValue,
  label,
  valueText,
  valueKind = "number",
  zoneLabels,
  name,
  format,
}: {
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step: number;
  unit: string;
  rangeMin?: number;
  rangeMax?: number;
  /** FW-07: il valore è un tetto, sopra rangeMax non è «fuori range». */
  ceiling?: boolean;
  gradient: string;
  adaptiveMin?: number;
  adaptiveMax?: number;
  optimalValue?: number;
  label?: React.ReactNode;
  /** Testo al posto del numero (es. spessore: «Standard per questo stile»). */
  valueText?: string;
  /** S06-B-22: 'text' quando valueText è una frase, resa come etichetta e
   *  non nel corpo grande delle cifre. Esplicito, mai indovinato. */
  valueKind?: "number" | "text";
  /** Parole al posto dei numeri sotto le tacche del range. */
  zoneLabels?: [string, string];
  /** Nome accessibile dell'input (U-10, F05): il testo dell'etichetta visibile. */
  name?: string;
  /** FW-11 (S06-B-06): valore con unità nel sistema dell'utente (°F, in).
   *  Il dominio resta metrico; nell'imperiale il valore non si digita. */
  format?: (value: number) => string;
}) {
  const { cms, bcp47 } = useCms();
  const fmt = createFormatter(cms.ui, bcp47);
  const numberLabel = (n: number) => fmt.number(n, { maximumFractionDigits: 2 });
  const valueLabel = (n: number) => (format ? format(n) : `${numberLabel(n)}${unit}`);
  const editable = !format || fmt.unitSystem === "metric";
  /* Fix di Matteo: al tocco del valore si digita il numero, per chi non ama
     gli slider. Invio o tocco fuori conferma, Esc annulla. */
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(value));
  const commitDraft = () => {
    const n = Number(draft.replace(",", "."));
    setEditing(false);
    if (!Number.isFinite(n)) return;
    const snapped = Math.round(n / step) * step;
    const clamped = Math.max(min, Math.min(max, Math.round(snapped * 100) / 100));
    if (clamped !== value) onChange(clamped);
  };
  const pct = Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100));
  /* FW-13 (S06-A-23) e FW-14 (S06-B-02): il valore consigliato dal motore non
     si colora mai come «fuori range», anche quando l'ottimo esce dalla
     forbice dello stile. */
  const atOptimum = optimalValue !== undefined && Math.abs(value - optimalValue) < step;
  const inRange =
    atOptimum ||
    (rangeMin !== undefined && rangeMax !== undefined
      ? value >= rangeMin && (ceiling || value <= rangeMax)
      : true);
  const oor = inRange ? "" : " config-slider__value--oor";

  const zone = sliderZoneLabels(min, max, rangeMin, rangeMax, ceiling);
  const zoneLeftPct =
    rangeMin !== undefined
      ? Math.max(0, Math.min(100, ((rangeMin - min) / (max - min)) * 100))
      : 0;
  const zoneRightPct =
    rangeMax !== undefined
      ? Math.max(0, Math.min(100, ((rangeMax - min) / (max - min)) * 100))
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
        {valueText || !editable ? (
          <span
            className={`${valueKind === "text" ? "type-label config-slider__value config-slider__value--text" : "type-numeric config-slider__value"}${oor}`}
          >
            {valueText || valueLabel(value)}
          </span>
        ) : editing ? (
          <span className="type-numeric config-slider__value config-slider__value--editing">
            <input
              type="text"
              inputMode="decimal"
              autoFocus
              value={draft}
              aria-label={name}
              onChange={(e) => setDraft(e.target.value)}
              onBlur={commitDraft}
              onKeyDown={(e) => {
                if (e.key === "Enter") commitDraft();
                if (e.key === "Escape") { e.preventDefault(); setEditing(false); }
              }}
              className="config-slider__value-input"
            />
            {unit.trim()}
          </span>
        ) : (
          <button
            type="button"
            onClick={() => {
              setDraft(String(value));
              setEditing(true);
            }}
            className={`type-numeric config-slider__value config-slider__value--button${oor}`}
            title={uiMessage("features.recipe.recipe-configurator.typeValue")}
            aria-label={`${name ?? ""}: ${valueLabel(value)} · ${uiMessage("features.recipe.recipe-configurator.typeValue")}`}
          >
            {valueLabel(value)}
          </button>
        )}
      </div>

      <div className="config-slider__track-wrap">
        {/* Track background */}
        <div className="config-slider__track-bg">
          <div className="config-slider__track-bg-fill" />
        </div>

        {/* Optimal zone */}
        {rangeMin !== undefined && rangeMax !== undefined && rangeMax >= min && rangeMin <= max && (
          <div className={inRange ? "config-slider__zone-band" : "config-slider__zone-band config-slider__zone-band--out"} />
        )}

        {/* Filled track */}
        <div className="config-slider__fill">
          <div className="config-slider__fill-bg" />
        </div>

        {/* Zone markers */}
        {[rangeMin, rangeMax].map((tick, i) => tick !== undefined && tick >= min && tick <= max && (
          <div key={i} className={i ? "config-slider__zone-tick--end" : "config-slider__zone-tick--start"}>
            <div className="config-slider__zone-tick-bar" />
          </div>
        ))}

        {/* Adaptive limit markers (dashed barrier lines) */}
        {[adaptiveMin, adaptiveMax].map((limit, i) => limit !== undefined && limit >= min && limit <= max && (
          <div
            key={i}
            className="config-slider__limit-marker"
            style={{ ["--marker-pos" as any]: `${((limit - min) / (max - min)) * 100}%` }}
          >
            <div className="config-slider__limit-marker-line" />
            <div className="config-slider__limit-marker-tick" />
          </div>
        ))}

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
          aria-label={name}
          aria-valuetext={valueText ?? valueLabel(value)}
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="config-slider__input"
        />
      </div>

      {/* G2-WP-02 (S06-A-03/B-03): i numeri del range sotto le tacche, non ai
          bordi; se il range esce dalla traccia, una riga di testo. */}
      {zone.kind === "ticks" && (
        <div className="config-slider__zone-labels">
          <span className="type-numeric config-slider__zone-label" data-align={zone.startAlign}>
            {zoneLabels?.[0] ?? (format ? format(rangeMin!) : numberLabel(rangeMin!))}
          </span>
          <span className="type-numeric config-slider__zone-label config-slider__zone-label--end" data-align={zone.endAlign}>
            {zoneLabels?.[1] ?? (format ? format(rangeMax!) : numberLabel(rangeMax!))}
          </span>
        </div>
      )}
      {zone.kind === "outside" && (
        <p className="type-data-sm config-slider__zone-note">
          {zone.beyondCeiling
            ? uiMessage("features.recipe.recipe-configurator.rangeOutsideTrack", [valueLabel(rangeMin!), valueLabel(rangeMax!)])
            : uiMessage("features.recipe.recipe-configurator.rangeOutsideScale", [valueLabel(rangeMin!), valueLabel(rangeMax!)])}
        </p>
      )}
    </div>
  );
}
