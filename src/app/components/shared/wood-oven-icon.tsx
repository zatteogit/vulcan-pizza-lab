import { forwardRef } from "react";
import type { LucideProps } from "lucide-react";

/** A domed oven and its fire, on the same grid and stroke as the UI icons. */
export const WoodOvenIcon = forwardRef<SVGSVGElement, LucideProps>(function WoodOvenIcon(
  { size = 24, color = "currentColor", strokeWidth = 2, absoluteStrokeWidth, ...props }, ref,
) {
  return <svg ref={ref} {...props} width={size} height={size} viewBox="0 0 24 24"
    fill="none" stroke={color} strokeWidth={absoluteStrokeWidth ? Number(strokeWidth) * 24 / Number(size) : strokeWidth}
    strokeLinecap="round" strokeLinejoin="round" data-oven-icon="wood">
    <path d="M2 21h20M3 21v-9a9 9 0 0 1 18 0v9M7 21v-6a5 5 0 0 1 10 0v6" />
    <path d="M12 3v3M6 6l2 2M18 6l-2 2M12 18c-2 0-3-2-1-4 0 1 1 1 1-1 3 3 2 5 0 5ZM10 20h4" />
  </svg>;
});
