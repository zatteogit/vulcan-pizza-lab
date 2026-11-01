# Learning illustrations — batch 10

Four approved illustrations integrated into the glossary and troubleshooting guide. Publication status is tracked separately in the release receipt. Branch `codex/learn-illustrations-batch-10`, based on main `194c574a0af3cab11362025c314a515e048817bb`.

- Manitoba: a generic flour sack and loose sample, grounded in the mill’s product photographs; appearance cannot identify strength.
- FODMAP: onion and garlic selected from Monash University’s photograph, as examples of fructan sources, not a complete food list or dietary recommendation.
- Histamine: a salami slice and actual finger contact from the Consorzio Cacciatore photograph. EFSA and a primary study support the food-category context, not any concentration in the pictured sample.
- P17: a compact serving scene recomposed from a King Arthur Baking photograph. It illustrates serving, not dryness or doneness.

The gallery provides numbered cards, original-image comparisons, proposed Italian captions, limits and a light/dark image background control. It also proposes reusing the already approved generic `home-oven` illustration for P11; the existing image is now mapped to P11 without creating new oven artwork.

`manifest.json` records sources, recomposition, limitations, master paths and hashes. `prompts.json` contains all four built-in image_gen generation prompts and two surface-simplification edits. All 46 prior app images remain byte-identical. The four new files are in `src/assets/learn/`; captions and credits are localized in all seven languages. The histamine caption also links EFSA.

Original photographs, selected masters and nonselected first versions remain in `/Users/matteo/dev/Vulcan/output/learn-illustration-batch-10-2026-11-01/`. The local comparison thumbnails in `references/` are ignored by Git. Source credits identify references; no source endorsement or open licence is asserted.

Node 20 typecheck, 134 test files (1763 passed, one skipped), all guards, production build and performance budget passed. Local glossary/troubleshooting and 390px mobile contexts checked. The chunk-merging minimum changes from 20000 to 30000: worst-case per-user JS falls from 570.2 to 569.7 KiB within the unchanged 570 KiB limit. This consolidates a shared chunk into the entry (about 6 KiB more initial static JS); locales and tools remain separate. The glossary’s remaining concepts (Arrhenius, proteolysis, app scores) need concept-specific evidence. Taste and smell cards must not turn into a visual diagnosis or raw-dough tasting illustration.
