import { recipeDisplayName } from "../../domain/recipe-reference";
import { Award,CalendarClock,Check,ChefHat,Clock,CookingPot,Flame,Search,SlidersHorizontal,Sparkles,Triangle,Wheat,X } from "lucide-react";
import { AnimatePresence,motion,useAnimationControls,useReducedMotion } from "motion/react";
import { motionDelay,motionSpring,motionTiming } from "../../components/ds/motion";
import { useEffect,useMemo,useRef,useState,type ReactNode } from "react";
import { useCms, type CmsContent } from "../cms/cms-context";
import { createFormatter,formatTemperatureCopy,placeNameLocalizer,t } from "../cms/i18n";
import { EmptyState, FilterChip } from "../../components/ds/index";
import { getStyleTags } from "../../domain/deviation-tags";
import { ImageWithFallback } from "../../components/media/ImageWithFallback";
import { IMAGE_SIZES } from "../../components/media/responsive-images";
import {
PIZZA_FAMILIES,
PizzaStyle,
recommendStyles,
shortOrigin,
styleMatchesFamily,
StyleRecommendation,
UserConstraints,
type FamilyId,
type TimeSlot,
customMealSlot,
} from "../../domain/pizza-engine";
import { type Interpretation } from "../../data/interpretation-library";
import { CompatibilityPill, StyleMetaChip } from "./style-card-parts";
import { canonicalRecipe, tailoredRecipeEntry } from "./kitchen-compatibility";
import { useStylesOverride } from "../../context/styles-override-context";
import { TiltCard } from "./tilt-card";

import { STYLE_PHOTOS } from "../../data/style-photos";
import { getVersions } from "../../data/style-versions";
import { TOPPING_CONCEPTS, TOPPING_LIBRARY } from "../../data/topping-library";
import { uiMessage } from "../../i18n/ui-messages";
import { timeSlotText } from "./time-slot-text";
import { earliestFeasibleMeal, firstFeasibleSlot } from "../../domain/feasible-slot";
import { recommendationSections } from "../../domain/create-entry";
import { compareByCompatibility, kitchenMargin } from "../../domain/kitchen-margin";
import { pantryUnknown, presentationTier } from "../../use-cases/recommendation-groups";

interface RecommendedStylesProps {
  /** Momenti proponibili, dal più vicino: se in quello scelto nessuno stile
   *  è fattibile si propone il primo che ne ha (audit 28/10/2026, S05-A-01). */
  timeSlots?: TimeSlot[];
  onSelectTimeSlot?: (slot: TimeSlot) => void;
  /** FW-09: apre un pannello delle impostazioni (Dispensa quando non sappiamo
   *  cosa c'è, S05-A-06; «La tua cucina» quando il limite è il forno). */
  onOpenSettings?: (tab: "cucina" | "pantry") => void;
  constraints: UserConstraints;
  selectedStyle: PizzaStyle | null;
  /** La scelta porta con sé la variante migliore (round 7, nota Matteo):
   *  null = ricetta base dello stile. */
  onSelectStyle: (
    style: PizzaStyle,
    interpretation?: Interpretation | null,
  ) => void;
}

/** Raccomandazione + la variante (firma/disciplinare) che rende al meglio
 *  coi vincoli dell'utente. */
type RecommendationWithVariant = StyleRecommendation & {
  /** D-041: compatibilità con la tua cucina (su misura che si aprirà, 0–100). */
  kitchenNow: number;
  originalScore: number;
  /** D-062: margine di forno e tempo oltre il minimo dello stile (spareggio). */
  kitchenMargin: number;
};

/** Numero mostrato decrescente; a pari numero, più margine prima (D-062). */
function sortByVisibleMatch(items: RecommendationWithVariant[]): RecommendationWithVariant[] {
  return [...items].sort((a, b) =>
    compareByCompatibility({ score: a.kitchenNow, margin: a.kitchenMargin }, { score: b.kitchenNow, margin: b.kitchenMargin }));
}


export { STYLE_PHOTOS };
const FALLBACK =
  "https://images.unsplash.com/photo-1717883235373-ef10b2a745a3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600&q=80";

/* VPL-C3: dimensione del match da una reason key (rec.*). Serve a scegliere
 * l'icona sintetica sulla tile e a raggruppare/visualizzare i reasons nel
 * dettaglio. Esportata per riuso in style-detail-sheet. */
