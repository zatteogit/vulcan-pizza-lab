import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Database,
  FlaskConical,
  Thermometer,
  BarChart3,
  ClipboardCheck,
  Bug,
  ChevronDown,
  CheckCircle2,
  AlertTriangle,
  Info,
  Flame,
  Wheat,
  Timer,
  Beaker,
  Leaf,
  Sparkles,
  Shield,
  Activity,
  Zap,
  ArrowLeft,
} from "lucide-react";
import {
  STYLES_DB,
  calculateOvenCompensations,
  getQ10,
  generateRecipe,
  type PizzaStyle,
  type OvenType,
  type UserConstraints,
} from "./pizza-engine";

/* ═══ TYPES ═══ */
type TabId =
  | "overview"
  | "styles"
  | "compensations"
  | "q10"
  | "scores"
  | "audit";

interface TabDef {
  id: TabId;
  label: string;
  icon: React.ReactNode;
}

const TABS: TabDef[] = [
  { id: "overview", label: "Overview", icon: <Activity size={14} /> },
  { id: "styles", label: "Styles DB", icon: <Database size={14} /> },
  {
    id: "compensations",
    label: "Compensazioni",
    icon: <Thermometer size={14} />,
  },
  { id: "q10", label: "Q10 Model", icon: <FlaskConical size={14} /> },
  { id: "scores", label: "Score Sim", icon: <BarChart3 size={14} /> },
  { id: "audit", label: "Audit Log", icon: <ClipboardCheck size={14} /> },
];

/* ═══ HELPERS ═══ */
const mono: React.CSSProperties = {
  fontFamily: "'DM Mono', monospace",
  fontSize: "0.75rem",
  letterSpacing: "0.04em",
};

const labelStyle: React.CSSProperties = {
  fontFamily: "'DM Mono', monospace",
  fontSize: "0.625rem",
  fontWeight: 500,
  letterSpacing: "0.12em",
  textTransform: "uppercase",
  color: "var(--muted-foreground)",
};

const cardStyle: React.CSSProperties = {
  background: "var(--surface-container-low)",
  border: "1px solid var(--outline-variant)",
  borderRadius: "1rem",
};

const badgeStyle = (
  color: string,
): React.CSSProperties => ({
  ...mono,
  fontSize: "0.625rem",
  fontWeight: 600,
  padding: "2px 8px",
  borderRadius: "6px",
  background: `color-mix(in srgb, ${color} 15%, transparent)`,
  color,
  display: "inline-flex",
  alignItems: "center",
  gap: "4px",
});

function formatSec(sec: number): string {
  if (sec < 120) return `${sec}s`;
  return `${Math.round(sec / 60)}min`;
}

