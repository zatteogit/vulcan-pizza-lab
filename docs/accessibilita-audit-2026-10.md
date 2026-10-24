# Audit di accessibilità WCAG 2.1 AA: percorso principale

**Data:** 24 ottobre 2026
**Oggetto:** build di produzione locale (`vite build` servita con `vite preview`), percorso Crea → Ricetta → Scopri / Impara / Profilo
**Riferimento:** WCAG 2.1 livello AA. I criteri 2.2 (2.4.11, 2.5.8) sono indicati come *advisory*.
**Tipo di test:** automatico (axe-core 4.12.1) e manuale guidato con Playwright su Chromium 153. Non è stato fatto alcun test con screen reader su dispositivo reale (vedi § 6).

---

## 0. Stato delle correzioni (aggiornato al 24/10/2026)

| Voci | Stato | Dove |
|---|---|---|
| F01–F07 (P1) | corrette | commit «le 7 correzioni P1» sul ramo `claude/bold-brahmagupta-s484he` |
| F08–F20 (P2) | corrette | commit «correzioni P2» |
| F21 | corretta per i bersagli sotto 24 px misurati a 390 px; restano sotto 44 px alcune azioni primarie (livello AAA) | `theme.css`, blocco «U-10 (F21)» |
| F22–F27, F29 | corrette | commit P3 |
| F28 (pavimento tipografico a 12 px) | **da decidere**: cambia la resa di molte schermate | vedi handoff, §6 |
| F30 | corretta | commit P2 |

Verifica dopo le correzioni, con gli stessi script: axe-core sui 32 scenari
(390 e 1280 px, chiaro e scuro) passa da 32 violazioni (28 di contrasto, 4 di
nome mancante) a **0**. Controlli da tastiera ripetuti: lo sheet dello stile
tiene il focus (25 Tab su 25 dentro, Escape chiude, il focus torna alla card),
le tab di ricetta e Profilo rispondono a frecce, Home e Fine con una sola
fermata del Tab, la chiusura dell'onboarding porta il focus sul titolo.
Resta valido il limite del § 6: nessun test con screen reader su dispositivo.

---

## 1. Sintesi

| Severità | Priorità | N. | Cosa significa |
|---|---|---|---|
| Critica | P1 | 2 | Blocca un task del percorso principale per chi usa la tastiera o un lettore di schermo |
| Alta | P1 | 5 | Fallimento AA su un componente chiave, con impatto ampio |
| Media | P2 | 13 | Fallimento AA circoscritto, oppure pattern ARIA incompleto con un aggiramento possibile |
| Bassa | P3 | 10 | Advisory 2.2, best practice, rifinitura |
| **Totale** | | **30** | |

**In breve.** La base è più solida della media: struttura a landmark, `lang` che segue la locale, `prefers-reduced-motion` rispettato, nessuno scroll orizzontale a 320 px, e la maggior parte dei dialog (ricerca ⌘K, Personalizza, Ispirazioni, Approfondisci, conferma “Inizia”) gestisce bene focus, Escape e ritorno del focus. I problemi gravi si concentrano in cinque aree:

1. **Lo sheet dettaglio stile** (Crea → slot → card) è un `aria-modal` che non riceve il focus, non lo contiene e non si chiude con Escape (F01).
2. **Dock, avatar Profilo e “Inizia”** si nascondono allo scroll con `opacity: 0` ma restano nell'ordine di tabulazione, quindi il focus finisce su controlli invisibili (F02).
3. Diversi controlli hanno **`outline: none` senza alcun indicatore sostitutivo** (F03). Il ring globale al 50% di alpha si ferma a 2,4:1 (F10).
4. **Lo stato di selezione è solo visivo** nei gruppi forno / dispensa / livello, sia in Crea sia in Profilo (F04). Nel pannello Personalizza ci sono **5 slider senza nome** (F05).
5. Su componenti centrali il **contrasto** non passa: il badge “Consigliato” e il chip orario (bianco su oro, 3,0:1 chiaro e 2,2:1 scuro), e la card “Percorso didattico” di Impara (fino a 1,8:1 in scuro) (F06, F07).

---

## 2. Risultati automatici (axe-core, tag `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`)

Nella tabella: viewport 390×900 e 1280×900, tema chiaro (L) e scuro (D) via `colorScheme`, `reducedMotion: reduce`, locale `it-IT`. Il conteggio indica i nodi in violazione.

