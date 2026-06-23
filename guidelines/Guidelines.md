# Vulcan Pizza Lab — Knowledge Base

> Ultimo audit: 18 marzo 2026
> Stato: MVP completo, estetica editoriale premium, iframe-ready, 15 stili pizza, routing multi-pagina, CMS 7-lingue, Style Editor con liveSync, 10 DB parametrici, 25 farine, glossario i18n, i18n stili/deviazioni/autori, deviation tracking in ScientificLayer, E-Score enhanced, schema versioning 1.4, Regola 55 water temp, topping awareness nel solver, flour variability (W±std+stagionale), 9 author variants (Pepe Layering/Bianco/Forkish aggiunti), TOPPING_DB completo 15 stili, color-mix() safety su motion.\*

---

## 1. Identita e visione

Vulcan Pizza Lab e un configuratore di ricette pizza che gira come iframe. Lo stile e **editoriale premium** ispirato a riviste food di alto livello. Non e un tool tecnico con UI fredda: e un'esperienza narrativa dove l'utente viene guidato con calore verso la "pizza perfetta".

**Principi guida:**

- Ogni interazione racconta qualcosa — mai UI generica
- I dati scientifici esistono ma sono "dietro le quinte" (PizzaNerd toggle)
- L'utente principiante deve sentirsi sicuro, l'esperto deve trovare profondita
- Nessuna barra step orizzontale — il flusso e scroll verticale con 3 sezioni snap

---

## 2. Architettura componenti

### Routing (React Router v7, Data mode)

**Stato attuale (Epic NAV completata — VPL-055→064):**

```
App.tsx                     RouterProvider (6 righe, solo bootstrap)
  +-- routes.ts             createBrowserRouter
       +-- AppShell         layout con tab bar Material 3 + providers (VPL-055)
            +-- HomePage         /           wizard guidato (tab Crea) (VPL-060)
            +-- ExplorePage      /explore    catalogo 15 stili (tab Stili) (VPL-059)
            +-- SearchPage       /search     ricerca globale (tab Cerca) (VPL-061)
            +-- LearnPage        /learn      hub educativo (tab Impara) (VPL-062)
            +-- GlossaryPage     /learn/glossary     (sotto-pagina Impara)
            +-- TroubleshootingPage /learn/troubleshooting (sotto-pagina Impara)
            +-- ProfilePage      /profile    setup utente + FTU (tab Profilo) (VPL-057)
            +-- RecipePage       /recipe/:styleId  ricetta self-contained + deep linking (VPL-058/064)
            +-- DevToolsPage     /dev/:tab?  (nascosto dalla tab bar)
            +-- DesignSystemPage /design-system (nascosto)
            +-- CmsPage          /cms (nascosto)
            +-- NotFoundPage     * catch-all
       Legacy redirects: /troubleshooting → /learn/troubleshooting, /glossary → /learn/glossary
```

**Tab bar (5 tab, Material 3 navigation bar):**
| Tab | Icona | Route | Mobile | Desktop |
|-----|-------|-------|--------|---------|
| Crea | Flame | `/` | bottom bar | sidebar rail |
| Stili | BookOpen | `/explore` | bottom bar | sidebar rail |
| Cerca | Search | `/search` | bottom bar | sidebar rail |
| Impara | GraduationCap | `/learn` | bottom bar | sidebar rail |
| Profilo | User | `/profile` | bottom bar | sidebar rail |

**Shortcut:** `Ctrl+Shift+D` naviga tra `/dev` e `/` (gestito in AppShell).

### Dependency graph (da HomePage, orchestrator)

```
pages/home.tsx (orchestrator, tutto lo stato build/result)
|
+-- FireGlow               sfondo animato, prefers-reduced-motion OK
+-- VulcanHero             composizione logo + blob (vulcan-hero.tsx)
|   +-- VulcanMark         logo SVG (V serif con cornicione) (vulcan-logo.tsx)
|   +-- DoughBlob          mascot blob energy-reactive (dough-mascot.tsx)
|
+-- ProgressPill           indicatore sezione desktop (scroll-companion.tsx)
+-- MobileProgressBar      indicatore sezione mobile (scroll-companion.tsx)
+-- ScrollSection          wrapper soft-focus dimming per sezioni (scroll-section.tsx)
|
+-- UserNeeds              sezioni "context" + "setup" (data-section)
|   +-- StepHeader         titolone editoriale (01/02/03) (step-header.tsx)
|   +-- SectionHeader      sottotitolo sezione
|   +-- UnifiedChip        toggle chip con check animato
|   +-- InlineTip          tip contestuale con Lightbulb
|   +-- (pizza-engine)     TIME_SLOTS, OVEN_PRESETS, SKILL_LEVELS
|   +-- (cms)              useCms(), t()
|
+-- RecommendedStyles      sezione "styles" (data-section) (recommended-styles.tsx)
|   +-- STYLE_PHOTOS       URL Unsplash curate per stile
|   +-- ScoreRing          importato da score-ring.tsx (DRY)
|   +-- FamilyFilter       chips filtro per famiglia (Tutte/Napoletana/Romana/Americana/Contemporanea)
|   +-- (pizza-engine)     recommendStyles(), PIZZA_FAMILIES, FamilyId
|   +-- (cms)              useCms()
|
+-- StyleDetailSheet       modal bottom sheet per dettagli stile (style-detail-sheet.tsx)
|
+-- ScoreDashboard         pannello score con toggle PizzaNerd (score-dashboard.tsx)
|   +-- Recharts           RadarChart a 5 assi in nerd mode
|   +-- createPortal       modale fullscreen (z-index 9999)
|   +-- (pizza-engine)     RecipeScores, ScientificLayer
|   +-- (cms)              useCms()
|
+-- RecipeStatStrip        strip 4 metriche chiave (recipe-stat-strip.tsx)
|   +-- (cms)              useCms(), createFormatter()
+-- RecipeConfigurator     slider fine-tuning: idratazione, W, P/L, fermentazione (recipe-configurator.tsx)
|   +-- InfoTip            popover help con HelpCircle (info-tip.tsx)
|
+-- RecipeOutput           ingredienti + timeline procedurale (recipe-output.tsx)
    +-- Clipboard/Share    API con fallback per iframe
    +-- (parametric-databases) getFoldingByStyle, getToppingByStyle, getEquipmentByStyle, getBakingTimeByStyle, getScoringByStyle
    +-- (cms)              useCms(), createFormatter(), CmsTimelineStep
```

### Context Providers (in RootLayout, avvolgono tutto)

```
CmsProvider                gestisce stato CMS + locale + override
  +-- StylesOverrideProvider   gestisce override stili da Style Editor
       +-- Outlet          React Router outlet
```

### Componenti ausiliari

| File                          | Righe | Note                                                                                                                                                                                     |
| ----------------------------- | ----- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `scroll-companion.tsx`        | 457   | ProgressPill + MobileProgressBar, allineato a 3 sezioni                                                                                                                                  |
| `scroll-section.tsx`          | 108   | ScrollSection wrapper con soft-focus dimming                                                                                                                                             |
| `score-ring.tsx`              | 71    | ScoreRing standalone importato da recommended-styles.tsx (DRY)                                                                                                                           |
| `vulcan-hero.tsx`             | 110   | Composizione armonizzata VulcanMark + DoughBlob                                                                                                                                          |
| `dough-mascot.tsx`            | 411   | DoughBlob con varianti (forge, idle, ecc.), mood da score                                                                                                                                |
| `vulcan-logo.tsx`             | 161   | VulcanMark SVG con varianti ember/mono/auto                                                                                                                                              |
| `info-tip.tsx`                | 148   | Popover help con HelpCircle, usato in RecipeConfigurator                                                                                                                                 |
| `step-header.tsx`             | 70    | StepHeader editoriale con animazione whileInView                                                                                                                                         |
| `style-detail-sheet.tsx`      | 420   | Bottom sheet modale con 7 pill dati + sezione "Dettagli cottura" da database parametrici                                                                                                 |
| `styles-override-context.tsx` | 100   | React Context per override stili dal Style Editor                                                                                                                                        |
| `fire-glow.tsx`               | 125   | Sfondo animato con glow, prefers-reduced-motion                                                                                                                                          |
| `troubleshooting-data.ts`     | 195   | Database 18 problemi pizza + avvisi contestuali                                                                                                                                          |
| `troubleshooting-panel.tsx`   | 305   | ContextualWarnings + TroubleshootingGuide UI                                                                                                                                             |
| `dietary-data.ts`             | 180   | 6 filtri dietetici, FODMAP/istamina cinetiche, conflitti                                                                                                                                 |
| `pre-ferment-guide.tsx`       | 290   | Card educativa Biga/Poolish/Autolisi con tabella comparativa                                                                                                                             |
| `deviation-tags.ts`           | 380   | Deviation Signatures, Tag multi-dimensionali, Author Variants (9 maestri: +Pepe Layering, Bianco, Forkish)                                                                               |
| `flour-database.ts`           | 590   | Database farine espanso (25 farine) con variabilita W (w_std, w_seasonal_variation_pct) + getEffectiveWRange()                                                                           |
| `flour-suggestion-card.tsx`   | 210   | Card suggerimento farine compatibili nel recipe output                                                                                                                                   |
| `glossary-data.ts`            | 350   | Database 30+ termini tecnici (reologia, fermentazione, termica, chimica, meccanica, scoring)                                                                                             |
| `glossary-link.tsx`           | 80    | Componente GlossaryLink con varianti inline/badge per deeplink al glossario                                                                                                              |
| `parametric-databases.ts`     | 340   | 10 database parametrici per stile — TOPPING_DB ora completo 15/15 stili (temperature forno, tempi cottura, impasto, sale, acqua, maturazione, condimento, pieghe, scoring, attrezzatura) |

