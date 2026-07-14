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
import { motionDelay,motionDuration,motionEase,motionSpring,motionTiming } from "../../components/ds/motion";
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
import { uiMessage } from "../../i18n/ui-messages";

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
    name: uiMessage("features.recipe.user-needs.farina-00-06dc5ab2"),
    w: "W170–220",
    detail: uiMessage("features.recipe.user-needs.classica-versatile-21c9cc66"),
  },
  {
    id: "0",
    name: uiMessage("features.recipe.user-needs.farina-0-625e81ec"),
    w: "W220–260",
    detail: uiMessage("features.recipe.user-needs.media-forza-1dea8ed0"),
  },
  {
    id: "tipo_1",
    name: uiMessage("features.recipe.user-needs.farina-tipo-1-189a22b7"),
    w: "W220–280",
    detail: uiMessage("features.recipe.user-needs.rustica-profumo-di-cereale-766e58ac"),
  },
  {
    id: "manitoba",
    name: uiMessage("features.recipe.user-needs.manitoba-c1a38647"),
    w: "W340–380",
    detail: uiMessage("features.recipe.user-needs.alta-forza-lunga-maturazione-58db76ea"),
  },
  {
    id: "integrale",
    name: uiMessage("features.recipe.user-needs.integrale-596f723e"),
    w: "W200–260",
    detail: uiMessage("features.recipe.user-needs.piu-fibra-e-sapore-e0f02324"),
  },
  {
    id: "semola",
    name: uiMessage("features.recipe.user-needs.semola-rimacinata-8c3476b8"),
    w: "W220–280",
    detail: uiMessage("features.recipe.user-needs.croccantezza-colore-dorato-0119e353"),
  },
];

const FLOUR_OPTIONS_SPECIAL: FlourOption[] = [
  { id: "farro", name: uiMessage("features.recipe.user-needs.farina-di-farro-cba26b1c"), w: "W130–180", detail: uiMessage("features.recipe.user-needs.sapore-nocciolato-digeribile-7f620358") },
  { id: "spelta", name: uiMessage("features.recipe.user-needs.farina-di-spelta-145c7e5d"), w: "W150–200", detail: uiMessage("features.recipe.user-needs.grano-antico-aromatica-6b49eff1") },
  { id: "kamut", name: uiMessage("features.recipe.user-needs.farina-di-kamut-23160bf9"), w: "W200–260", detail: uiMessage("features.recipe.user-needs.khorasan-dolce-e-burrosa-1c0a0d60") },
  { id: "segale", name: uiMessage("features.recipe.user-needs.farina-di-segale-4d6ef95b"), w: "W80–150", detail: uiMessage("features.recipe.user-needs.sapore-intenso-bassa-glutine-b955d1cb") },
  { id: "riso", name: uiMessage("features.recipe.user-needs.farina-di-riso-1d5fb293"), w: "—", detail: uiMessage("features.recipe.user-needs.senza-glutine-croccantezza-c0379498") },
  { id: "mais", name: uiMessage("features.recipe.user-needs.farina-di-mais-41910105"), w: "—", detail: uiMessage("features.recipe.user-needs.senza-glutine-colore-dorato-83a2168b") },
  { id: "saraceno", name: uiMessage("features.recipe.user-needs.grano-saraceno-d1593536"), w: "—", detail: uiMessage("features.recipe.user-needs.senza-glutine-terroso-85af8327") },
  { id: "avena", name: uiMessage("features.recipe.user-needs.farina-di-avena-d11c4a10"), w: "W100–140", detail: uiMessage("features.recipe.user-needs.fibra-alta-morbidezza-348c80f9") },
  { id: "ceci", name: uiMessage("features.recipe.user-needs.farina-di-ceci-f7a159a1"), w: "—", detail: uiMessage("features.recipe.user-needs.proteica-sapore-deciso-6623765b") },
];

