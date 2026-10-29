/* === DOMAIN DATA i18n — English === */
import type {
  CmsPreFerment,
  CmsTroubleshootingI18n,
  CmsGlossaryTerms,
  CmsScience,
} from "../cms-context";

export const PRE_FERMENT_EN: Partial<CmsPreFerment> = {
  sectionLabel: "Preferment",
  tipsLabel: "Tips",
  showComparison: "Compare biga, poolish and autolyse",
  paramHydration: "Hydration",
  paramDuration: "Duration",
  paramTemperature: "Temperature",
  paramYeast: "Fresh yeast",
  detailFermentation: "Fermentation",
  detailFlavor: "Flavour",
  detailCrust: "Crust",
  detailExtensibility: "Extensibility",
  detailIdealStyles: "Ideal styles",
  /* FW-05 */
  techniqueLabel: "Technique",
  recipeContextLine: "In this recipe: {yeast} of yeast on {flour} of pre-ferment flour ({pct}). All the dough's yeast goes into the pre-ferment and is dosed on the recipe's total hours, not on the pre-ferment's hours alone.",
  compLabels: [
    "Hydration",
    "Fresh yeast (on the pre-ferment flour)",
    "Duration",
    "Temperature",
    "Flavour",
    "Extensibility",
  ],
  items: {
    poolish: {
      origin: "Poland, then France",
      description:
        "Liquid pre-ferment: equal parts flour and water with a little yeast, 12–16 h at 20–22 °C.",
      hydration: "100% (equal parts flour and water)",
      consistency: "Liquid, foamy",
      fermentationType: "Faster than a biga with the same yeast: at the stated dose it matures in 12–16 h",
      flavor: "Slightly tangy, nutty notes",
      crustResult:
        "Thin and golden; colour and spotting depend on oven and temperature",
      extensibility: "High (estimate): easy to stretch",
      tips: [
        "Ready when the surface is full of bubbles and the centre starts to sink",
        "More yeast, fewer hours: at 20–22 °C, 0.1% for 15–16 h, 0.3% for 10–12 h",
        "Flour in the poolish: 30–50% of the total flour; {brand} starts from {poolishFlourPct}",
      ],
    },
    biga: {
      origin: "Italy",
      description: "Stiff pre-ferment: flour, {bigaHydration} water and about 1% fresh yeast on the biga flour, about 16 h at 18–20 °C.",
      hydration: "{bigaHydration} (up to 50% with wholegrain flours)",
      consistency: "Dry, compact",
      fermentationType: "Slow: with little water it matures in about 16 h (up to 48 h with the fridge)",
      flavor: "Aromatic, floral",
      crustResult: "Crisp; the structure depends on hydration and shaping",
      extensibility: "Depends on flour and hydration (to be verified)",
      tips: [
        "Ready when it is puffy in places, smells of yoghurt and fizzes slightly; if it tastes sour it has gone too far",
        "Long biga: 24 h at 4–5 °C, then 24 h at 18–20 °C",
        "Flour in the biga: usually 30–40% of the total flour; {brand} starts from {bigaFlourPct} and you can change it between {flourPctMin} and {flourPctMax}",
        "Not used in STG Neapolitan pizza: the specification allows only the direct method",
      ],
    },
    autolisi: {
      origin: "R. Calvel, France 1974",
      description:
        "Not a pre-ferment: flour and water rest without yeast or salt before mixing.",
      hydration: "The recipe's own (some water is often held back)",
      consistency: "Pasty",
      fermentationType: "None (enzymatic activity only)",
      flavor: "Neutral \u2014 does not alter flavour",
      crustResult:
        "Variable \u2014 depends on subsequent process",
      extensibility: "High \u2014 silky, less sticky dough",
      idealStyles: "All styles (universal technique)",
      tips: [
        "Rest 20–60 minutes; add yeast and salt afterwards",
        "Combines with biga or poolish",
      ],
    },
  },
  compValues: {
    hydration: {
      biga: "{bigaHydration}",
      poolish: "{poolishHydration}",
      autolisi: "= recipe",
    },
    yeast: {
      biga: "1%",
      poolish: "0.1–0.2%",
      autolisi: "0%",
    },
    duration: {
      biga: "16 h (up to 48 h with 24 h in the fridge)",
      poolish: "12–16 h",
      autolisi: "20–60 min",
    },
    temperature: {
      biga: "18–20 °C (long biga: first 24 h at 4–5 °C)",
      poolish: "20–22 °C",
      autolisi: "Room temp",
    },
    flavor: {
      biga: "Aromatic",
      poolish: "Slightly tangy",
      autolisi: "Neutral",
    },
    extensibility: {
      biga: "Variable",
      poolish: "High (estimate)",
      autolisi: "High",
    },
  },
};



