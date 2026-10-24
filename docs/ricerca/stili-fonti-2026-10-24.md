# C-2 — Ricerca fonti: pizza al metro e parametri di teglia, tonda, New York, Detroit

- **Data della verifica:** 24/10/2026. Data d'accesso per tutte le fonti: 24/10/2026.
- **Chi:** ricerca di un agente AI. Nessun file del repository è stato modificato.
- **Righe:** `src/app/domain/styles-db.ts` al 24/10/2026. Le righe sono state contate di nuovo e in parte non coincidono con quelle di `docs/fonti-dati.md` §1.4, perché il file è cambiato.
- **Stati:** gli stessi di `docs/fonti-dati.md` §1. «Verificato» compare solo quando ho aperto e letto la fonte che riporta il dato. Le fonti che ho visto solo negli estratti di un motore di ricerca, senza poterle aprire, sono segnate come **non aperta** e non bastano per «verificato».
- **Fonti non raggiungibili:** gamberorosso.it (403), seriouseats.com (402/bloccato), pizzatoday.com (403), pizzamaking.com (403), web.archive.org (connessione interrotta). Per questo mancano i testi di Kenji López-Alt su Serious Eats e quelli di Tony Gemignani: il libro *The Pizza Bible* non è consultabile online e ne ho trovato solo trascrizioni su forum, che non ho potuto aprire.
- Nelle note, **Fatto** è ciò che dice la fonte, **Lettura** è un'interpretazione mia, **Conto** è un calcolo mio sui numeri della fonte.

---

## A) Pizza al metro (`pizza_al_metro`, `styles-db.ts:1309–1358`)

### A.1 Origine

