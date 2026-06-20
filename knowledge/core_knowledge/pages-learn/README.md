# Impara, glossario, troubleshooting
> Aggiornamento: 2026-06-19 | Stato: ✅ | File documentati: 8

## Sommario

Area **didattica** dell’app (tab Impara): hub `/learn` con hero CMS, percorso consigliato in base alla skill, link a glossario tecnico, guida troubleshooting (18 problemi) e guida pre-fermenti (biga, poolish, autolisi). I contenuti strutturali sono **database TypeScript** in italiano; le stringhe user-facing sono **sovrascrivibili via CMS** (`glossaryTerms`, `troubleshootingI18n`, `preFerment`, `misc`).

Il pannello `TroubleshootingPanel` è riusato anche nel **flusso ricetta** (`ContextualWarnings`) con regole parametriche su idratazione, W, P/L, fermentazione.

## File chiave

| File | Righe (circa) | Ruolo |
|------|----------------|--------|
| `src/app/pages/learn.tsx` | 573 | Hub Impara: hero editoriale, percorso skill-aware, risorse e 3 card verso sotto-route con passaggio del parametro `?style=` |
| `src/app/pages/glossary.tsx` | 809 | UI glossario: ricerca, categorie, espansione, deeplink hash |
| `src/app/components/glossary-data.ts` | 482 | `GLOSSARY_TERMS` (32 termini), 6 categorie, getter i18n |
| `src/app/pages/troubleshooting.tsx` | 63 | Pagina full-page con header sticky + `TroubleshootingGuide` |
| `src/app/components/troubleshooting-data.ts` | 347 | `ISSUES_DB` (18 issue), `getContextualWarnings` |
| `src/app/components/troubleshooting-panel.tsx` | 469 | `ContextualWarnings` + `TroubleshootingGuide` espandibile |
| `src/app/pages/pre-ferments.tsx` | 388 | Pagina guida pre-fermenti + tabella confronto CMS |
| `src/app/components/pre-ferment-guide.tsx` | 451 | `PRE_FERMENT_DB`, `PreFermentCard`, uso in `recipe-output` quando PizzaNerd + pre-fermento |

**Integrazione search**: `search-overlay.tsx` indicizza termini glossario, issue e guide pre-fermenti con link diretti.

## Flusso dati

```mermaid
flowchart TD
  LEARN[/learn LearnPage] --> G[/learn/glossary]
  LEARN --> T[/learn/troubleshooting]
  LEARN --> PF[/learn/pre-ferments]
  CMS[useCms] --> G
  CMS --> T
  CMS --> PF
  GD[glossary-data.ts] -->|getLocalizedTerm| G
  TD[troubleshooting-data.ts] -->|getLocalizedIssue| T
  TD -->|getContextualWarnings| PANEL[troubleshooting-panel]
  PANEL --> RECIPE[recipe-output / score flow]
  PFG[pre-ferment-guide] -->|cms.preFerment| PF
  PFG --> RECIPE
```

**Glossario — layering i18n**:
1. Struttura IT: `GLOSSARY_TERMS` + `GLOSSARY_CATEGORIES`.
2. Label pagina: `cms.glossary.*` (titolo, placeholder, nomi categorie).
3. Contenuto termine: `cms.glossaryTerms.terms[id]` via `getLocalizedTerm`.

**Troubleshooting — layering i18n**:
1. `ISSUES_DB` (sintomo, causa, test, fix, prevention, severity).
2. `getLocalizedIssue` ← `cms.troubleshootingI18n.issues[id]`.
3. Avvisi contestuali: regole su parametri ricetta + template `cms.troubleshootingI18n.contextual.*` con `t()` da `i18n.ts`.

**Pre-fermenti**:
- Pagina statica ordina `biga`, `poolish`, `autolisi` da `PRE_FERMENT_DB`.
- Card in ricetta usa `useCms().preFerment` (default da `domain-i18n-defaults.ts` in CMS).

## Funzioni principali

| Funzione | File | Scopo |
|----------|------|--------|
| `getTermsByCategory(cms?)` | glossary-data | Raggruppa termini localizzati per categoria |
| `getTermById(id, cms?)` | glossary-data | Lookup + `getLocalizedTerm` |
| `getLocalizedTerm` | glossary-data | Overlay CMS su termine |
| `getLocalizedIssue` | troubleshooting-data | Overlay CMS su issue |
| `getContextualWarnings(params, cms?)` | troubleshooting-data | Regole P01, P02, P06, … da parametri ricetta |
| `ContextualWarnings` | troubleshooting-panel | UI compatta in recipe (max 2 + expand) |
| `TroubleshootingGuide` | troubleshooting-panel | Lista completa per pagina `/learn/troubleshooting` |
| `PreFermentCard` | pre-ferment-guide | Card educativa nerd mode in output ricetta |

