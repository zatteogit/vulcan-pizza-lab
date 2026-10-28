# Audit UX e scienza · 28 ottobre 2026

Obiettivo (Matteo): un'app bella e semplice da usare che, **al bisogno**, mostri tutta la scienza necessaria a sostenere le proprie affermazioni.

Metodo: 18 schermate, due revisori indipendenti per schermata (contenuti/scienza; visivo/DS/interazione/accessibilità) con l'app aperta a 390 e 1280 px in chiaro e scuro, sei personas (Prima volta, Appassionato del weekend, Pizza nerd, Mani in pasta, Esigenze specifiche, Partner che valuta), un verificatore per schermata. Risultato: 639 finding (3 P0, 201 P1, 326 P2, 109 P3). La verifica non ha respinto finding (ne ha corretti 127): ogni pacchetto ricontrolla i propri prima di toccare il codice.

I due P0 sono corretti in #143.

## Sintesi

Matteo, in sintesi: rispetto all'obiettivo (livello 1 chiaro, scienza a richiesta), oggi Vulcan è a metà. La scienza c'è e in alcuni punti è fatta molto bene, ma non ha una porta d'ingresso unica. A volte non si raggiunge, a volte presenta come misure o come fatti cose che sono stime, convenzioni o dati non verificati. In parecchi punti il testo editoriale contraddice il motore. Sono 639 finding verificati: 3 P0 (in realtà 2 problemi, perché S09-A-01 e S09-B-01 sono lo stesso), 201 P1, 326 P2 e 109 P3. Molti compaiono due volte perché gli auditor A e B hanno trovato la stessa cosa.

I due P0 vanno risolti per primi. Sono già dentro le fondazioni FW-07 e FW-09, con fix e test descritti.
1) I consigli «parametrici» dei passi ignorano il forno dell'utente (getParametricTip legge solo lo stile). Con il forno di casa a 250 °C il consiglio dice «Tempo: 1–2 min, ruota 3 volte» mentre il passo dice 6 minuti: un principiante sforna la pizza cruda. Nell'Impasto compare anche «Forno a legna >430 °C».
2) «Stasera» porta a 0 stili fattibili su 29 senza via d'uscita. Gli slot vengono proposti con minimi fissi (3 h, 1 h) che nessuno stile rispetta. Il caso d'uso principale del principiante si blocca.

I P1 di correttezza e di scienza più gravi, in ordine:
- Il glossario afferma cose false sul motore. Dice che il motore usa Arrhenius con β = 0,075, ma il motore usa un Q10 a tratti. I pesi di A-Score e F-Score sono diversi da quelli calcolati. Il Thickness Factor è presentato come «metrica originale Vulcan», e non lo è. Gli intervalli di W, P/L e TF sono in disaccordo con gli stili. Il server MCP passa le stesse affermazioni agli agenti esterni.
- Problemi e soluzioni dà soglie universali che contraddicono gli stili proposti dall'app, e gli avvisi di Crea le riusano. P04 spinge ad aggiungere lievito anche durante la maturazione in frigo; P20 attribuisce l'odore «chimico» al cloro.
- Prefermenti: la guida dice lievito 1 % nella biga, la ricetta dell'app ne mette 0,29 % per le stesse 16 h. Righe che la ricerca marca «da verificare» compaiono come fatti, senza nessuna fonte visibile, anche se le fonti esistono (12, con stato V/P/D).
- Punteggio: il tooltip dichiara 2 criteri, ma il voto ne pesa 5. Il tetto 39 dei non fattibili sembra un valore calcolato ed è una scelta di prodotto. I valori «Prima» della stat strip sono confrontati con il centro del range, non con la ricetta originale. Con un forno da pizza a 509 °C la Napoletana finisce ultima.
- Dosi: con un prefermento lo zucchero sparisce dall'impasto finale. Farina e acqua del lievito madre non entrano nei conti. La stampa ha totali diversi dallo schermo. Sotto 1 g di lievito l'unico aiuto è «usa una bilancia da 0,01 g».
- Piano: la Timeline comoda allunga e accorcia le lievitazioni senza ricalcolare il lievito. «Ricalcola da adesso» porta la cottura alle 4:55 senza avvisi. In modalità cottura il preriscaldo dura zero e «Fatto» anticipa tutto il piano.
- La cucina si perde per strada. Un Effeuno da 509 °C diventa «Elettrico 450 °C» e un tocco cancella il modello. L'impastatrice viene ignorata (resta «a mano»). Il forno del partner diventa in silenzio il forno dell'utente.
- Aw e Q10 mostrati come misure, con tre decimali. Le fasce di W per tipo di farina sono date come fatto, ma 00/0 è la macinazione, non la forza. La chip «Digeribilità alta» è un'affermazione sulla salute.
- Il livello PizzaNerd della scheda ricetta (griglia Scienza, percentuali del panettiere, P/L) è irraggiungibile: nessun controllo lo accende. Lo strato «scienza» esiste già, ma è spento.
- D-032, D-036 e D-038 sono state annullate da una PR successiva senza una nuova decisione.

