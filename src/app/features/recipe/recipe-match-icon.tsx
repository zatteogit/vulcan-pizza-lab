import { Heart, HeartCrack, HeartHandshake, HeartOff, HeartPulse, type LucideProps } from "lucide-react";

/** Affinity is the score's visual language; saving keeps the bookmark icon. */
export function RecipeMatchIcon({ score, blocked = false, ...props }: LucideProps & { score: number; blocked?: boolean }) {
  const Icon = blocked || score < 40 ? HeartOff : score < 60 ? HeartCrack : score < 75 ? HeartPulse : score < 90 ? Heart : HeartHandshake;
  return <Icon {...props} />;
}
