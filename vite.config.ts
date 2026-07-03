import { defineConfig } from "vite";
import path from "path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react(), tailwindcss()],
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
