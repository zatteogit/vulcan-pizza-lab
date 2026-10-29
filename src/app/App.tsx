import { BrowserRouter, Navigate, Route, Routes } from "react-router";
import { APP_ROUTES, NotFoundPage, isNotFoundPath } from "./routes";
import { AppShell } from "./components/shared/app-shell";
import { VisualQualityProvider } from "./context/visual-quality-context";

/* Router dichiarativo (budget D-059, ondata 3): le rotte sono in routes.ts,
   le pagine lazy si caricano sotto il Suspense che AppShell tiene attorno
   all'Outlet. */
export default function App() {
  return (
    <VisualQualityProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AppShell isNotFoundPath={isNotFoundPath} />}>
            {APP_ROUTES.map((route) =>
              "redirect" in route ? (
                <Route
                  key={route.path}
                  {...(route.path === "/" ? { index: true } : { path: route.path })}
                  element={<Navigate to={route.redirect} replace />}
                />
              ) : (
                <Route key={route.path} path={route.path} element={<route.Component />} />
              ),
            )}
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </VisualQualityProvider>
  );
}
