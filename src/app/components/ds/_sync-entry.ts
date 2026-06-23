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
export { ScoreRing } from "../../features/recipe/score-ring";
export { TiltCard } from "../../features/recipe/tilt-card";
export { DoughBlob } from "../../features/cooking/dough-mascot";
export { VulcanMark } from "../shared/vulcan-logo";
export { StepIllustration } from "../../features/cooking/step-illustrations";

/* ── Onda 2 — app-coupled: renderizzano dal default CMS context (nessun provider) ── */
export { InfoTip } from "../shared/info-tip";
export { RecipeSectionTabs } from "../../features/recipe/recipe-section-tabs";
export { RecipeStatStrip } from "../../features/recipe/recipe-stat-strip";
export { RecipeMatchCard } from "../../features/recipe/recipe-match-card";

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
export { Snackbar } from "./Snackbar";
export { Dialog } from "./Dialog";
export { BottomSheet } from "./BottomSheet";
export { Carousel } from "./Carousel";

/* ── Onda 4 — feature/pattern riusabili (curati, app-coupled) ── */
export { RecommendedStyles } from "../../features/recipe/recommended-styles";
export { ContextualWarnings } from "../../features/recipe/troubleshooting-panel";

/* ── Foundation — card di riferimento dei token ── */
export { ColorPalette } from "../design-system/foundations-ui/ColorPalette";
export { TypeScale } from "../design-system/foundations-ui/TypeScale";
export { SpacingScale } from "../design-system/foundations-ui/SpacingScale";
export { RadiusScale } from "../design-system/foundations-ui/RadiusScale";
export { Elevation } from "../design-system/foundations-ui/Elevation";
