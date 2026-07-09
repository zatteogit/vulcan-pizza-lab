import { Award,Check,ChefHat,Clock,Flame,Search,SlidersHorizontal,Sparkles,Triangle,Wheat,X } from "lucide-react";
import { AnimatePresence,motion } from "motion/react";
import { useMemo,useState } from "react";
import { useCms } from "../cms/cms-context";
import { createFormatter,formatTemperatureCopy,t } from "../cms/i18n";
import { FilterChip, Surface } from "../../components/ds/index";
import { getStyleTags } from "../../domain/deviation-tags";
import { ImageWithFallback } from "../../components/media/ImageWithFallback";
import {
PIZZA_FAMILIES,
PizzaStyle,
generateRecipe,
optimizeRecipe,
recommendStyles,
shortOrigin,
styleMatchesFamily,
StyleRecommendation,
UserConstraints,
type FamilyId,
} from "../../domain/pizza-engine";
import {
  getInterpretationsForStyle,
  type Interpretation,
} from "../../data/interpretation-library";
import { ScoreRing } from "./score-ring";
import { useStylesOverride } from "../../context/styles-override-context";
import { TiltCard } from "./tilt-card";

import { STYLE_PHOTOS } from "../../data/style-photos";
import { getVersions } from "../../data/style-versions";

interface RecommendedStylesProps {
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
  bestInterpretation: Interpretation | null;
};

function sortByVisibleMatch(items: RecommendationWithVariant[]): RecommendationWithVariant[] {
  return [...items].sort((a, b) => {
    const aScore = a.optimizedComposite ?? a.compatibilityScore;
    const bScore = b.optimizedComposite ?? b.compatibilityScore;
    return bScore - aScore;
  });
}

