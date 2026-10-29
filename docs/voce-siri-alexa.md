# Vulcan a voce: Siri e Alexa (D-061)

Decisione di Matteo del 29/10/2026: Siri con un **Comando rapido** e una
**skill Alexa classica** in italiano (it-IT). Alexa+ con l'MCP Toolkit è
oggi riservata a partner selezionati; quando Amazon la aprirà a tutti basterà
collegarla al server MCP che c'è già (`/mcp`, D-049). Niente app nativa.

## Architettura

```
voce ──► Siri: Comando rapido ──► GET /api/voice?q=…  ─┐
     └─► Alexa: skill it-IT    ──► POST /alexa (firmata) ┤
                                                         ▼
                         src/app/agent/voice  (capisce la frase, sceglie le parole)
                                                         │ tools/call
                                                         ▼
                         server MCP (mcp-server.ts → mcp-tools.ts)
                                                         │
                                                         ▼
                                    motore (pizza-engine, glossario)
```

Regola: **la voce attinge dall'MCP**. Ogni numero detto (grammi, ore,
gradi, compatibilità) arriva da una chiamata `tools/call` a
`recommend_styles`, `generate_recipe` o `glossary`, con gli stessi input di
un agente e `recipe_mode: "adapted"` (la proposta di Crea). Lo strato voce non
calcola niente: capisce la domanda e mette i numeri in frasi brevi.

| Parte | File |
|---|---|
| Riconoscimento (stili, termini, numeri in lettere, forno, ore, panetti) | `src/app/agent/voice/understand.ts` |
| Risposte costruite dai tool MCP | `src/app/agent/voice/answer.ts` |
| Numeri detti, testo senza simboli, SSML | `src/app/agent/voice/speech.ts` |
| Tutte le parole in italiano (frasi, sinonimi, avvertenze) | `src/app/agent/voice/catalog-it.ts` |
| Endpoint per Siri | `src/server/voice/http.ts` |
| Endpoint e verifica Alexa | `src/server/alexa/` (`verify.ts`, `x509.ts`, `skill.ts`, `handler.ts`) |
| Pacchetto della skill per ASK CLI | `alexa/` (vedi `alexa/README.md`) |
| Rotte | `worker/index.ts`, `run_worker_first` in `wrangler.toml` |

### Che cosa capisce

- **Consiglio**: «che pizza posso fare», «cosa mi consigli col forno a legna»,
  «ho sei ore». Senza forno né ore usa un forno di casa (250 °C) e un giorno
  di tempo, e **lo dice**. Le pizze fritte vengono dopo quelle al forno
  (D-032). Se nessuno stile ci sta, dice quanto tempo o quanto forno serve.
