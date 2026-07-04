import { useOutletContext } from "react-router";

/* ═══ DARK MODE CONTEXT ═══ */
export type ThemeMode = "light" | "dark" | "auto";

export interface DarkModeContext {
  darkMode: boolean;
  setDarkMode: (v: boolean) => void;
  themeMode: ThemeMode;
  setThemeMode: (v: ThemeMode) => void;
  devMode: boolean;
  setDevMode: (v: boolean) => void;
  hideNavbar?: boolean;
  setHideNavbar?: (v: boolean) => void;
}

/** Legge il DarkModeContext fornito da AppShell via <Outlet context>. */
export function useDarkMode() {
  return useOutletContext<DarkModeContext>();
}
