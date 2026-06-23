#!/usr/bin/env node
// verify-breakpoints.mjs — GUARD: renderizza ogni componente del DS con gli
// artefatti REALI (gli stessi che claude.ai/design carica: styles.css +
// _ds_bundle.js + closure) a più breakpoint, e segnala overflow orizzontale,
// errori console/page, render vuoti o placeholder d'errore (⚠).
//
// Esegui:  NODE_PATH="$PWD/.ds-sync/node_modules" node .design-sync/verify-breakpoints.mjs
// Output:  .design-sync/.cache/breakpoints/<Name>__<width>.png + report.json
// Exit:    0 = nessun flag; 1 = almeno un componente segnalato (è il cancello).
import { readdirSync, mkdirSync, writeFileSync, existsSync, rmSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';

// playwright vive in .ds-sync/node_modules (gli script stagiati della skill).
const require = createRequire(import.meta.url);
const pwPath = require.resolve('playwright', { paths: [resolve('.ds-sync', 'node_modules')] });
const { chromium } = require(pwPath);

const OUT = resolve('ds-bundle');
const COMP = join(OUT, 'components');
const VDIR = resolve('.design-sync', '.cache', 'breakpoints');
rmSync(VDIR, { recursive: true, force: true });
mkdirSync(VDIR, { recursive: true });

// Mobile / tablet / desktop. La card su claude.ai/design può vivere a qualsiasi
// di queste larghezze.
const WIDTHS = [375, 768, 1280];

const comps = [];
for (const g of readdirSync(COMP)) {
  const gp = join(COMP, g);
  for (const name of readdirSync(gp)) {
    const html = join(gp, name, `${name}.html`);
    if (existsSync(html)) comps.push({ group: g, name, html });
  }
}
comps.sort((a, b) => a.name.localeCompare(b.name));

const browser = await chromium.launch();
const report = [];
for (const c of comps) {
  for (const w of WIDTHS) {
    const page = await browser.newPage({ viewport: { width: w, height: 900 } });
    const errors = [];
    // React dev-warnings (il bundle gira con NODE_ENV=development) sono rumore
    // uniforme, non glitch per-componente. Tieni solo errori veri.
    const isDevWarning = (t) => /^Warning:/.test(t) || /unique "key"|Each child in a list/.test(t);
    page.on('console', (m) => { if (m.type() === 'error' && !isDevWarning(m.text())) errors.push(m.text()); });
    page.on('pageerror', (e) => { const t = String(e && e.message || e); if (!isDevWarning(t)) errors.push(t); });
    try {
      await page.goto(pathToFileURL(c.html).href, { waitUntil: 'networkidle', timeout: 15000 });
    } catch (e) {
      errors.push('goto: ' + (e && e.message || e));
    }
    await page.waitForTimeout(450); // font + spring settle
    const m = await page.evaluate((vw) => {
      const g = document.getElementById('g');
      const txt = document.body.innerText || '';
      // I cell hanno overflow:hidden → un preview troppo largo viene TAGLIATO
      // (non causa overflow del documento). Misura il clipping per-cella.
      const cells = [...document.querySelectorAll('.ds-cell, .ds-single')];
      let clip = 0;
      for (const c of cells) {
        const d = c.scrollWidth - c.clientWidth;
        if (d > clip) clip = d;
      }
      return {
        scrollW: document.documentElement.scrollWidth,
        overflow: document.documentElement.scrollWidth > vw + 1,
        clipPx: clip,
        clipped: clip > 4,
        warn: txt.includes('⚠'),
        empty: !g || (g.children.length === 0) || (g.innerText.trim() === '' && g.querySelectorAll('svg,img,canvas,input,button').length === 0),
      };
    }, w);
    await page.screenshot({ path: join(VDIR, `${c.name}__${w}.png`), fullPage: true });
    report.push({ name: c.name, group: c.group, width: w, ...m, errors: errors.slice(0, 3) });
    await page.close();
  }
}
// Contact sheet per breakpoint: tutte le card di una larghezza affiancate per
// la review visiva (svarioni sottili non escono come overflow/errori).
for (const w of WIDTHS) {
  const cards = comps.map((c) =>
    `<figure style="margin:0"><figcaption style="font:600 12px system-ui;color:#374151;padding:4px 0">${c.name} <span style="color:#9ca3af">${c.group}</span></figcaption>` +
    `<img src="${pathToFileURL(join(VDIR, `${c.name}__${w}.png`)).href}" style="width:${w}px;border:1px solid #e5e7eb;border-radius:6px;display:block"></figure>`
  ).join('');
  const html = `<!doctype html><meta charset=utf-8><body style="margin:0;padding:16px;background:#fafafa">` +
    `<h3 style="font:700 14px system-ui">Breakpoint ${w}px — ${comps.length} componenti</h3>` +
    `<div style="display:flex;flex-wrap:wrap;gap:16px;align-items:flex-start">${cards}</div>`;
  const p = await (await chromium.launch()).newPage({ viewport: { width: Math.min(3 * w + 80, 4000), height: 800 } });
  await p.setContent(html, { waitUntil: 'networkidle' });
  await p.screenshot({ path: join(VDIR, `_sheet__${w}.png`), fullPage: true });
  await p.context().browser().close();
}
await browser.close();
writeFileSync(join(VDIR, 'report.json'), JSON.stringify(report, null, 2));

// Allowlist: issue note e accettate (non-bloccanti). Tieni la ragione vicina.
const KNOWN = [
  { name: 'RecommendedStyles', test: (r) => r.errors.some((e) => /ERR_FILE_NOT_FOUND/.test(e)) && !r.overflow && !r.clipped,
    why: 'foto stile stubate dall’override (loader empty) — fallback grigio, non un glitch di layout' },
];
const isKnown = (r) => KNOWN.some((k) => k.name === r.name && k.test(r));
const flagged = report.filter((r) => (r.overflow || r.clipped || r.warn || r.empty || r.errors.length) && !isKnown(r));
const known = report.filter(isKnown);
if (known.length) console.log(`(${known.length} render con issue NOTE/accettate: ${[...new Set(known.map((k) => k.name))].join(', ')})`);
console.log(`checked ${comps.length} components × ${WIDTHS.length} widths (${report.length} renders)`);
if (!flagged.length) { console.log('✓ nessun flag su tutti i breakpoint'); process.exit(0); }
console.log(`⚠ ${flagged.length} flag:`);
for (const f of flagged) {
  const tags = [f.overflow && `OVERFLOW(${f.scrollW})`, f.clipped && `CLIP(+${f.clipPx}px)`, f.warn && 'WARN⚠', f.empty && 'EMPTY', f.errors.length && `ERR(${f.errors[0].slice(0, 50)})`].filter(Boolean).join(' ');
  console.log(`  ${f.name} @${f.width}px  ${tags}`);
}
process.exit(1);