export const TROUBLESHOOTING_EN: Partial<CmsTroubleshootingI18n> =
  {
    categories: {
      frying: "Frying",
      dough: "Dough",
      fermentation: "Fermentation",
      shaping: "Shaping",
      baking: "Baking",
      solver: "Algorithm",
      false_positive: "False alarms",
    },
    issues: {
      FR01: {
        symptom: "Golden outside, raw inside",
        cause: "Oil too hot or dough too thick.",
        testRapido: "Cut open a test piece and check the centre.",
        fixImmediate: "Lower the heat for the next pieces; do not judge doneness by colour alone.",
        prevention: "Use a thermometer and follow the recipe’s oil temperature.",
      },
      FR02: {
        symptom: "Greasy and not crisp",
        cause: "Oil too cool or cooled by too many pieces at once.",
        testRapido: "Check the oil temperature between batches.",
        fixImmediate: "Let the oil return to the recipe temperature; fry small batches and drain well.",
        prevention: "Avoid overcrowding and monitor the oil during frying.",
      },
      FR03: {
        symptom: "Filling leaks into the oil",
        cause: "Poorly sealed edges, holes or filling on the edges.",
        testRapido: "Check the seals of the uncooked pieces.",
        fixImmediate: "Seal the next pieces more carefully; never add water to hot oil.",
        prevention: "Keep edges clean, measure the filling and seal without puncturing the dough.",
      },

      P01: {
        symptom: "Persistently sticky dough",
        cause: "More water than the flour can absorb",
        testRapido: "Is the recipe's hydration above the absorption stated on the flour's spec sheet?",
        fixImmediate: "Add a little flour at a time (2–3%) and work it in with gentle folds",
        prevention: "Stay close to the absorption stated by the mill; if you don't know it, start from the low end of the style's hydration",
      },
      P02: {
        symptom: "Dough tears during stretching",
        cause: "Gluten not developed enough or not yet relaxed, dough still cold from the fridge; sometimes a flour with little extensibility (high P/L) or an over-fermented dough",
        testRapido: "Gently stretch an edge: does it tear straight away instead of stretching?",
        fixImmediate: "Cover the dough ball and let it rest at room temperature for 30–60 min, then try again",
        prevention: "Follow the recipe's timings, take the dough balls out of the fridge in time and use a flour with the P/L the style states",
      },
      P03: {
        symptom: "Dough collapses when touched",
        cause: "Over-fermented: too long, too warm or too much yeast",
        testRapido: "Press with a finger: if the dent springs back at once it is not ready yet, if it comes back slowly it is ready, if it stays and the dough deflates it has gone too far",
        fixImmediate: "Re-ball it and let it recover for 1–2 h (it will have fewer air pockets), or stretch it gently and bake it straight away",
        prevention: "Check the dough from the last third of the planned time, not just the clock",
      },
      P04: {
        symptom: "The dough doesn't rise in the planned time",
        cause: "Weak or expired yeast, or dough colder than planned. Rising little in the fridge is normal",
        testRapido: "Was it in the fridge? That's normal. Otherwise dissolve a pinch of the yeast in warm water with a little sugar: does it foam after 10–15 min?",
        fixImmediate: "First put it somewhere warm (24–28 °C) for 1–2 h. If it doesn't start again, the yeast is inactive: make the dough again with fresh yeast",
        prevention: "Check the yeast's expiry date and the room temperature",
      },
      P05: {
        symptom: "Fermentation too fast (doubled in <3h)",
        cause:
          "Too much yeast (>1.5%) or room temperature >28\u00B0C",
        testRapido:
          "Has the dough doubled in less than 3 hours?",
        fixImmediate:
          "Refrigerate the dough to slow fermentation; chilling does not stop it immediately.",
        prevention:
          "Use the yeast dose calculated for your hours and temperature (at 18 °C for 24 h, about 0.1% fresh yeast)",
      },
      P06: {
        symptom: "Too sour/acetic flavour",
        cause: "Maturation too long or too warm: lactic acid bacteria produce acids (more often with sourdough)",
        testRapido: "Smell and taste a small raw piece: is the sourness sharp, like vinegar?",
        fixImmediate: "It's safe to eat; next time shorten the maturation at room temperature",
        prevention: "Choose time, temperature and yeast for the method; check development without a universal hourly threshold.",
      },
      P07: {
        symptom:
          "Dough ball springs back after stretching (\u2018spring-back effect\u2019)",
        cause: "Gluten not sufficiently relaxed",
        testRapido:
          "Stretch to 30cm \u2014 does it spring back to 25cm after 30 seconds?",
        fixImmediate:
          "Additional 15min rest covered, stretch in 2 stages",
        prevention:
          "Remove dough balls from fridge 60-90min before stretching",
      },
      P08: {
        symptom: "Giant irregular holes in pizza",
        cause: "Large bubbles left in the dough ball and very gentle stretching",
        testRapido: "Are the large bubbles spread across the centre too, not just in the rim?",
        fixImmediate:
          "Gently press dough ball before stretching to redistribute gas",
        prevention: "Before stretching, gently pop the largest bubbles; in Neapolitan and canotto pizza some large air pockets in the rim are wanted",
      },
      P09: {
        symptom: "Raw base but burnt crust",
        cause:
          "Thermal imbalance: too much heat from top, too little from bottom",
        testRapido:
          "Extreme colour contrast between top and bottom?",
        fixImmediate: "Bake closer to the hot floor and further from the top heat; if the oven doesn't go above 300 °C you can pre-bake the base for 2–3 min without toppings",
        prevention: "Balance the heat: a well-preheated stone or steel underneath, less heat from above",
      },
      P10: {
        symptom: "Pale crust, no browning",
        cause: "Oven or floor not hot enough for the style, or few sugars left after a very long maturation",
        testRapido: "Does the oven reach the style's temperature? Was the maturation very long?",
        fixImmediate: "Use the grill for the last 1–2 minutes, if the oven has one",
        prevention: "Run the oven at its maximum with a well-preheated stone or steel; outside STG recipes, which allow neither sugar nor malt, you can add 0.5–1% sugar or malt",
      },
      P11: {
        symptom: "Chewy, not crispy pizza",
        cause: "Bake too short or too cool for the thickness, or more water than the style calls for",
        testRapido: "When you cut it, is the centre still damp and sticky?",
        fixImmediate: "Bake a few minutes longer; if the oven still has headroom, raise the temperature",
        prevention: "Stay within the style's hydration and bake for the time the recipe states",
      },
      P14: {
        symptom:
          "Leopard spots on the crust (leopard spotting)",
        cause:
          "Thin bubbles on the rim darkening under very strong oven heat (localised browning and charring)",
        testRapido: "Do the spots taste bitter?",
        fixImmediate:
          "NOT a problem! It\u2019s the desired characteristic of Neapolitan pizza",
        prevention:
          "If too pronounced: rotate pizza every 20s during baking",
      },
      P15: {
        symptom: "Dark/black pizza bottom",
        cause: "Floor hotter than the style needs, or flour or semolina burnt on the stone",
        testRapido: "Taste it: bitter flavour?",
        fixImmediate:
          "If bitter = problem (lower temp). If flavourful = NORMAL",
        prevention: "Keep the floor at the style's temperature and brush the stone between pizzas",
      },
      P16: {
        symptom: "Low and flat crust",
        cause: "Too much degassing, flour too weak for the style, or use of a rolling pin",
        testRapido: "Crust height <1cm?",
        fixImmediate:
          "More delicate stretching, do not press the edges",
        prevention: "Use a flour of the strength the style states and no rolling pin on styles with a raised rim",
      },
      P17: {
        symptom: "Pizza too dry",
        cause: "Less water than the style calls for, or a bake longer than the recipe's time",
        testRapido: "Are the hydration and baking time the recipe's?",
        fixImmediate: "Serve it straight from the oven; next time shorten the bake",
        prevention: "Stay within the style's hydration and don't go over the stated baking time",
      },
      P18: {
        symptom: "Soggy centre",
        cause: "Too much liquid topping or baking too short",
        testRapido:
          "Sauce amount per pizza? Very wet mozzarella?",
        fixImmediate: "Pre-bake the base for 2–3 min, then add the toppings",
        prevention:
          "Max 80ml sauce per 30cm pizza, drain mozzarella well",
      },
      P19: {
        symptom: "Unable to stretch the dough ball",
        cause: "Flour much stronger than the style calls for: the dough is too tenacious",
        testRapido: "Is your flour's W well above the style's?",
        fixImmediate: "Let the dough ball rest covered for 20–30 min and try again; in the next dough cut the flour with a weaker one",
        prevention: "Use a flour with the strength and P/L the style states",
      },
      P20: {
        symptom: "'Chemical' smell (alcohol, solvent) in the dough",
        cause: "Over-fermentation (alcohol and esters) or too much yeast; more rarely chlorine in the water",
        testRapido: "Smell of alcohol or acetone, and a slack dough that doesn't rise again?",
        fixImmediate: "If it is slack and doesn't rise again, treat it as over-fermented: re-ball it or bake it straight away",
        prevention: "Next time use less yeast or a cooler place. If your tap water tastes of chlorine, use another water: leaving it to stand does not remove chloramines",
      },
      P21: {
        symptom: "Fermentation varies from one batch to the next (home fridge)",
        cause: "A home fridge doesn't hold a steady temperature: defrost cycles, door openings and different shelves make cold maturation swing, unlike a professional cold room",
        testRapido: "Same style, same yeast amount: does the rise change a lot from one time to the next?",
        fixImmediate: "Move the dough to the lowest/middle shelf (the most stable) and judge the dough ball by eye, not just by the clock",
        prevention: "Measure the temperature on the shelf used and observe dough development. Sugar does not correct fridge temperature swings.",
      },
    },
    contextual: {
      sticky_dough: {
        message:
          "Hydration {h}% with W {w}: risk of sticky dough",
        tip: "This style calls for W {wMin}–{wMax}: use a flour in that range or lower the hydration a little",
      },
      high_pl: {
        message:
          "P/L {pl} high: possible overly tenacious dough",
        tip: "Plan a 45 min autolyse before adding salt and yeast",
      },
      sour_risk: {
        message: "{h}h at {t}\u00B0C: risk of sour flavour",
        tip: "If your kitchen is warm, move part of the maturation to the fridge and watch the dough more than the clock",
      },
      pale_crust: {
        message:
          "Short fermentation: check dough development before continuing.",
        tip: "Check volume, elasticity and response to pressure: hours alone do not establish digestibility.",
      },
      cold_oven: {
        message: "Oven at {t}°C, below the style's temperature: risk of a pale crust and a dry pizza",
        tip: "Preheat the stone or steel for a long time and, if the oven has a grill, use it for the last few minutes",
      },
      beginner_hydration: {
        message: "Hydration {h}% is challenging for beginners",
        tip: "This style calls for {hMin}–{hMax}%: if you are starting out, stay close to {hMin}%",
      },
      high_w: {
        message: "W {w} well above the style's: dough hard to stretch",
        tip: "This style calls for W {wMin}–{wMax}: cut it with a weaker flour or plan a long autolyse",
      },
      flat_long_ferment: {
        message:
          "{h}h in fridge without pre-ferment: possible flat flavour",
        tip: "Add a pre-ferment (poolish or biga) for aromatic complexity",
      },
    },
  };

