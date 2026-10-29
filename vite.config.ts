import { defineConfig, type Plugin } from "vite";
import path from "path";
import fs from "fs";
import { execFileSync } from "child_process";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { fillBrandPlaceholders } from "./src/app/config/brand";
import { resolveEditionFile } from "./scripts/edition-path.mjs";

/* Nome del prodotto in index.html e public/site.webmanifest: i file sorgente
   contengono %BRAND_NAME% / %BRAND_FULL_NAME% e il plugin li riempie da
   src/app/config/brand.ts. public/ viene copiato così com'è, quindi il
   manifest si riempie dopo la copia (build) e al volo (dev). Il file resta in
   public/ ed è JSON valido anche con i segnaposto (lo legge ds-tier-guard). */
/* Budget D-059 (integrazione ondata 2): il prodotto non usa il trascinamento
   di motion (l'unico, lo swipe dei pannelli di RecipeOutput, non poteva mai
   partire ed è stato tolto), ma il componente `motion` porta comunque con sé
   i gesti drag e pan (~4 kB gzip). In `vite build` la loro definizione diventa vuota; animazioni, gesti
   tap/hover/focus e layout condivisi (`layoutId`) restano. Il test
   src/app/components/ds/motion-no-drag.test.ts fallisce se il prodotto
   comincia a usare drag o pan: in quel caso togliere questo plugin. */
function motionWithoutDragPlugin(): Plugin {
  return {
    name: "vulcan-motion-without-drag",
    apply: "build",
    enforce: "pre",
    load(id) {
      if (id.replace(/\\/g, "/").endsWith("framer-motion/dist/es/motion/features/drag.mjs")) {
        return "export const drag = {};";
      }
      return null;
    },
  };
}

function brandPlugin(): Plugin {
  const MANIFEST = "site.webmanifest";
  let outDir = path.resolve(__dirname, "dist");
  return {
    name: "vulcan-brand",
    configResolved(config) {
      outDir = path.resolve(config.root, config.build.outDir);
    },
    transformIndexHtml: (html) => fillBrandPlaceholders(html),
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url?.split("?")[0] !== `/${MANIFEST}`) return next();
        const source = path.resolve(server.config.root, "public", MANIFEST);
        res.setHeader("Content-Type", "application/manifest+json");
        res.end(fillBrandPlaceholders(fs.readFileSync(source, "utf8")));
      });
    },
    writeBundle() {
      const target = path.join(outDir, MANIFEST);
      if (fs.existsSync(target)) {
        fs.writeFileSync(target, fillBrandPlaceholders(fs.readFileSync(target, "utf8")));
      }
    },
  };
}

// Custom Vite plugin to auto-save visual debug annotations into the local workspace
function saveAnnotationsPlugin() {
  return {
    name: "vite-plugin-save-annotations",
    configureServer(server: any) {
      server.middlewares.use((req: any, res: any, next: any) => {
        if (req.url === "/api/save-annotations" && req.method === "POST") {
          let body = "";
          req.on("data", (chunk: any) => {
            body += chunk;
          });
          req.on("end", () => {
            try {
              const incoming = JSON.parse(body);
              const filePath = path.resolve(__dirname, "vulcan-debug-registry.json");
              let merged = incoming;
              if (fs.existsSync(filePath)) {
                try {
                  const existing = JSON.parse(fs.readFileSync(filePath, "utf8"));
                  if (Array.isArray(existing) && Array.isArray(incoming)) {
                    const byId = new Map();
                    for (const item of [...existing, ...incoming]) {
                      if (item && typeof item.id === "string") {
                        const existingItem = byId.get(item.id);
                        const itemTime = typeof item.updatedAt === "number" ? item.updatedAt : 0;
                        const existingTime = existingItem && typeof existingItem.updatedAt === "number" ? existingItem.updatedAt : 0;
                        if (!existingItem || itemTime > existingTime) {
                          byId.set(item.id, item);
                        }
                      }
                    }
                    merged = Array.from(byId.values());
                  }
                } catch (e) {
                  // fallback to incoming if corrupt
                }
              }
              fs.writeFileSync(
                filePath,
                JSON.stringify(merged, null, 2),
                "utf8"
              );
              res.statusCode = 200;
              res.setHeader("Content-Type", "application/json");
              res.end(JSON.stringify({ success: true }));
            } catch (e: any) {
              res.statusCode = 500;
              res.setHeader("Content-Type", "application/json");
              res.end(JSON.stringify({ error: e.message }));
            }
          });
        } else if (req.url === "/api/save-annotations" && req.method === "GET") {
          try {
            const filePath = path.resolve(__dirname, "vulcan-debug-registry.json");
            if (fs.existsSync(filePath)) {
              const data = fs.readFileSync(filePath, "utf8");
              res.statusCode = 200;
              res.setHeader("Content-Type", "application/json");
              res.end(data);
            } else {
              res.statusCode = 200;
              res.setHeader("Content-Type", "application/json");
              res.end(JSON.stringify([]));
            }
          } catch (e: any) {
            res.statusCode = 500;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ error: e.message }));
          }
        } else if (req.url === "/api/config" && req.method === "GET") {
          try {
            const filePath = path.resolve(__dirname, "vulcan-debug-config.json");
            if (fs.existsSync(filePath)) {
              const data = fs.readFileSync(filePath, "utf8");
              res.statusCode = 200;
              res.setHeader("Content-Type", "application/json");
              res.end(data);
            } else {
              res.statusCode = 200;
              res.setHeader("Content-Type", "application/json");
              res.end(JSON.stringify({ theme: "" }));
            }
          } catch (e: any) {
            res.statusCode = 500;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ error: e.message }));
          }
        } else if (req.url === "/api/config" && req.method === "POST") {
          let body = "";
          req.on("data", (chunk: any) => {
            body += chunk;
          });
          req.on("end", () => {
            try {
              const incoming = JSON.parse(body);
              const filePath = path.resolve(__dirname, "vulcan-debug-config.json");
              fs.writeFileSync(filePath, JSON.stringify({ theme: incoming.theme ?? "" }, null, 2), "utf8");
              res.statusCode = 200;
              res.setHeader("Content-Type", "application/json");
              res.end(JSON.stringify({ success: true, theme: incoming.theme ?? "" }));
            } catch (e: any) {
              res.statusCode = 500;
              res.setHeader("Content-Type", "application/json");
              res.end(JSON.stringify({ error: e.message }));
            }
          });
        } else {
          next();
        }
      });
    }
  };
}

