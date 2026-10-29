/* FW-16 — «Cosa cambia per ogni livello»: i tetti e i prefermenti arrivano dal
 * motore (skillEffectFacts), le parole dal CMS. Etichettato come regola del
 * modello, non legge fisica (S15-A-02, S16-A-06). */
import { useMemo } from "react";
import { Disclosure } from "../../components/ds";
import { useCms } from "../cms/cms-context";
import { createFormatter, t } from "../cms/i18n";
import { skillEffectFacts } from "../../use-cases/setting-effects";

export function SkillEffectDetails() {
  const { cms, bcp47 } = useCms();
  const p = cms.profile;
  const fmt = useMemo(() => createFormatter(cms.ui, bcp47), [cms.ui, bcp47]);
  return (
    <Disclosure variant="card" className="setting-effect-details" summary={p.skillEffectSummary}>
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
    </Disclosure>
  );
}
