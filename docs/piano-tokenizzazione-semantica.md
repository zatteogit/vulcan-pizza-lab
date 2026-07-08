# Piano — Refactor a markup semantico + perfezione dei tier

> **Handoff per sessione nuova (Claude Code), modello orchestrator + agenti.**
> Obiettivo: portare TUTTA l'app a **markup solo semantico** e **zero valori
> hard-written**, rispettando il modello a tier T1–T6 (`docs/design-system-tiers.md`).
> Leggi anche la memoria `semantics-ratchet` e `theme-exploration`.

---

## 0. TL;DR operativo

1. Sei l'**orchestrator**. Non converti i file a mano: lanci subagent
   **`semantic-tokenizer`** (uno per file, file non sovrapposti; modello ed
   effort fissati nel frontmatter — §5.0), poi **integri** il CSS che ti
   consegnano in `src/styles/theme.css` `@layer components`, fai **QA
   visiva** e **verify**.
2. Ogni file convertito deve finire a: **0 `style={}`** (tranne custom-property
   `--x`), **0 utility Tailwind** nel markup, **0 valori hard-written** nel CSS.
3. **PRIMA di lanciare un'ondata**: baseline screenshot delle route toccate
   (matrice §8.1). Senza baseline "render identico" non è verificabile — dopo
   la conversione l'originale non esiste più.
4. Gli agenti scrivono il CSS in un **file scratch dedicato** (`<CSS_OUT>`,
   mai solo nel report: i report lunghi si troncano) e l'orchestrator lo
   valida **meccanicamente** con `scripts/check-class-parity.mjs` prima di
   incollarlo (§5, passo 2).
