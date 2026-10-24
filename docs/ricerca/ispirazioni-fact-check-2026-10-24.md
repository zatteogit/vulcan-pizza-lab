# Fact-check delle «Ispirazioni» (`src/app/data/interpretation-library.ts`)

- **Data della verifica:** 24/10/2026. Le fonti sono state aperte e lette in quella data.
- **Chi:** ricerca di un agente AI per Matteo. Nessun file del repo è stato modificato.
- **Oggetto:** i testi visibili (`signature_name`, `technique_signature`, `story`, `badge`) delle 14 voci,
  più `organization`, `year_codified`, `url` e, dove contraddicono le fonti, i `parameter_overrides`.
- **Stati:** come in `docs/fonti-dati.md`: **verificato**, **plausibile**, **da verificare**, **errato**.
  **Fatto** = ciò che dice la fonte; **Lettura** = mia interpretazione.
- **Testi corretti:** `interp.fixed.it.json` (stessi id e campi, più la chiave `_remove`).
- **Regola C-5:** nei testi corretti le ricette dei maestri sono presentate come «Ispirata a…» nel
  `signature_name`, e i fatti sono scritti come fatti pubblici. Non c'è più nessuna formula che faccia pensare
  a un accordo o a una ricetta fornita dal maestro.

## Sintesi

| Stato | Affermazioni |
|---|---|
| verificato | 40 |
| plausibile | 34 |
| da verificare | 31 |
| errato | 21 |
| **Totale** | **126** |

**Gli errori più gravi**

1. **Capuano, «metodo forbici»** (`capuano_napoli`). Le forbici servono a **tagliare la pizza al tavolo**,
   non la mozzarella (Dissapore 2023; menu Capuano). La cifra «~95% vs 70%» di siero non ha nessuna fonte:
   sembra inventata. Il testo la presenta come «la sua firma più imitata».
2. **Bianco, «Fermentazione 5 giorni» e «3× James Beard»** (`bianco_phoenix`). Le fonti dicono circa **18 ore**
   (Wikipedia; trascrizione 2013: 18–20 h in frigo). I premi James Beard vinti sono **due** (2003 e 2022), non tre.
   Anche `fermentation_hours: 120` va corretto.
3. **AVPN, «ottiene il marchio STG» e «cottura solo in forno a legna»** (`avpn_disciplinare`). La STG non è un
   marchio dell'AVPN: è una denominazione UE (Reg. 97/2010) chiesta da **AVPN e Associazione Pizzaiuoli Napoletani**.
   Il «solo forno a legna» vale per la STG; il disciplinare AVPN 2024 ammette gas ed elettrico in deroga.
4. **APITER** (`apiter_teglia`). **Non esiste come organizzazione.** APITER è il nome di un **disciplinare**,
   «Autentica Pizza In TEglia alla Romana», scritto e firmato dai membri del forum **La Confraternita della Pizza**,
   intorno al 2016. Il testo dice anche che nasce «contro la deriva alta idratazione spinta»: è l'opposto, perché
   il disciplinare è proprio per la teglia ad alta idratazione (75–100%).
5. **Malati di Pizza** (`malati_di_pizza`). Non è un forum: è una scuola di pizza a Limatola (BN) con un canale
   YouTube. «Testata su 200+ post di forum», la dose 0,5 g/cm² e la ricetta «Bonci casalingo» non hanno fonti.
   In più la voce usa il nome di Bonci senza nessun legame documentato (C-5).

Altri errori importanti: la **Margherita Sbagliata** è descritta al contrario: la mozzarella va in forno, solo
pomodoro e basilico vanno dopo (`pepe_caiazzo`). **Da Michele** oggi ha quattro pizze e nel 1870 non era in via
Sersale (`da_michele_napoli`). **Martucci**: l'unica fonte sull'impasto dice impasto diretto, non biga.
**Forkish**: lo schema «venerdì sera → sabato» non è quello del libro.

