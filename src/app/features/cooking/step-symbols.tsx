import { Clock3, Flame, Layers, Thermometer, type LucideProps } from "lucide-react";
import type { ComponentType } from "react";
import type { StepVisual } from "./step-visual";

// Culinary actions on Lucide's 24-unit grid, with rounded currentColor strokes.
// These are drawn for the small markers, rather than reduced illustrations.
function Frame({ size = 24, strokeWidth = 2, children, ...props }: LucideProps) {
  return <svg {...props} width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    {children}
  </svg>;
}

function Mix(props: LucideProps) {
  return <Frame {...props} data-step-symbol="mixing-bowl">
    <path d="M3 11h18c0 6-3 9-9 9s-9-3-9-9Z" />
    <path d="m14 11 5-8 2 1-4 7M7 7c1-2 3-2 4 0" />
  </Frame>;
}

function Preferment(props: LucideProps) {
  return <Frame {...props} data-step-symbol="fermenting-jar">
    <path d="M6 3h12v3H6Z" />
    <rect x="6" y="6" width="12" height="15" rx="2" />
    <path d="M6 13h12M10 10h.01M14 17h.01M10 18h.01" />
  </Frame>;
}

function Divide(props: LucideProps) {
  return <Frame {...props} data-step-symbol="dough-scraper">
    <rect x="8" y="2" width="10" height="3" rx="1" />
    <path d="m8 5-2 9h14l-2-9M2 21c0-5 8-5 8 0ZM13 21c0-5 8-5 8 0Z" />
  </Frame>;
}

function Bulk(props: LucideProps) {
  return <Frame {...props} data-step-symbol="rising-dough-bowl">
    <path d="M3 12h18c0 6-3 8-9 8s-9-2-9-8ZM5 12c1-6 13-6 14 0M12 7V2m-3 3 3-3 3 3" />
  </Frame>;
}

function Proof(props: LucideProps) {
  return <Frame {...props} data-step-symbol="dough-ball-box">
    <rect x="2" y="8" width="20" height="13" rx="2" />
    <path d="M4 4h16M5 17a3.5 3.5 0 0 1 7 0ZM12 17a3.5 3.5 0 0 1 7 0Z" />
  </Frame>;
}

function ProofPan(props: LucideProps) {
  return <Frame {...props} data-step-symbol="rising-dough-tray">
    <path d="M2 12h20M3 12v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M5 17c2-5 12-5 14 0M12 8V2m-3 3 3-3 3 3" />
  </Frame>;
}

function Shape(props: LucideProps) {
  return <Frame {...props} data-step-symbol="stretching-dough">
    <circle cx="12" cy="12" r="6" />
    <path d="M5 12H1m2-2-2 2 2 2M19 12h4m-2-2 2 2-2 2" />
  </Frame>;
}

function Top(props: LucideProps) {
  return <Frame {...props} data-step-symbol="topping-pizza-base">
    <ellipse cx="12" cy="17" rx="10" ry="4" />
    <path d="M9 7a3 3 0 0 0 6 0Zm6 0 5-5M12 10v3M7 17h.01M16 17h.01" />
  </Frame>;
}

function Fill(props: LucideProps) {
  return <Frame {...props} data-step-symbol="filled-dough">
    <path d="M3 19a9 9 0 0 1 18 0ZM8 6l-3 1 1-3M5 7c2-5 9-6 13-3" />
    <path d="M8 16h.01M12 13h.01M16 16h.01" />
  </Frame>;
}

function SplitFill(props: LucideProps) {
  return <Frame {...props} data-step-symbol="split-flatbread">
    <path d="M2 13c0-5 17-5 17 0M2 17v2c3 3 14 3 17 0v-2M2 13h10M2 17h17M7 15h.01" />
    <path d="m22 3-9 9 3 2 6-6ZM19 6l3 2" />
  </Frame>;
}

function Fry(props: LucideProps) {
  return <Frame {...props} data-step-symbol="frying-pan">
    <path d="M2 12h15l-2 6H4ZM17 13l5-3M5 21h7" />
    <ellipse cx="9" cy="11" rx="3" ry="2" />
    <path d="M4 8h.01M11 5h.01M15 8h.01" />
  </Frame>;
}

function Prep(props: LucideProps) {
  return <Frame {...props} data-step-symbol="preparation-board">
    <rect x="2" y="10" width="20" height="11" rx="2" />
    <path d="M5 15h.01M7 6l8-4v5H7ZM15 4h6M10 16h7" />
  </Frame>;
}

export const STEP_SYMBOLS: Record<StepVisual, ComponentType<LucideProps>> = {
  preferment: Preferment, mix: Mix, bulk: Bulk, divide: Divide,
  proof: Proof, proof_pan: ProofPan, rest: Clock3, shape: Shape,
  top: Top, top_post: Top, preheat: Thermometer, bake: Flame,
  oil: Thermometer, fry: Fry, stack: Layers,
  fill_internal: Fill, split_fill: SplitFill, prep: Prep,
};
