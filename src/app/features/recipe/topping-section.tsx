import { RecipeAllergens } from "./recipe-allergens";
import { METHOD_MESSAGES_IT } from "../../data/method-messages";
import { engineMsgTexts } from "./engine-msg-text";
/* ═══ TOPPING SECTION — condimento/farcitura (estratto fase 2, lug 2026) ═══
 * Due modalità: "ingredients" (tab Condimento) e "timeline" (inline nello
 * step Condimento del procedimento). Le props sono le dipendenze esplicite
 * che prima erano chiusure su RecipeOutput. */

import { ChevronLeft, ChevronRight, Lightbulb } from "lucide-react";
import { toppingConcept } from "../../data/topping-i18n/localize";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { motionSpring, motionDuration, motionOffset } from "../../components/ds/motion";
import toppingPlaceholder from "../../../assets/toppings/_placeholder.svg";
import { IMAGE_SIZES, responsiveImgAttributes } from "../../components/media/responsive-images";
import { useCms } from "../cms/cms-context";
import { createFormatter, t } from "../cms/i18n";
import { uiMessage } from "../../i18n/ui-messages";
import { Badge, Heading, IconButton } from "../../components/ds/index";
import {
  getToppingThumbnail,
  type IngredientSection,
  type ToppingIngredient,
  type ToppingRecipe,
} from "../../data/topping-library";
import {
  type GeneratedRecipe,
  type getServingUnit,
} from "../../domain/pizza-engine";
import { getRecipesByAuthenticity, scaleToppingAmounts } from "../../data/topping-library";
import { CondimentChoiceStrip } from "./condiment-choice-strip";
import {
  fmtDuration,
  toppingAmountWithTotal,
  getSectionHeader,
  getServingUnitLabel,
  getToppingIngredientSectionOrder,
  toppingSectionLabel,
} from "./recipe-output-format";

type RankedToppings = ReturnType<typeof getRecipesByAuthenticity>;

const toppingFrames = {
  enter: (direction: number) => ({ opacity: 0, x: direction * motionOffset.toppingSlide }),
  visible: { opacity: 1, x: 0 },
  exit: (direction: number) => ({ opacity: 0, x: -direction * motionOffset.toppingSlide }),
};

export interface ToppingSectionProps {
  mode: "ingredients" | "timeline";
  recipe: GeneratedRecipe;
  activeTopping: ToppingRecipe | undefined;
  toppingChoices: RankedToppings;
  allToppingChoices: RankedToppings;
  servingUnit: ReturnType<typeof getServingUnit>;
  onSelectTopping?: (conceptId: string) => void;
  /** Timeline description, duration and details belong to the changing body. */
  children?: ReactNode;
}

function ToppingBody({ contentKey, children }: { contentKey: string; children: ReactNode }) {
  const reduceMotion = useReducedMotion();
  const contentRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number | "auto">("auto");
  useLayoutEffect(() => {
    const content = contentRef.current;
    if (!content) return;
    if (typeof ResizeObserver === "undefined") {
      setHeight("auto");
      return;
    }
    const measure = () => setHeight(content.getBoundingClientRect().height);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(content);
    return () => observer.disconnect();
  }, [contentKey]);
  useLayoutEffect(() => {
    const content = contentRef.current;
    if (!content || reduceMotion || typeof content.animate !== "function") return;
    // An ancestor Presence boundary suppresses descendant initial animations.
    // Animate only this replaced body, without introducing an exit queue.
    const enter = content.animate({ opacity: [0.6, 1] }, { duration: motionDuration.feedback * 1000 });
    return () => enter.cancel();
  }, [contentKey, reduceMotion]);
  return (
    <motion.div className="topping-inline__body" initial={false} animate={{ height }}
      transition={reduceMotion ? { duration: motionDuration.reduced } : motionSpring.denseDisclosure}>
      <div key={contentKey} ref={contentRef} className="topping-inline__content">
        {children}
      </div>
    </motion.div>
  );
}

