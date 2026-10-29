import { AllergenPreferences } from "./allergen-preferences";
import { migrateEquipment, syncLegacyFlags } from "../../data/equipment-data";
import { PantryEditor } from "./pantry-editor";
import { savePantryConstraints } from "../../adapters/browser/pantry-storage";
import { SupplyPolicyControls } from "./supply-policy-controls";
import { ovenIcon } from "../../components/shared/oven-icons";
import {
CalendarDays,
Check,
ChefHat,
ChevronRight,
Clock,
CloudSun,
CookingPot,
FlaskConical,
HelpCircle,
MapPin,
Minus,
Moon,
Package,
Plus,
Sun,Sunset,
Thermometer,
Timer,
Wheat
} from "lucide-react";
import { pantryFlourName } from "./pantry-flour-names";
import { AnimatePresence,motion } from "motion/react";
import { motionDelay,motionDuration,motionEase,motionSpring,motionTiming } from "../../components/ds/motion";
import React,{ useEffect,useMemo,useRef,useState } from "react";
import { Chip, SelectionMark } from "../../components/ds/index";
import { useCms, type CmsContent } from "../cms/cms-context";
import { timeSlotText } from "./time-slot-text";
import { CustomTimeSlot } from "./custom-time-slot";
import { useRecommend } from "./use-recommend";
import { earliestFeasibleMeal, slotsWithoutFeasibleStyle, type EarliestFeasibleMeal } from "../../domain/feasible-slot";
import { createFormatter,formatTemperatureCopy,t } from "../cms/i18n";
import {
DEFAULT_KITCHEN_TEMP,
generateTimeSlots,
suggestedTimeSlot,
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
  /** U-2: lo slot con giorno e ora scelti a mano, se attivo. */
  customTimeSlot?: TimeSlot | null;
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
  tonight: { bg: "var(--time-tonight)", text: "var(--time-tonight-on)" },
  tomorrow_lunch: { bg: "var(--time-lunch)", text: "var(--time-lunch-on)" },
  tomorrow_dinner: { bg: "var(--time-dinner)", text: "var(--time-dinner-on)" },
  day_after: { bg: "var(--time-dayafter)", text: "var(--time-dayafter-on)" },
  day_after_lunch: { bg: "var(--time-dayafter)", text: "var(--time-dayafter-on)" },
  long_ferment: { bg: "var(--time-weekend)", text: "var(--time-weekend-on)" },
  no_preference: { bg: "var(--secondary)", text: "var(--time-any-on)" },
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

/* FW-01 (S05-A-04/B-07): il tipo (00, 0, 1, integrale, semola) è il grado di
 * raffinazione, non la forza: niente W sulle chip generiche (era una stima
 * mostrata come dato). La W compare solo se l'utente la dichiara. */
const FLOUR_OPTIONS_GENERIC: FlourOption[] = [
  {
    id: "00",
    get name() { return pantryFlourName("00"); },
    w: "",
    get detail() { return uiMessage("features.recipe.user-needs.classica-versatile-21c9cc66"); },
  },
  {
    id: "0",
    get name() { return pantryFlourName("0"); },
    w: "",
    get detail() { return uiMessage("features.recipe.user-needs.media-forza-1dea8ed0"); },
  },
  {
    id: "tipo_1",
    get name() { return pantryFlourName("tipo_1"); },
    w: "",
    get detail() { return uiMessage("features.recipe.user-needs.rustica-profumo-di-cereale-766e58ac"); },
  },
  {
    id: "manitoba",
    get name() { return pantryFlourName("manitoba"); },
    w: "W340–380",
    get detail() { return uiMessage("features.recipe.user-needs.alta-forza-lunga-maturazione-58db76ea"); },
  },
  {
    id: "integrale",
    get name() { return pantryFlourName("integrale"); },
    w: "",
    get detail() { return uiMessage("features.recipe.user-needs.piu-fibra-e-sapore-e0f02324"); },
  },
  {
    id: "semola",
    get name() { return pantryFlourName("semola"); },
    w: "",
    get detail() { return uiMessage("features.recipe.user-needs.croccantezza-colore-dorato-0119e353"); },
  },
];

const FLOUR_OPTIONS_SPECIAL: FlourOption[] = [
  { id: "farro", get name() { return uiMessage("features.recipe.user-needs.farina-di-farro-cba26b1c"); }, w: "W130–180", get detail() { return uiMessage("features.recipe.user-needs.sapore-nocciolato-digeribile-7f620358"); } },
  { id: "spelta", get name() { return uiMessage("features.recipe.user-needs.farina-di-spelta-145c7e5d"); }, w: "W150–200", get detail() { return uiMessage("features.recipe.user-needs.grano-antico-aromatica-6b49eff1"); } },
  { id: "kamut", get name() { return uiMessage("features.recipe.user-needs.farina-di-kamut-23160bf9"); }, w: "W200–260", get detail() { return uiMessage("features.recipe.user-needs.khorasan-dolce-e-burrosa-1c0a0d60"); } },
  { id: "segale", get name() { return uiMessage("features.recipe.user-needs.farina-di-segale-4d6ef95b"); }, w: "W80–150", get detail() { return uiMessage("features.recipe.user-needs.sapore-intenso-bassa-glutine-b955d1cb"); } },
  { id: "riso", get name() { return uiMessage("features.recipe.user-needs.farina-di-riso-1d5fb293"); }, w: "—", get detail() { return uiMessage("features.recipe.user-needs.senza-glutine-croccantezza-c0379498"); } },
  { id: "mais", get name() { return uiMessage("features.recipe.user-needs.farina-di-mais-41910105"); }, w: "—", get detail() { return uiMessage("features.recipe.user-needs.senza-glutine-colore-dorato-83a2168b"); } },
  { id: "saraceno", get name() { return uiMessage("features.recipe.user-needs.grano-saraceno-d1593536"); }, w: "—", get detail() { return uiMessage("features.recipe.user-needs.senza-glutine-terroso-85af8327"); } },
  { id: "avena", get name() { return uiMessage("features.recipe.user-needs.farina-di-avena-d11c4a10"); }, w: "W100–140", get detail() { return uiMessage("features.recipe.user-needs.fibra-alta-morbidezza-348c80f9"); } },
  { id: "ceci", get name() { return uiMessage("features.recipe.user-needs.farina-di-ceci-f7a159a1"); }, w: "—", get detail() { return uiMessage("features.recipe.user-needs.proteica-sapore-deciso-6623765b"); } },
];

const YEAST_OPTIONS = [
  {
    id: "fresh",
    get name() { return uiMessage("features.recipe.user-needs.lievito-fresco-f3a7cabd"); },
    get detail() { return uiMessage("features.recipe.user-needs.cubetto-classico-76ef5715"); },
  },
  {
    id: "dry",
    get name() { return uiMessage("features.recipe.user-needs.lievito-secco-0043f8c5"); },
    get detail() { return uiMessage("features.recipe.user-needs.pratico-lunga-conservazione-8c39549a"); },
  },
  {
    id: "sourdough",
    get name() { return uiMessage("features.recipe.user-needs.lievito-madre-180392fb"); },
    get detail() { return uiMessage("features.recipe.user-needs.sapore-complesso-lunga-maturazione-9d8ec002"); },
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
/* suggested slot = the dynamic slot closest to the 24h fermentation sweet spot */
function getSuggestedSlot(): string {
  return suggestedTimeSlot()?.id ?? "tomorrow_lunch";
}

/* ═══ VPL-003: Geolocation + Open-Meteo weather API ═══
 * Activated only when the kitchen temperature controls are first opened.
 * A saved location avoids a permission request; otherwise use browser geolocation.
 * Without weather, keep the standard/manual kitchen temperature. */
interface WeatherData {
  city: string;
  temp: number;
  kitchenTemp: number;
}

/* VPL-066: Use DEFAULT_KITCHEN_TEMP (21°C) as fallback — no weather = no outdoor display */
function fallbackWeather(): WeatherData {
  return { city: "", temp: DEFAULT_KITCHEN_TEMP, kitchenTemp: DEFAULT_KITCHEN_TEMP };
}

/* FW-16 (D-N, S05-B-09): posizione e meteo partono solo da un gesto esplicito
 * («Stima dal meteo della tua zona»), con i servizi nominati accanto; il
 * risultato è una proposta che l'utente applica, mai un cambio silenzioso. */
function useLocationWeather(enabled: boolean) {
  const [data, setData] = useState<WeatherData>(fallbackWeather);
  const [loading, setLoading] = useState(false);
  const [available, setAvailable] = useState(false);
  const [failed, setFailed] = useState(false);
  const [activated, setActivated] = useState(false);

  // Latch the first use: closing/reopening the drawer does not ask again or
  // cancel an in-flight request. Only unmounting the screen cancels updates.
  useEffect(() => {
    if (enabled) setActivated(true);
  }, [enabled]);

  useEffect(() => {
    if (!activated) return;
    let cancelled = false;
    setLoading(true);
    setFailed(false);

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
          setAvailable(true);
        }
      } catch {
        /* Weather API failed — if we have a saved city, still show it */
        if (!cancelled) setFailed(true);
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
          if (!cancelled) fetchWeather(pos.coords.latitude, pos.coords.longitude);
        },
        () => {
          /* Geolocation denied/unavailable — keep fallback */
          if (!cancelled) { setLoading(false); setFailed(true); }
        },
        { timeout: 8000, maximumAge: 300000 },
      );
    } else {
      setLoading(false);
      setFailed(true);
    }

    return () => { cancelled = true; };
  }, [activated]);

  return { data, loading, available, failed };
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
  /** FW-12: il focus torna qui dopo la scelta del momento. */
  timeChipRef?: React.Ref<HTMLButtonElement>;
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
  timeChipRef,
}: SettingsSummaryBarProps) {
  /* R10: la chip rappresenta la cucina nel suo insieme, non solo il forno.
     Label "La tua cucina"; il tipo di forno e la temperatura vivono nel drawer. */
  const cucinaText = cms.ui?.kitchenTitle ?? "La tua cucina";

  const count = constraints.pantry_flours.length + constraints.pantry_yeasts.length;
  const pantryLabel = cms.sections.pantry.title;
  const pantryText = count > 0 ? `${pantryLabel} (${count})` : pantryLabel;

  // FW-14 (S05-B-18): un solo elenco dei livelli, quello del CMS.
  const skillLabel = cms.skillLevels[String(constraints.skill_level)]?.name ?? String(constraints.skill_level);
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
      {/* FW-12 (S05-B-13): primo nel DOM come a schermo, niente order:-1.
          Chip "Quando" — "atterra" qui salendo dalle card scelte poco sotto:
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
            ref={timeChipRef}
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

      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            type="button"
            aria-expanded={isActive}
            onClick={() => onTabSelect(isActive ? null : tab.id)}
            className={isActive ? "needs-summary__tab needs-summary__tab--active" : "needs-summary__tab"}
          >
            <Icon size={13} className="needs-summary__tab-icon" />
            <span data-slot="label">{tab.text}</span>
          </button>
        );
      })}
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
  customTimeSlot = null,
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
  /* FW-12 (S05-B-12): scelto un momento nel pannello compatto, il pannello si
     chiude e i bottoni spariscono. Il focus torna sul chip «Quando» (non su
     body) e una regione di stato conferma la scelta. */
  const timeChipRef = useRef<HTMLButtonElement>(null);
  const [timeAnnouncement, setTimeAnnouncement] = useState("");
  const handleCompactSlotPick = (slot: TimeSlot) => {
    onTimeSlotChange(slot);
    setTimeAnnouncement(uiMessage("features.recipe.user-needs.time-set"));
    requestAnimationFrame(() => timeChipRef.current?.focus());
  };
  const update = (
    key: keyof UserConstraints,
    value: unknown,
  ) => {
    let next = { ...constraints, [key]: value };
    const flags: Record<string, string> = { has_mixer: "mixer", has_pizza_stone: "pizza_stone", has_pizza_steel: "pizza_steel", has_baking_pan: "baking_pan" };
    if (key in flags) {
      try {
        const eq = migrateEquipment(JSON.parse(localStorage.getItem("vulcan_equipment") ?? "{}"));
        if (key === "has_mixer") eq.mixer_type = value ? eq.mixer_type && eq.mixer_type !== "hands" ? eq.mixer_type : "stand_domestic" : "hands";
        else {
          const ids = key === "has_pizza_stone" ? ["cordierite_stone", "refractory_brick"] : key === "has_pizza_steel" ? ["steel_plate"] : ["aluminum_pan", "blue_steel_pan", "cast_iron"];
          eq.surfaces = eq.surfaces.filter(id => !ids.includes(id));
          if (value) eq.surfaces.push(ids[0] as typeof eq.surfaces[number]);
        }
        const saved = syncLegacyFlags(eq);
        localStorage.setItem("vulcan_equipment", JSON.stringify(saved));
        next = { ...next, mixer_type: saved.mixer_type, surfaces: saved.surfaces, has_mixer: saved.mixer, has_pizza_stone: saved.pizza_stone, has_pizza_steel: saved.pizza_steel, has_baking_pan: saved.baking_pan };
      } catch { /* The current session still retains the selected equipment. */ }
    }
    onConstraintsChange(next);
  };

  const suggestedSlot = useMemo(() => getSuggestedSlot(), []);
  /* VPL-065: dynamic time slots based on current time */
  const dynamicSlots = useMemo(() => [...generateTimeSlots(), NO_PREFERENCE_SLOT], []);
  /* FW-09 (S05-A-01): gli slot in cui con questa cucina nessuno stile sta nei
     tempi lo dicono, invece di portare a 29 card «non fattibili». Il conto non
     dipende dal momento scelto, solo dalla cucina. */
  const recommend = useRecommend();
  const kitchenKey = JSON.stringify({ ...constraints, available_hours: 0, meal_deadline: true });
  const slotsWithoutStyle = useMemo(
    () => hideTimeSlots ? new Set<string>() : slotsWithoutFeasibleStyle(JSON.parse(kitchenKey) as UserConstraints, dynamicSlots, recommend),
    [hideTimeSlots, kitchenKey, dynamicSlots, recommend],
  );
  /* S05-A-13: il primo orario possibile per «Scegli giorno e ora», calcolato
     solo quando serve (alla conferma). */
  const earliestMeal = React.useCallback(
    () => earliestFeasibleMeal(JSON.parse(kitchenKey) as UserConstraints, new Date(), recommend),
    [kitchenKey, recommend],
  );
  /* Label della tempistica scelta — alimenta il chip "Quando" nella barra. */
  const selectedTimeLabel = useMemo(() => {
    if (!selectedTimeSlot) return null;
    const slot =
      dynamicSlots.find((s) => s.id === selectedTimeSlot) ??
      (customTimeSlot?.id === selectedTimeSlot ? customTimeSlot : undefined);
    return slot ? timeSlotText(slot, cms, bcp47).label : null;
  }, [selectedTimeSlot, dynamicSlots, customTimeSlot, cms, bcp47]);
  const [internalActiveTab, setInternalActiveTab] = useState<SettingsTab | null>(null);
  const activeTab =
    controlledActiveTab !== undefined ? controlledActiveTab : internalActiveTab;
  const setActiveTab = onActiveTabChange ?? setInternalActiveTab;
  const [weatherRequested, setWeatherRequested] = useState(false);
  const weather = useLocationWeather(weatherRequested);

  const [kitchenTempManual, setKitchenTempManual] =
    useState(false);
  const [kitchenTemp, setKitchenTemp] = useState(
    constraints.kitchen_temp_c ?? weather.data?.kitchenTemp ?? DEFAULT_KITCHEN_TEMP,
  );

  /* FW-16 (D-N): la stima dal meteo si propone, non si applica da sola. */
  const weatherProposal =
    weather.available && weather.data.kitchenTemp !== kitchenTemp ? weather.data : null;

  useEffect(() => {
    update("kitchen_temp_c", kitchenTemp);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kitchenTemp]);

  const [ovenSet, setOvenSet] = useState(false);
  const [pantryOpen, setPantryOpen] = useState(false);
  const [recentFlours, setRecentFlours] = useState<string[]>([]);
  const [recentYeasts, setRecentYeasts] = useState<string[]>([]);

  useEffect(() => {
    const saved = loadSavedOven();
    const pantry = loadPantry();
    const updates: Partial<UserConstraints> = {};
    if (saved) {
      updates.oven_type = saved.ovenType;
      updates.oven_max_temp_c = saved.maxTemp;
      updates.oven_capacity_temp_c = saved.maxTemp;
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
      oven_capacity_temp_c: maxTemp,
    });
    saveOven(id as OvenType, maxTemp);
    setOvenSet(true);
  };

  const toggleFlour = (id: string) => {
    const current = constraints.pantry_flours;
    const next = current.includes(id)
      ? current.filter((f) => f !== id)
      : [...current, id];
    const changed = {...constraints,pantry_flours:next,excluded_flours:(constraints.excluded_flours??[]).filter(value=>!next.includes(value))};
    onConstraintsChange(changed);
    savePantryConstraints(changed);
    setRecentFlours((prev) =>
      Array.from(new Set([...prev, ...next])),
    );
  };

  const toggleYeast = (id: string) => {
    const current = constraints.pantry_yeasts;
    const next = current.includes(id)
      ? current.filter((f) => f !== id)
      : [...current, id];
    const changed = {...constraints,pantry_yeasts:next,excluded_yeasts:(constraints.excluded_yeasts??[]).filter(value=>!next.includes(value))};
    onConstraintsChange(changed);
    savePantryConstraints(changed);
    setRecentYeasts((prev) =>
      Array.from(new Set([...prev, ...next])),
    );
  };

  const [showTempTip, setShowTempTip] = useState(false);
  const drawerTransition = compact ? motionSpring.drawerCompact : motionSpring.drawerRegular;

  return (
    <div className="needs-root">
      {pantryOpen && <PantryEditor constraints={constraints} onChange={onConstraintsChange} onClose={()=>setPantryOpen(false)} flourOptions={[...FLOUR_OPTIONS_GENERIC,...FLOUR_OPTIONS_SPECIAL]} />}
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
              timeChipRef={timeChipRef}
            />
            {/* FW-12 (S05-B-12): conferma della scelta per chi usa lo screen reader. */}
            <p className="sr-only" role="status">{timeAnnouncement}</p>

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
                        <button
                          type="button"
                          onClick={() => setShowTempTip(!showTempTip)}
                          aria-label={`${cms.misc.moreInfo}: ${cms.misc.kitchenTempLabel}`}
                          aria-expanded={showTempTip}
                          className="needs-kitchen-temp__help"
                        >
                          <HelpCircle size={16} className={showTempTip ? "needs-kitchen-temp__help-icon needs-kitchen-temp__help-icon--active" : "needs-kitchen-temp__help-icon"} />
                        </button>
                      </div>
                      {/* FW-16 (D-N): meteo solo su richiesta, con i servizi nominati. */}
                      <div className="needs-weather-request" data-region="weather-request">
                        {!weatherRequested ? (
                          <button
                            type="button"
                            className="needs-weather-request__action"
                            onClick={() => setWeatherRequested(true)}
                          >
                            {uiMessage("needs.weather.use")}
                          </button>
                        ) : weather.loading ? (
                          <p className="needs-weather-request__status" role="status">{uiMessage("needs.weather.loading")}</p>
                        ) : weatherProposal ? (
                          <p className="needs-weather-request__status" role="status">
                            {uiMessage("needs.weather.proposal", [fmt.celsius(weatherProposal.kitchenTemp), fmt.celsius(weatherProposal.temp)])}
                            <button
                              type="button"
                              className="needs-weather-request__action"
                              onClick={() => { setKitchenTempManual(false); setKitchenTemp(weatherProposal.kitchenTemp); }}
                            >
                              {uiMessage("needs.weather.apply")}
                            </button>
                          </p>
                        ) : weather.failed ? (
                          <p className="needs-weather-request__status" role="status">{uiMessage("needs.weather.failed")}</p>
                        ) : null}
                        <p className="needs-weather-request__note">
                          {weatherRequested && weather.available ? uiMessage("needs.weather.estimate") : uiMessage("needs.weather.privacy")}
                        </p>
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
                          const Icon = ovenIcon(preset.id);
                          const cmsOven = cms.ovenPresets[preset.id];
                          const displayName = cmsOven?.name ?? preset.name;
                          return (
                            <motion.button
                              key={preset.id}
                              type="button"
                              aria-pressed={active}
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
                      <SupplyPolicyControls kind="equipment" constraints={constraints} onChange={onConstraintsChange} />
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
                    <p className="pantry-quick__hint">{cms.ui.pantryQuickHint}</p>
                    {/* Allergeni accanto agli ingredienti, non sotto «esperienza»
                        (nota di Matteo, 28/10/2026). */}
                    <AllergenPreferences value={constraints.allergens_avoid??[]} onChange={allergens_avoid=>onConstraintsChange({...constraints,allergens_avoid})}/>
                    {/* Flours */}
                    <div data-slot="flours">
                      <div className="needs-pantry__group-header">
                        <Wheat size={14} className="needs-pantry__group-icon" />
                        <span className="needs-pantry__group-title">{cms.ui.pantryFlours}</span>
                      </div>
                      <FlourChipGrid options={FLOUR_OPTIONS_GENERIC.map(option=>constraints.pantry_flour_details?.[option.id]?.w ? {...option,w:`W${constraints.pantry_flour_details[option.id].w}`} : option)} activeFlours={constraints.pantry_flours} recentFlours={recentFlours} onToggle={toggleFlour} cms={cms} />
                      <p className="pantry-quick__hint">{cms.science.notes["flour-w-by-grade"]?.l1}</p>

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
                              type="button"
                              aria-pressed={active}
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
                                <SelectionMark active={active} />
                                <span className="needs-yeast-chip__name">{cms.yeastLabels[y.id] ?? y.name}</span>
                              </div>
                              <span className="needs-yeast-chip__detail">{cms.yeastDetails[y.id] ?? y.detail}</span>
                            </motion.button>
                          );
                        })}
                      </div>
                    </div>
                    <div className="pantry-quick__footer"><button type="button" className="pantry-quick__open" onClick={()=>setPantryOpen(true)}>{cms.ui.pantryFull}<ChevronRight size={16}/></button><span className="pantry-quick__hint">{t(cms.ui.pantrySelectionSummary,{n:constraints.pantry_flours.length+constraints.pantry_yeasts.length+(constraints.pantry_ingredients?.length??0),excluded:(constraints.excluded_flours?.length??0)+(constraints.excluded_yeasts?.length??0)+(constraints.excluded_ingredients?.length??0)})}</span></div>
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
                        return (<Chip key={sl.level} label={<span className="needs-skill-chips__copy"><span className="needs-skill-chips__name">{cmsSkill?.name ?? sl.name}</span><span className="needs-skill-chips__description">{cmsSkill?.description ?? sl.description}</span></span>} active={constraints.skill_level === sl.level} onToggle={() => update("skill_level", sl.level)} />);
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
                    onTimeSlotChange={handleCompactSlotPick}
                    customTimeSlot={customTimeSlot}
                    cms={cms}
                    compact
                    slotsWithoutStyle={slotsWithoutStyle}
                    earliestMeal={earliestMeal}
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
                  customTimeSlot={customTimeSlot}
                  cms={cms}
                  slotsWithoutStyle={slotsWithoutStyle}
                  earliestMeal={earliestMeal}
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
  customTimeSlot,
  cms,
  compact = false,
  slotsWithoutStyle,
  earliestMeal,
}: {
  /** FW-09: slot in cui nessuno stile sta nei tempi. */
  slotsWithoutStyle: ReadonlySet<string>;
  earliestMeal: () => EarliestFeasibleMeal | null;
  slots: TimeSlot[];
  suggestedSlot: string;
  selectedTimeSlot: string | null;
  onTimeSlotChange: (slot: TimeSlot) => void;
  customTimeSlot: TimeSlot | null;
  cms: CmsContent;
  compact?: boolean;
}) {
  const { bcp47 } = useCms();
  return (
    <div className="needs-slot-picker">
      <div
        data-region="slot-list"
        className={compact ? "needs-slot-list needs-slot-list--compact" : "needs-slot-list"}
      >
        {slots.map((slot) => {
          const active = selectedTimeSlot === slot.id;
          // D-036 (FW-20): «Consigliato» resta visibile anche dopo una scelta.
          const suggested = slot.id === suggestedSlot;
          const Icon = TIME_ICONS[slot.id] || Moon;
          const colors = getTimeColors(slot.id);
          const { label: displayLabel, sublabel: displaySublabel } = timeSlotText(slot, cms, bcp47);
          return (
            <button
              key={slot.id}
              type="button"
              aria-pressed={active}
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
                  {slotsWithoutStyle.has(slot.id) && (
                    <span className="type-body-xs needs-slot__none">{uiMessage("ui.slotNoneFeasible")}</span>
                  )}
                </div>
              </div>

              <div className="needs-slot-list__badges">
                {suggested && (
                  <span className="needs-slot-list__badge needs-slot-list__badge--ideal">
                    {cms.ui.badgeIdeal}
                  </span>
                )}
                {/* Fix di Matteo: «SELEZIONATO» copriva il testo; basta una
                    spunta (lo stato lo dice già aria-pressed). */}
                {active && (
                  <span className="needs-slot-list__check" aria-hidden="true">
                    <Check size={14} strokeWidth={3} />
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
          // D-036 (FW-20): «Consigliato» resta visibile anche dopo una scelta.
          const suggested = slot.id === suggestedSlot;
          const Icon = TIME_ICONS[slot.id] || Moon;
          const colors = getTimeColors(slot.id);
          const { label: displayLabel, sublabel: displaySublabel } = timeSlotText(slot, cms, bcp47);
          return (
            <motion.button
              key={slot.id}
              type="button"
              aria-pressed={active}
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
                {slotsWithoutStyle.has(slot.id) && (
                  <span className="type-body-xs needs-slot__none">{uiMessage("ui.slotNoneFeasible")}</span>
                )}
              </div>

              {active && (
                <span
                  className={compact ? "needs-slot-grid__current needs-slot-grid__current--compact" : "needs-slot-grid__current"}
                  aria-hidden="true"
                >
                  <span className="needs-slot-list__check">
                    <Check size={14} strokeWidth={3} />
                  </span>
                </span>
              )}
            </motion.button>
          );
        })}
      </div>

      <CustomTimeSlot
        activeSlot={selectedTimeSlot === customTimeSlot?.id ? customTimeSlot : null}
        onSelect={onTimeSlotChange}
        cms={cms}
        bcp47={bcp47}
        earliestMeal={earliestMeal}
      />
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
      type="button"
      aria-pressed={active}
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
        <SelectionMark active={active} compact />
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
      {flour.w && (
        <span className="type-numeric needs-flour-chip__w">
          {flour.w}
        </span>
      )}
    </motion.button>
  );
}

/* ═══ BRANDED FLOURS SECTION ═══ */
