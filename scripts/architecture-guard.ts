import * as path from "node:path";
import { fileURLToPath } from "node:url";
import {
  Node,
  Project,
  SyntaxKind,
  ts,
  type Identifier,
  type SourceFile,
} from "ts-morph";

export type ArchitectureRule =
  | "presentation-import"
  | "presentation-package"
  | "stylesheet-import"
  | "browser-runtime";

export interface ArchitectureViolation {
  rule: ArchitectureRule;
  file: string;
  line: number;
  detail: string;
  chain: string[];
}

export interface ArchitectureGuardResult {
  violations: ArchitectureViolation[];
  coreFileCount: number;
  reachableFileCount: number;
  importEdgeCount: number;
}

/**
 * Domain, data and use cases are the application core boundary. Presentation,
 * framework and browser runtime dependencies must point inward through
 * explicit inputs and ports, never outward from this graph.
 */
const CORE_DIRECTORIES = [
  "src/app/domain/",
  "src/app/data/",
  "src/app/use-cases/",
] as const;

const PRESENTATION_DIRECTORIES = [
  "src/app/components/",
  "src/app/context/",
  "src/app/features/",
  "src/app/hooks/",
  "src/app/pages/",
] as const;

const BROWSER_GLOBALS = new Set([
  "document",
  "window",
  "Blob",
  "FileReader",
  "localStorage",
  "navigator",
  "Notification",
  "sessionStorage",
]);

const OBJECT_URL_METHODS = new Set(["createObjectURL", "revokeObjectURL"]);

function normalize(filePath: string): string {
  return filePath.split(path.sep).join("/");
}

function relative(root: string, filePath: string): string {
  return normalize(path.relative(root, filePath));
}

function isTestModule(file: string): boolean {
  return /\.(?:test|spec)\.[cm]?[jt]sx?$/.test(file);
}

function isCoreFile(root: string, sourceFile: SourceFile): boolean {
  const file = relative(root, sourceFile.getFilePath());
  return (
    CORE_DIRECTORIES.some((directory) => file.startsWith(directory)) &&
    /\.[cm]?[jt]sx?$/.test(file) &&
    !isTestModule(file)
  );
}

function isLocalSource(root: string, sourceFile: SourceFile): boolean {
  const file = relative(root, sourceFile.getFilePath());
  return file.startsWith("src/") && !file.includes("/node_modules/");
}

function presentationDirectory(file: string): string | undefined {
  return PRESENTATION_DIRECTORIES.find((directory) => file.startsWith(directory));
}

function isForbiddenPackage(specifier: string): boolean {
  return (
    specifier === "react" ||
    specifier.startsWith("react/") ||
    specifier === "react-dom" ||
    specifier.startsWith("react-dom/") ||
    specifier === "react-router" ||
    specifier.startsWith("react-router/") ||
    specifier === "react-router-dom" ||
    specifier.startsWith("react-router-dom/") ||
    specifier === "motion" ||
    specifier.startsWith("motion/") ||
    specifier === "framer-motion" ||
    specifier.startsWith("framer-motion/") ||
    specifier === "lucide-react" ||
    specifier.startsWith("lucide-react/") ||
    specifier.startsWith("@radix-ui/")
  );
}

