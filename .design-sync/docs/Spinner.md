Il Loading Indicator comunica che il contenuto sta arrivando. 3 pattern distinti: Skeleton shimmer (placeholder strutturato), Pulsing dots (attesa breve), e Branded loader (anello SVG con VulcanMark). Diverso dai Progress Indicators che comunicano un progresso quantificabile.

**Principi**
- Skeleton shimmer: placeholder che replica dimensioni esatte del contenuto finale (zero CLS)
- Pulsing dots: 3 cerchi con stagger 0.2s, per attese brevi (< 3s)
- Branded loader: anello SVG rotante con VulcanMark al centro per caricamenti app-level

**Fai**
- Skeleton per contenuto strutturato (card, liste, dettagli) — mantiene il layout
- Pulsing dots per attese brevi e generiche (salvataggio, invio)
- Branded loader solo per il caricamento iniziale dell'app

**Non fare**
- Mai skeleton con dimensioni diverse dal contenuto finale — causa layout shift
- Mai loading indicator per operazioni < 200ms — feedback istantaneo è sufficiente
- Mai animazioni pesanti — il dispositivo sta già lavorando
