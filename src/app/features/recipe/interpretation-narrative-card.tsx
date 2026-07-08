/* Riga "Ispirazione" + modale d'approfondimento (redesign lug 2026, round 4).
 *
 * Nota Matteo: sulla scheda vivono SOLO le firme per cui i parametri cambiano
 * (parameter_overrides) — chip testuali senza emoji, tap = applica/deseleziona.
 * Le storie dei maestri (badge, tecnica, narrativa) NON stanno più inline:
 * "Vedi tutte" apre una modale con tutte le interpretazioni dello stile e il
 * link alla sezione Impara. */
import { useState } from "react";
import { Check, MoreHorizontal, X } from "lucide-react";
import { Link } from "react-router";
import { useCms } from "../cms/cms-context";
import type { Interpretation } from "../../data/interpretation-library";
import { ModalSheet, Surface } from "../../components/ds/index";

/** Nome primario dell'interpretazione (maestro › locale › ente › firma). */
function primaryName(it: Interpretation): string {
  return it.author ?? it.pizzeria ?? it.organization ?? it.signature_name ?? "Interpretazione";
}

/** Riga meta: locale · città · anno (solo i pezzi presenti). */
function metaLine(it: Interpretation): string {
  return [
    it.author && it.pizzeria ? it.pizzeria : null,
    it.location,
    it.year_codified ? String(it.year_codified) : null,
  ]
    .filter(Boolean)
    .join(" · ");
}

/** La firma cambia davvero l'impasto? Solo queste meritano una chip. */
function changesParameters(it: Interpretation): boolean {
  return Boolean(
    it.parameter_overrides && Object.keys(it.parameter_overrides).length > 0,
  );
}

/** Nome BREVE per le chip: gli enti si presentano come "SIGLA — Nome esteso"
 *  (AVPN, APITER…) — in chip va la sigla, il nome pieno vive nella modale. */
function chipName(it: Interpretation): string {
  const name = primaryName(it);
  const short = name.split("—")[0].trim();
  return short || name;
}

export function InterpretationSwitcher({
  interpretations,
  activeId,
  onSelect,
  defaultInterpretation = null,
}: {
  interpretations: Interpretation[];
  activeId: string | null;
  onSelect: (interpretation: Interpretation | null) => void;
  /** La voce di default (es. il disciplinare dello stile): è la prima chip e
   *  il "ritorno" quando si deseleziona una firma. null = canone dello stile
   *  (chip "Tradizionale"). Il default non è mai una firma d'autore. */
  defaultInterpretation?: Interpretation | null;
}) {
  const { cms } = useCms();
  const [modalOpen, setModalOpen] = useState(false);
  if (interpretations.length === 0) return null;
  const parametric = interpretations
    .filter(changesParameters)
    .filter((it) => it.id !== defaultInterpretation?.id);
  const defaultActive = defaultInterpretation
    ? activeId === defaultInterpretation.id
    : !activeId;
  const shownIds = new Set(
    [defaultInterpretation?.id, ...parametric.map((it) => it.id)].filter(Boolean),
  );
  const hiddenCount = interpretations.filter((it) => !shownIds.has(it.id)).length;

  /* Niente etichetta (nota Matteo): la riga si spiega da sola perché UNA voce
     è SEMPRE selezionata. Stato attivo = modifier CSS, non style inline. */

  return (
    <div data-region="filters">
      {/* "Vedi tutte" resta SEMPRE in vista (fuori dallo scroller delle chip). */}
      <div className="interpretation-switcher">
        <div
          className="interpretation-switcher__scroll"
          role="group"
          aria-label={cms.misc.inspirationLabel ?? "Ispirazione"}
        >
          <button
            type="button"
            onClick={() => {
              if (!defaultActive) onSelect(defaultInterpretation);
            }}
            aria-pressed={defaultActive}
            className={`interpretation-switcher__chip${defaultActive ? " interpretation-switcher__chip--active" : ""}`}
          >
            {defaultInterpretation
              ? chipName(defaultInterpretation)
              : (cms.misc.inspirationBase ?? "Tradizionale")}
          </button>
          {parametric.map((it) => {
            const isActive = it.id === activeId;
            return (
              <button
                key={it.id}
                type="button"
                onClick={() => onSelect(isActive ? defaultInterpretation : it)}
                aria-pressed={isActive}
                className={`interpretation-switcher__chip${isActive ? " interpretation-switcher__chip--active" : ""}`}
              >
                {chipName(it)}
              </button>
            );
          })}
        </div>
        {/* Overflow sobrio (round 7): "+N" = quante varianti NON sono in
            riga; se sono tutte in vista, resta l'accesso alle storie. */}
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          aria-haspopup="dialog"
          aria-label={cms.misc.inspirationSeeAll ?? "Vedi tutte"}
          title={cms.misc.inspirationSeeAll ?? "Vedi tutte"}
          className="interpretation-switcher__more"
        >
          {hiddenCount > 0 ? (
            <span className="type-numeric">+{hiddenCount}</span>
          ) : (
            <MoreHorizontal size={14} aria-hidden="true" />
          )}
        </button>
      </div>

      <InterpretationsModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        interpretations={interpretations}
        activeId={activeId}
        onSelect={onSelect}
      />
    </div>
  );
}

