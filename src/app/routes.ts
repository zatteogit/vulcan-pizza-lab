import { createBrowserRouter } from "react-router";
import { RootLayout } from "./components/root-layout";
import { HomePage } from "./pages/home";
import { DevToolsPage } from "./pages/dev";
import { NotFoundPage } from "./pages/not-found";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: RootLayout,
    children: [
      { index: true, Component: HomePage },
      { path: "dev", Component: DevToolsPage },
      { path: "*", Component: NotFoundPage },
    ],
  },
]);
