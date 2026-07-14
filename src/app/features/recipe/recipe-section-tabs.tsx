import { motion } from "motion/react";
import { ListChecks, Utensils, ChefHat } from "lucide-react";
import { type ComponentType } from "react";
import { useCms } from "../cms/cms-context";
import { SearchButton } from "../../components/shared/search-button";
import { motionSpring } from "../../components/ds/motion";

export type RecipePrimaryTab = "ricetta" | "procedimento" | "condimento";

type RecipeTabMeta = {
  id: RecipePrimaryTab;
  label: string;
  subtitle?: string;
  icon: ComponentType<any>;
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
  stickyTop?: 44 | 56 | 64;
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
        <div className="section-tabs-fade" />
        <motion.div
          className="section-tabs-dock"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={motionSpring.liquid}
        >
          <div className="section-tabs-dock__grid">
            <div className="section-tabs-dock__tabs">
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
              size="md"
              onOpen={openSearch}
              className="section-tabs-dock__search"
            />
          </div>
        </motion.div>
      </>
    );
  }

  return (
    <div
      className={navbar
        ? "section-tabs-wrap section-tabs-wrap--navbar"
        : `section-tabs-wrap section-tabs-wrap--inline${sticky ? " section-tabs-wrap--sticky" : ""}${stickyTop === 56 ? " section-tabs-wrap--below-subheader" : stickyTop === 64 ? " section-tabs-wrap--below-header" : ""}`}
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
      className={`section-tabs-capsule${navbar ? " section-tabs-capsule--navbar" : ""}${hasSubtitles ? " section-tabs-capsule--subtitles" : ""}`}
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
            transition={motionSpring.quick}
            className={`section-tabs-capsule__tab${navbar ? " section-tabs-capsule__tab--navbar" : ""}${hasSubtitles ? " section-tabs-capsule__tab--subtitles" : ""}${active ? " section-tabs-capsule__tab--active" : ""}`}
          >
            {active && (
              <motion.span
                layoutId={navbar ? "recipe-bottom-tab-indicator" : "recipe-primary-tab-pill"}
                className={`section-tabs-capsule__indicator${navbar ? " section-tabs-capsule__indicator--navbar" : ""}`}
                transition={motionSpring.liquid}
              />
            )}
            <div className={`section-tabs-capsule__content${navbar ? " section-tabs-capsule__content--navbar" : ""}`}>
              {!navbar && (
                <TabIcon
                  size={14}
                  className={`section-tabs-capsule__icon${active ? " section-tabs-capsule__icon--active" : ""}`}
                />
              )}
              <div className={`section-tabs-capsule__text${navbar ? " section-tabs-capsule__text--navbar" : ""}`}>
                <span className="section-tabs-capsule__label">
                  {tab.label}
                </span>
                {hasSubtitles && tab.subtitle && (
                  <span
                    className={`section-tabs-capsule__subtitle${navbar ? " section-tabs-capsule__subtitle--navbar" : ""}${active ? " section-tabs-capsule__subtitle--active" : ""}`}
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
