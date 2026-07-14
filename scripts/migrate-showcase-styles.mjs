#!/usr/bin/env node
/**
 * Mechanical, repeatable JSX-style -> showcase CSS migration.
 *
 * Static declarations become deduplicated composite classes. Runtime values
 * cross the presentation boundary only through CSS custom properties. The
 * generated file is deterministic: rerunning this script after a showcase
 * edit produces the same class for the same declaration set.
 */
import { createHash } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { Project, SyntaxKind } from "ts-morph";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, "..");
const GENERATED_CSS = resolve(ROOT, "src/app/components/design-system/showcase.generated.css");
const TARGETS = [
  "src/app/components/design-system/**/*.tsx",
  "src/app/pages/design-system.tsx",
];

const UNITLESS = new Set([
  "animationIterationCount", "aspectRatio", "borderImageOutset",
  "borderImageSlice", "borderImageWidth", "columnCount", "columns", "fillOpacity",
  "flex", "flexGrow", "flexShrink", "floodOpacity", "fontWeight", "gridArea",
  "gridColumn", "gridColumnEnd", "gridColumnStart", "gridRow", "gridRowEnd",
  "gridRowStart", "lineClamp", "lineHeight", "opacity", "order", "orphans",
  "scale", "stopOpacity", "strokeDasharray", "strokeDashoffset", "strokeMiterlimit",
  "strokeOpacity", "strokeWidth", "tabSize", "widows", "zIndex", "zoom",
]);

function unwrap(node) {
  let current = node;
  while (current && [
    SyntaxKind.AsExpression,
    SyntaxKind.ParenthesizedExpression,
    SyntaxKind.SatisfiesExpression,
  ].includes(current.getKind())) current = current.getExpression();
  return current;
}

function cssProperty(name) {
  const dashed = name.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
  if (dashed.startsWith("webkit-")) return `-${dashed}`;
  if (dashed.startsWith("ms-")) return `-${dashed}`;
  return dashed;
}

function staticCssValue(property, node) {
  const value = unwrap(node);
  if (!value) return null;
  if ([SyntaxKind.StringLiteral, SyntaxKind.NoSubstitutionTemplateLiteral].includes(value.getKind())) {
    return value.getLiteralValue();
  }
  if (value.getKind() === SyntaxKind.NumericLiteral) {
    const raw = value.getText();
    return UNITLESS.has(property) || Number(raw) === 0 ? raw : `${raw}px`;
  }
  if (
    value.getKind() === SyntaxKind.PrefixUnaryExpression &&
    value.getOperand().getKind() === SyntaxKind.NumericLiteral
  ) {
    const raw = value.getText();
    return UNITLESS.has(property) || Number(raw) === 0 ? raw : `${raw}px`;
  }
  return null;
}

function propertyName(property) {
  if (property.getKind() === SyntaxKind.ShorthandPropertyAssignment) return property.getName();
  const node = property.getNameNode();
  return node.getLiteralValue?.() ?? node.getText();
}

function propertyInitializer(property) {
  return property.getKind() === SyntaxKind.ShorthandPropertyAssignment
    ? property.getNameNode()
    : property.getInitializer();
}

function addClassName(tag, className) {
  const attribute = tag.getAttributes().find(
    (item) => item.getKind() === SyntaxKind.JsxAttribute && item.getNameNode().getText() === "className",
  );
  if (!attribute) {
    tag.addAttribute({ name: "className", initializer: `"${className}"` });
    return;
  }
  const initializer = attribute.getInitializer();
  if (initializer?.getKind() === SyntaxKind.StringLiteral) {
    initializer.setLiteralValue(`${initializer.getLiteralValue()} ${className}`);
    return;
  }
  const expression = initializer?.asKind(SyntaxKind.JsxExpression)?.getExpression();
  if (!expression) throw new Error(`Unsupported className at ${attribute.getSourceFile().getFilePath()}:${attribute.getStartLineNumber()}`);
  attribute.setInitializer(`{[${expression.getText()}, "${className}"].filter(Boolean).join(" ")}`);
}

function helperImportPath(sourceFile) {
  const helper = resolve(ROOT, "src/app/components/design-system/showcase-style");
  const specifier = relative(dirname(sourceFile.getFilePath()), helper).replaceAll("\\", "/");
  return specifier.startsWith(".") ? specifier : `./${specifier}`;
}

const project = new Project({
  tsConfigFilePath: resolve(ROOT, "tsconfig.json"),
  skipAddingFilesFromTsConfig: true,
});
project.addSourceFilesAtPaths(TARGETS.map((glob) => resolve(ROOT, glob)));

const rules = new Map();
const skipped = [];
let migrated = 0;
let bridges = 0;

