/**
 * ds/EvidenceBadge — T4 statuto epistemico di un'affermazione (FW-02, D-A).
 *
 * Quattro statuti: esatto (definizione o aritmetica), stima (modello empirico
 * con un margine), ipotesi (assunzione del modello) e scelta editoriale
 * (convenzione di prodotto). Forma + testo, mai solo colore: ogni statuto ha
 * la sua icona e, per l'ipotesi, un bordo tratteggiato. Il testo arriva dal
 * chiamante (ds non legge il CMS). Consuma solo `--evidence-*`.
 * Si mostra al livello 3 («Come lo calcoliamo») e al 2 quando serve, mai al
 * livello 1 come rumore.
 */
import { Equal, EqualApproximately, Lightbulb, PenLine } from "lucide-react";
/** Stessi valori di EvidenceKind (domain/science/types): il T4 non importa il dominio. */
export type EvidenceBadgeKind = "exact" | "estimate" | "assumption" | "editorial";

export interface EvidenceBadgeProps {
  kind: EvidenceBadgeKind;
  /** Etichetta già tradotta («Esatto», «Stima», «Ipotesi», «Scelta di Vulcan»). */
  label: string;
  size?: "sm" | "md";
  className?: string;
}

const ICON = {
  exact: Equal,
  estimate: EqualApproximately,
  assumption: Lightbulb,
  editorial: PenLine,
} as const;

export function EvidenceBadge({ kind, label, size = "md", className }: EvidenceBadgeProps) {
  const Icon = ICON[kind];
  return (
    <span
      className={["ds-evidence-badge", size === "sm" && "ds-evidence-badge--sm", className].filter(Boolean).join(" ")}
      data-kind={kind}
    >
      <Icon className="ds-evidence-badge__icon" size={size === "sm" ? 12 : 14} aria-hidden="true" />
      <span className="ds-evidence-badge__label">{label}</span>
    </span>
  );
}
