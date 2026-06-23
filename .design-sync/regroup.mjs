#!/usr/bin/env node
// regroup.mjs — post-build: unifica i gruppi delle card. Il gruppo del DS pane
// viene dal commento `<!-- @dsCard group="…" -->` (prima riga di ogni .html),
// che emit tiene FUORI dall'hash del contenuto (regroup = non un cambio di
// contratto). Qui rimappiamo i gruppi derivati-da-cartella verso etichette
// pulite. Esegui dopo package-build, prima di guard/push.
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
const MAP = { ds: 'componenti', app: 'componenti' }; // foundations resta com'è
const COMP = resolve('ds-bundle', 'components');
let n = 0;
for (const grp of existsSync(COMP) ? readdirSync(COMP) : []) {
  const to = MAP[grp];
  if (!to) continue;
  for (const name of readdirSync(join(COMP, grp))) {
    const html = join(COMP, grp, name, `${name}.html`);
    if (!existsSync(html)) continue;
    const s = readFileSync(html, 'utf8');
    const out = s.replace(/(<!--\s*@dsCard group=")[^"]*(")/, `$1${to}$2`);
    if (out !== s) { writeFileSync(html, out); n++; }
  }
}
console.log(`regroup: ${n} card → "componenti" (ds+app unificati; foundations invariato)`);
