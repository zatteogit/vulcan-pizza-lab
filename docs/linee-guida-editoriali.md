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
- **Riferimento** identifica la ricetta di partenza di uno stile, dichiarata nei
  dati (D-B). **Su misura** indica modifiche applicate. Una modifica non ancora
  applicata è una **proposta**. Vedi la tabella §Termini.
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
- **Statuto di un'affermazione** (D-A, FW-01): **Esatto** (definizione o
  aritmetica), **Stima** (modello empirico con incertezza), **Ipotesi**
  (assunzione del modello, come la cucina a temperatura standard), **Scelta di
  Vulcan** (convenzione di prodotto, come i pesi del punteggio). L'etichetta
  compare nel «Perché?» (livello 3, e al 2 quando serve), mai come rumore al
  livello 1. Una stima non mostra più decimali di quelli che regge; un dato «da
  verificare» non compare al livello 1 come fatto. Lo statuto di ogni
  affermazione sta nel registro `src/app/data/science-notes.ts`, non nel testo.
- Nessuna caratteristica di stile, chip o descrizione breve promette
  digeribilità o idoneità dietetica: se serve, se ne parla al livello 2 con la
  nota che dice cosa il modello non misura.
- **Dettagli tecnici** (nel Profilo «Mostra i dettagli tecnici», soprannome
  **PizzaNerd**, D-056) decide solo quante informazioni si vedono aperte di
  default; il **livello di esperienza** cambia invece la ricetta proposta (tetto
  d'idratazione, prefermenti). Non usarli come sinonimi e non scrivere che i
  dettagli tecnici rendono la ricetta più difficile.

### Termini (tabella vincolante, FW-14)

Lo stesso oggetto ha lo stesso nome in ogni schermata, lingua e canale
(scheda, ricerca, profilo, stampa, MCP). Un pacchetto che introduce un termine
lo aggiunge qui e, se è tecnico, al glossario.

| Termine | Che cosa indica | Dove | Da non usare |
|---|---|---|---|
| **Riferimento** | La ricetta di partenza dello stile, dichiarata in `STYLE_REFERENCES` (`style-versions.ts`): il disciplinare dove esiste, altrimenti una versione «da confermare». Tutti i «Prima → Ora» partono da qui | eyebrow della scheda, chip di default del selettore, punteggio delle card | «Originale», «Tradizionale», «canonica» (nei testi) |
| **Riferimento sul tuo forno** | Il riferimento ricalcolato sulla cucina dell'utente, quando se ne scosta (forno sotto il minimo dello stile, STG senza forno a legna) | eyebrow | «Originale» sopra «fuori disciplinare» |
| **Disciplinare {sigla}** | Il riferimento è un disciplinare (AVPN/STG, IGP, APITER) e la ricetta lo rispetta | eyebrow, badge | «Disciplinare» su una ricetta che se ne scosta |
| **Su misura** | Parametri modificati dall'utente o dall'ottimizzatore | eyebrow, punteggi | «Personalizzata», «Adattata» |
| **Versione** | Il selettore delle interpretazioni (disciplinari, maestri, pizzerie) | etichetta, aria-label, titolo della modale, pannello Personalizza | «Ispirazione», «Firma», «Interpretazione» come nome del selettore |
| **Ispirata a {nome}** | Una versione d'autore: ricostruzione da fonti pubbliche, non la ricetta del maestro (D-027) | eyebrow, card | «di {nome}», «ricetta originale di» |
| **Profilo impasto** | Le varianti dello stile in `style-versions.ts` (Casalinga, Classica…) | pannello Personalizza, eyebrow «Profilo {nome}» | «Versione» (è il selettore delle interpretazioni) |
| **prefermento** | Biga, poolish e simili; una sola grafia, minuscola in frase | ovunque in italiano | «pre-fermento», «Pre-Fermento», «preimpasto» |
| **Salva nel ricettario / Rimuovi dal ricettario** | Salvare una ricetta | segnalibro, card, toast, dialog | «preferiti» (sono gli stili preferiti, un'altra cosa), «Salva questa versione» |
| **Nome del prodotto** | `BRAND.name` da `src/app/config/brand.ts` nei titoli («Scopri · Vulcan»); `BRAND.fullName` solo per `<title>` statico e manifest | titoli delle viste, dialog | nomi scritti a mano |
| **Nomi dei forni** | Dal catalogo `cms.ovenPresets`, in sentence case («Forno di casa», «Forno a legna»); elenchi in ordine di temperatura massima; temperatura sempre dal formatter (`fmt.celsius`), mai concatenata a mano | profilo, Crea, scheda stile | «Forno Domestico», «Forno a Legna», «Max » + numero + «°C» |
| **Livello {n}** | Livello di esperienza 1–4, con i nomi del CMS (1 Principiante, 2 Intermedio, 3 Avanzato, 4 Esperto) | profilo, Crea | «LV1», elenchi locali dei nomi |
| **Stili di pizza** | La sezione e il filtro degli stili in Scopri; un solo verbo per «vedi tutto» («Vedi tutti/tutte») | Scopri | «Stili tradizionali», «Esplora tutti» |
| **Tradizioni regionali** | Famiglia degli stili storici non napoletani né romani (D-G, da confermare stile per stile) | Scopri, Crea, MCP | «Contemporanea» per focacce e pizze storiche |
| **Genera ricetta** | La CTA del pannello stile, su ogni breakpoint | pannello stile | «Crea» (è il nome della tab) |
| **Perché?** | Il pulsante (icona + testo) che apre la scienza di un valore: `WhyButton` → `ScienceSheet` (FW-02). Livelli fissi **In breve** · **Perché** · **Come lo calcoliamo** (chiuso), più **In questa ricetta** per i numeri della ricetta. Con un'etichetta propria (titolo della nota, «Ricetta e disciplinare») resta lo stesso pulsante | ovunque un valore deriva da una stima, un'ipotesi o una scelta | «?» decorativi, `title=` come spiegazione, «Approfondisci» per aprire la scienza, popover «perché» fatti a mano |
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
