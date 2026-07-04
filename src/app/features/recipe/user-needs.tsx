import {
CalendarDays,
Check,
ChefHat,
ChevronRight,
Clock,
CloudSun,
CookingPot,
Flame,
FlaskConical,
HelpCircle,
Home,
MapPin,
Minus,
Moon,
Package,
Plus,
Sun,Sunset,
Thermometer,
Timer,
Wheat,
Zap
} from "lucide-react";
import { AnimatePresence,motion } from "motion/react";
import React,{ useEffect,useMemo,useState } from "react";
import { Chip } from "../../components/ds/index";
import { useCms } from "../cms/cms-context";
import { createFormatter,formatTemperatureCopy,t } from "../cms/i18n";
import {
DEFAULT_KITCHEN_TEMP,
generateTimeSlots,
NO_PREFERENCE_SLOT,
outdoorToKitchenTemp,
OVEN_PRESETS,
type OvenType,
SKILL_LEVELS,
type TimeSlot,
type UserConstraints,
} from "../../domain/pizza-engine";

interface UserNeedsProps {
  constraints: UserConstraints;
  onConstraintsChange: (c: UserConstraints) => void;
  selectedTimeSlot: string | null;
  onTimeSlotChange: (slot: TimeSlot) => void;
  hero?: React.ReactNode;
  hideTimeSlots?: boolean;
  compact?: boolean;
  showWeather?: boolean;
  activeTab?: SettingsTab | null;
  onActiveTabChange?: (tab: SettingsTab | null) => void;
  /** Quando i tempi sono nascosti (step stili), il chip "Quando" nella barra
   *  parametri richiama questa callback per tornare a cambiare la tempistica. */
  onChangeTime?: () => void;
}

export type SettingsTab = "cucina" | "pantry" | "tu";

/* ═══ TIME-OF-DAY COLORS (VPL-065: extended for dynamic slots) ═══ */
const TIME_COLORS: Record<
  string,
  { bg: string; text: string }
> = {
  tonight: { bg: "var(--time-tonight)", text: "var(--overlay-text)" },
  tomorrow_lunch: { bg: "var(--time-lunch)", text: "var(--overlay-text)" },
  tomorrow_dinner: {
    bg: "var(--time-dinner)",
    text: "var(--overlay-text)",
  },
  day_after: { bg: "var(--time-dayafter)", text: "var(--overlay-text)" },
  day_after_lunch: { bg: "var(--time-dayafter)", text: "var(--overlay-text)" },
  long_ferment: { bg: "var(--time-weekend)", text: "var(--overlay-text)" },
  no_preference: { bg: "var(--secondary)", text: "var(--overlay-text)" },
};

function getTimeColors(slotId?: string | null) {
  return slotId ? TIME_COLORS[slotId] ?? TIME_COLORS.no_preference : TIME_COLORS.no_preference;
}

const TIME_ICONS: Record<
  string,
  React.ComponentType<any>
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
  React.ComponentType<any>
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

/* Chip T4 — vedi docs/design-system-tiers.md F2-2 */

function SectionHeader({
  title,
  subtitle,
  icon,
  compact = false,
}: {
  title: string;
  subtitle: string;
  icon?: React.ReactNode;
  compact?: boolean;
}) {
  return (
    <div className="flex flex-col items-center lg:items-start gap-0.5">
      <div className="flex items-center gap-2.5">
        {icon}
        <h3 style={{ fontSize: compact ? "var(--font-size-xl)" : "var(--font-size-3xl)" }}>{title}</h3>
      </div>
      <span
        className="font-serif italic"
        style={{
          color: "var(--text-muted)",
          fontSize: compact ? "var(--font-size-md)" : "var(--font-size-lg)",
          opacity: 0.7,
        }}
      >
        {subtitle}
      </span>
    </div>
  );
}

