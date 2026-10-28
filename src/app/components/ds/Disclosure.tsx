/**
 * ds/Disclosure — T4 l'unico contenitore «mostra di più» in pagina (FW-03).
 *
 * Pattern APG «disclosure»: un <button> con aria-expanded e aria-controls che
 * apre un pannello. Il summary può stare dentro un heading del livello
 * indicato (accordion navigabile con il tasto H). Chevron Lucide che ruota;
 * la rotazione segue il contratto globale di prefers-reduced-motion.
 *
 * Varianti:
 * - `card`: riga con bordo e area di tocco piena (profilo, allergeni, card).
 * - `inline`: riga leggera, senza bordo (dentro una scheda o un testo).
 *
 * Controllato (`open` + `onOpenChange`) o non controllato (`defaultOpen`).
 * Il contenuto del pannello si monta solo da aperto. Consuma solo `--disclosure-*`.
 * Vietati altrove: `<details>` nativi, toggle fatti a mano senza aria-expanded.
 */
import { ChevronDown } from "lucide-react";
import { useId, useState } from "react";
import type { ReactNode } from "react";

export interface DisclosureProps {
  /** Testo (o nodo inline, senza elementi interattivi) del pulsante. */
  summary: ReactNode;
  /** Valore corrente o riepilogo a destra del summary (es. «Non indicati»). */
  meta?: ReactNode;
  children?: ReactNode;
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Avvolge il pulsante in un heading h2/h3/h4; il pannello diventa una region. */
  headingLevel?: 2 | 3 | 4;
  /** id del pulsante (per deep link e focus). Il pannello è `${id}-panel`. */
  id?: string;
  variant?: "inline" | "card";
  className?: string;
  /** Classe aggiunta al pulsante (per i layout delle card che lo riusano). */
  triggerClassName?: string;
  panelClassName?: string;
}

export function Disclosure({
  summary,
  meta,
  children,
  defaultOpen = false,
  open: openProp,
  onOpenChange,
  headingLevel,
  id,
  variant = "card",
  className,
  triggerClassName,
  panelClassName,
}: DisclosureProps) {
  const autoId = useId();
  const triggerId = id ?? `disclosure-${autoId.replace(/:/g, "")}`;
  const panelId = `${triggerId}-panel`;
  const [innerOpen, setInnerOpen] = useState(defaultOpen);
  const open = openProp ?? innerOpen;

  const toggle = () => {
    const next = !open;
    if (openProp === undefined) setInnerOpen(next);
    onOpenChange?.(next);
  };

  const trigger = (
    <button
      type="button"
      id={triggerId}
      className={["ds-disclosure__trigger", triggerClassName].filter(Boolean).join(" ")}
      aria-expanded={open}
      aria-controls={panelId}
      onClick={toggle}
    >
      <span className="ds-disclosure__summary">{summary}</span>
      {meta !== undefined && meta !== null && (
        <span className="ds-disclosure__meta">{meta}</span>
      )}
      <ChevronDown className="ds-disclosure__chevron" size={18} aria-hidden="true" />
    </button>
  );

  const Heading = headingLevel ? (`h${headingLevel}` as const) : null;

  return (
    <div
      className={[
        "ds-disclosure",
        variant === "inline" ? "ds-disclosure--inline" : "ds-disclosure--card",
        className,
      ].filter(Boolean).join(" ")}
      data-open={open ? "true" : "false"}
    >
      {Heading ? <Heading className="ds-disclosure__heading">{trigger}</Heading> : trigger}
      <div
        id={panelId}
        className={["ds-disclosure__panel", panelClassName].filter(Boolean).join(" ")}
        role={headingLevel ? "region" : undefined}
        aria-labelledby={headingLevel ? triggerId : undefined}
        hidden={!open}
      >
        {open ? children : null}
      </div>
    </div>
  );
}
