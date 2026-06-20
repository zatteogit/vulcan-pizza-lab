# Piano di interventi — Vulcan Pizza Lab

> Tradotto dal report UX/contenuti in piano operativo, organizzato per workstream e priorità (P0→P4).
> Per ogni voce: *problema → intervento → dove → criteri di accettazione → dimensione*.

## Come leggere
- **P0** = blocca la fiducia (prima di ogni rifinitura). **P1** = sicurezza contenuti. **P2** = chiarezza UX. **P3** = coerenza visiva. **P4** = evoluzione.
- "Dove" = file/componenti reali; "❓verifica" = serve indagine.
- Dimensione: S (≤mezza giornata), M (1–2 gg), L (settimana+), XL (workstream).

## Stato avanzamento
- ✅ **M1 — Stabilità (P0): COMPLETATO** — A1, A2, A3, A4, A5, A6, B0 (+ fix °C°C). `tsc` a 0.
- ⬜ M2 — Contenuti sicuri (P1): B3 → B1/B2/B4. ⚠️ dipende da fonti tecniche.
- 🔶 **M3 — Chiarezza (P2): essenzialmente completo.** Fatte le voci genuinamente incomplete (C1, C2, C3, C4, C5, C7, C11); C8/C9/C12 risultati già in gran parte implementati (moot); C6/C10 già in buona forma. Restano solo rifiniture opzionali.
- ⬜ M4 — Coerenza (P3): D1–D7.
- ⬜ M5 — Evoluzione (P4): E1–E3.

---

## WORKSTREAM A — Affidabilità interattiva (P0) ✅
- **INT‑A1** ✅ Selezione condimenti rotta — `recipe-output.tsx` (`CondimentChoiceStrip` + sezione Condimento + step timeline). 4 livelli separati; click = solo cambio topping.
- **INT‑A2** ✅ Slider marker fuori posizione — `recipe-configurator.tsx` `GradientSlider` (era `var(--space-px,1%)`→`%`).
- **INT‑A3** ✅ Sticky su tablet — `recipe-view.tsx` `stickyTop` 16→64 senza sticky header.
- **INT‑A4** ✅ Immagini/fallback — `ImageWithFallback` skeleton + fallback editoriale.
- **INT‑A5** ✅ Markdown grezzo — `explore.tsx` `**…**`→`<strong>`.
- **INT‑A6** ✅ Tab Explore vuote — `explore.tsx` chip a count 0 nascosti + empty-state `misc.noStyleInFamily`.

## WORKSTREAM B — Accuratezza tecnica contenuti (P0/P1)
Tutto in `pizza-engine.ts` (`STYLES_DB`), `topping-library.ts`, `parametric-databases.ts`.