### DevTools (`/dev`, 5 tab consolidati)

| Tab ID    | Label         | Contenuto                                                                                          |
| --------- | ------------- | -------------------------------------------------------------------------------------------------- |
| `project` | Progetto      | GitHub links, health check, bundle analysis, issue tracker                                         |
| `design`  | Design System | Catalogo DS interattivo completo                                                                   |
| `editor`  | Style Editor  | Editor 15 stili con smart import, diff, validazione                                                |
| `engine`  | Engine Lab    | Compensazioni, Q10, punteggi, radar chart, **Test Suite** (12 categorie, ~100+ test auto-adattivi) |
| `sync`    | Sync          | Scansione, export/import bundle, diff viewer, prompt AI                                            |

**Legacy URL redirect:** `LEGACY_TAB_MAP` mappa i vecchi ID (overview, audit, styles, compensations, q10, scores) ai nuovi tab.

### Design System (`/src/app/components/design-system/`)

Catalogo interattivo completo, accessibile a `/design-system` (standalone) e via DevTools tab. Contiene 20 file:

- `index.tsx` — orchestrator con sidebar navigazione + registry sezioni
- `shared.tsx` — context (DSCtx, SectionNumCtx) e tipi condivisi
- `foundations*.tsx` — 8 file: core, dynamics, glass, logo, logo-brand, ext, m3e, contrast-density
- `components-*.tsx` — 8 file: a, b, c, d, f, g, g2, h
- `carousel-variants.tsx` — varianti carousel
- `patterns-templates.tsx` — P01–P08 pattern e template

### CMS (`/src/app/components/cms/`)

| File               | Righe | Funzione                                                                             |
| ------------------ | ----- | ------------------------------------------------------------------------------------ |
| `cms-context.tsx`  | 1273  | CmsProvider, useCms(), CMS_DEFAULTS, CMS_SECTIONS, schema completo                   |
| `i18n.ts`          | 61    | t() template helper, createFormatter() con cookTime/fermentTime/clockTime/tempSuffix |
| `locales/index.ts` | 53    | Registry LOCALE_BUNDLES, LOCALE_META, LOCALE_BCP47                                   |
| `locales/en.ts`    | 321   | Bundle inglese completo                                                              |
| `locales/es.ts`    | 246   | Bundle spagnolo                                                                      |
| `locales/de.ts`    | 243   | Bundle tedesco                                                                       |
| `locales/fr.ts`    | 243   | Bundle francese                                                                      |
| `locales/pt.ts`    | 243   | Bundle portoghese                                                                    |
| `locales/ja.ts`    | 321   | Bundle giapponese                                                                    |

**Consumer:** 9 file importano `useCms()`: home.tsx, user-needs.tsx, recommended-styles.tsx, score-dashboard.tsx, recipe-output.tsx, recipe-stat-strip.tsx, style-detail-sheet.tsx, glossary.tsx, cms.tsx (editor).

### Directory `ui/` (dead code — VPL-032 blocked)

46 componenti shadcn/radix in `/src/app/components/ui/` — **non importati** da nessun componente attivo. Candidati alla rimozione manuale fuori dal sandbox (file protetti).

---

## 3. Design system — "Cucina Editoriale"

### Palette

| Ruolo                  | Token CSS            | Light   | Dark    |
| ---------------------- | -------------------- | ------- | ------- |
| Primary (terracotta)   | `--primary`          | #D04A2F | #F4926A |
| CTA (salvia)           | `--cta`              | #2B7B55 | #72C8A6 |
| Tertiary (ambra)       | `--tertiary`         | #CC8844 | #E0A866 |
| Background (parchment) | `--background`       | #FDFBF7 | #131211 |
| Secondary (mocha)      | `--secondary`        | #857568 | #B0A69C |
| Muted foreground       | `--muted-foreground` | #786A5C | #B5AAA0 |

**Token architecture:** 3 tier — Primitives (`--color-terracotta-500`), Semantic (`--text-accent`, `--surface-container`), Component (`--chip-active-bg`). Definiti in `theme.css`.

**Gradienti chiave:**

- `--grad-ember`: terracotta -> arancio -> ambra (logo, brand)
- `--grad-sage`: salvia -> salvia chiaro (CTA buttons)
- `--grad-warm`: parchment tonal (backgrounds)

**Time-of-day sub-palette:** 5 colori unici per i time slot (tonight/lunch/dinner/dayafter/weekend), ognuno con variante `-soft`. Definiti in theme.css sia light che dark.

### Tipografia

| Font             | Uso                                             | Classe Tailwind | Note                              |
| ---------------- | ----------------------------------------------- | --------------- | --------------------------------- |
| Playfair Display | h1, h2, hero, titoli sezione                    | `font-serif`    | italic per sottotitoli            |
| DM Sans          | Body, UI, etichette, bottoni                    | default body    | `tabular-nums` per tutti i numeri |
| DM Mono          | Step numbers (01/02/03), dati funzionali, badge | `font-mono`     | Sempre uppercase + letter-spacing |

**Sizing:** usare `clamp()` per heading responsive. Default base: `h1: 3.5rem`, `h2: 2.5rem`, `h3: 1.25rem`. Le regole sono in `theme.css @layer base`.

**CSS utility classes (theme.css @layer components):** `type-data`, `type-label`, `type-subheading`, `surface-card`, `badge-base` — per stile consistente senza inline style ripetitivo.

**REGOLA CRITICA:** Non usare classi Tailwind per font-size/font-weight/line-height (es. `text-2xl`, `font-bold`). Usare inline style o i default di theme.css.

### Pattern editoriali ricorrenti

**StepHeader** (titolone sezione):

```
[DM Mono] "01 — Contesto"    <- terracotta, 0.6875rem, uppercase, tracking 0.18em
[Playfair] "Quando e dove"    <- clamp responsive, line-height 1.1
[Playfair italic] "Tempo..."  <- muted, opacity 0.65
[linea decorativa]            <- 2rem wide, 2px, primary, opacity 0.35
```

Tutti animati con `whileInView` (once: true, amount: 0.5).

**Chip (UnifiedChip):**

- Inattivo: `var(--surface-container)` bg, `var(--outline-variant)` border
- Attivo: `var(--primary)` bg, animated Check icon
- Sempre: `rounded-xl`, padding `px-4 py-2.5`, font 0.8125rem

**Card/Container pattern:**

- Background: `var(--surface-container-low)` o `var(--surface-container)`
- Border: `1px solid var(--outline-variant)`
- Radius: `rounded-2xl` (1rem)
- No box-shadow di default (ombre solo per elementi floating)

**Glassmorphism (header/sticky):**

```css
background: color-mix(
  in srgb,
  var(--background) 88%,
  transparent
);
backdrop-filter: blur(24px) saturate(1.6);
border-bottom: 1px solid var(--border-muted);
```

---

## 4. Pizza Engine — guida algoritmica

### 15 stili nel database (`STYLES_DB`)

4 famiglie: **napoletana** (2), **romana** (4), **americana** (4), **contemporanea** (5).

| ID                 | Nome                  | Famiglia      | Idratazione | W Range             | P/L Range | Forno          | Fat            | Beginner |
| ------------------ | --------------------- | ------------- | ----------- | ------------------- | --------- | -------------- | -------------- | -------- |
| napoletana_stg     | Napoletana STG        | napoletana    | 55-62%      | 250-320 (AVPN 2024) | 0.55-0.70 | legna          | none           | No       |
| napoletana_canotto | Canotto Contemporanea | napoletana    | 70-80%      | 300-350             | 0.50-0.65 | elettrico alto | none           | No       |
| teglia_romana      | Teglia Romana         | romana        | 80-100%     | 300-350             | 0.50-0.70 | elettrico std  | oil 2.5%       | Si       |
| tonda_romana       | Tonda Romana          | romana        | 55-60%      | 160-210             | 0.40-0.60 | elettrico std  | oil 2.5%       | Si       |
| pinsa_romana       | Pinsa Romana          | romana        | 75-85%      | 280-330             | 0.55-0.75 | elettrico alto | oil 1%         | No       |
| pala_romana        | Pala Romana           | romana        | 70-80%      | 280-340             | 0.50-0.65 | elettrico alto | oil 1.5%       | No       |
| new_york           | New York Style        | americana     | 62-68%      | 280-340             | 0.55-0.70 | elettrico std  | oil 2.5%       | Si       |
| detroit            | Detroit Style         | americana     | 68-78%      | 290-350             | 0.55-0.70 | elettrico std  | oil 3%         | Si       |
| chicago_deep       | Chicago Deep Dish     | americana     | 48-58%      | 230-290             | 0.45-0.60 | elettrico std  | **butter 18%** | Si       |
| grandma_style      | Grandma Style         | americana     | 60-68%      | 260-320             | 0.55-0.70 | elettrico std  | oil 4%         | Si       |
| bonci_teglia       | Metodo Bonci          | contemporanea | 85-100%     | 320-380             | 0.50-0.65 | elettrico std  | oil 3%         | Si       |
| focaccia_genovese  | Focaccia Genovese     | contemporanea | 65-75%      | 220-280             | 0.45-0.65 | elettrico std  | oil 8%         | Si       |
| sfincione          | Sfincione Palermitano | contemporanea | 65-72%      | 250-300             | 0.50-0.65 | elettrico std  | oil 3%         | Si       |
| focaccia_recco     | Focaccia di Recco     | contemporanea | 50-55%      | 180-220             | 0.40-0.55 | elettrico alto | oil 5%         | No       |
| padellino_torino   | Pizza al Padellino    | contemporanea | 65-75%      | 280-330             | 0.50-0.65 | elettrico std  | oil 2%         | Si       |

