---
titolo: "Vulcan — White-label & Product Strategy · Ottobre 2026"
data: 2026-10-22
fonte: "Vulcan_Report_Editoriale_2026_v2.pdf"
pagine: 27
nota: "Documento di ricerca esterno: ipotesi da verificare, non decisione di prodotto"
versione: "pubblica, senza contenuti economici e commerciali; il PDF completo è nel repository privato basecamp, ricerca/report-2026/"
---

<!-- Copertina: omessi gli elementi grafici decorativi senza testo utile (illustrazione della pizza, monogramma «V», etichette circolari «MATTER / HEAT», «SYSTEMS FOR DOUGH», «01 FORMULA», «02 FERMENTATION», «03 BAKING», «04 LEARNING»). -->

**VULCAN**\
Ricerca, product strategy e licensing\
Edizione aggiornata con Claude

22 OTTOBRE 2026\
RICERCA / UX / BUSINESS MODEL\
STRATEGIA / PRODUCT DISCOVERY / 2026

**THE SCIENCE OF DOUGH · LICENSING STRATEGY**

# Progettare la *pizza possibile.*

Ricerca di mercato, audit tecnico riferito da Claude e piano per trasformare il motore della pizza in un servizio white-label per brand di farine e forni.

**EXECUTIVE BRIEF / 01** · 22.10.2026

## Un motore già costruito. *Un mercato da verificare.*

Claude riferisce un motore maturo, un ampio catalogo e una UX personalizzabile. La prima ipotesi da validare è il licensing white-label a mulini e produttori di forni, mantenendo l’app pubblica come vetrina. Le caratteristiche tecniche richiedono verifica diretta sul codice.

- **28–29** — Stili modellati secondo l’analisi di Claude
- **7** — Lingue presenti nel progetto secondo Claude
- **2** — Demo tenant: mulino e produttore di forni
- **1–2** — Piloti commerciali da cercare nel 2027

> **TESI DI PRODOTTO**
>
> Il valore da testare è un **solver incorporabile** nel sito di un brand: un percorso spiegabile che aiuta il cliente a utilizzare farine e forni reali. La qualità dell'engine e la volontà dei partner di pagare restano da dimostrare.

Le funzionalità riportate da Claude provengono dalla sua ispezione del progetto, non da un audit indipendente in questa revisione. I prezzi e i ricavi nel documento sono esclusivamente scenari.

## Indice

| N. | Sezione | Pagina |
|---|---|---|
| 01 | Executive summary: perché la strategia cambia | 4 |
| 02 | Stato del prodotto: inventario riferito dall’audit di Claude | 4 |
| 03 | Dimensioni del comparto pizza: i dati e i loro limiti | 5 |
| 04 | Segmenti, contesti e Jobs to Be Done | 6 |
| 05 | La catena del valore dell’esperienza pizza | 6 |
| 06 | Pain points: evidenze, aneddoti e ipotesi | 7 |
| 07 | Analisi concorrenti: il contesto è già maturo | 7 |
| 08 | Posizionamento: “Intelligenza operativa dell’impasto” | 8 |
| 09 | Gemini e Claude: contributi, divergenze e sintesi critica | 9 |
| 10 | Vincoli “hard”, preferenze “soft” e impossibilità dichiarata | 9 |
| 11 | Architettura funzionale proposta | 10 |
| 12 | Fattibilità scientifica: precisione senza falsa esattezza | 11 |
| 13 | Hardware adaptation: il vero differenziatore, se dimostrato | 11 |
| 14 | Stili di pizza: una tassonomia operativa | 12 |
| 15 | UX journey: dalla cena al risultato | 13 |
| 16 | Priorità: dalla feature al pacchetto licenziabile | 13 |
| 17 | Food cost: opportunità reale ma non tesi centrale | 14 |
| 18 | Business model aggiornato: B2B2C prima del freemium | 15 |
| 19 | Economia delle licenze: simulazioni, non previsioni | 16 |
| 20 | TAM / SAM / SOM: per il licensing serve una lista di account | 17 |
| 21 | Offerta white-label: cosa compra davvero un brand | 17 |
| 22 | Rischi specifici di commercializzazione | 18 |
| 23 | KPI aggiornati: il partner deve vedere valore | 19 |
| 24 | Piano operativo aggiornato: da prodotto esistente a pilota licenziabile | 20 |
| 25 | Interviste e prove: utenti e potenziali brand | 20 |
| 26 | Roadmap commerciale e criteri go/no-go | 21 |
| 27 | Lean Canvas: versione licensing-first | 22 |
| 28 | Raccomandazione conclusiva dopo Claude | 22 |

> Versione pubblica: sono omesse le sezioni 03, 18, 19, 20, 26, 27 e l’Appendice D; nelle sezioni 22, 23, 24 e nell’Appendice B sono omessi singoli paragrafi o righe di tabella (contenuti economici e commerciali). Il PDF completo è nel repository privato basecamp, ricerca/report-2026/.

## 01 — Executive summary: perché la strategia cambia

**Vulcan è un asset di prodotto già sviluppato, non soltanto un concept.** Claude riferisce di aver esaminato la web app React/Vite, documentazione di progetto, audit UX e componenti di dominio. Dal suo resoconto emergono un engine evoluto, circa 28–29 stili, sette lingue, CMS JSON, temi e una struttura originariamente predisposta anche per l’incorporamento in siti di terzi. Sono informazioni **da verificare con una code review indipendente**, ma sufficientemente specifiche da cambiare le ipotesi di business da testare.

**Nuova prima ipotesi commerciale: concedere il motore in licenza a marchi di farine e forni, mantenendo l’app pubblica come vetrina e ambiente di test.** Per un mulino il valore possibile non è «un altro calcolatore», ma un servizio post-vendita che suggerisce processi coerenti con le sue farine; per un produttore di forni è la possibilità di accompagnare il cliente all’uso corretto delle attrezzature. Il valore va dimostrato con metriche d’uso e accordi commerciali, non presunto.

