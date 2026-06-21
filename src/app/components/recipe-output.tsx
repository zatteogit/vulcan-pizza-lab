import {
CalendarRange,
Check,
ChevronLeft,
ChevronRight,
CookingPot,
Copy,
Flame,
FlaskConical,
HelpCircle,
Lightbulb,
Link as LinkIcon,
ListChecks,
Minus,
Plus,
Search,
Share2,
Utensils,
X
} from "lucide-react";
import { AnimatePresence,motion,useReducedMotion } from "motion/react";
import React,{ useEffect,useMemo,useRef,useState,type ReactNode } from "react";
import { createPortal } from "react-dom";
import type { CmsContent,CmsTimelineStep } from "./cms/cms-context";
import { useCms } from "./cms/cms-context";
import { createFormatter,formatTemperatureCopy,t } from "./cms/i18n";
import {
FLEXIBLE_STEP_IDS,
useCookSession,
type CookSessionStep,
} from "./cook-session";
import type { FlourEntry } from "./flour-database";
import {
getBakingTimeByStyle,
getEquipmentByStyle,
getFoldingByStyle,
getScoringByStyle,
getToppingByStyle,
} from "./parametric-databases";
import {
GeneratedRecipe,
generateTimeSlots,
getLayoutSpec,
getServingsRange,
getServingUnit,
needsPan,
SERVING_UNIT_LABELS,
TimelineStep,
UserConstraints,
YEAST_LABELS,
type PanConfig,
} from "./pizza-engine";
import { PreFermentCard } from "./pre-ferment-guide";
import { RecipeFeedbackForm } from "./recipe-feedback";
import { StepIllustration } from "./step-illustrations";
import {
AUTHENTICITY_META,
getConceptsByAuthenticity,
getRecipesByAuthenticity,
getToppingForStyle,
TOPPING_CONCEPTS,
TOPPING_LIBRARY,
type AuthenticityScore,
type FlavorProfile,
type ToppingConcept,
type ToppingRecipe,
type IngredientSection,
type ToppingIngredient,
} from "./topping-library";
import { Badge, CtaButton, Heading, IconButton, Stepper, Surface, Switch } from "./ds";

/* ═══ PARAMETRIC CONTEXT TIPS ═══ */
function getParametricTip(
  stepId: string,
  styleId: string,
  isNerd: boolean,
  pt: CmsContent["parametricTips"],
): string | null {
  switch (stepId) {
    case "mix": {
      const eq = getEquipmentByStyle(styleId);
      if (!eq) return null;
      const mixer = eq.mixerRequired
        ? (eq.mixerType === "planetaria" ? pt.mixerPlanetaria : eq.mixerType)
        : pt.mixerHand;
      return isNerd
        ? t(pt.mixNerd, { mixer, time: eq.mixingTime_min, note: eq.note })
        : t(pt.mixBeginner, { mixer, time: eq.mixingTime_min, equipment: eq.specialEquipment.length > 0 ? eq.specialEquipment[0] : "" });
    }
    case "bulk": {
      const fold = getFoldingByStyle(styleId);
      if (!fold || fold.foldCount === 0) return null;
      const foldName = fold.foldType.replace(/_/g, " ");
      if (isNerd) {
        return t(pt.bulkNerd, {
          count: fold.foldCount,
          type: foldName,
          interval: fold.foldInterval_min,
          note: fold.note,
        });
      }
      return t(pt.bulkBeginner, {
        count: fold.foldCount,
        type: foldName,
        interval: fold.foldInterval_min,
      });
    }
    case "shape": {
      const sc = getScoringByStyle(styleId);
      if (!sc || !sc.scoringRequired) return null;
      return isNerd
        ? t(pt.shapeNerd, { type: sc.scoringType, depth: sc.scoringDepth_mm, timing: sc.scoringTiming, note: sc.note })
        : t(pt.shapeBeginner, { note: sc.note });
    }
    case "top": {
      const top = getToppingByStyle(styleId);
      if (!top) return null;
      // Sanifica gli ID con underscore (es. "salsa_sopra" \u2192 "salsa sopra")
      const order = top.toppingOrder.map((x) => x.replace(/_/g, " ")).join(" \u2192 ");
      return isNerd
        ? t(pt.topNerd, { order, saucePos: top.saucePosition, cheeseType: top.cheeseType, cheesePos: top.cheesePosition.replace(/_/g, " "), note: top.note })
        : t(pt.topBeginner, { order, note: top.note });
    }
    case "bake": {
      const bt = getBakingTimeByStyle(styleId);
      if (!bt) return null;
      const minM = Math.floor(bt.minSeconds / 60);
      const maxM = Math.ceil(bt.maxSeconds / 60);
      const turnsNote = bt.turns > 0
        ? t(pt.turnsSingle, {
            n: bt.turns,
            // Plurale italiano (volta / volte); negli altri locale il placeholder
            // resta letterale finché non viene migrato all'i18n con plurali.
            turn: bt.turns === 1 ? "volta" : "volte",
          })
        : pt.turnsNone;
      return isNerd
        ? t(pt.bakeNerd, { idealSec: bt.idealSeconds, minM, maxM, turns: bt.turns, note: bt.note })
        : t(pt.bakeBeginner, { minM, maxM, turnsNote });
    }
    default:
      return null;
  }
}

interface RecipeOutputProps {
  recipe: GeneratedRecipe;
  constraints: UserConstraints;
  onConstraintsChange: (c: UserConstraints) => void;
  nerdMode?: boolean;
  /** Vista Semplice: gergo tecnico sostituito da parole (audit roleplay). */
  simple?: boolean;
  selectedFlourId?: string | null;
  onSelectFlour?: (flour: FlourEntry | null) => void;
  selectedTimeSlotId?: string | null;
  /** Config teglia attiva — usata per mostrare le dimensioni accanto al
   *  conteggio (co-locazione UI proximity #54). Se assente, fallback ai
   *  default dello stile. */
  panConfig?: PanConfig;
  /** La pagina ricetta può controllare la sezione primaria per evitare tab annidate. */
  forcedTab?: PagerTabId;
  hidePager?: boolean;
  hideContextSummary?: boolean;
  recipeControls?: ReactNode;
  matchSlot?: ReactNode;
  showFeedback?: boolean;
  selectedToppingConcept?: string | null;
  onSelectTopping?: (conceptId: string) => void;
  onTabChange?: (tab: PagerTabId) => void;
  shareUrl?: string;
  nerdAvailable?: boolean;
  onNerdModeChange?: (nerd: boolean) => void;
  isPersonalized?: boolean;
  onRequestPersonalization?: () => void;
  /** Nasconde la capsula flottante in alto a destra (Inizia + condividi):
   *  usato nella sezione Crea, dove la shell ha già il pulsante Profilo lì e
   *  l'azione "Inizia" vive nel grande bottone della timeline. */
  hideFloatingActions?: boolean;
}

/* ═══ Pager orizzontale (feedback giugno 2026) ═══ */
type PagerTabId = "ricetta" | "procedimento" | "condimento";

const panelVariants = {
  enter: (custom?: { direction: number; reduceMotion: boolean }) => ({
    x: custom?.reduceMotion ? 0 : (custom?.direction ?? 0) > 0 ? 120 : -120,
    y: custom?.reduceMotion ? 8 : 0,
    opacity: 0,
  }),
  center: {
    x: 0,
    y: 0,
    opacity: 1,
  },
  exit: (custom?: { direction: number; reduceMotion: boolean }) => ({
    x: custom?.reduceMotion ? 0 : (custom?.direction ?? 0) < 0 ? 120 : -120,
    y: custom?.reduceMotion ? -6 : 0,
    opacity: 0,
  }),
};

const TOPPING_TIMELINE_STEP_IDS = new Set([
  "top",
  "top_post",
  "fill_internal",
  "split_fill",
  "after_bake_top",
]);

const isToppingTimelineStep = (stepId: string) =>
  TOPPING_TIMELINE_STEP_IDS.has(stepId) || stepId.startsWith("spread_");

const FLAVOR_PROFILE_LABELS: Record<FlavorProfile, string> = {
  fresh: "Freschi",
  earthy: "Bosco",
  spicy: "Piccanti",
  creamy: "Cremosi",
  rich: "Ricchi",
  salty_savory: "Sapidi",
  sweet_savory: "Agrodolci",
  light: "Leggeri",
};

const FLAVOR_PROFILE_ORDER: FlavorProfile[] = [
  "fresh",
  "light",
  "creamy",
  "earthy",
  "spicy",
  "rich",
  "salty_savory",
  "sweet_savory",
];

function normalizeSearch(value: string): string {
  return value
    .toLocaleLowerCase("it")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function CondimentChoiceStrip({
  choices,
  allChoices,
  activeConceptId,
  onSelect,
  mode,
}: {
  choices: Array<{ recipe: ToppingRecipe; authenticity: AuthenticityScore }>;
  allChoices?: Array<{ recipe: ToppingRecipe; authenticity: AuthenticityScore }>;
  activeConceptId: string;
  onSelect?: (recipeId: string) => void;
  mode?: "ingredients" | "timeline";
}) {
  const { cms } = useCms();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeFlavor, setActiveFlavor] = useState<FlavorProfile | "all">("all");
  /* VPL-C7: indicatore di overflow — sfumature ai bordi quando ci sono altre
   * scelte fuori vista (lo scrollbar è nascosto, niente altro lo segnalerebbe). */
  const [fade, setFade] = useState({ start: false, end: false });
  const isTimeline = mode === "timeline";
  const pickerChoices = allChoices && allChoices.length > choices.length
    ? allChoices
    : choices;
  const railChoices = useMemo(() => {
    if (isTimeline) return choices;
    const list = [...choices];
    const hasActive = list.some((choice) => choice.recipe.id === activeConceptId);
    if (!hasActive && allChoices) {
      const activeChoice = allChoices.find((choice) => choice.recipe.id === activeConceptId);
      if (activeChoice) {
        list.push(activeChoice);
      }
    }
    return list;
  }, [activeConceptId, choices, allChoices, isTimeline]);
  const showExpandedPicker = !isTimeline && pickerChoices.length > railChoices.length;
  const updateFades = () => {
    const el = scrollRef.current;
    if (!el) return;
    setFade({
      start: el.scrollLeft > 1,
      end: el.scrollLeft + el.clientWidth < el.scrollWidth - 1,
    });
  };
  useEffect(() => {
    updateFades();
    const el = scrollRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(updateFades);
    ro.observe(el);
    return () => ro.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [railChoices.length]);

  useEffect(() => {
    const timer = setTimeout(() => {
      const el = scrollRef.current;
      if (!el) return;
      const activeBtn = el.querySelector('[aria-pressed="true"]');
      if (activeBtn) {
        activeBtn.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "center",
        });
      }
    }, 50);
    return () => clearTimeout(timer);
  }, [activeConceptId]);

  const scrollByPage = (direction: -1 | 1) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({
      left: direction * Math.max(240, el.clientWidth * 0.72),
      behavior: "smooth",
    });
  };

  const flavorFilters = useMemo(
    () =>
      FLAVOR_PROFILE_ORDER.filter((profile) =>
        pickerChoices.some((choice) => {
          const concept = TOPPING_CONCEPTS[choice.recipe.concept_ref];
          return concept?.flavor_profile === profile;
        }),
      ),
    [pickerChoices],
  );

  const filteredPickerChoices = useMemo(() => {
    const q = normalizeSearch(query.trim());
    return pickerChoices.filter(({ recipe, authenticity }) => {
      const concept = TOPPING_CONCEPTS[recipe.concept_ref];
      if (activeFlavor !== "all" && concept?.flavor_profile !== activeFlavor) {
        return false;
      }
      if (!q) return true;
      const searchable = normalizeSearch(
        [
          recipe.name,
          recipe.description,
          concept?.name,
          concept?.description,
          concept?.occasions?.join(" "),
          concept ? FLAVOR_PROFILE_LABELS[concept.flavor_profile] : "",
          authenticityLabel(authenticity, cms),
        ]
          .filter(Boolean)
          .join(" "),
      );
      return searchable.includes(q);
    });
  }, [activeFlavor, cms, pickerChoices, query]);

  if (!onSelect || pickerChoices.length <= 1) return null;
  const selectFromSheet = (recipeId: string) => {
    onSelect(recipeId);
    setPickerOpen(false);
    setQuery("");
    setActiveFlavor("all");
  };

  return (
    <div className="relative">
      <div
        ref={scrollRef}
        onScroll={updateFades}
        className={`flex gap-2 overflow-x-auto pb-1.5 hide-scrollbar ${
          isTimeline ? "topping-strip-timeline" : ""
        }`}
        aria-label={cms.cooking.chooseTopping}
      >
        {railChoices.map(({ recipe, authenticity }) => {
          const concept = TOPPING_CONCEPTS[recipe.concept_ref];
          const active = activeConceptId === recipe.id;
          const thumbnail = concept?.thumbnail;
          
          if (isTimeline) {
            return (
              <button
                key={recipe.id}
                type="button"
                onClick={() => onSelect(recipe.id)}
                className="flex-shrink-0 rounded-2xl px-3 py-2 active:scale-95 transition-transform"
                style={{
                  minHeight: 56,
                  minWidth: thumbnail ? 164 : 124,
                  background: active ? "var(--chip-bg-active)" : "var(--surface-container)",
                  color: active ? "var(--chip-text-active)" : "var(--text-default)",
                  border: active
                    ? "1px solid transparent"
                    : "1px solid var(--outline-variant)",
                  cursor: "pointer",
                }}
                aria-pressed={active}
              >
                <span className="flex items-center gap-3 text-left">
                  {thumbnail && (
                    <img
                      src={thumbnail}
                      alt=""
                      className="h-12 w-12 rounded-xl object-cover"
                      loading="lazy"
                    />
                  )}
                  <span className="min-w-0">
                    <span
                      className="block truncate type-data"
                      style={{
                        fontWeight: "var(--weight-semibold)" as any,
                        lineHeight: "var(--leading-tight)",
                      }}
                    >
                      {recipe.name ?? concept?.name}
                    </span>
                    <span
                      className="block mt-0.5 type-data-sm"
                      style={{
                        color: active ? "inherit" : "var(--text-muted)",
                        fontWeight: "var(--weight-medium)" as any,
                        lineHeight: "var(--leading-normal)",
                        opacity: active ? 0.82 : 1,
                      }}
                    >
                      {authenticityLabel(authenticity, cms)}
                    </span>
                  </span>
                </span>
              </button>
            );
          }

          return (
            <button
              key={recipe.id}
              type="button"
              onClick={() => onSelect(recipe.id)}
              className="flex-shrink-0 rounded-full pl-2 pr-5 py-2 active:scale-95 transition-transform flex items-center gap-3 text-left"
              style={{
                height: 56,
                background: active ? "var(--primary)" : "color-mix(in srgb, var(--container-bg-low) 50%, transparent)",
                color: active ? "var(--overlay-text)" : "var(--text-default)",
                border: active
                  ? "1px solid transparent"
                  : "1px solid var(--container-border-subtle)",
                cursor: "pointer",
                boxShadow: active ? "0 4px 14px color-mix(in srgb, var(--primary) 30%, transparent)" : "none",
              }}
              aria-pressed={active}
            >
              {thumbnail && (
                <img
                  src={thumbnail}
                  alt=""
                  className="h-10 w-10 rounded-full object-cover flex-shrink-0"
                  loading="lazy"
                />
              )}
              <div className="min-w-0 flex flex-col justify-center">
                <span
                  className="block truncate type-data"
                  style={{
                    fontWeight: "var(--weight-semibold)" as any,
                    lineHeight: "var(--leading-none)",
                  }}
                >
                  {recipe.name ?? concept?.name}
                </span>
                <span
                  className="block mt-0.5 type-data-sm"
                  style={{
                    color: active ? "rgba(255, 255, 255, 0.8)" : "var(--text-muted)",
                    fontWeight: "var(--weight-medium)" as any,
                    lineHeight: "var(--leading-none)",
                  }}
                >
                  {authenticityLabel(authenticity, cms)}
                </span>
              </div>
            </button>
          );
        })}

        {/* Action button "Vedi tutti" as a pill at the end of the scroll list */}
        {!isTimeline && showExpandedPicker && (
          <button
            type="button"
            onClick={() => setPickerOpen(true)}
            className="flex-shrink-0 rounded-full px-5 py-2 active:scale-95 transition-transform type-data flex items-center gap-2"
            style={{
              height: 56,
              background: "var(--surface-container)",
              color: "var(--text-default)",
              border: "1px solid var(--outline-variant)",
              cursor: "pointer",
              fontWeight: "var(--weight-semibold)" as any,
            }}
          >
            <Utensils size={14} />
            <span>
              {engineMessage(cms, "topping.viewAll", "Vedi tutti")}
            </span>
          </button>
        )}
      </div>
      {fade.start && (
        <div
          className="pointer-events-none absolute inset-y-0 left-0 w-8"
          style={{ background: "linear-gradient(to right, var(--container-page), transparent)" }}
          aria-hidden="true"
        />
      )}
      {fade.end && (
        <div
          className="pointer-events-none absolute inset-y-0 right-0 w-10"
          style={{ background: "linear-gradient(to left, var(--container-page), transparent)" }}
          aria-hidden="true"
        />
      )}
      {!isTimeline && pickerOpen && typeof document !== "undefined"
          ? createPortal(
              <motion.div
                key="topping-choice-sheet"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18 }}
                className="fixed inset-0 z-[80] flex items-end justify-center px-3 pb-3 sm:items-center sm:p-6"
                style={{ background: "var(--dialog-scrim)" }}
                onClick={() => setPickerOpen(false)}
              >
                <motion.div
                  role="dialog"
                  aria-modal="true"
                  aria-label={engineMessage(cms, "topping.chooseAllTitle", "Tutti i gusti")}
                  initial={{ y: 28, opacity: 0, scale: 0.98 }}
                  animate={{ y: 0, opacity: 1, scale: 1 }}
                  exit={{ y: 20, opacity: 0, scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 420, damping: 34 }}
                  className="w-full max-w-2xl overflow-hidden rounded-[2rem]"
                  style={{
                    maxHeight: "min(760px, calc(100vh - 32px))",
                    background: "color-mix(in srgb, var(--container-page) 94%, transparent)",
                    border: "1px solid var(--container-border)",
                    boxShadow: "var(--dialog-shadow), inset 0 1px 0 color-mix(in srgb, var(--overlay-text) 18%, transparent)",
                    backdropFilter: "blur(28px) saturate(1.7)",
                    WebkitBackdropFilter: "blur(28px) saturate(1.7)",
                  }}
                  onClick={(event) => event.stopPropagation()}
                >
                  <div className="flex items-start gap-3 px-4 pb-3 pt-4 sm:px-5 sm:pt-5">
                    <div className="min-w-0 flex-1">
                      <div
                        className="type-data-sm"
                        style={{
                          color: "var(--text-muted)",
                          fontWeight: "var(--weight-semibold)" as any,
                          letterSpacing: "0.1em",
                          textTransform: "uppercase",
                        }}
                      >
                        {engineMessage(cms, "topping.viewAll", "Vedi tutti")}
                      </div>
                      <h3
                        className="mt-0.5 font-serif"
                        style={{
                          color: "var(--text-default)",
                          fontSize: "clamp(1.45rem, 5vw, 2rem)",
                          lineHeight: "var(--leading-heading)",
                        }}
                      >
                        {engineMessage(cms, "topping.chooseAllTitle", "Tutti i gusti")}
                      </h3>
                      <p
                        className="mt-1 type-body"
                        style={{
                          color: "var(--text-muted)",
                          lineHeight: "var(--leading-normal)",
                        }}
                      >
                        {engineMessage(cms, "topping.chooseAllHint", "Scegli un condimento: torni subito al dettaglio.")}
                      </p>
                    </div>
                    <IconButton
                      type="button"
                      onClick={() => setPickerOpen(false)}
                      size="md"
                      variant="ghost"
                      className="flex-shrink-0 active:scale-95 transition-transform"
                      style={{
                        background: "var(--container-bg-low)",
                        border: "1px solid var(--container-border-subtle)",
                        color: "var(--text-muted)",
                      }}
                      aria-label={cms.ui.close}
                    >
                      <X size={16} />
                    </IconButton>
                  </div>

                  <div className="px-4 pb-4 sm:px-5 sm:pb-5">
                    <div
                      className="flex items-center gap-2 rounded-2xl px-3"
                      style={{
                        minHeight: 46,
                        background: "var(--container-bg-low)",
                        border: "1px solid var(--container-border-subtle)",
                      }}
                    >
                      <Search size={16} style={{ color: "var(--icon-muted)", flexShrink: 0 }} />
                      <input
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        placeholder={engineMessage(cms, "topping.searchPlaceholder", "Cerca gusto, ingrediente o occasione")}
                        className="min-w-0 flex-1 bg-transparent outline-none type-data"
                        style={{
                          border: "none",
                          color: "var(--text-default)",
                        }}
                        autoFocus
                      />
                      {query && (
                        <IconButton
                          type="button"
                          onClick={() => setQuery("")}
                          size="sm"
                          variant="ghost"
                          className="active:scale-95"
                          style={{ color: "var(--text-muted)" }}
                          aria-label={cms.pages.searchClearLabel}
                        >
                          <X size={14} />
                        </IconButton>
                      )}
                    </div>

                    <div className="mt-3 flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
                      <button
                        type="button"
                        onClick={() => setActiveFlavor("all")}
                        className="flex-shrink-0 rounded-full px-3 py-1.5 type-data active:scale-95 transition-transform"
                        style={{
                          background: activeFlavor === "all" ? "var(--chip-bg-active)" : "var(--container-bg-low)",
                          color: activeFlavor === "all" ? "var(--chip-text-active)" : "var(--text-muted)",
                          border: activeFlavor === "all"
                            ? "1px solid transparent"
                            : "1px solid var(--container-border-subtle)",
                          fontWeight: "var(--weight-semibold)" as any,
                          cursor: "pointer",
                        }}
                      >
                        {engineMessage(cms, "topping.filterAll", "Tutti")}
                      </button>
                      {flavorFilters.map((profile) => (
                        <button
                          key={profile}
                          type="button"
                          onClick={() => setActiveFlavor(profile)}
                          className="flex-shrink-0 rounded-full px-3 py-1.5 type-data active:scale-95 transition-transform"
                          style={{
                            background: activeFlavor === profile ? "var(--chip-bg-active)" : "var(--container-bg-low)",
                            color: activeFlavor === profile ? "var(--chip-text-active)" : "var(--text-muted)",
                            border: activeFlavor === profile
                              ? "1px solid transparent"
                              : "1px solid var(--container-border-subtle)",
                            fontWeight: "var(--weight-semibold)" as any,
                            cursor: "pointer",
                          }}
                        >
                          {FLAVOR_PROFILE_LABELS[profile]}
                        </button>
                      ))}
                    </div>

                    <div className="mt-3 max-h-[48vh] overflow-y-auto pr-1 sm:max-h-[440px]">
                      <div className="grid gap-2 sm:grid-cols-2">
                        {filteredPickerChoices.length > 0 ? (
                          filteredPickerChoices.map(({ recipe, authenticity }) => {
                            const concept = TOPPING_CONCEPTS[recipe.concept_ref];
                            const active = activeConceptId === recipe.id;
                            return (
                              <button
                                key={recipe.id}
                                type="button"
                                onClick={() => selectFromSheet(recipe.id)}
                                className="flex items-center gap-3 rounded-2xl p-2.5 text-left active:scale-[0.99] transition-transform"
                                style={{
                                  background: active
                                    ? "var(--chip-bg-active)"
                                    : "var(--container-bg-low)",
                                  color: active
                                    ? "var(--chip-text-active)"
                                    : "var(--text-default)",
                                  border: active
                                    ? "1px solid transparent"
                                    : "1px solid var(--container-border-subtle)",
                                  cursor: "pointer",
                                }}
                                aria-pressed={active}
                              >
                                {concept?.thumbnail && (
                                  <img
                                    src={concept.thumbnail}
                                    alt=""
                                    className="h-12 w-12 rounded-xl object-cover"
                                    loading="lazy"
                                  />
                                )}
                                <span className="min-w-0 flex-1">
                                  <span
                                    className="block truncate type-data"
                                    style={{
                                      fontWeight: "var(--weight-semibold)" as any,
                                      lineHeight: "var(--leading-tight)",
                                    }}
                                  >
                                    {recipe.name ?? concept?.name}
                                  </span>
                                  <span
                                    className="mt-0.5 block truncate type-data-sm"
                                    style={{
                                      color: active ? "inherit" : "var(--text-muted)",
                                      lineHeight: "var(--leading-normal)",
                                      opacity: active ? 0.82 : 1,
                                    }}
                                  >
                                    {authenticityLabel(authenticity, cms)}
                                  </span>
                                </span>
                              </button>
                            );
                          })
                        ) : (
                          <div
                            className="rounded-2xl p-4 text-center sm:col-span-2 type-body"
                            style={{
                              background: "var(--container-bg-low)",
                              color: "var(--text-muted)",
                            }}
                          >
                            {engineMessage(cms, "topping.noResults", "Nessun condimento trovato.")}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>,
              document.body,
              "topping-choice-sheet",
            )
          : null}
    </div>
  );
}