### DoughParameters — interfaccia completa

```typescript
interface DoughParameters {
  flour_w_range: [number, number];
  flour_pl_range: [number, number]; // P/L alveografico
  hydration_pct_range: [number, number];
  salt_pct: number;
  oil_pct: number;
  fat_type: "oil" | "butter" | "lard" | "none";
  sugar_pct: number;
  fermentation_hours_range: [number, number];
  process_type: string;
}
```

### Composite score (5 assi, pesi)

```
composite = authenticity     * 0.30
          + feasibility      * 0.25
          + digestibility    * 0.20
          + sustainability   * 0.15
          + experimentation  * 0.10
```

I pesi sono configurabili via CMS (`cms.scoreDimensions.*.weight`).

### Recommendation engine (pesi)

```
recommendation = time   * 0.25
               + oven   * 0.25
               + skill  * 0.20
               + equip  * 0.10
               + pantry * 0.20
```

I pesi sono configurabili via CMS (`cms.recommendationWeights.*`).

Pantry (20%) include: matching W farine (`FLOUR_W_RANGES`), bonus lievito madre per stili a lunga maturazione, malus se solo sourdough con fermentazione breve.

### Q10 variabile (`getQ10()`)

| Condizione                    | Q10 | Modello        |
| ----------------------------- | --- | -------------- |
| Lievito commerciale, T >= 10C | 2.0 | `standard`     |
| Lievito commerciale, T < 10C  | 1.6 | `cold_adapted` |
| Lievito madre, T > 15C        | 2.2 | `sourdough`    |
| Lievito madre, T <= 15C       | 1.9 | `sourdough`    |

**Riferimento:** PMC7146123, dati Saccharomyces cerevisiae; LAB (Lactobacillus) Q10 1.9-2.4.

### Motore di compensazione (`calculateOvenCompensations()`)

Quando la temperatura del forno e inferiore all'ideale, il motore applica 5 compensazioni parametriche:

| Compensazione | Modello                                        | Trigger                   | Note                                                |
| ------------- | ---------------------------------------------- | ------------------------- | --------------------------------------------------- |
| Idratazione   | **Logaritmico** `5 * ln(1 + deficit/50)`       | deficit > 20C             | Modernist Pizza 2021: lineare sovrastima/sottostima |
| Grasso        | Lineare +2% base                               | deficit > 150C            | Shortening per tenerezza                            |
| Zucchero      | Lineare +0.5% base                             | deficit > 100C + T < 300C | Boost Maillard a bassa T                            |
| Tempo cottura | **Arrhenius-like** `t_ideal * e^(k * deficit)` | deficit > 20C             | k=0.0065 ricalibrato (era 0.0045)                   |
| Spessore      | -10%/-20%                                      | deficit > 100C/200C       | Cottura interna uniforme                            |

Tutte le compensazioni sono tracciate in `science.compensations[]` per trasparenza.

### P/L estimation (`estimatePL()`)

Quando l'utente non fornisce il P/L della farina, il motore lo stima da W:

```
P/L_stimato = 0.3 + (W - 150) * 0.0015
```

Clampato nel range `flour_pl_range` dello stile. Correlazione basata su dati Caputo e Dallagiovanna.

### Selezione automatica lievito (`generateRecipe`)

Priorita: sourdough (se >=12h + pre-fermento disponibile) > fresh > dry > fallback sourdough.
Dosaggio commerciale: modello Arrhenius con **Q10 variabile** (ref 0.25% a 18C/24h).
Dosaggio sourdough: 15-20% baker's % in base alla durata.

### Authenticity Score — 4 assi

| Asse         | Peso | Include                       |
| ------------ | ---- | ----------------------------- |
| Ingredienti  | 30%  | Idratazione, W, P/L           |
| Processo     | 25%  | Durata fermentazione vs range |
| Attrezzatura | 35%  | Tipo forno, temperatura       |
| Forma        | 10%  | Baseline (non penalizzato)    |

### Feasibility Score — interazioni W/metodo

Oltre a forno (40%), farina (30%), skill (30%), include:

- **W x hydration interaction:** W alto + H alta = bonus; W basso + H alta = malus
- **Method bonus:** no_knead facilita principianti; biga/poolish penalizza skill 1

### Sustainability Score — 5 sotto-assi

| Sotto-asse             | Peso | Descrizione                                     |
| ---------------------- | ---- | ----------------------------------------------- |
| Efficienza forno       | 30%  | Temperatura relativa + normalizzazione assoluta |
| Tempo cottura          | 25%  | Piu breve = meno energia                        |
| Fermentazione          | 20%  | Ambiente = 0 energia frigo                      |
| Semplicita ingredienti | 15%  | Meno additivi = piu sostenibile                 |
| Tipo lievito           | 10%  | Sourdough autoprodotto = impatto zero           |

### ScientificLayer (PizzaNerd) — campi completi

| Campo                         | Significato                       | Unita     | Note                                       |
| ----------------------------- | --------------------------------- | --------- | ------------------------------------------ |
| yeast_baker_pct               | Dosaggio lievito                  | %         |                                            |
| effective_hours_18c           | Ore equivalenti a 18C             | h         | Usa Q10 variabile                          |
| fodmap_reduction_pct          | Riduzione FODMAP stimata          | % o null  |                                            |
| gluten_network                | Qualita rete glutinica            | 0-100     | W + H + metodo                             |
| proteolysis_index             | Degradazione proteica             | 0-100     |                                            |
| water_activity                | Attivita dell'acqua (aw)          | 0.96-0.99 |                                            |
| starch_degradation_pct        | Degradazione amido                | %         |                                            |
| q10_factor                    | Fattore velocita vs 18C           | ratio     |                                            |
| q10_model                     | Modello Q10 usato                 | string    | "standard"/"cold_adapted"/"sourdough"      |
| authenticity_breakdown        | Dettaglio per asse                | Record    |                                            |
| compensations                 | Compensazioni applicate           | array     | Traccia ogni aggiustamento                 |
| flour_pl_estimated            | P/L stimato dalla W               | number    |                                            |
| baking_energy_kj              | Stima energia cottura             | kJ        |                                            |
| deviation_category            | Categoria deviazione stile        | string    | Da STYLE_DEVIATIONS                        |
| deviation_score_intrinsic     | Deviazione intrinseca 0-1         | number    | Da deviation-tags.ts                       |
| deviation_score_effective     | Deviazione effettiva 0-1          | number    | Intrinseca + parametri + compensazioni     |
| compensation_deviation_points | Punti deviazione da compensazioni | string[]  | Es. ["dough_composition", "baking_medium"] |

### GeneratedRecipe — campi aggiuntivi

| Campo          | Tipo    | Note                                                                                          |
| -------------- | ------- | --------------------------------------------------------------------------------------------- |
| schema_version | string  | Versione schema ricetta (attuale: "1.4")                                                      |
| fat_g          | number  | Grammi grasso totale (olio O burro)                                                           |
| fat_label      | string  | "Olio EVO" / "Burro" / "Strutto" / ""                                                         |
| flour_pl       | number  | P/L stimato usato nella ricetta                                                               |
| topping_info   | object? | Dati condimento da TOPPING_DB (toppingOrder, saucePosition, cheeseType, cheesePosition, note) |

### Schema Versioning (Notion Pag.09)

| Costante                   | Valore  | Significato                                  |
| -------------------------- | ------- | -------------------------------------------- |
| `RECIPE_SCHEMA_VERSION`    | `"1.4"` | Versione corrente dello schema ricetta       |
| `RECIPE_SCHEMA_MIN_COMPAT` | `"1.2"` | Versione minima importabile senza migrazione |

**Changelog:**

- **1.0** — 9 stili, scoring base
- **1.1** — P/L alveografico, Q10 variabile, 5 compensazioni
- **1.2** — 15 stili, sustainability score, deviation_tags
- **1.3** — CMS i18n, parametric databases, flour database v3
- **1.4** — deviation_signature tracking, E-Score enhanced con compensation count, Regola 55, engineMessages i18n 7 lingue, effective_deviation_score, compensation_deviation_points

---

## 5. Flusso utente e stato

### Step "build" (3 sezioni scroll-snap)

```
data-section="context"  -> Meteo (geolocation + Open-Meteo) + Quando (5 time slot)
data-section="setup"    -> Skill + Dietary + Equipment + Oven + Pantry
data-section="styles"   -> Filtro famiglia + Grid stili raccomandati con tier (perfect/good/challenging)
```

### Step "result"

```
Cinematic photo header -> Stat strip -> Fine-tuning accordion -> Ingredients + Timeline
Desktop sidebar: ScoreDashboard (sticky)
Mobile: ScoreDashboard sticky sotto header
```

### Stato principale (in `pages/home.tsx`)

