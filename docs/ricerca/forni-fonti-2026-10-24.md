# Forni per pizza domestici e semi-pro: dati con fonte (24/10/2026)

Ricerca per il catalogo forni dell'app. Ogni modello è assegnato a uno dei tipi
del motore: `wood` (legna, platea ~430–500 °C), `gas_pizza` (forno a gas
portatile, ~450–500 °C), `electric_high` (elettrico da pizza che arriva ad
almeno ~400 °C), `gas` (forno a gas a platea ~350 °C). I forni da cucina sono
esclusi. Tutte le pagine sono state lette il 24/10/2026.

Stati come in `docs/fonti-dati.md`, applicati al singolo valore:
**V** letto sulla pagina o sul manuale del produttore, **P** fonte secondaria
(rivenditore o recensione), **D** non trovato o incerto. «—» vuol dire che il
dato non è stato trovato.

Note di lettura:

- Quasi nessun produttore dice se la temperatura massima è dell'aria o della
  pietra. Dove non è scritto, la colonna lo indica come «non detto».
- Le pagine Ooni statunitensi danno spesso solo i °F. 950 °F è circa 510 °C;
  Ooni sulle altre pagine scrive 950 °F = 500 °C. Si usa 500 °C.
- «Preriscaldo» è il tempo dichiarato per arrivare alla temperatura di lavoro,
  non il tempo di cottura della pizza (60–90 s), che i produttori citano più
  spesso.

## Ooni

| Modello | Combustibile → tipo motore | T max | Pietra | Altezza interna / bocca | Ø pizza | Preriscaldo |
|---|---|---|---|---|---|---|
| Koda 12 (1ª gen.) | gas → `gas_pizza` | 500 °C, non detto se aria o pietra (V) | cordierite 10 mm (V); misure — (D) | — (D) | 12″ / 30 cm (V) | 15 min a 500 °C (V) |
| Koda 16 | gas → `gas_pizza` | 500 °C, non detto (V) | cordierite 15 mm (V); misure — (D) | — (D) | 16″ / 40 cm (V) | 20 min a 500 °C (V) |
| Koda 2 (14″) | gas → `gas_pizza` | 950 °F ≈ 500 °C (V) | cordierite 15 mm, piano «14″+» (V) | — (D) | 14″ / 35 cm (V) | — (D) |
| Koda 2 Pro (18″) | gas (propano o metano) → `gas_pizza` | 950 °F ≈ 500 °C; regolabile da 320 °F (V) | cordierite 20 mm, 21″ davanti e 18″ dietro (≈ 53/46 cm) (V) | — (D) | 18″ / 45 cm (V) | — (D) |
| Koda 2 Max (24″) | gas (propano o metano) → `gas_pizza` | 950 °F ≈ 500 °C; regolabile da 210 °F (V) | cordierite 20 mm, 24″ × 21″ (≈ 61 × 53 cm) (V) | — (D) | fino a 20″ / 50 cm, oppure 2 × 12″ (V) | — (D) |
| Karu 12 (1ª gen.) | legna o carbone, gas con bruciatore a parte → `wood` (alternativa `gas_pizza`) | 500 °C (V) | cordierite 15 mm (V); 34 × 34 cm (P) | — (D) | 12″ (V) | 15 min a 450 °C (V) |
| Karu 16 (1ª gen.) | legna o carbone, gas a parte → `wood` (alt. `gas_pizza`) | 500 °C (P) | cordierite 15 mm (P); piano ≈ 42 × 42 cm (P) | — (D) | 16″ (P) | 15 min (P) |
| Karu 2 (12″) | legna o carbone, gas a parte → `wood` (alt. `gas_pizza`) | 500 °C (V) | cordierite 15 mm (V); misure — (D) | — (D) | 12″ «e oltre» (V) | 15 min a 450 °C (V) |
| Karu 2 Pro (16″) | legna o carbone, gas a parte → `wood` (alt. `gas_pizza`) | 500 °C (V) | cordierite 15 mm, piano largo 17″ / 43 cm (V) | interna 5,7″ / 14,5 cm; un'altra scheda sulla stessa pagina dice 5,4″ (V, incoerente) | 16″ (V) | 15 min a 500 °C (V) |
| Fyra 12 | pellet di legno → `wood` | 500 °C (V) | cordierite 10 mm (V); misure — (D) | — (D) | 12″ (V) | 15 min a 500 °C (V) |
| Volt 12 (1ª gen.) | elettrico → `electric_high` | 450 °C (V) | cordierite 13″ × 13″ (≈ 33 × 33 cm) (V); 10 mm (P) | — (D) | — (D); la pietra indica ~12″ | 20 min a 450 °C (V) |
| Volt 2 | elettrico 1600 W → `electric_high` | 850 °F ≈ 454 °C (V) | cordierite 10 mm (V); misure — (D) | bocca 3,6″ / 9,1 cm (V) | 12″ (V) | 12 min (V; la pagina cita anche «90 secondi», che è il tempo di cottura) |

