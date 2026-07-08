import { motion } from "motion/react";
import { ListChecks, Utensils, ChefHat } from "lucide-react";
import { type CSSProperties, type ComponentType } from "react";
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
  subtitle?: string;
  icon: ComponentType<any>;
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
  fillingMode = false,
  recipeSubtitle,
  procedureSubtitle,
  toppingSubtitle,
}: {
  activeTab: RecipePrimaryTab;
  recipeLabel: string;
  onChange: (tab: RecipePrimaryTab) => void;
  sticky?: boolean;
  variant?: "inline" | "navbar";
  stickyTop?: number;
  onSearchOpen?: () => void;
  /** Stili farciti → la tab "Condimento" diventa "Farcitura". */
  fillingMode?: boolean;
  recipeSubtitle?: string;
  procedureSubtitle?: string;
  toppingSubtitle?: string;
}) {
  const navbar = variant === "navbar";
  const { cms } = useCms();

  const toppingLabel = fillingMode
    ? cms.cooking.fillingTitle ?? cms.cooking.toppingTitle
    : cms.cooking.toppingTitle;
  const tabs: RecipeTabMeta[] = [
    { 
      id: "ricetta", 
      label: navbar ? cms.cooking.tabRecipe : recipeLabel, 
      icon: ChefHat,
      subtitle: recipeSubtitle
    },
    { 
      id: "procedimento", 
      label: cms.cooking.tabProcedure, 
      icon: ListChecks,
      subtitle: procedureSubtitle
    },
    { 
      id: "condimento", 
      label: toppingLabel, 
      icon: Utensils,
      subtitle: toppingSubtitle
    },
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
      <>
        <div
          className="fixed bottom-0 inset-x-0 z-40 pointer-events-none md:hidden"
          style={{
            height: "calc(112px + env(safe-area-inset-bottom, 0px))",
            background:
              "linear-gradient(to top, var(--container-page) 0%, var(--container-page) 46%, color-mix(in srgb, var(--container-page) 88%, transparent) 72%, transparent 100%)",
          }}
        />
        <motion.div
          className="fixed left-0 right-0 z-50 px-2 pointer-events-none md:hidden"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={liquidDockSpring}
          style={{ bottom: "calc(var(--space-6, 24px) + env(safe-area-inset-bottom, 0px))" }}
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
                recipeSubtitle={recipeSubtitle}
                procedureSubtitle={procedureSubtitle}
                toppingSubtitle={toppingSubtitle}
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
      </>
    );
  }

  return (
    <div
      className={
        navbar
          ? "fixed left-1/2 z-50"
          : `max-w-4xl mx-auto pt-4 sm:pt-5 mb-6 md:mb-8 ${sticky ? "sticky z-30" : ""}`
      }
      style={
        navbar
          ? {
              transform: "translateX(-50%)",
              width: "min(360px, calc(100vw - 32px))",
              bottom: "calc(var(--space-6, 24px) + env(safe-area-inset-bottom, 0px))",
            }
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
        recipeSubtitle={recipeSubtitle}
        procedureSubtitle={procedureSubtitle}
        toppingSubtitle={toppingSubtitle}
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
  recipeSubtitle,
  procedureSubtitle,
  toppingSubtitle,
}: {
  tabs: RecipeTabMeta[];
  activeTab: RecipePrimaryTab;
  navbar: boolean;
  onTabChange: (tab: RecipePrimaryTab) => void;
  ariaLabel: string;
  recipeSubtitle?: string;
  procedureSubtitle?: string;
  toppingSubtitle?: string;
}) {
  const hasSubtitles = Boolean(recipeSubtitle || procedureSubtitle || toppingSubtitle);

  return (
    <nav
      data-region="filters"
      className="relative flex w-full items-center overflow-hidden rounded-full"
      style={{
        ...tabsDockSurfaceStyle,
        minHeight: navbar ? (hasSubtitles ? 58 : 52) : undefined,
        padding: navbar ? 4 : "var(--space-1)",
        borderRadius: "999px",
      }}
      role="tablist"
      aria-label={ariaLabel}
    >
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
            whileHover={{ scale: 1.015 }}
            whileTap={{ scale: 0.965 }}
            transition={liquidDockQuickSpring}
            className="relative flex flex-1 items-center justify-center rounded-full"
            style={{
              minHeight: navbar ? (hasSubtitles ? 48 : 44) : (hasSubtitles ? "clamp(52px, 8vw, 60px)" : "clamp(42px, 6vw, 48px)"),
              minWidth: 0,
              overflow: "hidden",
              padding: navbar ? "0 1px" : "var(--space-1) clamp(var(--space-1-5), 2vw, var(--space-3))",
              border: "none",
              background: "transparent",
              color: active ? "var(--text-default)" : "var(--text-muted)",
              cursor: "pointer",
              fontSize: navbar
                ? "clamp(0.63rem, 2.65vw, 0.8rem)"
                : "clamp(var(--font-size-md), 2.8vw, var(--font-size-lg))",
              fontWeight: (active ? "var(--weight-semibold)" : "var(--weight-medium)") as CSSProperties["fontWeight"],
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
            <div 
              className="relative z-10 flex items-center justify-center min-w-0" 
              style={{
                flexDirection: navbar ? "column" : "row",
                gap: navbar ? "1px" : "var(--space-2, 8px)",
                textAlign: navbar ? "center" : "left",
              }}
            >
              {!navbar && (
                <TabIcon 
                  size={14} 
                  style={{ 
                    flexShrink: 0, 
                    position: "relative",
                    opacity: active ? 0.9 : 0.6 
                  }} 
                />
              )}
              <div 
                className="flex flex-col min-w-0"
                style={{ 
                  alignItems: navbar ? "center" : "flex-start",
                  lineHeight: 1.15
                }}
              >
                <span className="truncate max-w-full font-semibold">
                  {tab.label}
                </span>
                {hasSubtitles && tab.subtitle && (
                  <span 
                    className="truncate max-w-full font-normal"
                    style={{
                      /* Audit lug 2026: 0.58rem (~9px) era sotto ogni soglia di
                         leggibilità — 0.68rem è il pavimento accettabile. */
                      fontSize: navbar ? "0.68rem" : "clamp(var(--font-size-xs), 1.8vw, var(--font-size-sm))",
                      opacity: active ? 0.85 : 0.6,
                      marginTop: "1px"
                    }}
                  >
                    {tab.subtitle}
                  </span>
                )}
              </div>
            </div>
          </motion.button>
        );
      })}
    </nav>
  );
}
