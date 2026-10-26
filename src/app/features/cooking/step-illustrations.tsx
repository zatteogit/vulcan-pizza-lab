/* Small timeline markers use crisp, theme-aware symbols. Large educational
 * illustrations retain their detail, only when the pictured action is true.
 */

import { Beaker, ChefHat, Clock3, CookingPot, Flame, Hand, Layers,
  Scissors, Sandwich, Thermometer, Timer, Utensils, type LucideProps } from "lucide-react";
import type { ComponentType, CSSProperties } from "react";
import type { TimelineStep } from "../../domain/pizza-engine";
import { resolveStepVisual, type StepVisual } from "./step-visual";
import bakeSrc from "../../../assets/timeline/timeline-bake.webp";
import bulkSrc from "../../../assets/timeline/timeline-bulk.webp";
import divideSrc from "../../../assets/timeline/timeline-divide.webp";
import fillInternalSrc from "../../../assets/timeline/timeline-fill_internal.webp";
import mixSrc from "../../../assets/timeline/timeline-mix.webp";
import preheatSrc from "../../../assets/timeline/timeline-preheat.webp";
import prefermentSrc from "../../../assets/timeline/timeline-preferment.webp";
import proofSrc from "../../../assets/timeline/timeline-proof.webp";
import shapeSrc from "../../../assets/timeline/timeline-shape.webp";
import sliceSrc from "../../../assets/timeline/timeline-slice.webp";
import splitFillSrc from "../../../assets/timeline/timeline-split_fill.webp";
import stackSrc from "../../../assets/timeline/timeline-stack.webp";
import topSrc from "../../../assets/timeline/timeline-top.webp";
import topPostSrc from "../../../assets/timeline/timeline-top_post.webp";

type StepIllustrationTone = "default" | "accent" | "onAccent" | "muted";

interface Props {
  stepId: string;
  size?: number;
  tone?: StepIllustrationTone;
  className?: string;
  variant?: TimelineStep["variant"];
  unleavened?: boolean;
  /** Persist the resolved action in cooking sessions, including variants. */
  visual?: StepVisual;
}

interface IllustrationProps {
  size: number;
}

const TONE_CLASSES: Record<StepIllustrationTone, string> = {
  default: "step-illustration--default",
  accent: "step-illustration--accent",
  onAccent: "step-illustration--on-accent",
  muted: "step-illustration--muted",
};

const ASSETS = {
  preferment: prefermentSrc,
  mix: mixSrc,
  bulk: bulkSrc,
  divide: divideSrc,
  proof: proofSrc,
  shape: shapeSrc,
  top: topSrc,
  top_post: topPostSrc,
  preheat: preheatSrc,
  bake: bakeSrc,
  stack: stackSrc,
  fill_internal: fillInternalSrc,
  split_fill: splitFillSrc,
  slice: sliceSrc,
} as const;

const STEP_ASSETS: Partial<Record<StepVisual, string>> = {
  preferment: ASSETS.preferment,
  mix: ASSETS.mix,
  bulk: ASSETS.bulk,
  divide: ASSETS.divide,
  proof: ASSETS.proof,
  shape: ASSETS.shape,
  top: ASSETS.top,
  top_post: ASSETS.top_post,
  stack: ASSETS.stack,
  fill_internal: ASSETS.fill_internal,
  split_fill: ASSETS.split_fill,
};

const STEP_SYMBOLS: Record<StepVisual, ComponentType<LucideProps>> = {
  preferment: Beaker, mix: MixSymbol, bulk: Clock3, divide: Scissors,
  proof: Timer, proof_pan: Timer, rest: Clock3, shape: Hand,
  top: Utensils, top_post: Utensils, preheat: Thermometer, bake: Flame,
  oil: Thermometer, fry: CookingPot, stack: Layers,
  fill_internal: Sandwich, split_fill: Sandwich, prep: ChefHat,
};

// Same 24-unit grid and rounded strokes as the rest of the icon family.
function MixSymbol({ size = 24, strokeWidth = 2, ...props }: LucideProps) {
  return <svg {...props} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 11h18c0 6-3 9-9 9s-9-3-9-9Z" />
    <path d="m14 11 5-8 2 1-4 7M7 7c1-2 3-2 4 0" />
  </svg>;
}

function TimelineImage({
  src,
  size,
  tone = "default",
  className,
}: {
  src: string;
  size: number;
  tone?: StepIllustrationTone;
  className?: string;
}) {
  return (
    <span
      className={`step-illustration ${TONE_CLASSES[tone]} ${className ?? ""}`}
      style={{ "--illustration-size": `${size}px` } as CSSProperties}
      aria-hidden="true"
    >
      <img
        src={src}
        alt=""
        loading="lazy"
        decoding="async"
        draggable={false}
        className="step-illustration__img"
      />
    </span>
  );
}

export function Bowl({ size }: IllustrationProps) {
  return <StepIllustration stepId="mix" size={size} />;
}

export function Flask({ size }: IllustrationProps) {
  return <StepIllustration stepId="preferment" size={size} />;
}

export function RisingDough({ size }: IllustrationProps) {
  return <StepIllustration stepId="bulk" size={size} />;
}

export function Oven({ size }: IllustrationProps) {
  return <TimelineImage src={ASSETS.bake} size={size} />;
}

export function Slice({ size }: IllustrationProps) {
  return <TimelineImage src={ASSETS.slice} size={size} />;
}

export function StepIllustration({
  stepId,
  size = 110,
  tone = "default",
  className,
  variant,
  unleavened = false,
  visual,
}: Props) {
  const action = visual && visual in STEP_SYMBOLS ? visual
    : resolveStepVisual({ id: stepId, variant }, { unleavened });
  const src = STEP_ASSETS[action];
  // A wood-fired oven, risen dough or a proofing box must not illustrate
  // frying, unleavened rest or final proof in a tray. Symbols stay neutral.
  if (size <= 48 || !src) {
    const Symbol = STEP_SYMBOLS[action];
    return <span
      className={`step-illustration step-illustration--symbol ${TONE_CLASSES[tone]} ${className ?? ""}`}
      style={{ "--illustration-size": `${size}px` } as CSSProperties}
      data-step-visual={action}
      aria-hidden="true"
    >
      <Symbol size={size} aria-hidden="true" focusable="false" />
    </span>;
  }
  return (
    <TimelineImage
      src={src}
      size={size}
      tone={tone}
      className={className}
    />
  );
}
