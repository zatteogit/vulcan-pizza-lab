# Audit input → output, 25–26 ottobre 2026

Base: `6b69db6` (PR #87). Prove su produzione, Chromium desktop e WebKit con
viewport iPhone 15; verifica delle correzioni anche sulla build locale.
Sessioni isolate: nessuna modifica al profilo personale, nessun accesso OAuth.

## Copertura osservata

| Percorso | Evidenza e risultato |
|---|---|
| Catalogo MCP | Tutti i 29 dettagli letti con gli schemi correnti e `get_guide`. |
| Generazione MCP | 116 ricette: 29 stili × casa 250 °C/72 h senza scadenza, casa 250 °C/pasto entro 24 h, casa 250 °C/pasto entro 2 h, dotazione di riferimento per stile. Nessun errore di trasporto. |
| Consiglio → ricetta MCP | 32 proposte confrontabili: stesso punteggio ed esito con gli stessi input. |
| Card → dettaglio browser | 29/29 punteggi e stati coerenti, cucina elettrica 450 °C, livello 1, dispensa non specificata. |
| Card → generazione browser | 29/29 punteggi conservati, attendendo la fine dell'animazione del numero. Parametri della bozza acquisiti per ogni stile. |
| Scopri → Crea | Ricetta AVPN aperta dal contenuto in evidenza; nome eseguibile Napoletana con avviso fuori disciplinare senza legna; collegamento a Crea conserva lo stile di partenza e presenta la proposta su misura. |
| Modifica/reset | Preset Moderna della Genovese applicato, idratazione modificata con tastiera, stato su misura e blocco per durata eccessiva visibili; Ripristina recupera 70%, W240, P/L 0,58, 16 h a 4 °C. |
| Salva → riapri → ricarica | Genovese 87/100: dosi, idratazione 55%, W260, P/L 0,47, 12 h a 22 °C e teglia 40×30 conservati nel link e dopo reload. |
| Dispensa mobile | Riso escluso esplicitamente: Pinsa bloccata, CTA disabilitata; marca Caputo ricercabile, disponibilità e proteine 12,5% persistono in localStorage. |
| Timeline/stampa | Confrontati ingredienti e procedimento della Genovese. Dopo la correzione, salamoia prima dell'appretto anche nella stampa. Gli orari UI preceduti da «ca.» sono arrotondati, la stampa mostra il piano puntuale. |
| Profilo mobile | Nessuna navbar visibile; X a 46×46 px, persistente dopo scroll. Primo uso verificato senza richiesta della posizione. |
| Prefermenti/scalatura/errori | Biga e poolish con bilancio delle due fasi; una/quattro pizze; override peso; limite temperatura del modello; stile/modello inesistente e panetti frazionari respinti. Glossario biga nelle sette lingue. |

Non chiamare questa matrice una prova di ogni combinazione possibile. OAuth,
permessi reali GPS/notifiche, tastiera di un iPhone fisico, esportazione e
reimportazione su un secondo dispositivo non sono coperti da queste evidenze.

## Difetti riprodotti e corretti

1. Montanara: eliminata farcitura generica prima della frittura e il testo
   «Condire con undefined»; resta il condimento a crudo dopo la frittura.
2. Genovese: salamoia spostata fra stesura e appretto, come richiesto dal testo.
3. Recco: rifiuto MCP di biga/poolish; il motore non abilita prefermenti per
   impasti senza lievito, anche quando una bozza li richiede.
4. MCP/STG: nome eseguibile distinto dal riferimento originale, scostamenti
   noti disponibili nei dati, nessuna attestazione di conformità dal voto.
5. Cotture: il piano in minuti arrotonda per eccesso i secondi delle infornate;
   la doppia cottura copre almeno il tempo effettivo dichiarato. Golden cambiati
   solo nei totali timeline: Montanara −5 min per il duplicato eliminato,
   arrotondamenti +1 min e Baciata domestica +4 min.
6. Primo uso: livello 1 coerente fra Crea, Profilo, introduzione e fallback
   Impara; etichette Avanzato/Esperto allineate ai livelli 3/4.
7. Ottimizzazione: «hai già tutto» non compare quando la proposta ha condizioni
   da verificare o requisiti mancanti.
8. Avvisi MCP leggibili: il lievito non viene più mostrato come enum `fresh`.
9. Fritta Tonda: eliminati i 120+80 g statici dalle istruzioni eseguibili;
   ripartizione 60/40 coerente con qualunque peso, nessun riferimento alla teglia
   nel passaggio della versione fritta. Testi aggiornati in sette lingue.
10. Dettaglio bloccato: ora spiega la causa, compresa la farina esclusa, e offre
    alternative. Nessuna promessa di una ricetta generata «qui sotto» nel foglio.

## Confine fra browser e MCP

Il motore è condiviso; i parametri esposti non sono identici. Il MCP attuale non
accetta dispensa, esclusioni, marca/W/P-L della farina, condimenti, geometria
della teglia né firme/preset. Una ricetta MCP di default non equivale a una
versione browser con input diversi. Il limite è documentato anche in
`get_guide` e in `docs/agenti-mcp.md`; non è stato aggirato inventando input.

## Verifica riproducibile

- `npm run verify`: 42 file, 558 test passati, 1 saltato; typecheck e guard passati.
- `npm run build` e `npm run check:budget`: passati.
- Le regressioni numeriche e operative sono in `mcp-server.test.ts`,
  `pizza-engine.test.ts`, `recipe-entry.test.ts` e nei golden per stile.
- Evidenze locali complete: `output/audit-user-journeys-2026-10-25/`.
  `auditRecipeMatrix.json` conserva gli input/output MCP iniziali;
  `browser-cards-all.log` e `browser-recipes-{0-9,10-19,20-28}.log` conservano
  la matrice browser. I log con errori di selettore sono tentativi falliti,
  esclusi dai conteggi dei casi superati.
