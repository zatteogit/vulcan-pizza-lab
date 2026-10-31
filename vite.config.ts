import { defineConfig, loadEnv, type Plugin } from "vite";
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

/* Budget CSS (30/10/2026): Tailwind genera le utility leggendo tutto src/,
   compresi gli strumenti interni (/dev, /cms, /design-system: P-1), che in
   produzione non entrano in dist/. Le utility citate solo lì (circa 2,8 kB
   gzip) finivano nel foglio di stile di ogni utente senza corrispondere a
   nessun elemento. Nelle build senza strumenti questi file escono dalla
   scansione; se uno di loro entra nel bundle (le sue utility mancherebbero)
   la build fallisce. In sviluppo e in `build:test` il foglio non cambia. */
const TOOL_ONLY_SOURCES = [
  "src/app/components/design-system/",
  /* Non debug-overlay.tsx: è nel bundle (in produzione rende null). */
  "src/app/features/dev-tools/debug/",
  "src/app/features/dev-tools/dev-tools.tsx",
  "src/app/features/dev-tools/engine-test-suite.tsx",
  "src/app/features/dev-tools/style-editor-tab.tsx",
  "src/app/features/dev-tools/theme-switcher.tsx",
  "src/app/features/recipe/feedback-analysis.tsx",
  "src/app/pages/cms.tsx",
  "src/app/pages/design-system.tsx",
  "src/app/pages/dev.tsx",
];

function toolOnlyTailwindSourcesPlugin(toolsEnabled: boolean): Plugin {
  const stylesDir = path.resolve(__dirname, "src/styles");
  const entry = path.join(stylesDir, "index.css");
  const toRepo = (id: string) => path.relative(__dirname, id.split("?")[0]).replace(/\\/g, "/");
  return {
    name: "vulcan-tool-only-tailwind-sources",
    apply: "build",
    enforce: "pre",
    transform(code, id) {
      if (toolsEnabled || id !== entry) return null;
      const exclusions = TOOL_ONLY_SOURCES.map(
        (source) => `@source not "${path.relative(stylesDir, path.resolve(__dirname, source)).replace(/\\/g, "/")}";`,
      );
      return { code: `${code}\n${exclusions.join("\n")}\n`, map: null };
    },
    generateBundle(_options, bundle) {
      if (toolsEnabled) return;
      /* Solo i moduli finiti nei chunk: Rollup carica anche quelli dietro un
         import() che la costante TOOLS_ENABLED rende morto, poi li scarta. */
      const leaked = Object.values(bundle)
        .flatMap((item) => (item.type === "chunk" ? Object.keys(item.modules) : []))
        .map(toRepo)
        .filter((file) => TOOL_ONLY_SOURCES.some((source) => file.startsWith(source)));
      if (leaked.length > 0) {
        this.error(`File degli strumenti nel bundle di produzione (le loro utility Tailwind non sono generate): ${leaked.join(", ")}`);
      }
    },
  };
}

/* Budget D-059 (30/10/2026): i testi, italiano compreso, sono bundle lazy
   (src/app/features/cms/locales/<lingua>.ts) e main.tsx aspetta quello della
   lingua di avvio prima del primo render. Per non aggiungere un giro di rete,
   uno script in <head> sceglie la lingua con la stessa regola di
   bootLocaleId() (locales/index.ts: stato salvato, altrimenti il browser) e
   chiede con modulepreload i suoi chunk insieme a quello d'ingresso. Solo i
   chunk della lingua di avvio: le altre non si scaricano. */
