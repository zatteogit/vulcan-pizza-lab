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
| **Anteprima PR** | Workers Builds di Cloudflare sulle PR | a ogni push su una PR | chi ha il link |
| **Test** | `vulcan-test` (generalista con strumenti `/dev`, `/cms`, `/design-system` e D1 di test UE) e `vulcan-<id>-test` per ogni edizione (senza strumenti né D1) | automatico a ogni merge su `main` (`deploy-test.yml`) | solo su invito (Cloudflare Access), `noindex` |
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

## 4. Passi una tantum (Matteo)

Ciò che è nel repository è pronto. Restano le impostazioni sugli account, che solo tu
puoi fare:

1. **Repository privato** `zatteogit/vulcan-editions`. Da questa sessione GitHub non
   permette di crearlo. Crealo privato e carica il contenuto di `.editions-private/`
   (`README.md` ed `editions/effeuno.json`).
2. **Token per leggerlo dalla CI**: un fine-grained token con «Contents: Read-only»
   solo su `vulcan-editions`. Salvalo in `vulcan-pizza-lab` → Settings → Secrets → Actions
   come `VULCAN_EDITIONS_TOKEN`.
3. **Cloudflare**: i passi 1–3 di `docs/ambiente-test.md` (D1 di test UE, segreti
   `CLOUDFLARE_API_TOKEN` e `CLOUDFLARE_ACCOUNT_ID`, primo deploy).
4. **Accesso su invito**: in Cloudflare Zero Trust → Access, un'applicazione
   Self-hosted per ogni Worker di test, ciascuna con la sua policy:
   - `vulcan-test`: tu e i tester;
   - `vulcan-demo-forno-test`: tu e chi deve vedere la demo;
   - `vulcan-effeuno-test`: tu e le email di Effeuno.
5. **Produzione con approvazione**:
   - In GitHub → Settings → Environments crea `production` con «Required reviewers»
     (tu) e aggiungi ai suoi segreti `CLOUDFLARE_API_TOKEN` e `CLOUDFLARE_ACCOUNT_ID`,
     oppure lasciali a livello di repository.
   - Fai girare `deploy-production` una volta con lo sha di `main` e `edition = vulcan`.
   - Poi, in Cloudflare → Workers → vulcan-pizza-lab → Settings → Builds, spegni il
     deploy automatico del ramo di produzione. Le anteprime delle PR possono restare.
     Finché non lo spegni, la produzione esce ancora da sola a ogni merge.

## 5. Cosa non fa (ancora)

- Tema, logo, lingue e testi legali per edizione: sono campi da aggiungere allo
  schema, quando un partner li chiede (B-1).
- Embed in iframe con `postMessage` e CSP per dominio (B-2): dopo un pilot firmato.
- Analytics per edizione (B-5): nessuna.
- In un'edizione l'onboarding del profilo propone il tipo di forno preimpostato, ma il
  testo resta quello generico: non dice ancora «il tuo forno <partner>».
