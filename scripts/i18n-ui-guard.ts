import { createHash } from "node:crypto";
import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import {
  Node,
  Project,
  ScriptTarget,
  SyntaxKind,
  ts,
  type CallExpression,
  type Expression,
  type SourceFile,
} from "ts-morph";
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const FIX = process.argv.includes("--fix");
const FIX_SKIP = process.argv
  .filter((argument) => argument.startsWith("--skip="))
  .flatMap((argument) => argument.slice("--skip=".length).split(","))
  .map((file) => normalize(file.trim()))
  .filter(Boolean);

export const PRODUCT_ENTRY_FILES = [
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
] as const;

export const SHOWCASE_ENTRY_FILES = ["src/app/pages/design-system.tsx"] as const;

/** File dell'utente: il guard li misura, ma il fixer non li modifica. */
const RESERVED_FILES = new Set([
  "src/app/features/recipe/recipe-output.tsx",
  "src/app/pages/explore.tsx",
  "src/app/pages/home.tsx",
  "src/app/pages/learn.tsx",
  "src/app/pages/recipe.tsx",
]);

const EXCLUDED_PARTS = [
  `${path.sep}features${path.sep}cms${path.sep}`,
  `${path.sep}features${path.sep}dev-tools${path.sep}`,
  `${path.sep}i18n${path.sep}`,
  ".test.",
  ".spec.",
];

const JSX_ATTRIBUTES = new Set([
  "aria-label",
  "aria-description",
  "ariaLabel",
  "ariaDescription",
  "placeholder",
  "title",
  "alt",
  "label",
  "subtitle",
  "description",
  "emptyLabel",
  "emptyMessage",
  "loadingLabel",
  "subLabel",
  "helperText",
  "message",
  "action",
  "body",
  "caption",
  "unit",
  "text",
  "tip",
  "hint",
  "detail",
  "copy",
  "decrementLabel",
  "incrementLabel",
  "cancelLabel",
  "confirmLabel",
  "closeLabel",
  "prop",
  "val",
  "desc",
  "parte",
  "descrizione",
  "quandoUsare",
  "responsive",
  "comportamento",
]);

/** Props whose direct array items are rendered as copy by the DS APIs. */
const JSX_COPY_CONTAINERS = new Set([
  "principi",
  "fai",
  "nonFare",
]);

const DISPLAY_PROPERTIES = new Set([
  "ariaLabel",
  "label",
  "title",
  "subtitle",
  "description",
  "desc",
  "placeholder",
  "emptyLabel",
  "emptyMessage",
  "loadingLabel",
  "helperText",
  "caption",
  "message",
  "msg",
  "action",
  "successMessage",
  "errorMessage",
  "summary",
  "legend",
  "body",
  "unit",
  "text",
  "tip",
  "tips",
  "hint",
  "detail",
  "copy",
  "labelFallback",
  "bestFor",
  "origin",
  "idealStyles",
  "flavor",
  "fermentationType",
  "extensibility",
  "crustResult",
  "consistency",
  "canonical",
  "adapted",
  "sample",
  "prop",
  "val",
  "parte",
  "descrizione",
  "quandoUsare",
  "responsive",
  "comportamento",
  "name",
  "state",
  "target",
]);

const DISPLAY_CONTAINERS = new Set([
  "principi",
  "anatomia",
  "fai",
  "nonFare",
  "items",
  "rows",
  "options",
  "tabs",
  "tips",
]);

const FEEDBACK_CALL = /^(?:toast(?:\.[A-Za-z]+)?|alert|confirm|notify|set[A-Za-z]*(?:Error|Message|Msg|Feedback|Notice|Status|Announcement))$/;

const ENTITY: Record<string, string> = {
  amp: "&", apos: "'", quot: '"', lt: "<", gt: ">", nbsp: "\u00a0",
  agrave: "à", egrave: "è", eacute: "é", igrave: "ì", ograve: "ò", ugrave: "ù",
  ldquo: "“", rdquo: "”", laquo: "«", raquo: "»", middot: "·", times: "×",
  rarr: "→", mdash: "—", ndash: "–", ge: "≥", le: "≤",
};

interface Replacement {
  start: number;
  end: number;
  text: string;
  key: string;
  message: string;
  category: string;
  line: number;
}

