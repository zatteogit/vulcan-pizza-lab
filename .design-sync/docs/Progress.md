Progress Indicators in due forme: Linear (barra orizzontale) e Circular (anello SVG). Entrambi hanno varianti determinate (con %) e indeterminate (loop infinito). Spring per determinato, easing fluido per indeterminato.

**Principi**
- Determinato: spring animation per il progresso, valore numerico visibile
- Indeterminato: loop fluido infinito (linear 1.8s per linear, rotate 1.4s per circular)
- Track sempre visibile (surface-container-high) per contesto

**Fai**
- Determinato: mostrare sempre la % per feedback preciso
- Indeterminato: usare solo quando il tempo è sconosciuto
- Circular per spazi ridotti, Linear per sezioni ampie

**Non fare**
- Mai progress senza track — l'utente perde il contesto 0-100%
- Mai animare il determinato con duration/ease — usare spring
- Mai mescolare linear e circular nello stesso contesto
