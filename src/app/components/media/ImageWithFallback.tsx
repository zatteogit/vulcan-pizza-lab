import React, { useState } from "react";

/* ═══ ImageWithFallback (VPL-A4) ═══
 * - Skeleton (pulse) finché l'immagine non è caricata.
 * - Fallback EDITORIALE (superficie calda a token + glifo pizza) in caso di
 *   errore, non più il box grigio "Error loading image".
 * - Sizing dal className/style del chiamante (sul wrapper); l'img riempie. */

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
      style={{ color: "var(--icon-muted)", opacity: 0.45 }}
    >
      <path d="M12 3c4.97 0 9 3.2 9 5L12 21 3 8c0-1.8 4.03-5 9-5Z" />
      <path d="M3 8c3 1.2 15 1.2 18 0" />
      <circle cx="10" cy="9.5" r="0.6" fill="currentColor" />
      <circle cx="14" cy="10" r="0.6" fill="currentColor" />
      <circle cx="12" cy="13" r="0.6" fill="currentColor" />
    </svg>
  );
}

export function ImageWithFallback(props: React.ImgHTMLAttributes<HTMLImageElement>) {
  const [didError, setDidError] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const { src, alt, style, className, onLoad, ...rest } = props;
  const objectFit =
    (style as React.CSSProperties | undefined)?.objectFit ?? "cover";

  if (didError) {
    return (
      <div
        className={className}
        style={{
          ...style,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--surface-container)",
        }}
        role="img"
        aria-label={alt || undefined}
      >
        <FallbackGlyph />
      </div>
    );
  }

  return (
    <div
      className={className}
      style={{
        ...style,
        position: "relative",
        overflow: "hidden",
        background: "var(--surface-container)",
      }}
    >
      {!loaded && (
        <div
          className="absolute inset-0 animate-pulse"
          style={{
            background:
              "var(--surface-container-high, var(--surface-container))",
          }}
          aria-hidden="true"
        />
      )}
      <img
        src={src}
        alt={alt}
        {...rest}
        onError={() => setDidError(true)}
        onLoad={(e) => {
          setLoaded(true);
          onLoad?.(e);
        }}
        style={{
          width: "100%",
          height: "100%",
          objectFit,
          display: "block",
          opacity: loaded ? 1 : 0,
          transition: "opacity 0.3s ease",
        }}
      />
    </div>
  );
}
