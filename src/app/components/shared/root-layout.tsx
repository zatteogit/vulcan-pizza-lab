import { useState, useCallback, useEffect } from "react";
import { Outlet, useNavigate, useOutletContext } from "react-router";
import { StylesOverrideProvider } from "../../context/styles-override-context";
import { CmsProvider } from "../../features/cms/cms-context";

/* ═══ DARK MODE CONTEXT ═══ */
const DARK_MODE_KEY = "vulcan_dark_mode";

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

export function useDarkMode() {
  return useOutletContext<DarkModeContext>();
}

function loadDarkMode(): boolean {
  try {
    const raw = localStorage.getItem(DARK_MODE_KEY);
    if (raw !== null) return raw === "true";
  } catch {
    /* iframe / storage restricted */
  }
  return false;
}

function saveDarkMode(value: boolean) {
  try {
    localStorage.setItem(DARK_MODE_KEY, String(value));
  } catch {
    /* iframe / storage restricted */
  }
}

/* ═══ ROOT LAYOUT ═══ */
/** @deprecated — AppShell is the active layout. RootLayout kept for legacy reference. */
export function RootLayout() {
  const [darkMode, setDarkModeState] = useState(loadDarkMode);
  const navigate = useNavigate();

  const setDarkMode = useCallback((v: boolean) => {
    setDarkModeState(v);
    saveDarkMode(v);
  }, []);

  /* Apply .dark on <html> so portals (createPortal → body) inherit tokens */
  useEffect(() => {
    const cl = document.documentElement.classList;
    if (darkMode) cl.add("dark");
    else cl.remove("dark");
  }, [darkMode]);

  /* Ctrl+Shift+D shortcut — navigates to /dev or back to / */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === "D") {
        e.preventDefault();
        const isDev = window.location.pathname.startsWith("/dev");
        navigate(isDev ? "/" : "/dev");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [navigate]);

  return (
    <CmsProvider>
      <StylesOverrideProvider>
        <div>
          <Outlet context={{ darkMode, setDarkMode, themeMode: "auto" as ThemeMode, setThemeMode: () => {}, devMode: false, setDevMode: () => {} } satisfies DarkModeContext} />
        </div>
      </StylesOverrideProvider>
    </CmsProvider>
  );
}