import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { AnatomyRow } from "./shared";
import { ImageWithFallback } from "../media/ImageWithFallback";
import { toShowcaseCssValue } from "./showcase-style";
import { showcaseMotion } from "./showcase-motion";
import { showcaseMessage } from "../../i18n/showcase-messages";

/* ═══════════════════════════════════════════════════════════
   M3 EXPRESSIVE — CAROUSEL VARIANTS
   Hero, Multi-browse, Uncontained, Uncontained Multi-aspect,
   Full-screen.  Ogni variante e una demo interattiva con card
   descrittiva + anatomy.  Nessun registry proprio: le demo
   vengono importate da components-h.tsx (CarouselSpec, C22).
   ═══════════════════════════════════════════════════════════ */

/* ── Shared springs (tutte spring, zero duration/ease) ── */
const SP = showcaseMotion.carousel;

/* ── M3 Expressive item radii ── */
const R_LARGE  = 20;
const R_MEDIUM = 16;
const R_SMALL  = 12;

/* ── Data ── */
const ITEMS = [
  { id: "napoletana", title: showcaseMessage("components.design-system.carousel-variants.napoletana-stg-fc9d3868"), sub: "Forno legna · 450°C", img: "https://images.unsplash.com/photo-1765652584214-ab9167622c8d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxuZWFwb2xpdGFuJTIwcGl6emElMjB3b29kJTIwb3ZlbnxlbnwxfHx8fDE3NzEyMjg4NDF8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=vulcan&utm_medium=referral" },
  { id: "teglia", title: showcaseMessage("components.design-system.carousel-variants.teglia-romana-3dfce708"), sub: "Elettrico · 280°C", img: "https://images.unsplash.com/photo-1695324318807-a234819bad21?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyb21hbiUyMHBpenphJTIwYWwlMjB0YWdsaW98ZW58MXx8fHwxNzcxMjI4ODQyfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=vulcan&utm_medium=referral" },
  { id: "chicago", title: showcaseMessage("components.design-system.carousel-variants.chicago-deep-dish-1124774f"), sub: "Elettrico · 220°C", img: "https://images.unsplash.com/photo-1765933613028-63223082b4ff?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkZWVwJTIwZGlzaCUyMHBpenphJTIwY2hlZXNlfGVufDF8fHx8MTc3MTIyODg0Nnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=vulcan&utm_medium=referral" },
  { id: "margherita", title: showcaseMessage("components.design-system.carousel-variants.margherita-0117d9ad"), sub: "Universale · 250-500°C", img: "https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwaXp6YSUyMG1hcmdoZXJpdGElMjBiYXNpbCUyMG1venphcmVsbGF8ZW58MXx8fHwxNzcxMjI4ODQ5fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=vulcan&utm_medium=referral" },
  { id: "fermentazione", title: showcaseMessage("components.design-system.carousel-variants.lunga-maturazione-9c6f42d7"), sub: "48-72h frigo", img: "https://images.unsplash.com/photo-1738717201678-412395e65b36?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwaXp6YSUyMGRvdWdoJTIwcHJvb2ZpbmclMjBmZXJtZW50YXRpb258ZW58MXx8fHwxNzcxMjI4ODQzfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=vulcan&utm_medium=referral" },
  { id: "sourdough", title: showcaseMessage("components.design-system.carousel-variants.sourdough-crumb-e28bd6ba"), sub: "Lievito madre · 72h", img: "https://images.unsplash.com/photo-1763297014734-e2ac58a6f3c0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhcnRpc2FuJTIwc291cmRvdWdoJTIwYnJlYWQlMjBjbG9zZXVwfGVufDF8fHx8MTc3MTIzMzY2Mnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=vulcan&utm_medium=referral" },
  { id: "focaccia", title: showcaseMessage("components.design-system.carousel-variants.focaccia-ligure-71be3d63"), sub: "Olio EVO · 220°C", img: "https://images.unsplash.com/photo-1706145787429-4d6b00a5dc0c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpdGFsaWFuJTIwZm9jYWNjaWElMjByb3NlbWFyeSUyMG9saXZlJTIwb2lsfGVufDF8fHx8MTc3MTIzMzY2M3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=vulcan&utm_medium=referral" },
  { id: "forno", title: showcaseMessage("components.design-system.carousel-variants.forno-a-legna-fd23b413"), sub: "450-500°C", img: "https://images.unsplash.com/photo-1706011465964-7a226eea129a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b29kJTIwZmlyZWQlMjBwaXp6YSUyMG92ZW4lMjBmbGFtZXN8ZW58MXx8fHwxNzcxMTk1OTgwfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=vulcan&utm_medium=referral" },
];

