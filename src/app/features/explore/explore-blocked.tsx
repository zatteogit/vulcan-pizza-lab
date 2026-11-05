import { useId } from "react";
import { Link } from "react-router";
import type { RecipeVerdict } from "../../domain/pizza-engine";
import type { BlockedGroups, OvenBand } from "../../use-cases/explore-blocked";
import { ImageWithFallback } from "../../components/media/ImageWithFallback";
import { useCms } from "../cms/cms-context";
import { createFormatter } from "../cms/i18n";
import { uiMessage } from "../../i18n/ui-messages";
import { ovenSetupLink } from "../profile/oven-setup-link";
import { blockerText, primaryBlocker } from "../recipe/blocker-text";

/* «Servono più gradi» (decisione di Matteo, 05/11/2026): in fondo alle viste
 * complete di Scopri, ciò che la tua cucina non permette, raggruppato per la
 * temperatura che serve. Card compatte a colori: il grigio non serve più, lo
 * dice la sezione. Il forno si cambia da qui (Profilo), non dalle card. */

export interface BlockedItem {
  id: string;
  name: string;
  photo: string;
  to: string;
}

function bandHint(band: OvenBand): string {
  if (band === "home_plus") return uiMessage("explore.blocked.hintHomePlus");
  if (band === "pizza_oven") return uiMessage("explore.blocked.hintPizzaOven");
  return uiMessage("explore.blocked.hintHighHeat");
}

function bandTitle(band: OvenBand, fromC: number, celsius: (value: number) => string): string {
  if (band === "home_plus") return uiMessage("explore.blocked.bandRange", [celsius(fromC), celsius(299)]);
  if (band === "pizza_oven") return uiMessage("explore.blocked.bandRange", [celsius(300), celsius(399)]);
  return uiMessage("explore.blocked.bandFrom", [celsius(400)]);
}

export function ExploreBlocked({
  kind,
  groups,
  ovenC,
  ovenAssumed,
  exploreBackTo,
  summaryOnly = false,
}: {
  kind: "styles" | "recipes";
  groups: BlockedGroups<BlockedItem>;
  /** Solo intestazione (titolo, frase, forno): nella vista Stili i nomi sono già
   *  nella riga in fondo a ogni famiglia (scelta di Matteo, 05/11). */
  summaryOnly?: boolean;
  ovenC: number;
  /** Il forno non è mai stato indicato: i gradi sono un'ipotesi e lo diciamo. */
  ovenAssumed: boolean;
  exploreBackTo: string;
}) {
  const { cms, bcp47 } = useCms();
  const fmt = createFormatter(cms.ui, bcp47);
  const titleId = useId();
  const otherId = useId();
  if (groups.bands.length === 0 && groups.other.length === 0) return null;

  const leadKey = kind === "styles"
    ? (ovenAssumed ? "explore.blocked.leadStylesAssumed" : "explore.blocked.leadStyles")
    : (ovenAssumed ? "explore.blocked.leadRecipesAssumed" : "explore.blocked.leadRecipes");
  const lead = uiMessage(leadKey, [fmt.celsius(ovenC)]);
  const reason = (verdict: RecipeVerdict) => {
    const blocker = primaryBlocker(verdict);
    return blocker ? blockerText(blocker, cms, bcp47) : "";
  };
  const item = (entry: BlockedItem, note: string) => (
    <li key={entry.id}>
      <Link to={entry.to} state={{ exploreBackTo }} className="explore-blocked__item">
        <ImageWithFallback src={entry.photo} alt="" className="explore-blocked__thumb" loading="lazy" sizes="56px" />
        <span className="explore-blocked__text">
          <span className="type-body explore-blocked__name">{entry.name}</span>
          <span className="type-data-xs explore-blocked__note">{note}</span>
        </span>
      </Link>
    </li>
  );

  const other = groups.other.length > 0 && (
    <section className="explore-blocked__band" aria-labelledby={otherId}>
      {groups.bands.length > 0
        ? <h3 id={otherId} className="explore-blocked__band-title">{uiMessage("explore.blocked.other")}</h3>
        : <h2 id={otherId} className="explore-blocked__title">{uiMessage("explore.blocked.other")}</h2>}
      <ul className="explore-blocked__list">
        {groups.other.map(({ item: entry, verdict }) => item(entry, reason(verdict)))}
      </ul>
    </section>
  );

  if (groups.bands.length === 0) return summaryOnly ? null : <section className="explore-blocked">{other}</section>;

  return (
    <section className="explore-blocked" aria-labelledby={titleId}>
      <header className="explore-blocked__head">
        <h2 id={titleId} className="explore-blocked__title">{uiMessage("explore.blocked.title")}</h2>
        <p className="type-body explore-blocked__lead">{lead}</p>
        {(ovenAssumed || summaryOnly) && (
          <Link to={ovenSetupLink()} className="type-body explore-blocked__action">
            {uiMessage(ovenAssumed ? "explore.blocked.setOven" : "explore.blocked.updateOven")}
          </Link>
        )}
      </header>
      {!summaryOnly && groups.bands.map(({ band, fromC, items }) => (
        <section key={band} className="explore-blocked__band">
          <h3 className="explore-blocked__band-title">{bandTitle(band, fromC, fmt.celsius)}</h3>
          <p className="type-body explore-blocked__hint">
            {bandHint(band)}
            {band === "home_plus" && !ovenAssumed && (
              <>
                {" "}
                <Link to={ovenSetupLink()} className="explore-blocked__action">{uiMessage("explore.blocked.updateOven")}</Link>
              </>
            )}
          </p>
          <ul className="explore-blocked__list">
            {items.map(({ item: entry, minC }) => item(entry, uiMessage("explore.blocked.needs", [fmt.celsius(minC)])))}
          </ul>
        </section>
      ))}
      {!summaryOnly && other}
    </section>
  );
}

/** In fondo a una famiglia di stili: chi non si fa con la tua cucina, in una riga. */
export function FamilyBlockedLine({
  groups,
  exploreBackTo,
}: {
  groups: BlockedGroups<BlockedItem>;
  exploreBackTo: string;
}) {
  const { cms, bcp47 } = useCms();
  const fmt = createFormatter(cms.ui, bcp47);
  const oven = groups.bands.flatMap((band) => band.items);
  if (oven.length === 0 && groups.other.length === 0) return null;
  const links = (entries: { item: BlockedItem; suffix?: string }[]) => entries.map(({ item: entry, suffix }, i) => (
    <span key={entry.id} className="explore-family-blocked__entry">
      {i > 0 && ", "}
      <Link to={entry.to} state={{ exploreBackTo }} className="explore-family-blocked__link">{entry.name}</Link>
      {suffix && ` (${suffix})`}
    </span>
  ));
  return (
    <footer className="explore-family-blocked">
      {oven.length > 0 && (
        <p className="type-body explore-family-blocked__line">
          {uiMessage("explore.blocked.familyOven")}{" "}
          {links(oven.map(({ item: entry, minC }) => ({ item: entry, suffix: fmt.celsius(minC) })))}
        </p>
      )}
      {groups.other.length > 0 && (
        <p className="type-body explore-family-blocked__line">
          {uiMessage("explore.blocked.familyOther")}{" "}
          {links(groups.other.map(({ item: entry }) => ({ item: entry })))}
        </p>
      )}
    </footer>
  );
}
