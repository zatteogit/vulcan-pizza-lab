import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const GUARD = resolve(dirname(fileURLToPath(import.meta.url)), "check-design-tokens.mjs");
const root = mkdtempSync(join(tmpdir(), "vulcan-token-guard-"));

function write(file, content) {
  const absolute = join(root, file);
  mkdirSync(dirname(absolute), { recursive: true });
  writeFileSync(absolute, content);
}

function runGuard() {
  return spawnSync(process.execPath, [GUARD], {
    cwd: root,
    encoding: "utf8",
  });
}

try {
  const visualLiterals = JSON.stringify(
    { color: "#D04A2F", scrim: "rgba(28,25,23)", font: "DM Sans" },
    null,
    2,
  );
  write(
    "src/app/i18n/showcase-messages.it.ts",
    `export const SHOWCASE_MESSAGES_IT = ${visualLiterals};\n`,
  );
  write(
    "src/app/i18n/ui-messages.it.ts",
    `export const UI_MESSAGES_IT = ${visualLiterals};\n`,
  );

  const dirty = runGuard();
  const dirtyOutput = `${dirty.stdout}${dirty.stderr}`;
  assert.equal(dirty.status, 1);
  assert.match(dirtyOutput, /src\/app\/i18n\/ui-messages\.it\.ts/);
  assert.doesNotMatch(dirtyOutput, /src\/app\/i18n\/showcase-messages\.it\.ts/);
  assert.match(dirtyOutput, /hex-color/);
  assert.match(dirtyOutput, /rgba-nonscrim/);
  assert.match(dirtyOutput, /font-literal/);

  write(
    "src/app/i18n/ui-messages.it.ts",
    'export const UI_MESSAGES_IT = { ready: "Pronto" };\n',
  );
  const clean = runGuard();
  assert.equal(clean.status, 0, `${clean.stdout}${clean.stderr}`);

  console.log("check-design-tokens tests: ok");
} finally {
  rmSync(root, { recursive: true, force: true });
}
