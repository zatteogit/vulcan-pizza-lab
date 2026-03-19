import type { CmsContent, LocaleId } from "../cms-context";
import { EN_LOCALE } from "./en";
import { ES_LOCALE } from "./es";
import { DE_LOCALE } from "./de";
import { FR_LOCALE } from "./fr";
import { PT_LOCALE } from "./pt";
import { JA_LOCALE } from "./ja";

/* ═══ LOCALE REGISTRY ═══
 * Each locale is a full CmsContent bundle.
 * To add a new language:
 *   1. Create a new file (e.g. ja.ts) exporting JA_LOCALE: CmsContent
 *   2. Import it here and add to LOCALE_BUNDLES
 *   3. The CMS language selector will auto-detect the new entry
 */

/** Available locale bundles (Italian defaults live in CMS_DEFAULTS) */
export const LOCALE_BUNDLES: Partial<
  Record<LocaleId, CmsContent>
> = {
  en: EN_LOCALE,
  es: ES_LOCALE,
  de: DE_LOCALE,
  fr: FR_LOCALE,
  pt: PT_LOCALE,
  ja: JA_LOCALE,
};

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