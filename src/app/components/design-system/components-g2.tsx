import {
AlertTriangle,
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

/* ═══════════════════════════════════════════════════════════
   C26 — TOOLTIP  (M3 Expressive)
   Plain tooltip + Rich tooltip
   ═══════════════════════════════════════════════════════════ */

export function TooltipSpec() {
  const [hoveredPlain, setHoveredPlain] = useState<string | null>(null);
  const [openRich, setOpenRich] = useState<string | null>(null);

  const PLAIN_ITEMS = [
    { id: "heart", Icon: Heart, tip: "Aggiungi ai preferiti" },
    { id: "copy", Icon: Copy, tip: "Copia negli appunti" },
    { id: "search", Icon: Search, tip: "Cerca ricetta" },
    { id: "settings", Icon: Settings, tip: "Impostazioni" },
    { id: "trash", Icon: Trash2, tip: "Elimina" },
  ];

  const RICH_ITEMS = [
    { id: "hydration", title: "Idratazione", body: "Rapporto acqua/farina in percentuale. Valori alti (70%+) producono alveolatura più aperta ma richiedono maggiore esperienza.", Icon: Info },
    { id: "w-value", title: "Indice W", body: "Misura la forza alveografica della farina. W alto (300+) regge idratazioni elevate e fermentazioni lunghe.", Icon: Wheat },
  ];

  return (
    <div className="flex flex-col gap-8">
      <SectionHeader
        title="Tooltip"
        description="M3 definisce 2 tipi: Plain tooltip (breve, solo testo, hover) e Rich tooltip (titolo + body, click/hover). Entrambi con entrata spring e puntatore verso il trigger."
      />

      <SubSectionLabel label="Panoramica" />
      <Panoramica
        descrizione="Due tipi di tooltip M3: Plain (breve, solo testo, appare su hover) e Rich (titolo + body, appare su click o hover prolungato). Entrambi con entrata spring e posizionamento sotto il trigger."
        principi={[
          "Plain: inverse-surface bg, testo breve (max 1 riga), hover only",
          "Rich: surface-container-high bg con bordo, titolo + body, click/hover",
          "Spring stiffness:500 damping:25, translateY 6→0px + scale 0.95→1",
        ]}
      />

      <SubSectionLabel label="Specifiche" />

      {/* Plain tooltips */}
      <div className="surface-card p-5">
        <span className="type-label" style={{ color: "var(--text-default)", fontSize: "var(--font-size-base)" }}>
          Plain Tooltip — hover sulle icone
        </span>
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
                  className="w-10 h-10 rounded-xl flex items-center justify-center cursor-pointer active:scale-[0.9] transition-transform"
                  style={{
                    background: "var(--surface-container)",
                    border: "none",
                    outline: "none",
                    color: "var(--on-surface-variant)",
                  }}
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
                      transition={{ type: "spring", stiffness: 500, damping: 25 }}
                      className="absolute left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-lg whitespace-nowrap z-50"
                      style={{
                        top: "calc(100% + 8px)",
                        background: "var(--inverse-surface)",
                        color: "var(--inverse-on-surface)",
                        fontFamily: "'DM Sans', sans-serif",
                        fontSize: "var(--font-size-base)",
                        fontWeight: "var(--weight-medium)" as any,
                        boxShadow: "var(--shadow-md)",
                        pointerEvents: "none",
                      }}
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
        <span className="type-label" style={{ color: "var(--text-default)", fontSize: "var(--font-size-base)" }}>
          Rich Tooltip — clicca sulle icone
        </span>
        <div className="mt-4 flex flex-wrap gap-4 justify-center">
          {RICH_ITEMS.map((item) => {
            const Icon = item.Icon;
            const isOpen = openRich === item.id;
            return (
              <div key={item.id} className="relative">
                <button
                  onClick={() => setOpenRich(isOpen ? null : item.id)}
                  className="w-10 h-10 rounded-xl flex items-center justify-center cursor-pointer active:scale-[0.9] transition-transform"
                  style={{
                    background: isOpen ? "color-mix(in srgb, var(--primary) 12%, transparent)" : "var(--surface-container)",
                    border: "none",
                    outline: "none",
                    color: isOpen ? "var(--primary)" : "var(--on-surface-variant)",
                    transition: "background 0.15s, color 0.15s",
                  }}
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
                      transition={{ type: "spring", stiffness: 500, damping: 25 }}
                      className="absolute left-1/2 -translate-x-1/2 p-4 rounded-xl z-50"
                      style={{
                        top: "calc(100% + 10px)",
                        width: "240px",
                        background: "var(--surface-container-high)",
                        border: "1px solid var(--outline-variant)",
                        boxShadow: "var(--shadow-lg)",
                      }}
                    >
                      <div style={{
                        fontFamily: "'DM Sans', sans-serif",
                        fontSize: "var(--font-size-lg)",
                        fontWeight: "var(--weight-bold)" as any,
                        color: "var(--text-default)",
                        marginBottom: "4px",
                      }}>
                        {item.title}
                      </div>
                      <div style={{
                        fontFamily: "'DM Sans', sans-serif",
                        fontSize: "var(--font-size-md)",
                        color: "var(--muted-foreground)",
                        lineHeight: "var(--leading-relaxed)",
                      }}>
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

      <SubSectionLabel label="Linee guida" />
      <LineeGuida
        fai={[
          "Plain per spiegare icone senza label — hover mostra il significato",
          "Rich per informazioni contestuali che richiedono titolo + corpo",
          "Posizione sotto il trigger, centrato — evitare di coprire il contenuto",
        ]}
        nonFare={[
          "Mai tooltip per informazioni critiche — non sono accessibili su mobile",
          "Mai testo lungo in plain tooltip — max 1-2 parole",
          "Mai tooltip su elementi già chiari (es. bottone con label)",
        ]}
      />

      <SubSectionLabel label="Accessibilità" />
      <AccessibilitaInfo items={[
        { label: "ARIA", desc: "aria-describedby per collegare il tooltip al trigger. role='tooltip' sul contenitore." },
        { label: "Tastiera", desc: "Focus sul trigger mostra il tooltip. Escape per chiudere." },
      ]} />

      {/* Anatomy */}
      <div className="surface-card p-5">
        <span className="type-label" style={{ color: "var(--text-default)", fontSize: "var(--font-size-base)" }}>Anatomia</span>
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <AnatomyRow prop="Plain" val="inverse-surface bg, inverse-on-surface text. Radius 8px. Max 1 riga." />
          <AnatomyRow prop="Rich" val="surface-container-high bg, outline-variant border. Radius 12px. Titolo + body." />
          <AnatomyRow prop="Posizione" val="8–10px sotto il trigger, centrato. Caret opzionale (non M3 standard)." />
          <AnatomyRow prop="Motion" val="Spring stiffness:500 damping:25. Translate Y 6→0px + scale 0.95→1." />
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   C27 — DIALOG  (M3 Expressive)
   Alert dialog + Confirmation dialog
   ═══════════════════════════════════════════════════════════ */

export function DialogSpec() {
  const [alertOpen, setAlertOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [fullOpen, setFullOpen] = useState(false);

  return (
    <div className="flex flex-col gap-8">
      <SectionHeader
        title="Dialog"
        description="M3 dialog: scrim 32% nero, container con radius 28px, headline + supporting text + actions. Supporta Alert (1 azione), Confirmation (2 azioni) e Full-screen. Entrata spring dal centro."
      />

      <SubSectionLabel label="Panoramica" />
      <Panoramica
        descrizione="Dialog M3 con 3 varianti: Alert (1 azione, info/warning), Confirmation (2 azioni, scelta binaria), Full-screen (slide-up, azioni complesse). Scrim 32% nero, radius 28px, spring entrance dal centro."
        principi={[
          "Scrim backdrop rgba(0,0,0,0.32) con click-to-dismiss (solo Confirm)",
          "Scale 0.85→1 per Alert/Confirm, slide Y 40→0 per Full-screen",
          "Spring stiffness:400 damping:25 per entrata fluida",
        ]}
      />

      <SubSectionLabel label="Specifiche" />

      {/* Trigger buttons */}
      <div className="surface-card p-5">
        <span className="type-label" style={{ color: "var(--text-default)", fontSize: "var(--font-size-base)" }}>Prova i dialog</span>
        <div className="mt-4 flex flex-wrap gap-3">
          <motion.button
            onClick={() => setAlertOpen(true)}
            className="px-5 py-2.5 rounded-xl active:scale-95 transition-transform"
            style={{
              background: "var(--primary)", color: "var(--primary-foreground)",
              border: "none", cursor: "pointer", outline: "none",
              fontFamily: "'DM Sans', sans-serif", fontSize: "var(--font-size-lg)", fontWeight: "var(--weight-semibold)" as any,
            }}
          >
            Alert Dialog
          </motion.button>
          <motion.button
            onClick={() => setConfirmOpen(true)}
            className="px-5 py-2.5 rounded-xl active:scale-95 transition-transform"
            style={{
              background: "var(--surface-container)", color: "var(--text-default)",
              border: "1px solid var(--outline-variant)", cursor: "pointer", outline: "none",
              fontFamily: "'DM Sans', sans-serif", fontSize: "var(--font-size-lg)", fontWeight: "var(--weight-semibold)" as any,
            }}
          >
            Confirmation Dialog
          </motion.button>
          <motion.button
            onClick={() => setFullOpen(true)}
            className="px-5 py-2.5 rounded-xl active:scale-95 transition-transform"
            style={{
              background: "var(--surface-container)", color: "var(--text-default)",
              border: "1px solid var(--outline-variant)", cursor: "pointer", outline: "none",
              fontFamily: "'DM Sans', sans-serif", fontSize: "var(--font-size-lg)", fontWeight: "var(--weight-semibold)" as any,
            }}
          >
            Full-screen Dialog
          </motion.button>
        </div>
      </div>

      {/* Alert Dialog */}
      <AnimatePresence>
        {alertOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "var(--dialog-scrim)" }}
            onClick={() => setAlertOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className="p-6 rounded-3xl"
              style={{
                background: "var(--surface-container-high)",
                maxWidth: "360px",
                width: "100%",
                boxShadow: "var(--shadow-lg)",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-center mb-4">
                <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: "color-mix(in srgb, var(--destructive) 12%, transparent)" }}>
                  <AlertTriangle size={24} style={{ color: "var(--destructive)" }} />
                </div>
              </div>
              <h2 style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "var(--font-size-5xl)",
                fontWeight: "var(--weight-bold)" as any,
                color: "var(--text-default)",
                textAlign: "center",
                lineHeight: "var(--leading-display)",
              }}>
                Temperatura insufficiente
              </h2>
              <p style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "var(--font-size-lg)",
                color: "var(--muted-foreground)",
                textAlign: "center",
                lineHeight: "var(--leading-body)",
                marginTop: "8px",
              }}>
                Il forno casalingo a 250°C non raggiunge la temperatura ideale per la Napoletana STG (450°C). Verranno applicate compensazioni automatiche.
              </p>
              <div className="flex justify-center mt-5">
                <motion.button
                  onClick={() => setAlertOpen(false)}
                  className="px-6 py-2.5 rounded-xl active:scale-95 transition-transform"
                  style={{
                    background: "var(--primary)", color: "var(--primary-foreground)",
                    border: "none", cursor: "pointer", outline: "none",
                    fontFamily: "'DM Sans', sans-serif", fontSize: "var(--font-size-lg)", fontWeight: "var(--weight-semibold)" as any,
                  }}
                >
                  Ho capito
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirmation Dialog */}
      <AnimatePresence>
        {confirmOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "var(--dialog-scrim)" }}
            onClick={() => setConfirmOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className="p-6 rounded-3xl"
              style={{
                background: "var(--surface-container-high)",
                maxWidth: "400px",
                width: "100%",
                boxShadow: "var(--shadow-lg)",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <h2 style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "var(--font-size-5xl)",
                fontWeight: "var(--weight-bold)" as any,
                color: "var(--text-default)",
                lineHeight: "var(--leading-display)",
              }}>
                Cambiare stile?
              </h2>
              <p style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "var(--font-size-lg)",
                color: "var(--muted-foreground)",
                lineHeight: "var(--leading-body)",
                marginTop: "8px",
              }}>
                Passando da Napoletana a Teglia Romana, i parametri del fine-tuning verranno resettati ai valori raccomandati per il nuovo stile.
              </p>
              <div className="flex justify-end gap-2 mt-5">
                <motion.button
                  onClick={() => setConfirmOpen(false)}
                  className="px-5 py-2.5 rounded-xl active:scale-95 transition-transform"
                  style={{
                    background: "rgba(0,0,0,0)", color: "var(--primary)",
                    border: "none", cursor: "pointer", outline: "none",
                    fontFamily: "'DM Sans', sans-serif", fontSize: "var(--font-size-lg)", fontWeight: "var(--weight-semibold)" as any,
                  }}
                >
                  Annulla
                </motion.button>
                <motion.button
                  onClick={() => setConfirmOpen(false)}
                  className="px-5 py-2.5 rounded-xl active:scale-95 transition-transform"
                  style={{
                    background: "var(--primary)", color: "var(--primary-foreground)",
                    border: "none", cursor: "pointer", outline: "none",
                    fontFamily: "'DM Sans', sans-serif", fontSize: "var(--font-size-lg)", fontWeight: "var(--weight-semibold)" as any,
                  }}
                >
                  Cambia stile
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Full-screen Dialog */}
      <AnimatePresence>
        {fullOpen && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            className="fixed inset-0 z-50 flex flex-col"
            style={{ background: "var(--surface-container-low)" }}
          >
            {/* Top bar */}
            <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: "1px solid var(--outline-variant)" }}>
              <div className="flex items-center gap-3">
                <motion.button
                  onClick={() => setFullOpen(false)}
                  className="w-10 h-10 rounded-full flex items-center justify-center active:scale-[0.9] transition-transform"
                  style={{ background: "rgba(0,0,0,0)", border: "none", cursor: "pointer", outline: "none", color: "var(--text-default)" }}
                  aria-label="Chiudi"
                >
                  <X size={20} />
                </motion.button>
                <span style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: "var(--font-size-3xl)",
                  fontWeight: "var(--weight-bold)" as any,
                  color: "var(--text-default)",
                }}>
                  Dettaglio ricetta
                </span>
              </div>
              <motion.button
                onClick={() => setFullOpen(false)}
                className="px-5 py-2 rounded-xl active:scale-95 transition-transform"
                style={{
                  background: "var(--primary)", color: "var(--primary-foreground)",
                  border: "none", cursor: "pointer", outline: "none",
                  fontFamily: "'DM Sans', sans-serif", fontSize: "var(--font-size-lg)", fontWeight: "var(--weight-semibold)" as any,
                }}
              >
                Salva
              </motion.button>
            </div>
            {/* Content placeholder */}
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center p-6">
                <Flame size={48} style={{ color: "var(--primary)", margin: "0 auto 16px" }} />
                <div style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: "var(--font-size-6-5xl)",
                  fontWeight: "var(--weight-bold)" as any,
                  color: "var(--text-default)",
                }}>
                  Full-screen Dialog
                </div>
                <p style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: "var(--font-size-xl)",
                  color: "var(--muted-foreground)",
                  marginTop: "8px",
                  maxWidth: "320px",
                }}>
                  Usato per task complessi che richiedono l'intera viewport. Transizione slide-up con spring.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <SubSectionLabel label="Linee guida" />
      <LineeGuida
        fai={[
          "Alert per informazioni importanti che richiedono conferma (es. eliminazione)",
          "Confirmation per scelte binarie (es. Annulla/Conferma)",
          "Full-screen per form complessi o contenuti che richiedono spazio",
        ]}
        nonFare={[
          "Mai dialog per messaggi non critici — usare snackbar o toast",
          "Mai più di 2 azioni in Alert/Confirm — usare full-screen",
          "Mai dialog senza via d'uscita (Escape, X, o scrim click)",
        ]}
      />

      <SubSectionLabel label="Accessibilità" />
      <AccessibilitaInfo items={[
        { label: "Focus trap", desc: "Focus resta nel dialog. Escape chiude. Focus restituito al trigger." },
        { label: "ARIA", desc: "role='alertdialog' (Alert) o role='dialog'. aria-modal='true'. aria-labelledby su headline." },
      ]} />

      {/* Anatomy */}
      <div className="surface-card p-5">
        <span className="type-label" style={{ color: "var(--text-default)", fontSize: "var(--font-size-base)" }}>Anatomia</span>
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <AnatomyRow prop="Scrim" val="rgba(0,0,0,0.32). Click per dismissare (Alert/Confirm)." />
          <AnatomyRow prop="Container" val="surface-container-high, radius 28px (rounded-3xl), shadow-lg. Max 560px." />
          <AnatomyRow prop="Headline" val="Playfair Display, 1.25rem, weight 700. Centrato (Alert) o allineato sx (Confirm)." />
          <AnatomyRow prop="Actions" val="Centrato (Alert), flex-end (Confirm). Primary button + text button opzionale." />
          <AnatomyRow prop="Full-screen" val="Nessuno scrim. Slide-up spring. Top bar con X e azione primaria." />
          <AnatomyRow prop="Motion" val="Scale 0.85→1 (Alert/Confirm). Slide Y 40→0 (Full-screen). Spring stiffness:400 damping:25." />
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   C28 — ICON BUTTON  (M3 Expressive)
   Standard, Filled, Filled Tonal, Outlined
   ═══════════════════════════════════════════════════════════ */

