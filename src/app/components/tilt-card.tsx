/* ═══ TILT CARD — profondità 3D che segue il puntatore (giugno 2026) ═══
 * Firma visiva dell'app: le card stile si inclinano dolcemente verso il
 * cursore con un riflesso speculare caldo che scivola sulla foto. Misurato:
 * max 6° di rotazione, spring morbido, niente su touch e con
 * prefers-reduced-motion. Il wow sta nella moderazione.
 */

import React, { useRef, useCallback } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useReducedMotion,
} from "motion/react";

interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
  /** Gradi massimi di inclinazione (default 6) */
  maxTilt?: number;
  style?: React.CSSProperties;
}

export function TiltCard({ children, className, maxTilt = 6, style }: TiltCardProps) {
  const prefersReducedMotion = useReducedMotion();
  const ref = useRef<HTMLDivElement | null>(null);

  /* -0.5..0.5 rispetto al centro della card */
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const sx = useSpring(px, { stiffness: 260, damping: 22, mass: 0.6 });
  const sy = useSpring(py, { stiffness: 260, damping: 22, mass: 0.6 });

  const rotateX = useTransform(sy, [-0.5, 0.5], [maxTilt, -maxTilt]);
  const rotateY = useTransform(sx, [-0.5, 0.5], [-maxTilt, maxTilt]);
  /* Riflesso: posizione % del bagliore radiale */
  const glareX = useTransform(sx, [-0.5, 0.5], [25, 75]);
  const glareY = useTransform(sy, [-0.5, 0.5], [20, 80]);
  const glare = useTransform(
    [glareX, glareY],
    ([gx, gy]) =>
      `radial-gradient(420px circle at ${gx}% ${gy}%, color-mix(in srgb, var(--tertiary) 16%, transparent), color-mix(in srgb, var(--overlay-text) 5%, transparent) 38%, transparent 65%)`,
  );
  const glareOpacity = useSpring(0, { stiffness: 300, damping: 28 });

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (prefersReducedMotion || e.pointerType === "touch") return;
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      px.set((e.clientX - r.left) / r.width - 0.5);
      py.set((e.clientY - r.top) / r.height - 0.5);
      glareOpacity.set(1);
    },
    [prefersReducedMotion, px, py, glareOpacity],
  );

  const onPointerLeave = useCallback(() => {
    px.set(0);
    py.set(0);
    glareOpacity.set(0);
  }, [px, py, glareOpacity]);

  if (prefersReducedMotion) {
    return (
      <div className={className} style={style}>
        {children}
      </div>
    );
  }

  return (
    <div style={{ perspective: 900 }}>
      <motion.div
        ref={ref}
        className={className}
        onPointerMove={onPointerMove}
        onPointerLeave={onPointerLeave}
        style={{
          ...style,
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
          willChange: "transform",
        }}
      >
        {children}
        {/* Riflesso speculare caldo */}
        <motion.div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none"
          style={{
            background: glare,
            opacity: glareOpacity,
            borderRadius: "inherit",
            zIndex: 3,
          }}
        />
      </motion.div>
    </div>
  );
}
