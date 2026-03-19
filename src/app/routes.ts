/* === ROUTE CONFIG — VPL-056 / VPL-072 ===
   Ristrutturazione: AppShell con tab bar 4 tab + command palette search.
   Tab: Crea(/) · Stili(/explore) · Impara(/learn) · Profilo(/profile)
   Search: ⌘K overlay (no tab dedicato)
   Dettaglio: /recipe/:styleId (non-tab)
   Tool: /dev, /design-system, /cms (nascosti dalla tab bar) */

import { createBrowserRouter, redirect } from "react-router";
import { AppShell } from "./components/app-shell";
import { HomePage } from "./pages/home";
import { ExplorePage } from "./pages/explore";
import { LearnPage } from "./pages/learn";
import { ProfilePage } from "./pages/profile";
import { RecipePage } from "./pages/recipe";
import { DevToolsPage } from "./pages/dev";
import { DesignSystemPage } from "./pages/design-system";
import { NotFoundPage } from "./pages/not-found";
import { CmsPage } from "./pages/cms";
import TroubleshootingPage from "./pages/troubleshooting";
import { GlossaryPage } from "./pages/glossary";
import { PreFermentsPage } from "./pages/pre-ferments";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: AppShell,
    children: [
      /* ═══ TAB ROUTES ═══ */
      { index: true, Component: HomePage },
      { path: "explore", Component: ExplorePage },
      { path: "learn", Component: LearnPage },
      { path: "learn/glossary", Component: GlossaryPage },
      {
        path: "learn/troubleshooting",
        Component: TroubleshootingPage,
      },
      {
        path: "learn/pre-ferments",
        Component: PreFermentsPage,
      },
      { path: "profile", Component: ProfilePage },

      /* ═══ DETAIL ROUTES ═══ */
      { path: "recipe/:styleId", Component: RecipePage },

      /* ═══ TOOL ROUTES (hidden from tab bar) ═══ */
      { path: "dev", Component: DevToolsPage },
      { path: "dev/:tab", Component: DevToolsPage },
      { path: "design-system", Component: DesignSystemPage },
      { path: "cms", Component: CmsPage },

      /* ═══ LEGACY REDIRECTS ═══ */
      { path: "search", loader: () => redirect("/") },
      {
        path: "troubleshooting",
        loader: () => redirect("/learn/troubleshooting"),
      },
      {
        path: "glossary",
        loader: () => redirect("/learn/glossary"),
      },

      /* ═══ CATCH-ALL ═══ */
      { path: "*", Component: NotFoundPage },
    ],
  },
]);