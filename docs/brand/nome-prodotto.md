# Nome del prodotto

Stato: attivo. Il nome resta «Vulcan» finché Matteo non sceglie quello nuovo.
Questo documento spiega dove sta il nome, come cambiarlo e cosa invece resta
«vulcan» anche dopo il cambio. Riferimenti dell'audit: VUL-BRAND-01…14.

## Dove sta

Il nome si scrive in un solo punto: `src/app/config/brand.ts`.

```ts
const NAME = "Vulcan";
export const BRAND = { name: NAME, fullName: `${NAME} Pizza Lab` } as const;
```

- `BRAND.name`: nome breve (wordmark, titoli dei documenti, frasi).
- `BRAND.fullName`: nome completo (`<title>`, manifest, `aria-label` del logo).
  Deriva da `NAME`: «Pizza Lab» è un descrittore fisso.

Il nome arriva nel resto dell'app per tre strade.

| Dove | Come si scrive | Chi lo risolve |
|---|---|---|
| `index.html` (`<title>`) e `public/site.webmanifest` (`name`, `short_name`) | `%BRAND_FULL_NAME%`, `%BRAND_NAME%` | `brandPlugin()` in `vite.config.ts`: `transformIndexHtml` per l'HTML; middleware in dev e `writeBundle` in build per il manifest |
| CMS: `cms-context.tsx` (italiano), `locales/*.ts`, `domain-i18n-defaults.ts`, `locales/domain-*.ts` | `{brand}`, `{brandFull}` | `CmsProvider`: `cms` ha i token risolti; `rawCms` li conserva per l'editor `/cms` |
| Cataloghi `i18n/ui-messages.it.ts` e `i18n/showcase-messages.it.ts` | `{brand}`, `{brandFull}` | `uiMessage()` e `showcaseMessage()`, dopo i segnaposto `{0}` |
| Codice: logo, wordmark della home, motore (`NO_PREFERENCE_SLOT`), `data/glossary-data.ts`, strumenti (`/dev`, `/design-system`) | `BRAND.name`, `BRAND.fullName` | import da `config/brand` |

`public/site.webmanifest` resta in `public/` ed è JSON valido anche con i
segnaposto: `ds:check` lo legge per `theme_color`. Eventuali meta tag futuri
(description, og:*) devono usare gli stessi segnaposto.

## Il test che lo protegge

`src/app/config/brand.test.ts` gira con `npm test`, quindi in `npm run verify`
e in CI. Fallisce se:

- una stringa dei sorgenti (letterale, template o testo JSX) contiene il nome
  corrente o un nome storico (`LEGACY_NAMES`) fuori da `brand.ts`;
- `index.html` o il manifest contengono il nome invece dei segnaposto;
- un token è scritto male (`{Brand}`, `{brandfull}`) o compare in un file che
  non passa dalla risoluzione (`TOKEN_FILES`);
- dopo la risoluzione resta un token in `CMS_DEFAULTS` o in un bundle lingua.

Commenti e identificatori tecnici non contano. Il confronto distingue le
maiuscole e ignora il nome seguito da una maiuscola: `vulcan_*`, `VulcanMark`
e `VULCAN_MARK_PATHS` passano; «Vulcans», «Vulcan’s», «Vulcanは» e
«Vulcan-Motto» no. Le eccezioni vanno in `ALLOWLIST` con il motivo (oggi è
vuota). Il test legge i file con `import.meta.glob` e `?raw`, perché
`@types/node` non è installato.

## Come cambiare il nome

1. In `src/app/config/brand.ts` cambia `NAME`.
2. In `src/app/config/brand.test.ts` aggiungi il nome precedente a
   `LEGACY_NAMES`, così non può tornare scritto a mano.
3. `npm run verify` e `npm run build`; controlla `<title>` in
   `dist/index.html` e `name`/`short_name` in `dist/site.webmanifest`.
4. Guarda a vista il wordmark della home e le frasi principali in tutte le
   lingue: un nome più lungo può cambiare l'impaginazione.
5. Valuta il marchio grafico (sezione più sotto).
6. Aggiorna i documenti vivi (README, CLAUDE.md, `guidelines/Guidelines.md`,
   `_bmad/config.toml`, configurazione degli agenti). I report storici restano
   come sono.

Non serve incrementare `LOCALE_BUNDLE_REV`: gli snapshot salvati contengono già
i token, non il nome.

Se il nuovo nome è una parola comune del dominio (per esempio «Forno»), il test
lo vieterebbe anche nelle frasi normali. In quel caso va deciso se vietare solo
i nomi storici e verificare i token, oppure tenere il divieto con eccezioni
in `ALLOWLIST`.

## Regole per i testi

- Nel CMS e nei cataloghi si usano `{brand}` e `{brandFull}`; nel codice
  `BRAND`. Mai il nome scritto.
- Le frasi devono funzionare con qualsiasi nome: niente articoli, generi,
  genitivi o elisioni che dipendono dal nome. Esempi già corretti:
  - de: «Vulcans Engine» → «die Engine von {brand}»;
  - pt: «ajudam o Vulcan a adaptar» → «ajudam a adaptar»; «motor do Vulcan» →
    «motor de {brand}»;
  - fr: «le moteur de Vulcan» → «le moteur {brand}»;
  - en: «Vulcan’s engine» → «the {brand} engine».
- L'editor `/cms` mostra e salva i valori con i token.

## Snapshot della lingua in localStorage

