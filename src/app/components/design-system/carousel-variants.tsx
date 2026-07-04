import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { AnatomyRow } from "./shared";
import { ImageWithFallback } from "../media/ImageWithFallback";

/* ═══════════════════════════════════════════════════════════
   M3 EXPRESSIVE — CAROUSEL VARIANTS
   Hero, Multi-browse, Uncontained, Uncontained Multi-aspect,
   Full-screen.  Ogni variante e una demo interattiva con card
   descrittiva + anatomy.  Nessun registry proprio: le demo
   vengono importate da components-h.tsx (CarouselSpec, C22).
   ═══════════════════════════════════════════════════════════ */

/* ── Shared springs (tutte spring, zero duration/ease) ── */
const SP = {
  slide: { type: "spring" as const, stiffness: 280, damping: 28, mass: 0.8 },
  fade:  { type: "spring" as const, stiffness: 300, damping: 26 },
  dot:   { type: "spring" as const, stiffness: 420, damping: 28 },
  arrow: { type: "spring" as const, stiffness: 500, damping: 22 },
};

/* ── M3 Expressive item radii ── */
const R_LARGE  = 20;
const R_MEDIUM = 16;
const R_SMALL  = 12;

/* ── Data ── */
const ITEMS = [
  { id: "napoletana", title: "Napoletana STG", sub: "Forno legna · 450°C", img: "https://images.unsplash.com/photo-1765652584214-ab9167622c8d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxuZWFwb2xpdGFuJTIwcGl6emElMjB3b29kJTIwb3ZlbnxlbnwxfHx8fDE3NzEyMjg4NDF8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=vulcan&utm_medium=referral" },
  { id: "teglia", title: "Teglia Romana", sub: "Elettrico · 280°C", img: "https://images.unsplash.com/photo-1695324318807-a234819bad21?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyb21hbiUyMHBpenphJTIwYWwlMjB0YWdsaW98ZW58MXx8fHwxNzcxMjI4ODQyfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=vulcan&utm_medium=referral" },
  { id: "chicago", title: "Chicago Deep Dish", sub: "Elettrico · 220°C", img: "https://images.unsplash.com/photo-1765933613028-63223082b4ff?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkZWVwJTIwZGlzaCUyMHBpenphJTIwY2hlZXNlfGVufDF8fHx8MTc3MTIyODg0Nnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=vulcan&utm_medium=referral" },
  { id: "margherita", title: "Margherita", sub: "Universale · 250-500°C", img: "https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwaXp6YSUyMG1hcmdoZXJpdGElMjBiYXNpbCUyMG1venphcmVsbGF8ZW58MXx8fHwxNzcxMjI4ODQ5fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=vulcan&utm_medium=referral" },
  { id: "fermentazione", title: "Lunga Maturazione", sub: "48-72h frigo", img: "https://images.unsplash.com/photo-1738717201678-412395e65b36?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwaXp6YSUyMGRvdWdoJTIwcHJvb2ZpbmclMjBmZXJtZW50YXRpb258ZW58MXx8fHwxNzcxMjI4ODQzfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=vulcan&utm_medium=referral" },
  { id: "sourdough", title: "Sourdough Crumb", sub: "Lievito madre · 72h", img: "https://images.unsplash.com/photo-1763297014734-e2ac58a6f3c0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhcnRpc2FuJTIwc291cmRvdWdoJTIwYnJlYWQlMjBjbG9zZXVwfGVufDF8fHx8MTc3MTIzMzY2Mnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=vulcan&utm_medium=referral" },
  { id: "focaccia", title: "Focaccia Ligure", sub: "Olio EVO · 220°C", img: "https://images.unsplash.com/photo-1706145787429-4d6b00a5dc0c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpdGFsaWFuJTIwZm9jYWNjaWElMjByb3NlbWFyeSUyMG9saXZlJTIwb2lsfGVufDF8fHx8MTc3MTIzMzY2M3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=vulcan&utm_medium=referral" },
  { id: "forno", title: "Forno a Legna", sub: "450-500°C", img: "https://images.unsplash.com/photo-1706011465964-7a226eea129a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b29kJTIwZmlyZWQlMjBwaXp6YSUyMG92ZW4lMjBmbGFtZXN8ZW58MXx8fHwxNzcxMTk1OTgwfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=vulcan&utm_medium=referral" },
];

