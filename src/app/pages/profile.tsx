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
import { AnimatePresence,motion, useReducedMotion } from "motion/react";
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
OvenHeatProfile,
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
} from "../adapters/browser/saved-recipes-storage";
import { useDarkMode } from "../hooks/use-dark-mode";
import { motionDelay,motionDuration,motionSpring } from "../components/ds/motion";
import { uiMessage } from "../i18n/ui-messages";

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

const OVEN_HEAT_PROFILES: {
  id: OvenHeatProfile;
  label: string;
  description: string;
  bestFor: OvenType[];
}[] = [
  {
    id: "static_top_bottom",
    label: uiMessage("pages.profile.sopra-sotto-3f886947"),
    description: uiMessage("pages.profile.statico-classico-equilibrio-fra-base-e-cie-6cb08433"),
    bestFor: ["home", "electric_standard", "electric_high"],
  },
  {
    id: "top_grill",
    label: uiMessage("pages.profile.grill-superiore-4368292b"),
    description: uiMessage("pages.profile.cielo-forte-per-cornicione-e-doratura-fina-8d35d50c"),
    bestFor: ["home", "electric_standard"],
  },
  {
    id: "bottom_boost",
    label: uiMessage("pages.profile.spinta-dal-basso-e8551eab"),
    description: uiMessage("pages.profile.base-intensa-utile-per-teglie-acciaio-e-cr-cee70bcc"),
    bestFor: ["electric_standard", "electric_high"],
  },
  {
    id: "fan_assisted",
    label: uiMessage("pages.profile.ventilato-c306cb96"),
    description: uiMessage("pages.profile.aria-in-movimento-asciuga-e-uniforma-va-ge-df314474"),
    bestFor: ["home", "electric_standard"],
  },
  {
    id: "gas_bottom",
    label: uiMessage("pages.profile.gas-sotto-011dc103"),
    description: uiMessage("pages.profile.fiamma-sotto-la-platea-rotazione-a-meta-co-a0eff472"),
    bestFor: ["gas"],
  },
  {
    id: "gas_rear",
    label: uiMessage("pages.profile.bruciatore-dietro-443293a0"),
    description: uiMessage("pages.profile.calore-direzionale-rotazioni-frequenti-e-p-b0292f9e"),
    bestFor: ["gas"],
  },
  {
    id: "wood_side_flame",
    label: uiMessage("pages.profile.fiamma-laterale-ebdd6232"),
    description: uiMessage("pages.profile.fiamma-viva-di-lato-gestione-come-forno-a--d630082c"),
    bestFor: ["wood"],
  },
];

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
  delay = motionDelay.none,
}: {
  title: string;
  subtitle?: string;
  stepNum?: string;
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <motion.section
      data-region="section"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...motionSpring.standard,delay }}
      className="profile-section"
    >
      <div data-region="section-header" className="profile-section__header">
        {stepNum && (() => {
          const cleanStepNum = stepNum.split(/[-—]/)[0].trim();
          return (
            <span className="type-label-compact profile-section__step">
              {cleanStepNum}
            </span>
          );
        })()}
        <Heading
          level="md"
          as="h2"
          className={stepNum ? "profile-section__title" : "profile-section__title--flush"}
        >
          {title}
        </Heading>
        {subtitle && (
          <p className="profile-section__subtitle">
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
      delay={motionDelay.profileIntro}
    >
      <div data-region="collection" className="profile-favorites">
        {styles.map((style) => (
          <div key={style.id} className="profile-favorites__item">
            <Link
              to={`/recipe/${style.id}?mode=canonical`}
              className="profile-favorites__link"
            >
              <div className="profile-favorites__media">
                <ImageWithFallback
                  src={STYLE_PHOTOS[style.id]}
                  alt={style.name}
                  className="profile-favorites__img"
                  loading="lazy"
                />
                <div className="profile-favorites__scrim" />
                <span className="profile-favorites__label">
                  {style.name}
                </span>
              </div>
            </Link>
            <button
              onClick={() => setFavs(toggleFavoriteStyle(style.id))}
              className="profile-favorites__remove"
              aria-label={t(p.favoriteRemoveAria, { name: style.name })}
              title={p.favoriteRemove}
            >
              <Heart size={15} fill="var(--primary)" className="profile-favorites__remove-icon" />
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

  return (
    <ProfileSection
      title={p.savedRecipesTitle}
      subtitle={p.savedRecipesSubtitle}
      delay={motionDelay.profileIntroStep}
    >
      {recipes.length === 0 ? (
        <div className="profile-saved-recipes__empty">
          <span className="profile-saved-recipes__empty-icon" aria-hidden="true">
            <Bookmark size={22} />
          </span>
          <div className="profile-saved-recipes__empty-copy">
            <Heading level="sm" as="h3">
              {p.savedRecipesEmptyTitle}
            </Heading>
            <p>{p.savedRecipesEmptyBody}</p>
          </div>
          <CtaButton as={Link} to="/explore" variant="secondary" radius="lg">
            {p.savedRecipesEmptyCta}
            <ChevronRight size={17} aria-hidden="true" />
          </CtaButton>
        </div>
      ) : (
        <div className="profile-saved-recipes">
          {recipes.map((r) => {
            const styleName = STYLES_DB[r.styleId]?.name ?? r.styleName;
            const meta = [
              formatSavedDate(r.createdAt),
              r.score != null ? `${r.score}/100` : null,
            ]
              .filter(Boolean)
              .join(" · ");
            return (
              <div key={r.id} className="profile-saved-recipes__item">
                <Link
                  to={buildSavedRecipeUrl(r)}
                  className="profile-saved-recipes__link"
                >
                  <span className="profile-saved-recipes__icon">
                    <Bookmark size={17} fill="currentColor" />
                  </span>
                  <div className="profile-saved-recipes__info">
                    <span className="profile-saved-recipes__name">
                      {styleName}
                    </span>
                    <span className="type-data profile-saved-recipes__meta">
                      {meta}
                    </span>
                  </div>
                </Link>
                <button
                  onClick={() => setRecipes(removeRecipe(r.id))}
                  className="profile-saved-recipes__remove"
                  aria-label={t(p.savedRecipeRemoveAria, { name: styleName })}
                  title={p.savedRecipeRemove}
                >
                  <X size={16} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </ProfileSection>
  );
}

/* ═══ EQUIPMENT CATEGORY ACCORDION ═══ */
function EquipmentCategory({
  title,
  stepLabel,
  expanded,
  onToggle,
  summary,
  hasSelection,
  children,
}: {
  title: string;
  stepLabel: string;
  expanded: boolean;
  onToggle: () => void;
  summary: string;
  hasSelection: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`profile-equip-cat${hasSelection ? " profile-equip-cat--selected" : ""}`}
    >
      <motion.button
        onClick={onToggle}
        className="profile-equip-cat__trigger"
      >
        <div className="profile-equip-cat__body">
          <div className="profile-equip-cat__step-row">
            <span
              className={`profile-equip-cat__step${hasSelection ? " profile-equip-cat__step--selected" : ""}`}
            >
              {stepLabel}
            </span>
          </div>
          <span className="type-data-base profile-equip-cat__title">
            {title}
          </span>
          <div
            className={`type-data-xs profile-equip-cat__summary${hasSelection ? " profile-equip-cat__summary--selected" : ""}`}
          >
            {summary}
          </div>
        </div>
        <motion.div
          animate={{ rotate: expanded ? 180 : 0 }}
          transition={motionSpring.crispControl}
          className="profile-equip-cat__chevron"
        >
          <ChevronDown size={16} className="profile-equip-cat__chevron-icon" />
        </motion.div>
      </motion.button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={motionSpring.standard}
            className="profile-equip-cat__panel"
          >
            <div className="profile-equip-cat__panel-inner">
              <div className="profile-equip-cat__panel-content">
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
    { num: "04", title: uiMessage("pages.profile.tutto-pronto-0d7ff4fd"), subtitle: uiMessage("pages.profile.creiamo-la-tua-prima-pizza-96bbe504"), optional: false },
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
      className="profile-ftu"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={motionSpring.standard}
        className="profile-ftu__card"
      >
        {/* Progress dots */}
        <div className="profile-ftu__dots">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`profile-ftu__dot${i === step ? " profile-ftu__dot--current" : ""}${i <= step ? " profile-ftu__dot--filled" : ""}`}
            />
          ))}
        </div>

        {/* Step header */}
        <div className="profile-ftu__step-header">
          <span className="type-label-compact profile-ftu__step-label">
            {steps[step].num} — {p.ftuWelcome}
          </span>
          <Heading level="page" className="profile-ftu__step-title">
            {steps[step].title}
          </Heading>
          <p className="profile-ftu__step-subtitle">
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
            transition={motionSpring.standard}
          >
            {step === 0 && (
              <div className="profile-ftu__option-list">
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
                      className="profile-ftu__option"
                      animate={{
                        backgroundColor: active ? "var(--surface-container)" : "var(--container-bg-low)",
                        borderColor: active ? "var(--primary)" : "var(--container-border)",
                      }}
                      transition={motionSpring.crispPanel}
                    >
                      <motion.div
                        className="profile-ftu__option-icon"
                        animate={{
                          backgroundColor: active ? "var(--surface-container)" : "var(--container-bg)",
                        }}
                        transition={motionSpring.crispPanel}
                      >
                        <motion.div
                          animate={{ color: active ? "var(--primary)" : "var(--text-muted)" }}
                          transition={motionSpring.crispPanel}
                        >
                          <Icon size={20} />
                        </motion.div>
                      </motion.div>
                      <div className="profile-ftu__option-body">
                        <div className="profile-ftu__option-name">
                          {preset.name}
                        </div>
                        <div className="type-data-sm profile-ftu__option-meta">
                          {uiMessage("pages.profile.max-3c624fea")}{preset.maxTemp}°C
                        </div>
                      </div>
                      {active && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={motionSpring.crisp}
                        >
                          <Check size={18} className="profile-ftu__option-check" />
                        </motion.div>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            )}

            {step === 1 && (
              <div className="profile-ftu__option-list">
                {SKILL_LEVELS.map((skill) => {
                  const active = skillLevel === skill.level;
                  return (
                    <motion.button
                      key={skill.level}
                      onClick={() => setSkillLevel(skill.level as SkillLevel)}
                      className="profile-ftu__option"
                      animate={{
                        backgroundColor: active ? "var(--surface-container)" : "var(--container-bg-low)",
                        borderColor: active ? "var(--primary)" : "var(--container-border)",
                      }}
                      transition={motionSpring.crispPanel}
                    >
                      <motion.div
                        className="profile-ftu__option-icon profile-ftu__option-icon--level"
                        animate={{
                          backgroundColor: active ? "var(--surface-container)" : "var(--container-bg)",
                          color: active ? "var(--primary)" : "var(--text-muted)",
                        }}
                        transition={motionSpring.crispPanel}
                      >
                        {skill.level}
                      </motion.div>
                      <div className="profile-ftu__option-body">
                        <div className="profile-ftu__option-name">
                          {skill.name}
                        </div>
                        <div className="type-data-sm profile-ftu__option-meta">
                          {skill.description}
                        </div>
                      </div>
                      {active && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={motionSpring.crisp}
                        >
                          <Check size={18} className="profile-ftu__option-check" />
                        </motion.div>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            )}

            {step === 2 && (
              <div className="profile-ftu__pantry">
                {/* Pantry: farine */}
                <div className="profile-ftu__pantry-group">
                  <div className="type-label-compact profile-ftu__pantry-label">
                    {cms.ui.pantryFlours}
                  </div>
                  <div className="profile-ftu__pantry-chips">
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
                    className="type-data-sm profile-ftu__pantry-toggle"
                    aria-expanded={showSpecialFlours}
                  >
                    <ChevronDown
                      size={14}
                      className={`profile-ftu__pantry-chevron${showSpecialFlours ? " profile-ftu__pantry-chevron--open" : ""}`}
                    />
                    {p.specialFloursOnboarding}
                  </button>
                  {showSpecialFlours && (
                    <div className="profile-ftu__pantry-chips profile-ftu__pantry-chips--nested">
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
                <div className="profile-ftu__pantry-group">
                  <div className="type-label-compact profile-ftu__pantry-label">
                    {cms.ui.pantryYeasts}
                  </div>
                  <div className="profile-ftu__pantry-chips">
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
                  <p className="type-data-sm profile-ftu__pantry-skip">
                    {p.ftuSkipMessage}
                  </p>
                )}
              </div>
            )}

            {step === 3 && (
              <div className="profile-ftu__done">
                <div className="profile-ftu__done-emoji">🎉</div>
                <p className="profile-ftu__done-title">
                  {p.ftuDoneTitle}
                </p>
                <ul className="profile-ftu__done-list">
                  <li className="profile-ftu__done-item">
                    <span className="profile-ftu__done-item-emoji">🍕</span>
                    <div className="profile-ftu__done-item-body">
                      <div className="profile-ftu__done-item-title">
                        {p.ftuDoneCreateTitle}
                      </div>
                      <div
                        className="type-body-xs profile-ftu__done-item-desc"
                        dangerouslySetInnerHTML={{ __html: p.ftuDoneCreateDesc }}
                      />
                    </div>
                  </li>
                  <li className="profile-ftu__done-item">
                    <span className="profile-ftu__done-item-emoji">📚</span>
                    <div className="profile-ftu__done-item-body">
                      <div className="profile-ftu__done-item-title">
                        {p.ftuDoneExploreTitle}
                      </div>
                      <div
                        className="type-body-xs profile-ftu__done-item-desc"
                        dangerouslySetInnerHTML={{ __html: p.ftuDoneExploreDesc }}
                      />
                    </div>
                  </li>
                  <li className="profile-ftu__done-item">
                    <span className="profile-ftu__done-item-emoji">🎓</span>
                    <div className="profile-ftu__done-item-body">
                      <div className="profile-ftu__done-item-title">
                        {p.ftuDoneLearnTitle}
                      </div>
                      <div
                        className="type-body-xs profile-ftu__done-item-desc"
                        dangerouslySetInnerHTML={{ __html: p.ftuDoneLearnDesc }}
                      />
                    </div>
                  </li>
                </ul>
                <p
                  className="type-body-xs profile-ftu__done-footnote"
                  dangerouslySetInnerHTML={{ __html: p.ftuDoneProfileNote }}
                />
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="profile-ftu__nav">
          {step > 0 ? (
            <button
              onClick={() => setStep((s) => s - 1)}
              className="profile-ftu__nav-back"
            >
              {p.ftuBack}
            </button>
          ) : (
            <div />
          )}
          <CtaButton
            as={motion.button}
            onClick={handleNext}
            className="profile-ftu__nav-next"
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
    <div className="profile-locale-modal">
      {/* Backdrop */}
      <motion.button
        type="button"
        aria-label={srcProfile.localeModalCancel}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onCancel}
        className="profile-locale-modal__backdrop border-0 p-0"
      />
      {/* Card */}
      <motion.div
        role="alertdialog"
        aria-modal="true"
        aria-label={srcProfile.localeModalTitle}
        initial={{ opacity: 0, scale: 0.92, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 12 }}
        transition={motionSpring.crispSettled}
        className="profile-locale-modal__card"
      >
        <div className="profile-locale-modal__body">
          <div className="profile-locale-modal__icon">
            <Globe size={22} className="profile-locale-modal__icon-glyph" />
          </div>
          <Heading level="sm">
            {srcProfile.localeModalTitle}
          </Heading>
          {/* Target language echo */}
          {tgtProfile.localeModalTitle !== srcProfile.localeModalTitle && (
            <p className="profile-locale-modal__echo">
              {tgtProfile.localeModalTitle}
            </p>
          )}
          <p className="type-body-sm profile-locale-modal__desc">
            {(() => {
              /* Render description with bold from/to names inline */
              const desc = srcProfile.localeModalDesc;
              const parts = desc.split("{from}");
              const before = parts[0];
              const afterFrom = (parts[1] || "").split("{to}");
              const middle = afterFrom[0];
              const after = afterFrom[1] || "";
              return (
                <span data-slot="locale-desc">
                  {before}
                  <span className="profile-locale-modal__name">{fromLabel}</span>
                  {middle}
                  <span className="profile-locale-modal__name">{toLabel}</span>
                  {after}
                </span>
              );
            })()}
          </p>
        </div>
        <div className="profile-locale-modal__actions">
          <button
            onClick={onCancel}
            className="type-data-base profile-locale-modal__cancel"
          >
            {srcProfile.localeModalCancel}
          </button>
          <CtaButton
            onClick={onConfirm}
            radius="xl"
            className="profile-locale-modal__confirm"
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

  const setOvenHeatProfile = useCallback((id: OvenHeatProfile) => {
    updateEquipment((prev) => ({ ...prev, oven_heat_profile: id }));
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
  const [profileTab, setProfileTab] = useState<"setup" | "app" | "recipes">("setup");
  const reduceMotion = useReducedMotion();

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
      className="profile-shell"
    >
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={motionSpring.standard}
        className="profile-page"
        data-region="page"
      >
        {/* Close Button */}
        <div className="profile-page__close">
          <IconButton
            size="md"
            onClick={() => navigate("/")}
            aria-label={cms.ui.close}
          >
            <X size={15} />
          </IconButton>
        </div>
        {/* Header */}
        <div data-region="page-header" className="profile-page__header">
          <div className="profile-page__header-icon">
            <User size={26} className="profile-page__header-icon-glyph" />
          </div>
          <Heading level="page">
            {p.pageTitle}
          </Heading>
          <p className="profile-page__subtitle">
            {p.pageSubtitle}
          </p>
        </div>

        <div className="profile-tabs" role="tablist" aria-label={p.pageTitle}>
          {[
            { id: "recipes" as const, label: uiMessage("pages.profile.ricette-salvate-b5c99ac7") },
            { id: "setup" as const, label: uiMessage("pages.profile.la-tua-cucina-c2d87895") },
            { id: "app" as const, label: uiMessage("pages.profile.app-fc4a695f") },
          ].map((tab) => {
            const active = profileTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setProfileTab(tab.id)}
                className={active ? "profile-tabs__button profile-tabs__button--active" : "profile-tabs__button"}
              >
                {active && (
                  <motion.span
                    layoutId="profile-tab-indicator"
                    className="profile-tabs__indicator"
                    transition={reduceMotion ? { duration: motionDuration.reduced } : motionSpring.matchPanel}
                  />
                )}
                <span className="profile-tabs__label">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* ── STILI PREFERITI + RICETTARIO (R31) — visibili solo se ne hai ── */}
        {profileTab === "recipes" && (
          <>
            <FavoriteStylesSection />
            <SavedRecipesSection />
          </>
        )}

        {/* ── FORNO ── */}
        {profileTab === "setup" && (
          <>
        <ProfileSection
          title={p.ovenTitle}
          subtitle={p.ovenSubtitle}
          stepNum={p.ovenStep}
          delay={motionDelay.short}
        >
          <div className="profile-oven-list">
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
                  className="profile-oven-list__item"
                  animate={{
                    backgroundColor: active
                      ? "var(--surface-container)"
                      : "var(--container-bg-low)",
                    borderColor: active ? "var(--primary)" : "var(--container-border)",
                  }}
                  transition={motionSpring.crispPanel}
                >
                  <motion.div
                    animate={{ color: active ? "var(--primary)" : "var(--text-muted)" }}
                    transition={motionSpring.crispPanel}
                    className="profile-oven-list__icon"
                  >
                    <Icon size={18} />
                  </motion.div>
                  <div className="profile-oven-list__body">
                    <span className="type-body-sm profile-oven-list__name">
                      {preset.name}
                    </span>
                  </div>
                  <span className="type-data profile-oven-list__temp">
                    {fmt.celsius(preset.maxTemp)}
                  </span>
                  <AnimatePresence>
                    {active && (
                      <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={motionSpring.crispDisclosure}
                        className="profile-oven-list__check"
                      >
                        <Check size={16} className="profile-oven-list__check-icon" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.button>
              );
            })}
          </div>

          {/* Temperature override */}
          <div className="profile-oven-temp">
            <div className="profile-oven-temp__row">
              <span className="type-data-sm profile-oven-temp__label">
                {p.tempLabel}
              </span>
              <span className="type-data profile-oven-temp__value">
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
              className="profile-oven-temp__slider"
              aria-label={p.tempAria}
            />
          </div>

          <div className="profile-oven-heat">
            <div className="profile-oven-heat__head">
              <span className="type-data-sm profile-oven-heat__label">
                {uiMessage("pages.profile.distribuzione-del-calore-bfa0da90")}</span>
              <span className="type-data-xs profile-oven-heat__hint">
                {uiMessage("pages.profile.cambia-preriscaldo-ripiano-e-rotazioni-8f2fcd03")}</span>
            </div>
            <div className="profile-oven-heat__grid">
              {OVEN_HEAT_PROFILES.map((profile) => {
                const active = (equipment.oven_heat_profile ?? "static_top_bottom") === profile.id;
                const suggested = profile.bestFor.includes(ovenType);
                return (
                  <motion.button
                    key={profile.id}
                    type="button"
                    onClick={() => setOvenHeatProfile(profile.id)}
                    className={
                      active
                        ? "profile-oven-heat__option profile-oven-heat__option--active"
                        : "profile-oven-heat__option"
                    }
                    animate={{
                      borderColor: active ? "var(--primary)" : "var(--container-border)",
                      backgroundColor: active ? "var(--surface-container)" : "var(--container-bg-low)",
                    }}
                    transition={motionSpring.crispPanel}
                  >
                    <span className="profile-oven-heat__option-row">
                      <span className="type-body-sm profile-oven-heat__option-label">
                        {profile.label}
                      </span>
                      {suggested && (
                        <span className="profile-oven-heat__option-badge">
                          {uiMessage("pages.profile.adatto-0fd37e76")}</span>
                      )}
                    </span>
                    <span className="type-data-xs profile-oven-heat__option-desc">
                      {profile.description}
                    </span>
                  </motion.button>
                );
              })}
            </div>
          </div>
        </ProfileSection>

        {/* ── SKILL ── */}
        <ProfileSection
          title={p.skillTitle}
          subtitle={p.skillSubtitle}
          stepNum={p.skillStep}
          delay={motionDelay.medium}
        >
          <div className="profile-skill-grid">
            {SKILL_LEVELS.map((skill) => {
              const active = skillLevel === skill.level;
              return (
                <motion.button
                  key={skill.level}
                  onClick={() => setSkillLevel(skill.level as SkillLevel)}
                  className="profile-skill-grid__item"
                  animate={{
                    backgroundColor: active
                      ? "var(--surface-container)"
                      : "var(--container-bg-low)",
                    borderColor: active ? "var(--primary)" : "var(--container-border)",
                  }}
                  transition={motionSpring.crispPanel}
                >
                  <div className="profile-skill-grid__row">
                    <motion.span
                      animate={{ color: active ? "var(--primary)" : "var(--text-muted)" }}
                      transition={motionSpring.crispPanel}
                      className="profile-skill-grid__level"
                    >
                      LV{skill.level}
                    </motion.span>
                    <span className="type-body-sm profile-skill-grid__name">
                      {skill.name}
                    </span>
                    <AnimatePresence>
                      {active && (
                        <motion.div
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0, opacity: 0 }}
                          transition={motionSpring.crispDisclosure}
                          className="profile-skill-grid__check"
                        >
                          <Check size={14} className="profile-skill-grid__check-icon" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  <span className="type-data-xs profile-skill-grid__desc">
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
          delay={motionDelay.feedback}
        >
          <div className="profile-equip-list">
            {/* ── Impastamento ── */}
            <EquipmentCategory
              title={p.equipMixerTitle}
              stepLabel={p.equipMixerTitle.toUpperCase()}
              expanded={equipExpandedCat === "mixer"}
              onToggle={() => setEquipExpandedCat(equipExpandedCat === "mixer" ? null : "mixer")}
              summary={mixers.length > 0
                ? mixers.map(id => localMixers.find((m) => m.id === id)?.label ?? "").filter(Boolean).join(", ")
                : p.equipSummaryNone}
              hasSelection={mixers.length > 0}
            >
              <div className="profile-equip-option-list">
                {localMixers.map((mixer) => {
                  const active = mixers.includes(mixer.id);
                  const levelModifier =
                    mixer.level === "professional"
                      ? " profile-equip-option__badge--pro"
                      : mixer.level === "semi_pro"
                        ? " profile-equip-option__badge--semi-pro"
                        : "";
                  return (
                    <motion.button
                      key={mixer.id}
                      onClick={() => toggleMixer(mixer.id)}
                      className="profile-equip-option"
                      animate={{
                        backgroundColor: active ? "var(--surface-container)" : "transparent",
                        borderColor: active ? "var(--primary)" : "var(--container-border)",
                      }}
                      transition={motionSpring.crispPanel}
                    >
                      <div className="profile-equip-option__body">
                        <div className="profile-equip-option__row">
                          <span className="type-body-sm profile-equip-option__label">
                            {mixer.label}
                          </span>
                          <span className={`profile-equip-option__badge${levelModifier}`}>
                            {mixer.level === "professional" ? uiMessage("pages.profile.pro-66d0c5e6") : mixer.level === "semi_pro" ? uiMessage("pages.profile.semi-pro-e857b480") : uiMessage("pages.profile.casa-9ea949c3")}
                          </span>
                        </div>
                        <div className="type-data-xs profile-equip-option__desc">
                          {mixer.description}
                        </div>
                      </div>
                      <AnimatePresence>
                        {active && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                            transition={motionSpring.crisp}
                            className="profile-equip-option__check"
                          >
                            <Check size={16} className="profile-equip-option__check-icon" />
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
              stepLabel={p.equipSurfaceTitle.toUpperCase()}
              expanded={equipExpandedCat === "surface"}
              onToggle={() => setEquipExpandedCat(equipExpandedCat === "surface" ? null : "surface")}
              summary={equipment.surfaces.length > 0
                ? equipment.surfaces.map((s) => localSurfaces.find((o) => o.id === s)?.label ?? s).join(", ")
                : p.equipSummaryNone}
              hasSelection={equipment.surfaces.length > 0}
            >
              <div className="profile-equip-option-list">
                {localSurfaces.map((surface) => {
                  const active = equipment.surfaces.includes(surface.id);
                  const heatModifier =
                    surface.heatClass === "very_fast"
                      ? " profile-equip-option__k-badge--fast"
                      : surface.heatClass === "medium"
                        ? " profile-equip-option__k-badge--medium"
                        : "";
                  return (
                    <motion.button
                      key={surface.id}
                      onClick={() => toggleSurface(surface.id)}
                      className="profile-equip-option"
                      animate={{
                        backgroundColor: active ? "var(--surface-container)" : "transparent",
                        borderColor: active ? "var(--primary)" : "var(--container-border)",
                      }}
                      transition={motionSpring.crispPanel}
                    >
                      <div className="profile-equip-option__body">
                        <div className="profile-equip-option__row">
                          <span className="type-body-sm profile-equip-option__label">
                            {surface.label}
                          </span>
                          <span className={`type-data profile-equip-option__k-badge${heatModifier}`}>
                            {uiMessage("pages.profile.k-a2a64040")}{surface.conductivity}
                          </span>
                        </div>
                        <div className="type-data-xs profile-equip-option__desc">
                          {surface.description}
                        </div>
                      </div>
                      <AnimatePresence>
                        {active && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                            transition={motionSpring.crisp}
                            className="profile-equip-option__check"
                          >
                            <Check size={16} className="profile-equip-option__check-icon" />
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
              stepLabel={(p.equipToolsTitle).toUpperCase()}
              expanded={equipExpandedCat === "tools"}
              onToggle={() => setEquipExpandedCat(equipExpandedCat === "tools" ? null : "tools")}
              summary={equipment.tools.length > 0
                ? (p.equipSummarySelected).replace("{count}", String(equipment.tools.length))
                : p.equipSummaryNone}
              hasSelection={equipment.tools.length > 0}
            >
              <div className="profile-equip-tools">
                {(Object.keys(localToolCats) as ToolCategory[]).map((catId) => {
                  const cat = localToolCats[catId];
                  const catTools = localTools.filter((t) => t.category === catId);
                  return (
                    <div key={catId}>
                      <div className="profile-equip-tools__cat-label">
                        {cat.label}
                      </div>
                      <div className="profile-equip-tools__chips">
                        {catTools.map((tool) => (
                          <Chip
                            key={tool.id}
                            label={tool.label}
                            active={equipment.tools.includes(tool.id)}
                            onToggle={() => toggleTool(tool.id)}
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
                transition={motionSpring.standard}
                className="profile-equip-summary"
              >
                <div className="profile-equip-summary__chips">
                  {equipment.mixer_type && (
                    <span className="type-data-xs profile-equip-summary__chip">
                      {localMixers.find((m) => m.id === equipment.mixer_type)?.label}
                    </span>
                  )}
                  {equipment.surfaces.map((s) => {
                    const opt = localSurfaces.find((o) => o.id === s);
                    return (
                      <span key={s} className="type-data-xs profile-equip-summary__chip">
                        {opt?.label}
                      </span>
                    );
                  })}
                  {equipment.tools.length > 0 && (
                    <span className="type-data-xs profile-equip-summary__chip profile-equip-summary__chip--muted">
                      {equipment.tools.length} {uiMessage("pages.profile.utensili-7d6ac61b")}</span>
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
          delay={motionDelay.profileSection}
        >
          <div className="profile-diet-chips">
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
            <p className="type-data-sm profile-diet-empty">
              {p.noDietNote}
            </p>
          )}
        </ProfileSection>

        {/* ── POSIZIONE ── */}
        <ProfileSection
          title={p.locationTitle}
          subtitle={p.locationSubtitle}
          stepNum={p.locationStep}
          delay={motionDelay.profileSectionStep}
        >
          <div className="profile-location">
            {/* Current saved location */}
            {savedLocation && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={motionSpring.standard}
                className="profile-location__current"
              >
                <MapPin size={16} className="profile-location__current-icon" />
                <div className="profile-location__current-body">
                  <div className="type-body-sm profile-location__current-name">
                    {savedLocation.city || `${savedLocation.lat.toFixed(2)}, ${savedLocation.lon.toFixed(2)}`}
                  </div>
                  {/* Il titolo mostra già città o coordinate: qui solo lo stato. */}
                  <div className="type-data-xs profile-location__current-status">
                    {p.locationSaved}
                  </div>
                </div>
                <IconButton
                  onClick={clearLocation}
                  size="sm"
                  radius="lg"
                  variant="ghost"
                  className="profile-location__current-remove"
                  aria-label={p.locationRemove}
                >
                  <X size={12} className="profile-location__current-remove-icon" />
                </IconButton>
              </motion.div>
            )}

            {/* Search input */}
            <div className="profile-location__search">
              <div className="profile-location__search-bar">
                {locationSearching ? (
                  <Loader2 size={14} className="profile-spin profile-location__search-icon" />
                ) : (
                  <Search size={14} className="profile-location__search-icon" />
                )}
                <input
                  type="text"
                  value={locationQuery}
                  onChange={(e) => setLocationQuery(e.target.value)}
                  placeholder={p.locationPlaceholder}
                  className="profile-location__search-input"
                />
                {locationQuery && (
                  <button
                    onClick={() => { setLocationQuery(""); setLocationResults([]); }}
                    className="profile-location__search-clear"
                    aria-label={cms.pages.searchClearLabel}
                  >
                    <X size={14} className="profile-location__search-clear-icon" />
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
                    transition={motionSpring.crispControl}
                    className="profile-location__dropdown"
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
                          className="profile-location__result"
                        >
                          <MapPin size={13} className="profile-location__result-icon" />
                          <div className="profile-location__result-body">
                            <div className="type-body-sm profile-location__result-name">
                              {city || result.display_name.split(",")[0]}
                            </div>
                            {(region || country) && (
                              <div className="profile-location__result-meta">
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
                <div className="profile-location__empty">
                  {p.locationNoResults}
                </div>
              )}
            </div>

            {/* Auto-detect button */}
            <motion.button
              onClick={detectCurrentLocation}
              disabled={locationDetecting}
              className={`profile-location__detect${locationDetecting ? " profile-location__detect--busy" : ""}`}
            >
              {locationDetecting ? (
                <Loader2 size={14} className="profile-spin" />
              ) : (
                <Navigation size={14} />
              )}
              {p.locationAuto}
            </motion.button>

            {/* Hint when no location */}
            {!savedLocation && (
              <p className="type-data-sm profile-location__hint">
                {p.locationNone}
              </p>
            )}
          </div>
        </ProfileSection>
          </>
        )}

        {/* ── LINGUA & TEMA ── */}
        {profileTab === "app" && (
          <>
        <ProfileSection
          title={p.prefsTitle}
          subtitle={p.prefsSubtitle}
          stepNum={p.prefsStep}
          delay={motionDelay.profileSectionLate}
        >
          <div className="profile-prefs">
            {/* Language */}
            <div data-slot="language">
              <div className="type-data profile-prefs__label">
                {p.langLabel}
              </div>
              <div className="profile-prefs__lang-list">
                {LOCALE_META.filter((l) => l.available).map((locale) => (
                  <motion.button
                    key={locale.id}
                    onClick={() => {
                      if (locale.id !== currentLocale.id) {
                        setPendingLocale(locale);
                      }
                    }}
                    className="profile-prefs__lang-btn"
                    initial={false}
                    animate={{
                      backgroundColor: currentLocale.id === locale.id ? "var(--chip-bg-active)" : "var(--chip-bg)",
                      color: currentLocale.id === locale.id ? "var(--chip-text-active)" : "var(--chip-text)",
                      borderColor: currentLocale.id === locale.id ? "var(--chip-bg-active)" : "var(--chip-border)",
                    }}
                    transition={motionSpring.crispPanel}
                  >
                    <span data-slot="flag">{locale.flag}</span>
                    {locale.name}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Dark mode */}
            <div data-slot="theme">
              <div className="type-data profile-prefs__label">
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
          delay={motionDelay.deliberate}
        >
          <div data-slot="unit-system">
            <div className="type-data profile-prefs__label">
              {p.unitSystemLabel}
            </div>
            <div className="profile-unit-grid">
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
                    className="profile-unit-option"
                    initial={false}
                    animate={{
                      backgroundColor: active ? "var(--surface-container)" : "var(--container-bg-low)",
                      borderColor: active ? "var(--primary)" : "var(--container-border)",
                    }}
                    transition={motionSpring.crispPanel}
                    aria-pressed={active}
                  >
                    <Thermometer
                      size={17}
                      className={`profile-unit-option__icon${active ? " profile-unit-option__icon--active" : ""}`}
                    />
                    <span className="profile-unit-option__body">
                      <span className="type-body-sm profile-unit-option__label">
                        {option.label}
                      </span>
                      <span className="type-data-xs profile-unit-option__desc">
                        {option.desc}
                      </span>
                    </span>
                    {active && <Check size={15} className="profile-unit-option__check" />}
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
          delay={motionDelay.profileSectionFinal}
        >
          <button
            type="button"
            onClick={() => setPizzaNerd((value) => !value)}
            className={`profile-nerd-toggle${pizzaNerd ? " profile-nerd-toggle--active" : ""}`}
            aria-pressed={pizzaNerd}
          >
            <span
              className={`profile-nerd-toggle__icon${pizzaNerd ? " profile-nerd-toggle__icon--active" : ""}`}
            >
              <Beaker size={17} />
            </span>
            <span className="profile-nerd-toggle__body">
              <span className="profile-nerd-toggle__title">
                {p.pizzaNerdCardTitle}
              </span>
              <span className="profile-nerd-toggle__desc">
                {p.pizzaNerdCardDesc}
              </span>
            </span>
            <span
              className={`profile-nerd-toggle__track${pizzaNerd ? " profile-nerd-toggle__track--active" : ""}`}
            >
              <motion.span
                className="profile-nerd-toggle__thumb"
                animate={{ left: pizzaNerd ? 22 : 4 }}
                transition={motionSpring.crispSettled}
              />
            </span>
          </button>
        </ProfileSection>

        {/* Reset profile — Audit Sprint 12: chiede conferma prima di resettare */}
        <div className="profile-page__footer">
          <button
            onClick={() => {
              const ok = window.confirm(p.resetConfirmMessage);
              if (!ok) return;
              try {
                localStorage.removeItem(PROFILE_COMPLETE_KEY);
              } catch { /* */ }
              setShowFtu(true);
            }}
            className="type-data profile-page__reset"
          >
            {p.resetProfile}
          </button>

          {/* Dev mode toggle */}
          <motion.button
            onClick={() => setDevMode(!devMode)}
            className="profile-page__dev-toggle"
            animate={{
              backgroundColor: devMode ? "var(--surface-container)" : "transparent",
              color: devMode ? "var(--primary)" : "var(--text-muted)",
              borderColor: devMode ? "var(--primary)" : "var(--container-border)",
              opacity: devMode ? 1 : 0.5,
            }}
            transition={motionSpring.crispPanel}
          >
            <Bug size={13} />
            {devMode ? p.devModeOn : p.devModeOff}
          </motion.button>
        </div>
          </>
        )}

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
