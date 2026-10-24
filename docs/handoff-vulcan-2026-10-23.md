# Handoff Vulcan · 23 ottobre 2026

Per gli agenti che lavorano su `zatteogit/vulcan-pizza-lab`. Questo file è pubblico: niente prezzi, contatti o strategia commerciale. Quelli stanno nel documento privato di Matteo in `basecamp`.

Leggi prima `CLAUDE.md`: comandi, livelli dei token, cricchetto semantico, CMS e i18n, debug overlay.

## Obiettivo in due fasi

1. **Fase 1: sistemare tutto il sistemabile**, dal motore alla UX. Il prodotto pubblico deve diventare affidabile e dimostrabile.
2. **Fase 2: renderlo pronto al B2B2C.** Un'azienda (mulino, produttore di forni, marca di farine o attrezzature) offre Vulcan ai propri clienti con il proprio catalogo e la propria identità. L'azienda paga, chi fa la pizza in casa lo usa gratis. Il motore resta unico e neutrale, senza un fork per ogni partner.

**Decisione di Matteo (23/10/2026):** la fase 2 parte solo quando la fase 1 è completa, non soltanto i P0.

## 1. Stato al 23/10/2026

| Area | Stato |
|---|---|
| Ramo principale | `main`, merge `ebdd02c` (PR #45) |
| Verifica | `npm run quality:check` passa: typecheck a 0 errori, 105 test in 13 file, tutti i guard verdi (token, semantica, CSS, tier DS, i18n, architettura, codice morto) |
| Motore | Correzioni ENG-1…ENG-7 del 22/10 unite. Dettaglio in `docs/motore-correzioni-2026-10-22.md` |
| Nome | Un solo punto in `src/app/config/brand.ts`. Il nome definitivo non è deciso |
| Produzione | Worker Cloudflare. `/api/annotations` e `/api/config` rispondono 404. Overlay di debug e tema globale fuori dalla build. Intestazioni di sicurezza attive |
| Media | Immagini WebP 1280/640 con `srcset` e lazy; poster per i video. `dist/` circa 109 MB, quasi tutto video: da misurare |
| Annotazioni di debug | 52 nel registro, 0 aperte |
| Dati utente | Solo `localStorage`, senza account né sincronizzazione |
| Analytics | Nessuna |
| Embed / tenant | Nessuno |
| Contenuti | 28 stili, 7 lingue tramite CMS (`cms-context.tsx` più 6 file in `locales/`) |

Due stash locali (`wip/vulcan-engine`, `wip/vulcan-media`) sono parziali del 22/10 sera. I loro rami sono già stati uniti: prima di riusarli, controlla che non siano superati.

## 2. Regole di lavoro

- Si lavora su un ramo dedicato. PR verso `main`, con il modello `.github/pull_request_template.md` e la riga di autorialità (`docs/autorialita.md`).
- Prima di ogni push: `npm run verify`. Se tocchi UI o media, anche `npm run build`.
- Il motore (`src/app/domain/**`) resta puro: niente React, DOM o CSS. Ogni correzione al motore porta misure prima/dopo e test, come in `docs/motore-correzioni-2026-10-22.md`.
- Nessun testo nuovo fuori dal CMS. Ogni stringa va nelle 7 lingue.
- Una baseline del cricchetto non si rigenera per far passare lavoro nuovo.
- Ogni dato nuovo (farina, forno, parametro, foto) ha fonte e licenza.
- Vulcan non promette dosi esatte. Separa formule esatte (bilancio di massa, percentuali), stime empiriche (lievitazione, forno) e ipotesi (alveolatura, qualità attesa).
- Le decisioni del proprietario si chiedono con domande a scelta, l'opzione consigliata per prima (§6).

## 3. Fase 1 · Sistemare

Priorità: **P0** blocca fiducia o demo; **P1** contenuto sbagliato o incompleto; **P2** chiarezza; **P3** coerenza visiva.

### 3.1 Motore

| ID | Pr. | Problema | Intervento | Fonte |
|---|---|---|---|---|
| M-1 | P0 | `meal_deadline` è stato unito, ma il documento dice «da confermare da Matteo» | Chiedere conferma (§6); se no, ripristinare | motore-correzioni, rev. 22/10 |
| M-2 | P0 | Gli slot del pasto arrotondano le ore con `Math.round`: la finestra può superare di 30 min il tempo reale, senza avviso | Opzione consigliata (a): ore al quarto d'ora per difetto, testi formattati per lingua | idem, «Da decidere» |
| M-3 | P1 | `recommendStyles` confronta il minimo dello stile con ore intere | Allineare al quarto d'ora di M-2 | idem |
| M-4 | P1 | Ottimizzatore della Focaccia di Recco: i candidati arrotondati all'ora portano a 3 h, fuori dal range 0,5–2 h | Candidati al quarto d'ora o vincolati al range | idem |
| M-5 | P2 | Le motivazioni dell'ottimizzatore mostrano i decimali col punto (63.7%) | Formattazione per lingua | idem |
| M-6 | P1 | Pizza fritta e montanara: il passaggio dice «Forno al massimo» con frittura a 185 °C | Passaggio e testi per l'olio | ENG-5, limite noto |
| M-7 | P1 | Pizza fritta chiusa non separata; manca la foto | Stile o variante separata, con fonte | piano-interventi B2 |
| M-8 | P1 | Stili non lievitati (Recco): la fase si chiama ancora «Lievitazione e maturazione» | Verificare il configuratore dopo ENG-5 e rinominare in «Riposo» | piano-interventi B-blend |
| M-9 | P0 | Mancano golden test per stile (masse, forno, tempi, impossibilità) | Suite di casi fissi per i 28 stili, con esiti attesi «riuscito / con avvisi / impossibile» | report ricerca §16, App. C |
| M-10 | P0 | Vincoli impossibili: verificare che il motore lo dica sempre. Esempio: napoletana verace, pronta in 2 h, forno domestico da 250 °C | Esito esplicito «non fattibile così» con alternative; niente ricetta silenziosamente degradata | report ricerca §10 |
| M-11 | P1 | Lievito poco trasparente (il problema più lamentato nelle app concorrenti) | Mostrare modello, fonte e margine; correzione personale salvata («la mia cucina lievita più veloce») | analisi a rovescio, §2.1 |

### 3.2 Contenuti

| ID | Pr. | Intervento | Fonte |
|---|---|---|---|
| C-1 | P1 | Linee guida editoriali per stile, come fonte di verità (INT-B3) | piano-interventi |
| C-2 | P1 | Completare i condimenti regionali per stile (INT-B1, in corso) | idem |
| C-3 | P2 | Suggeritore di farine che tiene conto dei mix (INT-B-blend, follow-up) | idem |
| C-4 | P1 | Fonti e date per ogni dato tecnico di stili, farine e forni, pronte per essere sostituite dai dati di un partner | report ricerca §21 |
| C-5 | P1 | Nessuna ricetta «firmata» o marchio terzo che suggerisca accordi inesistenti: formula «ispirato a» con fonte | report ricerca §22 |

### 3.3 UX

| ID | Pr. | Intervento | Fonte |
|---|---|---|---|
| U-1 | P0 | **Ricette che non si perdono:** esportazione e importazione (file e link), versioni, recupero da `localStorage` corrotto. È la prima lamentela verso Ooni e PizzApp | analisi a rovescio |
| U-2 | P0 | Partire da ciò che l'utente ha: «ho 750 g di farina», «si cena sabato alle 20», «ho questo forno e questa farina» | idem |
| U-3 | P1 | Campi avanzati nascondibili, senza togliere opzioni con un aggiornamento | idem |
| U-4 | P1 | Sezione acqua / Regola 55 (INT-C8): acqua totale, impasto, prefermento, temperatura | piano-interventi |
| U-5 | P1 | Ricerca a tutta pagina con la spec già confermata (dock che si trasforma, chip di categoria); sostituisce `SearchOverlay` | piano-interventi INT-NAV |
| U-6 | P2 | Completare INT-C6 (transizione del momento) e INT-C10 (pannello dello stile) | idem |
| U-7 | P2 | Notifiche: dire con onestà cosa funziona a app chiusa. Niente promesse senza service worker e push verificati | report ricerca §22 |
| U-8 | P3 | Emoji → icone SVG (D1), icone del glossario per categoria (D2), audit delle maiuscole (D5), badge della navigazione (D7) | piano-interventi |
| U-9 | P3 | Coerenza fotografica: niente foto visibilmente generate, ogni foto mostra il prodotto giusto (D3) | idem |
| U-10 | P1 | Audit di accessibilità WCAG 2.1 AA sul percorso principale; documentarlo, servirà al partner | analisi a rovescio |

### 3.4 Piattaforma e rilascio

| ID | Pr. | Intervento | Fonte |
|---|---|---|---|
| P-1 | P0 | Nascondere `/dev`, `/cms` e `/design-system` in produzione | decisione di Matteo, 22/10 |
| P-2 | P0 | Sourcemap nascoste in produzione (`build.sourcemap: 'hidden'`) | idem |
| P-3 | P1 | Esportare i pin storici del debug in un file d'archivio | idem |
| P-4 | P0 | Ambiente di test separato (`vulcan-test`): merge → test; approvazione → produzione dello stesso commit. Accesso solo su invito (Cloudflare Access), `noindex`, D1 di test con giurisdizione `eu` | decisioni del 22/10 |
| P-5 | P1 | Budget di prestazioni: misurare JS, CSS, LCP e CLS; decidere i video che restano | report ricerca §16, §22 |

**Criterio di chiusura della fase 1:** tutte le voci M, C, U e P chiuse, o rinviate per iscritto con il motivo; `verify` e `build` verdi, golden test in CI, percorso principale controllato a 390 e 1280 px in chiaro e scuro.

## 4. Fase 2 · B2B2C

### 4.1 Cosa vuol dire qui

- **Chi paga:** l'azienda partner.
- **Chi usa:** i suoi clienti, cioè chi fa la pizza in casa.
- **Cosa compra:** un servizio configurabile, non il codice. Esperienza integrabile nel suo sito, catalogo limitato ai suoi prodotti, tema e voce del marchio, aggiornamenti e dati aggregati d'uso.
- **Formula del primo pilota:** co-branded o embed. Il white-label completo viene dopo; un'API pubblica del motore non si apre senza regole.

### 4.2 Capacità da costruire

| ID | Capacità | Note |
|---|---|---|
| B-1 | **Configurazione del tenant** versionata e validata da uno schema: catalogo (farine, forni), tema, logo, lingue, funzioni attive, testi legali | Un file di configurazione per partner, non un fork. Cambiare la configurazione non tocca il motore |
| B-2 | **Embed:** iframe con ridimensionamento via `postMessage`, CSP e `frame-ancestors` per dominio del partner, modalità senza navigazione dell'app | Prima un URL dedicato per tenant, poi lo script di embed |
| B-3 | **Dati del partner:** farine con valori a intervallo (W, P/L, proteine, assorbimento), fonte, data della scheda tecnica e diritto d'uso; forni con capacità reali, non solo la temperatura pubblicizzata | Il modello attuale di `flour-database.ts` ha 26 voci: va esteso, non duplicato |
| B-4 | **Neutralità:** il motore raccomanda per merito; i contenuti del partner sono etichettati come tali | Requisito di fiducia, verso gli utenti e verso altri partner |
| B-5 | **Analytics aggregate e rispettose della privacy:** vista → configurazione → ricetta → timeline → feedback. Niente dati personali; consenso dove serve | Cloudflare Web Analytics per traffico e prestazioni; eventi di funnel propri |
| B-6 | **Due tenant dimostrativi con marchi inventati:** «mulino» (catalogo farine) e «forno» (profili attrezzatura) | Mai marchi reali senza accordo. Una demo con dati di un'azienda si mostra solo a quell'azienda |
| B-7 | **Guida d'integrazione** e pagina di stato | Per il pilota bastano documentazione e un contatto |
| B-8 | **Report per il partner:** cruscotto minimo con i dati aggregati del suo tenant | Fase 2b, dopo il primo pilota |

### 4.3 Fuori perimetro

- Checkout, pagamenti, spedizioni, assicurazioni: nemmeno su richiesta del partner.
- Integrazioni hardware o firmware dei forni.
- Account obbligatorio per le funzioni di base.
- Pubblicità e consensi che bloccano l'app.
- Copiare testi, ricette, schermate o nomi di altri prodotti.

### 4.4 L'app pubblica

Resta gratuita e usabile. Fa da demo, da canale di prova e da reputazione. Le funzioni non si tolgono: per il partner si espone il percorso più adatto al suo pubblico, con la stessa logica di dominio.

## 5. Ordine consigliato

Fase 1, per intero:

1. M-1, M-2 (decisioni), P-1, P-2: piccoli e sbloccano il resto.
2. M-9, M-10: golden test e impossibilità dichiarata. Sono la base per tutto ciò che segue.
3. U-1, U-2: ricette che non si perdono, partenza da ciò che si ha.
4. P-4: ambiente di test.
5. M-3…M-8, M-11; C-1…C-5; U-3…U-10; P-3, P-5.
6. Chiusura: criterio del §3.4 su tutte le voci, non solo sui P0.

Fase 2:

7. B-1, B-2, B-6: configurazione del tenant ed embed con due demo inventate.
8. B-3, B-4, B-5, B-7; poi B-8.

## 6. Decisioni da chiedere a Matteo

1. ~~**`meal_deadline`** (M-1)~~: confermato il 23/10 (D-010).
2. ~~**Arrotondamento degli slot** (M-2)~~: quarto d'ora per difetto, deciso il 23/10 (D-011).
3. ~~Quanto della fase 1 prima della fase 2~~: deciso il 23/10, tutta la fase 1 prima.
4. **Primo tipo di partner da simulare:** (a, consigliata) mulino, perché catalogo farine e dati tecnici sono il cuore del motore; (b) produttore di forni.
5. **Nome:** resta Vulcan finché non arriva un parere sul marchio. Non rinominare senza decisione: il marchio grafico è una «V».

## 6bis. Avanzamento

| Data | Voci chiuse | Dove |
|---|---|---|
| 23–24/10/2026 | M-1 (confermato), M-2, M-3, M-4, M-5, M-9, M-10, P-1, P-2 | ramo `claude/bold-brahmagupta-s484he`; dettaglio in `docs/motore-correzioni-2026-10-22.md` |
| 24/10/2026 | I18N-1, U-1, U-2, M-11 | stesso ramo; vedi sotto |
| 24/10/2026 | P-4 (pronto), M-6, M-8, C-4, I18N-2, C-5, P-3, P-5 (budget e font) | stesso ramo; vedi sotto |

Emerse nel lavoro, da pianificare in fase 1:

- ~~**I18N-1 (P1)**~~ chiuso il 24/10: catalogo `uiMessage` (360 stringhe) nelle
  6 lingue, caricato con il bundle della lingua. Corretti anche: 129 chiamate
  `uiMessage` eseguite al caricamento del modulo (restavano in italiano, ora getter;
  un test lo impedisce), banner «CMS attivo — 1769 campi modificati» mostrato in
  produzione a chi non usa l'italiano, nomi dei forni, dispensa, grasso, uso della
  farina, sottotitolo del procedimento, tabella dei pre-fermenti, badge di Scopri,
  P21 del troubleshooting, date relative del ricettario. Scansione IT↔EN/DE delle
  pagine principali: restano solo nomi propri. Da rivedere da un madrelingua: i
  cataloghi sono traduzioni automatiche controllate su chiavi e segnaposto.
- ~~**U-1 (P0)**~~ chiuso il 24/10: ricettario che non si perde. Un JSON
  corrotto non azzera più tutto (copia di sicurezza a specchio e quarantena delle
  voci illeggibili); oltre il limite (ora 200) non si perde più nulla in silenzio;
  esportazione e importazione da file versionato, con unione senza doppioni; copia
  link per ricetta; «Annulla» dopo l'eliminazione; avviso che le ricette stanno
  solo nel browser. Dal 24/10 anche l'avviso quando lo storage è pieno al
  salvataggio dalla ricetta (prima il toast diceva «aggiunto» e l'uscita con
  «Salva» perdeva la versione).
- ~~**U-2 (P0)**~~ chiuso il 24/10: si parte da ciò che si ha. «Si cena sabato
  alle 20»: voce «Scegli giorno e ora» accanto agli slot (da 1 h a 7 giorni, ore al
  quarto d'ora per difetto, ripristinata dalla bozza). «Ho 750 g di farina»:
  pannello sotto i panetti che dice quanti ne stanno e quanta farina avanza, e li
  applica. Forno e farine della dispensa c'erano già.
- ~~**C-4 (P1)**~~ chiuso il 24/10: registro delle fonti `docs/fonti-dati.md`
  (stato verificato / plausibile / da verificare / errato per ogni dato) e
  correzioni decise da Matteo (D-015…D-018): Pinsa, Napoletana STG con versione
  AVPN, Recco, olio di frittura, W delle farine di marca, Petra 3, falling number
  5 Stagioni, commento sul Q10. Restano «da verificare» gli stili senza
  disciplinare: elenco in `docs/fonti-dati.md`, «Fonti mancanti».
- ~~**I18N-2 (P1)**~~ chiuso il 24/10: libreria condimenti (61 concetti, 94
  ricette, 128 passi, 1004 testi) tradotta nelle 6 lingue in
  `src/app/data/topping-i18n/`, applicata dalla UI (il motore resta in italiano);
  passi della timeline con chiave e parametri (`TimelineStep.msg`) invece del
  testo italiano composto. Test di copertura per lingua. Traduzioni automatiche:
  da rivedere da madrelingua (note dei traduttori nella PR).
- ~~**C-5**~~ chiuso il 24/10: «Signature» diventa «Ispirazione» («Ispirato al
  metodo Bonci»); le interpretazioni di maestri e pizzerie dicono che sono
  ricostruzioni da fonti pubbliche, non ricette fornite da loro.
- ~~**P-3**~~ chiuso il 24/10: annotazioni di debug archiviate in `docs/archivio/`.
- **P-5** misurato il 24/10: `docs/budget-prestazioni.md`, controllo
  `npm run check:budget` in CI. Restano P-5a (motore in idle sulla home), P-5c
  (video, serve decisione) e P-5d.
- ~~**M-7 (P1)**~~ chiuso il 24/10: nessuna fonte per una fritta aperta diversa
  dalla montanara; aggiunta la «Pizza fritta tonda» dell'AVPN (D-022) e impasto
  delle fritte allineato all'AVPN con lievitazione 8–24 h (D-023). Manca una
  foto vera della tonda.
- ~~**I18N-4**~~ chiuso il 24/10: 14 stili su 28 non avevano descrizione e
  caratteristiche nel CMS e mostravano l'italiano in tutte le lingue; ora un test
  lo vieta per ogni stile.
- ~~**D-020, D-021**~~: forno a legna come avviso; due forni a gas.
- ~~**C-1 (P1)**~~ chiuso il 24/10: `docs/linee-guida-stili.md` (regole, modello
  di scheda, stato dei 29 stili, priorità per C-2) e test
  `style-editorial.test.ts`. Il test ha trovato tre stili (baciata, California,
  greek pan) il cui condimento predefinito non portava a nessuna ricetta:
  corretti. Corretta anche l'attribuzione della BBQ chicken (Ed LaDou per
  California Pizza Kitchen, 1985, non Wolfgang Puck) in 7 lingue.
- ~~**I18N-5**~~ chiuso il 24/10: fact-check delle 14 ispirazioni (126
  affermazioni, 21 errate: `docs/ricerca/ispirazioni-fact-check-2026-10-24.md`,
  riassunto in `docs/fonti-dati.md` §5) e testi riscritti sulle fonti. Decisioni
  D-024…D-027: tolte «Malati di pizza» e «Confraternita della pinsa»; APITER è il
  disciplinare di una community; parametri di Martucci, Bianco e Bosco allineati
  alle fonti; le ricette dei maestri si chiamano «Ispirata a…», anche nella card.
  Ispirazioni e ricette iconiche tradotte in 6 lingue (`data/inspiration-i18n/`,
  test di copertura con gli stessi numeri dell'italiano); `LOCALE_BUNDLE_REV` 3. Restano da verificare l'anno di
  Capuano e il nome esatto del consorzio di Recco.
- ~~**U-5 (P1)**~~ chiuso il 24/10: ricerca a tutta pagina secondo la spec
  INT-NAV. Su mobile la capsula dei tab diventa il campo e la lente «Annulla»;
  su desktop e nella pagina ricetta il campo sta in testa ai risultati. I
  risultati prendono il posto della pagina, che resta montata (Annulla/Esc
  riportano scroll e focus dove erano). Indice puro in
  `features/search/search-index.ts` con test: testi della lingua attiva
  (condimenti, prefermenti, glossario, problemi), accenti e maiuscole
  ignorati, più parole in AND, ordinamento per pertinenza; problemi e
  prefermenti aprono la voce giusta (`?issue=`, `#pf-`). `SearchOverlay`
  rimosso. Le ricette iconiche restano in italiano finché non chiude I18N-5.
- ~~**U-10 (P1)**~~ chiuso il 24/10: audit WCAG 2.1 AA del percorso principale
  (`docs/accessibilita-audit-2026-10.md`, 30 voci) e correzioni di tutte le P1,
  P2 e P3; F28 con D-019 (testo minimo 12 px, 11 px solo maiuscolo, controllo
  `check:type-floor` in verify). axe sui 32 scenari: da 32 violazioni a 0.
  Non è stato fatto un test con screen reader su un dispositivo reale.
- ~~**I18N-3 (P1)**~~ chiuso il 24/10: i bundle CMS di es/fr/pt non avevano 310
  testi e quelli di de/ja 193 (modalità cottura, durate, «domani», glossario
  vuoto): ricadevano sull'inglese; a en ne mancavano 24 (ricadevano
  sull'italiano). Tradotti e inseriti; un test (`locale-parity.test.ts`) vieta
  nuovi buchi. Corretti anche «OGGI» e «ca.» fissi nella timeline, refusi in ja
  (焦き→焼き, 麻棒→麺棒, 昇食→昼食 e altri), forme del portoghese europeo in pt
  (pt = pt-BR), note del Q₁₀ in inglese nel glossario italiano.
- Le chiavi `timeSlots.day_after` e `timeSlots.weekend` del CMS non corrispondono
  a nessuno slot del motore, e i sottotitoli fissi degli slot non si usano più.

## 7. Riferimenti nel repository

- `CLAUDE.md`: architettura, comandi, regole.
- `docs/motore-correzioni-2026-10-22.md`: correzioni ENG-1…7 e voci aperte.
- `docs/piano-interventi.md`: workstream A–E e INT-NAV, con lo stato.
- `docs/ricerca/report-editoriale-2026-10-22.md`: report di ricerca, versione pubblica.
- `docs/brand/nome-prodotto.md`: procedura per il nome.
- `docs/autorialita.md`: registro del contributo umano.
