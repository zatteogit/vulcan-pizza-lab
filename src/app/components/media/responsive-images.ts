/* ═══ Immagini responsive (BUN-1) ═══
 * Le immagini locali sono WebP in due larghezze: fino a 1280 px (quella che
 * dati e CMS espongono come URL) e una piccola per card e miniature (640 px;
 * 320 px per i condimenti, che piccoli si vedono solo come miniature). Qui l'URL
 * principale viene riconosciuto e arricchito con srcset, width e height; gli URL
 * esterni o caricati dal CMS passano invariati. La tabella è generata da
 * scripts/build-responsive-images.py. */
import { getPublishedPhoto } from "./published-media";
import { RESPONSIVE_IMAGE_ENTRIES } from "./responsive-images.generated";

export interface ResponsiveImageInfo {
  srcSet: string;
  width: number;
  height: number;
}

/** Valori `sizes` per i contesti ricorrenti. «auto» vale solo con
 *  loading="lazy" (Chromium usa la larghezza reale); gli altri browser
 *  leggono la lista che segue. */
export const IMAGE_SIZES = {
  /** Card in griglia: 2 colonne su mobile, 3 da 640 px, 4 da 1024 px. */
  card: "auto, (min-width: 1024px) 320px, (min-width: 640px) 33vw, 50vw",
  /** Miniature da 40–64 px. */
  thumb: "auto, 96px",
  /** Card «In primo piano» di Esplora: 45% della riga da 768 px. */
  feature: "(min-width: 768px) 45vw, 100vw",
  /** Hero e schede a tutta larghezza. */
  full: "100vw",
  /** Larghezza non fissa in lazy: Chromium misura, gli altri usano 100vw. */
  fluid: "auto, 100vw",
} as const;

const BY_SRC = new Map<string, ResponsiveImageInfo>(
  RESPONSIVE_IMAGE_ENTRIES.map(([src, small, width, height, smallWidth]) => [
    src,
    { srcSet: `${small} ${smallWidth}w, ${src} ${width}w`, width, height },
  ]),
);

export function getResponsiveImage(src: string | undefined): ResponsiveImageInfo | undefined {
  const published = getPublishedPhoto(src);
  if (published) return { srcSet: `${published.smallSrc} ${published.smallWidth}w, ${published.src} ${published.width}w`, width: published.width, height: published.height };
  return src ? BY_SRC.get(src) : undefined;
}

/** Attributi da aggiungere a un <img> semplice (senza ImageWithFallback). */
export function responsiveImgAttributes(
  src: string | undefined,
  sizes: string,
): { srcSet?: string; sizes?: string; width?: number; height?: number } {
  const info = getResponsiveImage(src);
  return info ? { srcSet: info.srcSet, sizes, width: info.width, height: info.height } : {};
}
