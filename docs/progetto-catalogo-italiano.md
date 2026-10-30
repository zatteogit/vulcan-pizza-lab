# Progetto: catalogo italiano, ricette casalinghe e motore esteso

29 ottobre 2026 · piano unico che unisce due contributi esterni, verificati sul
codice e corretti dove sbagliano:

- **GPT**, «Vulcan ampliamento del catalogo italiano e ricette casalinghe»,
  handoff v1.0 (baseline `0fe08c5`). Allegati citati e non ancora ricevuti:
  `vulcan-menu-fonti.csv` (73 menù), `vulcan-candidati-e-verifiche.json`.
- **Gemini**, «Integrazione architetturale avanzata per il motore Vulcan»
  (stili regionali, condimenti, metodi casalinghi, impasti non lievitati,
  piani di cottura, senza glutine, lievito madre).

Decisioni di Matteo del 29/10/2026 (D-065, D-066, D-067 in `autorialita.md`):

1. **Si parte da condimenti e correzioni d'identità** (tranche A), senza
   toccare il motore.
2. **Ricette pubblicate sul web con misure a cucchiai o bustine**: si
   traducono in dosi precise. La conversione è di Vulcan e lo si dice
   («dosi convertite da Vulcan»); l'autore resta «ispirata a».
3. **La parte scientifica di Gemini entra anche nel motore**, come progetto
   successivo al catalogo (tranche D), con fonti primarie al posto delle sue.

## 1. Che cosa teniamo e da chi

| Tema | GPT | Gemini | Decisione |
|---|---|---|---|
| Stile, condimento e versione d'autore distinti | sì, ben definito | implicito | regola del progetto (§3) |
| Stati della fonte separati da quelli della ricetta | sì | no | regola del progetto (§3) |
| Lievito della fonte contro lievito stimato | sì | lo confonde (Arrhenius sulla Confraternita) | regola: la dose della fonte resta, la stima si dichiara |
| Menù come prova d'esistenza, non di dosi né di popolarità | sì | no (li chiama «altissima frequenza») | regola GPT |
| Condimenti quotidiani | 11 (P1/P2) | 11, più regionali | uniti, senza duplicati (§4) |
| Stili regionali | 5 + 4 di ricerca | 15 | uniti come candidati (§5) |
| Teglia casalinga in giornata | stile a sé, fonte da trovare | grammi «di Benedetta Rossi» senza fonte | stile a sé; dosi dalla pagina pubblica convertite da Vulcan (§6) |
| Adriano, Dekracap, Paoletta | formule con fonte e conti | no | GPT, conti verificati (§6) |
| Confraternita «Verace 8+16» | no | sì | candidato, da trovare nella fonte primaria |
| Padella + grill per la napoletana in casa | no | sì | nel motore (tranche C): tecnica reale, oggi manca |
| Condimenti dopo il forno (crudaiola, speck, cruschi, lardo, uovo a fine cottura) | in parte | sì, ben spiegato | casi di prova per i tempi dei condimenti |
| Impasti non lievitati e a pastella | no | sì | tranche D |
| Piani di cottura, senza glutine, lievito madre | escluso | sì | tranche D, con fonti primarie |
| Budget dei cataloghi lingua | assente | assente | prerequisito della tranche A (§7) |

## 2. Errori trovati nei due documenti

**Gemini** (da non importare così):

- Le note [1]–[10] di **tutte** le sezioni (idrocolloidi, TTA, conducibilità)
  rimandano a pagine sulla pizza scima: le fonti scientifiche vanno trovate da capo.
- I grammi «di Benedetta Rossi» (500 g, 320 g d'acqua, 7,5 g di zucchero,
  0,70 g/cm²) non vengono da nessuna fonte: sono una ricostruzione.
- «Scaccia ragusana (o scacciata catanese)»: sono due preparazioni diverse.
- Il Q10 «da 2 a 7» è esagerato: per il lievito la letteratura dà circa 2–3.
- Soglie inventate e presentate come fisica: pietra in cordierite che «brucia
  in 40 secondi» a 500 °C, «Fatal Error», distanza di sicurezza di 7 cm,
  potenze delle resistenze dei forni a conchiglia. Vanno misurate o tolte.
- Boscaiola e Cosacca esistono già nel catalogo (`boscaiola`, `boscaiola_napoletana`,
  `boscaiola_romana`, `cosacca`, `cosacca_napoletana`).
- «Schiacciata alla fiorentina» è un dolce di Carnevale: lo stile salato si
  chiama «schiacciata all'olio» (toscana).
- Fiadone: è una torta salata pasquale, non una pizza. Fuori perimetro.
- «Teglia marchigiana» o «trancio marchigiano»: nessun riscontro trovato;
  resta candidato solo con una fonte.
- «No-knead della Prova del Cuoco»: l'attribuzione non è verificata.

**GPT**:

- Mette tutta l'infrastruttura (riferimenti con revisioni, fasi, persistenza)
  prima di qualunque ricetta: qui si parte da ciò che non tocca il motore.
- Non considera il budget: il catalogo giapponese è già a 98,5 kB su 100.
- Chiede una «prova pratica» per ogni metodo senza dire chi la fa: per le
  versioni convertite da Vulcan la prova la fa Matteo, quando possibile, e
  il verbale va nel registro delle fonti.

Verificato sul codice (main `a29c1c2`): 29 stili; preset `teglia_casalinga`
dentro le versioni della teglia romana (`style-versions.ts`); Sardenaira come
condimento della genovese (`sardenaira_sanremo`); `sfincione_bianca` è una
ricetta iconica distinta dalla variante bagherese; `folded_layers` esiste nel
motore; gli override di interpretazione accettano solo 4, 12 o 22 °C.
Conti di GPT rifatti: Adriano 1.687,5 g, 562,5 g per teglia 30×35
(0,536 g/cm²); Dekracap acqua 84,75 %, olio 1,69 %, lievito 0,254 %.

## 3. Regole del progetto

- **Stile** = impasto, forma e processo riconoscibili. **Condimento** =
  composizione, con dosi per formato. **Versione d'autore** = metodo
  documentato di una persona o community, sempre «ispirata a».
- Stato della fonte (verificato, plausibile, da verificare, errato) separato
  dallo stato della ricetta: candidato → specificato → validato → pubblicato
  (o sospeso). Nel catalogo solo «pubblicato».
- Le dosi convertite (cucchiai, bustine, ml di olio) si scrivono con la
  conversione usata e la sua fonte (densità, peso di un cucchiaio di quel
  ingrediente); la ricetta dice «dosi convertite da Vulcan».
- Un menù prova che un gusto esiste in un posto, non le dosi e non la
  diffusione. Niente classifiche.
- Nessun condimento copiato su tutti gli stili: solo su quelli supportati,
  con dosi per formato (tonda, teglia, pala, padellino).
- Prima di creare un ID si cerca un equivalente nel catalogo.
- Ogni testo in 7 lingue, nei cataloghi CMS o `topping-i18n`.
- Foto: fonte e licenza registrate; le immagini generate si dichiarano.

