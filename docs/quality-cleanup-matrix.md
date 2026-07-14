# Vulcan — matrice finale di pulizia user-facing

Data verifica: 2026-07-14. Riferimento qualitativo: NuTree `main` al commit
`a115b383bd2d6dbd909f8dad33382b0453ea3df6`. Il riferimento è stato usato per
criteri, guard e struttura dei tier; le implementazioni restano specifiche di
Vulcan.

## Scope

Inclusi: tutte le route prodotto, il Design System showcase, componenti T4,
pattern T5, template T6, domain/data/use-case raggiungibili dal prodotto,
bootstrap, brand asset e QA della build production.

Esclusi per mandato: `/dev`, `/cms` e tooling interno, salvo dipendenze o file
necessari a build e guard. Le modifiche utente già presenti e gli artefatti
Playwright preesistenti non sono stati cancellati.

## Debito prima/dopo

| Classe | Prima | Dopo | Enforcement/evidenza |
|---|---:|---:|---|
| Finding strict Design System complessivi | 2.092 | 0 | `npm run ds:check` |
| Stili JSX showcase da migrare | 1.210 | 0 | CSS showcase content-addressed |
| Literal Motion complessivi | 502 | 0 | scanner motion; 302 erano nel runtime prodotto |
| Raw token in override completi | 135 | 0 | audit token T1–T3 e dark override |
| Literal visuali in CSS consumer | 95 | 0 | scanner CSS/theme, incluso CSS generato |
| Violazioni di confine token | 39 | 0 | grafo tier T1–T6 |
| CSS generato orfano | 18 | 0 | hash, parità reference/regole e pruning |
| Token irrisolti | 17 | 0 | risoluzione dichiarazioni/consumi |
| T1 bypass nel runtime | 5 | 0 | scanner consumo per tier |
| Bootstrap inline/raw | 6 | 0 | `index.html` incluso nel guard |
| Controlli generici fuori da T4 | 110 | 0 | native-control guard |
| Componenti T4 mancanti nello showcase | 10 | 0 | 25/25 importati e renderizzati |
| Moduli showcase morti | 5 | 0 | import graph/dead-code guard |
| Stringhe user-facing prodotto | ~235 | 0 | i18n guard sul grafo montato |
| Occorrenze copy showcase migrate | 2.695 | 0 | catalogo showcase lazy |
| Chiavi i18n mancanti/orfane | n/a | 0 | 359 prodotto + 2.410 showcase (2.769 totali) |
| Violazioni architetturali domain/data | 11 | 0 | architecture guard transitive AST |
| Diagnostiche TypeScript unused | 21 | 0 | `noUnused*` + dead-code guard |
| Dead code rilevato | 21 | 0 | import graph + TypeScript unused |
| Moduli/file/asset duplicati o backup | 0 | 0 | dead-code guard su `src` e `public` |
| Violazioni semantiche | 28 | 0 | semantic guard su 97 TSX e 10 route |
| Inline style/presentation/bare wrapper legacy | 6 / 1 / 0 | 0 / 0 / 0 | semantics ratchet a zero |
| Dimensioni CSS hard-written legacy | 13 | 0 | CSS token guard a zero |
| Scenari falliti nel primo report visuale integrato | 13 | 0 | 55/55 combinazioni verdi |
| Elementi Axe senza accessible name | 14 | 0 | Axe + fixture/keyboard contract |
| Label/form association Axe | 9 | 0 | Axe |
| Regioni scrollabili non raggiungibili | 7 | 0 | Axe |
| Touch target sotto soglia | 37 | 0 | scanner geometrico; allowlist finale vuota |
| Controlli interattivi fuori viewport | 2 | 0 | scanner geometrico/overflow |
| Animazioni infinite in reduced motion | 17 | 0 | runtime animation audit |
| Test applicativi unici | 31 | 44 verdi | 8 file Vitest, worktree esclusi |
| Vulnerabilità npm | 6 | 0 | `npm audit --audit-level=low` |

