import type { CmsUiStrings } from "./cms-context";
import { interpolate } from "../../i18n/interpolate";
import {
  formatDuration,
  formatMass,
  formatPercent,
  formatTemp,
  formatUnit,
} from "../../i18n/format";

/* ═══ VULCAN I18N HELPERS ═══
 * Lightweight template + formatting utilities driven by CMS ui strings.
 * No external dependencies — uses Intl APIs for locale-aware formatting.
 *
 * Usage:
 *   const { cms, bcp47 } = useCms();
 *   const fmt = createFormatter(cms.ui, bcp47);
 *   fmt.t("clipboardBalls", { n: 4, w: 280 })  // "4 panetti da 280g"
 *   fmt.cookTime(90)                            // "90 secondi" (it) / "90 seconds" (en)
 *   fmt.fermentTime(24)                         // "24 ore" (it) / "24 hours" (en)
 */

/** FW-11: nome di luogo nella lingua attiva, con l'italiano dei dati come
 *  ripiego. Da passare a shortOrigin / formatOrigin. */
export function placeNameLocalizer(
  cms: { placeNames?: Record<string, string> },
): (italianName: string) => string {
  return (name) => cms.placeNames?.[name] ?? name;
}

/** Simple template interpolation: replaces {key} placeholders */
export function t(template: string | undefined, vars: Record<string, string | number>): string {
  return interpolate(template, vars);
}

export type UnitSystem = "metric" | "imperial";
const UNIT_SYSTEM_STORAGE_KEY = "vulcan_unit_system";

type MeasureUnit =
  | "gram"
  | "milliliter"
  | "piece"
  | "celsius"
  | "percent"
  | "centimeter"
  | "millimeter"
  | "squareCentimeter";

const PIECE_UNITS: Record<string, { one: string; many: string }> = {
  it: { one: "pz", many: "pz" },
  en: { one: "pc", many: "pcs" },
  de: { one: "Stk.", many: "Stk." },
  es: { one: "ud.", many: "uds." },
  fr: { one: "pce", many: "pces" },
  pt: { one: "un.", many: "un." },
  ja: { one: "個", many: "個" },
};

function langOf(bcp47: string): string {
  return bcp47.split("-")[0]?.toLowerCase() || "it";
}

function formatNumber(
  bcp47: string,
  value: number,
  options: Intl.NumberFormatOptions = {},
): string {
  return new Intl.NumberFormat(bcp47, {
    maximumFractionDigits: Number.isInteger(value) ? 0 : 1,
    ...options,
  }).format(value);
}

export function getPreferredUnitSystem(): UnitSystem {
  try {
    const saved = localStorage.getItem(UNIT_SYSTEM_STORAGE_KEY);
    return saved === "imperial" ? "imperial" : "metric";
  } catch {
    return "metric";
  }
}

export function savePreferredUnitSystem(system: UnitSystem) {
  try {
    localStorage.setItem(UNIT_SYSTEM_STORAGE_KEY, system);
  } catch {
    /* ignore */
  }
}

export function formatTemperatureCopy(
  text: string,
  fmt: { celsius: (value: number) => string },
) {
  const parse = (value: string) => Number(value.replace(",", "."));
  return text
    .replace(
      /(\d+(?:[.,]\d+)?)\s*[–-]\s*(\d+(?:[.,]\d+)?)\s*°C/g,
      (_match, min: string, max: string) =>
        `${fmt.celsius(parse(min))}-${fmt.celsius(parse(max))}`,
    )
    .replace(
      /(\d+(?:[.,]\d+)?)\s*°C/g,
      (_match, value: string) => fmt.celsius(parse(value)),
    );
}

export function formatLengthCopy(
  text: string,
  fmt: {
    centimeters: (value: number) => string;
    millimeters: (value: number) => string;
  },
) {
  const parse = (value: string) => Number(value.replace(",", "."));
  const format = (value: string, unit: string) =>
    unit === "mm" ? fmt.millimeters(parse(value)) : fmt.centimeters(parse(value));
  const joinRange = (min: string, max: string, unit: string) => {
    const a = format(min, unit);
    const b = format(max, unit);
    const suffix = b.replace(/^[\d.,]+/, "");
    return suffix && a.endsWith(suffix)
      ? `${a.slice(0, -suffix.length)}-${b}`
      : `${a}-${b}`;
  };
  return text
    .replace(
      /(\d+(?:[.,]\d+)?)\s*[–-]\s*(\d+(?:[.,]\d+)?)\s*(cm|mm)\b/g,
      (_match, min: string, max: string, unit: string) => joinRange(min, max, unit),
    )
    .replace(
      /(\d+(?:[.,]\d+)?)\s*(cm|mm)\b/g,
      (_match, value: string, unit: string) => format(value, unit),
    );
}

function celsiusDeltaToFahrenheit(value: number): number {
  return value * 9 / 5;
}

function millilitersToFluidOunces(value: number): number {
  return value / 29.5735295625;
}

function centimetersToInches(value: number): number {
  return value / 2.54;
}

function millimetersToInches(value: number): number {
  return value / 25.4;
}

function squareCentimetersToSquareInches(value: number): number {
  return value / 6.4516;
}

