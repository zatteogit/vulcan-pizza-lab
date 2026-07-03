/* === ROUTE CONFIG — VPL-056 / VPL-072 ===
   Ristrutturazione: AppShell con tab bar 3 tab + ProfileButton flottante
   + command palette search.
   Tab: Crea(/) · Scopri(/explore) · Impara(/learn) — Profilo(/profile) via avatar
   Search: ⌘K overlay (no tab dedicato)
   Dettaglio: /recipe/:styleId (non-tab)
   Tool: /dev, /design-system, /cms (nascosti dalla tab bar) */

import { createBrowserRouter, redirect } from "react-router";
import { AppShell } from "./components/shared/app-shell";

function RouteHydrateFallback() {
  return null;
}

export const router = createBrowserRouter([
  {
    path: "/",
    Component: AppShell,
    HydrateFallback: RouteHydrateFallback,
    children: [
      /* ═══ TAB ROUTES ═══ */
      {
        index: true,
        lazy: async () => ({ Component: (await import("./pages/home")).HomePage }),
      },
      {
        path: "explore",
        lazy: async () => ({ Component: (await import("./pages/explore")).ExplorePage }),
      },
      {
        path: "learn",
        lazy: async () => ({ Component: (await import("./pages/learn")).LearnPage }),
      },
      {
        path: "learn/glossary",
        lazy: async () => ({ Component: (await import("./pages/glossary")).GlossaryPage }),
      },
      {
        path: "learn/troubleshooting",
        lazy: async () => ({ Component: (await import("./pages/troubleshooting")).default }),
      },
      {
        path: "learn/pre-ferments",
        lazy: async () => ({ Component: (await import("./pages/pre-ferments")).PreFermentsPage }),
      },
      {
        path: "profile",
        lazy: async () => ({ Component: (await import("./pages/profile")).ProfilePage }),
      },

      /* ═══ DETAIL ROUTES ═══ */
      {
        path: "recipe/:styleId",
        lazy: async () => ({ Component: (await import("./pages/recipe")).RecipePage }),
      },

      /* ═══ TOOL ROUTES (hidden from tab bar) ═══ */
      {
        path: "dev",
        lazy: async () => ({ Component: (await import("./pages/dev")).DevToolsPage }),
      },
      {
        path: "dev/:tab",
        lazy: async () => ({ Component: (await import("./pages/dev")).DevToolsPage }),
      },
      {
        path: "design-system",
        lazy: async () => ({ Component: (await import("./pages/design-system")).DesignSystemPage }),
      },
      {
        path: "cms",
        lazy: async () => ({ Component: (await import("./pages/cms")).CmsPage }),
      },

      /* ═══ LEGACY REDIRECTS ═══ */
      { path: "search", loader: () => redirect("/") },
      { path: "styles", loader: () => redirect("/explore") },
      /* "Pizza Patate e Porchetta" non è più uno stile: è la Spaccata con la
         farcitura patate&porchetta. Vecchi link → spaccata con topping pre-scelto. */
      {
        path: "recipe/pizza_patate_porchetta",
        loader: () => redirect("/recipe/pizza_spaccata?topping=patate_porchetta"),
      },
      {
        path: "troubleshooting",
        loader: () => redirect("/learn/troubleshooting"),
      },
      {
        path: "glossary",
        loader: () => redirect("/learn/glossary"),
      },
      {
        path: "pre-ferments",
        loader: () => redirect("/learn/pre-ferments"),
      },

      /* ═══ CATCH-ALL ═══ */
      {
        path: "*",
        lazy: async () => ({ Component: (await import("./pages/not-found")).NotFoundPage }),
      },
    ],
  },
]);
