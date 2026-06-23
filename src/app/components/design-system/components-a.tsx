import { ArrowRight,Check,Flame,Lightbulb,Moon,Star,Sun,Timer } from "lucide-react";
import { AnimatePresence,motion } from "motion/react";
import { useState } from "react";
import { ImageWithFallback } from "../media/ImageWithFallback";
import type { SectionEntry } from "./shared";
import { AccessibilitaInfo,LineeGuida,Panoramica,SectionHeader,SubSectionLabel } from "./shared";

/* ═══ C01: BUTTONS ═══ */
const BTN_V = [
  { v: "Primary", bg: "var(--cta)", c: "var(--cta-foreground)", b: "none", h: "color-mix(in srgb,var(--cta) 88%,black)" },
  { v: "Secondary", bg: "var(--surface-container)", c: "var(--text-default)", b: "1px solid var(--outline-variant)", h: "var(--surface-container-high)" },
  { v: "Ghost", bg: "rgba(0,0,0,0)", c: "var(--primary)", b: "none", h: "color-mix(in srgb,var(--primary) 8%,transparent)" },
  { v: "Destructive", bg: "var(--destructive)", c: "var(--destructive-foreground)", b: "none", h: "color-mix(in srgb,var(--destructive) 88%,black)" },
];
export function ButtonsSpec() {
  return (
    <div className="flex flex-col gap-8">
      <SectionHeader title="Bottoni" description="4 varianti x 3 taglie. active:scale-95, hover CSS transition." />

      <SubSectionLabel label="Panoramica" />
      <Panoramica
        descrizione="I bottoni di Vulcan seguono 4 varianti gerarchiche: Primary (CTA verde sage), Secondary (surface), Ghost (trasparente) e Destructive (rosso). Feedback tattile con active:scale-95."
        principi={[
          "Primary per l'azione principale di ogni schermata — mai più di un Primary visibile",
          "active:scale-95 per feedback tattile immediato su tutti i bottoni",
          "Hover con CSS transition (non motion) per performance",
        ]}
        anatomia={[
          { parte: "Container", desc: "rounded-xl, padding px-5 py-2.5" },
          { parte: "Label", desc: "DM Sans, font-size-lg, weight-semibold" },
          { parte: "State layer", desc: "8% hover, 12% press via CSS transition" },
          { parte: "Focus ring", desc: "3px primary, offset 2px" },
        ]}
      />

      <SubSectionLabel label="Specifiche" />
      <div className="surface-card p-5">
        <span className="type-label" style={{ color: "var(--text-default)", fontSize: "var(--font-size-base)" }}>Varianti</span>
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
          {BTN_V.map((btn) => (
            <motion.button key={btn.v} className="rounded-xl px-5 py-2.5 cursor-pointer active:scale-95" style={{ background: btn.bg, color: btn.c, border: btn.b, fontFamily: "'DM Sans',sans-serif", fontSize: "var(--font-size-lg)", fontWeight: "var(--weight-semibold)" as any, outline: "none", transition: "background 0.15s" }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = btn.h; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = btn.bg; }}
            >{btn.v}</motion.button>
          ))}
        </div>
      </div>

      <SubSectionLabel label="Linee guida" />
      <LineeGuida
        fai={[
          "Un solo Primary visibile per schermata — gerarchia chiara",
          "active:scale-95 su tutti i bottoni per feedback tattile",
          "Hover con CSS transition per performance — non motion.button per hover",
        ]}
        nonFare={[
          "Mai due bottoni Primary affiancati — usare Primary + Secondary",
          "Mai rimuovere il feedback tattile (scale) per 'pulizia'",
          "Mai usare whileHover di motion per i bottoni — solo CSS transition",
        ]}
        responsive="Su mobile i bottoni diventano full-width (w-full) sotto 640px. In colonne verticali con gap-3."
      />

      <SubSectionLabel label="Accessibilità" />
      <AccessibilitaInfo items={[
        { label: "Focus ring", desc: "3px solid var(--primary), offset 2px. Visibile solo via :focus-visible." },
        { label: "Contrasto", desc: "WCAG AAA per Primary e Destructive. AA per Ghost (testo su transparent)." },
        { label: "ARIA", desc: "aria-disabled su bottoni disabilitati. aria-busy durante loading." },
      ]} />
    </div>
  );
}

