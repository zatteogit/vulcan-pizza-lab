# Audit del modello: assi, vincoli e comunicazione

Data: 25 ottobre 2026. Audit del codice e delle fonti indicate sotto; **non è una validazione sperimentale delle 29 ricette**. I numeri della tabella sono gli intervalli attuali del database, non limiti fisici universali certificati. Una temperatura di aria, platea, volta o olio non è intercambiabile.

## Decisione di prodotto e presentazione

Un solo punteggio globale in primo piano, accompagnato da uno dei tre esiti operativi: fattibile, con adattamenti, non fattibile così. La categoria dipende dal verdetto della ricetta generata, mai da una soglia di punteggio.

Il globale è il minimo fra media pesata, autenticità e, se la ricetta non è fattibile, 39. Autenticità 20 impedisce un globale superiore a 20, anche con peso A a zero. Il tetto 39 è una scelta editoriale per la fascia bassa, non una misura fisica. Il limite A=75 per sostituzione di un combustibile identitario è anch’esso una convenzione editoriale da calibrare, non una misura sperimentale della somiglianza.

La media usa A, facilità, maturazione stimata, sostenibilità stimata e **100 − sperimentazione**: una deviazione elevata non diventa un premio. Quando un tetto è attivo, il testo principale ne indica il motivo. I vincoli mancanti e gli adattamenti restano visibili.

Nel pannello “Dettagli” della compatibilità della ricetta sono ispezionabili tutti e cinque gli assi, anche con peso zero. Toccando un asse si legge il significato; per autenticità compaiono le penalizzazioni concrete. Il dettaglio mostra media e tetti; la modalità nerd aggiunge i pesi. Maturazione non equivale a digeribilità personale; sostenibilità è una stima relativa e non una misura di emissioni o consumi.

Nelle proposte iniziali e nella scheda stile, il punteggio deriva dalla stessa ricetta e il verdetto conserva le tre categorie. La scheda spiega dotazione reale e adattamenti; l’ispezione completa dei cinque assi è sulla ricetta, dove sono noti impasto, versione e procedimento effettivi.

## Dati presenti e collegamenti effettivi

- `styles-db.ts`: 29 stili con impasto, formato, cottura e intervalli. L’engine usa questi dati e i range della versione selezionata. Le finestre devono essere considerate proprietà del metodo implementato, non impossibilità assolute di qualunque variante dello stile.
- `deviation-tags.ts`: 14 profili; i 15 mancanti erano implicitamente “canonici”. Ora sono “da verificare”, senza inventare firme. Il valore numerico di fallback non costituisce una verifica positiva.
- `parametric-databases.ts`: attrezzatura per tutti gli stili, ma principalmente usata per spiegazioni e suggerimenti. Non è tutta una sorgente di blocchi operativi. Corrette due contraddizioni: teglia romana no-knead e Pinsa impastabile a mano non richiedono necessariamente un’impastatrice.
- `default_cooking_id` e `default_format_id` sono dichiarati ma non valorizzati nei 29 stili. Non esiste una risoluzione operativa completa di quelle librerie.
- Il catalogo forni contiene modello e, per alcuni prodotti, diametro pizza. Il profilo motore trasferisce tipo e temperatura; **non valuta ancora ingombro, camera utile e diametro massimo**. Questo limita soprattutto metro, pala e formati grandi.
- Autenticità valuta idratazione, W, P/L, tempo, combustibile identitario e adeguatezza termica. Non controlla integralmente composizione del blend, ordine di assemblaggio, struttura e forma. La deviazione effettiva è anch’essa parziale.

Questi collegamenti mancanti impediscono di dichiarare conclusa la verifica stile per stile. Il nuovo globale impedisce compensazioni numeriche scorrette; non rende completi i dati sottostanti.

## Inventario dei 29 stili

Intervalli nominali del modello corrente. Per gli stili fritti la temperatura è dell’olio. “Profilo presente” significa presenza nel codice, non certificazione esterna.

