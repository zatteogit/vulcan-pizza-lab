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
import { ModalSheet } from "../../components/ds/index";

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
     è SEMPRE selezionata. */
  const chipStyle = (isActive: boolean) => ({
    background: isActive
      ? "color-mix(in srgb, var(--primary) 10%, transparent)"
      : "transparent",
    border: isActive
      ? "1px solid color-mix(in srgb, var(--primary) 28%, transparent)"
      : "1px solid transparent",
    color: isActive ? "var(--primary)" : "var(--text-muted)",
    fontSize: "var(--font-size-sm)",
    fontWeight: isActive
      ? ("var(--weight-semibold)" as any)
      : ("var(--weight-medium)" as any),
    cursor: "pointer",
    lineHeight: "var(--leading-tight)",
  });

  return (
    <div>
      {/* "Vedi tutte" resta SEMPRE in vista (fuori dallo scroller delle chip). */}
      <div className="flex items-center gap-2">
        <div
          className="flex-1 min-w-0 flex items-center gap-1.5 overflow-x-auto px-0.5 -mx-0.5"
          style={{ scrollbarWidth: "none" }}
          role="group"
          aria-label={cms.misc.inspirationLabel ?? "Ispirazione"}
        >
          <button
            type="button"
            onClick={() => {
              if (!defaultActive) onSelect(defaultInterpretation);
            }}
            aria-pressed={defaultActive}
            className="flex-shrink-0 inline-flex items-center rounded-full px-2.5 py-1 active:scale-95 transition-all whitespace-nowrap"
            style={chipStyle(defaultActive)}
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
                className="flex-shrink-0 inline-flex items-center rounded-full px-2.5 py-1 active:scale-95 transition-all whitespace-nowrap"
                style={chipStyle(isActive)}
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
          className="flex-shrink-0 inline-flex items-center gap-1 rounded-full px-2.5 py-1 active:scale-95 transition-all whitespace-nowrap"
          style={{
            background: "transparent",
            border: "1px solid var(--container-border)",
            color: "var(--text-muted)",
            fontSize: "var(--font-size-sm)",
            fontWeight: "var(--weight-semibold)" as any,
            cursor: "pointer",
            lineHeight: "var(--leading-tight)",
          }}
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
      panelClassName="overflow-hidden flex flex-col"
    >
            <div
              className="flex-shrink-0 flex items-center gap-3 px-5 py-3.5 sm:px-6 border-b"
              style={{ borderColor: "var(--container-border-subtle)" }}
            >
              <h2
                id="inspiration-modal-title"
                className="flex-1 min-w-0 truncate"
                style={{
                  fontSize: "clamp(1.125rem, 4.6vw, var(--font-size-2xl))",
                  fontWeight: "var(--weight-bold)" as any,
                  margin: 0,
                  lineHeight: "var(--leading-tight)",
                }}
              >
                {cms.misc.inspirationModalTitle ?? "Ispirazioni d'autore"}
              </h2>
              <button
                type="button"
                onClick={onClose}
                className="flex items-center justify-center rounded-full active:scale-90 transition-all flex-shrink-0"
                style={{
                  width: 36,
                  height: 36,
                  background: "var(--container-bg-low)",
                  border: "1px solid var(--container-border)",
                  color: "var(--text-muted)",
                  cursor: "pointer",
                }}
                aria-label={cms.ui.close}
              >
                <X size={16} />
              </button>
            </div>

            <div
              className="flex-1 overflow-y-auto overscroll-contain px-5 py-4 sm:px-6 flex flex-col gap-3"
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

            <div
              className="flex-shrink-0 px-5 pt-3 pb-[max(0.875rem,env(safe-area-inset-bottom))] sm:px-6 sm:pb-3.5 border-t"
              style={{ borderColor: "var(--container-border-subtle)" }}
            >
              <Link
                to="/learn"
                onClick={onClose}
                style={{
                  color: "var(--text-accent)",
                  fontSize: "var(--font-size-md)",
                  fontWeight: "var(--weight-semibold)" as any,
                  textDecoration: "underline",
                  textUnderlineOffset: 3,
                }}
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
    <div
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
      className={`relative rounded-2xl p-4 ${selectable ? "cursor-pointer transition-all active:scale-99" : ""}`}
      style={{
        background: selected
          ? "color-mix(in srgb, var(--primary) 6%, var(--container-card))"
          : "var(--container-card)",
        border: selected
          ? "1px solid color-mix(in srgb, var(--primary) 32%, transparent)"
          : "1px solid var(--container-border-ghost)",
      }}
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
          className="absolute flex items-center justify-center rounded-full transition-all"
          style={{
            top: 14,
            right: 14,
            width: 22,
            height: 22,
            background: selected
              ? "var(--primary)"
              : "transparent",
            border: selected
              ? "1px solid var(--primary)"
              : "1px solid var(--container-border)",
            color: selected ? "var(--text-on-accent)" : "transparent",
          }}
        >
          <Check size={13} strokeWidth={3} />
        </span>
      )}
      <div className="min-w-0" style={selectable ? { paddingRight: 30 } : undefined}>
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
          <span
            style={{
              color: "var(--text-default)",
              fontSize: "var(--font-size-lg)",
              fontWeight: "var(--weight-semibold)" as any,
            }}
          >
            {primaryName(it)}
          </span>
          {it.badge && (
            <span
              className="rounded-full px-2 py-0.5"
              style={{
                fontSize: "var(--font-size-xs)",
                fontWeight: "var(--weight-semibold)" as any,
                color: "var(--text-accent)",
                background: "color-mix(in srgb, var(--text-accent) 10%, transparent)",
              }}
            >
              {it.badge}
            </span>
          )}
        </div>
        {meta && (
          <div
            className="mt-0.5"
            style={{ color: "var(--text-muted)", fontSize: "var(--font-size-sm)" }}
          >
            {meta}
          </div>
        )}
        {it.technique_signature && (
          <div
            className="mt-2"
            style={{ color: "var(--text-default)", fontSize: "var(--font-size-sm)", fontStyle: "italic" }}
          >
            {it.technique_signature}
          </div>
        )}
        <p
          className="mt-2"
          style={{ color: "var(--text-muted)", fontSize: "var(--font-size-sm)", lineHeight: "var(--leading-normal)" }}
        >
          {it.story}
        </p>
        {it.url && (
          <a
            href={it.url}
            target="_blank"
            rel="noreferrer noopener"
            className="mt-2 inline-block"
            onClick={(e) => e.stopPropagation()}
            style={{
              color: "var(--text-accent)",
              fontSize: "var(--font-size-sm)",
              fontWeight: "var(--weight-semibold)" as any,
              textDecoration: "underline",
            }}
          >
            {it.author ?? it.pizzeria ?? "Approfondisci"} ↗
          </a>
        )}
      </div>
    </div>
  );
}
