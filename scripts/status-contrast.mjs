/* ═══ FW-13 — contrasto dei ruoli di stato ═══
 * Ogni --status-{ruolo}-fg deve leggersi (≥ 4,5:1) sul proprio fondo
 * --status-{ruolo}-bg (12% del colore sopra la superficie) e sulle superfici
 * su cui compare (card, pagina, surface-low, surface-container), in chiaro
 * (:root) e in scuro (.dark). Le icone (--status-*-icon) hanno la stessa
 * tinta del testo, quindi superano anche la soglia di 3:1.
 * Usato da scripts/check-type-floor.mjs. */

export const STATUS_ROLES = ["positive", "caution", "blocking", "neutral", "recommended"];
const SURFACES = ["--card", "--background", "--surface-container-low", "--surface-container"];
const TEXT_MIN = 4.5;

function block(css, selector) {
  const start = css.search(new RegExp(`(^|\\n)${selector.replace(/[.[\]]/g, "\\$&")}\\s*\\{`));
  if (start === -1) return "";
  const open = css.indexOf("{", start);
  let depth = 0;
  for (let i = open; i < css.length; i++) {
    if (css[i] === "{") depth++;
    else if (css[i] === "}" && --depth === 0) return css.slice(open + 1, i);
  }
  return "";
}

function definitions(source) {
  const clean = source.replace(/\/\*[\s\S]*?\*\//g, "");
  const map = new Map();
  for (const m of clean.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) map.set(m[1], m[2].trim());
  return map;
}

function resolver(...layers) {
  const resolve = (name, seen = new Set()) => {
    if (seen.has(name)) return null;
    seen.add(name);
    const value = layers.map((layer) => layer.get(name)).find((v) => v !== undefined);
    if (!value) return null;
    if (/^#[0-9a-f]{6}$/i.test(value)) return value;
    const alias = value.match(/^var\((--[\w-]+)\)$/);
    return alias ? resolve(alias[1], seen) : null;
  };
  return resolve;
}

const rgb = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
const mix = (a, b, p) => a.map((v, i) => v * p + b[i] * (1 - p));
const luminance = (c) => {
  const [r, g, b] = c.map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
export const contrast = (a, b) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

/** Restituisce l'elenco dei problemi (vuoto se tutto è AA). */
export function statusContrastProblems(themeCss) {
  const root = definitions(block(themeCss, ":root"));
  const dark = definitions(block(themeCss, ".dark"));
  const themes = { chiaro: resolver(root), scuro: resolver(dark, root) };
  const problems = [];
  for (const [theme, resolve] of Object.entries(themes)) {
    for (const role of STATUS_ROLES) {
      const fgHex = resolve(`--status-${role}-fg`);
      if (!fgHex) {
        problems.push(`${theme}: --status-${role}-fg non si risolve in un colore T1`);
        continue;
      }
      const fg = rgb(fgHex);
      for (const surface of SURFACES) {
        const surfaceHex = resolve(surface);
        if (!surfaceHex) continue;
        const base = rgb(surfaceHex);
        // Il neutro usa la superficie stessa come fondo; gli altri un velo al 12%.
        const bg = role === "neutral" ? base : mix(fg, base, 0.12);
        const ratio = contrast(fg, bg);
        if (ratio < TEXT_MIN) {
          problems.push(`${theme}: --status-${role}-fg su ${surface} ${ratio.toFixed(2)}:1 (< ${TEXT_MIN}:1)`);
        }
      }
    }
    problems.push(...blockingSurfaceProblems(theme, resolve, root));
  }
  return problems;
}

/* Esito negativo marcato (30/10/2026): sul fondo pieno del blocco
 * (--status-blocking-surface, una miscela opaca) si leggono titolo, testo,
 * testo muto e link; il contrassegno ha l'icona ≥ 3:1 sul suo disco. */
const ON_BLOCKING_SURFACE = ["--status-blocking-fg", "--text-default", "--text-muted", "--cta"];
const ICON_MIN = 3;

function blockingSurfaceProblems(theme, resolve, root) {
  const value = root.get("--status-blocking-surface") ?? "";
  const m = value.match(/^color-mix\(in srgb,\s*var\((--[\w-]+)\)\s+([\d.]+)%,\s*var\((--[\w-]+)\)\)$/);
  if (!m) return [`--status-blocking-surface non è una miscela color-mix(in srgb, var(--a) N%, var(--b))`];
  const [tint, base] = [resolve(m[1]), resolve(m[3])];
  if (!tint || !base) return [`${theme}: --status-blocking-surface non si risolve in colori T1`];
  const bg = mix(rgb(tint), rgb(base), Number(m[2]) / 100);
  const problems = [];
  for (const token of ON_BLOCKING_SURFACE) {
    const hex = resolve(token);
    const ratio = hex ? contrast(rgb(hex), bg) : 0;
    if (ratio < TEXT_MIN) problems.push(`${theme}: ${token} su --status-blocking-surface ${ratio.toFixed(2)}:1 (< ${TEXT_MIN}:1)`);
  }
  const [mark, disc] = [resolve("--status-blocking-mark-fg"), resolve("--status-blocking-icon")];
  const markRatio = mark && disc ? contrast(rgb(mark), rgb(disc)) : 0;
  if (markRatio < ICON_MIN) problems.push(`${theme}: --status-blocking-mark-fg su --status-blocking-icon ${markRatio.toFixed(2)}:1 (< ${ICON_MIN}:1)`);
  return problems;
}
