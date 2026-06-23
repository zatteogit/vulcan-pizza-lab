Radio Button per selezione esclusiva in un gruppo. Cerchio esterno (20px outline) con dot interno (10px primary) animato spring con overshoot. Due layout: verticale con descrizione e orizzontale compatto.

**Principi**
- Selezione mutualmente esclusiva — un solo radio attivo per gruppo
- Dot interno spring stiffness:600 damping:18 per overshoot naturale
- Verticale per opzioni complesse (con desc), orizzontale per scelte rapide

**Fai**
- Verticale con descrizione per opzioni che richiedono contesto (tipo forno, tipo lievito)
- Orizzontale compatto per 2-4 opzioni brevi
- role='radiogroup' + role='radio' + aria-checked per accessibilità completa

**Non fare**
- Mai radio button per selezione multipla — usare checkbox
- Mai più di 6-7 opzioni — considerare un dropdown/select
- Mai pre-selezionare un'opzione senza motivo — evitare bias