export function IconButtonSpec() {
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
      label: "Standard",
      bg: "rgba(0,0,0,0)",
      bgHover: "color-mix(in srgb, var(--on-surface-variant) 8%, rgba(0,0,0,0))",
      fg: "var(--on-surface-variant)",
      border: "none",
    },
    {
      id: "filled",
      label: "Filled",
      bg: "var(--primary)",
      bgHover: "var(--primary)",
      fg: "var(--primary-foreground)",
      border: "none",
    },
    {
      id: "tonal",
      label: "Filled Tonal",
      bg: "var(--primary-container)",
      bgHover: "var(--primary-container)",
      fg: "var(--on-primary-container)",
      border: "none",
    },
    {
      id: "outlined",
      label: "Outlined",
      bg: "rgba(0,0,0,0)",
      bgHover: "color-mix(in srgb, var(--on-surface-variant) 8%, rgba(0,0,0,0))",
      fg: "var(--on-surface-variant)",
      border: "1px solid var(--outline)",
    },
  ];

  return (
    <div className="flex flex-col gap-8">
      <SectionHeader
        title="Icon Button"
        description="M3 definisce 4 varianti di bottone icona: Standard (nessun container), Filled, Filled Tonal e Outlined. Supportano toggle state (cuore/stella) con animazione spring. 3 taglie: 40/48/56px."
      />

      <SubSectionLabel label="Panoramica" />
      <Panoramica
        descrizione="4 varianti di Icon Button M3: Standard (no bg), Filled (primary), Filled Tonal (primary-container), Outlined (transparent + border). Toggle state con pulse animation (scale 1→1.3→1). 3 taglie: 32/40/48px."
        principi={[
          "Standard: nessun container, solo icona. Per azioni secondarie",
          "Filled/Tonal: container colorato per azioni prominenti",
          "Toggle: pulse scale 1→1.3→1 + cambio variant off→on",
        ]}
      />

      <SubSectionLabel label="Specifiche" />

      {/* Variant grid */}
      <div className="surface-card p-5">
        <span className="type-label" style={{ color: "var(--text-default)", fontSize: "var(--font-size-base)" }}>Varianti — 4 stili</span>
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
          {VARIANTS.map((v) => (
            <div key={v.id} className="flex flex-col items-center gap-3">
              <div className="flex items-center gap-2">
                {[Flame, Star, Settings].map((Icon, i) => (
                  <motion.button
                    key={i}
                    whileHover={{ scale: 1.05 }}
                    className="w-10 h-10 rounded-full flex items-center justify-center active:scale-[0.85] transition-transform"
                    style={{
                      background: v.bg,
                      color: v.fg,
                      border: v.border,
                      cursor: "pointer",
                      outline: "none",
                    }}
                    aria-label={`${v.label} icon button`}
                  >
                    <Icon size={20} />
                  </motion.button>
                ))}
              </div>
              <span className="type-label text-center" style={{ color: "var(--muted-foreground)", fontSize: "var(--font-size-md)", letterSpacing: "var(--tracking-caps)" }}>{v.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Toggle icon buttons */}
      <div className="surface-card p-5">
        <span className="type-label" style={{ color: "var(--text-default)", fontSize: "var(--font-size-base)" }}>Toggle — Clicca per attivare</span>
        <div className="mt-4 flex items-center gap-6 justify-center">
          {[
            { id: "heart", Icon: Heart, label: "Preferito" },
            { id: "star", Icon: Star, label: "Valuta" },
          ].map((item) => {
            const isOn = toggled[item.id];
            return (
              <div key={item.id} className="flex flex-col items-center gap-2">
                <button
                  onClick={() => toggleIcon(item.id)}
                  className="w-12 h-12 rounded-full flex items-center justify-center active:scale-[0.8]"
                  style={{
                    background: isOn ? "var(--primary)" : "rgba(0,0,0,0)",
                    color: isOn ? "var(--primary-foreground)" : "var(--on-surface-variant)",
                    border: isOn ? "none" : "1px solid var(--outline)",
                    cursor: "pointer",
                    outline: "none",
                    transition: "background 0.15s, color 0.15s, border-color 0.15s",
                  }}
                  aria-label={item.label}
                  aria-pressed={isOn}
                >
                  <motion.div
                    animate={{ scale: isOn ? [1, 1.3, 1] : 1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  >
                    <item.Icon size={22} fill={isOn ? "currentColor" : "none"} />
                  </motion.div>
                </button>
                <span className="type-code" style={{
                  fontWeight: "var(--weight-semibold)" as any,
                  color: isOn ? "var(--primary)" : "var(--muted-foreground)",
                }}>
                  {isOn ? "ON" : "OFF"}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Sizes */}
      <div className="surface-card p-5">
        <span className="type-label" style={{ color: "var(--text-default)", fontSize: "var(--font-size-base)" }}>Taglie</span>
        <div className="mt-4 flex items-end gap-6 justify-center">
          {[
            { size: 32, icon: 16, label: "Small" },
            { size: 40, icon: 20, label: "Medium" },
            { size: 48, icon: 24, label: "Large" },
          ].map((s) => (
            <div key={s.label} className="flex flex-col items-center gap-2">
              <motion.div
                className="rounded-full flex items-center justify-center cursor-pointer active:scale-[0.85] transition-transform"
                style={{
                  width: s.size,
                  height: s.size,
                  background: "var(--primary-container)",
                  color: "var(--on-primary-container)",
                }}
              >
                <Flame size={s.icon} />
              </motion.div>
              <span className="type-code" style={{ color: "var(--muted-foreground)" }}>
                {s.label} · {s.size}px
              </span>
            </div>
          ))}
        </div>
      </div>

      <SubSectionLabel label="Linee guida" />
      <LineeGuida
        fai={[
          "Standard per azioni secondarie in toolbar (es. share, more)",
          "Filled per azioni primarie isolate (es. play, add)",
          "Toggle con pulse per feedback visivo su like/bookmark/star",
        ]}
        nonFare={[
          "Mai icon button senza aria-label — l'icona da sola non basta",
          "Mai standard icon button su sfondo complesso — perde visibilità",
          "Mai toggle senza feedback visivo (colore + animazione)",
        ]}
      />

      <SubSectionLabel label="Accessibilità" />
      <AccessibilitaInfo items={[
        { label: "ARIA", desc: "aria-label descrittivo. Toggle: aria-pressed='true'/'false'." },
        { label: "Focus", desc: "Focus ring 3px primary su :focus-visible. Area minima 44×44px (WCAG)." },
      ]} />

      {/* Anatomy */}
      <div className="surface-card p-5">
        <span className="type-label" style={{ color: "var(--text-default)", fontSize: "var(--font-size-base)" }}>Anatomia</span>
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <AnatomyRow prop="Container" val="radius-full (cerchio). Standard: nessun bg. Filled: primary. Tonal: primary-container." />
          <AnatomyRow prop="Outlined" val="transparent bg, outline border 1px. Hover: 8% on-surface-variant overlay." />
          <AnatomyRow prop="Toggle" val="Off: outlined. On: filled (primary bg, icon fill). Pulse scale animation 1→1.3→1." />
          <AnatomyRow prop="Taglie" val="32px (small, icon 16), 40px (medium, icon 20), 48px (large, icon 24)." />
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   ENTRIES REGISTRY
   ═══════════════════════════════════════════════════════════ */
export const ENTRIES: SectionEntry[] = [
  { id: "tooltip", label: "Tooltip", group: "c", Component: TooltipSpec },
  { id: "dialog", label: "Dialog", group: "c", Component: DialogSpec },
  { id: "iconbutton", label: "Icon Button", group: "c", Component: IconButtonSpec },
];