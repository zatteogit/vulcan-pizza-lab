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
| Chunk JS più grande (gzip) | 79,8 kB (catalogo `ja`, 30/10/2026) | 100 kB |
| JS senza i cataloghi delle lingue, italiano compreso (gzip) | 448,0 kB (30/10/2026, italiano come le altre lingue) | 500 kB |
| JS per utente: codice + la lingua più pesante (gzip) | 551,1 kB (con `ja`, 103,1 kB; in italiano 497,9) | 600 kB |
| JS emesso in tutto, 7 lingue (gzip) | 974 kB in 73 chunk | solo informazione (D-059) |
| CSS (gzip) | 72,2 kB (516 kB non compresso, 30/10/2026) | 75 kB |
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

Due limiti noti della misura, da tenere presenti (risolti il 30/10/2026, vedi «L'italiano come le altre lingue»):

- **Il «per utente» è sottostimato per le lingue diverse dall'italiano**: chi
  usa una lingua straniera scarica anche il catalogo inglese di riserva, che
  il conto non somma.
- **L'italiano è sempre nel codice**: `CMS_DEFAULTS` (con `UI_MESSAGES_IT` e
  i testi di dominio) è la base su cui si fondono le altre lingue, quindi
  pesa su ogni utente come «codice». Il recupero strutturale vero è rendere
  l'italiano una lingua caricata come le altre, con una base neutra: è un
  lavoro a sé, da pianificare prima delle tranche B–D del catalogo.

### G1a-WP-01, scheda farina (30/10/2026)
Il ramo partiva da 492,0 kB senza lingue e 595,6 kB per utente. La pagina
`/learn/flour/:flourId` (chunk proprio, circa 2,4 kB), le note delle farine
nel CMS (circa 1,3 kB nel catalogo giapponese) e il rimescolamento dei chunk
che la pagina provoca portavano a 600,6 kB per utente, sopra il limite.
Recuperati senza alzare i limiti: i nomi e le descrizioni italiane di
impastatrici, superfici e utensili in `equipment-data.ts` (il CMS li ha sempre
nei default: `getLocalized*` non ricade più sulla copia); i testi di staglio,
appretto e del preriscaldo con appretto, che motore e CMS avevano in due copie
(ora `STEP_COPY_IT` e `METHOD_MESSAGES_IT` in `method-messages.ts`); le frasi
«Prima → Ora» di `recipe-entry.ts` e i ripieghi italiani di `blocker-text.ts`.
Risultato: 494,7 kB senza lingue, 599,6 kB per utente, CSS 74,8 kB invariato.