export const GLOSSARY_TERMS_EN: Partial<CmsGlossaryTerms> = {
  terms: {
    w_alveograph: {
      name: "W (Chopin Alveograph)",
      definition: "Total energy required to expand a dough bubble until rupture. Measures the overall flour strength.",
      whyImportant: "W describes overall flour strength. Tenacity and extensibility are assessed with P, L and P/L: a high W alone does not mean a more tenacious dough. These bands are the ones {brand} uses throughout the app; each style states its own W range.",
      ranges: [
        { label: "Weak", value: "{wBandWeak}", note: "General-purpose or pastry flour" },
        { label: "Medium", value: "{wBandMedium}", note: "Often sold as “pizza flour”" },
        { label: "Strong", value: "{wBandStrong}", note: "Long maturations and very hydrated doughs" },
        { label: "Very strong", value: "{wBandVeryStrong}", note: "Manitoba and flours for large enriched breads" },
      ],
    },
    p_tenacity: {
      name: "P (Tenacity)",
      definition:
        "Maximum resistance to deformation. Peak of the alveograph curve \u2014 how much the dough resists stretching.",
      whyImportant:
        "High P: \u2018stiff\u2019 dough, holds shape during baking. Low P: \u2018soft\u2019 dough, easy to stretch, may collapse.",
      ranges: [
        { label: "Pizza", value: "40\u201380 mm" },
        { label: "Bread", value: "80\u2013120 mm" },
        { label: "Croissant", value: "100\u2013140 mm" },
      ],
    },
    l_extensibility: {
      name: "L (Extensibility)",
      definition:
        "Maximum length the bubble reaches before rupture. Measures how far the dough can stretch.",
      whyImportant:
        "High L: extensible dough, easy stretching without tears. Low L: short dough, tears easily.",
      ranges: [
        { label: "Pizza", value: "80\u2013120 mm" },
        { label: "Bread", value: "60\u2013100 mm" },
      ],
    },
    pl_ratio: {
      name: "P/L (Tenacity/Extensibility Ratio)",
      definition: "The ratio between dough’s resistance to deformation and its ability to stretch.",
      whyImportant: "It describes rheological balance. The suitable value depends on flour, hydration and method; it does not guarantee pizza height or texture. The examples are the ranges of {brand}'s styles; your flour's P/L is on the mill's technical sheet.",
    },
    falling_number: {
      name: "Falling Number (Hagberg-Perten)",
      definition:
        "Time taken for a plunger to fall through a heated flour suspension. Measures amylase activity.",
      whyImportant:
        "Low FN (<250): rapid fermentation but unstable dough. High FN (>300): stable for long maturations.",
      ranges: [
        {
          label: "<200 Very high amylase",
          value: "Sticky dough",
          note: "Not recommended for pizza",
        },
        {
          label: "200\u2013250 High",
          value: "Moist crumb",
          note: "Quick bread",
        },
        {
          label: "250\u2013300 Medium",
          value: "Good balance",
          note: "Pizza 8-12h",
        },
        {
          label: "300\u2013400 Low",
          value: "Dry, slow",
          note: "Pizza 24-48h",
        },
        {
          label: ">400 Very low",
          value: "Dry",
          note: "Dry pasta",
        },
      ],
    },
    hydration: {
      name: "Hydration (H%)",
      definition: "Weight percentage of water relative to flour in the dough.",
      formula: "H% = (water weight / flour weight) × 100",
      whyImportant: "More water makes the dough softer and harder to handle, and calls for a stronger flour. Crispness depends mostly on baking and thickness: even a very hydrated pan pizza can be crisp. The examples are the ranges of {brand}'s styles.",
    },
    absorption: {
      name: "Water Absorption",
      definition:
        "Maximum amount of water a flour can absorb while maintaining workable consistency. Depends on proteins, damaged starch, fibre.",
      ranges: [
        { label: "Weak 00 (W150)", value: "50\u201352%" },
        { label: "Medium 00 (W220)", value: "53\u201355%" },
        { label: "Strong 00 (W280)", value: "56\u201358%" },
        { label: "Wholegrain", value: "65\u201375%" },
        { label: "Manitoba (W380)", value: "60\u201365%" },
      ],
    },
    stability: {
      name: "Dough Stability",
      definition:
        "How long dough maintains its consistency during mixing. Measured with a farinograph.",
      whyImportant:
        "Low stability (<5 min): degrades if overmixed. High (>10 min): tolerates operator errors.",
      ranges: [
        { label: "Weak", value: "2\u20134 min" },
        { label: "Medium", value: "5\u20138 min" },
        { label: "Strong", value: "10\u201315 min" },
        { label: "Manitoba", value: "15\u201320 min" },
      ],
    },
    yeast: {
      name: "Yeast (Saccharomyces cerevisiae)",
      definition: "A single-celled fungus that ferments sugars, producing carbon dioxide, alcohol and aroma compounds.",
      whyImportant: "Activity depends on strain, dose, temperature and dough. Cold slows fermentation; there is no universal immediate stopping threshold. The right dose depends on hours and temperature: the recipe works it out for you.",
      ranges: [
        { label: "Fresh, {yeastS1Hours} at {yeastS1Temp}", value: "{yeastS1Pct}", note: "Model estimate" },
        { label: "Fresh, {yeastS2Hours} at {yeastS2Temp}", value: "{yeastS2Pct}", note: "Model estimate" },
        { label: "Fresh, {yeastS3Hours} at {yeastS3Temp}", value: "{yeastS3Pct}", note: "Model estimate" },
        { label: "Fresh, {yeastS4Hours} at {yeastS4Temp}", value: "{yeastS4Pct}", note: "Model estimate" },
        { label: "Dry (active or instant)", value: "≈ fresh × {yeastDryRatio}", note: "Same estimate as fresh" },
      ],
    },
    lab: {
      name: "LAB (Lactic Acid Bacteria)",
      definition:
        "Bacteria that ferment sugars producing lactic acid (and acetic acid). Present in sourdough starter.",
      whyImportant:
        "They can change acidity and fructans depending on strains, flour and process. Their presence does not certify low FODMAP dough.",
    },
    q10: {
      name: "Q\u2081\u2080 (Temperature Coefficient)",
      definition: "Multiplicative factor of biochemical reaction rate for every 10\u00B0C increase.",
      whyImportant: "With Q₁₀ = {q10ComAbove} the rate is multiplied by {q10ComAbove} every {tenDegrees}: {q10ExampleRefHours} at {q10RefTemp} ≈ {q10ExampleWarmHours} at {q10ExampleWarmTemp}. The values in this entry are estimates from the {brand} model.",
      ranges: [
        { label: "Commercial yeast ≥ {q10ComBreak}", value: "{q10ComAbove}", note: "Model estimate, consistent with growth data at room temperature" },
        { label: "Commercial yeast < {q10ComBreak}", value: "{q10ComBelow}", note: "Model estimate, unsourced" },
        { label: "Sourdough > {q10SdBreak}", value: "{q10SdAbove}", note: "Model estimate" },
        { label: "Sourdough ≤ {q10SdBreak}", value: "{q10SdBelow}", note: "Model estimate" },
      ],
    },
    arrhenius: {
      name: "Arrhenius Equation",
      definition: "Links the rate of a reaction to absolute temperature (in kelvin) through an activation energy.",
      formula: "k = A · e^(−Eₐ / (R · T)), with T in kelvin",
      whyImportant: "{brand} does not use this equation. The engine applies a piecewise Q₁₀ referenced to {q10RefTemp}: {q10ComAbove} above and {q10ComBelow} below {q10ComBreak} for commercial yeast, {q10SdAbove} above and {q10SdBelow} up to {q10SdBreak} for sourdough. These are model estimates, not measured values.",
    },
    biga: {
      name: "Biga",
      definition: "Stiff pre-dough of flour, {bigaHydration} water (up to 50% with wholegrain flours) and about 1% fresh yeast on the biga flour, matured about 16 h at 18–20 °C; a long biga takes 24 h at 4–5 °C plus 24 h at 18–20 °C.",
      whyImportant: "Brings aroma and structure to the final dough. Usually 30–40% of the total flour: {brand} starts from {bigaFlourPct}. Not allowed in STG Neapolitan pizza, which uses the direct method.",
    },
    poolish: {
      name: "Poolish",
      definition: "Liquid pre-dough: equal parts flour and water with a little yeast, matured 12–16 h at 20–22 °C (0.1% yeast for 15–16 h, 0.3% for 10–12 h).",
      whyImportant: "Matures faster than a biga and makes the dough extensible. Usually 30–50% of the total flour: {brand} starts from {poolishFlourPct}. Ready when the surface is full of bubbles and the centre starts to sink.",
    },
    autolysis: {
      name: "Autolyse",
      definition:
        "A rest of flour and water, without yeast or salt, for 20–60 minutes before mixing (R. Calvel, 1974). It is not a pre-ferment.",
      whyImportant:
        "The dough becomes more extensible and easier to work.",
    },
    bulk_fermentation: {
      name: "Bulk Fermentation",
      definition:
        "First rise, in a single mass, after mixing and before dividing. Depending on the style it lasts from under an hour to more than a day in the fridge: the right length is the one in the method.",
      whyImportant:
        "The gluten relaxes, fermentation starts and the dough gains aroma.",
    },
    ball_fermentation: {
      name: "Ball Fermentation (Proofing)",
      definition:
        "Second rise, after dividing: as dough balls or, for pan styles, directly in the pan. Its length depends on style, temperature and yeast: the right length is the one in the method.",
      whyImportant:
        "Brings the dough to the right volume for stretching and baking.",
    },
    maillard: {
      name: "Maillard Reaction",
      definition:
        "A group of non-enzymatic reactions between amino compounds and reducing sugars, promoted by heating.",
      whyImportant:
        "It contributes to crust colour and aroma. Rate and intensity depend on surface temperature, time, moisture and ingredients; oven temperature is not the same as food temperature.",
    },
    caramelization: {
      name: "Caramelisation",
      definition:
        "Transformations of sugars during heating, distinct from Maillard reactions and not requiring amino compounds.",
      whyImportant:
        "It can contribute colour and toasted aromas. Its effect depends on the sugars present, moisture, time and surface temperature.",
    },
    starch_gelatinization: {
      name: "Starch Gelatinisation",
      definition:
        "With water and heat, starch granules hydrate, swell and lose part of their crystalline structure. The temperature range depends on starch type and formulation.",
      whyImportant:
        "It contributes to crumb structure and starch transformation. A single core temperature alone does not certify complete baking or individual digestibility.",
    },
    retrogradation: {
      name: "Retrogradation",
      definition:
        "Re-crystallisation of gelatinised starch during storage. Maximum at 4\u00B0C (fridge).",
      whyImportant:
        "Crumb becomes hard and \u2018stale\u2019. Delay with: fats 2-3%, sugars 1-2%, long fermentation, high hydration.",
    },
    thermal_conductivity: {
      name: "Thermal Conductivity",
      definition: "Ability of a material to conduct heat.",
      whyImportant: "The higher k, the faster the surface passes heat to the base: that is why steel helps home ovens, which run cooler. On the oven floor, how much heat the material stores also matters: wood-fired ovens use refractory brick or biscotto.",
      ranges: [
        { label: "Copper", value: "400" },
        { label: "Aluminium", value: "205" },
        { label: "Carbon steel", value: "50" },
        { label: "Stainless steel", value: "16" },
        { label: "Cordierite (stone)", value: "2.5\u20133.5" },
        { label: "Refractory stone", value: "1.0\u20131.5" },
        { label: "Pizza dough", value: "0.5" },
      ],
    },
    fodmap: {
      name: "FODMAP",
      definition:
        "Fermentable Oligosaccharides, Disaccharides, Monosaccharides And Polyols. Short-chain fermentable carbohydrates (fructans 1-3% in wheat).",
      whyImportant:
        "Fermentation can change FODMAP content, but the result depends on flour, microorganisms, process and serving size. Hours alone cannot quantify a reduction or establish that a recipe is low FODMAP.",
    },
    histamine: {
      name: "Histamine",
      definition:
        "Biogenic amine from histidine decarboxylation. Produced by LAB during fermentation, present in aged cheeses and cured meats.",
      whyImportant:
        "Content depends on microorganisms, ingredients, processing and storage. It cannot be calculated at a fixed hourly rate; short fermentation does not guarantee its absence.",
    },
    gluten: {
      name: "Gluten",
      definition:
        "Gliadin and glutenin combine with water and mixing to form an elastic, extensible network in dough.",
      whyImportant:
        "Elasticity from glutenins (S-S bonds), viscosity from gliadins (H bonds). Long proteolysis cuts bonds \u2192 more extensible dough.",
    },
    proteolysis: {
      name: "Proteolysis",
      definition:
        "Protease enzymes break down dough proteins into smaller molecules, such as peptides and amino acids.",
      whyImportant:
        "It can change dough extensibility and strength. It depends on flour, microorganisms, temperature and process: there is no universal optimal duration, and it does not measure individual digestibility.",
    },
    thickness_factor: {
      name: "Thickness Factor (TF)",
      definition: "Dough quantity per unit of surface area: the grams of dough for each cm² of pizza.",
      formula: "TF = dough ball weight (g) / pizza area (cm²)",
      whyImportant: "A metric common in North American dough calculators (in oz/in²; 1 oz/in² ≈ 4.39 g/cm²). {brand} expresses it in g/cm² to size the dough balls; together with the oven it guides baking time and crispness. The examples are calculated from each style's dough-ball weight and shape.",
    },
    friction_factor: {
      name: "Mixer friction",
      definition:
        "Degrees the mixer adds to the dough while it works.",
      whyImportant:
        "Kneading warms the dough and starts the rise earlier: that is why the water should be colder when you use a machine.",
      ranges: [
        { label: "By hand", value: "0" },
        { label: "Fork mixer", value: "2" },
        { label: "Spiral mixer", value: "3" },
        { label: "Home stand mixer (kitchen doughs)", value: "4" },
        { label: "Stand mixer", value: "5" },
      ],
    },
    rule_of_55: {
      name: "Water temperature (three temperatures)",
      definition: "Works out how warm the water should be so the dough reaches the temperature you want.",
      formula: "T_water = 3 × T_dough − T_room − T_flour − friction",
      whyImportant: "Sum of the three temperatures = 3 \u00D7 desired dough \u2212 friction. Pizzerias also call it the \u00ABrule of 55\u00BB: with the sum fixed at 55 the dough lands around 18 \u00B0C (55 \u00F7 3); here the style's target is used, 22\u201324 \u00B0C.",
    },
    a_score: {
      name: "A-Score (Authenticity)",
      definition: "A score from 0 to 100 for closeness to the style reference. It does not certify compliance with a specification.",
      formula: "A = Ingredients × {authWIngredients} + Process × {authWProcess} + Equipment × {authWEquipment}",
      ranges: [
        { label: "{aBand0}", value: "Rigorously authentic" },
        { label: "{aBand1}", value: "Faithful with adaptations" },
        { label: "{aBand2}", value: "Inspired but modified" },
        { label: "{aBand3}", value: "Freely interpreted" },
      ],
      whyImportant: "The weights are a {brand} choice, not a measurement. Product rules: without the fuel the style calls for, the score does not exceed {authFuelCap}; below the style's minimum temperature it is reduced proportionally.",
    },
    f_score: {
      name: "F-Score (Ease)",
      definition: "A score from 0 to 100 for ease of preparation with the available oven, flour and experience. Requirements that block a recipe are assessed separately.",
      formula: "F = Oven × {feasWOven} + Flour × {feasWFlour} + Experience × {feasWSkill}",
      ranges: [
        { label: "{fBand0}", value: "Highly feasible" },
        { label: "{fBand1}", value: "Feasible with care" },
        { label: "{fBand2}", value: "Difficult" },
        { label: "{fBand3}", value: "High risk" },
      ],
      whyImportant: "The weights are a {brand} choice, not a measurement. If the recipe cannot be made with your kitchen, compatibility does not exceed {nonFeasibleCeiling}, whatever the other scores.",
    },
    d_score: {
      name: "D-Score (Estimated maturation)",
      definition: "A model estimate based on time, temperature, yeast and preferments. It does not measure personal digestibility or calculate FODMAP content.",
      ranges: [{"label":"{dBand0}","value":"High index"},{"label":"{dBand1}","value":"Medium-high index"},{"label":"{dBand2}","value":"Medium index"},{"label":"{dBand3}","value":"Low index"}],
    },
  },
};
/* FW-01 — Science registry: note and assumption texts (keys as in SCIENCE_I18N_DEFAULTS). */
export const SCIENCE_EN: CmsScience = {
  notes: {
    "yeast-dose": {
      title: "Yeast amount",
      l1: "It is an estimate: more hours and more warmth need less yeast.",
      l2: "We start from a reference amount consistent with the Neapolitan regulations and adjust it for your hours and your temperature. Real yeast, flour and kitchens can shift the timing: watch the dough more than the clock.",
    },
    "q10-fermentation": {
      title: "Temperature and rising speed",
      l1: "Warmer means faster rising, colder means slower. The factor is an estimate.",
      l2: "The model uses a stepwise speed factor relative to a reference temperature. At room temperature it agrees with yeast studies; in the cool and in the fridge it has no source and can be far off: check the dough.",
    },
    "equivalent-hours": {
      title: "Equivalent hours",
      l1: "Your hours translated into the hours needed at the reference temperature.",
      l2: "We multiply the hours by the speed at your temperature. If you ferment cooler than the reference (fridge, cellar), the final proof and the folds before the fridge happen at the reference temperature: those hours count as they are and only the others are multiplied. That is why «hours × speed» alone does not add up.",
    },
    "kitchen-temp-default": {
      title: "Kitchen temperature",
      l1: "If you do not enter it, we use a standard value.",
      l2: "Kitchen temperature changes rising times and water temperature. The standard value is an assumption: if your kitchen is warmer or colder, enter it and the recipe adapts.",
    },
    "proof-split": {
      title: "Final proof length",
      l1: "When the style does not state it, the final proof is a fixed share of the total hours.",
      l2: "It is a model assumption, not a rule of the method. If your kitchen is warmer than expected the dough is ready sooner: check it.",
    },
    "sourdough-starter-dose": {
      title: "Sourdough starter amount",
      l1: "The starter amount is a rule of thumb that depends only on the hours.",
      l2: "It ignores temperature and how strong your starter is. The starter's flour and water are not counted in the hydration shown: the real dough is slightly wetter.",
    },
    "pre-ferment": {
      title: "Biga and poolish",
      l1: "Hydration, hours and temperatures come from consistent trade sources.",
      l2: "Biga is a stiff pre-ferment that matures slowly in the cool; poolish is liquid and matures faster. Crust and crumb depend mostly on oven, hydration and shaping, not on the pre-ferment alone.",
    },
    autolysis: {
      title: "Autolysis",
      l1: "Flour and water rest without yeast or salt before mixing.",
      l2: "It is not a pre-ferment: nothing ferments. It hydrates the flour and makes the dough easier to work (R. Calvel, 1974).",
    },
    "water-temp-rule": {
      title: "Water temperature",
      l1: "An exact calculation that starts from a few assumptions about your kitchen.",
      l2: "Kitchen, flour, water and mixer heat add up to three times the dough temperature you want. The arithmetic is exact; kitchen and flour are estimates unless you measure them, and mixer heat is a typical value.",
    },
    "water-activity": {
      title: "Water activity (Aw)",
      l1: "An estimated index, not a measurement.",
      l2: "We compute it with a simple formula from hydration, salt and sugar. It helps compare recipes, not tell how long the pizza keeps: a real value needs an instrument.",
    },
    "dough-indices": {
      title: "Dough indices",
      l1: "Gluten network and proteolysis are model indices, not measurements.",
      l2: "They combine flour strength, hydration and hours with weights chosen by {brand}. They help compare two recipes; they are not lab values.",
    },
    "salt-range": {
      title: "Salt range",
      l1: "The salt markers are a {brand} choice, not a sourced range.",
      l2: "For Napoletana STG the regulation gives a precise range; for other styles we show a narrow band around the recipe value.",
    },
    "stg-salt-timing": {
      title: "Salt in Napoletana STG",
      l1: "The regulation dissolves the salt in the water before adding the flour.",
      l2: "This is the order in the EU STG regulation. Other methods add salt later: for this style we follow the regulation.",
    },
    /* FW-02 */
    "stg-reference": {
      title: "Recipe and specification",
      l1: "We compare some of the recipe's values with the Napoletana STG specification.",
      l2: "The specification (EU Regulation 97/2010) sets the flour, the rise, the dough ball weight and the bake. If a value falls outside its ranges, the recipe is “inspired by the STG” and the difference is listed here. The score does not certify compliance.",
    },
    "flour-w-by-grade": {
      title: "Flour type and strength",
      l1: "00, 0, 1 and wholemeal say how refined the flour is, not how strong.",
      l2: "Strength (W) varies from bag to bag even within one type. If the bag does not state it, the model uses an estimate for the type: for a real value check the miller's data sheet.",
    },
    "flour-pl-estimate": {
      title: "Estimated P/L",
      l1: "If you do not enter P/L, we estimate it from flour strength.",
      l2: "It is an approximate relation, kept within the style's range. The real value is on the flour's data sheet.",
    },
    "stg-flour-w": {
      title: "Flour strength in the STG",
      l1: "We use the AVPN range, narrower than the STG regulation's.",
      l2: "The EU STG regulation allows weaker and stronger flours; the AVPN rules narrow the range. It is a {brand} choice: both sources are listed.",
    },
    "oven-max-temp": {
      title: "Oven maximum temperature",
      l1: "It is the temperature stated for your model.",
      l2: "Almost no maker says whether it is air or stone temperature. When the figure comes from a retailer or a review we flag it; demo ovens have made-up data.",
    },
    "oven-preset-max-temp": {
      title: "Typical temperature of the oven type",
      l1: "A typical value: correct it with your oven's.",
      l2: "For some oven types we have no maker's data sheet or standard. If you know your oven, enter its temperature: the recipe adapts.",
    },
    "stg-oven-temp": {
      title: "Napoletana STG oven",
      l1: "The two sources give the same temperature for different surfaces.",
      l2: "The STG regulation refers it to the oven floor, the AVPN rules to the dome. Neither reaches the top of the range the engine uses: that value is still to be verified.",
    },
    "style-min-oven-temp": {
      title: "Style minimum temperature",
      l1: "For many styles the minimum is a model choice, without a source.",
      l2: "Below the minimum the recipe is not feasible or less faithful. Where a regulation exists we follow it; otherwise the threshold is still to be verified.",
    },
    "bake-time-home-preheat": {
      title: "Home oven preheating",
      l1: "The preheating time is a model assumption.",
      l2: "Stone and steel heat up more slowly than air: put them in the cold oven, switch on and, if you can, measure the surface before baking.",
    },
    "surface-conductivity": {
      title: "Surface conductivity",
      l1: "How quickly the surface passes heat to the pizza.",
      l2: "It is the material's typical thermal conductivity, in W/(m·K): metals come from engineering tables, stone and firebrick are values still to be verified. The rack has no contact surface.",
    },
    "baking-energy": {
      title: "Baking energy",
      l1: "An order of magnitude, not a measurement.",
      l2: "We multiply the baking time by a typical power chosen from the oven temperature, the same for wood, gas and electric. Preheating is not included.",
    },
    "thickness-factor": {
      title: "Thickness factor",
      l1: "Grams of dough for each cm² of pizza.",
      l2: "It is a metric common in North American dough calculators, in ounces per square inch; {brand} expresses it in g/cm² to size the dough balls.",
    },
    "score-weights": {
      title: "Score weights",
      l1: "The weights of the dimensions are a {brand} choice.",
      l2: "Only authenticity and ease count in the «Fit with your kitchen» number: maturation, sustainability and experimentation are shown separately and do not move it. The weights do not come from a measurement: they are an app rule, the same for everyone. The score is then the lowest of the weighted average and authenticity.",
    },
    "non-feasible-ceiling": {
      title: "Ceiling for unfeasible recipes",
      l1: "A recipe you cannot make stays in the low band: it is an app rule.",
      l2: "This way an unfeasible recipe never beats one you can make, even if the other dimensions are high.",
    },
    "authenticity-fuel-cap": {
      title: "Authenticity ceiling for the fuel",
      l1: "If the oven is not the one the style calls for (wood or coal) and does not reach the style's minimum temperature, authenticity has a ceiling: it is a {brand} choice.",
      l2: "The ceiling applies only when both the fuel and the heat are missing: an electric or gas oven that reaches the style's minimum temperature has no ceiling. That the style calls for wood or coal (for Napoletana STG the specification says so) stays written in the authenticity details, as information and not as a penalty. The ceiling is an editorial boundary, not a measure of quality.",
    },
    "ranking-tiebreak": {
      title: "Tie-break at equal scores",
      l1: "At the same number, the style your kitchen covers with more margin comes first: it is a {brand} choice.",
      l2: "The number does not change: only the order does, and only among styles in the same group with the same score. The margin is the mean of two values between 0 and 1: how far the oven exceeds the style's minimum temperature and how far the hours available exceed the minimum maturation, each in proportion to the minimum (1 means double or more). For fried styles only time counts. It applies in Create, in Explore and for assistants.",
    },
    digestibility: {
      title: "Digestibility index",
      l1: "A model index about the process, not a health promise.",
      l2: "It considers maturation hours and temperatures. It does not measure how a person digests a pizza and does not certify suitability for a diet.",
    },
    "troubleshooting-thresholds": {
      title: "Troubleshooting thresholds",
      l1: "The numeric thresholds in troubleshooting are indicative.",
      l2: "They are rules of thumb without a published source and they ignore the style: a pan dough, for example, is much wetter than a Neapolitan. Use them as a hint, not a diagnosis.",
    },
    /* FW-19: piano temporale. */
    "comfort-tolerances": {
      title: "Comfort timeline margins",
      l1: "The margins the comfort timeline uses to move the waits are our choice, not a measurement.",
      l2: "We lengthen or shorten the waits within fixed margins, wider in the fridge than at room temperature, without moving hours from the fridge to room temperature and without recalculating the yeast. The further you move from the starting plan, the more you should go by the dough's volume.",
    },
    "bake-round-recovery": {
      title: "Oven recovery between bakes",
      l1: "The time between one bake and the next is a model assumption.",
      l2: "Between pizzas you unload, load and the floor comes back to temperature: a home oven with a stone needs minutes, pizza ovens less, wood-fired ovens almost none. We use a fixed value per oven type, not measured on yours.",
    },
  },
  assumptions: {
    "constant-ferment-temp": "The temperature stays constant for the whole phase.",
    "time-exponent-no-source": "The hours correction uses an exponent chosen by the model, without a source.",
    "kitchen-temp-standard": "If you do not enter the kitchen temperature, we use a standard value.",
    "q10-cold-no-source": "In the cool and in the fridge the speed factor has no source: the error can be large.",
    "proof-share-default": "Without guidance from the style, the final proof is a fixed share of the hours.",
    "starter-steps-by-hours": "The starter amount steps down with the hours, ignoring temperature.",
    "starter-not-in-hydration": "The starter's flour and water are not counted in the hydration.",
    "preferment-at-maturation-temp": "With a pre-ferment, the ripe pre-ferment is at the midpoint of its maturation temperature (biga 18–20 °C, poolish 20–22 °C), and mixing it by hand adds no friction heat.",
    "flour-at-kitchen-temp": "The flour is at kitchen temperature.",
    "mixer-friction-values": "Mixer heat is a typical value still to be verified; by hand it is zero.",
    "coefficients-not-measured": "The formula's coefficients are chosen by the model, not measured.",
    "grade-is-not-strength": "Flour type indicates refinement, not strength: W by type is an estimate.",
    "oven-temp-surface-unspecified": "We do not know whether the stated temperature is air or stone.",
    "style-min-temp-no-source": "The style's minimum temperature has no written source.",
    "preheat-home-minutes": "Preheating time depends only on oven temperature, not on the surface.",
    "rack-no-contact": "The rack has no contact surface: the base bakes by radiation and air.",
    "oven-power-steps": "A typical power for each temperature band, the same for every fuel.",
    "no-health-claim": "No health claim: the index does not measure how a person digests.",
    "thresholds-rules-of-thumb": "The thresholds are general rules of thumb, not tuned to the style.",
    /* FW-19: piano temporale. */
    "comfort-margins-rule-of-thumb": "The margins, wider in the fridge than at room temperature, are rules of thumb without a source.",
    "comfort-yeast-unchanged": "The yeast dose stays the one calculated for the starting plan.",
    "recovery-by-oven-type": "Recovery depends only on the oven type, not on the model or the surface.",
    /* FW-02 */
    "stg-partial-check": "We compare only some values: ingredient origin, dough temperature and technique are not checked.",
  },
  /* Revisione ondata 2: formule nella lingua (le parole e i decimali
   * cambiano, i simboli no) e note descrittive delle fonti. */
  formulas: {
    "yeast-dose": "Y = max(0.01%; min(3%; Y₀ × (t₀ / tₑ)^0.7 ÷ v(T) × s) ÷ k) · Y₀ = 0.1% (fresh), t₀ = 24 h, s = 1 fresh / 0.33 dry, k = personal correction (0.5–2) · tₑ = h if T ≥ 18 °C; below that: tₑ = (h − hₐ) + hₐ ÷ v(T), with hₐ = final proof + folds at 18 °C · v(T): see “Temperature and rising speed”",
    "q10-fermentation": "v(T) = Q10ₐ^((T − 18)/10) if T ≥ T_b; below that: v(T) = Q10ₐ^((T_b − 18)/10) × Q10_b^((T − T_b)/10) · baker's yeast: T_b = 10 °C, Q10ₐ = 2.0, Q10_b = 1.6 · sourdough starter: T_b = 15 °C, Q10ₐ = 2.2, Q10_b = 1.9",
    "equivalent-hours": "T ≥ 18 °C: h₁₈ = h × v(T) · T < 18 °C: h₁₈ = (h − hₐ) × v(T) + hₐ, with hₐ = final proof + folds at 18 °C",
    "water-temp-rule": "T_water = 3 × T_dough − T_room − T_flour − friction · with a pre-ferment, final dough: T_water = 4 × T_dough − T_room − T_flour − T_pre-ferment − friction; pre-ferment water: 3 × T_pre-ferment − T_room − T_flour",
    "water-activity": "Aw ≈ 0.96 + (H − 55) × 0.0005 − salt × 0.006 − sugar × 0.004",
    "flour-pl-estimate": "P/L ≈ 0.30 + (W − 150) × 0.0015, limited to the style's range",
    "baking-energy": "E = P × t · P = 2, 3 or 8 kW depending on oven temperature",
    "thickness-factor": "TF = dough ball weight (g) / pizza area (cm²) · 1 oz/in² ≈ 4.39 g/cm²",
    "score-weights": "C = min(weighted mean of A and F; A) · default weights: Authenticity (A) 55%, Ease (F) 45% · not feasible: C ≤ 39",
    "ranking-tiebreak": "M = mean of min(1; max(0; (T − T_min) / T_min)) and min(1; max(0; (H − H_min) / H_min)) · T oven, H hours available · fried: H only",
  },
  sourceNotes: {
    "internal-db": "the project's internal working database, not public",
    "demo": "sample data, invented brand",
    "ovens-secondary": "oven retailers and reviews (secondary sources)",
    "autolyse-calvel": "article on autolyse (cites R. Calvel, 1974)",
    "recipes": "recipes",
    "articles": "articles",
    "abstract-only": "abstract only",
    "manufacturer-sheet": "manufacturer's data sheet",
    "manufacturer-pages": "manufacturer's product pages",
    "manual": "user manual",
    "faq": "frequently asked questions",
  },
};
