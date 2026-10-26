# Bookmark tra le azioni — 26 ottobre 2026

Il bookmark è stato spostato dalla foto, accanto a Indietro, alla riga di azioni in alto a destra. A sinistra rimane solo il ritorno. Il comando di salvataggio resta disponibile quando la foto scorre o l'hero viene ridotto.

La shell offre un contenitore condiviso per Inizia/timer e per le azioni della ricetta, con disposizione flex: la larghezza variabile del timer non viene stimata con un offset. Il bookmark viene inserito in quel contenitore dalla RecipeView; la variante con toolbar lo mantiene nella propria area azioni. Il contenitore rimane disponibile anche quando la ricetta non può avviare la cucina, e viene nascosto durante l'overlay della pizzata.

Verifiche locali:

- Chrome e WebKit, larghezze 320, 390 e 1440 px, chiaro/scuro, prima e dopo lo scroll: bookmark a destra, ritorno a sinistra, nessuna sovrapposizione o overflow.
- Salvataggio, reload e rimozione del preferito verificati attraverso il pulsante.
- Percorso Crea → Focaccia Genovese → Genera ricetta, a 320 px: portale montato correttamente e azioni separate dal ritorno.
- Sessione cucina a 320 px: timer e bookmark non si sovrappongono; il gruppo si nasconde nell'overlay e ricompare alla sua chiusura. Passando a Scopri resta il timer, accanto al Profilo, e il bookmark della ricetta viene rimosso.
- 602 test passati, uno saltato; typecheck, guardie del progetto, build, controllo glass e budget degli asset superati.

Evidenze: `output/playwright/bookmark-actions/`. Prove WebKit in browser, senza hardware iPhone fisico.
