# Learning illustrations — batch 8

Approved by Matteo in the current chat. Integrated into the five intended glossary entries; production publication is pending.

Five built-in image_gen assets cover W/alveograph, Falling Number, Maillard browning, sugar caramelization and starch gelatinization. Each has an inspected real photographic reference. `index.html` pairs each illustration with its source photo and proposed Italian caption; `manifest.json` records scope, limitations and retained masters; `prompts.json` records all prompts, including two discarded first versions.

The bread and caramel drawings were revised to remove granular surface rendering. Generated alpha is preserved; images are encoded as WebP at 672 × 448, quality 74, alpha quality 30, method 6. The previous 37 illustration assets are unchanged. The learning registry now maps these five additional glossary entries and the captions cover all seven supported languages.

Validation: check the Node 20 quality suite, production build, per-user performance budget, glossary contexts on desktop and mobile, then publish through the approved GitHub production workflow. The small-chunk merge target is 20,000 bytes instead of 6,000; the measured initial static JS graph is 143,101 bytes gzip instead of 144,148, with the new illustrations included in both comparisons. Limits and locale separation remain unchanged. Full receipts and live screenshots belong in `/Users/matteo/dev/Vulcan/output/learn-illustration-release-8-2026-10-31/`.

The `references/` thumbnails are for local comparison only; retain original source files outside the repository and exclude these thumbnails from any publication or public PR.
