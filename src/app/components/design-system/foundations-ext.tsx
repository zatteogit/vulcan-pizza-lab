const imgPizzaAlForno = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'/%3E";
const imgImpasto = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'/%3E";
const imgPizzaMargherita = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'/%3E";
const imgPizzaTeglia = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'/%3E";
const imgPizzaNapoletana = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'/%3E";
import { Flame,Image as ImageIcon,Sparkles,Wheat } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { useState } from "react";
import { imgDivShapeIlloBg,imgDivXshape,imgDivXshape1,imgDivXshape2,imgDivXshape3 } from "./foundations-shapes";
import type { SectionEntry } from "./shared";
import {
Panoramica,
SectionHeader,
SubSectionLabel
} from "./shared";
import { toShowcaseCssValue } from "./showcase-style";
import { morphLoaderTransition, showcaseTransition } from "./showcase-motion";
import { showcaseMessage } from "../../i18n/showcase-messages";

/* ═══════════════════════════════════════════════════════════
   FONDAMENTA 13 — EXPRESSIVE SHAPES (M3 Expressive)
   ═══════════════════════════════════════════════════════════ */

/* ── Shape data ── */
const EXPRESSIVE_SHAPES = [
  { name: showcaseMessage("components.design-system.foundations-ext.squircle-402a93d1"), borderRadius: "rounded-bl-[25.2px] rounded-br-[46.8px] rounded-tl-[43.2px] rounded-tr-[14.4px]", color: "var(--secondary-container)" },
  { name: showcaseMessage("components.design-system.foundations-ext.arch-f96ddf32"), borderRadius: "rounded-bl-[8px] rounded-br-[8px] rounded-tl-[36px] rounded-tr-[36px]", color: "var(--tertiary-container)" },
  { name: showcaseMessage("components.design-system.foundations-ext.fan-ec384064"), borderRadius: "rounded-bl-[36px] rounded-br-[36px] rounded-tr-[36px]", color: "var(--primary-container)" },
  { name: showcaseMessage("components.design-system.foundations-ext.pebble-ffeaca2c"), borderRadius: "rounded-bl-[24.48px] rounded-br-[47.52px] rounded-tl-[47.52px] rounded-tr-[24.48px]", color: "var(--secondary-container)" },
  { name: showcaseMessage("components.design-system.foundations-ext.drop-0a088b31"), borderRadius: "rounded-tl-[72px]", color: "var(--secondary-container)" },
  { name: showcaseMessage("components.design-system.foundations-ext.half-pill-e894f2aa"), borderRadius: "rounded-bl-[3.6px] rounded-br-[36px] rounded-tl-[3.6px] rounded-tr-[36px]", color: "var(--tertiary-container)" },
];

const MASK_SHAPES = [
  { name: showcaseMessage("components.design-system.foundations-ext.squircle-mask-2115d51a"), svg: imgDivXshape, color: "var(--primary-container)" },
  { name: showcaseMessage("components.design-system.foundations-ext.diamond-b3850e04"), svg: imgDivXshape1, color: "var(--tertiary-container)" },
  { name: showcaseMessage("components.design-system.foundations-ext.shield-08271419"), svg: imgDivXshape2, color: "var(--primary-container)" },
  { name: showcaseMessage("components.design-system.foundations-ext.star-85a7de6e"), svg: imgDivXshape3, color: "var(--tertiary-container)" },
];

