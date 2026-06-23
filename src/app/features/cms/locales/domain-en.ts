/* === DOMAIN DATA i18n — English === */
import type {
  CmsPreFerment,
  CmsDietaryI18n,
  CmsTroubleshootingI18n,
  CmsGlossaryTerms,
} from "../cms-context";

export const PRE_FERMENT_EN: Partial<CmsPreFerment> = {
  sectionLabel: "Pre-ferment",
  tipsLabel: "Tips",
  showComparison: "Compare Biga vs Poolish vs Autolysis",
  hideComparison: "Hide comparison",
  paramHydration: "Hydration",
  paramDuration: "Duration",
  paramTemperature: "Temperature",
  paramPh: "Final pH",
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
    "Final pH",
    "Flavour",
    "Extensibility",
    "Crumb structure",
    "Complexity",
  ],
  items: {
    poolish: {
      origin: "French",
      description:
        "Liquid pre-ferment (1:1 flour:water) with predominantly alcoholic fermentation. Develops sugars for intense Maillard reaction.",
      hydration: "100% (1:1 ratio)",
      consistency: "Liquid, foamy",
      fermentationType:
        "Predominantly alcoholic (CO\u2082 + ethanol)",
      flavor: "Sweet, malty, complex notes",
      crustResult:
        "Light, deeply golden, pronounced leopard spotting",
      extensibility: "High \u2014 easy to stretch",
      idealStyles:
        "Roman teglia, NY Style, Contemporary Neapolitan, Focaccia",
      tips: [
        "Optimal point: domed surface with bubbles, just starting to recede",
        "Beyond 16h the flavour becomes too sour/alcoholic",
        "If collapsed it is still usable but reduce the percentage of total flour",
        "Poolish proportion in final dough: 20-40% of total flour",
      ],
    },
    biga: {
      origin: "Italian",
      description:
        "Stiff pre-ferment (44-48% hydration) with lactic + alcoholic fermentation. Maximum shelf life and aromatic complexity.",
      hydration: "44-48%",
      consistency: "Dry, compact",
      fermentationType: "Lactic + alcoholic (active LAB)",
      flavor: "Tangy, complex, fermented notes",
      crustResult: "Crispy, crumbly, fine crumb",
      extensibility: "Low \u2014 needs rest after portioning",
      idealStyles:
        "Classic Neapolitan, Pinsa, Pizza al taglio, Bread",
      tips: [
        "If too dry: add 5-10% water to help incorporation",
        "Ready when surface is cracked \u201Cdomed\u201D and volume has tripled",
        "Can be stored up to 48h in fridge (refresh with 10% water before use)",
        "Biga proportion in final dough: 20-50% of total flour",
      ],
    },
    autolisi: {
      origin: "Universal",
      description:
        "Enzymatic rest of flour+water only (no yeast or salt). Develops gluten spontaneously and activates protease/amylase.",
      hydration: "55-75% (all recipe water)",
      consistency: "Pasty",
      fermentationType: "None (enzymatic activity only)",
      flavor: "Neutral \u2014 does not alter flavour",
      crustResult:
        "Variable \u2014 depends on subsequent process",
      extensibility: "High \u2014 silky, less sticky dough",
      idealStyles: "All styles (universal technique)",
      tips: [
        "Wholegrain flours: longer autolysis (60-90min) to soften the bran",
        "Warm water (30-35\u00B0C) speeds up enzymes",
        "ALWAYS before adding salt (salt inhibits enzymes)",
        "Reduces mixing time by 30% as gluten develops on its own",
        "Combinable with Biga or Poolish for superior results",
      ],
    },
  },
  compValues: {
    hydration: {
      biga: "44-48%",
      poolish: "100%",
      autolisi: "55-75%",
    },
    yeast: {
      biga: "0.5-1%",
      poolish: "0.1-0.5%",
      autolisi: "0%",
    },
    duration: {
      biga: "16-48h",
      poolish: "8-16h",
      autolisi: "0.5-2h",
    },
    temperature: {
      biga: "16-18\u00B0C",
      poolish: "20-22\u00B0C",
      autolisi: "Room temp",
    },
    ph: {
      biga: "5.0-5.3",
      poolish: "4.5-4.8",
      autolisi: "~6.5",
    },
    flavor: {
      biga: "Tangy",
      poolish: "Sweet/malty",
      autolisi: "Neutral",
    },
    extensibility: {
      biga: "Low",
      poolish: "High",
      autolisi: "High",
    },
    alveolatura: {
      biga: "Fine",
      poolish: "Large",
      autolisi: "Large",
    },
    complexity: {
      biga: "Medium",
      poolish: "Low",
      autolisi: "Very low",
    },
  },
};