| Stile | Temperatura °C, modello | Ore, modello | Profilo deviazione | Verifica e limite ancora aperto |
|---|---|---|---|---|
| Napoletana STG (`napoletana_stg`) | 430–500 | 6–14 | presente | Identità STG e AVPN da tenere distinte: requisiti normativi e varianti approvate non coincidono. |
| Canotto Contemporanea (`napoletana_canotto`) | 400–480 | 24–72 | presente | Cornicione e struttura; mancano limiti accoppiati verificati per farine, idratazione e cottura. |
| Teglia Romana (`teglia_romana`) | 250–320 | 24–48 | presente | Parametri presenti; restano da documentare confini di identità e limiti accoppiati del metodo. |
| Tonda Romana "Scrocchiarella" (`tonda_romana`) | 300–400 | 6–24 | presente | Parametri presenti; restano da documentare confini di identità e limiti accoppiati del metodo. |
| Pinsa Romana (`pinsa_romana`) | 280–320 | 24–72 | presente | Adattamento domestico documentato e implementato: 250 °C, teglia capovolta calda. Fermentazione nominale a 4 °C. Mix pubblico esatto non verificato. |
| New York Style (`new_york`) | 270–310 | 18–48 | presente | Parametri presenti; restano da documentare confini di identità e limiti accoppiati del metodo. |
| Detroit Style (`detroit`) | 250–290 | 8–24 | presente | Teglia, spessore e bordo di formaggio: il materiale canonico non equivale a obbligo universale di un solo metallo. |
| Chicago Deep Dish (`chicago_deep`) | 200–235 | 12–24 | presente | Parametri presenti; restano da documentare confini di identità e limiti accoppiati del metodo. |
| Focaccia Genovese (`focaccia_genovese`) | 210–250 | 6–18 | presente | Parametri presenti; restano da documentare confini di identità e limiti accoppiati del metodo. |
| Sfincione (`sfincione`) | 200–240 | 8–24 | presente | Parametri presenti; restano da documentare confini di identità e limiti accoppiati del metodo. |
| Pala Romana (`pala_romana`) | 330–380 | 18–48 | presente | Parametri presenti; restano da documentare confini di identità e limiti accoppiati del metodo. |
| Grandma Style (`grandma_style`) | 230–260 | 18–48 | presente | La fonte King Arthur usa un metodo con tempi diversi: il minimo del modello non è un limite universale dello stile. |
| Focaccia di Recco (`focaccia_recco`) | 270–320 | 0.5–2 | presente | Senza lievito, due sfoglie e formaggio: verificare insieme disciplinare, formato e dotazione. |
| Pizza al Padellino (`padellino_torino`) | 220–240 | 18–48 | presente | Formato al tegamino documentato; intervallo temporale del modello non validato come confine universale. |
| Pizza Baciata (`pizza_baciata`) | 270–300 | 24–48 | da verificare | Doppia struttura e farcitura: la categoria di deviazione manca. |
| Ciaccino Senese (`ciaccino_senese`) | 230–270 | 4–12 | da verificare | Identità ripiena e limiti da documentare; profilo di deviazione assente. |
| Pizza Spaccata (`pizza_spaccata`) | 270–300 | 24–48 | da verificare | Taglio e farcitura non equivalgono alle due sfoglie della baciata; profilo di deviazione assente. |
| Trancio Milanese (`trancio_milanese`) | 220–260 | 18–36 | da verificare | Parametri presenti; restano da documentare confini di identità e limiti accoppiati del metodo. |
| Chicago Tavern Cut (`chicago_tavern`) | 240–280 | 18–36 | da verificare | Stesura sottile e taglio a quadri; fonte King Arthur con tempi diversi dal modello. Non abbassare solo un limite isolato. |
| Focaccia Barese (`focaccia_barese`) | 220–250 | 8–24 | da verificare | Fonte istituzionale PAT disponibile; non introdurre falsi obblighi STG o blend univoci. |
| Pizza Fritta (`pizza_fritta`) | 175–190 | 8–24 | da verificare | La temperatura indicata è dell’olio; serve dotazione per friggere, indipendente dal forno. |
| Pizza Montanara (`pizza_montanara`) | 175–190 | 8–24 | da verificare | Metodo fritto da distinguere dalle varianti con passaggio in forno; olio e attrezzatura dedicati. |
| Pizza Fritta Tonda (`pizza_fritta_tonda`) | 175–190 | 8–24 | da verificare | Temperatura dell’olio; struttura e farcitura da verificare per questa variante. |
| Calzone Napoletano (`calzone_napoletano`) | 400–470 | 8–24 | da verificare | Chiusura, ripieno e spessore richiedono una verifica accoppiata, non solo temperatura. |
| Pizza al Metro (`pizza_al_metro`) | 300–380 | 6–12 | da verificare | Lunghezza e piano utile sono centrali; capacità geometrica del forno non valutata. |
| New Haven Apizza (`new_haven_apizza`) | 340–400 | 24–72 | da verificare | Carbone ora distinto dalla legna. Fonti per varianti a legna e domestiche esistono, ma non sono metodi alternativi implementati completi. |
| Fugazzeta Argentina (`fugazzeta`) | 220–260 | 4–12 | da verificare | Distinguere versione ripiena da fugazza; fonte commerciale conferma identità, non tutti i limiti. |
| California Style (`california_style`) | 280–340 | 24–48 | da verificare | Categoria ampia: il riferimento di autenticità va esplicitato prima di definire confini rigidi. |
| Greek Pan Pizza (`greek_pan`) | 230–260 | 4–12 | da verificare | Teglia e struttura: soglie operative e profilo di deviazione da documentare. |

