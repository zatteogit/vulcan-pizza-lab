/* === APP SHELL — VPL-055 / VPL-072 ===
   Layout principale con Tab Bar Material 3.
   Mobile: bottom bar 4 tab + search FAB.
   Desktop: sidebar rail + search icon.
   ⌘K / Ctrl+K apre la command palette (SearchOverlay). */

import { useState, useCallback, useEffect } from "react";
import { Outlet, useNavigate, useLocation, Link } from "react-router";
import { motion } from "motion/react";
import {
  Flame,
  BookOpen,
  GraduationCap,
  User,
  Search,
} from "lucide-react";
import { CmsProvider, useCms } from "./cms/cms-context";
import { StylesOverrideProvider } from "./styles-override-context";
import type { DarkModeContext, ThemeMode } from "./root-layout";
import { VulcanMark } from "./vulcan-logo";
import { SearchOverlay } from "./search-overlay";

/* ═══ DARK MODE — tri-state: light / dark / auto ═══ */
const DARK_MODE_KEY = "vulcan_dark_mode";
const DEV_MODE_KEY = "vulcan_dev_mode";

function loadThemeMode(): ThemeMode {
  try {
    const raw = localStorage.getItem(DARK_MODE_KEY);
    if (raw === "auto" || raw === "light" || raw === "dark") return raw;
    /* Legacy migration: "true" → "dark", "false" → "light" */
    if (raw === "true") return "dark";
    if (raw === "false") return "light";
  } catch {
    /* iframe / storage restricted */
  }
  return "auto";
}

function saveThemeMode(value: ThemeMode) {
  try {
    localStorage.setItem(DARK_MODE_KEY, value);
  } catch {
    /* iframe / storage restricted */
  }
}

function resolveThemeMode(mode: ThemeMode): boolean {
  if (mode === "dark") return true;
  if (mode === "light") return false;
  /* auto: follow system preference */
  if (typeof window !== "undefined" && window.matchMedia) {
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  }
  return false;
}

function loadDevMode(): boolean {
  try {
    const raw = localStorage.getItem(DEV_MODE_KEY);
    if (raw !== null) return raw === "true";
  } catch {
    /* iframe / storage restricted */
  }
  return false;
}

function saveDevMode(value: boolean) {
  try {
    localStorage.setItem(DEV_MODE_KEY, String(value));
  } catch {
    /* iframe / storage restricted */
  }
}

/* ═══ TAB DEFINITIONS ═══ */
interface TabDef {
  id: string;
  labelKey: string;
  labelFallback: string;
  icon: typeof Flame;
  path: string;
  /** Path prefixes that activate this tab */
  match: string[];
}

const TABS: TabDef[] = [
  { id: "create", labelKey: "navCreate", labelFallback: "Crea", icon: Flame, path: "/", match: ["/"] },
  {
    id: "explore",
    labelKey: "navExplore",
    labelFallback: "Stili",
    icon: BookOpen,
    path: "/explore",
    match: ["/explore"],
  },
  {
    id: "learn",
    labelKey: "navLearn",
    labelFallback: "Impara",
    icon: GraduationCap,
    path: "/learn",
    match: ["/learn"],
  },
  {
    id: "profile",
    labelKey: "navProfile",
    labelFallback: "Profilo",
    icon: User,
    path: "/profile",
    match: ["/profile"],
  },
];

function getActiveTab(pathname: string): string | null {
  /* Exact match for "/" to avoid matching everything */
  if (pathname === "/") return "create";
  for (const tab of TABS) {
    if (tab.id === "create") continue;
    if (tab.match.some((m) => pathname === m || pathname.startsWith(m + "/")))
      return tab.id;
  }
  return null;
}