Tre percorsi restano distinti: **(A) white-label / embedded B2B2C, da validare per primo; (B) app consumer gratuita con possibile Pro successivo; (C) software operativo per pizzerie, solo come prodotto futuro e distinto.** Il solver resta il nucleo proprietario per tutti: niente promesse di precisione assoluta o ricette «garantite».

**Decisioni immediate:** audit reale del repository e delle performance; un pacchetto embed configurabile; analytics rispettose della privacy; un pilota di co-design con almeno un brand; verifica di anteriorità del nome «Vulcan» presso EUIPO e, se rilevante, USPTO. L’esistenza dell’omonimo marchio di attrezzature commerciali è verificata, ma non equivale da sola a conflitto legale (ITW Food Equipment Group, s.d.).

## 02 — Stato del prodotto: inventario riferito dall’audit di Claude

Claude dichiara di aver letto documentazione, audit e porzioni mirate del codice. Non ha controllato tutto il repository riga per riga; noi non abbiamo eseguito un audit tecnico indipendente nella presente revisione. **Le voci seguenti sono pertanto un inventario di lavoro, non una certificazione di funzionalità o qualità.**

| Area | Evidenza riportata da Claude | Implicazione | Verifica indipendente richiesta |
|---|---|---|---|
| Frontend | React/Vite, applicazione web | Può essere esposta come embed | Prova reale in iframe e sicurezza embedding |
| Domain engine | `pizza-engine.ts` \~3.500 righe, Q10 variabile, calcolo temperatura e vincoli, viabilità termica e temporale | Asset di dominio potenzialmente licenziabile | Test unitari, benchmark, revisione scientifica |
| Catalogo | 28–29 stili, 4 famiglie, farine, topping e ricette editoriali | Ampio materiale pronto per contenuti brand | Licenze, fonti, consistenza dei dati |
| Localizzazione | 7 lingue IT/EN/ES/DE/FR/PT/JA | Potenziale distribuzione internazionale | QA linguistica ed etichette legali |
| Personalizzazione | Token in 4 livelli, tema Editorial FireGlow, dark mode, CMS import/export JSON | Base per design white-label | Temi brand, contrasti, accessibilità, tenancy |
| Hosting | Cloudflare Worker e D1 usato per debug | Stack leggero, operatività da precisare | SLO, deploy, isolamento dati, privacy |
| Persistenza | Profilo, dispensa e ricette in `localStorage` | Demo semplice senza account | Portabilità dati, perdita dati, cross-device |
| Cottura | Notification API senza push server/service worker affidabili | Timer utilizzabile solo in alcuni contesti | Test in background, browser e iOS |

Secondo Claude, alcune criticità segnalate nell’audit UX di luglio risultano corrette: controllo `temporalViability`, maturazione per fase, chiavi di salvataggio e profilo ricetta. **Non riporterei la percentuale «70–80% pronto» come una misura oggettiva**: manca una checklist ponderata di requisiti commerciali e la prova con un cliente.

La maturità di un prodotto **tecnicamente ricco** non implica prontezza per il licensing. Mancano nel resoconto: analytics di prodotto, dashboard per il cliente partner, configurazione isolata per ogni tenant, contratti/SLA, evidenza d’accessibilità per l’integrazione, monitoraggio delle prestazioni e governance dei contenuti. Il valore oggi è il capitale di dominio e UX; il lavoro da completare è soprattutto di packaging, integrazione, misurazione e vendita.

## 03 — Dimensioni del comparto pizza: i dati e i loro limiti

> Sezione omessa nella versione pubblica (contenuti economici e commerciali). Il PDF completo è nel repository privato basecamp, ricerca/report-2026/.

## 04 — Segmenti, contesti e Jobs to Be Done

| Segmento | Job principale | Situazione d’uso | Pagamento da verificare |
|---|---|---|---|
| Home baker principiante | Fare una buona pizza con ciò che possiede | Forno domestico, ricette confuse, poco tempo | Bassa-media |
| Home baker evoluto | Riprodurre, correggere, sperimentare | Farine tecniche, frigorifero, forno pizza | Media |
| Pizzaiolo indipendente | Standardizzare le produzioni | Volumi variabili, cambi farine, staff | Media se ROI misurabile |
| Responsabile multi-locale | Ridurre variabilità e formare personale | Processi, ricette master, controllo versioni | Potenzialmente superiore |
| Scuola e docente | Spiegare le cause delle scelte tecniche | Laboratori e moduli didattici | Licenze formative |
| Brand di farine o forni | Supportare l’utilizzatore dopo la vendita | Onboarding e protocolli per prodotti | Progetto partner |

**JTBD B2C:** «Quando voglio mangiare pizza alle 20 con un forno da 250 °C e una farina che ho già, voglio sapere quale stile posso ottenere in modo sensato, cosa fare e quando, e come correggere il piano se cambia qualcosa». **JTBD B2B:** «Quando cambia una variabile o la domanda di produzione, voglio ottenere lotti consistenti, ridurre errori di calcolo e trasferire procedure ripetibili ai collaboratori».

Questi job sono **ipotesi da validare con interviste e prove sul campo**, non risultati di uno studio etnografico già svolto.

## 05 — La catena del valore dell’esperienza pizza

Per Vulcan il percorso non è soltanto *ricetta → forno*. È:

**Definire obiettivo → verificare vincoli → scegliere formula/processo → pianificare → preparare impasto → osservare e correggere → formare/stendere → cuocere → valutare → versionare**.

I dati devono sopravvivere da una fase all’altra. L’utente non dovrebbe dover inserire cinque volte il numero di panetti, né cambiare ricetta silenziosamente dopo una correzione.