function formatMeasure(
  bcp47: string,
  value: number,
  unit: MeasureUnit,
  unitSystem: UnitSystem,
): string {
  if (unitSystem === "imperial") {
    if (unit === "celsius") return formatTemp(value, bcp47, "imperial");
    /* FW-11 (S17-A-01, D-J): le microdosi restano in grammi. */
    if (unit === "gram") return formatMass(value, bcp47, "imperial");
    if (unit === "milliliter") {
      return `${formatNumber(bcp47, millilitersToFluidOunces(value), { maximumFractionDigits: 1 })} fl oz`;
    }
    if (unit === "centimeter") {
      return `${formatNumber(bcp47, centimetersToInches(value), { maximumFractionDigits: 1 })} in`;
    }
    if (unit === "millimeter") {
      return `${formatNumber(bcp47, millimetersToInches(value), { maximumFractionDigits: 2 })} in`;
    }
    if (unit === "squareCentimeter") {
      return `${formatNumber(bcp47, squareCentimetersToSquareInches(value), { maximumFractionDigits: 0 })} in²`;
    }
  }
  const n = formatNumber(bcp47, value);
  /* FW-11: spazio e simboli secondo la lingua («387 g», «250 °C», «12 %» in de/fr). */
  if (unit === "percent") return formatPercent(value, bcp47);
  if (unit === "celsius") return formatTemp(value, bcp47);
  if (unit === "gram") return formatMass(value, bcp47);
  if (unit === "milliliter") return `${n} ml`;
  if (unit === "centimeter") return `${n} cm`;
  if (unit === "millimeter") return `${n} mm`;
  if (unit === "squareCentimeter") return `${n} cm²`;
  const labels = PIECE_UNITS[langOf(bcp47)] ?? PIECE_UNITS.en;
  return `${n} ${Math.abs(value) === 1 ? labels.one : labels.many}`;
}

/** Create a formatter bound to the current CMS ui strings + locale */
export function createFormatter(
  ui: CmsUiStrings,
  bcp47: string,
  unitSystem: UnitSystem = getPreferredUnitSystem(),
) {
  return {
    /** Template interpolation on any ui string key */
    t: (key: keyof CmsUiStrings, vars: Record<string, string | number> = {}) =>
      t(ui[key], vars),

    /** Format cook time (seconds) with locale-aware time words */
    cookTime: (sec: number): string => {
      if (sec < 120) return `${sec} ${ui.seconds}`;
      const mins = Math.round(sec / 60);
      return `${mins} ${mins === 1 ? ui.minute : ui.minutes}`;
    },

    /** Format fermentation time (hours) with locale-aware time words */
    fermentTime: (hours: number): string => {
      if (hours < 1) return `${Math.round(hours * 60)} ${ui.minutes}`;
      const h = Math.floor(hours);
      const m = Math.round((hours - h) * 60);
      if (m === 0) return `${h} ${h === 1 ? ui.hour : ui.hours}`;
      return formatDuration(h * 60 + m, bcp47);
    },

    /** Compact duration from hours, e.g. "3 h 45 min" / "3 hr 45 min" / "3時間45分". */
    durationShort: (hours: number): string => formatDuration(hours * 60, bcp47),

    /** Format a generic duration expressed in minutes. */
    durationMinutes: (minutes: number): string =>
      minutes <= 0 ? "" : formatDuration(minutes, bcp47),

    number: (value: number, options?: Intl.NumberFormatOptions) =>
      formatNumber(bcp47, value, options),
    unitSystem,
    measure: (value: number, unit: MeasureUnit) =>
      formatMeasure(bcp47, value, unit, unitSystem),
    grams: (value: number) => formatMeasure(bcp47, value, "gram", unitSystem),
    milliliters: (value: number) => formatMeasure(bcp47, value, "milliliter", unitSystem),
    centimeters: (value: number) => formatMeasure(bcp47, value, "centimeter", unitSystem),
    millimeters: (value: number) => formatMeasure(bcp47, value, "millimeter", unitSystem),
    squareCentimeters: (value: number) => formatMeasure(bcp47, value, "squareCentimeter", unitSystem),
    pieces: (value: number) => formatMeasure(bcp47, value, "piece", unitSystem),
    celsius: (value: number) => formatMeasure(bcp47, value, "celsius", unitSystem),
    celsiusDelta: (value: number) =>
      unitSystem === "imperial"
        ? formatUnit(celsiusDeltaToFahrenheit(value), "fahrenheit", bcp47)
        : formatUnit(value, "celsius", bcp47),
    percent: (value: number) => formatMeasure(bcp47, value, "percent", unitSystem),

    /** Format clock time with locale */
    clockTime: (date: Date): string => {
      return date.toLocaleTimeString(bcp47, {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
    },

    /** Format fermentation detail, e.g. "a 24°C" / "at 75°F". */
    tempSuffix: (tempC: number): string =>
      formatTemperatureCopy(t(ui.statTempSuffix, { t: tempC }), {
        celsius: (value) => formatMeasure(bcp47, value, "celsius", unitSystem),
      }),

    /** BCP 47 locale tag for external APIs */
    bcp47,
  };
}
