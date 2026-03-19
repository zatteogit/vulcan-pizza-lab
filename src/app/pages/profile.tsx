/* === PROFILE PAGE — VPL-057 ===
   Setup utente: forno, skill, pantry, dieta, lingua, dark mode.
   Tab: Profilo — /profile
   Include FTU (First Time Use) onboarding al primo accesso. */

import { useState, useCallback, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  User,
  Sun,
  Moon,
  Check,
  ChevronRight,
  Flame,
  Zap,
  Home,
  Thermometer,
  WheatOff,
  Milk,
  Egg,
  Beaker,
  Timer,
  CircleDot,
  Sparkles,
  Bug,
  Globe,
  MapPin,
  Navigation,
  Search,
  X,
  Loader2,
  Monitor,
  ChevronDown,
} from "lucide-react";
import { useDarkMode } from "../components/root-layout";
import { useCms, CMS_DEFAULTS } from "../components/cms/cms-context";
import type { OvenType, SkillLevel } from "../components/pizza-engine";
import {
  OVEN_PRESETS,
  SKILL_LEVELS,
} from "../components/pizza-engine";
import { LOCALE_META, LOCALE_BUNDLES } from "../components/cms/locales/index";
import {
  MIXER_OPTIONS,
  SURFACE_OPTIONS,
  TOOL_OPTIONS,
  TOOL_CATEGORIES,
  DEFAULT_EQUIPMENT,
  migrateEquipment,
  syncLegacyFlags,
  getLocalizedMixerOptions,
  getLocalizedSurfaceOptions,
  getLocalizedToolOptions,
  getLocalizedToolCategories,
  getLocalizedMixerLevel,
} from "../components/equipment-data";
import type {
  EquipmentState,
  MixerType,
  SurfaceType,
  ToolCategory,
} from "../components/equipment-data";
import type { LocaleMeta } from "../components/cms/locales/index";

/* ═══ STORAGE KEYS ═══ */
const PROFILE_COMPLETE_KEY = "vulcan_profile_complete";
const OVEN_STORAGE_KEY = "vulcan_oven_pref";
const SKILL_STORAGE_KEY = "vulcan_skill_level";
const DIETARY_STORAGE_KEY = "vulcan_dietary";
const LOCATION_STORAGE_KEY = "vulcan_location";
const EQUIPMENT_STORAGE_KEY = "vulcan_equipment";

/* ═══ EQUIPMENT DATA — imported from equipment-data.ts ═══ */

/* ═══ LOCATION TYPES ═══ */
interface SavedLocation {
  lat: number;
  lon: number;
  city: string;
}

interface GeoSearchResult {
  lat: string;
  lon: string;
  display_name: string;
  name?: string;
  address?: {
    city?: string;
    town?: string;
    village?: string;
    municipality?: string;
    state?: string;
    country?: string;
  };
}

/* ═══ STORAGE HELPERS ═══ */
function loadJson<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw);
  } catch { /* */ }
  return null;
}

function saveJson(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch { /* */ }
}

function loadString(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch { /* */ }
  return null;
}

/* ═══ DATA ═══ */
const OVEN_ICONS: Record<string, typeof Flame> = {
  home: Home,
  electric_standard: Zap,
  electric_high: Thermometer,
  gas: Flame,
  wood: Flame,
};

/* Pantry data removed — managed in user-needs.tsx */

const DIETARY_OPTIONS = [
  { id: "gluten_free", labelKey: "dietGlutenFree" as const, icon: WheatOff },
  { id: "lactose_free", labelKey: "dietLactoseFree" as const, icon: Milk },
  { id: "vegan", labelKey: "dietVegan" as const, icon: Egg },
  { id: "low_fodmap", labelKey: "dietLowFodmap" as const, icon: Beaker },
  { id: "histamine", labelKey: "dietHistamine" as const, icon: Timer },
  { id: "nickel", labelKey: "dietNickel" as const, icon: CircleDot },
];

/* ═══ CHIP COMPONENT ═══ */
function ProfileChip({
  label,
  active,
  icon,
  onClick,
}: {
  label: string;
  active: boolean;
  icon?: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <motion.button
      onClick={onClick}
      className="flex items-center px-4 py-2.5 rounded-xl active:scale-95"
      initial={false}
      animate={{
        backgroundColor: active ? "var(--primary)" : "var(--container-bg)",
        color: active ? "#ffffff" : "var(--text-default)",
        borderColor: active ? "var(--primary)" : "var(--container-border)",
        gap: active ? 8 : 8,
      }}
      transition={{ type: "spring", stiffness: 500, damping: 35 }}
      style={{
        borderWidth: 1,
        borderStyle: "solid",
        fontSize: "0.8125rem",
        fontWeight: "var(--weight-medium)" as any,
        cursor: "pointer",
      }}
      aria-pressed={active}
    >
      {icon}
      {label}
      <motion.div
        initial={false}
        animate={{
          scale: active ? 1 : 0,
          opacity: active ? 1 : 0,
          width: active ? 14 : 0,
          marginLeft: active ? 0 : -8,
        }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        style={{ flexShrink: 0, display: "flex", alignItems: "center", originX: 0.5, originY: 0.5 }}
      >
        <Check size={14} />
      </motion.div>
    </motion.button>
  );
}

/* ═══ SECTION WRAPPER ═══ */
function ProfileSection({
  title,
  subtitle,
  stepNum,
  children,
  delay = 0,
}: {
  title: string;
  subtitle?: string;
  stepNum?: string;
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 400, damping: 30, delay }}
      className="py-6"
      style={{ borderBottom: "1px solid var(--container-border-subtle)" }}
    >
      <div className="mb-4">
        {stepNum && (
          <span
            style={{
              fontSize: "0.6875rem",
              color: "var(--primary)",
              letterSpacing: "0.18em",
              textTransform: "uppercase" as any,
              fontWeight: "var(--weight-semibold)" as any,
            }}
          >
            {stepNum}
          </span>
        )}
        <h2
          className="font-serif"
          style={{
            fontSize: "clamp(1.25rem, 3vw, 1.5rem)",
            lineHeight: "var(--leading-snug)",
            color: "var(--text-default)",
            marginTop: stepNum ? 4 : 0,
          }}
        >
          {title}
        </h2>
        {subtitle && (
          <p
            className="font-serif italic mt-1"
            style={{
              fontSize: "var(--font-size-xl)",
              color: "var(--text-muted)",
              opacity: 0.65,
            }}
          >
            {subtitle}
          </p>
        )}
      </div>
      {children}
    </motion.section>
  );
}

