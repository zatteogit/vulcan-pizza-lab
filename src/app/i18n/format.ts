/* ═══ FORMATTAZIONE LOCALE (FW-11) ═══
 * Un solo posto per numeri, intervalli, durate, tempi relativi, orari e
 * unità. Tutto passa da Intl con la lingua attiva; le parole che legano i
 * pezzi («tra», «verso le», «ca.») sono chiavi dei cataloghi uiMessage, mai
 * stringhe nel codice. Modulo puro: niente React, niente CMS.
 *
 *   formatNumber(0.62, "it-IT", { maximumFractionDigits: 2 })  → «0,62»
 *   formatRange(6, 14, "it-IT", { unit: "hour" })             → «6–14 h»
 *   formatDuration(576, "it-IT")                               → «9 h 36 min»
 *   formatRelative(target, now, "it-IT")                       → «tra 8 h 26 min»
 *   formatClock(ms, "it-IT", { approximate: true })            → «ca. 21:00»
 *   formatTemp(250, "it-IT")                                   → «250 °C»
 *   formatMass(0.85, "en-US", "imperial")                      → «0.85 g» (microdose)
 */

import { uiMessage } from "./ui-messages";

export type UnitSystem = "metric" | "imperial";

/** D-J: sotto questa soglia le dosi restano in grammi anche nel sistema
 *  imperiale. Un'oncia a 2 decimali ha passi di 0,28 g: su 0,7 g di lievito
 *  l'errore di arrotondamento arriva al ±50 %. Scelta di Vulcan. */
export const MICRO_DOSE_GRAMS = 10;

const GRAMS_PER_OUNCE = 28.349523125;

type IntlUnit =
  | "hour"
  | "minute"
  | "second"
  | "day"
  | "celsius"
  | "fahrenheit"
  | "gram"
  | "ounce"
  | "pound"
  | "percent"
  | "centimeter"
  | "millimeter"
  | "inch";

function defaultFraction(value: number): number {
  return Number.isInteger(value) ? 0 : 1;
}

export function formatNumber(
  value: number,
  locale: string,
  options: Intl.NumberFormatOptions = {},
): string {
  return new Intl.NumberFormat(locale, {
    maximumFractionDigits: defaultFraction(value),
    ...options,
  }).format(value);
}

/** Numero con unità, con la spaziatura della lingua («387 g», «250 °C»). */
export function formatUnit(
  value: number,
  unit: IntlUnit,
  locale: string,
  options: Intl.NumberFormatOptions = {},
): string {
  return new Intl.NumberFormat(locale, {
    style: "unit",
    unit,
    unitDisplay: "short",
    maximumFractionDigits: defaultFraction(value),
    ...options,
  }).format(value);
}

export function formatPercent(
  value: number,
  locale: string,
  options: Intl.NumberFormatOptions = {},
): string {
  return formatUnit(value, "percent", locale, options);
}

/** Intervallo con trattino tipografico e unità una sola volta: «6–14 h». */
export function formatRange(
  min: number,
  max: number,
  locale: string,
  options: Intl.NumberFormatOptions & { unit?: IntlUnit } = {},
): string {
  const { unit, ...numberOptions } = options;
  const low = formatNumber(min, locale, numberOptions);
  if (min === max) {
    return unit ? formatUnit(max, unit, locale, numberOptions) : low;
  }
  const highNumber = formatNumber(max, locale, numberOptions);
  if (!unit) return `${low}–${highNumber}`;
  const high = formatUnit(max, unit, locale, numberOptions);
  /* L'unità sta dove la mette la lingua: si sostituisce solo la cifra. */
  return high.includes(highNumber)
    ? high.replace(highNumber, `${low}–${highNumber}`)
    : `${low}–${high}`;
}

/** Durata in un solo formato per tutta l'app: «9 h 36 min», «28 h 48 min».
 *  Le lievitazioni si contano in ore («48 h»), quindi i giorni compaiono solo
 *  con `days` («1 giorno 4 h 48 min»), e senza perdere i minuti.
 *  Sotto il minuto, se `seconds` è vero, «45 s». */
