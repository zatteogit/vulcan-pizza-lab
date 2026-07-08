import React, { useState, useId } from "react";
import { motion } from "motion/react";
import { Ruler, Eye, Grid3X3, Ban, Check } from "lucide-react";
import {
  SectionHeader,
  AnatomyRow,
  SubSectionLabel,
  Panoramica,
  LineeGuida,
  AccessibilitaInfo,
} from "./shared";
import type { SectionEntry } from "./shared";
import { VulcanMark, VULCAN_MARK_PATHS } from "../shared/vulcan-logo";
import type { VulcanVariant } from "../shared/vulcan-logo";
import { LogoHeroSubSection, LogoFireGlowSubSection, LogoDoughBlobSubSection } from "./foundations-logo-brand";

/* ═══════════════════════════════════════════════════════════
   FONDAMENTA — LOGO & BRAND IDENTITY
   Costruzione geometrica precisa del VulcanMark,
   anatomia, scale ottiche, varianti cromatiche, regole d'uso,
   VulcanHero composizione, FireGlow, DoughBlob
   ═══════════════════════════════════════════════════════════ */

/* ── Path data per costruzione annotata ── */
const VARIANT_DATA: Record<
  VulcanVariant,
  {
    label: string;
    fill: string;
    thinW: number;
    thickW: number;
    ratio: string;
    vGap: number;
    topY: number;
    botY: number;
    thinX1: number;
    thinX2: number;
    thickX1: number;
    thickX2: number;
    tearX: number;
    tearY: number;
    tearCtrl: number;
    desc: string;
  }
> = {
  intima: {
    label: "Intima",
    fill: "72% x 84%",
    thinW: 6.2,
    thickW: 8.4,
    ratio: "taglio 7.5u",
    vGap: 7.5,
    topY: 2,
    botY: 29,
    thinX1: 5.2,
    thinX2: 11.58,
    thickX1: 19.16,
    thickX2: 28.97,
    tearX: 14.9,
    tearY: 29,
    tearCtrl: 27.46,
    desc: "Margini generosi: la fetta sottratta respira, il taglio resta leggibile.",
  },
  naturale: {
    label: "Naturale",
    fill: "78% x 89%",
    thinW: 6.7,
    thickW: 8.8,
    ratio: "taglio 7.9u",
    vGap: 7.9,
    topY: 1.5,
    botY: 29.9,
    thinX1: 4.6,
    thinX2: 11.31,
    thickX1: 19.29,
    thickX2: 29.6,
    tearX: 14.8,
    tearY: 30.2,
    tearCtrl: 28.28,
    desc: "Default: il miglior equilibrio tra fetta madre, V negativa e massa destra.",
  },
  aperta: {
    label: "Aperta",
    fill: "81% x 92%",
    thinW: 6.9,
    thickW: 9.2,
    ratio: "taglio 8.1u",
    vGap: 8.1,
    topY: 1,
    botY: 30.4,
    thinX1: 4,
    thinX2: 10.94,
    thickX1: 19.2,
    thickX2: 29.88,
    tearX: 14.6,
    tearY: 30.7,
    tearCtrl: 28.72,
    desc: "Presenza decisa: il taglio guadagna tensione e il vertice basso resta caldo.",
  },
  audace: {
    label: "Audace",
    fill: "86% x 95%",
    thinW: 7,
    thickW: 9.5,
    ratio: "taglio 8.4u",
    vGap: 8.4,
    topY: 0.5,
    botY: 30.9,
    thinX1: 3.4,
    thinX2: 10.58,
    thickX1: 19.12,
    thickX2: 30.16,
    tearX: 14.3,
    tearY: 31.2,
    tearCtrl: 29.16,
    desc: "Impatto da sigillo: più massa, utile per favicon e app icon.",
  },
  monumentale: {
    label: "Monumentale",
    fill: "91% x 98%",
    thinW: 7.2,
    thickW: 9.7,
    ratio: "taglio 8.7u",
    vGap: 8.7,
    topY: 0,
    botY: 31.2,
    thinX1: 2.8,
    thinX2: 10.17,
    thickX1: 18.93,
    thickX2: 30.27,
    tearX: 14,
    tearY: 31.6,
    tearCtrl: 29.42,
    desc: "Quasi full bleed: massima presenza, senza chiudere il vuoto centrale.",
  },
};

const VARIANTS_LIST: VulcanVariant[] = [
  "intima",
  "naturale",
  "aperta",
  "audace",
  "monumentale",
];

