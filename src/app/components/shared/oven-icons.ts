/* ═══ FW-13 (S18-A-09) — una sola icona per tipo di forno ═══
 * Profilo, onboarding e Crea mostravano icone diverse per lo stesso forno
 * (Elettrico alta temperatura: termometro da una parte, fulmine dall'altra) e
 * il carbone non era mappato. Qui la mappa unica, che copre ogni OvenType.
 * Flame resta il simbolo del forno a gas (e del forno in generale): mai per
 * farina o teglia. */
import type { ComponentType } from "react";
import type { LucideProps } from "lucide-react";
import { Flame, FlameKindling, Home, Thermometer, Zap } from "lucide-react";
import type { OvenType } from "../../domain/pizza-engine";
import { WoodOvenIcon } from "./wood-oven-icon";

export type OvenIcon = ComponentType<LucideProps>;

export const OVEN_ICONS: Record<OvenType, OvenIcon> = {
  home: Home,
  electric_standard: Zap,
  electric_high: Thermometer,
  gas: Flame,
  gas_pizza: Flame,
  wood: WoodOvenIcon,
  coal: FlameKindling,
};

/** Icona del tipo di forno; un id sconosciuto ripiega sul forno generico. */
export function ovenIcon(id: string): OvenIcon {
  return (OVEN_ICONS as Record<string, OvenIcon>)[id] ?? Flame;
}
