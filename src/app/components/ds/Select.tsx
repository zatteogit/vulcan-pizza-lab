/**
 * ds/Select — T4 dropdown token-driven, context-free.
 *
 * Trigger con bordo che transisce a primary su apertura + chevron che ruota;
 * menu spring con header di gruppo, hover state-layer e Check sul selezionato.
 * Gestisce apertura/click-outside internamente. Estratto da SelectSpec.
 */
import { AnimatePresence, motion } from "motion/react";
import { Check, ChevronDown } from "lucide-react";
import { Fragment, useEffect, useId, useRef, useState } from "react";
import { motionSpring } from "./motion";
import { uiMessage } from "../../i18n/ui-messages";

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
}

export function Select({
  options,
  value = null,
  onValueChange,
  label,
  placeholder = uiMessage("components.ds.select.placeholder"),
  disabled = false,
  className,
}: SelectProps) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const listboxId = useId();
  const selected = options.find((o) => o.id === value) ?? null;

  const openAtSelection = () => {
    const selectedIndex = options.findIndex((option) => option.id === value);
    setActiveIndex(selectedIndex >= 0 ? selectedIndex : 0);
    setOpen(true);
  };

  const selectActive = () => {
    const option = options[activeIndex];
    if (!option) return;
    onValueChange?.(option.id);
    setOpen(false);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (disabled || options.length === 0) return;
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        if (!open) openAtSelection();
        else setActiveIndex((index) => (index + 1) % options.length);
        break;
      case "ArrowUp":
        event.preventDefault();
        if (!open) openAtSelection();
        else setActiveIndex((index) => (index - 1 + options.length) % options.length);
        break;
      case "Home":
        if (!open) return;
        event.preventDefault();
        setActiveIndex(0);
        break;
      case "End":
        if (!open) return;
        event.preventDefault();
        setActiveIndex(options.length - 1);
        break;
      case "Enter":
      case " ":
        event.preventDefault();
        if (open) selectActive();
        else openAtSelection();
        break;
      case "Escape":
        if (!open) return;
        event.preventDefault();
        setOpen(false);
        break;
      case "Tab":
        setOpen(false);
        break;
    }
  };

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className={`ds-select ${className ?? ""}`} ref={ref}>
      <motion.button
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-label={label ?? placeholder}
        aria-expanded={open}
        aria-controls={listboxId}
        aria-activedescendant={open && options[activeIndex]
          ? `${listboxId}-option-${options[activeIndex].id}`
          : undefined}
        disabled={disabled}
        onClick={() => {
          if (open) setOpen(false);
          else openAtSelection();
        }}
        onKeyDown={handleKeyDown}
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
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={motionSpring.crisp}>
          <ChevronDown size={18} className="ds-select__chevron" />
        </motion.div>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            id={listboxId}
            role="listbox"
            aria-label={label ?? placeholder}
            initial={{ opacity: 0, y: -8, scaleY: 0.95 }}
            animate={{ opacity: 1, y: 4, scaleY: 1 }}
            exit={{ opacity: 0, y: -8, scaleY: 0.95 }}
            transition={motionSpring.crispDisclosure}
            className="ds-select__menu"
          >
            {options.map((opt, i) => {
              const isSelected = value === opt.id;
              const prevGroup = i > 0 ? options[i - 1].group : null;
              const showGroupHeader = opt.group && opt.group !== prevGroup;
              return (
                <Fragment key={opt.id}>
                  {showGroupHeader && <div role="presentation" className="ds-select__group-header">{opt.group}</div>}
                  <motion.div
                    id={`${listboxId}-option-${opt.id}`}
                    role="option"
                    aria-selected={isSelected}
                    tabIndex={-1}
                    onClick={() => {
                      onValueChange?.(opt.id);
                      setOpen(false);
                    }}
                    onKeyDown={(event) => {
                      if (event.key !== "Enter" && event.key !== " ") return;
                      event.preventDefault();
                      onValueChange?.(opt.id);
                      setOpen(false);
                    }}
                    onMouseEnter={() => setActiveIndex(i)}
                    className={`ds-select__option${isSelected ? " ds-select__option--selected" : ""}${activeIndex === i ? " ds-select__option--focused" : ""}`}
                  >
                    <div data-slot="option-text">
                      <div className="ds-select__option-title">{opt.label}</div>
                      {opt.desc && <div className="ds-select__option-desc">{opt.desc}</div>}
                    </div>
                    {isSelected && (
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={motionSpring.selectMark}>
                        <Check size={16} className="ds-select__check-icon" />
                      </motion.div>
                    )}
                  </motion.div>
                </Fragment>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
