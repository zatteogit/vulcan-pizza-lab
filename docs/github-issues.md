# Vulcan Pizza Lab — Issue Tracker (GitHub Mirror)

> Generato: 14 febbraio 2026
> Stato: pronto per creazione batch su GitHub (richiede permesso Issues: Read & Write)
> Repo: `zatteogit/vulcan-pizza-lab`

---

## Labels da creare

| Label             | Colore    | Descrizione                               |
| ----------------- | --------- | ----------------------------------------- |
| `bug`             | `#d73a4a` | Comportamento errato o regressione        |
| `enhancement`     | `#a2eeef` | Nuova funzionalita o miglioramento        |
| `accessibility`   | `#0075ca` | Accessibilita (a11y, WCAG)                |
| `refactor`        | `#e4e669` | Refactoring senza cambio di comportamento |
| `cleanup`         | `#f9d0c4` | Rimozione codice morto o artefatti        |
| `performance`     | `#fbca04` | Ottimizzazione prestazioni                |
| `engine`          | `#5319e7` | Motore scientifico pizza-engine.ts        |
| `devops`          | `#0e8a16` | Build, CI/CD, infrastruttura              |
| `documentation`   | `#c5def5` | Documentazione e KB                       |
| `priority:high`   | `#b60205` | Priorita alta                             |
| `priority:medium` | `#e99695` | Priorita media                            |
| `priority:low`    | `#f9d0c4` | Priorita bassa                            |

---

## Issue OPEN — Bugs & Tech Debt

---

### VPL-001 — [a11y] DoughBlob: rispettare prefers-reduced-motion

**Labels:** `bug`, `accessibility`, `priority:medium`
**KB Ref:** Bug #1 (Sezione 8)

#### Descrizione

Il componente `DoughBlob` (mascot blob energy-reactive nel hero) non rispetta la media query `prefers-reduced-motion`. Le animazioni (blob morph, energy-reactive pulse) restano attive anche quando l'utente ha richiesto la riduzione del moto a livello OS.

#### Contesto

- `FireGlow` gia rispetta `prefers-reduced-motion` (static wash)
- `ScrollSection` gia rispetta (opacity: 1 statica)
- `DoughBlob` e l'unico componente non conforme

#### Comportamento atteso

Quando `prefers-reduced-motion: reduce`:

- Disabilitare animazioni morph del blob
- Mostrare versione statica con opacita ridotta
- Mantenere il blob visibile (non scompare)

#### Implementazione suggerita

```tsx
// Opzione 1: hook Motion
import { useReducedMotion } from "motion/react";
const shouldReduceMotion = useReducedMotion();

// Opzione 2: matchMedia nativo
const prefersReducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)",
).matches;
```

Applicare condizionalmente le props `animate` / `transition` di Motion.

#### Criteri di accettazione

- [ ] `DoughBlob` non anima quando `prefers-reduced-motion: reduce`
- [ ] Visual statico accettabile (blob visibile ma fermo)
- [ ] Nessun impatto sulle animazioni in modalita standard
- [ ] Test: macOS → System Preferences → Accessibility → Reduce Motion

---

### VPL-002 — [bug+feature] Persistenza dark mode in localStorage

**Labels:** `bug`, `enhancement`, `priority:low`
**KB Ref:** Bug #2 + Feature Backlog #4 (consolidati — stessa issue)

#### Descrizione

Il toggle dark mode funziona a runtime (Ctrl+Shift+D / bottone), ma la preferenza non viene salvata. Al refresh della pagina, l'app torna sempre in light mode.

#### Contesto

- Il dark mode e gestito in `root-layout.tsx` via `useOutletContext`
- Il toggle `darkMode` e un `useState(false)` senza persistenza
- Lo shortcut `Ctrl+Shift+D` funziona ma si perde al reload
- `localStorage` e gia usato per `vulcan_pantry` e `vulcan_oven_pref` — pattern consolidato

#### Implementazione suggerita

```tsx
// In root-layout.tsx
const [darkMode, setDarkMode] = useState(() => {
  const saved = localStorage.getItem("vulcan_dark_mode");
  if (saved !== null) return JSON.parse(saved);
  return window.matchMedia("(prefers-color-scheme: dark)")
    .matches;
});

useEffect(() => {
  localStorage.setItem(
    "vulcan_dark_mode",
    JSON.stringify(darkMode),
  );
}, [darkMode]);
```

Bonus: rispettare `prefers-color-scheme` come default iniziale quando non c'e valore salvato.

#### Criteri di accettazione

- [ ] Dark mode persiste tra refresh
- [ ] Prima visita: rispetta `prefers-color-scheme` del sistema
- [ ] Chiave localStorage: `vulcan_dark_mode` (coerente con naming esistente `vulcan_*`)
- [ ] Toggle funziona ancora con Ctrl+Shift+D e bottone UI

---

### VPL-003 — [bug+feature] Geolocation reale + API meteo per temperatura cucina

**Labels:** `bug`, `enhancement`, `priority:medium`
**KB Ref:** Bug #3 + Feature Backlog #5 (consolidati)

