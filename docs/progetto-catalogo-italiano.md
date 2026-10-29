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

## 7. Tranche

**Prerequisito.** Cataloghi lingua divisi in modo che i condimenti nuovi non
superino il tetto di 100 kB del chunk più grande (oggi `ja` 98,5 kB).

**A — Condimenti e correzioni.** §4, con dosi per formato, allergeni,
dispensa, ricerca e 7 lingue.

**B — Casalinga e autori.** Teglia casalinga, Adriano, Dekracap, con
«lievito della fonte», 8 °C e fasi esplicite; poi Paoletta.

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