Note Ooni:
- La pagina del Karu 16 ora rimanda al Karu 2 Pro: i dati del Karu 16 di prima
  generazione vengono da rivenditori e recensioni (P).
- La pagina panoramica del Koda 2 Max scrive «950 °C»: è un refuso, sulla
  pagina prodotto il valore è 950 °F.
- Una recensione del Volt 12 (AmazingRibs) misura la pietra più fredda
  dell'impostazione dopo 15–25 min: per i forni elettrici la temperatura
  dichiarata non coincide necessariamente con quella della pietra.

## Gozney

| Modello | Combustibile → tipo motore | T max | Platea | Altezza interna / bocca | Ø pizza | Preriscaldo |
|---|---|---|---|---|---|---|
| Roccbox | propano di serie, bruciatore a legna opzionale → `gas_pizza` (alt. `wood`) | 500 °C, non detto se aria o pietra (V) | pietra a doppio strato (V); materiale, spessore e misure — (D) | — (D) | 12″ (V) | 20 min a 370 °C (V) |
| Dome (Gen 2) | ibrido: propano integrato, legna e carbone → `gas_pizza` (alt. `wood`) | 500 °C (V); il display mostra aria e pietra, ma il massimo non è attribuito a nessuna delle due | cordierite 30 mm; camera 60,4 × 49,8 cm (V) | bocca 13,3 cm (V); altezza interna data come 22,6 cm in un punto e 53,1 cm in un altro (V, incoerente; 22,6 è il valore plausibile) | 16″, oppure 2 × 10″ (V) | — (D); le FAQ generiche dicono 20–40 min secondo il modello (V) |
| Dome S1 | solo propano → `gas_pizza` | 500 °C (P) | pietra 30 mm a doppio strato (P); camera ≈ 55 × 47 cm (P) | interna ≈ 7,5″ / 19 cm (P) | 16″ (P) | — (D) |
| Arc | propano → `gas_pizza` | 500 °C, non detto (V) | cordierite 20 mm; camera 37,7 × 46,2 cm (V) | interna 17,3 cm; bocca 9,5 cm (V) | 14″ / 35 cm (V) | — (D); «in pochi minuti» (V) |
| Arc XL | propano → `gas_pizza` | 500 °C, non detto (V) | cordierite 20 mm; camera 42,7 × 51,7 cm (V) | interna 17,3 cm; bocca 9,5 cm (V) | 16″ / 40 cm (V) | — (D) |
| Arc Lite | propano → `gas_pizza` | 500 °C (V) | — (D) | — (D) | 12″ (V) | — (D) |
| Tread | propano → `gas_pizza` | 500 °C (V) | cordierite 12 mm; camera 31 × 38 cm (V) | interna 15 cm; bocca 8,5 cm (V) | 12″ / 30 cm (V) | 15 min a 500 °C (V) |

Note Gozney:
- La pagina del Dome S1 è stata ritirata e rimanda all'elenco dei forni: i
  dati vengono da recensioni e rivenditori. Una recensione (T3) parla di
  pietra 22″ × 18″, che non coincide con le misure interne: non usata.
- Il Dome di prima generazione non ha più una pagina; un rivenditore riporta
  gli stessi valori del Gen 2 (500 °C, 30 mm, 16″) (P).

## Effeuno