**Da togliere (`_remove`):** `malati_di_pizza`, `confraternita_pinsa`.
**Decisioni per Matteo:** `apiter_teglia` (nome dell'ente e anno), `martucci_caserta` (`use_pre_ferment`),
`bianco_phoenix` (`fermentation_hours`), più alcuni anni in `year_codified` (vedi in fondo).

---

## 1. Disciplinari

### 1.1 `avpn_disciplinare` — AVPN

| Affermazione | Fonte | Stato | Nota |
|---|---|---|---|
| Disco 32 cm | UE 2010: diametro non oltre 35 cm. AVPN 2024: 22–35 cm | **plausibile** | 32 sta nei range; nessuna fonte dà 32. |
| Cornicione 1–2 cm | UE 2010: «borde, un espesor de 1 a 2 cm». AVPN 2024: «about 1-2 cm in height» | **verificato** | |
| Centro 4 mm | UE 2010: 0,4 cm, tolleranza circa ±10% | **verificato** | |
| Leopardatura | Non trovata in UE 2010 né in AVPN 2024 | **da verificare** | Tolta dal testo. |
| Cottura in forno a legna, 60–90 s | UE 2010: «exclusivamente en hornos de leña», 60–90 s | **verificato** | Vale per la STG. |
| 430–485 °C | UE 2010: platea circa 485 °C, volta circa 430 °C | **plausibile** | Il range unisce due superfici diverse. Nel testo nuovo: platea a circa 485 °C. |
| L'AVPN nasce nel 1984 | AVPN 2024: primo disciplinare del 14/06/1984. Pagina storia AVPN: 03/07/1984 | **verificato** | Le due date differiscono; l'anno coincide. |
| … per tutelare la verace pizza napoletana | AVPN 2024; pagina storia AVPN | **verificato** | |
| «Nel 2010 ottiene il marchio STG dall'UE» | UE 2010, allegato II §1: richiedenti «Associazione Verace Pizza Napoletana» e «Associazione Pizzaiuoli Napoletani» | **errato** | La STG è una denominazione UE, non un marchio dell'AVPN. Il marchio dell'AVPN è il marchio collettivo «Verace Pizza Napoletana». La registrazione è senza riserva del nome (art. 13.2 Reg. 509/2006 non richiesto). |
| Farina 0/00 W 250–320 | AVPN 2024: W 250–320. UE 2010: W 220–380 | **verificato** (AVPN) | |
| Lievito di birra/madre | AVPN 2024: lievito di birra; ammesso il lievito naturale («sourdough»). UE 2010: solo lievito di birra | **verificato** (AVPN) | Per la STG la madre non è ammessa. |
| «Cottura solo in forno a legna» (attribuita ai parametri AVPN) | AVPN 2024: «Exemption from the wood-fired oven», gas o elettrico ammessi in deroga | **errato** | Vale solo per la STG. |
| Badge «STG dal 2010» | UE 2010: Reg. (UE) 97/2010 del 04/02/2010 | **verificato** | |

Nota: `signature_name` «Verace Pizza Napoletana STG» unisce due cose diverse, come già in `fonti-dati.md` §1.1.
Il testo nuovo usa «Verace Pizza Napoletana» e tiene STG solo nel badge e nella storia.

### 1.2 `igp_recco` — Focaccia di Recco col formaggio IGP

| Affermazione | Fonte | Stato | Nota |
|---|---|---|---|
| Doppia sfoglia sottilissima tirata a mano | CCIAA Genova 2024, art. 5.2.2: a mano, spessore «inferiore al millimetro» | **verificato** | |
| Crescenza | CCIAA Genova 2024: «formaggio fresco a pasta molle» | **plausibile** | Il disciplinare non dice «crescenza». Tolta. |
| Sigillatura dei bordi | CCIAA Genova 2024, 5.2.4: «Si saldano, schiacciandoli, i bordi» | **verificato** | |
| Cottura a 270 °C per 5 min | CCIAA Genova 2024: 270–320 °C per 4–8 minuti | **plausibile** | Nel testo nuovo c'è il range del disciplinare. |
| IGP dal 2015 | UE 2015: Reg. di esecuzione (UE) 2015/39 del 13/01/2015 | **verificato** | |
| Uno dei pochi prodotti da forno italiani senza lievito | CCIAA Genova 2024: «nell'impasto non viene utilizzato lievito» | **plausibile** | «Uno dei pochi» non è nella fonte. Nel testo nuovo: «si fa senza lievito». |
| Zona: Recco con Avegno, Sori e Camogli | CCIAA Genova 2024, art. 3 | **verificato** | |
| Formaggio fresco, a pasta molle, cremoso, da latte vaccino pastorizzato | CCIAA Genova 2024, art. 2 e 5: «latte vaccino fresco pastorizzato», «consistenza cremosa» | **verificato** | |

### 1.3 `apiter_teglia` — «APITER — Confraternita Pizza in Teglia»

**Risposta diretta:** un'organizzazione chiamata «APITER — Confraternita Pizza in Teglia» **non esiste**.
Esiste invece il **disciplinare APITER** («Autentica Pizza In TEglia alla Romana»), scritto dai membri del forum
**La Confraternita della Pizza** (laconfraternitadellapizza.forumfree.it) e firmato da circa 80 iscritti in una
loro convention. L'Accademia della Confraternita lo presenta come «primo al mondo». Non è una norma di legge né il
testo di un ente di categoria. Non va confuso con l'**APR — Associazione Pizza Romana** (2021, Enrico Famà, con
l'appoggio di Bonci; Gambero Rosso), di cui non ho trovato un disciplinare.

Il testo del disciplinare non l'ho letto in originale (la discussione sul forum risponde 503). I valori vengono
da un blog che lo trascrive (Trattoria da Martina, 29/09/2017).

| Affermazione | Fonte | Stato | Nota |
|---|---|---|---|
| `organization`: «APITER — Confraternita Pizza in Teglia» | Accademia La Confraternita della Pizza, 2026; Trattoria da Martina 2017 | **errato** | APITER è il disciplinare; l'autore è La Confraternita della Pizza. |
| `year_codified`: 2018 | Trattoria da Martina, 29/09/2017: il disciplinare esiste da «circa un annetto» | **errato** | **Lettura:** circa 2016. Anno esatto da confermare sul forum. |
| Idratazione 75–85% | Trattoria da Martina 2017: «da un minimo di 75% a un massimo di 100%» | **plausibile** | Sta dentro il range. |
| W 300–380 | Trattoria da Martina 2017: farina 00 o 0, W 300–380 | **verificato** (fonte secondaria) | |
| P/L 0,50–0,60 | Come sopra | **verificato** (fonte secondaria) | |
| No-knead con 3–4 pieghe | Trattoria da Martina 2017: «pieghe a 3 di rinforzo»; niente sul no-knead | **da verificare** | Nel testo nuovo: «pieghe di rinforzo a tre». |
| Maturazione 24–48 h in frigo | Trattoria da Martina 2017: minimo 24, massimo 72 ore in frigo | **plausibile** | |
| Nasce per tutelare l'identità della teglia romana | Accademia 2026: «Disciplinare per l'Autentica Pizza In Teglia alla Romana» | **plausibile** | |
| … «contro la deriva alta idratazione spinta» | Trattoria da Martina 2017: è un disciplinare per la teglia «ad alta idratazione» (75–100%) | **errato** | È il contrario. |
| «Standard di riferimento per le pizzerie professionali e i corsi pro» | Solo l'Accademia della Confraternita, che vende il proprio corso | **da verificare** | Tolto. |
| Badge «Standard pro» | Come sopra | **da verificare** | Nuovo badge: «Disciplinare di community». |
| `signature_name` «Teglia Romana APITER Standard» | — | **plausibile** | Rinominata «Teglia romana secondo il disciplinare APITER». |

## 2. Maestri

### 2.1 `bonci_pizzarium` — Gabriele Bonci, Pizzarium

| Affermazione | Fonte | Stato | Nota |
|---|---|---|---|
| No-knead totale | Nessuna fonte | **da verificare** | |
| 4 pieghe ogni 30 min con rotazione di 90° | Nessuna fonte | **da verificare** | |
| Maturazione 48–72 h in frigo | Scatti di Gusto (Bonci Milano): «minimo 72 ore»; Scatti di Gusto 2017: 80% e 72 h; FSR (Bonci Chicago): 48 h | **plausibile** | `parameter_overrides`: 82% e 48 h, coerenti con le fonti. |
| Stesura con le sole dita | Nessuna fonte specifica | **plausibile** | Testo nuovo: «stesura a mano». |
| Taglio con le forbici | Eating the World 2011; recensioni | **verificato** | |
| Vendita a peso | Eating the World 2011; Dissapore | **verificato** | |
| Pizzarium apre nel 2003 | Scatti di Gusto (Bonci Milano): «Pizzarium nel 2003, a Roma»; via della Meloria 43 (Gambero Rosso) | **verificato** | |
| «Ha codificato il metodo no-knead all'italiana nel 2003» | Nessuna fonte | **da verificare** | Il 2003 è l'apertura di Pizzarium, non un metodo. Tolto. |
| Pizzarium è il flagship | — | **plausibile** | |
| «Ha cambiato il paradigma della pizza al taglio» | Scatti di Gusto: la tradizione romana della teglia è stata segnata dal lavoro di Bonci | **plausibile** | Opinione: nel testo nuovo «Per molti critici…». |
| Badge «Pizza al taglio iconica» | — | **plausibile** | Opinione; nuovo badge: «Pizzarium dal 2003». |

`url` https://www.bonci.it risponde (200).

### 2.2 `pepe_caiazzo` — Franco Pepe, Pepe in Grani

| Affermazione | Fonte | Stato | Nota |
|---|---|---|---|
| «Fior di latte e pomodoro applicati post-cottura» | Dissapore: «in cottura … non viene messo il pomodoro ma la mozzarella di bufala» | **errato** | La mozzarella va in forno. |
| In 3 momenti; «dots geometrici» di pomodoro | Dissapore; The London Economic: pomodoro riccio di Caiazzo, crudo, a linee geometriche, dopo la cottura | **plausibile** | «Dots» è inglese; le fonti parlano di linee/strisce. |
| «Crema di mozzarella» | Come sopra | **errato** | |
| «Basilico fresco» | Dissapore: riduzione di basilico, ghiaccio e olio | **errato** | |
| «Sensory layering» | Nessuna fonte | **da verificare** | Non è un termine citato. Tolto. |
| Ha portato la pizza nella gastronomia gourmet | — | **plausibile** | Opinione. Tolta. |
| Pepe in Grani a Caiazzo | Dissapore; 50 Top Pizza | **verificato** | |
| Tra le migliori pizzerie del mondo (50 Top Pizza) | Gazzetta del Gusto 2018; Forbes Italia 2018; Scatti di Gusto 2019 | **verificato** | |
| «Ingredienti del Sannio» | Dissapore: «la terra dell'Alto Casertano» | **errato** | Caiazzo è nell'Alto Casertano. |
| «Scientifico-territoriale, fermentazioni controllate, tecnica chef» | Nessuna fonte | **da verificare** | Formula di marketing. Tolta. |
| Badge «50 Top Pizza #1 2017–2019» | Gazzetta del Gusto 2018 («come già nel 2017»); Forbes Italia 26/07/2018; Scatti di Gusto 23/07/2019 («due primi ex aequo» con I Masanielli) | **verificato** | Il 2019 è ex aequo: aggiunto nel testo. |
| `year_codified` 2012 (apertura) | Dissapore: Pepe in Grani nel 2012; Margherita Sbagliata nel 2015 | **verificato** | |

### 2.3 `martucci_caserta` — Francesco Martucci, I Masanielli

| Affermazione | Fonte | Stato | Nota |
|---|---|---|---|
| «Biga 50% (18 h a 18 °C) + autolisi» / nome «Canotto a Biga Ibrida 50%» | Dissapore 2017: «farina tipo 0 a basso valore proteico, impasto diretto», 24 h a temperatura ambiente | **errato** | Fonte del 2017: l'impasto può essere cambiato. Ma nessuna fonte parla di biga. |
| Fermentazione totale 48–72 h | Dissapore 2017: 24 h | **da verificare** | |
| «Cornicione esplosivo controllato» | — | **da verificare** | |
| «Ha portato il canotto moderno al massimo livello tecnico» | — | **da verificare** | |
| «La biga ibrida è studiata nei corsi professionali» | — | **da verificare** | |
| 50 Top Pizza #1 nel 2020 (anche badge) | 50 Top Pizza 2020: prima in Italia e nel mondo, da sola, dopo l'ex aequo 2019 | **verificato** | |

**Decisione per Matteo:** `use_pre_ferment: true` e `fermentation_hours: 48` a 4 °C contraddicono l'unica fonte
(impasto diretto, 24 h a temperatura ambiente). Servono una fonte più recente o override coerenti.

### 2.4 `sorbillo_napoli` — Gino Sorbillo

| Affermazione | Fonte | Stato | Nota |
|---|---|---|---|
| Stesura «a libro» velocissima | — | **da verificare** | Tolta. |
| «Ruota di carro» 32 cm | — | **da verificare** | Tolta. |
| Cornicione gonfio classico | — | **plausibile** | |
| Tradizione di famiglia dal 1935 (anche badge) | Sky TG24 2019: il nonno Luigi apre la prima pizzeria Sorbillo nel 1935 in via dei Tribunali 32 | **verificato** | |
| Terza generazione | Sky TG24 2019: Gino è nipote di Luigi; Dissapore: 21 figli nella generazione precedente | **plausibile** | Nessuna fonte scrive «terza generazione». |
| Rappresenta la tradizione napoletana classica | — | **plausibile** | |
| Pizzeria storica in via dei Tribunali | Sky TG24 2019 | **verificato** | |
| Volto televisivo | Sky TG24 2019: «numerose apparizioni in TV» | **verificato** | |
| Sedi in tutta Italia | Sky TG24 2019: locali in altre città italiane e all'estero | **verificato** | |

### 2.5 `bosco_aria_di_pane` — Renato Bosco, Saporè

| Affermazione | Fonte | Stato | Nota |
|---|---|---|---|
| Metodo «idrolisi» (autolisi spinta) | — | **da verificare** | |
| Lievito minimo | RSI: Doppio Crunch con lievito madre | **da verificare** | |
| Idratazione 80–90% | RSI: 800 g d'acqua per 1 kg di farina (80%) | **plausibile** | |
| Cottura bifasica | — | **da verificare** | |
| «Pizzaricercatore» | Regione Veneto (Veneto Around Me); stampa | **verificato** | |
| Di Saporè | Scatti di Gusto 2012 e 2019: Saporè a San Martino Buon Albergo (VR) | **verificato** | |
| «Ha codificato l'alta idratazione moderna in teglia» | — | **da verificare** | Tolto. |
| Aria di Pane e Doppio Crunch sono sue creazioni | Scatti di Gusto 2012: «marchio di fabbrica (registrato)»; Pizzacrunch, Doppio Crunch, Aria di Pane protetti | **verificato** | |
| «Studiate nei corsi professionali» | — | **da verificare** | Tolto. |
| «Tra i più premiati d'Italia (50 Top Pizza, Gambero Rosso)» | Reporter Gourmet 2025: Tre Spicchi Gambero Rosso; Gazzetta del Gusto 2020: 96/100. 50 Top Pizza: solo 12° tra le catene artigianali 2021 | **plausibile** | «Più premiati» è troppo. Nel testo nuovo: Tre Spicchi. |
| `year_codified` 2010 | Veneto Around Me: Saporè nasce nel 2009 | **errato** | Proposta: 2009. |

### 2.6 `capuano_napoli` — Vincenzo Capuano

| Affermazione | Fonte | Stato | Nota |
|---|---|---|---|
| Cornicione «canotto» alto e areato | Dissapore 2023: cornicioni che «si rialzano» | **plausibile** | |
| Mozzarella tagliata con le forbici, da fredda, per tenere il siero | Dissapore 27/05/2023: le forbici servono a tagliare la pizza, «meno stressante per l'impasto». Menu Capuano: «tagliare la pizza con le forbici … per valorizzare il nostro cornicione» | **errato** | |
| «~95% vs 70% col coltello» | Nessuna fonte | **errato** | Cifra senza base, legata a una premessa sbagliata. |
| Napoletana contemporanea sui social, seguito enorme | Mentelocale 10/2025: circa un milione di follower tra Instagram e TikTok; Scatti di Gusto 2024: 730 000 su Instagram | **verificato** | |
| Sedi in tutta Italia ed Europa | Scatti di Gusto (Milano, Roma, La Spezia); Guida Torino 2024; Mentelocale 2025 (Genova); The Peak 2025 (Singapore; cita Paesi Bassi, Germania, Kosovo) | **plausibile** | All'estero solo fonti promozionali. Nel testo nuovo: «anche all'estero». |
| «Il metodo forbici per i latticini è la sua firma più imitata» | — | **errato** | Il metodo non riguarda i latticini. |
| `year_codified` 2018 | — | **da verificare** | |

### 2.7 `bianco_phoenix` — Chris Bianco, Pizzeria Bianco

| Affermazione | Fonte | Stato | Nota |
|---|---|---|---|
| Fermentazione fredda di 5 giorni (anche `signature_name`) | Wikipedia «Pizzeria Bianco»: «ideally he lets it ferment for 18 hours». Trascrizione 2013 su PizzaMaking.com: 18–20 h in frigo | **errato** | `fermentation_hours: 120` → circa 18. |
| Farina macinata localmente (Arizona) | Trascrizione 2013: Hayden Flour Mills (Phoenix) e Central Milling (Utah); Phoenix New Times | **plausibile** | In parte da fuori Arizona. |
| Acqua, farina, sale, lievito | Trascrizione 2013: anche un po' di pasta vecchia | **plausibile** | |
| «Padre della pizza artigianale americana» | Opinione diffusa nella stampa, nessuna fonte di riferimento | **plausibile** | Tolta. |
| Primo pizzaiolo a vincere il James Beard Award | Wikipedia «Chris Bianco»: Best Chef Southwest 2003, primo pizzaiolo; Reporter Gourmet | **verificato** | La pagina dei premi della James Beard Foundation non l'ho aperta. |
| «3 volte» / badge «3× James Beard» | Wikipedia: vittorie nel 2003 e nel 2022 (Outstanding Restaurateur); candidature nel 2000 e nel 2020 | **errato** | Sono due. |
| Pochi ingredienti, lunga fermentazione, materia prima locale | — | **plausibile** | |
| `year_codified` 1988 | Wikipedia «Pizzeria Bianco»: 1987, in un negozio di alimentari | **plausibile** | Le fonti oscillano tra 1987 e 1988. Nel testo: «fine degli anni Ottanta». |

### 2.8 `forkish_portland` — Ken Forkish

| Affermazione | Fonte | Stato | Nota |
|---|---|---|---|
| «Impasto venerdì sera, fermentazione fredda overnight, pizza il sabato» | Ten Speed Press / librerie (*The Elements of Pizza*, 2016): impasti «Saturday» fatti al mattino per la pizza della sera. WPR (FWSY): «Overnight Straight Pizza Dough», impasto alle 19, 12 h a temperatura ambiente, poi almeno 6 h in frigo | **errato** | Nessuno dei due schemi è quello del testo. |
| Workflow dal libro «Flour Water Salt Yeast» | WPR; schede editoriali (FWSY ha una parte di ricette di pizza) | **verificato** | |
| «Ex-tecnologo» passato alla panificazione | James Beard Foundation (Q&A): vent'anni nell'industria tech | **verificato** | In italiano «tecnologo» fa pensare al tecnologo alimentare: riscritto «informatica». |
| Ha reso accessibile la fermentazione lunga a casa | — | **plausibile** | |
| Bestseller; premi | Schede editoriali: FWSY premiato con James Beard e IACP | **verificato** | |
| «Il Saturday Pizza è lo schema di riferimento per il weekend» | — | **da verificare** | Tolto. |
| Badge «Autore FWSY» | — | **verificato** | |
| Ken's Artisan Pizza, Portland, 2006 | Schede editoriali: Bakery 2001, Pizza 2006; kensartisan.com | **verificato** | |

## 3. Pizzeria storica

### 3.1 `da_michele_napoli` — L'Antica Pizzeria da Michele

| Affermazione | Fonte | Stato | Nota |
|---|---|---|---|
| «Da 150+ anni solo 2 pizze» | damichele.net 2026: «Con solo quattro pizze nel menù»; Dissapore 2023: Margherita, Marinara, Cosacca, Marita | **errato** | Per decenni sono state due (Michelin; Dissapore). |
| Forno a legna acceso dalle 7 | — | **da verificare** | Orario tolto. |
| Impasto giornaliero, niente fronzoli | — | **plausibile** | |
| Aperta nel 1870 | damichele.net: «dal 1870»; Smithsonian 2010 | **verificato** | Dissapore cita anche il 1863: c'è disaccordo tra le fonti. |
| … «in via Cesare Sersale» | Scatti di Gusto 2017 (libro di L. Condurro): in via Sersale dal 1930. Dissapore (intervista): inizio con Salvatore Condurro in via Egiziaca a Forcella | **errato** | Nel 1870 non era in via Sersale. |
| Pizzeria simbolo della tradizione popolare | — | **plausibile** | |
| «Il menu è composto da SOLO Margherita e Marinara» | damichele.net 2026 | **errato** | Oggi sono quattro. |
| Resa famosa da «Mangia prega ama» con Julia Roberts | Smithsonian 2010; Scatti di Gusto 07/08/2010 | **verificato** | |

## 4. Community

### 4.1 `malati_di_pizza` — **da togliere**

| Affermazione | Fonte | Stato | Nota |
|---|---|---|---|
| 0,5 g/cm² (era 0,75) | — | **da verificare** | |
| «Testata su 200+ post di forum» | — | **da verificare** | Non ho trovato nessun forum Malati di Pizza. |
| «Sviluppata sul forum Malati di Pizza» | malatidipizza.com 2026: «Malati di Pizza Academy», Limatola (BN), corsi in presenza e online, canale YouTube @MalatidiPizza | **errato** | Non è un forum. |
| «La community ha codificato dose, idratazione e timing» | — | **da verificare** | |
| «Bonci Casalingo» | — | **da verificare** | Usa il nome di Bonci senza nessun legame documentato: rischio C-5. |

### 4.2 `confraternita_pinsa` — **da togliere**

| Affermazione | Fonte | Stato | Nota |
|---|---|---|---|
| Miscela 70% grano, 15% riso, 15% soia | `fonti-dati.md` §1.2: Di Marco e PinsaRomana.info elencano gli ingredienti senza percentuali | **da verificare** | |
| 80% di idratazione | OPR 2020: 71–80%; PinsaRomana.it 2022: 80% | **plausibile** | |
| 48 h in frigo | OPR 2020: 24–96 h a 4 °C | **plausibile** | |
| Stesura ovale, crosta vetrosa | — | **plausibile** | |
| Il forum Confraternita della Pizza esiste | laconfraternitadellapizza.forumfree.it | **verificato** | |
| «Ha codificato la Pinsa Romana moderna» | La pinsa moderna è attribuita a Corrado Di Marco (2001) da tutte le fonti lette | **da verificare** | Nessuna fonte per un ruolo della Confraternita. |
| «Divulgando ricette di Corrado Di Marco» | — | **da verificare** | |
| «Standard per la pinsa casalinga di qualità» | — | **da verificare** | |

Nota: se la voce resta, va riscritta sul protocollo OPR 2020 (Associazione Originale Pinsa Romana), che è la
sola fonte con numeri.

---

## Decisioni per Matteo (campi non testuali)

| Voce | Campo | Ora | Proposta | Fonte |
|---|---|---|---|---|
| `apiter_teglia` | `organization` | «APITER — Confraternita Pizza in Teglia» | «La Confraternita della Pizza (disciplinare APITER)» | Accademia Confraternita 2026; Trattoria da Martina 2017 |
| `apiter_teglia` | `year_codified` | 2018 | circa 2016 (da confermare sul forum) | Trattoria da Martina 2017 |
| `apiter_teglia` | `verified_canonical` | true | **Lettura:** da ripensare. È il disciplinare di una community, non di un ente | — |
| `martucci_caserta` | `use_pre_ferment`, `fermentation_hours`, `fermentation_temp_c` | true, 48, 4 | false, 24, 22 (oppure una fonte più recente) | Dissapore 2017 |
| `bianco_phoenix` | `fermentation_hours` | 120 | circa 18 | Wikipedia «Pizzeria Bianco»; PizzaMaking.com 2013 |
| `bosco_aria_di_pane` | `year_codified` | 2010 | 2009 | Veneto Around Me |
| `capuano_napoli` | `year_codified` | 2018 | da verificare | — |
| `malati_di_pizza`, `confraternita_pinsa` | voce intera | — | togliere (vedi `_remove`) | §4 |
| `igp_recco` | `organization` | «Consorzio Focaccia di Recco IGP» | da verificare il nome esatto del consorzio | — |

**Lettura sulla regola C-5.** Nel JSON corretto i maestri hanno un `signature_name` «Ispirata a…». Come
alternativa si può usare un'unica nota nella card («Ricostruzione da fonti pubbliche, non è la ricetta del maestro»)
e lasciare i nomi brevi. Le due soluzioni non vanno usate insieme.

---

## Riferimenti

Data d'accesso per tutte: **24/10/2026**. Per UE 2010, AVPN 2024, UE 2015, CCIAA Genova 2024, OPR 2020 e
PinsaRomana.it 2022 vedi i riferimenti completi in `docs/fonti-dati.md`.

- **UE 2010.** Reg. (UE) n. 97/2010 del 04/02/2010, «Pizza Napoletana» STG, allegato II §1 (richiedenti). https://www.boe.es/doue/2010/034/L00007-00016.pdf
- **AVPN 2024.** Disciplinare internazionale, PDF del 21/02/2024. https://www.pizzanapoletana.org/public/pdf/Disciplinare-2024-ENG.pdf — Storia: https://www.pizzanapoletana.org/en/storia_avpn
- **UE 2015.** Reg. di esecuzione (UE) 2015/39. https://www.boe.es/doue/2015/008/L00007-00009.pdf
- **CCIAA Genova 2024.** Disciplinare IGP Focaccia di Recco. https://www.ge.camcom.gov.it/it/promuovi/prodotti-tipici/prodotti-dop-e-igp/disciplinare_focaccia_di_recco_settembre_2024.pdf
- **Trattoria da Martina 2017.** «Pizza in teglia alla romana ad alta idratazione – disciplinare APITER», 29/09/2017. https://www.trattoriadamartina.com/2017/09/pizza-in-teglia-alla-romana-ad-alta-idratazione/
- **Accademia La Confraternita della Pizza, 2026.** https://accademialaconfraternitadellapizza.net/home — Forum: https://laconfraternitadellapizza.forumfree.it/ (discussione APITER: https://laconfraternitadellapizza.forumfree.it/?t=72606195, 503 al momento della verifica)
- **Gambero Rosso, s.d.** «L'avanzata della pizza romana ora può contare su un'associazione sostenuta da Bonci» (APR, 2021). https://www.gamberorosso.it/notizie/lavanzata-della-pizza-romana-ora-puo-contare-su-unassociazione-sostenuta-da-bonci (403: letto solo il riassunto della ricerca)
- **Gazzetta del Gusto 2018.** «50 Top Pizza 2018: la migliore pizzeria è Pepe in Grani». https://www.gazzettadelgusto.it/food-news/50-top-pizza-2018-la-migliore-pizzeria-e-pepe-in-grani-caiazzo/
- **Forbes Italia 2018.** 26/07/2018. https://forbes.it/2018/07/26/la-classifica-delle-migliori-pizzerie-ditalia-e-del-mondo-nel-2018
- **Scatti di Gusto 2019.** «50 Top Pizza classifica 2019», 23/07/2019. https://www.scattidigusto.it/2019/07/23/50-top-pizza-classifica-2019/
- **50 Top Pizza 2020.** «I Masanielli – Francesco Martucci has been named Best Pizzeria in the World». https://www.50toppizza.it/50-top-pizza-2020-i-masanielli-francesco-martucci-has-been-named-best-pizzeria-in-the-world/
- **Dissapore, s.d.** «La Margherita sbagliata di Franco Pepe». https://www.dissapore.com/ristoranti/la-margherita-sbagliata-di-franco-pepe-storia-di-una-pizza-che-ha-fatto-la-storia-della-pizza/
- **The London Economic, s.d.** Margherita Sbagliata nel Regno Unito. https://thelondoneconomic.com/?p=373769
- **Dissapore 2017.** «I Masanielli vs. Lioniello: Campionato della pizza 2017». https://www.dissapore.com/pizzerie/campionato-pizza-2017-i-masanielli-vs-lioniello/
- **Sky TG24 2019.** «Gino Sorbillo, chi è», 16/01/2019. https://tg24.sky.it/cronaca/2019/01/16/gino-sorbillo-chi-e
- **Dissapore, s.d.** Libro di Dissapore su Gino Sorbillo. https://www.dissapore.com/notizie/gino-sorbillo-libro-dissapore/
- **Scatti di Gusto, s.d.** «Bonci Pizza in Teglia a Milano». https://www.scattidigusto.it/bonci-pizza-in-teglia-a-milano-menu-prezzi-recensione
- **Scatti di Gusto 2017.** Osteria di Birra del Borgo, 21/03/2017. https://www.scattidigusto.it/2017/03/21/roma-gabriele-bonci-nuova-osteria-borgo
- **Eating the World 2011.** «Pizza by the Slice in Rome: Pizzarium», 24/10/2011. https://eatingtheworld.net/2011/10/24/italy-pizzarium
- **FSR Magazine, s.d.** Bonci Chicago. https://www.fsrmagazine.com/industry-news/famed-bonci-pizza-open-first-us-location-chicago/
- **Veneto Around Me, s.d.** Profilo di Renato Bosco. https://venetoaroundme.regione.veneto.it/en/node/94737
- **Scatti di Gusto 2012.** «Saporè, la r-evoluzione…», 29/08/2012. https://www.scattidigusto.it/2012/08/29/sapore-la-r-evoluzione-di-pizza-pane-e-focaccia-secondo-renato-bosco
- **Scatti di Gusto 2019.** «Renato Bosco apre Saporè in Duomo a Milano», 18/11/2019. https://www.scattidigusto.it/2019/11/18/renato-bosco-apre-sapore-in-duomo-a-milano/
- **RSI, s.d.** «La pizza gourmet di Renato Bosco: il doppio crunch». https://www.rsi.ch/food/ricette/La-pizza-Gourmet-di-Renato-Bosco-il-doppio-crunch-di-pizza-vegetariano--715499.html
- **Reporter Gourmet 2025.** Renato Bosco. https://reportergourmet.com/en/chef/1033-renato-bosco
- **Gazzetta del Gusto 2020.** Pizzerie d'Italia 2020 del Gambero Rosso. https://gazzettadelgusto.it/food-news/pizzerie-ditalia-2020-presentata-la-guida-del-gambero-rosso/
- **Dissapore 2023.** «Vincenzo Capuano a Napoli, recensione», 27/05/2023. https://www.dissapore.com/ristoranti/vincenzo-capuano-a-napoli-recensione-come-si-mangia-dalluomo-che-usa-le-forbici-sulla-pizza
- **Capuano, menu Roma 2024.** https://capvin.com/wp-content/uploads/2024/05/ROMA_Menu-Italiano_QR-CODE.pdf
- **Mentelocale 2025.** Pizzeria Capuano a Genova, ottobre 2025. https://www.mentelocale.it/genova/93454-la-pizzeria-gourmet-di-vincenzo-capuano-a-genova-ecco-dove-ha-aperto.htm
- **The Peak 2025.** Capuano a Singapore (fonte promozionale). https://www.thepeakmagazine.com.sg/lifestyle/vincenzo-capuano-opening-singapore
- **Wikipedia, «Chris Bianco».** https://en.wikipedia.org/wiki/Chris_Bianco — **«Pizzeria Bianco».** https://en.wikipedia.org/wiki/Pizzeria_Bianco
- **PizzaMaking.com 2013.** Trascrizione della descrizione di Bianco della pizza Rosa. https://www.pizzamaking.com/forum/index.php?msg=276502
- **Phoenix New Times, s.d.** Marco Bianco sul grano antico. https://www.phoenixnewtimes.com/food-drink/marco-bianco-of-pizzeria-bianco-on-heirloom-wheat-and-what-makes-great-bread-6506565/
- **James Beard Foundation, s.d.** «Q & A with JBF Award Nominee Ken Forkish». https://www.jamesbeard.org/stories/q-a-with-jbf-award-nominee-ken-forkish
- **WPR, s.d.** «Recipe: Overnight Straight Pizza Dough» (da FWSY). https://wpr.org/food/recipe-overnight-straight-pizza-dough-ken-forkish
- **Penguin / Ten Speed Press 2016.** *The Elements of Pizza*, scheda editoriale. https://www.penguin.com.au/books/the-elements-of-pizza-9781607748397
- **L'Antica Pizzeria da Michele 2026.** https://www.damichele.net/
- **Scatti di Gusto 2017.** Libro di Laura Condurro su da Michele, 26/04/2017. https://www.scattidigusto.it/2017/04/26/pizzeria-da-michele-libro-laura-condurro/
- **Dissapore, s.d.** Intervista Condurro. https://www.dissapore.com/pizzerie/antica-pizzeria-da-michele-intervista-condurro/
- **Dissapore 2023.** Recensione della sede di Forcella. https://www.dissapore.com/ristoranti/lantica-pizzeria-da-michele-dal-1870-recensione-della-sede-di-forcella-lunica-incontrastata/
- **Michelin, s.d.** Da Michele. https://guide.michelin.com/us/en/campania/napoli/restaurant/da-michele
- **Smithsonian 2010.** «A Culinary Tour of Eat Pray Love». https://www.smithsonianmag.com/arts-culture/a-culinary-tour-of-eat-pray-love-97068231/
- **Scatti di Gusto 2010.** Julia Roberts da Michele, 07/08/2010. https://www.scattidigusto.it/2010/08/07/julia-roberts-mangia-pizza-napoletana-da-michele-in-eat-pray-love/
- **Malati di Pizza 2026.** https://www.malatidipizza.com/
