# Registro del contributo umano

Stato: bozza da completare. Rilievo d'origine: audit AUT-1 (ottobre 2026).
Questo documento raccoglie le evidenze su chi ha deciso cosa nel progetto.
Il quadro normativo (L. 132/2025, secondo il dossier dell'audit) richiede un
parere legale: qui si registrano fatti, non conclusioni giuridiche.

## 1. Scopo e limiti

- Si registrano solo decisioni con un'evidenza verificabile: commit, PR,
  documento, annotazione.
- Nessuna decisione è attribuita a una persona senza conferma. Il campo
  **Decisore** resta «da confermare» finché Matteo non lo conferma, voce per
  voce.
- L'autore git non prova da solo un lavoro umano: gli agenti AI committano
  anche con l'identità del proprietario. Il ruolo AI si deduce dai trailer
  (`Co-Authored-By`, link di sessione) e dall'autore del commit.
- Il clone locale è shallow (60 commit visibili, dal 05/07/2026 al
  14/07/2026 alla data di questo documento): la cronologia completa va
  esportata da GitHub.

## 2. Perimetro dell'opera

| Area | Dove sta | Evidenze principali |
|---|---|---|
| Specifiche e UX | `docs/piano-interventi.md`, `docs/review-2026-06-21.md`, `guidelines/Guidelines.md` §1 | piano P0–P4; review think-aloud R1–R33; «Identità e visione» |
| Scelte di dominio del motore | `src/app/domain/pizza-engine.ts` | 38 riferimenti «Audit …» nei commenti, con le motivazioni |
| Modello dati | `PizzaStyle` (`src/app/domain/pizza-engine.ts:174`), `DoughParameters` (`:52`), `UserConstraints` (`:268`), `Interpretation` (`src/app/data/interpretation-library.ts:41`), `FlourEntry` (`src/app/data/flour-database.ts:6`) | — |
| Design system | `docs/design-system-tiers.md`, `docs/vulcan-theme-v7-implementation-report.md`, `src/styles/theme.css` | contratto dei tier; «Decisione di design» e regole non negoziabili V7 |
| Catalogo e contenuti | `docs/catalogo-pizze.md`, CMS in `src/app/features/cms/` | — |
| Marchio e nome | `src/app/components/shared/vulcan-logo.tsx`, `docs/brand/` | vedi `docs/brand/nome-prodotto.md` |

## 3. Registro delle decisioni

Ruolo AI: «trailer» se il commit ha un trailer AI, «autore» se il commit è
firmato da un agente, «nessun segno» se non c'è traccia (non prova l'assenza).

