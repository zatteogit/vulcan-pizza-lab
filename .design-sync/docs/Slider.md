Gli slider sono il controllo fine-tuning principale di Vulcan. Track sottile con fill accent, thumb circolare con ombra, e label numerica DM Mono con tabular-nums per cifre allineate.

**Principi**
- Track: h-1.5, surface-container-high bg, rounded-full
- Fill: primary color, larghezza proporzionale al valore
- Label: DM Mono con tabular-nums e fontFeatureSettings 'tnum'

**Fai**
- Mostrare sempre il valore numerico corrente accanto al label
- Usare tabular-nums per evitare jump del layout durante il drag
- Range min/max coerenti con i parametri dello stile selezionato

**Non fare**
- Mai slider senza label testuale — il valore da solo non basta
- Mai rimuovere il thumb visuale — l'input nativo è invisible
- Mai step discreti non multipli — usare step=1 di default
