/**
 * ds/ — Tier 4 (Componenti) del Design System Vulcan.
 *
 * React riusabili, context-free, che consumano SOLO token T3/T3.5 (mai T1/T2
 * diretti, mai hex/rgba). Le schermate (T6) e i pattern (T5) importano da qui.
 * Vedi docs/design-system-tiers.md.
 */
export { Chip } from "./Chip";
export type { ChipProps } from "./Chip";
export { Badge } from "./Badge";
export type { BadgeProps, BadgeTone } from "./Badge";
export { CtaButton } from "./CtaButton";
export type { CtaButtonProps } from "./CtaButton";
export { FilterChip } from "./FilterChip";
export type { FilterChipProps } from "./FilterChip";
export { Heading } from "./Heading";
export type { HeadingProps } from "./Heading";
export { SegmentedControl } from "./SegmentedControl";
export type {
  SegmentedControlOption,
  SegmentedControlProps,
} from "./SegmentedControl";
export { Surface } from "./Surface";
export type { SurfaceProps } from "./Surface";
export { Switch } from "./Switch";
export type { SwitchProps } from "./Switch";