| Momento | Problema tipico | Opportunity |
|---|---|---|
| Scelta stile | Aspettative incompatibili col forno | Diagnosi di fattibilità e alternative |
| Dimensionamento | Percentuali e pesi incoerenti | Bilanci di massa con verifica automatica |
| Pianificazione | Cena fissata, tempi sbagliati | Backward planning con margini e finestre |
| Impasto | Temperatura finale non controllata | Calcolo condizionato e correzioni |
| Fermentazione | Ambiente e frigorifero variabili | Scenario e checkpoint, non timer magico |
| Formatura | Impasto poco estensibile o debole | Segnali osservabili e opzioni di recupero |
| Cottura | Fondo/volta non bilanciati | Adattamento del processo al forno reale |
| Risultato | Nessun apprendimento strutturato | Diario, versioning e feedback |

## 06 — Pain points: evidenze, aneddoti e ipotesi

I bisogni evocati da Gemini sono plausibili: formule su quaderni, temperatura instabile, limite del forno, sprechi e mancata misura della qualità. Non disponiamo però di una ricerca campionaria che ne dimostri frequenza, costo o priorità. Nel report li tratteremo come **ipotesi di scoperta**.

Il peso della tecnologia è comunque credibile: la letteratura sulla lievitazione della pizza mostra variazioni reologiche importanti al crescere del tempo; nello studio di impasti napoletani pubblicato nel 2023, i campioni cambiano progressivamente estensibilità e struttura durante la fermentazione (Covino et al., 2023). Non ne discende un modello universale applicabile a ogni farina e processo.

**Problema prioritario B2C:** prevedere e gestire una cena riuscita con setup reale, non raggiungere un’impossibile precisione scientifica assoluta. **Problema prioritario B2B:** standardizzare la ricetta, gestire deviazioni e quantificare errori e scarti, non sostituire il POS di pizzeria.

## 07 — Analisi concorrenti: il contesto è già maturo

| Prodotto | Offerta pubblicamente dichiarata | Cosa rende insufficiente una copia |
|---|---|---|
| PizzApp+ | Percentuali ingredienti, quantità di lievito, ricette salvate e condivise | La sola algebra dell’impasto è già gratuita |
| Ooni app | Calcolo lievito/idratazione/tempi/temperatura, guide, Bluetooth per alcuni forni | Forte integrazione hardware-brand |
| DoughFlow | Baker’s %, planner interattivo, temperatura acqua, biga/poolish, farine/W | Già copre molta “precisione” promessa |
| Pizzapp Lab | Diario, timeline ricalcolabile, fermentazione, farine, AI | Pianificazione e learning loop non sono spazi vuoti |
| Panetto | Formule, timer, baking mode, import AI, sonda BLE | Eccellente attenzione al contesto d’uso |
| Pizzaiolo App | Ricette adattate a forno/farina/tempo, diario, versioni, coach AI | Promette proprio il posizionamento oven-centric |
| ERP/POS ristorazione | Ordini, vendite, giacenze, food cost e amministrazione | Non competere sulle funzioni generaliste |

**Fonti:** NFP Software (2026); Ooni (2026); DoughFlow (2026); Russo (2026); Panetto (s.d.); Pizzaiolo App (s.d.). Funzioni riportate da siti e store dei produttori: non sono audit funzionali.

**Spazio non ancora dimostrato:** a differenza di funzioni isolate, un solver che gestisce incompatibilità, margini di errore, spiegazioni di compromesso e revisione delle condizioni lungo l’intero processo. Bisogna verificarlo con benchmark strutturati, perché alcuni concorrenti dichiarano già capacità analoghe.

## 08 — Posizionamento: “Intelligenza operativa dell’impasto”

La promessa non può essere «la pizza perfetta garantita»; i parametri non osservati sono troppo numerosi. Una promessa più credibile è:

> **Vulcan trasforma i tuoi vincoli reali in un procedimento coerente, ti dice quando un risultato non è realistico e ti aiuta a migliorare attraverso le prove.**

L’headline creativa «Meno magia, più termodinamica» può funzionare come campagna, ma nel prodotto preferirei **«Progetta la pizza che puoi davvero fare»**, perché la termodinamica da sola non descrive fermentazione, reologia ed esperienza operativa.

La differenziazione dovrebbe manifestarsi nel comportamento del prodotto: mostrare la fattibilità dello stile, dichiarare le assunzioni, segnalare variabili sensibili, rendere visibili i compromessi, produrre istruzioni concrete e conservare uno storico delle decisioni.

## 09 — Gemini e Claude: contributi, divergenze e sintesi critica

**Gemini** propone backward planning, correzioni termiche, forno-centrismo, stili differenziati, food cost e partnership con produttori di farina e forno. Le ipotesi di motore sono interessanti, ma non autorizzano formule universali: `T_acqua = 60 − (T_ambiente + T_farina)` è una scorciatoia incompleta; anche Q10 è un’approssimazione che richiede calibrazione su condizioni e materiali specifici. Nessun algoritmo può promettere certezza sulla lievitazione a un minuto dato.

**Claude** aggiunge una scoperta strategica: secondo la sua ispezione, molte funzionalità e l’architettura white-label sono **già presenti**, mentre mancano soprattutto strati commerciali (embed configurabile, dashboard, analytics e SLA). La conclusione «white-label come primo esperimento» è plausibile **perché riduce la necessità di acquisire migliaia di utenti paganti**, ma non dimostra che i brand compreranno la licenza o che il costo di manutenzione sarà basso.

| Tema | Gemini | Claude | Scelta aggiornata |
|---|---|---|---|
| Motore di calcolo | Investire nella termo-cinetica | Engine già articolato | Audit e calibrazione, non rifacimento |
| Differenziazione | Adattamento al forno | Profondità del dominio e stili | Spiegazioni + limiti, test contro concorrenti |
| Monetizzazione primaria | Freemium Pro | Licensing B2B2C | Testare white-label per primo |
| Professionisti | Licenza leggera per pizzerie | Prodotto separato e più distante | Non entra nell’MVP commerciale |
| Canale di acquisizione | Partner mulini/forni | Partner come clienti paganti | Preparare una demo co-branded |
| Rischi | Accuratezza e qualità | Nome, peso bundle, push, analytics | Gate di lancio espliciti |

