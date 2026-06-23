# Vulcan Pizza Lab — Guida Completa del Progetto

> Versione: 1.0.0
> Ultimo aggiornamento: 15 marzo 2026
> Autore: Vulcan Pizza Lab Team
> Repo: [github.com/zatteogit/vulcan-pizza-lab](https://github.com/zatteogit/vulcan-pizza-lab)

---

## Indice

1. [Panoramica](#1-panoramica)
2. [Flusso utente](#2-flusso-utente)
3. [Architettura tecnica](#3-architettura-tecnica)
4. [Pizza Engine — Il motore scientifico](#4-pizza-engine--il-motore-scientifico)
5. [Design System — "Cucina Editoriale"](#5-design-system--cucina-editoriale)
6. [CMS e Internazionalizzazione](#6-cms-e-internazionalizzazione)
7. [Style Editor](#7-style-editor)
8. [DevTools](#8-devtools)
9. [Sistema Sync (Make <-> Locale)](#9-sistema-sync-make---locale)
10. [Setup e Deployment](#10-setup-e-deployment)
11. [Stato del progetto](#11-stato-del-progetto)
12. [Mappa file completa](#12-mappa-file-completa)
13. [Convenzioni e regole](#13-convenzioni-e-regole)
14. [Appendice: API esterne e vincoli iframe](#14-appendice-api-esterne-e-vincoli-iframe)

---

## 1. Panoramica

### Cos'e Vulcan Pizza Lab

Vulcan Pizza Lab e un **configuratore interattivo di ricette pizza** progettato per funzionare come iframe. L'utente viene guidato — attraverso un flusso narrativo in 3 sezioni — dalla scelta del contesto (quando mangiare, che forno ha, che farine ha in dispensa) fino alla generazione di una ricetta completa con ingredienti pesati al grammo e timeline procedurale passo-passo.

### Filosofia

L'esperienza non e un tool tecnico con UI fredda. E un'**esperienza editoriale premium** ispirata a riviste food di alto livello:

- **Ogni interazione racconta qualcosa** — mai UI generica
- I dati scientifici esistono ma sono "dietro le quinte" (toggle **PizzaNerd**)
- L'utente principiante deve sentirsi sicuro, l'esperto deve trovare profondita
- Il flusso e scroll verticale con 3 sezioni, nessuna barra step orizzontale

### Cosa fa

| Funzionalita           | Descrizione                                                                                                                                                                                |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **15 stili pizza**     | Napoletana STG, Canotto, Teglia Romana, Tonda Romana, Pinsa, Pala, New York, Detroit, Chicago Deep Dish, Grandma, Bonci, Focaccia Genovese, Sfincione, Focaccia di Recco, Padellino Torino |
| **4 famiglie**         | Napoletana, Romana, Americana, Contemporanea                                                                                                                                               |
| **Motore scientifico** | Q10 variabile, compensazioni Arrhenius, stima P/L, scoring 5 assi, recommendation engine                                                                                                   |
| **7 lingue**           | Italiano, English, Espanol, Deutsch, Francais, Portugues, Giapponese                                                                                                                       |
| **CMS integrato**      | 11 sezioni, ~200+ campi editabili, export/import JSON                                                                                                                                      |
| **Style Editor**       | Editor completo per tutti i 15 stili con validazione, smart import, LiveSync                                                                                                               |
| **Design System**      | Catalogo interattivo "Cucina Editoriale" con 20 file, 8 fondazioni, 8 componenti, pattern e template                                                                                       |
| **Dark mode**          | Completo, persistente, con token CSS che si invertono automaticamente                                                                                                                      |
| **Accessibilita**      | `prefers-reduced-motion`, `aria-label`, skip-to-content, focus management                                                                                                                  |

### Stack tecnologico

| Tecnologia   | Versione    | Uso                         |
| ------------ | ----------- | --------------------------- |
| React        | 18.3.1      | Core UI                     |
| React Router | 7.13.0      | Routing (Data mode)         |
| Tailwind CSS | 4.1.12 (v4) | Utility classes             |
| Motion       | 12.23.24    | Animazioni (`motion/react`) |
| Lucide React | 0.487.0     | Icone                       |
| Recharts     | 2.15.2      | RadarChart (ScoreDashboard) |
| Vite         | 6.3.5       | Build tool                  |
| TypeScript   | 5.7.3       | Type checking               |

---

## 2. Flusso utente

### Fase 1: Build (3 sezioni scroll)

L'utente scorre verticalmente attraverso 3 sezioni:

#### Sezione "Contesto" (`data-section="context"`)

```
Meteo automatico          Geolocalizzazione + Open-Meteo API
                          -> temperatura esterna e stima cucina

Quando mangiare?          5 time slot con ore associate:
                          - Stasera (4h)
                          - Domani pranzo (18h)
                          - Domani sera (24h)
                          - Dopodomani (48h)
                          - Weekend (72h)
```

Ogni time slot ha un colore unico nel design system (palette time-of-day).

#### Sezione "Setup" (`data-section="setup"`)

```
Livello skill             4 livelli: Principiante -> Esperto
Dieta                     Senza glutine / Senza lattosio / Vegano
Attrezzatura              Impastatrice / Pietra / Acciaio / Teglia
Forno                     5 preset: Domestico / Elettrico std / Gas / Elettrico alto / Legna
                          + slider temperatura custom
Dispensa                  Farine disponibili: 00, 0, Manitoba, Integrale, Semola
                          Lieviti: Fresco, Secco, Madre
```

#### Sezione "Stili" (`data-section="styles"`)

```
Filtro famiglia           Chip: Tutte / Napoletana / Romana / Americana / Contemporanea
Grid stili                Ogni stile mostra:
                          - Foto Unsplash curata
                          - Nome + famiglia
                          - Score ring (compatibilita %)
                          - Tier badge: Perfetto / Buono / Sfidante
```

L'utente seleziona uno stile e procede alla generazione.

### Fase 2: Result

```
Foto cinematica           Header con immagine full-width dello stile scelto
Stat Strip                4 metriche chiave: Idratazione / Forno / Cottura / Fermentazione
Fine-tuning               Accordion con slider: H%, W, P/L, ore fermentazione, temperatura
Score Dashboard           Punteggio composito + 5 assi (toggle PizzaNerd per dati scientifici)
Ingredienti               Lista pesata al grammo con bottoni +/- panetti
Timeline procedurale      Step-by-step con orari, tip beginner e tip nerd
```

**Desktop:** ScoreDashboard in sidebar sticky a destra.
**Mobile:** ScoreDashboard sticky sotto header.

### Navigazione

| Azione                      | Risultato                                   |
| --------------------------- | ------------------------------------------- |
| Scroll giu                  | Avanza nelle sezioni build                  |
| Click stile                 | Seleziona e abilita "Genera ricetta"        |
| "Genera ricetta"            | Transizione build -> result (scroll to top) |
| "Indietro" / "Cambia stile" | Torna a build, scorrendo alla sezione stili |
| "Nuova pizza"               | Reset completo, torna a build dall'inizio   |

---

## 3. Architettura tecnica

### Routing (React Router v7, Data mode)

```
App.tsx                     RouterProvider (6 righe, solo bootstrap)
  +-- routes.ts             createBrowserRouter
       +-- RootLayout       Layout condiviso: dark mode, CmsProvider, StylesOverrideProvider
            +-- HomePage    /          Orchestrator principale
            +-- DevToolsPage /dev, /dev/:tab   5 tab consolidati
            +-- DesignSystemPage /design-system   Catalogo DS interattivo
            +-- CmsPage     /cms       Editor contenuti 11 sezioni
            +-- NotFoundPage *         Catch-all 404
```

**Shortcut:** `Ctrl+Shift+D` naviga tra `/dev` e `/` (gestito in RootLayout).

### Context Providers

L'app wrappa tutto in 2 Context Provider annidati nel RootLayout:

```
CmsProvider                 Stato CMS + locale + override + switchLocale
  +-- StylesOverrideProvider  Override stili dal Style Editor
       +-- <Outlet>           React Router outlet
```

### Dependency graph (HomePage, orchestrator)

```
pages/home.tsx (orchestrator, tutto lo stato build/result)
|
+-- FireGlow                 Sfondo animato, prefers-reduced-motion OK
+-- VulcanHero               Composizione logo + blob
|   +-- VulcanMark           Logo SVG (V serif con cornicione)
|   +-- DoughBlob            Mascot blob energy-reactive
|
+-- ProgressPill             Indicatore sezione desktop
+-- MobileProgressBar        Indicatore sezione mobile
+-- ScrollSection            Wrapper soft-focus dimming
|
+-- UserNeeds                Sezioni "context" + "setup"
|   +-- StepHeader           Titolone editoriale (01/02/03)
|   +-- UnifiedChip          Toggle chip con check animato
|   +-- InlineTip            Tip contestuale
|
+-- RecommendedStyles        Sezione "styles"
|   +-- ScoreRing            Ring SVG punteggio
|   +-- FamilyFilter         Chips filtro famiglia
|
+-- StyleDetailSheet         Modal bottom sheet dettagli stile
|
+-- ScoreDashboard           Pannello score + PizzaNerd
|   +-- Recharts RadarChart  Grafico a 5 assi
|
+-- RecipeStatStrip          Strip 4 metriche
+-- RecipeConfigurator       Slider fine-tuning
|   +-- InfoTip              Popover help
|
+-- RecipeOutput             Ingredienti + timeline
    +-- Clipboard/Share      API con fallback per iframe
```

### Stato principale (in `pages/home.tsx`)

| Stato                | Tipo              | Default                 | Persistenza                       |
| -------------------- | ----------------- | ----------------------- | --------------------------------- |
| `darkMode`           | boolean           | false                   | localStorage (`vulcan_dark_mode`) |
| `currentStep`        | "build"/"result"  | "build"                 | --                                |
| `selectedStyle`      | PizzaStyle / null | null                    | --                                |
| `selectedTimeSlot`   | string / null     | null                    | --                                |
| `constraints`        | UserConstraints   | home/250C/skill2/4balls | Oven + Pantry in localStorage     |
| `customHydration`    | number            | 60                      | --                                |
| `customFlourW`       | number            | 250                     | --                                |
| `customFlourPL`      | number            | 0.55 (da stile)         | --                                |
| `customFermentHours` | number            | 16                      | --                                |
| `customFermentTemp`  | number            | 4                       | --                                |
| `usePreFerment`      | boolean           | false                   | --                                |
| `panConfig`          | PanConfig         | {} (da stile)           | --                                |
| `nerdMode`           | boolean           | false                   | --                                |
| `showFineTuning`     | boolean           | false                   | --                                |

### localStorage keys

| Chiave                   | Contenuto                                 | Componente             |
| ------------------------ | ----------------------------------------- | ---------------------- |
| `vulcan_dark_mode`       | `"true"` / `"false"`                      | RootLayout             |
| `vulcan_pantry`          | `{ flours: string[], yeasts: string[] }`  | UserNeeds              |
| `vulcan_oven_pref`       | `{ ovenType: OvenType, maxTemp: number }` | UserNeeds              |
| `vulcan_cms_overrides`   | JSON oggetto override CMS                 | CmsProvider            |
| `vulcan_cms_locale`      | `LocaleId` string                         | CmsProvider            |
| `vulcan_styles_override` | JSON mappa stili override                 | StylesOverrideProvider |

---

## 4. Pizza Engine — Il motore scientifico

### Panoramica

Il file `pizza-engine.ts` (2644 righe) contiene tutto il motore algoritmico: database dei 15 stili, recommendation engine, recipe generator, scoring system e modelli scientifici.

### 15 stili nel database (`STYLES_DB`)

4 famiglie: **Napoletana** (2), **Romana** (4), **Americana** (4), **Contemporanea** (5).

| ID                   | Nome                  | Famiglia      | H%     | W Range | P/L Range | Forno          | Grasso     | Beginner |
| -------------------- | --------------------- | ------------- | ------ | ------- | --------- | -------------- | ---------- | -------- |
| `napoletana_stg`     | Napoletana STG        | napoletana    | 55-62  | 250-320 | 0.55-0.70 | legna          | none       | No       |
| `napoletana_canotto` | Canotto Contemporanea | napoletana    | 70-80  | 300-350 | 0.50-0.65 | elettrico alto | none       | No       |
| `teglia_romana`      | Teglia Romana         | romana        | 80-100 | 300-350 | 0.50-0.70 | elettrico std  | oil 2.5%   | Si       |
| `tonda_romana`       | Tonda Romana          | romana        | 55-60  | 160-210 | 0.40-0.60 | elettrico std  | oil 2.5%   | Si       |
| `pinsa_romana`       | Pinsa Romana          | romana        | 75-85  | 280-330 | 0.55-0.75 | elettrico alto | oil 1%     | No       |
| `pala_romana`        | Pala Romana           | romana        | 70-80  | 280-340 | 0.50-0.65 | elettrico alto | oil 1.5%   | No       |
| `new_york`           | New York Style        | americana     | 62-68  | 280-340 | 0.55-0.70 | elettrico std  | oil 2.5%   | Si       |
| `detroit`            | Detroit Style         | americana     | 68-78  | 290-350 | 0.55-0.70 | elettrico std  | oil 3%     | Si       |
| `chicago_deep`       | Chicago Deep Dish     | americana     | 48-58  | 230-290 | 0.45-0.60 | elettrico std  | butter 18% | Si       |
| `grandma_style`      | Grandma Style         | americana     | 60-68  | 260-320 | 0.55-0.70 | elettrico std  | oil 4%     | Si       |
| `bonci_teglia`       | Metodo Bonci          | contemporanea | 85-100 | 320-380 | 0.50-0.65 | elettrico std  | oil 3%     | Si       |
| `focaccia_genovese`  | Focaccia Genovese     | contemporanea | 65-75  | 220-280 | 0.45-0.65 | elettrico std  | oil 8%     | Si       |
| `sfincione`          | Sfincione Palermitano | contemporanea | 65-72  | 250-300 | 0.50-0.65 | elettrico std  | oil 3%     | Si       |
| `focaccia_recco`     | Focaccia di Recco     | contemporanea | 50-55  | 180-220 | 0.40-0.55 | elettrico alto | oil 5%     | No       |
| `padellino_torino`   | Pizza al Padellino    | contemporanea | 65-75  | 280-330 | 0.50-0.65 | elettrico std  | oil 2%     | Si       |

### Interfaccia DoughParameters

```typescript
interface DoughParameters {
  flour_w_range: [number, number]; // Forza farina
  flour_pl_range: [number, number]; // P/L alveografico
  hydration_pct_range: [number, number]; // Idratazione %
  salt_pct: number; // Sale %
  oil_pct: number; // Grasso %
  fat_type: "oil" | "butter" | "lard" | "none";
  sugar_pct: number; // Zucchero %
  fermentation_hours_range: [number, number];
  process_type: string; // knead / no_knead / biga / poolish
}
```

### Recommendation engine

Calcola la compatibilita di ogni stile con i vincoli dell'utente. 5 fattori pesati:

| Fattore      | Peso | Descrizione                                           |
| ------------ | ---- | ----------------------------------------------------- |
| Tempo        | 25%  | Le ore disponibili coprono il range di fermentazione? |
| Forno        | 25%  | Il forno raggiunge la temperatura ideale?             |
| Skill        | 20%  | Il livello dell'utente e sufficiente?                 |
| Attrezzatura | 10%  | Ha gli strumenti necessari (teglia, pietra, ecc.)?    |
| Dispensa     | 20%  | Ha le farine con la W giusta? Ha il lievito adatto?   |

I pesi sono configurabili via CMS (`cms.recommendationWeights.*`).

### Composite score (5 assi)

Ogni ricetta generata riceve un punteggio composito basato su 5 dimensioni:

```
composito = autenticita      * 0.30
          + fattibilita      * 0.25
          + digeribilita     * 0.20
          + sostenibilita    * 0.15
          + sperimentazione  * 0.10
```

I pesi sono configurabili via CMS (`cms.scoreDimensions.*.weight`).

#### Autenticita (4 sotto-assi)

| Sotto-asse   | Peso | Valuta                                     |
| ------------ | ---- | ------------------------------------------ |
| Ingredienti  | 30%  | Idratazione, W, P/L nel range dello stile  |
| Processo     | 25%  | Durata fermentazione vs range tradizionale |
| Attrezzatura | 35%  | Tipo forno, temperatura raggiunta          |
| Forma        | 10%  | Baseline (non penalizzato)                 |

#### Fattibilita (interazioni W/metodo)

Oltre a forno (40%), farina (30%), skill (30%), include:

- **W x idratazione:** W alto + H alta = bonus; W basso + H alta = malus
- **Metodo:** no_knead facilita principianti; biga/poolish penalizza skill 1

#### Sostenibilita (5 sotto-assi)

| Sotto-asse             | Peso | Descrizione                                     |
| ---------------------- | ---- | ----------------------------------------------- |
| Efficienza forno       | 30%  | Temperatura relativa + normalizzazione assoluta |
| Tempo cottura          | 25%  | Piu breve = meno energia                        |
| Fermentazione          | 20%  | Ambiente = 0 energia frigo                      |
| Semplicita ingredienti | 15%  | Meno additivi = piu sostenibile                 |
| Tipo lievito           | 10%  | Sourdough autoprodotto = impatto zero           |

### Modelli scientifici

#### Q10 variabile (`getQ10()`)

Il fattore Q10 modella la velocita della fermentazione al variare della temperatura:

| Condizione                    | Q10 | Modello        |
| ----------------------------- | --- | -------------- |
| Lievito commerciale, T >= 10C | 2.0 | `standard`     |
| Lievito commerciale, T < 10C  | 1.6 | `cold_adapted` |
| Lievito madre, T > 15C        | 2.2 | `sourdough`    |
| Lievito madre, T <= 15C       | 1.9 | `sourdough`    |

Riferimento: PMC7146123, dati Saccharomyces cerevisiae.

#### Compensazioni forno (`calculateOvenCompensations()`)

Quando la temperatura del forno e inferiore all'ideale, il motore applica compensazioni parametriche:

| Compensazione | Modello                              | Trigger                   | Note                     |
| ------------- | ------------------------------------ | ------------------------- | ------------------------ |
| Idratazione   | Logaritmico `5 * ln(1 + deficit/50)` | deficit > 20C             | Modernist Pizza 2021     |
| Grasso        | Lineare +2% base                     | deficit > 150C            | Shortening per tenerezza |
| Zucchero      | Lineare +0.5% base                   | deficit > 100C + T < 300C | Boost Maillard           |
| Tempo cottura | Arrhenius-like `t * e^(k * deficit)` | deficit > 20C             | k=0.0065                 |
| Spessore      | -10%/-20%                            | deficit > 100C/200C       | Cottura uniforme         |

Tutte le compensazioni sono tracciate in `science.compensations[]` per trasparenza.

#### Stima P/L (`estimatePL()`)

```
P/L_stimato = 0.3 + (W - 150) * 0.0015
```

Clampato nel range `flour_pl_range` dello stile. Basato su dati Caputo e Dallagiovanna.

#### Selezione lievito (`generateRecipe`)

Priorita: sourdough (se >= 12h + pre-fermento) > fresco > secco > fallback sourdough.

- Dosaggio commerciale: modello Arrhenius con Q10 variabile (ref 0.25% a 18C/24h)
- Dosaggio sourdough: 15-20% baker's % in base alla durata

### ScientificLayer (PizzaNerd)

Dati scientifici visibili quando l'utente attiva il toggle PizzaNerd:

| Campo                    | Unita     | Descrizione              |
| ------------------------ | --------- | ------------------------ |
| `yeast_baker_pct`        | %         | Dosaggio lievito         |
| `effective_hours_18c`    | h         | Ore equivalenti a 18C    |
| `fodmap_reduction_pct`   | %         | Riduzione FODMAP stimata |
| `gluten_network`         | 0-100     | Qualita rete glutinica   |
| `proteolysis_index`      | 0-100     | Degradazione proteica    |
| `water_activity`         | 0.96-0.99 | Attivita dell'acqua      |
| `starch_degradation_pct` | %         | Degradazione amido       |
| `q10_factor`             | ratio     | Fattore velocita vs 18C  |
| `q10_model`              | string    | Modello Q10 usato        |
| `authenticity_breakdown` | Record    | Dettaglio per asse       |
| `compensations`          | array     | Compensazioni applicate  |
| `flour_pl_estimated`     | number    | P/L stimato dalla W      |
| `baking_energy_kj`       | kJ        | Stima energia cottura    |

---

## 5. Design System — "Cucina Editoriale"

### Palette colori

| Ruolo                  | Token CSS            | Light   | Dark    |
| ---------------------- | -------------------- | ------- | ------- |
| Primary (terracotta)   | `--primary`          | #D04A2F | #F4926A |
| CTA (salvia)           | `--cta`              | #2B7B55 | #72C8A6 |
| Tertiary (ambra)       | `--tertiary`         | #CC8844 | #E0A866 |
| Background (parchment) | `--background`       | #FDFBF7 | #131211 |
| Secondary (mocha)      | `--secondary`        | #857568 | #B0A69C |
| Muted foreground       | `--muted-foreground` | #786A5C | #B5AAA0 |

### Architettura token CSS (3 tier)

Il file `theme.css` (1347 righe) organizza i token in 3 livelli:

```
Tier 1 — PRIMITIVES       Valori grezzi, nomi astratti
                          --color-terracotta-500, --font-size-lg, --space-4

Tier 2 — SEMANTIC          Ruoli, riferiscono primitives
                          --background, --primary, --surface-container, --cta

Tier 2.5 — DOMAIN          Visualizzazione dati e forge
                          --data-water, --forge-glow, --forge-core

Tier 3 — COMPONENT         Consumati dal codice app
                          --chip-bg-active, --score-accent, --recipe-highlight
```

I componenti devono riferire **solo** Tier 3 (o le utility CSS class). Mai Tier 1 o 2 direttamente.

### Gradienti

| Token             | Composizione                   | Uso                           |
| ----------------- | ------------------------------ | ----------------------------- |
| `--grad-ember`    | terracotta -> arancio -> ambra | Logo, brand, accenti          |
| `--grad-sage`     | salvia -> salvia chiaro        | CTA buttons                   |
| `--grad-warm`     | parchment tonal                | Backgrounds                   |
| `--grad-slider-*` | Specifici per slider           | Idratazione, W, fermentazione |

### Palette time-of-day

5 colori unici per i time slot, ognuno con variante `-soft`:

| Slot       | Colore      | Token                                      |
| ---------- | ----------- | ------------------------------------------ |
| Stasera    | Indigo-blue | `--time-tonight` / `--time-tonight-soft`   |
| Pranzo     | Warm gold   | `--time-lunch` / `--time-lunch-soft`       |
| Cena       | Ember       | `--time-dinner` / `--time-dinner-soft`     |
| Dopodomani | Green       | `--time-dayafter` / `--time-dayafter-soft` |
| Weekend    | Purple      | `--time-weekend` / `--time-weekend-soft`   |

### Tipografia

| Font             | Uso                                 | Classe Tailwind | Note                        |
| ---------------- | ----------------------------------- | --------------- | --------------------------- |
| Playfair Display | h1, h2, hero, titoli sezione        | `font-serif`    | italic per sottotitoli      |
| DM Sans          | Body, UI, etichette, bottoni        | default body    | `tabular-nums` per numeri   |
| DM Mono          | Step numbers (01/02/03), badge dati | `font-mono`     | Sempre uppercase + tracking |

**Scala tipografica:** 22 gradini da `--font-size-2xs` (8px) a `--font-size-11xl` (64px), tutti definiti in `theme.css`. I heading usano `clamp()` per essere responsive.

### CSS utility classes (`theme.css @layer components`)

| Classe            | Uso                                              |
| ----------------- | ------------------------------------------------ |
| `type-data`       | Numeri e dati funzionali (DM Mono)               |
| `type-label`      | Label UI (DM Sans medium, uppercase, tracking)   |
| `type-subheading` | Sottotitoli (DM Sans medium)                     |
| `surface-card`    | Card con surface-container-low + border + radius |
| `badge-base`      | Badge base con DM Mono, uppercase                |

### Pattern editoriali

**StepHeader** (titolone sezione):

```
[DM Mono] "01 — Contesto"    <- terracotta, 0.6875rem, uppercase, tracking 0.18em
[Playfair] "Quando e dove"    <- clamp responsive, line-height 1.1
[Playfair italic] "Tempo..."  <- muted, opacity 0.65
[linea decorativa]            <- 2rem wide, 2px, primary, opacity 0.35
```

**UnifiedChip:**

- Inattivo: `var(--chip-bg)` bg, `var(--chip-border)` border
- Attivo: `var(--chip-bg-active)` bg, animated Check icon
- Sempre: `rounded-xl`, padding `px-4 py-2.5`, font `--chip-font-size`

**Card/Container:**

- Background: `var(--container-bg-low)` o `var(--container-bg)`
- Border: `1px solid var(--container-border)`
- Radius: `rounded-2xl` (1rem)
- No ombre di default (solo per floating elements)

**Glassmorphism (header sticky):**

```css
background: color-mix(
  in srgb,
  var(--background) 88%,
  transparent
);
backdrop-filter: blur(24px) saturate(1.6);
border-bottom: 1px solid var(--border-muted);
```

### Catalogo interattivo (`/design-system`)

20 file in `/src/app/components/design-system/`:

| Sezione | File                                                  | Contenuto                                                          |
| ------- | ----------------------------------------------------- | ------------------------------------------------------------------ |
| F01     | `foundations.tsx`                                     | Palette, tipografia, spacing                                       |
| F02     | `foundations-dynamics.tsx`                            | Animazioni, transizioni, time-of-day                               |
| F03     | `foundations-glass.tsx`                               | Glassmorphism, blur, overlay                                       |
| F04     | `foundations-logo.tsx` + `foundations-logo-brand.tsx` | VulcanMark + Hero/FireGlow/DoughBlob                               |
| F05     | `foundations-ext.tsx`                                 | Estensioni, forme decorative                                       |
| F06     | `foundations-m3e.tsx`                                 | M3 Expressive design tokens                                        |
| F07     | `foundations-contrast-density.tsx`                    | Contrasto, densita, accessibilita                                  |
| C01-C08 | `components-*.tsx`                                    | Chip, card, score ring, slider, timeline, modal, tooltip, carousel |
| P01-P08 | `patterns-templates.tsx`                              | Pattern e template compositi                                       |

Accessibile a `/design-system` (standalone) e via DevTools tab "Design System".

---

## 6. CMS e Internazionalizzazione

### Architettura CMS

Il CMS e basato su un **React Context** (`CmsProvider`) che avvolge l'intera app. Pattern: override su top di default hardcoded.

```
CmsProvider (in RootLayout)
  +-- CMS_DEFAULTS: CmsContent         Default italiani hardcoded
  +-- LOCALE_BUNDLES: Record<LocaleId>  Bundle per le altre 6 lingue
  +-- overrides: Partial<CmsContent>    Override utente (persistiti in localStorage)
  +-- switchLocale(id)                  Cambia lingua runtime
```

### Hook `useCms()`

```typescript
const {
  cms, // CmsContent completo (merged: defaults + locale + overrides)
  bcp47, // BCP 47 tag (es. "it-IT") per Intl APIs
  update, // (path: string, value: any) => void
  reset, // (path: string) => void
  resetAll, // () => void
  isModified, // (path: string) => boolean
  modifiedCount, // number
  exportBundle, // () => string (JSON)
  importBundle, // (json: string) => void
  switchLocale, // (id: LocaleId) => void
} = useCms();
```

**7 file consumer:** home.tsx, user-needs.tsx, recommended-styles.tsx, score-dashboard.tsx, recipe-output.tsx, recipe-stat-strip.tsx, cms.tsx (editor).

### Schema CmsContent — 11 sezioni

| Sezione              | ID         | Campi | Contenuto                                                                           |
| -------------------- | ---------- | ----- | ----------------------------------------------------------------------------------- |
| Lingua & Locale      | `locale`   | 2     | Codice lingua + nome                                                                |
| Testi UI             | `ui`       | ~90   | Bottoni, label, aria, clipboard, stat strip, nerd, weather, badges, farine, lieviti |
| Suggerimenti         | `tips`     | 5     | InlineTip contestuali                                                               |
| Hero & Brand         | `hero`     | 6     | Titolo, sottotitolo, breadcrumb, heading risultato                                  |
| Step Headers         | `steps`    | 9     | Titoli delle 3 sezioni (numero/titolo/sottotitolo)                                  |
| Sezioni Setup        | `sections` | 12    | Titoli e descrizioni delle 6 sotto-sezioni                                          |
| Configurazione       | `config`   | ~40   | Time slot, forni, skill levels — label + valori                                     |
| Pesi & Score         | `scoring`  | 15    | Pesi composito (5 assi) + recommendation (5 fattori)                                |
| Famiglie & Tiers     | `families` | 18    | 4 famiglie (nome/desc/emoji) + 3 tier (label/subtitle)                              |
| Timeline & Procedura | `timeline` | ~43   | Step procedurali (titolo/desc/tipBeginner/tipNerd)                                  |
| Media & Foto         | `media`    | 16    | URL Unsplash per 15 stili + fallback                                                |

### i18n — 7 lingue

| Codice | Lingua     | BCP 47 | Sorgente                             |
| ------ | ---------- | ------ | ------------------------------------ |
| `it`   | Italiano   | it-IT  | CMS_DEFAULTS (hardcoded, ~500 campi) |
| `en`   | English    | en-GB  | `locales/en.ts` (321 righe)          |
| `es`   | Espanol    | es-ES  | `locales/es.ts` (246 righe)          |
| `de`   | Deutsch    | de-DE  | `locales/de.ts` (243 righe)          |
| `fr`   | Francais   | fr-FR  | `locales/fr.ts` (243 righe)          |
| `pt`   | Portugues  | pt-BR  | `locales/pt.ts` (243 righe)          |
| `ja`   | Giapponese | ja-JP  | `locales/ja.ts` (321 righe)          |

### Helper i18n (`cms/i18n.ts`)

| Funzione                     | Descrizione                                  |
| ---------------------------- | -------------------------------------------- |
| `t(template, vars)`          | Interpolazione template `{key}` -> valore    |
| `createFormatter(ui, bcp47)` | Factory con helper specializzati:            |
| `.cookTime(sec)`             | Formatta secondi/minuti localizzati          |
| `.fermentTime(hours)`        | Formatta ore localizzate                     |
| `.clockTime(date)`           | Formatta orario locale (Intl.DateTimeFormat) |
| `.tempSuffix(temp)`          | "a {t}°C" localizzato                        |

### CMS Page (`/cms`)

Editor interattivo con:

- Sidebar con 11 sezioni navigabili
- Campi tipo: `text`, `textarea`, `number`, `slider`, `url`
- Indicatore campi modificati (badge conteggio)
- Reset singolo campo / reset globale
- Export/import JSON completo
- Selettore lingua con switch immediato
- Dark mode toggle

---

## 7. Style Editor

### StylesOverrideContext (`styles-override-context.tsx`)

React Context per iniettare stili personalizzati nell'app. Quando attivo, `effectiveStyles` (merge STYLES_DB + override) sostituisce STYLES_DB puro.

```typescript
const {
  isOverrideActive, // boolean — ci sono override attivi?
  effectiveStyles, // Record<string, PizzaStyle> — stili effettivi
  setOverride, // (id: string, style: PizzaStyle) => void
  clearOverride, // () => void — ripristina tutti
} = useStylesOverride();
```

Persistenza in localStorage (`vulcan_styles_override`).

### Style Editor Tab (`style-editor-tab.tsx`, 3622 righe)

Editor completo per tutti i 15 stili pizza:

| Funzionalita     | Descrizione                                                 |
| ---------------- | ----------------------------------------------------------- |
| **Smart import** | Incolla JSON/YAML, auto-detect dello schema                 |
| **Prompt AI**    | Genera prompt per Claude con lo stato corrente              |
| **Diff viewer**  | Confronto visuale tra stato corrente e default              |
| **Validazione**  | Pipeline con ~25 regole di validazione                      |
| **Auto-calc**    | Ricalcolo automatico derivati (salt_g, fat_g, ecc.)         |
| **LiveSync**     | Modifiche si riflettono immediatamente nell'app via Context |
| **Stati visivi** | Indicatori colorati: default / modificato / importato       |

---

## 8. DevTools

### Accesso

- URL: `/dev` o `/dev/:tab`
- Shortcut: `Ctrl+Shift+D` (toggle tra `/dev` e `/`)

### 5 tab consolidati

| Tab ID    | Label         | Contenuto                                                            |
| --------- | ------------- | -------------------------------------------------------------------- |
| `project` | Progetto      | GitHub links, health check, bundle analysis, issue tracker           |
| `design`  | Design System | Catalogo DS interattivo completo (stessa vista di `/design-system`)  |
| `editor`  | Style Editor  | Editor 15 stili con smart import, diff, validazione                  |
| `engine`  | Engine Lab    | Compensazioni, Q10, punteggi, radar chart interattivo                |
| `sync`    | Sync          | Scansione file, export/import bundle, diff viewer, generatore prompt |

**Legacy URL redirect:** `LEGACY_TAB_MAP` mappa i vecchi ID tab ai nuovi:

- `overview` -> `project`
- `audit` -> `project`
- `styles` -> `editor`
- `compensations` -> `engine`
- `q10` -> `engine`
- `scores` -> `engine`

---

## 9. Sistema Sync (Make <-> Locale)

### Panoramica

Il sistema permette di sincronizzare il codice tra Vulcan Cloud (browser) e un ambiente di sviluppo locale (Cursor, Windsurf, VS Code). Due componenti:

| Componente   | Posizione                         | Funzione                                        |
| ------------ | --------------------------------- | ----------------------------------------------- |
| **SyncTab**  | `src/app/components/sync-tab.tsx` | UI nel browser: scansione, bundle, diff, prompt |
| **sync.mjs** | root del progetto                 | Script CLI Node.js: scan, export, import, diff  |

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

Hash: djb2 (identico browser/CLI).

### Workflow Make -> Locale

1. DevTools -> Sync -> "Scansiona progetto"
2. "Copia Bundle JSON" -> clipboard
3. Terminale locale:
   - **macOS:** `pbpaste | node sync.mjs import`
   - **Linux:** `xclip -selection clipboard -o | node sync.mjs import`
   - **Windows:** `powershell -c "Get-Clipboard" | node sync.mjs import`

### Workflow Locale -> Make

1. Lavori nell'IDE locale
2. `node sync.mjs export | pbcopy` (macOS) o equivalente
3. Vulcan Cloud: DevTools -> Sync -> incolla -> "Analizza diff"
4. Scegli modalita prompt -> "Copia prompt" -> incolla nella chat

### Due modalita di prompt

| Modalita                    | Strategia                               | Quando usarla                       |
| --------------------------- | --------------------------------------- | ----------------------------------- |
| **Diff compatto** (default) | Algoritmo LCS, output `fast_apply_tool` | Default, ~97% riduzione token       |
| **File interi**             | Contenuto completo con `write_tool`     | Fallback se il patch non si applica |

**Fallback automatico:**

- File < 25 righe -> sempre file intero
- File con > 65% righe diverse -> sempre file intero
- Prodotto righe old x new > 4M -> sempre file intero (LCS troppo costoso)

### Comandi CLI

| Comando                              | Funzione                         |
| ------------------------------------ | -------------------------------- |
| `node sync.mjs scan`                 | Mostra file con righe e hash     |
| `node sync.mjs diff`                 | Cosa e cambiato dall'ultimo sync |
| `node sync.mjs export > bundle.json` | Salva bundle                     |
| `node sync.mjs import bundle.json`   | Importa bundle                   |

---

## 10. Setup e Deployment

### Prerequisiti

| Strumento | Versione                 | Note                         |
| --------- | ------------------------ | ---------------------------- |
| Node.js   | 18.x+ (consigliato 20.x) | `node -v`                    |
| pnpm      | 8.x+ (consigliato 9.x)   | Package manager del progetto |
| Git       | 2.x                      | Per clonare il repo          |

### Installazione rapida

```bash
# Clona e installa
git clone https://github.com/zatteogit/vulcan-pizza-lab.git
cd vulcan-pizza-lab
pnpm install

# Avvia dev server
pnpm dev
# -> http://localhost:5173

# Build produzione
pnpm build
pnpm preview
# -> http://localhost:4173
```

### Pulizia opzionale

Il progetto contiene dead code ereditato dalla generazione iniziale:

```bash
# Rimuovi 46 componenti shadcn non usati (VPL-032)
rm -rf src/app/components/ui/

# Rimuovi ~35 pacchetti npm orfani (VPL-033)
pnpm remove @emotion/react @emotion/styled @mui/icons-material @mui/material \
  @popperjs/core @radix-ui/react-accordion @radix-ui/react-alert-dialog \
  @radix-ui/react-aspect-ratio @radix-ui/react-avatar @radix-ui/react-checkbox \
  @radix-ui/react-collapsible @radix-ui/react-context-menu @radix-ui/react-dialog \
  @radix-ui/react-dropdown-menu @radix-ui/react-hover-card @radix-ui/react-label \
  @radix-ui/react-menubar @radix-ui/react-navigation-menu @radix-ui/react-popover \
  @radix-ui/react-progress @radix-ui/react-radio-group @radix-ui/react-scroll-area \
  @radix-ui/react-select @radix-ui/react-separator @radix-ui/react-slider \
  @radix-ui/react-slot @radix-ui/react-switch @radix-ui/react-tabs \
  @radix-ui/react-toggle-group @radix-ui/react-toggle @radix-ui/react-tooltip \
  class-variance-authority clsx cmdk date-fns embla-carousel-react \
  input-otp next-themes react-day-picker react-dnd react-dnd-html5-backend \
  react-hook-form react-popper react-resizable-panels react-responsive-masonry \
  react-slick sonner tailwind-merge tw-animate-css vaul
```

### Opzioni di deployment

L'app e una **SPA statica** — funziona su qualsiasi hosting statico.

| Piattaforma           | Build             | Output         | Note                             |
| --------------------- | ----------------- | -------------- | -------------------------------- |
| **Netlify**           | `pnpm build`      | `dist`         | `_redirects` gia presente        |
| **Vercel**            | `pnpm build`      | `dist`         | Serve `vercel.json` con rewrite  |
| **Cloudflare Pages**  | `pnpm build`      | `dist`         | Nessuna config extra             |
| **GitHub Pages**      | `pnpm build`      | `dist`         | Serve `basename` nel router      |
| **Docker**            | Multi-stage Nginx | Porta 80       | Vedi sezione 14.3 del Guidelines |
| **VPS (Nginx)**       | `rsync dist/`     | `/var/www/...` | `try_files` per SPA              |
| **Node.js (Express)** | `node server.mjs` | Porta 3000     | SPA fallback                     |

### Variabili d'ambiente

| Variabile  | Uso                                 | Default |
| ---------- | ----------------------------------- | ------- |
| `PORT`     | Porta Express (se usi `server.mjs`) | 3000    |
| `BASE_URL` | Base path per sottodirectory        | `/`     |

---

## 11. Stato del progetto

### Statistiche (15 marzo 2026)

| Metrica                 | Valore                                                                                             |
| ----------------------- | -------------------------------------------------------------------------------------------------- |
| File attivi             | ~65 (`.tsx`, `.ts`, `.css`)                                                                        |
| Righe di codice (top 5) | style-editor-tab: 3622, pizza-engine: 2644, dev-tools: 1409, sync-tab: 1280, score-dashboard: 1278 |
| Stili pizza             | 15 (4 famiglie)                                                                                    |
| Lingue supportate       | 7                                                                                                  |
| CMS campi editabili     | ~200+                                                                                              |
| Design System file      | 20                                                                                                 |
| Issue chiuse            | 54                                                                                                 |
| Issue blocked           | 2 (VPL-032, VPL-033)                                                                               |
| Issue aperte            | 0                                                                                                  |

### Issue Tracker

**Convenzione ID:** `VPL-XXX` per issue numerate, `VPL-CXX` per issue chiuse pre-tracker.

#### Issue BLOCKED

| ID      | Titolo                           | Motivo                               |
| ------- | -------------------------------- | ------------------------------------ |
| VPL-032 | 46 file `ui/` shadcn — dead code | File protetti dal sandbox Vulcan Cloud |
| VPL-033 | ~35 npm packages orfani          | Richiede `pnpm remove` manuale       |

#### Highlights per area

| Area          | Issue risolte                                         | Principali                                                                |
| ------------- | ----------------------------------------------------- | ------------------------------------------------------------------------- |
| **Engine**    | VPL-C01→C06, VPL-053                                  | Chicago butter, Q10 variabile, P/L, Arrhenius, STG AVPN 2024, 9->15 stili |
| **UX/UI**     | VPL-002, 005-007, 011-013, 027-031, 040-044, 052, 054 | Dark mode, scroll-companion, ScoreRing DRY, tap feedback, filtro famiglia |
| **A11y**      | VPL-001, 008-009, 019-023, 045                        | reduced-motion, aria-label, focus management, skip-to-content             |
| **Token/CSS** | VPL-031, 046-051                                      | Font-size scala, Tier 3 migration, transparent->rgba                      |
| **DevOps**    | VPL-004, 014-017, 034                                 | Cleanup, build TS, sub-route DevTools, Notion sync, DS patterns           |

### Dead code cleanup (15 marzo 2026)

- Rimossi 8 import inutilizzati da `user-needs.tsx`
- Eliminati 2 file dead in `/src/imports/`
- Confermato: tutti i ~30 file attivi puliti (nessun import fantasma, `console.log`, `@ts-ignore`)

---

## 12. Mappa file completa

### Root

| File                 | Funzione                              |
| -------------------- | ------------------------------------- |
| `package.json`       | Dipendenze e script                   |
| `tsconfig.json`      | Configurazione TypeScript             |
| `vite.config.ts`     | Build config + plugin figmaAssetStub  |
| `postcss.config.mjs` | PostCSS (Tailwind v4 via Vite plugin) |
| `sync.mjs`           | CLI sync Make <-> locale              |
| `index.html`         | Entry HTML                            |

### `/src/styles/`

| File           | Righe | Funzione                                                    |
| -------------- | ----- | ----------------------------------------------------------- |
| `theme.css`    | 1347  | Token 3-tier, custom properties, utility classes, dark mode |
| `index.css`    | --    | Entry CSS (importa theme + tailwind + fonts)                |
| `tailwind.css` | --    | Tailwind v4 config                                          |
| `fonts.css`    | --    | Google Fonts import (Playfair Display, DM Sans, DM Mono)    |

### `/src/app/`

| File        | Righe | Funzione                   |
| ----------- | ----- | -------------------------- |
| `App.tsx`   | 6     | RouterProvider bootstrap   |
| `routes.ts` | 22    | createBrowserRouter config |

### `/src/app/pages/`

| File                | Righe | Route               | Funzione                |
| ------------------- | ----- | ------------------- | ----------------------- |
| `home.tsx`          | 1255  | `/`                 | Orchestrator principale |
| `dev.tsx`           | 18    | `/dev`, `/dev/:tab` | Wrapper DevTools        |
| `design-system.tsx` | 88    | `/design-system`    | Wrapper DS standalone   |
| `cms.tsx`           | 931   | `/cms`              | Editor CMS completo     |
| `not-found.tsx`     | 63    | `*`                 | 404 page                |

### `/src/app/components/` (22 file attivi)

| File                          | Righe | Funzione                         |
| ----------------------------- | ----- | -------------------------------- |
| `style-editor-tab.tsx`        | 3622  | Style Editor completo            |
| `pizza-engine.ts`             | 2644  | Motore scientifico               |
| `dev-tools.tsx`               | 1409  | DevTools 5 tab                   |
| `sync-tab.tsx`                | 1280  | Tab Sync                         |
| `user-needs.tsx`              | 1288  | Input utente                     |
| `score-dashboard.tsx`         | 1278  | Dashboard punteggi + PizzaNerd   |
| `recipe-output.tsx`           | 1009  | Ingredienti + timeline           |
| `recipe-configurator.tsx`     | 752   | Fine-tuning sliders              |
| `recommended-styles.tsx`      | 525   | Grid stili + filtro famiglia     |
| `scroll-companion.tsx`        | 457   | ProgressPill + MobileProgressBar |
| `dough-mascot.tsx`            | 411   | DoughBlob energy-reactive        |
| `style-detail-sheet.tsx`      | 269   | Bottom sheet dettagli stile      |
| `recipe-stat-strip.tsx`       | 259   | Strip 4 metriche                 |
| `vulcan-logo.tsx`             | 161   | VulcanMark SVG                   |
| `info-tip.tsx`                | 148   | Popover help                     |
| `fire-glow.tsx`               | 125   | Sfondo animato                   |
| `vulcan-hero.tsx`             | 110   | Composizione logo + blob         |
| `scroll-section.tsx`          | 108   | Wrapper soft-focus dimming       |
| `styles-override-context.tsx` | 100   | Context override stili           |
| `root-layout.tsx`             | 75    | Layout condiviso + providers     |
| `score-ring.tsx`              | 71    | SVG ring punteggio               |
| `step-header.tsx`             | 70    | Header editoriale sezione        |

### `/src/app/components/cms/` (9 file)

| File               | Righe | Funzione                                    |
| ------------------ | ----- | ------------------------------------------- |
| `cms-context.tsx`  | 1273  | Provider + schema + defaults + CMS_SECTIONS |
| `i18n.ts`          | 61    | Template helper + formatter                 |
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
| `foundations-logo-brand.tsx`       | F04b: Hero, FireGlow, DoughBlob           |
| `foundations-ext.tsx`              | F05: Estensioni, forme decorative         |
| `foundations-m3e.tsx`              | F06: M3 Expressive tokens                 |
| `foundations-contrast-density.tsx` | F07: Contrasto, densita, a11y             |
| `components-a.tsx`                 | C01: Chip, bottoni, toggle                |
| `components-b.tsx`                 | C02: Card, container                      |
| `components-c.tsx`                 | C03: Score ring, radar chart              |
| `components-d.tsx`                 | C04: Slider, range input                  |
| `components-f.tsx`                 | C06: Timeline, step                       |
| `components-g.tsx`                 | C07: Modal, sheet, popover                |
| `components-g2.tsx`                | C07b: Tooltip, info tip                   |
| `components-h.tsx`                 | C08: Carousel                             |
| `carousel-variants.tsx`            | Demo carousel                             |
| `patterns-templates.tsx`           | P01-P08: Pattern e template               |

### Dead code (non eliminabile dal sandbox)

| Directory          | File | Note                                  |
| ------------------ | ---- | ------------------------------------- |
| `ui/*.tsx`         | 46   | shadcn/radix, non importati — VPL-032 |
| `ui/utils.ts`      | 1    | clsx/twMerge non usata                |
| `ui/use-mobile.ts` | 1    | Hook non usato                        |

---

## 13. Convenzioni e regole

### Naming

| Contesto              | Convenzione                 | Esempio                                   |
| --------------------- | --------------------------- | ----------------------------------------- |
| File componenti       | `kebab-case.tsx`            | `score-dashboard.tsx`                     |
| Export componenti     | PascalCase                  | `ScoreDashboard`                          |
| File logica           | `kebab-case.ts`             | `pizza-engine.ts`                         |
| CSS custom properties | `--kebab-case` con prefissi | `--surface-container`, `--chip-bg-active` |
| Commenti sezione      | `/* === TITOLO === */`      | `/* === TYPES === */`                     |

### Stile inline vs Tailwind

| Tailwind                                 | Inline style                              |
| ---------------------------------------- | ----------------------------------------- |
| Layout: flex, grid, padding, margin, gap | Colori da CSS custom props                |
| Overflow, sticky, fixed, rounded         | font-family, font-size, font-weight       |
| --                                       | letter-spacing, line-height               |
| --                                       | Gradients, shadows, borders con variabili |

**Mai** classi Tailwind per `font-size` (`text-2xl`), `font-weight` (`font-bold`), `line-height` (`leading-*`).

**Mai** `"transparent"` come valore CSS su elementi con `transition` — usare `rgba(0,0,0,0)`.

### Animazione

| Regola       | Dettaglio                                                                     |
| ------------ | ----------------------------------------------------------------------------- |
| Libreria     | Motion (`import { motion } from 'motion/react'`)                              |
| Tap feedback | `active:scale-95` (Tailwind) su `motion.button`, non `whileTap`               |
| Entrance     | `whileInView` con `viewport={{ once: true }}`                                 |
| Transizioni  | **Sempre spring** (`stiffness`/`damping`), mai `duration`/`ease` per entrance |
| Pagina       | `AnimatePresence mode="wait"`                                                 |
| Wrapper      | Mai `React.Fragment`/`<>...</>` — usare elemento concreto                     |

### Accessibilita

| Requisito         | Implementazione                                                                  |
| ----------------- | -------------------------------------------------------------------------------- |
| Reduced motion    | `prefers-reduced-motion` in FireGlow, ScrollSection, DoughBlob, scroll-companion |
| Bottoni icon-only | `aria-label` su tutti                                                            |
| Toggle            | `aria-expanded`                                                                  |
| Popover/modali    | Escape per chiudere                                                              |
| Screen reader     | Skip-to-content link                                                             |
| Transizioni       | Focus management in build -> result                                              |

### Regole per l'AI (riepilogo)

1. Mai toccare `theme.css` senza richiesta esplicita
2. Sempre CSS custom properties per colori, mai hex hardcoded
3. Sempre `tabular-nums` su numeri con DM Sans
4. Sempre DM Mono per label funzionali
5. Sempre `active:scale-95` su `motion.button`
6. Sempre spring transitions per entrance
7. Clipboard: sempre doppio path (API + textarea fallback)
8. Portal: `createPortal` + inline `position: fixed` + `zIndex: 9999`
9. CMS: usare `useCms()` per tutti i testi, non stringhe hardcoded
10. i18n: usare `t()` o `createFormatter()` per template

---

## 14. Appendice: API esterne e vincoli iframe

### API esterne (client-side, nessuna API key)

| API          | Endpoint                              | Uso                                |
| ------------ | ------------------------------------- | ---------------------------------- |
| Open-Meteo   | `api.open-meteo.com/v1/forecast`      | Temperatura ambiente               |
| Nominatim    | `nominatim.openstreetmap.org/reverse` | Reverse geocoding                  |
| Geolocation  | `navigator.geolocation`               | Posizione utente                   |
| Google Fonts | `fonts.googleapis.com`                | Playfair Display, DM Sans, DM Mono |
| Unsplash     | URL statici                           | Foto stili pizza                   |

L'app funziona completamente offline dopo il caricamento (tranne Google Fonts e meteo).

### Vincoli iframe

| Area             | Soluzione                                                                                           |
| ---------------- | --------------------------------------------------------------------------------------------------- |
| **Clipboard**    | 1. `navigator.clipboard.writeText` 2. Fallback: `createElement('textarea')` + `execCommand('copy')` |
| **Modali**       | `createPortal(node, document.body)` con `position: fixed`, `z-index: 9999`, inline styles           |
| **Dark mode**    | `.dark` su `<html>` (document.documentElement) — portali ereditano automaticamente                  |
| **localStorage** | Puo essere ristretto in iframe sandboxed — verificare `allow="storage-access"`                      |

### Troubleshooting

| Problema                               | Causa                  | Soluzione                                              |
| -------------------------------------- | ---------------------- | ------------------------------------------------------ |
| `Cannot find module 'figma:asset/...'` | Import Figma-specific  | Plugin `figmaAssetStub` in vite.config gestisce questo |
| Pagina bianca su route                 | SPA fallback mancante  | `try_files $uri /index.html` (Nginx)                   |
| Font non caricati                      | Offline/firewall       | Servire font localmente da `/public/fonts/`            |
| Dark mode non persiste                 | localStorage ristretto | Verificare `allow="storage-access"` in iframe          |
| Build fallisce                         | Errori TypeScript      | `noUnusedLocals: false` gia impostato in tsconfig      |

---

> Documento generato il 15 marzo 2026 dal codebase Vulcan Pizza Lab.
> Per la documentazione tecnica AI-oriented, vedere `guidelines/Guidelines.md`.
> Per il dettaglio delle issue GitHub, vedere `docs/github-issues.md`.