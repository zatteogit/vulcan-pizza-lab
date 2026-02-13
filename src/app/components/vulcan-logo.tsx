import React from "react";

/**
 * Vulcan V — Playfair-inspired serif "V" with top serifs merged
 * into a curved pizza-slice cornicione arc.
 * Pure SVG, no external font dependency.
 */
export function VulcanMark({
  size = 24,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      className={className}
      aria-label="Vulcan"
    >
      {/* Cornicione arc — curved crust connecting the serif tops */}
      <path
        d="M4 6.5 C4 4, 8 2.5, 16 2.5 C24 2.5, 28 4, 28 6.5
           C28 7.5, 27 8.2, 25.5 8.5
           L16 28.5
           L6.5 8.5
           C5 8.2, 4 7.5, 4 6.5Z"
        fill="currentColor"
      />
      {/* Inner cut — creates the V hollow and crust thickness */}
      <path
        d="M8.5 7.5 C8.5 6.2, 11 5.2, 16 5.2 C21 5.2, 23.5 6.2, 23.5 7.5
           C23.5 8, 22.8 8.3, 22 8.5
           L16 22.5
           L10 8.5
           C9.2 8.3, 8.5 8, 8.5 7.5Z"
        fill="var(--background, #FDFBF7)"
      />
      {/* Small leopard spots on the crust for texture */}
      <circle
        cx="10"
        cy="5.5"
        r="0.6"
        fill="var(--background, #FDFBF7)"
        opacity="0.5"
      />
      <circle
        cx="16"
        cy="4.2"
        r="0.5"
        fill="var(--background, #FDFBF7)"
        opacity="0.4"
      />
      <circle
        cx="22"
        cy="5.5"
        r="0.6"
        fill="var(--background, #FDFBF7)"
        opacity="0.5"
      />
    </svg>
  );
}