import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import ts from "typescript";

export type SemanticRule =
  | "interactive-static-element"
  | "nested-interactive"
  | "redundant-role"
  | "incoherent-role"
  | "dialog-accessible-name"
  | "route-main-landmark"
  | "heading-contract"
  | "showcase-landmark"
  | "navigation-landmark"
  | "figure-caption"
  | "details-summary"
  | "image-alt"
  | "route-contract-sync";

export interface SemanticViolation {
  rule: SemanticRule;
  file: string;
  line: number;
  detail: string;
}

export interface SemanticGuardResult {
  violations: SemanticViolation[];
  scannedFileCount: number;
  reachableFileCount: number;
  routeCount: number;
}

export interface RouteContract {
  file: string;
  label?: string;
  requiredLandmarks?: readonly ("main" | "header" | "nav" | "article" | "aside")[];
  requireLevelOneHeading?: boolean;
  maxLevelOneHeadings?: number;
}

export interface SemanticGuardOptions {
  entryFiles?: readonly string[];
  routeContracts?: readonly RouteContract[];
}

/**
 * Entry del solo prodotto, più lo showcase del Design System. Le route
 * tecniche/admin restano fuori; il grafo segue comunque ogni import locale
 * realmente raggiungibile da queste superfici.
 */
export const SEMANTIC_ENTRY_FILES = [
  "src/app/components/shared/app-shell.tsx",
  "src/app/pages/home.tsx",
  "src/app/pages/explore.tsx",
  "src/app/pages/learn.tsx",
  "src/app/pages/glossary.tsx",
  "src/app/pages/troubleshooting.tsx",
  "src/app/pages/pre-ferments.tsx",
  "src/app/pages/profile.tsx",
  "src/app/pages/recipe.tsx",
  "src/app/pages/not-found.tsx",
  "src/app/pages/design-system.tsx",
] as const;

export const ROUTE_CONTRACTS: readonly RouteContract[] = [
  { file: "src/app/pages/home.tsx", label: "/", requiredLandmarks: ["main"], requireLevelOneHeading: true },
  { file: "src/app/pages/explore.tsx", label: "/explore", requiredLandmarks: ["main"], requireLevelOneHeading: true },
  { file: "src/app/pages/learn.tsx", label: "/learn", requiredLandmarks: ["main"], requireLevelOneHeading: true },
  { file: "src/app/pages/glossary.tsx", label: "/learn/glossary", requiredLandmarks: ["main"], requireLevelOneHeading: true },
  { file: "src/app/pages/troubleshooting.tsx", label: "/learn/troubleshooting", requiredLandmarks: ["main"], requireLevelOneHeading: true },
  { file: "src/app/pages/pre-ferments.tsx", label: "/learn/pre-ferments", requiredLandmarks: ["main"], requireLevelOneHeading: true },
  { file: "src/app/pages/profile.tsx", label: "/profile", requiredLandmarks: ["main"], requireLevelOneHeading: true },
  { file: "src/app/pages/recipe.tsx", label: "/recipe/:styleId", requiredLandmarks: ["main"], requireLevelOneHeading: true },
  { file: "src/app/pages/not-found.tsx", label: "404", requiredLandmarks: ["main"], requireLevelOneHeading: true },
  {
    file: "src/app/pages/design-system.tsx",
    label: "/design-system",
    requiredLandmarks: ["article", "header", "nav", "main"],
    requireLevelOneHeading: true,
    maxLevelOneHeadings: 1,
  },
] as const;

const EXCLUDED_REACHABLE_SEGMENTS = [
  "/src/app/features/dev-tools/",
  "/src/app/pages/dev.tsx",
  "/src/app/pages/cms.tsx",
] as const;

const INTERACTIVE_ROLES = new Set([
  "button",
  "link",
]);

const normalize = (filePath: string): string => filePath.split(path.sep).join("/");

function relative(root: string, filePath: string): string {
  return normalize(path.relative(root, filePath));
}

