import type { ScoreDimensionKey } from "../../domain/pizza-engine";

/** Presentation adapter for domain score axes. The engine owns only keys and weights. */
export const SCORE_DIMENSION_COLORS: Record<ScoreDimensionKey, string> = {
  authenticity: "var(--axis-authenticity)",
  feasibility: "var(--axis-feasibility)",
  digestibility: "var(--axis-digestibility)",
  experimentation: "var(--text-accent)",
  sustainability: "var(--secondary)",
};
