/* === PROFILE PAGE — VPL-057 ===
   Setup utente: forno, skill, pantry, dieta, lingua, dark mode.
   Tab: Profilo — /profile
   Include FTU (First Time Use) onboarding al primo accesso. */

import {
Beaker,
Bug,
Check,
ChevronDown,
ChevronRight,
CircleDot,
Egg,
Flame,
Bookmark,
Globe,
Heart,
Home,
Loader2,
MapPin,
Milk,
Monitor,
Moon,
Navigation,
Search,
Sparkles,
Sun,
Thermometer,
Timer,
Trees,
User,
WheatOff,
X,
Zap,
} from "lucide-react";
import { AnimatePresence,motion } from "motion/react";
import { useCallback,useEffect,useMemo,useState } from "react";
import { createPortal } from "react-dom";
import { Link, useNavigate } from "react-router";
import { CMS_DEFAULTS, useCms, type CmsContent } from "../features/cms/cms-context";
import { Chip, CtaButton, Heading, IconButton, SegmentedControl } from "../components/ds/index";
import {
createFormatter,
getPreferredUnitSystem,
savePreferredUnitSystem,
t,
type UnitSystem,
} from "../features/cms/i18n";
import type { LocaleMeta } from "../features/cms/locales/index";
import {
  LOCALE_META,
  getCachedLocaleBundle,
  loadLocaleBundle,
} from "../features/cms/locales/index";
import type {
EquipmentState,
MixerType,
SurfaceType,
ToolCategory,
} from "../data/equipment-data";
import {
DEFAULT_EQUIPMENT,
getLocalizedMixerOptions,
getLocalizedSurfaceOptions,
getLocalizedToolCategories,
getLocalizedToolOptions,
migrateEquipment,
syncLegacyFlags
} from "../data/equipment-data";
import type { OvenType,SkillLevel } from "../domain/pizza-engine";
import {
OVEN_PRESETS,
SKILL_LEVELS,
STYLES_DB,
} from "../domain/pizza-engine";
import { ImageWithFallback } from "../components/media/ImageWithFallback";
import { STYLE_PHOTOS } from "../features/recipe/recommended-styles";
import {
  formatSavedDate,
  loadFavoriteStyles,
  loadSavedRecipes,
  removeRecipe,
  toggleFavoriteStyle,
  type SavedRecipe,
} from "../data/saved-recipes";
import { useDarkMode } from "../hooks/use-dark-mode";

/* ═══ STORAGE KEYS ═══ */
const PROFILE_COMPLETE_KEY = "vulcan_profile_complete";
const OVEN_STORAGE_KEY = "vulcan_oven_pref";
const SKILL_STORAGE_KEY = "vulcan_skill_level";
const PANTRY_STORAGE_KEY = "vulcan_pantry";
const DIETARY_STORAGE_KEY = "vulcan_dietary";
const LOCATION_STORAGE_KEY = "vulcan_location";
const EQUIPMENT_STORAGE_KEY = "vulcan_equipment";
const NERD_STORAGE_KEY = "vulcan_nerd_on";

/* ═══ FTU pantry options — versione semplificata per onboarding ═══ */
const FTU_FLOURS = [
  { id: "00", labelKey: "flour00" as const },
  { id: "0", labelKey: "flour0" as const },
  { id: "manitoba", labelKey: "flourManitoba" as const },
  { id: "integrale", labelKey: "flourIntegrale" as const },
  { id: "semola", labelKey: "flourSemola" as const },
];
const FTU_FLOURS_SPECIAL = [
  { id: "farro", labelKey: "flourFarro" as const },
  { id: "kamut", labelKey: "flourKamut" as const },
  { id: "segale", labelKey: "flourSegale" as const },
  { id: "tipo_1", labelKey: "flourTipo1" as const },
  { id: "tipo_2", labelKey: "flourTipo2" as const },
  { id: "macinata_pietra", labelKey: "flourMacinataPietra" as const },
];
const FTU_YEASTS = [
  { id: "fresh", labelKey: "yeastFresh" as const },
  { id: "dry", labelKey: "yeastDry" as const },
  { id: "sourdough", labelKey: "yeastSourdough" as const },
];

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
  wood: Trees, // Differenziato da gas (Flame) — gruppo di alberi più riconoscibile
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
            className="type-label-compact"
            style={{
              color: "var(--primary)",
              letterSpacing: "0.18em",
              textTransform: "uppercase" as any,
              fontWeight: "var(--weight-semibold)" as any,
            }}
          >
            {stepNum}
          </span>
        )}
        <Heading
          level="md"
          as="h2"
          style={{ marginTop: stepNum ? 4 : 0 }}
        >
          {title}
        </Heading>
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

/* ═══ STILI PREFERITI — chiude il loop del cuore (R31) ═══
 * Il cuore (toggleFavoriteStyle) è da sempre persistito in localStorage ma
 * non era mostrato da nessuna parte: qui i preferiti diventano finalmente
 * visibili e riapribili dal profilo. NB: testi IT inline da spostare nel CMS. */
