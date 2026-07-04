# Design system e dev UI
> Aggiornamento: 2026-07-04 | Stato: ✅ | File documentati: 65

## Sommario

Showcase interattivo del design M3/M3 Expressive di Vulcan basato su un **modello a 6 tier (T1–T6)**: registry a sezioni in `design-system/index.tsx`, moduli `foundations-*` / `components-*` / `patterns-templates`, utilità in `shared.tsx`. Include i componenti atomo/molecola context-free in `src/app/components/ds/` (Tier 4) e le card visive delle foundations (ColorPalette, TypeScale, SpacingScale, RadiusScale, Elevation) in `src/app/components/design-system/foundations-ui/` (Tier 4). Accesso tramite route standalone `/design-system` e tab **Design** dentro `/dev` (`DevTools` → `DesignSystemTab`). I file di stile core vivono in `theme.css` (Tier 1-3.5) con tool di enforcement (`npm run check:tokens`). Le pagine showcase dei componenti sono state allineate per importare ed utilizzare i veri componenti ds (Tier 4) riducendo la duplicazione di markup inline.

## File chiave

| File / Cartella | Ruolo |
|------|--------|
| `src/styles/theme.css` | File CSS centrale dei token e delle classi composite (Tier 1-3.5); supporta l'enforcement automatico |
| `src/app/components/ds/` | Barrel directory contenente 24 componenti atomo/molecola context-free (Tier 4) come `CtaButton`, `Checkbox`, `Dialog`, etc. |
| `src/app/components/design-system/foundations-ui/` | Cartella contenente le showcase cards per visualizzare i token reali delle foundations (ColorPalette, TypeScale, SpacingScale, RadiusScale, Elevation) (Tier 4) |
| `src/app/pages/design-system.tsx` | Route `/design-system`: header sticky, toggle dark, render `DesignSystemTab` |
| `src/app/pages/dev.tsx` | Route `/dev` e `/dev/:tab` → wrapper `DevTools` |
| `src/app/features/dev-tools/dev-tools.tsx` | Tab dev incluso `design` → `DesignSystemTab` |
| `src/app/features/dev-tools/debug-overlay.tsx` | Gate leggero sempre montato (toggle + toast) che fa lazy-load del workspace di debug AI; i moduli pesanti (pin, canvas, form, pannello, sync) stanno in `src/app/features/dev-tools/debug/` |
| `src/app/features/dev-tools/debug/` | Workspace lazy + persistenza: `use-annotations` riconcilia localStorage / file dev / remoto Cloudflare-D1 (last-write-wins per `id`, con tombstone `deleted` e flag `resolved`, polling + flush-on-pagehide); `merge-registries`, `api-sync` (HTTP → `/api/annotations`), `use-pin-positions` (observer), `compile-prompt`. Backend (Cloudflare Worker): `worker/index.ts` (SPA via ASSETS + `/api/annotations` via binding D1 `DB`) + `wrangler.toml` + `schema.sql` |
| `src/app/components/design-system/index.tsx` | Registry `ALL_ENTRIES`, ordini `FOUNDATION_ORDER` / `COMPONENT_ORDER` / `PATTERN_ORDER`, navigazione sidebar |
| `src/app/components/design-system/shared.tsx` | `SectionEntry`, `DSCtx`, `resolveVar`, `useResolvedVars`, componenti showcase comuni |
| `src/app/components/design-system/foundations.tsx` | Token core: colori, tipografia, spacing, shape, elevation, states |
| `src/app/components/design-system/foundations-dynamics.tsx` | Motion, icone |
| `src/app/components/design-system/foundations-glass.tsx` | Glassmorphism e adattamenti Vulcan per overlay/sheet |
| `src/app/components/design-system/foundations-logo.tsx` | Logo, costruzione mark Vulcan |
| `src/app/components/design-system/foundations-logo-brand.tsx` | Sotto-sezioni brand hero/glow/blob |
| `src/app/components/design-system/foundations-ext.tsx` | Gradienti, time palette, immagini, emphasis |
| `src/app/components/design-system/foundations-m3e.tsx` | Expressive shapes, container transform |
| `src/app/components/design-system/foundations-contrast-density.tsx` | Contrasto M3, densità, a11y |
| `src/app/components/design-system/components-a.tsx` … `components-h.tsx` | Specimen componenti UI allineati ai componenti ds reali (esportazioni secondarie inutilizzate rimosse) |
| `src/app/components/design-system/carousel-variants.tsx` | Varianti carousel M3 |
| `src/app/components/design-system/patterns-templates.tsx` | Pattern P01–P06, template pagina build/result |
| `src/app/features/cooking/dough-mascot.tsx` | `DoughBlob` reattivo all'energia con 7 varianti (`stretch`, `rise`, `rest`, `spin`, `fold`, `forge`, `neural`) |
| `src/app/features/cooking/fire-glow.tsx` | Sfondo a gradiente radiale animato con varianti `warm` e `neural` |
| `src/app/components/media/ImageWithFallback.tsx` | Image component con fallback SVG se caricamento fallisce |
| `src/app/components/shared/info-tip.tsx` | M3 Rich Tooltip fluttuante per info ed errori contestuali |
| `src/app/components/shared/vulcan-hero.tsx` | Composizione brand-identity vulcan: DoughBlob ("forge") + VulcanMark centralizzato |
| `src/app/components/shared/vulcan-logo.tsx` | `VulcanMark` geometrico del brand con 5 scale ottiche per viewBox 32x32 |

