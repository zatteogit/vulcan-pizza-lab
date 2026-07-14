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
import { Check } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import type { ReactNode } from "react";
import { motionSpring } from "./motion";

export interface ChipProps {
  label: ReactNode;
  active: boolean;
  onToggle: () => void;
  icon?: ReactNode;
}

export function Chip({ label, active, onToggle, icon }: ChipProps) {
  return (
    <button
      onClick={onToggle}
      className={`ds-chip${active ? " ds-chip--active" : ""}`}
      aria-pressed={active}
    >
      <AnimatePresence>
        {active && (
          <motion.span
            initial={{ scale: 0, width: 0 }}
            animate={{ scale: 1, width: 14 }}
            exit={{ scale: 0, width: 0 }}
            transition={motionSpring.crisp}
          >
            <Check size={14} />
          </motion.span>
        )}
      </AnimatePresence>
      {icon && !active && <span className="ds-chip__icon">{icon}</span>}
      {label}
    </button>
  );
}
