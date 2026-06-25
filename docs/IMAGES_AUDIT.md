# Audit Visivo e Piano di Sostituzione Immagini (Giugno 2026)

Questo documento contiene l'analisi dello stato delle immagini all'interno di **Vulcan Pizza Lab**, con l'elenco dettagliato degli asset necessari per eliminare i segnaposto remoti (Unsplash) e i file stub di Figma. 

Per ciascun elemento viene fornito il dettaglio su **dimensioni**, **proporzioni**, **descrizione visiva** e un **prompt ottimizzato** per generatori di immagini (es. Midjourney v6 o DALL-E 3) coerente con la direzione artistica del progetto (*dark mode, drammatico, editoriale, contrastato, close-up*).

---

## Indice
1. [Linee Guida della Direzione Artistica (VPL Aesthetic)](#1-linee-guida-della-direzione-artistica-vpl-aesthetic)
2. [Stato Attuale degli Asset Visivi](#2-stato-attuale-degli-asset-visivi)
3. [Elenco Stili Pizza da Sostituire (22 stili)](#3-elenco-stili-pizza-da-sostituire-22-stili)
4. [Elenco Condimenti da Sostituire (14 Toppings)](#4-elenco-condimenti-da-sostituire-14-toppings)
5. [Asset per Fondamenta del Design System (5 stili)](#5-asset-per-fondamenta-del-design-system-5-stili)
6. [Linee Guida Tecniche per l'Integrazione](#6-linee-guida-tecniche-per-lintegrazione)

---

## 1. Linee Guida della Direzione Artistica (VPL Aesthetic)

Per mantenere la coerenza visiva con gli asset già approvati e definiti "curati e locali" (come `verace.png` o `tegliaromana.png`), tutte le nuove immagini devono rispettare i seguenti canoni estetici:

* **Stile Fotografico:** Fotografia gastronomica editoriale (*food photography*), rustica ma premium. Niente look da "banca dati stock commerciale" con luci asettiche.
* **Illuminazione:** Chiara-scura, drammatica (*moody lighting*), luce direzionale morbida dal lato o da dietro (controluce), ombre calde e profonde.
* **Sfondo:** Superfici scure e materiche (legno rustico bruciato o scuro, ardesia, pietra nera, metallo vissuto). Eventuale bagliore caldo del forno a legna nello sfondo sfuocato.
* **Inquadratura:** Close-up ravvicinati o macro, angolazione a 45 gradi o ripresa dall'alto (flat lay), profondità di campo ridotta (*shallow depth of field*) per isolare il dettaglio dell'impasto o dell'ingrediente.
* **Soggetto:** La pizza deve apparire calda, appena sfornata, con formaggio filante (ove presente), crosta alveolata e texture dell'impasto ben definita.

---

## 2. Stato Attuale degli Asset Visivi

La situazione delle immagini all'interno della codebase è la seguente:

| Categoria | Totale | Locali Curati (Definitivi) | Placeholder / Stub (Da Sostituire) |
| :--- | :---: | :---: | :--- |
| **Stili Pizza** | 28 | 6 (`verace`, `canotto`, `tegliaromana`, `romanatonda`, `pinsa`, `bonci`) | **22** (21 URL Unsplash + 1 riuso temporaneo per `grandma_style`) |
| **Condimenti (Toppings)** | 15 | 1 (`margherita`, che riusa `verace.png`) | **14** (Attualmente sprovvisti di thumbnail visiva nella selezione ricetta) |
| **Figma Design System** | 5 | 0 | **5** (Attualmente intercettati da plugin stub e renderizzati come SVG vuoti) |
| **Mascotte & Timeline** | - | - | Già coperti da illustrazioni SVG dinamiche scritte a mano. |

---

## 3. Elenco Stili Pizza da Sostituire (22 stili)

Queste immagini verranno utilizzate sia nella galleria stili (`/explore`) con proporzione **3:4**, sia come banner hero delle ricette con proporzione libera (gestite tramite `object-cover` su contenitori flessibili). 

* **Formato Consigliato:** PNG o WebP ad alta risoluzione.
* **Proporzioni target:** **3:2** (consistente con gli asset locali correnti) o **4:3**.
* **Risoluzione consigliata:** **1536 × 1024 pixel** (3:2) o **1448 × 1086 pixel** (4:3).

### 1. New York Style (`new_york`)
* **Stato Attuale:** URL Unsplash generico.
* **Descrizione Visiva:** Un tipico trancio extra-large di pizza stile New York, sottile e pieghevole (foldable slice). Crosta dorata ben cotta, salsa di pomodoro visibile sotto uno strato abbondante di mozzarella filante e unto arancione traslucido. Inquadrato a 45 gradi su carta oleata tipica da asporto, sfondo di un bancone scuro di pizzeria.
* **Prompt:** `Close-up editorial food photography of a classic New York style cheese pizza slice, foldable slice, greasy orange sheen on melted mozzarella cheese, thin crispy charred crust, served on white parchment paper on a dark wood pizzeria counter, dramatic side lighting, dark moody background, shallow depth of field, 8k --ar 3:2`

### 2. Detroit Style (`detroit`)
* **Stato Attuale:** URL Unsplash generico.
* **Descrizione Visiva:** Pizza rettangolare alta, con la tipica "cheese crown" (bordo di formaggio bruciato e caramellato) scura e croccante lungo i lati. Condita con pepperoni a coppetta (cup-and-char pepperoni) arricciati e pieni del loro olio, strisce verticali di salsa di pomodoro rossa accesa versata sopra il formaggio.
* **Prompt:** `A rectangular Detroit-style pizza in a dark steel pan, thick airy crust, crispy caramelized dark cheese crown on the edges, topped with cupped pepperoni and thick racing stripes of vibrant red tomato sauce on top, close-up, dramatic side lighting, dark rustic setting, professional food styling --ar 3:2`

### 3. Chicago Deep Dish (`chicago_deep`)
* **Stato Attuale:** URL Unsplash generico.
* **Descrizione Visiva:** Pizza a mo' di torta salata con bordi altissimi e burrosi. Il ripieno mostra uno strato spesso di salsiccia e formaggio fuso coperto da una ricca e densa passata di pomodoro a pezzi grossolani, spolverata di parmigiano. Inquadratura che mostra una fetta sollevata con il formaggio filante che si allunga.
* **Prompt:** `Editorial food photo of a Chicago deep dish pizza in a deep metal pan, tall buttery crust walls, filled with thick layers of molten mozzarella cheese, sausage, topped with chunky rustic tomato sauce and grated parmesan, one slice being pulled up showing long cheese pull, dark moody background, warm lighting --ar 3:2`

### 4. Focaccia Genovese (`focaccia_genovese`)
* **Stato Attuale:** URL Unsplash generico.
* **Descrizione Visiva:** Focaccia dorata e lucida, caratterizzata dai tipici "buchi" (in dialetto *coilli*) profondi colmi di emulsione di olio EVO e sale grosso. Texture superficiale morbida e bagnata dall'olio, spolverata di aghi di rosmarino fresco. Appoggiata su un tagliere di legno scuro.
* **Prompt:** `Close-up of traditional Italian Focaccia Genovese, golden and shiny crust, deep finger dimples filled with olive oil and coarse sea salt, fresh rosemary needles, soft crumb texture visible on the side, dark rustic wooden board, cinematic lighting, moody atmosphere --ar 3:2`

### 5. Sfincione Palermitano (`sfincione`)
* **Stato Attuale:** URL Unsplash generico.
* **Descrizione Visiva:** Pizza alta e spugnosa condita con un sugo denso a base di pomodoro, cipolle stufate, acciughe e origano, coperto da una pioggia di caciocavallo grattugiato e pangrattato tostato che crea una superficie rustica e dorata.
* **Prompt:** `Palermitano Sfincione pizza, thick spongy dough, rich red tomato sauce with stewed onions and anchovies, topped with toasted breadcrumbs and caciocavallo cheese, rustic Italian bakery setting, dark moody background, high contrast, warm lighting --ar 3:2`

### 6. Pala Romana (`pala_romana`)
* **Stato Attuale:** URL Unsplash generico.
* **Descrizione Visiva:** Una lunga pizza alla pala rettangolare, adagiata su una pala di legno scuro. Superficie alveolata, condita in modo semplice a crudo con mortadella IGP adagiata a fette ondulate e ciuffi di stracciatella di burrata.
* **Prompt:** `A long artisanal Roman Pizza alla Pala on a dark wooden peel, rustic open crumb crust, topped with folded mortadella slices and dollops of white stracciatella cheese, close-up details, dark atmosphere, warm backlighting, food editorial style --ar 3:2`

### 7. Grandma Style (`grandma_style`)
* **Stato Attuale:** Riusa temporaneamente l'immagine `tegliaromana.png`.
* **Descrizione Visiva:** Pizza rettangolare cotta in teglia sottile, crosta croccante e dorata. Condita con mozzarella a fette (posizionata sotto) e striature diagonali di sugo all'aglio cotto lentamente. Aspetto casalingo, rustico.
* **Prompt:** `Grandma style pizza in a thin rectangular baking sheet, crispy golden bottom crust, sliced fresh mozzarella melted underneath diagonal stripes of rich marinara garlic tomato sauce, fresh basil leaves, home kitchen moody lighting, dark background --ar 3:2`

### 8. Focaccia di Recco (`focaccia_recco`)
* **Stato Attuale:** URL Unsplash generico.
* **Descrizione Visiva:** Due sfoglie di pasta sottilissime come veli, senza lievito, cotte ad altissima temperatura. Bolle dorate e bruciacchiate in superficie che lasciano intravedere la crescenza fusa caldissima che cola dalle fessure della sfoglia.
* **Prompt:** `Focaccia di Recco, paper-thin double layers of unleavened dough, golden charred bubbles on top, molten white crescenza cheese oozing out from the cracks, close-up macro shot, dark stone background, dramatic directional light --ar 3:2`

### 9. Pizza al Padellino Torino (`padellino_torino`)
* **Stato Attuale:** URL Unsplash generico.
* **Descrizione Visiva:** Pizza tonda di piccole dimensioni (circa 20cm) cotta in un padellino di ferro nero ben oliato. Bordi alti e quasi "fritti", croccanti all'esterno e morbidissimi all'interno. Condimento classico Margherita con pomodoro rosso e mozzarella fusa lucida.
* **Prompt:** `Small round Pizza al Padellino inside a black cast iron pan, high crispy fried edges, soft interior, melted mozzarella and red tomato sauce bubbling, single basil leaf, dark rustic kitchen background, warm moody lighting --ar 3:2`

### 10. Pizza Baciata (`pizza_baciata`)
* **Stato Attuale:** URL Unsplash generico.
* **Descrizione Visiva:** Due dischi di pizza sovrapposti e cotti insieme ("baciati" con olio nel mezzo) a formare una tasca. Aperta a panino e farcita abbondantemente con prosciutto crudo di Parma e fette di fior di latte fresco. Tagliata a metà per mostrare l'alveolatura interna e la ricchezza del ripieno.
* **Prompt:** `Pizza Baciata cut in half, crispy double-layered Roman flatbread sandwich, filled with fresh Parma prosciutto and mozzarella slices, open pocket texture, crumbs on a dark slate table, moody lighting, editorial food shot --ar 3:2`

### 11. Ciaccino Senese (`ciaccino_senese`)
* **Stato Attuale:** URL Unsplash generico.
* **Descrizione Visiva:** Focaccia ripiena tipica toscana, chiusa e dorata in superficie con una spolverata di sale e aghi di rosmarino. Dal taglio fuoriesce un ripieno filante di prosciutto cotto toscano e scamorza fusa.
* **Prompt:** `Tuscan Ciaccino Senese, closed stuffed flatbread, golden baked crust with coarse salt, sliced open showing melted scamorza cheese and cooked ham filling, dark rustic background, cozy warm lighting --ar 3:2`

### 12. Pizza Patate e Porchetta (`pizza_patate_porchetta`)
* **Stato Attuale:** URL Unsplash generico.
* **Descrizione Visiva:** Pizza in teglia o baciata aperta e farcita con patate tagliate finissime a sfoglia croccanti sui bordi e fette di porchetta tiepida con la sua crosta croccante (*cotica*) spolverata di rosmarino e pepe nero.
* **Prompt:** `Roman pizza stuffed with sliced crispy roasted potatoes, savory porchetta pork roast with crackling skin, black pepper, rosemary, close-up, dramatic shadows, dark moody background, high contrast --ar 3:2`

### 13. Trancio Milanese (`trancio_milanese`)
* **Stato Attuale:** URL Unsplash generico.
* **Descrizione Visiva:** Un trancio triangolare molto alto e soffice, con una base croccante quasi fritta. La superficie è letteralmente sommersa da un mare di mozzarella fusa dorata che cola lungo i lati del trancio, coprendo quasi del tutto il pomodoro.
* **Prompt:** `A thick triangular slice of Milanese-style pizza, very tall spongy dough, crispy fried crust base, overflowing with a thick blanket of melted bubbling mozzarella cheese dripping down the sides, dark mood, warm side light --ar 3:2`

### 14. Chicago Tavern Style (`chicago_tavern`)
* **Stato Attuale:** URL Unsplash generico.
* **Descrizione Visiva:** Pizza tonda, stesa finissima e cotta fino a diventare rigida e croccante ("cracker thin crust"). Tagliata a quadratini (party cut). Condita con salsiccia a pezzi, cipolla e peperoni, adagiata su una tavola di legno scuro in un ambiente da pub vintage.
* **Prompt:** `Chicago tavern-style pizza, cracker-thin crispy crust, cut into small squares, topped with fennel sausage chunks and green peppers, served on a dark weathered wooden board, vintage bar atmosphere, moody warm lighting --ar 3:2`

### 15. Focaccia Barese (`focaccia_barese`)
* **Stato Attuale:** URL Unsplash generico.
* **Descrizione Visiva:** Focaccia tonda con bordi alti e bruciacchiati, cotta in teglia di ferro. Condita con pomodori ciliegini freschi spaccati con le mani e schiacciati nell'impasto, olive nere baresi con nocciolo, origano abbondante e un filo generoso d'olio.
* **Prompt:** `Traditional Focaccia Barese in a metal pan, high caramelized edges, embedded roasted cherry tomatoes, black olives with pits, dry oregano, olive oil gloss, close-up macro, dark moody lighting, rustic Italian feel --ar 3:2`

### 16. Pizza Fritta (`pizza_fritta`)
* **Stato Attuale:** URL Unsplash generico.
* **Descrizione Visiva:** Un calzone fritto gonfio e dorato, con la superficie asciutta e cosparsa di piccole bolle da frittura. Tagliato a metà per rivelare l'interno caldissimo e fumante ripieno di ricotta cremosa, provola filante e cicoli (o pepe nero).
* **Prompt:** `Neapolitan Pizza Fritta, golden-brown deep-fried dough pocket, cut open showing steaming hot ricotta cheese, melted provola, and black pepper filling, crispy blistered surface, dark background, dramatic warm lighting --ar 3:2`

### 17. Calzone Napoletano (`calzone_napoletano`)
* **Stato Attuale:** URL Unsplash generico.
* **Descrizione Visiva:** Pizza piegata a mezzaluna cotta nel forno a legna, con il cornicione maculato di bruciature tipiche (*leopardatura*). Spennellata di pomodoro e parmigiano sulla superficie esterna. Al taglio rivela un ripieno di ricotta, salame napoletano e mozzarella filante.
* **Prompt:** `Baked Neapolitan Calzone pizza, half-moon shaped, charred leopard spots on the crust, brushed with tomato sauce and basil on top, sliced open showing ricotta and salami filling, wood-fired oven glow in background, moody lighting --ar 3:2`

### 18. Pizza al Metro (`pizza_al_metro`)
* **Stato Attuale:** URL Unsplash generico.
* **Descrizione Visiva:** Un lunghissimo asse di legno scuro che ospita una pizza "al metro" divisa in tre sezioni con condimenti diversi (es. Margherita, Bianca con Prosciutto, Ortolana). Crosta alveolata ma compatta, adatta alla condivisione.
* **Prompt:** `A long rectangular Pizza al Metro on a giant wooden board, divided into three different toppings sections, rustic Italian style, family dinner setting, dark moody overhead shot, high contrast, warm editorial lighting --ar 3:2`

### 19. New Haven Apizza (`new_haven_apizza`)
* **Stato Attuale:** URL Unsplash generico.
* **Descrizione Visiva:** Pizza tonda asimmetrica, sottilissima e con una crosta visibilmente carbonizzata nei punti giusti ("charred soot"). Condimento bianco con vongole fresche aperte nel guscio, aglio, origano, pecorino romano grattugiato e olio EVO.
* **Prompt:** `New Haven style white clam apizza, thin charred coal-fired crust, topped with fresh littleneck clams, garlic, oregano, olive oil, pecorino cheese, dark moody environment, dramatic side light, food photography --ar 3:2`

### 20. Fugazzeta Argentina (`fugazzeta`)
* **Stato Attuale:** URL Unsplash generico.
* **Descrizione Visiva:** Pizza ripiena doppia, alta e straripante di formaggio fuso (mozzarella e provolone). La superficie superiore è ricoperta da un letto abbondante di cipolle tagliate sottili, caramellate e leggermente bruciacchiate sui bordi, spolverate di origano.
* **Prompt:** `Argentinian Fugazzeta, double crust stuffed pizza overflowing with melted mozzarella cheese, topped with sweet caramelized slivered onions charred on the edges, oregano, close-up showing cheese pull, dark rustic setting --ar 3:2`

### 21. California Style (`california_style`)
* **Stato Attuale:** URL Unsplash generico.
* **Descrizione Visiva:** Pizza gourmet a crosta sottile stile pizza-boutique. Condita a crudo con ingredienti freschi e colorati disposti in modo elegante: fette di avocado, striscioline di salmone affumicato, ciuffi di aneto e burrata fresca al centro.
* **Prompt:** `California-style gourmet pizza, thin light crust, elegant toppings of fresh avocado slices, smoked salmon, dill, and a ball of fresh burrata cheese in the center, bright fresh ingredients, dark moody background contrast, cinematic lighting --ar 3:2`

### 22. Greek Pan Pizza (`greek_pan`)
* **Stato Attuale:** URL Unsplash generico.
* **Descrizione Visiva:** Pizza cotta in un padellino di metallo basso, con un impasto soffice ma unto sul fondo. Condita con salsa di pomodoro ricca, origano, formaggio feta sbriciolato, olive kalamata e cipolle rosse.
* **Prompt:** `Greek pan pizza in a shallow metal dish, oily puffy crust, topped with rich tomato sauce, crumbled feta cheese, kalamata olives, red onion rings, close-up, dark background, warm directional light --ar 3:2`

---

## 4. Elenco Condimenti da Sostituire (14 Toppings)

Queste immagini sono necessarie come icone di selezione nel widget di condimento della ricetta (`recipe-output.tsx`). Per consentire un rendering pulito a griglia o a chip, devono essere quadrate e focalizzarsi sul dettaglio degli ingredienti caratterizzanti.

* **Formato Consigliato:** PNG o WebP.
* **Proporzioni target:** **1:1** (Quadrato).
* **Risoluzione consigliata:** **400 × 400 pixel**.

| ID Condimento | Nome | Descrizione Visiva | Prompt per Generazione |
| :--- | :--- | :--- | :--- |
| `marinara` | Marinara | Primo piano di passata di pomodoro densa con fettine sottili di aglio dorato, origano selvatico e un filo d'olio. | `Square macro photo of fresh marinara sauce, garlic slivers, dry oregano, extra virgin olive oil swirl, top down, dark slate background --ar 1:1` |
| `bianca` | Bianca | Dettaglio della crosta dorata di una focaccia romana bianca, unta d'olio EVO con aghi di rosmarino e grani di sale. | `Square flatlay macro photo of Italian pizza bianca crust, glistening olive oil, rosemary needles, coarse salt, dark background --ar 1:1` |
| `boscaiola` | Boscaiola | Primo piano di funghi porcini e champignon saltati misti a pezzi di salsiccia sgranata su base di formaggio fuso. | `Square close-up of sautéed mushrooms and browned Italian sausage chunks on melted cheese, rustic food shot, dark background --ar 1:1` |
| `diavola` | Diavola | Fette di salame piccante (pepperoni) arricciate dal calore con bordi croccanti e gocce di olio piccante arancione. | `Square macro of crispy curled spicy pepperoni slices, red pepper flakes, melted mozzarella, dark moody lighting --ar 1:1` |
| `capricciosa` | Capricciosa | Composizione ordinata di carciofini sott'olio a spicchi, funghi prataioli, prosciutto cotto e olive nere. | `Square food photo of pizza toppings: artichoke hearts, mushrooms, cooked ham, black olives on melted cheese, dark backdrop --ar 1:1` |
| `quattro_stagioni` | Quattro Stagioni | I quattro ingredienti della capricciosa divisi nettamente in quattro quadranti distinti su base margherita. | `Square overhead shot of a slice of four seasons pizza showing separate sections of artichokes, ham, mushrooms, olives --ar 1:1` |
| `quattro_formaggi` | Quattro Formaggi | Texture cremosa e variegata di formaggi fusi: gorgonzola erborinato, mozzarella, fontina e parmigiano. | `Square macro photo of melted four cheese blend, blue cheese veins, bubbling mozzarella and provolone, dark background --ar 1:1` |
| `ortolana` | Ortolana | Grigliata mista di verdure fresche: strisce di zucchine, melanzane e peperoni colorati adagiati su mozzarella. | `Square close-up of grilled zucchini, eggplant, and bell peppers on pizza crust, vibrant colors, dark slate, moody lighting --ar 1:1` |
| `patate_porchetta` | Patate & Porchetta | Sottili fettine arricciate di patate al forno dorate sovrapposte a fette di porchetta con pepe nero. | `Square close-up of thinly sliced roasted potatoes and savory porchetta pork on pizza dough, rosemary, dark rustic table --ar 1:1` |
| `bianca_mortazza` | Mortadella e Pistacchio | Fette soffici e ondulate di mortadella IGP cosparse di granella verde di pistacchio di Bronte. | `Square macro of folded pink mortadella slices, green pistachio crumbs on warm flatbread, dark moody backdrop --ar 1:1` |
| `cacio_e_pepe` | Cacio e Pepe | Crema densa e vellutata di pecorino romano fuso cosparsa di pepe nero macinato grosso al momento. | `Square macro of creamy melted pecorino romano cheese sauce, freshly cracked black pepper, rustic dark table --ar 1:1` |
| `salsiccia_friarielli` | Salsiccia & Friarielli | Foglie verdi scure e saltate di friarielli (cime di rapa) accostate a pezzi di salsiccia di maiale. | `Square close-up of sautéed green turnip tops (friarielli) and rustic Italian sausage pieces, dark stone surface --ar 1:1` |
| `hawaiiana` | Hawaiiana | Cubetti di ananas caramellato e fette di prosciutto cotto su base di mozzarella fusa filante. | `Square food photo of caramelized pineapple chunks and cooked ham slices on melted cheese, high contrast, dark slate --ar 1:1` |
| `crescenza_recco` | Crescenza | Formaggio crescenza caldissimo, fuso, bianco e cremoso che cola tra due sfoglie di pasta dorata. | `Square macro photo of melted hot oozing crescenza cheese, thin crispy dough layers, dark rustic setting --ar 1:1` |

---

## 5. Asset per Fondamenta del Design System (5 stili)

All'interno di `/src/app/components/design-system/foundations-ext.tsx`, cinque asset Figma sono importati direttamente ma rimangono "nascosti" in ambiente locale a causa del plugin `figmaAssetStub` di Vite. 

Questi file fisicamente esistono nella cartella `src/assets/` con nomi hash ma sono a bassa risoluzione e incompleti. Dovrebbero essere sostituiti con file di produzione locali ad alta risoluzione ed eliminati dal meccanismo di stubbing di Vite.

| Import nel Codice | File Fisico Corrente | Tipo | Dimensioni Attuali | Risoluzione di Produzione Target | Descrizione per Rigenerazione |
| :--- | :--- | :---: | :---: | :---: | :--- |
| `imgPizzaNapoletana` | `cc55b62333cd34778c13305abc97846ece76d0f1.png` | **4:3** | 400 × 300 px | **800 × 600 px** | Pizza Napoletana STG con cornicione gonfio maculato, basilico al centro, inquadratura dall'alto, fondo scuro. |
| `imgPizzaMargherita` | `55a2423eacc2481327d4b95178875906ba678936.png` | **4:3** | 400 × 300 px | **800 × 600 px** | Trancio o intera Margherita classica, dettagli del formaggio fuso lucido e della passata di pomodoro. |
| `imgImpasto` | `4f29f2bf05841844acdfa17d5c6d4823ce4ea351.png` | **1:1** | 200 × 200 px | **600 × 600 px** | Dettaglio macro di un panetto di impasto di pizza tondo, liscio ed elastico, spolverato di farina. |
| `imgPizzaAlForno` | `063bec0118b053149e9fff6d65b9df94925fd876.png` | **16:9** | 600 × 340 px | **1200 × 675 px** | Inquadratura suggestiva dell'interno di un forno a legna con una pizza in cottura vicino alle fiamme vive. |
| `imgPizzaTeglia` | `a832636853506b6329c43025470758beb48bdfc5.png` | **16:9** | 600 × 340 px | **1200 × 675 px** | Pizza in teglia romana quadrata/rettangolare, crosta alveolata e condimento di pomodoro lucido. |

---

## 6. Linee Guida Tecniche per l'Integrazione

Una volta generati i file fisici, l'integrazione a livello di codice avverrà seguendo questi passaggi:

### A. Salvataggio e Naming
Salvare i file all'interno della cartella `src/assets/` con nomi descrittivi e puliti (evitando gli hash esadecimali lunghi per i nuovi stili dell'applicazione). Ad esempio:
* `src/assets/detroit.png`
* `src/assets/chicago_deep.png`
* `src/assets/topping_marinara.png`

### B. Registrazione degli Stili Pizza (`recommended-styles.tsx`)
Aggiornare il dizionario `STYLE_PHOTOS` importando i nuovi file locali e sostituendo gli URL di Unsplash:

```typescript
// Esempio di modifica in src/app/components/recommended-styles.tsx
import photoVerace from "../../assets/verace.png";
import photoDetroit from "../../assets/detroit.png"; // Nuovo
import photoChicagoDeep from "../../assets/chicago_deep.png"; // Nuovo
// ...

export const STYLE_PHOTOS: Record<string, string> = {
  napoletana_stg: photoVerace,
  detroit: photoDetroit,           // Sostituito URL Unsplash
  chicago_deep: photoChicagoDeep,  // Sostituito URL Unsplash
  // ...
};
```

### C. Registrazione dei Condimenti (`topping-library.ts`)
Configurare i nuovi thumbnail importandoli in `topping-library.ts` e associandoli ai concetti corrispondenti:

```typescript
// Esempio di modifica in src/app/components/topping-library.ts
import thumbnailMargherita from "../../assets/verace.png";
import thumbnailMarinara from "../../assets/topping_marinara.png"; // Nuovo
// ...

export const TOPPING_CONCEPTS: Record<string, ToppingConcept> = {
  margherita: {
    id: "margherita",
    name: "Margherita",
    thumbnail: thumbnailMargherita,
    // ...
  },
  marinara: {
    id: "marinara",
    name: "Marinara",
    thumbnail: thumbnailMarinara, // Aggiunto thumbnail
    // ...
  },
};
```

### D. Disattivazione dello Stub di Vite per le Fondamenta del Design System
Nel file `vite.config.ts`, per consentire a Vite di caricare i file reali invece di generare SVG vuoti per le importazioni del design system, è consigliabile aggiornare il plugin `figmaAssetStub` affinché non intercetti gli asset presenti localmente:

```typescript
// In vite.config.ts
function figmaAssetStub(): Plugin {
  return {
    name: "figma-asset-stub",
    resolveId(source) {
      // Intercetta solo se non esiste una risoluzione locale o se si desidera forzare lo stub di file mancanti
      if (source.startsWith("figma:asset/")) {
        // Logica per verificare se il file è presente in src/assets
        // Altrimenti esegue il fallback dello stub
        return `\0figma-stub:${source}`;
      }
    },
    // ...
  };
}
```
*Nota: Alternativamente, si consiglia di rinominare gli import in `foundations-ext.tsx` modificando il prefisso da `figma:asset/` a `../../assets/` per caricare direttamente i file reali di produzione.*

---

## 7. Toppings per-stile — nuovi asset da generare (Refactor «ogni stile ha i suoi topping», Giugno 2026)

> **Contesto.** Con il refactor che rende i condimenti **specifici per stile** (es. *Margherita romana ≠ Margherita napoletana*, *Capricciosa napoletana ≠ romana*), la libreria `topping-library.ts` ha guadagnato nuovi **concept** firma. I thumbnail nella codebase sono **a livello di concept** (`ToppingConcept.thumbnail`), non di ricetta: per ora tutte le varianti per-stile di uno stesso concept condividono **una** immagine.

### 7.0 Problemi noti di immagini «messe a caso» (da correggere)

Asset attualmente riusati in modo improprio o mancanti, da sostituire con immagini dedicate:

| Concept | Problema attuale | Azione |
| :--- | :--- | :--- |
| `margherita` | Riusa `verace.png` (foto *stile*, non *topping*) come thumbnail. | Generare `topping_margherita.png` 1:1 dedicato. |
| `quattro_stagioni` | Riusa `topping_4formaggi`→ no: riusa **`topping_capricciosa.png`** (commento esplicito nel codice). | Generare `topping_4stagioni.png` con i 4 quadranti separati. |
| `hawaiiana` | Elencato in §4 ma **nessun file** presente. | Generare `topping_hawaiiana.png`. |
| `sfincione`, `focaccia_barese`, `fugazzeta`, `detroit`, `chicago`, `montanara`, `calzone`, `ciaccino`, `white_clam` | Concept regionali **senza thumbnail** (chip mostrato senza immagine). | Generare i thumbnail dedicati (vedi §7.1). |

> **Decisione architetturale aperta (per differenziazione visiva piena per-stile).** Per mostrare immagini diverse tra *Margherita napoletana* e *Margherita romana* servirebbe un campo opzionale `thumbnail` su `ToppingRecipe` (con fallback al `concept.thumbnail`). Finché non viene introdotto, generare **un'immagine per concept** è sufficiente; in un secondo momento si potranno aggiungere foto per-ricetta per i casi più iconici (margherita, capricciosa, diavola).

### 7.1 Concept regionali esistenti senza thumbnail

Specifiche come §4: **1:1, 400×400 px, PNG/WebP**, food photography dark/moody, `--ar 1:1`.

| ID Concept | Nome | Descrizione visiva | Prompt |
| :--- | :--- | :--- | :--- |
| `sfincione` | Sfincione Palermitano | Quadrotto alto e spugnoso: sugo denso di pomodoro e cipolla, acciughe, caciocavallo a dadini, pioggia di pangrattato tostato e origano. | `Square macro of Sicilian sfincione slice, thick spongy crumb, tomato-onion sauce, anchovies, caciocavallo cubes, toasted breadcrumbs, dark moody background --ar 1:1` |
| `focaccia_barese` | Pomodorini e olive baresane | Mollica umida con pomodorini ciliegino schiacciati a mano affondati nell'impasto, olive baresane col nocciolo, origano, olio EVO lucido. | `Square macro of Focaccia Barese, hand-crushed cherry tomatoes pressed into dough, baresane olives with pits, oregano, olive oil sheen, dark rustic background --ar 1:1` |
| `fugazzeta` | Mozzarella e cipolla | Superficie ricoperta di cipolla bianca a velo leggermente bruciacchiata su un letto di mozzarella fusa che cola; niente pomodoro. | `Square close-up of Argentinian fugazzeta, thin charred white onion blanket over melting mozzarella, oregano, no tomato, dark moody lighting --ar 1:1` |
| `detroit` | Detroit (cheese crown) | Angolo di teglia con bordo di formaggio caramellato scuro (frico), pepperoni a coppetta, due strisce verticali di salsa rossa sopra. | `Square macro of Detroit pizza corner, dark caramelized cheese crown frico edge, cupped pepperoni, two red sauce racing stripes on top, dark steel pan --ar 1:1` |
| `chicago` | Chicago deep dish | Sezione che mostra gli strati invertiti: mozzarella sul fondo, salsiccia, salsa di pomodoro a pezzi grossi e parmigiano in superficie. | `Square cross-section of Chicago deep dish, inverted layers, mozzarella base, sausage, chunky tomato sauce and parmesan on top, tall buttery crust, dark background --ar 1:1` |
| `montanara` | Montanara (a crudo) | Dischetto fritto dorato e bolloso condito a crudo: pomodoro cotto, fiocchi di ricotta, pecorino e basilico. | `Square macro of fried Neapolitan montanara, golden blistered dough, cooked tomato, ricotta dollops, pecorino, basil, dark moody background --ar 1:1` |
| `calzone` | Calzone Napoletano | Mezzaluna chiusa maculata dal forno a legna, velo di pomodoro e basilico sopra, vapore che esce dal taglio con ricotta e salame. | `Square photo of Neapolitan calzone, half-moon, leopard-charred crust, tomato brushed top, steam from cut showing ricotta and salami, wood-fired glow, dark background --ar 1:1` |
| `ciaccino` | Farcitura senese | Schiacciata toscana sigillata e dorata, sale e rosmarino in superficie, taglio con prosciutto cotto e pecorino fuso. | `Square macro of Tuscan ciaccino senese, golden sealed flatbread, coarse salt, sliced open showing ham and melted pecorino, dark rustic table --ar 1:1` |
| `white_clam` | White Clam (vongole) | Base bianca carbonizzata coal-fired con vongole sgusciate, aglio tritato, origano, pecorino e olio. Niente pomodoro. | `Square close-up of New Haven white clam apizza, charred coal-fired crust, shucked clams, minced garlic, oregano, pecorino, olive oil, dark moody background --ar 1:1` |
| `hawaiiana` | Hawaiiana | Cubetti di ananas caramellato e prosciutto cotto su mozzarella fusa filante. | `Square food photo of caramelized pineapple chunks and cooked ham on melted cheese, high contrast, dark slate --ar 1:1` |

### 7.2 Nuovi concept firma — Wave 1 (Napoletana)

| ID Concept | Nome | Descrizione visiva | Prompt |
| :--- | :--- | :--- | :--- |
| `cosacca` | Cosacca | Pizza rossa **senza mozzarella**: pomodoro schiacciato, pioggia di parmigiano/pecorino stagionato grattugiato e basilico. Asciutta e sapida. | `Square macro of Neapolitan cosacca pizza, crushed tomato base, no mozzarella, heavy grated aged pecorino/parmesan, basil leaves, olive oil, dark moody background --ar 1:1` |
| `provola_pepe` | Provola e Pepe | Provola affumicata fusa a cubetti su velo di pomodoro, generosa macinata di pepe nero, basilico. Nota affumicata. | `Square close-up of smoked provola pizza, melted cubed smoked cheese, cracked black pepper, light tomato base, basil, dark moody lighting --ar 1:1` |
| `nduja` | 'Nduja di Spilinga | Fior di latte e fiocchi di 'nduja calabrese che si sciolgono in chiazze rosso-arancio piccanti, basilico. | `Square macro of pizza with Calabrian 'nduja, fior di latte, molten spicy orange-red nduja blobs, basil, dark moody background --ar 1:1` |
| `nerano` | Nerano | Base bianca con crema di zucchine, zucchine fritte a julienne, scaglie di provolone del Monaco e mentuccia. | `Square close-up of Nerano pizza, zucchine cream base, fried julienne zucchini, provolone del Monaco shavings, mint, dark moody lighting --ar 1:1` |
| `margherita_sbagliata` | Margherita Sbagliata | Bufala fusa con cucchiaiate di **passata a crudo fredda** aggiunte dopo il forno e basilico: contrasto caldo/freddo, rosso vivo non cotto. | `Square macro of 'wrong' margherita, melted buffalo mozzarella with dollops of fresh cold uncooked tomato passata added after baking, basil, vivid raw red, dark moody background --ar 1:1` |
| `scarpetta` | Scarpetta | Bufala e fonduta di grana con composta di pomodoro a crudo, puntini di pesto e scaglie di grana 24 mesi sopra. | `Square close-up of Lioniello scarpetta pizza, buffalo mozzarella, grana fondue, fresh tomato compote, basil pesto dots, aged grana shards, dark moody lighting --ar 1:1` |

### 7.3 Nuovi concept firma — Wave 2 (Romana)

| ID Concept | Nome | Descrizione visiva | Prompt |
| :--- | :--- | :--- | :--- |
| `patate_rosmarino` | Patate e Rosmarino | Scaglie di patate gialle sottili sovrapposte e dorate ai bordi, aghi di rosmarino, olio EVO, fior di sale. Bianca. | `Square macro of potato-rosemary white pizza, overlapping thin golden potato slices curling at edges, rosemary needles, olive oil, sea salt, dark rustic background --ar 1:1` |
| `hot_honey` | Hot Honey | Provola affumicata e pepperoni a coppetta lucidi di grasso, filo di miele piccante che cola, pecorino. | `Square close-up of hot honey pizza, smoked provola, cupped greasy pepperoni, drizzle of chili honey glistening, pecorino, dark moody lighting --ar 1:1` |
| `bresaola_rucola` | Bresaola, Rucola e Grana | Base bianca con fette di bresaola a crudo, ciuffo di rucola selvatica, scaglie di grana e zest di limone. | `Square food photo of bresaola arugula pizza, white mozzarella base, draped bresaola slices, wild arugula, parmesan shards, lemon zest, dark slate --ar 1:1` |
| `stracciata_bottarga` | Stracciatella e Bottarga | Pala bianca alveolata con ciuffi di stracciatella, zucchine alla scapece e pioggia ambrata di bottarga di muggine grattugiata. | `Square macro of stracciatella and bottarga pala, open crumb white crust, burrata stracciatella dollops, scapece zucchini, grated amber mullet bottarga, dark moody background --ar 1:1` |

### 7.4a Nuovi concept firma — Wave 3 (Americana)

| ID Concept | Nome | Descrizione visiva | Prompt |
| :--- | :--- | :--- | :--- |
| `cheese_pizza` | Cheese Pizza | Slice NY plain cheese: salsa rossa sotto un manto uniforme di mozzarella low-moisture lucida e unta, bordo sottile. | `Square macro of New York plain cheese pizza slice, glossy greasy low-moisture mozzarella, thin crust, dark pizzeria counter, moody lighting --ar 1:1` |
| `supreme` | Supreme | Carico americano: pepperoni, salsiccia, peperoni verdi, cipolla e funghi su mozzarella fusa. | `Square close-up of supreme pizza, pepperoni, sausage, green peppers, onions, mushrooms on melted cheese, dark background --ar 1:1` |
| `white_pizza` | White Pizza | Senza pomodoro: mozzarella, ciuffi di ricotta, spinaci e aglio, pecorino. | `Square macro of white pizza, no tomato, mozzarella, ricotta dollops, spinach, garlic, pecorino, dark moody lighting --ar 1:1` |
| `vodka_pizza` | Vodka | Salsa vodka rosa-cremosa a cucchiaiate, basilico e pecorino. | `Square close-up of vodka sauce pizza, creamy pink-orange sauce dollops, basil, grated pecorino, dark background --ar 1:1` |
| `bbq_chicken` | BBQ Chicken | Pollo glassato BBQ, cipolla rossa e coriandolo su formaggio fuso, salsa barbecue lucida. | `Square macro of BBQ chicken pizza, glazed bbq chicken, red onion, cilantro, melted cheese, glossy barbecue sauce, dark moody lighting --ar 1:1` |
| `smoked_salmon` | Salmone affumicato | Base bianca con crème fraîche, fette di salmone affumicato a crudo, aneto, cipolla rossa e capperi. | `Square close-up of smoked salmon pizza, crème fraîche base, draped smoked salmon, dill, red onion, capers, dark elegant background --ar 1:1` |
| `italian_beef` | Italian Beef | Straccetti di manzo brasato lucidi di brodo e giardiniera piccante su formaggio fuso. | `Square macro of Chicago Italian beef pizza, shredded braised beef in jus, spicy giardiniera, melted cheese, dark moody background --ar 1:1` |
| `tomato_pie` | Tomato Pie | New Haven senza mozzarella: solo salsa San Marzano lucida, aglio, origano e pecorino su crosta annerita. | `Square macro of New Haven tomato pie, no mozzarella, glossy San Marzano sauce, garlic, oregano, pecorino, charred coal-fired crust, dark background --ar 1:1` |
| `greek_feta` | Greca (feta e olive) | Pan pizza con feta sbriciolata, olive kalamata, cipolla rossa e origano su mix mozzarella-cheddar. | `Square close-up of Greek pan pizza, crumbled feta, kalamata olives, red onion, oregano, oily puffy crust, dark moody lighting --ar 1:1` |

### 7.4b Nuovi concept firma — Wave 4 (Contemporanea / regionale)

| ID Concept | Nome | Descrizione visiva | Prompt |
| :--- | :--- | :--- | :--- |
| `zucca_speck` | Zucca, Speck e Caciocavallo | Crema di zucca arancione, fette di speck a crudo e scaglie di caciocavallo su teglia alta alveolata. | `Square macro of pumpkin cream pizza al taglio, orange squash cream, draped speck, caciocavallo shavings, airy crumb, dark background --ar 1:1` |
| `burrata_salmone` | Burrata e Salmone | Teglia bianca con ciuffi di stracciatella, salmone affumicato, zest di limone e aneto a crudo. | `Square close-up of burrata and smoked salmon focaccia al taglio, stracciatella dollops, smoked salmon, lemon zest, dill, dark moody lighting --ar 1:1` |
| `focaccia_cipolle` | Focaccia alle cipolle | Focaccia genovese dorata con cipolle stufate dolci nelle fossette unte di salamoia. | `Square macro of Genovese onion focaccia, golden dimpled surface, sweet stewed onions, olive oil brine pools, coarse salt, dark rustic board --ar 1:1` |
| `sardenaira` | Sardenaira | Focaccia di Sanremo: salsa densa di pomodoro e cipolla, acciughe, olive taggiasche, capperi e aglio in camicia. | `Square close-up of Sanremo sardenaira, thick tomato-onion sauce, anchovies, taggiasca olives, capers, whole garlic cloves, oregano, dark moody background --ar 1:1` |
| `sfincione_bianco` | Sfincione bianco (bagherese) | Sfincione di Bagheria senza pomodoro: tuma affondata, cipolle stufate, caciocavallo e mollica tostata. | `Square macro of white Bagheria sfincione, no tomato, melted tuma cheese, stewed onions, grated caciocavallo, toasted breadcrumbs, dark rustic setting --ar 1:1` |
| `gorgonzola_pere` | Gorgonzola e Pere | Base bianca con fette di pera dolce e gorgonzola cremoso fuso. Dolce-salato. | `Square close-up of gorgonzola and pear pizza, white base, thin sweet pear slices, melted creamy blue cheese, dark moody lighting --ar 1:1` |
| `tonno_cipolla` | Tonno e Cipolla | Classico: tonno sott'olio e cipolla rossa di Tropea a velo su mozzarella e pomodoro. | `Square macro of tuna and onion pizza, flaked oil-packed tuna, thin red Tropea onion, mozzarella, tomato, oregano, dark background --ar 1:1` |

### 7.4c Recco — farciture aggiuntive (Wave farcite)

| ID Concept | Nome | Descrizione visiva | Prompt |
| :--- | :--- | :--- | :--- |
| `recco_culatello` | Crescenza e Culatello | Recco classica con fette di Culatello di Zibello DOP adagiate a crudo dopo cottura. | `Square macro of focaccia di Recco topped with draped Culatello di Zibello DOP slices over molten crescenza, dark moody background --ar 1:1` |
| `recco_cotto` | Crescenza e Cotto Millefiori | Recco con prosciutto cotto artigianale a fette in uscita dal forno. | `Square close-up of Recco focaccia with artisanal cooked ham slices over oozing crescenza, dark moody lighting --ar 1:1` |
| `recco_pizzata` | Focaccia Pizzata | Recco con passata, acciughe, olive taggiasche e capperi sopra la crescenza. | `Square macro of focaccia Recco 'pizzata', crescenza, tomato passata, anchovies, taggiasca olives, capers, dark background --ar 1:1` |
| `pizza_fritta` | Pizza Fritta ripiena | Tasca fritta dorata e gonfia, sezione che mostra ricotta, provola filante e cicoli. | `Square macro of Neapolitan fried stuffed pizza fritta, golden blistered pocket cut open showing ricotta, melted provola and cicoli, dark background --ar 1:1` |

### 7.5 Meccanismo placeholder + lista DEFINITIVA da produrre

**Placeholder attivo:** i topping concept senza `thumbnail` ora mostrano `src/assets/toppings/_placeholder.svg` (icona spicchio su fondo scuro), **non più l'emoji**. Appena prodotta l'immagine reale, importarla in `topping-library.ts` e assegnarla a `ToppingConcept.thumbnail` (il placeholder sparisce da solo).

**Stato:** 14 concept hanno già una foto reale; **40 usano il placeholder** e vanno prodotti (1:1, 400×400, food photography dark/moody, prompt nelle sezioni §7.1–§7.4c sopra):

`hawaiiana`, `recco_culatello`, `recco_cotto`, `recco_pizzata`, `sfincione`, `focaccia_barese`, `fugazzeta`, `detroit`, `chicago`, `montanara`, `pizza_fritta`, `calzone`, `ciaccino`, `white_clam`, `cosacca`, `provola_pepe`, `nduja`, `nerano`, `margherita_sbagliata`, `scarpetta`, `patate_rosmarino`, `hot_honey`, `bresaola_rucola`, `stracciata_bottarga`, `cheese_pizza`, `supreme`, `white_pizza`, `vodka_pizza`, `bbq_chicken`, `smoked_salmon`, `italian_beef`, `tomato_pie`, `greek_feta`, `zucca_speck`, `burrata_salmone`, `focaccia_cipolle`, `sardenaira`, `sfincione_bianco`, `gorgonzola_pere`, `tonno_cipolla`.

> Rigenera questo elenco con: per ogni concept in `TOPPING_CONCEPTS` senza `thumbnail`. (14 con foto: margherita, marinara, bianca, boscaiola, diavola, capricciosa, quattro_stagioni, quattro_formaggi, ortolana, patate_porchetta, bianca_mortazza, cacio_e_pepe, salsiccia_friarielli, crescenza_recco.)

### 7.4 Integrazione

Salvare in `src/assets/toppings/` con naming `topping_<concept_id>.png` (es. `topping_cosacca.png`, `topping_hot_honey.png`), importare in `topping-library.ts` e assegnare a `ToppingConcept.thumbnail`. Riepilogo asset da generare: **§7.0** (correzioni: margherita, 4 stagioni, hawaiiana) **+ §7.1–§7.4c** (regionali, napoletani, romani, americani, contemporanei, Recco). **Totale concept da produrre: 40** (vedi lista §7.5).