5. Dopo ogni ondata integrata e verde: **riabbassa i 3 cricchetti** (i file
   dell'ondata devono stare a **0**, non solo "non cresciuti"), `npm run
   verify` verde, **commit di checkpoint** sul branch di lavoro (§5, passo 6).
   Sei ondate distruttive senza punti di ripristino non sono accettabili.

---

## 1. Stato attuale (punto di partenza)

**Fatto e tier-clean** (markup semantico + CSS token-only, render identico):
`pages/pre-ferments.tsx`, `pages/glossary.tsx`, `pages/explore.tsx`, +
l'hero di `pages/learn.tsx` (`.page-lead` / `.page-title-accent`).

**Architettura token già rifondata** (usala, non reinventarla):
- Primitivi (T1) ASTRATTI: `--space-*`, `--measure-2xs..2xl`, `--blur-sm..xl`,
  `--density-compact/cozy/spacious`, `--radius-*`, `--font-size-*`, `--tracking-*`,
  `--leading-*`, `--weight-*`, `--border-width-*`.
- Ruoli (T2): `--lead-measure`, `--feature-media-height`, e la **densità**:
  `--density` (attiva) + `--gap-2xs..xl = calc(--space-* * --density)`.
- Densità **per tema** (`[data-theme="minimal"]{--density:var(--density-spacious)}`)
  e **per breakpoint** (`@media(max-width:768px){:root{--density:var(--density-compact)}}`).
- Elevazioni: `--elevation-feature/-feature-hover/-nerd/-nerd-hover`,
  `--glow-chip-nerd`, `--shadow-pill` (+ i preesistenti `--shadow-*`).

**Enforcement attivo** (tutti in `npm run verify`, tutti a cricchetto):
- `check:tokens` — hex/primitivi/font/rgba (preesistente).
- `check:semantics` — vieta NUOVI `style={}` / utility di presentazione / `<div>` nudi nel markup. Baseline `scripts/semantics-baseline.json`.
- `check:css-tokens` — vieta NUOVI valori dimensionali hard-written nel CSS che consuma (`@layer components` + `layout.css`). Baseline `scripts/css-tokens-baseline.json`.
- `check-class-parity.mjs` — **non** in `verify`: si lancia a mano sull'output
  di ogni agente PRIMA di integrarlo (§5, passo 2). Verifica classi TSX⇄CSS e
  esistenza dei `var(--…)`; riconosce i blocchi hook-only (classe senza regole
  ma con `__element`/`--modifier` stilati) e elenca i placeholder `--TODO-…`.

**Ripristinato (da RIFARE sotto standard corretto)**: `pages/home.tsx` —
un agente l'aveva convertito con spec sbagliata (permetteva raw values).

---

## 2. Lo standard — regole NON negoziabili

### 2.1 Markup = solo classi semantiche
Nel JSX possono comparire SOLO: classi semantiche (`type-*`, `page-lead`,
`page-title-accent`, `<feature>-<blocco>__<elemento>`), attributi `data-*`
(`data-region`, `data-page`, `data-slot`), e **componenti DS** (`Heading`,
`CtaButton`, `Chip`, `FilterChip`, `SegmentedControl`, `Surface`, `IconButton`,
`Switch`, `Badge`, icone lucide). **Vietati**: `style={{}}` (eccetto custom
property `style={{ ["--x" as any]: valore }}`), qualsiasi utility Tailwind
(layout E aspetto: `flex`, `gap-3`, `p-4`, `rounded-2xl`, `text-*`, `bg-*`,
`font-serif`, `italic`, `absolute`, `w-full`, arbitrari `[color:...]`/`text-[...]`).

### 2.2 CSS = zero valori hard-written
Ogni dimensione è un token. Se un atomo manca, **NON hardcodare**: si crea in T1
(lo fa l'orchestrator). Eccezione unica: tinte `color-mix(in srgb, var(--x) N%, …)`
restano CSS (`design-system-tiers.md` §2.5). Le OMBRE sono token
`--elevation-*`/`--shadow-*`/`--glow-*`, mai px inline in un `box-shadow`.

### 2.3 Invariante d'oro dei tier
`Schermata → T6 → T5 → T4 → T3/T3.5 → T2 → T1`. Mai saltare in giù, mai un ruolo
in un primitivo (niente `--measure-lead` in T1: astratto in T1, ruolo in T2).

### 2.4 Densità, tema, breakpoint
- Gli spazi che devono respirare usano `--gap-*` (densità-aware), non `--space-*`.
- Nessun `@media` nei componenti per la densità: si cambia `--density` su `:root`.
- Un tema può ridefinire `--density`, le misure, gli accenti.

---

## 3. Fatti architetturali & GOTCHA (leggere prima di toccare CSS)

1. **Le classi semantiche DEVONO stare in `theme.css` `@layer components`.**
   In `layout.css` NON funzionano (la pipeline Tailwind v4 non le applica al
   render anche se compaiono nell'output). In `layout.css` vanno SOLO regole con
   attribute-selector (`[data-region]`, `[data-theme]`, `[data-page]`) e gli
   override responsive di `:root` (densità). → Gli agenti restituiscono il CSS
   come TESTO; **l'orchestrator lo incolla in `theme.css @layer components`**.
   Questo evita anche i conflitti fra agenti paralleli sul file condiviso.
2. **Screenshot ricetta in headless dà BIANCO** sul dev-server (compile
   on-demand + immagine hero remota che blocca `load`). Per QA della scheda
   ricetta usa `npm run build && npm run preview` (porta 4173), non il dev.
3. **`Surface` (ds) inoltra i props** → puoi passargli `data-region`/`className`.
4. **Colori**: mai hex/`var(--color-*)` in app/CSS-consumante; usa i ruoli T2/T3
   (`--primary`, `--text-*`, `--surface-*`, `--outline-variant`, `--container-*`…).

---

## 4. Inventario debito & ondate (file non sovrapposti per ondata)

Debito residuo per file (somma inline-style + presentazione + bare-div), top:

| # | File | debito |
|---|---|---|
| 1 | pages/profile.tsx | 166 |
| 2 | features/recipe/recipe-configurator.tsx | 93 |
| 3 | features/recipe/user-needs.tsx | 75 |
| 4 | features/recipe/feedback-analysis.tsx | 61 |
| 5 | pages/home.tsx | 59 |
| 6 | features/recipe/recipe-setup-panel.tsx | 51 |
| 7 | features/recipe/recipe-feedback.tsx | 46 |
| 8 | features/recipe/troubleshooting-panel.tsx | 46 |
| 9 | pages/learn.tsx | 39 |
| 10 | features/recipe/pre-ferment-guide.tsx | 39 |
| 11 | features/recipe/recipe-match-card.tsx | 38 |
| 12 | features/cooking/cooking-mode.tsx | 38 |
| 13 | components/shared/search-overlay.tsx | 37 |
| 14 | features/recipe/recommended-styles.tsx | 36 |
| 15 | features/recipe/ingredients-section.tsx | 36 |
| 16 | features/recipe/topping-section.tsx | 33 |
| 17 | features/recipe/style-detail-sheet.tsx | 33 |
| 18 | features/recipe/procedure-hero.tsx | 31 |
| 19 | features/recipe/condiment-choice-strip.tsx | 25 |
| 20 | features/recipe/recipe-view.tsx | 23 |
| 21 | components/shared/app-shell.tsx | 21 |
| … | ds/* (Select 19, …) e altri minori | ~ |

Debito totale su **72 file**. (Aggiorna la lista con
`node scripts/check-semantics.mjs --list`.)

**Ondate proposte** (ogni file a UN agente; nessun file in due agenti nella
stessa ondata; i componenti condivisi NON vanno con una pagina che li usa nella
stessa ondata):

- **Ondata 1 — Pagine**: `home.tsx`, `learn.tsx`, `profile.tsx`.
- **Ondata 2 — Recipe core**: `recipe-configurator.tsx`, `user-needs.tsx`, `recipe-setup-panel.tsx`, `recipe-match-card.tsx`.
- **Ondata 3 — Recipe sezioni**: `ingredients-section.tsx`, `topping-section.tsx`, `procedure-hero.tsx`, `procedure-timeline.tsx`, `recipe-stat-strip.tsx`, `recipe-view.tsx`, `interpretation-narrative-card.tsx`, `recipe-learning-panel.tsx`, `recipe-step-details.tsx`, `recipe-output.tsx`, `recipe-output-bits.tsx`.
- **Ondata 4 — Feedback/misc recipe**: `feedback-analysis.tsx`, `recipe-feedback.tsx`, `troubleshooting-panel.tsx`, `pre-ferment-guide.tsx`, `condiment-choice-strip.tsx`, `style-detail-sheet.tsx`, `recommended-styles.tsx`, `recipe-section-tabs.tsx`, `tilt-card.tsx`, `score-ring.tsx`.
- **Ondata 5 — Cooking + shell**: `cooking-mode.tsx`, `active-cook-widget.tsx`, `cook-session.tsx`, `dough-mascot.tsx`, `fire-glow.tsx`, `step-illustrations.tsx`, `search-overlay.tsx`, `search-button.tsx`, `app-shell.tsx`, `sub-page-header.tsx`, `vulcan-hero.tsx`, `vulcan-logo.tsx`, `info-tip.tsx`, `media/ImageWithFallback.tsx`.
- **Ondata 6 — DS (T4) e coda**: `components/ds/*` (delicati: sono i componenti T4; il grosso è già token-pure, verificare solo che restino token-only; conversione a classi opzionale). `context/`, `App.tsx`, residui.

Parallelismo consigliato: **3–4 agenti per ondata** (motivazioni in §5.0:
l'integrazione è seriale su `theme.css` e i report consumano il contesto
dell'orchestrator).

---

## 5. ORCHESTRAZIONE — modello agentico e protocollo

### 5.0 Modello agentico (ruoli, modelli, effort)

| Ruolo | Chi | Modello / effort | Perché |
|---|---|---|---|
| Orchestrator | sessione principale | modello di sessione (top), effort auto | Integra il CSS, crea gli atomi T1/T2, fa la QA visiva (confronto immagini baseline/after) e governa i cricchetti. Non si delega: baseline e giudizio visivo vivono nel SUO contesto. |
| Conversione file | subagent **`semantic-tokenizer`** (`.claude/agents/semantic-tokenizer.md`) | `model: sonnet`, `effort: high` (nel frontmatter) | Task meccanico ad alta fedeltà: sonnet + effort high è la raccomandazione della doc ufficiale per questo profilo; opus in prima battuta è overkill, haiku è per task latency-sensitive non intelligence-sensitive — non questo. |
| Rilancio dopo doppio fallimento | subagent nuovo | override per-invocazione `model: "opus"` | Escalation a fallimento dimostrato, mai preventiva. |

Regole del modello agentico:

- **Cold start**: un subagent NON vede la conversazione dell'orchestrator.
  Tutto ciò che gli serve sta in tre posti: il suo system prompt (file
  agente), il messaggio di delega (§6), e il piano stesso che legge da sé
  (§2, §7). Se un'informazione serve all'agente, va in uno di quei tre posti
  — mai "nella chat".
- **Parallelismo 3–4 per ondata**: non esiste un limite documentato, ma ogni
  report rientra nel contesto dell'orchestrator e l'integrazione su
  `theme.css` è comunque seriale: oltre 4 agenti si accumulano coda e
  contesto, non throughput.
- **Report corti by design**: il CSS sta in `<CSS_OUT>`, nel report solo
  atomi mancanti, esiti, conteggi. È ciò che rende sostenibile il
  parallelismo (i report di molti agenti consumano il contesto orchestrator).
- **NO `isolation: worktree`**: gli agenti editano il tree condiviso che
  l'orchestrator deve leggere subito dopo (TSX + `<CSS_OUT>`); un worktree
  imporrebbe merge manuali a ogni file. Il rollback lo danno branch +
  checkpoint (passo 6), non l'isolamento.
- **Permessi**: `permissionMode: acceptEdits` nel frontmatter copre le edit.
  I bash dell'auto-verifica vanno allowlistati in `.claude/settings.json`
  PRIMA dell'ondata 1 — serve approvazione di Matteo per:
  `"Bash(npx tsc:*)"` e `"Bash(node scripts/check-class-parity.mjs:*)"`.
  Un agente in background bloccato su un prompt di permesso non termina mai.
- **Follow-up**: `SendMessage` con l'id dell'agente riapre LO STESSO agente
  col suo contesto intatto — è il canale per la rilavorazione (§6). Un nuovo
  `Agent` call parte invece sempre da zero.

### 5.1 Protocollo (per ogni ondata)

0. **Setup ondata**: branch di lavoro se non esiste già
   (`git switch -c refactor/tokenizzazione` una volta sola — i checkpoint
   vivono lì, `main` resta intatto). Poi **baseline**: screenshot di TUTTE le
   route che l'ondata tocca (matrice §8.1: default + 1 tema alternativo,
   430px E 1280px) in `.qa/wave-<N>/baseline/`, più gli stati interattivi
   §8.2 per i file che ne hanno. Solo dopo lanci gli agenti.
1. **Lancia** N agenti (Agent tool, `subagent_type: "semantic-tokenizer"`,
   `run_in_background: true`), uno per file, col messaggio di delega §6:
   `FILE`, `PREFIX`, `CSS_OUT` (= `.qa/wave-<N>/css/<nome-file>.css`) +
   eventuali note specifiche. File non sovrapposti.
2. Alla notifica di completamento di un agente, **validazione meccanica PRIMA
   di integrare** (zero scarti; per la rilavorazione vedi §6):
   a. **Perimetro**: `git status --porcelain` — devono risultare toccati SOLO
      i `<FILE>` degli agenti dell'ondata (i `<CSS_OUT>` stanno in `.qa/`,
      ignorata da git). File fuori perimetro ⇒ ripristinali e rilancia.
   b. **Parity**: `node scripts/check-class-parity.mjs <FILE> <CSS_OUT>` —
      ogni classe usata nel TSX definita (nel CSS consegnato o già in
      `theme.css`), ogni classe definita usata, ogni `var(--…)` esistente o
      `--TODO-…` dichiarato. Gli agenti scrivono CSS alla cieca: un typo di
      classe passa `tsc` e senza questo check si scopre solo (forse) alla QA
      visiva.
   c. **ATOMI MANCANTI** (dal report + i `--TODO-…` emersi dal parity check):
      per ognuno crea il primitivo in T1 (nome ASTRATTO) e, se serve un ruolo,
      l'alias in T2 — dopo aver verificato che un atomo equivalente non esista
      già. Poi sostituisci i placeholder nel CSS.
   d. Incolla il blocco CSS in `theme.css` **dentro** `@layer components { … }`,
      prima della `}` di chiusura del layer, con un commento
      `/* ═══ PAGE/COMPONENT: <nome> ═══ */`.
   e. `node scripts/check-css-tokens.mjs --list` → azzera gli hard-written
      residui creando atomi o usando quelli esistenti (mappa §7).
   f. `npm run check:tokens` → risolvi eventuali `dead-token` (token il cui
      ultimo consumo è stato rimosso: se torneranno usati, `STAGED_TOKENS`;
      altrimenti rimuovili).
3. **QA visiva contro la baseline**: rifai gli screenshot con la STESSA
   matrice del passo 0 in `.qa/wave-<N>/after/` (stessi nomi file) e
   confronta ogni coppia leggendo entrambe le immagini: spaziature, pesi
   tipografici, colori, raggi, ombre. Ricetta → usa `preview` (§3.2).
   Qualsiasi differenza non intenzionale si corregge PRIMA di proseguire.
4. **Cricchetti**: `npm run check:semantics:update` e
   `npm run check:css-tokens:update`. Poi guarda il **diff dei due baseline
   JSON**: i file dell'ondata devono stare a **0** (o essere spariti dal
   baseline), non solo "non cresciuti". Se un file convertito ha ancora
   debito, l'agente ha mancato qualcosa: si finisce il lavoro, non si
   ratchetta il residuo.
5. `npm run verify` **verde** (tsc + i 3 check + test) e `npm run build` verde.
6. **Commit di checkpoint** dell'ondata sul branch di lavoro
   (`refactor(tokens): ondata <N> — <file, file, …>`): è il punto di
   ripristino se un'ondata successiva scopre una regressione. Poi riporta a
   Matteo: file fatti, debito sceso (numeri prima→dopo), screenshot
   before/after.

**Regole d'oro dell'orchestrator**: non integrare CSS non verificato; QA ogni
file; non lasciare l'app rotta (un TSX convertito senza il suo CSS integrato è
rotto → integra subito o ripristina il TSX).

---

## 6. INVOCAZIONE AGENTE — `semantic-tokenizer`

Le regole operative dell'agente (markup solo semantico, token-only, output su
`CSS_OUT`, auto-verifica parity+tsc, perimetro stretto) vivono in
**`.claude/agents/semantic-tokenizer.md`** — unica fonte di verità,
versionata. NON duplicarle nel messaggio di delega: si limiterebbe a
disallinearsi.

**Messaggio di delega** (Agent tool, `subagent_type: "semantic-tokenizer"`,
`run_in_background: true`) — solo i parametri e le note specifiche:

```
FILE: src/app/pages/home.tsx
PREFIX: home
CSS_OUT: .qa/wave-1/css/home.css
Note: <gotcha specifici del file: stati particolari, custom property attese,
      componenti interni, ecc. — ometti se non ce ne sono>
```

L'agente parte freddo (§5.0): legge da sé il piano (§2, §7) e il suo file.
Il frontmatter fissa `model: sonnet`, `effort: high` — non serve passare
`model` nella chiamata, tranne che per l'escalation.

**Rilavorazione (maglie strette, due giri massimo):**
1. Parity/QA/perimetro bocciati → `SendMessage` **allo stesso agente** con
   l'elenco puntuale degli errori (output del parity check, differenze viste
   in QA). Mantiene il suo contesto: costa poco e di solito basta.
2. Bocciato anche il secondo giro → **agente NUOVO** con override
   `model: "opus"` nella chiamata (il file è evidentemente più intricato del
   previsto), oppure fix manuale dell'orchestrator se lo scarto è piccolo.
   Mai un terzo giro sullo stesso agente: contesto ormai inquinato dai
   tentativi falliti.

---

## 7. Mappa Tailwind/valore → token (riferimento per agenti e orchestrator)

**Scale disponibili in `theme.css` (T1, astratte):**
- `--space-0-5,1,1-5,2,2-5,3,3-5,4,5,6,8,10,12,14,16,20,28,40` (px = commento accanto).
- `--gap-2xs,xs,sm,md,lg,xl` (densità-aware; per gap/spazi che respirano).
- `--measure-2xs(280px),sm(480),md(640),lg(768),xl(896),2xl(1024)` (max-width). Ruoli T2: `--lead-measure`, `--feature-media-height`.
- `--radius-xs(4),sm(8),md(12),lg(16),xl(20),2xl(24),3xl(28),4xl(32),full`.
- `--font-size-2xs..11xl`; `--weight-regular/medium/semibold/bold/extrabold`.
- `--tracking-tighter..extreme`; `--leading-none..loose`.
- `--blur-sm(8),md(12),lg(22),xl(24)`.
- `--border-width-thin(1px)/thick(3px)`.
- Ombre/elevazioni: `--shadow-xs..xl`, `--elevation-cta/-feature/-feature-hover/-nerd/-nerd-hover`, `--glow-chip-nerd`, `--shadow-pill`.
- Colori: ruoli T2/T3 (`--primary`, `--text-default/-muted/-subtle/-accent`, `--surface*`, `--container-*`, `--outline*`, `--cta`, `--tertiary`, `--severity-*`, `--overlay-*`…).

**Mappa utility → CSS token:**
`flex`→`display:flex` · `flex-col`→`flex-direction:column` · `items-center`→`align-items:center` · `justify-between`→`justify-content:space-between` · `grid`→`display:grid` · `grid-cols-2`→`grid-template-columns:repeat(2,minmax(0,1fr))` · `gap-N`→`gap: var(--gap-…)` (respiro) o `var(--space-N)` · `p-N`→`padding: var(--space-N)` · `px/py-N`→`padding-inline/block` · `m*-N`→`margin*` · `w-full`→`width:100%` · `max-w-Nxl`→`max-width: var(--measure-…)` · `rounded-2xl`→`border-radius: var(--radius-2xl)` · `text-center`→`text-align:center` · `font-serif`→`font-family: var(--font-serif)` · `font-bold`→`font-weight: var(--weight-bold)` · `italic`→`font-style:italic` · `overflow-hidden`→`overflow:hidden` · `truncate`→`overflow:hidden;text-overflow:ellipsis;white-space:nowrap` · `active:scale-95`→`:active{transform:scale(0.95)}` · `group-hover:x`→`.parent:hover .child` · `blur(Npx)`→`blur(var(--blur-…))` · `z-N`→`z-index:N` · breakpoints → `@media (min-width: 640/768/1024px)`.

---

## 8. QA & verifica

### 8.1 Matrice screenshot (baseline PRIMA dell'ondata, after DOPO)
Per ogni route toccata: **tema default + almeno 1 tema alternativo** ×
**430px E 1280px**. Il desktop non è opzionale: le conversioni
breakpoint→`@media` sono la regressione più tipica e a 430px non si vedono
mai. Baseline in `.qa/wave-<N>/baseline/`, after in `.qa/wave-<N>/after/`,
**stessi nomi file** (es. `home-430-vulcan.png`) per confronto 1:1. `.qa/` è
in `.gitignore`.

- Dev server già attivo su **5174** (`npm run dev`). Screenshot headless:
  ```bash
  CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
  "$CHROME" --headless=new --disable-gpu --hide-scrollbars --force-device-scale-factor=2 \
    --blink-settings=preferredColorScheme=1 --window-size=430,1100 \
    --screenshot=.qa/wave-<N>/baseline/<route>-430-<tema>.png \
    "http://localhost:5174/<route>?theme=<vulcan|editoriale|classica|minimal>"
  ```
  (ripeti con `--window-size=1280,1100` per il desktop)
- **Ricetta**: usa `npm run build && npm run preview` (4173) — sul dev dà bianco.
- Route: `/`, `/explore`, `/learn`, `/learn/glossary`, `/learn/troubleshooting`,
  `/learn/pre-ferments`, `/recipe/napoletana_stg?mode=canonical`, `/profile`.

### 8.2 Stati interattivi (obbligatori per i file che li hanno)
Uno screenshot di route mostra solo lo stato iniziale: search-overlay aperto,
dialoghi/sheet, cooking-mode attivo, expand/hover NON si vedono. Per i file di
questo tipo (ondate 4–5 soprattutto) usa il browser (claude-in-chrome) per
portare la UI nello stato giusto e screenshotta PRIMA e DOPO la conversione.
Se uno stato non è raggiungibile in automazione, va dichiarato esplicitamente
nel report a Matteo come non-QA-to — mai saltato in silenzio.

### 8.3 Casi noti e criteri di confronto
- **profile.tsx** mostra l'FTU se il profilo è incompleto — ma il grosso del
  debito (166 voci) vive nel profilo PIENO. QA deterministica: seeda
  `localStorage` (via claude-in-chrome o completando l'FTU una volta) prima
  della baseline, e riusa lo stesso stato per l'after.
- Confronto: render **identico** all'originale a densità default. Non c'è
  diff tool installato (niente ImageMagick): il confronto è leggere le coppie
  di immagini (tool Read, entrambe nello stesso messaggio) con attenzione a
  spaziature, pesi tipografici, colori, raggi, ombre.
- `npm run verify` = `tsc` + `check:tokens` + `check:semantics` + `check:css-tokens` + test.

---

## 9. Definition of Done

**Per file**: 0 `style={}` (eccetto custom property), 0 utility Tailwind,
`check-class-parity` senza errori, il suo CSS in `theme.css @layer components`
token-only, `check:css-tokens` senza nuovi hard-written, **a 0 nel baseline
semantics** (non solo diminuito), render identico alla baseline su tutta la
matrice §8.1 (+ stati §8.2 se ne ha), `tsc` verde.

**Globale**: i 3 cricchetti a un livello basso e stabile (idealmente
inline-style e presentazione → ~0 fuori da ds/ e tooling; css-tokens → solo i
one-off accettati §10). `npm run verify` verde. `npm run build` verde. Ogni
ondata ha il suo commit di checkpoint sul branch `refactor/tokenizzazione`.

---

## 10. Debito accettato / one-off (già a baseline)

- `.badge-base { border-radius: 6px }` (composite DS preesistente; 6px fra
  `--radius-xs` 4 e `--radius-sm` 8 — valutare `--radius-2xs`).
- `.preferment-header__icon { width:76px; height:60px }` (contenitore
  illustrazione one-off).

Se durante il lavoro emergono altri one-off legittimi, documentali qui e
lasciali a baseline (cricchetto), non forzare un atomo finto.

---

## 11. Prossimo passo architetturale (dopo la tokenizzazione)

Le "card" sono state namespacate per-pagina (`explore-card`, `glossary-card`,
…): è duplicazione. Il target T4/T5 è un **componente Card riusabile** (e
simili: media-card, section-header, chip-row) che le pagine compongono. Da
affrontare DOPO che tutto è semantico+token: estrarre i pattern ricorrenti in
componenti DS (T4) / composti (T5), riducendo le classi per-feature a varianti.

---

## 12. Comandi rapidi

```bash
npm run verify                      # tsc + 3 check + test
node scripts/check-semantics.mjs --list      # debito per file (markup)
node scripts/check-css-tokens.mjs --list     # hard-written per riga (CSS)
node scripts/check-class-parity.mjs <file.tsx> <blocco.css>  # valida output agente (pre-integrazione)
npm run check:semantics:update      # riabbassa cricchetto markup
npm run check:css-tokens:update     # riabbassa cricchetto CSS
npm run build && npm run preview    # QA affidabile (4173), incl. ricetta
```
