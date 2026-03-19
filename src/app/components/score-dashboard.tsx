import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useTransform,
  animate,
} from "motion/react";
import {
  X,
  FlaskConical,
  Atom,
  MinusCircle,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import { RecipeScores, ScientificLayer, SCORE_DIMENSIONS, resolveEngineMsgs } from "./pizza-engine";
import { useCms } from "./cms/cms-context";

interface ScoreDashboardProps {
  scores: RecipeScores;
  desktopMode?: boolean;
  nerdMode?: boolean;
  onNerdToggle?: () => void;
  science?: ScientificLayer | null;
}

const DIMS = SCORE_DIMENSIONS;

/* CMS-aware dimension labels — overlays CMS names on engine defaults */
function useCmsDims() {
  const { cms } = useCms();
  return DIMS.map(d => ({
    ...d,
    label: cms.scoreDimensions[d.key]?.label ?? d.label,
    short: cms.scoreDimensions[d.key]?.short ?? d.short,
  }));
}

function AnimNum({ value }: { value: number }) {
  const mv = useMotionValue(0);
  const display = useTransform(mv, (v) => Math.round(v));
  const [cur, setCur] = useState(0);
  useEffect(() => {
    const c = animate(mv, value, {
      type: "spring",
      stiffness: 220,
      damping: 25,
    });
    const u = display.on("change", (v) => setCur(v as number));
    return () => {
      c.stop();
      u();
    };
  }, [value, mv, display]);
  return <span>{cur}</span>;
}

/* ═══ RADAR CHART — Editorial pentagon with gradient fill ═══ */
function RadarChart({
  scores,
  size = 180,
}: {
  scores: RecipeScores;
  size?: number;
}) {
  const cmsDims = useCmsDims();
  const vb = 320;
  const ctr = vb / 2;
  const maxR = 88;
  const angleStep = (2 * Math.PI) / 5;
  const startAngle = -Math.PI / 2;
  const uid = `radar-${size}`;

  const getPoint = (i: number, pct: number) => {
    const angle = startAngle + i * angleStep;
    const r = maxR * (pct / 100);
    return {
      x: ctr + r * Math.cos(angle),
      y: ctr + r * Math.sin(angle),
    };
  };

  const values = cmsDims.map((d) => scores[d.key]);
  const dataPoints = values.map((v, i) => getPoint(i, v));
  const pathD =
    dataPoints
      .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
      .join(" ") + " Z";

  /* Per-vertex label anchoring — tuned per position to avoid clipping */
  const labelMeta: Array<{
    textAnchor: "middle" | "start" | "end";
    dx: number;
    dy: number;
  }> = [
    { textAnchor: "middle", dx: 0, dy: -8 },    /* top — centered above */
    { textAnchor: "start", dx: 10, dy: 0 },     /* top-right */
    { textAnchor: "start", dx: 10, dy: 4 },     /* bottom-right */
    { textAnchor: "end", dx: -10, dy: 4 },      /* bottom-left */
    { textAnchor: "end", dx: -10, dy: 0 },      /* top-left */
  ];

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${vb} ${vb}`}
      style={{ display: "block", overflow: "visible" }}
    >
      <defs>
        <linearGradient id={`${uid}-fill`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="var(--score-accent)" stopOpacity="0.70" />
          <stop offset="100%" stopColor="var(--score-secondary)" stopOpacity="0.45" />
        </linearGradient>
        <linearGradient id={`${uid}-stroke`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="var(--score-accent)" stopOpacity="1" />
          <stop offset="50%" stopColor="var(--score-secondary)" stopOpacity="0.85" />
          <stop offset="100%" stopColor="var(--score-tertiary)" stopOpacity="0.9" />
        </linearGradient>
        <filter id={`${uid}-glow`} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="3.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Grid — 25%, 50%, 75%, 100% pentagons */}
      {[25, 50, 75, 100].map((lvl) => {
        const pts = Array.from({ length: 5 }, (_, i) => getPoint(i, lvl));
        const d =
          pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ") + " Z";
        return (
          <path
            key={lvl}
            d={d}
            fill="none"
            stroke="var(--score-grid)"
            strokeWidth={lvl === 100 ? 1.2 : 0.6}
            opacity={lvl === 100 ? 0.4 : 0.18}
          />
        );
      })}

      {/* Data polygon */}
      <motion.path
        d={pathD}
        fill={`url(#${uid}-fill)`}
        stroke={`url(#${uid}-stroke)`}
        strokeWidth={2.5}
        strokeLinejoin="round"
        filter={`url(#${uid}-glow)`}
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 250, damping: 25 }}
        style={{ transformOrigin: `${ctr}px ${ctr}px` }}
      />

      {/* Vertex labels — colored pill with value + dimension name */}
      {cmsDims.map((d, i) => {
        const dataP = getPoint(i, values[i]);
        const anchorP = getPoint(i, 100);
        const labelR = 135;
        const angle = startAngle + i * angleStep;
        const baseX = ctr + labelR * Math.cos(angle);
        const baseY = ctr + labelR * Math.sin(angle);
        const m = labelMeta[i];

        return (
          <g key={d.key}>
            {/* Subtle spoke */}
            <line
              x1={ctr}
              y1={ctr}
              x2={anchorP.x}
              y2={anchorP.y}
              stroke="var(--score-grid)"
              strokeWidth={0.5}
              opacity={0.12}
            />
            {/* Data dot */}
            <motion.circle
              cx={dataP.x}
              cy={dataP.y}
              r={4.5}
              fill={d.color}
              stroke="var(--score-page)"
              strokeWidth={2}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                delay: 0.25 + i * 0.05,
                type: "spring",
                stiffness: 400,
                damping: 22,
              }}
            />
            {/* Score value — bold, colored, prominent */}
            <text
              x={baseX + m.dx}
              y={baseY + m.dy - 9}
              textAnchor={m.textAnchor}
              dominantBaseline="auto"
              fill={d.color}
              fontSize="22"
              fontWeight="700"
              fontFamily="'DM Sans', sans-serif"
              style={{ fontFeatureSettings: "'tnum'" }}
            >
              {Math.round(values[i])}
            </text>
            {/* Dimension label — directly below the value */}
            <text
              x={baseX + m.dx}
              y={baseY + m.dy + 8}
              textAnchor={m.textAnchor}
              dominantBaseline="auto"
              fill="var(--score-label)"
              fontSize="14"
              fontWeight="600"
              fontFamily="'DM Sans', sans-serif"
              letterSpacing="0.01em"
            >
              {d.label}
            </text>
          </g>
        );
      })}

      {/* Center composite score — number only, no "COMPOSITE" label */}
      <text
        x={ctr}
        y={ctr + 1}
        textAnchor="middle"
        dominantBaseline="central"
        fill="var(--score-value)"
        fontSize="32"
        fontWeight="700"
        fontFamily="'DM Sans', sans-serif"
        style={{ fontFeatureSettings: "'tnum'" }}
      >
        {Math.round(scores.composite)}
      </text>
    </svg>
  );
}