function NerdAuraBlock({
  children,
  className = "",
  compact = false,
}: {
  children: ReactNode;
  className?: string;
  compact?: boolean;
}) {
  const reduceMotion = useReducedMotion();
  return (
    <div className={`relative ${className}`} style={{ isolation: "isolate" }}>
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute rounded-[2rem]"
        initial={false}
        animate={
          reduceMotion
            ? { opacity: compact ? 0.32 : 0.42 }
            : {
                opacity: compact ? [0.28, 0.52, 0.34] : [0.36, 0.72, 0.46],
                scale: [0.96, 1.04, 0.99],
                x: [0, 7, -5, 0],
                y: [0, -5, 6, 0],
              }
        }
        transition={{
          duration: compact ? 5.8 : 7.2,
          repeat: reduceMotion ? 0 : Infinity,
          ease: "easeInOut",
        }}
        style={{
          inset: compact ? "-10px" : "-18px",
          zIndex: -1,
          filter: compact ? "blur(14px)" : "blur(22px)",
          background:
            "radial-gradient(ellipse at 18% 18%, color-mix(in srgb, var(--logo-grad-start) 42%, transparent) 0%, transparent 58%), radial-gradient(ellipse at 82% 30%, color-mix(in srgb, var(--logo-grad-mid) 36%, transparent) 0%, transparent 54%), radial-gradient(ellipse at 48% 92%, color-mix(in srgb, var(--logo-grad-end) 34%, transparent) 0%, transparent 62%)",
        }}
      />
      <div className="relative z-[1]">{children}</div>
    </div>
  );
}

/* ═══ CLOCK HELPERS ═══ */
function roundToQuarter(date: Date): Date {
  const d = new Date(date);
  const mins = d.getMinutes();
  const rounded = Math.ceil(mins / 15) * 15;
  d.setMinutes(rounded, 0, 0);
  if (rounded >= 60) {
    d.setHours(d.getHours() + 1);
    d.setMinutes(0);
  }
  return d;
}
function addMinutes(date: Date, mins: number): Date {
  return new Date(date.getTime() + mins * 60 * 1000);
}
function shiftQuarter(date: Date, direction: number): Date {
  return new Date(date.getTime() + direction * 15 * 60 * 1000);
}

/* ═══ Cross-day helpers ═══ */

/** Day offset between two dates (calendar-day based, handles midnight correctly) */
function dayOffset(reference: Date, target: Date): number {
  const refDay = new Date(reference.getFullYear(), reference.getMonth(), reference.getDate());
  const tgtDay = new Date(target.getFullYear(), target.getMonth(), target.getDate());
  return Math.round((tgtDay.getTime() - refDay.getTime()) / (24 * 60 * 60 * 1000));
}

/** Day suffix: "" for same day, " domani" for next day, " dopodomani" for +2, " +N giorni" oltre.
 * Si evita "+1g" perché "g" in un'app di pizza è ambiguo (grammi). */
function daySuffix(
  reference: Date,
  target: Date,
  copy?: CmsContent["cooking"],
): string {
  const d = dayOffset(reference, target);
  if (d === 0) return "";
  if (d === 1) return ` ${copy?.dayTomorrow ?? "domani"}`;
  if (d === 2) return ` ${copy?.dayAfterTomorrow ?? "dopodomani"}`;
  return ` ${t(copy?.dayOffset ?? "+{n} giorni", { n: d })}`;
}

/** Clock time with optional day offset badge: "14:30" or "14:30 +1g" */
function clockWithDay(
  date: Date,
  reference: Date,
  bcp47: string,
  copy?: CmsContent["cooking"],
): string {
  const hhmm = date.toLocaleTimeString(bcp47, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  return hhmm + daySuffix(reference, date, copy);
}

/** Orario "onesto" (feedback giugno 2026): le fasi flessibili (puntata,
 * appretto, pre-fermento) durano ore — "inizia alle 18:17" è precisione
 * finta. Arrotondiamo ai 15' con prefisso ~; le fasi attive restano esatte. */
function displayStepTime(
  stepId: string,
  date: Date,
  reference: Date,
  bcp47: string,
  copy?: CmsContent["cooking"],
): string {
  if (!FLEXIBLE_STEP_IDS.has(stepId)) {
    return clockWithDay(date, reference, bcp47, copy);
  }
  const rounded = new Date(Math.round(date.getTime() / 900_000) * 900_000);
  return `~${clockWithDay(rounded, reference, bcp47, copy)}`;
}

/* ═══ OTTIMIZZATORE COMODITÀ (feedback giugno 2026) ═══
 * "A volte non fa niente se l'impasto resta in frigo un'ora in più, ma magari
 * non ti devi alzare alle 5." Le fasi flessibili si stirano/accorciano entro
 * tolleranze tecniche per portare le fasi ATTIVE in orari umani, tenendo
 * fisso l'orario del pasto (la fine non si tocca). */

const ACTIVE_STEP_IDS = new Set([
  "mix", "divide", "shape", "top", "bake", "preheat",
  "stack", "fill_internal", "split_fill", "top_post", "bake2",
]);

function isNightHour(h: number): boolean {
  return h >= 23 || h < 7;
}

function countNightActives(
  timeline: TimelineStep[],
  startMs: number,
  stretch: Record<number, number>,
): number {
  let cursor = startMs;
  let count = 0;
  timeline.forEach((step, i) => {
    if (ACTIVE_STEP_IDS.has(step.id) && isNightHour(new Date(cursor).getHours())) count++;
    cursor += (step.duration_minutes + (stretch[i] ?? 0)) * 60_000;
  });
  return count;
}

export interface ComfortPlan {
  stretch: Record<number, number>;
  newStart: Date;
  nightCount: number;
  totalExtra: number;
}

function optimizeComfort(
  timeline: TimelineStep[],
  startTime: Date,
  fermentTempC: number,
  now: Date = new Date(),
): ComfortPlan | null {
  const baseNight = countNightActives(timeline, startTime.getTime(), {});
  if (baseNight === 0) return null;

  const flexIdx = timeline
    .map((s, i) => ({ s, i }))
    .filter(({ s }) => FLEXIBLE_STEP_IDS.has(s.id) && s.duration_minutes >= 45)
    .map(({ i }) => i);
  if (flexIdx.length === 0) return null;

  const cold = fermentTempC <= 6;
  const optionsFor = (i: number): number[] => {
    const dur = timeline[i].duration_minutes;
    /* In frigo la maturazione tollera molto: fino a +50% (max 6h) e -25%
     * (max 4h) — su 14h di frigo, ±2-3h non cambiano la pizza. A temperatura
     * ambiente i margini sono stretti: +30% (max 2h), -20% (max 90').
     * Passi da 30'. */
    const maxExtra = Math.min(cold ? dur * 0.5 : dur * 0.3, cold ? 360 : 120);
    const maxShrink = cold
      ? Math.min(dur * 0.25, 240)
      : Math.min(dur * 0.2, 90);
    const opts: number[] = [];
    for (let e = -Math.floor(maxShrink / 30) * 30; e <= maxExtra; e += 30) opts.push(e);
    return opts;
  };

  /* Cartesiano sui (pochi) step flessibili */
  let combos: Record<number, number>[] = [{}];
  for (const i of flexIdx) {
    const next: Record<number, number>[] = [];
    for (const c of combos) {
      for (const e of optionsFor(i)) next.push({ ...c, [i]: e });
    }
    combos = next;
    if (combos.length > 25_000) break;
  }

  const totalBase = timeline.reduce((s, st) => s + st.duration_minutes, 0);
  const endMs = startTime.getTime() + totalBase * 60_000; // il pasto NON si sposta
  let best: ComfortPlan | null = null;
  let bestScore = Infinity;

  for (const c of combos) {
    const totalExtra = Object.values(c).reduce((a, b) => a + b, 0);
    // Inizio su quarti d'ora: gli orari proposti devono essere umani
    const newStartMs =
      Math.round((endMs - (totalBase + totalExtra) * 60_000) / 900_000) * 900_000;
    if (newStartMs < now.getTime() - 5 * 60_000) continue; // non si parte nel passato
    const night = countNightActives(timeline, newStartMs, c);
    const score = night * 100_000 + Math.abs(totalExtra);
    if (score < bestScore) {
      bestScore = score;
      best = { stretch: c, newStart: new Date(newStartMs), nightCount: night, totalExtra };
    }
  }

  /* Onestà prima di tutto: proponiamo il piano solo se AZZERA le fasi attive
   * notturne. Un miglioramento parziale ("ti svegli alle 2:30 invece che
   * alle 3") non mantiene la promessa "sistemalo per me". */
  if (!best || best.nightCount > 0) return null;
  best.stretch = Object.fromEntries(
    Object.entries(best.stretch).filter(([, v]) => v !== 0),
  ) as Record<number, number>;
  if (Object.keys(best.stretch).length === 0) return null;
  return best;
}

/** Vista Semplice: la forza farina in parole, non in sigle (audit roleplay). */
function engineMessage(cms: CmsContent | undefined, key: string, fallback: string): string {
  return cms?.engineMessages?.[key] ?? fallback;
}

function authenticityLabel(score: AuthenticityScore, cms: CmsContent | undefined): string {
  return engineMessage(cms, `topping.auth.${score}`, AUTHENTICITY_META[score].label);
}

function flourStrengthLabel(w: number, cms: CmsContent | undefined): string {
  if (w < 220) return engineMessage(cms, "hint.flourWeak", "farina debole (00 classica)");
  if (w < 280) return engineMessage(cms, "hint.flourMedium", "farina di media forza");
  if (w < 330) return engineMessage(cms, "hint.flourStrong", "farina forte (per pizza)");
  return engineMessage(cms, "hint.flourVeryStrong", "farina molto forte (manitoba)");
}

/** Equivalenza pratica per il lievito: 0.2g non si pesa con la bilancia di
 * casa — diamo un riferimento visivo (audit roleplay giugno 2026).
 * Secco: 1 cucchiaino raso ≈ 3g. Fresco: una nocciola ≈ 5g, un cece ≈ 1g. */
function yeastPracticalHint(grams: number, type: string, cms: CmsContent | undefined): string | undefined {
  if (grams >= 3) return undefined; // pesabile senza problemi
  if (type === "dry") {
    if (grams <= 0.4) return engineMessage(cms, "hint.yeastDryPinch", "≈ una punta di cucchiaino");
    if (grams <= 0.9) return engineMessage(cms, "hint.yeastDryQuarterTsp", "≈ ¼ di cucchiaino");
    if (grams <= 1.8) return engineMessage(cms, "hint.yeastDryHalfTsp", "≈ ½ cucchiaino");
    return engineMessage(cms, "hint.yeastDryOneTsp", "≈ 1 cucchiaino raso");
  }
  if (type === "fresh") {
    if (grams <= 0.6) return engineMessage(cms, "hint.yeastFreshSmall", "≈ mezzo cece");
    if (grams <= 1.4) return engineMessage(cms, "hint.yeastFreshMedium", "≈ un cece");
    return engineMessage(cms, "hint.yeastFreshLarge", "≈ una nocciola");
  }
  return undefined;
}

/** Unified duration formatter: "15 min" / "1h 30min" / "16h" / "1g 4h" / "2g 3h" */
function fmtDuration(minutes: number, fmt?: ReturnType<typeof createFormatter>): string {
  if (minutes <= 0) return "";
  if (fmt) return fmt.durationMinutes(minutes);
  if (minutes < 60) return `${minutes} min`;
  const totalH = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (totalH < 24) {
    if (m === 0) return `${totalH}h`;
    return `${totalH}h ${m}min`;
  }
  const d = Math.floor(totalH / 24);
  const h = totalH % 24;
  const dayLabel = d === 1 ? "1 giorno" : `${d} giorni`;
  if (h === 0) return dayLabel;
  return `${dayLabel} ${h}h`;
}

/* ═══ Clipboard helpers ═══ */
function copyToClipboard(text: string, onSuccess: () => void) {
  if (
    navigator.clipboard &&
    typeof navigator.clipboard.writeText === "function"
  ) {
    navigator.clipboard
      .writeText(text)
      .then(onSuccess)
      .catch(() => fallbackCopy(text, onSuccess));
  } else {
    fallbackCopy(text, onSuccess);
  }
}
function fallbackCopy(text: string, onSuccess: () => void) {
  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    document.body.removeChild(ta);
    onSuccess();
  } catch {
    /* silently fail */
  }
}