| Fatto | Fonte | Stato | Nota |
|---|---|---|---|
| Inventore: Luigi Dell'Amura, detto Gigino | pizzametro.it s.d.; Fucito 2017; Becchi 2023; Scatti di Gusto 2017 | **verificato** | Concordano tutte. |
| Luogo: Vico Equense; il locale storico è in corso/via Giovanni Nicotera 15, nato da un'antica panetteria di famiglia | pizzametro.it s.d.; Becchi 2023; Dirindin 2023 | **verificato** | |
| Epoca: «anni '30» | pizzametro.it s.d. («La pizza a metro è nata negli anni '30»); Scatti di Gusto 2017 («negli anni Trenta»); Becchi 2023 («it all started here in 1930») | **verificato** (anni '30) | Il sito del locale è la fonte primaria per la data. |
| Epoca: «anni '20» | Fucito 2017 | **errato** secondo il sito del locale | Data isolata. |
| Epoca: «1959» | Dirindin 2023 (gli eredi: Gigino avrebbe iniziato a fare la pizza a metro nel 1959) | **da verificare** | È in contrasto con il sito degli stessi eredi (anni '30). |
| Brevetto: 1960 | pizzametro.it s.d. | **verificato** (dichiarazione del locale) | Non ho trovato il numero del brevetto. |
| L'ipotesi «anni '50» del brief | — | **nessuna fonte trovata** | Nessuna fonte dice anni '50. Il codice non riporta una data. Proposta per i testi CMS: «anni '30 (brevetto 1960)», attribuendolo al locale. |

### A.2 Testi di regole

| Fatto | Fonte | Stato | Nota |
|---|---|---|---|
| Il marchio «pizza a metro» dell'Università della Pizza (famiglia Dell'Amura) è iscritto nel Registro speciale dei marchi storici di interesse nazionale (MIMIT) | Becchi 2023 | **verificato** (fonte secondaria) | Becchi 2023 non dà la data d'iscrizione. Non ho aperto il registro UIBM. Un marchio non è un disciplinare: non fissa parametri tecnici. |
| Il Comune di Vico Equense ha avviato una De.Co. e l'iniziativa «Vico al Metro». Gli eredi la contestano: la De.Co. «identificherà, se mai, una pizza vicana», non la loro | Dirindin 2023 | **verificato** | |
| La De.Co. è stata ottenuta col marchio «PizzaDiVico», con un disciplinare: «cotta in forno a legna, ha forma ovoidale», lunga «tra mezzo metro e due metri» | Gambero Rosso 2025 («Le forme della pizza») | **da verificare** (fonte non aperta: 403) | Visto solo negli estratti di ricerca. Non ho trovato il testo del disciplinare De.Co. né la delibera comunale. È la fonte da recuperare (albo pretorio del Comune). |
| Nel 2017 il disciplinare della «Pizza di Vico Equense» era ancora da scrivere | Scatti di Gusto 2017 | **verificato** | |

**Lettura:** oggi lo stile non ha un testo di regole consultabile. Se il disciplinare De.Co. «PizzaDiVico» esiste, regola la pizza *vicana* in generale, non la ricetta di Gigino, e gli eredi lo dicono in modo esplicito (Dirindin 2023). Per la regola 2 delle linee guida i parametri canonici resterebbero quindi senza disciplinare, a meno di recuperare il testo De.Co.

### A.3 Formato, impasto, forno

| Dato | Codice | Fonte | Stato | Proposta |
|---|---|---|---|---|
| Lunghezza | 70 cm (`:1329`) | Fucito 2017: «larga trenta centimetri e lunga un metro». Gigino, menù 2026: prezzi per «un metro di pizza». Scatti di Gusto 2017: si preparano ancora pizze «di circa 2 mt». GR 2025 (non aperta): da mezzo metro a 2 m | **errato** | 100 cm (l'unità di vendita è il metro) |
| Larghezza | 30 cm (`:1330`) | Fucito 2017: 30 cm | **verificato** | — |
| Forma | `rectangular` | Fucito 2017 e Dirindin 2023 (eredi): rettangolare. GR 2025 (non aperta), sulla pizza vicana De.Co.: «ovoidale» | **verificato** (Gigino) | Lasciare rettangolare. Nella scheda va detto che la De.Co. vicana parla di forma ovoidale. |
| Forno | `electric_high` (`:1333`), `requires_wood_oven: false` (`:1340`) | Fucito 2017: «tre forni a legna grandi quanto un'intera parete». Scatti di Gusto 2017: «capienti forni a legna». Summer in Italy s.d.: «wood-oven baked» | **errato** | Forno a legna. `requires_wood_oven`: decidere tra `true` e un consiglio non vincolante. |
| Temperatura | 300–380 °C, ideale 340 (`:1334–1335`) | Scatti di Gusto 2017: cottura «a temperatura più mite e prolungata» (senza numeri) | **da verificare** | Nessuna fonte dà gradi. |
| Tempo di cottura | 240–360 s (`:1336–1337`) | Nessuna fonte con i secondi | **da verificare** | — |
| Farina | W 260–320 (`:1315`) | Fucito 2017: «farina 00», senza W | **da verificare** (W) | — |
| Idratazione | 62–70% (`:1317`) | Fucito 2017: «alta idratazione (70%)». Scatti di Gusto 2017: impasto «spesso ad alta idratazione» | **verificato** (70% è nel range) | Valutare 65–72 se si vuole centrare il dato di Gigino. È una scelta, non una fonte. |
| Lievitazione | 12–36 h (`:1322`) | Fucito 2017: «sei ore di lievitazione» | **errato** | 6 h è l'unico dato pubblicato, da un solo articolo. Proposta: range che parte da 6 h, per esempio 6–12. L'estremo alto è una scelta mia. |
| Panetto | 700 g (`:1327`) | Fucito 2017: panetti «da circa 700 grammi», «assemblati insieme» per le pizze da un metro in su | **plausibile** | La fonte non dice quanti panetti servono per un metro. Se la lunghezza passa a 100 cm, il peso per unità resta **da verificare**. |
| Sale, olio | 2,5% / 1,0% (`:1318–1319`) | Nessuna fonte | **da verificare** | — |
| Porzioni | 4–6 (`:1346`) | Gigino, menù 2026: «un metro di pizza può soddisfare fino a 5 persone» | **errato** (di poco) | 4–5 |
| «Più gusti sulla stessa base» (caratteristica e testi CMS) | — | Summer in Italy s.d. (guida turistica, senza autore): pizza originale «with various toppings along the length of it, chosen by the patrons». Il menù 2026 di Gigino ha un prezzo al metro *per gusto* e non parla di gusti misti | **da verificare** | Una guida turistica non basta. Da chiedere al locale. |

### A.4 Condimenti delle pizzerie d'origine

**Università della Pizza da Gigino, menù 2026** (fonte primaria: menù online linkato dal sito pizzametro.it). Tutti i prezzi sono per un metro.

| Pizza al metro (menù) | Ingredienti dichiarati | Prezzo/m | C'è nel catalogo di Vulcan assegnato allo stile? |
|---|---|---|---|
| Marinara classica | — | 30 € | sì, `marinara_avpn` |
| Margherita classica | — | 36 € | sì, `margherita_napoletana_avpn` |
| Nerano | mozzarella, zucchine stufate e croccanti, veli di provolone, basilico | 39 € | sì, `nerano_napoletana` |
| Marinara con scarole | — | 38 € | **no** |
| Mediterranea | scarole, capperi, olive, parmigiano | 38 € | **no** |
| Pizza ragù | ragù, polpettine, ciuffetti di ricotta | 42 € | **no** |
| Tropeana | cipolla, pancetta, mozzarella | 39 € | **no** |
| Broccoli e salsiccia | — | 39 € | in parte: c'è `salsiccia_friarielli_napoletana` |
| Margherita con salsiccia / con patate | — | 39 € / 38 € | **no** |
| Bufalina | bufala, pomodorini, basilico | 39 € | **no** |
| Luna caprese / Caprese | pomodoro di Sorrento, bufala, pomodoro secco, basilico / focaccia con pomodoro di Sorrento e mozzarella a crudo | 40 € | **no** |
| Puttanesca | — | 38 € | **no** |
| Italia unita | crudo, provola, rucola, grana | 42 € | **no** |
| Diavola, Capricciosa, Cacio e pepe | — | 38–39 € / 36 € | sì (`diavola_napoletana`, `capricciosa_napoletana`, `cacio_e_pepe_crema`) |
| 4 formaggi e più | 4 formaggi, olive condite, tarallo alle mandorle | 39 € | in parte: `quattro_formaggi_napoletana` |
| Ripieno scarole, provola e salsiccia; ripieno ricotta, salame e mozzarella | — | 38 € | **no** |
| Contadina | melanzane arrostite, salame piccante, mozzarella, provolone del Monaco | 42 € | **no** |
| Altre | bacon e carciofini, würstel e patatine, croccopizza, limone e pistacchio, più 10 «pizze estate 2026» | — | **no** |

Nel catalogo attuale sono assegnati allo stile anche boscaiola, quattro stagioni, ortolana, cosacca, provola e pepe e nduja, che **non compaiono** nel menù di Gigino.

**Classici citati dalla stampa:**
- Gigino: «Margherita, Nerano, and Marinara with escarole» (Becchi 2023); «marinara con scarole» e «mediterranea» (Scatti di Gusto 2017). Fucito 2017 vede in preparazione «pomodori, fiordilatte, cipolle, scarole, acciughe e capperi».
- Altre pizzerie vicane, sempre Becchi 2023: Cerasè (margherita, scarola con pomodorini; i condimenti cambiano con le stagioni), Pizzeria Castellano (fiori di zucca e mozzarella, mortadella con scorza di limone, pomodorini spaccati e peperoncino), Al Buco (pesce fresco).

**Lettura per C-2:**
- I classici con più fonti sono **margherita, marinara con scarole e Nerano**: tre fonti diverse per la scarola (Becchi 2023, Scatti di Gusto 2017, menù 2026).
- La «marinara con scarole» e la «mediterranea» (scarole, capperi, olive) sono i condimenti più legati al locale e mancano dal catalogo.
- Il predefinito oggi è `margherita` in `styles-db.ts:1357` e `margherita_napoletana_avpn` nella tabella delle linee guida: i due valori non coincidono e va controllato quale vale.

---

## B) Fonti dei parametri

### B.1 Teglia romana (`teglia_romana`, `styles-db.ts:164–209`)

**Testo di regole:** sì. È il *Disciplinare di produzione della «Autentica pizza in teglia alla romana ad alta idratazione»* della **Confraternita della Pizza** (Confraternita 2016), approvato alla VI Convention, Igea Marina, 27–29/05/2016.
- **Fatto:** l'associazione è nata da un forum di appassionati, non di produttori.
- **Fatto:** il commento del codice lo chiama «Disciplinare APITER». Il nome è sbagliato: APITER non compare nel documento.
- **Fatto:** per l'origine il disciplinare dice anni '80 e '90, «grazie all'iniziativa di alcuni pizzaioli romani». Valdes 2012 la colloca negli anni '90 e cita Angelo Iezzi.

| Dato | Codice (valore e riga) | Fonte | Stato | Proposta |
|---|---|---|---|---|
| W farina | 280–320 (`:170`) | Confraternita 2016: W 300–380 (anche nell'esempio di impasto) | **errato** | 300–380. In alternativa 300–340, se si vuole restare sulle farine medie: dentro il disciplinare. |
| P/L | 0,50–0,60 (`:171`) | Confraternita 2016: 0,50–0,60 | **verificato** | — |
| Idratazione | 75–85% (`:172`) | Confraternita 2016: dal 75% al 100%, «ottimale» 80%. Valdes 2012: 75–90%. Trezzi 2020: non oltre l'85%, di rado oltre l'80%. D'Anna 2021 (ricetta di Bonci): 80% | **verificato** | Il range è dentro il disciplinare. Il commento «moderna 85–90%» non ha fonte. |
| Sale | 2,5% (`:173`) | Confraternita 2016: 18 g su 725 g, «circa 25 gr/kg» (2,5%). D'Anna 2021 (Bonci, ricetta casalinga): 15 g/kg (1,5%). Alfè 2020: 7 g su 350 g (2,0%) | **verificato** (disciplinare) | — |
| Olio | 2,5% (`:174`) | Confraternita 2016: 15 g su 725 g, «circa 20 gr/kg» (2,0%). D'Anna 2021 (Bonci): 30 g/kg (3,0%). Romana 2025: 2–3% | **plausibile** | Se si segue il disciplinare: 2,0%. |
| Zucchero | 0 (`:176`) | Confraternita 2016: non è tra gli ingredienti | **verificato** | — |
| Lievitazione | 24–48 h (`:177`) | Confraternita 2016: riferimento 48 h a 4 °C, ammesse 24–72 h. Valdes 2012: 24–72 h in cella. Romana 2025: 24 fino a 48–96 h | **verificato** | Si può allargare a 72 h. La temperatura (4 °C) va scritta. |
| Metodo | `no_knead` (`:178`) | Confraternita 2016: ammessi impastatrice e no-knead con pieghe | **verificato** | Valutare `direct\|no_knead`. |
| Peso impasto | 800 g per 40 × 30 (`:182`, `:184–185`) | Confraternita 2016: peso = area/2 ± 20%. Per 60 × 40 sono 1200 g (960–1440) | **errato** | **Conto:** per 40 × 30 la regola dà 600 g (480–720). Proposta: 600 g. |
| Misure teglia | 40 × 30 cm (`:184–185`) | Confraternita 2016: «normalmente» 60 × 40 cm. Alfè 2020: teglia di casa 30 × 40 | **plausibile** (formato di casa) | Indicare che il formato professionale è 60 × 40. |
| Spessore | «Altezza 2–3 cm» (caratteristiche, `:202`) | Confraternita 2016: 15–30 mm | **verificato** (in parte) | «1,5–3 cm» |
| Forno | `electric_standard` (`:188`) | Confraternita 2016: forno elettrico. Valdes 2012: forno elettrico | **verificato** | — |
| Temperatura | 260–300 °C, ideale 280 (`:189–190`) | Confraternita 2016: platea 300–320 °C, cielo 200 °C, senza ventilazione. Romana 2025: «intorno ai 300 °C». A casa: Alfè 2020 «non inferiore ai 240–250 °C», D'Anna 2021 «massimo» | **errato** (per il professionale) | 300–320, ideale 310, oppure tenere un ramo «forno di casa» 250–300. |
| Tempo di cottura | 780–1080 s, ideale 1020 (`:191–192`) | Confraternita 2016: 8–13 min (480–780 s). Trezzi 2020: «in media tra i 12 e i 15 minuti». D'Anna 2021: 13–15 min più una finitura. Alfè 2020: 12–13 min | **errato** | 480–900 s (disciplinare più forno di casa), ideale 720. L'ideale di 1020 s (17 min) è sopra tutte le fonti. |
| Condimento classico | `margherita` | Confraternita 2016: si parte dalla «pizza bianca» e si arriva ai condimenti classici (margherita, marinara). Romana 2025: classiche rossa (pomodoro, olio, origano) e bianca (olio e sale, a volte rosmarino o sesamo) | **plausibile** | Valutare la rossa o la bianca come predefinito (nota già presente nelle linee guida). |

### B.2 Tonda romana «scrocchiarella» (`tonda_romana`, `styles-db.ts:211–250`)

**Testo di regole:** nessuno trovato. Le fonti sono articoli di rivista, senza un pizzaiolo che pubblichi la propria ricetta della tonda classica.

| Dato | Codice (valore e riga) | Fonte | Stato | Proposta |
|---|---|---|---|---|
| W farina | 200–240 (`:217`). Il commento cita «W170–220, La Verace, Molino Vigevano» | Magenis 2020: farine 00 o 0 «di media forza», senza W | **da verificare** | Non ho trovato le fonti del commento. C'è un'incoerenza interna: le caratteristiche dicono «Farina debole W<210», il codice dice 200–240. |
| P/L | 0,40–0,60 (`:218`) | Nessuna fonte | **da verificare** | — |
| Idratazione | 50–55% (`:219`) | Valdes 2012: «intorno al 55%». Magenis 2020: «tra il 55% e il 60%». Varianti moderne: Svario «oltre il 70%» (Lentini 2024), Exquisitaly 70% (Pagano 2017) | **errato** (in parte) | 55–60. Il commento dice già «55–60%». Le tonde al 70% sono «versioni», non lo stile. |
| Sale | 2,5% (`:220`) | Nessuna fonte | **da verificare** | — |
| Olio | 2,5% (`:221`) | L'olio nell'impasto c'è: Valdes 2012 («olio extravergine o di semi dentro l'impasto»); Wikipedia «Roman pizza» (cita Eataly 2018). Nessuna fonte dà la percentuale | **da verificare** (dose) | — |
| Lievitazione | 6–24 h (`:224`) | Tonda classica: nessuna fonte. Versioni moderne: Svario 24 h (Lentini 2024); Exquisitaly biga 12 h + 12 h (Pagano 2017) | **da verificare** | — |
| Panetto | 180 g (`:229`) | Magenis 2020: «tra i 150–180 grammi». Lentini 2024 (Svario): 165 g | **verificato** | — |
| Diametro | 33 cm (`:231`) | Nessuna fonte | **da verificare** | — |
| Mattarello | «Mattarello obbligatorio» (caratteristiche) | Valdes 2012: «si usa il mattarello oppure, se il pizzaiolo è esperto, bastano le mani». Lentini 2024: Svario stende al mattarello | **errato** («obbligatorio») | «Mattarello (o a mano)» |
| Forno | `electric_standard` (`:234`) | Nessuna fonte aperta dice il tipo per la tonda classica. Gambero Rosso (non aperta): Remo a Torpignattara cuoce in forno a legna. Pagano 2017: Exquisitaly usa un elettrico Moretti | **da verificare** | — |
| Temperatura | 300–340 °C, ideale 320 (`:235–236`) | Magenis 2020: «a circa 380–400 °C». Pagano 2017 (elettrico, versione moderna): circa 350 °C | **errato** | 350–400. Decidere se si modella il forno a legna (380–400) o l'elettrico (350). |
| Tempo di cottura | 300–480 s, ideale 360 (`:237–238`) | Valdes 2012: «La cottura non supera i due minuti». Pagano 2017 (elettrico): «un po' più di tre minuti» | **errato** | Fino a 120 s per la tonda classica, circa 180–200 s per la versione elettrica. Nessuna fonte arriva a 5–8 minuti. |

### B.3 New York style (`new_york`, `styles-db.ts:317–361`)

**Fonte principale aperta:** King Arthur Baking Company, *Classic New York-Style Pizza at Home*, quaderno PDF della Baking School (KA 2026). La ricetta è quella del libro *The Book of Pizza* di King Arthur ed è pensata per il **forno di casa**.

**Conto:** sui 360 g di farina della ricetta KA:
- acqua 206 g = 57,2%;
- zucchero 12 g = 3,3%;
- sale 12 g = 3,3%;
- olio 12 g = 3,3%.

| Dato | Codice (valore e riga) | Fonte | Stato | Proposta |
|---|---|---|---|---|
| Origine | New York | Wikipedia «New York–style pizza»: Lombardi's, 1905, Little Italy, prima pizzeria con licenza (attribuzione contestata da P. Regas) | **verificato** (fonte secondaria) | — |
| Farina, W | 280–340 (`:323`) | KA 2026: «bread flour». Wikipedia: «high-gluten bread flour». Nessuna fonte usa il W | **da verificare** (W) | Il W non è usato negli USA: va dichiarata la conversione. |
| P/L | 0,55–0,70 (`:324`) | Nessuna fonte | **da verificare** | — |
| Idratazione | 58–65% (`:325`). Il commento dice «Reinhart 62%, Kenji 63%» | KA 2026: 57,2% («relatively low hydration»). Kenji/Serious Eats: non aperta; le copie di terzi danno 15 oz d'acqua su 22,5 oz di farina (circa 67%). Gemignani: solo trascrizioni da forum (58–60%), non aperte | **errato** (di poco: KA è sotto il minimo) | 57–65. Il commento «Reinhart 62%, Kenji 63%» non ha fonte: va tolto o documentato. |
| Sale | 2,0% (`:326`). Il commento dice «Standard USA 1,5–2%» | KA 2026: 3,3% (12 g di sale da tavola su 360 g) | **errato** | Con KA: 3,3%. È l'unica fonte aperta: meglio confermarla con una seconda (Gemignani, Lehmann/PMQ) prima di cambiare. |
| Olio | 2,5% (`:327`) | KA 2026: 3,3% | **errato** (di poco) | 3,0–3,3 |
| Zucchero | 1,5% (`:329`) | KA 2026: 3,3% («a little bit of sugar and oil in the dough» come «nonnegotiables») | **errato** | 3,3 se si segue KA |
| Lievitazione | 18–48 h (`:330`) | KA 2026: 1 h, poi 8–10 h a temperatura ambiente, poi fino a 3 giorni in frigo | **plausibile** | **Conto:** con KA si va da circa 9 h a circa 83 h. Il range del codice ci sta dentro. |
| Metodo | `direct\|poolish` (`:331`) | KA 2026: diretto | **plausibile** (diretto). Poolish: **da verificare** | — |
| Panetto / diametro | 280 g / 35 cm (`:335`, `:337`) | KA 2026: circa 300 g per 13" (33 cm). Wikipedia: in pizzeria 18–24" (45–60 cm) | **errato** (di poco, rispetto a KA) | 300 g / 33 cm per il forno di casa. Per il formato di pizzeria (45 cm) il peso è **da verificare**. |
| Forno | `electric_standard` (`:340`) | KA 2026: forno di casa con pietra o acciaio, poi grill | **verificato** (versione di casa) | — |
| Temperatura | 270–310 °C, ideale 290 (`:341–342`) | KA 2026: 500 °F, o 550 °F se il forno ci arriva (260–288 °C), preriscaldato almeno 1 h | **plausibile** | Ideale 260–288. Oltre 288 °C non ho fonti. |
| Tempo di cottura | 540–720 s, ideale 600 (`:343–344`) | KA 2026: 5 min (più 1–2 se serve) su pietra, poi 2–3 min di grill = 7–10 min (420–600 s) | **errato** (in parte) | 420–600, ideale 480 |
| «Cottura 12–15 min» (caratteristiche) | — | Va contro KA 2026 e contro il codice stesso (9–12 min) | **errato** | «Cottura 7–10 min» |
| Condimento classico | `margherita_new_york` | KA 2026: la ricetta è la «New York–style cheese slice» (sugo crudo, mozzarella low-moisture, parmigiano; a fine cottura origano e peperoncino) | **plausibile** | Conferma la nota delle linee guida: il classico è la cheese pizza. |

### B.4 Detroit style (`detroit`, `styles-db.ts:363–409`)

**Fonti principali aperte:**
- King Arthur, *Weeknight Detroit Pizza* (KA s.d.a: ricetta da *The Book of Pizza*, pagina aggiornata il 25/06/2026). **Conto:** sui 360 g di farina, acqua 270 g = 75,0%, sale 9 g = 2,5%, olio 15 g = 4,2%, zucchero 0. Peso totale circa 657 g.
- Ricetta attribuita a J. Kenji López-Alt, pubblicata da un produttore di pentole e adattata al suo forno (Our Place s.d.). **Conto:** acqua 275/400 = 68,8%, sale 2,5%, olio 2,0%, zucchero 0.

| Dato | Codice (valore e riga) | Fonte | Stato | Proposta |
|---|---|---|---|---|
| Origine | Detroit | Buddy's s.d.: 1946, Gus Guerra, Buddy's Rendezvous a Six Mile e Conant, «forged-steel pans borrowed from local automotive plants». Wikipedia «Detroit-style pizza»: le stesse cose | **verificato** | — |
| W / P/L | 280–320 / 0,55–0,70 (`:369–370`) | KA e Our Place: «bread flour». Nessun W | **da verificare** | — |
| Idratazione | 70–75% (`:371`) | KA s.d.a: 75%. Our Place s.d. (Kenji): 68,8%. Wikipedia: «70 percent or higher» | **verificato** | Valutare 68–75. |
| Sale | 2,0% (`:372`) | KA s.d.a: 2,5%. Our Place s.d.: 2,5% | **errato** | 2,5 |
| Olio | 3,0% (`:373`) | KA s.d.a: 4,2%. Our Place s.d.: 2,0% | **plausibile** | — |
| Zucchero | 0,5% (`:375`). Il commento cita «PizzaBlab, PizzaLogic» (blog) | KA s.d.a e Our Place s.d.: niente zucchero nell'impasto. Nella ricetta KA lo zucchero va nel sugo (17 g) | **errato** | 0. I blog citati nel commento non sono fonti con autore. |
| Lievitazione | 18–48 h (`:376`) | KA s.d.a: 1–1,5 h a temperatura ambiente (oppure 8–24 h in frigo), poi 45–60 min in teglia. Our Place s.d.: 8–24 h, poi circa 2 h. Buddy's s.d.: doppia lievitazione | **errato** | 8–24 h con la seconda lievitazione in teglia. Una versione in giornata (circa 2–3 h) è documentata da KA. 48 h non hanno fonte. |
| Metodo | `direct` (`:377`) | KA, Our Place: diretto con pieghe o no-knead | **verificato** | — |
| Teglia | 30 × 25 cm (`:383–384`) | LloydPans tramite Pizza Today (non aperta: 403): misure standard 8 × 10" e 10 × 14" (20 × 25 e 25 × 36 cm). KA s.d.a: teglia Detroit o 9 × 13" (23 × 33 cm) | **errato** | 25 × 36 cm (10 × 14") oppure 20 × 25 cm (8 × 10"). La fonte LloydPans va riaperta prima di cambiare. |
| Peso impasto | 600 g (`:381`) | KA s.d.a: circa 657 g per 23 × 33 cm (**Conto:** 0,87 g/cm²). Gemignani: 625–653 g per 10 × 14", secondo forum non aperti | **plausibile** | **Conto:** con 0,87 g/cm², una 25 × 36 vorrebbe circa 780 g. È un mio calcolo, non una fonte. |
| Forno | `electric_standard` (`:387`) | KA s.d.a: forno di casa con pietra o acciaio | **verificato** (versione di casa) | — |
| Temperatura | 250–290 °C, ideale 270 (`:388–389`) | KA s.d.a: 500 °F (260 °C). Our Place s.d.: 450 °F (232 °C). Wikipedia: Shield's 440 °F (225 °C), Loui's 700 °F (370 °C) | **plausibile** | Valutare 230–260, ideale 260, per il forno di casa. |
| Tempo di cottura | 660–900 s, ideale 780 (`:390–391`) | Our Place s.d.: 12–15 min (720–900 s). Wikipedia: Shield's 13 min. KA s.d.a: 10–12 min di precottura più 12–14 min col condimento (22–26 min) | **verificato** (Kenji, Shield's) | Il metodo con precottura di KA va eventualmente gestito come «versione». |
| Formaggio | `detroit_brick` | KA s.d.a, Our Place s.d., Wikipedia: brick cheese fino ai bordi, per il «frico» | **verificato** | — |

---

## Riepilogo delle proposte (decisione a Matteo)

| # | Dove | Ora | Proposta | Fonte |
|---|---|---|---|---|
| 1 | `styles-db.ts:1329` metro, lunghezza | 70 cm | 100 cm | Fucito 2017, menù Gigino 2026 |
| 2 | `:1333`, `:1340` metro, forno | elettrico, legna non richiesta | forno a legna | Fucito 2017, Scatti di Gusto 2017 |
| 3 | `:1322` metro, lievitazione | 12–36 h | da 6 h (unico dato) | Fucito 2017 |
| 4 | `:1346` metro, porzioni | 4–6 | 4–5 | menù Gigino 2026 |
| 5 | metro, condimenti | catalogo napoletano | aggiungere marinara con scarole, mediterranea, ragù, tropeana; togliere quelli assenti dal menù | menù Gigino 2026, Becchi 2023 |
| 6 | `:170` teglia, W | 280–320 | 300–380 | Confraternita 2016 |
| 7 | `:182` teglia, peso per 40 × 30 | 800 g | 600 g | Confraternita 2016 (regola area/2) |
| 8 | `:189–192` teglia, forno | 260–300 °C; 780–1080 s, ideale 1020 | 300–320 °C; 480–900 s, ideale 720 | Confraternita 2016, Trezzi 2020 |
| 9 | `:170` commento teglia | «Disciplinare APITER» | «Confraternita della Pizza 2016» | Confraternita 2016 |
| 10 | `:219` tonda, idratazione | 50–55 | 55–60 | Valdes 2012, Magenis 2020 |
| 11 | `:235–238` tonda, forno | 300–340 °C; 300–480 s | 350–400 °C; ≤120 s (classica) o circa 190 s (elettrico) | Magenis 2020, Valdes 2012, Pagano 2017 |
| 12 | `:326–329` NY, sale/olio/zucchero | 2,0 / 2,5 / 1,5 | 3,3 / 3,3 / 3,3, se si adotta KA | KA 2026 |
| 13 | `:343–344` NY, tempo | 540–720 s | 420–600 s | KA 2026 |
| 14 | `:372`, `:375` Detroit, sale/zucchero | 2,0 / 0,5 | 2,5 / 0 | KA s.d.a, Our Place s.d. |
| 15 | `:376`, `:383–384` Detroit, lievitazione e teglia | 18–48 h; 30 × 25 | 8–24 h; 25 × 36 (10 × 14") | KA s.d.a, Our Place s.d.; LloydPans (da riaprire) |

## Rimasti senza fonte

- **Pizza al metro:**
  - W, sale, olio, temperatura e tempo di cottura, peso dell'impasto per metro;
  - se si mettono più gusti sulla stessa pizza;
  - il testo del disciplinare De.Co. «PizzaDiVico» e la data d'iscrizione del marchio storico.
- **Teglia:** nulla di essenziale. Il disciplinare copre quasi tutto. Il libro di Bonci non è stato consultato.
- **Tonda:**
  - W, P/L, sale, dose d'olio, lievitazione della versione classica, diametro, tipo di forno;
  - manca la ricetta di un pizzaiolo romano «classico».
- **New York:**
  - W e P/L;
  - i dati di Gemignani (*The Pizza Bible*) e di Kenji López-Alt (Serious Eats), non raggiungibili;
  - una fonte per il formato di pizzeria (panetto per 45 cm, forno a platea, gradi).
- **Detroit:**
  - W e P/L;
  - la scheda LloydPans aperta direttamente;
  - la ricetta di Gemignani.

---

## Riferimenti

Data d'accesso per tutte: **24/10/2026**.

- **pizzametro.it s.d.** Pizza a Metro da Gigino – L'Università della Pizza. «La storia». https://www.pizzametro.it/la-storia/
- **Gigino, menù 2026.** Pizza a Metro da Gigino. Menù online (sezione «Dalla pizzeria» e «Pizze estate 2026»), linkato dal sito ufficiale. https://www.eccoilmenu.it/vai/pizzametro
- **Fucito 2017.** A. Fucito. «Perché Gigino pizza a metro di Vico Equense è famoso nel mondo». *Dissapore*, 25/06/2017. https://www.dissapore.com/pizzerie/vico-equense-gigino-pizza-a-metro/
- **Dirindin 2023.** V. Dirindin. «Pizza a metro, l'Università della pizza contro Vico Equense: chi ha inventato il sistema metrico decimale?». *Dissapore*, 10/05/2023. https://www.dissapore.com/pizzerie/pizza-a-metro-luniversita-della-pizza-contro-vico-equense-chi-ha-inventato-il-sistema-metrico-decimale/
- **Becchi 2023.** M. Becchi. «Where to eat Vico Equense's typical metre-long pizza "pizza a metro", now a national historic brand». *Gambero Rosso International*, 22/12/2023. https://www.gamberorossointernational.com/?p=512495
- **Scatti di Gusto 2017.** Redazione. «Pizza a Vico Equense 2017». *Scatti di Gusto*, 02/04/2017 (aggiornato 06/04/2019). https://www.scattidigusto.it/pizza-a-vico-equense-2017
- **Gambero Rosso 2025 (non aperta, 403).** «Le forme della pizza». *Gambero Rosso*. https://www.gamberorosso.it/?p=299185
- **Summer in Italy s.d.** «Pizzeria Gigino Pizza a Metro» (guida turistica, senza autore). https://summerinitaly.com/guide/pizzeria-gigino-pizza-metro
- **Confraternita 2016.** La Confraternita della Pizza. *Disciplinare di produzione della «Autentica pizza in teglia alla romana ad alta idratazione»*. Igea Marina, 29/05/2016 (PDF, autore nei metadati: E. Priore). https://www.laconfraternitadellapizza.net/documenti/Disciplinare-Autentica-Pizza-In-Teglia-Alla-Romana.pdf
- **Valdes 2012.** G. Valdes. «Che pizza? Uno per uno, (quasi) tutti gli stili della pizza italiana». *Dissapore*, 18/10/2012. https://www.dissapore.com/grande-notizia/che-pizza-uno-per-uno-tutti-gli-stili-della-pizza-italiana/
- **Trezzi 2020.** A. Trezzi. «Pizza in teglia alla romana: 8 errori che facciamo spesso». *Dissapore*, 12/11/2020. https://www.dissapore.com/cucina/pizza-in-teglia-errori-da-non-fare/
- **D'Anna 2021.** A. M. D'Anna. «Ricetta della pizza di Bonci mortadella e limone» (ricetta per la casa). *Scatti di Gusto*, 14/05/2021. https://www.scattidigusto.it/2021/05/14/ricetta-pizza-bonci-mortadella-limone
- **Alfè 2020.** C. Alfè. «Lezioni di pizza. La ricetta della teglia ad alta idratazione a casa». *Scatti di Gusto*, 31/05/2020 (aggiornato 14/06/2020). https://www.scattidigusto.it/2020/05/31/lezioni-di-pizza-la-ricetta-della-teglia-ad-alta-idratazione-a-casa/
- **Romana 2025.** C. Romana. «Le pizzerie al taglio migliori a Roma». *Scatti di Gusto*, 23/05/2025. https://www.scattidigusto.it/migliori-pizzerie-al-taglio-roma
- **Magenis 2020.** G. Magenis. «Pizza romana e pizza napoletana, quali sono le differenze?». *Dissapore*, 02/04/2020. https://www.dissapore.com/cucina/pizza-romana-e-pizza-napoletana-quali-sono-le-differenze/
- **Lentini 2024.** T. Lentini. «Pizzeria Svario a Roma, pizze scrocchiarelle autentiche». *Scatti di Gusto*, 02/01/2024 (aggiornato 29/07/2024). https://www.scattidigusto.it/svario-a-roma-pizze-scrocchiarelle-menu-e-prezzi-pizzeria
- **Pagano 2017.** V. Pagano. «Roma. La nuova pizza tonda di Exquisitaly». *Scatti di Gusto*, 19/10/2017. https://www.scattidigusto.it/2017/10/19/roma-nuova-pizza-tonda-exquisitaly
- **Wikipedia «Roman pizza».** Voce consultata il 24/10/2026; cita Eataly 2018. https://en.wikipedia.org/wiki/Roman_pizza
- **KA 2026.** King Arthur Baking Company. *Classic New York-Style Pizza at Home: Authentic Slices, Baked in Your Own Oven* (quaderno della Baking School, PDF del 01/04/2026). https://shop.kingarthurbaking.com/content/class-pdfs/New-York-Style-Pizza-Workbook-King-Arthur-Baking.pdf
- **KA s.d.a.** King Arthur Baking Company. «Weeknight Detroit Pizza» (da *The Book of Pizza*; pagina aggiornata il 25/06/2026). https://www.kingarthurbaking.com/recipes/weeknight-detroit-pizza-recipe
- **Our Place s.d.** «No-Knead Detroit-Style Pan Pizza», «Recipe from J. Kenji López-Alt» (pagina di un produttore di pentole, ricetta per il suo forno). https://fromourplace.com/blogs/recipes/detroit-style-pan-pizza
- **Buddy's s.d.** Buddy's Pizza. «History». https://buddyspizza.com/history/
- **Wikipedia «Detroit-style pizza».** Voce consultata il 24/10/2026 (cita, tra gli altri, López-Alt 2017 su Serious Eats e *Pizza Today* 2018). https://en.wikipedia.org/wiki/Detroit-style_pizza
- **Wikipedia «New York–style pizza».** Voce consultata il 24/10/2026 (cita Jackson et al. 2010, *The Encyclopedia of New York City*). https://en.wikipedia.org/wiki/New_York%E2%80%93style_pizza
- **Pizza Today (non aperta, 403).** «Detroit-Style Pans Enter December as Best-Seller» (misure LloydPans 8 × 10" e 10 × 14"). https://pizzatoday.com/products/equipment/detroit-style-pans-enter-december-as-best-seller/
- **Non consultati (bloccati o non online):** J. K. López-Alt, Serious Eats, «Basic New York-Style Pizza Dough» e «Detroit-Style Pizza» (https://www.seriouseats.com/basic-new-york-style-pizza-dough, https://www.seriouseats.com/detroit-style-pizza-recipe); T. Gemignani 2014, *The Pizza Bible*, Ten Speed Press; G. Bonci, *Il gusto della pizza*.
