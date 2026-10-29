# Correzioni al motore — FW-17, 29 ottobre 2026

Pacchetto FW-17 dell'audit UX/scienza (28/10/2026): **dosi per fase, un solo modello per
Ricetta, Procedimento, modalità cottura e stampa**. Decisioni di Matteo applicate: D-O
(microdosi di lievito) e D-P (biga col lievito madre). Codice in `src/app/domain/`
(`recipe-phases.ts`, `dose-rounding.ts`, `pre-ferment-split.ts`, `pizza-engine.ts`),
puro e testato (`recipe-phases.test.ts`).

## Riepilogo

| Finding | Cosa cambia |
|---|---|
| S08-A-02, S08-B-09 | `buildRecipePhases` divide le dosi una volta: per ogni ingrediente la somma delle fasi è il totale (lo zucchero non sparisce più dall'impasto finale; sale e grasso ci sono anche in stampa). |
| S08-A-03 | La quota di farina del poolish non supera l'idratazione; l'acqua del prefermento non supera quella della ricetta. Acqua finale a 0 g solo dichiarata «già tutta nel prefermento». |
| S08-A-05 (D-P) | Niente biga o poolish col lievito madre: con un lievito di birra in dispensa il prefermento usa quello; col solo lievito madre il prefermento non si calcola e la ricetta lo dice (`method_changes: preferment.sourdoughInstead`). |
| S08-A-07 | Con un prefermento due temperature dell'acqua: prefermento `3 × T_pref − T_cucina − T_farina` (stima), impasto finale con la regola a quattro termini. |
| S08-B-19 | Sale, grasso e zucchero al mezzo grammo sotto i 5 g (`roundForDisplay`), al grammo sopra. |
| S08-A-13, S08-B-04, S10-A-21 (D-O) | Sotto 1 g di lievito: diluizione al 2 % (5 g in 245 g d'acqua, se ne prende dose × 50), con la stima in cucchiaini solo per il secco. |

## Misure prima/dopo

### Golden (`src/app/domain/golden/recipes.golden.json`)

Cambiano due valori su 58 scenari, entrambi per l'arrotondamento al mezzo grammo sotto i 5 g:

| Scenario | Campo | Prima | Dopo | Dose esatta |
|---|---|---|---|---|
| new_haven_apizza/home | sugar_g | 4 | 4,5 | 624 g × 0,7 % ≈ 4,37 g |
| california_style/home | sugar_g | 3 | 2,5 | 539 g × 0,5 % ≈ 2,70 g |

Nessun cambio di esito, forno, tempi o masse principali. Le temperature dell'acqua non sono nel golden.

### Arrotondamento (S08-B-19), casi dell'audit

| Caso | Dose esatta | Prima | Dopo | % dichiarata |
|---|---|---|---|---|
| Pinsa, 1 pala, sale 1,8 % su 131 g | 2,36 g | 2 g (1,5 %) | 2,5 g (1,9 %) | 1,8 % |
| Pinsa, 1 pala, olio 1,3 % su 131 g | 1,70 g | 2 g | 1,5 g | 1,3 % |

Errore massimo: 0,25 g sotto i 5 g, 0,5 g sopra (test su tutto il catalogo, 1, 4 e 9 panetti).

### Temperatura dell'acqua con un prefermento (S08-A-07)

Cucina 20 °C, impasto a mano, fermentazione a 20 °C (DDT 24 °C), canotto con biga
(maturazione 18–20 °C, punto medio 19 °C, fonti in `docs/ricerca/prefermenti-fonti-2026-10-24.md`):

| | Prima | Dopo |
|---|---|---|
| Acqua dell'impasto finale | 32 °C (3 × 24 − 20 − 20) | 37 °C (4 × 24 − 20 − 20 − 19) |
| Acqua della biga | non indicata | 17 °C, stima (3 × 19 − 20 − 20) |

Senza prefermento non cambia nulla. Ipotesi nuova nel registro: `preferment-at-maturation-temp`
(nota `water-temp-rule`, testi nelle 7 lingue).

### Poolish oltre l'idratazione (S08-A-03)

Chicago deep, idratazione 48 %, poolish chiesto al 50 %: prima acqua finale circa −20 g su
1 kg di farina; dopo quota al 48 %, acqua finale 0 g dichiarata «già tutta nel prefermento».

### Classifiche

`recommendStyles` per P1 (casa 250 °C) e P3 (Effeuno 509 °C) non cambia: i punteggi usano le
percentuali, non i grammi arrotondati, e D-P agisce solo con il solo lievito madre in dispensa.
`persona-consistency.test.ts` e le proprietà del motore restano verdi.

## Nessuna dose promessa come esatta

- La diluizione è esatta nell'aritmetica, le pesate no. Con la bilancia da cucina (passo 1 g,
  errore fino a ±0,5 g) si pesa due volte: i 5 g di lievito della soluzione madre (±10 %) e la
  soluzione da prelevare (±0,5 g su 5–45 g, dal ±10 % all'1 %). Gli errori si sommano: ±20 % a
  0,1 g (5 g di soluzione), ±15 % da 0,2 g fino al grammo (arrotondato per eccesso al 5 %;
  `dilutionUncertaintyPct` in `recipe-phases.ts`). Il testo nomina entrambe le pesate e dà il
  valore calcolato per quella dose. L'acqua della soluzione madre (245 g, ±0,2 %) si trascura.
- I cucchiaini sono marcati «stima» (un cucchiaino raso di secco ≈ 3 g, la stessa ipotesi dei
  suggerimenti già presenti sopra il grammo).
- La temperatura dell'acqua del prefermento è marcata «stima».

## Revisione (stesso ramo)

- Baker's %: la Ricetta (livello nerd) e la stampa leggono la stessa riga dei totali
  (`buildRecipePhases(...).totals`, cioè i `baker_pcts` del motore) con lo stesso formato
  (`phaseBakerPctText`). Prima la Ricetta ricalcolava dai grammi arrotondati: pinsa da un
  panetto, sale 1,9 % a schermo e 1,8 % in stampa, olio 1,1 % e 1,3 %; STG sale 3 % e 2,8 %.
- Regola 55 col prefermento: la spiegazione usa la stessa somma del motore (`rule55Sum` in
  `pre-ferment-split.ts`): cucina + farina + acqua + prefermento = 4 × DDT − attrito, col
  prefermento alla temperatura di maturazione (ipotesi: punto medio, biga 19 °C, poolish 21 °C).
  Esempio: canotto con biga, cucina a 20 °C, DDT 24 °C: 20 + 20 + 37 + 19 = 96 = 4 × 24. Il (?)
  sta accanto alla temperatura dell'acqua dell'impasto finale, nello scorporo, non più sulla riga
  Acqua (che con un prefermento non mostra temperature).