| ID | Data | Area | Decisione | Alternative scartate | Evidenza | Decisore | Ruolo AI |
|---|---|---|---|---|---|---|---|
| D-001 | 2026-07-08 | Marchio | Rifinitura di logo e favicon | — | commit `c8a9e5c` | da confermare | nessun segno |
| D-002 | 2026-07-09 | Temi | Rimossi i temi sperimentali Editoriale, Classica, Minimal | i temi rimossi, recuperabili dalla storia | commit `740d04e`; `src/styles/theme.css` («bocciate e rimosse») | da confermare | nessun segno |
| D-003 | 2026-07-10 | Temi | Sfornata non diventa il tema di default | Sfornata come default (commit `0925e48`, con trailer AI) | revert `413dd41`; PR #41 e #42 | da confermare | revert: nessun segno |
| D-004 | 2026-07-08 | Design system | Decisioni dell'ondata 6 dei token (scrim-modal, switch drift, elevation-confirm) | da ricostruire | commit `bd62e14`; `docs/design-system-tiers.md` | da confermare | trailer |
| D-005 | 2026-06-21 | UX | Osservazioni della review think-aloud mappate sul piano | — | `docs/review-2026-06-21.md` («l'utente dice») | da confermare | da verificare |
| D-006 | — | Design system | Direzione «Editorial FireGlow» e regole non negoziabili V7 | direzioni dei mockup precedenti | `docs/vulcan-theme-v7-implementation-report.md` §1 | da confermare | da verificare |
| D-007 | 2026-07-04 → 2026-07-11 | UX | Correzioni chieste con le annotazioni del debug overlay | — | `vulcan-debug-registry.json` (52 voci locali, 51 risolte); commit `8876a83`, `7884d3b`, `573f5f4` | da confermare | da verificare |
| D-008 | 2026-10 | Prodotto | Nome del prodotto in un solo punto; il nuovo nome non è ancora scelto | nome scritto in ogni file | PR di questo ramo; `docs/brand/nome-prodotto.md` | da confermare | autore delle modifiche: agente AI |
| D-009 | 2026-10 | Sicurezza | Annotazioni, tema globale e debug spenti in produzione; `frame-ancestors 'self'` | API protette da segreto; nessun vincolo | PR di questo ramo; `worker/index.ts`, `public/_headers` | da confermare | autore delle modifiche: agente AI |
| D-010 | 2026-10-23 | Motore | «Nessuna preferenza» non è una scadenza (`meal_deadline`) | trattare anche «Nessuna preferenza» come scadenza | risposta a scelta nella sessione dell'agente del 23/10; `docs/motore-correzioni-2026-10-22.md` | Matteo | domanda e modifiche: agente AI |
| D-011 | 2026-10-23 | Motore | Slot del pasto al quarto d'ora per difetto | ore intere per difetto; `Math.round` | come D-010 | Matteo | domanda e modifiche: agente AI |
| D-012 | 2026-10-23 | Motore | Consigli allineati all'esito della ricetta sul forno (soglia termica unica) | forno freddo come solo avviso; lasciare l'incoerenza | come D-010 | Matteo | domanda e modifiche: agente AI |
| D-013 | 2026-10-23 | Contenuti | Il range di temperatura della Pinsa va verificato su fonti (C-4) prima di cambiarlo | range attuale corretto | come D-010 | Matteo | domanda: agente AI |
| D-014 | 2026-10-24 | Prodotto | Ordine di lavoro: I18N-1 prima di U-1 e U-2 | U-1/U-2 prima | messaggio di Matteo nella sessione dell'agente del 24/10 | Matteo | proposta e modifiche: agente AI |
| D-015 | 2026-10-24 | Contenuti | Pinsa romana sui valori con fonte: forno 280–320 °C (ideale 300), idratazione 72–80%, sale 1,8%, olio 1,3%, panetto 240 g, 34 × 21 cm | tenere 350–420 °C senza fonte | risposta a scelta nella sessione dell'agente del 24/10; `docs/fonti-dati.md` §1.2 | Matteo | ricerca fonti, proposta e modifiche: agente AI |
| D-016 | 2026-10-24 | Contenuti | Napoletana: lo stile segue la STG (reg. UE 97/2010: 6–14 h, panetto 250 g); il disciplinare AVPN 2024 è la versione «Disciplinare AVPN» (12–24 h, 280 g) | stile su AVPN; range di compromesso 8–24 h | come D-015; `docs/fonti-dati.md` §1.1 | Matteo | come D-015 |
| D-017 | 2026-10-24 | Contenuti | Focaccia di Recco sui valori del disciplinare IGP: forno 270–320 °C (ideale 300), cottura 4–8 min | tenere 300–340 °C e 8–10 min | come D-015; `docs/fonti-dati.md` §1.3 | Matteo | come D-015 |
| D-018 | 2026-10-24 | Contenuti | Olio di frittura (pizza fritta e montanara): 175–190 °C, ideale 175 (AVPN 2024) | 180–190, ideale 185 | come D-015; `docs/fonti-dati.md` §1.4 | Matteo | come D-015 |

D-008 e D-009 arrivano dal brief del lavoro come decisioni del proprietario;
nel repository non c'è ancora un riscontro scritto, quindi restano da
confermare come le altre.

## 4. Materiali generati con AI

- Immagini: `docs/IMAGES_AUDIT.md` le descrive con prompt per generatori
  (Midjourney v6 o DALL-E 3). Quali immagini del catalogo vengano da lì è da
  verificare file per file.
- Codice e documenti: 25 dei 60 commit visibili hanno un segno AI (trailer o
  autore). Gli altri non provano un lavoro solo umano.
- Testi di ricerca e audit di ruolo («Audit …» nel motore): potrebbero venire
  da sessioni AI. Ipotesi da verificare, non dedurre.

## 5. Fonti esterne e licenze

- Base Notion del progetto: `docs/confronto-notion-vs-codebase.md`.
- Disciplinari e letteratura citati nei commenti del motore (per esempio STG
  AVPN 2024): elenco da completare con link e licenza.
- Foto Unsplash dello showcase e crediti: `ATTRIBUTIONS.md`.

## 6. Indice delle evidenze

Comandi per rigenerare i numeri di questo documento:

```bash
git rev-parse --is-shallow-repository             # true = storia incompleta
git log --format="%h|%an|%ad|%s" --date=short     # cronologia visibile
git log --format="%h %an" | awk '{print $2,$3}' | sort | uniq -c   # autori
git log --format="%B" | grep -ciE "co-authored-by:.*(claude|anthropic|codex|openai|gemini|copilot)|claude.ai/code|generated with"
git log --format="%h|%ad|%s" --date=short | grep -iE "revert|prune|decisio"
grep -c "Audit" src/app/domain/pizza-engine.ts
```

Per la cronologia completa: clonare senza `--depth` oppure esportare da
GitHub PR, review e merge.

## 7. Manutenzione

- Ogni PR compila la sezione «Decisione umana» del template
  (`.github/pull_request_template.md`): cosa, alternative scartate, link.
- Facoltativo: trailer `Decision: D-0xx` nel commit che applica una decisione.
- Revisione mensile di circa 15 minuti: nuove voci dal template delle PR e
  conferma del campo «Decisore» da parte di Matteo.
- Uno script che rigeneri l'indice non è previsto in questa fase.
