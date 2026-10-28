/* ═══ Deploy di un'edizione dedicata (docs/ambienti-ed-edizioni.md) ═══
 *
 *   node scripts/deploy-edition.mjs <id> <test|production> [--dry-run]
 *
 * Costruisce l'app con VULCAN_EDITION=<id> e la pubblica sul suo Worker:
 *   test        → vulcan-<id>-test   (anteprima per il partner, dietro Cloudflare Access)
 *   production  → vulcan-<id>        (solo con contratto; dal workflow con approvazione)
 * La generalista («vulcan») non passa da qui: ha i suoi Worker (vulcan-pizza-lab,
 * vulcan-test) con D1, accesso e strumenti. Le edizioni non hanno D1 né strumenti
 * (/dev, /cms, /design-system restano spenti anche in test: le vede il partner). */
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import { resolveEditionFile } from "./edition-path.mjs";

const [id, target, ...flags] = process.argv.slice(2);
const dryRun = flags.includes("--dry-run");

if (!id || !["test", "production"].includes(target)) {
  console.error("Uso: node scripts/deploy-edition.mjs <id> <test|production> [--dry-run]");
  process.exit(2);
}
if (id === "vulcan") {
  console.error("La generalista si pubblica con `npm run deploy:test` o dal workflow deploy-production.");
  process.exit(2);
}

const edition = JSON.parse(fs.readFileSync(resolveEditionFile(id), "utf8"));
if (edition.kind === "demo" && target === "production") {
  console.error(`«${id}» è una demo con marchio inventato: resta in test.`);
  process.exit(2);
}

const worker = target === "test" ? `vulcan-${id}-test` : `vulcan-${id}`;
const env = { ...process.env, VULCAN_EDITION: id, VITE_ENABLE_TOOLS: "" };
const run = (cmd, args) => {
  console.log(`$ ${[cmd, ...args].join(" ")}`);
  execFileSync(cmd, args, { stdio: "inherit", env });
};

run("npm", ["run", "build"]);
const deploy = ["wrangler", "deploy", "--env", "edition", "--name", worker];
if (edition.indexing === "noindex") deploy.push("--var", "NOINDEX:1");
// In test le edizioni si vedono solo dietro Cloudflare Access (fail-closed).
if (target === "test") deploy.push("--var", "REQUIRE_ACCESS:1");
if (dryRun) deploy.push("--dry-run");
run("npx", deploy);
console.log(`✓ ${id} → ${worker}${dryRun ? " (dry run)" : ""}`);
