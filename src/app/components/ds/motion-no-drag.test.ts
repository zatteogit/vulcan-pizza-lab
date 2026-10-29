/**
 * Budget D-059: in `vite build` il plugin `vulcan-motion-without-drag`
 * (vite.config.ts) svuota i gesti drag e pan di motion. Questo test fallisce
 * se il prodotto comincia a usarli: in quel caso togliere il plugin.
 * Vetrina del design system e strumenti di sviluppo esclusi (non sono nella
 * build di produzione).
 */
import { describe, expect, it } from "vitest";

const SOURCES = import.meta.glob(
  ["../../**/*.{ts,tsx}", "!../../**/*.test.{ts,tsx}", "!../design-system/**", "!../../features/dev-tools/**"],
  { query: "?raw", import: "default", eager: true },
) as Record<string, string>;
const CONFIG = import.meta.glob("../../../../vite.config.ts", { query: "?raw", import: "default", eager: true }) as Record<string, string>;

const DRAG_API =
  /\bdrag(?:Constraints|Elastic|Momentum|SnapToOrigin|Listener|Controls|DirectionLock|Transition|Propagation)?\s*=\s*\{|\bdrag\s*=\s*["']|\bwhileDrag\b|\bonDrag(?:Start|End|TransitionEnd)?\s*=|\bonPan(?:Start|End|SessionStart)?\s*=|\buseDragControls\b/;

describe("motion senza drag (budget D-059)", () => {
  it("legge i sorgenti del prodotto", () => {
    expect(Object.keys(SOURCES).length).toBeGreaterThan(100);
  });

  it("nessun componente del prodotto usa drag o pan di motion", () => {
    const offenders = Object.entries(SOURCES)
      .filter(([, source]) => DRAG_API.test(source))
      .map(([file]) => file);
    expect(offenders).toEqual([]);
  });

  it("il plugin del build c'è ancora", () => {
    expect(Object.values(CONFIG)[0]).toContain("motionWithoutDragPlugin()");
  });
});
