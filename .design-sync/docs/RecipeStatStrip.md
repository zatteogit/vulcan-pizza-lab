La RecipeStatStrip è una barra orizzontale che mostra le 4 metriche chiave della ricetta: idratazione, W farina, ore fermentazione, tempo cottura. Ogni stat ha icona tematica e hover con lift.

**Principi**
- 4 stat fissi: Idratazione, Farina W, Fermento, Cottura
- Numeri in DM Sans con tabular-nums per allineamento
- Hover: y -3 con shadow-md via spring per feedback interattivo

**Fai**
- Mantenere sempre 4 stat — aggiungerne altri rompe il ritmo visivo
- Icone tematiche: Flame per idratazione, Wheat per farina, Timer per fermento, Zap per cottura
- Hover con lift (y: -3) e shadow per comunicare interattività

**Non fare**
- Mai più di 4 stat — se servono più dati, usare una tabella
- Mai cambiare l'ordine dei 4 stat — l'utente si aspetta la sequenza fissa
- Mai numeri senza tabular-nums — il layout salta durante l'aggiornamento
