import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { MotionConfig } from "motion/react";
import type { VisualQuality } from "../domain/visual-quality";
import { monitorVisualQuality } from "../adapters/browser/visual-quality-monitor";

const VisualQualityContext = createContext({ quality: "full" as VisualQuality, visible: true, reducedMotion: false });

export function VisualQualityProvider({ children }: { children: ReactNode }) {
  const [quality, setQuality] = useState<VisualQuality>("full");
  const [visible, setVisible] = useState(() => typeof document === "undefined" || !document.hidden);
  const [reducedMotion, setReducedMotion] = useState(() => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
  useEffect(() => monitorVisualQuality(setQuality), []);
  useEffect(() => {
    const update = () => setVisible(!document.hidden);
    document.addEventListener("visibilitychange", update);
    return () => document.removeEventListener("visibilitychange", update);
  }, []);
  useEffect(() => {
    const root = document.documentElement;
    root.dataset.visualQuality = quality;
    return () => { delete root.dataset.visualQuality; };
  }, [quality]);
  return <VisualQualityContext.Provider value={{ quality, visible, reducedMotion }}>
    <MotionConfig reducedMotion={reducedMotion ? "always" : "never"}>{children}</MotionConfig>
  </VisualQualityContext.Provider>;
}

/** Decorative motion only: controls, disclosures and navigation retain their
 * interaction feedback. Explicit accessibility preferences always prevail. */
export function useDecorativeMotion(): boolean {
  const { quality, visible, reducedMotion } = useContext(VisualQualityContext);
  return visible && quality === "full" && !reducedMotion;
}

/** Reactive preference: the installed Motion hook snapshots it only at mount. */
export function useVisualMotionPreference(): boolean {
  return useContext(VisualQualityContext).reducedMotion;
}