/* ═══ ACTIVITY RINGS — for normal mode full view ═══ */
const VB = 200;
const RING_W = 9;
const RING_GAP = 3;
const CTR = VB / 2;

function ActivityRings({
  scores,
  size = 160,
}: {
  scores: RecipeScores;
  size?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${VB} ${VB}`}
      style={{ display: "block" }}
    >
      {DIMS.map((d, i) => {
        const r =
          CTR -
          RING_W / 2 -
          i * (RING_W + RING_GAP) -
          RING_GAP * 2;
        const circ = 2 * Math.PI * r;
        const val = scores[d.key];
        const off = circ * (1 - val / 100);
        return (
          <g key={d.key}>
            <circle
              cx={CTR}
              cy={CTR}
              r={r}
              fill="none"
              stroke={d.color}
              strokeOpacity={0.12}
              strokeWidth={RING_W}
              strokeLinecap="round"
            />
            <motion.circle
              cx={CTR}
              cy={CTR}
              r={r}
              fill="none"
              stroke={d.color}
              strokeWidth={RING_W}
              strokeLinecap="round"
              strokeDasharray={circ}
              initial={{ strokeDashoffset: circ }}
              animate={{ strokeDashoffset: off }}
              transition={{ type: "spring", stiffness: 200, damping: 25 }}
              transform={`rotate(-90 ${CTR} ${CTR})`}
            />
          </g>
        );
      })}
      <text
        x={CTR}
        y={CTR - 3}
        textAnchor="middle"
        dominantBaseline="central"
        fill="var(--score-value)"
        fontSize="32"
        fontWeight="700"
        fontFamily="'DM Sans', sans-serif"
        style={{ fontFeatureSettings: "'tnum'" }}
      >
        {Math.round(scores.composite)}
      </text>
    </svg>
  );
}

/* ═══ COMPOSITE RING — thin single ring for compact ═══ */
function CompositeRing({
  value,
  size = 48,
}: {
  value: number;
  size?: number;
}) {
  const vb = 60;
  const ctr = vb / 2;
  const r = 24;
  const w = 4;
  const circ = 2 * Math.PI * r;
  const off = circ * (1 - value / 100);
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${vb} ${vb}`}
      style={{ display: "block" }}
    >
      <circle
        cx={ctr}
        cy={ctr}
        r={r}
        fill="none"
        stroke="var(--score-track)"
        strokeWidth={w}
      />
      <motion.circle
        cx={ctr}
        cy={ctr}
        r={r}
        fill="none"
        stroke="var(--score-accent)"
        strokeWidth={w}
        strokeLinecap="round"
        strokeDasharray={circ}
        initial={{ strokeDashoffset: circ }}
        animate={{ strokeDashoffset: off }}
        transition={{ type: "spring", stiffness: 200, damping: 25 }}
        transform={`rotate(-90 ${ctr} ${ctr})`}
      />
      <text
        x={ctr}
        y={ctr}
        textAnchor="middle"
        dominantBaseline="central"
        fill="var(--score-value)"
        fontSize="15"
        fontWeight="700"
        fontFamily="'DM Sans', sans-serif"
        style={{ fontFeatureSettings: "'tnum'" }}
      >
        {Math.round(value)}
      </text>
    </svg>
  );
}

