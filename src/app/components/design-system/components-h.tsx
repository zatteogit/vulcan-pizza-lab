import { useState, useRef } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { Flame, ChevronLeft, ChevronRight } from "lucide-react";
import {
  SectionHeader,
  AnatomyRow,
  SubSectionLabel,
  Panoramica,
  LineeGuida,
  AccessibilitaInfo,
} from "./shared";
import type { SectionEntry } from "./shared";
import { ImageWithFallback } from "../media/ImageWithFallback";
import { MultiBrowseDemo, HeroDemo, UncontainedDemo, UncontainedMultiAspectDemo, FullScreenDemo, VariantComparisonCard } from "./carousel-variants";
import { toShowcaseCssValue } from "./showcase-style";
import { showcaseMotion, showcaseTransition } from "./showcase-motion";
import { showcaseMessage } from "../../i18n/showcase-messages";

/* ═══════════════════════════════════════════════════════════
   LOADING INDICATOR  (M3 Expressive — Nuovo)
   Skeleton shimmer, pulsing dots, branded loader.
   Distinto dai Progress Indicators (determinato/indeterminato):
   il Loading Indicator comunica "il contenuto sta arrivando",
   non "l'operazione e al X%".
   ═══════════════════════════════════════════════════════════ */

/* ── Shimmer keyframe via inline style ── */
const shimmerBg = `linear-gradient(
  110deg,
  var(--surface-container) 0%,
  var(--surface-container) 30%,
  var(--surface-container-high) 50%,
  var(--surface-container) 70%,
  var(--surface-container) 100%
)`;

function ShimmerBlock({
  width,
  height,
  radius = 8,
  delay = 0,
}: {
  width: string | number;
  height: string | number;
  radius?: number;
  delay?: number;
}) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.div
      initial={reduceMotion ? false : { backgroundPosition: "-200% 0" }}
      animate={reduceMotion ? { backgroundPosition: "0% 0" } : { backgroundPosition: "200% 0" }}
      transition={reduceMotion ? undefined : showcaseTransition.preset_59c71ddf74(delay)}
      style={{ "--dsx-width": toShowcaseCssValue(width, false), "--dsx-height": toShowcaseCssValue(height, false), "--dsx-border-radius": toShowcaseCssValue(radius, false), "--dsx-background": toShowcaseCssValue(shimmerBg, false) } as any} className="dsx-s-5b5a7bb9b8"
    />
  );
}

/* ── Pulsing dot ── */
function PulsingDot({ delay, color }: { delay: number; color: string }) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.div
      animate={reduceMotion ? { scale: 1, opacity: 1 } : { scale: [1, 1.35, 1], opacity: [0.45, 1, 0.45] }}
      transition={reduceMotion ? undefined : showcaseTransition.preset_63114a8867(delay)}
      style={{ "--dsx-background": toShowcaseCssValue(color, false) } as any} className="dsx-s-53d4b1e0ce"
    />
  );
}

