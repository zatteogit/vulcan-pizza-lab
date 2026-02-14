import { defineConfig, type Plugin } from "vite";
import path from "path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";

/**
 * Stub per gli import `figma:asset/...` usati SOLO in 1024WDefault.tsx
 * (artefatto Figma non referenziato). Restituisce una stringa placeholder
 * invece di fallire durante la build.
 */
function figmaAssetStub(): Plugin {
  return {
    name: "figma-asset-stub",
    resolveId(source) {
      if (source.startsWith("figma:asset/")) {
        return `\0figma-stub:${source}`;
      }
    },
    load(id) {
      if (id.startsWith("\0figma-stub:")) {
        return `export default "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'/%3E";`;
      }
    },
  };
}

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    figmaAssetStub(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },

  /* === Dev server === */
  server: {
    port: 5173,
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
          "vendor-react": ["react", "react-dom", "react-router"],
          "vendor-motion": ["motion"],
          "vendor-recharts": ["recharts"],
        },
      },
    },
  },

  /* File types to support raw imports. Never add .css, .tsx, or .ts files. */
  assetsInclude: ["**/*.svg", "**/*.csv"],
});
