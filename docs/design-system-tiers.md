# Vulcan Design System — contratto dei tier

Stato: attivo e bloccante. Questo documento descrive l'architettura corrente;
la cronologia della migrazione non è parte del contratto.

## Direzione delle dipendenze

```text
T6 template/pagine
  ↓
T5 pattern di prodotto
  ↓
T4 componenti context-free
  ↓
T3 token di componente, composite e motion
  ↓
T2/T2.5 ruoli semantici e di dominio
  ↓
T1 primitive globali
```

Ogni livello può consumare il proprio tier o quello immediatamente inferiore.
Non sono ammessi salti verso le primitive, dipendenze verso l'alto o valori
visuali grezzi nei consumer.

## Ownership per tier

| Tier | Responsabilità | Owner principale | Può contenere |
|---|---|---|---|
| T1 | Primitive globali | `src/styles/theme.css` | colori, dimensioni, font, curve e durate raw |
| T2 | Ruoli semantici | `src/styles/theme.css` | surface, content, action, border, elevation, layout semantic |
| T2.5 | Ruoli semantici di dominio | `src/styles/theme.css` | dataviz, forge, stati tecnici della ricetta |
| T3 | Contratti di componente e composite | `src/styles/theme.css`, `src/app/components/ds/motion.ts` | token `--component-*`, classi composite, preset motion |
| T4 | Componenti riusabili e context-free | `src/app/components/ds/` | stato UI locale, semantica e accessibilità del controllo |
| T5 | Pattern di prodotto | shared/features user-facing | composizione T4 e logica di presentazione del dominio |
| T6 | Template e pagine | `src/app/pages/`, template nominati nello showcase | shell, slot, orchestrazione di pattern e route |

I template T6 sono un tier esplicito del Design System: non sono semplicemente
“pagine di esempio”. Lo showcase separa fondazioni, componenti T4, pattern T5 e
template T6 e monta le implementazioni di produzione.

## Regole inderogabili

1. I valori visuali raw appartengono soltanto a T1. T2/T2.5/T3 li ricevono per
   alias; T4–T6 consumano il contratto del tier corretto.
2. Gli stili statici non vivono in attributi JSX. Le custom property inline
   sono ammesse solo come ponte per un valore realmente dinamico e il guard ne
   valida la forma; non sono un canale per aggirare i token.
3. La fisica Motion statica usa preset nominati. Durate, easing e spring locali
   sono vietati. `prefers-reduced-motion` è parte del contratto, non un tema
   opzionale.
4. I controlli generici appartengono a T4. T5/T6 li compongono e non ricreano
   bottoni, select, chip, switch o dialog con markup e styling locali.
5. Un T4 non importa CMS, pagine, feature o tipi di dominio. Un T5 non importa
   pagine/template. T6 orchestra e non introduce primitive visuali.
6. Light, dark e temi selezionabili rispettano lo stesso grafo di alias. Gli
   override `.dark` sono sottoposti allo stesso audit del blocco root.
7. Il CSS generato dello showcase è content-addressed: modifica la sorgente e
   rigeneralo; residui manuali o regole orfane fanno fallire il gate.
8. Tutto il copy montato, incluso lo showcase, passa dal catalogo i18n. Naming
   accessibile, label e descrizioni fanno parte dello stesso requisito.
9. I valori framework isolati sono ammessi solo se esatti, file-specifici e
   coperti da fixture. Non esistono baseline numeriche di debito DS.
10. Tre soli contenitori per «mostrare di più» (FW-03, audit UX 28/10/2026):
    `ds/Disclosure` in pagina (pulsante con `aria-expanded`/`aria-controls`,
    chevron, heading opzionale, varianti `card` e `inline`, token
    `--disclosure-*`), `InfoTip` per la definizione breve di un termine (nome
    accessibile «Definizione: …», link alla voce del glossario, Esc chiude solo
    il popover) e il foglio «Perché?» (FW-02). Vietati `<details>` fuori da
    `components/ds/` e `title=` su elementi non interattivi come unica
    spiegazione: li blocca `npm run semantics:check` (regole `native-details`
    e `title-only-explanation`, debito `title=` congelato per file in
    `TITLE_ONLY_BASELINE`, che può solo scendere).
11. Il foglio «Perché?» (FW-02) è `WhyButton` → `ScienceSheet`
    (`src/app/features/science/`, guscio `ds/ModalSheet`: foglio dal basso sui
    telefoni, card centrata sopra; fuoco al titolo, ritorno al pulsante). Lo
    statuto si mostra con `ds/EvidenceBadge` (T4, context-free, testo dal
    chiamante), che consuma solo i token T3 `--evidence-{exact,estimate,
    assumption,editorial}-{fg,bg,border}`, derivati dai ruoli di stato FW-13
    (stesso contrasto AA in chiaro e scuro); forma (icona, bordo tratteggiato
    dell'ipotesi) e testo portano il significato, il colore lo rinforza.
    Pattern registrato nello showcase («Perché?» — scienza a richiesta).

## Motion

I preset runtime sono in `src/app/components/ds/motion.ts`; quelli dello
showcase sono centralizzati nelle rispettive sorgenti generate. Un preset deve
esprimere il ruolo dell'interazione (feedback, disclosure, overlay, layout), non
il componente che casualmente lo usa.

Con `prefers-reduced-motion: reduce`:

- nessuna animazione infinita resta attiva;
- le transizioni decorative sono rimosse o ridotte;
- focus, stato e comprensione non dipendono dal movimento.

## Brand e asset

`VulcanMark`, splash iniziale, favicon SVG/ICO e raster installabili formano una
sola famiglia. Il guard verifica presenza, dimensioni raster e parità del path
vettoriale. Ogni evoluzione del marchio aggiorna insieme runtime, showcase e
asset; il brand è documentato nella fondazione dedicata dello showcase.

## Stati

Un colore di stato ha un solo significato in tutta l'app (FW-13, audit UX e
scienza del 28/10/2026). I ruoli base sono T2.5 (`--status-*`), i contratti T3
(`--status-{ruolo}-{fg,bg,border,icon}`) in `theme.css`; i componenti usano
solo questi, mai `--primary`, `--text-accent` o un token di un altro
componente (come `--snackbar-action`) per dire «va bene» o «attenzione».

