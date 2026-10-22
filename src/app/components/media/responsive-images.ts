/* ═══ Responsive images (BUN-1) ═══
 * Ogni foto dell'app esiste in due WebP generati da
 * `scripts/optimize-images.mjs` (originali in `design-assets/originali/`):
 *   `<nome>.webp`      ≤ 1280 px — l'unico che i moduli dati importano
 *   `<nome>-640.webp`  640 px    — card e miniature
 * Qui si riconosce la foto grande dal suo URL e se ne ricavano srcset,
 * width e height. Un URL sconosciuto (override CMS, foto remote, fallback)
 * resta un semplice `src`. */
import manifest from "../../../assets/responsive-images.json";

interface ManifestEntry {
  width: number;
  height: number;
  small: string;
  smallWidth: number;
  smallHeight: number;
}

export interface ResponsiveImage {
  srcSet: string;
  width: number;
  height: number;
}

/* `sizes` per contesto: la larghezza CSS con cui la foto viene disegnata.
 * Il browser sceglie 640w o 1280w in base a questa misura × densità schermo. */
export const IMAGE_SIZES = {
  /** Testata a tutta larghezza (ricetta, scheda stile). */
  hero: "100vw",
  /** Card a griglia/carosello (home, Esplora, preferiti). */
  card: "(min-width: 1024px) 360px, (min-width: 640px) 45vw, 90vw",
  /** Miniature da 40–48 px (ricerca, condimenti). */
  thumb: "48px",
} as const;

const ASSETS_PREFIX = "../../../assets/";

/* URL finali (con hash in build) delle foto responsive. Le illustrazioni della
 * timeline hanno una sola misura e restano fuori. */
const URLS = import.meta.glob<string>(
  [
    "../../../assets/pizzas/*.webp",
    "../../../assets/signatures/*.webp",
    "../../../assets/toppings/**/*.webp",
  ],
  { eager: true, import: "default" },
);

const BY_URL = new Map<string, ResponsiveImage>();
for (const [file, entry] of Object.entries(manifest as Record<string, ManifestEntry>)) {
  const large = URLS[ASSETS_PREFIX + file];
  const small = URLS[ASSETS_PREFIX + entry.small];
  if (!large || !small) continue;
  BY_URL.set(large, {
    srcSet: `${small} ${entry.smallWidth}w, ${large} ${entry.width}w`,
    width: entry.width,
    height: entry.height,
  });
}

export function getResponsiveImage(src: string | undefined): ResponsiveImage | undefined {
  return src ? BY_URL.get(src) : undefined;
}

/** Attributi da spargere su un `<img>` nativo (miniature fuori da ImageWithFallback). */
export function responsiveImageProps(
  src: string | undefined,
  sizes: string,
): { srcSet?: string; sizes?: string; width?: number; height?: number } {
  const image = getResponsiveImage(src);
  return image ? { srcSet: image.srcSet, sizes, width: image.width, height: image.height } : {};
}