/* ── Construction SVG (annotated blueprint) ── */
function ConstructionBlueprint({
  variant,
  showGrid,
  showMeasures,
  showGuides,
}: {
  variant: VulcanVariant;
  showGrid: boolean;
  showMeasures: boolean;
  showGuides: boolean;
}) {
  const uid = useId().replace(/:/g, "");
  const gradId = `bp-grad-${uid}`;
  const d = VARIANT_DATA[variant];

  const cutCenterX = (d.thinX2 + d.thickX1) / 2;
  const heightLabelX = Math.min(d.thickX2 + 1.6, 31.1);

  return (
    <svg
      viewBox="-4 -4 40 40"
      className="w-full h-full"
      style={{ maxHeight: "420px" }}
    >
      <defs>
        <linearGradient id={gradId} x1="0.12" y1="0" x2="0.9" y2="1">
          <stop offset="0%" stopColor="var(--logo-grad-start)" />
          <stop offset="48%" stopColor="var(--logo-grad-mid)" />
          <stop offset="100%" stopColor="var(--logo-grad-end)" />
        </linearGradient>
      </defs>

      {/* Grid */}
      {showGrid &&
        Array.from({ length: 33 }).map((_, i) => (
          <g key={`g-${i}`}>
            <line
              x1={i}
              y1={0}
              x2={i}
              y2={32}
              stroke="var(--outline-variant)"
              strokeWidth={i % 8 === 0 ? 0.3 : 0.12}
              strokeDasharray={i % 8 === 0 ? "none" : "0.5 0.5"}
            />
            <line
              x1={0}
              y1={i}
              x2={32}
              y2={i}
              stroke="var(--outline-variant)"
              strokeWidth={i % 8 === 0 ? 0.3 : 0.12}
              strokeDasharray={i % 8 === 0 ? "none" : "0.5 0.5"}
            />
          </g>
        ))}

      {/* ViewBox boundary */}
      <rect
        x={0}
        y={0}
        width={32}
        height={32}
        fill="none"
        stroke="var(--muted-foreground)"
        strokeWidth={0.3}
        strokeDasharray="1 1"
        opacity={0.4}
      />

      {/* Guide lines */}
      {showGuides && (
        <g>
          {/* Top alignment */}
          <line
            x1={-3}
            y1={d.topY}
            x2={35}
            y2={d.topY}
            stroke="var(--cta)"
            strokeWidth={0.15}
            strokeDasharray="0.8 0.4"
            opacity={0.7}
          />
          {/* Bottom alignment */}
          <line
            x1={-3}
            y1={d.botY}
            x2={35}
            y2={d.botY}
            stroke="var(--cta)"
            strokeWidth={0.15}
            strokeDasharray="0.8 0.4"
            opacity={0.7}
          />
          {/* Left remnant outer edge */}
          <line
            x1={d.thinX1}
            y1={-3}
            x2={d.thinX1}
            y2={35}
            stroke="var(--primary)"
            strokeWidth={0.15}
            strokeDasharray="0.8 0.4"
            opacity={0.5}
          />
          {/* Right remnant outer edge */}
          <line
            x1={d.thickX2}
            y1={-3}
            x2={d.thickX2}
            y2={35}
            stroke="var(--primary)"
            strokeWidth={0.15}
            strokeDasharray="0.8 0.4"
            opacity={0.5}
          />
          {/* Center optical axis */}
          <line
            x1={16}
            y1={-3}
            x2={16}
            y2={35}
            stroke="var(--tertiary)"
            strokeWidth={0.2}
            strokeDasharray="1 0.5"
            opacity={0.4}
          />
        </g>
      )}

      {/* The mark itself (gradient fill) */}
      <VulcanMarkPath variant={variant} gradId={gradId} />

      {/* Measurement annotations */}
      {showMeasures && (
        <g>
          {/* Left remnant width bracket (top) */}
          <line
            x1={d.thinX1}
            y1={d.topY - 2}
            x2={d.thinX2}
            y2={d.topY - 2}
            stroke="var(--primary)"
            strokeWidth={0.25}
          />
          <line
            x1={d.thinX1}
            y1={d.topY - 2.8}
            x2={d.thinX1}
            y2={d.topY - 1.2}
            stroke="var(--primary)"
            strokeWidth={0.2}
          />
          <line
            x1={d.thinX2}
            y1={d.topY - 2.8}
            x2={d.thinX2}
            y2={d.topY - 1.2}
            stroke="var(--primary)"
            strokeWidth={0.2}
          />
          <text
            x={(d.thinX1 + d.thinX2) / 2}
            y={d.topY - 3}
            textAnchor="middle"
            fill="var(--primary)"
            fontSize={1.8}
            fontFamily="'DM Mono', monospace"
            fontWeight={600}
          >
            {d.thinW}u
          </text>

          {/* Right remnant width bracket (top) */}
          <line
            x1={d.thickX1}
            y1={d.topY - 2}
            x2={d.thickX2}
            y2={d.topY - 2}
            stroke="var(--tertiary)"
            strokeWidth={0.25}
          />
          <line
            x1={d.thickX1}
            y1={d.topY - 2.8}
            x2={d.thickX1}
            y2={d.topY - 1.2}
            stroke="var(--tertiary)"
            strokeWidth={0.2}
          />
          <line
            x1={d.thickX2}
            y1={d.topY - 2.8}
            x2={d.thickX2}
            y2={d.topY - 1.2}
            stroke="var(--tertiary)"
            strokeWidth={0.2}
          />
          <text
            x={(d.thickX1 + d.thickX2) / 2}
            y={d.topY - 3}
            textAnchor="middle"
            fill="var(--tertiary)"
            fontSize={1.8}
            fontFamily="'DM Mono', monospace"
            fontWeight={600}
          >
            {d.thickW}u
          </text>

          {/* Height bracket (right side) */}
          <line
            x1={d.thickX2 + 2}
            y1={d.topY}
            x2={d.thickX2 + 2}
            y2={d.botY}
            stroke="var(--cta)"
            strokeWidth={0.2}
          />
          <line
            x1={d.thickX2 + 1.3}
            y1={d.topY}
            x2={d.thickX2 + 2.7}
            y2={d.topY}
            stroke="var(--cta)"
            strokeWidth={0.2}
          />
          <line
            x1={d.thickX2 + 1.3}
            y1={d.botY}
            x2={d.thickX2 + 2.7}
            y2={d.botY}
            stroke="var(--cta)"
            strokeWidth={0.2}
          />
          <text
            x={heightLabelX}
            y={(d.topY + d.botY) / 2 + 0.5}
            textAnchor="start"
            fill="var(--cta)"
            fontSize={1.6}
            fontFamily="'DM Mono', monospace"
            fontWeight={600}
          >
            {(d.botY - d.topY).toFixed(1)}u
          </text>

          {/* Negative cut label */}
          <line
            x1={d.thinX2}
            y1={d.topY + 1.1}
            x2={d.thickX1}
            y2={d.topY + 1.1}
            stroke="var(--muted-foreground)"
            strokeWidth={0.15}
            strokeDasharray="0.5 0.3"
          />
          <line
            x1={d.thinX2}
            y1={d.topY + 0.3}
            x2={d.thinX2}
            y2={d.topY + 1.9}
            stroke="var(--muted-foreground)"
            strokeWidth={0.15}
          />
          <line
            x1={d.thickX1}
            y1={d.topY + 0.3}
            x2={d.thickX1}
            y2={d.topY + 1.9}
            stroke="var(--muted-foreground)"
            strokeWidth={0.15}
          />
          <text
            x={cutCenterX}
            y={d.topY + 3.2}
            textAnchor="middle"
            fill="var(--muted-foreground)"
            fontSize={1.3}
            fontFamily="'DM Mono', monospace"
          >
            taglio {d.vGap}u
          </text>

          {/* Warm vertex annotation */}
          <circle
            cx={d.tearX}
            cy={d.tearY}
            r={0.6}
            fill="none"
            stroke="var(--primary)"
            strokeWidth={0.2}
          />
          <line
            x1={d.tearX + 0.6}
            y1={d.tearY + 1.5}
            x2={d.tearX + 2.6}
            y2={d.tearY + 0.3}
            stroke="var(--primary)"
            strokeWidth={0.15}
          />
          <text
            x={d.tearX + 3}
            y={d.tearY + 2.2}
            textAnchor="start"
            fill="var(--primary)"
            fontSize={1.3}
            fontFamily="'DM Mono', monospace"
          >
            vertice caldo
          </text>
        </g>
      )}
    </svg>
  );
}

