# design-sync notes — Vulcan DS (`ds/` layer)

Repo is a **Vite app**, not a packaged component library. The synced design system is the
`src/app/components/ds/` layer — Tier-4, **context-free**, token-driven React components.

## Build facts (carry forward)
- **No library `dist/`** — bundle from the source barrel: `--entry ./src/app/components/ds/index.ts`.
  `node_modules/<pkg>` doesn't exist (app self-package), so `--entry` is required.
- **No providers needed.** The `ds/` components read no context (no `useCms`/router/theme hooks).
  `cfg.provider` is intentionally unset. If a preview ever renders blank with a context error,
  something app-coupled leaked into `ds/` — fix the component, don't add a provider.
- **Bundle deps**: react, motion/react, lucide-react, @radix-ui/react-switch (all in repo `node_modules`).
- **10 components**: Badge, Chip, CtaButton, FilterChip, Heading, IconButton, SegmentedControl,
  Stepper, Surface, Switch.

## CSS pipeline (important)
- Styling = inline `style={{ var(--*) }}` (most of it) + a handful of Tailwind v4 utilities
  (`flex-shrink-0`, `rounded-full`, `size-4`, `translate-x-*`, `truncate`, `min-w-0`,
  `transition-transform`, `active:scale-*`, `disabled:opacity-20`) + custom `.type-*` classes
  (defined IN `theme.css`, so they ride along automatically).
- **Tailwind must be compiled** — the repo's `tailwind.css` is the v4 directive `@import "tailwindcss"`,
  which the converter does NOT compile. So `cfg.cssEntry` points at a **pre-compiled** stylesheet:
  `.design-sync/compiled-styles.css`.
- **Regenerate `compiled-styles.css` on re-sync** (when `ds/` or styles change):
  ```
  npx @tailwindcss/cli@4 -i src/styles/index.css -o .design-sync/compiled-styles.css
  ```
  `index.css` @imports fonts.css (remote Google Fonts) + tailwind.css + theme.css, so the compiled
  output carries fonts (`@import url(...)`, `[FONT_REMOTE]` — loads at runtime), all Tailwind
  utilities used anywhere in `src/`, the token tiers, and the `.type-*` classes — everything the
  closure needs.
- Fonts: DM Sans / Playfair Display / DM Mono via Google Fonts `@import` — remote, nothing to ship.

## Re-sync risks
- **Toolchain version**: the compile used `@tailwindcss/cli@4` resolved by npx to **v4.3.1**, while the
  repo pins **tailwindcss 4.1.12**. Minor diff, output compatible so far — if utilities ever look off,
  pin the CLI to the repo version (`npx @tailwindcss/cli@4.1.12 ...`).
- `compiled-styles.css` is a **generated** sync input committed for reproducibility — regenerate it
  (command above) whenever `src/` styling changes, or its utilities go stale.
- Build entry is a **source barrel**, so `.d.ts` contracts come from ts-morph over source (no shipped
  types). Generic components (Badge/CtaButton/Surface/IconButton use `<T extends ElementType>`;
  SegmentedControl `<TValue extends string>`) may need `cfg.dtsPropsFor` if extraction degrades.