**Deeplink glossario**: hash `#w_alveograph` su `/learn/glossary` → `getTermById` → scroll a `#glossary-{id}`.

## Costanti e configurazione

| Dataset | Conteggio | Categorie |
|---------|-----------|-----------|
| `GLOSSARY_TERMS` | 32 termini | `rheology`, `fermentation`, `thermal`, `chemistry`, `mechanics`, `scoring` |
| `ISSUES_DB` | 18 problemi (`P01`–`P20` con alcuni ID non contigui) | `dough`, `fermentation`, `shaping`, `baking`, `solver`, `false_positive` |
| `PRE_FERMENT_DB` | 3 voci | `poolish`, `biga`, `autolisi` |
| `COMPARISON_ROWS` | tabella confronto | Usata in `pre-ferments.tsx` |

**Regole contestuali** (esempi in `getContextualWarnings`):
- **Idratazione critica skill-aware (P01)**: allerta se l'idratazione supera la soglia legata all'esperienza dell'utente:
  - Skill 1 (Principiante): soglia `>70%` (messaggio: "è impegnativa per principianti")
  - Skill 2 (Intermedio): soglia `>85%` (messaggio: "è estrema, richiede pratica")
  - Skill 3/4 (Esperto/Pro): non scatta mai (l'utente sa gestire alta idratazione)
- `hydration > 72` e `flourW < 280` → warning P01 (impasto appiccicoso - generico)
- `flourPL > 0.75` → info P02 (tenacia)
- `fermentHours > 36` e `fermentTemp > 18` → warning P06 (acidità)

**CMS keys Impara** (`cms.pages` + `cms.misc`): `learnTitle`, `learnSubtitle`, `learnGlossary`, `learnTroubleshooting`, `learnPreFerments`, descrizioni correlate, `learnHeroTitle1`, `learnHeroTitle2`, `learnHeroSubtitle`, `learnResources`, `navLearn`.

## Guard rail e vincoli

- **ID stabili** (`w_alveograph`, `P01`, …) non vanno tradotti; solo campi testuali nei bundle CMS.
- Glossario in ricerca filtra su `name`, `definition`, `symbol`, `id` — non su testo localizzato se diverso dall’ID.
- `ContextualWarnings` ritorna `null` se nessuna regola scatta — niente placeholder vuoti.
- **Pulizia pre-fermenti (Sprint 12)**: Rimosso il prop e parametro inutilizzato `compact` da `PreFermentCard` per aderenza rigorosa a `--noUnusedLocals`.
- **Audit Accenti Italiani**: Corrette tutte le occorrenze UI non accentate in italiano (es. `perche` $\rightarrow$ `perché`) all'interno di `pre-ferment-guide.tsx` e `pre-ferments.tsx`.
- Pagina pre-fermenti non usa `useCms` direttamente nella page shell; i testi card passano da `PreFermentCard` + CMS.
- **Passaggio di Contesto tramite Query Param**: `learn.tsx` supporta il parametro di query `?style=` e lo propaga dinamicamente ai link delle sotto-sezioni (glossario, troubleshooting, pre-fermenti) per guidare l'utente verso contenuti adatti allo stile selezionato.
- **Percorso skill-aware**: `learn.tsx` legge `vulcan_skill_level` e costruisce un percorso consigliato con label del livello (`SKILL_LEVELS`) e link localizzati verso glossario, troubleshooting o pre-fermenti.
- **Pulizia dead code 2026-06-19:** `glossary-link.tsx` è stato rimosso; i deeplink e l'esperienza glossario passano dalla pagina `/learn/glossary` e dalla command palette.

## Bug noti e fix

| Nota | Dettaglio |
|------|-----------|
| Commento VPL-062 su `learn.tsx` | Dice "placeholder" ma l’hub è funzionale con 3 sezioni |
| Redirect legacy | `/glossary` e `/troubleshooting` root → sotto `/learn/*` (in `routes.ts`) |
| Typo storico in `pre-ferment-guide` poolish tip | "Se collassa e ancora" vs "è ancora" nel fallback IT — verificare in CMS/domain defaults |