- **INT‑B0** ✅ (P0, S) Dati divergenti Napoletana STG — consultazione ora default a forno/temp standard dello stile (`recipe.tsx`).
- **INT‑B0bis** ✅ FALSO ALLARME — il "64%" su Detroit era un artefatto dell'animazione count-up catturato a metà transizione SPA. Con hard-load l'idratazione è **74%** (dentro 68–78%). Nessun bug dati. (Nota minore: durante le transizioni tra stili il numero animato attraversa valori intermedi fuori range — puramente cosmetico.)
- **INT‑B1** 🔶 (P1, L) Topping per-stile (de-genericizzazione) — *in corso*. Creati condimenti regionali autentici per **Sfincione** (passata+cipolla, caciocavallo, acciughe, pangrattato tostato), **Focaccia Barese** (pomodorini freschi, olive baresane, origano — non più "marinara") e **Fugazzeta** (mozzarella interna + cipolla in superficie — non più "bianca"): nuovi `ToppingConcept` + `ToppingRecipe` con grammature e assembly in `topping-library.ts`, `default_topping_ref` corretti. Restano da de-genericizzare i condimenti comuni condivisi tra stili.
- **INT‑B2** 🔶 (P0/P1) Ricette critiche — *quasi completo: 9/10 voci chiuse; resta solo lo split "pizza fritta chiusa" + foto*:
  | Ricetta | Correzione | Prio | Stato |
  |---|---|---|---|
  | Focaccia di Recco | togliere lievito, EVO impasto, acqua 30°C | P0 | ✅ completo: yeast=0 (flag `unleavened`), EVO impasto (olio base sempre conteggiato), acqua 30°C, + versione `recco_igp` W190→W320 stale corretta |
  | Pinsa Romana | mix frumento/soia/riso con grammature | P0 | ✅ campo `flour_blend` + breakdown in output (↳ frumento 70% · soia 15% · riso 15% in grammi) |
  | Pizza Fritta/Montanara | distinguere fritta vs montanara; topping non-margherita; T frittura 180-190°C; foto | P0 | 🔶 topping montanara creato (pomodoro/ricotta/pecorino/basilico a crudo dopo frittura) + T frittura 180-190°C; ⬜ split "fritta chiusa" come stile separato + foto corretta |
  | Focaccia Barese | pomodorini freschi (non San Marzano); olive; grammature | P0 | ✅ topping creato (pomodorini/olive baresane/origano) |
  | Fugazzeta | mozzarella tra due strati + cipolla sopra; grammature | P0 | ✅ topping creato (mozzarella interna + cipolla) |
  | Sfincione | caciocavallo/acciughe/cipolla/pangrattato; grammature; T cottura | P1 | ✅ topping creato + params auditati |
  | Chicago Deep Dish | ordine assemblaggio; salsa sopra | P1 | ✅ topping creato (mozzarella sul fondo → ripieno → salsa a pezzi + parmigiano sopra) |
  | Detroit | cheese crown ai bordi prima della salsa; Wisconsin brick | P1 | ✅ topping creato (brick Wisconsin fino ai bordi + racing stripes di salsa sopra) |
  | New York | Pecorino vs Parmigiano; zucchero in salsa | P2 | ✅ variante NY (pizzico di zucchero in salsa + Pecorino Romano) |
  | Teglia Romana | tempo cottura nel range; pieghe più specifiche | P1 | ✅ cook time in range (B0) + pieghe specifiche ("3 giri stretch & fold a ~30 min", 7 locali) |
- **INT‑B-blend** 🔶 Gestione ricette multi-farina (es. Pinsa, Bonci) — *modello flessibile + display fatti; editor da fare*.
  - **Modello (✅, rivisto dopo feedback)**: `flour_blend: { name, pct, w? }[]` — ogni componente con la sua quota e, se frumento, la sua forza `w`. Supporta **più farine di frumento** ognuna con W propria (non più singolo flag). Senza `w` = senza glutine.
  - **Display (✅)**: breakdown in grammi con la W di ciascuna farina; riga Farina "mix di farine"; slider W rietichettato "Forza della farina di frumento" per i blend (CMS `flourMix`/`flourWLabelBlend`, 7 locali).
  - **Editor (✅)**: `FlourBlendEditor` in configuratore — per i blend sostituisce lo slider W singolo. Quota editabile per ogni componente (slider %, normalizzazione automatica a 100 ridistribuendo sugli altri) + W editabile per ogni frumento (slider con range stile). Forza efficace = media W frumenti pesata sulle quote, mostrata come readout e passata all'engine come `flour_w`. Stato `customFlourBlend` in `recipe.tsx` → `generateRecipe` (nuovo param) → blend risolto con grammi attaccato a `GeneratedRecipe.flour_blend`, letto dall'output. Verificato end-to-end (edit quota → normalizza + ricalcola grammi; edit W → forza efficace + dough science).
  - **Audit scientifico (✅)**: W del frumento = media delle W di frumento pesata sulle quote (blend di W ≈ lineare → ok per multi-frumento); rappresenta la farina da comprare, coerente coi range W degli stili. Grammi dei componenti corretti per sommare esatti al totale. Temp acqua (DDT×3) corretta, non toccata dal blend.
  - **Scienza rigorosa — diluizione glutine (✅)**: aggiunta la **forza glutinica efficace** = W frumento × frazione di frumento (gluten ∝ proteina frumento ∝ quota frumento). Es. Pinsa 70/15/15: W frumento 290 → glutine efficace ≈ W203. Calcolata in engine (`GeneratedRecipe.effective_gluten_w`) + editor, mostrata nel breakdown ("forza glutinica efficace ≈ W203") e nel readout dell'editor, reattiva all'editing (90% → W261). **Scelta scientificamente onesta**: la W diluita è INFORMATIVA, NON viene data in pasto alle euristiche di difficoltà/identità/P/L calibrate sul frumento puro — le farine senza glutine cambiano la reologia (non solo diluiscono la forza), quindi infilarci la W diluita sarebbe falso rigore. Identità/scoring/P/L restano sulla W del frumento.
  - **⬜ Follow-up**: stili `unleavened` (Recco) — la fase di riposo è etichettata "Lievitazione e maturazione" pur con lievito=0; andrebbe rinominata "Riposo" per quel caso. Suggeritore farine blend-aware. Aggiungere `flour_blend` ad altri stili (es. Bonci con 2 frumenti).
