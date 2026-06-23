Dialog M3 con 3 varianti: Alert (1 azione, info/warning), Confirmation (2 azioni, scelta binaria), Full-screen (slide-up, azioni complesse). Scrim 32% nero, radius 28px, spring entrance dal centro.

**Principi**
- Scrim backdrop rgba(0,0,0,0.32) con click-to-dismiss (solo Confirm)
- Scale 0.85→1 per Alert/Confirm, slide Y 40→0 per Full-screen
- Spring stiffness:400 damping:25 per entrata fluida

**Fai**
- Alert per informazioni importanti che richiedono conferma (es. eliminazione)
- Confirmation per scelte binarie (es. Annulla/Conferma)
- Full-screen per form complessi o contenuti che richiedono spazio

**Non fare**
- Mai dialog per messaggi non critici — usare snackbar o toast
- Mai più di 2 azioni in Alert/Confirm — usare full-screen
- Mai dialog senza via d'uscita (Escape, X, o scrim click)
