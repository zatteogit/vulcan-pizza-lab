Due tipi di tooltip M3: Plain (breve, solo testo, appare su hover) e Rich (titolo + body, appare su click o hover prolungato). Entrambi con entrata spring e posizionamento sotto il trigger.

**Principi**
- Plain: inverse-surface bg, testo breve (max 1 riga), hover only
- Rich: surface-container-high bg con bordo, titolo + body, click/hover
- Spring stiffness:500 damping:25, translateY 6→0px + scale 0.95→1

**Fai**
- Plain per spiegare icone senza label — hover mostra il significato
- Rich per informazioni contestuali che richiedono titolo + corpo
- Posizione sotto il trigger, centrato — evitare di coprire il contenuto

**Non fare**
- Mai tooltip per informazioni critiche — non sono accessibili su mobile
- Mai testo lungo in plain tooltip — max 1-2 parole
- Mai tooltip su elementi già chiari (es. bottone con label)
