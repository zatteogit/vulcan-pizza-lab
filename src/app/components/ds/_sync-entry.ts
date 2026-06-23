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

/* ── Onda 2 — app-coupled: renderizzano dal default CMS context (nessun provider) ── */
export { InfoTip } from "../info-tip";
export { RecipeSectionTabs } from "../recipe-section-tabs";
export { RecipeStatStrip } from "../recipe-stat-strip";
export { RecipeMatchCard } from "../recipe-match-card";

/* ── Onda 3 — primitive nuove, estratte dalle demo dei Spec (context-free) ── */
export { Checkbox } from "./Checkbox";
export { RadioButton } from "./RadioButton";
export { Divider } from "./Divider";
export { Slider } from "./Slider";
export { Select } from "./Select";
export { Fab } from "./Fab";
export { StepHeader } from "./StepHeader";
export { Progress } from "./Progress";
export { Spinner } from "./Spinner";
