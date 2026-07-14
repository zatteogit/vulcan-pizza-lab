#!/usr/bin/env node
/**
 * Vulcan Design-System tier guard.
 *
 * The default mode is strict and exits non-zero when a hard finding exists.
 * `--report` prints the same measurable inventory without failing; it is meant
 * for migration work, never as a permanent quality-gate bypass.
 *
 * Scope is intentionally graph-based: product routes plus /design-system.
 * Dev tools and CMS/admin are not roots, but shared modules imported by a
 * product or showcase root remain in scope.
 */

import { existsSync, readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { dirname, extname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const HERE = dirname(fileURLToPath(import.meta.url));
export const REPO_ROOT = resolve(HERE, "..");
const APP_ROOT = join(REPO_ROOT, "src/app");

export const TIER_TAXONOMY = Object.freeze({
  T1: "primitive/global tokens — the only tier allowed to own raw visual values",
  T2: "semantic tokens — roles composed from T1/T2",
  T2_5: "domain semantic palettes — specialised T2 roles",
  T3: "component tokens/composites — component roles composed from T2/T3",
  T4: "context-free components — src/app/components/ds",
  T5: "domain patterns/composites — shared UI and user-facing features",
  T6: "page templates/routes — page skeletons and named templates",
});

const PRODUCT_ENTRY_FILES = [
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
];

const SHOWCASE_ENTRY_FILES = ["src/app/pages/design-system.tsx"];
const NAMED_TEMPLATE_FILES = new Set([
  "src/app/features/recipe/recipe-view.tsx",
]);

/** Runtime mirrors are the only TS modules allowed to own motion literals. */
const MOTION_PRESET_FILES = new Set([
  "src/app/components/ds/motion.ts",
  "src/app/components/design-system/showcase-motion.ts",
  "src/app/components/design-system/showcase-motion.generated.ts",
]);

/**
 * Exception policy is deliberately code-reviewed and empty by default.
 * Keys must be repo-relative files; values are human reasons, not tickets.
 */
export const EXCEPTIONS = Object.freeze({
  inlineStyle: Object.freeze({}),
  rawControl: Object.freeze({}),
  tokenBoundary: Object.freeze({}),
  motionLiteral: Object.freeze({}),
});

const SIMPLE_RAW_VALUE = /^(?:#[0-9a-fA-F]{3,8}\b|(?:rgb|rgba|hsl|hsla|oklch)\([^)]*\)|-?\d+(?:\.\d+)?(?:px|rem|em|vh|vw|vmin|vmax|ms|s))$/;
const CSS_VISUAL_LITERAL = /#[0-9a-fA-F]{3,8}\b|\b(?:rgb|rgba|hsl|hsla|oklch)\([^)]*\)|(?<![\w.-])-?\d+(?:\.\d+)?(?:px|rem|em|vh|vw|vmin|vmax)\b/g;
const CSS_MOTION_LITERAL = /(?<![\w.-])-?\d+(?:\.\d+)?(?:ms|s)\b/g;
const MOTION_LITERAL_KEY = /\b(duration|delay|ease|stiffness|damping|mass|bounce)\s*:\s*(\[[^\]]*\]|["'][^"']+["']|-?\d+(?:\.\d+)?)/g;
const IMPORT_RE = /(?:import|export)\s+(?:type\s+)?(?:[^"']*?\s+from\s+)?["']([^"']+)["']/g;
const DYNAMIC_IMPORT_RE = /import\(\s*["']([^"']+)["']\s*\)/g;
const CSS_NAMED_VISUAL_COLORS = new Set(`
  aliceblue antiquewhite aqua aquamarine azure beige bisque black blanchedalmond blue
  blueviolet brown burlywood cadetblue chartreuse chocolate coral cornflowerblue cornsilk
  crimson cyan darkblue darkcyan darkgoldenrod darkgray darkgreen darkgrey darkkhaki
  darkmagenta darkolivegreen darkorange darkorchid darkred darksalmon darkseagreen
  darkslateblue darkslategray darkslategrey darkturquoise darkviolet deeppink deepskyblue
  dimgray dimgrey dodgerblue firebrick floralwhite forestgreen fuchsia gainsboro ghostwhite
  gold goldenrod gray green greenyellow grey honeydew hotpink indianred indigo ivory khaki
  lavender lavenderblush lawngreen lemonchiffon lightblue lightcoral lightcyan
  lightgoldenrodyellow lightgray lightgreen lightgrey lightpink lightsalmon lightseagreen
  lightskyblue lightslategray lightslategrey lightsteelblue lightyellow lime limegreen linen
  magenta maroon mediumaquamarine mediumblue mediumorchid mediumpurple mediumseagreen
  mediumslateblue mediumspringgreen mediumturquoise mediumvioletred midnightblue mintcream
  mistyrose moccasin navajowhite navy oldlace olive olivedrab orange orangered orchid
  palegoldenrod palegreen paleturquoise palevioletred papayawhip peachpuff peru pink plum
  powderblue purple rebeccapurple red rosybrown royalblue saddlebrown salmon sandybrown
  seagreen seashell sienna silver skyblue slateblue slategray slategrey snow springgreen
  steelblue tan teal thistle tomato turquoise violet wheat white whitesmoke yellow yellowgreen
`.trim().split(/\s+/));
const CSS_COLOR_PROPERTY = /^(?:color|background(?:-color)?|border(?:-(?:top|right|bottom|left|block|inline)(?:-(?:start|end))?)?(?:-color)?|outline(?:-color)?|box-shadow|text-shadow|text-decoration(?:-color)?|column-rule(?:-color)?|caret-color|accent-color|fill|stroke|flood-color|lighting-color|stop-color|scrollbar-color|-webkit-text-(?:fill|stroke)(?:-color)?)$/;

function repoRelative(file) {
  return relative(REPO_ROOT, file).replaceAll("\\", "/");
}

export function lineAt(source, index) {
  return source.slice(0, index).split("\n").length;
}

export function stripComments(source) {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, (comment) => "\n".repeat((comment.match(/\n/g) ?? []).length))
    .replace(/(^|[^:])\/\/[^\n]*/g, "$1");
}

function maskCssComments(source) {
  return source.replace(/\/\*[\s\S]*?\*\//g, (comment) => comment.replace(/[^\n]/g, " "));
}

function maskRange(source, start, end) {
  if (start < 0 || end <= start) return source;
  return source.slice(0, start) + source.slice(start, end).replace(/[^\n]/g, " ") + source.slice(end);
}

/** Finds hard-coded CSS named colors in visual declarations. `transparent`,
 * `currentColor` and CSS-wide keywords are intentionally not named colors. */
export function findNamedVisualColors(source) {
  const clean = stripComments(source);
  const findings = [];
  const declaration = /(?:^|[;{])\s*([-a-z]+)\s*:\s*([^;{}]+)(?=;|})/gim;
  for (const match of clean.matchAll(declaration)) {
    const property = match[1].toLowerCase();
    if (!CSS_COLOR_PROPERTY.test(property)) continue;
    const value = match[2];
    for (const word of value.matchAll(/\b[a-z]+\b/gi)) {
      const color = word[0].toLowerCase();
      if (!CSS_NAMED_VISUAL_COLORS.has(color)) continue;
      const valueOffset = match[0].lastIndexOf(value);
      findings.push({
        line: lineAt(clean, match.index + valueOffset + word.index),
        detail: `${property}: ${color}`,
      });
    }
  }
  return findings;
}

/** String-aware balanced-region extractor. */
export function extractBalanced(source, openIndex, open = "{", close = "}") {
  if (source[openIndex] !== open) return null;
  let depth = 0;
  let quote = null;
  let escaped = false;
  for (let index = openIndex; index < source.length; index += 1) {
    const char = source[index];
    if (quote) {
      if (escaped) escaped = false;
      else if (char === "\\") escaped = true;
      else if (char === quote) quote = null;
      continue;
    }
    if (char === '"' || char === "'" || char === "`") {
      quote = char;
      continue;
    }
    if (char === open) depth += 1;
    else if (char === close) {
      depth -= 1;
      if (depth === 0) {
        return { start: openIndex, end: index + 1, text: source.slice(openIndex, index + 1) };
      }
    }
  }
  return null;
}

function splitTopLevel(source) {
  const parts = [];
  let start = 0;
  let curly = 0;
  let square = 0;
  let paren = 0;
  let quote = null;
  let escaped = false;
  for (let index = 0; index < source.length; index += 1) {
    const char = source[index];
    if (quote) {
      if (escaped) escaped = false;
      else if (char === "\\") escaped = true;
      else if (char === quote) quote = null;
      continue;
    }
    if (char === '"' || char === "'" || char === "`") quote = char;
    else if (char === "{") curly += 1;
    else if (char === "}") curly -= 1;
    else if (char === "[") square += 1;
    else if (char === "]") square -= 1;
    else if (char === "(") paren += 1;
    else if (char === ")") paren -= 1;
    else if (char === "," && curly === 0 && square === 0 && paren === 0) {
      parts.push(source.slice(start, index).trim());
      start = index + 1;
    }
  }
  const tail = source.slice(start).trim();
  if (tail) parts.push(tail);
  return parts;
}

function customPropertyChunk(chunk) {
  return (
    /^\[\s*["']--[a-z0-9-]+["']\s*(?:as\s+any)?\s*\]\s*:/i.test(chunk) ||
    /^["']--[a-z0-9-]+["']\s*:/i.test(chunk)
  );
}

const MOTION_STYLE_KEYS = new Set([
  "x", "y", "z", "scale", "scaleX", "scaleY", "rotate", "rotateX", "rotateY",
  "opacity", "pathLength", "strokeDashoffset",
]);

function dynamicMotionStyle(source, matchIndex, body) {
  const tagStart = source.lastIndexOf("<", matchIndex);
  if (tagStart < 0 || !/^<motion\./.test(source.slice(tagStart, matchIndex).trimStart())) return false;
  return splitTopLevel(body).every((chunk) => {
    if (/^\.\.\.[A-Za-z_$][\w$]*$/.test(chunk)) return true;
    if (/^[A-Za-z_$][\w$]*$/.test(chunk)) return MOTION_STYLE_KEYS.has(chunk);
    const match = chunk.match(/^([A-Za-z_$][\w$]*)\s*:\s*([A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*)?)$/);
    return Boolean(match && MOTION_STYLE_KEYS.has(match[1]));
  });
}

export function findInlineStyleObjects(source) {
  const findings = [];
  const clean = stripComments(source);
  for (const match of clean.matchAll(/\bstyle\s*=\s*\{\s*\{/g)) {
    const objectStart = match.index + match[0].lastIndexOf("{");
    const region = extractBalanced(clean, objectStart);
    if (!region) continue;
    const body = region.text.slice(1, -1).trim();
    const chunks = splitTopLevel(body);
    const customPropertiesOnly = chunks.length > 0 && chunks.every(customPropertyChunk);
    if (customPropertiesOnly || dynamicMotionStyle(clean, match.index, body)) continue;
    findings.push({
      line: lineAt(clean, match.index),
      detail: body.replace(/\s+/g, " ").slice(0, 140),
    });
  }
  return findings;
}

function collectObjectRegions(source, regex) {
  const regions = [];
  for (const match of source.matchAll(regex)) {
    const brace = source.indexOf("{", match.index + match[0].length - 1);
    if (brace < 0) continue;
    const region = extractBalanced(source, brace);
    if (region) regions.push(region);
  }
  return regions;
}

export function findMotionLiterals(source) {
  const clean = stripComments(source);
  const regions = [
    ...collectObjectRegions(clean, /\btransition\s*=\s*\{\s*\{/g),
    ...collectObjectRegions(clean, /\btransition\s*:\s*\{/g),
  ];

  for (const call of clean.matchAll(/\buseSpring\s*\(/g)) {
    const open = clean.indexOf("(", call.index);
    const region = extractBalanced(clean, open, "(", ")");
    if (region) regions.push(region);
  }

  const deduped = new Map();
  for (const region of regions) {
    MOTION_LITERAL_KEY.lastIndex = 0;
    for (const match of region.text.matchAll(MOTION_LITERAL_KEY)) {
      const index = region.start + match.index;
      const key = `${index}:${match[1]}`;
      deduped.set(key, {
        line: lineAt(clean, index),
        detail: `${match[1]}: ${match[2]}`,
      });
    }
  }
  return [...deduped.values()];
}

function resolveLocalModule(fromFile, specifier) {
  if (!specifier.startsWith(".")) return null;
  const base = resolve(dirname(fromFile), specifier);
  const candidates = [base, `${base}.ts`, `${base}.tsx`, `${base}.js`, `${base}.mjs`, join(base, "index.ts"), join(base, "index.tsx")];
  for (const candidate of candidates) {
    if (!candidate.startsWith(APP_ROOT + "/") && candidate !== APP_ROOT) continue;
    if (existsSync(candidate) && extname(candidate)) return candidate;
  }
  return null;
}

function importsOf(file) {
  const source = stripComments(readFileSync(file, "utf8"));
  const specifiers = [];
  for (const regex of [IMPORT_RE, DYNAMIC_IMPORT_RE]) {
    regex.lastIndex = 0;
    for (const match of source.matchAll(regex)) specifiers.push(match[1]);
  }
  return specifiers;
}

export function collectImportGraph(root, entries) {
  const seen = new Set();
  const visit = (file) => {
    if (seen.has(file) || !existsSync(file)) return;
    seen.add(file);
    for (const specifier of importsOf(file)) {
      const resolved = resolveLocalModule(file, specifier);
      if (resolved) visit(resolved);
    }
  };
  for (const entry of entries) visit(join(root, entry));
  return seen;
}

export function classifyFile(file) {
  const rel = typeof file === "string" && file.startsWith(REPO_ROOT) ? repoRelative(file) : file.replaceAll("\\", "/");
  if (rel.includes("/features/dev-tools/") || rel === "src/app/pages/dev.tsx" || rel === "src/app/pages/cms.tsx") return "TOOLING";
  if (rel.includes("/components/design-system/") || rel === "src/app/pages/design-system.tsx") return "SHOWCASE";
  if (rel.includes("/components/ds/")) return "T4";
  if (NAMED_TEMPLATE_FILES.has(rel) || rel.includes("/pages/")) return "T6";
  if (rel.includes("/components/shared/") || rel.includes("/components/media/") || rel.includes("/features/recipe/") || rel.includes("/features/cooking/")) return "T5";
  if (rel.includes("/domain/")) return "DOMAIN";
  return "SUPPORT";
}

function section(theme, startMarker, endMarker) {
  const start = theme.indexOf(startMarker);
  const end = theme.indexOf(endMarker, start + startMarker.length);
  if (start < 0 || end < 0) throw new Error(`Token tier marker missing: ${startMarker} / ${endMarker}`);
  return { source: theme.slice(start, end), start };
}

function declarations(source, lineOffset = 0) {
  const clean = stripComments(source);
  return [...clean.matchAll(/^\s*(--[a-z0-9-]+)\s*:\s*([\s\S]*?);/gm)].map((match) => ({
    name: match[1],
    value: match[2].replace(/\s+/g, " ").trim(),
    line: lineOffset + lineAt(clean, match.index),
  }));
}

export function parseTokenTiers(themeSource) {
  const defsBetween = (start, end) => {
    const selected = section(themeSource, start, end);
    return declarations(selected.source, lineAt(themeSource, selected.start) - 1);
  };
  const tierDefs = {
    T1: defsBetween("TIER 1 — PRIMITIVES", "TIER 2 — SEMANTIC TOKENS"),
    T2: defsBetween("TIER 2 — SEMANTIC TOKENS", "TIER 2.5 — DATA VISUALIZATION"),
    T25: defsBetween("TIER 2.5 — DATA VISUALIZATION", "TIER 3 — COMPONENT TOKENS"),
    T3: defsBetween("TIER 3 — COMPONENT TOKENS", "\n.dark"),
  };
  const tierByToken = new Map();
  for (const [tier, defs] of Object.entries(tierDefs)) {
    for (const definition of defs) tierByToken.set(definition.name, tier);
  }
  return { tierDefs, tierByToken };
}

function allCssDefinitions(themeSource) {
  return new Set(declarations(themeSource).map((definition) => definition.name));
}

function finding(rule, file, line, detail) {
  return { rule, file, line, detail };
}

function exceptionFor(group, file) {
  return EXCEPTIONS[group]?.[file];
}

export function scanTokenDefinitions(themeSource, parsed) {
  const findings = [];
  const allowedRefs = {
    T1: new Set(),
    T2: new Set(["T1", "T2"]),
    T25: new Set(["T1", "T2", "T25"]),
    T3: new Set(["T2", "T25", "T3"]),
  };
  const framework = extractCssLayer(themeSource, "@theme inline");
  const definitionSource = framework
    ? themeSource.slice(0, framework.start) +
      themeSource.slice(framework.start, framework.end).replace(/[^\n]/g, " ") +
      themeSource.slice(framework.end)
    : themeSource;
  for (const definition of declarations(definitionSource)) {
      const tier = parsed.tierByToken.get(definition.name);
      if (!tier) continue;
      const refs = [...definition.value.matchAll(/var\((--[a-z0-9-]+)/g)].map((match) => match[1]);
      for (const ref of refs) {
        const target = parsed.tierByToken.get(ref);
        if (target && !allowedRefs[tier].has(target)) {
          findings.push(finding(
            "tier-definition-boundary",
            "src/styles/theme.css",
            definition.line,
            `${tier} ${definition.name} references ${target} ${ref}`,
          ));
        }
      }
      // DTCG distinction: a downstream token may own a composite shadow,
      // gradient, typography or component recipe. A bare palette/dimension/
      // time value is still a primitive and must be promoted to T1.
      if (
        tier !== "T1" &&
        (SIMPLE_RAW_VALUE.test(definition.value) || CSS_NAMED_VISUAL_COLORS.has(definition.value.toLowerCase()))
      ) {
        findings.push(finding(
          "tier-raw-value-outside-t1",
          "src/styles/theme.css",
          definition.line,
          `${tier} ${definition.name}: ${definition.value.slice(0, 120)}`,
        ));
      }
  }
  return findings;
}

export function scanFrameworkAliases(themeSource) {
  const region = extractCssLayer(themeSource, "@theme inline");
  if (!region) return [finding("tier-framework-alias", "src/styles/theme.css", 1, "@theme inline block is missing")];
  const findings = [];
  for (const definition of declarations(region.text, region.lineOffset)) {
    const frameworkNeutral = definition.name === "--color-*" && definition.value === "initial";
    const frameworkPhotoAlias = ["--color-white", "--color-black"].includes(definition.name) &&
      ["#ffffff", "#000000"].includes(definition.value.toLowerCase());
    const tokenAlias = /^var\(--[a-z0-9-]+\)$/.test(definition.value);
    if (!frameworkNeutral && !frameworkPhotoAlias && !tokenAlias) {
      findings.push(finding(
        "tier-framework-alias",
        "src/styles/theme.css",
        definition.line,
        `${definition.name} must alias a DS token; only Tailwind photo #fff/#000 aliases are authorised`,
      ));
    }
  }
  return findings;
}

export function validateGeneratedShowcaseCss(source) {
  const findings = [];
  const blocks = [...source.matchAll(/\.dsx-s-([a-f0-9]{10})\s*\{([\s\S]*?)\n\s*\}/g)];
  for (const match of blocks) {
    const signature = match[2]
      .split(";")
      .map((declaration) => declaration.trim())
      .filter(Boolean)
      .map((declaration) => {
        const colon = declaration.indexOf(":");
        return `${declaration.slice(0, colon).trim()}:${declaration.slice(colon + 1).trim()}`;
      })
      .join(";");
    const expected = createHash("sha256").update(signature).digest("hex").slice(0, 10);
    if (expected !== match[1]) {
      findings.push({ line: lineAt(source, match.index), detail: `dsx-s-${match[1]} content hash must be dsx-s-${expected}` });
    }
  }
  const residue = source
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/@layer\s+components\s*\{/g, "")
    .replace(/\.dsx-s-[a-f0-9]{10}\s*\{[\s\S]*?\n\s*\}/g, "")
    .replace(/[}\s]/g, "");
  if (residue) findings.push({ line: 1, detail: "generated CSS contains declarations outside content-addressed dsx rules" });
  if (blocks.length === 0) findings.push({ line: 1, detail: "generated CSS has no content-addressed dsx rules" });
  return findings;
}

function scanShowcaseCssContract(showcaseFiles) {
  const findings = [];
  const generatedRel = "src/app/components/design-system/showcase.generated.css";
  const generated = readFileSync(join(REPO_ROOT, generatedRel), "utf8");
  for (const item of validateGeneratedShowcaseCss(generated)) {
    findings.push(finding("showcase-generated-css-integrity", generatedRel, item.line, item.detail));
  }
  for (const item of findNamedVisualColors(generated)) {
    findings.push(finding("tier-css-visual-literal", generatedRel, item.line, item.detail));
  }
  const referenced = new Set();
  for (const file of showcaseFiles) {
    if (!/\.tsx?$/.test(file)) continue;
    for (const match of readFileSync(file, "utf8").matchAll(/\bdsx-s-[a-f0-9]{10}\b/g)) referenced.add(match[0]);
  }
  const defined = new Set([...generated.matchAll(/\.(dsx-s-[a-f0-9]{10})\s*\{/g)].map((match) => match[1]));
  for (const className of [...referenced].filter((name) => !defined.has(name)).sort()) {
    findings.push(finding("showcase-generated-css-integrity", generatedRel, 1, `${className} is referenced but not generated`));
  }
  for (const className of [...defined].filter((name) => !referenced.has(name)).sort()) {
    findings.push(finding("showcase-generated-css-integrity", generatedRel, 1, `${className} is generated but orphaned`));
  }
  return findings;
}

function extractCssLayer(source, marker) {
  const masked = maskCssComments(source);
  const exact = new RegExp(`^${marker.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*\\{`, "m").exec(masked);
  const start = exact?.index ?? -1;
  if (start < 0) return null;
  const open = masked.indexOf("{", start + marker.length);
  const region = extractBalanced(masked, open);
  return region ? {
    ...region,
    text: source.slice(region.start, region.end),
    lineOffset: lineAt(source, region.start) - 1,
  } : null;
}

function scanCssText(source, file, lineOffset = 0) {
  const findings = [];
  const clean = stripComments(source);
  for (const item of findNamedVisualColors(clean)) {
    findings.push(finding("tier-css-visual-literal", file, lineOffset + item.line, item.detail));
  }
  for (const [index, raw] of clean.split("\n").entries()) {
    const line = raw.trim();
    if (!line || /^--[a-z0-9-]+\s*:/.test(line) || /^@(?:media|container)\b/.test(line)) continue;
    CSS_VISUAL_LITERAL.lastIndex = 0;
    for (const match of line.matchAll(CSS_VISUAL_LITERAL)) {
      findings.push(finding("tier-css-visual-literal", file, lineOffset + index + 1, match[0]));
    }
    if (/\b(?:animation|transition)(?:-[a-z-]+)?\s*:/.test(line)) {
      CSS_MOTION_LITERAL.lastIndex = 0;
      for (const match of line.matchAll(CSS_MOTION_LITERAL)) {
        findings.push(finding("tier-motion-literal", file, lineOffset + index + 1, match[0]));
      }
    }
  }
  return findings;
}

function scanConsumingCss(themeSource) {
  const findings = [];
  const componentLayer = extractCssLayer(themeSource, "@layer components");
  if (componentLayer) {
    findings.push(...scanCssText(componentLayer.text.slice(1, -1), "src/styles/theme.css", componentLayer.lineOffset));
  }
  const layoutPath = join(REPO_ROOT, "src/styles/layout.css");
  if (existsSync(layoutPath)) findings.push(...scanCssText(readFileSync(layoutPath, "utf8"), "src/styles/layout.css"));
  return findings;
}

function scanBootstrap() {
  const source = readFileSync(join(REPO_ROOT, "index.html"), "utf8");
  const findings = [];
  const inlineStyle = source.match(/<style>([\s\S]*?)<\/style>/)?.[1] ?? "";
  for (const item of scanCssText(inlineStyle, "index.html")) {
    findings.push({ ...item, rule: item.rule === "tier-motion-literal" ? item.rule : "tier-bootstrap-raw-value" });
  }
  for (const match of source.matchAll(/\.style\.[a-zA-Z]+\s*=\s*[^;]*?(#[0-9a-fA-F]{3,8}\b)/g)) {
    findings.push(finding("tier-bootstrap-raw-value", "index.html", lineAt(source, match.index), match[1]));
  }
  return findings;
}

function scanImports(file, source, tier) {
  const findings = [];
  const rel = repoRelative(file);
  for (const specifier of importsOf(file)) {
    const target = resolveLocalModule(file, specifier);
    if (!target) continue;
    const targetTier = classifyFile(target);
    if (tier === "T4" && !["T4", "SUPPORT"].includes(targetTier)) {
      findings.push(finding("tier-import-boundary", rel, 1, `T4 imports ${targetTier}: ${specifier}`));
    }
    if (tier === "T5" && targetTier === "T6") {
      findings.push(finding("tier-import-boundary", rel, 1, `T5 imports T6: ${specifier}`));
    }
    if (tier === "DOMAIN" && ["T4", "T5", "T6", "SHOWCASE"].includes(targetTier)) {
      findings.push(finding("tier-import-boundary", rel, 1, `domain/support imports presentation ${targetTier}: ${specifier}`));
    }
  }
  if (tier === "DOMAIN" && /from\s+["'](?:react|motion\/react|react-router)/.test(source)) {
    findings.push(finding("tier-import-boundary", rel, 1, "domain module imports a presentation/runtime framework"));
  }
  return findings;
}

function scanTokenConsumption(file, source, tier, parsed, allDefs) {
  const findings = [];
  const rel = repoRelative(file);
  const locallyAssigned = new Set(
    [...source.matchAll(/["'](--[a-z0-9-]+)["']\s*(?:as\s+any)?\s*\]?\s*:/g)].map((match) => match[1]),
  );
  for (const match of source.matchAll(/var\((--[a-z0-9-]+)/g)) {
    const lineStart = source.lastIndexOf("\n", match.index) + 1;
    const lineEnd = source.indexOf("\n", match.index);
    const sourceLine = source.slice(lineStart, lineEnd < 0 ? source.length : lineEnd);
    // An encoded SVG may intentionally contain an SVG-local custom-property
    // fallback. It is inert document data, not a reference into the app DS.
    if (/data:image\/svg\+xml/i.test(sourceLine)) continue;
    const token = match[1];
    const tokenTier = parsed.tierByToken.get(token);
    const line = lineAt(source, match.index);
    if (tier === "DOMAIN" && allDefs.has(token)) {
      findings.push(finding("tier-domain-presentation-leak", rel, line, `${token} in domain/support code`));
    } else if (["T4", "T5", "T6"].includes(tier) && tokenTier === "T1") {
      // F5-7 / NuTree policy: semantic T2 aliases are valid runtime inputs.
      // Only primitive consumption is a hard bypass; exact component roles
      // remain a review guideline enforced where an atom exposes that API.
      findings.push(finding("tier-runtime-token-bypass", rel, line, `${tier} consumes primitive ${token}`));
    } else if (!tokenTier && !allDefs.has(token) && !locallyAssigned.has(token)) {
      findings.push(finding("tier-unresolved-token", rel, line, token));
    }
  }
  return exceptionFor("tokenBoundary", rel) ? [] : findings;
}

function scanRawControls(file, source, tier) {
  if (!["T5", "T6", "SHOWCASE"].includes(tier)) return [];
  const rel = repoRelative(file);
  if (exceptionFor("rawControl", rel)) return [];
  const findings = [];
  const sourceFile = ts.createSourceFile(rel, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const valueOf = (node, name) => {
    const attribute = node.attributes.properties.find(
      (property) => ts.isJsxAttribute(property) && property.name.getText(sourceFile) === name,
    );
    if (!attribute || !ts.isJsxAttribute(attribute)) return null;
    if (!attribute.initializer) return true;
    if (ts.isStringLiteral(attribute.initializer)) return attribute.initializer.text;
    if (ts.isJsxExpression(attribute.initializer)) return attribute.initializer.expression?.getText(sourceFile) ?? true;
    return attribute.initializer.getText(sourceFile);
  };
  const visit = (node) => {
    if (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) {
      const tag = node.tagName.getText(sourceFile);
      if (["button", "input", "select", "textarea"].includes(tag)) {
        const attributes = new Set(node.attributes.properties
          .filter(ts.isJsxAttribute)
          .map((attribute) => attribute.name.getText(sourceFile)));
        const className = String(valueOf(node, "className") ?? "");
        const type = String(valueOf(node, "type") ?? "text").replace(/["']/g, "");
        const semanticClass = /\b[a-z][a-z0-9-]*__(?:[a-z0-9-]+)|\b[a-z][a-z0-9-]*--(?:[a-z0-9-]+)/i.test(className);
        const specialisedInput = tag === "input" && (
          ["range", "radio", "checkbox", "file", "search", "hidden"].includes(type) ||
          attributes.has("readOnly") || semanticClass
        );
        const specialisedText = ["textarea", "select"].includes(tag) && semanticClass;
        const specialisedButton = tag === "button" && (
          semanticClass ||
          type === "submit" ||
          ["role", "aria-expanded", "aria-controls", "aria-pressed", "aria-selected"].some((name) => attributes.has(name))
        );
        if (!specialisedInput && !specialisedText && !specialisedButton) {
          const line = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile)).line + 1;
          findings.push(finding(
            "tier-raw-control",
            rel,
            line,
            `<${tag}> is a generic visual control; compose a T4 component or add specialised native semantics`,
          ));
        }
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(sourceFile);
  return findings;
}

function scanInlineStyles(file, source) {
  const rel = repoRelative(file);
  if (exceptionFor("inlineStyle", rel)) return [];
  return findInlineStyleObjects(source).map((item) => finding("tier-inline-style", rel, item.line, item.detail));
}

function scanMotion(file, source) {
  const rel = repoRelative(file);
  if (MOTION_PRESET_FILES.has(rel) || exceptionFor("motionLiteral", rel)) return [];
  return findMotionLiterals(source).map((item) => finding("tier-motion-literal", rel, item.line, item.detail));
}

function showcaseCoverage(showcaseFiles) {
  const barrel = readFileSync(join(APP_ROOT, "components/ds/index.ts"), "utf8");
  const exported = new Set(
    [...barrel.matchAll(/^export\s*\{\s*([A-Z][A-Za-z0-9]*)\s*\}\s*from/gm)].map((match) => match[1]),
  );
  const showcaseSource = [...showcaseFiles].map((file) => readFileSync(file, "utf8")).join("\n");
  const imported = new Set();
  const rendered = new Set();
  for (const match of showcaseSource.matchAll(/import\s*\{([^}]+)\}\s*from\s*["'][^"']*\/ds(?:\/index)?["']/g)) {
    for (const name of match[1].split(",").map((part) => part.trim().split(/\s+as\s+/)[0])) {
      if (/^[A-Z]/.test(name)) imported.add(name);
    }
  }
  for (const name of exported) {
    if (new RegExp(`<${name}\\b`).test(showcaseSource)) rendered.add(name);
  }
  const findings = [...exported]
    .filter((name) => !imported.has(name) || !rendered.has(name))
    .sort()
    .map((name) => finding(
      "showcase-component-coverage",
      "src/app/components/ds/index.ts",
      1,
      `${name} is exported by T4 but not both imported and rendered by the showcase registry`,
    ));
  return { exported, imported, rendered, findings };
}

function normalizeSvgPath(value) {
  return value.replace(/\s+/g, "").replaceAll("'", '"');
}

function extractNaturalMark(source) {
  const match = source.match(/const\s+NATURALE\s*=\s*"([^"]+)"\s*\+\s*"([^"]+)"/);
  return match ? match[1] + match[2] : null;
}

function pngDimensions(file) {
  const buffer = readFileSync(file);
  if (buffer.length < 24 || buffer.toString("hex", 0, 8) !== "89504e470d0a1a0a") return null;
  return [buffer.readUInt32BE(16), buffer.readUInt32BE(20)];
}

function brandGuard(themeSource) {
  const findings = [];
  const required = new Map([
    ["public/favicon-16x16.png", [16, 16]],
    ["public/favicon-32x32.png", [32, 32]],
    ["public/apple-touch-icon.png", [180, 180]],
    ["public/icon-192.png", [192, 192]],
    ["public/icon-512.png", [512, 512]],
  ]);
  for (const [rel, expected] of required) {
    const file = join(REPO_ROOT, rel);
    const actual = existsSync(file) ? pngDimensions(file) : null;
    if (!actual || actual[0] !== expected[0] || actual[1] !== expected[1]) {
      findings.push(finding("brand-asset-parity", rel, 1, `expected ${expected.join("x")}, found ${actual?.join("x") ?? "missing/invalid"}`));
    }
  }
  for (const rel of ["public/favicon.svg", "public/favicon.ico", "public/site.webmanifest"]) {
    if (!existsSync(join(REPO_ROOT, rel))) findings.push(finding("brand-asset-parity", rel, 1, "required brand asset missing"));
  }

  const favicon = readFileSync(join(REPO_ROOT, "public/favicon.svg"), "utf8");
  const index = readFileSync(join(REPO_ROOT, "index.html"), "utf8");
  const logo = readFileSync(join(APP_ROOT, "components/shared/vulcan-logo.tsx"), "utf8");
  const faviconPath = favicon.match(/<path[\s\S]*?\sd="([^"]+)"/)?.[1] ?? null;
  const splashPath = index.match(/<path\s+d="([^"]+)"/)?.[1] ?? null;
  const runtimePath = extractNaturalMark(logo);
  const paths = [faviconPath, splashPath, runtimePath].map((value) => value && normalizeSvgPath(value));
  if (!paths[0] || paths.some((value) => value !== paths[0])) {
    findings.push(finding("brand-asset-parity", "public/favicon.svg", 1, "favicon, startup splash and runtime naturale mark paths differ"));
  }
  const tokenValues = new Map(declarations(themeSource).map((definition) => [definition.name, definition.value]));
  const resolveHex = (name, seen = new Set()) => {
    if (seen.has(name)) return null;
    seen.add(name);
    const value = tokenValues.get(name);
    const direct = value?.match(/^#[0-9a-fA-F]{6}$/)?.[0];
    if (direct) return direct.toLowerCase();
    const alias = value?.match(/^var\((--[a-z0-9-]+)\)$/)?.[1];
    return alias ? resolveHex(alias, seen) : null;
  };
  const expectedStops = [resolveHex("--logo-grad-start"), resolveHex("--logo-grad-mid"), resolveHex("--logo-grad-end")];
  const stopColors = (source) => [...source.matchAll(/<stop\b[^>]*\bstop-(?:color|Color)=["'](#[0-9a-fA-F]{6}|var\(--[a-z0-9-]+\))["']/g)].map((match) => {
    const value = match[1];
    return value.startsWith("var(") ? resolveHex(value.slice(4, -1)) : value.toLowerCase();
  });
  for (const [file, actual] of [["public/favicon.svg", stopColors(favicon)], ["index.html", stopColors(index)]]) {
    if (expectedStops.some((value) => !value) || actual.slice(0, 3).some((value, index) => value !== expectedStops[index])) {
      findings.push(finding("brand-asset-parity", file, 1, `gradient stops differ from ${expectedStops.join(", ")}`));
    }
  }
  const manifest = JSON.parse(readFileSync(join(REPO_ROOT, "public/site.webmanifest"), "utf8"));
  if (manifest.theme_color?.toLowerCase() !== resolveHex("--logo-solid")) {
    findings.push(finding("brand-asset-parity", "public/site.webmanifest", 1, "theme_color differs from --logo-solid"));
  }
  return { assetCount: required.size + 3, findings };
}

export function buildRuleReport(findings) {
  const rules = {};
  for (const item of findings) {
    rules[item.rule] ??= { total: 0, byFile: {}, byTier: {} };
    rules[item.rule].total += 1;
    rules[item.rule].byFile[item.file] = (rules[item.rule].byFile[item.file] ?? 0) + 1;
    const owner = item.file === "src/styles/theme.css" ? "TOKENS" : classifyFile(item.file);
    rules[item.rule].byTier[owner] = (rules[item.rule].byTier[owner] ?? 0) + 1;
  }
  return Object.fromEntries(Object.entries(rules).sort(([a], [b]) => a.localeCompare(b)));
}

export function runGuard() {
  const root = REPO_ROOT;
  const themeSource = readFileSync(join(root, "src/styles/theme.css"), "utf8");
  const parsed = parseTokenTiers(themeSource);
  const allDefs = allCssDefinitions(themeSource);
  const productGraph = collectImportGraph(root, PRODUCT_ENTRY_FILES);
  const showcaseGraph = collectImportGraph(root, SHOWCASE_ENTRY_FILES);
  const allFiles = new Set([...productGraph, ...showcaseGraph]);
  const findings = [
    ...scanTokenDefinitions(themeSource, parsed),
    ...scanFrameworkAliases(themeSource),
    ...scanConsumingCss(themeSource),
    ...scanBootstrap(),
    ...scanShowcaseCssContract(showcaseGraph),
  ];

  for (const file of [...allFiles].sort()) {
    if (!/\.(?:ts|tsx)$/.test(file)) continue;
    const source = stripComments(readFileSync(file, "utf8"));
    const tier = classifyFile(file);
    if (tier === "TOOLING") continue;
    findings.push(...scanImports(file, source, tier));
    findings.push(...scanTokenConsumption(file, source, tier, parsed, allDefs));
    if (file.endsWith(".tsx")) {
      findings.push(...scanRawControls(file, source, tier));
      findings.push(...scanInlineStyles(file, source));
    }
    findings.push(...scanMotion(file, source));
  }

  const coverage = showcaseCoverage(showcaseGraph);
  findings.push(...coverage.findings);
  const brand = brandGuard(themeSource);
  findings.push(...brand.findings);

  findings.sort((a, b) => a.rule.localeCompare(b.rule) || a.file.localeCompare(b.file) || a.line - b.line);
  return {
    taxonomy: TIER_TAXONOMY,
    scope: {
      productFiles: productGraph.size,
      showcaseFiles: showcaseGraph.size,
      uniqueFiles: allFiles.size,
    },
    tokens: Object.fromEntries(Object.entries(parsed.tierDefs).map(([tier, defs]) => [tier, defs.length])),
    showcase: {
      t4Exports: coverage.exported.size,
      t4Imports: coverage.imported.size,
      t4Rendered: coverage.rendered.size,
      missingT4Imports: coverage.findings.length,
    },
    brand: { checkedAssets: brand.assetCount },
    rules: buildRuleReport(findings),
    findings,
  };
}

function printReport(report, verbose) {
  console.log("Vulcan DS tier guard");
  console.log(`scope: product ${report.scope.productFiles}, showcase ${report.scope.showcaseFiles}, unique ${report.scope.uniqueFiles}`);
  console.log(`tokens: T1 ${report.tokens.T1}, T2 ${report.tokens.T2}, T2.5 ${report.tokens.T25}, T3 ${report.tokens.T3}`);
  console.log(`showcase T4 coverage: ${report.showcase.t4Rendered}/${report.showcase.t4Exports} rendered, ${report.showcase.t4Imports} imported (${report.showcase.missingT4Imports} missing)`);
  console.log(`brand assets checked: ${report.brand.checkedAssets}`);
  console.log("");
  const entries = Object.entries(report.rules);
  if (!entries.length) {
    console.log("✓ zero design-system tier findings");
    return;
  }
  for (const [rule, value] of entries) {
    console.log(`▸ ${rule}: ${value.total}`);
    console.log(`    tiers: ${Object.entries(value.byTier).map(([tier, count]) => `${tier}=${count}`).join(", ")}`);
    const byFile = Object.entries(value.byFile).sort(([, a], [, b]) => b - a || 0);
    for (const [file, count] of byFile.slice(0, verbose ? byFile.length : 12)) console.log(`    ${count}  ${file}`);
    if (!verbose && byFile.length > 12) console.log(`    … ${byFile.length - 12} more files (use --verbose or --json)`);
    if (verbose) {
      for (const item of report.findings.filter((findingItem) => findingItem.rule === rule)) {
        console.log(`      ${item.file}:${item.line}  ${item.detail}`);
      }
    }
  }
}

function main() {
  const reportOnly = process.argv.includes("--report");
  const verbose = process.argv.includes("--verbose");
  const json = process.argv.includes("--json");
  const report = runGuard();
  if (json) console.log(JSON.stringify(report, null, 2));
  else printReport(report, verbose);
  if (!reportOnly && report.findings.length > 0) {
    console.error(`\n✗ ${report.findings.length} hard design-system tier findings`);
    process.exitCode = 1;
  }
}

if (resolve(process.argv[1] ?? "") === fileURLToPath(import.meta.url)) main();
