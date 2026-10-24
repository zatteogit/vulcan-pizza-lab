# Verifica totale di Vulcan — 24/10/2026

Quattro test esplorativi in parallelo sulla build di produzione (commit
`67f0e4b`), con Playwright e screenshot guardati uno per uno:

| Report | Chi | Dove |
|---|---|---|
| A | Neofita assoluto · casalinga/o | mobile 390×844 it, qualche controllo en e desktop |
| B | Appassionato · nerd della pizza | mobile e desktop, it/en/ja, conti rifatti a mano |
| C | Pizzaiolo professionista | tablet 820/1180, desktop 1440, stampa |
| D | Valutazione euristica NN/g + WCAG 2.2 AA | 3 viewport, chiaro/scuro, movimento ridotto, testo 200%, axe-core |

Gli ID (A-01, B-03…) rimandano ai report originali; screenshot e script sono
nello scratchpad della sessione. Gravità secondo NN/g: 4 bloccante, 3 alta,
2 media, 1 bassa. Qui i problemi sono **accorpati per causa**: lo stesso
difetto visto da più personas compare una volta sola, con tutti gli ID.

## 1. In sintesi

- **Cosa regge.** Somme delle ricette giuste al grammo su tutti i casi
  rifatti a mano (B, C); scomposizione della biga; spiegazione del lievito
  trasparente; blocco «Così non è fattibile» con alternative; ricerca;
  modalità cottura (wake lock, notifiche, un passo per schermata); reflow a
  320 px senza scroll orizzontale; focus visibile; movimento ridotto
  rispettato; tema scuro; qualità visiva alta (D: euristiche 3–4 su 5).
- **Cosa rompe la fiducia.** Numeri che cambiano da una schermata all'altra
  (compatibilità, temperature, ore, prefermenti), un piano che manda a
  infornare alle 3 di notte, testi del procedimento fissi che contraddicono
  la ricetta.
- **Cosa ferma l'uso reale.** In cucina: modalità cottura senza grammi e
  non avviabile da Crea. Per il neofita: niente «per quante persone», gergo.
  Per il pro: massimo 20 panetti, biga non sceglibile, nessuna stampa, la
  teglia 60×40 che si dimezza riaprendo la ricetta.

## 2. Problemi per causa

### 2.1 Dati e coerenza (fiducia) — priorità 1

| # | Grav. | Problema | Visto da | Correzione proposta |
|---|---|---|---|---|
| 1 | 3 | **Compatibilità diversa per lo stesso stile**: Napoletana 39 % (Scopri), 51 (Crea), 45/100 e «ti ferma a 49» nella ricetta; Padellino 82/90 %/82; Pala 77 sulla card e 62 % nel pannello aperto da quella card. La % non ha legenda (solo `title`) e usa un cuore, che altrove vuol dire preferiti | A-08, A-22, B-08, C-30, D-01, D-05, D-06 | Un solo numero calcolato in un punto (stessa funzione, stessi vincoli), formato unico «82/100» con etichetta visibile «Compatibilità con la tua cucina», icona non a cuore, `aria-label` completo. Il «potresti arrivare a» resta, ma come secondo valore dichiarato |
| 2 | 3 | **Piano notturno**: il default delle schede `/recipe` parte «ora» e inforna alle 03:19–03:31; «Timeline comoda» attiva insieme a «fasi di notte»; lo slot scelto in Crea non passa alla scheda | A-01, A-02, B-06, D-02 | Default ancorato al pasto (slot di Crea, altrimenti la prima cena/pranzo raggiungibile); «comoda» deve davvero spostare le fasi (anticipare o usare il frigo) o dire perché non può |
| 3 | 3 | **Prefermento nel procedimento**: con la biga il passo si chiama «Mescolare poolish», «pappetta col cucchiaio, 16–18 h a 18 °C» mentre la timeline dà 8 h 30 senza temperatura; in cottura idem per l'impasto diretto | A-05, B-03, C-04 | Testo generato dal tipo e dai parametri del prefermento della ricetta (causa: `process_type.includes("poolish")` su «direct\|biga\|poolish»); test per stile |
| 4 | 3 | **Regola 55**: la spiegazione porta ad acqua a ~13 °C, la ricetta dice 24/27/30 °C, l'obiettivo è 22 o 25 °C nella stessa nota; il motore usa T_impasto × 3 | A, B-01, C-07 | Un solo metodo (T_impasto obiettivo × 3 − ambiente − farina − attrito) spiegato coi numeri dell'utente, glossario allineato |
| 5 | 3 | **Lievito calcolato su un profilo di temperatura diverso dalla timeline**: Detroit 36 h trattate tutte a 4 °C, ma la timeline fa 14 h a 18 °C → +70 % rispetto al modello stesso | B-02 | Dose = integrale delle fasi reali (Σ ore × velocità(T)); test |
| 6 | 3 | **«Originale» non canonico**: usa il forno del profilo (Recco IGP a 250 °C, sotto il minimo del disciplinare 270); Detroit classica a 36 h fuori dal range 8–24; lo Smart Link porta la STG a 63 % / W330 Manitoba senza dirlo | B-04, B-05, B-09, C-08, C-16 | Canonica = ideale dello stile, sempre; il proprio forno come nota a parte; test che vieti versioni canoniche fuori range; Smart Link con «prima → dopo» e annulla, avviso quando esce dal range |
| 7 | 3 | **Procedimento delle teglie**: si stende in teglia dopo 14 h di appretto (Detroit e simili), «panetti» per stili in teglia | B-07 | Ordine: staglio → stesura in teglia → appretto in teglia |
| 8 | 2 | **Consigli fuori contesto**: «forno almeno 280 °C», «>430 °C», «cottura 90 s» con forni da 250 °C e cotture da 5–6 min; cornicione per pizze chiuse e Recco; testi da impasto lievitato sulla Recco | A-20, B-23, C-09, C-12 | Consigli filtrati per forno e per tipo d'impasto; tempi presi dalla ricetta |
| 9 | 2 | **Alternative e filtri non fattibili**: alternative alla Napoletana da 300–380 °C con forno da 250; «Stasera» (5 h 30) segna fattibili stili da 6–48 h | A-09, B-17 | Fattibilità sul minimo dello stile (temperatura e ore) |
| 10 | 2 | **Prefermenti e glossario incoerenti**: biga 44–50 % vs 44–48 %, poolish 12–16 h 16–18 °C vs 8–16 h 20–22 °C, pH vs gusto invertiti, autolisi chiamata prefermento, biga «ideale per la napoletana classica»; puntata/appretto del glossario diversi dalle timeline; troubleshooting «0,2 % per 24 h» | B-13, B-14, B-21, A-26 | Un dataset unico con fonte; valori dal motore |
| 11 | 2 | **Calcoli locali**: sale da 16 a 13 g aprendo «Parti dalla farina»; profilo cambiato (spirale) che non arriva alla bozza aperta; peso Pala 320/350/360; TF 0,72 vs 0,80; W 300 «media» e «forte» | A-14, B-15, B-16, B-24, C-03 | Correggere e coprire con test |

