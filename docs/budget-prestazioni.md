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
