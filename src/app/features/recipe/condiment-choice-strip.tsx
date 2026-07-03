/* ═══ CONDIMENT CHOICE STRIP — selettore condimenti (estratto lug 2026) ═══ */

import { Search, Utensils, X } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import toppingPlaceholder from "../../../assets/toppings/_placeholder.svg";
import { useCms } from "../cms/cms-context";
import { IconButton } from "../../components/ds/index";
import {
  TOPPING_CONCEPTS,
  getToppingThumbnail,
  type AuthenticityScore,
  type FlavorProfile,
  type ToppingRecipe,
} from "../../data/topping-library";
import { authenticityLabel, engineMessage } from "./recipe-output-format";

export const FLAVOR_PROFILE_LABELS: Record<FlavorProfile, string> = {
  fresh: "Freschi",
  earthy: "Bosco",
  spicy: "Piccanti",
  creamy: "Cremosi",
  rich: "Ricchi",
  salty_savory: "Sapidi",
  sweet_savory: "Agrodolci",
  light: "Leggeri",
};

export const FLAVOR_PROFILE_ORDER: FlavorProfile[] = [
  "fresh",
  "light",
  "creamy",
  "earthy",
  "spicy",
  "rich",
  "salty_savory",
  "sweet_savory",
];

export function normalizeSearch(value: string): string {
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
    <div className="relative">
      <div
        ref={scrollRef}
        onScroll={updateFades}
        className={`flex gap-2 overflow-x-auto pb-1.5 hide-scrollbar ${
          isTimeline ? "topping-strip-timeline" : ""
        }`}
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
                  className="w-full max-w-2xl overflow-hidden rounded-4xl"
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
                          filteredPickerChoices.map(({ recipe }) => {
                            const concept = TOPPING_CONCEPTS[recipe.concept_ref];
                            const active = activeConceptId === recipe.id;
                            const thumbnail = getToppingThumbnail(recipe) ?? toppingPlaceholder;
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
                                <img
                                  src={thumbnail}
                                  alt=""
                                  className="h-12 w-12 rounded-xl object-cover"
                                  loading="lazy"
                                />
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
                                    {recipe.variant_name ?? ""}
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

