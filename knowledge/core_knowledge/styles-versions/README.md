# Stili, versioni e override
> Aggiornamento: 2026-07-01 | Stato: ✅ | File documentati: 12

## Sommario

Gli **stili canonici** vivono in `STYLES_DB` (`pizza-engine.ts`, **28 stili**). Questo capitolo aggiunge:

- **Versioni interpretative** (`StyleVersion`) — preset parametri + range per slider/score, skill-aware. Ora supportano anche un blocco `ranges` specifico a livello di versione impasto (es. W farina e idratazione localizzati) che sovrascrive i range dello stile genitore.
- **Override runtime** — intero DB sostituibile via `localStorage` (editor dev).
- **UI scoperta stile** — raccomandazioni, sheet dettaglio, foto editoriali.

La versione attiva fluisce in `generateRecipe` come `versionOverrides` e nei range del configurator (Smart Link, adaptive hints, autenticità).

## File chiave

| File | Ruolo |
|------|--------|
| `src/app/data/style-versions.ts` | `STYLE_VERSIONS`, API `getVersions`, `getDefaultVersion`, `getVersionById` |
| `src/app/data/style-photos.ts` | Fonte canonica delle foto locali per 28 stili e dei 6 video hero serviti da `public/videos/` |
| `src/app/context/styles-override-context.tsx` | Provider React: `effectiveStyles = override ?? STYLES_DB`, persistenza `vulcan_styles_override` |
| `src/app/features/recipe/recommended-styles.tsx` | `recommendStyles` + filtri; re-export `STYLE_PHOTOS`; card con `ScoreRing` |
| `src/app/features/recipe/style-detail-sheet.tsx` | Bottom sheet portal: foto poster, video blur-in se disponibile, range stile, deviazione, parametriche, CTA genera |
| `src/app/pages/explore.tsx` | Route `/explore` (Tab Scopri): ricette iconiche, preferiti, filtri famiglia e catalogo completo 28 stili |
| `src/app/features/dev-tools/style-editor-tab.tsx` | DevTools: editor CRUD stili dev con componente `ImageInput` per caricamento/gestione file grafici locali (Base64) o URL esterni |
| `src/app/data/interpretation-library.ts` | Database delle Interpretazioni d'Autore: 14 voci tra Maestri, Pizzerie, Community e Disciplinari con parameter overrides e narrativa |
| `src/app/data/signature-recipes.ts` | Database delle Ricette Iconiche: 12 combinazioni pre-impostate di Stile e Topping (rimossi gli helper `getSignatureRecipesByFamily`/`getSignatureRecipeById`) |
| `src/app/features/recipe/tilt-card.tsx` | Componente UI per l'effetto di inclinazione 3D interattivo e riflesso speculare sensibile al puntatore del mouse delle card degli stili |
| `src/app/features/recipe/interpretation-narrative-card.tsx` | Card narrativa dell'interpretazione attiva (maestro/disciplinare/community) con storia e dettagli storici |

**Consumer principali:** `recipe.tsx`, `home.tsx`, `explore.tsx` (`useStylesOverride`); `recipe-configurator.tsx` (`getVersions`, range versione).

## Flusso dati

```mermaid
flowchart TD
  DB[STYLES_DB pizza-engine] --> CTX[StylesOverrideProvider]
  LS[(vulcan_styles_override)] --> CTX
  CTX --> ES[effectiveStyles]
  ES --> REC[RecipePage / Home / Explore]
  SV[STYLE_VERSIONS] --> GV[getVersions styleId]
  GV --> CHIP[VersionChips]
  CHIP --> AVP[applyVersionParams]
  AVP --> ST[state custom H/W/F/...]
  ST --> GR[generateRecipe versionOverrides]
  AVP --> RNG[Slider range = version.ranges ?? style.dough.*]
  ED[StyleEditorTab] -->|setStylesOverride| LS
```

1. **Selezione versione:** `getDefaultVersion(styleId, skillLevel)` all’apertura; URL `?v=` su recipe page; chip chiamano `applyVersionParams`.
2. **Override motore:** `versionOverrides = { ...activeVersion.ranges, dough_weight_g? }` passato a `generateRecipe` → clone stile con range sostituiti (`versionRanges` in motore).
3. **Override DB:** `StyleEditorTab` clona mappa stili → `setStylesOverride` → tutte le pagine leggono `effectiveStyles`.

## Funzioni principali

