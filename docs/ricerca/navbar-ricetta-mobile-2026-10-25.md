# Navbar ricetta mobile: densità e adattamento al viewport

La barra mobile non contiene più la ricerca. Durante la discesa nasconde le etichette e mantiene l'icona Ricetta, metodo/tempo e nome del condimento, separati visivamente. La risalita ripristina la forma completa. I nomi accessibili restano completi e il pannello riferisce il tab effettivamente presente su mobile o desktop.

## Movimento

Un solo valore Motion, animato con la molla di navigazione del design system, guida larghezza, altezza, spaziatura, dissolvenze e divisori. I valori restano montati e visibili. Invertire lo scroll cambia il target della molla, preservando continuità e velocità; non avvia una seconda animazione indipendente.

La geometria si ferma durante una pressione e riprende al rilascio/cancel/blur per stabilizzare il bersaglio. Con movimento ridotto la densità cambia direttamente, senza spring né feedback di scala sui tab. Gli aggiornamenti per frame passano attraverso MotionValue e custom property, senza render React a ogni frame; il layout resta confinato alla piccola capsula fissa.

## Browser e dispositivo

- Nessun riconoscimento tramite user agent: breakpoint, pointer coarse, safe area, VisualViewport e preferenze dell'utente.
- Telefoni touch in orizzontale, fino a 1023 px e con altezza ridotta: dock mobile e minore distanza dal bordo. Su desktop resta la barra inline.
- Insets sinistro, destro e inferiore per evitare aree non utilizzabili del display.
- Tastiera: focus su un editor e riduzione significativa dell'area disponibile nascondono temporaneamente il dock. Sono gestiti viewport sovrapposto e ridimensionato, zoom normalizzato e trasferimenti di focus. È una deduzione geometrica, non un'API universale della tastiera.
- Lo scroll mantiene il clamp per il rubber-band, le soglie di direzione e la risincronizzazione sui cambi del viewport.

## Verifica

Chromium e WebKit 26.6, quest'ultimo con emulazione iPhone 15, alle larghezze 320/390/430 px: etichette nascoste, valori conservati, ricerca assente, divisori presenti, aree di tocco almeno 46×46 px. Altezza osservata: 58 px estesa, 50 px compatta.

WebKit, viewport 844×390 e puntatore coarse: dock visibile, nessuna barra inline duplicata, nessun overflow; offset esteso 12 px nell'ambiente emulato. Controllata anche la resa scura.

Traccia sintetica Chromium di un'inversione durante il morph: valori invariati e visibili in tutti i frame campionati, nessun Long Task rilevato. I numeri del campionamento dipendono dall'ambiente di automazione e non attestano frame rate su hardware reale.

Verificati focus/nomi accessibili, movimento ridotto, tap durante la transizione, ripristino dopo tastiera (geometria simulata), navigazione dei tab, desktop e regressione del dock principale. I test automatici coprono anche tastiera sovrapposta, viewport ridimensionato, barre del browser, pinch zoom e zoom del campo durante la comparsa della tastiera.

L'emulazione WebKit non equivale a un collaudo su un iPhone fisico con la sua tastiera e le barre native di Safari.
