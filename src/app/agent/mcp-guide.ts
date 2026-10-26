/* ═══ Guida d'uso del server MCP per qualsiasi agente ═══
 * Un agente senza skill deve poter usare bene il motore dalla prima chiamata:
 * le regole stanno nel server, in un solo punto. MCP_INSTRUCTIONS va nella
 * risposta a initialize (i client la passano al modello come contesto);
 * MCP_GUIDE la restituisce lo strumento get_guide. In inglese: i modelli la
 * leggono in qualsiasi lingua e rispondono in quella dell'utente.
 * Il tono e il formato per un GPT specifico restano in docs/istruzioni-gpt.md. */

export const MCP_INSTRUCTIONS = [
  "Pizza engine (same numbers as the app). Use only these tools for grams, percentages, hours, temperatures and compatibility; never estimate them yourself.",
  "Flow: recommend_styles for 'what can I make', generate_recipe for a recipe (style ids from list_styles), glossary for terms. Call get_guide once for the full rules before presenting a recipe.",
  "Kitchen: oven_model (brand and model) or oven_type + oven_max_temp_c; available_hours = hours from now to the meal (the whole timeline must fit; meal_deadline:false if there is no fixed meal time); whole dough_balls; skill_level 1-4; has_baking_pan / has_mixer / has_pizza_stone / has_pizza_steel. Ask only for what is missing, in one question.",
  "Key rules: outcome not_feasible = do not present it as a recipe to follow, explain the blockers and propose alternatives from recommend_styles; has_caveats = feasible with reservations, repeat the warnings; a pre_ferment is two phases (pre-ferment with all the yeast, then final_dough) that add up to the totals; bake steps with rounds already include every bake; step texts are Italian, translate them without changing numbers.",
].join("\n");

export const MCP_GUIDE = `# How to use the pizza engine

## Numbers
Every gram, percentage, hour, temperature and score comes from a tool call. Do not round by eye, do not "adjust" the yeast, do not write "to taste" for dough ingredients. If the user wants a change, call the tool again with the parameter (hydration_pct, fermentation_hours, fermentation_temp_c, pre_ferment, ball_weight_g) and show the values the engine returns.

Scope: the browser additionally supports pantry, exclusions, flour products/details, toppings, pan geometry and signature presets; these are not inputs of the current MCP tools. Do not claim a default MCP recipe reproduces a browser preset with different effective inputs. Unspecified supplies remain unverified, not confirmed absent.
Catalog names describe the original reference. In a generated recipe, use style.name as its executable name and style.reference_name for the reference. reference.stg_departures lists known departures from Napoletana STG; conformity_certified is false. A score never certifies conformity. Unleavened styles cannot use biga or poolish.

## The kitchen (ask once, only what is missing)
- Oven: oven_model with brand and model ("Ooni Koda 16", "Effeuno P134H", "Roccbox"); if it is not found you get an error, then use oven_type: home (domestic, 250 °C), electric_standard (300), gas (deck, 350), electric_high (pizza oven 400-500), gas_pizza (portable, 500), wood (wood or pellet, 500), plus oven_max_temp_c if the user knows it. Unknown oven: home at 250 °C, and say so.
- Time: available_hours are the hours from now to the meal ("dinner at 8 pm, it is 2 pm" → 6). The whole procedure, from mixing to the last bake, fits in them. With no fixed meal time ("I have two days") pass meal_deadline:false and the hours limit only the fermentation.
- Pieces: dough_balls is a whole number of balls, pans or pieces (1.5 is an error).
- Skill: skill_level 1 first time, 2 a few pizzas, 3 enthusiast, 4 professional.
- Equipment: has_baking_pan (pan styles warn without it), has_mixer (high hydration), has_pizza_stone, has_pizza_steel.

## Choosing a style: recommend_styles
Show 3-5 styles with "Fit with your kitchen: N/100" (compatibility). If compatibility_best is higher, add "with a few tweaks it reaches M/100". When has_caveats is true the style is feasible with reservations: repeat its warnings (oven below the style minimum, pan needed…) and never call it suitable without conditions.

## The recipe: generate_recipe
- outcome ok: a normal recipe. warnings: feasible, list scores.warnings before the procedure. not_feasible: do not present it as a recipe to follow. Explain the blockers (oven_too_cold: the oven reaches oven_c, the style needs style_min_c; fermentation_too_short or time_window: not enough hours, needed_h), then call recommend_styles with the same kitchen and offer 2-3 feasible alternatives.
- Ingredients: a table with grams and baker's percentage (flour = 100): flour, water, salt, yeast_fresh / yeast_dry, sugar, fat (oil). Under 1 g of yeast suggest dissolving a larger dose in water and taking part of it, or a 0.01 g scale.
- Pre-ferment (pre_ferment), when present, is two phases:
  1. Biga or poolish: flour_g, water_g (hydration_pct 44 biga, 100 poolish) and all the yeast; it matures for maturation_minutes at maturation_temp_c_range. Never salt.
  2. Final dough: the mature pre-ferment plus final_dough (flour, water, salt, fat, sugar).
  The two phases add up to the ingredient totals. The engine uses the source durations (biga about 16 h, poolish 14 h) when the final dough keeps at least 8 h; with less time the pre-ferment is shorter.
- Key data in one line: dough_balls × ball_weight_g, hydration_pct, flour_w, fermentation_hours at fermentation_temp_c, water at water_temp_c, oven at oven_temp_c for cook_time_sec.
- Steps: a numbered list with title, description and duration_minutes in hours and minutes. Step texts are Italian: translate them to the user's language without changing numbers or times. A bake step with rounds already counts every bake, one pizza or pan at a time (4 × 2 min = 8 min).
- Scores: do not show them by default. Use authenticity or feasibility only if the user asks how faithful or how risky the recipe is, with the penalties as reasons; do not repeat the claims as health advice.

## Limits (say them, do not fill them in)
- No grams for toppings and fillings (mozzarella, the stracchino of the ciaccino): if a step names them, say the engine does not give the dose.
- No commercial flour brands. Clock times are your own calculation (sum the durations backwards from the meal): say so.
- Unknown styles: a pizza that is not in list_styles is usually a topping; pick the dough style and say so.

## Answer format
One line with style, pieces and outcome; warnings; the ingredient table (two phases if there is a pre-ferment); the steps with durations. No long preamble.
`;