/* FW-15 (S01-B-01): data e commit della build, mostrati in Informazioni e in
   «Metodo e fonti». Workers Builds espone il commit; altrimenti git, se c'è. */
function buildInfo(): { date: string; commit: string } {
  let commit = process.env.WORKERS_CI_COMMIT_SHA?.slice(0, 7) ?? "";
  if (!commit) {
    try {
      commit = execFileSync("git", ["rev-parse", "--short", "HEAD"], { cwd: __dirname, stdio: ["ignore", "pipe", "ignore"] })
        .toString()
        .trim();
    } catch {
      commit = "";
    }
  }
  return { date: new Date().toISOString().slice(0, 10), commit };
}

export default defineConfig(({ command }) => ({
  define: { __VULCAN_BUILD__: JSON.stringify(buildInfo()) },
  plugins: [react(), tailwindcss(), saveAnnotationsPlugin(), brandPlugin(), motionWithoutDragPlugin()],
  resolve: {
    alias: [
      { find: "@", replacement: path.resolve(__dirname, "./src") },
      // Edizione della build (VULCAN_EDITION): docs/ambienti-ed-edizioni.md.
      { find: "@vulcan/edition", replacement: resolveEditionFile() },
      /* Budget D-059: gli "exports" di react-router 7 puntano sempre alla
         build di sviluppo (avvisi e controlli in più). In `vite build` si usa
         quella di produzione che il pacchetto pubblica accanto (−~3 kB gzip);
         in sviluppo restano gli avvisi. */
      ...(command === "build"
        ? [{ find: /^react-router$/, replacement: path.resolve(__dirname, "node_modules/react-router/dist/production/index.mjs") }]
        : []),
    ],
  },

  /* === Dev server === */
  server: {
    port: 5174,
    strictPort: true,
    open: true,
    /* SPA fallback: serve index.html per qualsiasi route (React Router) */
    historyApiFallback: true,
  } as any,

  /* === Preview (serve dist/) === */
  preview: {
    port: 4173,
    open: true,
  },

  /* === Build === */
  build: {
    outDir: "dist",
    /* P-2: le mappe si generano (per il debug degli errori) ma i bundle non le
       referenziano: in produzione il sorgente non è leggibile dal browser. */
    sourcemap: "hidden",
    // Keep the existing transfer budget while adding recipe safety metadata.
    // No unsafe transforms or property mangling: public recipe keys stay intact.
    minify: "terser",
    /* ecma 2020 = il target della build (Vite "modules"): niente forme ES5
       né il ripiego per Safari 10, che il target esclude già. */
    terserOptions: { ecma: 2020, safari10: false, compress: { passes: 2 }, format: { comments: false } },
    /* Limita i warning per bundle size durante il prototipo */
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      output: {
        /* Budget D-059 (ondata 2 dell'audit): i chunk condivisi sotto ~4 kB
           senza effetti collaterali (icone, piccoli componenti DS) si fondono
           in un chunk caricato nelle stesse condizioni. Meno file, meno
           involucri e gzip più efficace: −4 kB sul codice senza lingue.
           Integrazione ondata 2 (FW-04 + D-062/D-063): 6000 (−1,4 kB). */
        experimentalMinChunkSize: 6000,
        manualChunks: {
          "vendor-react": [
            "react",
            "react-dom",
            "react-router",
          ],
          /* "motion" è un wrapper: senza framer-motion qui, i ~120 kB veri
             finivano nel chunk principale (audit bundle lug 2026). */
          "vendor-motion": ["motion", "framer-motion"],
          /* Catalogo UI italiano (lingua di riserva, sempre caricato): file a
             sé accanto al chunk principale, che altrimenti supera i 100 kB. */
          "ui-messages-it": [path.resolve(__dirname, "src/app/i18n/ui-messages.it.ts")],
        },
      },
    },
  },

  /* File types to support raw imports. Never add .css, .tsx, or .ts files. */
  assetsInclude: ["**/*.svg", "**/*.csv"],
}));
