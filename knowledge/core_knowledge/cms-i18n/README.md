# CMS e localizzazione
> Aggiornamento: 2026-07-13 | Stato: ✅ | File documentati: 24

## Sommario

Il CMS di Vulcan centralizza **tutti i testi user-facing**, pesi di raccomandazione, media, stringhe di dominio (glossario, troubleshooting, pre-fermenti, dietary), copy cucina/feedback e preferenze di formattazione in un unico schema tipizzato `CmsContent`. Il pattern è **override su default** (come `StylesOverrideContext`): `cms = deepMerge(CMS_DEFAULTS, overrides)` esposto da `useCms()`. La localizzazione è supportata da dizionari tipizzati all'interno di `src/app/i18n/`.

- **Default italiano**: `CMS_DEFAULTS` in `cms-context.tsx` (3266 righe, schema + default + registry campi CMS).
- **Altre lingue**: bundle completi in `locales/{en,es,de,fr,pt,ja}.ts` + dati dominio in `locales/domain-{lang}.ts`.
- **Nuovo modulo i18n tipizzato**: i dizionari in `src/app/i18n/` forniscono le stringhe di interfaccia (`ui-messages.it.ts`) e dello showcase (`showcase-messages.it.ts`) con logiche di interpolazione sicure (`interpolate.ts`).
- **Persistenza**: `localStorage` chiave `vulcan_cms` (oggetto JSON parziale, solo override).
- **UI admin**: `/cms` (`cms.tsx`, ~1320 righe) guidata da `CMS_SECTIONS` (~18 sezioni, centinaia di campi dot-path).
- **Formattazione**: `i18n.ts` con `t()`, `createFormatter()`, conversioni metric/imperial, copy temperatura/lunghezza e storage `vulcan_unit_system`.

## File chiave

| File | Righe (circa) | Ruolo |
|------|----------------|--------|
| `src/app/i18n/domain-contracts.ts` | 40 | Contratti e schemi tipizzati per i testi localizzati del dominio di Vulcan |
| `src/app/i18n/interpolate.ts` | 15 | Funzione pura per l'interpolazione delle variabili all'interno dei testi tradotti |
| `src/app/i18n/ui-messages.ts` | 50 | Interfacce e schemi per le stringhe di interfaccia utente |
| `src/app/i18n/ui-messages.it.ts` | 500 | Dizionario canonico italiano per i testi ed i messaggi dell'applicazione |
| `src/app/i18n/showcase-messages.it.ts` | 6000 | Dizionario esteso contenente tutte le stringhe necessarie allo showcase del design system |
| `src/app/features/cms/cms-context.tsx` | 3266 | Schema `CmsContent`, `CMS_DEFAULTS` con `cooking`, `misc`, `feedback`, `longDesc`/`tipNerd`, `CmsProvider`, merge, persistenza, rimozione pulita degli override ritornati a default (esportazioni secondarie inutilizzate rimosse) |
| `src/app/features/cms/i18n.ts` | 286 | `t()`, `createFormatter()`, `formatTemperatureCopy`, `formatLengthCopy`, conversioni metric/imperial, `vulcan_unit_system` |
| `src/app/features/cms/domain-i18n-defaults.ts` | 598 | Default IT: `PRE_FERMENT_DEFAULTS`, `DIETARY_I18N_DEFAULTS`, `TROUBLESHOOTING_I18N_DEFAULTS`, `GLOSSARY_TERMS_DEFAULTS` |
| `src/app/features/cms/locales/index.ts` | 88 | `LOCALE_BUNDLES`, `LOCALE_META`, `LOCALE_BCP47` |
| `src/app/features/cms/locales/en.ts` | 1362 | Bundle EN completo (`EN_LOCALE: CmsContent`) |
| `src/app/features/cms/locales/domain-en.ts` | 817 | Override dominio EN (pre-fermenti, dietary, troubleshooting, glossario) |
| `src/app/features/cms/locales/de.ts` | 1291 | Bundle DE (Tedesco) completo (`DE_LOCALE`) |
| `src/app/features/cms/locales/domain-de.ts` | 481 | Override dominio DE (Vorteig, Dietary, Troubleshooting, Glossary) |
| `src/app/features/cms/locales/es.ts` | 1258 | Bundle ES (Spagnolo) completo (`ES_LOCALE`) |
| `src/app/features/cms/locales/domain-es.ts` | 480 | Override dominio ES (Vorteig, Dietary, Troubleshooting, Glossary) |
| `src/app/features/cms/locales/fr.ts` | 1264 | Bundle FR (Francese) completo (`FR_LOCALE`) |
| `src/app/features/cms/locales/domain-fr.ts` | 480 | Override dominio FR (Vorteig, Dietary, Troubleshooting, Glossary) |
| `src/app/features/cms/locales/ja.ts` | 1427 | Bundle JA (Giapponese) completo (`JA_LOCALE`) |
| `src/app/features/cms/locales/domain-ja.ts` | 480 | Override dominio JA (Vorteig, Dietary, Troubleshooting, Glossary) |
| `src/app/features/cms/locales/pt.ts` | 1255 | Bundle PT (Portoghese) completo (`PT_LOCALE`) |
| `src/app/features/cms/locales/domain-pt.ts` | 480 | Override dominio PT (Vorteig, Dietary, Troubleshooting, Glossary) |
| `src/app/pages/cms.tsx` | 1320 | Editor: sezioni, import/export JSON, switch lingua, dark mode |

