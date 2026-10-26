# Selezione con spunta — 26 ottobre 2026

Il controllo dei livelli di esperienza mostrava uno scatto finale: il contenitore della spunta arrivava a larghezza zero, ma il `gap` del flex restava fino allo smontaggio del nodo. Il campionamento sul sito pubblico ha rilevato uno spostamento istantaneo di **8 px**, da 346,5 a 338,5 px, quando il numero di figli passava da due a uno.

Il nuovo `SelectionMark` mantiene montato il contenitore e anima insieme simbolo e spazio laterale. Il flex esterno non possiede più un gap da rimuovere all'ultimo frame. Una transizione CSS senza rimbalzo governa la larghezza; opacità e scala del segno sono separate. Con icona alternativa lo spazio rimane costante e cambia solo il simbolo. Con movimento ridotto le transizioni vengono disattivate.

La correzione copre `Chip` e gli stessi schemi duplicati nella selezione rapida di farine e lieviti. Sono conservati gli spazi precedenti, compreso quello più stretto delle farine. Token semantici e del componente seguono i livelli del design system; il componente è presente nel suo catalogo.

Verifiche:

- Chrome e WebKit, 390/1440 px: quattro cambi di livello per dimensione, 50 frame per cambio. Contenitore sempre connesso, numero di figli costante, larghezza finale zero. Spostamento massimo per frame nella coda della chiusura inferiore a 1 px; nessuno smontaggio finale.
- Movimento ridotto e selezione/deselezione di farina e lievito: controlli persistenti e gap esterno zero.
- 602 test passati, uno saltato; typecheck, guardie del progetto, build e budget degli asset superati.

Evidenze locali: `output/playwright/chip-motion/`. Le prove WebKit non sostituiscono un collaudo su hardware iPhone fisico.
