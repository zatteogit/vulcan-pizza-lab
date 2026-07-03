import React,{ createContext,useCallback,useContext,useState } from "react";
/* STYLES_DB dal modulo dati: questo provider vive nella shell e NON deve
   trascinare il motore nel chunk d'ingresso (audit bundle lug 2026). */
import type { PizzaStyle } from "../domain/pizza-engine";
import { STYLES_DB } from "../domain/styles-db";

/* ═══ STYLES OVERRIDE CONTEXT ═══
 * Provides a mutable styles map that overrides STYLES_DB globally.
 * Used by StyleEditorTab to inject custom/edited styles into the main app flow.
 * When null, the app uses the default STYLES_DB.
 * Persisted in localStorage so edits survive page navigation (dev → home).
 */

const STORAGE_KEY = "vulcan_styles_override";

function loadOverride(): Record<string, PizzaStyle> | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (typeof parsed === "object" && parsed !== null && Object.keys(parsed).length > 0) {
        return parsed;
      }
    }
  } catch {
    /* storage restricted */
  }
  return null;
}

function saveOverride(map: Record<string, PizzaStyle> | null) {
  try {
    if (map) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    /* storage restricted */
  }
}

interface StylesOverrideContextValue {
  /** The custom styles map, or null if using defaults */
  stylesOverride: Record<string, PizzaStyle> | null;
  /** Set the full override map (null to clear) */
  setStylesOverride: (map: Record<string, PizzaStyle> | null) => void;
  /** Convenience: get the effective styles (override or STYLES_DB) */
  effectiveStyles: Record<string, PizzaStyle>;
  /** Whether we're using custom overrides */
  isOverrideActive: boolean;
  /** Clear all overrides */
  clearOverride: () => void;
}

const Ctx = createContext<StylesOverrideContextValue>({
  stylesOverride: null,
  setStylesOverride: () => {},
  effectiveStyles: STYLES_DB,
  isOverrideActive: false,
  clearOverride: () => {},
});

export function useStylesOverride() {
  return useContext(Ctx);
}

export function StylesOverrideProvider({ children }: { children: React.ReactNode }) {
  const [stylesOverride, setOverrideState] = useState<Record<string, PizzaStyle> | null>(
    loadOverride,
  );

  const setStylesOverride = useCallback((map: Record<string, PizzaStyle> | null) => {
    setOverrideState(map);
    saveOverride(map);
  }, []);

  const clearOverride = useCallback(() => {
    setOverrideState(null);
    saveOverride(null);
  }, []);

  const effectiveStyles = stylesOverride ?? STYLES_DB;
  const isOverrideActive = stylesOverride !== null;

  return (
    <Ctx.Provider
      value={{
        stylesOverride,
        setStylesOverride,
        effectiveStyles,
        isOverrideActive,
        clearOverride,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}
