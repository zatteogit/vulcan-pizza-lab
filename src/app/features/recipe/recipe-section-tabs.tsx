import { motion } from "motion/react";
import { ListChecks, ScrollText, Utensils } from "lucide-react";
import { type CSSProperties } from "react";
import { useCms } from "../cms/cms-context";
import { SearchButton } from "../../components/shared/search-button";
import {
  liquidDockButtonStyle,
  liquidDockQuickSpring,
  liquidDockSpring,
  liquidDockSurfaceStyle,
} from "../../domain/liquid-dock";

export type RecipePrimaryTab = "ricetta" | "procedimento" | "condimento";

type RecipeTabMeta = {
  id: RecipePrimaryTab;
  label: string;
  icon: typeof ScrollText;
};

const roundDockButtonStyle: CSSProperties = {
  ...liquidDockButtonStyle,
  width: 52,
  height: 52,
  borderRadius: "999px",
  background:
    "linear-gradient(180deg, color-mix(in srgb, var(--container-page) 97%, transparent), color-mix(in srgb, var(--container-page) 91%, transparent))",
  boxShadow:
    "0 14px 34px color-mix(in srgb, var(--shadow-color) 12%, transparent), inset 0 1px 0 color-mix(in srgb, var(--overlay-text) 24%, transparent), inset 0 -1px 0 color-mix(in srgb, var(--text-default) 4%, transparent)",
};

const tabsDockSurfaceStyle: CSSProperties = {
  ...liquidDockSurfaceStyle,
  background:
    "linear-gradient(180deg, color-mix(in srgb, var(--container-page) 97%, transparent), color-mix(in srgb, var(--container-page) 92%, transparent))",
  border: "1px solid color-mix(in srgb, var(--text-default) 8%, transparent)",
  boxShadow:
    "0 16px 36px color-mix(in srgb, var(--shadow-color) 12%, transparent), inset 0 1px 0 color-mix(in srgb, var(--overlay-text) 24%, transparent), inset 0 -1px 0 color-mix(in srgb, var(--text-default) 4%, transparent)",
};

const activeSegmentStyle: CSSProperties = {
  background:
    "linear-gradient(180deg, color-mix(in srgb, var(--primary) 13%, var(--container-page)), color-mix(in srgb, var(--primary) 7%, var(--container-page)))",
  border: "1px solid color-mix(in srgb, var(--primary) 18%, transparent)",
  boxShadow:
    "0 8px 18px color-mix(in srgb, var(--primary) 10%, transparent), inset 0 1px 0 color-mix(in srgb, var(--overlay-text) 22%, transparent)",
};

export function RecipeSectionTabs({
  activeTab,
  recipeLabel,
  onChange,
  sticky = true,
  variant = "inline",
  stickyTop,
  onSearchOpen,
}: {
  activeTab: RecipePrimaryTab;
  recipeLabel: string;
  onChange: (tab: RecipePrimaryTab) => void;
  sticky?: boolean;
  variant?: "inline" | "navbar";
  stickyTop?: number;
  onSearchOpen?: () => void;
}) {
  const navbar = variant === "navbar";
  const { cms } = useCms();

  const tabs: RecipeTabMeta[] = [
    { id: "ricetta", label: navbar ? cms.cooking.tabRecipe : recipeLabel, icon: ScrollText },
    { id: "procedimento", label: cms.cooking.tabProcedure, icon: ListChecks },
    { id: "condimento", label: cms.cooking.toppingTitle, icon: Utensils },
  ];

  const handleTabChange = (tab: RecipePrimaryTab) => {
    onChange(tab);
  };

  const openSearch = () => {
    onSearchOpen?.();
    window.dispatchEvent(new CustomEvent("vulcan:open-search"));
  };

  if (navbar && onSearchOpen) {
    return (
      <motion.div
        className="fixed bottom-6 left-0 right-0 z-50 px-2 pointer-events-none md:hidden"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={liquidDockSpring}
      >
        <div
          className="mx-auto grid w-full max-w-[440px] items-center gap-1.5"
          style={{ gridTemplateColumns: "minmax(0, 1fr) 52px" }}
        >
          <div className="pointer-events-auto min-w-0">
            <TabsCapsule
              tabs={tabs}
              activeTab={activeTab}
              navbar
              onTabChange={handleTabChange}
              ariaLabel={cms.cooking.sectionsAria}
            />
          </div>

          <SearchButton
            diameter={52}
            onOpen={openSearch}
            surfaceStyle={roundDockButtonStyle}
            className="pointer-events-auto"
          />
        </div>
      </motion.div>
    );
  }

  return (
    <div
      className={
        navbar
          ? "fixed bottom-6 left-1/2 z-50"
          : `max-w-4xl mx-auto pt-4 sm:pt-5 mb-6 md:mb-8 ${sticky ? "sticky z-30" : ""}`
      }
      style={
        navbar
          ? { transform: "translateX(-50%)", width: "min(360px, calc(100vw - 32px))" }
          : sticky
            ? { top: stickyTop ?? 44 }
            : undefined
      }
    >
      <TabsCapsule
        tabs={tabs}
        activeTab={activeTab}
        navbar={navbar}
        onTabChange={handleTabChange}
        ariaLabel={cms.cooking.sectionsAria}
      />
    </div>
  );
}

