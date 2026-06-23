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
  itemWidth?: number | string;
  showDots?: boolean;
  className?: string;
  style?: CSSProperties;
}

export function Carousel({
  children,
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
    <div className={className} style={style}>
      <div
        ref={ref}
        onScroll={onScroll}
        style={{
          display: "flex",
          gap: "var(--space-3)",
          overflowX: "auto",
          scrollSnapType: "x mandatory",
          scrollbarWidth: "none",
          paddingBottom: 4,
        }}
      >
        {items.map((it, i) => (
          <div
            key={i}
            style={{
              flex: `0 0 ${typeof itemWidth === "number" ? `${itemWidth}px` : itemWidth}`,
              scrollSnapAlign: "start",
            }}
          >
            {it}
          </div>
        ))}
      </div>
      {showDots && items.length > 1 && (
        <div style={{ display: "flex", gap: 6, justifyContent: "center", marginTop: 12 }}>
          {items.map((_, i) => (
            <div
              key={i}
              style={{
                width: i === active ? 20 : 6,
                height: 6,
                borderRadius: 999,
                background: i === active ? "var(--primary)" : "var(--outline-variant)",
                transition: "width 0.2s, background 0.2s",
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