| Modello | Tipo motore | T max | Pietra / camera | Altezza camera | Ø pizza | Preriscaldo |
|---|---|---|---|---|---|---|
| P134H 509 PRO | elettrico 3,0 kW → `electric_high` | 509 °C (V); il testo dice anche «500 °C» | camera 35 × 40 cm (V); pietra refrattaria 35 × 40 cm, spessore 8 mm (V, pagina ricambio) | 9 cm (V) | 34 cm (V) | 17 min (V) |
| P134HA 509 PRO | elettrico 3,2 kW → `electric_high` | 509 °C (V) | camera 35 × 40 cm, pietra come sopra (V) | 16,8 cm (V) | 34 cm (V) | 29 min (V) |
| P234H 509 PRO | elettrico 3,4 kW, due camere → `electric_high` | 509 °C (V) | due camere 35 × 40 cm, due pietre (V) | 6,5 cm per camera (V) | 34 cm (V) | 33 min (V) |
| N3 | elettrico, sola resistenza superiore → `electric_high` | 500 °C (V) | 35 × 40 cm, dal titolo del ricondizionato (V) | — (D) | — (D) | — (D) |
| P134GE | elettrico, controllo PID → `electric_high` | 550 °C (V) | — (D) | — (D) | — (D) | — (D) |

Note Effeuno:
- Nessuna pagina dice se 509 °C è la temperatura dell'aria o della pietra;
  P134H e P134HA hanno due termostati separati, uno per la volta e uno per la
  platea.
- L'ordine delle tre misure della camera non è etichettato; il pezzo di
  ricambio «Pietra Refrattaria 35 × 40, H 8 mm» è dichiarato compatibile con
  P134H, P134HA e P234H dal 2015.
- La sigla «509E Extra Power» (P134H e P134HA) è una variante con controllo
  elettronico; la pagina dichiara il preriscaldo «ridotto del 16 %» senza un
  numero assoluto (D).

## G3 Ferrari

| Modello | Tipo motore | T max | Pietra | Altezza | Ø pizza | Preriscaldo |
|---|---|---|---|---|---|---|
| Delizia (G10006) | elettrico 1200 W → `electric_high` (al limite) | termostato fino a 400 °C (V) | refrattaria Ø 31 cm (V); il ricambio in cordierite è dato «fino a 700 °C» (V) | — (D) | — (D); pala in dotazione Ø 28 cm (V); 28–30 cm (P) | — (D); «cuoce a 400° in 5 minuti» è la cottura |

Nota: sulla stessa categoria G3 Ferrari dichiara il «Pizza PRO 2 minuti» a
450 °C con controllo separato sopra e sotto (V), senza misure.

## Sage / Breville

| Modello | Tipo motore | T max | Pietra | Altezza | Ø pizza | Preriscaldo |
|---|---|---|---|---|---|---|
| the Smart Oven Pizzaiolo (SPZ820 / BPZ820) | elettrico 1735–2065 W → `electric_high` | 400 °C di platea («deck temp»), con impostazione separata della volta (V, manuale) | pietra mobile («stone deck») (V); cordierite (P); misure — (D) | — (D) | 30 cm (P); il manuale fa stendere la pizza a 25–30 cm (V) | 10–20 min secondo il programma (V) |

## Witt

| Modello | Combustibile → tipo motore | T max | Pietra | Altezza | Ø pizza | Preriscaldo |
|---|---|---|---|---|---|---|
| ETNA Rotante 16″ | gas 9,2 kW (8,5 + 0,7 sotto la pietra) → `gas_pizza` | 500 °C (P) | rotante, Ø 40,5 cm (V); spessore 16 mm (P) | — (D) | 16″ (V) | 15 min (V) |
| Piccolo Rotante 16″ | gas 7,0 kW → `gas_pizza` | 500 °C (V) | cordierite rotante Ø 40,5 cm, 15 mm (V) | — (D) | 16″ (V) | 15 min (V) |
| Piccolo Rotante 13″ | gas 5,2 kW → `gas_pizza` | 500 °C (P) | rotante Ø 33 cm (P) | — (D) | 13″ / 33 cm (P) | 15 min (P) |
| eGNITE Control 13″ | elettrico 2,42 kW → `electric_high` | 460 °C (V) | cordierite fissa Ø 33 cm, 10 mm (V) | — (D) | 13″ (V, dal nome) | 11 min a 400 °C (V) |

