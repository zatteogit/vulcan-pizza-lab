# Budget di prestazioni (P-5)

Misure del 24/10/2026 sulla build di produzione (`npm run build`, `vite preview`),
Chromium a 390×844. «Rete lenta» = 4G lento emulato (1,6 Mbit/s, 150 ms di
latenza) con CPU rallentata 4 volte, il profilo dei telefoni di fascia media.

## Misure

| Pagina | LCP (rete veloce) | LCP (rete lenta) | CLS | JS scaricato | CSS |
|---|---|---|---|---|---|
| `/` (Crea) | 1,2 s | **4,6 s** | 0,001 | 1.185 kB | 454 kB |
| `/explore` | 1,0 s | **3,7 s** | 0,001 | 858 kB | 454 kB |
| `/recipe/napoletana_stg` | 1,0 s | **4,3 s** | 0,049 | 1.095 kB | 454 kB |

Soglie Core Web Vitals «buono»: LCP ≤ 2,5 s, CLS ≤ 0,1. Il CLS è a posto
ovunque; l'LCP su rete lenta no.

Dopo P-5b (font: `<link>` in `index.html` con `preconnect`, tolto l'`@import`
bloccante da `fonts.css`), rete lenta: `/` 4,3 s (−0,3), `/explore` 3,4 s (−0,3),
`/recipe/napoletana_stg` 4,3 s (invariato: lì pesa il JS).