**Correzioni necessarie:** evitare un paywall a idratazione 70%; non presentare come uniche sul mercato funzioni che i concorrenti possono avere; non presumere che gli appassionati paghino «senza attrito»; non attribuire a un brand approvazioni o collaborazioni non autorizzate.

## 10 — Vincoli “hard”, preferenze “soft” e impossibilità dichiarata

**Hard constraints:** quantità totale/massa, disponibilità ingredienti, incompatibilità con allergie dichiarate, temperatura fisica di attrezzature, tempi minimi tecnicamente necessari nelle condizioni assunte, e rispetto di eventuali regole scelte dall’utente per aderire a un disciplinare.

**Soft constraints:** autenticità stilistica, alveolatura desiderata, facilità di lavorazione, praticità, complessità, tempo attivo, disponibilità al compromesso, preferenze sensoriali.

Tre risultati possibili del solver:

- `SUCCESS`: scenario fattibile entro assunzioni e margini dichiarati.
- `SUCCESS_WITH_WARNINGS`: soluzione percorribile ma con compromessi o incertezza significativa.
- `NO_SOLUTION`: vincoli incompatibili; spiegazione e opzioni per modificarli.

**Esempio:** «Voglio una verace pizza napoletana, pronta fra due ore, con un forno domestico da 250 °C». Vulcan dovrebbe indicare che non può soddisfare insieme tempistiche, caratteristiche del disciplinare AVPN e forno; proporrebbe alternative adattate come “pizza tonda domestica”, evidenziando il cambio di obiettivo. Il disciplinare AVPN descrive una cottura in forno tra 430 e 480 °C per circa 60–90 secondi (AVPN, s.d.).

## 11 — Architettura funzionale proposta

<!-- Figura raster: testo trascritto dall’immagine (quattro riquadri collegati da frecce). -->

| 01 INPUT | 02 ENGINE | 03 OUTPUT | 04 LEARNING |
|---|---|---|---|
| **Vincoli** | **Solver** | **Protocollo** | **Feedback** |
| Stile / target | Coerenza formule | Grammi / ricetta | Esito reale |
| Farina / acqua | Vincoli hard / soft | Timeline e checkpoint | Foto e osservazioni |
| Tempi / ambiente | Processi candidati | Fattibilità e tradeoff | Deviazioni |
| Forno / attrezzi | Range e warning | Varianti | Versione successiva |

*ARCHITETTURA PROPOSTA · INPUT → SOLVER → PROTOCOLLO → FEEDBACK*

**Input normalizzati**: stile, numero/forma/peso pezzi, farine e specifiche, disponibilità altri ingredienti, lievito, prefermenti, tempo di servizio, ambiente, frigo, impastatrice, forno, esperienza. **Modello di dominio**: ricette versionate; impasti con stato; step di processo; strumenti e vincoli. **Solver**: genera processi candidati, filtra impossibili, determina intervalli di parametri, sceglie varianti e produce prove di coerenza. **Output**: formula pesata, calendario, checkpoints, cottura, diagnosi del compromesso e alternative.

Il **motore di calcolo** dev’essere testabile senza UI; la parte linguistica può spiegare decisioni, ma non deve inventare pesi o sovrascrivere vincoli. I moduli suggeriti: (a) bilancio di massa e Baker’s %; (b) regole tecniche per stile; (c) vincoli di tempo/processo; (d) euristiche cinetiche parametrizzate; (e) modello forno qualitativo; (f) scoring esplicativo; (g) telemetria volontaria degli esiti.

Separare **formule esatte** (somma ingredienti, percentuali, arrotondamenti) dalle **stime empiriche** (lievitazione e idoneità del forno) e dalle **ipotesi sperimentali** (qualità prevista e alveolatura) è indispensabile per comunicare affidabilità.

## 12 — Fattibilità scientifica: precisione senza falsa esattezza

Il tempo/temperatura della fermentazione modifica fenomeni biologici e reologici. Studi su impasti di pizza mostrano che variando la durata di lievitazione cambiano proprietà viscoelastiche, estensibilità e altre misure del prodotto (Covino et al., 2023). La risposta dipende da ricetta, condizioni, lavorazione e materia prima.

Un approccio responsabile dovrebbe usare tre livelli:

| Livello | Trattamento | Esempi |
|---|---|---|
| **Esatto** | Deterministico e verificabile | Massa, Baker’s %, conversioni, calendario |
| **Stimato** | Range con assunzioni e confidenza | Quantità iniziale di lievito, finestra di fermentazione, temperatura finale prevista |
| **Da osservare** | Checkpoint empirici; nessuna garanzia | Tenuta del panetto, prontezza, comportamento al forno |

Una formula unica della temperatura dell’acqua funziona soltanto con le ipotesi per cui è stata definita. Il coefficiente di attrito va calibrato per impastatrice e ciclo. Il valore W di una farina non è una misura diretta di ogni comportamento fermentativo: occorrono test con farine reali, disponibilità di schede tecniche e intervalli di incertezza.

**Strategia di validazione tecnica:** 8–12 combinazioni controllate iniziali, ciascuna con repliche, variando almeno due farine, due forni e due profili termici; registrare temperatura effettiva dell’impasto, tempo, sviluppo osservato, facilità di stesura, fondo e alveolatura con scale definite. Non è uno studio scientifico esaustivo, ma consente di individuare errori sistematici del solver.

## 13 — Hardware adaptation: il vero differenziatore, se dimostrato

L’utente descrive il proprio forno non soltanto per il massimo dichiarato, ma per tipo, configurazione, eventuale pietra/acciaio, distanza dagli elementi radianti, gestione platea/volta, preriscaldamento e modalità. Dove possibile, può misurare la temperatura reale con strumenti adeguati.

