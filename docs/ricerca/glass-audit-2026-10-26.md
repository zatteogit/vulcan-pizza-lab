# Audit dei pannelli glass — 26 ottobre 2026

## Causa osservata

La scheda della ricetta mostrava la foto quasi nitida sotto l'eyebrow, con una separazione netta al termine della foto dietro il titolo. Nella build di produzione il filtro calcolato da Chrome era `none`, benché il sorgente dichiarasse un blur di 24px.

Le coppie CSS erano ordinate `backdrop-filter`, poi `-webkit-backdrop-filter`. L'ottimizzazione Lightning CSS usata da Tailwind 4.1.12 conservava soltanto l'ultimo alias. Nel CSS emesso rimaneva la proprietà prefissata, ignorata dal Chrome del collaudo. Il problema riguardava anche navigazione, profilo, badge e barre dei dettagli; non era un problema dell'immagine.

La riproduzione locale del minificatore e il CSSOM del browser distinguono il difetto dall'assenza di supporto: Chrome supportava il filtro standard, che era assente dal foglio compilato. Ricaricare senza correggere la build riproduceva lo stesso difetto.

## Correzioni

- Proprietà WebKit prima della proprietà standard in tutte le coppie CSS. Il foglio compilato mantiene ora entrambe.
- Nessun cambiamento delle opacità normali dei temi: il vetro usa finalmente i materiali già previsti dal sistema. La direzione Editorial mantiene intenzionalmente il titolo privo di vetro su desktop.
- Due token di fallback condivisi rendono opache le superfici e disattivano i filtri con `prefers-reduced-transparency: reduce` oppure in assenza di supporto. Usati dalle superfici CSS e dalle due varianti glass del ModalSheet. Le piccole azioni bianche sulle foto mantengono la tinta scura di contrasto.
- L'intensità del blur della scheda ricetta non viene più interpolata durante il cambio sezione. Movimento, geometria e transizione del fondo restano separati dal filtro.
- `check:glass` ispeziona i CSS emessi, non solo il sorgente. Entrambe le build, normale e con strumenti, lo eseguono. Le prove includono l'alias solo WebKit (errore originale), solo standard, dati vuoti, CSS raggruppato/nidificato, variabili differenti per piattaforma e override intenzionali `none`.

## Verifiche

- Build normale: 34 regole glass mantengono entrambe le proprietà. Build con strumenti: 47. Cinque prove del controllo superate.
- Chrome: intestazione ricetta in tre temi × chiaro/scuro × 390/768/1440px; nessun overflow. Immagini e valori calcolati acquisiti a transizioni stabilizzate.
- Chrome: Scopri, Crea, Profilo e Ricetta in chiaro/scuro, a 390 e 1440px. Ispezionati i materiali delle superfici effettivamente montate.
- Dettagli stile: barre superiore/inferiore, CTA e chiusura verificate dopo lo scroll del corpo, su desktop/mobile e in entrambi i modi.
- WebKit: intestazione a 390/1440px, chiaro/scuro; filtri standard e WebKit presenti e applicati. Verificata anche la modale glossario W, che usa ModalSheet con filtro 24px, oltre alla modale About volutamente solida.
- Chrome, preferenza nativa di trasparenza ridotta emulata tramite DevTools: intestazione e modale diventano opache, filtro `none`. Questa verifica non rappresenta un test su hardware iPhone fisico.

Prove e screenshot locali: `output/glass-audit-2026-10-26/`. Nessun dato personale o impostazione globale del tema viene cambiato: i contesti browser sono sessioni di collaudo dedicate.

## Riferimenti

- [Lightning CSS — Transpilation and vendor prefixing](https://lightningcss.dev/transpilation.html): comportamento dei prefissi in relazione ai browser target. La causa specifica è stata verificata sulla versione installata e sulla build del progetto.
- [Tailwind Vite plugin](https://github.com/tailwindlabs/tailwindcss/blob/main/packages/%40tailwindcss-vite/README.md): distinzione fra sviluppo e ottimizzazione della build. Le API della versione corrente online non vengono presunte disponibili nella versione 4.1.12 installata.
