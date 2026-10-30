# Voce e testi di Vulcan

Revisione del 27 ottobre 2026, aggiornata il 30 ottobre (scala degli esiti).
Vale per le schermate di Scopri, Crea, Impara, profilo e ricetta, incluse le
versioni stampabili e le traduzioni.

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

### Voce verbale dei passi (D-G3-01, G3-WP-05)

I passi del Procedimento parlano a chi sta impastando adesso, quindi usano
l'**imperativo di seconda persona**: «Impasta fino a incordatura», «Dividi in
panetti», «Cuoci a {temp}», «Accendi ora il forno». Mai l'infinito da
ricettario («Impastare», «Dividere», «Cuocere»), nemmeno in una sola frase
dello stesso passo. (Queste linee guida, che parlano a chi scrive, restano
all'infinito.)

- Vale per descrizione breve e alternativa (`desc`, `descAlt`), «Come si fa»
  (`longDesc`, `longDescAlt`), consigli (`tipBeginner`, `tipNerd`), testi del
  motore `timeline.*` e passi del condimento (`assembly_steps`,
  `pre_prep_steps` della libreria topping), compresi i testi di riserva in
  italiano del motore.
- Il divieto usa la negazione dell'imperativo: in italiano «Non salare», «Non
  aprire il forno».
- Le descrizioni nominali restano ammesse quando non descrivono un gesto
  («Lievitazione in massa a {temp}», «Olio a filo»).
- I titoli dei passi base restano sostantivi («Impasto», «Puntata», «Cottura»).
  I titoli dei passi del condimento possono essere un sostantivo («Condimento
  Margherita romana») o un imperativo («Stufa la cipolla»), mai un infinito.
- Forma per lingua: it imperativo con il tu; en imperativo; de imperativo con
  il du, come nel resto del catalogo; fr imperativo con il vous; es imperativo
  con il tú; pt imperativo con você («Divida», «Misture»); ja forma in -ます.
  In francese l'infinito da ricettario c'era solo nelle descrizioni brevi,
  mentre i testi del motore erano già all'imperativo: nessuna eccezione.
- La guardia è `src/app/features/cms/step-voice.test.ts`: controlla la prima
  parola di ogni frase in italiano (catalogo, libreria topping e passi prodotti
  dal motore per tutti gli stili, in cucina ideale e di casa) e in fr, es, pt.
  Le eccezioni stanno in un elenco, ognuna con il suo motivo («Disciplinare» è
  un sostantivo).
- Da allineare: le traduzioni dei passi del condimento in
  `src/app/data/topping-i18n/` (titoli all'infinito in fr, descrizioni
  all'infinito in es e pt). L'italiano è già allineato e protetto dal test.

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
| **Versioni d'autore** | La sezione del pannello stile con le versioni (maestri, pizzerie, disciplinari) di quello stile; una versione nata su un altro stile dice «da {stile}» (G1b-WP-01) | pannello stile | «Tecniche d'autore compatibili» («compatibili» accanto a una STG suggerisce conformità) |
| **Profilo impasto** | Le varianti dello stile in `style-versions.ts` (Casalinga, Classica…) | pannello Personalizza, eyebrow «Profilo {nome}» | «Versione» (è il selettore delle interpretazioni) |
| **prefermento** | Biga, poolish e simili; una sola grafia, minuscola in frase | ovunque in italiano | «pre-fermento», «Pre-Fermento», «preimpasto» |
| **Salva nel ricettario / Rimuovi dal ricettario** | Salvare una ricetta | segnalibro, card, toast, dialog | «preferiti» (sono gli stili preferiti, un'altra cosa), «Salva questa versione» |
| **Nome del prodotto** | `BRAND.name` da `src/app/config/brand.ts` nei titoli («Scopri · Vulcan»); `BRAND.fullName` solo per `<title>` statico e manifest | titoli delle viste, dialog | nomi scritti a mano |
| **Nomi dei forni** | Dal catalogo `cms.ovenPresets`, in sentence case («Forno di casa», «Forno a legna»); elenchi in ordine di temperatura massima; temperatura sempre dal formatter (`fmt.celsius`), mai concatenata a mano | profilo, Crea, scheda stile | «Forno Domestico», «Forno a Legna», «Max » + numero + «°C» |
| **Livello {n}** | Livello di esperienza 1–4, con i nomi del CMS (1 Principiante, 2 Intermedio, 3 Avanzato, 4 Esperto) | profilo, Crea | «LV1», elenchi locali dei nomi |
| **Stili di pizza** | La sezione e il filtro degli stili in Scopri; un solo verbo per «vedi tutto» («Vedi tutti/tutte») | Scopri | «Stili tradizionali», «Esplora tutti» |
| **Tradizioni regionali** | Famiglia degli stili storici non napoletani né romani (D-G, da confermare stile per stile) | Scopri, Crea, MCP | «Contemporanea» per focacce e pizze storiche |
| **Genera ricetta** | La CTA del pannello stile, su ogni breakpoint | pannello stile | «Crea» (è il nome della tab) |
| **Metodo e fonti** | La pagina di Impara generata dal registro della scienza (`/learn/metodo`, FW-15, D-D): come lavora il motore, note con statuto, ipotesi, fonti con stato, limiti, versione | Impara, Informazioni, Profilo, «Perché?» (L3) | «Bibliografia», «Scienza», «Riferimenti» (il glossario non ha fonti) |
| **Edizione per {partner}** | Il blocco che dichiara per chi è un'edizione e la regola di neutralità del motore (FW-15, D-K); i testi vengono dallo schema dell'edizione | Informazioni, onboarding | «Sponsorizzato da», «in collaborazione con» |
| **Pieghe** | Il passo con i giri di pieghe (stretch & fold) prima della puntata: numero e intervallo da `FOLDING_DB`, mai scritti a mano in un altro testo (FW-19) | Procedimento, modalità cottura | «~30 min» o «ogni 45 minuti» in testi diversi dal passo |
| **Recupero del forno** | Il tempo fra due cotture in serie per sfornare, infornare e far tornare in temperatura la platea; ipotesi del modello (nota `bake-round-recovery`, FW-19) | passo Cottura, banner del modello, modalità cottura | «tempi morti» |
| **«ca.»** | L'orario incerto: l'inizio del passo che segue un'attesa biologica e la fine della pizzata. Una sola notazione, anche nella tabella di marcia (FW-19) | Procedimento, modalità cottura | «≈», «~» davanti agli orari |
| **Perché?** | Il pulsante (icona + testo) che apre la scienza di un valore: `WhyButton` → `ScienceSheet` (FW-02). Livelli fissi **In breve** · **Perché** · **Come lo calcoliamo** (chiuso), più **In questa ricetta** per i numeri della ricetta. Con un'etichetta propria (titolo della nota, «Ricetta e disciplinare») resta lo stesso pulsante | ovunque un valore deriva da una stima, un'ipotesi o una scelta | «?» decorativi, `title=` come spiegazione, «Approfondisci» per aprire la scienza, popover «perché» fatti a mano |
| **Scheda farina** (G1a-WP-01) | La pagina di una farina (`/learn/flour/<id>`): a cosa è adatta, poi nei **Dati tecnici** W, P/L, proteine, assorbimento, falling number e stabilità con lo statuto e «Da verificare» se nessuna scheda del produttore li conferma; un valore che la scheda contraddice non si mostra | ricerca («Farine»), Impara | «Scheda tecnica» (è il documento del produttore), «Profilo farina» |
| **Carico d'impasto** (FW-04) | Grammi di impasto per cm² di pizza (peso del panetto ÷ area, voce di glossario «Thickness Factor»); lo **spessore** è solo quello in mm | scheda stile | «Spessore» per un valore in g/cm² |
| **W** (FW-04, D-060) | La forza della farina: come fascia dello stile («W 260–310»), con la W sempre davanti al numero; la W puntuale solo nei confronti | card, ricetta, scheda stile | «280 W» (si legge watt), una W puntuale come requisito |
| **TermLink** (FW-04) | Ogni sigla o termine tecnico visibile (W, P/L, staglio, appretto…) si apre in un tocco sulla definizione e porta alla voce del glossario; il termine deve esistere in `glossary-data.ts` (test `term-link.test.ts`) | ovunque fuori dagli elementi già interattivi | sigle nude, `title=` come unica spiegazione |
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

### Scala degli esiti (lessico controllato, decisione di Matteo del 30/10/2026)

L'esito di una ricetta per la cucina dell'utente si dice con **una scala
sola**, quella del risultato, in tono diretto e gentile: niente «Così non è
fattibile», «Non fattibili così», «Con condizioni», «Da verificare» o
«Attenzione:» come esito. Chi legge deve sentirsi accompagnato, non
rimproverato: «per ora» dice che cambiando forno, tempo o dispensa la
ricetta si sblocca.

| Esito del motore | Forma piena | Forma breve (badge, pill) |
|---|---|---|
| `ok` (anche `warnings` con le sole verifiche di dispensa, D-060) | **Si può fare** | **Si può fare** |
| `warnings` · `has_caveats` | **Si può fare, con qualche accortezza** | **Con accortezza** |
| `not_feasible` | **Per ora non si può fare** | **Per ora no** |

- **Dove si usa la forma piena**: titolo dell'avviso (`cms.ui.verdictTitle`,
  `RecipeVerdictNotice`), stato della match card (`statusLabel`),
  intestazione del pannello stile e dei gruppi degli elenchi di stili
  (`cms.tiers.<tier>.label`), frasi che annunciano l'esito (aria-label della
  pill «Per ora non si può fare con la tua cucina», voce Siri/Alexa per
  l'esito negativo, guida MCP). Dove l'esito è già scritto subito sopra
  (introduzione dei dettagli della match card) non si ripete: si dice che
  cosa c'è sotto («Qui sotto trovi le accortezze da seguire…»). La voce, dopo una ricetta
  letta per intero, introduce le avvertenze con «Con qualche accortezza:»:
  la ricetta detta è già il «si può fare» e la risposta resta entro le 70
  parole.
- **Forma breve** solo dove lo spazio è stretto: badge delle versioni
  d'autore nel pannello stile (`engineMessages` `card.ready`,
  `card.toVerify`, `card.notForNow`).
- **Gruppi**: l'intestazione resta al singolare impersonale, uguale
  all'esito del singolo stile. La stessa chiave (`cms.tiers`) intitola il
  gruppo in Crea e il riquadro del pannello di uno stile, e la match card la
  riusa: una frase sola per esito, in tutte le schermate.
- **Nelle frasi** si declina la stessa scala («per ora quello stile non si può
  fare», «per ora nessuna ricetta si può fare»), senza tornare a «fattibile».
  I codici macchina (`not_feasible`, `has_caveats`, campi JSON dell'MCP) non
  cambiano e non si mostrano.
- **Le altre lingue** dicono la stessa cosa con la loro voce, non parola per
  parola:

  | Lingua | Si può fare | Con qualche accortezza | Per ora non si può fare | Brevi |
  |---|---|---|---|---|
  | en (GB) | You can make it | You can make it, with a little care | Not possible just yet | You can make it · With care · Not just yet |
  | de (du) | Das klappt | Das klappt, mit etwas Sorgfalt | Im Moment klappt es noch nicht | Das klappt · Mit Sorgfalt · Noch nicht |
  | fr (vous) | C’est possible | C’est possible, avec quelques précautions | Pour l’instant, ce n’est pas possible | C’est possible · Avec précautions · Pas pour l’instant |
  | es (tú) | Se puede hacer | Se puede hacer, con un poco de cuidado | Por ahora no se puede hacer | Se puede hacer · Con cuidado · Por ahora no |
  | pt-BR (você) | Dá para fazer | Dá para fazer, com alguns cuidados | Por enquanto não dá para fazer | Dá para fazer · Com cuidado · Por enquanto não |
  | ja (です・ます) | 作れます | 少し気をつければ作れます | 今はまだ作れません | 作れます · 注意点あり · 今は作れません |

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
