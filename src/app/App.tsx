import { RouterProvider } from "react-router";
import { router } from "./routes";
import { VisualQualityProvider } from "./context/visual-quality-context";

export default function App() {
  return (
    <VisualQualityProvider>
      <RouterProvider router={router} />
    </VisualQualityProvider>
  );
}
