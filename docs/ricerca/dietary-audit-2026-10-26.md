# Vincoli alimentari e coerenza dei percorsi — 26 ottobre 2026

## Politica di prodotto

Il verdetto valuta gli ingredienti effettivamente calcolati dell’impasto e il condimento selezionato. Un conflitto certo genera `dietary_conflict` e `not_feasible`; il voto globale resta al massimo 39/100 e non consente creazione o avvio come ricetta eseguibile. Il catalogo rimane consultabile.

La classificazione riguarda la composizione dichiarata, non contaminazioni, tolleranza individuale o certificazioni. Latticini freschi standard confliggono con il filtro senza lattosio; prodotti stagionati o composti non verificati richiedono l’etichetta. Un prodotto senza lattosio di origine animale resta incompatibile con il filtro vegano. Per gli ingredienti facoltativi incompatibili l’omissione è una condizione esplicita: non viene nascosta nella ricetta o nei calcoli.

Le ricette di grano non diventano senza glutine sostituendo il nome della farina. In assenza di una formula e di un metodo verificati, il motore mantiene il blocco. Non ricava FODMAP, istamina o nichel dalle sole ore di fermentazione o dalla forza W.

## Versioni «senza»

`dietary_alternatives` conserva l’originale bloccato e propone una ricetta distinta. I candidati usano soltanto condimenti completi già assegnati allo stile nel catalogo, con ingredienti, dosi e procedimento propri; sono nuovamente valutati con gli stessi filtri, forno, tempo ed esclusioni. Sono ammessi solo candidati senza blocchi e senza ingredienti vegani/lattosio ancora da verificare. Non si sostituiscono grassi o farine strutturali.

Esempio verificato: Napoletana con latticini → versione con Marinara, dichiarando ingredienti rimossi **e** aggiunti. La scelta applica il `topping_id` reale, cambia la timeline e produce lo stato «Su misura», ripristinabile. Recco senza formaggio e Chicago con burro nell’impasto non vengono sbloccate da un cambio di condimento. Anche un’alternativa alimentare resta esclusa quando il forno o la scadenza la rendono non fattibile.

Nel MCP un originale bloccato può quindi rimanere nei risultati se contiene un’alternativa eseguibile: `outcome`, voto e blocchi del padre non diventano quelli del candidato. Ogni candidato espone selezione, rimozioni, aggiunte e ricetta valutata. Non si cancella un filtro per ottenere un risultato positivo.

Il collaudo del pulsante ha individuato e corretto un errore precedente: `styleWithSelectedTopping` riconosceva solo gli ID di concetto mentre il selettore passava ID di ricetta. Ora selettore, generazione, dieta e programma usano lo stesso condimento.

## Versione e compatibilità

«Originale / Su misura» descrive i parametri e il condimento rispetto al riferimento selezionato. «Fattibile / Da verificare / Così non è fattibile» descrive il verdetto sulla cucina. Un originale con una farina da verificare resta un originale; un alto voto non annulla un conflitto. Le differenze ispezionabili comprendono anche il cambio effettivo di condimento.

## Quantità, programma e range

- Il numero normalizzato alimenta insieme campo, ricetta e annuncio accessibile. Il limite condiviso è 200 unità. Collaudo browser: 40 panetti da 180 g = 7.200 g; MCP: 40 da 250 g = 10.000 g.
- I blocchi del programma sono sequenziali. Il preriscaldamento include già una parte di appretto/riposo, sottratta dal relativo blocco nel calcolo esistente. `parallel_activity` rende questa quota esplicita: non si aggiunge né si sottrae nuovamente. Il modello non assume altri lavori contemporanei, capacità della planetaria o recupero termico del forno.
- La skill locale Vulcan e `get_guide` descrivono lo stesso modello. Piani di servizio diversi richiedono dati espliciti e una stima esterna riconoscibile.
- I range del catalogo sono riferimenti del modello; i range del preset selezionato governano il configuratore. Teglia «Alta idratazione»: 88%, intervallo 82–92%, distinto dal riferimento di catalogo 75–85%. Il limite suggerito è chiamato «consigliato», non un divieto fisico.
- Impara valuta la destinazione pratica con i vincoli della cucina. A 300 °C il percorso Avanzato trova una destinazione praticabile anziché invitare al Canotto; se manca un metodo compatibile, per esempio con il filtro senza glutine, offre teoria e glossario.

