import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Home,
  Zap,
  Flame,
  Thermometer,
  Minus,
  Plus,
  Check,
  Moon,
  Sun,
  Sunset,
  CalendarDays,
  PartyPopper,
  MapPin,
  CloudSun,
  Pencil,
  X,
  WheatOff,
  Milk,
  Egg,
  Wheat,
  Package,
  FlaskConical,
  Clock,
  Lightbulb,
} from "lucide-react";
import {
  UserConstraints,
  OvenType,
  OVEN_PRESETS,
  SKILL_LEVELS,
  TIME_SLOTS,
  TimeSlot,
} from "./pizza-engine";

interface UserNeedsProps {
  constraints: UserConstraints;
  onConstraintsChange: (c: UserConstraints) => void;
  selectedTimeSlot: string | null;
  onTimeSlotChange: (slot: TimeSlot) => void;
  hero?: React.ReactNode;
}

/* ═══ TIME-OF-DAY COLORS ═══ */
const TIME_COLORS: Record<
  string,
  { bg: string; text: string }
> = {
  tonight: { bg: "var(--time-tonight)", text: "#C8D8F0" },
  tomorrow_lunch: { bg: "var(--time-lunch)", text: "#FFF8E0" },
  tomorrow_dinner: {
    bg: "var(--time-dinner)",
    text: "#FFE8D8",
  },
  day_after: { bg: "var(--time-dayafter)", text: "#D0F0E0" },
  weekend: { bg: "var(--time-weekend)", text: "#E8E0F8" },
};

const TIME_ICONS: Record<
  string,
  React.ComponentType<{
    size?: number;
    className?: string;
    style?: React.CSSProperties;
  }>
> = {
  tonight: Moon,
  tomorrow_lunch: Sun,
  tomorrow_dinner: Sunset,
  day_after: CalendarDays,
  weekend: PartyPopper,
};

const OVEN_ICONS: Record<
  string,
  React.ComponentType<{
    size?: number;
    style?: React.CSSProperties;
  }>
> = {
  home: Home,
  electric_standard: Zap,
  electric_high: Zap,
  gas: Flame,
  wood: Flame,
};

/* ═══ DIETARY FILTERS ═══ */
const DIETARY_OPTIONS = [
  { id: "gluten_free", label: "Senza glutine", icon: WheatOff },
  { id: "lactose_free", label: "Senza lattosio", icon: Milk },
  { id: "vegan", label: "Vegano", icon: Egg },
];

/* ═══ PANTRY DATA ═══ */
const FLOUR_OPTIONS = [
  {
    id: "00",
    name: "Tipo 00",
    w: "W170–220",
    detail: "Classica, versatile",
  },
  {
    id: "0",
    name: "Tipo 0",
    w: "W220–260",
    detail: "Media forza",
  },
  {
    id: "manitoba",
    name: "Manitoba",
    w: "W340–380",
    detail: "Alta forza, lunga maturazione",
  },
  {
    id: "integrale",
    name: "Integrale",
    w: "W200–260",
    detail: "Più fibra e sapore",
  },
  {
    id: "semola",
    name: "Semola rimacinata",
    w: "W220–280",
    detail: "Croccantezza, colore dorato",
  },
];

const YEAST_OPTIONS = [
  {
    id: "fresh",
    name: "Lievito fresco",
    detail: "Cubetto classico",
  },
  {
    id: "dry",
    name: "Lievito secco",
    detail: "Pratico, lunga conservazione",
  },
  {
    id: "sourdough",
    name: "Lievito madre",
    detail: "Sapore complesso, lunga maturazione",
  },
];

