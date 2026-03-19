import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Moon, Sun, Sunset, CalendarDays, Timer, Clock,
  Home, Zap, Flame, Thermometer,
  Check, Lightbulb, MapPin, CloudSun,
  CookingPot, ChevronRight, Wheat, FlaskConical,
  Minus, Plus, Package, HelpCircle,
} from "lucide-react";
import {
  type UserConstraints,
  type TimeSlot,
  type OvenType,
  SKILL_LEVELS,
  OVEN_PRESETS,
  generateTimeSlots,
  NO_PREFERENCE_SLOT,
  DEFAULT_KITCHEN_TEMP,
  outdoorToKitchenTemp,
} from "./pizza-engine";
import { useCms } from "./cms/cms-context";
import { t } from "./cms/i18n";

interface UserNeedsProps {
  constraints: UserConstraints;
  onConstraintsChange: (c: UserConstraints) => void;
  selectedTimeSlot: string | null;
  onTimeSlotChange: (slot: TimeSlot) => void;
  hero?: React.ReactNode;
}

/* ═══ TIME-OF-DAY COLORS (VPL-065: extended for dynamic slots) ═══ */
const TIME_COLORS: Record<
  string,
  { bg: string; text: string }
> = {
  tonight: { bg: "var(--time-tonight)", text: "#ffffff" },
  tomorrow_lunch: { bg: "var(--time-lunch)", text: "#ffffff" },
  tomorrow_dinner: {
    bg: "var(--time-dinner)",
    text: "#ffffff",
  },
  day_after: { bg: "var(--time-dayafter)", text: "#ffffff" },
  day_after_lunch: { bg: "var(--time-dayafter)", text: "#ffffff" },
  long_ferment: { bg: "var(--time-weekend)", text: "#ffffff" },
  no_preference: { bg: "var(--secondary)", text: "#ffffff" },
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
  day_after_lunch: CalendarDays,
  long_ferment: Timer,
  no_preference: Clock,
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

/* Dietary filters moved to recommended-styles — data defined there */

/* ═══ PANTRY DATA ═══ */
interface FlourOption {
  id: string;
  name: string;
  w: string;
  detail: string;
  branded?: boolean;
  producer?: string;
  shortName?: string;
}

const FLOUR_OPTIONS_GENERIC: FlourOption[] = [
  {
    id: "00",
    name: "Farina 00",
    w: "W170–220",
    detail: "Classica, versatile",
  },
  {
    id: "0",
    name: "Farina 0",
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

const FLOUR_OPTIONS_BRANDED: FlourOption[] = [
  {
    id: "caputo_pizzeria_blu",
    name: "Caputo Pizzeria",
    w: "W260",
    detail: "Sacco blu, impasti diretti",
    branded: true,
    producer: "Caputo",
    shortName: "Caputo Blu",
  },
  {
    id: "caputo_nuvola",
    name: "Caputo Nuvola",
    w: "W260",
    detail: "Morbida e leggera",
    branded: true,
    producer: "Caputo",
    shortName: "Caputo Nuvola",
  },
  {
    id: "caputo_cuoco",
    name: "Caputo Cuoco",
    w: "W320",
    detail: "Saccorosso, professionale",
    branded: true,
    producer: "Caputo",
    shortName: "Caputo Cuoco",
  },
  {
    id: "petra_5037",
    name: "Petra 5037",
    w: "W360",
    detail: "Alta idratazione, lunga maturazione",
    branded: true,
    producer: "Petra",
    shortName: "Petra 5037",
  },
  {
    id: "petra_3_evolutiva",
    name: "Petra 3 Evolutiva",
    w: "W340",
    detail: "Macinata a pietra, 48-120h",
    branded: true,
    producer: "Petra",
    shortName: "Petra 3 Evolutiva",
  },
  {
    id: "5stagioni_rossa",
    name: "5 Stagioni Rossa",
    w: "W280",
    detail: "Buon equilibrio, versatile",
    branded: true,
    producer: "5 Stagioni",
    shortName: "5 Stagioni Rossa",
  },
  {
    id: "5stagioni_5lune",
    name: "5 Stagioni Le 5 Lune",
    w: "W350",
    detail: "Forza superiore, impasti complessi",
    branded: true,
    producer: "5 Stagioni",
    shortName: "5 Stagioni Le 5 Lune",
  },
  {
    id: "dallagiovanna_manitoba",
    name: "Dallagiovanna Manitoba Oro",
    w: "W380",
    detail: "Manitoba premium, panettone/croissant",
    branded: true,
    producer: "Dallagiovanna",
    shortName: "Manitoba Oro",
  },
];

const FLOUR_OPTIONS_SPECIAL: FlourOption[] = [
  { id: "farro", name: "Farina di farro", w: "W130–180", detail: "Sapore nocciolato, digeribile" },
  { id: "spelta", name: "Farina di spelta", w: "W150–200", detail: "Grano antico, aromatica" },
  { id: "kamut", name: "Farina di kamut", w: "W200–260", detail: "Khorasan, dolce e burrosa" },
  { id: "segale", name: "Farina di segale", w: "W80–150", detail: "Sapore intenso, bassa glutine" },
  { id: "riso", name: "Farina di riso", w: "—", detail: "Senza glutine, croccantezza" },
  { id: "mais", name: "Farina di mais", w: "—", detail: "Senza glutine, colore dorato" },
  { id: "saraceno", name: "Grano saraceno", w: "—", detail: "Senza glutine, terroso" },
  { id: "avena", name: "Farina di avena", w: "W100–140", detail: "Fibra alta, morbidezza" },
  { id: "ceci", name: "Farina di ceci", w: "—", detail: "Proteica, sapore deciso" },
];

const FLOUR_OPTIONS: FlourOption[] = [...FLOUR_OPTIONS_GENERIC, ...FLOUR_OPTIONS_BRANDED, ...FLOUR_OPTIONS_SPECIAL];

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

/* VPL-065: suggested slot = first dynamic slot (always the closest viable option) */
function getSuggestedSlot(): string {
  const slots = generateTimeSlots();
  return slots.length > 0 ? slots[0].id : "tomorrow_lunch";
}

/* ═══ VPL-003: Geolocation + Open-Meteo weather API ═══
 * Progressive enhancement: tries browser geolocation + Open-Meteo (free, no key).
 * Falls back to Roma + seasonal estimate if blocked (e.g. iframe restrictions). */
interface WeatherData {
  city: string;
  temp: number;
  kitchenTemp: number;
}

/* VPL-066: Use DEFAULT_KITCHEN_TEMP (21°C) as fallback — no weather = no outdoor display */
function fallbackWeather(): WeatherData {
  return { city: "", temp: DEFAULT_KITCHEN_TEMP, kitchenTemp: DEFAULT_KITCHEN_TEMP };
}

function useLocationWeather() {
  const [data, setData] = useState<WeatherData>(fallbackWeather);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    /* Check for saved location from Profile first */
    let savedLat: number | null = null;
    let savedLon: number | null = null;
    let savedCity = "";
    try {
      const raw = localStorage.getItem("vulcan_location");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed.lat === "number" && typeof parsed.lon === "number") {
          savedLat = parsed.lat;
          savedLon = parsed.lon;
          savedCity = parsed.city || "";
        }
      }
    } catch { /* ignore */ }

    async function fetchWeather(lat: number, lon: number, city?: string) {
      try {
        /* Open-Meteo: free, no API key, CORS-friendly */
        const res = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`,
        );
        if (!res.ok) throw new Error("meteo-fail");
        const json = await res.json();
        const temp = Math.round(json.current_weather?.temperature ?? 20);

        /* Reverse geocode city name via Nominatim — only if not already known */
        let resolvedCity = city || "";
        if (!resolvedCity) {
          try {
            const geoRes = await fetch(
              `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&zoom=10`,
            );
            if (geoRes.ok) {
              const geoJson = await geoRes.json();
              resolvedCity =
                geoJson.address?.city ||
                geoJson.address?.town ||
                geoJson.address?.village ||
                geoJson.address?.municipality ||
                resolvedCity;
            }
          } catch { /* ignore geocoding failure */ }
        }

        if (!cancelled) {
          setData({ city: resolvedCity, temp, kitchenTemp: outdoorToKitchenTemp(temp) });
        }
      } catch {
        /* Weather API failed — if we have a saved city, still show it */
        if (!cancelled && city) {
          setData({ city, temp: DEFAULT_KITCHEN_TEMP, kitchenTemp: DEFAULT_KITCHEN_TEMP });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    /* Priority: saved location > geolocation > fallback */
    if (savedLat !== null && savedLon !== null) {
      fetchWeather(savedLat, savedLon, savedCity);
    } else if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          fetchWeather(pos.coords.latitude, pos.coords.longitude);
        },
        () => {
          /* Geolocation denied/unavailable — keep fallback */
          if (!cancelled) setLoading(false);
        },
        { timeout: 8000, maximumAge: 300000 },
      );
    } else {
      setLoading(false);
    }

    return () => { cancelled = true; };
  }, []);

  return { data, loading };
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
    null
  );
}

/* ═══ UNIFIED CHIP ═══ */
const CHIP = {
  base: "flex items-center gap-2 rounded-xl transition-all",
  padding: "px-4 py-2.5",
  font: {
    fontSize: "var(--font-size-lg)" as const,
    fontWeight: "var(--weight-medium)" as any,
  },
  fontActive: {
    fontSize: "var(--font-size-lg)" as const,
    fontWeight: "var(--weight-semibold)" as any,
  },
  border: "1px solid var(--chip-border)",
  borderActive: "1px solid rgba(0,0,0,0)",
  bg: "var(--chip-bg)",
  bgActive: "var(--chip-bg-active)",
  color: "var(--chip-text)",
  colorActive: "var(--chip-text-active)",
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
    <button
      onClick={onToggle}
      className={CHIP.base + " " + CHIP.padding + " active:scale-95"}
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
    </button>
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
        <h3 style={{ fontSize: "var(--font-size-3xl)" }}>{title}</h3>
      </div>
      <span
        className="font-serif italic"
        style={{ color: "var(--text-muted)", fontSize: "var(--font-size-lg)", opacity: 0.7 }}
      >
        {subtitle}
      </span>
    </div>
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
  const { cms } = useCms();
  const update = (
    key: keyof UserConstraints,
    value: unknown,
  ) => {
    onConstraintsChange({ ...constraints, [key]: value });
  };

  const suggestedSlot = useMemo(() => getSuggestedSlot(), []);
  /* VPL-065: dynamic time slots based on current time */
  const dynamicSlots = useMemo(() => [...generateTimeSlots(), NO_PREFERENCE_SLOT], []);
  const weather = useLocationWeather();

  const [kitchenTempManual, setKitchenTempManual] =
    useState(false);
  const [kitchenTemp, setKitchenTemp] = useState(
    weather.data?.kitchenTemp ?? DEFAULT_KITCHEN_TEMP,
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
  const [recentFlours, setRecentFlours] = useState<string[]>([]);
  const [recentYeasts, setRecentYeasts] = useState<string[]>([]);

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
  };

  /* toggleDietary removed — dietary filters will be in recommended-styles */

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

  /* VPL-068: collapsible settings panel */
  const [showSettings, setShowSettings] = useState(false);
  const [showPantry, setShowPantry] = useState(false);
  const [showTempTip, setShowTempTip] = useState(false);

  /* ═══ Rich collapsed summaries — "La tua cucina" ═══ */
  const setupPills = useMemo(() => {
    const pills: { label: string; accent?: boolean }[] = [];

    /* Kitchen temp removed — always visible inline in header */

    /* Skill */
    const SKILL_NAMES: Record<number, string> = { 1: "Principiante", 2: "Intermedio", 3: "Esperto" };
    const skillLabel = cms.skillLevels[String(constraints.skill_level)]?.name ?? SKILL_NAMES[constraints.skill_level] ?? `Skill ${constraints.skill_level}`;
    pills.push({ label: skillLabel });

    /* Oven */
    const OVEN_NAMES: Record<string, string> = {
      home: "Casa", electric_standard: "Elettrico", electric_high: "Elett. alta T", gas: "Gas", wood: "Legna",
    };
    const ovenLabel = cms.ovenPresets[constraints.oven_type]?.name ?? OVEN_NAMES[constraints.oven_type] ?? constraints.oven_type;
    pills.push({ label: `${ovenLabel} ${constraints.oven_max_temp_c}°C` });

    /* Equipment */
    const equipItems: string[] = [];
    if (constraints.has_mixer) equipItems.push(cms.ui.equipMixer);
    if (constraints.has_pizza_stone) equipItems.push(cms.ui.equipStone);
    if (constraints.has_pizza_steel) equipItems.push(cms.ui.equipSteel);
    if (constraints.has_baking_pan) equipItems.push(cms.ui.equipPan);
    if (equipItems.length > 0) pills.push({ label: equipItems.join(", ") });

    return pills;
  }, [constraints, cms, kitchenTemp]);

  const pantryPills = useMemo(() => {
    const pills: { label: string }[] = [];

    /* Flours */
    const flourCount = constraints.pantry_flours.length;
    if (flourCount > 0) {
      const flourLabel = flourCount <= 3
        ? constraints.pantry_flours.map(f => {
            const opt = [...FLOUR_OPTIONS_GENERIC, ...FLOUR_OPTIONS_BRANDED].find(o => o.id === f);
            return opt?.shortName ?? opt?.name ?? f;
          }).join(", ")
        : `${flourCount} ${cms.ui.pantryFlours.toLowerCase()}`;
      pills.push({ label: flourLabel });
    }

    /* Yeasts */
    if (constraints.pantry_yeasts.length > 0) {
      const yeastLabels = constraints.pantry_yeasts.map(y => {
        const opt = YEAST_OPTIONS.find(o => o.id === y);
        return cms.yeastLabels[y] ?? opt?.name ?? y;
      });
      pills.push({ label: yeastLabels.join(", ") });
    }

    return pills;
  }, [constraints, cms]);

  return (
    <div className="flex flex-col">
      {/* ═══ VPL-068: Single continuous flow ═══ */}
      <div
        data-section="context"
        className="pt-6 sm:pt-10 pb-6"
      >
        <div className="flex flex-col gap-8 sm:gap-10">
          {/* Hero passed from parent */}
          {hero && <div>{hero}</div>}

          {/* ── Location + outdoor temp ── */}
          {weather.data.city && (
            <div className="flex items-center gap-2 px-1 -mb-6">
              <MapPin size={11} className="flex-shrink-0" style={{ color: "var(--text-muted)", opacity: 0.5 }} />
              <span style={{ fontSize: "var(--font-size-md)", color: "var(--text-muted)", opacity: 0.7 }}>
                {weather.data.city}
              </span>
              <span style={{ opacity: 0.15, color: "var(--text-muted)" }}>·</span>
              <CloudSun size={11} style={{ color: "var(--text-muted)", opacity: 0.5 }} />
              <span style={{ fontSize: "var(--font-size-md)", color: "var(--text-muted)", opacity: 0.7 }}>
                {t(cms.ui.weatherOutdoor, { t: weather.data.temp })}
              </span>
            </div>
          )}

          {/* ── HARD + SOFT constraints grouped ── */}
          <div className="flex flex-col gap-1.5">

            {/* ── HARD CONSTRAINTS: La tua cucina ── */}
            <div className="rounded-xl" style={{ background: "var(--surface-container)", border: showSettings ? "1px solid var(--outline-variant)" : "1px solid rgba(0,0,0,0)" }}>
              {/* Header row: icon + title + kitchen temp inline + chevron */}
              <div className="flex items-center gap-2.5 px-4 py-3">
                <CookingPot size={13} style={{ color: "var(--primary)", opacity: 0.7, flexShrink: 0 }} />
                <span style={{ fontSize: "var(--font-size-lg)", fontWeight: "var(--weight-semibold)" as any, color: "var(--text-default)", whiteSpace: "nowrap" as any }}>
                  {cms.ui.kitchenTitle || "La tua cucina"}
                </span>
                {/* Kitchen temp — always editable inline */}
                <div className="flex items-center gap-1.5 ml-auto mr-2" onClick={(e) => e.stopPropagation()}>
                  <Thermometer size={11} style={{ color: "var(--needs-pantry-accent)", opacity: 0.6, flexShrink: 0 }} />
                  <button onClick={() => { setKitchenTempManual(true); setKitchenTemp((prev) => Math.max(10, prev - 1)); }} className="w-5 h-5 rounded flex items-center justify-center active:scale-[0.88] transition-transform" style={{ background: "var(--needs-oven-bg)", border: "1px solid var(--needs-oven-border)" }} aria-label="Riduci temperatura cucina">
                    <Minus size={9} />
                  </button>
                  <span className="type-numeric" style={{ fontSize: "var(--font-size-base)", fontWeight: "var(--weight-bold)" as any, minWidth: 32, textAlign: "center", color: "var(--needs-pantry-accent)" }}>
                    {kitchenTemp}°C
                  </span>
                  <button onClick={() => { setKitchenTempManual(true); setKitchenTemp((prev) => Math.min(40, prev + 1)); }} className="w-5 h-5 rounded flex items-center justify-center active:scale-[0.88] transition-transform" style={{ background: "var(--needs-oven-bg)", border: "1px solid var(--needs-oven-border)" }} aria-label="Aumenta temperatura cucina">
                    <Plus size={9} />
                  </button>
                  {kitchenTempManual && (
                    <motion.button initial={{ opacity: 0, x: -4 }} animate={{ opacity: 1, x: 0 }} onClick={() => { setKitchenTempManual(false); setKitchenTemp(weather.data.kitchenTemp); }} className="active:scale-95 transition-transform" style={{ color: "var(--text-accent)", fontSize: "var(--font-size-xs)", fontWeight: "var(--weight-semibold)" as any }}>
                      {cms.ui.autoLabel}
                    </motion.button>
                  )}
                  <button onClick={() => setShowTempTip(!showTempTip)} className="flex-shrink-0 active:scale-90 transition-transform" aria-label="Info temperatura">
                    <HelpCircle size={11} style={{ color: "var(--text-muted)", opacity: showTempTip ? 0.8 : 0.3 }} />
                  </button>
                </div>
                <button onClick={() => setShowSettings(!showSettings)} className="flex-shrink-0 active:scale-90 transition-transform" aria-label="Espandi cucina">
                  <motion.div animate={{ rotate: showSettings ? 90 : 0 }} transition={{ type: "spring", stiffness: 500, damping: 30 }} style={{ color: "var(--text-muted)", opacity: 0.45 }}>
                    <ChevronRight size={14} />
                  </motion.div>
                </button>
              </div>
              {/* Temp tip */}
              <AnimatePresence>
                {showTempTip && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ type: "spring", stiffness: 400, damping: 25 }} className="overflow-hidden px-4">
                    <InlineTip>{cms.tips.kitchenTemp || "La temperatura della cucina influenza la velocità di lievitazione. Il motore adatta automaticamente tempi e dosi."}</InlineTip>
                  </motion.div>
                )}
              </AnimatePresence>
              {/* Collapsed summary pills */}
              {!showSettings && setupPills.length > 0 && (
                <div className="flex flex-wrap gap-1.5 px-4 pb-3">
                  {setupPills.map((pill, i) => (
                    <span key={i} className="inline-flex items-center px-2 py-0.5 rounded-md" style={{ fontSize: "var(--font-size-sm)", color: pill.accent ? "var(--primary)" : "var(--text-muted)", background: pill.accent ? "color-mix(in srgb, var(--primary) 8%, rgba(0,0,0,0))" : "color-mix(in srgb, var(--text-muted) 6%, rgba(0,0,0,0))", lineHeight: "var(--leading-compact)" }}>
                      {pill.label}
                    </span>
                  ))}
                </div>
              )}
              {/* Expanded content */}
              <AnimatePresence>
                {showSettings && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ type: "spring", stiffness: 400, damping: 25 }} className="overflow-hidden">
                    <div className="px-4 pb-5 pt-1 flex flex-col gap-7">
                    {/* Skill */}
                    <div>
                      <SectionHeader title={cms.sections.skill.title} subtitle={cms.sections.skill.description} />
                      <div className="flex flex-wrap justify-center lg:justify-start gap-2 mt-3">
                        {SKILL_LEVELS.map((sl) => {
                          const cmsSkill = cms.skillLevels[String(sl.level)];
                          return (<UnifiedChip key={sl.level} label={cmsSkill?.name ?? sl.name} active={constraints.skill_level === sl.level} onToggle={() => update("skill_level", sl.level)} />);
                        })}
                      </div>
                    </div>
                    {/* Oven */}
                    <div>
                      <SectionHeader title={cms.sections.oven.title} subtitle={ovenSet ? cms.ui.editOven : cms.sections.oven.description} />
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mt-3">
                        {OVEN_PRESETS.map((preset) => {
                          const active = constraints.oven_type === preset.id;
                          const Icon = OVEN_ICONS[preset.id] || Thermometer;
                          const cmsOven = cms.ovenPresets[preset.id];
                          const displayName = cmsOven?.name ?? preset.name;
                          return (
                            <motion.button key={preset.id} onClick={() => handleOvenSelect(preset.id, preset.maxTemp)} className="flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all text-left active:scale-[0.96]" style={{ background: active ? "var(--chip-bg-active)" : "var(--chip-bg)", color: active ? "var(--chip-text-active)" : "var(--chip-text)", boxShadow: active ? "var(--shadow-glow), var(--shadow-md)" : "none", border: active ? "1px solid rgba(0,0,0,0)" : "1px solid var(--chip-border)" }}>
                              <Icon size={18} style={{ opacity: active ? 1 : 0.5 }} />
                              <div>
                                <div style={{ fontSize: "var(--font-size-lg)", fontWeight: "var(--weight-semibold)" as any, lineHeight: "var(--leading-compact)" }}>{displayName}</div>
                                <div className="type-numeric" style={{ fontSize: "var(--font-size-base)", fontWeight: "var(--weight-medium)" as any, opacity: 0.6 }}>{preset.maxTemp}°C</div>
                              </div>
                            </motion.button>
                          );
                        })}
                      </div>
                    </div>
                    {/* Equipment — grouped by category */}
                    <div>
                      <SectionHeader title={cms.sections.equipment.title} subtitle={cms.sections.equipment.description} />
                      <div className="flex flex-col gap-4 mt-3">
                        {/* Impastamento */}
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="type-data" style={{ fontSize: "var(--font-size-sm)", color: "var(--text-muted)", letterSpacing: "0.06em", textTransform: "uppercase" as any }}>{cms.ui.equipKneading}</span>
                          </div>
                          <div className="flex flex-wrap justify-center lg:justify-start gap-2">
                            <UnifiedChip label={cms.ui.equipMixer} active={constraints.has_mixer} onToggle={() => update("has_mixer", !constraints.has_mixer)} />
                          </div>
                        </div>
                        {/* Superficie cottura */}
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="type-data" style={{ fontSize: "var(--font-size-sm)", color: "var(--text-muted)", letterSpacing: "0.06em", textTransform: "uppercase" as any }}>{cms.ui.equipSurface}</span>
                          </div>
                          <div className="flex flex-wrap justify-center lg:justify-start gap-2">
                            <UnifiedChip label={cms.ui.equipStone} active={constraints.has_pizza_stone} onToggle={() => update("has_pizza_stone", !constraints.has_pizza_stone)} />
                            <UnifiedChip label={cms.ui.equipSteel} active={constraints.has_pizza_steel} onToggle={() => update("has_pizza_steel", !constraints.has_pizza_steel)} />
                            <UnifiedChip label={cms.ui.equipPan} active={constraints.has_baking_pan} onToggle={() => update("has_baking_pan", !constraints.has_baking_pan)} />
                          </div>
                        </div>
                      </div>
                    </div>
                    {/* Dietary filters moved to recommended-styles as "Filtri avanzati" */}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* ── SOFT CONSTRAINTS: La tua dispensa ── */}
            <div>
              <button
                onClick={() => setShowPantry(!showPantry)}
                className="w-full flex flex-col gap-2 px-4 py-3 mt-2 rounded-xl text-left active:scale-[0.98] transition-transform"
                style={{
                  background: "color-mix(in srgb, var(--needs-pantry-accent) 5%, var(--surface-container))",
                  border: showPantry ? "1px solid var(--needs-pantry-border-active)" : "1px solid rgba(0,0,0,0)",
                }}
              >
                <div className="flex items-center gap-2.5 w-full">
                  <Package size={13} style={{ color: "var(--needs-pantry-accent)", opacity: 0.7, flexShrink: 0 }} />
                  <span style={{ fontSize: "var(--font-size-lg)", fontWeight: "var(--weight-semibold)" as any, color: "var(--text-default)", flex: 1 }}>
                    {cms.sections.pantry.title || "La tua dispensa"}
                  </span>
                  {!showPantry && pantryPills.length === 0 && (
                    <span style={{ fontSize: "var(--font-size-sm)", color: "var(--text-muted)", opacity: 0.4, fontStyle: "italic" }}>
                      {cms.ui.pantryOptional}
                    </span>
                  )}
                  <motion.div animate={{ rotate: showPantry ? 90 : 0 }} transition={{ type: "spring", stiffness: 500, damping: 30 }} className="flex-shrink-0" style={{ color: "var(--text-muted)", opacity: 0.45 }}>
                    <ChevronRight size={14} />
                  </motion.div>
                </div>
                {!showPantry && pantryPills.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pl-6">
                    {pantryPills.map((pill, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center px-2 py-0.5 rounded-md"
                        style={{
                          fontSize: "var(--font-size-sm)",
                          color: "var(--needs-pantry-accent)",
                          background: "color-mix(in srgb, var(--needs-pantry-accent) 8%, rgba(0,0,0,0))",
                          lineHeight: "var(--leading-compact)",
                        }}
                      >
                        {pill.label}
                      </span>
                    ))}
                  </div>
                )}
              </button>
              <AnimatePresence>
                {showPantry && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ type: "spring", stiffness: 400, damping: 25 }} className="overflow-hidden">
                    <div className="px-4 pb-5 pt-3 flex flex-col gap-6">
                    {/* Flours */}
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <Wheat size={14} style={{ color: "var(--needs-pantry-accent)" }} />
                        <span style={{ fontSize: "var(--font-size-lg)", fontWeight: "var(--weight-semibold)" as any }}>{cms.ui.pantryFlours}</span>
                      </div>
                      <FlourChipGrid options={FLOUR_OPTIONS_GENERIC} activeFlours={constraints.pantry_flours} recentFlours={recentFlours} onToggle={toggleFlour} cms={cms} />
                      <BrandedFloursSection options={FLOUR_OPTIONS_SPECIAL} activeFlours={constraints.pantry_flours} recentFlours={recentFlours} onToggle={toggleFlour} cms={cms} labelOverride={cms.ui.specialFlours} />
                    </div>
                    {/* Yeasts */}
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <FlaskConical size={14} style={{ color: "var(--needs-pantry-accent)" }} />
                        <span style={{ fontSize: "var(--font-size-lg)", fontWeight: "var(--weight-semibold)" as any }}>{cms.ui.pantryYeasts}</span>
                      </div>
                      <div className="flex flex-wrap justify-center lg:justify-start gap-2">
                        {YEAST_OPTIONS.map((y) => {
                          const active = constraints.pantry_yeasts.includes(y.id);
                          const isRecent = !active && recentYeasts.includes(y.id);
                          return (
                            <motion.button key={y.id} onClick={() => toggleYeast(y.id)} className="relative flex flex-col items-start gap-0.5 px-4 py-2.5 rounded-xl transition-all active:scale-95" style={{ background: active ? "var(--needs-yeast-bg-active)" : "var(--chip-bg)", color: active ? "var(--needs-yeast-text-active)" : "var(--chip-text)", border: active ? "1px solid rgba(0,0,0,0)" : isRecent ? "1px solid var(--needs-pantry-border-active)" : "1px solid var(--chip-border)", fontSize: "var(--font-size-lg)" }}>
                              {isRecent && (<div className="absolute -top-1.5 right-2 px-1.5 py-0.5 rounded-full" style={{ background: "var(--needs-pantry-accent)", fontSize: "var(--font-size-xs)", fontWeight: "var(--weight-bold)" as any, color: "var(--overlay-text)", letterSpacing: "var(--tracking-spread)", lineHeight: "var(--leading-none)" }}>{cms.ui.badgeRecent}</div>)}
                              <div className="flex items-center gap-2">
                                <AnimatePresence>{active && (<motion.span initial={{ scale: 0, width: 0 }} animate={{ scale: 1, width: 14 }} exit={{ scale: 0, width: 0 }} transition={{ type: "spring", stiffness: 500, damping: 25 }}><Check size={14} /></motion.span>)}</AnimatePresence>
                                <span style={{ fontWeight: "var(--weight-semibold)" as any }}>{cms.yeastLabels[y.id] ?? y.name}</span>
                              </div>
                              <span style={{ fontSize: "var(--font-size-sm)", opacity: 0.6 }}>{cms.yeastDetails[y.id] ?? y.detail}</span>
                            </motion.button>
                          );
                        })}
                      </div>
                    </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

          </div>

          {/* ── Decorative separator before When ── */}
          <div className="flex justify-center" style={{ opacity: 0.15 }}>
            <div style={{ width: 40, height: 2, borderRadius: 1, background: "var(--primary)" }} />
          </div>

          {/* When */}
          <div>
            <SectionHeader
              title={cms.sections.when.title}
              subtitle={cms.sections.when.description}
            />
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 sm:gap-2.5 w-full mt-4">
              {dynamicSlots.map((slot) => {
                const active = selectedTimeSlot === slot.id;
                const suggested =
                  slot.id === suggestedSlot && !selectedTimeSlot;
                const Icon = TIME_ICONS[slot.id] || Moon;
                const colors = TIME_COLORS[slot.id];
                const cmsSlot = cms.timeSlots[slot.id];
                const displayLabel = cmsSlot?.label ?? slot.label;
                const displaySublabel = cmsSlot?.sublabel ?? slot.sublabel;
                return (
                  <button
                    key={slot.id}
                    onClick={() => onTimeSlotChange(slot)}
                    className="relative flex flex-col items-center gap-2 px-2.5 sm:px-3 py-3.5 sm:py-4 rounded-xl transition-all active:scale-95"
                    style={{
                      background: active
                        ? colors.bg
                        : "var(--chip-bg)",
                      color: active
                        ? colors.text
                        : "var(--chip-text)",
                      boxShadow: active
                        ? `0 0 0 2px ${colors.bg}, var(--shadow-md)`
                        : suggested
                          ? `inset 0 0 0 1.5px ${colors.bg}50`
                          : "none",
                      border: active
                        ? "1px solid rgba(0,0,0,0)"
                        : "1px solid var(--chip-border)",
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
                            style={{ background: "var(--overlay-text)" }}
                          />
                          <span
                            style={{
                              fontSize: "var(--font-size-xs)",
                              fontWeight: "var(--weight-bold)" as any,
                              color: "var(--overlay-text)",
                              letterSpacing: "var(--tracking-spread)",
                              lineHeight: "var(--leading-none)",
                            }}
                          >
                            {cms.ui.badgeIdeal}
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
                        fontSize: "var(--font-size-lg)",
                        fontWeight: "var(--weight-semibold)" as any,
                        lineHeight: "var(--leading-title)",
                        textAlign: "center",
                      }}
                    >
                      {displayLabel}
                    </span>
                    <div
                      className="flex items-center gap-1"
                      style={{ opacity: active ? 0.85 : 0.5 }}
                    >
                      <Clock size={9} />
                      <span
                        className="type-numeric"
                        style={{
                          fontSize: "var(--font-size-base)",
                          fontWeight: "var(--weight-medium)" as any,
                        }}
                      >
                        {displaySublabel}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
            <InlineTip>
              {cms.tips.timeSlot}
            </InlineTip>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══ FLOUR CHIP GRID (simple, used by special flours) ═══ */
function FlourChipGrid({
  options,
  activeFlours,
  recentFlours,
  onToggle,
  cms,
}: {
  options: FlourOption[];
  activeFlours: string[];
  recentFlours: string[];
  onToggle: (id: string) => void;
  cms: any;
}) {
  return (
    <div className="flex flex-wrap justify-center lg:justify-start gap-2">
      {options.map((f) => (
        <FlourChip
          key={f.id}
          flour={f}
          active={activeFlours.includes(f.id)}
          isRecent={!activeFlours.includes(f.id) && recentFlours.includes(f.id)}
          onToggle={onToggle}
          cms={cms}
        />
      ))}
    </div>
  );
}

function FlourChip({
  flour,
  active,
  isRecent,
  onToggle,
  cms,
}: {
  flour: FlourOption;
  active: boolean;
  isRecent: boolean;
  onToggle: (id: string) => void;
  cms: any;
}) {
  return (
    <motion.button
      onClick={() => onToggle(flour.id)}
      className="relative flex flex-col items-start px-3.5 py-2.5 rounded-xl transition-all text-left active:scale-95"
      style={{
        background: active ? "var(--chip-bg-active)" : "var(--chip-bg)",
        color: active ? "var(--chip-text-active)" : "var(--chip-text)",
        border: active
          ? "1px solid rgba(0,0,0,0)"
          : isRecent
            ? "1px solid var(--needs-pantry-border-active)"
            : "1px solid var(--chip-border)",
        minWidth: 100,
      }}
    >
      {isRecent && (
        <div
          className="absolute -top-1.5 right-2 px-1.5 py-0.5 rounded-full"
          style={{
            background: "var(--needs-pantry-accent)",
            fontSize: "var(--font-size-xs)",
            fontWeight: "var(--weight-bold)" as any,
            color: "var(--overlay-text)",
            letterSpacing: "var(--tracking-spread)",
            lineHeight: "var(--leading-none)",
          }}
        >
          {cms.ui.badgeRecent}
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
            fontSize: "var(--font-size-lg)",
            fontWeight: "var(--weight-semibold)" as any,
          }}
        >
          {cms.flourLabels[flour.id] ?? flour.name}
        </span>
      </div>
      <span
        className="type-numeric"
        style={{
          fontSize: "var(--font-size-sm)",
          opacity: 0.65,
          marginTop: 2,
        }}
      >
        {cms.flourDetails[flour.id] ?? flour.detail}
      </span>
      {flour.branded && flour.producer && (
        <span
          style={{
            fontSize: "var(--font-size-2xs)",
            opacity: 0.4,
            marginTop: 1,
            letterSpacing: "0.06em",
            textTransform: "uppercase" as const,
          }}
        >
          {flour.producer}
        </span>
      )}
      <span
        className="type-numeric"
        style={{
          fontSize: "var(--font-size-xs)",
          opacity: 0.45,
          marginTop: 1,
          letterSpacing: "0.04em",
          fontFeatureSettings: "'tnum'",
        }}
      >
        {flour.w}
      </span>
    </motion.button>
  );
}

/* ═══ BRANDED FLOURS SECTION ═══ */
function BrandedFloursSection({
  options,
  activeFlours,
  recentFlours,
  onToggle,
  cms,
  labelOverride,
}: {
  options: FlourOption[];
  activeFlours: string[];
  recentFlours: string[];
  onToggle: (id: string) => void;
  cms: any;
  labelOverride?: string;
}) {
  const [expanded, setExpanded] = React.useState(
    () => options.some((f) => activeFlours.includes(f.id)),
  );
  const activeBrandedCount = options.filter((f) => activeFlours.includes(f.id)).length;

  return (
    <div className="mt-3">
      <motion.button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 active:scale-95 transition-transform"
        style={{ fontSize: "var(--font-size-md)", color: "var(--text-muted)" }}
      >
        <motion.span
          animate={{ rotate: expanded ? 90 : 0 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          style={{ display: "inline-flex" }}
        >
          <ChevronRight size={14} />
        </motion.span>
        <span style={{ fontWeight: "var(--weight-semibold)" as any }}>
          {labelOverride ?? cms.ui?.brandedFlours ?? "Farine di marca"}
        </span>
        {activeBrandedCount > 0 && (
          <span
            className="px-1.5 py-0.5 rounded-full"
            style={{
              fontSize: "var(--font-size-xs)",
              background: "var(--chip-bg-active)",
              color: "var(--chip-text-active)",
              fontFeatureSettings: "'tnum'",
            }}
          >
            {activeBrandedCount}
          </span>
        )}
      </motion.button>
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="overflow-hidden"
          >
            <div className="mt-2">
              <FlourChipGrid
                options={options}
                activeFlours={activeFlours}
                recentFlours={recentFlours}
                onToggle={onToggle}
                cms={cms}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}