/* FW-16 (S16-A-14) — la dispensa nel Profilo: riepilogo in sola lettura e
 * collegamento al pannello Dispensa di Crea, dove si modifica. */
import { ChevronRight } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";
import { useCms } from "../cms/cms-context";
import { loadProfileDefaults } from "../../hooks/use-profile-defaults";

export function PantrySummary() {
  const { cms } = useCms();
  const [pantry] = useState(() => {
    const { constraints } = loadProfileDefaults();
    return { flours: constraints.pantry_flours, yeasts: constraints.pantry_yeasts };
  });
  const names = [
    ...pantry.flours.map((id) => cms.flourLabels[id] ?? id),
    ...pantry.yeasts.map((id) => cms.yeastLabels[id] ?? id),
  ];
  return (
    <section className="profile-pantry-summary" data-region="pantry-summary" aria-label={cms.profile.pantryTitle}>
      {names.length > 0 ? (
        <ul className="profile-pantry-summary__list">
          {names.map((name) => (
            <li key={name} className="type-data-xs profile-pantry-summary__item">{name}</li>
          ))}
        </ul>
      ) : (
        <p className="type-data-sm profile-pantry-summary__empty">{cms.profile.pantryProfileEmpty}</p>
      )}
      <Link to="/crea?panel=pantry" className="profile-pantry-summary__edit">
        {cms.profile.pantryProfileEdit}
        <ChevronRight size={16} aria-hidden="true" />
      </Link>
    </section>
  );
}
