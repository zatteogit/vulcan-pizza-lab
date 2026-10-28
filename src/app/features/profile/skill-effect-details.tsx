/* FW-16 — «Cosa cambia per ogni livello»: i tetti e i prefermenti arrivano dal
 * motore (skillEffectFacts), le parole dal CMS. Etichettato come regola del
 * modello, non legge fisica (S15-A-02, S16-A-06). */
import { ChevronDown } from "lucide-react";
import { useMemo } from "react";
import { useCms } from "../cms/cms-context";
import { createFormatter, t } from "../cms/i18n";
import { skillEffectFacts } from "../../use-cases/setting-effects";

export function SkillEffectDetails() {
  const { cms, bcp47 } = useCms();
  const p = cms.profile;
  const fmt = useMemo(() => createFormatter(cms.ui, bcp47), [cms.ui, bcp47]);
  return (
    <details className="setting-effect-details" data-region="setting-effect-details">
      <summary className="setting-effect-details__summary">
        {p.skillEffectSummary}
        <ChevronDown size={16} aria-hidden="true" className="setting-effect-details__chevron" />
      </summary>
      <ul className="setting-effect-details__list">
        {skillEffectFacts().map((fact) => (
          <li key={fact.level} className="setting-effect-details__item">
            {t(p.skillEffectLine, {
              name: cms.skillLevels[String(fact.level)]?.name ?? String(fact.level),
              hydration: fact.hydrationCeilingPct === null
                ? p.skillEffectNoCeiling
                : t(p.skillEffectHydration, { h: fmt.percent(fact.hydrationCeilingPct) }),
              preferment: fact.offersPreFerment ? p.skillEffectPreFerment : p.skillEffectNoPreFerment,
            })}
          </li>
        ))}
      </ul>
      <p className="setting-effect-details__rule">{p.skillEffectRule}</p>
    </details>
  );
}