#### Descrizione

`useLocationWeather()` e hardcoded su Roma (41.9N, 12.5E). La temperatura cucina influenza direttamente il calcolo Q10 e il dosaggio lievito, quindi un valore fisso produce raccomandazioni imprecise per utenti fuori Roma.

#### Contesto

- La temp cucina viene usata da `getQ10()` che ora ha modello variabile (standard/cold_adapted/sourdough)
- Un errore di +-5C sulla temp ambiente puo spostare il dosaggio lievito del 20-30%
- L'app gira in iframe — la Geolocation API potrebbe non essere disponibile (sandbox restrictions)
- Serve un graceful fallback robusto

#### Implementazione suggerita

```
1. Tentare navigator.geolocation.getCurrentPosition()
2. Se disponibile → chiamare Open-Meteo API (gratuita, no API key)
   GET https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&current_weather=true
3. Se geolocation non disponibile (iframe sandbox) → mostrare input manuale temperatura
4. Se API fallisce → fallback Roma con indicazione visiva "Temperatura stimata (Roma)"
5. Cacheare risultato in sessionStorage per 30 minuti
```

#### Criteri di accettazione

- [ ] Geolocation tentata al primo caricamento
- [ ] Fallback elegante se non disponibile (input manuale, non errore silenzioso)
- [ ] Indicazione visiva chiara quando la temp e stimata vs reale
- [ ] Nessun API key richiesta (Open-Meteo e gratuita)
- [ ] Cache ragionevole per non spammare API
- [ ] Funziona in iframe (graceful degradation)

---

### VPL-004 — [cleanup] Rimuovere 1024WDefault.tsx (artefatto Figma non referenziato)

**Labels:** `cleanup`, `priority:low`
**KB Ref:** Bug #5 (Sezione 8) + Tabella Sezione 2

#### Descrizione

Il file `/src/imports/1024WDefault.tsx` e un artefatto di import Figma che non e referenziato da nessun componente. Occupa spazio e crea confusione nel codebase.

#### Verifica pre-rimozione

```bash
grep -r "1024WDefault" src/  # deve dare 0 risultati
```

#### Criteri di accettazione

- [ ] File rimosso
- [ ] Nessun import rotto (grep conferma 0 referenze)
- [ ] Build pulita dopo rimozione

---

### VPL-005 — [refactor] scroll-companion.tsx: allineare sezioni + ProgressPill desktop

**Labels:** `refactor`, `enhancement`, `priority:medium`
**KB Ref:** Bug #6 + Feature Backlog #2 (consolidati)

#### Descrizione

`scroll-companion.tsx` contiene `ProgressPill` (desktop) e `MobileProgressBar` che mappano **7 sotto-sezioni** (weather, when, skill, dietary, equipment, oven, pantry), ma `App.tsx` usa solo **3 `data-section`** (context, setup, styles). Questo disallineamento impedisce l'integrazione.

#### Opzioni di refactoring

**Opzione A — Allineare a 3 sezioni:**

- Riscrivere ProgressPill per mostrare 3 dot/step: Contesto, Setup, Stili
- Piu semplice, coerente con l'architettura attuale
- Meno granulare ma piu pulito

**Opzione B — Splittare data-section in 7 sotto-sezioni:**

- Aggiungere `data-subsection` ai contenuti dentro ogni `data-section`
- ProgressPill traccia le sotto-sezioni con IO
- Piu informativo ma richiede ristrutturazione dei children in `home.tsx`

**Raccomandazione:** Opzione A per MVP, Opzione B come evoluzione futura.

#### Criteri di accettazione

- [ ] `scroll-companion.tsx` integrato in `home.tsx` (non piu file orfano)
- [ ] ProgressPill visibile su desktop (posizione laterale o top)
- [ ] MobileProgressBar visibile su mobile
- [ ] Navigazione coerente con le sezioni effettive dell'app
- [ ] Smooth scroll al click sugli indicatori

---

### VPL-006 — [refactor] Deduplicare ScoreRing

**Labels:** `refactor`, `priority:low`
**KB Ref:** Bug #7 + Feature Backlog #8 (consolidati)

#### Descrizione

`recommended-styles.tsx` contiene una versione inline identica del componente `ScoreRing` che esiste gia in `score-ring.tsx`. Violazione DRY.

#### Implementazione

1. Verificare che `score-ring.tsx` abbia tutte le props necessarie a `recommended-styles.tsx`
2. Sostituire la versione inline con `import { ScoreRing } from './score-ring'`
3. Rimuovere il codice duplicato
4. Verificare visual regression (stessa resa)

#### Criteri di accettazione

- [ ] Una sola definizione di `ScoreRing` nel codebase
- [ ] `recommended-styles.tsx` importa da `score-ring.tsx`
- [ ] Nessuna differenza visiva
- [ ] `score-ring.tsx` esporta tutte le props necessarie

---

### VPL-007 — [perf] Lazy loading immagini stili con IntersectionObserver