function LoadingIndicatorSpec() {
  const reduceMotion = useReducedMotion();
  return (
    <div className="flex flex-col gap-8">
      <SectionHeader
        title={showcaseMessage("components.design-system.components-h.loading-indicator-5d40423b")}
        description={showcaseMessage("components.design-system.components-h.m3-distingue-il-loading-indicator-dai-prog-739d6634")}
      />

      <SubSectionLabel label={showcaseMessage("components.design-system.components-h.panoramica-f38c9a27")} />
      <Panoramica
        descrizione={showcaseMessage("components.design-system.components-h.il-loading-indicator-comunica-che-il-conte-695a092a")}
        principi={[
          showcaseMessage("components.design-system.components-h.skeleton-shimmer-placeholder-che-replica-d-aae50844"),
          showcaseMessage("components.design-system.components-h.pulsing-dots-3-cerchi-con-stagger-0-2s-per-c4d190c8"),
          showcaseMessage("components.design-system.components-h.branded-loader-anello-svg-rotante-con-vulc-e590d4a6"),
        ]}
      />

      <SubSectionLabel label={showcaseMessage("components.design-system.components-h.specifiche-057caf2f")} />

      {/* ── 1. Skeleton shimmer variants ── */}
      <div className="surface-card p-5">
        <span className="type-label dsx-s-e2184fadc0">
          {showcaseMessage("components.design-system.components-h.skeleton-shimmer-varianti-a89334db")}</span>
        <p className="dsx-s-171ec8abac">
          {showcaseMessage("components.design-system.components-h.shimmer-lineare-con-gradiente-che-scorre-o-fd6c7afb")}</p>

        <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-5">
          {/* Recipe card skeleton */}
          <div className="flex flex-col gap-3">
            <span className="type-code dsx-s-b0e08465c2">{showcaseMessage("components.design-system.components-h.recipe-card-82052343")}</span>
            <div
              className="p-4 rounded-2xl flex flex-col gap-3 dsx-s-bb3e77c269"
            >
              <ShimmerBlock width="100%" height={120} radius={12} />
              <ShimmerBlock width="70%" height={16} radius={6} delay={0.1} />
              <ShimmerBlock width="45%" height={12} radius={6} delay={0.2} />
              <div className="flex gap-2 mt-1">
                <ShimmerBlock width={60} height={28} radius={14} delay={0.3} />
                <ShimmerBlock width={60} height={28} radius={14} delay={0.35} />
                <ShimmerBlock width={60} height={28} radius={14} delay={0.4} />
              </div>
            </div>
          </div>

          {/* Style photo skeleton */}
          <div className="flex flex-col gap-3">
            <span className="type-code dsx-s-b0e08465c2">{showcaseMessage("components.design-system.components-h.style-photo-974dd57c")}</span>
            <div
              className="rounded-2xl overflow-hidden flex flex-col gap-3 dsx-s-0642a81879"
            >
              <ShimmerBlock width="100%" height={140} radius={12} />
              <div className="flex items-center gap-2">
                <ShimmerBlock width={36} height={36} radius={18} delay={0.15} />
                <div className="flex flex-col gap-1.5 flex-1">
                  <ShimmerBlock width="60%" height={12} radius={4} delay={0.2} />
                  <ShimmerBlock width="40%" height={10} radius={4} delay={0.25} />
                </div>
              </div>
            </div>
          </div>

          {/* Text content skeleton */}
          <div className="flex flex-col gap-3">
            <span className="type-code dsx-s-b0e08465c2">{showcaseMessage("components.design-system.components-h.testo-lista-2b0959b2")}</span>
            <div
              className="p-4 rounded-2xl flex flex-col gap-3 dsx-s-bb3e77c269"
            >
              <ShimmerBlock width="55%" height={18} radius={6} />
              <ShimmerBlock width="100%" height={10} radius={4} delay={0.1} />
              <ShimmerBlock width="100%" height={10} radius={4} delay={0.15} />
              <ShimmerBlock width="80%" height={10} radius={4} delay={0.2} />
              <div className="dsx-s-6f30f75c6a" />
              <ShimmerBlock width="55%" height={18} radius={6} delay={0.3} />
              <ShimmerBlock width="100%" height={10} radius={4} delay={0.35} />
              <ShimmerBlock width="90%" height={10} radius={4} delay={0.4} />
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. Pulsing dots ── */}
      <div className="surface-card p-5">
        <span className="type-label dsx-s-e2184fadc0">
          {showcaseMessage("components.design-system.components-h.pulsing-dots-micro-feedback-eeea018f")}</span>
        <p className="dsx-s-171ec8abac">
          {showcaseMessage("components.design-system.components-h.tre-dot-con-scala-staggerata-ideale-per-fe-3b5bccfa")}</p>

        <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            { label: showcaseMessage("components.design-system.components-h.primary-a9a96ec0"), color: "var(--primary)" },
            { label: showcaseMessage("components.design-system.components-h.tertiary-ambra-c097bc04"), color: "var(--tertiary)" },
            { label: showcaseMessage("components.design-system.components-h.neutral-4bd29139"), color: "var(--muted-foreground)" },
          ].map((variant) => (
            <div key={variant.label} className="flex flex-col items-center gap-3">
              <div
                className="flex items-center justify-center gap-2 rounded-2xl dsx-s-62afd608b8"
              >
                <PulsingDot delay={0} color={variant.color} />
                <PulsingDot delay={0.2} color={variant.color} />
                <PulsingDot delay={0.4} color={variant.color} />
              </div>
              <span className="type-code dsx-s-63782726c0">{variant.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── 3. Branded loader (mark breath) ── */}
      <div className="surface-card p-5">
        <span className="type-label dsx-s-e2184fadc0">
          {showcaseMessage("components.design-system.components-h.branded-loader-mark-respirante-d100bacb")}</span>
        <p className="dsx-s-171ec8abac">
          {showcaseMessage("components.design-system.components-h.il-mark-vulcan-che-respira-dentro-un-anell-edebccd8")}<span className="dsx-s-154dc56bcf">strokeDashoffset</span> {showcaseMessage("components.design-system.components-h.rotante-il-mark-scala-3-b8160cd4")}</p>

        <div className="mt-5 flex flex-wrap gap-6 justify-center">
          {/* Large branded */}
          <div className="flex flex-col items-center gap-3">
            <div
              className="relative flex items-center justify-center rounded-full dsx-s-64256a7e0a"
            >
              {/* Rotating track */}
              <motion.div
                animate={reduceMotion ? { rotate: 0 } : { rotate: 360 }}
                transition={reduceMotion ? undefined : showcaseTransition.preset_2c35a292f6}
                className="absolute inset-0"
              >
                <svg width="96" height="96" viewBox="0 0 96 96">
                  <circle cx="48" cy="48" r="40" fill="none" stroke="var(--surface-container-high)" strokeWidth="3" />
                  <circle
                    cx="48" cy="48" r="40" fill="none"
                    stroke="var(--primary)"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 40 * 0.3} ${2 * Math.PI * 40 * 0.7}`} className="dsx-s-5160c4b9d3"
                  />
                </svg>
              </motion.div>
              {/* Breathing mark */}
              <motion.div
                animate={reduceMotion ? { scale: 1 } : { scale: [1, 1.03, 1] }}
                transition={reduceMotion ? undefined : showcaseTransition.preset_0b6be467f8}
              >
                <svg width="36" height="36" viewBox="0 0 40 40">
                  <defs>
                    <linearGradient id="ember-mark-loader" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="var(--primary)" />
                      <stop offset="100%" stopColor="var(--tertiary)" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M20 4 C20 4 8 16 8 25 C8 31.6 13.4 37 20 37 C26.6 37 32 31.6 32 25 C32 16 20 4 20 4Z"
                    fill="url(#ember-mark-loader)"
                  />
                  <path
                    d="M20 16 C20 16 15 22 15 26 C15 28.8 17.2 31 20 31 C22.8 31 25 28.8 25 26 C25 22 20 16 20 16Z"
                    fill="var(--container-page)"
                    opacity="0.85"
                  />
                </svg>
              </motion.div>
            </div>
            <span className="type-code dsx-s-63782726c0">{showcaseMessage("components.design-system.components-h.96px-large-39334d99")}</span>
          </div>

          {/* Medium branded */}
          <div className="flex flex-col items-center gap-3">
            <div
              className="relative flex items-center justify-center rounded-full dsx-s-0307d53264"
            >
              <motion.div
                animate={reduceMotion ? { rotate: 0 } : { rotate: 360 }}
                transition={reduceMotion ? undefined : showcaseTransition.preset_2c35a292f6}
                className="absolute inset-0"
              >
                <svg width="56" height="56" viewBox="0 0 56 56">
                  <circle cx="28" cy="28" r="23" fill="none" stroke="var(--surface-container-high)" strokeWidth="2.5" />
                  <circle
                    cx="28" cy="28" r="23" fill="none"
                    stroke="var(--primary)"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 23 * 0.3} ${2 * Math.PI * 23 * 0.7}`} className="dsx-s-5160c4b9d3"
                  />
                </svg>
              </motion.div>
              <motion.div
                animate={reduceMotion ? { scale: 1 } : { scale: [1, 1.03, 1] }}
                transition={reduceMotion ? undefined : showcaseTransition.preset_0b6be467f8}
              >
                <svg width="22" height="22" viewBox="0 0 40 40">
                  <path
                    d="M20 4 C20 4 8 16 8 25 C8 31.6 13.4 37 20 37 C26.6 37 32 31.6 32 25 C32 16 20 4 20 4Z"
                    fill="url(#ember-mark-loader)"
                  />
                  <path
                    d="M20 16 C20 16 15 22 15 26 C15 28.8 17.2 31 20 31 C22.8 31 25 28.8 25 26 C25 22 20 16 20 16Z"
                    fill="var(--container-page)"
                    opacity="0.85"
                  />
                </svg>
              </motion.div>
            </div>
            <span className="type-code dsx-s-63782726c0">{showcaseMessage("components.design-system.components-h.56px-medium-2e8db2d0")}</span>
          </div>

          {/* Small — dots only fallback */}
          <div className="flex flex-col items-center gap-3">
            <div
              className="flex items-center justify-center gap-1.5 rounded-full dsx-s-79740590bd"
            >
              <PulsingDot delay={0} color="var(--primary)" />
              <PulsingDot delay={0.15} color="var(--primary)" />
              <PulsingDot delay={0.3} color="var(--primary)" />
            </div>
            <span className="type-code dsx-s-63782726c0">{showcaseMessage("components.design-system.components-h.40px-small-dots-7e70d296")}</span>
          </div>
        </div>
      </div>

      <SubSectionLabel label={showcaseMessage("components.design-system.components-h.linee-guida-b43417d1")} />
      <LineeGuida
        fai={[
          showcaseMessage("components.design-system.components-h.skeleton-per-contenuto-strutturato-card-li-f5866a80"),
          showcaseMessage("components.design-system.components-h.pulsing-dots-per-attese-brevi-e-generiche--0cbf9c1e"),
          showcaseMessage("components.design-system.components-h.branded-loader-solo-per-il-caricamento-ini-022fed9c"),
        ]}
        nonFare={[
          showcaseMessage("components.design-system.components-h.mai-skeleton-con-dimensioni-diverse-dal-co-b10ede9e"),
          showcaseMessage("components.design-system.components-h.mai-loading-indicator-per-operazioni-200ms-2bb80547"),
          showcaseMessage("components.design-system.components-h.mai-animazioni-pesanti-il-dispositivo-sta--fa1d1d71"),
        ]}
      />

      <SubSectionLabel label={showcaseMessage("components.design-system.components-h.accessibilita-e59811a6")} />
      <AccessibilitaInfo items={[
        { label: showcaseMessage("components.design-system.components-h.aria-busy-a76f44a5"), desc: showcaseMessage("components.design-system.components-h.aria-busy-true-sul-container-durante-loadi-59aaf816") },
        { label: showcaseMessage("components.design-system.components-h.aria-live-9e93023b"), desc: showcaseMessage("components.design-system.components-h.aria-live-polite-per-annunciare-il-complet-ff5a7a21") },
        { label: showcaseMessage("components.design-system.components-h.reduced-motion-78980499"), desc: showcaseMessage("components.design-system.components-h.shimmer-diventa-gradiente-statico-dots-div-80a5c3b1") },
      ]} />

      {/* ── 4. Confronto visivo: Skeleton → Contenuto ── */}
      <div className="surface-card p-5">
        <span className="type-label dsx-s-e2184fadc0">
          {showcaseMessage("components.design-system.components-h.transizione-skeleton-contenuto-ccc1a279")}</span>
        <p className="dsx-s-171ec8abac">
          {showcaseMessage("components.design-system.components-h.il-contenuto-finale-appare-con-208e068b")}<span className="dsx-s-154dc56bcf">fadeIn</span> {showcaseMessage("components.design-system.components-h.300ms-sopra-lo-skeleton-che-svanisce-simul-2e7bc6f4")}</p>
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Skeleton state */}
          <div className="flex flex-col gap-2">
            <span className="type-code dsx-s-7cbd6b9e42">{showcaseMessage("components.design-system.components-h.stato-loading-6e306173")}</span>
            <div className="p-4 rounded-xl flex flex-col gap-2.5 dsx-s-d1283e5581">
              <ShimmerBlock width="100%" height={64} radius={10} />
              <ShimmerBlock width="60%" height={14} radius={4} delay={0.1} />
              <ShimmerBlock width="100%" height={10} radius={4} delay={0.15} />
              <ShimmerBlock width="85%" height={10} radius={4} delay={0.2} />
            </div>
          </div>
          {/* Loaded state */}
          <div className="flex flex-col gap-2">
            <span className="type-code dsx-s-b034f61c82">{showcaseMessage("components.design-system.components-h.stato-caricato-59ce227d")}</span>
            <div className="p-4 rounded-xl flex flex-col gap-2.5 dsx-s-d1283e5581">
              <div className="rounded-lg overflow-hidden dsx-s-88ff745573">
                <div className="w-full h-full flex items-center justify-center">
                  <Flame size={24} className="dsx-s-fc83acb0d3" />
                </div>
              </div>
              <span className="dsx-s-bc57fde045">{showcaseMessage("components.design-system.components-h.napoletana-stg-fc9d3868")}</span>
              <span className="dsx-s-b2bdf6727e">
                {showcaseMessage("components.design-system.components-h.classica-avpn-forno-legna-450-c-idratazion-b2ed3541")}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── 5. Anatomy ── */}
      <div className="surface-card p-5">
        <span className="type-label dsx-s-e2184fadc0">{showcaseMessage("components.design-system.components-h.anatomia-80a1ebf8")}</span>
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <AnatomyRow prop={showcaseMessage("components.design-system.components-h.shimmer-36c81a93")} val={showcaseMessage("components.design-system.components-h.linear-gradient-110deg-3-stop-surface-cont-f405f4ca")} />
          <AnatomyRow prop={showcaseMessage("components.design-system.components-h.pulsing-dots-497d85e4")} val={showcaseMessage("components.design-system.components-h.10px-radius-full-scale-1-1-35-1-opacity-0--0cb670d6")} />
          <AnatomyRow prop={showcaseMessage("components.design-system.components-h.branded-41d68842")} val={showcaseMessage("components.design-system.components-h.anello-svg-stroke-3px-strokedasharray-30-7-fcd5d4a3")} />
          <AnatomyRow prop={showcaseMessage("components.design-system.components-h.transizione-b8e2c307")} val={showcaseMessage("components.design-system.components-h.fadein-300ms-ease-con-crossfade-skeleton-o-f3023b52")} />
          <AnatomyRow prop="CLS" val={showcaseMessage("components.design-system.components-h.ogni-skeleton-blocco-replica-dimensioni-es-8ab9a03d")} />
          <AnatomyRow prop={showcaseMessage("components.design-system.components-h.a11y-9126f700")} val={showcaseMessage("components.design-system.components-h.aria-busy-true-sul-container-durante-loadi-b270d576")} />
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   CAROUSEL  (M3 Expressive)
   3-slot Center-aligned Hero: peek-sx, hero, peek-dx.
   Overflow:hidden del container taglia il bordo piatto dei peek.
   Gap uniforme 8px, spring transitions su tutto.
   ═══════════════════════════════════════════════════════════ */

