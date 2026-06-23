# Mappa del divario (bidirezionale) — DS Vulcan ↔ app ↔ sync claude.ai/design

_Aggiornato il 2026-06-23. Tre lenti sullo stesso sistema:_
1. **Sync** — cosa è caricato su claude.ai/design (coverage del DS).
2. **DS → app** — ogni componente del DS, chi lo usa davvero nell'app (adozione).
3. **app → DS** — dove l'app costruisce UI a mano avendo già un equivalente nel DS (debito).

> Metodo: grep degli import da `ds/` e dei pattern inline (`<button>`, `type="range"`,
> overlay `fixed`, dropdown `ChevronDown`) sui feature screen top-level di `src/app/components/`,
> esclusi `ds/`, `design-system/`, `cms/`. I conteggi sono indicativi (file-consumatori / occorrenze).

---

## 1. Stato sync — 34 componenti live (era 10)

Il catalogo `design-system/` documenta ~28 tipi di componenti + ~90 foundations + ~33 pattern come
pagine `*Spec` (doc a zero-prop con demo inline). claude.ai/design monta **componenti reali**: ne
abbiamo 34, più le foundations come stylesheet.

| Bucket | Stato | N° |
|---|---|---|
| `ds/` originali (context-free, tipizzati) | ✅ sync | 10 |
| **Onda 1** — B-free (ScoreRing, TiltCard, DoughBlob, VulcanMark, StepIllustration) | ✅ sync | +5 |
| **Onda 2** — app-coupled (InfoTip, RecipeSectionTabs, RecipeStatStrip, RecipeMatchCard) | ✅ sync | +4 |
| **Onda 3** — primitive nuove scritte da zero dai Spec (Checkbox, RadioButton, Divider, Slider, Select, Fab, StepHeader, Progress, Spinner, Snackbar, Dialog, BottomSheet, Carousel) | ✅ sync | +13 |
| **Onda 4** — pattern curati (RecommendedStyles, ContextualWarnings) | ✅ sync | +2 |
| **Totale** | | **34** |
| Foundations (colori/tipografia/spacing/elevation/motion/glass/logo/M3E) | ✅ come stylesheet (`_ds_bundle.css`: token `--*` + classi `.type-*`) | — |

Esclusi/backlog (vedi §4). Dettagli build in `.design-sync/NOTES.md`.

---

## 2. Direzione DS → app — adozione (chi usa cosa)

**Regola emersa: tutto ciò che è stato _estratto dall'app_ è ben adottato; le primitive _nuove_
(estratte dalla documentazione) sono a adozione zero perché appena nate.**

### Adottati — usati nei feature screen reali
`ds/` (import dal barrel `ds/`):

| Componente | file-consumatori | | Componente | file-consumatori |
|---|---|---|---|---|
| Surface | 7 | | IconButton | 3 |
| Badge | 6 | | Heading | 3 |
| CtaButton | 5 | | Switch | 2 |
| SegmentedControl | 3 | | FilterChip | 2 |
| | | | Stepper · Chip | 1 · 1 |

Estratti da `components/` (B-free + app-coupled), tutti usati:

| Componente | file-cons. | | Componente | file-cons. |
|---|---|---|---|---|
| VulcanMark | 4 | | RecipeSectionTabs | 2 |
| ScoreRing | 3 | | RecommendedStyles | 2 |
| DoughBlob | 3 | | InfoTip | 2 |
| StepIllustration | 3 | | RecipeStatStrip · RecipeMatchCard · ContextualWarnings | 1 |
| TiltCard | 2 | | | |

→ **Zero orfani**: ogni componente del DS che proviene dall'app è consumato dall'app.

### Adozione zero — le 13 primitive nuove (Onda 3)
`Checkbox · RadioButton · Divider · Slider · Select · Fab · StepHeader · Progress · Spinner ·
Snackbar · Dialog · BottomSheet · Carousel` → **0 usi nell'app**.

Non è un difetto: erano **demo inline dentro i `*Spec`** (documentazione), mai estratte in
componenti veri. Ora che esistono come `ds/`, l'app può adottarle — è il §3.

