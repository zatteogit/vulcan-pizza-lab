# Fonti dei dati tecnici — stili, farine, forni, lievito

Voce C-4 dell'handoff del 23/10/2026: «Fonti e date per ogni dato tecnico di stili,
farine e forni, pronte per essere sostituite dai dati di un partner».

- **Data della verifica:** 24/10/2026. Tutte le fonti sono state aperte e lette in quella data.
- **Chi:** ricerca di un agente AI per Matteo. Nessun valore del codice è stato cambiato:
  qui ci sono solo constatazioni e proposte.
- **Righe:** i riferimenti `file:riga` valgono al 24/10/2026. `pizza-engine.ts` era in
  modifica durante la verifica, quindi lì conta anche il nome della costante o della funzione.

## Come leggere gli stati

| Stato | Significato |
|---|---|
| **verificato** | Ho letto una fonte affidabile che riporta il valore, oppure un intervallo che lo contiene e che vale per lo stesso oggetto. |
| **plausibile** | Il valore è coerente con le fonti, ma nessuna lo riporta così. |
| **da verificare** | Non ho trovato una fonte che si possa citare. |
| **errato** | Una fonte lo contraddice. In nota ci sono la fonte e il valore che riporta. |

Nelle note, **Fatto** è ciò che la fonte dice; **Lettura** è un'interpretazione mia;
**Ipotesi** è un'ipotesi da controllare.

Le fonti sono citate come «ente o autore, anno». Riferimenti completi, URL e data
d'accesso sono in fondo.

## Il registro nel codice (FW-01, 28/10/2026)

Questo documento resta la **ricerca**: fonti lette, note «Fatto / Lettura /
Ipotesi», proposte. Il **registro operativo** che l'app legge è nel codice:

| Che cosa | Dove | Contenuto |
|---|---|---|
| Tipi | `src/app/domain/science/types.ts` | `EvidenceKind` (esatto, stima, ipotesi, scelta di Vulcan), `SourceStatus` (verified, plausible, unverified, wrong = V, P, D, errato), `ScienceNote`, `SourceRef` |
| Fonti | `src/app/data/science-sources.ts` | Id stabili (`masaf-stg-2010`, `avpn-2024`, `salvado-2011`…) trascritti dai §Riferimenti qui sotto, da `docs/ricerca/prefermenti-fonti-2026-10-24.md` e da `docs/ricerca/forni-fonti-2026-10-24.md`, con stato e data di lettura |
| Note | `src/app/data/science-notes.ts` | Una nota per affermazione: statuto, formula, variabili, ipotesi, fonti, incertezza, costante del motore descritta, voce di glossario |
| Testi | CMS, `science.notes.<id>.{title,l1,l2}` e `science.assumptions.<id>` | Titolo, «In breve», «Perché» e testo delle ipotesi, in 7 lingue |
| Precisione | `roundForEvidence` in `src/app/domain/science/evidence.ts` | Una stima non mostra più decimali di `uncertainty.displayDecimals` (Aw a 2, fattore Q10 a 1) |
| Guardia | `src/app/domain/science/science-registry.test.ts` | Ogni nota ha una fonte esistente oppure è ipotesi o scelta di Vulcan; nessuna fonte «errata» citata; ogni stima dichiara l'incertezza; testi in tutte le lingue; nessuna promessa di salute nelle caratteristiche degli stili |

Regola: ogni nuova affermazione tecnica entra **prima** nel registro (nota +
fonte, oppure statuto «ipotesi» o «scelta di Vulcan»), **poi** nell'interfaccia.
Quando una ricerca cambia lo stato di un valore, si aggiornano insieme questo
documento e lo `status` della fonte nel registro. Le note descrivono ciò che il
motore fa oggi: correggere un modello è un lavoro separato, con misure prima e dopo.

---

## 1. Stili (`src/app/domain/styles-db.ts`)

### 1.1 Napoletana STG (`napoletana_stg`, righe 59–109)

Ci sono due testi diversi, e il codice li mescola:
- il **disciplinare STG** dell'UE (UE 2010), cioè la norma di legge;
- il **disciplinare dell'AVPN** (AVPN 2024), cioè il regolamento privato del marchio «Verace Pizza Napoletana».

Il nome dello stile dice STG, ma W e P/L vengono dall'AVPN.

