# Design system e dev UI
> Aggiornamento: 2026-06-19 | Stato: ✅ | File documentati: 29

## Sommario

Showcase interattivo del design M3/M3 Expressive di Vulcan: **registry a sezioni** in `design-system/index.tsx` (~900 righe), moduli `foundations-*` / `components-*` / `patterns-templates`, utilità in `shared.tsx`. Accesso in due modi: route standalone `/design-system` (pagina full-bleed per screenshot/Figma) e tab **Design** dentro `/dev` (`DevTools` → `DesignSystemTab`). I pochi primitivi rimasti in `components/ui/` (`switch`, `use-mobile`, `utils`) sono fuori scope — questo capitolo documenta token, pattern e composizioni app-specifiche.

## File chiave

| File | Ruolo |
|------|--------|
| `src/app/pages/design-system.tsx` | Route `/design-system`: header sticky, toggle dark, render `DesignSystemTab` |
| `src/app/pages/dev.tsx` | Route `/dev` e `/dev/:tab` → wrapper `DevTools` |
| `src/app/components/dev-tools.tsx` | Tab dev incluso `design` → `DesignSystemTab` |
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
| `src/app/components/design-system/components-a.tsx` … `components-h.tsx` | Specimen componenti UI (bottoni, input, score, carousel, …) |
| `src/app/components/design-system/carousel-variants.tsx` | Varianti carousel M3 |
| `src/app/components/design-system/patterns-templates.tsx` | Pattern P01–P06, template pagina build/result |
| `src/app/components/dough-mascot.tsx` | `DoughBlob` reattivo all'energia con 7 varianti (`stretch`, `rise`, `rest`, `spin`, `fold`, `forge`, `neural`) |
| `src/app/components/fire-glow.tsx` | Sfondo a gradiente radiale animato con varianti `warm` e `neural` |
| `src/app/components/figma/ImageWithFallback.tsx` | Image component con fallback SVG se caricamento fallisce |
| `src/app/components/info-tip.tsx` | M3 Rich Tooltip fluttuante per info ed errori contestuali |
| `src/app/components/vulcan-hero.tsx` | Composizione brand-identity vulcan: DoughBlob ("forge") + VulcanMark centralizzato |
| `src/app/components/vulcan-logo.tsx` | `VulcanMark` geometrico del brand con 5 scale ottiche per viewBox 32x32 |

**Stili globali:** token CSS in `theme.css` (riferimento da sezioni foundations); non duplicati qui.

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
| `resolveVar` / `useResolvedVars` | `shared.tsx` | Campionatura token runtime |
| `DSCtx` / `useDSContext` | `shared.tsx` | Dark mode per specimen |
| `LogoConstructionSection` | `foundations-logo.tsx` | Blueprint logo |
| `RecipeConfiguratorSpec` / `RecipeTimelineSpec` | `components-d.tsx` | Specimen app-specific |
| `ModalScoreDashboardSpec` | `components-c.tsx` | Specimen legacy-named di modale score con dati demo; non implica un file runtime `score-dashboard.tsx` |
| `CarouselSpec` | `components-h.tsx` | Carousel spring + swipe |

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
- Specimen importano componenti produzione (`ScoreRing`, `RecipeStatStrip`, …): modifiche UI app possono rompere lo showcase.
- `/design-system` ottimizzato per export visivo (minimo chrome); `/dev` include altre tab (CMS, engine test, feedback).
- Non documentare i primitivi `components/ui/*` in questo capitolo; dopo la pulizia 2026-06-19 resta solo lo stretto necessario (`switch`, hook mobile, helper classi).
- `step-header.tsx` è stato rimosso: eventuali riferimenti a StepHeader/ScrollSection dentro `patterns-templates.tsx` sono testo di specimen storici, non file runtime da importare.

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
