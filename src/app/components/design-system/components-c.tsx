import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Home,
  Flame,
  Star,
  Settings,
  Moon,
  ChefHat,
  Maximize2,
  Minimize2,
  FlaskConical,
  X,
} from "lucide-react";
import {
  SectionHeader,
  AnatomyRow,
  SubSectionLabel,
  Panoramica,
  LineeGuida,
  AccessibilitaInfo,
} from "./shared";
import type { SectionEntry } from "./shared";
import { SCORE_DIMENSIONS } from "../../domain/pizza-engine";

/* ═══════════════════════════════════════════════════════════
   COMPONENT SPEC SHEETS C11–C13
   ═══════════════════════════════════════════════════════════ */

/* ── Shared nav items data ── */
const NAV_DEMO_ITEMS = [
  { id: "home", label: "Configura", icon: Home },
  { id: "styles", label: "Stili", icon: ChefHat },
  { id: "recipe", label: "Ricetta", icon: Flame },
  { id: "score", label: "Score", icon: Star },
  { id: "settings", label: "Opzioni", icon: Settings },
];

/* ═══ C11: NAVIGATION BAR ═══ */
export function NavigationBarSpec() {
  const [activeNavDesktop, setActiveNavDesktop] = useState("home");
  const [activeNavMobile, setActiveNavMobile] = useState("home");

  return (
    <div className="flex flex-col gap-8">
      <SectionHeader title="NavigationBar" description="Header glassmorphism sticky + bottom nav mobile. Active state con indicatore animato, motion spring per transizioni. Clicca per navigare!" />

      <SubSectionLabel label="Panoramica" />
      <Panoramica
        descrizione="La NavigationBar ha due forme: desktop (header glassmorphism sticky con tab orizzontali) e mobile (bottom navigation con icone e pill animata). L'indicatore attivo usa layoutId per transizioni shared layout."
        principi={[
          "Desktop: glassmorphism con blur(24px) saturate(1.6) e background 88% opaco",
          "Mobile: bottom bar da 56px con pill animata via layoutId",
          "Active state: spring (stiffness 500, damping 30) per indicatore",
        ]}
      />

      <SubSectionLabel label="Specifiche" />

      {/* Desktop glassmorphism header */}
      <div className="surface-card overflow-hidden">
        <span className="px-5 pt-4 block type-label" style={{ color: "var(--text-default)", fontSize: "var(--font-size-base)" }}>Desktop — Header Glassmorphism (clicca le voci)</span>
        <div className="p-4">
          <div className="relative h-48 rounded-2xl overflow-hidden" style={{ border: "1px solid var(--outline-variant)" }}>
            <div className="absolute inset-0" style={{ background: "var(--grad-warm)" }} />
            <div className="absolute inset-0 flex items-center justify-center" style={{ opacity: 0.15 }}>
              <span style={{ fontFamily: "'Playfair Display', serif", fontSize: "var(--font-size-11xl)", fontWeight: "var(--weight-bold)" as any, color: "var(--text-default)" }}>Vulcan</span>
            </div>

            <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-5" style={{ height: "52px", background: "color-mix(in srgb, var(--container-page) 88%, transparent)", backdropFilter: "blur(24px) saturate(1.6)", WebkitBackdropFilter: "blur(24px) saturate(1.6)", borderBottom: "1px solid var(--border-muted)" }}>
              <div className="flex items-center gap-2">
                <Flame size={16} style={{ color: "var(--primary)" }} />
                <span style={{ fontFamily: "'Playfair Display', serif", fontSize: "var(--font-size-2xl)", fontWeight: "var(--weight-bold)" as any, color: "var(--text-default)" }}>Vulcan</span>
              </div>
              <div className="flex items-center gap-1">
                {NAV_DEMO_ITEMS.map((item) => {
                  const isActive = activeNavDesktop === item.id;
                  const Icon = item.icon;
                  return (
                    <motion.button key={item.id} onClick={() => setActiveNavDesktop(item.id)} className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg active:scale-95 transition-transform" style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "var(--font-size-md)", fontWeight: isActive ? "var(--weight-semibold)" as any : "var(--weight-medium)" as any, color: isActive ? "var(--primary)" : "var(--muted-foreground)", background: "rgba(0,0,0,0)", border: "none", cursor: "pointer", outline: "none" }}>
                      {isActive && <motion.div layoutId="desktopNavIndicator" className="absolute inset-0 rounded-lg" style={{ background: "color-mix(in srgb, var(--primary) 10%, transparent)" }} transition={{ type: "spring", stiffness: 500, damping: 30 }} />}
                      <Icon size={14} style={{ position: "relative", zIndex: 1 }} />
                      <span style={{ position: "relative", zIndex: 1 }}>{item.label}</span>
                    </motion.button>
                  );
                })}
              </div>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "color-mix(in srgb, var(--primary) 10%, transparent)" }}>
                <Moon size={14} style={{ color: "var(--primary)" }} />
              </div>
            </div>

            <div className="absolute bottom-4 left-5">
              <AnimatePresence mode="wait">
                <motion.span key={activeNavDesktop} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ type: "spring", stiffness: 400, damping: 25 }} style={{ fontFamily: "'Playfair Display', serif", fontSize: "var(--font-size-5xl)", fontWeight: "var(--weight-bold)" as any, color: "var(--text-default)" }}>
                  {NAV_DEMO_ITEMS.find((n) => n.id === activeNavDesktop)?.label}
                </motion.span>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile bottom navigation */}
      <div className="surface-card overflow-hidden">
        <span className="px-5 pt-4 block type-label" style={{ color: "var(--text-default)", fontSize: "var(--font-size-base)" }}>Mobile — Bottom Navigation (clicca le icone)</span>
        <div className="p-4">
          <div className="relative rounded-2xl overflow-hidden mx-auto" style={{ width: "320px", height: "200px", border: "1px solid var(--outline-variant)", background: "var(--surface-container-low)" }}>
            <div className="absolute inset-0 flex items-center justify-center" style={{ paddingBottom: "56px" }}>
              <AnimatePresence mode="wait">
                <motion.div key={activeNavMobile} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ type: "spring", stiffness: 400, damping: 25 }} className="flex flex-col items-center gap-1">
                  {React.createElement(NAV_DEMO_ITEMS.find((n) => n.id === activeNavMobile)?.icon || Home, { size: 28, style: { color: "var(--primary)", opacity: 0.4 } })}
                  <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "var(--font-size-lg)", fontWeight: "var(--weight-semibold)" as any, color: "var(--muted-foreground)", letterSpacing: "var(--tracking-caps)", textTransform: "uppercase" }}>
                    {NAV_DEMO_ITEMS.find((n) => n.id === activeNavMobile)?.label}
                  </span>
                </motion.div>
              </AnimatePresence>
            </div>
            <div className="absolute bottom-0 left-0 right-0 flex items-center justify-around" style={{ height: "56px", background: "color-mix(in srgb, var(--container-page) 92%, transparent)", backdropFilter: "blur(24px) saturate(1.6)", WebkitBackdropFilter: "blur(24px) saturate(1.6)", borderTop: "1px solid var(--border-muted)" }}>
              {NAV_DEMO_ITEMS.map((item) => {
                const isActive = activeNavMobile === item.id;
                const Icon = item.icon;
                return (
                  <motion.button key={item.id} onClick={() => setActiveNavMobile(item.id)} className="flex flex-col items-center gap-0.5 relative active:scale-[0.9] transition-transform" style={{ background: "rgba(0,0,0,0)", border: "none", cursor: "pointer", outline: "none", padding: "4px 12px" }}>
                    <div className="relative">
                      {isActive && <motion.div layoutId="mobileNavPill" className="absolute rounded-full" style={{ inset: "-4px -12px", background: "color-mix(in srgb, var(--primary) 12%, transparent)" }} transition={{ type: "spring", stiffness: 500, damping: 30 }} />}
                      <Icon size={18} style={{ color: isActive ? "var(--primary)" : "var(--muted-foreground)", position: "relative", zIndex: 1 }} />
                    </div>
                    <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "var(--font-size-base)", fontWeight: isActive ? "var(--weight-semibold)" as any : "var(--weight-regular)" as any, color: isActive ? "var(--primary)" : "var(--muted-foreground)", letterSpacing: "var(--tracking-spread)" }}>{item.label}</span>
                  </motion.button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="surface-card p-5">
        <span className="type-label" style={{ color: "var(--text-default)", fontSize: "var(--font-size-base)" }}>Specifiche NavigationBar</span>
        <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { prop: "Glassmorphism", val: "color-mix(bg 88%) + blur(24px) sat(1.6)" },
            { prop: "Border", val: "1px solid var(--border-muted)" },
            { prop: "Active indicator", val: "color-mix(primary 10%) + layoutId" },
            { prop: "Font active", val: "DM Sans 600" },
            { prop: "Font inactive", val: "DM Sans 500 muted-fg" },
            { prop: "Icon size", val: "Desktop 14px / Mobile 18px" },
            { prop: "Mobile height", val: "56px" },
            { prop: "Transition", val: "spring stiffness 500 damping 30" },
          ].map((a) => <AnatomyRow key={a.prop} {...a} />)}
        </div>
      </div>

      <SubSectionLabel label="Linee guida" />
      <LineeGuida
        fai={[
          "Desktop: glassmorphism con backdrop-filter per trasparenza elegante",
          "Mobile: bottom nav da 56px con pill animata via layoutId",
          "Active state sempre con indicatore visivo — mai solo cambio colore testo",
        ]}
        nonFare={[
          "Mai più di 5 voci nella navigation — oltre, usare menu hamburger",
          "Mai omettere la bottom nav su mobile — è il pattern primario di navigazione",
          "Mai animare l'indicatore con CSS transition — usare sempre layoutId + spring",
        ]}
        responsive="Desktop: header orizzontale sticky. Mobile (<640px): bottom navigation fissa con icone + label. Breakpoint a 640px."
      />

      <SubSectionLabel label="Accessibilità" />
      <AccessibilitaInfo items={[
        { label: "ARIA", desc: "nav con aria-label='Navigazione principale'. Voce attiva: aria-current='page'." },
        { label: "Tastiera", desc: "Tab per navigare tra le voci. Enter/Space per attivare." },
        { label: "Focus", desc: "Focus ring 3px primary su :focus-visible. Mobile: area di hit minima 44×44px." },
      ]} />
    </div>
  );
}