| Simbolo | File | Descrizione |
|---------|------|-------------|
| `getVersions(styleId)` | `style-versions.ts` | `STYLE_VERSIONS[id] ?? []` |
| `getVersionById(id)` | `style-versions.ts` | Ricerca globale su tutti gli stili |
| `getDefaultVersion(styleId, skill)` | `style-versions.ts` | Match `skill_hint`; fallback distanza minima, preferisce livello inferiore |
| `applyVersionParams` | `recipe-configurator.tsx` | Scrive `version.params` nei setter |
| `useStylesOverride` | `styles-override-context.tsx` | Hook contesto |
| `StylesOverrideProvider` | `styles-override-context.tsx` | Load/save `localStorage` al mount |
| `recommendStyles` | `pizza-engine` via `recommended-styles.tsx` | Ranking stili vs `UserConstraints` |
| `StyleDetailSheet` | `style-detail-sheet.tsx` | Dettaglio + `onGenerate` (home wizard) |
| `StyleEditorTab` | `style-editor-tab.tsx` | CRUD stili dev (~1476+ righe) |

## Costanti e configurazione

| Costante | Dettaglio |
|----------|-----------|
| `STYLE_VERSIONS` | Record `styleId → StyleVersion[]` — versioni interpretative per gli stili supportati |
| `StyleVersion.skill_hint` | `SkillLevel` 1–4 per default automatico |
| `fermentation_temp_c` | Discreti: `4` (frigo), `12` (fresco), `22` (ambiente) |
| `dough_weight_g` | Opzionale — override peso teglia (es. Bonci Leggerissima 600 g, Sottile 600 g) |
| `STORAGE_KEY` override | `vulcan_styles_override` |
| `STYLE_PHOTOS` | **28 asset locali** in `src/assets/*.png` per `style.id`; fonte unica importata da `style-photos.ts` |
| `STYLE_VIDEOS` | **6 video** in `public/videos/` (`napoletana_stg`, `chicago_deep`, `detroit`, `new_york`, `focaccia_genovese`, `focaccia_barese`) usati nel detail sheet |
| `TIER_META` | `perfect` / `good` / … per sezioni raccomandazione |

**Stili senza versioni:** `getVersions` → `[]`; chip nascoste; range solo da `PizzaStyle.dough.*`.

## Guard rail e vincoli

- Override: oggetto vuoto o parse fallito → ignorato, si usa `STYLES_DB`.
- `getDefaultVersion`: senza versioni → `null`; recipe/home usano centro range stile.
- **Soglia idratazione skill-aware** (`recommended-styles.tsx`): il warning "idratazione impegnativa" si attiva a >70% per skill 1 (principiante) e >85% per skill 2 (intermedio); skill 3–4 non ricevono mai il warning. Prima era una soglia fissa >70% per tutti i livelli skill ≤ 2.
- Range versione **restringono** slider e penalità autenticità, non sostituiscono il record stile in `STYLES_DB`.
- `clearOverride` (home reset + dev) ripristina DB canonico.
- **Rendering Robusto Varianti Autore:** `StyleDetailSheet` effettua il rendering condizionale delle varianti d'autore (`compatVariants`) verificando se l'emoji associata è presente o meno (evitando spazi vuoti o gap grafici dovuti alla rimozione delle emoji dalle tabelle tassonomiche).
- **ImageInput in Dev**: Lo `StyleEditorTab` dispone del componente `ImageInput` che consente di caricare immagini dal disco (convertite in Base64 DataURL) o inserire URL Web, salvando il risultato in `style.image` per le card dello stile.
- **Media locali canonici**: `STYLE_PHOTOS` non deve più vivere duplicato in componenti UI; `recommended-styles.tsx` lo re-esporta solo per compatibilità. I video restano lazy via tag `<video>` e hanno fallback automatico alla foto poster.
- **Persistenza Filtri in ExplorePage**: La visualizzazione attiva e i filtri di famiglia della pagina Explore sono serializzati nei parametri URL (`view` e `family`). La navigazione verso una ricetta passa lo stato `exploreBackTo` per permettere al pulsante indietro della scheda ricetta di ripristinare esattamente lo stato della navigazione.
- **Asset Grafici Locali**: Le ricette signature in `signature-recipes.ts` importano ed utilizzano immagini reali `.jpg` dal disco al posto del vecchio fallback `"placeholder"`.
- **Visualizzazione del match e del margine ottimizzabile in Explore**: In `ExplorePage`, ciascuna card di stile mostra il match canonico ($M_c$) sul proprio forno all'interno di uno `ScoreRing`. Inoltre, se ottimizzando si può ottenere un incremento reale del punteggio (headroom $\ge 8$), viene mostrata una pillola verde con `ChevronUp +Δ` indicante il margine di ottimizzazione.
- **Visualizzazione del punteggio ottimizzato in RecommendedStyles**: Per riflettere il punteggio effettivo che l'utente può ottenere con i suoi vincoli, le card degli stili raccomandati nella Home mostrano sul badge `ScoreRing` il composite score della ricetta ottimizzata per il loro setup (calcolato tramite `optimizeRecipe` con i pesi del CMS), mentre il ranking e il tier restano calcolati sulla compatibilità.
- `StyleEditorTab` + live sync: ogni modifica può riscrivere `localStorage` — solo ambiente dev.
- `SyncTab` esclude `src/app/components/ui/` dal bundle.
- `STYLE_VERSIONS` e `VersionRanges` in `style-versions.ts` sono ora dettagli interni (non esportati). L'accesso alle versioni avviene esclusivamente tramite le API pubbliche `getVersions`, `getVersionById` e `getDefaultVersion`.
- `StylesOverrideContext` in `styles-override-context.tsx` è ora un dettaglio interno (non esportato) e consumato unicamente all'interno del modulo.