export function formatDuration(
  minutes: number,
  locale: string,
  { seconds = false, days: useDays = false }: { seconds?: boolean; days?: boolean } = {},
): string {
  if (seconds && minutes < 1) {
    const secs = Math.max(0, Math.ceil(minutes * 60));
    /* 59,5 s si arrotonda a «1 min», non a «60 s». */
    if (secs < 60) return formatUnit(secs, "second", locale);
  }
  const total = Math.max(0, Math.round(minutes));
  const days = useDays ? Math.floor(total / 1440) : 0;
  const hours = Math.floor((total - days * 1440) / 60);
  const mins = total % 60;
  const parts: string[] = [];
  if (days > 0) {
    parts.push(formatUnit(days, "day", locale, { unitDisplay: "long" }));
  }
  if (hours > 0) parts.push(formatUnit(hours, "hour", locale));
  if (mins > 0 || parts.length === 0) parts.push(formatUnit(mins, "minute", locale));
  return parts.join(" ");
}

/** Tempo di cottura in secondi: «90 s» sotto i due minuti, poi «12 min»,
 *  «4 min 30 s». */
export function formatSeconds(totalSeconds: number, locale: string): string {
  const total = Math.max(0, Math.round(totalSeconds));
  if (total < 120) return formatUnit(total, "second", locale);
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  const min = formatUnit(minutes, "minute", locale);
  return seconds === 0 ? min : `${min} ${formatUnit(seconds, "second", locale)}`;
}

/** Sceglie la forma singolare o plurale secondo le regole della lingua
 *  (Intl.PluralRules). Le due forme sono già tradotte dal chiamante. */
export function pluralPick(
  count: number,
  locale: string,
  forms: { one: string; other: string },
): string {
  return new Intl.PluralRules(locale).select(count) === "one" ? forms.one : forms.other;
}

/** «tra 8 h 26 min» / «in 8 hrs 26 mins» / «8 時間 26 分後»: la grammatica è
 *  nel catalogo (format.relativeIn), la durata da formatDuration. */
export function formatRelative(
  targetMs: number,
  nowMs: number,
  locale: string,
  { seconds = false }: { seconds?: boolean } = {},
): string {
  const diffMs = targetMs - nowMs;
  if (diffMs <= 0) return uiMessage("format.now", [], locale);
  const minutes = seconds && diffMs < 60_000 ? diffMs / 60_000 : Math.ceil(diffMs / 60_000);
  return uiMessage(
    "format.relativeIn",
    [formatDuration(minutes, locale, { seconds })],
    locale,
  );
}

function sameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/** Giorno della settimana davanti all'orario, nell'ordine della lingua
 *  (format.onDay): «gio verso le 09:15», «Thu around 09:15». */
function withDay(
  date: Date,
  phrase: string,
  locale: string,
  nowMs: number | undefined,
): string {
  if (nowMs === undefined || sameDay(date, new Date(nowMs))) return phrase;
  const weekday = date.toLocaleDateString(locale, { weekday: "short" });
  return uiMessage("format.onDay", [weekday, phrase], locale);
}

function clockTime(date: Date, locale: string): string {
  return date.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" });
}

/** Orario «16:30»; con `approximate` arrotonda ai 15 minuti e usa la chiave
 *  format.approxTime («ca. 16:30»). Se cade in un altro giorno rispetto a
 *  `nowMs` antepone il giorno della settimana («gio ca. 16:30»). */
export function formatClock(
  ms: number,
  locale: string,
  { approximate = false, nowMs }: { approximate?: boolean; nowMs?: number } = {},
): string {
  const date = new Date(approximate ? Math.round(ms / 900_000) * 900_000 : ms);
  const time = clockTime(date, locale);
  const phrase = approximate ? uiMessage("format.approxTime", [time], locale) : time;
  return withDay(date, phrase, locale, nowMs);
}

