import { afterEach, describe, expect, it } from "vitest";
import ts from "typescript";
import {
  BRAND,
  BRAND_PLACEHOLDERS,
  BRAND_TOKENS,
  fillBrandPlaceholders,
  resolveBrandTokens,
  withBrand,
} from "./brand";
import {
  registerUiMessages,
  setActiveUiLocale,
  uiMessage,
} from "../i18n/ui-messages";
import {
  registerShowcaseMessages,
  showcaseMessage,
} from "../i18n/showcase-messages";
import { type CmsContent, type LocaleId } from "../features/cms/cms-context";
import { IT_LOCALE } from "../features/cms/locales/it";
import {
  LOCALE_BUNDLE_REV,
  LOCALE_META,
  isStaleLocaleSnapshot,
  loadLocaleBundle,
} from "../features/cms/locales/index";

/* ═══ Guard del nome del prodotto (VUL-BRAND-09) ═══
 * Il nome si scrive solo in src/app/config/brand.ts. Altrove si usano BRAND
 * (codice), i token {brand}/{brandFull} (CMS e cataloghi) o i segnaposto
 * %BRAND_NAME%/%BRAND_FULL_NAME% (index.html, manifest).
 * Si controllano solo le stringhe (letterali, template, testo JSX): commenti e
 * identificatori tecnici restano liberi. Il confronto è case-sensitive e non
 * scatta se il nome è seguito da una maiuscola, quindi chiavi vulcan_*,
 * VulcanMark, VULCAN_MARK_PATHS e simili non sono segnalati, mentre «Vulcans»,
 * «Vulcan’s», «Vulcanは» e «Vulcan-Motto» sì. */

/** Nomi storici, vietati anche dopo una rinomina: aggiungere qui il precedente. */
const LEGACY_NAMES = ["Vulcan Pizza Lab", "Vulcan"];

/** Eccezioni motivate, nel formato "percorso:riga" → motivo. Idealmente vuota. */
const ALLOWLIST: Record<string, string> = {};

/** File le cui stringhe passano dalla risoluzione dei token (CMS e cataloghi). */
const TOKEN_FILES = [
  /^\/src\/app\/features\/cms\/(cms-context\.tsx|domain-i18n-defaults\.ts|locales\/[\w-]+\.ts)$/,
  /^\/src\/app\/i18n\/(ui|showcase)-messages\.[a-z]{2}\.ts$/,
];

const SOURCES = import.meta.glob(
  ["/src/**/*.{ts,tsx}", "!/src/**/*.test.{ts,tsx}", "!/src/app/config/brand.ts"],
  { query: "?raw", import: "default", eager: true },
) as Record<string, string>;

const INDEX_HTML = Object.values(
  import.meta.glob("/index.html", { query: "?raw", import: "default", eager: true }) as Record<string, string>,
)[0];

const MANIFEST = Object.values(
  import.meta.glob("/public/site.webmanifest", { query: "?raw", import: "default", eager: true }) as Record<string, string>,
)[0];

function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const FORBIDDEN_NAMES = [...new Set([BRAND.fullName, BRAND.name, ...LEGACY_NAMES])].sort(
  (a, b) => b.length - a.length,
);
const NAME_PATTERN = new RegExp(
  `(?<![A-Za-z])(?:${FORBIDDEN_NAMES.map(escapeRegExp).join("|")})(?![A-Z])`,
);
const BRAND_TOKEN_PATTERN = /\{(brand\w*)\}/gi;
const PLACEHOLDER_PATTERN = /%(BRAND_\w*)%/g;

interface StringHit {
  file: string;
  line: number;
  text: string;
}

/** Tutte le stringhe visibili di un sorgente: letterali, template e testo JSX. */
function stringsOf(file: string, source: string): StringHit[] {
  const sf = ts.createSourceFile(
    file,
    source,
    ts.ScriptTarget.Latest,
    true,
    file.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
  );
  const hits: StringHit[] = [];
  const visit = (node: ts.Node) => {
    if (
      ts.isStringLiteral(node) ||
      ts.isNoSubstitutionTemplateLiteral(node) ||
      ts.isTemplateHead(node) ||
      ts.isTemplateMiddle(node) ||
      ts.isTemplateTail(node) ||
      ts.isJsxText(node)
    ) {
      const { line } = sf.getLineAndCharacterOfPosition(node.getStart(sf));
      hits.push({ file, line: line + 1, text: node.text });
    }
    ts.forEachChild(node, visit);
  };
  visit(sf);
  return hits;
}

const ALL_STRINGS = Object.entries(SOURCES).flatMap(([file, source]) => stringsOf(file, source));

function describeHit(hit: StringHit): string {
  return `${hit.file}:${hit.line}: ${JSON.stringify(hit.text.slice(0, 100))}`;
}

function collectStrings(value: unknown, out: string[] = []): string[] {
  if (typeof value === "string") out.push(value);
  else if (Array.isArray(value)) value.forEach((item) => collectStrings(item, out));
  else if (value && typeof value === "object") Object.values(value).forEach((item) => collectStrings(item, out));
  return out;
}

afterEach(() => setActiveUiLocale("it"));

