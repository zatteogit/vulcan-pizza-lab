import { RecommendedStyles } from "@figma/my-make-file";

const constraints = {
  oven_type: "home",
  oven_max_temp_c: 250,
  skill_level: 2,
  available_hours: 24,
  dough_balls: 4,
  has_mixer: false,
  has_pizza_stone: false,
  has_pizza_steel: false,
  has_baking_pan: false,
  dietary_filters: [],
  pantry_flours: [],
  pantry_yeasts: [],
};

export function Recommendations() {
  return (
    <div style={{ width: 520 }}>
      <RecommendedStyles constraints={constraints as any} selectedStyle={null} onSelectStyle={() => {}} />
    </div>
  );
}