**Bundle lingua** (oltre EN): `es.ts`, `de.ts`, `fr.ts`, `pt.ts`, `ja.ts` + rispettivi `domain-*.ts` e moduli `src/app/i18n/`.

**Consumatori principali** (~20 moduli): `home.tsx`, `recipe-output.tsx`, `recipe-match-card.tsx`, `recipe.tsx` (`RecipeSetupPanel`/`MatchSummary`), `glossary.tsx`, `troubleshooting-panel.tsx`, `user-needs.tsx`, `search-overlay.tsx`, `app-shell.tsx`, `dietary-data.ts`, `troubleshooting-data.ts`, `glossary-data.ts`, `pre-ferment-guide.tsx`, ecc.

## Flusso dati

```mermaid
flowchart TD
  subgraph defaults
    IT[CMS_DEFAULTS — italiano hardcoded]
    DOM[domain-i18n-defaults.ts — merge in CMS_DEFAULTS]
  end
  subgraph storage
    LS[localStorage vulcan_cms]
  end
  subgraph runtime
    LOAD[loadCms — prima visita: detectBrowserLocale]
    MERGE[deepMerge CMS_DEFAULTS + overrides]
    CMS[useCms — cms, update, switchLocale, bcp47]
    FMT[createFormatter — locale + unit system]
  end
  subgraph ui
    APP[Componenti useCms]
    PAGE[/cms — CMS_SECTIONS + update path]
  end
  IT --> MERGE
  DOM --> IT
  LS --> LOAD --> MERGE
  MERGE --> CMS --> FMT
  CMS --> APP
  CMS --> PAGE
  PAGE -->|update path| LS
```

**Primo avvio**: se `vulcan_cms` assente, `detectBrowserLocale()` legge `navigator.languages`; se non è `it`, salva il bundle corrispondente (fallback `en`) e lo usa come override iniziale.

**Cambio lingua** (`switchLocale`):
- `it` → `resetAll` (solo default italiani).
- Altra lingua → **sostituisce interamente** gli override con il bundle (`{ ...bundle }`), non più `deepMerge(bundle, prev)` — fix per stringhe della lingua precedente che restavano attive.

**Campo singolo**: `update("hero.title_line1", value)` → `setByPath` su clone override → `saveCms`.

## Funzioni principali

| API | Scopo |
|-----|--------|
| `useCms()` | Hook: `cms`, `overrides`, `update`, `resetField`, `resetAll`, `importOverrides`, `exportJSON`, `isModified`, `modifiedCount`, `modifiedPaths`, `switchLocale`, `bcp47` |
| `CmsProvider` | Provider React; stato `overrides` da `loadCms()` |
| `deepMerge` / `deepDiffPaths` | Merge ricorsivo e diff per conteggio modifiche |
| `getByPath` / `setByPath` | Accesso dot-path (`ui.clipboardBalls`, `glossaryTerms.terms.w_alveograph.name`) |
| `detectBrowserLocale` | Auto-lingua al primo load |
| `t(template, vars)` | Interpolazione `{key}` |
| `createFormatter(ui, bcp47, unitSystem?)` | Formatter legato a `CmsUiStrings` + `Intl`; supporta grammi/ml/cm/mm/cm²/°C/%/pezzi e conversioni imperiali |
| `getPreferredUnitSystem` / `savePreferredUnitSystem` | Lettura/scrittura `vulcan_unit_system` (`metric` default, `imperial` opzionale) |
| `formatTemperatureCopy` / `formatLengthCopy` | Converte copy testuale con °C, cm e mm usando il formatter attivo |
| `getLocalizedTerm` / `getLocalizedIssue` | (in `glossary-data` / `troubleshooting-data`) overlay CMS su dati IT hardcoded |

**Tipi export rilevanti**: `LocaleId` (`it` \| `en` \| `es` \| `de` \| `fr` \| `pt` \| `ja`), `CmsContent`, `CmsUiStrings`, `CmsFieldDef`, `CmsSectionDef`, `CMS_DEFAULTS`, `CMS_SECTIONS`.

## Costanti e configurazione

| Chiave / costante | Valore | Note |
|-------------------|--------|------|
| `STORAGE_KEY` | `vulcan_cms` | JSON `Partial<CmsContent>`; commento header menziona prefisso `vulcan_cms_` ma la chiave effettiva è singola |
| `UNIT_SYSTEM_STORAGE_KEY` | `vulcan_unit_system` | Preferenza formatter `metric` / `imperial`, salvata dal profilo |
| `CMS_DEFAULTS.locale.id` | `"it"` | Italiano = baseline merge |
| `LOCALE_BUNDLES` | 6 lingue | `en`, `es`, `de`, `fr`, `pt`, `ja` (no `it` nel record) |
| `LOCALE_BCP47` | `it-IT`, `en-GB`, … | Passato a `createFormatter` e `toLocaleTimeString` |
| `CMS_SECTIONS` | ~18 sezioni | `locale`, `ui`, `filters`, `glossary`, `tips`, `hero`, `steps`, `sections`, `config`, `scoring`, `families`, `timeline`, `parametricTips`, `media`, `styleStrings`, `deviationStrings`, `engine`, … |

