/* === APP SHELL — VPL-055 / VPL-072 ===
   Layout principale con Tab Bar Material 3.
   Mobile: bottom bar 4 tab + search FAB.
   Desktop: sidebar rail + search icon.
   ⌘K / Ctrl+K apre la command palette (SearchOverlay). */

import {
Compass,
Flame,
GraduationCap,
User,
} from "lucide-react";
import { AnimatePresence,motion,useReducedMotion } from "motion/react";
import { useCallback,useEffect,useState } from "react";
import { Link,Outlet,useLocation,useNavigate } from "react-router";
import { ActiveCookWidget } from "../../features/cooking/active-cook-widget";
import { CmsProvider,useCms } from "../../features/cms/cms-context";
import { CookSessionProvider,useCookSession } from "../../features/cooking/cook-session";
import { CookingMode } from "../../features/cooking/cooking-mode";
import type { DarkModeContext,ThemeMode } from "./root-layout";
import { SearchButton } from "./search-button";
import { SearchOverlay } from "./search-overlay";
import { StylesOverrideProvider } from "../../context/styles-override-context";
import { VulcanMark } from "./vulcan-logo";
import { liquidDockQuickSpring } from "../../domain/liquid-dock";

const MotionLink = motion(Link);

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

/* Audit Sprint 12 — Profilo NON è una tab pari ad altre: è impostazione utente.
   Spostato dalla tab bar all'header top-right (vedi ProfileButton in AppShell). */
const TABS: TabDef[] = [
  { id: "create", labelKey: "navCreate", labelFallback: "Crea", icon: Flame, path: "/", match: ["/"] },
  {
    id: "explore",
    labelKey: "navExplore",
    /* "Scopri", non "Stili": la sezione contiene ricette iconiche E stili
       (feedback giugno 2026). */
    labelFallback: "Scopri",
    icon: Compass,
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
];

/* Profile tab kept separate — render come pulsante top-right, non come tab. */
const PROFILE_TAB: TabDef = {
  id: "profile",
  labelKey: "navProfile",
  labelFallback: "Profilo",
  icon: User,
  path: "/profile",
  match: ["/profile"],
};

const navSpring = {
  type: "spring",
  stiffness: 360,
  damping: 31,
  mass: 0.72,
} as const;

const navQuickSpring = {
  type: "spring",
  stiffness: 520,
  damping: 36,
  mass: 0.62,
} as const;

const premiumGlassStyle: React.CSSProperties = {
  background: "var(--premium-glass-bg)",
  backdropFilter: "blur(32px) saturate(1.8)",
  WebkitBackdropFilter: "blur(32px) saturate(1.8)",
  border: "1px solid var(--premium-glass-border)",
  boxShadow: "var(--premium-glass-shadow)",
};

const mobileDockGlassStyle: React.CSSProperties = {
  ...premiumGlassStyle,
  background: "color-mix(in srgb, var(--container-page) 94%, transparent)",
};

function getActiveTab(pathname: string): string | null {
  /* Exact match for "/" to avoid matching everything */
  if (pathname === "/") return "create";
  /* PROFILE_TAB checked too — usato per highlight pulsante top-right. */
  for (const tab of [...TABS, PROFILE_TAB]) {
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
  const prefersReducedMotion = useReducedMotion();
  const label = (cms.pages as any)?.[tab.labelKey] || tab.labelFallback;

  return (
    <Link
      to={tab.path}
      className="flex items-center justify-center relative group"
      style={{
        flexDirection: "column",
        gap: layout === "bottom" ? 4 : 4,
        padding: layout === "bottom" ? "4px 0" : "12px 0",
        minWidth: layout === "bottom" ? 0 : 56,
        minHeight: layout === "bottom" ? 0 : 56,
        textDecoration: "none",
        WebkitTapHighlightColor: "transparent",
      }}
      aria-label={label}
      aria-current={active ? "page" : undefined}
    >
      {/* Active indicator pill (M3 style) */}
      <motion.div
        className="relative flex items-center justify-center"
        whileHover={prefersReducedMotion ? undefined : { scale: 1.045 }}
        whileTap={prefersReducedMotion ? undefined : { scale: 0.94 }}
        transition={navQuickSpring}
        style={{
          width: "var(--space-16)",
          height: "var(--space-8)",
          borderRadius: "var(--radius-lg)",
        }}
      >
        {active && (
          <motion.div
            layoutId={`tab-indicator-${layout}`}
            className="absolute inset-0"
            style={{
              borderRadius: "var(--radius-lg)",
              background: "var(--tab-indicator-bg)",
              border: "var(--tab-indicator-border)",
              boxShadow: "var(--tab-indicator-shadow)",
              willChange: "transform",
              WebkitBackfaceVisibility: "hidden",
              backfaceVisibility: "hidden",
            }}
            transition={navSpring}
          />
        )}
        <Icon
          size={24}
          style={{
            color: active ? "var(--icon-accent)" : "var(--icon-muted)",
            position: "relative",
            zIndex: 1,
            transition: "color 0.15s ease",
          }}
        />
      </motion.div>

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
          opacity: active ? 1 : 0.88,
          transition: "color 0.15s ease",
        }}
      >
        {label}
      </span>
    </Link>
  );
}

