import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { runSemanticGuard, type RouteContract } from "./semantic-guard";

function fixture(files: Record<string, string>): string {
  const root = mkdtempSync(path.join(tmpdir(), "vulcan-semantic-guard-"));
  writeFileSync(
    path.join(root, "tsconfig.json"),
    JSON.stringify({
      compilerOptions: {
        target: "ES2020",
        module: "ESNext",
        moduleResolution: "bundler",
        jsx: "react-jsx",
        skipLibCheck: true,
      },
      include: ["src"],
    }),
  );
  for (const [name, source] of Object.entries(files)) {
    const target = path.join(root, name);
    mkdirSync(path.dirname(target), { recursive: true });
    writeFileSync(target, source);
  }
  return root;
}

const cleanRoot = fixture({
  "src/entry.tsx": `
    import { Detail } from "./detail";
    export function Page() {
      return <main><h1>Title</h1><nav aria-label="Primary"><a href="/">Home</a></nav><Detail /></main>;
    }
  `,
  "src/detail.tsx": `
    export function Detail() {
      return <article><figure><img src="/pizza.jpg" alt="Pizza" /><figcaption>Pizza</figcaption></figure><details><summary>More</summary><p>Details</p></details></article>;
    }
  `,
});

const badRoot = fixture({
  "src/entry.tsx": `
    import { BadImported } from "./imported";
    export function Page() {
      return <div>
        <button role="button"><a href="/nested">Nested</a></button>
        <nav><span>Menu</span></nav>
        <div role="dialog"><img src="/missing-alt.jpg" /></div>
        <figure><img src="/x.jpg" alt="" /></figure>
        <details><p>No summary</p></details>
        <BadImported />
      </div>;
    }
  `,
  "src/imported.tsx": `
    export function BadImported() {
      return <span onClick={() => undefined}>Click me</span>;
    }
  `,
});

const syncRoot = fixture({
  "src/app/routes.ts": `
    export const known = () => import("./pages/known");
    export const extra = () => import("./pages/extra");
  `,
  "src/app/pages/known.tsx": `export function Known() { return <main><h1>Known</h1></main>; }`,
  "src/app/pages/extra.tsx": `export function Extra() { return <main><h1>Extra</h1></main>; }`,
});

try {
  const cleanContracts: RouteContract[] = [
    {
      file: "src/entry.tsx",
      label: "/clean",
      requiredLandmarks: ["main", "nav", "article"],
      requireLevelOneHeading: true,
      maxLevelOneHeadings: 1,
    },
  ];
  const clean = runSemanticGuard(cleanRoot, {
    entryFiles: ["src/entry.tsx"],
    routeContracts: cleanContracts,
  });
  assert.deepEqual(clean.violations, []);
  assert.equal(clean.scannedFileCount, 2, "the import graph must include the imported TSX fixture");

  const bad = runSemanticGuard(badRoot, {
    entryFiles: ["src/entry.tsx"],
    routeContracts: [
      {
        file: "src/entry.tsx",
        label: "/bad",
        requiredLandmarks: ["main"],
        requireLevelOneHeading: true,
      },
    ],
  });
  const rules = new Set(bad.violations.map((violation) => violation.rule));
  for (const expected of [
    "interactive-static-element",
    "nested-interactive",
    "redundant-role",
    "dialog-accessible-name",
    "navigation-landmark",
    "image-alt",
    "figure-caption",
    "details-summary",
    "route-main-landmark",
    "heading-contract",
  ]) {
    assert.ok(rules.has(expected as never), `missing expected rule: ${expected}`);
  }
  assert.equal(bad.scannedFileCount, 2, "violations in imported files must remain in scope");
  const drift = runSemanticGuard(syncRoot, {
    entryFiles: ["src/app/pages/known.tsx"],
    routeContracts: [{
      file: "src/app/pages/known.tsx",
      requiredLandmarks: ["main"],
      requireLevelOneHeading: true,
    }],
  });
  assert.ok(
    drift.violations.some((violation) => violation.rule === "route-contract-sync"),
    "a mounted page without a contract must fail",
  );
  console.log("semantic-guard tests: 3 fixture graphs, all assertions passed.");
} finally {
  rmSync(cleanRoot, { recursive: true, force: true });
  rmSync(badRoot, { recursive: true, force: true });
  rmSync(syncRoot, { recursive: true, force: true });
}
