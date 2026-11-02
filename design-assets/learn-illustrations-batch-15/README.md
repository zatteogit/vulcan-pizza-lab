# Impara · Lotto 15

Four photo-grounded review proposals for useful unillustrated practical explanations in Metodo e fonti: precision weighing of dry yeast, weighing a starter portion, stone/steel baking surfaces, and preparation of a water-activity sample. Not integrated into the application or published.

- Review: `review.html`, with light/dark switch and useful captions only.
- Final project WebPs: `assets/`, four 672 × 448 alpha images.
- Exact prompts and input roles: `prompts.json`; the targeted starter/spatula correction is recorded in `edits.json`.
- Photographic pages, authors, recompositions, limitations and checksums: `manifest.json`.
- Coverage audit and proposed placements: `coverage.md`.
- Original PNG masters, photographic research and verification evidence: `/Users/matteo/dev/Vulcan/output/learn-illustration-batch-15-2026-11-02/`.

Mode: built-in Imagegen, one distinct call per asset. The approved bench-fold illustration establishes style only. Pillow only resizes, converts formats and composes review contact sheets; generated alpha is preserved. Research photographs are not distributed with the review gallery or app. Source details remain internal, per Matteo’s preference.

## Fidelity and limits

Ooni’s photograph actually shows dry yeast poured into a small weighing dish. The dish-support relationship is preserved; the dual-platform machine is generalized to a single small platform, with a blank display and no resolution claim. The scene does not specify or calculate a dose.

The starter-weighing scene is an explicit recomposition. Maurizio Leo’s photograph supplies an empty jar on a scale during a refreshment; his separate photographs supply the real spatula and starter consistency. It is not mislabelled as an original photograph of weighing Vulcan’s final dose. No starter-feeding ratio, readiness threshold or assessment of strength is inferred.

The two baking surfaces come from actual King Arthur Baking cordierite stone and Baking Steel photographs. The illustration omits logos and proprietary surface marks. It is not a controlled bake comparison, dimensional specification or measurement of conductivity, temperature or heating time.

The AQUALAB official manual supplies cup, well and lid geometry. Its photographed brown food sample is not relabelled as pizza dough. The drawing represents preparation with the chamber open; the caption explicitly says to close it to measure. No measurement value, sensor performance or storage-safety inference is invented.

The salt-in-water scene was researched but deferred because no sufficiently clear matching photograph was selected. Existing glossary, troubleshooting and preferment images remain unchanged. See the coverage audit for reuse opportunities rather than producing redundant scenes.

To rebuild exports and the review gallery from the preserved masters:

```sh
python3 design-assets/learn-illustrations-batch-15/build.py
```

Application tests and bundle budgets belong to a later integration. These independent design proposals are checked for image integrity, alpha, correct references/captions and responsive gallery layout.

The selected starter-weighing v2 puts the blade inside the jar, behind the front rim. Its caption explicitly says to remove the spatula before reading the weight. The first variant is retained internally at `variants/sourdough-dose-weighing-v1.png`.

Verified review: four 672 × 448 WebPs, 109,712 bytes combined. All four loaded on 1280px desktop and 390px mobile, useful captions, zero links and no horizontal overflow. Alpha and smooth surfaces inspected on light and dark backgrounds. Evidence: `verification.json`, `gallery-desktop-light.png`, `gallery-desktop-dark.png`, `gallery-mobile.png` in the output directory. No app source, existing artwork or live deployment was changed.
