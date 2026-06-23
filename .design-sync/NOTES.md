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

## Onda 1 — B-free (2026-06-22)
Aggiunti 5 componenti context-free fuori da `ds/`, via entry barrel dedicato.
- **Entry**: `cfg.entry = src/app/components/ds/_sync-entry.ts` (re-esporta `ds/*` + i B-free).
  Tiene pulita l'API pubblica `ds/index.ts`. Le prossime onde crescono qui.
- **Aggiunti (gruppo `app/`)**: ScoreRing, TiltCard, DoughBlob, VulcanMark, StepIllustration → 15 totali.
- **FireGlow ESCLUSO di proposito**: è un layer ambient `fixed inset-0` a bassa opacità.
  Senza box di layout misurabile l'harness lo cattura blank/thin (provato Frame + dark Stage:
  inservibile). Non è un componente componibile → fuori dal DS. Se mai servisse, va ripensato
  come effetto contenibile (`position: absolute` dentro un parent), non `fixed`.
- **StepIllustration `[RENDER_THIN]` è benigno**: gli SVG illustrativi si disegnano (verificato
  a schermo), ma non hanno testo → l'euristica lo flagga. Non bloccante, non rilavorare.
- **DoughBlob**: la variante `neural` renderizza vuota in static → nelle preview usare
  rest/rise/forge/stretch/spin/fold (non `neural`).

## Onda 2 — app-coupled (2026-06-23)
Aggiunti 4 componenti che usano `useCms` → 19 totali. Approccio chiave:
- **Nessun provider necessario.** `useCms()` ha un default context (cms-context.tsx ~L2335)
  che fornisce `CMS_DEFAULTS` completo → i componenti renderizzano gli st_string i18n senza
  `CmsProvider`. (CmsProvider chiamerebbe `loadCms()`→localStorage, rischioso headless.)
  `cfg.provider` resta unset.
- **Aggiunti**: InfoTip, RecipeSectionTabs, RecipeStatStrip, RecipeMatchCard.
- **Dati di dominio nelle preview = fixture statica.** RecipeStatStrip/RecipeMatchCard vogliono
  un `GeneratedRecipe`/`RecipeScores`. NON chiamare `generateRecipe` nella preview e NON
  re-esportare il motore dal barrel: tira dentro pizza-engine→topping-library→PNG e gonfia il
  bundle. La ricetta è **precalcolata una volta** (esbuild+node su pizza-engine) e congelata come
  literal dentro `.design-sync/previews/RecipeStatStrip.tsx` / `RecipeMatchCard.tsx`.
  Per rigenerarla: `/tmp/recipe-entry.ts` + esbuild `--loader:.png=empty` → node → JSON.
- **OVERRIDE bundle.mjs (importante).** `.design-sync/overrides/bundle.mjs` forka il converter
  per stubbare i raster (`.png/.jpg → loader 'empty'`). Motivo: `cms-context` importa staticamente
  `STYLE_PHOTOS` (~100MB di PNG via `../style-photos`) — nell'app è innocuo (Vite serve i file),
  ma il loader `dataurl` del converter li inlinava → bundle 103MB > limite 5MB upload. Nessun
  componente sincronizzato mostra quelle foto, quindi 'empty' è sicuro. **Manutenzione**: è una
  copia di lib/bundle.mjs con 2 patch (inline di IIFE_IMPORT_META_DEFINE + loader). Ad ogni
  update della skill, ri-verificare che il fork non sia divergente (il converter stampa
  `[OVERRIDE] using …`; dichiarato in cfg.libOverrides).
- **FireGlow** resta escluso (vedi onda 1).
