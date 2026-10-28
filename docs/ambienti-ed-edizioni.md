# Ambienti ed edizioni

Decisioni del 28/10/2026 (D-051…D-054): un solo `main`, più **edizioni**; marchi
reali in un repository privato; produzione solo con approvazione.

## 1. Edizioni: un main, più versioni

Un'edizione è un file JSON che sceglie cosa vede l'utente. Il codice è lo stesso
per tutte. Non si aprono rami per cliente: una correzione al motore arriva a ogni
edizione con un solo merge.

| Edizione | Dove sta | Tipo | Worker di test | Worker di produzione |
|---|---|---|---|---|
| `vulcan` (generalista) | `editions/vulcan.json` | `generalist` | `vulcan-test` | `vulcan-pizza-lab` |
| `demo-forno` (Fornace Aurora, marchio inventato) | `editions/demo-forno.json` | `demo` | `vulcan-demo-forno-test` | — (resta in test) |
| `effeuno` | repository privato `vulcan-editions` | `partner` | `vulcan-effeuno-test` | `vulcan-effeuno` (solo con un contratto) |

Cosa può cambiare un'edizione oggi (schema 1, `src/app/config/edition.ts`):

- `partner`: co-branding. Il prodotto resta Vulcan e la testata dice «per <partner>».
- `ovens.only`: prefissi degli id dei forni ammessi (per esempio `["effeuno-"]`).
- `ovens.extra`: modelli in più, per esempio i forni inventati di una demo.
- `ovens.default`: forno preimpostato al primo avvio. Non sovrascrive mai una scelta già salvata.
- `indexing`: `noindex` è obbligatorio per demo e partner. Il Worker manda `X-Robots-Tag`.

Regole controllate dai test (`src/app/config/edition.test.ts`):

- Nel repository pubblico non ci sono edizioni `partner`.
- Una demo dichiara `partner.invented: true`.
- Il forno preimpostato esiste nel catalogo dell'edizione.
- La generalista non cambia nulla rispetto a prima.