function loadTsConfig(root: string): {
  options: ts.CompilerOptions;
  fileNames: string[];
} {
  const configPath = ts.findConfigFile(root, existsSync, "tsconfig.json");
  if (!configPath) throw new Error(`semantic-guard: tsconfig.json non trovato sotto ${root}`);
  const config = ts.readConfigFile(configPath, (file) => readFileSync(file, "utf8"));
  if (config.error) {
    throw new Error(ts.flattenDiagnosticMessageText(config.error.messageText, "\n"));
  }
  const parsed = ts.parseJsonConfigFileContent(config.config, ts.sys, path.dirname(configPath));
  if (parsed.errors.length) {
    throw new Error(parsed.errors.map((error) => ts.flattenDiagnosticMessageText(error.messageText, "\n")).join("\n"));
  }
  return { options: parsed.options, fileNames: parsed.fileNames };
}

function isExcluded(filePath: string): boolean {
  const normalized = normalize(filePath);
  return EXCLUDED_REACHABLE_SEGMENTS.some((segment) => normalized.includes(segment));
}

function moduleSpecifiers(sourceFile: ts.SourceFile): string[] {
  const values: string[] = [];
  const visit = (node: ts.Node): void => {
    if (
      (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) &&
      node.moduleSpecifier &&
      ts.isStringLiteralLike(node.moduleSpecifier)
    ) {
      values.push(node.moduleSpecifier.text);
    } else if (
      ts.isCallExpression(node) &&
      node.expression.kind === ts.SyntaxKind.ImportKeyword &&
      node.arguments.length === 1 &&
      ts.isStringLiteralLike(node.arguments[0])
    ) {
      values.push(node.arguments[0].text);
    }
    ts.forEachChild(node, visit);
  };
  visit(sourceFile);
  return values;
}

function resolveEntry(program: ts.Program, root: string, entry: string): ts.SourceFile | undefined {
  const target = normalize(path.resolve(root, entry));
  return program.getSourceFiles().find((sourceFile) => normalize(path.resolve(sourceFile.fileName)) === target);
}

function collectReachable(
  program: ts.Program,
  root: string,
  compilerOptions: ts.CompilerOptions,
  entryFiles: readonly string[],
): ts.SourceFile[] {
  const queue = entryFiles
    .map((entry) => resolveEntry(program, root, entry))
    .filter((sourceFile): sourceFile is ts.SourceFile => Boolean(sourceFile));
  const seen = new Set<string>();
  const reachable: ts.SourceFile[] = [];

  while (queue.length) {
    const sourceFile = queue.shift()!;
    const absolute = normalize(path.resolve(sourceFile.fileName));
    if (seen.has(absolute) || isExcluded(absolute)) continue;
    if (!absolute.startsWith(`${normalize(path.resolve(root))}/`)) continue;
    seen.add(absolute);
    reachable.push(sourceFile);

    for (const specifier of moduleSpecifiers(sourceFile)) {
      const resolved = ts.resolveModuleName(
        specifier,
        sourceFile.fileName,
        compilerOptions,
        ts.sys,
      ).resolvedModule;
      if (!resolved || resolved.isExternalLibraryImport || resolved.resolvedFileName.endsWith(".d.ts")) continue;
      const target = program.getSourceFile(resolved.resolvedFileName);
      if (target) queue.push(target);
    }
  }

  return reachable;
}

type Opening = ts.JsxOpeningElement | ts.JsxSelfClosingElement;

function openingNodes(sourceFile: ts.SourceFile): Opening[] {
  const result: Opening[] = [];
  const visit = (node: ts.Node): void => {
    if (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) result.push(node);
    ts.forEachChild(node, visit);
  };
  visit(sourceFile);
  return result;
}

function tagText(opening: Opening): string {
  const name = opening.tagName;
  if (ts.isIdentifier(name)) return name.text;
  if (ts.isPropertyAccessExpression(name)) {
    const left = ts.isIdentifier(name.expression) ? name.expression.text : "";
    return left ? `${left}.${name.name.text}` : name.name.text;
  }
  if (ts.isJsxNamespacedName(name)) return `${name.namespace.text}:${name.name.text}`;
  return "";
}

