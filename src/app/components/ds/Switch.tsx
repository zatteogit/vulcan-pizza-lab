/**
 * ds/Switch — T4 switch token-driven.
 *
 * Sostituisce il vecchio wrapper shadcn per i nuovi call-site: consuma solo
 * `--switch-*` e mantiene l'API Radix `checked` / `onCheckedChange`.
 * Vedi docs/design-system-tiers.md (T4, F2-4).
 *
 * Budget D-059 (integrazione ondata 2): è un `<button role="switch">` nativo
 * invece di @radix-ui/react-switch (−2 kB gzip). Stesso contratto per il CSS
 * (`data-state` sulla traccia e sul pomello) e per l'accessibilità
 * (`aria-checked`, Spazio e Invio attivano il pulsante nativo).
 */
import type { ButtonHTMLAttributes, MouseEvent } from "react";

export type SwitchProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "type" | "role" | "aria-checked" | "onChange"
> & {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
};

export function Switch({
  className,
  checked = false,
  onCheckedChange,
  onClick,
  disabled,
  ...props
}: SwitchProps) {
  const state = checked ? "checked" : "unchecked";
  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    onClick?.(event);
    if (!event.defaultPrevented) onCheckedChange?.(!checked);
  };
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      data-state={state}
      data-disabled={disabled ? "" : undefined}
      disabled={disabled}
      className={["ds-switch", className].filter(Boolean).join(" ")}
      onClick={handleClick}
      {...props}
    >
      <span className="ds-switch__thumb" data-state={state} />
    </button>
  );
}
