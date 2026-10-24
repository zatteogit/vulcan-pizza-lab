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
| JS totale emesso (gzip) | 769 kB in 65 chunk (642 prima dei condimenti tradotti) | 900 kB |
| CSS (gzip) | 61 kB (443 kB non compresso) | 75 kB |
| Video più grande | 0,65 MB (`napoletana_stg.mp4`; era 14,6) | 1 MB |
| Video totali | 2,6 MB (6 file; erano 48,6) | 3 MB |
| Immagini totali | 38,5 MB (254 file WebP) | 42 MB |

Il controllo gira in CI dopo la build (`.github/workflows/verify.yml`). I limiti
sono un cricchetto: si abbassano quando si migliora, non si alzano per far
passare lavoro nuovo. Con la traduzione dei condimenti (I18N-2) ogni bundle di
lingua cresce di circa 20 kB gzip (ja: 65 kB in tutto); si scarica solo quello
della lingua attiva.

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
