# UI della scelta e della compatibilità

25 ottobre 2026. Revisione del core successiva alla PR #62.

## Gerarchia del percorso

| Punto | Domanda dell’utente | Informazione visibile | A richiesta |
|---|---|---|---|
| Primo Crea | Come ottengo consigli personali? | Richiamo compatto ai filtri, una riga, una sola azione e chiusura persistente | Cucina, dispensa e livello nei controlli esistenti |
| Card | Mi interessa e c’è una condizione decisiva? | Foto, stile, origine, voto con riferimento originale/su misura e al massimo due pill dentro la foto | Requisiti completi, difficoltà e spiegazioni nella scheda |
| Scheda | Cosa sto per generare? | Proposta, requisiti, confronto in colonne originale/su misura | Dettagli tecnici dello stile |
| Ricetta | Quanto è adatta e cosa devo ancora controllare? | Voto globale, stato operativo, condizioni sintetiche, azioni | Cinque assi, limiti del voto, requisiti completi e confronto |
| Ottimizzazione | Cosa cambierà se applico? | Confronto attuale/ottimizzata prima dell’azione | Motivazioni e assi nel dettaglio |

## Selezione delle pill

La politica è condivisa da Crea e Scopri, alimentata dalla rispettiva ricetta effettiva. Il voto resta lo stesso del dettaglio. Nessuna formula del motore è cambiata.

1. Un blocco viene prima di tutto: forno insufficiente, regime/tempi incompatibili o requisito escluso. Non gli si affianca una promessa di acquisto o un tempo di riuscita.
2. Un metodo diverso viene dichiarato concretamente: teglia capovolta, cottura senza carbone/legna o cottura adattata.
3. Se l’autenticità è bassa e non c’è già un segnale sul metodo, la pill lo esplicita.
4. Mancanze confermate precedono i dati da verificare. Teglia, superficie, mix o ingrediente specifico restano informazioni utili a distinguere le proposte. Il limite è di due pill.
5. Farina generica e lievito non dichiarati non producono lo stesso avviso su ogni card. Nel riepilogo della ricetta si raccolgono in “Verifica la dispensa”; nel dettaglio restano i requisiti esatti.
6. Se c’è spazio, si mostra la durata complessiva della timeline del motore, arrotondata alla mezz’ora e preceduta da `≈`. Non si espone più la sola fermentazione come durata della ricetta, né una precisione al minuto sulla card. I tempi puntuali restano nella ricetta.

Le pill sostituiscono il vecchio livello “Principiante · ore”, non costituiscono una riga aggiunta fuori dalla card. Le liste complete non vengono cancellate dal verdetto.

## Voto, stato e icone

Il numero indica la compatibilità globale; il riferimento “Originale” o “Su misura” chiarisce quale ricetta è stata valutata. I cuori tornano come linguaggio visivo dell’affinità: stretta di mano/cuore, cuore, pulsazione, cuore spezzato, cuore disattivato nelle cinque fasce già previste. Il salvataggio conserva il segnalibro. Un blocco usa il cuore disattivato anche quando il punteggio, da solo, non raccontasse il vincolo.

“Su misura” descrive modifiche effettive o un metodo adattato. “Da verificare” descrive avvisi senza modifiche effettive, ad esempio una dispensa incompleta. “Così non è fattibile” resta il blocco operativo. La sezione intermedia di Crea si chiama “Con condizioni”, perché l’esito `warnings` comprende sia adattamenti sia requisiti da verificare.

Il riepilogo non ripete tutti gli avvisi in prosa. Il pulsante testuale “Dettagli” rende riconoscibile l’accesso ai cinque assi e all’elenco completo; i blocchi e i limiti che penalizzano il voto restano esposti.

## Confronto delle modifiche

Tabella con intestazioni esplicite, una riga per parametro realmente cambiato e valori allineati. Punteggio, idratazione, W, P/L, tempi/temperature, pre-fermento e cottura provengono dalle due ricette effettive. La destinazione è evidenziata; temperature e tempi secondari sono subordinati al valore principale. Nessun parsing delle frasi del motore e nessuna spiegazione causale inventata.

La tabella è semantica e mantiene le intestazioni anche a 390 px. Nella ricetta l’anteprima resta nella colonna principale, senza creare una terza colonna tra verdetto e azioni.

## Verifiche

- Test dedicati alla priorità dei segnali, al limite di due pill, alla distinzione mancante/non dichiarato e alla conservazione dei requisiti completi.
- Controllo visivo desktop e a 390 px di richiamo iniziale, card, confronto e riepilogo.
- Controllo nel browser di apertura filtri, chiusura persistente, espansione dei dettagli, stato da verificare/su misura/bloccato e assenza di overflow.

Esito finale: 501 test superati, uno saltato (36 file); typecheck, guard del progetto, build app/Worker e budget prestazionali superati. Le 29 card rispettano il limite di pill e nessun elemento deborda a 320, 390, 768 e 1440 px.