function localePreloadPlugin(): Plugin {
  let base = "/";
  return {
    name: "vulcan-locale-preload",
    apply: "build",
    configResolved(config) {
      base = config.base;
    },
    transformIndexHtml: {
      order: "post",
      handler(html, ctx) {
        const bundle = ctx.bundle;
        if (!bundle) return html;
        const chunkOf = (file: string) => {
          const item = bundle[file];
          return item?.type === "chunk" ? item : undefined;
        };
        const entry = Object.values(bundle).find((item) => item.type === "chunk" && item.isEntry);
        if (!entry) return html;
        const eager = new Set<string>();
        const markEager = (file: string) => {
          if (eager.has(file)) return;
          eager.add(file);
          chunkOf(file)?.imports.forEach(markEager);
        };
        markEager(entry.fileName);
        const files: Record<string, string[]> = {};
        for (const item of Object.values(bundle)) {
          if (item.type !== "chunk" || !item.isDynamicEntry) continue;
          const id = item.facadeModuleId?.replace(/\\/g, "/").match(/\/src\/app\/features\/cms\/locales\/([a-z]{2})\.ts$/)?.[1];
          if (!id) continue;
          const list: string[] = [];
          const collect = (file: string) => {
            if (eager.has(file) || list.includes(file)) return;
            list.push(file);
            chunkOf(file)?.imports.forEach(collect);
          };
          collect(item.fileName);
          files[id] = list.map((file) => base + file);
        }
        if (!files.it) throw new Error("localePreloadPlugin: manca il chunk della lingua italiana");
        const code = `(function(m){try{var id=null,raw=localStorage.getItem("vulcan_cms");if(raw){var s=raw.match(/"locale":\\{"id":"([a-z]{2})"/);id=s&&m[s[1]]?s[1]:"it"}else{var l=navigator.languages||[navigator.language];for(var i=0;i<l.length&&!id;i++){var c=String(l[i]).split("-")[0].toLowerCase();if(c==="it"||m[c])id=c}id=id||"en"}var f=m[id]||m.it;for(var j=0;j<f.length;j++){var k=document.createElement("link");k.rel="modulepreload";k.crossOrigin="";k.href=f[j];document.head.appendChild(k)}}catch(e){}})(${JSON.stringify(files)});`;
        /* Prima del foglio di stile: uno script dopo un foglio di stile
           aspetta che il CSS sia scaricato (su 4G lento il bundle partiva
           1,7 s dopo). Non in cima a <head>: il meta charset deve restare nei
           primi 1024 byte. */
        const stylesheet = html.search(/<link rel="stylesheet"/);
        if (stylesheet < 0) throw new Error("localePreloadPlugin: manca il foglio di stile in index.html");
        return `${html.slice(0, stylesheet)}<script>${code}</script>\n    ${html.slice(stylesheet)}`;
      },
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

export default defineConfig(({ command, mode }) => ({
  define: { __VULCAN_BUILD__: JSON.stringify(buildInfo()) },
  plugins: [
    react(),
    /* Prima di tailwindcss(), che compila index.css; strumenti attivi con la
       stessa regola di TOOLS_ENABLED (src/app/config/tools.ts). */
    toolOnlyTailwindSourcesPlugin(command === "serve" || loadEnv(mode, __dirname, "VITE_").VITE_ENABLE_TOOLS === "1"),
    tailwindcss(),
    saveAnnotationsPlugin(),
    brandPlugin(),
    motionWithoutDragPlugin(),
    localePreloadPlugin(),
  ],
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
           Integrazione ondata 2 (FW-04 + D-062/D-063): 6000 (−1,4 kB).
           Illustrazioni Impara, lotto 8: 20000 per ridurre gli involucri
           dei piccoli chunk. Lingue e strumenti restano separati; il controllo
           budget verifica anche che le lingue non entrino nel codice comune. */
        experimentalMinChunkSize: 20000,
        manualChunks(id) {
          const file = id.replace(/\\/g, "/");
          if (/\/node_modules\/(react|react-dom|react-router|scheduler)\//.test(file)) return "vendor-react";
          /* "motion" è un wrapper: senza framer-motion qui, i ~120 kB veri
             finivano nel chunk principale (audit bundle lug 2026). */
          if (/\/node_modules\/(motion|framer-motion|motion-dom|motion-utils)\//.test(file)) return "vendor-motion";
          /* Il catalogo UI italiano non ha più un chunk proprio (budget D-059,
             30/10/2026): entra nel bundle `it-…` con gli altri testi italiani.
             Le traduzioni dei condimenti (D-065) hanno invece un chunk
             per lingua accanto al catalogo della lingua (si caricano insieme).
             Da sole il giapponese era a 98,5 kB sul tetto di 100 del chunk. */
          const toppings = file.match(/\/src\/app\/data\/topping-i18n\/([a-z]{2})\.ts$/);
          if (toppings) return `${toppings[1]}-toppings`;
          return undefined;
        },
      },
    },
  },

  /* File types to support raw imports. Never add .css, .tsx, or .ts files. */
  assetsInclude: ["**/*.svg", "**/*.csv"],
}));
