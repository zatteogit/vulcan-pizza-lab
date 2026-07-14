import { useState } from "react";
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
import { SCORE_DIMENSION_COLORS } from "../../features/recipe/score-dimension-presentation";
import { toShowcaseCssValue } from "./showcase-style";
import { showcaseTransition } from "./showcase-motion";
import { showcaseMessage } from "../../i18n/showcase-messages";

/* ═══════════════════════════════════════════════════════════
   COMPONENT SPEC SHEETS C11–C13
   ═══════════════════════════════════════════════════════════ */

/* ── Shared nav items data ── */
const NAV_DEMO_ITEMS = [
  { id: "home", label: showcaseMessage("components.design-system.components-c.configura-e4c15bac"), icon: Home },
  { id: "styles", label: showcaseMessage("components.design-system.components-c.stili-ad1a9b2f"), icon: ChefHat },
  { id: "recipe", label: showcaseMessage("components.design-system.components-c.ricetta-b120bce5"), icon: Flame },
  { id: "score", label: showcaseMessage("components.design-system.components-c.score-489f4877"), icon: Star },
  { id: "settings", label: showcaseMessage("components.design-system.components-c.opzioni-cb049918"), icon: Settings },
];

/* ═══ C11: NAVIGATION BAR ═══ */
function NavigationBarSpec() {
  const [activeNavDesktop, setActiveNavDesktop] = useState("home");
  const [activeNavMobile, setActiveNavMobile] = useState("home");
  const ActiveMobileIcon = NAV_DEMO_ITEMS.find((item) => item.id === activeNavMobile)?.icon || Home;

  return (
    <div className="flex flex-col gap-8">
      <SectionHeader title={showcaseMessage("components.design-system.components-c.navigationbar-a4e44bf4")} description={showcaseMessage("components.design-system.components-c.header-glassmorphism-sticky-bottom-nav-mob-e7187b32")} />

      <SubSectionLabel label={showcaseMessage("components.design-system.components-c.panoramica-f38c9a27")} />
      <Panoramica
        descrizione={showcaseMessage("components.design-system.components-c.la-navigationbar-ha-due-forme-desktop-head-a0101298")}
        principi={[
          showcaseMessage("components.design-system.components-c.desktop-glassmorphism-con-blur-24px-satura-67222b2e"),
          showcaseMessage("components.design-system.components-c.mobile-bottom-bar-da-56px-con-pill-animata-a987d15c"),
          showcaseMessage("components.design-system.components-c.active-state-spring-stiffness-500-damping--34580773"),
        ]}
      />

      <SubSectionLabel label={showcaseMessage("components.design-system.components-c.specifiche-057caf2f")} />

      {/* Desktop glassmorphism header */}
      <div className="surface-card overflow-hidden">
        <span className="px-5 pt-4 block type-label dsx-s-e2184fadc0">{showcaseMessage("components.design-system.components-c.desktop-header-glassmorphism-clicca-le-voc-89c7ac7b")}</span>
        <div className="p-4">
          <div className="relative h-48 rounded-2xl overflow-hidden dsx-s-dd7e961eb3">
            <div className="absolute inset-0 dsx-s-70235858c8" />
            <div className="absolute inset-0 flex items-center justify-center dsx-s-cc241c410e">
              <span className="dsx-s-98a6709479">{showcaseMessage("components.design-system.components-c.vulcan-91cbb945")}</span>
            </div>

            <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-5 dsx-s-df6477072b">
              <div className="flex items-center gap-2">
                <Flame size={16} className="dsx-s-b0e08465c2" />
                <span className="dsx-s-bc57fde045">{showcaseMessage("components.design-system.components-c.vulcan-91cbb945")}</span>
              </div>
              <div className="flex items-center gap-1 min-w-0">
                {NAV_DEMO_ITEMS.map((item) => {
                  const isActive = activeNavDesktop === item.id;
                  const Icon = item.icon;
                  return (
                    <motion.button key={item.id} aria-label={item.label} onClick={() => setActiveNavDesktop(item.id)} className="relative min-w-0 flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg active:scale-95 transition-transform dsx-s-c0822b8a9c" style={{ "--dsx-font-weight": toShowcaseCssValue(isActive ? "var(--weight-semibold)" as any : "var(--weight-medium)" as any, true), "--dsx-color": toShowcaseCssValue(isActive ? "var(--primary)" : "var(--muted-foreground)", false) } as any}>
                      {isActive && <motion.div layoutId="desktopNavIndicator" className="absolute inset-0 rounded-lg dsx-s-4adb40b1ce" transition={showcaseTransition.preset_92ae1485eb} />}
                      <Icon size={14} className="dsx-s-87d571f988" />
                      <span className="hidden sm:inline dsx-s-87d571f988">{item.label}</span>
                    </motion.button>
                  );
                })}
              </div>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center dsx-s-4adb40b1ce">
                <Moon size={14} className="dsx-s-b0e08465c2" />
              </div>
            </div>

            <div className="absolute bottom-4 left-5">
              <AnimatePresence mode="wait">
                <motion.span key={activeNavDesktop} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={showcaseTransition.preset_0e2957ab5e} className="dsx-s-701db07206">
                  {NAV_DEMO_ITEMS.find((n) => n.id === activeNavDesktop)?.label}
                </motion.span>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile bottom navigation */}
      <div className="surface-card overflow-hidden">
        <span className="px-5 pt-4 block type-label dsx-s-e2184fadc0">{showcaseMessage("components.design-system.components-c.mobile-bottom-navigation-clicca-le-icone-beb102c5")}</span>
        <div className="p-4">
          <div className="relative rounded-2xl overflow-hidden mx-auto dsx-s-d9833540e2">
            <div className="absolute inset-0 flex items-center justify-center dsx-s-6764617153">
              <AnimatePresence mode="wait">
                <motion.div key={activeNavMobile} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={showcaseTransition.preset_0e2957ab5e} className="flex flex-col items-center gap-1">
                  <ActiveMobileIcon size={28} className="ds-showcase__mobile-active-icon" />
                  <span className="dsx-s-7479dcc07d">
                    {NAV_DEMO_ITEMS.find((n) => n.id === activeNavMobile)?.label}
                  </span>
                </motion.div>
              </AnimatePresence>
            </div>
            <div className="absolute bottom-0 left-0 right-0 flex items-center justify-around dsx-s-ec63b8a55a">
              {NAV_DEMO_ITEMS.map((item) => {
                const isActive = activeNavMobile === item.id;
                const Icon = item.icon;
                return (
                  <motion.button key={item.id} onClick={() => setActiveNavMobile(item.id)} className="flex flex-col items-center gap-0.5 relative active:scale-90 transition-transform dsx-s-38722adb6d">
                    <div className="relative">
                      {isActive && <motion.div layoutId="mobileNavPill" className="absolute rounded-full dsx-s-6955e377ef" transition={showcaseTransition.preset_92ae1485eb} />}
                      <Icon size={18} style={{ "--dsx-color": toShowcaseCssValue(isActive ? "var(--primary)" : "var(--muted-foreground)", false) } as any} className="dsx-s-48f384d2ad" />
                    </div>
                    <span style={{ "--dsx-font-weight": toShowcaseCssValue(isActive ? "var(--weight-semibold)" as any : "var(--weight-regular)" as any, true), "--dsx-color": toShowcaseCssValue(isActive ? "var(--primary)" : "var(--muted-foreground)", false) } as any} className="dsx-s-f7b43d2dbc">{item.label}</span>
                  </motion.button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="surface-card p-5">
        <span className="type-label dsx-s-e2184fadc0">{showcaseMessage("components.design-system.components-c.specifiche-navigationbar-0d8c0276")}</span>
        <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { prop: showcaseMessage("components.design-system.components-c.glassmorphism-c59c13af"), val: showcaseMessage("components.design-system.components-c.color-mix-bg-88-blur-24px-sat-1-6-a9b4bd5c") },
            { prop: showcaseMessage("components.design-system.components-c.border-5d10d3f4"), val: showcaseMessage("components.design-system.components-c.1px-solid-var-border-muted-8edc4248") },
            { prop: showcaseMessage("components.design-system.components-c.active-indicator-272bf550"), val: showcaseMessage("components.design-system.components-c.color-mix-primary-10-layoutid-a80fcb74") },
            { prop: showcaseMessage("components.design-system.components-c.font-active-09aa1673"), val: showcaseMessage("components.design-system.components-c.dm-sans-600-4181d1a5") },
            { prop: showcaseMessage("components.design-system.components-c.font-inactive-7b850152"), val: showcaseMessage("components.design-system.components-c.dm-sans-500-muted-fg-c8ad0970") },
            { prop: showcaseMessage("components.design-system.components-c.icon-size-7a6728bd"), val: showcaseMessage("components.design-system.components-c.desktop-14px-mobile-18px-b20928c1") },
            { prop: showcaseMessage("components.design-system.components-c.mobile-height-86657294"), val: "56px" },
            { prop: showcaseMessage("components.design-system.components-c.transition-4ead496f"), val: showcaseMessage("components.design-system.components-c.spring-stiffness-500-damping-30-042fc96b") },
          ].map((a) => <AnatomyRow key={a.prop} {...a} />)}
        </div>
      </div>

      <SubSectionLabel label={showcaseMessage("components.design-system.components-c.linee-guida-b43417d1")} />
      <LineeGuida
        fai={[
          showcaseMessage("components.design-system.components-c.desktop-glassmorphism-con-backdrop-filter--e5c92007"),
          showcaseMessage("components.design-system.components-c.mobile-bottom-nav-da-56px-con-pill-animata-dad95580"),
          showcaseMessage("components.design-system.components-c.active-state-sempre-con-indicatore-visivo--100bce62"),
        ]}
        nonFare={[
          showcaseMessage("components.design-system.components-c.mai-piu-di-5-voci-nella-navigation-oltre-u-f8fafe05"),
          showcaseMessage("components.design-system.components-c.mai-omettere-la-bottom-nav-su-mobile-e-il--4a9de85a"),
          showcaseMessage("components.design-system.components-c.mai-animare-l-indicatore-con-css-transitio-84d63568"),
        ]}
        responsive={showcaseMessage("components.design-system.components-c.desktop-header-orizzontale-sticky-mobile-6-870de7ee")}
      />

      <SubSectionLabel label={showcaseMessage("components.design-system.components-c.accessibilita-e59811a6")} />
      <AccessibilitaInfo items={[
        { label: "ARIA", desc: showcaseMessage("components.design-system.components-c.nav-con-aria-label-navigazione-principale--d2e8c166") },
        { label: showcaseMessage("components.design-system.components-c.tastiera-d99ab9ca"), desc: showcaseMessage("components.design-system.components-c.tab-per-navigare-tra-le-voci-enter-space-p-82ddd4ab") },
        { label: showcaseMessage("components.design-system.components-c.focus-fe7f55b8"), desc: showcaseMessage("components.design-system.components-c.focus-ring-3px-primary-su-focus-visible-mo-2749b4b1") },
      ]} />
    </div>
  );
}

/* ═══ C12: BOTTOM SHEET ═══ */
const SNAP_HEIGHTS: Record<string, string> = { peek: "25%", half: "50%", full: "85%" };
const SNAP_SPECS = [
  { name: showcaseMessage("components.design-system.components-c.peek-b4068697"), height: "25%", use: "Anteprima, drag-to-expand", color: "var(--secondary)" },
  { name: showcaseMessage("components.design-system.components-c.half-45d31208"), height: "50%", use: "Default, contenuto principale", color: "var(--primary)" },
  { name: showcaseMessage("components.design-system.components-c.full-10b28a8c"), height: "85%", use: "Lista lunga, dettaglio completo", color: "var(--cta)" },
];

function BottomSheetSpec() {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetSnap, setSheetSnap] = useState<"peek" | "half" | "full">("half");

  return (
    <div className="flex flex-col gap-8">
      <SectionHeader title={showcaseMessage("components.design-system.components-c.bottomsheet-0271e6b3")} description={showcaseMessage("components.design-system.components-c.sheet-modale-dal-basso-con-3-snap-point-pe-2ce868e5")} />

      <SubSectionLabel label={showcaseMessage("components.design-system.components-c.panoramica-f38c9a27")} />
      <Panoramica
        descrizione={showcaseMessage("components.design-system.components-c.il-bottomsheet-e-una-modale-dal-basso-con--554b1983")}
        principi={[
          showcaseMessage("components.design-system.components-c.3-snap-point-peek-anteprima-half-default-f-3bb4c074"),
          showcaseMessage("components.design-system.components-c.spring-physics-stiffness-400-damping-30-pe-3618d2f4"),
          showcaseMessage("components.design-system.components-c.backdrop-rgba-0-0-0-0-35-con-click-to-dism-cbb6282d"),
        ]}
      />

      <SubSectionLabel label={showcaseMessage("components.design-system.components-c.specifiche-057caf2f")} />

      <div className="surface-card overflow-hidden">
        <span className="px-5 pt-4 block type-label dsx-s-e2184fadc0">{showcaseMessage("components.design-system.components-c.demo-interattiva-apri-e-cambia-snap-point-23197ecc")}</span>
        <div className="p-4">
          <div className="flex gap-2 mb-4">
            <motion.button onClick={() => { setSheetOpen(true); setSheetSnap("half"); }} className="active:scale-95 transition-transform dsx-s-4d6b9e0684">
              <Maximize2 size={14} />{showcaseMessage("components.design-system.components-c.apri-sheet-9c0d9343")}</motion.button>
            {sheetOpen && (
              <motion.button initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} onClick={() => setSheetOpen(false)} className="active:scale-95 transition-transform dsx-s-a427a0ad81">
                <Minimize2 size={14} />{showcaseMessage("components.design-system.components-c.chiudi-0f9a273d")}</motion.button>
            )}
          </div>

          <div className="relative rounded-2xl overflow-hidden mx-auto dsx-s-ede4eee567">
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-6">
              <Flame size={32} className="dsx-s-e8013486fb" />
              <span className="dsx-s-ce431cb540">{showcaseMessage("components.design-system.components-c.pagina-app-06accd15")}</span>
            </div>

            <AnimatePresence>
              {sheetOpen && <motion.button type="button" aria-label={showcaseMessage("components.design-system.components-c.chiudi-anteprima-sheet-12a7c2f5")} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={showcaseTransition.preset_746cec39f1} className="absolute inset-0 dsx-s-b258cf3338" onClick={() => setSheetOpen(false)} />}
            </AnimatePresence>

            <AnimatePresence>
              {sheetOpen && (
                <motion.div initial={{ y: "100%" }} animate={{ y: `${100 - parseInt(SNAP_HEIGHTS[sheetSnap])}%` }} exit={{ y: "100%" }} transition={showcaseTransition.preset_9fd73d3829} className="absolute bottom-0 left-0 right-0 rounded-t-2xl dsx-s-e532bcf0ac">
                  <div className="flex justify-center py-3">
                    <div className="rounded-full dsx-s-b12837fb24" />
                  </div>
                  <div className="px-4 mb-3">
                    <div className="flex gap-1.5">
                      {(["peek", "half", "full"] as const).map((snap) => (
                        <motion.button key={snap} onClick={() => setSheetSnap(snap)} style={{ "--dsx-background": toShowcaseCssValue(sheetSnap === snap ? "var(--primary)" : "var(--surface-container)", false), "--dsx-color": toShowcaseCssValue(sheetSnap === snap ? "var(--primary-foreground)" : "var(--muted-foreground)", false) } as any} className="active:scale-95 transition-transform dsx-s-36010876f9">
                          {snap}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                  <div className="px-4 overflow-y-auto dsx-s-2cecbc0182">
                    <div className="flex flex-col gap-1 mb-3">
                      <span className="dsx-s-b4f5b7135b">{showcaseMessage("components.design-system.components-c.dettagli-ricetta-7877e8aa")}</span>
                      <span className="dsx-s-b4252559c3">{showcaseMessage("components.design-system.components-c.napoletana-stg-4-panetti-da-250g-fbe2c72e")}</span>
                    </div>
                    {[
                      { label: showcaseMessage("components.design-system.components-c.farina-718e862c"), value: "600g W280" },
                      { label: showcaseMessage("components.design-system.components-c.acqua-f3128966"), value: "366g (61%)" },
                      { label: showcaseMessage("components.design-system.components-c.sale-0028d743"), value: "18g (3%)" },
                      { label: showcaseMessage("components.design-system.components-c.lievito-e6b263a4"), value: "0.3g fresco" },
                    ].map((row) => (
                      <div key={row.label} className="flex justify-between py-2 dsx-s-ff83771d47">
                        <span className="dsx-s-1d01913364">{row.label}</span>
                        <span className="dsx-s-43d9599c66">{row.value}</span>
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
        <span className="type-label dsx-s-e2184fadc0">{showcaseMessage("components.design-system.components-c.snap-points-d4f08c94")}</span>
        <div className="mt-3 grid grid-cols-3 gap-3">
          {SNAP_SPECS.map((s) => (
            <div key={s.name} className="flex flex-col items-center gap-2">
              <div className="relative rounded-lg overflow-hidden dsx-s-5ed064feeb">
                <div className="absolute bottom-0 left-0 right-0 rounded-t-lg dsx-s-456f5d4c36" style={{ "--dsx-height": toShowcaseCssValue(s.height, false), "--dsx-background": toShowcaseCssValue(s.color, false) } as any} />
                <div className="absolute bottom-0 left-0 right-0 rounded-t-lg dsx-s-e5007dabdf" style={{ "--dsx-height": toShowcaseCssValue(s.height, false), "--dsx-border": toShowcaseCssValue(`2px solid ${s.color}`, false) } as any} />
              </div>
              <div className="text-center">
                <div className="type-code dsx-s-24d7245ee0">{s.name}</div>
                <div className="type-code dsx-s-fca6c4bf5b" style={{ "--dsx-color": toShowcaseCssValue(s.color, false) } as any}>{s.height}</div>
                <div className="type-code dsx-s-63782726c0">{s.use}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="surface-card p-5">
        <span className="type-label dsx-s-e2184fadc0">{showcaseMessage("components.design-system.components-c.anatomia-bottomsheet-3c323bac")}</span>
        <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { prop: showcaseMessage("components.design-system.components-c.background-64dd60fe"), val: "var(--surface-container-lowest)" },
            { prop: showcaseMessage("components.design-system.components-c.radius-e5aaeaac"), val: showcaseMessage("components.design-system.components-c.rounded-t-2xl-1e3a8aa7") },
            { prop: showcaseMessage("components.design-system.components-c.handle-c0392b2b"), val: showcaseMessage("components.design-system.components-c.32-4px-outline-variant-rounded-full-3ba1ce80") },
            { prop: showcaseMessage("components.design-system.components-c.backdrop-d4f5e938"), val: showcaseMessage("components.design-system.components-c.rgba-0-0-0-0-35-4ac867a4") },
            { prop: showcaseMessage("components.design-system.components-c.entrance-aa4bbfb3"), val: showcaseMessage("components.design-system.components-c.spring-stiffness-400-damping-30-54195706") },
            { prop: showcaseMessage("components.design-system.components-c.snap-anim-368ec5bc"), val: showcaseMessage("components.design-system.components-c.spring-stiffness-400-damping-30-54195706") },
            { prop: showcaseMessage("components.design-system.components-c.border-5d10d3f4"), val: showcaseMessage("components.design-system.components-c.1px-solid-outline-variant-611c0f4d") },
            { prop: showcaseMessage("components.design-system.components-c.z-index-dd347916"), val: showcaseMessage("components.design-system.components-c.2-sheet-1-backdrop-cca175a5") },
          ].map((a) => <AnatomyRow key={a.prop} {...a} />)}
        </div>
      </div>

      <SubSectionLabel label={showcaseMessage("components.design-system.components-c.linee-guida-b43417d1")} />
      <LineeGuida
        fai={[
          showcaseMessage("components.design-system.components-c.default-snap-a-half-il-contenuto-principal-6b801332"),
          showcaseMessage("components.design-system.components-c.drag-handle-visibile-e-riconoscibile-32-4p-ba5e3357"),
          showcaseMessage("components.design-system.components-c.backdrop-click-chiude-lo-sheet-pattern-uni-7de8849d"),
        ]}
        nonFare={[
          showcaseMessage("components.design-system.components-c.mai-sheet-senza-backdrop-l-utente-perde-co-bc63f4b3"),
          showcaseMessage("components.design-system.components-c.mai-animazioni-con-duration-ease-sempre-sp-7a27e155"),
          showcaseMessage("components.design-system.components-c.mai-contenuto-scrollabile-senza-indicatore-e7588039"),
        ]}
        comportamento={showcaseMessage("components.design-system.components-c.lo-sheet-si-apre-con-spring-400-30-snap-po-f1748ca5")}
      />

      <SubSectionLabel label={showcaseMessage("components.design-system.components-c.accessibilita-e59811a6")} />
      <AccessibilitaInfo items={[
        { label: "ARIA", desc: showcaseMessage("components.design-system.components-c.role-dialog-con-aria-modal-true-aria-label-cc95d171") },
        { label: showcaseMessage("components.design-system.components-c.focus-trap-f835888b"), desc: showcaseMessage("components.design-system.components-c.il-focus-resta-dentro-lo-sheet-quando-aper-20639421") },
        { label: showcaseMessage("components.design-system.components-c.backdrop-d4f5e938"), desc: showcaseMessage("components.design-system.components-c.il-backdrop-ha-aria-hidden-true-non-e-focu-7fdba960") },
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
  color: SCORE_DIMENSION_COLORS[d.key],
  value: DEMO_VALUES[d.key] ?? 50,
}));

const NERD_DATA = [
  { label: showcaseMessage("components.design-system.components-c.lievito-baker-s-99de8d67"), value: "0.08%" },
  { label: showcaseMessage("components.design-system.components-c.ore-equiv-18-c-2d150831"), value: "28.5h" },
  { label: showcaseMessage("components.design-system.components-c.fodmap-reduction-e56df8d4"), value: "72%" },
  { label: showcaseMessage("components.design-system.components-c.gluten-network-92b85f0c"), value: "84/100" },
  { label: showcaseMessage("components.design-system.components-c.water-activity-58656c0a"), value: "0.975" },
  { label: showcaseMessage("components.design-system.components-c.q10-model-b5c7d9e3"), value: "standard (2.0)" },
  { label: showcaseMessage("components.design-system.components-c.p-l-stimato-a883b4f2"), value: "0.62" },
  { label: showcaseMessage("components.design-system.components-c.energia-cottura-77dae075"), value: "2400 kJ" },
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
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="dsx-s-66a84ce714">
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
        transition={showcaseTransition.preset_fa16ce2ca3}
        style={{ "--dsx-transform-origin": toShowcaseCssValue(`${ctr}px ${ctr}px`, false) } as any} className="dsx-s-17a2bf811c"
      />

      {/* Data points with halo + labels */}
      {dims.map((d, i) => {
        const p = getPoint(i, d.value);
        const labelP = getPoint(i, 116);
        const scoreP = getPoint(i, 130);
        return (
          <g key={d.key}>
            <motion.circle cx={p.x} cy={p.y} r={9} fill={d.color} opacity={0.1} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={showcaseTransition.dynamic_333dc7ddb9(0.3 + i * 0.06)} />
            <motion.circle cx={p.x} cy={p.y} r={4} fill={d.color} stroke="var(--container-page)" strokeWidth={1.5} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={showcaseTransition.dynamic_41f54c1acf(0.3 + i * 0.06)} />
            <text x={labelP.x} y={labelP.y} textAnchor="middle" dominantBaseline="central" fill="var(--muted-foreground)" fontSize="8" fontWeight="600" fontFamily="'DM Sans', sans-serif" letterSpacing="0.04em">{d.short}</text>
            <text x={scoreP.x} y={scoreP.y} textAnchor="middle" dominantBaseline="central" fill={d.color} fontSize="9" fontWeight="700" fontFamily="'DM Sans', sans-serif" className="dsx-s-d4eef84bc9">{d.value}</text>
          </g>
        );
      })}

      {/* Center composite */}
      <text x={ctr} y={ctr - 5} textAnchor="middle" dominantBaseline="central" fill="var(--text-default)" fontSize="24" fontWeight="700" fontFamily="'DM Sans', sans-serif" className="dsx-s-d4eef84bc9">
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
      <div className="relative dsx-s-43f9590b73" style={{ "--dsx-width": toShowcaseCssValue(size, false), "--dsx-height": toShowcaseCssValue(size, false) } as any}>
        <svg width={size} height={size} className="dsx-s-a6d87bd8e8">
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--surface-container)" strokeWidth={sw} />
          <motion.circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={sw} strokeDasharray={circ} strokeLinecap="round" initial={{ strokeDashoffset: circ }} animate={{ strokeDashoffset: off }} transition={showcaseTransition.preset_bd19e937db} />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span style={{ "--dsx-font-size": toShowcaseCssValue(size * 0.28, false), "--dsx-color": toShowcaseCssValue(color, false) } as any} className="dsx-s-99dfb3f7a9">{score}</span>
        </div>
      </div>
      <span className="dsx-s-5731e6e664">{label}</span>
    </div>
  );
}

function ModalScoreDashboardSpec() {
  const [modalOpen, setModalOpen] = useState(false);
  const [nerdMode, setNerdMode] = useState(false);

  const composite = Math.round(
    SCORE_DIMS.reduce((sum, d, i) => sum + d.value * COMPOSITE_WEIGHTS[i], 0)
  );

  return (
    <div className="flex flex-col gap-8">
      <SectionHeader title={showcaseMessage("components.design-system.components-c.modale-scoredashboard-7c0c7248")} description={showcaseMessage("components.design-system.components-c.modale-fullscreen-con-createportal-su-docu-7f665c6a")} />

      <SubSectionLabel label={showcaseMessage("components.design-system.components-c.panoramica-f38c9a27")} />
      <Panoramica
        descrizione={showcaseMessage("components.design-system.components-c.la-modale-scoredashboard-e-un-overlay-full-5fe9eee0")}
        principi={[
          showcaseMessage("components.design-system.components-c.createportal-su-document-body-con-position-17b68f5a"),
          showcaseMessage("components.design-system.components-c.5-scorering-con-colore-per-tier-composite--07961d5d"),
          showcaseMessage("components.design-system.components-c.toggle-pizzanerd-animatepresence-height-au-8267ecce"),
        ]}
      />

      <SubSectionLabel label={showcaseMessage("components.design-system.components-c.specifiche-057caf2f")} />

      <div className="surface-card p-5">
        <span className="type-label dsx-s-e2184fadc0">{showcaseMessage("components.design-system.components-c.apri-la-modale-demo-inline-non-portal-b1249cf8")}</span>
        <div className="mt-3 flex gap-3">
          <motion.button onClick={() => setModalOpen(true)} className="active:scale-95 transition-transform dsx-s-e5dad2a0c2">
            <FlaskConical size={14} />{showcaseMessage("components.design-system.components-c.score-dashboard-3510d97d")}</motion.button>
        </div>
      </div>

      <AnimatePresence>
        {modalOpen && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={showcaseTransition.preset_0e2957ab5e} className="rounded-2xl overflow-hidden dsx-s-c22d0a5da9">
            {/* Modal header */}
            <div className="flex items-center justify-between px-5 py-4 dsx-s-097046d006">
              <div className="flex items-center gap-3">
                <FlaskConical size={18} className="dsx-s-b0e08465c2" />
                <span className="dsx-s-701db07206">{showcaseMessage("components.design-system.components-c.score-dashboard-934a6df9")}</span>
              </div>
              <div className="flex items-center gap-3">
                <motion.button onClick={() => setNerdMode(!nerdMode)} className="flex items-center gap-2 px-3 py-1.5 rounded-lg active:scale-95 transition-transform dsx-s-5c0c7b9bda" style={{ "--dsx-background": toShowcaseCssValue(nerdMode ? "color-mix(in srgb, var(--primary) 15%, transparent)" : "var(--surface-container)", false), "--dsx-border": toShowcaseCssValue(nerdMode ? "1px solid var(--primary)" : "1px solid var(--outline-variant)", false), "--dsx-color": toShowcaseCssValue(nerdMode ? "var(--primary)" : "var(--muted-foreground)", false) } as any}>
                  <FlaskConical size={12} />{showcaseMessage("components.design-system.components-c.pizzanerd-2cc4b266")}</motion.button>
                <motion.button onClick={() => setModalOpen(false)} className="w-8 h-8 rounded-lg flex items-center justify-center active:scale-85 transition-transform dsx-s-58fb0dc3c7" aria-label={showcaseMessage("components.design-system.components-c.chiudi-modale-47cbcace")}>
                  <X size={16} />
                </motion.button>
              </div>
            </div>

            {/* Modal body */}
            <div className="p-5">
              <div className="flex items-center justify-center mb-5">
                <div className="flex flex-col items-center gap-2">
                  <MiniRing score={composite} label={showcaseMessage("components.design-system.components-c.composite-b9ec0f58")} color="var(--primary)" size={80} />
                  <div className="flex gap-1 mt-1">
                    <span className="type-data dsx-s-af20927263" style={{ "--dsx-background": toShowcaseCssValue(composite >= 80 ? "color-mix(in srgb, var(--cta) 15%, transparent)" : composite >= 60 ? "color-mix(in srgb, var(--tertiary) 15%, transparent)" : "color-mix(in srgb, var(--warm-sienna) 15%, transparent)", false), "--dsx-color": toShowcaseCssValue(composite >= 80 ? "var(--cta)" : composite >= 60 ? "var(--tertiary)" : "var(--warm-sienna)", false) } as any}>
                      {composite >= 80 ? showcaseMessage("components.design-system.components-c.ottimo-c8ffe957") : composite >= 60 ? showcaseMessage("components.design-system.components-c.buono-42d99a3b") : showcaseMessage("components.design-system.components-c.sfidante-a89eb9c3")}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap justify-center gap-4 mb-5">
                {SCORE_DIMS.map((d) => <MiniRing key={d.key} score={d.value} label={d.short} color={d.color} />)}
              </div>

              <div className="p-4 rounded-xl dsx-s-d1283e5581">
                <span className="type-label dsx-s-fba5b95080">{showcaseMessage("components.design-system.components-c.formula-composite-e8402d60")}</span>
                <div className="flex flex-col gap-1.5">
                  {SCORE_DIMS.map((d, i) => (
                    <div key={d.key} className="flex items-center gap-2">
                      <span className="type-data dsx-s-4267b1929f" style={{ "--dsx-color": toShowcaseCssValue(d.color, false) } as any}>{d.short}</span>
                      <div className="flex-1 h-2 rounded-full overflow-hidden dsx-s-cbebeffe46">
                        <motion.div className="h-full rounded-full dsx-s-fbecfa7efd" initial={{ width: 0 }} animate={{ width: `${d.value}%` }} transition={showcaseTransition.dynamic_492bf1a207(i * 0.1)} style={{ "--dsx-background": toShowcaseCssValue(d.color, false) } as any} />
                      </div>
                      <span className="type-code dsx-s-f09fd29fcd">{d.value} {showcaseMessage("components.design-system.components-c.x-93bb4c5d")}{COMPOSITE_WEIGHTS[i]}</span>
                    </div>
                  ))}
                </div>
              </div>

              <AnimatePresence>
                {nerdMode && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={showcaseTransition.preset_0e2957ab5e} className="overflow-hidden">
                    <div className="mt-4 p-4 rounded-xl dsx-s-9c9813744f">
                      <div className="flex items-center gap-2 mb-3">
                        <FlaskConical size={14} className="dsx-s-b0e08465c2" />
                        <span className="type-code dsx-s-85249e5767">{showcaseMessage("components.design-system.components-c.dati-scientifici-bbc190f2")}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {NERD_DATA.map((d) => (
                          <div key={d.label} className="flex justify-between py-1.5 dsx-s-ff83771d47">
                            <span className="type-data dsx-s-63782726c0">{d.label}</span>
                            <span className="type-data dsx-s-b381b2097b">{d.value}</span>
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
        <span className="type-label dsx-s-e2184fadc0">{showcaseMessage("components.design-system.components-c.radarchart-pentagono-editoriale-con-gradie-57975e13")}</span>
        <p className="dsx-s-1c219e8623">
          {showcaseMessage("components.design-system.components-c.svg-custom-con-fill-gradiente-glow-filter--155211bf")}</p>

        <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-10">
          {/* Radar chart */}
          <div className="flex-shrink-0">
            <DSRadarChart dims={SCORE_DIMS} size={220} />
          </div>

          {/* Dimension legend + bars */}
          <div className="flex-1 min-w-0 w-full flex flex-col gap-3">
            {SCORE_DIMS.map((d, i) => (
              <div key={d.key} className="flex items-center gap-2.5">
                <div className="w-2 h-2 rounded-full flex-shrink-0 dsx-s-fbecfa7efd" style={{ "--dsx-background": toShowcaseCssValue(d.color, false) } as any} />
                <span className="dsx-s-6372d58041">
                  {d.label}
                </span>
                <div className="flex-1 h-1.5 rounded-full overflow-hidden dsx-s-cbebeffe46">
                  <motion.div
                    className="h-full rounded-full dsx-s-fbecfa7efd"
                    initial={{ width: 0 }}
                    animate={{ width: `${d.value}%` }}
                    transition={showcaseTransition.dynamic_2657241123(0.1 + i * 0.06)}
                    style={{ "--dsx-background": toShowcaseCssValue(d.color, false) } as any}
                  />
                </div>
                <span className="type-code dsx-s-c39c773fba ds-showcase__data-ink" style={{ "--dsx-color": toShowcaseCssValue(d.color, false) } as any}>
                  {d.value}
                </span>
              </div>
            ))}
            <div className="flex items-center gap-2 mt-2 pt-2 dsx-s-e0f5da197d">
              <span className="dsx-s-29beaaf78b">
                {showcaseMessage("components.design-system.components-c.composite-2b0576ac")}</span>
              <span className="dsx-s-70c7972116">
                {composite}
              </span>
              <span className="dsx-s-6849179898">
                {showcaseMessage("components.design-system.components-c.asse-peso-1e77617a")}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Radar anatomy */}
      <div className="surface-card p-5">
        <span className="type-label dsx-s-e2184fadc0">{showcaseMessage("components.design-system.components-c.anatomia-radarchart-cfdef24f")}</span>
        <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { prop: showcaseMessage("components.design-system.components-c.tipo-6cc6198d"), val: showcaseMessage("components.design-system.components-c.svg-pentagono-custom-no-recharts-137b0397") },
            { prop: showcaseMessage("components.design-system.components-c.fill-7adb6736"), val: showcaseMessage("components.design-system.components-c.lineargradient-primary-tertiary-18-8-opaci-50da4f6f") },
            { prop: showcaseMessage("components.design-system.components-c.stroke-9b7d8736"), val: showcaseMessage("components.design-system.components-c.lineargradient-primary-tertiary-cta-91cf5dae") },
            { prop: showcaseMessage("components.design-system.components-c.glow-d5545dea"), val: showcaseMessage("components.design-system.components-c.fegaussianblur-stddev-3-femerge-241cd7f4") },
            { prop: showcaseMessage("components.design-system.components-c.grid-701c483f"), val: showcaseMessage("components.design-system.components-c.4-livelli-25-50-75-100-outline-variant-3312c4ac") },
            { prop: showcaseMessage("components.design-system.components-c.spokes-0dade563"), val: showcaseMessage("components.design-system.components-c.dashed-lines-0-5px-opacity-0-25-298f6774") },
            { prop: showcaseMessage("components.design-system.components-c.dots-4b4475f2"), val: showcaseMessage("components.design-system.components-c.r-3-5-con-halo-r-8-opacity-0-1-ab0013c1") },
            { prop: showcaseMessage("components.design-system.components-c.labels-22289854"), val: showcaseMessage("components.design-system.components-c.dm-sans-7px-short-7-5px-value-colorato-03da285e") },
            { prop: showcaseMessage("components.design-system.components-c.center-a2391118"), val: showcaseMessage("components.design-system.components-c.composite-20px-composite-5-5px-tracking-cb473258") },
            { prop: showcaseMessage("components.design-system.components-c.entrance-aa4bbfb3"), val: showcaseMessage("components.design-system.components-c.scale-0-5-1-dur-0-7s-ease-0-16-1-0-3-1-65638f14") },
            { prop: showcaseMessage("components.design-system.components-c.dots-anim-54b04d94"), val: showcaseMessage("components.design-system.components-c.spring-stiffness-400-damping-20-stagger-2c28fafb") },
            { prop: showcaseMessage("components.design-system.components-c.size-default-e6d74496"), val: showcaseMessage("components.design-system.components-c.180px-sidebar-200px-bottom-sheet-bf7ff2c8") },
          ].map((a) => <AnatomyRow key={a.prop} {...a} />)}
        </div>
      </div>

      <div className="surface-card p-5">
        <span className="type-label dsx-s-e2184fadc0">{showcaseMessage("components.design-system.components-c.note-implementazione-667500cd")}</span>
        <div className="mt-3 flex flex-col gap-2">
          {[
            { prop: showcaseMessage("components.design-system.components-c.rendering-e066e804"), val: showcaseMessage("components.design-system.components-c.createportal-node-document-body-58df6797") },
            { prop: showcaseMessage("components.design-system.components-c.position-cf1c85ad"), val: showcaseMessage("components.design-system.components-c.position-fixed-inset-0-z-index-9999-de7878e7") },
            { prop: showcaseMessage("components.design-system.components-c.backdrop-d4f5e938"), val: showcaseMessage("components.design-system.components-c.rgba-0-0-0-0-6-con-animatepresence-e70811df") },
            { prop: showcaseMessage("components.design-system.components-c.close-trigger-3869275e"), val: showcaseMessage("components.design-system.components-c.escape-key-click-backdrop-bottone-x-273bbac1") },
            { prop: showcaseMessage("components.design-system.components-c.pizzanerd-toggle-4cb31d98"), val: showcaseMessage("components.design-system.components-c.animatepresence-height-auto-per-expand-9aa24e08") },
            { prop: showcaseMessage("components.design-system.components-c.radarchart-cc28779f"), val: showcaseMessage("components.design-system.components-c.recharts-radarchart-a-5-assi-solo-in-nerd--21cebcb5") },
            { prop: showcaseMessage("components.design-system.components-c.score-colori-342e80ae"), val: showcaseMessage("components.design-system.components-c.80-cta-60-tertiary-60-sienna-40-destructiv-3509ab2c") },
            { prop: showcaseMessage("components.design-system.components-c.inline-styles-45a814bb"), val: showcaseMessage("components.design-system.components-c.obbligatori-per-position-z-index-nel-porta-492c749d") },
          ].map((a) => (
            <div key={a.prop} className="flex items-center gap-3 p-2.5 rounded-lg dsx-s-e4f209c55b">
              <span className="type-data dsx-s-1f6a5e2048">{a.prop}</span>
              <span className="type-data dsx-s-63782726c0">{a.val}</span>
            </div>
          ))}
        </div>
      </div>

      <SubSectionLabel label={showcaseMessage("components.design-system.components-c.linee-guida-b43417d1")} />
      <LineeGuida
        fai={[
          showcaseMessage("components.design-system.components-c.createportal-su-document-body-mai-renderiz-43f9e5aa"),
          showcaseMessage("components.design-system.components-c.escape-key-chiude-la-modale-handler-global-b28339a0"),
          showcaseMessage("components.design-system.components-c.pizzanerd-toggle-con-animatepresence-heigh-9a1a3af5"),
        ]}
        nonFare={[
          showcaseMessage("components.design-system.components-c.mai-classi-tailwind-per-position-z-index-n-a21ac6d3"),
          showcaseMessage("components.design-system.components-c.mai-modale-senza-backdrop-dismissible-clic-4b3ee9aa"),
          showcaseMessage("components.design-system.components-c.mai-mostrare-i-dati-scientifici-di-default-f2b4cd23"),
        ]}
      />

      <SubSectionLabel label={showcaseMessage("components.design-system.components-c.accessibilita-e59811a6")} />
      <AccessibilitaInfo items={[
        { label: showcaseMessage("components.design-system.components-c.focus-trap-f835888b"), desc: showcaseMessage("components.design-system.components-c.il-focus-resta-nella-modale-escape-chiude--41086515") },
        { label: "ARIA", desc: showcaseMessage("components.design-system.components-c.role-dialog-aria-modal-true-aria-labelledb-2361be78") },
        { label: showcaseMessage("components.design-system.components-c.reduced-motion-78980499"), desc: showcaseMessage("components.design-system.components-c.le-animazioni-scorering-e-radar-diventano--5254df45") },
      ]} />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   ENTRIES REGISTRY
   ═══════════════════════════════════════════════════════════ */
export const ENTRIES: SectionEntry[] = [
  { id: "navbar", label: showcaseMessage("components.design-system.components-c.navigationbar-a4e44bf4"), group: "c", Component: NavigationBarSpec },
  { id: "bottomsheet", label: showcaseMessage("components.design-system.components-c.bottomsheet-0271e6b3"), group: "c", Component: BottomSheetSpec },
  { id: "modal", label: showcaseMessage("components.design-system.components-c.modale-scoredashboard-7c0c7248"), group: "c", Component: ModalScoreDashboardSpec },
];
