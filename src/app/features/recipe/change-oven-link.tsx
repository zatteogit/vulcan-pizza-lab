import { ArrowRight } from "lucide-react";
import { Link } from "react-router";
import type { GeneratedRecipe } from "../../domain/pizza-engine";
import { uiMessage } from "../../i18n/ui-messages";
import { ovenSetupLink } from "../profile/oven-setup-link";
import { ovenIsPrimaryBlocker } from "./recipe-card-signals";

/* ═══ FW-10, seguito: «Cambia forno» dalle card di Scopri ═══
 * Quando lo stile non si fa per colpa del forno (troppo freddo per lo stile o
 * del tipo sbagliato), l'uscita è cambiarlo. La card è già un link: l'azione
 * è un secondo link, fratello e non figlio, sotto la card (niente elementi
 * interattivi annidati). Porta alla ricerca del forno nel Profilo, vuota:
 * il forno salvato cambia solo quando l'utente ne sceglie uno. */
export function ChangeOvenLink({ recipe }: { recipe?: GeneratedRecipe }) {
  if (!recipe || !ovenIsPrimaryBlocker(recipe)) return null;
  return (
    <Link to={ovenSetupLink()} className="match-notice__action">
      {uiMessage("explore.card.changeOven")}
      <ArrowRight size={14} aria-hidden="true" />
    </Link>
  );
}
