import { Ban, Gauge, type LucideProps } from "lucide-react";

/** Compatibility with the user's kitchen reads as a gauge, not as a heart:
 * the heart reads as «like» or «favourites» (FW-13, S02-A-12). Saving keeps
 * the bookmark icon. A blocked recipe shows a ban sign. */
export function RecipeMatchIcon({ score: _score, blocked = false, ...props }: LucideProps & { score: number; blocked?: boolean }) {
  const Icon = blocked ? Ban : Gauge;
  return <Icon {...props} />;
}

/** Esito negativo marcato (nota di Matteo, 30/10/2026): il divieto grande e
 *  pieno in testa al riquadro. Decorativo: l'esito lo dice il titolo accanto. */
export function BlockedMark() {
  return (
    <span className="blocked-mark" aria-hidden="true">
      <Ban size={28} strokeWidth={2.5} />
    </span>
  );
}
