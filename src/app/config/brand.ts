/* ═══ BRAND — il nome del prodotto in un solo punto ═══
 *
 * Per rinominare il prodotto basta cambiare NAME: tutto il resto deriva da qui.
 *   · <title> e manifest  → segnaposto %BRAND_NAME% / %BRAND_FULL_NAME%
 *                            riempiti in build dal plugin in vite.config.ts;
 *   · stringhe CMS e cataloghi i18n → token {brand} / {brandFull}, risolti da
 *                            CmsProvider, uiMessage e showcaseMessage;
 *   · codice (logo, wordmark, motore, glossario, strumenti) → BRAND.
 *
 * NON seguono il nome gli identificatori tecnici con prefisso «vulcan»
 * (chiavi localStorage vulcan_*, eventi vulcan:*, ID/classi CSS, nomi di
 * componenti e file, Worker/D1/package): rinominarli romperebbe dati salvati,
 * guard e infrastruttura. Elenco, motivi e procedura in
 * docs/brand/nome-prodotto.md. Il marchio grafico è una «V»: un nome che non
 * comincia per V richiede una decisione di design, non solo questa riga.
 *
 * Modulo puro (nessun import, colore o globale browser): lo importano anche
 * domain/data e vite.config.ts.
 */

const NAME = "Vulcan";

export const BRAND = {
  /** Nome breve: wordmark, titoli dei documenti, frasi. */
  name: NAME,
  /** Nome completo: <title>, manifest, aria-label del logo. */
  fullName: `${NAME} Pizza Lab`,
} as const;

/** Token ammessi nelle stringhe di contenuto (CMS, cataloghi i18n). */
export const BRAND_TOKENS = {
  brand: BRAND.name,
  brandFull: BRAND.fullName,
} as const;

export type BrandToken = keyof typeof BRAND_TOKENS;

/** Segnaposto ammessi in index.html e public/site.webmanifest. */
export const BRAND_PLACEHOLDERS = {
  BRAND_NAME: BRAND.name,
  BRAND_FULL_NAME: BRAND.fullName,
} as const;

const TOKEN_PATTERN = /\{(brand|brandFull)\}/g;
const PLACEHOLDER_PATTERN = /%(BRAND_NAME|BRAND_FULL_NAME)%/g;

/** Sostituisce {brand} e {brandFull} con il nome corrente. */
export function withBrand(text: string): string {
  return text.replace(TOKEN_PATTERN, (_, key: BrandToken) => BRAND_TOKENS[key]);
}

/** Sostituisce %BRAND_NAME% e %BRAND_FULL_NAME% (HTML e manifest, in build). */
export function fillBrandPlaceholders(text: string): string {
  return text.replace(
    PLACEHOLDER_PATTERN,
    (_, key: keyof typeof BRAND_PLACEHOLDERS) => BRAND_PLACEHOLDERS[key],
  );
}

/**
 * Risolve i token in tutte le stringhe di un oggetto annidato (es. il CMS).
 * I rami senza token restano lo stesso oggetto, così i memo a valle non
 * vedono cambiamenti finti.
 */
export function resolveBrandTokens<T>(value: T): T {
  if (typeof value === "string") {
    return withBrand(value) as unknown as T;
  }
  if (Array.isArray(value)) {
    let changed = false;
    const next = value.map((item) => {
      const resolved = resolveBrandTokens(item);
      if (resolved !== item) changed = true;
      return resolved;
    });
    return (changed ? next : value) as unknown as T;
  }
  if (value !== null && typeof value === "object") {
    const source = value as Record<string, unknown>;
    let next: Record<string, unknown> | null = null;
    for (const key of Object.keys(source)) {
      const item = source[key];
      const resolved = resolveBrandTokens(item);
      if (resolved !== item) {
        next ??= { ...source };
        next[key] = resolved;
      }
    }
    return (next ?? value) as T;
  }
  return value;
}
