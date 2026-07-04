/**
 * ds/Select — T4 dropdown token-driven, context-free.
 *
 * Trigger con bordo che transisce a primary su apertura + chevron che ruota;
 * menu spring con header di gruppo, hover state-layer e Check sul selezionato.
 * Gestisce apertura/click-outside internamente. Estratto da SelectSpec.
 */
import { AnimatePresence, motion } from "motion/react";
import { Check, ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";
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
    <div className={`relative ${className ?? ""}`} ref={ref} style={style}>
      <motion.button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((p) => !p)}
        className="w-full flex items-center justify-between px-4 py-3 rounded-xl active:scale-98 transition-transform"
        style={{
          background: "var(--surface-container)",
          border: open ? "2px solid var(--primary)" : "1px solid var(--outline-variant)",
          cursor: disabled ? "not-allowed" : "pointer",
          outline: "none",
          opacity: disabled ? 0.5 : 1,
          boxShadow: open ? "var(--shadow-glow)" : "none",
        }}
      >
        <div style={{ textAlign: "left" }}>
          {label && (
            <div
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "var(--font-size-lg)",
                fontWeight: "var(--weight-medium)" as CSSProperties["fontWeight"],
                color: "var(--primary)",
                letterSpacing: "var(--tracking-spread)",
                marginBottom: 2,
              }}
            >
              {label}
            </div>
          )}
          <div
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "var(--font-size-xl)",
              fontWeight: "var(--weight-medium)" as CSSProperties["fontWeight"],
              color: selected ? "var(--text-default)" : "var(--muted-foreground)",
            }}
          >
            {selected ? selected.label : placeholder}
          </div>
        </div>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ type: "spring", stiffness: 500, damping: 25 }}>
          <ChevronDown size={18} style={{ color: "var(--muted-foreground)" }} />
        </motion.div>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scaleY: 0.95 }}
            animate={{ opacity: 1, y: 4, scaleY: 1 }}
            exit={{ opacity: 0, y: -8, scaleY: 0.95 }}
            transition={{ type: "spring", stiffness: 500, damping: 28 }}
            className="absolute z-50 w-full rounded-xl overflow-hidden"
            style={{
              background: "var(--surface-container)",
              border: "1px solid var(--outline-variant)",
              boxShadow: "var(--shadow-lg)",
              transformOrigin: "top",
              maxHeight: 280,
              overflowY: "auto",
            }}
          >
            {options.map((opt, i) => {
              const isSelected = value === opt.id;
              const prevGroup = i > 0 ? options[i - 1].group : null;
              const showGroupHeader = opt.group && opt.group !== prevGroup;
              return (
                <div style={{ display: "contents" }} key={opt.id}>
                  {showGroupHeader && (
                    <div
                      className="px-4 pt-3 pb-1"
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "var(--font-size-md)",
                        fontWeight: "var(--weight-semibold)" as CSSProperties["fontWeight"],
                        letterSpacing: "var(--tracking-caps)",
                        textTransform: "uppercase",
                        color: "var(--primary)",
                      }}
                    >
                      {opt.group}
                    </div>
                  )}
                  <motion.button
                    type="button"
                    onClick={() => {
                      onValueChange?.(opt.id);
                      setOpen(false);
                    }}
                    className="w-full flex items-center justify-between px-4 py-2.5 text-left active:scale-98 transition-transform"
                    style={{
                      background: isSelected
                        ? "color-mix(in srgb, var(--primary) 10%, rgba(0,0,0,0))"
                        : "rgba(0,0,0,0)",
                      border: "none",
                      cursor: "pointer",
                      outline: "none",
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected)
                        e.currentTarget.style.background = "color-mix(in srgb, var(--primary) 5%, rgba(0,0,0,0))";
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) e.currentTarget.style.background = "rgba(0,0,0,0)";
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontFamily: "var(--font-sans)",
                          fontSize: "var(--font-size-lg)",
                          fontWeight: (isSelected
                            ? "var(--weight-semibold)"
                            : "var(--weight-regular)") as CSSProperties["fontWeight"],
                          color: "var(--text-default)",
                        }}
                      >
                        {opt.label}
                      </div>
                      {opt.desc && (
                        <div
                          style={{
                            fontFamily: "var(--font-mono)",
                            fontSize: "var(--font-size-lg)",
                            color: "var(--muted-foreground)",
                            fontFeatureSettings: "'tnum'",
                          }}
                        >
                          {opt.desc}
                        </div>
                      )}
                    </div>
                    {isSelected && (
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 500, damping: 20 }}>
                        <Check size={16} style={{ color: "var(--primary)" }} />
                      </motion.div>
                    )}
                  </motion.button>
                </div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
