import type { CSSProperties } from "react";

/* VPL-navbar: spring "liquid glass" — viscosa, settle morbido con un filo di
 * vita (leggero overshoot), non lo snap rigido di prima. Mima il materiale gel. */
export const liquidDockSpring = {
  type: "spring",
  stiffness: 230,
  damping: 26,
  mass: 1.05,
} as const;

export const liquidDockQuickSpring = {
  type: "spring",
  stiffness: 420,
  damping: 32,
  mass: 0.7,
} as const;

export const liquidDockSurfaceStyle: CSSProperties = {
  /* Più opaco (frostato): il vetro liquid-glass non lascia trasparire il
   * contenuto dietro (es. la tagline a fondo pagina). */
  background:
    "linear-gradient(180deg, color-mix(in srgb, var(--container-page) 96%, transparent), color-mix(in srgb, var(--container-page) 91%, transparent))",
  backdropFilter: "blur(32px) saturate(1.8)",
  WebkitBackdropFilter: "blur(32px) saturate(1.8)",
  border: "1px solid color-mix(in srgb, var(--text-default) 10%, transparent)",
  boxShadow:
    "0 16px 40px rgba(0, 0, 0, 0.13), inset 0 1px 0 rgba(255, 255, 255, 0.22), inset 0 -1px 0 color-mix(in srgb, var(--text-default) 5%, transparent)",
  color: "var(--text-default)",
};

export const liquidDockButtonStyle: CSSProperties = {
  ...liquidDockSurfaceStyle,
  textDecoration: "none",
  WebkitTapHighlightColor: "rgba(0,0,0,0)",
};

export const liquidDockStartButtonStyle: CSSProperties = {
  ...liquidDockButtonStyle,
  /* R3: --cta-btn-bg è già un gradiente (--grad-sage); annidarlo come color-stop
     dentro un altro linear-gradient produce CSS invalido → il background veniva
     scartato e restava il vetro sottostante (bottone "vetroso" invece di verde).
     Usiamo il colore solido --cta nel gradiente: valido e fedele all'intento sage→primary. */
  background:
    "linear-gradient(135deg, var(--cta), color-mix(in srgb, var(--cta) 84%, var(--primary)))",
  color: "var(--cta-btn-text)",
  boxShadow:
    "0 14px 34px color-mix(in srgb, var(--cta) 24%, transparent), inset 0 1px 0 rgba(255, 255, 255, 0.26)",
};