- **Ricetta**: «ricetta napoletana per quattro panetti», «teglia romana per due
  teglie in ventiquattro ore», «la pinsa». Dice pezzi e peso, farina, acqua,
  sale, lievito (ed eventuale olio, burro, strutto, zucchero), la forza della
  farina come fascia a parole (D-060), pre-impasto, lievitazione, forno (o
  frittura) e tempo totale; il procedimento resta nell'app, con il link.
  Senza numero di pezzi usa quello predefinito dell'app per lo stile.
  Se la ricetta non è fattibile lo dice, spiega il motivo e propone le
  alternative di `recommend_styles`, come chiede la guida MCP. Le avvertenze
  vere (teglia, forno sotto l'ideale…) si ripetono in breve; le verifiche di
  dispensa («Se hai farina…») no, come nell'app (D-060).
- **Glossario**: «cos'è la biga», «cosa vuol dire autolisi»: le prime frasi
  della definizione, con simboli e unità detti a parole.
- **Aiuto** e risposta di riserva quando non capisce.

Stili e termini si riconoscono da sinonimi e piccole storpiature
(«napoletano», «pinza», «fugassa»); per gli stili dell'edizione senza sinonimi
basta il nome. Numeri in lettere fino a 599. Le frasi sono brevi: al massimo
tre numeri per frase, circa 60 parole per risposta (70 al massimo per le
ricette più lunghe, controllato dai test).

### Lingue

Solo italiano. Lo strato è pronto per altre lingue: un file
`catalog-<lingua>.ts` con la forma `VoiceCatalog` e una riga in
`catalog.ts`. Oggi `lang` diverso da `it` risponde in italiano.

## Endpoint

### `GET|POST /api/voice` (Siri)

- `?q=<frase>&lang=it` → `text/plain`, la frase da far pronunciare.
- `&format=json` → `{ "speech", "url", "intent", "lang", … }` (per la
  ricetta anche `style_id`, `dough_balls`, `outcome`, `ingredients`).
- POST: corpo di testo semplice, JSON `{ "q": "…" }` o modulo `q=…`.
- Domanda oltre 300 caratteri (o corpo oltre 4 kB) → 400 con una frase.
- `Cache-Control: no-store`, nessun CORS (il Comando rapido non è un browser),
  nessun dato dell'utente letto o salvato, nessuna chiamata di rete.

Prova:

```bash
curl -s "https://vulcan-pizza-lab.zatteo.workers.dev/api/voice?q=ricetta%20pinsa%20per%20due%20pale"
```

### `POST /alexa` (skill)

Endpoint HTTPS della Custom Skill. Ogni richiesta passa dalle verifiche che
Amazon chiede per la certificazione; qualsiasi errore → **400**:

1. `SignatureCertChainUrl`: `https`, host `s3.amazonaws.com` (maiuscole
   ammesse), percorso che inizia con `/echo.api/` dopo la normalizzazione,
   porta 443 se indicata.
2. Catena PEM scaricata (timeout 3 s, massimo 64 kB): certificato finale
   valido adesso, SAN con `echo-api.amazon.com`, catena fino a una radice di
   Amazon Trust Services (`src/server/alexa/trust-anchors.ts`). Il certificato
   verificato resta in memoria per URL.
3. `Signature-256`: RSA-SHA256 del corpo grezzo, con WebCrypto.
4. `request.timestamp` entro 150 secondi.
5. `applicationId` uguale a `ALEXA_SKILL_ID`; **senza la variabile si rifiuta
   tutto**.

La verifica X.509 è scritta nel repository (`x509.ts`, WebCrypto, nessuna
libreria): legge DER, date, SAN e basicConstraints e verifica le firme RSA ed
ECDSA. I test la provano con una PKI generata al volo e con la catena vera di
`echo-api.amazon.com` (archiviata in `__fixtures__`). Nessuna dipendenza nuova,
niente nel bundle dell'app.

Richieste gestite: `LaunchRequest`, `IntentRequest` (ConsigliaIntent,
RicettaIntent, GlossarioIntent, AMAZON.HelpIntent, StopIntent, CancelIntent,
FallbackIntent, NavigateHomeIntent), `SessionEndedRequest` (risposta vuota).
Risposte in SSML con pause brevi, reprompt quando la sessione resta aperta,
scheda «Simple» con il link alla pagina di Vulcan. Se alla ricetta manca lo
stile la skill lo chiede e ricorda pezzi, ore e forno negli attributi di
sessione; dopo un consiglio chiede «Vuoi la ricetta?» con la stessa cucina.

### Dove funziona

- **Produzione generalista** (`vulcan-pizza-lab.zatteo.workers.dev`): sì.
- **Worker di test** (`vulcan-test`, `vulcan-<id>-test`): `REQUIRE_ACCESS=1`,
  quindi senza l'header di Cloudflare Access rispondono **403** anche su
  `/api/voice` e `/alexa`. È voluto: Siri e Alexa non passano da Access, la
  voce si prova in produzione o in locale (`npm run build && npx wrangler dev`).
- **Edizioni**: `/api/voice` risponde con il catalogo dell'edizione; `/alexa`
  rifiuta tutto perché `ALEXA_SKILL_ID` non c'è.

### Tempi

Motore locale, nessuna rete (tranne il primo download del certificato Alexa).
Misure in Node sul bundle del Worker: consiglio 35–135 ms (il primo è il più
lento), ricetta 3–65 ms (di più se non fattibile: chiama anche
`recommend_styles`), glossario < 5 ms. Alexa concede 8 secondi.
Attenzione al piano Workers: con il piano gratuito il limite è 10 ms di CPU per
richiesta e il consiglio lo supera (lo stesso vale già per `recommend_styles`
su `/mcp`); con il piano a pagamento il limite è 30 s.

## Sicurezza

- `/api/voice` è pubblico come `/mcp`: sola lettura, motore e glossario, niente
  dati personali, niente cookie, niente scritture, niente log applicativi.
  Limite d'ingresso 300 caratteri. Non c'è un limite di frequenza nel codice:
  se servisse, una regola di rate limiting di Cloudflare sul percorso.
- `/alexa` accetta solo richieste firmate da Amazon per la nostra skill (sopra).
  L'unico traffico in uscita è il download della catena di certificati da
  `s3.amazonaws.com/echo.api/…`, dopo il controllo dell'URL.
- `ALEXA_SKILL_ID` non è un segreto, ma va impostato come secret del Worker
  così sopravvive ai deploy senza toccare `wrangler.toml`.

## Siri: il Comando rapido, passo passo

Sull'iPhone, app **Comandi rapidi** → **+** (nuovo comando):

1. Azione **Dettatura testo**. Lingua: Italiano. Interrompi l'ascolto: dopo
   una breve pausa. (Su HomePod e Apple Watch, se la dettatura non parte, usa
   al suo posto **Richiedi input** con tipo Testo e la domanda «Cosa vuoi
   sapere?»: Siri la fa a voce.)
2. Azione **Codifica URL**, con ingresso «Testo dettato» (codifica, non
   decodifica).
3. Azione **URL** con il testo
   `https://vulcan-pizza-lab.zatteo.workers.dev/api/voice?lang=it&q=` seguito
   dalla variabile «Testo codificato URL» (toccare la variabile per inserirla
   in fondo).
4. Azione **Ottieni contenuti dell'URL** (metodo GET, impostazione
   predefinita).
