---
name: steward
description: Come portare una PR di Vulcan fino al merge — verifiche, motore puro, CMS a 7 lingue, cricchetto semantico, autorialità, lettura della CI e decisioni. Usala prima di aprire una PR, quando arriva un evento di CI o di revisione, e prima di proporre un merge.
---

# Steward di Vulcan

Le regole complete sono in `CLAUDE.md`. Il piano di lavoro corrente è in `docs/handoff-vulcan-2026-10-23.md`: fase 1 «sistemare» per intero, poi fase 2 B2B2C (decisione di Matteo del 23/10/2026). Qui c'è solo il percorso operativo di una PR.

## Prima di aprire la PR

1. Parti da `main` aggiornato, su un ramo dedicato.
2. Lancia `npm run verify`: typecheck, test Vitest e tutti i guard (token, semantica, CSS, tier del design system, i18n, architettura, codice morto). Se tocchi UI, media o configurazione di build, anche `npm run build`.
3. Motore (`src/app/domain/**`):
   - resta puro, senza React, DOM o CSS;
   - ogni correzione porta misure prima/dopo e test, come in `docs/motore-correzioni-2026-10-22.md`;
   - aggiorna quel documento o creane uno nuovo con data.
4. Testi:
   - ogni stringa nuova passa dal CMS e va in tutte e 7 le lingue (`cms-context.tsx` e `locales/`);
   - niente testo fisso nei componenti.
5. Cricchetto:
   - niente nuovi `style={…}` né `<div>`/`<span>` nudi;
   - una baseline (`scripts/semantics-baseline.json` e simili) si rigenera solo dopo aver ridotto davvero il debito, mai per far passare lavoro nuovo.
6. Dati nuovi (farine, forni, parametri, foto): fonte e licenza registrate.
7. Usa il modello `.github/pull_request_template.md`:
   - compila «Decisione umana» secondo `docs/autorialita.md`;
   - se manca un riscontro scritto di Matteo, scrivi «da confermare», non attribuire decisioni.

## Leggere la CI

| Check | Significato |
|---|---|
| `verify` | Fa fede: `npm ci`, `npm run verify`, `npm run build` su Node 20. Deve essere verde prima del merge. |
| `Workers Builds: vulcan-pizza-lab` | Build di Cloudflare. Sui rami delle PR usa la configurazione di produzione: non pubblicare dati o segreti di test passando da lì. |

Il merge in `main` pubblica il Worker di produzione. Si unisce solo con il via di Matteo e con `verify` verde.

## Cosa non fare

- Non rinominare il prodotto fuori da `src/app/config/brand.ts`. Gli identificatori tecnici `vulcan*` restano (vedi `docs/brand/nome-prodotto.md`).
- Non mettere nel repository prezzi, contatti o strategia commerciale: il repository è pubblico. Quella parte sta nel repository privato `basecamp`.
- Non promettere dosi esatte. Separa formule esatte, stime empiriche e ipotesi.
- Fuori perimetro anche su richiesta di un partner: checkout, pagamenti, spedizioni, assicurazioni, integrazioni hardware.
- Mai saltare, disattivare o mettere in quarantena un test.

## Decisioni

- Quando serve una decisione di Matteo, chiedila con domande a scelta, l'opzione consigliata per prima.
- Le decisioni aperte sono elencate nel §6 di `docs/handoff-vulcan-2026-10-23.md`.
- Annotazioni del debug overlay: segui la procedura «risolvi i commenti» di `CLAUDE.md`. Segna `resolved: true` con `updatedAt` nuovo; non svuotare il registro.
