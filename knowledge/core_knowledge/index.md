# Vulcan — Core Knowledge (Kipi)

> Ultimo aggiornamento: 2026-06-24 | Comando: `kipi update` | Stato globale: **completo (10/10 capitoli)**

Applicazione React/Vite per ricette pizza: motore parametrico (`pizza-engine`), flusso ricetta, CMS/i18n, stili e versioni, scoring e contenuti didattici. L'update 2026-06-24 registra l'allineamento delle pagine dello showcase del Design System con i veri componenti ds (Tier 4), l'integrazione di 10 nuovi topping premium (Wave 1 e Wave 2) in `topping-library.ts` a seguito dell'audit visivo delle immagini, e una profonda pulizia del dead code ed esportazioni inutilizzate in tutto il codebase.

## Metriche (da codice reale)

| Metrica | Valore | Fonte |
|--------|--------|--------|
| File `.ts`/`.tsx` in `src/` | **139** | `find src` |
| File app (escluso `components/ui/`) | **139** | stesso, escluso `ui/` (rimossa del tutto) |
| Capitoli KB | 10 | init + scan |
| File chiave mappati | **139** | `workflow-state.json` |
| Copertura documentazione | **100%** | 10 capitoli scan completo |
| Export pubblici in `pizza-engine.ts` | **56** | `rg '^export '` |
| Stili in `STYLES_DB` | **28** | `pizza-engine.ts` |
| Righe `pizza-engine.ts` | **4413** | `wc -l` |
| Righe `cms-context.tsx` | 3182 | `wc -l` |
| Dipendenze runtime | 9 | `package.json` |

## Capitoli

| ID | Titolo | Stato | File mappati | Priorità scan |
|----|--------|-------|--------------|---------------|
| [pizza-engine](./pizza-engine/README.md) | Motore pizza e ricetta | ✅ completato | 6 | — |
| [recipe-flow](./recipe-flow/README.md) | Flusso ricetta e UI | ✅ completato | 13 | — |
| [scoring-feedback](./scoring-feedback/README.md) | Score e feedback utente | ✅ completato | 5 | — |
| [styles-versions](./styles-versions/README.md) | Stili, versioni e override | ✅ completato | 11 | — |
| [cms-i18n](./cms-i18n/README.md) | CMS e localizzazione | ✅ completato | 17 | — |
| [routing-shell](./routing-shell/README.md) | Routing e shell app | ✅ completato | 8 | — |
| [pages-learn](./pages-learn/README.md) | Impara, glossario, troubleshooting | ✅ completato | 8 | — |
| [data-databases](./data-databases/README.md) | Database parametrici e dati | ✅ completato | 5 | — |
| [profile-user](./profile-user/README.md) | Profilo e vincoli utente | ✅ completato | 4 | — |
| [design-system](./design-system/README.md) | Design system e dev UI | ✅ completato | 29 | — |

## Stack (root)

- **Runtime**: React 18.2, React Router 7.13, Vite 6.3 (`package.json`, `vite.config.ts`)
- **Entry**: `src/main.tsx` → `src/app/App.tsx` → `src/app/routes.ts` → `AppShell`
- **Dev server**: porta 5174, alias `@` → `src/`
- **Dipendenze UI**: lo stack Radix/shadcn generato è stato potato; resta `@radix-ui/react-switch` più utilità `clsx`/`tailwind-merge`.

## Prossimo passo

KB completa — usare `kipi update` dopo modifiche al codice.

```bash
kipi update
```

Le modifiche al codice potrebbero aver reso obsoleta la documentazione. Esegui `kipi update` per riallineare i capitoli impattati.