export interface I18nViolation {
  key: string;
  message: string;
  file: string;
  line: number;
  category: string;
  scopes: Array<"product" | "showcase">;
  reserved: boolean;
}

export interface I18nGuardResult {
  violations: I18nViolation[];
  productFileCount: number;
  showcaseFileCount: number;
  catalogKeyCount: number;
  productCatalogKeyCount: number;
  showcaseCatalogKeyCount: number;
  missingCatalogKeys: string[];
  orphanCatalogKeys: string[];
}

function normalize(filePath: string): string {
  return filePath.split(path.sep).join("/");
}

function rel(root: string, file: string): string {
  return normalize(path.relative(root, file));
}

function excluded(file: string): boolean {
  return EXCLUDED_PARTS.some((part) => file.includes(part));
}

function isShowcaseFile(root: string, file: string): boolean {
  const relativeFile = rel(root, file);
  return (
    relativeFile.startsWith("src/app/components/design-system/") ||
    relativeFile === "src/app/pages/design-system.tsx"
  );
}

function decodeEntities(value: string): string {
  return value.replace(/&(#x[\da-f]+|#\d+|[a-z]+);/gi, (whole, entity: string) => {
    if (entity.startsWith("#x")) return String.fromCodePoint(Number.parseInt(entity.slice(2), 16));
    if (entity.startsWith("#")) return String.fromCodePoint(Number.parseInt(entity.slice(1), 10));
    return ENTITY[entity.toLowerCase()] ?? whole;
  });
}

/** Same multiline-space normalization React applies to JSXText. */
function normalizeJsxText(raw: string): string {
  const lines = raw.replace(/\r/g, "").split("\n");
  let result = "";
  for (let index = 0; index < lines.length; index += 1) {
    let line = lines[index].replace(/\t/g, " ");
    const isFirst = index === 0;
    const isLast = index === lines.length - 1;
    if (!isFirst) line = line.replace(/^ +/, "");
    if (!isLast) line = line.replace(/ +$/, "");
    if (!line) continue;
    result += line;
    if (!isLast) result += " ";
  }
  return decodeEntities(result);
}

function isTechnicalDisplayValue(value: string): boolean {
  const compact = value.trim();
  return (
    /^(?:\p{Emoji}|\p{Emoji_Component}|\uFE0F|\u200D)+$/u.test(compact) ||
    /^(?:https?:\/\/|mailto:|tel:|\/[^\s]*$)/i.test(compact) ||
    /^(?:\.?--[\w-]+|var\([^)]*\)|#[\da-f]{3,8})$/i.test(compact) ||
    /^\.?[a-z][\w-]*\.(?:ts|tsx|css|svg|png|jpe?g|webp)$/i.test(compact) ||
    /^(?:\d+(?:\.\d+)?\s*)?(?:px|r?em|vh|vw|d?vh|ms|s|g|kg|ml|cm|mm|°c|°f|%)$/i.test(compact) ||
    /^(?:ctrl|shift|alt|option|cmd|command|⌘|tab|enter|esc)(?:\s*\+\s*[a-z0-9]+)*$/i.test(compact) ||
    /^[a-z][a-z0-9]*(?:_[a-z0-9]+)+$/.test(compact) ||
    /^[a-z]+(?:[A-Z][A-Za-z0-9]*)+$/.test(compact) ||
    /^[A-Z0-9_.:+/%°-]{1,12}$/.test(compact)
  );
}

function isHumanCopy(value: string): boolean {
  const compact = value.trim();
  return (
    compact.length > 0 &&
    /\p{L}/u.test(compact) &&
    !isTechnicalDisplayValue(compact)
  );
}

function slug(value: string): string {
  const normalized = value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\{\d+\}/g, " value ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 42);
  return normalized || "copy";
}

function namespaceFor(root: string, file: string): string {
  return rel(path.join(root, "src/app"), file)
    .replace(/\.tsx$/, "")
    .split("/")
    .map((part) => part.replace(/[^A-Za-z0-9]+/g, "-").toLowerCase())
    .join(".");
}

