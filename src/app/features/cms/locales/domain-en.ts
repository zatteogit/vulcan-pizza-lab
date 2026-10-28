/* === DOMAIN DATA i18n — English === */
import type {
  CmsPreFerment,
  CmsTroubleshootingI18n,
  CmsGlossaryTerms,
  CmsScience,
} from "../cms-context";

export const PRE_FERMENT_EN: Partial<CmsPreFerment> = {
  sectionLabel: "Pre-ferment",
  tipsLabel: "Tips",
  showComparison: "Compare Biga vs Poolish vs Autolysis",
  hideComparison: "Hide comparison",
  paramHydration: "Hydration",
  paramDuration: "Duration",
  paramTemperature: "Temperature",
  paramYeast: "Yeast",
  detailFermentation: "Fermentation",
  detailFlavor: "Flavour",
  detailCrust: "Crust",
  detailExtensibility: "Extensibility",
  detailIdealStyles: "Ideal styles",
  compLabels: [
    "Hydration",
    "Yeast",
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
      fermentationType:
        "Fast: with so much water it matures in a few hours",
      flavor: "Slightly tangy, nutty notes",
      crustResult:
        "Thin and golden; colour and spotting depend on oven and temperature",
      extensibility: "High (estimate): easy to stretch",
      idealStyles:
        "Roman teglia, NY Style, Contemporary Neapolitan, Focaccia",
      tips: [
        "Ready when the surface is full of bubbles and the centre starts to sink",
        "More yeast, fewer hours: at 20–22 °C, 0.1% for 15–16 h, 0.3% for 10–12 h",
        "Flour in the poolish: 30–50% of the total flour",
      ],
    },
    biga: {
      origin: "Italy",
      description:
        "Stiff pre-ferment: flour, 44% water and 1% yeast, about 16 h at 18–20 °C.",
      hydration: "44% (up to 50% with wholegrain flours)",
      consistency: "Dry, compact",
      fermentationType: "Slow: with little water it matures in 16–48 h",
      flavor: "Aromatic, floral",
      crustResult: "Crisp; the structure depends on hydration and shaping",
      extensibility: "Depends on flour and hydration (to be verified)",
      idealStyles:
        "Pinsa, Pizza al taglio, Pala romana, Bread",
      tips: [
        "Ready when it is puffy in places, smells of yoghurt and fizzes slightly; if it tastes sour it has gone too far",
        "Long biga: 24 h at 4–5 °C, then 24 h at 18–20 °C",
        "Flour in the biga: 20–50% of the total flour, usually a third",
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
      biga: "44%",
      poolish: "100%",
      autolisi: "= recipe",
    },
    yeast: {
      biga: "1%",
      poolish: "0.1–0.3%",
      autolisi: "0%",
    },
    duration: {
      biga: "16–48 h",
      poolish: "12–16 h",
      autolisi: "20–60 min",
    },
    temperature: {
      biga: "18–20 °C",
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
      false_positive: "False Alarms",
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
        cause: "Hydration exceeds flour absorption capacity",
        testRapido:
          "Compare recipe H% vs flour absorption (+5% max)",
        fixImmediate:
          "Add 2-3% flour and incorporate with gentle folds",
        prevention: "Use H% \u2264 flour absorption + 5%",
      },
      P02: {
        symptom: "Dough tears during stretching",
        cause:
          "P/L too high (>0.8) or insufficient fermentation (<6h)",
        testRapido:
          "Stretch the dough ball 10cm: does it tear?",
        fixImmediate: "Rest 60min covered at room temperature",
        prevention:
          "Choose flours with P/L 0.5-0.6, minimum 8h fermentation",
      },
      P03: {
        symptom: "Dough collapses when touched",
        cause:
          "Over-fermented (volume >150%, finger dent doesn\u2019t spring back)",
        testRapido:
          "Press 1cm with finger: does it return in 3-5s?",
        fixImmediate:
          "Irreversible. Gently stretch and bake immediately",
        prevention: "Check volume every 6h, max +150% rise",
      },
      P04: {
        symptom: "No rise after 6+ hours",
        cause:
          "Dead yeast, temperature too low, or salt in direct contact",
        testRapido:
          "Vitality test: 5g yeast + 5g sugar in 100ml water 35\u00B0C \u2014 foam after 15min?",
        fixImmediate:
          "Add 0.3% fresh yeast dissolved in warm water, incorporate with folds",
        prevention: "Test yeast before every use",
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
        cause:
          "Heterofermentative LAB active >48h at >18\u00B0C (especially with sourdough)",
        testRapido:
          "Dough pH \u2014 should be 4.5-5.5, problematic if <4.2",
        fixImmediate: "Sugar masks flavour but does not correct overfermentation. Reassess the dough before use.",
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
        cause: "Insufficient degassing + too gentle stretching",
        testRapido: "Air pockets >3cm and uneven distribution?",
        fixImmediate:
          "Gently press dough ball before stretching to redistribute gas",
        prevention: "Reduce fermentation time by 20%",
      },
      P09: {
        symptom: "Raw base but burnt crust",
        cause:
          "Thermal imbalance: too much heat from top, too little from bottom",
        testRapido:
          "Extreme colour contrast between top and bottom?",
        fixImmediate: "Pre-bake the base 3min without toppings",
        prevention:
          "Use thicker tray/stone, balance top/bottom heat",
      },
      P10: {
        symptom: "Pale crust, no browning",
        cause:
          "Temperature <250\u00B0C, sugars depleted, or excessive surface moisture",
        testRapido:
          "Does oven reach at least 250\u00B0C? Fermentation >48h?",
        fixImmediate:
          "Brush with oil+honey before baking or use grill for final 2min",
        prevention:
          "Add 0.5–1% sugar or malt and run the oven at its maximum, with a well-preheated stone or steel",
      },
      P11: {
        symptom: "Chewy, not crispy pizza",
        cause:
          "Core temperature <85\u00B0C, hydration >70%, or too slow baking",
        testRapido:
          "Core thermometer: does it reach 90\u00B0C+?",
        fixImmediate:
          "Extend baking +2min or increase temperature +20\u00B0C",
        prevention:
          "H \u2264 65%, core temperature target 95\u00B0C",
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
        cause: "Stone or tray too hot (>450\u00B0C)",
        testRapido: "Taste it: bitter flavour?",
        fixImmediate:
          "If bitter = problem (lower temp). If flavourful = NORMAL",
        prevention:
          "Controlled stone preheat, not exceeding 400\u00B0C",
      },
      P16: {
        symptom: "Low and flat crust",
        cause:
          "Excessive degassing, flour W too low, or rolling pin used",
        testRapido: "Crust height <1cm?",
        fixImmediate:
          "More delicate stretching, do not press the edges",
        prevention:
          "W \u2265 240 for Neapolitan, never rolling pin on crusted styles",
      },
      P17: {
        symptom: "Pizza too dry",
        cause: "Hydration <55% or baking too long (>10min)",
        testRapido: "Recipe H%? Actual baking time?",
        fixImmediate: "Add generous oil on topping",
        prevention:
          "H \u2265 58%, do not exceed recommended baking time",
      },
      P18: {
        symptom: "Soggy centre",
        cause: "Too much liquid topping or baking too short",
        testRapido:
          "Sauce amount per pizza? Very wet mozzarella?",
        fixImmediate: "Pre-bake base 2min, then add toppings",
        prevention:
          "Max 80ml sauce per 30cm pizza, drain mozzarella well",
      },
      P19: {
        symptom: "Unable to stretch the dough ball",
        cause:
          "Pure Manitoba flour (W >380), dough too tenacious",
        testRapido: "Which flour did you use? W >350?",
        fixImmediate:
          "Blend 50:50 with W 200 flour in the next batch",
        prevention:
          "Max W 320 for pizza, flours with P/L 0.5-0.6",
      },
      P20: {
        symptom: "\u2018Chemical\u2019 smell in the dough",
        cause: "High-chlorine tap water",
        testRapido: "Strong smell when you open the tap?",
        fixImmediate: "Use bottled water for the next batch",
        prevention:
          "Filter water or let it sit 12h uncovered (chlorine evaporates)",
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
        tip: "Use flour with W \u2265 280 or reduce hydration to 68-70%",
      },
      high_pl: {
        message:
          "P/L {pl} high: possible overly tenacious dough",
        tip: "Plan 45min autolysis before adding salt and yeast",
      },
      sour_risk: {
        message: "{h}h at {t}\u00B0C: risk of sour flavour",
        tip: "For fermentations >24h, use temperature 4-8\u00B0C",
      },
      pale_crust: {
        message:
          "Short fermentation: check dough development before continuing.",
        tip: "Check volume, elasticity and response to pressure: hours alone do not establish digestibility.",
      },
      cold_oven: {
        message:
          "Oven at {t}\u00B0C: risk of raw base with burnt edge",
        tip: "Pre-bake the base 3min without toppings, then add ingredients",
      },
      beginner_hydration: {
        message: "Hydration {h}% is challenging for beginners",
        tip: "Start with 60-65% and increase gradually with experience",
      },
      high_w: {
        message: "W {w} very high: dough difficult to stretch",
        tip: "Mix 50:50 with W 200 flour or plan a long autolysis",
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
      definition:
        "Total energy required to expand a dough bubble until rupture. Measures the overall flour strength.",
      whyImportant:
        "W describes overall flour strength. Tenacity and extensibility are assessed with P, L and P/L: a high W alone does not mean a more tenacious dough.",
      ranges: [
        {
          label: "Weak",
          value: "90\u2013160",
          note: "Biscuits, wafers",
        },
        {
          label: "Medium",
          value: "160\u2013200",
          note: "Sandwich bread, focaccia",
        },
        {
          label: "Medium-strong",
          value: "200\u2013280",
          note: "Neapolitan pizza",
        },
        {
          label: "Strong",
          value: "280\u2013350",
          note: "Long-fermented bread",
        },
        {
          label: "Very strong",
          value: "350\u2013450",
          note: "Panettone, croissant",
        },
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
      definition:
        "The ratio between dough’s resistance to deformation and its ability to stretch.",
      whyImportant:
        "It describes rheological balance. The suitable value depends on flour, hydration and method; it does not guarantee pizza height or texture.",
      ranges: [
        {
          label: "<0.4 Very extensible",
          value: "Collapses easily",
          note: "Pinsa",
        },
        {
          label: "0.4\u20130.5 Extensible",
          value: "Easy to work",
          note: "Classic Neapolitan",
        },
        {
          label: "0.5\u20130.7 Balanced",
          value: "Good balance",
          note: "Modern Neapolitan, bread",
        },
        {
          label: "0.7\u20131.0 Tenacious",
          value: "Resistant",
          note: "Long-fermented bread",
        },
        {
          label: ">1.0 Very tenacious",
          value: "Elastic, springs back",
          note: "Croissant",
        },
      ],
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
      definition:
        "Weight percentage of water relative to flour in the dough.",
      whyImportant:
        "Low H (<55%): crispy, easy. Medium H (60-65%): balance. High H (>70%): needs strong flour (W>280) and skill.",
      ranges: [
        {
          label: "Classic Neapolitan",
          value: "55\u201360%",
          note: "Soft, workable",
        },
        {
          label: "Contemporary Neapolitan",
          value: "60\u201365%",
          note: "Light crust",
        },
        {
          label: "Canotto",
          value: "65\u201370%",
          note: "Large air pockets",
        },
        {
          label: "Roman Pinsa",
          value: "75\u201385%",
          note: "Spread in tray",
        },
        {
          label: "Focaccia/Bonci",
          value: "85\u2013100%+",
          note: "Batter-like",
        },
      ],
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
      definition:
        "A single-celled fungus that ferments sugars, producing carbon dioxide, alcohol and aroma compounds.",
      whyImportant:
        "Activity depends on strain, dose, temperature and dough. Cold slows fermentation; there is no universal immediate stopping threshold.",
      ranges: [
        { label: "Fresh", value: "0.5\u20132.0%", note: "70% moisture, fridge 4\u00B0C" },
        { label: "Active dry", value: "0.3\u20131.0%", note: "Rehydrate first" },
        { label: "Instant dry", value: "0.2\u20130.8%", note: "Add directly" },
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
      definition:
        "Multiplicative factor of biochemical reaction rate for every 10\u00B0C increase.",
      whyImportant:
        "With Q\u2081\u2080 = 2, fermentation doubles every +10\u00B0C: 24h at 18\u00B0C \u2248 12h at 28\u00B0C. The values below are estimates from the {brand} model.",
      ranges: [
        { label: "Commercial yeast \u226510\u00B0C", value: "2.0", note: "Model estimate, consistent with growth data between 18 and 25 \u00B0C" },
        { label: "Commercial yeast <10\u00B0C", value: "1.6", note: "Model estimate, unsourced" },
        { label: "Sourdough >15\u00B0C", value: "2.2", note: "Model estimate" },
        { label: "Sourdough \u226415\u00B0C", value: "1.9", note: "Model estimate" },
      ],
    },
    arrhenius: {
      name: "Arrhenius Equation",
      definition:
        "Describes the dependence of reaction rate on absolute temperature.",
      whyImportant:
        "With \u03B2=0.075 and T_ref=18\u00B0C \u2192 Q\u2081\u2080 \u2248 2.12. Used in the {brand} engine to calculate yeast dosage and timing.",
    },
    biga: {
      name: "Biga",
      definition:
        "Stiff pre-dough of flour, 44% water (up to 50% with wholegrain flours) and 1% yeast, matured about 16 h at 18–20 °C; a long biga takes 24 h at 4–5 °C plus 24 h at 18–20 °C.",
      whyImportant:
        "Brings aroma and structure to the final dough. Usually a third of the total flour (20–50%). Not allowed in STG Neapolitan pizza, which uses the direct method.",
    },
    poolish: {
      name: "Poolish",
      definition:
        "Liquid pre-dough: equal parts flour and water with a little yeast, matured 12–16 h at 20–22 °C (0.1% yeast for 15–16 h, 0.3% for 10–12 h).",
      whyImportant:
        "Matures quickly and makes the dough extensible. Usually 30–50% of the total flour. Ready when the surface is full of bubbles and the centre starts to sink.",
    },
    autolysis: {
      name: "Autolysis",
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
      whyImportant:
        "Steel (k=50): ideal for home ovens 280\u00B0C, 6-8 min baking. Stone (k=2): ideal for wood ovens 450\u00B0C+, 60-90s baking.",
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
      definition:
        "Dough quantity per unit of surface area: the grams of dough for each cm² of pizza.",
      whyImportant:
        "A metric common in North American dough calculators (in oz/in²; 1 oz/in² ≈ 4.39 g/cm²). {brand} expresses it in g/cm² to size the dough balls; together with the oven it guides baking time and crispness.",
      ranges: [
        { label: "Neapolitan", value: "0.30\u20130.36", note: "6-7 mm" },
        { label: "Roman tonda", value: "0.20\u20130.25", note: "4-5 mm" },
        { label: "New York", value: "0.40\u20130.50", note: "8-10 mm" },
        { label: "Chicago deep dish", value: "1.00\u20131.30", note: "20-26 mm" },
      ],
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
      definition:
        "Works out how warm the water should be so the dough reaches the temperature you want.",
      whyImportant:
        "Sum of the three temperatures = 3 \u00D7 desired dough \u2212 friction. Pizzerias also call it the \u00ABrule of 55\u00BB: with the sum fixed at 55 the dough lands around 18 \u00B0C (55 \u00F7 3); here the style's target is used, 22\u201324 \u00B0C.",
    },
    a_score: {
      name: "A-Score (Authenticity)",
      definition:
        "A score from 0 to 100 for closeness to the style reference. It does not certify compliance with a specification.",
      ranges: [
        { label: "90-100", value: "Rigorously authentic" },
        { label: "75-89", value: "Substantially authentic" },
        { label: "60-74", value: "Inspired by the style" },
        { label: "<60", value: "Significant deviation" },
      ],
    },
    f_score: {
      name: "F-Score (Ease)",
      definition:
        "A score from 0 to 100 for ease of preparation with the available oven, flour and experience. Requirements that block a recipe are assessed separately.",
      ranges: [
        { label: "90-100", value: "Highly feasible" },
        { label: "75-89", value: "Feasible with care" },
        { label: "60-74", value: "Difficult" },
        { label: "<60", value: "Not recommended" },
      ],
    },
    d_score: {
      name: "D-Score (Estimated maturation)",
      definition:
        "A model estimate based on time, temperature, yeast and preferments. It does not measure personal digestibility or calculate FODMAP content.",
      ranges: [{"label":"85-100","value":"High index"},{"label":"70-84","value":"Medium-high index"},{"label":"50-69","value":"Medium index"},{"label":"<50","value":"Low index"}],
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
      l2: "We multiply the hours by the speed at your temperature and by a method factor (pre-ferment, fridge). That is why «hours × speed» alone does not add up.",
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
      l2: "They say how much each dimension counts in the final number. They do not come from a measurement: they are an app rule, the same for everyone.",
    },
    "non-feasible-ceiling": {
      title: "Ceiling for unfeasible recipes",
      l1: "A recipe you cannot make stays in the low band: it is an app rule.",
      l2: "This way an unfeasible recipe never beats one you can make, even if the other dimensions are high.",
    },
    "authenticity-fuel-cap": {
      title: "Authenticity ceiling for the fuel",
      l1: "Without the oven the style calls for, authenticity has a ceiling: it is a {brand} choice.",
      l2: "When a style requires wood or coal, another oven can bake well but does not follow the method. The ceiling is an editorial boundary, not a measure of quality.",
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
  },
  assumptions: {
    "constant-ferment-temp": "The temperature stays constant for the whole phase.",
    "time-exponent-no-source": "The hours correction uses an exponent chosen by the model, without a source.",
    "kitchen-temp-standard": "If you do not enter the kitchen temperature, we use a standard value.",
    "q10-cold-no-source": "In the cool and in the fridge the speed factor has no source: the error can be large.",
    "proof-share-default": "Without guidance from the style, the final proof is a fixed share of the hours.",
    "starter-steps-by-hours": "The starter amount steps down with the hours, ignoring temperature.",
    "starter-not-in-hydration": "The starter's flour and water are not counted in the hydration.",
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
  },
};
