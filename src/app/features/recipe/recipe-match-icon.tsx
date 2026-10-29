import { Ban, Gauge, type LucideProps } from "lucide-react";

/** Compatibility with the user's kitchen reads as a gauge, not as a heart:
 * the heart reads as «like» or «favourites» (FW-13, S02-A-12). Saving keeps
 * the bookmark icon. A blocked recipe shows a ban sign. */
export function RecipeMatchIcon({ score: _score, blocked = false, ...props }: LucideProps & { score: number; blocked?: boolean }) {
  const Icon = blocked ? Ban : Gauge;
  return <Icon {...props} />;
}
