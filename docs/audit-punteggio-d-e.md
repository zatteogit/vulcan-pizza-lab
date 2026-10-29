# D-E · Che cosa cambia nella classifica degli stili

*Audit UX e scienza, pacchetto FW-06 · 29 ottobre 2026 · aggiornato con le decisioni D-062 e D-063.*

## La decisione

La **Compatibilità con la tua cucina** (il numero su 100 delle card di Crea e
Scopri, del pannello stile e della scheda ricetta) d'ora in poi pesa **solo due
criteri**:

| Criterio | Prima | Dopo |
|---|---|---|
| Fedeltà allo stile (autenticità) | 30 % | **55 %** |
| Facilità (fattibilità con la tua cucina) | 25 % | **45 %** |
| Maturazione stimata (digeribilità) | 20 % | 0 % · informazione a parte |
| Sostenibilità stimata | 15 % | 0 % · informazione a parte |
| Sperimentazione | 10 % | 0 % · informazione a parte |

Fra i due criteri rimasti il rapporto è quello di prima (30 : 25 ≈ 55 : 45).
Le regole che limitano il numero restano uguali: il punteggio non supera la
fedeltà allo stile e una ricetta che non puoi fare resta sotto 40 (39, regola
dell'app). Maturazione, sostenibilità e sperimentazione si calcolano ancora e
si vedono nei dettagli del punteggio, con la scritta «non entra nel numero».

## Come è stata fatta la misura

Tre cucine tipo, nessuna preferenza d'orario (48 ore), 4 panetti, dispensa non
compilata. Per ogni stile la ricetta **su misura** che Crea propone (la stessa
che si apre toccando la card), poi l'ordine di Crea: prima i gruppi
(*Fattibili*, *Con condizioni*, *Fritte in pentola*, *Non fattibili così*),
dentro ogni gruppo dal punteggio più alto. A parità di punteggio, prima di
D-062 l'ordine era quello del catalogo; ora decide il margine della cucina. Lo script è `scripts/measure-score-d-e.ts` (si rilancia
con `npx vite-node scripts/measure-score-d-e.ts`).

- **P1** · forno di casa elettrico a 250 °C, teglia, livello 2 (Intermedio)
- **P2** · forno da pizza elettrico a 450 °C con pietra, livello 3 (Avanzato)
- **P3** · forno a legna a 480 °C, livello 4 (Esperto)

## In breve, per chi non ha tempo (D-E, prima di D-062 e D-063)

1. **I gruppi non cambiano.** Nessuno stile passa da «Fattibili» a «Non
   fattibili» o viceversa: i gruppi dipendono dal verdetto del motore, non dal
   numero.
2. **Il numero si appiattisce in alto.** Gli stili fattibili, che prima stavano
   fra 79 e 91, ora stanno quasi tutti fra **96 e 98**: con P2 ventisei stili su
   ventinove hanno 97 o 98. Il numero dice bene «si può fare ed è fedele allo
   stile», ma non distingue più fra due stili entrambi fattibili; dentro un
   gruppo l'ordine diventa quasi sempre quello del catalogo.
3. **Gli stili che hanno un tetto si staccano di più.** Con un forno da pizza
   elettrico (P2) Napoletana STG, New Haven e Pizza al Metro restano a **75**
   (senza legna o carbone l'autenticità si ferma a 75 per regola dell'app),
   mentre gli altri salgono a 97: prima la distanza era di 12 punti, ora di 22.
4. **I primi 5 cambiano soprattutto per effetto dei pari merito**: Teglia, Pala,
   Baciata e Spaccata arrivano a 98 e passano davanti a Scrocchiarella, Canotto
   e Pinsa (97).
5. **Le fritte restano nel loro gruppo** dopo gli stili al forno (D-032).

## Le domande per Matteo (risposte: D-062, D-063)

