import type { CmsContent, LocaleId } from "../cms-context";

/* ═══ LOCALE REGISTRY ═══
 * Each locale is a full CmsContent bundle, loaded ON DEMAND (audit lug 2026:
 * i 6 bundle non-IT pesavano ~440 kB di sorgente nel chunk principale — un
 * utente italiano scaricava anche il giapponese a ogni avvio).
 * To add a new language:
 *   1. Create a new file (e.g. ja.ts) exporting JA_LOCALE: CmsContent
 *   2. Add its loader here and its entry in LOCALE_META
 *   3. The CMS language selector will auto-detect the new entry
 */

const LOCALE_LOADERS: Partial<Record<LocaleId, () => Promise<CmsContent>>> = {
  en: () => import("./en").then((m) => m.EN_LOCALE),
  es: () => import("./es").then((m) => m.ES_LOCALE),
  de: () => import("./de").then((m) => m.DE_LOCALE),
  fr: () => import("./fr").then((m) => m.FR_LOCALE),
  pt: () => import("./pt").then((m) => m.PT_LOCALE),
  ja: () => import("./ja").then((m) => m.JA_LOCALE),
};

/** Bundle già caricati in sessione — lettura sincrona per il merge base. */
const loadedBundles: Partial<Record<LocaleId, CmsContent>> = {};

export function isKnownLocale(code: string): code is LocaleId {
  return code === "it" || code in LOCALE_LOADERS;
}

export function getCachedLocaleBundle(id: LocaleId): CmsContent | undefined {
  return loadedBundles[id];
}

export async function loadLocaleBundle(
  id: LocaleId,
): Promise<CmsContent | undefined> {
  if (id === "it") return undefined; /* IT = CMS_DEFAULTS, mai un bundle */
  const cached = loadedBundles[id];
  if (cached) return cached;
  const loader = LOCALE_LOADERS[id];
  if (!loader) return undefined;
  const bundle = await loader();
  loadedBundles[id] = bundle;
  return bundle;
}

/** Metadata for the locale selector UI */
export interface LocaleMeta {
  id: LocaleId;
  name: string;
  flag: string;
  available: boolean;
}

export const LOCALE_META: LocaleMeta[] = [
  {
    id: "it",
    name: "Italiano",
    flag: "\u{1F1EE}\u{1F1F9}",
    available: true,
  },
  {
    id: "en",
    name: "English",
    flag: "\u{1F1EC}\u{1F1E7}",
    available: true,
  },
  {
    id: "es",
    name: "Espa\u00F1ol",
    flag: "\u{1F1EA}\u{1F1F8}",
    available: true,
  },
  {
    id: "de",
    name: "Deutsch",
    flag: "\u{1F1E9}\u{1F1EA}",
    available: true,
  },
  {
    id: "fr",
    name: "Fran\u00E7ais",
    flag: "\u{1F1EB}\u{1F1F7}",
    available: true,
  },
  {
    id: "pt",
    name: "Portugu\u00EAs",
    flag: "\u{1F1F5}\u{1F1F9}",
    available: true,
  },
  {
    id: "ja",
    name: "\u65E5\u672C\u8A9E",
    flag: "\u{1F1EF}\u{1F1F5}",
    available: true,
  },
];

/** BCP 47 locale tag for Intl APIs */
export const LOCALE_BCP47: Record<LocaleId, string> = {
  it: "it-IT",
  en: "en-GB",
  es: "es-ES",
  de: "de-DE",
  fr: "fr-FR",
  pt: "pt-BR",
  ja: "ja-JP",
};