## 4. Condimenti (tranche A)

Nuovi concetti, se non esiste un equivalente. Tra parentesi la cosa da
modellare con cura.

| Condimento | Da | Da modellare |
|---|---|---|
| Würstel e patatine («Americana») | GPT | patatine fritte ≠ patate al forno; alias senza confonderla con gli impasti americani |
| Prosciutto cotto | GPT | distinto da cotto e funghi |
| Funghi | GPT | tipo, precottura, acqua |
| Napoli (acciughe) | GPT | varianti con capperi e olive esplicite |
| Parmigiana | GPT | melanzane fritte o grigliate, formaggio |
| Norma | GPT | ricotta salata, non parmigiano né ricotta fresca |
| Bufalina | GPT | riuso della bufala già presente nella Margherita AVPN |
| Pugliese | Gemini | cipolla cruda o stufata |
| Crudaiola | Gemini | tutto il fresco dopo il forno |
| Tirolese | Gemini | speck dopo il forno |
| Bismarck | Gemini | uovo negli ultimi minuti |
| Mimosa | Gemini | panna, cotto, mais |
| Lucana | Gemini | peperoni cruschi solo dopo il forno (bruciano) |
| Rossini (Pesaro) | Gemini | uovo sodo e maionese a freddo |
| Patate, lardo e rosmarino | Gemini | lardo in uscita |
| Gamberetti e zucchine | Gemini | gamberetti alla fine |
| P2: salsiccia e patate, speck e scamorza, radicchio e gorgonzola, mortadella e pistacchio con burrata | GPT | varianti degli esistenti dove possibile |

Correzioni d'identità: Sardenaira (cipolla e De.Co. contro la ricetta CNA) e
sfincione bianco di Bagheria distinto dallo sfincione in bianco.

### 4.1 Stato della tranche A (30/10/2026)