- **Pari merito.** Con il nuovo numero molti stili hanno lo stesso punteggio.
  Vogliamo un criterio di spareggio dichiarato (per esempio la maturazione
  stimata, o l'ordine editoriale «stili iconici prima»), oppure va bene l'ordine
  del catalogo?
- **Napoletana con forno da pizza non a legna.** Con P2 resta a 75 e, rispetto
  agli altri a 97, sembra ancora più penalizzata. Il tetto di 75 è una scelta
  editoriale (nota «Tetto di autenticità per il combustibile»): ora la card la
  dice («limitata da: fedeltà allo stile»), ma il valore resta da confermare.

## Decisioni di Matteo (D-062, D-063)

*29 ottobre 2026, dopo aver letto questo documento. Registro: docs/autorialita.md.*

- **D-062 · Spareggio.** A pari numero mostrato, e solo dentro lo stesso gruppo, viene prima lo stile che la cucina copre con **più margine**. Il margine è la media di due valori fra 0 e 1: quanto il forno supera la temperatura minima dello stile, `(forno − minimo) / minimo`, e quanto le ore a disposizione superano la maturazione minima, `(ore − ore minime) / ore minime`; 1 vuol dire il doppio o più. Per le fritte conta solo il tempo. Il numero non cambia. Vale in Crea, nell'anteprima di Scopri per la tua cucina e in `recommend_styles` dell'MCP (che restituisce anche `kitchen_margin`). È dichiarato nella spiegazione del punteggio come scelta di prodotto, con la nota «Spareggio a pari punteggio» del registro della scienza. Codice: `src/app/domain/kitchen-margin.ts`. Alternative scartate: stili iconici prima, maturazione stimata, ordine del catalogo.
- **D-063 · Tetto di autenticità per il combustibile.** Il tetto di 75 vale solo se il forno **non arriva alla temperatura minima dello stile** (`baking.temp_c_range[0]`: 430 °C per la Napoletana STG, 300 °C per la Pizza al Metro, 340 °C per New Haven). Un forno elettrico o a gas che ci arriva non ha né il tetto né i −15 punti sull'asse attrezzatura; nei dettagli dell'autenticità (livello 2) resta scritto che lo stile prevede la legna (per la Napoletana STG lo dice il disciplinare), come informazione e non come penalità. Alternative scartate: tetto più morbido a 85, lasciare 75.

Le risposte chiudono le due domande qui sopra.

### Che cosa si muove, in breve

1. **Nessun gruppo cambia** e, fuori dai tre stili col tetto, nessun numero cambia: lo spareggio tocca solo l'ordine.
2. **Col forno da pizza (P2) i tre stili col tetto risalgono:** Pizza al Metro e New Haven 75 → 97, Napoletana STG 75 → 93 (ora la limita la facilità: 450 °C sono sotto i 485 °C ideali). Restano «Con condizioni» perché l’esito del motore dice ancora che lo stile prevede legna o carbone (per la Napoletana anche che il forno è sotto i 485 °C ideali).
3. **Col forno a legna (P3) sale New Haven** (75 → 97, il tetto era quello del carbone); la Napoletana resta a 96.
4. **Fra i pari merito salgono gli stili che chiedono poco forno** (focacce e teglie: col forno da pizza il margine di forno è pieno) e scendono quelli che chiedono molto: Scrocchiarella, Canotto, Calzone, Pinsa e New York lasciano la parte alta dei 97. Con 48 ore il margine di tempo è pieno per quasi tutti, quindi decide il forno; con meno ore conterebbe anche il tempo.
5. **Col forno di casa (P1) cambia solo l'ordine dei dieci fattibili a 97:** Chicago Deep Dish e Sfincione davanti alla Focaccia Genovese.

### Una cosa da guardare

Lo spareggio premia lo stile più «comodo» per la cucina, non il più rappresentativo: col forno da pizza a 450 °C una focaccia viene prima della Scrocchiarella o del Canotto, che quel forno valorizza di più. È l'effetto voluto da D-062 (l'alternativa «stili iconici prima» è stata scartata), ma è il movimento che un utente noterà di più.

## Le classifiche dopo D-062 e D-063

Stessa misura, stesse cucine (`npx vite-node scripts/measure-score-d-e.ts`). Il confronto è con le classifiche D-E qui sotto. ▲ sale · ▼ scende · in **grassetto** il valore di ora. «Margine» è il valore di D-062 (0–1).

### P1 · Forno di casa elettrico 250 °C, teglia, livello 2

