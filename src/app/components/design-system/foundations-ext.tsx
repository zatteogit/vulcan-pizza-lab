const imgPizzaAlForno = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'/%3E";
const imgImpasto = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'/%3E";
const imgPizzaMargherita = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'/%3E";
const imgPizzaTeglia = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'/%3E";
const imgPizzaNapoletana = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'/%3E";
import { Flame,Image as ImageIcon,Sparkles,Wheat } from "lucide-react";
import { motion } from "motion/react";
import React,{ useState } from "react";
import { imgDivShapeIlloBg,imgDivXshape,imgDivXshape1,imgDivXshape2,imgDivXshape3 } from "../../../imports/svg-21qef";
import type { SectionEntry } from "./shared";
import {
Panoramica,
SectionHeader,
SubSectionLabel
} from "./shared";

/* ═══════════════════════════════════════════════════════════
   FONDAMENTA 13 — EXPRESSIVE SHAPES (M3 Expressive)
   ═══════════════════════════════════════════════════════════ */

/* ── Shape data ── */
const EXPRESSIVE_SHAPES = [
  { name: "Squircle", borderRadius: "rounded-bl-[25.2px] rounded-br-[46.8px] rounded-tl-[43.2px] rounded-tr-[14.4px]", color: "var(--secondary-container)" },
  { name: "Arch", borderRadius: "rounded-bl-[8px] rounded-br-[8px] rounded-tl-[36px] rounded-tr-[36px]", color: "var(--tertiary-container)" },
  { name: "Fan", borderRadius: "rounded-bl-[36px] rounded-br-[36px] rounded-tr-[36px]", color: "var(--primary-container)" },
  { name: "Pebble", borderRadius: "rounded-bl-[24.48px] rounded-br-[47.52px] rounded-tl-[47.52px] rounded-tr-[24.48px]", color: "var(--secondary-container)" },
  { name: "Drop", borderRadius: "rounded-tl-[72px]", color: "var(--secondary-container)" },
  { name: "Half-pill", borderRadius: "rounded-bl-[3.6px] rounded-br-[36px] rounded-tl-[3.6px] rounded-tr-[36px]", color: "var(--tertiary-container)" },
];

const MASK_SHAPES = [
  { name: "Squircle (mask)", svg: imgDivXshape, color: "var(--primary-container)" },
  { name: "Diamond", svg: imgDivXshape1, color: "var(--tertiary-container)" },
  { name: "Shield", svg: imgDivXshape2, color: "var(--primary-container)" },
  { name: "Star", svg: imgDivXshape3, color: "var(--tertiary-container)" },
];

const LOADER_SIZES = [
  {
    label: "Standard",
    size: 48,
    color: "var(--primary)",
    radii: [
      "30% 70% 70% 30% / 30% 30% 70% 70%",
      "70% 30% 50% 50% / 50% 60% 40% 50%",
      "50% 50% 30% 70% / 60% 40% 60% 40%",
      "30% 70% 70% 30% / 30% 30% 70% 70%",
    ],
    dur: 3,
  },
  {
    label: "Contained",
    size: 56,
    innerSize: 36,
    color: "var(--text-default)",
    containerColor: "var(--primary-container)",
    radii: [
      "40% 60% 55% 45% / 55% 35% 65% 45%",
      "60% 40% 35% 65% / 45% 55% 45% 55%",
      "35% 65% 60% 40% / 65% 45% 55% 35%",
      "40% 60% 55% 45% / 55% 35% 65% 45%",
    ],
    dur: 3.5,
  },
  {
    label: "Small",
    size: 24,
    color: "var(--secondary)",
    radii: [
      "50% 50% 30% 70% / 60% 40% 60% 40%",
      "30% 70% 70% 30% / 40% 60% 40% 60%",
      "60% 40% 50% 50% / 50% 50% 50% 50%",
      "50% 50% 30% 70% / 60% 40% 60% 40%",
    ],
    dur: 2.5,
  },
  {
    label: "Pulse",
    size: 44,
    color: "var(--cta)",
    radii: [
      "25% 75% 65% 35% / 55% 30% 70% 45%",
      "65% 35% 40% 60% / 30% 65% 35% 70%",
      "45% 55% 70% 30% / 70% 45% 55% 30%",
      "25% 75% 65% 35% / 55% 30% 70% 45%",
    ],
    dur: 4,
    pulse: true,
  },
  {
    label: "Orbit",
    size: 52,
    color: "var(--tertiary)",
    radii: [
      "70% 30% 30% 70% / 70% 70% 30% 30%",
      "30% 70% 70% 30% / 30% 30% 70% 70%",
      "50% 50% 50% 50% / 50% 50% 50% 50%",
      "70% 30% 30% 70% / 70% 70% 30% 30%",
    ],
    dur: 5,
    orbit: true,
  },
];

