/* ═══ CONDIMENT CHOICE STRIP — selettore condimenti (estratto lug 2026) ═══ */

import { Search, Utensils, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import toppingPlaceholder from "../../../assets/toppings/_placeholder.svg";
import { useCms } from "../cms/cms-context";
import { IconButton, ModalSheet } from "../../components/ds/index";
import {
  TOPPING_CONCEPTS,
  getToppingThumbnail,
  type AuthenticityScore,
  type FlavorProfile,
  type ToppingRecipe,
} from "../../data/topping-library";
import { authenticityLabel, engineMessage } from "./recipe-output-format";

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

export function CondimentChoiceStrip({
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
    <div className="condiment-strip">
      <div
        ref={scrollRef}
        onScroll={updateFades}
        className="condiment-strip__rail hide-scrollbar"
        aria-label={cms.cooking.chooseTopping}
      >
        {railChoices.map(({ recipe }) => {
          const concept = TOPPING_CONCEPTS[recipe.concept_ref];
          const active = activeConceptId === recipe.id;
          const thumbnail = getToppingThumbnail(recipe) ?? toppingPlaceholder;

          if (isTimeline) {
            return (
              <button
                key={recipe.id}
                type="button"
                onClick={() => onSelect(recipe.id)}
                className={`condiment-strip__card${active ? " condiment-strip__card--active" : ""}`}
                aria-pressed={active}
              >
                <span className="condiment-strip__card-row">
                  {thumbnail && (
                    <img
                      src={thumbnail}
                      alt=""
                      className="condiment-strip__card-thumb"
                      loading="lazy"
                    />
                  )}
                  <span className="condiment-strip__card-text">
                    <span className="condiment-strip__card-name type-data">
                      {recipe.name ?? concept?.name}
                    </span>
                    <span
                      className={`condiment-strip__card-variant type-data-sm${
                        active ? " condiment-strip__card-variant--active" : ""
                      }`}
                    >
                      {recipe.variant_name ?? ""}
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
              className={`condiment-strip__pill${active ? " condiment-strip__pill--active" : ""}`}
              aria-pressed={active}
            >
              {thumbnail && (
                <img
                  src={thumbnail}
                  alt=""
                  className="condiment-strip__pill-thumb"
                  loading="lazy"
                />
              )}
              <div className="condiment-strip__pill-text">
                <span className="condiment-strip__pill-name type-data">
                  {recipe.name ?? concept?.name}
                </span>
                <span
                  className={`condiment-strip__pill-variant type-data-sm${
                    active ? " condiment-strip__pill-variant--active" : ""
                  }`}
                >
                  {recipe.variant_name ?? ""}
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
            className="condiment-strip__more type-data"
          >
            <Utensils size={14} />
            <span data-region="label">
              {engineMessage(cms, "topping.viewAll", "Vedi tutti")}
            </span>
          </button>
        )}
      </div>
      {fade.start && (
        <div className="condiment-strip__fade condiment-strip__fade--start" aria-hidden="true" />
      )}
      {fade.end && (
        <div className="condiment-strip__fade condiment-strip__fade--end" aria-hidden="true" />
      )}
      {!isTimeline && (
              <ModalSheet
                open={pickerOpen}
                onClose={() => setPickerOpen(false)}
                ariaLabel={engineMessage(cms, "topping.chooseAllTitle", "Tutti i gusti")}
                size="lg"
                scrim="plain"
                surface="glass-dense"
                entry="pop"
                panelClassName="condiment-strip-picker__panel"
              >
                  <div className="condiment-strip-picker__header">
                    <div className="condiment-strip-picker__header-text">
                      <div className="condiment-strip-picker__eyebrow type-data-sm">
                        {engineMessage(cms, "topping.viewAll", "Vedi tutti")}
                      </div>
                      <h3 className="condiment-strip-picker__title">
                        {engineMessage(cms, "topping.chooseAllTitle", "Tutti i gusti")}
                      </h3>
                      <p className="condiment-strip-picker__hint type-body">
                        {engineMessage(cms, "topping.chooseAllHint", "Scegli un condimento: torni subito al dettaglio.")}
                      </p>
                    </div>
                    <IconButton
                      type="button"
                      onClick={() => setPickerOpen(false)}
                      size="md"
                      variant="ghost"
                      className="condiment-strip-picker__close"
                      aria-label={cms.ui.close}
                    >
                      <X size={16} />
                    </IconButton>
                  </div>

                  <div className="condiment-strip-picker__body">
                    <div className="condiment-strip-picker__search">
                      <Search size={16} className="condiment-strip-picker__search-icon" />
                      <input
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        placeholder={engineMessage(cms, "topping.searchPlaceholder", "Cerca gusto, ingrediente o occasione")}
                        className="condiment-strip-picker__search-input type-data"
                        autoFocus
                      />
                      {query && (
                        <IconButton
                          type="button"
                          onClick={() => setQuery("")}
                          size="sm"
                          variant="ghost"
                          className="condiment-strip-picker__search-clear"
                          aria-label={cms.pages.searchClearLabel}
                        >
                          <X size={14} />
                        </IconButton>
                      )}
                    </div>

                    <div className="condiment-strip-picker__filters hide-scrollbar">
                      <button
                        type="button"
                        onClick={() => setActiveFlavor("all")}
                        className={`condiment-strip-picker__filter type-data${
                          activeFlavor === "all" ? " condiment-strip-picker__filter--active" : ""
                        }`}
                      >
                        {engineMessage(cms, "topping.filterAll", "Tutti")}
                      </button>
                      {flavorFilters.map((profile) => (
                        <button
                          key={profile}
                          type="button"
                          onClick={() => setActiveFlavor(profile)}
                          className={`condiment-strip-picker__filter type-data${
                            activeFlavor === profile ? " condiment-strip-picker__filter--active" : ""
                          }`}
                        >
                          {FLAVOR_PROFILE_LABELS[profile]}
                        </button>
                      ))}
                    </div>

                    <div className="condiment-strip-picker__results">
                      <div className="condiment-strip-picker__grid">
                        {filteredPickerChoices.length > 0 ? (
                          filteredPickerChoices.map(({ recipe }) => {
                            const concept = TOPPING_CONCEPTS[recipe.concept_ref];
                            const active = activeConceptId === recipe.id;
                            const thumbnail = getToppingThumbnail(recipe) ?? toppingPlaceholder;
                            return (
                              <button
                                key={recipe.id}
                                type="button"
                                onClick={() => selectFromSheet(recipe.id)}
                                className={`condiment-strip-picker__choice${
                                  active ? " condiment-strip-picker__choice--active" : ""
                                }`}
                                aria-pressed={active}
                              >
                                <img
                                  src={thumbnail}
                                  alt=""
                                  className="condiment-strip-picker__choice-thumb"
                                  loading="lazy"
                                />
                                <span className="condiment-strip-picker__choice-text">
                                  <span className="condiment-strip-picker__choice-name type-data">
                                    {recipe.name ?? concept?.name}
                                  </span>
                                  <span
                                    className={`condiment-strip-picker__choice-variant type-data-sm${
                                      active ? " condiment-strip-picker__choice-variant--active" : ""
                                    }`}
                                  >
                                    {recipe.variant_name ?? ""}
                                  </span>
                                </span>
                              </button>
                            );
                          })
                        ) : (
                          <div className="condiment-strip-picker__empty type-body">
                            {engineMessage(cms, "topping.noResults", "Nessun condimento trovato.")}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
              </ModalSheet>
      )}
    </div>
  );
}
