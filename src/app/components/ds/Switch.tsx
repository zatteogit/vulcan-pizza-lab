/**
 * ds/Switch — T4 switch token-driven.
 *
 * Sostituisce il vecchio wrapper shadcn per i nuovi call-site: consuma solo
 * `--switch-*` e mantiene l'API Radix `checked` / `onCheckedChange`.
 * Vedi docs/design-system-tiers.md (T4, F2-4).
 */
import * as SwitchPrimitive from "@radix-ui/react-switch";
import type { ComponentPropsWithoutRef } from "react";

export type SwitchProps = ComponentPropsWithoutRef<
  typeof SwitchPrimitive.Root
>;

export function Switch({
  className,
  style,
  checked,
  ...props
}: SwitchProps) {
  return (
    <SwitchPrimitive.Root
      checked={checked}
      className={["ds-switch", className].filter(Boolean).join(" ")}
      style={style}
      {...props}
    >
      <SwitchPrimitive.Thumb className="ds-switch__thumb" />
    </SwitchPrimitive.Root>
  );
}