| Stile | Gruppo | Posizione D-E → ora | Punteggio D-E → ora | Margine |
|---|---|---|---|---|
| Chicago Deep Dish | Fattibili | 2 → **1** ▲ | 97 → **97** | 0,63 |
| Sfincione | Fattibili | 4 → **2** ▲ | 97 → **97** | 0,63 |
| Focaccia Genovese | Fattibili | 1 → **3** ▼ | 97 → **97** | 0,60 |
| Pizza al Padellino | Fattibili | 3 → **4** ▼ | 97 → **97** | 0,57 |
| Trancio Milanese | Fattibili | 7 → **5** ▲ | 97 → **97** | 0,57 |
| Focaccia Barese | Fattibili | 8 → **6** ▲ | 97 → **97** | 0,57 |
| Fugazzeta Argentina | Fattibili | 9 → **7** ▲ | 97 → **97** | 0,57 |
| Grandma Style | Fattibili | 5 → **8** ▼ | 97 → **97** | 0,54 |
| Ciaccino Senese | Fattibili | 6 → **9** ▼ | 97 → **97** | 0,54 |
| Greek Pan Pizza | Fattibili | 10 → **10** | 97 → **97** | 0,54 |
| Chicago Tavern Cut | Con condizioni | 11 → **11** | 94 → **94** | 0,52 |
| Teglia Romana | Con condizioni | 12 → **12** | 91 → **91** | 0,50 |
| Detroit Style | Con condizioni | 13 → **13** | 91 → **91** | 0,50 |
| Pinsa Romana | Con condizioni | 14 → **14** | 87 → **87** | 0,50 |
| Pizza Montanara | Fritte in pentola | 15 → **15** | 97 → **97** | 1,00 |
| Pizza Fritta | Fritte in pentola | 16 → **16** | 97 → **97** | 1,00 |
| Pizza Fritta Tonda | Fritte in pentola | 17 → **17** | 97 → **97** | 1,00 |
| Focaccia di Recco | Non fattibili così | 18 → **18** | 39 → **39** | 0,50 |
| Pizza Baciata | Non fattibili così | 19 → **19** | 39 → **39** | 0,50 |
| Pizza Spaccata | Non fattibili così | 20 → **20** | 39 → **39** | 0,50 |
| Pizza al Metro | Non fattibili così | 21 → **21** | 39 → **39** | 0,50 |
| Tonda Romana "Scrocchiarella" | Non fattibili così | 22 → **22** | 39 → **39** | 0,50 |
| New York Style | Non fattibili così | 23 → **23** | 39 → **39** | 0,50 |
| Pala Romana | Non fattibili così | 24 → **24** | 39 → **39** | 0,50 |
| New Haven Apizza | Non fattibili così | 25 → **25** | 39 → **39** | 0,50 |
| California Style | Non fattibili così | 26 → **26** | 39 → **39** | 0,50 |
| Canotto Contemporanea | Non fattibili così | 27 → **27** | 37 → **37** | 0,50 |
| Calzone Napoletano | Non fattibili così | 28 → **28** | 35 → **35** | 0,50 |
| Napoletana STG | Non fattibili così | 29 → **29** | 25 → **25** | 0,50 |

**Primi 5 con D-E:** Focaccia Genovese, Chicago Deep Dish, Pizza al Padellino, Sfincione, Grandma Style.
**Primi 5 ora:** Chicago Deep Dish, Sfincione, Focaccia Genovese, Pizza al Padellino, Trancio Milanese.
**Entra nei primi 5:** Trancio Milanese. **Esce:** Grandma Style.

**Lettura.** Nessun numero cambia: col forno di casa nessuno stile che chiede la legna o il carbone è fattibile, quindi D-063 non tocca niente (Napoletana STG, New Haven e Pizza al Metro restano fra le non fattibili, sotto 40). Cambia solo l'ordine dei dieci stili fattibili a 97: con 48 ore il margine di tempo è pieno per tutti, quindi decide il forno. Chicago Deep Dish e Sfincione (minimo 200 °C, margine 0,63) passano davanti alla Focaccia Genovese (210 °C, 0,60); Grandma Style, Ciaccino Senese e Greek Pan Pizza (230 °C, 0,54) scendono in fondo al gruppo. Gli altri gruppi non si muovono: lì i numeri sono già diversi (94, 91, 91, 87) o, fra le non fattibili, il margine di forno è zero per tutti.

