/* ═══ TOPPING SECTION — condimento/farcitura (estratto fase 2, lug 2026) ═══
 * Due modalità: "ingredients" (tab Condimento) e "timeline" (inline nello
 * step Condimento del procedimento). Le props sono le dipendenze esplicite
 * che prima erano chiusure su RecipeOutput. */

import { ChevronLeft, ChevronRight, Lightbulb } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import toppingPlaceholder from "../../../assets/toppings/_placeholder.svg";
import { useCms } from "../cms/cms-context";
import { createFormatter, t } from "../cms/i18n";
import { Badge, Heading, IconButton } from "../../components/ds/index";
import {
  TOPPING_CONCEPTS,
  getToppingThumbnail,
  type IngredientSection,
  type ToppingIngredient,
  type ToppingRecipe,
} from "../../data/topping-library";
import {
  type GeneratedRecipe,
  type getServingUnit,
} from "../../domain/pizza-engine";
import { getRecipesByAuthenticity } from "../../data/topping-library";
import { CondimentChoiceStrip } from "./condiment-choice-strip";
import {
  fmtDuration,
  formatToppingAmountForLocale,
  getSectionHeader,
  getServingUnitLabel,
  getToppingIngredientSectionOrder,
  toppingSectionLabel,
} from "./recipe-output-format";

type RankedToppings = ReturnType<typeof getRecipesByAuthenticity>;

export interface ToppingSectionProps {
  mode: "ingredients" | "timeline";
  recipe: GeneratedRecipe;
  activeTopping: ToppingRecipe | undefined;
  toppingChoices: RankedToppings;
  allToppingChoices: RankedToppings;
  servingUnit: ReturnType<typeof getServingUnit>;
  onSelectTopping?: (conceptId: string) => void;
}