/* ═══ OVERVIEW TAB ═══ */
function OverviewTab() {
  const styles = Object.values(STYLES_DB);
  const families = [...new Set(styles.map((s) => s.family))];

  return (
    <div className="flex flex-col gap-6">
      {/* Engine summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          {
            label: "Stili",
            value: styles.length,
            icon: <Database size={14} />,
            color: "var(--primary)",
          },
          {
            label: "Famiglie",
            value: families.length,
            icon: <Wheat size={14} />,
            color: "var(--tertiary)",
          },
          {
            label: "Score Assi",
            value: "5",
            icon: <BarChart3 size={14} />,
            color: "var(--cta)",
          },
          {
            label: "Compensazioni",
            value: "5",
            icon: <Zap size={14} />,
            color: "var(--warm-sienna)",
          },
        ].map((stat) => (
          <div key={stat.label} style={cardStyle} className="p-4">
            <div
              className="flex items-center gap-2 mb-2"
              style={{ color: stat.color }}
            >
              {stat.icon}
              <span style={labelStyle}>{stat.label}</span>
            </div>
            <span
              style={{
                ...mono,
                fontSize: "1.75rem",
                fontWeight: 700,
                color: "var(--foreground)",
                fontFeatureSettings: "'tnum'",
              }}
            >
              {stat.value}
            </span>
          </div>
        ))}
      </div>

      {/* Engine modules */}
      <div style={cardStyle} className="p-5">
        <h3
          style={{
            ...labelStyle,
            marginBottom: "1rem",
            color: "var(--foreground)",
            fontSize: "0.6875rem",
          }}
        >
          Moduli Engine
        </h3>
        <div className="flex flex-col gap-2">
          {[
            {
              name: "STYLES_DB",
              status: "ok",
              detail: "9 stili, P/L range, fat_type",
            },
            {
              name: "getQ10()",
              status: "ok",
              detail: "4 modelli: standard/cold/sourdough × T",
            },
            {
              name: "calculateOvenCompensations()",
              status: "ok",
              detail:
                "5 assi: H log, olio, zucchero, tempo Arrhenius, spessore",
            },
            {
              name: "estimatePL()",
              status: "ok",
              detail: "Regressione W→P/L con clamp",
            },
            {
              name: "calculateAuthenticityScore()",
              status: "ok",
              detail: "4 assi con P/L (30%+25%+35%+10%)",
            },
            {
              name: "calculateFeasibilityScore()",
              status: "ok",
              detail: "W×H interaction + method bonus",
            },
            {
              name: "calculateDigestibilityScore()",
              status: "ok",
              detail: "Q10 variabile, FODMAP tracking",
            },
            {
              name: "calculateSustainabilityScore()",
              status: "ok",
              detail: "5 sotto-assi (30+25+20+15+10)",
            },
            {
              name: "calculateExperimentationScore()",
              status: "ok",
              detail: "Deviazione canonica + bonus",
            },
            {
              name: "generateRecipe()",
              status: "ok",
              detail: "fat_g, fat_label, flour_pl, compensations",
            },
            {
              name: "recommendStyles()",
              status: "ok",
              detail: "5 pesi: T25+O25+S20+E10+P20",
            },
          ].map((mod) => (
            <div
              key={mod.name}
              className="flex items-center justify-between py-1.5 px-3 rounded-lg"
              style={{
                background: "var(--surface-container)",
              }}
            >
              <div className="flex items-center gap-2.5">
                <CheckCircle2
                  size={12}
                  style={{ color: "var(--cta)" }}
                />
                <span style={{ ...mono, color: "var(--foreground)" }}>
                  {mod.name}
                </span>
              </div>
              <span
                style={{
                  ...mono,
                  fontSize: "0.625rem",
                  color: "var(--muted-foreground)",
                }}
              >
                {mod.detail}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Composite formula */}
      <div style={cardStyle} className="p-5">
        <h3
          style={{
            ...labelStyle,
            marginBottom: "0.75rem",
            color: "var(--foreground)",
            fontSize: "0.6875rem",
          }}
        >
          Formula Composite
        </h3>
        <div
          className="p-4 rounded-xl"
          style={{
            background: "var(--surface-container)",
            ...mono,
            fontSize: "0.8125rem",
            lineHeight: 1.8,
          }}
        >
          <span style={{ color: "var(--primary)" }}>composite</span> ={" "}
          <span style={{ color: "var(--warm-sienna)" }}>A</span>×0.30 +{" "}
          <span style={{ color: "var(--cta)" }}>F</span>×0.25 +{" "}
          <span style={{ color: "var(--tertiary)" }}>D</span>×0.20 +{" "}
          <span style={{ color: "var(--warm-sage)" }}>S</span>×0.15 +{" "}
          <span style={{ color: "var(--secondary)" }}>E</span>×0.10
        </div>
      </div>
    </div>
  );
}

/* ═══ STYLES DB TAB ═══ */
function StylesTab() {
  const styles = Object.values(STYLES_DB);
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-3">
      {styles.map((style) => {
        const isOpen = expanded === style.id;
        return (
          <div key={style.id} style={cardStyle} className="overflow-hidden">
            <button
              onClick={() =>
                setExpanded(isOpen ? null : style.id)
              }
              className="w-full flex items-center justify-between p-4 text-left"
            >
              <div className="flex items-center gap-3">
                <span style={{ fontSize: "1.25rem" }}>
                  {style.emoji}
                </span>
                <div>
                  <div
                    style={{
                      ...mono,
                      color: "var(--foreground)",
                      fontSize: "0.8125rem",
                      fontWeight: 600,
                    }}
                  >
                    {style.name}
                  </div>
                  <div
                    style={{
                      ...mono,
                      fontSize: "0.625rem",
                      color: "var(--muted-foreground)",
                    }}
                  >
                    {style.family} · {style.origin}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span
                  style={badgeStyle(
                    style.suitable_for_beginner
                      ? "var(--cta)"
                      : "var(--warm-sienna)",
                  )}
                >
                  {style.suitable_for_beginner
                    ? "Beginner OK"
                    : "Avanzato"}
                </span>
                <motion.div
                  animate={{ rotate: isOpen ? 180 : 0 }}
                  transition={{
                    type: "spring",
                    stiffness: 500,
                    damping: 30,
                  }}
                >
                  <ChevronDown
                    size={14}
                    style={{ color: "var(--muted-foreground)" }}
                  />
                </motion.div>
              </div>
            </button>
            <AnimatePresence>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden"
                >
                  <div
                    className="px-4 pb-4"
                    style={{
                      borderTop:
                        "1px solid var(--outline-variant)",
                    }}
                  >
                    <div className="pt-3 grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {/* Dough params */}
                      <DataCell
                        label="Idratazione"
                        value={`${style.dough.hydration_pct_range[0]}-${style.dough.hydration_pct_range[1]}%`}
                      />
                      <DataCell
                        label="W Range"
                        value={`${style.dough.flour_w_range[0]}-${style.dough.flour_w_range[1]}`}
                      />
                      <DataCell
                        label="P/L Range"
                        value={`${style.dough.flour_pl_range[0]}-${style.dough.flour_pl_range[1]}`}
                      />
                      <DataCell
                        label="Sale"
                        value={`${style.dough.salt_pct}%`}
                      />
                      <DataCell
                        label={
                          style.dough.fat_type === "none"
                            ? "Grasso"
                            : `Grasso (${style.dough.fat_type})`
                        }
                        value={`${style.dough.oil_pct}%`}
                        highlight={style.dough.fat_type === "butter"}
                      />
                      <DataCell
                        label="Zucchero"
                        value={`${style.dough.sugar_pct}%`}
                      />
                      <DataCell
                        label="Fermentazione"
                        value={`${style.dough.fermentation_hours_range[0]}-${style.dough.fermentation_hours_range[1]}h`}
                      />
                      <DataCell
                        label="Metodo"
                        value={style.dough.process_type}
                      />
                      <DataCell
                        label="Forma"
                        value={`${style.shape.shape_type} · ${style.shape.dough_weight_g}g`}
                      />
                      {/* Baking */}
                      <DataCell
                        label="T Ideale"
                        value={`${style.baking.temp_c_ideal}°C`}
                      />
                      <DataCell
                        label="T Range"
                        value={`${style.baking.temp_c_range[0]}-${style.baking.temp_c_range[1]}°C`}
                      />
                      <DataCell
                        label="Cottura"
                        value={formatSec(
                          style.baking.cook_time_sec_ideal,
                        )}
                      />
                    </div>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {style.key_characteristics.map((k) => (
                        <span
                          key={k}
                          style={badgeStyle(
                            "var(--muted-foreground)",
                          )}
                        >
                          {k}
                        </span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}

function DataCell({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div
      className="p-2.5 rounded-lg"
      style={{
        background: highlight
          ? "color-mix(in srgb, var(--warm-sienna) 10%, transparent)"
          : "var(--surface-container)",
      }}
    >
      <div style={{ ...labelStyle, marginBottom: "4px" }}>
        {label}
      </div>
      <div
        style={{
          ...mono,
          color: highlight
            ? "var(--warm-sienna)"
            : "var(--foreground)",
          fontWeight: 600,
          fontFeatureSettings: "'tnum'",
        }}
      >
        {value}
      </div>
    </div>
  );
}

/* ═══ COMPENSATIONS TAB ═══ */
function CompensationsTab() {
  const styles = Object.values(STYLES_DB);
  const [selectedStyleId, setSelectedStyleId] = useState(
    "napoletana_stg",
  );
  const [ovenTemp, setOvenTemp] = useState(250);

  const style = styles.find((s) => s.id === selectedStyleId)!;
  const result = useMemo(
    () => calculateOvenCompensations(style, ovenTemp),
    [style, ovenTemp],
  );

  const deficit = Math.max(
    0,
    style.baking.temp_c_ideal - ovenTemp,
  );

  return (
    <div className="flex flex-col gap-5">
      {/* Controls */}
      <div style={cardStyle} className="p-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label style={labelStyle}>Stile</label>
            <select
              value={selectedStyleId}
              onChange={(e) =>
                setSelectedStyleId(e.target.value)
              }
              className="mt-1.5 w-full p-2.5 rounded-xl"
              style={{
                ...mono,
                background: "var(--surface-container)",
                border: "1px solid var(--outline-variant)",
                color: "var(--foreground)",
                fontSize: "0.8125rem",
              }}
            >
              {styles.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.emoji} {s.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label style={labelStyle}>
              Temperatura Forno: {ovenTemp}°C
            </label>
            <input
              type="range"
              min={150}
              max={500}
              step={10}
              value={ovenTemp}
              onChange={(e) =>
                setOvenTemp(Number(e.target.value))
              }
              className="mt-3 w-full accent-[var(--primary)]"
            />
            <div
              className="flex justify-between mt-1"
              style={{
                ...mono,
                fontSize: "0.5625rem",
                color: "var(--muted-foreground)",
              }}
            >
              <span>150°C</span>
              <span>
                Ideale: {style.baking.temp_c_ideal}°C
              </span>
              <span>500°C</span>
            </div>
          </div>
        </div>
      </div>

      {/* Deficit */}
      <div
        className="flex items-center gap-3 px-5 py-3 rounded-xl"
        style={{
          background:
            deficit > 100
              ? "color-mix(in srgb, var(--destructive) 10%, transparent)"
              : deficit > 20
                ? "color-mix(in srgb, var(--warm-sienna) 10%, transparent)"
                : "color-mix(in srgb, var(--cta) 10%, transparent)",
          border: `1px solid ${deficit > 100 ? "var(--destructive)" : deficit > 20 ? "var(--warm-sienna)" : "var(--cta)"}`,
          borderColor:
            deficit > 100
              ? "color-mix(in srgb, var(--destructive) 30%, transparent)"
              : deficit > 20
                ? "color-mix(in srgb, var(--warm-sienna) 30%, transparent)"
                : "color-mix(in srgb, var(--cta) 30%, transparent)",
        }}
      >
        <Thermometer
          size={16}
          style={{
            color:
              deficit > 100
                ? "var(--destructive)"
                : deficit > 20
                  ? "var(--warm-sienna)"
                  : "var(--cta)",
          }}
        />
        <span
          style={{
            ...mono,
            color: "var(--foreground)",
            fontWeight: 600,
          }}
        >
          Deficit: {deficit}°C
        </span>
        <span
          style={{
            ...mono,
            fontSize: "0.625rem",
            color: "var(--muted-foreground)",
          }}
        >
          ({ovenTemp}°C vs ideale {style.baking.temp_c_ideal}
          °C)
        </span>
      </div>

      {/* Results */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <CompCard
          label="Idratazione"
          icon={<Beaker size={14} />}
          value={
            result.hydration_delta_pct > 0
              ? `+${result.hydration_delta_pct}%`
              : "Nessuna"
          }
          active={result.hydration_delta_pct > 0}
          detail="Modello logaritmico: 5·ln(1+deficit/50)"
        />
        <CompCard
          label="Grasso"
          icon={<Flame size={14} />}
          value={
            result.oil_delta_pct > 0
              ? `+${result.oil_delta_pct}%`
              : "Nessuna"
          }
          active={result.oil_delta_pct > 0}
          detail="Lineare +2% base, trigger: deficit > 150°C"
        />
        <CompCard
          label="Zucchero"
          icon={<Sparkles size={14} />}
          value={
            result.sugar_delta_pct > 0
              ? `+${result.sugar_delta_pct}%`
              : "Nessuna"
          }
          active={result.sugar_delta_pct > 0}
          detail="Maillard boost, trigger: deficit > 100°C + T < 300°C"
        />
        <CompCard
          label="Tempo Cottura"
          icon={<Timer size={14} />}
          value={formatSec(result.cook_time_sec)}
          active={deficit > 20}
          detail={`Arrhenius-like: t×e^(0.0065×${deficit})`}
        />
        <CompCard
          label="Spessore"
          icon={<Activity size={14} />}
          value={
            result.thickness_factor < 1
              ? `${Math.round((1 - result.thickness_factor) * 100)}% più sottile`
              : "Invariato"
          }
          active={result.thickness_factor < 1}
          detail="-10% a >100°C, -20% a >200°C"
        />
      </div>

      {/* Compensation log */}
      {result.compensations.length > 0 && (
        <div style={cardStyle} className="p-5">
          <h3
            style={{
              ...labelStyle,
              marginBottom: "0.75rem",
              color: "var(--foreground)",
              fontSize: "0.6875rem",
            }}
          >
            Log compensazioni ({result.compensations.length})
          </h3>
          <div className="flex flex-col gap-2">
            {result.compensations.map((c, i) => (
              <div
                key={i}
                className="p-3 rounded-lg"
                style={{
                  background: "var(--surface-container)",
                }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span
                    style={badgeStyle("var(--warm-sienna)")}
                  >
                    {c.type}
                  </span>
                  <span
                    style={{
                      ...mono,
                      fontSize: "0.625rem",
                      color: "var(--muted-foreground)",
                      fontFeatureSettings: "'tnum'",
                    }}
                  >
                    {c.original} → {c.compensated}
                  </span>
                </div>
                <p
                  style={{
                    ...mono,
                    fontSize: "0.6875rem",
                    color: "var(--foreground)",
                    lineHeight: 1.5,
                  }}
                >
                  {c.reason}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function CompCard({
  label,
  icon,
  value,
  active,
  detail,
}: {
  label: string;
  icon: React.ReactNode;
  value: string;
  active: boolean;
  detail: string;
}) {
  return (
    <div
      style={{
        ...cardStyle,
        opacity: active ? 1 : 0.5,
      }}
      className="p-4"
    >
      <div
        className="flex items-center gap-2 mb-2"
        style={{
          color: active
            ? "var(--primary)"
            : "var(--muted-foreground)",
        }}
      >
        {icon}
        <span style={labelStyle}>{label}</span>
      </div>
      <div
        style={{
          ...mono,
          fontSize: "1.125rem",
          fontWeight: 700,
          color: active
            ? "var(--foreground)"
            : "var(--muted-foreground)",
          fontFeatureSettings: "'tnum'",
        }}
      >
        {value}
      </div>
      <p
        className="mt-2"
        style={{
          ...mono,
          fontSize: "0.5625rem",
          color: "var(--muted-foreground)",
          lineHeight: 1.5,
        }}
      >
        {detail}
      </p>
    </div>
  );
}

/* ═══ Q10 TAB ═══ */
function Q10Tab() {
  const testPoints = useMemo(() => {
    const points: {
      yeast: "fresh" | "dry" | "sourdough";
      temp: number;
      q10: number;
      model: string;
      speedVs18: number;
    }[] = [];
    const yeastTypes: ("fresh" | "dry" | "sourdough")[] = [
      "fresh",
      "dry",
      "sourdough",
    ];
    const temps = [2, 4, 6, 8, 10, 12, 15, 18, 22, 25, 28, 30];

    for (const yeast of yeastTypes) {
      for (const temp of temps) {
        const { q10, model } = getQ10(yeast, temp);
        const speedVs18 =
          Math.round(
            Math.pow(q10, (temp - 18) / 10) * 100,
          ) / 100;
        points.push({ yeast, temp, q10, model, speedVs18 });
      }
    }
    return points;
  }, []);

  const [selectedYeast, setSelectedYeast] = useState<
    "fresh" | "dry" | "sourdough" | "all"
  >("all");

  const filtered =
    selectedYeast === "all"
      ? testPoints
      : testPoints.filter((p) => p.yeast === selectedYeast);

  return (
    <div className="flex flex-col gap-5">
      {/* Model summary */}
      <div style={cardStyle} className="p-5">
        <h3
          style={{
            ...labelStyle,
            marginBottom: "0.75rem",
            color: "var(--foreground)",
            fontSize: "0.6875rem",
          }}
        >
          Modello Q10 Variabile
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            {
              condition: "Commerciale T≥10°C",
              q10: "2.0",
              model: "standard",
              color: "var(--cta)",
            },
            {
              condition: "Commerciale T<10°C",
              q10: "1.6",
              model: "cold_adapted",
              color: "var(--time-tonight)",
            },
            {
              condition: "Madre T>15°C",
              q10: "2.2",
              model: "sourdough",
              color: "var(--warm-sienna)",
            },
            {
              condition: "Madre T≤15°C",
              q10: "1.9",
              model: "sourdough",
              color: "var(--tertiary)",
            },
          ].map((m) => (
            <div
              key={m.condition}
              className="p-3 rounded-xl"
              style={{ background: "var(--surface-container)" }}
            >
              <span
                style={{
                  ...mono,
                  fontSize: "0.5625rem",
                  color: "var(--muted-foreground)",
                }}
              >
                {m.condition}
              </span>
              <div
                style={{
                  ...mono,
                  fontSize: "1.5rem",
                  fontWeight: 700,
                  color: m.color,
                  fontFeatureSettings: "'tnum'",
                }}
              >
                {m.q10}
              </div>
              <span style={badgeStyle(m.color)}>
                {m.model}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        {(
          [
            { id: "all", label: "Tutti" },
            { id: "fresh", label: "Fresco" },
            { id: "dry", label: "Secco" },
            { id: "sourdough", label: "Madre" },
          ] as const
        ).map((opt) => (
          <button
            key={opt.id}
            onClick={() => setSelectedYeast(opt.id)}
            className="px-3 py-1.5 rounded-lg"
            style={{
              ...mono,
              fontSize: "0.6875rem",
              fontWeight: 600,
              background:
                selectedYeast === opt.id
                  ? "var(--primary)"
                  : "var(--surface-container)",
              color:
                selectedYeast === opt.id
                  ? "var(--primary-foreground)"
                  : "var(--muted-foreground)",
              border: "1px solid var(--outline-variant)",
            }}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div
        style={cardStyle}
        className="overflow-x-auto"
      >
        <table
          className="w-full"
          style={{ ...mono, fontSize: "0.75rem" }}
        >
          <thead>
            <tr
              style={{
                borderBottom:
                  "1px solid var(--outline-variant)",
              }}
            >
              {["Lievito", "T (°C)", "Q10", "Modello", "Velocità vs 18°C"].map(
                (h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left"
                    style={{
                      ...labelStyle,
                      fontWeight: 600,
                    }}
                  >
                    {h}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {filtered.map((p, i) => (
              <tr
                key={`${p.yeast}-${p.temp}`}
                style={{
                  borderBottom:
                    i < filtered.length - 1
                      ? "1px solid var(--outline-variant)"
                      : "none",
                  background:
                    p.temp === 18
                      ? "color-mix(in srgb, var(--cta) 8%, transparent)"
                      : "transparent",
                }}
              >
                <td
                  className="px-4 py-2.5"
                  style={{ color: "var(--foreground)" }}
                >
                  {p.yeast}
                </td>
                <td
                  className="px-4 py-2.5"
                  style={{
                    color: "var(--foreground)",
                    fontFeatureSettings: "'tnum'",
                  }}
                >
                  {p.temp}°C
                </td>
                <td
                  className="px-4 py-2.5"
                  style={{
                    color: "var(--primary)",
                    fontWeight: 600,
                    fontFeatureSettings: "'tnum'",
                  }}
                >
                  {p.q10}
                </td>
                <td className="px-4 py-2.5">
                  <span
                    style={badgeStyle(
                      p.model === "standard"
                        ? "var(--cta)"
                        : p.model === "cold_adapted"
                          ? "var(--time-tonight)"
                          : "var(--warm-sienna)",
                    )}
                  >
                    {p.model}
                  </span>
                </td>
                <td
                  className="px-4 py-2.5"
                  style={{
                    fontFeatureSettings: "'tnum'",
                    color:
                      p.speedVs18 > 1
                        ? "var(--warm-sienna)"
                        : p.speedVs18 < 1
                          ? "var(--time-tonight)"
                          : "var(--foreground)",
                  }}
                >
                  {p.speedVs18}×
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Reference */}
      <div
        className="flex items-start gap-2 p-3 rounded-xl"
        style={{
          background: "var(--surface-container)",
          border: "1px solid var(--outline-variant)",
        }}
      >
        <Info
          size={14}
          style={{
            color: "var(--muted-foreground)",
            marginTop: "2px",
            flexShrink: 0,
          }}
        />
        <p
          style={{
            ...mono,
            fontSize: "0.625rem",
            color: "var(--muted-foreground)",
            lineHeight: 1.6,
          }}
        >
          Riferimento: PMC7146123. S. cerevisiae Q10=2.1±0.3
          (15-30°C), scende a 1.6 sotto 10°C. LAB (batteri
          lattici nel lievito madre) Q10 1.9-2.4.
        </p>
      </div>
    </div>
  );
}

/* ═══ SCORES TAB ═══ */
function ScoresTab() {
  const styles = Object.values(STYLES_DB);
  const [styleId, setStyleId] = useState("napoletana_stg");
  const [ovenType, setOvenType] = useState<OvenType>("home");
  const [ovenTemp, setOvenTemp] = useState(250);
  const [skillLevel, setSkillLevel] = useState(2);

  const style = styles.find((s) => s.id === styleId)!;

  const constraints: UserConstraints = useMemo(
    () => ({
      oven_type: ovenType,
      oven_max_temp_c: ovenTemp,
      skill_level: skillLevel as 1 | 2 | 3 | 4,
      available_hours: 24,
      dough_balls: 4,
      has_mixer: false,
      has_pizza_stone: false,
      has_pizza_steel: false,
      dietary_filters: [],
      pantry_flours: [],
      pantry_yeasts: [],
    }),
    [ovenType, ovenTemp, skillLevel],
  );

  const recipe = useMemo(
    () => generateRecipe(style, constraints),
    [style, constraints],
  );

  const scoreAxes = [
    {
      key: "authenticity",
      label: "Autenticità",
      value: recipe.scores.authenticity,
      weight: "0.30",
      cat: recipe.scores.authenticity_category,
      color: "var(--warm-sienna)",
      icon: <Shield size={14} />,
    },
    {
      key: "feasibility",
      label: "Fattibilità",
      value: recipe.scores.feasibility,
      weight: "0.25",
      cat: recipe.scores.feasibility_category,
      color: "var(--cta)",
      icon: <CheckCircle2 size={14} />,
    },
    {
      key: "digestibility",
      label: "Digeribilità",
      value: recipe.scores.digestibility,
      weight: "0.20",
      cat: recipe.scores.digestibility_category,
      color: "var(--tertiary)",
      icon: <Leaf size={14} />,
    },
    {
      key: "sustainability",
      label: "Sostenibilità",
      value: recipe.scores.sustainability,
      weight: "0.15",
      cat: recipe.scores.sustainability_category,
      color: "var(--warm-sage)",
      icon: <Leaf size={14} />,
    },
    {
      key: "experimentation",
      label: "Sperimentazione",
      value: recipe.scores.experimentation,
      weight: "0.10",
      cat: recipe.scores.experimentation_category,
      color: "var(--secondary)",
      icon: <FlaskConical size={14} />,
    },
  ];

  return (
    <div className="flex flex-col gap-5">
      {/* Controls */}
      <div style={cardStyle} className="p-5">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label style={labelStyle}>Stile</label>
            <select
              value={styleId}
              onChange={(e) => setStyleId(e.target.value)}
              className="mt-1.5 w-full p-2.5 rounded-xl"
              style={{
                ...mono,
                background: "var(--surface-container)",
                border: "1px solid var(--outline-variant)",
                color: "var(--foreground)",
                fontSize: "0.8125rem",
              }}
            >
              {styles.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.emoji} {s.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label style={labelStyle}>
              Forno: {ovenTemp}°C
            </label>
            <input
              type="range"
              min={150}
              max={500}
              step={10}
              value={ovenTemp}
              onChange={(e) =>
                setOvenTemp(Number(e.target.value))
              }
              className="mt-3 w-full accent-[var(--primary)]"
            />
          </div>
          <div>
            <label style={labelStyle}>
              Skill: {skillLevel}
            </label>
            <input
              type="range"
              min={1}
              max={4}
              step={1}
              value={skillLevel}
              onChange={(e) =>
                setSkillLevel(Number(e.target.value))
              }
              className="mt-3 w-full accent-[var(--primary)]"
            />
          </div>
        </div>
      </div>

      {/* Composite */}
      <div
        className="flex items-center justify-between p-5 rounded-2xl"
        style={{
          background: "var(--grad-ember)",
          color: "white",
        }}
      >
        <div>
          <span
            style={{
              ...labelStyle,
              color: "rgba(255,255,255,0.7)",
            }}
          >
            Composite Score
          </span>
          <div
            style={{
              ...mono,
              fontSize: "2.5rem",
              fontWeight: 700,
              fontFeatureSettings: "'tnum'",
              lineHeight: 1,
            }}
          >
            {recipe.scores.composite}
          </div>
        </div>
        <div
          className="flex flex-col items-end gap-1"
          style={{
            ...mono,
            fontSize: "0.625rem",
            color: "rgba(255,255,255,0.6)",
          }}
        >
          <span>P/L stimato: {recipe.flour_pl}</span>
          <span>
            Idratazione: {recipe.hydration_pct}%
          </span>
          <span>W: {recipe.flour_w}</span>
        </div>
      </div>

      {/* Score axes */}
      <div className="grid grid-cols-1 gap-3">
        {scoreAxes.map((axis) => (
          <div
            key={axis.key}
            style={cardStyle}
            className="p-4 flex items-center gap-4"
          >
            <div
              className="flex items-center justify-center w-10 h-10 rounded-xl"
              style={{
                background: `color-mix(in srgb, ${axis.color} 12%, transparent)`,
                color: axis.color,
                flexShrink: 0,
              }}
            >
              {axis.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1.5">
                <span
                  style={{
                    ...mono,
                    color: "var(--foreground)",
                    fontWeight: 600,
                    fontSize: "0.8125rem",
                  }}
                >
                  {axis.label}
                </span>
                <div className="flex items-center gap-2">
                  <span
                    style={badgeStyle(axis.color)}
                  >
                    {axis.cat}
                  </span>
                  <span
                    style={{
                      ...mono,
                      fontSize: "0.625rem",
                      color: "var(--muted-foreground)",
                    }}
                  >
                    ×{axis.weight}
                  </span>
                </div>
              </div>
              <div
                className="w-full h-2 rounded-full overflow-hidden"
                style={{
                  background: "var(--surface-container)",
                }}
              >
                <motion.div
                  className="h-full rounded-full"
                  initial={{ width: 0 }}
                  animate={{
                    width: `${axis.value}%`,
                  }}
                  transition={{
                    duration: 0.6,
                    ease: "easeOut",
                  }}
                  style={{
                    background: axis.color,
                  }}
                />
              </div>
              <div
                className="flex justify-between mt-1"
                style={{
                  ...mono,
                  fontSize: "0.5625rem",
                  color: "var(--muted-foreground)",
                  fontFeatureSettings: "'tnum'",
                }}
              >
                <span>0</span>
                <span
                  style={{
                    fontWeight: 700,
                    color: axis.color,
                  }}
                >
                  {axis.value}
                </span>
                <span>100</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Scientific layer */}
      <div style={cardStyle} className="p-5">
        <h3
          style={{
            ...labelStyle,
            marginBottom: "0.75rem",
            color: "var(--foreground)",
            fontSize: "0.6875rem",
          }}
        >
          Scientific Layer
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <DataCell
            label="Lievito (%)"
            value={`${recipe.science.yeast_baker_pct}%`}
          />
          <DataCell
            label="Ore eq. 18°C"
            value={`${recipe.science.effective_hours_18c}h`}
          />
          <DataCell
            label="Q10"
            value={`${recipe.science.q10_factor} (${recipe.science.q10_model})`}
          />
          <DataCell
            label="Glutine"
            value={`${recipe.science.gluten_network}/100`}
          />
          <DataCell
            label="Proteolisi"
            value={`${recipe.science.proteolysis_index}/100`}
          />
          <DataCell
            label="aw"
            value={`${recipe.science.water_activity}`}
          />
          <DataCell
            label="Amido deg."
            value={`${recipe.science.starch_degradation_pct}%`}
          />
          <DataCell
            label="P/L stimato"
            value={`${recipe.science.flour_pl_estimated}`}
          />
          <DataCell
            label="Energia cottura"
            value={`${recipe.science.baking_energy_kj} kJ`}
          />
        </div>
      </div>
    </div>
  );
}

/* ═══ AUDIT TAB ═══ */
function AuditTab() {
  const issues = [
    {
      id: 1,
      severity: "media",
      desc: "DoughBlob non rispetta prefers-reduced-motion",
      status: "open",
    },
    {
      id: 2,
      severity: "bassa",
      desc: "Dark mode non persiste (nessun localStorage)",
      status: "open",
    },
    {
      id: 3,
      severity: "bassa",
      desc: "useLocationWeather() hardcoded su Roma",
      status: "open",
    },
    {
      id: 4,
      severity: "bassa",
      desc: "Chicago Deep Dish: oil_pct=0.0",
      status: "resolved",
    },
    {
      id: 5,
      severity: "info",
      desc: "1024WDefault.tsx non referenziato",
      status: "open",
    },
    {
      id: 6,
      severity: "info",
      desc: "scroll-companion.tsx ha 7 sezioni vs 3 data-section",
      status: "open",
    },
    {
      id: 7,
      severity: "info",
      desc: "score-ring.tsx duplicato inline",
      status: "open",
    },
    {
      id: 8,
      severity: "bassa",
      desc: "Immagini Unsplash senza lazy loading",
      status: "open",
    },
    {
      id: 9,
      severity: "bassa",
      desc: "Focus management assente nelle transizioni",
      status: "open",
    },
    {
      id: 10,
      severity: "bassa",
      desc: "Nessun skip-to-content link",
      status: "open",
    },
    {
      id: 11,
      severity: "media",
      desc: "Q10 fisso a 2.0",
      status: "resolved",
    },
    {
      id: 12,
      severity: "media",
      desc: "P/L ratio assente",
      status: "resolved",
    },
    {
      id: 13,
      severity: "media",
      desc: "Compensazione cottura solo lineare",
      status: "resolved",
    },
    {
      id: 14,
      severity: "media",
      desc: "STG W range 220-280 non allineato AVPN 2024",
      status: "resolved",
    },
    {
      id: 15,
      severity: "bassa",
      desc: "Feasibility non considera W/metodo interazione",
      status: "resolved",
    },
  ];

  const notionSync = [
    {
      page: "Pag 02 — Database Parametrico",
      status: "aligned",
    },
    {
      page: "Pag 03 — Modellazione Fermentazione",
      status: "needs_update",
      detail: "Q10 variabile non documentato",
    },
    {
      page: "Pag 04 — Gestione Forno",
      status: "needs_update",
      detail: "Compensazioni tempo/spessore + fix zucchero",
    },
    {
      page: "Pag 08 — Scoring Multi-Asse",
      status: "needs_update",
      detail: "S-Score + composite 5 assi",
    },
  ];

  const openCount = issues.filter(
    (i) => i.status === "open",
  ).length;
  const resolvedCount = issues.filter(
    (i) => i.status === "resolved",
  ).length;

  return (
    <div className="flex flex-col gap-5">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        <div style={cardStyle} className="p-4 text-center">
          <div
            style={{
              ...mono,
              fontSize: "1.5rem",
              fontWeight: 700,
              color: "var(--warm-sienna)",
              fontFeatureSettings: "'tnum'",
            }}
          >
            {openCount}
          </div>
          <span style={labelStyle}>Aperti</span>
        </div>
        <div style={cardStyle} className="p-4 text-center">
          <div
            style={{
              ...mono,
              fontSize: "1.5rem",
              fontWeight: 700,
              color: "var(--cta)",
              fontFeatureSettings: "'tnum'",
            }}
          >
            {resolvedCount}
          </div>
          <span style={labelStyle}>Risolti</span>
        </div>
        <div style={cardStyle} className="p-4 text-center">
          <div
            style={{
              ...mono,
              fontSize: "1.5rem",
              fontWeight: 700,
              color: "var(--primary)",
              fontFeatureSettings: "'tnum'",
            }}
          >
            {issues.length}
          </div>
          <span style={labelStyle}>Totale</span>
        </div>
      </div>

      {/* Notion sync status */}
      <div style={cardStyle} className="p-5">
        <h3
          style={{
            ...labelStyle,
            marginBottom: "0.75rem",
            color: "var(--foreground)",
            fontSize: "0.6875rem",
          }}
        >
          Notion ↔ Codice Sync Status
        </h3>
        <div className="flex flex-col gap-2">
          {notionSync.map((ns) => (
            <div
              key={ns.page}
              className="flex items-center justify-between p-3 rounded-lg"
              style={{
                background: "var(--surface-container)",
              }}
            >
              <div className="flex items-center gap-2.5">
                {ns.status === "aligned" ? (
                  <CheckCircle2
                    size={14}
                    style={{ color: "var(--cta)" }}
                  />
                ) : (
                  <AlertTriangle
                    size={14}
                    style={{
                      color: "var(--warm-sienna)",
                    }}
                  />
                )}
                <span
                  style={{
                    ...mono,
                    color: "var(--foreground)",
                    fontSize: "0.75rem",
                  }}
                >
                  {ns.page}
                </span>
              </div>
              {ns.detail && (
                <span
                  style={{
                    ...mono,
                    fontSize: "0.5625rem",
                    color: "var(--muted-foreground)",
                    textAlign: "right",
                    maxWidth: "200px",
                  }}
                >
                  {ns.detail}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Issues table */}
      <div style={cardStyle} className="p-5">
        <h3
          style={{
            ...labelStyle,
            marginBottom: "0.75rem",
            color: "var(--foreground)",
            fontSize: "0.6875rem",
          }}
        >
          Issue Tracker
        </h3>
        <div className="flex flex-col gap-1.5">
          {issues.map((issue) => (
            <div
              key={issue.id}
              className="flex items-center gap-3 py-2 px-3 rounded-lg"
              style={{
                background:
                  issue.status === "resolved"
                    ? "transparent"
                    : "var(--surface-container)",
                opacity:
                  issue.status === "resolved" ? 0.5 : 1,
              }}
            >
              <span
                style={{
                  ...mono,
                  fontSize: "0.625rem",
                  color: "var(--muted-foreground)",
                  fontFeatureSettings: "'tnum'",
                  width: "24px",
                  flexShrink: 0,
                }}
              >
                #{issue.id}
              </span>
              <span
                style={badgeStyle(
                  issue.severity === "media"
                    ? "var(--warm-sienna)"
                    : issue.severity === "bassa"
                      ? "var(--tertiary)"
                      : "var(--muted-foreground)",
                )}
              >
                {issue.severity}
              </span>
              <span
                style={{
                  ...mono,
                  fontSize: "0.6875rem",
                  color: "var(--foreground)",
                  flex: 1,
                  textDecoration:
                    issue.status === "resolved"
                      ? "line-through"
                      : "none",
                }}
              >
                {issue.desc}
              </span>
              {issue.status === "resolved" ? (
                <CheckCircle2
                  size={12}
                  style={{ color: "var(--cta)" }}
                />
              ) : (
                <Bug
                  size={12}
                  style={{
                    color: "var(--muted-foreground)",
                  }}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* GitHub commit info */}
      <div
        className="flex items-start gap-2 p-3 rounded-xl"
        style={{
          background: "var(--surface-container)",
          border: "1px solid var(--outline-variant)",
        }}
      >
        <Info
          size={14}
          style={{
            color: "var(--muted-foreground)",
            marginTop: "2px",
            flexShrink: 0,
          }}
        />
        <p
          style={{
            ...mono,
            fontSize: "0.625rem",
            color: "var(--muted-foreground)",
            lineHeight: 1.6,
          }}
        >
          Audit completo in{" "}
          <span style={{ color: "var(--primary)" }}>
            docs/audit-verifica-implementativa-v1.md
          </span>{" "}
          su GitHub (zatteogit/vulcan-pizza-lab). Ultimo
          commit: 14 febbraio 2026.
        </p>
      </div>
    </div>
  );
}

/* ═══ MAIN DEV TOOLS COMPONENT ═══ */
export function DevTools({
  onClose,
  darkMode,
}: {
  onClose: () => void;
  darkMode: boolean;
}) {
  const [activeTab, setActiveTab] = useState<TabId>("overview");

  const renderTab = () => {
    switch (activeTab) {
      case "overview":
        return <OverviewTab />;
      case "styles":
        return <StylesTab />;
      case "compensations":
        return <CompensationsTab />;
      case "q10":
        return <Q10Tab />;
      case "scores":
        return <ScoresTab />;
      case "audit":
        return <AuditTab />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="min-h-screen bg-background text-foreground"
    >
      {/* Header */}
      <header
        className="sticky top-0 z-50"
        style={{
          background:
            "color-mix(in srgb, var(--background) 92%, transparent)",
          backdropFilter: "blur(24px) saturate(1.6)",
          WebkitBackdropFilter: "blur(24px) saturate(1.6)",
          borderBottom: "1px solid var(--border-muted)",
        }}
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.button
              onClick={onClose}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-1 text-primary -ml-1"
              style={{
                fontSize: "0.875rem",
                fontWeight: 600,
              }}
            >
              <ArrowLeft size={16} />
              <span>App</span>
            </motion.button>
            <div
              className="w-px h-5"
              style={{ background: "var(--outline-variant)" }}
            />
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{
                background:
                  "color-mix(in srgb, var(--primary) 12%, transparent)",
                color: "var(--primary)",
              }}
            >
              <Bug size={16} />
            </div>
            <div>
              <span
                style={{
                  ...mono,
                  color: "var(--foreground)",
                  fontWeight: 700,
                  fontSize: "0.875rem",
                }}
              >
                Dev Tools
              </span>
              <span
                className="hidden sm:inline"
                style={{
                  ...mono,
                  fontSize: "0.5625rem",
                  color: "var(--muted-foreground)",
                  marginLeft: "8px",
                }}
              >
                v1.0 · pizza-engine.ts
              </span>
            </div>
          </div>
          <span
            className="hidden sm:inline"
            style={{
              ...mono,
              fontSize: "0.5625rem",
              color: "var(--muted-foreground)",
            }}
          >
            Ctrl+Shift+D
          </span>
        </div>

        {/* Tabs */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex gap-1 overflow-x-auto pb-2 -mb-px">
            {TABS.map((tab) => (
              <motion.button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg whitespace-nowrap"
                style={{
                  ...mono,
                  fontSize: "0.6875rem",
                  fontWeight:
                    activeTab === tab.id ? 700 : 500,
                  background:
                    activeTab === tab.id
                      ? "var(--primary)"
                      : "transparent",
                  color:
                    activeTab === tab.id
                      ? "var(--primary-foreground)"
                      : "var(--muted-foreground)",
                  border:
                    activeTab === tab.id
                      ? "none"
                      : "1px solid transparent",
                }}
              >
                {tab.icon}
                {tab.label}
              </motion.button>
            ))}
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 pb-20">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            {renderTab()}
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
