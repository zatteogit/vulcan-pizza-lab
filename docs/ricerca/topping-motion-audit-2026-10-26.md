# Cambio condimento nella timeline — 26 ottobre 2026

## Causa riprodotta

Il blocco animato aveva come chiave l'ID del condimento e conteneva anche il selettore. Al cambio veniva sostituito tutto il sottoalbero, con animazione di uscita prima dell'ingresso. Nel browser il vecchio selettore risultava scollegato dal DOM; la posizione orizzontale passava da 1781 a 628 px. Inoltre `scrollIntoView` poteva scorrere gli antenati e la pagina.

## Modifica

- Il selettore resta montato fuori dal corpo variabile. Focus, scroll e stato dei suoi controlli rimangono disponibili durante il cambio.
- Preparazione, descrizione, durata e dettagli cambiano insieme sotto al selettore. Una dissolvenza breve accompagna il cambio senza una coda di uscita o un intervallo vuoto; l'altezza segue il contenuto con una transizione separata.
- La chiave della riga segue la fase di assemblaggio e il suo indice, così gli ID specifici di un altro condimento non fanno rimontare l'intera riga. Operazioni successive nella stessa fase restano distinte.
- Una scelta già visibile non viene ricentrata. Per una scelta esterna alla porzione visibile si muove solo la lista orizzontale, del minimo necessario.
- Con movimento ridotto, il contenuto e lo scroll si aggiornano direttamente. Se manca ResizeObserver, il corpo mantiene l'altezza naturale.

## Collaudo

- Chrome, 390 e 1440 px: Nerano → Marinara → Nerano, con campionamento per 55 frame a ogni cambio. Selettore e riga identici nel DOM, opacità del selettore sempre 1, focus sulla scelta premuta, nessun riposizionamento orizzontale. Spostamento visibile verticale massimo inferiore a 1 px.
- WebKit, 390 px: sequenza rapida Nerano → Marinara → Scarpetta → Nerano, con movimento normale e ridotto. Alla fine è presente l'ultima scelta, con descrizione/preparazione corrette e altezza del contenitore uguale a quella del contenuto; nessun overflow.
- I messaggi CORS del server di sviluppo verso `/api/config` sono registrati separatamente nei log WebKit; non sono errori dell'animazione.
- 600 test passati, uno saltato; typecheck, controlli del progetto, build, verifica glass e budget degli asset superati.

Evidenze: `output/playwright/topping-motion/`. Le prove WebKit non equivalgono a un collaudo su hardware iPhone fisico.
