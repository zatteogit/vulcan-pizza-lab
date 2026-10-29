# Registro del contributo umano

Stato: bozza da completare. Rilievo d'origine: audit AUT-1 (ottobre 2026).
Questo documento raccoglie le evidenze su chi ha deciso cosa nel progetto.
Il quadro normativo (L. 132/2025, secondo il dossier dell'audit) richiede un
parere legale: qui si registrano fatti, non conclusioni giuridiche.

## 1. Scopo e limiti

- Si registrano solo decisioni con un'evidenza verificabile: commit, PR,
  documento, annotazione.
- Nessuna decisione è attribuita a una persona senza conferma. Il campo
  **Decisore** resta «da confermare» finché Matteo non lo conferma, voce per
  voce.
- L'autore git non prova da solo un lavoro umano: gli agenti AI committano
  anche con l'identità del proprietario. Il ruolo AI si deduce dai trailer
  (`Co-Authored-By`, link di sessione) e dall'autore del commit.
- Il clone locale è shallow (60 commit visibili, dal 05/07/2026 al
  14/07/2026 alla data di questo documento): la cronologia completa va
  esportata da GitHub.

## 2. Perimetro dell'opera

| Area | Dove sta | Evidenze principali |
|---|---|---|
| Specifiche e UX | `docs/piano-interventi.md`, `docs/review-2026-06-21.md`, `guidelines/Guidelines.md` §1 | piano P0–P4; review think-aloud R1–R33; «Identità e visione» |
| Scelte di dominio del motore | `src/app/domain/pizza-engine.ts` | 38 riferimenti «Audit …» nei commenti, con le motivazioni |
| Modello dati | `PizzaStyle` (`src/app/domain/pizza-engine.ts:174`), `DoughParameters` (`:52`), `UserConstraints` (`:268`), `Interpretation` (`src/app/data/interpretation-library.ts:41`), `FlourEntry` (`src/app/data/flour-database.ts:6`) | — |
| Design system | `docs/design-system-tiers.md`, `docs/vulcan-theme-v7-implementation-report.md`, `src/styles/theme.css` | contratto dei tier; «Decisione di design» e regole non negoziabili V7 |
| Catalogo e contenuti | `docs/catalogo-pizze.md`, CMS in `src/app/features/cms/` | — |
| Marchio e nome | `src/app/components/shared/vulcan-logo.tsx`, `docs/brand/` | vedi `docs/brand/nome-prodotto.md` |

## 3. Registro delle decisioni

Ruolo AI: «trailer» se il commit ha un trailer AI, «autore» se il commit è
firmato da un agente, «nessun segno» se non c'è traccia (non prova l'assenza).

