# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Vulcan** is a React + Vite web application for designing, learning, and optimizing pizza recipes. It's built as a Figma Make file and syncs between Figma and a local React codebase.

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
npm run verify       # TypeScript + design tokens check
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
- `dev.tsx` — Developer tools (engine test suite, sync dashboard, style editor)

All pages are **lazy-loaded** via React Router's `lazy()` for code-splitting.

### Core Components (`src/app/components/`)

**Domain Logic:**
- `pizza-engine.ts` — Parametric pizza calculation engine (hydration, fermentation, baking times, temperatures)
- `recipe-configurator.tsx` — UI for adjusting recipe parameters
- `recipe-output.tsx` — Display calculated recipe results and step-by-step instructions
- `recipe-view.tsx` — Recipe detail layout and navigation
- `recipe-match-card.tsx`, `recommended-styles.tsx` — Match and recommendations UI
- `style-editor-tab.tsx` — Edit/create pizza styles (in dev tools)
- `sync-tab.tsx` — Figma Make sync dashboard

**Data & Databases:**
- `pizza-engine.ts` — Also contains pizza style definitions and lookup tables
- `topping-library.ts` — Topping database (80+ toppings with metadata)
- `flour-database.ts` — Flour types with hydration/extensibility profiles
- `equipment-data.ts` — Oven types, temperatures, baking methods
- `parametric-databases.ts` — Fermentation schedules, baking curves, guidelines
- `style-versions.ts` — Version history for pizza styles
- `glossary-data.ts`, `troubleshooting-data.ts`, `pre-ferment-guide.tsx` — Educational content
- `dietary-data.ts`, `saved-recipes.ts`, `signature-recipes.ts` — User data

**UI & Utilities:**
- `app-shell.tsx` — Root layout with tab bar (Create, Explore, Learn, Profile) + search overlay
- `search-overlay.tsx` — Command palette (⌘K)
- `design-system/` — UI components (modals, buttons, cards, etc.)
- `ds/` — Reusable design system components (not for raw usage, prefer `design-system/`)
- `ui/` — Dead code (see sync.mjs EXCLUDE_PATTERNS)

**Feature Modules:**
- `active-cook-widget.tsx` — Current cook session display
- `cooking-mode.tsx` — Guided cooking interface
- `recipe-feedback.tsx` — Feedback collection and analysis
- `recipe-setup-panel.tsx`, `recipe-learning-panel.tsx` — Contextual help
- `style-detail-sheet.tsx` — Pizza style information panel
- `user-needs.tsx` — User preference capture

**Utilities:**
- `use-recipe-state.ts` — React hook for recipe state management
- `use-profile-defaults.ts` — User profile hook
- `impasto-library.ts`, `interpretation-library.ts` — Pizza terminology/knowledge base
- `deviation-tags.ts`, `liquid-dock.ts` — Internal utilities

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
- `vite.config.ts` — Build config, dev server (port 5174), custom Figma asset stub plugin, path alias `@/`
- `tsconfig.json` — TypeScript strict mode, ES2020 target, bundler resolution
- `postcss.config.mjs` — PostCSS (for Tailwind)

### Sync System
- `sync.mjs` — Node.js CLI for bidirectional syncing with Figma Make
  ```bash
  node sync.mjs scan                # List all files with hashes
  node sync.mjs export [file]       # Export to JSON (clipboard or file)
  node sync.mjs import [file]       # Import from JSON (clipboard or file)
  node sync.mjs diff [file]         # Compare local vs snapshot
  ```
- `.sync-snapshot.json` — Last known state (gitignored, created by import)
- `sync.mjs` includes directories: `src/app`, `src/styles`, `src/imports`, root config files

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
- `dev-tools`, `engine-test-suite`, `sync-tab`, `style-editor-tab` (tooling exemptions)
- `feedback-analysis`, `cms.tsx` (CMS defines strings)

### Component Structure
- Keep components in `src/app/components/`
- Group related components into subdirectories (e.g., `cms/`, `figma/`)
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

### Figma Asset Imports
- Assets in Figma Make are stubbed locally with `figma:asset/<id>` imports
- Vite's `figmaAssetStub()` plugin resolves them to empty SVG placeholders
- Local assets go in `src/assets/` and imported normally: `import pizza from '@/assets/pizza.png'`

## Commands Reference

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start dev server (HMR at port 5174) |
| `npm run build` | Production build (minified, chunked) |
| `npm run preview` | Serve `dist/` locally (port 4173) |
| `npm run verify` | TypeScript + design tokens check (pre-commit) |
| `npm run check:tokens` | Design token linter only |
| `node sync.mjs` | Figma ↔ local sync CLI |

## Key Files to Know

- **`pizza-engine.ts`** — Most important file. Contains pizza style DB, calculation logic, parametric models.
- **`recipe-output.tsx`** — Large, transforms engine output to UI. Split into smaller components if editing.
- **`app-shell.tsx`** — Root layout, tab navigation, search integration.
- **`style-editor-tab.tsx`** — Complex dev tool for creating/editing pizza styles.
- **`theme.css`** — Source of truth for design tokens. Changes trigger `check:tokens` linting.
- **`vite.config.ts`** — Dev server config, build output, plugin order matters.

## Notes

- **No ESLint/Prettier**: Use TypeScript (`npm run verify`) to catch errors.
- **SPA fallback**: All routes served via `index.html` for React Router to handle.
- **Chunk splitting**: React, DOM, Router, and Motion split into separate chunks for faster loads.
- **Sourcemaps**: Generated in build for debugging (`sourcemap: true` in config).
- **Assets**: SVG and CSV imports supported; other types via standard imports.
- **i18n**: CMS is the source of truth for user-facing strings (see `components/cms/`).
