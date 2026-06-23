Toast temporanee con 4 varianti semantiche: info (primary), success (cta), warning (tertiary), error (destructive). Auto-dismiss a 4 secondi, dismissibili con ×, opzionalmente con azione inline.

**Principi**
- 4 varianti: info, success, warning, error — colore e icona derivati dal tipo
- Entrance: spring (stiffness 400, damping 25) con y +12 e scale 0.95
- Exit: opacity 0, x +80, scale 0.9 per effetto 'swipe away'
- Auto-dismiss: 4000ms — il timer si mette in pausa al hover (Completato)

**Fai**
- Auto-dismiss a 4 secondi — tempo sufficiente per leggere
- Icona semantica + colore per identificazione rapida del tipo
- Azione inline (Annulla, Riprova) per feedback contestuale

**Non fare**
- Mai più di 3 toast visibili contemporaneamente — stacking max 3
- Mai toast senza possibilità di dismiss — sempre il bottone ×
- Mai toast per informazioni critiche — usare un dialog modale