type LiquidNavState = {
  hidden: boolean;
  scrolled: boolean;
};

/* ═══ Barre dinamiche (feedback giugno 2026, stile liquid glass) ═══
   La chrome fluttua sopra al contenuto: si ritira quando leggi, riemerge
   appena risali e cambia densità quando c'è contenuto che scorre sotto. */
function useLiquidNavState(threshold = 28): LiquidNavState {
  const [state, setState] = useState<LiquidNavState>({
    hidden: false,
    scrolled: false,
  });
  useEffect(() => {
    let lastY = window.scrollY;
    let acc = 0;
    let frame = 0;

    const readScroll = () => {
      frame = 0;
      const y = window.scrollY;
      const dy = y - lastY;
      lastY = y;
      const isScrolled = y > 24;
      const nearBottom =
        window.innerHeight + y >= document.documentElement.scrollHeight - 120;

      if (y < 96 || nearBottom) {
        setState((prev) => {
          const next = { hidden: false, scrolled: isScrolled };
          return prev.hidden === next.hidden && prev.scrolled === next.scrolled ? prev : next;
        });
        acc = 0;
        return;
      }

      if (Math.abs(dy) < 0.5) return;
      acc = Math.sign(dy) === Math.sign(acc) ? acc + dy : dy;

      setState((prev) => {
        const hide = y > 140 && acc > threshold;
        const show = acc < -threshold * 0.72;
        const hidden = hide ? true : show ? false : prev.hidden;
        const next = { hidden, scrolled: isScrolled };
        if (hidden !== prev.hidden) acc = 0;
        return prev.hidden === next.hidden && prev.scrolled === next.scrolled ? prev : next;
      });
    };

    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(readScroll);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("scroll", onScroll, { passive: true, capture: true });
    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("scroll", onScroll, { capture: true } as EventListenerOptions);
    };
  }, [threshold]);
  return state;
}

/* ═══ MOBILE BOTTOM BAR ═══ */
function BottomTabBar({
  activeTab,
  onSearchOpen,
  navState,
}: {
  activeTab: string | null;
  onSearchOpen: () => void;
  navState: LiquidNavState;
}) {
  const { cms } = useCms();
  const prefersReducedMotion = useReducedMotion();
  const { hidden } = navState;
  return (
    <motion.div
      className="fixed left-1/2 -translate-x-1/2 z-50 md:hidden flex items-center gap-3"
      initial={{ y: 0, scale: 1, opacity: 1 }}
      animate={{
        y: hidden && !prefersReducedMotion ? 92 : 0,
        scale: hidden && !prefersReducedMotion ? 0.96 : 1,
        opacity: hidden ? 0 : 1,
      }}
      transition={
        prefersReducedMotion
          ? { duration: 0.16, ease: "easeOut" }
          : {
              y: navSpring,
              scale: navSpring,
              opacity: { duration: hidden ? 0.14 : 0.24, ease: "easeOut" },
            }
      }
      style={{
        bottom: "calc(var(--space-6, 24px) + env(safe-area-inset-bottom, 0px))",
        width: "min(352px, 92vw)",
        transformOrigin: "bottom center",
        willChange: "transform, opacity",
      }}
    >
      {/* Tabs Capsule */}
      <nav
        className="relative flex-1 overflow-hidden"
        style={{
          ...mobileDockGlassStyle,
          borderRadius: "var(--radius-2xl)",
        }}
        aria-label={cms.pages.navMainLabel}
      >
        <motion.span
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-5 top-0 h-px"
          animate={{ opacity: 0.44 }}
          style={{ background: "color-mix(in srgb, var(--overlay-text) 42%, transparent)" }}
        />
        <div
          className="flex items-center justify-around px-2"
          style={{ height: "var(--space-14, 56px)" }}
        >
          {TABS.map((tab) => (
            <TabItem
              key={tab.id}
              tab={tab}
              active={activeTab === tab.id}
              layout="bottom"
            />
          ))}
        </div>
      </nav>

      {/* Floating Search Circle next to it */}
      <SearchButton
        diameter={56}
        iconSize={24}
        onOpen={onSearchOpen}
        surfaceStyle={mobileDockGlassStyle}
      />
    </motion.div>
  );
}

