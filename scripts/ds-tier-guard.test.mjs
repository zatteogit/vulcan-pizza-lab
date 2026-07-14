import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import test from "node:test";
import {
  buildRuleReport,
  extractBalanced,
  findNamedVisualColors,
  findInlineStyleObjects,
  findMotionLiterals,
  parseTokenTiers,
  scanFrameworkAliases,
  scanTokenDefinitions,
  validateGeneratedShowcaseCss,
} from "./ds-tier-guard.mjs";

test("extractBalanced handles nested objects and strings", () => {
  const source = '{ outer: { text: "}" }, ok: true } trailing';
  assert.equal(extractBalanced(source, 0)?.text, '{ outer: { text: "}" }, ok: true }');
});

test("inline-style scanner permits custom-property handoff and dynamic MotionValues", () => {
  const source = `
    <div style={{ ["--tone" as any]: tone }} />
    <motion.div style={{ y: offsetY, opacity: opacityValue }} />
    <div style={{ color: "red", padding: "12px" }} />
  `;
  const findings = findInlineStyleObjects(source);
  assert.equal(findings.length, 1);
  assert.match(findings[0].detail, /color/);
});

test("motion scanner finds transition and spring literals but ignores domain duration", () => {
  const source = `
    const recipe = { duration: 24 };
    <motion.div transition={{ type: "spring", stiffness: 400, damping: 28 }} />
    const x = useSpring(value, { stiffness: 260, damping: 22 });
  `;
  const findings = findMotionLiterals(source);
  assert.deepEqual(findings.map((finding) => finding.detail).sort(), [
    "damping: 22",
    "damping: 28",
    "stiffness: 260",
    "stiffness: 400",
  ]);
});

test("named visual color scanner is declaration-aware", () => {
  const source = `
    .valid { color: var(--text-primary); background: transparent; }
    .invalid { color: white; border-color: rebeccapurple; }
    .content { content: "white"; }
  `;
  assert.deepEqual(findNamedVisualColors(source).map((finding) => finding.detail), [
    "color: white",
    "border-color: rebeccapurple",
  ]);
});

test("rule report is deterministic and grouped by file", () => {
  const report = buildRuleReport([
    { rule: "b", file: "two.tsx", line: 2, detail: "x" },
    { rule: "a", file: "one.tsx", line: 1, detail: "y" },
    { rule: "a", file: "one.tsx", line: 3, detail: "z" },
  ]);
  assert.deepEqual(Object.keys(report), ["a", "b"]);
  assert.equal(report.a.total, 2);
  assert.equal(report.a.byFile["one.tsx"], 2);
  assert.equal(report.a.byTier.SUPPORT, 2);
});

test("theme audit covers dark overrides and ignores the isolated framework layer", () => {
  const theme = `
:root {
  /* TIER 1 — PRIMITIVES */
  --primitive: #ffffff;
  /* TIER 2 — SEMANTIC TOKENS */
  --semantic: var(--primitive);
  /* TIER 2.5 — DATA VISUALIZATION */
  --data: var(--semantic);
  /* TIER 3 — COMPONENT TOKENS */
  --component: var(--semantic);
}
.dark {
  --semantic: #000000;
  --component: var(--primitive);
}
@theme inline {
  /* l'identità framework's may contain } without ending the block */
  --color-*: initial;
  --color-white: #ffffff;
  --color-black: #000000;
  --color-secondary: var(--semantic);
}
`;
  const findings = scanTokenDefinitions(theme, parseTokenTiers(theme));
  assert.deepEqual(findings.map((item) => item.rule).sort(), [
    "tier-definition-boundary",
    "tier-raw-value-outside-t1",
  ]);
  assert.equal(scanFrameworkAliases(theme).length, 0);
  assert.equal(scanFrameworkAliases(theme.replace(
    "--color-secondary: var(--semantic)",
    "--color-secondary: #123456",
  )).length, 1);
});

test("semantic tokens cannot own named visual colors", () => {
  const theme = `
:root {
  /* TIER 1 — PRIMITIVES */
  --primitive: #ffffff;
  /* TIER 2 — SEMANTIC TOKENS */
  --semantic: white;
  /* TIER 2.5 — DATA VISUALIZATION */
  --data: var(--semantic);
  /* TIER 3 — COMPONENT TOKENS */
  --component: var(--semantic);
}
.dark {}
@theme inline {}
`;
  const findings = scanTokenDefinitions(theme, parseTokenTiers(theme));
  assert.equal(findings.filter((item) => item.rule === "tier-raw-value-outside-t1").length, 1);
});

test("generated showcase CSS is content-addressed and rejects manual residue", () => {
  const signature = "color:red;padding:var(--space-2)";
  const hash = createHash("sha256").update(signature).digest("hex").slice(0, 10);
  const valid = `
/* AUTO-GENERATED */
@layer components {
  .dsx-s-${hash} {
    color: red;
    padding: var(--space-2);
  }
}
`;
  assert.deepEqual(validateGeneratedShowcaseCss(valid), []);
  assert.match(
    validateGeneratedShowcaseCss(valid.replace("color: red", "color: blue"))[0].detail,
    /content hash/,
  );
  assert.match(
    validateGeneratedShowcaseCss(`${valid}\n.manual { color: red; }`)[0].detail,
    /outside content-addressed/,
  );
});
