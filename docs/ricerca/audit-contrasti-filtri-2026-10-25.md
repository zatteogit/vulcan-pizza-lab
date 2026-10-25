# Contrasti dei filtri di Crea

25 ottobre 2026. Barra del contesto, pannelli Cucina/Dispensa/Livello, scelta dell’orario e menu di selezione; controllati anche i chip filtro condivisi.

## Criteri e metodo

Riferimenti: [WCAG 2.2, contrasto del testo](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html), almeno 4,5:1 per il testo normale, e [contrasto degli elementi non testuali](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html), almeno 3:1 per gli indicatori necessari a riconoscere controlli e stati. Per prudenza la misura ha usato 4,5:1 anche per i testi più grandi e 3:1 anche per le icone ridondanti con una label.

Misure dai colori calcolati dal browser, con composizione delle trasparenze e controllo degli estremi dei gradienti. Nessun campionamento dei bordi antialias dei caratteri. Verificati stato normale, hover, selezione con hover, focus da tastiera, voci dei menu e badge “Recente”.

Copertura: tre temi grafici (originale, Sfornata, Editorial), modalità chiara e scura, larghezze 390 e 1440 px; movimento normale e ridotto nei ricontrolli della barra. La matrice completa è stata seguita da verifiche mirate sui controlli corretti: 492 campioni finali di stato, 8.244 misure di testo/icona, più 18 sequenze delle transizioni.

## Difetti riprodotti

- Sul desktop la media query azzerava lo sfondo della tab selezionata, conservando il testo del riempimento attivo: rapporto circa 1,09:1 in chiaro e 1,02:1 in scuro.
- L’opacità riduceva troppo il contrasto di temperature, W e icone: fino a 2,82:1 per le W, circa 3,53:1 per la temperatura del forno selezionato e 1,54:1 per l’icona di aiuto.
- In alcuni temi le etichette dei Select usavano il colore di marca, non il ruolo del testo: 4,29–4,34:1. Una spunta nel tema Sfornata arrivava a 2,91:1.
- La dissolvenza contemporanea di riempimento e testo creava un passaggio poco leggibile: circa 1,26:1 durante la selezione, anche con gli stati finali corretti. Anche i figli che ereditano il colore devono cambiare insieme alla superficie.

## Correzioni

- La coppia testo/sfondo selezionata resta integra a ogni breakpoint; l’hover inattivo non sovrascrive lo stato attivo.
- Dati e icone informative non usano più trasparenze che ne riducono la leggibilità. Dimensione e peso del testo conservano la gerarchia.
- Le icone degli orari hanno una tinta sufficientemente distinta dalla loro superficie; spunte e badge recenti usano coppie di colori adatte a entrambi i modi.
- Label e intestazioni dei Select usano il ruolo `text-accent`. La voce attiva da tastiera ha una banda interna a contrasto, distinta dalla spunta della voce selezionata.
- Gli anelli di focus e dello stato aperto usano il colore pieno del ring. I bordi decorativi non sono l’unico modo di riconoscere un controllo: rimangono testo e icone leggibili.
- Testo e riempimento cambiano insieme, compresi i discendenti; movimento, ombra e bordo possono restare animati. La regola vale anche per i primitivi Chip e FilterChip.

## Risultati finali

Minimi del campione finale; i rapporti qui sono arrotondati, ma l’esito è calcolato sui valori non arrotondati.

| Tema | Modo | Testo | Icone | Anello di focus |
|---|---|---:|---:|---:|
| Originale | Chiaro | 4,77:1 | 3,48:1 | 6,20:1 |
| Originale | Scuro | 5,16:1 | 4,24:1 | 6,90:1 |
| Sfornata | Chiaro | 4,61:1 | 3,30:1 | 5,44:1 |
| Sfornata | Scuro | 5,16:1 | 4,24:1 | 6,70:1 |
| Editorial | Chiaro | 4,53:1 | 3,50:1 | 4,29:1 |
| Editorial | Scuro | 5,62:1 | 4,35:1 | 5,62:1 |

Nessuna violazione residua nel campione finale. La banda della voce attiva nei menu raggiunge almeno 3,75:1; il testo durante le transizioni ricontrollate resta almeno a 4,96:1. Gli anelli di focus rimangono visibili anche con hover e selezione combinati.

Verifica del progetto: 505 test superati e uno saltato, typecheck e guard del progetto superati; build e budget prestazionali rispettati. La modifica riguarda la presentazione: vincoli, punteggi e ricette del motore non cambiano.