for (const sourceFile of project.getSourceFiles()) {
  let needsHelper = false;
  const attributes = sourceFile
    .getDescendantsOfKind(SyntaxKind.JsxAttribute)
    .filter((attribute) => attribute.getNameNode().getText() === "style")
    .sort((a, b) => b.getStart() - a.getStart());

  for (const attribute of attributes) {
    let expression = attribute.getInitializer()?.asKind(SyntaxKind.JsxExpression)?.getExpression();
    expression = unwrap(expression);
    if (expression?.getKind() !== SyntaxKind.ObjectLiteralExpression) {
      skipped.push(`${relative(ROOT, sourceFile.getFilePath())}:${attribute.getStartLineNumber()} non-object style`);
      continue;
    }
    const properties = expression.getProperties();
    const names = properties
      .filter((property) => [SyntaxKind.PropertyAssignment, SyntaxKind.ShorthandPropertyAssignment].includes(property.getKind()))
      .map(propertyName);
    if (names.length === properties.length && names.every((name) => name.startsWith("--"))) {
      // Already migrated: an explicitly authorised dynamic custom-property bridge.
      continue;
    }
    if (properties.some((property) => property.getKind() === SyntaxKind.SpreadAssignment)) {
      skipped.push(`${relative(ROOT, sourceFile.getFilePath())}:${attribute.getStartLineNumber()} spread style`);
      continue;
    }
    if (properties.some((property) => ![
      SyntaxKind.PropertyAssignment,
      SyntaxKind.ShorthandPropertyAssignment,
    ].includes(property.getKind()))) {
      skipped.push(`${relative(ROOT, sourceFile.getFilePath())}:${attribute.getStartLineNumber()} unsupported property`);
      continue;
    }

    const declarations = [];
    const dynamic = [];
    for (const property of properties) {
      const name = propertyName(property);
      const initializer = propertyInitializer(property);
      const value = staticCssValue(name, initializer);
      if (value != null) {
        declarations.push({ name, cssName: cssProperty(name), value });
      } else {
        const variable = `--dsx-${cssProperty(name).replace(/^-/, "")}`;
        declarations.push({ name, cssName: cssProperty(name), value: `var(${variable})` });
        dynamic.push({ name, variable, expression: initializer.getText() });
      }
    }

    const signature = declarations.map(({ cssName, value }) => `${cssName}:${value}`).join(";");
    const hash = createHash("sha256").update(signature).digest("hex").slice(0, 10);
    const className = `dsx-s-${hash}`;
    const source = `${relative(ROOT, sourceFile.getFilePath())}:${attribute.getStartLineNumber()}`;
    const known = rules.get(className);
    if (known && known.signature !== signature) throw new Error(`Hash collision: ${className}`);
    if (known) known.sources.add(source);
    else rules.set(className, { signature, declarations, sources: new Set([source]) });

    const tag = attribute.getParent().getParent();
    addClassName(tag, className);
    if (dynamic.length === 0) {
      attribute.remove();
    } else {
      needsHelper = true;
      bridges += 1;
      attribute.setInitializer(`{{ ${dynamic.map(({ name, variable, expression }) =>
        `"${variable}": toShowcaseCssValue(${expression}, ${UNITLESS.has(name)})`
      ).join(", ")} } as any}`);
    }
    migrated += 1;
  }

  if (needsHelper && !sourceFile.getImportDeclaration(helperImportPath(sourceFile))) {
    sourceFile.addImportDeclaration({
      moduleSpecifier: helperImportPath(sourceFile),
      namedImports: ["toShowcaseCssValue"],
    });
  }
}

await project.save();

const generatedBlocks = [...rules.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([className, rule]) => ({
  className,
  css: [
    `  /* ${[...rule.sources].sort().join(", ")} */`,
    `  .${className} {`,
    ...rule.declarations.map(({ cssName, value }) => `    ${cssName}: ${value};`),
    "  }",
  ].join("\n"),
}));
if (!existsSync(GENERATED_CSS)) {
  writeFileSync(GENERATED_CSS, [
    "/* AUTO-GENERATED by scripts/migrate-showcase-styles.mjs. Do not edit. */",
    "/* Static showcase presentation lives here; JSX may only hand off dynamic custom properties. */",
    "@layer components {",
    ...generatedBlocks.map((block) => block.css),
    "}",
    "",
  ].join("\n"));
} else if (generatedBlocks.length > 0) {
  const existing = readFileSync(GENERATED_CSS, "utf8");
  const novel = generatedBlocks.filter(({ className }) => !existing.includes(`.${className} {`));
  // New source styles are appended inside the same layer. Existing generated
  // rules remain byte-stable, making repeated runs safe during parallel work.
  if (novel.length > 0) {
    writeFileSync(GENERATED_CSS, existing.replace(/\n}\s*$/, `\n${novel.map((block) => block.css).join("\n")}\n}\n`));
  }
}

// The generated artifact is a closed projection of the current showcase.
// Pruning makes deletion deterministic too: dead source files cannot leave
// behind unaudited CSS that happens to retain a valid content hash.
const referencedClasses = new Set(
  project.getSourceFiles().flatMap((sourceFile) =>
    [...sourceFile.getFullText().matchAll(/\bdsx-s-[a-f0-9]{10}\b/g)].map((match) => match[0]),
  ),
);
const generated = readFileSync(GENERATED_CSS, "utf8");
const pruned = generated.replace(
  /(?:\n\s*\/\*[^\n]*\*\/)?\n\s*\.(dsx-s-[a-f0-9]{10})\s*\{[\s\S]*?\n\s*\}/g,
  (block, className) => referencedClasses.has(className) ? block : "",
);
if (pruned !== generated) writeFileSync(GENERATED_CSS, pruned);

console.log(JSON.stringify({ migrated, bridges, rules: rules.size, skipped }, null, 2));
if (skipped.length > 0) process.exitCode = 2;