**Labels:** `performance`, `priority:low`
**KB Ref:** Bug #8 + Feature Backlog #7 (consolidati)

#### Descrizione

Le immagini Unsplash in `STYLE_PHOTOS` (9 stili) vengono caricate tutte al mount, senza lazy loading ne dimensioni predefinite. Questo causa:

- Layout shift (CLS) durante il caricamento
- Bandwidth sprecata se l'utente non scrolla fino alla sezione stili
- Performance degradata su connessioni lente

#### Implementazione suggerita

```tsx
// Nativo HTML (piu semplice)
<img
  loading="lazy"
  width={400}
  height={300}
  src={url}
  alt={style.name}
/>;

// Oppure IntersectionObserver per controllo fine
const [isVisible, setIsVisible] = useState(false);
const ref = useRef<HTMLDivElement>(null);

useEffect(() => {
  const observer = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) setIsVisible(true);
    },
    { rootMargin: "200px" },
  );
  if (ref.current) observer.observe(ref.current);
  return () => observer.disconnect();
}, []);
```

#### Criteri di accettazione

- [ ] Immagini stili caricate solo quando visibili (o quasi visibili, rootMargin 200px)
- [ ] Width/height espliciti per evitare CLS
- [ ] Placeholder/skeleton visibile durante il caricamento
- [ ] Funziona in iframe

---

### VPL-008 — [a11y] Focus management nelle transizioni build -> result

**Labels:** `accessibility`, `priority:low`
**KB Ref:** Bug #9

#### Descrizione

Quando l'utente seleziona uno stile e passa dallo step "build" a "result", il focus non viene spostato. Un utente screen reader non riceve feedback che la vista e cambiata.

#### Implementazione suggerita

```tsx
// In home.tsx, quando currentStep cambia a "result"
const resultRef = useRef<HTMLDivElement>(null);

useEffect(() => {
  if (currentStep === 'result') {
    resultRef.current?.focus();
  }
}, [currentStep]);

// Sul container result
<div ref={resultRef} tabIndex={-1} aria-label="Risultati ricetta">
```

#### Criteri di accettazione

- [ ] Al passaggio build → result, il focus si sposta al container dei risultati
- [ ] `aria-live="polite"` o focus esplicito per notificare il cambio di vista
- [ ] Al "torna indietro" (result → build), focus ripristinato sulla sezione stili
- [ ] Nessun focus ring visibile per utenti mouse (`:focus-visible` only)

---

### VPL-009 — [a11y] Skip-to-content link per screen reader

**Labels:** `accessibility`, `priority:low`
**KB Ref:** Bug #10

#### Descrizione

Manca un link "Salta al contenuto" nascosto visivamente ma accessibile da tastiera/screen reader. E un requisito WCAG 2.1 (2.4.1 Bypass Blocks).

#### Implementazione suggerita

```tsx
// In root-layout.tsx, primo elemento dentro il wrapper
<a
  href="#main-content"
  className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[10000]"
  style={{
    background: 'var(--primary)',
    color: 'white',
    padding: '0.75rem 1.5rem',
    borderRadius: '0.5rem',
  }}
>
  Salta al contenuto principale
</a>

// Sul main content
<main id="main-content" tabIndex={-1}>
```

#### Criteri di accettazione

- [ ] Link "Salta al contenuto principale" presente
- [ ] Invisibile di default, visibile al focus da tastiera
- [ ] Porta il focus al contenuto principale saltando header/nav
- [ ] Stilizzato coerentemente con il design system

---

## Issue OPEN — Feature

---

### VPL-010 — [feature] Integrazione illustrazioni SVG come sfondi sezione a bassa opacita

**Labels:** `enhancement`, `priority:high`
**KB Ref:** Feature Backlog #1

#### Descrizione

`illustrations.tsx` contiene 3 componenti SVG (`IllustrationHero`, `IllustrationOven`, `IllustrationPizza`) da ~1200x500px ciascuno, mai referenziati nell'app. L'idea e usarli come sfondi decorativi nelle 3 sezioni scroll-snap.

#### Mapping proposto

| Sezione                  | Illustrazione       | Posizione                  |
| ------------------------ | ------------------- | -------------------------- |
| `data-section="context"` | `IllustrationHero`  | Bottom-right, opacity 0.06 |
| `data-section="setup"`   | `IllustrationOven`  | Bottom-left, opacity 0.06  |
| `data-section="styles"`  | `IllustrationPizza` | Center, opacity 0.04       |

#### Attenzione

- SVG grandi (1200x500) — valutare impatto rendering su mobile
- Usare `pointer-events: none` per non interferire con i click
- `position: absolute` nel container della sezione
- Rispettare `prefers-reduced-motion` (no animazione di parallax se ridotto)
- Dark mode: potrebbe servire invertire/desaturare le illustrazioni

#### Criteri di accettazione