/* ═══ EQUIPMENT CATEGORY ACCORDION ═══ */
function EquipmentCategory({
  title,
  emoji,
  stepLabel,
  expanded,
  onToggle,
  summary,
  hasSelection,
  children,
}: {
  title: string;
  emoji: string;
  stepLabel: string;
  expanded: boolean;
  onToggle: () => void;
  summary: string;
  hasSelection: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: "var(--surface-container-low)",
        border: hasSelection ? "1px solid var(--primary)" : "1px solid var(--outline-variant)",
      }}
    >
      <motion.button
        onClick={onToggle}
        className="w-full flex items-center gap-3 px-4 py-3.5 active:scale-[0.99] transition-transform"
        style={{ textAlign: "left" as any, cursor: "pointer" }}
      >
        <span style={{ fontSize: "1.125rem", flexShrink: 0 }}>{emoji}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span
              style={{
                fontSize: "var(--font-size-2xs)",
                letterSpacing: "0.12em",
                textTransform: "uppercase" as any,
                fontWeight: "var(--weight-semibold)" as any,
                color: hasSelection ? "var(--primary)" : "var(--text-muted)",
              }}
            >
              {stepLabel}
            </span>
          </div>
          <span
            style={{
              fontSize: "var(--font-size-base)",
              fontWeight: "var(--weight-medium)" as any,
              color: "var(--text-default)",
            }}
          >
            {title}
          </span>
          <div
            className="type-data"
            style={{
              fontSize: "var(--font-size-xs)",
              color: hasSelection ? "var(--text-default)" : "var(--text-muted)",
              marginTop: 1,
              opacity: hasSelection ? 1 : 0.6,
            }}
          >
            {summary}
          </div>
        </div>
        <motion.div
          animate={{ rotate: expanded ? 180 : 0 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          style={{ flexShrink: 0 }}
        >
          <ChevronDown size={16} style={{ color: "var(--text-muted)" }} />
        </motion.div>
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
            <div
              className="px-3 pb-3"
              style={{ borderTop: "1px solid var(--outline-variant)" }}
            >
              <div className="pt-3">
                {children}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ═══ FTU ONBOARDING ═══ */
function FtuOnboarding({ onComplete }: { onComplete: () => void }) {
  const { cms } = useCms();
  const p = cms.profile;
  const [step, setStep] = useState(0);
  const [ovenType, setOvenType] = useState<OvenType>("home");
  const [ovenTemp, setOvenTemp] = useState(250);
  const [skillLevel, setSkillLevel] = useState<SkillLevel>(2);
  /* Pantry (flours/yeasts) removed from FTU — managed in wizard */
  /* Location state for FTU */
  const [ftuLocation, setFtuLocation] = useState<SavedLocation | null>(null);
  const [ftuLocationDetecting, setFtuLocationDetecting] = useState(false);
  const [ftuLocationQuery, setFtuLocationQuery] = useState("");
  const [ftuLocationResults, setFtuLocationResults] = useState<GeoSearchResult[]>([]);
  const [ftuLocationSearching, setFtuLocationSearching] = useState(false);

  const steps = [
    { num: "01", title: p.ftuOvenTitle, subtitle: p.ftuOvenSubtitle },
    { num: "02", title: p.ftuSkillTitle, subtitle: p.ftuSkillSubtitle },
    { num: "03", title: p.locationTitle || "La tua posizione", subtitle: p.locationSubtitle || "Per la temperatura ambiente e i calcoli di fermentazione" },
  ];

  /* FTU location search */
  useEffect(() => {
    if (ftuLocationQuery.length < 2) { setFtuLocationResults([]); return; }
    const timer = setTimeout(async () => {
      setFtuLocationSearching(true);
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(ftuLocationQuery)}&format=json&addressdetails=1&limit=5`);
        if (res.ok) setFtuLocationResults(await res.json());
      } catch { /* */ }
      setFtuLocationSearching(false);
    }, 400);
    return () => clearTimeout(timer);
  }, [ftuLocationQuery]);

  const ftuDetectLocation = useCallback(() => {
    if (!("geolocation" in navigator)) return;
    setFtuLocationDetecting(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lon } = pos.coords;
        let city = "";
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&zoom=10`);
          if (res.ok) { const d = await res.json(); city = d.address?.city || d.address?.town || d.address?.village || d.address?.municipality || ""; }
        } catch { /* */ }
        setFtuLocation({ lat, lon, city });
        setFtuLocationDetecting(false);
      },
      () => setFtuLocationDetecting(false),
      { timeout: 8000, maximumAge: 300000 },
    );
  }, []);

  const ftuSelectLocation = useCallback((result: GeoSearchResult) => {
    const addr = result.address;
    const city = addr?.city || addr?.town || addr?.village || addr?.municipality || result.name || "";
    setFtuLocation({ lat: parseFloat(result.lat), lon: parseFloat(result.lon), city });
    setFtuLocationQuery("");
    setFtuLocationResults([]);
  }, []);

  const handleFinish = useCallback(() => {
    saveJson(OVEN_STORAGE_KEY, { ovenType, maxTemp: ovenTemp });
    saveJson(SKILL_STORAGE_KEY, skillLevel);
    if (ftuLocation) saveJson(LOCATION_STORAGE_KEY, ftuLocation);
    try {
      localStorage.setItem(PROFILE_COMPLETE_KEY, "true");
    } catch { /* */ }
    onComplete();
  }, [ovenType, ovenTemp, skillLevel, ftuLocation, onComplete]);

  const handleNext = useCallback(() => {
    if (step < 2) setStep((s) => s + 1);
    else handleFinish();
  }, [step, handleFinish]);

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6 py-12"
      style={{ background: "var(--container-page)", color: "var(--text-default)" }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        className="w-full"
        style={{ maxWidth: 480 }}
      >
        {/* Progress dots */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {steps.map((_, i) => (
            <div
              key={i}
              style={{
                width: i === step ? 24 : 8,
                height: 8,
                borderRadius: 4,
                background: i <= step ? "var(--primary)" : "var(--container-bg-high)",
                transition: "all 0.3s ease",
              }}
            />
          ))}
        </div>

        {/* Step header */}
        <div className="text-center mb-8">
          <span
            style={{
              fontSize: "0.6875rem",
              color: "var(--primary)",
              letterSpacing: "0.18em",
              textTransform: "uppercase" as any,
              fontWeight: "var(--weight-semibold)" as any,
            }}
          >
            {steps[step].num} — {p.ftuWelcome}
          </span>
          <h1
            className="font-serif mt-2"
            style={{
              fontSize: "clamp(1.75rem, 4vw, 2.25rem)",
              lineHeight: "var(--leading-snug)",
            }}
          >
            {steps[step].title}
          </h1>
          <p
            className="font-serif italic mt-1"
            style={{
              fontSize: "var(--font-size-xl)",
              color: "var(--text-muted)",
              opacity: 0.65,
            }}
          >
            {steps[step].subtitle}
          </p>
        </div>

        {/* Step content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
          >
            {step === 0 && (
              <div className="flex flex-col gap-3">
                {OVEN_PRESETS.map((preset) => {
                  const Icon = OVEN_ICONS[preset.id] || Flame;
                  const active = ovenType === preset.id;
                  return (
                    <motion.button
                      key={preset.id}
                      onClick={() => {
                        setOvenType(preset.id);
                        setOvenTemp(preset.maxTemp);
                      }}
                      className="flex items-center gap-4 p-4 rounded-2xl active:scale-[0.98]"
                      animate={{
                        backgroundColor: active ? "var(--surface-container)" : "var(--container-bg-low)",
                        borderColor: active ? "var(--primary)" : "var(--container-border)",
                      }}
                      transition={{ type: "spring", stiffness: 500, damping: 35 }}
                      style={{
                        borderWidth: 1.5,
                        borderStyle: "solid",
                        cursor: "pointer",
                        textAlign: "left" as any,
                      }}
                    >
                      <motion.div
                        className="flex items-center justify-center flex-shrink-0"
                        animate={{
                          backgroundColor: active ? "var(--surface-container)" : "var(--container-bg)",
                        }}
                        transition={{ type: "spring", stiffness: 500, damping: 35 }}
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: 12,
                        }}
                      >
                        <motion.div
                          animate={{ color: active ? "var(--primary)" : "var(--text-muted)" }}
                          transition={{ type: "spring", stiffness: 500, damping: 35 }}
                        >
                          <Icon size={20} />
                        </motion.div>
                      </motion.div>
                      <div className="flex-1">
                        <div style={{ fontSize: "var(--font-size-xl)", fontWeight: "var(--weight-semibold)" as any, color: "var(--text-default)" }}>
                          {preset.name}
                        </div>
                        <div className="type-data" style={{ fontSize: "var(--font-size-sm)", color: "var(--text-muted)", fontFeatureSettings: "'tnum'" }}>
                          Max {preset.maxTemp}°C
                        </div>
                      </div>
                      {active && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 500, damping: 25 }}
                        >
                          <Check size={18} style={{ color: "var(--primary)" }} />
                        </motion.div>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            )}

            {step === 1 && (
              <div className="flex flex-col gap-3">
                {SKILL_LEVELS.map((skill) => {
                  const active = skillLevel === skill.level;
                  return (
                    <motion.button
                      key={skill.level}
                      onClick={() => setSkillLevel(skill.level as SkillLevel)}
                      className="flex items-center gap-4 p-4 rounded-2xl active:scale-[0.98]"
                      animate={{
                        backgroundColor: active ? "var(--surface-container)" : "var(--container-bg-low)",
                        borderColor: active ? "var(--primary)" : "var(--container-border)",
                      }}
                      transition={{ type: "spring", stiffness: 500, damping: 35 }}
                      style={{
                        borderWidth: 1.5,
                        borderStyle: "solid",
                        cursor: "pointer",
                        textAlign: "left" as any,
                      }}
                    >
                      <motion.div
                        className="flex items-center justify-center flex-shrink-0"
                        animate={{
                          backgroundColor: active ? "var(--surface-container)" : "var(--container-bg)",
                          color: active ? "var(--primary)" : "var(--text-muted)",
                        }}
                        transition={{ type: "spring", stiffness: 500, damping: 35 }}
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: 12,
                          fontSize: "0.875rem",
                          fontWeight: "var(--weight-bold)" as any,
                          fontFeatureSettings: "'tnum'",
                        }}
                      >
                        {skill.level}
                      </motion.div>
                      <div className="flex-1">
                        <div style={{ fontSize: "var(--font-size-xl)", fontWeight: "var(--weight-semibold)" as any, color: "var(--text-default)" }}>
                          {skill.name}
                        </div>
                        <div className="type-data" style={{ fontSize: "var(--font-size-sm)", color: "var(--text-muted)" }}>
                          {skill.description}
                        </div>
                      </div>
                      {active && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 500, damping: 25 }}
                        >
                          <Check size={18} style={{ color: "var(--primary)" }} />
                        </motion.div>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            )}

            {step === 2 && (
              <div className="flex flex-col gap-4">
                {/* Saved location */}
                {ftuLocation && (
                  <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: "var(--surface-container)", border: "1px solid var(--primary)" }}>
                    <MapPin size={16} style={{ color: "var(--primary)", flexShrink: 0 }} />
                    <div className="flex-1 min-w-0">
                      <div style={{ fontSize: "var(--font-size-base)", fontWeight: "var(--weight-semibold)" as any, color: "var(--text-default)" }}>
                        {ftuLocation.city || `${ftuLocation.lat.toFixed(2)}, ${ftuLocation.lon.toFixed(2)}`}
                      </div>
                    </div>
                    <button onClick={() => setFtuLocation(null)} className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center active:scale-95 transition-transform" style={{ background: "var(--container-bg)", border: "1px solid var(--container-border)" }} aria-label="Rimuovi posizione">
                      <X size={12} style={{ color: "var(--text-muted)" }} />
                    </button>
                  </div>
                )}
                {/* Search */}
                <div className="relative">
                  <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl" style={{ background: "var(--container-bg-low)", border: "1px solid var(--container-border)" }}>
                    {ftuLocationSearching ? (<Loader2 size={14} className="animate-spin" style={{ color: "var(--text-muted)", flexShrink: 0 }} />) : (<Search size={14} style={{ color: "var(--text-muted)", flexShrink: 0 }} />)}
                    <input type="text" value={ftuLocationQuery} onChange={(e) => setFtuLocationQuery(e.target.value)} placeholder={p.locationPlaceholder || "Cerca città..."} className="flex-1 bg-transparent outline-none" style={{ fontSize: "var(--font-size-base)", color: "var(--text-default)", border: "none" }} />
                  </div>
                  <AnimatePresence>
                    {ftuLocationResults.length > 0 && (
                      <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ type: "spring", stiffness: 500, damping: 30 }} className="absolute left-0 right-0 mt-1 rounded-xl overflow-hidden" style={{ background: "var(--container-bg)", border: "1px solid var(--container-border)", boxShadow: "0 8px 24px rgba(0,0,0,0.12)", zIndex: 10 }}>
                        {ftuLocationResults.map((result, i) => { const addr = result.address; const city = addr?.city || addr?.town || addr?.village || addr?.municipality || result.name || ""; const region = addr?.state || ""; const country = addr?.country || ""; return (<button key={`${result.lat}-${result.lon}-${i}`} onClick={() => ftuSelectLocation(result)} className="w-full flex items-center gap-3 px-3.5 py-2.5 text-left active:scale-[0.99] transition-transform" style={{ borderBottom: i < ftuLocationResults.length - 1 ? "1px solid var(--container-border-subtle)" : "none" }}><MapPin size={13} style={{ color: "var(--text-muted)", flexShrink: 0 }} /><div className="flex-1 min-w-0"><div style={{ fontSize: "var(--font-size-base)", fontWeight: "var(--weight-medium)" as any, color: "var(--text-default)" }}>{city || result.display_name.split(",")[0]}</div>{(region || country) && (<div style={{ fontSize: "var(--font-size-xs)", color: "var(--text-muted)" }}>{[region, country].filter(Boolean).join(", ")}</div>)}</div></button>); })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                {/* Auto-detect */}
                <motion.button onClick={ftuDetectLocation} disabled={ftuLocationDetecting} className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl active:scale-95 transition-transform" style={{ background: "var(--container-bg-low)", border: "1px solid var(--container-border)", color: "var(--text-default)", fontSize: "var(--font-size-base)", fontWeight: "var(--weight-medium)" as any, cursor: ftuLocationDetecting ? "wait" : "pointer", opacity: ftuLocationDetecting ? 0.6 : 1 }}>
                  {ftuLocationDetecting ? (<Loader2 size={14} className="animate-spin" />) : (<Navigation size={14} />)}
                  {p.locationAuto || "Rileva posizione"}
                </motion.button>
                {!ftuLocation && (
                  <p className="type-data text-center" style={{ fontSize: "var(--font-size-sm)", color: "var(--text-muted)", opacity: 0.6 }}>{p.locationNone || "Puoi anche saltare — useremo un valore standard."}</p>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-10">
          {step > 0 ? (
            <button
              onClick={() => setStep((s) => s - 1)}
              className="px-5 py-2.5 rounded-full active:scale-95 transition-transform"
              style={{
                background: "var(--container-bg)",
                border: "1px solid var(--container-border)",
                color: "var(--text-default)",
                fontSize: "var(--font-size-xl)",
                fontWeight: "var(--weight-medium)" as any,
                cursor: "pointer",
              }}
            >
              {p.ftuBack}
            </button>
          ) : (
            <div />
          )}
          <motion.button
            onClick={handleNext}
            className="flex items-center gap-2 px-6 py-2.5 rounded-full active:scale-95 transition-transform"
            style={{
              background: "var(--cta-btn-bg)",
              color: "var(--cta-btn-text)",
              fontSize: "var(--font-size-xl)",
              fontWeight: "var(--weight-semibold)" as any,
              boxShadow: "var(--cta-btn-shadow)",
              border: "none",
              cursor: "pointer",
            }}
          >
            {step < 2 ? p.ftuNext : p.ftuStart}
            {step < 2 ? <ChevronRight size={16} /> : <Sparkles size={16} />}
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}

/* ═══ LOCALE CONFIRM MODAL ═══ */
function LocaleConfirmModal({
  target,
  current,
  onConfirm,
  onCancel,
}: {
  target: LocaleMeta;
  current: LocaleMeta;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const { cms } = useCms();
  const srcProfile = cms.profile;
  /* Resolve the target locale's profile bundle for bilingual display */
  const tgtBundle = target.id === "it" ? CMS_DEFAULTS : LOCALE_BUNDLES[target.id];
  const tgtProfile = tgtBundle?.profile ?? CMS_DEFAULTS.profile;

  const fromLabel = `${current.flag} ${current.name}`;
  const toLabel = `${target.flag} ${target.name}`;

  /* Close on Escape */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onCancel]);

  return createPortal(
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
    >
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onCancel}
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0,0,0,0.45)",
          backdropFilter: "blur(8px)",
        }}
      />
      {/* Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 12 }}
        transition={{ type: "spring", stiffness: 500, damping: 32 }}
        className="relative rounded-2xl overflow-hidden"
        style={{
          background: "var(--container-bg)",
          border: "1px solid var(--container-border)",
          width: "100%",
          maxWidth: 380,
          boxShadow: "0 24px 48px rgba(0,0,0,0.18)",
        }}
      >
        <div className="px-6 pt-6 pb-2 text-center">
          <div
            className="inline-flex items-center justify-center mb-3"
            style={{
              width: 48,
              height: 48,
              borderRadius: 14,
              background: "var(--surface-container)",
            }}
          >
            <Globe size={22} style={{ color: "var(--primary)" }} />
          </div>
          <h3
            className="font-serif"
            style={{
              fontSize: "clamp(1.125rem, 3vw, 1.25rem)",
              lineHeight: "var(--leading-snug)",
              color: "var(--text-default)",
            }}
          >
            {srcProfile.localeModalTitle}
          </h3>
          {/* Target language echo */}
          {tgtProfile.localeModalTitle !== srcProfile.localeModalTitle && (
            <p
              className="font-serif italic"
              style={{
                fontSize: "var(--font-size-base)",
                color: "var(--text-muted)",
                opacity: 0.55,
                marginTop: 2,
              }}
            >
              {tgtProfile.localeModalTitle}
            </p>
          )}
          <p
            style={{
              fontSize: "var(--font-size-base)",
              color: "var(--text-muted)",
              marginTop: 8,
              lineHeight: 1.5,
            }}
          >
            {(() => {
              /* Render description with bold from/to names inline */
              const desc = srcProfile.localeModalDesc;
              const parts = desc.split("{from}");
              const before = parts[0];
              const afterFrom = (parts[1] || "").split("{to}");
              const middle = afterFrom[0];
              const after = afterFrom[1] || "";
              return (
                <span>
                  {before}
                  <span style={{ fontWeight: "var(--weight-semibold)" as any, color: "var(--text-default)" }}>{fromLabel}</span>
                  {middle}
                  <span style={{ fontWeight: "var(--weight-semibold)" as any, color: "var(--text-default)" }}>{toLabel}</span>
                  {after}
                </span>
              );
            })()}
          </p>
        </div>
        <div className="flex gap-3 px-6 pb-6 pt-4">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 rounded-xl active:scale-95 transition-transform"
            style={{
              background: "var(--surface-container)",
              border: "1px solid var(--container-border)",
              color: "var(--text-default)",
              fontSize: "var(--font-size-base)",
              fontWeight: "var(--weight-medium)" as any,
              cursor: "pointer",
            }}
          >
            {srcProfile.localeModalCancel}
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2.5 rounded-xl active:scale-95 transition-transform"
            style={{
              background: "var(--cta-btn-bg)",
              color: "var(--cta-btn-text)",
              border: "none",
              fontSize: "var(--font-size-base)",
              fontWeight: "var(--weight-semibold)" as any,
              cursor: "pointer",
              boxShadow: "var(--cta-btn-shadow)",
            }}
          >
            {tgtProfile.localeModalConfirm}
          </button>
        </div>
      </motion.div>
    </div>,
    document.body,
  );
}

