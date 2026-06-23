Tabs con indicator animato via spring. Due varianti: Primary (icon + label) con indicator misurato dinamicamente via ref, e Secondary (solo testo) con layoutId per shared layout animation.

**Principi**
- Indicator spring stiffness:400 damping:30 per movement fluido
- Primary: icon 18px + label. Secondary: solo label
- Tab attivo: primary color, weight 700. Inattivo: on-surface-variant, weight 500

**Fai**
- Primary tabs per sezioni con icona contestuale (Configura, Stili, Ricetta...)
- Secondary tabs per sotto-sezioni testuali senza icona
- Indicator spring-based per feedback di navigazione fluido

**Non fare**
- Mai più di 5-6 tabs — oltre, usare scrollable tabs o menu
- Mai mescolare primary e secondary tabs nella stessa barra
- Mai tabs senza contenuto sotto — l'utente si aspetta un cambio vista
