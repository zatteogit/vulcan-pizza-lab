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

> Aggiornamento del 28/10/2026: il D1 di test esiste già, l'`account_id` è in
> `wrangler.toml` e il segreto `CLOUDFLARE_ACCOUNT_ID` non serve più. L'elenco
> aggiornato è il §4 di `docs/ambienti-ed-edizioni.md`; i passi qui sotto restano
> come riferimento.

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

## Produzione con approvazione ed edizioni

Fatto il 28/10/2026 (D-053): il workflow `deploy-production` pubblica solo con la tua
approvazione e lo stesso sha già passato da `main`. Le edizioni dedicate hanno un
Worker di test ciascuna (`vulcan-<id>-test`). Passi una tantum e procedura in
`docs/ambienti-ed-edizioni.md`.
