# Archivio foto condiviso

Richiesta di Matteo, 30 ottobre 2026: pubblicare la selezione fotografica su
Vulcan online tramite CMS, conservando le fotografie precedenti e il ripristino.

## Uso

Aprire `/cms/foto` e accedere con l'account Google amministratore o editor.
Scegliere una scheda e usare «Usa questa foto» sulla versione desiderata.
La scelta è condivisa fra visitatori e lingue; le altre versioni restano
consultabili, ingrandibili e ripristinabili. Una scheda CMS rimasta aperta
non può sovrascrivere una pubblicazione più recente senza ricaricare.

Il resto del vecchio CMS locale, `/dev` e il design system restano esclusi
dalla build di produzione. Solo questo archivio è disponibile online;
la lettura della libreria e le modifiche richiedono una sessione editor/admin.
Le foto pubblicate sono leggibili anche senza accesso.

## Import della revisione

`scripts/prepare-photo-library.py <cartella-audit>` importa la selezione
verificata, incluse le ultime correzioni di Pinsa e Metro (round8).
Non sostituisce gli asset di fallback. Copia prima le vecchie immagini
WebP **byte per byte**, poi prepara le nuove in due larghezze.
I master PNG della revisione rimangono nella cartella audit originale.

I file in `public/media/photos/` hanno il proprio SHA-256 nel nome:
non si sovrascrivono e non si eliminano durante un ripristino.
`public/media/catalog.json` descrive 26 schede e 52 versioni (25 stili e
il condimento Sbagliata). La mappa `media-source-map.ts` associa le immagini
di fallback alle schede CMS, anche dopo il cambio di hash di Vite.

Applicare `migrations/0002-reviewed-photos.sql` al D1 di test e, dopo
backup, al D1 di produzione. È un import idempotente: `INSERT OR IGNORE`
non sovrascrive successive scelte editoriali. Le versioni sono in
`media_versions`; `media_publications` contiene solo il puntatore attivo.
Non esiste un endpoint di cancellazione.

Le immagini sono asset statici immutabili; il database contiene soltanto
metadati e scelte. Non serve attivare un nuovo servizio di archiviazione.
L'API `/api/media/active` si aggiorna a ogni apertura; se non è disponibile,
le foto di fallback restano utilizzabili. Gli account non editoriali non
possono leggere la libreria né pubblicare. Le scritture verificano sessione,
origine, associazione foto/scheda e versione precedente.

## Verifica e distribuzione

Test: conservazione degli originali, hash e miniature, autorizzazioni,
scritture tra origini diverse, richieste non valide e ripristino.
Nel browser locale sono provati pubblicazione, ritorno alla precedente,
ripubblicazione della scelta e lettura dalla griglia pubblica.

Il budget delle immagini pubbliche conta, per ogni scheda CMS, la versione
responsiva più grande selezionabile, oltre alle altre immagini della UI.
Le copie storiche non vengono sommate come se si scaricassero tutte insieme.
Il report misura separatamente l’archivio e il CSS caricato solo nel CMS. I limiti delle
esperienze pubbliche non vengono aumentati. Il controllo duplicati ammette
solo copie archiviate correttamente indirizzate per hash e referenziate nel
manifest; i test confrontano i precedenti con i fallback originali.

Pubblicazione attraverso il consueto workflow `deploy-production`, con
lo SHA completo passato da main/test. Dopo il deploy verificare il manifest
pubblico, tutte le foto attive e l'archivio riservato.