export const DIETARY_EN: Partial<CmsDietaryI18n> = {
  info: {
    low_fodmap: {
      name: "Low FODMAP",
      description:
        "Reduces fermentable fructans and oligosaccharides",
      scienceNote:
        "Fermentation \u226524h reduces FODMAP 70% (Costabile 2014)",
    },
    histamine: {
      name: "Low histamine",
      description:
        "Limits histamine build-up from long fermentation",
      scienceNote:
        "Histamine accumulates linearly. Fresh yeast <6h: safe (<5 mg/kg)",
    },
    gluten_free: {
      name: "Gluten-free",
      description: "For coeliac disease or gluten sensitivity",
      scienceNote:
        "EU threshold: <20 ppm. Requires GF mix (rice/corn/quinoa + xanthan 1.5%)",
    },
    lactose_free: {
      name: "Lactose-free",
      description: "For lactose intolerance",
      scienceNote:
        "Baking >200\u00B0C degrades 90%+ lactose. Only SEVERE requires substitution",
    },
    nickel: {
      name: "Low nickel",
      description: "For systemic nickel allergy (SNAS)",
      scienceNote:
        "00 flour (~50 \u00B5g/100g) vs wholegrain (~200 \u00B5g/100g). Threshold <200 \u00B5g/day",
    },
    vegan: {
      name: "Vegan",
      description: "No animal-derived ingredients",
      scienceNote:
        "Base dough is already vegan. Watch toppings and fats (butter \u2192 oil)",
    },
  },
  conflicts: {
    fodmap_histamine: {
      message:
        "FODMAP requires long fermentation (\u226524h), histamine requires short fermentation (\u226412h)",
      compromiseTip:
        "Compromise: 8-12h with fresh yeast at 18\u00B0C. FODMAP reduced ~40% (sub-optimal), histamine ~8 mg/kg (acceptable)",
    },
    gf_fodmap: {
      message:
        "Compatible! GF mix eliminates the main FODMAP source (wheat fructans)",
    },
    nickel_general: {
      message:
        "For low nickel prefer 00 flour (50 \u00B5g/100g) over wholegrain (200 \u00B5g/100g)",
    },
  },
  warnings: {
    fodmap_low: {
      message:
        "FODMAP reduced only {pct}% \u2014 fermentation too short",
      tip: "Increase to \u226524h to reach 70%+ reduction",
    },
    fodmap_good: {
      message:
        "FODMAP reduced {pct}% \u2014 good level for IBS",
      tip: "Fermentation is long enough to degrade fructans",
    },
    histamine_high: {
      message:
        "Estimated histamine ~{val} mg/kg \u2014 high level",
      tip: "Reduce fermentation to \u226412h or use fresh yeast at \u226420\u00B0C",
    },
    histamine_moderate: {
      message:
        "Estimated histamine ~{val} mg/kg \u2014 moderate level",
      tip: "Monitor symptoms. For safety, reduce time or temperature",
    },
    gluten_free: {
      message:
        "Recipe uses wheat flour \u2014 incompatible with coeliac disease",
      tip: "Substitute with GF mix (rice 40% + corn 30% + quinoa 10% + sorghum 10% + starch 10%) + xanthan 1.5%",
    },
    nickel_highW: {
      message:
        "Strong flours (high W) tend to be less refined, with more nickel",
      tip: "Prefer refined 00 flour (W 200-260) to minimise nickel",
    },
  },
};

