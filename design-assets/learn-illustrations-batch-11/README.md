# Learning illustrations · Batch 11

Five approved proposals for the remaining glossary entries: Arrhenius, proteolysis, A-Score, F-Score and D-Score. The original review files below are preserved.

App integration adds five geometry-only SVGs in `src/assets/learn/`, a token-styled HTML diagram renderer, seven translated caption/label sets and cached reuse of the existing photo-grounded artwork. All 44 glossary entries now have a visual mapping; P06/P20 remain text-led. Source images are unchanged. Publication uses the main/test/production workflow; deployment and live evidence are recorded separately in `/Users/matteo/dev/Vulcan/output/learn-illustration-release-11-2026-11-01/`.

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

## Production integration checks

The app imports geometry-only SVGs and positions the existing cached WebPs over them. Captions and diagram-specific labels use the seven CMS message catalogs; existing CMS labels and locale number formatting are reused. Tests check engine/bar agreement, residue conservation, no baked text/base64 imagery, all 44 glossary mappings and decorative cards without nested links.

The existing 30,000-byte minimum chunk threshold and every performance limit remain unchanged. An explicit group consolidates learning pages, data and contextual explanations; `onlyExplicitManualChunks` keeps dependencies out of that manual group. React and Motion already load statically at startup; a single UI vendor shares their compression dictionary without adding startup modules. Node 20 measurements: common JS 468,108 bytes gzip; Japanese worst case 582,802 / 583,680 bytes (878 bytes headroom); CSS 73.1 / 74 KiB. Initial static JS is 148,740 bytes, versus 149,218 at the preceding release. The combined vendor is 97,812 / 102,400 bytes. Further additions still need fresh budget verification. Locale boundaries and tool exclusion checks pass. Runtime smoke checks cover the production build as well as dev.