### P2 · Forno da pizza elettrico 450 °C con pietra, livello 3

| Stile | Gruppo | Posizione D-E → ora | Punteggio D-E → ora | Margine |
|---|---|---|---|---|
| Teglia Romana | Fattibili | 1 → **1** | 98 → **98** | 0,90 |
| Pizza Baciata | Fattibili | 3 → **2** ▲ | 98 → **98** | 0,83 |
| Pizza Spaccata | Fattibili | 4 → **3** ▲ | 98 → **98** | 0,83 |
| Pala Romana | Fattibili | 2 → **4** ▼ | 98 → **98** | 0,68 |
| Focaccia Genovese | Fattibili | 8 → **5** ▲ | 97 → **97** | 1,00 |
| Chicago Deep Dish | Fattibili | 11 → **6** ▲ | 97 → **97** | 1,00 |
| Pizza al Padellino | Fattibili | 12 → **7** ▲ | 97 → **97** | 1,00 |
| Sfincione | Fattibili | 14 → **8** ▲ | 97 → **97** | 1,00 |
| Trancio Milanese | Fattibili | 18 → **9** ▲ | 97 → **97** | 1,00 |
| Focaccia Barese | Fattibili | 20 → **10** ▲ | 97 → **97** | 1,00 |
| Fugazzeta Argentina | Fattibili | 21 → **11** ▲ | 97 → **97** | 1,00 |
| Grandma Style | Fattibili | 15 → **12** ▲ | 97 → **97** | 0,98 |
| Ciaccino Senese | Fattibili | 17 → **13** ▲ | 97 → **97** | 0,98 |
| Greek Pan Pizza | Fattibili | 23 → **14** ▲ | 97 → **97** | 0,98 |
| Chicago Tavern Cut | Fattibili | 19 → **15** ▲ | 97 → **97** | 0,94 |
| Detroit Style | Fattibili | 10 → **16** ▼ | 97 → **97** | 0,90 |
| New York Style | Fattibili | 6 → **17** ▼ | 97 → **97** | 0,83 |
| Focaccia di Recco | Fattibili | 16 → **18** ▼ | 97 → **97** | 0,83 |
| Pinsa Romana | Fattibili | 9 → **19** ▼ | 97 → **97** | 0,80 |
| California Style | Fattibili | 22 → **20** ▲ | 97 → **97** | 0,80 |
| Tonda Romana "Scrocchiarella" | Fattibili | 5 → **21** ▼ | 97 → **97** | 0,75 |
| Canotto Contemporanea | Fattibili | 7 → **22** ▼ | 97 → **97** | 0,56 |
| Calzone Napoletano | Fattibili | 13 → **23** ▼ | 97 → **97** | 0,56 |
| Pizza al Metro | Con condizioni | 24 → **24** | 75 → **97** | 0,75 |
| New Haven Apizza | Con condizioni | 25 → **25** | 75 → **97** | 0,66 |
| Napoletana STG | Con condizioni | 26 → **26** | 75 → **93** | 0,52 |
| Pizza Montanara | Fritte in pentola | 27 → **27** | 97 → **97** | 1,00 |
| Pizza Fritta | Fritte in pentola | 28 → **28** | 97 → **97** | 1,00 |
| Pizza Fritta Tonda | Fritte in pentola | 29 → **29** | 97 → **97** | 1,00 |

**Primi 5 con D-E:** Teglia Romana, Pala Romana, Pizza Baciata, Pizza Spaccata, Tonda Romana "Scrocchiarella".
**Primi 5 ora:** Teglia Romana, Pizza Baciata, Pizza Spaccata, Pala Romana, Focaccia Genovese.
**Entra nei primi 5:** Focaccia Genovese. **Esce:** Tonda Romana "Scrocchiarella".