**Sezioni principali di `CmsContent`**: `ui`, `hero`, `steps`, `sections`, `timeSlots`, `ovenPresets`, `skillLevels`, `families`, `scoreDimensions`, `recommendationWeights`, `media`, `result`, `cooking`, `misc`, `feedback`, `engineMessages`, `timelineLabels` (con `longDesc`, `tipBeginner`, `tipNerd`), `styleDescriptions`, `styleChars`, `profile`, `pages`, `configurator`, `preFerment`, `dietaryI18n`, `troubleshootingI18n`, `glossaryTerms`.

**Messaggi motore**: `cms.engineMessages` — chiavi come `tip.waterTempCold`; usati da `resolveEngineMsgs` nei consumatori ricetta e come template diretti in `recipe-output`.

## Guard rail e vincoli

- **Solo override in storage**: non si persiste l’intero `CmsContent`, solo delta utente (o bundle lingua intero dopo `switchLocale`).
- **Ordinamento Passi Profilo**: Le chiavi dei passi del profilo sono state riallineate per riflettere la sequenza corretta: `locationStep` diventa il passo "05 — Posizione" e `prefsStep` diventa il passo "06 — Preferenze", allineandosi con l'ordine dell'onboarding.
- **Switch lingua resetta override numerici custom** (pesi, URL) — comportamento intenzionale post-fix merge.
- **Unit system separato dal CMS**: la scelta metrica/imperiale non è un override CMS, ma una preferenza profilo salvata in `vulcan_unit_system`; i componenti devono usare `createFormatter` per mostrare unità.
- **Rimozione degli Override a Default**: La funzione `update` ora rimuove ricorsivamente le chiavi del dot-path dall'oggetto `overrides` locale e le cancella se il loro valore riallinea con quello predefinito in `CMS_DEFAULTS`, evitando il salvataggio di duplicati non modificati.
- **Etichetta Farcitura (cooking.fillingTitle)**: Introdotto il campo `fillingTitle` nella sezione `cooking` del CMS (con default italiano "Farcitura" e inglese "Filling") per supportare stili con layout farcito o ripieno.
- **Array**: `deepMerge` non fa merge profondo su array — sostituzione intera.
- **`RootLayout`** duplica logica dark mode obsoleta; provider attivi sono in **`AppShell`**.
- Consumatori devono usare `cms.*` o getter localizzati; dati strutturali (ID stili, ID issue `P01`…) restano nei file `*-data.ts`.
- **Esportazioni Pulite**: Le interfacce e i helper interni non più importati esternamente in `cms-context.tsx` sono stati resi privati al modulo rimuovendo la keyword `export`.
- **Localizzazione delle Diagnostiche di Match e Azioni**: Le stringhe di testo per le diagnostiche a due livelli, le rationales dell'ottimizzatore, i toni di match relazionali (`matchTones`), la lista di ingredienti/farine mancanti (`needFlour`) e le azioni della card match (es. torna all'originale, ottimizza, rendila possibile, salva la mia versione) sono state interamente integrate all'interno dello schema `CmsContent` (`cms-context.tsx`) e tradotte nei bundle multilingua (`en.ts`, `de.ts`, `ja.ts` etc.), rimuovendo ogni copy hardcoded.

## Bug noti e fix

| Problema | Fix nel codice |
|----------|----------------|
| Cambio lingua lasciava stringhe della lingua precedente | `switchLocale` sostituisce `overrides` con copia del bundle, non `deepMerge(bundle, prev)` |
| Header commento `vulcan_cms_` vs chiave reale | Documentare: chiave effettiva `vulcan_cms` |
| Legacy dark mode `true`/`false` in `AppShell` | Migrazione a `ThemeMode` `light` \| `dark` \| `auto` su `vulcan_dark_mode` |

## Sezioni Cucina, Misc e Feedback

La sezione `cooking` contiene il copy operativo per `RecipeView`, `RecipeSectionTabs`, `RecipeOutput`, `CookSessionProvider`, `ActiveCookWidget` e `CookingMode`: tab Ricetta/Procedimento, CTA avvio/ripresa, countdown, notifiche, conferme di sostituzione sessione, label comfort time e testi Regola 55.

La sezione `misc` raccoglie stringhe UI prima hard-coded in componenti trasversali: smart link, varianti, hero Learn/Explore, spiegazioni score, label tecniche e restore CMS.

La sezione `feedback` alimenta il form post-cottura progressivo (`recipe-feedback.tsx`): domanda iniziale, esito, rating, issue, note e messaggio "la prossima volta" con correzioni derivate dagli issue selezionati.
