import { useNavigate,useParams } from "react-router";
import { DevTools } from "../features/dev-tools/dev-tools";
import { useDarkMode } from "../components/shared/root-layout";

export function DevToolsPage() {
  const navigate = useNavigate();
  const { tab } = useParams<{ tab?: string }>();
  const { darkMode, setDarkMode } = useDarkMode();

  return (
    <DevTools
      onClose={() => navigate("/")}
      darkMode={darkMode}
      setDarkMode={setDarkMode}
      initialTab={tab}
    />
  );
}