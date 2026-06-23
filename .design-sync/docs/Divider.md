Il Divider è un separatore visivo minimo (1px outline-variant). 3 varianti: Full-bleed (tutta la larghezza), Inset (allineato al contenuto), Verticale (tra elementi inline). Nessuna animazione — è un elemento strutturale puro.

**Principi**
- 1px outline-variant — mai più spesso
- Inset allineato al leading element (es. 44px con avatar)
- Verticale: height 24px default, inline con flex items

**Fai**
- Full-bleed per separare sezioni maggiori
- Inset per separare item in una lista con leading element
- Verticale per separare metriche inline (stat strip)

**Non fare**
- Mai divider tra ogni elemento — usare gap/spacing
- Mai spessore > 1px — non è un bordo decorativo
- Mai colore diverso da outline-variant — è un elemento neutro
