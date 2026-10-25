# Coerenza tra card, anteprima e ricetta

25 ottobre 2026. Correzione successiva al rilascio della PR #61.

## Problema verificato

Il percorso Crea usava tre ricette: numero dalla canonica tramite `kitchenCompatibility`, gruppo/esito da `recommendStyles` senza opzioni, risultato da un’ottimizzazione automatica dopo la selezione. In più, la selezione poteva applicare la migliore interpretazione d’autore pur mostrando il numero dell’originale.

Scopri ricostruiva i valori nella pagina: il fallback di temperatura di fermentazione era diverso da quello del motore e parte del contesto della cucina non veniva trasferita. L’ottimizzazione manteneva P/L, versione, interpretazione e scelte di pre-fermento della ricetta precedente. L’idratazione compensata si perdeva nel passaggio attraverso bozza o URL. Il condimento visualizzato poteva essere il primo del carosello, mentre la timeline usava il default dello stile.

## Contratto applicato

- **Scopri: Originale.** Il numero della card descrive l’originale calcolato sulla cucina corrente. All’apertura, lo stesso riferimento, gli stessi pesi e il medesimo contesto alimentano il calcolo. Un eventuale secondo valore è l’ottimizzazione raggiungibile col relativo pulsante, non una firma d’autore applicata di nascosto.
- **Crea: Su misura.** Numero, categoria e condizioni della card provengono dalla stessa proposta adattata che entra nella scheda e negli slider. Nessun’altra ottimizzazione parte silenziosamente durante il passaggio. Le ore sulla card sono quelle della proposta, mentre i dettagli tecnici dello stile mantengono i range di riferimento.
- **Scheda stile.** Prima di generare si leggono gli adattamenti già inclusi: confronto del punteggio con l’originale e differenze effettive di impasto e procedimento. Anche una proposta non fattibile mostra il suo punteggio, con generazione bloccata.
- **Ottimizza.** Prima del pulsante compaiono il voto previsto, le differenze concrete e le condizioni della candidata. Il gesto applica tutti i parametri della candidata nel riferimento selezionato. Versione e firma restano la base esplicita anche durante una personalizzazione; anteprima e applicazione usano lo stesso riferimento.
- **Persistenza.** Bozza, salvataggio e URL conservano sale, riferimento dell’interpretazione e base della compensazione d’idratazione. Aprire un altro stile ricrea lo stato, invece di trascinarsi gli slider della pagina precedente. La temperatura di cottura scelta viene conservata se inferiore alla capacità fisica, e mai usata per aumentare la capacità del forno.

La costruzione della ricetta vive in `src/app/use-cases/recipe-entry.ts`; le schermate non mantengono più due implementazioni del generatore di ricette editabili. Le finestre temporali vengono normalizzate allo stesso quarto d’ora anche nell’ottimizzatore.

## Chip: condizioni, non promesse di acquisto

Le chip sono derivate dai prerequisiti della ricetta effettiva e restano coerenti con gli avvisi interni:

- mancanza verificabile da un inventario dichiarato completo: teglia, pietra/acciaio, ingrediente non disponibile;
- dato incompleto: verificare la W della farina, il lievito o tutti i componenti di un mix;
- metodo bloccato: forno insufficiente o tempo/regime incompatibile.

Una dispensa vuota non significa automaticamente “devi comprare”. Un elenco parziale non prova la mancanza di elementi non selezionati; solo la scelta esplicita di considerarlo completo lo rende esaustivo. Il rifiuto di procurarsi un ingrediente/attrezzo è separato dalla sua disponibilità: con lista parziale resta una verifica, con mancanza confermata può diventare un blocco. Le esclusioni esplicite di farine restano vincoli della ricetta effettiva e non vengono annullate dalla possibilità di acquisto. Le categorie generiche di farina non provano una W esatta: la chip chiede di controllare il dato. I blend non sono confermati dal solo fatto di possedere farina di frumento. Non si suggerisce che comprare farina possa risolvere un blocco termico.

Il mix di due farine resta una stima della W basata sui dati del catalogo, non una misura dell’alveogramma. Per il confronto con una ricetta precisa si conservano le quote non arrotondate, invece di arrotondarle al 5% e dichiarare incompatibile la W risultante. Le formule generiche del catalogo conservano il precedente arrotondamento.

## Primo uso e collegamento tra sezioni

