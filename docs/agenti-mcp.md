# Motore per agenti: server MCP (D-049)

Il Worker espone il motore su **`/mcp`** con il Model Context Protocol
(JSON-RPC 2.0 su HTTP, specifica 2025-06-18). Un agente (Claude, ChatGPT,
altri client MCP) ci si collega con l'indirizzo:

```
https://vulcan-pizza-lab.zatteo.workers.dev/mcp
```

Il server è pubblico, senza stato e in sola lettura: usa il motore e i testi
del glossario, non legge né scrive dati degli utenti.

## Strumenti

| Strumento | A cosa serve | Dati restituiti |
|---|---|---|
| `list_styles` | Elenco degli stili, filtrabile per famiglia | id, nome, famiglia, origine, idratazione, ore, forno |
| `get_style` | Tutti i parametri di uno stile | impasto, forma, cottura, caratteristiche |
| `recommend_styles` | Stili per una cucina (forno, ore, livello) | compatibilità 0–100 (lo stesso numero dell'app, D-041), margine ottimizzabile, motivi e avvisi |
| `generate_recipe` | Ricetta completa per stile e cucina | grammi e percentuali del panettiere, pre-fermento, forno, passi con durata, esito (`ok`, `warnings`, `not_feasible` con i motivi) |
| `glossary` | Definizioni dei termini, in 7 lingue | nome, definizione, range, perché conta |

Ogni risposta ha un riassunto leggibile (`content`) e i dati strutturati
(`structuredContent`), che un client può mostrare come scheda o tabella. Gli
errori di input tornano come risultato con `isError: true`, così il modello
può correggersi.

La cucina si descrive con `oven_model` (marca e modello, D-048) oppure
`oven_type` e `oven_max_temp_c`, più `available_hours` (con `meal_deadline`
se c'è un pasto a orario fisso), `skill_level`, `dough_balls` e
l'attrezzatura (`has_baking_pan`, `has_mixer`, `has_pizza_stone`,
`has_pizza_steel`). Istruzioni pronte per un GPT o una skill:
`docs/istruzioni-gpt.md`.

I testi dei passi sono in italiano (sono i testi di riserva del motore); la
traduzione dei passi resta nell'app. Prossimo passo previsto: widget grafici
(Apps SDK di OpenAI e MCP UI) per mostrare ricetta e procedimento in chat.

## Come collegarlo

- **Claude** (claude.ai o desktop): Impostazioni → Connettori → Aggiungi
  connettore personalizzato → incollare l'indirizzo sopra.
- **ChatGPT**: modalità sviluppatore → Connettori → nuovo connettore con
  l'indirizzo sopra.
- **Prova a mano**:

```bash
curl -s https://vulcan-pizza-lab.zatteo.workers.dev/mcp \
  -H 'content-type: application/json' \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"generate_recipe","arguments":{"style_id":"napoletana_stg","oven_type":"home","oven_max_temp_c":250,"dough_balls":4}}}'
```

## Dove sta il codice

- `src/app/agent/mcp-tools.ts`: gli strumenti (puri, testati).
- `src/app/agent/mcp-server.ts`: il protocollo (initialize, ping, tools/list,
  tools/call; notifiche → 202).
- `worker/index.ts`: la rotta `/mcp` (POST e OPTIONS; GET → 405).
- `scripts/build-worker.mjs`: il build del Worker, che esclude le immagini
  dei condimenti dal bundle; `wrangler.toml` lo esegue prima di dev e deploy.
