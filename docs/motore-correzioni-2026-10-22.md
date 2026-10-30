# Correzioni al motore — 22 ottobre 2026

Rilievi ENG-1…ENG-7 dell'audit di prodotto. Le decisioni sono di Matteo (22/10/2026).
Codice in `src/app/domain/pizza-engine.ts`; il motore resta puro (niente React/DOM).

I numeri «prima/dopo» sono misurati sul codice, con questi vincoli salvo diversa
indicazione: 4 panetti, forno di casa 250 °C, livello 2, cucina 22 °C, impasto a mano.

## Riepilogo

| Rilievo | Cosa cambia |
|---|---|
| ENG-2 | Q10 a tratti e continuo. Niente salto a 10 °C (e a 15 °C per la madre). A freddo circa +20% di lievito. |
| ENG-3 | Tolta la rampa sotto le 2 h. Vale il modello cinetico, con il tetto al 3%. |
| ENG-4 | La fermentazione lascia spazio a impasto, staglio, stesura, farcitura e cottura. Se la finestra non basta, avviso in Procedimento. |
| ENG-5 | Il preriscaldo c'è sempre, anche nella Focaccia di Recco. Per gli impasti non lievitati si parla di «Riposo». |
| ENG-6 | L'ottimizzatore applica la compensazione d'idratazione sopra i candidati. `science.compensations` elenca solo ciò che è applicato. |
| ENG-7 | Cucina molto fredda o molto calda: acqua al limite pratico (40 °C o 2 °C) con un'indicazione, non più silenzio. |
| ENG-1 | 37 test nuovi: proprietà su tutti i 28 stili e la suite dev-tools (98 controlli) in vitest. |

## ENG-2 — Q10 a tratti continuo

**Prima.** L'esponente partiva sempre da 18 °C con il Q10 del tratto finale. Sotto i 10 °C
il Q10 passava da 2,0 a 1,6 di colpo: scaldando da 9,9 a 10 °C il lievito saliva.
Il vecchio commento diceva che Q10 = 2 «sovrastima l'attività a bassa T». Ma il Q10
più basso dà più attività a freddo: commento ed effetto si contraddicevano.

**Dopo.** Nuova funzione `fermentationSpeedRatio(lievito, T)`:
- lievito commerciale: Q10 2,0 da 18 a 10 °C, poi 1,6 sotto i 10 °C partendo dal valore a 10 °C;
- lievito madre: Q10 2,2 sopra i 15 °C, poi 1,9 sotto, con lo stesso raccordo.

È l'unica fonte del fattore di velocità: dose di lievito, ore equivalenti a 18 °C
(digeribilità e livello scientifico, `q10_factor`), testi «nerd» della puntata.
`getQ10` resta e restituisce il Q10 locale del tratto.

New York, 24 h, lievito fresco:

| Temperatura | Lievito prima | Lievito dopo | Ore eq. 18 °C | Digeribilità |
|---|---|---|---|---|
| 4 °C | 0,19% (1,3 g) | 0,23% (1,5 g) | 12,4 → 10,4 | 64 → 60 |
| 9,9 °C | 0,15% (1,0 g) | 0,17% (1,1 g) | 16,4 → 13,7 | 67 → 61 |
| 10 °C | 0,17% (1,1 g) | invariato | 13,8 | 62 |
| 15 °C e oltre | invariato | invariato | — | — |

Il fattore a 4 °C passa da 0,52 a 0,43 (2^-0,8 · 1,6^-0,6): circa +20% di lievito,
come accettato nella decisione. Lievito madre, Teglia 24 h: a 14,9 °C ore eq.
19,7 → 18,8; a 15 °C 19,8 → 18,9; a 15,1 °C 19,1 invariato. Il salto non c'è più.

Interpretazione: a freddo la digeribilità stimata scende di qualche punto, perché
le ore equivalenti diminuiscono. È la conseguenza diretta del modello scelto.

## ENG-3 — Fermentazioni sotto le 2 ore