type MatchDimension = "time" | "oven" | "skill" | "equipment" | "pantry";
export function reasonDimension(key: string): MatchDimension {
  if (key.includes("time")) return "time";
  if (key.includes("oven") || key.includes("Wood") || key.includes("refractory"))
    return "oven";
  if (
    key.includes("skill") ||
    key.includes("hydration") ||
    key.includes("hands") ||
    key.includes("domestic") ||
    key.includes("Beginner")
  )
    return "skill";
  if (key.includes("flour") || key.includes("sourdough")) return "pantry";
  return "equipment"; // pan, mixer, fork, spiral, cast, steel, knead, needsPan
}
export const MATCH_DIMENSION_ICON: Record<MatchDimension, typeof Clock> = {
  time: Clock,
  oven: Flame,
  skill: ChefHat,
  equipment: SlidersHorizontal,
  pantry: Wheat,
};

/* Ricerca stili accent-insensitive: minuscole + rimozione diacritici. */
/** Nome del condimento di partenza (concetto, es. «Margherita»), anche
 *  quando lo stile punta a una variante («margherita_napoletana_avpn»). */
function defaultToppingName(ref: string | undefined): string {
  if (!ref) return "";
  const conceptId = TOPPING_CONCEPTS[ref] ? ref : TOPPING_LIBRARY[ref]?.concept_ref;
  return (conceptId && TOPPING_CONCEPTS[conceptId]?.name) || "";
}

