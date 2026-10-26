# Scheda di compatibilità — 26 ottobre 2026

## Gerarchia

La sezione era distribuita su una testata con un lungo filetto, un punteggio separato, condizioni sotto e una colonna di azioni lontana. Il glow diffuso ne allargava ulteriormente la percezione.

La nuova scheda ha una larghezza di lettura contenuta. Il voto è ancorato a sinistra; descrizione dell'indicatore, stato e condizioni sono riuniti accanto. Il filetto e il glow sono rimossi. Personalizza e Salva restano vicini all'esito, sulla stessa riga quando lo spazio lo consente.

Come richiesto durante la revisione:

- **Dettagli è nel blocco del punteggio**. L'intero voto è un pulsante con focus visibile, `aria-expanded` e collegamento al pannello tramite `aria-controls`. Il nome accessibile contiene anche il voto. La label rimane stabile e la freccia indica apertura/chiusura.
- **La label del bookmark rimane visibile anche su mobile**, compreso lo stato salvato. Le azioni si distribuiscono e vanno a capo senza rimuovere il testo.

Condizioni, limiti di autenticità/fattibilità e motivi di blocco restano visibili a scheda chiusa. Assi, spiegazioni, pesi e confronto con l'originale restano nel dettaglio; l'anteprima dei cambi dell'ottimizzazione rimane disponibile come prima. La variante Editorial mantiene superfici aperte e bordi discreti.

## Risultato e verifiche

- Nello stesso caso della schermata originale restano **87/100, Su misura e Se hai farina W285**. Nessun file del motore o dato di ricetta è modificato.
- Chrome: 24 combinazioni di larghezza (320/390/768/1440), tre temi e chiaro/scuro. Voto, condizioni e label salvata visibili, nessun overflow, pannello collegato correttamente e cinque assi presenti.
- Tutte le sette lingue usano il copy CMS esistente. Verificate anche le label più lunghe a 320/390 px in inglese, spagnolo, tedesco, francese, portoghese e giapponese.
- Interazioni: apertura con Enter, spiegazione di un asse, salvataggio, personalizzazione e ottimizzazione. In WebKit è stata modificata l'idratazione da 63 a 64 con il controllo nativo, verificando comparsa e funzionamento di Salva.
- Originale da verificare, versione ottimizzata e ricetta non fattibile conservano condizioni, avvisi e confronti.
- 602 test passati, uno saltato; typecheck e controlli del progetto, build, verifica glass e budget degli asset superati.

Evidenze in `output/playwright/match-layout/`. Prove browser Chrome/WebKit, senza collaudo su iPhone fisico.
