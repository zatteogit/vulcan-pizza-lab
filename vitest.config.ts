import { defineConfig } from "vitest/config";
import { resolveEditionFile } from "./scripts/edition-path.mjs";

export default defineConfig({
  // I test girano sulla generalista, salvo VULCAN_EDITION esplicita.
  resolve: { alias: { "@vulcan/edition": resolveEditionFile() } },
  test: {
    // worker/: le rotte del Worker (D-061), fuori dal tsconfig dell'app.
    include: ["src/**/*.test.{ts,tsx}", "worker/**/*.test.ts"],
    exclude: ["**/node_modules/**", "**/dist/**", ".claude/**"],
    // L'italiano in cache come in app dopo l'avvio (budget D-059).
    setupFiles: ["src/test-setup.ts"],
  },
});
