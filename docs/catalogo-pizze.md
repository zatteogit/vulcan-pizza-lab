# Catalogo Completo delle Pizze — Vulcan Pizza Lab

Questo catalogo raccoglie e documenta tutti gli stili di pizza, le varianti di impasto, le ricette d'autore (firme) e le combinazioni di condimento (toppings) definiti ed implementati finora nella codebase di Vulcan Pizza Lab.

I dati sono stati estratti direttamente dai database e file di configurazione del motore di calcolo dell'applicazione:
*   [pizza-engine.ts](file:///Users/matteo/dev/Vulcan/src/app/components/pizza-engine.ts) (Stili base e famiglie)
*   [parametric-databases.ts](file:///Users/matteo/dev/Vulcan/src/app/components/parametric-databases.ts) (Parametri fisici e attrezzature)
*   [style-versions.ts](file:///Users/matteo/dev/Vulcan/src/app/components/style-versions.ts) (Versioni e livelli di abilità)
*   [impasto-library.ts](file:///Users/matteo/dev/Vulcan/src/app/components/impasto-library.ts) (Metodologie e lavorazioni)
*   [signature-recipes.ts](file:///Users/matteo/dev/Vulcan/src/app/components/signature-recipes.ts) (Ricette d'autore o "Firme")
*   [topping-library.ts](file:///Users/matteo/dev/Vulcan/src/app/components/topping-library.ts) (Concetti e varianti di condimento)

---

## 1. Famiglie di Pizze

Gli stili sono raggruppati in **4 famiglie principali** che determinano l'approccio culturale ed i flussi di lavoro:

| Famiglia | Emoji | Descrizione |
| :--- | :--- | :--- |
| **Napoletana** | 🇮🇹 | Leggerezza, lievitazione naturale, stesura a mano e cottura velocissima ad altissima temperatura. |
| **Romana** | 🏛️ | Dalla croccantezza estrema della Scrocchiarella tonda all'alta idratazione della teglia e della pala. |
| **Americana** | 🗽 | Adattamenti italo-americani incentrati su praticità, street food, teglie generose e combinazioni ricche. |
| **Contemporanea** | 🔬 | Sperimentazione su digeribilità, farine alternative, altissime idratazioni e tecniche di lievitazione avanzate. |

---

## 2. Stili di Pizza (28 stili)

Di seguito l'elenco ordinato di tutti i **28 stili di pizza** configurati nel motore dell'applicazione:

### 1. Napoletana STG (`napoletana_stg`)
*   **Famiglia**: Napoletana | **Origine**: Napoli, Italia | **Emoji**: 🍕
*   **Impasto**: Idratazione `55% - 62%`, farina `W 250 - 320` (`P/L 0.55 - 0.70`), sale `2.5%`, grassi `nessuno`. Fermentazione `8h - 24h` (temperatura ambiente).
*   **Cottura**: Forno a legna o elettrico alta temperatura (`>430°C`). Ideale `485°C` per `75s` (range `60 - 90s`).
*   **Forma**: Tonda, panetto da `250g`, stesura a mano ("schiaffo").
*   **Descrizione**: L'icona del disciplinare ufficiale AVPN. Morbida, elastica, con bordo leopardato basso.

### 2. Napoletana Canotto (`napoletana_canotto`)
*   **Famiglia**: Napoletana | **Origine**: Napoli (contemporanea) | **Emoji**: 🎈
*   **Impasto**: Idratazione `65% - 75%`, farina `W 280 - 340` (`P/L 0.55 - 0.70`), sale `2.8%`, grassi `nessuno`. Fermentazione `18h - 72h` (frigo + ambiente).
*   **Cottura**: Forno elettrico/gas ad alta temperatura (`>400°C`). Ideale `450°C` per `120s` (range `90 - 150s`).
*   **Forma**: Tonda, panetto da `280g`, stesura a mano ultra-delicata per spingere l'aria sul bordo.
*   **Descrizione**: Versione moderna con cornicione estremamente alto e alveolato ("a canotto") grazie a maturazioni lunghe.

### 3. Teglia Romana (`teglia_romana`)
*   **Famiglia**: Romana | **Origine**: Roma, Italia | **Emoji**: 📐
*   **Impasto**: Idratazione `75% - 85%`, farina `W 280 - 320` (`P/L 0.50 - 0.60`), sale `2.5%`, olio EVO `2.5%`. Fermentazione `24h - 72h` (frigo).
*   **Cottura**: Forno elettrico standard con pietra o in teglia. Ideale `280°C` per `17 min` (`1020s`).
*   **Forma**: Rettangolare, panetto da `800g` per teglia `40x30cm`.
*   **Descrizione**: Pizza al taglio spessa, leggera, alveolata, con fondo dorato e croccante grazie all'olio e mollica soffice.

### 4. Tonda Romana (`tonda_romana`)
*   **Famiglia**: Romana | **Origine**: Roma, Italia | **Emoji**: 🏛️
*   **Impasto**: Idratazione `50% - 55%`, farina `W 200 - 240` (`P/L 0.50 - 0.60`), sale `2.5%`, grassi `nessuno` (o strutto opzionale). Fermentazione `8h - 24h`.
*   **Cottura**: Forno elettrico o a legna. Ideale `320°C` per `6 min` (`360s`).
*   **Forma**: Tonda sottilissima, panetto da `200g`, stesa rigorosamente con il mattarello.
*   **Descrizione**: La vera "scrocchiarella" romana: piatta, friabile, senza bordo e croccante fino al centro.

### 5. Pinsa Romana (`pinsa_romana`)
*   **Famiglia**: Romana | **Origine**: Roma (moderna) | **Emoji**: 🌾
*   **Impasto**: Idratazione `75% - 85%`, farina mix (frumento, riso, soia) `W 280 - 340`, sale `2.5%`, olio `2.5%`. Fermentazione `24h - 72h` (frigo).
*   **Cottura**: Forno elettrico alta temperatura. Ideale `380°C` per `4 min` (`240s`).
*   **Forma**: Ovale allungata, panetto da `280g`, stesa premendo con le dita.
*   **Descrizione**: Mix di farine ad alta idratazione che produce un interno morbido e una crosta croccante e leggera.

### 6. New York Style (`new_york`)
*   **Famiglia**: Americana | **Origine**: New York, USA | **Emoji**: 🗽
*   **Impasto**: Idratazione `58% - 65%`, farina di forza `W 280 - 340`, sale `2.0%`, olio `2.0%`, zucchero `1.0%`. Fermentazione `24h - 72h` (frigo).
*   **Cottura**: Forno elettrico standard con baking steel/pietra. Ideale `290°C` per `10 min` (`600s`).
*   **Forma**: Tonda grande (diametro `35 - 40cm`), panetto da `300g` (o più per formati XL).
*   **Descrizione**: La fetta a spicchi sottile e pieghevole ("foldable slice"). Bordo pronunciato e gommoso.

### 7. Detroit Style (`detroit`)
*   **Famiglia**: Americana | **Origine**: Detroit, USA | **Emoji**: 🚗
*   **Impasto**: Idratazione `70% - 75%`, farina `W 280 - 320`, sale `2.0%`, olio `2.0%`. Fermentazione `24h - 48h` (frigo).
*   **Cottura**: Teglia rettangolare profonda di ferro blu ("blue steel pan"). Ideale `270°C` per `13 min` (`780s`).
*   **Forma**: Rettangolare spessa, panetto da `500g` per teglia `25x20cm`.
*   **Descrizione**: Nata nelle teglie industriali usate per i motori a Detroit. Formaggio fino al bordo che crea una crosta nera e caramellata ("cheese crown").

### 8. Chicago Deep Dish (`chicago_deep`)
*   **Famiglia**: Americana | **Origine**: Chicago, USA | **Emoji**: 🍕
*   **Impasto**: Idratazione `48% - 52%`, farina `W 220 - 260`, sale `1.5%`, burro/strutto `12%` (per l'effetto frolla), olio `2.0%`. Fermentazione `24h - 48h`.
*   **Cottura**: Teglia tonda profonda imburrata. Ideale `225°C` per `30 min` (`1800s`).
*   **Forma**: Tonda profonda ("deep dish"), panetto da `450g`.
*   **Descrizione**: Più simile a una torta salata che a una pizza tradizionale. Strati invertiti: fette di mozzarella sul fondo, ripieno di carne, salsa di pomodoro a pezzi sopra.

### 9. Teglia Metodo Bonci (`bonci_teglia`)
*   **Famiglia**: Contemporanea | **Origine**: Roma (G. Bonci) | **Emoji**: ☁️
*   **Impasto**: Idratazione `80% - 90%`, farina `W 300 - 340`, sale `2.5%`, olio EVO `3.0%`. Fermentazione `24h - 72h` (frigo, no-knead spinto).
*   **Cottura**: Teglia alluminio. Ideale `280°C` per `17 min` (`1020s`).
*   **Forma**: Rettangolare, panetto da `700g` per teglia `40x30cm`.
*   **Descrizione**: Impasto ad altissima idratazione, leggerissimo e spumoso, caratterizzato da riposi contiui ed assenza di impastamento meccanico.

### 10. Focaccia Genovese (`focaccia_genovese`)
*   **Famiglia**: Contemporanea | **Origine**: Genova, Liguria | **Emoji**: 🥖
*   **Impasto**: Idratazione `55% - 62%`, farina `W 240 - 280`, sale `2.0%`, olio EVO `6.0%`, malto `1.0%`. Fermentazione `4h - 24h`.
*   **Cottura**: Teglia oliata. Ideale `230°C` per `22 min` (`1320s`).
*   **Forma**: Rettangolare o tonda spessa, panetto da `600g`.
*   **Descrizione**: Focaccia caratteristica con fossette marcate create con le dita unte, in cui si raccoglie la tipica salamoia di acqua, sale e olio EVO.

### 11. Sfincione Palermitano (`sfincione`)
*   **Famiglia**: Contemporanea | **Origine**: Palermo, Sicilia | **Emoji**: 🧅
*   **Impasto**: Idratazione `60% - 70%`, farina `W 240 - 280`, sale `2.5%`, olio `3.0%`. Fermentazione `4h - 24h`.
*   **Cottura**: Teglia oliata. Ideale `220°C` per `23 min` (`1380s`).
*   **Forma**: Rettangolare spessa, panetto da `500g`.
*   **Descrizione**: Focaccia palermitana spessa, condita con salsa densa di pomodoro e cipolle stufate, acciughe, caciocavallo e pangrattato tostato.

### 12. Pala Romana (`pala_romana`)
*   **Famiglia**: Romana | **Origine**: Roma, Italia | **Emoji**: 🥖
*   **Impasto**: Idratazione `75% - 82%`, farina `W 280 - 320` (`P/L 0.50 - 0.65`), sale `2.5%`, olio EVO `2.0%`. Fermentazione `18h - 72h` (frigo).
*   **Cottura**: Direttamente su pietra refrattaria, scivolata dalla pala di legno/alluminio. Ideale `350°C` per `5 min` (`300s`).
*   **Forma**: Ovale allungata rettangolare, panetto da `350g`.
*   **Descrizione**: Pizza croccante fuori e morbida dentro con alveolatura pronunciata. Tradizionale dei forni della Capitale.

### 13. Grandma Style (`grandma_style`)
*   **Famiglia**: Americana | **Origine**: Long Island, NY | **Emoji**: 👵
*   **Impasto**: Idratazione `60% - 65%`, farina `W 240 - 280`, sale `2.0%`, olio `3.0%`. Fermentazione `4h - 24h`.
*   **Cottura**: Teglia metallica ben oliata. Ideale `250°C` per `15 min` (`900s`).
*   **Forma**: Rettangolare sottile, panetto da `600g`.
*   **Descrizione**: Nata nelle case degli immigrati italo-americani. Bassa, rustica, cotta velocemente, con formaggio sul fondo e salsa di pomodoro a cucchiaiate stesa sopra.

### 14. Focaccia di Recco IGP (`focaccia_recco`)
*   **Famiglia**: Contemporanea | **Origine**: Recco, Liguria | **Emoji**: 🧀
*   **Impasto**: Idratazione `45% - 50%`, farina forte `W 300 - 340`, sale `2.0%`, olio EVO `5.0%`. *Niente lievito*. Fermentazione/riposo `1h - 4h` a temp ambiente per distendere il glutine.
*   **Cottura**: Teglia di rame oliata. Ideale `320°C` per `9 min` (`540s`).
*   **Forma**: Tonda sottilissima, due dischi da `150g` ciascuno.
*   **Descrizione**: Focaccia sottilissima, quasi trasparente, farcita all'interno con crescenza/stracchino ligure fondente.

### 15. Padellino Torinese (`padellino_torino`)
*   **Famiglia**: Contemporanea | **Origine**: Torino, Piemonte | **Emoji**: 🍳
*   **Impasto**: Idratazione `60% - 65%`, farina `W 240 - 280`, sale `2.5%`, olio EVO `2.0%`, zucchero `0.5%`. Fermentazione `6h - 24h`.
*   **Cottura**: In tegamino/padellino individuale di ferro o alluminio. Ideale `250°C` per `15 min` (`900s`).
*   **Forma**: Tonda spessa individuale, panetto da `200g` per diametro `18cm`.
*   **Descrizione**: Stile sabaudo cotto al tegamino. Bordo soffice e alto, base quasi "fritta" nell'olio sul fondo della teglia.

### 16. Pizza Baciata (`pizza_baciata`)
*   **Famiglia**: Romana | **Origine**: Roma, Italia | **Emoji**: 💋
*   **Impasto**: Idratazione `75% - 85%`, farina `W 280 - 340` (`P/L 0.50 - 0.60`), sale `2.5%`, olio EVO `2.5%`. Fermentazione `24h - 48h` (frigo).
*   **Cottura**: Due dischi oliati sovrapposti, cotti in bianco in teglia. Ideale `285°C` per `16 min` (`960s`).
*   **Forma**: Rettangolare, panetto da `800g` (diviso in due da `400g` sovrapposti).
*   **Descrizione**: Stile romano da panificio: i due dischi cotti si sdoppiano facilmente grazie alla spennellata di olio centrale, venendo farciti a freddo.

### 17. Ciaccino Senese (`ciaccino_senese`)
*   **Famiglia**: Contemporanea | **Origine**: Siena, Toscana | **Emoji**: 🥪
*   **Impasto**: Idratazione `60% - 65%`, farina `W 220 - 280` (`P/L 0.50 - 0.65`), sale `2.0%`, strutto/olio `5.0%`. Fermentazione `4h - 12h`.
*   **Cottura**: Teglia chiusa. Ideale `250°C` per `17 min` (`1020s`).
*   **Forma**: Tonda spessa ripiena, panetto da `700g` (due dischi da `350g` sigillati ai bordi).
*   **Descrizione**: Pizza ripiena toscana: i due dischi racchiudono prosciutto cotto e formaggio filante prima della cottura.

### 18. Pizza Patate e Porchetta (`pizza_patate_porchetta`)
*   **Famiglia**: Romana | **Origine**: Roma (G. Bonci) | **Emoji**: 🥔
*   **Impasto**: Idratazione `75% - 85%`, farina `W 280 - 340`, sale `2.5%`, olio `2.5%`. Fermentazione `24h - 48h` (frigo).
*   **Cottura**: Teglia con patate sopra. Ideale `285°C` per `17 min` (`1020s`).
*   **Forma**: Rettangolare, panetto da `800g` (struttura baciata sdoppiabile).
*   **Descrizione**: Variante della baciata con patate a velo sulla superficie in cottura e farcitura post-bake di porchetta d'Ariccia IGP.

### 19. Trancio Milanese (`trancio_milanese`)
*   **Famiglia**: Contemporanea | **Origine**: Milano, Lombardia | **Emoji**: 🥪
*   **Impasto**: Idratazione `65% - 75%`, farina forte `W 280 - 340`, sale `2.2%`, olio `4.0%`, zucchero `0.5%`. Fermentazione `18h - 36h`.
*   **Cottura**: Cotta in teglia oliata. Ideale `240°C` per `16 min` (`960s`).
*   **Forma**: Rettangolare spessa, panetto da `600g` per teglia `33x25cm`.
*   **Descrizione**: Pizza spessa e soffice tipica delle pizzerie storiche milanesi. Fondo dorato e croccante grazie all'olio.

### 20. Chicago Tavern Cut (`chicago_tavern`)
*   **Famiglia**: Americana | **Origine**: Chicago, USA | **Emoji**: 🟫
*   **Impasto**: Idratazione `50% - 58%`, farina `W 240 - 290`, sale `2.0%`, olio `4.0%`, zucchero `1.5%`. Fermentazione `18h - 36h`.
*   **Cottura**: Su pietra refrattaria. Ideale `260°C` per `12 min` (`720s`).
*   **Forma**: Tonda molto sottile, panetto da `380g` per diametro `35cm`.
*   **Descrizione**: Pizza sottile e croccante cracker-like tagliata a quadrotti ("party cut"), nata come spuntino nei bar di Chicago.

### 21. Focaccia Barese (`focaccia_barese`)
*   **Famiglia**: Contemporanea | **Origine**: Bari, Puglia | **Emoji**: 🫒
*   **Impasto**: Idratazione `70% - 80%`, farina mix semola rimacinata `W 220 - 280`, sale `2.0%`, olio `4.0%`. Contiene patata lessa nell'impasto. Fermentazione `8h - 24h`.
*   **Cottura**: In teglia tonda di ferro ("ruoto"). Ideale `240°C` per `22 min` (`1320s`).
*   **Forma**: Tonda spessa, panetto da `500g` per diametro `32cm`.
*   **Descrizione**: Mollica umida e soffice grazie alla patata nell'impasto, arricchita da pomodorini ciliegino schiacciati a mano, olive baresane, origano e molto olio EVO.

### 22. Pizza Fritta / Montanara (`pizza_fritta`)
*   **Famiglia**: Napoletana | **Origine**: Napoli | **Emoji**: 🍳
*   **Impasto**: Idratazione `60% - 65%`, farina `W 220 - 280`, sale `2.5%`, grassi `nessuno`. Fermentazione `4h - 8h`.
*   **Cottura**: Frittura in olio profondo. Temperatura ideale dell'olio `185°C` per `90s` (range `60 - 120s`).
*   **Forma**: Tonda piccola, panetto da `100g`.
*   **Descrizione**: Dischetto di impasto fritto, poi condito a caldo con passata cotta, ricotta fresca, pecorino e basilico.

### 23. Calzone Napoletano (`calzone_napoletano`)
*   **Famiglia**: Napoletana | **Origine**: Napoli | **Emoji**: 🥟
*   **Impasto**: Idratazione `58% - 62%`, farina `W 250 - 320`, sale `2.5%`, grassi `nessuno`. Fermentazione `8h - 24h`.
*   **Cottura**: Forno elettrico alta temperatura. Ideale `430°C` per `3 min` (`180s`).
*   **Forma**: Mezzaluna chiusa, panetto da `280g` (disco diametro `30cm` ripiegato).
*   **Descrizione**: Classico calzone napoletano farcito all'interno con ricotta, fior di latte, pepe e salame o cicoli.

### 24. Pizza al Metro (`pizza_al_metro`)
*   **Famiglia**: Napoletana | **Origine**: Vico Equense (NA) | **Emoji**: 📏
*   **Impasto**: Idratazione `62% - 70%`, farina `W 260 - 320`, sale `2.5%`, olio `1.0%`. Fermentazione `12h - 36h` (frigo + ambiente).
*   **Cottura**: Forno elettrico alta temperatura. Ideale `340°C` per `5 min` (`300s`).
*   **Forma**: Rettangolare lunga, panetto da `700g` per lunghezza `70cm`.
*   **Descrizione**: Formato conviviale steso in forma allungata, cotto su pietra refrattaria e servito a pezzi con più condimenti affiancati.

### 25. New Haven Apizza (`new_haven_apizza`)
*   **Famiglia**: Americana | **Origine**: New Haven, CT | **Emoji**: 🦪
*   **Impasto**: Idratazione `60% - 66%`, farina `W 240 - 300`, sale `2.0%`, olio `1.0%`. Fermentazione `24h - 72h` (frigo).
*   **Cottura**: Forno a carbone (coal-fired) o legna. Ideale `370°C` per `5 min` (`300s`).
*   **Forma**: Tonda irregolare e sottile, panetto da `300g` (diametro `38cm`).
*   **Descrizione**: Stile americano caratteristico: molto cotta, con crosta carbonizzata ("charred"), sottile ed elastica. Famosa per la variante alle vongole e aglio.

### 26. Fugazzeta Argentina (`fugazzeta`)
*   **Famiglia**: Americana | **Origine**: Buenos Aires, Argentina | **Emoji**: 🧅
*   **Impasto**: Idratazione `55% - 62%`, farina `W 200 - 260`, sale `2.0%`, olio `3.0%`, zucchero `1.0%`. Fermentazione `4h - 12h` (lievitazione rapida).
*   **Cottura**: Teglia tonda ("al molde"). Ideale `240°C` per `17 min` (`1020s`).
*   **Forma**: Tonda spessa farcita, panetto da `600g` (diviso in due dischi sovrapposti).
*   **Descrizione**: Doppia sfoglia ripiena di quintali di mozzarella filante e ricoperta in superficie da cipolla bianca a velo ed origano. Niente pomodoro.

### 27. California Style (`california_style`)
*   **Famiglia**: Americana | **Origine**: California, USA | **Emoji**: 🥑
*   **Impasto**: Idratazione `60% - 65%`, farina `W 240 - 300`, sale `2.0%`, olio `2.0%`, zucchero `0.5%`. Fermentazione `24h - 48h` (frigo).
*   **Cottura**: Forno elettrico ad alta temperatura o legna. Ideale `300°C` per `6 min` (`360s`).
*   **Forma**: Tonda sottile monoporzione, panetto da `230g` (diametro `30cm`).
*   **Descrizione**: Introdotta da Wolfgang Puck negli anni '80: base sottile classica guarnita con abbinamenti gourmet e freschi non convenzionali (pollo BBQ, fico, caprino, rucola).

### 28. Greek Pan Pizza (`greek_pan`)
*   **Famiglia**: Americana | **Origine**: New England, USA | **Emoji**: 🫓
*   **Impasto**: Idratazione `60% - 68%`, farina `W 220 - 280`, sale `2.0%`, olio `5.0%`. Fermentazione `4h - 12h`.
*   **Cottura**: Teglia rotonda d'acciaio pesantemente oliata. Ideale `245°C` per `14 min` (`840s`).
*   **Forma**: Tonda spessa, panetto da `400g` per diametro `30cm`.
*   **Descrizione**: Pizza diffusa nei diner americani gestiti da famiglie greche. Mollica spessa e spumosa, fondo fritto e croccante grazie all'abbondante olio nella teglia, cosparsa di mix mozzarella e cheddar.

---

## 3. Versioni dello Stile (Varianti UI/Configurator)

Alcuni stili dispongono di **versioni pre-configurate** a seconda del livello di abilità dell'utente (`skill_hint: 1=principiante, 2=intermedio, 3=esperto`) o del tempo a disposizione, che sovrascrivono i range predefiniti:

| Stile di Riferimento | Versione (ID) | Label | Emoji | Skill | Descrizione |
| :--- | :--- | :--- | :---: | :---: | :--- |
| **bonci_teglia** | `bonci_leggerissima` | Leggerissima | 🍃 | 1 | Sottile e digeribile: 75% idratazione, 24h frigo, ~600g/teglia. |
| | `bonci_casalingo` | Casalingo | 🏠 | 2 | Bonci accessibile: 78% idratazione, 24h frigo, ~720g/teglia. |
| | `bonci_pizzarium` | Pizzarium | 🍕 | 3 | Il canone di Pizzarium: 85% idratazione, 48h frigo, 3 stesure. |
| | `bonci_estremo` | Estremo | 🧪 | 3 | Sperimentale: 90% idratazione, 48-72h frigo, per esperti. |
| **teglia_romana** | `teglia_sottile` | Sottile | 📐 | 1 | Versione leggera per principianti: 70% idratazione, 24h frigo. |
| | `teglia_casalinga` | Casalinga | 🏠 | 2 | Per forni domestici classici: 75% idratazione, 24h frigo, 270°C. |
| | `teglia_classica` | Classica | 🎖️ | 2 | La teglia romana classica: 80% idratazione, 24h frigo, pieghe. |
| | `teglia_alta_idro` | Alta idratazione | 🌊 | 3 | Versione spinta: 85% idratazione, 48h frigo, per professionisti. |
| **napoletana_canotto** | `canotto_bilanciato` | Bilanciato | ⚖️ | 2 | Canotto gestibile: 68% idratazione, 24h frigo, W300. |
| | `canotto_martucci` | Stile Martucci | 👑 | 3 | Versione d'autore: 72% idratazione, 48h frigo, cornicione enorme. |
| | `canotto_estremo` | Estremo Pro | 🌋 | 3 | Canotto idratato: 75% idratazione, 48-72h frigo. |
| **napoletana_stg** | `napoletana_tradizionale` | Tradizionale | 🇮🇹 | 2 | Disciplinare AVPN: 58% idratazione, fermentazione 24h a temperatura ambiente. |
| | `napoletana_avpn` | Disciplinare AVPN | 📜 | 3 | Strict AVPN: 60% idratazione, farina W300, temperatura controllata 22°C. |
| **tonda_romana** | `tonda_casalinga` | Casalinga | 🏠 | 1 | Facile da stendere a mattarello: 55% idratazione, 12h fermentazione. |
| | `tonda_scrocchiarella` | Scrocchiarella | 💥 | 2 | Massima croccantezza: 50% idratazione, 24h fermentazione. |
| **focaccia_genovese** | `focaccia_tradizionale` | Tradizionale | 🥖 | 1 | Stile classico ligure: 58% idratazione, salamoia emulsionata. |
| | `focaccia_moderna` | Moderna | 🌀 | 2 | Alveolatura più aperta: 65% idratazione, autolisi 30 min. |
| **pinsa_romana** | `pinsa_moderna` | Moderna | 🌾 | 2 | Mix farine moderno: 80% idratazione, 24-48h maturazione frigo. |
| **new_york** | `ny_tradizionale` | Tradizionale | 🗽 | 2 | Stile pizzerie NY: 62% idratazione, farina forte con malto, 24-48h frigo. |
| | `ny_casalinga` | Casalinga | 🏠 | 1 | Per forno domestico: 60% idratazione, stesura facilitata. |
| **detroit** | `detroit_classica` | Classica | 🚗 | 2 | Detroit originale: 70% idratazione, teglia di ferro unta, frico laterale. |
| | `detroit_casalinga` | Casalinga | 🏠 | 1 | Detroit semplificata: 68% idratazione, teglia alluminio antiaderente. |
| **chicago_deep** | `chicago_classica` | Classica | 🥧 | 2 | Chicago Deep Dish originale: 48% idratazione, 12% burro/strutto, teglia profonda. |
| **sfincione** | `sfincione_tradizionale` | Tradizionale | 🧅 | 1 | Tradizionale siciliano: 65% idratazione, semola nell'impasto, teglia spessa. |
| | `sfincione_pro` | Pro | 👨‍🍳 | 2 | Struttura alveolata: 70% idratazione, 24h frigo. |
| **pala_romana** | `pala_casalingo` | Casalingo | 🏠 | 2 | Pala gestibile in forno casa: 75% idratazione, stesa su spianatoia. |
| | `pala_pizzeria` | Pizzeria | 🥖 | 3 | Stile forno romano: 80% idratazione, stesura su pala in legno e infornata. |
| **grandma_style** | `grandma_casalinga` | Casalinga | 🏠 | 1 | Ricetta casalinga semplice: 62% idratazione, teglia oliata. |
| | `grandma_li` | Long Island | 👵 | 2 | Stile Long Island: 65% idratazione, 24h frigo per crosta aromatica. |
| **padellino_torino** | `padellino_casalingo` | Casalingo | 🏠 | 1 | Cottura facilitata: 65% idratazione, lievitazione diretta nel tegamino. |
| | `padellino_torinese` | Torinese | 🍳 | 2 | Tradizione torinese: 70% idratazione, 24h frigo. |
| **focaccia_recco** | `recco_igp` | Disciplinare IGP | 🧀 | 2 | Due sfoglie sottilissime tirate a mano, stracchino/crescenza, senza lievito. |
| **pizza_baciata** | `baciata_tradizionale` | Tradizionale | 📐 | 2 | Impasto Teglia Romana classica, 80% idro, 24h frigo. |
| | `baciata_bonci` | Metodo Bonci | ☁️ | 3 | Idratazione 85%, no-knead, 48h frigo, impasto nuvola. |
| **pizza_patate_porchetta** | `patate_tradizionale` | Tradizionale | 📐 | 2 | Impasto Teglia Romana classica, 80% idro, 24h frigo. |
| | `patate_bonci` | Metodo Bonci | ☁️ | 3 | Idratazione 85%, no-knead, 48h frigo, stile pizza al taglio Bonci. |
| **trancio_milanese** | `trancio_casalingo` | Casalingo | 🏠 | 1 | 70% idratazione, 24h frigo. Ricetta accessibile, fondo dorato. |
| | `trancio_pizzeria` | Pizzeria | 🥪 | 2 | 72% idratazione, 36h frigo. Stile delle pizzerie milanesi storiche. |
| **chicago_tavern** | `tavern_classico` | Tavern | 🍺 | 1 | 55% idratazione, 24h frigo. La pizza classica dei pub di Chicago. |
| | `tavern_cracker` | Cracker thin | 🟫 | 2 | 52% idratazione, 36h frigo. Estremo croccante, biscottato. |

---

## 4. Metodi di Impasto (Libreria Impasti)

L'applicazione definisce **7 metodologie strutturate di lavorazione dell'impasto** riutilizzabili dagli stili:

1.  **Teglia Romana classica** (`teglia_romana_classica`) | 📐
    *   *Metodo*: No-knead con pieghe (`no_knead_folds`). Idratazione `75% - 85%`, W `300 - 360`, P/L `0.50 - 0.60`, sale `2.5%`, olio EVO `2.5%`.
    *   *Lavorazione*: 3 giri di pieghe a intervalli di 30 minuti, bulk a temperatura ambiente per 2 ore, poi riposo a freddo per 24-36h.
2.  **Metodo Bonci** (`bonci_metodo`) | ☁️
    *   *Metodo*: No-knead con pieghe (`no_knead_folds`). Idratazione `78% - 90%`, W `280 - 340`, P/L `0.50 - 0.65`, sale `2.5%`, olio EVO `3.0%`.
    *   *Lavorazione*: 4 giri di pieghe coil/stretch a intervalli di 30 minuti, riposo a temperatura ambiente per 90 minuti, poi 24-72h in frigo.
3.  **Diretto napoletano** (`napoletana_diretto`) | 🍕
    *   *Metodo*: Diretto breve (`direct_short`). Idratazione `55% - 62%`, W `250 - 320`, P/L `0.55 - 0.70`, sale `2.8%`, grassi `nessuno`.
    *   *Lavorazione*: Impasto a mano o in planetaria, 8-24h a temperatura ambiente.
4.  **Metodo a Biga** (`biga_indiretto`) | 🏗️
    *   *Metodo*: Biga indiretto (`biga_indirect`). Idratazione finale `65% - 78%`, W `300 - 350`, P/L `0.50 - 0.65`, sale `2.5%`, grassi `nessuno`.
    *   *Lavorazione*: Pre-fermento biga (44% idro, 1% lievito) per 18h a 18°C, poi rinfresco con restante acqua/farina e 24-72h in frigo.
5.  **Padellino diretto** (`padellino_diretto`) | 🍳
    *   *Metodo*: Diretto lungo (`direct_long`). Idratazione `65% - 75%`, W `260 - 320`, P/L `0.50 - 0.65`, sale `2.5%`, olio EVO `2.0%`, zucchero `0.5%`.
    *   *Lavorazione*: Impastamento standard, maturazione di 18-36h (frigo + lievitazione finale nel tegamino oliato).
6.  **Senza glutine** (`senza_glutine`) | 🌾
    *   *Metodo*: Diretto breve senza glutine (`direct_short`). Idratazione `80% - 100%`, sale `2.0%`, olio `4.0%`, zucchero `1.0%`.
    *   *Lavorazione*: Nessuna maglia glutinica (pastella densa da mescolare), modellato con mani bagnate o spatola. Riposo breve di 2-6h.
7.  **Integrale / multicereali** (`integrale_multicereali`) | 🌰
    *   *Metodo*: Autolisi ed impasto (`autolisi_then_knead`). Idratazione `70% - 80%`, W `200 - 280`, P/L `0.45 - 0.60`, sale `2.2%`, olio `2.0%`.
    *   *Lavorazione*: Autolisi iniziale di 60 minuti per idratare e ammorbidire la crusca, poi impasto e maturazione di 12-36h.

---

## 5. Ricette Iconiche / Firme (12 ricette)

Le **Ricette Iconiche (Firme)** sono combinazioni specifiche di Stile + Topping pre-selezionato con eventuali override di parametri (accessibili come deep-link da `/explore`):

1.  **Margherita Verace** (`margherita_verace`) | 🍅
    *   **Stile**: Napoletana STG | **Topping**: Margherita
    *   **Caratteristiche**: San Marzano DOP schiacciato a mano, fior di latte campano, basilico fresco e olio EVO. Disciplinare AVPN autentico.
2.  **Marinara** (`marinara_avpn`) | 🌿
    *   **Stile**: Napoletana STG | **Topping**: Marinara
    *   **Caratteristiche**: Solo pomodoro, fettine d'aglio fresco, origano di montagna ed olio EVO. Senza formaggio.
3.  **Cacio e Pepe** (`cacio_e_pepe_napoletana`) | ⚫
    *   **Stile**: Napoletana Canotto | **Topping**: Cacio e Pepe
    *   **Caratteristiche**: Crema densa di pecorino romano DOP ed acqua di cottura stesa sul calore residuo all'uscita dal forno, pepe nero schiacciato.
4.  **Salsiccia & Friarielli** (`salsiccia_friarielli`) | 🥬
    *   **Stile**: Napoletana STG | **Topping**: Salsiccia e Friarielli
    *   **Caratteristiche**: Cime di rapa (friarielli) saltate con aglio e peperoncino, salsiccia fresca sbriciolata e provola affumicata campana.
5.  **Patate e Porchetta** (`patate_e_porchetta`) | 🥔
    *   **Stile**: Pizza Baciata | **Topping**: Patate e Porchetta
    *   **Caratteristiche**: Strato superiore coperto di patate sottili arricciate e salate in cottura, interno farcito post-bake con porchetta d'Ariccia IGP calda.
6.  **Mortazza alla Pala** (`mortazza_alla_pala`) | 🥪
    *   **Stile**: Pala Romana | **Topping**: Bianca con Mortadella
    *   **Caratteristiche**: Pizza bianca aperta a metà e farcita a caldo con fette abbondanti di mortadella Bologna IGP e granella di pistacchi.
7.  **Scrocchiarella Boscaiola** (`scrocchiarella_boscaiola`) | 🍄
    *   **Stile**: Tonda Romana | **Topping**: Boscaiola
    *   **Caratteristiche**: Champignon freschi saltati, salsiccia sbriciolata e mozzarella distribuite sulla base ultrasottile e croccante.
8.  **Bonci al Taglio Margherita** (`bonci_margherita`) | ☁️
    *   **Stile**: Teglia Metodo Bonci | **Topping**: Margherita
    *   **Caratteristiche**: Idratazione 85%, stesura in teglia con dita. Passata di pomodoro arricchita, fior di latte e basilico inserito dopo la prima cottura.
9.  **Sfincione bianco** (`sfincione_bianca`) | 🏺
    *   **Stile**: Sfincione Palermitano | **Topping**: Bianca
    *   **Caratteristiche**: Pizza palermitana alta e soffice condita a crudo con olio EVO ligure/siciliano, aghi di rosmarino fresco e fior di sale.
10. **New York Pepperoni** (`ny_pepperoni`) | 🗽
    *   **Stile**: New York Style | **Topping**: Diavola
    *   **Caratteristiche**: Salsa di pomodoro condita (origano, zucchero), mozzarella low-moisture grattugiata, fette di salame pepperoni che si arricciano a coppetta.
11. **Detroit Pepperoni** (`detroit_pepperoni`) | 🚗
    *   **Stile**: Detroit Style | **Topping**: Diavola
    *   **Caratteristiche**: Brick cheese distribuito fino ai bordi per la crosta croccante caramellata (frico), fette di pepperoni e due strisce di salsa marinara sopra.
12. **Focaccia di Recco IGP** (`crescenza_recco_igp`) | 🧀
    *   **Stile**: Focaccia di Recco IGP | **Topping**: Crescenza alla Recco
    *   **Caratteristiche**: Sfoglie sottilissime senza lievito ripiene di crescenza fresca e cremosa. Disciplinare IGP.

---

## 6. Concetti di Condimento (24 concetti)

I **Topping Concepts** sono le definizioni astratte e culturali delle farciture, classificate per profilo di sapore:

| ID Topping | Nome | Emoji | Profilo Sapore | Descrizione |
| :--- | :--- | :---: | :--- | :--- |
| `margherita` | Margherita | 🍅 | Fresh | Pomodoro, mozzarella, basilico. La regina delle pizze. |
| `marinara` | Marinara | 🌿 | Fresh | Pomodoro, aglio fresco, origano, olio. Gusto mediterraneo. |
| `bianca` | Bianca | 🌾 | Light | Olio EVO, sale grosso, eventualmente aghi di rosmarino. |
| `boscaiola` | Boscaiola | 🍄 | Earthy | Funghi champignon/porcini e salsiccia, con o senza pomodoro. |
| `diavola` | Diavola / Pepperoni | 🌶️ | Spicy | Pomodoro, mozzarella e salame piccante. |
| `capricciosa` | Capricciosa | 🎭 | Rich | Pomodoro, mozzarella, cotto, funghi, carciofini, olive nere. |
| `quattro_stagioni` | Quattro Stagioni | 🍂 | Rich | Stessi ingredienti della Capricciosa ma divisi in spicchi. |
| `quattro_formaggi` | Quattro Formaggi | 🧀 | Creamy | Mozzarella, gorgonzola, fontina, parmigiano reggiano. |
| `ortolana` | Ortolana / Verdure | 🥗 | Fresh | Mozzarella, zucchine e melanzane grigliate, peperoni arrosto. |
| `patate_porchetta` | Patate e Porchetta | 🥔 | Rich | Patate a velo, rosmarino, sale e porchetta d'Ariccia IGP. |
| `bianca_mortazza` | Bianca con Mortadella | 🥪 | Salty/Savory | Mortadella Bologna IGP affettata fine e granella di pistacchi. |
| `cacio_e_pepe` | Cacio e Pepe | ⚫ | Salty/Savory | Crema di pecorino romano DOP saporita e pepe nero grattugiato. |
| `salsiccia_friarielli` | Salsiccia e Friarielli | 🥬 | Earthy | Salsiccia fresca sbriciolata, friarielli saltati, provola campana. |
| `hawaiiana` | Hawaiiana | 🍍 | Sweet/Savory | Pomodoro, mozzarella, prosciutto cotto e ananas a dadini. |
| `crescenza_recco` | Crescenza alla Recco | 🧀 | Creamy | Solo crescenza/stracchino fresco ed olio EVO. |
| `sfincione` | Sfincione Palermitano | 🧅 | Salty/Savory | Sugo di cipolla, acciughe salate, caciocavallo e pangrattato. |
| `focaccia_barese` | Focaccia Barese | 🫒 | Fresh | Pomodorini schiacciati, olive baresane con nocciolo, origano. |
| `fugazzeta` | Fugazzeta | 🧅 | Creamy | Doppia mozzarella all'interno, cipolla bianca affettata sopra. |
| `detroit` | Detroit | 🧀 | Rich | Brick cheese a cubetti sui bordi, fette di pepperoni, salsa sopra. |
| `chicago` | Chicago deep dish | 🍅 | Rich | Mozzarella a fette sul fondo, salsiccia fresca, salsa densa sopra. |
| `montanara` | Montanara (a crudo) | 🍅 | Fresh | Salsa di pomodoro cotta, ricotta fresca, pecorino e basilico. |
| `calzone` | Calzone | 🥟 | Rich | Ricotta vaccina/bufala, fior di latte, salame napoletano, pepe. |
| `ciaccino` | Farcitura senese | 🥪 | Salty/Savory | Prosciutto cotto toscano saporito e mozzarella/caciotta senese. |
| `white_clam` | White Clam (vongole) | 🦪 | Salty/Savory | Vongole veraci tritate, aglio fresco, origano, pecorino romano. |

---

## 7. Varianti Concrete di Condimento (Topping Recipes)

I concetti astratti sono risolti in **31 Topping Recipes concrete** in base allo stile o alla famiglia selezionata. Ogni ricetta definisce la lista degli ingredienti ed i passaggi di stesura/cottura:

### Gruppo Margherita
1.  **Verace AVPN (`margherita_napoletana_avpn`)**:
    *   *Ingredienti*: 80g Pelati San Marzano DOP, 1g Sale fino, 90g Fior di latte campano (o bufala), 4 foglie Basilico fresco, 5ml Olio EVO.
    *   *Stesura*: Pomodoro steso a mano, mozzarella a fette uniformi, basilico fresco e olio prima della cottura veloce (90s).
2.  **Romana (`margherita_romana`)**:
    *   *Ingredienti*: 100g Passata di pomodoro, 1g Sale, 80g Fior di latte, 4 foglie Basilico, 5ml Olio EVO.
    *   *Stesura*: Passata condita, mozzarella a cubetti, olio a filo. Il basilico fresco va inserito rigorosamente *post-cottura* per non bruciarlo.
3.  **All'americana (`margherita_americana`)**:
    *   *Ingredienti*: 100g Salsa di pomodoro (con origano e zucchero), 100g Mozzarella grattugiata (low-moisture), 5g Parmigiano, 5ml Olio di semi/oliva.
    *   *Stesura*: Salsa distribuita lasciando il bordo libero, mozzarella shredded sparsa a manciate, spolverata di parmigiano. Niente basilico.
4.  **Classica (`margherita_generica`)**:
    *   *Ingredienti*: 90g Passata di pomodoro, 1g Sale, 80g Mozzarella fior di latte, 4 foglie Basilico, 5ml Olio EVO.
    *   *Stesura*: Standard, usata come fallback per stili non specifici.
5.  **New York (`margherita_ny`)**:
    *   *Ingredienti*: 90g Salsa NY (pomodoro, origano, aglio in polvere), 95g Mozzarella low-moisture grattugiata, 5g Parmigiano reggiano.
    *   *Stesura*: Salsa stesa sottile, formaggio grattugiato fine, spolverata di parmigiano. Cottura su pietra/acciaio.

### Gruppo Marinara & Bianca
6.  **Marinara AVPN (`marinara_avpn`)**:
    *   *Ingredienti*: 80g Pelati schiacciati, 4g Aglio fresco affettato, 1g Origano secco, 8ml Olio EVO.
    *   *Stesura*: Pomodoro a cerchi concentrici, fettine sottili di aglio, spolverata generosa di origano ed olio a spirale.
7.  **Marinara alla romana (`marinara_romana`)**:
    *   *Ingredienti*: 100g Passata, 1g Sale, 4g Aglio tritato, 1g Origano, 8ml Olio EVO.
    *   *Stesura*: Come sopra, con passata di pomodoro liscia.
8.  **Bianca con rosmarino (`bianca_semplice`)**:
    *   *Ingredienti*: 8ml Olio EVO, 2g Sale grosso marino, 2g Aghi di rosmarino freschi.
    *   *Stesura*: Bucherellare l'impasto steso, spennellare con olio, spargere sale grosso e aghi di rosmarino prima del forno.

### Gruppo Boscaiola & Diavola
9.  **Boscaiola alla napoletana (`boscaiola_napoletana`)**:
    *   *Ingredienti*: 90g Fior di latte campano, 70g Salsiccia fresca sbriciolata, 60g Funghi porcini sott'olio, Pepe/Pecorino grattugiato.
    *   *Stesura*: Mozzarella sulla base, ciuffi di salsiccia cruda e porcini sgocciolati. Pecorino all'uscita.
10. **Boscaiola alla romana (`boscaiola_romana`)**:
    *   *Ingredienti*: 80g Fior di latte, 70g Salsiccia a pezzetti, 60g Champignon freschi pre-cotti, Prezzemolo tritato post-bake.
    *   *Stesura*: Mozzarella, funghi champignon e salsiccia. Prezzemolo fresco cosparso a caldo.
11. **Diavola alla napoletana (`diavola_napoletana`)**:
    *   *Ingredienti*: 80g Pelati, 80g Fior di latte, 40g Salame napoletano piccante, Basilico, Olio EVO.
    *   *Stesura*: Salsa, fior di latte, fette di salame sovrapposte, basilico e olio prima del forno.
12. **Diavola Pepperoni (`diavola_shredded`)**:
    *   *Ingredienti*: 90g Salsa di pomodoro, 90g Mozzarella low-moisture grattugiata, 50g Salame Pepperoni a fettine, Origano secco.
    *   *Stesura*: Salsa, mozzarella grattugiata e fette di pepperoni distribuite. Origano cosparso a fine cottura.

### Gruppo Ricche & Internazionali
13. **Capricciosa classica (`capricciosa_classica`)**:
    *   *Ingredienti*: 90g Pelati, 80g Fior di latte, 40g Cotto, 40g Champignon, 40g Carciofini, 20g Olive nere.
    *   *Stesura*: Condimenti mescolati o distribuiti a zone sulla mozzarella.
14. **Quattro Stagioni (`quattro_stagioni_classica`)**:
    *   *Ingredienti*: 90g Pelati, 80g Fior di latte, 40g Cotto, 40g Champignon, 40g Carciofini, 20g Olive nere.
    *   *Stesura*: Stessi ingredienti della Capricciosa, distribuiti rigidamente a spicchi isolati nei 4 quadranti.
15. **Quattro Formaggi (`quattro_formaggi_classica`)**:
    *   *Ingredienti*: 70g Fior di latte, 30g Gorgonzola dolce, 30g Fontina valdostana, 15g Parmigiano reggiano.
    *   *Stesura*: Cubetti di mozzarella, gorgonzola e fontina sparsi sulla base bianca. Spolverata di parmigiano.
16. **Ortolana classica (`ortolana_classica`)**:
    *   *Ingredienti*: 80g Fior di latte, 40g Zucchine grigliate, 40g Melanzane grigliate, 40g Peperoni arrostiti, Olio EVO.
    *   *Stesura*: Base bianca con fior di latte e verdure disposte ordinatamente.
17. **Patate e Porchetta (`patate_porchetta_romana`)**:
    *   *Ingredienti*: 120g Patate a fette sottilissime (mandolina), 3ml Olio EVO, 2g Rosmarino, 1g Fior di sale, 100g Porchetta d'Ariccia IGP affettata.
    *   *Stesura*: Fette di patate condite disposte sulla parte superiore del doppio disco (baciata). Dopo la cottura, sdoppiare la pizza e riempirla con porchetta.
18. **Bianca con Mortadella (`bianca_mortazza_romana`)**:
    *   *Ingredienti*: 8ml Olio EVO (per spennellare l'impasto), 80g Mortadella Bologna IGP affettata sottile, 10g Granella di pistacchi.
    *   *Stesura*: Cotta in teglia (baciata) unta. Sdoppiata a caldo, farcita con mortadella a fette arricciate e granella di pistacchi.
19. **Focaccia di Recco IGP (`crescenza_recco_igp`)**:
    *   *Ingredienti*: 250g Crescenza ligure fresca, 8ml Olio EVO ligure, 1g Sale fino.
    *   *Stesura*: Pezzi di crescenza adagiati sul primo disco sottile. Coprire con il secondo disco, bucherellare, pizzicare i bordi, salare e infornare.
20. **Sfincione tradizionale (`sfincione_tradizionale`)**:
    *   *Ingredienti*: 120g Salsa densa di pomodoro e cipolle, 20g Acciughe sott'olio, 50g Caciocavallo, 30g Pangrattato tostato, Olio EVO.
    *   *Stesura*: Stendere le acciughe spezzettate sulla base. Coprire con la salsa densa di pomodoro e cipolla, cospargere di caciocavallo ed infine pangrattato tostato.
21. **Focaccia Barese classica (`focaccia_barese_classica`)**:
    *   *Ingredienti*: 150g Pomodorini ciliegino freschi, 60g Olive baresane, 2g Origano pugliese, 15ml Olio EVO.
    *   *Stesura*: Ruoto unto. Pomodorini schiacciati a mano spinti dentro la mollica morbida. Olive baresane disposte negli spazi vuoti. Origano e molto olio EVO.
22. **Fugazzeta Argentina (`fugazzeta_rellena`)**:
    *   *Ingredienti*: 200g Mozzarella fior di latte o a filone, 120g Cipolle bianche a velo, 1g Origano, 10ml Olio EVO.
    *   *Stesura*: Primo disco farcito con formaggio. Secondo disco sopra sigillato. Coprire interamente con cipolle sottili condite con olio e sale.
23. **Detroit classica (`detroit_classica`)**:
    *   *Ingredienti*: 160g Wisconsin Brick Cheese a cubetti, 50g Salame Pepperoni, 100g Salsa Detroit calda (pomodoro, spezie).
    *   *Stesura*: Metà pepperoni sul fondo. Coprire interamente con formaggio a cubetti fin contro i bordi metallici. Restanti pepperoni sopra. Cottura in teglia. All'uscita, stendere due strisce parallele di salsa di pomodoro calda.
24. **Chicago classica (`chicago_classica`)**:
    *   *Ingredienti*: 150g Mozzarella a fette, 120g Salsiccia fresca sbriciolata (cruda), 120g Pomodori pelati a pezzi grossi conditi, 10g Parmigiano.
    *   *Stesura*: Foderare la teglia alta. Fette di mozzarella sul fondo, strato compatto di salsiccia sbriciolata, coprire con pomodori pelati a pezzi e spolverata di parmigiano.
25. **Calzone Napoletano classico (`calzone_napoletano_classico`)**:
    *   *Ingredienti*: 90g Ricotta vaccina, 80g Fior di latte, 40g Salame napoletano piccante, 1g Pepe nero macinato, 20g Pelati (per la superficie).
    *   *Stesura*: Spalmare ricotta su metà disco, unire fior di latte, pepe e salame. Chiudere a mezzaluna sigillando i bordi. Spennellare un velo di pomodoro e olio sulla superficie prima di infornare.
26. **Montanara classica (`montanara_classica`)**:
    *   *Ingredienti*: 60g Passata di pomodoro cotta densa, 40g Ricotta fresca, 5g Pecorino romano, 2 foglie Basilico fresco.
    *   *Stesura*: Dischetto di impasto fritto a 185°C. Sgocciolare e condire a caldo sulla spianatoia con pomodoro caldo, pezzetti di ricotta, pecorino e basilico.
27. **Ciaccino senese (`ciaccino_tradizionale`)**:
    *   *Ingredienti*: 80g Prosciutto cotto toscano, 80g Mozzarella filante (o caciotta senese).
    *   *Stesura*: Farcire all'interno del doppio disco di impasto e cuocere in teglia sigillando bene le estremità.
28. **White Clam Apizza (`white_clam_apizza`)**:
    *   *Ingredienti*: 100g Vongole fresche tritate, 5g Aglio tritato, 1g Origano, 10g Pecorino romano, 10ml Olio EVO.
    *   *Stesura*: Base bianca stesa sottile, coperta da vongole tritate condite con aglio, origano ed olio. Spolverata di pecorino romano prima della cottura a carbone.
29. **Salsiccia e Friarielli napoletana (`salsiccia_friarielli_napoletana`)**:
    *   *Ingredienti*: 90g Provola affumicata, 70g Salsiccia fresca sbriciolata, 80g Friarielli saltati, Olio EVO.
    *   *Stesura*: Provola, ciuffi di salsiccia cruda e friarielli distribuiti sulla base. Olio a filo.
30. **Cacio e Pepe post-bake (`cacio_e_pepe_post_bake`)**:
    *   *Ingredienti*: 60g Pecorino romano DOP grattugiato, 2g Pepe nero in grani schiacciato, 20ml Acqua calda.
    *   *Stesura*: Preparare una pastella emulsionando pecorino ed acqua calda. Stendere sulla pizza bianca fumante appena sfornata e cospargere di pepe nero.
31. **Hawaiiana classica (`hawaiiana_classica`)**:
    *   *Ingredienti*: 80g Salsa di pomodoro, 90g Mozzarella low-moisture, 60g Prosciutto cotto, 70g Ananas a pezzetti (ben asciugato).
    *   *Stesura*: Salsa, mozzarella, cubetti di prosciutto cotto ed ananas asciugato per non rilasciare liquidi sul fondo.