Il «Piccolo» senza altro nome corrisponde a più modelli (Rotante 13″, Rotante
16″, Fermo 14″ a pietra fissa): per il Fermo 14″ non sono stati trovati dati
del produttore.

## Clementi

| Modello | Combustibile → tipo motore | T max | Platea | Altezza | Pizze | Preriscaldo |
|---|---|---|---|---|---|---|
| Gold (legna) | legna → `wood` | 500 °C (V) | refrattario alimentare; 60 × 60, 80 × 60 o 100 × 80 cm (V) | — (D) | 2, 4 o 5 pizze per infornata, nell'ordine delle misure (V, l'abbinamento è implicito) | 400 °C in 20–25 min (V) |

## Alfa Forni

| Modello | Combustibile → tipo motore | T max | Platea | Altezza | Pizze | Preriscaldo |
|---|---|---|---|---|---|---|
| Moderno 1 Pizza gas | GPL o metano, 8 kW → `gas_pizza` (vedi nota) | 500 °C (V) | 50 × 40 cm (V); mattoni refrattari (D per questo modello) | — (D) | 1 (V) | 30 min (V) |
| Moderno 1 Pizza legna | legna → `wood` | 500 °C (V) | 60 × 40 cm (V) | — (D) | 1 (V) | 30 min (V) |
| Moderno 2 Pizze gas / legna | gas → `gas_pizza`; legna → `wood` | 500 °C (V) | gas 60 × 50 cm, legna 70 × 50 cm (V) | — (D) | 2 (V) | 30 min (V) |
| Nano | legna o propano (due versioni) → `wood` o `gas_pizza` | 500 °C (P) | gas ≈ 50 × 40 cm, legna ≈ 60 × 40 cm, mattoni ~3 cm (P; le fonti non concordano) | — (D) | — (D) | 10 o 30 min secondo la fonte (D) |

Nota: i forni Alfa a gas sono a cupola e arrivano a 500 °C, quindi non
corrispondono al tipo `gas` del motore (~350 °C). La pagina di supporto Alfa
dà 500 °C e 30 min come valori comuni a tutta la gamma, non per singolo
modello. Nessuna pagina ufficiale del Nano trovata.

## Solo Stove

| Modello | Combustibile → tipo motore | T max | Pietra | Bocca | Ø pizza | Preriscaldo |
|---|---|---|---|---|---|---|
| Pi | legna; bruciatore a gas a parte → `wood` (alt. `gas_pizza`) | 850 °F ≈ 455 °C (P) | cordierite 13 mm (P) | — (D) | 12″ (P) | ~18 min a 800 °F, misurato (P) |
| Pi Prime | solo gas → `gas_pizza` | «oltre 950 °F» ≈ 510 °C, dichiarazione dell'azienda riportata da Engadget (P) | cordierite 13 mm, in due pezzi (P) | 13″ × 3,5″ (≈ 33 × 9 cm) (P) | 12″ (P) | 15 min (P) |

Il sito Solo Stove blocca la lettura automatica (HTTP 403): tutti i valori sono
di fonti secondarie.

## Ninja

| Modello | Tipo motore | T max | Piastra | Altezza | Ø pizza | Preriscaldo |
|---|---|---|---|---|---|---|
| Woodfire Outdoor Oven (OO101) | elettrico, con pellet solo per l'aroma → nessuno dei quattro tipi va bene (vedi nota) | 370 °C / 700 °F (P) | pietra 30 × 30 cm (P) | — (D) | 12″ (P) | ~25 min a 700 °F, misurato (P) |

Nota: a 370 °C il Ninja resta sotto la soglia di `electric_high` (~400 °C) e
non è un forno a gas. Per temperatura è vicino a `gas` (~350 °C): da decidere
se mapparlo lì o aggiungere un tipo. I siti Ninja e AO rispondono 403; i
valori vengono dagli estratti di ricerca di AO, Best Buy e Kohl's.

## Bertello

| Modello | Combustibile → tipo motore | T max | Pietra | Altezza | Ø pizza | Preriscaldo |
|---|---|---|---|---|---|---|
| SimulFIRE 12″ | propano e legna/carbone/pellet anche insieme → `gas_pizza` (alt. `wood`) | «oltre 900 °F» ≈ 480 °C (V); 930 °F nelle recensioni (P) | cordierite 15 mm; piano 34 × 31,4 cm (V) | — (D) | 12″ (V, dalla pietra e dalla pala) | meno di 20 min a 900 °F con il gas (V) |
| SimulFIRE Grande 16″ (rotante) | come sopra → `gas_pizza` | «oltre 900 °F» (V, valore comune alla gamma) | cordierite 15 mm (V); misure — (D) | — (D) | 16″ (V, dal nome) | — (D) |