| ID | Data | Area | Decisione | Alternative scartate | Evidenza | Decisore | Ruolo AI |
|---|---|---|---|---|---|---|---|
| D-001 | 2026-07-08 | Marchio | Rifinitura di logo e favicon | — | commit `c8a9e5c` | da confermare | nessun segno |
| D-002 | 2026-07-09 | Temi | Rimossi i temi sperimentali Editoriale, Classica, Minimal | i temi rimossi, recuperabili dalla storia | commit `740d04e`; `src/styles/theme.css` («bocciate e rimosse») | da confermare | nessun segno |
| D-003 | 2026-07-10 | Temi | Sfornata non diventa il tema di default | Sfornata come default (commit `0925e48`, con trailer AI) | revert `413dd41`; PR #41 e #42 | da confermare | revert: nessun segno |
| D-004 | 2026-07-08 | Design system | Decisioni dell'ondata 6 dei token (scrim-modal, switch drift, elevation-confirm) | da ricostruire | commit `bd62e14`; `docs/design-system-tiers.md` | da confermare | trailer |
| D-005 | 2026-06-21 | UX | Osservazioni della review think-aloud mappate sul piano | — | `docs/review-2026-06-21.md` («l'utente dice») | da confermare | da verificare |
| D-006 | — | Design system | Direzione «Editorial FireGlow» e regole non negoziabili V7 | direzioni dei mockup precedenti | `docs/vulcan-theme-v7-implementation-report.md` §1 | da confermare | da verificare |
| D-007 | 2026-07-04 → 2026-07-11 | UX | Correzioni chieste con le annotazioni del debug overlay | — | `vulcan-debug-registry.json` (52 voci locali, 51 risolte); commit `8876a83`, `7884d3b`, `573f5f4` | da confermare | da verificare |
| D-008 | 2026-10 | Prodotto | Nome del prodotto in un solo punto; il nuovo nome non è ancora scelto | nome scritto in ogni file | PR di questo ramo; `docs/brand/nome-prodotto.md` | da confermare | autore delle modifiche: agente AI |
| D-009 | 2026-10 | Sicurezza | Annotazioni, tema globale e debug spenti in produzione; `frame-ancestors 'self'` | API protette da segreto; nessun vincolo | PR di questo ramo; `worker/index.ts`, `public/_headers` | da confermare | autore delle modifiche: agente AI |
| D-010 | 2026-10-23 | Motore | «Nessuna preferenza» non è una scadenza (`meal_deadline`) | trattare anche «Nessuna preferenza» come scadenza | risposta a scelta nella sessione dell'agente del 23/10; `docs/motore-correzioni-2026-10-22.md` | Matteo | domanda e modifiche: agente AI |
| D-011 | 2026-10-23 | Motore | Slot del pasto al quarto d'ora per difetto | ore intere per difetto; `Math.round` | come D-010 | Matteo | domanda e modifiche: agente AI |
| D-012 | 2026-10-23 | Motore | Consigli allineati all'esito della ricetta sul forno (soglia termica unica) | forno freddo come solo avviso; lasciare l'incoerenza | come D-010 | Matteo | domanda e modifiche: agente AI |
| D-013 | 2026-10-23 | Contenuti | Il range di temperatura della Pinsa va verificato su fonti (C-4) prima di cambiarlo | range attuale corretto | come D-010 | Matteo | domanda: agente AI |
| D-014 | 2026-10-24 | Prodotto | Ordine di lavoro: I18N-1 prima di U-1 e U-2 | U-1/U-2 prima | messaggio di Matteo nella sessione dell'agente del 24/10 | Matteo | proposta e modifiche: agente AI |
| D-015 | 2026-10-24 | Contenuti | Pinsa romana sui valori con fonte: forno 280–320 °C (ideale 300), idratazione 72–80%, sale 1,8%, olio 1,3%, panetto 240 g, 34 × 21 cm | tenere 350–420 °C senza fonte | risposta a scelta nella sessione dell'agente del 24/10; `docs/fonti-dati.md` §1.2 | Matteo | ricerca fonti, proposta e modifiche: agente AI |
| D-016 | 2026-10-24 | Contenuti | Napoletana: lo stile segue la STG (reg. UE 97/2010: 6–14 h, panetto 250 g); il disciplinare AVPN 2024 è la versione «Disciplinare AVPN» (12–24 h, 280 g) | stile su AVPN; range di compromesso 8–24 h | come D-015; `docs/fonti-dati.md` §1.1 | Matteo | come D-015 |
| D-017 | 2026-10-24 | Contenuti | Focaccia di Recco sui valori del disciplinare IGP: forno 270–320 °C (ideale 300), cottura 4–8 min | tenere 300–340 °C e 8–10 min | come D-015; `docs/fonti-dati.md` §1.3 | Matteo | come D-015 |
| D-018 | 2026-10-24 | Contenuti | Olio di frittura (pizza fritta e montanara): 175–190 °C, ideale 175 (AVPN 2024) | 180–190, ideale 185 | come D-015; `docs/fonti-dati.md` §1.4 | Matteo | come D-015 |
| D-019 | 2026-10-24 | Accessibilità | Testo minimo 12 px per il testo informativo, 11 px solo per gli eyebrow maiuscoli (audit F28) | solo testo informativo; lasciare com'è | risposta a scelta nella sessione dell'agente del 24/10; `docs/accessibilita-audit-2026-10.md` | Matteo | proposta e modifiche: agente AI |
| D-020 | 2026-10-24 | Motore | Forno a legna dello stile (STG, New Haven): avviso, non blocco, in consigli e ricetta | blocco ovunque; lasciare l'incoerenza | come D-019; `docs/motore-correzioni-2026-10-22.md` | Matteo | come D-019 |
| D-021 | 2026-10-24 | Dati | Due forni a gas: «da pizza» fino a 500 °C (portatili) e «a platea» fino a 350 °C | un solo tipo a 450–500 °C; lasciare 350 °C | come D-019; `docs/fonti-dati.md` §3.1 | Matteo | come D-019 |
| D-022 | 2026-10-24 | Contenuti | M-7: terzo stile fritto. Le fonti non conoscono una fritta aperta diversa dalla montanara (il battilocchio è chiuso): si aggiunge la «Pizza fritta tonda» del disciplinare AVPN 2024 (due dischi, 120 + 80 g) | piscitiello/battilocchio (senza fonti su peso e misure, nome registrato); nessun terzo stile | due risposte a scelta nella sessione dell'agente del 24/10; `docs/fonti-dati.md` §1.4 | Matteo | ricerca fonti, proposta e modifiche: agente AI |
| D-023 | 2026-10-24 | Contenuti | Impasto delle fritte su AVPN 2024 (panetto 200 g, W 250–320) con lievitazione 8–24 h (8 h dalle friggitorie, 24 h AVPN) | AVPN 12–24 h; correggere solo il panetto | come D-022 | Matteo | come D-022 |
| D-024 | 2026-10-24 | Contenuti | Tolte le ispirazioni «Malati di pizza» e «Confraternita della pinsa»: nessuna fonte per le ricette né per il ruolo dei gruppi | tenerle come ricostruzioni senza attribuzione; togliere solo Malati di pizza | sessione dell'agente del 24/10/2026, risposta a scelta multipla; `docs/ricerca/ispirazioni-fact-check-2026-10-24.md` | Matteo | ricerca e proposta AI, decisione umana |
| D-025 | 2026-10-24 | Contenuti | APITER è il disciplinare di una community (La Confraternita della Pizza, circa 2016), non un ente: testi corretti e voce non più «canonica» | correggerla e lasciarla canonica; toglierla | come D-024 | Matteo | come D-024 |
| D-026 | 2026-10-24 | Motore | Parametri delle ispirazioni allineati alle fonti: Martucci impasto diretto 24 h a temperatura ambiente, Bianco circa 18 h, Bosco 80% e 2009 | lasciarli e segnarli «da verificare» | come D-024 | Matteo | come D-024 |
| D-027 | 2026-10-24 | Contenuti | Le ricette dei maestri si chiamano «Ispirata a…» (regola C-5), anche nelle liste e nella ricerca | nome breve con una nota solo nella card | come D-024 | Matteo | come D-024 |
| D-028 | 2026-10-24 | Motore | Pizza al metro dalle fonti: 100 × 30 cm, forno a legna come avviso (D-020), lievitazione 6–12 h, 4–5 porzioni, condimenti dal menù di Gigino con dosi scalate (×3,7) | elettrico; lasciare com'era | sessione dell'agente del 24/10/2026, risposta a scelta multipla; `docs/ricerca/stili-fonti-2026-10-24.md` | Matteo | ricerca e proposta AI, decisione umana |
| D-029 | 2026-10-24 | Motore | Teglia romana sul disciplinare APITER con il forno di casa incluso: W 300–380, 600 g per 40 × 30, forno 250–320 °C (ideale 310), cottura 8–15 min | disciplinare alla lettera (non fattibile a casa); solo peso e cottura | come D-028 | Matteo | come D-028 |
| D-030 | 2026-10-24 | Motore | Tonda romana: idratazione 55–60%, ideale 380 °C e cottura 90–200 s dalle fonti, minimo 300 °C per restare fattibile a casa con avvisi; «mattarello o a mano» | fonti alla lettera (350 °C minimo); solo idratazione e mattarello | come D-028; la domanda è stata rifatta perché la prima descriveva male lo stato di oggi | Matteo | come D-028 |
| D-031 | 2026-10-24 | Motore | New York e Detroit: si correggono solo gli errori evidenti (NY «cottura 12–15 min» contro 9–12 del codice; Detroit 48 h e zucchero senza fonte → 8–24 h e niente zucchero, due fonti concordi); il resto resta «da verificare» | valori King Arthur per tutto; nessuna modifica | come D-028 | Matteo | come D-028 |
| D-032 | 2026-10-24 | UX | Le pizze fritte stanno in una sezione a parte dei consigli («Fritte in pentola»), non in «Perfetti per te» | lasciarle in classifica col punteggio | risposta di Matteo nella sessione dell'agente del 24/10/2026 | Matteo | proposta AI, decisione umana |
| D-033 | 2026-10-24 | Contenuti | Confermati i predefiniti: mortadella per la baciata, salmone di Spago per la California, cheese pizza per il greek pan | patate e porchetta; BBQ chicken | risposta di Matteo nella sessione dell'agente del 24/10/2026 | Matteo | come D-032 |
| D-034 | 2026-10-24 | Prestazioni | I video di cottura sono un esperimento: restano, il più leggeri possibile (P-5c) | toglierli; tenerli com'erano | risposta di Matteo nella sessione dell'agente del 24/10/2026 | Matteo | come D-032 |
| D-035 | 2026-10-24 | UX | U-3: Matteo chiede una proposta basata su uno studio UX per i campi «avanzati» di Personalizza | — | risposta di Matteo nella sessione dell'agente del 24/10/2026 | Matteo (delega la proposta, poi conferma il 24/10) | proposta AI, confermata da Matteo |
| D-036 | 2026-10-24 | UX | Niente passo iniziale «Quando la vuoi»: si entra sugli stili col momento consigliato (più vicino alle 24 h) in un chip modificabile | nessuna preferenza di tempo | proposta di Matteo, dettaglio a scelta multipla; risposta di Matteo nella sessione dell'agente del 24/10/2026 | Matteo | proposta umana, dettaglio AI |
| D-037 | 2026-10-24 | UX | Scopri diventa la prima tab e la pagina d'ingresso; Crea la seconda, con reindirizzamento dei link | Scopri solo la prima volta; solo l'ordine dei tab | come D-036 | Matteo | come D-036 |
| D-038 | 2026-10-24 | UX | First time experience contestuale: niente wizard all'avvio; in Crea un avviso chiede solo il forno finché non è scelto; la cucina completa si configura a richiesta dal profilo (NN/g, «Mobile Tutorials») | wizard breve saltabile all'avvio; solo scheda di benvenuto | risposta di Matteo nella sessione dell'agente del 24/10/2026 | Matteo | proposta AI, decisione umana |
| D-039 | 2026-10-24 | Contenuti | Foto degli stili (U-9): ammesse foto generate con GPT (`gpt-image-2.5` via Figma, file nel piano Poste Italiane), purché mostrino il prodotto giusto secondo le fonti dello stile; il criterio è la correttezza, non l'origine. Rifatte tonda romana, focaccia genovese, focaccia barese, sfincione; nuova la fritta tonda | solo foto vere; foto stock con licenza | risposta di Matteo nella sessione dell'agente del 24/10/2026 | Matteo | proposta AI, decisione umana |
| D-040 | 2026-10-24 | Brand | Il marchio (logo nel blob d'impasto, `VulcanHero`) torna in testata: in alto a sinistra delle tre tab su mobile, in riga col profilo, scorre con la pagina; su desktop resta il logo nella barra laterale. Badge «beta» non ripristinato | marchio grande solo su Scopri; schermata di caricamento; entrambe | risposta di Matteo nella sessione dell'agente del 24/10/2026 | Matteo | proposta AI, decisione umana |
| D-041 | 2026-10-24 | UX | Compatibilità: un solo numero, «Compatibilità con la tua cucina N/100», stesso calcolo e formato ovunque, icona a indicatore (non cuore); il «potresti arrivare a» come secondo valore dichiarato (audit totale §2.1 n. 1) | solo fasce; fasce + numero per livello | risposta di Matteo nella sessione dell'agente del 24/10/2026 | Matteo | proposta AI, decisione umana |
| D-042 | 2026-10-24 | UX | Quantità: si chiede «Per quante persone?» e l'app decide unità e peso per lo stile; i panetti restano modificabili (audit n. 14) | panetti con stima visibile | idem | Matteo | proposta AI, decisione umana |
| D-043 | 2026-10-24 | Prodotto | Uso professionale: via i blocchi (fino a 200 unità con campo numerico, peso panetto modificabile, misure nel link, temperatura libera), biga/poolish sceglibili per esperto e nerd, scheda di produzione stampabile, pizza al metro in metri (audit n. 15–19, 22) | solo una parte | idem | Matteo | proposta AI, decisione umana |
| D-044 | 2026-10-24 | Contenuti | Gergo: termini tecnici toccabili che aprono il glossario (voci mancanti aggiunte) e registro per livello, al principiante prima la cosa semplice e poi il termine (audit n. 32) | solo termini toccabili | idem | Matteo | proposta AI, decisione umana |
| D-045 | 2026-10-24 | Motore | Alternative a uno stile non fattibile: il minimo dello stile entro il 10 % sopra la temperatura del forno dell'utente (quanto recupera una pietra ben scaldata), audit n. 9 | minimo pari al forno (escludeva New York a 270 °C con 250 °C); nessun controllo | PR #53 | Matteo, delegata all'agente («sei tu l'esperto, decidi tu») | proposta e scelta AI su delega |
| D-046 | 2026-10-24 | Prodotto | Accesso: link via email, passkey e social login (Google, Apple, Facebook); ruoli admin, editor, tester e demo riconosciuti dall'app | solo email e password; solo codici d'invito | idem | Matteo | proposta AI, decisione umana |
| D-047 | 2026-10-24 | Prodotto | Utenza demo: usa tutta l'app, ma ricette e profilo non restano oltre la sessione | solo consultazione; come un utente normale | idem | Matteo | proposta AI, decisione umana |
| D-048 | 2026-10-24 | Dati | Database dei forni per marca e modello solo per i forni da pizza (temperatura massima e platea dalle schede del produttore, con fonte); il forno di casa resta generico | anche i forni di casa; rimandare | idem | Matteo | proposta AI, decisione umana |
| D-049 | 2026-10-24 | Architettura | Motore e CMS accessibili agli agenti con un server MCP sul Worker (strumenti per generare ricette, consigliare stili, leggere stili e glossario; poi widget grafici) | API REST con OpenAPI; entrambi | idem | Matteo | proposta AI, decisione umana |
| D-050 | 2026-10-24 | Motore | Dopo la verifica di GPT: il pre-fermento dura quanto dicono le fonti (biga 16 h, poolish 14 h) quando all'impasto finale restano almeno 8 h, altrimenti il 40 % come prima; pizze e teglie si cuociono una alla volta, quindi la cottura si ripete per il numero di pezzi | lasciare il 40 % fisso e la cottura singola dichiarati come limite; capienza del forno per tipo (senza fonte) | chat 24/10 («1. ok 2. ok») | Matteo | proposta AI, decisione umana |
| D-051 | 2026-10-28 | Architettura | Un solo main; la generalista e le versioni dedicate sono «edizioni» (dati JSON scelti in build con VULCAN_EDITION), ognuna con il suo Worker | un ramo a lungo termine per versione | chat 28/10 (domande a scelta) | Matteo | proposta AI, decisione umana |
| D-052 | 2026-10-28 | Architettura | Le edizioni dei marchi reali stanno in un repository privato separato (vulcan-editions); nel repository pubblico solo la generalista e demo con marchi inventati | rendere privato vulcan-pizza-lab; tutto pubblico | idem | Matteo | proposta AI, decisione umana |
| D-053 | 2026-10-28 | Rilascio | La produzione esce solo con approvazione su GitHub, con lo stesso commit già passato da main e dal test | deploy automatico a ogni merge | idem | Matteo | proposta AI, decisione umana |
| D-054 | 2026-10-28 | Prodotto | Prime edizioni: demo «forno» con marchio inventato (Fornace Aurora) ed edizione Effeuno (privata); primo partner da simulare: un produttore di forni | solo demo inventate; nessuna edizione per ora | idem | Matteo | proposta AI, decisione umana |
| D-055 | 2026-10-28 | Prodotto | Ogni stile dichiara la sua ricetta di riferimento («Riferimento»): il disciplinare dove esiste, altrimenti scelta di Matteo stile per stile; tutti i delta «prima → dopo» partono da lì | scelta stile per stile senza disciplinare; regola attuale (skill_hint massimo) | chat 28/10 (domande a scelta), docs/audit-ux-scienza-2026-10-28.md | Matteo | proposta AI, decisione umana |
| D-056 | 2026-10-28 | Prodotto | PizzaNerd diventa un interruttore globale «Mostra i dettagli tecnici», raggiungibile da Profilo, Crea e ricetta; il «Perché?» resta per tutti | legato al livello; PizzaNerd com'è | idem | Matteo | proposta AI, decisione umana |
| D-057 | 2026-10-28 | Motore | La «Compatibilità con la tua cucina» pesa solo fattibilità e fedeltà allo stile; le altre dimensioni diventano informazioni separate. Effetto sulla classifica misurato e mostrato prima di applicarlo (FW-06: pesi 55 / 45, misura in docs/audit-punteggio-d-e.md, guardia in decision-guards.test.ts) | 5 dimensioni spiegate; rinominare il numero | idem | Matteo | proposta AI, decisione umana |
| D-058 | 2026-10-28 | Prodotto | Le altre decisioni dell'audit UX e scienza (35 voci, docs/audit-ux-scienza-2026-10-28.md §Decisioni) seguono la raccomandazione dell'audit | rivederle una per una | idem («Accetta le raccomandazioni») | Matteo | proposta AI, accettata in blocco |
| D-059 | 2026-10-29 | Prestazioni | Il budget JS misura quello che scarica un utente: codice senza lingue ≤ 500 kB e codice + la lingua più pesante ≤ 600 kB; il totale con tutte le lingue resta solo come informazione (docs/budget-prestazioni.md) | alzare il tetto totale a 1.000 kB; recuperare peso prima di unire | idem («Misura per utente») | Matteo | proposta AI, scelta di Matteo |
| D-060 | 2026-10-29 | Prodotto | Le verifiche di dispensa («Se hai farina W…», «Se hai lievito») non sono più pill né rendono la ricetta «con condizioni»: valevano per ogni ricetta finché la dispensa non è detta, e la farina è già negli ingredienti. Resta «Serve farina…» quando la dispensa è detta e manca. La forza della farina si mostra come fascia dello stile («W 260–310»), la W puntuale solo nei confronti | lasciare la pill finché si compila la dispensa (scelta precedente, FW-09) | nota di Matteo («verrà sempre fuori la pill… con valori fin troppo precisi») | Matteo | segnalazione di Matteo, soluzione AI |
| D-061 | 2026-10-29 | Prodotto | Voce: Siri con un Comando rapido che chiama `/api/voice` e skill Alexa classica it-IT (`/alexa`), entrambe costruite sui tool MCP; Alexa+ con MCP Toolkit quando Amazon la apre ai non partner (docs/voce-siri-alexa.md) | app iOS nativa; aspettare Alexa+ (oggi solo per partner selezionati) | chat 29/10 («vabè, facciamo quel che si può per siri e alexas») | Matteo | proposta AI, decisione umana |
| D-062 | 2026-10-29 | Motore | Spareggio della compatibilità: solo a pari numero mostrato, e dentro lo stesso gruppo, viene prima lo stile che la cucina copre con più margine (media del margine di forno sul minimo dello stile e del margine di ore sulla maturazione minima, ciascuno fra 0 e 1; per le fritte solo il tempo). Il numero non cambia. Vale in Crea, in Scopri e in recommend_styles (`domain/kitchen-margin.ts`, nota `ranking-tiebreak`, guardia in decision-guards.test.ts; misura in docs/audit-punteggio-d-e.md) | stili iconici prima; maturazione stimata; ordine del catalogo | lettura di docs/audit-punteggio-d-e.md (FW-06, D-E) | Matteo | proposta AI, decisione umana |
| D-063 | 2026-10-29 | Motore | Il tetto di autenticità per il combustibile (75) vale solo se il forno non arriva alla temperatura minima dello stile (`baking.temp_c_range[0]`, 430 °C per la Napoletana STG). Un forno elettrico o a gas che ci arriva non ha né il tetto né i −15 punti sull'asse attrezzatura; che lo stile preveda la legna resta scritto al livello 2 come informazione (`auth.woodByMethod`), non come penalità, e gli avvisi «forno non a legna / a carbone» escono dalle condizioni del verdetto (nota `authenticity-fuel-cap`, guardia in decision-guards.test.ts; confermato da Matteo con le due risposte del 29/10) | tetto più morbido a 85; lasciare 75 | idem | Matteo | proposta AI, decisione umana |
| D-064 | 2026-10-29 | Prestazioni | Quando il budget D-059 sfora, si recupera con un intervento strutturale e non alzando i tetti: con G5 (500,6 kB) il router passa da data router a `<BrowserRouter>` dichiarativo, −16 kB (`docs/budget-prestazioni.md`, «Ondata 3») | alzare i tetti a 505/605 kB; togliere parte di G5 (condivisione e rinomina nel ricettario) | sessione dell'agente del 29/10/2026, risposta a scelta multipla («Recupero strutturale») | Matteo | proposta AI, scelta di Matteo |

D-008 e D-009 arrivano dal brief del lavoro come decisioni del proprietario;
nel repository non c'è ancora un riscontro scritto, quindi restano da
confermare come le altre.

## 4. Materiali generati con AI

- Immagini: `docs/IMAGES_AUDIT.md` le descrive con prompt per generatori
  (Midjourney v6 o DALL-E 3). Quali immagini del catalogo vengano da lì è da
  verificare file per file.
- Codice e documenti: 25 dei 60 commit visibili hanno un segno AI (trailer o
  autore). Gli altri non provano un lavoro solo umano.
- Testi di ricerca e audit di ruolo («Audit …» nel motore): potrebbero venire
  da sessioni AI. Ipotesi da verificare, non dedurre.

## 5. Fonti esterne e licenze

- Base Notion del progetto: `docs/confronto-notion-vs-codebase.md`.
- Disciplinari e letteratura citati nei commenti del motore (per esempio STG
  AVPN 2024): elenco da completare con link e licenza.
- Foto Unsplash dello showcase e crediti: `ATTRIBUTIONS.md`.

## 6. Indice delle evidenze

Comandi per rigenerare i numeri di questo documento:

```bash
git rev-parse --is-shallow-repository             # true = storia incompleta
git log --format="%h|%an|%ad|%s" --date=short     # cronologia visibile
git log --format="%h %an" | awk '{print $2,$3}' | sort | uniq -c   # autori
git log --format="%B" | grep -ciE "co-authored-by:.*(claude|anthropic|codex|openai|gemini|copilot)|claude.ai/code|generated with"
git log --format="%h|%ad|%s" --date=short | grep -iE "revert|prune|decisio"
grep -c "Audit" src/app/domain/pizza-engine.ts
```

Per la cronologia completa: clonare senza `--depth` oppure esportare da
GitHub PR, review e merge.

## 7. Manutenzione

- Ogni PR compila la sezione «Decisione umana» del template
  (`.github/pull_request_template.md`): cosa, alternative scartate, link.
- Facoltativo: trailer `Decision: D-0xx` nel commit che applica una decisione.
- Revisione mensile di circa 15 minuti: nuove voci dal template delle PR e
  conferma del campo «Decisore» da parte di Matteo.
- Uno script che rigeneri l'indice non è previsto in questa fase.
- Guardie delle decisioni (FW-20, audit del 28/10/2026): D-032, D-036 e D-038
  erano state annullate da una PR successiva senza una nuova decisione, e
  Matteo le ha confermate (D-R, dentro D-058). Ogni decisione che ha un
  comportamento verificabile ha un test in
  `src/app/domain/decision-guards.test.ts`, con l'ID nel nome
  (`D-036: Crea si apre sul momento consigliato`). **Chi rovescia una
  decisione cambia il test e registra una nuova D-0xx** in questo registro,
  che dice quale decisione supera. Un
  test di guardia rosso non si corregge cambiando il test senza la decisione.
