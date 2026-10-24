# Archivio delle annotazioni di debug · luglio 2026 (P-3)

Copia integrale del registro `vulcan-debug-registry.json` al 24/10/2026:
[`annotazioni-debug-2026-07.json`](annotazioni-debug-2026-07.json) (52 voci,
create dal 04/07 all'11/07/2026). Contiene anche selettori, HTML, stili calcolati e
disegni (`drawingDataURL`): è materiale di lavoro, non dati di utenti.

Il registro in radice resta com'è: l'overlay lo usa ancora in sviluppo e svuotarlo
farebbe ricomparire le voci dal D1 alla sincronizzazione (CLAUDE.md). Le voci
sono tutte chiuse: 51 risolte, 1 eliminata.

## Copia dal D1 di produzione (da fare da Matteo)

Le API delle annotazioni sono spente in produzione dal 22/10, ma il D1
`vulcan-annotations` conserva le tabelle. Per archiviare anche quella copia:

```bash
npx wrangler d1 export vulcan-annotations --remote --output docs/archivio/annotazioni-d1-produzione.sql
```

Poi si può decidere se cancellare il database (fuori dal repository).

## Elenco

| ID | Data | Pagina | Stato | Annotazione |
|---|---|---|---|---|
| anno-1783170624835 | 04/07/2026 | `/explore` | risolta | Andrebbe sistemata posizione navbar e sfumatura sotto. Anche il comportamento on-scroll è da decidere (considera ad es Safari su iphone c… |
| anno-1783170718236 | 04/07/2026 | `/explore` | risolta | Sigle come AVPN o STG: dove abbiamo spazio, o lescriviamo per intero o mettiamo un tip |
| anno-1783170828747 | 04/07/2026 | `/explore` | risolta | scrivere ogni volta "ricetta" è ridondante |
| anno-1783170865598 | 04/07/2026 | `/explore` | risolta | questo arco fantasma non mi sembra abbia avuto molto successo... Troviamo un altro modo per mostrare in modo semplice e esplicito a quant… |
| anno-1783192002768 | 04/07/2026 | `/` | risolta | "Più rapido" sarà sempre la prima scelta, che valore aggiunto mi dà? O troviamo un suggerimento valido, o togliamo |
| anno-1783192065657 | 04/07/2026 | `/` | risolta | controllare riflesso "glass" su border top, sembra strano |
| anno-1783192140444 | 04/07/2026 | `/explore` | risolta | è bello questo glow, su dark rende meglio che su light. Troviamo modo di farlo + evidente in entrambi i mode |
| anno-1783628885815 | 09/07/2026 | `/recipe/pizza_al_metro` | risolta | sistemare questa nota, viene tagliata a sinistra per via del border radius |
| anno-1783628940985 | 09/07/2026 | `/recipe/pizza_al_metro` | risolta | non mi piace come abbiamo approfondito le quantità del prefermento... io avrei diviso la lista degli ingredienti |
| anno-1783629025952 | 09/07/2026 | `/recipe/pizza_al_metro` | risolta | su questi picker ci dobbiamo decisamente lavorare... vedi quali sono le best practice e facciamo qualcosa di intuitivo e completo |
| anno-1783629073001 | 09/07/2026 | `/recipe/pizza_al_metro` | risolta | perché a volte il "circa" è indicato con la doppia tilde? |
| anno-1783629115321 | 09/07/2026 | `/recipe/pizza_al_metro` | risolta | quello che c'è sotto allo slider potrebbe animarsi |
| anno-1783629149713 | 09/07/2026 | `/recipe/pizza_al_metro` | risolta | perché non si aggancia? |
| anno-1783629199743 | 09/07/2026 | `/profile` | risolta | questo tab va per primo |
| anno-1783629244102 | 09/07/2026 | `/profile` | risolta | La tua Cucina |
| anno-1783629272623 | 09/07/2026 | `/profile` | risolta | Ricette salvate |
| anno-1783629300861 | 09/07/2026 | `/profile` | risolta | manca tutto il discorso su resistenze (sopra sotto ecc), bruciatori, forma dei bruciatori ecc... Cerchiamo di farlo in maniera figa e che… |
| anno-1783629364973 | 09/07/2026 | `/profile` | risolta | è corretta l'animazione e gli stati di questo elemento? |
| anno-1783629387247 | 09/07/2026 | `/` | risolta | perché qui non è bianco? (e anche nel DS!) |
| anno-1783629428822 | 09/07/2026 | `/explore` | risolta | Mettiamo iconcine (cuore, cuore spezzato ecc) |
| anno-1783629473814 | 09/07/2026 | `/explore` | risolta | questo bordo è necessario da DS? |
| anno-1783629544157 | 09/07/2026 | `/` | risolta | è corretto che questo button e quello Close abbiano status diversi? |
| anno-1783629589080 | 09/07/2026 | `/` | risolta | preferisco gli elementi navbar in alto e non centrati |
| anno-1783629636021 | 09/07/2026 | `/` | risolta | il cerca in material va qui? |
| anno-1783629662855 | 09/07/2026 | `/` | risolta | sotto i risultati ora cambiano correttamente, ma senza animazioni di feedback |
| anno-1783629760265 | 09/07/2026 | `/` | risolta | e la 1? |
| anno-1783629786081 | 09/07/2026 | `/` | risolta | perché qui non indichiamo il tipo di farina ma solo la forza e nei filtri il contrario? Ragioniamoci su! |
| anno-1783629821071 | 09/07/2026 | `/` | risolta | occhio che sull'hover la pillola viene tagliata in alto |
| anno-1783629855048 | 09/07/2026 | `/` | risolta | è possibile aggiungere "Versione"? |
| anno-1783629895403 | 09/07/2026 | `/` | risolta | uhm non ci siamo come layout... |
| anno-1783629946995 | 09/07/2026 | `/` | risolta | o li mettiamo per esteso, o mettiamo un tip |
| anno-1783629985427 | 09/07/2026 | `/` | risolta | non ha senso che la modale venga limitata in basso... dovrebbe essere TIPO pannello |
| anno-1783630059548 | 09/07/2026 | `/` | risolta | dobbiamo trovare un compromesso fra questo storing e quello di Crea |
| anno-1783630099948 | 09/07/2026 | `/` | risolta | questo sottotitolo dovrebbe essere legato alla selezione sottostante più che qui |
| anno-1783630161225 | 09/07/2026 | `/` | risolta | togliere nota |
| anno-1783630170488 | 09/07/2026 | `/` | risolta | togliere sillabazione (dovrebbe essere usata solo come estrema ratio... qui andando a capo entrava) |
| anno-1783630219116 | 09/07/2026 | `/` | risolta | che n e dici se qui mettiamo la versione animata del logo, che magari "illumina" col fuoco il glass della barra? |
| anno-1783630281602 | 09/07/2026 | `/` | risolta | manca animazione chips. dovrebbe essere definita a livello di DS, di componente |
| anno-1783630314527 | 09/07/2026 | `/` | risolta | back poco visibile. Dovrebbe rimanere persistente |
| anno-1783630341620 | 09/07/2026 | `/` | risolta | icona cuore anche qui. più visibilità del match. |
| anno-1783630419292 | 09/07/2026 | `/` | risolta | forse poco visibili? |
| anno-1783630452410 | 09/07/2026 | `/` | risolta | non credi sia vuoto qui a destra? |
| anno-1783630479706 | 09/07/2026 | `/` | risolta | e se mettessimo un glow? (diverso a seconda della situazione...) |
| anno-1783630503210 | 09/07/2026 | `/` | risolta | button non ha stati/animazione |
| anno-1783630532189 | 09/07/2026 | `/` | risolta | button SEMBRA avere elevation minore di elementi su cui passa sopra |
| anno-1783630564114 | 09/07/2026 | `/` | risolta | per ora spegniamo questa feature, ovunque |
| anno-1783630635705 | 09/07/2026 | `/` | risolta | che vuol dire "questa versione assume"? miglioriamo l'italiano |
| anno-1783630688822 | 09/07/2026 | `/` | risolta | più spazio sopra? |
| anno-1783663905765 | 10/07/2026 | `/` | risolta | Ingredienti è addirittura più grande dell'h1! |
| anno-1783663941664 | 10/07/2026 | `/` | risolta | bastava na matitina... |
| anno-1783666010976 | 10/07/2026 | `/` | risolta | invertirei il glow: la parte colorata a sinistra |
| e2e-test-1783186839000 | 04/07/2026 | `` | eliminata |  |
