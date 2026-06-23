Il chip è l'unità di selezione principale in Vulcan. Supporta toggle singolo e multiplo. Lo stato attivo mostra un Check animato con spring (stiffness: 500, damping: 25).

**Principi**
- Inattivo: surface-container bg, outline-variant border
- Attivo: primary bg con Check icon che scala da 0 a 1 via spring
- Transizioni colore via CSS transition (background 0.15s) — mai spring per colori

**Fai**
- Usare AnimatePresence mode='wait' per swap icona ↔ check
- active:scale-95 per feedback tattile su click
- Colori transizionati via CSS transition — non spring per colori

**Non fare**
- Mai più di 7 chip in una riga — wrappare con flex-wrap
- Mai usare whileTap di motion — usare active:scale-95 CSS
- Mai omettere l'icona — il chip senza icona perde identità