| Pagina / stato | Regola | Impatto | 390 L | 390 D | 1280 L | 1280 D | Selettori |
|---|---|---|---|---|---|---|---|
| `/` iniziale | color-contrast | serious | 2 | 2 | 2 | 2 | `.home-hero__beta-badge`, `.needs-slot-list__badge` / `.needs-slot-grid__badge` |
| `/` “Scegli giorno e ora” aperto | color-contrast | serious | 1 | 1 | 2 | 2 | come sopra |
| `/` pannello “La tua cucina” aperto | button-name | critical | 1 | 1 | – | – | `.needs-kitchen-temp__help` |
| `/` dopo la scelta dello slot (lista stili) | color-contrast | serious | 1 | 1 | 1 | 1 | `.needs-summary__time-chip > span[data-slot="label"]` |
| Ricerca ⌘K aperta | color-contrast | serious | 1 | 1 | 1 | 1 | `.search-overlay-x__suggestions-label` |
| `/recipe/napoletana_stg` (Ricetta) | – | – | 0 | 0 | 0 | 0 | – |
| `/recipe/new_york` (pannelli lievito e farina aperti) | – | – | 0 | 0 | 0 | 0 | – |
| `/recipe/new_york` tab Procedimento | button-name | critical | 1 | 1 | 1 | 1 | `.ds-switch` (“Timeline comoda”) |
| `/recipe/new_york` tab Condimento | color-contrast | serious | 0 | 1 | 0 | 1 | `.condiment-strip__pill--active .condiment-strip__pill-name` |
| Dialog Personalizza | label | critical | 5 | 5 | – | – | `.config-slider__input` (`input[type=range]` ×5) |
| Dialog Personalizza | button-name | critical | 1 | 1 | – | – | `.ds-switch` |
| Dialog “Vedi tutte” (ispirazioni) | nested-interactive | serious | 2 | 2 | – | – | `.interpretation-card[role=radio]` |
| `/explore` | – | – | 0 | 0 | 0 | 0 | – |
| `/learn` | – | – | 0 | 0 | 0 | 0 | – |
| `/profile` onboarding (primo accesso) | color-contrast | serious | 1 | 1 | 1 | 1 | `.profile-ftu__step-subtitle` |
| `/profile` Ricette salvate / La tua cucina | – | – | 0 | 0 | 0 | 0 | – |
| `/profile` tab App | color-contrast | serious | 1 | 1 | – | – | `.profile-page__dev-toggle` |

axe ha lasciato **incomplete** (sfondo non determinabile) il contrasto di tutti i testi su foto, gradienti o pseudo-elementi: card stili, card Scopri e Impara, dock delle tab ricetta, pannello Match. Li ho misurati a parte, campionando i pixel dello sfondo reale con il testo reso trasparente (§ 5.1). Da lì vengono F07, F08 e F09, che axe da solo non vede.

---

## 3. Findings

Legenda colonne: **ID**, **Criterio WCAG**, **Pagina / componente**, **Problema** (come riprodurlo), **Impatto per l'utente**, **Correzione proposta**, **Priorità**.

### 3.1 P1: critica e alta

