/**
 * ds/Chip — T4 componente condiviso (toggle pill).
 *
 * Promosso da UnifiedChip (era locale in user-needs.tsx). Consuma SOLO i token
 * T3 `--chip-*` (mai T1/T2 diretti, mai hex). È il chip canonico per le selezioni
 * a toggle in tutta l'app: superficie neutra a riposo, `--chip-bg-active` +
 * `--chip-text-active` da attivo, con check animato.
 *
 * Vedi docs/design-system-tiers.md (T4, F2-2).
 */
import type { ReactNode } from "react";
import { SelectionMark } from "./SelectionMark";

export interface ChipProps {
  label: ReactNode;
  active: boolean;
  onToggle: () => void;
  icon?: ReactNode;
}

export function Chip({ label, active, onToggle, icon }: ChipProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`ds-chip${active ? " ds-chip--active" : ""}`}
      aria-pressed={active}
    >
      <SelectionMark active={active} icon={icon} />
      {label}
    </button>
  );
}
