#!/usr/bin/env node
/** Replace raw dimensions in authored component CSS with Tier-1 primitives. */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const THEME = resolve(ROOT, "src/styles/theme.css");
let source = readFileSync(THEME, "utf8");

const values = new Map([
  ["-44px", "--dimension-fixed-neg-044"],
  ["0.5px", "--dimension-fixed-hairline"],
  ["0px", "--space-0"],
  ["1px", "--space-px"],
  ["40vh", "--dimension-viewport-height-40"],
  ["50vh", "--dimension-viewport-height-50"],
  ["60vh", "--dimension-viewport-height-60"],
  ["70vh", "--dimension-viewport-height-70"],
  ["85vh", "--dimension-viewport-height-85"],
  ["100vh", "--dimension-viewport-height-full"],
  ["1.8vw", "--dimension-viewport-width-018"],
  ["2vw", "--dimension-viewport-width-020"],
  ["2.65vw", "--dimension-viewport-width-0265"],
  ["2.8vw", "--dimension-viewport-width-028"],
  ["3vw", "--dimension-viewport-width-030"],
  ["3.5vw", "--dimension-viewport-width-035"],
  ["4vw", "--dimension-viewport-width-040"],
  ["4.4vw", "--dimension-viewport-width-044"],
  ["4.6vw", "--dimension-viewport-width-046"],
  ["5vw", "--dimension-viewport-width-050"],
  ["6vw", "--dimension-viewport-width-060"],
  ["6.5vw", "--dimension-viewport-width-065"],
  ["8vw", "--dimension-viewport-width-080"],
  ["44vw", "--dimension-viewport-width-44"],
  ["52vw", "--dimension-viewport-width-52"],
  ["60vw", "--dimension-viewport-width-60"],
  ["70vw", "--dimension-viewport-width-70"],
  ["80vw", "--dimension-viewport-width-80"],
  ["92vw", "--dimension-viewport-width-92"],
  ["100vw", "--dimension-viewport-width-full"],
]);

const start = /^@layer components\s*\{/m.exec(source)?.index ?? -1;
if (start < 0) throw new Error("@layer components is missing");
const before = source.slice(0, start);
let components = source.slice(start);
let replacements = 0;
for (const [value, token] of [...values].sort(([a], [b]) => b.length - a.length)) {
  const escaped = value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  components = components.replace(new RegExp(`(?<![\\w.])${escaped}(?![\\w.])`, "g"), () => {
    replacements += 1;
    return `var(${token})`;
  });
}
source = before + components;

// A prior migration may have encountered the words "@layer components" in
// the Tier-3 documentation comment. Keep component-token recipes layered by
// routing their one-pixel primitive through the semantic border token.
const t3Start = source.indexOf("TIER 3 — COMPONENT TOKENS");
const t3End = source.indexOf("\n.dark", t3Start);
const t3Names = new Set(
  [...source.slice(t3Start, t3End).matchAll(/^\s*(--[a-z0-9-]+)\s*:/gm)].map((match) => match[1]),
);
source = source.replace(/^(\s*)(--[a-z0-9-]+)(\s*:\s*)([\s\S]*?);/gm, (definition, indent, name, separator, value) =>
  t3Names.has(name) && value.includes("var(--space-px)")
    ? `${indent}${name}${separator}${value.replaceAll("var(--space-px)", "var(--border-w)")};`
    : definition,
);
writeFileSync(THEME, source);
console.log(JSON.stringify({ replacements }, null, 2));