/** Uncontained multi-aspect items */
const MULTI_ASPECT_ITEMS = [
  { id: "ma-1", title: "Impasto",    aspect: 0.7,  img: "https://images.unsplash.com/photo-1738717201744-9faf699eea3d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwaXp6YSUyMGRvdWdoJTIwc3RyZXRjaGluZyUyMGhhbmRzfGVufDF8fHx8MTc3MTIzMzY2NHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=vulcan&utm_medium=referral" },
  { id: "ma-2", title: "Napoletana", aspect: 1.4,  img: ITEMS[0].img },
  { id: "ma-3", title: "Forno",      aspect: 1.0,  img: ITEMS[7].img },
  { id: "ma-4", title: "Focaccia",   aspect: 1.6,  img: ITEMS[6].img },
  { id: "ma-5", title: "Crumb",      aspect: 0.85, img: ITEMS[5].img },
  { id: "ma-6", title: "Deep Dish",  aspect: 1.2,  img: ITEMS[2].img },
];

/* ── Shared helpers ── */
function useSwipe(onLeft: () => void, onRight: () => void) {
  const x = useRef(0);
  return {
    onTouchStart: (e: React.TouchEvent) => { x.current = e.touches[0].clientX; },
    onTouchEnd: (e: React.TouchEvent) => {
      const dx = e.changedTouches[0].clientX - x.current;
      if (Math.abs(dx) > 40) dx > 0 ? onRight() : onLeft();
    },
  };
}

function Arrow({ dir, onClick }: { dir: "left" | "right"; onClick: () => void }) {
  const I = dir === "left" ? ChevronLeft : ChevronRight;
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.08 }}
      transition={SP.arrow}
      className="w-9 h-9 rounded-full flex items-center justify-center active:scale-82 transition-transform"
      style={{
        background: "color-mix(in srgb, var(--container-page) 88%, transparent)",
        backdropFilter: "blur(12px) saturate(1.4)",
        border: "var(--border-width-thin) solid var(--outline-variant)",
        cursor: "pointer",
        outline: "none",
      }}
      aria-label={dir === "left" ? "Precedente" : "Successiva"}
    >
      <I size={18} style={{ color: "var(--text-default)" }} />
    </motion.button>
  );
}