### G1a-WP-02, ricerca: forni, guide, estratto (30/10/2026)
Forni e pagine di Impara nell'indice, estratto e sfumatura dei filtri valgono
circa 0,8 kB senza lingue (600,4 kB per utente). Recuperati senza alzare i
limiti: i testi delle fasce del punteggio (`cooking.matchTones`) stanno solo
nel CMS, senza le 15 chiavi uiMessage gemelle in 7 lingue né i ripieghi
italiani di `recipe-match-card.tsx` (i due chiamanti passano sempre il CMS; in
portoghese il riferimento della fascia «t90» puntava a una chiave che non
esisteva, ora c'è il testo); i consigli di olio e frittura in una sola copia
per motore e CMS; `formatOvenFuel` in `format.ts` invece di un chunk minuscolo
condiviso. CSS: tolte 13 regole morte (`glossary-card__chevron`,
`home-step__frame`, `home-step__back`, `home-dietary-warning(s)__*`,
`ingredients-servings__estimate`, `bits-ing-row__amount-note`,
`stat-strip__value-trend`, `troubleshooting-card__chevron*`,
`preferment-guide-card__heading`, `match-info-toggle`). Risultato: 493,8 kB
senza lingue, 597,6 kB per utente, CSS 74,6 kB.

### G1a-WP-03, shell (30/10/2026)
Pizzata ridotta accanto al marchio, etichetta della tab attiva nel dock
compatto, lente della rail con etichetta e nome del pulsante Profilo: circa
0,3 kB senza lingue e 0,07 kB di CSS (le regole morte tolte in WP-02 fanno da
margine). Risultato: 494,1 kB senza lingue, 597,9 kB per utente, CSS 74,6 kB
(76 437 byte su 76 800).

### 30/10/2026: chiavi uiMessage senza lo slug del testo

Integrata G1a sopra main (con G1b e il suo seguito), la build misurava 601,0 kB
per utente. Le 125 chiavi generate dal guard i18n erano `namespace.slug-hash`:
lo slug (fino a 42 caratteri del testo italiano) si ripeteva nel catalogo
italiano, in ogni catalogo straniero e in ogni chiamata. Ora sono
`namespace.hash` (il guard le genera così) e `LOCALE_BUNDLE_REV` passa a 52.
Recuperati circa 2,9 kB per utente (1,8 di codice e 1,0 nel catalogo
giapponese) e circa 1 kB in ciascun catalogo straniero. Dopo: 495,1 kB senza
lingue, 598,2 kB per utente. Le chiavi scritte a mano (`recipe.schedule.…`)
restano leggibili: la regola vale solo per quelle generate.

### 30/10/2026: CSS morto fuori dal foglio di produzione

Il foglio era a 76 676 byte gzip su 76 800 (margine di 124 byte), troppo poco
per il riquadro dell'esito negativo chiesto da Matteo. Le classi di
`theme.css` e `layout.css` sono già tutte citate nel codice (lo controlla
`check:tokens`, regola `dead-composite`): il peso morto stava altrove.

- **Utility Tailwind dei soli strumenti (−2,7 kB gzip).** Tailwind genera le
  utility leggendo tutto `src/`, compresi vetrina DS, `/dev` e `/cms`, che in
  produzione non entrano in `dist/` (P-1). 296 utility (`rounded-tl-[48px]`,
  `lg:grid-cols-[1fr_340px]`, `z-[99996]`, `gap-10`…) erano citate solo lì e
  finivano nel foglio di ogni utente senza corrispondere a nessun elemento. Il
  plugin `vulcan-tool-only-tailwind-sources` (`vite.config.ts`) toglie quei
  file dalla scansione nelle build senza strumenti e fa fallire la build se uno
  di loro entra nel bundle. In sviluppo e in `build:test` il foglio è identico
  a prima (stesso hash). Fuori dall'elenco `debug-overlay.tsx`, che è nel
  bundle anche se in produzione non rende nulla.
- **Regole e dichiarazioni morte (circa 60 byte gzip):**
  `.needs-slot-list__badge--current` (nessun componente la usa più: resta
  solo `--ideal`); la prima `transition` di `.app-shell-profile`, sempre
  sovrascritta dalla regola FW-13 con lo stesso selettore più avanti; in
  `layout.css` il `max-width: var(--measure-6xl)` di `.recipe-view-content`
  in Editorial (stessa media query, sovrascritto da `--measure-3xl` più sotto).

Risultato: CSS 73 945 byte gzip (72,2 kB, 516 kB non compresso; −2 731 byte),
JS invariato. Screenshot di Scopri, ricetta, Crea, profilo, cottura e Impara a
390 e 1280 px, chiaro e scuro: identici a prima.

Restano nel foglio, di proposito: le regole usate solo dalla vetrina o da
`/dev` (`feedback-analysis__*`, circa 0,9 kB gzip, e i componenti DS che il
prodotto non usa ancora: `Carousel`, `Fab`, `Progress`, `Slider`, `Spinner`…),
perché i guard leggono `theme.css` come fonte unica (P-5d); i token in
`STAGED_TOKENS` di `check-design-tokens.mjs`; i token letti solo da
`showcase.css`; i temi `[data-theme]`, raggiungibili in produzione con
`?theme=`. Non toccati i ripieghi di `color-mix()` che Tailwind duplica sotto
`@supports` (circa 43 kB non compressi): servono ai browser senza
`color-mix()` ed è una scelta di supporto, non codice morto.

## L'italiano come le altre lingue (30/10/2026)

Main a 2ad2a2b: **495,4 kB senza lingue, 598,5 kB per utente** (ja), chunk più
grande `index` 95,1 kB. La prossima tranche del catalogo (9 condimenti, circa
3,9 kB di italiano e 3,5 kB di giapponese) non entra. Misure gzip sulla build,
attribuite ai sorgenti con le source map (`dist/assets/*.map`): per ogni
sorgente, quanto cresce il gzip del chunk con i suoi byte.

### Mappa: dove nasce e come si fonde il testo

- **Italiano = la base di tutto.** `CMS_DEFAULTS` (`cms-context.tsx`) è un
  `CmsContent` completo in italiano: ci entrano `UI_MESSAGES_IT` (`messages`),
  i testi di dominio di `domain-i18n-defaults.ts` (prefermenti, problemi,
  glossario, scienza, farine; problemi e glossario derivati da `ISSUES_DB` e
  `GLOSSARY_TERMS`), i messaggi del motore (`METHOD_MESSAGES_IT`,
  `STEP_COPY_IT`, condivisi col motore), diete e allergeni, descrizioni degli
  stili derivate da `STYLES_DB`.
- **Le altre lingue** sono `locales/<id>.ts` (+ `domain-<id>.ts`,
  `ui-messages.<id>.ts`, `topping-i18n/<id>.ts` nel chunk `<id>-toppings`,
  `inspiration-i18n/<id>.ts`), caricate con `import()` da `locales/index.ts`.
- **Fusione** (`CmsProvider`): `cms = deepMerge(base, overrides)` con
  `base = italiano ← inglese ← lingua attiva` (`fallbackBaseFor`). Per le lingue
  straniere `overrides` è lo snapshot dell'intero bundle in `localStorage`
  (`vulcan_cms`, revisione `LOCALE_BUNDLE_REV`), che evita il lampo
  dell'italiano dalla seconda visita; alla **prima** visita si vede l'italiano
  finché il bundle non arriva. `uiMessage()` ricade sul catalogo italiano
  statico.
- **Chi legge l'italiano direttamente**: il valore di default del contesto e
  `update`/`isModified` del provider; `profile.tsx` (dialog del cambio lingua);
  `cms.tsx` (solo con `TOOLS_ENABLED`, non in produzione); 21 file di test. Il
  server (MCP `/mcp`, voce `/api/voice`, Alexa) **non** legge `CMS_DEFAULTS`:
  usa i testi italiani del motore e dei dati, `GLOSSARY_TERMS_DEFAULTS` e le
  `domain-<id>.ts`, e `i18n/format.ts` (via `glossary-data.ts`) chiama
  `uiMessage()`, che oggi trova l'italiano solo perché il catalogo è statico.
- **Completezza**: i test di parità (`locale-parity`, `ui-messages.catalogs`,
  `topping-i18n`, `inspiration-i18n`) esigono ogni testo italiano in ogni
  lingua. Verificato foglia per foglia (anche numeri, media e `messages`):
  **ogni bundle straniero ha tutte le foglie dell'italiano, e de/es/fr/pt/ja
  hanno tutte quelle dell'inglese.** La base italiana e la riserva inglese non
  aggiungono nulla a nessuna lingua: sono solo byte.
- **La riserva inglese si scarica davvero**: il provider carica `en` (che
  importa `en-toppings`) per ogni lingua non italiana, 89,1 kB, e il conto non
  li somma.

### Quanto pesa

| Pezzo | kB gzip | Dove |
|---|---|---|
| `CMS_DEFAULTS` e provider (`cms-context.tsx`) | 25,3 | chunk d'ingresso |
| `UI_MESSAGES_IT` | 16,8 | `ui-messages-it`, contato come codice |
| `domain-i18n-defaults.ts` | 8,9 | chunk d'ingresso |
| Testi italiani nei dati: condimenti (circa 17 dei 29,1 di `topping-library`), `glossary-copy` 5,4, `method-messages` 5,4, `troubleshooting-data` 4,7, `glossary-terms` 3,4, allergeni 2,5, `styles-db` | ~45 | chunk d'ingresso, `topping-library` |
| Riserva inglese (`en` + `en-toppings`) | 89,1 | scaricata da de/es/fr/pt/ja, non contata |

Per lingua (catalogo + condimenti): ja 103,1 · de 97,4 · fr 96,8 · es 93,3 ·
pt 92,9 · en 89,1 kB. Quello che scarica davvero un utente oggi (codice +
lingua + riserva): **ja 687,6**, de 681,9, fr 681,3, es 677,8, pt 677,4, en
584,5, it 495,4 kB. Il conto ne mostra 598,5.

### Piano

1. **Riserva inglese solo se serve (non serve).** La base di una lingua è il
   suo bundle: niente `en` per de/es/fr/pt/ja. Rischio minimo (i bundle sono
   completi, il test lo esige); −89,1 kB reali per cinque lingue su sette.
2. **Italiano caricato come le altre lingue.** `CMS_DEFAULTS` diventa
   `locales/it.ts` (`IT_LOCALE`, chunk `it-…` con `UI_MESSAGES_IT` e
   `domain-i18n-defaults`); la struttura comune è il tipo `CmsContent` più i
   test di parità, che diventano «ogni foglia dell'italiano in ogni lingua».
   Il primo render aspetta il bundle della lingua di avvio (lo splash di
   `index.html` resta qualche millisecondo in più); uno script in `<head>`
   precarica con `modulepreload` il bundle della lingua di avvio insieme al
   chunk d'ingresso, così l'italiano non aggiunge un giro di rete. Il server
   registra da sé il catalogo italiano (`format.ts`). Atteso: circa −45 kB
   senza lingue; la lingua più pesante resta ja.
3. **Conto onesto** in `check-budget.mjs`: l'italiano è una lingua (`it-…`);
   per ogni lingua si sommano i chunk di lingua che il suo bundle importa; il
   controllo fallisce se un chunk di codice importa staticamente un chunk di
   lingua (vorrebbe dire che quella lingua la scaricano tutti).
4. **Dopo, a parte**: i testi italiani dei dati (condimenti, glossario,
   problemi, messaggi del motore) come catalogo `it` per chiave, con i dati
   ridotti alla struttura. È il passo che toglie il doppio peso di ogni
   condimento nuovo, ma tocca il motore e il server (che oggi produce i passi
   in italiano): va pianificato con chi cura dati e server.

Rischi: un bundle incompleto mostrerebbe un campo vuoto invece dell'italiano
(oggi lo impediscono i test di parità, che si rafforzano); il primo avvio
dipende da una richiesta in più se il precaricamento non parte (lo splash
copre l'attesa, nessun testo vuoto o chiave grezza); gli snapshot salvati
restano validi (forma dei bundle invariata).

### Risultato (30/10/2026, ramo `italiano-lazy`)

Fatto in tre passi, ognuno con `verify`, `lint`, build e `check:budget` verdi:

1. **Niente riserva inglese.** La base di una lingua non carica più `en`: il
   test di parità esige ora ogni foglia dell'italiano (anche numeri, media e
   `messages`) in ogni bundle.
2. **Italiano lazy.** `CMS_DEFAULTS` è diventato `IT_LOCALE` in
   `locales/it.ts` (chunk `it-…` con `UI_MESSAGES_IT` e i default di
   dominio); la base di ogni lingua è il suo bundle e basta. `main.tsx`
   aspetta il bundle della lingua di avvio (`bootLocaleId()`); lo script di
   `localePreloadPlugin` lo chiede con `modulepreload` prima del foglio di
   stile (dopo, aspettava il CSS: su 4G lento partiva 1,7 s più tardi). Il
   server MCP e la voce registrano `UI_MESSAGES_IT` da sé; i test e il
   design system mettono in cache l'italiano con `primeLocaleBundle()`.
   Forma dei bundle e degli snapshot invariata: `LOCALE_BUNDLE_REV` resta 52.
3. **Conto onesto** in `check-budget.mjs`: l'italiano è una lingua (deve
   esistere un chunk `it-…`); per ogni lingua si sommano i suoi chunk e i
   chunk di lingua che importano; fallisce se un chunk di codice importa
   staticamente un chunk di lingua; `RUNTIME_FALLBACK` dichiara le riserve
   caricate a runtime (oggi nessuna) e il conto le somma. Stampa il «per
   utente» di ogni lingua.

