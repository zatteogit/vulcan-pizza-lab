import React, { useState, useEffect } from "react";
import { getPublishedPhoto, usePublishedMediaRevision } from "./published-media";
import { getResponsiveImage, IMAGE_SIZES } from "./responsive-images";

/* ═══ ImageWithFallback (VPL-A4) ═══
 * - Skeleton (pulse) finché l'immagine non è caricata.
 * - Fallback EDITORIALE (superficie calda a token + glifo pizza) in caso di
 *   errore, non più il box grigio "Error loading image".
 * - Sizing dal className/style del chiamante (sul wrapper); l'img riempie.
 * - BUN-1: loading="lazy" e decoding="async" di default; `priority` solo per
 *   l'hero sopra la piega (eager + fetchpriority="high"). Per i WebP locali
 *   aggiunge srcset (variante piccola + grande), width e height (riserva lo spazio). */

function FallbackGlyph() {
  return (
    <svg
      width="40"
      height="40"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="image-fallback-glyph"
    >
      <path d="M12 3c4.97 0 9 3.2 9 5L12 21 3 8c0-1.8 4.03-5 9-5Z" />
      <path d="M3 8c3 1.2 15 1.2 18 0" />
      <circle cx="10" cy="9.5" r="0.6" fill="currentColor" />
      <circle cx="14" cy="10" r="0.6" fill="currentColor" />
      <circle cx="12" cy="13" r="0.6" fill="currentColor" />
    </svg>
  );
}

export interface ImageWithFallbackProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  /** Immagine hero sopra la piega: caricamento immediato e priorità alta. */
  priority?: boolean;
}

export function ImageWithFallback(props: ImageWithFallbackProps) {
  const [didError, setDidError] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const {
    src,
    alt,
    style,
    className,
    onLoad,
    priority = false,
    loading,
    srcSet,
    sizes,
    width,
    height,
    ...rest
  } = props;
  usePublishedMediaRevision();
  const published = getPublishedPhoto(src);
  const effectiveSrc = published?.src ?? src;
  useEffect(() => { setDidError(false); setLoaded(false); }, [effectiveSrc]);
  const responsive = srcSet ? undefined : getResponsiveImage(src);
  const resolvedLoading = loading ?? (priority ? "eager" : "lazy");
  /* fetchpriority in minuscolo: React 18.2 non conosce ancora fetchPriority. */
  const priorityAttributes = priority ? { fetchpriority: "high" } : undefined;
  const objectFit =
    (style as React.CSSProperties | undefined)?.objectFit ?? "cover";

  const isPlaceholder = src === "placeholder" || !src;

  if (didError || isPlaceholder) {
    return (
      <div
        className={[className, "image-fallback-error"].filter(Boolean).join(" ")}
        style={style}
        role="img"
        aria-label={alt || undefined}
      >
        <FallbackGlyph />
      </div>
    );
  }

  return (
    <div
      className={[className, "image-fallback-media"].filter(Boolean).join(" ")}
      style={style}
    >
      {!loaded && (
        <div className="image-fallback-skeleton" aria-hidden="true" />
      )}
      <img
        /* loading, sizes e srcSet prima di src: React 18 applica gli attributi
           nell'ordine scritto e alcuni browser (Firefox) avviano il download
           appena vedono src. */
        loading={resolvedLoading}
        /* Decodifica fuori dal main thread: evita che il decode di una foto
           grande rubi un frame (spike da centinaia di ms) durante lo scroll.
           Sovrascrivibile dal chiamante via props (spread dopo). */
        decoding="async"
        {...priorityAttributes}
        width={width ?? responsive?.width}
        height={height ?? responsive?.height}
        sizes={
          sizes ??
          (responsive
            ? resolvedLoading === "lazy" ? IMAGE_SIZES.fluid : IMAGE_SIZES.full
            : undefined)
        }
        srcSet={srcSet ?? responsive?.srcSet}
        src={effectiveSrc}
        alt={alt}
        {...rest}
        onError={() => setDidError(true)}
        onLoad={(e) => {
          setLoaded(true);
          onLoad?.(e);
        }}
        className={
          loaded ? "image-fallback-img image-fallback-img--loaded" : "image-fallback-img"
        }
        style={{ ["--object-fit" as any]: objectFit }}
      />
    </div>
  );
}
