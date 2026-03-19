# Confronto Notion vs Codebase — Vulcan Pizza Lab

> Data analisi: 16 marzo 2026
> Notion: ultimo aggiornamento 10-11 febbraio 2026 -> **AGGIORNATO 16 marzo 2026 (Fase A+B completate)**
> Codebase: aggiornato al 16 marzo 2026 (54 issue chiuse, Fase B completata)

---

## Sommario Esecutivo

Il workspace Notion contiene la **knowledge base teorico-scientifica** del Progetto Vulcan, scritta prima dell'implementazione. Il codebase su Figma Make e il repo GitHub contengono l'**implementazione reale** come SPA React. Ci sono **divergenze significative** dovute all'evoluzione del progetto durante lo sviluppo.

### Stato sincronia: DIVERGENTE

| Area                 | Notion                                             | Codebase                                    | Stato                     |
| -------------------- | -------------------------------------------------- | ------------------------------------------- | ------------------------- |
| Stack tecnologico    | Python + FastAPI + PostgreSQL + Pydantic           | React + TypeScript + Vite (SPA client-only) | DIVERGENTE                |
| Design System        | M3 Expressive "Atelier Stone" (#9A3412 Rust)       | "Cucina Editoriale" (#D04A2F Terracotta)    | EVOLUTO                   |
| Stili pizza          | 6-9 stili + teoria 3 assi                          | 15 stili implementati, 4 famiglie           | CODEBASE AVANTI           |
| Tassonomia           | Modello 3 assi (Gerarchia + Tag + Deviation)       | Flat con 4 famiglie + recommendation engine | NOTION PIU RICCO (teoria) |
| Scoring              | A-Score + F-Score + D-Score (3 assi)               | 5 assi (+ sustainability + experimentation) | CODEBASE AVANTI           |
| CMS / i18n           | Non previsto                                       | 7 lingue, 12 sezioni, ~225+ campi           | SOLO CODEBASE             |
| Style Editor         | Non previsto                                       | 3622 righe con LiveSync                     | SOLO CODEBASE             |
| Sync system          | Non previsto                                       | SyncTab + CLI sync.mjs                      | SOLO CODEBASE             |
| Database parametrici | 10+ database Notion (Farine, Lieviti, Forni, ecc.) | Hardcoded in pizza-engine.ts                | NOTION PIU RICCO (dati)   |

---

## 1. Stack Tecnologico

### Notion (piano originale)

```
Backend:  Python 3.11+ / FastAPI / Pydantic v2
Database: PostgreSQL 15+ (Supabase free tier)
Frontend: React 18 + Material UI v5
AI:       Claude API + ChromaDB (RAG)
Testing:  pytest + coverage + mypy + flake8
CI/CD:    GitHub Actions
```

### Codebase (implementazione reale)

```
Frontend: React 18.3.1 + Tailwind CSS v4 (NO Material UI)
Routing:  React Router 7.13.0 (Data mode)
Anim:     Motion 12.23.24 (motion/react)
Icons:    Lucide React (NON Material Symbols)
Charts:   Recharts 2.15.2
Build:    Vite 6.3.5 + TypeScript 5.7.3
Backend:  NESSUNO (SPA statica pura, API client-side)
Database: NESSUNO (localStorage per persistenza)
```

### Gap

- **Nessun backend** implementato — tutto il motore scientifico gira lato client in TypeScript
- **Nessun database relazionale** — i 15 stili e i parametri sono hardcoded in `STYLES_DB`
- **Nessuna autenticazione** — non ci sono utenti
- **Material UI mai usato** — sostituito da design system custom con Tailwind CSS v4
- **Material Symbols mai usato** — sostituito da Lucide React

### Raccomandazione

Aggiornare Notion sezione "Roadmap" e "AI-Assisted Development Framework" per riflettere lo stack reale. Il piano Python/FastAPI/PostgreSQL resta valido per una Fase 2 (backend), ma la Fase 1 (frontend MVP) e stata implementata in modo diverso.

---

## 2. Design System

### Notion: "M3 Expressive — Atelier Stone"

| Ruolo        | Valore Notion        | Valore Codebase      | Delta   |
| ------------ | -------------------- | -------------------- | ------- |
| Primary      | `#9A3412` Rust       | `#D04A2F` Terracotta | DIVERSO |
| Secondary    | `#6D5E0F` Olive      | `#857568` Mocha      | DIVERSO |
| Tertiary     | `#3F6637` Forest     | `#CC8844` Ambra      | DIVERSO |
| Surface      | `#FFFBF5` Warm cream | `#FDFBF7` Parchment  | SIMILE  |
| Dark Surface | `#1A1613` Deep brown | `#131211` Night      | SIMILE  |

### Notion dice

- 12 Fondamenta, 22 Componenti, 8 Pattern, 3 Template
- Material Symbols Outlined (98+ icone)
- Expressive Shapes (10 forme organiche)
- WCAG AAA compliance

### Codebase reale

- 8 Fondazioni + 8 Componenti + 8 Pattern (20 file DS)
- Lucide React icons
- Token CSS 3-tier (1347 righe in theme.css)
- Custom utility classes (type-data, type-label, surface-card, ecc.)
- DoughBlob + FireGlow + VulcanMark (componenti brand unici)

### Gap

- I colori sono evoluti significativamente — la palette "Atelier Stone" (Rust/Olive/Forest) e diventata "Cucina Editoriale" (Terracotta/Mocha/Ambra)
- L'architettura token e passata da M3 standard a un sistema custom 3-tier
- Notion menziona "WCAG AAA" ma il codebase implementa WCAG AA con `prefers-reduced-motion`, `aria-label`, skip-to-content
- Notion non menziona: glassmorphism, time-of-day palette, gradienti brand (ember/sage/warm)

### Raccomandazione

Aggiornare pagina "13 - Design System" su Notion con:

- Nuova palette con hex corretti
- Architettura token 3-tier
- Componenti brand (DoughBlob, FireGlow, VulcanMark)
- Pattern editoriali (StepHeader, UnifiedChip, ScrollSection)

---

## 3. Tassonomia Pizza — Stili e Famiglie

### Notion: modello teorico molto ricco

**Modello a 3 assi:**

1. Gerarchia canonica: FAMILY -> STYLE -> VARIANT -> VERSION -> IMPL
2. Tag multi-dimensionali: 11 dimensioni (geografia, filosofia, tecnica, idratazione, cottura, texture, dieta, skill, autore, community, equipment)
3. Deviation Signatures: score 0.0-1.0 per sperimentalita

**Famiglie Notion:** Napoletana, Romana, Americana, Contemporanea + "Regionale Italiana", "Internazionale", "Sperimentale"

**Stili nel Database Notion:** schema con 30+ proprieta (Thickness Factor, Alveolatura, Stesura, Cornicione, A-Score Base, Adattamento, ecc.)

### Codebase: implementazione semplificata ma funzionale

**Modello flat** con 4 famiglie: napoletana, romana, americana, contemporanea

**15 stili implementati:**

- napoletana_stg, napoletana_canotto
- teglia_romana, tonda_romana, pinsa_romana, pala_romana
- new_york, detroit, chicago_deep, grandma_style
- bonci_teglia, focaccia_genovese, sfincione, focaccia_recco, padellino_torino

### Presenti in Notion ma NON nel codebase

- New Haven Apizza (stile americano, forno a carbone)
- Napoletana Fritta / Montanara
- Thickness Factor (g/cm2) — concetto teorico non implementato
- Deviation Signatures — intero sistema non implementato
- Tag multi-dimensionali — non implementati (solo 4 famiglie)
- Famiglie "Regionale Italiana" e "Internazionale"

### Presenti nel codebase ma NON in Notion

- Pala Romana (stile aggiunto durante sviluppo)
- Grandma Style (stile americano aggiunto)
- Focaccia Genovese, Sfincione Palermitano, Focaccia di Recco (contemporanea)
- Pizza al Padellino Torino
- Metodo Bonci (separato da Teglia Romana)
- P/L alveografico completo come parametro dello stile
- Compensazioni forno (Arrhenius-like, logaritmiche)
- Q10 variabile per tipo lievito

### Differenze parametriche chiave

| Parametro        | Notion (feb 2026) | Codebase (mar 2026) | Note                            |
| ---------------- | ----------------- | ------------------- | ------------------------------- |
| STG W range      | 220-280           | 250-320             | Codebase aggiornato a AVPN 2024 |
| STG H%           | 55-62             | 55-62               | Allineati                       |
| Canotto W        | 300-350           | 300-350             | Allineati                       |
| Teglia Romana H% | 80-100            | 80-100              | Allineati                       |
| Chicago fat_type | Non specificato   | butter 18%          | Codebase ha fix VPL-C01         |
| Tonda Romana W   | 160-210           | 160-210             | Allineati                       |

### Raccomandazione

1. Aggiungere i 6 stili extra al Database Notion (Pala, Grandma, Focaccia Genovese, Sfincione, Focaccia di Recco, Padellino)
2. Aggiornare W range STG a 250-320 (AVPN 2024)
3. Aggiungere campo P/L e fat_type al database Notion
4. Decidere se implementare Deviation Signatures nel codebase (Fase 2?)
5. Decidere se implementare New Haven Apizza nel codebase

---

## 4. Scoring System

### Notion: 3 score

- **A-Score (Autenticita)**: menzionato, formula parziale
- **F-Score (Fattibilita)**: menzionato
- **D-Score (Digeribilita)**: menzionato
- TODO: aggiungere **E-Score (Sperimentalita)** basato su deviation_signature

### Codebase: 5 assi implementati con pesi configurabili

```
composite = authenticity     * 0.30
          + feasibility      * 0.25
          + digestibility    * 0.20
          + sustainability   * 0.15    <- NON in Notion
          + experimentation  * 0.10    <- Solo TODO in Notion
```

### Gap

- Sustainability Score (5 sotto-assi: efficienza forno, tempo cottura, fermentazione, semplicita ingredienti, tipo lievito) — implementato nel codebase, NON documentato in Notion
- Experimentation Score — implementato nel codebase come 10% del composito, Notion lo aveva solo come TODO
- I pesi sono configurabili via CMS nel codebase (Notion non prevede CMS)
- Authenticity Score ha 4 sotto-assi nel codebase (ingredienti 30%, processo 25%, attrezzatura 35%, forma 10%) — Notion ha solo teoria generica

### Raccomandazione

Aggiornare pagina "08 - Sistema di Punteggio" su Notion con le formule effettive dal codebase.

---

## 5. Motore Scientifico

### Presenti in entrambi (allineati)

- Modello Q10 per fermentazione (Notion: teoria, Codebase: implementazione con 4 varianti)
- Arrhenius per cinetica lievitazione
- Baker's % per dosaggi

### Presenti nel codebase ma NON in Notion

- Q10 variabile (4 modelli: standard, cold_adapted, sourdough warm, sourdough cold)
- Compensazioni forno parametriche (5 tipi: idratazione logaritmica, grasso, zucchero, tempo Arrhenius, spessore)
- Stima P/L da W: `P/L = 0.3 + (W - 150) * 0.0015`
- Selezione automatica lievito (priorita: sourdough > fresco > secco)
- ScientificLayer completo (13 campi: water_activity, gluten_network, FODMAP, ecc.)
- Recommendation engine con 5 fattori pesati (time, oven, skill, equipment, pantry)

### Presenti in Notion ma NON nel codebase

- Thickness Factor (g/cm2) come metrica normalizzata
- ShapeParameters (diametro, lunghezza, larghezza, peso panetto)
- Funzione `distance_from_recipe()` (distanza euclidea pesata)
- Sistema "Singolarita algoritmiche" (Semola 100%, Patate, 96h fermentazione, Acqua mare, Gluten-free)

### Raccomandazione

Sincronizzare la teoria Q10 e compensazioni su Notion. Valutare se implementare Thickness Factor e ShapeParameters nel codebase.

---

## 6. Database Parametrici

### Notion: 10+ database ricchi

1. Database Farine (Caputo, Petra, 5 Stagioni, Dallagiovanna)
2. Database Lieviti (Q10, doubling time, range termici)
3. Database Forni (distribuzione calore, T max, recovery)
4. Database Teglie & Piastre (massa termica, conducibilita)
5. Database Impastatrici & Planetarie (K factors)
6. Database Formaggi e Latticini
7. Database Gusti & Combinazioni
8. Database Condimenti
9. Database Grassi & Oli
10. Database Utensili & Accessori
11. Database Stili di Pizza (30+ proprieta)

### Codebase: dati hardcoded

- `STYLES_DB` in pizza-engine.ts (15 stili con DoughParameters + BakingParameters)
- `FLOUR_W_RANGES` (5 tipi farina con range W)
- `OVEN_PRESETS` (5 preset forno con T max)
- `TIME_SLOTS` (5 slot temporali)
- `SKILL_LEVELS` (4 livelli)
- `PIZZA_FAMILIES` (4 famiglie)

### Gap

Il codebase ha solo una frazione dei dati presenti su Notion. I database Notion sono molto piu dettagliati (farine specifiche per marca, parametri reologici completi, proprieta dei formaggi, ecc.).

### Raccomandazione

Questi database Notion sono una risorsa preziosa per una Fase 2 con backend. Per ora, i dati hardcoded nel codebase sono sufficienti per il MVP.

---

## 7. Contenuti SOLO nel Codebase (non in Notion)

| Feature                    | Righe                 | Descrizione                                                   |
| -------------------------- | --------------------- | ------------------------------------------------------------- |
| **Vulcan CMS**             | 1273 + 1600 (locales) | Sistema CMS completo con 7 lingue, 11 sezioni                 |
| **Style Editor**           | 3622                  | Editor 15 stili con smart import, diff, validazione, LiveSync |
| **Design System Catalogo** | 20 file (~3000 righe) | Catalogo interattivo completo                                 |
| **DevTools**               | 1409 + 1280           | 5 tab consolidati + Sync system                               |
| **Sync System**            | 1280 + sync.mjs       | Sincronizzazione bidirezionale Make <-> Locale                |
| **Issue Tracker**          | 54 issue chiuse       | Documentazione completa di tutti i bug/fix                    |
| **UI Components**          | ~8000 righe           | ScrollCompanion, FireGlow, DoughBlob, VulcanHero, ecc.        |
| **Recipe Output**          | 1009                  | Timeline procedurale passo-passo con orari                    |
| **Score Dashboard**        | 1278                  | PizzaNerd toggle, RadarChart 5 assi                           |
| **Dark mode**              | Completo              | Token CSS che si invertono, persistenza localStorage          |
| **Accessibilita**          | 12 issue dedicate     | reduced-motion, aria, focus management, skip-to-content       |

---

## 8. Contenuti SOLO in Notion (non nel codebase)

| Pagina                          | Contenuto                                          | Priorita per implementazione                                                                                                                         |
| ------------------------------- | -------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| **01 - Epistemologia**          | Architettura 3 layer (Physics/Constraint/Solver)   | Bassa (teoria)                                                                                                                                       |
| **02 - Ingredienti e Reologia** | Farine (W, P/L, FN), acqua, grassi                 | Media (dati utili per espansione)                                                                                                                    |
| **03 - Fermentazione**          | Modelli cinetici dettagliati                       | Parzialmente implementata                                                                                                                            |
| **04 - Forni e Compensazioni**  | Termodinamica, materiali cottura                   | Parzialmente implementata                                                                                                                            |
| **05 - Tassonomia**             | Modello 3 assi, Deviation Signatures               | Alta (feature differenziante)                                                                                                                        |
| **06 - Varianti & Tecniche**    | Maestri (Bonci, Martucci, Pepe, Bosco, Padoan)     | Media (contenuto editoriale)                                                                                                                         |
| **07 - Solver**                 | Constraint satisfaction, singolarita               | Parzialmente implementata                                                                                                                            |
| **08 - Sistema di Punteggio**   | Teoria scoring originale                           | Superata dal codebase (5 assi)                                                                                                                       |
| **09 - Schema Dati JSON**       | API RESTful endpoints                              | Non applicabile (SPA)                                                                                                                                |
| **10 - Gestione Intolleranze**  | Celiachia, FODMAP, Lattosio, Istamina, Nichel      | **IMPLEMENTATO** (15 mar 2026)                                                                                                                       |
| **11 - Troubleshooting**        | Matrice diagnostica problemi pizza                 | **IMPLEMENTATO** (15 mar 2026)                                                                                                                       |
| **Appendice A**                 | Pre-fermenti (Biga, Poolish, Pasta Madre)          | **IMPLEMENTATO** (15 mar 2026)                                                                                                                       |
| **Appendice B**                 | Nutrizione e controllo glicemico                   | Bassa                                                                                                                                                |
| **Appendice C**                 | Glossario tecnico completo                         | **IMPLEMENTATO** (15 mar 2026)                                                                                                                       |
| **6 Audit**                     | Pizzaiolo, Scientifico, UX, DB, Algoritmi, AI/Food | Bassa (gia incorporati)                                                                                                                              |
| **AI Framework**                | SCM, Layered Defense, Agile Adaptive               | Bassa (metodologia, non prodotto)                                                                                                                    |
| **10 Database parametrici**     | Farine, Lieviti, Forni, Formaggi, ecc.             | **PARZIALMENTE PORTATO** (parametric-databases.ts: temperature, tempi, impasto, sale, acqua, maturazione, condimento, pieghe, scoring, attrezzatura) |

---

## 9. Piano di Allineamento Proposto

### Fase A: Aggiornare Notion (priorita ALTA, ~4h)

> **COMPLETATA** 15 marzo 2026

1. **Aggiornare pagina "Progetto Vulcan"** (ToC principale) ✅
   - Aggiungere sezione "Stato implementazione MVP" con link al repo
   - Marcare lo stack reale (React SPA) vs piano originale (Python backend)
   - Aggiornare stato migrazione

2. **Aggiornare "13 - Design System"** ✅
   - Nuova palette "Cucina Editoriale" con hex corretti
   - Architettura token 3-tier
   - Componenti brand custom

3. **Aggiornare "05 - Tassonomia Pizza"** ✅
   - Aggiungere 6 stili mancanti (Pala, Grandma, Focaccia Genovese, Sfincione, Focaccia di Recco, Padellino)
   - Aggiornare STG W range a 250-320 (AVPN 2024)
   - Aggiungere P/L e fat_type ai parametri

4. **Aggiornare "08 - Sistema di Punteggio"** ✅
   - Documentare 5 assi reali con pesi
   - Aggiungere Sustainability Score (5 sotto-assi)
   - Documentare formule effettive

5. **Aggiornare Database Stili di Pizza**
   - Aggiungere i 6 stili mancanti come righe
   - Aggiungere colonne P/L Min, P/L Max, fat_type

### Fase B: Feature da Notion -> Codebase (priorita MEDIA, backlog)

> **COMPLETATA** 16 marzo 2026

1. ~~Gestione Intolleranze (Pagina 10)~~ — **COMPLETATO** (15 mar 2026) + CMS i18n 7 lingue
2. ~~Troubleshooting (Pagina 11)~~ — **COMPLETATO** (15 mar 2026)
3. ~~Pre-fermenti (Appendice A)~~ — **COMPLETATO** (15 mar 2026) `pre-ferment-guide.tsx`
4. ~~Thickness Factor~~ — **COMPLETATO** (15 mar 2026) esposto in StyleDetailSheet
5. ~~Deviation Signatures~~ — **COMPLETATO** (15 mar 2026) `deviation-tags.ts` + E-Score integrato
6. ~~Tag multi-dimensionali~~ — **COMPLETATO** (15 mar 2026) 11 dimensioni per 15 stili
7. ~~Author Variants~~ — **COMPLETATO** (15 mar 2026) 6 maestri con compatibilita stile
8. ~~CMS i18n filtri avanzati~~ — **COMPLETATO** (16 mar 2026) 23 campi tradotti in 7 lingue
9. ~~CMS i18n glossario~~ — **COMPLETATO** (16 mar 2026) 24 campi tradotti in 7 lingue + GlossaryLink deeplink
10. ~~Database Farine espanso v3~~ — **COMPLETATO** (16 mar 2026) 25 farine (+ 11 alternative: farro, spelta, kamut, segale, riso, mais, saraceno, avena, teff, ceci, tipo 1)
11. ~~10 Database parametrici~~ — **COMPLETATO** (16 mar 2026) `parametric-databases.ts` con 10 tabelle per 15 stili + integrazione in StyleDetailSheet e timeline recipe-output

### Fase C: Backend (priorita BASSA, Fase 2)

1. Migrare `STYLES_DB` in database relazionale
2. API RESTful per recipe generation
3. Autenticazione utente
4. Persistenza ricette salvate
5. Import dati dai 10 database Notion

---

## 10. Mappa Pagine Notion -> File Codebase

| Pagina Notion               | File Codebase Correlato                                                       | Copertura        |
| --------------------------- | ----------------------------------------------------------------------------- | ---------------- |
| 01 - Epistemologia          | (architettura implicita in pizza-engine.ts)                                   | 20%              |
| 02 - Ingredienti e Reologia | pizza-engine.ts (FLOUR_W_RANGES)                                              | 30%              |
| 03 - Fermentazione          | pizza-engine.ts (getQ10, generateRecipe)                                      | 70%              |
| 04 - Forni e Compensazioni  | pizza-engine.ts (calculateOvenCompensations)                                  | 60%              |
| 05 - Tassonomia Pizza       | pizza-engine.ts + deviation-tags.ts (15 stili, tag, deviation)                | 75%              |
| 06 - Varianti & Tecniche    | deviation-tags.ts (6 AuthorVariants, compatibilita)                           | 50%              |
| 07 - Solver                 | pizza-engine.ts (recommendStyles, generateRecipe)                             | 50%              |
| 08 - Sistema di Punteggio   | pizza-engine.ts (calculateScores) + score-dashboard.tsx                       | 80%              |
| 09 - Schema Dati JSON       | Non applicabile (SPA, no API)                                                 | N/A              |
| 10 - Gestione Intolleranze  | user-needs.tsx (dietary chips) + dietary-data.ts                              | 65%              |
| 11 - Troubleshooting        | troubleshooting-data.ts + troubleshooting-panel.tsx                           | 80%              |
| 12 - Roadmap                | docs/github-issues.md + dev-tools.tsx (issue tracker)                         | 60%              |
| 13 - Design System          | design-system/ (20 file) + theme.css (1347 righe)                             | 90% (ma diverso) |
| AI Framework                | Non applicabile (metodologia, non prodotto)                                   | N/A              |
| Database Farine             | flour-database.ts (25 farine, 6 categorie) + pizza-engine.ts (FLOUR_W_RANGES) | 70%              |
| Database Lieviti            | pizza-engine.ts (getQ10, selezione automatica)                                | 30%              |
| Database Forni              | pizza-engine.ts (OVEN_PRESETS) + parametric-databases.ts (OVEN_TEMPS_DB)      | 60%              |
| Database Stili              | pizza-engine.ts (STYLES_DB, 15 stili) + parametric-databases.ts (10 tabelle)  | 75%              |
| Database Teglie & Piastre   | parametric-databases.ts (DOUGH_BASE_DB — panSize, panShape)                   | 30%              |
| Database Impastatrici       | parametric-databases.ts (EQUIPMENT_DB — mixerType, mixingTime)                | 40%              |
| Database Formaggi           | parametric-databases.ts (TOPPING_DB — cheeseType, cheesePosition)             | 20%              |
| Database Condimenti         | parametric-databases.ts (TOPPING_DB — toppingOrder, saucePosition)            | 25%              |
| Database Grassi & Oli       | pizza-engine.ts (fat_type, fat_pct per stile)                                 | 30%              |
| Database Gusti, Utensili    | Non implementati (catalogo prodotti)                                          | 0%               |

---

> Analisi aggiornata il 16 marzo 2026 confrontando:
>
> - Notion workspace "Progetto Vulcan" (25 pagine, ultimo update 16 mar 2026)
> - Codebase Vulcan Pizza Lab (68 file attivi, ultimo update 16 mar 2026)
> - Guidelines.md (18 sezioni, aggiornato 16 mar 2026)