/* ═══ C02: BADGES ═══ */
export function BadgesSpec() {
  return (
    <div className="flex flex-col gap-8">
      <SectionHeader title="Badge & InlineTip" description="Badge tier, data badge (DM Mono nerd-only), InlineTip con Lightbulb." />

      <SubSectionLabel label="Panoramica" />
      <Panoramica
        descrizione="Tre tipi di badge: Tier Badge per classificare gli stili (perfect/good/challenging), Data Badge per valori tecnici (W, H%, ore), e InlineTip per suggerimenti contestuali con icona Lightbulb."
        principi={[
          "Tier Badge: dot colorato + label — il colore comunica la qualità del match",
          "Data Badge: DM Mono con tabular-nums — riservato a valori scientifici/nerd (W, P/L, aw)",
          "InlineTip: background ambra soft + Lightbulb per suggerimenti contestuali",
        ]}
        anatomia={[
          { parte: "Tier dot", desc: "w-2 h-2 rounded-full, colore semantico" },
          { parte: "Data badge", desc: "DM Mono (nerd-only), font-size-base, primary su primary/10%" },
          { parte: "InlineTip", desc: "Lightbulb 16px + testo DM Sans su tertiary/8%" },
        ]}
      />

      <SubSectionLabel label="Specifiche" />
      <div className="surface-card p-5">
        <span className="type-label" style={{ color: "var(--text-default)", fontSize: "var(--font-size-base)" }}>Tier Badge</span>
        <div className="mt-4 flex flex-wrap gap-3">
          {[
            { l: "Perfect Match", c: "var(--cta)" },
            { l: "Buona Scelta", c: "var(--tertiary)" },
            { l: "Challenging", c: "var(--secondary)" },
          ].map(b => (
            <span key={b.l} className="px-3 py-1.5 rounded-lg flex items-center gap-1.5" style={{ background: `color-mix(in srgb,${b.c} 12%,transparent)`, border: `1px solid color-mix(in srgb,${b.c} 25%,transparent)` }}>
              <div className="w-2 h-2 rounded-full" style={{ background: b.c }} />
              <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "var(--font-size-md)", fontWeight: "var(--weight-semibold)" as any, color: b.c }}>{b.l}</span>
            </span>
          ))}
        </div>
      </div>
      <div className="surface-card p-5">
        <span className="type-label" style={{ color: "var(--text-default)", fontSize: "var(--font-size-base)" }}>Data Badge</span>
        <div className="mt-4 flex flex-wrap gap-2">
          {["W 280","H 65%","24h","250\u00b0C","P/L 0.58"].map(l => (
            <span key={l} className="px-2 py-1 rounded-md" style={{ fontFamily: "'DM Mono',monospace", fontSize: "var(--font-size-base)", fontWeight: "var(--weight-semibold)" as any, fontFeatureSettings: "'tnum'", color: "var(--primary)", background: "color-mix(in srgb,var(--primary) 10%,transparent)", border: "1px solid color-mix(in srgb,var(--primary) 20%,transparent)" }}>{l}</span>
          ))}
        </div>
      </div>
      <div className="surface-card p-5">
        <span className="type-label" style={{ color: "var(--text-default)", fontSize: "var(--font-size-base)" }}>InlineTip</span>
        <div className="mt-4 flex gap-3 p-3 rounded-xl" style={{ background: "color-mix(in srgb,var(--tertiary) 8%,transparent)", border: "1px solid color-mix(in srgb,var(--tertiary) 20%,transparent)" }}>
          <Lightbulb size={16} style={{ color: "var(--tertiary)", flexShrink: 0, marginTop: "2px" }} />
          <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "var(--font-size-md)", color: "var(--text-default)", lineHeight: "var(--leading-reading)" }}>
            <span style={{ fontWeight: "var(--weight-semibold)" as any }}>Suggerimento:</span> Con 65% di idratazione e W280, la Napoletana risulta perfetta per principianti.
          </p>
        </div>
      </div>

      <SubSectionLabel label="Linee guida" />
      <LineeGuida
        fai={[
          "Tier Badge: usare solo i 3 livelli standard (perfect/good/challenging)",
          "Data Badge: sempre DM Mono con tabular-nums — solo per valori scientifici (W, H%, P/L)",
          "InlineTip: breve e contestuale — massimo 2 righe di testo",
        ]}
        nonFare={[
          "Mai inventare nuovi tier — i 3 livelli coprono ogni caso",
          "Mai usare DM Sans per valori numerici nei badge",
          "Mai InlineTip senza icona Lightbulb — è il pattern riconoscibile",
        ]}
      />

      <SubSectionLabel label="Accessibilità" />
      <AccessibilitaInfo items={[
        { label: "Colore + testo", desc: "I tier badge usano colore + testo. Mai solo colore per comunicare il tier." },
        { label: "ARIA", desc: "InlineTip usa role='note' per screen reader. Badge decorativi: aria-hidden." },
      ]} />
    </div>
  );
}