/* ═══ MINI RADAR — simplified pentagon for 56px compact ═══ */
function MiniRadar({
  scores,
  size = 56,
}: {
  scores: RecipeScores;
  size?: number;
}) {
  const ctr = size / 2;
  const maxR = size * 0.38;
  const angleStep = (2 * Math.PI) / 5;
  const startAngle = -Math.PI / 2;
  const uid = `mini-radar-${size}`;

  const getPoint = (i: number, pct: number) => {
    const angle = startAngle + i * angleStep;
    const r = maxR * (pct / 100);
    return { x: ctr + r * Math.cos(angle), y: ctr + r * Math.sin(angle) };
  };

  const values = DIMS.map((d) => scores[d.key]);
  const dataPoints = values.map((v, i) => getPoint(i, v));
  const pathD =
    dataPoints.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ") + " Z";

  const outerPts = Array.from({ length: 5 }, (_, i) => getPoint(i, 100));
  const outerD =
    outerPts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ") + " Z";

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      style={{ display: "block" }}
    >
      <defs>
        <linearGradient id={`${uid}-fill`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="var(--score-accent)" stopOpacity="0.22" />
          <stop offset="100%" stopColor="var(--score-secondary)" stopOpacity="0.08" />
        </linearGradient>
        <linearGradient id={`${uid}-stroke`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="var(--score-accent)" stopOpacity="0.9" />
          <stop offset="100%" stopColor="var(--score-secondary)" stopOpacity="0.6" />
        </linearGradient>
      </defs>

      {/* Outer pentagon outline */}
      <path
        d={outerD}
        fill="none"
        stroke="var(--score-grid)"
        strokeWidth={0.8}
        opacity={0.3}
      />

      {/* Data polygon */}
      <motion.path
        d={pathD}
        fill={`url(#${uid}-fill)`}
        stroke={`url(#${uid}-stroke)`}
        strokeWidth={1.5}
        strokeLinejoin="round"
        initial={{ opacity: 0, scale: 0.4 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        style={{ transformOrigin: `${ctr}px ${ctr}px` }}
      />

      {/* Vertex dots — colored per dimension */}
      {DIMS.map((d, i) => {
        const p = getPoint(i, values[i]);
        return (
          <circle
            key={d.key}
            cx={p.x}
            cy={p.y}
            r={1.8}
            fill={d.color}
          />
        );
      })}

      {/* Center composite score */}
      <text
        x={ctr}
        y={ctr + 0.5}
        textAnchor="middle"
        dominantBaseline="central"
        fill="var(--score-value)"
        fontSize="13"
        fontWeight="700"
        fontFamily="'DM Sans', sans-serif"
        style={{ fontFeatureSettings: "'tnum'" }}
      >
        {Math.round(scores.composite)}
      </text>
    </svg>
  );
}

/* ═══ MESSAGE ICON HELPER ═══ */
function MsgIcon({
  type,
}: {
  type: "penalty" | "warning" | "claim";
}) {
  if (type === "penalty")
    return (
      <MinusCircle
        size={13}
        style={{ color: "var(--score-secondary)", flexShrink: 0 }}
      />
    );
  if (type === "warning")
    return (
      <AlertTriangle
        size={13}
        style={{ color: "var(--score-tertiary)", flexShrink: 0 }}
      />
    );
  return (
    <CheckCircle2
      size={13}
      style={{ color: "var(--score-accent)", flexShrink: 0 }}
    />
  );
}

function categorizeMessages(
  scores: RecipeScores,
  engineTemplates?: Record<string, string>,
): { msg: string; type: "penalty" | "warning" | "claim" }[] {
  if (!scores) return [];
  const pTexts = resolveEngineMsgs(scores.penalties ?? [], engineTemplates);
  const wTexts = resolveEngineMsgs(scores.warnings ?? [], engineTemplates);
  const cTexts = resolveEngineMsgs(scores.claims ?? [], engineTemplates);
  return [
    ...pTexts.map((msg) => ({ msg, type: "penalty" as const })),
    ...wTexts.map((msg) => ({ msg, type: "warning" as const })),
    ...cTexts.map((msg) => ({ msg, type: "claim" as const })),
  ];
}

/* ═══ SCIENCE GRID — compact nerd data ═══ */
function ScienceGrid({
  science,
}: {
  science: ScientificLayer;
}) {
  const { cms } = useCms();
  const sl = cms.scienceLabels;
  const cells = [
    {
      label: `${sl.yeastBaker} (baker's %)`,
      value: `${science.yeast_baker_pct}%`,
    },
    {
      label: `${sl.effectiveHours} @18°C`,
      value: `${science.effective_hours_18c}h`,
    },
    { label: sl.q10Factor, value: `${science.q10_factor}× (${science.q10_model === "cold_adapted" ? sl.q10Cold : science.q10_model === "sourdough" ? sl.q10Sourdough : sl.q10Standard})` },
    {
      label: sl.waterActivity,
      value: `${science.water_activity}`,
    },
    {
      label: sl.glutenNetwork,
      value: `${science.gluten_network}/100`,
    },
    {
      label: sl.proteolysis,
      value: `${science.proteolysis_index}/100`,
    },
    {
      label: sl.starchDegradation,
      value: `${science.starch_degradation_pct}%`,
    },
    {
      label: sl.fodmapReduction,
      value:
        science.fodmap_reduction_pct != null
          ? `${science.fodmap_reduction_pct}%`
          : "—",
    },
    {
      label: sl.plEstimated,
      value: `${science.flour_pl_estimated}`,
    },
    {
      label: sl.bakingEnergy,
      value: `${science.baking_energy_kj} kJ`,
    },
    {
      label: sl.waterTemp,
      value: science.water_temp_c != null ? `${science.water_temp_c}°C` : "—",
    },
    {
      label: sl.desiredDoughTemp,
      value: `${science.desired_dough_temp_c}°C`,
    },
    {
      label: sl.frictionFactor,
      value: science.friction_factor > 0 ? `${science.friction_factor}°C` : "—",
    },
    {
      label: sl.deviationCategory ?? "Deviazione",
      value: science.deviation_category ?? "—",
    },
    {
      label: sl.deviationScore ?? "Dev. effettiva",
      value: `${Math.round((science.deviation_score_effective ?? 0) * 100)}%`,
    },
  ];
  return (
    <div
      className="grid grid-cols-2 gap-px rounded-xl overflow-hidden"
      style={{ background: "var(--score-border)" }}
    >
      {cells.map((c) => (
        <div
          key={c.label}
          className="px-3 py-2.5 flex flex-col gap-0.5"
          style={{ background: "var(--score-bg)" }}
        >
          <span
            className="type-data"
            style={{
              fontSize: "var(--font-size-xl-5)",
              fontWeight: "var(--weight-bold)" as any,
              color: "var(--score-value)",
            }}
          >
            {c.value}
          </span>
          <span
            style={{
              color: "var(--score-label)",
              fontSize: "var(--font-size-base)",
              fontWeight: "var(--weight-medium)" as any,
              lineHeight: "var(--leading-compact)",
            }}
          >
            {c.label}
          </span>
        </div>
      ))}
    </div>
  );
}

/* ═══ NERD TOGGLE ═══ */
function NerdToggle({
  active,
  onToggle,
}: {
  active: boolean;
  onToggle: () => void;
}) {
  const { cms } = useCms();
  return (
    <button
      onClick={onToggle}
      className="flex items-center gap-2 px-3 py-1.5 rounded-full transition-all active:scale-95"
      aria-pressed={active}
      style={{
        background: active
          ? "var(--score-nerd-bg)"
          : "var(--score-bg)",
        border: active
          ? "1px solid var(--score-nerd-border)"
          : "1px solid var(--score-border)",
      }}
    >
      <FlaskConical
        size={12}
        style={{
          color: active
            ? "var(--score-accent)"
            : "var(--score-label)",
        }}
      />
      <span
        style={{
          fontSize: "var(--font-size-base)",
          fontWeight: "var(--weight-semibold)" as any,
          color: active
            ? "var(--score-accent)"
            : "var(--score-label)",
        }}
      >
        {cms.ui.nerdToggle}
      </span>
      <div
        className="relative w-8 h-4 rounded-full"
        style={{
          background: active
            ? "var(--score-accent)"
            : "var(--switch-background)",
        }}
      >
        <motion.div
          className="absolute top-0.5 w-3 h-3 rounded-full bg-white"
          animate={{ x: active ? 16 : 2 }}
          transition={{
            type: "spring",
            stiffness: 500,
            damping: 30,
          }}
        />
      </div>
    </button>
  );
}

/* ═══ BOTTOM SHEET via Portal ═══ */
function BottomSheet({
  open,
  onClose,
  scores,
  nerdMode,
  science,
}: {
  open: boolean;
  onClose: () => void;
  scores: RecipeScores;
  nerdMode?: boolean;
  science?: ScientificLayer | null;
}) {
  const cmsDims = useCmsDims();
  const { cms } = useCms();
  const msgs = categorizeMessages(scores, cms.engineMessages);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [open]);

  const content = (
    <AnimatePresence>
      {open && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 9999,
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
          }}
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "absolute",
              inset: 0,
              background: "var(--score-modal-backdrop)",
              WebkitBackdropFilter: "blur(4px)",
              backdropFilter: "blur(4px)",
            }}
            onClick={onClose}
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{
              type: "spring",
              stiffness: 380,
              damping: 34,
            }}
            style={{
              position: "relative",
              background: "var(--score-card)",
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              maxHeight: "85vh",
              overflowY: "auto",
              boxShadow: "var(--score-modal-shadow)",
              border: "1px solid var(--score-border)",
              borderBottom: "none",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                paddingTop: 12,
                paddingBottom: 4,
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 4,
                  borderRadius: 2,
                  background: "var(--score-border-strong)",
                }}
              />
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "8px 24px 16px",
              }}
            >
              <h3 style={{ fontSize: "var(--font-size-3xl)" }}>
                {cms.ui.recipeScore}
              </h3>
              <button
                onClick={onClose}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "var(--score-border-strong)",
                  border: "none",
                  cursor: "pointer",
                }}
                aria-label={cms.ui.ariaCloseScores}
                className="active:scale-95 transition-transform"
              >
                <X
                  size={16}
                  style={{ color: "var(--score-label)" }}
                />
              </button>
            </div>

            {/* Chart — switches between rings and radar */}
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                paddingBottom: 20,
                paddingLeft: 12,
                paddingRight: 12,
              }}
            >
              <AnimatePresence mode="wait">
                {nerdMode ? (
                  <motion.div
                    key="radar"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                  >
                    <RadarChart scores={scores} size={260} />
                  </motion.div>
                ) : (
                  <motion.div
                    key="rings"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                  >
                    <ActivityRings scores={scores} size={180} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Science grid in nerd mode */}
            {nerdMode && science && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ padding: "0 24px 16px" }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Atom
                    size={11}
                    style={{ color: "var(--score-accent)" }}
                  />
                  <span
                    style={{
                      fontSize: "var(--font-size-base)",
                      fontWeight: "var(--weight-bold)" as any,
                      letterSpacing: "var(--tracking-caps)",
                      textTransform: "uppercase",
                      color: "var(--score-accent)",
                    }}
                  >
                    {cms.ui.scienceTitle}
                  </span>
                </div>
                <ScienceGrid science={science} />
              </motion.div>
            )}

            {/* Dimension bars */}
            <div
              style={{
                padding: "0 24px 16px",
                display: "flex",
                flexDirection: "column",
                gap: 14,
              }}
            >
              {cmsDims.map((d, i) => (
                <div
                  key={d.key}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 6,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                      }}
                    >
                      <div
                        style={{
                          width: 10,
                          height: 10,
                          borderRadius: 5,
                          background: d.color,
                        }}
                      />
                      <span
                        style={{
                          fontSize: "var(--font-size-xl-5)",
                          fontWeight: "var(--weight-medium)" as any,
                          color: "var(--score-value)",
                        }}
                      >
                        {d.label}
                      </span>
                    </div>
                    <span
                      className="type-numeric"
                      style={{
                        fontSize: "var(--font-size-2xl)",
                        fontWeight: "var(--weight-bold)" as any,
                        color: d.color,
                      }}
                    >
                      <AnimNum value={scores[d.key]} />
                    </span>
                  </div>
                  <div
                    style={{
                      height: 6,
                      borderRadius: 3,
                      background: "var(--score-bg)",
                    }}
                  >
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${scores[d.key]}%` }}
                      transition={{
                        type: "spring",
                        stiffness: 220,
                        damping: 25,
                        delay: 0.1 + i * 0.05,
                      }}
                      style={{
                        height: "100%",
                        borderRadius: 3,
                        background: d.color,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Messages with icons */}
            {msgs.length > 0 && (
              <div style={{ padding: "8px 24px 32px" }}>
                <div
                  style={{
                    borderTop: "1px solid var(--score-divider)",
                    paddingTop: 14,
                    display: "flex",
                    flexDirection: "column",
                    gap: 10,
                  }}
                >
                  {msgs.slice(0, 8).map((m, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-2.5"
                    >
                      <div className="mt-0.5">
                        <MsgIcon type={m.type} />
                      </div>
                      <p
                        style={{
                          fontSize: "var(--font-size-lg)",
                          lineHeight: 1.55,
                          color: "var(--score-label)",
                          margin: 0,
                        }}
                      >
                        {m.msg}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div style={{ height: 24 }} />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return createPortal(content, document.body);
}

/* ═══ MAIN EXPORT ═══ */
export function ScoreDashboard({
  scores,
  desktopMode,
  nerdMode,
  onNerdToggle,
  science,
}: ScoreDashboardProps) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const cmsDims = useCmsDims();
  const { cms } = useCms();

  /* Guard: if scores not yet available, render nothing */
  if (!scores) return null;

  const msgs = categorizeMessages(scores, cms.engineMessages);

  /* ═══ Desktop sidebar ═══ */
  if (desktopMode) {
    return (
      <div
        className="rounded-3xl flex flex-col gap-5"
        style={{
          background: "var(--score-bg)",
          border: "1px solid var(--score-border)",
          padding: "1.5rem",
        }}
      >
        {/* Nerd toggle */}
        {onNerdToggle && (
          <div className="flex justify-end">
            <NerdToggle
              active={!!nerdMode}
              onToggle={onNerdToggle}
            />
          </div>
        )}

        {/* Chart */}
        <div className="flex justify-center">
          <AnimatePresence mode="wait">
            {nerdMode ? (
              <motion.div
                key="radar"
                initial={{ opacity: 0, rotateY: 90 }}
                animate={{ opacity: 1, rotateY: 0 }}
                exit={{ opacity: 0, rotateY: -90 }}
                transition={{ type: "spring", stiffness: 350, damping: 25 }}
              >
                <RadarChart scores={scores} size={170} />
              </motion.div>
            ) : (
              <motion.div
                key="rings"
                initial={{ opacity: 0, rotateY: -90 }}
                animate={{ opacity: 1, rotateY: 0 }}
                exit={{ opacity: 0, rotateY: 90 }}
                transition={{ type: "spring", stiffness: 350, damping: 25 }}
              >
                <ActivityRings scores={scores} size={170} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Science grid in nerd mode */}
        <AnimatePresence>
          {nerdMode && science && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="flex items-center gap-2 mb-2">
                <Atom
                  size={11}
                  style={{ color: "var(--score-accent)" }}
                />
                <span
                  style={{
                    fontSize: "var(--font-size-base)",
                    fontWeight: "var(--weight-bold)" as any,
                    letterSpacing: "var(--tracking-caps)",
                    textTransform: "uppercase",
                    color: "var(--score-accent)",
                  }}
                >
                  {cms.ui.scienceTitle}
                </span>
              </div>
              <ScienceGrid science={science} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Dimension rows */}
        <div className="flex flex-col gap-3">
          {cmsDims.map((d, i) => (
            <motion.div
              key={d.key}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                delay: 0.3 + i * 0.05,
                type: "spring",
                stiffness: 500,
                damping: 28,
              }}
              className="flex items-center gap-3"
            >
              <div
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ background: d.color }}
              />
              <div className="flex-1 flex items-center justify-between">
                <span
                  style={{
                    color: "var(--text-default)",
                    fontSize: "var(--font-size-lg)",
                    fontWeight: "var(--weight-medium)" as any,
                  }}
                >
                  {d.label}
                </span>
                <span
                  className="type-numeric"
                  style={{
                    fontSize: "var(--font-size-xl)",
                    fontWeight: "var(--weight-bold)" as any,
                    color: d.color,
                  }}
                >
                  <AnimNum value={scores[d.key]} />
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Messages with icons */}
        {msgs.length > 0 && (
          <div
            className="flex flex-col gap-2 pt-3"
            style={{
              borderTop: "1px solid var(--score-border)",
            }}
          >
            {msgs.slice(0, 5).map((m, i) => (
              <div key={i} className="flex items-start gap-2">
                <div className="mt-0.5">
                  <MsgIcon type={m.type} />
                </div>
                <p
                  style={{
                    color: "var(--score-label)",
                    fontSize: "var(--font-size-md)",
                    lineHeight: "var(--leading-relaxed)",
                    margin: 0,
                  }}
                >
                  {m.msg}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  /* ═══ Mobile/tablet compact — 2-row layout ═══ */
  return (
    <div className="flex flex-col gap-4">
      {/* Row 1: Chart/ring + title + nerd toggle */}
      <div className="flex items-center gap-3.5">
        <button
          onClick={() => setSheetOpen(true)}
          className="flex-shrink-0 active:scale-95 transition-transform"
          aria-label={cms.ui.ariaViewScores}
        >
          <AnimatePresence mode="wait">
            {nerdMode ? (
              <motion.div
                key="radar-compact"
                initial={{ opacity: 0, rotateY: 90 }}
                animate={{ opacity: 1, rotateY: 0 }}
                exit={{ opacity: 0, rotateY: -90 }}
                transition={{ type: "spring", stiffness: 400, damping: 28 }}
              >
                <MiniRadar scores={scores} size={56} />
              </motion.div>
            ) : (
              <motion.div
                key="ring-compact"
                initial={{ opacity: 0, rotateY: -90 }}
                animate={{ opacity: 1, rotateY: 0 }}
                exit={{ opacity: 0, rotateY: 90 }}
                transition={{ type: "spring", stiffness: 400, damping: 28 }}
              >
                <CompositeRing value={scores.composite} size={56} />
              </motion.div>
            )}
          </AnimatePresence>
        </button>
        <div className="flex-1 min-w-0">
          <button
            onClick={() => setSheetOpen(true)}
            className="text-left active:scale-[0.98] transition-transform"
          >
            <AnimatePresence mode="wait">
              {nerdMode ? (
                <motion.span
                  key="nerd-title"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  style={{
                    display: "block",
                    fontSize: "var(--font-size-xl-5)",
                    fontWeight: "var(--weight-semibold)" as any,
                    color: "var(--score-accent)",
                    lineHeight: "var(--leading-compact)",
                  }}
                >
                  {cms.ui.nerdActive}
                </motion.span>
              ) : (
                <motion.span
                  key="normal-title"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  style={{
                    display: "block",
                    fontSize: "var(--font-size-xl-5)",
                    fontWeight: "var(--weight-semibold)" as any,
                    color: "var(--text-default)",
                    lineHeight: "var(--leading-compact)",
                  }}
                >
                  {cms.ui.recipeScore}
                </motion.span>
              )}
            </AnimatePresence>
            <span
              style={{
                fontSize: "var(--font-size-base)",
                color: nerdMode ? "var(--score-accent)" : "var(--text-accent)",
                fontWeight: "var(--weight-medium)" as any,
                opacity: nerdMode ? 0.7 : 1,
              }}
            >
              {cms.ui.tapForDetails}
            </span>
          </button>
        </div>
        {onNerdToggle && (
          <div className="flex-shrink-0">
            <NerdToggle active={!!nerdMode} onToggle={onNerdToggle} />
          </div>
        )}
      </div>

      {/* Bottom sheet portal for full details */}
      <BottomSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        scores={scores}
        nerdMode={nerdMode}
        science={science}
      />
    </div>
  );
}