| Ruolo | Significato | Base | Esempi |
|---|---|---|---|
| `positive` | va bene, fatto | `--cta` (salvia) | «Perfetta per questo stile», forno pronto, «tocca a te» a fase finita |
| `caution` | si può fare, con riserva | `--tertiary` (ambra) | valore fuori range, forno da adattare, avvisi |
| `blocking` | non si può fare | `--destructive` (rosso) | ricetta non fattibile, errori |
| `neutral` | dato, nessun giudizio | `--muted-foreground` | tempo totale, condizioni da verificare («Se hai una teglia») |
| `recommended` | la proposta di Vulcan, identità «su misura» | salvia scura (chiaro) / chiara (scuro) | colonna «Proposta» del confronto |

Il terracotta (`--primary`, `--text-accent`) resta il colore del marchio e
dell'«Originale»: non si usa per un esito.

Contrasto minimo misurato del testo (`fg`) sul proprio fondo al 12% sopra la
superficie più scura fra card, pagina, surface-low e surface-container:

| Ruolo | Chiaro | Scuro |
|---|---|---|
| `positive` | 4,8:1 | 6,2:1 |
| `caution` | 6,2:1 | 6,0:1 |
| `blocking` | 7,2:1 | 4,8:1 |
| `neutral` | 5,9:1 | 6,9:1 |
| `recommended` | 6,4:1 | 8,2:1 |

Le icone usano la stessa tinta (≥ 3:1). `npm run check:type-floor` ricalcola
la tabella da `theme.css` (`scripts/status-contrast.mjs`) e fallisce sotto
4,5:1. Lo stesso controllo vieta il maiuscolo sugli elementi di testo
corrente (`__sub`, `__desc`, `__text`, `__note`…): D-019 ammette il maiuscolo
a 11 px solo per gli eyebrow.

**Esito negativo marcato** (nota di Matteo, 30/10/2026: «molto più :(»).
Card di compatibilità della ricetta (`.match-card--blocked`), avviso
`RecipeVerdictNotice` non incorporato e pannello stile di Crea
(`.style-detail-match--blocked`) hanno fondo pieno
`--status-blocking-surface` (16% del rosso sopra
`--surface-container-lowest`, opaco), bordo pieno
`--status-blocking-border-strong` da 2 px, il contrassegno `.blocked-mark`
(`BlockedMark`: divieto da 28 px su disco da 48 px, `--status-blocking-icon`
con `--status-blocking-mark-fg`) e il titolo serif extrabold nel colore del
blocco. Contrasti misurati, anch'essi controllati da `check:type-floor`:

| Sul fondo pieno | Chiaro | Scuro |
|---|---|---|
| titolo (`--status-blocking-fg`) | 7,5:1 | 5,9:1 |
| testo (`--text-default`) | 13,0:1 | 15,3:1 |
| testo muto (`--text-muted`) | 5,0:1 | 7,1:1 |
| link (`--cta`) | 4,8:1 | 8,1:1 |
| icona sul disco | 10,0:1 | 6,3:1 |

## Accessibilità del sistema

Semantica, focus e tastiera sono proprietà dei componenti e dei pattern, non
patch delle singole pagine. Dialog e sheet condividono autofocus, focus trap,
Escape, scroll lock e ripristino del trigger. Controlli compositi espongono
ruoli, stati, naming e navigazione coerenti. Contrasto e target size sono
verificati sulla build production con Axe e controlli geometrici.

Card di stile (FW-14, S03-B-18): in Crea la card apre il pannello dello stile
(`aria-haspopup="dialog"`), perché si sceglie uno stile da configurare; in
Scopri la card è un link alla scheda ricetta (`/recipe/<id>`), perché si
consulta il riferimento. La CTA del pannello ha la stessa etichetta su ogni
breakpoint («Genera ricetta»), mai il nome della tab corrente.

## Enforcement

Il gate canonico è:

```bash
npm run quality:full
```

La parte statica può essere eseguita separatamente:

```bash
npm run quality:check
npm run ds:check
npm run ds:report
```

`ds:check` verifica almeno:

- confini di import T1–T6;
- dipendenze e alias dei token, inclusi override dark;
- valori raw, token irrisolti e bypass di tier;
- inline presentation e literal Motion;
- controlli generici fuori da T4;
- copertura importata e renderizzata di tutti i T4 nello showcase;
- separazione visibile di pattern T5 e template T6;
- integrità CSS generato e asset brand.

Le eccezioni tecniche sono file-exact, strutturali, motivate e testate nelle
fixture del guard. Un conteggio tollerato o l'esclusione di una directory
user-facing non sono eccezioni valide.

## Criterio per nuove aggiunte

Prima di aggiungere codice, scegliere il tier con queste domande:

- È un valore atomico? T1.
- Descrive un ruolo indipendente dal componente? T2/T2.5.
- Descrive il contratto visuale o motion di un componente? T3.
- Funziona senza conoscere Vulcan? T4.
- Conosce ricette, impasti o flussi di prodotto ma non una route? T5.
- Definisce struttura, slot o orchestrazione di una pagina? T6.

Se nessuna risposta è netta, il confine non è ancora abbastanza chiaro per
creare una nuova astrazione.