## Integrazioni e Varianti d'Autore Implementate (Sprint 11)

Le seguenti varianti tecniche avanzate e stili con layout speciale sono stati integrati pienamente in `STYLE_VERSIONS` ed in `STYLES_DB`:
- **Pizza Baciata (`pizza_baciata`)**: Gestione geometrica dei panetti sdoppiati (2 panetti gemelli per unità) e timeline con step speciali per la stesura sovrapposta con spennellatura d'olio, cottura in bianco, sdoppiamento post-bake e farcitura a freddo.
- **Pizza Spaccata (`pizza_spaccata`)**: Stile romano cotto in bianco come base singola, spaccato a metà dopo la cottura e farcito a freddo. Eredita le versioni d'autore (tradizionale/Bonci) e ospita la ricetta signature con patate e porchetta in crosta alla Sancho.
- **Ciaccino Senese (`ciaccino_senese`)**: Focaccia ripiena con layout `closed_stuffed`. Richiede due dischi sigillati con ripieno pre-bake e impasto caratteristico a base di strutto (`lard`).

## Sistema di Interpretazioni d'Autore (Sprint 12 Fase 4)

La libreria `interpretation-library.ts` (472 righe) introduce una ricca astrazione modulare sopra le versioni interpretative:
- **Quattro Categorie di Interpretazione**: Mappa le preparazioni secondo chi le ha codificate:
  - `disciplinare` (3): `avpn_disciplinare`, `igp_recco`, `apiter_teglia`.
  - `master` (8): `bonci_pizzarium`, `pepe_caiazzo`, `martucci_caserta`, `sorbillo_napoli`, `bosco_aria_di_pane`, `capuano_napoli`, `bianco_phoenix`, `forkish_portland`.
  - `pizzeria` (1): `da_michele_napoli`.
  - `community` (2): `malati_di_pizza`, `confraternita_pinsa`.
- **Parameter Overrides e Iniezione**: Consente ad ogni interpretazione di sovrascrivere selettivamente i parametri fisici dell'impasto (idratazione, W farina, P/L, ore e temperatura di fermentazione, uso di pre-fermento o override dell'impasto tramite `impasto_ref`).
- **Narrativa e Story Card**: Ogni interpretazione è corredata da dati storici, anno di codificazione, biografia, link al sito originale e una "firma tecnica". La selezione UI passa dal `PremiumSelect` in `RecipeSetupPanel`, e la card narrativa `InterpretationNarrativeCard` viene visualizzata in primo piano sotto la card match.
- **Visualizzazione Origine e Layout Safe nelle Card**: Nelle card stile (`StyleCard` in `recommended-styles.tsx` e `StyleCatalogCard` in `explore.tsx`), l'etichetta sotto-titolo visualizza solo la città di origine (`shortOrigin` es. `"ROMA"`) invece del formato famiglia + origine, ed ha regole di troncamento (`whiteSpace: "nowrap"`, `overflow: "hidden"`, `textOverflow: "ellipsis"`) per evitare rotture di layout.
- **Filtro Famiglie Non Esclusivo**: Gli stili possono ora appartenere a più famiglie (es. Canotto ha primaria `napoletana` e secondaria `contemporanea`). I filtri e i conteggi badge nelle pagine Scopri e Consigliati usano `styleMatchesFamily` per includere gli stili nelle ricerche di tutte le rispettive famiglie.
- **Pulizia dead code 2026-06-19**: il file `interpretation-chips.tsx` non è più presente; il dato resta canonico in `interpretation-library.ts`.

## Bug noti e fix

| Area | Nota |
|------|------|
| Versioni vs skill profilo | Se `skill_level` cambia dopo selezione, versione attiva non si riallinea automaticamente finché non si riseleziona stile o chip |
| `getVersionById` globale | ID versione deve essere univoco tra stili (es. `bonci_casalingo` vs altri) |
| Override + CMS | Override stili non sincronizza automaticamente testi CMS (`styleDescriptions`) |
| ADV-04 (poolish vs biga) | Fix motore: tipo pre-fermento da `process_type` — vedi `feedback-store` |
| Editor dev | Modifiche errate a `PizzaStyle` possono rompere `generateRecipe` senza validazione schema runtime |