/* VPL-013: format compensation values with appropriate units */
function formatCompVal(type: string, val: number): string {
  if (type.includes("hydration")) return `${val.toFixed(1)}%`;
  if (type.includes("oil") || type.includes("fat") || type.includes("sugar")) return `${val.toFixed(1)}%`;
  if (type.includes("time") || type.includes("cook")) return `${Math.round(val)}s`;
  if (type.includes("thickness")) return `×${val.toFixed(2)}`;
  return String(Math.round(val * 100) / 100);
}

/* ═══ Timeline step localization ═══ */
function localizeStep(
  step: TimelineStep,
  recipe: GeneratedRecipe,
  cms: CmsContent,
  fmt?: ReturnType<typeof createFormatter>,
): { title: string; description: string; longDesc?: string; tip?: { beginner: string; nerd: string } } {
  const formatRawStep = (raw: TimelineStep) => {
    if (!fmt) return raw;
    return {
      ...raw,
      description: formatTemperatureCopy(raw.description, fmt),
      tip: raw.tip
        ? {
            beginner: formatTemperatureCopy(raw.tip.beginner, fmt),
            nerd: formatTemperatureCopy(raw.tip.nerd, fmt),
          }
        : undefined,
    };
  };
  const labels = cms.timelineLabels;
  if (!labels) return formatRawStep(step);

  const isNoKnead = recipe.style.dough.process_type.includes("no_knead");
  const isCold = recipe.fermentation_temp_c <= 6;
  const isRect = recipe.style.shape.shape_type === "rectangular";
  const isThin = recipe.style.crust_type === "crispy_thin";
  // Audit motore 2026-05: lo step "Cottura" deve riflettere la temperatura
  // effettiva del forno utente (recipe.oven_temp_c), non quella ideale dello
  // stile. Prima usava temp_c_ideal e diceva "Cuocere a 485°C" anche con
  // forno domestico 250°C.
  const bakeTemp = Math.round(recipe.oven_temp_c);
  const fermTemp = recipe.fermentation_temp_c;
  const fermFactor = Math.pow(2, (fermTemp - 18) / 10).toFixed(1);
  const prefType = recipe.style.dough.process_type.includes("poolish") ? "poolish" : "biga";
  const formatTemp = (value: number) =>
    fmt ? fmt.celsius(value) : `${Math.round(value)}°C`;

  // Sprint 11 Fase 1: con layout speciale, gli step shape/divide/bake hanno
  // descrizioni layout-aware nel motore. Skippiamo la localizzazione CMS per quegli step
  // così non sovrascrive il testo specifico (Baciata, Ciaccino, Scaccia, Recco).
  const layout = getLayoutSpec(recipe.style);
  const hasSpecialLayout = layout.type !== "single";

  let entry: CmsTimelineStep | undefined;

  switch (step.id) {
    case "preferment":
      entry = labels.preferment;
      break;
    case "mix":
      entry = isNoKnead ? (labels.mix_noknead || labels.mix) : labels.mix;
      break;
    case "bulk":
      entry = isCold ? (labels.bulk_cold || labels.bulk) : labels.bulk;
      break;
    case "divide": {
      // Con layout multi-piece, motore già genera desc specifica
      if (hasSpecialLayout && (layout.pieces_per_unit ?? 1) > 1) return formatRawStep(step);
      // Teglia/pala/focaccia: staglio delicato, niente pirlatura stretta.
      const unit = getServingUnit(recipe.style);
      const isGentle = unit === "teglia" || unit === "pala" || unit === "focaccia";
      entry = isGentle ? (labels.divide_teglia || labels.divide) : labels.divide;
      break;
    }
    case "proof":
      entry = labels.proof;
      break;
    case "shape":
      // Con layout speciale, motore già genera desc specifica per il tipo di stesura
      if (hasSpecialLayout) return formatRawStep(step);
      entry = isThin ? (labels.shape_thin || labels.shape) : (isRect && labels.shape?.descAlt) ? labels.shape : labels.shape;
      break;
    case "top":
      entry = labels.top;
      break;
    case "preheat": {
      const equipmentNote = step.description.includes("pietra o acciaio")
        ? engineMessage(cms, "timeline.preheat.equipmentNote", " (pietra o acciaio già dentro)")
        : "";
      return {
        title: engineMessage(cms, "timeline.preheat.title", "Forno al massimo"),
        description: t(
          engineMessage(
            cms,
            "timeline.preheat.desc",
            "Accendi ora il forno a {temp}{equipmentNote}. Intanto i panetti finiscono l'appretto.",
          ),
          { temp: formatTemp(bakeTemp), equipmentNote },
        ),
        tip: step.tip
          ? {
              beginner: engineMessage(
                cms,
                "timeline.preheat.tipBeginner",
                "Il forno deve essere caldissimo. Preriscalda almeno 30 minuti prima.",
              ),
              nerd: t(
                engineMessage(
                  cms,
                  "timeline.preheat.tipNerd",
                  "La massa termica della superficie domina il primo minuto di cottura: {minutes} min di soak assicurano che pietra/acciaio siano saturi, non solo l'aria del forno.",
                ),
                { minutes: step.duration_minutes },
              ),
            }
          : undefined,
      };
    }
    case "bake":
      // Con cook_mode "white_then_top", il motore genera "Prima cottura (in bianco)" custom
      if (layout.cook_mode === "white_then_top") return formatRawStep(step);
      entry = labels.bake;
      break;
    default:
      return formatRawStep(step);
  }

  if (!entry) return formatRawStep(step);

  // L'appretto avviene a temperatura ambiente anche con maturazione in frigo:
  // il motore usa max(fermTemp, 18) — qui dobbiamo fare lo stesso, altrimenti
  // il sottotitolo dice "a 4°C" mentre il testo dice "temperatura ambiente".
  const proofTemp = Math.max(fermTemp, 18);
  const vars: Record<string, string | number> = {
    temp: formatTemp(step.id === "bake" ? bakeTemp : step.id === "proof" ? proofTemp : fermTemp),
    refTemp: formatTemp(18),
    fridgeTemp: formatTemp(4),
    type: prefType,
    factor: fermFactor,
  };
  const title = entry.title || step.title;
  let desc = entry.desc || step.description;

  // For shape: use descAlt for rectangular, default for round
  if (step.id === "shape" && isRect && entry.descAlt) {
    desc = entry.descAlt;
  }

  // Replace template vars
  desc = t(desc, vars);

  const tip = (entry.tipBeginner && entry.tipNerd)
    ? { beginner: t(entry.tipBeginner, vars), nerd: t(entry.tipNerd, vars) }
    : step.tip;

  // Spiegazione estesa opzionale (interpolata con le stesse vars)
  const longDesc = entry.longDesc ? t(entry.longDesc, vars) : undefined;

  return { title, description: desc, longDesc, tip };
}

function ScrollToTopOnMount() {
  React.useEffect(() => {
    window.scrollTo(0, 0);
    let frameId: number;
    let count = 0;
    const scroll = () => {
      window.scrollTo(0, 0);
      count++;
      if (count < 12) {
        frameId = requestAnimationFrame(scroll);
      }
    };
    frameId = requestAnimationFrame(scroll);
    return () => {
      cancelAnimationFrame(frameId);
    };
  }, []);
  return null;
}

