/**
 * Showcase-only motion intents.
 *
 * Production components consume `../ds/motion`. This module is the authorised
 * demonstration owner: it links to that T4 foundation and adds presets needed
 * to explain motion anatomy without leaking spring physics back into JSX.
 */
import { motionSpring } from "../ds/motion";
import type { Transition } from "motion/react";

export { showcaseTransition } from "./showcase-motion.generated";

export const showcaseMotion = {
  foundation: motionSpring,
  carousel: {
    slide: { type: "spring", stiffness: 280, damping: 28, mass: 0.8 },
    fade: { type: "spring", stiffness: 300, damping: 26 },
    flex: { type: "spring", stiffness: 260, damping: 26, mass: 0.8 },
    overlay: { type: "spring", stiffness: 300, damping: 24 },
    dot: { type: "spring", stiffness: 420, damping: 28 },
    arrow: { type: "spring", stiffness: 500, damping: 22 },
  },
} as const;

export function morphLoaderTransition(duration: number, pulse: boolean): Transition {
  return {
    borderRadius: {
      duration,
      repeat: Infinity,
      ease: "easeInOut",
    },
    rotate: {
      duration: duration * 2.5,
      repeat: Infinity,
      ease: "linear",
    },
    ...(pulse
      ? {
          scale: {
            duration: duration * 1.2,
            repeat: Infinity,
            ease: "easeInOut",
          },
        }
      : {}),
  };
}
