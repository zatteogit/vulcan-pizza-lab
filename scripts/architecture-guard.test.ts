import assert from "node:assert/strict";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { runArchitectureGuard } from "./architecture-guard";

function write(root: string, file: string, content: string): void {
  const absolute = path.join(root, file);
  fs.mkdirSync(path.dirname(absolute), { recursive: true });
  fs.writeFileSync(absolute, content);
}

function fixture(): string {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "vulcan-architecture-"));
  write(
    root,
    "tsconfig.json",
    JSON.stringify({
      compilerOptions: {
        target: "ES2022",
        module: "ESNext",
        moduleResolution: "Node",
        lib: ["ES2022", "DOM"],
        jsx: "react-jsx",
      },
      include: ["src"],
    }),
  );
  return root;
}

const roots: string[] = [];
try {
  const clean = fixture();
  roots.push(clean);
  write(
    clean,
    "src/app/domain/index.ts",
    [
      'import { value } from "../shared/math";',
      'export const workerUrl = new URL("./recipe.worker.ts", import.meta.url);',
      "export { value };",
    ].join("\n"),
  );
  write(clean, "src/app/domain/recipe.worker.ts", "export const worker = true;\n");
  write(
    clean,
    "src/app/shared/math.ts",
    "export const local = ({ window }: { window: number }) => window;\nexport const value = local({ window: 1 });\n",
  );
  write(
    clean,
    "src/app/use-cases/calculate.ts",
    'import { value } from "../shared/math";\nexport const calculate = () => value + 1;\n',
  );
  assert.deepEqual(runArchitectureGuard(clean).violations, []);

  const dirty = fixture();
  roots.push(dirty);
  write(
    dirty,
    "src/app/domain/index.ts",
    [
      'import "../components/Card";',
      'export { title } from "../shared/helper";',
      'import "./theme.css";',
    ].join("\n"),
  );
  write(dirty, "src/app/components/Card.tsx", "export const Card = () => null;\n");
  write(
    dirty,
    "src/app/shared/helper.ts",
    'import { useState } from "react";\nexport const title = document.title;\nexport { useState };\n',
  );
  write(dirty, "src/app/domain/theme.css", ":root { color: red; }\n");
  write(
    dirty,
    "src/app/data/content.ts",
    'import type { CmsContent } from "../features/cms/context";\nexport type Content = CmsContent;\n',
  );
  write(dirty, "src/app/features/cms/context.ts", "export interface CmsContent {}\n");
  write(
    dirty,
    "src/app/use-cases/bad-use-case.ts",
    [
      'import { Card } from "../components/Card";',
      'import { motion } from "motion/react";',
      "export const viewportWidth = window.innerWidth;",
      "export { Card, motion };",
    ].join("\n"),
  );

  const result = runArchitectureGuard(dirty);
  const rules = new Set(result.violations.map((violation) => violation.rule));
  assert(rules.has("presentation-import"));
  assert(rules.has("presentation-package"));
  assert(rules.has("stylesheet-import"));
  assert(rules.has("browser-runtime"));
  const transitive = result.violations.find(
    (violation) => violation.rule === "presentation-package",
  );
  assert.deepEqual(transitive?.chain, [
    "src/app/domain/index.ts",
    "src/app/shared/helper.ts",
  ]);
  assert(
    result.violations.some(
      (violation) =>
        violation.rule === "presentation-import" &&
        violation.detail.includes("src/app/features/cms/context.ts"),
    ),
  );
  assert(
    result.violations.some(
      (violation) =>
        violation.file === "src/app/use-cases/bad-use-case.ts" &&
        violation.rule === "presentation-import",
    ),
  );
  assert(
    result.violations.some(
      (violation) =>
        violation.file === "src/app/use-cases/bad-use-case.ts" &&
        violation.rule === "presentation-package",
    ),
  );
  assert(
    result.violations.some(
      (violation) =>
        violation.file === "src/app/use-cases/bad-use-case.ts" &&
        violation.rule === "browser-runtime",
    ),
  );

  console.log("architecture-guard tests: ok");
} finally {
  for (const root of roots) fs.rmSync(root, { recursive: true, force: true });
}