---

## 3. Direzione app → DS — debito di adozione (UI a mano con equivalente nel DS)

L'app costruisce gran parte dei controlli **inline**, perché finora il `ds/` aveva solo
CtaButton/IconButton/Switch/… Ora c'è l'equivalente per quasi tutto. Opportunità di refactoring:

| Pattern inline nell'app | Quanto | Dove (file principali) | → Sostituire con |
|---|---|---|---|
| `<button>` / `motion.button` | **~170 occorrenze**, 24 file | quasi ovunque | `CtaButton` / `IconButton` / `Fab` |
| `<input type="range">` | 5 occ., 3 file | recipe-configurator, style-editor-tab, dev-tools | `Slider` |
| overlay `position: fixed` (modali/sheet) | 11 file | cooking-mode, recipe-output, style-detail-sheet, recipe-setup-panel, style-editor-tab, sync-tab, search-overlay, recipe-learning-panel | `Dialog` / `BottomSheet` |
| dropdown custom (`ChevronDown` + `isOpen`) | 9 file | recipe-configurator, recipe-setup-panel, style-editor-tab, sync-tab, troubleshooting-panel, pre-ferment-guide, feedback-analysis | `Select` |

### Duplicato esplicito da consolidare
**`PremiumSelect`** (definito in `recipe-configurator.tsx`, usato anche in `recipe-setup-panel.tsx`)
è una reimplementazione 1:1 di `ds/Select` (trigger + chevron rotante + dropdown a gruppi + check).
**Azione:** sostituire `PremiumSelect` con `ds/Select` ed eliminare la definizione locale.

### Priorità di migrazione consigliata
1. **`PremiumSelect` → `ds/Select`** — duplicato netto, due call-site, vittoria pulita.
2. **`<input type="range">` → `ds/Slider`** — solo 3 file, alto impatto visivo (è il controllo fine-tuning).
3. **Dropdown custom → `ds/Select`** — 9 file, unifica un pattern oggi copiato.
4. **Modali `fixed` → `Dialog`/`BottomSheet`** — usare la prop `inline` non serve in app (lì il `fixed` va bene); adottare il componente per coerenza di scrim/radius/spring.
5. **`<button>` → `CtaButton`/`IconButton`/`Fab`** — il grosso (170), ma molti sono legittimi: triage, non sostituzione cieca.

> Nota: i `*Spec` in `design-system/` restano apposta UI inline (sono **documentazione**), non
> vanno migrati. Il debito riguarda solo i feature screen.

---

## 4. Backlog (non sincronizzato, per scelta)

| Cosa | Perché fuori | Riconsiderare se… |
|---|---|---|
| **6 feature screen**: RecipeView, RecipeOutput, CookingMode, ActiveCookWidget, RecipeFeedback, TroubleshootingPanel | schermate intere (T6), non building block — l'agente le costruisce DAI componenti, non le riusa | servono come **template** completi nel picker |
| **RecipeConfigurator** | 15+ prop + fixture `PizzaStyle` pesante, ROI basso | si vuole il pattern "configuratore" completo (fattibile con fixture statica) |
| **FireGlow** | layer ambient `fixed inset-0` a bassa opacità, non componibile, non catturabile | ripensato come effetto **contenibile** (`absolute` in un parent) |

---

## 5. Sintesi

- **Coverage DS**: il sistema atomico + molecolare + foundations è completo (34 componenti).
- **DS → app**: adozione piena per gli estratti dall'app, zero per le 13 primitive nuove (appena nate).
- **app → DS**: debito concreto e misurabile — ~170 button, 5 range, 11 overlay, 9 dropdown inline +
  1 duplicato netto (`PremiumSelect`) — tutti con un equivalente DS ora disponibile.

Il valore pieno del sync si realizza quando l'app **adotta** le primitive nuove (§3): a quel punto
codice e design parlano lo stesso vocabolario, e ogni schermata generata su claude.ai/design mappa
1:1 su componenti che gli ingegneri spediscono davvero.