## Non trovati o esclusi

- **Spidocchio**: nessuna pagina del produttore, scheda o recensione trovata
  con questo nome. Va verificato il nome esatto prima di inserirlo.
- **Cuisinart**: escluso. Il «3-in-1 Pizza Oven Plus» ha dati discordi tra
  rivenditori (da «oltre 510 °F» a «oltre 800 °F», pietra 13″) e nessuna
  scheda del produttore è stata letta; il CPO-700 è un kit da appoggiare sul
  barbecue, non un forno.
- **Ooni Koda 2 Pro / Koda 2 Max**: esistono entrambi, inseriti sopra.
  «Volt 2» esiste ed è l'unico Volt ora in vendita negli USA.

## Fonti

Nel registro del codice (`src/app/data/science-sources.ts`, FW-01) queste fonti
sono raggruppate per produttore (`ooni-2026`, `gozney-2026`, `effeuno-2026`…) e
le secondarie in `ovens-secondary-2026`; lo stato del singolo modello resta il
campo `source` di `oven-models.ts` (V, P, oppure `demo` per i marchi inventati).

Produttori (lette il 24/10/2026):

- Ooni Koda 12: https://ooni.com/products/ooni-koda
- Ooni Koda 16: https://ooni.com/products/ooni-koda-16
- Ooni Koda 2: https://ooni.com/products/ooni-koda-2
- Ooni Koda 2 Pro: https://ooni.com/products/ooni-koda-2-pro
- Ooni Koda 2 Max: https://ooni.com/products/ooni-koda-2-max e https://ooni.com/pages/ooni-koda-2-max
- Ooni Karu 12: https://ooni.com/products/ooni-karu-12
- Ooni Karu 2: https://ooni.com/products/ooni-karu-2
- Ooni Karu 2 Pro (indirizzo del vecchio Karu 16): https://ooni.com/products/ooni-karu-16
- Ooni Fyra 12: https://uk.ooni.com/pages/explore-fyra-12
- Ooni Volt 12: https://ca.ooni.com/blogs/ooni-insights/get-to-know-ooni-volt-12
- Ooni Volt 2: https://ooni.com/products/ooni-volt
- Elenco forni Ooni: https://ca.ooni.com/products/ooni-fyra (pagina di categoria)
- Gozney Roccbox: https://www.gozney.com/products/roccbox
- Gozney Dome (Gen 2): https://www.gozney.com/products/dome-gen-2
- Gozney Arc: https://www.gozney.com/products/arc
- Gozney Arc XL: https://www.gozney.com/products/arc-xl
- Gozney Tread: https://www.gozney.com/products/tread
- Gozney, elenco forni e FAQ (Arc Lite, tempi di preriscaldo): https://www.gozney.com/collections/pizza-ovens
- Effeuno P134H 509 PRO: https://www.effeuno.biz/products/p134h-509-pro-forno-elettrico-per-pizza-fino-a-509c
- Effeuno P134HA 509 PRO: https://www.effeuno.biz/products/p134ha-509-pro-forno-elettrico-per-pizza-e-pane-fino-a-509c
- Effeuno P234H 509 PRO: https://www.effeuno.biz/products/p234h-509-pro-forno-elettrico-per-2-pizze-fino-a-509c
- Effeuno, catalogo prodotti (N3, P134GE, P134H 509E, pietra di ricambio 35 × 40): https://www.effeuno.biz/products.json e https://www.effeuno.biz/products/pietra-refrattaria-35-x40
- G3 Ferrari Delizia: https://www.g3ferrari.net/elettrodomestici-per-la-cottura/forni-pizza/delizia-red/
- G3 Ferrari, categoria forni pizza: https://www.g3ferrari.net/elettrodomestici-per-la-cottura/forni-pizza/
- Sage, manuale the Smart Oven Pizzaiolo BPZ820/SPZ820: https://assets.sageappliances.com/BPZ820/SPZ820_EU_UG6_H20_WEB.pdf
- Witt ETNA Rotante 16″, scheda di vendita: https://witt.kontainer.com/cdn/W91uhV4Zl20v/wittpizza-sellsheets-eu-metrics-etna-rotante-16.pdf
- Witt Piccolo Rotante 16″ EU: https://b2b.witt.dk/en/item/100000310
- Witt eGNITE Control 13″ EU: https://b2b.witt.dk/en/item/100002514
- Clementi Gold legna: https://clementicompany.com/prodotto/gold-legna/
- Alfa Forni, caratteristiche dei forni: https://help.alfaforni.com/en/en/quali-sono-le-caratteristiche-dei-forni-alfa
- Bertello SimulFIRE 12″: https://bertello.com/products/bertello-12-outdoor-pizza-oven-everything-bundle2
- Bertello, gamma: https://bertello.com/