Il software deve evitare che la sola temperatura massima sia interpretata come prova di idoneità. L’esperienza può offrire un **profilo forno** (base, avanzato, misurato) e presentare raccomandazioni come ipotesi da verificare.

L’AVPN descrive un riferimento stilistico di forno ad alta temperatura e cottura breve; Vulcan può creare pizze eccellenti con forni domestici, ma senza chiamarle automaticamente «veraci» quando cambiano i vincoli del disciplinare (AVPN, s.d.).

## 14 — Stili di pizza: una tassonomia operativa

Per un MVP selezionerei **due stili contrapposti**: una pizza tonda napoletana / stile napoletano con forno adatto e una **teglia romana/domestica** con cottura più lunga. Questo testa subito il valore di una libreria di regole non generiche.

Il catalogo esistente offre spazio a pala, pinsa, romana tonda, New York, Detroit, Chicago, New Haven, focaccia e calzone. Ma coprire subito 25–30 stili aumenta rischio di contenuti incoerenti, manutenzione e difficoltà di verifica.

La stessa Margherita richiede proporzioni e tecniche differenti tra stile napoletano, tonda domestica e teglia; anche la distribuzione dei condimenti, la gestione dell’umidità e i tempi cambiano. Vulcan dovrebbe versionare queste differenze senza spacciarle per «tradizione certificata» fuori dal relativo contesto.

## 15 — UX journey: dalla cena al risultato

1. **Parti dall’obiettivo.** «Sabato alle 20:30, 4 pizze in forno domestico».
2. **Conosci il setup.** Seleziona forno, farina, frigorifero e livello tecnico; usa valori predefiniti prudenti se manca un dato.
3. **Vedi fattibilità e scelte.** L’app mostra stile consigliato, qualità dell’aderenza attesa e compromessi; alternative confrontabili.
4. **Ricevi il protocollo.** Grammi, impasto, puntata, staglio, appretto, preriscaldamento e cottura; calendario inverso e margini.
5. **Lavora in modalità cucina.** Step grandi, timer e conferme minime; possibilità di adattare eventi reali («il frigo è a 6 °C»).
6. **Valuta l’output.** La sessione salva fotografie, note guidate, deviazioni e modifiche; genera una nuova versione, non cancella la precedente.

Il sistema non deve scambiare la gestione dei timer per la previsione biologica: «controlla il panetto» è spesso più onesto di «è perfetto alle 19:17».

## 16 — Priorità: dalla feature al pacchetto licenziabile

La domanda non è più «quali funzioni aggiungere?» ma «quali capacità trasformano Vulcan in un servizio affidabile per un partner?». Il catalogo ampio e il design system esistono secondo l’audit Claude: il lavoro immediato va concentrato su affidabilità e distribuzione.

| Workstream | Priorità | Deliverable osservabile |
|---|---|---|
| Qualità solver e casi di test | P0 | Golden tests per stili, masse, forno, tempi e impossibilità |
| Embed configurabile e versionato | P0 | URL/script o iframe con tenant, stili e profili selezionabili |
| Configurazione brand | P0 | Tema, logo, testi, privacy, catalogo farine/forni senza fork |
| Performance del bundle | P0 | Asset ottimizzati, obiettivi Core Web Vitals, caricamento lazy |
| Analytics di funnel + privacy | P0 | Eventi configurazione → ricetta → timeline → feedback |
| Separazione raccomandazione/sponsorizzazione | P0 | Indicazione trasparente dei contenuti del partner |
| Ricetta esportabile e recuperabile | P1 | Link o file portabile, gestione localStorage solida |
| Notifiche davvero affidabili | P1 | Push con service worker e supporto piattaforma verificato |
| White-label dashboard e SLA | P1 | Pannello minimo dati aggregati, help e disponibilità |
| Account e sync consumer | P2 | Solo se retention/ricavi giustificano infrastruttura |
| Food cost / inventario professionale | P3 | Nuovo dominio per eventuale B2B pizzerie |

**Conservare l’app pubblica come demo realmente utilizzabile.** Ridurre le funzioni per il partner non significa amputare l’engine: significa esporre il percorso più adatto al pubblico del partner, mantenendo la logica di dominio centralizzata.

## 17 — Food cost: opportunità reale ma non tesi centrale

Il costo degli ingredienti per panetto si calcola in modo relativamente semplice; quello della pizza finita comprende condimenti, scarti, manodopera e consumo energetico, che devono essere stimati o misurati con dati per sessione. L’energia non si può dividere ingenuamente per i minuti di cottura di una pizza: contano preriscaldamento, numero di pezzi e utilizzo del forno.

Per l’home baker inserirei un **costo per sessione** opzionale; per pizzerie servono materiali, distinta ingredienti, costi standard/consuntivi, resa e sprechi. Un modulo che duplicasse un ERP/POS generico non costituirebbe un vantaggio competitivo.

**Ipotesi B2B da validare:** se standardizzare ricette e tempistiche riduce scarti e formazione del personale, un piano pizzeria può acquisire valore misurabile. Non possiamo assumere l’esistenza di un impasto perso ogni settimana senza misurarne frequenza e cause.

## 18 — Business model aggiornato: B2B2C prima del freemium

> Sezione omessa nella versione pubblica (contenuti economici e commerciali). Il PDF completo è nel repository privato basecamp, ricerca/report-2026/.

## 19 — Economia delle licenze: simulazioni, non previsioni

> Sezione omessa nella versione pubblica (contenuti economici e commerciali). Il PDF completo è nel repository privato basecamp, ricerca/report-2026/.

## 20 — TAM / SAM / SOM: per il licensing serve una lista di account

> Sezione omessa nella versione pubblica (contenuti economici e commerciali). Il PDF completo è nel repository privato basecamp, ricerca/report-2026/.