function Dots({ count, active, onSelect, id }: { count: number; active: number; onSelect: (i: number) => void; id: string }) {
  return (
    <div className="flex items-center justify-center gap-2 mt-4">
      {Array.from({ length: count }, (_, i) => {
        const isActive = i === active;
        return (
          <motion.button
            key={i}
            onClick={() => onSelect(i)}
            className="relative rounded-full overflow-hidden active:scale-80 transition-transform"
            style={{ border: "none", cursor: "pointer", outline: "none", padding: 0, background: "transparent" }}
            animate={{ width: isActive ? 24 : 8, height: 8 }}
            transition={SP.dot}
            aria-label={`Slide ${i + 1}`}
          >
            <div className="absolute inset-0 rounded-full" style={{ background: "var(--outline-variant)" }} />
            {isActive && (
              <motion.div
                layoutId={`dot-${id}`}
                className="absolute inset-0 rounded-full"
                style={{ background: "var(--primary)" }}
                transition={SP.dot}
              />
            )}
          </motion.button>
        );
      })}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   1. HERO  (M3 Expressive)
   Un item Large (~70%) a sinistra + un item Small (~28%) a destra.
   L'item small e clippato al bordo del container (piatto a destra)
   simulando il pattern "uncontained".  Click sul peek → next.
   Compact: 1 large + 1 small.
   ═══════════════════════════════════════════════════════════ */

const HERO_LARGE_PCT = "70%";
const HERO_SMALL_PCT = "28%";
const HERO_CLIP = 16;

export function HeroDemo() {
  const N = ITEMS.length;
  const [focus, setFocus] = useState(0);
  const prev = () => setFocus((f) => (f - 1 + N) % N);
  const next = () => setFocus((f) => (f + 1) % N);
  const swipe = useSwipe(next, prev);

  const heroItem = ITEMS[focus];
  const peekItem = ITEMS[(focus + 1) % N];

  return (
    <div className="surface-card p-5">
      <span className="type-label" style={{ color: "var(--text-default)", fontSize: "var(--font-size-base)" }}>
        Hero — 1 Large + 1 Small
      </span>
      <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "var(--font-size-md)", color: "var(--muted-foreground)", lineHeight: "var(--leading-relaxed)", marginTop: "var(--space-2)" }}>
        M3 Hero layout: l'item in focus e un <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "var(--font-size-base)", color: "var(--primary)" }}>Large carousel item</span> ({HERO_LARGE_PCT}), l'item successivo e un <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "var(--font-size-base)", color: "var(--primary)" }}>Small carousel item</span> ({HERO_SMALL_PCT}) clippato al bordo destro del container. Gap <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "var(--font-size-base)", color: "var(--primary)" }}>8px</span>.  Click sul peek per avanzare.
      </p>

      <div className="mt-5 relative">
        <div
          className="flex overflow-hidden"
          style={{ height: 280, gap: 8 }}
          {...swipe}
          role="region"
          aria-roledescription="carousel"
          aria-label="Hero carousel"
        >
          {/* ── Large item (hero) ── */}
          <div
            className="relative overflow-hidden"
            style={{ flex: `0 0 ${HERO_LARGE_PCT}`, height: "100%", borderRadius: R_LARGE }}
          >
            <AnimatePresence>
              <motion.div
                key={heroItem.id + "-hero"}
                className="absolute inset-0"
                initial={{ opacity: 0, x: 50, scale: 0.97 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: -50, scale: 0.97 }}
                transition={SP.slide}
              >
                <ImageWithFallback
                  src={heroItem.img}
                  alt={heroItem.title}
                  className="absolute inset-0 w-full h-full"
                  style={{ objectFit: "cover", display: "block" }}
                />
                {/* Scrim gradient */}
                <div
                  className="absolute bottom-0 left-0 right-0"
                  style={{
                    height: "50%",
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

          {/* ── Small item (peek) — clipped at right edge ── */}
          <div
            className="relative overflow-hidden cursor-pointer"
            style={{
              flex: `0 0 ${HERO_SMALL_PCT}`,
              height: "100%",
              borderRadius: `${R_SMALL}px 0 0 ${R_SMALL}px`,
              marginRight: -HERO_CLIP,
            }}
            onClick={next}
          >
            <AnimatePresence>
              <motion.div
                key={peekItem.id + "-peek"}
                className="absolute inset-0"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={SP.slide}
              >
                <ImageWithFallback
                  src={peekItem.img}
                  alt={peekItem.title}
                  className="absolute inset-0 w-full h-full"
                  style={{ objectFit: "cover", display: "block" }}
                />
                {/* Sottile scrim per suggerire interattivita */}
                <div className="absolute inset-0" style={{ background: "var(--card-scrim-subtle)" }} />
                {/* Small label M3 */}
                <div
                  className="absolute bottom-0 left-0 right-0 p-3"
                  style={{ background: "var(--card-scrim)" }}
                >
                  <span
                    style={{
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: "var(--font-size-md)",
                      fontWeight: "var(--weight-semibold)" as any,
                      color: "var(--overlay-text)",
                      display: "block",
                    }}
                  >
                    {peekItem.title}
                  </span>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        <div className="absolute top-1/2 left-3 -translate-y-1/2 z-10">
          <Arrow dir="left" onClick={prev} />
        </div>
        <div className="absolute top-1/2 right-3 -translate-y-1/2 z-10">
          <Arrow dir="right" onClick={next} />
        </div>
      </div>

      <Dots count={N} active={focus} onSelect={setFocus} id="hero" />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   2. MULTI-BROWSE  (M3 Expressive)
   3-4 Medium carousel items di larghezza uguale.
   L'ultimo item e parzialmente clippato dal container,
   suggerendo contenuto successivo.  translateX-based scroll.
   ═══════════════════════════════════════════════════════════ */

const MB_VISIBLE = 3.3;
const MB_GAP = 8;

export function MultiBrowseDemo() {
  const [offset, setOffset] = useState(0);
  const maxOffset = ITEMS.length - Math.floor(MB_VISIBLE);
  const prev = () => setOffset((o) => Math.max(0, o - 1));
  const next = () => setOffset((o) => Math.min(maxOffset, o + 1));
  const swipe = useSwipe(next, prev);

  return (
    <div className="surface-card p-5">
      <span className="type-label" style={{ color: "var(--text-default)", fontSize: "var(--font-size-base)" }}>
        Multi-browse — Medium items, edge clip
      </span>
      <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "var(--font-size-md)", color: "var(--muted-foreground)", lineHeight: "var(--leading-relaxed)", marginTop: "var(--space-2)" }}>
        Tutti gli item sono <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "var(--font-size-base)", color: "var(--primary)" }}>Medium carousel item</span> con larghezza uguale (~{Math.round(100 / MB_VISIBLE)}%). L'ultimo a destra e clippato, suggerendo scroll. Radius <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "var(--font-size-base)", color: "var(--primary)" }}>{R_MEDIUM}px</span>. Gap <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "var(--font-size-base)", color: "var(--primary)" }}>{MB_GAP}px</span>.
      </p>

      <div className="mt-5 relative">
        <div
          className="overflow-hidden"
          style={{ borderRadius: 0 }}
          {...swipe}
          role="region"
          aria-roledescription="carousel"
          aria-label="Multi-browse"
        >
          <motion.div
            className="flex"
            style={{ gap: MB_GAP }}
            animate={{ x: -(offset * (100 / MB_VISIBLE + MB_GAP / MB_VISIBLE)) + "%" }}
            transition={SP.slide}
          >
            {ITEMS.map((item) => (
              <div
                key={item.id}
                className="relative overflow-hidden flex-shrink-0"
                style={{
                  width: `calc(${100 / MB_VISIBLE}% - ${MB_GAP * (MB_VISIBLE - 1) / MB_VISIBLE}px)`,
                  height: 200,
                  borderRadius: R_MEDIUM,
                }}
              >
                <ImageWithFallback
                  src={item.img}
                  alt={item.title}
                  className="absolute inset-0 w-full h-full"
                  style={{ objectFit: "cover", display: "block" }}
                />
                <div
                  className="absolute bottom-0 left-0 right-0 p-3"
                  style={{ background: "var(--card-scrim-heavy)" }}
                >
                  <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "var(--font-size-lg)", fontWeight: "var(--weight-semibold)" as any, color: "var(--overlay-text)", display: "block" }}>
                    {item.title}
                  </span>
                  <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "var(--font-size-base)", color: "var(--overlay-text)", opacity: 0.75, fontFeatureSettings: "'tnum'", letterSpacing: "var(--tracking-spread)" }}>
                    {item.sub}
                  </span>
                </div>
              </div>
            ))}
          </motion.div>
        </div>

        <div className="absolute top-1/2 left-2 -translate-y-1/2 z-10">
          <Arrow dir="left" onClick={prev} />
        </div>
        <div className="absolute top-1/2 right-2 -translate-y-1/2 z-10">
          <Arrow dir="right" onClick={next} />
        </div>
      </div>

      {/* Scroll position dots */}
      <div className="flex items-center justify-center gap-1.5 mt-3">
        {Array.from({ length: maxOffset + 1 }, (_, i) => (
          <motion.div
            key={i}
            className="rounded-full"
            animate={{
              width: i === offset ? 16 : 6,
              height: 6,
              background: i === offset ? "var(--primary)" : "var(--outline-variant)",
            }}
            transition={SP.dot}
            style={{ cursor: "pointer" }}
            onClick={() => setOffset(i)}
          />
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   3. UNCONTAINED  (M3 Expressive)
   Tutti gli item sono Large carousel items con la stessa
   larghezza.  Scorrono orizzontalmente; quelli ai bordi sono
   tagliati dal container (overflow:hidden, no container radius).
   Radius Large (20px) su ogni item.
   ═══════════════════════════════════════════════════════════ */

const UC_ITEM_WIDTH_PCT = 42;
const UC_GAP = 12;

export function UncontainedDemo() {
  const [offset, setOffset] = useState(0);
  const maxOffset = Math.max(0, ITEMS.length - 2);
  const prev = () => setOffset((o) => Math.max(0, o - 1));
  const next = () => setOffset((o) => Math.min(maxOffset, o + 1));
  const swipe = useSwipe(next, prev);

  return (
    <div className="surface-card p-5">
      <span className="type-label" style={{ color: "var(--text-default)", fontSize: "var(--font-size-base)" }}>
        Uncontained — Large items, stessa dimensione
      </span>
      <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "var(--font-size-md)", color: "var(--muted-foreground)", lineHeight: "var(--leading-relaxed)", marginTop: "var(--space-2)" }}>
        Ogni item e un <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "var(--font-size-base)", color: "var(--primary)" }}>Large carousel item</span> con larghezza uniforme ({UC_ITEM_WIDTH_PCT}%). Il container non ha radius — gli item ai bordi vengono tagliati dal clip, creando il pattern M3 "uncontained". Radius item <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "var(--font-size-base)", color: "var(--primary)" }}>{R_LARGE}px</span>. Gap <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "var(--font-size-base)", color: "var(--primary)" }}>{UC_GAP}px</span>.
      </p>

      <div className="mt-5 relative">
        <div
          className="overflow-hidden"
          style={{ borderRadius: 0, height: 260 }}
          {...swipe}
          role="region"
          aria-roledescription="carousel"
          aria-label="Uncontained carousel"
        >
          <motion.div
            className="flex h-full"
            style={{ gap: UC_GAP }}
            animate={{ x: `${-offset * (UC_ITEM_WIDTH_PCT + (UC_GAP * 100 / 600))}%` }}
            transition={SP.slide}
          >
            {ITEMS.map((item) => (
              <div
                key={item.id}
                className="relative overflow-hidden flex-shrink-0"
                style={{
                  width: `${UC_ITEM_WIDTH_PCT}%`,
                  height: "100%",
                  borderRadius: R_LARGE,
                }}
              >
                <ImageWithFallback
                  src={item.img}
                  alt={item.title}
                  className="absolute inset-0 w-full h-full"
                  style={{ objectFit: "cover", display: "block" }}
                />
                {/* Scrim + label M3 */}
                <div
                  className="absolute bottom-0 left-0 right-0 p-4"
                  style={{ background: "var(--card-scrim-heavy)" }}
                >
                  <span
                    style={{
                      fontFamily: "'Playfair Display', serif",
                      fontSize: "var(--font-size-2xl)",
                      fontWeight: "var(--weight-bold)" as any,
                      color: "var(--overlay-text)",
                      display: "block",
                      lineHeight: "var(--leading-display)",
                    }}
                  >
                    {item.title}
                  </span>
                  <span
                    style={{
                      fontFamily: "'DM Mono', monospace",
                      fontSize: "var(--font-size-base)",
                      color: "var(--overlay-text)",
                      opacity: 0.7,
                      fontFeatureSettings: "'tnum'",
                      letterSpacing: "var(--tracking-spread)",
                      display: "block",
                      marginTop: "var(--space-0-5)",
                    }}
                  >
                    {item.sub}
                  </span>
                </div>
              </div>
            ))}
          </motion.div>
        </div>

        <div className="absolute top-1/2 left-2 -translate-y-1/2 z-10">
          <Arrow dir="left" onClick={prev} />
        </div>
        <div className="absolute top-1/2 right-2 -translate-y-1/2 z-10">
          <Arrow dir="right" onClick={next} />
        </div>
      </div>

      {/* Scroll position */}
      <div className="flex items-center justify-center gap-1.5 mt-3">
        {Array.from({ length: maxOffset + 1 }, (_, i) => (
          <motion.div
            key={i}
            className="rounded-full"
            animate={{
              width: i === offset ? 16 : 6,
              height: 6,
              background: i === offset ? "var(--primary)" : "var(--outline-variant)",
            }}
            transition={SP.dot}
            style={{ cursor: "pointer" }}
            onClick={() => setOffset(i)}
          />
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   4. UNCONTAINED — Multi-aspect Ratio  (M3 Expressive)
   Item con aspect ratio diversi (9:16 portrait → 16:9 landscape).
   La larghezza di ogni item e proporzionale al suo aspect ratio.
   Stessa altezza, widths variabili.  Items ai bordi clippati.
   ═══════════════════════════════════════════════════════════ */

const MA_HEIGHT = 240;

export function UncontainedMultiAspectDemo() {
  const [offset, setOffset] = useState(0);
  const maxOffset = Math.max(0, MULTI_ASPECT_ITEMS.length - 3);
  const prev = () => setOffset((o) => Math.max(0, o - 1));
  const next = () => setOffset((o) => Math.min(maxOffset, o + 1));
  const swipe = useSwipe(next, prev);

  const totalAspect = MULTI_ASPECT_ITEMS.reduce((sum, it) => sum + it.aspect, 0);

  return (
    <div className="surface-card p-5">
      <span className="type-label" style={{ color: "var(--text-default)", fontSize: "var(--font-size-base)" }}>
        Uncontained Multi-aspect Ratio — 9:16 → 16:9
      </span>
      <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "var(--font-size-md)", color: "var(--muted-foreground)", lineHeight: "var(--leading-relaxed)", marginTop: "var(--space-2)" }}>
        Ogni item ha un aspect ratio diverso (da <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "var(--font-size-base)", color: "var(--primary)" }}>0.7</span> portrait a <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "var(--font-size-base)", color: "var(--primary)" }}>1.6</span> landscape). La larghezza e proporzionale: <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "var(--font-size-base)", color: "var(--primary)" }}>w = aspect / Σaspect × 100%</span>. Container senza radius, item radius <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "var(--font-size-base)", color: "var(--primary)" }}>{R_MEDIUM}px</span>.
      </p>

      <div className="mt-5 relative">
        <div
          className="overflow-hidden"
          style={{ borderRadius: 0, height: MA_HEIGHT }}
          {...swipe}
          role="region"
          aria-roledescription="carousel"
          aria-label="Multi-aspect carousel"
        >
          <motion.div
            className="flex h-full"
            style={{ gap: 8 }}
            animate={{ x: `${-offset * 28}%` }}
            transition={SP.slide}
          >
            {MULTI_ASPECT_ITEMS.map((item) => {
              const w = (item.aspect / totalAspect) * 100;
              return (
                <div
                  key={item.id}
                  className="relative overflow-hidden flex-shrink-0"
                  style={{
                    width: `${Math.max(w * 2.2, 18)}%`,
                    height: "100%",
                    borderRadius: R_MEDIUM,
                  }}
                >
                  <ImageWithFallback
                    src={item.img}
                    alt={item.title}
                    className="absolute inset-0 w-full h-full"
                    style={{ objectFit: "cover", display: "block" }}
                  />
                  <div
                    className="absolute bottom-0 left-0 right-0 p-2.5"
                    style={{ background: "var(--card-scrim)" }}
                  >
                    <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "var(--font-size-md)", fontWeight: "var(--weight-semibold)" as any, color: "var(--overlay-text)" }}>
                      {item.title}
                    </span>
                  </div>
                </div>
              );
            })}
          </motion.div>
        </div>

        <div className="absolute top-1/2 left-2 -translate-y-1/2 z-10">
          <Arrow dir="left" onClick={prev} />
        </div>
        <div className="absolute top-1/2 right-2 -translate-y-1/2 z-10">
          <Arrow dir="right" onClick={next} />
        </div>
      </div>

      {/* Aspect legend */}
      <div className="flex flex-wrap gap-2 mt-3 justify-center">
        {MULTI_ASPECT_ITEMS.map((item) => (
          <span
            key={item.id}
            className="px-2 py-1 rounded-lg"
            style={{
              background: "var(--surface-container)",
              fontFamily: "'DM Mono', monospace",
              fontSize: "var(--font-size-sm)",
              color: "var(--muted-foreground)",
              fontFeatureSettings: "'tnum'",
            }}
          >
            {item.title}: {item.aspect.toFixed(1)}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   5. FULL-SCREEN  (M3 Expressive)
   Un item occupa il 100% del container.  Nessun peek, nessun
   bordo arrotondato sul container.  Transizione crossfade +
   scale spring per profondita cinematica.
   ═══════════════════════════════════════════════════════════ */

export function FullScreenDemo() {
  const N = ITEMS.length;
  const [focus, setFocus] = useState(0);
  const prev = () => setFocus((f) => (f - 1 + N) % N);
  const next = () => setFocus((f) => (f + 1) % N);
  const swipe = useSwipe(next, prev);

  return (
    <div className="surface-card p-5">
      <span className="type-label" style={{ color: "var(--text-default)", fontSize: "var(--font-size-base)" }}>
        Full-screen — un item alla volta
      </span>
      <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "var(--font-size-md)", color: "var(--muted-foreground)", lineHeight: "var(--leading-relaxed)", marginTop: "var(--space-2)" }}>
        L'item in focus occupa il <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "var(--font-size-base)", color: "var(--primary)" }}>100%</span> del container. Nessun peek, nessun radius sul container. Transizione <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "var(--font-size-base)", color: "var(--primary)" }}>crossfade + scale</span> spring per profondita cinematica. Counter overlay <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "var(--font-size-base)", color: "var(--primary)" }}>01 / 08</span>.
      </p>

      <div className="mt-5 relative">
        <div
          className="relative overflow-hidden"
          style={{ height: 320, borderRadius: 0 }}
          {...swipe}
          role="region"
          aria-roledescription="carousel"
          aria-label="Full-screen carousel"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={ITEMS[focus].id}
              className="absolute inset-0"
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={SP.fade}
            >
              <ImageWithFallback
                src={ITEMS[focus].img}
                alt={ITEMS[focus].title}
                className="absolute inset-0 w-full h-full"
                style={{ objectFit: "cover", display: "block" }}
              />
              {/* Scrim */}
              <div
                className="absolute bottom-0 left-0 right-0"
                style={{ height: "45%", background: "var(--card-scrim-heavy)", pointerEvents: "none" }}
              />
              {/* Label */}
              <div className="absolute bottom-0 left-0 right-0 p-5">
                <span style={{ fontFamily: "'Playfair Display', serif", fontSize: "var(--font-size-6xl)", fontWeight: "var(--weight-bold)" as any, color: "var(--overlay-text)", display: "block", lineHeight: "var(--leading-heading)" }}>
                  {ITEMS[focus].title}
                </span>
                <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "var(--font-size-md)", color: "var(--overlay-text)", opacity: 0.7, letterSpacing: "var(--tracking-spread)", fontFeatureSettings: "'tnum'", display: "block", marginTop: "var(--space-1)" }}>
                  {ITEMS[focus].sub}
                </span>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Counter overlay */}
          <div className="absolute top-3 right-3 z-10 px-2.5 py-1 rounded-lg" style={{ background: "var(--overlay-backdrop)", backdropFilter: "blur(8px)" }}>
            <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "var(--font-size-base)", color: "var(--overlay-text)", fontFeatureSettings: "'tnum'", letterSpacing: "var(--tracking-label)" }}>
              {String(focus + 1).padStart(2, "0")} / {String(N).padStart(2, "0")}
            </span>
          </div>

          <div className="absolute top-1/2 left-3 -translate-y-1/2 z-10">
            <Arrow dir="left" onClick={prev} />
          </div>
          <div className="absolute top-1/2 right-3 -translate-y-1/2 z-10">
            <Arrow dir="right" onClick={next} />
          </div>
        </div>
      </div>

      <Dots count={N} active={focus} onSelect={setFocus} id="fullscreen" />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   6. VARIANT COMPARISON TABLE  (M3 Expressive)
   ═══════════════════════════════════════════════════════════ */

