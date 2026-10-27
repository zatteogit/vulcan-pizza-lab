import { ChevronDown, Info } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useId, useMemo, useState } from "react";
import { motionSpring } from "../../components/ds/motion";
import { useDisclosureScroll } from "../../hooks/use-disclosure-scroll";
import type { RecipeAllergens, AllergenFinding, AllergenSource } from "../../data/allergen-data";
import { uiMessage } from "../../i18n/ui-messages";
import { useCms } from "../cms/cms-context";
import { pantryIngredientNames } from "./pantry-ingredient-names";
import { pantryIngredientId } from "../../domain/pantry-ingredients";
import { allergenName } from "./allergen-names";
import { allergenSummary, allergensForSection, needsMilkNote } from "./allergen-copy";

function sectionName(section: AllergenSource["section"]): string {
  if (section === "dough") return uiMessage("allergen.dough");
  if (section === "cooking") return uiMessage("allergen.cooking");
  return uiMessage("allergen.topping");
}

/** A quiet ingredient disclosure; compatibility still uses the whole recipe. */
export function RecipeAllergens({ report: fullReport, scope }: { report: RecipeAllergens; scope: "recipe" | "topping" }) {
  const report = allergensForSection(fullReport, scope);
  const detailsId = useId();
  const [open, setOpen] = useState(false);
  const scroll = useDisclosureScroll(open);
  const reduced = useReducedMotion();
  const { cms } = useCms();
  const names = useMemo(() => pantryIngredientNames(cms), [cms]);
  const name = (ingredient: string) => ingredient === "Olio per frittura"
    ? uiMessage("allergen.fryingOil")
    : ingredient === "Farina di grano" ? cms.ui.flour : names.get(pantryIngredientId(ingredient)) ?? ingredient;

  const sources = (group: AllergenFinding, markOptional: boolean) => {
    const sections = new Map<AllergenSource["section"], Set<string>>();
    for (const source of group.sources) {
      const labels = sections.get(source.section) ?? new Set<string>();
      labels.add(`${name(source.ingredient)}${source.product ? ` · ${source.product}` : ""}${markOptional && source.optional ? ` · ${uiMessage("allergen.optional")}` : ""}`);
      sections.set(source.section, labels);
    }
    return [...sections].map(([section, labels]) => <dd key={section}>
      {sectionName(section)} · {[...labels].join("; ")}
    </dd>);
  };

  const groups = (findings: AllergenFinding[], heading: string, traces = false) => <section className="recipe-allergens__group">
    <h4>{heading}</h4>
    {traces && <p className="recipe-allergens__note">{uiMessage("allergen.traceHelp")}</p>}
    <dl>{findings.map(group => <div className="recipe-allergens__source" key={group.id}>
      <dt>{allergenName(group.id)}</dt>
      {sources(group, traces)}
    </div>)}</dl>
  </section>;

  return <aside className="recipe-allergens" data-allergen-scope={scope}
    aria-label={`${uiMessage("allergen.title")} · ${uiMessage(scope === "topping" ? "allergen.topping" : "allergen.dough")}`}>
    <button type="button" className="recipe-allergens__toggle" ref={scroll.anchorRef}
      onClick={() => { if (!open) scroll.prepare(); setOpen(!open); }} aria-expanded={open} aria-controls={detailsId}>
      <Info size={14} aria-hidden="true" />
      <span className="recipe-allergens__copy">
        <strong>{uiMessage("allergen.title")}</strong>
        {allergenSummary(report).map(part => <span className="recipe-allergens__summary" key={part}>{part}</span>)}
      </span>
      <ChevronDown size={16} className={open ? "recipe-allergens__chevron--open" : ""} aria-hidden="true" />
    </button>
    <AnimatePresence initial={false}>{open && <motion.div id={detailsId} ref={scroll.contentRef} className="recipe-allergens__detail"
      initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
      transition={reduced ? { duration: 0 } : motionSpring.denseDisclosure}
      onUpdate={latest => { if (latest.height !== undefined) scroll.follow(latest.height); }} onAnimationComplete={() => scroll.complete()}>
      {report.contains.length > 0 && groups(report.contains, uiMessage("allergen.contains"))}
      {report.conditional.length > 0 && groups(report.conditional, uiMessage("allergen.ifAdded"))}
      {report.may_contain.length > 0 && groups(report.may_contain, uiMessage("allergen.mayContain"), true)}
      {report.unverified.length > 0 && <section className="recipe-allergens__group">
        <h4>{uiMessage("allergen.toCheck")}</h4>
        <p>{[...new Set(report.unverified.map(ingredient => `${name(ingredient.ingredient)}${ingredient.optional ? ` · ${uiMessage("allergen.optional")}` : ""}`))].join("; ")}</p>
      </section>}
      <p className="recipe-allergens__note">{uiMessage("allergen.labelNote")}</p>
      {needsMilkNote(report) && <p className="recipe-allergens__note">{uiMessage("allergen.milkNote")}</p>}
    </motion.div>}</AnimatePresence>
  </aside>;
}