## 21 — Offerta white-label: cosa compra davvero un brand

**Il prodotto da vendere è un servizio configurabile, non il repository.** Il pacchetto di base potrebbe comprendere: (1) esperienza embed responsiva; (2) catalogo limitato alle farine o ai forni del partner; (3) tema visuale e voce brand; (4) protocolli con riferimenti di fonte e limiti dichiarati; (5) analytics aggregata per funnel e categorie di prodotto; (6) aggiornamenti e manutenzione; (7) documentazione di integrazione e supporto.

Il primo prototipo commerciale deve poter rispondere a due domande in una demo: «Se un cliente usa questa farina, cosa fa stasera con il proprio forno?» e «Quante persone arrivano da una scheda prodotto alla pianificazione completa?».

**Architettura candidata:** `tenant config` validata e versionata (catalogo, tema, lingue, feature flag e privacy) → frontend embed → engine unico e neutrale → contenuti del tenant con provenienza esplicita → eventi aggregati, accessibili al brand nel perimetro contrattuale. Non usare un fork distinto per ogni partner: moltiplicherebbe QA e costo operativo.

**Tre formule di collaborazione da testare:** co-branded (più semplice), white-label completo (più costoso per il brand), API/SDK motore (massima flessibilità ma maggiore rischio IP, supporto e integrazione). Per il pilota sceglierei **co-branded o embed**, non API esposta senza governance.

Dati delle farine: gestire valori intervallari, revisione della scheda tecnica, data, fonte e diritto d’uso. Dati forni: capacità reali, accessori e condizioni operative, non solo temperatura pubblicitaria. Nessun uso di marchi, loghi o nomi di ricette «firmate» deve insinuare accordi inesistenti.

## 22 — Rischi specifici di commercializzazione

| Rischio | Evidenza o natura | Mitigazione prima del pilota |
|---|---|---|
| **Nome Vulcan** | Esiste già Vulcan, brand di attrezzature da cucina ITW FEG | Ricerca marchi EUIPO/TMview e valutazione legale: omonimia ≠ violazione automatica |
| Marchi/autori citati nelle ricette | Il nome può suggerire un endorsement inesistente | Fonte, formulazioni «ispirato a», autorizzazioni quando necessarie |
| Falsa precisione del solver | Q10 e compensazioni sono modelli da validare | Golden tests, range, avvertenze e confronto con risultati |
| White-label fragile | Temi, contenuti e script dipendono dal sito del partner | Sandbox iframe, CSP, performance budget, responsabilità definite |
| Payload pesante | Claude segnala CSS \~512 KB e foto 2,5–3 MB, da verificare | Bundle analysis, WebP/AVIF, lazy loading, budget misurati |
| Notifiche inaffidabili | Claude riferisce Notification API senza push in background | Nessuna promessa di avvisi garantiti prima di test Service Worker + server push |
| Nessuna telemetria utile | Report Claude indica assenza analytics prodotto | Eventi funnel minimali, consenso ove necessario, dashboard aggregata |
| `localStorage` e multi-dispositivo | Dati non sincronizzati e cancellabili | Esportazione, backup opt-in; account solo dove utile |
| Concorrenza con app gratuite | Molte funzioni core sono commoditizzate | Misurare valore in attach rate, engagement e completamento, non feature count |

> Riga di tabella omessa nella versione pubblica (contenuti economici e commerciali).

**Nome commerciale.** Il brand Vulcan compare nel settore equipment sul sito ufficiale di ITW Food Equipment Group (s.d.). Prima di un contratto su farina/forni è prudente verificare l’uso del segno nelle classi rilevanti (tipicamente software e attrezzature, secondo analisi specialistica), i territori e gli eventuali marchi simili nel portale EUIPO. Non è possibile dedurre dal solo sito l’esito di una contestazione (EUIPO, s.d.).

**Web push.** Apple documenta il supporto a Web Push per web app aggiunte alla schermata Home su iOS/iPadOS 16.4+, con service worker e infrastruttura push conforme: usare solo API di notifica della pagina non equivale a supportare avvisi affidabili a web app chiusa (Apple, 2023).

## 23 — KPI aggiornati: il partner deve vedere valore

**Qualità tecnica:** errori deterministici nel bilancio ingredienti, conflitti hard individuati, fallback corretti, tempo di calcolo, performance p75 di caricamento dell’embed, crash-free sessions, accessibilità nei principali browser.

**Funnel utente:** visualizzazioni del widget → avvio configurazione → ricetta generata → salvataggio/condivisione → uso della timeline → feedback. Tracciare eventi con definizioni stabili, evitando dati personali non necessari. Cloudflare Web Analytics può misurare traffico e performance con un’impostazione privacy-first; per un funnel di prodotto servirebbero eventi aggiuntivi e una revisione delle basi giuridiche/consensi (Cloudflare, 2026).

**Valore per il brand:** tasso di avvio dalla scheda farina/forno, completamento di un protocollo, ritorno alla scheda prodotto, tempo di ingaggio, comprensione del prodotto e soddisfazione degli utenti; le conversioni commerciali richiedono collegamento a dati che il brand è disposto a condividere. Non assumere causalità fra uso di Vulcan e vendite.

> Paragrafo omesso nella versione pubblica (contenuti economici e commerciali).

## 24 — Piano operativo aggiornato: da prodotto esistente a pilota licenziabile

**Sprint 0 · Ottobre–novembre 2026: due diligence tecnica.** Verificare con accesso al codice `pizza-engine.ts`, test, stili, CMS e design token; ripetere i principali bug di luglio; valutare UX reale e report performance. Affrontare subito la ricerca preliminare sul nome; non attendere la firma di un contratto.

**Sprint 1 · Novembre 2026: misurazione e ottimizzazione.** Eventi minimi nel funnel, dashboard aggregata, immagini ottimizzate, controllo bundle, policy privacy, backup ricette. Non introdurre un login obbligatorio nella demo pubblica.

