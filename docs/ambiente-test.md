# Ambiente di test · vulcan-test (P-4)

Decisioni del 22/10/2026 (handoff §3.4): merge → test; approvazione → produzione
dello stesso commit. Accesso solo su invito (Cloudflare Access), `noindex`, D1 di
test con giurisdizione UE.

## Cosa c'è già nel repository

| Pezzo | Dove |
|---|---|
| Worker `vulcan-test`, asset, D1 separato | `wrangler.toml`, sezione `[env.test]` |
| `X-Robots-Tag: noindex, nofollow` su tutte le risposte | `worker/index.ts` (`DEPLOY_ENV = "test"`, `run_worker_first`) |
| Strumenti `/dev`, `/cms`, `/design-system` accesi solo in test | `npm run build:test` (`VITE_ENABLE_TOOLS=1`), `src/app/config/tools.ts` |
| Deploy automatico a ogni merge su `main` | `.github/workflows/deploy-test.yml` |
| Deploy manuale | `npm run deploy:test` |

Senza i segreti Cloudflare il workflow si ferma con un avviso e non fallisce.

## Passi una tantum sull'account Cloudflare (Matteo)

1. **D1 di test in UE**
   `npx wrangler d1 create vulcan-test --jurisdiction eu`
   Copia l'`database_id` restituito in `wrangler.toml` al posto di
   `SOSTITUIRE_CON_ID_D1_DI_TEST`, poi carica lo schema:
   `npx wrangler d1 execute vulcan-test --env test --remote --file=./schema.sql`
2. **Token per GitHub**: Cloudflare → My Profile → API Tokens → modello
   «Edit Cloudflare Workers», limitato all'account. In GitHub → Settings →
   Secrets and variables → Actions aggiungi `CLOUDFLARE_API_TOKEN` e
   `CLOUDFLARE_ACCOUNT_ID`.
3. **Primo deploy**: `npm run deploy:test` (oppure «Run workflow» su
   `deploy-test`). Il Worker risponde su `vulcan-test.<account>.workers.dev`.
4. **Accesso solo su invito**: Zero Trust → Access → Applications → Add →
   Self-hosted, dominio `vulcan-test.<account>.workers.dev`, policy «Allow» con
   gli indirizzi email invitati (One-time PIN). Controlla da una finestra in
   incognito che senza login non si veda nulla.
5. **Verifica**: `curl -sI https://vulcan-test.<account>.workers.dev/ | grep -i x-robots-tag`
   deve rispondere `noindex, nofollow` (dietro Access serve il cookie di sessione).

## Produzione con approvazione (passo successivo)

Oggi la produzione si pubblica da sola a ogni push su `main` (Workers Builds,
integrazione Git di Cloudflare). Per avere «approvazione → produzione dello
stesso commit»:

1. In GitHub → Settings → Environments crea `production` con «Required
   reviewers» (tu).
2. Aggiungi un workflow `deploy-production` con `workflow_dispatch`, input
   `sha`, `environment: production`, che fa checkout di quello `sha`, `npm ci`,
   `npm run build` e `npx wrangler deploy`.
3. Solo dopo, in Cloudflare → Workers → vulcan-pizza-lab → Settings → Builds,
   spegni il deploy automatico del ramo di produzione (le anteprime delle PR
   possono restare).

Il passo 3 cambia come esce la produzione: va fatto da te, quando test e
approvazione hanno girato almeno una volta.
