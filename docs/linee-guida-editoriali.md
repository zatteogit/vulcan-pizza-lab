# Voce e testi di Vulcan

Revisione del 27 ottobre 2026. Vale per le schermate di Scopri, Crea, Impara,
profilo e ricetta, incluse le versioni stampabili e le traduzioni.

## Voce

Vulcan accompagna una persona che vuole preparare una pizza. Il tono è cordiale,
concreto e competente: spiega cosa osservare, quale scelta fare e cosa cambierà.
Le descrizioni possono evocare sapori e consistenze; le istruzioni devono essere
immediatamente utilizzabili.

- Ogni riga ha un compito. L’occhiello dà il contesto, il titolo identifica,
  il sottotitolo aggiunge un’informazione. Non ripetere tre volte lo stesso nome.
- Usare parole comuni quando bastano: cucina, originale, aggiunte, dettagli,
  riferimento. Riservare termini specialistici alle spiegazioni che li definiscono.
- Descrivere il risultato e la lavorazione. Evitare riempitivi come «alzare
  l’asticella», metafore sentimentali nei punteggi e promesse come «perdona tutto».
- Una condizione richiede una conseguenza o un’azione: cosa manca, cosa va
  controllato, cosa si può modificare. Evitare spiegazioni del funzionamento
  interno dell’app quando non aiutano la scelta.
- Tenere brevi riepiloghi, card e avvisi. Lasciare le fonti e i dettagli nel
  livello espandibile, conservando i limiti necessari a capire il risultato.

## Termini e significato

- **Scopri** presenta stili, storie e ricette di riferimento. **Crea** aiuta ad
  adattare una ricetta alla propria cucina. I nomi della navigazione e i rimandi
  nel testo devono coincidere anche nelle altre lingue.
- **Originale** identifica la versione di partenza. **Su misura** indica
  modifiche applicate. Una modifica non ancora applicata è una **proposta**.
- La **compatibilità** non è una certificazione. Il voto e i requisiti
  indispensabili hanno ruoli diversi: non dedurre la fattibilità dal solo numero.
- Il criterio F descrive la **facilità**; il D la **maturazione stimata**.
  Non presentarli come garanzie di riuscita o di digeribilità individuale.
- Una disponibilità non indicata rimane da verificare. «Non usare» è invece
  un’esclusione esplicita. Non spiegare questa distinzione come una regola di database.
- Per gli allergeni nominare ciò che compare, anche nelle aggiunte. Distinguere
  ingredienti presenti, facoltativi, etichette da controllare e possibili tracce
  dichiarate. Un conteggio di «gruppi» non aiuta la scelta.
- Le istruzioni del procedimento valgono per la ricetta generata. Evitare di
  trasformarle in regole universali per tutti i metodi.
- FW-11. In inglese si scrive **autolyse** (non «autolysis») e **preferment**
  senza trattino, come nella fonte King Arthur. I nomi propri dei luoghi
  d'origine usano l'esonimo della lingua (Napoli → Naples, Neapel, Nápoles):
  la tabella è `placeNames` nel CMS di ogni lingua.
- FW-11. Numeri, intervalli, durate e orari non si scrivono a mano: passano da
  `src/app/i18n/format.ts`. Una durata è sempre «9 h 36 min» (anche oltre le
  24 h, «28 h 48 min»); un intervallo usa il trattino lungo e l'unità una volta
  («6–14 h»); fra numero e unità c'è lo spazio della lingua («387 g»,
  «250 °C»). «Tra», «verso le», «ca.» sono chiavi del catalogo, mai codice.
- FW-11 (D-J). Nel sistema imperiale le dosi sotto i 10 g (lievito, sale,
  zucchero) restano in grammi: in once a due decimali l'errore arriva al
  ±50 %. È una scelta di Vulcan, detta all'utente nel Profilo.

## Contenuti e traduzioni

La revisione comprende i testi condivisi del CMS, le stringhe UI montate, le
29 descrizioni degli stili, i percorsi didattici e le definizioni del glossario
che usavano gergo o confondevano punteggi e garanzie. Le storie con attribuzioni,
le denominazioni protette e le fonti restano contenuti documentati: una revisione
stilistica non autorizza a inventare fatti, approvazioni o ricette ufficiali.

I parametri numerici e le regole di calcolo del motore non sono oggetto di questa
revisione. Il dettaglio tecnico conserva intervalli, unità e formule.

Le sette lingue devono mantenere lo stesso significato, con sintassi naturale
per ciascuna. Il registro deve restare coerente tra titoli, istruzioni e avvisi:
in italiano si usa il tu; in francese si conserva il vous e nel portoghese
pt-BR la forma con você, come nel resto dell’interfaccia. Controllare articoli, maiuscole e declinazioni nei messaggi con
segnaposto. Le copie condivise tra CMS e fallback UI fanno riferimento alla
stessa stringa, per evitare che tornino due voci diverse.

## Verifica

Rileggere i testi nelle schermate, sia su mobile sia su desktop: la stessa
frase può essere chiara da sola e risultare ripetitiva accanto a un titolo.
Controllare anche stati vuoti, errori, condizioni mancanti, ricette adattate,
stampa e ripristino delle preferenze. La copertura i18n controlla chiavi e
segnaposto; non sostituisce la lettura del testo reso.