- [ ] 3 illustrazioni visibili come sfondi decorativi nelle rispettive sezioni
- [ ] Opacita bassa (0.04-0.08), non interferiscono con la leggibilita
- [ ] Non cliccabili (`pointer-events: none`)
- [ ] Responsive (ridimensionamento o hide sotto breakpoint mobile se troppo pesanti)
- [ ] Dark mode: resa accettabile (non invertono i colori in modo brutto)

---

### VPL-011 — [feature] ScrollSection wrapper per soft-focus dimming

**Labels:** `enhancement`, `priority:medium`
**KB Ref:** Feature Backlog #3

#### Descrizione

`scroll-section.tsx` contiene un wrapper che applica opacity dimming alle sezioni non in focus (IntersectionObserver based). L'IO tracking e gia in `home.tsx`, ma il wrapper visivo non e integrato.

#### Comportamento atteso

- La sezione attualmente in viewport ha `opacity: 1`
- Le sezioni adiacenti hanno `opacity: 0.3-0.5` con transizione fluida
- Effetto editoriale "spotlight" che guida l'occhio

#### Criteri di accettazione

- [ ] `ScrollSection` wrappa i contenuti di ogni `data-section`
- [ ] Transizione opacity fluida (300-500ms ease)
- [ ] Rispetta `prefers-reduced-motion` (opacity sempre 1 se ridotto)
- [ ] Non interferisce con le animazioni `whileInView` esistenti
- [ ] Mobile: valutare se l'effetto e utile o se confonde (threshold diverso?)

---

### VPL-012 — [feature] Slider P/L nel RecipeConfigurator per utenti avanzati

**Labels:** `enhancement`, `engine`, `priority:medium`
**KB Ref:** Feature Backlog #9 (NEW)

#### Descrizione

Il motore scientifico ora supporta il P/L alveografico (`flour_pl_range` in `STYLES_DB`, `estimatePL()` in `pizza-engine.ts`), ma l'utente non ha modo di sovrascrivere il valore stimato. Un panificatore esperto che conosce il P/L della propria farina dovrebbe poterlo inserire.

#### Contesto tecnico

- `estimatePL()` stima P/L da W: `0.3 + (W - 150) * 0.0015`, clampato nel range dello stile
- Il range P/L varia per stile (es. STG 0.55-0.70, Tonda Romana 0.40-0.60)
- Il P/L influenza l'`authenticity_breakdown.ingredients` nel composite score

#### UI suggerita

- Slider nel `RecipeConfigurator` (accordion fine-tuning), sotto lo slider W farina
- Visibile solo in `nerdMode` (toggle PizzaNerd), per non sovraccaricare i principianti
- Range dinamico basato sullo stile selezionato
- Label: "P/L Alveografico" con `InfoTip` che spiega cosa e
- Valore stimato mostrato come default con badge "(stimato)" che scompare quando l'utente modifica

#### Criteri di accettazione

- [ ] Slider P/L presente nel RecipeConfigurator
- [ ] Visibile solo in nerdMode
- [ ] Range min/max da `flour_pl_range` dello stile selezionato
- [ ] Default: valore stimato da `estimatePL()`
- [ ] Badge "(stimato)" / "(personalizzato)" per chiarezza
- [ ] Valore usato nel calcolo del composite score
- [ ] InfoTip con spiegazione accessibile

---

### VPL-013 — [feature] Mostrare compensazioni applicate nella UI (banner/tooltip)

**Labels:** `enhancement`, `engine`, `priority:low`
**KB Ref:** Feature Backlog #10 (NEW)

#### Descrizione

`calculateOvenCompensations()` applica fino a 5 compensazioni (idratazione, grasso, zucchero, spessore, tempo) quando il forno e sotto-temperatura, e le traccia in `science.compensations[]`. Ma queste informazioni non sono visibili all'utente.

#### Contesto

Le compensazioni sono gia calcolate e disponibili in `GeneratedRecipe.science.compensations[]`. Ogni compensazione ha:

```typescript
{ type: string, description: string, original: number, adjusted: number, delta: number }
```

#### UI suggerita

**Opzione A — Banner informativo:**

- Nel result step, sopra la recipe output, un banner ambra con icona AlertTriangle
- Testo: "Abbiamo adattato la ricetta per il tuo forno: +3% idratazione, +15s cottura..."
- Espandibile per vedere il dettaglio di ogni compensazione

**Opzione B — Tooltip inline:**

- Accanto ai valori modificati (es. idratazione, tempo cottura) un piccolo badge/icona
- Hover/click mostra: "Valore originale: 65% → Adattato: 68% (+3% per compensare il forno)"

**Raccomandazione:** Opzione A per MVP (banner), Opzione B come evoluzione.

#### Criteri di accettazione

