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
import { RecipeScores, ScientificLayer } from "./pizza-engine";

interface ScoreDashboardProps {
  scores: RecipeScores;
  desktopMode?: boolean;
  nerdMode?: boolean;
  onNerdToggle?: () => void;
  science?: ScientificLayer | null;
}

const DIMS = [
  {
    key: "authenticity" as const,
    label: "Autenticità",
    short: "Aut",
    color: "var(--primary)",
  },
  {
    key: "feasibility" as const,
    label: "Fattibilità",
    short: "Fat",
    color: "var(--tertiary)",
  },
  {
    key: "digestibility" as const,
    label: "Digeribilità",
    short: "Dig",
    color: "var(--cta)",
  },
  {
    key: "experimentation" as const,
    label: "Sperimentazione",
    short: "Spe",
    color: "var(--secondary)",
  },
  {
    key: "sustainability" as const,
    label: "Sostenibilità",
    short: "Sos",
    color: "var(--warm-olive)",
  },
];

function AnimNum({ value }: { value: number }) {
  const mv = useMotionValue(0);
  const display = useTransform(mv, (v) => Math.round(v));
  const [cur, setCur] = useState(0);
  useEffect(() => {
    const c = animate(mv, value, {
      duration: 0.8,
      ease: [0.16, 1, 0.3, 1],
    });
    const u = display.on("change", (v) => setCur(v as number));
    return () => {
      c.stop();
      u();
    };
  }, [value, mv, display]);
  return <span>{cur}</span>;
}

