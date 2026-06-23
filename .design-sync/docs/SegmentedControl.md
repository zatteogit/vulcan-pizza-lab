Il Segmented Button è un toggle a segmenti per selezione mutualmente esclusiva. Il segmento attivo ha container filled con Check animato. Usato per scelte di tipo forno, vista ricetta, e toggle binari raggruppati.

**Principi**
- Selezione mutualmente esclusiva — un solo segmento attivo alla volta
- Check icon animato (spring 500/20) sul segmento attivo
- Container unico rounded-2xl con outline-variant border

**Fai**
- Max 5 segmenti — oltre, usare Tabs o Dropdown
- Label brevi (1-2 parole) per leggibilità su mobile
- Check icon animato per conferma visiva della selezione

**Non fare**
- Mai segmented button per selezione multipla — usare Chip
- Mai mescolare segmenti con icona e senza icona nello stesso gruppo
- Mai usare per navigazione tra pagine — è per toggle di stato