/* ═══ DESKTOP SIDEBAR RAIL ═══ */
function SidebarRail({
  activeTab,
  devMode,
  onSearchOpen,
  navState,
}: {
  activeTab: string | null;
  devMode: boolean;
  onSearchOpen: () => void;
  navState: LiquidNavState;
}) {
  const { cms } = useCms();
  return (
    <div
      className="fixed left-4 top-4 bottom-4 hidden md:flex flex-col gap-3 z-50"
      style={{ width: "var(--space-18, 72px)" }}
    >
      {/* Navigation Capsule (Logo + Tabs) */}
      <motion.nav
        className="relative flex flex-col items-center overflow-hidden py-5 flex-1"
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 280, damping: 28, mass: 0.8 }}
        style={{
          ...premiumGlassStyle,
          borderRadius: "var(--radius-2xl)",
          transformOrigin: "center left",
        }}
        aria-label={cms.pages.navMainLabel}
      >
        <motion.span
          aria-hidden="true"
          className="pointer-events-none absolute left-3 right-3 top-0 h-px"
          animate={{ opacity: 0.42 }}
          style={{ background: "color-mix(in srgb, var(--overlay-text) 42%, transparent)" }}
        />
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center justify-center mb-5 active:scale-95 transition-transform"
          style={{
            width: "var(--space-10)",
            height: "var(--space-10)",
            borderRadius: "var(--radius-md)",
            background: "var(--hero-brand-gradient)",
            color: "var(--overlay-text)",
          }}
          aria-label={cms.pages.homeAria}
        >
          <VulcanMark size={20} decorative />
        </Link>

        {/* Tabs */}
        <div className="flex flex-col items-center gap-1.5 flex-1">
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
            style={{ borderTop: "1px solid var(--container-border-subtle)", width: "var(--space-8)" }}
          >
            <Link
              to="/dev"
              className="flex items-center justify-center active:scale-95 transition-transform"
              style={{
                width: "var(--space-8)",
                height: "var(--space-8)",
                borderRadius: "var(--radius-sm)",
                color: "var(--text-muted)",
                opacity: 0.5,
                fontSize: "var(--font-size-xs)",
                fontFamily: "var(--font-mono)",
              }}
              aria-label={cms.pages.devToolsAria}
              title="Ctrl+Shift+D"
            >
              <span style={{ fontFeatureSettings: "'tnum'" }}>{"</>"}</span>
            </Link>
          </div>
        )}
      </motion.nav>

      {/* Floating Search Circle below the capsule */}
      <SearchButton
        diameter={72}
        iconSize={24}
        onOpen={onSearchOpen}
        surfaceStyle={premiumGlassStyle}
      />
    </div>
  );
}

/* ═══ PROFILE BUTTON — fixed top-right, sostituisce la tab Profilo ═══
   Audit Sprint 12: Profilo è impostazione utente, non una tab di navigazione. */
function ProfileButton({ active, navState }: { active: boolean; navState: LiquidNavState }) {
  const { cms } = useCms();
  const label = (cms.pages as any)?.navProfile || "Profilo";
  const { scrolled } = navState;
  const size = scrolled ? 40 : 44;
  return (
    <MotionLink
      to="/profile"
      className="fixed right-4 flex items-center justify-center"
      animate={{
        width: size,
        height: size,
        borderRadius: scrolled ? "14px" : "16px",
      }}
      transition={liquidDockQuickSpring}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.92 }}
      style={{
        top: "calc(var(--space-4, 16px) + env(safe-area-inset-top, 0px))",
        /* z-index 60 per stare SOPRA gli header sticky z-50 delle pagine. */
        zIndex: 60,
        background: active
          ? "color-mix(in srgb, var(--primary) 16%, var(--container-page))"
          : scrolled
            ? "color-mix(in srgb, var(--container-page) 72%, transparent)"
            : "color-mix(in srgb, var(--container-page) 86%, transparent)",
        backdropFilter: "blur(22px) saturate(1.55)",
        WebkitBackdropFilter: "blur(22px) saturate(1.55)",
        border: `1px solid ${
          active
            ? "color-mix(in srgb, var(--primary) 24%, transparent)"
            : "color-mix(in srgb, var(--text-default) 10%, transparent)"
        }`,
        color: active ? "var(--primary)" : "var(--text-default)",
        boxShadow: active
          ? "0 10px 24px color-mix(in srgb, var(--primary) 16%, transparent), inset 0 1px 0 color-mix(in srgb, var(--overlay-text) 18%, transparent)"
          : "0 10px 24px color-mix(in srgb, var(--shadow-color) 8%, transparent), inset 0 1px 0 color-mix(in srgb, var(--overlay-text) 12%, transparent)",
        textDecoration: "none",
        transition:
          "background 180ms ease, border-color 180ms ease, box-shadow 180ms ease",
        willChange: "transform, width, height",
      }}
      aria-label={label}
      aria-current={active ? "page" : undefined}
      title={label}
    >
      <User size={18} />
    </MotionLink>
  );
}