**Lettura.** Due movimenti diversi.
1. **D-063 alza i tre stili col tetto.** Con il forno elettrico a 450 °C Pizza al Metro (minimo 300 °C) e New Haven (minimo 340 °C) passano da 75 a **97**, la Napoletana STG (minimo 430 °C) da 75 a **93**: ora la limita la facilità (il forno è sotto i 485 °C ideali), non più il combustibile. Restano nel gruppo «Con condizioni» perché il motore segnala ancora che lo stile prevede legna o carbone (una condizione dell'esito, non del numero): il gruppo dipende dall'esito, come prima.
2. **D-062 riordina i pari merito.** Fra i quattro a 98 la Pala Romana (minimo 330 °C, margine 0,68) scivola dietro Baciata e Spaccata (270 °C, 0,83). Fra i diciannove a 97 salgono gli stili in teglia che chiedono poco forno (focacce, Chicago, Sfincione, Padellino, Trancio: margine 1,00, cioè il forno arriva al doppio del minimo o più) e scendono quelli che chiedono molto: Tonda Romana "Scrocchiarella" 5ª → 21ª (300 °C), Canotto 7ª → 22ª e Calzone 13ª → 23ª (400 °C), Pinsa 9ª → 19ª, New York 6ª → 17ª.

### P3 · Forno a legna 480 °C, livello 4

| Stile | Gruppo | Posizione D-E → ora | Punteggio D-E → ora | Margine |
|---|---|---|---|---|
| Teglia Romana | Fattibili | 1 → **1** | 98 → **98** | 0,96 |
| Pizza Baciata | Fattibili | 3 → **2** ▲ | 98 → **98** | 0,89 |
| Pizza Spaccata | Fattibili | 4 → **3** ▲ | 98 → **98** | 0,89 |
| Pala Romana | Fattibili | 2 → **4** ▼ | 98 → **98** | 0,73 |
| Focaccia Genovese | Fattibili | 8 → **5** ▲ | 97 → **97** | 1,00 |
| Chicago Deep Dish | Fattibili | 11 → **6** ▲ | 97 → **97** | 1,00 |
| Pizza al Padellino | Fattibili | 12 → **7** ▲ | 97 → **97** | 1,00 |
| Sfincione | Fattibili | 14 → **8** ▲ | 97 → **97** | 1,00 |
| Grandma Style | Fattibili | 15 → **9** ▲ | 97 → **97** | 1,00 |
| Ciaccino Senese | Fattibili | 17 → **10** ▲ | 97 → **97** | 1,00 |
| Trancio Milanese | Fattibili | 18 → **11** ▲ | 97 → **97** | 1,00 |
| Chicago Tavern Cut | Fattibili | 19 → **12** ▲ | 97 → **97** | 1,00 |
| Focaccia Barese | Fattibili | 20 → **13** ▲ | 97 → **97** | 1,00 |
| Fugazzeta Argentina | Fattibili | 22 → **14** ▲ | 97 → **97** | 1,00 |
| Greek Pan Pizza | Fattibili | 24 → **15** ▲ | 97 → **97** | 1,00 |
| Detroit Style | Fattibili | 10 → **16** ▼ | 97 → **97** | 0,96 |
| New York Style | Fattibili | 6 → **17** ▼ | 97 → **97** | 0,89 |
| Focaccia di Recco | Fattibili | 16 → **18** ▼ | 97 → **97** | 0,89 |
| Pinsa Romana | Fattibili | 9 → **19** ▼ | 97 → **97** | 0,86 |
| California Style | Fattibili | 23 → **20** ▲ | 97 → **97** | 0,86 |
| Tonda Romana "Scrocchiarella" | Fattibili | 5 → **21** ▼ | 97 → **97** | 0,80 |
| Pizza al Metro | Fattibili | 21 → **22** ▼ | 97 → **97** | 0,80 |
| Canotto Contemporanea | Fattibili | 7 → **23** ▼ | 97 → **97** | 0,60 |
| Calzone Napoletano | Fattibili | 13 → **24** ▼ | 97 → **97** | 0,60 |
| New Haven Apizza | Con condizioni | 26 → **25** ▲ | 75 → **97** | 0,71 |
| Napoletana STG | Con condizioni | 25 → **26** ▼ | 96 → **96** | 0,56 |
| Pizza Montanara | Fritte in pentola | 27 → **27** | 97 → **97** | 1,00 |
| Pizza Fritta | Fritte in pentola | 28 → **28** | 97 → **97** | 1,00 |
| Pizza Fritta Tonda | Fritte in pentola | 29 → **29** | 97 → **97** | 1,00 |

**Primi 5 con D-E:** Teglia Romana, Pala Romana, Pizza Baciata, Pizza Spaccata, Tonda Romana "Scrocchiarella".
**Primi 5 ora:** Teglia Romana, Pizza Baciata, Pizza Spaccata, Pala Romana, Focaccia Genovese.
**Entra nei primi 5:** Focaccia Genovese. **Esce:** Tonda Romana "Scrocchiarella".

**Lettura.** Lo spareggio muove i pari merito come con P2. Per D-063 conta solo New Haven: il forno a legna a 480 °C supera i 340 °C minimi, quindi il tetto del carbone non si applica più e sale da 75 a **97**; resta «Con condizioni» (il carbone resta una condizione dell'esito) e passa davanti alla Napoletana STG, che col forno a legna non aveva tetto e resta a 96. Pizza al Metro col forno a legna non aveva tetto: resta a 97 fra le fattibili e scende di un posto per lo spareggio (minimo 300 °C).

## Le classifiche con D-E, prima di D-062 e D-063

*Storico: la misura del 29/10/2026 prima delle due decisioni.*

▲ sale · ▼ scende · in **grassetto** il valore dopo il cambio.

### P1 · Forno di casa elettrico 250 °C, teglia, livello 2

| Stile | Gruppo | Posizione prima → dopo | Punteggio prima → dopo |
|---|---|---|---|
| Focaccia Genovese | Fattibili | 1 → **1** | 87 → **97** |
| Chicago Deep Dish | Fattibili | 8 → **2** ▲ | 85 → **97** |
| Pizza al Padellino | Fattibili | 2 → **3** ▼ | 87 → **97** |
| Sfincione | Fattibili | 9 → **4** ▲ | 84 → **97** |
| Grandma Style | Fattibili | 3 → **5** ▼ | 87 → **97** |
| Ciaccino Senese | Fattibili | 4 → **6** ▼ | 87 → **97** |
| Trancio Milanese | Fattibili | 7 → **7** | 86 → **97** |
| Focaccia Barese | Fattibili | 10 → **8** ▲ | 84 → **97** |
| Fugazzeta Argentina | Fattibili | 5 → **9** ▼ | 87 → **97** |
| Greek Pan Pizza | Fattibili | 6 → **10** ▼ | 87 → **97** |
| Chicago Tavern Cut | Con condizioni | 12 → **11** ▲ | 85 → **94** |
| Teglia Romana | Con condizioni | 11 → **12** ▼ | 85 → **91** |
| Detroit Style | Con condizioni | 14 → **13** ▲ | 81 → **91** |
| Pinsa Romana | Con condizioni | 13 → **14** ▼ | 84 → **87** |
| Pizza Montanara | Fritte in pentola | 15 → **15** | 87 → **97** |
| Pizza Fritta | Fritte in pentola | 16 → **16** | 87 → **97** |
| Pizza Fritta Tonda | Fritte in pentola | 17 → **17** | 87 → **97** |
| Focaccia di Recco | Non fattibili così | 18 → **18** | 39 → **39** |
| Pizza Baciata | Non fattibili così | 19 → **19** | 39 → **39** |
| Pizza Spaccata | Non fattibili così | 20 → **20** | 39 → **39** |
| Pizza al Metro | Non fattibili così | 21 → **21** | 39 → **39** |
| Tonda Romana "Scrocchiarella" | Non fattibili così | 22 → **22** | 39 → **39** |
| New York Style | Non fattibili così | 23 → **23** | 39 → **39** |
| Pala Romana | Non fattibili così | 24 → **24** | 39 → **39** |
| New Haven Apizza | Non fattibili così | 25 → **25** | 39 → **39** |
| California Style | Non fattibili così | 26 → **26** | 39 → **39** |
| Canotto Contemporanea | Non fattibili così | 27 → **27** | 37 → **37** |
| Calzone Napoletano | Non fattibili così | 28 → **28** | 35 → **35** |
| Napoletana STG | Non fattibili così | 29 → **29** | 25 → **25** |

**Primi 5 prima:** Focaccia Genovese, Pizza al Padellino, Grandma Style, Ciaccino Senese, Fugazzeta Argentina.  
**Primi 5 dopo:** Focaccia Genovese, Chicago Deep Dish, Pizza al Padellino, Sfincione, Grandma Style.  
**Entrano nei primi 5:** Chicago Deep Dish, Sfincione. **Escono:** Ciaccino Senese, Fugazzeta Argentina.

**Lettura.** Con il forno di casa i gruppi restano identici. Gli stili in teglia fattibili salgono tutti a 97 e si raggiungono: Chicago Deep Dish e Sfincione entrano nei primi 5 per l'ordine del catalogo, non perché siano diventati più adatti. Nel gruppo «Con condizioni» le distanze restano (Chicago Tavern Cut 94, Teglia Romana e Detroit 91, Pinsa 87): lì la facilità conta ancora. Gli stili non fattibili non si muovono (39 o meno).

### P2 · Forno da pizza elettrico 450 °C con pietra, livello 3

| Stile | Gruppo | Posizione prima → dopo | Punteggio prima → dopo |
|---|---|---|---|
| Teglia Romana | Fattibili | 4 → **1** ▲ | 88 → **98** |
| Pala Romana | Fattibili | 6 → **2** ▲ | 88 → **98** |
| Pizza Baciata | Fattibili | 11 → **3** ▲ | 87 → **98** |
| Pizza Spaccata | Fattibili | 13 → **4** ▲ | 87 → **98** |
| Tonda Romana "Scrocchiarella" | Fattibili | 1 → **5** ▼ | 91 → **97** |
| New York Style | Fattibili | 5 → **6** ▼ | 88 → **97** |
| Canotto Contemporanea | Fattibili | 2 → **7** ▼ | 90 → **97** |
| Focaccia Genovese | Fattibili | 8 → **8** | 87 → **97** |
| Pinsa Romana | Fattibili | 3 → **9** ▼ | 89 → **97** |
| Detroit Style | Fattibili | 20 → **10** ▲ | 84 → **97** |
| Chicago Deep Dish | Fattibili | 18 → **11** ▲ | 85 → **97** |
| Pizza al Padellino | Fattibili | 9 → **12** ▼ | 87 → **97** |
| Calzone Napoletano | Fattibili | 19 → **13** ▲ | 85 → **97** |
| Sfincione | Fattibili | 21 → **14** ▲ | 84 → **97** |
| Grandma Style | Fattibili | 10 → **15** ▼ | 87 → **97** |
| Focaccia di Recco | Fattibili | 23 → **16** ▲ | 79 → **97** |
| Ciaccino Senese | Fattibili | 12 → **17** ▼ | 87 → **97** |
| Trancio Milanese | Fattibili | 16 → **18** ▼ | 86 → **97** |
| Chicago Tavern Cut | Fattibili | 17 → **19** ▼ | 86 → **97** |
| Focaccia Barese | Fattibili | 22 → **20** ▲ | 84 → **97** |
| Fugazzeta Argentina | Fattibili | 14 → **21** ▼ | 87 → **97** |
| California Style | Fattibili | 7 → **22** ▼ | 88 → **97** |
| Greek Pan Pizza | Fattibili | 15 → **23** ▼ | 87 → **97** |
| Pizza al Metro | Con condizioni | 24 → **24** | 75 → **75** |
| New Haven Apizza | Con condizioni | 25 → **25** | 75 → **75** |
| Napoletana STG | Con condizioni | 26 → **26** | 75 → **75** |
| Pizza Montanara | Fritte in pentola | 27 → **27** | 87 → **97** |
| Pizza Fritta | Fritte in pentola | 28 → **28** | 87 → **97** |
| Pizza Fritta Tonda | Fritte in pentola | 29 → **29** | 87 → **97** |

**Primi 5 prima:** Tonda Romana "Scrocchiarella", Canotto Contemporanea, Pinsa Romana, Teglia Romana, New York Style.  
**Primi 5 dopo:** Teglia Romana, Pala Romana, Pizza Baciata, Pizza Spaccata, Tonda Romana "Scrocchiarella".  
**Entrano nei primi 5:** Pala Romana, Pizza Baciata, Pizza Spaccata. **Escono:** Canotto Contemporanea, Pinsa Romana, New York Style.

**Lettura.** Le romane in teglia e pala (Teglia, Pala, Baciata, Spaccata) arrivano a 98 e prendono i primi quattro posti; Scrocchiarella, Canotto e Pinsa restano a 97 e scivolano dietro. La Focaccia di Recco sale di 7 posti perché maturazione, sostenibilità e sperimentazione non la penalizzano più. Napoletana STG, New Haven e Pizza al Metro restano a 75 per il tetto del combustibile: prima erano 12 punti sotto gli altri, ora 22.

### P3 · Forno a legna 480 °C, livello 4

| Stile | Gruppo | Posizione prima → dopo | Punteggio prima → dopo |
|---|---|---|---|
| Teglia Romana | Fattibili | 4 → **1** ▲ | 88 → **98** |
| Pala Romana | Fattibili | 6 → **2** ▲ | 88 → **98** |
| Pizza Baciata | Fattibili | 11 → **3** ▲ | 87 → **98** |
| Pizza Spaccata | Fattibili | 13 → **4** ▲ | 87 → **98** |
| Tonda Romana "Scrocchiarella" | Fattibili | 1 → **5** ▼ | 91 → **97** |
| New York Style | Fattibili | 5 → **6** ▼ | 88 → **97** |
| Canotto Contemporanea | Fattibili | 2 → **7** ▼ | 90 → **97** |
| Focaccia Genovese | Fattibili | 8 → **8** | 87 → **97** |
| Pinsa Romana | Fattibili | 3 → **9** ▼ | 89 → **97** |
| Detroit Style | Fattibili | 21 → **10** ▲ | 84 → **97** |
| Chicago Deep Dish | Fattibili | 19 → **11** ▲ | 85 → **97** |
| Pizza al Padellino | Fattibili | 9 → **12** ▼ | 87 → **97** |
| Calzone Napoletano | Fattibili | 20 → **13** ▲ | 85 → **97** |
| Sfincione | Fattibili | 22 → **14** ▲ | 84 → **97** |
| Grandma Style | Fattibili | 10 → **15** ▼ | 87 → **97** |
| Focaccia di Recco | Fattibili | 24 → **16** ▲ | 79 → **97** |
| Ciaccino Senese | Fattibili | 12 → **17** ▼ | 87 → **97** |
| Trancio Milanese | Fattibili | 17 → **18** ▼ | 86 → **97** |
| Chicago Tavern Cut | Fattibili | 18 → **19** ▼ | 86 → **97** |
| Focaccia Barese | Fattibili | 23 → **20** ▲ | 84 → **97** |
| Pizza al Metro | Fattibili | 14 → **21** ▼ | 87 → **97** |
| Fugazzeta Argentina | Fattibili | 15 → **22** ▼ | 87 → **97** |
| California Style | Fattibili | 7 → **23** ▼ | 88 → **97** |
| Greek Pan Pizza | Fattibili | 16 → **24** ▼ | 87 → **97** |
| Napoletana STG | Con condizioni | 25 → **25** | 88 → **96** |
| New Haven Apizza | Con condizioni | 26 → **26** | 75 → **75** |
| Pizza Montanara | Fritte in pentola | 27 → **27** | 87 → **97** |
| Pizza Fritta | Fritte in pentola | 28 → **28** | 87 → **97** |
| Pizza Fritta Tonda | Fritte in pentola | 29 → **29** | 87 → **97** |

**Primi 5 prima:** Tonda Romana "Scrocchiarella", Canotto Contemporanea, Pinsa Romana, Teglia Romana, New York Style.  
**Primi 5 dopo:** Teglia Romana, Pala Romana, Pizza Baciata, Pizza Spaccata, Tonda Romana "Scrocchiarella".  
**Entrano nei primi 5:** Pala Romana, Pizza Baciata, Pizza Spaccata. **Escono:** Canotto Contemporanea, Pinsa Romana, New York Style.

**Lettura.** Quasi uguale a P2. Con il forno a legna la Napoletana STG sale da 88 a 96 ma resta nel gruppo «Con condizioni» (25ª): il forno a 480 °C è sotto i 485 °C ideali e la dispensa è da verificare, quindi il motore la tiene fra le ricette con condizioni. New Haven resta a 75 perché vuole il carbone.
