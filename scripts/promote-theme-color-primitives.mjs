#!/usr/bin/env node
/**
 * Promote literal theme-override colours to deterministic Tier-1 primitives.
 *
 * Theme selectors are allowed to remap semantic tokens, but do not own raw
 * palette values. Existing primitives are reused by exact value; genuinely
 * new authored colours receive a value-addressed primitive name. The two
 * exact Tailwind white/black aliases in `@theme inline` remain framework
 * integration constants and are governed separately by ds-tier-guard.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const THEME = resolve(ROOT, "src/styles/theme.css");
let source = readFileSync(THEME, "utf8");

const t1Start = source.indexOf("TIER 1 — PRIMITIVES");
const t1End = source.indexOf("TIER 2 — SEMANTIC TOKENS");
const frameworkStart = source.indexOf("@theme inline");
if ([t1Start, t1End, frameworkStart].some((index) => index < 0)) {
  throw new Error("Expected Tier-1/Tier-2/@theme markers are missing");
}

const normalise = (value) => value.toLowerCase();
const primitiveByValue = new Map();
for (const match of source.slice(t1Start, t1End).matchAll(/^\s*(--color-[a-z0-9-]+)\s*:\s*(#[0-9a-fA-F]{3,8})\s*;/gm)) {
  primitiveByValue.set(normalise(match[2]), match[1]);
}

const additions = new Map();
let promoted = 0;
source = source.replace(
  /^(\s*)(--[a-z0-9-]+)(\s*:\s*)(#[0-9a-fA-F]{3,8})(\s*;)/gm,
  (declaration, indent, name, separator, value, suffix, offset) => {
    const inTier1 = offset >= t1Start && offset < t1End;
    const frameworkPhotoAlias =
      (name === "--color-white" && normalise(value) === "#ffffff") ||
      (name === "--color-black" && normalise(value) === "#000000");
    if (inTier1 || frameworkPhotoAlias) return declaration;

    const normalised = normalise(value);
    let primitive = primitiveByValue.get(normalised);
    if (!primitive) {
      primitive = `--color-authored-${normalised.slice(1)}`;
      primitiveByValue.set(normalised, primitive);
      additions.set(primitive, normalised);
    }
    promoted += 1;
    return `${indent}${name}${separator}var(${primitive})${suffix}`;
  },
);

if (additions.size > 0) {
  const marker = "  /* ── Typography Primitives · Size ── */";
  const block = [
    "  /* ── Color Primitives · Authored theme extensions (value-addressed) ── */",
    ...[...additions].sort(([a], [b]) => a.localeCompare(b)).map(([name, value]) => `  ${name}: ${value};`),
    "",
  ].join("\n");
  if (!source.includes(marker)) throw new Error("Typography insertion marker is missing");
  source = source.replace(marker, `${block}${marker}`);
}

writeFileSync(THEME, source);
console.log(JSON.stringify({ promoted, primitivesAdded: additions.size }, null, 2));
