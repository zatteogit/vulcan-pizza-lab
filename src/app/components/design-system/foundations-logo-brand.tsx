import { motion } from "motion/react";
import { useState } from "react";
import { DoughBlob,type DoughVariant } from "../../features/cooking/dough-mascot";
import { VulcanHero } from "../shared/vulcan-hero";
import type { VulcanVariant } from "../shared/vulcan-logo";

/* ═══════════════════════════════════════════════════════════
   Logo Brand Sub-sections (extracted from foundations-logo.tsx)
   8. VulcanHero — Composizione armonizzata
   9. FireGlow — Sfondo animato
   10. DoughBlob — Forma organica energy-reactive
   ═══════════════════════════════════════════════════════════ */

/* ── 8. VULCAN HERO — Composizione armonizzata ── */
export function LogoHeroSubSection({ activeVariant }: { activeVariant: VulcanVariant }) {
  return (
    <div>
      <h3 className="type-subheading" style={{ color: "var(--text-default)", marginBottom: "var(--space-3)" }}>VulcanHero — Composizione armonizzata</h3>
      <div className="surface-card p-5">
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "var(--font-size-md)", color: "var(--muted-foreground)", lineHeight: "var(--leading-relaxed)" }}>
          Il mark gradient galleggia direttamente nel blob (variante <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "var(--font-size-base)", color: "var(--primary)" }}>forge</span>) come cristallizzazione della sua energia organica. Gradiente ember condiviso tra mark e blob layers, respiro sincronizzato con l'energy del blob.
        </p>

        <div className="mt-5 flex flex-col lg:flex-row gap-6">
          {/* Hero preview — forge variant */}
          <div className="flex flex-col gap-4 items-center lg:items-start" style={{ flexShrink: 0 }}>
            <div
              className="flex items-center justify-center rounded-2xl"
              style={{
                width: 240,
                height: 240,
                background: "var(--surface-container-low)",
                border: "1px solid var(--outline-variant)",
              }}
            >
              <VulcanHero size={200} energy={35} blobVariant="forge" logoVariant={activeVariant} />
            </div>

            {/* Scale comparison — 3 energy levels */}
            <div className="flex gap-3 items-end">
              {[
                { energy: 10, label: "Calmo" },
                { energy: 45, label: "Medio" },
                { energy: 85, label: "Intenso" },
              ].map((lvl) => (
                <div key={lvl.label} className="flex flex-col items-center gap-1.5">
                  <div
                    className="flex items-center justify-center rounded-xl"
                    style={{
                      width: 72,
                      height: 72,
                      background: "var(--surface-container)",
                      border: "1px solid var(--outline-variant)",
                    }}
                  >
                    <VulcanHero size={56} energy={lvl.energy} blobVariant="forge" logoVariant={activeVariant} />
                  </div>
                  <span className="type-code" style={{ fontSize: "var(--font-size-sm)", color: "var(--muted-foreground)" }}>{lvl.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Anatomy + specs */}
          <div className="flex-1 min-w-0 flex flex-col gap-4">
            {/* Composition anatomy cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { title: "Blob forge", desc: "Variante dedicata con keyframes bottom-heavy che rimano con il vertice caldo del mark. Rotazione lenta continua per dinamismo organico.", color: "var(--tertiary)", spec: "keyframes slice-vertex · rotazione 45s" },
                { title: "Mark gradient", desc: "Gradiente ember proprietario a 135°: #f36b3d -> #ea4e27 -> #b93620. Glow radial per profondita.", color: "var(--logo-solid)", spec: "logo-ember 135° · glow radial" },
                { title: "Respiro sync", desc: "Il mark respira +-1.5% in scala, sincronizzato con la velocita del ciclo blob. L'ampiezza segue l'energy parametricamente.", color: "var(--cta)", spec: "scale +-1.5% · sync energy-driven" },
                { title: "Composizione", desc: "Componente composable con 5 prop: size, energy, blobVariant, logoVariant, markRatio. Il rapporto mark/blob e calibrato per variante.", color: "var(--muted-foreground)", spec: "markRatio auto · 5 props" },
              ].map((layer) => (
                <div
                  key={layer.title}
                  className="p-3 rounded-xl"
                  style={{
                    background: "var(--surface-container)",
                    border: "1px solid var(--outline-variant)",
                  }}
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: layer.color }} />
                    <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "var(--font-size-md)", fontWeight: "var(--weight-semibold)" as any, color: "var(--text-default)" }}>{layer.title}</span>
                  </div>
                  <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "var(--font-size-base)", color: "var(--muted-foreground)", lineHeight: "var(--leading-relaxed)" }}>{layer.desc}</p>
                  <code style={{ fontFamily: "'DM Mono', monospace", fontSize: "var(--font-size-sm)", color: "var(--primary)", display: "block", marginTop: "6px", fontFeatureSettings: "'tnum'" }}>{layer.spec}</code>
                </div>
              ))}
            </div>

            {/* Specs riepilogative */}
            <div className="flex flex-col gap-1.5 mt-1">
              {[
                { prop: "Forma", val: "Forge slice-vertex — keyframes bottom-heavy che rimano col mark" },
                { prop: "Colore", val: "Gradiente ember 135°: #f36b3d -> #ea4e27 -> #b93620" },
                { prop: "Layers", val: "Mark gradient+glow sovrapposto a blob forge con rotazione lenta" },
                { prop: "Breath", val: "Mark +-1.5% scala, sync con velocita blob (energy-driven)" },
              ].map((a) => (
                <div key={a.prop} className="flex items-baseline gap-2">
                  <span className="type-code" style={{ color: "var(--primary)", fontWeight: "var(--weight-semibold)" as any, width: "55px", flexShrink: 0 }}>{a.prop}</span>
                  <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "var(--font-size-base)", color: "var(--muted-foreground)" }}>{a.val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── 9. FIREGLOW — Sfondo animato ── */
export function LogoFireGlowSubSection() {
  return (
    <div>
      <h3 className="type-subheading" style={{ color: "var(--text-default)", marginBottom: "var(--space-3)" }}>FireGlow — Sfondo animato warm</h3>
      <div className="surface-card p-5">
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "var(--font-size-md)", color: "var(--muted-foreground)", lineHeight: "var(--leading-relaxed)" }}>
          Tre radial gradient che fluttuano lentamente, creando un fondale caldo e organico. L'intensita e controllabile via prop e rispetta <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "var(--font-size-base)", color: "var(--primary)" }}>prefers-reduced-motion</span> con un wash statico.
        </p>

        <div className="mt-4 relative h-40 rounded-xl overflow-hidden" style={{ border: "1px solid var(--outline-variant)" }}>
          {/* Mini FireGlow simulation */}
          <div className="absolute inset-0" style={{ background: "var(--container-page)" }} />
          <motion.div
            animate={{ x: 15, y: -12, scale: 1.05 }}
            transition={{
              x: { duration: 20, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" },
              y: { duration: 26, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" },
              scale: { duration: 30, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" },
            }}
            style={{
              position: "absolute", top: "-20%", right: "-15%", width: "60%", height: "80%",
              borderRadius: "50%",
              background: "radial-gradient(ellipse at center, var(--primary) 0%, transparent 70%)",
              opacity: 0.12,
              willChange: "transform",
            }}
          />
          <motion.div
            animate={{ x: 12, y: -10, scale: 1.06 }}
            transition={{
              x: { duration: 24, repeat: Infinity, repeatType: "reverse", ease: "easeInOut", delay: 2 },
              y: { duration: 18, repeat: Infinity, repeatType: "reverse", ease: "easeInOut", delay: 2 },
              scale: { duration: 28, repeat: Infinity, repeatType: "reverse", ease: "easeInOut", delay: 2 },
            }}
            style={{
              position: "absolute", top: "30%", left: "-10%", width: "50%", height: "60%",
              borderRadius: "50%",
              background: "radial-gradient(ellipse at center, var(--tertiary) 0%, transparent 65%)",
              opacity: 0.09,
              willChange: "transform",
            }}
          />
          <div className="absolute bottom-3 left-3 right-3 p-2.5 rounded-lg" style={{
            background: "color-mix(in srgb, var(--container-page) 90%, transparent)",
            backdropFilter: "blur(12px)",
          }}>
            <span className="type-data" style={{ color: "var(--muted-foreground)" }}>3 radial gradients drifting · prefers-reduced-motion: static wash</span>
          </div>
        </div>

        {/* Layer anatomy cards */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { title: "Primary ember", desc: "Radial gradient top-right, ciclo 18s. Colore primary con opacity 0.08-0.15.", color: "var(--primary)", spec: "top-right · 18s · opacity 0.12" },
            { title: "Tertiary amber", desc: "Radial gradient center-left, ciclo 22s, offset 2s. Colore tertiary per calore.", color: "var(--tertiary)", spec: "center-left · 22s · opacity 0.09" },
            { title: "Sienna bottom", desc: "Terzo layer basso, ciclo 25s, offset 4s. Warm sienna per profondita.", color: "var(--secondary)", spec: "bottom · 25s · opacity 0.07" },
          ].map((layer) => (
            <div
              key={layer.title}
              className="p-3 rounded-xl"
              style={{
                background: "var(--surface-container)",
                border: "1px solid var(--outline-variant)",
              }}
            >
              <div className="flex items-center gap-2 mb-1.5">
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: layer.color }} />
                <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "var(--font-size-md)", fontWeight: "var(--weight-semibold)" as any, color: "var(--text-default)" }}>{layer.title}</span>
              </div>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "var(--font-size-base)", color: "var(--muted-foreground)", lineHeight: "var(--leading-relaxed)" }}>{layer.desc}</p>
              <code style={{ fontFamily: "'DM Mono', monospace", fontSize: "var(--font-size-sm)", color: "var(--primary)", display: "block", marginTop: "6px", fontFeatureSettings: "'tnum'" }}>{layer.spec}</code>
            </div>
          ))}
        </div>

        <div className="mt-3 flex flex-col gap-1.5">
          {[
            { prop: "Intensity", val: "Prop 0-1, default 0.5, controlla opacita base di tutti i layer" },
            { prop: "A11y", val: "prefers-reduced-motion -> static wash senza animazione" },
          ].map((a) => (
            <div key={a.prop} className="flex items-baseline gap-2">
              <span className="type-code" style={{ color: "var(--primary)", fontWeight: "var(--weight-semibold)" as any, width: "60px", flexShrink: 0 }}>{a.prop}</span>
              <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "var(--font-size-base)", color: "var(--muted-foreground)" }}>{a.val}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── 10. DOUGHBLOB — Forma organica energy-reactive ── */
export function LogoDoughBlobSubSection() {
  const [blobEnergy, setBlobEnergy] = useState(50);
  const [blobVariant, setBlobVariant] = useState<DoughVariant>("stretch");

  const BLOB_VARIANTS: { id: DoughVariant; label: string; energy: number }[] = [
    { id: "rest", label: "Rest", energy: 15 },
    { id: "stretch", label: "Stretch", energy: 40 },
    { id: "fold", label: "Fold", energy: 55 },
    { id: "rise", label: "Rise", energy: 75 },
    { id: "spin", label: "Spin", energy: 90 },
    { id: "forge", label: "Forge (Magma)", energy: 80 },
    { id: "neural", label: "Neural (AI)", energy: 95 },
  ];

  return (
    <div>
      <h3 className="type-subheading" style={{ color: "var(--text-default)", marginBottom: "var(--space-3)" }}>DoughBlob — Forma organica energy-reactive</h3>
      <div className="surface-card p-5">
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "var(--font-size-md)", color: "var(--muted-foreground)", lineHeight: "var(--leading-relaxed)" }}>
          Forma organica a 5 layer CSS che reagisce all'energia della ricetta. È il nucleo visivo su cui si costruisce <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "var(--font-size-base)", color: "var(--primary)" }}>VulcanHero</span>: nella composizione hero, il blob usa la variante <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "var(--font-size-base)", color: "var(--primary)" }}>forge</span> e il mark gradient vi galleggia al centro, condividendo gradiente ember e respiro. Il morph dei borderRadius segue keyframes fluidi ispirati a Material Expressive; variante e livello di energia si mappano automaticamente dallo score composito tramite <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "var(--font-size-base)", color: "var(--primary)" }}>moodFromScore()</span>.
        </p>

        <div className="mt-5 flex flex-col lg:flex-row gap-6">
          {/* Blob standalone + VulcanHero comparison */}
          <div className="flex flex-col gap-4 items-center lg:items-start" style={{ flexShrink: 0 }}>
            {/* Side-by-side: standalone blob vs composed VulcanHero */}
            <div className="flex gap-3 items-end">
              <div className="flex flex-col items-center gap-1.5">
                <div
                  className="flex items-center justify-center rounded-2xl"
                  style={{
                    width: 200,
                    height: 200,
                    background: "var(--surface-container)",
                    border: "1px solid var(--outline-variant)",
                  }}
                >
                  <DoughBlob variant={blobVariant} size={160} energy={blobEnergy} />
                </div>
                <span className="type-code" style={{ fontSize: "var(--font-size-sm)", color: "var(--muted-foreground)" }}>Blob standalone</span>
              </div>
              <div className="flex flex-col items-center gap-1.5">
                <div
                  className="flex items-center justify-center rounded-2xl"
                  style={{
                    width: 96,
                    height: 96,
                    background: "var(--surface-container-low)",
                    border: "1px solid var(--outline-variant)",
                  }}
                >
                  <VulcanHero size={76} energy={blobEnergy} blobVariant="forge" logoVariant="naturale" />
                </div>
                <span className="type-code" style={{ fontSize: "var(--font-size-sm)", color: "var(--muted-foreground)" }}>→ in VulcanHero</span>
              </div>
            </div>

            {/* Energy slider */}
            <div style={{ width: "200px" }}>
              <div className="flex items-center justify-between mb-1.5">
                <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "var(--font-size-md)", fontWeight: "var(--weight-semibold)" as any, color: "var(--text-default)" }}>Energy</span>
                <span className="type-data" style={{ fontWeight: "var(--weight-bold)" as any, color: "var(--primary)", fontFeatureSettings: "'tnum'" }}>{blobEnergy}</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={blobEnergy}
                onChange={(e) => setBlobEnergy(Number(e.target.value))}
                className="w-full accent-[var(--primary)]"
              />
              <div className="flex justify-between mt-1" style={{ fontFamily: "'DM Mono', monospace", fontSize: "var(--font-size-sm)", letterSpacing: "var(--tracking-spread)", color: "var(--muted-foreground)" }}>
                <span>0 calmo</span>
                <span>100 intenso</span>
              </div>
            </div>

            {/* Variant selector */}
            <div style={{ width: "200px" }}>
              <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "var(--font-size-base)", fontWeight: "var(--weight-semibold)" as any, letterSpacing: "var(--tracking-widest)", textTransform: "uppercase", color: "var(--muted-foreground)", display: "block", marginBottom: "6px" }}>Variante</span>
              <div className="flex flex-wrap gap-1.5">
                {BLOB_VARIANTS.map((v) => (
                  <motion.button
                    key={v.id}
                    onClick={() => { setBlobVariant(v.id); setBlobEnergy(v.energy); }}
                    className="px-3 py-1.5 rounded-lg active:scale-95 transition-transform"
                    style={{
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: "var(--font-size-base)",
                      fontWeight: blobVariant === v.id ? "var(--weight-bold)" : "var(--weight-medium)" as any,
                      background: blobVariant === v.id ? "var(--primary)" : "var(--surface-container)",
                      color: blobVariant === v.id ? "var(--primary-foreground)" : "var(--muted-foreground)",
                      border: blobVariant === v.id ? "none" : "1px solid var(--outline-variant)",
                      cursor: "pointer",
                      outline: "none",
                    }}
                  >
                    {v.label}
                  </motion.button>
                ))}
              </div>
            </div>
          </div>

          {/* Anatomy + specs */}
          <div className="flex-1 min-w-0 flex flex-col gap-4">
            {/* Layer anatomy cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { title: "Glow layer", desc: "Radial gradient smoothed con spring physics, scala proporzionalmente all'energy. Crea l'alone caldo attorno alla forma — in VulcanHero si fonde con i glow rings del hero.", color: "var(--primary)", spec: "opacity 0.08-0.25 · blur 16-32px" },
                { title: "Corpo principale", desc: "Forma blob con borderRadius morph a keyframes fluidi. La velocita del ciclo dipende dall'energy: da 8s (calmo) a 3.5s (intenso). In VulcanHero, il mark respira in sync con questo ciclo.", color: "var(--tertiary)", spec: `ciclo ${(8 - blobEnergy / 100 * 4.5).toFixed(1)}s · ${blobEnergy}% energy` },
                { title: "Accent blob", desc: "Secondo layer organico sfalsato che arricchisce la complessita visiva. Ruota in controtempo rispetto al corpo.", color: "var(--cta)", spec: "offset fase 40% · scala 0.85x" },
                { title: "Highlight + ring", desc: "Riflesso luce e anello tratteggiato che dona profondita. Il ring ha dash-offset animato per effetto rotazione.", color: "var(--muted-foreground)", spec: "dasharray 4 4 · strokeWidth 0.5" },
              ].map((layer) => (
                <div
                  key={layer.title}
                  className="p-3 rounded-xl"
                  style={{
                    background: "var(--surface-container)",
                    border: "1px solid var(--outline-variant)",
                  }}
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: layer.color }} />
                    <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "var(--font-size-md)", fontWeight: "var(--weight-semibold)" as any, color: "var(--text-default)" }}>{layer.title}</span>
                  </div>
                  <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "var(--font-size-base)", color: "var(--muted-foreground)", lineHeight: "var(--leading-relaxed)" }}>{layer.desc}</p>
                  <code style={{ fontFamily: "'DM Mono', monospace", fontSize: "var(--font-size-sm)", color: "var(--primary)", display: "block", marginTop: "6px", fontFeatureSettings: "'tnum'" }}>{layer.spec}</code>
                </div>
              ))}
            </div>

            {/* Specs riepilogative */}
            <div className="flex flex-col gap-1.5 mt-1">
              {[
                { prop: "Varianti", val: "5 mood: rest · stretch · fold · rise · spin — mappate da composite score via moodFromScore()" },
                { prop: "Morph", val: "borderRadius keyframes organici, stile Material Expressive" },
                { prop: "Forge", val: "Variante dedicata a VulcanHero: forme bottom-heavy che rimano col vertice del mark, respiro sincronizzato" },
                { prop: "Hero ↔", val: "In VulcanHero il blob è il substrato: il mark galleggia al centro, condivide gradiente ember e scala ±1.5% sync" },
                { prop: "A11y", val: "prefers-reduced-motion → shape statica, nessuna animazione" },
              ].map((a) => (
                <div key={a.prop} className="flex items-baseline gap-2">
                  <span className="type-code" style={{ color: "var(--primary)", fontWeight: "var(--weight-semibold)" as any, width: "60px", flexShrink: 0 }}>{a.prop}</span>
                  <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "var(--font-size-base)", color: "var(--muted-foreground)" }}>{a.val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