/* ═══ C03: STEPHEADER ═══ */
export function StepHeaderSpec() {
  return (
    <div className="flex flex-col gap-8">
      <SectionHeader title="StepHeader" description="Titolone editoriale: DM Sans step number, Playfair title + italic sub, linea decorativa." />

      <SubSectionLabel label="Panoramica" />
      <Panoramica
        descrizione="Il StepHeader è il titolone editoriale che segna ogni macro-sezione del flusso. Composto da: step number (DM Sans uppercase, classe type-step-num), titolo principale (Playfair Display), sottotitolo (Playfair italic), e linea decorativa."
        principi={[
          "Ingresso animato con whileInView (once: true, amount: 0.5)",
          "Step number: DM Sans (type-step-num), terracotta, tracking 0.18em — comunica progressione",
          "Titolo: Playfair Display con clamp() responsive",
        ]}
        anatomia={[
          { parte: "Step num", desc: "DM Sans (type-step-num), 0.6875rem, uppercase, tracking-extreme, primary" },
          { parte: "Title", desc: "Playfair Display, clamp(1.5rem,4vw,2.5rem), bold, line-height 1.1" },
          { parte: "Subtitle", desc: "Playfair Display italic, 1rem, muted, opacity 0.65" },
          { parte: "Divider", desc: "2rem wide, 2px height, primary, opacity 0.35" },
        ]}
      />

      <SubSectionLabel label="Specifiche" />
      <div className="surface-card p-5">
        <div className="flex flex-col gap-8">
          {[
            { num: "01", cat: "Contesto", title: "Quando e dove", sub: "Tempo, luogo, stagione" },
            { num: "02", cat: "Setup", title: "Cosa hai a disposizione", sub: "Attrezzatura, dispensa, esperienza" },
            { num: "03", cat: "Stili", title: "Scopri il tuo stile", sub: "Le ricette che fanno per te" },
          ].map(s => (
            <motion.div key={s.num} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ type: "spring", stiffness: 300, damping: 24 }} className="flex flex-col gap-1">
              <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "var(--font-size-base)", fontWeight: "var(--weight-semibold)" as any, letterSpacing: "var(--tracking-extreme)", textTransform: "uppercase", color: "var(--primary)" }}>{s.num} — {s.cat}</span>
              <span style={{ fontFamily: "'Playfair Display',serif", fontSize: "clamp(1.5rem,4vw,2.5rem)", fontWeight: "var(--weight-bold)" as any, lineHeight: "var(--leading-snug)", color: "var(--text-default)" }}>{s.title}</span>
              <span style={{ fontFamily: "'Playfair Display',serif", fontStyle: "italic", fontSize: "var(--font-size-2xl)", color: "var(--muted-foreground)", opacity: 0.65 }}>{s.sub}</span>
              <div style={{ width: "2rem", height: "2px", background: "var(--primary)", opacity: 0.35, marginTop: "8px" }} />
            </motion.div>
          ))}
        </div>
      </div>

      <SubSectionLabel label="Linee guida" />
      <LineeGuida
        fai={[
          "Usare whileInView con once: true per l'animazione d'ingresso",
          "Step number sempre con DM Sans uppercase (type-step-num) e tracking-extreme",
          "Titolo con clamp() per responsive naturale senza breakpoint",
        ]}
        nonFare={[
          "Mai più di 3 StepHeader in una pagina — il flusso ha 3 sezioni",
          "Mai omettere la linea decorativa — è la firma visiva del pattern",
          "Mai usare DM Sans per il titolo — Playfair Display è obbligatorio",
        ]}
      />

      <SubSectionLabel label="Accessibilità" />
      <AccessibilitaInfo items={[
        { label: "Heading", desc: "Il titolo è un <h2> semantico. Il sottotitolo è un <span> — non un heading." },
        { label: "Reduced motion", desc: "Con prefers-reduced-motion: l'animazione d'ingresso è disabilitata." },
      ]} />
    </div>
  );
}

