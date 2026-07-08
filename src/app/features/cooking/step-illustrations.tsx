/* ═══ STEP ILLUSTRATIONS — Imagen asset set (luglio 2026) ═══
 * Illustrazioni raster coerenti con il tono Vulcan: terracotta, impasto caldo,
 * forno vivo, dettagli morbidi. Il componente mantiene la stessa API degli
 * SVG precedenti per Recipe Timeline, Cooking Mode e Learn.
 */

import type { CSSProperties } from "react";

import bakeSrc from "../../../assets/timeline/timeline-bake.png";
import bulkSrc from "../../../assets/timeline/timeline-bulk.png";
import divideSrc from "../../../assets/timeline/timeline-divide.png";
import fillInternalSrc from "../../../assets/timeline/timeline-fill_internal.png";
import mixSrc from "../../../assets/timeline/timeline-mix.png";
import preheatSrc from "../../../assets/timeline/timeline-preheat.png";
import prefermentSrc from "../../../assets/timeline/timeline-preferment.png";
import proofSrc from "../../../assets/timeline/timeline-proof.png";
import shapeSrc from "../../../assets/timeline/timeline-shape.png";
import sliceSrc from "../../../assets/timeline/timeline-slice.png";
import splitFillSrc from "../../../assets/timeline/timeline-split_fill.png";
import stackSrc from "../../../assets/timeline/timeline-stack.png";
import topSrc from "../../../assets/timeline/timeline-top.png";
import topPostSrc from "../../../assets/timeline/timeline-top_post.png";

type StepIllustrationTone = "default" | "accent" | "onAccent" | "muted";

interface Props {
  stepId: string;
  size?: number;
  tone?: StepIllustrationTone;
  className?: string;
  style?: CSSProperties;
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

const STEP_ASSETS: Record<string, string> = {
  preferment: ASSETS.preferment,
  mix: ASSETS.mix,
  bulk: ASSETS.bulk,
  divide: ASSETS.divide,
  proof: ASSETS.proof,
  shape: ASSETS.shape,
  top: ASSETS.top,
  top_post: ASSETS.top_post,
  after_bake_top: ASSETS.top_post,
  preheat: ASSETS.preheat,
  bake: ASSETS.bake,
  bake2: ASSETS.bake,
  stack: ASSETS.stack,
  fill_internal: ASSETS.fill_internal,
  split_fill: ASSETS.split_fill,
};

function resolveAsset(stepId: string) {
  if (STEP_ASSETS[stepId]) return STEP_ASSETS[stepId];
  if (stepId.startsWith("spread_")) return ASSETS.top;
  if (stepId.includes("fill")) return ASSETS.fill_internal;
  if (stepId.includes("bake")) return ASSETS.bake;
  if (stepId.includes("top")) return ASSETS.top_post;
  return ASSETS.slice;
}

function TimelineImage({
  src,
  size,
  tone = "default",
  className,
  style,
}: {
  src: string;
  size: number;
  tone?: StepIllustrationTone;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <span
      className={`step-illustration ${TONE_CLASSES[tone]} ${className ?? ""}`}
      style={{ ["--illustration-size" as any]: `${size}px`, ...style }}
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
  return <TimelineImage src={ASSETS.mix} size={size} />;
}

export function Flask({ size }: IllustrationProps) {
  return <TimelineImage src={ASSETS.preferment} size={size} />;
}

export function RisingDough({ size }: IllustrationProps) {
  return <TimelineImage src={ASSETS.bulk} size={size} />;
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
  style,
}: Props) {
  return (
    <TimelineImage
      src={resolveAsset(stepId)}
      size={size}
      tone={tone}
      className={className}
      style={style}
    />
  );
}