| Misura (gzip) | main 2ad2a2b | ramo |
|---|---|---|
| JS senza lingue | 495,4 kB (italiano dentro) | **448,0 kB** |
| JS per utente (lingua più pesante, ja) | 598,5 kB | **551,1 kB** |
| Chunk d'ingresso `index` | 95,1 kB | 42,4 kB |
| Chunk più grande | 95,1 kB (`index`) | 79,8 kB (`ja`) |
| Scaricato davvero in it / en / ja (codice + lingua + riserva) | 495,4 / 584,5 / 687,6 kB | 497,9 / 537,2 / 551,1 kB |

Per lingua sul ramo: ja 103,1 · de 97,4 · fr 96,8 · es 93,3 · pt 93,0 ·
en 89,1 · it 49,9 kB. Chi parte in italiano scarica circa 2,5 kB in più di
prima (il chunk `it` e i suoi quattro chunk condivisi al posto del codice
d'ingresso e di `ui-messages-it`), chi parte in un'altra lingua tra 47 e 136
kB in meno.

**Primo caricamento** (vite preview, 390×844, 4G lento e CPU ×4, mediane):
in italiano su Scopri primo render 2597 → 2683 ms e LCP 4956 → 4832 ms (9
prove), sulla ricetta 2553 → 2563 ms e LCP 5832 → 5768 ms (5 prove): nel
rumore. In giapponese alla prima visita il primo testo è già giapponese
(prima l'italiano, poi il cambio), LCP 5496 → 4980 ms e 152 kB in meno.
Provati con Playwright it, en-GB, ja, il cambio lingua dal profilo nei due
sensi, ricetta, Scopri, cottura e gli stati salvati (snapshot di una
revisione vecchia, modifiche CMS italiane senza lingua, JSON rovinato):
nessun errore in console, nessuna chiave grezza.

**Limiti.** Restano 500/600 kB: c'è margine per le tranche B–D del catalogo
(oggi ogni condimento nuovo pesa ancora nel codice in italiano e in ogni
lingua). Proposta per Matteo, dopo le tranche: abbassarli col cricchetto.

**Resta da fare**: il passo 4 del piano (i testi italiani dei dati, circa 45
kB nel codice, a cominciare dai condimenti di `topping-library.ts`, circa
17 kB), da pianificare con chi cura dati e server.

### 30/10/2026: limiti JS abbassati a 465 / 570 kB

Dopo il recupero strutturale (#170, l'italiano caricato come le altre lingue) e
la tranche A2 del catalogo (#171) la build misura 451,0 kB senza lingue e
557,3 kB per utente (ja). Col cricchetto i limiti scendono da 500 / 600 a
**465 / 570 kB**: restano circa 13–14 kB per le prossime tranche, e il margine
recuperato non si consuma senza che nessuno se ne accorga. Matteo: «fai quello
che ritieni giusto».

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