| Build | Oggi | Budget (`npm run check:budget`) |
|---|---|---|
| Chunk JS più grande (gzip) | 75 kB (React) | 100 kB |
| JS senza i cataloghi delle lingue (gzip) | 497,9 kB (29/10/2026, integrazione dell'ondata 2) | 500 kB |
| JS per utente: codice + la lingua più pesante (gzip) | 595,9 kB (con `ja`, 98 kB) | 600 kB |
| JS emesso in tutto, 7 lingue (gzip) | 974 kB in 73 chunk | solo informazione (D-059) |
| CSS (gzip) | 61 kB (443 kB non compresso) | 75 kB |
| Video più grande | 0,65 MB (`napoletana_stg.mp4`; era 14,6) | 1 MB |
| Video totali | 2,6 MB (6 file; erano 48,6) | 3 MB |
| Immagini totali | 38,5 MB (254 file WebP) | 42 MB |

Il controllo gira in CI dopo la build (`.github/workflows/verify.yml`). I limiti
sono un cricchetto: si abbassano quando si migliora, non si alzano per far
passare lavoro nuovo. Con la traduzione dei condimenti (I18N-2) ogni bundle di
lingua cresce di circa 20 kB gzip (ja: 65 kB in tutto); si scarica solo quello
della lingua attiva.

**D-059 (29/10/2026): si misura il JS per utente, non il totale.** Il vecchio
tetto (900 kB su tutto il JS emesso) sommava i sei cataloghi delle lingue, che
sono caricati solo per la lingua attiva: ogni testo nuovo in 7 lingue contava
6 volte, e ogni pacchetto dell'audit lo superava pur aggiungendo poco a quello
che un utente scarica (534 → 572 kB con l'ondata 1, +7 %). Ora i limiti sono
due: il codice senza lingue e il codice più il catalogo più pesante. Il totale
resta stampato come informazione. I cataloghi si riconoscono dai file in
`src/app/features/cms/locales/<lingua>.ts`.

### Ondata 2 dell'audit (29/10/2026)

Unendo FW-05, FW-15, FW-17, FW-19 e FW-02 il codice senza lingue arrivava a
512,3 kB (chunk principale 104,2 kB), oltre i limiti, senza alzarli:

- il pannello di debug AI (`debug-workspace`, ~10 kB) e l'esploratore dei temi
  non entrano più in `dist/` in produzione (import dinamico sotto
  `import.meta.env.DEV` / `TOOLS_ENABLED`);
- `experimentalMinChunkSize: 4000` in `vite.config.ts` fonde i chunk condivisi
  piccoli e senza effetti collaterali (−4 kB);
- il catalogo UI italiano (`ui-messages.it.ts`) è un chunk a sé, caricato
  subito come prima, così il chunk principale resta sotto i 100 kB.

Con FW-06 il ramo d'integrazione misurava 501,8 kB senza lingue e 600,2 kB
per utente (ja 99,8 kB). FW-04 (glossario: 12 voci nuove in 7 lingue,
TermLink, deep link) aggiunge circa 5 kB di codice e 2,4 kB a ogni lingua.
Recupero: 161 chiavi del CMS che nessun codice legge più (118 per sezione,
43 messaggi del motore come i vecchi `rec.*`), tolte dal tipo, dal default
italiano, dalle sei lingue e dai campi dell'editor. Il catalogo ja torna a
97,9 kB; il codice senza lingue resta sopra il limite (vedi la PR di FW-04
per le misure): servono interventi strutturali (per esempio `LazyMotion`),
non un altro taglio di testi.

Con D-062 e D-063 il ramo d'integrazione dell'ondata 2 era già a 501,9 kB
(600,3 per utente). Recuperati 2,8 kB togliendo dal CMS circa 180 testi che
nessuna pagina legge più (in italiano e nelle sei lingue: vecchi motivi
`rec.*` del consiglio, etichette del vecchio confronto, del vecchio
configuratore e della ricetta parcheggiata): 499,9 kB senza lingue, 595,7 kB
per utente. Il margine resta sottile.

**Integrazione dell'ondata 2 (FW-04 + D-062/D-063, 29/10/2026).** Uniti i due
rami (i due tagli del CMS si sommano), la build misurava 507,6 kB senza lingue
e 605,6 kB per utente. Recuperati 9,7 kB senza toccare limiti né script, con
interventi strutturali e nessun testo in meno:

| Intervento | kB gzip (misurati uno alla volta: non si sommano esattamente) |
|---|---|
| `react-router` di produzione in `vite build` (gli `exports` del pacchetto puntano sempre alla build di sviluppo) | −0,7 |
| Drag/pan di motion svuotati in build (plugin `vulcan-motion-without-drag`; `components/ds/motion-no-drag.test.ts` fallisce se il prodotto torna a usarli). L'unico uso, lo swipe dei pannelli di `RecipeOutput`, era codice morto: il componente si monta solo con `forcedTab`, che spegneva il trascinamento | −3,9 |
| `ds/Switch` come `<button role="switch">` nativo al posto di `@radix-ui/react-switch` (stesso `data-state`, stessa API) | −2,1 |
| La scheda dello stile chiede solo le tabelle che mostra: acqua e maturazione di `parametric-databases.ts` (lette solo dagli strumenti di sviluppo) escono dal bundle | −1,1 |
| `experimentalMinChunkSize` 4000 → 6000 (Dialog, ImageWithFallback e glossary-data si fondono nei chunk che li caricano) | −1,4 |
| Terser con `ecma: 2020` (il target della build) e senza il ripiego per Safari 10 | −0,2 |

Risultato: **497,9 kB senza lingue, 595,9 kB per utente** (ja 98,0 kB). Prove
scartate: `passes: 3` di Terser (−0,1 kB), soglie di fusione oltre 6000 (nessun
guadagno), una sola copia italiana dei messaggi del motore (−0,5 kB per 61
testi: troppo poco per il cambiamento). Restano candidati per il prossimo
giro: il router senza data router (`createBrowserRouter` pesa ~28 kB) e i
campi dei dati che nessuna pagina legge (per esempio prezzi e deviazioni in
`flour-database.ts`), da decidere con chi cura i dati.

**G2-WP-02 (29/10/2026).** Il ramo dell'area G2 partiva da 499,7 kB senza
lingue; le etichette del range, la temperatura manuale e «Non lo so» ne
aggiungevano circa 0,6. Recuperati senza toccare limiti né script: i tre
suggerimenti di temperatura del configuratore (`hint*Ferment*`, calcolati e mai
mostrati) e due testi del CMS che nessun codice legge più (`adjustByHand`,
`changeTiming`), più il calcolo dell'etichetta di `AdaptiveHint` in un solo
punto e i marcatori dello slider generati da una lista. Risultato: 499,8 kB
senza lingue, 598,6 kB per utente. Il margine resta di circa 0,2 kB.

### Ondata 3 dell'audit: router dichiarativo (29/10/2026)

Con G5 (onboarding e profilo, 6 pacchetti) il codice senza lingue arrivava a
500,6 kB (599,1 per utente). Matteo ha scelto un recupero strutturale invece di
alzare i tetti: il router passa da `createBrowserRouter` (data router) a
`<BrowserRouter>` + `<Routes>` (`App.tsx`). L'app non usava loader, action né
fetcher: i soli `loader: redirect()` sono diventati `<Navigate replace>`, il
`lazy` delle rotte `React.lazy` sotto un `Suspense` già montato attorno
all'`Outlet` (con le transizioni del router la pagina precedente resta visibile
finché arriva il chunk), e `useMatches` per la 404 è diventato
`isNotFoundPath()` in `routes.ts`, che `App.tsx` passa alla shell (importato
dalla shell porterebbe pagine e strumenti di sviluppo nel suo grafo). Verificate tutte le rotte, i redirect (anche
con query), il titolo della 404 e il ripristino dello scroll col tasto Indietro.

Risultato: **484,6 kB senza lingue (−16,0), 583,1 kB per utente** (ja 98,5 kB).
I tetti restano 500/600: il margine serve alle aree G1–G4 dell'ondata 3; dopo
la loro integrazione si valuta se abbassarli.

## Perché l'LCP è lento

1. **La home scarica il motore prima che serva.** `use-recipe-state` (187 kB),
   `topping-library` (120 kB) e `pizza-engine` (115 kB) arrivano al primo
   caricamento, ma servono solo dopo la scelta dell'orario. Sono circa 420 kB
   di JS da scaricare e valutare con la CPU lenta.
2. **Un solo foglio di stile da 443 kB**, bloccante, con gli stili di tutte le
   pagine. Non c'è un taglio rapido: è distribuito sui componenti (profilo 32 kB,
   design system 25 kB, Crea 25 kB…).
