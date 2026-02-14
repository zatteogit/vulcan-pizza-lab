import React from "react";
import { useNavigate } from "react-router";
import { DevTools } from "../components/dev-tools";
import { useDarkMode } from "../components/root-layout";

export function DevToolsPage() {
  const navigate = useNavigate();
  const { darkMode } = useDarkMode();

  return (
    <DevTools
      onClose={() => navigate("/")}
      darkMode={darkMode}
    />
  );
}