## Revisione dei testi

Aggiornati fallback e sette lingue: proteolisi senza durata ottimale universale o promessa di digeribilità; Maillard/caramellizzazione distinte, con temperatura della superficie distinta dal forno; gelatinizzazione senza singola temperatura che certifichi cottura o tolleranza; LAB senza garanzia low FODMAP; lievito senza arresto istantaneo universale al freddo; P/L senza esito deterministico della pizza. Nel troubleshooting sono rimossi la compensazione automatica con zucchero per breve fermentazione, la promessa che lo zucchero stabilizzi gli sbalzi del frigo e il «sempre» legato a una durata oraria unica.

Le definizioni italiane riviste sono condivise fra fallback e CMS per evitare duplicazione. Il vecchio blocco CMS dietetico, privo ormai di consumatori, è rimosso: la UI localizza le evidenze del motore invece di ricalcolarle. La revisione dei bundle lingua è 11. I testi editoriali non sono certificazioni sanitarie.

## Fonti e confini delle evidenze

Fonti consultate il 26 ottobre 2026:

| Fonte primaria/istituzionale | Uso e limite |
| --- | --- |
| [NHS: lactose intolerance](https://www.nhs.uk/conditions/lactose-intolerance/) | Distinzione della restrizione sul lattosio; non certifica un generico prodotto commerciale. |
| [NHS: milk and dairy nutrition](https://www.nhs.uk/live-well/eat-well/food-types/milk-and-dairy-nutrition/) | Origine e composizione dei latticini e delle alternative. |
| [University Hospitals Birmingham: lactose intolerance](https://www.uhb.nhs.uk/media/f4ilokva/pi-nut-die-info-lactose-intolerance.pdf) | Differenze tra prodotti e necessità delle informazioni sulla composizione. |
| [Monash FODMAP: FAQ](https://www.monashfodmap.com/about-fodmap-and-ibs/frequently-asked-questions/) | Ingredienti, prodotto testato e porzione; senza glutine non equivale a low FODMAP. |
| [Studio sperimentale sulla proteolisi in fermentazione](https://pmc.ncbi.nlm.nih.gov/articles/PMC126681/) | Risultati dipendenti dal sistema sperimentale; non una durata ottimale per ogni pizza. |
| [Studio su farine e fermentazione, 2024](https://pmc.ncbi.nlm.nih.gov/articles/PMC10997827/) | Variabilità di substrato/processo; non misura di tolleranza individuale. |
| [Studio sulle reazioni di imbrunimento](https://pmc.ncbi.nlm.nih.gov/articles/PMC7918450/) | Effetto delle condizioni di processo; non una soglia universale letta dal termostato del forno. |
| [Studio su amido e cottura](https://pmc.ncbi.nlm.nih.gov/articles/PMC12678893/) | Cambiamenti dipendenti dalla formulazione e dal trattamento. |

Le regole prudenziali del prodotto e il tetto di voto sono decisioni software, non risultati misurati dagli studi. I test verificano calcoli, composizione dichiarata, vincoli e percorsi; non costituiscono una prova di cottura o un’analisi di laboratorio.

## Verifica riproducibile

- Regressioni: `persona-consistency.test.ts`, parità MCP/cucina, copy scientifico e cataloghi lingua.
- `npm run verify`, build, guard glass e budget di prestazioni.
- Browser Chromium e WebKit: scelta e applicazione Marinara, blocco Recco con avviso persistente, 40 unità, Impara pratico/teorico, preset 88%, modifica e ripristino. Controlli a 390 e 1440 px; ingredienti dietetici localizzati in tutte le sette lingue.
- Il toggle reale «Vegano» nel profilo modifica il risultato della Recco, mantenendo separata la modifica del profilo dalla scelta del condimento.
- Evidenze locali in `output/audit-consistency-2026-10-26/` e `output/playwright/audit-consistency/` (artefatti non distribuiti con l’app).
- Skill locale aggiornata: `/Users/matteo/.codex/skills/vulcan/SKILL.md`, validata con `quick_validate.py`; vive fuori dal repository.
