Il FAB è il bottone flottante per l'azione primaria. 3 varianti: Standard (56px cerchio), Small (40px), Extended (rettangolo con label). 3 colori: Primary, Surface, Tertiary. Shadow e scale reagiscono al press.

**Principi**
- Un solo FAB per schermata — è l'azione principale
- Shadow reattiva: elevation-2 rest, elevation-1 press, elevation-3 hover
- Extended FAB mostra label + icona per chiarezza

**Fai**
- Un solo FAB per schermata — l'azione primaria unica
- Extended FAB per azioni che richiedono chiarezza (label + icona)
- Shadow reattiva al press per feedback fisico

**Non fare**
- Mai due FAB nella stessa schermata
- Mai FAB per azioni secondarie — usare un bottone standard
- Mai rimuovere l'ombra — il FAB deve flottare
