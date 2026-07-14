import type { StyleVersion } from "../data/style-versions";

export interface StyleVersionPort {
  onHydrationChange: (value: number) => void;
  onFlourWChange: (value: number) => void;
  onFlourPLChange: (value: number | undefined) => void;
  onFermentHoursChange: (value: number) => void;
  onFermentTempChange: (value: number) => void;
  onPreFermentChange: (value: boolean) => void;
  onVersionChange: (value: string) => void;
}

/** Applies a style-version command to an abstract state port; no React/UI dependency. */
export function applyStyleVersion(version: StyleVersion, port: StyleVersionPort): void {
  port.onHydrationChange(version.params.hydration_pct);
  port.onFlourWChange(version.params.flour_w);
  port.onFlourPLChange(version.params.flour_pl);
  port.onFermentHoursChange(version.params.fermentation_hours);
  port.onFermentTempChange(version.params.fermentation_temp_c);
  port.onPreFermentChange(version.params.use_pre_ferment);
  port.onVersionChange(version.id);
}