describe("nome del prodotto: un solo punto (config/brand.ts)", () => {
  it("la scansione copre i sorgenti, index.html e il manifest", () => {
    expect(Object.keys(SOURCES).length).toBeGreaterThan(100);
    expect(SOURCES["/src/app/config/brand.ts"]).toBeUndefined();
    expect(INDEX_HTML).toContain('id="root"');
    expect(MANIFEST).toContain("theme_color");
  });

  it("nessuna stringa dei sorgenti scrive il nome a mano", () => {
    const offenders = ALL_STRINGS.filter(
      (hit) => NAME_PATTERN.test(hit.text) && !ALLOWLIST[`${hit.file}:${hit.line}`],
    ).map(describeHit);
    expect(offenders, "usa BRAND (codice) oppure {brand}/{brandFull} (CMS e cataloghi)").toEqual([]);
  });

  it("index.html usa i segnaposto e non contiene il nome", () => {
    const withoutComments = INDEX_HTML.replace(/<!--[\s\S]*?-->/g, "");
    expect(withoutComments).toContain("<title>%BRAND_FULL_NAME%</title>");
    expect(withoutComments).not.toMatch(NAME_PATTERN);
    expect(fillBrandPlaceholders(INDEX_HTML)).toContain(`<title>${BRAND.fullName}</title>`);
  });

  it("il manifest usa i segnaposto e resta JSON valido", () => {
    const manifest = JSON.parse(MANIFEST) as { name: string; short_name: string };
    expect(manifest.name).toBe("%BRAND_FULL_NAME%");
    expect(manifest.short_name).toBe("%BRAND_NAME%");
    expect(MANIFEST).not.toMatch(NAME_PATTERN);
    const filled = JSON.parse(fillBrandPlaceholders(MANIFEST)) as typeof manifest;
    expect(filled.name).toBe(BRAND.fullName);
    expect(filled.short_name).toBe(BRAND.name);
  });

  it("i token {brand…} sono validi e stanno solo dove vengono risolti", () => {
    const invalid: string[] = [];
    const misplaced: string[] = [];
    for (const hit of ALL_STRINGS) {
      for (const [, token] of hit.text.matchAll(BRAND_TOKEN_PATTERN)) {
        if (!(token in BRAND_TOKENS)) invalid.push(`${describeHit(hit)} → {${token}}`);
        else if (!TOKEN_FILES.some((pattern) => pattern.test(hit.file))) misplaced.push(describeHit(hit));
      }
    }
    expect(invalid, `token ammessi: ${Object.keys(BRAND_TOKENS).join(", ")}`).toEqual([]);
    expect(misplaced, "fuori da CMS e cataloghi usa BRAND, non i token").toEqual([]);
  });

  it("i segnaposto di index.html e del manifest sono validi", () => {
    for (const text of [INDEX_HTML, MANIFEST]) {
      for (const [, key] of text.matchAll(PLACEHOLDER_PATTERN)) {
        expect(Object.keys(BRAND_PLACEHOLDERS)).toContain(key);
      }
    }
  });
});

describe("risoluzione dei token", () => {
  it("withBrand sostituisce solo i token ammessi", () => {
    expect(withBrand("{brand} · {brandFull}")).toBe(`${BRAND.name} · ${BRAND.fullName}`);
    expect(withBrand("{Brand} {style}")).toBe("{Brand} {style}");
    expect(BRAND.fullName.startsWith(BRAND.name)).toBe(true);
  });

  it("uiMessage e showcaseMessage risolvono il brand dopo i posizionali", () => {
    registerUiMessages("xx", { "test.brand": "{0} — {brand}" });
    registerShowcaseMessages("xx", { "test.brand": "{brandFull} {0}" });
    setActiveUiLocale("xx");
    expect(uiMessage("test.brand", ["Ciao"])).toBe(`Ciao — ${BRAND.name}`);
    expect(showcaseMessage("test.brand", ["DS"])).toBe(`${BRAND.fullName} DS`);
  });

  it("resolveBrandTokens conserva i rami senza token", () => {
    const untouched = { label: "Forno", list: ["a", "b"] };
    const source = { a: { title: "{title} — {brand}" }, untouched, n: 3, flag: true, none: null };
    const resolved = resolveBrandTokens(source);
    expect(resolved.a.title).toBe(`{title} — ${BRAND.name}`);
    expect(resolved.untouched).toBe(untouched);
    expect(resolved.n).toBe(3);
    expect(source.a.title).toBe("{title} — {brand}");
    expect(resolveBrandTokens(untouched)).toBe(untouched);
  });

  it("CMS e bundle di tutte le lingue non lasciano token irrisolti", async () => {
    const bundles: [string, unknown][] = [["it", IT_LOCALE]];
    for (const meta of LOCALE_META) {
      if (meta.id === "it") continue;
      bundles.push([meta.id, await loadLocaleBundle(meta.id as LocaleId)]);
    }
    for (const [id, bundle] of bundles) {
      expect(bundle, id).toBeTruthy();
      const leftovers = collectStrings(resolveBrandTokens(bundle)).filter((text) => /\{brand/i.test(text));
      expect(leftovers, id).toEqual([]);
    }
    const en = resolveBrandTokens(await loadLocaleBundle("en"));
    expect(en?.ui.aboutLabel).toBe(`About ${BRAND.name}`);
  });
});

describe("snapshot della lingua in localStorage (VUL-BRAND-02)", () => {
  const snapshot = (id: LocaleId) => ({ locale: { id } }) as Partial<CmsContent>;

  it("uno snapshot non italiano senza revisione o con revisione diversa va ricaricato", () => {
    expect(isStaleLocaleSnapshot(snapshot("en"), null)).toBe(true);
    expect(isStaleLocaleSnapshot(snapshot("de"), LOCALE_BUNDLE_REV - 1)).toBe(true);
    expect(isStaleLocaleSnapshot(snapshot("ja"), LOCALE_BUNDLE_REV)).toBe(false);
  });

  it("italiano e modifiche senza lingua restano come sono", () => {
    expect(isStaleLocaleSnapshot(null, null)).toBe(false);
    expect(isStaleLocaleSnapshot(snapshot("it"), null)).toBe(false);
    expect(isStaleLocaleSnapshot({} as Partial<CmsContent>, null)).toBe(false);
  });
});
