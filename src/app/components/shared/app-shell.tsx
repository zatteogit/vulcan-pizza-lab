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
import { Suspense,lazy,useCallback,useEffect,useState } from "react";
import { Link,Outlet,useLocation,useNavigate } from "react-router";
import { ActiveCookWidget } from "../../features/cooking/active-cook-widget";
import { CmsProvider,useCms } from "../../features/cms/cms-context";
import { CookSessionProvider,useCookSession } from "../../features/cooking/cook-session";
import type { DarkModeContext,ThemeMode } from "../../hooks/use-dark-mode";
import { SearchButton } from "./search-button";

/* Audit bundle lug 2026: CookingMode e SearchOverlay trascinavano motore,
   topping, glossario e troubleshooting nel chunk d'ingresso (~400 kB di
   sorgente) pur montandosi solo su richiesta → lazy. */
const CookingMode = lazy(() =>
  import("../../features/cooking/cooking-mode").then((m) => ({
    default: m.CookingMode,
  })),
);
const SearchOverlay = lazy(() =>
  import("./search-overlay").then((m) => ({ default: m.SearchOverlay })),
);
import { DebugOverlay } from "../../features/dev-tools/debug-overlay";
import { ThemeSwitcher } from "../../features/dev-tools/theme-switcher";
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
  const isRailLayout = layout === "rail";

  return (
    <Link
      to={tab.path}
      className={isRailLayout ? "app-shell-tab app-shell-tab--rail" : "app-shell-tab app-shell-tab--bottom"}
      aria-label={label}
      aria-current={active ? "page" : undefined}
    >
      {/* Active indicator pill (M3 style) */}
      <motion.div
        className="app-shell-tab__pill"
        whileHover={prefersReducedMotion ? undefined : { scale: 1.045 }}
        whileTap={prefersReducedMotion ? undefined : { scale: 0.94 }}
        transition={navQuickSpring}
      >
        {active && (
          <motion.div
            layoutId={`tab-indicator-${layout}`}
            className="app-shell-tab__indicator"
            transition={navSpring}
          />
        )}
        <Icon size={24} className="app-shell-tab__icon" />
      </motion.div>

      {/* Label */}
      <span className="type-data app-shell-tab__label">{label}</span>
    </Link>
  );
}

type LiquidNavState = {
  hidden: boolean;
  /** Fondo pagina raggiunto: il dock in basso si mostra, ma l'avatar in alto
   *  NON deve ricomparire sopra i contenuti (audit lug 2026). */
  nearBottom: boolean;
  scrolled: boolean;
};

/* ═══ Barre dinamiche (feedback giugno 2026, stile liquid glass) ═══
   La chrome fluttua sopra al contenuto: si ritira quando leggi, riemerge
   appena risali e cambia densità quando c'è contenuto che scorre sotto. */