### 2.2 In cucina — priorità 1

| # | Grav. | Problema | Visto da | Correzione proposta |
|---|---|---|---|---|
| 12 | 3 | **Modalità cottura senza grammi**: nessun passo riporta le dosi; lo staglio rimanda a «ingredienti sotto» che non ci sono | A-04, C-11 | Dosi e peso panetto dentro ogni passo |
| 13 | 3 | **Cottura avviabile solo da `/recipe`**, non dalla ricetta generata in Crea (anche Condividi) | A-03, C-21 | CTA «Inizia a cucinare» e Condividi anche in Crea |
| 14 | 3 | **«Per quante persone»**: si parte da 4 unità (Ciaccino 4 × 700 g ≈ 16–24 persone); le persone non scalano con l'area della teglia | A-06, C-29 | Domanda «per quante persone» che decide unità e peso |
| 15 | 4 | **Massimo 20 panetti/teglie** senza avviso; budget farina troncato | C-01 | Tetto alto (≥ 200) con campo numerico; avviso se resta un limite |
| 16 | 4 | **Teglia 60×40 che torna 40×30** riaprendo una ricetta salvata o un link condiviso (le misure non sono nell'URL) | C-02 | URL e salvataggio con tutti i parametri (teglia, peso panetto, impastatrice) |
| 17 | 3 | **Biga/poolish non sceglibili**, percentuali fisse; sulla STG l'interruttore genera sempre un poolish | C-05 | Selettore tipo, %, idratazione, ore e temperatura (livelli 3–4) |
| 18 | 3 | **Nessuna stampa** (nessun `@media print`) | C-06 | Scheda di produzione A4 stampabile |
| 19 | 3 | **Pizza al metro**: unità «teglie», niente lunghezza, «teglia oliata»; condimento non scalato sull'area | C-09, C-10 | Unità in metri, slider lunghezza; condimento per area con totale |
| 20 | 2 | **Comandi della modalità cottura**: X che riduce accanto al cestino «Interrompi», 36 px; «Ho finito prima» alto 25 px e sovrapposto; widget «fra 11h28» per una fase in corso, che copre la X del profilo | A-15, A-18, A-30, D-11, D-12 | Icona «riduci» distinta, Interrompi con conferma, target 44 px |
| 21 | 2 | **Ricettario**: niente nome né note, si riapre sul condimento, tre nomi diversi (preferiti/ricettario/ricette salvate), versione non indicata | A-19, B-26, C-19 | Nome e note, riapertura sulla ricetta, un nome solo |
| 22 | 2 | **Limiti per il pro**: solo 3 temperature (4/12/22 °C), peso panetto non modificabile, durate fisse con 20 panetti, una sola sessione di cottura | C-13, C-14, C-15, C-20 | Temperatura libera, campo peso, durate per numero di panetti |

### 2.3 Accessibilità e qualità visiva — priorità 2

| # | Grav. | Problema | Visto da | Correzione proposta |
|---|---|---|---|---|
| 23 | 3 | **Tab stop muti nella navigazione**: `div.app-shell-tab__pill[tabindex=0]` senza nome dopo ogni voce (WCAG 2.4.3, 4.1.2) | D-04 | Togliere il `tabindex` |
| 24 | 3 | **Testo al 200 %**: barra «ScopriCreaImpara», tab della ricetta sovrapposte, barre fisse ≈ 25 % dell'altezza (WCAG 1.4.4/1.4.10) | D-03, D-28 | Solo icone sotto una soglia, tab scorrevoli, niente troncamenti a testo grande |
| 25 | 3 | **Bottoni fluttuanti che coprono**: «Inizia» su «Preferiti», profilo su «32 termini», indietro sulle statistiche (WCAG 2.4.11) | A-27, D-07 | Spazio riservato, `scroll-padding` |
| 26 | 2 | **Target piccoli**: W280 33×16, «Torna all'originale» 112×13, interruttore 29×16; 21 su 27 sotto 44 px nella ricetta | A-28, D-08 | Area di tocco minima 44 px |
| 27 | 2 | **Contrasto** su testi piccoli: conteggi 3,24:1, «AVPN» e «90 % MATCH» 2,97:1, pill condimento in scuro 1,95:1 | D-09 | Token `on-*-container` corretti |
| 28 | 2 | **Parole spezzate e numeri grezzi**: «LIEVITAZIO/NE», «Pre-/fermento», «3.0999999999999996», «17.5h», decimali misti | A-21, B-12, C-17, C-27, C-28, D-18 | Griglia 2×2 sotto 400 px; formattatore numerico unico per lingua |
| 29 | 2 | **Vetro troppo trasparente nel dialog prima della cottura** e nell'header ricetta | D-23 | Superficie piena o opacità ≥ 0,92 dove c'è testo dietro |
| 30 | 2 | **Struttura**: H1 → H3, due H1 e niente `main` nella ricerca, banner duplicati, `th` vuoto, focus della ricerca che parte dal basso | D-16, D-17, D-24, D-25 | Correzioni puntuali |
| 31 | 2 | **Desktop/tablet**: bottom sheet a tutta larghezza (CTA 1392 px), una colonna da 900 px con ingredienti e procedimento mai insieme | C-22, D-15, D-26 | Dialog centrato da `md`; due colonne da 1024 px |

### 2.4 Primo uso, linguaggio e navigazione — priorità 2

| # | Grav. | Problema | Visto da | Correzione proposta |
|---|---|---|---|---|
| 32 | 3 | **Gergo** (puntata, staglio, appretto, incordatura, slap & fold, pirlatura); staglio, incordatura, cornicione non sono nel glossario | A-07 | Termini toccabili che aprono il glossario; voci mancanti; registro per livello (C-24) |
| 33 | 2 | **Primo accesso**: livello «Intermedio» di default senza dirlo; il percorso del Profilo è obbligatorio, senza «Salta» né «Indietro» (contraddice D-038); Impara non segue il livello | A-12, A-13, D-13 | Livello non impostato finché non scelto; «Salta» e «Indietro»; livello da una fonte sola |
| 34 | 2 | **Inglese misto e traduzioni**: «Guida Troubleshooting», «FIX IMMEDIATO», «MATCH», «hallmark della slice»; ja con «of», パール, BIGA in latino; en «Pale», «Styles» vs «Explore», «LEVEL INTERMEDIO» | A-24, A-33, B-22, D-21 | Passata di copy nel CMS; glossario terminologico per lingua |
| 35 | 2 | **Navigazione**: lo scroll non torna in cima cambiando pagina; ricerca in Crea che non trova «margherita»; hero di Scopri non fattibile col forno di casa; famiglie «Contemporanea» per focacce IGP | A-10, A-11, A-16, B-18, B-30 | Scroll in cima; ricerca anche nei condimenti; hero adatto al forno; famiglia «Focacce e regionali» |
| 36 | 1 | **Varie**: «Attiva modalità sviluppo» visibile in produzione, refuso «meta», «ROTAZIONE/I», ricerca senza tolleranza ai refusi, warning del router su `/`, nessun confronto tra stili | A-32, A-34, B-20, B-28, B-29, B-32 | Correzioni puntuali; il confronto è una funzione nuova |

## 3. Piano

1. **Subito (bug, nessuna decisione):** 3, 4, 5, 6, 7, 8, 11, 12, 13, 16,
   20, 23, 25, 26, 27, 28, 30, 36 e la parte meccanica di 2, 9, 10, 33, 34, 35.
   Le correzioni del motore portano il prima/dopo in
   `docs/motore-correzioni-2026-10-22.md` e i test.
2. **Con decisione di Matteo:** 1 (quale numero di compatibilità), 14 (domanda
   «per quante persone»), 15/17/18/19/22 (quanto spingere l'uso
   professionale), 32 (registro per livello), 24/31 (layout a testo grande e
   desktop a due colonne).