function attributes(opening: Opening): Map<string, ts.JsxAttribute> {
  const result = new Map<string, ts.JsxAttribute>();
  for (const property of opening.attributes.properties) {
    if (ts.isJsxAttribute(property)) {
      const name = ts.isIdentifier(property.name)
        ? property.name.text
        : `${property.name.namespace.text}:${property.name.name.text}`;
      result.set(name, property);
    }
  }
  return result;
}

function literalAttributeValue(attribute: ts.JsxAttribute | undefined): string | undefined {
  const initializer = attribute?.initializer;
  if (!initializer) return attribute ? "true" : undefined;
  if (ts.isStringLiteral(initializer)) return initializer.text;
  if (!ts.isJsxExpression(initializer) || !initializer.expression) return undefined;
  const expression = initializer.expression;
  if (ts.isStringLiteralLike(expression)) return expression.text;
  if (ts.isNumericLiteral(expression)) return expression.text;
  if (expression.kind === ts.SyntaxKind.TrueKeyword) return "true";
  if (expression.kind === ts.SyntaxKind.FalseKeyword) return "false";
  return undefined;
}

/** Riconosce elementi nativi, motion.element e componenti polimorfici `as`. */
function semanticTag(opening: Opening): string | undefined {
  const raw = tagText(opening);
  if (/^[a-z][a-z0-9-]*$/.test(raw)) return raw;
  if (/^motion\.[a-z][a-z0-9-]*$/.test(raw)) return raw.slice("motion.".length);

  const as = attributes(opening).get("as");
  const literal = literalAttributeValue(as);
  if (literal && /^[a-z][a-z0-9-]*$/.test(literal)) return literal;
  if (as?.initializer && ts.isJsxExpression(as.initializer) && as.initializer.expression) {
    const node = as.initializer.expression;
    const expression = ts.isPropertyAccessExpression(node) && ts.isIdentifier(node.expression)
      ? `${node.expression.text}.${node.name.text}`
      : "";
    if (/^motion\.[a-z][a-z0-9-]*$/.test(expression)) return expression.slice("motion.".length);
  }
  return undefined;
}

function sourceLine(sourceFile: ts.SourceFile, node: ts.Node): number {
  return sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile)).line + 1;
}

function implicitRole(opening: Opening): string | undefined {
  const tag = semanticTag(opening);
  const attrs = attributes(opening);
  if (tag === "button" || tag === "summary") return "button";
  if (tag === "a" && attrs.has("href")) return "link";
  if (tag === "textarea") return "textbox";
  if (tag === "select") return attrs.has("multiple") ? "listbox" : "combobox";
  if (tag === "nav") return "navigation";
  if (tag === "main") return "main";
  if (tag === "aside") return "complementary";
  if (tag === "img") return "img";
  if (tag === "input") {
    const type = literalAttributeValue(attrs.get("type")) ?? "text";
    if (["button", "reset", "submit", "image"].includes(type)) return "button";
    if (type === "checkbox") return "checkbox";
    if (type === "radio") return "radio";
    if (type === "range") return "slider";
    if (type === "number") return "spinbutton";
    if (!['hidden', 'file', 'color'].includes(type)) return "textbox";
  }
  return undefined;
}

function interactiveKind(opening: Opening): string | undefined {
  const role = literalAttributeValue(attributes(opening).get("role"));
  const implicit = implicitRole(opening);
  if (role && INTERACTIVE_ROLES.has(role)) return `role=${role}`;
  if (implicit && INTERACTIVE_ROLES.has(implicit)) return `<${semanticTag(opening)}>`;
  return undefined;
}

function isClearlyIncoherentRole(opening: Opening, role: string): boolean {
  const tag = semanticTag(opening);
  if (!tag) return false;
  if (["dialog", "alertdialog"].includes(role)) {
    return ["button", "a", "input", "select", "textarea", "summary", "img"].includes(tag);
  }
  if (["navigation", "main", "complementary", "banner", "contentinfo"].includes(role)) {
    return ["button", "a", "input", "select", "textarea", "summary"].includes(tag);
  }
  if (role === "img") return ["button", "input", "select", "textarea"].includes(tag);
  return false;
}

