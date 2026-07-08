/**
 * ds/Select — T4 dropdown token-driven, context-free.
 *
 * Trigger con bordo che transisce a primary su apertura + chevron che ruota;
 * menu spring con header di gruppo, hover state-layer e Check sul selezionato.
 * Gestisce apertura/click-outside internamente. Estratto da SelectSpec.
 */
import { AnimatePresence, motion } from "motion/react";
import { Check, ChevronDown } from "lucide-react";
import { Fragment, useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";

interface SelectOption {
  id: string;
  label: string;
  desc?: string;
  group?: string;
}

export interface SelectProps {
  options: SelectOption[];
  value?: string | null;
  onValueChange?: (id: string) => void;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  style?: CSSProperties;
}

export function Select({
  options,
  value = null,
  onValueChange,
  label,
  placeholder = "Seleziona...",
  disabled = false,
  className,
  style,
}: SelectProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = options.find((o) => o.id === value) ?? null;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className={`ds-select ${className ?? ""}`} ref={ref} style={style}>
      <motion.button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((p) => !p)}
        className={`ds-select__trigger${open ? " ds-select__trigger--open" : ""}${
          disabled ? " ds-select__trigger--disabled" : ""
        }`}
      >
        <div className="ds-select__trigger-text">
          {label && <div className="ds-select__label">{label}</div>}
          <div className={`ds-select__value${selected ? "" : " ds-select__value--placeholder"}`}>
            {selected ? selected.label : placeholder}
          </div>
        </div>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ type: "spring", stiffness: 500, damping: 25 }}>
          <ChevronDown size={18} className="ds-select__chevron" />
        </motion.div>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scaleY: 0.95 }}
            animate={{ opacity: 1, y: 4, scaleY: 1 }}
            exit={{ opacity: 0, y: -8, scaleY: 0.95 }}
            transition={{ type: "spring", stiffness: 500, damping: 28 }}
            className="ds-select__menu"
          >
            {options.map((opt, i) => {
              const isSelected = value === opt.id;
              const prevGroup = i > 0 ? options[i - 1].group : null;
              const showGroupHeader = opt.group && opt.group !== prevGroup;
              return (
                <Fragment key={opt.id}>
                  {showGroupHeader && <div className="ds-select__group-header">{opt.group}</div>}
                  <motion.button
                    type="button"
                    onClick={() => {
                      onValueChange?.(opt.id);
                      setOpen(false);
                    }}
                    className={`ds-select__option${isSelected ? " ds-select__option--selected" : ""}`}
                  >
                    <div data-slot="option-text">
                      <div className="ds-select__option-title">{opt.label}</div>
                      {opt.desc && <div className="ds-select__option-desc">{opt.desc}</div>}
                    </div>
                    {isSelected && (
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 500, damping: 20 }}>
                        <Check size={16} className="ds-select__check-icon" />
                      </motion.div>
                    )}
                  </motion.button>
                </Fragment>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