**Prima.** Fino a 2 h il lievito cresceva con le ore (0,2% all'ora). Era nata per la
Focaccia di Recco, che oggi è `unleavened` e ha lievito 0. Sugli impasti lievitati la
curva andava al contrario del resto del modello.

**Dopo.** Vale il modello cinetico anche sotto le 2 h, con il tetto al 3%.

Napoletana STG a 22 °C (farina circa 507 g):

| Ore | Prima | Dopo |
|---|---|---|
| 1 h | 0,2% (1,0 g) | 0,7% (3,5 g) |
| 1,5 h | 0,3% (1,5 g) | 0,53% (2,7 g) |
| 2 h | 0,4% (2,0 g) | 0,43% (2,2 g) |
| 2,5 h e oltre | invariato | invariato |

## ENG-4 — Finestra stretta fino al pasto

**Prima.** La fermentazione prendeva tutte le ore fino al pasto. Impasto, staglio,
stesura e cottura restavano fuori. Su 28 stili × 4/8/12/24 h × genera/ottimizza,
177 casi su 224 sforavano la finestra. In UI l'inizio cadeva nel passato e si partiva
«adesso» senza avviso: la pizza era pronta dopo l'orario scelto.

**Dopo.**
- Vale solo con un orario del pasto: `UserConstraints.meal_deadline` (revisione
  del 22/10, vedi sotto). Con «Nessuna preferenza», senza scelta o in Scopri le ore
  limitano solo la fermentazione, come prima.
- Il motore calcola l'overhead fisso: i minuti della timeline che non sono
  fermentazione (`timelineOverheadMinutes`). Il preriscaldo corre in parallelo al
  riposo e conta come fermentazione.
- `generateRecipe` (senza ore scelte) e `optimizeRecipe` tolgono l'overhead dalla
  finestra e arrotondano per difetto al quarto d'ora.
- L'ottimizzatore aggiunge come candidato la fermentazione più lunga che sta nella
  finestra, se cade nel range dello stile. I candidati sono filtrati dopo l'arrotondamento.
- Minimo tecnico: 1 h per gli impasti lievitati (0,5 h di riposo per la Recco).
- Se la timeline non sta comunque nella finestra, il risultato porta l'avviso
  `gen.windowTooShort` (ore disponibili e ore necessarie). Vale anche quando le ore
  le sceglie l'utente (es. versione 48 h con il pasto fra 24 h): si rispettano, ma
  con avviso. La UI lo mostra nel Procedimento, sopra gli orari, solo se è scelto
  un orario del pasto (non con «Nessuna preferenza»).

| Caso | Fermentazione | Timeline totale |
|---|---|---|
| Napoletana, forno a legna, finestra 4 h | 4 h → 3,25 h | 284 min → 239 min |
| New York, 250 °C, finestra 4 h | 4 h → 3 h | 296 min → 236 min |
| Napoletana, finestra 8 h | 8 h → 7,25 h | 524 min → 479 min |
| Napoletana, finestra 2 h | 2 h → 1,25 h | 164 min → 119 min |
| Sonda 28 stili × 4/8/12/24 h × genera/ottimizza | — | 177/224 → 0/224 oltre la finestra |

Effetti collaterali misurati:
- con 8 h la Napoletana scende sotto il suo minimo (8 h): ora compare anche
  l'avviso già esistente `gen.timeBelowStyleWindow` e l'autenticità ne tiene conto;
- con un pasto fra 24 h gli stili con minimo 24 h passano a circa 23 h; il punteggio
  complessivo cambia di 1–2 punti (es. Teglia romana a legna 95 → 94). Con
  «Nessuna preferenza» non succede più (revisione del 22/10): restano a 24 h.

## ENG-5 — Preriscaldo sempre presente

**Prima.** Il passaggio «Forno al massimo» esisteva solo se l'appretto superava i 30 min.
La Focaccia di Recco (riposo 1,25 h, appretto 30 min) non diceva mai di accendere il
forno. Per un impasto non lievitato i passaggi si chiamavano «Puntata» e «Lievitazione finale».

**Dopo.** Il preriscaldo è ricavato dentro la fermentazione, quindi il totale non cambia:
- appretto lungo (almeno preriscaldo + 15 min): il forno si accende negli ultimi minuti
  dell'appretto, con il preriscaldo pieno (30/45/60 min secondo la temperatura);
- appretto corto: il forno si accende subito dopo lo staglio e l'appretto avviene
  durante il preriscaldo; i minuti mancanti si tolgono dalla fine della puntata;
- impasto non lievitato: «Riposo» al posto di «Puntata» e «Appretto», con testi propri
  (`timelineLabels.rest`), e preriscaldo con «Intanto i panetti riposano».

| Caso | Prima | Dopo |
|---|---|---|
| Recco, 250 °C | Puntata 45 · Staglio 15 · Appretto 30 · (nessun preriscaldo) | Riposo 45 · Staglio 15 · Forno al massimo 30 |
| Recco, forno a legna (320 °C) | Puntata 45 · Staglio 15 · Appretto 30 · (nessun preriscaldo) | Riposo 30 · Staglio 15 · Forno al massimo 45 |
| Napoletana 2 h, 485 °C | Puntata 72 · Staglio 15 · Appretto 30 · Forno 18 | Puntata 60 · Staglio 15 · Forno al massimo 60 |
| Appretti lunghi (≥ preriscaldo + 30 min) | invariato | invariato |

Limite noto, non corretto: per pizza fritta e montanara (frittura a 185 °C) il passaggio
dice ancora «Forno al massimo». Andrebbe un testo per l'olio.

## ENG-6 — Compensazione d'idratazione e ottimizzatore

**Prima.** La compensazione si applicava solo senza idratazione custom. L'ottimizzatore
passa sempre un valore custom, quindi non la applicava. Però `science.compensations`
continuava a elencare «+X% idratazione». La compensazione era scritta «0 → 8,7».

**Dopo.**
- Nuova opzione `compensateCustomHydration` di `generateRecipe`: l'ottimizzatore la usa
  sui suoi candidati, che sono idratazioni base.
- Si può uscire dal range dello stile, in modo dichiarato: la compensazione è in
  `science.compensations` come «base → finale» e la motivazione dell'ottimizzatore dice
  «Idratazione X%: base + delta…» e, se serve, «esce dal range dello stile».
- Il tetto per livello (principiante 68%, intermedio 78%, avanzato 88%) vale
  sull'idratazione finale.
- `science.compensations`, l'E-score e la deviazione contano solo le compensazioni
  applicate. Con un valore scelto dall'utente l'idratazione non è compensata e non è elencata.

Napoletana STG a 250 °C (range 55–62%):

| | Prima | Dopo |
|---|---|---|
| Genera (punto medio) | 67,2%, elencata «0 → 8,7» | 67,2%, elencata «58,5 → 67,2» |
| Ottimizza | 55%, «+8,7%» elencata ma non applicata | 63,7% (55 + 8,7), elencata e motivata, fuori range dichiarato |
| Valore utente 60% | 60%, «+8,7%» elencata; E-score 21 | 60%, non elencata; E-score 17 |

Dopo «Ottimizza» la UI ricostruisce la ricetta come l'ha valutata l'ottimizzatore
(revisione del 22/10): `params.hydration_base` più compensazione, finché lo slider
dell'idratazione resta sul valore scelto. La compensazione compare nel riquadro
tecnico e l'E-score coincide. Se l'utente sposta lo slider, il valore è suo e non
è compensato. Dopo un ricaricamento della pagina Scopri (valori nell'URL) la
compensazione non si ricostruisce: il valore resta, senza dichiarazione.

## ENG-7 — Regola 55 ai limiti

**Prima.** Con la cucina a 15 °C o meno l'acqua richiesta superava i 40 °C: il motore
restituiva `null` e l'interfaccia taceva. Lo stesso sotto i 2 °C (cucina calda con impastatrice).

**Dopo.** L'acqua si ferma al limite pratico e `science.water_temp_limit` vale `"max"` o `"min"`.
Sotto la riga Acqua compare un'indicazione: per la cucina fredda non scaldare oltre e
intiepidire la farina o allungare la puntata; per la cucina calda acqua ghiacciata,
farina in frigo o puntata più corta.

| Caso (Napoletana) | Prima | Dopo |
|---|---|---|
| Cucina 12 °C, a mano | acqua `null`, nessuna indicazione | 40 °C + «Cucina fredda…» |
| Cucina 15 °C, a mano | `null` | 40 °C + «Cucina fredda…» |
| Cucina 34 °C, planetaria | `null` | 2 °C + «Cucina calda…» |
| Cucina 22 °C, a mano | 28 °C | invariato |

I testi «nerd» della puntata usano il fattore del modello: a 4 °C «Q₁₀≈2.0 rallenta»
diventa «la fermentazione rallenta a 0,4× rispetto a 18 °C».

## ENG-1 — Test

- `src/app/domain/pizza-engine.properties.test.ts` (23 test, tutti i 28 stili):
  monotonia del lievito nelle ore (1–96 h) e nella temperatura (2–30 °C a passi di 0,5),
  ore equivalenti non decrescenti, timeline ≤ ore disponibili × 60 (genera e ottimizza),
  avviso solo quando si sfora, preriscaldo presente negli stili cotti in forno, fasi di
  fermentazione = ore, compensazioni dichiarate = applicate, tetto di livello,
  bilancio di massa (somma, percentuali, mix di farine), Regola 55 ai limiti.
- `src/app/features/dev-tools/engine-test-suite.test.ts`: i 13 gruppi della pagina /dev
  (98 controlli) girano in vitest e falliscono sugli esiti «fail».
- Test totali: 44 → 81.

## Testi nuovi (7 lingue)

In `cms-context.tsx` (italiano) e `locales/{en,de,es,fr,pt,ja}.ts`:
- `engineMessages`: `gen.windowTooShort`, `opt.hydrationOvenCompensated`,
  `opt.hydrationOutOfStyleRange`, `tip.waterTempLimitMax`, `tip.waterTempLimitMin`,
  `timeline.preheat.descWholeProof`, `timeline.preheat.descDuringRest`;
- `timelineLabels.rest` (titolo, descrizione, consigli);
- `timelineLabels.bulk_cold.tipNerd` riscritto con `{factor}` e `{refTemp}`.

## Revisione del 22/10

Correzioni dopo la revisione del ramo:

- **Nessuna preferenza non è una scadenza.** Nuovo campo `meal_deadline` in
  `UserConstraints`: il Crea lo mette a `true` solo con uno slot diverso da
  «Nessuna preferenza» (derivato dallo slot, non salvato nella bozza). Senza, il motore
  limita la fermentazione alle ore disponibili senza togliere l'overhead e senza
  `gen.windowTooShort`. I 7 stili con minimo 24 h tornano a 24 h in genera e
  ottimizza (es. California 87 → 88); sparisce l'avviso contraddittorio
  «Con 24h non rientri nella finestra (min 24h)». È l'opzione (a) proposta sopra:
  **confermata da Matteo il 23/10/2026** (M-1 dell'handoff).
- **Condimento scelto.** Ottimizzatore, soffitto e firma dell'ottimizzazione
  automatica usano lo stesso stile con condimento della ricetta mostrata
  (`styleWithSelectedTopping`). Sonda 28 stili × condimenti × 3/4/8 h × 2 forni:
  63/936 ricette ricostruite oltre la finestra → 0/936.
- **Centri dello stile.** `centerParamsForStyle` accetta i vincoli con l'orario del
  pasto e usa `maxFermentationHoursForWindow` del motore: «Torna all'originale»,
  interpretazione base e stato iniziale stanno nella finestra. Napoletana a legna,
  pasto fra 4 h: 4 h → 3,25 h, 284 → 239 min (prima 27 stili su 28 sforavano).
- **Compensazione d'idratazione in UI** (sopra, ENG-6).
- **Motivazione.** `opt.hydrationLowered` solo se il tetto di livello ha limitato la
  ricerca e l'idratazione finale resta sotto la canonica. Napoletana a 250 °C: non dice
  più «abbassata a 55%» accanto a «63,7%, esce dal range».
- **Testi.** Il fattore `{factor}` usa il decimale della lingua («0,4×» in italiano).
  Nei riposi della Focaccia di Recco niente glossario «La puntata» e niente link
  «È andata lunga?» (impasto troppo lievitato).
- **Dev Tools.** Il pannello Q10 usa `fermentationSpeedRatio` (a 4 °C 0,43, non 0,52);
  la pagina deriva i gruppi da `ENGINE_CHECK_GROUPS`.
- Test: 81 → 90 (`use-recipe-state.test.ts` nuovo; proprietà su condimenti e caso
  senza orario).

## Seguito del 23/10 (handoff M-1…M-5, M-9, M-10)

Decisioni di Matteo del 23/10/2026: M-1 confermato; slot al quarto d'ora per
difetto (M-2, opzione a); consigli allineati all'esito della ricetta sul forno.

- **M-2 · Slot del pasto.** `generateTimeSlots` arrotonda al quarto d'ora per
  difetto (`floorToQuarterHour`): mai oltre il tempo reale, al massimo 14 min in
  meno. Prima: alle 16:20 «Stasera» valeva 4 h con 3 h 40 min reali. `TimeSlot`
  porta `meal` e `dayOffset`; etichette e sottotitoli si compongono per lingua
  (`features/recipe/time-slot-text.ts`). Prima i giorni della settimana e «Nessuna
  preferenza» restavano in italiano e «Stasera» diceva «4-6 ore» a ogni ora.
- **M-3.** `recommendStyles` legge le ore al quarto d'ora per difetto.
- **M-4 · Recco.** Candidati delle ore al quarto d'ora; per gli impasti non
  lievitati niente candidato oltre il massimo (×1,25). Recco, 24 h, forno di casa:
  3 h → dentro 0,5–2 h, su 7 durate × con e senza orario.
- **M-5 · Testi.** Un solo formattatore (`features/recipe/engine-msg-text.ts`):
  decimali per lingua (63,7% / 63.7%), temperature in °C o °F, ore come durate
  («3 h 45 min»). Aggiunti in 7 lingue i 13 template che mancavano nel CMS
  (motivazioni dell'ottimizzatore, forno inadatto, finestra dello stile): prima
  uscivano in italiano ovunque. `resolveEngineMsgs` sostituisce anche i parametri
  ripetuti (`gen.timeBelowStyleWindow` lasciava un `{fMin}` visibile).
- **M-10 · Esito esplicito.** `GeneratedRecipe.verdict`: `ok`, `warnings` o
  `not_feasible`, con i motivi bloccanti: forno sotto la soglia termica dello stile
  (stessa di `feas.thermalUnviable`), timeline oltre l'orario del pasto,
  lievitazione sotto metà del minimo dello stile. `feasibleAlternativeStyles`
  propone stili fattibili con gli stessi vincoli, i più simili per primi. La UI
  mostra «Così non è fattibile» sopra la ricetta (sostituisce l'avviso ENG-4).
  `recommendStyles` usa la stessa soglia termica: con forno di casa a 250 °C
  Canotto, Calzone e Pinsa passano da «buono» a «non fattibile».
- **M-9 · Golden test** (`src/app/domain/golden/`): 28 stili × 3 scenari (ideale,
  forno di casa 24 h, pasto fra 2 h) con l'esito atteso scritto a mano; masse,
  forno e tempi in `recipes.golden.json`.

## M-11 · Lievito trasparente (24/10)

- `UserConstraints.yeast_speed_factor`: correzione personale «la mia cucina
  lievita più veloce/lenta», limitata a 0,5–2, salvata nel browser e valida per
  tutte le ricette. La dose di lievito commerciale si divide per il fattore
  (1,25 → 80% del lievito). Il lievito madre non cambia.
- `science.yeast_model`: riferimento (0,1% di fresco per 24 h a 18 °C), esponente
  sulle ore (0,7), velocità alla temperatura (Q10 a tratti), rapporto del secco
  (1/3), fattore personale, intervallo plausibile −30%/+30%.
- UI «Come calcoliamo il lievito» sotto la riga del lievito: formula a parole,
  margine in grammi, correzione personale a 5 livelli.
- **Fonte sbagliata corretta:** il Q10 1,6 sotto i 10 °C citava PMC7146123, che è
  una review sui soft sensor di fermentazione e non parla di lievito. Tolto il
  riferimento dal codice, dagli strumenti e dalla guida; in UI i valori di Q10
  sono presentati come stima del modello. Serve una fonte vera (C-4).

## C-4 · Dati con fonte (24/10)

Decisioni D-015…D-018; fonti e stato di ogni dato in `docs/fonti-dati.md`.

| Stile / dato | Prima | Dopo | Fonte |
|---|---|---|---|
| Pinsa: forno | 350–420 °C, ideale 380 | 280–320 °C, ideale 300 | PinsaRomana.it 2022 |
| Pinsa: idratazione, sale, olio | 75–85%, 2,5%, 1,0% | 72–80%, 1,8%, 1,3% | OPR 2020 |
| Pinsa: panetto e misure | 280 g, 35 × 25 cm | 240 g, 34 × 21 cm | OPR 2020 |
| Pinsa, versione «Tradizionale» | idratazione 82% | 80% | OPR 2020 |
| Napoletana STG: lievitazione | 8–24 h | 6–14 h | reg. UE 97/2010 |
| Napoletana STG: panetto | 270 g | 250 g | reg. UE 97/2010 |
| Versione «Disciplinare AVPN» | range dello stile | 12–24 h, panetto 280 g | AVPN 2024 |
| Recco: forno e cottura | 300–340 °C (320), 480–600 s | 270–320 °C (300), 240–480 s | disciplinare IGP 2024 |
| Recco, interpretazione IGP | W 190, P/L 0,48, «IGP dal 2012», «7 comuni», «crescenza ligure» | W 320, P/L 0,60, IGP dal 2015, 4 comuni, formaggio senza vincolo d'origine del latte | reg. UE 2015/39; disciplinare IGP 2024 |
| Fritta e montanara: olio | 180–190 °C, ideale 185 | 175–190 °C, ideale 175 | AVPN 2024 |
| `FLOUR_W_RANGES` | Pizzeria 240–280, Nuvola 240–280, Cuoco 300–340, Petra 5037 340–380 | 260–280, 270–290, 300–320, 300–340; chiavi allineate agli id del database; Petra 3 tolta | schede Caputo e Quaglia |
| Petra 3 | W/P/L come dati, assorbimento 60% | `w_declared: false` (stime), assorbimento 85% | scheda Quaglia |
| 5 Stagioni Napoletana Rossa | falling number 300 | 280 | scheda Agugiaro & Figna 2025 |

Effetto sui golden (`recipes.golden.json`):

| Scenario | Prima | Dopo |
|---|---|---|
| napoletana_stg · ideale | 669 g farina, panetto 270 g, 16 h, lievito 0,7 g | 619 g, 250 g, 10 h, 0,9 g |
| pinsa_romana · ideale | 610 g farina, idratazione 80%, sale 15 g, forno 380 °C | 536 g, 76%, 10 g, 300 °C |
| pinsa_romana · forno di casa | **non fattibile** (forno troppo freddo), idratazione 86,4%, cottura 559 s | **fattibile con avvisi**, 79,5%, 332 s |
| pinsa_romana · pasto fra 2 h | non fattibile: forno + lievitazione | non fattibile: solo lievitazione |
| focaccia_recco · ideale | 320 °C, 540 s | 300 °C, 360 s |
| focaccia_recco · forno di casa | cottura 851 s | 498 s |
| fritta e montanara | olio 185 °C | 175 °C |

Il «Da decidere» sulla pinsa qui sotto è chiuso da D-015. Q10: il commento nel
codice non dice più «Letteratura»; 2 tra 18 e 25 °C è coerente con Salvadó et al.
2011, 1,6 sotto i 10 °C resta una scelta del modello senza fonte.

## D-020, D-021 · Forno a legna e forni a gas (24/10)

- **D-020:** `requires_wood_oven` non è più un blocco nei consigli. Il calore
  decide (soglia termica unica, M-10); il forno a legna dà un avviso e 15 punti
  in meno sul forno nei consigli (`rec.needsWoodOven`) e un avviso nella
  ricetta (`gen.notWoodOven`). Prima la STG col forno a gas da 450 °C era «non
  fattibile» nei consigli e fattibile nella ricetta. Test: golden, «forno a
  legna dello stile: avviso, non blocco».
- **D-021:** `OvenType` ha `gas_pizza` («Forno a gas da pizza», 500 °C, fonte
  Ooni 2026) accanto a `gas` («Forno a gas a platea», 350 °C, da verificare).
  Indicazione di cottura propria (`timeline.oven.gasPizza`), nomi in 7 lingue.
  Chi aveva salvato `gas` resta sul forno a platea.

## M-7 · Le pizze fritte con fonti (24/10)

Decisioni D-022 e D-023; fonti in `docs/fonti-dati.md` §1.4.

| Stile / dato | Prima | Dopo | Fonte |
|---|---|---|---|
| Pizza fritta (calzone fritto) | panetto 100 g, W 220–280, 4–8 h | 200 g, W 250–320, 8–24 h | AVPN 2024; Sorbillo per le 8 h |
| Ripieno della fritta | ricotta 80, provola 70, cicoli 40 g | 85, 40, 55 g | AVPN 2024, §4.2 |
| Montanara | W 220–280, 4–8 h | W 250–320, 8–24 h (stesso impasto); panetto 100 g invariato | AVPN 2024; Sorbillo |
| Pizza fritta tonda | — | nuovo stile: due dischi 120 + 80 g, `closed_stuffed`, olio 175–190 °C | AVPN 2024 |

Golden: la fritta passa da 242 g a 484 g di farina per 4 panetti e da 6 h a
16 h (in frigo); la montanara da 6 a 16 h. Esiti invariati (ok / ok / pasto
fra 2 h non fattibile). La foto della tonda è per ora quella della fritta chiusa.

## Da decidere o da fare

- **Q10 del lievito (C-4):** 2 sopra i 10 °C è coerente con Salvadó et al. 2011;
  1,6 sotto è un valore del modello senza fonte verificata. Cercare uno studio sulla crescita di S. cerevisiae a
  bassa temperatura (es. modello di Ratkowsky) o tarare con prove.
- **Pinsa romana:** chiuso con D-015 (vedi C-4 sopra). Resta da verificare il tempo
  di cottura professionale (180–300 s, senza fonte).
- **Petra 3:** il dato `w_declared: false` c'è, ma la UI mostra ancora la W come
  se fosse di scheda. Serve un'etichetta «stima» (stringa CMS in 7 lingue).
- Lo slot «Nessuna preferenza» non vale più 24 h fisse: ha `hours: 0` e
  `meal_deadline: false` (D-010), quindi lo stile usa i suoi tempi ideali, anche
  di più giorni. Dal 28/10/2026 (FW-16, S05-A-08) l'etichetta lo dice: «tempi
  ideali dello stile, anche più giorni».
- `requires_wood_oven`: deciso con D-020 (avviso, non blocco).

## C-1 · Condimenti predefiniti che non portavano a nessuna ricetta (24/10/2026)

Il nuovo test `style-editorial.test.ts` ha trovato tre stili il cui
`default_topping_ref` non si risolveva in una ricetta dello stile: la ricetta
partiva senza condimento.

| Stile | Prima | Dopo | Effetto sul golden |
|---|---|---|---|
| `pizza_baciata` | `bianca_mortazza` → nessuna ricetta | `bianca_mortazza_romana` (baciata aggiunta allo stile) | timeline +5 min; «di corsa» ora anche `time_window` |
| `california_style` | `ortolana` → nessuna ricetta | `smoked_salmon_california` (Spago) | nessuno (fuori dal golden) |
| `greek_pan` | `margherita` → nessuna ricetta | `greek_cheese_pan` | timeline −2 min |

Masse, forno e lievitazione invariati.

## C-2 · Etichette e predefiniti per stile (24/10/2026)

- `authenticity_by_style`: margherita e marinara AVPN restano «Da disciplinare»
  solo per la napoletana STG; per canotto e pizza al metro sono «Tradizionale».
  La sardenaira (De.Co. di Sanremo) è «Tradizionale» nella focaccia genovese.
- Focaccia genovese: predefinita `focaccia_genovese_classica` (salamoia, olio,
  sale grosso), al posto di olio e rosmarino. Durata invariata.
- Chicago tavern: predefinita `italian_sausage_tavern` (salsiccia al finocchio
  cruda), al posto del pepperoni. Timeline +1 min.

## C-2 · Parametri di al metro, teglia, tonda, Detroit con fonti (24/10/2026)

Decisioni D-028…D-031; fonti in `docs/ricerca/stili-fonti-2026-10-24.md`.
Golden: gli esiti non cambiano; cambiano i numeri.

| Scenario | Prima | Dopo |
|---|---|---|
| teglia ideale | 800 g, forno 280 °C, 1020 s | 600 g, 310 °C, 720 s |
| teglia casa | 800 g, 1240 s | 600 g, 1063 s |
| tonda ideale | idratazione 52,5%, 320 °C, 360 s | 57,5%, 380 °C, 120 s |
| tonda casa | 567 s | 279 s (il motore compensa il forno freddo con idratazione e zucchero, come prima) |
| Detroit | lievitazione 33/24 h, zucchero 7 g | 16 h, zucchero 0 |
| pizza al metro | 700 g, 24 h a 4 °C | 1000 g, 9 h a 22 °C |

Dosi dei condimenti della pizza al metro: `topping_scale` 3,7 (3000 cm² contro
804 cm² del disco napoletano da 32 cm), applicato solo in visualizzazione.

## Audit totale n. 5 · Lievito sulle fasi reali della timeline (24/10/2026)

Con la lievitazione in frigo (o comunque sotto i 18 °C) la timeline fa
l'appretto a 18 °C (`PROOF_MIN_TEMP_C`), ma la dose di lievito trattava tutte
le ore come se fossero alla temperatura del frigo. Ora
`equivalentFermentationHours` converte l'appretto in ore equivalenti alla
temperatura di fermentazione (stessa curva `fermentationSpeedRatio`) e la dose
usa quelle. Sopra i 18 °C nulla cambia. Lo stesso valore entra nelle «ore
equivalenti a 18 °C» del livello scientifico.

Golden: 42 casi su 58 cambiano solo nel lievito (e di 1 g su farina/acqua in
2 casi per arrotondamento); masse, forno e tempi invariati.

| Scenario (ideale) | Fermentazione | Lievito prima → dopo |
|---|---|---|
| teglia romana | 36 h a 4 °C | 2,3 → 1,7 g (−26 %) |
| Detroit | 16 h a 4 °C | 4,1 → 3,1 g (−24 %) |
| New York | 33 h a 4 °C | 1,2 → 0,9 g (−25 %) |
| canotto | 48 h a 4 °C | 1,0 → 0,8 g (−20 %) |
| pizza fritta | 16 h a 4 °C | 1,5 → 1,1 g (−27 %) |
| montanara | 16 h a 4 °C | 0,7 → 0,6 g (−14 %) |

Da verificare con Matteo: la costante di riferimento (0,1 % a 18 °C per 24 h)
non cambia; se le dosi in frigo erano state tarate a occhio sul vecchio
calcolo, ora risultano più basse di circa un quarto.

## Audit totale n. 7 · Stili che lievitano in teglia (24/10/2026)

Nuovo campo `proof_in_pan` (Detroit, Chicago deep, focaccia genovese e barese,
sfincione, grandma, padellino, greek pan): dopo lo staglio l'impasto si stende
in teglia e l'appretto si fa lì («Appretto in teglia»); prima la stesura veniva
dopo 9–14 h di appretto, subito prima di infornare. Teglia e pala romana, al
metro e tonde restano com'erano (appretto a panetti, stesura prima della
cottura). Cambia solo l'ordine: durate e totali invariati (golden identico).

## Audit totale n. 11 · Peso delle forme ovali con la teglia di default (24/10/2026)

La pagina ricetta e Crea passano sempre una teglia al motore. Per le forme
ovali (pala e pinsa) la forma di default è «tonda» ma senza diametro, quindi
`calcDoughWeight` usava il tondo di ripiego da 30 cm (707 cm²) invece
dell'ovale dello stile: il peso cresceva senza che l'utente toccasse nulla.
Ora, senza un diametro scelto, l'ovale resta l'area dello stile.

| Stile | Area ovale | Panetto prima → dopo |
|---|---|---|
| pala romana | 40 × 20 cm, 628 cm² | 360 → 320 g |
| pinsa romana | 34 × 21 cm, 561 cm² | 302 → 240 g |

Golden invariato (i casi golden non passano una teglia). Test in
`pizza-engine.test.ts`.

Nello stesso intervento: la scheda tecnica di uno stile leggeva peso, sale,
forno e tempi di cottura da `parametric-databases.ts`, diversi dal motore in
molti stili (Pala 350 g, Pinsa forno 380 °C contro 300 °C, Recco 8–10 min
contro 4–8). I numeri sono stati allineati al motore, con un test che li
tiene uguali; lo spessore in g/cm² mostrato è ora peso diviso area (Pala
0,51), non l'indice relativo `thickness_factor` (0,35).

## Audit totale n. 8 · Consigli coerenti con forno e impasto (24/10/2026)

- **Recco, passo doppio:** il passo generico «Farcitura tra sfoglie» ospita
  già il condimento scelto; il motore aggiungeva anche il passo del
  condimento con la stessa farcitura. Ora il passo del condimento entra solo
  quando sostituisce quello generico. Golden: Recco ideale 130 → 126 min,
  casa 132 → 128 min; nient'altro cambia.
- **Preriscaldo:** «pietra o acciaio già dentro» solo per forno di casa ed
  elettrico statico (legna, gas ed elettrico da pizza hanno la platea). Il
  titolo passa da «Forno al massimo» a «Preriscalda il forno»: la
  temperatura indicata spesso non è il massimo.
- **Cottura in forno di casa:** «per il cornicione» diventa «per dorare i
  bordi», giusto anche per le pizze chiuse e la Recco.

## Audit totale n. 9 · Fattibilità nei consigli e nelle alternative (24/10/2026)

- **Tempo:** in `recommendStyles` uno stile è «non fattibile» se le ore
  disponibili sono meno della sua lievitazione minima. Con «Stasera» (5 h 30)
  restano fattibili solo ciaccino senese, fugazzeta, greek pan e Recco;
  prima comparivano tra i «Fattibili» stili da 6–48 h che la ricetta poi
  dichiarava non fattibili. Nessuno stile chiede più di 24 h minime, quindi
  «Nessuna preferenza» non cambia.
- **Alternative:** con un forno da 250 °C le alternative alla Napoletana
  erano stili da 300–380 °C. Ora un'alternativa deve avere il minimo entro
  il 10 % della tua temperatura (Napoletana → ciaccino senese, New York,
  Chicago tavern).
Golden invariato (riguarda solo la ricetta).

## D-043 · Pre-fermento sceglibile e peso del panetto (24/10/2026)

- `GenerateRecipeOptions.preFerment` ({ type, flourPct }): biga o poolish
  scelti dall'utente e farina nel pre-fermento (20–50 %, default biga 40 %,
  poolish 30 %). Senza scelta resta il tipo dello stile: golden invariato.
- Scorporo della biga al 44 % d'acqua (fonti, audit n. 10; prima 45 %): su
  1 kg di farina, biga 400 g di farina con 176 g d'acqua invece di 180 g.
- `PanConfig.ballWeightG`: peso del panetto scelto; vince su teglia e
  spessore e non subisce la compensazione dello spessore del forno.

## Verifica di GPT sul server MCP · Recco senza frasi da impasto lievitato (24/10/2026)

- **Prima:** con la Recco (senza lievito, con olio) i punteggi riportavano
  «Impasto puro: solo farina, acqua, sale, lievito» e «Fermentazione troppo
  breve: amidi non degradati». Due frasi false su quell'impasto.
- **Dopo:** per gli impasti `unleavened` la digeribilità non produce frasi su
  fermentazione, amidi o FODMAP (`fodmap_reduction_pct` nullo); il numero
  resta. «Impasto puro» compare solo se l'impasto è davvero farina, acqua,
  sale e lievito (niente olio, zucchero, né impasto senza lievito).
- Test: `pizza-engine.test.ts` («Recco senza lievito»). Golden invariato:
  le frasi non sono nel golden.

## D-050 · Pre-fermento sulle ore delle fonti e cotture una alla volta (24/10/2026)

Dalla verifica di GPT sul server MCP, approvato da Matteo.

- **Pre-fermento.** *Prima:* sempre il 40 % delle ore, uguale per biga e
  poolish (24 h → 9 h 36 per entrambi). *Dopo:* `fermentationPhases` usa le
  ore delle fonti, biga 16 h e poolish 14 h (centro di 12–16 h), quando
  all'impasto finale restano almeno 8 h (parametro del modello); altrimenti
  il 40 % come prima. Il resto si divide fra puntata e appretto 2:1 come
  prima. Con 24 h: biga 16 h + puntata 5 h 20 + appretto 2 h 40. La dose di
  lievito non cambia, salvo il caso col frigo (Napoletana a canotto, profilo
  di casa: 1,2 → 1,3 g), dove la quota di appretto a 18 °C è diversa.
- **Cottura.** *Prima:* un solo passo da una pizza (4 Napoletane: 2 min).
  *Dopo:* una pizza o teglia alla volta, `rounds` = pezzi e durata totale
  (4 × 2 = 8 min), con la frase «4 cotture da 2 min, una alla volta» in 7
  lingue. La finestra fino al pasto conta tutte le cotture: Napoletana con
  4 h e forno a legna passa da 3,25 a 3 h di fermentazione.
- **Golden:** cambiano solo `timeline_min` (le cotture ripetute) e il lievito
  del canotto qui sopra; masse e forno invariati. Negli scenari «rush» (2 h)
  gli stili restano non fattibili e dichiarano anche `time_window`.
- Test: `pizza-engine.test.ts` (fasi, passo del pre-fermento, cotture).

## Seconda verifica di GPT · cotture sui secondi e avviso sul tempo (24/10/2026)

- **Cotture.** *Prima:* le cotture ripetute moltiplicavano il minuto già
  arrotondato di una pizza (Koda: 75 s → «4 cotture da 1 min», 4 min).
  *Dopo:* totale sui secondi veri (4 × 75 s = 5 min) e frase «4 cotture da
  75 secondi» (parametro `sec`, formattato dalla lingua). Golden: `timeline_min`
  di ±1–2 minuti su 19 voci, nient'altro.
- **Avviso.** *Prima:* con l'orario del pasto e la lievitazione accorciata
  sotto il minimo dello stile, «Con 4 h non rientri nella finestra (min 4 h)»:
  non diceva che parte delle ore va a impasto, staglio e cottura. *Dopo:* con
  `meal_deadline` il messaggio `gen.timeBelowStyleWindowMeal` dice le ore di
  lavorazione, quelle che restano alla lievitazione, il minimo e il totale
  che serve (7 lingue). Senza orario resta il messaggio di prima. Test.

## FW-07 · cucina effettiva unica (audit UX/scienza 28/10/2026)

Un solo oggetto «cucina effettiva» (`src/app/use-cases/effective-kitchen.ts`,
`resolveEffectiveKitchen`) per profilo, Crea, Personalizza, scheda stile,
passi e server MCP. Misure sul codice, prima (`dedb1fe`) e dopo.

- **Classifica `recommendStyles`.** P1 (forno di casa 250 °C, livello 1,
  24 h) e P3 (Effeuno P134H 509 °C, livello 4, spirale, pietra): ordine,
  punteggi e fasce **invariati** per tutti i 29 stili. Per P3 cambiano solo
  gli avvisi: New York, Chicago tavern, New Haven e Recco ricevono
  `gen.ovenTooNarrow` (la pizza da 35–38 cm non entra in una bocca da 34 cm).
- **Bocca del forno.** *Prima:* `pizzaCm` dei modelli non arrivava al
  motore. *Dopo:* `oven_max_pizza_cm` (dal modello salvato) e, se il
  diametro della pizza tonda è maggiore, un avviso esatto (confronto
  geometrico con `pizzaCm` del modello; il testo non attribuisce la
  misura al produttore perché `source` può essere "P" o "demo"): «Il tuo forno accetta pizze fino a
  {max} cm … stendi il disco a {max} cm al massimo». Nessuna dose cambia.
- **Distribuzione del calore.** *Prima:* `ovenBakeSetup` guardava il profilo
  di calore prima del tipo di forno: forno a legna + «grill superiore» dava
  le istruzioni del grill. *Dopo:* una distribuzione che il tipo di forno
  non ha (mappa `HEAT_PROFILE_OVENS` in `equipment-data.ts`, scelta di
  Vulcan) viene ignorata e vale il testo del tipo di forno.
- **«Al massimo».** *Prima:* focaccia genovese, forno di casa 250 °C:
  «Cuocere a 230 °C. Forno statico … al massimo». *Dopo:* «… impostato a
  230 °C, non al massimo» (`timeline.oven.staticShelfSet`/`StoneSet`) quando
  la cottura sta più di 10 °C sotto la massima del forno; negli altri casi
  il testo resta quello di prima.
- **Consigli dei passi.** Il consiglio di cottura usa sempre i secondi di
  una cottura del passo (con i giri, D-050) ±20 % e la regola delle
  rotazioni del forno (una volta a metà; spesso con legna, carbone, gas da
  pizza). Napoletana col forno di casa: «4–8 min» (prima «5–7», ±15 %);
  teglia romana: un solo tempo, niente più «8–15 min» del riferimento.
- **Golden e parità MCP:** invariati (`src/app/domain/golden`,
  `mcp-kitchen-parity.test.ts`). Test nuovi in `effective-kitchen.test.ts`,
  `recipe-output-format.test.ts`, `use-profile-defaults.test.ts`,
  `mcp-server.test.ts`.

## FW-19 · piano temporale unico (audit UX/scienza 28/10/2026)

Un solo piano per Procedimento, Timeline comoda, «Inizia ora» e modalità
cottura (`src/app/use-cases/cook-plan.ts`, test in `cook-plan.test.ts` sulle
timeline vere di teglia romana, focaccia genovese e napoletana STG). Misure
sul codice, prima (`116906f`) e dopo, con l'MCP `generate_recipe`
(4 pezzi, ricetta adattata).

- **Pieghe come passo** (S10-B-10, S09-A-07). Per gli stili con una serie di
  pieghe in `FOLDING_DB` (numero ≥ 2, intervallo > 0) il passo `folds`
  (numero × intervallo) è ricavato dall'inizio della puntata se la puntata
  tiene almeno 2 h oltre le pieghe. Con la puntata sotto i 18 °C le pieghe
  sono a temperatura ambiente e il lievito le conta come l'appretto
  (`equivalentFermentationHours`). Totale della fermentazione invariato.
  - P1 (casa 250 °C, 24 h), teglia romana: `mix 10 · bulk 864` → `mix 10 ·
    folds 135 · bulk 729`; lievito 2,4 → 2,3 g.
  - P1 focaccia genovese (22 °C): `bulk 432` → `folds 60 · bulk 372`;
    lievito invariato (2,1 g).
  - P3 (Effeuno 509 °C, 48 h), teglia romana: lievito 1,4 → 1,3 g.
- **Recupero del forno fra le cotture** (S09-A-14, S09-B-13). Ipotesi per
  tipo di forno (`BAKE_ROUND_RECOVERY_SEC`, nota `bake-round-recovery`):
  - P1 napoletana, 4 cotture: `bake 23` → `38` min (4 × 5 min 45 s + 3 × 5 min).
  - P3 napoletana: `bake 5` → `11` min (4 × 75 s + 3 × 2 min).
  - Durata del procedimento: +15 min con il forno di casa e 4 pezzi, +6 min
    con i forni da pizza, +2 min con legna e carbone.
- **Etichetta dei giri** in secondi veri («5 min 45 s», non «6 min»), anche
  nel testo tradotto (`formatSeconds`).
- **Golden** (`recipes.golden.json`): esiti invariati per tutti i 29 stili ×
  3 scenari. Cambiano `timeline_min` (+15 min in casa, +2 a legna) e il
  lievito degli stili con pieghe e puntata in frigo (teglia, pala, spaccata,
  baciata, barese, Detroit, canotto: −0,1 g circa).
- **Classifica `recommendStyles`** per P1 e P3: invariata (P1: montanara,
  fritta, fritta tonda, focaccia genovese, ciaccino a 87; P3: tonda 91,
  canotto 90, pinsa 89, teglia 88, New York 88).
- **Parità MCP ↔ browser:** i passi espongono anche `round_seconds` e
  `recovery_seconds`; la guida dell'MCP dice che il recupero è compreso.

## Tranche B2 · teglia casalinga in giornata (30/10/2026)

Stile nuovo `teglia_in_giornata` con il riferimento di Benedetta Rossi
(`docs/progetto-catalogo-italiano.md` §9.11). Tre ritocchi al motore, tutti
inerti per gli stili che c'erano:

- **Sale della fonte** (`saltRangePct`). La forbice del sale come leva utente
  era 1,5–3,5 % per tutti: l'1,2 % di Benedetta (1 cucchiaino su 500 g)
  diventava 1,5 % (7,5 g invece di 6). Ora il minimo è
  `min(1,5, sale dello stile)`; vale anche per lo slider e per la correzione
  «troppo salata» in Crea e nella ricetta. Gli altri stili hanno sale ≥ 1,8 %:
  forbice invariata (test in `use-cases/teglia-in-giornata.test.ts`).
- **Impasto senza impastare** (`MethodProcessProfile.mix_without_kneading`,
  messaggio `timeline.mix.stir`). La fonte mescola col cucchiaio: prima il
  passo diceva «Impasta a mano fino a incordatura (~15-20 min) con lo slap &
  fold». Solo i profili che lo dichiarano (oggi Benedetta): `mix 20` → `10`.
- **Dosi convertite** (`converted_doses` → `source.convertedDoses` nelle
  `source_notes`), D-066: la ricetta dice che i grammi sono una conversione.
- `needsPan` e `supportsThickness` comprendono lo stile nuovo (teglia e
  spessore modificabili in Crea).

Misure: `preset-numbers.regression.json` e `recipes.golden.json` hanno solo
righe nuove (`teglia_in_giornata`), nessun numero cambiato. Classifica di
`recommendStyles` (ricette su misura): P1 (casa 250 °C, 24 h) stesso ordine
relativo, lo stile nuovo entra 14° con 97; P3 (Effeuno 509 °C, 48 h) stesso
ordine, lo stile nuovo 30° con 97 (pari voto, ultimo per margine di cucina).

## Tranche B2, seguito · decisioni di Matteo e difetti della teglia in giornata (30/10/2026)

Correzioni generali, attive solo per i dati che le dichiarano; nessuno stile
di prima cambia (`preset-numbers.regression.json` identico; in
`recipes.golden.json` cambiano solo le due righe della teglia in giornata,
`timeline_min` 622 → 612: l'impasto senza preset ora si mescola, 10 minuti
invece dei 20 dell'impasto a mano).

- **Impasto che non si lavora a mano** (`isUnworkedPanDough`: profilo
  `mix_without_kneading` + `proof_in_pan`, un pezzo per teglia). La
  difficoltà dell'idratazione alta per chi comincia è nel lavoro a mano
  (impastare un impasto appiccicoso, pirlarlo, stenderlo e trasferirlo);
  un impasto mescolato col cucchiaio e allargato con le mani unte nella
  teglia unta non ha nessuno di questi passaggi. Per questi impasti: niente
  avvisi `feas.hydrationBeginnerHigh` / `MedBeginner` (segnali «Impasto
  esigente» e «Abbassa l'idratazione»), niente tetto d'idratazione per livello
  nell'ottimizzatore. Lo stesso impasto impastato a mano, o non in teglia,
  resta «esigente» (test). Riferimento di Benedetta, principiante: 89 → 97.
- **Processo dello stile.** `teglia_in_giornata` ha il `method_profile` del
  suo riferimento (diretto, mescolato, 10 minuti in teglia): anche la ricetta
  senza preset, la proposta su misura e l'MCP mescolano invece di impastare.
  Guardia: i flag del profilo dello stile coincidono con quelli del
  riferimento.
- **Proposta su misura vicina al riferimento-fonte**
  (`optimizeRecipe(..., searchAround)`, `sourceReferenceCenter`). Causa: la
  ricerca copriva tutta la forbice dello stile e il punteggio di digeribilità
  cresce con le ore (2 h → 23, 6 h → 50, 12 h → 66), quindi vinceva sempre
  12 h; per chi comincia il tetto di livello (68 %) portava l'acqua sotto il
  minimo dello stile (75 %). Ora, per gli stili col riferimento da una fonte,
  lo spazio di ricerca sta entro `INTERPRETATION_TOLERANCE` (±3 % d'acqua,
  ±25 W, ±4 h: le stesse tolleranze con cui il motore chiama una ricetta
  fedele all'interpretazione) e dentro gli intervalli dello stile; i punteggi
  non cambiano. Principiante, forno di casa, cena di domani: prima 68 %,
  W 290, 12 h a 22 °C; ora 77 %, W 280, 6 h a 22 °C (con 6 ore fino al pasto:
  5 h). Vale anche per «Ottimizza per me» dal riferimento.
- **Testi.** Passo «Impasto» con variante `stir` (niente glossario di
  incordatura e pieghe, niente «impasto appiccicoso» fra i problemi); con una
  teglia sola niente staglio, con più teglie «Dividi nelle teglie» (stessi
  15 minuti, niente panetti né pirlatura); preriscaldo degli stili che
  lievitano in teglia: «Intanto l'impasto (finisce) l'appretto in teglia»
  invece di «i panetti» anche nel testo del motore (MCP), come nella UI.
- **Nota della salsa.** Un condimento può dichiarare una scelta di Vulcan su
  ciò che la fonte non dice (`ToppingRecipe.source_note`, nelle
  `source_notes`): la margherita della teglia in giornata dice che olio e sale
  della salsa «condita» sono una lettura di Vulcan.
