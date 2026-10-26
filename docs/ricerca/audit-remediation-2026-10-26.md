# Secondo collaudo: correzioni di contenuti e pianificazione

Il report dell'agente del 26 ottobre è una verifica software, non una prova di riuscita in cucina. Il confronto precedente di 348 chiamate MCP con il codice provava la parità, non la validità scientifica o il realismo delle ipotesi condivise.

## Decisioni e correzioni

- **F01 — FODMAP:** `science.fodmap_reduction_pct` resta nello schema ma vale `null`. Le sole ore non determinano la riduzione; rimossi i claim numerici del punteggio e i consigli dietetici basati su una percentuale calcolata. Con il filtro low FODMAP l'avviso di dato non verificabile resta presente anche a 72 ore. Rimossa l'affermazione di attività enzimatica «ottimale» in frigorifero.
- **F02 — W:** sostituito l'integrale pressione-tempo con la relazione fra lavoro di deformazione e pressione-volume; il testo distingue forza complessiva da P, L e P/L. Anche l'avviso di W alta non deduce più la tenacità dalla sola W.
- **F03 — D-Score:** rimane l'indice euristico già usato dall'app, senza ricalibrare i voti per far passare il collaudo. Tolta dal glossario la formula lineare non implementata e rimossi gli intervalli orari incompatibili. Spiegati normalizzazione e correttivi; non misura FODMAP o risposta digestiva individuale.
- **F04 — dotazione:** test indipendente con teglia assente, inventario completo e acquisto rifiutato: Greek Pan deve essere bloccata. Il dato parziale rimane distinto dall'assenza confermata. Il vecchio schema del client non prova un difetto del server aggiornato.
- **F05 — lotti:** stesura e assemblaggio/farcitura per unità sono moltiplicati per il numero di unità. Esempio Napoletana ×12: stesura 60 minuti e condimento 36, anziché 5 e 3; cottura sempre dai secondi reali, 12×75s = 15 minuti. Modello esplicito: un operatore, lavorazioni sequenziali, cottura una alla volta, servizio scaglionato. Nessuna sovrapposizione, capacità dell'impastatrice o recupero termico presunto. I tempi per unità restano stime, non misure professionali validate.
- **F06 — orari:** timeline, stampa e guida condividono gli istanti effettivi. «ca.» segnala la variabilità di una fase passiva senza anticiparne l'orologio. Impasto alle 09:30 di 20 minuti → puntata alle 09:50.
- **F07 — biga:** il target di 16 ore (poolish 14) è un tetto, non il minimo di una quota percentuale che cresce con la finestra totale. A 48/72 ore il tempo aggiuntivo va all'impasto finale. Con meno tempo il prefermento si accorcia secondo il modello esistente.
- **F08 — dosi:** sotto 1g di lievito si indica una bilancia da 0,01g. Totali farina/acqua mostrati con la stessa precisione delle due fasi, senza arrotondamenti visivi ai 5g.
- **Scadenza del pasto:** l'inizio calcolato a ritroso non viene più arrotondato in avanti. Gli slot standard conservano l'istante del pasto, oltre alla finestra prudente al quarto d'ora. Il pasto alle 15:30 rimane alle 15:30. Una ricetta che non entra nella finestra è bloccata, non accorciata senza spiegazione.
- **Guida MCP:** eliminate le frasi che negavano dosi dei condimenti e farine commerciali. Nuovi campi espliciti `fat_type`, `schedule`, `work_units`, `minutes_per_unit`; le durate sono già totali. Versione server 1.1.1.

La revisione dei contenuti adiacenti ha rimosso anche il calcolo lineare dell'istamina in mg/kg e l'inferenza nichel da W. I relativi avvisi dichiarano la mancata determinazione; la nota sul lattosio non promette più un'eliminazione del 90% con la cottura. Le nuove stringhe sono presenti nelle sette lingue e invalidano gli snapshot di traduzione precedenti (revisione 9).

## Fonti consultate il 26 ottobre 2026

- [Monash — Fermented foods and FODMAPs](https://www.monashfodmap.com/blog/fermented-foods-and-fodmaps/): fermentazione non sufficiente a predire la classificazione senza test; quantità per porzione rilevante.
- [Monash — Sourdough processing & FODMAPs](https://www.monashfodmap.com/blog/sourdough-processing-fodmaps/): importanza di farine e processo, prodotti testati; nessuna curva oraria universale.
- [IREKS — Alveograph](https://www.ireks-kompendium.com/en/flour-analysis/analysis-methods-for-testing-the-protein-quality/alveograph): significati distinti di W, P, L e P/L; valutazione congiunta.
- [Autorità alimentare danese — Biogene aminer](https://foedevarestyrelsen.dk/kost-og-foedevarer/foedevaresikkerhed/kemiske-stoffer-og-toksiner/naturlige-giftstoffer/biogene-aminer): ruolo di microrganismi, ingredienti e condizioni di crescita/conservazione. Nessun supporto per i precedenti tassi orari del motore.
- [Allergy UK — Lactose intolerance](https://www.allergyuk.org/resources/lactose-intolerance/): controllo di ingredienti, informazioni del produttore e porzioni, senza assumere che un alimento cotto sia privo di lattosio.

Le fonti sostengono le distinzioni riportate, non validano il D-Score o i tempi manuali del software.

## Verifica

Test comportamentali indipendenti per i finding: target prefermenti a 24/48/72h, assenza di percentuali sanitarie, lotti ×1/×4/×12, scadenze insufficienti con blocco, dotazione completa e acquisto rifiutato, clock e durate, traduzioni in sette lingue. Aggiornati i golden solo per i nuovi tempi per unità e i conseguenti blocchi temporali; le quantità nei casi senza scadenza rimangono invariate.

Prove riproducibili nella cartella locale `output/audit-remediation-2026-10-26/`: chiamate del report ripetute, test, build, budget, screenshot e riscontri browser. Le chiamate HTTP pubbliche sono collaudo del server sviluppato, non una capacità attribuita al connettore della chat.
