# Impara · Lotto 12

Five approved candidates for practical preferment steps and ingredient weighing. The original local review is preserved below. Application integration adds the five assets to Impara; publication receipts and live verification are recorded separately in `/Users/matteo/dev/Vulcan/output/learn-illustration-release-12-2026-11-01/`. Existing application artwork is unchanged.

- [Review gallery](http://127.0.0.1:5196/design-assets/learn-illustrations-batch-12/review.html)
- Final assets: `assets/` (five alpha WebPs, 672 × 448).
- Exact selected prompts and reference roles: `prompts.json`.
- Authors, primary pages, source-photo URLs, recomposition, limits and checksums: `manifest.json`.
- Section audit and proposed reuse: `coverage.md`.

Generated using the built-in Imagegen tool, one call per distinct image. The weighing scene was regenerated as a static setup to avoid an ambiguous pouring stream. Original generations are retained at their default paths; selected 1536 × 1024 PNG masters and research photos are preserved in `/Users/matteo/dev/Vulcan/output/learn-illustration-batch-12-2026-11-01/`. Source photos are research references, not distributed application assets or gallery illustrations.

The hand-mixing photograph is a biga preparation photo. Its contact/gesture is reused for the autolyse composition, which follows Maurizio Leo's procedure; the source photograph is **not** described as showing flour and water alone. The biga-in-water composition depicts the photographed intermediate stage, rather than inventing an undocumented tearing gesture. No recipe doses, timings, instrument readings or maturity criteria are imported from the reference sites.

To repeat export and gallery generation from preserved masters:

```sh
python3 design-assets/learn-illustrations-batch-12/build.py
```

Pillow performs resize and format conversion only, preserving generated alpha. The apparent brown aura in the generator's display is predominantly colour stored in transparent pixels; actual alpha compositing on light and dark backgrounds is inspected separately. No creative image manipulation or background removal is done by Python.

Review verification: five images load at natural 672 × 448; five HTML captions; desktop 1280px and mobile 390px have no horizontal overflow. Light/dark screenshots and `verification.json` are in the output directory. Only independent design assets and documentation change, so application tests/build are deferred to integration, when the existing tight performance budget must also be checked. Captions and source credits will use the seven CMS locales at integration.

## Application integration

- The original consistency images remain in the preferment cards. Four new practical scenes accompany the relevant numbered steps; the approved covered-rest illustration is reused beside resting instructions. Recipe output cards retain their compact presentation.
- Generic flour weighing accompanies the arithmetic overview in Metodo. Selected disclosures reuse dough temperature, portion weighing, the alveograph, oven heat transfer and the localized A-score diagram.
- Flour technical details reuse the generic alveograph illustration with an explicit localized statement that it is not a measured result for the displayed flour. Manufacturer sources and field evidence remain separate.
- Six new caption/context strings are supplied in all seven CMS catalogs, with photographic and procedural source credits in HTML. Actual generation references, authors and recompositions remain in `manifest.json`.
- All 56 existing learning files are byte-for-byte unchanged. New assets are lazy-loaded alpha WebPs. The grouping of learning UI also includes flour detail, the learning path and its science sheet; no locale, drag code or extra static entry dependency is added. Existing min-chunk setting and performance limits are unchanged.
- Node 20 verification: 135 test files, 1767 passed / 1 skipped; token, semantic, architecture, i18n and dead-code guards pass. Production build/glass checks and the existing performance budget pass. Fresh output metrics and desktop/mobile screenshots are saved with the release evidence.
