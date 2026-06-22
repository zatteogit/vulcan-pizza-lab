# Mappa del divario — DS Vulcan vs sync claude.ai/design

_Generato il 2026-06-22. Confronta cosa il **catalogo** `design-system/` documenta con
cosa esiste come **componente React reale** sincronizzabile su claude.ai/design._

## TL;DR

Il catalogo `design-system/` documenta **28 tipi di componenti** + ~90 foundations + ~33 pattern.
Ma claude.ai/design monta **componenti reali** (con prop API), non pagine di documentazione.
I `*Spec` sono pagine di doc a zero-prop con demo **inline** — scollegate dai componenti veri
(verificato: i Spec non importano alcun componente reale, solo `SCORE_DIMENSIONS` come dato).

Componenti React **veri** nel repo, per accoppiamento:

| Bucket | Cosa | Quanti | Sincronizzabili? |
|---|---|---|---|
| **A — già live** | `ds/`, context-free, tipizzati | 10 | ✅ già caricati |
| **B-free** | reali, context-free, non ancora in `ds/` | ~6 | ✅ subito (basso sforzo) |
| **B-coupled** | reali ma dipendono da CMS i18n + pizza-engine | ~12 | 🟡 serve wiring di un provider |
| **C — demo-only** | documentati ma il componente NON esiste (vive inline nello Spec) | ~13 | 🔴 vanno estratti/creati da zero |

Le **foundations** (colori, tipografia, spacing, elevation, motion, glass, logo, M3E…) sono
**già coperte** dal sync come stylesheet (`styles.css` → `_ds_bundle.css`: token `--*` + classi `.type-*`),
non come card. Non sono un buco.

---

## A — Già sincronizzati (10, context-free, live)

| ds/ componente | id catalogo | note |
|---|---|---|
| Badge | `badges` | catalogo include anche InlineTip (→ vedi B-coupled `info-tip`) |
| CtaButton | `buttons` | 4 varianti × 3 taglie documentate |
| Surface | `cards` | Card / Container |
| Chip | `chips` | UnifiedChip |
| FilterChip | `chips` | filtro con count |
| IconButton | `iconbutton` | |
| SegmentedControl | `segmented` | |
| Switch | `switch` | (esiste anche la primitiva `ui/switch.tsx`) |
| Heading | — | tipografia, non un "id componente" del catalogo |
| Stepper | — | stepper numerico +/−, **non documentato** nel catalogo |

→ Coprono **~8 dei 28** tipi documentati.

## B-free — reali, context-free, NON ancora in `ds/` (sincronizzabili subito)

| Componente | File | Firma | id catalogo |
|---|---|---|---|
| ScoreRing | `score-ring.tsx` | `{ score, color, size }` | `scorering` |
| TiltCard | `tilt-card.tsx` | `{ children, className, maxTilt, style }` | — (card interattiva) |
| DoughBlob (+ moodFromScore/Tier) | `dough-mascot.tsx` | `{ … }` | — (mascotte brand) |
| FireGlow | `fire-glow.tsx` | `{ intensity, variant }` | — (effetto visivo) |
| VulcanMark | `vulcan-logo.tsx` | `{ … }` | foundation `logo` |
| Bowl / Flask / RisingDough | `step-illustrations.tsx` | `{ size }` | — (illustrazioni) |

→ **~6 componenti**. Sposta in `ds/index.ts` (o aggiungili a `componentSrcMap`) e si sincronizzano
come gli altri 10. Zero estrazione, solo scoping.

## B-coupled — reali ma app-coupled (servono provider CMS i18n + dati engine)

Esistono come codice ma usano `useCms`/`cms-context` + `pizza-engine`/`style-versions`. Per
renderizzarli nel sync serve wirare un provider (oggi `cfg.provider` è null di proposito).

| Componente | File | id catalogo |
|---|---|---|
| RecipeConfigurator | `recipe-configurator.tsx` | `configurator` |
| RecipeStatStrip | `recipe-stat-strip.tsx` | `statstrip` |
| RecipeSectionTabs | `recipe-section-tabs.tsx` | `tabs` |
| InfoTip | `info-tip.tsx` | `tooltip` / InlineTip |
| RecipeMatchCard | `recipe-match-card.tsx` | (pattern card) |
| RecommendedStyles | `recommended-styles.tsx` | (pattern) |
| RecipeView | `recipe-view.tsx` | — |
| CookingMode | `cooking-mode.tsx` | — |
| ActiveCookWidget | `active-cook-widget.tsx` | — |
| RecipeOutput | `recipe-output.tsx` | `modal` (ScoreDashboard) |
| RecipeFeedback | `recipe-feedback.tsx` | — |
| TroubleshootingPanel | `troubleshooting-panel.tsx` | — |

→ **~12 componenti**. Alto valore (sono le feature reali) ma richiedono provider + dati mock.

## C — demo-only (documentati, ma il componente NON esiste come codice riutilizzabile)

Verificato: nessun componente reale per questi fuori dai `*Spec`. Vivono come `<motion.button>`/
markup inline dentro la pagina di doc. Per sincronizzarli **vanno creati da zero** come componenti veri.

`bottomsheet`, `carousel`, `checkbox`, `dialog`, `divider`, `fab`, `inputs` (Input & Slider),
`loading`, `progress`, `radio`, `select` (Dropdown), `snackbar` (Toast), `stepheader`

→ **~13 tipi**. Il grosso del lavoro di "componentizzazione" è qui.

---

## Raccomandazione di sequenza

1. **Subito, costo ~zero:** aggiungi i **6 B-free** allo scope → da 10 a **16** componenti reali live.
2. **Medio:** wira un provider CMS + dati mock e porta dentro i **B-coupled** ad alto valore
   (Configurator, StatStrip, Tabs, InfoTip, MatchCard) → copertura delle feature reali.
3. **Grande:** estrai i **C demo-only** dai Spec in componenti `ds/`-style con prop API
   (Dialog, Input/Slider, Select, Checkbox, Radio, FAB, Snackbar, BottomSheet, …).
   Questo è sviluppo vero, iterativo — ma è ciò che rende l'intero DS componibile dall'agente.
