/* === ROUTE CONFIG — VPL-056 / VPL-072 ===
   Ristrutturazione: AppShell con tab bar 3 tab + ProfileButton flottante
   + command palette search.
   Tab: Scopri(/explore) · Crea(/crea) · Impara(/learn) — Profilo(/profile) via avatar
   D-037 (Matteo, 24/10/2026): Scopri è la prima tab e la pagina d'ingresso,
   «/» porta lì; Crea è su /crea.
   Search: ⌘K overlay (no tab dedicato)
   Dettaglio: /recipe/:styleId (non-tab)
   Tool: /dev, /design-system, /cms (nascosti dalla tab bar; solo con
   TOOLS_ENABLED, cioè in sviluppo e nell'ambiente di test: P-1)

   Budget D-059 (ondata 3, 29/10/2026): router dichiarativo (<BrowserRouter>,
   App.tsx) al posto del data router. L'app non usa loader, action né fetcher:
   createBrowserRouter portava nel bundle tutto il motore dei dati di
   react-router. Le pagine sono React.lazy; i vecchi `loader: redirect()`
   diventano voci `redirect` (<Navigate replace>). */

import { lazy, type ComponentType, type LazyExoticComponent } from "react";
import { matchPath } from "react-router";
import { TOOLS_ENABLED } from "./config/tools";

export type AppRoute =
  | { path: string; Component: LazyExoticComponent<ComponentType> }
  | { path: string; redirect: string };

/** Pagina caricata solo quando serve (un chunk per pagina). */
function page<K extends string>(load: () => Promise<Record<K, ComponentType>>, name: K) {
  return lazy(async () => ({ default: (await load())[name] }));
}

const DevToolsPage = TOOLS_ENABLED ? page(() => import("./pages/dev"), "DevToolsPage") : null;

/** Figlie di AppShell («/»), nell'ordine in cui React Router le confronta. */
export const APP_ROUTES: AppRoute[] = [
  /* ═══ TAB ROUTES ═══ */
  { path: "/", redirect: "/explore" },
  { path: "crea", Component: page(() => import("./pages/home"), "HomePage") },
  { path: "explore", Component: page(() => import("./pages/explore"), "ExplorePage") },
  { path: "learn", Component: page(() => import("./pages/learn"), "LearnPage") },
  { path: "learn/glossary", Component: page(() => import("./pages/glossary"), "GlossaryPage") },
  { path: "learn/troubleshooting", Component: page(() => import("./pages/troubleshooting"), "default") },
  { path: "learn/pre-ferments", Component: page(() => import("./pages/pre-ferments"), "PreFermentsPage") },
  /* FW-15 (D-D): «Metodo e fonti», un'ancora per nota del registro (#yeast-dose). */
  { path: "learn/metodo", Component: page(() => import("./pages/method"), "MethodPage") },
  { path: "profile", Component: page(() => import("./pages/profile"), "ProfilePage") },

  // Shared media CMS is available in production; its API requires an editor session.
  { path: "cms/foto", Component: page(() => import("./features/cms/photo-library"), "PhotoLibraryPage") },

  /* ═══ DETAIL ROUTES ═══ */
  { path: "recipe/:styleId", Component: page(() => import("./pages/recipe"), "RecipePage") },

  /* ═══ TOOL ROUTES (hidden from tab bar) ═══
     In produzione l'array è vuoto già in compilazione: /dev, /cms e
     /design-system finiscono sul 404 e i loro chunk non vengono emessi. */
  ...(TOOLS_ENABLED && DevToolsPage
    ? [
        { path: "dev", Component: DevToolsPage },
        { path: "dev/:tab", Component: DevToolsPage },
        { path: "design-system", Component: page(() => import("./pages/design-system"), "DesignSystemPage") },
        { path: "cms", Component: page(() => import("./pages/cms"), "CmsPage") },
      ]
    : []),

  /* ═══ LEGACY REDIRECTS ═══ */
  { path: "search", redirect: "/explore" },
  { path: "styles", redirect: "/explore" },
  /* "Pizza Patate e Porchetta" non è più uno stile: è la Spaccata con la
     farcitura patate&porchetta. Vecchi link → spaccata con topping pre-scelto. */
  { path: "recipe/pizza_patate_porchetta", redirect: "/recipe/pizza_spaccata?topping=patate_porchetta" },
  { path: "troubleshooting", redirect: "/learn/troubleshooting" },
  { path: "glossary", redirect: "/learn/glossary" },
  { path: "pre-ferments", redirect: "/learn/pre-ferments" },
];

/* ═══ CATCH-ALL ═══ */
export const NotFoundPage = page(() => import("./pages/not-found"), "NotFoundPage");

/** FW-12 (S01-A-08): vero se nessuna rotta risponde (RouteTitle → «Pagina non trovata»). */
export function isNotFoundPath(pathname: string): boolean {
  return !APP_ROUTES.some((route) => matchPath({ path: route.path.startsWith("/") ? route.path : `/${route.path}`, end: true }, pathname));
}