function TabsCapsule({
  tabs,
  activeTab,
  navbar,
  onTabChange,
  ariaLabel,
}: {
  tabs: RecipeTabMeta[];
  activeTab: RecipePrimaryTab;
  navbar: boolean;
  onTabChange: (tab: RecipePrimaryTab) => void;
  ariaLabel: string;
}) {
  return (
    <nav
      className="relative flex w-full items-center overflow-hidden rounded-full"
      style={{
        ...tabsDockSurfaceStyle,
        minHeight: navbar ? 52 : undefined,
        padding: navbar ? 4 : "var(--space-1)",
        borderRadius: "999px",
      }}
      role="tablist"
      aria-label={ariaLabel}
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-7 top-0 h-px"
        style={{ background: "color-mix(in srgb, var(--overlay-text) 46%, transparent)", opacity: 0.44 }}
      />
      {tabs.map((tab) => {
        const active = activeTab === tab.id;
        const TabIcon = tab.icon;
        return (
          <motion.button
            key={tab.id}
            type="button"
            onClick={() => onTabChange(tab.id)}
            role="tab"
            aria-selected={active}
            whileHover={{ scale: 1.012 }}
            whileTap={{ scale: 0.965 }}
            transition={liquidDockQuickSpring}
            className="relative flex flex-1 items-center justify-center rounded-full"
            style={{
              minHeight: navbar ? 44 : "clamp(42px, 6vw, 48px)",
              minWidth: 0,
              overflow: "hidden",
              gap: navbar ? 0 : "var(--space-1-5)",
              padding: navbar ? "0 1px" : "0 clamp(var(--space-1), 2vw, var(--space-2-5))",
              border: "none",
              background: "transparent",
              color: active ? "var(--text-default)" : "var(--text-muted)",
              cursor: "pointer",
              fontSize: navbar
                ? "clamp(0.63rem, 2.65vw, 0.8rem)"
                : "clamp(var(--font-size-md), 2.8vw, var(--font-size-lg))",
              fontWeight: "var(--weight-medium)" as CSSProperties["fontWeight"],
              lineHeight: 1,
              textDecoration: "none",
              WebkitTapHighlightColor: "transparent",
            }}
          >
            {active && (
              <motion.span
                layoutId={navbar ? "recipe-bottom-tab-indicator" : "recipe-primary-tab-pill"}
                className="absolute inset-0 rounded-full"
                style={navbar ? activeSegmentStyle : { background: "color-mix(in srgb, var(--primary) 12%, transparent)" }}
                transition={liquidDockSpring}
              />
            )}
            {!navbar && <TabIcon size={14} style={{ flexShrink: 0, position: "relative" }} />}
            <span className="relative truncate max-w-full">{tab.label}</span>
          </motion.button>
        );
      })}
    </nav>
  );
}