/* ═══ TAB ITEM ═══ */
function TabItem({
  tab,
  active,
  layout,
}: {
  tab: TabDef;
  active: boolean;
  layout: "bottom" | "rail";
}) {
  const Icon = tab.icon;
  /* Resolve label from CMS pages section */
  const { cms } = useCms();
  const label = (cms.pages as any)?.[tab.labelKey] || tab.labelFallback;

  return (
    <Link
      to={tab.path}
      className="flex items-center justify-center relative active:scale-95 transition-transform"
      style={{
        flexDirection: "column",
        gap: layout === "bottom" ? 4 : 4,
        padding: layout === "bottom" ? "4px 0" : "12px 0",
        minWidth: layout === "bottom" ? 0 : 56,
        minHeight: layout === "bottom" ? 0 : 56,
        textDecoration: "none",
        WebkitTapHighlightColor: "rgba(0,0,0,0)",
      }}
      aria-label={label}
      aria-current={active ? "page" : undefined}
    >
      {/* Active indicator pill (M3 style) */}
      <div
        className="relative flex items-center justify-center"
        style={{ width: 64, height: 32, borderRadius: 16 }}
      >
        {active && (
          <motion.div
            layoutId="tab-indicator"
            className="absolute inset-0"
            style={{
              borderRadius: 16,
              background: "rgba(208,74,47,0.12)",
            }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          />
        )}
        <Icon
          size={24}
          style={{
            color: active ? "var(--primary)" : "var(--text-muted)",
            position: "relative",
            zIndex: 1,
            transition: "color 0.15s ease",
          }}
        />
      </div>

      {/* Label */}
      <span
        className="type-data"
        style={{
          fontSize: "0.6875rem",
          fontWeight: active
            ? ("var(--weight-semibold)" as any)
            : ("var(--weight-regular)" as any),
          color: active ? "var(--primary)" : "var(--text-muted)",
          letterSpacing: "0.02em",
          lineHeight: 1,
          transition: "color 0.15s ease",
        }}
      >
        {label}
      </span>
    </Link>
  );
}

/* ═══ MOBILE BOTTOM BAR ═══ */
function BottomTabBar({ activeTab, onSearchOpen }: { activeTab: string | null; onSearchOpen: () => void }) {
  const { cms } = useCms();
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden"
      style={{
        background:
          "color-mix(in srgb, var(--container-page) 88%, rgba(0,0,0,0))",
        backdropFilter: "blur(24px) saturate(1.6)",
        WebkitBackdropFilter: "blur(24px) saturate(1.6)",
        borderTop: "1px solid var(--container-border-subtle)",
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
      }}
      aria-label={cms.pages.navMainLabel}
    >
      <div
        className="flex items-center justify-around"
        style={{ height: 64 }}
      >
        {/* First 2 tabs */}
        {TABS.slice(0, 2).map((tab) => (
          <TabItem
            key={tab.id}
            tab={tab}
            active={activeTab === tab.id}
            layout="bottom"
          />
        ))}

        {/* Central search button */}
        <button
          onClick={onSearchOpen}
          className="flex items-center justify-center active:scale-95 transition-transform"
          style={{
            width: 48,
            height: 48,
            borderRadius: 16,
            background: "color-mix(in srgb, var(--primary) 10%, rgba(0,0,0,0))",
            border: "1.5px solid color-mix(in srgb, var(--primary) 20%, rgba(0,0,0,0))",
            color: "var(--primary)",
            WebkitTapHighlightColor: "rgba(0,0,0,0)",
          }}
          aria-label="Cerca (⌘K)"
        >
          <Search size={22} />
        </button>

        {/* Last 2 tabs */}
        {TABS.slice(2).map((tab) => (
          <TabItem
            key={tab.id}
            tab={tab}
            active={activeTab === tab.id}
            layout="bottom"
          />
        ))}
      </div>
    </nav>
  );
}

/* ═══ DESKTOP SIDEBAR RAIL ═══ */
function SidebarRail({ activeTab, devMode, onSearchOpen }: { activeTab: string | null; devMode: boolean; onSearchOpen: () => void }) {
  const { cms } = useCms();
  return (
    <nav
      className="fixed left-0 top-0 bottom-0 hidden md:flex flex-col items-center z-50"
      style={{
        width: 80,
        background:
          "color-mix(in srgb, var(--container-page) 92%, rgba(0,0,0,0))",
        backdropFilter: "blur(24px) saturate(1.6)",
        WebkitBackdropFilter: "blur(24px) saturate(1.6)",
        borderRight: "1px solid var(--container-border-subtle)",
        paddingTop: 16,
        paddingBottom: 16,
      }}
      aria-label={cms.pages.navMainLabel}
    >
      {/* Logo */}
      <Link
        to="/"
        className="flex items-center justify-center mb-4 active:scale-95 transition-transform"
        style={{
          width: 40,
          height: 40,
          borderRadius: 12,
          background: "var(--hero-brand-gradient)",
          color: "var(--overlay-text)",
        }}
        aria-label="Vulcan Pizza Lab — Home"
      >
        <VulcanMark size={20} decorative />
      </Link>

      {/* Search button */}
      <button
        onClick={onSearchOpen}
        className="flex items-center justify-center mb-2 active:scale-95 transition-transform"
        style={{
          width: 40,
          height: 40,
          borderRadius: 12,
          background: "color-mix(in srgb, var(--primary) 8%, rgba(0,0,0,0))",
          border: "1px solid color-mix(in srgb, var(--primary) 15%, rgba(0,0,0,0))",
          color: "var(--text-muted)",
          cursor: "pointer",
          transition: "color 0.15s ease, background 0.15s ease",
        }}
        aria-label="Cerca (⌘K)"
        title="⌘K"
      >
        <Search size={18} />
      </button>

      {/* Divider */}
      <div
        style={{
          width: 32,
          height: 1,
          background: "var(--container-border-subtle)",
          marginBottom: 8,
        }}
      />

      {/* Tabs */}
      <div className="flex flex-col items-center gap-1 flex-1">
        {TABS.map((tab) => (
          <TabItem
            key={tab.id}
            tab={tab}
            active={activeTab === tab.id}
            layout="rail"
          />
        ))}
      </div>

      {/* Dev shortcut (subtle) */}
      {devMode && (
        <div
          className="flex flex-col items-center gap-1 mt-auto pt-2"
          style={{ borderTop: "1px solid var(--container-border-subtle)" }}
        >
          <Link
            to="/dev"
            className="flex items-center justify-center active:scale-95 transition-transform"
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              color: "var(--text-muted)",
              opacity: 0.5,
              fontSize: "0.625rem",
              fontFamily: "var(--font-mono)",
            }}
            aria-label="Developer Tools"
            title="Ctrl+Shift+D"
          >
            <span style={{ fontFeatureSettings: "'tnum'" }}>{"</>"}</span>
          </Link>
        </div>
      )}
    </nav>
  );
}

