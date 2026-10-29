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
    "definition": "Batteri che fermentano zuccheri producendo acido lattico (e acetico). Presenti nel lievito madre.",
    "whyImportant": "Possono modificare acidità e fruttani secondo ceppi, farina e processo. La loro presenza non certifica un impasto low FODMAP.",
    "name": "LAB (Batteri Lattici)"
  },
  "w_alveograph": {
    "name": "W (Alveografo di Chopin)",
    "definition": "Energia totale necessaria per espandere un alveolo di impasto fino a rottura. Misura la forza complessiva della farina.",
    "whyImportant": `W descrive la forza complessiva della farina. Tenacità ed estensibilità si valutano con P, L e P/L: una W alta non implica da sola un impasto più tenace. Le fasce sono quelle che ${BRAND.name} usa in tutta l'app; ogni stile indica la sua forbice di W.`
  },
  "p_tenacity": {
    "name": "P (Tenacità)",
    "definition": "Resistenza massima alla deformazione. Picco della curva alveografica — quanto l'impasto resiste allo stiramento.",
    "whyImportant": "P alto: impasto 'duro', tiene forma in cottura. P basso: impasto 'molle', facile stendere, può collassare."
  },
  "l_extensibility": {
    "name": "L (Estensibilità)",
    "definition": "Lunghezza massima raggiunta dall'alveolo prima di rottura. Misura quanto l'impasto si può allungare.",
    "whyImportant": "L alto: impasto estensibile, facile stendere senza strappi. L basso: impasto corto, si strappa."
  },
  "falling_number": {
    "name": "Falling Number (Hagberg-Perten)",
    "definition": "Tempo impiegato da un'asta a cadere attraverso una sospensione di farina riscaldata. Misura l'attività amilasica.",
    "whyImportant": "FN basso (<250): fermentazione rapida ma impasto instabile. FN alto (>300): stabile per lunghe maturazioni."
  },
  "hydration": {
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
    "name": "Q₁₀ (Coefficiente di Temperatura)",
    "definition": "Fattore moltiplicativo della velocità di reazione biochimica per ogni aumento di 10°C."
  },
  "arrhenius": {
    "name": "Equazione di Arrhenius",
    "definition": "Lega la velocità di una reazione alla temperatura assoluta (in kelvin) attraverso un'energia di attivazione."
  },
  "biga": {
    "name": "Biga",
    "definition": "Pre-impasto asciutto di farina, {bigaHydration} d'acqua (fino al 50% con farine integrali) e circa l'1% di lievito fresco sulla farina della biga, maturato circa 16 h a 18–20 °C; la biga lunga fa 24 h a 4–5 °C più 24 h a 18–20 °C.",
    "whyImportant": `Porta aroma e struttura all'impasto finale. Di solito il 30–40% della farina totale: ${BRAND.name} parte dal {bigaFlourPct}. Non è ammessa nella Napoletana STG, che è a impasto diretto.`
  },
  "poolish": {
    "name": "Poolish",
    "definition": "Pre-impasto liquido: farina e acqua in parti uguali con poco lievito, maturato 12–16 h a 20–22 °C (0,1% di lievito per 15–16 h, 0,3% per 10–12 h).",
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
    "whyImportant": "Elasticità da glutenine (legami S-S), viscosità da gliadine (legami H). Proteolisi lunga taglia legami → impasto più estensibile."
  },
  "thickness_factor": {
    "name": "Thickness Factor (TF)",
    "definition": "Quantità di impasto per unità di superficie: indica quanti grammi servono per ogni cm² di pizza."
  },
  "friction_factor": {
    "name": "Attrito dell'impastatrice",
    "definition": "Gradi in più che l'impastatrice aggiunge all'impasto mentre lavora.",
    "whyImportant": "Impastare scalda l'impasto e fa partire prima la lievitazione: per questo l'acqua va più fredda quando usi una macchina."
  },
  "rule_of_55": {
    "name": "Temperatura dell'acqua (tre temperature)",
    "definition": "Calcola a che temperatura mettere l'acqua perché l'impasto arrivi alla temperatura voluta.",
    "whyImportant": "Somma delle tre temperature = 3 × impasto voluto − attrito. In pizzeria si dice anche «regola del 55»: con la somma fissa a 55 l'impasto viene intorno ai 18 °C (55 ÷ 3); qui si usa la temperatura voluta dallo stile, 22–24 °C."
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
    "definition": "Stima del modello basata su tempi, temperature, lievito e preimpasti. Non misura la digeribilità personale e non permette di calcolare i FODMAP."
  }
} as const;
