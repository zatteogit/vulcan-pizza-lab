# Impara · Lotto 13

Five local review proposals after the published batch 12: room air temperature, refrigerator-shelf temperature, flour temperature, optional dry-yeast activity check and qualitative dough-development comparison. No app integration or production deployment in this batch yet. Photographic inspiration and recomposition records stay internal; the review gallery shows only useful educational captions, per Matteo’s preference of 2026-11-01. Existing application artwork and text are preserved.

- Gallery: `review.html`, served at [lotto 13](http://127.0.0.1:5196/design-assets/learn-illustrations-batch-13/review.html).
- Final project assets: `assets/`, five alpha WebPs at 672 × 448.
- Exact prompts and photographic input roles: `prompts.json`.
- Source pages, authors, photo URLs, recompositions, limitations and checksums: `manifest.json`.
- Original 1536 × 1024 PNG masters, research photos and verification evidence: `/Users/matteo/dev/Vulcan/output/learn-illustration-batch-13-2026-11-01/`.

Mode: built-in Imagegen, one distinct call per asset. Pillow only resizes, converts formats and composites review contact sheets; generated alpha and artwork are preserved. The brown aura visible in the generator preview is not used as a background: exported alpha is inspected on both light and dark surfaces.

## Internal source fidelity

ThermoWorks photographs show an actual air thermometer in a room and on a refrigerator shelf. The device is redrawn generically, rather than retaining the branded arch/round-screen silhouette. The fridge vignette combines its real shelf arrangement with the King Arthur Baking lidded proofing tub; that tub photograph itself was not taken inside a fridge. The thermometer measures air, not the dough core or stability over time.

The flour-temperature scene is recorded internally as a recomposition: the hand/tool photograph by Barb Alpern measures dough; PJ Hamel's separate photograph supplies the bowl of flour. The King Arthur professional reference identifies flour temperature as an input. No photograph is misattributed as showing the recomposed flour measurement, and no temperature, accuracy or numeric depth is invented.

PJ Hamel's yeast reference is specifically a dry-yeast activity test, separate from the same article's baking-powder/soda tests. The drawing uses one yeast bowl and omits packaging and quantities. It is an optional check when activity is in doubt, not a universal activation step, dosage calculation or visual pass/fail standard.

The volume comparison follows Maurizio Leo's actual four-photo sequence, which also contains folding between stages. It is not a controlled experiment isolating fermentation, an exact doubling diagram or a universal readiness threshold. The two bowls show qualitative development; explanations stay in HTML.

## Remaining coverage

The glossary already maps all 44 terms; 22 of 24 troubleshooting entries already have useful imagery. P06/P20 remain text-led: taste or smell cannot be diagnosed visually. These five proposals improve specific practical explanations rather than marking unpictured topics as automatically needing art.

Proposed placements: `kitchen-temp-default` / P04 prevention; P21 shelf-temperature check; `water-temp-rule`; P04 dry-yeast check; P03/P05 and the explanation of estimated fermentation time. The torn-dough repair gesture is deferred: researched pages support pinching in text, but no sufficiently clear matching photograph was selected. No unsupported gesture is drawn.

To reproduce export and gallery generation from preserved originals:

```sh
python3 design-assets/learn-illustrations-batch-13/build.py
```

Verification is limited to these independent review assets: alpha, five loaded 672 × 448 images, captions, 1280px desktop and 390px mobile layouts, light/dark backgrounds. Screenshots and `verification.json` are stored in the output directory. App tests and bundle-budget checks belong to the later integration.
