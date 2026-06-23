4 varianti di Icon Button M3: Standard (no bg), Filled (primary), Filled Tonal (primary-container), Outlined (transparent + border). Toggle state con pulse animation (scale 1→1.3→1). 3 taglie: 32/40/48px.

**Principi**
- Standard: nessun container, solo icona. Per azioni secondarie
- Filled/Tonal: container colorato per azioni prominenti
- Toggle: pulse scale 1→1.3→1 + cambio variant off→on

**Fai**
- Standard per azioni secondarie in toolbar (es. share, more)
- Filled per azioni primarie isolate (es. play, add)
- Toggle con pulse per feedback visivo su like/bookmark/star

**Non fare**
- Mai icon button senza aria-label — l'icona da sola non basta
- Mai standard icon button su sfondo complesso — perde visibilità
- Mai toggle senza feedback visivo (colore + animazione)
