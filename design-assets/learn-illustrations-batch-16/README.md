# Impara · Lotto 16

Quattro illustrazioni nuove per gesti ancora poco illustrati in **Problemi e soluzioni**, preparate dal main `37c88d0c66ba029d467eb7d2cc37d1918ee52107`. Sono proposte locali, non integrate o pubblicate.

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

Tutte le quattro immagini sono caricate a larghezza naturale 672 nella galleria a 1280px e 390px, su chiaro e scuro; didascalie presenti, nessun collegamento ai riferimenti e nessun overflow orizzontale. Prove in `verification.json` e `gallery-desktop-{light,dark}.png`, `gallery-mobile-{light,dark}.png` nella cartella output. Nessun codice prodotto o asset precedente modificato; nessun deploy effettuato per questo lotto.

Per ricostruire:

```sh
python3 design-assets/learn-illustrations-batch-16/build.py
```
