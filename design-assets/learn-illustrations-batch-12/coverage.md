# Useful missing illustrations outside the glossary

Audit against main `20632adeb6d04c95d99385295eefa8a29a634d3c`, 2026-11-01. This is a placement proposal, not a claim that these assets have been inserted or published.

| Section | Observed coverage | Proposed action |
| --- | --- | --- |
| Impara landing | Resource/path illustrations already exist | Keep the existing hierarchy; no extra generic hero |
| Glossario | All 44 terms mapped | No new filler artwork |
| Problemi e soluzioni | 22 of 24 have illustrations | Keep P06/P20 text-led: taste/smell cannot be diagnosed visually |
| Prefermenti | One consistency image per expanded card; ordered “Come si fa” steps are text | Add the four new practical scenes to the corresponding steps; reuse covered-rest for resting |
| Metodo e fonti | Text, evidence legend, formulas and source disclosures; no illustration placements | Add generic weighing in the explanation of quantities; reuse existing images only in related explanations |
| Farine / detail | Technical descriptions and figures; no product photos | Use the existing generic lab illustration where explaining W/P/L, not one imaginary bag or plot per SKU |

## Five new candidates

| Asset | Placement | What it explains |
| --- | --- | --- |
| flour-weighing | Metodo quantities / preferment preparation | Bowl support on a generic scale and the need to tare; blank LCD |
| biga-hand-mixing | Biga, step 1 | Brief gathering; irregular clumps instead of a kneaded ball |
| poolish-stirring | Poolish, step 1 | Spoon mixing a loose homogeneous batter; not mature foam |
| biga-in-water | Biga, step 3 | Pieces partly immersed at the start of final mixing |
| autolyse-initial-mix | Autolisi, step 1 | Rough connected mass before resting; composition explained in HTML |

## Existing artwork to reuse

| Existing asset | Useful explanation |
| --- | --- |
| covered-rest.webp | Resting steps in preferment cards |
| dough-temperature.webp | Method: actual dough temperature, distinct from room temperature |
| portion-weighing.webp | Method: total mass and division into portions |
| alveograph-bubble.webp | Method/flour explanation of the generic test; no fabricated SKU result |
| oven-floor-dome.webp | Method: heat transfer and oven context |
| a-score-diagram.svg and existing localized renderer | Method: score criteria; retain formula/labels in HTML |

Implementation should extend the existing guide/learning components with localized captions and source links, preserve old illustrations, lazy-load below-the-fold assets, and verify the current bundle budget. New artwork should clarify a specific passage; do not decorate every formula or disclosure.

Relevant inspected code: `src/app/pages/pre-ferments.tsx`, `src/app/features/recipe/pre-ferment-guide.tsx`, `src/app/features/cms/domain-i18n-defaults.ts`, `src/app/pages/method.tsx`, `src/app/data/method-sections.ts`, and the flour detail/learning routes. The online biga guide was also opened to confirm the practical steps currently lack gesture images.
