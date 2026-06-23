Lo Switch è un toggle on/off con thumb morfante. Il thumb cambia dimensione (16→24px) e mostra un Check icon quando attivo. Track cambia colore da switch-background a primary. Usato per PizzaNerd, Dark Mode, Pre-fermento.

**Principi**
- Thumb morfante: 16px (off) → 24px (on) con Check icon animato
- Spring physics (500/25) per thumb e icon separatamente
- Track colore: switch-background (off) → primary (on)

**Fai**
- Label e descrizione sempre visibili accanto allo switch
- Stato on/off chiaramente distinguibile (colore + dimensione thumb)
- role='switch' con aria-checked per screen reader

**Non fare**
- Mai switch senza label — l'utente non sa cosa sta togglando
- Mai usare switch per azioni irreversibili — usare un dialog di conferma
- Mai cambiare lo stato programmaticamente senza feedback visivo