Chi usa una lingua diversa dall'italiano ha in `vulcan_cms` una copia
dell'intero bundle: evita il lampo dell'italiano all'avvio e prevale sui
default. `vulcan_cms_rev` registra la revisione del bundle da cui è stata
presa (`LOCALE_BUNDLE_REV` in `src/app/features/cms/locales/index.ts`).

All'avvio, se la lingua salvata non è l'italiano e la revisione è diversa o
manca, il `CmsProvider` ricarica il bundle corrente, come quando si cambia
lingua. Le modifiche CMS locali in quella lingua si perdono; un import
esplicito dall'editor registra la revisione corrente e non viene sostituito.

La revisione 1 porta i token al posto del nome scritto per esteso. Si
incrementa quando cambiano i testi dei bundle e gli snapshot già salvati vanno
sostituiti, non per rinominare il prodotto.

## Identificatori tecnici che restano «vulcan»

Non seguono il nome del prodotto. Rinominarli romperebbe dati già salvati nei
browser, guard, infrastruttura o URL. Il prefisso `vulcan` qui è un namespace
tecnico storico.

- Chiavi localStorage: `vulcan_cms`, `vulcan_cms_rev`, `vulcan_cook_session`,
  `vulcan_create_draft`, `vulcan_dark_mode` (letta anche dallo script
  anti-FOUC di `index.html`), `vulcan_debug_overlay_deactivated`,
  `vulcan_debug_overlay_enabled`, `vulcan_debug_registry`, `vulcan_dev_mode`,
  `vulcan_dietary`, `vulcan_equipment`, `vulcan_fav_styles`,
  `vulcan_location`, `vulcan_mixer`, `vulcan_mixers`, `vulcan_nerd_on`,
  `vulcan_onboarding_seen`, `vulcan_oven`, `vulcan_oven_pref`, `vulcan_ovens`,
  `vulcan_pantry`, `vulcan_profile_complete`, `vulcan_recipe_feedback`,
  `vulcan_saved_recipes`, `vulcan_show_beta`, `vulcan_skill_level`,
  `vulcan_styles_override`, `vulcan_theme`, `vulcan_theme_switcher`,
  `vulcan_unit_system`, `vulcan_view_mode`. Motivo: preferenze, ricette
  salvate e sessioni degli utenti.
- Eventi window: `vulcan:open-search`, `vulcan:start-cooking`,
  `vulcan:theme-change`, `vulcan_beta_toggle`, `vulcan_debug_toggle`.
- ID, classi e variabili CSS: `#vulcan-splash`, `vulcan-splash-ember`,
  `@keyframes vulcan-splash-breathe`, `.vulcan-hero*`,
  `.vulcan-logo__*`, `--vulcan-logo-size`, `#vulcan-debug-ui`,
  `.vulcan-debug-exclude`, `data-theme="vulcan"` (anteprima del tema
  predefinito). `scripts/visual-check.mjs` riconosce l'app da
  `id="vulcan-splash"`.
- Componenti e file: `VulcanMark`, `VulcanHero`, `VulcanVariant`,
  `VULCAN_MARK_PATHS`, `vulcan-logo.tsx`, `vulcan-hero.tsx` (letti per
  percorso da `scripts/ds-tier-guard.mjs` e `.design-sync/config.json`),
  `docs/brand/vulcan-mark-clean.svg`.
- Chiavi dei cataloghi i18n che contengono `vulcan-…`: sono hash del testo
  originale e il guard non le ricalcola.
- Infrastruttura: Worker `vulcan-pizza-lab` (determina l'URL pubblico
  `vulcan-pizza-lab.zatteo.workers.dev`), D1 `vulcan-annotations`, package
  `@zatteogit/vulcan`, `@vulcan/ds`, file `vulcan-debug-registry.json` e
  `vulcan-debug-config.json`, variabili `VULCAN_ANNOTATIONS_API/KEY`, tag di
  notifica `vulcan-cook`, slug del repository `zatteogit/vulcan-pizza-lab`.
- Nomi tecnici visibili solo negli strumenti: CSV scaricato
  `vulcan-feedback-AAAA-MM-GG.csv`, chiave di export `vulcan_feedback`,
  `utm_source=vulcan` negli URL Unsplash dello showcase.

URL pubblico, nome del Worker e nome del repository sono una decisione
infrastrutturale separata.

## Marchio grafico

Il mark è una «V» asimmetrica ricavata da una forma triangolare (fetta e
vulcano): vedi `vulcan-logo.tsx`, `public/favicon.svg`, le icone PNG e lo
splash in `index.html`. Le icone non contengono testo.

Un nome che non comincia per V richiede una decisione di design, non solo la
costante. Se si ridisegna, il guard `brand-asset-parity` di
`scripts/ds-tier-guard.mjs` obbliga ad aggiornare insieme favicon, splash e
`VULCAN_MARK_PATHS`.

## Punti aperti

- «Metrica originale Progetto {brand}» (glossario, Thickness Factor) oggi
  mantiene il testo con il token. Da decidere se riformularla, interpolarla
  con il nuovo nome o lasciarla riferita al progetto storico.
- Il sottotitolo «ci pensa {nome}» dello slot senza preferenza esiste solo in
  italiano: il CMS non ha `timeSlots.no_preference` (lacuna i18n precedente).
- Il build di produzione include, in chunk caricati su richiesta da `/dev`, il
  sorgente grezzo di `src/app`: il vecchio nome resta nei commenti serviti.
  La verifica si fa sui sorgenti (il test), non con grep su `dist`.