/* ═══ Modale d'approfondimento: TUTTE le interpretazioni dello stile,
   con la loro narrativa, e in coda il ponte verso la sezione Impara. ═══ */
function InterpretationsModal({
  open,
  onClose,
  interpretations,
  activeId,
  onSelect,
}: {
  open: boolean;
  onClose: () => void;
  interpretations: Interpretation[];
  activeId: string | null;
  /** Dalla modale si SELEZIONA (nota Matteo): scegli la variante e si chiude. */
  onSelect: (interpretation: Interpretation | null) => void;
}) {
  const { cms } = useCms();

  return (
    <ModalSheet
      open={open}
      onClose={onClose}
      ariaLabelledby="inspiration-modal-title"
      size="md"
      panelClassName="interpretation-modal"
    >
            <div className="interpretation-modal__header">
              <h2
                id="inspiration-modal-title"
                className="interpretation-modal__title"
              >
                {cms.misc.inspirationModalTitle ?? "Ispirazioni d'autore"}
              </h2>
              <button
                type="button"
                onClick={onClose}
                className="interpretation-modal__close"
                aria-label={cms.ui.close}
              >
                <X size={16} />
              </button>
            </div>

            <div
              className="interpretation-modal__body"
              role="radiogroup"
              aria-label={cms.misc.inspirationModalTitle ?? "Ispirazioni d'autore"}
            >
              {interpretations.map((it) => (
                <InterpretationNarrativeCard
                  key={it.id}
                  interpretation={it}
                  selected={it.id === activeId}
                  onSelect={() => {
                    onSelect(it);
                    onClose();
                  }}
                />
              ))}
            </div>

            <div className="interpretation-modal__footer">
              <Link
                to="/learn"
                onClick={onClose}
                className="interpretation-modal__link"
              >
                {cms.misc.inspirationLearnLink ?? "Scopri di più nella sezione Impara"} →
              </Link>
            </div>
    </ModalSheet>
  );
}

function InterpretationNarrativeCard({
  interpretation,
  selected = false,
  onSelect,
}: {
  interpretation: Interpretation;
  /** La variante è quella attiva sulla scheda. */
  selected?: boolean;
  /** Se presente, TUTTA la card è selezionabile (radio della modale):
   *  bordo + check sulla selezionata, niente bottoni (round 7). */
  onSelect?: () => void;
}) {
  const { cms } = useCms();
  const it = interpretation;
  const meta = metaLine(it);
  const selectable = Boolean(onSelect);
  return (
    <Surface
      variant="container"
      {...(selectable
        ? {
            role: "radio" as const,
            "aria-checked": selected,
            tabIndex: 0,
            onClick: onSelect,
            onKeyDown: (e: React.KeyboardEvent) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onSelect?.();
              }
            },
          }
        : {})}
      className={`interpretation-card${selectable ? " interpretation-card--selectable" : ""}${selected ? " interpretation-card--selected" : ""}`}
      title={
        selectable
          ? selected
            ? (cms.misc.inspirationSelected ?? "Selezionata")
            : (cms.misc.inspirationSelect ?? "Seleziona")
          : undefined
      }
    >
      {/* Check di selezione, angolo alto-destro — parla da solo. */}
      {selectable && (
        <span
          aria-hidden="true"
          className={`interpretation-card__check${selected ? " interpretation-card__check--selected" : ""}`}
        >
          <Check size={13} strokeWidth={3} />
        </span>
      )}
      <div className={`interpretation-card__body${selectable ? " interpretation-card__body--selectable" : ""}`}>
        <div className="interpretation-card__title-row">
          <span className="interpretation-card__name">
            {primaryName(it)}
          </span>
          {it.badge && (
            <span className="interpretation-card__badge">
              {it.badge}
            </span>
          )}
        </div>
        {meta && (
          <div className="interpretation-card__meta">
            {meta}
          </div>
        )}
        {it.technique_signature && (
          <div className="interpretation-card__technique">
            {it.technique_signature}
          </div>
        )}
        <p className="interpretation-card__story">
          {it.story}
        </p>
        {it.url && (
          <a
            href={it.url}
            target="_blank"
            rel="noreferrer noopener"
            className="interpretation-card__url"
            onClick={(e) => e.stopPropagation()}
          >
            {it.author ?? it.pizzeria ?? "Approfondisci"} ↗
          </a>
        )}
      </div>
    </Surface>
  );
}