export function ToppingSection({
  mode,
  recipe,
  activeTopping,
  toppingChoices,
  allToppingChoices,
  servingUnit,
  onSelectTopping,
}: ToppingSectionProps) {
  const { cms, bcp47 } = useCms();
  const ui = cms.ui;
  const fmt = createFormatter(ui, bcp47);

    const topping = activeTopping;
    if (!topping || !topping.ingredients || topping.ingredients.length === 0) return null;

    const activeToppingId = topping.id;
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
        <div className="topping-inline">
          <CondimentChoiceStrip
            choices={toppingChoices}
            allChoices={allToppingChoices}
            activeConceptId={activeToppingId}
            onSelect={onSelectTopping}
            mode="timeline"
          />
          {inlinePrep.length > 0 && (
            <div className="topping-inline__preps">
              {inlinePrep.map((p) => (
                <div key={p.id} className="topping-inline__prep">
                  <span className="topping-inline__prep-title type-data">
                    {p.title}
                    {p.duration_minutes > 0 && (
                      <span className="topping-inline__prep-duration">
                        {" · "}{fmtDuration(p.duration_minutes, fmt)}
                      </span>
                    )}
                  </span>
                  <span className="topping-inline__prep-desc type-body">
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
      (choice) => choice.recipe.id === activeToppingId,
    );
    const activeRecipe = activeChoice?.recipe ?? topping;
    const activeConcept = TOPPING_CONCEPTS[activeRecipe.concept_ref];
    const toppingName = activeRecipe.name ?? activeConcept?.name ?? cms.cooking.toppingTitle;
    const toppingDescription = activeRecipe.description ?? activeConcept?.description;
    const toppingThumbnail = getToppingThumbnail(activeRecipe) ?? toppingPlaceholder;

    const currentIndex = toppingChoices.findIndex(
      (choice) => choice.recipe.id === activeToppingId,
    );
    const safeCurrentIndex = currentIndex >= 0 ? currentIndex : 0;

    const prevTopping = () => {
      if (toppingChoices.length <= 1 || !onSelectTopping) return;
      const prevIndex = (safeCurrentIndex - 1 + toppingChoices.length) % toppingChoices.length;
      onSelectTopping(toppingChoices[prevIndex].recipe.id);
    };

    const nextTopping = () => {
      if (toppingChoices.length <= 1 || !onSelectTopping) return;
      const nextIndex = (safeCurrentIndex + 1) % toppingChoices.length;
      onSelectTopping(toppingChoices[nextIndex].recipe.id);
    };

    return (
      <section data-region="section" className="topping-panel">
        {/* Carousel image with title & badges overlayed */}
        <div className="topping-panel__carousel">
          <AnimatePresence initial={false} mode="popLayout">
            <motion.div
              key={activeToppingId}
              initial={{ opacity: 0, x: 80 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -80 }}
              transition={{ type: "spring", stiffness: 350, damping: 30 }}
              className="topping-panel__carousel-frame"
            >
              <img
                src={toppingThumbnail}
                alt={toppingName}
                className="topping-panel__carousel-image"
                loading="lazy"
              />

              {/* Scrim overlay */}
              <div
                className="topping-panel__carousel-scrim"
                aria-hidden="true"
              />

              {/* Text overlay on image */}
              <div className="topping-panel__carousel-caption">
                <div className="topping-panel__carousel-eyebrow type-data-sm">
                  {toppingSectionLabel(recipe.style, cms)}
                </div>

                <Heading level="page" color="var(--overlay-text)" className="topping-panel__carousel-title">
                  {toppingName}
                </Heading>

                {activeRecipe.variant_name && (
                  <div className="topping-panel__carousel-badges">
                    <Badge
                      tone="muted"
                      size="sm"
                      color="color-mix(in srgb, var(--overlay-text) 90%, transparent)"
                      background="color-mix(in srgb, var(--overlay-text) 18%, transparent)"
                    >
                      {activeRecipe.variant_name}
                    </Badge>
                  </div>
                )}
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
                className="topping-panel__nav topping-panel__nav--prev"
                aria-label={cms.cooking.toppingPrevAria}
              >
                <ChevronLeft size={20} />
              </IconButton>
              <IconButton
                type="button"
                onClick={(e) => { e.stopPropagation(); nextTopping(); }}
                size="md"
                variant="bare"
                className="topping-panel__nav topping-panel__nav--next"
                aria-label={cms.cooking.toppingNextAria}
              >
                <ChevronRight size={20} />
              </IconButton>
            </>
          )}
        </div>

        {/* Thumbnails selector strip */}
        <div className="topping-panel__strip">
          <CondimentChoiceStrip
            choices={toppingChoices}
            allChoices={allToppingChoices}
            activeConceptId={activeToppingId}
            onSelect={onSelectTopping}
            mode="ingredients"
          />
        </div>

        {/* Details section */}
        <div className="topping-panel__details">
          {toppingDescription && (
            <p className="topping-panel__details-description type-body-lg">
              {toppingDescription}
            </p>
          )}

          <p className="topping-panel__details-note type-body">
            {t(cms.cooking.toppingAmountsNote, {
              n: multiplier,
              unit: totalUnitName,
              perUnit: unitName,
            })}
          </p>
        </div>

        {/* Separator line */}
        <div className="topping-panel__divider" />

        {(() => {
          const hasSections = topping.ingredients.some((ing) => ing.section !== undefined);
          if (hasSections) {
            const sectionOrder = getToppingIngredientSectionOrder(topping.ingredients);
            const grouped: Record<IngredientSection, Array<{ ing: ToppingIngredient; index: number }>> = {
              ripieno: [],
              base: [],
              crosta: [],
              superficie: [],
            };
            topping.ingredients.forEach((ing, index) => {
              const sec = ing.section ?? "superficie";
              grouped[sec].push({ ing, index });
            });

            return (
              <div className="topping-panel__sections">
                {sectionOrder.map((sec) => {
                  const list = grouped[sec];
                  if (list.length === 0) return null;
                  const headerText = getSectionHeader(sec, cms.locale.id);
                  return (
                    <div key={sec} className="topping-panel__group">
                      <div className="topping-panel__group-header">
                        <span className="topping-panel__group-marker" />
                        <Heading level="xl" className="topping-panel__group-title">
                          {headerText}
                        </Heading>
                      </div>
                      <div className="topping-panel__grid">
                        {list.map(({ ing, index }) => {
                          const displayAmount = formatToppingAmountForLocale(ing.amount.value, ing.amount.unit, fmt);
                          const detailParts: string[] = [];
                          if (ing.notes) detailParts.push(ing.notes);
                          if (ing.optional) detailParts.push(ui.pantryOptional);
                          return (
                            <div key={`${ing.name}-${index}`} className="topping-panel__card">
                              <div className="topping-panel__card-row">
                                <div className="topping-panel__card-left">
                                  <span
                                    aria-hidden="true"
                                    className="topping-panel__index type-numeric"
                                  >
                                    {index + 1}
                                  </span>
                                  <span
                                    className={
                                      ing.optional
                                        ? "topping-panel__name topping-panel__name--optional"
                                        : "topping-panel__name"
                                    }
                                  >
                                    {ing.name}
                                  </span>
                                </div>
                                <span className="topping-panel__amount type-numeric">
                                  {displayAmount}
                                </span>
                              </div>
                              {detailParts.length > 0 && (
                                <div className="topping-panel__detail type-numeric">
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
              <div className="topping-panel__grid">
                {topping.ingredients.map((ing, i) => {
                  const displayAmount = formatToppingAmountForLocale(ing.amount.value, ing.amount.unit, fmt);
                  const detailParts: string[] = [];
                  if (ing.notes) detailParts.push(ing.notes);
                  if (ing.optional) detailParts.push(ui.pantryOptional);
                  return (
                    <div key={`${ing.name}-${i}`} className="topping-panel__card">
                      <div className="topping-panel__card-row">
                        <div className="topping-panel__card-left">
                          <span
                            aria-hidden="true"
                            className="topping-panel__index type-numeric"
                          >
                            {i + 1}
                          </span>
                          <span
                            className={
                              ing.optional
                                ? "topping-panel__name topping-panel__name--optional"
                                : "topping-panel__name"
                            }
                          >
                            {ing.name}
                          </span>
                        </div>
                        <span className="topping-panel__amount type-numeric">
                          {displayAmount}
                        </span>
                      </div>
                      {detailParts.length > 0 && (
                        <div className="topping-panel__detail type-numeric">
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
          <div className="topping-panel__notes">
            <div className="topping-panel__notes-header type-data-field">
              {cms.cooking.toppingNotesTitle}
            </div>
            <div className="topping-panel__notes-grid">
              {technicalNotes.map((note, i) => (
                <div
                  key={`${note.title}-${note.body}`}
                  className={[
                    "topping-panel__note-item",
                    i > 0 ? "topping-panel__note-item--top" : "",
                    i % 2 === 1 ? "topping-panel__note-item--left" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  <Lightbulb size={17} className="topping-panel__note-icon" />
                  <div className="topping-panel__note-body">
                    <div className="topping-panel__note-title type-data-field">
                      {note.title}
                    </div>
                    <div className="topping-panel__note-desc type-body">
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
}