## Fonti primarie consultate e interpretazione

- [Pinsa originale, metodo Montuori](https://pinsaromana.it/ricetta/come-fare-la-pinsa-romana-metodo-originale-con-marco-montuori/): impasto a mano e adattamento domestico a 250 °C su teglia capovolta; è un metodo, non la semplice sostituzione di 300 con 250.
- [Protocollo OPR](https://www.pinsaromana.org/wp-content/uploads/2022/10/Regolamento-e-Protocollo.pdf): fermentazione refrigerata nominale, minimo 24 ore; non dimostra un blend pubblico universale 70/15/15.
- [Sally’s, esperienza](https://sallysapizza.com/experience/): identità dell’Apizza legata al carbone. Il database ora lo distingue dalla legna.
- [New Haven secondo Adrian Chelette, StarChefs](https://starchefs.squarespace.com/recipes/new-haven-style-pizza): variante dichiarata, a legna, con proprio impasto e procedimento. Non prova che ogni forno a legna o il minimo termico attuale del database bastino.
- [New Haven ispirata, King Arthur](https://www.kingarthurbaking.com/recipes/new-haven-style-pizza-recipe): esiste una variante domestica con pietra/acciaio, grill e programma dedicato. Non è ancora implementata come alternativa eseguibile nell’app. “Non fattibile così” non significa che nessun adattamento domestico esista.
- [Grandma, King Arthur](https://www.kingarthurbaking.com/recipes/grandma-pizza-recipe) e [Tavern, King Arthur](https://www.kingarthurbaking.com/videos/tavern-style-pizza): esempi primari con programmi diversi da quelli presenti. Richiedono metodi completi separati, non minimi orari abbassati isolatamente.
- [Disciplinare Focaccia di Recco IGP, Camera di Commercio di Genova](https://www.ge.camcom.gov.it/it/promuovi/prodotti-tipici/prodotti-dop-e-igp/disciplinare_focaccia_di_recco_settembre_2024.pdf): identità e processo da preservare insieme. La riuscita domestica non conferisce il riconoscimento IGP.
- [Focaccia barese, PAT Puglia](https://www.patpuglia.it/it/12/Focaccia_barese/6_199): riferimento istituzionale; evitare di attribuire certificazioni o formule esclusive non documentate.
- [Disciplinare AVPN](https://www.pizzanapoletana.org/public/pdf/Disciplinare_AVPN.pdf): va distinto dalla denominazione STG e dalla convenzione editoriale dello stile del database.

Per gli altri stili, le note della tabella sono questioni di audit, non nuovi limiti validati. Restano applicabili gli stati delle fonti in `docs/fonti-dati.md`.

## Prossime verifiche necessarie

Per ogni metodo: origine e versione della fonte, elementi identitari, combinazioni eseguibili di temperatura/tempo/supporto/impasto, sostituzioni ammesse e compromessi. Collegare poi formato utile del forno e attrezzatura già censita ai controlli operativi, risolvendo prima le contraddizioni. Solo dopo si possono ampliare le alternative eseguibili senza promettere risultati non sostenuti dal metodo.