const YEAST_OPTIONS = [
  {
    id: "fresh",
    name: uiMessage("features.recipe.user-needs.lievito-fresco-f3a7cabd"),
    detail: uiMessage("features.recipe.user-needs.cubetto-classico-76ef5715"),
  },
  {
    id: "dry",
    name: uiMessage("features.recipe.user-needs.lievito-secco-0043f8c5"),
    detail: uiMessage("features.recipe.user-needs.pratico-lunga-conservazione-8c39549a"),
  },
  {
    id: "sourdough",
    name: uiMessage("features.recipe.user-needs.lievito-madre-180392fb"),
    detail: uiMessage("features.recipe.user-needs.sapore-complesso-lunga-maturazione-9d8ec002"),
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

/* suggested slot = the dynamic slot closest to the 24h fermentation sweet spot */
function getSuggestedSlot(): string {
  const slots = generateTimeSlots();
  if (slots.length === 0) return "tomorrow_lunch";
  let bestSlot = slots[0];
  let minDiff = Math.abs(slots[0].hours - 24);
  for (let i = 1; i < slots.length; i++) {
    const diff = Math.abs(slots[i].hours - 24);
    if (diff < minDiff) {
      minDiff = diff;
      bestSlot = slots[i];
    }
  }
  return bestSlot.id;
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
    <aside className="needs-inline-tip" role="note">
      <HelpCircle className="needs-inline-tip__icon" aria-hidden="true" />
      <span className="needs-inline-tip__copy">{children}</span>
    </aside>
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
    <div className={compact ? "needs-section-header needs-section-header--compact" : "needs-section-header"}>
      <div className="needs-section-header__row">
        {icon}
        <h3 className="needs-section-header__title">{title}</h3>
      </div>
      <span className="needs-section-header__subtitle">
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
    <div className="needs-summary">
    <div className="needs-summary__row">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            onClick={() => onTabSelect(isActive ? null : tab.id)}
            className={isActive ? "needs-summary__tab needs-summary__tab--active" : "needs-summary__tab"}
          >
            <Icon size={13} className="needs-summary__tab-icon" />
            <span data-slot="label">{tab.text}</span>
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
            exit={{ opacity: 0, scale: 0.6, transition: motionTiming.feedback }}
            transition={{
              default: motionSpring.emphaticMark,
              boxShadow: { duration: motionDuration.slow,ease: motionEase.exit,delay: motionDelay.medium },
            }}
            onClick={onChangeTime}
            aria-pressed={timeActive}
            className={timeActive ? "needs-summary__time-chip needs-summary__time-chip--active" : "needs-summary__time-chip"}
            style={{
              ["--needs-time-bg" as any]: timeColors.bg,
              ["--needs-time-text" as any]: timeColors.text,
            }}
            title={cms.misc.changeTiming}
          >
            <Clock size={13} />
            <span data-slot="label">{selectedTimeLabel}</span>
          </motion.button>
        )}
      </AnimatePresence>
    </div>

      {/* VPL-C1: microcopy — spiega a cosa servono questi dati */}
      {showHelp && (
        <p className="needs-summary__help">
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
  const drawerTransition = compact ? motionSpring.drawerCompact : motionSpring.drawerRegular;

  return (
    <div className="needs-root">
      {/* ═══ VPL-068: Single continuous flow ═══ */}
      <div
        data-section="context"
        className={compact ? "needs-context needs-context--compact" : "needs-context"}
      >
        <div
          data-region="create-flow"
          className={compact ? "needs-flow needs-flow--compact" : "needs-flow"}
        >
          {/* ═══ PRIMA COSA: parametri cucina/dispensa/tu ═══
              Minimal e in cima, come estensione del pulsante Profilo: chi sei e
              cosa hai. Il meteo (se disponibile) li precede, sottilissimo. */}
          <div data-region="setup" className="needs-setup">
            {showWeather && weather.data.city && (
              <div className="needs-weather">
                <MapPin size={11} className="needs-weather__icon" />
                <span className="type-body-xs needs-weather__text">
                  {weather.data.city}
                </span>
                <span className="needs-weather__sep">·</span>
                <CloudSun size={11} className="needs-weather__icon" />
                <span className="type-body-xs needs-weather__text">
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
                  className={compact ? "needs-drawer needs-drawer--compact" : "needs-drawer"}
                >
                  <div className={compact ? "needs-drawer__stack needs-drawer__stack--compact" : "needs-drawer__stack"}>
                    {/* Kitchen Temperature */}
                    <div data-slot="kitchen-temp">
                      <SectionHeader
                        title={cms.misc.kitchenTempLabel}
                        subtitle={cms.misc.kitchenTempSubtitle}
                        compact={compact}
                      />
                      <div className="needs-kitchen-temp__row">
                        <Thermometer size={16} className="needs-kitchen-temp__icon" />
                        <button
                          onClick={() => { setKitchenTempManual(true); setKitchenTemp((prev) => Math.max(10, prev - 1)); }}
                          className="needs-kitchen-temp__btn"
                          aria-label={cms.misc.kitchenTempDown}
                        >
                          <Minus size={14} />
                        </button>
                        <span className="type-numeric needs-kitchen-temp__value">
                          {kitchenTemp}°C
                        </span>
                        <button
                          onClick={() => { setKitchenTempManual(true); setKitchenTemp((prev) => Math.min(40, prev + 1)); }}
                          className="needs-kitchen-temp__btn"
                          aria-label={cms.misc.kitchenTempUp}
                        >
                          <Plus size={14} />
                        </button>
                        {kitchenTempManual && (
                          <motion.button
                            initial={{ opacity: 0, x: -4 }}
                            animate={{ opacity: 1, x: 0 }}
                            onClick={() => { setKitchenTempManual(false); setKitchenTemp(weather.data.kitchenTemp); }}
                            className="needs-kitchen-temp__auto"
                          >
                            {cms.ui.autoLabel}
                          </motion.button>
                        )}
                        <button onClick={() => setShowTempTip(!showTempTip)} className="needs-kitchen-temp__help">
                          <HelpCircle size={16} className={showTempTip ? "needs-kitchen-temp__help-icon needs-kitchen-temp__help-icon--active" : "needs-kitchen-temp__help-icon"} />
                        </button>
                      </div>
                      <AnimatePresence>
                        {showTempTip && (
                          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="needs-kitchen-temp__tip">
                            <InlineTip>{cms.tips.kitchenTemp}</InlineTip>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* ── Divider ── */}
                    <div className="needs-divider" />

                    {/* Oven Preset */}
                    <div data-slot="oven-preset">
                      <SectionHeader title={cms.sections.oven.title} subtitle={ovenSet ? cms.ui.editOven : cms.sections.oven.description} compact={compact} />
                      <div className={compact ? "needs-oven-grid needs-oven-grid--compact" : "needs-oven-grid"}>
                        {OVEN_PRESETS.map((preset) => {
                          const active = constraints.oven_type === preset.id;
                          const Icon = OVEN_ICONS[preset.id] || Thermometer;
                          const cmsOven = cms.ovenPresets[preset.id];
                          const displayName = cmsOven?.name ?? preset.name;
                          return (
                            <motion.button
                              key={preset.id}
                              onClick={() => handleOvenSelect(preset.id, preset.maxTemp)}
                              className={
                                active
                                  ? (compact ? "needs-oven-card needs-oven-card--compact needs-oven-card--active" : "needs-oven-card needs-oven-card--active")
                                  : (compact ? "needs-oven-card needs-oven-card--compact" : "needs-oven-card")
                              }
                            >
                              <Icon size={18} className={active ? "needs-oven-card__icon needs-oven-card__icon--active" : "needs-oven-card__icon"} />
                              <div data-slot="body">
                                <div className="needs-oven-card__name">{displayName}</div>
                                <div className="type-numeric needs-oven-card__temp">{preset.maxTemp}°C</div>
                              </div>
                            </motion.button>
                          );
                        })}
                      </div>
                    </div>

                    {/* ── Divider ── */}
                    <div className="needs-divider" />

                    {/* Equipment */}
                    <div data-slot="equipment">
                      <SectionHeader title={cms.sections.equipment.title} subtitle={cms.sections.equipment.description} compact={compact} />
                      <div className={compact ? "needs-equipment needs-equipment--compact" : "needs-equipment"}>
                        {/* Impastamento */}
                        <div data-slot="equipment-group">
                          <div className="needs-equipment__label-row">
                            <span className="type-data-sm needs-equipment__label">{cms.ui.equipKneading}</span>
                          </div>
                          <div className="needs-equipment__chips">
                            <Chip label={cms.ui.equipByHand} active={!constraints.has_mixer} onToggle={() => update("has_mixer", false)} />
                            <Chip label={cms.ui.equipMixer} active={constraints.has_mixer} onToggle={() => update("has_mixer", true)} />
                          </div>
                        </div>
                        {/* Superficie cottura */}
                        <div data-slot="equipment-group">
                          <div className="needs-equipment__label-row">
                            <span className="type-data-sm needs-equipment__label">{cms.ui.equipSurface}</span>
                          </div>
                          <div className="needs-equipment__chips">
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
                  className={compact ? "needs-drawer needs-drawer--compact" : "needs-drawer"}
                >
                  <div className={compact ? "needs-drawer__stack needs-drawer__stack--compact" : "needs-drawer__stack"}>
                    {/* Flours */}
                    <div data-slot="flours">
                      <div className="needs-pantry__group-header">
                        <Wheat size={14} className="needs-pantry__group-icon" />
                        <span className="needs-pantry__group-title">{cms.ui.pantryFlours}</span>
                      </div>
                      <FlourChipGrid options={FLOUR_OPTIONS_GENERIC} activeFlours={constraints.pantry_flours} recentFlours={recentFlours} onToggle={toggleFlour} cms={cms} />
                      <BrandedFloursSection options={FLOUR_OPTIONS_SPECIAL} activeFlours={constraints.pantry_flours} recentFlours={recentFlours} onToggle={toggleFlour} cms={cms} labelOverride={cms.ui.specialFlours} />
                    </div>
                    {/* Yeasts */}
                    <div data-slot="yeasts">
                      <div className="needs-pantry__group-header">
                        <FlaskConical size={14} className="needs-pantry__group-icon" />
                        <span className="needs-pantry__group-title">{cms.ui.pantryYeasts}</span>
                      </div>
                      <div className="needs-yeast-grid">
                        {YEAST_OPTIONS.map((y) => {
                          const active = constraints.pantry_yeasts.includes(y.id);
                          const isRecent = !active && recentYeasts.includes(y.id);
                          return (
                            <motion.button
                              key={y.id}
                              onClick={() => toggleYeast(y.id)}
                              className={
                                active
                                  ? "needs-yeast-chip needs-yeast-chip--active"
                                  : isRecent
                                    ? "needs-yeast-chip needs-yeast-chip--recent"
                                    : "needs-yeast-chip"
                              }
                            >
                              {isRecent && (<div className="needs-yeast-chip__badge">{cms.ui.badgeRecent}</div>)}
                              <div className="needs-yeast-chip__row">
                                <AnimatePresence>{active && (<motion.span initial={{ scale: 0, width: 0 }} animate={{ scale: 1, width: 14 }} exit={{ scale: 0, width: 0 }} transition={motionSpring.crisp}><Check size={14} /></motion.span>)}</AnimatePresence>
                                <span className="needs-yeast-chip__name">{cms.yeastLabels[y.id] ?? y.name}</span>
                              </div>
                              <span className="needs-yeast-chip__detail">{cms.yeastDetails[y.id] ?? y.detail}</span>
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
                  className={compact ? "needs-drawer needs-drawer--compact" : "needs-drawer"}
                >
                  <div data-slot="skill">
                    <SectionHeader title={cms.sections.skill.title} subtitle={cms.sections.skill.description} compact={compact} />
                    <div className={compact ? "needs-skill-chips needs-skill-chips--compact" : "needs-skill-chips"}>
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
                  className={compact ? "needs-drawer needs-drawer--compact" : "needs-drawer"}
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
          {hero && <div data-region="masthead">{hero}</div>}

          {!compact && !hideTimeSlots && (
            <>
              {/* When — niente titolone: il sottotitolo dell'hero ("Seleziona il
                  momento...") è già l'istruzione. Le card SONO l'azione. */}
              <div data-region="slots">
                <TimeSlotPicker
                  slots={dynamicSlots}
                  suggestedSlot={suggestedSlot}
                  selectedTimeSlot={selectedTimeSlot}
                  onTimeSlotChange={onTimeSlotChange}
                  cms={cms}
                />
              </div>
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
    <div className="needs-slot-picker">
      <div
        data-region="slot-list"
        className={compact ? "needs-slot-list needs-slot-list--compact" : "needs-slot-list"}
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
                (compact ? "needs-slot-list__item needs-slot-list__item--compact" : "needs-slot-list__item") +
                (active ? " needs-slot-list__item--active" : "")
              }
              style={{
                ["--needs-time-bg" as any]: colors.bg,
                ["--needs-time-text" as any]: colors.text,
              }}
            >
              <div className={compact ? "needs-slot-list__lead needs-slot-list__lead--compact" : "needs-slot-list__lead"}>
                <div
                  className={
                    (compact ? "needs-slot-list__icon-wrap needs-slot-list__icon-wrap--compact" : "needs-slot-list__icon-wrap") +
                    (active ? " needs-slot-list__icon-wrap--active" : "")
                  }
                >
                  <Icon size={compact ? 15 : 18} />
                </div>
                <div className="needs-slot-list__body">
                  <span className={compact ? "needs-slot-list__label needs-slot-list__label--compact" : "needs-slot-list__label"}>
                    {displayLabel}
                  </span>
                  <span
                    className={
                      "type-numeric needs-slot-list__sublabel" +
                      (compact ? " needs-slot-list__sublabel--compact" : "") +
                      (active ? " needs-slot-list__sublabel--active" : "")
                    }
                  >
                    {displaySublabel}
                  </span>
                </div>
              </div>

              <div className="needs-slot-list__badges">
                {suggested && (
                  <span className="needs-slot-list__badge needs-slot-list__badge--ideal">
                    {cms.ui.badgeIdeal}
                  </span>
                )}
                {active && (
                  <span className="needs-slot-list__badge needs-slot-list__badge--current">
                    {cms.misc.current}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      <div className={compact ? "needs-slot-grid needs-slot-grid--compact" : "needs-slot-grid"}>
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
              transition={motionSpring.statValue}
              className={
                (compact ? "needs-slot-grid__item needs-slot-grid__item--compact" : "needs-slot-grid__item") +
                (active ? " needs-slot-grid__item--active" : "")
              }
              style={{
                ["--needs-time-bg" as any]: colors.bg,
                ["--needs-time-text" as any]: colors.text,
              }}
            >
              {!active && (
                <span
                  aria-hidden="true"
                  className={compact ? "needs-slot-grid__glow needs-slot-grid__glow--compact" : "needs-slot-grid__glow"}
                />
              )}
              {suggested && !compact && (
                <div className="needs-slot-grid__ideal-row">
                  <span className="needs-slot-grid__badge needs-slot-grid__badge--ideal">
                    {cms.ui.badgeIdeal}
                  </span>
                </div>
              )}
              <div
                className={
                  (compact ? "needs-slot-grid__icon-wrap needs-slot-grid__icon-wrap--compact" : "needs-slot-grid__icon-wrap") +
                  (active ? " needs-slot-grid__icon-wrap--active" : "")
                }
              >
                <Icon size={compact ? 16 : 20} />
              </div>
              {/* Griglia: le label variano tra 1 e 2 righe ("Tonight" vs
                  "Tomorrow at lunch"); riservare sempre 2 righe (non-compact)
                  allinea i sottotitoli orari sulla stessa baseline in tutte le card. */}
              <div className={compact ? "needs-slot-grid__body needs-slot-grid__body--compact" : "needs-slot-grid__body"}>
                <span className={compact ? "needs-slot-grid__label needs-slot-grid__label--compact" : "needs-slot-grid__label"}>
                  {displayLabel}
                </span>
                <span
                  className={
                    "type-numeric needs-slot-grid__sublabel" +
                    (compact ? " needs-slot-grid__sublabel--compact" : "") +
                    (active ? " needs-slot-grid__sublabel--active" : "")
                  }
                >
                  {displaySublabel}
                </span>
              </div>

              {active && (
                <div className={compact ? "needs-slot-grid__current needs-slot-grid__current--compact" : "needs-slot-grid__current"}>
                  <span className="needs-slot-grid__badge needs-slot-grid__badge--current">
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
    <div className="needs-flour-grid">
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
      className={
        "needs-flour-chip" +
        (active ? " needs-flour-chip--active" : isRecent ? " needs-flour-chip--recent" : "")
      }
    >
      {isRecent && (
        <div className="needs-flour-chip__badge">
          {cms.ui.badgeRecent}
        </div>
      )}
      <div className="needs-flour-chip__row">
        <AnimatePresence>
          {active && (
            <motion.span
              initial={{ scale: 0, width: 0 }}
              animate={{ scale: 1, width: 14 }}
              exit={{ scale: 0, width: 0 }}
              transition={motionSpring.crisp}
            >
              <Check size={14} />
            </motion.span>
          )}
        </AnimatePresence>
        <span className="needs-flour-chip__name">
          {cms.flourLabels[flour.id] ?? flour.name}
        </span>
      </div>
      <span className="type-numeric needs-flour-chip__detail">
        {cms.flourDetails[flour.id] ?? flour.detail}
      </span>
      {flour.branded && flour.producer && (
        <span className="needs-flour-chip__producer">
          {flour.producer}
        </span>
      )}
      <span className="type-numeric needs-flour-chip__w">
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
    <div className="needs-branded-flours">
      <motion.button
        onClick={() => setExpanded(!expanded)}
        className="needs-branded-flours__toggle"
      >
        <motion.span
          animate={{ rotate: expanded ? 90 : 0 }}
          transition={motionSpring.crispControl}
          className="needs-branded-flours__chevron"
        >
          <ChevronRight size={14} />
        </motion.span>
        <span className="needs-branded-flours__label">
          {labelOverride ?? cms.ui?.brandedFlours ?? uiMessage("features.recipe.user-needs.farine-di-marca-d5a34a3b")}
        </span>
        {activeBrandedCount > 0 && (
          <span className="needs-branded-flours__count">
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
            transition={motionSpring.standard}
            className="needs-branded-flours__panel"
          >
            <div className="needs-branded-flours__panel-inner">
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
