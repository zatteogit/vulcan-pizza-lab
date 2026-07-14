import { defineConfig } from "vite";
import path from "path";
import fs from "fs";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";

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

export default defineConfig({
  plugins: [react(), tailwindcss(), saveAnnotationsPlugin()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
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
    sourcemap: true,
    /* Limita i warning per bundle size durante il prototipo */
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      output: {
        manualChunks: {
          "vendor-react": [
            "react",
            "react-dom",
            "react-router",
          ],
          /* "motion" è un wrapper: senza framer-motion qui, i ~120 kB veri
             finivano nel chunk principale (audit bundle lug 2026). */
          "vendor-motion": ["motion", "framer-motion"],
        },
      },
    },
  },

  /* File types to support raw imports. Never add .css, .tsx, or .ts files. */
  assetsInclude: ["**/*.svg", "**/*.csv"],
});