3. **Font da Google Fonts** con un CSS esterno bloccante (Playfair Display, DM
   Sans, DM Mono). In parte risolto: vedi P-5b.

### G4a-WP-02, modalità cottura (29/10/2026)

Il ramo dell'area G4 era a 500,0 kB su 500 senza lingue (margine di circa 20 byte).
Segnale di fine fase, interruttori dell'header e avanzamento unico valgono
circa 0,7 kB gzip nel chunk principale; recuperati senza alzare i limiti
togliendo codice morto: la seconda copia di `blockerText` in
`recipe-verdict-notice.tsx` (ora importa `blocker-text.ts`), i ripieghi `??`
su chiavi CMS che hanno sempre un default (finestra «Modifiche non salvate»,
correzioni dal feedback, ispirazioni d'autore) con le loro chiavi uiMessage
orfane, `setStepDone` mai usato, e un'icona per interruttore (lo stato spento
è una barra in CSS). Risultato: 499,9 kB senza lingue, 598,2 kB per utente.
Il chunk lazy di `cook-alert` non serve: `experimentalMinChunkSize` lo
rifonde nel principale.

### G4a-WP-03, «Prima di iniziare» (29/10/2026)

Condizioni, orari e motivo del blocco nel dialog valgono circa 0,5 kB gzip
senza lingue (il ramo partiva da 499,9 kB). Recuperati senza alzare i limiti:
i ripieghi `??` su chiavi CMS che hanno sempre un default (dettagli e
«Nascondi» della match card, «Personalizza», «Regola a mano», ricerca degli
stili, farcitura, frigo/ambiente, «Forza farina», «La tua cucina») con le
cinque chiavi uiMessage rimaste orfane; la chiave `notPersonalizedAria` (il
dialog prende il nome dal titolo visibile); la tabella metodo → segnale, che
le chip delle condizioni copiavano da `recipe-card-signals.ts`; una sola
chiamata a `startSession` in `recipe-output.tsx`; le chip compatte non calcolano più
la lista completa per poi buttarla. Risultato: 499,9 kB senza
lingue (margine di circa 110 byte), 598,1 kB per utente.

### G4b-WP-02, «Come si fa» dei prefermenti (29/10/2026)

Il ramo partiva da 511 963 byte gzip senza lingue su 512 000 (margine di 37
byte). Passi, esempio su 1 kg e nota `pre-ferment-procedure` valgono circa
0,3 kB nel codice senza lingue e 0,5 kB nel catalogo giapponese. Recuperati
senza alzare i limiti: una sola tabella di confronto (`PreFermentComparisonTable`)
per guida e ricetta al posto di due copie, con il suo CSS e tre chiavi uiMessage
orfane in 7 lingue; niente animazione d'ingresso propria della card (nella guida
si animava due volte); la card legge i campi del CMS senza la copia `info` e
senza ripieghi `??` su chiavi che hanno sempre un valore; tolte tre regole CSS
morte (`__chevron`, `__body`, `__compare-panel`). Risultato: 499,8 kB senza
lingue (511 788 byte, margine di circa 210 byte), 598,4 kB per utente, CSS 74,2 kB.

### G4b-WP-03, problemi per fase e voci nuove (29/10/2026)

