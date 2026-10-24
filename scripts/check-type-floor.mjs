#!/usr/bin/env node
/* ═══ D-019 — pavimento tipografico (audit U-10, F28) ═══
 * Testo minimo 12 px; 11 px solo per eyebrow ed etichette MAIUSCOLE.
 * - i token --font-size-2xs e --font-size-xs (11 px) compaiono solo in regole
 *   con `text-transform: uppercase`;
 * - i token da sm a lg hanno un pavimento ≥ 12 px (max(rem, Npx)), così non
 *   scendono sotto con la radice a 14,25 px dei viewport stretti.
 * Le regole dei temi d'esplorazione ([data-theme]) restano fuori. */
import { readFileSync } from "node:fs";

const FILES = ["src/styles/theme.css", "src/styles/layout.css"];
const problems = [];

for (const file of FILES) {
  const css = readFileSync(file, "utf8");
  const re = /([^{}]+)\{([^{}]*)\}/g;
  let m;
  while ((m = re.exec(css))) {
    const selector = m[1].trim().split("\n").pop().trim();
    const body = m[2];
    if (selector.startsWith(":root") || selector.startsWith("[data-theme")) continue;
    if (/font-size\s*:[^;]*var\(--font-size-(2xs|xs)\)/.test(body) && !/uppercase/.test(body)) {
      const line = css.slice(0, m.index).split("\n").length;
      problems.push(`${file}:${line} ${selector} — 11 px su testo non maiuscolo (usa --font-size-sm)`);
    }
  }
}

const theme = readFileSync("src/styles/theme.css", "utf8");
const floor = (token) => {
  const value = theme.match(new RegExp(`--font-size-${token}:\\s*([^;]+);`))?.[1] ?? "";
  const px = value.match(/max\([^)]*,\s*(\d+(?:\.\d+)?)px\)/)?.[1];
  return px ? Number(px) : null;
};
for (const [token, min] of [["2xs", 11], ["xs", 11], ["sm", 12], ["base", 12], ["md", 12], ["lg", 12]]) {
  const px = floor(token);
  if (px === null || px < min) problems.push(`--font-size-${token}: pavimento ${px ?? "assente"} px, serve max(…, ≥${min}px)`);
}

if (problems.length) {
  console.error(`✗ check:type-floor — ${problems.length} problemi:\n  ${problems.join("\n  ")}`);
  process.exit(1);
}
console.log("✓ check:type-floor — testo ≥ 12 px, 11 px solo maiuscolo");
