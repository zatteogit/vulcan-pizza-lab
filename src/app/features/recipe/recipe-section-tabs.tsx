import { motion, useReducedMotion, useSpring, useTransform, type MotionStyle } from "motion/react";
import { handleTablistKeyDown, tabIndexFor } from "../../components/ds/tablist-keys";
import { ListChecks, Utensils, ChefHat } from "lucide-react";
import { useEffect, useRef, type ComponentType } from "react";
import { useCms } from "../cms/cms-context";
import { useLiquidNavState } from "../../hooks/use-liquid-nav";
import { useVirtualKeyboard } from "../../hooks/use-virtual-keyboard";
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
  /** Stili farciti → la tab "Condimento" diventa "Farcitura". */
  fillingMode?: boolean;
  recipeSubtitle?: string;
  procedureSubtitle?: string;
  toppingSubtitle?: string;
}) {
  const navbar = variant === "navbar";
  const { cms } = useCms();
  const { compact } = useLiquidNavState(28, navbar);
  const reducedMotion = useReducedMotion();
  const keyboardOpen = useVirtualKeyboard(navbar);
  // A single interruptible spring keeps geometry and fades in sync, including
  // when scroll direction reverses before the previous morph has finished.
  const morph = useSpring(0, motionSpring.navigation);
  const collapse = useTransform(morph, value => Math.min(1, Math.max(0, value)));
  const detailOpacity = useTransform(collapse, value => Math.max(0, 1 - value * 1.7));
  const morphStyle = { "--section-tabs-collapse": collapse, "--section-tabs-detail-opacity": detailOpacity } as MotionStyle;
  const pressing = useRef(false);
  const target = useRef({ compact, reducedMotion });
  useEffect(() => {
    target.current = { compact, reducedMotion };
    if (pressing.current) return;
    if (reducedMotion) morph.jump(compact ? 1 : 0);
    else morph.set(compact ? 1 : 0);
  }, [compact, reducedMotion, morph]);
  useEffect(() => {
    if (!navbar) return;
    const release = () => {
      if (!pressing.current) return;
      pressing.current = false;
      const next = target.current.compact ? 1 : 0;
      if (target.current.reducedMotion) morph.jump(next);
      else morph.set(next);
    };
    window.addEventListener("pointerup", release);
    window.addEventListener("pointercancel", release);
    window.addEventListener("blur", release);
    return () => {
      window.removeEventListener("pointerup", release);
      window.removeEventListener("pointercancel", release);
      window.removeEventListener("blur", release);
    };
  }, [navbar, morph]);

  const toppingLabel = fillingMode
    ? cms.cooking.fillingTitle
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

  if (navbar) {
    return (
      <>
        <motion.div
          className={`section-tabs-dock${compact ? " section-tabs-dock--compact" : ""}`}
          style={morphStyle}
          data-keyboard-open={keyboardOpen || undefined}
          onPointerDownCapture={() => { pressing.current = true; morph.stop(); }}
          initial={reducedMotion ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={reducedMotion ? { duration: 0 } : motionSpring.liquid}
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
          </div>
        </motion.div>
      </>
    );
  }

  return (
    <div
      className={`section-tabs-wrap section-tabs-wrap--inline${sticky ? " section-tabs-wrap--sticky" : ""}${stickyTop === 56 ? " section-tabs-wrap--below-subheader" : stickyTop === 64 ? " section-tabs-wrap--below-header" : ""}`}
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
  const reducedMotion = useReducedMotion();

  return (
    /* U-10 (F13): tablist su un div (su <nav> annullava il landmark), frecce e
       una sola fermata del Tab. Il pannello è #recipe-tabpanel (recipe-view). */
    <div
      data-region="filters"
      className={`section-tabs-capsule${navbar ? " section-tabs-capsule--navbar" : ""}${hasSubtitles ? " section-tabs-capsule--subtitles" : ""}`}
      role="tablist"
      aria-label={ariaLabel}
      onKeyDown={(event) => handleTablistKeyDown(event, tabs.map((tab) => tab.id), activeTab, onTabChange)}
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
            id={`recipe-${navbar ? "navtab" : "tab"}-${tab.id}`}
            data-tab-id={tab.id}
            aria-selected={active}
            aria-label={tab.subtitle ? `${tab.label}: ${tab.subtitle}` : tab.label}
            aria-controls="recipe-tabpanel"
            tabIndex={tabIndexFor(active)}
            whileHover={reducedMotion ? undefined : { scale: 1.015 }}
            whileTap={reducedMotion ? undefined : { scale: 0.965 }}
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
                <span className="section-tabs-capsule__icon" aria-hidden="true">
                  <TabIcon size={14} className={active ? "section-tabs-capsule__icon--active" : undefined} />
                </span>
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
    </div>
  );
}
