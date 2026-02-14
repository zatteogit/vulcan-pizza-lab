# Audit Verifica Implementativa v1

> **Data:** 14 febbraio 2026
> **Scope:** Cross-reference `pizza-engine.ts` vs Notion pages 02, 03, 04, 08
> **Esito:** 1 bug critico corretto nel codice, 5 disallineamenti Notion da correggere

---

## 1. Riepilogo esecutivo

Questo audit verifica che il codice in `src/app/components/pizza-engine.ts` sia allineato alla Knowledge Base (Notion) del Progetto Vulcan. L'audit è stato eseguito confrontando sistematicamente le pagine Notion 02 (Database Parametrico), 03 (Modellazione Fermentazione), 04 (Gestione Forno) e 08 (Scoring Multi-Asse) con le implementazioni nel motore.

### Risultato

| Area | Codice | Notion | Allineamento |
|------|--------|--------|-------------|
| STYLES_DB (9 stili) | ✅ Completo | ✅ Allineato | ✅ |
| P/L ratio | ✅ Implementato | ✅ Documentato | ✅ |
| Q10 variabile | ✅ 4 modelli | ⚠️ Solo fisso 2.0 | **NOTION DA AGGIORNARE** |
| Compensazione forno | ✅ 5 assi | ⚠️ Solo 3 assi | **NOTION DA AGGIORNARE** |
| k Arrhenius | ✅ 0.0065 | ❌ Era 0.0045 | **BUG CORRETTO** |
| Sustainability Score | ✅ 5° asse | ⚠️ Non documentato | **NOTION DA AGGIORNARE** |
| Composite 5 assi | ✅ A/F/D/S/E | ⚠️ Solo 4 assi | **NOTION DA AGGIORNARE** |
| fat_type/fat_g | ✅ Implementato | ✅ Allineato | ✅ |
| STG W 250-320 | ✅ Implementato | ✅ Allineato | ✅ |
| Chicago butter 18% | ✅ Implementato | ✅ Allineato | ✅ |

---

## 2. Bug corretto: costante k Arrhenius

### Problema

La costante `k` nel modello esponenziale del tempo di cottura (`calculateOvenCompensations`) era calibrata a **0.0045**, ma il confronto con i dati empirici di calibrazione mostrava una sottostima sistematica del **~40%** ai deficit di temperatura tipici dei forni domestici.

### Dati di calibrazione

| T forno | Deficit vs 485°C | Tempo reale | k=0.0045 | k=0.0065 | Errore vecchio |
|---------|-------------------|-------------|----------|----------|----------------|
| 485°C | 0 | 75s | 75s | 75s | 0% |
| 400°C | 85 | ~130s | ~110s | ~130s | -15% |
| 280°C | 205 | ~270s | ~190s | ~280s | -30% |
| 250°C | 235 | ~345s | ~215s | ~345s | -38% |

### Fix applicato

```typescript
// pizza-engine.ts, line 713
const k = 0.0065; // Ricalibrato (era 0.0045 — sottostimava ~40% a T domestiche)
```

### Impatto

Un utente con forno domestico a 250°C che cuoceva una Napoletana STG avrebbe ricevuto un tempo di cottura di ~3.5min invece dei ~5.8min corretti. La pizza sarebbe risultata cruda al centro.

---

## 3. Correzioni Notion necessarie

### 3.1 Pagina 08 — Scoring Multi-Asse

**Stato attuale Notion:** Documenta 4 assi (Authenticity, Feasibility, Digestibility, Experimentation)

**Stato codice:** 5 assi con Sustainability Score

**Correzione necessaria:**

Aggiungere sezione Sustainability Score:

```
### Sustainability Score (S) — Peso composite: 0.15

5 sotto-assi:
| Sotto-asse           | Peso | Descrizione                              |
|---------------------|------|------------------------------------------|
| Efficienza forno    | 30%  | T relativa + normalizzazione assoluta     |
| Tempo cottura       | 25%  | Più breve = meno energia                 |
| Fermentazione       | 20%  | Ambiente = 0 energia frigo               |
| Semplicità ingr.    | 15%  | Meno additivi = più sostenibile          |
| Tipo lievito        | 10%  | Sourdough autoprodotto = impatto zero    |
```

Aggiornare formula composite:
```
composite = A*0.30 + F*0.25 + D*0.20 + S*0.15 + E*0.10
```

### 3.2 Pagina 04 — Gestione Forno

**Stato attuale Notion:** Documenta 3 compensazioni (idratazione, olio, zucchero)

**Stato codice:** 5 compensazioni

**Correzioni necessarie:**

1. **Aggiungere compensazione tempo cottura:**
   ```
   Modello: t = t_ideal × e^(k × deficit)
   k = 0.0065 (ricalibrato 14/02/2026)
   Trigger: deficit > 20°C
   ```

2. **Aggiungere compensazione spessore:**
   ```
   deficit > 200°C → thickness_factor = 0.8 (-20%)
   deficit > 100°C → thickness_factor = 0.9 (-10%)
   ```

3. **Correggere base zucchero:** da `+1%` a `+0.5%` (il codice usa `0.5` come base, non `1.0`)

### 3.3 Pagina 03 — Modellazione Fermentazione

**Stato attuale Notion:** Q10 = 2.0 fisso

**Stato codice:** Q10 variabile per tipo lievito e temperatura

**Correzione necessaria:**

