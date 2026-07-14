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
import { toShowcaseCssValue } from "./showcase-style";
import { showcaseMessage } from "../../i18n/showcase-messages";

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
    label: showcaseMessage("components.design-system.foundations-logo.intima-77921154"),
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
    desc: showcaseMessage("components.design-system.foundations-logo.margini-generosi-la-fetta-sottratta-respir-334a0b86"),
  },
  naturale: {
    label: showcaseMessage("components.design-system.foundations-logo.naturale-9eb1c81a"),
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
    desc: showcaseMessage("components.design-system.foundations-logo.default-il-miglior-equilibrio-tra-fetta-ma-528795a1"),
  },
  aperta: {
    label: showcaseMessage("components.design-system.foundations-logo.aperta-4ab10637"),
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
    desc: showcaseMessage("components.design-system.foundations-logo.presenza-decisa-il-taglio-guadagna-tension-d7d911ae"),
  },
  audace: {
    label: showcaseMessage("components.design-system.foundations-logo.audace-0aabc68a"),
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
    desc: showcaseMessage("components.design-system.foundations-logo.impatto-da-sigillo-piu-massa-utile-per-fav-2b04ff20"),
  },
  monumentale: {
    label: showcaseMessage("components.design-system.foundations-logo.monumentale-b43ca9d7"),
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
    desc: showcaseMessage("components.design-system.foundations-logo.quasi-full-bleed-massima-presenza-senza-ch-964776d9"),
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
      className="w-full h-full dsx-s-de81b0b9a5"
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
            {d.thinW}{showcaseMessage("components.design-system.foundations-logo.u-b26c4425")}</text>

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
            {d.thickW}{showcaseMessage("components.design-system.foundations-logo.u-b26c4425")}</text>

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
            {(d.botY - d.topY).toFixed(1)}{showcaseMessage("components.design-system.foundations-logo.u-b26c4425")}</text>

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
            {showcaseMessage("components.design-system.foundations-logo.taglio-dd1edaf8")}{d.vGap}{showcaseMessage("components.design-system.foundations-logo.u-b26c4425")}</text>

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
            {showcaseMessage("components.design-system.foundations-logo.vertice-caldo-fecc3a49")}</text>
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
      className="relative flex items-center justify-center dsx-s-3fc5771f3a"
    >
      {/* Safe zone dashed border */}
      <div
        className="absolute flex items-center justify-center dsx-s-3cf1e9899e"
      />
      {/* Measure arrows (4 sides) */}
      {["top", "bottom", "left", "right"].map((side) => (
        <div
          key={side}
          className={`absolute flex items-center justify-center ds-showcase__clear-space-measure--${side}`}
        >
          <span className="dsx-s-064731b49c"
          >
            {showcaseMessage("components.design-system.foundations-logo.1x-8d7a4fd5")}</span>
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
        className="relative flex items-center justify-center rounded-xl overflow-hidden dsx-s-170f6337c4"
        style={{ "--dsx-border": toShowcaseCssValue(`2px solid ${ok ? "var(--cta)" : "var(--destructive)"}`, false) } as any}
      >
        {children}
        <div
          className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full flex items-center justify-center dsx-s-fbecfa7efd"
          style={{ "--dsx-background": toShowcaseCssValue(ok
                                              ? "var(--cta)"
                                              : "var(--destructive)", false) } as any}
        >
          {ok ? (
            <Check size={11} className="dsx-s-9e8bd0a4c5" />
          ) : (
            <Ban size={11} className="dsx-s-9ecd821ceb" />
          )}
        </div>
      </div>
      <span
        style={{ "--dsx-color": toShowcaseCssValue(ok ? "var(--cta)" : "var(--destructive)", false) } as any} className="dsx-s-242281ce47"
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
        title={showcaseMessage("components.design-system.foundations-logo.logo-brand-identity-b4c1a77b")}
        description={showcaseMessage("components.design-system.foundations-logo.vulcanmark-vulcanhero-fireglow-doughblob-l-92a366ae")}
      />
      <SubSectionLabel label={showcaseMessage("components.design-system.foundations-logo.panoramica-f38c9a27")} />
      <Panoramica
        descrizione={showcaseMessage("components.design-system.foundations-logo.il-sistema-di-brand-identity-di-vulcan-piz-77947dcf")}
        principi={[
          showcaseMessage("components.design-system.foundations-logo.forma-madre-un-triangolo-fetta-implicito-m-9734ebd1"),
          showcaseMessage("components.design-system.foundations-logo.taglio-sottratto-la-v-nasce-dal-vuoto-cent-ef15acc2"),
          showcaseMessage("components.design-system.foundations-logo.5-scale-ottiche-per-adattarsi-dal-favicon--fcc82d37"),
          showcaseMessage("components.design-system.foundations-logo.gradiente-ember-proprietario-luce-calda-in-77df37c8"),
        ]}
      />
      <SubSectionLabel label={showcaseMessage("components.design-system.foundations-logo.specifiche-057caf2f")} />
      {/* ── 1. CONSTRUCTION BLUEPRINT ── */}
      <div>
        <h3 className="type-subheading dsx-s-1c0bccd446">{showcaseMessage("components.design-system.foundations-logo.costruzione-geometrica-ab1277f6")}</h3>
        <div className="surface-card p-5">
          {/* Variant selector */}
          <div className="flex flex-wrap gap-2 mb-4">
            {VARIANTS_LIST.map((v) => (
              <motion.button
                key={v}
                onClick={() => setActiveVariant(v)}
                className="px-4 py-2 rounded-xl active:scale-95 transition-transform dsx-s-581a0621c3"
                style={{ "--dsx-background": toShowcaseCssValue(activeVariant === v
                                                          ? "var(--primary)"
                                                          : "var(--surface-container)", false), "--dsx-color": toShowcaseCssValue(activeVariant === v
                                                          ? "var(--primary-foreground)"
                                                          : "var(--text-default)", false), "--dsx-border": toShowcaseCssValue(activeVariant === v
                                                          ? "none"
                                                          : "1px solid var(--outline-variant)", false) } as any}
              >
                <span className="dsx-s-0c6ba8b333"
                >
                  {VARIANT_DATA[v].label}
                </span>
                <span
                  style={{ "--dsx-opacity": toShowcaseCssValue(activeVariant === v ? 0.85 : 0.6, true) } as any}
                  className={`dsx-s-e3967aa608 ${activeVariant === v ? "ds-showcase__on-primary" : "ds-showcase__secondary-ink"}`}
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
                label: showcaseMessage("components.design-system.foundations-logo.griglia-4eb7e601"),
                icon: Grid3X3,
                active: showGrid,
                set: setShowGrid,
              },
              {
                id: "measures",
                label: showcaseMessage("components.design-system.foundations-logo.misure-25e9d227"),
                icon: Ruler,
                active: showMeasures,
                set: setShowMeasures,
              },
              {
                id: "guides",
                label: showcaseMessage("components.design-system.foundations-logo.guide-bf073fae"),
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
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg active:scale-95 transition-transform dsx-s-d29fb15dce"
                  style={{ "--dsx-background": toShowcaseCssValue(toggle.active
                                                              ? "color-mix(in srgb, var(--primary) 12%, transparent)"
                                                              : "var(--surface-container)", false), "--dsx-color": toShowcaseCssValue(toggle.active
                                                              ? "var(--primary)"
                                                              : "var(--muted-foreground)", false), "--dsx-border": toShowcaseCssValue(toggle.active
                                                              ? "1px solid color-mix(in srgb, var(--primary) 25%, transparent)"
                                                              : "1px solid var(--outline-variant)", false) } as any}
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
              className="flex-1 min-w-0 rounded-2xl overflow-hidden flex items-center justify-center p-6 dsx-s-d9867f2550"
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
                className="p-4 rounded-xl dsx-s-d1283e5581"
              >
                <span className="dsx-s-6b708d0219"
                >
                  {d.label}
                </span>
                <p className="dsx-s-5f1397de26"
                >
                  {d.desc}
                </p>
              </div>

              <div className="flex flex-col gap-2">
                {[
                  { prop: showcaseMessage("components.design-system.foundations-logo.viewbox-b3894302"), val: "0 0 32 32" },
                  { prop: showcaseMessage("components.design-system.foundations-logo.occupazione-956c2372"), val: d.fill },
                  { prop: showcaseMessage("components.design-system.foundations-logo.residuo-sx-6cf7bff5"), val: showcaseMessage("components.design-system.foundations-logo.value-u-top-e97fa163", [d.thinW]) },
                  { prop: showcaseMessage("components.design-system.foundations-logo.massa-dx-f6667556"), val: showcaseMessage("components.design-system.foundations-logo.value-u-top-e97fa163", [d.thickW]) },
                  { prop: showcaseMessage("components.design-system.foundations-logo.sistema-c0041603"), val: d.ratio },
                  { prop: showcaseMessage("components.design-system.foundations-logo.taglio-4b3f0122"), val: showcaseMessage("components.design-system.foundations-logo.value-u-top-e97fa163", [d.vGap]) },
                  {
                    prop: showcaseMessage("components.design-system.foundations-logo.altezza-7d07237e"),
                    val: showcaseMessage("components.design-system.foundations-logo.value-u-value-value-1a95a140", [(d.botY - d.topY).toFixed(1), d.topY, d.botY]),
                  },
                  { prop: showcaseMessage("components.design-system.foundations-logo.vertice-f1611804"), val: showcaseMessage("components.design-system.foundations-logo.bezier-caldo-non-goccia-554d4d50") },
                  { prop: showcaseMessage("components.design-system.foundations-logo.fill-rule-a6712368"), val: showcaseMessage("components.design-system.foundations-logo.nonzero-350529c7") },
                ].map((row) => (
                  <div key={row.prop} className="flex items-baseline gap-2">
                    <span
                      className="type-code dsx-s-6ee313dd9b"
                    >
                      {row.prop}
                    </span>
                    <span className="dsx-s-f1bb4e214b"
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
        <h3 className="type-subheading dsx-s-1c0bccd446">{showcaseMessage("components.design-system.foundations-logo.anatomia-del-mark-3293980b")}</h3>
        <div className="surface-card p-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                title: showcaseMessage("components.design-system.foundations-logo.forma-madre-20df682f"),
                desc: showcaseMessage("components.design-system.foundations-logo.il-mark-parte-da-una-fetta-triangolare-imp-73738ad1"),
                spec: `Occupazione ${d.fill}`,
                color: "var(--primary)",
              },
              {
                title: showcaseMessage("components.design-system.foundations-logo.taglio-sottratto-cc36e768"),
                desc: showcaseMessage("components.design-system.foundations-logo.la-v-non-e-disegnata-emerge-dal-vuoto-cent-fb05840f"),
                spec: `${d.vGap}u top aperture`,
                color: "var(--tertiary)",
              },
              {
                title: showcaseMessage("components.design-system.foundations-logo.residuo-sinistro-dabf3e50"),
                desc: showcaseMessage("components.design-system.foundations-logo.faccia-della-fetta-dopo-il-taglio-top-pien-34ad273d"),
                spec: `${d.thinW}u al top`,
                color: "var(--primary)",
              },
              {
                title: showcaseMessage("components.design-system.foundations-logo.massa-destra-8950cca5"),
                desc: showcaseMessage("components.design-system.foundations-logo.parte-dominante-del-segno-fianco-lungo-da--3e009b0d"),
                spec: `${d.thickW}u al top`,
                color: "var(--cta)",
              },
              {
                title: showcaseMessage("components.design-system.foundations-logo.asimmetria-v-fb1d07ca"),
                desc: showcaseMessage("components.design-system.foundations-logo.il-peso-rimane-a-destra-se-il-segno-divent-d7b9cd97"),
                spec: d.ratio,
                color: "var(--text-default)",
              },
              {
                title: showcaseMessage("components.design-system.foundations-logo.centro-ottico-f2c5c5b4"),
                desc: showcaseMessage("components.design-system.foundations-logo.il-baricentro-e-volutamente-destro-il-cont-0896dbca"),
                spec: "Asse geometrico 16u, massa ottica ~17u",
                color: "var(--muted-foreground)",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="p-4 rounded-xl dsx-s-d1283e5581"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className="w-2 h-2 rounded-full flex-shrink-0 dsx-s-fbecfa7efd"
                    style={{ "--dsx-background": toShowcaseCssValue(item.color, false) } as any}
                  />
                  <span className="dsx-s-ce5ec66ff8"
                  >
                    {item.title}
                  </span>
                </div>
                <p className="dsx-s-b4252559c3"
                >
                  {item.desc}
                </p>
                <code className="dsx-s-8495e8cafe"
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
        <h3 className="type-subheading dsx-s-1c0bccd446">{showcaseMessage("components.design-system.foundations-logo.5-scale-ottiche-comparazione-f5e6ac9b")}</h3>
        <div className="surface-card p-5">
          <p
            className="type-body dsx-s-bc17c18d98"
          >
            {showcaseMessage("components.design-system.foundations-logo.stessa-geometria-fetta-madre-taglio-sottra-344a7b6e")}</p>
          <div className="flex flex-wrap gap-6 items-end justify-center">
            {VARIANTS_LIST.map((v) => {
              const vd = VARIANT_DATA[v];
              const isActive = v === activeVariant;
              return (
                <motion.button
                  key={v}
                  type="button"
                  aria-pressed={isActive}
                  className="flex flex-col items-center gap-2 active:scale-95 transition-transform dsx-s-0177181e49"
                  onClick={() => setActiveVariant(v)}
                >
                  <span
                    className="flex items-center justify-center rounded-2xl dsx-s-3aa7c7a1a3"
                    style={{ "--dsx-background": toShowcaseCssValue(isActive
                                                                        ? "color-mix(in srgb, var(--primary) 8%, transparent)"
                                                                        : "var(--surface-container)", false), "--dsx-border": toShowcaseCssValue(isActive
                                                                        ? "2px solid var(--primary)"
                                                                        : "1px solid var(--outline-variant)", false) } as any}
                  >
                    <VulcanMark
                      size={56}
                      variant={v}
                      gradient
                      decorative
                    />
                  </span>
                  <span
                    style={{ "--dsx-font-weight": toShowcaseCssValue(isActive ? "var(--weight-bold)" : "var(--weight-medium)" as any, true), "--dsx-color": toShowcaseCssValue(isActive
                                                                        ? "var(--primary)"
                                                                        : "var(--muted-foreground)", false) } as any} className="dsx-s-2728156fbf"
                  >
                    {vd.label}
                  </span>
                  <span className="dsx-s-a5ae1bebc9 ds-showcase__secondary-ink"
                  >
                    {vd.fill}
                  </span>
                </motion.button>
              );
            })}
          </div>

          {/* Ratio comparison table */}
          <div
            className="mt-6 overflow-hidden rounded-xl dsx-s-dd7e961eb3"
          >
            <div
              className="grid gap-px dsx-s-420b0d6873"
            >
              {/* Header row */}
              {["", ...VARIANTS_LIST.map((v) => VARIANT_DATA[v].label)].map(
                (h, i) => (
                  <div
                    key={`h-${i}`}
                    className="px-3 py-2 dsx-s-4fddbf12cc"
                    style={{ "--dsx-background": toShowcaseCssValue(i === 0
                                                                          ? "var(--surface-container)"
                                                                          : VARIANTS_LIST[i - 1] === activeVariant
                                                                          ? "color-mix(in srgb, var(--primary) 10%, var(--surface-container))"
                                                                          : "var(--surface-container)", false), "--dsx-color": toShowcaseCssValue(i > 0 && VARIANTS_LIST[i - 1] === activeVariant
                                                                          ? "var(--primary)"
                                                                          : "var(--text-default)", false), "--dsx-text-align": toShowcaseCssValue(i === 0 ? "left" : "center", false) } as any}
                  >
                    {h}
                  </div>
                )
              )}
              {/* Data rows */}
              {[
                {
                  label: showcaseMessage("components.design-system.foundations-logo.thin-027f0b07"),
                  key: "thinW" as const,
                  unit: showcaseMessage("components.design-system.foundations-logo.u-51e69892"),
                },
                {
                  label: showcaseMessage("components.design-system.foundations-logo.thick-4318f26f"),
                  key: "thickW" as const,
                  unit: showcaseMessage("components.design-system.foundations-logo.u-51e69892"),
                },
                {
                  label: showcaseMessage("components.design-system.foundations-logo.ratio-794f65e9"),
                  key: "ratio" as const,
                  unit: "",
                },
                {
                  label: showcaseMessage("components.design-system.foundations-logo.gap-b2464742"),
                  key: "vGap" as const,
                  unit: showcaseMessage("components.design-system.foundations-logo.u-51e69892"),
                },
                {
                  label: showcaseMessage("components.design-system.foundations-logo.fill-7adb6736"),
                  key: "fill" as const,
                  unit: "",
                },
              ].map((row) => (
                <div key={row.label} className="dsx-s-043808a943">
                  <div
                    className="px-3 py-2 dsx-s-72f52ed86c"
                  >
                    {row.label}
                  </div>
                  {VARIANTS_LIST.map((v) => {
                    const vd = VARIANT_DATA[v];
                    const val = vd[row.key];
                    return (
                      <div
                        key={`${row.label}-${v}`}
                        className="px-3 py-2 dsx-s-75cfded046"
                        style={{ "--dsx-background": toShowcaseCssValue(v === activeVariant
                                                                                  ? "color-mix(in srgb, var(--primary) 6%, var(--surface-container-low))"
                                                                                  : "var(--surface-container-low)", false), "--dsx-color": toShowcaseCssValue(v === activeVariant
                                                                                  ? "var(--primary)"
                                                                                  : "var(--muted-foreground)", false), "--dsx-font-weight": toShowcaseCssValue(v === activeVariant ? "var(--weight-bold)" : "var(--weight-regular)" as any, true) } as any}
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
        <h3 className="type-subheading dsx-s-1c0bccd446">{showcaseMessage("components.design-system.foundations-logo.varianti-cromatiche-afc5b54c")}</h3>
        <div className="surface-card p-5">
          <div className="flex flex-wrap gap-4 justify-center">
            {[
              {
                label: showcaseMessage("components.design-system.foundations-logo.flat-primary-166ca0fb"),
                bg: "var(--surface-container-low)",
                cls: "text-[var(--primary)]",
                gradient: false,
                glow: false,
              },
              {
                label: showcaseMessage("components.design-system.foundations-logo.gradiente-ember-a1eda8a7"),
                bg: "var(--surface-container-low)",
                cls: "",
                gradient: true,
                glow: false,
              },
              {
                label: showcaseMessage("components.design-system.foundations-logo.glow-d5545dea"),
                bg: "var(--surface-container-low)",
                cls: "text-[var(--primary)]",
                gradient: false,
                glow: true,
              },
              {
                label: showcaseMessage("components.design-system.foundations-logo.su-ember-d75e74f8"),
                bg: "var(--grad-ember)",
                cls: "text-white",
                gradient: false,
                glow: false,
              },
              {
                label: showcaseMessage("components.design-system.foundations-logo.reversed-307404eb"),
                bg: "var(--primary)",
                cls: "text-[var(--primary-foreground)]",
                gradient: false,
                glow: false,
              },
              {
                label: showcaseMessage("components.design-system.foundations-logo.su-scuro-7640ff84"),
                bg: "var(--inverse-surface)",
                cls: "text-[var(--primary)]",
                gradient: false,
                glow: true,
              },
            ].map((ctx) => (
              <div key={ctx.label} className="flex flex-col items-center gap-2">
                <div
                  className="flex items-center justify-center rounded-xl dsx-s-0ebef58db3"
                  style={{ "--dsx-background": toShowcaseCssValue(ctx.bg, false) } as any}
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
                <span className="dsx-s-c053d93dcb"
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
        <h3 className="type-subheading dsx-s-1c0bccd446">{showcaseMessage("components.design-system.foundations-logo.clear-space-dimensioni-minime-c3eee7cf")}</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Clear space */}
          <div className="surface-card p-5">
            <span
              className="type-label dsx-s-e2184fadc0"
            >
              {showcaseMessage("components.design-system.foundations-logo.area-di-rispetto-9e250d9b")}</span>
            <p
              className="type-body dsx-s-6f569bce97"
            >
              {showcaseMessage("components.design-system.foundations-logo.minimo-1x-la-larghezza-dell-asta-sottile-s-15157f91")}</p>
            <div className="flex justify-center">
              <ClearSpaceDiagram variant={activeVariant} />
            </div>
          </div>

          {/* Minimum sizes */}
          <div className="surface-card p-5">
            <span
              className="type-label dsx-s-e2184fadc0"
            >
              {showcaseMessage("components.design-system.foundations-logo.dimensioni-minime-596f56da")}</span>
            <p
              className="type-body dsx-s-6f569bce97"
            >
              {showcaseMessage("components.design-system.foundations-logo.sotto-i-16px-il-taglio-centrale-e-il-termi-97aa215f")}</p>
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
                    className="flex items-center justify-center rounded-lg dsx-s-6418ac0c9d"
                    style={{ "--dsx-width": toShowcaseCssValue(Math.max(item.size + 16, 36), false), "--dsx-height": toShowcaseCssValue(Math.max(item.size + 16, 36), false) } as any}
                  >
                    <VulcanMark
                      size={item.size}
                      variant={item.variant}
                      className="text-[var(--primary)]"
                      decorative
                    />
                  </div>
                  <span className="dsx-s-531c99222a"
                  >
                    {item.size}px
                  </span>
                  <span className="dsx-s-ed4f77319d"
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
        <h3 className="type-subheading dsx-s-1c0bccd446">{showcaseMessage("components.design-system.foundations-logo.regole-d-uso-ae9fe1fa")}</h3>
        <div className="surface-card p-5">
          <div className="flex flex-wrap gap-4 justify-center">
            <UsageSpecimen ok label={showcaseMessage("components.design-system.foundations-logo.gradiente-ember-su-chiaro-894f3e24")}>
              <VulcanMark
                size={48}
                variant="naturale"
                gradient
                decorative
              />
            </UsageSpecimen>
            <UsageSpecimen ok label={showcaseMessage("components.design-system.foundations-logo.flat-primary-area-rispetto-9e4c1703")}>
              <VulcanMark
                size={40}
                variant="naturale"
                className="text-[var(--primary)]"
                decorative
              />
            </UsageSpecimen>
            <UsageSpecimen ok label={showcaseMessage("components.design-system.foundations-logo.bianco-su-ember-pieno-66490c57")}>
              <div
                className="absolute inset-0 dsx-s-ee7b477eef"
              />
              <VulcanMark
                size={48}
                variant="naturale"
                className="text-white dsx-s-2a9495ecbb"
                decorative
              />
            </UsageSpecimen>
            <UsageSpecimen ok={false} label={showcaseMessage("components.design-system.foundations-logo.mai-ruotare-il-mark-16c34058")}>
              <VulcanMark
                size={48}
                variant="naturale"
                className="text-[var(--primary)] dsx-s-1a2798daf9"
                decorative
              />
            </UsageSpecimen>
            <UsageSpecimen ok={false} label={showcaseMessage("components.design-system.foundations-logo.mai-deformare-stretch-4ced33e4")}>
              <VulcanMark
                size={48}
                variant="naturale"
                className="text-[var(--primary)] dsx-s-777ccc0401"
                decorative
              />
            </UsageSpecimen>
            <UsageSpecimen ok={false} label={showcaseMessage("components.design-system.foundations-logo.mai-su-sfondo-caotico-fffe6c80")}>
              <div
                className="absolute inset-0 dsx-s-30f971f650"
              />
              <VulcanMark
                size={48}
                variant="naturale"
                className="text-white dsx-s-2a9495ecbb"
                decorative
              />
            </UsageSpecimen>
            <UsageSpecimen
              ok={false}
              label={showcaseMessage("components.design-system.foundations-logo.mai-outline-stroke-1dd9ebec")}
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
            <UsageSpecimen ok={false} label={showcaseMessage("components.design-system.foundations-logo.mai-sotto-12px-non-monumentale-d1e654af")}>
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
          className="type-label dsx-s-e2184fadc0"
        >
          {showcaseMessage("components.design-system.foundations-logo.specifiche-riepilogative-vulcanmark-76e8fa68")}</span>
        <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { prop: showcaseMessage("components.design-system.foundations-logo.formato-c25b742e"), val: showcaseMessage("components.design-system.foundations-logo.svg-path-viewbox-32x32-0f548f30") },
            { prop: showcaseMessage("components.design-system.foundations-logo.scale-a29f0256"), val: showcaseMessage("components.design-system.foundations-logo.5-varianti-ottiche-cedbde1b") },
            { prop: showcaseMessage("components.design-system.foundations-logo.fill-default-ec2f976e"), val: showcaseMessage("components.design-system.foundations-logo.currentcolor-tematico-cbc7d443") },
            { prop: showcaseMessage("components.design-system.foundations-logo.fill-brand-f0ef9ceb"), val: showcaseMessage("components.design-system.foundations-logo.gradiente-ember-3-stop-aee03774") },
            { prop: showcaseMessage("components.design-system.foundations-logo.glow-d5545dea"), val: showcaseMessage("components.design-system.foundations-logo.radial-pulse-4s-opacity-0-12-0-22-8a4ec11a") },
            { prop: showcaseMessage("components.design-system.foundations-logo.min-size-51b2eb0f"), val: showcaseMessage("components.design-system.foundations-logo.12px-solo-monumentale-29798367") },
            { prop: showcaseMessage("components.design-system.foundations-logo.clear-space-c5260b51"), val: showcaseMessage("components.design-system.foundations-logo.1x-taglio-top-per-lato-8cf92435") },
            { prop: showcaseMessage("components.design-system.foundations-logo.costruzione-42cddb34"), val: showcaseMessage("components.design-system.foundations-logo.fetta-madre-sottrazione-d12ceea7") },
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
      <SubSectionLabel label={showcaseMessage("components.design-system.foundations-logo.linee-guida-b43417d1")} />
      <LineeGuida
        fai={[
          showcaseMessage("components.design-system.foundations-logo.usare-la-variante-naturale-come-default-pe-9065e11b"),
          showcaseMessage("components.design-system.foundations-logo.gradiente-ember-per-brand-hero-flat-primar-9da4335c"),
          showcaseMessage("components.design-system.foundations-logo.rispettare-il-clear-space-minimo-1-apertur-25a40199"),
          showcaseMessage("components.design-system.foundations-logo.variante-monumentale-sotto-i-16px-per-mant-1a2c217d"),
        ]}
        nonFare={[
          showcaseMessage("components.design-system.foundations-logo.mai-ruotare-deformare-o-applicare-stroke-a-888d4796"),
          showcaseMessage("components.design-system.foundations-logo.mai-su-sfondi-caotici-o-multicolore-senza--1e354202"),
          showcaseMessage("components.design-system.foundations-logo.mai-sotto-12px-in-nessuna-variante-463b009b"),
          showcaseMessage("components.design-system.foundations-logo.mai-usare-il-mark-come-pattern-ripetuto-o--eac1890a"),
        ]}
      />
      <SubSectionLabel label={showcaseMessage("components.design-system.foundations-logo.accessibilita-e59811a6")} />
      <AccessibilitaInfo items={[
        { label: showcaseMessage("components.design-system.foundations-logo.aria-hidden-90a75933"), desc: showcaseMessage("components.design-system.foundations-logo.il-mark-e-decorativo-usare-aria-hidden-tru-129bc479") },
        { label: showcaseMessage("components.design-system.foundations-logo.contrasto-19fb9f0a"), desc: showcaseMessage("components.design-system.foundations-logo.il-mark-deve-avere-contrasto-minimo-3-1-co-302a66ba") },
        { label: showcaseMessage("components.design-system.foundations-logo.alt-text-f978200b"), desc: showcaseMessage("components.design-system.foundations-logo.se-il-mark-e-l-unico-indicatore-del-brand--6c9bfd79") },
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
    label: showcaseMessage("components.design-system.foundations-logo.logo-brand-identity-b4c1a77b"),
    group: "f",
    Component: LogoConstructionSection,
  },
];