**Sprint 2 · Novembre–dicembre 2026: build partner.** Demo embed con un tema neutro e due tenant esemplificativi: «mulino» (catalogo farine/versioni) e «forno» (profili attrezzature); configurazione senza fork di codice, URL dedicati, guida d’integrazione.

> Paragrafi omessi nella versione pubblica (contenuti economici e commerciali): Sprint 3, Sprint 4 e Sprint 5.

## 25 — Interviste e prove: utenti e potenziali brand

**Domande per i produttori di farine e forni:**

1. Quali domande ricevete più spesso dopo l’acquisto di un prodotto?
2. Quanto costa produrre e aggiornare le vostre guide e ricette?
3. Dove incontrano difficoltà gli utenti fra sito, prodotto e risultato finale?
4. Avete già un calcolatore, un configuratore o un percorso education? Come viene usato?
5. Perché un utente dovrebbe restare sul vostro sito per costruire un protocollo di pizza?
6. Chi approva contenuti, accuratezza, dati, accessibilità e privacy?
7. Quali KPI permetterebbero di finanziare e rinnovare una licenza?
8. Che livello di controllo serve su catalogo, stili, lingua, loghi e aggiornamenti?
9. Quanto tempo può dedicare il vostro team tecnico all’integrazione?
10. Quali vincoli contrattuali renderebbero impossibile adottare un widget esterno?

**Test con i consumatori:** 20–30 persone con setup eterogenei; misura dei punti di abbandono nel funnel, dei casi «NO_SOLUTION» compresi, dei protocolli eseguiti, del ritorno per una seconda sessione e dei commenti sull’affidabilità. Il giudizio soggettivo «buona app» non basta; confrontare task e risultati con le alternative correnti.

**Test tecnico sul sito partner:** CSP, cookie/consenso, embedding responsive, locale, deep-link a prodotti, screen reader, error handling, limiti di traffico e aggiornamenti. Verificare in staging prima di promettere tempi o SLA.

## 26 — Roadmap commerciale e criteri go/no-go

> Sezione omessa nella versione pubblica (contenuti economici e commerciali). Il PDF completo è nel repository privato basecamp, ricerca/report-2026/.

## 27 — Lean Canvas: versione licensing-first

> Sezione omessa nella versione pubblica (contenuti economici e commerciali). Il PDF completo è nel repository privato basecamp, ricerca/report-2026/.

## 28 — Raccomandazione conclusiva dopo Claude

**Non ricomincerei Vulcan, non lo trasformerei immediatamente in un ERP per pizzerie e non installerei un paywall prima di misurare l’uso reale.** Secondo il resoconto di Claude, una parte importante della complessità di dominio è già stata affrontata; la decisione più razionale è provare a monetizzare quell’asset mediante **un widget/servizio licenziabile a mulini e produttori di forni**.

Ci sono quattro condizioni da rispettare: (1) verifica tecnica diretta del progetto, perché l’audit riportato è secondario; (2) confronto con i concorrenti per evitare pretese di unicità non dimostrate; (3) trasparenza su limiti del solver e su contenuti sponsorizzati; (4) verifica del marchio prima dell’esposizione commerciale.

L’app pubblica resta il banco di prova: acquisisce traffico organico, raccoglie apprendimenti e dimostra il livello della UX. **Il risultato di business da validare è una licenza B2B2C rinnovabile a un prezzo sostenibile, non un numero arbitrario di download.** Se nessun partner è interessato, potremo tornare al freemium sapendo qualcosa di concreto sull’uso e sul valore percepito.

## Appendice A — Esempi di scenari di solver

**Scenario A: cena fra cinque ore.** Utente, 4 pizze, forno domestico 250 °C, farina commerciale senza W, frigo 4–7 °C. Risposta attesa: profilo domestico fattibile, alternative con compromessi, tempi attivi e note sull’incertezza; non definire il risultato “napoletana verace”.

**Scenario B: forno dedicato, napoletana.** Utente, forno ad alta temperatura, farina con scheda W/P-L nota, 24 ore totali; programma con checkpoint e range, coerente con stile e pratica. Segnalare che la conformità a un disciplinare ha condizioni ulteriori rispetto alle sole grandezze numeriche.

**Scenario C: cambia la temperatura del frigo.** Dopo 10 ore l’utente misura 7 °C al posto di 4 °C. Vulcan esplicita quali conseguenze sono stimate, propone una verifica del dough state e può suggerire una nuova finestra temporale senza garanzie assolute.

**Scenario D: massa.** 6 panetti da 270 g, 65% acqua, sale 2,7%, lievito 0,1% sulla farina; senza altri ingredienti, massa totale 1.620 g, farina \~965,4 g, acqua \~627,5 g, sale \~26,1 g, lievito \~1,0 g (arrotondamenti). Questo è un calcolo deterministico testabile; le scelte di percentuali non dimostrano la fattibilità della lievitazione.

## Appendice B — Matrice delle assunzioni

| Affermazione | Stato | Verifica necessaria |
|---|---|---|
| Il mercato pizza italiano è ampio | Evidenza documentata | Confrontare perimetri FIPE/SIGEP |
| Le app calcolatore sono già presenti | Evidenza documentata | Benchmark funzionale e prezzi aggiornati |
| Un solver end-to-end è differenziante | Ipotesi | Test comparativo di task e valore |
| Il dato W da solo prevede la maturazione | Non supportato | Non usarlo come predittore unico |
| Le pizzerie risparmieranno uno scarto/settimana | Non verificato | Raccolta dati da piloti |
| I partner sono disposti a pagare | Ipotesi | Colloqui commerciali e LOI |

> Riga di tabella omessa nella versione pubblica (contenuti economici e commerciali).

## Appendice C — Checklist tecnica di verifica del repository

**Il resoconto di Claude va trasformato in evidenza controllabile prima di dichiarare la soluzione pronta:**

