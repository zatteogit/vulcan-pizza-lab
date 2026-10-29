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
- FW-15 (D-K) `partner.relationship`: `co-branded` o `demo` (predefinito: `demo` se il
  marchio è inventato). `partner.neutralityStatement`: `same-engine` (predefinito). Il testo
  di ogni valore è in 7 lingue (`edition.relationship.*`, `edition.neutrality.*` in
  `ui-messages.*.ts`); Informazioni e onboarding lo mostrano. Un valore nuovo si aggiunge
  allo schema e ai cataloghi.
- FW-15 `feedbackUrl`: canale per i riscontri (`https:` o `mailto:`), mostrato in
  Informazioni. Assente = nessun canale. Contatti reali solo nelle edizioni private.
- FW-15 `search.suggestions`: suggerimenti della ricerca, scelti fra `SEARCH_SUGGESTION_IDS`
  (bisogni e stili, niente marchi né persone). Assente = l'elenco predefinito.

Regole controllate dai test (`src/app/config/edition.test.ts`):

- Nel repository pubblico non ci sono edizioni `partner`.
- Una demo dichiara `partner.invented: true`.
- Il forno preimpostato esiste nel catalogo dell'edizione; `parseEdition` rifiuta un
  `ovens.default` escluso da `ovens.only` (FW-15, S18-B-09). Per un'edizione privata:
  `VULCAN_EDITION=<id> npx vitest run src/app/config/edition.test.ts` (il test «la
  generalista è la build predefinita» lì fallisce per costruzione: gli altri devono passare).
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

### Completati il 28/10/2026 (sessione Claude + Matteo)

I valori dei token li ha maneggiati solo Matteo (generati nelle dashboard e incollati
nei campi Secret); repository, ambienti, workflow e verifiche sono stati automatizzati.

1. **Repository privato** `zatteogit/vulcan-editions` creato con `README.md` ed
   `editions/effeuno.json`. PAT fine-grained «Contents: Read-only» sul solo repository,
   senza scadenza → secret `VULCAN_EDITIONS_TOKEN`.
2. **Token Cloudflare** dal modello «Edit Cloudflare Workers» + «Account · D1 · Edit»,
   limitato a questo account, senza scadenza → secret `CLOUDFLARE_API_TOKEN`. Primo
   `deploy-test` verde con la matrice completa (`demo-forno`, `effeuno`); da una
   finestra pulita i tre indirizzi chiedono il codice via email e, dopo il login, le
   testate mostrano «per Effeuno» e «per Fornace Aurora». Nota: i workflow erano
   arrivati in `main` con YAML invalido, riparati prima di tutto (PR #141).
3. **Ambiente `production`** con «Required reviewers» = `zatteogit`. Primo
   `deploy-production` (sha di `main`, `edition = vulcan`) verde con approvazione;
   la produzione risponde 200 senza pagina Access.
4. **Workers Builds spento** («Disable builds» su vulcan-pizza-lab, repository ancora
   connesso): la produzione esce solo da `deploy-production`, ogni merge su `main`
   pubblica solo in test.

## 5. Cosa non fa (ancora)

- Tema, logo, lingue e testi legali per edizione: sono campi da aggiungere allo
  schema, quando un partner li chiede (B-1).
- Embed in iframe con `postMessage` e CSP per dominio (B-2): dopo un pilot firmato.
- Analytics per edizione (B-5): nessuna.
- Risolto da FW-15 (S18-A-05): l'onboarding nomina il forno proposto dall'edizione
  («Proposto da questa edizione: …») e dice che la marca non cambia i calcoli.