/* ═══ C04: CHIPS ═══ */
const CHIPS = [
  { id: "tonight", label: "Stasera", icon: Moon },
  { id: "lunch", label: "Domani pranzo", icon: Sun },
  { id: "dinner", label: "Domani cena", icon: Flame },
  { id: "dayafter", label: "Dopodomani", icon: Timer },
  { id: "weekend", label: "Weekend", icon: Star },
];
export function ChipsSpec() {
  const [sel, setSel] = useState<Set<string>>(new Set(["tonight"]));
  const toggle = (id: string) => setSel(p => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; });
  return (
    <div className="flex flex-col gap-8">
      <SectionHeader title="UnifiedChip" description="Toggle chip con check animato. Attivo: primary bg + Check spring-in." />

      <SubSectionLabel label="Panoramica" />
      <Panoramica
        descrizione="Il chip è l'unità di selezione principale in Vulcan. Supporta toggle singolo e multiplo. Lo stato attivo mostra un Check animato con spring (stiffness: 500, damping: 25)."
        principi={[
          "Inattivo: surface-container bg, outline-variant border",
          "Attivo: primary bg con Check icon che scala da 0 a 1 via spring",
          "Transizioni colore via CSS transition (background 0.15s) — mai spring per colori",
        ]}
        anatomia={[
          { parte: "Container", desc: "rounded-xl, px-4 py-2.5, border 1px" },
          { parte: "Icon", desc: "16px, AnimatePresence swap check ↔ icon" },
          { parte: "Label", desc: "DM Sans, font-size-lg, weight-medium" },
        ]}
      />

      <SubSectionLabel label="Specifiche" />
      <div className="surface-card p-5">
        <span className="type-label" style={{ color: "var(--text-default)", fontSize: "var(--font-size-base)" }}>Quando prepari?</span>
        <div className="mt-4 flex flex-wrap gap-2.5">
          {CHIPS.map(c => {
            const a = sel.has(c.id); const I = c.icon;
            return (
              <motion.button key={c.id} onClick={() => toggle(c.id)} className="flex items-center gap-2 rounded-xl px-4 py-2.5 cursor-pointer active:scale-95"
                style={{ background: a ? "var(--primary)" : "var(--surface-container)", color: a ? "var(--primary-foreground)" : "var(--text-default)", border: a ? "1px solid var(--primary)" : "1px solid var(--outline-variant)", fontFamily: "'DM Sans',sans-serif", fontSize: "var(--font-size-lg)", fontWeight: "var(--weight-medium)" as any, outline: "none", transition: "background .15s,color .15s,border-color .15s" }}>
                <AnimatePresence mode="wait">
                  {a ? <motion.div key="ck" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} transition={{ type: "spring", stiffness: 500, damping: 25 }}><Check size={14} /></motion.div>
                     : <motion.div key="ic" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} transition={{ type: "spring", stiffness: 500, damping: 25 }}><I size={14} /></motion.div>}
                </AnimatePresence>
                {c.label}
              </motion.button>
            );
          })}
        </div>
      </div>

      <SubSectionLabel label="Linee guida" />
      <LineeGuida
        fai={[
          "Usare AnimatePresence mode='wait' per swap icona ↔ check",
          "active:scale-95 per feedback tattile su click",
          "Colori transizionati via CSS transition — non spring per colori",
        ]}
        nonFare={[
          "Mai più di 7 chip in una riga — wrappare con flex-wrap",
          "Mai usare whileTap di motion — usare active:scale-95 CSS",
          "Mai omettere l'icona — il chip senza icona perde identità",
        ]}
      />

      <SubSectionLabel label="Accessibilità" />
      <AccessibilitaInfo items={[
        { label: "ARIA", desc: "role='checkbox' con aria-checked per toggle singolo. role='option' per selezione esclusiva." },
        { label: "Focus", desc: "Focus ring 3px primary su :focus-visible. Navigazione con Tab + Space per toggle." },
      ]} />
    </div>
  );
}