function isStylesheet(specifier: string): boolean {
  return /\.(?:css|scss|sass|less|styl)(?:[?#].*)?$/i.test(specifier);
}

function isDomLibraryDeclaration(filePath: string): boolean {
  const name = path.basename(filePath).toLowerCase();
  return /^lib\.(?:dom|webworker)(?:\.[^.]+)*\.d\.ts$/.test(name);
}

function resolvesToBrowserGlobal(identifier: Identifier): boolean {
  const declarations = identifier.getSymbol()?.getDeclarations() ?? [];
  return declarations.some((declaration) =>
    isDomLibraryDeclaration(declaration.getSourceFile().getFilePath()),
  );
}

function sourceModuleSpecifiers(sourceFile: SourceFile): Array<{
  value: string;
  line: number;
  target?: SourceFile;
}> {
  const specifiers: Array<{ value: string; line: number; target?: SourceFile }> = [];

  for (const declaration of sourceFile.getImportDeclarations()) {
    const literal = declaration.getModuleSpecifier();
    specifiers.push({
      value: literal.getLiteralText(),
      line: literal.getStartLineNumber(),
      target: declaration.getModuleSpecifierSourceFile(),
    });
  }

  for (const declaration of sourceFile.getExportDeclarations()) {
    const literal = declaration.getModuleSpecifier();
    if (!literal) continue;
    specifiers.push({
      value: literal.getLiteralText(),
      line: literal.getStartLineNumber(),
      target: declaration.getModuleSpecifierSourceFile(),
    });
  }

  for (const call of sourceFile.getDescendantsOfKind(SyntaxKind.CallExpression)) {
    const expression = call.getExpression();
    const isDynamicImport = expression.getKind() === SyntaxKind.ImportKeyword;
    const isRequire = Node.isIdentifier(expression) && expression.getText() === "require";
    if (!isDynamicImport && !isRequire) continue;

    const argument = call.getArguments()[0];
    if (!argument || !Node.isStringLiteral(argument)) continue;
    const value = argument.getLiteralText();
    const resolution = ts.resolveModuleName(
      value,
      sourceFile.getFilePath(),
      sourceFile.getProject().getCompilerOptions(),
      ts.sys,
    ).resolvedModule;
    const target = resolution
      ? sourceFile.getProject().getSourceFile(resolution.resolvedFileName)
      : undefined;
    specifiers.push({ value, line: argument.getStartLineNumber(), target });
  }

  return specifiers;
}

function addViolation(
  violations: ArchitectureViolation[],
  seen: Set<string>,
  violation: ArchitectureViolation,
): void {
  const key = `${violation.rule}\0${violation.file}\0${violation.line}\0${violation.detail}`;
  if (seen.has(key)) return;
  seen.add(key);
  violations.push(violation);
}

export function runArchitectureGuard(root = process.cwd()): ArchitectureGuardResult {
  const absoluteRoot = path.resolve(root);
  const project = new Project({ tsConfigFilePath: path.join(absoluteRoot, "tsconfig.json") });
  const coreFiles = project
    .getSourceFiles()
    .filter((sourceFile) => isCoreFile(absoluteRoot, sourceFile));
  const queue = [...coreFiles];
  const chains = new Map<string, string[]>();
  const reachable = new Map<string, SourceFile>();
  const violations: ArchitectureViolation[] = [];
  const seenViolations = new Set<string>();
  let importEdgeCount = 0;

  for (const sourceFile of coreFiles) {
    const file = relative(absoluteRoot, sourceFile.getFilePath());
    chains.set(sourceFile.getFilePath(), [file]);
    reachable.set(sourceFile.getFilePath(), sourceFile);
  }

  while (queue.length > 0) {
    const sourceFile = queue.shift()!;
    const file = relative(absoluteRoot, sourceFile.getFilePath());
    const chain = chains.get(sourceFile.getFilePath()) ?? [file];

    for (const reference of sourceModuleSpecifiers(sourceFile)) {
      importEdgeCount += 1;

      if (isForbiddenPackage(reference.value)) {
        addViolation(violations, seenViolations, {
          rule: "presentation-package",
          file,
          line: reference.line,
          detail: `forbidden package "${reference.value}"`,
          chain,
        });
      }
      if (isStylesheet(reference.value)) {
        addViolation(violations, seenViolations, {
          rule: "stylesheet-import",
          file,
          line: reference.line,
          detail: `stylesheet import "${reference.value}"`,
          chain,
        });
      }

      const target = reference.target;
      if (!target || !isLocalSource(absoluteRoot, target)) continue;
      const targetFile = relative(absoluteRoot, target.getFilePath());
      const nextChain = [...chain, targetFile];
      const forbiddenDirectory = presentationDirectory(targetFile);
      if (forbiddenDirectory) {
        addViolation(violations, seenViolations, {
          rule: "presentation-import",
          file,
          line: reference.line,
          detail: `dependency on ${targetFile} (${forbiddenDirectory.slice(0, -1)})`,
          chain: nextChain,
        });
        continue;
      }

      if (!reachable.has(target.getFilePath())) {
        reachable.set(target.getFilePath(), target);
        chains.set(target.getFilePath(), nextChain);
        queue.push(target);
      }
    }
  }

  for (const sourceFile of reachable.values()) {
    const file = relative(absoluteRoot, sourceFile.getFilePath());
    const chain = chains.get(sourceFile.getFilePath()) ?? [file];

    for (const identifier of sourceFile.getDescendantsOfKind(SyntaxKind.Identifier)) {
      const name = identifier.getText();
      if (!BROWSER_GLOBALS.has(name) || !resolvesToBrowserGlobal(identifier)) continue;
      addViolation(violations, seenViolations, {
        rule: "browser-runtime",
        file,
        line: identifier.getStartLineNumber(),
        detail: `browser global "${name}"`,
        chain,
      });
    }

    for (const access of sourceFile.getDescendantsOfKind(SyntaxKind.PropertyAccessExpression)) {
      if (!OBJECT_URL_METHODS.has(access.getName())) continue;
      const expression = access.getExpression();
      if (!Node.isIdentifier(expression) || expression.getText() !== "URL") continue;
      if (!resolvesToBrowserGlobal(expression)) continue;
      addViolation(violations, seenViolations, {
        rule: "browser-runtime",
        file,
        line: access.getStartLineNumber(),
        detail: `browser API "URL.${access.getName()}"`,
        chain,
      });
    }
  }

  violations.sort((a, b) =>
    a.file.localeCompare(b.file) || a.line - b.line || a.rule.localeCompare(b.rule),
  );

  return {
    violations,
    coreFileCount: coreFiles.length,
    reachableFileCount: reachable.size,
    importEdgeCount,
  };
}

function report(result: ArchitectureGuardResult): void {
  console.log("Architecture boundary — transitive AST/import graph");
  console.log(
    `${result.coreFileCount} domain/data/use-case files; ${result.reachableFileCount} reachable local modules; ${result.importEdgeCount} import/export edges`,
  );

  if (result.violations.length === 0) {
    console.log("✓ domain/data/use cases are independent from presentation and browser runtime");
    return;
  }

  console.error(`✗ ${result.violations.length} architecture violation(s)`);
  for (const violation of result.violations) {
    console.error(`  ${violation.file}:${violation.line} [${violation.rule}] ${violation.detail}`);
    console.error(`    chain: ${violation.chain.join(" -> ")}`);
  }
}

const invokedFile = process.argv[1] ? path.resolve(process.argv[1]) : "";
if (fileURLToPath(import.meta.url) === invokedFile) {
  try {
    const result = runArchitectureGuard();
    report(result);
    if (result.violations.length > 0) process.exitCode = 1;
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  }
}
