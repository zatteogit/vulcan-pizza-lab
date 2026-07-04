import { useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
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
  return (
    <motion.div
      initial={{ backgroundPosition: "-200% 0" }}
      animate={{ backgroundPosition: "200% 0" }}
      transition={{
        duration: 1.8,
        repeat: Infinity,
        ease: "easeInOut",
        delay,
      }}
      style={{
        width,
        height,
        borderRadius: radius,
        background: shimmerBg,
        backgroundSize: "200% 100%",
      }}
    />
  );
}

/* ── Pulsing dot ── */
function PulsingDot({ delay, color }: { delay: number; color: string }) {
  return (
    <motion.div
      animate={{ scale: [1, 1.35, 1], opacity: [0.45, 1, 0.45] }}
      transition={{
        duration: 1.2,
        repeat: Infinity,
        ease: "easeInOut",
        delay,
      }}
      style={{
        width: 10,
        height: 10,
        borderRadius: "50%",
        background: color,
      }}
    />
  );
}

function LoadingIndicatorSpec() {
  return (
    <div className="flex flex-col gap-8">
      <SectionHeader
        title="Loading Indicator"
        description="M3 distingue il Loading Indicator dai Progress Indicators: comunica che il contenuto sta arrivando, non il progresso di un'operazione. Tre pattern: skeleton shimmer, pulsing dots e branded loader."
      />

      <SubSectionLabel label="Panoramica" />
      <Panoramica
        descrizione="Il Loading Indicator comunica che il contenuto sta arrivando. 3 pattern distinti: Skeleton shimmer (placeholder strutturato), Pulsing dots (attesa breve), e Branded loader (anello SVG con VulcanMark). Diverso dai Progress Indicators che comunicano un progresso quantificabile."
        principi={[
          "Skeleton shimmer: placeholder che replica dimensioni esatte del contenuto finale (zero CLS)",
          "Pulsing dots: 3 cerchi con stagger 0.2s, per attese brevi (< 3s)",
          "Branded loader: anello SVG rotante con VulcanMark al centro per caricamenti app-level",
        ]}
      />

      <SubSectionLabel label="Specifiche" />

      {/* ── 1. Skeleton shimmer variants ── */}
      <div className="surface-card p-5">
        <span className="type-label" style={{ color: "var(--text-default)", fontSize: "var(--font-size-base)" }}>
          Skeleton Shimmer — varianti
        </span>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "var(--font-size-md)", color: "var(--muted-foreground)", lineHeight: "var(--leading-relaxed)", marginTop: "8px" }}>
          Shimmer lineare con gradiente che scorre. Ogni blocco riproduce la forma del contenuto finale per ridurre il Cumulative Layout Shift (CLS) e dare un feedback strutturale.
        </p>

        <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-5">
          {/* Recipe card skeleton */}
          <div className="flex flex-col gap-3">
            <span className="type-code" style={{ color: "var(--primary)" }}>Recipe Card</span>
            <div
              className="p-4 rounded-2xl flex flex-col gap-3"
              style={{
                background: "var(--surface-container-low)",
                border: "1px solid var(--outline-variant)",
              }}
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
            <span className="type-code" style={{ color: "var(--primary)" }}>Style Photo</span>
            <div
              className="rounded-2xl overflow-hidden flex flex-col gap-3"
              style={{
                background: "var(--surface-container-low)",
                border: "1px solid var(--outline-variant)",
                padding: "12px",
              }}
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
            <span className="type-code" style={{ color: "var(--primary)" }}>Testo / Lista</span>
            <div
              className="p-4 rounded-2xl flex flex-col gap-3"
              style={{
                background: "var(--surface-container-low)",
                border: "1px solid var(--outline-variant)",
              }}
            >
              <ShimmerBlock width="55%" height={18} radius={6} />
              <ShimmerBlock width="100%" height={10} radius={4} delay={0.1} />
              <ShimmerBlock width="100%" height={10} radius={4} delay={0.15} />
              <ShimmerBlock width="80%" height={10} radius={4} delay={0.2} />
              <div style={{ height: 8 }} />
              <ShimmerBlock width="55%" height={18} radius={6} delay={0.3} />
              <ShimmerBlock width="100%" height={10} radius={4} delay={0.35} />
              <ShimmerBlock width="90%" height={10} radius={4} delay={0.4} />
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. Pulsing dots ── */}
      <div className="surface-card p-5">
        <span className="type-label" style={{ color: "var(--text-default)", fontSize: "var(--font-size-base)" }}>
          Pulsing Dots — micro feedback
        </span>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "var(--font-size-md)", color: "var(--muted-foreground)", lineHeight: "var(--leading-relaxed)", marginTop: "8px" }}>
          Tre dot con scala staggerata: ideale per feedback breve ("sto calcolando la ricetta"). Varianti: primary, ember gradient, neutral.
        </p>

        <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            { label: "Primary", color: "var(--primary)" },
            { label: "Tertiary (ambra)", color: "var(--tertiary)" },
            { label: "Neutral", color: "var(--muted-foreground)" },
          ].map((variant) => (
            <div key={variant.label} className="flex flex-col items-center gap-3">
              <div
                className="flex items-center justify-center gap-2 rounded-2xl"
                style={{
                  width: "100%",
                  height: 80,
                  background: "var(--surface-container-low)",
                  border: "1px solid var(--outline-variant)",
                }}
              >
                <PulsingDot delay={0} color={variant.color} />
                <PulsingDot delay={0.2} color={variant.color} />
                <PulsingDot delay={0.4} color={variant.color} />
              </div>
              <span className="type-code" style={{ color: "var(--muted-foreground)" }}>{variant.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── 3. Branded loader (mark breath) ── */}
      <div className="surface-card p-5">
        <span className="type-label" style={{ color: "var(--text-default)", fontSize: "var(--font-size-base)" }}>
          Branded Loader — mark respirante
        </span>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "var(--font-size-md)", color: "var(--muted-foreground)", lineHeight: "var(--leading-relaxed)", marginTop: "8px" }}>
          Il mark Vulcan che respira dentro un anello circolare indeterminato. Per operazioni piu lunghe (generazione ricetta, caricamento iniziale). L'anello usa un <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "var(--font-size-base)", color: "var(--primary)" }}>strokeDashoffset</span> rotante, il mark scala +-3%.
        </p>

        <div className="mt-5 flex flex-wrap gap-6 justify-center">
          {/* Large branded */}
          <div className="flex flex-col items-center gap-3">
            <div
              className="relative flex items-center justify-center rounded-full"
              style={{
                width: 96,
                height: 96,
                background: "var(--surface-container-low)",
                border: "1px solid var(--outline-variant)",
              }}
            >
              {/* Rotating track */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0"
              >
                <svg width="96" height="96" viewBox="0 0 96 96">
                  <circle cx="48" cy="48" r="40" fill="none" stroke="var(--surface-container-high)" strokeWidth="3" />
                  <circle
                    cx="48" cy="48" r="40" fill="none"
                    stroke="var(--primary)"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 40 * 0.3} ${2 * Math.PI * 40 * 0.7}`}
                    style={{ transform: "rotate(-90deg)", transformOrigin: "center" }}
                  />
                </svg>
              </motion.div>
              {/* Breathing mark */}
              <motion.div
                animate={{ scale: [1, 1.03, 1] }}
                transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
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
            <span className="type-code" style={{ color: "var(--muted-foreground)" }}>96px — Large</span>
          </div>

          {/* Medium branded */}
          <div className="flex flex-col items-center gap-3">
            <div
              className="relative flex items-center justify-center rounded-full"
              style={{
                width: 56,
                height: 56,
                background: "var(--surface-container-low)",
                border: "1px solid var(--outline-variant)",
              }}
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0"
              >
                <svg width="56" height="56" viewBox="0 0 56 56">
                  <circle cx="28" cy="28" r="23" fill="none" stroke="var(--surface-container-high)" strokeWidth="2.5" />
                  <circle
                    cx="28" cy="28" r="23" fill="none"
                    stroke="var(--primary)"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 23 * 0.3} ${2 * Math.PI * 23 * 0.7}`}
                    style={{ transform: "rotate(-90deg)", transformOrigin: "center" }}
                  />
                </svg>
              </motion.div>
              <motion.div
                animate={{ scale: [1, 1.03, 1] }}
                transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
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
            <span className="type-code" style={{ color: "var(--muted-foreground)" }}>56px — Medium</span>
          </div>

          {/* Small — dots only fallback */}
          <div className="flex flex-col items-center gap-3">
            <div
              className="flex items-center justify-center gap-1.5 rounded-full"
              style={{
                width: 40,
                height: 40,
                background: "var(--surface-container-low)",
                border: "1px solid var(--outline-variant)",
              }}
            >
              <PulsingDot delay={0} color="var(--primary)" />
              <PulsingDot delay={0.15} color="var(--primary)" />
              <PulsingDot delay={0.3} color="var(--primary)" />
            </div>
            <span className="type-code" style={{ color: "var(--muted-foreground)" }}>40px — Small (dots)</span>
          </div>
        </div>
      </div>

      <SubSectionLabel label="Linee guida" />
      <LineeGuida
        fai={[
          "Skeleton per contenuto strutturato (card, liste, dettagli) — mantiene il layout",
          "Pulsing dots per attese brevi e generiche (salvataggio, invio)",
          "Branded loader solo per il caricamento iniziale dell'app",
        ]}
        nonFare={[
          "Mai skeleton con dimensioni diverse dal contenuto finale — causa layout shift",
          "Mai loading indicator per operazioni < 200ms — feedback istantaneo è sufficiente",
          "Mai animazioni pesanti — il dispositivo sta già lavorando",
        ]}
      />

      <SubSectionLabel label="Accessibilità" />
      <AccessibilitaInfo items={[
        { label: "aria-busy", desc: "aria-busy='true' sul container durante loading. Rimosso quando il contenuto è pronto." },
        { label: "aria-live", desc: "aria-live='polite' per annunciare il completamento senza interrompere." },
        { label: "Reduced motion", desc: "Shimmer diventa gradiente statico. Dots diventano opacity pulse senza scale." },
      ]} />

      {/* ── 4. Confronto visivo: Skeleton → Contenuto ── */}
      <div className="surface-card p-5">
        <span className="type-label" style={{ color: "var(--text-default)", fontSize: "var(--font-size-base)" }}>
          Transizione Skeleton → Contenuto
        </span>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "var(--font-size-md)", color: "var(--muted-foreground)", lineHeight: "var(--leading-relaxed)", marginTop: "8px" }}>
          Il contenuto finale appare con <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "var(--font-size-base)", color: "var(--primary)" }}>fadeIn</span> 300ms sopra lo skeleton, che svanisce simultaneamente. L'utente percepisce continuita senza flash.
        </p>
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Skeleton state */}
          <div className="flex flex-col gap-2">
            <span className="type-code" style={{ fontSize: "var(--font-size-sm)", color: "var(--muted-foreground)" }}>STATO: LOADING</span>
            <div className="p-4 rounded-xl flex flex-col gap-2.5" style={{ background: "var(--surface-container)", border: "1px solid var(--outline-variant)" }}>
              <ShimmerBlock width="100%" height={64} radius={10} />
              <ShimmerBlock width="60%" height={14} radius={4} delay={0.1} />
              <ShimmerBlock width="100%" height={10} radius={4} delay={0.15} />
              <ShimmerBlock width="85%" height={10} radius={4} delay={0.2} />
            </div>
          </div>
          {/* Loaded state */}
          <div className="flex flex-col gap-2">
            <span className="type-code" style={{ fontSize: "var(--font-size-sm)", color: "var(--cta)" }}>STATO: CARICATO</span>
            <div className="p-4 rounded-xl flex flex-col gap-2.5" style={{ background: "var(--surface-container)", border: "1px solid var(--outline-variant)" }}>
              <div className="rounded-lg overflow-hidden" style={{ height: 64, background: "linear-gradient(135deg, var(--primary), var(--tertiary))" }}>
                <div className="w-full h-full flex items-center justify-center">
                  <Flame size={24} style={{ color: "var(--container-page)", opacity: 0.7 }} />
                </div>
              </div>
              <span style={{ fontFamily: "'Playfair Display', serif", fontSize: "var(--font-size-2xl)", fontWeight: "var(--weight-bold)" as any, color: "var(--text-default)" }}>Napoletana STG</span>
              <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "var(--font-size-md)", color: "var(--muted-foreground)", lineHeight: "var(--leading-body)" }}>
                Classica AVPN, forno legna 450°C, idratazione 55-62%, maturazione 8-24h a temperatura ambiente.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── 5. Anatomy ── */}
      <div className="surface-card p-5">
        <span className="type-label" style={{ color: "var(--text-default)", fontSize: "var(--font-size-base)" }}>Anatomia</span>
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <AnatomyRow prop="Shimmer" val="linear-gradient 110deg, 3 stop (surface-container → surface-container-high → surface-container). backgroundSize 200%, animazione 1.8s easeInOut." />
          <AnatomyRow prop="Pulsing dots" val="10px radius-full, scale 1→1.35→1, opacity 0.45→1→0.45. Stagger 0.2s tra i 3 dots. Durata 1.2s." />
          <AnatomyRow prop="Branded" val="Anello SVG stroke 3px, strokeDasharray 30%/70%, rotate 360° 2s linear. Mark scale +-3% 2.4s easeInOut." />
          <AnatomyRow prop="Transizione" val="fadeIn 300ms ease con crossfade: skeleton opacity 1→0, contenuto opacity 0→1 simultanei." />
          <AnatomyRow prop="CLS" val="Ogni skeleton blocco replica dimensioni esatte del contenuto finale (width, height, radius) per zero layout shift." />
          <AnatomyRow prop="A11y" val="aria-busy='true' sul container durante loading. aria-live='polite' per annunciare completamento." />
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

