# Modello a tier del Design System Vulcan + roadmap DTCG-ready

> Stato: **piano in esecuzione.** F0/F1/F5-1/F5-2/F5-3 app completate; F5-4 showcase completata; F5-5 quarta passata; F2 T4 completata con
> `Chip` (incluso `profile` e rimozione `ProfileChip`), `FilterChip` (incluso `glossary` e rimozione `CategoryChip`),
> `SegmentedControl` (inclusi `sync-tab`, `dev-tools`, `recipe-configurator`), `Heading`, `CtaButton`, `Surface`, `Badge`, `Switch`
> (inclusi `recipe-output`, `recipe-configurator`) con sweep legacy a 0 residui e build verde. Target dichiarato: **(b) DTCG-ready** — restiamo
> CSS-authored (`src/styles/theme.css`), ma allineiamo naming, struttura e tipi al
> [Design Tokens Format Module 2025.10](https://www.designtokens.org/tr/drafts/format/)
> (prima versione stabile, 28 ott 2025) così che una futura conversione a sorgente
> `.tokens.json` + build sia meccanica. **Nessun build system nuovo in questa fase.**

> **Verifica ripresa (2026-06-20):** audit di conformità su `src/app` (escl. showcase e `ds/`) →
> **0 hex, 0 `#fff`, 0 primitivi T1 `var(--color-*)`, 0 font literal, 0 rgba non-scrim, 0 classi composite legacy.**
> Showcase: 1 sola occorrenza `var(--color-*)` ma è una *stringa di documentazione* del pattern tier (non consumo). `tsc --noEmit` e `npm run build` verdi.
> Fix di regressione trovato e corretto: in `home.tsx` il refactor heading aveva lasciato `resultHeadingRef` orfano (focus management VPL-008 rotto) → ref riattaccato al `motion.main` del result con `tabIndex={-1}` + `outline-none`.
> **Enforcement attivo (F5-6):** `npm run check:tokens` / `npm run verify`; pre-commit hook (`.githooks/pre-commit` + `core.hooksPath`), CI `.github/workflows/verify.yml`. **F5-7 decisa:** T2 semantico tollerato in app code.
> **Modello T1–T6 realizzato.** Fase 4 (T6) formalizzata: 11/12 pagine compongono `ds/` (T4) + pattern (T5), 0 violazioni token; `PageShell` deliberatamente non estratto (sarebbe leaky). Verificato in **light + dark** (token on-color corretti in entrambi) e end-to-end sul risultato `RecipeView` (focus management VPL-008 ripristinato).

---

## 1. Il modello a tier completo

Sette livelli. I primi quattro (token) sono terreno DTCG; gli ultimi tre (codice) sono
fuori dallo scope della spec per definizione — la spec copre **solo i token**.

| Tier | Nome | Dove vive | Regola di consumo |
|---|---|---|---|
| **T1** | Primitivi | `theme.css` (`:root`) | raw values. Consumati **solo** da T2. |
| **T2** | Semantici (+ T2.5 dataviz/forge) | `theme.css` | ruoli. Referenziano T1. Consumati da T3. |
| **T3** | Token-componente | `theme.css` | `--{componente}-{prop}`. Referenziano T2. |
| **T3.5** | Composite (classi) | `theme.css @layer components` | `.type-*`, `.surface-*`, `.interactive-*`, `.badge-*`. Bundlano T1/T3. |
| **T4** | **Componenti** (atomi/molecole) | `src/app/components/ds/` *(nuovo)* | React context-free. Consumano **solo** T3 + T3.5. |
| **T5** | **Pattern** (composti / organismi) | `src/app/components/` | React con logica di dominio. Compongono T4. |
| **T6** | **Template** (scheletri pagina) | `src/app/components/` / `pages/` | Orchestrano T5, definiscono gli slot. |

**Direzione di consumo (invariante d'oro):**
`Schermata → T6 → T5 → T4 → T3/T3.5 → (T2 → T1)`
Mai saltare verso il basso. Una schermata non scrive mai hex/rgba/`var(--color-*)`/
`var(--primary)`: usa componenti o, al più, token T3.

**Test di confine T4 / T5 / T6:**
- **T4** — "Lo userei in qualsiasi app?" → `Chip`, `CtaButton`, `Surface`, `Heading`, `Switch`, `Badge`.
- **T5** — "Conosce il dominio (ricetta/impasto) ma non è una pagina?" → `RecipeStatStrip`, `RecipeMatchCard`, `SettingsSummaryBar`, `StepHeader`.
- **T6** — "È la struttura di una schermata?" → `RecipeView`, hero della home.

> Nota terminologica: "pattern" qui = **componenti composti** (T5). Per evitare
> collisione con lo showcase `design-system/patterns-templates.tsx`, nel codice li
> chiamiamo **"composti"**; "pattern" resta termine documentale.

---

## 2. Convenzioni DTCG-ready (target b)

Regole di stile per i token già oggi, così la mappatura 1:1 verso DTCG sia immediata.

### 2.1 Tier → Gruppi
Ogni tier/categoria è un **gruppo** DTCG. Il prefisso kebab del nome CSS è il path del
gruppo: `--chip-bg-active` ↔ gruppo `chip` → token `bg-active`. I nomi DTCG vietano
`.`, `{`, `}` e il prefisso `$`: il nostro kebab-case è già conforme (case-sensitive).

### 2.2 Tipi (impliciti ora, espliciti in futuro)
DTCG impone `$type` e vieta il type-guessing. In fase (b) lo **documentiamo per
categoria** (commento di gruppo in `theme.css`), pronti a diventare `$type`:

| Categoria token | `$type` DTCG | Forma valore DTCG (riferimento per il futuro) |
|---|---|---|
| `--color-*` | `color` | `{ colorSpace:"srgb", components:[r,g,b], alpha?, hex? }` |
| `--font-size-*`, `--radius-*`, `--space-*`, `--border-width-*` | `dimension` | `{ value:number, unit:"px"\|"rem" }` (unit obbligatoria anche a 0) |
| `--weight-*` | `fontWeight` | numero 1–1000 o keyword |
| `--font-sans/-serif/-mono` | `fontFamily` | string o array ordinato |
| `--leading-*` | `number` | numero puro |
| `.type-*` | `typography` (composite) | `{ fontFamily, fontSize, fontWeight, lineHeight, letterSpacing }` |
| `--elevation-*` / ombre | `shadow` (composite) | oggetto/array shadow |

### 2.3 Riferimenti
`var(--token)` è il nostro alias; mappa a `{gruppo.token}` DTCG. **Regola**: gli alias
puntano sempre al tier immediatamente inferiore (T3→T2→T1), mai due tier sotto.

### 2.4 Composite tipografiche = tipo `typography`
Le classi `.type-*` **sono** token `typography` DTCG implementati in CSS. Vincolo da
rispettare perché la conversione resti 1:1:
- una `.type-*` definisce **solo la voce** (family/size/weight/leading/tracking/features), **mai il colore** (già rispettato, commento `theme.css:1363`);
- ogni sotto-proprietà referenzia un token (`var(--font-size-*)`, `var(--weight-*)`, `var(--font-*)`), **mai un literal**.

### 2.5 Colore: limite noto da gestire
Il tipo `color` DTCG è **statico**. Le tinte `color-mix(in srgb, var(--x) N%, transparent)`
**non sono esprimibili** come token DTCG. Politica adottata:
- le tinte calcolate **restano a livello CSS** (T3.5 / inline ammesso con token semantico dentro `color-mix`), e **non** verranno mai promosse a token T1/T2;
- i colori **statici** (palette) seguono invece la forma `color` DTCG-ready.

### 2.6 `$description` e `$deprecated` (best practice)
- I commenti ricchi già presenti in `theme.css` mappano a **`$description`** DTCG: vanno mantenuti su ogni token/gruppo (lo standard li usa per tooltip/styleguide).
- I token **legacy/morti** vanno marcati **`$deprecated`** (valori ammessi: `true` / `false` / stringa con il token sostitutivo) o rimossi. Censimento attuale (tutti a **0 usi** nel codice app): `--font-weight-medium`, `--font-weight-normal` (→ `--weight-*`), `--radius` (→ `--radius-lg`), tutta la famiglia `--sidebar*` (residuo shadcn, ui/ ormai rimossa).

### 2.7 Dark mode → fuori dal Format
Il dark mode (`.dark` in `theme.css`) è competenza del
[Resolver Module 2025.10](https://www.designtokens.org/tr/drafts/resolver/), separato.
In fase (b) lo lasciamo com'è; lo annotiamo come "resolver-ready".

---

## 3. Backlog — tutto il da farsi

Ogni item ha ID, file, e criterio di accettazione. Le fasi sono ordinate per
dipendenza: una sblocca la successiva.

### Fase 0 — Fondamenta token + bug (T1–T3) — ✅ FATTA (build verde)
- **F0-1 🐛 `--font-body` non definito.** Referenziato in `app-shell`, `feedback-analysis` (7×), `search-overlay` (5×), `recipe-feedback`, `learn.tsx`, ma assente in `theme.css` (esistono solo `--font-sans/-serif/-mono`) → cade sul font di default.
  *Fix:* definire `--font-body: var(--font-sans)` in T2.
  *Accettazione:* `grep 'var(--font-body)'` risolve; nessun cambiamento visivo dove era già DM Sans.
- **F0-2 Documentare `$type` per categoria** come commento di gruppo in `theme.css` (vedi §2.2).
  *Accettazione:* ogni gruppo T1 ha la riga `/* $type: ... */`.
- **F0-3 Allineare la forma dei nomi a gruppi DTCG** dove diverge (verifica che nessun nome contenga `.`/`{`/`}`).
  *Accettazione:* check di naming verde (vedi F5-3).
- **F0-4 Token legacy morti** (0 usi app): `--font-weight-medium`, `--font-weight-normal`, `--radius`, `--sidebar*`.
  *Fix:* rimuovere se nessun residuo (anche showcase), altrimenti `$deprecated` con sostitutivo (§2.6).
  *Accettazione:* nessun token a 0 usi privo di marcatura `$deprecated`.

### Fase 1 — Layer composite pulito (T3.5) — ✅ FATTA (build verde)
- **F1-1 Eliminare i literal di famiglia dalle composite.** `.type-step-num/-mono-label/-code/-data/-data-lg/-nerd/-display/-heading-*/-body*/-editorial-quote`, `.badge-base`, `.interactive-tag` hardcodano `"DM Sans"`/`"Playfair Display"`/`"DM Mono"`.
  *Fix:* sostituire con `var(--font-sans/-serif/-mono)`.
  *Accettazione:* `grep -E '"(DM Sans|Playfair|DM Mono)"' theme.css` → 0.
- **F1-2 Decidere il destino dei composti morti** `.surface-panel` (0 usi) e `.interactive-tag` (0 usi): adottare nei punti pertinenti o rimuovere.
  *Accettazione:* ogni `.type-*`/`.surface-*`/`.interactive-*` o ha ≥1 uso reale o è cancellato.

### Fase 2 — T4 Componenti (`src/app/components/ds/`) — 🔶 in corso
- **F2-1 ✅ Creare il barrel `ds/`** e la regola di import. → `src/app/components/ds/index.ts`.
- **F2-2 ⭐ `ds/Chip`** — promuovere `UnifiedChip` a componente condiviso che consuma `--chip-*` (incl. `--chip-font-size/-weight/-weight-active`, upgrade da T1).
  - ✅ Creato `ds/Chip.tsx`; ✅ migrato `user-needs` (rimossi `CHIP` const + `UnifiedChip` locali); ✅ verificato in browser (stato attivo: `--chip-bg-active`+`--chip-text-active`, check animato, testo scuro corretto in dark mode).
  - ✅ Migrato `profile` (rimossi `ProfileChip` locale e riferimenti e usati `Chip`).
  - ⏳ Da migrare/riconciliare (size+animazione divergenti, hanno `#fff` → F5-1): `troubleshooting-panel`, `recommended-styles`, `recipe-configurator`, `recipe-output`, `style-editor-tab`, + yeast chips in `user-needs:788`.
  *Nota:* questi divergono in dimensione (md vs lg) e animazione → valutare un `size` prop / token `--chip-font-size` varianti prima di forzare la migrazione.
  *Accettazione:* nessuna reimplementazione inline di chip; assorbe gran parte di F5-1.
- **F2-2b ✅ `ds/FilterChip` + `ds/SegmentedControl`** — i chip divergenti (filtro emoji di `troubleshooting`, tab animati con indicatore di `profile`) NON sono toggle-chip: vanno unificati in componenti dedicati, non forzati in `ds/Chip`.
  - ✅ Creato `ds/FilterChip.tsx`, esportato dal barrel e migrati filtri famiglia/facet in `recommended-styles` + categorie in `troubleshooting-panel`.
  - ✅ Migrato `glossary.tsx` (rimossi `CategoryChip` e usati `FilterChip`).
  - ✅ Creato `ds/SegmentedControl.tsx` + token `--segmented-*`; prima migrazione: toggle formato prompt in `sync-tab`, selettore modalità Engine Lab e tab header in `dev-tools`.
  - ✅ Migrato `recipe-configurator.tsx` (selettore temperatura fermentazione migrato a `SegmentedControl`).
  - ✅ Il filtro lievito Q10 di `dev-tools` è passato a `FilterChip` (filtro, non segmented control).
  - ✅ Residuo tab risolto (decisione per candidato):
    - `RecipeSectionTabs` → **resta T5** (pattern specializzato): due varianti (inline sticky + navbar dock fisso mobile con search abbinato), pill attivo scorrevole via `layoutId`, chrome liquid-glass, scroll-on-change. Forzarlo in `SegmentedControl` perderebbe queste proprietà. Token già puliti, nessuna violazione.
    - Selettore **tema** profilo (light/dark/auto) → **migrato a `ds/SegmentedControl`** (`tone="brand"`): è un mode-switch identico a quelli già migrati (sync-tab, dev-tools). Verificato in browser (track + segmento attivo terracotta, interazione applica il tema, light+default). Miglioramento UX: ora differenziato visivamente dalla lista lingue.
    - Selettore **lingua** profilo (6 lingue con bandiere) → **resta a pill**: è una lista, non un mode-switch; 6 opzioni in un track segmentato sarebbero strette.
- **F5-7 ✅ Policy decisa: T2 semantico TOLLERATO in app code.** `var(--primary)`, `var(--surface-container)`, `var(--text-*)`, ecc. restano consumabili direttamente. Razionale: la linea dura del modello (niente T1/hex/valori hardcoded) è già enforced; forzare ogni T2→T3 sarebbe churn enorme per beneficio marginale. Linea guida (non bloccante): **dove esiste un token T3 per il ruolo esatto** (es. chip → `--chip-*`, cta → `--cta-btn-*`) preferirlo. Il guard F5-6 **non** blocca il consumo T2 per scelta.
- **F2-3 ✅ `ds/Heading` prima passata (build verde)** — applica `.type-heading-xl/lg/md/sm` + `.type-display` oltre a `.type-title-page`.
  - ✅ Esteso `ds/Heading.tsx` con livelli `display/page/xl/lg/md/sm` e tag semantici default.
  - ✅ Migrati page/screen title: `not-found`, `home` (hero + step stili), `profile` (FTU + pagina + section/modal title), `recipe` fallback, `pre-ferments` (page + sezioni), `explore` (page + anteprime), più gli usi già presenti in `learn` e `recipe-view`.
  - ✅ Residui heading classificati con precisione (giu 2026):
    - **17 `font-serif italic`** = sottotitoli/descrizioni editoriali, **NON heading** → restano (token-compliant via `font-serif`=`var(--font-serif)`), non vanno in `ds/Heading`.
    - **~19 heading responsive bespoke** (card/section title, `clamp(...)`, alcuni con rem hardcoded) → le composite a **size fissa** non li coprono; migrarli cambierebbe i pixel. Inoltre mismatch sistematico: le schermate usano `--leading-snug` (1.1), le composite `--leading-compact`/`--leading-title` → **decisione bidirezionale aperta** (vedi sotto), non forzata.
    - **1 caso pulito migrato**: `learn.tsx` h2 "Risorse" (5xl=20px fisso) → `ds/Heading level="md" as="h2"` con override `lineHeight: --leading-snug` (pixel-identico).
  - 🔶 **Decisione bidirezionale da prendere (DS→schermate):** allineare il `line-height` delle composite heading a `--leading-snug` (convenzione dominante nelle schermate)? Sbloccherebbe la migrazione dei ~19 heading, ma cambia i pixel sui titoli già migrati → richiede l'occhio dell'utente. Lasciato in sospeso di proposito.
  *Accettazione:* i titoli delle pagine passano per `Heading`; le composite heading risultano usate.
- **F2-4 ✅ `ds/CtaButton`, `ds/Surface`, `ds/Badge`, `ds/Switch` completati (build verde)** — wrappano `--cta-btn-*`, `.surface-*`, `.badge-base`, `--switch-*`.
  - ✅ Creati `ds/CtaButton.tsx`, `ds/Surface.tsx`, `ds/Badge.tsx`, `ds/Switch.tsx`; esportati dal barrel `ds/index.ts`.
  - ✅ Aggiunto token T3 `--switch-thumb: var(--surface-bright)` per evitare consumo T2 diretto nel T4 `Switch`.
  - ✅ Migrazioni iniziali: CTA fallback `not-found`/`recipe`, footer CTA setup ricetta, `recipe-output` da `ui/switch` a `ds/Switch`, `cms` status badge + field group/locale card a `Badge`/`Surface`.
  - ✅ Seconda passata: `CtaButton` usato per CTA FTU/profilo, conferma locale, `style-detail-sheet`, avvio cooking da `recipe-output`, fine sessione in `cooking-mode`; `Surface` usato per accordion parametri `home`, controlli timeline `recipe-output`, empty state `recommended-styles`; `sync-tab` usa `Surface` per le card principali e `Badge` nel suo helper `StatusBadge`.
  - ✅ Sweep finale: migrate le occorrenze residue in `style-editor-tab`, `dev-tools`, `engine-test-suite`, `sync-tab`, `home`, `cooking-mode`, `active-cook-widget`, header glass `troubleshooting`/`design-system`.
  - ✅ Verifica residui: `rg -n -e "--cta-btn-" -e "surface-card" -e "surface-glass" -e "badge-base" src/app/pages src/app/components -g '*.tsx' -g '!src/app/components/design-system/**' -g '!src/app/components/ds/**'` → 0 occorrenze.
  - ✅ Verifica tecnica: `npm run build` e `npx tsc --noEmit` verdi.
  *Accettazione:* le schermate non scrivono più questi stili inline.

### Fase 3 — T5 Pattern / composti — 🔶 in corso
- **F3-1 ✅ Catalogo iniziale** dei composti di dominio: `RecipeStatStrip`, `RecipeMatchCard`, `SettingsSummaryBar`/`UserNeeds`, `ContextualWarnings` (`troubleshooting-panel`), `RecipeSectionTabs`, `RecommendedStyles`, `StyleDetailSheet`, `RecipeLearningPanel`, `ActiveCookWidget`. `StepHeader` non esiste più come componente runtime: resta solo nello showcase/documentazione.
- **F3-2 🔶 Bonificare** i composti che violano (vedi finding A2/A3 sotto, ricondotti qui).
  - ✅ Prima passata: `RecipeMatchCard` usa `Surface`; `RecipeStatStrip` usa `Badge` per il pill nerd e `--font-mono`; `user-needs` rimuove `#000` dai gradienti time-slot usando `--overlay-backdrop`; `rgba(0,0,0,0)` banali convertiti a `transparent` in `user-needs`, `troubleshooting-panel`, `recipe-section-tabs`.
  - ✅ Verifica mirata sui composti catalogati: 0 `#[hex]`, 0 `var(--color-*)`, 0 literal `"DM Mono"`, 0 classi legacy `surface-card`/`surface-glass`/`badge-base`/`--cta-btn-*`.
  - ✅ Seconda passata: introdotto `FilterChip` e applicato a `RecommendedStyles` e `TroubleshootingGuide`, togliendo duplicazione inline dei chip filtro.
  - ✅ Terza passata: introdotto `SegmentedControl` e applicato ai controlli a selezione singola piu' lineari (`sync-tab` prompt mode, `dev-tools` Engine Lab mode + header tabs); Q10 yeast filter usa `FilterChip`.
  - ✅ Deciso (vedi F2-2b): `RecipeSectionTabs` resta T5 (dock specializzato); il selettore tema profilo è passato a `SegmentedControl`; il selettore lingua resta a pill. Nessun tab forzato in `Chip`.
  *Accettazione:* ogni T5 importa da `ds/` e da token T3; 0 violazioni token interne.

### Fase 4 — T6 Template — ✅ formalizzata (verifica, no over-engineering)
- **F4-T1 ✅ Catalogo T6** — i template/pagina sono i file in `src/app/pages/*` + le composizioni di dominio `RecipeView` (risultato), hero+flow `home`. Ognuno orchestra T5 (pattern) e T4 (`ds/`), consumando solo token ammessi.
- **F4-T2 ✅ Invariante verificato**:
  - Token: guard F5-6 → 0 violazioni su tutte le pagine.
  - Composizione T4: **11/12 pagine importano da `ds/`** (solo `dev.tsx`, wrapper dev-tools, non lo fa — corretto). Es. `home`→`CtaButton/Heading/Surface`, `profile`→`Chip/CtaButton/Heading`, `recipe`→`CtaButton/Heading`.
  - Composizione T5: le pagine montano i pattern di dominio (`RecipeView`, `RecommendedStyles`, `SettingsSummaryBar`, `ContextualWarnings`, `RecipeSectionTabs`…) senza reimplementarli.
- **F4-T3 ⛔ `PageShell` NON estratto (decisione di precisione).** Le pagine condividono uno *shell* a livello di token (`min-h-screen` + `var(--container-page)`/`--text-default` + container `motion` centrato), ma divergono in modo legittimo: `max-w` diversi (3xl/4xl/7xl), header sticky (`cms`/`glossary`/`troubleshooting`/`design-system`), centratura (`not-found`/FTU `profile`), `overflow-hidden`+FireGlow (`learn`/`explore`). Un `PageShell` unico richiederebbe troppe prop → astrazione *leaky* / over-engineering. Lo shell resta inline ma è già 100% token-compliant ed enforced. Se in futuro 3+ pagine convergono su un layout identico, rivalutare.
  *Accettazione:* ✅ le pagine compongono template/pattern/T4 e consumano solo tier ammessi (token enforced); nessuno stile grezzo.

### Fase 5 — Bonifica schermate + enforcement
Finding del primo audit, ricondotti al modello:
- **F5-1 ✅ `#fff`/`#ffffff` su superfici colorate → token on-color** (verificato a livello token in dark mode). Mapping applicato:
  - chip/tab/filtro attivi (bg = `--primary`) → set `--chip-*` (`--chip-text-active` ecc.): `profile` (187, 1980, 2028), `troubleshooting-panel` (258, 281).
  - bottoni/toggle accentati su `--primary` → `--text-on-accent`: `recipe-output:2530`, `active-cook-widget:86`, `recipe-stat-strip` (86, 94).
  - testo su foto/gradient/card colorate → `--overlay-text`: `user-needs` (TIME_COLORS + time chips), `recommended-styles:697`, `learn:302`.
  - *Insight:* in dark mode `--chip-text-active`/`--text-on-accent` = `rgb(58,15,4)` (scuro), `--overlay-text` = bianco. I `#fff` hardcoded sui chip erano un bug di contrasto dark, ora corretto. Le highlight traslucide `rgba(255,255,255,.x)` sono state poi bonificate in F5-2.
  - ⏳ Residuo correlato (non `#fff`): consumo diretto di T2 `var(--primary)`/`var(--surface-container)` nei chip non ancora unificati → sweep tier dedicato (vedi nota sotto).
- **F5-2 ✅ Tinte/scrim hardcoded → `color-mix` con semantico** (§2.5).
  - ✅ Rimossi i RGB semantici hardcoded nel codice app non-showcase: `rgba(204,136,68,*)` → `--tertiary`, `rgba(220,60,60,*)` → `--text-error`, `rgba(43,123,85,*)` → `--cta`.
  - ✅ `recipe-configurator` select focus shadow usa `color-mix` con `--tertiary`; `engine-test-suite` summary/badge/report usa `color-mix` con token semantici; `recipe-learning-panel` backdrop usa `--dialog-scrim`.
  - ✅ Residui `#fff` nei bottoni `sync-tab` convertiti a `--text-on-cta` / `--text-on-accent`.
  - ✅ Verifica mirata: `rg 'rgba\(204,136,68|rgba\(220,60,60|rgba\(43,123,85|rgba\(18, 13, 10|#fff' src/app/pages src/app/components -g '*.tsx' -g '!src/app/components/design-system/**' -g '!src/app/components/ds/**'` → 0 occorrenze.
  - ✅ Rimossi tutti gli zero-alpha (`rgba(0,0,0,0)` / `rgba(0, 0, 0, 0)`) dal codice app non-showcase, sostituiti con `transparent`.
  - ✅ I `background: rgba(0,0,0,alpha)` diretti sono stati mappati a token esistenti: `--sheet-backdrop`, `--dialog-scrim`, `--overlay-backdrop`.
  - ✅ Aggiunti token/alias per gli strati strutturali: `--shadow-color`, `--sheet-shadow`, `--dialog-scrim-strong`, `--dialog-shadow`, `--dialog-shadow-compact` con override dark dove serve.
  - ✅ Le highlight bianche/glass sono passate a `color-mix(in srgb, var(--overlay-text) N%, transparent)`; le ombre locali a `color-mix(in srgb, var(--shadow-color) N%, transparent)`.
  - ✅ Gli scrim immagine/hero rimasti sono mappati a `--overlay-backdrop` (diretto o via `color-mix`); fallback verde comfort → `color-mix` con `--cta`.
  - ✅ Verifica finale app non-showcase: `rg 'rgba\(' src/app/pages src/app/components -g '*.tsx' -g '!src/app/components/design-system/**' -g '!src/app/components/ds/**'` → 0; stesso sweep hex → 0; `npx tsc --noEmit` e `npm run build` verdi.
- **F5-3 ✅ Literal font `"DM Sans"`/`"Playfair"`/`"DM Mono"` → `var(--font-*)`** nel codice app non-showcase.
  - ✅ Bonificati residui in `glossary`, `score-ring`, `explore`, `recommended-styles`, `sync-tab`, `engine-test-suite`, `dev-tools`, `recipe-output`, `style-editor-tab`.
  - ✅ Verifica: `rg '"(DM Sans|Playfair Display|DM Mono)"|fontFamily:.*(DM Sans|Playfair Display|DM Mono)' src/app/pages src/app/components -g '*.tsx' -g '!src/app/components/design-system/**' -g '!src/app/components/ds/**'` → 0 occorrenze.
  - ⏳ Lo showcase `design-system/*` resta fuori da questa accettazione ed è tracciato in F6.
- **F5-4 ✅ Primitivi T1 usati come semantici nello showcase**.
  - ✅ `components-d`: gradienti demo slider sostituiti con `--grad-slider-hydration/-flour/-ferment/-temp`; zero-alpha locale → `transparent`.
  - ✅ `carousel-variants`, `components-h`, `foundations-ext`, `patterns-templates`, `shared`: testo/check sopra foto o overlay → `--overlay-text`.
  - ✅ `foundations-logo`: contesto scuro e sfondo caotico passati a token semantici (`--inverse-surface`, `--text-error`, `--data-water`, `--cta`, `--data-warmth-light`).
  - ✅ Verifica: `rg 'var\(--color-[^)]+\)' src/app/components/design-system src/app/pages/design-system.tsx -g '*.tsx'` lascia solo l'esempio testuale `--primary: var(--color-terracotta-500)` in `foundations.tsx`, ammesso perché documenta la catena T2→T1.
- **F5-5 🔶 Inline `fontSize` che competono con `.type-*`**: ridurre applicando le composite/`Heading` dove la voce coincide.
  - ✅ Baseline aggiornata post-bonifiche colore/font: 807 occorrenze app non-showcase.
  - ✅ Aggiunte composite T3.5: `.type-code-xs`, `.type-data-sm`, `.type-data-xs`, `.type-body-xs`, `.type-label-sm`, `.type-label-xs`.
  - ✅ Prima passata meccanica su call-site già tipizzati (`type-data`, `type-label`, `type-code`) + testi body small/base ripetuti: 137 override rimossi.
  - ✅ `ds/Badge` ora espone `size="xs"` e usa `.badge-size-xs`; rimossi tutti i `fontSize` inline dai `Badge` app non-showcase (+27 override).
  - ✅ Seconda passata: aggiunte `.type-heading-xs` e `.type-body-lg`; `Heading` ora espone `level="xs"` per titoli dialog/modal utility.
  - ✅ Migrati a `Heading` i titoli utility in `recipe-output` e `cooking-mode`; applicate composite body dove il testo coincideva con pattern small/base/lg senza classi preesistenti.
  - ✅ Rimossi override ridondanti da call-site `type-data` gia' allineati alla size default.
  - ✅ Terza passata: aggiunte `.type-code-sm`, `.type-data-base`, `.type-data-field`, `.type-label-compact` per editor form/code/label compatti.
  - ✅ `style-editor-tab` ridotto da 83 a 2 residui intenzionali (emoji/score gigante); `recipe-output` ridotto da 81 a 29 residui intenzionali prevalenti (`clamp(...)`, valori `type-numeric`, ingredienti/step grandi, override CTA).
  - ✅ Quarta passata: `profile` prima bonifica sicura su label/helper/body/modal lingua, 52 → 39 residui; lasciati intenzionalmente emoji, sottotitoli serif, badge numerici e scelte decorative.
  - ✅ Conteggio residuo: 470 `fontSize:` in app non-showcase. Cluster principali rimasti: `cms`, `dev-tools`, `sync-tab`, `profile`, `glossary`, `user-needs`.
  - ✅ Verifica: `npx tsc --noEmit`, `npm run build`, `rg '<Badge.*fontSize|style=\{\{\s*\}\}|rgba\(|#[0-9a-fA-F]{3,8}\b' ...` verdi/0 per i controlli mirati.
  - ⏳ Pass successivo: trattare `cms`, `dev-tools` e `sync-tab`, distinguendo testo reale da `clamp(...)` responsivi, numeri dashboard, icone/emoji e font-size usati come misura grafica.
- **F5-6 ✅ Enforcement anti-regressione** — `scripts/check-design-tokens.mjs` (Node, zero dipendenze). Regole su `src/app/**/*.{ts,tsx}` (escluso showcase; `theme.css` è source-of-truth): `hex-color`, `t1-primitive` (`var(--color-*)`), `font-literal`, `rgba-nonscrim` (scrim 0,0,0 / 255,255,255 esenti), `composite-class-bypass` (`surface-card`/`surface-glass`/`badge-base` fuori da `ds/`). I token T3 (es. `--cta-btn-*`) restano consumabili.
  - ✅ Script `npm run check:tokens`; gate combinato `npm run verify` (= `tsc --noEmit && check:tokens`).
  - ✅ Trovata e corretta dal guard una violazione `.ts` mancata dalle scansioni `*.tsx`: `liquid-dock.ts` usa `--cta-btn-*` → riconosciuto come consumo T3 legittimo (regola affinata, non è violazione).
  - ✅ Stato: **94 file, 0 violazioni**; `npm run verify` exit 0.
  *Resta opzionale:* aggancio a CI / pre-commit hook (non installato un dep husky in questa fase).

### Showcase (`design-system/*`)
- **F6-1 ✅ Verificato: i 21 font-literal residui nello showcase NON sono violazioni.** Sono tutti **documentazione**: righe della tabella type-scale (`{ name:"Display L", font:"Playfair Display", token:"--font-size-10xl" }`) e l'helper `fontFamilyCSS` che renderizza i campioni nel font documentato. Lo showcase **esiste per documentare i primitivi**: mostrarli letterali è corretto (per questo è escluso dal guard). Nessuna azione: tokenizzarli degraderebbe la documentazione. F5-4 (primitivi colore) già completata.

---

## 4. Definition of Done complessiva
1. Invariante d'oro (§1) rispettata: nessuna schermata scrive hex/rgba/`var(--color-*)`/`var(--primary)` diretti.
2. Esiste `src/app/components/ds/` con almeno `Chip`, `Heading`, `CtaButton`, `Surface`, `Badge`, `Switch`; nessuna loro reimplementazione inline.
3. Composite `.type-*` senza literal di famiglia; heading composite effettivamente usate via `Heading`.
4. Token allineati DTCG-ready: gruppi coerenti, `$type` documentati, alias a un solo tier di distanza, limite `color-mix` rispettato.
5. Check di enforcement (F5-6) in CI, verde.
6. Questo documento aggiornato con lo stato reale di ogni item.

---

## 5. Ordine di esecuzione consigliato
**F0 → F1 → F2-2 (Chip) → F5-1 → F2-3 (Heading) → F2-4 → F3 → F4 → F5-2/3/4/5 → F6 → F5-6.**
Razionale: prima le fondamenta e i fix a basso rischio (F0/F1), poi il `Chip` che da
solo dissolve gran parte dei `#fff` (F5-1), poi gli altri T4, poi pattern/template, e
infine la bonifica di coda con il guard-rail che blinda il risultato.
