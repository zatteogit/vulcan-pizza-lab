/**
 * ds/Carousel — T4 carosello scroll-snap token-driven, context-free.
 *
 * Riga orizzontale con scroll-snap + indicatori a pallini (il pallino attivo
 * si allunga). Estratto da CarouselSpec.
 */
import { useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";

export interface CarouselProps {
  children: ReactNode[];
  ariaLabel: string;
  itemWidth?: number | string;
  showDots?: boolean;
  className?: string;
  style?: CSSProperties;
}

export function Carousel({
  children,
  ariaLabel,
  itemWidth = 260,
  showDots = true,
  className,
  style,
}: CarouselProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const items = Array.isArray(children) ? children : [children];

  const onScroll = () => {
    const el = ref.current;
    if (!el || items.length === 0) return;
    const i = Math.round(el.scrollLeft / (el.scrollWidth / items.length));
    setActive(Math.min(items.length - 1, Math.max(0, i)));
  };

  return (
    <div className={["ds-carousel", className].filter(Boolean).join(" ")} style={style}>
      <div
        ref={ref}
        onScroll={onScroll}
        className="ds-carousel__track"
        role="region"
        aria-label={ariaLabel}
        tabIndex={0}
      >
        {items.map((it, i) => (
          <div
            key={i}
            className="ds-carousel__item"
            style={{
              ["--ds-carousel-item-w" as any]:
                typeof itemWidth === "number" ? `${itemWidth}px` : itemWidth,
            }}
          >
            {it}
          </div>
        ))}
      </div>
      {showDots && items.length > 1 && (
        <div className="ds-carousel__dots">
          {items.map((_, i) => (
            <div
              key={i}
              className={`ds-carousel__dot${i === active ? " ds-carousel__dot--active" : ""}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