/* Render just the path, matching vulcan-logo.tsx data */
function VulcanMarkPath({
  variant,
  gradId,
}: {
  variant: VulcanVariant;
  gradId: string;
}) {
  return (
    <path
      d={VULCAN_MARK_PATHS[variant]}
      fill={`url(#${gradId})`}
      fillRule="nonzero"
      opacity={0.88}
    />
  );
}

/* ── Clear Space diagram ── */
function ClearSpaceDiagram({ variant }: { variant: VulcanVariant }) {
  return (
    <div
      className="relative flex items-center justify-center"
      style={{
        width: "200px",
        height: "200px",
        background: "var(--surface-container-low)",
        border: "1px solid var(--outline-variant)",
        borderRadius: "1rem",
      }}
    >
      {/* Safe zone dashed border */}
      <div
        className="absolute flex items-center justify-center"
        style={{
          inset: "24px",
          border: "1px dashed var(--primary)",
          borderRadius: "4px",
          opacity: 0.4,
        }}
      />
      {/* Measure arrows (4 sides) */}
      {["top", "bottom", "left", "right"].map((side) => (
        <div
          key={side}
          className="absolute flex items-center justify-center"
          style={{
            ...(side === "top"
              ? { top: "4px", left: "50%", transform: "translateX(-50%)" }
              : side === "bottom"
              ? { bottom: "4px", left: "50%", transform: "translateX(-50%)" }
              : side === "left"
              ? { left: "4px", top: "50%", transform: "translateY(-50%)" }
              : { right: "4px", top: "50%", transform: "translateY(-50%)" }),
          }}
        >
          <span
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: "var(--font-size-xs)",
              fontWeight: "var(--weight-semibold)" as any,
              color: "var(--primary)",
              background: "var(--surface-container-low)",
              padding: "0 3px",
              letterSpacing: "var(--tracking-spread)",
            }}
          >
            1x
          </span>
        </div>
      ))}
      <VulcanMark size={80} variant={variant} gradient decorative />
    </div>
  );
}

/* ── Do / Don't specimen ── */
function UsageSpecimen({
  ok,
  label,
  children,
}: {
  ok: boolean;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <div
        className="relative flex items-center justify-center rounded-xl overflow-hidden"
        style={{
          width: "120px",
          height: "120px",
          background: "var(--surface-container)",
          border: `2px solid ${ok ? "var(--cta)" : "var(--destructive)"}`,
        }}
      >
        {children}
        <div
          className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full flex items-center justify-center"
          style={{
            background: ok
              ? "var(--cta)"
              : "var(--destructive)",
          }}
        >
          {ok ? (
            <Check size={11} style={{ color: "white" }} />
          ) : (
            <Ban size={11} style={{ color: "white" }} />
          )}
        </div>
      </div>
      <span
        style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: "var(--font-size-base)",
          fontWeight: "var(--weight-medium)" as any,
          color: ok ? "var(--cta)" : "var(--destructive)",
          textAlign: "center",
          maxWidth: "120px",
          lineHeight: "var(--leading-compact)",
        }}
      >
        {label}
      </span>
    </div>
  );
}

