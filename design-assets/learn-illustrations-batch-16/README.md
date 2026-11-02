# Impara · Lotto 16

Quattro illustrazioni nuove per gesti ancora poco illustrati in **Problemi e soluzioni**, preparate dal main `37c88d0c66ba029d467eb7d2cc37d1918ee52107`. Approvate da Matteo il 2026-11-02 e integrate in Problemi e soluzioni. Le prove del rilascio sono separate dalla galleria in `/Users/matteo/dev/Vulcan/output/learn-illustration-release-16-2026-11-02/`.

| Tavola | Collocazione proposta | Che cosa chiarisce |
| --- | --- | --- |
| `dough-tear-pinching` | P02 · Impasto che si strappa | Avvicinare e richiudere un piccolo strappo prima del riposo |
| `gentle-bubble-press` | P08 · Bolle grandi irregolari | Pressione locale delicata prima della stesura, senza schiacciare il bordo |
| `plain-parbaked-base` | P09 / P18 · Fondo poco cotto / centro acquoso | Base precotta ancora senza condimento; solo quando il metodo la prevede |
| `fried-piece-interior` | FR01 · Fritto dorato fuori, crudo dentro | Aprire un pezzo di prova per controllare anche l’interno |

## File

- `assets/`: quattro WebP alpha a 672 × 448, 139322 byte complessivi.
- `review.html`: galleria con sole didascalie utili e sfondo chiaro/scuro.
- `prompts.json`: prompt completi, foto reali, autore, ruolo, ricomposizioni e limiti.
- `manifest.json`: hash dei WebP, master e riferimenti fotografici.
- `edits.json`: generazioni e varianti conservate, con motivi della selezione.
- `coverage.md`: verifica delle sezioni e scelta dei gesti.
- `build.py`: solo ridimensionamento/esportazione e generazione della galleria.

Master, foto di ricerca e prove visive sono conservati in `/Users/matteo/dev/Vulcan/output/learn-illustration-batch-16-2026-11-02/`. Le foto originali non sono asset dell’app e non sono ridistribuite nella galleria. I riferimenti d’ispirazione restano interni, come richiesto da Matteo; eventuali attribuzioni di adattamenti licenziati e fonti scientifiche esistenti restano inalterate.

## Fedeltà e limiti

Le mani, il contatto con l’impasto, la base precotta e la sezione del fritto partono da fotografie effettivamente aperte e controllate. Le prime due tavole sono ricomposizioni dichiarate: la foto del pizzico mostra la cucitura di un panetto; la foto della bolla mostra un impasto non ancora steso. Non vengono presentate come fotografie del gesto finale. La base KAB appartiene a un metodo di precottura per congelamento: nell’illustrazione si usa soltanto l’aspetto della base nuda, senza importarne tempi o conservazione. Il fritto sezionato non è un confronto crudo/cotto, né un criterio di sicurezza basato sul colore.

Generazione con il tool integrato **Imagegen**, una chiamata distinta per tavola, con stile a penna terracotta/avorio. Una variante più piatta è stata prodotta per ciascuna scena e conservata; non è stata selezionata perché perdeva le velature dello stile approvato. L’alone visibile nell’anteprima RGB cade in pixel trasparenti: l’esame del canale alpha e la composizione su sfondi chiaro/scuro confermano la sagoma pulita delle versioni scelte. Nessun ritocco o scontorno manuale in Python: solo copie, conversione/ridimensionamento ed elaborati di verifica.

## Verifica

Tutte le quattro immagini sono caricate a larghezza naturale 672 nella galleria a 1280px e 390px, su chiaro e scuro; didascalie presenti, nessun collegamento ai riferimenti e nessun overflow orizzontale. Prove in `verification.json` e `gallery-desktop-{light,dark}.png`, `gallery-mobile-{light,dark}.png` nella cartella output. Questa verifica della galleria precede l’integrazione. Gli asset precedenti sono conservati.

Per ricostruire:

```sh
python3 design-assets/learn-illustrations-batch-16/build.py
```

## Integrazione e verifiche locali

Le quattro tavole sono inserite in P02, P08, P09, P18 e FR01, con didascalie nelle sette lingue. Le scene di stesura, forno, sgocciolatura e dosaggio della salsa restano disponibili nei rispettivi consigli; in P08 la pressione locale prende il posto della stesura generica, conservata negli altri punti. Nessuna modifica a ricette, formule o soglie.

Typecheck, 136 file di test (1770 passati, 1 saltato), guard del repository, build e budget superati. JS massimo 569.5/570 KiB gzip e immagini 33.7/38 MB. I cinque inserimenti sono caricati a 1280px e 390px, con didascalie, nessun link d’ispirazione e nessun overflow. I WebP coincidono con gli hash approvati.