| ID | Criterio | Pagina / componente | Problema (riproduzione) | Impatto per l'utente | Correzione proposta | Prior. |
|---|---|---|---|---|---|---|
| F01 | 2.4.3 (A), 2.1.1 (A), 4.1.2 (A) | `/` → slot “Domani a pranzo” → card stile (es. “Chicago Deep Dish”). Componente `div.style-detail-sheet__panel[role=dialog][aria-modal=true]` | Con Invio sulla card il dialog si apre, ma il focus resta sulla card (`.recommended-card__button`). Tab procede sulle card *dietro* lo sheet (25 tab su 25 fuori dal dialog). Escape non chiude, nemmeno dopo un click dentro il pannello. Lo sfondo non è inert. | **Critica.** Chi naviga da tastiera non raggiunge “Genera ricetta” né “Chiudi dettagli” senza attraversare tutta la griglia, e lavora alla cieca dietro un overlay. Lo screen reader riceve `aria-modal=true` mentre il focus è fuori dal modale: contesto incoerente. | `features/recipe/style-detail-sheet.tsx`: montare il pannello su `components/ds/ModalSheet` (o `BottomSheet`) oppure usare `use-dialog-focus.ts`, come già fanno Personalizza e Ispirazioni. Servono: focus iniziale sul titolo o su “Chiudi”, focus contenuto nel dialog, Escape che chiude, ritorno del focus alla card, `inert` sul resto. | P1 |
| F02 | 2.4.7 (AA), 2.4.3 (A); 2.4.11 (2.2) | Tutte le pagine con dock. `.app-shell-dock` (Crea / Scopri / Impara / Cerca), `a.app-shell-profile`, `button.cook-widget` (“Inizia la pizzata”) | Allo scroll i tre elementi vanno a `opacity: 0; pointer-events: none` (`app-shell.tsx:684`, classe `app-shell-profile--hidden`, cook widget idem) ma restano focusabili. Riproduzione: `/explore` o lista stili, scorrere in fondo con Tab. Il focus arriva su “Crea”, “Scopri”, “Impara”, “Cerca”, poi “Profilo”: tutti invisibili. Misurato: opacità effettiva 0, `elementFromPoint` restituisce il contenuto sottostante. Su `/recipe/*` lo stesso succede a “Inizia la pizzata” (scrollY 507). | **Alta.** Da 5 a 6 fermate di Tab per pagina su elementi che non si vedono. L'utente perde la posizione e può attivare la navigazione senza sapere dove sta andando. | `components/shared/app-shell.tsx`, `features/cooking/active-cook-widget.tsx`: quando l'elemento è nascosto, applicare `inert` (o `visibility: hidden` a fine transizione); in alternativa farlo ricomparire su `:focus-within` / `focusin`, cioè forzare `hidden=false` quando il focus entra nel dock. | P1 |
| F03 | 2.4.7 (AA) | Lista stili: `.recommended-search__input`, `.needs-summary__time-chip`. Scopri: `.explore-section__link` (“Vedi tutte (12)”, “Esplora tutti (28)”). Ricerca: `.search-overlay-x__filter-btn`. Profilo: `.profile-location__search-input`. Ricetta: `.ds-iconbtn` sulla foto hero (“Aggiungi ai preferiti”, a 1280) | Confronto pixel tra stato a fuoco e stato non a fuoco: nessuna differenza (diff = 0). In `theme.css` le regole base mettono `outline: none` senza sostituto (righe 2896, 7167, 14495, 16398, 16470, 5817). Sull'hero, il ring di `.ds-iconbtn` (`--primary` al 35%, riga 18238) è invisibile sopra la foto. Stesso `outline: none` su `.explore-filters__chip`, `.troubleshooting-guide__search-input`, `.condiment-strip-picker__search-input`, `.ds-snackbar__action` e `.ds-fab` (da verificare caso per caso). | **Alta.** Chi usa la tastiera non sa dove si trova sui filtri di ricerca, sul campo che filtra gli stili e sul chip orario, cioè sul cuore del flusso Crea. | Sostituire `outline: none` con `:focus-visible { outline: 2px solid var(--ring); outline-offset: 2px }`. Per gli input dentro un wrapper, mettere il ring sul wrapper con `:focus-within`. Per le icon button su foto usare un ring a doppio contrasto (es. outline `--ring` più box-shadow interno `--surface`). Token in `theme.css`. | P1 |
| F04 | 4.1.2 (A), 1.3.1 (A) | `/` pannelli “La tua cucina” (forno), “Dispensa” (farine, lieviti); `/profile` La tua cucina (`.profile-oven-list__item`, `.profile-oven-heat__option`, `.profile-skill-grid__item`); onboarding `/profile` (`.profile-ftu__option`) | Le opzioni selezionate sono distinte solo dal colore: “Forno Domestico” è terracotta piena, “LV2 Intermedio” mostra una spunta. Nell'albero di accessibilità sono `button` senza `aria-pressed` né `aria-checked` (snapshot: nessun `[pressed]`). Il codice lo conferma: `user-needs.tsx:742` (forno), `:826` (lieviti), `:1136` (farine), e i rispettivi bottoni in `profile.tsx`. | **Alta.** Chi usa uno screen reader non sa quale forno o livello è impostato, mentre è proprio l'input che decide fattibilità e punteggio. Senza ruolo non sa nemmeno se la scelta è singola o multipla. | Scelta singola (forno, calore, livello, onboarding): `role="radiogroup"` con `aria-labelledby` sul titolo di sezione, opzioni `role="radio"` con `aria-checked` e navigazione con le frecce. In alternativa, più semplice: `aria-pressed` su ogni bottone. Scelta multipla (farine, lieviti): `aria-pressed`, come già fa `components/ds/Chip` (“A mano” espone `[pressed]`). | P1 |
| F05 | 4.1.2 (A), 1.3.1 (A), 3.3.2 (A) | Dialog **Personalizza** (`/recipe/napoletana_stg` → “Personalizza”): `.config-slider__input` ×5. Tab Procedimento: `.ds-switch` “Timeline comoda”. Pannello “La tua cucina” in Crea: `.needs-kitchen-temp__help` | Gli `input[type=range]` (idratazione 45–105, forza 100–420, sale 1,5–3,5, lievitazione 1–96, temperatura 200–550) non hanno label né `aria-label` (axe `label`, critical). Lo switch Radix ha l'etichetta visiva “Timeline comoda” accanto ma non collegata: il nome calcolato è vuoto. Il nome “on” che a volte compare viene dall'attributo `value`. Il bottone “?” della temperatura cucina contiene solo l'icona. | **Critica.** Personalizza è il pannello in cui si modifica la ricetta: con lo screen reader si sentono cinque “dispositivo di scorrimento, 60” senza sapere che cosa regolano. | `features/recipe/recipe-configurator.tsx`: collegare la label visibile con `id` + `aria-labelledby` e aggiungere `aria-valuetext` con l'unità (“60 %”, “280 W”). `features/recipe/procedure-hero.tsx:293`: `aria-labelledby` verso il testo “Timeline comoda” e `aria-describedby` verso la descrizione. `components/ds/Switch.tsx`: rendere obbligatoria una prop label. `user-needs.tsx:714`: `aria-label="Come incide la temperatura"` più `aria-expanded`. | P1 |
| F06 | 1.4.3 (AA) | `/` card slot: badge “Consigliato” (`.needs-slot-list__badge--ideal`, a 1280 `.needs-slot-grid__badge--ideal`). Lista stili: chip orario `.needs-summary__time-chip` | Testo bianco su oro: **3,00:1** in chiaro (#FFF su #C48A12) e **2,19:1** in scuro (#FFF su #D8A830). Testo a 10 px: serve 4,5:1. In scuro il token di sfondo schiarisce e il contrasto peggiora. | **Alta.** “Consigliato” è l'informazione che orienta la prima scelta del flusso. Il chip orario è l'unico richiamo della scelta fatta. | In `theme.css`, coppia di token dedicata per lo stato *ideal*: testo scuro (es. `--text-on-warning`, circa #3A2A00) sull'oro, oppure oro scurito sotto #8A5F00 con testo bianco. Ridefinire il token anche nel blocco dark. | P1 |
| F07 | 1.4.3 (AA) | `/learn` card “Percorso didattico” (`.learn-path__card`) | Testo bianco su gradiente arancio, mediana campionata. Titolo (25–40 px bold): **2,2:1** scuro, 3,1:1 chiaro. Corpo `.learn-path__copy`: **1,97:1** scuro, **2,6:1** chiaro. Kicker `.learn-path__kicker` (8 px): **1,8:1** scuro, 2,6:1 chiaro. In dark il gradiente diventa *più chiaro* (pesca), il contrario di quello che serve. | **Alta.** È il primo contenuto di Impara. In tema scuro il paragrafo è di fatto illeggibile per chi ha bassa visione. | `pages/learn.tsx` e il relativo token in `theme.css`: in dark usare un gradiente scuro (terracotta 700–800) oppure testo scuro sul gradiente chiaro. Aggiungere uno scrim sotto il testo. Obiettivo ≥ 4,5:1 sul punto peggiore del gradiente. | P1 |

### 3.2 P2: media

| ID | Criterio | Pagina / componente | Problema (riproduzione) | Impatto per l'utente | Correzione proposta | Prior. |
|---|---|---|---|---|---|---|
| F08 | 1.4.3 (AA) | Componenti chiave: dock delle tab ricetta, card slot, condimenti, CTA orario | Mediane misurate. `.section-tabs-capsule__subtitle` (es. “Diretto • 12 h”, tab non attive, 9,7–10 px): **2,67:1** chiaro, **3,69:1** scuro (opacity 0,6). `.needs-slot-list__sublabel` / `.needs-slot-grid__sublabel` (“12 h 30 min”): **3,27:1** chiaro (opacity 0,5; in scuro 5,0 ok). `.condiment-strip__pill--active .condiment-strip__pill-name` in scuro: **2,29:1** (#FFF su #F4926A). `.ds-cta--elevated` “Usa questo orario” in chiaro: **4,19:1** mediana, 3,5 nel punto peggiore del gradiente. | Le durate degli slot e i sottotitoli delle tab (metodo e durata) sono dati operativi, non decorazione. | Togliere le opacità sul testo e usare il token `--text-muted` già conforme (≥ 4,5:1). Pill condimento attiva in dark: sfondo terracotta 600 o testo scuro. CTA elevated: punto più chiaro del gradiente sotto la soglia oppure testo con ombra/scrim. | P2 |
| F09 | 1.4.3 (AA) | Testi secondari | `.home-hero__beta-badge` (8 px): 3,11 chiaro, 4,46 scuro. `.search-overlay-x__suggestions-label` “SUGGERIMENTI”: 2,63 / 3,61. `.needs-summary__help` (9 px): 4,27 chiaro. `.profile-ftu__step-subtitle`: 2,96 / 4,12. `.profile-page__dev-toggle`: 2,2 / 2,9. `.explore-card__match-mc` “44%” a 1280 chiaro: 4,16. | Lettura difficile per chi ha bassa visione. Più testi sono anche a 8–9 px. | Allineare al token muted conforme. Per il badge beta valutare un testo di 10 px o più. | P2 |
| F10 | 1.4.11 (AA) | Ring di focus globale | `theme.css:1591`: `outline-color: color-mix(in srgb, var(--ring) 50%, transparent)` con `outline: auto`. Contro lo sfondo pagina: **2,40:1** chiaro (#9E3520 al 50% su #FDFBF7), **2,89:1** scuro. `.ds-iconbtn:focus-visible` è al 35%. Il ring si vede (es. card slot) ma non arriva a 3:1. | Indicatore debole per ipovisione, quasi invisibile su superfici crema e foto. | Ring pieno `var(--ring)` (6,8:1 chiaro, 8,2:1 scuro), 2 px, offset 2 px. Se si vuole morbidezza, abbinare un alone esterno a bassa opacità, ma mai solo quello. | P2 |
| F11 | 4.1.3 (AA) | Lista stili (`recommended-styles.tsx`), ricerca (`search-overlay.tsx`), ingredienti (`ingredients-section.tsx`) | Nessuna regione live per: filtro stili (“roma” → 6 card; “zzzz” → “Nessuno stile per "zzzz"”), numero di risultati della ricerca globale (con “napo” compaiono 26 option, nessuna `role=status`), cambio panetti (4 → 5: le quantità cambiano in silenzio). Funzionano invece: budget farina (`aria-live=polite`), toast salva / copia / rimuovi (`role=status`). | Chi usa uno screen reader digita o preme “+” e non riceve alcun riscontro. Non sa se il filtro ha restituito risultati. | Regione `role="status"` sempre montata (vuota al mount) e aggiornata con “6 stili”, “Nessuno stile per …”, “26 risultati”, “5 panetti, 1400 g di impasto”. | P2 |
| F12 | 2.4.3 (A) | `/`: scelta slot, “Capito, si parte”. Ricetta: “Rendila possibile” / “Ottimizza per me”. Profilo: “Rimuovi … dal ricettario” | In tutti i casi il controllo attivato sparisce o la vista cambia, e `document.activeElement` torna a `BODY`. Riproduzione: Tab fino a “Domani a pranzo”, Invio: si apre la lista stili con il focus su body e scrollY a 0. | Dopo ogni passo chi usa la tastiera ricomincia dall'inizio della pagina. Lo screen reader non annuncia il cambio di vista. | Dopo la scelta dello slot: focus programmatico sull'H1 “Scegli il tuo stile” (`tabIndex=-1`). Dopo il dismiss dell'onboarding: focus sul primo slot o sull'H1. Dopo “Rendila possibile”: focus sul titolo o sull'eyebrow “Modificata per te” più annuncio. Dopo la rimozione: focus sull'elemento successivo della lista o sul titolo sezione. | P2 |
| F13 | 4.1.2 (A), 1.3.1 (A) | Tab ricetta (`nav.section-tabs-capsule[role=tablist]` in `recipe-section-tabs.tsx`), tab Profilo (`.profile-tabs[role=tablist]` in `profile.tsx:1507`) | `role=tab` senza `tabpanel` né `aria-controls`. Frecce ←/→ senza effetto (verificato). Tutte e tre le tab sono nella sequenza di Tab (tabindex 0, nessun roving). Sulla ricetta `role=tablist` è applicato a un `<nav>` e ne annulla il landmark. | Lo screen reader annuncia “scheda 1 di 3” e l'utente si aspetta le frecce, che non funzionano. Non si arriva al pannello attivo con la scorciatoia. | Opzione A, pattern completo: roving tabindex, frecce, Home/End, `aria-controls` verso un `role=tabpanel` con `aria-labelledby`. Opzione B, più coerente con il dock: rinunciare ai ruoli tab e usare bottoni con `aria-pressed` o `aria-current` dentro un `<nav aria-label>`. In entrambi i casi togliere `role` dal `<nav>`. | P2 |
| F14 | 4.1.2 (A) | `/` chip “La tua cucina” / “Dispensa” / “Intermedio” (`.needs-summary__tab`, `user-needs.tsx:452`); Profilo `.profile-equip-cat__trigger`; toggle `.flour-budget__toggle` | Aprono e chiudono pannelli inline ma non espongono `aria-expanded` (né `aria-controls`). Il toggle farina ha `aria-expanded` ma non `aria-controls`. Termine di paragone corretto: `.yeast-explainer__toggle`. | Chi usa uno screen reader non sa che il bottone ha aperto qualcosa, né dove. | Aggiungere `aria-expanded={isActive}` e `aria-controls` verso l'id del pannello. | P2 |
| F15 | 2.4.2 (A) | Tutte le route | `document.title` è sempre “Vulcan Pizza Lab” su `/`, `/recipe/*`, `/explore`, `/learn`, `/profile`. Solo `cook-session.tsx` lo modifica. | Cronologia, schede e annuncio di cambio pagina non distinguono le viste. Lo screen reader non annuncia la navigazione SPA. | Hook `useDocumentTitle` per route (es. “Napoletana STG · Ricetta · Vulcan”, “Scopri · Vulcan”) da `routes.ts` / `handle`, con stringhe da CMS. | P2 |
| F16 | 1.3.1 (A), 2.4.6 (AA) | Ricetta, Condimento, Crea | Ricetta: H1 → H3 “Ingredienti” (manca H2; l'H2 compare solo nel pannello verdetto). Tab Condimento: **4 H1** (“New York Style”, “Margherita”, “Sulla Base”, “In Superficie”), perché `ds/Heading` mappa `level="page"` e `"xl"` su `h1` (`topping-section.tsx:197, 300`). Crea: i pannelli preferenze usano H3 *prima* dell'H1. I gruppi “Perfetti per te / Fattibili / Non fattibili” sono testo, non intestazioni. Scopri / Impara: H3 della card in evidenza prima del primo H2. | La navigazione per titoli restituisce una struttura piatta o sbagliata. I gruppi di fattibilità, che sono il cuore della lista stili, non sono raggiungibili. | Separare taglia visiva e livello semantico: usare la prop `as` di `Heading` (`as="h2"` / `"h3"`). Rendere H2 i gruppi di fattibilità, con conteggio nel testo. Titolo sezione H2 per Ingredienti. | P2 |
| F17 | 1.4.10 (AA), 1.4.12 (AA) | `/recipe/new_york` Procedimento a 320 px; stat strip ricetta | A 320 px il titolo “Tabella di marcia” (`.procedure-hero__title`) è troncato in “Tabel…”. Nella stat strip la label “Forza farina” (`.stat-strip__label`) è troncata già a 390 px (“FORZA FARI…”). Con l'override di text-spacing (1.4.12) entrambi vengono tagliati (scrollWidth 186/84 e 77/70). | Si perde contenuto testuale nel reflow e con le spaziature personalizzate. | Togliere `white-space: nowrap` / `text-overflow: ellipsis` dalle label e consentire l'a capo. Nell'hero procedura spostare il badge “Tempo totale” sotto il titolo sotto i 360 px. | P2 |
| F18 | 2.5.3 (A) | Ricerca ⌘K, `.search-overlay-x__cancel-btn` | Testo visibile “Annulla”, `aria-label="Chiudi ricerca"`: il nome accessibile non contiene la label visibile. | Chi usa il controllo vocale dice “Annulla” e non succede nulla. | Rimuovere `aria-label` (resta “Annulla”) oppure `aria-label="Annulla ricerca"`. | P2 |
| F19 | 4.1.2 (A) | Dialog “Vedi tutte” (Ispirazioni), `.interpretation-card[role=radio]` (`interpretation-narrative-card.tsx:250`) | Il `role="radio"` contiene discendenti focusabili (axe `nested-interactive`, 2 nodi). | Il ruolo radio appiattisce i figli: i controlli interni non vengono esposti, oppure lo vengono in modo incoerente. | Radio nativo o `role=radio` su un elemento senza figli interattivi. Spostare le azioni secondarie fuori dalla card. | P2 |
| F20 | 2.4.7 (AA); 2.4.11 (2.2, advisory) | Dock e barre sticky | Elementi a fuoco coperti da elementi sticky: ultimo slot “Nessuna preferenza” sotto `.app-shell-dock__row` (diff 0,004, quasi interamente coperto); `.flour-budget__input`, radio lievito e CTA Match sotto `nav.section-tabs-capsule`. Il browser porta l'elemento nel viewport ma non tiene conto del dock. | Il focus si “perde” sotto la barra in basso proprio sugli input del calcolo. | `html { scroll-padding-bottom: calc(altezza dock + safe-area) }` e `scroll-padding-top` per le barre in alto. In alternativa `scrollIntoView({block:'center'})` su `focusin` nelle aree con dock. | P2 |

### 3.3 P3: bassa / advisory

| ID | Criterio | Pagina / componente | Problema (riproduzione) | Impatto per l'utente | Correzione proposta | Prior. |
|---|---|---|---|---|---|---|
| F21 | 2.5.8 (2.2, advisory); 2.5.5 AAA per i 44 px | Vari | **< 24 px:** chip Ispirazione `.interpretation-switcher__chip` (h 20), “Vedi tutte” 34×23, trigger glossario “W280” 30×14, “Approfondisci” 79×17, toggle “Come si fa” 143×16, `.ds-switch` 29×16, onboarding “Capito, si parte” / link profilo (h 15), “Vedi tutte (12)” / “Esplora tutti (28)” (h 17), radio lievito 13×13 (mitigato dalla label cliccabile), `input.recommended-search__input` h 17 (il wrapper è più alto ma non porta il focus). **Azioni primarie < 44:** “Usa questo orario” 39, “Avanti” 38, “Rendila possibile” / “Ottimizza per me” / “Personalizza” 32, “Inizia la pizzata” 78×40, tab Profilo 25, filter chip 28–30, avatar Profilo 40. | Errori di tocco su mobile, soprattutto con le mani impegnate in cucina. | Minimo 24×24 ovunque, padding e hit-area via `::before`. Primarie ≥ 44 px di altezza (token `--space-11`). Il click sul wrapper della ricerca stili deve portare il focus sull'input. | P3 |
| F22 | 2.4.1 (A) | Shell | Lo skip link “Salta al contenuto” esiste solo in Crea ed è la **seconda** fermata, dopo “Profilo”. Su `/explore`, `/learn`, `/profile`, `/recipe/*` manca. Il landmark `main` c'è, quindi il criterio è formalmente soddisfatto. | Senza skip link si attraversano più fermate prima del contenuto. | Spostare lo skip link nella shell, come primo elemento del DOM, su tutte le route. | P3 |
| F23 | 4.1.3 (AA), best practice | `/recipe/napoletana_stg`, `section.recipe-verdict[role=alert]` (`recipe-verdict-notice.tsx:74`) | `role="alert"` su un contenuto presente già al caricamento, con dentro `nav`, liste e link. L'annuncio assertivo al mount non è affidabile (dipende dall'AT) e, quando avviene, legge l'intero blocco interrompendo il resto. Contrasto e struttura del pannello invece sono buoni (§ 4). | Annuncio rumoroso o assente a seconda dello screen reader. | Usare `role="region"` con `aria-labelledby` sul titolo. Riservare un `role=status` separato e breve (“Così non è fattibile con il tuo forno”) a quando il verdetto *cambia* dopo un'azione dell'utente. | P3 |
| F24 | 1.1.1 (A), 2.4.4 (A) | Lista stili, `.recommended-card__button` | Nome accessibile duplicato (“Chicago Deep Dish Chicago Deep Dish CHICAGO …”, alt dell'immagine più titolo). Il punteggio è un `img` con nome “83” senza contesto. In Scopri invece è corretto (“Compatibilità 83%”). | Annuncio verboso e numero senza significato. | Foto con `alt=""` (il titolo c'è già). `score-ring.tsx`: `aria-label="Compatibilità 83 su 100"`, come in Scopri. | P3 |
| F25 | 2.2.2 (A) | `/` hero (`.home-hero__glow`, `.dough-mascot__*`) | Con `no-preference` l'animazione “respiro” continua oltre i 5 s (verificato a 8 s), senza controllo di pausa. Con `reduce` si ferma (ok). | Distrazione per utenti con disturbi dell'attenzione che non hanno impostato reduce. | Fermare il loop dopo 2–3 cicli, oppure metterlo in pausa fuori dal viewport. | P3 |
| F26 | 2.2.1 (A) | `/profile`, toast “Ricetta rimossa · Annulla” (`profile.tsx:420`) | L'undo resta disponibile 6 s fissi; il timer non si sospende con focus o hover. | Chi usa la tastiera o lo screen reader non fa in tempo ad annullare un'azione distruttiva. | Sospendere il timer su `focusin` / `mouseenter` della snackbar, oppure lasciarla finché non viene chiusa. Portare il focus sull'azione “Annulla” solo se l'utente ci arriva. | P3 |
| F27 | 3.3.2 (A) | `/profile` `.profile-location__search-input`; `/` campo datetime | Il campo città ha come etichetta solo il placeholder (“Cerca città...”), che sparisce durante la digitazione. Il vincolo del datetime (1 h – 7 giorni) si vede solo dopo l'errore. L'errore in sé è gestito bene (`aria-invalid` più `role=alert`). | Chi ha problemi di memoria a breve termine e chi usa lo screen reader non conosce i vincoli. | Label visibile o `aria-label` per il campo città. Testo d'aiuto persistente sotto il datetime, collegato con `aria-describedby`. | P3 |
| F28 | 1.4.4 / 1.4.12, best practice | Globale a ≤ 390 px | Root a 14,25 px e molti testi tra 8 e 10 px: 37 nodi a 10 px e 28 a 9 px nella lista stili; 8 px su badge beta, kicker e etichette profilo. Lo zoom funziona (nessun blocco nel viewport, reflow ok), ma il default è molto piccolo. | Fatica di lettura per ipovisione e utenti anziani, anche senza un fallimento formale. | Pavimento tipografico a 12 px per testo informativo e 11 px solo per eyebrow maiuscoli, con verifica nel token checker. | P3 |
| F29 | 1.3.1, best practice | Shell, Ricetta | “Profilo”, “Cerca (⌘K)” e “Inizia la pizzata” sono fuori da qualsiasi landmark. `aside "Match"` contiene una `section "Match"` con lo stesso nome (doppio annuncio). | Navigazione per regioni meno pulita. | Inserire avatar e ricerca nel `header` / `nav` della shell. Togliere il nome alla section interna di Match. | P3 |
| F30 | 4.1.2, best practice | Ricerca ⌘K | Il dialog prende come nome `aria-label="Campo di ricerca globale"`, lo stesso dell'input. | All'apertura si sente “Campo di ricerca globale, finestra di dialogo” e poi di nuovo “Campo di ricerca globale”. | Nome del dialog “Ricerca”, input “Cerca stile, farina, termine…”. | P3 |

---

## 4. Cosa passa

- **Reflow 320 px:** nessuno scroll orizzontale nei 13 stati testati (`scrollWidth == clientWidth`), salvo i troncamenti di F17.
- **Zoom 200%** (emulato a 640×450 CSS px): nessuno scroll orizzontale; dock e barre sticky non superano il 25% dell'altezza. Il viewport non blocca lo zoom e nel manifest non c'è un lock di orientamento (1.3.4).
- **Lingua (3.1.1):** `<html lang>` segue la locale: `it-IT`, `en-GB`, `de-DE`, `fr-FR` (da `cms-context.tsx`). Con en-GB l'interfaccia, verdetto e tab compresi, è tradotta; sulla ricetta non sono rimaste stringhe italiane.
- **prefers-reduced-motion:** con `reduce` le animazioni dell'hero e della mascotte si fermano e non risultano animazioni infinite su `/`, ricetta, Scopri, Impara e Profilo. La durata dell'indicatore delle tab Profilo è ridotta.
- **Ricerca ⌘K:** funziona con Ctrl+K e ⌘K. Il focus va sull'input, che è un `combobox` con `aria-controls` verso un `listbox` e `aria-activedescendant` che si aggiorna con ↓. Il focus resta nel dialog, lo sfondo è `inert`, Escape chiude e il focus torna su “Cerca”.
- **Altri dialog:** Ispirazioni (“Vedi tutte”), Approfondisci, Personalizza, conferma “Inizia la pizzata” (`alertdialog`) e glossario “W280”. In tutti il focus entra, resta nel dialog, Escape chiude e il focus torna al trigger.
- **Pannello verdetto “Così non è fattibile”:** testo 16,4:1 in chiaro e 16,7:1 in scuro; link alternative 6,1:1 e 8,9:1; nota 6,3:1 e 7,8:1. Struttura corretta: `h2`, lista dei motivi, `nav` etichettata per le alternative.
- **Card slot:** label a 15–17:1 in entrambi i temi, sublabel in scuro 5,0:1 (in chiaro no, F08). Il ring di focus si vede, anche se con poco contrasto (F10).
- **Dock di navigazione:** label inattive a 4,87:1 in chiaro e 6,6:1 in scuro; `aria-current="page"` sulla tab attiva; tab della ricetta a 6,4:1 e 8,2:1.
- **Pannello Match:** tutti i testi misurati ≥ 5,8:1.
- **Form:** datetime “Quando si mangia?” con label associata, `min`/`max`/`step`, errore con `aria-invalid` e `role=alert`. Budget farina con label, `inputmode=numeric` e risultato in `aria-live=polite`. Radio “Nella tua cucina gli impasti lievitano” raggruppati con nome di gruppo e label. Range temperatura forno in Profilo con `aria-label`.
- **Stati:** “Aggiungi ai preferiti” ha `aria-pressed` e un'etichetta che cambia. I chip Ispirazione e i filter chip della lista stili espongono `aria-pressed`. I disclosure “Come calcoliamo il lievito”, “Cos'è la Regola 55” e “Dettagli” hanno `aria-expanded`.
- **Messaggi di stato:** i toast salva, copia link e rimuovi usano `role=status`.
- **Keyboard trap:** nessuno fuori dai dialog, dove il contenimento è voluto.
- **Immagini:** tutte hanno `alt`. Le card di Scopri e Impara sono link con nome completo.

---

## 5. Metodo

### 5.1 Strumenti e configurazione
- **Build:** `vite build` in una cartella di scratch (per non toccare `dist/` mentre il codice cambia in parallelo), servita con `vite preview --port 4180`. Il codice testato è quello presente al momento della build, il 24/10/2026.
- **Browser:** Chromium 153 (Chrome for Testing) via `playwright-core` 1.56.1.
- **Matrice:** 390×900 e 1280×900 × `colorScheme` light/dark × 13 stati (Crea iniziale, Crea con datetime aperto, lista stili, ricerca aperta, Napoletana STG, New York con i pannelli lievito e farina aperti, tab Procedimento, tab Condimento, Scopri, Impara, onboarding Profilo, Ricette salvate con una ricetta salvata, La tua cucina). Più 12 stati di overlay e pannelli a 390 in entrambi i temi (pannelli Crea, sheet stile, ricerca con query, Personalizza, Ispirazioni, Approfondisci, Dettagli, conferma Inizia, Profilo App, Glossario).
- **axe-core 4.12.1** da `node_modules/axe-core`, tag `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`.
- **Contrasto su sfondi complessi:** per ogni selettore, screenshot del box con il testo reso trasparente, colore del testo calcolato (alpha e opacità degli antenati inclusi) e composto su ogni pixel di sfondo. Riporto la mediana e il 5° percentile. Soglie: 4,5:1, oppure 3:1 per testo ≥ 24 px o ≥ 18,66 px bold. Nei chip il 5° percentile include i pixel del bordo, quindi conta la mediana.
- **Tastiera:** 70 pressioni di Tab per stato. Per ogni fermata ho registrato ruolo, nome, `:focus-visible`, differenza di pixel tra stato a fuoco e non a fuoco (diff = 0 significa nessun indicatore), copertura da parte di altri elementi (`elementFromPoint`) e opacità effettiva della catena degli antenati. I casi sospetti sono verificati con screenshot.
- **Dialog:** apertura con Invio dal trigger, verifica del focus iniziale, 25 Tab per il contenimento, Escape, ritorno del focus al trigger.
- **Target:** bounding box di tutti gli interattivi visibili a 390 px.
- **Reflow, zoom, spaziatura:** viewport 320 px; 640×450 come equivalente del 200% su 1280×900; override 1.4.12 (line-height 1,5, letter-spacing 0,12em, word-spacing 0,16em, margine paragrafo 2em) con ricerca degli elementi tagliati.
- **Movimento:** `document.getAnimations()` e campionamento dei transform nel tempo, con `reduce` e con `no-preference`.
- **Lingua:** contesti con locale `it-IT`, `en-GB`, `de-DE`, `fr-FR` al primo avvio (senza localStorage).

### 5.2 Limiti
- **Nessun test con screen reader su dispositivo reale** (VoiceOver iOS/macOS, TalkBack, NVDA, JAWS). Annunci, ordine di lettura e comportamento delle live region sono dedotti dall'albero di accessibilità di Chromium e dal DOM, non ascoltati. In particolare F01, F11, F13 e F23 vanno confermati con VoiceOver iOS, che è il target principale vista l'impostazione mobile.
- **Solo Chromium.** Safari e Firefox non sono stati testati. Il rendering di `outline: auto` (F10) e gli annunci di `role=alert` al mount (F23) cambiano tra browser.
- **Zoom emulato** riducendo il viewport, non con lo zoom reale del browser. La “grandezza testo” di iOS (Dynamic Type) non è stata testata.
- **Solo touch target misurati.** Gesti e trascinamenti (2.5.1, 2.5.2) non sono stati esercitati. Il carosello condimenti e i bottoni −/+ del tempo hanno alternative a tap.
- **Fuori perimetro:** modalità cottura attiva (`cooking-mode`), `/learn/*` oltre al Glossario, CMS e tool di sviluppo.
- **Codice in movimento:** un altro agente sta modificando il codice in parallelo. Righe e selettori citati si riferiscono allo stato del 24/10/2026 e vanno ricontrollati prima della correzione.