| Dato | Codice | Dove | Fonte | Stato | Nota |
|---|---|---|---|---|---|
| W farina | 250–320 | `styles-db.ts:65` | AVPN 2024 (farina 00 e 0: W 250–320). UE 2010: W 220–380 | **verificato** (AVPN) | Il commento dice «AVPN 2024»: corretto. Per la STG l'intervallo di legge è più largo, 220–380. |
| P/L | 0,55–0,70 | `:66` | AVPN 2024: 0,50–0,70 per la 00 (ideale 0,6), 0,55–0,70 per la 0. UE 2010: 0,50–0,70 | **plausibile** | Sta dentro entrambe le fonti. |
| Idratazione | 55–62% | `:67` | UE 2010: 1 L d'acqua per 1800 g di farina (55,6%). AVPN 2024: 1 L per 1600–1800 g (55,6–62,5%) | **verificato** | Il conto acqua/farina è mio, sui valori dei due testi. |
| Sale | 2,8% | `:72` | UE 2010: 50–55 g per litro → 2,8–3,1% sulla farina. AVPN 2024: 40–60 g per litro | **verificato** (STG) | |
| Fermentazione | 8–24 h | `:76` | UE 2010: 2 h in massa + 4–6 h in panetti, a temperatura ambiente (25 °C), poi uso entro 6 h. AVPN 2024: totale «min 12 – max 24 ore» | **errato** (in parte) | Nessun testo dà 8–24. Per la STG la lievitazione è di 6–8 h (al massimo circa 14 h con l'uso). Per l'AVPN il minimo è 12 h. **Decisione:** scegliere un riferimento (STG 6–14 h oppure AVPN 12–24 h) o dichiarare il range come compromesso. |
| Peso panetto | 270 g | `:81` | UE 2010: 180–250 g. AVPN 2024: 200 g (pizza da 22–24 cm), 280 g (28–35 cm) | **errato** per la STG, **plausibile** per l'AVPN | |
| Diametro | 32 cm | `:83` | UE 2010: non oltre 35 cm. AVPN 2024: 22–35 cm | **verificato** | |
| Temperatura forno | 430–500 °C, ideale 485 | `:87–88` | UE 2010: platea circa 485 °C, volta circa 430 °C. AVPN 2024: platea circa 380–430 °C, cupola circa 485 °C | **plausibile** | **Fatto:** i due testi danno 485 °C a superfici diverse (platea per la STG, cupola per l'AVPN). Nessuno dei due arriva a 500 °C. **Lettura:** 485 come ideale regge in entrambi i casi, ma va detto se il motore intende la platea o l'aria del forno. |
| Tempo di cottura | 60–90 s | `:89` | UE 2010 e AVPN 2024: 60–90 s | **verificato** | |
| Forno a legna obbligatorio | sì | `:86`, `:93` | UE 2010: «esclusivamente» forno a legna. AVPN 2024: ammette gas o elettrico in deroga | **verificato** (STG) | |

### 1.2 Pinsa romana (`pinsa_romana`, righe 252–304) — decisione D-013

**Risposta a D-013.** Il range 350–420 °C (ideale 380) **non ha una fonte**. La sola fonte
legata all'inventore che dà un numero dice **300/310 °C su pietra** (PinsaRomana.it 2022):
«Il forno in pizzeria viene impostato a 300/310°C e la cottura avviene su pietra».
Il protocollo dell'associazione che certifica le pinserie non dà una temperatura (OPR 2020).
Stato: **errato**. Proposta: `temp_c_range: [280, 320]`, `temp_c_ideal: 300`.
La decisione resta a Matteo.

| Dato | Codice | Dove | Fonte | Stato | Nota |
|---|---|---|---|---|---|
| Temperatura forno | 350–420 °C, ideale 380 | `:283–284` | PinsaRomana.it 2022: 300/310 °C su pietra. OPR 2020: nessuna temperatura | **errato** | Vedi sopra. In casa la stessa fonte indica il forno al massimo (circa 250 °C). |
| Tempo di cottura | 180–300 s | `:285` | Nessuna fonte con il tempo di cottura professionale | **da verificare** | PinsaRomana.it 2022 dà solo «al massimo 2 minuti» per la precottura in casa. |
| Idratazione | 75–85% | `:260` | OPR 2020: 1 L d'acqua per 1,25–1,4 kg di farina → 71–80%. PinsaRomana.it 2022: 800 g per 1 kg (80%) | **errato** (in parte) | 85% è sopra il protocollo. Proposta: `[72, 80]`. |
| Fermentazione | 24–72 h | `:265` | OPR 2020: 24–96 h, maturazione a 4 °C in frigo; vietate le lievitazioni sotto le 24 h | **plausibile** | Si può allargare a 96 h. |
| Sale | 2,5% | `:261` | OPR 2020: 20–25 g per litro → 1,4–2,0% sulla farina | **errato** | Proposta: 1,8%. Il conto è mio. |
| Olio | 1,0% | `:262` | OPR 2020: 15–20 g per litro → 1,1–1,6% sulla farina | **errato** (di poco) | Proposta: 1,3%. |
| Miscela 70/15/15 (frumento/soia/riso) | 70/15/15 | `:268–272` | OPR 2020 prescrive solo la «Farina Pinsa Romana expert». Di Marco (2026) e PinsaRomana.info elencano frumento, riso, soia e pasta madre, senza percentuali | **da verificare** | Le percentuali non sono pubbliche. |
| W della farina | 280–340 | `:258` | Nessuna fonte | **da verificare** | |
| Peso panetto | 280 g | `:276` | OPR 2020: 230–250 g (classica), 130–150 g (monoporzione). PinsaRomana.it 2022: 240–250 g | **errato** | Proposta: 240 g. |
| Dimensioni da cotta | 35 × 25 cm | `:278–279` | OPR 2020: lunghezza 32–35 cm, larghezza 20–22 cm | **errato** (larghezza) | Proposta: 34 × 21 cm. |

Contesto, non verificato su fonte primaria: secondo PinsaRomana.info la pinsa romana
è entrata nel 2025 tra i Prodotti agroalimentari tradizionali (PAT) del Lazio. Non ho
trovato la scheda PAT ufficiale: se esiste, è la fonte da usare.

### 1.3 Focaccia di Recco col formaggio IGP (`focaccia_recco`, righe 636–688)

L'IGP è registrata con il Regolamento di esecuzione (UE) 2015/39 del 13/01/2015 (UE 2015).
Il disciplinare in vigore è pubblicato dalla Camera di Commercio di Genova (CCIAA Genova 2024).

| Dato | Codice | Dove | Fonte | Stato | Nota |
|---|---|---|---|---|---|
| W farina | 300–340 | `:642` | CCIAA Genova 2024, art. 5: «W:>300; P/L: non inferiore a 0,50 o in alternativa farina Manitoba» | **verificato** (limite basso) | Il disciplinare non fissa un tetto: 340 è una scelta. |
| P/L | 0,55–0,70 | `:643` | Come sopra: P/L ≥ 0,50 | **plausibile** | |
| Idratazione | 45–50% | `:644` | Il disciplinare **non** indica l'idratazione | **da verificare** | Il commento nel codice attribuisce 45–50% al «disciplinare IGP»: l'attribuzione è sbagliata. |
| Riposo | 0,5–2 h | `:649` | CCIAA Genova 2024: riposo «per almeno 30 minuti» a temperatura ambiente | **verificato** (minimo) | |
| Senza lievito | sì | `:651` | CCIAA Genova 2024: ingredienti farina, acqua, olio extravergine, sale, formaggio. Nessun lievito | **verificato** | |
| Temperatura forno | 300–340 °C, ideale 320 | `:661–662` | CCIAA Genova 2024: «tra 270° e 320°C» | **errato** | 340 è fuori norma. Proposta: `[270, 320]`, ideale 300. |
| Tempo di cottura | 480–600 s | `:663` | CCIAA Genova 2024: «per 4-8 minuti» (240–480 s) | **errato** | Proposta: `[240, 480]`, ideale 360. |
| Spessore sfoglia | `thickness_factor` 0,08 | `:656` | CCIAA Genova 2024: sfoglia sotto il millimetro, altezza ai bordi sotto 1 cm | **plausibile** | |
| «IGP dal 2015» | testo | `:679` | UE 2015: registrazione del 13/01/2015 | **verificato** | |

### 1.4 Fritta, montanara, calzone (`pizza_fritta`, `pizza_montanara`, `calzone_napoletano`)

| Dato | Codice | Dove | Fonte | Stato | Nota |
|---|---|---|---|---|---|
| Fritta: olio | 180–190 °C, ideale 185 | `:1090–1091` | AVPN 2024: temperatura ideale di frittura «around 175 °C». Friggitrice «generally between 175 °C and 190 °C» | **errato** (in parte) | 190 rientra, ma l'ideale indicato dall'AVPN è 175. Proposta: `[175, 190]`, ideale 175. |
| Montanara: olio | 180–190 °C, ideale 185 | `:1140–1141` | Come sopra | **errato** (in parte) | L'AVPN cita la montanara solo tra i condimenti della pizza fritta. Il passaggio in forno dopo la frittura è un uso di Starita (Parla 2008; 50 Top Pizza 2022), non una regola: le ricette di Sorbillo non lo prevedono. |
| Fritta, tonda e montanara: impasto (dal 24/10 W 250–320, idratazione 60–65%, 8–24 h) | | `pizza_fritta`, `pizza_fritta_tonda`, `pizza_montanara` | AVPN 2024, §2.1.1: una sola farina per tutto il disciplinare, W 250–320; «min 12 – max 24 ore». Sorbillo (Scatti di Gusto 2016; Pagano 2020): 8 h, idratazione 62,5–66,7% | **verificato** (W, AVPN), **plausibile** (idratazione), **verificato** (8 h Sorbillo, 24 h AVPN) | D-023: lievitazione 8–24 h, scelta di Matteo tra AVPN e friggitorie. Prima W 220–280 e 4–8 h, senza fonte. |
| Fritta: panetto | 200 g (era 100) | `pizza_fritta` | AVPN 2024, §4.2: ripieno «for a loaf of approximately 200 g» | **verificato** | |
| Fritta: ripieno | ricotta 85, provola 40, cicoli 55 g | `pizza_fritta_ripiena` | AVPN 2024, §4.2: ricotta 80–90 g, provola o fiordilatte 30–50 g, cicoli o salame 50–60 g per 200 g | **verificato** | Prima 80/70/40 g. |
| Tonda fritta: due dischi 120 + 80 g, 2–3 mm, olio di semi a circa 175 °C | `pizza_fritta_tonda` (nuovo, D-022) | | AVPN 2024, Art. 1 e §4.2: «round-shaped product (tonda fritta)», dischi «approximately 80gr for the upper disc and 120gr for the lower disc», spessore «approximately 2-3 mm» | **verificato** | Per la Masardona è la «pizza fritta tradizionale» (Pignataro 2025). Diametro (22 cm) e tempo di frittura (60–120 s) **da verificare**. |
| Montanara: panetto | 100 g | `pizza_montanara` | Scatti di Gusto 2016: «due pagnottine da circa 100 g»; Pagano 2020: «circa 110 g» | **verificato** | Diametro e tempo di frittura **da verificare** («pochi secondi», Pagano 2020). Ricotta nel condimento **da verificare**. |
| «Battilocchio» / «pizza fritta aperta» | non nel codice | | Amodio 2025, Pignataro 2025, Becchi 2023, Clemente 2016: il battilocchio è **chiuso**, un disco ripiegato e allungato. Nessuna fonte per una fritta aperta diversa dalla montanara | — | Per questo non è stato aggiunto (D-022). «Battilocchio» risulta registrato dalla Masardona (Pignataro 2025): da controllare prima di usarlo. |
| Calzone: forno | 400–470 °C, ideale 430 | `:1190–1191` | AVPN 2024: stesso forno della pizza, con tempi «longer» per il ripieno. Nessun numero | **plausibile** | |
| Calzone: cottura | 120–240 s | `:1192` | Come sopra | **da verificare** | |
| Calzone: impasto | W 250–320, 58–62%, 8–24 h | `:1172–1179` | Coincide con la napoletana. Valgono le note di §1.1 | **plausibile** | |

### 1.5 New Haven apizza (`new_haven_apizza`, righe 1274–1323)

| Dato | Codice | Dove | Fonte | Stato | Nota |
|---|---|---|---|---|---|
| Forno | 340–400 °C, ideale 370 | `:1298–1299` | PMQ 2019: Gary Bimonte (Pepe's) dice «Coal burns at 1,000˚, and wood burns at 600˚ to 700˚» (°F, cioè circa 540 °C e 315–370 °C). Si parla del fuoco, non della platea | **plausibile** | Nessuna misura della platea. Fonte di settore, non tecnica. |
| Fermentazione lunga | 24–72 h | `:1287` | PMQ 2019: impasto lasciato lievitare più a lungo, in frigo. Nessun numero | **plausibile** | |
| Proteine circa 13% | — | `:1280` (W 240–300) | PMQ 2019: farina con proteine «around 13%» | **plausibile** | |
| Idratazione 60–66% | | `:1282` | Nessuna fonte | **da verificare** | |

### 1.6 Gli altri stili: controllo rapido

Per questi stili non ho trovato fonti primarie: non ci sono disciplinari e i siti
di riferimento (per esempio Serious Eats per New York e Detroit) non erano raggiungibili.
I commenti nel codice citano autori come Reinhart, Kenji, Bonci, «APITER» o «Consultapizza»,
ma non li ho potuti leggere, quindi non contano come fonte.

| Stile | Forno (`temp_c_range`, ideale) | Riga | Idratazione | W | Fermentazione | Stato | Nota |
|---|---|---|---|---|---|---|---|
| napoletana_canotto | 400–480, 450 | 135 | 65–75 | 280–340 | 24–72 | da verificare | Non è un disciplinare. AVPN 2024 vale solo come riferimento per il forno. |
| teglia_romana | 260–300, 280 | 183 | 75–85 | 280–320 | 24–48 | da verificare | Il commento cita un «Disciplinare APITER» con W 300–380: non trovato. Anche così il codice (280–320) non coincide con quel commento. |
| tonda_romana | 300–340, 320 | 229 | 50–55 | 200–240 | 6–24 | da verificare | Il commento sull'idratazione dice «tradizionale 55–60%», ma il codice ha 50–55: incoerenza interna. |
| new_york | 270–310, 290 | 330 | 58–65 | 280–340 | 18–48 | da verificare | |
| detroit | 250–290, 270 | 377 | 70–75 | 280–320 | 18–48 | da verificare | |
| chicago_deep | 200–235, 225 | 423 | 48–52 | 220–260 | 12–24 | da verificare | |
| focaccia_genovese | 210–250, 230 | 473 | 55–62 | 240–280 | 6–18 | da verificare | Non è IGP né STG. Esistono un marchio collettivo e un presidio Slow Food, ma non ne ho letto il testo (pagina Slow Food: 403). |
| sfincione | 200–240, 220 | 520 | 60–70 | 240–280 | 8–24 | da verificare | |
| pala_romana | 330–380, 350 | 567 | 75–82 | 280–320 | 18–48 | da verificare | |
| grandma_style | 230–260, 250 | 614 | 60–65 | 240–280 | 18–48 | da verificare | |
| padellino_torino | 220–240, 230 | 714 | 60–65 | 220–260 | 18–48 | da verificare | |
| pizza_baciata | 270–300, 285 | 764 | 75–85 | 280–340 | 24–48 | da verificare | |
| ciaccino_senese | 230–270, 250 | 821 | 60–65 | 220–280 | 4–12 | da verificare | |
| pizza_spaccata | 270–300, 285 | 884 | 72–80 | 280–340 | 24–48 | da verificare | |
| trancio_milanese | 220–260, 240 | 943 | 65–75 | 280–340 | 18–36 | da verificare | |
| chicago_tavern | 240–280, 260 | 990 | 50–58 | 240–290 | 18–36 | da verificare | |
| focaccia_barese | 220–250, 240 | 1040 | 70–80 | 220–280 | 8–24 | da verificare | |
| pizza_al_metro | 300–380, 340 | 1248 | 62–70 | 260–320 | 12–36 | da verificare | |
| fugazzeta | 220–260, 240 | 1348 | 55–62 | 200–260 | 4–12 | da verificare | |
| california_style | 280–340, 300 | 1405 | 60–65 | 240–300 | 24–48 | da verificare | |
| greek_pan | 230–260, 245 | 1455 | 60–68 | 220–280 | 4–12 | da verificare | |
| teglia_in_giornata | 200–280, 210 | `teglia_in_giornata` | 75–82 | 250–330 | 2–12 | verificato (riferimento) | Tranche B2, 30/10/2026. Intervalli che contengono le tre fonti del §9.2–9.3 di `docs/progetto-catalogo-italiano.md` (Benedetta Rossi, Adriano Continisio, Paoletta); centro, sale 1,2 %, olio 9,2 %, zucchero 1,6 %, teglia 35×35 da 967 g e 210 °C × 30 min dalla ricetta di Benedetta Rossi (pagina ufficiale verificata il 30/10/2026). W 280 per «metà manitoba e metà 00» è una stima di Vulcan da `FLOUR_W_RANGES`. Preriscaldo 20 min e tempo d'impasto 10 min: stime di Vulcan. |

---

## 2. Farine (`src/app/data/flour-database.ts` e `FLOUR_W_RANGES` in `pizza-engine.ts`)

Ho cercato solo le farine di marca. Le farine «Generico» non hanno un produttore da
citare: restano **da verificare** finché un partner non fornisce le sue schede.

### 2.1 Schede dei produttori

| Farina (id) | Codice: W / P/L / proteine | Righe | Scheda del produttore | Stato | Nota |
|---|---|---|---|---|---|
| `caputo_pizzeria` | 265 / 0,55 / 12,5% | 35, 38, 39 | Mulino Caputo 2025, «Pizzeria»: tipo 00, W 260/280, P/L 0,50/0,60, proteine 12,50% | **verificato** | Assorbimento, falling number, stabilità e prezzo non sono sulla pagina: da verificare. |
| `caputo_nuvola` | 280 / 0,55 / 12,5% | 56, 59, 60 | Mulino Caputo 2025, «Nuvola»: **tipo 0**, W 270/290, P/L 0,50/0,60, proteine 12,50% | **verificato** | |
| `caputo_cuoco` («Cuoco (Saccorosso)») | 320 / 0,60 / 13,0% | 247, 250, 251 | Mulino Caputo 2024, «Saccorosso»: tipo 00, W 300/320, P/L 0,50/0,60, proteine 13% | **verificato** | 320 è il limite alto della scheda; il centro è 310. |
| `petra_5037` | 320 / 0,60 / 13,25%, assorbimento 85% | 77, 80, 81, 82 | Molino Quaglia (Petra), s.d., «Petra 5037»: tipo 0, W 300–340, P/L 0,55–0,65, protidi 13,0–13,5%, assorbimento «oltre 85%», idratazioni consigliate 65–85% | **verificato** | |
| `petra_3_evolutiva` | 340 / 0,65 / 14,0%, assorbimento 60% | 268, 271, 272, 273 | Molino Quaglia (Petra), s.d., «Petra 3»: tipo 1 macinata a pietra, protidi 13,0–14,0%, assorbimento «fino a 85%». **W e P/L non dichiarati**: «l'elevato contenuto di fibra non consente di ottenere dei risultati significativi» all'alveografo | **errato** (W, P/L, assorbimento) | Il produttore dice che W e P/L non si misurano, quindi 340 e 0,65 non hanno base. **Ipotesi:** il nome unisce due prodotti, «Petra 3» ed «Evolutiva». |
| `5stagioni_rossa` | 300 / 0,60 / 13,0%, assorbimento 57%, FN 300, stabilità 13 | 98, 101–106 | Agugiaro & Figna 2025, «Pizza Napoletana» (rossa): tipo 00, proteine 13% (s.s.), Hagberg 280″, assorbimento 57%, stabilità 13′. Estensografo: energia 120, rapporto 1,7. **W e P/L non indicati sulla pagina** | assorbimento e stabilità **verificati**. Proteine **plausibile** (la scheda le dà sulla sostanza secca). FN **errato** (280, non 300). W e P/L **da verificare** | La pagina rimanda a una «scheda tecnica» scaricabile che non ho aperto. |
| `5stagioni_5lune` | 350 / 0,60 / 14,5% | 289, 292, 293 | Nel catalogo del produttore (le5stagioni.com, 24/10/2026) non c'è nessun prodotto «Le 5 Lune» | **da verificare** | Il prodotto potrebbe non esistere, o non esistere più. |
| `dallagiovanna_manitoba_oro` | 390 / 0,60 / 15,0% | 119, 122, 123 | Sito Dallagiovanna non leggibile (Wix). Non ho trovato una «Manitoba Oro» Dallagiovanna. Caputo vende una «Manitoba Oro»: tipo 0, W 360/380, P/L 0,45/0,55, proteine 14% (Mulino Caputo 2025) | **da verificare** | **Ipotesi:** confusione con la Manitoba Oro di Caputo. |

### 2.2 `FLOUR_W_RANGES` (`pizza-engine.ts:1350–1366`)

È una seconda tabella di W, usata per la dispensa e per scegliere la farina in
automatico. Su quattro farine contraddice sia le schede sia `flour-database.ts`.

| Chiave | Codice | Riga | Scheda | Stato | Proposta |
|---|---|---|---|---|---|
| `caputo_pizzeria_blu` | 240–280 | 1358 | W 260/280 | **errato** | `[260, 280]` |
| `caputo_nuvola` | 240–280 | 1359 | W 270/290 | **errato** | `[270, 290]` |
| `caputo_cuoco` | 300–340 | 1360 | W 300/320 | **errato** | `[300, 320]` |
| `petra_5037` | 340–380 | 1361 | W 300–340 | **errato** | `[300, 340]` |
| `petra_3_evolutiva` | 320–360 | 1362 | W non dichiarato | **errato** | Togliere, oppure segnare come «non misurabile». |
| `5stagioni_rossa` | 260–300 | 1363 | non indicato | da verificare | |
| `5stagioni_5lune` | 330–370 | 1364 | prodotto non trovato | da verificare | |
| `dallagiovanna_manitoba` | 360–400 | 1365 | non trovato | da verificare | |
| `00`, `0`, `manitoba`, `integrale`, `semola` | 170–220, 220–260, 340–380, 200–260, 220–280 | 1352–1356 | Categorie generiche, non c'è un produttore | da verificare | |

**Tipo e forza (audit del 28/10/2026, S05-A-04).** In Italia 00, 0, 1, 2 e
integrale indicano il grado di abburattamento (ceneri), non la forza: una 00 da
pizza può avere W 260–280 (Mulino Caputo 2025, «Pizzeria») e l'AVPN ammette 00 e
0 con W 250–320 (AVPN 2024). Le W per tipo sono quindi **stime** del modello.
Dal 28/10/2026 (FW-01) la dispensa non mostra più la W sulle chip generiche (00,
0, 1, integrale, semola) e dice che il tipo indica la raffinazione; la W compare
solo se l'utente la dichiara. Il motore continua a usare `FLOUR_W_RANGES` per le
farine non dichiarate (nota `flour-w-by-grade` del registro). La norma citata
dall'audit (D.P.R. 187/2001) va riletta prima di citarla come verificata.

Nota sul codice, non sui dati: due chiavi di `FLOUR_W_RANGES` (`caputo_pizzeria_blu`,
`dallagiovanna_manitoba`) non coincidono con gli `id` di `flour-database.ts`
(`caputo_pizzeria`, `dallagiovanna_manitoba_oro`). Non ho controllato da dove vengono
gli id della dispensa: va visto se la ricerca `FLOUR_W_RANGES[id]` trova queste farine.

---

## 3. Forni e attrezzatura

### 3.1 `OVEN_PRESETS` (`pizza-engine.ts`, costante `OVEN_PRESETS`, righe 3419–3455)

| Tipo | maxTemp | Riga | Fonte | Stato | Nota |
|---|---|---|---|---|---|
| `home` (forno domestico) | 250 °C | 3428 | PinsaRomana.it 2022: «il forno di casa arriva di solito a una temperatura massima di 250°C» (fonte di cucina, non tecnica) | **plausibile** | Manca una fonte tecnica (norma o dati dei produttori). |
| `electric_standard` | 300 °C | 3434 | Nessuna fonte | **da verificare** | |
| `gas` («Forno a gas a platea», dal 24/10) | 350 °C | `OVEN_PRESETS` | Nessuna fonte | **da verificare** | D-021: separato dal forno a gas da pizza. Serve la scheda di un forno a gas a platea per pizzeria. |
| `gas_pizza` («Forno a gas da pizza», dal 24/10) | 500 °C | `OVEN_PRESETS` | Ooni 2026: il Koda 16 «può raggiungere i 500 °C» | **verificato** (per i portatili) | D-021. |
| `electric_high` | 450 °C | 3446 | Pagina ufficiale Effeuno P134H senza dati di temperatura | **da verificare** | |
| `wood` | 500 °C | 3452 | UE 2010: platea circa 485 °C. AVPN 2024: cupola circa 485 °C | **plausibile** | |
| `coal` | 400 °C | `OVEN_PRESETS` | Valore iniziale dal range di lavoro del modello Apizza (commento nel codice) | **da verificare** | Non è un massimo dei forni a carbone. Dal 28/10/2026 (FW-01) i forni generici mostrano «fino a ~» invece di «Max»: sono valori tipici, da correggere con quello del proprio forno. |

### 3.2 Superfici di cottura (`equipment-data.ts`, `SURFACE_OPTIONS`, righe 103–163)

| Superficie | Conducibilità nel codice (W/m·K) | Riga | Fonte | Stato |
|---|---|---|---|---|
| `aluminum_pan` | 200 | 134 | Engineering ToolBox: alluminio puro 236 (0 °C), leghe 150–190 | **plausibile** (sta tra puro e leghe) |
| `steel_plate`, `blue_steel_pan` | 50 | 125, 143 | Engineering ToolBox: acciaio al carbonio 0,5% C: 54. Acciaio al carbonio battuto: 59 | **plausibile** |
| `cast_iron` | 52 | 152 | Engineering ToolBox: ghisa 52 (20 °C) | **verificato** |
| `cordierite_stone` | 1,5 | 116 | Nessuna fonte | **da verificare** |
| `refractory_brick` | 1,0 | 107 | Nessuna fonte | **da verificare** |
| `oven_rack` (griglia) | 0 | 161 | — | **errato** come conducibilità: la griglia non ha una superficie di contatto. Dal 28/10/2026 (FW-01) l'interfaccia mostra «nessun contatto» invece di «k=0», e le altre superfici con l'unità W/(m·K) |

### 3.3 Impastatrici (`MIXER_OPTIONS`, righe 22–64)

`frictionK` (22, 18, 12, 8) e `frictionDegMin` (0,4–0,1 °C/min): **da verificare**.
Non ho trovato fonti. Sono i dati più adatti a una sostituzione con quelli di un partner,
cioè un produttore di impastatrici.

---

## 4. Modello del lievito (`pizza-engine.ts`)

### 4.1 Valori nel codice

| Dato | Valore | Dove | Fonte | Stato |
|---|---|---|---|---|
| Q10 lievito commerciale, sopra 10 °C | 2,0 | `getQ10`, riga 649 | Salvadó et al. 2011 (sotto) | **plausibile** tra 18 e 25 °C. **errato** come crescita tra 10 e 18 °C |
| Q10 lievito commerciale, sotto 10 °C | 1,6 | `getQ10`, riga 647 | Nessuna fonte. Per la crescita, Salvadó et al. 2011 indica il contrario | **da verificare** come produzione di gas. **errato** come crescita |
| Commento «Q10 = 2,1 ± 0,3 (15–30 °C), scende a 1,6 sotto 10 °C» | — | riga 620 | Nessuna fonte | **da verificare**. La parte «scende» è contraddetta per la crescita |
| Q10 lievito madre | 2,2 sopra 15 °C, 1,9 sotto | `getQ10`, riga 638 | Nessuna fonte | **da verificare** |
| Dose di riferimento | 0,1% di lievito fresco, 24 h, 18 °C | `YEAST_REFERENCE_PCT`/`_HOURS`, righe 507–508 | AVPN 2024; UE 2010 (sotto) | **plausibile** |
| Esponente del tempo | 0,7 | `YEAST_TIME_EXPONENT`, riga 509 | Nessuna fonte | **da verificare** |
| Secco = 1/3 del fresco | 0,33 | `YEAST_DRY_RATIO`, riga 510 | AVPN 2024: «Dry yeast … in the proportion of 1/3», «1 g dry yeast equals 3g of fresh» | **verificato** |
| Riferimento «Caputo standard» nel commento | — | `calculateYeastPercentage`, riga 1368 e seguenti | Nessuna tabella Caputo trovata | **da verificare** |

### 4.2 Che cosa dicono le fonti sulla temperatura

**Fatto (Salvadó et al. 2011).** Lo studio misura il tasso massimo di crescita (μmax)
di 10 ceppi di *S. cerevisiae* tra 4 e 46 °C, con misure a 4, 8, 10 e 14 °C. I dati sono
interpolati con il modello a temperature cardinali di Rosso (CTMI). Per *S. cerevisiae*
riporta Tmin 0,4–5,0 °C, Topt 30,0–34,8 °C e Tmax 42,0–46,1 °C (tabella 2, valori per ceppo).

**Fatto (Baranyi et al. 2017).** I due modelli più usati per crescita e temperatura,
Ratkowsky e Rosso, sotto l'ottimo hanno √μ quasi lineare in (T − Tmin). Ne segue che il
Q10 non è costante: **cresce** man mano che T si avvicina a Tmin.

**Lettura (conto mio).** Ho messo nel CTMI i parametri dei 10 ceppi e ho calcolato la
velocità relativa a 18 °C. Nella tabella c'è il confronto con `fermentationSpeedRatio`:

| T | Motore (Q10 2,0 / 1,6) | CTMI, 10 ceppi (min–max) |
|---|---|---|
| 4 °C | 0,43 | 0,00–0,05 |
| 10 °C | 0,57 | 0,19–0,35 |
| 14 °C | 0,76 | 0,53–0,65 |
| 18 °C | 1,00 | 1,00 |
| 22 °C | 1,32 | 1,35–1,59 |
| 25 °C | 1,63 | 1,56–2,07 |

- Q10 equivalente del CTMI tra 18 e 25 °C: 1,9–2,1 in 9 ceppi su 10, 2,8 nell'altro. **Il Q10 = 2,0 sopra i 18 °C è coerente.**
- Tra 10 e 20 °C: Q10 da 3,4 a 6,6. Sotto i 10 °C la crescita quasi si ferma. **Un Q10 più basso al freddo (1,6) va nella direzione opposta ai modelli di crescita.**

**Limite di questa lettura.** μmax è crescita in coltura liquida, non produzione di CO₂
nell'impasto. In un impasto in frigo il lievito produce gas anche senza crescere: un
brevetto Gist-Brocades dice che il lievito da panificazione «still some sugar into CO₂
even at a storage temperature of 4°C» (Gist-Brocades 1993). Ma non dà numeri. Con il
CTMI preso alla lettera, a 4 °C servirebbe più del 2% di lievito per 24 h: non è ciò che
si fa in pratica. Quindi la crescita **non** basta a fissare il Q10 del gas sotto i 10 °C.
Non ho trovato uno studio con la produzione di gas nell'impasto tra 4 e 20 °C.

**Confronto con le dosi dei disciplinari** (conto mio con `calculateYeastPercentage`,
senza le altre correzioni del motore):

| Caso | Fonte | Dose della fonte | Dose del motore | Lettura |
|---|---|---|---|---|
| STG: 6–8 h a 25 °C | UE 2010: 3 g di lievito per 1800 g di farina | 0,17% fresco | 0,13–0,16% | coerente (scarto ≤ 20%) |
| AVPN: 12–24 h, cella a 18–20 °C | AVPN 2024: 0,1–3 g per 1,6–1,8 kg | 0,006–0,19% fresco | 0,09–0,14% | dentro il range |
| Pinsa OPR: 24–96 h a 4 °C, impasto finito a 21–24 °C | OPR 2020: lievito secco 2–6 g per 1,25–1,4 kg | 0,14–0,48% secco | 0,03–0,08% secco (a 4 °C costanti) | il motore ne dà **da 2 a 17 volte meno** |

**Ipotesi.** Il caso della pinsa fa pensare che il motore sovrastimi l'attività a 4 °C,
cioè che il Q10 vero al freddo sia più alto di 1,6, come dicono i modelli di crescita.
Però l'impasto della pinsa entra in frigo a 21–24 °C, si raffredda piano, e la dose OPR
cambia con la stagione. Non basta per fissare un numero.

**Conclusione per il modello.**
1. Q10 = 2,0 tra 18 e 25 °C: **plausibile**, con fonte (Salvadó et al. 2011).
2. Q10 = 2,0 tra 10 e 18 °C e 1,6 sotto i 10 °C: **non ci sono fonti**. Per la crescita le fonti li contraddicono. La dose della pinsa OPR va nella stessa direzione.
3. La dose di riferimento (0,1% a 24 h e 18 °C) e il rapporto secco/fresco sono coerenti con UE 2010 e AVPN 2024.
4. In UI il Q10 sotto i 18 °C deve restare una **stima**, come già scritto nel codice. Per chiudere servono misure di gas nell'impasto (risografo o fermentometro) a 4, 8, 12 e 18 °C: è un buon lavoro per un mulino o un produttore di lievito partner.

## 4bis. Pizza al metro, teglia, tonda, New York, Detroit (24/10/2026)

Tabelle complete, con fonte e stato per ogni dato, in
`docs/ricerca/stili-fonti-2026-10-24.md`. Applicato con le decisioni D-028…D-031:

| Stile | Dato | Prima | Ora | Fonte | Stato |
|---|---|---|---|---|---|
| `pizza_al_metro` | Lunghezza, panetto | 70 cm, 700 g | 100 cm, 1000 g (peso: stima proporzionale) | Fucito 2017; menù Gigino 2026 | verificato (lunghezza), plausibile (peso) |
| `pizza_al_metro` | Forno | elettrico | a legna, avviso | Fucito 2017; Scatti di Gusto 2017 | verificato |
| `pizza_al_metro` | Lievitazione | 12–36 h | 6–12 h | Fucito 2017 (6 h; l'estremo alto è una scelta) | plausibile |
| `pizza_al_metro` | Porzioni | 4–6 | 4–5 | menù Gigino 2026 | verificato |
| `teglia_romana` | W, panetto | 280–320, 800 g | 300–380, 600 g | Confraternita 2016 (APITER) | verificato |
| `teglia_romana` | Forno, cottura | 260–300 °C, 13–18 min | 250–320 (ideale 310), 8–15 min | Confraternita 2016; Alfè 2020; Trezzi 2020 | verificato (pizzeria), plausibile (casa) |
| `tonda_romana` | Idratazione | 50–55% | 55–60% | Valdes 2012; Magenis 2020 | verificato |
| `tonda_romana` | Forno, cottura | 300–340 °C, 5–8 min | 300–400 (ideale 380), 90–200 s | Magenis 2020; Valdes 2012; Pagano 2017 | verificato (ideale), scelta (minimo 300) |
| `detroit` | Zucchero, lievitazione | 0,5%, 18–48 h | 0, 8–24 h | King Arthur s.d.; Our Place s.d. | plausibile (fonti per il forno di casa) |
| `new_york` | Caratteristica «cottura» | 12–15 min | 9–12 min (come il codice) | coerenza interna | — |

## 5. Ispirazioni e ricette iconiche (`interpretation-library.ts`, `signature-recipes.ts`)

Verifica del 24/10/2026: 126 affermazioni sulle 14 ispirazioni, di cui 40
verificate, 34 plausibili, 31 da verificare e 21 errate. Tabelle, fonti e testi
proposti in `docs/ricerca/ispirazioni-fact-check-2026-10-24.md`. I testi
dell'app sono stati riscritti su quelle fonti: restano solo i fatti con una
fonte, e i numeri senza fonte sono stati tolti.

| Voce | Stato dopo la correzione | Cosa è cambiato | Fonti principali |
|---|---|---|---|
| `avpn_disciplinare` | verificato | La STG è una denominazione UE chiesta da AVPN e Associazione Pizzaiuoli Napoletani, non un marchio AVPN; il forno a legna è obbligatorio per la STG, l'AVPN ammette gas ed elettrico in deroga | UE 2010; AVPN 2024 |
| `igp_recco` | verificato | Nessuna correzione di sostanza; nome esatto del consorzio da verificare | UE 2015; CCIAA Genova 2024 |
| `apiter_teglia` | plausibile | Disciplinare della community La Confraternita della Pizza, circa 2016, per l'alta idratazione (D-025) | Trattoria da Martina 2017 (il thread originale dava 503) |
| `bonci_pizzarium` | verificato | Tolti numeri senza fonte | Eating the World 2011; Scatti di Gusto |
| `pepe_caiazzo` | verificato | La Margherita Sbagliata va in forno con la mozzarella: pomodoro e basilico dopo; ingredienti dell'Alto Casertano | Dissapore; Gazzetta del Gusto 2018 |
| `martucci_caserta` | plausibile | Impasto diretto, 24 h a temperatura ambiente, farina 0 poco proteica (D-026); W 320 e biga tolte | Dissapore 2017; 50 Top Pizza 2020 |
| `sorbillo_napoli` | verificato | Dal 1935, via dei Tribunali 32 | Sky TG24 2019 |
| `bosco_aria_di_pane` | plausibile | Saporè dal 2009; idratazione circa 80% (D-026) | Veneto Around Me; RSI |
| `capuano_napoli` | plausibile | Le forbici tagliano la pizza al tavolo; tolta la cifra «95% vs 70%»; anno 2018 da verificare | Dissapore 2023; menu Capuano 2024 |
| `bianco_phoenix` | verificato | Circa 18 h di lievitazione (era 120 h); James Beard 2003 e 2022, non tre | Wikipedia; PizzaMaking.com 2013 |
| `forkish_portland` | verificato | Schema degli impasti come nel libro | James Beard Foundation; WPR |
| `da_michele_napoli` | verificato | Oggi quattro pizze; in via Sersale dal 1930 (il 1870 è contestato: Dissapore cita il 1863) | damichele.net 2026; Scatti di Gusto 2017; Smithsonian 2010 |
| `malati_di_pizza` | errato | Tolta (D-024): è una scuola, non un forum; ricetta senza fonte | malatidipizza.com |
| `confraternita_pinsa` | errato | Tolta (D-024): nessuna fonte sul ruolo del forum; mix non pubblico | §1.2 |
| `benedetta_rossi` | verificato | Nuova (tranche B2, 30/10/2026), tipo `autore`: dosi della pagina ufficiale convertite da Vulcan (D-066), lievito della fonte e «luogo caldo» (D-068); riferimento provvisorio di `teglia_in_giornata` | fattoincasadabenedetta.it, «Pizza in teglia» (letta col browser di Matteo il 30/10/2026); Paneangeli, scheda del lievito Mastro Fornaio (bustina da 7 g) |
| `adriano_continisio` | verificato | Nuova (tranche B3, 31/10/2026), tipo `autore`: grammi della fonte per 3 teglie 30×35 (900/720/45/18/4,5 g di fresco), preimpasto 3 h a 20 °C con metà della farina, raddoppio a 28 °C nei contenitori, teglie non unte, 250 °C per 10 + 4–5 minuti; puntata 6 h a 22 °C e appretto 1 h 30 sono stime di Vulcan dichiarate; malto facoltativo non usato; dosi del condimento di Vulcan | Adriano Continisio, «La pizza in teglia croccante», Profumo di lievito, 26/11/2009 (blog con licenza Creative Commons, riletto il 31/10/2026) |

**Legami con gli stili (FW-14, decisione B del 28/10/2026).** `pepe_caiazzo` e
`capuano_napoli` hanno base `napoletana_canotto` e non sono più compatibili con
`napoletana_stg`: una versione canotto offerta sulla STG contraddiceva il
disciplinare citato dalla scheda (S07-A-01). `bianco_phoenix` resta con base
STG: è dichiarato «Ispirata a…» e la base è una scelta difendibile (forno a
legna, impasto diretto), anche se le sue circa 18 h superano le 6–14 h della
STG e oggi la scheda lo segnala come non fattibile. Misure: le ricette
canoniche e la classifica di `recommendStyles` per P1 (forno di casa 250 °C) e
P3 (elettrico 509 °C) non cambiano; `recipe-preset.test` e
`mcp-kitchen-parity.test` restano verdi.

Le 12 ricette iconiche non avevano un fact-check proprio: le descrizioni sono
state riscritte togliendo ciò che contraddiceva le fonti già raccolte (cottura
«90 s a 450 °C» → 60–90 s del disciplinare; «DOC» usato per un piatto;
pistacchio «di Bronte» e mortadella detta male; lo «Sfincione bianco» che non è
quello di Bagheria; la Cacio e pepe legata a Franco Pepe senza una fonte, ora
senza ispirazione). Restano **plausibili**: sono descrizioni di piatti comuni,
non affermazioni su persone.

### 5.1 Riferimento di ogni stile (FW-14, D-B, 28/10/2026)

Il «Riferimento» di uno stile è scritto nei dati (`STYLE_REFERENCES` in
`src/app/data/style-versions.ts`), non più dedotto dalla versione più difficile.
Dove c'è un disciplinare è lui; per gli altri stili la regola precedente resta
**provvisoria, da confermare da Matteo stile per stile**, con un vincolo nuovo
(test in `recipe-entry.test.ts`): idratazione, W e ore del riferimento cadono
negli intervalli che la scheda dello stile mostra. Gli stili senza versioni
usano il centro degli intervalli, come prima.

| Stile | Riferimento | Base | Prima | Perché è cambiato |
|---|---|---|---|---|
| `napoletana_stg` | `avpn_disciplinare` | disciplinare | uguale | — |
| `focaccia_recco` | `igp_recco` | disciplinare | uguale | — |
| `teglia_romana` | `apiter_teglia` (80 %, W 320, 36 h) | disciplinare | `teglia_alta` (88 %, 48 h) | 88 % fuori dalla forbice 75–85 %; c'è il disciplinare APITER |
| `napoletana_canotto` | `canotto_martucci` (72 %, 48 h) | da confermare | `canotto_estremo` (78 %, 72 h) | 78 % fuori da 65–75 % |
| `chicago_deep` | `chicago_tradizionale` (52 %, 18 h) | da confermare | `chicago_pro` (54 %) | 54 % fuori da 48–52 % |
| `sfincione` | `sfincione_casalingo` (67 %, W 270, 8 h) | da confermare | `sfincione_tradizionale` (W 290) | W 290 fuori da 240–280 |
| `pizza_spaccata` | `spaccata_tradizionale` (80 %, 24 h) | da confermare | `spaccata_bonci` (85 %) | 85 % fuori da 72–80 % |
| `focaccia_genovese` | centro degli intervalli (59 %, W 260, 12 h) | da confermare | `focaccia_moderna` (70 %, W 240) | nessuna versione cade negli intervalli dello stile (55–62 %): o si correggono le versioni o gli intervalli |
| `padellino_torino` | centro degli intervalli (63 %, W 240, 33 h) | da confermare | `padellino_torinese` (72 %, W 300) | come sopra (60–65 %, W 220–260) |
| `tonda_romana`, `pinsa_romana`, `new_york`, `detroit`, `pala_romana`, `grandma_style`, `pizza_baciata`, `trancio_milanese`, `chicago_tavern` | versione già scelta prima | da confermare | uguale | — |
| `teglia_in_giornata` | `benedetta_rossi` (80 %, W 280, 2 h a 26 °C, dose di lievito della fonte) | fonte, provvisorio (decisione 3 di Matteo, 30/10/2026) | — (stile nuovo, B2) | — |

Effetto sulle ricette canoniche (P1 forno di casa 250 °C; P3 elettrico 509 °C):
cambiano solo gli stili della tabella sopra marcati come cambiati (voto P1/P3
prima → dopo: canotto 37/97 → 37/94, teglia 89/93 → 87/91, chicago 88 → 87,
genovese 85 → 90, padellino 91 → 90, spaccata 39/93 → 39/89). La classifica di
`recommendStyles` per P1 e P3 non cambia: usa le ricette su misura.

---

## 6. Indici del modello, prefermenti, problemi e glossario (audit del 28/10/2026)

Affermazioni che l'audit UX/scienza ha trovato senza fonte o mostrate come fatti.
Ognuna ha una nota nel registro (colonna «Nota»); qui lo stato e cosa è cambiato.

| Dato | Codice | Nota del registro | Stato | Cosa è cambiato (FW-01) |
|---|---|---|---|---|
| Attività dell'acqua: 0,96 + (H − 55) × 0,0005 − sale × 0,006 − zucchero × 0,004 | `ScientificLayer.water_activity` | `water-activity` | **da verificare** (coefficienti senza fonte) | Mostrata con 2 decimali, non 3, e dichiarata stima |
| Fattore di velocità Q10 sotto i 18 °C | `fermentationSpeedRatio` | `q10-fermentation` | vedi §4 | Mostrato con 1 decimale |
| Rete glutinica, proteolisi, amido degradato | `ScientificLayer` | `dough-indices` | **da verificare** (indici del modello) | Statuto «scelta di Vulcan» |
| P/L stimato dalla W: 0,30 + (W − 150) × 0,0015 | `estimatePL` | `flour-pl-estimate` | **da verificare** | Nessuno: va detto in UI quando è stimato |
| Energia di cottura: 2, 3 o 8 kW secondo la temperatura | `baking_energy_kj` | `baking-energy` | **da verificare** (8 kW anche per un elettrico da ~2 kW) | Statuto «ipotesi» |
| Lievito madre: 15/18/20 % secondo le ore; farina e acqua della madre fuori dall'idratazione | `generateRecipe` | `sourdough-starter-dose` | **da verificare** | Nessuno (cambio del motore da misurare) |
| Biga: tutto il lievito nella biga, circa 0,2 % sulla sua farina per 16 h | `computePreFermentSplit` | `pre-ferment` | **da verificare** contro la ricerca prefermenti (1 % a 18–20 °C) | Nessuno |
| Appretto al 40 % delle ore quando lo stile non lo dichiara | `fermentationPhases` | `proof-split` | **da verificare**: contraddice `parametric-databases` (teglia 2–4 h) | Statuto «ipotesi» |
| Preriscaldo del forno di casa: 30 min sotto i 300 °C | `generateTimeline` | `bake-time-home-preheat` | **da verificare**: per la pietra domestica si citano spesso 45–60 min, senza fonte letta | Statuto «ipotesi» |
| Forno della STG fino a 500 °C | `styles-db` | `stg-oven-temp` | **plausibile** il 485, **da verificare** il 500 (vedi §1.1) | Nota con le due superfici (platea UE, cupola AVPN) |
| New York: minimo 270 °C | `styles-db` | `style-min-oven-temp` | **da verificare** | Nessuno; le ricette domestiche di riferimento citano 260–290 °C |
| W della STG 250–320 (AVPN) invece di 220–380 (UE) | `styles-db` | `stg-flour-w` | **verificato** (scelta) | Statuto «scelta di Vulcan» con le due fonti |
| Tacche del sale: valore ± 0,3 | `recipe-configurator` | `salt-range` | **scelta di Vulcan** senza fonte; la STG ha 2,8–3,1 % (§1.1) | Statuto dichiarato |
| Thickness factor «metrica originale del progetto» | glossario | `thickness-factor` | **errato**: è una metrica dei calcolatori nordamericani, in oz/in² (1 oz/in² ≈ 4,39 g/cm²) | Testo corretto in 7 lingue; tolta la «densità calorica». Fonte (Lehmann, PMQ) **da rileggere** |
| Prefermenti: poolish «leopard spotting marcato», biga «alveolatura fine», righe alveolatura e complessità | guida prefermenti | `pre-ferment` | **errato** (le macchie dipendono dal forno) e **da verificare** (stato D nella ricerca) | Tolte le due righe; crosta riscritta; estensibilità marcata «stima» o «da verificare»; autolisi con l'acqua della ricetta; origini in un solo formato (poolish: Polonia, poi Francia) |
| Canotto: «Digeribilità alta» | `styles-db` `key_characteristics` | `digestibility` | **affermazione sulla salute**, vietata al livello 1 | Sostituita con «Mollica aperta e leggera» in 7 lingue, con test di guardia |
| Forni della demo con fonte «P» | `editions/demo-forno.json` | `oven-max-temp` | **errato**: dati inventati | `source: "demo"` obbligatorio per un marchio inventato (`edition.ts`) |
| Soglie dei problemi (idratazione > 70 %, P/L > 0,8, > 500 °C…) | `troubleshooting-data.ts` («Notion pagina 11») | `troubleshooting-thresholds` | **da verificare** | Nessuno: soglie relative allo stile in FW-05 |
| Focaccia genovese: fossette e salamoia prima di tutto l'appretto | `topping-library` (`insert_at: before_proof`) | — | **plausibile** come ordine, **da verificare** la durata (§1.6) | Nessuno: servono una fonte scritta con autore prima di dividere l'appretto |

### Lista di verifica (decisione D-F)

I valori «da verificare» restano nel motore ma non compaiono al livello 1 come
fatti: nel «Perché?» hanno lo statuto «stima» o «ipotesi». Da chiudere, in ordine
di impatto:

1. Coefficienti dell'Aw, degli indici del modello e del P/L stimato: fonte o rimozione dalla griglia «Scienza».
2. Lievito madre: idratazione della madre e dose per ore e temperatura.
3. Dose di lievito della biga rispetto alla sua farina (ricerca prefermenti: 1 % per 16 h a 18–20 °C).
4. Appretto quando lo stile non lo dichiara (teglia: 2–4 h a 22 °C nei dati dell'app).
5. Preriscaldo della pietra nel forno di casa.
6. Temperature minime degli stili senza disciplinare (New York 270 °C per primo).
7. Soglie di Problemi e soluzioni.
8. Thickness factor (Lehmann, PMQ) e formula alveografica W = 6,54 × S (norma ISO): rileggere le fonti prima di scriverle in app.
9. D.P.R. 187/2001 per la definizione dei tipi di farina.
10. Focaccia genovese: fonte scritta sull'ordine fra ditatura, salamoia e lievitazione finale.

### Piano temporale (FW-19, 29/10/2026)

Parametri del piano che l'app usa per gli orari del Procedimento e della
modalità cottura (`src/app/use-cases/cook-plan.ts`, `pizza-engine.ts`).
Nessuno ha una fonte letta: sono dichiarati nel registro con il loro statuto.

| Dato | Codice | Nota del registro | Stato | Cosa è cambiato (FW-19) |
|---|---|---|---|---|
| Recupero del forno fra due cotture in serie: 5 min forno di casa, elettrico e gas a platea; 2 min elettrico ad alta temperatura e gas da pizza; 30 s legna e carbone | `BAKE_ROUND_RECOVERY_SEC` | `bake-round-recovery` | **da verificare** (ipotesi, nessuna misura) | Prima il recupero non c'era: 4 cotture nel forno di casa finivano 15 min prima del vero. Ora è sommato fra un giro e l'altro e dichiarato nel passo e nel banner del modello |
| Margini della Timeline comoda: frigo +50 % (max 6 h) / −25 % (max 4 h); ambiente e appretto +30 % (max 2 h) / −20 % (max 90 min) | `COMFORT_TOLERANCES` | `comfort-tolerances` | **scelta di Vulcan** senza fonte | Prima l'appretto a 18 °C usava i margini del frigo e la Timeline comoda poteva spostare 4 h dal frigo all'appretto. Ora (D-Q) ogni attesa usa i margini della sua temperatura, nessuno scambio frigo ↔ ambiente, lievito invariato e detto in pagina |
| Pieghe: numero × intervallo da `FOLDING_DB`, a temperatura ambiente prima della puntata in frigo | `stylePlanFolds`, `foldWindowMinutes` | `equivalent-hours`, `yeast-dose` | numero e intervallo **da verificare** (dati di `parametric-databases`, senza fonte scritta) | Prima i testi dicevano «ogni ~30 min» e «ogni 45 minuti» e la puntata andava subito in frigo. Ora le pieghe sono un passo; con la puntata in frigo contano come ore a 18 °C nel lievito |
| Finestra notturna 23–7 | `NIGHT_WINDOW` | — | **scelta di Vulcan** | Prima 22–7 per l'orario proposto e 23–7 per l'avviso |

## Valori da correggere

Sono proposte: la decisione spetta a Matteo. Per la pinsa vale D-013.

| # | Dove | Ora | Proposta | Fonte |
|---|---|---|---|---|
| 1 | `styles-db.ts:283–284` pinsa forno | 350–420, ideale 380 | 280–320, ideale 300 | PinsaRomana.it 2022 (300/310 °C) |
| 2 | `styles-db.ts:260` pinsa idratazione | 75–85 | 72–80 | OPR 2020 |
| 3 | `styles-db.ts:261–262` pinsa sale e olio | 2,5% / 1,0% | 1,8% / 1,3% | OPR 2020 |
| 4 | `styles-db.ts:276–279` pinsa panetto e misure | 280 g, 35 × 25 | 240 g, 34 × 21 | OPR 2020 |
| 5 | `styles-db.ts:661–663` Recco forno e tempo | 300–340 °C, 480–600 s | 270–320 °C (ideale 300), 240–480 s | CCIAA Genova 2024 |
| 6 | `styles-db.ts:644` Recco, commento sull'idratazione | «disciplinare IGP 45–50%» | togliere l'attribuzione: il disciplinare non indica l'idratazione | CCIAA Genova 2024 |
| 7 | `styles-db.ts:76` napoletana fermentazione | 8–24 h | 12–24 (AVPN) oppure 6–14 (STG): da decidere | AVPN 2024, UE 2010 |
| 8 | `styles-db.ts:81` napoletana panetto | 270 g | 250 g se lo stile segue la STG; 270–280 se segue l'AVPN | UE 2010, AVPN 2024 |
| 9 | `styles-db.ts:1090–1091`, `:1140–1141` olio di frittura | 180–190, ideale 185 | 175–190, ideale 175 | AVPN 2024 |
| 10 | `pizza-engine.ts` `FLOUR_W_RANGES` (Caputo Pizzeria, Nuvola, Saccorosso, Petra 5037) | vedi §2.2 | 260–280, 270–290, 300–320, 300–340 | Mulino Caputo 2024–2025, Molino Quaglia s.d. |
| 11 | `flour-database.ts:268–273` Petra 3 | W 340, P/L 0,65, assorbimento 60% | W e P/L «non dichiarati», assorbimento fino all'85% | Molino Quaglia s.d. |
| 12 | `flour-database.ts:105` 5 Stagioni Napoletana Rossa, FN | 300 | 280 | Agugiaro & Figna 2025 |
| 13 | `pizza-engine.ts:620` commento sul Q10 | «Letteratura: … scende a 1.6 sotto 10°C» | togliere «Letteratura» e scrivere che 1,6 è una scelta del modello senza fonte | §4 |

## Fonti mancanti

- **Pinsa:** temperatura e tempo di cottura in un testo dell'associazione OPR o di Di Marco. La scheda PAT Lazio 2025, se esiste.
- **Lievito:** dati misurati di produzione di gas nell'impasto tra 4 e 20 °C (Q10 del gas, non della crescita). Q10 della madre (LAB e lieviti). Esponente del tempo 0,7.
- **Stili senza disciplinare:** teglia, tonda e pala romana, canotto, New York, Detroit, Chicago (deep e tavern), focaccia genovese (testo del marchio collettivo o del presidio Slow Food), sfincione, padellino, baciata, ciaccino, spaccata, trancio, barese, al metro, fugazzeta, California, greek pan, fritta e montanara (impasto). Servono fonti scritte con un autore, non i commenti del codice.
- **Farine:** scheda tecnica PDF della 5 Stagioni Napoletana Rossa (W e P/L). Esistenza di «Le 5 Lune». Scheda Dallagiovanna, o conferma che si tratta della Manitoba Oro Caputo. Per tutte le farine di marca: assorbimento, falling number, stabilità e prezzo (oggi copiati da Notion, senza fonte).
- **Forni:** temperatura massima di forno domestico, elettrico standard, elettrico ad alta temperatura e gas professionale, da schede di produttori o norme. Conducibilità di cordierite e refrattario.
- **Impastatrici:** coefficienti di attrito.

---

## Riferimenti

Data d'accesso per tutte: **24/10/2026**.

- **UE 2010.** Regolamento (UE) n. 97/2010 della Commissione, del 4 febbraio 2010, che iscrive la denominazione «Pizza Napoletana» (STG). GU UE L 34 del 5/2/2010, pp. 7–16. Letto nella copia spagnola della GU distribuita dal BOE: https://www.boe.es/doue/2010/034/L00007-00016.pdf. Su EUR-Lex: https://eur-lex.europa.eu/eli/reg/2010/97/oj (non raggiungibile dal mio ambiente).
- **AVPN 2024.** Associazione Verace Pizza Napoletana, *International Regulations for obtaining use of the collective trade mark «Verace Pizza Napoletana» (Il Disciplinare)*, versione inglese, PDF del 21/02/2024. https://www.pizzanapoletana.org/public/pdf/Disciplinare-2024-ENG.pdf
- **OPR 2020.** Associazione Originale Pinsa Romana, *Regolamento e Protocollo*, §2.2 «Protocollo da rispettare». PDF datato 05/03/2020, caricato nel 2022. https://www.pinsaromana.org/wp-content/uploads/2022/10/Regolamento-e-Protocollo.pdf
- **PinsaRomana.it 2022.** «Come fare la Pinsa Romana: metodo originale con Marco Montuori», PinsaRomana.it (sito che si presenta come «gli inventori della Pinsa Romana»), © 2022. https://pinsaromana.it/ricetta/come-fare-la-pinsa-romana-metodo-originale-con-marco-montuori/
- **Di Marco 2026.** Di Marco Corrado srl, pagine «Cuocila!» e «La Pinsa: cos'è» (© 2026). https://www.pinsadimarco.com/cuocila/ — https://www.pinsadimarco.com/la-pinsa-cose/
- **PinsaRomana.info, s.d.** «Pinsa Romana: informazioni» (sito di settore, testi di L. Bucciarelli; cita il PAT 2025). https://www.pinsaromana.info/pinsa-romana-informazioni/
- **UE 2015.** Regolamento di esecuzione (UE) 2015/39 della Commissione, del 13 gennaio 2015, che iscrive «Focaccia di Recco col formaggio» (IGP). GU UE L 8 del 14/1/2015, p. 7. Copia della GU nel BOE: https://www.boe.es/doue/2015/008/L00007-00009.pdf
- **CCIAA Genova 2024.** Camera di Commercio di Genova, *Disciplinare di produzione della IGP «Focaccia di Recco col formaggio»*, file «settembre 2024» (metadati PDF: 10/04/2024). https://www.ge.camcom.gov.it/it/promuovi/prodotti-tipici/prodotti-dop-e-igp/disciplinare_focaccia_di_recco_settembre_2024.pdf
- **PMQ 2019.** B. DeJournett, «The mystique and magic of New Haven-style pizza», *PMQ Pizza Magazine*, giugno–luglio 2019 (online dal 03/07/2023). https://www.pmq.com/the-mystique-and-magic-of-new-haven-style-pizza/
- **Amodio 2025.** A. Amodio, «Battilocchio e Piscitiello a Napoli: gli indirizzi giusti per la pizza fritta lunga e sottile», *lucianopignataro.it*, 31/03/2025. https://www.lucianopignataro.it/a/battilocchio-e-piscitiello-a-napoli-gli-indirizzi-giusti-per-la-pizza-fritta-lunga-e-sottile/270698/
- **Pignataro 2025.** L. Pignataro, «Il Battilocchio della Masardona spiegato da Enzo Piccirillo», *lucianopignataro.it*, 04/08/2025. https://www.lucianopignataro.it/a/il-battilocchio-della-masardona-spiegato-da-enzo-piccirillo/278585/
- **Becchi 2023.** M. Becchi, «Where to eat the best pizza fritta in Naples», *Gambero Rosso International*, 13/10/2023. https://gamberorossointernational.com/?p=481956
- **Clemente 2016.** N. Clemente, «Napoli: le 10 pizze fritte napoletane migliori», *Dissapore*, 13/06/2016. https://www.dissapore.com/cibo-di-strada/napoli-le-10-pizze-fritte-migliori/
- **Scatti di Gusto 2016.** Ricetta della montanara fritta di Gino Sorbillo, 12/09/2016 (aggiornata 27/03/2019). https://www.scattidigusto.it/ricetta-pizza-a-casa-montanara-fritta
- **Pagano 2020.** V. Pagano, «Le montanare di Sal De Riso e Gino Sorbillo per Lezioni di pizza», *Scatti di Gusto*, 27/06/2020. https://www.scattidigusto.it/2020/06/27/le-montanare-di-sal-de-riso-e-gino-sorbillo-per-lezioni-di-pizza
- **Parla 2008.** K. Parla, «Starita a Materdei, Naples», 08/12/2008. https://katieparla.com/starita-a-materdei-naples/
- **50 Top Pizza 2022.** Scheda «Starita a Materdei». https://www.50toppizza.it/referenza/starita-a-materdei-2022
- **MASAF 2026.** Ventiseiesima revisione dell'elenco dei prodotti agroalimentari tradizionali, decreto del 06/02/2026: la pizza fritta non è tra i PAT della Campania (c'è tra quelli del Lazio, n. 413). https://www.masaf.gov.it/flex/cm/pages/ServeBLOB.php/L/IT/IDPagina/24151
- **Mulino Caputo 2024–2025.** Schede prodotto sul sito del produttore. Le date sono l'ultima modifica secondo il sito.
  - Pizzeria (30/04/2025): https://www.mulinocaputo.it/prodotti/pizzeria/
  - Pizzeria professional (17/04/2025): https://www.mulinocaputo.it/prodotti/pizzeria-professional/
  - Nuvola (22/05/2025): https://www.mulinocaputo.it/prodotti/nuvola/
  - Saccorosso (30/07/2024): https://www.mulinocaputo.it/prodotti/saccorosso/
  - Manitoba Oro (18/06/2025): https://www.mulinocaputo.it/prodotti/manitoba-oro/
- **Molino Quaglia s.d.** Schede Petra, senza data.
  - Petra 5037: https://www.farinapetra.it/CARDS/farina/?bn=farinapetra&ct=card&dfbg=catalogopetra&mt=no&nosh=1&nmm=1&urlplk=farine-pizzeria&permalink=/petra-5037
  - Petra 3: https://www.farinapetra.it/CARDS/farina/?bn=farinapetra&ct=card&dfbg=catalogopetra&mt=no&nosh=1&nmm=1&urlplk=macinate-a-pietra&permalink=/petra-3
- **Agugiaro & Figna 2025.** Le 5 Stagioni, scheda «Pizza Napoletana» (rossa), ultima modifica 30/06/2025. https://le5stagioni.com/prodotto/pizza-napoletana-rossa/
- **Salvadó et al. 2011.** Z. Salvadó, F. N. Arroyo-López, J. M. Guillamón, G. Salazar, A. Querol, E. Barrio, «Temperature adaptation markedly determines evolution within the genus *Saccharomyces*», *Applied and Environmental Microbiology* 77(7):2292–2302. https://doi.org/10.1128/AEM.01861-10 — testo: https://pmc.ncbi.nlm.nih.gov/articles/PMC3067424/ (metadati da PubMed, PMID 21317255).
- **Baranyi et al. 2017.** J. Baranyi, N. Buss da Silva, M. Ellouze, «Rethinking Tertiary Models: Relationships between Growth Parameters of *Bacillus cereus* Strains», *Frontiers in Microbiology* 8:1890. https://doi.org/10.3389/fmicb.2017.01890
- **Gist-Brocades 1993.** K. A. Osinga (Gist-Brocades N.V.), domanda di brevetto EP 0 556 905 A1, «Cold-sensitive strain», 25/08/1993, §[0009]. https://data.epo.org/publication-server/rest/v1.2/patents/EP0556905NWA1/document.html
- **Ooni 2026.** Ooni, pagina prodotto «Ooni Koda 16». https://eu.ooni.com/it-it/products/ooni-koda-16
- **Engineering ToolBox, s.d.** «Metals, Metallic Elements and Alloys — Thermal Conductivities». https://www.engineeringtoolbox.com/thermal-conductivity-metals-d_858.html

Fonte non più valida: **PMC7146123**, citata prima per il Q10 a freddo. È una review sui soft
sensor di fermentazione e non riguarda il lievito (verifica del 24/10/2026, già annotata in `getQ10`).

## Forni da pizza per marca e modello (`src/app/data/oven-models.ts`, D-048)

Temperatura massima, combustibile e diametro della pizza di 41 modelli (Ooni,
Gozney, Effeuno, G3 Ferrari, Sage, Witt, Clementi, Alfa Forni, Solo Stove,
Ninja, Bertello). Fonti, data di lettura e stato di ogni valore in
`docs/ricerca/forni-fonti-2026-10-24.md`; nel codice il campo `source` dice
se la temperatura viene dal produttore (V, verificato) o da una fonte
secondaria (P, plausibile). Mappature decise in D-048: Ninja Woodfire
(370 °C, elettrico) come elettrico standard; forni Alfa a gas come gas da
pizza; G3 Ferrari Delizia e Sage Pizzaiolo (400 °C) come elettrici da pizza.
Spidocchio e Cuisinart non inseriti (nessun dato del produttore).

Dal 28/10/2026 (FW-01, S18-B-07) i forni di un marchio inventato (edizioni
dimostrative, `partner.invented: true`) hanno `source: "demo"`: lo schema
dell'edizione rifiuta "V" o "P" per dati inventati, e rifiuta "demo" per un
partner reale. Nel registro lo stato è `OVEN_MODEL_SOURCE_STATUS` in
`src/app/data/science-notes.ts`.
**Diametro della pizza (`pizzaCm`, FW-07).** Dal 28/10/2026 il motore lo usa
(`oven_max_pizza_cm`): se la pizza tonda dello stile è più larga, la ricetta
avvisa di stenderla al diametro del forno. Il valore è quello che il
produttore dichiara come «pizza fino a» (pollici convertiti in cm), non il
diametro della pietra: va ricontrollato modello per modello dove la pagina
del produttore dà solo la misura della pietra.

**Distribuzione del calore per tipo di forno (`HEAT_PROFILE_OVENS`,
`equipment-data.ts`, FW-07).** Quali disposizioni di resistenze o bruciatori
esistono su ciascun tipo di forno (grill superiore e ventilato solo nei forni
di casa ed elettrici standard, fiamma laterale solo a legna, bruciatore
dietro o sotto solo a gas). È una **scelta di Vulcan** (mappatura editoriale,
non una misura): il profilo mostra solo le opzioni valide e il motore ignora
una combinazione impossibile.
