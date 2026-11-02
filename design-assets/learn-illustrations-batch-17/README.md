# Impara · Lotto 17

Tre proposte locali per Metodo e fonti e la spiegazione del thickness factor. **Non ancora integrate o pubblicate.** Base aggiornata a GitHub `origin/main`, commit `d958ecb356538bcaefbe178f9701c36e86a784a4` (PR #200).

| Tavola | Collocazione proposta | Utilità |
| --- | --- | --- |
| `salt-before-flour` | Metodo · Il sale nella Napoletana STG | Rendere visibile l’aggiunta del sale all’acqua prima della farina |
| `rectangular-pan-measuring` | Metodo / Glossario · Thickness factor | Misura interna del lato lungo; la didascalia richiede anche il lato corto |
| `round-pan-measuring` | Metodo / Glossario · Thickness factor | Diametro interno lungo il centro, distinto da raggio e bordo esterno |

## File e conservazione

- `assets/`: tre WebP alpha 672 × 448, **90968 byte** complessivi.
- `review.html`: galleria senza riferimenti d’ispirazione visibili, con sfondi chiaro/scuro.
- `prompts.json`: prompt finali completi, fonti, autori, ruoli fotografici e ricomposizioni.
- `manifest.json`: hash di asset, master e foto di riferimento.
- `edits.json`: generazioni e varianti conservate.
- `salt-edit-prompt.txt` / `salt-alpha-prompt.txt`: prompt delle revisioni intermedie non selezionate.
- `coverage.md`: audit e motivazione della scelta.
- `build.py`: esportazione e galleria riproducibili; richiede Pillow.

Foto di ricerca, master e verifiche in `/Users/matteo/dev/Vulcan/output/learn-illustration-batch-17-2026-11-02/`. Le fotografie originali restano riferimenti interni: non sono distribuite come asset dell’app o nella galleria. Prompt e illustrazioni realizzati con **Imagegen integrato**, con chiamate distinte per ciascun soggetto. Nessun ritocco generativo, scontorno o correzione alpha tramite Python; Pillow serve per ridimensionamento/conversione e fogli di verifica.

## Riferimenti e limiti

Il sale parte dalla fotografia di Elena Davis che mostra effettivamente un piattino di sale sopra una ciotola d’acqua. Il piattino è inclinato in una nuova composizione: si vede l’aggiunta, non si pretende di osservare o misurare la dissoluzione, né si copia una dose. La sequenza STG continua a dipendere dal disciplinare già citato nell’app. La foto inizialmente trovata su La Cucina Italiana è stata scartata perché, nonostante la didascalia sul sale, mostra un impasto con farina già presente.

Le misure delle teglie si basano sulle foto di Janice Lawandi / The Bake School. La teglia quadrata della foto viene ricomposta come rettangolare poco profonda. La riga poggia sui bordi come nei riferimenti, attraverso l’apertura; la misura si riferisce agli spigoli interni, non alla flangia esterna. La tavola tonda attraversa il centro. Tacche semplificate senza numeri: nessun diametro, dimensione o lettura da copiare, nessun valore scientifico o risultato sperimentale incorporato nel raster.

La prima versione del sale produceva filamenti bianchi poco credibili; le revisioni di modifica avevano problemi di alpha o texture. È stata selezionata una nuova generazione dallo stesso riferimento fotografico, con piccoli frammenti separati e alpha pulito. Le altre due tavole mantengono la prima versione.

## Verifiche

Allineamento del checkout prima del nuovo lotto: HEAD e `origin/main` coincidono a `d958ecb3`, differenza dei file versionati nulla, vecchio ramo del lotto 16 conservato e cinque PNG locali non versionati preservati. L’app locale è stata ricostruita da quel commit: build e budget superati; la pagina `/learn/metodo#versione` mostra `d958ecb3`. Prove: `local-alignment-build.log`, `local-aligned-version.png` e `alignment.json` nell’output.

Le tre immagini sono caricate a larghezza naturale 672 nella galleria su desktop 1280px e mobile 390px, sia su chiaro sia su scuro; didascalie presenti, zero link e nessun overflow orizzontale. Alpha, composizione e materiali controllati sui due sfondi. Prove in `verification.json` e `gallery-{desktop,mobile}-{light,dark}.png`. Nessun asset precedente o codice prodotto modificato dal nuovo lotto.

Per ricostruire gli export e la galleria:

```sh
python3 design-assets/learn-illustrations-batch-17/build.py
```