const PANTRY_STORAGE_KEY = "vulcan_pantry";
function loadPantry(): {
  flours: string[];
  yeasts: string[];
} | null {
  try {
    const raw = localStorage.getItem(PANTRY_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    /* */
  }
  return null;
}
function savePantry(flours: string[], yeasts: string[]) {
  try {
    localStorage.setItem(
      PANTRY_STORAGE_KEY,
      JSON.stringify({ flours, yeasts }),
    );
  } catch {
    /* */
  }
}

function getSuggestedSlot(): string {
  const now = new Date();
  const hour = now.getHours();
  const dayOfWeek = now.getDay();
  if ((dayOfWeek === 4 || dayOfWeek === 5) && hour >= 18)
    return "weekend";
  if (hour < 14) return "tonight";
  if (hour < 17) return "tomorrow_lunch";
  if (hour < 20) return "tomorrow_dinner";
  return "day_after";
}

function useLocationWeather() {
  const [data] = useState(() => {
    const month = new Date().getMonth();
    const seasonBase = [
      7, 8, 11, 15, 20, 25, 28, 28, 24, 18, 12, 8,
    ];
    const temp =
      seasonBase[month] + Math.round((Math.random() - 0.5) * 4);
    const kitchenTemp =
      temp > 25 ? temp - 2 : temp < 10 ? temp + 8 : temp + 4;
    return {
      city: "Roma",
      temp,
      kitchenTemp: Math.round(kitchenTemp),
    };
  });
  return { data, loading: false };
}

const OVEN_STORAGE_KEY = "vulcan_oven_pref";
function loadSavedOven(): {
  ovenType: OvenType;
  maxTemp: number;
} | null {
  try {
    const raw = localStorage.getItem(OVEN_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    /* */
  }
  return null;
}
function saveOven(ovenType: OvenType, maxTemp: number) {
  try {
    localStorage.setItem(
      OVEN_STORAGE_KEY,
      JSON.stringify({ ovenType, maxTemp }),
    );
  } catch {
    /* */
  }
}

/* ═══ INLINE TIP ═══ */
function InlineTip({ children }: { children: string }) {
  return (
    <div
      className="flex items-start gap-2.5 px-3.5 py-2.5 rounded-xl mt-4"
      style={{
        background: "var(--tertiary-container)",
        border: "1px solid var(--outline-variant)",
      }}
    >
      <Lightbulb
        size={12}
        className="flex-shrink-0 mt-0.5"
        style={{ color: "var(--tertiary)", opacity: 0.7 }}
      />
      <span
        style={{
          fontSize: "0.8125rem",
          lineHeight: 1.5,
          color: "var(--on-surface-variant)",
          fontStyle: "italic",
        }}
      >
        {children}
      </span>
    </div>
  );
}

/* ═══ UNIFIED CHIP ═══ */
const CHIP = {
  base: "flex items-center gap-2 rounded-xl transition-all",
  padding: "px-4 py-2.5",
  font: {
    fontSize: "0.8125rem" as const,
    fontWeight: 500 as const,
  },
  fontActive: {
    fontSize: "0.8125rem" as const,
    fontWeight: 600 as const,
  },
  border: "1px solid var(--outline-variant)",
  borderActive: "1px solid transparent",
  bg: "var(--surface-container)",
  bgActive: "var(--primary)",
  color: "var(--foreground)",
  colorActive: "var(--primary-foreground)",
} as const;

function UnifiedChip({
  label,
  active,
  onToggle,
  icon,
}: {
  label: string;
  active: boolean;
  onToggle: () => void;
  icon?: React.ReactNode;
}) {
  return (
    <motion.button
      onClick={onToggle}
      whileTap={{ scale: 0.95 }}
      className={CHIP.base + " " + CHIP.padding}
      style={{
        background: active ? CHIP.bgActive : CHIP.bg,
        color: active ? CHIP.colorActive : CHIP.color,
        border: active ? CHIP.borderActive : CHIP.border,
        ...(active ? CHIP.fontActive : CHIP.font),
      }}
    >
      <AnimatePresence>
        {active && (
          <motion.span
            initial={{ scale: 0, width: 0 }}
            animate={{ scale: 1, width: 14 }}
            exit={{ scale: 0, width: 0 }}
            transition={{
              type: "spring",
              stiffness: 500,
              damping: 25,
            }}
          >
            <Check size={14} />
          </motion.span>
        )}
      </AnimatePresence>
      {icon && !active && (
        <span className="flex-shrink-0">{icon}</span>
      )}
      {label}
    </motion.button>
  );
}

function SectionHeader({
  title,
  subtitle,
  icon,
}: {
  title: string;
  subtitle: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center lg:items-start gap-0.5">
      <div className="flex items-center gap-2.5">
        {icon}
        <h3 style={{ fontSize: "1.125rem" }}>{title}</h3>
      </div>
      <span
        className="font-serif italic text-muted-foreground"
        style={{ fontSize: "0.8125rem", opacity: 0.7 }}
      >
        {subtitle}
      </span>
    </div>
  );
}

/* ═══ STEP HEADER — big editorial step marker ═══ */
function StepHeader({
  number,
  title,
  subtitle,
}: {
  number: string;
  title: string;
  subtitle: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.5 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="flex flex-col items-center lg:items-start text-center lg:text-left"
    >
      <span
        style={{
          fontSize: "0.6875rem",
          fontWeight: 700,
          letterSpacing: "0.18em",
          textTransform: "uppercase" as const,
          color: "var(--primary)",
          fontFamily: "'DM Mono', monospace",
          marginBottom: "0.5rem",
        }}
      >
        {number}
      </span>
      <h2
        className="font-serif"
        style={{
          fontSize: "clamp(1.75rem, 5vw, 2.75rem)",
          lineHeight: 1.1,
          letterSpacing: "-0.02em",
          color: "var(--foreground)",
        }}
      >
        {title}
      </h2>
      <p
        className="font-serif italic text-muted-foreground mt-1.5"
        style={{
          fontSize: "0.9375rem",
          lineHeight: 1.5,
          opacity: 0.65,
        }}
      >
        {subtitle}
      </p>
      <div
        className="mx-auto lg:mx-0 mt-4 sm:mt-5"
        style={{
          width: "2rem",
          height: "2px",
          borderRadius: "1px",
          background: "var(--primary)",
          opacity: 0.35,
        }}
      />
    </motion.div>
  );
}

/* ═══ MAIN EXPORT ═══ */
export function UserNeeds({
  constraints,
  onConstraintsChange,
  selectedTimeSlot,
  onTimeSlotChange,
  hero,
}: UserNeedsProps) {
  const update = (
    key: keyof UserConstraints,
    value: unknown,
  ) => {
    onConstraintsChange({ ...constraints, [key]: value });
  };

  const suggestedSlot = useMemo(() => getSuggestedSlot(), []);
  const weather = useLocationWeather();

  const [kitchenTempManual, setKitchenTempManual] =
    useState(false);
  const [kitchenTemp, setKitchenTemp] = useState(
    weather.data?.kitchenTemp ?? 22,
  );

  useEffect(() => {
    if (weather.data && !kitchenTempManual)
      setKitchenTemp(weather.data.kitchenTemp);
  }, [weather.data, kitchenTempManual]);

  useEffect(() => {
    update("kitchen_temp_c", kitchenTemp);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kitchenTemp]);

  const [ovenSet, setOvenSet] = useState(false);
  const [editingOven, setEditingOven] = useState(false);
  const [recentFlours, setRecentFlours] = useState<string[]>(
    [],
  );
  const [recentYeasts, setRecentYeasts] = useState<string[]>(
    [],
  );

  useEffect(() => {
    const saved = loadSavedOven();
    const pantry = loadPantry();
    const updates: Partial<UserConstraints> = {};
    if (saved) {
      updates.oven_type = saved.ovenType;
      updates.oven_max_temp_c = saved.maxTemp;
      setOvenSet(true);
    }
    if (pantry) {
      setRecentFlours(pantry.flours);
      setRecentYeasts(pantry.yeasts);
    }
    if (Object.keys(updates).length > 0)
      onConstraintsChange({ ...constraints, ...updates });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleOvenSelect = (id: string, maxTemp: number) => {
    onConstraintsChange({
      ...constraints,
      oven_type: id as OvenType,
      oven_max_temp_c: maxTemp,
    });
    saveOven(id as OvenType, maxTemp);
    setOvenSet(true);
    setEditingOven(false);
  };

  const toggleDietary = (id: string) => {
    const current = constraints.dietary_filters;
    const next = current.includes(id)
      ? current.filter((f) => f !== id)
      : [...current, id];
    update("dietary_filters", next);
  };

  const toggleFlour = (id: string) => {
    const current = constraints.pantry_flours;
    const next = current.includes(id)
      ? current.filter((f) => f !== id)
      : [...current, id];
    update("pantry_flours", next);
    savePantry(next, constraints.pantry_yeasts);
    setRecentFlours((prev) =>
      Array.from(new Set([...prev, ...next])),
    );
  };

  const toggleYeast = (id: string) => {
    const current = constraints.pantry_yeasts;
    const next = current.includes(id)
      ? current.filter((f) => f !== id)
      : [...current, id];
    update("pantry_yeasts", next);
    savePantry(constraints.pantry_flours, next);
    setRecentYeasts((prev) =>
      Array.from(new Set([...prev, ...next])),
    );
  };

  return (
    <div className="flex flex-col">
      {/* ══════════════════════════════════════════════
          SECTION 1: Meteo + Quando
          ══════════════════════════════════════════════ */}
      <div
        data-section="context"
        className="flex flex-col gap-6 sm:gap-8 min-h-[calc(100dvh-6rem)] pt-6 sm:pt-10 pb-8"
        style={{
          scrollSnapAlign: "start",
          scrollMarginTop: "4rem",
        }}
      >
        {/* Hero passed from parent */}
        {hero && <div>{hero}</div>}

        {/* Step marker below hero */}
        <StepHeader
          number="01 — Contesto"
          title="Quando e dove"
          subtitle="Tempo, temperatura, ambiente"
        />

        {/* Weather context */}
        {weather.data && (
          <div
            className="rounded-2xl overflow-hidden"
            style={{
              border: "1px solid var(--outline-variant)",
            }}
          >
            <div
              className="flex items-center gap-2.5 px-4 py-2.5"
              style={{ background: "var(--surface-container)" }}
            >
              <MapPin
                size={13}
                className="text-muted-foreground flex-shrink-0"
              />
              <span
                style={{
                  fontSize: "0.8125rem",
                  fontWeight: 500,
                }}
              >
                {weather.data.city}
              </span>
              <span
                style={{ opacity: 0.3, fontSize: "0.75rem" }}
              >
                ·
              </span>
              <CloudSun
                size={13}
                className="text-muted-foreground"
              />
              <span
                style={{
                  fontSize: "0.8125rem",
                  color: "var(--muted-foreground)",
                }}
              >
                {weather.data.temp}°C fuori
              </span>
            </div>
            <div
              className="flex items-center gap-3 px-4 py-2.5"
              style={{
                background: "var(--surface-container-low)",
                borderTop: "1px solid var(--outline-variant)",
              }}
            >
              <Thermometer
                size={13}
                style={{
                  color: "var(--tertiary)",
                  flexShrink: 0,
                }}
              />
              <span
                style={{
                  fontSize: "0.8125rem",
                  fontWeight: 500,
                  color: "var(--muted-foreground)",
                }}
              >
                Cucina
              </span>
              <div className="flex items-center gap-1.5">
                <motion.button
                  whileTap={{ scale: 0.88 }}
                  onClick={() => {
                    setKitchenTempManual(true);
                    setKitchenTemp((t) => Math.max(10, t - 1));
                  }}
                  className="w-7 h-7 rounded-lg flex items-center justify-center"
                  style={{
                    background: "var(--surface-container)",
                    border: "1px solid var(--outline-variant)",
                  }}
                >
                  <Minus size={11} />
                </motion.button>
                <span
                  style={{
                    fontSize: "0.9375rem",
                    fontWeight: 700,
                    minWidth: 42,
                    textAlign: "center",
                    fontFamily: "'DM Sans', sans-serif",
                    fontVariantNumeric: "tabular-nums",
                    color: "var(--tertiary)",
                  }}
                >
                  {kitchenTemp}°C
                </span>
                <motion.button
                  whileTap={{ scale: 0.88 }}
                  onClick={() => {
                    setKitchenTempManual(true);
                    setKitchenTemp((t) => Math.min(40, t + 1));
                  }}
                  className="w-7 h-7 rounded-lg flex items-center justify-center"
                  style={{
                    background: "var(--surface-container)",
                    border: "1px solid var(--outline-variant)",
                  }}
                >
                  <Plus size={11} />
                </motion.button>
              </div>
              {kitchenTempManual && (
                <motion.button
                  initial={{ opacity: 0, x: -4 }}
                  animate={{ opacity: 1, x: 0 }}
                  onClick={() => {
                    setKitchenTempManual(false);
                    setKitchenTemp(weather.data!.kitchenTemp);
                  }}
                  className="text-primary ml-0.5"
                  style={{
                    fontSize: "0.6875rem",
                    fontWeight: 600,
                  }}
                >
                  Auto
                </motion.button>
              )}
            </div>
          </div>
        )}

        {/* When */}
        <div>
          <SectionHeader
            title="Quando vuoi la pizza?"
            subtitle="Il tempo cambia tutto"
          />
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 sm:gap-2.5 w-full mt-4">
            {TIME_SLOTS.map((slot) => {
              const active = selectedTimeSlot === slot.id;
              const suggested =
                slot.id === suggestedSlot && !selectedTimeSlot;
              const Icon = TIME_ICONS[slot.id] || Moon;
              const colors = TIME_COLORS[slot.id];
              return (
                <motion.button
                  key={slot.id}
                  onClick={() => onTimeSlotChange(slot)}
                  whileTap={{ scale: 0.95 }}
                  className="relative flex flex-col items-center gap-2 px-2.5 sm:px-3 py-3.5 sm:py-4 rounded-xl transition-all"
                  style={{
                    background: active
                      ? colors.bg
                      : "var(--surface-container)",
                    color: active
                      ? colors.text
                      : "var(--foreground)",
                    boxShadow: active
                      ? `0 0 0 2px ${colors.bg}, var(--shadow-md)`
                      : suggested
                        ? `inset 0 0 0 1.5px ${colors.bg}50`
                        : "none",
                    border: active
                      ? "1px solid transparent"
                      : "1px solid var(--outline-variant)",
                  }}
                >
                  {suggested && (
                    <div className="absolute -top-2 inset-x-0 flex justify-center">
                      <div
                        className="flex items-center gap-1 px-2 py-0.5 rounded-full"
                        style={{
                          background: colors.bg,
                          boxShadow: `0 2px 6px ${colors.bg}40`,
                        }}
                      >
                        <motion.div
                          animate={{
                            scale: [1, 1.3, 1],
                            opacity: [0.8, 1, 0.8],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut",
                          }}
                          className="w-1 h-1 rounded-full"
                          style={{ background: "white" }}
                        />
                        <span
                          style={{
                            fontSize: "0.5rem",
                            fontWeight: 700,
                            color: "white",
                            letterSpacing: "0.05em",
                          }}
                        >
                          IDEALE
                        </span>
                      </div>
                    </div>
                  )}
                  <Icon
                    size={18}
                    style={{ opacity: active ? 1 : 0.45 }}
                  />
                  <span
                    style={{
                      fontSize: "0.8125rem",
                      fontWeight: 600,
                      lineHeight: 1.25,
                      textAlign: "center",
                    }}
                  >
                    {slot.label}
                  </span>
                  <div
                    className="flex items-center gap-1"
                    style={{ opacity: active ? 0.85 : 0.5 }}
                  >
                    <Clock size={9} />
                    <span
                      style={{
                        fontSize: "0.6875rem",
                        fontWeight: 500,
                        fontFamily: "'DM Sans', sans-serif",
                        fontVariantNumeric: "tabular-nums",
                      }}
                    >
                      {slot.sublabel}
                    </span>
                  </div>
                </motion.button>
              );
            })}
          </div>
          <InlineTip>
            La temperatura della cucina influenza i tempi di
            lievitazione. Più tempo hai, più opzioni per impasti
            leggeri e digeribili.
          </InlineTip>
        </div>
      </div>

      {/* ══════════════════════════════════════════════
          SECTION 2: Tutto il resto
          ══════════════════════════════════════════════ */}
      <div
        data-section="setup"
        className="flex flex-col gap-10 sm:gap-12 min-h-[calc(100dvh-6rem)] pt-10 sm:pt-14 pb-8"
        style={{
          scrollSnapAlign: "start",
          scrollMarginTop: "4rem",
        }}
      >
        {/* ── Big step header ── */}
        <StepHeader
          number="02 — Setup"
          title="La tua cucina"
          subtitle="Strumenti, esperienza, dispensa"
        />

        {/* Skill */}
        <div>
          <SectionHeader
            title="La tua esperienza?"
            subtitle="Adattiamo la complessità"
          />
          <div className="flex flex-wrap justify-center lg:justify-start gap-2 mt-4">
            {SKILL_LEVELS.map((sl) => (
              <UnifiedChip
                key={sl.level}
                label={sl.name}
                active={constraints.skill_level === sl.level}
                onToggle={() => update("skill_level", sl.level)}
              />
            ))}
          </div>
          <InlineTip>
            Adattiamo la complessità della ricetta alla tua
            esperienza.
          </InlineTip>
        </div>

        {/* Dietary */}
        <div>
          <SectionHeader
            title="Intolleranze?"
            subtitle="Opzionale"
          />
          <div className="flex flex-wrap justify-center lg:justify-start gap-2 mt-4">
            {DIETARY_OPTIONS.map((opt) => {
              const DIcon = opt.icon;
              return (
                <UnifiedChip
                  key={opt.id}
                  label={opt.label}
                  active={constraints.dietary_filters.includes(
                    opt.id,
                  )}
                  onToggle={() => toggleDietary(opt.id)}
                  icon={<DIcon size={14} />}
                />
              );
            })}
          </div>
        </div>

        {/* Equipment */}
        <div>
          <SectionHeader
            title="Accessori"
            subtitle="Strumenti in cucina"
          />
          <div className="flex flex-wrap justify-center lg:justify-start gap-2 mt-4">
            <UnifiedChip
              label="Impastatrice"
              active={constraints.has_mixer}
              onToggle={() =>
                update("has_mixer", !constraints.has_mixer)
              }
            />
            <UnifiedChip
              label="Pietra refrattaria"
              active={constraints.has_pizza_stone}
              onToggle={() =>
                update(
                  "has_pizza_stone",
                  !constraints.has_pizza_stone,
                )
              }
            />
            <UnifiedChip
              label="Piastra in acciaio"
              active={constraints.has_pizza_steel}
              onToggle={() =>
                update(
                  "has_pizza_steel",
                  !constraints.has_pizza_steel,
                )
              }
            />
          </div>
          <InlineTip>
            Pietra o piastra cambiano la crosta. Senza, otterrai
            comunque ottimi risultati.
          </InlineTip>
        </div>

        {/* Oven */}
        <div>
          {!ovenSet || editingOven ? (
            <div>
              <SectionHeader
                title="Che forno hai?"
                subtitle={
                  ovenSet
                    ? "Modifica forno"
                    : "Lo chiediamo solo la prima volta"
                }
              />
              {editingOven && (
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  onClick={() => setEditingOven(false)}
                  className="self-start flex items-center gap-1.5 text-muted-foreground mt-2 mb-1"
                  style={{
                    fontSize: "0.75rem",
                    fontWeight: 500,
                  }}
                >
                  <X size={12} /> Annulla
                </motion.button>
              )}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mt-4">
                {OVEN_PRESETS.map((preset) => {
                  const active =
                    constraints.oven_type === preset.id;
                  const Icon =
                    OVEN_ICONS[preset.id] || Thermometer;
                  return (
                    <motion.button
                      key={preset.id}
                      onClick={() =>
                        handleOvenSelect(
                          preset.id,
                          preset.maxTemp,
                        )
                      }
                      whileTap={{ scale: 0.96 }}
                      className="flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all text-left"
                      style={{
                        background: active
                          ? "var(--primary)"
                          : "var(--surface-container)",
                        color: active
                          ? "var(--primary-foreground)"
                          : "var(--foreground)",
                        boxShadow: active
                          ? "var(--shadow-glow), var(--shadow-md)"
                          : "none",
                        border: active
                          ? "1px solid transparent"
                          : "1px solid var(--outline-variant)",
                      }}
                    >
                      <Icon
                        size={18}
                        style={{ opacity: active ? 1 : 0.5 }}
                      />
                      <div>
                        <div
                          style={{
                            fontSize: "0.8125rem",
                            fontWeight: 600,
                            lineHeight: 1.3,
                          }}
                        >
                          {preset.name}
                        </div>
                        <div
                          style={{
                            fontSize: "0.6875rem",
                            fontWeight: 500,
                            opacity: 0.6,
                            fontVariantNumeric: "tabular-nums",
                          }}
                        >
                          {preset.maxTemp}°C
                        </div>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
              <InlineTip>
                La temperatura massima del forno determina quali
                stili puoi replicare a casa.
              </InlineTip>
            </div>
          ) : (
            <div
              className="flex items-center justify-between px-4 py-3 rounded-xl"
              style={{
                background: "var(--surface-container)",
                border: "1px solid var(--outline-variant)",
              }}
            >
              <div className="flex items-center gap-3">
                {(() => {
                  const Icon =
                    OVEN_ICONS[constraints.oven_type] ||
                    Thermometer;
                  const preset = OVEN_PRESETS.find(
                    (p) => p.id === constraints.oven_type,
                  );
                  return (
                    <div className="flex items-center gap-2.5">
                      <Icon
                        size={16}
                        style={{
                          color: "var(--muted-foreground)",
                        }}
                      />
                      <span
                        style={{
                          fontSize: "0.8125rem",
                          fontWeight: 600,
                        }}
                      >
                        {preset?.name ?? "Forno"}
                      </span>
                      <span
                        style={{
                          fontSize: "0.75rem",
                          fontWeight: 500,
                          color: "var(--muted-foreground)",
                          fontVariantNumeric: "tabular-nums",
                        }}
                      >
                        {constraints.oven_max_temp_c}°C
                      </span>
                    </div>
                  );
                })()}
              </div>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setEditingOven(true)}
                className="flex items-center gap-1.5 text-primary"
                style={{ fontSize: "0.75rem", fontWeight: 600 }}
              >
                <Pencil size={12} /> Cambia
              </motion.button>
            </div>
          )}
        </div>

        {/* Pantry */}
        <div>
          <SectionHeader
            title="La tua dispensa"
            subtitle="Cosa hai a casa?"
            icon={
              <Package
                size={16}
                style={{ color: "var(--tertiary)" }}
              />
            }
          />
          <div className="flex flex-col gap-2.5 mt-4">
            <div className="flex items-center gap-2">
              <Wheat
                size={14}
                className="text-muted-foreground"
              />
              <span
                style={{
                  fontSize: "0.8125rem",
                  fontWeight: 600,
                }}
              >
                Farine
              </span>
            </div>
            <div className="flex flex-wrap justify-center lg:justify-start gap-2">
              {FLOUR_OPTIONS.map((f) => {
                const active =
                  constraints.pantry_flours.includes(f.id);
                const isRecent =
                  !active && recentFlours.includes(f.id);
                return (
                  <motion.button
                    key={f.id}
                    onClick={() => toggleFlour(f.id)}
                    whileTap={{ scale: 0.95 }}
                    className="relative flex flex-col items-start px-3.5 py-2.5 rounded-xl transition-all text-left"
                    style={{
                      background: active
                        ? "var(--primary)"
                        : "var(--surface-container)",
                      color: active
                        ? "var(--primary-foreground)"
                        : "var(--foreground)",
                      border: active
                        ? "1px solid transparent"
                        : isRecent
                          ? "1px solid color-mix(in srgb, var(--tertiary) 40%, var(--outline-variant))"
                          : "1px solid var(--outline-variant)",
                      minWidth: 100,
                    }}
                  >
                    {isRecent && (
                      <div
                        className="absolute -top-1.5 right-2 px-1.5 py-0.5 rounded-full"
                        style={{
                          background: "var(--tertiary)",
                          fontSize: "0.4375rem",
                          fontWeight: 700,
                          color: "white",
                          letterSpacing: "0.04em",
                          lineHeight: 1,
                        }}
                      >
                        RECENTE
                      </div>
                    )}
                    <div className="flex items-center gap-1.5">
                      <AnimatePresence>
                        {active && (
                          <motion.span
                            initial={{ scale: 0, width: 0 }}
                            animate={{ scale: 1, width: 14 }}
                            exit={{ scale: 0, width: 0 }}
                            transition={{
                              type: "spring",
                              stiffness: 500,
                              damping: 25,
                            }}
                          >
                            <Check size={14} />
                          </motion.span>
                        )}
                      </AnimatePresence>
                      <span
                        style={{
                          fontSize: "0.8125rem",
                          fontWeight: 600,
                        }}
                      >
                        {f.name}
                      </span>
                    </div>
                    <span
                      style={{
                        fontSize: "0.625rem",
                        opacity: 0.65,
                        marginTop: 2,
                        fontVariantNumeric: "tabular-nums",
                      }}
                    >
                      {f.w}
                    </span>
                  </motion.button>
                );
              })}
            </div>
          </div>
          <div className="flex flex-col gap-2.5 mt-5">
            <div className="flex items-center gap-2">
              <FlaskConical
                size={14}
                className="text-muted-foreground"
              />
              <span
                style={{
                  fontSize: "0.8125rem",
                  fontWeight: 600,
                }}
              >
                Lieviti
              </span>
            </div>
            <div className="flex flex-wrap justify-center lg:justify-start gap-2">
              {YEAST_OPTIONS.map((y) => {
                const active =
                  constraints.pantry_yeasts.includes(y.id);
                const isRecent =
                  !active && recentYeasts.includes(y.id);
                return (
                  <motion.button
                    key={y.id}
                    onClick={() => toggleYeast(y.id)}
                    whileTap={{ scale: 0.95 }}
                    className="relative flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all"
                    style={{
                      background: active
                        ? "var(--cta)"
                        : "var(--surface-container)",
                      color: active
                        ? "var(--cta-foreground)"
                        : "var(--foreground)",
                      border: active
                        ? "1px solid transparent"
                        : isRecent
                          ? "1px solid color-mix(in srgb, var(--tertiary) 40%, var(--outline-variant))"
                          : "1px solid var(--outline-variant)",
                      fontSize: "0.8125rem",
                      fontWeight: 500,
                    }}
                  >
                    {isRecent && (
                      <div
                        className="absolute -top-1.5 right-2 px-1.5 py-0.5 rounded-full"
                        style={{
                          background: "var(--tertiary)",
                          fontSize: "0.4375rem",
                          fontWeight: 700,
                          color: "white",
                          letterSpacing: "0.04em",
                          lineHeight: 1,
                        }}
                      >
                        RECENTE
                      </div>
                    )}
                    <AnimatePresence>
                      {active && (
                        <motion.span
                          initial={{ scale: 0, width: 0 }}
                          animate={{ scale: 1, width: 14 }}
                          exit={{ scale: 0, width: 0 }}
                          transition={{
                            type: "spring",
                            stiffness: 500,
                            damping: 25,
                          }}
                        >
                          <Check size={14} />
                        </motion.span>
                      )}
                    </AnimatePresence>
                    {y.name}
                  </motion.button>
                );
              })}
            </div>
          </div>
          <InlineTip>
            Adatteremo la ricetta alla tua dispensa reale:
            farina compatibile e tipo di lievito.
          </InlineTip>
        </div>
      </div>

      {/* ══════════════════════════════════════════════
          SECTION 3: placeholder — styles appear separately
          ══════════════════════════════════════════════ */}
    </div>
  );
}