**Integrazione recipe-flow:** documentata in [recipe-flow](../recipe-flow/README.md) (`RecipeSetupPanel`, `PremiumSelect`, `versionOverrides` in `useMemo`).

## Ricette Iconiche e Deep-Linking (Sprint 12 Fase 5)

La libreria `signature-recipes.ts` introduce il concetto di "Ricette Iconiche" per arricchire la scoperta culinaria dell'utente con combinazioni di grande impatto gastronomico:
- **Astrazione di Deep-Linking**: Sotto al cofano, le ricette iconiche non richiedono motori procedurali separati. Esse agiscono come deep-links intelligenti che reindirizzano l'utente alla pagina principale della ricetta dello stile genitore (`style_id`) iniettando automaticamente il condimento pre-selezionato tramite il parametro di query `?topping=<concept_id>`.
- **Interfaccia SignatureRecipe**: Mappa proprietà avanzate: nome, descrizione narrativa, emoji, eventuale override della fotografia di copertina (`photo`), stile di base, topping associato, famiglia cached e tag di occasione (es. `"street food"`, `"comfort"`).
- **12 Ricette Selezionate**: Il database pre-imposta 12 piatti iconici che rappresentano la tradizione e l'evoluzione della pizza italiana ed estera (es. *Margherita Verace AVPN*, *Patate e Porchetta alla Baciata*, *Mortazza alla Pala Romana*, *Scrocchiarella Boscaiola*, *Detroit Pepperoni*, *Focaccia di Recco col Formaggio IGP*).
- **Lookup e Filtro**: La UI consuma direttamente `SIGNATURE_RECIPES` per visualizzare ed esplorare le combinazioni, delegando la ricerca al catalogo globale dell'applicazione (rimossi gli helper `getSignatureRecipesByFamily` e `getSignatureRecipeById` perché inutilizzati).

## Visual Depth & Interactive Tilt Card

Introdotta a giugno 2026 come firma estetica e visiva dell'applicazione, la `TiltCard` fornisce un effetto tridimensionale di profondità e interazione dinamica alle card degli stili all'interno del catalogo raccomandazioni (`recommended-styles.tsx`), così come alle card catalogo stili e ricette iconiche presenti nella pagina Scopri (`explore.tsx`).

### 1. Comportamento e Inclinazione 3D
Il componente racchiude il suo contenuto in un contenitore tridimensionale con una prospettiva fissa impostata a `perspective: 900` e sfrutta iMotionValue e useSpring di Framer Motion:
- **Calcolo del puntatore**: All'interazione del mouse/puntatore, ricava la posizione X/Y del cursore rispetto al centro geometrico della card (in una scala normalizzata da `-0.5` a `0.5`).
- **Inclinazione morbida**: Questi valori controllano la rotazione degli assi `rotateX` e `rotateY` con un'inclinazione controllata limitata a un massimo di **6 gradi** (`maxTilt = 6`), smorzata da uno spring configurato per elasticità (`stiffness: 260`, `damping: 22`, `mass: 0.6`).

### 2. Glare Speculare Caldo
Per simulare la rifrazione della luce e dare una sensazione premium di "fisicità":
- Viene renderizzato un overlay assoluto contenente un gradiente radiale a bagliore caldo (`rgba(255,214,170,0.16)`) sovrapposto alle foto editoriali.
- La posizione del gradiente (`glareX`, `glareY`) si sposta linearmente dall'asse 25% al 75% coordinandosi al movimento del mouse, mentre la sua opacità sfuma morbidamente a zero quando il puntatore lascia la card.

### 3. Accessibilità e Ottimizzazioni (a11y)
- **Dispositivi Touch**: L'inclinazione 3D e il riflesso glare vengono automaticamente ignorati per i puntatori di tipo `touch` per evitare comportamenti grafici erratici su schermi mobili.
- **Riduzione del Movimento**: Il componente si interfaccia con `useReducedMotion()`. Se l'utente ha impostato le preferenze di sistema per ridurre il movimento, l'inclinazione dinamica e il riflesso glare vengono disattivati, eseguendo il fallback a un contenitore `div` statico standard non animato.

## Media Locali e Video Hero

`style-photos.ts` è il registro visuale canonico. Importa 28 PNG da `src/assets/` e li espone come `STYLE_PHOTOS`, così Explore, Home, Recipe Detail e Recommended Styles usano le stesse immagini senza dipendere da URL remoti.

`STYLE_VIDEOS` abilita una transizione foto → video in `StyleDetailSheet`: il poster resta sempre visibile, mentre il video parte muted/looped/playsInline e sfuma sopra la foto solo per gli stili con asset curato. Gli altri stili mantengono la sola foto locale.