function normalizeQuery(s: string): string {
  return s.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

/* Etichette e sottotitoli delle sezioni stanno nel CMS (cms.tiers). */
const TIER_META: Record<string, { color: string; Icon: typeof Award }> = {
  perfect: { color: "var(--text-success)", Icon: Award },
  good: { color: "var(--text-warning)", Icon: Sparkles },
  /* D-032 (Matteo, 24/10/2026): le fritte non usano il forno, quindi con una
     cucina di casa finivano in cima ai consigli. Stanno a parte. */
  fried: { color: "var(--text-accent)", Icon: CookingPot },
  not_feasible: { color: "var(--text-muted)", Icon: Triangle },
};

export function RecommendedStyles({
  constraints,
  selectedStyle,
  onSelectStyle,
  timeSlots,
  onSelectTimeSlot,
  onOpenSettings,
}: RecommendedStylesProps) {
  const { effectiveStyles, isOverrideActive } = useStylesOverride();
  const { cms, bcp47 } = useCms();
  const fmt = createFormatter(cms.ui, bcp47);
  const scoreWeights = {
    authenticity: cms.scoreDimensions?.authenticity?.weight,
    feasibility: cms.scoreDimensions?.feasibility?.weight,
    digestibility: cms.scoreDimensions?.digestibility?.weight,
    sustainability: cms.scoreDimensions?.sustainability?.weight,
    experimentation: cms.scoreDimensions?.experimentation?.weight,
  };
  const recommendations = useMemo(
    () =>
      // Audit role-play giugno 2026: il badge della card mostra il composite della
      // ricetta OTTIMIZZATA per i tuoi vincoli — coerente con ciò che ottieni
      // aprendo lo stile (~0.1ms/stile, costo trascurabile). Ranking/tier restano
      // sulla compatibilità.
      recommendStyles(
        constraints,
        isOverrideActive ? effectiveStyles : undefined,
        {
          time: cms.recommendationWeights.time,
          oven: cms.recommendationWeights.oven,
          skill: cms.recommendationWeights.skill,
          equipment: cms.recommendationWeights.equipment,
          pantry: cms.recommendationWeights.pantry,
        },
        (style, current) => tailoredRecipeEntry(style, current, scoreWeights).recipe,
      ).map((rec): RecommendationWithVariant => {
        /* D-041: lo stesso numero di Scopri, della scheda e della ricetta
           aperta (originale sulla tua cucina); il meglio raggiungibile
           (ottimizzata o versione d'autore) è il secondo valore. */
        const preview = rec.recipe;
        return {
          ...rec,
          kitchenNow: preview.scores.composite,
          originalScore: canonicalRecipe(rec.style, constraints, scoreWeights).scores.composite,
          optimizedComposite: preview.scores.composite,
          kitchenMargin: kitchenMargin(rec.style, constraints),
        };
      }),
    [constraints, effectiveStyles, isOverrideActive, cms.recommendationWeights, cms.scoreDimensions],
  );
  /* «Stasera» col forno di casa: nessuno stile ci sta nei tempi. Invece di 29
     card «non fattibili» senza uscita, si cerca il primo momento in cui almeno
     uno stile lo è (stesso motore e stesse ricette delle card). */
  const noneFeasible = constraints.available_hours > 0 && recommendations.every((rec) => rec.tier === "not_feasible");
  const rescueSlot = useMemo(
    () => noneFeasible && timeSlots
      ? firstFeasibleSlot(constraints, timeSlots, (candidate) => recommendStyles(
          candidate,
          isOverrideActive ? effectiveStyles : undefined,
          cms.recommendationWeights,
          (style, current) => tailoredRecipeEntry(style, current, scoreWeights).recipe,
        ))
      : null,
    [noneFeasible, timeSlots, constraints, effectiveStyles, isOverrideActive, cms.recommendationWeights, cms.scoreDimensions],
  );
  /* FW-09 (S05-A-01): l'ora esatta del primo pasto possibile, dalle stesse
     ricette delle card (non da soglie fisse), da proporre come orario scelto. */
  const earliestMeal = useMemo(
    () => noneFeasible && rescueSlot
      ? earliestFeasibleMeal(constraints, new Date(), (candidate) => recommendStyles(
          candidate,
          isOverrideActive ? effectiveStyles : undefined,
          cms.recommendationWeights,
          (style, current) => tailoredRecipeEntry(style, current, scoreWeights).recipe,
        ), constraints.available_hours)
      : null,
    [noneFeasible, rescueSlot, constraints, effectiveStyles, isOverrideActive, cms.recommendationWeights, cms.scoreDimensions],
  );
  const earliestSlot = earliestMeal ? customMealSlot(earliestMeal.at) : null;
  const unknownPantry = pantryUnknown(constraints);
  const [familyFilter, setFamilyFilter] = useState<FamilyId | "all">("all");
  const [styleQuery, setStyleQuery] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [hydrationFilter, setHydrationFilter] = useState<string | null>(null);
  const [textureFilter, setTextureFilter] = useState<string | null>(null);
  const [skillFilter, setSkillFilter] = useState<string | null>(null);
  const [ovenFilter, setOvenFilter] = useState<string | null>(null);
  const hasActiveAdvanced = !!(hydrationFilter || textureFilter || skillFilter || ovenFilter);
  const hasSelection = selectedStyle !== null;

  /* Family counts for filter badges — includono le famiglie secondarie,
   * coerenti col filtro non esclusivo. */
  const familyCounts = useMemo(() => {
    const counts: Record<string, number> = { all: recommendations.length };
    for (const r of recommendations) {
      for (const fam of [r.style.family, ...(r.style.families ?? [])]) {
        counts[fam] = (counts[fam] || 0) + 1;
      }
    }
    return counts;
  }, [recommendations]);

  /* Filtered recommendations */
  const filtered = useMemo(
    () => {
      let result = familyFilter === "all"
        ? recommendations
        : recommendations.filter((r) => styleMatchesFamily(r.style, familyFilter as FamilyId));

      /* Apply tag-based faceted filters */
      if (hydrationFilter || textureFilter || skillFilter || ovenFilter) {
        result = result.filter((r) => {
          const tags = getStyleTags(r.style.id);
          if (!tags) return true;
          if (hydrationFilter && tags.hydration_category !== hydrationFilter) return false;
          if (textureFilter && !tags.texture_profile.includes(textureFilter)) return false;
          if (skillFilter && tags.skill_required !== skillFilter) return false;
          if (ovenFilter && !tags.baking_method.includes(ovenFilter)) return false;
          return true;
        });
      }

      /* Ricerca testuale (audit lug 2026): nome, città d'origine, id e label
       * delle versioni (così "bonci" trova la Teglia col Metodo Bonci) —
       * accent-insensitive per trovare "napoletana" scrivendo "Napoletanà". */
      const query = normalizeQuery(styleQuery);
      if (query) {
        result = result.filter((r) =>
          [
            r.style.name,
            r.style.origin?.city ?? "",
            r.style.id.replace(/_/g, " "),
            ...getVersions(r.style.id).map((version) => version.label),
            // Audit n. 35: «margherita» è un condimento; trova gli stili che
            // la propongono come condimento di partenza.
            defaultToppingName(r.style.default_topping_ref),
          ].some((field) => normalizeQuery(field).includes(query)),
        );
      }
      return result;
    },
    [recommendations, familyFilter, hydrationFilter, textureFilter, skillFilter, ovenFilter, styleQuery],
  );

  /* D-032: le fritte in una sezione a parte (domain/create-entry.ts).
     FW-09 (S05-A-06): con la dispensa sconosciuta le sole verifiche di
     farina/lievito non tolgono lo stile da «Perfetti per te». */
  const tiers = recommendationSections(filtered, sortByVisibleMatch, (r) => presentationTier(r, constraints));

  let idx = 0;

  /* Feedback di ricalcolo (nota Matteo): quando cambi un vincolo, i risultati
   * qui sotto si aggiornano in place (card riconciliate per id) senza segnale
   * visivo. Un pulse gentile sul blocco risultati comunica "ho ricalcolato". */
  const reduceMotion = useReducedMotion();
  const resultsControls = useAnimationControls();
  const firstResultsRun = useRef(true);
  useEffect(() => {
    if (firstResultsRun.current) {
      firstResultsRun.current = false;
      return;
    }
    if (reduceMotion) return;
    resultsControls.start({
      opacity: [0.72, 1],
      y: [4, 0],
      transition: motionTiming.recommendation,
    });
  }, [recommendations, resultsControls, reduceMotion]);

  const handleSelect = (rec: RecommendationWithVariant) => {
    onSelectStyle(rec.style, null);
  };

  const FAMILY_FILTERS: { id: FamilyId | "all"; label: string }[] = [
    { id: "all", label: uiMessage("features.recipe.recommended-styles.148ba18e") },
    { id: "napoletana", label: cms.families.napoletana?.name ?? PIZZA_FAMILIES.napoletana.name },
    { id: "romana", label: cms.families.romana?.name ?? PIZZA_FAMILIES.romana.name },
    { id: "americana", label: cms.families.americana?.name ?? PIZZA_FAMILIES.americana.name },
    { id: "contemporanea", label: cms.families.contemporanea?.name ?? PIZZA_FAMILIES.contemporanea.name },
    { id: "regionale", label: cms.families.regionale?.name ?? PIZZA_FAMILIES.regionale.name },
    { id: "casa", label: cms.families.casa?.name ?? PIZZA_FAMILIES.casa.name },
  ];

  return (
    <div className="recommended-styles">
      {/* ═══ Ricerca + family chips (audit lug 2026: trovare uno stile per
          nome senza scansionare 28 card) ═══ */}
      <div className="recommended-styles__search-group">
      <div className="recommended-search">
        <Search size={15} className="recommended-search__icon" aria-hidden="true" />
        <input
          type="text"
          value={styleQuery}
          onChange={(e) => setStyleQuery(e.target.value)}
          placeholder={cms.filters.stylesSearchPlaceholder}
          aria-label={cms.filters.stylesSearchPlaceholder}
          className="recommended-search__input"
        />
        {styleQuery && (
          <button
            type="button"
            onClick={() => setStyleQuery("")}
            className="recommended-search__clear"
            aria-label={cms.filters.removeFilters}
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* ═══ Family filter chips + "Altro" inline ═══ */}
      <div className="recommended-family-filters">
          {FAMILY_FILTERS.map((f) => {
            const isActive = familyFilter === f.id;
            const count = familyCounts[f.id] || 0;
            return (
              <FilterChip
                key={f.id}
                active={isActive}
                onClick={() => setFamilyFilter(f.id)}
                radius="lg"
                count={count}
              >
                {f.label}
              </FilterChip>
            );
          })}

          {/* "Altro" chip — inline con le chip di famiglia */}
          <FilterChip
            active={showAdvanced || hasActiveAdvanced}
            onClick={() => setShowAdvanced(!showAdvanced)}
            radius="lg"
            count={hasActiveAdvanced ? [hydrationFilter, textureFilter, skillFilter, ovenFilter].filter(Boolean).length : undefined}
          >
            <SlidersHorizontal size={13} className="recommended-family-filters__icon" />
            {cms.filters.advancedLabel}
          </FilterChip>
      </div>
      </div>

      {/* ═══ Advanced faceted filters panel (collapsible) ═══ */}
      <AnimatePresence>
        {showAdvanced && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={motionSpring.standard}
            className="recommended-advanced-panel"
          >
            <div className="recommended-advanced-panel__body">
              {/* Hydration: reserve the reset action in the label row, so toggling
                  any facet never changes the panel's geometry. */}
              <FacetRow
                action={
                  <button
                    type="button"
                    onClick={() => {
                      setHydrationFilter(null);
                      setTextureFilter(null);
                      setSkillFilter(null);
                      setOvenFilter(null);
                    }}
                    className={`recommended-advanced-panel__clear${hasActiveAdvanced ? "" : " recommended-advanced-panel__clear--hidden"}`}
                  >
                    {cms.filters.removeFilters}
                  </button>
                }
                label={cms.filters.hydrationLabel}
                options={[
                  { id: "low", label: cms.filters.hydrationLow },
                  { id: "medium", label: cms.filters.hydrationMedium },
                  { id: "high", label: cms.filters.hydrationHigh },
                  { id: "extreme", label: cms.filters.hydrationExtreme },
                ]}
                active={hydrationFilter}
                onToggle={(v) => setHydrationFilter(hydrationFilter === v ? null : v)}
              />
              {/* Texture */}
              <FacetRow
                label={cms.filters.textureLabel}
                options={[
                  { id: "crispy_thin", label: cms.filters.textureCrispyThin },
                  { id: "thick_airy", label: cms.filters.textureThickAiry },
                  { id: "airy_crumb", label: cms.filters.textureAiryCrumb },
                  { id: "deep_dish", label: cms.filters.textureDeepDish },
                ]}
                active={textureFilter}
                onToggle={(v) => setTextureFilter(textureFilter === v ? null : v)}
              />
              {/* Skill */}
              <FacetRow
                label={cms.filters.skillLabel}
                options={[
                  { id: "beginner", label: cms.filters.skillBeginner },
                  { id: "intermediate", label: cms.filters.skillIntermediate },
                  { id: "advanced", label: cms.filters.skillAdvanced },
                  { id: "expert", label: cms.filters.skillExpert },
                ]}
                active={skillFilter}
                onToggle={(v) => setSkillFilter(skillFilter === v ? null : v)}
              />
              {/* Oven */}
              <FacetRow
                label={cms.filters.ovenLabel}
                options={[
                  { id: "home_oven_compatible", label: cms.filters.ovenHome },
                  { id: "wood_fired", label: cms.filters.ovenWood },
                  { id: "electric_high_temp", label: formatTemperatureCopy(cms.filters.ovenElectricHigh, fmt) },
                  { id: "pan_baked", label: cms.filters.ovenPan },
                ]}
                active={ovenFilter}
                onToggle={(v) => setOvenFilter(ovenFilter === v ? null : v)}
              />

            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* U-10 (F11): quanti stili restano col filtro, detto al lettore di
          schermo. La regione è sempre montata; parla solo se c'è un filtro. */}
      <p role="status" className="sr-only">
        {familyFilter !== "all" || hydrationFilter || textureFilter || skillFilter || ovenFilter || styleQuery.trim()
          ? t(cms.ui.stylesFoundStatus, { n: filtered.length })
          : ""}
      </p>

      {noneFeasible && (
        <EmptyState
          id="recommended-rescue"
          tone="warning"
          live
          icon={<CalendarClock size={16} aria-hidden="true" />}
          title={uiMessage("recipe.slots.noneFeasibleTitle")}
          reason={earliestSlot
            ? uiMessage("ui.slotEarliestReady", [timeSlotText(earliestSlot, cms, bcp47).label])
            : rescueSlot
              ? uiMessage("recipe.slots.noneFeasibleBody", [timeSlotText(rescueSlot, cms, bcp47).label])
              : uiMessage("recipe.slots.noneFeasibleNoSlot")}
          actions={onSelectTimeSlot
            ? [
                ...(earliestSlot ? [{ label: uiMessage("ui.slotMoveTo", [timeSlotText(earliestSlot, cms, bcp47).label]), onClick: () => onSelectTimeSlot(earliestSlot) }] : []),
                ...(rescueSlot ? [{ label: uiMessage("recipe.slots.chooseSlot", [timeSlotText(rescueSlot, cms, bcp47).label]), onClick: () => onSelectTimeSlot(rescueSlot) }] : []),
                ...(!rescueSlot && onOpenSettings ? [{ label: uiMessage("ui.kitchenOpen"), onClick: () => onOpenSettings("cucina") }] : []),
              ]
            : []}
        />
      )}

      {/* FW-09 (S05-A-06): senza dispensa le verifiche di farina e lievito
          valgono per tutti gli stili: si dicono una volta qui, non su ogni card. */}
      {unknownPantry && !noneFeasible && onOpenSettings && (
        <EmptyState
          id="recommended-pantry"
          headingLevel={3}
          icon={<Wheat size={16} aria-hidden="true" />}
          title={uiMessage("ui.pantryUnknownTitle")}
          reason={uiMessage("ui.pantryUnknownBanner")}
          actions={[{ label: uiMessage("ui.pantryUnknownAction"), onClick: () => onOpenSettings("pantry") }]}
          className="recommended-pantry"
        />
      )}

      {/* ═══ Tier groups ═══ */}
      <motion.div className="recommended-styles__results" animate={resultsControls}>
      {tiers.length === 0 && (
        <EmptyState
          headingLevel={3}
          live
          title={styleQuery.trim()
            ? t(cms.filters.stylesSearchNoResults, { query: styleQuery.trim() })
            : cms.misc.noStyleInFamily}
          reason={uiMessage("ui.stylesEmptyReason")}
          actions={[{
            label: cms.misc.showAllStyles,
            onClick: () => {
              setFamilyFilter("all");
              setStyleQuery("");
              setHydrationFilter(null);
              setTextureFilter(null);
              setSkillFilter(null);
              setOvenFilter(null);
            },
          }]}
        />
      )}
      {tiers.map(({ key, items }) => {
        const meta = TIER_META[key];
        const cmsTier = cms.tiers[key];
        const tierLabel = cmsTier?.label ?? "";
        const tierSubtitle = cmsTier?.subtitle ?? "";
        const TierIcon = meta.Icon;
        return (
          <motion.div
            key={key}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay:
                key === "perfect"
                  ? motionDelay.none
                  : key === "good"
                    ? motionDelay.medium
                    : motionDelay.profileSection,
              ...motionSpring.standard,
            }}
          >
            {/* Tier header */}
            <div className="recommended-tier-header">
              <div
                className="recommended-tier-header__icon"
                style={{ ["--tone" as any]: meta.color }}
              >
                <TierIcon size={14} />
              </div>
              <div className="recommended-tier-header__titles">
                <span className="recommended-tier-header__label">
                  {tierLabel}
                </span>
                {/* Densità mobile: etichetta+icona+conteggio bastano; la
                    spiegazione del tier entra da sm in su. */}
                <span className="recommended-tier-header__subtitle">
                  {tierSubtitle}
                </span>
              </div>
              <div className="recommended-tier-header__rule" />
              <span className="recommended-tier-header__count">
                {items.length}
              </span>
            </div>

            <div
              data-region="collection"
              className={`recommended-collection${key === "not_feasible" ? " recommended-collection--muted" : ""}`}
            >
              {items.map((rec) => {
                const i = idx++;
                return (
                  <StyleCard
                    key={rec.style.id}
                    rec={rec}
                    tierColor={meta.color}
                    isSelected={
                      selectedStyle?.id === rec.style.id
                    }
                    hasSelection={hasSelection}
                    onSelect={() => handleSelect(rec)}
                    index={i}
                  />
                );
              })}
            </div>
          </motion.div>
        );
      })}
      </motion.div>
    </div>
  );
}

/* ═══ STYLE CARD — Editorial magazine with ring badge ═══ */
function StyleCard({
  rec,
  tierColor,
  isSelected,
  hasSelection,
  onSelect,
  index,
}: {
  rec: RecommendationWithVariant;
  tierColor: string;
  isSelected: boolean;
  hasSelection: boolean;
  onSelect: () => void;
  index: number;
}) {
  const { cms } = useCms();
  const { style, kitchenNow } = rec;
  // Badge = punteggio della ricetta ottimizzata per i tuoi vincoli (ciò che
  // otterrai aprendo lo stile). Fallback alla compatibilità se non calcolato.
  const displayScore = kitchenNow;
  /* VPL-C3 (rev): badge "difficoltà · impegno" — info che DIFFERENZIA le tile
   * (a parità di momento il match è uguale per tutte). La motivazione di match
   * completa vive nel pannello di dettaglio. */
  const cmsPhoto = cms.media.stylePhotos[style.id];
  const photo = cmsPhoto || STYLE_PHOTOS[style.id] || cms.media.fallbackPhoto || FALLBACK;
  const springT = motionSpring.responsiveSoft;


  return (
    <div
      data-region="card"
      className={`recommended-card${isSelected ? " recommended-card--selected" : ""}`}
    >
      <motion.button
        onClick={onSelect}
        aria-haspopup="dialog"
        initial={{ opacity: 0, y: 14 }}
        animate={{
          opacity: 1,
          y: 0,
          scale: isSelected ? 1 : hasSelection ? 0.98 : 1,
        }}
        transition={{
          ...springT,
          opacity: {
            ...motionSpring.responsiveSoft,
            delay: index * motionDelay.micro + motionDelay.short,
          },
          y: { ...motionSpring.responsiveSoft,delay: index * motionDelay.micro + motionDelay.short },
        }}
        whileHover={{
          y: isSelected ? 0 : -4,
          transition: motionSpring.crispControl,
        }}
        className="recommended-card__button"
      >
        {/* Tilt 3D: la card si inclina verso il puntatore col riflesso caldo */}
        <TiltCard className="recommended-card__tilt">
        {/* Card shell with warm border */}
        <motion.div
          animate={{
            boxShadow: isSelected
              ? `0 0 0 2px ${tierColor}, var(--style-card-shadow-selected)`
              : "var(--style-card-shadow)",
          }}
          transition={springT}
          className="recommended-card__shell"
        >
          {/* ── Photo area ── */}
          <div className="recommended-card__photo">
            {/* Image with zoom on select */}
            <motion.div
              className="recommended-card__photo-zoom"
              animate={{ scale: isSelected ? 1.06 : 1 }}
              transition={motionSpring.photoZoom}
            >
              <ImageWithFallback
                src={photo}
                alt="" /* U-10 (F24): il nome è già nel titolo della card */
                loading="lazy"
                sizes={IMAGE_SIZES.card}
                className="recommended-card__img"
              />
            </motion.div>

            {/* ── Selected check ── */}
            <AnimatePresence>
              {isSelected && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={motionSpring.crisp}
                  className="recommended-card__check"
                  style={{ ["--tone" as any]: tierColor }}
                >
                  <Check
                    size={14}
                    color="var(--overlay-text)"
                    strokeWidth={3}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── Title + subtitle — large serif editorial ── */}
            <div className="recommended-card__info">
              {/* Title — Playfair Display, large and confident */}
              <span className="recommended-card__title">
                {recipeDisplayName(rec.recipe)}
              </span>

              {/* Subtitle — ALL CAPS, tracked, warm cream */}
              <div className="recommended-card__subtitle">
                {shortOrigin(style.origin, placeNameLocalizer(cms))}
              </div>

              {/* Livello e durata — stessa chip delle card di Scopri */}
              <StyleMetaChip style={style} cms={cms} recipe={rec.recipe} />
              {rec.dietary_alternatives?.length ? <span className="recommended-card__subtitle">{cms.engineMessages["diet.variantAvailable"]}</span> : null}
            </div>
          </div>
        </motion.div>
        </TiltCard>
      </motion.button>
      <div className="recommended-card__score">
        <CompatibilityPill now={displayScore} original={rec.originalScore} blocked={rec.recipe.verdict.outcome === "not_feasible"} recipe={rec.recipe} />
      </div>
    </div>
  );
}

/* ═══ FACET ROW — Tag-based filter row ═══ */
function FacetRow({
  label,
  action,
  options,
  active,
  onToggle,
}: {
  label: string;
  action?: ReactNode;
  options: { id: string; label: string }[];
  active: string | null;
  onToggle: (v: string) => void;
}) {
  return (
    <div className="recommended-facet">
      <div className="recommended-facet__heading">
        <span className="type-label recommended-facet__label">
          {label}
        </span>
        {action}
      </div>
      <div className="recommended-facet__options">
        {options.map((o) => {
          const isActive = active === o.id;
          return (
            <FilterChip
              key={o.id}
              active={isActive}
              onClick={() => onToggle(o.id)}
            >
              {o.label}
            </FilterChip>
          );
        })}
      </div>
    </div>
  );
}

/** Audit n. 11 (B-16): una sola difficoltà per stile, uguale su card e scheda. */
export function styleDifficultyLabel(style: PizzaStyle, cms: CmsContent): string {
  const skillKey = getStyleTags(style.id)?.skill_required ??
    (style.suitable_for_beginner ? "beginner" : "intermediate");
  return skillKey === "beginner"
    ? cms.filters.skillBeginner
    : skillKey === "intermediate"
      ? cms.filters.skillIntermediate
      : skillKey === "advanced"
        ? cms.filters.skillAdvanced
        : cms.filters.skillExpert;
}
