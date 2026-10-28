import { defineConfig } from "vitest/config";
import { resolveEditionFile } from "./scripts/edition-path.mjs";

export default defineConfig({
  // I test girano sulla generalista, salvo VULCAN_EDITION esplicita.
  resolve: { alias: { "@vulcan/edition": resolveEditionFile() } },
  test: {
    include: ["src/**/*.test.{ts,tsx}"],
    exclude: ["**/node_modules/**", "**/dist/**", ".claude/**"],
  },
});