/** Nome breve della variante per la card ("AVPN", "Franco Pepe"). */
function variantShortName(it: Interpretation): string {
  const name =
    it.author ?? it.pizzeria ?? it.organization ?? it.signature_name ?? "";
  return name.split("—")[0].trim();
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
function normalizeQuery(s: string): string {
  return s.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

const TIER_META: Record<
  string,
  {
    label: string;
    subtitle: string;
    color: string;
    Icon: typeof Award;
  }
> = {
  perfect: {
    label: "Perfetti per te",
    subtitle: "ideali con il tuo forno e livello",
    color: "var(--text-success)",
    Icon: Award,
  },
  good: {
    label: "Fattibili",
    subtitle: "richiedono qualche compromesso",
    color: "var(--text-warning)",
    Icon: Sparkles,
  },
  challenging: {
    label: "Sfidanti",
    subtitle: "richiedono pi\u00f9 attrezzatura o esperienza",
    color: "var(--text-accent)",
    Icon: Triangle,
  },
  not_feasible: {
    label: "Non fattibili",
    subtitle: "mancano requisiti chiave",
    color: "var(--text-muted)",
    Icon: Triangle,
  },
};

export function RecommendedStyles({
  constraints,
  selectedStyle,
  onSelectStyle,
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
      ).map((rec): RecommendationWithVariant => {
        const baseComposite = optimizeRecipe(
          rec.style,
          constraints,
          undefined,
          undefined,
          scoreWeights,
        ).recipe.scores.composite;
        /* Round 7 (nota Matteo): il match considera anche TUTTE le varianti
           parametriche (firme/disciplinari) e propone la migliore. La
           variante si valuta com'È — è un canone d'autore, non si ottimizza —
           e il suo canone è il centro per l'autenticità (interpretationCenter,
           come su recipe.tsx). Base preferita a parità (+0.5). */
        let bestInterpretation: Interpretation | null = null;
        let bestComposite = baseComposite;
        for (const it of getInterpretationsForStyle(rec.style.id)) {
          const o = it.parameter_overrides;
          if (!o || Object.keys(o).length === 0) continue;
          const composite = generateRecipe(rec.style, constraints, {
            customHydration: o.hydration_pct,
            customFlourW: o.flour_w,
            customFlourPL: o.flour_pl,
            customFermentationHours: o.fermentation_hours,
            customFermentationTempC: o.fermentation_temp_c,
            usePreFerment: o.use_pre_ferment,
            scoreWeights,
            interpretationCenter: {
              hydration_pct: o.hydration_pct,
              flour_w: o.flour_w,
              flour_pl: o.flour_pl,
              fermentation_hours: o.fermentation_hours,
            },
          }).scores.composite;
          if (composite > bestComposite + 0.5) {
            bestComposite = composite;
            bestInterpretation = it;
          }
        }
        return {
          ...rec,
          optimizedComposite: bestComposite,
          bestInterpretation,
        };
      }),
    [constraints, effectiveStyles, isOverrideActive, cms.recommendationWeights, cms.scoreDimensions],
  );
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
          ].some((field) => normalizeQuery(field).includes(query)),
        );
      }
      return result;
    },
    [recommendations, familyFilter, hydrationFilter, textureFilter, skillFilter, ovenFilter, styleQuery],
  );

  const tiers: { key: string; items: RecommendationWithVariant[] }[] =
    [
      {
        key: "perfect",
        items: sortByVisibleMatch(filtered.filter((r) => r.tier === "perfect")),
      },
      {
        key: "good",
        items: sortByVisibleMatch(filtered.filter((r) => r.tier === "good")),
      },
      {
        key: "challenging",
        items: sortByVisibleMatch(filtered.filter((r) => r.tier === "challenging")),
      },
      {
        // Audit Sprint 12 — Sezione "Non fattibili": stili con incompatibilità
        // hard (forno legna assente, ecc.) o score molto basso. Mostrati per
        // trasparenza ("cosa non puoi fare e perché"), in stile muted.
        key: "not_feasible",
        items: sortByVisibleMatch(filtered.filter((r) => r.tier === "not_feasible")),
      },
    ].filter((t) => t.items.length > 0);

  let idx = 0;

  const handleSelect = (rec: RecommendationWithVariant) => {
    onSelectStyle(rec.style, rec.bestInterpretation);
  };

  const FAMILY_FILTERS: { id: FamilyId | "all"; label: string }[] = [
    { id: "all", label: "Tutti" },
    { id: "napoletana", label: cms.families.napoletana?.name ?? PIZZA_FAMILIES.napoletana.name },
    { id: "romana", label: cms.families.romana?.name ?? PIZZA_FAMILIES.romana.name },
    { id: "americana", label: cms.families.americana?.name ?? PIZZA_FAMILIES.americana.name },
    { id: "contemporanea", label: cms.families.contemporanea?.name ?? PIZZA_FAMILIES.contemporanea.name },
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
          placeholder={cms.filters.stylesSearchPlaceholder ?? "Cerca uno stile…"}
          aria-label={cms.filters.stylesSearchPlaceholder ?? "Cerca uno stile…"}
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
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="recommended-advanced-panel"
          >
            <div className="recommended-advanced-panel__body">
              {hasActiveAdvanced && (
                <div className="recommended-advanced-panel__actions">
                  <motion.button
                    type="button"
                    onClick={() => {
                      setHydrationFilter(null);
                      setTextureFilter(null);
                      setSkillFilter(null);
                      setOvenFilter(null);
                    }}
                    className="recommended-advanced-panel__clear"
                  >
                    {cms.filters.removeFilters}
                  </motion.button>
                </div>
              )}
              {/* Hydration */}
              <FacetRow
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

      {/* ═══ Tier groups ═══ */}
      {tiers.length === 0 && (
        <Surface
          as={motion.div}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          className="recommended-empty"
        >
          <p className="recommended-empty__text">
            {styleQuery.trim()
              ? t(cms.filters.stylesSearchNoResults ?? 'Nessuno stile per "{query}"', {
                  query: styleQuery.trim(),
                })
              : cms.misc.noStyleInFamily}
          </p>
          <motion.button
            onClick={() => {
              setFamilyFilter("all");
              setStyleQuery("");
            }}
            className="recommended-empty__reset"
          >
            {cms.misc.showAllStyles}
          </motion.button>
        </Surface>
      )}
      {tiers.map(({ key, items }) => {
        const meta = TIER_META[key];
        const cmsTier = cms.tiers[key];
        const tierLabel = cmsTier?.label ?? meta.label;
        const tierSubtitle = cmsTier?.subtitle ?? meta.subtitle;
        const TierIcon = meta.Icon;
        return (
          <motion.div
            key={key}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay:
                key === "perfect"
                  ? 0
                  : key === "good"
                    ? 0.1
                    : 0.2,
              type: "spring",
              stiffness: 400,
              damping: 30,
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

            {/* Audit Sprint 12 — Not feasible: nota in cima alla griglia che chiarisce
                perché questi stili non sono praticabili al momento. */}
            {key === "not_feasible" && items.length > 0 && (
              <p className="recommended-tier-note">
                {cms.misc.notFeasibleExplainer}
              </p>
            )}
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
  const { style, compatibilityScore, optimizedComposite } = rec;
  // Badge = punteggio della ricetta ottimizzata per i tuoi vincoli (ciò che
  // otterrai aprendo lo stile). Fallback alla compatibilità se non calcolato.
  const displayScore = optimizedComposite ?? compatibilityScore;
  /* VPL-C3 (rev): badge "difficoltà · impegno" — info che DIFFERENZIA le tile
   * (a parità di momento il match è uguale per tutte). La motivazione di match
   * completa vive nel pannello di dettaglio. */
  const skillKey = getStyleTags(style.id)?.skill_required ??
    (style.suitable_for_beginner ? "beginner" : "intermediate");
  const difficultyLabel =
    skillKey === "beginner"
      ? cms.filters.skillBeginner
      : skillKey === "intermediate"
        ? cms.filters.skillIntermediate
        : skillKey === "advanced"
          ? cms.filters.skillAdvanced
          : cms.filters.skillExpert;
  const [fMin, fMax] = style.dough.fermentation_hours_range;
  const timeLabel =
    fMax <= 8 ? cms.filters.timeFast : `${Math.round(fMin)}–${Math.round(fMax)}h`;
  const cmsPhoto = cms.media.stylePhotos[style.id];
  const photo = cmsPhoto || STYLE_PHOTOS[style.id] || cms.media.fallbackPhoto || FALLBACK;
  const springT = {
    type: "spring" as const,
    stiffness: 400,
    damping: 28,
  };

  /* Resolve tier color to a CSS variable for the ring SVG — auto dark mode */
  const ringColor = tierColor;

  return (
    <div
      data-region="card"
      className={`recommended-card${isSelected ? " recommended-card--selected" : ""}`}
    >
      <motion.button
        onClick={onSelect}
        initial={{ opacity: 0, y: 14 }}
        animate={{
          opacity: 1,
          y: 0,
          scale: isSelected ? 1 : hasSelection ? 0.98 : 1,
        }}
        transition={{
          ...springT,
          opacity: {
            delay: index * 0.04 + 0.05,
            type: "spring",
            stiffness: 400,
            damping: 28,
          },
          y: { delay: index * 0.04 + 0.05, type: "spring", stiffness: 400, damping: 28 },
        }}
        whileHover={{
          y: isSelected ? 0 : -4,
          transition: { type: "spring", stiffness: 500, damping: 30 },
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
              transition={{
                type: "spring",
                stiffness: 200,
                damping: 22,
              }}
            >
              <ImageWithFallback
                src={photo}
                alt={style.name}
                loading="lazy"
                className="recommended-card__img"
              />
            </motion.div>

            {/* Cinematic scrim — heavy bottom for text legibility */}
            <div className="recommended-card__scrim" />

            {/* ── Score ring badge — top right ── */}
            <div className="recommended-card__score">
              <ScoreRing
                score={displayScore}
                color={ringColor}
                size={38}
              />
            </div>

            {/* ── Selected check ── */}
            <AnimatePresence>
              {isSelected && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{
                    type: "spring",
                    stiffness: 500,
                    damping: 25,
                  }}
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
                {style.name}
              </span>

              {/* Subtitle — ALL CAPS, tracked, warm cream */}
              <div className="recommended-card__subtitle">
                {shortOrigin(style.origin).toUpperCase()}
                {rec.bestInterpretation
                  ? ` · ${variantShortName(rec.bestInterpretation).toUpperCase()}`
                  : ""}
              </div>

              {/* VPL-C3 (rev): badge "difficoltà · impegno" — differenzia le tile
                  (la motivazione di match completa è nel pannello di dettaglio). */}
              <div
                className="recommended-card__badge"
                style={{ ["--tone" as any]: tierColor }}
              >
                <ChefHat size={13} strokeWidth={2.5} className="recommended-card__badge-icon" aria-hidden="true" />
                <span data-region="meta">
                  {difficultyLabel} · {timeLabel}
                </span>
              </div>
            </div>
          </div>
        </motion.div>
        </TiltCard>
      </motion.button>
    </div>
  );
}

/* ═══ FACET ROW — Tag-based filter row ═══ */
function FacetRow({
  label,
  options,
  active,
  onToggle,
}: {
  label: string;
  options: { id: string; label: string }[];
  active: string | null;
  onToggle: (v: string) => void;
}) {
  return (
    <div className="recommended-facet">
      <span className="type-label recommended-facet__label">
        {label}
      </span>
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