| Momento | Scopo e comportamento |
|---|---|
| Scopri | Catalogo editoriale e riferimento originale, senza chiedere prima di configurare tutto. Il voto indica l’originale sulla cucina corrente. |
| Porta questo stile in Crea | Trasporta lo stile, dichiarandolo. Non promette di conservare una firma o i ritocchi di una ricetta diversa. Si rientra nella scelta dei vincoli, con la capacità reale del forno. |
| Primo Crea | Avviso non bloccante sui filtri superiori, con forno/temperatura usati nei calcoli e invito a confermarli. Niente orario del pasto inventato: “Nessuna preferenza” significa assenza di una scadenza, non 24 ore implicite. |
| Filtri iniziali | Forno e capacità salvati se presenti, altrimenti riferimento domestico a 250 °C da confermare; livello base conservativo se non dichiarato; dispensa e dotazione parziali; acquisti non specificati; nessuna esclusione inventata. |
| Crea | Le proposte partono dai vincoli. Il punteggio “Su misura”, la durata della proposta e le chip anticipano il contenuto della scheda. |
| Ricetta | Editor condiviso. Si possono leggere gli assi, confrontare le modifiche, scegliere un profilo/firma e personalizzarlo senza perdere la provenienza. |

L’accessibilità di una risorsa è separata dalla sua necessità: farine e teglie sono rispettivamente ingredienti e accessori procurabili, mentre una capacità termica insufficiente è un blocco del metodo corrente. Non si attribuiscono prezzi o una facilità di acquisto universale; una planetaria non diventa obbligatoria solo perché utile. L’assenza di dati sul mixer non cancella il procedimento a mano già implementato.

## Profili, firme e reset

La selezione di uno stile/versione/firma sostituisce il profilo completo: idratazione, W, P/L, sale, tempi, temperatura di fermentazione, pre-fermento, geometria/peso del formato, mix e condimento. La temperatura di cottura torna al riferimento entro la capacità fisica del forno. Selezionare di nuovo lo stesso elemento riapplica il profilo; non lo deseleziona.

Una modifica non cancella il riferimento: lo stato diventa “Personalizzata · base …” e offre “Ripristina …”. Il reset torna alla firma/versione selezionata, non sempre al centro dello stile. W del frumento e W del mix della Pinsa restano allineate quando si cambia preset o slider. I campi mancanti in una firma usano i valori del suo impasto risolto, evitando residui della selezione precedente.

## Aiuti facoltativi

Gli aiuti facoltativi hanno un canale separato dai prerequisiti: non bloccano la ricetta, non la spostano di categoria e non modificano il voto. La semola rimacinata per lo spolvero è proposta solo nei contesti di stesura/infornata adatti e può essere sostituita dalla farina della ricetta; viene soppressa quando esclusa e non è aggiunta come suggerimento alla Napoletana STG. Fonti: [Mulino Caputo, Semola](https://www.mulinocaputo.it/prodotti/semola/) e [Ooni, Balling dough](https://eu.ooni.com/en-de/pages/help-center?a=How-do-I-ball-my-pizza-dough---id--AFiPmQvFSR6nYcfE49Lt8A), consultate il 25/10/2026. Questo consiglio non modifica la formula dell’impasto.

## Slider

Valori e tacche usano il formattatore locale con un massimo di due decimali: per esempio `2,5–3,1`, invece di rendere direttamente `2.8 + 0.3`. Le etichette hanno due colonne che non si sovrappongono. Tacche e frecce fuori dai limiti fisici del controllo non vengono disegnate oltre la sua larghezza.

## Verifica

Crea: attraversate le 29 card e le 29 schede; aperti tutti i risultati consentiti e verificato il blocco delle restanti proposte. Nessuna differenza di punteggio nei passaggi.

Scopri: attraversati tramite click i 29 stili su forno domestico a 250 °C; nessuna differenza tra voto della card e voto della ricetta aperta. I test del caso d’uso confrontano ricette complete (cinque assi, verdetto, dosi e timeline) prima e dopo la ricostruzione dello stato, su quattro cucine e tutte le 29 ricette.

Verificati nel browser anche: inventario parziale → completo; rifiuto/consenso a procurarsi farine; esclusione del riso; selezione e riclick di una firma; modifica e ripristino; persistenza del punteggio dopo ottimizzazione. I suggerimenti facoltativi e i vincoli negativi hanno test dedicati.

Slider del sale verificato anche a 390 px: etichette `2,5` e `3,1` separate, nessun overflow orizzontale. La lettura dei punteggi nel controllo finale di Crea attende il valore finale dell’animazione, evitando di confrontare un fotogramma intermedio con il voto della card. Risultato: 29/29 passaggi coerenti anche senza una scadenza temporale.

Validazione finale: 35 file di test, 492 test superati e uno saltato; typecheck e guard del progetto superati; build e budget prestazionali rispettati.

Questo audit verifica il trasporto del contesto e la comunicazione. Non chiude le lacune scientifiche e di dotazione descritte nell’[audit assi e vincoli](audit-assi-e-vincoli-2026-10-25.md).
