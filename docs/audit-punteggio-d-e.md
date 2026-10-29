# D-E · Che cosa cambia nella classifica degli stili

*Audit UX e scienza, pacchetto FW-06 · 29 ottobre 2026 · da leggere prima di unire la PR.*

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
dentro ogni gruppo dal punteggio più alto. A parità di punteggio l'ordine è
quello del catalogo. Lo script è `scripts/measure-score-d-e.ts` (si rilancia
con `npx vite-node scripts/measure-score-d-e.ts`).

- **P1** · forno di casa elettrico a 250 °C, teglia, livello 2 (Intermedio)
- **P2** · forno da pizza elettrico a 450 °C con pietra, livello 3 (Avanzato)
- **P3** · forno a legna a 480 °C, livello 4 (Esperto)

## In breve, per chi non ha tempo

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

## Le domande per Matteo

- **Pari merito.** Con il nuovo numero molti stili hanno lo stesso punteggio.
  Vogliamo un criterio di spareggio dichiarato (per esempio la maturazione
  stimata, o l'ordine editoriale «stili iconici prima»), oppure va bene l'ordine
  del catalogo?
- **Napoletana con forno da pizza non a legna.** Con P2 resta a 75 e, rispetto
  agli altri a 97, sembra ancora più penalizzata. Il tetto di 75 è una scelta
  editoriale (nota «Tetto di autenticità per il combustibile»): ora la card la
  dice («limitata da: fedeltà allo stile»), ma il valore resta da confermare.

## Le classifiche, stile per stile

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