function useLiquidNavState(threshold = 28): LiquidNavState {
  const [state, setState] = useState<LiquidNavState>({
    hidden: false,
    scrolled: false,
    nearBottom: false,
  });
  useEffect(() => {
    let lastY = window.scrollY;
    let acc = 0;
    let frame = 0;

    /* Massimo scroll reale della pagina. Su Safari iOS lo scrollY va oltre
       questo valore (o sotto 0 in cima) durante il rubber-band: lo usiamo per
       clampare ed evitare che l'elastico generi un dy fantasma. */
    const maxScroll = () =>
      Math.max(0, document.documentElement.scrollHeight - window.innerHeight);

    const readScroll = () => {
      frame = 0;
      /* Clamp anti rubber-band iOS: senza questo, l'overscroll in cima/fondo
         produce delta spurii che fanno lampeggiare il dock. */
      const y = Math.min(Math.max(window.scrollY, 0), maxScroll());
      const dy = y - lastY;
      lastY = y;
      const isScrolled = y > 24;
      const nearBottom =
        window.innerHeight + y >= document.documentElement.scrollHeight - 120;

      if (y < 96 || nearBottom) {
        setState((prev) => {
          const next = { hidden: false, scrolled: isScrolled, nearBottom };
          return prev.hidden === next.hidden &&
            prev.scrolled === next.scrolled &&
            prev.nearBottom === next.nearBottom
            ? prev
            : next;
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
        const next = { hidden, scrolled: isScrolled, nearBottom };
        if (hidden !== prev.hidden) acc = 0;
        return prev.hidden === next.hidden &&
          prev.scrolled === next.scrolled &&
          prev.nearBottom === next.nearBottom
          ? prev
          : next;
      });
    };

    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(readScroll);
    };

    /* Comparsa/scomparsa della barra indirizzi Safari iOS: emette resize (e
       visualViewport resize) senza uno scroll reale dell'utente. La trattiamo
       come "mostra il dock" e ri-sincronizziamo lastY, così la barra che
       ricompare non lascia il dock nascosto né provoca un flip spurio. */
    const onViewportChange = () => {
      lastY = Math.min(Math.max(window.scrollY, 0), maxScroll());
      acc = 0;
      setState((prev) => (prev.hidden ? { ...prev, hidden: false } : prev));
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("scroll", onScroll, { passive: true, capture: true });
    window.addEventListener("resize", onViewportChange, { passive: true });
    window.visualViewport?.addEventListener("resize", onViewportChange);
    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("scroll", onScroll, { capture: true } as EventListenerOptions);
      window.removeEventListener("resize", onViewportChange);
      window.visualViewport?.removeEventListener("resize", onViewportChange);
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
  const { hidden, scrolled } = navState;
  return (
    <motion.div
      className={`app-shell-dock${scrolled ? " app-shell-dock--scrolled" : ""}`}
      initial={{ y: 0, scale: 1, opacity: 1 }}
      animate={{
        y: hidden && !prefersReducedMotion ? 16 : 0,
        scale: hidden && !prefersReducedMotion ? 0.985 : scrolled ? 0.99 : 1,
        opacity: hidden ? 0.88 : 1,
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
    >
      {/* Tabs Capsule */}
      <nav
        data-region="nav"
        className="app-shell-dock__nav"
        aria-label={cms.pages.navMainLabel}
      >
        <motion.span
          aria-hidden="true"
          className="app-shell-dock__gloss"
          animate={{ opacity: 0.26 }}
        />
        <div className="app-shell-dock__row">
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
    <div className="app-shell-rail">
      {/* Navigation Capsule (Logo + Tabs) */}
      <motion.nav
        data-region="nav"
        className="app-shell-rail__nav"
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 280, damping: 28, mass: 0.8 }}
        aria-label={cms.pages.navMainLabel}
      >
        <motion.span
          aria-hidden="true"
          className="app-shell-rail__gloss"
          animate={{ opacity: 0.42 }}
        />
        {/* Logo */}
        <Link
          to="/"
          className="app-shell-rail__logo"
          aria-label={cms.pages.homeAria}
        >
          <VulcanMark size={20} decorative />
        </Link>

        {/* Tabs — centrate verticalmente nella capsula (M3 rail) */}
        <div className="app-shell-rail__tabs">
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
          <div className="app-shell-rail__dev">
            <Link
              to="/dev"
              className="app-shell-rail__dev-link"
              aria-label={cms.pages.devToolsAria}
              title="Ctrl+Shift+D"
            >
              <span className="app-shell-rail__dev-icon">{"</>"}</span>
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
  const prefersReducedMotion = useReducedMotion();
  const label = (cms.pages as any)?.navProfile || "Profilo";
  const { scrolled, nearBottom } = navState;
  /* A fondo pagina il force-show serve al dock di navigazione, non a questo
     avatar: qui ricomparirebbe SOPRA i contenuti (badge card, titoli). */
  const hidden = navState.hidden || (nearBottom && scrolled);
  const size = scrolled ? 40 : 44;
  return (
    <MotionLink
      to="/profile"
      className={`app-shell-profile${scrolled ? " app-shell-profile--scrolled" : ""}${hidden ? " app-shell-profile--hidden" : ""}`}
      animate={{
        width: size,
        height: size,
        borderRadius: scrolled ? "14px" : "16px",
        y: hidden && !prefersReducedMotion ? -(size + 24) : 0,
        opacity: hidden ? 0 : 1,
      }}
      transition={liquidDockQuickSpring}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.92 }}
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
  hidden,
}: {
  canStartRecipe: boolean;
  hasProfileButton: boolean;
  showAction: boolean;
  compact: boolean;
  hidden: boolean;
}) {
  const { session, overlayOpen } = useCookSession();
  return (
    <>
      {showAction && (
        <ActiveCookWidget
          canStartRecipe={canStartRecipe}
          hasProfileButton={hasProfileButton}
          compact={compact}
          hidden={hidden}
        />
      )}
      <AnimatePresence>
        {overlayOpen && session && (
          <Suspense fallback={null}>
            <CookingMode />
          </Suspense>
        )}
      </AnimatePresence>
    </>
  );
}

/* ═══ APP SHELL ═══ */
export function AppShell() {
  const [themeMode, setThemeModeState] = useState<ThemeMode>(loadThemeMode);
  const [darkMode, setDarkModeState] = useState(() => resolveThemeMode(loadThemeMode()));
  const [devMode, setDevModeState] = useState(loadDevMode);
  const [isOverlayDeactivated, setIsOverlayDeactivated] = useState(() => {
    try {
      return localStorage.getItem("vulcan_debug_overlay_deactivated") === "true";
    } catch {
      return false;
    }
  });

  useEffect(() => {
    const handleStorageChange = () => {
      try {
        setIsOverlayDeactivated(localStorage.getItem("vulcan_debug_overlay_deactivated") === "true");
      } catch {}
    };
    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("vulcan_debug_toggle", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("vulcan_debug_toggle", handleStorageChange);
    };
  }, []);

  const [searchOpen, setSearchOpen] = useState(false);
  /* Il chunk della palette si scarica alla prima apertura e resta montato
     (le animazioni open/close continuano a passare dalla prop `open`). */
  const [searchMounted, setSearchMounted] = useState(false);
  const [hideNavbar, setHideNavbar] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const navState = useLiquidNavState();
  const prefersReducedMotion = useReducedMotion();

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

  const openSearch = useCallback(() => {
    setSearchMounted(true);
    setSearchOpen(true);
  }, []);
  const closeSearch = useCallback(() => setSearchOpen(false), []);

  useEffect(() => {
    const handler = () => {
      setSearchMounted(true);
      setSearchOpen(true);
    };
    window.addEventListener("vulcan:open-search", handler);
    return () => window.removeEventListener("vulcan:open-search", handler);
  }, []);

  /* Apply .dark on <html> so portals inherit tokens */
  useEffect(() => {
    const cl = document.documentElement.classList;
    if (darkMode) cl.add("dark");
    else cl.remove("dark");
    /* Mantiene coerente il colore impostato dallo script anti-FOUC di
       index.html anche quando il tema cambia in-app (overscroll/rubber-band). */
    document.documentElement.style.backgroundColor = "var(--container-page)";
  }, [darkMode]);

  /* Ctrl+Shift+D shortcut + ⌘K / Ctrl+K search */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      /* ⌘K / Ctrl+K — open search */
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchMounted(true);
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
        <div className="app-shell-root">
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
            className={`app-shell-main${showNav ? " app-shell-main--nav" : ""}`}
          >
            <Outlet
              context={{ darkMode, setDarkMode, themeMode, setThemeMode, devMode, setDevMode, hideNavbar, setHideNavbar } satisfies DarkModeContext}
            />
          </div>

          {/* Bottom tab bar — mobile */}
          {showNav && (
            <>
              {/* Bottom scrim — visually grounds the floating tab bar on mobile */}
              <motion.div
                className="app-shell-scrim"
                initial={{ y: 0, opacity: 1 }}
                animate={{
                  y: navState.hidden && !prefersReducedMotion ? 18 : 0,
                  opacity: navState.hidden ? 0.42 : 1,
                }}
                transition={
                  prefersReducedMotion
                    ? { duration: 0.16, ease: "easeOut" }
                    : {
                        y: navSpring,
                        opacity: { duration: navState.hidden ? 0.14 : 0.24, ease: "easeOut" },
                      }
                }
              />
              <BottomTabBar activeTab={activeTab} onSearchOpen={openSearch} navState={navState} />
            </>
          )}

          {/* Command palette search overlay — chunk caricato alla prima apertura */}
          {searchMounted && (
            <Suspense fallback={null}>
              <SearchOverlay open={searchOpen} onClose={closeSearch} />
            </Suspense>
          )}

          {/* Pizzata attiva: sticky action + overlay (cross-page) */}
          <CookSessionUI
            canStartRecipe={isRecipePage}
            hasProfileButton={hasProfileButton}
            showAction={showCookAction}
            compact={navState.scrolled}
            /* Come il ProfileButton: a fondo pagina il force-show serve al
               dock in basso, non ai flottanti in alto (audit lug 2026). Una
               pizzata ATTIVA resta comunque visibile (gestito nel widget). */
            hidden={navState.hidden || (navState.nearBottom && navState.scrolled)}
          />

          {/* Strumento di debug AI per annotazioni e bug-fix (se non disattivato nelle impostazioni) */}
          {!isOverlayDeactivated && (
            <DebugOverlay />
          )}

          {/* Theme explorer — confronto temi rivista di cucina (fase esplorativa) */}
          <ThemeSwitcher />
        </div>
        </CookSessionProvider>
      </StylesOverrideProvider>
    </CmsProvider>
  );
}