/* ═══ MAIN EXPORT ═══ */
interface SettingsSummaryBarProps {
  activeTab: SettingsTab | null;
  onTabSelect: (tab: SettingsTab | null) => void;
  constraints: UserConstraints;
  kitchenTemp: number;
  cms: any;
  /** Tempistica scelta — mostrata come chip accentato "atterrato" dalla scelta. */
  selectedTimeLabel?: string | null;
  selectedTimeSlotId?: string | null;
  timeActive?: boolean;
  /** Click sul chip "Quando" → torna a cambiare la tempistica. */
  onChangeTime?: () => void;
  /** Microcopy sotto i chip. Solo al primo incontro (step 1): allo step
   *  successivo il sottotitolo di pagina dice già la stessa cosa. */
  showHelp?: boolean;
}

function SettingsSummaryBar({
  activeTab,
  onTabSelect,
  constraints,
  kitchenTemp,
  cms,
  selectedTimeLabel,
  selectedTimeSlotId,
  timeActive = false,
  onChangeTime,
  showHelp = true,
}: SettingsSummaryBarProps) {
  /* R10: la chip rappresenta la cucina nel suo insieme, non solo il forno.
     Label "La tua cucina"; il tipo di forno e la temperatura vivono nel drawer. */
  const cucinaText = cms.ui?.kitchenTitle ?? "La tua cucina";

  const count = constraints.pantry_flours.length + constraints.pantry_yeasts.length;
  const pantryText = count > 0 ? `Dispensa (${count})` : "Dispensa";

  const SKILL_NAMES: Record<number, string> = { 1: "Principiante", 2: "Intermedio", 3: "Esperto" };
  const skillLabel = cms.skillLevels[String(constraints.skill_level)]?.name ?? SKILL_NAMES[constraints.skill_level] ?? `Skill ${constraints.skill_level}`;
  const tuText = skillLabel;

  const tabs = [
    { id: 'cucina' as const, text: cucinaText, icon: CookingPot },
    { id: 'pantry' as const, text: pantryText, icon: Package },
    { id: 'tu' as const, text: tuText, icon: ChefHat },
  ];
  const timeColors = getTimeColors(selectedTimeSlotId);

  return (
    <div className="flex flex-col items-center gap-2 w-full">
    <div className="flex flex-wrap gap-1.5 w-full justify-center">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            onClick={() => onTabSelect(isActive ? null : tab.id)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all active:scale-97"
            style={{
              background: isActive
                ? "var(--chip-bg-active)"
                : "color-mix(in srgb, var(--chip-bg) 60%, transparent)",
              color: isActive
                ? "var(--chip-text-active)"
                : "var(--text-muted)",
              border: isActive
                ? "1px solid transparent"
                : "1px solid var(--chip-border)",
              boxShadow: isActive ? "var(--shadow-glow), var(--shadow-sm)" : "none",
              fontSize: "var(--font-size-sm)",
              fontWeight: "var(--weight-semibold)" as any,
            }}
          >
            <Icon size={13} style={{ opacity: isActive ? 1 : 0.55 }} />
            <span>{tab.text}</span>
          </button>
        );
      })}

      {/* Chip "Quando" — "atterra" qui salendo dalle card scelte poco sotto:
          ingresso da sotto con overshoot + un pulse di glow una tantum che
          guida l'occhio sul punto in cui la scelta si è posata. */}
      <AnimatePresence>
        {selectedTimeLabel && (
          <motion.button
            key="quando-chip"
            layout
            initial={{ opacity: 0, y: 22, scale: 0.5 }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
              boxShadow: [
                `0 0 0 0 color-mix(in srgb, ${timeColors.bg} 55%, transparent)`,
                `0 0 0 10px color-mix(in srgb, ${timeColors.bg} 0%, transparent)`,
              ],
            }}
            exit={{ opacity: 0, scale: 0.6, transition: { duration: 0.15 } }}
            transition={{
              default: { type: "spring", stiffness: 460, damping: 20 },
              boxShadow: { duration: 0.7, ease: "easeOut", delay: 0.1 },
            }}
            onClick={onChangeTime}
            aria-pressed={timeActive}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full active:scale-97"
            style={{
              background: timeColors.bg,
              color: timeColors.text,
              border: "1px solid transparent",
              outline: timeActive
                ? `2px solid color-mix(in srgb, ${timeColors.bg} 35%, transparent)`
                : "none",
              outlineOffset: 2,
              fontSize: "var(--font-size-sm)",
              fontWeight: "var(--weight-semibold)" as any,
            }}
            title={cms.misc.changeTiming}
          >
            <Clock size={13} />
            <span>{selectedTimeLabel}</span>
          </motion.button>
        )}
      </AnimatePresence>
    </div>

      {/* VPL-C1: microcopy — spiega a cosa servono questi dati */}
      {showHelp && (
        <p
          className="text-center"
          style={{
            color: "var(--text-muted)",
            fontSize: "var(--font-size-xs)",
            lineHeight: "var(--leading-normal)",
            opacity: 0.85,
            margin: 0,
          }}
        >
          {cms.misc.settingsHelp}
        </p>
      )}
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
  hideTimeSlots = false,
  compact = false,
  showWeather = true,
  activeTab: controlledActiveTab,
  onActiveTabChange,
  onChangeTime,
}: UserNeedsProps) {
  const { cms, bcp47 } = useCms();
  const fmt = createFormatter(cms.ui, bcp47);
  const update = (
    key: keyof UserConstraints,
    value: unknown,
  ) => {
    onConstraintsChange({ ...constraints, [key]: value });
  };

  const suggestedSlot = useMemo(() => getSuggestedSlot(), []);
  /* VPL-065: dynamic time slots based on current time */
  const dynamicSlots = useMemo(() => [...generateTimeSlots(), NO_PREFERENCE_SLOT], []);
  /* Label della tempistica scelta — alimenta il chip "Quando" nella barra. */
  const selectedTimeLabel = useMemo(() => {
    if (!selectedTimeSlot) return null;
    const slot = dynamicSlots.find((s) => s.id === selectedTimeSlot);
    return cms.timeSlots[selectedTimeSlot]?.label ?? slot?.label ?? null;
  }, [selectedTimeSlot, dynamicSlots, cms.timeSlots]);
  const weather = useLocationWeather();

  const [kitchenTempManual, setKitchenTempManual] =
    useState(false);
  const [kitchenTemp, setKitchenTemp] = useState(
    constraints.kitchen_temp_c ?? weather.data?.kitchenTemp ?? DEFAULT_KITCHEN_TEMP,
  );

  useEffect(() => {
    if (weather.data && !kitchenTempManual && !compact)
      setKitchenTemp(weather.data.kitchenTemp);
  }, [weather.data, kitchenTempManual, compact]);

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

  const [internalActiveTab, setInternalActiveTab] = useState<SettingsTab | null>(null);
  const activeTab =
    controlledActiveTab !== undefined ? controlledActiveTab : internalActiveTab;
  const setActiveTab = onActiveTabChange ?? setInternalActiveTab;
  const [showTempTip, setShowTempTip] = useState(false);
  const drawerClassName = compact
    ? "overflow-hidden mt-2 w-full rounded-xl p-3 sm:p-3.5"
    : "overflow-hidden mt-3 rounded-2xl p-5";
  const drawerStyle: React.CSSProperties = {
    background: "var(--surface-container)",
    border: "1px solid var(--outline-variant)",
  };
  const drawerTransition = {
    type: "spring" as const,
    stiffness: 400,
    damping: compact ? 30 : 25,
  };

  return (
    <div className="flex flex-col">
      {/* ═══ VPL-068: Single continuous flow ═══ */}
      <div
        data-section="context"
        className={compact ? "pt-0 pb-0" : "pt-20 sm:pt-24 pb-6"}
      >
        <div className={compact ? "flex flex-col gap-4" : "flex flex-col gap-7 sm:gap-9"}>
          {/* ═══ PRIMA COSA: parametri cucina/dispensa/tu ═══
              Minimal e in cima, come estensione del pulsante Profilo: chi sei e
              cosa hai. Il meteo (se disponibile) li precede, sottilissimo. */}
          <div className="flex flex-col w-full items-center gap-2">
            {showWeather && weather.data.city && (
              <div className="flex items-center gap-2">
                <MapPin size={11} className="flex-shrink-0" style={{ color: "var(--icon-muted)", opacity: 0.45 }} />
                <span className="type-body-xs" style={{ color: "var(--text-muted)", opacity: 0.65 }}>
                  {weather.data.city}
                </span>
                <span style={{ opacity: 0.15, color: "var(--text-muted)" }}>·</span>
                <CloudSun size={11} style={{ color: "var(--icon-muted)", opacity: 0.45 }} />
                <span className="type-body-xs" style={{ color: "var(--text-muted)", opacity: 0.65 }}>
                  {formatTemperatureCopy(t(cms.ui.weatherOutdoor, { t: weather.data.temp }), fmt)}
                </span>
              </div>
            )}
            <SettingsSummaryBar
              activeTab={activeTab}
              onTabSelect={setActiveTab}
              constraints={constraints}
              kitchenTemp={kitchenTemp}
              cms={cms}
              selectedTimeLabel={selectedTimeLabel}
              selectedTimeSlotId={selectedTimeSlot}
              timeActive={compact && !hideTimeSlots}
              onChangeTime={onChangeTime}
              showHelp={!compact}
            />

            <AnimatePresence mode="wait">
              {activeTab === 'cucina' && (
                <motion.div
                  key="cucina"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={drawerTransition}
                  className={drawerClassName}
                  style={drawerStyle}
                >
                  <div className={compact ? "flex flex-col gap-4" : "flex flex-col gap-6"}>
                    {/* Kitchen Temperature */}
                    <div>
                      <SectionHeader
                        title={cms.misc.kitchenTempLabel}
                        subtitle={cms.misc.kitchenTempSubtitle}
                        compact={compact}
                      />
                      <div className="flex items-center gap-3 mt-3">
                        <Thermometer size={16} style={{ color: "var(--needs-pantry-accent)" }} />
                        <button
                          onClick={() => { setKitchenTempManual(true); setKitchenTemp((prev) => Math.max(10, prev - 1)); }}
                          className="w-8 h-8 rounded-lg flex items-center justify-center active:scale-88 transition-transform text-lg"
                          style={{ background: "var(--needs-oven-bg)", border: "1px solid var(--needs-oven-border)" }}
                          aria-label={cms.misc.kitchenTempDown}
                        >
                          <Minus size={14} />
                        </button>
                        <span className="type-numeric text-xl font-bold min-w-[50px] text-center" style={{ color: "var(--needs-pantry-accent)" }}>
                          {kitchenTemp}°C
                        </span>
                        <button
                          onClick={() => { setKitchenTempManual(true); setKitchenTemp((prev) => Math.min(40, prev + 1)); }}
                          className="w-8 h-8 rounded-lg flex items-center justify-center active:scale-88 transition-transform text-lg"
                          style={{ background: "var(--needs-oven-bg)", border: "1px solid var(--needs-oven-border)" }}
                          aria-label={cms.misc.kitchenTempUp}
                        >
                          <Plus size={14} />
                        </button>
                        {kitchenTempManual && (
                          <motion.button
                            initial={{ opacity: 0, x: -4 }}
                            animate={{ opacity: 1, x: 0 }}
                            onClick={() => { setKitchenTempManual(false); setKitchenTemp(weather.data.kitchenTemp); }}
                            className="ml-2 px-3 py-1 rounded bg-accent/10 text-accent text-sm font-semibold active:scale-95 transition-transform"
                          >
                            {cms.ui.autoLabel}
                          </motion.button>
                        )}
                        <button onClick={() => setShowTempTip(!showTempTip)} className="ml-auto active:scale-90 transition-transform">
                          <HelpCircle size={16} style={{ color: "var(--icon-muted)", opacity: showTempTip ? 0.8 : 0.3 }} />
                        </button>
                      </div>
                      <AnimatePresence>
                        {showTempTip && (
                          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden mt-2">
                            <InlineTip>{cms.tips.kitchenTemp}</InlineTip>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* ── Divider ── */}
                    <div style={{ height: 1, background: "var(--outline-variant)", opacity: 0.5 }} />

                    {/* Oven Preset */}
                    <div>
                      <SectionHeader title={cms.sections.oven.title} subtitle={ovenSet ? cms.ui.editOven : cms.sections.oven.description} compact={compact} />
                      <div className={compact ? "grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2" : "grid grid-cols-2 sm:grid-cols-3 gap-2.5 mt-3"}>
                        {OVEN_PRESETS.map((preset) => {
                          const active = constraints.oven_type === preset.id;
                          const Icon = OVEN_ICONS[preset.id] || Thermometer;
                          const cmsOven = cms.ovenPresets[preset.id];
                          const displayName = cmsOven?.name ?? preset.name;
                          return (
                            <motion.button
                              key={preset.id}
                              onClick={() => handleOvenSelect(preset.id, preset.maxTemp)}
                              className={compact ? "flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all text-left active:scale-96" : "flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all text-left active:scale-96"}
                              style={{
                                background: active ? "var(--chip-bg-active)" : "var(--chip-bg)",
                                color: active ? "var(--chip-text-active)" : "var(--chip-text)",
                                boxShadow: active ? "var(--shadow-glow), var(--shadow-md)" : "none",
                                border: active ? "1px solid transparent" : "1px solid var(--chip-border)"
                              }}
                            >
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

                    {/* ── Divider ── */}
                    <div style={{ height: 1, background: "var(--outline-variant)", opacity: 0.5 }} />

                    {/* Equipment */}
                    <div>
                      <SectionHeader title={cms.sections.equipment.title} subtitle={cms.sections.equipment.description} compact={compact} />
                      <div className={compact ? "flex flex-col gap-3 mt-2" : "flex flex-col gap-4 mt-3"}>
                        {/* Impastamento */}
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="type-data-sm" style={{ color: "var(--text-muted)", letterSpacing: "0.06em", textTransform: "uppercase" as any }}>{cms.ui.equipKneading}</span>
                          </div>
                          <div className="flex flex-wrap justify-center lg:justify-start gap-2">
                            <Chip label={cms.ui.equipByHand} active={!constraints.has_mixer} onToggle={() => update("has_mixer", false)} />
                            <Chip label={cms.ui.equipMixer} active={constraints.has_mixer} onToggle={() => update("has_mixer", true)} />
                          </div>
                        </div>
                        {/* Superficie cottura */}
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="type-data-sm" style={{ color: "var(--text-muted)", letterSpacing: "0.06em", textTransform: "uppercase" as any }}>{cms.ui.equipSurface}</span>
                          </div>
                          <div className="flex flex-wrap justify-center lg:justify-start gap-2">
                            <Chip label={cms.ui.equipStone} active={constraints.has_pizza_stone} onToggle={() => update("has_pizza_stone", !constraints.has_pizza_stone)} />
                            <Chip label={cms.ui.equipSteel} active={constraints.has_pizza_steel} onToggle={() => update("has_pizza_steel", !constraints.has_pizza_steel)} />
                            <Chip label={cms.ui.equipPan} active={constraints.has_baking_pan} onToggle={() => update("has_baking_pan", !constraints.has_baking_pan)} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'pantry' && (
                <motion.div
                  key="pantry"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={drawerTransition}
                  className={drawerClassName}
                  style={drawerStyle}
                >
                  <div className={compact ? "flex flex-col gap-4" : "flex flex-col gap-6"}>
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
                            <motion.button key={y.id} onClick={() => toggleYeast(y.id)} className="relative flex flex-col items-start gap-0.5 px-4 py-2.5 rounded-xl transition-all active:scale-95" style={{ background: active ? "var(--chip-bg-active)" : "var(--chip-bg)", color: active ? "var(--chip-text-active)" : "var(--chip-text)", border: active ? "1px solid transparent" : isRecent ? "1px solid var(--needs-pantry-border-active)" : "1px solid var(--chip-border)", fontSize: "var(--font-size-lg)" }}>
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

              {activeTab === 'tu' && (
                <motion.div
                  key="tu"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={drawerTransition}
                  className={drawerClassName}
                  style={drawerStyle}
                >
                  <div>
                    <SectionHeader title={cms.sections.skill.title} subtitle={cms.sections.skill.description} compact={compact} />
                    <div className={compact ? "flex flex-wrap justify-center lg:justify-start gap-2 mt-2" : "flex flex-wrap justify-center lg:justify-start gap-2 mt-3"}>
                      {SKILL_LEVELS.map((sl) => {
                        const cmsSkill = cms.skillLevels[String(sl.level)];
                        return (<Chip key={sl.level} label={cmsSkill?.name ?? sl.name} active={constraints.skill_level === sl.level} onToggle={() => update("skill_level", sl.level)} />);
                      })}
                    </div>
                  </div>
                </motion.div>
              )}

              {compact && !hideTimeSlots && (
                <motion.div
                  key="time"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={drawerTransition}
                  className={drawerClassName}
                  style={drawerStyle}
                >
                  <TimeSlotPicker
                    slots={dynamicSlots}
                    suggestedSlot={suggestedSlot}
                    selectedTimeSlot={selectedTimeSlot}
                    onTimeSlotChange={onTimeSlotChange}
                    cms={cms}
                    compact
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ═══ LOGO ANIMATO + TITOLO ═══ (hero passato dal genitore) */}
          {hero && <div>{hero}</div>}

          {!compact && !hideTimeSlots && (
            <>
              {/* When — niente titolone: il sottotitolo dell'hero ("Seleziona il
                  momento...") è già l'istruzione. Le card SONO l'azione. */}
              <TimeSlotPicker
                slots={dynamicSlots}
                suggestedSlot={suggestedSlot}
                selectedTimeSlot={selectedTimeSlot}
                onTimeSlotChange={onTimeSlotChange}
                cms={cms}
              />
              <InlineTip>
                {cms.tips.timeSlot}
              </InlineTip>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function TimeSlotPicker({
  slots,
  suggestedSlot,
  selectedTimeSlot,
  onTimeSlotChange,
  cms,
  compact = false,
}: {
  slots: TimeSlot[];
  suggestedSlot: string;
  selectedTimeSlot: string | null;
  onTimeSlotChange: (slot: TimeSlot) => void;
  cms: any;
  compact?: boolean;
}) {
  return (
    <div>
      <div
        className={
          compact
            ? "flex flex-col gap-2 w-full sm:hidden"
            : "flex flex-col gap-3 w-full mt-4 sm:hidden"
        }
      >
        {slots.map((slot) => {
          const active = selectedTimeSlot === slot.id;
          const suggested = slot.id === suggestedSlot && !selectedTimeSlot;
          const Icon = TIME_ICONS[slot.id] || Moon;
          const colors = getTimeColors(slot.id);
          const cmsSlot = cms.timeSlots[slot.id];
          const displayLabel = cmsSlot?.label ?? slot.label;
          const displaySublabel = cmsSlot?.sublabel ?? slot.sublabel;
          return (
            <button
              key={slot.id}
              onClick={() => onTimeSlotChange(slot)}
              className={
                compact
                  ? "relative flex items-center justify-between px-3 py-2.5 rounded-xl transition-all active:scale-98 text-left w-full"
                  : "relative flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all active:scale-98 text-left w-full"
              }
              style={{
                background: active
                  ? `linear-gradient(155deg, ${colors.bg}, color-mix(in srgb, ${colors.bg} 75%, var(--overlay-backdrop)))`
                  : "var(--surface-container-low, var(--chip-bg))",
                color: active ? colors.text : "var(--text-default)",
                border: active
                  ? "1px solid transparent"
                  : `1px solid color-mix(in srgb, ${colors.bg} 22%, var(--chip-border))`,
                boxShadow: active
                  ? `0 ${compact ? 8 : 12}px ${compact ? 18 : 28}px color-mix(in srgb, ${colors.bg} 40%, transparent)`
                  : "none",
              }}
            >
              <div className={compact ? "flex items-center gap-2.5" : "flex items-center gap-3.5"}>
                <div
                  className={
                    compact
                      ? "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                      : "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  }
                  style={{
                    background: active
                      ? "color-mix(in srgb, var(--overlay-text) 18%, transparent)"
                      : `color-mix(in srgb, ${colors.bg} 14%, transparent)`,
                    color: active ? colors.text : colors.bg,
                  }}
                >
                  <Icon size={compact ? 15 : 18} />
                </div>
                <div className="flex flex-col">
                  <span
                    style={{
                      fontSize: compact ? "var(--font-size-md)" : "var(--font-size-lg)",
                      fontWeight: "var(--weight-semibold)" as any,
                      lineHeight: 1.2,
                    }}
                  >
                    {displayLabel}
                  </span>
                  <span
                    className="type-numeric"
                    style={{
                      fontSize: compact ? "var(--font-size-sm)" : "var(--font-size-base)",
                      opacity: active ? 0.8 : 0.5,
                      marginTop: 2,
                    }}
                  >
                    {displaySublabel}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {suggested && (
                  <span
                    className="px-2 py-0.5 rounded-full"
                    style={{
                      background: active
                        ? "color-mix(in srgb, var(--overlay-text) 20%, transparent)"
                        : colors.bg,
                      color: "var(--overlay-text)",
                      fontSize: "10px",
                      fontWeight: "var(--weight-bold)" as any,
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    {cms.ui.badgeIdeal}
                  </span>
                )}
                {active && (
                  <span
                    className="px-2 py-0.5 rounded-full text-2xs flex-shrink-0"
                    style={{
                      background: "color-mix(in srgb, var(--overlay-text) 25%, transparent)",
                      color: "var(--overlay-text)",
                      fontWeight: "var(--weight-bold)" as any,
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      border: "1px solid color-mix(in srgb, var(--overlay-text) 40%, transparent)",
                    }}
                  >
                    {cms.misc.current}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      <div
        className={
          compact
            ? "hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-2 w-full"
            : "hidden sm:grid sm:grid-cols-5 gap-3 w-full mt-4"
        }
      >
        {slots.map((slot) => {
          const active = selectedTimeSlot === slot.id;
          const suggested = slot.id === suggestedSlot && !selectedTimeSlot;
          const Icon = TIME_ICONS[slot.id] || Moon;
          const colors = getTimeColors(slot.id);
          const cmsSlot = cms.timeSlots[slot.id];
          const displayLabel = cmsSlot?.label ?? slot.label;
          const displaySublabel = cmsSlot?.sublabel ?? slot.sublabel;
          return (
            <motion.button
              key={slot.id}
              onClick={() => onTimeSlotChange(slot)}
              whileHover={{ y: compact ? -2 : -4 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: "spring", stiffness: 400, damping: 26 }}
              className={
                compact
                  ? "relative flex items-center text-left px-3 py-2.5 rounded-xl w-full gap-2.5 overflow-hidden"
                  : "relative flex flex-col items-center text-center px-3 py-6 rounded-2xl w-full gap-3 overflow-hidden"
              }
              style={{
                background: active
                  ? `linear-gradient(155deg, ${colors.bg}, color-mix(in srgb, ${colors.bg} 75%, var(--overlay-backdrop)))`
                  : "var(--surface-container-low, var(--chip-bg))",
                color: active ? colors.text : "var(--text-default)",
                border: active
                  ? "1px solid transparent"
                  : `1px solid color-mix(in srgb, ${colors.bg} 22%, var(--chip-border))`,
                boxShadow: active
                  ? `0 ${compact ? 8 : 14}px ${compact ? 18 : 32}px color-mix(in srgb, ${colors.bg} 42%, transparent)`
                  : "none",
                transition: "background 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease",
              }}
            >
              {!active && (
                <span
                  aria-hidden="true"
                  style={{
                    position: "absolute",
                    top: compact ? -44 : -34,
                    left: "50%",
                    width: compact ? 100 : 130,
                    height: compact ? 100 : 130,
                    marginLeft: compact ? -50 : -65,
                    borderRadius: "50%",
                    background: colors.bg,
                    opacity: compact ? 0.1 : 0.12,
                    filter: "blur(26px)",
                    pointerEvents: "none",
                  }}
                />
              )}
              {suggested && !compact && (
                <div className="absolute top-2 inset-x-0 flex justify-center z-10">
                  <span
                    className="px-2 py-0.5 rounded-full text-2xs"
                    style={{
                      background: colors.bg,
                      color: "var(--overlay-text)",
                      fontWeight: "var(--weight-bold)" as any,
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      boxShadow: `0 2px 8px color-mix(in srgb, ${colors.bg} 45%, transparent)`,
                    }}
                  >
                    {cms.ui.badgeIdeal}
                  </span>
                </div>
              )}
              <div
                className={
                  compact
                    ? "w-8 h-8 rounded-xl flex items-center justify-center relative flex-shrink-0"
                    : "w-12 h-12 rounded-2xl flex items-center justify-center relative"
                }
                style={{
                  background: active
                    ? "color-mix(in srgb, var(--overlay-text) 18%, transparent)"
                    : `color-mix(in srgb, ${colors.bg} 14%, transparent)`,
                  color: active ? colors.text : colors.bg,
                }}
              >
                <Icon size={compact ? 16 : 20} />
              </div>
              <div className={compact ? "flex flex-col items-start relative min-w-0" : "flex flex-col items-center relative"}>
                <span
                  style={{
                    fontSize: compact ? "var(--font-size-md)" : "var(--font-size-lg)",
                    fontWeight: "var(--weight-semibold)" as any,
                    lineHeight: 1.2,
                    /* Griglia: le label variano tra 1 e 2 righe ("Tonight" vs
                       "Tomorrow at lunch"); riservare sempre 2 righe allinea
                       i sottotitoli orari sulla stessa baseline in tutte le card. */
                    ...(compact
                      ? {}
                      : {
                          minHeight: "2.4em",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }),
                  }}
                >
                  {displayLabel}
                </span>
                <span
                  className="type-numeric"
                  style={{
                    fontSize: compact ? "var(--font-size-sm)" : "var(--font-size-base)",
                    opacity: active ? 0.85 : 0.5,
                    marginTop: compact ? 1 : 4,
                  }}
                >
                  {displaySublabel}
                </span>
              </div>

              {active && (
                <div className={compact ? "absolute top-2 right-2" : "absolute top-2.5 right-2.5"}>
                  <span
                    className="px-2 py-0.5 rounded-full text-2xs"
                    style={{
                      background: "color-mix(in srgb, var(--overlay-text) 25%, transparent)",
                      color: "var(--overlay-text)",
                      fontWeight: "var(--weight-bold)" as any,
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      border: "1px solid color-mix(in srgb, var(--overlay-text) 40%, transparent)",
                    }}
                  >
                    {cms.misc.current}
                  </span>
                </div>
              )}
            </motion.button>
          );
        })}
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
          ? "1px solid transparent"
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