Cosa funziona già, ed è il modello da replicare:
- «Come calcoliamo il lievito» (yeast-explainer) e la nota di riferimento STG sono già progressive disclosure fatte bene.
- Nel glossario il Q10 è etichettato riga per riga «Stima del modello».
- Il motore dietetico è onesto («non attesta l'idoneità»).
- Il catalogo forni ha le fonti V/P.
- C'è un solo numero di compatibilità (D-041) con il calcolo visibile nella match card.
- Le edizioni sono dati, e il motore è neutrale rispetto al partner.
- La sessione di cottura è persistente.
- Ci sono 7 lingue in parità, il tema scuro regge, la regola 55 è calcolata dal motore e Problemi e soluzioni ha una struttura uniforme.

La proposta: 20 pacchetti fondativi. Il cuore sono FW-01, FW-02, FW-05 e FW-06.
- FW-01: un registro della scienza come dati (statuto, formula, ipotesi, fonte, incertezza).
- FW-02: un solo pattern «Perché?» (WhyButton → ScienceSheet L1/L2/L3 + EvidenceBadge).
- FW-05: un test di parità contenuti↔motore, esteso al server MCP.
- FW-06: explainScore() nel motore, con un unico ScoreExplainer.
- Intorno: cucina effettiva unica (FW-07), dosi per fase e piano temporale unici con invarianti testate (FW-17 e FW-19), disclosure, glossario e stati vuoti uniformi (FW-03, FW-04, FW-09), la pagina «Metodo e fonti» (FW-15) e le guardie delle decisioni (FW-20).

Ordine consigliato: i due P0 (FW-07, FW-09) → FW-20 e FW-18 (piccoli) → FW-01 → FW-02 e FW-05 → FW-06, FW-08, FW-17, FW-19 → gli altri. Da te servono soprattutto quattro decisioni: D-A (statuti), D-B (che cos'è l'«Originale»), D-C (PizzaNerd) e D-E (cosa entra nel punteggio). Bloccano il lavoro sul punteggio, sui delta e sul pattern «Perché?».

Nota sui file: ho aperto e verificato i percorsi citati. Due file nominati dai finding non esistono: src/app/data/pre-ferment-sources.ts (va creato dentro FW-01) e src/app/features/recipe/pre-ferment-guide.ts (il file reale è pre-ferment-guide.tsx). 549 finding su 639 sono coperti da una fondazione. Gli altri sono specifici di una singola schermata (per esempio «Salta» nell'onboarding, «Ho finito prima» in cottura, le farine nei risultati di ricerca) e restano ai pacchetti per area.

## Temi trasversali e principi

### T1 · La scienza c'è, ma non si raggiunge: manca un pattern unico «Perché?»

Ogni numero o consiglio di livello 1 che dipende da un modello ha accanto lo stesso affordance «Perché?» (WhyButton), che apre sempre lo stesso contenitore (ScienceSheet) con la stessa scala: L1 una frase semplice → L2 perché in parole semplici e cosa succede se cambi il valore → L3 formula, ipotesi del modello, fonte, incertezza. La profondità non dipende dalla schermata né da un interruttore nascosto: il «Perché?» c'è per tutti, PizzaNerd decide solo se L2/L3 partono aperti.

Finding: 46.

### T2 · Lo statuto epistemico non è dichiarato: stime, indici e scelte editoriali presentati come misure o fatti

Ogni affermazione quantitativa ha uno statuto esplicito fra quattro: Esatto (definizione o aritmetica: percentuali del panettiere, somme), Stima (modello empirico con incertezza: lievito, Q10, Aw, W per tipo di farina), Ipotesi (assunzione del modello: cucina a 21 °C, farina a temperatura ambiente), Scelta di Vulcan (convenzione editoriale: pesi del punteggio, tetto 39). Le stime non mostrano più cifre di quante ne regge l'incertezza; i dati «da verificare» (D) non arrivano mai al livello 1 come fatti; nessuna affermazione sulla salute.

Finding: 56.

### T3 · I contenuti editoriali contraddicono il motore (glossario, problemi, prefermenti, chip degli stili)

Una sola verità numerica: ogni intervallo, peso, coefficiente o soglia che compare in un testo viene letto dal motore o dagli stessi dati che il motore usa, mai riscritto a mano. Quando un consiglio dipende dallo stile, lo dice («per la Napoletana…»), non dà regole universali. Un test di coerenza contenuti↔motore fallisce se divergono, e vale anche per il server MCP.

Finding: 51.

### T4 · Il punteggio non è spiegabile né coerente con quello che dice di misurare

Un solo numero (D-041) con una sola spiegazione, generata dal motore: cinque dimensioni, pesi, regola del minimo, tetto di non fattibilità dichiarato come scelta di Vulcan. Ogni numero ha un'etichetta che dice di cosa è; un confronto (prima → dopo) dice rispetto a cosa e non suggerisce un miglioramento se è un peggioramento.

Finding: 25.

### T5 · La cucina dell'utente si perde per strada (modello del forno, impastatrice, olio vs forno)

Un'unica «cucina effettiva» risolta in un punto solo del core e passata a tutti i consumatori (Crea, scheda, consigli dei passi, cottura, MCP). Nessun consiglio usa i dati canonici dello stile quando l'utente ha un forno diverso; nessun controllo riduce un modello noto al suo tipo generico; nessun tocco cancella in silenzio una scelta salvata.

Finding: 29.

### T6 · Componenti di disclosure diversi per lo stesso compito, spesso inaccessibili

Tre soli contenitori, ognuno con un compito: Disclosure (accordion in pagina, chevron, aria-expanded/aria-controls), InfoTip (definizione breve di un termine, con link alla voce), ScienceSheet (il «Perché?» a livelli; BottomSheet su mobile, Dialog su desktop). Vietati: `title=` come unica spiegazione, `<details>` col triangolo del browser, chip con «?» che non apre nulla, toggle che duplicano contenuto già visibile.

Finding: 29.

### T7 · Lessico tecnico non spiegato e glossario scollegato

Al livello 1 prima la cosa semplice, poi il termine (D-044); ogni termine tecnico mostrato è un TermLink che apre la definizione breve e porta alla voce completa. I deep link al glossario (#termine) aprono, scorrono, mettono a fuoco e funzionano in ogni lingua. Ogni termine usato nei passi ha una voce.

Finding: 38.

### T8 · Vicoli ciechi: stati vuoti senza motivo né via d'uscita, verdetti ripetuti

Nessuno stato vuoto senza (1) il motivo, (2) almeno un'azione che lo risolve, calcolata dal motore quando possibile («Primo pasto possibile: domani 13:00 → Sposta»). Un verdetto negativo dice la causa principale una volta sola, prima, con il rimedio; le cause secondarie vanno al livello 2.

Finding: 41.

### T9 · Dosi e piano diversi fra schermo, stampa, procedimento e modalità cottura

Una sola rappresentazione delle dosi per fase e un solo piano temporale, calcolati nel core e consumati da Ricetta, Procedimento, Cottura e Stampa. Invarianti testate: fase 1 + fase 2 = totale per ogni ingrediente; nessuna fase con quantità negativa; ogni allungamento dei tempi ricalcola il lievito; nessuna azione notturna senza avviso; il preriscaldo dura; gli allergeni coprono tutta la ricetta.

Finding: 46.

### T10 · Impostazioni che promettono effetti che non hanno, e cambi silenziosi

Ogni impostazione dice cosa cambia nella ricetta (o che non cambia nulla e serve solo ad avvisare). Nessuna azione cambia o cancella dati in silenzio: o chiede conferma, o offre «Annulla». Le funzioni non attive (feedback, notifiche su mobile, account) non si promettono.

Finding: 39.

### T11 · Riferimento e nomi instabili: «Originale», versioni, famiglie, nomi di stili e forni

Un solo concetto di «ricetta di riferimento» per stile (definito nei dati, non dedotto dalla difficoltà) e un lessico controllato: lo stesso oggetto ha lo stesso nome in ogni schermata, lingua e canale (scheda, ricerca, profilo, stampa). I delta (Prima → Dopo, «ottimizzato») si calcolano sempre rispetto al riferimento.

Finding: 28.

### T12 · i18n: stringhe e unità fissate nel codice, numeri non localizzati

Nessun testo, preposizione, unità o separatore decimale scritto nel codice: tutto passa dai cataloghi (7 lingue) e da un unico modulo di formattazione locale (numeri, intervalli, durate, tempi relativi, temperature, masse, unità imperiali). I dati di dominio mostrati all'utente (origini, momento del sale, metodo di stesura) sono chiavi, non frasi italiane.

Finding: 46.

### T13 · Accessibilità: dialog senza gestione del focus, Esc non stratificato, titoli e target

Ogni overlay modale passa da ds/Dialog, ds/BottomSheet o ds/ModalSheet con use-dialog-focus (focus iniziale, ciclo, ritorno) e uno stack di Esc (chiude solo lo strato in cima; le scorciatoie di tastiera sono sospese sotto un dialog). Gerarchia dei titoli senza salti, stato comunicato con testo e non solo col colore, target ≥ 24 px (44 px per azioni primarie), campi ≥ 16 px su mobile.

Finding: 41.

### T14 · Token del DS: semantica dei colori di stato, contrasto, tipografia minima, icone

I colori di stato hanno un solo significato in tutta l'app (positivo / attenzione / bloccante / neutro / consigliato), con contrasto AA verificato in chiaro e scuro; il testo informativo rispetta D-019 (12 px, 11 px solo eyebrow); icone e scelte singole usano un solo componente DS per compito. Niente valori grezzi né style={} per passare toni.

Finding: 28.

### T15 · Trasparenza: nessuna porta d'ingresso a metodo, fonti e rapporto col partner

Una pagina «Metodo e fonti» unica (generata dal registro delle fonti) è raggiungibile da Informazioni, Impara, Profilo e da ogni ScienceSheet. Nelle edizioni partner, il rapporto con il partner e la regola di neutralità del motore sono dichiarati in Informazioni e nell'onboarding; il co-branding è visibile su ogni breakpoint; nessun dato del partner diventa in silenzio un dato dell'utente.

Finding: 28.

### T16 · Decisioni di prodotto annullate senza traccia

Ogni decisione registrata in docs/autorialita.md che cambia un comportamento ha almeno un test di guardia che ne cita l'ID (D-0xx); una PR che la rovescia deve cambiare il test e aggiungere una nuova decisione.

Finding: 6.

## Decisioni (28/10/2026)

Le prime quattro scelte da Matteo con domande a scelta; le altre accettate in blocco come raccomandate («proposta AI, accettata in blocco»): si possono cambiare prima dell'implementazione del pacchetto che ne dipende.

- **D-A · Quali statuti epistemici mostrare all'utente, e con quali parole?**
  - Deciso (raccomandazione accettata in blocco): Quattro statuti, con le etichette solo al livello 3 (e al 2 quando serve), mai come rumore al livello 1. «Scelta di Vulcan» serve per dichiarare onestamente il tetto 39 e i pesi, che oggi sembrano calcolati.

- **D-B · Che cos'è l'«Originale» di uno stile, e rispetto a cosa si calcolano i «Prima → Dopo»?**
  - Deciso (scelta di Matteo): Riferimento esplicito nei dati (referenceVersionId): il disciplinare dove esiste (STG, IGP, APITER); per gli altri stili la regola attuale resta provvisoria, segnata «da confermare da Matteo» stile per stile. Etichetta «Riferimento». Tutti i delta partono da lì.

- **D-C · PizzaNerd: interruttore separato o legato al livello di esperienza? E come si chiama?**
  - Deciso (scelta di Matteo): Interruttore globale «Mostra i dettagli tecnici» (PizzaNerd come soprannome), raggiungibile da Profilo, Crea e scheda ricetta, proposto a chi sceglie Esperto; decide solo l'apertura di default. Il «Perché?» resta per tutti.

- **D-D · Dove vive la pagina «Metodo e fonti»?**
  - Deciso (raccomandazione accettata in blocco): In Impara, una pagina con indice e un'ancora per nota; Informazioni e Profilo ci portano. È il «sostegno» dell'obiettivo di prodotto e deve essere linkabile.

- **D-E · Cosa entra nel numero «Compatibilità con la tua cucina»?**
  - Deciso (scelta di Matteo): La «Compatibilità con la tua cucina» pesa solo fattibilità e fedeltà allo stile; digeribilità, sostenibilità e sperimentazione diventano informazioni separate al livello 2. Prima di applicare il cambio si misura l'effetto sulla classifica (P1 forno di casa, P2/P3 forno da pizza) e lo si mostra a Matteo nella PR.

- **D-F · Come trattare i dati «da verificare» (D) e i valori senza fonte?**
  - Deciso (raccomandazione accettata in blocco): Prima opzione, più una lista di verifica in docs/fonti-dati.md; i valori «errati» si correggono subito (biga «alveolatura fine», poolish «leopard spotting», TF «metrica originale», Arrhenius).

- **D-G · Tassonomia delle famiglie in Scopri: dove vanno Recco IGP, Sfincione, Genovese e lo stile argentino?**
  - Deciso (raccomandazione accettata in blocco): Famiglia «Tradizioni regionali» per gli stili storici non napoletani; l'argentino in una famiglia «Dal mondo» con la New York e simili, o in Americana solo se Matteo lo considera tale. Serve la conferma di Matteo sui singoli stili.

- **D-H · Chi ha il forno di casa: cosa vede per primo in Scopri?**
  - Deciso (raccomandazione accettata in blocco): Prima opzione: la pagina d'ingresso non deve aprire con «Forno insufficiente» su 3 stili su 4.

- **D-I · I consigli di Problemi e soluzioni: universali o relativi allo stile?**
  - Deciso (raccomandazione accettata in blocco): Prima opzione: oggi le soglie universali contraddicono gli stili che l'app stessa propone (e gli avvisi di Crea li riusano).

- **D-J · Sistema imperiale: come mostrare le microdosi (lievito, sale)?**
  - Deciso (raccomandazione accettata in blocco): Grammi sotto la soglia con nota, più un equivalente in cucchiaini marcato come stima: le once a 2 decimali danno errori fino a ±50 %.

- **D-K · Testo di trasparenza delle edizioni partner**
  - Deciso (raccomandazione accettata in blocco): Prima opzione, con un campo di schema in edition.ts e il testo in 7 lingue; la regola di neutralità del motore è già vera (lo conferma l'audit S18) e va detta.

- **D-L · Diete FODMAP, bassa istamina, basso nichel: oggi sembrano filtri ma non cambiano nulla**
  - Deciso (raccomandazione accettata in blocco): Prima opzione: il motore dietetico è già onesto («non attesta l'idoneità»); manca solo che la UI lo dica dove si sceglie.

- **D-M · Feedback dopo la cottura: oggi il form esiste ma non si mostra mai**
  - Deciso (raccomandazione accettata in blocco): Prima opzione, ripulita dal gergo interno («DevTools → Engine Lab»); la calibrazione è una decisione separata.

- **D-N · Geolocalizzazione per la temperatura della cucina**
  - Deciso (raccomandazione accettata in blocco): Su richiesta esplicita, con la temperatura proposta e non applicata in silenzio.

- **D-O · Microdosi di lievito sotto 1 g: quale aiuto per chi ha la bilancia da cucina?**
  - Deciso (raccomandazione accettata in blocco): Diluizione come prima scelta (esatta nell'aritmetica, si pesa con la bilancia da cucina), volume come alternativa marcata «stima».

- **D-P · Biga con lievito madre: come trattarla?**
  - Deciso (raccomandazione accettata in blocco): Non permettere la combinazione finché non c'è una fonte per i parametri; spiegarlo al livello 2.

- **D-Q · Timeline comoda: cosa fa quando allunga o accorcia le lievitazioni?**
  - Deciso (raccomandazione accettata in blocco): Seconda opzione nell'immediato (onesta e semplice), prima opzione come evoluzione con test sul modello del lievito.

- **D-R · D-032, D-036 e D-038 sono state annullate da una PR successiva senza nuova decisione: restano valide?**
  - Deciso (raccomandazione accettata in blocco): Ripristinarle (sono state prese con criterio e documentate) e aggiungere i test di guardia.

- **Farine con dati non affidabili. Due prodotti non risultano esistere a catalogo: «Le 5 Lune» (5stagioni_5lune) e «Manitoba Oro» Dallagiovanna, forse confusa con la Manitoba Oro di Caputo. Due valori sono segnati «errato» in docs/fonti-dati.md §2.1: W e P/L della Petra 3 Evolutiva (il produttore dice che non si misurano) e il falling number della 5 Stagioni rossa (280, non 300). Cosa mostriamo nella nuova scheda farina e nella ricerca?**
  - Deciso (raccomandazione accettata in blocco): B: nessun prodotto commerciale che forse non esiste deve comparire come consultabile, soprattutto davanti a un mulino partner. Quando Matteo conferma le schede, C sostituisce B.

- **Dove porta un risultato «forno» nella ricerca (ad esempio «Effeuno P134H», o «Fornace Aurora E1» nella demo)?**
  - Deciso (raccomandazione accettata in blocco): A subito, perché costa poco e rispetta T10. C può venire in seguito, quando FW-15 avrà sistemato la provenienza dei dati dei forni.

- **Nome del pulsante Profilo (avatar in alto a destra). Diventa l'aria-label e il tooltip, nelle 7 lingue.**
  - Deciso (raccomandazione accettata in blocco): A: la cucina comprende forno, impastatrice e dispensa, che decidono tutte la fattibilità, e il termine è già nel lessico. Va aggiunto alla tabella §Termini.

- **Sotto la Napoletana STG il pannello elenca come versioni d'autore anche il canotto di Capuano e la Margherita Sbagliata di Pepe, che hanno base napoletana_canotto e compatible_style_ids ['napoletana_stg']. Pizzeria Bianco (Phoenix, forno a legna americano) ha invece come base la STG. Questi legami sono dati: li usano anche il motore (recipe-entry), l'MCP e il pannello di impostazione della ricetta. Cosa facciamo?**
  - Deciso (raccomandazione accettata in blocco): B. Una versione «canotto» presentata come applicabile alla STG contraddice il disciplinare che la scheda stessa cita. Bianco invece è dichiarato «Ispirata a…» e la sua base STG è una scelta difendibile, da registrare in docs/fonti-dati.md §5. Il cambio va in una PR dedicata, con le misure del motore prima e dopo (recipe-preset.test, mcp-kitchen-parity.test, classifica recommendStyles per P1 e P3).

- **«Parametri collegati» (cambi l'idratazione e il configuratore sposta anche lievitazione, temperatura e W secondo una regola di Vulcan, non un modello fisico): come deve partire?**
  - Deciso (raccomandazione accettata in blocco): A) Acceso solo per avanzati aperti e livello ≥ 3, sempre annullabile: tiene l'aiuto per chi capisce cosa succede e lo toglie a P1, che oggi crolla da 87 a 39/100 senza saperlo.

- **Scelta della farina per il principiante (Debole / Media / Forte): aggiungiamo una quarta opzione «Non lo so»?**
  - Deciso (raccomandazione accettata in blocco): A) Sì: P1 spesso non sa che farina ha, e oggi deve tirare a indovinare fra tre classi che non conosce.

- **D-G3-01 · Che voce verbale usano i testi dei passi del Procedimento (descrizioni, «Come si fa», passi del condimento)? Oggi infinito («Impastare», «Dividere», «Cuocere») e imperativo («Accendi ora il forno», «Rovescia», «aggiungilo») sono mescolati, anche dentro lo stesso passo.**
  - Deciso (raccomandazione accettata in blocco): Imperativo di seconda persona singolare ovunque: è la voce già prevalente nei testi lunghi e negli avvisi del motore, parla a chi sta impastando adesso ed è coerente con il tono dell'app. Per lingue con un'altra convenzione da ricettario (es. francese) va annotata un'eccezione nelle linee guida.

- **D-G3-02 · Con quale cottura effettiva il basilico va messo prima del forno invece che appena sfornata? Il motore sceglierà un solo comando e la soglia sarà dichiarata come «Scelta di Vulcan» nel registro della scienza.**
  - Deciso (raccomandazione accettata in blocco): 120 s: copre la cottura napoletana di 60–90 s con margine e manda a «appena sfornata» tutti i forni di casa e le cotture in teglia. Va dichiarata come scelta editoriale (nota basil-timing), non come misura.

- **Percorso «Esperto» (livello 4): oggi riporta alla stessa Teglia romana del Principiante, cambiano solo l'idratazione e il freddo. Teniamo la continuità o cambiamo stile?**
  - Deciso (raccomandazione accettata in blocco): Tenere teglia_romana e dichiarare la continuità nel titolo: è una scelta didattica difendibile e costa solo la copy in 7 lingue

- **Il «percorso» di Impara oggi è un solo link a una ricetta. Ci basta dire onestamente cosa apre, o vogliamo un vero percorso a tappe?**
  - Deciso (raccomandazione accettata in blocco): Copy onesta più chip «Cosa impari» con link al glossario; il percorso a tappe resta in INT-E2

- **Segnale alla fine delle fasi (soprattutto la cottura): suono e vibrazione sono attivi per default?**
  - Deciso (raccomandazione accettata in blocco): Attivi per default, con interruttore nell'header: chi è in cucina con le mani in pasta non guarda lo schermo, e senza segnale la fine della cottura passa inosservata

- **Quali 3-4 problemi mettiamo in «Qualcosa non va?» in cima a Impara?**
  - Deciso (raccomandazione accettata in blocco): Uno per categoria scelto da Matteo (proposta da confermare: P01 impasto, P04 lievitazione, P07 stesura, P09 cottura); lista statica e testata

- **D-G4b-1 · Procedura di biga, poolish e autolisi nella guida (G4b-WP-02): le fonti in docs/ricerca/prefermenti-fonti-2026-10-24.md coprono idratazione, tempi, temperature e «pronto quando», ma non il modo di impastare (biga mescolata 2–3 minuti e lasciata grumosa, poolish come pastella liscia, prefermento sciolto nell'acqua rimasta, sale solo nell'impasto finale). Come li pubblichiamo?**
  - Deciso (raccomandazione accettata in blocco): A, con la ricerca B fatta subito dopo: la pagina oggi promette «Come usarli» e non lo spiega. Il testo è qualitativo e tutti i numeri arrivano da engine-facts.

- **D-G4b-2 · Nuove voci in Problemi e soluzioni (G4b-WP-03): quali aggiungiamo e con che tono?**
  - Deciso (raccomandazione accettata in blocco): A: sono gli incidenti più comuni per chi comincia (P1, P2) e la pizza attaccata alla pala fa perdere la pizza intera. Nessuna soglia numerica senza fonte.

- **Congedo dell'onboarding (passo 4): cosa mostriamo al posto delle tre card «Crea / Esplora gli stili / Impara la teoria», che oggi sembrano cliccabili ma non lo sono?**
  - Deciso (raccomandazione accettata in blocco): Solo il riepilogo delle scelte con «Modifica» e il bottone «Vai a Crea»: un solo concetto per schermata (P5/DSA), e lo scopo del passo è confermare quello che l'app userà. Scopri e Impara restano raggiungibili dalle tab.

- **Ricerca del modello di forno nell'onboarding: quanto peso le diamo sul primo schermo?**
  - Deciso (raccomandazione accettata in blocco): Il link sotto la lista che apre un foglio: P1 sceglie il tipo senza rumore in più, P2 e P3 (e il partner nella demo) trovano il modello in un tocco.

- **La chip «Macinata a pietra» fra le «Altre farine» dell'onboarding: la togliamo? È un metodo di macinazione e non un tipo di farina, e il motore la ignora.**
  - Deciso (raccomandazione accettata in blocco): Toglierla dall'onboarding: oggi non cambia la ricetta e confonde chi conosce le farine (P3).

- **Budget del JS (900 kB gzip, margine 0,4 kB dopo #143)**
  - Deciso (raccomandazione accettata in blocco): prima si recupera peso (cataloghi delle lingue caricati solo per la lingua attiva, dati non usati); un aumento del budget solo se motivato e misurato in `docs/budget-prestazioni.md`.

## Pacchetti di lavoro

### Fondativi

| ID | Pr. | Sforzo | Titolo | Dipende da | Finding |
|---|---|---|---|---|---|
| FW-01 | P1 | M | Registro della scienza: affermazioni, statuto, ipotesi e fonti come dati | — | 56 |
| FW-02 | P1 | M | Pattern «Perché?»: WhyButton + ScienceSheet + EvidenceBadge | FW-01, FW-03 | 27 |
| FW-03 | P2 | M | Primitive di disclosure unificate (ds/Disclosure, InfoTip v2) e divieti | — | 29 |
| FW-04 | P1 | M | Glossario come fonte delle definizioni: TermLink, deep link affidabili, voci mancanti, ricerca localizzata | FW-03 | 38 |
| FW-05 | P1 | L | Coerenza contenuti ↔ motore: fatti del motore esportati e test di parità | FW-01 | 51 |
| FW-06 | P1 | M | Punteggio spiegabile: explainScore() nel motore + ScoreExplainer unico | FW-01, FW-02 | 25 |
| FW-07 | P0 | M | Cucina effettiva unica (resolveEffectiveKitchen) — include il fix P0 dei consigli parametrici | — | 29 |
| FW-08 | P1 | S | Livello di dettaglio globale (PizzaNerd) raggiungibile e coerente | — | 17 |
| FW-09 | P0 | M | Stati vuoti con motivo e via d'uscita — include il fix P0 «Stasera: 0 stili» | — | 29 |
| FW-10 | P1 | S | Esito di fattibilità deduplicato e ordinato | — | 12 |
| FW-11 | P2 | M | Formattazione locale e i18n dei dati di dominio | — | 46 |
| FW-12 | P1 | M | Dialog, focus ed Esc a strati; base di accessibilità | — | 41 |
| FW-13 | P2 | M | Token di stato, contrasto e tipografia minima | — | 28 |
| FW-14 | P1 | M | Ricetta di riferimento e lessico controllato | — | 28 |
| FW-15 | P1 | M | «Metodo e fonti» + Informazioni + trasparenza dell'edizione | FW-01 | 28 |
| FW-16 | P1 | M | Ogni impostazione dichiara il suo effetto; niente promesse vuote | — | 28 |
| FW-17 | P1 | L | Dosi per fase: un solo modello per Ricetta, Procedimento, Cottura e Stampa | FW-01 | 21 |
| FW-18 | P1 | S | Allergeni dell'intera ricetta | — | 3 |
| FW-19 | P1 | L | Piano temporale unico con invarianti (Procedimento + Cottura) | FW-07 | 22 |
| FW-20 | P1 | S | Guardie delle decisioni (D-032, D-036, D-038) e loro ripristino | — | 6 |

### Per schermata

| ID | Pr. | Sforzo | Titolo | Dipende da | Finding |
|---|---|---|---|---|---|
| G1a-WP-01 | P1 | L | Scheda farina: i risultati «Farine» portano alla farina cercata, con dati, statuto e fonte | FW-01, FW-02, FW-03, FW-04, FW-11 | 2 |
| G1a-WP-02 | P2 | M | Ricerca: forni e guide nell'indice, ordine dei gruppi, estratto per le corrispondenze nascoste, filtri scopribili | G1a-WP-01, FW-04, FW-07, FW-09, FW-10, FW-14, FW-15 | 5 |
| G1a-WP-03 | P2 | M | Shell: widget della pizzata che non copre il marchio, etichette del dock compatto, ricerca nella barra laterale, nome del pulsante Profilo | FW-11, FW-12, FW-13, FW-15 | 5 |
| G1b-WP-01 | P2 | M | Pannello stile: «Tecniche d'autore compatibili» diventano versioni d'autore apribili e utilizzabili | FW-03, FW-10, FW-11, FW-14 | 2 |
| G1b-WP-02 | P3 | S | Pannello stile: intestazione senza separatori orfani, verdetto in una colonna, toolbar desktop che non copre il contenuto | FW-03, FW-10, FW-12 | 3 |
| G2-WP-01 | P1 | M | «Parametri collegati» onesti: spenti per chi non li vede, annullabili, mai fuori range | — | 2 |
| G2-WP-02 | P2 | M | Configuratore leggibile: etichette del range sotto le tacche, temperatura guidata, farina del principiante spiegata | G2-WP-01, FW-05 | 5 |
| G2-WP-03 | P2 | S | Profilo impasto: si vede da dove parti, quando l'hai modificato e come tornare al riferimento | FW-14 | 2 |
| G2-WP-04 | P2 | M | «La tua cucina» e Dispensa: prima la lista, poi le opzioni; un solo modo di escludere; niente Acqua e Sale escludibili | FW-03, FW-16 | 5 |
| G2-WP-05 | P2 | S | Pannello «Quando»: titolo, ora del pasto e chip del tempo che dice cosa apre | FW-09, FW-11, FW-12, FW-04 | 2 |
| G2-WP-06 | P3 | S | Budget farina: limite di 200 spiegato, input non validi segnalati, rifiniture del testo nello slider | G2-WP-02 | 2 |
| G3-WP-01 | P2 | M | Tabella di marcia del Procedimento: pasto selezionato, etichette chiare, «≈» spiegato, input a 390 px e hero compatto su mobile | FW-19, FW-11, FW-03, FW-09 | 5 |
| G3-WP-02 | P2 | M | Rimozione dal ricettario reversibile e un solo controllo di salvataggio | FW-14 | 1 |
| G3-WP-03 | P2 | M | Passi che risolvono da soli le condizioni che il motore conosce (pieghe, slap & fold, basilico) | FW-01, FW-05, FW-07, FW-19 | 1 |
| G3-WP-04 | P2 | S | Pannello «Dettagli» della match card: gruppi con titolo | FW-06, FW-10, FW-14 | 1 |
| G3-WP-05 | P3 | S | Voce verbale unica nei passi del Procedimento | G3-WP-03, FW-19, FW-17 | 1 |
| G4a-WP-01 | P1 | M | Modalità cottura: «L'impasto è già pronto?» con conferma, e «Fatto» annullabile | FW-19, FW-12, FW-11 | 2 |
| G4a-WP-02 | P1 | M | Modalità cottura: header compatto con schermo acceso e segnali di fine fase, avanzamento unico, widget anche su Profilo | FW-19, FW-16, FW-12, FW-13, FW-11, G4a-WP-01 | 6 |
| G4a-WP-03 | P2 | M | «Prima di iniziare» concreto: quali condizioni, quando si comincia, quando si mangia, perché il blocco | FW-10, FW-14, FW-16, FW-19, FW-11 | 2 |
| G4a-WP-04 | P2 | M | Hub Impara: card del percorso onesta, con tempi e attrezzatura, e livello modificabile | FW-09, FW-16, FW-04, FW-11, FW-14, FW-19 | 5 |
| G4a-WP-05 | P2 | S | Hub Impara: «Qualcosa non va?» sopra la piega, illustrazioni sensate, griglia su desktop | G4a-WP-04, FW-04, FW-13 | 3 |
| G4b-WP-01 | P1 | M | «Qualcosa non va?» dentro la modalità cottura | FW-12, FW-19 | 1 |
| G4b-WP-02 | P1 | M | Prefermenti: «Come si fa» per biga, poolish e autolisi | FW-01, FW-03, FW-05, FW-09 | 1 |
| G4b-WP-03 | P2 | L | Problemi e soluzioni: ordinati per fase, voci mancanti del principiante, titolo giusto | FW-01, FW-03, FW-05, FW-09, FW-13, G4b-WP-01 | 4 |
| G4b-WP-04 | P3 | S | Glossario: anello di focus della ricerca, icona ripetuta, buco nella griglia desktop | FW-03, FW-04, FW-12, FW-13 | 1 |
| G5-WP-01 | P1 | S | Onboarding: «Salta» non butta più via le scelte già confermate | FW-07, FW-16 | 3 |
| G5-WP-02 | P2 | M | Onboarding: passo leggibile, «Avanti» fermo e congedo con riepilogo modificabile | G5-WP-01, FW-12, FW-13, FW-08 | 3 |
| G5-WP-03 | P2 | M | Forno nell'onboarding: descrizioni riconoscibili e ricerca del modello; banner del modello sotto il campo | FW-07, FW-15, FW-01, FW-12, G5-WP-01 | 3 |
| G5-WP-04 | P3 | S | Copy della cucina: «Altre farine» coerente e gancio impastatore corretto | FW-01 | 2 |
| G5-WP-05 | P2 | M | Ricettario e preferiti: azioni affidabili, Annulla, avvisi d'errore riconoscibili | FW-06, FW-11, FW-12, FW-13 | 4 |
| G5-WP-06 | P2 | S | Impostazioni: «Riconfigura la cucina» con dialog del DS, salvataggio visibile, ruoli interni nascosti | FW-12, FW-16 | 4 |

Ordine: ondata 1 (fondativi senza dipendenze), ondata 2 (fondativi che dipendono dalla 1), ondata 3 (pacchetti per schermata). I dettagli operativi di ogni pacchetto e i 639 finding con evidenze stanno negli artefatti dell'audit (sessione Claude del 28/10/2026).