/* ═══ MAIN SECTION ═══ */
function LogoConstructionSection() {
  const [activeVariant, setActiveVariant] =
    useState<VulcanVariant>("naturale");
  const [showGrid, setShowGrid] = useState(true);
  const [showMeasures, setShowMeasures] = useState(true);
  const [showGuides, setShowGuides] = useState(true);

  const d = VARIANT_DATA[activeVariant];

  return (
    <div className="flex flex-col gap-8">
      <SectionHeader
        title="Logo & Brand Identity"
        description="VulcanMark, VulcanHero, FireGlow, DoughBlob — l'intero sistema di identita visiva. Costruzione geometrica su griglia 32x32u: una fetta/vulcano implicita da cui nasce una V tramite taglio sottratto."
      />
      <SubSectionLabel label="Panoramica" />
      <Panoramica
        descrizione="Il sistema di brand identity di Vulcan Pizza Lab si basa sul VulcanMark — una V asimmetrica generata per sottrazione da una forma madre triangolare: fetta di pizza, profilo di vulcano e iniziale convivono nello stesso segno."
        principi={[
          "Forma madre: un triangolo/fetta implicito, mai illustrativo",
          "Taglio sottratto: la V nasce dal vuoto centrale e dal completamento modale",
          "5 scale ottiche per adattarsi dal favicon al hero display senza ridisegnare",
          "Gradiente ember proprietario: luce calda in alto, profondita in basso",
        ]}
      />
      <SubSectionLabel label="Specifiche" />
      {/* ── 1. CONSTRUCTION BLUEPRINT ── */}
      <div>
        <h3 className="type-subheading" style={{ color: "var(--text-default)", marginBottom: "var(--space-3)" }}>Costruzione geometrica</h3>
        <div className="surface-card p-5">
          {/* Variant selector */}
          <div className="flex flex-wrap gap-2 mb-4">
            {VARIANTS_LIST.map((v) => (
              <motion.button
                key={v}
                onClick={() => setActiveVariant(v)}
                className="px-4 py-2 rounded-xl active:scale-95 transition-transform"
                style={{
                  background:
                    activeVariant === v
                      ? "var(--primary)"
                      : "var(--surface-container)",
                  color:
                    activeVariant === v
                      ? "var(--primary-foreground)"
                      : "var(--text-default)",
                  border:
                    activeVariant === v
                      ? "none"
                      : "1px solid var(--outline-variant)",
                  cursor: "pointer",
                  outline: "none",
                }}
              >
                <span
                  style={{
                    fontFamily: "'DM Mono', monospace",
                    fontSize: "var(--font-size-base)",
                    fontWeight: "var(--weight-semibold)" as any,
                    letterSpacing: "var(--tracking-label)",
                    textTransform: "uppercase",
                  }}
                >
                  {VARIANT_DATA[v].label}
                </span>
                <span
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: "var(--font-size-base)",
                    opacity: activeVariant === v ? 0.85 : 0.6,
                    display: "block",
                    marginTop: "1px",
                  }}
                >
                  {VARIANT_DATA[v].fill}
                </span>
              </motion.button>
            ))}
          </div>

          {/* Toggle controls */}
          <div className="flex flex-wrap gap-3 mb-4">
            {[
              {
                id: "grid",
                label: "Griglia",
                icon: Grid3X3,
                active: showGrid,
                set: setShowGrid,
              },
              {
                id: "measures",
                label: "Misure",
                icon: Ruler,
                active: showMeasures,
                set: setShowMeasures,
              },
              {
                id: "guides",
                label: "Guide",
                icon: Eye,
                active: showGuides,
                set: setShowGuides,
              },
            ].map((toggle) => {
              const Icon = toggle.icon;
              return (
                <motion.button
                  key={toggle.id}
                  onClick={() => toggle.set(!toggle.active)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg active:scale-95 transition-transform"
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: "var(--font-size-md)",
                    fontWeight: "var(--weight-semibold)" as any,
                    background: toggle.active
                      ? "color-mix(in srgb, var(--primary) 12%, transparent)"
                      : "var(--surface-container)",
                    color: toggle.active
                      ? "var(--primary)"
                      : "var(--muted-foreground)",
                    border: toggle.active
                      ? "1px solid color-mix(in srgb, var(--primary) 25%, transparent)"
                      : "1px solid var(--outline-variant)",
                    cursor: "pointer",
                    outline: "none",
                  }}
                >
                  <Icon size={12} />
                  {toggle.label}
                </motion.button>
              );
            })}
          </div>

          {/* Blueprint canvas */}
          <div className="flex flex-col lg:flex-row gap-6">
            <div
              className="flex-1 min-w-0 rounded-2xl overflow-hidden flex items-center justify-center p-6"
              style={{
                background: "var(--surface-container)",
                border: "1px solid var(--outline-variant)",
                minHeight: "320px",
              }}
            >
              <ConstructionBlueprint
                variant={activeVariant}
                showGrid={showGrid}
                showMeasures={showMeasures}
                showGuides={showGuides}
              />
            </div>

            {/* Specs panel */}
            <div
              className="flex flex-col gap-3 lg:w-64 flex-shrink-0"
            >
              <div
                className="p-4 rounded-xl"
                style={{
                  background: "var(--surface-container)",
                  border: "1px solid var(--outline-variant)",
                }}
              >
                <span
                  style={{
                    fontFamily: "'DM Mono', monospace",
                    fontSize: "var(--font-size-base)",
                    fontWeight: "var(--weight-bold)" as any,
                    letterSpacing: "var(--tracking-display)",
                    textTransform: "uppercase",
                    color: "var(--primary)",
                  }}
                >
                  {d.label}
                </span>
                <p
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: "var(--font-size-md)",
                    color: "var(--muted-foreground)",
                    lineHeight: "var(--leading-relaxed)",
                    marginTop: "6px",
                  }}
                >
                  {d.desc}
                </p>
              </div>

              <div className="flex flex-col gap-2">
                {[
                  { prop: "ViewBox", val: "0 0 32 32" },
                  { prop: "Occupazione", val: d.fill },
                  { prop: "Residuo sx", val: `${d.thinW}u top` },
                  { prop: "Massa dx", val: `${d.thickW}u top` },
                  { prop: "Sistema", val: d.ratio },
                  { prop: "Taglio", val: `${d.vGap}u top` },
                  {
                    prop: "Altezza",
                    val: `${(d.botY - d.topY).toFixed(1)}u (${d.topY} -> ${d.botY})`,
                  },
                  { prop: "Vertice", val: "Bezier caldo, non goccia" },
                  { prop: "Fill rule", val: "nonzero" },
                ].map((row) => (
                  <div key={row.prop} className="flex items-baseline gap-2">
                    <span
                      className="type-code"
                      style={{
                        color: "var(--primary)",
                        fontWeight: "var(--weight-semibold)" as any,
                        width: "80px",
                        flexShrink: 0,
                      }}
                    >
                      {row.prop}
                    </span>
                    <span
                      style={{
                        fontFamily: "'DM Mono', monospace",
                        fontSize: "var(--font-size-base)",
                        color: "var(--muted-foreground)",
                        fontFeatureSettings: "'tnum'",
                      }}
                    >
                      {row.val}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. ANATOMY ── */}
      <div>
        <h3 className="type-subheading" style={{ color: "var(--text-default)", marginBottom: "var(--space-3)" }}>Anatomia del mark</h3>
        <div className="surface-card p-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                title: "Forma madre",
                desc: "Il mark parte da una fetta triangolare implicita: pizza e vulcano restano percepibili senza diventare icone letterali.",
                spec: `Occupazione ${d.fill}`,
                color: "var(--primary)",
              },
              {
                title: "Taglio sottratto",
                desc: "La V non è disegnata: emerge dal vuoto centrale, largo sopra e orientato verso il vertice basso.",
                spec: `${d.vGap}u top aperture`,
                color: "var(--tertiary)",
              },
              {
                title: "Residuo sinistro",
                desc: "Faccia della fetta dopo il taglio: top pieno, lato interno verticale, punta bassa netta per guidare il completamento modale.",
                spec: `${d.thinW}u al top`,
                color: "var(--primary)",
              },
              {
                title: "Massa destra",
                desc: "Parte dominante del segno: fianco lungo da vulcano/fetta, spalla alta morbida e terminale basso caldo.",
                spec: `${d.thickW}u al top`,
                color: "var(--cta)",
              },
              {
                title: "Asimmetria V",
                desc: "Il peso rimane a destra: se il segno diventa simmetrico perde il carattere Vulcan e diventa un glifo generico.",
                spec: d.ratio,
                color: "var(--text-default)",
              },
              {
                title: "Centro ottico",
                desc: "Il baricentro è volutamente destro. Il contenitore resta 32x32, ma il segno vive leggermente fuori asse.",
                spec: "Asse geometrico 16u, massa ottica ~17u",
                color: "var(--muted-foreground)",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="p-4 rounded-xl"
                style={{
                  background: "var(--surface-container)",
                  border: "1px solid var(--outline-variant)",
                }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ background: item.color }}
                  />
                  <span
                    style={{
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: "var(--font-size-lg)",
                      fontWeight: "var(--weight-semibold)" as any,
                      color: "var(--text-default)",
                    }}
                  >
                    {item.title}
                  </span>
                </div>
                <p
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: "var(--font-size-md)",
                    color: "var(--muted-foreground)",
                    lineHeight: "var(--leading-relaxed)",
                  }}
                >
                  {item.desc}
                </p>
                <code
                  style={{
                    fontFamily: "'DM Mono', monospace",
                    fontSize: "var(--font-size-base)",
                    color: "var(--primary)",
                    display: "block",
                    marginTop: "8px",
                    fontFeatureSettings: "'tnum'",
                  }}
                >
                  {item.spec}
                </code>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── 3. SCALE OTTICHE — Comparazione ── */}
      <div>
        <h3 className="type-subheading" style={{ color: "var(--text-default)", marginBottom: "var(--space-3)" }}>5 Scale ottiche — comparazione</h3>
        <div className="surface-card p-5">
          <p
            className="type-body"
            style={{
              fontSize: "var(--font-size-lg)",
              color: "var(--muted-foreground)",
              marginBottom: "16px",
            }}
          >
            Stessa geometria (fetta madre + taglio sottratto), scalata dal
            centro ottico per occupare piu o meno il viewBox 32x32. Ogni step
            aumenta presenza senza chiudere il vuoto centrale.
          </p>
          <div className="flex flex-wrap gap-6 items-end justify-center">
            {VARIANTS_LIST.map((v) => {
              const vd = VARIANT_DATA[v];
              const isActive = v === activeVariant;
              return (
                <motion.div
                  key={v}
                  className="flex flex-col items-center gap-2 active:scale-95 transition-transform"
                  onClick={() => setActiveVariant(v)}
                  style={{ cursor: "pointer" }}
                >
                  <div
                    className="flex items-center justify-center rounded-2xl"
                    style={{
                      width: 100,
                      height: 100,
                      background: isActive
                        ? "color-mix(in srgb, var(--primary) 8%, transparent)"
                        : "var(--surface-container)",
                      border: isActive
                        ? "2px solid var(--primary)"
                        : "1px solid var(--outline-variant)",
                      transition: "border 0.2s, background 0.2s",
                    }}
                  >
                    <VulcanMark
                      size={56}
                      variant={v}
                      gradient
                      decorative
                    />
                  </div>
                  <span
                    style={{
                      fontFamily: "'DM Mono', monospace",
                      fontSize: "var(--font-size-base)",
                      fontWeight: isActive ? "var(--weight-bold)" : "var(--weight-medium)" as any,
                      color: isActive
                        ? "var(--primary)"
                        : "var(--muted-foreground)",
                      textTransform: "uppercase",
                      letterSpacing: "var(--tracking-caps)",
                    }}
                  >
                    {vd.label}
                  </span>
                  <span
                    style={{
                      fontFamily: "'DM Mono', monospace",
                      fontSize: "var(--font-size-sm)",
                      color: "var(--muted-foreground)",
                      fontFeatureSettings: "'tnum'",
                      opacity: 0.7,
                    }}
                  >
                    {vd.fill}
                  </span>
                </motion.div>
              );
            })}
          </div>

          {/* Ratio comparison table */}
          <div
            className="mt-6 overflow-hidden rounded-xl"
            style={{ border: "1px solid var(--outline-variant)" }}
          >
            <div
              className="grid gap-px"
              style={{
                gridTemplateColumns: "1fr repeat(5, 1fr)",
                background: "var(--outline-variant)",
              }}
            >
              {/* Header row */}
              {["", ...VARIANTS_LIST.map((v) => VARIANT_DATA[v].label)].map(
                (h, i) => (
                  <div
                    key={`h-${i}`}
                    className="px-3 py-2"
                    style={{
                      background:
                        i === 0
                          ? "var(--surface-container)"
                          : VARIANTS_LIST[i - 1] === activeVariant
                          ? "color-mix(in srgb, var(--primary) 10%, var(--surface-container))"
                          : "var(--surface-container)",
                      fontFamily: "'DM Mono', monospace",
                      fontSize: "var(--font-size-base)",
                      fontWeight: "var(--weight-bold)" as any,
                      color:
                        i > 0 && VARIANTS_LIST[i - 1] === activeVariant
                          ? "var(--primary)"
                          : "var(--text-default)",
                      letterSpacing: "var(--tracking-label)",
                      textTransform: "uppercase",
                      textAlign: i === 0 ? "left" : "center",
                    }}
                  >
                    {h}
                  </div>
                )
              )}
              {/* Data rows */}
              {[
                {
                  label: "Thin",
                  key: "thinW" as const,
                  unit: "u",
                },
                {
                  label: "Thick",
                  key: "thickW" as const,
                  unit: "u",
                },
                {
                  label: "Ratio",
                  key: "ratio" as const,
                  unit: "",
                },
                {
                  label: "Gap",
                  key: "vGap" as const,
                  unit: "u",
                },
                {
                  label: "Fill",
                  key: "fill" as const,
                  unit: "",
                },
              ].map((row) => (
                <div key={row.label} style={{ display: "contents" }}>
                  <div
                    className="px-3 py-2"
                    style={{
                      background: "var(--surface-container-low)",
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: "var(--font-size-md)",
                      fontWeight: "var(--weight-semibold)" as any,
                      color: "var(--text-default)",
                    }}
                  >
                    {row.label}
                  </div>
                  {VARIANTS_LIST.map((v) => {
                    const vd = VARIANT_DATA[v];
                    const val = vd[row.key];
                    return (
                      <div
                        key={`${row.label}-${v}`}
                        className="px-3 py-2"
                        style={{
                          background:
                            v === activeVariant
                              ? "color-mix(in srgb, var(--primary) 6%, var(--surface-container-low))"
                              : "var(--surface-container-low)",
                          fontFamily: "'DM Mono', monospace",
                          fontSize: "var(--font-size-base)",
                          color:
                            v === activeVariant
                              ? "var(--primary)"
                              : "var(--muted-foreground)",
                          fontWeight: v === activeVariant ? "var(--weight-bold)" : "var(--weight-regular)" as any,
                          fontFeatureSettings: "'tnum'",
                          textAlign: "center",
                        }}
                      >
                        {typeof val === "number"
                          ? `${val}${row.unit}`
                          : val}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── 4. VARIANTI CROMATICHE ── */}
      <div>
        <h3 className="type-subheading" style={{ color: "var(--text-default)", marginBottom: "var(--space-3)" }}>Varianti cromatiche</h3>
        <div className="surface-card p-5">
          <div className="flex flex-wrap gap-4 justify-center">
            {[
              {
                label: "Flat primary",
                bg: "var(--surface-container-low)",
                cls: "text-[var(--primary)]",
                gradient: false,
                glow: false,
              },
              {
                label: "Gradiente ember",
                bg: "var(--surface-container-low)",
                cls: "",
                gradient: true,
                glow: false,
              },
              {
                label: "Glow",
                bg: "var(--surface-container-low)",
                cls: "text-[var(--primary)]",
                gradient: false,
                glow: true,
              },
              {
                label: "Su ember",
                bg: "var(--grad-ember)",
                cls: "text-white",
                gradient: false,
                glow: false,
              },
              {
                label: "Reversed",
                bg: "var(--primary)",
                cls: "text-[var(--primary-foreground)]",
                gradient: false,
                glow: false,
              },
              {
                label: "Su scuro",
                bg: "var(--inverse-surface)",
                cls: "text-[var(--primary)]",
                gradient: false,
                glow: true,
              },
            ].map((ctx) => (
              <div key={ctx.label} className="flex flex-col items-center gap-2">
                <div
                  className="flex items-center justify-center rounded-xl"
                  style={{
                    width: 88,
                    height: 88,
                    background: ctx.bg,
                    border: "1px solid var(--outline-variant)",
                  }}
                >
                  <VulcanMark
                    size={40}
                    variant={activeVariant}
                    className={ctx.cls}
                    gradient={ctx.gradient}
                    glow={ctx.glow}
                    decorative
                  />
                </div>
                <span
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: "var(--font-size-base)",
                    fontWeight: "var(--weight-semibold)" as any,
                    color: "var(--muted-foreground)",
                    textAlign: "center",
                  }}
                >
                  {ctx.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── 5. CLEAR SPACE & DIMENSIONI MINIME ── */}
      <div>
        <h3 className="type-subheading" style={{ color: "var(--text-default)", marginBottom: "var(--space-3)" }}>Clear space & dimensioni minime</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Clear space */}
          <div className="surface-card p-5">
            <span
              className="type-label"
              style={{
                color: "var(--text-default)",
                fontSize: "var(--font-size-base)",
              }}
            >
              Area di rispetto
            </span>
            <p
              className="type-body"
              style={{
                fontSize: "var(--font-size-md)",
                color: "var(--muted-foreground)",
                marginTop: "4px",
                marginBottom: "16px",
              }}
            >
              Minimo 1x la larghezza dell'asta sottile su ogni lato. Garantisce
              leggibilita e respiro anche in contesti affollati.
            </p>
            <div className="flex justify-center">
              <ClearSpaceDiagram variant={activeVariant} />
            </div>
          </div>

          {/* Minimum sizes */}
          <div className="surface-card p-5">
            <span
              className="type-label"
              style={{
                color: "var(--text-default)",
                fontSize: "var(--font-size-base)",
              }}
            >
              Dimensioni minime
            </span>
            <p
              className="type-body"
              style={{
                fontSize: "var(--font-size-md)",
                color: "var(--muted-foreground)",
                marginTop: "4px",
                marginBottom: "16px",
              }}
            >
              Sotto i 16px il taglio centrale e il terminale basso perdono
              definizione. Sotto i 12px usare solo la variante Monumentale.
            </p>
            <div className="flex flex-wrap items-end gap-5 justify-center">
              {[
                { size: 12, note: "min assoluto", variant: "monumentale" as VulcanVariant },
                { size: 16, note: "favicon", variant: "audace" as VulcanVariant },
                { size: 20, note: "toolbar", variant: activeVariant },
                { size: 24, note: "default", variant: activeVariant },
                { size: 32, note: "navigation", variant: activeVariant },
                { size: 48, note: "hero", variant: activeVariant },
              ].map((item) => (
                <div
                  key={item.size}
                  className="flex flex-col items-center gap-1.5"
                >
                  <div
                    className="flex items-center justify-center rounded-lg"
                    style={{
                      width: Math.max(item.size + 16, 36),
                      height: Math.max(item.size + 16, 36),
                      background: "var(--surface-container)",
                      border: "1px solid var(--outline-variant)",
                    }}
                  >
                    <VulcanMark
                      size={item.size}
                      variant={item.variant}
                      className="text-[var(--primary)]"
                      decorative
                    />
                  </div>
                  <span
                    style={{
                      fontFamily: "'DM Mono', monospace",
                      fontSize: "var(--font-size-base)",
                      fontWeight: "var(--weight-semibold)" as any,
                      color: "var(--primary)",
                      fontFeatureSettings: "'tnum'",
                    }}
                  >
                    {item.size}px
                  </span>
                  <span
                    style={{
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: "var(--font-size-sm)",
                      color: "var(--muted-foreground)",
                    }}
                  >
                    {item.note}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── 6. DO / DON'T ── */}
      <div>
        <h3 className="type-subheading" style={{ color: "var(--text-default)", marginBottom: "var(--space-3)" }}>Regole d'uso</h3>
        <div className="surface-card p-5">
          <div className="flex flex-wrap gap-4 justify-center">
            <UsageSpecimen ok label="Gradiente ember su chiaro">
              <VulcanMark
                size={48}
                variant="naturale"
                gradient
                decorative
              />
            </UsageSpecimen>
            <UsageSpecimen ok label="Flat primary, area rispetto">
              <VulcanMark
                size={40}
                variant="naturale"
                className="text-[var(--primary)]"
                decorative
              />
            </UsageSpecimen>
            <UsageSpecimen ok label="Bianco su ember pieno">
              <div
                className="absolute inset-0"
                style={{ background: "var(--grad-ember)" }}
              />
              <VulcanMark
                size={48}
                variant="naturale"
                className="text-white"
                style={{ position: "relative" }}
                decorative
              />
            </UsageSpecimen>
            <UsageSpecimen ok={false} label="Mai ruotare il mark">
              <VulcanMark
                size={48}
                variant="naturale"
                className="text-[var(--primary)]"
                style={{ transform: "rotate(15deg)" }}
                decorative
              />
            </UsageSpecimen>
            <UsageSpecimen ok={false} label="Mai deformare (stretch)">
              <VulcanMark
                size={48}
                variant="naturale"
                className="text-[var(--primary)]"
                style={{ transform: "scaleX(1.5)" }}
                decorative
              />
            </UsageSpecimen>
            <UsageSpecimen ok={false} label="Mai su sfondo caotico">
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(45deg, var(--text-error), var(--data-water), var(--cta), var(--data-warmth-light))",
                }}
              />
              <VulcanMark
                size={48}
                variant="naturale"
                className="text-white"
                style={{ position: "relative" }}
                decorative
              />
            </UsageSpecimen>
            <UsageSpecimen
              ok={false}
              label="Mai outline / stroke"
            >
              <svg width={48} height={48} viewBox="0 0 32 32">
                <path
                  d={VULCAN_MARK_PATHS.naturale}
                  fill="none"
                  stroke="var(--primary)"
                  strokeWidth={0.8}
                />
              </svg>
            </UsageSpecimen>
            <UsageSpecimen ok={false} label="Mai sotto 12px non-Monumentale">
              <VulcanMark
                size={10}
                variant="intima"
                className="text-[var(--primary)]"
                decorative
              />
            </UsageSpecimen>
          </div>
        </div>
      </div>

      {/* ── 7. SPECIFICHE RIEPILOGATIVE MARK ── */}
      <div className="surface-card p-5">
        <span
          className="type-label"
          style={{
            color: "var(--text-default)",
            fontSize: "var(--font-size-base)",
          }}
        >
          Specifiche riepilogative — VulcanMark
        </span>
        <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { prop: "Formato", val: "SVG path, viewBox 32x32" },
            { prop: "Scale", val: "5 varianti ottiche" },
            { prop: "Fill default", val: "currentColor (tematico)" },
            { prop: "Fill brand", val: "Gradiente ember (3 stop)" },
            { prop: "Glow", val: "Radial pulse 4s, opacity 0.12-0.22" },
            { prop: "Min size", val: "12px (solo Monumentale)" },
            { prop: "Clear space", val: "1x taglio top per lato" },
            { prop: "Costruzione", val: "Fetta madre + sottrazione" },
          ].map((a) => (
            <AnatomyRow key={a.prop} {...a} />
          ))}
        </div>
      </div>

      {/* ── 8. VULCAN HERO — Composizione armonizzata ── */}
      <LogoHeroSubSection activeVariant={activeVariant} />

      {/* ── 9. FIREGLOW — Sfondo animato ── */}
      <LogoFireGlowSubSection />

      {/* ── 10. DOUGHBLOB — Forma organica energy-reactive ── */}
      <LogoDoughBlobSubSection />
      <SubSectionLabel label="Linee guida" />
      <LineeGuida
        fai={[
          "Usare la variante Naturale come default per tutti i contesti standard",
          "Gradiente ember per brand hero, flat primary per UI funzionale",
          "Rispettare il clear space minimo (1× apertura del taglio)",
          "Variante Monumentale sotto i 16px per mantenere leggibilità",
        ]}
        nonFare={[
          "Mai ruotare, deformare o applicare stroke al mark",
          "Mai su sfondi caotici o multicolore senza overlay",
          "Mai sotto 12px in nessuna variante",
          "Mai usare il mark come pattern ripetuto o watermark",
        ]}
      />
      <SubSectionLabel label="Accessibilità" />
      <AccessibilitaInfo items={[
        { label: "aria-hidden", desc: "Il mark è decorativo: usare aria-hidden='true' e decorative prop." },
        { label: "Contrasto", desc: "Il mark deve avere contrasto minimo 3:1 con lo sfondo (WCAG AA non-testo)." },
        { label: "Alt text", desc: "Se il mark è l'unico indicatore del brand, aggiungere aria-label='Vulcan Pizza Lab'." },
      ]} />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   ENTRIES REGISTRY
   ═══════════════════════════════════════════════════════════ */
export const ENTRIES: SectionEntry[] = [
  {
    id: "logo",
    label: "Logo & Brand Identity",
    group: "f",
    Component: LogoConstructionSection,
  },
];
