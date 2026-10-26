# Compatibilità: fascia compatta nella ricetta

Il feedback sul pannello del 26 ottobre segnalava ancora un riquadro troppo vuoto, con voto incapsulato e avvisi in contenitori annidati.

La nuova fascia usa la larghezza disponibile, voto e denominatore sulla stessa riga, Dettagli immediatamente sotto e un divisore leggero verso esito e condizioni. Le azioni restano separate dalla lettura del risultato. Con almeno 640 px di spazio interno passano a destra; nei pannelli stretti restano nel footer. La query dipende dal contenitore perché la shoulder può essere stretta anche su desktop. La disposizione di base non richiede supporto alle container query.

Gli avvisi contestuali conservano severità, contenuto e apertura degli ulteriori suggerimenti; la presentazione elimina la cornice esterna e usa un solo accento laterale per avviso.

Nel caso dello screenshot, la temperatura di frittura a 175 °C veniva interpretata come temperatura di un forno freddo. Il chiamante ora dichiara quando la ricetta usa il forno: il controllo P09 non si applica alle fritte, mentre gli altri avvisi dell'impasto restano attivi. Tre test coprono la distinzione. Nessun parametro o punteggio delle ricette è stato modificato.

## Verifica

Artefatti in `output/playwright/compatibility-strip/`:

- 30 stati Crea: viewport 320, 390, 768, 1024 e 1440 px, tre temi e due modalità; cinque assi disponibili e salvataggio funzionante.
- Stesso caso prima/dopo: versione su misura a 87 con condizione farina W285; dopo il ripristino, originale a 86 con stato Da verificare.
- Sei altre lingue a 320 e 390 px, label del salvataggio visibile e nessun overflow.
- WebKit: apertura dettagli, salvataggio, ottimizzazione Genovese e Napoletana bloccata con motivi visibili a pannello chiuso.
- Verifica completa: 605 test passati e uno saltato; typecheck, guard, build e budget superati.

La verifica browser riguarda i motori Chromium e WebKit; non è una prova su dispositivo fisico.
