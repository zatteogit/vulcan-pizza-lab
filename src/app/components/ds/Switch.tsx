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
      className={[
        "inline-flex h-[1.15rem] w-8 shrink-0 items-center rounded-full border border-transparent transition-all outline-none disabled:cursor-not-allowed disabled:opacity-50 focus-visible:ring-[3px]",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={{
        background: checked
          ? "var(--switch-on)"
          : "var(--switch-off)",
        ...style,
      }}
      {...props}
    >
      <SwitchPrimitive.Thumb
        className="pointer-events-none block size-4 rounded-full ring-0 transition-transform data-[state=checked]:translate-x-[calc(100%-2px)] data-[state=unchecked]:translate-x-0"
        style={{
          background: "var(--switch-thumb)",
          boxShadow: "0 1px 2px rgba(0,0,0,0.18)",
        }}
      />
    </SwitchPrimitive.Root>
  );
}
