Checkbox M3 con 3 stati: unchecked, checked (Check icon), indeterminate (Minus icon). Animazione spring-based per check/uncheck. Supporto per label singola o con testo di supporto. Usato per Dietary, Equipment, Pantry.

**Principi**
- 3 stati: unchecked (outline), checked (primary + Check), indeterminate (primary + Minus)
- Spring stiffness:500 damping:20 per l'animazione check
- Label + supporting text per contesto aggiuntivo

**Fai**
- Indeterminato per selezione parziale in un gruppo (es. 2 su 4 selezionati)
- Label sempre presente — la checkbox da sola non comunica il significato
- Supporting text per spiegazioni contestuali (opzionale)

**Non fare**
- Mai checkbox per scelte mutualmente esclusive — usare radio button
- Mai più di 7-8 checkbox in un gruppo — spezzare in sotto-gruppi
- Mai checkbox senza label accessibile — anche se visivamente nascosta