Quando servirà altro (tema, lingue, funzioni accese, testi legali: B-1 dell'handoff),
si aggiunge un campo allo schema e lo si legge dove serve. Mai un `if (id === "effeuno")`
nel codice: decide il dato, non il nome del cliente.

### Come viene scelta

- `VULCAN_EDITION=<id>`: quale edizione costruire. Se non è impostata si usa `vulcan`.
- `VULCAN_EDITIONS_DIR=<cartella>`: dove trovare le edizioni private. In locale e in CI
  è `.editions-private/editions`, ignorata da git.
- `scripts/edition-path.mjs` risolve il file e l'alias `@vulcan/edition` lo porta in
  Vite, Vitest e nella build del Worker. Il server MCP vede quindi lo stesso catalogo
  dell'app. `tsconfig.json` punta alla generalista per typecheck e script `tsx`.
- Un'edizione non valida ferma la build con un errore leggibile.

## 2. Ambienti

| Ambiente | Cosa | Come ci arriva il codice | Chi lo vede |
|---|---|---|---|
| **Sviluppo** | `npm run dev` (porta 5174) e, per le API, `wrangler dev` con `.dev.vars` (vedi `.env.example`) | in locale | tu |
| **Anteprima PR** | solo il controllo `verify` su GitHub; le anteprime di Workers Builds sono spente (stato del 28/10/2026) | a ogni push su una PR | — |
| **Test** | `vulcan-test` (generalista con strumenti `/dev`, `/cms`, `/design-system` e D1 di test UE) e `vulcan-<id>-test` per ogni edizione (senza strumenti né D1) | automatico a ogni merge su `main` (`deploy-test.yml`) | solo su invito (Cloudflare Access), `noindex`; senza Access il Worker risponde 403 |
| **Produzione** | `vulcan-pizza-lab` (generalista) e `vulcan-<id>` per i partner con contratto | **solo** dal workflow `deploy-production`, con la tua approvazione, con lo sha già passato da `main` | pubblico (generalista) o come da contratto |

### Comandi

```bash
npm run dev                                         # generalista
VULCAN_EDITION=demo-forno npm run dev               # demo Fornace Aurora
VULCAN_EDITIONS_DIR=.editions-private/editions VULCAN_EDITION=effeuno npm run dev
VULCAN_EDITION=demo-forno npm run build             # build di un'edizione
npm run editions:list                               # edizioni che la CI pubblica in test
npm run deploy:edition -- demo-forno test           # deploy manuale (serve wrangler login)
npm run deploy:edition -- demo-forno test --dry-run # prova senza pubblicare
```

La generalista si pubblica come prima: `npm run deploy:test` in test, il workflow
`deploy-production` in produzione.

## 3. Aggiungere un'edizione

1. **Demo con marchio inventato**: `editions/<id>.json` con `kind: "demo"`,
   `partner.invented: true` e forni in `ovens.extra`. Verifica che il nome non sia
   un marchio reale.
2. **Marchio reale**: `editions/<id>.json` nel repository privato `vulcan-editions`,
   con `kind: "partner"` e `indexing: "noindex"`. Una demo con i dati di un'azienda si
   mostra solo a quell'azienda: il suo Worker di test va dietro Cloudflare Access con
   le sole email del partner (§4, passo 4).
3. `npm run verify` e una build con quella edizione.
4. Al merge su `main` (o al push sul repository privato e poi «Run workflow» su
   `deploy-test`) parte `vulcan-<id>-test`.

## 4. Passi una tantum

### Già fatti (28/10/2026, da Claude con il connettore Cloudflare)

- D1 `vulcan-test` creato con giurisdizione UE (`f5c0620f-440b-4256-aced-2564c7cb5e87`),
  con lo schema di `schema.sql` caricato. L'ID è in `wrangler.toml`.
- `account_id` è in `wrangler.toml`: non è un segreto, quindi su GitHub basta il token.
- Sicura **fail-closed**: i Worker di test (`vulcan-test`, `vulcan-<id>-test`) hanno
  `REQUIRE_ACCESS=1` e rispondono 403 a ogni richiesta che non arriva da Cloudflare
  Access. Il controllo guarda l'header `Cf-Access-Jwt-Assertion`. È una protezione
  contro gli errori di configurazione, non l'autenticazione: quella la fa Access.
  Se pubblichi prima di aver configurato Access, i Worker restano chiusi invece di
  essere pubblici.
- **Zero Trust attivo**: team `zatteo.cloudflareaccess.com`, accesso con codice via email
  (One-time PIN).
- **Policy riutilizzabili**, entrambe con sessione di 24 h:
  - «Vulcan · team (test e demo)»: oggi solo `zatteo@gmail.com`;
  - «Vulcan · partner Effeuno»: oggi solo `zatteo@gmail.com`. Le email di Effeuno si
    aggiungono qui (Zero Trust → Access → Policies), senza toccare il codice.
- **Applicazioni Access per hostname**, che proteggono l'indirizzo anche prima che il
  Worker esista:

  | Applicazione | Hostname | Policy |
  |---|---|---|
  | Vulcan · test generalista | `vulcan-test.zatteo.workers.dev` | team |
  | Vulcan · demo Fornace Aurora | `vulcan-demo-forno-test.zatteo.workers.dev` | team |
  | Vulcan · demo Effeuno | `vulcan-effeuno-test.zatteo.workers.dev` | partner Effeuno |

  Una nuova edizione vuole la sua applicazione (`vulcan-<id>-test.zatteo.workers.dev`)
  prima del primo deploy. Senza, la sicura del Worker risponde 403.

### Da fare (Matteo), in quest'ordine

GitHub non permette a Claude di creare repository né di impostare segreti o ambienti.

1. **Repository privato** `zatteogit/vulcan-editions`: crealo privato e carica il
   contenuto di `.editions-private/` (`README.md` ed `editions/effeuno.json`). Poi crea
   un fine-grained token con «Contents: Read-only» solo su quel repository e salvalo in
   `vulcan-pizza-lab` → Settings → Secrets → Actions come `VULCAN_EDITIONS_TOKEN`.
2. **Token Cloudflare per GitHub**: Cloudflare → My Profile → API Tokens → modello
   «Edit Cloudflare Workers», limitato a questo account. In `vulcan-pizza-lab` →
   Settings → Secrets → Actions aggiungi `CLOUDFLARE_API_TOKEN`. Da quel momento ogni
   merge su `main` pubblica in test. Al primo deploy verifica da una finestra in
   incognito che i tre indirizzi chiedano il codice via email.
3. **Ambiente `production`** su GitHub: Settings → Environments → `production`, con
   «Required reviewers» (tu). Fai girare `deploy-production` una volta con lo sha di
   `main` e `edition = vulcan`.
4. **Spegni il deploy automatico** di Workers Builds su `vulcan-pizza-lab` (oggi
   pubblica `main` in produzione a ogni merge). Chiedilo a Claude, che può farlo dal
   connettore Cloudflare, oppure dalla dashboard: Workers → vulcan-pizza-lab →
   Settings → Builds. Va fatto solo dopo il passo 3, altrimenti la produzione resta
   senza una strada per uscire.

## 5. Cosa non fa (ancora)

- Tema, logo, lingue e testi legali per edizione: sono campi da aggiungere allo
  schema, quando un partner li chiede (B-1).
- Embed in iframe con `postMessage` e CSP per dominio (B-2): dopo un pilot firmato.
- Analytics per edizione (B-5): nessuna.
- In un'edizione l'onboarding del profilo propone il tipo di forno preimpostato, ma il
  testo resta quello generico: non dice ancora «il tuo forno <partner>».
