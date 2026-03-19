import type { CmsUiStrings } from "./cms-context";

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

/** Simple template interpolation: replaces {key} placeholders */
export function t(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, key) =>
    vars[key] !== undefined ? String(vars[key]) : `{${key}}`,
  );
}

/** Create a formatter bound to the current CMS ui strings + locale */
export function createFormatter(ui: CmsUiStrings, bcp47: string) {
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
      return `${h}h ${m}min`;
    },

    /** Format clock time with locale */
    clockTime: (date: Date): string => {
      return date.toLocaleTimeString(bcp47, {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
    },

    /** Format fermentation detail: "a {t}°C" */
    tempSuffix: (tempC: number): string =>
      t(ui.statTempSuffix, { t: tempC }),

    /** BCP 47 locale tag for external APIs */
    bcp47,
  };
}