Il ramo partiva da 511 788 byte gzip senza lingue (margine di circa 210 byte).
Tre voci nuove (P22–P24) col testo italiano, la nota `troubleshooting-practice`
e i gruppi per fase valgono circa 1 kB senza lingue e 0,6 kB nel catalogo
giapponese. Recuperati senza alzare i limiti: gli avvisi contestuali di Crea
leggono i testi solo dal CMS (in `getContextualWarnings` c'era una seconda
copia italiana, già divergente, di tutti i messaggi); i passi «olio»,
«preriscalda» e «frittura» del Procedimento e la nota sulle cotture in serie
non ripetono il testo italiano che il CMS ha già nei default (il CMS è sempre
fuso su `CMS_DEFAULTS`); tolte l'etichetta italiana delle fasi in
`CATEGORY_LABELS`, la categoria morta «solver» in 7 lingue, l'animazione
d'ingresso dei chip e l'etichetta della fase dentro le card (la dice l'h2 del
gruppo). Risultato: 499,6 kB senza lingue (511 602 byte, margine di circa 400
byte), 598,8 kB per utente, chunk giapponese 99,2 kB, CSS 74,3 kB.

### 30/10/2026: il JS del solo CMS fuori dal conto pubblico

La #160 (archivio foto del CMS, `/cms/foto`) ha portato il «per utente» da
595,6 a 598,5 kB e, con G1b (#161), a 599,5 kB su 600. Dei +2,9 kB della #160,
1,5 kB sono il chunk `photo-library`, che nessun percorso pubblico richiede:
come già il CSS del CMS, ora `check:budget` lo misura a parte (`CMS_ONLY_JS`)
e non lo somma a «senza lingue» e «per utente». Il resto è un rimescolamento
dei chunk condivisi (`account-panel` separato, `localize` che ingloba moduli
prima altrove) e circa 0,7 kB nel chunk d'ingresso (lettura della foto
pubblicata). Dopo: 494,3 kB senza lingue, 598,0 kB per utente. Decisione di
Matteo: «per js e cms fai come meglio credi».

Due limiti noti della misura, da tenere presenti:

- **Il «per utente» è sottostimato per le lingue diverse dall'italiano**: chi
  usa una lingua straniera scarica anche il catalogo inglese di riserva, che
  il conto non somma.
- **L'italiano è sempre nel codice**: `CMS_DEFAULTS` (con `UI_MESSAGES_IT` e
  i testi di dominio) è la base su cui si fondono le altre lingue, quindi
  pesa su ogni utente come «codice». Il recupero strutturale vero è rendere
  l'italiano una lingua caricata come le altre, con una base neutra: è un
  lavoro a sé, da pianificare prima delle tranche B–D del catalogo.

## Interventi consigliati, in ordine di resa

| # | Intervento | Effetto atteso | Costo |
|---|---|---|---|
| ~~P-5a~~ | Ridimensionata il 24/10: con D-036/D-037 l'ingresso è Scopri e lo step «quando» non c'è più. Misura in locale (build di produzione): Scopri scarica `pizza-engine` (118 kB) e `topping-library` (124 kB) non compressi perché ogni card calcola il punteggio sul forno dell'utente; LCP 0,9 s (la foto), Crea 0,92 s. Rimandarli farebbe comparire i punteggi dopo le card per circa 60 kB compressi: non conviene. Da riaprire solo se `styles-db` si stacca da `topping-library` per altri motivi | — | — |
| ~~P-5b~~ | Fatto il 24/10: font in locale (`public/fonts`, sottoinsiemi latin e latin-ext, file variabili, licenze OFL accanto), `preload` dei due file sopra la piega, nessuna richiesta a domini esterni al primo caricamento | −1 connessione a terzi (DNS+TLS) e niente IP del visitatore a Google | — |
| ~~P-5c~~ | Fatto il 24/10 (D-034): 480p, 24 fps, 8 s in loop, H.264 CRF 28, senza audio, faststart; niente video con «riduci movimento» o risparmio dati | da 48,6 MB a 2,6 MB (−95%) | — |
| ~~P-5d~~ | Ridimensionata il 24/10: il CSS è 456 kB non compressi, 62 kB gzip; le regole spostabili per pagina (profilo, analisi feedback, CMS, vetrina DS) valgono circa 8 kB gzip. Per spostarle andrebbero riscritti i controlli che trattano `theme.css` come fonte unica (check:tokens, css-tokens, type-floor, ds:check): non conviene ora | — | — |

## Decisioni da prendere (Matteo)

- **Quali video restano.** Oggi 6 stili hanno un video (napoletana, focaccia
  genovese, focaccia barese, chicago deep, new york, detroit) da 4 a 15 MB
  ciascuno, con poster e `preload="metadata"`. Proposta: tenerli tutti ma
  ricodificati (P-5c); sotto «Risparmio dati» del browser mostrare solo il poster.