const SP = {
  flex:    { type: "spring" as const, stiffness: 260, damping: 26, mass: 0.8 },
  overlay: { type: "spring" as const, stiffness: 300, damping: 24 },
  dot:     { type: "spring" as const, stiffness: 420, damping: 28 },
  arrow:   { type: "spring" as const, stiffness: 500, damping: 22 },
};

/** Radius M3: 16px uniformi su ogni item */
const ITEM_RADIUS = 16;
/** Gap M3 uniforme tra gli slot */
const ITEM_GAP = 8;
/** Peek raw flex-basis */
const PEEK_BASIS = "20%";
/** Px che il peek si estende oltre il bordo del container */
const PEEK_EXTEND = 20;

const CAROUSEL_ITEMS = [
  { id: "napoletana", title: "Napoletana STG", sub: "Forno legna · 450°C · 60-90s", img: "https://images.unsplash.com/photo-1765652584214-ab9167622c8d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxuZWFwb2xpdGFuJTIwcGl6emElMjB3b29kJTIwb3ZlbnxlbnwxfHx8fDE3NzEyMjg4NDF8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=vulcan&utm_medium=referral" },
  { id: "teglia", title: "Teglia Romana", sub: "Elettrico · 280°C · 15-20min", img: "https://images.unsplash.com/photo-1695324318807-a234819bad21?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyb21hbiUyMHBpenphJTIwYWwlMjB0YWdsaW98ZW58MXx8fHwxNzcxMjI4ODQyfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=vulcan&utm_medium=referral" },
  { id: "chicago", title: "Chicago Deep Dish", sub: "Elettrico · 220°C · 25-35min", img: "https://images.unsplash.com/photo-1765933613028-63223082b4ff?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkZWVwJTIwZGlzaCUyMHBpenphJTIwY2hlZXNlfGVufDF8fHx8MTc3MTIyODg0Nnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=vulcan&utm_medium=referral" },
  { id: "margherita", title: "Margherita Classica", sub: "Universale · 250-500°C · variabile", img: "https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwaXp6YSUyMG1hcmdoZXJpdGElMjBiYXNpbCUyMG1venphcmVsbGF8ZW58MXx8fHwxNzcxMjI4ODQ5fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=vulcan&utm_medium=referral" },
  { id: "fermentazione", title: "Lunga Maturazione", sub: "48-72h frigo · alveolatura aperta", img: "https://images.unsplash.com/photo-1738717201678-412395e65b36?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwaXp6YSUyMGRvdWdoJTIwcHJvb2ZpbmclMjBmZXJtZW50YXRpb258ZW58MXx8fHwxNzcxMjI4ODQzfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=vulcan&utm_medium=referral" },
  { id: "sourdough", title: "Sourdough Crumb", sub: "Lievito madre · 72h · alveolatura", img: "https://images.unsplash.com/photo-1763297014734-e2ac58a6f3c0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhcnRpc2FuJTIwc291cmRvdWdoJTIwYnJlYWQlMjBjbG9zZXVwfGVufDF8fHx8MTc3MTIzMzY2Mnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=vulcan&utm_medium=referral" },
  { id: "focaccia", title: "Focaccia Ligure", sub: "Olio EVO · 220°C · 20min", img: "https://images.unsplash.com/photo-1706145787429-4d6b00a5dc0c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpdGFsaWFuJTIwZm9jYWNjaWElMjByb3NlbWFyeSUyMG9saXZlJTIwb2lsfGVufDF8fHx8MTc3MTIzMzY2M3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=vulcan&utm_medium=referral" },
  { id: "forno", title: "Forno a Legna", sub: "Temperatura · 450-500°C", img: "https://images.unsplash.com/photo-1706011465964-7a226eea129a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b29kJTIwZmlyZWQlMjBwaXp6YSUyMG92ZW4lMjBmbGFtZXN8ZW58MXx8fHwxNzcxMTk1OTgwfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=vulcan&utm_medium=referral" },
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
      className="w-9 h-9 rounded-full flex items-center justify-center active:scale-82 transition-transform"
      style={{
        background: "color-mix(in srgb, var(--container-page) 88%, transparent)",
        backdropFilter: "blur(12px) saturate(1.4)",
        border: "1px solid var(--outline-variant)",
        cursor: disabled ? "default" : "pointer",
        outline: "none",
      }}
      animate={{ opacity: disabled ? 0.3 : 1 }}
      aria-label={direction === "left" ? "Slide precedente" : "Slide successiva"}
    >
      <Icon size={18} style={{ color: "var(--icon-default)" }} />
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
        title="Carousel"
        description="M3 Expressive Carousel con 6 varianti: Center-aligned Hero (3-slot), Hero (1 Large + 1 Small), Multi-browse (Medium items uguali), Uncontained (Large items stessa dimensione), Uncontained Multi-aspect Ratio e Full-screen. Principio uncontained: container senza borderRadius, item con radius proporzionale (L:20px, M:16px, S:12px), clip naturale ai bordi."
      />

      <SubSectionLabel label="Panoramica" />
      <Panoramica
        descrizione="M3 Expressive Carousel con 6 varianti. Il principio 'uncontained': container senza borderRadius, item con radius proporzionale alla size, clip naturale ai bordi. Spring physics su tutte le transizioni (slide, dots, arrows)."
        principi={[
          "6 varianti: Center-aligned Hero, Hero, Multi-browse, Uncontained, Multi-AR, Full-screen",
          "Principio uncontained: container overflow:hidden, item con borderRadius, clip ai bordi",
          "Spring physics differenziate: flex (260/26), overlay (300/24), dots (420/28), arrows (500/22)",
        ]}
      />

      <SubSectionLabel label="Specifiche" />

      {/* ── 1. M3 Center-aligned Hero — 3-slot ── */}
      <div className="surface-card p-5">
        <span className="type-label" style={{ color: "var(--text-default)", fontSize: "var(--font-size-base)" }}>
          M3 Center-aligned Hero — 3-slot layout
        </span>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "var(--font-size-md)", color: "var(--muted-foreground)", lineHeight: "var(--leading-relaxed)", marginTop: "8px" }}>
          3 slot fissi: peek-sx (<span style={{ fontFamily: "'DM Mono', monospace", fontSize: "var(--font-size-base)", color: "var(--primary)" }}>flex: 0 0 {PEEK_BASIS}</span>), hero (<span style={{ fontFamily: "'DM Mono', monospace", fontSize: "var(--font-size-base)", color: "var(--primary)" }}>flex: 1</span>), peek-dx (<span style={{ fontFamily: "'DM Mono', monospace", fontSize: "var(--font-size-base)", color: "var(--primary)" }}>flex: 0 0 {PEEK_BASIS}</span>). Gap uniforme <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "var(--font-size-base)", color: "var(--primary)" }}>{ITEM_GAP}px</span>. Peek extend <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "var(--font-size-base)", color: "var(--primary)" }}>{PEEK_EXTEND}px</span> oltre il container.
        </p>

        <div className="mt-5 relative">
          <div
            className="flex overflow-hidden"
            style={{ height: 280, gap: ITEM_GAP }}
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
            role="region"
            aria-roledescription="carousel"
            aria-label="Stili pizza"
          >
            {/* ── Peek sinistro ── */}
            <div
              className="relative overflow-hidden cursor-pointer flex-shrink-0"
              style={{
                flexBasis: PEEK_BASIS,
                borderRadius: ITEM_RADIUS,
                marginLeft: -PEEK_EXTEND,
              }}
              onClick={prev}
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
                    className="w-full h-full"
                    style={{ objectFit: "cover", display: "block" }}
                  />
                </motion.div>
              </AnimatePresence>
            </div>

            {/* ── Hero centrale ─ */}
            <div
              className="relative overflow-hidden flex-1 min-w-0"
              style={{ borderRadius: ITEM_RADIUS }}
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
                    className="w-full h-full"
                    style={{ objectFit: "cover", display: "block" }}
                  />
                  {/* Gradient scrim */}
                  <div
                    className="absolute bottom-0 left-0 right-0"
                    style={{
                      height: "55%",
                      background: "var(--card-scrim-heavy)",
                      pointerEvents: "none",
                    }}
                  />
                  {/* Label */}
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <span
                      style={{
                        fontFamily: "'Playfair Display', serif",
                        fontSize: "var(--font-size-4xl)",
                        fontWeight: "var(--weight-bold)" as any,
                        color: "var(--overlay-text)",
                        display: "block",
                        lineHeight: "var(--leading-display)",
                      }}
                    >
                      {heroItem.title}
                    </span>
                    <span
                      style={{
                        fontFamily: "'DM Mono', monospace",
                        fontSize: "var(--font-size-base)",
                        color: "var(--overlay-text)",
                        opacity: 0.75,
                        letterSpacing: "var(--tracking-spread)",
                        fontFeatureSettings: "'tnum'",
                        display: "block",
                        marginTop: "var(--space-0-5)",
                      }}
                    >
                      {heroItem.sub}
                    </span>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* ── Peek destro ── */}
            <div
              className="relative overflow-hidden cursor-pointer flex-shrink-0"
              style={{
                flexBasis: PEEK_BASIS,
                borderRadius: ITEM_RADIUS,
                marginRight: -PEEK_EXTEND,
              }}
              onClick={next}
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
                    className="w-full h-full"
                    style={{ objectFit: "cover", display: "block" }}
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
                className="relative rounded-full overflow-hidden active:scale-80 transition-transform"
                style={{ border: "none", cursor: "pointer", outline: "none", padding: 0, background: "rgba(0,0,0,0)" }}
                animate={{ width: isActive ? 24 : 8, height: 8 }}
                transition={SP.dot}
                aria-label={`Vai a ${item.title}`}
              >
                <div className="absolute inset-0 rounded-full" style={{ background: "var(--outline-variant)" }} />
                {isActive && (
                  <motion.div
                    layoutId="m3-carousel-dot"
                    className="absolute inset-0 rounded-full"
                    style={{ background: "var(--primary)" }}
                    transition={SP.dot}
                  />
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* ── 2. Slot proportions diagram ── */}
      <div className="surface-card p-5">
        <span className="type-label" style={{ color: "var(--text-default)", fontSize: "var(--font-size-base)" }}>
          Proporzioni slot — M3 Center-aligned Hero
        </span>
        <div className="mt-4 flex items-end gap-2" style={{ height: 120 }}>
          {[
            { label: "Clip", pct: `${PEEK_EXTEND}px`, flex: 0.5, dist: 2, maxFlex: 5.5 },
            { label: "Peek", pct: PEEK_BASIS, flex: 2, dist: 1, maxFlex: 5.5 },
            { label: "Hero", pct: "flex:1", flex: 5.5, dist: 0, maxFlex: 5.5 },
            { label: "Peek", pct: PEEK_BASIS, flex: 2, dist: 1, maxFlex: 5.5 },
            { label: "Clip", pct: `${PEEK_EXTEND}px`, flex: 0.5, dist: 2, maxFlex: 5.5 },
          ].map((bar, i) => (
            <motion.div
              key={i}
              className="rounded-xl flex flex-col justify-end items-center overflow-hidden"
              style={{
                flex: Math.max(bar.flex, 0.15),
                height: `${10 + (bar.flex / bar.maxFlex) * 85}%`,
                minHeight: 32,
                background: bar.dist === 0 ? "var(--primary)" : bar.dist === 1 ? "color-mix(in srgb, var(--primary) 50%, var(--surface-container))" : "var(--surface-container-high)",
                border: "1px solid var(--outline-variant)",
                padding: "4px",
                opacity: bar.dist >= 2 ? 0.4 : 1,
              }}
              initial={{ flex: 0 }}
              animate={{ flex: Math.max(bar.flex, 0.15) }}
              transition={SP.flex}
            >
              <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "var(--font-size-sm)", color: bar.dist === 0 ? "var(--primary-foreground)" : "var(--text-default)", fontWeight: "var(--weight-semibold)" as any, fontFeatureSettings: "'tnum'", textAlign: "center" }}>
                {bar.label}
              </span>
              <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "var(--font-size-xs)", color: bar.dist === 0 ? "var(--primary-foreground)" : "var(--muted-foreground)", textAlign: "center", opacity: 0.8 }}>
                {bar.pct}
              </span>
            </motion.div>
          ))}
        </div>
        <div className="flex justify-center mt-2">
          <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "var(--font-size-base)", color: "var(--muted-foreground)" }}>
            <span style={{ fontStyle: "italic" }}>clip {PEEK_EXTEND}px</span> — peek {PEEK_BASIS} — <span style={{ fontWeight: "var(--weight-semibold)" as any, color: "var(--primary)" }}>hero flex:1</span> — peek {PEEK_BASIS} — <span style={{ fontStyle: "italic" }}>clip {PEEK_EXTEND}px</span>
          </span>
        </div>
      </div>

      {/* ── 3. Spring parameters ── */}
      <div className="surface-card p-5">
        <span className="type-label" style={{ color: "var(--text-default)", fontSize: "var(--font-size-base)" }}>Parametri Spring M3</span>
        <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { name: "Slide", s: 260, d: 26, m: "0.8", target: "Crossfade contenuto, x, scale" },
            { name: "Overlay", s: 300, d: 24, m: "1", target: "y, opacity label hero" },
            { name: "Dots", s: 420, d: 28, m: "1", target: "width pill, layoutId morph" },
            { name: "Frecce", s: 500, d: 22, m: "1", target: "whileTap, whileHover" },
          ].map((sp) => (
            <div key={sp.name} className="p-3 rounded-lg" style={{ background: "var(--surface-container)" }}>
              <div className="type-data" style={{ color: "var(--primary)", fontWeight: "var(--weight-semibold)" as any }}>{sp.name}</div>
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "var(--font-size-base)", color: "var(--text-default)", marginTop: "4px", fontFeatureSettings: "'tnum'" }}>
                s:{sp.s} d:{sp.d} m:{sp.m}
              </div>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "var(--font-size-base)", color: "var(--muted-foreground)", marginTop: "4px", lineHeight: "var(--leading-body)" }}>
                {sp.target}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── 4. Anatomy ── */}
      <div className="surface-card p-5">
        <span className="type-label" style={{ color: "var(--text-default)", fontSize: "var(--font-size-base)" }}>Anatomia</span>
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <AnatomyRow prop="3-slot layout" val="Peek-sx (flex:0 0 20%), Hero (flex:1, ~56%), Peek-dx (flex:0 0 20%). Slot fissi, contenuto crossfade con AnimatePresence." />
          <AnatomyRow prop="Uncontained clip" val="Peek-sx: marginLeft -20px. Peek-dx: marginRight -20px. Container overflow:hidden taglia il bordo esterno → piatto M3." />
          <AnatomyRow prop="Gap uniforme" val="gap: 8px tra tutti gli slot. Nessun margine variabile — anatomia M3 pulita senza sovrapposizioni." />
          <AnatomyRow prop="Item borderRadius" val="Tutti gli slot: borderRadius 16px. Il clip piatto avviene solo al bordo container, mai tra item adiacenti." />
          <AnatomyRow prop="Spring slide" val="AnimatePresence mode=popLayout + variants direzionali (x ±60px, scale 0.97). Spring s:260 d:26 m:0.8." />
          <AnatomyRow prop="Scrim + Label" val="Solo sull'hero: scrim gradient 55% + titolo Playfair + sub DM Mono. Peek: solo immagine." />
          <AnatomyRow prop="Gesture" val="Touch swipe threshold 40px. Click peek-sx → prev, peek-dx → next. Loop circolare (mod N)." />
          <AnatomyRow prop="A11y" val="Container role='region' aria-roledescription='carousel'. Key stabile (item.id + slot suffix)." />
        </div>
      </div>

      {/* ── 5. Varianti M3 Expressive ── */}
      <div className="surface-card p-5">
        <span className="type-label" style={{ color: "var(--text-default)", fontSize: "var(--font-size-base)" }}>Varianti M3 Expressive</span>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "var(--font-size-md)", color: "var(--muted-foreground)", lineHeight: "var(--leading-body)", marginTop: "8px" }}>
          Le 6 varianti del Carousel M3 Expressive.
        </p>
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <AnatomyRow prop="Hero" val="1 Large (70%) + 1 Small (28%). Small clippato al bordo dx. AnimatePresence crossfade. Click peek → next." />
          <AnatomyRow prop="Multi-browse" val="~3 Medium items uguali. Edge clip sull'ultimo. translateX spring. Label sempre visibili." />
          <AnatomyRow prop="Uncontained" val="Tutti Large items, stessa dimensione (42%). Scroll orizzontale, clip ai bordi. Radius 20px." />
          <AnatomyRow prop="Uncontained Multi-AR" val="Item con aspect ratio diversi (0.7→1.6). Larghezze proporzionali. Radius 16px. Mixed portrait/landscape." />
          <AnatomyRow prop="Full-screen" val="100% width, spring crossfade + scale cinematico. Counter overlay 01/08. Nessun peek." />
          <AnatomyRow prop="Center-aligned Hero" val="Il layout sopra: peek-sx (S) + hero (L) + peek-dx (S). 3 slot fissi, spring direzionale." />
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

      <SubSectionLabel label="Linee guida" />
      <LineeGuida
        fai={[
          "Center-aligned Hero per hero content con anteprima laterale (stili pizza)",
          "Multi-browse per collezioni omogenee (ingredienti, varianti)",
          "Full-screen per contenuto cinematico immersivo (foto ricetta)",
        ]}
        nonFare={[
          "Mai più di 8-10 item — l'utente perde il senso della quantità",
          "Mai carousel per contenuto critico — non tutti scorrono",
          "Mai autoplay senza controllo pause — distrae e causa problemi a11y",
        ]}
      />

      <SubSectionLabel label="Accessibilità" />
      <AccessibilitaInfo items={[
        { label: "ARIA", desc: "role='region' + aria-roledescription='carousel'. aria-label descrittivo." },
        { label: "Tastiera", desc: "Arrow keys per navigare. Dots focusabili. Enter/Space per attivare." },
        { label: "Reduced motion", desc: "Spring diventa instant (stiffness:9999). Nessun crossfade, cambio diretto." },
      ]} />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   ENTRIES REGISTRY
   ══════════════════════════════════════════════════════════ */
export const ENTRIES: SectionEntry[] = [
  { id: "loading", label: "Loading Indicator", group: "c", Component: LoadingIndicatorSpec },
  { id: "carousel", label: "Carousel", group: "c", Component: CarouselSpec },
];