/** Uncontained multi-aspect items */
const MULTI_ASPECT_ITEMS = [
  { id: "ma-1", title: showcaseMessage("components.design-system.carousel-variants.impasto-4c653db5"),    aspect: 0.7,  img: "https://images.unsplash.com/photo-1738717201744-9faf699eea3d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwaXp6YSUyMGRvdWdoJTIwc3RyZXRjaGluZyUyMGhhbmRzfGVufDF8fHx8MTc3MTIzMzY2NHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=vulcan&utm_medium=referral" },
  { id: "ma-2", title: showcaseMessage("components.design-system.carousel-variants.napoletana-97c08737"), aspect: 1.4,  img: ITEMS[0].img },
  { id: "ma-3", title: showcaseMessage("components.design-system.carousel-variants.forno-0f50f5fe"),      aspect: 1.0,  img: ITEMS[7].img },
  { id: "ma-4", title: showcaseMessage("components.design-system.carousel-variants.focaccia-22c16a0a"),   aspect: 1.6,  img: ITEMS[6].img },
  { id: "ma-5", title: showcaseMessage("components.design-system.carousel-variants.crumb-3aee4974"),      aspect: 0.85, img: ITEMS[5].img },
  { id: "ma-6", title: showcaseMessage("components.design-system.carousel-variants.deep-dish-ecd4aa9d"),  aspect: 1.2,  img: ITEMS[2].img },
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
      className="w-9 h-9 rounded-full flex items-center justify-center active:scale-82 transition-transform dsx-s-cbf876569c"
      aria-label={dir === "left" ? showcaseMessage("components.design-system.carousel-variants.precedente-4dfefd8d") : showcaseMessage("components.design-system.carousel-variants.successiva-5c6e5fb1")}
    >
      <I size={18} className="dsx-s-a57c4bed75" />
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
            className="relative w-6 h-6 rounded-full flex items-center justify-center active:scale-80 transition-transform dsx-s-2596e0553d ds-showcase__compact-target"
            aria-label={showcaseMessage("components.design-system.carousel-variants.slide-value-0a48c24b", [i + 1])}
          >
            <motion.span
              className="relative block h-2 rounded-full overflow-hidden dsx-s-279d49df94"
              animate={{ width: isActive ? 24 : 8 }}
              transition={SP.dot}
            >
              {isActive && (
                <motion.span
                  layoutId={`dot-${id}`}
                  className="absolute inset-0 rounded-full dsx-s-0a278ece1c"
                  transition={SP.dot}
                />
              )}
            </motion.span>
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
      <span className="type-label dsx-s-e2184fadc0">
        {showcaseMessage("components.design-system.carousel-variants.hero-1-large-1-small-2b9d396a")}</span>
      <p className="dsx-s-da3caa8807">
        {showcaseMessage("components.design-system.carousel-variants.m3-hero-layout-l-item-in-focus-e-un-ac7844c2")}<span className="dsx-s-154dc56bcf">{showcaseMessage("components.design-system.carousel-variants.large-carousel-item-df331c96")}</span> ({HERO_LARGE_PCT}{showcaseMessage("components.design-system.carousel-variants.l-item-successivo-e-un-309b7e7b")}<span className="dsx-s-154dc56bcf">{showcaseMessage("components.design-system.carousel-variants.small-carousel-item-58009ac4")}</span> ({HERO_SMALL_PCT}{showcaseMessage("components.design-system.carousel-variants.clippato-al-bordo-destro-del-container-gap-414af569")}<span className="dsx-s-154dc56bcf">8px</span>{showcaseMessage("components.design-system.carousel-variants.click-sul-peek-per-avanzare-4ae56b03")}</p>

      <div className="mt-5 relative">
        <div
          className="flex overflow-hidden dsx-s-08c21e2f7c"
          {...swipe}
          role="region"
          aria-roledescription="carousel"
          aria-label={showcaseMessage("components.design-system.carousel-variants.hero-carousel-9da93ffc")}
        >
          {/* ── Large item (hero) ── */}
          <div
            className="relative overflow-hidden dsx-s-c460f87e81"
            style={{ "--dsx-flex": toShowcaseCssValue(`0 0 ${HERO_LARGE_PCT}`, true), "--dsx-border-radius": toShowcaseCssValue(R_LARGE, false) } as any}
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
                  className="absolute inset-0 w-full h-full dsx-s-bcc9535a4c"
                />
                {/* Scrim gradient */}
                <div
                  className="absolute bottom-0 left-0 right-0 dsx-s-2bdb173748"
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

          {/* ── Small item (peek) — clipped at right edge ── */}
          <div
            className="relative overflow-hidden cursor-pointer dsx-s-145328d76f"
            role="button"
            tabIndex={0}
            aria-label={showcaseMessage("components.design-system.carousel-variants.mostra-value-9a8864ea", [peekItem.title])}
            style={{ "--dsx-flex": toShowcaseCssValue(`0 0 ${HERO_SMALL_PCT}`, true), "--dsx-border-radius": toShowcaseCssValue(`${R_SMALL}px 0 0 ${R_SMALL}px`, false), "--dsx-margin-right": toShowcaseCssValue(-HERO_CLIP, false) } as any}
            onClick={next}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                next();
              }
            }}
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
                  className="absolute inset-0 w-full h-full dsx-s-bcc9535a4c"
                />
                {/* Sottile scrim per suggerire interattivita */}
                <div className="absolute inset-0 dsx-s-145ffa4a64" />
                {/* Small label M3 */}
                <div
                  className="absolute bottom-0 left-0 right-0 p-3 dsx-s-ff84a6103d"
                >
                  <span className="dsx-s-29d09c3054"
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
      <span className="type-label dsx-s-e2184fadc0">
        {showcaseMessage("components.design-system.carousel-variants.multi-browse-medium-items-edge-clip-7af06bc1")}</span>
      <p className="dsx-s-da3caa8807">
        {showcaseMessage("components.design-system.carousel-variants.tutti-gli-item-sono-b278e8a6")}<span className="dsx-s-154dc56bcf">{showcaseMessage("components.design-system.carousel-variants.medium-carousel-item-13d65247")}</span> {showcaseMessage("components.design-system.carousel-variants.con-larghezza-uguale-82d4473a")}{Math.round(100 / MB_VISIBLE)}{showcaseMessage("components.design-system.carousel-variants.l-ultimo-a-destra-e-clippato-suggerendo-sc-2a32c136")}<span className="dsx-s-154dc56bcf">{R_MEDIUM}px</span>{showcaseMessage("components.design-system.carousel-variants.gap-e9160ca0")}<span className="dsx-s-154dc56bcf">{MB_GAP}px</span>.
      </p>

      <div className="mt-5 relative">
        <div
          className="overflow-hidden dsx-s-ef4b6ace17"
          {...swipe}
          role="region"
          aria-roledescription="carousel"
          aria-label={showcaseMessage("components.design-system.carousel-variants.multi-browse-a381c24b")}
        >
          <motion.div
            className="flex dsx-s-9ba7ea1b18"
            style={{ "--dsx-gap": toShowcaseCssValue(MB_GAP, false) } as any}
            animate={{ x: -(offset * (100 / MB_VISIBLE + MB_GAP / MB_VISIBLE)) + "%" }}
            transition={SP.slide}
          >
            {ITEMS.map((item) => (
              <div
                key={item.id}
                className="relative overflow-hidden flex-shrink-0 dsx-s-928aa45342"
                style={{ "--dsx-width": toShowcaseCssValue(`calc(${100 / MB_VISIBLE}% - ${MB_GAP * (MB_VISIBLE - 1) / MB_VISIBLE}px)`, false), "--dsx-border-radius": toShowcaseCssValue(R_MEDIUM, false) } as any}
              >
                <ImageWithFallback
                  src={item.img}
                  alt={item.title}
                  className="absolute inset-0 w-full h-full dsx-s-bcc9535a4c"
                />
                <div
                  className="absolute bottom-0 left-0 right-0 p-3 dsx-s-2de2509a7d"
                >
                  <span className="dsx-s-f9417186e8">
                    {item.title}
                  </span>
                  <span className="dsx-s-0ee47c3b1b">
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
          <motion.button
            key={i}
            type="button"
            aria-label={showcaseMessage("components.design-system.carousel-variants.vai-alla-pagina-value-33a45164", [i + 1])}
            aria-pressed={i === offset}
            className="w-6 h-6 rounded-full flex items-center justify-center dsx-s-80e3bcb9cf ds-showcase__compact-target"
            onClick={() => setOffset(i)}
          >
            <motion.span
              className="block rounded-full"
              animate={{
                width: i === offset ? 16 : 6,
                height: 6,
                background: i === offset ? "var(--primary)" : "var(--outline-variant)",
              }}
              transition={SP.dot}
            />
          </motion.button>
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
      <span className="type-label dsx-s-e2184fadc0">
        {showcaseMessage("components.design-system.carousel-variants.uncontained-large-items-stessa-dimensione-c7782a28")}</span>
      <p className="dsx-s-da3caa8807">
        {showcaseMessage("components.design-system.carousel-variants.ogni-item-e-un-f57ca88f")}<span className="dsx-s-154dc56bcf">{showcaseMessage("components.design-system.carousel-variants.large-carousel-item-df331c96")}</span> {showcaseMessage("components.design-system.carousel-variants.con-larghezza-uniforme-5123f0db")}{UC_ITEM_WIDTH_PCT}{showcaseMessage("components.design-system.carousel-variants.il-container-non-ha-radius-gli-item-ai-bor-b9303f6e")}<span className="dsx-s-154dc56bcf">{R_LARGE}px</span>{showcaseMessage("components.design-system.carousel-variants.gap-e9160ca0")}<span className="dsx-s-154dc56bcf">{UC_GAP}px</span>.
      </p>

      <div className="mt-5 relative">
        <div
          className="overflow-hidden dsx-s-61111b8fc9"
          {...swipe}
          role="region"
          aria-roledescription="carousel"
          aria-label={showcaseMessage("components.design-system.carousel-variants.uncontained-carousel-4738db1a")}
        >
          <motion.div
            className="flex h-full dsx-s-9ba7ea1b18"
            style={{ "--dsx-gap": toShowcaseCssValue(UC_GAP, false) } as any}
            animate={{ x: `${-offset * (UC_ITEM_WIDTH_PCT + (UC_GAP * 100 / 600))}%` }}
            transition={SP.slide}
          >
            {ITEMS.map((item) => (
              <div
                key={item.id}
                className="relative overflow-hidden flex-shrink-0 dsx-s-fee5fccfa5"
                style={{ "--dsx-width": toShowcaseCssValue(`${UC_ITEM_WIDTH_PCT}%`, false), "--dsx-border-radius": toShowcaseCssValue(R_LARGE, false) } as any}
              >
                <ImageWithFallback
                  src={item.img}
                  alt={item.title}
                  className="absolute inset-0 w-full h-full dsx-s-bcc9535a4c"
                />
                {/* Scrim + label M3 */}
                <div
                  className="absolute bottom-0 left-0 right-0 p-4 dsx-s-2de2509a7d"
                >
                  <span className="dsx-s-3df36ec9e0"
                  >
                    {item.title}
                  </span>
                  <span className="dsx-s-4df4ae2ea9"
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
          <motion.button
            key={i}
            type="button"
            aria-label={showcaseMessage("components.design-system.carousel-variants.vai-alla-pagina-value-33a45164", [i + 1])}
            aria-pressed={i === offset}
            className="w-6 h-6 rounded-full flex items-center justify-center dsx-s-80e3bcb9cf ds-showcase__compact-target"
            onClick={() => setOffset(i)}
          >
            <motion.span
              className="block rounded-full"
              animate={{
                width: i === offset ? 16 : 6,
                height: 6,
                background: i === offset ? "var(--primary)" : "var(--outline-variant)",
              }}
              transition={SP.dot}
            />
          </motion.button>
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
      <span className="type-label dsx-s-e2184fadc0">
        {showcaseMessage("components.design-system.carousel-variants.uncontained-multi-aspect-ratio-9-16-16-9-bfd51a7c")}</span>
      <p className="dsx-s-da3caa8807">
        {showcaseMessage("components.design-system.carousel-variants.ogni-item-ha-un-aspect-ratio-diverso-da-5817889b")}<span className="dsx-s-154dc56bcf">0.7</span> {showcaseMessage("components.design-system.carousel-variants.portrait-a-0f29b0f5")}<span className="dsx-s-154dc56bcf">1.6</span> {showcaseMessage("components.design-system.carousel-variants.landscape-la-larghezza-e-proporzionale-8df8b405")}<span className="dsx-s-154dc56bcf">{showcaseMessage("components.design-system.carousel-variants.w-aspect-aspect-100-db6be339")}</span>{showcaseMessage("components.design-system.carousel-variants.container-senza-radius-item-radius-fb02a6a9")}<span className="dsx-s-154dc56bcf">{R_MEDIUM}px</span>.
      </p>

      <div className="mt-5 relative">
        <div
          className="overflow-hidden dsx-s-f641ccf940"
          style={{ "--dsx-height": toShowcaseCssValue(MA_HEIGHT, false) } as any}
          {...swipe}
          role="region"
          aria-roledescription="carousel"
          aria-label={showcaseMessage("components.design-system.carousel-variants.multi-aspect-carousel-6b46cc2b")}
        >
          <motion.div
            className="flex h-full dsx-s-491198ddb7"
            animate={{ x: `${-offset * 28}%` }}
            transition={SP.slide}
          >
            {MULTI_ASPECT_ITEMS.map((item) => {
              const w = (item.aspect / totalAspect) * 100;
              return (
                <div
                  key={item.id}
                  className="relative overflow-hidden flex-shrink-0 dsx-s-fee5fccfa5"
                  style={{ "--dsx-width": toShowcaseCssValue(`${Math.max(w * 2.2, 18)}%`, false), "--dsx-border-radius": toShowcaseCssValue(R_MEDIUM, false) } as any}
                >
                  <ImageWithFallback
                    src={item.img}
                    alt={item.title}
                    className="absolute inset-0 w-full h-full dsx-s-bcc9535a4c"
                  />
                  <div
                    className="absolute bottom-0 left-0 right-0 p-2.5 dsx-s-ff84a6103d"
                  >
                    <span className="dsx-s-1a5f7c207b">
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
            className="px-2 py-1 rounded-lg dsx-s-ecd2a0e5f2"
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
      <span className="type-label dsx-s-e2184fadc0">
        {showcaseMessage("components.design-system.carousel-variants.full-screen-un-item-alla-volta-253900bc")}</span>
      <p className="dsx-s-da3caa8807">
        {showcaseMessage("components.design-system.carousel-variants.l-item-in-focus-occupa-il-f14a2ee6")}<span className="dsx-s-154dc56bcf">100%</span> {showcaseMessage("components.design-system.carousel-variants.del-container-nessun-peek-nessun-radius-su-633856c9")}<span className="dsx-s-154dc56bcf">{showcaseMessage("components.design-system.carousel-variants.crossfade-scale-b90c467c")}</span> {showcaseMessage("components.design-system.carousel-variants.spring-per-profondita-cinematica-counter-o-11c50c22")}<span className="dsx-s-154dc56bcf">01 / 08</span>.
      </p>

      <div className="mt-5 relative">
        <div
          className="relative overflow-hidden dsx-s-348d0d8579"
          {...swipe}
          role="region"
          aria-roledescription="carousel"
          aria-label={showcaseMessage("components.design-system.carousel-variants.full-screen-carousel-2918f02a")}
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
                className="absolute inset-0 w-full h-full dsx-s-bcc9535a4c"
              />
              {/* Scrim */}
              <div
                className="absolute bottom-0 left-0 right-0 dsx-s-49686b3396"
              />
              {/* Label */}
              <div className="absolute bottom-0 left-0 right-0 p-5">
                <span className="dsx-s-2e13245d4c">
                  {ITEMS[focus].title}
                </span>
                <span className="dsx-s-c9d81585e2">
                  {ITEMS[focus].sub}
                </span>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Counter overlay */}
          <div className="absolute top-3 right-3 z-10 px-2.5 py-1 rounded-lg dsx-s-8d1dee08aa">
            <span className="dsx-s-545599cf5f">
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
    { name: showcaseMessage("components.design-system.carousel-variants.center-aligned-hero-eebb5d70"), vis: "1 + 2 peek", hero: "~56%", peek: "~20%", itemSize: "L + S + S", ir: "16px", nav: "flex crossfade" },
    { name: showcaseMessage("components.design-system.carousel-variants.hero-17f5d4f0"),                vis: "1 + 1 peek", hero: "70%",  peek: "28%",  itemSize: "L + S",     ir: "20 / 12", nav: "AnimatePresence" },
    { name: showcaseMessage("components.design-system.carousel-variants.multi-browse-a381c24b"),        vis: "3.3",        hero: "—",    peek: "clip",  itemSize: "M × N",     ir: "16px", nav: "translateX" },
    { name: showcaseMessage("components.design-system.carousel-variants.uncontained-ef6d4bff"),         vis: "~2.3",       hero: "—",    peek: "clip",  itemSize: "L × N",     ir: "20px", nav: "translateX" },
    { name: showcaseMessage("components.design-system.carousel-variants.uncontained-multi-ar-53f31e47"),vis: "2-3",        hero: "—",    peek: "clip",  itemSize: "Mixed",     ir: "16px", nav: "translateX" },
    { name: showcaseMessage("components.design-system.carousel-variants.full-screen-225c026a"),         vis: "1",          hero: "100%", peek: "0",     itemSize: "L × 1",     ir: "0",    nav: "crossfade + scale" },
  ];

  const headers = ["Variante", "Items vis.", "Hero %", "Peek", "Item size", "Item radius", "Navigazione"];

  return (
    <div className="surface-card p-5">
      <span className="type-label dsx-s-e2184fadc0">
        {showcaseMessage("components.design-system.carousel-variants.confronto-varianti-m3-expressive-carousel-9325fca8")}</span>

      <div
        className="mt-4 overflow-x-auto"
        role="region"
        tabIndex={0}
        aria-label={showcaseMessage("components.design-system.carousel-variants.confronto-varianti-m3-expressive-carousel-9325fca8")}
      >
        <table className="dsx-s-327b8a7ad6">
          <thead>
            <tr className="dsx-s-e7826affa9">
              {headers.map((h) => (
                <th key={h} className="dsx-s-e89d79e022">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.name} className="dsx-s-e7826affa9">
                <td className="dsx-s-75e7824b76">{row.name}</td>
                <td className="dsx-s-f0104e1cbd">{row.vis}</td>
                <td className="dsx-s-f0104e1cbd">{row.hero}</td>
                <td className="dsx-s-f0104e1cbd">{row.peek}</td>
                <td className="dsx-s-b6979344ef">{row.itemSize}</td>
                <td className="dsx-s-f0104e1cbd">{row.ir}</td>
                <td className="dsx-s-b6979344ef">{row.nav}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* M3 item size anatomy */}
      <div className="mt-5">
        <span className="type-label dsx-s-e2184fadc0 ds-showcase__on-primary">
          {showcaseMessage("components.design-system.carousel-variants.m3-item-size-anatomy-41d0d5dd")}</span>
        <div className="mt-3 flex items-end gap-3 dsx-s-584921563c">
          {[
            { label: showcaseMessage("components.design-system.carousel-variants.large-738fd1d2"), radius: R_LARGE, h: 100, color: "var(--primary)" },
            { label: showcaseMessage("components.design-system.carousel-variants.medium-d404968e"), radius: R_MEDIUM, h: 72, color: "color-mix(in srgb, var(--primary) 65%, var(--surface-container))" },
            { label: showcaseMessage("components.design-system.carousel-variants.small-c74fd971"), radius: R_SMALL, h: 48, color: "color-mix(in srgb, var(--primary) 35%, var(--surface-container))" },
          ].map((size) => (
            <div key={size.label} className="flex flex-col items-center gap-2 flex-1">
              <div
                className="w-full overflow-hidden dsx-s-614b176bae"
                style={{ "--dsx-height": toShowcaseCssValue(size.h, false), "--dsx-border-radius": toShowcaseCssValue(size.radius, false), "--dsx-background": toShowcaseCssValue(size.color, false) } as any}
              />
              <div className="flex flex-col items-center">
                <span className="dsx-s-d480dd1c6d">
                  {size.label}
                </span>
                <span className="dsx-s-b45529f002">
                  {showcaseMessage("components.design-system.carousel-variants.r-b53ea639")}{size.radius}px
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Anatomy details */}
      <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <AnatomyRow prop={showcaseMessage("components.design-system.carousel-variants.container-e6443af9")} val={showcaseMessage("components.design-system.carousel-variants.sempre-overflow-hidden-mai-borderradius-il-938705db")} />
        <AnatomyRow prop={showcaseMessage("components.design-system.carousel-variants.uncontained-ef6d4bff")} val={showcaseMessage("components.design-system.carousel-variants.m3-principle-item-che-escono-dal-container-1f030990")} />
        <AnatomyRow prop={showcaseMessage("components.design-system.carousel-variants.item-hierarchy-7c1d9a40")} val={showcaseMessage("components.design-system.carousel-variants.large-r-20px-h-260px-hero-uncontained-medi-932cb34f")} />
        <AnatomyRow prop={showcaseMessage("components.design-system.carousel-variants.navigazione-14e9d9e8")} val={showcaseMessage("components.design-system.carousel-variants.translatex-scroll-progressivo-multi-browse-014db2bc")} />
        <AnatomyRow prop={showcaseMessage("components.design-system.carousel-variants.spring-89677615")} val={showcaseMessage("components.design-system.carousel-variants.slide-s-280-d-28-m-0-8-fade-s-300-d-26-dot-5ac47ce8")} />
        <AnatomyRow prop={showcaseMessage("components.design-system.carousel-variants.a11y-9126f700")} val={showcaseMessage("components.design-system.carousel-variants.role-region-aria-roledescription-carousel--c6b08978")} />
      </div>
    </div>
  );
}