## Flusso dati

```mermaid
flowchart TD
  subgraph routes
    DSP[/design-system DesignSystemPage]
    DEV[/dev/:tab DevToolsPage]
  end
  subgraph ds
    IDX[DesignSystemTab index.tsx]
    REG[ALL_ENTRIES Map]
    ORD[FOUNDATION/COMPONENT/PATTERN_ORDER]
    MOD[foundations-* components-* patterns]
  end
  subgraph ctx
    DM[darkMode root-layout]
    DSC[DSCtx shared]
  end
  DSP --> IDX
  DEV --> IDX
  IDX --> ORD --> REG --> MOD
  DM --> IDX
  IDX --> DSC --> MOD
```

1. Ogni modulo esporta `ENTRIES: SectionEntry[]` con `{ id, label, group, Component }`.
2. `index.tsx` unisce gli array in `ALL_ENTRIES` e costruisce sezioni numerate (`01`…`17` fondamenta, `C01`…`C26` componenti, `P01`…`P08` pattern).
3. `SectionNumCtx` inietta numero sezione nei titoli interni.
4. `useResolvedVars` legge CSS custom properties dal DOM per swatch colore (rispetta dark mode).

## Funzioni principali

| Export | File | Scopo |
|--------|------|--------|
| `DesignSystemTab` | `index.tsx` | UI completa: sidebar, scroll-spy, ricerca sezioni, toggle tema |
| `buildSections()` | `index.tsx` | Numerazione automatica da ordini array |
| `SectionEntry` | `shared.tsx` | Tipo registry |
| `resolveVar` / `useResolvedVars` | `shared.tsx` | Campionatura token runtime (`useResolvedVars` rimossa perché inutilizzata) |
| `DSCtx` / `useDSContext` | `shared.tsx` | Dark mode per specimen |
| `LogoConstructionSection` | `foundations-logo.tsx` | Blueprint logo |
| `RecipeConfiguratorSpec` / `RecipeTimelineSpec` | `components-d.tsx` | Specimen app-specific |
| `ModalScoreDashboardSpec` | `components-c.tsx` | Specimen legacy-named di modale score con dati demo; non implica un file runtime `score-dashboard.tsx` |
| `CarouselSpec` | `components-h.tsx` | Carousel spring + swipe |
| `DebugOverlay` | `debug-overlay.tsx` | Gate sempre montato che lazy-carica il workspace di annotazioni bug-fix (canvas, editing pin, copia prompt) solo quando il debugger è attivo; sync prod↔locale via Cloudflare Pages Function + D1, stato `resolved`/tombstone |

## Costanti e configurazione

| Ordine | Conteggio | Esempi id |
|--------|-----------|-----------|
| `FOUNDATION_ORDER` | 17 | `colors`, `typography`, `glass`, `contrast`, `a11y` |
| `COMPONENT_ORDER` | 26 | `buttons`, `scorering`, `configurator`, `timeline` |
| `PATTERN_ORDER` | 8 | `pat-selection`, `tmpl-build`, `tmpl-result` |

**Route** (`routes.ts`): `design-system` e `dev` / `dev/:tab` fuori tab bar (tool nascosti).

**Aggiungere una sezione:** esportare `ENTRIES` nel modulo, registrare id in `ALL_ENTRIES` via import array, aggiungere id all’array ordine corretto in `index.tsx` (commento in testa file).

## Guard rail e vincoli

