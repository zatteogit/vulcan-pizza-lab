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
        <div className="mt-4 flex flex-col gap-2">
          <CondimentChoiceStrip
            choices={toppingChoices}
            allChoices={allToppingChoices}
            activeConceptId={activeToppingId}
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
      <section data-region="section" className="flex flex-col gap-6">
        {/* Carousel image with title & badges overlayed */}
        <div className="relative aspect-[16/10] w-full overflow-hidden rounded-3xl bg-[var(--surface-container)] shadow-md">
          <AnimatePresence initial={false} mode="popLayout">
            <motion.div
              key={activeToppingId}
              initial={{ opacity: 0, x: 80 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -80 }}
              transition={{ type: "spring", stiffness: 350, damping: 30 }}
              className="absolute inset-0 w-full h-full"
            >
              <img
                src={toppingThumbnail}
                alt={toppingName}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              
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
                  {toppingSectionLabel(recipe.style, cms)}
                </div>
                
                <Heading level="page" color="var(--overlay-text)" className="font-serif !text-white mt-0.5">
                  {toppingName}
                </Heading>

                {activeRecipe.variant_name && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    <Badge tone="muted" size="sm" style={{ background: "rgba(255, 255, 255, 0.18)", color: "rgba(255, 255, 255, 0.9)" }}>
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
            activeConceptId={activeToppingId}
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
                        {list.map(({ ing, index }) => {
                          const displayAmount = formatToppingAmountForLocale(ing.amount.value, ing.amount.unit, fmt);
                          const detailParts: string[] = [];
                          if (ing.notes) detailParts.push(ing.notes);
                          if (ing.optional) detailParts.push(ui.pantryOptional);
                          return (
                            <div
                              key={`${ing.name}-${index}`}
                              className="rounded-2xl p-4 sm:p-5 text-left"
                              style={{
                                background: "var(--container-bg-low)",
                                border: "1px solid var(--container-border-subtle)",
                              }}
                            >
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex min-w-0 items-center gap-3">
                                  <span
                                    aria-hidden="true"
                                    className="inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full type-numeric"
                                    style={{
                                      background: "color-mix(in srgb, var(--text-accent) 10%, transparent)",
                                      border: "1px solid color-mix(in srgb, var(--text-accent) 22%, transparent)",
                                      color: "var(--text-accent)",
                                      fontSize: "var(--font-size-sm)",
                                      fontWeight: "var(--weight-semibold)" as any,
                                      lineHeight: 1,
                                    }}
                                  >
                                    {index + 1}
                                  </span>
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
                        <div className="flex min-w-0 items-center gap-3">
                          <span
                            aria-hidden="true"
                            className="inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full type-numeric"
                            style={{
                              background: "color-mix(in srgb, var(--text-accent) 10%, transparent)",
                              border: "1px solid color-mix(in srgb, var(--text-accent) 22%, transparent)",
                              color: "var(--text-accent)",
                              fontSize: "var(--font-size-sm)",
                              fontWeight: "var(--weight-semibold)" as any,
                              lineHeight: 1,
                            }}
                          >
                            {i + 1}
                          </span>
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
}