function keyFor(root: string, file: string, message: string): string {
  const hash = createHash("sha1").update(message).digest("hex").slice(0, 8);
  return `${namespaceFor(root, file)}.${slug(message)}-${hash}`;
}

function templateData(expression: Expression): { message: string; values: string[] } | null {
  if (Node.isStringLiteral(expression) || Node.isNoSubstitutionTemplateLiteral(expression)) {
    return { message: decodeEntities(expression.getLiteralValue()), values: [] };
  }
  if (Node.isTemplateExpression(expression)) {
    let message = expression.getHead().getLiteralText();
    const values: string[] = [];
    expression.getTemplateSpans().forEach((span, index) => {
      values.push(span.getExpression().getText());
      message += `{${index}}${span.getLiteral().getLiteralText()}`;
    });
    return { message, values };
  }
  return null;
}

function calleeName(expression: Expression): string {
  if (Node.isIdentifier(expression)) return expression.getText();
  if (Node.isPropertyAccessExpression(expression)) return expression.getText();
  return "";
}

function collectSourceCandidates(root: string, sourceFile: SourceFile): Replacement[] {
  const file = sourceFile.getFilePath();
  const messageFunction = isShowcaseFile(root, file) ? "showcaseMessage" : "uiMessage";
  const found: Replacement[] = [];
  const occupied = new Set<string>();

  const add = (
    node: Node,
    message: string,
    values: string[],
    category: string,
    jsxText = false,
    jsxAttribute = false,
  ): void => {
    if (!isHumanCopy(message)) return;
    const marker = `${node.getStart()}:${node.getEnd()}`;
    if (occupied.has(marker)) return;
    occupied.add(marker);
    const key = keyFor(root, file, message);
    const args = values.length ? `, [${values.join(", ")}]` : "";
    found.push({
      start: node.getStart(),
      end: node.getEnd(),
      text: jsxText
        ? `{${messageFunction}(${JSON.stringify(key)}${args})}`
        : jsxAttribute
          ? `{${messageFunction}(${JSON.stringify(key)}${args})}`
          : `${messageFunction}(${JSON.stringify(key)}${args})`,
      key,
      message,
      category,
      line: node.getStartLineNumber(),
    });
  };

  const addExpression = (expression: Expression, category: string, jsxAttribute = false): void => {
    const data = templateData(expression);
    if (data) add(expression, data.message, data.values, category, false, jsxAttribute);
  };

  const addOutputExpression = (expression: Expression, category: string): void => {
    const data = templateData(expression);
    if (data) {
      add(expression, data.message, data.values, category);
      return;
    }
    if (Node.isParenthesizedExpression(expression)) {
      addOutputExpression(expression.getExpression(), category);
    } else if (Node.isConditionalExpression(expression)) {
      addOutputExpression(expression.getWhenTrue(), category);
      addOutputExpression(expression.getWhenFalse(), category);
    } else if (Node.isBinaryExpression(expression)) {
      const operator = expression.getOperatorToken().getKind();
      if (
        operator === SyntaxKind.AmpersandAmpersandToken ||
        operator === SyntaxKind.QuestionQuestionToken ||
        operator === SyntaxKind.BarBarToken
      ) {
        addOutputExpression(expression.getRight(), category);
      }
    }
  };

  const addArrayCopy = (node: Node, category: string): void => {
    for (const array of [node, ...node.getDescendants()].filter(Node.isArrayLiteralExpression)) {
      for (const element of array.getElements()) {
        if (Node.isExpression(element)) addExpression(element, category);
      }
    }
  };

  /* Copy can be hidden behind a local formatter used by title/aria/text. Follow
     those local calls far enough to inspect returned literals and string maps;
     this catches helpers such as acronym tooltip dictionaries without treating
     every generic Record<string, string> in the module as presentation copy. */
  const visitedHelpers = new Set<Node>();
  const addCalledHelperCopy = (expression: Expression): void => {
    const outputCalls = (candidate: Expression): CallExpression[] => {
      if (Node.isCallExpression(candidate)) return [candidate];
      if (
        Node.isParenthesizedExpression(candidate) ||
        Node.isAsExpression(candidate) ||
        Node.isTypeAssertion(candidate) ||
        Node.isNonNullExpression(candidate)
      ) {
        return outputCalls(candidate.getExpression());
      }
      if (Node.isConditionalExpression(candidate)) {
        return [
          ...outputCalls(candidate.getWhenTrue()),
          ...outputCalls(candidate.getWhenFalse()),
        ];
      }
      if (Node.isBinaryExpression(candidate)) {
        return [
          ...outputCalls(candidate.getLeft()),
          ...outputCalls(candidate.getRight()),
        ];
      }
      return [];
    };
    const calls = outputCalls(expression);
    for (const call of calls) {
      const name = calleeName(call.getExpression());
      if (name === "uiMessage" || name === "showcaseMessage") continue;
      const declarations = call.getExpression().getSymbol()?.getDeclarations() ?? [];
      for (const declaration of declarations) {
        if (declaration.getSourceFile() !== sourceFile) continue;
        let helper: Node | undefined = declaration;
        if (Node.isVariableDeclaration(declaration)) helper = declaration.getInitializer();
        if (
          !helper ||
          (!Node.isFunctionDeclaration(helper) &&
            !Node.isFunctionExpression(helper) &&
            !Node.isArrowFunction(helper) &&
            !Node.isMethodDeclaration(helper)) ||
          visitedHelpers.has(helper)
        ) {
          continue;
        }
        visitedHelpers.add(helper);
        const helperCategory = `helper-output:${name || "anonymous"}`;
        for (const property of helper.getDescendantsOfKind(SyntaxKind.PropertyAssignment)) {
          addExpression(property.getInitializer(), helperCategory);
        }
        for (const returned of helper.getDescendantsOfKind(SyntaxKind.ReturnStatement)) {
          const returnedExpression = returned.getExpression();
          if (returnedExpression) {
            addOutputExpression(returnedExpression, helperCategory);
            addCalledHelperCopy(returnedExpression);
          }
        }
      }
    }
  };

  for (const node of sourceFile.getDescendantsOfKind(SyntaxKind.JsxText)) {
    const message = normalizeJsxText(node.getText());
    add(node, message, [], "jsx-text", true);
  }

  for (const jsxExpression of sourceFile.getDescendantsOfKind(SyntaxKind.JsxExpression)) {
    if (Node.isJsxAttribute(jsxExpression.getParent())) continue;
    const expression = jsxExpression.getExpression();
    if (expression) {
      addOutputExpression(expression, "jsx-expression");
      addCalledHelperCopy(expression);
    }
  }

  for (const attribute of sourceFile.getDescendantsOfKind(SyntaxKind.JsxAttribute)) {
    const name = attribute.getNameNode().getText();
    const initializer = attribute.getInitializer();
    if (!initializer) continue;

    if (JSX_ATTRIBUTES.has(name)) {
      if (Node.isStringLiteral(initializer)) {
        add(
          initializer,
          decodeEntities(initializer.getLiteralValue()),
          [],
          `jsx-attribute:${name}`,
          false,
          true,
        );
      } else if (Node.isJsxExpression(initializer)) {
        const expression = initializer.getExpression();
        if (expression) {
          addOutputExpression(expression, `jsx-attribute:${name}`);
          addCalledHelperCopy(expression);
        }
      }
    }

    if (JSX_COPY_CONTAINERS.has(name)) addArrayCopy(initializer, `jsx-container:${name}`);
  }

  for (const property of sourceFile.getDescendantsOfKind(SyntaxKind.PropertyAssignment)) {
    const propertyName = property.getName().replace(/^["']|["']$/g, "");
    if (DISPLAY_PROPERTIES.has(propertyName)) {
      addExpression(property.getInitializer(), `display-property:${propertyName}`);
    }
    if (DISPLAY_CONTAINERS.has(propertyName)) {
      addArrayCopy(property.getInitializer(), `display-container:${propertyName}`);
    }
  }

  for (const call of sourceFile.getDescendantsOfKind(SyntaxKind.CallExpression)) {
    if (!FEEDBACK_CALL.test(calleeName(call.getExpression()))) continue;
    const first = call.getArguments()[0];
    if (first && Node.isExpression(first)) addOutputExpression(first, `feedback:${calleeName(call.getExpression())}`);
  }

  return found;
}

function sourceModuleTargets(sourceFile: SourceFile): SourceFile[] {
  const targets = new Set<SourceFile>();
  for (const declaration of sourceFile.getImportDeclarations()) {
    const target = declaration.getModuleSpecifierSourceFile();
    if (target) targets.add(target);
  }
  for (const declaration of sourceFile.getExportDeclarations()) {
    const target = declaration.getModuleSpecifierSourceFile();
    if (target) targets.add(target);
  }
  for (const call of sourceFile.getDescendantsOfKind(SyntaxKind.CallExpression)) {
    if (call.getExpression().getKind() !== SyntaxKind.ImportKeyword) continue;
    const argument = call.getArguments()[0];
    if (!argument || !Node.isStringLiteral(argument)) continue;
    const resolution = ts.resolveModuleName(
      argument.getLiteralValue(),
      sourceFile.getFilePath(),
      sourceFile.getProject().getCompilerOptions(),
      ts.sys,
    ).resolvedModule;
    if (!resolution) continue;
    const target = sourceFile.getProject().getSourceFile(resolution.resolvedFileName);
    if (target) targets.add(target);
  }
  return [...targets];
}

function collectMountedFiles(
  root: string,
  project: Project,
  entries: readonly string[],
): SourceFile[] {
  const seen = new Map<string, SourceFile>();
  const queue = entries
    .map((entry) => project.getSourceFile(path.join(root, entry)))
    .filter((source): source is SourceFile => Boolean(source));

  while (queue.length) {
    const source = queue.shift()!;
    const file = source.getFilePath();
    if (seen.has(file) || excluded(file)) continue;
    seen.set(file, source);
    for (const target of sourceModuleTargets(source)) {
      const targetFile = target.getFilePath();
      if (
        rel(root, targetFile).startsWith("src/app/") &&
        !seen.has(targetFile) &&
        !excluded(targetFile)
      ) {
        queue.push(target);
      }
    }
  }
  return [...seen.values()]
    .filter((source) => {
      const file = rel(root, source.getFilePath());
      if (file.endsWith(".tsx")) return true;
      if (!file.endsWith(".ts")) return false;
      if (file.startsWith("src/app/features/cms/") || file.startsWith("src/app/features/dev-tools/")) {
        return false;
      }
      return [
        "src/app/components/",
        "src/app/features/",
        "src/app/hooks/",
        "src/app/use-cases/",
      ].some((prefix) => file.startsWith(prefix));
    })
    .sort((a, b) => a.getFilePath().localeCompare(b.getFilePath()));
}

function referencedCatalogKeys(sourceFile: SourceFile): Array<{
  catalog: "product" | "showcase";
  key: string;
}> {
  const keys: Array<{ catalog: "product" | "showcase"; key: string }> = [];
  const literalKeys = (expression: Expression, visited = new Set<Node>()): string[] => {
    if (visited.has(expression)) return [];
    visited.add(expression);
    if (Node.isStringLiteral(expression)) return [expression.getLiteralValue()];
    if (Node.isArrayLiteralExpression(expression)) {
      return expression
        .getElements()
        .flatMap((element) => (Node.isExpression(element) ? literalKeys(element, visited) : []));
    }
    if (
      Node.isParenthesizedExpression(expression) ||
      Node.isAsExpression(expression) ||
      Node.isTypeAssertion(expression) ||
      Node.isNonNullExpression(expression)
    ) {
      return literalKeys(expression.getExpression(), visited);
    }
    if (!Node.isIdentifier(expression)) return [];
    const declarations = expression.getSymbol()?.getDeclarations() ?? [];
    return declarations.flatMap((declaration) => {
      if (Node.isVariableDeclaration(declaration)) {
        const initializer = declaration.getInitializer();
        return initializer && Node.isExpression(initializer)
          ? literalKeys(initializer, visited)
          : [];
      }
      /* `KEYS.map((key) => uiMessage(key))`: risali dal parametro alla
         collezione enumerata, così tutte le chiavi restano verificabili. */
      if (Node.isParameterDeclaration(declaration)) {
        const functionLike = declaration.getParent();
        const mapCall = functionLike.getParent();
        if (!Node.isCallExpression(mapCall)) return [];
        const callee = mapCall.getExpression();
        if (!Node.isPropertyAccessExpression(callee) || callee.getName() !== "map") return [];
        return literalKeys(callee.getExpression(), visited);
      }
      return [];
    });
  };
  for (const call of sourceFile.getDescendantsOfKind(SyntaxKind.CallExpression)) {
    const expression = call.getExpression();
    if (!Node.isIdentifier(expression)) continue;
    const functionName = expression.getText();
    if (functionName !== "uiMessage" && functionName !== "showcaseMessage") continue;
    const first = call.getArguments()[0];
    if (first && Node.isExpression(first)) {
      for (const key of literalKeys(first)) {
      keys.push({
        catalog: functionName === "showcaseMessage" ? "showcase" : "product",
          key,
      });
      }
    }
  }
  return keys;
}

export function runI18nGuard(
  root = process.cwd(),
  productEntries: readonly string[] = PRODUCT_ENTRY_FILES,
  showcaseEntries: readonly string[] = SHOWCASE_ENTRY_FILES,
): I18nGuardResult {
  const absoluteRoot = path.resolve(root);
  const project = new Project({
    tsConfigFilePath: path.join(absoluteRoot, "tsconfig.json"),
    compilerOptions: { target: ScriptTarget.ES2022 },
  });
  const productFiles = collectMountedFiles(absoluteRoot, project, productEntries);
  const showcaseFiles = collectMountedFiles(absoluteRoot, project, showcaseEntries);
  const scopes = new Map<string, Set<"product" | "showcase">>();
  for (const source of productFiles) scopes.set(source.getFilePath(), new Set(["product"]));
  for (const source of showcaseFiles) {
    const current = scopes.get(source.getFilePath()) ?? new Set<"product" | "showcase">();
    current.add("showcase");
    scopes.set(source.getFilePath(), current);
  }

  const violations: I18nViolation[] = [];
  const productReferenced = new Set<string>();
  const showcaseReferenced = new Set<string>();
  for (const [file, fileScopes] of scopes) {
    const source = project.getSourceFile(file)!;
    for (const candidate of collectSourceCandidates(absoluteRoot, source)) {
      const relativeFile = rel(absoluteRoot, file);
      violations.push({
        key: candidate.key,
        message: candidate.message,
        file: relativeFile,
        line: candidate.line,
        category: candidate.category,
        scopes: [...fileScopes].sort(),
        reserved: RESERVED_FILES.has(relativeFile),
      });
    }
    for (const reference of referencedCatalogKeys(source)) {
      (reference.catalog === "showcase" ? showcaseReferenced : productReferenced).add(reference.key);
    }
  }

  violations.sort((a, b) => a.file.localeCompare(b.file) || a.line - b.line);
  /* Read from disk so `--fix` validates the catalog it has just generated,
     instead of the module instance cached at process start. */
  const productCatalog = loadFixtureCatalog(absoluteRoot, "ui-messages.it.ts");
  const showcaseCatalog = loadFixtureCatalog(absoluteRoot, "showcase-messages.it.ts");
  const missingCatalogKeys = [
    ...[...productReferenced]
      .filter((key) => productCatalog[key] === undefined)
      .map((key) => `product:${key}`),
    ...[...showcaseReferenced]
      .filter((key) => showcaseCatalog[key] === undefined)
      .map((key) => `showcase:${key}`),
  ].sort();
  const orphanCatalogKeys = [
    ...Object.keys(productCatalog)
      .filter((key) => !productReferenced.has(key))
      .map((key) => `product:${key}`),
    ...Object.keys(showcaseCatalog)
      .filter((key) => !showcaseReferenced.has(key))
      .map((key) => `showcase:${key}`),
  ].sort();

  return {
    violations,
    productFileCount: productFiles.length,
    showcaseFileCount: showcaseFiles.length,
    catalogKeyCount: Object.keys(productCatalog).length + Object.keys(showcaseCatalog).length,
    productCatalogKeyCount: Object.keys(productCatalog).length,
    showcaseCatalogKeyCount: Object.keys(showcaseCatalog).length,
    missingCatalogKeys,
    orphanCatalogKeys,
  };
}

function loadFixtureCatalog(root: string, name: string): Record<string, string> {
  const file = path.join(root, "src/app/i18n", name);
  if (!fs.existsSync(file)) return {};
  const text = fs.readFileSync(file, "utf8");
  const match = text.match(/=\s*(\{[\s\S]*\})\s*;?\s*$/);
  if (!match) return {};
  try {
    return JSON.parse(match[1]) as Record<string, string>;
  } catch {
    return {};
  }
}

function importInsertion(root: string, sourceFile: SourceFile): { start: number; text: string } | null {
  const showcase = isShowcaseFile(root, sourceFile.getFilePath());
  const functionName = showcase ? "showcaseMessage" : "uiMessage";
  if (new RegExp(`\\b${functionName}\\b`).test(sourceFile.getText())) return null;
  const target = path.join(
    root,
    showcase ? "src/app/i18n/showcase-messages" : "src/app/i18n/ui-messages",
  );
  let specifier = normalize(path.relative(path.dirname(sourceFile.getFilePath()), target));
  if (!specifier.startsWith(".")) specifier = `./${specifier}`;
  const imports = sourceFile.getImportDeclarations();
  if (imports.length === 0) {
    return { start: 0, text: `import { ${functionName} } from ${JSON.stringify(specifier)};\n` };
  }
  const last = imports[imports.length - 1];
  return {
    start: last.getEnd(),
    text: `\nimport { ${functionName} } from ${JSON.stringify(specifier)};`,
  };
}

function writeCatalog(
  messages: Record<string, string>,
  file: string,
  exportName: string,
  description: string,
): void {
  const ordered = Object.fromEntries(Object.entries(messages).sort(([a], [b]) => a.localeCompare(b)));
  fs.writeFileSync(
    file,
    [
      "/**",
      ` * ${description}`,
      " * Le chiavi sono stabili: namespace + slug + hash del messaggio.",
      " */",
      `export const ${exportName}: Record<string, string> = ${JSON.stringify(ordered, null, 2)};`,
      "",
    ].join("\n"),
  );
}

export interface I18nFixResult {
  replacementCount: number;
  fileCount: number;
}

export function fixMountedCopy(
  root = ROOT,
  productEntries: readonly string[] = PRODUCT_ENTRY_FILES,
  showcaseEntries: readonly string[] = SHOWCASE_ENTRY_FILES,
  fixSkip: readonly string[] = FIX_SKIP,
): I18nFixResult {
  const absoluteRoot = path.resolve(root);
  const project = new Project({ tsConfigFilePath: path.join(absoluteRoot, "tsconfig.json") });
  const files = new Map<string, SourceFile>();
  for (const source of [
    ...collectMountedFiles(absoluteRoot, project, productEntries),
    ...collectMountedFiles(absoluteRoot, project, showcaseEntries),
  ]) {
    files.set(source.getFilePath(), source);
  }

  const messages = loadFixtureCatalog(absoluteRoot, "ui-messages.it.ts");
  const showcaseMessages = loadFixtureCatalog(absoluteRoot, "showcase-messages.it.ts");
  let replacementCount = 0;
  let fileCount = 0;
  for (const source of files.values()) {
    const relativeFile = rel(absoluteRoot, source.getFilePath());
    if (
      RESERVED_FILES.has(relativeFile) ||
      fixSkip.some((skip) => relativeFile === skip || relativeFile.startsWith(`${skip}/`))
    ) {
      continue;
    }
    const replacements = collectSourceCandidates(absoluteRoot, source);
    if (replacements.length === 0) continue;
    const insertion = importInsertion(absoluteRoot, source);
    const edits = insertion ? [...replacements, { ...insertion, end: insertion.start }] : replacements;
    let text = source.getFullText();
    for (const edit of edits.sort((a, b) => b.start - a.start)) {
      text = `${text.slice(0, edit.start)}${edit.text}${text.slice(edit.end)}`;
    }
    const targetMessages = isShowcaseFile(absoluteRoot, source.getFilePath())
      ? showcaseMessages
      : messages;
    for (const replacement of replacements) {
      targetMessages[replacement.key] = replacement.message;
    }
    fs.writeFileSync(source.getFilePath(), text);
    replacementCount += replacements.length;
    fileCount += 1;
  }
  /* Ricostruisci i set di chiavi dopo la riscrittura e pota le entry che non
     hanno più consumer. In questo modo il fixer è anche un ratchet sugli
     orfani, non solo un migratore additivo. */
  const updatedProject = new Project({
    tsConfigFilePath: path.join(absoluteRoot, "tsconfig.json"),
  });
  const productReferenced = new Set<string>();
  const showcaseReferenced = new Set<string>();
  const updatedFiles = new Map<string, SourceFile>();
  for (const source of [
    ...collectMountedFiles(absoluteRoot, updatedProject, productEntries),
    ...collectMountedFiles(absoluteRoot, updatedProject, showcaseEntries),
  ]) {
    updatedFiles.set(source.getFilePath(), source);
  }
  for (const source of updatedFiles.values()) {
    for (const reference of referencedCatalogKeys(source)) {
      (reference.catalog === "showcase" ? showcaseReferenced : productReferenced).add(
        reference.key,
      );
    }
  }
  const liveMessages = Object.fromEntries(
    [...productReferenced]
      .filter((key) => messages[key] !== undefined)
      .map((key) => [key, messages[key]]),
  );
  const liveShowcaseMessages = Object.fromEntries(
    [...showcaseReferenced]
      .filter((key) => showcaseMessages[key] !== undefined)
      .map((key) => [key, showcaseMessages[key]]),
  );

  writeCatalog(
    liveMessages,
    path.join(absoluteRoot, "src/app/i18n/ui-messages.it.ts"),
    "UI_MESSAGES_IT",
    "Catalogo UI italiano delle route prodotto, generato dal guard i18n.",
  );
  writeCatalog(
    liveShowcaseMessages,
    path.join(absoluteRoot, "src/app/i18n/showcase-messages.it.ts"),
    "SHOWCASE_MESSAGES_IT",
    "Catalogo italiano dello showcase, separato dal bundle prodotto.",
  );
  console.log(`i18n fixer: ${replacementCount} stringhe migrate in ${fileCount} file`);
  return { replacementCount, fileCount };
}

function report(result: I18nGuardResult): void {
  console.log("i18n UI guard — mounted product + design-system graph");
  console.log(
    `${result.productFileCount} file prodotto; ${result.showcaseFileCount} file showcase; ` +
      `${result.productCatalogKeyCount} chiavi prodotto + ${result.showcaseCatalogKeyCount} showcase ` +
      `(${result.catalogKeyCount} totali)`,
  );
  if (result.missingCatalogKeys.length) {
    console.error(`✗ ${result.missingCatalogKeys.length} chiavi referenziate ma assenti dal catalogo:`);
    for (const key of result.missingCatalogKeys) console.error(`  ${key}`);
  }
  if (result.orphanCatalogKeys.length) {
    console.error(`✗ ${result.orphanCatalogKeys.length} chiavi catalogo non referenziate:`);
    for (const key of result.orphanCatalogKeys) console.error(`  ${key}`);
  }
  if (result.violations.length) {
    const reserved = result.violations.filter((violation) => violation.reserved).length;
    console.error(
      `✗ ${result.violations.length} stringhe user-facing hard-written (${reserved} in file riservati)`,
    );
    for (const violation of result.violations) {
      console.error(
        `  ${violation.file}:${violation.line} [${violation.category}] ${JSON.stringify(violation.message.trim())}${violation.reserved ? " [reserved]" : ""}`,
      );
    }
  }
  if (
    result.violations.length === 0 &&
    result.missingCatalogKeys.length === 0 &&
    result.orphanCatalogKeys.length === 0
  ) {
    console.log("✓ tutto il copy montato passa dal catalogo i18n");
  }
}

const invokedFile = process.argv[1] ? path.resolve(process.argv[1]) : "";
if (fileURLToPath(import.meta.url) === invokedFile) {
  try {
    if (FIX) fixMountedCopy(ROOT);
    const result = runI18nGuard(ROOT);
    report(result);
    if (
      result.violations.length ||
      result.missingCatalogKeys.length ||
      result.orphanCatalogKeys.length
    ) {
      process.exitCode = 1;
    }
  } catch (error) {
    console.error(error instanceof Error ? error.stack ?? error.message : error);
    process.exitCode = 1;
  }
}