| Stato              | Tipo             | Default                 | Persistenza                                      |
| ------------------ | ---------------- | ----------------------- | ------------------------------------------------ |
| darkMode           | boolean          | false                   | localStorage (`vulcan_dark_mode`) via RootLayout |
| currentStep        | "build"/"result" | "build"                 | --                                               |
| selectedStyle      | PizzaStyle/null  | null                    | --                                               |
| selectedTimeSlot   | string/null      | null                    | --                                               |
| constraints        | UserConstraints  | home/250C/skill2/4balls | Oven + Pantry in localStorage                    |
| customHydration    | number           | 60                      | --                                               |
| customFlourW       | number           | 250                     | --                                               |
| customFlourPL      | number           | 0.55 (da stile)         | --                                               |
| customFermentHours | number           | 16                      | --                                               |
| customFermentTemp  | number           | 4                       | --                                               |
| usePreFerment      | boolean          | false                   | --                                               |
| panConfig          | PanConfig        | {} (da stile)           | --                                               |
| nerdMode           | boolean          | false                   | --                                               |
| showFineTuning     | boolean          | false                   | --                                               |

### localStorage

| Chiave                   | Contenuto                                 | Usato in                           |
| ------------------------ | ----------------------------------------- | ---------------------------------- |
| `vulcan_dark_mode`       | `"true"/"false"`                          | RootLayout (load/save)             |
| `vulcan_pantry`          | `{ flours: string[], yeasts: string[] }`  | UserNeeds (load/save)              |
| `vulcan_oven_pref`       | `{ ovenType: OvenType, maxTemp: number }` | UserNeeds (load/save)              |
| `vulcan_cms_overrides`   | JSON oggetto override CMS                 | CmsProvider (load/save)            |
| `vulcan_cms_locale`      | `LocaleId` string                         | CmsProvider (load/save)            |
| `vulcan_styles_override` | JSON mappa stili override                 | StylesOverrideProvider (load/save) |

---

## 6. Vulcan CMS — Content Management System

### Architettura

Il CMS e basato su un **React Context** (`CmsProvider`) che avvolge l'intera app in RootLayout. Pattern: override su top di default hardcoded (stessa architettura di StylesOverrideContext).

```
CmsProvider (root-layout.tsx)
  +-- CMS_DEFAULTS: CmsContent         hardcoded in cms-context.tsx (italiano)
  +-- LOCALE_BUNDLES: Record<LocaleId>  bundle lingue in cms/locales/
  +-- overrides: Partial<CmsContent>    persistiti in localStorage
  +-- switchLocale(id)                  carica bundle + sovrascrive
```

### Hook `useCms()`

```typescript
const {
  cms, // CmsContent completo (merged: defaults + locale + overrides)
  bcp47, // BCP 47 tag per Intl APIs (es. "it-IT")
  update, // (path: string, value: any) => void — singolo campo
  reset, // (path: string) => void — ripristina singolo campo
  resetAll, // () => void — ripristina tutto
  isModified, // (path: string) => boolean — campo modificato?
  modifiedCount, // number — totale campi modificati
  exportBundle, // () => string — JSON export
  importBundle, // (json: string) => void — JSON import
  switchLocale, // (id: LocaleId) => void — cambia lingua
} = useCms();
```

### Schema CmsContent — 15 sezioni, ~320+ campi

| Sezione              | ID                                                  | Campi | Descrizione                                                                                                                   |
| -------------------- | --------------------------------------------------- | ----- | ----------------------------------------------------------------------------------------------------------------------------- |
| Lingua & Locale      | `locale`                                            | 2     | Codice lingua + nome                                                                                                          |
| Testi UI             | `ui`                                                | ~90   | Bottoni, label, aria, clipboard, stat strip, nerd, weather, badges                                                            |
| Suggerimenti         | `tips`                                              | 5     | InlineTip contestuali                                                                                                         |
| Hero & Brand         | `hero`                                              | 6     | Titolo, sottotitolo, breadcrumb, heading risultato                                                                            |
| Step Headers         | `steps`                                             | 9     | Titoli delle 3 sezioni (numero/titolo/sottotitolo)                                                                            |
| Sezioni Setup        | `sections`                                          | 12    | Titoli e descrizioni delle 6 sotto-sezioni                                                                                    |
| Configurazione       | `config`                                            | ~40   | Time slot, forni, skill levels — label + valori                                                                               |
| Pesi & Score         | `scoring`                                           | 15    | Composite weights (5 assi) + recommendation weights (5 fattori)                                                               |
| Glossario            | `glossary`                                          | 24    | Label pagina glossario, categorie (6 discipline), ricerca, navigazione                                                        |
| Famiglie & Tiers     | `families`                                          | 18    | 4 famiglie (nome/desc/emoji) + 3 tier (label/subtitle)                                                                        |
| Timeline & Procedura | `timeline`                                          | ~43   | Step procedurali (titolo/desc/tipBeginner/tipNerd)                                                                            |
| Tip Parametrici      | `parametricTips`                                    | 37    | Data pill labels (9) + StyleDetailSheet section labels (12) + timeline tips nerd/beginner (10) + frammenti dinamici (4) + CTA |
| Media & Foto         | `media`                                             | 16    | URL Unsplash per 15 stili + fallback                                                                                          |
| Stili — Testi        | `styleDescriptions` + `styleChars`                  | 30    | 15 descrizioni + 15 key_characteristics (pipe-separated)                                                                      |
| Deviazioni & Autori  | `deviationLabels` + `authorNames` + `authorAuthors` | 17    | 5 categorie deviazione + 6 nomi metodo + 6 nomi autore                                                                        |

### i18n — 7 lingue

| Codice | Lingua     | BCP 47 | Bundle                   |
| ------ | ---------- | ------ | ------------------------ |
| `it`   | Italiano   | it-IT  | CMS_DEFAULTS (hardcoded) |
| `en`   | English    | en-GB  | `locales/en.ts`          |
| `es`   | Espanol    | es-ES  | `locales/es.ts`          |
| `de`   | Deutsch    | de-DE  | `locales/de.ts`          |
| `fr`   | Francais   | fr-FR  | `locales/fr.ts`          |
| `pt`   | Portugues  | pt-BR  | `locales/pt.ts`          |
| `ja`   | Giapponese | ja-JP  | `locales/ja.ts`          |

### i18n helpers (`cms/i18n.ts`)

| Funzione                     | Uso                                      |
| ---------------------------- | ---------------------------------------- |
| `t(template, vars)`          | Interpolazione template `{key}` → valore |
| `createFormatter(ui, bcp47)` | Factory che restituisce:                 |
| `.t(key, vars)`              | Accesso a `ui[key]` con template         |
| `.cookTime(sec)`             | Formatta secondi/minuti                  |
| `.fermentTime(hours)`        | Formatta ore                             |
| `.clockTime(date)`           | Formatta orario locale                   |
| `.tempSuffix(temp)`          | "a {t}°C" localizzato                    |

### CMS Page (`/cms`)

Editor interattivo a route dedicata con:

- Sidebar con 11 sezioni navigabili
- Campi tipo `text`, `textarea`, `number`, `slider`, `url`
- Indicatore campi modificati (badge conteggio)
- Reset singolo campo / reset globale
- Export/import JSON completo
- Selettore lingua con switch immediato
- Dark mode toggle

---

## 7. Style Editor & StylesOverrideContext

### StylesOverrideContext (`styles-override-context.tsx`)

React Context che permette al Style Editor di iniettare stili personalizzati nell'app principale. Quando attivo, l'app usa `effectiveStyles` (merge STYLES_DB + override) al posto di STYLES_DB puro.

```typescript
const {
  isOverrideActive, // boolean — ci sono override attivi?
  effectiveStyles, // Record<string, PizzaStyle> — stili effettivi
  setOverride, // (id: string, style: PizzaStyle) => void
  clearOverride, // () => void — ripristina tutti
} = useStylesOverride();
```

Persistenza in localStorage (`vulcan_styles_override`).

### Style Editor Tab (`style-editor-tab.tsx`, ~3622 righe)

Editor completo per tutti i 15 stili pizza con:

- **Smart import:** incolla JSON/YAML, il sistema auto-detecta lo schema
- **Prompt AI dinamico:** genera prompt per Claude con lo stato corrente dello stile
- **Diff viewer:** confronto visuale tra stato corrente e default
- **Pipeline dati:** schema JSON con validazione ~25 regole
- **Auto-calc:** ricalcolo automatico derivati (salt_g, fat_g, ecc.)
- **LiveSync bidirezionale:** modifiche nello Style Editor si riflettono immediatamente nell'app via `StylesOverrideContext`
- **Stati visivi:** indicatori colorati per stato dello stile (default/modificato/importato)

---

## 8. Convenzioni di codice

### Naming

- File componenti: `kebab-case.tsx` (es. `score-dashboard.tsx`)
- Export componenti: PascalCase (es. `ScoreDashboard`)
- Engine/logica: `kebab-case.ts` (es. `pizza-engine.ts`)
- CSS custom properties: `--kebab-case` con prefissi semantici (`--surface-*`, `--warm-*`, `--time-*`, `--grad-*`, `--shadow-*`, `--text-*`, `--container-*`)
- Commenti di sezione: `/* === TITOLO === */` con linee decorative

### Stile inline vs Tailwind

- **Tailwind:** layout (flex, grid, padding, margin, gap, rounded, overflow, sticky, fixed)
- **Inline style:** colori da CSS custom props, font-family, font-size, font-weight, letter-spacing, line-height, gradients, shadows, borders con variabili
- **Mai:** classi Tailwind per font-size (`text-2xl`), font-weight (`font-bold`), line-height (`leading-*`)
- **Mai:** `"transparent"` come valore CSS su elementi con `transition` — usare `rgba(0,0,0,0)` per evitare flash nero durante transizione
- **Mai:** `color-mix()` negli inline `style` di elementi `motion.*` (Motion tenta di parsare il colore risolto come `color(srgb ...)` e fallisce) — usare equivalente `rgba()` hardcoded

