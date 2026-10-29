/** Identical Italian copy shared by the glossary fallback and CMS.
 * Review policy and sources: docs/ricerca/dietary-audit-2026-10-26.md. */
import { BRAND } from "../config/brand";

export const GLOSSARY_COPY_IT = {
  "maillard": {
    "definition": "Insieme di reazioni non enzimatiche tra composti amminici e zuccheri riducenti, favorite dal riscaldamento.",
    "whyImportant": "Contribuisce al colore e agli aromi della crosta. Intensità e velocità dipendono da temperatura della superficie, tempo, umidità e ingredienti; la temperatura del forno non coincide con quella dell’alimento.",
    "name": "Reazione di Maillard"
  },
  "caramelization": {
    "definition": "Trasformazioni degli zuccheri durante il riscaldamento, distinte dalle reazioni di Maillard e senza richiedere composti amminici.",
    "whyImportant": "Può contribuire a colore e aromi tostati. L’effetto dipende dagli zuccheri presenti, dall’umidità, dal tempo e dalla temperatura della superficie.",
    "name": "Caramellizzazione"
  },
  "starch_gelatinization": {
    "definition": "Con acqua e calore i granuli di amido si idratano, si rigonfiano e perdono parte della struttura cristallina. L’intervallo dipende dall’amido e dalla formulazione.",
    "whyImportant": "Contribuisce alla struttura della mollica e alla trasformazione dell’amido. Una singola temperatura al cuore non certifica da sola cottura completa o digeribilità individuale.",
    "name": "Gelatinizzazione Amido"
  },
  "proteolysis": {
    "definition": "Gli enzimi proteasi scompongono le proteine dell’impasto in molecole più piccole, come peptidi e amminoacidi.",
    "whyImportant": "Può modificare estensibilità e tenuta dell’impasto. Dipende da farina, microrganismi, temperatura e processo: non esiste una durata ottimale universale e non misura la digeribilità individuale.",
    "name": "Proteolisi"
  },
  "pl_ratio": {
    "plainDefinition": "Dice se l’impasto tende a tornare indietro (valore alto) o ad allungarsi facilmente (valore basso).",
    "definition": "Rapporto tra la resistenza dell’impasto alla deformazione e la sua capacità di allungarsi.",
    "whyImportant": `Descrive un equilibrio reologico: il valore adatto dipende da farina, idratazione e metodo, non garantisce altezza o consistenza della pizza. Gli esempi sono gli intervalli degli stili di ${BRAND.name}; il P/L della tua farina è sulla scheda tecnica del mulino.`,
    "name": "P/L (Rapporto Tenacità/Estensibilità)"
  },
  "yeast": {
    "definition": "Un fungo unicellulare che fermenta gli zuccheri, producendo anidride carbonica, alcol e composti aromatici.",
    "whyImportant": "L’attività dipende da ceppo, dose, temperatura e impasto. Il freddo rallenta la fermentazione; non esiste una soglia universale di arresto immediato. La dose giusta dipende da ore e temperatura: la ricetta la calcola per te.",
    "name": "Lievito (Saccharomyces cerevisiae)"
  },
  "lab": {
    "plainDefinition": "I batteri del lievito madre che danno all’impasto il sapore acidulo.",
    "definition": "Batteri che fermentano zuccheri producendo acido lattico (e acetico). Presenti nel lievito madre.",
    "whyImportant": "Possono modificare acidità e fruttani secondo ceppi, farina e processo. La loro presenza non certifica un impasto low FODMAP.",
    "name": "LAB (Batteri Lattici)"
  },
  "w_alveograph": {
    "plainDefinition": "La forza della farina: più è alta, più a lungo l’impasto regge la lievitazione. Spesso è scritta sul sacco (per esempio W 280).",
    "name": "W (Alveografo di Chopin)",
    "definition": "Energia totale necessaria per espandere un alveolo di impasto fino a rottura. Misura la forza complessiva della farina.",
    "whyImportant": `W descrive la forza complessiva della farina. Tenacità ed estensibilità si valutano con P, L e P/L: una W alta non implica da sola un impasto più tenace. Le fasce sono quelle che ${BRAND.name} usa in tutta l'app; ogni stile indica la sua forbice di W.`
  },
  "p_tenacity": {
    "plainDefinition": "Quanto l’impasto resiste quando lo tiri.",
    "name": "P (Tenacità)",
    "definition": "Resistenza massima alla deformazione. Picco della curva alveografica — quanto l'impasto resiste allo stiramento.",
    "whyImportant": "P alto: impasto 'duro', tiene forma in cottura. P basso: impasto 'molle', facile stendere, può collassare."
  },
  "l_extensibility": {
    "plainDefinition": "Quanto l’impasto si allunga prima di strapparsi.",
    "name": "L (Estensibilità)",
    "definition": "Lunghezza massima raggiunta dall'alveolo prima di rottura. Misura quanto l'impasto si può allungare.",
    "whyImportant": "L alto: impasto estensibile, facile stendere senza strappi. L basso: impasto corto, si strappa."
  },
  "falling_number": {
    "plainDefinition": "Dice quanto sono attivi gli enzimi della farina che trasformano l’amido in zuccheri.",
    "name": "Falling Number (Hagberg-Perten)",
    "definition": "Tempo impiegato da un'asta a cadere attraverso una sospensione di farina riscaldata. Misura l'attività amilasica.",
    "whyImportant": "FN basso (<250): fermentazione rapida ma impasto instabile. FN alto (>300): stabile per lunghe maturazioni."
  },
  "hydration": {
    "plainDefinition": "Quanta acqua c’è nell’impasto rispetto alla farina: con il 65% metti 65 g d’acqua ogni 100 g di farina.",
    "name": "Idratazione (H%)",
    "definition": "Percentuale in peso di acqua rispetto alla farina nell'impasto.",
    "whyImportant": `Più acqua rende l'impasto più morbido e più difficile da gestire, e chiede una farina più forte. La croccantezza dipende soprattutto da cottura e spessore: anche una teglia molto idratata può essere croccante. Gli esempi sono gli intervalli degli stili di ${BRAND.name}.`
  },
  "absorption": {
    "name": "Assorbimento Acqua",
    "definition": "Massima quantità d'acqua che una farina può assorbire mantenendo consistenza lavorabile. Dipende da proteine, amido danneggiato, fibre."
  },
  "stability": {
    "name": "Stabilità Impasto",
    "definition": "Quanto a lungo l’impasto mantiene la sua consistenza durante la lavorazione. Si misura con il farinografo.",
    "whyImportant": "Stabilità bassa (<5 min): degrada se overmixed. Alta (>10 min): tollera errori operativi."
  },
  "q10": {
    "plainDefinition": "Di quante volte accelera la lievitazione quando fa {tenDegrees} più caldo.",
    "name": "Q₁₀ (Coefficiente di Temperatura)",
    "definition": "Fattore moltiplicativo della velocità di reazione biochimica per ogni aumento di 10°C."
  },
  "arrhenius": {
    "name": "Equazione di Arrhenius",
    "definition": "Lega la velocità di una reazione alla temperatura assoluta (in kelvin) attraverso un'energia di attivazione."
  },
  "biga": {
    "name": "Biga",
    "definition": "Prefermento asciutto di farina, {bigaHydration} d'acqua (fino al 50% con farine integrali) e circa l'1% di lievito fresco sulla farina della biga, maturato circa 16 h a 18–20 °C; la biga lunga fa 24 h a 4–5 °C più 24 h a 18–20 °C.",
    "whyImportant": `Porta aroma e struttura all'impasto finale. Di solito il 30–40% della farina totale: ${BRAND.name} parte dal {bigaFlourPct}. Non è ammessa nella Napoletana STG, che è a impasto diretto.`
  },
  "poolish": {
    "name": "Poolish",
    "definition": "Prefermento liquido: farina e acqua in parti uguali con poco lievito, maturato 12–16 h a 20–22 °C (0,1% di lievito per 15–16 h, 0,3% per 10–12 h).",
    "whyImportant": `Matura più in fretta della biga e rende l'impasto estensibile. Di solito il 30–50% della farina totale: ${BRAND.name} parte dal {poolishFlourPct}. È pronto quando la superficie è piena di bollicine e il centro comincia a cedere.`
  },
  "autolysis": {
    "name": "Autolisi",
    "definition": "Riposo di farina e acqua, senza lievito né sale, per 20–60 minuti prima dell'impasto (R. Calvel, 1974). Non è un prefermento.",
    "whyImportant": "L'impasto diventa più estensibile e più facile da lavorare."
  },
  "bulk_fermentation": {
    "name": "Puntata (Bulk Fermentation)",
    "definition": "Prima lievitazione, in massa unica, dopo l'impasto e prima dello staglio. Secondo lo stile dura da meno di un'ora a più di un giorno in frigo: la durata giusta è quella del procedimento.",
    "whyImportant": "Il glutine si rilassa, la fermentazione parte e l'impasto prende aroma."
  },
  "ball_fermentation": {
    "name": "Appretto (Ball Fermentation)",
    "definition": "Seconda lievitazione, dopo lo staglio: in panetti o, per gli stili in teglia, direttamente in teglia. Dura secondo stile, temperatura e lievito: la durata giusta è quella del procedimento.",
    "whyImportant": "Porta i panetti al volume giusto per stendere e infornare."
  },
  "retrogradation": {
    "name": "Retrogradazione",
    "definition": "Ricristallizzazione dell'amido gelatinizzato durante conservazione. Massima a 4°C (frigo).",
    "whyImportant": "Mollica diventa dura e 'stantia'. Ritardare con: grassi 2-3%, zuccheri 1-2%, fermentazione lunga, idratazione alta."
  },
  "thermal_conductivity": {
    "name": "Conducibilità Termica",
    "definition": "Capacità di un materiale di condurre calore.",
    "whyImportant": "Più alta è k, più in fretta la superficie passa calore alla base: per questo l'acciaio aiuta i forni di casa, che scaldano meno. Sulla platea conta anche quanto calore il materiale accumula: i forni a legna usano mattone refrattario o biscotto."
  },
  "fodmap": {
    "name": "FODMAP",
    "definition": "Fermentable Oligosaccharides, Disaccharides, Monosaccharides And Polyols. Carboidrati a catena corta fermentabili (fruttani 1-3% nel grano).",
    "whyImportant": "La fermentazione può modificare i FODMAP, ma il risultato dipende da farine, microrganismi, processo e porzione. Le sole ore non permettono di calcolare una riduzione o attestare una ricetta low FODMAP."
  },
  "histamine": {
    "name": "Istamina",
    "definition": "Ammina biogena da decarbossilazione dell'istidina. Prodotta da LAB durante fermentazione, presente in formaggi stagionati e salumi.",
    "whyImportant": "Il contenuto dipende da microrganismi, ingredienti, processo e conservazione. Non è calcolabile con un tasso fisso per ora; una fermentazione breve non ne garantisce l'assenza."
  },
  "gluten": {
    "name": "Glutine",
    "definition": "Complesso di gliadina e glutenina che, con acqua e lavorazione, forma una rete elastica ed estensibile nell’impasto.",
    "whyImportant": "Elasticità da glutenine (legami S-S), viscosità da gliadine (legami H). Una proteolisi lunga rende l’impasto più estensibile, ma il glutine resta: lievitazioni lunghe o con lievito madre non rendono la pizza adatta a chi è celiaco. Allergie e intolleranze si impostano nel Profilo."
  },
  "thickness_factor": {
    "plainDefinition": "Quanto impasto serve per ogni centimetro quadrato di pizza: più è alto, più la pizza è spessa.",
    "name": "Carico d’impasto (Thickness Factor, TF)",
    "definition": "Quantità di impasto per unità di superficie: indica quanti grammi servono per ogni cm² di pizza."
  },
  "friction_factor": {
    "name": "Attrito dell'impastatrice",
    "definition": "Gradi in più che l'impastatrice aggiunge all'impasto mentre lavora.",
    "whyImportant": "Impastare scalda l'impasto e fa partire prima la lievitazione: per questo l'acqua va più fredda quando usi una macchina."
  },
  "rule_of_55": {
    "name": "Temperatura dell'acqua (Regola 55)",
    "definition": "Calcola a che temperatura mettere l'acqua perché l'impasto arrivi alla temperatura voluta.",
    "whyImportant": "Somma delle tre temperature (cucina, farina, acqua) = 3 × impasto voluto − attrito; con un prefermento entra anche la sua temperatura e la somma dei quattro termini diventa 4 × impasto voluto − attrito. In pizzeria si dice anche «regola del 55»: con la somma fissa a 55 l'impasto viene intorno ai 18 °C (55 ÷ 3); qui l'impasto voluto è 22 °C se l'impasto matura in frigo, 24 °C altrimenti."
  },
  "a_score": {
    "name": "A-Score (Autenticità)",
    "definition": "Punteggio da 0 a 100 sulla vicinanza al riferimento dello stile. Non certifica la conformità a un disciplinare."
  },
  "f_score": {
    "name": "F-Score (Facilità)",
    "definition": "Punteggio da 0 a 100 sulla facilità di preparazione con forno, farina ed esperienza disponibili. I requisiti che bloccano la ricetta sono valutati a parte."
  },
  "d_score": {
    "name": "D-Score (Maturazione stimata)",
    "definition": "Stima del modello basata su tempi, temperature, lievito e prefermenti. Non misura la digeribilità personale e non permette di calcolare i FODMAP."
  },
  "dough_division": {
    "name": "Staglio",
    "definition": "Dividere la massa dell’impasto in pezzi dello stesso peso, uno per pizza, e chiuderli a palla.",
    "whyImportant": "Panetti dello stesso peso lievitano e cuociono allo stesso modo. Il peso di ogni panetto è indicato nella ricetta."
  },
  "ball_shaping": {
    "name": "Pirlatura",
    "definition": "Il gesto che chiude il pezzo d’impasto in una palla liscia e tesa: lo fai girare su se stesso, sul piano o tra le mani, finché la superficie è tirata.",
    "whyImportant": "Una superficie tesa trattiene il gas durante l’appretto e dà un panetto che si stende in tondo. Se la pasta si strappa hai tirato troppo: lasciala riposare qualche minuto."
  },
  "folds": {
    "name": "Pieghe",
    "definition": "Stiri un lembo d’impasto e lo ripieghi sopra il resto, giri la massa e ripeti su ogni lato. Si fanno a intervalli durante il riposo, invece di impastare più a lungo.",
    "whyImportant": "Rinforzano la maglia del glutine senza scaldare l’impasto: servono soprattutto negli impasti molto idratati. Lo «slap & fold» è una variante: sollevi l’impasto, lo sbatti sul piano e lo ripieghi su se stesso."
  },
  "gluten_development": {
    "name": "Incordatura",
    "definition": "Il punto in cui l’impasto diventa liscio ed elastico e smette di attaccarsi alle mani o alla ciotola: la maglia del glutine si è formata.",
    "whyImportant": "Un impasto incordato trattiene il gas della lievitazione. Prova pratica: allarga un pezzetto tra le dita; se diventa una pellicola sottile senza strapparsi subito, è pronto. Impastare troppo a lungo con la macchina invece scalda e indebolisce l’impasto."
  },
  "poke_test": {
    "name": "Prova del dito (poke test)",
    "definition": "Premi il panetto con un dito infarinato per circa un centimetro e guarda come risale.",
    "whyImportant": "Se il segno risale piano e ne resta un po’, il panetto è pronto. Se risale subito, serve ancora tempo. Se resta sfondato e il panetto si sgonfia, ha lievitato troppo. È un’indicazione pratica, non una misura."
  },
  "cornicione": {
    "name": "Cornicione",
    "definition": "Il bordo della pizza, più alto e gonfio del centro: in cottura il gas dell’impasto si espande e lo solleva.",
    "whyImportant": "Per averlo, quando stendi spingi l’aria dal centro verso il bordo senza schiacciarlo. Altezza e alveoli dipendono da stile, idratazione, lievitazione e calore del forno."
  },
  "oven_floor_dome": {
    "name": "Platea e cielo",
    "definition": "La platea è il piano del forno su cui poggia la pizza; il cielo è la volta sopra. La platea cuoce il fondo per contatto, il cielo cuoce condimento e bordo con il calore che irraggia.",
    "whyImportant": "Se il fondo brucia e il condimento resta crudo, la platea è troppo calda rispetto al cielo; se succede il contrario, è troppo fredda. Nel forno di casa la pietra o l’acciaio fanno da platea e il grill da cielo."
  },
  "pre_ferment": {
    "name": "Prefermento",
    "definition": "Una parte della farina e dell’acqua impastata con il lievito ore prima dell’impasto finale e lasciata maturare. I più usati sono la biga (asciutta) e il poolish (liquido).",
    "whyImportant": "Porta aroma e cambia la lavorabilità dell’impasto finale. Nella ricetta è una fase a parte, e le sue dosi fanno parte del totale: non si aggiungono. L’autolisi non è un prefermento, perché non contiene lievito."
  },
  "sourdough": {
    "name": "Lievito madre",
    "definition": "Un impasto di farina e acqua in cui vivono lieviti selvatici e batteri lattici, mantenuto con rinfreschi di farina e acqua. Una parte si usa al posto del lievito di birra.",
    "whyImportant": "Lievita più lentamente del lievito di birra e dà un sapore leggermente acidulo. Quanto è attivo dipende da come lo rinfreschi: per questo la dose con lievito madre è un’ipotesi del modello, da adattare al tuo."
  },
  "flour_type": {
    "name": "Tipo di farina (00, 0, 1, 2, integrale)",
    "definition": "In Italia il tipo dice quanto è raffinata la farina di grano tenero: la 00 è la più bianca, poi 0, 1, 2 e integrale, che contiene tutto il chicco. Si stabilisce dalle ceneri, cioè dai minerali che restano bruciando la farina.",
    "whyImportant": "Il tipo non dice quanto è forte la farina: una 00 può essere debole o molto forte. La forza è la W, se è scritta sul sacco. Quando non la indichi, il modello assume un intervallo tipico per quel tipo."
  },
  "manitoba": {
    "name": "Manitoba",
    "definition": "Farina di grano tenero ricca di proteine, in origine da grani nordamericani (il nome viene dalla provincia canadese del Manitoba). Oggi in commercio indica una farina molto forte.",
    "whyImportant": "Si usa per lievitazioni lunghe o in miscela con una 00 per alzare la forza. Da sola dà un impasto tenace, più difficile da stendere."
  },
  "semola_rimacinata": {
    "name": "Semola rimacinata",
    "definition": "Semola di grano duro macinata una seconda volta, più fine della semola normale: gialla e granulosa al tatto.",
    "whyImportant": "Si usa per spolverare banco e pala, perché fa scorrere la pizza e brucia meno della farina, e in piccola parte nell’impasto di alcuni stili. Il glutine del grano duro è meno estensibile di quello del grano tenero."
  }
} as const;