/* ═══ C05: CARDS ═══ */
const CARD_V = [
  { v: "Flat", bg: "var(--surface-container-low)", hs: "var(--shadow-sm)", c: "var(--primary)", d: "Card standard. Hover aggiunge shadow." },
  { v: "Elevated", bg: "var(--surface-container-low)", s: "var(--shadow-md)", hs: "var(--shadow-lg)", c: "var(--tertiary)", d: "Card elevata. Hover intensifica ombra." },
  { v: "Filled", bg: "var(--surface-container)", c: "var(--cta)", d: "Card riempita. Background piu denso." },
];
export function CardsSpec() {
  return (
    <div className="flex flex-col gap-8">
      <SectionHeader title="Card / Container" description="3 varianti base + Media Card con foto. Hover per transizioni!" />

      <SubSectionLabel label="Panoramica" />
      <Panoramica
        descrizione="Le card sono i container principali per raggruppare contenuti. 3 varianti: Flat (base), Elevated (con ombra), Filled (sfondo denso). La Media Card aggiunge un'immagine hero con badge overlay."
        principi={[
          "Radius: rounded-2xl (1rem) per tutte le varianti",
          "Border: 1px solid outline-variant — sempre presente, anche su Elevated",
          "Hover: whileHover con y: -2 e shadow upgrade via spring",
        ]}
        anatomia={[
          { parte: "Container", desc: "rounded-2xl, 1px outline-variant border" },
          { parte: "Padding", desc: "p-4 standard, p-5 per content-heavy" },
          { parte: "Media slot", desc: "aspect-ratio 16/9, object-fit cover, overflow hidden" },
          { parte: "Badge", desc: "Absolute top-3 left-3, glassmorphism background" },
        ]}
      />

      <SubSectionLabel label="Specifiche" />
      <div className="surface-card p-5">
        <span className="type-label" style={{ color: "var(--text-default)", fontSize: "var(--font-size-base)" }}>Varianti base</span>
        <div className="mt-4 grid grid-cols-3 gap-3">
          {CARD_V.map(c => (
            <div key={c.v} className="flex flex-col gap-2">
              <span className="type-label" style={{ color: c.c }}>{c.v}</span>
              <motion.div className="p-4 rounded-2xl cursor-pointer active:scale-[0.98]" style={{ background: c.bg, border: "1px solid var(--outline-variant)", boxShadow: c.s || "none" }} whileHover={{ boxShadow: c.hs || "none", y: -2 }} transition={{ type: "spring", stiffness: 400, damping: 25 }}>
                <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "var(--font-size-lg)", color: "var(--text-default)", lineHeight: "var(--leading-relaxed)" }}>{c.d}</p>
              </motion.div>
            </div>
          ))}
        </div>
      </div>
      <div className="surface-card p-5">
        <span className="type-label" style={{ color: "var(--text-default)", fontSize: "var(--font-size-base)" }}>Media Card</span>
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { t: "Napoletana STG", s: "AVPN", b: "Forno legna 450\u00b0C, 60-90s.", img: "https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxuZWFwb2xpdGFuJTIwcGl6emElMjBtYXJnaGVyaXRhJTIwd29vZCUyMGZpcmV8ZW58MXx8fHwxNzcxMjMwNTM5fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=vulcan&utm_medium=referral", badge: "W 250\u2013320", bc: "var(--primary)" },
            { t: "Lunga Maturazione", s: "72h frigo", b: "Fermentazione 4\u00b0C, alveolatura aperta.", img: "https://images.unsplash.com/photo-1738717201744-9faf699eea3d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwaXp6YSUyMGRvdWdoJTIwZmVybWVudGF0aW9uJTIwc291cmRvdWdofGVufDF8fHx8MTc3MTIzMDU0Mnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=vulcan&utm_medium=referral", badge: "72h frigo", bc: "var(--cta)" },
          ].map(c => (
            <motion.div key={c.t} className="rounded-2xl overflow-hidden cursor-pointer active:scale-[0.98]" style={{ background: "var(--surface-container-low)", border: "1px solid var(--outline-variant)" }} whileHover={{ y: -4, boxShadow: "var(--shadow-lg)" }} transition={{ type: "spring", stiffness: 400, damping: 25 }}>
              <div className="relative" style={{ aspectRatio: "16/9", overflow: "hidden" }}>
                <ImageWithFallback src={c.img} alt={c.t} className="w-full h-full" style={{ objectFit: "cover", display: "block" }} />
                <div className="absolute top-3 left-3">
                  <span className="px-2.5 py-1 rounded-lg" style={{ fontFamily: "'DM Mono',monospace", fontSize: "var(--font-size-base)", fontWeight: "var(--weight-semibold)" as any, fontFeatureSettings: "'tnum'", background: "color-mix(in srgb,var(--container-page) 85%,transparent)", backdropFilter: "blur(8px)", color: c.bc, border: `1px solid color-mix(in srgb,${c.bc} 30%,transparent)` }}>{c.badge}</span>
                </div>
              </div>
              <div className="p-4 flex flex-col gap-1.5">
                <div className="flex items-baseline justify-between">
                  <span style={{ fontFamily: "'Playfair Display',serif", fontSize: "var(--font-size-2xl)", fontWeight: "var(--weight-bold)" as any, color: "var(--text-default)" }}>{c.t}</span>
                  <span style={{ fontFamily: "'DM Mono',monospace", fontSize: "var(--font-size-base)", color: "var(--muted-foreground)", fontFeatureSettings: "'tnum'" }}>{c.s}</span>
                </div>
                <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "var(--font-size-md)", color: "var(--muted-foreground)", lineHeight: "var(--leading-relaxed)" }}>{c.b}</p>
                <div className="flex items-center gap-1 mt-1" style={{ color: "var(--primary)" }}>
                  <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "var(--font-size-md)", fontWeight: "var(--weight-semibold)" as any }}>Configura</span>
                  <ArrowRight size={14} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <SubSectionLabel label="Linee guida" />
      <LineeGuida
        fai={[
          "Sempre border 1px outline-variant — anche su Elevated con ombra",
          "Hover con spring (stiffness: 400, damping: 25) per y: -2",
          "Media Card: immagine con aspect-ratio 16/9 e object-fit cover",
        ]}
        nonFare={[
          "Mai box-shadow senza border — l'ombra da sola non basta in dark mode",
          "Mai card senza padding — minimo p-4",
          "Mai nesting card dentro card — usare section dividers",
        ]}
        responsive="Su mobile le card Media diventano full-width in colonna singola. Le card base mantengono il grid 3-col con gap ridotto."
      />

      <SubSectionLabel label="Accessibilità" />
      <AccessibilitaInfo items={[
        { label: "Interattiva", desc: "Card cliccabili: role='button' o <a> semantico. Mai div con onClick." },
        { label: "Immagini", desc: "Alt text descrittivo su tutte le immagini della Media Card." },
        { label: "Contrasto", desc: "Testo su surface-container-low: ratio minimo 4.5:1 (AA)." },
      ]} />
    </div>
  );
}