### Animazione

- Motion (`motion/react`) per tutto cio che si muove — `import { motion } from 'motion/react'`
- **Tap feedback:** `active:scale-95` (classe Tailwind) su `motion.button`, non `whileTap`
- `whileInView` con `viewport={{ once: true }}` per entrance animation
- **Sempre spring transitions**, mai `duration`/`ease` per entrance — `stiffness: 400-500, damping: 25-30` per micro-interactions
- `AnimatePresence mode="wait"` per transizioni di pagina
- **Mai** `React.Fragment` o `<>...</>` — usare sempre `<div>` o altro elemento concreto

### Accessibilita

- `prefers-reduced-motion`: rispettato in FireGlow, ScrollSection, DoughBlob, scroll-companion, hero glow
- `aria-label` su tutti i bottoni icon-only
- `aria-expanded` su toggle (InfoTip)
- Escape chiude popover/modali
- Skip-to-content link per screen reader
- Focus management nelle transizioni build -> result

---

## 9. Iframe Figma — vincoli tecnici

### Clipboard

```
1. navigator.clipboard.writeText (primario)
2. Fallback: createElement('textarea') + execCommand('copy')
```

### Modali

- `createPortal(node, document.body)` per ScoreDashboard fullscreen
- `position: fixed` con `z-index: 9999`
- Inline styles (no classi Tailwind per position/z-index in portal)

### Dark mode

- `.dark` applicato su `<html>` (document.documentElement) da RootLayout — i portali su `document.body` ereditano i token automaticamente
- `@custom-variant dark (&:is(.dark *))` in theme.css
- Tutti i token si invertono automaticamente
- Persistenza in localStorage (`vulcan_dark_mode`)
- Hook: `useDarkMode()` da `root-layout.tsx` (usa `useOutletContext`)

---

## 10. Issue Tracker

> **Repo:** `zatteogit/vulcan-pizza-lab`
> **Dettagli completi:** `docs/github-issues.md` (body, acceptance criteria, implementazione suggerita)
> **Convenzione ID:** `VPL-XXX` per issue numerate, `VPL-CXX` per issue chiuse pre-tracker
> **Fonte verita:** la lista canonica e nel componente `dev-tools.tsx` → array `issues[]` (tab Audit Log → tab project)

### Riepilogo stato (16 marzo 2026)

- **Chiuse:** 64 issue (VPL-C01→C06, VPL-001→017, VPL-019→031, VPL-034, VPL-040→064)
- **Blocked:** 2 issue (VPL-032, VPL-033) — richiedono intervento manuale fuori sandbox
- **Open:** 0 issue — Epic NAV completata

### Issue OPEN — Epic NAV (VPL-055→064)

| ID      | Priorita | Severita | Titolo                           | Dipendenze  |
| ------- | -------- | -------- | -------------------------------- | ----------- |
| VPL-055 | P1       | alta     | AppShell + Tab Bar Material 3    | —           |
| VPL-056 | P1       | alta     | Route restructuring              | VPL-055     |
| VPL-057 | P2       | alta     | ProfilePage + FTU onboarding     | VPL-056     |
| VPL-058 | P2       | alta     | RecipePage self-contained        | VPL-056     |
| VPL-059 | P2       | alta     | ExplorePage catalogo stili       | VPL-056     |
| VPL-060 | P3       | alta     | CreatePage wizard snello         | VPL-057     |
| VPL-061 | P3       | media    | SearchPage ricerca globale       | VPL-056     |
| VPL-062 | P3       | media    | LearnPage hub educativo          | VPL-056     |
| VPL-063 | P4       | media    | home.tsx decomposition & cleanup | VPL-058→062 |
| VPL-064 | P4       | media    | Deep linking + URL state sharing | VPL-058     |

**Architettura "Doppio binario":**

- Due entry point: wizard guidato (`/wizard`) per principianti, catalogo (`/explore`) per esperti
- Pagina ricetta self-contained (`/recipe/:styleId`) con parametri editabili inline
- Tab bar Material 3: Crea / Stili / Cerca / Impara / Profilo
- Mobile: bottom bar; Desktop: sidebar rail
- FTU (First Time Use) onboarding popola il Profilo al primo accesso
- URL come source of truth per sharing (`/recipe/:styleId?h=65&w=300&oven=wood`)

### Issue BLOCKED

| ID      | Tipo   | Titolo                                         | Motivo blocco                                            |
| ------- | ------ | ---------------------------------------------- | -------------------------------------------------------- |
| VPL-032 | bundle | 46 file `ui/` shadcn non importati — dead code | File `ui/` protetti dal sandbox, non eliminabili         |
| VPL-033 | bundle | ~35 npm packages orfani in package.json        | Richiede pulizia manuale `package.json` e `pnpm install` |

### Dead code cleanup (15 marzo 2026)

- **user-needs.tsx:** rimossi 8 import inutilizzati (5 icone Lucide: HelpCircle, Cookie, Droplet, GaugeCircle, Package; 2 icone: ChevronDown, ChevronUp; 2 hook React: useRef, useCallback)
- **Eliminati:** `/src/imports/Vulcan.tsx` + `/src/imports/svg-sn29cvdr6x.ts` (catena di import non referenziata da nessun componente attivo)
- **Confermato pulito:** tutti gli altri ~30 file attivi — nessun import fantasma, nessun `console.log` di debug, nessun `@ts-ignore`

### Bugfix & cleanup (18 marzo 2026)

- **recipe-output.tsx:** rimosso badge `T+` ridondante (mantenuto solo orario con giorno tipo `18:15 +1g`), rimosso dead code `fmtElapsed`/`elapsedMinutes` (fix errori TypeScript)
- **user-needs.tsx:** ridotto spacing verticale tra sezioni setup (`gap-1.5`, `-mb-6` su riga meteo per avvicinare a "La tua cucina"), aggiunto `mt-2` su bottone "La tua dispensa"
- **user-needs.tsx — TIME_COLORS:** rimosso `color-mix()` dai valori `text`, sostituito con `#ffffff` (i colori `color-mix` non servivano su testo bianco sopra bg colorati)
- **app-shell.tsx — tab-indicator:** rimosso `color-mix()` da `motion.div[layoutId="tab-indicator"]`, sostituito con `rgba(208,74,47,0.12)` — fix errore `Error parsing color: unknown format: color(srgb ...)` causato da Motion che tenta di interpolare colori risolti da `color-mix()`

### Issue CLOSED — highlights per area

**Engine (VPL-C01→C06, VPL-053):**

- Chicago Deep Dish butter fix, Q10 variabile, P/L alveografico, compensazioni Arrhenius, STG AVPN 2024, feasibility W/H, espansione 9->15 stili

**UX/UI (VPL-002, VPL-005, VPL-006, VPL-007, VPL-011, VPL-012, VPL-013, VPL-027→031, VPL-040→044, VPL-052, VPL-054):**

- Dark mode persistence, scroll-companion, ScoreRing DRY, lazy loading, ScrollSection soft-focus, slider P/L, compensazioni UI, tap feedback su tutti i bottoni, transparent->rgba fix, filtro famiglia

**Accessibilita (VPL-001, VPL-008, VPL-009, VPL-019→023, VPL-045):**

- DoughBlob/FireGlow/hero/scroll-companion reduced-motion, aria-label su tutti i bottoni icon-only, focus management, skip-to-content

**Token/CSS (VPL-031, VPL-046→051):**

- Font-size token scala, migrazione Tier 3 (foreground->text-default, background->container-page), transparent->rgba sweep completo

**DevOps/Docs (VPL-004, VPL-014, VPL-015, VPL-016, VPL-017, VPL-034):**

- Cleanup artefatti, build TypeScript, sub-route dev tools, Guidelines routing, Notion sync, DS patterns

---

## 11. Stack tecnologico

| Tecnologia   | Versione    | Uso                          |
| ------------ | ----------- | ---------------------------- |
| React        | 18.3.1      | Core UI                      |
| React Router | 7.13.0      | Routing Data mode            |
| Tailwind CSS | 4.1.12 (v4) | Utility classes              |
| Motion       | 12.23.24    | Animazioni (`motion/react`)  |
| Lucide React | 0.487.0     | Icone                        |
| Recharts     | 2.15.2      | RadarChart in ScoreDashboard |
| Vite         | 6.3.5       | Build tool                   |
| TypeScript   | 5.7.3       | Type checking                |

**Routing:** `App.tsx` -> `RouterProvider`, layout condiviso in `root-layout.tsx`, pagine in `/pages/` (`home.tsx`, `dev.tsx`, `design-system.tsx`, `cms.tsx`, `not-found.tsx`), route config in `routes.ts`.

**File attivi nel progetto:** ~68 file (`.tsx`, `.ts`, `.css`), escludendo i 46+2 file `ui/` dead code.

**Righe per file chiave:**

| File                      | Righe | Ruolo                                        |
| ------------------------- | ----- | -------------------------------------------- |
| `style-editor-tab.tsx`    | 3622  | Style Editor completo                        |
| `pizza-engine.ts`         | 2644  | Motore scientifico                           |
| `dev-tools.tsx`           | 1409  | DevTools 5 tab                               |
| `sync-tab.tsx`            | 1280  | Tab Sync con diff/prompt                     |
| `score-dashboard.tsx`     | 1278  | Dashboard punteggi + PizzaNerd               |
| `cms-context.tsx`         | 1273  | CMS Provider + schema                        |
| `user-needs.tsx`          | 1288  | Configuratore input utente                   |
| `home.tsx`                | 1255  | Orchestrator principale                      |
| `recipe-output.tsx`       | 1090  | Ingredienti + timeline + parametric tips     |
| `cms.tsx` (page)          | 931   | Editor CMS UI                                |
| `recipe-configurator.tsx` | 752   | Fine-tuning sliders                          |
| `recommended-styles.tsx`  | 720   | Grid stili raccomandati + filtri sfaccettati |