/* ═══ C12: BOTTOM SHEET ═══ */
const SNAP_HEIGHTS: Record<string, string> = { peek: "25%", half: "50%", full: "85%" };
const SNAP_SPECS = [
  { name: "Peek", height: "25%", use: "Anteprima, drag-to-expand", color: "var(--secondary)" },
  { name: "Half", height: "50%", use: "Default, contenuto principale", color: "var(--primary)" },
  { name: "Full", height: "85%", use: "Lista lunga, dettaglio completo", color: "var(--cta)" },
];

export function BottomSheetSpec() {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetSnap, setSheetSnap] = useState<"peek" | "half" | "full">("half");

  return (
    <div className="flex flex-col gap-8">
      <SectionHeader title="BottomSheet" description="Sheet modale dal basso con 3 snap point (peek 25%, half 50%, full 85%). Drag handle, backdrop fade, spring physics. Clicca per aprire!" />

      <SubSectionLabel label="Panoramica" />
      <Panoramica
        descrizione="Il BottomSheet è una modale dal basso con 3 snap point (peek 25%, half 50%, full 85%). Drag handle per il gesture, backdrop semi-trasparente, spring physics per le transizioni. Usato su mobile per dettagli ricetta."
        principi={[
          "3 snap point: peek (anteprima), half (default), full (dettaglio completo)",
          "Spring physics (stiffness 400, damping 30) per tutte le transizioni",
          "Backdrop rgba(0,0,0,0.35) con click-to-dismiss",
        ]}
      />

      <SubSectionLabel label="Specifiche" />

      <div className="surface-card overflow-hidden">
        <span className="px-5 pt-4 block type-label" style={{ color: "var(--text-default)", fontSize: "var(--font-size-base)" }}>Demo interattiva — Apri e cambia snap point</span>
        <div className="p-4">
          <div className="flex gap-2 mb-4">
            <motion.button onClick={() => { setSheetOpen(true); setSheetSnap("half"); }} style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "10px 20px", borderRadius: "0.75rem", background: "var(--grad-sage)", color: "var(--cta-foreground)", fontFamily: "'DM Sans', sans-serif", fontSize: "var(--font-size-md)", fontWeight: "var(--weight-semibold)" as any, letterSpacing: "var(--tracking-caps)", textTransform: "uppercase", border: "none", cursor: "pointer", outline: "none", boxShadow: "var(--cta-shadow)" }} className="active:scale-95 transition-transform">
              <Maximize2 size={14} />Apri Sheet
            </motion.button>
            {sheetOpen && (
              <motion.button initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} onClick={() => setSheetOpen(false)} style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "10px 20px", borderRadius: "0.75rem", background: "rgba(0,0,0,0)", color: "var(--muted-foreground)", fontFamily: "'DM Sans', sans-serif", fontSize: "var(--font-size-md)", fontWeight: "var(--weight-semibold)" as any, letterSpacing: "var(--tracking-caps)", textTransform: "uppercase", border: "1px solid var(--outline-variant)", cursor: "pointer", outline: "none" }} className="active:scale-95 transition-transform">
                <Minimize2 size={14} />Chiudi
              </motion.button>
            )}
          </div>

          <div className="relative rounded-2xl overflow-hidden mx-auto" style={{ width: "320px", height: "480px", border: "1px solid var(--outline-variant)", background: "var(--surface-container-low)" }}>
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-6">
              <Flame size={32} style={{ color: "var(--primary)", opacity: 0.2 }} />
              <span style={{ fontFamily: "'Playfair Display', serif", fontSize: "var(--font-size-5xl)", fontWeight: "var(--weight-bold)" as any, color: "var(--text-default)", opacity: 0.3 }}>Pagina App</span>
            </div>

            <AnimatePresence>
              {sheetOpen && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ type: "spring", stiffness: 600, damping: 30 }} className="absolute inset-0" style={{ background: "var(--sheet-backdrop)", zIndex: 1 }} onClick={() => setSheetOpen(false)} />}
            </AnimatePresence>

            <AnimatePresence>
              {sheetOpen && (
                <motion.div initial={{ y: "100%" }} animate={{ y: `${100 - parseInt(SNAP_HEIGHTS[sheetSnap])}%` }} exit={{ y: "100%" }} transition={{ type: "spring", stiffness: 400, damping: 30 }} className="absolute bottom-0 left-0 right-0 rounded-t-2xl" style={{ height: "85%", background: "var(--surface-container-lowest)", border: "1px solid var(--outline-variant)", borderBottom: "none", zIndex: 2 }}>
                  <div className="flex justify-center py-3">
                    <div className="rounded-full" style={{ width: "32px", height: "4px", background: "var(--outline-variant)" }} />
                  </div>
                  <div className="px-4 mb-3">
                    <div className="flex gap-1.5">
                      {(["peek", "half", "full"] as const).map((snap) => (
                        <motion.button key={snap} onClick={() => setSheetSnap(snap)} style={{ flex: 1, padding: "6px 8px", borderRadius: "8px", background: sheetSnap === snap ? "var(--primary)" : "var(--surface-container)", color: sheetSnap === snap ? "var(--primary-foreground)" : "var(--muted-foreground)", fontFamily: "'DM Sans', sans-serif", fontSize: "var(--font-size-md)", fontWeight: "var(--weight-semibold)" as any, letterSpacing: "var(--tracking-label)", textTransform: "uppercase", border: "none", cursor: "pointer", outline: "none" }} className="active:scale-95 transition-transform">
                          {snap}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                  <div className="px-4 overflow-y-auto" style={{ maxHeight: "calc(100% - 80px)" }}>
                    <div className="flex flex-col gap-1 mb-3">
                      <span style={{ fontFamily: "'Playfair Display', serif", fontSize: "var(--font-size-3xl)", fontWeight: "var(--weight-bold)" as any, color: "var(--text-default)" }}>Dettagli Ricetta</span>
                      <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "var(--font-size-md)", color: "var(--muted-foreground)", lineHeight: "var(--leading-relaxed)" }}>Napoletana STG — 4 panetti da 250g</span>
                    </div>
                    {[
                      { label: "Farina", value: "600g W280" },
                      { label: "Acqua", value: "366g (61%)" },
                      { label: "Sale", value: "18g (3%)" },
                      { label: "Lievito", value: "0.3g fresco" },
                    ].map((row) => (
                      <div key={row.label} className="flex justify-between py-2" style={{ borderBottom: "1px solid var(--outline-variant)" }}>
                        <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "var(--font-size-md)", color: "var(--muted-foreground)" }}>{row.label}</span>
                        <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "var(--font-size-md)", fontWeight: "var(--weight-semibold)" as any, color: "var(--text-default)", fontFeatureSettings: "'tnum'" }}>{row.value}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <div className="surface-card p-5">
        <span className="type-label" style={{ color: "var(--text-default)", fontSize: "var(--font-size-base)" }}>Snap Points</span>
        <div className="mt-3 grid grid-cols-3 gap-3">
          {SNAP_SPECS.map((s) => (
            <div key={s.name} className="flex flex-col items-center gap-2">
              <div className="relative rounded-lg overflow-hidden" style={{ width: "80px", height: "120px", background: "var(--surface-container)", border: "1px solid var(--outline-variant)" }}>
                <div className="absolute bottom-0 left-0 right-0 rounded-t-lg" style={{ height: s.height, background: s.color, opacity: 0.2 }} />
                <div className="absolute bottom-0 left-0 right-0 rounded-t-lg" style={{ height: s.height, border: `2px solid ${s.color}`, borderBottom: "none" }} />
              </div>
              <div className="text-center">
                <div className="type-code" style={{ fontWeight: "var(--weight-semibold)" as any, color: "var(--text-default)" }}>{s.name}</div>
                <div className="type-code" style={{ color: s.color, fontFeatureSettings: "'tnum'", fontWeight: "var(--weight-semibold)" as any }}>{s.height}</div>
                <div className="type-code" style={{ color: "var(--muted-foreground)" }}>{s.use}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="surface-card p-5">
        <span className="type-label" style={{ color: "var(--text-default)", fontSize: "var(--font-size-base)" }}>Anatomia BottomSheet</span>
        <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { prop: "Background", val: "var(--surface-container-lowest)" },
            { prop: "Radius", val: "rounded-t-2xl" },
            { prop: "Handle", val: "32×4px outline-variant rounded-full" },
            { prop: "Backdrop", val: "rgba(0,0,0,0.35)" },
            { prop: "Entrance", val: "spring stiffness 400 damping 30" },
            { prop: "Snap anim", val: "spring stiffness 400 damping 30" },
            { prop: "Border", val: "1px solid outline-variant" },
            { prop: "z-index", val: "2 (sheet) / 1 (backdrop)" },
          ].map((a) => <AnatomyRow key={a.prop} {...a} />)}
        </div>
      </div>

      <SubSectionLabel label="Linee guida" />
      <LineeGuida
        fai={[
          "Default snap a 'half' — il contenuto principale è subito visibile",
          "Drag handle visibile e riconoscibile (32×4px, rounded-full)",
          "Backdrop click chiude lo sheet — pattern universale mobile",
        ]}
        nonFare={[
          "Mai sheet senza backdrop — l'utente perde contesto",
          "Mai animazioni con duration/ease — sempre spring physics",
          "Mai contenuto scrollabile senza indicatore di overflow",
        ]}
        comportamento="Lo sheet si apre con spring (400/30), snap point cambiano con la stessa spring. Backdrop fade in 0.2s. Dismiss: click backdrop o drag sotto peek."
      />

      <SubSectionLabel label="Accessibilità" />
      <AccessibilitaInfo items={[
        { label: "ARIA", desc: "role='dialog' con aria-modal='true'. aria-label descrittivo sul container." },
        { label: "Focus trap", desc: "Il focus resta dentro lo sheet quando aperto. Escape per chiudere." },
        { label: "Backdrop", desc: "Il backdrop ha aria-hidden='true'. Non è focusabile." },
      ]} />
    </div>
  );
}

/* ═══ C13: MODALE SCORE DASHBOARD ═══ */
const COMPOSITE_WEIGHTS = SCORE_DIMENSIONS.map((d) => d.weight);
const DEMO_VALUES: Record<string, number> = {
  authenticity: 85, feasibility: 72, digestibility: 90,
  sustainability: 68, experimentation: 45,
};
const SCORE_DIMS = SCORE_DIMENSIONS.map((d) => ({
  ...d,
  value: DEMO_VALUES[d.key] ?? 50,
}));

const NERD_DATA = [
  { label: "Lievito baker's %", value: "0.08%" },
  { label: "Ore equiv. 18°C", value: "28.5h" },
  { label: "FODMAP reduction", value: "72%" },
  { label: "Gluten network", value: "84/100" },
  { label: "Water activity", value: "0.975" },
  { label: "Q10 model", value: "standard (2.0)" },
  { label: "P/L stimato", value: "0.62" },
  { label: "Energia cottura", value: "2400 kJ" },
];

/* ═══ DS RADAR CHART — editorial pentagon with gradient fill ═══ */
function DSRadarChart({ dims, size = 220 }: { dims: { key: string; short: string; value: number; color: string }[]; size?: number }) {
  const ctr = size / 2;
  const maxR = size * 0.34;
  const angleStep = (2 * Math.PI) / dims.length;
  const startAngle = -Math.PI / 2;

  const getPoint = (i: number, pct: number) => {
    const angle = startAngle + i * angleStep;
    const r = maxR * (pct / 100);
    return { x: ctr + r * Math.cos(angle), y: ctr + r * Math.sin(angle) };
  };

  const gridLevels = [25, 50, 75, 100];
  const dataPoints = dims.map((d, i) => getPoint(i, d.value));
  const pathD = dataPoints.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ") + " Z";

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ display: "block" }}>
      <defs>
        <linearGradient id="ds-radar-fill" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.18" />
          <stop offset="100%" stopColor="var(--tertiary)" stopOpacity="0.08" />
        </linearGradient>
        <linearGradient id="ds-radar-stroke" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.9" />
          <stop offset="50%" stopColor="var(--tertiary)" stopOpacity="0.7" />
          <stop offset="100%" stopColor="var(--cta)" stopOpacity="0.8" />
        </linearGradient>
        <filter id="ds-radar-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Grid rings */}
      {gridLevels.map((lvl) => {
        const pts = Array.from({ length: dims.length }, (_, i) => getPoint(i, lvl));
        const d = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ") + " Z";
        return <path key={lvl} d={d} fill="none" stroke="var(--outline-variant)" strokeWidth={lvl === 50 ? 0.8 : 0.5} opacity={lvl === 100 ? 0.35 : 0.2} />;
      })}

      {/* Spokes */}
      {dims.map((_, i) => {
        const p = getPoint(i, 100);
        return <line key={i} x1={ctr} y1={ctr} x2={p.x} y2={p.y} stroke="var(--outline-variant)" strokeWidth={0.5} opacity={0.25} strokeDasharray="2 3" />;
      })}

      {/* Data polygon with gradient + glow */}
      <motion.path
        d={pathD}
        fill="url(#ds-radar-fill)"
        stroke="url(#ds-radar-stroke)"
        strokeWidth={2}
        strokeLinejoin="round"
        filter="url(#ds-radar-glow)"
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 250, damping: 25 }}
        style={{ transformOrigin: `${ctr}px ${ctr}px` }}
      />

      {/* Data points with halo + labels */}
      {dims.map((d, i) => {
        const p = getPoint(i, d.value);
        const labelP = getPoint(i, 116);
        const scoreP = getPoint(i, 130);
        return (
          <g key={d.key}>
            <motion.circle cx={p.x} cy={p.y} r={9} fill={d.color} opacity={0.1} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3 + i * 0.06, type: "spring", stiffness: 300, damping: 20 }} />
            <motion.circle cx={p.x} cy={p.y} r={4} fill={d.color} stroke="var(--container-page)" strokeWidth={1.5} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3 + i * 0.06, type: "spring", stiffness: 400, damping: 20 }} />
            <text x={labelP.x} y={labelP.y} textAnchor="middle" dominantBaseline="central" fill="var(--muted-foreground)" fontSize="8" fontWeight="600" fontFamily="'DM Sans', sans-serif" letterSpacing="0.04em">{d.short}</text>
            <text x={scoreP.x} y={scoreP.y} textAnchor="middle" dominantBaseline="central" fill={d.color} fontSize="9" fontWeight="700" fontFamily="'DM Sans', sans-serif" style={{ fontFeatureSettings: "'tnum'" }}>{d.value}</text>
          </g>
        );
      })}

      {/* Center composite */}
      <text x={ctr} y={ctr - 5} textAnchor="middle" dominantBaseline="central" fill="var(--text-default)" fontSize="24" fontWeight="700" fontFamily="'DM Sans', sans-serif" style={{ fontFeatureSettings: "'tnum'" }}>
        {Math.round(dims.reduce((s, d, i) => s + d.value * COMPOSITE_WEIGHTS[i], 0))}
      </text>
      <text x={ctr} y={ctr + 12} textAnchor="middle" dominantBaseline="central" fill="var(--muted-foreground)" fontSize="6" fontWeight="600" fontFamily="'DM Sans', sans-serif" letterSpacing="0.14em">COMPOSITE</text>
    </svg>
  );
}