/* ═══ C06: INPUTS ═══ */
const SL = [
  { l: "Idratazione", min: 45, max: 100, u: "%" },
  { l: "Farina W", min: 150, max: 400, u: "" },
  { l: "Fermentazione", min: 2, max: 72, u: "h" },
];
export function InputsSpec() {
  const [sv, setSv] = useState<Record<string, number>>({ Idratazione: 65, "Farina W": 280, Fermentazione: 24 });
  return (
    <div className="flex flex-col gap-8">
      <SectionHeader title="Input & Slider" description="Slider trascinabili con accent primario e label tabular-nums." />

      <SubSectionLabel label="Panoramica" />
      <Panoramica
        descrizione="Gli slider sono il controllo fine-tuning principale di Vulcan. Track sottile con fill accent, thumb circolare con ombra, e label numerica DM Mono con tabular-nums per cifre allineate."
        principi={[
          "Track: h-1.5, surface-container-high bg, rounded-full",
          "Fill: primary color, larghezza proporzionale al valore",
          "Label: DM Mono con tabular-nums e fontFeatureSettings 'tnum'",
        ]}
        anatomia={[
          { parte: "Track", desc: "h-1.5 rounded-full, surface-container-high" },
          { parte: "Fill", desc: "Sovrapposizione h-1.5, primary color, width %" },
          { parte: "Thumb", desc: "w-4 h-4 rounded-full, primary, shadow-sm" },
          { parte: "Value label", desc: "DM Mono, font-size-xl, bold, primary, tnum" },
        ]}
      />

      <SubSectionLabel label="Specifiche" />
      <div className="surface-card p-5">
        <span className="type-label" style={{ color: "var(--text-default)", fontSize: "var(--font-size-base)" }}>Slider</span>
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-6">
          {SL.map(s => {
            const v = sv[s.l]; const p = ((v - s.min) / (s.max - s.min)) * 100;
            return (
              <div key={s.l}>
                <div className="flex items-center justify-between mb-2">
                  <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "var(--font-size-lg)", fontWeight: "var(--weight-semibold)" as any, color: "var(--text-default)" }}>{s.l}</span>
                  <span className="type-data-lg" style={{ fontWeight: "var(--weight-bold)" as any, color: "var(--primary)", fontFeatureSettings: "'tnum'" }}>{v}{s.u}</span>
                </div>
                <div className="relative h-8 flex items-center">
                  <div className="absolute left-0 right-0 h-1.5 rounded-full" style={{ background: "var(--surface-container-high)" }} />
                  <div className="absolute left-0 h-1.5 rounded-full" style={{ width: `${p}%`, background: "var(--primary)" }} />
                  <input type="range" min={s.min} max={s.max} value={v} onChange={e => setSv(prev => ({ ...prev, [s.l]: +e.target.value }))} className="absolute left-0 right-0 w-full h-full opacity-0 cursor-pointer" style={{ margin: 0 }} />
                  <div className="absolute w-4 h-4 rounded-full" style={{ left: `calc(${p}% - 8px)`, background: "var(--primary)", boxShadow: "var(--shadow-sm)", pointerEvents: "none" }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <SubSectionLabel label="Linee guida" />
      <LineeGuida
        fai={[
          "Mostrare sempre il valore numerico corrente accanto al label",
          "Usare tabular-nums per evitare jump del layout durante il drag",
          "Range min/max coerenti con i parametri dello stile selezionato",
        ]}
        nonFare={[
          "Mai slider senza label testuale — il valore da solo non basta",
          "Mai rimuovere il thumb visuale — l'input nativo è invisible",
          "Mai step discreti non multipli — usare step=1 di default",
        ]}
        comportamento="Il drag aggiorna il valore in real-time. Il rilascio trigger il ricalcolo della ricetta. Su touch, l'area di hit è espansa a 44px."
      />

      <SubSectionLabel label="Accessibilità" />
      <AccessibilitaInfo items={[
        { label: "Input nativo", desc: "<input type='range'> sotto il custom visual — screen reader e tastiera funzionano out of the box." },
        { label: "ARIA", desc: "aria-label con nome parametro + unità. aria-valuemin/max/now per il range." },
        { label: "Touch target", desc: "Area di hit minima 44x44px per WCAG 2.5.5 (Target Size)." },
      ]} />
    </div>
  );
}

/* ═══ ENTRIES ═══ */
export const ENTRIES: SectionEntry[] = [
  { id: "buttons", label: "Bottoni", group: "c", Component: ButtonsSpec },
  { id: "badges", label: "Badge & InlineTip", group: "c", Component: BadgesSpec },
  { id: "stepheader", label: "StepHeader", group: "c", Component: StepHeaderSpec },
  { id: "chips", label: "UnifiedChip", group: "c", Component: ChipsSpec },
  { id: "cards", label: "Card / Container", group: "c", Component: CardsSpec },
  { id: "inputs", label: "Input & Slider", group: "c", Component: InputsSpec },
];