**A1, su main (#155).** Würstel e patatine, Prosciutto cotto, Funghi, Napoli,
Parmigiana, Norma, Bufalina: 7 concetti, 14 ricette.

**A2.** I nove condimenti di Gemini, ognuno con una fase delicata:

| Concetto (ID) | Ricette e stili | Fase |
|---|---|---|
| Pugliese (`pugliese`) | `pugliese_napoletana` (STG, canotto, al metro), `pugliese_romana` (tonda, teglia, pala, pinsa, trancio) | napoletana: cipolla stufata prima (pre-preparazione); romana: cipolla cruda a velo, con il testo per le cotture brevi che dice di stufarla |
| Crudaiola (`crudaiola`) | `crudaiola_classica` (napoletane e romane) | solo fior di latte in forno; pomodorini, rucola e parmigiano `after_bake` |
| Tirolese (`tirolese`) | `tirolese_classica` (tonda, teglia, pala, canotto, trancio) | speck `after_bake` |
| Bismarck (`bismarck`) | `bismarck_classica` (tonda, pala, canotto, trancio) | uovo negli ultimi 4-5 minuti nel testo del passo; con le cotture brevi (`description_short_bake`) l'uovo entra subito |
| Mimosa (`mimosa`) | `mimosa_classica` (tonda, teglia, pala, canotto, trancio) | tutto in forno |
| Lucana (`lucana`) | `lucana_classica` (canotto, tonda, teglia, pala) | cruschi fritti a parte, `after_bake` |
| Rossini (`rossini`) | `rossini_classica` (tonda, teglia, pala, canotto) | uovo sodo e maionese `after_bake`, a pizza intiepidita; classico locale di Pesaro, «Tradizionale», non da disciplinare |
| Patate, lardo e rosmarino (`patate_lardo`) | `patate_lardo_romana` (teglia, pala, pinsa) | lardo `after_bake`; +4 minuti per le patate come `patate_rosmarino_romana` |
| Gamberetti e zucchine (`gamberetti_zucchine`) | `gamberetti_zucchine_classica` (canotto, tonda, teglia, pala, pinsa) | gamberetti saltati a parte, `after_bake` |

Scelte:

- **Fasi senza campi nuovi nel motore.** «Prima del forno» è `after_shape`,
  «dopo il forno» è `after_bake`, la cottura breve usa
  `description_short_bake` (G3-WP-03). «Negli ultimi minuti» non è un punto
  della timeline: lo dice il testo del passo prima della cottura, come il
  prosciutto cotto della A1. Un punto «durante la cottura» resta per la
  tranche C.
- **Concetti nuovi, non varianti.** Il resolver sceglie una sola ricetta per
  concetto e stile: un «patate e rosmarino con lardo» sugli stessi stili non
  sarebbe mai scelto oppure sostituirebbe la versione vegetariana. Per questo
  `patate_lardo` è un concetto a sé (riusa la preparazione delle patate di
  `patate_rosmarino_romana`); `zucca_speck` (Bonci) resta distinto dalla
  Tirolese. Ingredienti riusati dalla A1: pelati, passata, fior di latte,
  prosciutto cotto con i suoi componenti.
- **Grammature di Vulcan**, allineate alla A1 (pelati 80 g e fior di latte
  70-80 g sulla napoletana, passata 80-90 g e fior di latte 80 g sulla romana).
  Nessun condimento assegnato agli stili americani, alle focacce o ai fritti.
- **Allergeni.** Uovo, maionese (uova, con l'avviso sulla senape in
  etichetta), gamberetti (crostacei), formaggi (latte). Parmigiano Reggiano al
  posto del Grana Padano nella Crudaiola: il Grana contiene lisozima d'uovo.
  Nel filtro vegano lardo e gamberetti sono ora animali (prima «da
  verificare») e il mais è compatibile.

**Correzioni d'identità.**

- *Sardenaira.* La ricetta etichettata «De.Co. di Sanremo» usava una salsa
  cotta con la cipolla. Il disciplinare De.Co. del Comune di Sanremo prevede
  pomodoro fresco o polpa a crudo, aglio in camicia, acciughe sotto sale,
  capperi, olive taggiasche e origano, senza cipolla; la cipolla resta nelle
  versioni di casa e nella pissalandrea. Corretti ingrediente, passo e testi in
  7 lingue; dosi invariate. Fonti: AIFB, «La Sardenaira» (20/07/2016,
  https://www.aifb.it/cultura-enogastronomica-italiana/piatti-tradizione-italiana/giornata-nazionale-della-sardenaira/),
  che cita il disciplinare e riporta «Nessuna presenza di cipolle, se non nelle
  preparazioni casalinghe»; Wikipedia, «Sardenaira», che cita il PDF del Comune
  (comunedisanremo.it/dotAsset/eb3f8bb4-b197-4dbd-942b-c70683faa0f3.pdf, oggi
  404; la copia su web.archive.org non era raggiungibile da qui); Dissapore
  (15/03/2024) per la pissalandrea con cipolla. Stato: **plausibile**, letto
  in fonti secondarie che citano il disciplinare; il testo primario va riletto.
  La «ricetta CNA» citata nel rapporto Gemini **non è stata trovata**: nessuna
  modifica basata su di essa.
- *Sfincione bianco di Bagheria.* Mancava la ricotta di pecora: tuma (o
  primosale), ricotta di pecora, acciughe, cipolle stufate, mollica tostata con
  caciocavallo, senza pomodoro. Nome e descrizione lo distinguono dallo
  «sfincione in bianco» palermitano (olio, rosmarino e sale, ricetta iconica
  `sfincione_bianca`). Fonti: Balarm, «Richiama il bianco della purezza…»
  (11/07/2020,
  https://www.balarm.it/news/richiama-il-bianco-della-purezza-ma-e-un-tripudio-del-gusto-e-lo-sfincione-bagherese-118990);
  Scatti di Gusto, ricetta di Gioacchino Gargano (23/03/2025,
  https://www.scattidigusto.it/ricette/sfincione-bianco-bagherese-ricetta-originale-della-focaccia-siciliana/).
  Il disciplinare della Comunità Slow Food dei panificatori di Bagheria (2019,
  citato da Gambero Rosso) non era leggibile (403): stato **plausibile**.

**Restano** i P2 (salsiccia e patate, speck e scamorza, radicchio e
gorgonzola, mortadella e pistacchio con burrata) e il budget: con la A2 il «JS
per utente» supera il tetto di D-059 (numeri nel riepilogo della PR); il
prerequisito del §7 torna aperto.

## 5. Stili regionali (tranche B e oltre, uno per volta)

Candidati, nessuno pronto: ognuno entra con fonte completa o con la
conversione di Vulcan dichiarata. Teglia casalinga in giornata, Sardenaira
(se serve come stile), Sfincione di Bagheria (oggi variante), Scaccia
ragusana, Scacciata catanese, Pizza di scarola, Tiella di Gaeta, Panuozzo,
Focaccia messinese, Schiacciata all'olio toscana, Puccia salentina, Rianata
trapanese, Pizzolo di Sortino, Fainè sassarese, Pizza scima, Smacafam, Torta
al testo, Crescione romagnolo. Gli ultimi cinque richiedono impasti non
lievitati o a pastella (tranche D).

## 6. Metodi casalinghi e d'autore

- **Teglia casalinga in giornata**: stile nuovo `teglia_casalinga` (il preset
  romano con lo stesso nome resta; scegliere un ID senza collisioni). Dosi
  dalla pagina pubblica di Benedetta Rossi convertite da Vulcan, se la pagina
  è leggibile; altrimenti da un'altra fonte completa.
- **Adriano Continisio** (Profumo di lievito, 2009): 900 g W250, 720 g acqua,
  45 g olio, 18 g sale, 4,5 g lievito fresco, poolish 450 + 450 g, tre teglie
  30×35. Richiede «lievito della fonte».
- **Dekracap** (Confraternita, «48 ore»): richiede 8 °C negli override e il
  tipo di lievito chiarito.
- **Paoletta**: richiede ingredienti aggiuntivi nell'impasto (fiocchi di patate).
- **Padella + grill** per la napoletana nel forno di casa: metodo di cottura
  nuovo accanto alla «teglia capovolta».

Fonti lette il 30/10/2026, dosi convertite e piano della tranche B: §9. Le
voci sopra restano come scritte il 29/10; dove la fonte dice altro, vale il §9.

## 7. Tranche

**Prerequisito.** Cataloghi lingua divisi in modo che i condimenti nuovi non
superino il tetto di 100 kB del chunk più grande (oggi `ja` 98,5 kB).

**A — Condimenti e correzioni.** §4, con dosi per formato, allergeni,
dispensa, ricerca e 7 lingue.

**B — Casalinga e autori.** Teglia casalinga, Adriano, Dekracap, con
«lievito della fonte», 8 °C e fasi esplicite; poi Paoletta. Piano in cinque
pacchetti al §9.6 (gli 8 °C non hanno una fonte letta).

**C — Motore di cottura domestica.** Padella + grill; tempi dei condimenti
dopo il forno verificati sui casi della tranche A.

**D — Motore esteso.** Impasti non lievitati e a pastella (agente lievitante
«nessuno», solventi diversi dall'acqua, idratazioni fino al 300 %); materiali
dei piani di cottura; senza glutine con idrocolloidi; lievito madre (acidità
e temperatura). Ogni modello con fonti primarie, misure prima/dopo e test,
come in `docs/motore-correzioni-2026-10-22.md`.

## 8. Accettazione (dal documento GPT, ridotta)

- ID e link esistenti continuano a funzionare; nessun condimento nuovo
  assegnato per ripiego a stili non verificati.
- Dosi della fonte conservate; adattamenti dichiarati.
- Tempi biologici come finestra con un criterio («al raddoppio»), non come
  scadenza.
- Salvataggio, esportazione, link e MCP conservano le stesse informazioni.
- Sette lingue complete, nessun testo fisso nei componenti.
- `npm run verify`, build, budget, percorso Scopri → ricetta → salvataggio a
  390 e 1280 px.

## 9. Tranche B: piano (30/10/2026)

Indagine su main `e46f063`, senza modifiche al codice. Le fonti sono state
aperte il 30/10/2026. Nelle note: **Fatto** = ciò che la fonte dice;
**Lettura** = interpretazione di chi scrive; **Ipotesi** = da controllare.
Stati della fonte come al §3 (verificato, plausibile, da verificare, errato).

### 9.1 In breve

| Voce | Fonte letta | Stato | Collocazione proposta | Al motore serve | Pacchetto |
|---|---|---|---|---|---|
| Teglia casalinga in giornata | Benedetta Rossi con Paneangeli, «Pizza margherita in teglia ad alta idratazione» (paneangeli.it, s.d.) | **verificato** (dosi, tempi, cottura); teglia 35×35 **plausibile** | stile nuovo `teglia_in_giornata` + versione «Ispirata a Benedetta Rossi» | lievito della fonte | B1, B2 |
| Adriano | Adriano Continisio, «La pizza in teglia croccante», Profumo di lievito, 26/11/2009 | **verificato** | versione d'autore della teglia in giornata (non della teglia romana) | lievito della fonte, fasi esplicite (preimpasto di 3 h, appretto a 28 °C) | B3 |
| Dekracap | nessuna: le discussioni del forum della Confraternita chiedono il login | **da verificare** | sospesa; se verificata, versione d'autore della `teglia_romana` | 8 °C solo se la fonte lo dice | B5 |
| Paoletta | Paola Sersante, «Pizza di Paoletta da fare in fretta», Anice & Cannella, 05/02/2018 | **verificato** | versione d'autore della teglia in giornata | ingredienti aggiuntivi (malto, fiocchi di patate facoltativi), farine con glutine nel mix, fasi esplicite | B4 |

Due correzioni al §6. **Fatto:** il preimpasto di Adriano matura «ca. 3 ore a
20°» e la pizza si fa in giornata, non con un poolish di 12–16 h. **Lettura:**
tre voci su quattro (Benedetta, Adriano, Paoletta) sono la stessa
preparazione, una pizza in teglia di casa fatta in giornata, con tre metodi
diversi: uno stile solo, con tre versioni d'autore, invece di tre stili.

### 9.2 Fonti

#### Teglia casalinga in giornata (Benedetta Rossi)

- **Fonte letta (primaria):** Paneangeli, «Pizza margherita in teglia ad alta
  idratazione», sezione «Le ricette di Benedetta», firmata «La Ricetta di
  Benedetta», senza data,
  https://paneangeli.it/le-ricette-di-benedetta/pizza-margherita-in-teglia-ad-alta-idratazione.
  Stato **verificato** per dosi, tempi e cottura.
- **Pagina ufficiale non leggibile:** Benedetta Rossi, «Pizza in teglia in
  collaborazione con Paneangeli»,
  https://www.fattoincasadabenedetta.it/ricetta/pizza-in-teglia/ risponde con
  una verifica anti-bot di Cloudflare (402/403); la copia su web.archive.org
  (istantanea del 01/12/2025) non era raggiungibile da qui. Non è stata
  aggirata.
- **Fatto (Paneangeli).** 250 g di farina manitoba e 250 g di 00; 1 bustina di
  lievito di birra Mastro Fornaio; 2 cucchiaini di zucchero; 400 ml di acqua
  tiepida; 50 ml di olio di oliva; 1 cucchiaino di sale (il passo 3 dice «un
  pizzico»). Farine, lievito e zucchero mescolati, poi acqua, olio e farina a
  poco a poco: impasto «molto denso e appiccicoso», senza impastatrice.
  Lievitazione coperta «in un luogo caldo per circa 2 ore», fino al raddoppio.
  Teglia rettangolare unta generosamente, impasto allargato con le mani unte,
  salsa tiepida già condita, altri 10 minuti. Cottura 25 minuti a 210 °C
  statico (200 °C ventilato), poi mozzarella a dadini e circa 5 minuti.
  Condimento 300 g di salsa e 250 g di mozzarella; 8 porzioni. Misura della
  teglia non indicata.
- **Fatto (Paneangeli, scheda del prodotto,**
  https://paneangeli.it/prodotti/lieviti-e-ingredienti-base/lieviti-salati/lievito-di-birra-mastro-fornaio**).**
  Bustina da 7 g, lievito di birra disidratato in granelli; «Una bustina è
  indicata per 500g di farina ed equivale a un cubetto di lievito fresco da
  25g»; si aggiunge alla farina con due cucchiaini di zucchero, senza
  scioglierlo.
- **Teglia 35×35 cm: plausibile.** La riporta Velvet Gossip (redazione,
  19/03/2021,
  https://www.velvetgossip.it/2021/03/19/ricetta-della-pizza-di-benedetta-rossi-soffice-e-ben-lievitata/,
  «35 x 35 cm, oppure la placca del forno»), che non cita la fonte; l'estratto
  della pagina ufficiale nel motore di ricerca dice lo stesso.
- **Versione televisiva (da non usare come fonte):** il blog non ufficiale «I
  menù di Benedetta» (11/12/2019,
  https://menudibenedetta.blogspot.com/2019/12/pizza-in-teglia-ricetta-benedetta-rossi-fatto-in-casa-per-voi-a-natale.html)
  riporta le stesse dosi con cottura a 200 °C statico per 25 + 10 minuti.
- **Gemini (§2):** 320 g d'acqua e 0,70 g/cm² sono **errati**: la fonte dice
  400 ml, e con la teglia 35×35 l'impasto pesa 0,79 g/cm² (§9.3).

#### Adriano Continisio

- **Fonte:** Adriano Continisio, «La pizza in teglia croccante», Profumo di
  lievito, giovedì 26/11/2009,
  http://profumodilievito.blogspot.com/2009/11/la-pizza-in-teglia-croccante.html.
  Il blog è firmato «profumo di lievito by Adriano Continisio» (licenza
  Creative Commons). Stato **verificato**.
- **Fatto.** Per 3 teglie 30×35: 900 g di farina W 250 (o una 0 ad alto
  assorbimento), 720 g d'acqua (450 nel preimpasto e 270 nell'impasto), 45 g
  d'olio extravergine, 18 g di sale, 4,5 g di lievito di birra fresco, 1
  cucchiaino di malto d'orzo facoltativo, semola per lo spolvero.
  Preimpasto «di primo mattino»: lievito e malto sciolti in 450 g d'acqua, 450 g
  di farina, finché «gonfi e si crei un principio di fossetta nella parte
  centrale (ca. 3 ore a 20°)». Impasto in planetaria (foglia, poi gancio),
  sale, olio a filo, fino al velo; lievitazione «a temperatura ambiente»,
  senza una durata. «Verso le 16.00»: divisione in tre, una piega a tre,
  arrotolare, contenitori ermetici; «Lasciamo raddoppiare a 28°». Stesura su
  semola, teglie **non unte**; pomodoro e sale; 250 °C nella parte bassa «per
  10°» (refuso per 10 minuti); mozzarella e olio, parte alta per 4–5 minuti.
- **Fatto (commenti dell'autore, da rileggere parola per parola):** rapporto
  secco:fresco «2,5:1»; per una pizza alta, teglie unte e raddoppio in teglia
  (14/04/2012); frigo a 10–12 °C fino a 48 h, a 4–5 °C fino a 24 h
  (07/09/2011). Valgono per varianti, non per questa ricetta.
- **Lettura.** La parola «poolish» non compare: è un preimpasto liquido 1:1
  con metà della farina e tutto il lievito, di 3 ore. **Ipotesi:** preimpasto
  alle 7, impasto alle 10, divisione alle 16, raddoppio a 28 °C in 1–2 ore:
  circa 11–12 ore dal preimpasto alla cottura.

#### Dekracap

- **Fonte non raggiungibile.** Il forum La Confraternita della Pizza
  (https://laconfraternitadellapizza.forumfree.it/) si apre, ma ogni
  discussione rimanda al login (302 verso accounts.forumfree.it; da riga di
  comando 503). Discussioni pertinenti trovate e **non lette**: «Pizza teglia
  48 ore» (https://laconfraternitadellapizza.forumfree.it/?t=79174252);
  «PIZZA BONCI.....non capisco il perché ??»
  (https://laconfraternitadellapizza.forumfree.it/?t=70223793), dove secondo
  l'estratto del motore di ricerca un iscritto segue «la ricetta del DEK» con
  il frigo a 6 °C e chiede se il lievito è secco; «Teglia 48 ore di
  maturazione-85%idro-MixMulinoMarino»
  (https://laconfraternitadellapizza.forumfree.it/?t=71180474), annunciata
  dal blog della Confraternita il 31/07/2015 con un post di sole foto firmato
  Ettore Priore
  (http://laconfraternitadellapizza.blogspot.com/2015/07/teglia-48-ore-di-maturazione-85idro.html).
- **Stato: da verificare.** Le percentuali del §2 (acqua 84,75 %, olio 1,69 %,
  lievito 0,254 %) vengono dal documento GPT, non da una fonte letta.
  **Ipotesi:** corrispondono a 500 g d'acqua, 10 g d'olio e 1,5 g di lievito su
  590 g di farina, e l'85 % con 48 ore coincide con il post del 2015; né la
  ricetta né l'identità dell'autore sono verificate. **Nessuna fonte letta
  dice 8 °C.**
- **Lettura.** Una discussione visibile solo agli iscritti non è una «fonte
  pubblica» nel senso di D-027 (ricostruzioni da fonti pubbliche).

#### Paoletta

- **Fonte:** Paola Sersante («Paoletta»), «Pizza di Paoletta da fare in
  fretta», Anice & Cannella, 05/02/2018 (aggiornata il 09/07/2025),
  https://www.aniceecannella.com/la-pizza-di-paoletta-da-fare-in-fretta/.
  Stato **verificato**. L'autrice scrive di averla pubblicata prima nel suo
  gruppo Facebook; Pan per Focaccia (Cristina Lionetti, 31/01/2014,
  https://www.panperfocacciablog.com/2014/01/la-pizza-da-fare-in-fretta-di-paoletta.html)
  la riprende ×1,5, con miele al posto del malto e «15 g lievito di birra
  fresco»: conferma che il lievito è fresco.
- **Fatto.** Ore 16.30: setacciare 300 g di farina W 330 o Caputo rossa W 280
  («in alternativa 50% manitoba + 50% 0 per pizza»), 50 g di semola rimacinata
  di grano duro, 50 g di enkir o tritordeum o farro, 1 cucchiaio di fiocchi di
  patate («facoltativi»). In planetaria 320 g d'acqua, 10 g di lievito di
  birra e 1 cucchiaino di malto d'orzo, sciolti per un minuto con la foglia;
  le farine; 8 g di sale a poco a poco; incordare; 20 g d'olio a filo. Ciotola
  unta e coperta per 2 h. Ore 19: pieghe di sovrapposizione, arrotondare, 1 h
  coperto a campana. Ore 20.15: forno ventilato o funzione pizza al massimo
  (250–280 °C). Alta: tutto l'impasto nella placca del forno ben oliata, 30
  minuti; bassa: ingredienti +50 % in 2 teglie 30×40 ben oliate, 30 minuti.
  Ore 20.50: pomodoro e sale, prima tacca del forno finché il cornicione
  colora (circa 8 minuti), mozzarella e olio, tacca alta per 4–5 minuti.
- **Lettura.** I fiocchi sono facoltativi per l'autrice, il malto no.

### 9.3 Dosi convertite da Vulcan (D-066)

**Conversioni.** Il cucchiaino di casa non è una misura standard: le fonti
qui sotto valgono per il cucchiaino raso statunitense (4,93 ml). Il margine
sui grammi piccoli (sale, zucchero, malto, fiocchi) è una stima di Vulcan,
circa ±25 %; la prova pratica di Matteo (§2) può pesarli.

| Misura della fonte | Grammi | Fonte della conversione | Stato |
|---|---|---|---|
| 1 ml d'acqua | 1,0 g (0,998 g/ml a 20 °C) | convenzione; la densità a 20 °C va citata nel registro con una fonte di riferimento | plausibile (scarto < 0,5 %) |
| 1 ml d'olio d'oliva | 0,913 g | Codex Alimentarius, CODEX STAN 33-1981 Rev. 1-1989, §3.1.2.1: densità relativa 0,910–0,916 (20 °C / acqua a 20 °C), https://www.fao.org/4/y2774e/y2774e04.htm | verificato |
| 1 cucchiaino di sale fino | 6 g | King Arthur Baking, «Ingredient weight chart» (sale da tavola, 1 cucchiaio = 18 g), https://www.kingarthurbaking.com/learn/ingredient-weight-chart | verificato per la misura USA, plausibile per casa |
| 1 cucchiaino di zucchero | 4,1 g | idem (zucchero semolato, 1 cup = 198 g = 48 cucchiaini) | idem |
| 1 bustina di lievito secco | 7 g | Paneangeli, scheda del prodotto (sopra) | verificato |
| 1 cucchiaio di fiocchi di patate | 5,4 g | King Arthur (fiocchi per purè, ½ cup = 43 g = 8 cucchiai) | plausibile |
| 1 cucchiaino di malto d'orzo | 7 g se sciroppo; 3 g se in polvere | King Arthur (barley malt syrup, 2 cucchiai = 42 g; malto in polvere non diastatico, 2 cucchiai = 18 g) | plausibile: la fonte non dice quale malto |

Controllo incrociato: King Arthur dà 2 cucchiaini di lievito istantaneo = 6 g,
cioè 3 g a cucchiaino, la stessa stima già usata dall'app per il secco
(`recipe-phases.ts`).

**Benedetta Rossi (pagina Paneangeli), 1 teglia.**

| Ingrediente | Fonte | Grammi (Vulcan) | % sulla farina |
|---|---|---|---|
| Farina, metà manitoba e metà 00 | 250 + 250 g | 500 | 100 |
| Acqua tiepida | 400 ml | 399 | 79,8 |
| Olio d'oliva | 50 ml | 46 | 9,1 |
| Sale | 1 cucchiaino | 6 | 1,2 |
| Zucchero | 2 cucchiaini | 8 | 1,6 |
| Lievito di birra secco | 1 bustina | 7 | 1,4 (pari al 5,0 % di fresco per Paneangeli, al 4,2 % col rapporto 1:3 del motore) |

Totale 966 g; con la teglia 35×35 (1.225 cm², plausibile) **0,79 g/cm²**.
Condimento della fonte: 300 g di salsa (0,24 g/cm²) e 250 g di mozzarella
(0,20 g/cm²). Tempi: 2 h al caldo + 10 minuti in teglia; cottura 25 + 5
minuti a 210 °C statico.

**Adriano Continisio, 3 teglie 30×35** (grammi della fonte, nessuna
conversione tranne il malto facoltativo).

| Ingrediente | Grammi | % sulla farina |
|---|---|---|
| Farina W 250 | 900 (450 nel preimpasto) | 100 |
| Acqua | 720 (450 nel preimpasto) | 80 |
| Olio extravergine | 45 | 5,0 |
| Sale | 18 | 2,0 |
| Lievito di birra fresco | 4,5 (tutto nel preimpasto) | 0,50 |
| Malto d'orzo, facoltativo | 1 cucchiaino ≈ 7 (sciroppo) | 0,8 |

Preimpasto: 50 % della farina, idratato al 100 %. Totale 1.687,5 g senza
malto: 562,5 g per teglia, 1.050 cm², **0,536 g/cm²** (come al §2).

**Paoletta, dose della fonte (alta, nella placca del forno).**

| Ingrediente | Fonte | Grammi (Vulcan) | % sulla farina |
|---|---|---|---|
| Farina W 330 (o Caputo rossa W 280) | 300 g | 300 | 75 |
| Semola rimacinata di grano duro | 50 g | 50 | 12,5 |
| Enkir, tritordeum o farro | 50 g | 50 | 12,5 |
| Acqua | 320 g | 320 | 80 |
| Lievito di birra fresco | 10 g | 10 | 2,5 |
| Sale | 8 g | 8 | 2,0 |
| Olio extravergine | 20 g | 20 | 5,0 |
| Malto d'orzo | 1 cucchiaino | 7 (sciroppo) o 3 (polvere) | 1,75 o 0,75 |
| Fiocchi di patate, facoltativi | 1 cucchiaio | 5,4 | 1,35 |

Totale circa 770 g. La placca del forno non ha una misura nella fonte: g/cm²
non calcolabile (**Ipotesi:** con una placca 40×30, 0,64 g/cm²). Versione
bassa (+50 %, 2 teglie 30×40): 578 g per teglia, **0,48 g/cm²**. Tempi: 2 h +
1 h + 30 minuti in teglia; cottura circa 8 + 4–5 minuti a 250–280 °C.

**Dekracap:** nessuna conversione finché la fonte non è letta.

**Dose della fonte e dose del modello.** Conto con `calculateYeastPercentage`
(`domain/fermentation-model.ts`) sulle ore e temperature indicate, senza le
correzioni di `equivalentFermentationHours`:

| Ricetta | Dose della fonte | Il motore darebbe | Rapporto |
|---|---|---|---|
| Benedetta, circa 2 h 10 al caldo (24–28 °C, scelta di chi scrive) | 1,4 % secco | 0,09–0,12 % secco | 12–16 volte meno |
| Paoletta, circa 3 h 30 (24–26 °C) | 2,5 % fresco | 0,22–0,25 % fresco | 10–11 volte meno |
| Adriano, 9–11 h (22–24 °C) | 0,5 % fresco | 0,11–0,15 % fresco | 3–4,5 volte meno |
| Dekracap, 48 h (ipotesi 0,254 %, tipo ignoto) | — | a 4 °C 0,14 % fresco o 0,047 % secco; a 8 °C 0,12 % o 0,039 % | 2–6,5 volte meno |

**Lettura.** Le ricette in giornata usano molto più lievito di quanto il
modello (ancorato a 0,1 % di fresco per 24 h a 18 °C) calcoli per le stesse
ore: è una scelta degli autori (tempi certi in una cucina qualsiasi), non un
errore. Con la dose del motore i tempi della fonte non tornano, quindi serve
«lievito della fonte» (§1: la dose della fonte resta, la stima si dichiara).

### 9.4 Cosa serve al motore

**Che cosa c'è già (verificato sul codice).**

- **Temperatura.** Il motore accetta qualunque temperatura (parametri
  avanzati 1–30 °C; MCP 1–35 °C). Solo i tipi
  `InterpretationParameterOverrides.fermentation_temp_c`
  (`data/interpretation-library.ts:36`) e `StyleVersion.params.fermentation_temp_c`
  (`data/style-versions.ts:44`) sono `4 | 12 | 22`; la scelta rapida della UI
  mostra un altro valore come «manuale», in sola lettura (G2-WP-02,
  `features/recipe/recipe-configurator.tsx`).
- **Soglie del freddo diverse.** `FRIDGE_MAX_TEMP_C = 6`
  (`domain/fermentation-constants.ts`: passo «in frigo», tolleranze,
  `isColdPhase` in `use-cases/cook-timing.ts`), `isCold = fermentation_temp_c <= 6`
  (`features/recipe/recipe-output-format.ts:471`), ma
  `COLD_RETARD_MAX_C = 8` (`data/troubleshooting-data.ts:272`). A 8 °C
  l'impasto sarebbe «in frigo» per i problemi e «fuori frigo» per la timeline.
- **Profilo del metodo.** `MethodProcessProfile` (`domain/pizza-engine.ts:211`)
  ha `direct_only`, `proof_hours`, `proof_in_pan`: basta per Benedetta
  (puntata di 2 h, appretto in teglia di 10 minuti).
- **Fasi.** `fermentationPhases` (`pizza-engine.ts:1654`) ricava le fasi dalle
  ore totali: pre-fermento = min(obiettivo, max(40 %, totale − 8 h)) con
  obiettivo poolish 14 h (`PRE_FERMENT_TARGET_HOURS`, `domain/pre-ferment-split.ts`,
  D-050), resto diviso 2:1 fra puntata e appretto. Una sola temperatura per
  tutta la fermentazione; l'appretto e il pre-fermento almeno a 18 °C
  (`phaseTemperatureC`, `PROOF_MIN_TEMP_C`). Il preimpasto di 3 h e l'appretto
  a 28 °C di Adriano, o le tre fasi di Paoletta (2 h, 1 h, 30 minuti), non si
  esprimono.
- **Pre-fermento.** Poolish 1:1 con quota 20–50 % (`computePreFermentSplit`,
  `maxPreFermentFlourPct`): il 50 % di Adriano ci sta.
- **Lievito.** `generateRecipe` sceglie il tipo dalla dispensa e calcola la
  dose da ore e temperatura (`pizza-engine.ts`, 2143–2195): non si può imporre
  tipo e dose della fonte. Rapporto secco/fresco 0,33 (`YEAST_DRY_RATIO`,
  AVPN); Paneangeli dice 7:25 (0,28), Adriano 1:2,5 (0,4).
- **Ingredienti dell'impasto.** `DoughParameters` conosce farina, acqua, sale,
  un grasso, zucchero e lievito. `flour_blend` (VPL-B2) c'è, ma un componente
  senza `w` vale come senza glutine: semola ed enkir abbasserebbero la «forza
  efficace» come se fossero riso.
- **Cottura in due tempi** (pomodoro, poi mozzarella): nessun punto «durante
  la cottura» nella timeline; come in A1 e A2 lo dice il testo del passo
  (§4.1), il punto vero resta per la tranche C.
- **Tipo dell'interpretazione.** `master | pizzeria | community |
  disciplinare`; l'avviso «Ispirata a…» si mostra solo per `master` e
  `pizzeria` (`features/recipe/interpretation-narrative-card.tsx:325`).
  Benedetta, Adriano e Paoletta non sono pizzaioli; Dekracap è un iscritto a
  un forum.
- **Riferimento dello stile.** `STYLE_REFERENCES` (`style-versions.ts:820`)
  accetta una versione o un disciplinare, non una versione d'autore.
- **ID.** `teglia_casalinga` è una versione della teglia romana
  (`style-versions.ts`), salvata nei link (`?v=teglia_casalinga`,
  `data/saved-recipes.ts:44`). Uno stile con lo stesso ID non rompe nulla, ma
  ricerca, MCP e link diventerebbero ambigui: proposta `teglia_in_giornata`.
- **Conteggi fissi.** 29 stili in `domain/persona-consistency.test.ts:95` e
  `agent/mcp-kitchen-parity.test.ts:66`; tre scenari golden per stile
  (`domain/golden/recipes.golden.test.ts`); almeno una foto per stile
  (`data/style-editorial.test.ts:50`).

**Che cosa manca, per pacchetto.**

1. **M1, lievito della fonte (B1).** `Interpretation.source_yeast?: { type:
   "fresh" | "dry"; pct: number }` in `interpretation-library.ts`;
   `GenerateRecipeOptions.sourceYeast` in `pizza-engine.ts`; in
   `generateRecipe` la dose è quella della fonte, senza
   `yeast_speed_factor`; se in dispensa manca quel tipo si converte col
   rapporto dichiarato. `science.yeast_model` porta anche la stima del
   modello, e `GeneratedRecipe` dice da dove viene la dose (fonte o modello).
   Passaggi: `use-cases/recipe-entry.ts` (88–217), `hooks/use-recipe-state.ts`
   (150–193), `agent/mcp-tools.ts` (campo in uscita, §8: MCP con le stesse
   informazioni), `features/recipe/yeast-explainer.tsx` (testo «dose della
   fonte; il modello stimerebbe…», 7 lingue). Nello stesso pacchetto: tipo
   d'interpretazione `autore` (persona non professionista: blog, TV, forum),
   con l'avviso «Ispirata a…»; base di riferimento `fonte` in
   `STYLE_REFERENCES` (`referenceInterpretationId` oggi vale solo per i
   disciplinari). Test: nuovo `source-yeast.test.ts` (dose invariata al
   variare di cucina e correzione personale, stima dichiarata, conversione
   quando manca il tipo); `recipe-reference.test.ts`; golden e
   `recipe-preset.test` invariati per i 29 stili. **Rischio basso**: campi
   facoltativi.
2. **M2, stile `teglia_in_giornata` (B2).** Voce in `domain/styles-db.ts`;
   righe in `data/parametric-databases.ts` (temperatura e tempo di cottura,
   staglio, sale, acqua, lievitazione, condimento, pieghe, attrezzatura);
   riferimento in `STYLE_REFERENCES`; interpretazione Benedetta; ricetta di
   condimento propria (margherita della teglia in giornata con le dosi della
   fonte, mozzarella a metà cottura scritta nel passo); testi CMS e
   `inspiration-i18n` in 7 lingue; foto. Proposta di parametri, scelta di
   Vulcan dalle tre fonti: W 260–330, idratazione 75–82 %, ore 2–12,
   `proof_in_pan`, forno di casa 200–280 °C (ideale 250), cottura 12–30
   minuti, 0,48–0,79 g/cm², teglia predefinita 30×40. Test: conteggi 29 → 30,
   tre scenari golden nuovi, foto, parità CMS; la ricetta Benedetta su una
   teglia 35×35 dà 500/399/46/6/8/7 g; fattibile con forno di casa a 250 °C e
   3 ore. **Rischio basso** per gli altri stili (classifica di
   `recommendStyles`: uno stile in più da misurare, come in FW-14).
3. **M3, fasi esplicite (B3).** `MethodProcessProfile.phases?`: elenco di
   fasi (pre-fermento, puntata, riposo dei panetti, appretto in teglia) con
   ore, temperatura facoltativa e criterio («al raddoppio», «fossetta»).
   Quando c'è, `fermentationPhases` e `equivalentFermentationHours` lo usano
   al posto delle quote (D-050 non si applica, e lo si dice);
   `phaseTemperatureC` legge la temperatura della fase; la timeline aggiunge
   riposo dei panetti e appretto in teglia. File: `pizza-engine.ts`,
   `use-cases/cook-timing.ts`, `domain/recipe-phases.ts`, `pre-ferment-split.ts`
   (solo lettura della quota). Test: Adriano (preimpasto 450 + 450 g per 3 h a
   20 °C, appretto a 28 °C), Paoletta (2 h + 1 h + 30 minuti), somme della
   timeline, tolleranze del freddo invariate; golden invariati. **Rischio
   medio**: `fermentationPhases` serve tutti gli stili; il ramo nuovo vale solo
   con il profilo.
4. **M4, ingredienti aggiuntivi e farine con glutine nel mix (B4).**
   `DoughParameters.extra_ingredients?: { id, pct, optional? }[]` (malto,
   miele, fiocchi di patate) nel totale (`totalPct`, `pizza-engine.ts` circa
   riga 2209), negli ingredienti, negli allergeni (`data/allergen-data.ts`: il
   malto d'orzo è già glutine; i fiocchi di patate vanno letti in etichetta),
   nelle diete (`data/dietary-data.ts`: il miele è già animale), nella
   dispensa (`domain/pantry-ingredients.ts`; i facoltativi si scelgono con
   `included_optional_ingredients`, come oggi); `flour_blend` con un campo
   `gluten` o con la W per semola ed enkir. Test: totali, allergeni, filtro
   vegano, facoltativi spenti di default. **Rischio basso-medio.**
5. **M5, 8 °C (B5), solo se la fonte lo dice.** Tipi da `4 | 12 | 22` a numero
   con controllo 1–30 nei due file; non spostare `FRIDGE_MAX_TEMP_C` (a 7–8 °C
   cambierebbe la timeline di ogni ricetta), ma segnare la fase «in frigo» nel
   profilo di M3. Test su `isColdPhase` e `step-trouble-context`.

### 9.5 Stile, versione d'autore o preset

- **Teglia casalinga in giornata: stile** (§3: impasto, forma e processo
  riconoscibili). Impasto intorno all'80 %, molto lievito, tutto in giornata,
  teglia di casa unta, appretto in teglia, forno di casa a 200–280 °C,
  mozzarella a metà cottura. Che cosa non è: la teglia romana (24–48 h a
  freddo, W 300–380, APITER), il preset «Casalinga» della teglia romana (18–36
  h in frigo), la focaccia (non nasce come base per pomodoro e mozzarella),
  lo sfincione. ID `teglia_in_giornata`, nome «Teglia casalinga in giornata».
- **Benedetta Rossi: versione d'autore** «Ispirata a Benedetta Rossi», con
  «dosi convertite da Vulcan», proposta come riferimento provvisorio dello
  stile (D-055).
- **Adriano Continisio: versione d'autore della teglia in giornata**
  (croccante, teglie non unte, preimpasto), non della teglia romana: è in
  giornata e a 250 °C nel forno di casa.
- **Paoletta: versione d'autore della teglia in giornata** («da fare in
  fretta»).
- **Dekracap: sospesa.** Se la fonte si legge, versione d'autore della
  `teglia_romana` (85 % e 48 h stanno negli intervalli 75–85 % e 24–48 h).
- **Preset:** nessuno nuovo. Il preset `teglia_casalinga` della teglia romana
  resta con il suo ID (i link continuano a funzionare, §8).

### 9.6 Pacchetti, ordine, budget, foto

| # | Pacchetto | Dimensione | Dipende da | Budget stimato (gzip) | Foto |
|---|---|---|---|---|---|
| B1 | M1: lievito della fonte, tipo `autore`, riferimento da fonte | M | — | codice +1–1,5 kB; per lingua +0,3 kB | — |
| B2 | M2: stile `teglia_in_giornata`, versione Benedetta, margherita della teglia in giornata | M | B1 | codice +1,5–2,5 kB; per lingua +1–1,5 kB | 1 (stile) |
| B3 | M3: fasi esplicite, versione Adriano | L | B1, B2 | codice +1,5–2,5 kB; per lingua +0,5–1 kB | — |
| B4 | M4: ingredienti aggiuntivi, versione Paoletta | M | B3 | codice +1–1,5 kB; per lingua +0,5 kB | — |
| B5 | Dekracap (e M5 se serve) | S | fonte letta, B1 | codice +0,5 kB; per lingua +0,3 kB | — |

**Budget.** Le cifre sono **ipotesi** (riferimento: i nove condimenti della A2
pesavano circa 3,9 kB d'italiano e 3,5 kB di giapponese); vanno misurate con
`npm run check:budget` a ogni pacchetto. In tutto circa 5,5–8,5 kB di codice
e 2,5–3,5 kB per lingua, cioè 8–12 kB per utente in giapponese. I limiti 465 /
570 kB vengono dal commit `f18e590` (ramo `claude/vulcan-review-l8ge34`, non
ancora su main, dove sono 500 / 600) con 451,0 / 557,3 kB misurati: margine
14 kB senza lingue e 12,7 kB per utente. **Lettura:** B1–B4 stanno nel
margine, ma lo consumano quasi tutto per utente. Per contenerlo: storie
d'autore di due frasi, riuso dei messaggi del motore esistenti, e il passo 4
del piano di `docs/budget-prestazioni.md` (testi italiani dei dati come
catalogo) prima della tranche C.

**Foto.** Una per lo stile nuovo (obbligatoria per il test): teglia
rettangolare di casa, pizza alta con pomodoro e mozzarella a cubetti. Le
versioni d'autore non hanno foto. Regole di D-039: originale in
`design-assets/originali/`, WebP con `scripts/build-responsive-images.py`,
generata solo se dichiarata.

### 9.7 Decisioni per Matteo

1. **Collocazione.** Uno stile `teglia_in_giornata` con tre versioni d'autore
   (Benedetta, Adriano, Paoletta), oppure tre stili, oppure Adriano sotto la
   teglia romana. *Raccomandazione: uno stile e tre versioni.*
2. **ID e nomi.** `teglia_in_giornata`, «Teglia casalinga in giornata».
   L'etichetta «Casalinga» del preset della teglia romana si presta alla
   confusione. *Raccomandazione: ID del preset invariato, etichetta «Facile».*
3. **Riferimento dello stile** (D-055): la conversione di Benedetta (serve la
   base `fonte`, B1) o il centro degli intervalli. *Raccomandazione:
   Benedetta, provvisorio.*
4. **Quale pagina di Benedetta.** La pagina Paneangeli (letta), quella
   ufficiale (illeggibile da qui) o la versione TV del 2019 (200 °C, 25 + 10
   minuti, da un blog non ufficiale). *Raccomandazione: pagina Paneangeli;
   Matteo apre la pagina ufficiale in un browser e conferma la teglia 35×35 e
   il sale (elenco «1 cucchiaino», passo «un pizzico»: proposta 6 g).*
5. **Marchio.** La ricetta di Benedetta è fatta in collaborazione con un
   produttore di lievito. *Raccomandazione: nei passi «1 bustina di lievito di
   birra secco (7 g)», senza marchio; il marchio solo nella fonte citata.*
6. **Lievito della fonte quando in dispensa manca quel tipo.** Rapporto del
   motore (1:3, AVPN) o quello della fonte (Paneangeli 7:25, Adriano 1:2,5).
   *Raccomandazione: tipo e dose della fonte come scritti; conversione solo
   se manca il tipo, col rapporto del motore e dichiarata.*
7. **«Luogo caldo» senza gradi** (Benedetta, Paoletta). *Raccomandazione:
   finestra 24–28 °C con il criterio «al raddoppio», 26 °C come valore del
   calcolo, dichiarato «scelta di Vulcan».*
8. **Tipo d'interpretazione per chi non è pizzaiolo.** *Raccomandazione:
   tipo nuovo `autore`, con l'avviso «Ispirata a…».*
9. **Dekracap.** (a) Matteo, con un account del forum, legge la discussione e
   ne salva una copia nel registro; (b) chiedere a GPT l'allegato
   `vulcan-candidati-e-verifiche.json` con l'URL e il testo citato; (c)
   rinunciare. *Raccomandazione: (b), poi (a); senza una fonte pubblica si
   rinuncia (D-027). Gli 8 °C si fanno solo se la fonte li dice.*
10. **Paoletta.** Malto in sciroppo (7 g) o in polvere (3 g); fiocchi di
    patate; farina (W 330 o Caputo rossa W 280) e terza farina (enkir,
    tritordeum o farro); versione alta (placca senza misura) o bassa (2 teglie
    30×40). *Raccomandazione: versione bassa 30×40, W 330, enkir, malto in
    sciroppo dichiarato, fiocchi facoltativi spenti di default.*
11. **Prova pratica** (§2). *Raccomandazione: Matteo cuoce almeno Benedetta e
    Paoletta convertite prima di «pubblicato» e il verbale va nel registro;
    se possibile la foto dello stile viene da lì.*
12. **Ordine.** *Raccomandazione: B1 → B2 → B3 → B4; B5 solo con la fonte.*

### 9.8 Decisioni di Matteo (30/10/2026)

- **Collocazione (1–3):** uno stile `teglia_in_giornata` («Teglia casalinga
  in giornata») con tre versioni d'autore. Matteo ha visto il confronto: la
  versione di Benedetta è alta e morbida (0,79 g/cm², 210 °C), quelle di
  Adriano e Paoletta sono basse e croccanti (0,48–0,54 g/cm², 250 °C e oltre).
  Anche così ha scelto di non dividere in due stili. Riferimento: Benedetta,
  provvisorio. Il preset «Casalinga» della teglia romana tiene il suo ID.
- **Marchio (5), lievito della fonte (6), «luogo caldo» a 26 °C (7),
  Paoletta (10):** approvate le raccomandazioni.
- **Benedetta (4):** pagina Paneangeli. La verifica della pagina ufficiale
  (teglia 35×35, sale) è affidata a un agente con il Safari di Matteo; fino
  ad allora restano la teglia 35×35 «plausibile» e il sale a 6 g.
- **Dekracap (9):** la discussione è dietro login. Un agente con accesso al
  Safari di Matteo (già autenticato) la trascrive con URL, autore e data; si
  decide dopo averla letta. Gli 8 °C solo se la fonte li dice.
- **Prova pratica (11):** non prima di pubblicare. Le ricette escono dopo
  le verifiche del motore (test e prove nel browser); le prove in cucina, se
  arrivano, vanno nel registro dopo.
- **Ordine (12):** B1 → B2 → B3 → B4; B5 (Dekracap) solo con la fonte.