function MiniRing({ score, label, color, size = 64 }: { score: number; label: string; color: string; size?: number }) {
  const sw = 4;
  const r = (size - sw) / 2;
  const circ = 2 * Math.PI * r;
  const off = circ - (score / 100) * circ;
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--surface-container)" strokeWidth={sw} />
          <motion.circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={sw} strokeDasharray={circ} strokeLinecap="round" initial={{ strokeDashoffset: circ }} animate={{ strokeDashoffset: off }} transition={{ type: "spring", stiffness: 180, damping: 25, delay: 0.2 }} />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: size * 0.28, fontWeight: "var(--weight-bold)" as any, color, fontFeatureSettings: "'tnum'" }}>{score}</span>
        </div>
      </div>
      <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "var(--font-size-md)", fontWeight: "var(--weight-semibold)" as any, letterSpacing: "var(--tracking-widest)", textTransform: "uppercase", color: "var(--muted-foreground)" }}>{label}</span>
    </div>
  );
}

export function ModalScoreDashboardSpec() {
  const [modalOpen, setModalOpen] = useState(false);
  const [nerdMode, setNerdMode] = useState(false);

  const composite = Math.round(
    SCORE_DIMS.reduce((sum, d, i) => sum + d.value * COMPOSITE_WEIGHTS[i], 0)
  );

  return (
    <div className="flex flex-col gap-8">
      <SectionHeader title="Modale ScoreDashboard" description="Modale fullscreen con createPortal su document.body. Toggle PizzaNerd per dati scientifici, 5 ScoreRing, composite score con pesi. Clicca per aprire!" />

      <SubSectionLabel label="Panoramica" />
      <Panoramica
        descrizione="La modale ScoreDashboard è un overlay fullscreen (createPortal su document.body, z-index 9999) che mostra i 5 assi del composite score, il radar chart pentagonale, e il toggle PizzaNerd per i dati scientifici."
        principi={[
          "createPortal su document.body con position: fixed e z-index: 9999",
          "5 ScoreRing con colore per tier + composite score pesato",
          "Toggle PizzaNerd: AnimatePresence height: auto per expand",
        ]}
      />

      <SubSectionLabel label="Specifiche" />

      <div className="surface-card p-5">
        <span className="type-label" style={{ color: "var(--text-default)", fontSize: "var(--font-size-base)" }}>Apri la modale (demo inline, non portal)</span>
        <div className="mt-3 flex gap-3">
          <motion.button onClick={() => setModalOpen(true)} style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "10px 20px", borderRadius: "0.75rem", background: "var(--primary)", color: "var(--primary-foreground)", fontFamily: "'DM Sans', sans-serif", fontSize: "var(--font-size-md)", fontWeight: "var(--weight-semibold)" as any, letterSpacing: "var(--tracking-caps)", textTransform: "uppercase", border: "none", cursor: "pointer", outline: "none" }} className="active:scale-95 transition-transform">
            <FlaskConical size={14} />Score Dashboard
          </motion.button>
        </div>
      </div>

      <AnimatePresence>
        {modalOpen && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ type: "spring", stiffness: 400, damping: 25 }} className="rounded-2xl overflow-hidden" style={{ background: "var(--surface-container-lowest)", border: "1px solid var(--outline-variant)", boxShadow: "var(--shadow-lg)" }}>
            {/* Modal header */}
            <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid var(--outline-variant)", background: "color-mix(in srgb, var(--container-page) 92%, transparent)" }}>
              <div className="flex items-center gap-3">
                <FlaskConical size={18} style={{ color: "var(--primary)" }} />
                <span style={{ fontFamily: "'Playfair Display', serif", fontSize: "var(--font-size-5xl)", fontWeight: "var(--weight-bold)" as any, color: "var(--text-default)" }}>Score Dashboard</span>
              </div>
              <div className="flex items-center gap-3">
                <motion.button onClick={() => setNerdMode(!nerdMode)} className="flex items-center gap-2 px-3 py-1.5 rounded-lg active:scale-95 transition-transform" style={{ background: nerdMode ? "color-mix(in srgb, var(--primary) 15%, transparent)" : "var(--surface-container)", border: nerdMode ? "1px solid var(--primary)" : "1px solid var(--outline-variant)", fontFamily: "'DM Sans', sans-serif", fontSize: "var(--font-size-lg)", fontWeight: "var(--weight-semibold)" as any, color: nerdMode ? "var(--primary)" : "var(--muted-foreground)", cursor: "pointer", outline: "none", letterSpacing: "var(--tracking-label)", textTransform: "uppercase" }}>
                  <FlaskConical size={12} />PizzaNerd
                </motion.button>
                <motion.button onClick={() => setModalOpen(false)} className="w-8 h-8 rounded-lg flex items-center justify-center active:scale-[0.85] transition-transform" style={{ background: "var(--surface-container)", color: "var(--muted-foreground)", border: "1px solid var(--outline-variant)", cursor: "pointer", outline: "none" }} aria-label="Chiudi modale">
                  <X size={16} />
                </motion.button>
              </div>
            </div>

            {/* Modal body */}
            <div className="p-5">
              <div className="flex items-center justify-center mb-5">
                <div className="flex flex-col items-center gap-2">
                  <MiniRing score={composite} label="Composite" color="var(--primary)" size={80} />
                  <div className="flex gap-1 mt-1">
                    <span className="type-data" style={{ fontSize: "var(--font-size-lg)", fontWeight: "var(--weight-semibold)" as any, padding: "2px 8px", borderRadius: "6px", background: composite >= 80 ? "color-mix(in srgb, var(--cta) 15%, transparent)" : composite >= 60 ? "color-mix(in srgb, var(--tertiary) 15%, transparent)" : "color-mix(in srgb, var(--warm-sienna) 15%, transparent)", color: composite >= 80 ? "var(--cta)" : composite >= 60 ? "var(--tertiary)" : "var(--warm-sienna)" }}>
                      {composite >= 80 ? "Ottimo" : composite >= 60 ? "Buono" : "Sfidante"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap justify-center gap-4 mb-5">
                {SCORE_DIMS.map((d) => <MiniRing key={d.key} score={d.value} label={d.short} color={d.color} />)}
              </div>

              <div className="p-4 rounded-xl" style={{ background: "var(--surface-container)", border: "1px solid var(--outline-variant)" }}>
                <span className="type-label" style={{ color: "var(--text-default)", fontSize: "var(--font-size-base)", display: "block", marginBottom: "8px" }}>Formula Composite</span>
                <div className="flex flex-col gap-1.5">
                  {SCORE_DIMS.map((d, i) => (
                    <div key={d.key} className="flex items-center gap-2">
                      <span className="type-data" style={{ color: d.color, fontWeight: "var(--weight-semibold)" as any, width: "28px", flexShrink: 0 }}>{d.short}</span>
                      <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: "var(--surface-container-high)" }}>
                        <motion.div className="h-full rounded-full" initial={{ width: 0 }} animate={{ width: `${d.value}%` }} transition={{ type: "spring", stiffness: 220, damping: 25, delay: i * 0.1 }} style={{ background: d.color }} />
                      </div>
                      <span className="type-code" style={{ color: "var(--muted-foreground)", fontFeatureSettings: "'tnum'", width: "70px", flexShrink: 0, textAlign: "right" }}>{d.value} x {COMPOSITE_WEIGHTS[i]}</span>
                    </div>
                  ))}
                </div>
              </div>

              <AnimatePresence>
                {nerdMode && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ type: "spring", stiffness: 400, damping: 25 }} className="overflow-hidden">
                    <div className="mt-4 p-4 rounded-xl" style={{ background: "color-mix(in srgb, var(--primary) 5%, var(--surface-container-lowest))", border: "1px solid var(--primary)", borderStyle: "dashed" }}>
                      <div className="flex items-center gap-2 mb-3">
                        <FlaskConical size={14} style={{ color: "var(--primary)" }} />
                        <span className="type-code" style={{ fontWeight: "var(--weight-semibold)" as any, color: "var(--primary)", letterSpacing: "var(--tracking-label)", textTransform: "uppercase" }}>Dati Scientifici</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {NERD_DATA.map((d) => (
                          <div key={d.label} className="flex justify-between py-1.5" style={{ borderBottom: "1px solid var(--outline-variant)" }}>
                            <span className="type-data" style={{ color: "var(--muted-foreground)" }}>{d.label}</span>
                            <span className="type-data" style={{ fontWeight: "var(--weight-semibold)" as any, color: "var(--text-default)", fontFeatureSettings: "'tnum'" }}>{d.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══ RADAR CHART SPECIMEN ═══ */}
      <div className="surface-card p-5">
        <span className="type-label" style={{ color: "var(--text-default)", fontSize: "var(--font-size-base)" }}>RadarChart — Pentagono editoriale con gradiente (PizzaNerd mode)</span>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "var(--font-size-lg)", lineHeight: "var(--leading-relaxed)", color: "var(--muted-foreground)", marginTop: "4px", marginBottom: "16px" }}>
          SVG custom con fill gradiente, glow filter, halo sui vertici e score per asse. Visibile in nerd mode nella ScoreDashboard.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-10">
          {/* Radar chart */}
          <div className="flex-shrink-0">
            <DSRadarChart dims={SCORE_DIMS} size={220} />
          </div>

          {/* Dimension legend + bars */}
          <div className="flex-1 min-w-0 w-full flex flex-col gap-3">
            {SCORE_DIMS.map((d, i) => (
              <div key={d.key} className="flex items-center gap-2.5">
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: d.color }} />
                <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "var(--font-size-md)", fontWeight: "var(--weight-medium)" as any, color: "var(--text-default)", width: "100px", flexShrink: 0 }}>
                  {d.label}
                </span>
                <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "var(--surface-container-high)" }}>
                  <motion.div
                    className="h-full rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${d.value}%` }}
                    transition={{ type: "spring", stiffness: 220, damping: 25, delay: 0.1 + i * 0.06 }}
                    style={{ background: d.color }}
                  />
                </div>
                <span className="type-code" style={{ color: d.color, fontWeight: "var(--weight-bold)" as any, fontFeatureSettings: "'tnum'", width: "28px", textAlign: "right", flexShrink: 0 }}>
                  {d.value}
                </span>
              </div>
            ))}
            <div className="flex items-center gap-2 mt-2 pt-2" style={{ borderTop: "1px solid var(--outline-variant)" }}>
              <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "var(--font-size-base)", fontWeight: "var(--weight-semibold)" as any, color: "var(--muted-foreground)" }}>
                Composite
              </span>
              <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "var(--font-size-lg)", fontWeight: "var(--weight-bold)" as any, fontFeatureSettings: "'tnum'", color: "var(--text-default)" }}>
                {composite}
              </span>
              <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "var(--font-size-base)", color: "var(--muted-foreground)" }}>
                = Σ(asse × peso)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Radar anatomy */}
      <div className="surface-card p-5">
        <span className="type-label" style={{ color: "var(--text-default)", fontSize: "var(--font-size-base)" }}>Anatomia RadarChart</span>
        <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { prop: "Tipo", val: "SVG pentagono custom (no Recharts)" },
            { prop: "Fill", val: "linearGradient primary→tertiary 18%→8% opacity" },
            { prop: "Stroke", val: "linearGradient primary→tertiary→cta" },
            { prop: "Glow", val: "feGaussianBlur stdDev 3 + feMerge" },
            { prop: "Grid", val: "4 livelli (25/50/75/100) outline-variant" },
            { prop: "Spokes", val: "Dashed lines 0.5px opacity 0.25" },
            { prop: "Dots", val: "r=3.5 con halo r=8 opacity 0.1" },
            { prop: "Labels", val: "DM Sans 7px short + 7.5px value colorato" },
            { prop: "Center", val: "Composite 20px + COMPOSITE 5.5px tracking" },
            { prop: "Entrance", val: "scale 0.5→1 dur 0.7s ease [0.16,1,0.3,1]" },
            { prop: "Dots anim", val: "spring stiffness 400 damping 20 + stagger" },
            { prop: "Size default", val: "180px (sidebar) / 200px (bottom sheet)" },
          ].map((a) => <AnatomyRow key={a.prop} {...a} />)}
        </div>
      </div>

      <div className="surface-card p-5">
        <span className="type-label" style={{ color: "var(--text-default)", fontSize: "var(--font-size-base)" }}>Note implementazione</span>
        <div className="mt-3 flex flex-col gap-2">
          {[
            { prop: "Rendering", val: "createPortal(node, document.body)" },
            { prop: "Position", val: "position: fixed; inset: 0; z-index: 9999" },
            { prop: "Backdrop", val: "rgba(0,0,0,0.6) con AnimatePresence" },
            { prop: "Close trigger", val: "Escape key + click backdrop + bottone X" },
            { prop: "PizzaNerd toggle", val: "AnimatePresence height: auto per expand" },
            { prop: "RadarChart", val: "Recharts RadarChart a 5 assi (solo in nerd mode)" },
            { prop: "Score colori", val: ">= 80 cta, >= 60 tertiary, < 60 sienna, < 40 destructive" },
            { prop: "Inline styles", val: "Obbligatori per position/z-index nel portal" },
          ].map((a) => (
            <div key={a.prop} className="flex items-center gap-3 p-2.5 rounded-lg" style={{ background: "var(--surface-container)" }}>
              <span className="type-data" style={{ color: "var(--primary)", fontWeight: "var(--weight-semibold)" as any, width: "110px", flexShrink: 0 }}>{a.prop}</span>
              <span className="type-data" style={{ color: "var(--muted-foreground)" }}>{a.val}</span>
            </div>
          ))}
        </div>
      </div>

      <SubSectionLabel label="Linee guida" />
      <LineeGuida
        fai={[
          "createPortal su document.body — mai renderizzare la modale inline",
          "Escape key chiude la modale — handler globale su keydown",
          "PizzaNerd toggle con AnimatePresence height: auto per expand fluido",
        ]}
        nonFare={[
          "Mai classi Tailwind per position/z-index nel portal — solo inline styles",
          "Mai modale senza backdrop dismissible — click fuori per chiudere",
          "Mai mostrare i dati scientifici di default — sono per PizzaNerd",
        ]}
      />

      <SubSectionLabel label="Accessibilità" />
      <AccessibilitaInfo items={[
        { label: "Focus trap", desc: "Il focus resta nella modale. Escape chiude. Focus restituito al trigger." },
        { label: "ARIA", desc: "role='dialog', aria-modal='true', aria-labelledby sul titolo." },
        { label: "Reduced motion", desc: "Le animazioni ScoreRing e radar diventano istantanee con prefers-reduced-motion." },
      ]} />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   ENTRIES REGISTRY
   ═══════════════════════════════════════════════════════════ */
export const ENTRIES: SectionEntry[] = [
  { id: "navbar", label: "NavigationBar", group: "c", Component: NavigationBarSpec },
  { id: "bottomsheet", label: "BottomSheet", group: "c", Component: BottomSheetSpec },
  { id: "modal", label: "Modale ScoreDashboard", group: "c", Component: ModalScoreDashboardSpec },
];