/* ═══ PROFILE PAGE (MAIN) ═══ */
export function ProfilePage() {
  const { darkMode, setDarkMode, themeMode, setThemeMode, devMode, setDevMode } = useDarkMode();
  const { cms, switchLocale } = useCms();
  const p = cms.profile;

  /* CMS-localized equipment data */
  const localMixers = useMemo(() => getLocalizedMixerOptions(p), [p]);
  const localSurfaces = useMemo(() => getLocalizedSurfaceOptions(p), [p]);
  const localTools = useMemo(() => getLocalizedToolOptions(p), [p]);
  const localToolCats = useMemo(() => getLocalizedToolCategories(p), [p]);

  /* FTU detection */
  const [showFtu, setShowFtu] = useState(() => {
    return loadString(PROFILE_COMPLETE_KEY) !== "true";
  });

  /* Locale confirmation modal */
  const [pendingLocale, setPendingLocale] = useState<LocaleMeta | null>(null);

  /* Profile state — loaded from localStorage */
  const [ovenType, setOvenType] = useState<OvenType>(() => {
    const saved = loadJson<{ ovenType: OvenType; maxTemp: number }>(OVEN_STORAGE_KEY);
    return saved?.ovenType ?? "home";
  });
  const [ovenTemp, setOvenTemp] = useState(() => {
    const saved = loadJson<{ ovenType: OvenType; maxTemp: number }>(OVEN_STORAGE_KEY);
    return saved?.maxTemp ?? 250;
  });
  const [skillLevel, setSkillLevel] = useState<SkillLevel>(() => {
    const saved = loadJson<SkillLevel>(SKILL_STORAGE_KEY);
    return saved ?? 2;
  });
  /* Pantry state removed — managed in wizard Crea (user-needs.tsx) */
  const [dietary, setDietary] = useState<string[]>(() => {
    const saved = loadJson<string[]>(DIETARY_STORAGE_KEY);
    return saved ?? [];
  });

  /* Equipment state — advanced, migrates from old format */
  const [equipment, setEquipment] = useState<EquipmentState>(() => {
    const saved = loadJson<Record<string, any>>(EQUIPMENT_STORAGE_KEY);
    return saved ? migrateEquipment(saved) : DEFAULT_EQUIPMENT;
  });
  const [equipExpandedCat, setEquipExpandedCat] = useState<string | null>(null);

  const updateEquipment = useCallback((updater: (prev: EquipmentState) => EquipmentState) => {
    setEquipment((prev) => {
      const next = syncLegacyFlags(updater(prev));
      saveJson(EQUIPMENT_STORAGE_KEY, next);
      return next;
    });
  }, []);

  const selectMixer = useCallback((id: MixerType) => {
    updateEquipment((prev) => {
      const mixer = MIXER_OPTIONS.find((m) => m.id === id);
      if (prev.mixer_type === id) return { ...prev, mixer_type: null, mixer_level: null };
      return { ...prev, mixer_type: id, mixer_level: mixer?.level ?? null };
    });
  }, [updateEquipment]);

  const toggleSurface = useCallback((id: SurfaceType) => {
    updateEquipment((prev) => {
      const surfaces = prev.surfaces.includes(id)
        ? prev.surfaces.filter((s) => s !== id)
        : [...prev.surfaces, id];
      return { ...prev, surfaces };
    });
  }, [updateEquipment]);

  const toggleTool = useCallback((id: string) => {
    updateEquipment((prev) => {
      const tools = prev.tools.includes(id)
        ? prev.tools.filter((t) => t !== id)
        : [...prev.tools, id];
      return { ...prev, tools };
    });
  }, [updateEquipment]);

  /* Location state */
  const [savedLocation, setSavedLocation] = useState<SavedLocation | null>(() => {
    return loadJson<SavedLocation>(LOCATION_STORAGE_KEY);
  });
  const [locationQuery, setLocationQuery] = useState("");
  const [locationResults, setLocationResults] = useState<GeoSearchResult[]>([]);
  const [locationSearching, setLocationSearching] = useState(false);
  const [locationDetecting, setLocationDetecting] = useState(false);

  /* Location search via Nominatim */
  const searchLocation = useCallback(async (query: string) => {
    if (query.length < 2) { setLocationResults([]); return; }
    setLocationSearching(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1&limit=5`,
      );
      if (res.ok) {
        const data: GeoSearchResult[] = await res.json();
        setLocationResults(data);
      }
    } catch { /* ignore */ }
    setLocationSearching(false);
  }, []);

  /* Debounced search */
  useEffect(() => {
    if (locationQuery.length < 2) { setLocationResults([]); return; }
    const timer = setTimeout(() => searchLocation(locationQuery), 400);
    return () => clearTimeout(timer);
  }, [locationQuery, searchLocation]);

  const selectLocation = useCallback((result: GeoSearchResult) => {
    const addr = result.address;
    const city = addr?.city || addr?.town || addr?.village || addr?.municipality || result.name || "";
    const loc: SavedLocation = {
      lat: parseFloat(result.lat),
      lon: parseFloat(result.lon),
      city,
    };
    setSavedLocation(loc);
    saveJson(LOCATION_STORAGE_KEY, loc);
    setLocationQuery("");
    setLocationResults([]);
  }, []);

  const detectCurrentLocation = useCallback(() => {
    if (!("geolocation" in navigator)) return;
    setLocationDetecting(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lon } = pos.coords;
        let city = "";
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&zoom=10`,
          );
          if (res.ok) {
            const data = await res.json();
            city = data.address?.city || data.address?.town || data.address?.village || data.address?.municipality || "";
          }
        } catch { /* ignore */ }
        const loc: SavedLocation = { lat, lon, city };
        setSavedLocation(loc);
        saveJson(LOCATION_STORAGE_KEY, loc);
        setLocationDetecting(false);
      },
      () => { setLocationDetecting(false); },
      { timeout: 8000, maximumAge: 300000 },
    );
  }, []);

  const clearLocation = useCallback(() => {
    setSavedLocation(null);
    try { localStorage.removeItem(LOCATION_STORAGE_KEY); } catch { /* */ }
  }, []);

  /* Auto-save on change */
  useEffect(() => {
    saveJson(OVEN_STORAGE_KEY, { ovenType, maxTemp: ovenTemp });
  }, [ovenType, ovenTemp]);

  useEffect(() => {
    saveJson(SKILL_STORAGE_KEY, skillLevel);
  }, [skillLevel]);

  useEffect(() => {
    saveJson(DIETARY_STORAGE_KEY, dietary);
  }, [dietary]);
  const toggleDietary = (id: string) =>
    setDietary((prev) =>
      prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id],
    );

  const currentLocale = useMemo(() => {
    return LOCALE_META.find((l) => l.id === cms.locale?.id) ?? LOCALE_META[0];
  }, [cms.locale?.id]);

  /* FTU */
  if (showFtu) {
    return (
      <FtuOnboarding
        onComplete={() => {
          setShowFtu(false);
          /* Reload state from localStorage after FTU writes */
          const oven = loadJson<{ ovenType: OvenType; maxTemp: number }>(OVEN_STORAGE_KEY);
          if (oven) {
            setOvenType(oven.ovenType);
            setOvenTemp(oven.maxTemp);
          }
          const skill = loadJson<SkillLevel>(SKILL_STORAGE_KEY);
          if (skill) setSkillLevel(skill);
          const loc = loadJson<SavedLocation>(LOCATION_STORAGE_KEY);
          if (loc) setSavedLocation(loc);
        }}
      />
    );
  }

  return (
    <div
      className="min-h-screen"
      style={{ background: "var(--container-page)", color: "var(--text-default)" }}
    >
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        className="max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-12"
      >
        {/* Header */}
        <div className="text-center mb-4">
          <div
            className="inline-flex items-center justify-center mb-3"
            style={{
              width: 52,
              height: 52,
              borderRadius: 16,
              background: "var(--surface-container)",
            }}
          >
            <User size={26} style={{ color: "var(--primary)" }} />
          </div>
          <h1
            className="font-serif"
            style={{
              fontSize: "clamp(1.75rem, 4vw, 2.25rem)",
              lineHeight: "var(--leading-snug)",
              color: "var(--text-default)",
            }}
          >
            {p.pageTitle}
          </h1>
          <p
            className="font-serif italic mt-1"
            style={{
              fontSize: "var(--font-size-xl)",
              color: "var(--text-muted)",
              opacity: 0.65,
            }}
          >
            {p.pageSubtitle}
          </p>
        </div>

        {/* ── FORNO ── */}
        <ProfileSection
          title={p.ovenTitle}
          subtitle={p.ovenSubtitle}
          stepNum={p.ovenStep}
          delay={0.05}
        >
          <div className="flex flex-col gap-2">
            {OVEN_PRESETS.map((preset) => {
              const Icon = OVEN_ICONS[preset.id] || Flame;
              const active = ovenType === preset.id;
              return (
                <motion.button
                  key={preset.id}
                  layout
                  onClick={() => {
                    setOvenType(preset.id);
                    setOvenTemp(preset.maxTemp);
                  }}
                  className="flex items-center gap-3 p-3 sm:p-4 rounded-xl active:scale-[0.98]"
                  animate={{
                    backgroundColor: active
                      ? "var(--surface-container)"
                      : "var(--container-bg-low)",
                    borderColor: active ? "var(--primary)" : "var(--container-border)",
                  }}
                  transition={{ type: "spring", stiffness: 500, damping: 35 }}
                  style={{
                    borderWidth: 1.5,
                    borderStyle: "solid",
                    cursor: "pointer",
                    textAlign: "left" as any,
                  }}
                >
                  <motion.div
                    animate={{ color: active ? "var(--primary)" : "var(--text-muted)" }}
                    transition={{ type: "spring", stiffness: 500, damping: 35 }}
                    style={{ flexShrink: 0 }}
                  >
                    <Icon size={18} />
                  </motion.div>
                  <div className="flex-1 min-w-0">
                    <span style={{ fontSize: "var(--font-size-base)", fontWeight: "var(--weight-medium)" as any, color: "var(--text-default)" }}>
                      {preset.name}
                    </span>
                  </div>
                  <span
                    className="type-data flex-shrink-0"
                    style={{ fontSize: "var(--font-size-sm)", color: "var(--text-muted)", fontFeatureSettings: "'tnum'" }}
                  >
                    {preset.maxTemp}°C
                  </span>
                  <AnimatePresence>
                    {active && (
                      <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 500, damping: 28 }}
                        style={{ flexShrink: 0 }}
                      >
                        <Check size={16} style={{ color: "var(--primary)" }} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.button>
              );
            })}
          </div>

          {/* Temperature override */}
          <div className="mt-4 px-1">
            <div className="flex items-center justify-between mb-2">
              <span className="type-data" style={{ fontSize: "var(--font-size-sm)", color: "var(--text-muted)" }}>
                {p.tempLabel}
              </span>
              <span
                className="type-data"
                style={{
                  fontSize: "var(--font-size-base)",
                  fontWeight: "var(--weight-semibold)" as any,
                  color: "var(--text-default)",
                  fontFeatureSettings: "'tnum'",
                }}
              >
                {ovenTemp}°C
              </span>
            </div>
            <input
              type="range"
              min={180}
              max={500}
              step={10}
              value={ovenTemp}
              onChange={(e) => setOvenTemp(Number(e.target.value))}
              className="w-full"
              style={{ accentColor: "var(--primary)" }}
              aria-label={p.tempAria}
            />
          </div>
        </ProfileSection>

        {/* ── SKILL ── */}
        <ProfileSection
          title={p.skillTitle}
          subtitle={p.skillSubtitle}
          stepNum={p.skillStep}
          delay={0.1}
        >
          <div className="grid grid-cols-2 gap-2">
            {SKILL_LEVELS.map((skill) => {
              const active = skillLevel === skill.level;
              return (
                <motion.button
                  key={skill.level}
                  onClick={() => setSkillLevel(skill.level as SkillLevel)}
                  className="flex flex-col items-start gap-1 p-3 sm:p-4 rounded-xl active:scale-[0.98]"
                  animate={{
                    backgroundColor: active
                      ? "var(--surface-container)"
                      : "var(--container-bg-low)",
                    borderColor: active ? "var(--primary)" : "var(--container-border)",
                  }}
                  transition={{ type: "spring", stiffness: 500, damping: 35 }}
                  style={{
                    borderWidth: 1.5,
                    borderStyle: "solid",
                    cursor: "pointer",
                    textAlign: "left" as any,
                  }}
                >
                  <div className="flex items-center gap-2 w-full">
                    <motion.span
                      animate={{ color: active ? "var(--primary)" : "var(--text-muted)" }}
                      transition={{ type: "spring", stiffness: 500, damping: 35 }}
                      style={{
                        fontSize: "0.75rem",
                        fontWeight: "var(--weight-bold)" as any,
                        fontFeatureSettings: "'tnum'",
                      }}
                    >
                      LV{skill.level}
                    </motion.span>
                    <span style={{ fontSize: "var(--font-size-base)", fontWeight: "var(--weight-medium)" as any, color: "var(--text-default)" }}>
                      {skill.name}
                    </span>
                    <AnimatePresence>
                      {active && (
                        <motion.div
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0, opacity: 0 }}
                          transition={{ type: "spring", stiffness: 500, damping: 28 }}
                          style={{ marginLeft: "auto" }}
                        >
                          <Check size={14} style={{ color: "var(--primary)" }} />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  <span className="type-data" style={{ fontSize: "var(--font-size-xs)", color: "var(--text-muted)" }}>
                    {skill.description}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </ProfileSection>

        {/* Dispensa rimossa dal profilo — gestita nel wizard Crea */}

        {/* ── ATTREZZATURA AVANZATA ── */}
        <ProfileSection
          title={p.equipTitle || "Attrezzatura"}
          subtitle={p.equipSubtitle || "Cosa hai in cucina"}
          stepNum={p.equipStep || "03 — Attrezzatura"}
          delay={0.15}
        >
          <div className="flex flex-col gap-3">
            {/* ── Impastamento ── */}
            <EquipmentCategory
              title={p.equipMixerTitle || "Impastamento"}
              emoji="🤲"
              stepLabel={(p.equipMixerTitle || "IMPASTAMENTO").toUpperCase()}
              expanded={equipExpandedCat === "mixer"}
              onToggle={() => setEquipExpandedCat(equipExpandedCat === "mixer" ? null : "mixer")}
              summary={equipment.mixer_type
                ? localMixers.find((m) => m.id === equipment.mixer_type)?.label ?? ""
                : p.equipSummaryNone || "Non selezionato"}
              hasSelection={equipment.mixer_type !== null}
            >
              <div className="flex flex-col gap-1.5">
                {localMixers.map((mixer) => {
                  const active = equipment.mixer_type === mixer.id;
                  return (
                    <motion.button
                      key={mixer.id}
                      onClick={() => selectMixer(mixer.id)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg active:scale-[0.98]"
                      animate={{
                        backgroundColor: active ? "var(--surface-container)" : "rgba(0,0,0,0)",
                        borderColor: active ? "var(--primary)" : "var(--container-border)",
                      }}
                      transition={{ type: "spring", stiffness: 500, damping: 35 }}
                      style={{ borderWidth: 1, borderStyle: "solid", cursor: "pointer", textAlign: "left" as any }}
                    >
                      <span style={{ fontSize: "1rem", flexShrink: 0 }}>{mixer.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span style={{ fontSize: "var(--font-size-base)", fontWeight: "var(--weight-medium)" as any, color: "var(--text-default)" }}>
                            {mixer.label}
                          </span>
                          <span
                            className="px-1.5 py-0.5 rounded"
                            style={{
                              fontSize: "var(--font-size-2xs)",
                              letterSpacing: "0.08em",
                              textTransform: "uppercase" as any,
                              fontWeight: "var(--weight-semibold)" as any,
                              color: mixer.level === "professional" ? "var(--primary)" : mixer.level === "semi_pro" ? "var(--tertiary)" : "var(--text-muted)",
                              background: mixer.level === "professional"
                                ? "color-mix(in srgb, var(--primary) 10%, var(--surface-container))"
                                : mixer.level === "semi_pro"
                                  ? "color-mix(in srgb, var(--tertiary) 10%, var(--surface-container))"
                                  : "var(--surface-container)",
                            }}
                          >
                            {mixer.level === "professional" ? "Pro" : mixer.level === "semi_pro" ? "Semi-Pro" : "Casa"}
                          </span>
                        </div>
                        <div className="type-data" style={{ fontSize: "var(--font-size-xs)", color: "var(--text-muted)", marginTop: 1 }}>
                          {mixer.description}
                        </div>
                      </div>
                      <AnimatePresence>
                        {active && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                            transition={{ type: "spring", stiffness: 500, damping: 25 }}
                            style={{ flexShrink: 0 }}
                          >
                            <Check size={16} style={{ color: "var(--primary)" }} />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.button>
                  );
                })}
              </div>
            </EquipmentCategory>

            {/* ── Superficie di cottura ── */}
            <EquipmentCategory
              title={p.equipSurfaceTitle || "Superficie di cottura"}
              emoji="♨️"
              stepLabel={(p.equipSurfaceTitle || "SUPERFICIE").toUpperCase()}
              expanded={equipExpandedCat === "surface"}
              onToggle={() => setEquipExpandedCat(equipExpandedCat === "surface" ? null : "surface")}
              summary={equipment.surfaces.length > 0
                ? equipment.surfaces.map((s) => localSurfaces.find((o) => o.id === s)?.label ?? s).join(", ")
                : p.equipSummaryNone || "Nessuna selezionata"}
              hasSelection={equipment.surfaces.length > 0}
            >
              <div className="flex flex-col gap-1.5">
                {localSurfaces.map((surface) => {
                  const active = equipment.surfaces.includes(surface.id);
                  return (
                    <motion.button
                      key={surface.id}
                      onClick={() => toggleSurface(surface.id)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg active:scale-[0.98]"
                      animate={{
                        backgroundColor: active ? "var(--surface-container)" : "rgba(0,0,0,0)",
                        borderColor: active ? "var(--primary)" : "var(--container-border)",
                      }}
                      transition={{ type: "spring", stiffness: 500, damping: 35 }}
                      style={{ borderWidth: 1, borderStyle: "solid", cursor: "pointer", textAlign: "left" as any }}
                    >
                      <span style={{ fontSize: "1rem", flexShrink: 0 }}>{surface.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span style={{ fontSize: "var(--font-size-base)", fontWeight: "var(--weight-medium)" as any, color: "var(--text-default)" }}>
                            {surface.label}
                          </span>
                          <span
                            className="type-data px-1.5 py-0.5 rounded"
                            style={{
                              fontSize: "var(--font-size-2xs)",
                              color: surface.heatClass === "very_fast" ? "var(--primary)" : surface.heatClass === "medium" ? "var(--tertiary)" : "var(--text-muted)",
                              background: "var(--surface-container)",
                              fontFeatureSettings: "'tnum'",
                            }}
                          >
                            k={surface.conductivity}
                          </span>
                        </div>
                        <div className="type-data" style={{ fontSize: "var(--font-size-xs)", color: "var(--text-muted)", marginTop: 1 }}>
                          {surface.description}
                        </div>
                      </div>
                      <AnimatePresence>
                        {active && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                            transition={{ type: "spring", stiffness: 500, damping: 25 }}
                            style={{ flexShrink: 0 }}
                          >
                            <Check size={16} style={{ color: "var(--primary)" }} />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.button>
                  );
                })}
              </div>
            </EquipmentCategory>

            {/* ── Utensili ── */}
            <EquipmentCategory
              title={p.equipToolsTitle || "Utensili"}
              emoji="🔧"
              stepLabel={(p.equipToolsTitle || "UTENSILI").toUpperCase()}
              expanded={equipExpandedCat === "tools"}
              onToggle={() => setEquipExpandedCat(equipExpandedCat === "tools" ? null : "tools")}
              summary={equipment.tools.length > 0
                ? (p.equipSummarySelected || "{count} selezionati").replace("{count}", String(equipment.tools.length))
                : p.equipSummaryNone || "Nessuno selezionato"}
              hasSelection={equipment.tools.length > 0}
            >
              <div className="flex flex-col gap-4">
                {(Object.keys(localToolCats) as ToolCategory[]).map((catId) => {
                  const cat = localToolCats[catId];
                  const catTools = localTools.filter((t) => t.category === catId);
                  return (
                    <div key={catId}>
                      <div
                        className="mb-2"
                        style={{
                          fontSize: "var(--font-size-2xs)",
                          letterSpacing: "0.12em",
                          textTransform: "uppercase" as any,
                          fontWeight: "var(--weight-semibold)" as any,
                          color: "var(--text-muted)",
                        }}
                      >
                        {cat.emoji} {cat.label}
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {catTools.map((tool) => (
                          <ProfileChip
                            key={tool.id}
                            label={tool.label}
                            active={equipment.tools.includes(tool.id)}
                            onClick={() => toggleTool(tool.id)}
                            icon={<span style={{ fontSize: "0.75rem" }}>{tool.emoji}</span>}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </EquipmentCategory>

            {/* Equipment summary strip */}
            {(equipment.mixer_type || equipment.surfaces.length > 0 || equipment.tools.length > 0) && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                className="mt-2 px-3 py-2.5 rounded-xl"
                style={{
                  background: "color-mix(in srgb, var(--cta) 6%, var(--surface-container-low))",
                  border: "1px solid color-mix(in srgb, var(--cta) 15%, var(--outline-variant))",
                }}
              >
                <div className="flex flex-wrap gap-1.5">
                  {equipment.mixer_type && (
                    <span className="type-data px-2 py-0.5 rounded-md" style={{ fontSize: "var(--font-size-xs)", background: "var(--surface-container)", border: "1px solid var(--outline-variant)", color: "var(--text-default)" }}>
                      {localMixers.find((m) => m.id === equipment.mixer_type)?.emoji} {localMixers.find((m) => m.id === equipment.mixer_type)?.label}
                    </span>
                  )}
                  {equipment.surfaces.map((s) => {
                    const opt = localSurfaces.find((o) => o.id === s);
                    return (
                      <span key={s} className="type-data px-2 py-0.5 rounded-md" style={{ fontSize: "var(--font-size-xs)", background: "var(--surface-container)", border: "1px solid var(--outline-variant)", color: "var(--text-default)" }}>
                        {opt?.emoji} {opt?.label}
                      </span>
                    );
                  })}
                  {equipment.tools.length > 0 && (
                    <span className="type-data px-2 py-0.5 rounded-md" style={{ fontSize: "var(--font-size-xs)", background: "var(--surface-container)", border: "1px solid var(--outline-variant)", color: "var(--text-muted)" }}>
                      🔧 {equipment.tools.length} utensili
                    </span>
                  )}
                </div>
              </motion.div>
            )}
          </div>
        </ProfileSection>

        {/* ── DIETA ── */}
        <ProfileSection
          title={p.dietTitle}
          subtitle={p.dietSubtitle}
          stepNum={p.dietStep}
          delay={0.2}
        >
          <div className="flex flex-wrap gap-2">
            {DIETARY_OPTIONS.map((d) => {
              const Icon = d.icon;
              return (
                <ProfileChip
                  key={d.id}
                  label={(p as any)[d.labelKey] || d.labelKey}
                  active={dietary.includes(d.id)}
                  onClick={() => toggleDietary(d.id)}
                  icon={<Icon size={14} />}
                />
              );
            })}
          </div>
          {dietary.length === 0 && (
            <p className="type-data mt-3" style={{ fontSize: "var(--font-size-sm)", color: "var(--text-muted)", opacity: 0.6 }}>
              {p.noDietNote}
            </p>
          )}
        </ProfileSection>

        {/* ── POSIZIONE ── */}
        <ProfileSection
          title={p.locationTitle || "La tua posizione"}
          subtitle={p.locationSubtitle || "Per la temperatura ambiente e i calcoli di fermentazione"}
          stepNum={p.locationStep || "06 — Posizione"}
          delay={0.22}
        >
          <div className="flex flex-col gap-3">
            {/* Current saved location */}
            {savedLocation && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                className="flex items-center gap-3 p-3 rounded-xl"
                style={{
                  background: "var(--surface-container)",
                  border: "1px solid var(--primary)",
                  borderStyle: "solid",
                }}
              >
                <MapPin size={16} style={{ color: "var(--primary)", flexShrink: 0 }} />
                <div className="flex-1 min-w-0">
                  <div style={{ fontSize: "var(--font-size-base)", fontWeight: "var(--weight-semibold)" as any, color: "var(--text-default)" }}>
                    {savedLocation.city || `${savedLocation.lat.toFixed(2)}, ${savedLocation.lon.toFixed(2)}`}
                  </div>
                  <div className="type-data" style={{ fontSize: "var(--font-size-xs)", color: "var(--text-muted)", fontFeatureSettings: "'tnum'" }}>
                    {p.locationSaved || "Posizione salvata"} · {savedLocation.lat.toFixed(4)}, {savedLocation.lon.toFixed(4)}
                  </div>
                </div>
                <button
                  onClick={clearLocation}
                  className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center active:scale-95 transition-transform"
                  style={{ background: "var(--container-bg)", border: "1px solid var(--container-border)" }}
                  aria-label="Rimuovi posizione"
                >
                  <X size={12} style={{ color: "var(--text-muted)" }} />
                </button>
              </motion.div>
            )}

            {/* Search input */}
            <div className="relative">
              <div
                className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl"
                style={{
                  background: "var(--container-bg-low)",
                  border: "1px solid var(--container-border)",
                }}
              >
                {locationSearching ? (
                  <Loader2 size={14} className="animate-spin" style={{ color: "var(--text-muted)", flexShrink: 0 }} />
                ) : (
                  <Search size={14} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
                )}
                <input
                  type="text"
                  value={locationQuery}
                  onChange={(e) => setLocationQuery(e.target.value)}
                  placeholder={p.locationPlaceholder || "Cerca città..."}
                  className="flex-1 bg-transparent outline-none"
                  style={{
                    fontSize: "var(--font-size-base)",
                    color: "var(--text-default)",
                    border: "none",
                  }}
                />
                {locationQuery && (
                  <button
                    onClick={() => { setLocationQuery(""); setLocationResults([]); }}
                    className="flex-shrink-0 active:scale-95"
                    aria-label="Cancella ricerca"
                  >
                    <X size={14} style={{ color: "var(--text-muted)" }} />
                  </button>
                )}
              </div>

              {/* Results dropdown */}
              <AnimatePresence>
                {locationResults.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    className="absolute left-0 right-0 mt-1 rounded-xl overflow-hidden"
                    style={{
                      background: "var(--container-bg)",
                      border: "1px solid var(--container-border)",
                      boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                      zIndex: 10,
                    }}
                  >
                    {locationResults.map((result, i) => {
                      const addr = result.address;
                      const city = addr?.city || addr?.town || addr?.village || addr?.municipality || result.name || "";
                      const region = addr?.state || "";
                      const country = addr?.country || "";
                      return (
                        <button
                          key={`${result.lat}-${result.lon}-${i}`}
                          onClick={() => selectLocation(result)}
                          className="w-full flex items-center gap-3 px-3.5 py-2.5 text-left active:scale-[0.99] transition-transform"
                          style={{
                            borderBottom: i < locationResults.length - 1 ? "1px solid var(--container-border-subtle)" : "none",
                          }}
                        >
                          <MapPin size={13} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
                          <div className="flex-1 min-w-0">
                            <div style={{ fontSize: "var(--font-size-base)", fontWeight: "var(--weight-medium)" as any, color: "var(--text-default)" }}>
                              {city || result.display_name.split(",")[0]}
                            </div>
                            {(region || country) && (
                              <div style={{ fontSize: "var(--font-size-xs)", color: "var(--text-muted)" }}>
                                {[region, country].filter(Boolean).join(", ")}
                              </div>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* No results */}
              {locationQuery.length >= 2 && !locationSearching && locationResults.length === 0 && (
                <div
                  className="mt-1 px-3.5 py-2 rounded-xl"
                  style={{ background: "var(--container-bg-low)", fontSize: "var(--font-size-sm)", color: "var(--text-muted)" }}
                >
                  {p.locationNoResults || "Nessun risultato"}
                </div>
              )}
            </div>

            {/* Auto-detect button */}
            <motion.button
              onClick={detectCurrentLocation}
              disabled={locationDetecting}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl active:scale-95 transition-transform"
              style={{
                background: "var(--container-bg-low)",
                border: "1px solid var(--container-border)",
                color: "var(--text-default)",
                fontSize: "var(--font-size-base)",
                fontWeight: "var(--weight-medium)" as any,
                cursor: locationDetecting ? "wait" : "pointer",
                opacity: locationDetecting ? 0.6 : 1,
              }}
            >
              {locationDetecting ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Navigation size={14} />
              )}
              {p.locationAuto || "Rileva posizione"}
            </motion.button>

            {/* Hint when no location */}
            {!savedLocation && (
              <p className="type-data" style={{ fontSize: "var(--font-size-sm)", color: "var(--text-muted)", opacity: 0.6 }}>
                {p.locationNone || "Nessuna posizione impostata — useremo un valore standard."}
              </p>
            )}
          </div>
        </ProfileSection>

        {/* ── LINGUA & TEMA ── */}
        <ProfileSection
          title={p.prefsTitle}
          subtitle={p.prefsSubtitle}
          stepNum={p.prefsStep}
          delay={0.25}
        >
          <div className="flex flex-col gap-4">
            {/* Language */}
            <div>
              <div
                className="type-data mb-2"
                style={{
                  fontSize: "var(--font-size-sm)",
                  color: "var(--text-muted)",
                  fontWeight: "var(--weight-semibold)" as any,
                  textTransform: "uppercase" as any,
                  letterSpacing: "0.08em",
                }}
              >
                {p.langLabel}
              </div>
              <div className="flex flex-wrap gap-2">
                {LOCALE_META.filter((l) => l.available).map((locale) => (
                  <motion.button
                    key={locale.id}
                    onClick={() => {
                      if (locale.id !== currentLocale.id) {
                        setPendingLocale(locale);
                      }
                    }}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl active:scale-95"
                    initial={false}
                    animate={{
                      backgroundColor: currentLocale.id === locale.id ? "var(--primary)" : "var(--container-bg)",
                      color: currentLocale.id === locale.id ? "#ffffff" : "var(--text-default)",
                      borderColor: currentLocale.id === locale.id ? "var(--primary)" : "var(--container-border)",
                    }}
                    transition={{ type: "spring", stiffness: 500, damping: 35 }}
                    style={{
                      borderWidth: 1,
                      borderStyle: "solid",
                      fontSize: "0.8125rem",
                      fontWeight: "var(--weight-medium)" as any,
                      cursor: "pointer",
                    }}
                  >
                    <span>{locale.flag}</span>
                    {locale.name}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Dark mode */}
            <div>
              <div
                className="type-data mb-2"
                style={{
                  fontSize: "var(--font-size-sm)",
                  color: "var(--text-muted)",
                  fontWeight: "var(--weight-semibold)" as any,
                  textTransform: "uppercase" as any,
                  letterSpacing: "0.08em",
                }}
              >
                {p.themeLabel}
              </div>
              <div className="flex gap-2">
                {([
                  { mode: "light" as const, icon: Sun, label: p.themeLight },
                  { mode: "dark" as const, icon: Moon, label: p.themeDark },
                  { mode: "auto" as const, icon: Monitor, label: p.themeAuto || "Auto" },
                ]).map(({ mode, icon: Icon, label }) => {
                  const active = themeMode === mode;
                  return (
                    <motion.button
                      key={mode}
                      onClick={() => setThemeMode(mode)}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl active:scale-95"
                      initial={false}
                      animate={{
                        backgroundColor: active ? "var(--primary)" : "var(--container-bg)",
                        color: active ? "#ffffff" : "var(--text-default)",
                        borderColor: active ? "var(--primary)" : "var(--container-border)",
                      }}
                      transition={{ type: "spring", stiffness: 500, damping: 35 }}
                      style={{
                        borderWidth: 1,
                        borderStyle: "solid",
                        fontSize: "0.8125rem",
                        fontWeight: "var(--weight-medium)" as any,
                        cursor: "pointer",
                      }}
                    >
                      <Icon size={14} /> {label}
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </div>
        </ProfileSection>

        {/* Reset profile */}
        <div className="mt-8 flex flex-col items-center gap-3">
          <button
            onClick={() => {
              try {
                localStorage.removeItem(PROFILE_COMPLETE_KEY);
              } catch { /* */ }
              setShowFtu(true);
            }}
            className="type-data px-4 py-2 rounded-lg active:scale-95 transition-transform"
            style={{
              fontSize: "var(--font-size-sm)",
              color: "var(--text-muted)",
              background: "rgba(0,0,0,0)",
              border: "1px solid var(--container-border)",
              cursor: "pointer",
            }}
          >
            {p.resetProfile}
          </button>

          {/* Dev mode toggle */}
          <motion.button
            onClick={() => setDevMode(!devMode)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg active:scale-95"
            animate={{
              backgroundColor: devMode ? "var(--surface-container)" : "rgba(0,0,0,0)",
              color: devMode ? "var(--primary)" : "var(--text-muted)",
              borderColor: devMode ? "var(--primary)" : "var(--container-border)",
              opacity: devMode ? 1 : 0.5,
            }}
            transition={{ type: "spring", stiffness: 500, damping: 35 }}
            style={{
              fontSize: "var(--font-size-sm)",
              borderWidth: 1,
              borderStyle: "solid",
              cursor: "pointer",
            }}
          >
            <Bug size={13} />
            {devMode ? p.devModeOn : p.devModeOff}
          </motion.button>
        </div>

        {/* Locale confirmation modal */}
        <AnimatePresence>
          {pendingLocale && (
            <LocaleConfirmModal
              target={pendingLocale}
              current={currentLocale}
              onConfirm={() => {
                switchLocale(pendingLocale.id);
                setPendingLocale(null);
              }}
              onCancel={() => setPendingLocale(null)}
            />
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}