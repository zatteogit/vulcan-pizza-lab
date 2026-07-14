import {
Copy,
Flame,
Heart,
Info,
Search,
Settings,
Star,
Trash2,
Wheat,
X,
} from "lucide-react";
import { AnimatePresence,motion } from "motion/react";
import { useState } from "react";
import type { SectionEntry } from "./shared";
import {
AccessibilitaInfo,
AnatomyRow,
LineeGuida,
Panoramica,
SectionHeader,
SubSectionLabel,
} from "./shared";
import { Dialog, CtaButton } from "../ds/index";
import { toShowcaseCssValue } from "./showcase-style";
import { showcaseTransition } from "./showcase-motion";
import { showcaseMessage } from "../../i18n/showcase-messages";

/* ═══════════════════════════════════════════════════════════
   C26 — TOOLTIP  (M3 Expressive)
   Plain tooltip + Rich tooltip
   ═══════════════════════════════════════════════════════════ */

function TooltipSpec() {
  const [hoveredPlain, setHoveredPlain] = useState<string | null>(null);
  const [openRich, setOpenRich] = useState<string | null>(null);

  const PLAIN_ITEMS = [
    { id: "heart", Icon: Heart, tip: showcaseMessage("components.design-system.components-g2.aggiungi-ai-preferiti-b5037a86") },
    { id: "copy", Icon: Copy, tip: showcaseMessage("components.design-system.components-g2.copia-negli-appunti-e82b73ba") },
    { id: "search", Icon: Search, tip: showcaseMessage("components.design-system.components-g2.cerca-ricetta-7400ff8d") },
    { id: "settings", Icon: Settings, tip: showcaseMessage("components.design-system.components-g2.impostazioni-8f710ac6") },
    { id: "trash", Icon: Trash2, tip: showcaseMessage("components.design-system.components-g2.elimina-6b177bdf") },
  ];

  const RICH_ITEMS = [
    { id: "hydration", title: showcaseMessage("components.design-system.components-g2.idratazione-ca30c32c"), body: showcaseMessage("components.design-system.components-g2.rapporto-acqua-farina-in-percentuale-valor-0f6b13c0"), Icon: Info },
    { id: "w-value", title: showcaseMessage("components.design-system.components-g2.indice-w-35d73f41"), body: showcaseMessage("components.design-system.components-g2.misura-la-forza-alveografica-della-farina--a6218822"), Icon: Wheat },
  ];

  return (
    <div className="flex flex-col gap-8">
      <SectionHeader
        title={showcaseMessage("components.design-system.components-g2.tooltip-b8407e25")}
        description={showcaseMessage("components.design-system.components-g2.m3-definisce-2-tipi-plain-tooltip-breve-so-d164770a")}
      />

      <SubSectionLabel label={showcaseMessage("components.design-system.components-g2.panoramica-f38c9a27")} />
      <Panoramica
        descrizione={showcaseMessage("components.design-system.components-g2.due-tipi-di-tooltip-m3-plain-breve-solo-te-96f817f2")}
        principi={[
          showcaseMessage("components.design-system.components-g2.plain-inverse-surface-bg-testo-breve-max-1-cdbbf24b"),
          showcaseMessage("components.design-system.components-g2.rich-surface-container-high-bg-con-bordo-t-0fe6ba48"),
          showcaseMessage("components.design-system.components-g2.spring-stiffness-500-damping-25-translatey-4b0dd2cd"),
        ]}
      />

      <SubSectionLabel label={showcaseMessage("components.design-system.components-g2.specifiche-057caf2f")} />

      {/* Plain tooltips */}
      <div className="surface-card p-5">
        <span className="type-label dsx-s-e2184fadc0">
          {showcaseMessage("components.design-system.components-g2.plain-tooltip-hover-sulle-icone-c9dd2521")}</span>
        <div className="mt-4 flex items-center gap-4 justify-center">
          {PLAIN_ITEMS.map((item) => {
            const Icon = item.Icon;
            return (
              <div
                key={item.id}
                className="relative"
                onMouseEnter={() => setHoveredPlain(item.id)}
                onMouseLeave={() => setHoveredPlain(null)}
              >
                <motion.button
                  className="w-10 h-10 rounded-xl flex items-center justify-center cursor-pointer active:scale-90 transition-transform dsx-s-631b935c12"
                  aria-label={item.tip}
                >
                  <Icon size={18} />
                </motion.button>

                <AnimatePresence>
                  {hoveredPlain === item.id && (
                    <motion.div
                      initial={{ opacity: 0, y: 6, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 4, scale: 0.95 }}
                      transition={showcaseTransition.preset_e8d752eab0}
                      className="absolute left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-lg whitespace-nowrap z-50 dsx-s-ef25f29e7a"
                    >
                      {item.tip}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>

      {/* Rich tooltips */}
      <div className="surface-card p-5">
        <span className="type-label dsx-s-e2184fadc0">
          {showcaseMessage("components.design-system.components-g2.rich-tooltip-clicca-sulle-icone-6d8243c4")}</span>
        <div className="mt-4 flex flex-wrap gap-4 justify-center">
          {RICH_ITEMS.map((item) => {
            const Icon = item.Icon;
            const isOpen = openRich === item.id;
            return (
              <div key={item.id} className="relative">
                <button
                  onClick={() => setOpenRich(isOpen ? null : item.id)}
                  aria-label={item.title}
                  className="w-10 h-10 rounded-xl flex items-center justify-center cursor-pointer active:scale-90 transition-transform dsx-s-cb62cd3734"
                  style={{ "--dsx-background": toShowcaseCssValue(isOpen ? "color-mix(in srgb, var(--primary) 12%, transparent)" : "var(--surface-container)", false), "--dsx-color": toShowcaseCssValue(isOpen ? "var(--primary)" : "var(--on-surface-variant)", false) } as any}
                  aria-expanded={isOpen}
                >
                  <Icon size={18} />
                </button>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 6, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 4, scale: 0.95 }}
                      transition={showcaseTransition.preset_e8d752eab0}
                      className="absolute left-1/2 -translate-x-1/2 p-4 rounded-xl z-50 dsx-s-fc41b64083"
                    >
                      <div className="dsx-s-ed2f1d2101">
                        {item.title}
                      </div>
                      <div className="dsx-s-b4252559c3">
                        {item.body}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>

      <SubSectionLabel label={showcaseMessage("components.design-system.components-g2.linee-guida-b43417d1")} />
      <LineeGuida
        fai={[
          showcaseMessage("components.design-system.components-g2.plain-per-spiegare-icone-senza-label-hover-01410701"),
          showcaseMessage("components.design-system.components-g2.rich-per-informazioni-contestuali-che-rich-30523dce"),
          showcaseMessage("components.design-system.components-g2.posizione-sotto-il-trigger-centrato-evitar-9eb190c1"),
        ]}
        nonFare={[
          showcaseMessage("components.design-system.components-g2.mai-tooltip-per-informazioni-critiche-non--e25198a1"),
          showcaseMessage("components.design-system.components-g2.mai-testo-lungo-in-plain-tooltip-max-1-2-p-7cc51410"),
          showcaseMessage("components.design-system.components-g2.mai-tooltip-su-elementi-gia-chiari-es-bott-6ae0c51f"),
        ]}
      />

      <SubSectionLabel label={showcaseMessage("components.design-system.components-g2.accessibilita-e59811a6")} />
      <AccessibilitaInfo items={[
        { label: "ARIA", desc: showcaseMessage("components.design-system.components-g2.aria-describedby-per-collegare-il-tooltip--b1be209c") },
        { label: showcaseMessage("components.design-system.components-g2.tastiera-d99ab9ca"), desc: showcaseMessage("components.design-system.components-g2.focus-sul-trigger-mostra-il-tooltip-escape-8310cb27") },
      ]} />

      {/* Anatomy */}
      <div className="surface-card p-5">
        <span className="type-label dsx-s-e2184fadc0">{showcaseMessage("components.design-system.components-g2.anatomia-80a1ebf8")}</span>
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <AnatomyRow prop={showcaseMessage("components.design-system.components-g2.plain-34118050")} val={showcaseMessage("components.design-system.components-g2.inverse-surface-bg-inverse-on-surface-text-98aeec27")} />
          <AnatomyRow prop={showcaseMessage("components.design-system.components-g2.rich-50ccaf35")} val={showcaseMessage("components.design-system.components-g2.surface-container-high-bg-outline-variant--0510b820")} />
          <AnatomyRow prop={showcaseMessage("components.design-system.components-g2.posizione-69f569a6")} val={showcaseMessage("components.design-system.components-g2.8-10px-sotto-il-trigger-centrato-caret-opz-d5a13879")} />
          <AnatomyRow prop={showcaseMessage("components.design-system.components-g2.motion-e040db2b")} val={showcaseMessage("components.design-system.components-g2.spring-stiffness-500-damping-25-translate--11e6b34c")} />
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   C27 — DIALOG  (M3 Expressive)
   Alert dialog + Confirmation dialog
   ═══════════════════════════════════════════════════════════ */

function DialogSpec() {
  const [alertOpen, setAlertOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [fullOpen, setFullOpen] = useState(false);

  return (
    <div className="flex flex-col gap-8">
      <SectionHeader
        title={showcaseMessage("components.design-system.components-g2.dialog-a31bda55")}
        description={showcaseMessage("components.design-system.components-g2.m3-dialog-scrim-32-nero-container-con-radi-3dc2a5b7")}
      />

      <SubSectionLabel label={showcaseMessage("components.design-system.components-g2.panoramica-f38c9a27")} />
      <Panoramica
        descrizione={showcaseMessage("components.design-system.components-g2.dialog-m3-con-3-varianti-alert-1-azione-in-dc4662bf")}
        principi={[
          showcaseMessage("components.design-system.components-g2.scrim-backdrop-rgba-0-0-0-0-32-con-click-t-5593a2a1"),
          showcaseMessage("components.design-system.components-g2.scale-0-85-1-per-alert-confirm-slide-y-40--0b770e0f"),
          showcaseMessage("components.design-system.components-g2.spring-stiffness-400-damping-25-per-entrat-49eef062"),
        ]}
      />

      <SubSectionLabel label={showcaseMessage("components.design-system.components-g2.specifiche-057caf2f")} />

      {/* Trigger buttons */}
      <div className="surface-card p-5">
        <span className="type-label dsx-s-e2184fadc0">{showcaseMessage("components.design-system.components-g2.prova-i-dialog-2c02ffa8")}</span>
        <div className="mt-4 flex flex-wrap gap-3">
          <motion.button
            onClick={() => setAlertOpen(true)}
            className="px-5 py-2.5 rounded-xl active:scale-95 transition-transform dsx-s-12b3a76574"
          >
            {showcaseMessage("components.design-system.components-g2.alert-dialog-711a1129")}</motion.button>
          <motion.button
            onClick={() => setConfirmOpen(true)}
            className="px-5 py-2.5 rounded-xl active:scale-95 transition-transform dsx-s-a286884f1c"
          >
            {showcaseMessage("components.design-system.components-g2.confirmation-dialog-69d235d4")}</motion.button>
          <motion.button
            onClick={() => setFullOpen(true)}
            className="px-5 py-2.5 rounded-xl active:scale-95 transition-transform dsx-s-a286884f1c"
          >
            {showcaseMessage("components.design-system.components-g2.full-screen-dialog-9a898a9d")}</motion.button>
        </div>
      </div>

      {/* Alert Dialog */}
      <Dialog
        open={alertOpen}
        onClose={() => setAlertOpen(false)}
        title={showcaseMessage("components.design-system.components-g2.temperatura-insufficiente-ff3fae9b")}
        actions={
          <CtaButton variant="primary" onClick={() => setAlertOpen(false)}>
            {showcaseMessage("components.design-system.components-g2.ho-capito-eee8047d")}</CtaButton>
        }
      >
        {showcaseMessage("components.design-system.components-g2.il-forno-casalingo-a-250-c-non-raggiunge-l-f1c6b8f6")}</Dialog>

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title={showcaseMessage("components.design-system.components-g2.cambiare-stile-ad856b3e")}
        actions={
          <>
            <CtaButton variant="secondary" onClick={() => setConfirmOpen(false)}>
              {showcaseMessage("components.design-system.components-g2.annulla-5c034dd0")}</CtaButton>
            <CtaButton variant="primary" onClick={() => setConfirmOpen(false)}>
              {showcaseMessage("components.design-system.components-g2.cambia-stile-d0e513fb")}</CtaButton>
          </>
        }
      >
        {showcaseMessage("components.design-system.components-g2.passando-da-napoletana-a-teglia-romana-i-p-ab71754f")}</Dialog>

      {/* Full-screen Dialog */}
      <AnimatePresence>
        {fullOpen && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={showcaseTransition.preset_98bf3c3416}
            className="fixed inset-0 z-50 flex flex-col dsx-s-ff6be3e5a5"
          >
            {/* Top bar */}
            <div className="flex items-center justify-between px-4 py-3 dsx-s-ff83771d47">
              <div className="flex items-center gap-3">
                <motion.button
                  onClick={() => setFullOpen(false)}
                  className="w-10 h-10 rounded-full flex items-center justify-center active:scale-90 transition-transform dsx-s-224b44991e"
                  aria-label={showcaseMessage("components.design-system.components-g2.chiudi-a3be8a9a")}
                >
                  <X size={20} />
                </motion.button>
                <span className="dsx-s-b4f5b7135b">
                  {showcaseMessage("components.design-system.components-g2.dettaglio-ricetta-4287deb3")}</span>
              </div>
              <motion.button
                onClick={() => setFullOpen(false)}
                className="px-5 py-2 rounded-xl active:scale-95 transition-transform dsx-s-12b3a76574"
              >
                {showcaseMessage("components.design-system.components-g2.salva-0fe6a465")}</motion.button>
            </div>
            {/* Content placeholder */}
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center p-6">
                <Flame size={48} className="dsx-s-9cc075bcc6" />
                <div className="dsx-s-87b2f6e68f">
                  {showcaseMessage("components.design-system.components-g2.full-screen-dialog-9a898a9d")}</div>
                <p className="dsx-s-f381b03625">
                  {showcaseMessage("components.design-system.components-g2.usato-per-task-complessi-che-richiedono-l--c38011b7")}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <SubSectionLabel label={showcaseMessage("components.design-system.components-g2.linee-guida-b43417d1")} />
      <LineeGuida
        fai={[
          showcaseMessage("components.design-system.components-g2.alert-per-informazioni-importanti-che-rich-fe4d0b7e"),
          showcaseMessage("components.design-system.components-g2.confirmation-per-scelte-binarie-es-annulla-1e1b1858"),
          showcaseMessage("components.design-system.components-g2.full-screen-per-form-complessi-o-contenuti-d971d3dc"),
        ]}
        nonFare={[
          showcaseMessage("components.design-system.components-g2.mai-dialog-per-messaggi-non-critici-usare--3ff6390f"),
          showcaseMessage("components.design-system.components-g2.mai-piu-di-2-azioni-in-alert-confirm-usare-a3085132"),
          showcaseMessage("components.design-system.components-g2.mai-dialog-senza-via-d-uscita-escape-x-o-s-a78ce857"),
        ]}
      />

      <SubSectionLabel label={showcaseMessage("components.design-system.components-g2.accessibilita-e59811a6")} />
      <AccessibilitaInfo items={[
        { label: showcaseMessage("components.design-system.components-g2.focus-trap-f835888b"), desc: showcaseMessage("components.design-system.components-g2.focus-resta-nel-dialog-escape-chiude-focus-c6b2f21d") },
        { label: "ARIA", desc: showcaseMessage("components.design-system.components-g2.role-alertdialog-alert-o-role-dialog-aria--a80f74e5") },
      ]} />

      {/* Anatomy */}
      <div className="surface-card p-5">
        <span className="type-label dsx-s-e2184fadc0">{showcaseMessage("components.design-system.components-g2.anatomia-80a1ebf8")}</span>
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <AnatomyRow prop={showcaseMessage("components.design-system.components-g2.scrim-cbd1ca36")} val={showcaseMessage("components.design-system.components-g2.rgba-0-0-0-0-32-click-per-dismissare-alert-cac0b3f3")} />
          <AnatomyRow prop={showcaseMessage("components.design-system.components-g2.container-e6443af9")} val={showcaseMessage("components.design-system.components-g2.surface-container-high-radius-28px-rounded-701a4e3a")} />
          <AnatomyRow prop={showcaseMessage("components.design-system.components-g2.headline-442250df")} val={showcaseMessage("components.design-system.components-g2.playfair-display-1-25rem-weight-700-centra-b4c6b7c7")} />
          <AnatomyRow prop={showcaseMessage("components.design-system.components-g2.actions-c3cd636a")} val={showcaseMessage("components.design-system.components-g2.centrato-alert-flex-end-confirm-primary-bu-68235194")} />
          <AnatomyRow prop={showcaseMessage("components.design-system.components-g2.full-screen-225c026a")} val={showcaseMessage("components.design-system.components-g2.nessuno-scrim-slide-up-spring-top-bar-con--e4dccf1a")} />
          <AnatomyRow prop={showcaseMessage("components.design-system.components-g2.motion-e040db2b")} val={showcaseMessage("components.design-system.components-g2.scale-0-85-1-alert-confirm-slide-y-40-0-fu-b1465a48")} />
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   C28 — ICON BUTTON  (M3 Expressive)
   Standard, Filled, Filled Tonal, Outlined
   ═══════════════════════════════════════════════════════════ */

function IconButtonSpec() {
  const [toggled, setToggled] = useState<Record<string, boolean>>({
    heart: false,
    star: false,
    bookmark: false,
  });

  const toggleIcon = (id: string) => {
    setToggled((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const VARIANTS = [
    {
      id: "standard",
      label: showcaseMessage("components.design-system.components-g2.standard-2dfa6607"),
      bg: "rgba(0,0,0,0)",
      bgHover: "color-mix(in srgb, var(--on-surface-variant) 8%, rgba(0,0,0,0))",
      fg: "var(--on-surface-variant)",
      border: "none",
    },
    {
      id: "filled",
      label: showcaseMessage("components.design-system.components-g2.filled-a7419509"),
      bg: "var(--primary)",
      bgHover: "var(--primary)",
      fg: "var(--primary-foreground)",
      border: "none",
    },
    {
      id: "tonal",
      label: showcaseMessage("components.design-system.components-g2.filled-tonal-83c8246a"),
      bg: "var(--primary-container)",
      bgHover: "var(--primary-container)",
      fg: "var(--on-primary-container)",
      border: "none",
    },
    {
      id: "outlined",
      label: showcaseMessage("components.design-system.components-g2.outlined-19c35027"),
      bg: "rgba(0,0,0,0)",
      bgHover: "color-mix(in srgb, var(--on-surface-variant) 8%, rgba(0,0,0,0))",
      fg: "var(--on-surface-variant)",
      border: "1px solid var(--outline)",
    },
  ];

  return (
    <div className="flex flex-col gap-8">
      <SectionHeader
        title={showcaseMessage("components.design-system.components-g2.icon-button-f3e3cbce")}
        description={showcaseMessage("components.design-system.components-g2.m3-definisce-4-varianti-di-bottone-icona-s-7bdb39ec")}
      />

      <SubSectionLabel label={showcaseMessage("components.design-system.components-g2.panoramica-f38c9a27")} />
      <Panoramica
        descrizione={showcaseMessage("components.design-system.components-g2.4-varianti-di-icon-button-m3-standard-no-b-278bd605")}
        principi={[
          showcaseMessage("components.design-system.components-g2.standard-nessun-container-solo-icona-per-a-e2930010"),
          showcaseMessage("components.design-system.components-g2.filled-tonal-container-colorato-per-azioni-c509501c"),
          showcaseMessage("components.design-system.components-g2.toggle-pulse-scale-1-1-3-1-cambio-variant--397c0b6c"),
        ]}
      />

      <SubSectionLabel label={showcaseMessage("components.design-system.components-g2.specifiche-057caf2f")} />

      {/* Variant grid */}
      <div className="surface-card p-5">
        <span className="type-label dsx-s-e2184fadc0">{showcaseMessage("components.design-system.components-g2.varianti-4-stili-fd6e60f5")}</span>
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
          {VARIANTS.map((v) => (
            <div key={v.id} className="flex flex-col items-center gap-3">
              <div className="flex items-center gap-2">
                {[Flame, Star, Settings].map((Icon, i) => (
                  <motion.button
                    key={i}
                    whileHover={{ scale: 1.05 }}
                    className="w-10 h-10 rounded-full flex items-center justify-center active:scale-85 transition-transform dsx-s-581a0621c3"
                    style={{ "--dsx-background": toShowcaseCssValue(v.bg, false), "--dsx-color": toShowcaseCssValue(v.fg, false), "--dsx-border": toShowcaseCssValue(v.border, false) } as any}
                    aria-label={showcaseMessage("components.design-system.components-g2.value-icon-button-843cf412", [v.label])}
                  >
                    <Icon size={20} />
                  </motion.button>
                ))}
              </div>
              <span className="type-label text-center dsx-s-4d3571287d">{v.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Toggle icon buttons */}
      <div className="surface-card p-5">
        <span className="type-label dsx-s-e2184fadc0">{showcaseMessage("components.design-system.components-g2.toggle-clicca-per-attivare-1035daac")}</span>
        <div className="mt-4 flex items-center gap-6 justify-center">
          {[
            { id: "heart", Icon: Heart, label: showcaseMessage("components.design-system.components-g2.preferito-745ab699") },
            { id: "star", Icon: Star, label: showcaseMessage("components.design-system.components-g2.valuta-04fe77cf") },
          ].map((item) => {
            const isOn = toggled[item.id];
            return (
              <div key={item.id} className="flex flex-col items-center gap-2">
                <button
                  onClick={() => toggleIcon(item.id)}
                  className="w-12 h-12 rounded-full flex items-center justify-center active:scale-80 dsx-s-571c4cd9f6"
                  style={{ "--dsx-background": toShowcaseCssValue(isOn ? "var(--primary)" : "rgba(0,0,0,0)", false), "--dsx-color": toShowcaseCssValue(isOn ? "var(--primary-foreground)" : "var(--on-surface-variant)", false), "--dsx-border": toShowcaseCssValue(isOn ? "none" : "1px solid var(--outline)", false) } as any}
                  aria-label={item.label}
                  aria-pressed={isOn}
                >
                  <motion.div
                    animate={{ scale: isOn ? [1, 1.3, 1] : 1 }}
                    transition={showcaseTransition.preset_0e2957ab5e}
                  >
                    <item.Icon size={22} fill={isOn ? "currentColor" : "none"} />
                  </motion.div>
                </button>
                <span className="type-code dsx-s-fdd5477c7e" style={{ "--dsx-color": toShowcaseCssValue(isOn ? "var(--primary)" : "var(--muted-foreground)", false) } as any}>
                  {isOn ? "ON" : "OFF"}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Sizes */}
      <div className="surface-card p-5">
        <span className="type-label dsx-s-e2184fadc0">{showcaseMessage("components.design-system.components-g2.taglie-76403aaa")}</span>
        <div className="mt-4 flex items-end gap-6 justify-center">
          {[
            { size: 32, icon: 16, label: showcaseMessage("components.design-system.components-g2.small-c74fd971") },
            { size: 40, icon: 20, label: showcaseMessage("components.design-system.components-g2.medium-d404968e") },
            { size: 48, icon: 24, label: showcaseMessage("components.design-system.components-g2.large-738fd1d2") },
          ].map((s) => (
            <div key={s.label} className="flex flex-col items-center gap-2">
              <motion.div
                className="rounded-full flex items-center justify-center cursor-pointer active:scale-85 transition-transform dsx-s-e9d39f5aea"
                style={{ "--dsx-width": toShowcaseCssValue(s.size, false), "--dsx-height": toShowcaseCssValue(s.size, false) } as any}
              >
                <Flame size={s.icon} />
              </motion.div>
              <span className="type-code dsx-s-63782726c0">
                {s.label} · {s.size}px
              </span>
            </div>
          ))}
        </div>
      </div>

      <SubSectionLabel label={showcaseMessage("components.design-system.components-g2.linee-guida-b43417d1")} />
      <LineeGuida
        fai={[
          showcaseMessage("components.design-system.components-g2.standard-per-azioni-secondarie-in-toolbar--2019d9d8"),
          showcaseMessage("components.design-system.components-g2.filled-per-azioni-primarie-isolate-es-play-7a3571a9"),
          showcaseMessage("components.design-system.components-g2.toggle-con-pulse-per-feedback-visivo-su-li-5c9a52e8"),
        ]}
        nonFare={[
          showcaseMessage("components.design-system.components-g2.mai-icon-button-senza-aria-label-l-icona-d-dd5572d2"),
          showcaseMessage("components.design-system.components-g2.mai-standard-icon-button-su-sfondo-comples-c1d6848b"),
          showcaseMessage("components.design-system.components-g2.mai-toggle-senza-feedback-visivo-colore-an-7c6fb82c"),
        ]}
      />

      <SubSectionLabel label={showcaseMessage("components.design-system.components-g2.accessibilita-e59811a6")} />
      <AccessibilitaInfo items={[
        { label: "ARIA", desc: showcaseMessage("components.design-system.components-g2.aria-label-descrittivo-toggle-aria-pressed-d859227a") },
        { label: showcaseMessage("components.design-system.components-g2.focus-fe7f55b8"), desc: showcaseMessage("components.design-system.components-g2.focus-ring-3px-primary-su-focus-visible-ar-fcc33f3e") },
      ]} />

      {/* Anatomy */}
      <div className="surface-card p-5">
        <span className="type-label dsx-s-e2184fadc0">{showcaseMessage("components.design-system.components-g2.anatomia-80a1ebf8")}</span>
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <AnatomyRow prop={showcaseMessage("components.design-system.components-g2.container-e6443af9")} val={showcaseMessage("components.design-system.components-g2.radius-full-cerchio-standard-nessun-bg-fil-b3179aae")} />
          <AnatomyRow prop={showcaseMessage("components.design-system.components-g2.outlined-19c35027")} val={showcaseMessage("components.design-system.components-g2.transparent-bg-outline-border-1px-hover-8--cc24591d")} />
          <AnatomyRow prop={showcaseMessage("components.design-system.components-g2.toggle-d5e14b06")} val={showcaseMessage("components.design-system.components-g2.off-outlined-on-filled-primary-bg-icon-fil-c88fd243")} />
          <AnatomyRow prop={showcaseMessage("components.design-system.components-g2.taglie-76403aaa")} val={showcaseMessage("components.design-system.components-g2.32px-small-icon-16-40px-medium-icon-20-48p-8f2bc7e0")} />
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   ENTRIES REGISTRY
   ═══════════════════════════════════════════════════════════ */
export const ENTRIES: SectionEntry[] = [
  { id: "tooltip", label: showcaseMessage("components.design-system.components-g2.tooltip-b8407e25"), group: "c", Component: TooltipSpec },
  { id: "dialog", label: showcaseMessage("components.design-system.components-g2.dialog-a31bda55"), group: "c", Component: DialogSpec },
  { id: "iconbutton", label: showcaseMessage("components.design-system.components-g2.icon-button-f3e3cbce"), group: "c", Component: IconButtonSpec },
];