export function ExpressiveShapesSection() {
  const [hoveredShape, setHoveredShape] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-8">
      <SectionHeader
        title="Expressive Shapes"
        description="35 nuove forme organiche con shape morphing. Le forme comunicano stato, brand e gerarchia. Non più solo border-radius statici — forme asimmetriche, animate, che reagiscono all'interazione."
      />
      <SubSectionLabel label="Panoramica" />
      <Panoramica
        descrizione="Le Expressive Shapes rompono con i rettangoli arrotondati tradizionali, introducendo forme organiche (squircle, arch, fan, pebble, drop) che comunicano personalità e stato. Usate per avatar, maschere immagine e loader branded."
        principi={[
          "Le forme comunicano gerarchia: più complessa = più importante",
          "Shape morphing animato per transizioni di stato (inattivo → attivo)",
          "Forme CSS (border-radius) per componenti, maschere SVG per immagini",
          "Coerenza: stessa forma per lo stesso tipo di contenuto in tutta l'app",
        ]}
      />
      <SubSectionLabel label="Specifiche" />

      {/* Narrative quote */}
      <div
        className="py-4 px-6 rounded-r-lg"
        style={{
          background: "var(--surface-container-lowest)",
          borderLeft: "var(--border-width-thick) solid var(--primary)",
        }}
      >
        <p style={{
          fontFamily: "'Playfair Display', serif",
          fontStyle: "italic",
          fontSize: "var(--font-size-2xl)",
          lineHeight: "var(--leading-reading)",
          color: "var(--muted-foreground)",
        }}>
          "Le forme in Vulcan sono come le forme del pane: ogni stile ha la sua sagoma caratteristica. La Napoletana e tonda, la Teglia e squadrata con angoli morbidi, il Padellino e una campana."
        </p>
      </div>

      {/* CSS Border-Radius Shapes */}
      <div>
        <h3 className="type-subheading" style={{ color: "var(--text-default)", marginBottom: "var(--space-3)" }}>Shape Library — Border-Radius</h3>
        <div className="surface-card p-5">
          <div className="flex flex-wrap gap-5 justify-center">
            {EXPRESSIVE_SHAPES.map((shape) => (
              <motion.div
                key={shape.name}
                className="flex flex-col items-center gap-3 active:scale-95 transition-transform"
                whileHover={{ scale: 1.08 }}
                onHoverStart={() => setHoveredShape(shape.name)}
                onHoverEnd={() => setHoveredShape(null)}
                style={{ cursor: "pointer" }}
              >
                <div
                  className={`${shape.borderRadius} flex items-center justify-center`}
                  style={{
                    width: 72,
                    height: 72,
                    background: shape.color,
                  }}
                >
                  <Flame size={24} style={{ color:
                    shape.color.includes('tertiary-container') ? 'var(--on-tertiary-container)'
                    : shape.color.includes('secondary-container') ? 'var(--on-secondary-container)'
                    : 'var(--on-primary-container)'
                  }} />
                </div>
                <span style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: "var(--font-size-base)",
                  fontWeight: "var(--weight-semibold)" as any,
                  color: hoveredShape === shape.name ? "var(--primary)" : "var(--text-default)",
                  textAlign: "center",
                }}>
                  {shape.name}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* CSS Mask Shapes */}
      <div>
        <h3 className="type-subheading" style={{ color: "var(--text-default)", marginBottom: "var(--space-3)" }}>Shape Library — CSS Mask</h3>
        <div className="surface-card p-5">
          <span className="type-label" style={{ display: "block", marginBottom: "12px", color: "var(--muted-foreground)" }}>
            Forme via mask-image SVG — non ottenibili con solo border-radius
          </span>
          <div className="flex flex-wrap gap-5 justify-center">
            {MASK_SHAPES.map((shape) => (
              <motion.div
                key={shape.name}
                className="flex flex-col items-center gap-3 active:scale-95 transition-transform"
                whileHover={{ scale: 1.08, rotate: 5 }}
                style={{ cursor: "pointer" }}
              >
                <div
                  className="flex items-center justify-center"
                  style={{
                    width: 72,
                    height: 72,
                    background: shape.color,
                    WebkitMaskImage: `url('${shape.svg}')`,
                    maskImage: `url('${shape.svg}')`,
                    WebkitMaskSize: "72px 72px",
                    maskSize: "72px 72px",
                    WebkitMaskRepeat: "no-repeat",
                    maskRepeat: "no-repeat",
                    WebkitMaskPosition: "center",
                    maskPosition: "center",
                    maskMode: "alpha",
                    WebkitMaskMode: "alpha",
                  } as React.CSSProperties}
                >
                  <Flame size={24} style={{ color: "var(--icon-default)", opacity: 0.5 }} />
                </div>
                <span style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: "var(--font-size-base)",
                  fontWeight: "var(--weight-semibold)" as any,
                  color: "var(--text-default)",
                  textAlign: "center",
                }}>
                  {shape.name}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Shape Loaders */}
      <div>
        <h3 className="type-subheading" style={{ color: "var(--text-default)", marginBottom: "var(--space-3)" }}>Shape Loaders</h3>
        <div className="surface-card p-5">
          <span className="type-label" style={{ display: "block", marginBottom: "16px", color: "var(--muted-foreground)" }}>
            Forme organiche con shape-morphing fluido — ogni variante ha la propria personalità cinematica
          </span>
          <div className="flex flex-wrap gap-10 justify-center items-end py-4">
            {LOADER_SIZES.map((loader, idx) => {
              const s = loader.innerSize ?? loader.size;
              const hasContainer = !!loader.containerColor;
              const isPulse = !!(loader as any).pulse;
              const isOrbit = !!(loader as any).orbit;

              const blobEl = (
                <motion.div
                  animate={{
                    borderRadius: loader.radii,
                    rotate: [0, 120, 240, 360],
                    ...(isPulse ? { scale: [1, 1.15, 0.95, 1.08, 1] } : {}),
                  }}
                  transition={{
                    borderRadius: {
                      duration: loader.dur,
                      repeat: Infinity,
                      ease: "easeInOut",
                    },
                    rotate: {
                      duration: loader.dur * 2.5,
                      repeat: Infinity,
                      ease: "linear",
                    },
                    ...(isPulse
                      ? {
                          scale: {
                            duration: loader.dur * 1.2,
                            repeat: Infinity,
                            ease: "easeInOut",
                          },
                        }
                      : {}),
                  }}
                  style={{
                    width: s,
                    height: s,
                    background: loader.color,
                    opacity: 0.85,
                  }}
                />
              );

              return (
                <div key={loader.label} className="flex flex-col items-center gap-3">
                  {/* Container with orbit wrapper or direct */}
                  <div
                    className="relative flex items-center justify-center"
                    style={{ width: loader.size + 8, height: loader.size + 8 }}
                  >
                    {/* Soft glow behind */}
                    <motion.div
                      className="absolute"
                      animate={{
                        borderRadius: loader.radii,
                        scale: [1, 1.3, 1.1, 1],
                        opacity: [0.15, 0.25, 0.18, 0.15],
                      }}
                      transition={{
                        duration: loader.dur * 1.5,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                      style={{
                        width: s + 12,
                        height: s + 12,
                        background: loader.color,
                        filter: "blur(10px)",
                      }}
                    />

                    {hasContainer ? (
                      <motion.div
                        className="flex items-center justify-center"
                        animate={{
                          borderRadius: [
                            "28% 72% 60% 40% / 50% 36% 64% 50%",
                            "60% 40% 40% 60% / 40% 60% 40% 60%",
                            "40% 60% 72% 28% / 64% 50% 50% 36%",
                            "28% 72% 60% 40% / 50% 36% 64% 50%",
                          ],
                        }}
                        transition={{
                          duration: loader.dur * 1.8,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                        style={{
                          width: loader.size,
                          height: loader.size,
                          background: loader.containerColor,
                          position: "relative",
                          zIndex: 1,
                        }}
                      >
                        {blobEl}
                      </motion.div>
                    ) : isOrbit ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: loader.dur * 3,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                        className="relative flex items-center justify-center"
                        style={{
                          width: loader.size,
                          height: loader.size,
                          zIndex: 1,
                        }}
                      >
                        {blobEl}
                        {/* Small orbiting satellite blob */}
                        <motion.div
                          className="absolute"
                          animate={{
                            borderRadius: [
                              "50% 50% 30% 70% / 60% 40% 60% 40%",
                              "30% 70% 70% 30% / 40% 60% 40% 60%",
                              "50% 50% 30% 70% / 60% 40% 60% 40%",
                            ],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut",
                          }}
                          style={{
                            width: 10,
                            height: 10,
                            background: loader.color,
                            opacity: 0.5,
                            top: -2,
                            right: -2,
                          }}
                        />
                      </motion.div>
                    ) : (
                      <div style={{ position: "relative", zIndex: 1 }}>
                        {blobEl}
                      </div>
                    )}
                  </div>

                  {/* Label */}
                  <div className="flex flex-col items-center gap-0.5">
                    <span style={{
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: "var(--font-size-base)",
                      fontWeight: "var(--weight-semibold)" as any,
                      color: "var(--text-default)",
                    }}>
                      {loader.label}
                    </span>
                    <span className="type-data" style={{
                      color: "var(--muted-foreground)",
                    }}>
                      {loader.dur}s · {s}px
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Shape Illustrations */}
      <div>
        <h3 className="type-subheading" style={{ color: "var(--text-default)", marginBottom: "var(--space-3)" }}>Shape Illustrations</h3>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "var(--font-size-lg)", color: "var(--muted-foreground)", lineHeight: "var(--leading-relaxed)", marginBottom: "var(--space-3)" }}>
          Forme organiche come sfondo a bassa opacita per icone sezione. Ogni illustrazione combina una shape asimmetrica (15% opacity) con un'icona Material Symbols.
        </p>
        <div className="surface-card p-5">
          <div className="flex flex-wrap gap-6 justify-center">
            {[
              { shape: "rounded-bl-[33.6px] rounded-br-[62.4px] rounded-tl-[57.6px] rounded-tr-[19.2px]", color: "var(--primary-container)", icon: Flame, label: "Forno" },
              { shape: "rounded-bl-[8px] rounded-br-[8px] rounded-tl-[48px] rounded-tr-[48px]", color: "var(--secondary-container)", icon: Wheat, label: "Farina" },
              { shape: "rounded-bl-[48px] rounded-br-[48px] rounded-tr-[48px]", color: "var(--tertiary-container)", icon: Sparkles, label: "Lievito" },
              { shape: "mask", svg: imgDivShapeIlloBg, color: "var(--tertiary-container)", icon: ImageIcon, label: "Shield" },
            ].map((illo) => (
              <motion.div
                key={illo.label}
                className="flex flex-col items-center gap-3 active:scale-95 transition-transform"
                whileHover={{ scale: 1.06 }}
                style={{ cursor: "pointer" }}
              >
                <div className="relative flex items-center justify-center" style={{ width: 96, height: 96 }}>
                  {illo.shape === "mask" ? (
                    <div
                      className="absolute inset-0"
                      style={{
                        background: illo.color,
                        opacity: 0.15,
                        WebkitMaskImage: `url('${illo.svg}')`,
                        maskImage: `url('${illo.svg}')`,
                        WebkitMaskSize: "96px 96px",
                        maskSize: "96px 96px",
                        WebkitMaskRepeat: "no-repeat",
                        maskRepeat: "no-repeat",
                        WebkitMaskPosition: "center",
                        maskPosition: "center",
                        maskMode: "alpha",
                        WebkitMaskMode: "alpha",
                      } as React.CSSProperties}
                    />
                  ) : (
                    <div
                      className={`absolute inset-0 ${illo.shape}`}
                      style={{ background: illo.color, opacity: 0.15 }}
                    />
                  )}
                  <illo.icon size={36} style={{ color: "var(--text-default)", opacity: 0.7, position: "relative", zIndex: 1 }} />
                </div>
                <span style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: "var(--font-size-base)",
                  fontWeight: "var(--weight-semibold)" as any,
                  color: "var(--text-default)",
                }}>
                  {illo.label}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Specs */}
      <div className="surface-card p-5">
        <span className="type-label" style={{ color: "var(--text-default)" }}>Note implementative</span>
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { prop: "CSS Shapes", val: "border-radius asimmetrici con 4 valori distinti per corner" },
            { prop: "Mask Shapes", val: "mask-image con SVG inline data:URI per forme non-CSS" },
            { prop: "Loaders", val: "Shape-morphing fluido con borderRadius keyframes + rotazione lenta + glow blur. 5 varianti: Standard, Contained, Small, Pulse (scale), Orbit (satellite)" },
            { prop: "Illustrations", val: "Shape bg a 15% opacity + icona centrata, size 96px" },
          ].map((spec) => (
            <div key={spec.prop} className="p-3 rounded-lg" style={{ background: "var(--surface-container)" }}>
              <span className="type-data" style={{ fontWeight: "var(--weight-bold)" as any, color: "var(--primary)" }}>{spec.prop}</span>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "var(--font-size-base)", color: "var(--muted-foreground)", marginTop: "var(--space-1)", lineHeight: "var(--leading-relaxed)" }}>{spec.val}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   FONDAMENTA 14 — IMAGE TREATMENT
   ══════════════════════════════════════════════════════════ */

const STYLE_PHOTOS = [
  { src: imgPizzaNapoletana, label: "Napoletana STG", aspect: "4:3", treatment: "Warm overlay 5%" },
  { src: imgPizzaMargherita, label: "Margherita", aspect: "1:1", treatment: "Vignette radiale" },
  { src: imgImpasto, label: "Impasto", aspect: "16:9", treatment: "Desaturation 15%" },
  { src: imgPizzaAlForno, label: "Forno a legna", aspect: "3:2", treatment: "Gradient bottom 40%" },
  { src: imgPizzaTeglia, label: "Teglia romana", aspect: "4:3", treatment: "Warm overlay 5%" },
];

const ASPECT_RATIOS = [
  { ratio: "1:1", css: "aspect-[1/1]", use: "Card thumbnail, avatar, chip preview" },
  { ratio: "4:3", css: "aspect-[4/3]", use: "Style card hero, recipe header mobile" },
  { ratio: "16:9", css: "aspect-[16/9]", use: "Desktop recipe banner, cinematic header" },
  { ratio: "3:2", css: "aspect-[3/2]", use: "Forno preview, equipment photo" },
];

export function ImageTreatmentSection() {
  const [activeAspect, setActiveAspect] = useState("4:3");

  return (
    <div className="flex flex-col gap-8">
      <SectionHeader
        title="Image Treatment"
        description="Trattamento immagini per foto stile pizza. Aspect ratio definiti, overlay warm, vignette, gradient bottom. Tutte le immagini sono curate Unsplash con trattamento editoriale coerente."
      />
      <SubSectionLabel label="Panoramica" />
      <Panoramica
        descrizione="Le immagini in Vulcan sono curate da Unsplash e trattate con overlay caldo, vignette radiali e gradienti bottom. Questo approccio crea un'atmosfera unica e coinvolgente per ogni foto."
        principi={[
          "Overlay caldo per unificare il tono colore",
          "Vignette radiali per attenere l'attenzione al centro",
          "Gradienti bottom per label sovrapposte",
          "Desaturazione per coerenza palette calda",
        ]}
      />
      <SubSectionLabel label="Specifiche" />

      {/* Narrative */}
      <div
        className="py-4 px-6 rounded-r-lg"
        style={{
          background: "var(--surface-container-lowest)",
          borderLeft: "var(--border-width-thick) solid var(--primary)",
        }}
      >
        <p style={{
          fontFamily: "'Playfair Display', serif",
          fontStyle: "italic",
          fontSize: "var(--font-size-2xl)",
          lineHeight: "var(--leading-reading)",
          color: "var(--muted-foreground)",
        }}>
          "Le foto in Vulcan non sono stock generiche. Ogni immagine ha un trattamento caldo — come se la guardaste attraverso il calore del forno."
        </p>
      </div>

      {/* Style Photos Grid */}
      <div>
        <h3 className="type-subheading" style={{ color: "var(--text-default)", marginBottom: "var(--space-3)" }}>Galleria Stili — Trattamento editoriale</h3>
        <div className="surface-card p-5">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {STYLE_PHOTOS.map((photo) => (
              <motion.div
                key={photo.label}
                className="flex flex-col gap-2 cursor-pointer active:scale-[0.97] transition-transform"
                whileHover={{ y: -4, boxShadow: "var(--shadow-md)" }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
              >
                <div className="relative rounded-xl overflow-hidden" style={{ aspectRatio: photo.aspect.replace(":", "/") }}>
                  <img
                    src={photo.src}
                    alt={photo.label}
                    className="absolute inset-0 w-full h-full"
                    style={{ objectFit: "cover" }}
                  />
                  {/* Warm overlay */}
                  <div className="absolute inset-0" style={{ background: "var(--photo-warm-tint)" }} />
                  {/* Bottom gradient */}
                  <div className="absolute inset-0" style={{ background: "var(--card-scrim-light)" }} />
                  {/* Label */}
                  <div className="absolute bottom-2 left-2 right-2">
                    <span style={{
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: "var(--font-size-base)",
                      fontWeight: "var(--weight-semibold)" as any,
                      color: "var(--overlay-text)",
                    }}>
                      {photo.label}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="type-data" style={{ color: "var(--primary)", fontWeight: "var(--weight-semibold)" as any, fontFeatureSettings: "'tnum'" }}>{photo.aspect}</span>
                  <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "var(--font-size-md)", color: "var(--muted-foreground)" }}>{photo.treatment}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Aspect Ratio Comparison */}
      <div>
        <h3 className="type-subheading" style={{ color: "var(--text-default)", marginBottom: "var(--space-3)" }}>Aspect Ratio — Confronto interattivo</h3>
        <div className="surface-card p-5">
          <div className="flex gap-2 mb-4">
            {ASPECT_RATIOS.map((ar) => (
              <motion.button
                key={ar.ratio}
                onClick={() => setActiveAspect(ar.ratio)}
                className="active:scale-95 transition-transform"
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: "var(--font-size-lg)",
                  fontWeight: activeAspect === ar.ratio ? "var(--weight-bold)" as any : "var(--weight-medium)" as any,
                  padding: "var(--space-1-5) var(--space-3)",
                  borderRadius: "var(--radius-md)",
                  background: activeAspect === ar.ratio ? "var(--primary)" : "var(--surface-container)",
                  color: activeAspect === ar.ratio ? "var(--primary-foreground)" : "var(--muted-foreground)",
                  border: activeAspect === ar.ratio ? "none" : "var(--border-width-thin) solid var(--outline-variant)",
                  cursor: "pointer",
                  outline: "none",
                }}
              >
                {ar.ratio}
              </motion.button>
            ))}
          </div>

          <div className="flex gap-4 items-start">
            {/* Preview */}
            <div className="flex-1 min-w-0">
              <motion.div
                key={activeAspect}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                className="relative rounded-2xl overflow-hidden"
                style={{
                  aspectRatio: activeAspect.replace(":", "/"),
                  maxHeight: "300px",
                }}
              >
                <img
                  src={imgPizzaNapoletana}
                  alt="Preview"
                  className="absolute inset-0 w-full h-full"
                  style={{ objectFit: "cover" }}
                />
                <div className="absolute inset-0" style={{ background: "var(--photo-warm-tint)" }} />
                <div className="absolute inset-0" style={{ background: "var(--card-scrim-light)" }} />
              </motion.div>
            </div>

            {/* Info */}
            <div className="flex flex-col gap-2" style={{ width: "180px", flexShrink: 0 }}>
              {ASPECT_RATIOS.map((ar) => (
                <div
                  key={ar.ratio}
                  className="p-2.5 rounded-lg"
                  style={{
                    background: activeAspect === ar.ratio ? "color-mix(in srgb, var(--primary) 8%, transparent)" : "var(--surface-container)",
                    border: activeAspect === ar.ratio ? "1px solid var(--primary)" : "1px solid transparent",
                  }}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="type-data" style={{ fontWeight: "var(--weight-bold)" as any, color: activeAspect === ar.ratio ? "var(--primary)" : "var(--text-default)", fontFeatureSettings: "'tnum'" }}>{ar.ratio}</span>
                    <code style={{ fontFamily: "'DM Mono', monospace", fontSize: "var(--font-size-md)", color: "var(--muted-foreground)" }}>{ar.css}</code>
                  </div>
                  <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "var(--font-size-md)", color: "var(--muted-foreground)", lineHeight: "var(--leading-body)" }}>{ar.use}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Treatment layers */}
      <div>
        <h3 className="type-subheading" style={{ color: "var(--text-default)", marginBottom: "var(--space-3)" }}>Layer di trattamento</h3>
        <div className="surface-card p-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { layer: "Warm Overlay", css: "rgba(154, 52, 18, 0.05)", desc: "Tinta Primary al 5% su tutte le foto. Unifica il tono colore." },
              { layer: "Bottom Gradient", css: "linear-gradient(to top, rgba(0,0,0,0.35), transparent 50%)", desc: "Per label sovrapposti. Garantisce leggibilità testo bianco." },
              { layer: "Vignette", css: "radial-gradient(ellipse at center, transparent 60%, rgba(0,0,0,0.2))", desc: "Attenzione al centro. Usato per hero e card singole." },
              { layer: "Desaturation", css: "filter: saturate(0.85)", desc: "Riduzione 15% saturazione per coerenza palette calda." },
            ].map((t) => (
              <div key={t.layer} className="p-3 rounded-lg" style={{ background: "var(--surface-container)" }}>
                <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "var(--font-size-md)", fontWeight: "var(--weight-semibold)" as any, color: "var(--text-default)" }}>{t.layer}</span>
                <code style={{ fontFamily: "'DM Mono', monospace", fontSize: "var(--font-size-md)", color: "var(--primary)", display: "block", marginTop: "var(--space-1)" }}>{t.css}</code>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "var(--font-size-base)", color: "var(--muted-foreground)", marginTop: "var(--space-1)", lineHeight: "var(--leading-body)" }}>{t.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   ENTRIES REGISTRY
   ═══════════════════════════════════════════════════════════ */
export const ENTRIES: SectionEntry[] = [
  { id: "xshapes", label: "Expressive Shapes", group: "f", Component: ExpressiveShapesSection },
  { id: "images", label: "Image Treatment", group: "f", Component: ImageTreatmentSection },
];
