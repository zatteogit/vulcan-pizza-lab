Select con dropdown animato spring-based. Il trigger ha bordo che transisce a primary su apertura, chevron che ruota 180°, e menu con scaleY + opacity. Item con hover state layer e Check icon per selezione.

**Principi**
- Trigger: outline-variant → primary border con glow su apertura
- Dropdown: spring stiffness:500 damping:28, scaleY origin top
- Item: 5% primary hover, 10% + Check per selected

**Fai**
- Label flottante per contesto quando un valore è selezionato
- Raggruppare le opzioni con header (es. Standard/Forte/Speciale per farine)
- Chiudere il dropdown su selezione, click fuori, o Escape

**Non fare**
- Mai dropdown con più di 15-20 item senza ricerca — aggiungere search
- Mai placeholder come unico indicatore — usare label persistente
- Mai dropdown senza maxHeight + scroll per liste lunghe
