Il BottomSheet è una modale dal basso con 3 snap point (peek 25%, half 50%, full 85%). Drag handle per il gesture, backdrop semi-trasparente, spring physics per le transizioni. Usato su mobile per dettagli ricetta.

**Principi**
- 3 snap point: peek (anteprima), half (default), full (dettaglio completo)
- Spring physics (stiffness 400, damping 30) per tutte le transizioni
- Backdrop rgba(0,0,0,0.35) con click-to-dismiss

**Fai**
- Default snap a 'half' — il contenuto principale è subito visibile
- Drag handle visibile e riconoscibile (32×4px, rounded-full)
- Backdrop click chiude lo sheet — pattern universale mobile

**Non fare**
- Mai sheet senza backdrop — l'utente perde contesto
- Mai animazioni con duration/ease — sempre spring physics
- Mai contenuto scrollabile senza indicatore di overflow