const SP = showcaseMotion.carousel;

/** Radius M3: 16px uniformi su ogni item */
const ITEM_RADIUS = 16;
/** Gap M3 uniforme tra gli slot */
const ITEM_GAP = 8;
/** Peek raw flex-basis */
const PEEK_BASIS = "20%";
/** Px che il peek si estende oltre il bordo del container */
const PEEK_EXTEND = 20;

const CAROUSEL_ITEMS = [
  { id: "napoletana", title: showcaseMessage("components.design-system.components-h.napoletana-stg-fc9d3868"), sub: "Forno legna · 450°C · 60-90s", img: "https://images.unsplash.com/photo-1765652584214-ab9167622c8d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxuZWFwb2xpdGFuJTIwcGl6emElMjB3b29kJTIwb3ZlbnxlbnwxfHx8fDE3NzEyMjg4NDF8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=vulcan&utm_medium=referral" },
  { id: "teglia", title: showcaseMessage("components.design-system.components-h.teglia-romana-3dfce708"), sub: "Elettrico · 280°C · 15-20min", img: "https://images.unsplash.com/photo-1695324318807-a234819bad21?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyb21hbiUyMHBpenphJTIwYWwlMjB0YWdsaW98ZW58MXx8fHwxNzcxMjI4ODQyfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=vulcan&utm_medium=referral" },
  { id: "chicago", title: showcaseMessage("components.design-system.components-h.chicago-deep-dish-1124774f"), sub: "Elettrico · 220°C · 25-35min", img: "https://images.unsplash.com/photo-1765933613028-63223082b4ff?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkZWVwJTIwZGlzaCUyMHBpenphJTIwY2hlZXNlfGVufDF8fHx8MTc3MTIyODg0Nnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=vulcan&utm_medium=referral" },
  { id: "margherita", title: showcaseMessage("components.design-system.components-h.margherita-classica-a55045c4"), sub: "Universale · 250-500°C · variabile", img: "https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwaXp6YSUyMG1hcmdoZXJpdGElMjBiYXNpbCUyMG1venphcmVsbGF8ZW58MXx8fHwxNzcxMjI4ODQ5fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=vulcan&utm_medium=referral" },
  { id: "fermentazione", title: showcaseMessage("components.design-system.components-h.lunga-maturazione-9c6f42d7"), sub: "48-72h frigo · alveolatura aperta", img: "https://images.unsplash.com/photo-1738717201678-412395e65b36?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwaXp6YSUyMGRvdWdoJTIwcHJvb2ZpbmclMjBmZXJtZW50YXRpb258ZW58MXx8fHwxNzcxMjI4ODQzfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=vulcan&utm_medium=referral" },
  { id: "sourdough", title: showcaseMessage("components.design-system.components-h.sourdough-crumb-e28bd6ba"), sub: "Lievito madre · 72h · alveolatura", img: "https://images.unsplash.com/photo-1763297014734-e2ac58a6f3c0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhcnRpc2FuJTIwc291cmRvdWdoJTIwYnJlYWQlMjBjbG9zZXVwfGVufDF8fHx8MTc3MTIzMzY2Mnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=vulcan&utm_medium=referral" },
  { id: "focaccia", title: showcaseMessage("components.design-system.components-h.focaccia-ligure-71be3d63"), sub: "Olio EVO · 220°C · 20min", img: "https://images.unsplash.com/photo-1706145787429-4d6b00a5dc0c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpdGFsaWFuJTIwZm9jYWNjaWElMjByb3NlbWFyeSUyMG9saXZlJTIwb2lsfGVufDF8fHx8MTc3MTIzMzY2M3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=vulcan&utm_medium=referral" },
  { id: "forno", title: showcaseMessage("components.design-system.components-h.forno-a-legna-fd23b413"), sub: "Temperatura · 450-500°C", img: "https://images.unsplash.com/photo-1706011465964-7a226eea129a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b29kJTIwZmlyZWQlMjBwaXp6YSUyMG92ZW4lMjBmbGFtZXN8ZW58MXx8fHwxNzcxMTk1OTgwfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=vulcan&utm_medium=referral" },
];