**Dead packages (VPL-033 blocked):** ~35 pacchetti npm in `package.json` non utilizzati (MUI, Radix, clsx, cmdk, date-fns, next-themes, react-dnd, react-hook-form, sonner, vaul, ecc.) — da rimuovere manualmente.

---

## 12. Regole per l'AI

1. **Mai toccare** `theme.css` a meno che l'utente non chieda esplicitamente un cambio di stile globale
2. **Sempre** usare CSS custom properties per colori, mai hex hardcoded nei componenti
3. **Sempre** `tabular-nums` su numeri con DM Sans
4. **Sempre** DM Mono per label funzionali (step numbers, badge dati, indicatori)
5. **Mai** classi Tailwind per font-size, font-weight, line-height
6. **Sempre** `active:scale-95` (Tailwind) su `motion.button` per tap feedback — non `whileTap`
7. **Sempre** `motion.div` con `initial/animate/transition` per entrance (non CSS transition per entrance)
8. **Sempre** transizioni **spring** (`stiffness`/`damping`), mai `duration`/`ease` per entrance animations
9. **Preferire** inline style con `var(--token)` rispetto a classi Tailwind personalizzate per colori
10. **Clipboard**: sempre doppio path (API + textarea fallback)
11. **Portal**: usare `createPortal(node, document.body)` con inline `position: fixed` e `zIndex: 9999` per overlay
12. **Lingua UI**: italiano per tutto il testo utente-facing (se locale = it)
13. **Import Motion**: sempre `import { motion } from 'motion/react'`, mai `framer-motion`
14. **Mai** `"transparent"` come valore CSS su elementi con `transition` — usare `rgba(0,0,0,0)`
15. **Mai** `color-mix()` negli inline `style` di `motion.*` — Motion non sa parsare `color(srgb ...)`, usare `rgba()` equivalente
16. **Mai** `React.Fragment` o `<>...</>` — usare sempre un elemento concreto come wrapper
17. **Sempre** verificare con `cat -n`/`tail`/`file_search` dopo modifiche significative
18. **CMS**: usare `useCms()` per tutti i testi utente-facing, non stringhe hardcoded
19. **i18n**: usare `t()` o `createFormatter()` per template con placeholder `{key}`

---

## 13. Setup locale e deployment

### Prerequisiti

| Strumento   | Versione minima              | Note                               |
| ----------- | ---------------------------- | ---------------------------------- |
| **Node.js** | 18.x LTS (consigliato 20.x+) | `node -v` per verificare           |
| **pnpm**    | 8.x+ (consigliato 9.x)       | Package manager usato nel progetto |
| **Git**     | 2.x                          | Per clonare il repository          |

