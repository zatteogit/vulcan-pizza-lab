/* ═══ Build del Worker (D-049) ═══
 * Il Worker importa il motore per il server MCP (/mcp). Il motore passa dai
 * dati dei condimenti, che importano le loro immagini per la UI: al Worker
 * non servono, quindi qui diventano moduli vuoti invece di finire nel bundle.
 * wrangler esegue questo script prima di `dev` e `deploy` ([build] in
 * wrangler.toml) e carica il file prodotto così com'è (no_bundle). */
import { build } from "esbuild";
import { resolveEditionFile } from "./edition-path.mjs";

const EMPTY = [".webp", ".png", ".jpg", ".jpeg", ".svg", ".gif", ".avif", ".mp4", ".webm", ".csv"];

await build({
  entryPoints: ["worker/index.ts"],
  outfile: ".worker-dist/index.js",
  bundle: true,
  format: "esm",
  platform: "neutral",
  target: "es2022",
  minify: true,
  sourcemap: false,
  // Stessa edizione dell'app: il server MCP vede lo stesso catalogo.
  alias: { "@vulcan/edition": resolveEditionFile() },
  loader: Object.fromEntries(EMPTY.map((ext) => [ext, "empty"])),
  logLevel: "warning",
});
