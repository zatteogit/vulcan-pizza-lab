# Allergeni: ricetta, prodotto, preferenza

Riferimenti consultati il 27 ottobre 2026:
- [Regolamento UE 1169/2011, allegato II](https://eur-lex.europa.eu/eli/reg/2011/1169/oj/eng).
- [Commissione europea: allergie e informazioni alimentari](https://food.ec.europa.eu/food-safety/campaign-2026/allergies_en).

## Contratto del motore

`GeneratedRecipe.allergens` considera l'impasto effettivo (miscela di farine, grassi, lievito) e il condimento effettivamente selezionato, con i componenti dichiarati. Per le fritte, l’olio di frittura generico resta da verificare finché non è specificato il prodotto; non viene automaticamente trattato come olio di arachidi o come privo di allergeni. L'identità dell'ingrediente introduce un allergene noto; il nome di una salsa, una nota di preparazione, il W, le proteine, la temperatura e il tempo non dimostrano una composizione o una sicurezza clinica.

- `contains`: gruppi presenti negli ingredienti richiesti/inclusi.
- `conditional`: fonti delle aggiunte facoltative non ancora incluse; un gruppo può anche comparire in `contains`. Omettere i facoltativi non elimina l’allergene degli ingredienti richiesti. In assenza di altre fonti richieste, il conflitto facoltativo richiede l’omissione.
- `may_contain`: esclusivamente diciture di etichetta esplicitamente dichiarate per il prodotto reale. Un ingrediente sconosciuto non genera tracce inventate.
- `unverified`: identità composta/ambigua o composizione da verificare. Il riepilogo non garantisce che l'inventario degli allergeni sia completo.
- `avoided`: scelta esplicita dell'utente, distinta dalle diete. Una lista vuota significa non specificato, non assenza di allergie.

I 14 gruppi seguono l'allegato II. Arachidi e frutta a guscio sono distinti; latte senza lattosio resta latte; cocco, castagne, pinoli e noce moscata non vengono classificati come frutta a guscio dell'allegato. Alcune esenzioni nominate (olio di soia completamente raffinato, sciroppi di glucosio e maltodestrine nelle forme previste) sono riconosciute per identità. I solfiti non vengono dedotti da vino o aceto: la soglia di dichiarazione non si può ricostruire dai grammi della ricetta. Non è un modello di tolleranza medica, né una certificazione di assenza o contaminazione crociata.

Un allergene richiesto o una traccia dichiarata da evitare produce un blocco `dietary_conflict`, indipendente da voto, forno o preset. Le alternative cambiano il condimento reale e preservano le preferenze; restano da controllare etichette e cucina. Un prodotto dichiarato non può cancellare un allergene intrinseco della ricetta.

## App e MCP

Profilo e filtro «Tu» consentono la selezione facoltativa; il profilo corrente prevale sulle vecchie bozze. Nessuna preferenza allergica è aggiunta agli URL. Le card mostrano avvisi solo se rilevanti per una scelta esplicita. Dettaglio, ricetta nelle tre sezioni e stampa riportano i gruppi espliciti; la ricetta espone le fonti su richiesta. Le sette lingue condividono gli stessi ID del motore.

MCP: `allergens_avoid`, `included_optional_ingredients` e `allergen_labels` sono input validati. Questi ultimi descrivono etichette reali (`product`, `contains`, `may_contain`, `complete`) per ingrediente, senza dedurre le tracce da una marca generica. Il riepilogo strutturato è lo stesso dell'app. L'interfaccia non offre ancora un editor di etichette per singolo prodotto: in assenza di dati la verifica resta esplicita, senza attribuzioni automatiche di sicurezza.
