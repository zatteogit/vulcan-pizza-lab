# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Vulcan** is a React + Vite web application for designing, learning, and optimizing pizza recipes.

Core features:
- **Create**: Configure pizza recipes with parametric engine (hydration, fermentation, baking, equipment)
- **Explore**: Browse pizza styles with visual search and matching recipes
- **Learn**: Educational content on pizza techniques, pre-ferments, glossary, troubleshooting
- **Profile**: User preferences, saved recipes, dietary tags
- **Design System**: Tier-based token system (T1–T4) enforced via linting
- **CMS**: Content management for pizzas, toppings, flour, equipment data

## Quick Start

```bash
npm install
npm run dev          # Start dev server (port 5174)
npm run build        # Production build
npm run verify       # TypeScript + design tokens + Vitest
npm run check:tokens # Design token compliance only
```

## Architecture

### Page Routes (`src/app/pages/`)
- `home.tsx` — Recipe creator (main feature)
- `explore.tsx` — Pizza style discovery with search/filtering
- `learn.tsx` — Educational hub (techniques, methods)
- `glossary.tsx`, `troubleshooting.tsx`, `pre-ferments.tsx` — Learn sub-pages
- `recipe.tsx` — Detail view for a specific pizza style
- `profile.tsx` — User profile, saved recipes, dietary preferences
- `cms.tsx` — Content admin interface for data management
- `design-system.tsx` — Design token showcase
- `dev.tsx` — Developer tools (engine test suite, style editor)

All pages are **lazy-loaded** via React Router's `lazy()` for code-splitting.

### Code Structure (`src/app/`)

- **`domain/`** — Core non-UI logic, math, and engine formulas
  - `pizza-engine.ts` — Parametric pizza calculation engine
  - `deviation-tags.ts` — Recipe deviations computation
  - `liquid-dock.ts` — Mathematical calculations for liquids
- **`data/`** — Static databases and preset list values
  - `flour-database.ts` — Flour types and profiles
  - `topping-library.ts` — Topping database
  - `equipment-data.ts` — Ovens and baking methods
  - `parametric-databases.ts` — Fermentation scales and baking curves
  - `glossary-data.ts`, `troubleshooting-data.ts` — Educational lists
  - `signature-recipes.ts`, `saved-recipes.ts` — User and signature recipe databases
  - `style-versions.ts` — Version history of pizza styles
- **`hooks/`** — Shared custom React hooks
  - `use-recipe-state.ts` — Core state management for the config engine
  - `use-profile-defaults.ts` — Hook for profile settings
  - `use-mobile.ts` — Media query check
- **`context/`** — Shared React contexts
  - `styles-override-context.tsx` — Override custom style settings
- **`components/`** — Global components and UI layout
  - `shared/` — Shell layout, command search (`app-shell.tsx`, `search-overlay.tsx`)
  - `ds/` — Tier 4 reusable design system tokens (CtaButton, Badge)
  - `design-system/`, `foundations/` — Design token interactive showcase pages
  - `media/` — Media wrappers (`ImageWithFallback.tsx`)
- **`features/`** — Feature-specific component groups
  - `recipe/` — Recipe creation UI (`recipe-configurator.tsx`, `recipe-output.tsx`, `recipe-view.tsx`)
  - `cooking/` — Active cook dashboard (`cooking-mode.tsx`, `active-cook-widget.tsx`, `dough-mascot.tsx`)
  - `dev-tools/` — Diagnostics (`dev-tools.tsx`, `engine-test-suite.tsx`)
  - `cms/` — Locales context, i18n and translation helpers (merged from components)

### Styling (`src/styles/`)
- `theme.css` — Design tokens (Tier 1–4, semantic colors, typography)
- `tailwind.css` — Tailwind directives
- `fonts.css` — Font imports and font-face definitions
- `index.css` — Global styles

**Design Token Tiers:**
- **T1 (Primitives)**: Raw colors, sizing units (hardcoded in `theme.css`, not in code)
- **T2 (Semantic)**: Color roles (bg-primary, text-accent), spacing scale
- **T3 (Component)**: Button states, form styling
- **T4 (Composite)**: Multi-component tokens (dialog with animations, field groups)

See `scripts/check-design-tokens.mjs` for enforcement rules.