export function RecipeOutput({
  recipe,
  constraints,
  onConstraintsChange,
  nerdMode,
  simple,
  selectedTimeSlotId,
  panConfig,
  forcedTab,
  hidePager = false,
  hideContextSummary = false,
  recipeControls,
  matchSlot,
  showFeedback = true,
  selectedToppingConcept,
  onSelectTopping,
  onTabChange,
  shareUrl,
  nerdAvailable = false,
  hideFloatingActions = false,
  onNerdModeChange,
  isPersonalized = true,
  onRequestPersonalization,
}: RecipeOutputProps) {
  const reduceMotion = useReducedMotion();
  const [copiedIng, setCopiedIng] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);

  React.useLayoutEffect(() => {
    setPortalTarget(document.getElementById("recipe-header-actions"));
  }, []);

  /* Warning prima di rimpiazzare una pizzata in corso di un ALTRO stile:
     avviarne una nuova sovrascrive timer e progresso di quella attiva. */
  const [confirmReplace, setConfirmReplace] = useState(false);
  const [confirmPersonalize, setConfirmPersonalize] = useState(false);
  /* Audit motore 2026-05: spiegazione Regola 55 espandibile per mobile (su
     desktop c'è già il tooltip via title, ma su touch non è raggiungibile). */
  const [showRule55Tip, setShowRule55Tip] = useState(false);

  const handleCopyLink = () => {
    if (!shareUrl) return;
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(shareUrl).then(
        () => {
          setLinkCopied(true);
          setTimeout(() => setLinkCopied(false), 2000);
        },
        () => fallbackCopy(shareUrl)
      );
    } else {
      fallbackCopy(shareUrl);
    }

    function fallbackCopy(text: string) {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      try {
        document.execCommand("copy");
        setLinkCopied(true);
        setTimeout(() => setLinkCopied(false), 2000);
      } catch (err) {
        console.error("Fallback copy failed", err);
      }
      document.body.removeChild(ta);
    }
  };

  const { cms, bcp47 } = useCms();
  const ui = cms.ui;
  const fmt = createFormatter(ui, bcp47);
  const rule55Description = t(cms.cooking.rule55Description, {
    target: fmt.unitSystem === "imperial"
      ? (bcp47.toLowerCase().startsWith("it") ? "55 in scala Celsius" : "55 on the Celsius scale")
      : fmt.celsius(55),
    final: fmt.celsius(25),
    frictionMin: fmt.celsiusDelta(1),
    frictionMax: fmt.celsiusDelta(3),
  });

  /* Label contestuale per il selettore di porzioni ("Panetti" / "Teglie" / ...). */
  const servingUnit = getServingUnit(recipe.style);
  const servingLabel = getServingUnitLabel(cms, servingUnit, 2);
  const allToppingChoices = React.useMemo(
    () =>
      getRecipesByAuthenticity(recipe.style).filter(
        (item) => item.authenticity !== "taboo",
      ),
    [recipe.style],
  );
  const toppingChoices = React.useMemo(() => {
    const featured = allToppingChoices.filter(
      (item) =>
        item.authenticity === "canonical" ||
        item.authenticity === "natural" ||
        item.authenticity === "common",
    );
    const activeConceptId =
      selectedToppingConcept ?? recipe.style.default_topping_ref ?? null;
    if (
      activeConceptId &&
      !featured.some((item) => item.recipe.id === activeConceptId)
    ) {
      const activeChoice = allToppingChoices.find(
        (item) => item.recipe.id === activeConceptId,
      );
      if (activeChoice) return [activeChoice, ...featured];
    }
    return featured;
  }, [allToppingChoices, recipe.style.default_topping_ref, selectedToppingConcept]);

  /* UI proximity #54 — dimensioni teglia accanto al conteggio: solo per gli
     stili che usano una teglia/contenitore. Usa la config attiva (se
     personalizzata) altrimenti i default dello stile. Es. "40×30 cm" o "Ø28 cm". */
  const panSizeLabel = (() => {
    if (!needsPan(recipe.style)) return null;
    const shape = recipe.style.shape;
    const isRound =
      (panConfig?.panShape ?? shape.shape_type) === "round";
    if (isRound) {
      const d = panConfig?.panDiameter ?? shape.diameter_cm;
      return d ? `Ø${Math.round(d)} cm` : null;
    }
    const l = panConfig?.panLength ?? shape.length_cm;
    const w = panConfig?.panWidth ?? shape.width_cm;
    return l && w ? `${Math.round(l)}×${Math.round(w)} cm` : null;
  })();

  /* ═══ Smart start time — back-calculate from eating time ═══
     If the user selected a time slot, we know WHEN they want to eat
     (now + available_hours). We subtract the total recipe duration
     to get the ideal start time. Falls back to "now" rounded. */
  const totalDurationMinStatic = React.useMemo(
    () => recipe.timeline.reduce((sum, s) => sum + s.duration_minutes, 0),
    [recipe.timeline],
  );

  const [startTime, setStartTime] = useState(() => {
    if (selectedTimeSlotId && selectedTimeSlotId !== "no_preference" && constraints.available_hours > 0) {
      const eatingTime = new Date(Date.now() + constraints.available_hours * 3600_000);
      const idealStart = new Date(eatingTime.getTime() - totalDurationMinStatic * 60_000);
      // If ideal start is in the past, use now + 15min rounded
      if (idealStart.getTime() < Date.now()) {
        return roundToQuarter(new Date());
      }
      return roundToQuarter(idealStart);
    }
    return roundToQuarter(new Date());
  });

  const [editingTime, setEditingTime] = useState(false);
  const [editingEndTime, setEditingEndTime] = useState(false);

  const showNerdToggle = nerdAvailable && !!onNerdModeChange;
  const isNerd = showNerdToggle && !!nerdMode;

  const handleCopyIngredients = () => {
    const text = formatIngredientsText(recipe, cms, bcp47);
    copyToClipboard(text, () => {
      setCopiedIng(true);
      setTimeout(() => setCopiedIng(false), 2000);
    });
  };
  /* ── Timeline comoda (feedback giugno 2026): minuti extra per fase ──
   * Le fasi flessibili possono stirarsi/accorciarsi entro tolleranze: un'ora
   * in più di frigo non cambia la pizza, ma evita la sveglia alle 5. */
  const [stretch, setStretch] = useState<Record<number, number>>({});
  const effDuration = React.useCallback(
    (i: number) => recipe.timeline[i].duration_minutes + (stretch[i] ?? 0),
    [recipe.timeline, stretch],
  );

  /* Reset dello stretch quando cambia la ricetta */
  const timelineKey = recipe.timeline.map((s) => s.id + s.duration_minutes).join("|");
  const prevTimelineKey = React.useRef(timelineKey);
  React.useEffect(() => {
    if (prevTimelineKey.current !== timelineKey) {
      prevTimelineKey.current = timelineKey;
      setStretch({});
    }
  }, [timelineKey]);

  const stepTimes = React.useMemo(() => {
    let cursor = new Date(startTime);
    return recipe.timeline.map((step, i) => {
      const start = new Date(cursor);
      const end = addMinutes(cursor, step.duration_minutes + (stretch[i] ?? 0));
      cursor = end;
      return { start, end };
    });
  }, [recipe.timeline, startTime, stretch]);

  /* ═══ Pager orizzontale: Ricetta | Procedimento ═══ */
  const pagerTabs = React.useMemo(
    () => [
      { id: "ricetta" as PagerTabId, label: forcedTab ? cms.cooking.tabRecipe : cms.cooking.tabRecipeTailored, icon: CookingPot },
      { id: "procedimento" as PagerTabId, label: cms.cooking.tabProcedure, icon: ListChecks },
      { id: "condimento" as PagerTabId, label: cms.cooking.toppingTitle, icon: Utensils },
    ],
    [
      cms.cooking.tabProcedure,
      cms.cooking.tabRecipe,
      cms.cooking.tabRecipeTailored,
      cms.cooking.toppingTitle,
      forcedTab,
    ],
  );
  const [tabView, setTabView] = useState<PagerTabId>("ricetta");
  const [pagerDir, setPagerDir] = useState(1);
  const activeTabView = forcedTab ?? tabView;
  const previousActiveTab = React.useRef<PagerTabId>(activeTabView);
  React.useEffect(() => {
    if (previousActiveTab.current === activeTabView) return;
    const order: PagerTabId[] = ["ricetta", "procedimento", "condimento"];
    setPagerDir(
      order.indexOf(activeTabView) > order.indexOf(previousActiveTab.current)
        ? 1
        : -1,
    );
    previousActiveTab.current = activeTabView;
  }, [activeTabView]);
  const switchTab = React.useCallback(
    (t: PagerTabId) => {
      if (forcedTab) return;
      const order: PagerTabId[] = ["ricetta", "procedimento", "condimento"];
      setPagerDir(order.indexOf(t) >= order.indexOf(activeTabView) ? 1 : -1);
      if (onTabChange) {
        onTabChange(t);
      } else {
        setTabView(t);
      }
    },
    [activeTabView, forcedTab, onTabChange],
  );
  /* Swipe: trascina il pannello per cambiare sezione */
  const onPanelDragEnd = React.useCallback(
    (_: unknown, info: { offset: { x: number }; velocity: { x: number } }) => {
      if (forcedTab) return;
      const ids = pagerTabs.map((t) => t.id);
      const i = ids.indexOf(activeTabView);
      if ((info.offset.x < -70 || info.velocity.x < -500) && i < ids.length - 1) {
        switchTab(ids[i + 1]);
      } else if ((info.offset.x > 70 || info.velocity.x > 500) && i > 0) {
        switchTab(ids[i - 1]);
      }
    },
    [activeTabView, forcedTab, pagerTabs, switchTab],
  );

  /* Piano comfort: calcolato in base alla timeline e start time */
  const [comfortToggled, setComfortToggled] = React.useState(false);
  const preComfortStart = React.useRef<Date | null>(null);
  const currentComfortPlan = React.useMemo(
    () => optimizeComfort(recipe.timeline, startTime, recipe.fermentation_temp_c),
    [recipe.timeline, startTime, recipe.fermentation_temp_c],
  );

  React.useEffect(() => {
    if (comfortToggled && currentComfortPlan) {
      const newStartMs = currentComfortPlan.newStart.getTime();
      if (startTime.getTime() !== newStartMs) {
        if (!preComfortStart.current) {
          preComfortStart.current = new Date(startTime);
        }
        setStretch(currentComfortPlan.stretch);
        setStartTime(currentComfortPlan.newStart);
      }
    }
  }, [comfortToggled, currentComfortPlan, startTime]);

  const isFirstRender = React.useRef(true);
  React.useEffect(() => {
    if (hidePager) return;
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    const timer = setTimeout(() => {
      const element = document.getElementById("recipe-content-tabs-anchor");
      if (element) {
        const isMobile = window.innerWidth < 768;
        const hasStickyHeader = document.querySelector(".sticky.top-0") !== null;
        const yOffset = isMobile 
          ? (hasStickyHeader ? -64 : -20)
          : -100;
        const y = element.getBoundingClientRect().top + window.scrollY + yOffset;
        window.scrollTo({ top: y, behavior: "smooth" });
      } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [activeTabView, hidePager]);

  /* ── Pizzata attiva: step localizzati + temporizzati per la sessione ── */
  const { session, startSession, openOverlay } = useCookSession();
  const hasActiveSession = !!session;
  const isThisSession = hasActiveSession && session?.styleId === recipe.style.id;
  const conflictingSession =
    hasActiveSession && session?.styleId !== recipe.style.id;
  const cookingSteps: Omit<CookSessionStep, "done">[] = React.useMemo(
    () =>
      recipe.timeline.map((step, i) => {
        const loc = localizeStep(step, recipe, cms, fmt);
        return {
          id: step.id,
          title: loc.title,
          description: loc.description,
          longDesc: loc.longDesc,
          tip: loc.tip ? (isNerd ? loc.tip.nerd : loc.tip.beginner) : undefined,
          duration_minutes: step.duration_minutes,
          startMs: (stepTimes[i]?.start ?? startTime).getTime(),
          endMs: (stepTimes[i]?.end ?? startTime).getTime(),
          flexible: FLEXIBLE_STEP_IDS.has(step.id),
        };
      }),
    [recipe, cms, isNerd, stepTimes, startTime],
  );

  /* Un solo punto di verità per "inizia/riprendi pizzata":
     - stessa ricetta già in corso → riapri la modalità cucina
     - altra ricetta in corso → chiedi conferma (sovrascrive)
     - nessuna sessione → parti subito */
  const handleStartCooking = React.useCallback(() => {
    if (isThisSession) {
      openOverlay();
    } else if (!isPersonalized) {
      setConfirmPersonalize(true);
    } else if (conflictingSession) {
      setConfirmReplace(true);
    } else {
      startSession(recipe.style.id, recipe.style.name, cookingSteps);
    }
  }, [isThisSession, isPersonalized, conflictingSession, openOverlay, startSession, recipe.style.id, recipe.style.name, cookingSteps]);

  React.useEffect(() => {
    const handler = () => handleStartCooking();
    window.addEventListener("vulcan:start-cooking", handler);
    return () => window.removeEventListener("vulcan:start-cooking", handler);
  }, [handleStartCooking]);

  const confirmStartCooking = React.useCallback(() => {
    setConfirmReplace(false);
    setConfirmPersonalize(false);
    startSession(recipe.style.id, recipe.style.name, cookingSteps);
  }, [startSession, recipe.style.id, recipe.style.name, cookingSteps]);

  const handlePersonalizeBeforeCooking = React.useCallback(() => {
    setConfirmPersonalize(false);
    onRequestPersonalization?.();
  }, [onRequestPersonalization]);

  const endTime =
    stepTimes.length > 0
      ? stepTimes[stepTimes.length - 1].end
      : startTime;
  const hasFlexiblePhases = React.useMemo(
    () => recipe.timeline.some((s) => FLEXIBLE_STEP_IDS.has(s.id)),
    [recipe.timeline],
  );

  /* Total duration in minutes for back-calculating start from end (stretch incluso) */
  const totalDurationMin = React.useMemo(
    () =>
      recipe.timeline.reduce(
        (sum, s, i) => sum + s.duration_minutes + (stretch[i] ?? 0),
        0,
      ),
    [recipe.timeline, stretch],
  );

  const mealSlots = React.useMemo(() => {
    const slots = generateTimeSlots(new Date());
    const totalDurationMs = totalDurationMin * 60_000;
    const nowMs = Date.now();
    return slots.map(slot => {
      const mealTimeMs = nowMs + slot.hours * 3600_000;
      const idealStartMs = mealTimeMs - totalDurationMs;
      const isFeasible = idealStartMs >= nowMs;
      return {
        ...slot,
        idealStart: new Date(idealStartMs),
        isFeasible,
      };
    });
  }, [totalDurationMin]);

  const procedureHeroControls = (
    <Surface
      className="p-4 sm:p-5"
      style={{
        background:
          "color-mix(in srgb, var(--container-bg) 88%, transparent)",
        boxShadow: "0 12px 34px color-mix(in srgb, var(--shadow-color) 8%, transparent)",
      }}
    >
      <div className="flex items-center justify-between gap-3 w-full">
        <div className="flex items-center gap-1.5 min-w-0">
          <CalendarRange size={16} className="text-primary flex-shrink-0" />
          <h3 className="type-title-sm truncate">{ui.timeline}</h3>
        </div>
        <span
          className="px-2.5 py-1 rounded-full text-xs font-semibold flex-shrink-0"
          style={{
            background: "color-mix(in srgb, var(--primary) 12%, transparent)",
            color: "var(--primary)",
          }}
        >
          Tempo totale: {fmt.durationMinutes(totalDurationMin)}
        </span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 sm:gap-3">
        <div
          className="rounded-2xl px-2.5 py-3 sm:px-3"
          style={{
            background: "var(--container-bg-low)",
            border: "1px solid var(--container-border-subtle)",
          }}
        >
          <div
            className="type-data"
            style={{
              color: "var(--text-muted)",
              fontWeight: "var(--weight-semibold)" as any,
              lineHeight: 1,
            }}
          >
            {ui.startTime}
          </div>
          <div className="mt-2 flex items-center gap-1 sm:gap-1.5">
            <button
              onClick={() => setStartTime((s) => shiftQuarter(s, -1))}
              className="w-8 h-8 rounded-xl flex items-center justify-center active:scale-[0.9] transition-transform"
              style={{
                background: "var(--recipe-bg)",
                border: "1px solid var(--recipe-border)",
              }}
              aria-label={ui.ariaEarlier}
            >
              <Minus size={13} />
            </button>
            {editingTime ? (
              <input
                type="time"
                autoFocus
                defaultValue={fmt.clockTime(startTime)}
                onBlur={handleTimeInput}
                onKeyDown={(e) => {
                  if (e.key === "Enter")
                    (e.target as HTMLInputElement).blur();
                }}
                className="bg-transparent text-center outline-none type-numeric"
                style={{
                  color: "var(--text-default)",
                  fontSize: "clamp(var(--font-size-md), 3.7vw, var(--font-size-2xl))",
                  fontWeight: "var(--weight-bold)" as any,
                  width: 58,
                  border: "none",
                  borderBottom: "2px solid var(--recipe-highlight)",
                }}
              />
            ) : (
              <button
                onClick={() => setEditingTime(true)}
                className="type-numeric flex flex-col items-center justify-center"
                style={{
                  minWidth: 0,
                  flex: 1,
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  borderBottom: "1px dashed var(--recipe-border)",
                  paddingBottom: 1,
                }}
              >
                <span
                  style={{
                    fontSize: "clamp(var(--font-size-md), 3.7vw, var(--font-size-2xl))",
                    fontWeight: "var(--weight-bold)" as any,
                    lineHeight: "var(--leading-tight)",
                    color: "var(--text-accent)",
                  }}
                >
                  {fmt.clockTime(startTime)}
                  <span className="text-xs font-semibold text-muted ml-1 lowercase">
                    {daySuffix(new Date(), startTime, cms.cooking)}
                  </span>
                </span>
                <span
                  className="type-data-sm"
                  style={{
                    fontWeight: "var(--weight-medium)" as any,
                    lineHeight: "var(--leading-none)",
                    marginTop: "var(--space-0-5)",
                    visibility: "hidden",
                  }}
                >
                  placeholder
                </span>
              </button>
            )}
            <button
              onClick={() => setStartTime((s) => shiftQuarter(s, 1))}
              className="w-8 h-8 rounded-xl flex items-center justify-center active:scale-[0.9] transition-transform"
              style={{
                background: "var(--recipe-bg)",
                border: "1px solid var(--recipe-border)",
              }}
              aria-label={ui.ariaLater}
            >
              <Plus size={13} />
            </button>
          </div>
        </div>

        <div
          className="rounded-2xl px-2.5 py-3 sm:px-3"
          style={{
            background: "var(--container-bg-low)",
            border: "1px solid var(--container-border-subtle)",
          }}
        >
          <div
            className="type-data"
            style={{
              color: "var(--text-muted)",
              fontWeight: "var(--weight-semibold)" as any,
              lineHeight: 1,
            }}
          >
            {ui.endTime}
          </div>
          <div className="mt-2 flex items-center gap-1 sm:gap-1.5">
            <button
              onClick={() => setStartTime((s) => shiftQuarter(s, -1))}
              className="w-8 h-8 rounded-xl flex items-center justify-center active:scale-[0.9] transition-transform"
              style={{
                background: "var(--recipe-bg)",
                border: "1px solid var(--recipe-border)",
              }}
              aria-label={ui.ariaEarlier}
            >
              <Minus size={13} />
            </button>
            {editingEndTime ? (
              <input
                type="time"
                autoFocus
                defaultValue={fmt.clockTime(endTime)}
                onBlur={handleEndTimeInput}
                onKeyDown={(e) => {
                  if (e.key === "Enter")
                    (e.target as HTMLInputElement).blur();
                }}
                className="bg-transparent text-center outline-none type-numeric"
                style={{
                  color: "var(--text-default)",
                  fontSize: "clamp(var(--font-size-md), 3.7vw, var(--font-size-2xl))",
                  fontWeight: "var(--weight-bold)" as any,
                  width: 58,
                  border: "none",
                  borderBottom: "2px solid var(--recipe-highlight)",
                }}
              />
            ) : (
              <button
                onClick={() => setEditingEndTime(true)}
                className="type-numeric flex flex-col items-center justify-center"
                style={{
                  minWidth: 0,
                  flex: 1,
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  borderBottom: "1px dashed var(--recipe-border)",
                  paddingBottom: 1,
                }}
              >
                <span
                  style={{
                    fontSize: "clamp(var(--font-size-md), 3.7vw, var(--font-size-2xl))",
                    fontWeight: "var(--weight-bold)" as any,
                    lineHeight: "var(--leading-tight)",
                    color: "var(--text-accent)",
                  }}
                >
                  {hasFlexiblePhases ? "~" : ""}
                  {fmt.clockTime(endTime)}
                  <span className="text-xs font-semibold text-muted ml-1 lowercase">
                    {daySuffix(new Date(), endTime, cms.cooking)}
                  </span>
                </span>
                <span
                  className="type-data-sm"
                  style={{
                    fontWeight: "var(--weight-medium)" as any,
                    color: "var(--text-muted)",
                    lineHeight: "var(--leading-none)",
                    marginTop: "var(--space-0-5)",
                    visibility: dayOffset(startTime, endTime) > 0 ? "visible" : "hidden",
                  }}
                >
                  {daySuffix(startTime, endTime).trim() || "placeholder"}
                </span>
              </button>
            )}
            <button
              onClick={() => setStartTime((s) => shiftQuarter(s, 1))}
              className="w-8 h-8 rounded-xl flex items-center justify-center active:scale-[0.9] transition-transform"
              style={{
                background: "var(--recipe-bg)",
                border: "1px solid var(--recipe-border)",
              }}
              aria-label={ui.ariaLater}
            >
              <Plus size={13} />
            </button>
          </div>
        </div>
      </div>

      {/* Start Day Shifter */}
      <div className="mt-3.5 flex gap-2">
        {[
          { offset: 0, label: "Oggi" },
          { offset: 1, label: "Domani" },
          { offset: 2, label: "Dopodomani" },
        ].map((dayOpt) => {
          const now = new Date();
          const currentStartDay = dayOffset(now, startTime);
          const isSelected = currentStartDay === dayOpt.offset;
          return (
            <button
              key={dayOpt.offset}
              type="button"
              onClick={() => {
                const newStart = new Date(startTime);
                const targetDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + dayOpt.offset);
                newStart.setFullYear(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
                setStartTime(roundToQuarter(newStart));
              }}
              className="flex-1 py-1.5 px-2.5 rounded-xl text-center text-xs font-semibold active:scale-[0.97] transition-all"
              style={{
                background: isSelected ? "var(--chip-bg-active)" : "var(--container-bg-low)",
                border: isSelected ? "1px solid var(--tertiary)" : "1px solid var(--container-border-subtle)",
                color: isSelected ? "var(--chip-text-active)" : "var(--text-default)",
                cursor: "pointer",
              }}
            >
              {dayOpt.label}
            </button>
          );
        })}
      </div>

      {/* Smart Eating Planner Shortcuts */}
      <div className="mt-4 pt-3.5" style={{ borderTop: "1px solid var(--container-border-subtle)" }}>
        <div
          className="text-[10px] font-bold tracking-wider uppercase mb-2"
          style={{ color: "var(--text-muted)", letterSpacing: "var(--tracking-spread)" }}
        >
          Pronto per il pasto:
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setStartTime(roundToQuarter(new Date()))}
            className="px-3 py-1.5 rounded-full text-xs font-semibold active:scale-95 transition-all"
            style={{
              background: "var(--container-bg-low)",
              border: "1px solid var(--container-border-subtle)",
              color: "var(--text-default)",
              cursor: "pointer",
            }}
          >
            ⚡ Inizia ora
          </button>

          {mealSlots.map((slot) => {
            if (!slot.isFeasible) return null;
            return (
              <button
                key={slot.id}
                type="button"
                onClick={() => setStartTime(roundToQuarter(slot.idealStart))}
                className="px-3 py-1.5 rounded-full text-xs font-semibold active:scale-95 transition-all"
                style={{
                  background: "var(--container-bg-low)",
                  border: "1px solid var(--container-border-subtle)",
                  color: "var(--text-default)",
                  cursor: "pointer",
                }}
              >
                {slot.label} ({slot.sublabel})
              </button>
            );
          })}
        </div>
      </div>

      <div
        className="mt-3 flex items-center justify-between gap-3 rounded-2xl px-3 py-3 transition-all"
        style={{
          background: comfortToggled
            ? "var(--recipe-comfort-bg, color-mix(in srgb, var(--cta) 5%, transparent))"
            : "var(--container-bg-low)",
          border: comfortToggled
            ? "1px solid var(--recipe-comfort-border, var(--recipe-success))"
            : "1px solid var(--container-border-subtle)",
        }}
      >
        <div className="min-w-0 text-left">
          <div
            className="type-data"
            style={{
              color: "var(--text-default)",
              fontWeight: "var(--weight-semibold)" as any,
              lineHeight: "var(--leading-tight)",
            }}
          >
            {engineMessage(cms, "timelineComfort.title", "Timeline comoda")}
          </div>
          <div
            className="mt-0.5 type-data-sm"
            style={{
              color: comfortToggled
                ? "var(--recipe-success)"
                : currentComfortPlan
                  ? "var(--recipe-warning-text, var(--primary))"
                  : "var(--text-muted)",
              lineHeight: "var(--leading-normal)",
            }}
          >
            {comfortToggled
              ? engineMessage(cms, "timelineComfort.active", "Attiva: evita le fasi notturne.")
              : currentComfortPlan
                ? engineMessage(cms, "timelineComfort.nightDetected", "Fasi attive di notte rilevate.")
                : engineMessage(cms, "timelineComfort.idle", "Ottimizza gli orari se serve.")}
          </div>
        </div>
        <Switch
          checked={comfortToggled}
          onCheckedChange={(checked) => {
            setComfortToggled(checked);
            if (!checked) {
              setStretch({});
              if (preComfortStart.current) {
                setStartTime(preComfortStart.current);
                preComfortStart.current = null;
              }
            }
          }}
        />
      </div>
    </Surface>
  );

  function handleTimeInput(
    e: React.ChangeEvent<HTMLInputElement>,
  ) {
    const [h, m] = e.target.value.split(":").map(Number);
    if (!isNaN(h) && !isNaN(m)) {
      const d = new Date(startTime);
      d.setHours(h, m, 0, 0);
      setStartTime(d);
    }
    setEditingTime(false);
  }

  function handleEndTimeInput(
    e: React.ChangeEvent<HTMLInputElement>,
  ) {
    const [h, m] = e.target.value.split(":").map(Number);
    if (!isNaN(h) && !isNaN(m)) {
      const desired = new Date(startTime);
      desired.setHours(h, m, 0, 0);
      // If desired end is before or equal to start, assume next day
      if (desired.getTime() <= startTime.getTime()) {
        desired.setDate(desired.getDate() + 1);
      }
      // Back-calculate start from desired end
      let newStart = addMinutes(desired, -totalDurationMin);
      // Non si può iniziare nel passato: sposta la fine avanti di giorni
      // finché l'inizio non è ≥ adesso (bug audit giugno 2026).
      while (newStart.getTime() < Date.now()) {
        desired.setDate(desired.getDate() + 1);
        newStart = addMinutes(desired, -totalDurationMin);
      }
      // Inizio sempre su un quarto d'ora: "parti alle 07:37" è precisione finta.
      setStartTime(roundToQuarter(newStart));
    }
    setEditingEndTime(false);
  }

  const updateBalls = (n: number) => {
    onConstraintsChange({
      ...constraints,
      dough_balls: Math.max(1, Math.min(20, n)),
    });
  };

  /* VPL-013: Compensations applied */
  const compensations = recipe.science?.compensations ?? [];

  const renderToppingSection = (mode: "ingredients" | "timeline") => {
    const toppingRefId = recipe.style.default_topping_ref;
    /* Difesa in profondità (R1): se il default_topping_ref non risolve a una
       ricetta concreta (ref legacy `<concept>_<stile>` mai mappato), NON lasciare
       la tab vuota — ricadi sul topping più autentico disponibile per lo stile.
       Così nessuno stile resta senza sezione Condimento. */
    const topping =
      (toppingRefId
        ? getToppingForStyle(toppingRefId, recipe.style)
        : undefined) ??
      toppingChoices[0]?.recipe ??
      allToppingChoices.find((c) => c.authenticity !== "taboo")?.recipe;
    if (!topping || !topping.ingredients || topping.ingredients.length === 0) return null;

    const concept = TOPPING_CONCEPTS[topping.concept_ref];
    const activeConceptId = selectedToppingConcept ?? topping.concept_ref;
    const multiplier = recipe.dough_balls;
    const unitName = getServingUnitLabel(cms, servingUnit, 1, true);
    const totalUnitName =
      getServingUnitLabel(cms, servingUnit, multiplier, true);
    const technicalNotes = [
      ...(topping.pre_prep_steps ?? []).map((step) => ({
        title: step.title,
        body: step.description,
      })),
      ...(topping.assembly_steps ?? []).map((step) => ({
        title: step.title,
        body: step.description,
      })),
      ...(topping.bake_adjustments
        ? [
            {
              title: cms.ui.bakeAdjustmentTitle,
              body: [
                topping.bake_adjustments.temperature_delta_c
                  ? `${topping.bake_adjustments.temperature_delta_c > 0 ? "+" : ""}${fmt.celsiusDelta(topping.bake_adjustments.temperature_delta_c)} ${cms.ui.relativeToBase}`
                  : null,
                topping.bake_adjustments.additional_minutes
                  ? `+${topping.bake_adjustments.additional_minutes} min`
                  : null,
                topping.bake_adjustments.note,
              ]
                .filter(Boolean)
                .join(" · "),
            },
          ]
        : []),
    ].filter((note) => note.body);
    const inline = mode === "timeline";

    if (inline) {
      /* Prep del condimento (es. saltare i funghi): vive QUI, dentro lo step
         Condimento — non più come passaggi separati sopra (VPL-A1). */
      const inlinePrep = (topping.pre_prep_steps ?? []).filter(
        (p) => p.timing === "just_before_assembly",
      );
      return (
        <div className="mt-4 flex flex-col gap-2">
          <CondimentChoiceStrip
            choices={toppingChoices}
            allChoices={allToppingChoices}
            activeConceptId={activeConceptId}
            onSelect={onSelectTopping}
            mode="timeline"
          />
          {inlinePrep.length > 0 && (
            <div className="mt-1 flex flex-col gap-1.5">
              {inlinePrep.map((p) => (
                <div
                  key={p.id}
                  className="rounded-xl px-3.5 py-2.5"
                  style={{
                    background: "var(--surface-container)",
                    border: "1px solid var(--outline-variant)",
                  }}
                >
                  <span
                    className="block type-data"
                    style={{
                      fontWeight: "var(--weight-semibold)" as any,
                      color: "var(--text-default)",
                    }}
                  >
                    {p.title}
                    {p.duration_minutes > 0 && (
                      <span style={{ color: "var(--text-muted)", fontWeight: "var(--weight-regular)" as any }}>
                        {" · "}{fmtDuration(p.duration_minutes, fmt)}
                      </span>
                    )}
                  </span>
                  <span
                    className="block mt-0.5 type-body"
                    style={{
                      color: "var(--text-muted)",
                      lineHeight: "var(--leading-normal)",
                    }}
                  >
                    {p.description}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    const activeChoice = toppingChoices.find(
      (choice) => choice.recipe.id === activeConceptId,
    );
    const activeRecipe = activeChoice?.recipe ?? topping;
    const activeConcept = TOPPING_CONCEPTS[activeRecipe.concept_ref];
    const toppingName = activeRecipe.name ?? activeConcept?.name ?? cms.cooking.toppingTitle;
    const toppingDescription = activeRecipe.description ?? activeConcept?.description;
    const toppingThumbnail = activeConcept?.thumbnail;

    const currentIndex = toppingChoices.findIndex(
      (choice) => choice.recipe.id === activeConceptId,
    );

    const prevTopping = () => {
      if (toppingChoices.length <= 1 || !onSelectTopping) return;
      const prevIndex = (currentIndex - 1 + toppingChoices.length) % toppingChoices.length;
      onSelectTopping(toppingChoices[prevIndex].recipe.id);
    };

    const nextTopping = () => {
      if (toppingChoices.length <= 1 || !onSelectTopping) return;
      const nextIndex = (currentIndex + 1) % toppingChoices.length;
      onSelectTopping(toppingChoices[nextIndex].recipe.id);
    };

    return (
      <section className="flex flex-col gap-6">
        {/* Carousel image with title & badges overlayed */}
        <div className="relative aspect-[16/10] w-full overflow-hidden rounded-3xl bg-[var(--surface-container)] shadow-md">
          <AnimatePresence initial={false} mode="popLayout">
            <motion.div
              key={activeConceptId}
              initial={{ opacity: 0, x: 80 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -80 }}
              transition={{ type: "spring", stiffness: 350, damping: 30 }}
              className="absolute inset-0 w-full h-full"
            >
              {toppingThumbnail ? (
                <img
                  src={toppingThumbnail}
                  alt={toppingName}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-8xl">
                  {activeConcept?.emoji || "🍕"}
                </div>
              )}
              
              {/* Scrim overlay */}
              <div
                className="absolute inset-0 z-0"
                style={{
                  background: "linear-gradient(to top, rgba(0, 0, 0, 0.75) 0%, rgba(0, 0, 0, 0.25) 45%, transparent 75%)",
                }}
                aria-hidden="true"
              />

              {/* Text overlay on image */}
              <div className="absolute bottom-0 left-0 right-0 p-5 flex flex-col gap-1 text-left z-10">
                <div
                  className="type-data-sm"
                  style={{
                    color: "rgba(255, 255, 255, 0.7)",
                    fontWeight: "var(--weight-semibold)" as any,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                  }}
                >
                  Condimento
                </div>
                
                <Heading level="page" color="var(--overlay-text)" className="font-serif !text-white mt-0.5">
                  {toppingName}
                </Heading>

                <div className="mt-2 flex flex-wrap gap-2">
                  {activeChoice?.authenticity && (
                    <Badge tone="primary" size="sm" style={{ background: "rgba(255, 255, 255, 0.22)", color: "var(--overlay-text)" }}>
                      {authenticityLabel(activeChoice.authenticity, cms)}
                    </Badge>
                  )}
                  {topping.variant_name && (
                    <Badge tone="muted" size="sm" style={{ background: "rgba(255, 255, 255, 0.18)", color: "rgba(255, 255, 255, 0.9)" }}>
                      {topping.variant_name}
                    </Badge>
                  )}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Chevrons overlaid on the image */}
          {toppingChoices.length > 1 && (
            <>
              <IconButton
                type="button"
                onClick={(e) => { e.stopPropagation(); prevTopping(); }}
                size="md"
                variant="bare"
                className="absolute left-3 top-1/2 -translate-y-1/2 z-20 bg-black/40 text-white backdrop-blur-sm border border-white/10 hover:bg-black/60 active:scale-95 transition-all"
                aria-label={cms.cooking.toppingPrevAria}
              >
                <ChevronLeft size={20} />
              </IconButton>
              <IconButton
                type="button"
                onClick={(e) => { e.stopPropagation(); nextTopping(); }}
                size="md"
                variant="bare"
                className="absolute right-3 top-1/2 -translate-y-1/2 z-20 bg-black/40 text-white backdrop-blur-sm border border-white/10 hover:bg-black/60 active:scale-95 transition-all"
                aria-label={cms.cooking.toppingNextAria}
              >
                <ChevronRight size={20} />
              </IconButton>
            </>
          )}
        </div>

        {/* Thumbnails selector strip */}
        <div className="w-full">
          <CondimentChoiceStrip
            choices={toppingChoices}
            allChoices={allToppingChoices}
            activeConceptId={activeConceptId}
            onSelect={onSelectTopping}
            mode="ingredients"
          />
        </div>

        {/* Details section */}
        <div className="flex flex-col px-1">
          {toppingDescription && (
            <p
              className="type-body-lg text-left"
              style={{
                color: "var(--text-default)",
                lineHeight: "var(--leading-reading)",
                maxWidth: 720,
              }}
            >
              {toppingDescription}
            </p>
          )}

          <p
            className="mt-2 type-body text-left"
            style={{
              color: "var(--text-muted)",
              lineHeight: "var(--leading-normal)",
              maxWidth: 720,
            }}
          >
            {t(cms.cooking.toppingAmountsNote, {
              n: multiplier,
              unit: totalUnitName,
              perUnit: unitName,
            })}
          </p>
        </div>

        {/* Separator line */}
        <div
          style={{ borderTop: "1px solid var(--container-border-subtle)" }}
        />

        {(() => {
          const hasSections = topping.ingredients.some((ing) => ing.section !== undefined);
          if (hasSections) {
            const sectionOrder: IngredientSection[] = ["ripieno", "base", "crosta", "superficie"];
            const grouped: Record<IngredientSection, ToppingIngredient[]> = {
              ripieno: [],
              base: [],
              crosta: [],
              superficie: [],
            };
            topping.ingredients.forEach((ing) => {
              const sec = ing.section ?? "superficie";
              grouped[sec].push(ing);
            });

            return (
              <div className="flex flex-col gap-8">
                {sectionOrder.map((sec) => {
                  const list = grouped[sec];
                  if (list.length === 0) return null;
                  const headerText = getSectionHeader(sec, cms.locale.id);
                  return (
                    <div key={sec} className="flex flex-col gap-4">
                      <div className="flex items-center gap-3">
                        <span className="w-1 h-5 rounded-full" style={{ background: "var(--text-accent)" }} />
                        <Heading level="xl" className="!my-0 font-serif text-left" style={{ fontSize: "var(--font-size-xl)", fontWeight: "var(--weight-semibold)", color: "var(--text-default)" }}>
                          {headerText}
                        </Heading>
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2">
                        {list.map((ing, i) => {
                          const displayAmount = formatToppingAmountForLocale(ing.amount.value, ing.amount.unit, fmt);
                          const detailParts: string[] = [];
                          if (ing.notes) detailParts.push(ing.notes);
                          if (ing.optional) detailParts.push(ui.pantryOptional);
                          return (
                            <div
                              key={`${ing.name}-${i}`}
                              className="rounded-2xl p-4 sm:p-5 text-left"
                              style={{
                                background: "var(--container-bg-low)",
                                border: "1px solid var(--container-border-subtle)",
                              }}
                            >
                              <div className="flex items-start justify-between gap-4">
                                <span
                                  style={{
                                    color: ing.optional ? "var(--text-muted)" : "var(--text-default)",
                                    fontSize: "var(--font-size-xl)",
                                    fontStyle: ing.optional ? "italic" : "normal",
                                    lineHeight: "var(--leading-normal)",
                                  }}
                                >
                                  {ing.name}
                                </span>
                                <span
                                  className="type-numeric"
                                  style={{
                                    color: "var(--text-default)",
                                    fontSize: "var(--font-size-2xl)",
                                    fontWeight: "var(--weight-semibold)" as any,
                                    lineHeight: "var(--leading-tight)",
                                    flexShrink: 0,
                                  }}
                                >
                                  {displayAmount}
                                </span>
                              </div>
                              {detailParts.length > 0 && (
                                <div
                                  className="mt-3 type-numeric text-left"
                                  style={{
                                    color: "var(--text-muted)",
                                    fontSize: "var(--font-size-md)",
                                    lineHeight: "var(--leading-normal)",
                                  }}
                                >
                                  {detailParts.join(" · ")}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          } else {
            return (
              <div className="grid gap-3 sm:grid-cols-2">
                {topping.ingredients.map((ing, i) => {
                  const displayAmount = formatToppingAmountForLocale(ing.amount.value, ing.amount.unit, fmt);
                  const detailParts: string[] = [];
                  if (ing.notes) detailParts.push(ing.notes);
                  if (ing.optional) detailParts.push(ui.pantryOptional);
                  return (
                    <div
                      key={`${ing.name}-${i}`}
                      className="rounded-2xl p-4 sm:p-5 text-left"
                      style={{
                        background: "var(--container-bg-low)",
                        border: "1px solid var(--container-border-subtle)",
                      }}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <span
                          style={{
                            color: ing.optional ? "var(--text-muted)" : "var(--text-default)",
                            fontSize: "var(--font-size-xl)",
                            fontStyle: ing.optional ? "italic" : "normal",
                            lineHeight: "var(--leading-normal)",
                          }}
                        >
                          {ing.name}
                        </span>
                        <span
                          className="type-numeric"
                          style={{
                            color: "var(--text-default)",
                            fontSize: "var(--font-size-2xl)",
                            fontWeight: "var(--weight-semibold)" as any,
                            lineHeight: "var(--leading-tight)",
                            flexShrink: 0,
                          }}
                        >
                          {displayAmount}
                        </span>
                      </div>
                      {detailParts.length > 0 && (
                        <div
                          className="mt-3 type-numeric text-left"
                          style={{
                            color: "var(--text-muted)",
                            fontSize: "var(--font-size-md)",
                            lineHeight: "var(--leading-normal)",
                          }}
                        >
                          {detailParts.join(" · ")}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          }
        })()}

        {technicalNotes.length > 0 && (
          <div
            className="rounded-3xl overflow-hidden"
            style={{
              border: "1px solid var(--recipe-tip-border)",
              background: "var(--recipe-tip-beginner-bg)",
            }}
          >
            <div
              className="px-5 py-4 sm:px-6 type-data-field"
              style={{
                borderBottom: "1px solid var(--recipe-divider-subtle)",
                color: "var(--text-default)",
                fontWeight: "var(--weight-semibold)" as any,
              }}
            >
              {cms.cooking.toppingNotesTitle}
            </div>
            <div className="grid gap-0 md:grid-cols-2">
              {technicalNotes.map((note, i) => (
                <div
                  key={`${note.title}-${note.body}`}
                  className="flex items-start gap-3 p-5 sm:p-6"
                  style={{
                    borderTop: i > 0 ? "1px solid var(--recipe-divider-subtle)" : undefined,
                    borderLeft: i % 2 === 1 ? "1px solid var(--recipe-divider-subtle)" : undefined,
                  }}
                >
                  <Lightbulb
                    size={17}
                    className="mt-0.5 flex-shrink-0"
                    style={{ color: "var(--recipe-tip-icon)" }}
                  />
                  <div className="min-w-0">
                    <div
                      className="type-data-field"
                      style={{
                        color: "var(--text-default)",
                        fontWeight: "var(--weight-semibold)" as any,
                        lineHeight: "var(--leading-normal)",
                      }}
                    >
                      {note.title}
                    </div>
                    <div
                      className="type-body"
                      style={{
                        color: "var(--text-muted)",
                        lineHeight: "var(--leading-normal)",
                        marginTop: 4,
                      }}
                    >
                      {note.body}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    );
  };

  return (
    <div className="flex flex-col gap-10 sm:gap-12">
      {/* Sticky header portal actions */}
      {portalTarget && createPortal(
        <>
          {/* Share button (Copia link) in the header */}
          {shareUrl && (
            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleCopyLink}
              className="flex h-11 items-center gap-2 rounded-full px-4 type-data active:scale-95 transition-transform"
              style={{
                background: linkCopied
                  ? "color-mix(in srgb, var(--cta) 15%, transparent)"
                  : "var(--container-bg)",
                border: `1px solid ${
                  linkCopied ? "var(--cta)" : "var(--container-border)"
                }`,
                color: linkCopied ? "var(--cta)" : "var(--text-muted)",
                fontWeight: "var(--weight-semibold)" as any,
                lineHeight: 1,
                cursor: "pointer",
              }}
              title={linkCopied ? cms.ui.copied : cms.ui.share}
              aria-label={cms.pages.recipeCopyLinkAria}
            >
              {linkCopied ? <Check size={14} /> : <LinkIcon size={14} />}
              <span>{linkCopied ? cms.ui.copied : cms.ui.share}</span>
            </motion.button>
          )}
        </>,
        portalTarget
      )}



      {/* ── Conferma: nuova pizzata sovrascrive quella in corso ── */}
      <AnimatePresence>
        {confirmReplace && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-end sm:items-center justify-center p-4"
            style={{ zIndex: 210, background: "color-mix(in srgb, var(--container-page) 70%, transparent)", backdropFilter: "blur(4px)" }}
            onClick={() => setConfirmReplace(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 24, scale: 0.96 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm flex flex-col items-center text-center gap-4 p-6"
              style={{
                borderRadius: 28,
                background: "var(--container-page)",
                border: "1px solid var(--container-border)",
                boxShadow: "0 24px 60px color-mix(in srgb, var(--shadow-color) 28%, transparent)",
              }}
              role="alertdialog"
              aria-modal="true"
              aria-label={cms.cooking.confirmNewAria}
            >
              <div
                className="flex items-center justify-center"
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 20,
                  background: "color-mix(in srgb, var(--primary) 12%, transparent)",
                  color: "var(--primary)",
                }}
              >
                <Flame size={26} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Heading level="xs" color="var(--text-default)">
                  {cms.cooking.replaceTitle}
                </Heading>
                <p className="type-body" style={{ color: "var(--text-muted)", lineHeight: 1.5 }}>
                  {t(cms.cooking.replaceBody, {
                    current: session?.styleName ?? "",
                    next: recipe.style.name,
                  })}
                </p>
              </div>
              <div className="flex flex-col w-full gap-2.5 mt-1">
                <CtaButton
                  onClick={confirmStartCooking}
                  className="w-full h-12 active:scale-[0.98]"
                  style={{ fontSize: "var(--font-size-lg)" }}
                >
                  <Flame size={16} />
                  {t(cms.cooking.replaceStart, { style: recipe.style.name })}
                </CtaButton>
                <button
                  onClick={() => { setConfirmReplace(false); openOverlay(); }}
                  className="w-full h-12 rounded-full type-data-field active:scale-[0.98] transition-transform"
                  style={{
                    background: "var(--container-bg)",
                    color: "var(--text-default)",
                    fontWeight: "var(--weight-semibold)" as any,
                    border: "1px solid var(--container-border)",
                    cursor: "pointer",
                  }}
                >
                  {t(cms.cooking.replaceResume, { style: session?.styleName ?? "" })}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Promemoria: la ricetta canonica non è ancora adattata ── */}
      <AnimatePresence>
        {confirmPersonalize && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-end sm:items-center justify-center p-4"
            style={{ zIndex: 210, background: "color-mix(in srgb, var(--container-page) 72%, transparent)", backdropFilter: "blur(6px)" }}
            onClick={() => setConfirmPersonalize(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 24, scale: 0.96 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md flex flex-col items-center text-center gap-4 p-6"
              style={{
                borderRadius: 28,
                background:
                  "linear-gradient(145deg, color-mix(in srgb, var(--container-page) 92%, transparent), color-mix(in srgb, var(--recipe-hero-badge-bg) 38%, var(--container-page)))",
                border: "1px solid color-mix(in srgb, var(--primary) 24%, var(--container-border))",
                boxShadow: "0 24px 70px color-mix(in srgb, var(--shadow-color) 26%, transparent), 0 0 48px color-mix(in srgb, var(--primary) 16%, transparent)",
              }}
              role="alertdialog"
              aria-modal="true"
              aria-label={cms.cooking.notPersonalizedAria}
            >
              <div
                className="flex items-center justify-center"
                style={{
                  width: 58,
                  height: 58,
                  borderRadius: 22,
                  background: "color-mix(in srgb, var(--primary) 13%, var(--container-page))",
                  color: "var(--primary)",
                }}
              >
                <Flame size={26} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Heading level="sm" color="var(--text-default)" style={{ lineHeight: 1.15 }}>
                  Prima di accendere il forno
                </Heading>
                <p className="type-body-lg" style={{ color: "var(--text-muted)", lineHeight: 1.5 }}>
                  Questa è ancora la ricetta originale. Puoi partire così, oppure adattarla al tuo forno e ai tuoi tempi prima di iniziare la pizzata.
                </p>
              </div>
              <div className="flex flex-col w-full gap-2.5 mt-1">
                {onRequestPersonalization && (
                  <button
                    onClick={handlePersonalizeBeforeCooking}
                    className="w-full h-12 rounded-full type-data-field active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
                    style={{
                      background: "var(--primary)",
                      color: "var(--text-on-accent)",
                      fontWeight: "var(--weight-semibold)" as any,
                      border: "1px solid var(--primary)",
                      cursor: "pointer",
                      boxShadow: "0 12px 28px color-mix(in srgb, var(--primary) 24%, transparent)",
                    }}
                  >
                    Adattala alla mia cucina
                  </button>
                )}
                <button
                  onClick={confirmStartCooking}
                  className="w-full h-12 rounded-full type-data-field active:scale-[0.98] transition-transform"
                  style={{
                    background: "var(--container-bg)",
                    color: "var(--text-default)",
                    fontWeight: "var(--weight-semibold)" as any,
                    border: "1px solid var(--container-border)",
                    cursor: "pointer",
                  }}
                >
                  Inizia comunque
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Contesto: questa ricetta è SU MISURA, non quella canonica ──
          (feedback giugno 2026: "non è chiaro che parametri e punteggio si
          riferiscono alla ricetta adattata alle tue possibilità") */}
      {!hideContextSummary && (
        <div
          className="flex flex-wrap items-center gap-x-2.5 gap-y-1 -mb-2 type-body"
          style={{ color: "var(--text-muted)" }}
        >
          <span
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full flex-shrink-0"
            style={{
              background: "var(--recipe-context-pill-bg)",
              color: "var(--text-accent)",
              fontWeight: "var(--weight-semibold)" as any,
            }}
          >
            {cms.cooking.recipeAdapted}
          </span>
          <span
            className="min-w-0"
            style={{ lineHeight: "var(--leading-normal)" }}
          >
            {t(cms.cooking.ovenSummary, { temp: fmt.celsius(constraints.oven_max_temp_c) })} · {recipe.dough_balls}{" "}
            {getServingUnitLabel(cms, servingUnit, recipe.dough_balls, true)}
            {" · "}
            {t(cms.cooking.readyAt, {
              eta: `${hasFlexiblePhases ? "~" : ""}${endTime.toLocaleTimeString(bcp47, { hour: "2-digit", minute: "2-digit" })}`,
            })}
          </span>
        </div>
      )}

      {/* ═══ PAGER ORIZZONTALE (feedback giugno 2026) ═══
          Meno info per schermata, navigazione da app: Ricetta | Procedimento.
          Il layer PizzaNerd trasforma i contenuti inline, senza tab separata. */}
      {!hidePager && (
      <div
        className="sticky z-30 -mx-1 px-1 flex items-center gap-2.5 w-full"
        style={{ top: "calc(64px + 12px)" }}
      >
        {/* Button group espressivo: a tutta larghezza, segmento attivo con
            forma piena che "scivola" a molla tra le posizioni. */}
        <div
          className="flex items-stretch flex-1 p-1 rounded-full"
          style={{
            background: "color-mix(in srgb, var(--container-bg) 82%, transparent)",
            backdropFilter: "blur(24px) saturate(1.8)",
            WebkitBackdropFilter: "blur(24px) saturate(1.8)",
            border: "1px solid var(--container-border)",
            boxShadow: "var(--recipe-pager-shadow)",
          }}
          role="tablist"
          aria-label={cms.cooking.sectionsAria}
        >
          {pagerTabs.map((t) => {
            const active = activeTabView === t.id;
            const TabIcon = t.icon;
            return (
              <motion.button
                key={t.id}
                onClick={() => switchTab(t.id)}
                role="tab"
                aria-selected={active}
                whileTap={{ scale: 0.95 }}
                className="relative flex-1 flex items-center justify-center gap-1.5 rounded-full type-data-field"
                style={{
                  border: "none",
                  background: "transparent",
                  color: active ? "var(--text-on-accent)" : "var(--text-muted)",
                  fontWeight: "var(--weight-semibold)" as any,
                  cursor: "pointer",
                  zIndex: 1,
                  whiteSpace: "nowrap",
                  minHeight: 52,
                  padding: "0 12px",
                }}
              >
                {active && (
                  <motion.span
                    layoutId="recipe-pager-pill"
                    className="absolute inset-0 rounded-full"
                    style={{ background: "var(--recipe-pager-active-bg)", zIndex: -1 }}
                    transition={{ type: "spring", stiffness: 420, damping: 30 }}
                  />
                )}
                <TabIcon size={15} />
                {t.label}
              </motion.button>
            );
          })}
        </div>
        {shareUrl && (
          <IconButton
            as={motion.button}
            type="button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleCopyLink}
            size="lg"
            variant="ghost"
            className="active:scale-95 transition-transform"
            style={{
              background: linkCopied
                ? "var(--recipe-header-action-bg-active)"
                : "color-mix(in srgb, var(--container-bg) 82%, transparent)",
              border: `1px solid ${
                linkCopied
                  ? "var(--recipe-header-action-border-active)"
                  : "var(--container-border)"
              }`,
              backdropFilter: "blur(24px) saturate(1.8)",
              WebkitBackdropFilter: "blur(24px) saturate(1.8)",
              color: linkCopied
                ? "var(--recipe-header-action-text-active)"
                : "var(--text-muted)",
              boxShadow: "var(--recipe-pager-shadow)",
            }}
            title={linkCopied ? cms.ui.copied : cms.ui.share}
            aria-label={cms.pages.recipeCopyLinkAria}
          >
            {linkCopied ? <Check size={16} /> : <Share2 size={15} />}
          </IconButton>
        )}
      </div>
      )}

      <AnimatePresence initial={false} custom={{ direction: pagerDir, reduceMotion }} mode="wait">
      {activeTabView === "ricetta" && (
      <motion.div
        key="panel-ricetta"
        custom={{ direction: pagerDir, reduceMotion }}
        variants={panelVariants}
        initial="enter"
        animate="center"
        exit="exit"
        transition={{ type: "spring", stiffness: 420, damping: 34 }}
        drag={forcedTab ? false : "x"}
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.12}
        onDragEnd={onPanelDragEnd}
        style={{ touchAction: "pan-y" }}
        className="flex flex-col gap-14 sm:gap-16"
      >
      <ScrollToTopOnMount />
      {matchSlot}
      {recipeControls}
      {/* ── Ingredients + panetti stepper ── */}
      <div>
        <div className="flex items-center gap-3 sm:gap-4 mb-5">
          <h3
            className="font-serif flex-shrink-0"
            style={{
              fontSize: "clamp(1.85rem, 4.5vw, 2.45rem)",
              lineHeight: "var(--leading-heading)",
            }}
          >
            {ui.ingredients}
          </h3>
          {/* Visore di sezione — come "Perfetti per te" */}
          <div
            className="flex-1 h-px"
            style={{ background: "var(--container-divider)" }}
          />
          <button
            onClick={handleCopyIngredients}
            className="flex items-center gap-1.5 transition-colors px-3 py-1.5 rounded-full type-data-field active:scale-95"
            style={{
              color: "var(--text-muted)",
              fontWeight: "var(--weight-medium)" as any,
              background: "var(--recipe-bg)",
              border: "1px solid var(--recipe-border)",
            }}
          >
            {copiedIng ? (
              <Check
                size={14}
                style={{ color: "var(--recipe-success)" }}
              />
            ) : (
              <Copy size={14} />
            )}
            {copiedIng ? ui.copied : ui.copy}
          </button>
        </div>

        <div
          className="flex flex-wrap items-center gap-x-4 gap-y-3 mb-5 pb-4"
          style={{
            borderBottom: "1px solid var(--recipe-divider-subtle)",
          }}
        >
          <span
            className="type-data"
            style={{ color: "var(--text-muted)", fontWeight: "var(--weight-medium)" as any }}
          >
            {servingLabel}
          </span>
          <Stepper
            value={constraints.dough_balls}
            min={1}
            max={20}
            onChange={updateBalls}
            decrementLabel={ui.ariaReduceBalls}
            incrementLabel={ui.ariaAddBalls}
            buttonStyle={{
              background: "var(--recipe-bg)",
              border: "1px solid var(--recipe-border)",
            }}
            valueStyle={{
              fontSize: "var(--font-size-2-5xl)",
              fontWeight: "var(--weight-bold)" as any,
              color: "var(--recipe-highlight)",
            }}
          />
          <span
            className="type-body"
            style={{ color: "var(--text-muted)" }}
          >
            {t(ui.doughBallsFrom, { w: fmt.grams(recipe.ball_weight_g) })}
            {panSizeLabel ? ` · ${panSizeLabel}` : ""}
          </span>
          {/* Stima persone (range) accanto al counter */}
          {(() => {
            const [perMin, perMax] = getServingsRange(recipe.style);
            const totalMin = perMin * constraints.dough_balls;
            const totalMax = perMax * constraints.dough_balls;
            const peopleLabel = totalMin === totalMax
              ? t(engineMessage(
                  cms,
                  totalMin === 1 ? "serving.peopleOne" : "serving.peopleMany",
                  totalMin === 1 ? "≈ {n} persona" : "≈ {n} persone",
                ), { n: totalMin })
              : t(engineMessage(cms, "serving.peopleRange", "≈ {min}-{max} persone"), {
                  min: totalMin,
                  max: totalMax,
                });
            return (
              <span
                className="ml-auto px-2 py-0.5 rounded-md type-data"
                style={{
                  fontWeight: "var(--weight-medium)" as any,
                  color: "var(--text-muted)",
                  background: "var(--container-bg-low)",
                  border: "1px solid var(--container-border)",
                }}
                title={cms.cooking.ballEstimateTooltip}
              >
                {peopleLabel}
              </span>
            );
          })()}
        </div>

        <div className="flex flex-col">
          <IngRow
            name={ui.flour}
            detail={
              recipe.flour_blend && recipe.flour_blend.length > 0
                ? ui.flourMix
                : simple
                  ? `${flourStrengthLabel(recipe.flour_w, cms)} · W${recipe.flour_w}`
                  : `W${recipe.flour_w} · P/L ${recipe.flour_pl}`
            }
            amount={fmt.grams(recipe.flour_g)}
          />
          {recipe.flour_blend && recipe.flour_blend.length > 0 && (
            /* VPL-B2: breakdown del mix risolto. Ogni farina di frumento mostra la
             * propria W (supporta più frumenti, es. Bonci); le senza glutine no. */
            <div
              style={{
                paddingLeft: "var(--space-3)",
                marginTop: "calc(-1 * var(--space-1))",
                marginBottom: "var(--space-2)",
              }}
            >
              {recipe.flour_blend.map((c) => (
                <div
                  key={c.name}
                  className="flex items-baseline justify-between gap-4 py-1"
                >
                  <span className="type-body" style={{ color: "var(--text-muted)" }}>
                    ↳ {c.name}{" "}
                    <span className="type-numeric">
                      {c.pct}%{c.w ? ` · W${c.w}` : ""}
                    </span>
                  </span>
                  <span
                    className="type-numeric"
                    style={{ color: "var(--text-muted)", fontSize: "var(--font-size-md)" }}
                  >
                    {fmt.grams(c.grams)}
                  </span>
                </div>
              ))}
              {recipe.effective_gluten_w != null && (
                /* VPL-B2: forza glutinica efficace = W frumento diluita dalla
                 * quota senza glutine. Informativa, spiega perché il mix è più
                 * delicato di una farina di pari W. */
                <div
                  className="flex items-baseline justify-between gap-4 py-1"
                  style={{ marginTop: "var(--space-1)" }}
                >
                  <span className="type-body" style={{ color: "var(--text-muted)" }}>
                    {ui.flourEffectiveGluten}
                  </span>
                  <span
                    className="type-numeric"
                    style={{ color: "var(--text-muted)", fontSize: "var(--font-size-md)" }}
                  >
                    ≈ W{recipe.effective_gluten_w}
                  </span>
                </div>
              )}
            </div>
          )}
          <IngRow
            name={ui.water}
            detail={`${fmt.percent(recipe.hydration_pct)}${recipe.water_temp_c != null ? ` · ${fmt.celsius(recipe.water_temp_c)}` : ""}`}
            amount={fmt.grams(recipe.water_g)}
          />
          <IngRow name={ui.salt} amount={fmt.grams(recipe.salt_g)} />
          {recipe.yeast_g > 0 && (
            <IngRow
              name={cms.yeastLabels[recipe.yeast_type] || YEAST_LABELS[recipe.yeast_type] || recipe.yeast_type}
              detail={yeastPracticalHint(recipe.yeast_g, recipe.yeast_type, cms)}
              amount={fmt.grams(recipe.yeast_g)}
            />
          )}
          {recipe.fat_g > 0 && (
            <IngRow name={recipe.fat_label || ui.oilEvo} amount={fmt.grams(recipe.fat_g)} />
          )}
          {recipe.sugar_g > 0 && (
            <IngRow name={ui.sugar} amount={fmt.grams(recipe.sugar_g)} />
          )}
        </div>

        {/* ── Scorporo pre-fermento (audit roleplay giugno 2026) ──
            Una ricetta con biga/poolish senza dosi separate non è eseguibile:
            qui lo split canonico (biga 45% idro, poolish 1:1, mai sale dentro). */}
        {recipe.has_pre_ferment && (() => {
          const isPoolish = (recipe.pre_ferment_type ?? "").toLowerCase().includes("poolish");
          const prefFlour = Math.round(recipe.flour_g * (isPoolish ? 0.3 : 0.4));
          const prefWater = Math.round(prefFlour * (isPoolish ? 1.0 : 0.45));
          const name = isPoolish ? "Poolish" : "Biga";
          return (
            <div
              className="mt-5 rounded-2xl overflow-hidden"
              style={{ border: "1px solid var(--outline-variant)" }}
            >
              <div className="grid grid-cols-2">
                <div className="px-5 py-4" style={{ background: "var(--container-bg-low)" }}>
                  <div
                    className="type-data"
                    style={{
                      letterSpacing: "0.12em",
                      textTransform: "uppercase",
                      color: "var(--text-accent)",
                      fontWeight: "var(--weight-semibold)" as any,
                      marginBottom: 6,
                    }}
                  >
                    1 · {name} ({isPoolish ? `${(cms.ui.statHydration).toLowerCase()} ${fmt.percent(100)}` : `${(cms.ui.statHydration).toLowerCase()} ${fmt.percent(45)}`})
                  </div>
                  <div className="type-data" style={{ color: "var(--text-default)", lineHeight: 1.75, fontFeatureSettings: "'tnum'" }}>
                    {ui.flour}: <b>{fmt.grams(prefFlour)}</b>
                    <br />
                    {ui.water}: <b>{fmt.grams(prefWater)}</b>
                    <br />
                    {cms.yeastLabels[recipe.yeast_type] || YEAST_LABELS[recipe.yeast_type]}: <b>{fmt.grams(recipe.yeast_g)}</b> (tutto)
                  </div>
                </div>
                <div className="px-5 py-4" style={{ borderLeft: "1px solid var(--outline-variant)" }}>
                  <div
                    className="type-data"
                    style={{
                      letterSpacing: "0.12em",
                      textTransform: "uppercase",
                      color: "var(--text-muted)",
                      fontWeight: "var(--weight-semibold)" as any,
                      marginBottom: 6,
                    }}
                  >
                    2 · {cms.cooking.finalDoughStageTitle}
                  </div>
                  <div className="type-data" style={{ color: "var(--text-default)", lineHeight: 1.75, fontFeatureSettings: "'tnum'" }}>
                    {ui.flour}: <b>{fmt.grams(recipe.flour_g - prefFlour)}</b>
                    <br />
                    {ui.water}: <b>{fmt.grams(recipe.water_g - prefWater)}</b>
                    <br />
                    {ui.salt}: <b>{fmt.grams(recipe.salt_g)}</b>
                    {recipe.fat_g > 0 ? <> · {recipe.fat_label || ui.oilEvo}: <b>{fmt.grams(recipe.fat_g)}</b></> : null}
                  </div>
                </div>
              </div>
              <div
                className="px-5 py-3 type-body"
                style={{
                  color: "var(--text-muted)",
                  borderTop: "1px solid var(--outline-variant)",
                  lineHeight: 1.45,
                }}
              >
                Il sale va sempre e solo nell'impasto finale: nel pre-fermento frenerebbe i lieviti.
              </div>
            </div>
          );
        })()}
        <div
          className="mt-5 type-numeric"
          style={{
            color: "var(--text-muted)",
            fontSize: "var(--font-size-xl)",
          }}
        >
          {recipe.dough_balls} × {fmt.grams(recipe.ball_weight_g)} ={" "}
          {fmt.grams(recipe.total_dough_g)} {ui.totalDough}
        </div>

        {/* ── Regola 55 — una riga discreta, spiegazione al tocco ── */}
        {recipe.water_temp_c != null && (
          <div
            className="mt-5 flex items-start gap-3 px-1 py-1"
            title={rule55Description}
          >
            <span style={{ fontSize: "var(--font-size-xl)", flexShrink: 0, opacity: 0.8 }}>
              H2O
            </span>
            <div className="flex-1 min-w-0">
              <div
                className="flex items-start gap-1.5 type-body"
                style={{
                  color: "var(--text-muted)",
                  lineHeight: "var(--leading-normal)",
                }}
              >
                <span>
                  {recipe.water_temp_c < 5
                  ? t(cms.engineMessages["tip.waterTempCold"], { temp: fmt.celsius(recipe.water_temp_c) })
                  : t(cms.engineMessages["tip.waterTempNormal"], { temp: fmt.celsius(recipe.water_temp_c), ddt: fmt.celsius(recipe.science.desired_dough_temp_c) })}
                </span>
                <button
                  onClick={() => setShowRule55Tip((v) => !v)}
                  className="flex-shrink-0 mt-0.5 active:scale-90 transition-transform"
                  style={{ color: "var(--text-muted)", opacity: showRule55Tip ? 0.85 : 0.5 }}
                  aria-label={showRule55Tip ? cms.cooking.rule55AriaClose : cms.cooking.rule55AriaOpen}
                  aria-expanded={showRule55Tip}
                >
                  <HelpCircle size={13} />
                </button>
              </div>
              {showRule55Tip && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  className="overflow-hidden type-body"
                  style={{
                    color: "var(--text-muted)",
                    marginTop: 4,
                    lineHeight: "var(--leading-normal)",
                  }}
                >
                  {rule55Description}
                </motion.div>
              )}
              {recipe.science.friction_factor > 0 && (
                <div
                  className="type-data"
                  style={{
                    color: "var(--text-muted)",
                    marginTop: 2,
                  }}
                >
                  {t(cms.engineMessages["tip.frictionNote"], { friction: fmt.celsiusDelta(recipe.science.friction_factor) })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* La FlourSuggestionCard è stata spostata dentro il pannello Parametri (RecipeConfigurator) — è una scelta, non un risultato. */}

        {/* ── PizzaNerd parameters grid & Pre-ferment guide (redistributed inline in nerdMode) ── */}
        {isNerd && (
          <NerdAuraBlock className="mt-8">
            <div className="pt-6 border-t border-[var(--recipe-divider-subtle)] text-left">
              <h4 className="font-serif mb-4" style={{ color: "var(--text-default)", fontSize: "clamp(var(--font-size-3xl), 3vw, var(--font-size-5xl))" }}>
                {cms.ui.scienceTitle}
              </h4>
              <div
                className="grid grid-cols-2 sm:grid-cols-3 rounded-2xl overflow-hidden"
                style={{ border: "1px solid var(--recipe-tip-nerd-border)", background: "var(--recipe-tip-nerd-bg)" }}
              >
                {[
                  { l: `${cms.scienceLabels.yeastBaker} (baker's %)`, v: fmt.percent(recipe.science.yeast_baker_pct) },
                  { l: `${cms.scienceLabels.effectiveHours} @${fmt.celsius(18)}`, v: `${recipe.science.effective_hours_18c}h` },
                  { l: `${cms.scienceLabels.q10Factor} vs ${fmt.celsius(18)}`, v: `${recipe.science.q10_factor}×` },
                  { l: cms.scienceLabels.waterActivity, v: `${recipe.science.water_activity}` },
                  { l: cms.scienceLabels.glutenNetwork, v: `${recipe.science.gluten_network}/100` },
                  { l: cms.scienceLabels.proteolysis, v: `${recipe.science.proteolysis_index}/100` },
                  { l: cms.scienceLabels.desiredDoughTemp, v: fmt.celsius(recipe.science.desired_dough_temp_c) },
                  { l: cms.scienceLabels.frictionFactor, v: `+${fmt.celsiusDelta(recipe.science.friction_factor)}` },
                  { l: cms.scienceLabels.bakingEnergy, v: `${recipe.science.baking_energy_kj} kJ` },
                ].map((cell) => (
                  <div
                    key={cell.l}
                    className="px-5 py-4"
                    style={{ border: "0.5px solid var(--recipe-tip-nerd-border)" }}
                  >
                    <div
                      className="type-numeric"
                      style={{
                        fontSize: "var(--font-size-2xl)",
                        fontWeight: "var(--weight-bold)" as any,
                        color: "var(--score-accent)",
                        fontFeatureSettings: "'tnum'",
                      }}
                    >
                      {cell.v}
                    </div>
                    <div style={{ fontSize: "var(--font-size-sm)", color: "var(--text-muted)", marginTop: "var(--space-1)", lineHeight: "var(--leading-normal)" }}>
                      {cell.l}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </NerdAuraBlock>
        )}

        {isNerd && recipe.has_pre_ferment && (
          <NerdAuraBlock className="mt-6 mb-2" compact>
            <PreFermentCard preFermentType={recipe.pre_ferment_type} />
          </NerdAuraBlock>
        )}
      </div>

      </motion.div>
      )}

      {activeTabView === "procedimento" && (
      <motion.div
        key="panel-procedimento"
        custom={{ direction: pagerDir, reduceMotion }}
        variants={panelVariants}
        initial="enter"
        animate="center"
        exit="exit"
        transition={{ type: "spring", stiffness: 420, damping: 34 }}
        drag={forcedTab ? false : "x"}
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.12}
        onDragEnd={onPanelDragEnd}
        style={{ touchAction: "pan-y" }}
        className="flex flex-col gap-2"
      >
      <ScrollToTopOnMount />
      <div className="mb-4 sm:mb-6">
        {procedureHeroControls}
      </div>

      {/* ── Procedure / Timeline with inline tips ── */}
      <div>
        {/* ── Compensations banner (PizzaNerd inline) ── */}
        {isNerd && compensations.length > 0 && (
          <NerdAuraBlock className="mb-6">
            <div
              className="rounded-2xl overflow-hidden text-left animate-in fade-in duration-200"
              style={{
                background: "var(--recipe-tip-nerd-bg)",
                border: "1px solid var(--recipe-tip-nerd-border)",
                borderLeft: "3px solid var(--score-accent)",
              }}
            >
          <div className="px-4 py-3 flex items-center gap-2.5"
                style={{ borderBottom: "1px solid var(--recipe-tip-nerd-border)" }}
              >
                <FlaskConical
                  size={14}
                  style={{ color: "var(--score-accent)", flexShrink: 0 }}
                />
                <span
                  className="type-data-field"
                  style={{
                    fontWeight: "var(--weight-semibold)" as any,
                    color: "var(--score-accent)",
                  }}
                >
                  {cms.misc.techAdjustmentsApplied}
                </span>
                <span
                  className="px-2 py-0.5 rounded-md type-code"
                  style={{
                    fontWeight: "var(--weight-bold)" as any,
                    letterSpacing: "var(--tracking-caps)",
                    textTransform: "uppercase",
                    color: "var(--score-accent)",
                    background: "var(--stat-nerd-pill-bg)",
                  }}
                >
                  Nerd
                </span>
                <span
                  className="type-numeric"
                  style={{
                    fontSize: "var(--font-size-md)",
                    color: "var(--text-muted)",
                    marginLeft: "auto",
                  }}
                >
                  {compensations.length}
                </span>
              </div>
              <div className="px-4 py-2.5 flex flex-col gap-2">
                {compensations.map((c, i) => (
                  <div
                    key={`${c.type}-${i}`}
                    className="flex items-baseline justify-between gap-3 type-body"
                  >
                    <span style={{ color: "var(--text-default)" }}>
                      {c.reason}
                    </span>
                    <span
                      className="type-numeric flex-shrink-0"
                      style={{
                        color: "var(--score-accent)",
                        fontWeight: "var(--weight-semibold)" as any,
                      }}
                    >
                      {c.original !== c.compensated
                        ? `${formatCompVal(c.type, c.original)} → ${formatCompVal(c.type, c.compensated)}`
                        : formatCompVal(c.type, c.compensated)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </NerdAuraBlock>
        )}

        {/* Steps with inline tips */}
        <div className="relative">
          <div
            className="absolute left-[20px] top-5 bottom-5 w-px"
            style={{ background: "var(--recipe-divider)" }}
          />
          <div className="flex flex-col gap-0">
            {recipe.timeline.map((step, i) => {
              const isFirst = i === 0;
              const isLast = i === recipe.timeline.length - 1;
              const times = stepTimes[i];
              const localizedStep = localizeStep(step, recipe, cms, fmt);
              const tipText = localizedStep.tip
                ? isNerd
                  ? localizedStep.tip.nerd
                  : localizedStep.tip.beginner
                : null;
              const parametricTip = getParametricTip(step.id, recipe.style.id, isNerd, cms.parametricTips);
              return (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    delay: i * 0.06,
                    type: "spring",
                    stiffness: 400,
                    damping: 25,
                  }}
                  className="flex gap-5 pb-9 last:pb-0"
                >
                  {/* Node */}
                  <div
                    className="relative z-10 w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{
                      background: isFirst
                        ? "var(--recipe-node-first-bg)"
                        : isLast
                          ? "var(--recipe-node-last-bg)"
                          : "var(--recipe-node-mid-bg)",
                      color:
                        isFirst || isLast
                          ? "var(--text-on-accent)"
                          : "var(--recipe-node-accent)",
                      border:
                        isFirst || isLast
                          ? "none"
                          : "2px solid var(--recipe-border)",
                    }}
                  >
                    <StepIllustration
                      stepId={step.id}
                      size={34}
                      tone={isFirst || isLast ? "onAccent" : "accent"}
                      style={{ opacity: 1 }}
                    />
                  </div>
                  {/* Content */}
                  <div className="flex-1 min-w-0 pt-0.5">
                    {/* Orario inizio (prima del nome step, ben evidente) */}
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className="px-2 py-0.5 rounded-md type-numeric"
                        style={{
                          fontSize: "var(--font-size-md)",
                          fontWeight: "var(--weight-bold)" as any,
                          background:
                            isFirst || isLast
                              ? "var(--recipe-badge-accent-bg)"
                              : "var(--recipe-bg)",
                          color:
                            isFirst || isLast
                              ? "var(--recipe-badge-accent-text)"
                              : "var(--text-default)",
                          letterSpacing: "0.02em",
                        }}
                      >
                        {times
                          ? displayStepTime(step.id, times.start, startTime, bcp47, cms.cooking)
                          : step.timing_label}
                      </span>
                    </div>
                    <span
                      style={{
                        color: "var(--text-default)",
                        fontSize: "var(--font-size-3xl)",
                        fontWeight: "var(--weight-semibold)" as any,
                      }}
                    >
                      {isToppingTimelineStep(step.id) ? cms.cooking.toppingTitle : localizedStep.title}
                    </span>
                    {isToppingTimelineStep(step.id) ? (
                      <>
                        {renderToppingSection("timeline")}
                        <p
                          className="mt-3"
                          style={{
                            color: "var(--text-muted)",
                            fontSize: "var(--font-size-2xl)",
                            lineHeight: "var(--leading-reading)",
                          }}
                        >
                          {localizedStep.description}
                        </p>
                      </>
                    ) : (
                      <p
                        className="mt-1"
                        style={{
                          color: "var(--text-muted)",
                          fontSize: "var(--font-size-2xl)",
                          lineHeight: "var(--leading-reading)",
                        }}
                      >
                        {localizedStep.description}
                      </p>
                    )}
                    {step.duration_minutes > 0 && (
                      <span
                        className="inline-block mt-1.5 type-numeric"
                        style={{
                          color: "var(--text-muted)",
                          fontSize: "var(--font-size-lg)",
                        }}
                      >
                        {t(cms.cooking.durationLabel, { duration: fmtDuration(effDuration(i), fmt) })}
                        {(stretch[i] ?? 0) !== 0 && (
                          <span
                            className="ml-1.5 px-1.5 py-0.5 rounded type-data-sm"
                            style={{
                              fontWeight: "var(--weight-semibold)" as any,
                              background: "var(--recipe-comfort-chip-bg)",
                              color: "var(--recipe-success)",
                            }}
                          >
                            {stretch[i]! > 0 ? "+" : "−"}
                            {t(cms.cooking.comfortLabel, {
                              duration: fmtDuration(Math.abs(stretch[i]!), fmt),
                            })}
                          </span>
                        )}
                      </span>
                    )}
                    {/* Audit UI giugno 2026 — "come si fa" e consigli vivono
                        dietro un toggle: la timeline si SCANSIONA, il dettaglio
                        arriva al tocco (e per intero nella Pizzata). */}
                    <StepDetails
                      longDesc={localizedStep.longDesc}
                      tips={[tipText, parametricTip].filter(Boolean) as string[]}
                      isNerd={isNerd}
                      stepId={step.id}
                      cms={cms}
                    />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      </motion.div>
      )}

      {activeTabView === "condimento" && (
      <motion.div
        key="panel-condimento"
        custom={{ direction: pagerDir, reduceMotion }}
        variants={panelVariants}
        initial="enter"
        animate="center"
        exit="exit"
        transition={{ type: "spring", stiffness: 420, damping: 34 }}
        drag={forcedTab ? false : "x"}
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.12}
        onDragEnd={onPanelDragEnd}
        style={{ touchAction: "pan-y" }}
        className="flex flex-col gap-8"
      >
      <ScrollToTopOnMount />
      {renderToppingSection("ingredients")}
      </motion.div>
      )}

      </AnimatePresence>

      {/* ── Feedback form ── */}
      {showFeedback && (
        <div className="mt-6">
          <RecipeFeedbackForm recipe={recipe} skillLevel={constraints.skill_level} />
        </div>
      )}

    </div>
  );
}

/* ═══ Learning contestuale: ogni fase porta al suo termine nel glossario ═══
   (feedback giugno 2026 — il "come si impara" richiamabile dalla ricetta) */
const STEP_GLOSSARY: Record<string, { hash: string }> = {
  preferment: { hash: "biga" },
  bulk: { hash: "bulk_fermentation" },
  proof: { hash: "ball_fermentation" },
  bake: { hash: "maillard" },
  mix: { hash: "hydration" },
};

/* ═══ Dettaglio step collassabile — "come si fa" + consigli al tocco ═══ */
function StepDetails({
  longDesc,
  tips,
  isNerd,
  stepId,
  cms,
}: {
  longDesc?: string;
  tips: string[];
  isNerd: boolean;
  stepId?: string;
  cms: CmsContent;
}) {
  const [open, setOpen] = useState(false);
  const [glossaryOpen, setGlossaryOpen] = useState(false);

  const glossaryLabel = useMemo(() => {
    if (!stepId) return "";
    switch (stepId) {
      case "preferment": return cms.cooking.glossaryPreferment;
      case "bulk": return cms.cooking.glossaryBulk;
      case "proof": return cms.cooking.glossaryProof;
      case "bake": return cms.cooking.glossaryBake;
      case "mix": return cms.cooking.glossaryMix;
      default: return "";
    }
  }, [stepId, cms.cooking]);

  if (!longDesc && tips.length === 0) return null;
  return (
    <div className="mt-4">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 type-data active:scale-95 transition-transform"
        style={{
          background: "transparent",
          border: "none",
          padding: 0,
          color: "var(--text-accent)",
          fontWeight: "var(--weight-semibold)" as any,
          cursor: "pointer",
        }}
        aria-expanded={open}
      >
        <motion.span
          animate={{ rotate: open ? 90 : 0 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          style={{ display: "inline-flex" }}
        >
          <ChevronRight size={16} />
        </motion.span>
        {open ? cms.cooking.stepDetailsHide : cms.cooking.stepDetailsShow}
        {!open && tips.length > 0 && (
          <span
            style={{
              color: "var(--text-muted)",
              fontWeight: "var(--weight-regular)" as any,
            }}
          >
            · {t(tips.length === 1 ? cms.cooking.tipsCountOne : cms.cooking.tipsCountMany, { n: tips.length })}
          </span>
        )}
      </button>
      {open && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          transition={{ type: "spring", stiffness: 420, damping: 32 }}
          className="overflow-hidden"
        >
          {longDesc && (
            <p
              className="mt-3 type-body-lg"
              style={{
                color: "var(--text-default)",
                lineHeight: "var(--leading-relaxed)",
                opacity: 0.88,
              }}
            >
              {longDesc}
            </p>
          )}
          {tips.map((tip, k) => (
            <div
              key={k}
              className="flex items-start gap-3 mt-3 px-4 py-3 rounded-2xl"
              style={{
                background: isNerd
                  ? "var(--recipe-tip-nerd-bg)"
                  : "var(--recipe-tip-beginner-bg)",
                border: `1px solid ${isNerd ? "var(--recipe-tip-nerd-border)" : "var(--recipe-tip-border)"}`,
              }}
            >
              {isNerd ? (
                <FlaskConical
                  size={14}
                  className="flex-shrink-0 mt-0.5"
                  style={{ color: "var(--recipe-tip-nerd-icon)", opacity: 0.7 }}
                />
              ) : (
                <Lightbulb
                  size={14}
                  className="flex-shrink-0 mt-0.5"
                  style={{ color: "var(--recipe-tip-icon)", opacity: 0.7 }}
                />
              )}
              <span
                className={isNerd ? "type-data" : ""}
                style={{
                  fontSize: isNerd ? "var(--font-size-lg)" : "var(--font-size-xl)",
                  lineHeight: "var(--leading-relaxed)",
                  color: "var(--text-subtle)",
                }}
              >
                {tip}
              </span>
            </div>
          ))}
          {stepId && STEP_GLOSSARY[stepId] && (
            <>
            <button
              type="button"
              onClick={() => setGlossaryOpen((value) => !value)}
              className="inline-flex items-center gap-1.5 mt-3 type-data"
              style={{
                background: "transparent",
                border: "none",
                padding: 0,
                color: "var(--text-accent)",
                textDecoration: "underline",
                textUnderlineOffset: 3,
                minHeight: 36,
                cursor: "pointer",
              }}
              aria-expanded={glossaryOpen}
            >
              {t(cms.cooking.learnInlineTitle, { label: glossaryLabel })}
            </button>
            {glossaryOpen && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-2 rounded-2xl px-4 py-3 type-body"
                style={{
                  background: "var(--container-bg-low)",
                  border: "1px solid var(--container-border-subtle)",
                  color: "var(--text-muted)",
                  lineHeight: "var(--leading-normal)",
                }}
              >
                {t(cms.cooking.learnInlineBody, { label: glossaryLabel })}
              </motion.div>
            )}
            </>
          )}
        </motion.div>
      )}
    </div>
  );
}

function IngRow({
  name,
  detail,
  amount,
}: {
  name: string;
  detail?: string;
  amount: string;
}) {
  return (
    <div
      className="flex items-baseline justify-between gap-4 py-3.5"
      style={{ borderBottom: "1px solid var(--recipe-divider-subtle)" }}
    >
      <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1 min-w-0">
        <span
          style={{
            color: "var(--text-default)",
            fontSize: "var(--font-size-xl-5)",
            lineHeight: "var(--leading-normal)",
          }}
        >
          {name}
        </span>
        {detail && (
          <span
            className="type-numeric"
            style={{
              color: "var(--text-muted)",
              fontSize: "var(--font-size-md)",
              lineHeight: "var(--leading-normal)",
            }}
          >
            {detail}
          </span>
        )}
      </div>
      <span
        className="type-numeric"
        style={{
          color: "var(--text-default)",
          fontSize: "var(--font-size-2xl)",
          fontWeight: "var(--weight-semibold)" as any,
          lineHeight: "var(--leading-tight)",
          flexShrink: 0,
        }}
      >
        {amount}
      </span>
    </div>
  );
}

function formatToppingAmountForLocale(
  value: number,
  unit: "g" | "ml" | "pcs",
  fmt: ReturnType<typeof createFormatter>,
) {
  const rounded = Math.round(value * 10) / 10;
  if (unit === "pcs") return fmt.pieces(rounded);
  if (unit === "ml") return fmt.milliliters(rounded);
  return fmt.grams(rounded);
}

function getServingUnitLabel(
  cms: CmsContent,
  unit: ReturnType<typeof getServingUnit>,
  count: number,
  lowercase = false,
) {
  const label =
    cms.cooking.servingUnits?.[unit]?.[count === 1 ? "singular" : "plural"] ??
    SERVING_UNIT_LABELS[unit][count === 1 ? "singular" : "plural"];
  return lowercase ? label.toLocaleLowerCase(cms.locale.id) : label;
}

function getSectionHeader(section: string, locale: string): string {
  const isIt = locale.toLowerCase().startsWith("it");
  const isDe = locale.toLowerCase().startsWith("de");
  const isJa = locale.toLowerCase().startsWith("ja");

  if (isIt) {
    switch (section) {
      case "ripieno": return "Ripieno Interno";
      case "base": return "Sulla Base";
      case "crosta": return "Bordo / Crosta";
      case "superficie": return "In Superficie";
      default: return "Ingredienti";
    }
  } else if (isDe) {
    switch (section) {
      case "ripieno": return "Füllung";
      case "base": return "Auf dem Boden";
      case "crosta": return "Rand / Kruste";
      case "superficie": return "Belag / Oberfläche";
      default: return "Zutaten";
    }
  } else if (isJa) {
    switch (section) {
      case "ripieno": return "中の具材（フィリング）";
      case "base": return "生地のベース";
      case "crosta": return "生地の端・耳";
      case "superficie": return "トッピング・表面";
      default: return "材料";
    }
  } else {
    // English default
    switch (section) {
      case "ripieno": return "Internal Filling";
      case "base": return "On the Base";
      case "crosta": return "Crust / Edge";
      case "superficie": return "On the Surface";
      default: return "Ingredients";
    }
  }
}

function formatIngredientsText(r: GeneratedRecipe, cms: CmsContent, bcp47: string) {
  const ui = cms.ui;
  const fmt = createFormatter(ui, bcp47);
  const yeastName = cms.yeastLabels[r.yeast_type] || YEAST_LABELS[r.yeast_type] || r.yeast_type;
  const title = t(ui.clipboardTitle, { style: r.style.name });
  const balls = t(ui.clipboardBalls, { n: r.dough_balls, w: fmt.grams(r.ball_weight_g) });
  const total = t(ui.clipboardTotal, { g: fmt.grams(r.total_dough_g) });
  const doughText = `${title}\n${balls}\n\n${ui.flour} W${r.flour_w} · P/L ${r.flour_pl}: ${fmt.grams(r.flour_g)}\n${ui.water}: ${fmt.grams(r.water_g)} (${fmt.percent(r.hydration_pct)})\n${ui.salt}: ${fmt.grams(r.salt_g)}${r.yeast_g > 0 ? `\n${yeastName}: ${fmt.grams(r.yeast_g)}` : ""}${r.fat_g > 0 ? `\n${r.fat_label || ui.oilEvo}: ${fmt.grams(r.fat_g)}` : ""}\n\n${total}`;

  const toppingRefId = r.style.default_topping_ref;
  if (!toppingRefId) return doughText;
  const topping = getToppingForStyle(toppingRefId, r.style);
  if (!topping?.ingredients?.length) return doughText;

  const concept = TOPPING_CONCEPTS[topping.concept_ref];
  const toppingTitle = topping.name ?? concept?.name ?? cms.cooking.toppingTitle;

  const hasSections = topping.ingredients.some((ing) => ing.section !== undefined);
  let toppingDetailsText = "";

  if (hasSections) {
    const sectionOrder: IngredientSection[] = ["ripieno", "base", "crosta", "superficie"];
    const grouped: Record<IngredientSection, ToppingIngredient[]> = {
      ripieno: [],
      base: [],
      crosta: [],
      superficie: [],
    };
    topping.ingredients.forEach((ing) => {
      const sec = ing.section ?? "superficie";
      grouped[sec].push(ing);
    });

    const sectionsText: string[] = [];
    sectionOrder.forEach((sec) => {
      const list = grouped[sec];
      if (list.length === 0) return;
      const header = getSectionHeader(sec, bcp47);
      const lines = list.map((ing) => {
        const singleAmount = formatToppingAmountForLocale(ing.amount.value, ing.amount.unit, fmt);
        const notes = [ing.notes, ing.optional ? ui.pantryOptional : null].filter(Boolean).join(" · ");
        return `- ${ing.name}: ${singleAmount}${notes ? ` — ${notes}` : ""}`;
      });
      sectionsText.push(`[${header}]\n${lines.join("\n")}`);
    });
    toppingDetailsText = sectionsText.join("\n\n");
  } else {
    const lines = topping.ingredients.map((ing) => {
      const singleAmount = formatToppingAmountForLocale(ing.amount.value, ing.amount.unit, fmt);
      const notes = [ing.notes, ing.optional ? ui.pantryOptional : null].filter(Boolean).join(" · ");
      return `${ing.name}: ${singleAmount}${notes ? ` — ${notes}` : ""}`;
    });
    toppingDetailsText = lines.join("\n");
  }

  return `${doughText}\n\n${cms.cooking.toppingTitle} — ${toppingTitle}\n${toppingDetailsText}\n\n${cms.cooking.toppingAmountsNote}`;
}
