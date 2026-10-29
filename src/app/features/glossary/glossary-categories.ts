import { ChartColumn, Cog, Flame, FlaskConical, Hand, Microscope, Ruler, Wheat, type LucideIcon } from "lucide-react";
import type { GlossaryCategory } from "../../data/glossary-data";
import type { CmsContent } from "../cms/cms-context";

/* Icone e testi delle categorie del glossario (INT-D2). Le icone prendono il
 * posto delle emoji; nome e descrizione vengono dal CMS, nella lingua attiva. */

export const GLOSSARY_CATEGORY_ICONS: Record<GlossaryCategory, LucideIcon> = {
  technique: Hand, // FW-04
  flour: Wheat, // FW-04
  rheology: Ruler,
  fermentation: Microscope,
  thermal: Flame,
  chemistry: FlaskConical,
  mechanics: Cog,
  scoring: ChartColumn,
};

type GlossaryCms = CmsContent["glossary"];

const CAT_CMS_KEYS: Record<GlossaryCategory, { label: keyof GlossaryCms; desc: keyof GlossaryCms }> = {
  technique: { label: "catTechnique", desc: "catTechniqueDesc" }, // FW-04
  flour: { label: "catFlour", desc: "catFlourDesc" }, // FW-04
  rheology: { label: "catRheology", desc: "catRheologyDesc" },
  fermentation: { label: "catFermentation", desc: "catFermentationDesc" },
  thermal: { label: "catThermal", desc: "catThermalDesc" },
  chemistry: { label: "catChemistry", desc: "catChemistryDesc" },
  mechanics: { label: "catMechanics", desc: "catMechanicsDesc" },
  scoring: { label: "catScoring", desc: "catScoringDesc" },
};

export function glossaryCategoryLabel(id: GlossaryCategory, gl: GlossaryCms): string {
  return String(gl[CAT_CMS_KEYS[id].label]);
}

export function glossaryCategoryDescription(id: GlossaryCategory, gl: GlossaryCms): string {
  return String(gl[CAT_CMS_KEYS[id].desc]);
}