function FavoriteStylesSection() {
  const { cms } = useCms();
  const p = cms.profile;
  const [favs, setFavs] = useState<string[]>(() => loadFavoriteStyles());

  /* Risincronizza quando si torna sulla pagina (i preferiti cambiano altrove). */
  useEffect(() => {
    const sync = () => setFavs(loadFavoriteStyles());
    window.addEventListener("focus", sync);
    document.addEventListener("visibilitychange", sync);
    return () => {
      window.removeEventListener("focus", sync);
      document.removeEventListener("visibilitychange", sync);
    };
  }, []);

  const styles = favs
    .map((id) => STYLES_DB[id])
    .filter((s): s is NonNullable<typeof s> => Boolean(s));

  if (styles.length === 0) return null;

  return (
    <ProfileSection
      title={p.favoritesTitle}
      subtitle={p.favoritesSubtitle}
      delay={0.02}
    >
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {styles.map((style) => (
          <div key={style.id} className="relative">
            <Link
              to={`/recipe/${style.id}?mode=canonical`}
              className="block rounded-2xl overflow-hidden active:scale-[0.97] transition-transform group"
              style={{
                background: "var(--container-card)",
                border: "1px solid var(--container-border-ghost)",
                textDecoration: "none",
                color: "inherit",
              }}
            >
              <div className="relative overflow-hidden" style={{ aspectRatio: "4/3" }}>
                <ImageWithFallback
                  src={STYLE_PHOTOS[style.id]}
                  alt={style.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0" style={{ background: "var(--overlay-scrim)" }} />
                <span
                  className="font-serif absolute bottom-0 left-0 right-0 px-3 pb-2.5 pt-10"
                  style={{
                    fontSize: "var(--font-size-lg)",
                    fontWeight: "var(--weight-bold)" as any,
                    color: "var(--overlay-text)",
                    textShadow: "var(--overlay-shadow-text)",
                    lineHeight: "var(--leading-snug)",
                  }}
                >
                  {style.name}
                </span>
              </div>
            </Link>
            <button
              onClick={() => setFavs(toggleFavoriteStyle(style.id))}
              className="absolute top-2 right-2 flex items-center justify-center rounded-full active:scale-90 transition-transform"
              style={{
                width: 30,
                height: 30,
                background: "color-mix(in srgb, var(--container-page) 70%, transparent)",
                backdropFilter: "blur(8px)",
                border: "1px solid var(--container-border-subtle)",
                cursor: "pointer",
              }}
              aria-label={t(p.favoriteRemoveAria, { name: style.name })}
              title={p.favoriteRemove}
            >
              <Heart size={15} fill="var(--primary)" style={{ color: "var(--primary)" }} />
            </button>
          </div>
        ))}
      </div>
    </ProfileSection>
  );
}

/* ═══ LE MIE RICETTE — ricettario personale (R31) ═══
 * saveRecipe era codice morto: nessuna UI lo invocava né mostrava i salvati.
 * Qui le ricette salvate (parametri, non risultato) tornano visibili e
 * riapribili tramite deep-link che ne rigenera la versione su misura. */
function buildSavedRecipeUrl(r: SavedRecipe): string {
  const pr = r.params;
  const q = new URLSearchParams();
  q.set("mode", "adapted");
  q.set("h", String(pr.hydration));
  q.set("w", String(pr.flourW));
  q.set("pl", String(pr.flourPL));
  q.set("f", String(pr.fermentHours));
  q.set("t", String(pr.fermentTemp));
  q.set("n", String(pr.doughBalls));
  if (pr.ovenType) q.set("oven", pr.ovenType);
  if (pr.ovenTemp !== undefined) q.set("temp", String(pr.ovenTemp));
  if (pr.usePreFerment) q.set("pf", "1");
  if (pr.selectedToppingConcept) q.set("topping", pr.selectedToppingConcept);
  if (r.versionId) q.set("v", r.versionId);
  return `/recipe/${r.styleId}?${q.toString()}`;
}

function SavedRecipesSection() {
  const { cms } = useCms();
  const p = cms.profile;
  const [recipes, setRecipes] = useState<SavedRecipe[]>(() => loadSavedRecipes());

  useEffect(() => {
    const sync = () => setRecipes(loadSavedRecipes());
    window.addEventListener("focus", sync);
    document.addEventListener("visibilitychange", sync);
    return () => {
      window.removeEventListener("focus", sync);
      document.removeEventListener("visibilitychange", sync);
    };
  }, []);

  if (recipes.length === 0) return null;

  return (
    <ProfileSection
      title={p.savedRecipesTitle}
      subtitle={p.savedRecipesSubtitle}
      delay={0.03}
    >
      <div className="flex flex-col gap-2">
        {recipes.map((r) => {
          const styleName = STYLES_DB[r.styleId]?.name ?? r.styleName;
          const meta = [
            formatSavedDate(r.createdAt),
            r.score != null ? `${r.score}/100` : null,
          ]
            .filter(Boolean)
            .join(" · ");
          return (
            <div
              key={r.id}
              className="relative flex items-center rounded-2xl"
              style={{
                background: "var(--surface-container-low)",
                border: "1px solid var(--outline-variant)",
              }}
            >
              <Link
                to={buildSavedRecipeUrl(r)}
                className="flex items-center gap-3 flex-1 min-w-0 px-3.5 py-3 active:scale-[0.99] transition-transform"
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <span
                  className="flex items-center justify-center rounded-xl flex-shrink-0"
                  style={{
                    width: 38,
                    height: 38,
                    background: "color-mix(in srgb, var(--primary) 10%, transparent)",
                    color: "var(--primary)",
                  }}
                >
                  <Bookmark size={17} fill="currentColor" />
                </span>
                <div className="flex flex-col min-w-0">
                  <span
                    className="truncate"
                    style={{
                      fontSize: "var(--font-size-lg)",
                      fontWeight: "var(--weight-semibold)" as any,
                      color: "var(--text-default)",
                    }}
                  >
                    {styleName}
                  </span>
                  <span
                    className="type-data"
                    style={{ fontSize: "var(--font-size-xs)", color: "var(--text-muted)" }}
                  >
                    {meta}
                  </span>
                </div>
              </Link>
              <button
                onClick={() => setRecipes(removeRecipe(r.id))}
                className="flex items-center justify-center flex-shrink-0 mr-2 rounded-full active:scale-90 transition-transform"
                style={{
                  width: 30,
                  height: 30,
                  background: "transparent",
                  border: "none",
                  color: "var(--text-muted)",
                  cursor: "pointer",
                }}
                aria-label={t(p.savedRecipeRemoveAria, { name: styleName })}
                title={p.savedRecipeRemove}
              >
                <X size={16} />
              </button>
            </div>
          );
        })}
      </div>
    </ProfileSection>
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
        <span style={{ fontSize: "var(--font-size-2-5xl)", flexShrink: 0 }}>{emoji}</span>
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
            className="type-data-base"
            style={{
              fontWeight: "var(--weight-medium)" as any,
              color: "var(--text-default)",
            }}
          >
            {title}
          </span>
          <div
            className="type-data-xs"
            style={{
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
          <ChevronDown size={16} style={{ color: "var(--icon-muted)" }} />
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
  /* Pantry: farine e lieviti per onboarding */
  const [ftuFlours, setFtuFlours] = useState<string[]>([]);
  const [ftuYeasts, setFtuYeasts] = useState<string[]>([]);
  /* Pantry: accordion farine speciali */
  const [showSpecialFlours, setShowSpecialFlours] = useState(false);

  /* Audit UX giugno 2026 — FTU ridotto a 3 domande + congedo.
   * Strumenti, superfici, dieta e posizione vivono nella pagina Profilo:
   * nessuna domanda tecnica prima di aver mostrato il valore dell'app. */
  const steps = [
    { num: "01", title: p.ftuOvenTitle, subtitle: p.ftuOvenSubtitle, optional: false },
    { num: "02", title: p.ftuSkillTitle, subtitle: p.ftuSkillSubtitle, optional: false },
    { num: "03", title: p.ftuPantryTitle, subtitle: p.ftuPantrySubtitle, optional: true },
    { num: "04", title: "Tutto pronto!", subtitle: "Creiamo la tua prima pizza", optional: false },
  ];
  const lastStep = steps.length - 1;

  const toggleArrayItem = (arr: string[], id: string): string[] =>
    arr.includes(id) ? arr.filter((x) => x !== id) : [...arr, id];

  const handleFinish = useCallback(() => {
    saveJson(OVEN_STORAGE_KEY, { ovenType, maxTemp: ovenTemp });
    saveJson(SKILL_STORAGE_KEY, skillLevel);
    // Pantry: salviamo solo se valorizzata
    if (ftuFlours.length > 0 || ftuYeasts.length > 0) {
      saveJson(PANTRY_STORAGE_KEY, { flours: ftuFlours, yeasts: ftuYeasts });
    }
    try {
      localStorage.setItem(PROFILE_COMPLETE_KEY, "true");
    } catch { /* */ }
    onComplete();
  }, [ovenType, ovenTemp, skillLevel, ftuFlours, ftuYeasts, onComplete]);

  const handleNext = useCallback(() => {
    if (step < lastStep) setStep((s) => s + 1);
    else handleFinish();
  }, [step, lastStep, handleFinish]);

  return (
    <main
      id="main-content"
      className="min-h-screen flex flex-col items-center justify-center px-6 py-12"
      style={{ background: "var(--container-page)", color: "var(--text-default)" }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        className="w-full"
        style={{ maxWidth: "var(--profile-card-max-width, 30rem)" }}
      >
        {/* Progress dots */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {steps.map((_, i) => (
            <div
              key={i}
              style={{
                width: i === step ? "var(--space-6)" : "var(--space-2)",
                height: "var(--space-2)",
                borderRadius: "var(--radius-xs)",
                background: i <= step ? "var(--primary)" : "var(--container-bg-high)",
                transition: "all 0.3s ease",
              }}
            />
          ))}
        </div>

        {/* Step header */}
        <div className="text-center mb-8">
          <span
            className="type-label-compact"
            style={{
              color: "var(--primary)",
              letterSpacing: "0.18em",
              textTransform: "uppercase" as any,
              fontWeight: "var(--weight-semibold)" as any,
            }}
          >
            {steps[step].num} — {p.ftuWelcome}
          </span>
          <Heading level="page" className="mt-2">
            {steps[step].title}
          </Heading>
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
                        <div className="type-data-sm" style={{ color: "var(--text-muted)", fontFeatureSettings: "'tnum'" }}>
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
                          fontSize: "var(--font-size-lg)",
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
                        <div className="type-data-sm" style={{ color: "var(--text-muted)" }}>
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
                {/* Pantry: farine */}
                <div>
                  <div className="type-label-compact" style={{ color: "var(--text-muted)", marginBottom: "var(--space-2)", letterSpacing: "0.05em", textTransform: "uppercase" as any }}>
                    {cms.ui.pantryFlours}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {FTU_FLOURS.map((f) => (
                      <Chip
                        key={f.id}
                        label={(p as any)[f.labelKey] || f.id}
                        active={ftuFlours.includes(f.id)}
                        onToggle={() => setFtuFlours((arr) => toggleArrayItem(arr, f.id))}
                      />
                    ))}
                  </div>
                  {/* Accordion farine speciali */}
                  <button
                    onClick={() => setShowSpecialFlours((v) => !v)}
                    className="flex items-center gap-1 mt-3 type-data-sm active:scale-95 transition-transform"
                    style={{
                      color: "var(--text-accent)",
                      fontWeight: "var(--weight-medium)" as any,
                      background: "transparent",
                      border: "none",
                      cursor: "pointer",
                    }}
                    aria-expanded={showSpecialFlours}
                  >
                    <ChevronDown
                      size={14}
                      style={{
                        transform: showSpecialFlours ? "rotate(180deg)" : "rotate(0deg)",
                        transition: "transform 0.2s",
                      }}
                    />
                    {p.specialFloursOnboarding}
                  </button>
                  {showSpecialFlours && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {FTU_FLOURS_SPECIAL.map((f) => (
                        <Chip
                          key={f.id}
                          label={(p as any)[f.labelKey] || f.id}
                          active={ftuFlours.includes(f.id)}
                          onToggle={() => setFtuFlours((arr) => toggleArrayItem(arr, f.id))}
                        />
                      ))}
                    </div>
                  )}
                </div>
                {/* Pantry: lieviti */}
                <div>
                  <div className="type-label-compact" style={{ color: "var(--text-muted)", marginBottom: "var(--space-2)", letterSpacing: "0.05em", textTransform: "uppercase" as any }}>
                    {cms.ui.pantryYeasts}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {FTU_YEASTS.map((y) => (
                      <Chip
                        key={y.id}
                        label={(p as any)[y.labelKey] || y.id}
                        active={ftuYeasts.includes(y.id)}
                        onToggle={() => setFtuYeasts((arr) => toggleArrayItem(arr, y.id))}
                      />
                    ))}
                  </div>
                </div>
                {ftuFlours.length === 0 && ftuYeasts.length === 0 && (
                  <p className="type-data-sm text-center" style={{ color: "var(--text-muted)", opacity: 0.6 }}>
                    {p.ftuSkipMessage}
                  </p>
                )}
              </div>
            )}

            {step === 3 && (
              <div className="flex flex-col gap-5">
                <div className="text-center" style={{ fontSize: "var(--font-size-8xl)" }}>🎉</div>
                <p style={{ fontSize: "var(--font-size-xl)", color: "var(--text-default)", textAlign: "center", lineHeight: 1.5 }}>
                  {p.ftuDoneTitle}
                </p>
                <ul style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)", paddingLeft: 0 }}>
                  <li className="flex items-start gap-3 p-3 rounded-xl" style={{ background: "var(--container-bg-low)", border: "1px solid var(--container-border)", listStyle: "none" }}>
                    <span style={{ fontSize: "var(--font-size-3xl)", flexShrink: 0 }}>🍕</span>
                    <div>
                      <div style={{ fontWeight: "var(--weight-semibold)" as any, color: "var(--text-default)" }}>
                        {p.ftuDoneCreateTitle}
                      </div>
                      <div
                        className="type-body-xs"
                        style={{ color: "var(--text-muted)" }}
                        dangerouslySetInnerHTML={{ __html: p.ftuDoneCreateDesc }}
                      />
                    </div>
                  </li>
                  <li className="flex items-start gap-3 p-3 rounded-xl" style={{ background: "var(--container-bg-low)", border: "1px solid var(--container-border)", listStyle: "none" }}>
                    <span style={{ fontSize: "var(--font-size-3xl)", flexShrink: 0 }}>📚</span>
                    <div>
                      <div style={{ fontWeight: "var(--weight-semibold)" as any, color: "var(--text-default)" }}>
                        {p.ftuDoneExploreTitle}
                      </div>
                      <div
                        className="type-body-xs"
                        style={{ color: "var(--text-muted)" }}
                        dangerouslySetInnerHTML={{ __html: p.ftuDoneExploreDesc }}
                      />
                    </div>
                  </li>
                  <li className="flex items-start gap-3 p-3 rounded-xl" style={{ background: "var(--container-bg-low)", border: "1px solid var(--container-border)", listStyle: "none" }}>
                    <span style={{ fontSize: "var(--font-size-3xl)", flexShrink: 0 }}>🎓</span>
                    <div>
                      <div style={{ fontWeight: "var(--weight-semibold)" as any, color: "var(--text-default)" }}>
                        {p.ftuDoneLearnTitle}
                      </div>
                      <div
                        className="type-body-xs"
                        style={{ color: "var(--text-muted)" }}
                        dangerouslySetInnerHTML={{ __html: p.ftuDoneLearnDesc }}
                      />
                    </div>
                  </li>
                </ul>
                <p
                  className="type-body-xs"
                  style={{ color: "var(--text-muted)", textAlign: "center", opacity: 0.7 }}
                  dangerouslySetInnerHTML={{ __html: p.ftuDoneProfileNote }}
                />
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
          <CtaButton
            as={motion.button}
            onClick={handleNext}
            className="px-6 py-2.5"
            style={{ fontSize: "var(--font-size-xl)" }}
          >
            {step < lastStep ? p.ftuNext : p.ftuStart}
            {step < lastStep ? <ChevronRight size={16} /> : <Sparkles size={16} />}
          </CtaButton>
        </div>
      </motion.div>
    </main>
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
  /* Resolve the target locale's profile bundle for bilingual display.
     Bundle lazy (audit lug 2026): se non è in cache lo si carica al volo —
     nel frattempo la modale mostra il fallback IT per una frazione di secondo. */
  const [tgtBundle, setTgtBundle] = useState<CmsContent | undefined>(() =>
    target.id === "it" ? CMS_DEFAULTS : getCachedLocaleBundle(target.id),
  );
  useEffect(() => {
    if (target.id === "it" || tgtBundle) return;
    let cancelled = false;
    void loadLocaleBundle(target.id).then((bundle) => {
      if (!cancelled && bundle) setTgtBundle(bundle);
    });
    return () => {
      cancelled = true;
    };
  }, [target.id, tgtBundle]);
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
          background: "var(--dialog-scrim)",
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
          boxShadow: "var(--dialog-shadow-compact)",
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
          <Heading level="sm">
            {srcProfile.localeModalTitle}
          </Heading>
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
            className="type-body-sm"
            style={{
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
            className="flex-1 px-4 py-2.5 rounded-xl type-data-base active:scale-95 transition-transform"
            style={{
              background: "var(--surface-container)",
              border: "1px solid var(--container-border)",
              color: "var(--text-default)",
              fontWeight: "var(--weight-medium)" as any,
              cursor: "pointer",
            }}
          >
            {srcProfile.localeModalCancel}
          </button>
          <CtaButton
            onClick={onConfirm}
            radius="xl"
            className="flex-1 px-4 py-2.5"
            style={{ fontSize: "var(--font-size-base)" }}
          >
            {tgtProfile.localeModalConfirm}
          </CtaButton>
        </div>
      </motion.div>
    </div>,
    document.body,
  );
}

/* ═══ PROFILE PAGE (MAIN) ═══ */
export function ProfilePage() {
  const { themeMode, setThemeMode, devMode, setDevMode } = useDarkMode();
  const { cms, switchLocale, bcp47 } = useCms();
  const navigate = useNavigate();
  const p = cms.profile;

  /* CMS-localized equipment data */
  const localMixers = useMemo(() => getLocalizedMixerOptions(p), [p]);
  const localSurfaces = useMemo(() => getLocalizedSurfaceOptions(p), [p]);
  const localTools = useMemo(() => getLocalizedToolOptions(p), [p]);
  const localToolCats = useMemo(() => getLocalizedToolCategories(p), [p]);

  /* FTU detection */
  const [showFtu, setShowFtu] = useState(() => {
    return (
      loadString(PROFILE_COMPLETE_KEY) !== "true" &&
      loadSavedRecipes().length === 0 &&
      loadFavoriteStyles().length === 0
    );
  });

  /* Locale confirmation modal */
  const [pendingLocale, setPendingLocale] = useState<LocaleMeta | null>(null);

  const [ovens, setOvens] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("vulcan_ovens");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      const legacyOven = localStorage.getItem("vulcan_oven");
      if (legacyOven) {
        localStorage.removeItem("vulcan_oven");
        const val = [legacyOven];
        localStorage.setItem("vulcan_ovens", JSON.stringify(val));
        return val;
      }
      const savedPref = localStorage.getItem(OVEN_STORAGE_KEY);
      if (savedPref) {
        const parsed = JSON.parse(savedPref);
        if (parsed?.ovenType) {
          const val = [parsed.ovenType];
          localStorage.setItem("vulcan_ovens", JSON.stringify(val));
          return val;
        }
      }
    } catch (e) {
      // ignore
    }
    return ["home"];
  });

  const ovenType = ovens[0] as OvenType;

  const [ovenTemp, setOvenTemp] = useState(() => {
    const saved = loadJson<{ ovenType: OvenType; maxTemp: number }>(OVEN_STORAGE_KEY);
    return saved?.maxTemp ?? 250;
  });

  const [mixers, setMixers] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("vulcan_mixers");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      const legacyMixer = localStorage.getItem("vulcan_mixer");
      if (legacyMixer) {
        localStorage.removeItem("vulcan_mixer");
        const val = [legacyMixer];
        localStorage.setItem("vulcan_mixers", JSON.stringify(val));
        return val;
      }
      const savedEquip = localStorage.getItem(EQUIPMENT_STORAGE_KEY);
      if (savedEquip) {
        const parsed = JSON.parse(savedEquip);
        if (parsed?.mixer_type) {
          const val = [parsed.mixer_type];
          localStorage.setItem("vulcan_mixers", JSON.stringify(val));
          return val;
        }
      }
    } catch (e) {
      // ignore
    }
    /* Audit roleplay giugno 2026: era ["hand"] (singolare) — non matchava il
     * MixerType canonico "hands" e faceva risultare un'impastatrice a chi
     * impasta a mano. */
    return ["hands"];
  });
  const [skillLevel, setSkillLevel] = useState<SkillLevel>(() => {
    const saved = loadJson<SkillLevel>(SKILL_STORAGE_KEY);
    return saved ?? 2;
  });
  const [pizzaNerd, setPizzaNerd] = useState<boolean>(() => {
    try {
      return (
        localStorage.getItem(NERD_STORAGE_KEY) === "true" ||
        localStorage.getItem("vulcan_view_mode") === "nerd"
      );
    } catch {
      return false;
    }
  });
  const [unitSystem, setUnitSystem] = useState<UnitSystem>(() => getPreferredUnitSystem());
  const fmt = useMemo(
    () => createFormatter(cms.ui, bcp47, unitSystem),
    [cms.ui, bcp47, unitSystem],
  );
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

  const toggleMixer = useCallback((id: string) => {
    setMixers((prev) => {
      if (prev.includes(id)) {
        if (prev.length === 1) return prev;
        return prev.filter((x) => x !== id);
      } else {
        return [...prev, id];
      }
    });
  }, []);

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
    try {
      localStorage.setItem("vulcan_ovens", JSON.stringify(ovens));
    } catch (e) {
      // ignore
    }
  }, [ovens, ovenType, ovenTemp]);

  useEffect(() => {
    try {
      localStorage.setItem("vulcan_mixers", JSON.stringify(mixers));
    } catch (e) {
      // ignore
    }
    setEquipment((prev) => {
      const primaryMixer = mixers[0] as MixerType;
      const next = {
        ...prev,
        mixer_type: primaryMixer,
        mixers_owned: mixers as MixerType[],
      };
      saveJson(EQUIPMENT_STORAGE_KEY, next);
      return next;
    });
  }, [mixers]);

  useEffect(() => {
    saveJson(SKILL_STORAGE_KEY, skillLevel);
  }, [skillLevel]);

  useEffect(() => {
    saveJson(DIETARY_STORAGE_KEY, dietary);
  }, [dietary]);
  useEffect(() => {
    try {
      localStorage.setItem(NERD_STORAGE_KEY, String(pizzaNerd));
      localStorage.removeItem("vulcan_view_mode");
    } catch { /* */ }
  }, [pizzaNerd]);

  useEffect(() => {
    savePreferredUnitSystem(unitSystem);
  }, [unitSystem]);
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
            setOvens([oven.ovenType]);
            setOvenTemp(oven.maxTemp);
          }
          const skill = loadJson<SkillLevel>(SKILL_STORAGE_KEY);
          if (skill) setSkillLevel(skill);
          const loc = loadJson<SavedLocation>(LOCATION_STORAGE_KEY);
          if (loc) setSavedLocation(loc);
          /* Audit UX giugno 2026 — "Inizia" mantiene la promessa: si atterra
           * su Crea, non sulla pagina impostazioni. */
          navigate("/");
        }}
      />
    );
  }

  return (
    <main
      id="main-content"
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
          <Heading level="page">
            {p.pageTitle}
          </Heading>
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

        {/* ── STILI PREFERITI + RICETTARIO (R31) — visibili solo se ne hai ── */}
        <FavoriteStylesSection />
        <SavedRecipesSection />

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
              const active = ovens.includes(preset.id);
              return (
                <motion.button
                  key={preset.id}
                  layout
                  onClick={() => {
                    setOvens((prev) => {
                      if (prev.includes(preset.id)) {
                        if (prev.length === 1) return prev;
                        return prev.filter((x) => x !== preset.id);
                      }

                      setOvenTemp(preset.maxTemp);
                      return [preset.id, ...prev.filter((x) => x !== preset.id)];
                    });
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
                    <span className="type-body-sm" style={{ fontWeight: "var(--weight-medium)" as any, color: "var(--text-default)" }}>
                      {preset.name}
                    </span>
                  </div>
                  <span
                    className="type-data flex-shrink-0"
                    style={{ fontSize: "var(--font-size-sm)", color: "var(--text-muted)", fontFeatureSettings: "'tnum'" }}
                  >
                    {fmt.celsius(preset.maxTemp)}
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
              <span className="type-data-sm" style={{ color: "var(--text-muted)" }}>
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
                {fmt.celsius(ovenTemp)}
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
                        fontSize: "var(--font-size-base)",
                        fontWeight: "var(--weight-bold)" as any,
                        fontFeatureSettings: "'tnum'",
                      }}
                    >
                      LV{skill.level}
                    </motion.span>
                    <span className="type-body-sm" style={{ fontWeight: "var(--weight-medium)" as any, color: "var(--text-default)" }}>
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
                  <span className="type-data-xs" style={{ color: "var(--text-muted)" }}>
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
          title={p.equipTitle}
          subtitle={p.equipSubtitle}
          stepNum={p.equipStep}
          delay={0.15}
        >
          <div className="flex flex-col gap-3">
            {/* ── Impastamento ── */}
            <EquipmentCategory
              title={p.equipMixerTitle}
              emoji="🤲"
              stepLabel={p.equipMixerTitle.toUpperCase()}
              expanded={equipExpandedCat === "mixer"}
              onToggle={() => setEquipExpandedCat(equipExpandedCat === "mixer" ? null : "mixer")}
              summary={mixers.length > 0
                ? mixers.map(id => localMixers.find((m) => m.id === id)?.label ?? "").filter(Boolean).join(", ")
                : p.equipSummaryNone}
              hasSelection={mixers.length > 0}
            >
              <div className="flex flex-col gap-1.5">
                {localMixers.map((mixer) => {
                  const active = mixers.includes(mixer.id);
                  return (
                    <motion.button
                      key={mixer.id}
                      onClick={() => toggleMixer(mixer.id)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg active:scale-[0.98]"
                      animate={{
                        backgroundColor: active ? "var(--surface-container)" : "transparent",
                        borderColor: active ? "var(--primary)" : "var(--container-border)",
                      }}
                      transition={{ type: "spring", stiffness: 500, damping: 35 }}
                      style={{ borderWidth: 1, borderStyle: "solid", cursor: "pointer", textAlign: "left" as any }}
                    >
                      <span style={{ fontSize: "var(--font-size-xl-5)", flexShrink: 0 }}>{mixer.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="type-body-sm" style={{ fontWeight: "var(--weight-medium)" as any, color: "var(--text-default)" }}>
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
                        <div className="type-data-xs" style={{ color: "var(--text-muted)", marginTop: 1 }}>
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
              title={p.equipSurfaceTitle}
              emoji="♨️"
              stepLabel={p.equipSurfaceTitle.toUpperCase()}
              expanded={equipExpandedCat === "surface"}
              onToggle={() => setEquipExpandedCat(equipExpandedCat === "surface" ? null : "surface")}
              summary={equipment.surfaces.length > 0
                ? equipment.surfaces.map((s) => localSurfaces.find((o) => o.id === s)?.label ?? s).join(", ")
                : p.equipSummaryNone}
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
                        backgroundColor: active ? "var(--surface-container)" : "transparent",
                        borderColor: active ? "var(--primary)" : "var(--container-border)",
                      }}
                      transition={{ type: "spring", stiffness: 500, damping: 35 }}
                      style={{ borderWidth: 1, borderStyle: "solid", cursor: "pointer", textAlign: "left" as any }}
                    >
                      <span style={{ fontSize: "var(--font-size-xl-5)", flexShrink: 0 }}>{surface.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="type-body-sm" style={{ fontWeight: "var(--weight-medium)" as any, color: "var(--text-default)" }}>
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
                        <div className="type-data-xs" style={{ color: "var(--text-muted)", marginTop: 1 }}>
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
              title={p.equipToolsTitle}
              emoji="🔧"
              stepLabel={(p.equipToolsTitle).toUpperCase()}
              expanded={equipExpandedCat === "tools"}
              onToggle={() => setEquipExpandedCat(equipExpandedCat === "tools" ? null : "tools")}
              summary={equipment.tools.length > 0
                ? (p.equipSummarySelected).replace("{count}", String(equipment.tools.length))
                : p.equipSummaryNone}
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
                          <Chip
                            key={tool.id}
                            label={tool.label}
                            active={equipment.tools.includes(tool.id)}
                            onToggle={() => toggleTool(tool.id)}
                            icon={<span style={{ fontSize: "var(--font-size-base)" }}>{tool.emoji}</span>}
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
                    <span className="type-data-xs px-2 py-0.5 rounded-md" style={{ background: "var(--surface-container)", border: "1px solid var(--outline-variant)", color: "var(--text-default)" }}>
                      {localMixers.find((m) => m.id === equipment.mixer_type)?.emoji} {localMixers.find((m) => m.id === equipment.mixer_type)?.label}
                    </span>
                  )}
                  {equipment.surfaces.map((s) => {
                    const opt = localSurfaces.find((o) => o.id === s);
                    return (
                      <span key={s} className="type-data-xs px-2 py-0.5 rounded-md" style={{ background: "var(--surface-container)", border: "1px solid var(--outline-variant)", color: "var(--text-default)" }}>
                        {opt?.emoji} {opt?.label}
                      </span>
                    );
                  })}
                  {equipment.tools.length > 0 && (
                    <span className="type-data-xs px-2 py-0.5 rounded-md" style={{ background: "var(--surface-container)", border: "1px solid var(--outline-variant)", color: "var(--text-muted)" }}>
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
                <Chip
                  key={d.id}
                  label={(p as any)[d.labelKey] || d.labelKey}
                  active={dietary.includes(d.id)}
                  onToggle={() => toggleDietary(d.id)}
                  icon={<Icon size={14} />}
                />
              );
            })}
          </div>
          {dietary.length === 0 && (
            <p className="type-data-sm mt-3" style={{ color: "var(--text-muted)", opacity: 0.6 }}>
              {p.noDietNote}
            </p>
          )}
        </ProfileSection>

        {/* ── POSIZIONE ── */}
        <ProfileSection
          title={p.locationTitle}
          subtitle={p.locationSubtitle}
          stepNum={p.locationStep}
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
                  <div className="type-body-sm" style={{ fontWeight: "var(--weight-semibold)" as any, color: "var(--text-default)" }}>
                    {savedLocation.city || `${savedLocation.lat.toFixed(2)}, ${savedLocation.lon.toFixed(2)}`}
                  </div>
                  {/* Il titolo mostra già città o coordinate: qui solo lo stato. */}
                  <div className="type-data-xs" style={{ color: "var(--text-muted)", fontFeatureSettings: "'tnum'" }}>
                    {p.locationSaved}
                  </div>
                </div>
                <IconButton
                  onClick={clearLocation}
                  size="sm"
                  radius="lg"
                  variant="ghost"
                  className="flex-shrink-0 active:scale-95 transition-transform"
                  style={{ background: "var(--container-bg)", border: "1px solid var(--container-border)" }}
                  aria-label={p.locationRemove}
                >
                  <X size={12} style={{ color: "var(--icon-muted)" }} />
                </IconButton>
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
                  <Loader2 size={14} className="animate-spin" style={{ color: "var(--icon-muted)", flexShrink: 0 }} />
                ) : (
                  <Search size={14} style={{ color: "var(--icon-muted)", flexShrink: 0 }} />
                )}
                <input
                  type="text"
                  value={locationQuery}
                  onChange={(e) => setLocationQuery(e.target.value)}
                  placeholder={p.locationPlaceholder}
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
                    aria-label={cms.pages.searchClearLabel}
                  >
                    <X size={14} style={{ color: "var(--icon-muted)" }} />
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
                      boxShadow: "0 8px 24px color-mix(in srgb, var(--shadow-color) 12%, transparent)",
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
                          <MapPin size={13} style={{ color: "var(--icon-muted)", flexShrink: 0 }} />
                          <div className="flex-1 min-w-0">
                            <div className="type-body-sm" style={{ fontWeight: "var(--weight-medium)" as any, color: "var(--text-default)" }}>
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
                  {p.locationNoResults}
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
              {p.locationAuto}
            </motion.button>

            {/* Hint when no location */}
            {!savedLocation && (
              <p className="type-data-sm" style={{ color: "var(--text-muted)", opacity: 0.6 }}>
                {p.locationNone}
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
                      backgroundColor: currentLocale.id === locale.id ? "var(--chip-bg-active)" : "var(--chip-bg)",
                      color: currentLocale.id === locale.id ? "var(--chip-text-active)" : "var(--chip-text)",
                      borderColor: currentLocale.id === locale.id ? "var(--chip-bg-active)" : "var(--chip-border)",
                    }}
                    transition={{ type: "spring", stiffness: 500, damping: 35 }}
                    style={{
                      borderWidth: 1,
                      borderStyle: "solid",
                      fontSize: "var(--font-size-md)",
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
              <SegmentedControl
                ariaLabel={p.themeLabel}
                tone="brand"
                value={themeMode}
                onValueChange={setThemeMode}
                options={[
                  { value: "light", label: p.themeLight, icon: <Sun size={14} /> },
                  { value: "dark", label: p.themeDark, icon: <Moon size={14} /> },
                  { value: "auto", label: p.themeAuto, icon: <Monitor size={14} /> },
                ]}
              />
            </div>

          </div>
        </ProfileSection>

        {/* ── MISURE ── */}
        <ProfileSection
          title={p.unitTitle}
          subtitle={p.unitSubtitle}
          stepNum={p.unitStep}
          delay={0.3}
        >
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
              {p.unitSystemLabel}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {([
                {
                  id: "metric" as UnitSystem,
                  label: p.unitMetric,
                  desc: p.unitMetricDesc,
                },
                {
                  id: "imperial" as UnitSystem,
                  label: p.unitImperial,
                  desc: p.unitImperialDesc,
                },
              ]).map((option) => {
                const active = unitSystem === option.id;
                return (
                  <motion.button
                    key={option.id}
                    type="button"
                    onClick={() => setUnitSystem(option.id)}
                    className="flex items-start gap-3 p-3 sm:p-4 rounded-xl text-left active:scale-[0.98]"
                    initial={false}
                    animate={{
                      backgroundColor: active ? "var(--surface-container)" : "var(--container-bg-low)",
                      borderColor: active ? "var(--primary)" : "var(--container-border)",
                    }}
                    transition={{ type: "spring", stiffness: 500, damping: 35 }}
                    style={{
                      borderWidth: 1.5,
                      borderStyle: "solid",
                      cursor: "pointer",
                    }}
                    aria-pressed={active}
                  >
                    <Thermometer
                      size={17}
                      style={{
                        color: active ? "var(--primary)" : "var(--text-muted)",
                        flexShrink: 0,
                        marginTop: 1,
                      }}
                    />
                    <span className="flex-1 min-w-0">
                      <span className="type-body-sm" style={{ display: "block", fontWeight: "var(--weight-semibold)" as any, color: "var(--text-default)" }}>
                        {option.label}
                      </span>
                      <span className="type-data-xs" style={{ display: "block", marginTop: 3, color: "var(--text-muted)", lineHeight: "var(--leading-normal)" }}>
                        {option.desc}
                      </span>
                    </span>
                    {active && <Check size={15} style={{ color: "var(--primary)", flexShrink: 0 }} />}
                  </motion.button>
                );
              })}
            </div>
          </div>
        </ProfileSection>

        {/* ── PIZZANERD ── */}
        <ProfileSection
          title={p.pizzaNerdTitle}
          subtitle={p.pizzaNerdSubtitle}
          stepNum={p.pizzaNerdStep}
          delay={0.35}
        >
          <button
            type="button"
            onClick={() => setPizzaNerd((value) => !value)}
            className="w-full flex items-center gap-3 rounded-2xl px-4 py-3.5 text-left active:scale-[0.99] transition-transform"
            style={{
              background: pizzaNerd
                ? "color-mix(in srgb, var(--primary) 10%, var(--container-bg))"
                : "var(--container-bg-low)",
              border: pizzaNerd
                ? "1px solid color-mix(in srgb, var(--primary) 32%, var(--container-border))"
                : "1px solid var(--container-border)",
              color: "var(--text-default)",
              cursor: "pointer",
            }}
            aria-pressed={pizzaNerd}
          >
            <span
              className="flex items-center justify-center rounded-xl flex-shrink-0"
              style={{
                width: 38,
                height: 38,
                background: pizzaNerd
                  ? "color-mix(in srgb, var(--primary) 14%, var(--container-bg))"
                  : "var(--surface-container)",
                color: pizzaNerd ? "var(--primary)" : "var(--text-muted)",
              }}
            >
              <Beaker size={17} />
            </span>
            <span className="flex-1 min-w-0">
              <span
                className="block"
                style={{
                  fontSize: "var(--font-size-lg)",
                  fontWeight: "var(--weight-semibold)" as any,
                  lineHeight: "var(--leading-tight)",
                }}
              >
                {p.pizzaNerdCardTitle}
              </span>
              <span
                className="block"
                style={{
                  color: "var(--text-muted)",
                  fontSize: "var(--font-size-md)",
                  lineHeight: "var(--leading-normal)",
                  marginTop: 2,
                }}
              >
                {p.pizzaNerdCardDesc}
              </span>
            </span>
            <span
              className="relative rounded-full flex-shrink-0"
              style={{
                width: 44,
                height: 26,
                background: pizzaNerd ? "var(--primary)" : "var(--container-border)",
              }}
            >
              <motion.span
                className="absolute top-1 rounded-full"
                animate={{ left: pizzaNerd ? 22 : 4 }}
                transition={{ type: "spring", stiffness: 500, damping: 32 }}
                style={{
                  width: 18,
                  height: 18,
                  background: "var(--container-bg)",
                  boxShadow: "0 1px 3px color-mix(in srgb, var(--shadow-color) 18%, transparent)",
                }}
              />
            </span>
          </button>
        </ProfileSection>

        {/* Reset profile — Audit Sprint 12: chiede conferma prima di resettare */}
        <div className="mt-8 flex flex-col items-center gap-3">
          <button
            onClick={() => {
              const ok = window.confirm(p.resetConfirmMessage);
              if (!ok) return;
              try {
                localStorage.removeItem(PROFILE_COMPLETE_KEY);
              } catch { /* */ }
              setShowFtu(true);
            }}
            className="type-data px-4 py-2 rounded-lg active:scale-95 transition-transform"
            style={{
              fontSize: "var(--font-size-sm)",
              color: "var(--text-muted)",
              background: "transparent",
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
              backgroundColor: devMode ? "var(--surface-container)" : "transparent",
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
    </main>
  );
}