export function ToppingSection({
  mode,
  recipe,
  activeTopping,
  toppingChoices,
  allToppingChoices,
  servingUnit,
  onSelectTopping,
  children,
}: ToppingSectionProps) {
  const { cms, bcp47 } = useCms();
  const reduceMotion = useReducedMotion();
  const [direction, setDirection] = useState(1);
  const ui = cms.ui;
  const fmt = createFormatter(ui, bcp47);

    // C-2: un formato diverso da quello per cui la ricetta è scritta scala le dosi.
    const topping = activeTopping && scaleToppingAmounts(activeTopping, recipe.topping_scale ?? recipe.style.topping_scale);
    if (!topping || !topping.ingredients || topping.ingredients.length === 0) return <>{children}</>;

    const activeToppingId = topping.id;
    const multiplier = recipe.dough_balls;
    const unitName = getServingUnitLabel(cms, servingUnit, 1, cms.locale.id !== "de");
    const totalUnitName =
      getServingUnitLabel(cms, servingUnit, multiplier, cms.locale.id !== "de");
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
                  ? `+${fmt.durationMinutes(topping.bake_adjustments.additional_minutes)}`
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
          <ToppingBody contentKey={activeToppingId}>
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
            {children}
          </ToppingBody>
        </div>
      );
    }

    const activeChoice = toppingChoices.find(
      (choice) => choice.recipe.id === activeToppingId,
    );
    const activeRecipe = activeChoice?.recipe ?? topping;
    const activeConcept = toppingConcept(activeRecipe.concept_ref, cms.toppingI18n);
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
      setDirection(-1);
      onSelectTopping(toppingChoices[prevIndex].recipe.id);
    };

    const nextTopping = () => {
      if (toppingChoices.length <= 1 || !onSelectTopping) return;
      const nextIndex = (safeCurrentIndex + 1) % toppingChoices.length;
      setDirection(1);
      onSelectTopping(toppingChoices[nextIndex].recipe.id);
    };

    return (
      <section data-region="section" className="topping-panel">
        {/* Carousel image with title & badges overlayed */}
        <div className="topping-panel__carousel">
          <AnimatePresence initial={false} mode="popLayout" custom={direction}>
            <motion.div
              key={activeToppingId}
              custom={direction}
              variants={toppingFrames}
              initial={reduceMotion ? false : "enter"}
              animate="visible"
              exit="exit"
              transition={reduceMotion ? { duration: motionDuration.reduced } : motionSpring.topping}
              className="topping-panel__carousel-frame"
            >
              <img
                loading="eager"
                decoding="async"
                {...responsiveImgAttributes(toppingThumbnail, IMAGE_SIZES.fluid)}
                src={toppingThumbnail}
                alt={toppingName}
                className="topping-panel__carousel-image"
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

                <Heading level="page" as="h2" color="var(--overlay-text)" className="topping-panel__carousel-title">
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
                className="ds-carousel__nav ds-carousel__nav--prev"
                aria-label={cms.cooking.toppingPrevAria}
              >
                <ChevronLeft size={20} />
              </IconButton>
              <IconButton
                type="button"
                onClick={(e) => { e.stopPropagation(); nextTopping(); }}
                size="md"
                variant="bare"
                className="ds-carousel__nav ds-carousel__nav--next"
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
            onSelect={onSelectTopping ? id => {
              const target = toppingChoices.findIndex(choice => choice.recipe.id === id);
              setDirection(target < safeCurrentIndex ? -1 : 1);
              onSelectTopping(id);
            } : undefined}
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
            {/* FW-17 (S08-B-14): con più unità, accanto alla dose c'è il totale. */}
            {multiplier > 1
              ? uiMessage("recipe.phases.toppingNoteTotal", [unitName, multiplier, totalUnitName])
              : t(cms.cooking.toppingAmountsNote, {
                  n: multiplier,
                  unit: totalUnitName,
                  perUnit: unitName,
                })}
          </p>
        </div>

        {recipe.topping_geometry && recipe.topping_geometry.area_scale !== 1 && <p className="topping-panel__details-note type-body">
          {engineMsgTexts([{key:"topping.geometry",fallback:METHOD_MESSAGES_IT["topping.geometry"],params:{area:recipe.topping_geometry.area_cm2,reference:recipe.topping_geometry.reference_area_cm2,scale:recipe.topping_geometry.area_scale}}],cms,bcp47)[0]}
        </p>}

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
              salamoia: [],
              finitura: [],
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
                        <Heading level="xl" as="h3" className="topping-panel__group-title">
                          {headerText}
                        </Heading>
                      </div>
                      <div className="topping-panel__grid">
                        {list.map(({ ing, index }) => {
                          const displayAmount = toppingAmountWithTotal(ing.amount, multiplier, fmt); // FW-17 (S08-B-14)
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
                  const displayAmount = toppingAmountWithTotal(ing.amount, multiplier, fmt); // FW-17 (S08-B-14)
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

        <RecipeAllergens key={activeToppingId} report={recipe.allergens} scope="topping" />

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
