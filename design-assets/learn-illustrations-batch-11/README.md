# Learning illustrations · Batch 11

Local review proposals for the five remaining glossary entries: Arrhenius, proteolysis, A-Score, F-Score and D-Score. No application integration or publication in this batch.

Open `review.html` through the existing Vite server at `/design-assets/learn-illustrations-batch-11/review.html`. The portable copy is in `/Users/matteo/dev/Vulcan/output/learn-illustration-batch-11-2026-11-01/`.

## Method and sources

Original SVG geometry, with Matplotlib for the conventional linearized Arrhenius plot. The score diagrams reuse already approved, photo-grounded artwork without modifying it. No new AI-generated bitmap, scientific photograph, measurement or molecular structure is claimed.

The Arrhenius plate follows IUPAC/Purdue and shows a symbolic negative slope for positive activation energy, fixed A/Ea, with no numeric axes or experimental dataset. It is explicitly distinguished from Vulcan's piecewise Q10 model.

The proteolysis plate follows GO:0006508 and Thiele et al. (2004). Its nine conventional residues are conserved, in order, into 4 + 4 + 1; these are not atoms, a real gluten sequence or proof of a clinical outcome.

A/F criterion weights are captured from `scoreModelFacts()` at base commit `26e0ea995d5918eeb0b3a0f19bfac6294e62dae1`. The bar is a weighting diagram, not a sample recipe score. A includes subsequent caps and thermal rules. F is separate from the feasibility verdict; the composite's 39-point ceiling is not presented as an F-score ceiling. D maps inputs for leavened dough without inventing contribution weights or an output value.

`manifest.json` records sources, existing-artwork references, checksums, reuse and scope. The biga reference remains attributed to Rebecca Siegel, CC BY 2.0, with its license link in the gallery. Existing source artwork is preserved.

## Reproduce

From repository root:

```sh
npx --yes --package=node@20 --call 'node node_modules/tsx/dist/cli.mjs design-assets/learn-illustrations-batch-11/capture-facts.ts'
python3 design-assets/learn-illustrations-batch-11/build.py
```

Python requires Matplotlib. `capture-facts.ts` captures the current HEAD/source hashes; the committed snapshot identifies the reviewed base, so inspect source drift before rebuilding from a later commit.

All labels, formulas and credits are selectable HTML. Localize them through the established CMS/catalog route on integration. Review SVGs embed existing WebPs for portability; application integration should reference the existing cached assets rather than ship duplicated base64 payloads.

## Verification

- Engine source hashes matched the snapshot.
- Parsed SVGs: 9 residues preserved in color order; A/F bar lengths match engine weights and total 100%; all five SVGs parse with no visible text nodes.
- Actual IAB render: all five assets loaded; desktop and 390px mobile without horizontal overflow or labels outside their figures.
- Light and dark figure backgrounds inspected; output labels on filled D boxes retain dark ink.
- Screenshots: `desktop.png`, `mobile.png`, `dark.png`, `preview.png` in the output directory above.
- Application tests/build were not repeated: only independent review assets and documentation changed.

P06 and P20 remain text-led: an illustration cannot establish a taste/smell diagnosis.
