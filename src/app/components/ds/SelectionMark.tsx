import { Check } from "lucide-react";
import type { ReactNode } from "react";

/** The marker and its spacing collapse as one persistent flex item.
 * Removing an exiting item would also remove its parent's gap in one frame. */
export function SelectionMark({ active, icon, compact = false }: { active: boolean; icon?: ReactNode; compact?: boolean }) {
  return (
    <span aria-hidden="true" className={[
      "ds-selection-mark",
      active && "ds-selection-mark--active",
      icon && "ds-selection-mark--icon",
      compact && "ds-selection-mark--compact",
    ].filter(Boolean).join(" ")}>
      <span className="ds-selection-mark__content">
        <span className="ds-selection-mark__check"><Check size={14} /></span>
        {icon && <span className="ds-selection-mark__icon">{icon}</span>}
      </span>
    </span>
  );
}
