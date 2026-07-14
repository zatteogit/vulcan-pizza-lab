import assert from "node:assert/strict";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { fixMountedCopy, runI18nGuard } from "./i18n-ui-guard";

function write(root: string, file: string, content: string): void {
  const absolute = path.join(root, file);
  fs.mkdirSync(path.dirname(absolute), { recursive: true });
  fs.writeFileSync(absolute, content);
}

function fixture(): string {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "vulcan-i18n-"));
  write(
    root,
    "tsconfig.json",
    JSON.stringify({
      compilerOptions: {
        target: "ES2022",
        module: "ESNext",
        moduleResolution: "Node",
        jsx: "react-jsx",
      },
      include: ["src"],
    }),
  );
  write(root, "src/app/i18n/ui-messages.it.ts", "export const UI_MESSAGES_IT = {};\n");
  write(
    root,
    "src/app/i18n/showcase-messages.it.ts",
    "export const SHOWCASE_MESSAGES_IT = {};\n",
  );
  return root;
}

const roots: string[] = [];
try {
  const clean = fixture();
  roots.push(clean);
  write(
    clean,
    "src/app/i18n/ui-messages.it.ts",
    'export const UI_MESSAGES_IT: Record<string, string> = {"fixture.clean":"Pronto","fixture.quick":"Rapido"};\n',
  );
  write(
    clean,
    "src/app/i18n/showcase-messages.it.ts",
    'export const SHOWCASE_MESSAGES_IT: Record<string, string> = {"fixture.showcase":"Showcase"};\n',
  );
  write(
    clean,
    "src/app/i18n/ui-messages.ts",
    "export const uiMessage = (key: string) => key;\n",
  );
  write(
    clean,
    "src/app/pages/clean.tsx",
    [
      'import { uiMessage } from "../i18n/ui-messages";',
      'const QUICK_KEYS = ["fixture.quick"] as const;',
      'export const Clean = () => <a className="button primary" data-testid="hero-cta" href="/recipe" role="button">',
      '  <span aria-hidden="true">+</span>',
      '  <span>{uiMessage("fixture.clean")}</span>',
      "  <span>{QUICK_KEYS.map((key) => uiMessage(key))}</span>",
      "</a>;",
      'export const enumValue = "static_top_bottom";',
    ].join("\n"),
  );
  write(
    clean,
    "src/app/i18n/showcase-messages.ts",
    "export const showcaseMessage = (key: string) => key;\n",
  );
  write(
    clean,
    "src/app/pages/design-system.tsx",
    [
      'import { showcaseMessage } from "../i18n/showcase-messages";',
      'export const Showcase = () => <h1>{showcaseMessage("fixture.showcase")}</h1>;',
    ].join("\n"),
  );
  const cleanResult = runI18nGuard(
    clean,
    ["src/app/pages/clean.tsx"],
    ["src/app/pages/design-system.tsx"],
  );
  assert.deepEqual(cleanResult.violations, []);
  assert.deepEqual(cleanResult.missingCatalogKeys, []);
  assert.deepEqual(cleanResult.orphanCatalogKeys, []);
  assert.equal(cleanResult.productCatalogKeyCount, 2);
  assert.equal(cleanResult.showcaseCatalogKeyCount, 1);

  const dirty = fixture();
  roots.push(dirty);
  write(
    dirty,
    "src/app/pages/dirty.tsx",
    [
      'const toast = (message: string) => message;',
      "function getAcronymTooltip(): string {",
      '  const acronyms: Record<string, string> = { AVPN: "Associazione Verace Pizza Napoletana" };',
      "  return acronyms.AVPN;",
      "}",
      "export const Dirty = () => (",
      '  <section aria-label="Risultati ricetta" aria-description={getAcronymTooltip()}>',
      "    Crea la tua pizza",
      '    <input placeholder="Cerca uno stile" />',
      '    <button title="Salva ricetta" onClick={() => toast("Ricetta salvata")}>OK</button>',
      '    <aside message="Preferenze sincronizzate" action="Annulla" decrementLabel="Riduci quantità" />',
      '    <aside data-testid="principles" principi={["Una regola visibile"]} />',
      "  </section>",
      ");",
      'export const config = [{ label: "Principiante", description: "Prime esperienze", state: "Selezionato", target: "Contenuto principale", msg: "Operazione completata" }];',
    ].join("\n"),
  );
  const violations = runI18nGuard(dirty, ["src/app/pages/dirty.tsx"], []).violations;
  const categories = new Set(violations.map((violation) => violation.category));
  assert(violations.length >= 7);
  assert(categories.has("jsx-text"));
  assert(categories.has("jsx-attribute:aria-label"));
  assert(categories.has("jsx-attribute:placeholder"));
  assert(categories.has("jsx-attribute:title"));
  assert(categories.has("jsx-attribute:message"));
  assert(categories.has("jsx-attribute:action"));
  assert(categories.has("jsx-attribute:decrementLabel"));
  assert(categories.has("display-property:label"));
  assert(categories.has("display-property:description"));
  assert(categories.has("display-property:state"));
  assert(categories.has("display-property:target"));
  assert(categories.has("display-property:msg"));
  assert(categories.has("jsx-container:principi"));
  assert([...categories].some((category) => category.startsWith("feedback:")));
  assert(categories.has("helper-output:getAcronymTooltip"));

  const fixable = fixture();
  roots.push(fixable);
  write(
    fixable,
    "src/app/pages/product.tsx",
    [
      'export const Product = ({ count }: { count: number }) => (',
      '  <main aria-label="Risultati">Trovate {count} ricette</main>',
      ");",
    ].join("\n"),
  );
  write(
    fixable,
    "src/app/pages/design-system.tsx",
    [
      "export const Showcase = () => (",
      '  <section title="Tipografia"><h1>Design System</h1></section>',
      ");",
    ].join("\n"),
  );
  const fixResult = fixMountedCopy(
    fixable,
    ["src/app/pages/product.tsx"],
    ["src/app/pages/design-system.tsx"],
  );
  assert.equal(fixResult.fileCount, 2);
  assert(fixResult.replacementCount >= 4);
  assert.match(
    fs.readFileSync(path.join(fixable, "src/app/pages/product.tsx"), "utf8"),
    /import \{ uiMessage \}/,
  );
  assert.match(
    fs.readFileSync(path.join(fixable, "src/app/pages/design-system.tsx"), "utf8"),
    /import \{ showcaseMessage \}/,
  );
  const fixedResult = runI18nGuard(
    fixable,
    ["src/app/pages/product.tsx"],
    ["src/app/pages/design-system.tsx"],
  );
  assert.deepEqual(fixedResult.violations, []);
  assert.deepEqual(fixedResult.missingCatalogKeys, []);
  assert.deepEqual(fixedResult.orphanCatalogKeys, []);

  console.log("i18n-ui-guard tests: ok");
} finally {
  for (const root of roots) fs.rmSync(root, { recursive: true, force: true });
}
