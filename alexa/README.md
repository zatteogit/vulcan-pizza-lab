# Skill Alexa «Vulcan Pizza» (it-IT)

Custom Skill classica (D-061). Il codice gira nel Worker di Vulcan
(`POST /alexa`, `src/server/alexa/`); qui c'è solo il pacchetto per Amazon,
pronto per ASK CLI. Architettura, sicurezza e limiti:
`docs/voce-siri-alexa.md`.

```
alexa/
├── ask-resources.json                  profilo ASK CLI (solo metadati, niente Lambda)
└── skill-package/
    ├── skill.json                      manifesto: nome, it-IT, endpoint, privacy
    ├── assets/images/                  icone 108×108 e 512×512 (da public/icon-512.png)
    └── interactionModels/custom/
        └── it-IT.json                  modello d'interazione (generato)
```

- **Nome**: Vulcan Pizza. **Nome di invocazione**: «vulcano pizza» (due
  parole, minuscole; «vulcan» da solo è poco riconosciuto dal riconoscimento
  vocale italiano). Da provare nel simulatore prima della certificazione: se
  Alexa non lo capisce bene, cambiarlo in `src/server/alexa/interaction-model.ts`
  e rigenerare.
- **Endpoint**: `https://vulcan-pizza-lab.zatteo.workers.dev/alexa`, certificato
  «Wildcard» (il dominio `*.workers.dev` di Cloudflare).
- **Intenti**: ConsigliaIntent, RicettaIntent, GlossarioIntent (24, 27 e 20
  frasi d'esempio) più Help, Stop, Cancel, Fallback, NavigateHome. Slot:
  `stile` (STILE), `termine` (TERMINE), `forno` (FORNO), `panetti` e `ore`
  (AMAZON.NUMBER).
- **Il modello è generato**: STILE dal catalogo degli stili, TERMINE dal
  glossario, FORNO dal catalogo voce. Dopo aver cambiato stili, sinonimi o
  frasi:

  ```bash
  npx tsx scripts/build-alexa-model.ts
  ```

  Il test `src/server/alexa/interaction-model.test.ts` fallisce se il file non
  è aggiornato.

## Pubblicazione, passo passo

1. **Account sviluppatore Amazon**: <https://developer.amazon.com> con l'account
   Amazon.it che si userà anche sugli Echo di prova.
2. **ASK CLI** (una volta, sul computer):

   ```bash
   npm install -g ask-cli
   ask configure            # login nel browser; niente account AWS: «No» alla domanda su AWS
   ```

3. **Creare la skill dal pacchetto**:

   ```bash
   cd alexa
   ask deploy
   ```

   La prima volta ASK CLI crea la skill e scrive il suo ID in
   `alexa/.ask/ask-states.json` (non va nel repository: è nel `.gitignore`).
   In alternativa, nella Developer Console: *Create Skill* → nome «Vulcan
   Pizza», lingua Italiano, modello *Custom*, hosting *Provision your own*;
   poi *Interaction Model → JSON Editor* con `it-IT.json` ed *Endpoint* →
   HTTPS, URL qui sopra, «My development endpoint is a sub-domain of a domain
   that has a wildcard certificate».

4. **ID della skill nel Worker** (Developer Console → la skill → *Copy Skill
   ID*, inizia con `amzn1.ask.skill.`):

   ```bash
   npx wrangler secret put ALEXA_SKILL_ID
   ```

   (oppure Cloudflare → Workers → `vulcan-pizza-lab` → Settings → Variables
   and Secrets → Add → Secret). Senza questo valore `/alexa` rifiuta ogni
   richiesta con 400. Il secret resta anche dopo i deploy.

5. **Provare**: Developer Console → *Test* → «Development»; scrivere o dire
   «apri vulcano pizza», «chiedi a vulcano pizza la ricetta della focaccia»,
   «chiedi a vulcano pizza cos'è la biga». Lo stesso funziona sugli Echo
   collegati all'account sviluppatore, senza pubblicare.
6. **Distribuzione**: la scheda *Distribution* è già compilata da `skill.json`
   (descrizione, frasi d'esempio, icone, categoria Cucina e ricette, solo
   Italia). Manca la privacy (vedi sotto). *Certification → Validation*, poi
   *Submission*. Amazon risponde di solito in pochi giorni.

## Da decidere prima della certificazione

- **Privacy e termini d'uso**: l'app non ha queste pagine. La skill non
  raccoglie dati personali (`usesPersonalInfo: false`), quindi Amazon non le
  rende obbligatorie, ma possono essere chieste in revisione. Se si fanno,
  aggiungere `privacyPolicyUrl` e `termsOfUseUrl` in
  `privacyAndCompliance.locales.it-IT` di `skill.json`.
- **Alexa+**: con l'MCP Toolkit aperto ai non partner, il server `/mcp`
  basterà senza questa skill (D-061).
