/* FW-14 (S07-A-05, S07-B-06): l'eyebrow della scheda ricetta dice da dove
 * parte la ricetta con le parole del lessico (docs/linee-guida-editoriali.md
 * §Termini): «Su misura», «Ispirata a…», «Disciplinare …», «Riferimento»,
 * «Riferimento sul tuo forno», il nome del profilo impasto scelto. Prima
 * era sempre «Originale», anche sopra
 * «fuori disciplinare» o con la versione di Franco Pepe selezionata. */
import type { Interpretation } from "../../data/interpretation-library";
import { getStyleReference, type StyleVersion } from "../../data/style-versions";
import { uiMessage } from "../../i18n/ui-messages";

/** Nome breve di un'interpretazione: sigla dell'ente o nome del maestro. */
export function interpretationShortName(it: Interpretation): string {
  if (it.short_name) return it.short_name;
  const name = it.author ?? it.pizzeria ?? it.organization ?? it.signature_name ?? "";
  return name.split("—")[0].trim() || name;
}

export interface ReferenceLabelInput {
  styleId: string;
  /** Parametri modificati o ricetta rinominata. */
  tailored: boolean;
  tailoredLabel: string;
  /** «Riferimento» (cms.ui.scoreBasisOriginal). */
  referenceLabel: string;
  interpretation: Interpretation | null;
  version: StyleVersion | null;
  /** Nome della versione già localizzato. */
  versionLabel?: string;
  /** La ricetta sul forno dell'utente si scosta dal riferimento (STG, forno
   *  sotto il minimo dello stile). */
  adaptedToOven: boolean;
}

/** B3 (decisione 5 di Matteo, 31/10/2026): un nome che comincia per vocale
 *  vuole «ad» in italiano («Ispirata ad Adriano») e «d’» in francese
 *  («Inspirée d’Adriano»); le altre lingue hanno la stessa frase per tutti. */
export function startsWithVowel(name: string): boolean {
  return /^[aeiouyàâäáèéêëìíîïòóôöùúûü]/i.test(name.trim());
}

export function referenceEyebrow(input: ReferenceLabelInput): string {
  const { interpretation: it, version } = input;
  if (input.tailored) return input.tailoredLabel;
  // B2 (decisione 2 di Matteo, 30/10/2026): il riferimento dello stile è una
  // sua versione d'autore (base «fonte»): «Riferimento, ispirata a …».
  const reference = getStyleReference(input.styleId);
  const name = it ? it.author ?? interpretationShortName(it) : "";
  if (it && reference.basis === "fonte" && reference.referenceInterpretationId === it.id) {
    return startsWithVowel(name)
      ? uiMessage("recipe.referenceLabel.sourceReferenceVowel", [name])
      : uiMessage("recipe.referenceLabel.sourceReference", [name]);
  }
  if (it && it.type !== "disciplinare") {
    return startsWithVowel(name)
      ? uiMessage("recipe.referenceLabel.inspiredVowel", [name])
      : uiMessage("recipe.referenceLabel.inspired", [name]);
  }
  if (it && !input.adaptedToOven) {
    return uiMessage("recipe.referenceLabel.disciplinare", [interpretationShortName(it)]);
  }
  if (!it && version && version.id !== getStyleReference(input.styleId).referenceVersionId) {
    return input.versionLabel ?? version.label;
  }
  return input.adaptedToOven
    ? uiMessage("recipe.referenceLabel.onYourOven")
    : input.referenceLabel;
}