/** «alle 16:30» / «verso le 16:30»: orario con la preposizione della lingua. */
export function formatAtClock(
  ms: number,
  locale: string,
  { approximate = false, nowMs }: { approximate?: boolean; nowMs?: number } = {},
): string {
  const date = new Date(approximate ? Math.round(ms / 900_000) * 900_000 : ms);
  const phrase = uiMessage(
    approximate ? "format.aroundClock" : "format.atClock",
    [clockTime(date, locale)],
    locale,
  );
  return withDay(date, phrase, locale, nowMs);
}

export function formatTemp(
  celsius: number,
  locale: string,
  units: UnitSystem = "metric",
): string {
  if (units === "imperial") {
    return formatUnit(celsius * 9 / 5 + 32, "fahrenheit", locale, { maximumFractionDigits: 0 });
  }
  return formatUnit(celsius, "celsius", locale);
}

/** Vero se nel sistema imperiale la dose resta in grammi (D-J). */
export function isMicroDose(grams: number): boolean {
  return Math.abs(grams) > 0 && Math.abs(grams) < MICRO_DOSE_GRAMS;
}

/** Massa: grammi nel metrico; once e libbre nell'imperiale, tranne le
 *  microdosi (sotto MICRO_DOSE_GRAMS, o `microDose` esplicito) che restano in
 *  grammi perché in once non si pesano con precisione (S17-A-01, D-J). */
export function formatMass(
  grams: number,
  locale: string,
  units: UnitSystem = "metric",
  { microDose = false }: { microDose?: boolean } = {},
): string {
  if (units !== "imperial" || microDose || isMicroDose(grams)) {
    return formatUnit(grams, "gram", locale);
  }
  const rawOunces = grams / GRAMS_PER_OUNCE;
  /* Si arrotonda al decimo prima di scegliere le libbre: 453 g è «1 lb»,
   *  non «16 oz», e il resto non arriva mai a «16 oz». */
  const ounces = Math.abs(rawOunces) < 1 ? rawOunces : Math.round(rawOunces * 10) / 10;
  if (Math.abs(ounces) >= 16) {
    const pounds = Math.trunc(ounces / 16);
    const remainder = Math.round(Math.abs(ounces - pounds * 16) * 10) / 10;
    const lb = formatUnit(pounds, "pound", locale);
    return remainder < 0.05
      ? lb
      : `${lb} ${formatUnit(remainder, "ounce", locale, { maximumFractionDigits: 1 })}`;
  }
  return formatUnit(ounces, "ounce", locale, {
    maximumFractionDigits: ounces < 1 ? 2 : 1,
  });
}

/* FW-05 — elenchi nella lingua attiva («A, B e C»), per i nomi di stile che
 * arrivano dai dati del motore (guida ai prefermenti). */
type ListFormatCtor = new (locale: string, options: { style: "long"; type: "conjunction" }) => { format(items: readonly string[]): string };

export function formatList(items: readonly string[], locale: string): string {
  // Intl.ListFormat è nei browser supportati ma non nella lib ES2020 di TypeScript.
  const ListFormat = (Intl as unknown as { ListFormat?: ListFormatCtor }).ListFormat;
  return ListFormat ? new ListFormat(locale, { style: "long", type: "conjunction" }).format(items) : items.join(", ");
}

/* FW-15 — Data di calendario («24 ottobre 2026») per versione e fonti.
 *  Accetta una data ISO «YYYY-MM-DD», letta come giorno locale (niente fusi). */
export function formatCalendarDate(isoDate: string, locale: string): string {
  const [year, month, day] = isoDate.split("-").map(Number);
  if (!year || !month || !day) return isoDate;
  return new Date(year, month - 1, day).toLocaleDateString(locale, { day: "numeric", month: "long", year: "numeric" });
}

/** FW-15 — Elenco breve («Ooni, Gozney, Effeuno») col separatore della lingua. */
export function formatShortList(items: readonly string[], locale?: string): string {
  return items.join(uiMessage("format.listSeparator", [], locale));
}
