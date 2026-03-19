# Engine Test Suite — Report
Data: 2026-03-18 06:42:09
Stili: 15 | Schema: v1.4
Risultato: 90 test — 80 pass, 5 warn, 5 fail (6ms)

## DB Integrity (11P/1W/0F)
- [PASS] T01-01 Stili presenti ≥ 15: 15 stili
- [PASS] T01-02 ID univoci: 15/15
- [PASS] T01-03 Famiglie valide: Tutte in napoletana/romana/americana/contemporanea
- [PASS] T01-04 Hydration ranges validi: 15 stili OK
- [PASS] T01-05 W ranges validi: OK
- [PASS] T01-06 P/L ranges validi: OK
- [PASS] T01-07 Baking temp coerenti: OK
- [PASS] T01-08 Cook time ranges coerenti: OK
- [PASS] T01-09 Fermentation ranges validi: OK
- [PASS] T01-10 Campi obbligatori presenti: OK
- [WARN] T01-11 Fat type coerente: chicago_deep: fat_type=butter ma oil_pct=18 (dovrebbe essere in fat_pct separato?)
- [PASS] T01-12 Schema version definita: v1.4

## Generation Matrix (10P/0W/0F)
- [PASS] T02-01 Generazione base (15 stili): 15 ricette OK
- [PASS] T02-02 Matrice forno (75 combo): 75 combo OK
- [PASS] T02-03 Matrice skill (60 combo): 60 combo OK
- [PASS] T02-04 Sweep temp 150-500°C (135): 135 combo OK
- [PASS] T02-05 Scaling lineare pallini: Scaling OK
- [PASS] T02-06 Sweep fermentazione 2-72h (105): OK
- [PASS] T02-07 Con pantry (farine + lieviti): OK
- [PASS] T02-08 Schema version = 1.4: OK
- [PASS] T02-09 Timeline presente in tutte le ricette: 15 OK
- [PASS] T02-10 Topping info nelle ricette: 15/15 stili con topping info

## Score Bounds (9P/0W/0F)
- [PASS] T03-01 Score bounds [0, 100]: 90 valori OK
- [PASS] T03-02 Composite = somma pesata (±1): OK
- [PASS] T03-03 Pesi dimensioni sommano a 1.0: Σ = 1
- [PASS] T03-04 Categorie score definite: OK
- [PASS] T03-05 Distribuzione score (varianza): Range: 64-78 (spread=14)
- [PASS] T03-06 Autenticità: forno legna > forno casa (STG): Legna=100, Casa=84
- [PASS] T03-07 Feasibility monotona con skill↑: sk1→52, sk2→64, sk3→64, sk4→64
- [PASS] T03-08 Digeribilità: 48h ≥ 4h fermentazione: 4h=34, 48h=56
- [PASS] T03-09 EngineMsg format (penalties/warnings/claims): OK

## Compensazioni (6P/0W/0F)
- [PASS] T04-01 Compensazioni stabili (120 combo): OK
- [PASS] T04-02 Zero compensazione a temp ideale: OK
- [PASS] T04-03 Cook time monotono (temp↓ → tempo↑): OK
- [PASS] T04-04 Hydration delta bounded (log model): OK
- [PASS] T04-05 Compensazioni tracciate in science.compensations: 3 compensazioni a 180°C
- [PASS] T04-06 Thickness factor in [0.5, 1.0]: OK

## Q10 Models (5P/0W/0F)
- [PASS] T05-01 Q10 stabile (30 combo): OK
- [PASS] T05-02 Cold-adapted Q10 < standard Q10: 4°C: Q10=1.6 (cold_adapted), 15°C: Q10=2 (standard)
- [PASS] T05-03 Sourdough Q10 ≠ commercial Q10: Madre=2.2, Fresco=2
- [PASS] T05-04 Q10 in range biochimico [1.0, 4.0]: OK
- [PASS] T05-05 Model name sempre presente: OK

## P/L Estimation (4P/0W/0F)
- [PASS] T06-01 P/L stimato in range [0.1, 2.0]: OK
- [PASS] T06-02 P/L clampato nel range stile: OK
- [PASS] T06-03 P/L monotono con W↑: W150→0.3, W200→0.38, W250→0.45, W300→0.53, W350→0.6
- [PASS] T06-04 flour_pl_estimated in science layer: OK