export const TROUBLESHOOTING_EN: Partial<CmsTroubleshootingI18n> =
  {
    categories: {
      dough: "Dough",
      fermentation: "Fermentation",
      shaping: "Shaping",
      baking: "Baking",
      solver: "Algorithm",
      false_positive: "False Alarms",
    },
    issues: {
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
          "Move immediately to 4\u00B0C to halt fermentation",
        prevention:
          "Use 0.2% fresh yeast for 24h, check temperature",
      },
      P06: {
        symptom: "Too sour/acetic flavour",
        cause:
          "Heterofermentative LAB active >48h at >18\u00B0C (especially with sourdough)",
        testRapido:
          "Dough pH \u2014 should be 4.5-5.5, problematic if <4.2",
        fixImmediate: "Add 0.5-1% sugar to mask acidity",
        prevention: "Fermentations >24h always at 4-8\u00B0C",
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
          "Add 0.5-1% sugar, oven at least 280\u00B0C",
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
          "Contact with oven vault >500\u00B0C \u2014 localised Maillard reaction",
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
          "Short fermentation ({h}h): pale crust and limited digestibility",
        tip: "Add 0.5-1% sugar to boost Maillard browning",
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
        "Low W (<180): extensible dough, short fermentation. Medium W (220-280): ideal Neapolitan, tolerates 18-30h. High W (>300): tenacious dough, needed for enriched doughs.",
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
        "Mechanical balance index. Ratio between resistance and extensibility of the dough.",
      whyImportant:
        "Optimal P/L (0.5-0.6): tall crust + thin base. <0.4: flat pizza. >0.8: \u2018rubbery\u2019 dough.",
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
    },
    stability: {
      name: "Dough Stability",
      definition:
        "Time during which the dough maintains optimal consistency during mixing. Measured with farinograph.",
      whyImportant:
        "Low stability (<5 min): degrades if overmixed. High (>10 min): tolerates operator errors.",
    },
    yeast: {
      name: "Yeast (Saccharomyces cerevisiae)",
      definition:
        "Single-celled fungus that converts sugars into CO\u2082 + ethanol + aromatic compounds.",
      whyImportant:
        "Optimal temp: 28-32\u00B0C. Min 4\u00B0C (dormant). Max 40\u00B0C (inhibited). Death >55\u00B0C.",
    },
    lab: {
      name: "LAB (Lactic Acid Bacteria)",
      definition:
        "Bacteria that ferment sugars producing lactic acid (and acetic acid). Present in sourdough starter.",
      whyImportant:
        "Lower pH (4.0-4.5), increase acidity, degrade FODMAP (fructans), inhibit moulds. Optimal temp: 28-32\u00B0C.",
    },
    q10: {
      name: "Q\u2081\u2080 (Temperature Coefficient)",
      definition:
        "Multiplicative factor of biochemical reaction rate for every 10\u00B0C increase.",
      whyImportant:
        "Fermentation doubles every +10\u00B0C. 24h at 18\u00B0C \u2248 12h at 28\u00B0C.",
    },
    arrhenius: {
      name: "Arrhenius Equation",
      definition:
        "Describes the dependence of reaction rate on absolute temperature.",
      whyImportant:
        "With \u03B2=0.075 and T_ref=18\u00B0C \u2192 Q\u2081\u2080 \u2248 2.12. Used in the Vulcan engine to calculate yeast dosage and timing.",
    },
    biga: {
      name: "Biga",
      definition:
        "Stiff pre-dough (44-50% hydration) with flour + water + yeast, fermented 16-24h at 16-18\u00B0C.",
      whyImportant:
        "Increases strength, extensibility, complex flavour, rustic irregular crumb, longer shelf life. Dosage: 20-40% of total flour.",
    },
    poolish: {
      name: "Poolish",
      definition:
        "Liquid pre-dough (100% hydration) with flour + water 1:1 + yeast, fermented 12-16h at 16-18\u00B0C.",
      whyImportant:
        "High extensibility, fine uniform crumb, sweet-tangy flavour, thin crispy crust. Poolish = extensibility; Biga = strength.",
    },
    autolysis: {
      name: "Autolysis",
      definition:
        "Rest of flour + water (without yeast/salt) for 20-60 min. Protease enzymes develop gluten spontaneously.",
      whyImportant:
        "Reduces mixing time -30-50%, increases extensibility, better hydration. 20-30 min for W<200, 45-60 min for W>280.",
    },
    bulk_fermentation: {
      name: "Bulk Fermentation",
      definition:
        "First fermentation phase after mixing, before dividing into dough balls. Dough rests as a single mass 30 min \u2013 4h.",
      whyImportant:
        "Gluten relaxation, fermentation start, flavour development, 20-50% volume increase.",
    },
    ball_fermentation: {
      name: "Ball Fermentation (Proofing)",
      definition:
        "Second fermentation phase after dividing into dough balls. Each ball rests individually 4-48h at 4-22\u00B0C.",
      whyImportant:
        "Main fermentation, proteolysis maturation, final volume development, pH stabilisation.",
    },
    maillard: {
      name: "Maillard Reaction",
      definition:
        "Non-enzymatic reaction between amino acids and reducing sugars at high temperature (>140\u00B0C).",
      whyImportant:
        "Golden crust (melanoidins), toasted aroma (pyrazines), leopard spotting at 300\u00B0C+. Optimal 160-180\u00B0C.",
    },
    caramelization: {
      name: "Caramelisation",
      definition:
        "Thermal degradation of sugars (without proteins) at high temperature (>150\u00B0C sucrose, >120\u00B0C fructose).",
      whyImportant:
        "Contributes to dark spots on crust. Less relevant than Maillard in pizza (few proteins on surface).",
    },
    starch_gelatinization: {
      name: "Starch Gelatinisation",
      definition:
        "Transition of starch from crystalline to gel state by absorbing water. Onset 55-60\u00B0C, peak 65-70\u00B0C, completion 80-85\u00B0C.",
      whyImportant:
        "Crumb: makes starch digestible (<55\u00B0C at core = raw starch). Crust: >100\u00B0C \u2192 crispy.",
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
    },
    fodmap: {
      name: "FODMAP",
      definition:
        "Fermentable Oligosaccharides, Disaccharides, Monosaccharides And Polyols. Short-chain fermentable carbohydrates (fructans 1-3% in wheat).",
      whyImportant:
        "Gut cannot digest fructans \u2192 bacteria ferment \u2192 gas/bloating. Long fermentation reduces: 24h\u219260-70%, 48h\u219280-85%.",
    },
    histamine: {
      name: "Histamine",
      definition:
        "Biogenic amine from histidine decarboxylation. Produced by LAB during fermentation, present in aged cheeses and cured meats.",
      whyImportant:
        "Linear accumulation with time. Sourdough 24h/28\u00B0C \u2192 30-50 mg/kg. DAO-deficient subjects: pseudo-allergic reaction. Solution: short fermentation (<12h) + commercial yeast.",
    },
    gluten: {
      name: "Gluten",
      definition:
        "Viscoelastic protein complex formed by gliadin (extensible) + glutenin (tenacious) in presence of water and mixing.",
      whyImportant:
        "Elasticity from glutenins (S-S bonds), viscosity from gliadins (H bonds). Long proteolysis cuts bonds \u2192 more extensible dough.",
    },
    proteolysis: {
      name: "Proteolysis",
      definition:
        "Degradation of proteins into peptides and amino acids by protease enzymes. Target: gluten.",
      whyImportant:
        "Easier stretching, increased digestibility, free amino acids \u2192 umami flavour. Excessive (>72h): dough too soft. Optimal: 24-48h.",
    },
    thickness_factor: {
      name: "Thickness Factor (TF)",
      definition:
        "Dough surface density \u2014 mass per unit area. Indicates how much dough there is per cm\u00B2.",
      whyImportant:
        "Determines baking time, crispness and caloric density. Original Vulcan Project metric.",
    },
    friction_factor: {
      name: "Friction Factor",
      definition:
        "Dough temperature increase (\u00B0C) per minute of mixing, due to mechanical friction.",
      whyImportant:
        "Mixing generates heat \u2192 raises temperature \u2192 fermentation too fast. Used in the Rule of 55.",
    },
    rule_of_55: {
      name: "Rule of 55",
      definition:
        "Empirical formula to calculate water temperature needed to reach target dough temperature.",
      whyImportant:
        "55 = empirical constant (varies 50-60 for different machines). \u0394T_friction = Friction Factor \u00D7 mixing time.",
    },
    a_score: {
      name: "A-Score (Authenticity)",
      definition:
        "0-100 score measuring adherence of a recipe to the target style\u2019s specification.",
      ranges: [
        { label: "90-100", value: "Rigorously authentic" },
        { label: "75-89", value: "Substantially authentic" },
        { label: "60-74", value: "Inspired by the style" },
        { label: "<60", value: "Significant deviation" },
      ],
    },
    f_score: {
      name: "F-Score (Feasibility)",
      definition:
        "0-100 score measuring practical achievability given equipment and user skill.",
      ranges: [
        { label: "90-100", value: "Highly feasible" },
        { label: "75-89", value: "Feasible with care" },
        { label: "60-74", value: "Difficult" },
        { label: "<60", value: "Not recommended" },
      ],
    },
    d_score: {
      name: "D-Score (Digestibility)",
      definition:
        "0-100 score estimating digestibility based on normalised fermentation hours and FODMAP reduction.",
      ranges: [
        { label: "85-100", value: "High (>48h equivalent)" },
        { label: "70-84", value: "Medium-high (24-48h)" },
        { label: "50-69", value: "Medium (12-24h)" },
        { label: "<50", value: "Low (<12h)" },
      ],
    },
  },
};