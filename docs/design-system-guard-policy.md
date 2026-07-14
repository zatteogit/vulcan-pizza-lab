# Vulcan — design-system guard policy

`scripts/ds-tier-guard.mjs` applies the same architectural idea used by the
NuTree reference without copying its app-specific implementation. Its scope is
the import graph of product routes plus `/design-system`; DevTools and CMS/admin
are not roots. A gated DevTools import reachable from the shell remains excluded
from visual findings: it is not promoted into product scope merely because its
loader is wired to the shell.

## Tier contract

| Tier | Owner | Contract |
|---|---|---|
| T1 | primitive/global tokens in `theme.css` | only tier that owns raw colour, dimension and timing values |
| T2 | semantic tokens | role aliases composed from T1/T2; never depend upward |
| T2.5 | domain semantic palettes | specialised semantic roles with the same dependency direction as T2 |
| T3 | component tokens and CSS composites | component roles composed from T2/T3; never skip to T1 |
| T4 | `src/app/components/ds/` | context-free components; consume T3 and other T4 only |
| T5 | shared/domain UI patterns | compose T4; never import a page/template |
| T6 | routes and named page templates | orchestrate T5/T4; do not recreate DS controls |

The showcase is a governed consumer, not an exemption. Every exported T4
component must be both imported and rendered there; patterns and page templates
remain separate, explicit T5/T6 showcase categories.

Token parsing covers the complete stylesheet, including `.dark`, switchable
theme selectors and every later override of a known token. `@theme inline` is
an isolated framework adapter: declarations must alias a DS token, except for
the exact Tailwind photo helpers `--color-white: #ffffff` and
`--color-black: #000000`. Tests prove that the same literals fail in ordinary
theme overrides.

## Hard rules and exceptions

The guard blocks upward imports, lower-tier token bypasses, unresolved tokens,
native controls outside T4, static inline presentation, literal Motion physics,
raw visual values outside T1, incomplete T4 showcase coverage and brand-asset
drift. The pre-CSS startup block in `index.html` is scanned as well: it is not a
silent exemption merely because it runs before the stylesheet. Dynamic
MotionValues and custom-property handoff are authorised because
their values exist only at runtime; static presentation is not.

`showcase.generated.css` is authorised generated output, not an ignored file.
Each `.dsx-s-<hash>` selector is content-addressed from its normalized
declarations; the guard recomputes the hash, rejects all manual residue and
requires exact parity between generated and referenced classes. Deleting a
showcase source prunes its orphan rules. The migration script is idempotent and
is the only writer for this artifact. Motion literals follow the same ownership
principle: only the named runtime/showcase preset modules may own physics and
timing; consumers import an intent.

Exceptions live in the named `EXCEPTIONS` object inside the guard. Each one must
name a single file and include a durable reason. Baselines and broad directory
exemptions are not exception mechanisms.

Use `node scripts/ds-tier-guard.mjs --report` during migration and
`node scripts/ds-tier-guard.mjs` as the strict gate. `--verbose` lists every
finding; `--json` emits a machine-readable matrix.

## Brand invariant

The runtime `VulcanMark` naturale path, startup splash and SVG favicon are one
mark. The 16/32/180/192/512 raster assets, ICO, SVG and manifest are a single
asset family. The guard verifies presence, raster dimensions and vector-path
parity; changes to the mark must regenerate the entire family in one tranche.