5. Azione **Pronuncia testo**, con ingresso «Contenuti dell'URL». (In
   alternativa **Mostra risultato**: Siri lo legge e lo mostra.)
6. Nome del comando: **Chiedi a Vulcan**. Facoltativo: icona e «Mostra su
   Apple Watch» nei dettagli del comando.

Uso: «Ehi Siri, chiedi a Vulcan» → Siri ascolta → «ricetta napoletana per
quattro panetti col forno a legna».

Variante con il link alla ricetta (solo iPhone): nell'URL aggiungi
`&format=json`; dopo «Ottieni contenuti dell'URL» usa **Ottieni valore del
dizionario** (chiave `speech`) → **Pronuncia testo**, poi un'altra **Ottieni
valore del dizionario** (chiave `url`) → **Apri URL**.

**HomePod**: i Comandi rapidi personali partono dall'HomePod se sono attive
le Richieste personali (app Casa → HomePod → Richieste personali) e l'iPhone
con lo stesso Apple ID è in casa. **Apple Watch**: il comando compare se è
attivo «Mostra su Apple Watch»; serve la connessione (iPhone vicino, Wi-Fi o
cellulare).

Limiti di Siri: la frase non può stare nella stessa invocazione («Ehi Siri,
chiedi a Vulcan la ricetta…» non passa il resto della frase al comando), quindi
sono due passi; nessuna memoria tra una domanda e l'altra; solo italiano; solo
la produzione (i Worker di test rispondono 403).

## Alexa: pubblicazione

I passi sono in `alexa/README.md`: account sviluppatore Amazon, `ask deploy`
del pacchetto, `ALEXA_SKILL_ID` sul Worker, prova nel simulatore e su un
dispositivo, certificazione.

Nota: **l'app non ha pagine di privacy né di termini d'uso**. Per una skill
che non raccoglie dati personali Amazon non li rende obbligatori, ma possono
essere chiesti in certificazione; `skill.json` per ora non li indica.

## Cosa resta a Matteo

1. Rivedere e unire la PR (con `verify` verde); approvare il deploy di
   produzione (`deploy-production`).
2. Provare l'endpoint in produzione: il `curl` qui sopra deve rispondere con
   la frase (se risponde con un errore 1102, il piano Workers è quello gratuito
   e il consiglio supera i 10 ms di CPU: va valutato il piano a pagamento).
3. iPhone: creare il Comando rapido «Chiedi a Vulcan» con i passi sopra;
   provarlo con Siri, poi (se serve) su Apple Watch e HomePod.
4. Alexa: seguire `alexa/README.md` (account sviluppatore, `ask deploy`,
   `wrangler secret put ALEXA_SKILL_ID`, prova, certificazione).
5. Decidere se servono pagine di privacy e termini prima della certificazione.
