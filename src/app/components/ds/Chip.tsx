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

const BASE = "flex items-center gap-2 rounded-xl px-4 py-2.5 transition-all active:scale-95";

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
      className={BASE}
      aria-pressed={active}
      style={{
        background: active ? "var(--chip-bg-active)" : "var(--chip-bg)",
        color: active ? "var(--chip-text-active)" : "var(--chip-text)",
        border: active
          ? "1px solid transparent"
          : "1px solid var(--chip-border)",
        fontSize: "var(--chip-font-size)",
        fontWeight: active
          ? ("var(--chip-weight-active)" as unknown as number)
          : ("var(--chip-weight)" as unknown as number),
      }}
    >
      <AnimatePresence>
        {active && (
          <motion.span
            initial={{ scale: 0, width: 0 }}
            animate={{ scale: 1, width: 14 }}
            exit={{ scale: 0, width: 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 25 }}
          >
            <Check size={14} />
          </motion.span>
        )}
      </AnimatePresence>
      {icon && !active && <span className="flex-shrink-0">{icon}</span>}
      {label}
    </button>
  );
}