- **INT‑B3** ⬜ (P1, M) Linee guida editoriali per stile — template fonte di verità per B1/B2.
- **INT‑B4** ✅ (P1, S) Terminologia "lievitazione" vs "maturazione" — `configurator.fermentLabel` "Fermentazione"→"Lievitazione e maturazione" + `fermentTip` arricchito (distingue gas/volume vs scomposizione enzimatica) su tutti i 7 locali. Stat strip lasciato compatto ("Lievitazione") per vincoli di spazio.

## WORKSTREAM C — Chiarezza UX & microcopy (P2)
- **INT‑C1** ✅ (M) Header home leggibile — `user-needs.tsx` `SettingsSummaryBar`: aggiunto **microcopy** esplicativo sotto i chip ("Questi dati aiutano Vulcan ad adattare tempi e ricetta", `misc.settingsHelp`, 7 locali) + **icona livello** Zap→ChefHat (più chiara). Le label-prefisso esplicite non forzate: design volutamente minimale (icone CookingPot/Package/ChefHat + microcopy comunicano la categoria); il dettaglio T esterna/cucina vive nel pannello cucina (al tap).
- **INT‑C2** ✅ (M) Stati momento — `user-needs.tsx`: tassonomia onesta. Lo slot più vicino (`getSuggestedSlot`=`slots[0]`) non è più badgiato "IDEALE" (sovrastimava: fermentazione corta ≠ ideale) ma **"Più rapido"** (`badgeIdeal` rietichettato, 7 locali). Lo slot scelto non è più "Corrente" (ambiguo: "l'ora corrente?") ma **"Selezionato"** (`misc.current` rietichettato, 7 locali). ⬜ Opzionale: stato "Consigliato" per uno slot best-quality (richiede logica engine che selezioni una fermentazione lunga consigliata, oggi assente).
- **INT‑C3** ✅ (S‑M) "Perfetti per te" sottotitolo + spiegazione match — `recommended-styles.tsx` + `style-detail-sheet.tsx`. Sottotitolo già presente. Motivazione match con due livelli (dopo feedback utente "sintetico su tile, articolato nel dettaglio"):
  - **Tile** (rev dopo feedback "le icone uguali non dicono nulla"): il badge non è più la dimensione del match (uniforme: a parità di momento tutte matchano sul tempo) ma **"difficoltà · impegno"** — es. "👨‍🍳 Principiante · 12–24h", "Esperto · 18–48h" — che DIFFERENZIA le tile e aiuta a scegliere. Da `getStyleTags().skill_required` + `fermentation_hours_range` (≤8h→`timeFast`). Pill scura translucida, testo bianco, icona/bordo tier. CMS: `filters.timeFast` (7 locali). (`reasonDimension`/`MATCH_DIMENSION_ICON` restano per il dettaglio.)
  - **Dettaglio** (StyleDetailSheet) = sezione "Perché combacia col tuo setup" con la lista articolata completa dei reasons (icona dimensione + testo), calcolata via `recommendStyles(constraints)`. `home.tsx` passa `constraints` al pannello. CMS: `sheetMatchTitle` (7 locali).