/** Varianti direzionali per AnimatePresence — spring slide + scale */
const slideVariants = {
  enter: (d: number) => ({ x: d >= 0 ? 60 : -60, opacity: 0, scale: 0.97 }),
  center: { x: 0, opacity: 1, scale: 1 },
  exit: (d: number) => ({ x: d >= 0 ? -60 : 60, opacity: 0, scale: 0.97 }),
};

function SpringArrow({ direction, onClick, disabled }: { direction: "left" | "right"; onClick: () => void; disabled: boolean }) {
  const Icon = direction === "left" ? ChevronLeft : ChevronRight;
  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      whileHover={{ scale: 1.08 }}
      transition={SP.arrow}
      className="w-9 h-9 rounded-full flex items-center justify-center active:scale-82 transition-transform dsx-s-6b96ae0d55"
      style={{ "--dsx-cursor": toShowcaseCssValue(disabled ? "default" : "pointer", false) } as any}
      animate={{ opacity: disabled ? 0.3 : 1 }}
      aria-label={direction === "left" ? showcaseMessage("components.design-system.components-h.slide-precedente-c0b64746") : showcaseMessage("components.design-system.components-h.slide-successiva-51fd11cd")}
    >
      <Icon size={18} className="dsx-s-86a4206cb1" />
    </motion.button>
  );
}