Fonti secondarie:

- Ooni Karu 12, misura della pietra: https://www.choice.com.au/products/outdoor/outdoor-entertaining/barbecues/ooni-karu-12-multi-fuel-pizza-oven
- Ooni Karu 16: https://www.techadvisor.com/review/ooni-karu-16-3814922/ e https://www.windyridgegardencentre.ie/products/ooni-karu-16-multi-fuel-pizza-oven
- Ooni Volt 12, spessore pietra e misura reale: https://cookswarehouse.com/products/ooni-volt-12-electric-pizza-oven e https://amazingribs.com/ratings_reviews/ooni-volt-12-electric-pizza-oven-reviewed-and-rated/
- Gozney Dome S1: https://www.bbqguys.com/i/3185239/gozney/dome-s1-propane-pizza-oven-bone-gspbnus1623 e https://www.homesandgardens.com/shopping/gozney-dome-s1-review
- Gozney Dome prima generazione: https://www.chefsupplies.ca/products/gozney-dome-gen-2-outdoor-pizza-oven-bone-propane-gmpbnus1625
- G3 Ferrari Delizia, diametro pizza: https://www.qualescegliere.it/forno-per-pizza-elettrico/g3-ferrari-g10006-delizia/
- Sage Pizzaiolo, pietra e diametro: https://www.harveynorman.co.uk/products/sage-smart-oven-pizzaiolo-spz820bss4geu1 e https://www.galaxus.ch/en/s4/product/sage-pizzaiolo-pizza-oven-13596996
- Witt ETNA Rotante e Piccolo Rotante 13″: https://www.grillfuerst.de/Witt/Pizzaofen/Piccolo/Gas-Pizzaofen-Piccolo-Rotante-13-Zoll-matt-schwarz.php, https://www.galaxus.de/en/s4/product/etna-rotante-gas-pizza-oven-pizza-oven-68361416, https://ambiente.messefrankfurt.com/frankfurt/en/exhibitor-search.detail.html/witt-denmark-as/mf_1_0051251634_4816694_10000001202601.html
- Alfa Nano: https://www.bbqguys.com/alfa/nano-gas-pizza-oven-fxone-gram-u, https://tomsguide.com/reviews/alfa-nano, https://www.trovaprezzi.it/barbecues-fornelli/prezzi-scheda-prodotto/alfa_forni_nano
- Solo Stove Pi e Pi Prime: https://www.tomsguide.com/reviews/solo-pi, https://www.gearpatrol.com/?p=16832, https://www.engadget.com/solo-stove-introduces-a-349-gas-only-version-of-its-pi-pizza-oven-190017019.html, https://www.fieldandstream.com/gear/solo-stove-pi-prime-pizza-oven-review/, https://www.dillards.com/p/solo-stove-pi-prime-pizza-oven/517550265
- Ninja Woodfire OO101: https://ao.com/product/oo101uk-ninja-woodfire-outdoor-pizza-oven-brown-99357-685.aspx, https://www.bestbuy.com/site/product/6548901.p, https://www.myhouseofpizza.com/ninja-woodfire-pizza-oven-review/
- Bertello, 930 °F: https://www.tomsguide.com/reviews/bertello-outdoor-pizza-oven
- Cuisinart (escluso): https://www.wayfair.com/-/pdp/-DVZJ2542.html, https://www.ebay.com/p/28054506015