- [ ] Compensazioni visibili all'utente quando presenti (non nascoste)
- [ ] Linguaggio chiaro e non tecnico (l'utente deve capire PERCHE i valori sono cambiati)
- [ ] Visibili anche senza nerdMode (sono informazioni pratiche, non scientifiche)
- [ ] Non mostrate se non ci sono compensazioni (banner non appare)
- [ ] Coerente col design system (colore ambra/tertiary per "avvisi informativi")

---

## Issue OPEN — DevOps & Docs

---

### VPL-014 — [devops] Verificare pnpm build (compilazione TypeScript)

**Labels:** `devops`, `priority:high`

#### Descrizione

Il setup standalone (commit `d8bbcce`) ha aggiunto `index.html`, `src/main.tsx`, `tsconfig.json` e `vite.config.ts`, ma `pnpm build` non e mai stato eseguito per verificare che la compilazione TypeScript vada a buon fine. Possibili errori di tipo, import mancanti, o configurazioni Vite incompatibili.

#### Criteri di accettazione

- [ ] `pnpm build` completa senza errori
- [ ] Output in `dist/` contiene tutti gli asset
- [ ] `pnpm preview` serve l'app correttamente
- [ ] Eventuali errori TypeScript risolti

---

### VPL-015 — [devops] Sub-route per Dev Tools tab

**Labels:** `enhancement`, `devops`, `priority:low`

#### Descrizione

La pagina Dev Tools (`/dev`) ha 6 tab (Overview, Styles DB, Compensazioni, Q10, Score Sim, Audit Log) gestiti con stato locale. Sarebbe utile avere sub-route (`/dev/styles`, `/dev/q10`, ecc.) per deep-linking e condivisione di tab specifici.

#### Implementazione suggerita

```tsx
// In routes.ts
{
  path: "dev",
  Component: DevLayout,
  children: [
    { index: true, Component: DevOverview },
    { path: "styles", Component: DevStylesDB },
    { path: "compensations", Component: DevCompensations },
    { path: "q10", Component: DevQ10 },
    { path: "scores", Component: DevScoreSim },
    { path: "audit", Component: DevAuditLog },
  ],
}
```

#### Criteri di accettazione

- [ ] Ogni tab ha una sub-route dedicata
- [ ] URL aggiornato al cambio tab
- [ ] Deep-link funzionante (aprire `/dev/q10` mostra direttamente il tab Q10)
- [ ] Navigazione browser (back/forward) funziona tra tab
- [ ] Tab default (`/dev`) mostra Overview

---

### VPL-016 — [docs] Aggiornare Guidelines.md con architettura routing

**Labels:** `documentation`, `priority:medium`

#### Descrizione

`Guidelines.md` descrive ancora l'architettura pre-routing (tutto in App.tsx, ~980 righe). L'architettura attuale usa React Router con:

- `App.tsx` → solo `RouterProvider`
- `root-layout.tsx` → layout condiviso + dark mode context
- `pages/home.tsx` → configuratore pizza (route `/`)
- `pages/dev.tsx` → Dev Tools (route `/dev`)
- `pages/not-found.tsx` → 404
- `routes.ts` → `createBrowserRouter`

La Sezione 2 (Architettura componenti) e la Sezione 5 (Flusso utente) vanno aggiornate.

#### Criteri di accettazione

- [ ] Sezione 2: dependency graph aggiornato con routing
- [ ] Sezione 5: stato principale spostato da App.tsx a root-layout.tsx + home.tsx
- [ ] Menzione di routes.ts e pagine
- [ ] Tabella stato aggiornata (dove vive ogni pezzo di stato ora)

---

### VPL-017 — [docs] Applicare 5 correzioni manuali su Notion

**Labels:** `documentation`, `priority:medium`

#### Descrizione

L'audit di verifica implementativa ha identificato 5 correzioni da applicare manualmente sulle pagine Notion della KB (accesso MCP in sola lettura). Il contenuto formattato e in `docs/audit-verifica-implementativa-v1.md` su GitHub.

#### Correzioni pendenti

| #   | Pagina Notion          | Contenuto              | Dettaglio                                                  |
| --- | ---------------------- | ---------------------- | ---------------------------------------------------------- |
| 1   | Pag 08 (Score System)  | Sustainability Score   | Aggiungere S-Score come 5 asse del composite (peso 0.15)   |
| 2   | Pag 08 (Score System)  | Composite a 5 assi     | Aggiornare formula: A=0.30, F=0.25, D=0.20, S=0.15, E=0.10 |
| 3   | Pag 04 (Fermentazione) | Compensazione tempo    | Aggiungere modello Arrhenius-like + compensazione spessore |
| 4   | Pag 04 (Fermentazione) | Compensazione zucchero | Correggere da +1% a +0.5%                                  |
| 5   | Pag 03 (Farine)        | Q10 variabile          | Aggiungere tabella Q10 per tipo lievito e temperatura      |

#### Criteri di accettazione

- [ ] Tutte e 5 le correzioni applicate su Notion
- [ ] Contenuto allineato con `pizza-engine.ts` attuale
- [ ] Data "ultimo audit" aggiornata sulle pagine modificate

---

### VPL-018 — [feature] Aggiungere nuovi stili di pizza regionali, internazionali e progenitori antici

**Labels:** `enhancement`, `engine`, `priority:medium`
**KB Ref:** Feature Backlog #11 (Dati/Stili)

#### Descrizione

Implementare nel database statico degli stili (`STYLES_DB` in `pizza-engine.ts`) una selezione di stili regionali, internazionali e storici pronti per essere elaborati dagli algoritmi di idratazione, fermentazione e scoring di Vulcan.

#### Stili da mappare

1. **Chicago Tavern Style (`chicago_tavern`)**: Idratazione bassa (50-55%), grassi nell'impasto, stesa molto sottile (crosta cracker), taglio a quadratini, temperature moderate.
2. **Trancio Milanese (`trancio_milanese`)**: Idratazione medio-bassa (60%), stesa alta in padella tonda di ferro con strato generoso d'olio sul fondo (effetto frittura in cottura), mozzarella abbondante.
3. **Focaccia Barese (`focaccia_barese`)**: Alta idratazione (75-80%), farina + semola rimacinata + patate bollite schiacciate, cotta in teglia rotonda con pomodorini premuti crudi.
4. **Rianata Trapanese (`rianata_trapanese`)**: Idratazione 65%, semola, condimento massiccio a base di sarde e origano, cotta direttamente su piastra.
5. **Sardenaira / Pizza all'Andrea (`sardenaira`)**: Focaccia soffice ligure ad idratazione media (65%), ricca di olio EVO, salsa, sarde, taggiasche e capperi (senza formaggio).
6. **Pizza Rossini (`pizza_rossini`)**: Base tonda sottile stesa a mano (simile a tonda romana) condita in uscita con uova sode a fette e maionese.
7. **Mastunicola (`mastunicola`)**: Stile napoletano arcaico (pre-pomodoro). Impasto diretto, grasso primario lardo/strutto (`fat_type: "lard"` a 4-5%), condito con cigoli di maiale, pecorino e pepe nero.
8. **S'Anguli 'e cibudda (`anguli_cibudda`)**: Antica pizza sarda cotta su foglie di cavolo verza. Richiede un modello termodinamico di trasferimento calore modificato ($k_{\text{verza}} \approx 0.15\ W/mK$ al posto del $k_{\text{pietra}} \approx 1.2\ W/mK$), con conseguente incremento dei tempi di cottura del +40% (scudo termico naturale).
9. **Pizzolo Siracusano (`pizzolo_siracusano`)**: Focaccia tonda chiusa, la cui superficie superiore viene cosparsa di Pecorino e origano in cottura, formando una crosta di formaggio fuso croccante.
10. **Scaccia Ragusana (`scaccia_ragusana`)**: Sfoglia stesa sottilissima di semola rimacinata a libro, ripiegata più volte inframezzando ogni piega con condimenti densi.
11. **Ciaccino Senese (`ciaccino_senese`)**: Focaccia a doppio strato ripiena senese, oliata e farcita di cotto e galbanino filante.
12. **Pizza Tatin (`pizza_tatin`)**: Stile gourmet cotto interamente capovolto in padella di ferro. I condimenti caramellano sul fondo a contatto diretto col metallo caldo, mentre l'impasto steso sopra funge da coperchio trattenendo l'umidità; capovolta post-cottura.

#### Criteri di accettazione

- [ ] Definizione di ognuno degli 12 stili in `STYLES_DB` con i rispettivi range di W, H%, P/L, tempi e temperature.
- [ ] Implementazione del modello fisico "cabbage shield" per `anguli_cibudda` nel motore di compensazione del forno.
- [ ] Aggiunta di `"lard"` (strutto) all'enum `fat_type` in `pizza-engine.ts` per lo stile `mastunicola`.
- [ ] Integrazione dei condimenti tipici, utensili richiesti e tecniche di piega nei 10 database di `parametric-databases.ts`.
- [ ] Calcolo corretto dei composite score (in particolare A-Score e F-Score) per tutti i nuovi stili.
- [ ] Foto di presentazione Unsplash dedicate in `STYLE_PHOTOS`.

---

### VPL-019 — [feature] Implementare varianti d'autore e tecniche avanzate (Style Versions)

**Labels:** `enhancement`, `engine`, `priority:high`
**KB Ref:** Feature Backlog #12 (Dati/Varianti)

#### Descrizione

Implementare varianti e tecniche d'autore avanzate all'interno del sistema `STYLE_VERSIONS` (in `style-versions.ts`), estendendo la flessibilità del calcolo e offrendo timeline specifiche.

#### Varianti da mappare

1. **Pizza Baciata / Ripiena (`pizza_baciata`)**:
   - Variante tecnica della *Teglia Romana* o *Metodo Bonci*.
   - Richiede di spennellare d'olio due strati di impasto stesi e cuocerli sovrapposti, per poi separarli e farcirli a freddo.
   - **Logica Geometrica**: Il configuratore deve dimezzare il peso del panetto e indicare lo staglio di **due** panetti gemelli per ogni teglia impostata (es. 2 x 350g anziché 1 x 700g).
   - **Timeline**: Step procedurali dedicati per stesura sovrapposta, "bacio" d'olio, separazione post-cottura e farcitura.
2. **Margherita Sbagliata (`margherita_sbagliata`)**:
   - Variante d'autore (*Franco Pepe*) per *Napoletana Contemporanea*.
   - Cottura in bianco con sola mozzarella, con riduzioni di pomodoro e basilico messe a crudo a freddo in uscita.
   - **Timeline**: Inserire passaggi specifici per la gestione delle riduzioni in uscita per preservare le proprietà organolettiche.
3. **DoppioCrunch® (`doppio_crunch`)**:
   - Versione speciale della *Teglia Romana* (*Renato Bosco*) ad idratazione estrema (85-90%), con raddoppio delle fasi di piega e dimezzamento dei tempi di cottura per step.
4. **La Marinella (`marinella_bonci`)**:
   - Variante della *Pizza Baciata* (*Gabriele Bonci*), in cui lo strato superiore viene spalmato di salsa di pomodoro prima della cottura baciata, per poi essere aperto a caldo e imbottito di mortadella.
5. **La Scarpetta (`scarpetta_pepe`)**:
   - Variante d'autore (*Franco Pepe*), base pizza in bianco con mozzarella, arricchita all'uscita dal forno con crema di pomodoro crudo, basilico disidratato e scaglie di Grana Padano.
6. **Tonda a Fermentazione Naturale (Idrolisi) (`tonda_idrolisi`)**:
   - Variante di lievitazione (*Renato Bosco*) che non usa lievito aggiunto ma la fermentazione spontanea data dall'idrolisi del grano spezzato, imponendo un tempo di maturazione obbligatorio di 48-72h a temperatura ambiente controllata (22-26°C).
7. **Pizza Patate e Porchetta (`patate_porchetta`)**:
   - Variante classica della *Teglia Romana*, con stesa e cottura in-bake di patate a fette sottilissime condite con rosmarino e olio, e l'aggiunta di fette di porchetta rigorosamente post-bake (fuori forno) per preservarne la morbidezza e sciogliere il grasso con il calore residuo.
8. **Cacio e Pepe col Ghiaccio (`cacio_pepe_ghiaccio`)**:
   - Tecnica contemporanea (*Stefano Callegari*), con cottura in-bake di cubetti di ghiaccio sull'impasto bianco per mantenerlo umido e creare una tasca d'aria vuota, sormontata post-bake da crema fredda di Pecorino Romano DOP e pepe nero tostato.

#### Criteri di accettazione

- [ ] Varianti registrate stabilmente in `STYLE_VERSIONS` sotto gli ID stile padri.
- [ ] Logica geometrica per "Pizza Baciata" implementata nel calcolatore dei panetti (gestione 2 x panetto per teglia).
- [ ] Fasi manuali della timeline (`timelineLabels` e `parametricTips` in `cms-context.tsx`) allineate con le procedure di baciatura e farcitura a freddo.
- [ ] Implementazione del tipo di fermentazione per idrolisi spontanea (`"hydrolysis"`) in `pizza-engine.ts` con i relativi controlli di temperatura e ore di lievitazione.
- [ ] Corretto calcolo dei pesi e dello score di autenticità in base alle specifiche varianti.

---

## Issue CLOSED — Storico risolto

Queste issue vanno create come **closed** (`state: "closed"`, `state_reason: "completed"`) per avere lo storico completo.

---

### VPL-C01 — [bug] Chicago Deep Dish: oil_pct 0.0 invece di 18% butter

**Labels:** `bug`, `engine`
**KB Ref:** Bug #4 + Feature #6
**Stato:** RISOLTO

#### Descrizione

Chicago Deep Dish aveva `oil_pct: 0.0` e `fat_type` mancante. Il grasso (burro, 18% baker's %) e un ingrediente fondamentale dello stile.

#### Risoluzione

- `oil_pct` impostato a `18.0`
- `fat_type` impostato a `"butter"`
- Aggiunto `fat_g` e `fat_label` nel recipe output
- Supporto completo per `fat_type: "oil" | "butter" | "lard" | "none"`

---

### VPL-C02 — [bug] Q10 fisso a 2.0 sovrastima attivita a bassa temperatura

**Labels:** `bug`, `engine`
**KB Ref:** Bug #11
**Stato:** RISOLTO

#### Descrizione

Il fattore Q10 era fisso a 2.0, il che sovrastimava l'attivita del lievito a basse temperature e la sottostimava per il lievito madre.

#### Risoluzione

Implementato `getQ10()` con modello variabile:

| Condizione            | Q10 | Modello        |
| --------------------- | --- | -------------- |
| Commerciale, T >= 10C | 2.0 | `standard`     |
| Commerciale, T < 10C  | 1.6 | `cold_adapted` |
| Madre, T > 15C        | 2.2 | `sourdough`    |
| Madre, T <= 15C       | 1.9 | `sourdough`    |

Riferimento: PMC7146123 (Saccharomyces cerevisiae), LAB Q10 1.9-2.4.

---

### VPL-C03 — [bug] P/L ratio assente dal database stili

**Labels:** `bug`, `engine`
**KB Ref:** Bug #12
**Stato:** RISOLTO

#### Descrizione

Il rapporto P/L alveografico (tenacita/estensibilita della farina) non era presente in `STYLES_DB` ne nel calcolo degli score.

#### Risoluzione

- Aggiunto `flour_pl_range: [number, number]` a tutti i 9 stili in `STYLES_DB`
- Implementato `estimatePL(W)`: `0.3 + (W - 150) * 0.0015`
- P/L usato nell'`authenticity_breakdown.ingredients`
- Esposto in `science.flour_pl_estimated`

---

### VPL-C04 — [bug] Compensazione cottura solo lineare

**Labels:** `bug`, `engine`
**KB Ref:** Bug #13
**Stato:** RISOLTO

#### Descrizione

La compensazione del tempo di cottura era lineare, il che sottostimava i tempi per grandi deficit di temperatura. Le altre compensazioni (grasso, zucchero, spessore) mancavano.

#### Risoluzione

Implementato `calculateOvenCompensations()` con 5 assi:

| Compensazione | Modello                                          |
| ------------- | ------------------------------------------------ |
| Idratazione   | Logaritmico: `5 * ln(1 + deficit/50)`            |
| Grasso        | Lineare +2%                                      |
| Zucchero      | Lineare +0.5% (corretto da +1%)                  |
| Tempo         | Arrhenius-like: `t_ideal * e^(0.0065 * deficit)` |
| Spessore      | Step: -10% (>100C) / -20% (>200C)                |

Tutte tracciate in `science.compensations[]`.

---

### VPL-C05 — [bug] STG W range 220-280 non allineato AVPN 2024

**Labels:** `bug`, `engine`
**KB Ref:** Bug #14
**Stato:** RISOLTO

#### Descrizione

Il range W della Napoletana STG era [220, 280], non aggiornato al disciplinare AVPN 2024.

#### Risoluzione

Aggiornato a [250, 320] in `STYLES_DB`.

---

### VPL-C06 — [bug] Feasibility non considera interazione W/metodo

**Labels:** `bug`, `engine`
**KB Ref:** Bug #15
**Stato:** RISOLTO

#### Descrizione

Il Feasibility Score considerava forno, farina e skill come assi indipendenti, senza valutare le interazioni (es. W alto + idratazione alta = piu difficile ma migliore rete glutinica).

#### Risoluzione

- Aggiunta interazione **W x idratazione**: W alto + H alta = bonus; W basso + H alta = malus
- Aggiunto **method bonus**: no_knead facilita principianti; biga/poolish penalizza skill 1

---

## Mappa KB → GitHub Issue

Tabella di corrispondenza per mantenere sincronizzati Guidelines.md e GitHub Issues:

| KB Ref           | GitHub ID | Titolo breve                     | Stato  |
| ---------------- | --------- | -------------------------------- | ------ |
| Bug #1           | VPL-001   | DoughBlob prefers-reduced-motion | CLOSED |
| Bug #2 + Feat #4 | VPL-002   | Dark mode persistence            | CLOSED |
| Bug #3 + Feat #5 | VPL-003   | Geolocation + meteo              | CLOSED |
| Bug #4 + Feat #6 | VPL-C01   | Chicago Deep Dish fat            | CLOSED |
| Bug #5           | VPL-004   | Rimuovere 1024WDefault.tsx       | CLOSED |
| Bug #6 + Feat #2 | VPL-005   | scroll-companion allineamento    | CLOSED |
| Bug #7 + Feat #8 | VPL-006   | ScoreRing DRY                    | CLOSED |
| Bug #8 + Feat #7 | VPL-007   | Lazy loading immagini            | CLOSED |
| Bug #9           | VPL-008   | Focus management                 | CLOSED |
| Bug #10          | VPL-009   | Skip-to-content                  | CLOSED |
| Bug #11          | VPL-C02   | Q10 variabile                    | CLOSED |
| Bug #12          | VPL-C03   | P/L ratio                        | CLOSED |
| Bug #13          | VPL-C04   | Compensazioni 5 assi             | CLOSED |
| Bug #14          | VPL-C05   | STG W AVPN 2024                  | CLOSED |
| Bug #15          | VPL-C06   | Feasibility W/metodo             | CLOSED |
| Feat #1          | VPL-010   | Illustrazioni sfondi             | CLOSED |
| Feat #3          | VPL-011   | ScrollSection soft-focus         | CLOSED |
| Feat #9          | VPL-012   | Slider P/L                       | CLOSED |
| Feat #10         | VPL-013   | UI compensazioni                 | CLOSED |
| (nuovo)          | VPL-014   | Verificare pnpm build            | CLOSED |
| (nuovo)          | VPL-015   | Sub-route Dev Tools              | CLOSED |
| (nuovo)          | VPL-016   | Aggiornare Guidelines.md routing | CLOSED |
| (nuovo)          | VPL-017   | Correzioni Notion manuali        | CLOSED |
| (nuovo)          | VPL-018   | Aggiungere 6 nuovi stili pizza   | CLOSED |
| (nuovo)          | VPL-019   | Varianti d'autore e Baciata      | CLOSED |