function descendantHasTag(element: ts.JsxElement, required: string): boolean {
  let found = false;
  const visit = (node: ts.Node): void => {
    if (found) return;
    if (
      (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) &&
      semanticTag(node) === required
    ) {
      found = true;
      return;
    }
    ts.forEachChild(node, visit);
  };
  for (const child of element.children) visit(child);
  return found;
}

function isLevelOneHeading(opening: Opening): boolean {
  if (semanticTag(opening) === "h1") return true;
  if (tagText(opening).split(".").at(-1) !== "Heading") return false;
  const level = literalAttributeValue(attributes(opening).get("level"));
  return level === "page" || level === "1";
}

function addViolation(
  violations: SemanticViolation[],
  seen: Set<string>,
  violation: SemanticViolation,
): void {
  const key = `${violation.rule}\0${violation.file}\0${violation.line}\0${violation.detail}`;
  if (seen.has(key)) return;
  seen.add(key);
  violations.push(violation);
}

function checkSourceFile(
  root: string,
  sourceFile: ts.SourceFile,
  violations: SemanticViolation[],
  seen: Set<string>,
): void {
  const file = relative(root, sourceFile.fileName);

  for (const opening of openingNodes(sourceFile)) {
    const tag = semanticTag(opening);
    const attrs = attributes(opening);
    const role = literalAttributeValue(attrs.get("role"));

    if ((tag === "div" || tag === "span") && attrs.has("onClick")) {
      const hasRole = Boolean(role);
      const hasKeyboard = ["onKeyDown", "onKeyUp", "onKeyPress"].some((name) => attrs.has(name));
      const hasTabIndex = attrs.has("tabIndex");
      if (!hasRole || !hasKeyboard || !hasTabIndex) {
        addViolation(violations, seen, {
          rule: "interactive-static-element",
          file,
          line: sourceLine(sourceFile, opening),
          detail: `<${tag}> with onClick requires role, tabIndex and a keyboard handler; prefer a native button/link`,
        });
      }
    }

    const nativeRole = implicitRole(opening);
    if (role && nativeRole === role) {
      addViolation(violations, seen, {
        rule: "redundant-role",
        file,
        line: sourceLine(sourceFile, opening),
        detail: `role=\"${role}\" duplicates the implicit role of <${tag}>`,
      });
    } else if (role && isClearlyIncoherentRole(opening, role)) {
      addViolation(violations, seen, {
        rule: "incoherent-role",
        file,
        line: sourceLine(sourceFile, opening),
        detail: `role=\"${role}\" conflicts with the native semantics of <${tag}>`,
      });
    }

    if ((tag === "div" || tag === "span") && role && INTERACTIVE_ROLES.has(role)) {
      const operable =
        attrs.has("onClick") &&
        ["onKeyDown", "onKeyUp", "onKeyPress"].some((name) => attrs.has(name)) &&
        attrs.has("tabIndex");
      if (!operable) {
        addViolation(violations, seen, {
          rule: "incoherent-role",
          file,
          line: sourceLine(sourceFile, opening),
          detail: `<${tag} role=\"${role}\"> requires onClick, keyboard handling and tabIndex`,
        });
      }
    }

    if (tag === "dialog" || role === "dialog" || role === "alertdialog") {
      if (!attrs.has("aria-label") && !attrs.has("aria-labelledby")) {
        addViolation(violations, seen, {
          rule: "dialog-accessible-name",
          file,
          line: sourceLine(sourceFile, opening),
          detail: `${tag === "dialog" ? "<dialog>" : `role=\"${role}\"`} requires aria-label or aria-labelledby`,
        });
      }
    }

    if (tag === "nav" && !attrs.has("aria-label") && !attrs.has("aria-labelledby")) {
      addViolation(violations, seen, {
        rule: "navigation-landmark",
        file,
        line: sourceLine(sourceFile, opening),
        detail: "<nav> requires aria-label or aria-labelledby",
      });
    }

    if (tag === "img" && !attrs.has("alt")) {
      addViolation(violations, seen, {
        rule: "image-alt",
        file,
        line: sourceLine(sourceFile, opening),
        detail: '<img> requires an explicit alt attribute (alt="" is valid when decorative)',
      });
    }

    if (ts.isJsxSelfClosingElement(opening) && (tag === "figure" || tag === "details")) {
      const required = tag === "figure" ? "figcaption" : "summary";
      addViolation(violations, seen, {
        rule: tag === "figure" ? "figure-caption" : "details-summary",
        file,
        line: sourceLine(sourceFile, opening),
        detail: `<${tag}> requires a <${required}> descendant`,
      });
    }
  }

  const checkNested = (node: ts.Node, interactiveAncestors: Opening[]): void => {
    if (ts.isJsxElement(node)) {
      const opening = node.openingElement;
      const kind = interactiveKind(opening);
      if (kind && interactiveAncestors.length) {
        const ancestor = interactiveAncestors.at(-1)!;
        addViolation(violations, seen, {
          rule: "nested-interactive",
          file,
          line: sourceLine(sourceFile, opening),
          detail: `${kind} is nested inside interactive ${interactiveKind(ancestor)}`,
        });
      }
      const next = kind ? [...interactiveAncestors, opening] : interactiveAncestors;
      for (const child of node.children) checkNested(child, next);
      return;
    }
    if (ts.isJsxSelfClosingElement(node)) {
      const kind = interactiveKind(node);
      if (kind && interactiveAncestors.length) {
        const ancestor = interactiveAncestors.at(-1)!;
        addViolation(violations, seen, {
          rule: "nested-interactive",
          file,
          line: sourceLine(sourceFile, node),
          detail: `${kind} is nested inside interactive ${interactiveKind(ancestor)}`,
        });
      }
      return;
    }
    if (ts.isJsxFragment(node)) {
      for (const child of node.children) checkNested(child, interactiveAncestors);
      return;
    }
    ts.forEachChild(node, (child) => checkNested(child, interactiveAncestors));
  };
  checkNested(sourceFile, []);

  const visit = (node: ts.Node): void => {
    if (ts.isJsxElement(node)) {
      const tag = semanticTag(node.openingElement);
      if (tag === "figure" || tag === "details") {
        const required = tag === "figure" ? "figcaption" : "summary";
        if (!descendantHasTag(node, required)) {
          addViolation(violations, seen, {
            rule: tag === "figure" ? "figure-caption" : "details-summary",
            file,
            line: sourceLine(sourceFile, node.openingElement),
            detail: `<${tag}> requires a <${required}> descendant`,
          });
        }
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(sourceFile);
}

function checkRouteContracts(
  root: string,
  program: ts.Program,
  compilerOptions: ts.CompilerOptions,
  contracts: readonly RouteContract[],
  violations: SemanticViolation[],
  seen: Set<string>,
): void {
  for (const contract of contracts) {
    const entry = resolveEntry(program, root, contract.file);
    if (!entry) {
      addViolation(violations, seen, {
        rule: "route-main-landmark",
        file: normalize(contract.file),
        line: 1,
        detail: `route contract entry not found: ${contract.file}`,
      });
      continue;
    }

    const graph = collectReachable(program, root, compilerOptions, [contract.file]);
    const openings = graph.flatMap(openingNodes);
    const tags = new Set(openings.map(semanticTag).filter((tag): tag is string => Boolean(tag)));
    const label = contract.label ?? contract.file;
    for (const required of contract.requiredLandmarks ?? []) {
      if (tags.has(required)) continue;
      addViolation(violations, seen, {
        rule: required === "main" ? "route-main-landmark" : "showcase-landmark",
        file: relative(root, entry.fileName),
        line: 1,
        detail: `${label} is missing semantic <${required}> in its reachable render graph`,
      });
    }

    const h1Count = openings.filter(isLevelOneHeading).length;
    if (contract.requireLevelOneHeading && h1Count === 0) {
      addViolation(violations, seen, {
        rule: "heading-contract",
        file: relative(root, entry.fileName),
        line: 1,
        detail: `${label} requires a route-level h1 (native h1 or Heading level=\"page\")`,
      });
    }
    if (contract.maxLevelOneHeadings !== undefined && h1Count > contract.maxLevelOneHeadings) {
      addViolation(violations, seen, {
        rule: "heading-contract",
        file: relative(root, entry.fileName),
        line: 1,
        detail: `${label} exposes ${h1Count} level-one headings; maximum is ${contract.maxLevelOneHeadings}`,
      });
    }
  }
}

function checkRouteContractSync(
  root: string,
  contracts: readonly RouteContract[],
  violations: SemanticViolation[],
  seen: Set<string>,
): void {
  const routesFile = path.join(root, "src/app/routes.ts");
  if (!existsSync(routesFile)) return;
  const source = readFileSync(routesFile, "utf8");
  const mountedPages = new Set<string>();
  const pattern = /import\(["']\.\/pages\/([^"']+)["']\)/g;
  for (const match of source.matchAll(pattern)) {
    const page = match[1];
    if (page === "dev" || page === "cms") continue;
    mountedPages.add(`src/app/pages/${page}.tsx`);
  }
  const contractedPages = new Set(contracts.map((contract) => normalize(contract.file)));
  for (const file of mountedPages) {
    if (contractedPages.has(file)) continue;
    addViolation(violations, seen, {
      rule: "route-contract-sync",
      file: "src/app/routes.ts",
      line: 1,
      detail: `mounted user-facing route ${file} has no semantic contract`,
    });
  }
  for (const file of contractedPages) {
    if (mountedPages.has(file)) continue;
    addViolation(violations, seen, {
      rule: "route-contract-sync",
      file: normalize(file),
      line: 1,
      detail: `semantic contract is not mounted by src/app/routes.ts`,
    });
  }
}

export function runSemanticGuard(
  root = process.cwd(),
  options: SemanticGuardOptions = {},
): SemanticGuardResult {
  const absoluteRoot = path.resolve(root);
  const config = loadTsConfig(absoluteRoot);
  const program = ts.createProgram({ rootNames: config.fileNames, options: config.options });
  const entryFiles = options.entryFiles ?? SEMANTIC_ENTRY_FILES;
  const routeContracts = options.routeContracts ?? ROUTE_CONTRACTS;
  const reachable = collectReachable(program, absoluteRoot, config.options, entryFiles);
  const scanned = reachable.filter((sourceFile) => /\.tsx$/.test(sourceFile.fileName));
  const violations: SemanticViolation[] = [];
  const seen = new Set<string>();

  for (const sourceFile of scanned) checkSourceFile(absoluteRoot, sourceFile, violations, seen);
  checkRouteContracts(
    absoluteRoot,
    program,
    config.options,
    routeContracts,
    violations,
    seen,
  );
  checkRouteContractSync(absoluteRoot, routeContracts, violations, seen);

  violations.sort(
    (a, b) =>
      a.file.localeCompare(b.file) ||
      a.line - b.line ||
      a.rule.localeCompare(b.rule) ||
      a.detail.localeCompare(b.detail),
  );
  return {
    violations,
    scannedFileCount: scanned.length,
    reachableFileCount: reachable.length,
    routeCount: routeContracts.length,
  };
}

function main(): void {
  const result = runSemanticGuard();
  if (result.violations.length === 0) {
    console.log(
      `semantic-guard: ${result.scannedFileCount} TSX, ${result.routeCount} route, 0 violazioni.`,
    );
    return;
  }

  console.error(
    `semantic-guard: ${result.violations.length} violazioni in ${result.scannedFileCount} TSX / ${result.routeCount} route:\n`,
  );
  for (const violation of result.violations) {
    console.error(
      `- ${violation.file}:${violation.line} [${violation.rule}] ${violation.detail}`,
    );
  }
  process.exitCode = 1;
}

const invokedPath = process.argv[1] ? pathToFileURL(path.resolve(process.argv[1])).href : "";
if (invokedPath === import.meta.url) main();
