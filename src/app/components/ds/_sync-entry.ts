/**
 * _sync-entry.ts — entry barrel per il sync verso claude.ai/design.
 *
 * NON è parte dell'API pubblica di ds/ (niente lo importa nell'app). Estende la
 * superficie sincronizzata oltre i componenti ds/ Tier-4, includendo i componenti
 * context-free riusabili che vivono altrove in components/.
 *
 * Cresce a onde — vedi docs/design-system-sync-gap.md.
 */
export * from "./index";

/* ── Onda 1 — context-free, già pronti (bucket "B-free") ── */
export { ScoreRing } from "../score-ring";
export { TiltCard } from "../tilt-card";
export { DoughBlob } from "../dough-mascot";
export { VulcanMark } from "../vulcan-logo";
export { StepIllustration } from "../step-illustrations";