/**
 * M3 Center-aligned Hero — 3-slot layout.
 *
 * 3 slot fissi: peek-sx (20%), hero (flex:1), peek-dx (20%).
 * I peek si estendono oltre il container con margin negativo
 * (PEEK_EXTEND): overflow:hidden del container taglia il bordo
 * piatto. Gap uniforme ITEM_GAP tra tutti gli slot.
 * Il contenuto di ogni slot crossfade con spring + slide direzionale.
 */
function CarouselSpec() {
  const N = CAROUSEL_ITEMS.length;
  const [focus, setFocus] = useState(0);
  const [dir, setDir] = useState(0);

  const prev = () => { setDir(-1); setFocus((f) => (f - 1 + N) % N); };
  const next = () => { setDir(1); setFocus((f) => (f + 1) % N); };

  /* Swipe */
  const touchStart = useRef(0);
  const onTouchStart = (e: React.TouchEvent) => { touchStart.current = e.touches[0].clientX; };
  const onTouchEnd = (e: React.TouchEvent) => {
    const dx = e.changedTouches[0].clientX - touchStart.current;
    if (Math.abs(dx) > 40) { dx > 0 ? prev() : next(); }
  };

  const leftItem = CAROUSEL_ITEMS[(focus - 1 + N) % N];
  const heroItem = CAROUSEL_ITEMS[focus];
  const rightItem = CAROUSEL_ITEMS[(focus + 1) % N];

  return (
    <div className="flex flex-col gap-8">
      <SectionHeader
        title={showcaseMessage("components.design-system.components-h.carousel-f1f842e1")}
        description={showcaseMessage("components.design-system.components-h.m3-expressive-carousel-con-6-varianti-cent-ade347ea")}
      />

      <SubSectionLabel label={showcaseMessage("components.design-system.components-h.panoramica-f38c9a27")} />
      <Panoramica
        descrizione={showcaseMessage("components.design-system.components-h.m3-expressive-carousel-con-6-varianti-il-p-1a5c5b53")}
        principi={[
          showcaseMessage("components.design-system.components-h.6-varianti-center-aligned-hero-hero-multi--07c6dda2"),
          showcaseMessage("components.design-system.components-h.principio-uncontained-container-overflow-h-e171ed81"),
          showcaseMessage("components.design-system.components-h.spring-physics-differenziate-flex-260-26-o-fe9754bd"),
        ]}
      />

      <SubSectionLabel label={showcaseMessage("components.design-system.components-h.specifiche-057caf2f")} />

      {/* ── 1. M3 Center-aligned Hero — 3-slot ── */}
      <div className="surface-card p-5">
        <span className="type-label dsx-s-e2184fadc0">
          {showcaseMessage("components.design-system.components-h.m3-center-aligned-hero-3-slot-layout-f1f2c1e0")}</span>
        <p className="dsx-s-171ec8abac">
          {showcaseMessage("components.design-system.components-h.3-slot-fissi-peek-sx-3e3d08a7")}<span className="dsx-s-154dc56bcf">{showcaseMessage("components.design-system.components-h.flex-0-0-c42ec325")}{PEEK_BASIS}</span>{showcaseMessage("components.design-system.components-h.hero-9e6428e6")}<span className="dsx-s-154dc56bcf">{showcaseMessage("components.design-system.components-h.flex-1-634a28be")}</span>{showcaseMessage("components.design-system.components-h.peek-dx-49d24343")}<span className="dsx-s-154dc56bcf">{showcaseMessage("components.design-system.components-h.flex-0-0-c42ec325")}{PEEK_BASIS}</span>{showcaseMessage("components.design-system.components-h.gap-uniforme-6512a58e")}<span className="dsx-s-154dc56bcf">{ITEM_GAP}px</span>{showcaseMessage("components.design-system.components-h.peek-extend-72af9be6")}<span className="dsx-s-154dc56bcf">{PEEK_EXTEND}px</span> {showcaseMessage("components.design-system.components-h.oltre-il-container-b600899d")}</p>

        <div className="mt-5 relative">
          <div
            className="flex overflow-hidden dsx-s-57ca7df9d7"
            style={{ "--dsx-gap": toShowcaseCssValue(ITEM_GAP, false) } as any}
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
            role="region"
            aria-roledescription="carousel"
            aria-label={showcaseMessage("components.design-system.components-h.stili-pizza-ab45b2ab")}
          >
            {/* ── Peek sinistro ── */}
            <div
              className="relative overflow-hidden cursor-pointer flex-shrink-0 dsx-s-995c74523f"
              role="button"
              tabIndex={0}
              aria-label={showcaseMessage("components.design-system.components-h.mostra-value-9a8864ea", [leftItem.title])}
              style={{ "--dsx-flex-basis": toShowcaseCssValue(PEEK_BASIS, false), "--dsx-border-radius": toShowcaseCssValue(ITEM_RADIUS, false), "--dsx-margin-left": toShowcaseCssValue(-PEEK_EXTEND, false) } as any}
              onClick={prev}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  prev();
                }
              }}
            >
              <AnimatePresence custom={dir} initial={false}>
                <motion.div
                  key={leftItem.id + "-left"}
                  className="absolute inset-0"
                  custom={dir}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={SP.flex}
                >
                  <ImageWithFallback
                    src={leftItem.img}
                    alt={leftItem.title}
                    className="w-full h-full dsx-s-bcc9535a4c"
                  />
                </motion.div>
              </AnimatePresence>
            </div>

            {/* ── Hero centrale ─ */}
            <div
              className="relative overflow-hidden flex-1 min-w-0 dsx-s-61c283c057"
              style={{ "--dsx-border-radius": toShowcaseCssValue(ITEM_RADIUS, false) } as any}
            >
              <AnimatePresence custom={dir} initial={false}>
                <motion.div
                  key={heroItem.id + "-hero"}
                  className="absolute inset-0"
                  custom={dir}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={SP.flex}
                >
                  <ImageWithFallback
                    src={heroItem.img}
                    alt={heroItem.title}
                    className="w-full h-full dsx-s-bcc9535a4c"
                  />
                  {/* Gradient scrim */}
                  <div
                    className="absolute bottom-0 left-0 right-0 dsx-s-a67d466791"
                  />
                  {/* Label */}
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <span className="dsx-s-9eebe548f2"
                    >
                      {heroItem.title}
                    </span>
                    <span className="dsx-s-81a7ce9ccb"
                    >
                      {heroItem.sub}
                    </span>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* ── Peek destro ── */}
            <div
              className="relative overflow-hidden cursor-pointer flex-shrink-0 dsx-s-b3e52d9380"
              role="button"
              tabIndex={0}
              aria-label={showcaseMessage("components.design-system.components-h.mostra-value-9a8864ea", [rightItem.title])}
              style={{ "--dsx-flex-basis": toShowcaseCssValue(PEEK_BASIS, false), "--dsx-border-radius": toShowcaseCssValue(ITEM_RADIUS, false), "--dsx-margin-right": toShowcaseCssValue(-PEEK_EXTEND, false) } as any}
              onClick={next}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  next();
                }
              }}
            >
              <AnimatePresence custom={dir} initial={false}>
                <motion.div
                  key={rightItem.id + "-right"}
                  className="absolute inset-0"
                  custom={dir}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={SP.flex}
                >
                  <ImageWithFallback
                    src={rightItem.img}
                    alt={rightItem.title}
                    className="w-full h-full dsx-s-bcc9535a4c"
                  />
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          <div className="absolute top-1/2 left-3 -translate-y-1/2 z-10">
            <SpringArrow direction="left" onClick={prev} disabled={false} />
          </div>
          <div className="absolute top-1/2 right-3 -translate-y-1/2 z-10">
            <SpringArrow direction="right" onClick={next} disabled={false} />
          </div>
        </div>

        {/* Spring dots */}
        <div className="flex items-center justify-center gap-2 mt-4">
          {CAROUSEL_ITEMS.map((item, i) => {
            const isActive = i === focus;
            return (
              <motion.button
                key={item.id}
                onClick={() => { setDir(i > focus ? 1 : -1); setFocus(i); }}
                className="relative w-6 h-6 rounded-full flex items-center justify-center active:scale-80 transition-transform dsx-s-5b158a4925 ds-showcase__compact-target"
                aria-label={showcaseMessage("components.design-system.components-h.vai-a-value-47664dcf", [item.title])}
              >
                <motion.span
                  className="relative block h-2 rounded-full overflow-hidden dsx-s-279d49df94"
                  animate={{ width: isActive ? 24 : 8 }}
                  transition={SP.dot}
                >
                  {isActive && (
                    <motion.span
                      layoutId="m3-carousel-dot"
                      className="absolute inset-0 rounded-full dsx-s-0a278ece1c"
                      transition={SP.dot}
                    />
                  )}
                </motion.span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* ── 2. Slot proportions diagram ── */}
      <div className="surface-card p-5">
        <span className="type-label dsx-s-e2184fadc0">
          {showcaseMessage("components.design-system.components-h.proporzioni-slot-m3-center-aligned-hero-63af731d")}</span>
        <div className="mt-4 flex items-end gap-2 dsx-s-7b2b2246a4">
          {[
            { label: showcaseMessage("components.design-system.components-h.clip-1bd3bd67"), pct: `${PEEK_EXTEND}px`, flex: 0.5, dist: 2, maxFlex: 5.5 },
            { label: showcaseMessage("components.design-system.components-h.peek-b4068697"), pct: PEEK_BASIS, flex: 2, dist: 1, maxFlex: 5.5 },
            { label: showcaseMessage("components.design-system.components-h.hero-17f5d4f0"), pct: "flex:1", flex: 5.5, dist: 0, maxFlex: 5.5 },
            { label: showcaseMessage("components.design-system.components-h.peek-b4068697"), pct: PEEK_BASIS, flex: 2, dist: 1, maxFlex: 5.5 },
            { label: showcaseMessage("components.design-system.components-h.clip-1bd3bd67"), pct: `${PEEK_EXTEND}px`, flex: 0.5, dist: 2, maxFlex: 5.5 },
          ].map((bar, i) => (
            <motion.div
              key={i}
              className="rounded-xl flex flex-col justify-end items-center overflow-hidden dsx-s-8d2a076560 ds-showcase__opaque-specimen"
              style={{ "--dsx-flex": toShowcaseCssValue(Math.max(bar.flex, 0.15), true), "--dsx-height": toShowcaseCssValue(`${10 + (bar.flex / bar.maxFlex) * 85}%`, false), "--dsx-background": toShowcaseCssValue(bar.dist === 0 ? "var(--primary)" : bar.dist === 1 ? "color-mix(in srgb, var(--primary) 50%, var(--surface-container))" : "var(--surface-container-high)", false), "--dsx-opacity": toShowcaseCssValue(bar.dist >= 2 ? 0.4 : 1, true) } as any}
              initial={{ flex: 0 }}
              animate={{ flex: Math.max(bar.flex, 0.15) }}
              transition={SP.flex}
            >
              <span style={{ "--dsx-color": toShowcaseCssValue(bar.dist === 0 ? "var(--primary-foreground)" : "var(--text-default)", false) } as any} className={`dsx-s-9258401fdc ${bar.dist === 1 ? "ds-showcase__bar-value" : ""}`}>
                {bar.label}
              </span>
              <span style={{ "--dsx-color": toShowcaseCssValue(bar.dist === 0 ? "var(--primary-foreground)" : "var(--text-default)", false) } as any} className={`dsx-s-413ec2fdd9 ${bar.dist === 1 ? "ds-showcase__bar-value" : ""}`}>
                {bar.pct}
              </span>
            </motion.div>
          ))}
        </div>
        <div className="flex justify-center mt-2">
          <span className="dsx-s-6849179898">
            <span className="dsx-s-afccd1dd2e">{showcaseMessage("components.design-system.components-h.clip-7d92783c")}{PEEK_EXTEND}px</span> {showcaseMessage("components.design-system.components-h.peek-45627323")}{PEEK_BASIS} — <span className="dsx-s-4700464a9b">{showcaseMessage("components.design-system.components-h.hero-flex-1-6e711429")}</span> {showcaseMessage("components.design-system.components-h.peek-45627323")}{PEEK_BASIS} — <span className="dsx-s-afccd1dd2e">{showcaseMessage("components.design-system.components-h.clip-7d92783c")}{PEEK_EXTEND}px</span>
          </span>
        </div>
      </div>

      {/* ── 3. Spring parameters ── */}
      <div className="surface-card p-5">
        <span className="type-label dsx-s-e2184fadc0">{showcaseMessage("components.design-system.components-h.parametri-spring-m3-6dd2cfe5")}</span>
        <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { name: showcaseMessage("components.design-system.components-h.slide-a5d5b46a"), s: 260, d: 26, m: "0.8", target: showcaseMessage("components.design-system.components-h.crossfade-contenuto-x-scale-d2985b37") },
            { name: showcaseMessage("components.design-system.components-h.overlay-249450cb"), s: 300, d: 24, m: "1", target: showcaseMessage("components.design-system.components-h.y-opacity-label-hero-975dfde7") },
            { name: showcaseMessage("components.design-system.components-h.dots-4b4475f2"), s: 420, d: 28, m: "1", target: showcaseMessage("components.design-system.components-h.width-pill-layoutid-morph-a45a7439") },
            { name: showcaseMessage("components.design-system.components-h.frecce-2876c844"), s: 500, d: 22, m: "1", target: showcaseMessage("components.design-system.components-h.whiletap-whilehover-275b077c") },
          ].map((sp) => (
            <div key={sp.name} className="p-3 rounded-lg dsx-s-e4f209c55b">
              <div className="type-data dsx-s-d4cbd3ba0a">{sp.name}</div>
              <div className="dsx-s-03f698a51d">
                {showcaseMessage("components.design-system.components-h.s-6126cda8")}{sp.s} {showcaseMessage("components.design-system.components-h.d-f44706ab")}{sp.d} {showcaseMessage("components.design-system.components-h.m-ae09f480")}{sp.m}
              </div>
              <div className="dsx-s-ff544bce2a">
                {sp.target}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── 4. Anatomy ── */}
      <div className="surface-card p-5">
        <span className="type-label dsx-s-e2184fadc0">{showcaseMessage("components.design-system.components-h.anatomia-80a1ebf8")}</span>
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <AnatomyRow prop={showcaseMessage("components.design-system.components-h.3-slot-layout-2e1a784b")} val={showcaseMessage("components.design-system.components-h.peek-sx-flex-0-0-20-hero-flex-1-56-peek-dx-e7ab35e5")} />
          <AnatomyRow prop={showcaseMessage("components.design-system.components-h.uncontained-clip-cdafd205")} val={showcaseMessage("components.design-system.components-h.peek-sx-marginleft-20px-peek-dx-marginrigh-82b92753")} />
          <AnatomyRow prop={showcaseMessage("components.design-system.components-h.gap-uniforme-fb88773c")} val={showcaseMessage("components.design-system.components-h.gap-8px-tra-tutti-gli-slot-nessun-margine--ac4e2fe4")} />
          <AnatomyRow prop={showcaseMessage("components.design-system.components-h.item-borderradius-fc3a8166")} val={showcaseMessage("components.design-system.components-h.tutti-gli-slot-borderradius-16px-il-clip-p-1d06c251")} />
          <AnatomyRow prop={showcaseMessage("components.design-system.components-h.spring-slide-1fba1b49")} val={showcaseMessage("components.design-system.components-h.animatepresence-mode-poplayout-variants-di-16e6ddca")} />
          <AnatomyRow prop={showcaseMessage("components.design-system.components-h.scrim-label-c832d6be")} val={showcaseMessage("components.design-system.components-h.solo-sull-hero-scrim-gradient-55-titolo-pl-20ea8286")} />
          <AnatomyRow prop={showcaseMessage("components.design-system.components-h.gesture-909cc1f6")} val={showcaseMessage("components.design-system.components-h.touch-swipe-threshold-40px-click-peek-sx-p-ba88f541")} />
          <AnatomyRow prop={showcaseMessage("components.design-system.components-h.a11y-9126f700")} val={showcaseMessage("components.design-system.components-h.container-role-region-aria-roledescription-deb36c5a")} />
        </div>
      </div>

      {/* ── 5. Varianti M3 Expressive ── */}
      <div className="surface-card p-5">
        <span className="type-label dsx-s-e2184fadc0">{showcaseMessage("components.design-system.components-h.varianti-m3-expressive-90dfe969")}</span>
        <p className="dsx-s-0b3b1de047">
          {showcaseMessage("components.design-system.components-h.le-6-varianti-del-carousel-m3-expressive-2683dd91")}</p>
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <AnatomyRow prop={showcaseMessage("components.design-system.components-h.hero-17f5d4f0")} val={showcaseMessage("components.design-system.components-h.1-large-70-1-small-28-small-clippato-al-bo-d878beeb")} />
          <AnatomyRow prop={showcaseMessage("components.design-system.components-h.multi-browse-a381c24b")} val={showcaseMessage("components.design-system.components-h.3-medium-items-uguali-edge-clip-sull-ultim-05ca3be3")} />
          <AnatomyRow prop={showcaseMessage("components.design-system.components-h.uncontained-ef6d4bff")} val={showcaseMessage("components.design-system.components-h.tutti-large-items-stessa-dimensione-42-scr-b1cc84f9")} />
          <AnatomyRow prop={showcaseMessage("components.design-system.components-h.uncontained-multi-ar-53f31e47")} val={showcaseMessage("components.design-system.components-h.item-con-aspect-ratio-diversi-0-7-1-6-larg-99bc5ade")} />
          <AnatomyRow prop={showcaseMessage("components.design-system.components-h.full-screen-225c026a")} val={showcaseMessage("components.design-system.components-h.100-width-spring-crossfade-scale-cinematic-9a27f8e8")} />
          <AnatomyRow prop={showcaseMessage("components.design-system.components-h.center-aligned-hero-eebb5d70")} val={showcaseMessage("components.design-system.components-h.il-layout-sopra-peek-sx-s-hero-l-peek-dx-s-69fb17b9")} />
        </div>
        <div className="mt-5 flex flex-col gap-6">
          <HeroDemo />
          <MultiBrowseDemo />
          <UncontainedDemo />
          <UncontainedMultiAspectDemo />
          <FullScreenDemo />
          <VariantComparisonCard />
        </div>
      </div>

      <SubSectionLabel label={showcaseMessage("components.design-system.components-h.linee-guida-b43417d1")} />
      <LineeGuida
        fai={[
          showcaseMessage("components.design-system.components-h.center-aligned-hero-per-hero-content-con-a-dcf66a62"),
          showcaseMessage("components.design-system.components-h.multi-browse-per-collezioni-omogenee-ingre-ace1af0a"),
          showcaseMessage("components.design-system.components-h.full-screen-per-contenuto-cinematico-immer-01893a3f"),
        ]}
        nonFare={[
          showcaseMessage("components.design-system.components-h.mai-piu-di-8-10-item-l-utente-perde-il-sen-1d61938b"),
          showcaseMessage("components.design-system.components-h.mai-carousel-per-contenuto-critico-non-tut-97877dad"),
          showcaseMessage("components.design-system.components-h.mai-autoplay-senza-controllo-pause-distrae-10aa7143"),
        ]}
      />

      <SubSectionLabel label={showcaseMessage("components.design-system.components-h.accessibilita-e59811a6")} />
      <AccessibilitaInfo items={[
        { label: "ARIA", desc: showcaseMessage("components.design-system.components-h.role-region-aria-roledescription-carousel--f4667ba6") },
        { label: showcaseMessage("components.design-system.components-h.tastiera-d99ab9ca"), desc: showcaseMessage("components.design-system.components-h.arrow-keys-per-navigare-dots-focusabili-en-9a9f6f95") },
        { label: showcaseMessage("components.design-system.components-h.reduced-motion-78980499"), desc: showcaseMessage("components.design-system.components-h.spring-diventa-instant-stiffness-9999-ness-ab666bdf") },
      ]} />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   ENTRIES REGISTRY
   ══════════════════════════════════════════════════════════ */
export const ENTRIES: SectionEntry[] = [
  { id: "loading", label: showcaseMessage("components.design-system.components-h.loading-indicator-5d40423b"), group: "c", Component: LoadingIndicatorSpec },
  { id: "carousel", label: showcaseMessage("components.design-system.components-h.carousel-f1f842e1"), group: "c", Component: CarouselSpec },
];