## Rule 55 (3P/0W/0F)
- [PASS] T07-01 Water temp valida o null: OK
- [PASS] T07-02 Campi Rule 55 in science layer: OK
- [PASS] T07-03 Acqua più fredda con cucina più calda: Cucina 15°C→acqua 36°C, Cucina 30°C→acqua 6°C

## Recommendation (5P/2W/0F)
- [PASS] T08-01 Raccomandazioni base non vuote: 15 stili raccomandati
- [PASS] T08-02 Tutti gli stili raccomandati: 15/15
- [PASS] T08-03 Tier validi (perfect/good/challenging): Perfect:6, Good:9, Challenging:0
- [PASS] T08-04 Raccomandazioni ordinate per score↓: Top 3: chicago_deep(undefined), padellino_torino(undefined), focaccia_genovese(undefined)
- [WARN] T08-05 STG score↑ con forno legna: Legna=?, Casa=?
- [WARN] T08-06 Bonci penalizzato con sole 4h: 4h=?, 48h=?
- [PASS] T08-07 Reasons/warnings formato EngineMsg: OK

## Edge Cases (11P/0W/0F)
- [PASS] T09-01 1 pallina: OK
- [PASS] T09-02 Forno 150°C (minimo): OK
- [PASS] T09-03 Forno 500°C (massimo): OK
- [PASS] T09-04 Dispensa vuota: OK
- [PASS] T09-05 Solo lievito madre: OK
- [PASS] T09-06 Skill 1 + stile complesso: OK
- [PASS] T09-07 Fermentazione 2h (minimo): OK
- [PASS] T09-08 Fermentazione 96h (estremo): OK
- [PASS] T09-09 Temp cucina estrema (5-40°C): OK
- [PASS] T09-10 Equipment on/off: OK
- [PASS] T09-11 Tutti i filtri dietetici: OK

## Cross-Validation (7P/0W/0F)
- [PASS] T10-01 Bilancio massa ingredienti (±2%): 15 OK
- [PASS] T10-02 ball_weight × balls ≈ total_dough: OK
- [PASS] T10-03 Hydration % consistente: OK
- [PASS] T10-04 Effective hours 18°C > 0: OK
- [PASS] T10-05 Baking energy > 0 kJ: OK
- [PASS] T10-06 Deviation scores in [0, 1]: OK
- [PASS] T10-07 Gluten [0,100] & aw [0.9,1.0]: OK

## Parametric DB (5P/0W/5F)
- [PASS] T11-OvenTemp OvenTemp DB copertura: 15/15
- [PASS] T11-BakingTime BakingTime DB copertura: 15/15
- [PASS] T11-DoughBase DoughBase DB copertura: 15/15
- [PASS] T11-Salt Salt DB copertura: 15/15
- [FAIL] T11-Water Water DB copertura: Mancanti (7): tonda_romana, pinsa_romana, sfincione, pala_romana, grandma_style
- [FAIL] T11-Maturation Maturation DB copertura: Mancanti (7): tonda_romana, pinsa_romana, sfincione, pala_romana, grandma_style
- [PASS] T11-Topping Topping DB copertura: 15/15
- [FAIL] T11-Folding Folding DB copertura: Mancanti (7): tonda_romana, pinsa_romana, sfincione, pala_romana, grandma_style
- [FAIL] T11-Scoring Scoring DB copertura: Mancanti (11): napoletana_canotto, tonda_romana, pinsa_romana, new_york, detroit
- [FAIL] T11-Equipment Equipment DB copertura: Mancanti (7): tonda_romana, pinsa_romana, sfincione, pala_romana, grandma_style

## Deviation & Flour (4P/2W/0F)
- [PASS] T12-01 Deviation signatures complete: 15/15
- [PASS] T12-02 Author variants presenti: 9 varianti autore
- [PASS] T12-03 getCompatibleVariants() stabile: OK
- [PASS] T12-04 Farine nel database ≥ 25: 25 farine
- [WARN] T12-05 Effective W range valido per tutte le farine: mix_gluten_free: [0,0]; riso: [0,0]; mais: [0,0]
- [WARN] T12-06 Farine compatibili per ogni stile: Nessuna per: pala_romana, grandma_style