## Inventario Design System finale

| Tier | Quantità verificata | Contratto |
|---|---:|---|
| T1 primitive/globali | 446 | unico owner dei valori visuali raw |
| T2 semantici | 197 | alias di ruolo verso T1/T2 |
| T2.5 dominio/dataviz | 14 | ruoli specializzati, stessa direzione T2 |
| T3 componente/composite | 196 | contratti consumati da T4 |
| T4 componenti | 25/25 | importati e realmente montati nello showcase |
| T5 pattern | 6 categorie showcase | compongono T4 e conoscono il dominio |
| T6 template | 2 template showcase | shell/slot espliciti; tier documentato |

Le custom property inline rimaste sono esclusivamente bridge dinamici
strutturalmente riconosciuti; non contengono presentazione statica. Gli alias
framework isolati sono file-exact e protetti da fixture. Non esistono baseline
numeriche o esenzioni di directory user-facing.

## Architettura engine

Il guard attraversa 21 file domain/data/use-case, 23 moduli locali raggiungibili
e 138 import/export edge. Domain, data e use case non dipendono da React,
presentation o runtime browser.

In particolare:

- persistenza ricette e feedback vive in adapter browser iniettabili;
- calibrazione, aggregazione, correzioni feedback e applicazione versioni stile
  sono use case puri coperti da test;
- metadata stabili vivono nel domain, mentre label e spiegazioni sono risolte
  dalla presentation/catalogo;
- il facade feedback conserva la compatibilità dei call site senza riassorbire
  storage o copy nel core.

## QA accessibilità e visuale

Matrice production prevista dal gate: 10 route, 3 breakpoint (390, 768, 1440),
light/dark e `prefers-reduced-motion`, per 55 combinazioni non ridondanti.

Copertura automatica:

- Axe WCAG 2 A/AA, 2.1 A/AA e 2.2 AA;
- contrasto, naming, label, target size, focus, tastiera e stati;
- overflow pagina e controlli fuori viewport;
- tema applicato, console/page error e leak di chiavi i18n;
- assenza di animazioni infinite con reduced motion;
- dialog/sheet: autofocus, focus trap, Escape e ripristino trigger;
- SearchOverlay: shortcut, inert background, combobox/listbox e active descendant;
- Select e SegmentedControl reali: keyboard selection e roving tabindex;
- screenshot di ogni route/scenario e di ogni sezione DS in light mobile e dark
  desktop.

Esito finale: 55/55 combinazioni verdi, 0 failure, 0 target sotto soglia o in
allowlist e 163 screenshot. Il report production è
`output/playwright/visual-check/report.json`. La revisione manuale ha incluso
home mobile, recipe dark desktop, explore tablet, profile dark mobile, lo
showcase generale e i crop completi di componenti, pattern e template sugli
assi light/mobile e dark/desktop; non sono rimasti overflow, clipping, wrapping
o frame motion intermedi negli artefatti finali.

## Eccezioni e confini residui

Debito user-facing residuo: nessuno accettato.

Advisory non bloccante: Vite segnala il chunk principale a 807,05 kB contro la
soglia informativa di 800 kB. Build e lazy route chunking restano corretti; non è
stata alzata la soglia né nascosto il warning. È un tema di performance/bundle
budget separato dalla pulizia user-facing richiesta.

Non sono debito:

- bridge custom-property con valore esclusivamente runtime, validati per forma;
- gli alias Tailwind bianco/nero nell'isolato `@theme inline`, esatti e coperti
  da fixture;
- copy canonico e dati editoriali del dominio, quando non costituiscono chrome
  UI e sono localizzati tramite i contratti CMS esistenti;
- `/dev`, `/cms` e tooling interno, esclusi dallo scope esplicito del mandato.

## Comandi finali

```bash
npm run quality:check
npm run build
npm run visual:check
npm run quality:full
npm audit --audit-level=low
git diff --check
```