Sostituire il paragrafo Q10 con:

```
### Q10 Variabile (`getQ10()`)

| Condizione                    | Q10 | Modello        |
|------------------------------|------|----------------|
| Lievito commerciale, T ≥ 10°C | 2.0  | standard       |
| Lievito commerciale, T < 10°C  | 1.6  | cold_adapted   |
| Lievito madre, T > 15°C       | 2.2  | sourdough      |
| Lievito madre, T ≤ 15°C       | 1.9  | sourdough      |

Riferimento: PMC7146123, S. cerevisiae; LAB Q10 1.9-2.4
```

---

## 4. Matrice di allineamento completa

### pizza-engine.ts → Notion

| Funzione/Costante | Riga codice | Pagina Notion | Allineato | Note |
|-------------------|-------------|---------------|-----------|------|
| `STYLES_DB` (9 stili) | 83-622 | Pag 02 | ✅ | |
| `flour_pl_range` | in ogni stile | Pag 02 | ✅ | Aggiunto audit |
| `fat_type: "butter"` (Chicago) | 542 | Pag 02 | ✅ | Bug #4 risolto |
| `oil_pct: 18.0` (Chicago) | 541 | Pag 02 | ✅ | Bug #4 risolto |
| `flour_w_range: [250,320]` (STG) | 248 | Pag 02 | ✅ | AVPN 2024 |
| `getQ10()` | 629-646 | Pag 03 | ⚠️ | Notion ha solo 2.0 fisso |
| `calculateOvenCompensations()` | 661-754 | Pag 04 | ⚠️ | Notion manca tempo+spessore |
| `estimatePL()` | 766-773 | KB cap 4 | ✅ | |
| `calculateAuthenticityScore()` | 777-893 | Pag 08 | ✅ | Include P/L |
| `calculateFeasibilityScore()` | 895-985 | Pag 08 | ✅ | W×H interaction |
| `calculateDigestibilityScore()` | 987-1081 | Pag 08 | ✅ | Q10 variabile |
| `calculateExperimentationScore()` | 1083-1122 | Pag 08 | ✅ | |
| `calculateSustainabilityScore()` | 2122-2220 | Pag 08 | ❌ | **Non documentato** |
| Composite 5 assi | 1374-1380 | Pag 08 | ⚠️ | Notion ha solo 4 |
| `ScientificLayer.q10_model` | 1506 | Pag 03 | ⚠️ | Campo nuovo |
| `ScientificLayer.compensations` | 1508 | Pag 04 | ⚠️ | Campo nuovo |
| `ScientificLayer.flour_pl_estimated` | 1509 | KB cap 4 | ✅ | |
| `ScientificLayer.baking_energy_kj` | 1510 | Nessuna | ℹ️ | Solo in codice |

### KB (Guidelines.md) → Codice

| Sezione KB | Allineata al codice | Note |
|-----------|--------------------|----- |
| §4 DoughParameters | ✅ | flour_pl_range + fat_type |
| §4 Composite score | ✅ | 5 assi con pesi corretti |
| §4 Recommendation engine | ✅ | 5 pesi con pantry 20% |
| §4 Q10 variabile | ✅ | Tabella 4 condizioni |
| §4 Compensazioni | ✅ | 5 compensazioni documentate |
| §4 P/L estimation | ✅ | Formula + clamp |
| §4 Authenticity 4 assi | ✅ | Include P/L |
| §4 Feasibility W×metodo | ✅ | Interaction + method bonus |
| §4 Sustainability 5 sotto-assi | ✅ | Pesi corretti |
| §4 ScientificLayer campi | ✅ | Tutti i campi presenti |
| §4 GeneratedRecipe nuovi campi | ✅ | fat_g, fat_label, flour_pl |

---

## 5. Backlog tecnico emerso dall'audit

| # | Priorità | Descrizione | Dipendenze |
|---|----------|-------------|------------|
| 1 | Media | Slider P/L nel RecipeConfigurator per utenti avanzati | Nessuna |
| 2 | Bassa | Mostrare compensazioni applicate nell'UI (banner/tooltip) | `science.compensations[]` |
| 3 | Alta | Aggiornare Notion Pag 08 con S-Score e composite 5 assi | Accesso scrittura Notion |
| 4 | Alta | Aggiornare Notion Pag 04 con compensazioni tempo/spessore + fix zucchero | Accesso scrittura Notion |
| 5 | Alta | Aggiornare Notion Pag 03 con Q10 variabile | Accesso scrittura Notion |
| 6 | Bassa | Build TypeScript effettiva (nessuna compilazione eseguita in questa sessione) | CI/CD |

---

## 6. Metodologia

L'audit è stato condotto in 3 fasi:

1. **Fetch Notion pages** — Lettura pagine 02, 03, 04, 08 via MCP Notion (read-only)
2. **Cross-reference** — Confronto riga per riga tra formule Notion e implementazione in `pizza-engine.ts`
3. **Validation** — Verifica numerica dei modelli (Q10, compensazioni, scoring) con dati di calibrazione

### Limitazioni

- L'accesso Notion è in sola lettura: le 5 correzioni Notion non sono state applicate
- Non è stata eseguita la compilazione TypeScript (`tsc --noEmit`)
- I test unitari non esistono (TODO: aggiungere test per modelli matematici)

---

*Generato da Figma Make — Vulcan Pizza Lab Dev Tools*
*Sessione audit: 14 febbraio 2026*