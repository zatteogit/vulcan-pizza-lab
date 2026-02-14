import React, { useState, useEffect } from "react";
import { Outlet, useNavigate, useOutletContext } from "react-router";

/* ═══ DARK MODE CONTEXT ═══ */
export interface DarkModeContext {
  darkMode: boolean;
  setDarkMode: (v: boolean) => void;
}

export function useDarkMode() {
  return useOutletContext<DarkModeContext>();
}

/* ═══ ROOT LAYOUT ═══ */
export function RootLayout() {
  const [darkMode, setDarkMode] = useState(false);
  const navigate = useNavigate();

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
    <div className={darkMode ? "dark" : ""}>
      <Outlet context={{ darkMode, setDarkMode } satisfies DarkModeContext} />
    </div>
  );
}