/* ═══ COOK SESSION UI — widget flottante + overlay full-screen ═══
   La "pizzata attiva" vive a livello di shell: segue l'utente su ogni pagina. */
function CookSessionUI({
  canStartRecipe,
  hasProfileButton,
  showAction,
  compact,
}: {
  canStartRecipe: boolean;
  hasProfileButton: boolean;
  showAction: boolean;
  compact: boolean;
}) {
  const { session, overlayOpen } = useCookSession();
  return (
    <>
      {showAction && (
        <ActiveCookWidget
          canStartRecipe={canStartRecipe}
          hasProfileButton={hasProfileButton}
          compact={compact}
        />
      )}
      <AnimatePresence>{overlayOpen && session && <CookingMode />}</AnimatePresence>
    </>
  );
}

/* ═══ APP SHELL ═══ */
export function AppShell() {
  const [themeMode, setThemeModeState] = useState<ThemeMode>(loadThemeMode);
  const [darkMode, setDarkModeState] = useState(() => resolveThemeMode(loadThemeMode()));
  const [devMode, setDevModeState] = useState(loadDevMode);
  const [searchOpen, setSearchOpen] = useState(false);
  const [hideNavbar, setHideNavbar] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const navState = useLiquidNavState();

  // Reset hideNavbar state during render when the pathname changes to avoid race conditions with children
  const [prevPathname, setPrevPathname] = useState(location.pathname);
  if (location.pathname !== prevPathname) {
    setPrevPathname(location.pathname);
    setHideNavbar(false);
  }

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

  useEffect(() => {
    const handler = () => setSearchOpen(true);
    window.addEventListener("vulcan:open-search", handler);
    return () => window.removeEventListener("vulcan:open-search", handler);
  }, []);

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
     Hidden on: /dev, /design-system, /cms (tool pages) or /recipe/:styleId or when hideNavbar is true */
  const isToolPage =
    location.pathname.startsWith("/dev") ||
    location.pathname.startsWith("/design-system") ||
    location.pathname.startsWith("/cms");
  const isRecipePage = location.pathname.startsWith("/recipe/");
  const showNav = !isToolPage && !isRecipePage && !hideNavbar;
  const showCookAction = !isToolPage && !hideNavbar;
  const hasProfileButton = showNav && activeTab !== "profile";

  return (
    <CmsProvider>
      <StylesOverrideProvider>
        <CookSessionProvider>
        <div
          style={{
            minHeight: "100dvh",
            background: "var(--container-page)",
            overflowX: "hidden",
            width: "100%",
            position: "relative",
          }}
        >
          {/* Sidebar rail — desktop */}
          {showNav && (
            <SidebarRail
              activeTab={activeTab}
              devMode={devMode}
              onSearchOpen={openSearch}
              navState={navState}
            />
          )}

          {/* Audit Sprint 12 — Profilo top-right (sostituisce la tab Profilo). */}
          {showNav && activeTab !== "profile" && (
            <ProfileButton active={activeTab === "profile"} navState={navState} />
          )}

          {/* Main content area */}
          <div
            style={{
              marginLeft: showNav ? undefined : 0,
              paddingBottom: showNav ? "calc(80px + env(safe-area-inset-bottom, 0px))" : 0,
            }}
            className={showNav ? "md:ml-28 md:pb-0 overflow-x-hidden" : "overflow-x-hidden"}
          >
            <Outlet
              context={{ darkMode, setDarkMode, themeMode, setThemeMode, devMode, setDevMode, hideNavbar, setHideNavbar } satisfies DarkModeContext}
            />
          </div>

          {/* Bottom tab bar — mobile */}
          {showNav && (
            <>
              {/* Bottom scrim — visually grounds the floating tab bar on mobile */}
              <div
                className="fixed bottom-0 inset-x-0 z-40 pointer-events-none md:hidden"
                style={{
                  height: "calc(112px + env(safe-area-inset-bottom, 0px))",
                  background: "linear-gradient(to top, var(--container-page) 0%, var(--container-page) 46%, color-mix(in srgb, var(--container-page) 88%, transparent) 72%, transparent 100%)",
                }}
              />
              <BottomTabBar activeTab={activeTab} onSearchOpen={openSearch} navState={navState} />
            </>
          )}

          {/* Command palette search overlay */}
          <SearchOverlay open={searchOpen} onClose={closeSearch} />

          {/* Pizzata attiva: sticky action + overlay (cross-page) */}
          <CookSessionUI
            canStartRecipe={isRecipePage}
            hasProfileButton={hasProfileButton}
            showAction={showCookAction}
            compact={navState.scrolled}
          />
        </div>
        </CookSessionProvider>
      </StylesOverrideProvider>
    </CmsProvider>
  );
}