export function VariantComparisonCard() {
  const rows = [
    { name: "Center-aligned Hero", vis: "1 + 2 peek", hero: "~56%", peek: "~20%", itemSize: "L + S + S", ir: "16px", nav: "flex crossfade" },
    { name: "Hero",                vis: "1 + 1 peek", hero: "70%",  peek: "28%",  itemSize: "L + S",     ir: "20 / 12", nav: "AnimatePresence" },
    { name: "Multi-browse",        vis: "3.3",        hero: "—",    peek: "clip",  itemSize: "M × N",     ir: "16px", nav: "translateX" },
    { name: "Uncontained",         vis: "~2.3",       hero: "—",    peek: "clip",  itemSize: "L × N",     ir: "20px", nav: "translateX" },
    { name: "Uncontained Multi-AR",vis: "2-3",        hero: "—",    peek: "clip",  itemSize: "Mixed",     ir: "16px", nav: "translateX" },
    { name: "Full-screen",         vis: "1",          hero: "100%", peek: "0",     itemSize: "L × 1",     ir: "0",    nav: "crossfade + scale" },
  ];

  const headers = ["Variante", "Items vis.", "Hero %", "Peek", "Item size", "Item radius", "Navigazione"];

  return (
    <div className="surface-card p-5">
      <span className="type-label" style={{ color: "var(--text-default)", fontSize: "var(--font-size-base)" }}>
        Confronto varianti — M3 Expressive Carousel
      </span>

      <div className="mt-4 overflow-x-auto">
        <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "'DM Sans', sans-serif", fontSize: "var(--font-size-md)", color: "var(--text-default)" }}>
          <thead>
            <tr style={{ borderBottom: "var(--border-width-thin) solid var(--outline-variant)" }}>
              {headers.map((h) => (
                <th key={h} style={{ padding: "var(--space-2) var(--space-1-5)", textAlign: "left", fontFamily: "'DM Mono', monospace", fontSize: "var(--font-size-sm)", fontWeight: "var(--weight-semibold)" as any, color: "var(--muted-foreground)", letterSpacing: "var(--tracking-label)", textTransform: "uppercase" }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.name} style={{ borderBottom: "var(--border-width-thin) solid var(--outline-variant)" }}>
                <td style={{ padding: "var(--space-2) var(--space-1-5)", fontWeight: "var(--weight-semibold)" as any, color: "var(--primary)" }}>{row.name}</td>
                <td style={{ padding: "var(--space-2) var(--space-1-5)", fontFamily: "'DM Mono', monospace", fontSize: "var(--font-size-base)", fontFeatureSettings: "'tnum'" }}>{row.vis}</td>
                <td style={{ padding: "var(--space-2) var(--space-1-5)", fontFamily: "'DM Mono', monospace", fontSize: "var(--font-size-base)", fontFeatureSettings: "'tnum'" }}>{row.hero}</td>
                <td style={{ padding: "var(--space-2) var(--space-1-5)", fontFamily: "'DM Mono', monospace", fontSize: "var(--font-size-base)", fontFeatureSettings: "'tnum'" }}>{row.peek}</td>
                <td style={{ padding: "var(--space-2) var(--space-1-5)", fontFamily: "'DM Mono', monospace", fontSize: "var(--font-size-base)" }}>{row.itemSize}</td>
                <td style={{ padding: "var(--space-2) var(--space-1-5)", fontFamily: "'DM Mono', monospace", fontSize: "var(--font-size-base)", fontFeatureSettings: "'tnum'" }}>{row.ir}</td>
                <td style={{ padding: "var(--space-2) var(--space-1-5)", fontFamily: "'DM Mono', monospace", fontSize: "var(--font-size-base)" }}>{row.nav}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* M3 item size anatomy */}
      <div className="mt-5">
        <span className="type-label" style={{ color: "var(--text-default)", fontSize: "var(--font-size-base)" }}>
          M3 Item Size Anatomy
        </span>
        <div className="mt-3 flex items-end gap-3" style={{ height: 100 }}>
          {[
            { label: "Large", radius: R_LARGE, h: 100, color: "var(--primary)" },
            { label: "Medium", radius: R_MEDIUM, h: 72, color: "color-mix(in srgb, var(--primary) 65%, var(--surface-container))" },
            { label: "Small", radius: R_SMALL, h: 48, color: "color-mix(in srgb, var(--primary) 35%, var(--surface-container))" },
          ].map((size) => (
            <div key={size.label} className="flex flex-col items-center gap-2 flex-1">
              <div
                className="w-full overflow-hidden"
                style={{
                  height: size.h,
                  borderRadius: size.radius,
                  background: size.color,
                  border: "var(--border-width-thin) solid var(--outline-variant)",
                }}
              />
              <div className="flex flex-col items-center">
                <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "var(--font-size-base)", fontWeight: "var(--weight-semibold)" as any, color: "var(--text-default)", fontFeatureSettings: "'tnum'" }}>
                  {size.label}
                </span>
                <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "var(--font-size-sm)", color: "var(--muted-foreground)", fontFeatureSettings: "'tnum'" }}>
                  r: {size.radius}px
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Anatomy details */}
      <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <AnatomyRow prop="Container" val="Sempre overflow:hidden, mai borderRadius. Il clip avviene naturalmente: gli item interni mantengono il proprio radius, il container taglia solo cio che esce." />
        <AnatomyRow prop="Uncontained" val="M3 principle: item che escono dal container vengono tagliati dal clip, creando un bordo piatto che suggerisce contenuto nascosto." />
        <AnatomyRow prop="Item hierarchy" val="Large (r:20px, h:260px+): hero, uncontained. Medium (r:16px, h:200px): multi-browse, multi-aspect. Small (r:12px): peek in Hero." />
        <AnatomyRow prop="Navigazione" val="translateX: scroll progressivo (multi-browse, uncontained). AnimatePresence: crossfade per cambio item (hero, center-hero). crossfade+scale: cinematico (full-screen)." />
        <AnatomyRow prop="Spring" val="Slide s:280 d:28 m:0.8 — Fade s:300 d:26 — Dots s:420 d:28 — Arrow s:500 d:22. Zero duration/ease." />
        <AnatomyRow prop="A11y" val="role='region' aria-roledescription='carousel' su container. Dots con aria-label. Arrow buttons accessibili. Touch swipe threshold 40px." />
      </div>
    </div>
  );
}