/* ═══ APP SHELL ═══ */
export function AppShell() {
  const [themeMode, setThemeModeState] = useState<ThemeMode>(loadThemeMode);
  const [darkMode, setDarkModeState] = useState(() => resolveThemeMode(loadThemeMode()));
  const [devMode, setDevModeState] = useState(loadDevMode);
  const [searchOpen, setSearchOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const setThemeMode = useCallback((v: ThemeMode) => {
    setThemeModeState(v);
    saveThemeMode(v);
    setDarkModeState(resolveThemeMode(v));
  }, []);

  const setDarkMode = useCallback((v: boolean) => {
    const newMode = v ? "dark" : "light";
    setThemeModeState(newMode);
    saveThemeMode(newMode);
    setDarkModeState(v);
  }, []);

  /* Listen for system theme changes when in auto mode */
  useEffect(() => {
    if (themeMode !== "auto") return;
    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e: MediaQueryListEvent) => setDarkModeState(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, [themeMode]);

  const setDevMode = useCallback((v: boolean) => {
    setDevModeState(v);
    saveDevMode(v);
  }, []);

  const openSearch = useCallback(() => setSearchOpen(true), []);
  const closeSearch = useCallback(() => setSearchOpen(false), []);

  /* Apply .dark on <html> so portals inherit tokens */
  useEffect(() => {
    const cl = document.documentElement.classList;
    if (darkMode) cl.add("dark");
    else cl.remove("dark");
  }, [darkMode]);

  /* Ctrl+Shift+D shortcut + ⌘K / Ctrl+K search */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      /* ⌘K / Ctrl+K — open search */
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
        return;
      }
      /* Ctrl+Shift+D — dev mode toggle */
      if (e.ctrlKey && e.shiftKey && e.key === "D") {
        e.preventDefault();
        const isDev = window.location.pathname.startsWith("/dev");
        if (isDev) {
          navigate("/");
        } else {
          setDevMode(!devMode);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [navigate, devMode, setDevMode]);

  const activeTab = getActiveTab(location.pathname);

  /* Determine if tab bar should be visible
     Hidden on: /dev, /design-system, /cms (tool pages) */
  const isToolPage =
    location.pathname.startsWith("/dev") ||
    location.pathname.startsWith("/design-system") ||
    location.pathname.startsWith("/cms");

  return (
    <CmsProvider>
      <StylesOverrideProvider>
        <div
          style={{
            minHeight: "100vh",
            background: "var(--container-page)",
          }}
        >
          {/* Sidebar rail — desktop */}
          {!isToolPage && <SidebarRail activeTab={activeTab} devMode={devMode} onSearchOpen={openSearch} />}

          {/* Main content area */}
          <div
            style={{
              marginLeft: !isToolPage ? undefined : 0,
              paddingBottom: !isToolPage ? undefined : 0,
            }}
            className={!isToolPage ? "md:ml-20 pb-20 md:pb-0" : ""}
          >
            <Outlet
              context={{ darkMode, setDarkMode, themeMode, setThemeMode, devMode, setDevMode } satisfies DarkModeContext}
            />
          </div>

          {/* Bottom tab bar — mobile */}
          {!isToolPage && <BottomTabBar activeTab={activeTab} onSearchOpen={openSearch} />}

          {/* Command palette search overlay */}
          <SearchOverlay open={searchOpen} onClose={closeSearch} />
        </div>
      </StylesOverrideProvider>
    </CmsProvider>
  );
}