- **INT‑C4** ✅ (S) Metriche match leggibili — `recipe-match-card.tsx`: ora **label estese complete** (Autenticità, Fattibilità, …) con le barre in **flex-wrap** (min-width che contiene il nome): quando non entrano sulla riga, vanno a capo invece di comprimersi in sigle. Niente più abbreviazioni né legenda.
- **INT‑C5** ✅ (M) Smart Link feedback narrativo — `recipe-configurator.tsx`: quando Smart Link riallinea i parametri collegati (prima silenzioso, gli slider si muovevano "da soli"), ora appare un **messaggio narrativo transitorio** (3,5s) che nomina il parametro mosso e dichiara "ho riallineato gli altri parametri e la timeline" (`misc.smartLinkApplied`, 7 locali, fraseggio senza accordo di genere). Affianca gli `AdaptiveHint` causali già presenti (es. "LIMITE MAX ≤ 92%…").
- **INT‑C6** 🔶 (S) Transizione scelta momento — il piano stesso la dà "già migliorata, va estesa"; con C2 (Più rapido/Selezionato) + il chip "Quando" che atterra nella summary bar, la causa→effetto è già percepibile. Estensione ulteriore opzionale.
- **INT‑C7** ✅ (S‑M) Timeline scrollabilità — `recipe-output.tsx` (`CondimentChoiceStrip`): il topping strip a scroll orizzontale (con `hide-scrollbar`) ora ha **sfumature ai bordi dinamiche** (compaiono/spariscono in base allo scroll, via ref + ResizeObserver + onScroll) come indicatore di overflow. La gerarchia degli step del procedimento era già strutturata (titolo/orario/durata/come si fa/consigli).
- **INT‑C8** ⬜ (M) Sezione H2O / Regola 55 — `recipe-output.tsx`: acqua totale/impasto/prefermento/salamoia + T.
- **INT‑C9** 🔶 sostanzialmente già fatto — la separazione c'è già: configuratore (forma + dimensione + area cm² + spessore), output (unità contenitore + pezzi + impasto/peso + dimensione 40×30/Ø + adattamento farina↔area). ⬜ Resta opzionale: nome specifico del vessel per stile (Blue Steel/ruoto/padellino) — marginale, alto costo i18n, già citato nelle descrizioni.
- **INT‑C10** 🔶 (M) Pannello selezione stile valorizzato — `style-detail-sheet.tsx`: già arricchito (C3) con **hero video** (foto→video blur-in), descrizione, tag, sezione "Perché combacia col tuo setup" (reasons articolati), dettagli tecnici espandibili, CTA Genera. In buona forma; eventuale rifinitura minore.
- **INT‑C11** ✅ (S‑M) Feedback finale come chiusura di valore — `recipe-feedback.tsx` + `feedback-store.ts`: dopo l'invio di un feedback con problemi segnalati, la schermata "salvato" ora mostra una sezione **"La prossima volta"** con le **azioni correttive** che l'engine applicherebbe (es. Troppo densa → "aumento idratazione e lievitazione"), deduplicate. Aggiunto campo `correction` per ogni `RECIPE_ISSUES` (IT, come `label`) + `feedback.nextTimeTitle` (7 locali). Fix bonus: aria-label stelle "stellae"→"stelle" (plurale IT corretto).
- **INT‑C12** ✅ già coperto (moot) — search-overlay ha risultati sincroni + immagini con skeleton (A4) + stati no-results/empty; FTU step 2/3 sono contenuto statico; l'unico async (ricerca località in `profile.tsx`) ha già spinner `Loader2` + stato "detecting". Nessun gap di caricamento reale.