- Id mancanti in registry → `console.warn('[DS] Foundation/Component/Pattern "…" not found')` e sezione omessa.
- `DesignSystemPage` e `DevTools` passano `darkMode`/`setDarkMode` da `useDarkMode()` (`root-layout`) — specimen devono usare `DSCtx` o props, non tema hardcoded.
- Specimen importano componenti produzione (`ScoreRing`, `RecipeStatStrip`, …) e componenti ds reali (`CtaButton`, `Badge`, ecc.): lo showcase è ora un reale consumatore del Design System, evitando duplicazioni visive.
- `/design-system` ottimizzato per export visivo (minimo chrome); `/dev` include altre tab (CMS, engine test, feedback).
- **Scorciatoie AI Debugger**: `Ctrl + Option + A` (o `Ctrl + Alt + A` su Windows) è la scorciatoia principale e libera da conflitti browser/estensioni; `Ctrl + Shift + X` (o `Cmd + Shift + X` su macOS) funge da fallback. Il triplo tocco mobile sul viewport fa lo stesso.
- Non documentare i primitivi `components/ui/*` in this capitolo; dopo la pulizia 2026-06-19 resta solo lo stretto necessario (`switch`, hook mobile, helper classi).
- **Gestione Placeholder Immagini**: `ImageWithFallback.tsx` intercetta esplicitamente la stringa `"placeholder"` (o sorgenti nulli/vuoti) per forzare il rendering immediato del layout di fallback SVG, prevenendo errori di caricamento del browser o visualizzazioni vuote.
- `step-header.tsx` è stato rimosso ed integrato in `ds/StepHeader.tsx` (Tier 4).
- **Modello a 6 Tier**: Rispettare sempre la direzione di consumo `Schermata → T6 → T5 → T4 → T3/T3.5 → (T2 → T1)`. Non consumare mai token primitivi T1 (`--color-*`) o literal hex direttamente nel codice app; consumare solo token semantici T2 o componenti T4.
- **Enforcement automatico**: L'enforcement dei token e l'integrità del design system sono monitorati tramite `npm run check:tokens` e `npm run verify` integrati nei pre-commit hooks e nella CI.
- **Dimensionamento Font Fluido per Mobile**: In `theme.css` sono state introdotte media query per ottimizzare la dimensione base del font (`font-size` a `15px` sotto 768px, e a `14.25px` sotto 390px) per migliorare la leggibilità ed evitare sfondamenti di testo sui dispositivi mobili con schermi stretti.
- **Prevenzione Scroll Orizzontale**: Aggiunto il blocco di sicurezza `overflow-x: hidden` e `max-width: 100%` sui tag `html`, `body` e sui container root di `app-shell.tsx` per impedire lo scroll o il bounce orizzontale della viewport.

## Neural Expressive Design & Sfondi Ambientali

Vulcan introduce una variante estetica **Neural Expressive** che simula la fluidità e la dinamicità dell'intelligenza artificiale tramite tre pilastri:
1. **Neo-Gradienti**: Palette neon composte da indaco, viola e rosa brillante, in contrapposizione ai colori caldi e terrosi della cottura classica.
2. **Liquid Morphing**: Transizioni continue e biologiche della mascotte `DoughBlob` controllate da interpolazioni di `borderRadius` nei fotogrammi chiave CSS.
3. **Ambient Glow**: Il componente `FireGlow` passa dinamicamente da un'atmosfera a brace arancio (`warm`) a un'aurora indaco-fucsia pulsante (`neural`).

### Token CSS correlati (`theme.css`)
- `--blob-body-neural`: Gradiente lineare 135° indaco/viola/rosa controllato dai token tema.
- `--blob-glow-neural`: Bagliore radiale viola e indaco al passaggio.
- `--blob-accent-neural`: Riflesso angolare 225° a contrasto.
- `--blob-satellite-neural`: Il satellite (lievito/bolla) orbitante si illumina di un rosa vivido fucsia.
- `--glow-*-neural`: Colori di supporto per l'effetto aurora di sfondo.

### Regole di Attivazione e Visualizzazione
La transizione visiva è accoppiata allo stato dell'applicazione:
- **Trigger**: Quando l'utente attiva **PizzaNerd** (`nerdMode === true`) per studiare grafici alveografici e termodinamica, i blocchi tecnici possono usare `FireGlow`/`DoughBlob` in variante `neural`. Il gate globale è nel profilo (`vulcan_nerd_on`), mentre il toggle locale vive in Home/Recipe.
- **Showcase DS**: La sezione Brand Hero in `foundations-logo-brand.tsx` include comandi interattivi per forzare e testare le varianti `forge` (default) e `neural` in isolamento.

## Bug noti e fix

- Registry monolitico: ordine e discoverability dipendono dagli array in `index.tsx` — nessun routing per-file.
- Alcuni commenti numerazione (es. C26) vanno verificati se si aggiungono voci a `COMPONENT_ORDER`.
- `carousel-variants.tsx` separato da `components-h.tsx` per dimensione — stesso pattern ENTRIES.
- Dopo refactor token in `theme.css` o rename componenti: `kipi update design-system`.