> **Nota su npm/yarn:** il progetto usa `pnpm` come package manager (c'e un `pnpm-lock.yaml`). Si puo usare anche `npm` o `yarn`, ma `pnpm` e raccomandato per coerenza con il lockfile.

### 13.1 Installazione pnpm (se non presente)

```bash
# Metodo consigliato — corepack (incluso in Node 16.13+)
corepack enable
corepack prepare pnpm@latest --activate

# Alternativa — installazione globale
npm install -g pnpm
```

### 13.2 Clonare e installare

```bash
# 1. Clona il repo
git clone https://github.com/zatteogit/vulcan-pizza-lab.git
cd vulcan-pizza-lab

# 2. Installa le dipendenze
pnpm install

# 3. (Opzionale) Pulizia dead packages — VPL-033
#    Il package.json contiene ~35 dipendenze non utilizzate.
#    Per un'installazione piu leggera, rimuoverle prima:
pnpm remove \
  @emotion/react @emotion/styled @mui/icons-material @mui/material \
  @popperjs/core \
  @radix-ui/react-accordion @radix-ui/react-alert-dialog @radix-ui/react-aspect-ratio \
  @radix-ui/react-avatar @radix-ui/react-checkbox @radix-ui/react-collapsible \
  @radix-ui/react-context-menu @radix-ui/react-dialog @radix-ui/react-dropdown-menu \
  @radix-ui/react-hover-card @radix-ui/react-label @radix-ui/react-menubar \
  @radix-ui/react-navigation-menu @radix-ui/react-popover @radix-ui/react-progress \
  @radix-ui/react-radio-group @radix-ui/react-scroll-area @radix-ui/react-select \
  @radix-ui/react-separator @radix-ui/react-slider @radix-ui/react-slot \
  @radix-ui/react-switch @radix-ui/react-tabs @radix-ui/react-toggle-group \
  @radix-ui/react-toggle @radix-ui/react-tooltip \
  class-variance-authority clsx cmdk date-fns embla-carousel-react \
  input-otp next-themes react-day-picker react-dnd react-dnd-html5-backend \
  react-hook-form react-popper react-resizable-panels react-responsive-masonry \
  react-slick sonner tailwind-merge tw-animate-css vaul

# 4. (Opzionale) Rimozione directory ui/ — VPL-032
#    La cartella src/app/components/ui/ contiene 46 componenti shadcn/radix
#    non importati da nessun componente attivo. Eliminare l'intera directory:
rm -rf src/app/components/ui/
```

### 13.3 Avvio in modalita sviluppo

```bash
pnpm dev
```

Apre automaticamente `http://localhost:5173` nel browser. Il dev server Vite supporta:

- **HMR** (Hot Module Replacement) — le modifiche ai componenti si riflettono istantaneamente
- **SPA fallback** — tutte le route (`/dev`, `/design-system`, `/cms`, ecc.) servono `index.html`
- **Source maps** — debugging con i sorgenti originali `.tsx`

### 13.4 Build di produzione

```bash
# Build
pnpm build

# L'output finisce in dist/ con questa struttura:
# dist/
#   index.html
#   assets/
#     vendor-react-XXXXX.js    (React + React DOM + React Router)
#     vendor-motion-XXXXX.js   (Motion)
#     vendor-recharts-XXXXX.js (Recharts)
#     index-XXXXX.js           (app code)
#     index-XXXXX.css          (Tailwind + theme)

# Preview locale della build di produzione
pnpm preview
# -> http://localhost:4173
```

### 13.5 Pulizia del nome pacchetto

Il `package.json` ha `"name": "@figma/my-make-file"` — cambiarlo con il nome reale:

```json
{
  "name": "vulcan-pizza-lab",
  "private": true,
  "version": "1.0.0"
}
```

---

## 14. Deployment su server/hosting

### 14.1 Hosting statico (Netlify, Vercel, Cloudflare Pages)

L'app e una **SPA statica** — non richiede un server Node.js in produzione. Qualsiasi hosting statico funziona.

#### Netlify

Il file `public/_redirects` esiste gia con il contenuto:

```
/* /index.html 200
```

Questo gestisce il SPA routing. Configurazione:

| Campo             | Valore       |
| ----------------- | ------------ |
| Build command     | `pnpm build` |
| Publish directory | `dist`       |
| Node version      | 20           |

```bash
# Deploy via CLI
npx netlify-cli deploy --prod --dir=dist
```

#### Vercel

Creare `vercel.json` nella root:

```json
{
  "buildCommand": "pnpm build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

```bash
# Deploy via CLI
npx vercel --prod
```

#### Cloudflare Pages

| Campo                  | Valore       |
| ---------------------- | ------------ |
| Build command          | `pnpm build` |
| Build output directory | `dist`       |
| Root directory         | `/`          |
| Node version           | 20           |

Aggiungere un file `public/_headers` (opzionale, per caching):

```
/assets/*
  Cache-Control: public, max-age=31536000, immutable
```

### 14.2 VPS / Server proprio (Nginx)

Per servire la build statica su un VPS (Ubuntu/Debian):

```bash
# 1. Sulla macchina di sviluppo — build
pnpm build

# 2. Copia dist/ sul server
rsync -avz dist/ user@server:/var/www/vulcan-pizza-lab/

# 3. Sul server — installa Nginx (se non presente)
sudo apt update && sudo apt install -y nginx

# 4. Configurazione Nginx
sudo nano /etc/nginx/sites-available/vulcan-pizza-lab
```

Contenuto del file Nginx:

```nginx
server {
    listen 80;
    server_name pizza.tuodominio.it;  # <-- cambia col tuo dominio

    root /var/www/vulcan-pizza-lab;
    index index.html;

    # Gzip per performance
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml;
    gzip_min_length 256;

    # Cache aggressiva sugli asset con hash (immutabili)
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # SPA fallback — tutte le route servono index.html
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

```bash
# 5. Abilita il sito e riavvia Nginx
sudo ln -s /etc/nginx/sites-available/vulcan-pizza-lab /etc/nginx/sites-enabled/
sudo nginx -t          # verifica configurazione
sudo systemctl reload nginx

# 6. (Opzionale) HTTPS con Let's Encrypt
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d pizza.tuodominio.it
```

### 14.3 Docker

Creare `Dockerfile` nella root del progetto:

```dockerfile
# === Stage 1: Build ===
FROM node:20-alpine AS builder
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm build

# === Stage 2: Serve ===
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html

# SPA fallback per React Router
RUN echo 'server { \
    listen 80; \
    root /usr/share/nginx/html; \
    index index.html; \
    location /assets/ { expires 1y; add_header Cache-Control "public, immutable"; } \
    location / { try_files $uri $uri/ /index.html; } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

Opzionale — `docker-compose.yml`:

```yaml
version: "3.9"
services:
  vulcan:
    build: .
    ports:
      - "8080:80"
    restart: unless-stopped
```

```bash
# Build e run
docker compose up -d --build

# Oppure senza compose
docker build -t vulcan-pizza-lab .
docker run -d -p 8080:80 --name vulcan vulcan-pizza-lab

# L'app sara accessibile su http://localhost:8080
```

### 14.4 GitHub Pages

GitHub Pages richiede un `base` path se il repo non e servito dalla root:

```bash
# 1. In vite.config.ts, aggiungere base (solo se necessario):
#    base: "/vulcan-pizza-lab/"

# 2. Build
pnpm build

# 3. Deploy con gh-pages
npx gh-pages -d dist
```

Oppure via GitHub Actions — creare `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages
on:
  push:
    branches: [main]

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  build-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with:
          version: 9
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm build
        env:
          BASE_URL: /vulcan-pizza-lab/
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist
      - uses: actions/deploy-pages@v4
```

> **Nota:** con GitHub Pages e `createBrowserRouter`, serve un `basename` nel router:
>
> ```ts
> createBrowserRouter([...], { basename: "/vulcan-pizza-lab" })
> ```
>
> In alternativa, usare `createHashRouter` per evitare il problema del SPA fallback su GitHub Pages.

### 14.5 Servire con Node.js (Express)

Se preferisci un server Node.js anziche Nginx:

```bash
pnpm add express
```

Creare `server.mjs` nella root:

```js
import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

// Asset statici con cache
app.use("/assets", express.static(path.join(__dirname, "dist/assets"), {
  maxAge: "1y",
  immutable: true,
}));

// Tutti gli altri file statici
app.use(express.static(path.join(__dirname, "dist")));

// SPA fallback
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist/index.html"));
});

app.listen(PORT, () => {
  console.log(`Vulcan Pizza Lab running on http://localhost:${PORT}`);
});
```

```bash
# Build + avvio
pnpm build
node server.mjs
# -> http://localhost:3000
```

---

## 15. Variabili d'ambiente e configurazione

### Variabili opzionali

| Variabile  | Uso                                                 | Default |
| ---------- | --------------------------------------------------- | ------- |
| `PORT`     | Porta del server Express (solo se usi `server.mjs`) | 3000    |
| `BASE_URL` | Base path per GitHub Pages o sottodirectory         | `/`     |

### API esterne usate (runtime, client-side)

| API          | Endpoint                                      | Auth             | Note                                |
| ------------ | --------------------------------------------- | ---------------- | ----------------------------------- |
| Open-Meteo   | `https://api.open-meteo.com/v1/forecast`      | Nessuna          | Dati meteo per temperatura ambiente |
| Nominatim    | `https://nominatim.openstreetmap.org/reverse` | Nessuna          | Reverse geocoding per nome citta    |
| Geolocation  | `navigator.geolocation`                       | Permesso browser | Per localizzazione utente           |
| Google Fonts | `fonts.googleapis.com`                        | Nessuna          | Playfair Display, DM Sans, DM Mono  |
| Unsplash     | Immagini statiche (URL diretti)               | Nessuna          | Foto stili pizza in `STYLE_PHOTOS`  |

> **Nessuna API key richiesta** — tutte le API usate sono gratuite e senza autenticazione. L'app funziona completamente offline dopo il caricamento iniziale (tranne Google Fonts e meteo).

---

## 16. Troubleshooting

### Problemi comuni

| Problema                                                | Causa                                              | Soluzione                                                                                                                  |
| ------------------------------------------------------- | -------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `Cannot find module 'figma:asset/...'`                  | Import Figma-specific non risolti                  | Il plugin `figmaAssetStub` in `vite.config.ts` gestisce questo — restituisce un SVG placeholder. Nessuna azione richiesta. |
| Pagina bianca su route `/dev`, `/cms`, `/design-system` | Server non configurato per SPA fallback            | Aggiungere `try_files $uri /index.html` (Nginx) o equivalente                                                              |
| Font non caricati                                       | Nessun accesso a Google Fonts (offline/firewall)   | Scaricare i font e servirli localmente da `/public/fonts/`, aggiornando `fonts.css`                                        |
| Dark mode non persiste                                  | localStorage non disponibile (iframe sandboxed)    | Fuori da Figma funziona nativamente. In iframe verificare `allow="storage-access"`                                         |
| CMS/lingua non persiste                                 | localStorage non disponibile (iframe sandboxed)    | Stesso motivo del dark mode — in iframe le restrizioni storage si applicano                                                |
| Build fallisce con errori TypeScript                    | `noUnusedLocals` o import mancanti                 | `pnpm build` usa `tsc` — risolvere i warning o impostare `"noUnusedLocals": false` in `tsconfig.json` (gia impostato)      |
| `ERR_PNPM_FROZEN_LOCKFILE` su CI                        | Lockfile non aggiornato dopo modifica package.json | Eseguire `pnpm install` localmente e committare `pnpm-lock.yaml` aggiornato                                                |

---

## 17. Sistema Sync (Make <-> Locale)

### Componenti

| Componente              | Posizione                         | Funzione                                                                                                                               |
| ----------------------- | --------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| **SyncTab**             | `src/app/components/sync-tab.tsx` | Tab nei DevTools (`/dev/sync`): scansione progetto, export bundle, import bundle, diff viewer, generatore prompt con modalita compatta |
| **sync.mjs**            | root del progetto                 | Script CLI Node.js: scan, export, import, diff                                                                                         |
| **.sync-snapshot.json** | root (gitignored)                 | Ultimo snapshot per confronto diff                                                                                                     |

### Formato bundle

```json
{
  "vulcan_sync": "1.0",
  "timestamp": "2026-03-15T...",
  "source": "cloud" | "local",
  "files": {
    "/src/app/components/pizza-engine.ts": {
      "hash": "a1b2c3d4",
      "lines": 2644,
      "content": "..."
    }
  },
  "manifest": { "total_files": 65, "excluded": [...] }
}
```

Hash: djb2 (identico browser/CLI per confronto coerente).

### Workflow Make -> Locale

1. DevTools -> Sync -> "Scansiona progetto"
2. "Copia Bundle JSON" -> clipboard
3. Sul terminale locale:
   - **macOS:** `pbpaste | node sync.mjs import`
   - **Linux:** `xclip -selection clipboard -o | node sync.mjs import`
   - **Windows:** `powershell -c "Get-Clipboard" | node sync.mjs import`
   - **Alternativa (tutti i SO):** salvare in file e `node sync.mjs import bundle.json`

### Workflow Locale -> Make

1. Lavori in Cursor/Windsurf/Claude Desktop
2. Esporta:
   - **macOS:** `node sync.mjs export | pbcopy`
   - **Linux:** `node sync.mjs export | xclip -selection clipboard`
   - **Windows:** `node sync.mjs export | clip`
3. In Vulcan Cloud: DevTools -> Sync -> incolla il bundle -> "Analizza diff"
4. Scegli modalita prompt (compatto o file interi) -> "Copia prompt" -> incolla nella chat -> Claude applica le modifiche

### Generazione prompt — modalita "Diff compatto" vs "File interi"

Il SyncTab genera il prompt per Claude in due modalita, selezionabili con un toggle:

| Modalita                    | Strategia                                                                                                                                   | Quando usarla                                                |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| **Diff compatto** (default) | Algoritmo LCS riga-per-riga, output in formato `fast_apply_tool` (`// ... existing code ...` + solo righe cambiate con 3 righe di contesto) | Sempre, a meno che non ci siano problemi di applicazione     |
| **File interi**             | Manda il contenuto completo di ogni file modificato con `write_tool`                                                                        | Fallback se Claude non riesce ad applicare un patch compatto |

**Risparmio tipico:** per un file da 1000 righe con 10 righe modificate, il prompt compatto produce ~30 righe invece di 1000 (~97% di riduzione token). La UI mostra in tempo reale la stima di token e turni per entrambe le modalita.

**Logica di fallback automatico** (nel codice, `computeHunks()`):

- File < 25 righe -> sempre file intero (overhead del diff non conviene)
- File con > 65% righe diverse -> sempre file intero (e una riscrittura, non un patch)
- File con prodotto righe old x new > 4M -> sempre file intero (LCS troppo costoso in RAM)
- Altrimenti -> diff compatto con hunks merged quando il contesto si sovrappone

### Comandi CLI rapidi

| Comando                              | Funzione                                    |
| ------------------------------------ | ------------------------------------------- |
| `node sync.mjs scan`                 | Mostra i file del progetto con righe e hash |
| `node sync.mjs diff`                 | Cosa e cambiato dall'ultimo sync            |
| `node sync.mjs export > bundle.json` | Salva bundle in un file                     |
| `node sync.mjs import bundle.json`   | Importa bundle da file                      |

### Limiti noti

- L'import in Make richiede un turno di conversazione con Claude (non e automatico)
- Non gestisce merge di conflitti (se lo stesso file e modificato in entrambi gli ambienti)
- File binari non tracciati (ma Vulcan usa solo URL Unsplash, nessuna immagine locale)
- Il bundle JSON puo essere grande (~200-400 KB) per progetti con molti file
- L'algoritmo LCS e O(n\*m) in memoria — per file > ~2000 righe ciascuno, il diff viene bypassato e si usa il file intero
- Il diff compatto richiede che Claude usi `fast_apply_tool` correttamente — in rari casi potrebbe fallire e richiedere un retry con "File interi"

---

## 18. Mappa file completa del progetto

### Root

| File                 | Funzione                                      |
| -------------------- | --------------------------------------------- |
| `package.json`       | Dipendenze e script                           |
| `tsconfig.json`      | Configurazione TypeScript                     |
| `vite.config.ts`     | Build config + plugin figmaAssetStub          |
| `postcss.config.mjs` | PostCSS (vuoto — Tailwind v4 via Vite plugin) |
| `sync.mjs`           | CLI sync Make <-> locale                      |
| `index.html`         | Entry HTML                                    |

### `/src/styles/`

| File           | Funzione                                         |
| -------------- | ------------------------------------------------ |
| `index.css`    | Entry CSS (importa theme + tailwind + fonts)     |
| `theme.css`    | Token 3-tier, custom properties, utility classes |
| `tailwind.css` | Tailwind v4 config                               |
| `fonts.css`    | Google Fonts import                              |

### `/src/app/`

| File        | Righe | Funzione                   |
| ----------- | ----- | -------------------------- |
| `App.tsx`   | 6     | RouterProvider bootstrap   |
| `routes.ts` | 22    | createBrowserRouter config |

### `/src/app/pages/`

| File                  | Righe | Route                    | Funzione                                                        |
| --------------------- | ----- | ------------------------ | --------------------------------------------------------------- |
| `home.tsx`            | ~1270 | `/`                      | Orchestrator principale (tab Crea)                              |
| `explore.tsx`         | ~250  | `/explore`               | Catalogo 15 stili con filtri famiglia (tab Stili)               |
| `search.tsx`          | ~260  | `/search`                | Ricerca globale stili/glossario/problemi (tab Cerca)            |
| `learn.tsx`           | ~140  | `/learn`                 | Hub educativo con link a glossario/troubleshooting (tab Impara) |
| `profile.tsx`         | ~620  | `/profile`               | Setup utente + FTU onboarding (tab Profilo)                     |
| `recipe.tsx`          | ~430  | `/recipe/:styleId`       | Ricetta self-contained con deep linking URL                     |
| `dev.tsx`             | 18    | `/dev`, `/dev/:tab`      | Wrapper DevTools                                                |
| `design-system.tsx`   | 88    | `/design-system`         | Wrapper DS standalone                                           |
| `cms.tsx`             | 931   | `/cms`                   | Editor CMS completo                                             |
| `troubleshooting.tsx` | 55    | `/learn/troubleshooting` | Guida troubleshooting 20 problemi                               |
| `glossary.tsx`        | 380   | `/learn/glossary`        | Glossario tecnico interattivo 30+ termini                       |
| `not-found.tsx`       | 63    | `*`                      | 404 page                                                        |

### `/src/app/components/` (attivi)

| File                          | Righe | Funzione                                                                                                                                                                                                           |
| ----------------------------- | ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `pizza-engine.ts`             | 2644  | Motore scientifico (15 stili, scoring, compensazioni)                                                                                                                                                              |
| `style-editor-tab.tsx`        | 3622  | Style Editor con import/diff/validazione/liveSync                                                                                                                                                                  |
| `dev-tools.tsx`               | 1409  | DevTools consolidati 5 tab                                                                                                                                                                                         |
| `sync-tab.tsx`                | 1280  | Tab Sync (scansione, bundle, diff, prompt)                                                                                                                                                                         |
| `user-needs.tsx`              | 1288  | Input utente (meteo, time slot, skill, oven, pantry)                                                                                                                                                               |
| `score-dashboard.tsx`         | 1278  | Dashboard punteggi + PizzaNerd + RadarChart                                                                                                                                                                        |
| `recipe-output.tsx`           | 1009  | Ingredienti + timeline procedurale                                                                                                                                                                                 |
| `recipe-configurator.tsx`     | 752   | Fine-tuning sliders (H%, W, P/L, fermentazione)                                                                                                                                                                    |
| `recommended-styles.tsx`      | 525   | Grid stili + filtro famiglia + STYLE_PHOTOS                                                                                                                                                                        |
| `scroll-companion.tsx`        | 457   | ProgressPill + MobileProgressBar                                                                                                                                                                                   |
| `dough-mascot.tsx`            | 411   | DoughBlob energy-reactive                                                                                                                                                                                          |
| `style-detail-sheet.tsx`      | 420   | Bottom sheet dettagli stile + parametric data section                                                                                                                                                              |
| `parametric-databases.ts`     | 340   | 10 DB parametrici — TOPPING_DB completo 15/15 stili + topping awareness nel solver                                                                                                                                 |
| `glossary-link.tsx`           | 80    | GlossaryLink deeplink con varianti inline/badge                                                                                                                                                                    |
| `recipe-stat-strip.tsx`       | 259   | Strip 4 metriche chiave                                                                                                                                                                                            |
| `vulcan-logo.tsx`             | 161   | VulcanMark SVG                                                                                                                                                                                                     |
| `info-tip.tsx`                | 148   | Popover help                                                                                                                                                                                                       |
| `fire-glow.tsx`               | 125   | Sfondo animato                                                                                                                                                                                                     |
| `vulcan-hero.tsx`             | 110   | Composizione logo + blob                                                                                                                                                                                           |
| `scroll-section.tsx`          | 108   | Wrapper soft-focus dimming                                                                                                                                                                                         |
| `styles-override-context.tsx` | 100   | Context override stili                                                                                                                                                                                             |
| `root-layout.tsx`             | 75    | Layout condiviso + providers                                                                                                                                                                                       |
| `score-ring.tsx`              | 71    | SVG ring punteggio                                                                                                                                                                                                 |
| `app-shell.tsx`               | ~280  | AppShell layout con Tab Bar Material 3 (mobile bottom / desktop sidebar rail)                                                                                                                                      |
| `engine-test-suite.tsx`       | ~750  | Test Suite auto-adattivo: 12 categorie, ~100+ test (DB integrity, generation matrix, score bounds, compensations, Q10, P/L, Rule 55, recommendation, edge cases, cross-validation, parametric DB, deviation/flour) |
| `step-header.tsx`             | 70    | Header editoriale sezione                                                                                                                                                                                          |

### `/src/app/components/cms/`

| File               | Righe | Funzione                                    |
| ------------------ | ----- | ------------------------------------------- |
| `cms-context.tsx`  | 1273  | Provider + schema + defaults + CMS_SECTIONS |
| `i18n.ts`          | 61    | Template helper + formatter factory         |
| `locales/index.ts` | 53    | Registry lingue                             |
| `locales/en.ts`    | 321   | Bundle inglese                              |
| `locales/es.ts`    | 246   | Bundle spagnolo                             |
| `locales/de.ts`    | 243   | Bundle tedesco                              |
| `locales/fr.ts`    | 243   | Bundle francese                             |
| `locales/pt.ts`    | 243   | Bundle portoghese                           |
| `locales/ja.ts`    | 321   | Bundle giapponese                           |

### `/src/app/components/design-system/` (20 file)

| File                               | Funzione                                  |
| ---------------------------------- | ----------------------------------------- |
| `index.tsx`                        | Orchestrator + sidebar + registry         |
| `shared.tsx`                       | Context e tipi condivisi                  |
| `foundations.tsx`                  | F01: Palette, tipografia, spacing         |
| `foundations-dynamics.tsx`         | F02: Animazioni, transizioni, time-of-day |
| `foundations-glass.tsx`            | F03: Glassmorphism, blur, overlay         |
| `foundations-logo.tsx`             | F04: Logo VulcanMark varianti             |
| `foundations-logo-brand.tsx`       | F04b: Hero, FireGlow, DoughBlob showcase  |
| `foundations-ext.tsx`              | F05: Estensioni, forme decorative         |
| `foundations-m3e.tsx`              | F06: M3 Expressive design tokens          |
| `foundations-contrast-density.tsx` | F07: Contrasto, densita, accessibilita    |
| `components-a.tsx`                 | C01: Chip, bottoni, toggle                |
| `components-b.tsx`                 | C02: Card, container                      |
| `components-c.tsx`                 | C03: Score ring, radar chart              |
| `components-d.tsx`                 | C04: Slider, range input                  |
| `components-f.tsx`                 | C06: Timeline, step                       |
| `components-g.tsx`                 | C07: Modal, sheet, popover                |
| `components-g2.tsx`                | C07b: Tooltip, info tip                   |
| `components-h.tsx`                 | C08: Carousel varianti                    |
| `carousel-variants.tsx`            | Demo carousel (importato da components-h) |
| `patterns-templates.tsx`           | P01-P08: Pattern e template compositi     |

### `/src/imports/` (1 file attivo)

| File            | Funzione                                          |
| --------------- | ------------------------------------------------- |
| `svg-21qef.tsx` | SVG decorativi (importato da foundations-ext.tsx) |

### Dead code (non eliminabile dal sandbox)

| Directory/File                         | Conta   | Note                                  |
| -------------------------------------- | ------- | ------------------------------------- |
| `/src/app/components/ui/*.tsx`         | 46 file | shadcn/radix, non importati — VPL-032 |
| `/src/app/components/ui/utils.ts`      | 1 file  | Utility (clsx/twMerge) non usata      |
| `/src/app/components/ui/use-mobile.ts` | 1 file  | Hook non usato                        |