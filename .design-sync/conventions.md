# Vulcan Design System (`ds/`)

10 context-free React components: **Badge, Chip, CtaButton, FilterChip, Heading,
IconButton, SegmentedControl, Stepper, Surface, Switch**. Warm editorial brand
(terracotta + sage), serif display + mono data.

## Setup — no provider, just tokens
Components need **no provider/context wrapper**. Import and render directly:
```tsx
import { CtaButton } from "@vulcan/ds";
```
They style themselves from **CSS custom properties** (the `--*` tokens). The design
must load the DS `styles.css` closure (tokens + Google Fonts + utilities) — without
it, components fall back to unstyled browser defaults. That stylesheet is already
wired into rendered designs; you don't import it per-component.

## Styling idiom — token variables, never hardcoded values
The components carry the design language internally. For **your own layout glue**
(wrappers, spacing, supporting text) use the **same `var(--*)` tokens inline** —
never raw hex/px for anything the tokens cover. The components do exactly this.

Real token families (read the bound stylesheet for the full list):
- **Color / semantics**: `--primary`, `--secondary`, `--tertiary`, `--cta`,
  `--text-default`, `--text-muted`, `--text-accent`, `--text-success`,
  `--text-warning`, `--text-error`
- **Surfaces**: `--container-page`, `--container-card`, `--surface-container`
- **Type**: `--font-serif` (display), `--font-sans` (UI), `--font-mono` (data/labels);
  size scale `--font-size-xs … --font-size-6xl`
- **Space / radius**: `--space-1 … --space-16`, `--radius-sm … --radius-full`

For typography prefer the **`.type-*` composite classes** over re-deriving size/leading:
`.type-title-page`, `.type-heading-xl|lg|md|sm|xs`, `.type-body`, `.type-data`,
`.type-numeric` (tabular figures), `.type-label`. (The `Heading` component already
applies these — use it for titles.)

Components expose intent through **props, not class overrides**: `tone` (Badge),
`variant`/`radius` (CtaButton, Surface, IconButton), `size`, `active`, `checked`.
Pass a `style` for one-off layout; don't reach for utility classes to restyle them.

## Where the truth lives
- **Full token + class list**: the bound stylesheet (`styles.css` → `_ds_bundle.css`).
- **Per-component API**: each `<Name>.d.ts` (`<Name>Props`) and `<Name>.prompt.md`.

## Idiomatic snippet
```tsx
import { Surface, Heading, Badge, CtaButton } from "@vulcan/ds";

<Surface variant="card" style={{ padding: "var(--space-5)", display: "flex",
  flexDirection: "column", gap: "var(--space-3)", maxWidth: 360 }}>
  <Heading level="md">Napoletana STG</Heading>
  <p style={{ color: "var(--text-muted)", fontSize: "var(--font-size-lg)", margin: 0 }}>
    Cornicione gonfio, leopardatura. Standard AVPN.
  </p>
  <div style={{ display: "flex", gap: "var(--space-2)" }}>
    <Badge tone="accent" size="xs">65% idratazione</Badge>
    <Badge tone="muted" size="xs">24–48h</Badge>
  </div>
  <CtaButton variant="primary">Genera ricetta</CtaButton>
</Surface>
```