const LOADER_SIZES = [
  {
    label: showcaseMessage("components.design-system.foundations-ext.standard-2dfa6607"),
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
    label: showcaseMessage("components.design-system.foundations-ext.contained-6b885a5c"),
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
    label: showcaseMessage("components.design-system.foundations-ext.small-c74fd971"),
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
    label: showcaseMessage("components.design-system.foundations-ext.pulse-b3cc660b"),
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
    label: showcaseMessage("components.design-system.foundations-ext.orbit-b6c22d03"),
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

function ExpressiveShapesSection() {
  const [hoveredShape, setHoveredShape] = useState<string | null>(null);
  const reduceMotion = useReducedMotion();

  return (
    <div className="flex flex-col gap-8">
      <SectionHeader
        title={showcaseMessage("components.design-system.foundations-ext.expressive-shapes-b3e98170")}
        description={showcaseMessage("components.design-system.foundations-ext.35-nuove-forme-organiche-con-shape-morphin-25e9476e")}
      />
      <SubSectionLabel label={showcaseMessage("components.design-system.foundations-ext.panoramica-f38c9a27")} />
      <Panoramica
        descrizione={showcaseMessage("components.design-system.foundations-ext.le-expressive-shapes-rompono-con-i-rettang-81a9b679")}
        principi={[
          showcaseMessage("components.design-system.foundations-ext.le-forme-comunicano-gerarchia-piu-compless-e2a7d0c2"),
          showcaseMessage("components.design-system.foundations-ext.shape-morphing-animato-per-transizioni-di--8e2bacf2"),
          showcaseMessage("components.design-system.foundations-ext.forme-css-border-radius-per-componenti-mas-79a0c4d0"),
          showcaseMessage("components.design-system.foundations-ext.coerenza-stessa-forma-per-lo-stesso-tipo-d-c8f68c8d"),
        ]}
      />
      <SubSectionLabel label={showcaseMessage("components.design-system.foundations-ext.specifiche-057caf2f")} />

      {/* Narrative quote */}
      <div
        className="py-4 px-6 rounded-r-lg dsx-s-f218347393"
      >
        <p className="dsx-s-c1671dfa92">
          {showcaseMessage("components.design-system.foundations-ext.le-forme-in-vulcan-sono-come-le-forme-del--634d068b")}</p>
      </div>

      {/* CSS Border-Radius Shapes */}
      <div>
        <h3 className="type-subheading dsx-s-1c0bccd446">{showcaseMessage("components.design-system.foundations-ext.shape-library-border-radius-8b70c56d")}</h3>
        <div className="surface-card p-5">
          <div className="flex flex-wrap gap-5 justify-center">
            {EXPRESSIVE_SHAPES.map((shape) => (
              <motion.div
                key={shape.name}
                className="flex flex-col items-center gap-3 active:scale-95 transition-transform dsx-s-9463ff4798"
                whileHover={{ scale: 1.08 }}
                onHoverStart={() => setHoveredShape(shape.name)}
                onHoverEnd={() => setHoveredShape(null)}
              >
                <div
                  className={[`${shape.borderRadius} flex items-center justify-center`, "dsx-s-1f45a54715"].filter(Boolean).join(" ")}
                  style={{ "--dsx-background": toShowcaseCssValue(shape.color, false) } as any}
                >
                  <Flame size={24} style={{ "--dsx-color": toShowcaseCssValue(shape.color.includes('tertiary-container') ? 'var(--on-tertiary-container)'
                                                                    : shape.color.includes('secondary-container') ? 'var(--on-secondary-container)'
                                                                    : 'var(--on-primary-container)', false) } as any} className="dsx-s-3c487ee146" />
                </div>
                <span style={{ "--dsx-color": toShowcaseCssValue(hoveredShape === shape.name ? "var(--primary)" : "var(--text-default)", false) } as any} className="dsx-s-956b2fac75">
                  {shape.name}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* CSS Mask Shapes */}
      <div>
        <h3 className="type-subheading dsx-s-1c0bccd446">{showcaseMessage("components.design-system.foundations-ext.shape-library-css-mask-9a32c8f8")}</h3>
        <div className="surface-card p-5">
          <span className="type-label dsx-s-d195bdc40c">
            {showcaseMessage("components.design-system.foundations-ext.forme-via-mask-image-svg-non-ottenibili-co-c4af5304")}</span>
          <div className="flex flex-wrap gap-5 justify-center">
            {MASK_SHAPES.map((shape) => (
              <motion.div
                key={shape.name}
                className="flex flex-col items-center gap-3 active:scale-95 transition-transform dsx-s-9463ff4798"
                whileHover={{ scale: 1.08, rotate: 5 }}
              >
                <div
                  className="flex items-center justify-center dsx-s-1a6caa69a7"
                  style={{ "--dsx-background": toShowcaseCssValue(shape.color, false), "--dsx-webkit-mask-image": toShowcaseCssValue(`url('${shape.svg}')`, false), "--dsx-mask-image": toShowcaseCssValue(`url('${shape.svg}')`, false) } as any}
                >
                  <Flame size={24} className="dsx-s-3a44b8b9b2" />
                </div>
                <span className="dsx-s-cf6e2ed435">
                  {shape.name}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Shape Loaders */}
      <div>
        <h3 className="type-subheading dsx-s-1c0bccd446">{showcaseMessage("components.design-system.foundations-ext.shape-loaders-f21e9185")}</h3>
        <div className="surface-card p-5">
          <span className="type-label dsx-s-83a9c80b13">
            {showcaseMessage("components.design-system.foundations-ext.forme-organiche-con-shape-morphing-fluido--9138e9f1")}</span>
          <div className="flex flex-wrap gap-10 justify-center items-end py-4">
            {LOADER_SIZES.map((loader) => {
              const s = loader.innerSize ?? loader.size;
              const hasContainer = !!loader.containerColor;
              const isPulse = !!(loader as any).pulse;
              const isOrbit = !!(loader as any).orbit;

              const blobEl = (
                <motion.div
                  animate={reduceMotion ? {
                    borderRadius: loader.radii[0],
                    rotate: 0,
                    scale: 1,
                  } : {
                    borderRadius: loader.radii,
                    rotate: [0, 120, 240, 360],
                    ...(isPulse ? { scale: [1, 1.15, 0.95, 1.08, 1] } : {}),
                  }}
                  transition={reduceMotion ? undefined : morphLoaderTransition(loader.dur, isPulse)}
                  style={{ "--dsx-width": toShowcaseCssValue(s, false), "--dsx-height": toShowcaseCssValue(s, false), "--dsx-background": toShowcaseCssValue(loader.color, false) } as any} className="dsx-s-10aef78ead"
                />
              );

              return (
                <div key={loader.label} className="flex flex-col items-center gap-3">
                  {/* Container with orbit wrapper or direct */}
                  <div
                    className="relative flex items-center justify-center dsx-s-43f9590b73"
                    style={{ "--dsx-width": toShowcaseCssValue(loader.size + 8, false), "--dsx-height": toShowcaseCssValue(loader.size + 8, false) } as any}
                  >
                    {/* Soft glow behind */}
                    <motion.div
                      className="absolute dsx-s-754eb31988"
                      animate={reduceMotion ? {
                        borderRadius: loader.radii[0],
                        scale: 1,
                        opacity: 0.15,
                      } : {
                        borderRadius: loader.radii,
                        scale: [1, 1.3, 1.1, 1],
                        opacity: [0.15, 0.25, 0.18, 0.15],
                      }}
                      transition={reduceMotion ? undefined : showcaseTransition.dynamic_88a9457c22(loader.dur * 1.5)}
                      style={{ "--dsx-width": toShowcaseCssValue(s + 12, false), "--dsx-height": toShowcaseCssValue(s + 12, false), "--dsx-background": toShowcaseCssValue(loader.color, false) } as any}
                    />

                    {hasContainer ? (
                      <motion.div
                        className="flex items-center justify-center dsx-s-12247a7930"
                        animate={reduceMotion ? {
                          borderRadius: "28% 72% 60% 40% / 50% 36% 64% 50%",
                        } : {
                          borderRadius: [
                            "28% 72% 60% 40% / 50% 36% 64% 50%",
                            "60% 40% 40% 60% / 40% 60% 40% 60%",
                            "40% 60% 72% 28% / 64% 50% 50% 36%",
                            "28% 72% 60% 40% / 50% 36% 64% 50%",
                          ],
                        }}
                        transition={reduceMotion ? undefined : showcaseTransition.dynamic_e2dcae7be1(loader.dur * 1.8)}
                        style={{ "--dsx-width": toShowcaseCssValue(loader.size, false), "--dsx-height": toShowcaseCssValue(loader.size, false), "--dsx-background": toShowcaseCssValue(loader.containerColor, false) } as any}
                      >
                        {blobEl}
                      </motion.div>
                    ) : isOrbit ? (
                      <motion.div
                        animate={reduceMotion ? { rotate: 0 } : { rotate: 360 }}
                        transition={reduceMotion ? undefined : showcaseTransition.dynamic_24dc71d9e2(loader.dur * 3)}
                        className="relative flex items-center justify-center dsx-s-c45c454610"
                        style={{ "--dsx-width": toShowcaseCssValue(loader.size, false), "--dsx-height": toShowcaseCssValue(loader.size, false) } as any}
                      >
                        {blobEl}
                        {/* Small orbiting satellite blob */}
                        <motion.div
                          className="absolute dsx-s-c4602eba0b"
                          animate={reduceMotion ? {
                            borderRadius: "50% 50% 30% 70% / 60% 40% 60% 40%",
                          } : {
                            borderRadius: [
                              "50% 50% 30% 70% / 60% 40% 60% 40%",
                              "30% 70% 70% 30% / 40% 60% 40% 60%",
                              "50% 50% 30% 70% / 60% 40% 60% 40%",
                            ],
                          }}
                          transition={reduceMotion ? undefined : showcaseTransition.preset_da755ea015}
                          style={{ "--dsx-background": toShowcaseCssValue(loader.color, false) } as any}
                        />
                      </motion.div>
                    ) : (
                      <div className="dsx-s-87d571f988">
                        {blobEl}
                      </div>
                    )}
                  </div>

                  {/* Label */}
                  <div className="flex flex-col items-center gap-0.5">
                    <span className="dsx-s-7429dbc22f">
                      {loader.label}
                    </span>
                    <span className="type-data dsx-s-63782726c0">
                      {loader.dur}{showcaseMessage("components.design-system.foundations-ext.s-61889c71")}{s}px
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
        <h3 className="type-subheading dsx-s-1c0bccd446">{showcaseMessage("components.design-system.foundations-ext.shape-illustrations-78f6a86e")}</h3>
        <p className="dsx-s-6c826acd7d">
          {showcaseMessage("components.design-system.foundations-ext.forme-organiche-come-sfondo-a-bassa-opacit-70e7564b")}</p>
        <div className="surface-card p-5">
          <div className="flex flex-wrap gap-6 justify-center">
            {[
              { shape: "rounded-bl-[33.6px] rounded-br-[62.4px] rounded-tl-[57.6px] rounded-tr-[19.2px]", color: "var(--primary-container)", icon: Flame, label: showcaseMessage("components.design-system.foundations-ext.forno-0f50f5fe") },
              { shape: "rounded-bl-[8px] rounded-br-[8px] rounded-tl-[48px] rounded-tr-[48px]", color: "var(--secondary-container)", icon: Wheat, label: showcaseMessage("components.design-system.foundations-ext.farina-718e862c") },
              { shape: "rounded-bl-[48px] rounded-br-[48px] rounded-tr-[48px]", color: "var(--tertiary-container)", icon: Sparkles, label: showcaseMessage("components.design-system.foundations-ext.lievito-e6b263a4") },
              { shape: "mask", svg: imgDivShapeIlloBg, color: "var(--tertiary-container)", icon: ImageIcon, label: showcaseMessage("components.design-system.foundations-ext.shield-08271419") },
            ].map((illo) => (
              <motion.div
                key={illo.label}
                className="flex flex-col items-center gap-3 active:scale-95 transition-transform dsx-s-9463ff4798"
                whileHover={{ scale: 1.06 }}
              >
                <div className="relative flex items-center justify-center dsx-s-d1f9f47b68">
                  {illo.shape === "mask" ? (
                    <div
                      className="absolute inset-0 dsx-s-521e380c15"
                      style={{ "--dsx-background": toShowcaseCssValue(illo.color, false), "--dsx-webkit-mask-image": toShowcaseCssValue(`url('${illo.svg}')`, false), "--dsx-mask-image": toShowcaseCssValue(`url('${illo.svg}')`, false) } as any}
                    />
                  ) : (
                    <div
                      className={[`absolute inset-0 ${illo.shape}`, "dsx-s-3cf295bd0f"].filter(Boolean).join(" ")}
                      style={{ "--dsx-background": toShowcaseCssValue(illo.color, false) } as any}
                    />
                  )}
                  <illo.icon size={36} className="dsx-s-6e2a6ef4bf" />
                </div>
                <span className="dsx-s-7429dbc22f">
                  {illo.label}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Specs */}
      <div className="surface-card p-5">
        <span className="type-label dsx-s-a57c4bed75">{showcaseMessage("components.design-system.foundations-ext.note-implementative-4b4515a0")}</span>
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { prop: showcaseMessage("components.design-system.foundations-ext.css-shapes-2ed26d10"), val: showcaseMessage("components.design-system.foundations-ext.border-radius-asimmetrici-con-4-valori-dis-0206cda6") },
            { prop: showcaseMessage("components.design-system.foundations-ext.mask-shapes-2b7898c2"), val: showcaseMessage("components.design-system.foundations-ext.mask-image-con-svg-inline-data-uri-per-for-485cf3b3") },
            { prop: showcaseMessage("components.design-system.foundations-ext.loaders-4f514b04"), val: showcaseMessage("components.design-system.foundations-ext.shape-morphing-fluido-con-borderradius-key-14f7423d") },
            { prop: showcaseMessage("components.design-system.foundations-ext.illustrations-a5453ae9"), val: showcaseMessage("components.design-system.foundations-ext.shape-bg-a-15-opacity-icona-centrata-size--4734d6c6") },
          ].map((spec) => (
            <div key={spec.prop} className="p-3 rounded-lg dsx-s-e4f209c55b">
              <span className="type-data dsx-s-133edc77c0">{spec.prop}</span>
              <p className="dsx-s-271eafecf4">{spec.val}</p>
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
  { src: imgPizzaNapoletana, label: showcaseMessage("components.design-system.foundations-ext.napoletana-stg-fc9d3868"), aspect: "4:3", treatment: "Warm overlay 5%" },
  { src: imgPizzaMargherita, label: showcaseMessage("components.design-system.foundations-ext.margherita-0117d9ad"), aspect: "1:1", treatment: "Vignette radiale" },
  { src: imgImpasto, label: showcaseMessage("components.design-system.foundations-ext.impasto-4c653db5"), aspect: "16:9", treatment: "Desaturation 15%" },
  { src: imgPizzaAlForno, label: showcaseMessage("components.design-system.foundations-ext.forno-a-legna-b299063a"), aspect: "3:2", treatment: "Gradient bottom 40%" },
  { src: imgPizzaTeglia, label: showcaseMessage("components.design-system.foundations-ext.teglia-romana-6941c551"), aspect: "4:3", treatment: "Warm overlay 5%" },
];

const ASPECT_RATIOS = [
  { ratio: "1:1", css: "aspect-[1/1]", use: "Card thumbnail, avatar, chip preview" },
  { ratio: "4:3", css: "aspect-[4/3]", use: "Style card hero, recipe header mobile" },
  { ratio: "16:9", css: "aspect-[16/9]", use: "Desktop recipe banner, cinematic header" },
  { ratio: "3:2", css: "aspect-[3/2]", use: "Forno preview, equipment photo" },
];

function ImageTreatmentSection() {
  const [activeAspect, setActiveAspect] = useState("4:3");

  return (
    <div className="flex flex-col gap-8">
      <SectionHeader
        title={showcaseMessage("components.design-system.foundations-ext.image-treatment-4b154659")}
        description={showcaseMessage("components.design-system.foundations-ext.trattamento-immagini-per-foto-stile-pizza--b2317bbd")}
      />
      <SubSectionLabel label={showcaseMessage("components.design-system.foundations-ext.panoramica-f38c9a27")} />
      <Panoramica
        descrizione={showcaseMessage("components.design-system.foundations-ext.le-immagini-in-vulcan-sono-curate-da-unspl-60d2dc17")}
        principi={[
          showcaseMessage("components.design-system.foundations-ext.overlay-caldo-per-unificare-il-tono-colore-7a55004e"),
          showcaseMessage("components.design-system.foundations-ext.vignette-radiali-per-attenere-l-attenzione-8f0e1f00"),
          showcaseMessage("components.design-system.foundations-ext.gradienti-bottom-per-label-sovrapposte-0e648705"),
          showcaseMessage("components.design-system.foundations-ext.desaturazione-per-coerenza-palette-calda-23d98cda"),
        ]}
      />
      <SubSectionLabel label={showcaseMessage("components.design-system.foundations-ext.specifiche-057caf2f")} />

      {/* Narrative */}
      <div
        className="py-4 px-6 rounded-r-lg dsx-s-f218347393"
      >
        <p className="dsx-s-c1671dfa92">
          {showcaseMessage("components.design-system.foundations-ext.le-foto-in-vulcan-non-sono-stock-generiche-47dc668d")}</p>
      </div>

      {/* Style Photos Grid */}
      <div>
        <h3 className="type-subheading dsx-s-1c0bccd446">{showcaseMessage("components.design-system.foundations-ext.galleria-stili-trattamento-editoriale-d760fef3")}</h3>
        <div className="surface-card p-5">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {STYLE_PHOTOS.map((photo) => (
              <motion.div
                key={photo.label}
                className="flex flex-col gap-2 cursor-pointer active:scale-97 transition-transform"
                whileHover={{ y: -4, boxShadow: "var(--shadow-md)" }}
                transition={showcaseTransition.preset_0e2957ab5e}
              >
                <div className="relative rounded-xl overflow-hidden dsx-s-ad63285399" style={{ "--dsx-aspect-ratio": toShowcaseCssValue(photo.aspect.replace(":", "/"), true) } as any}>
                  <img
                    src={photo.src}
                    alt={photo.label}
                    className="absolute inset-0 w-full h-full dsx-s-27daa250db"
                  />
                  {/* Warm overlay */}
                  <div className="absolute inset-0 dsx-s-292ecda532" />
                  {/* Bottom gradient */}
                  <div className="absolute inset-0 dsx-s-aaa63d48fa" />
                  {/* Label */}
                  <div className="absolute bottom-2 left-2 right-2">
                    <span className="dsx-s-e108c48a16">
                      {photo.label}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="type-data dsx-s-5296c5c8ad">{photo.aspect}</span>
                  <span className="dsx-s-1d01913364">{photo.treatment}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Aspect Ratio Comparison */}
      <div>
        <h3 className="type-subheading dsx-s-1c0bccd446">{showcaseMessage("components.design-system.foundations-ext.aspect-ratio-confronto-interattivo-0bbb20e8")}</h3>
        <div className="surface-card p-5">
          <div className="flex gap-2 mb-4">
            {ASPECT_RATIOS.map((ar) => (
              <motion.button
                key={ar.ratio}
                onClick={() => setActiveAspect(ar.ratio)}
                className="active:scale-95 transition-transform dsx-s-52800d7d07"
                style={{ "--dsx-font-weight": toShowcaseCssValue(activeAspect === ar.ratio ? "var(--weight-bold)" as any : "var(--weight-medium)" as any, true), "--dsx-background": toShowcaseCssValue(activeAspect === ar.ratio ? "var(--primary)" : "var(--surface-container)", false), "--dsx-color": toShowcaseCssValue(activeAspect === ar.ratio ? "var(--primary-foreground)" : "var(--muted-foreground)", false), "--dsx-border": toShowcaseCssValue(activeAspect === ar.ratio ? "none" : "var(--border-width-thin) solid var(--outline-variant)", false) } as any}
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
                transition={showcaseTransition.preset_0e2957ab5e}
                className="relative rounded-2xl overflow-hidden dsx-s-5338e83035"
                style={{ "--dsx-aspect-ratio": toShowcaseCssValue(activeAspect.replace(":", "/"), true) } as any}
              >
                <img
                  src={imgPizzaNapoletana}
                  alt={showcaseMessage("components.design-system.foundations-ext.preview-f1fbb2b4")}
                  className="absolute inset-0 w-full h-full dsx-s-27daa250db"
                />
                <div className="absolute inset-0 dsx-s-292ecda532" />
                <div className="absolute inset-0 dsx-s-aaa63d48fa" />
              </motion.div>
            </div>

            {/* Info */}
            <div className="flex flex-col gap-2 dsx-s-1351e8ab50">
              {ASPECT_RATIOS.map((ar) => (
                <div
                  key={ar.ratio}
                  className="p-2.5 rounded-lg dsx-s-08c5fe74f8"
                  style={{ "--dsx-background": toShowcaseCssValue(activeAspect === ar.ratio ? "color-mix(in srgb, var(--primary) 8%, transparent)" : "var(--surface-container)", false), "--dsx-border": toShowcaseCssValue(activeAspect === ar.ratio ? "1px solid var(--primary)" : "1px solid transparent", false) } as any}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="type-data dsx-s-9a7af03de3" style={{ "--dsx-color": toShowcaseCssValue(activeAspect === ar.ratio ? "var(--primary)" : "var(--text-default)", false) } as any}>{ar.ratio}</span>
                    <code className="dsx-s-7653645f3f">{ar.css}</code>
                  </div>
                  <span className="dsx-s-b2bdf6727e">{ar.use}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Treatment layers */}
      <div>
        <h3 className="type-subheading dsx-s-1c0bccd446">{showcaseMessage("components.design-system.foundations-ext.layer-di-trattamento-2973cfe7")}</h3>
        <div className="surface-card p-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { layer: "Warm Overlay", css: "rgba(154, 52, 18, 0.05)", desc: showcaseMessage("components.design-system.foundations-ext.tinta-primary-al-5-su-tutte-le-foto-unific-e0ccc349") },
              { layer: "Bottom Gradient", css: "linear-gradient(to top, rgba(0,0,0,0.35), transparent 50%)", desc: showcaseMessage("components.design-system.foundations-ext.per-label-sovrapposti-garantisce-leggibili-7a473f90") },
              { layer: "Vignette", css: "radial-gradient(ellipse at center, transparent 60%, rgba(0,0,0,0.2))", desc: showcaseMessage("components.design-system.foundations-ext.attenzione-al-centro-usato-per-hero-e-card-9b2c26ad") },
              { layer: "Desaturation", css: "filter: saturate(0.85)", desc: showcaseMessage("components.design-system.foundations-ext.riduzione-15-saturazione-per-coerenza-pale-47fe7872") },
            ].map((t) => (
              <div key={t.layer} className="p-3 rounded-lg dsx-s-e4f209c55b">
                <span className="dsx-s-ab460f3048">{t.layer}</span>
                <code className="dsx-s-2d39846453">{t.css}</code>
                <p className="dsx-s-cadb51cb40">{t.desc}</p>
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
  { id: "xshapes", label: showcaseMessage("components.design-system.foundations-ext.expressive-shapes-b3e98170"), group: "f", Component: ExpressiveShapesSection },
  { id: "images", label: showcaseMessage("components.design-system.foundations-ext.image-treatment-4b154659"), group: "f", Component: ImageTreatmentSection },
];
