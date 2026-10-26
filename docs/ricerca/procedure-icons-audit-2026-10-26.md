# Icone delle fasi — 26 ottobre 2026

## Problemi osservati

- Nella timeline un'immagine con molti dettagli, ridotta a 34 px, si confondeva con il fondo terracotta del primo nodo.
- La selezione dell'immagine conosceva solo l'ID: riscaldamento dell'olio e frittura mostravano un forno a legna; riposo senza lievito e appretto in teglia potevano mostrare impasto cresciuto o una cassetta di panetti.
- La ricerca per sottostringhe interpretava `bake` nei nomi dei condimenti come cottura. Gli ID non riconosciuti diventavano una fetta di pizza.
- Le sessioni cucina non conservavano la variante visiva del passaggio.

## Correzioni

La timeline usa simboli vettoriali da 24 px nei nodi esistenti, con tratti arrotondati e colori semantici del tema. Il simbolo dell'impasto raffigura ciotola e spatola. Le immagini grandi restano nei contesti didattici e nelle azioni che rappresentano; nelle varianti incompatibili si usa un simbolo neutro. La cottura non suggerisce un combustibile specifico.

La scelta dell'azione segue gli ID canonici e le varianti del motore. Per i passaggi dei condimenti usa il punto di inserimento del catalogo, con eccezioni esplicite per spaccatura/farcitura e Fugazza. Un passaggio sconosciuto riceve un simbolo di preparazione, senza inventare una cottura o un prodotto finito.

La sessione cucina salva l'azione risolta. Per le sessioni precedenti, senza il nuovo campo, recupera frittura, impasto senza lievito e appretto in teglia dallo stile. Le icone sono decorative: il nome della fase rimane il contenuto accessibile.

## Verifiche

- Contrasto misurato dei simboli sui nodi opachi: minimo **3,42:1**, sopra 3:1 per la grafica. Tre temi, chiaro/scuro, larghezze 390 e 1440 px.
- Browser Chrome: 12 combinazioni di tema/dimensione, più timeline di fritta, Recco, Genovese, Baciata e Spaccata. Nessun overflow nei cinque percorsi.
- WebKit: fritta, Recco e Genovese, chiaro/scuro a 390 px. Verificata la distinzione delle azioni e l'assenza di overflow.
- Sessione cucina precedente senza metadati: riapertura della frittura con pentola, senza forno.
- Test di selezione su tutti i passaggi di preparazione/assemblaggio del catalogo e sui casi ambigui; controlli di markup per dimensioni SVG, accessibilità decorativa e varianti grandi.

Evidenze locali in `output/playwright/icon-audit/`. Le prove locali del server di sviluppo registrano anche il CORS di `/api/config` dalla porta di test; non è un errore delle icone. Le verifiche non equivalgono a un collaudo su hardware iPhone fisico.