### Configuration
- `vite.config.ts` — Build config, dev server (port 5174), path alias `@/`
- `tsconfig.json` — TypeScript strict mode, ES2020 target, bundler resolution
- `postcss.config.mjs` — PostCSS (for Tailwind)

## Development Patterns

### Design Token Enforcement
When adding styles:
- ✅ Use semantic tokens from `theme.css` (e.g., `text-semantic-primary`, `bg-emphasis-high`)
- ✅ Use Tailwind utilities with token-based classes
- ❌ No hardcoded hex colors (except in `theme.css`)
- ❌ No hardcoded sizes (use T1 scale: `size-xs`, `size-sm`, etc.)
- ❌ No raw RGB/rgba outside token definitions
- ❌ Hardcoded text only in CMS and design-system showcase

Run `npm run check:tokens` to validate. The checker ignores:
- `components/design-system/` (showcase)
- `dev-tools`, `engine-test-suite`, `style-editor-tab` (tooling exemptions)
- `feedback-analysis`, `cms.tsx` (CMS defines strings)

### Component Structure
- Keep components in `src/app/components/`
- Group related components into subdirectories (e.g., `shared/`, `ds/`)
- Data/utilities as `.ts` files; UI as `.tsx`
- Large files (100+ lines) can be split: UI logic in `.tsx`, engine/calculations in `.ts`

### Route Additions
Edit `src/app/routes.ts`:
1. Add new lazy route under the appropriate section (TAB_ROUTES, DETAIL_ROUTES, TOOL_ROUTES)
2. Import the page in the router config, not at the top (lazy loading)
3. Add any legacy redirects in the LEGACY_REDIRECTS section

### State Management
- Use React hooks (`useState`, `useCallback`) for local state
- No global store (Redux, Zustand) currently; keep state close to components
- For cross-page state: lift state to `AppShell` or use React Router loader/action patterns
- Profile/user data: managed via `use-profile-defaults.ts` hook

### Assets
- Local assets go in `src/assets/` and are imported normally: `import pizza from '@/assets/pizza.png'`

## Commands Reference

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start dev server (HMR at port 5174) |
| `npm run build` | Production build (minified, chunked) |
| `npm run preview` | Serve `dist/` locally (port 4173) |
| `npm run verify` | TypeScript + design tokens + tests (pre-commit) |
| `npm run check:tokens` | Design token linter only |
| `npm test` | Run Vitest suite |

## Key Files to Know

- **`src/app/domain/pizza-engine.ts`** — Core pizza styles DB, calculation engine, and formulas.
- **`src/app/features/recipe/recipe-output.tsx`** — Key output sheet, transforms engine results to interactive UI instructions.
- **`src/app/components/shared/app-shell.tsx`** — Root layout, navigation tabs, command palette integration.
- **`src/app/features/dev-tools/style-editor-tab.tsx`** — Interactive manager for creating/editing pizza styles.
- **`src/styles/theme.css`** — Design tokens source of truth (enforced via `npm run check:tokens`).
- **`vite.config.ts`** — Build settings, dev server configuration, and rollup manual chunking logic.

## Notes

- **No ESLint/Prettier**: Use TypeScript (`npm run verify`) to catch errors.
- **SPA fallback**: All routes served via `index.html` for React Router to handle.
- **Chunk splitting**: React, DOM, Router, and Motion split into separate chunks for faster loads.
- **Sourcemaps**: Generated in build for debugging (`sourcemap: true` in config).
- **Assets**: SVG and CSV imports supported; other types via standard imports.
- **i18n**: CMS is the source of truth for user-facing strings (see `src/app/features/cms/`).

## Visual Debug Annotations & AI Fixes

If the user requests to "risolvi i commenti", "risolvi le annotazioni", "fix comments", or similar:
1. Locate `vulcan-debug-registry.json` at the project root.
2. Read the JSON array of annotations (containing target elements HTML, parents code, selectors, and comments).
3. Find the target source files, implement the fixes conforming strictly to the Design Tokens system (`theme.css`), and verify (`npm run verify`).
4. Once fixed, reset the registry by overwriting `vulcan-debug-registry.json` with an empty array `[]` so that the visual pins clear in the browser.