/* ═══ RADAR CHART — Pentagon for nerd mode ═══ */
function RadarChart({
  scores,
  size = 180,
}: {
  scores: RecipeScores;
  size?: number;
}) {
  const ctr = size / 2;
  const maxR = size * 0.38;
  const angleStep = (2 * Math.PI) / 5;
  const startAngle = -Math.PI / 2;

  const getPoint = (i: number, pct: number) => {
    const angle = startAngle + i * angleStep;
    const r = maxR * (pct / 100);
    return {
      x: ctr + r * Math.cos(angle),
      y: ctr + r * Math.sin(angle),
    };
  };

  // Grid rings
  const gridLevels = [25, 50, 75, 100];
  const values = DIMS.map((d) => scores[d.key]);
  const dataPoints = values.map((v, i) => getPoint(i, v));
  const pathD =
    dataPoints
      .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
      .join(" ") + " Z";

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      style={{ display: "block" }}
    >
      {/* Grid */}
      {gridLevels.map((lvl) => {
        const pts = Array.from({ length: 5 }, (_, i) =>
          getPoint(i, lvl),
        );
        const d =
          pts
            .map(
              (p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`,
            )
            .join(" ") + " Z";
        return (
          <path
            key={lvl}
            d={d}
            fill="none"
            stroke="var(--outline-variant)"
            strokeWidth={0.8}
            opacity={0.5}
          />
        );
      })}

      {/* Spokes */}
      {DIMS.map((_, i) => {
        const p = getPoint(i, 100);
        return (
          <line
            key={i}
            x1={ctr}
            y1={ctr}
            x2={p.x}
            y2={p.y}
            stroke="var(--outline-variant)"
            strokeWidth={0.5}
            opacity={0.4}
          />
        );
      })}

      {/* Data fill */}
      <motion.path
        d={pathD}
        fill="var(--primary)"
        fillOpacity={0.12}
        stroke="var(--primary)"
        strokeWidth={2}
        strokeLinejoin="round"
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        style={{ transformOrigin: `${ctr}px ${ctr}px` }}
      />

      {/* Data points + labels */}
      {DIMS.map((d, i) => {
        const p = getPoint(i, values[i]);
        const labelP = getPoint(i, 115);
        return (
          <g key={d.key}>
            <motion.circle
              cx={p.x}
              cy={p.y}
              r={4}
              fill={d.color}
              stroke="var(--background)"
              strokeWidth={2}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                delay: 0.2 + i * 0.06,
                type: "spring",
                stiffness: 400,
                damping: 20,
              }}
            />
            <text
              x={labelP.x}
              y={labelP.y}
              textAnchor="middle"
              dominantBaseline="central"
              fill="var(--muted-foreground)"
              fontSize="8"
              fontWeight="600"
              fontFamily="'DM Sans', sans-serif"
            >
              {d.short}
            </text>
          </g>
        );
      })}

      {/* Center composite */}
      <text
        x={ctr}
        y={ctr}
        textAnchor="middle"
        dominantBaseline="central"
        fill="var(--foreground)"
        fontSize="22"
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
              transition={{
                duration: 1,
                delay: 0.15 + i * 0.1,
                ease: [0.16, 1, 0.3, 1],
              }}
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
        fill="var(--foreground)"
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
        stroke="var(--outline-variant)"
        strokeWidth={w}
      />
      <motion.circle
        cx={ctr}
        cy={ctr}
        r={r}
        fill="none"
        stroke="var(--primary)"
        strokeWidth={w}
        strokeLinecap="round"
        strokeDasharray={circ}
        initial={{ strokeDashoffset: circ }}
        animate={{ strokeDashoffset: off }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        transform={`rotate(-90 ${ctr} ${ctr})`}
      />
      <text
        x={ctr}
        y={ctr}
        textAnchor="middle"
        dominantBaseline="central"
        fill="var(--foreground)"
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
        style={{ color: "var(--destructive)", flexShrink: 0 }}
      />
    );
  if (type === "warning")
    return (
      <AlertTriangle
        size={13}
        style={{ color: "var(--tertiary)", flexShrink: 0 }}
      />
    );
  return (
    <CheckCircle2
      size={13}
      style={{ color: "var(--cta)", flexShrink: 0 }}
    />
  );
}

function categorizeMessages(
  scores: RecipeScores,
): { msg: string; type: "penalty" | "warning" | "claim" }[] {
  return [
    ...scores.penalties.map((msg) => ({
      msg,
      type: "penalty" as const,
    })),
    ...scores.warnings.map((msg) => ({
      msg,
      type: "warning" as const,
    })),
    ...scores.claims.map((msg) => ({
      msg,
      type: "claim" as const,
    })),
  ];
}

/* ═══ SCIENCE GRID — compact nerd data ═══ */
function ScienceGrid({
  science,
}: {
  science: ScientificLayer;
}) {
  const cells = [
    {
      label: "Lievito (baker's %)",
      value: `${science.yeast_baker_pct}%`,
    },
    {
      label: "Ore eff. @18°C",
      value: `${science.effective_hours_18c}h`,
    },
    { label: "Q₁₀ factor", value: `${science.q10_factor}×` },
    {
      label: "Water activity",
      value: `${science.water_activity}`,
    },
    {
      label: "Rete glutinica",
      value: `${science.gluten_network}/100`,
    },
    {
      label: "Proteolisi",
      value: `${science.proteolysis_index}/100`,
    },
    {
      label: "Degr. amidi",
      value: `${science.starch_degradation_pct}%`,
    },
    {
      label: "FODMAP riduz.",
      value:
        science.fodmap_reduction_pct != null
          ? `${science.fodmap_reduction_pct}%`
          : "—",
    },
  ];
  return (
    <div
      className="grid grid-cols-2 gap-px rounded-xl overflow-hidden"
      style={{ background: "var(--outline-variant)" }}
    >
      {cells.map((c) => (
        <div
          key={c.label}
          className="px-3 py-2.5 flex flex-col gap-0.5"
          style={{ background: "var(--surface-container)" }}
        >
          <span
            style={{
              fontSize: "0.9375rem",
              fontWeight: 700,
              color: "var(--foreground)",
              fontFamily: "'DM Mono', monospace",
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {c.value}
          </span>
          <span
            className="text-muted-foreground"
            style={{
              fontSize: "0.5625rem",
              fontWeight: 500,
              lineHeight: 1.3,
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
  return (
    <button
      onClick={onToggle}
      className="flex items-center gap-2 px-3 py-1.5 rounded-full transition-all"
      style={{
        background: active
          ? "color-mix(in srgb, var(--primary) 12%, var(--surface-container))"
          : "var(--surface-container)",
        border: active
          ? "1px solid color-mix(in srgb, var(--primary) 25%, var(--outline-variant))"
          : "1px solid var(--outline-variant)",
      }}
    >
      <FlaskConical
        size={12}
        style={{
          color: active
            ? "var(--primary)"
            : "var(--muted-foreground)",
        }}
      />
      <span
        style={{
          fontSize: "0.6875rem",
          fontWeight: 600,
          color: active
            ? "var(--primary)"
            : "var(--muted-foreground)",
        }}
      >
        PizzaNerd
      </span>
      <div
        className="relative w-8 h-4 rounded-full"
        style={{
          background: active
            ? "var(--primary)"
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
  const msgs = categorizeMessages(scores);

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
              background: "rgba(0,0,0,0.45)",
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
              background: "var(--card)",
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              maxHeight: "85vh",
              overflowY: "auto",
              boxShadow: "0 -8px 40px rgba(0,0,0,0.18)",
              border: "1px solid var(--outline-variant)",
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
                  background: "var(--outline)",
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
              <h3 style={{ fontSize: "1.125rem" }}>
                Punteggio ricetta
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
                  background: "var(--surface-container)",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                <X
                  size={16}
                  style={{ color: "var(--muted-foreground)" }}
                />
              </button>
            </div>

            {/* Chart — switches between rings and radar */}
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                paddingBottom: 20,
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
                    <RadarChart scores={scores} size={200} />
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
                <div className="flex items-center gap-2 mb-3">
                  <Atom
                    size={12}
                    style={{ color: "var(--primary)" }}
                  />
                  <span
                    style={{
                      fontSize: "0.625rem",
                      fontWeight: 700,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      color: "var(--primary)",
                    }}
                  >
                    Science Layer
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
              {DIMS.map((d, i) => (
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
                          fontSize: "0.9375rem",
                          fontWeight: 500,
                          color: "var(--foreground)",
                        }}
                      >
                        {d.label}
                      </span>
                    </div>
                    <span
                      style={{
                        fontSize: "1rem",
                        fontWeight: 700,
                        color: d.color,
                        fontFamily: "'DM Sans', sans-serif",
                        fontVariantNumeric: "tabular-nums",
                      }}
                    >
                      <AnimNum value={scores[d.key]} />
                    </span>
                  </div>
                  <div
                    style={{
                      height: 6,
                      borderRadius: 3,
                      background: "var(--surface-container)",
                    }}
                  >
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${scores[d.key]}%` }}
                      transition={{
                        duration: 0.8,
                        ease: [0.16, 1, 0.3, 1],
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
                    borderTop: "1px solid var(--border)",
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
                          fontSize: "0.8125rem",
                          lineHeight: 1.55,
                          color: "var(--muted-foreground)",
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
  const msgs = categorizeMessages(scores);

  /* ═══ Desktop sidebar ═══ */
  if (desktopMode) {
    return (
      <div
        className="rounded-3xl flex flex-col gap-5"
        style={{
          background: "var(--surface-container)",
          border: "1px solid var(--outline-variant)",
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
                transition={{ duration: 0.4 }}
              >
                <RadarChart scores={scores} size={170} />
              </motion.div>
            ) : (
              <motion.div
                key="rings"
                initial={{ opacity: 0, rotateY: -90 }}
                animate={{ opacity: 1, rotateY: 0 }}
                exit={{ opacity: 0, rotateY: 90 }}
                transition={{ duration: 0.4 }}
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
                  style={{ color: "var(--primary)" }}
                />
                <span
                  style={{
                    fontSize: "0.5625rem",
                    fontWeight: 700,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: "var(--primary)",
                  }}
                >
                  Vulcan Science
                </span>
              </div>
              <ScienceGrid science={science} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Dimension rows */}
        <div className="flex flex-col gap-3">
          {DIMS.map((d, i) => (
            <motion.div
              key={d.key}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                delay: 0.3 + i * 0.05,
                duration: 0.25,
              }}
              className="flex items-center gap-3"
            >
              <div
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ background: d.color }}
              />
              <div className="flex-1 flex items-center justify-between">
                <span
                  className="text-foreground"
                  style={{
                    fontSize: "0.8125rem",
                    fontWeight: 500,
                  }}
                >
                  {d.label}
                </span>
                <span
                  style={{
                    fontSize: "0.875rem",
                    fontWeight: 700,
                    color: d.color,
                    fontFamily: "'DM Sans', sans-serif",
                    fontVariantNumeric: "tabular-nums",
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
              borderTop: "1px solid var(--outline-variant)",
            }}
          >
            {msgs.slice(0, 5).map((m, i) => (
              <div key={i} className="flex items-start gap-2">
                <div className="mt-0.5">
                  <MsgIcon type={m.type} />
                </div>
                <p
                  className="text-muted-foreground"
                  style={{
                    fontSize: "0.75rem",
                    lineHeight: 1.5,
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

  /* ═══ Mobile compact — composite ring + micro bars ═══ */
  return (
    <div>
      <div className="flex items-center gap-3">
        <button
          onClick={() => setSheetOpen(true)}
          className="flex-1 flex items-center gap-3.5 py-2 group"
        >
          <div className="flex-shrink-0">
            <AnimatePresence mode="wait">
              {nerdMode ? (
                <motion.div
                  key="radar-m"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <RadarChart scores={scores} size={56} />
                </motion.div>
              ) : (
                <motion.div
                  key="ring-m"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <CompositeRing
                    value={scores.composite}
                    size={52}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <div className="flex-1 flex flex-col gap-1.5">
            {DIMS.map((d) => (
              <div
                key={d.key}
                className="flex items-center gap-2"
              >
                <span
                  className="text-muted-foreground flex-shrink-0"
                  style={{
                    fontSize: "0.5625rem",
                    fontWeight: 600,
                    width: 22,
                  }}
                >
                  {d.short}
                </span>
                <div
                  className="flex-1 h-[4px] rounded-full overflow-hidden"
                  style={{
                    background: "var(--surface-container)",
                  }}
                >
                  <motion.div
                    className="h-full rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${scores[d.key]}%` }}
                    transition={{
                      duration: 0.7,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    style={{ background: d.color }}
                  />
                </div>
                <span
                  style={{
                    fontSize: "0.625rem",
                    fontWeight: 700,
                    width: 20,
                    textAlign: "right",
                    color: d.color,
                    fontFamily: "'DM Sans', sans-serif",
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {Math.round(scores[d.key])}
                </span>
              </div>
            ))}
          </div>
          <span
            className="text-primary flex-shrink-0"
            style={{ fontSize: "0.625rem", fontWeight: 600 }}
          >
            Dettagli
          </span>
        </button>

        {onNerdToggle && (
          <NerdToggle
            active={!!nerdMode}
            onToggle={onNerdToggle}
          />
        )}
      </div>

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