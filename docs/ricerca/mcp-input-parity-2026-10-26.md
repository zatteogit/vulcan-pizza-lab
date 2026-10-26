# MCP 1.1.0: stessi input del configuratore

La PR #88 aveva esplicitato un limite del MCP: non accettava dispensa,
esclusioni e parametri avanzati del browser. Questa estensione lo rimuove.

## Contratto

`recommend_styles` e `generate_recipe` accettano inventari parziali/completi,
disponibilità e rifiuti, dati delle farine, ingredienti e condimenti,
attrezzatura dettagliata, geometria/peso, impasto e prefermenti. `get_style`
espone preset, firme e condimenti. `list_pantry_items` cerca marche e ID stabili.
Gli input malformati, le chiavi sconosciute e gli ID di risorse inesistenti
sono errori espliciti, anziché vincoli scartati in silenzio.

I percorsi `recipe_mode:canonical` e `adapted` usano gli stessi entry point e
gli stessi pesi predefiniti dell'app. La verifica ha infatti individuato una
divergenza ulteriore: il vecchio MCP usava 45/30/25/0/0, il CMS
30/25/20/15/10. Questi ultimi ora provengono da una costante di dominio
condivisa; `score_weights` permette di riprodurre un CMS personalizzato.

La modalità omessa/`default` conserva i calcoli storici per i client esistenti.
Per confrontare Crea va chiesta `adapted`; per il riferimento `canonical`.
Una firma/preset implica `canonical`, salvo `adapted` esplicito. Le scelte
numeriche esplicite vengono applicate dopo il preset e sono ispezionabili in
`effective_options`. Regole e schema completo sono in `docs/agenti-mcp.md`.

## Verifiche

- 29 stili × 2 modalità × 3 cucine: assi, dosi, esito, condizioni e timeline
  MCP uguali alla ricetta prodotta dagli entry point del browser.
- Tutti i 38 preset e le 20 firme, originali e ottimizzati: stessa verifica.
- 29 consigli e rispettive generazioni, nelle due modalità, con dispensa ed
  esclusioni: stesso voto, esito e ricetta valutata.
- Inventario omesso/parziale, mancanza confermata, divieto di acquisto, riso
  escluso, farina personalizzata, sole proteine senza W, lievito secco,
  basilico escluso con Margherita/Marinara, teglia 30×20, planetaria/spirale,
  distribuzione del calore e quota del poolish.
- Voti osservati nel browser: Tonda Romana a 450 °C 91/100 e Genovese a
  250 °C 87/100, con livello 1 e inventario non specificato, riprodotti dal MCP.
- Catalogo senza ID duplicati; l'inventario può contenere tutti i condimenti.
- 348 richieste JSON-RPC preparate per il confronto esatto fra risultati
  locali e produzione, inclusi dieci errori attesi e lo schema `tools/list`.

Suite: 569 test passati, 1 saltato; typecheck, lint, build e budget verificati.
Le prove sono in `src/app/agent/mcp-kitchen-parity.test.ts`; input/output e
risultati del collaudo online vengono conservati localmente in
`output/mcp-full-kitchen-2026-10-26/`.