## WORKSTREAM D — Coerenza visiva & editoriale (P3)
- **INT‑D1** ⬜ (S‑M) Emoji → icone SVG (Falsi Allarmi, pre-fermenti, onboarding, CTA "Inizia ✨").
- **INT‑D2** ⬜ (M) Icone glossario per categoria — `glossary` + `glossary-data`.
- **INT‑D3** ⬜ (L) Coerenza fotografica — `STYLE_PHOTOS`/`cms.media`: no foto AI evidenti; foto = prodotto corretto.
- **INT‑D-wow** 🔶 Video di cottura (effetto wow) — 6 video per-stile copiati in `public/videos/` (`STYLE_VIDEOS` in `style-photos.ts`). Nel **detail sheet** l'header è ora un **hero a tutta larghezza** con la foto-poster che sfuma nel video (componente `BlurInVideo`: opacity+blur+scale in dissolvenza, muted/loop/playsInline, lazy). Stili senza video → solo foto. ⬜ Possibile estensione: hero scheda ricetta.
- **INT‑D4** ✅ (S) Nomenclatura card — `explore.tsx`: eyebrow unificate (featured + signature) a **"Ricetta · {stile}"** (rimosso "su {stile}" reso "SU …"). Verificato.
- **INT‑D5** 🔶 (S) Capitalizzazione tag — `recipe-view.tsx`: tag hero non più `capitalize` (che faceva "Cheese **C**rown", "2-3 **C**m", "**A**i", "**K**nead"); ora prima lettera sola. ⬜ Audit capitalizzazione su altri microcopy: follow-up opzionale.
- **INT‑D6** ✅ (S) "Troubleshooting" → IT — già IT (`learnTroubleshooting`="Problemi & Soluzioni"); corretto l'ultimo anglicismo in `ftuDoneLearnDesc`.
- **INT‑D7** ⬜ (S) Badge nav allineato a tile.

## WORKSTREAM E — Evoluzione prodotto (P4)
- **INT‑E1** ⬜ (M) Peso culturale (Tradizionale/Bilanciato/Sperimentale) — scoring `pizza-engine`/`recommended-styles`.
- **INT‑E2** ⬜ (L) Sezione Impara come percorso — `learn.tsx`.
- **INT‑E3** ⬜ (L) Feedback come apprendimento reale — feedback → ricalibrazione parametri.

---

## INT‑NAV — Navbar refinement (liquid glass)
- **Bleed-through ✅** — `liquid-dock.ts`: superficie dock resa più opaca (96→91%, frostata) → niente più contenuto/tagline che traspare.
- **Animazioni liquid-glass ✅** — `liquid-dock.ts` + `app-shell.tsx`: spring condivisa ritarata gel/viscosa (stiffness 390→230, damping 35→26, massa 0.72→1.05, leggero overshoot) per indicatore attivo + dock; sequenza hide/show coreografata (corpo y/scala con spring gel, blur+opacità su ease sfasato). *Da validare la motion dal vivo; eventuale "stretch" dell'indicatore in transito come step successivo.*
- **⬜ Search redesign (Apple Music / liquid glass) — SPEC CONFERMATA, da costruire**:
  - Alla pressione del bottone search: il **dock si morfa** — i 3 tab lasciano spazio a un **campo di ricerca inline nella navbar** (espansione liquid-glass) + "Annulla".
  - La **pagina sotto** diventa una **view risultati a tutta pagina**: **chip categoria (Tutto/Stili/Guide/Farine/Glossario) + lista compatta raggruppata** (riuso `buildResults`); meno editoriale di Scopri.
  - **Sostituire del tutto** il bottom-sheet `SearchOverlay` (l'"intermedio" non voluto).
  - Architettura: lift `searchQuery` in `app-shell`; `BottomTabBar` morph (input inline quando attivo); nuova `SearchResultsView` (full-page) che riusa `buildResults`/`Highlight`/filtri da `search-overlay.tsx`; render nel content area quando `searchOpen`; rimuovere `<SearchOverlay>`. Input nel dock guida la query della pagina; su select → naviga + chiude.

## Dipendenze/rischi
- **B (contenuti) e D3 (foto)**: servono **fonti tecniche** e **asset fotografici corretti** → lead time, avviare subito il reperimento.
- Molte voci C sono indipendenti e parallelizzabili dopo M1.
- Ogni intervento C/D che aggiunge testo passa dal CMS (7 file: `cms-context.tsx` + 6 locali). Procedura consolidata.
