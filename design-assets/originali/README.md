# Originali delle immagini

Questa cartella contiene le immagini sorgente (PNG e JPG, di solito 1536×1024 o
1254×1254). Non sono importate dall'app e non finiscono nel build: Vite include
soltanto ciò che il codice importa da `src/`.

L'app usa i WebP generati da qui (decisione di Matteo per BUN-1):

| File in `src/assets/` | Larghezza | Uso |
|---|---|---|
| `<nome>.webp` | fino a 1280 px (mai ingrandita) | hero, schede, dettaglio |
| `<nome>-640.webp` | 640 px | card in griglia e miniature |
| `<nome>-320.webp` | 320 px, solo condimenti | miniature da 40–48 px |

Qualità WebP 80, tranne i condimenti (`toppings/`, comprese le varianti): 75.
Le regole per cartella stanno in `PROFILES` dello script; il perché in
`docs/budget-prestazioni.md` («Immagini: margine per il catalogo»).

Le icone della timeline (256 px, con trasparenza) hanno un solo WebP alla
larghezza originale. La trasparenza si conserva.

## Rigenerare i WebP

Requisiti: Python 3.9+ e Pillow con WebP (`python3 -m pip install Pillow`).
Per i poster dei video serve anche `ffmpeg`.

```bash
python3 scripts/build-responsive-images.py               # tutte le immagini (qualità di PROFILES, altrimenti 80)
python3 scripts/build-responsive-images.py --quality 82  # qualità di base diversa (i condimenti restano a 75)
python3 scripts/build-responsive-images.py --posters     # anche i poster in public/videos/
```

Lo script:

1. legge ogni PNG/JPG di questa cartella;
2. scrive `<nome>.webp` e la variante piccola (`<nome>-640.webp`, per i
   condimenti `<nome>-320.webp`) nella stessa sottocartella sotto
   `src/assets/` (stesso nome, estensione `.webp`); non riscrive le foto di
   riserva delle schede CMS (copie byte per byte nell'archivio
   `public/media/photos/`) né i WebP consegnati più compressi del loro
   originale (`DELIVERED`);
3. rigenera `src/app/components/media/responsive-images.generated.ts`, la
   tabella che `ImageWithFallback` usa per `srcset`, `width` e `height`;
4. segnala i WebP in `src/assets/` che non hanno più un originale (non li
   cancella).

Dopo la rigenerazione: `npm run verify` e `npm run build`.

## Aggiungere un'immagine

1. Metti l'originale qui, nella sottocartella giusta (`pizzas/`, `toppings/`,
   `toppings/variants/`, `signatures/`, `timeline/`).
2. Esegui lo script.
3. Importa il WebP principale nel modulo dati, per esempio
   `import photoX from "../../assets/pizzas/x.webp";`. La variante piccola e le
   dimensioni arrivano da sole dalla tabella generata.

## Video

I video stanno in `public/videos/` e non vengono ricompressi. Il poster
(`<nome>-poster.webp`) è il primo fotogramma, estratto con `--posters`.

## Foto consegnate già in WebP

Alcune foto arrivano già pronte nelle due larghezze, senza originale in questa
cartella (es. i condimenti del Lotto 1, #165, i cui master PNG stanno fuori dal
repository). Lo script non le riscrive e le tiene in tabella finché esistono
sia `<nome>.webp` sia la variante piccola. Se la variante alla larghezza della
cartella manca (per i condimenti la 320), la ricava dal WebP grande
consegnato. Per aggiornare solo la tabella dopo
averne aggiunte:

```bash
python3 scripts/build-responsive-images.py --table-only
```