| Area | Check operativo | Evidenza da allegare |
|---|---|---|
| Motore | Eseguire test di massa, lievito, temperature, viabilità e stili | Report test e versioni dei dataset |
| Audit luglio | Ripetere regressioni su `temporalViability`, timeline, salvataggio e profilo | Screenshot/test automatizzati |
| Performance | Misurare CSS, JS, immagini, CLS, LCP, INP per app ed iframe | Bundle report / Lighthouse / RUM |
| Embed | Cross-origin, CSP, resize, localizzazione, accessibilità, errore di rete | Matrix browser e QA |
| CMS/catalogo | Controllare import/export, validazione, tenant scope, rollback | Schema config e changelog |
| Privacy | Inventario eventi, storage, consenso, retention e accordi partner | Data map e DPIA se necessaria |
| Notifiche | Verificare background/foreground su iOS, Android e desktop | Matrice comportamenti |
| Legal | Nome, contenuti di terzi, branding, licenze font/immagini | Due diligence IP |

## Appendice D — Scheda di proposta pilota per partner

> Sezione omessa nella versione pubblica (contenuti economici e commerciali). Il PDF completo è nel repository privato basecamp, ricerca/report-2026/.

## Bibliografia — APA 7 e risorse online

Associazione Verace Pizza Napoletana. (s.d.). *Il disciplinare internazionale e la ricetta della verace pizza napoletana*. https://www.pizzanapoletana.org/it/ricetta_pizza_napoletana

Consiglio Nazionale delle Ricerche. (2026, 16 gennaio). *L’Osservatorio socio-economico della Pizza Napoletana presenta l’Indice Pizza Napoletana Margherita e offre un quadro del comparto*. https://www.cnr.it/en/press-note/n-14066/

DoughFlow. (2026). *DoughFlow: The baking calculator for ambitious bakers*. https://www.doughflowapp.com/

European Commission. (2026). *Allergies: Food safety campaign 2026*. https://food.ec.europa.eu/food-safety/campaign-2026/allergies_en

FIPE. (2026). *Rapporto Ristorazione 2026*. https://www.fipe.it/wp-content/uploads/2026/04/FIPE-Rapporto-Ristorazione.pdf

Gisslen, W. (2016). *Professional baking* (7th ed.). Wiley. Testo didattico disponibile per consultazione

Ministero della Salute. (2024). *Igiene generale degli alimenti*. https://www.salute.gov.it/new/it/tema/sistema-di-controllo-della-sicurezza-alimentare/igiene-generale-degli-alimenti/

Mulino Caputo. (s.d.). *Farina Pizzeria: specifiche del prodotto*. https://www.mulinocaputo.it/prodotti/pizzeria/

NFP Software. (2026). *PizzApp+* [Scheda applicazione Google Play]. https://play.google.com/store/apps/details?id=fisico.pizzapp

Ooni. (2026). *Ooni app* [Scheda applicazione Google Play]. https://play.google.com/store/apps/details?id=com.ooni.app

Panetto. (s.d.). *Panetto: Pizza & bread dough calculator*. https://panetto.app/

Pizzaiolo App. (s.d.). *Pizzaiolo App: Calcola l’impasto napoletano per il tuo forno*. https://ilpizzaiolo.app/it/

Portale Etichettatura e Sicurezza Prodotti delle Camere di commercio. (s.d.). *Prodotti somministrati*. https://portale-etichettatura.lab-to.camcom.it/somministrazione/

Russo, A. (2026). *Pizzapp Lab* [Scheda applicazione Google Play]. https://play.google.com/store/apps/details?id=com.andrea.pizzapp

SIGEP World. (2026). *Le filiere di gelato, pasticceria, cioccolato, pane, pizza e caffè valgono oltre 40 miliardi di euro*. https://www.sigep.it/it/dettaglio-comunicato/SIGEP%20WORLD%202026%2C%20LE%20FILIERE%20DI%20GELATO%2C%20PASTICCERIA%2C%20CIOCCOLATO%2C%20PANE%2C%20PIZZA%20E%20CAFF%C3%88%20VALGONO%20OLTRE%2040%20MILIARDI%20DI%20EURO?pressId=6345370

Covino, C., Sorrentino, A., Di Pierro, P., & Masi, P. (2023). Study of physico-chemical properties of dough and wood oven-baked pizza base: The effect of leavening time. *Foods, 12*(7), 1407. https://doi.org/10.3390/foods12071407

Unione europea. (2011). *Regolamento (UE) n. 1169/2011 relativo alla fornitura di informazioni sugli alimenti ai consumatori*. https://eur-lex.europa.eu/eli/reg/2011/1169/oj?locale=it

Apple. (2023). *Sending web push notifications in web apps and browsers*. https://developer.apple.com/documentation/usernotifications/sending-web-push-notifications-in-web-apps-and-browsers

Cloudflare. (2026). *Cloudflare Web Analytics*. https://developers.cloudflare.com/web-analytics/about/

EUIPO. (s.d.). *Ricerche: Marchi, disegni e modelli (TMview e eSearch)*. https://www.euipo.europa.eu/it/search-ip

ITW Food Equipment Group. (s.d.). *Our brand family* [Vulcan]. https://www.itwfoodequipment.com/about-us/itw-food-equipment-group-brand-family

Vulcan. (s.d.). *Commercial kitchen equipment*. https://www.vulcanequipment.com/

**Materiale progettuale privato:** resoconto di audit Claude fornito dall’utente, 22 ottobre 2026, sul repository e la documentazione di Project Vulcan. Le asserzioni sul codice devono essere verificate sul repository prima di pubblicazione commerciale.

**Data di accesso ai siti e alle schede prodotto:** 22 ottobre 2026. **Nota:** il materiale Claude è fonte di audit riportata, non indipendentemente ispezionata. **Natura del report:** esplorativa e progettuale, non consulenza tecnico-scientifica certificata né business plan validato.
